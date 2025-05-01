import { env } from "@/env.mjs";
import { Octokit } from "@octokit/rest";
import { headers } from "next/headers";
import * as crypto from "crypto";
import { NextResponse } from "next/server";
import { settings } from "@/lib/utils";
import matter from "gray-matter";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import { episodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";

type RequestEx = Request & { rawBody: string };

const octokit = new Octokit({
  auth: env.GITHUB_CONTENT_REPO_PAT,
});

const frontmatterSchema = z
  .object({
    titleEn: z
      .string({ required_error: "Frontmatter must include titleEn" })
      .min(1, "titleEn cannot be empty"),
    titleFa: z
      .string({ required_error: "Frontmatter must include titleFa" })
      .min(1, "titleFa cannot be empty"),

    audioUrl: z
      .string({ required_error: "Frontmatter must include audioUrl" })
      .url("audioUrl must be a valid URL"),
    // Require publishedAt, accept common date strings and coerce to Date
    publishedAt: z.coerce.date({
      required_error: "Frontmatter must include publishedAt",
      invalid_type_error: "publishedAt must be a valid date string",
    }),
  })
  .passthrough(); // Use passthrough() if you might have other fields you don't need to validate strictly here

async function verifySignature(req: Request, secret: string): Promise<boolean> {
  if (!secret) {
    console.error("Webhook secret is not configured.");
    return false;
  }

  const signature = (await headers()).get("X-Hub-Signature-256");
  if (!signature) {
    console.warn("Webhook signature header missing.");
    return false;
  }

  const body = await req.text();

  const [method, githubSignature] = signature.split("=");
  if (method !== "sha256" || !githubSignature) {
    console.warn("Invalid webhook signature format.");
    return false;
  }

  // Compute expected HMAC SHA256 signature using secret and request body
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(githubSignature, "utf8"),
    Buffer.from(expectedSignature, "utf8"),
  );

  if (!signaturesMatch) {
    console.warn("Webhook signature mismatch.");
  }

  // Restore the body so it can be read again by request.json()
  // This requires cloning the request if the body has already been read by req.text()
  // A simpler approach is to re-parse from the text body after verification.
  // Let's re-parse the JSON from the text body below.
  (req as RequestEx).rawBody = body; // Store text body for later JSON parsing

  return signaturesMatch;
}

export async function POST(req: Request) {
  const signatureIsValid = await verifySignature(
    req,
    env.GITHUB_CONTENT_WEBHOOK_SECRET,
  );
  if (!signatureIsValid) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse((req as RequestEx).rawBody);
    if ((await headers()).get("X-GitHub-Event") !== "push") {
      console.log("Receiving non push event, ignoring.");
      return NextResponse.json(
        { message: "Ignoring non-push event" },
        { status: 200 },
      );
    }
    if (!payload.ref.endsWith("/main")) {
      console.log(`Push not to main branch (${payload.ref}), ignoring.`);
      return NextResponse.json(
        { message: "Ignoring push to non-main branch" },
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    console.error("Failed to parse webhook payload:", error);
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const mdFilesToProcess: { filename: string; status: "added" | "modified" }[] =
    [];
  const [contentRepooOwner, contentRepoName] = settings.contentRepo.split("/");

  // filePath
  for (const commit of payload.commits) {
    const addedFiles = commit.added ?? [];
    const modifiedFiles = commit.modified ?? [];
    const changedFiles = [...addedFiles, ...modifiedFiles];
    for (const filePath of changedFiles) {
      console.log(`Founded File with path:`, filePath);
      if (filePath.endsWith(".md") && filePath.startsWith("episodes/")) {
        mdFilesToProcess.push({
          filename: filePath.split("/").pop()!,
          status: commit.added.includes(filePath) ? "added" : "modified",
        });
      }
    }
  }

  const uniqueMdFiles = Array.from(
    new Set(mdFilesToProcess.map((f) => f.filename)),
  ) // Renamed variable
    .map((filename) => mdFilesToProcess.find((f) => f.filename === filename)!);

  console.log(
    `Found ${uniqueMdFiles.length} relevant Markdown files to process.`,
  );

  for (const fileInfo of uniqueMdFiles) {
    const fullFilePath = `episodes/${fileInfo.filename}`;

    try {
      const fileResponse = await octokit.repos.getContent({
        owner: contentRepooOwner!,
        repo: contentRepoName!,
        path: fullFilePath,
        ref: payload.after,
      });

      if (
        Array.isArray(fileResponse.data) ||
        fileResponse.data.type !== "file"
      ) {
        console.warn(
          `Skippting ${fullFilePath}: Not a file or unexpected response.`,
        );
        continue;
      }

      // --- Markdown parsing ---
      const fileContent = Buffer.from(
        fileResponse.data.content,
        "base64",
      ).toString();
      const { data: rawFrontmatter, content: markdownBody } =
        matter(fileContent);

      const validatedFrontmatter = frontmatterSchema.safeParse(rawFrontmatter);

      if (!validatedFrontmatter.success) {
        console.warn(
          `Skipping ${fullFilePath}: Invalid frontmatter. Error:`,
          JSON.stringify(validatedFrontmatter.error.flatten(), null, 2),
        );
        continue;
      }

      const frontmatter = validatedFrontmatter.data;

      console.log("frontmatter", frontmatter);

      // Split markdown content by ':::fa:::'
      const parts = markdownBody.split(":::fa:::");
      const markdownEn = parts[0] || "";
      const markdownFa = parts[1] || "";

      const descriptionHtmlEn = (
        await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype)
          .use(rehypeStringify)
          .process(markdownEn)
      ).toString();

      const descriptionHtmlFa = (
        await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype)
          .use(rehypeStringify)
          .process(markdownFa)
      ).toString();

      const episodeInDb = await db
        .select()
        .from(episodes)
        .where(eq(episodes.contentName, fileInfo.filename))
        .limit(1);

      const [existingEpisode] = episodeInDb;

      if (!existingEpisode) {
        console.warn(
          `No matching episode found in DB for contentName: ${fileInfo.filename}.`,
        );
        continue;
      }

      console.log(
        `Syncing data for episode ${existingEpisode.slug} from ${fileInfo.filename}.`,
      );

      // --- Updating Database ---
      await db
        .update(episodes)
        .set({
          status: "published",
          titleEn: frontmatter.titleEn,
          titleFa: frontmatter.titleFa,
          descriptionEn: descriptionHtmlEn, // Use rendered HTML
          descriptionFa: descriptionHtmlFa, // Use rendered HTML
          audioUrl: frontmatter.audioUrl,
          publishedAt: frontmatter.publishedAt,
          // lastSyncedAt: new Date(), // If you added this field
        })
        .where(eq(episodes.id, existingEpisode.id));

      console.log(
        `Successfully updated episodes ${existingEpisode.slug} to published.`,
      );

      // Revalidate
      revalidatePath("/");
      revalidatePath("/episodes");
      revalidatePath(`/episodes/${existingEpisode.slug}`);
      revalidatePath(`/en/episodes/${existingEpisode.slug}`);
      revalidatePath(`/fa/episodes/${existingEpisode.slug}`);
    } catch (error) {
      console.error(`Error processing file ${fullFilePath}:`, error);
    }
  }
  return NextResponse.json(
    { message: "Sync process initiated" },
    { status: 200 },
  );
}
