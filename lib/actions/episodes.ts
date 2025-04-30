"use server";

import { z } from "zod";
import { getCurrentSession } from "../db/session";

import { settings } from "../utils";
import { episodes, NewEpisode } from "../db/schema";
import { revalidatePath } from "next/cache";
import { db } from "../db/drizzle";
import { redirect } from "next/navigation";
import { createEpisodeSchema as baseEpisodeSchema } from "../validations/episodes";

const createEpisodeSchema = baseEpisodeSchema.extend({
  slug: z.string().transform((slug) => slug.toLowerCase()),
  topicId: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : null))
    .nullable(),
});

export async function createEpisode(
  prevState: unknown,
  formData: FormData,
): Promise<{
  errors?: Record<string, string[] | undefined>;
  message?: string;
} | void> {
  // --- Authenticate ---
  const { user } = await getCurrentSession();
  if (!user || !settings.admin.githubUsers.includes(user?.username)) {
    return { message: "unauthorized" };
  }

  const rawFormData = {
    slug: formData.get("slug"),
    scheduledAt: formData.get("scheduledAt"), // Corrected key
    resourcesUrl: formData.get("resourcesUrl") || "", // Corrected key
    contentName: formData.get("contentName"),
    topicId: formData.get("topicId"),
  };

  const parsedData = {
    ...rawFormData,
    scheduledAt: rawFormData.scheduledAt
      ? new Date(rawFormData.scheduledAt as string)
      : undefined, // Zod expects Date object
  };

  // --- validate data ---
  const validatedFields = createEpisodeSchema.safeParse(parsedData);
  if (!validatedFields.success || !validatedFields?.data) {
    console.error(
      "Validation Errors",
      validatedFields.error.flatten().fieldErrors,
    );
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const { slug, scheduledAt, resourcesUrl, contentName, topicId } =
    validatedFields.data;

  // --- prepare the new Episode ---
  const newEpisode: NewEpisode = {
    slug,
    scheduledAt,
    resourcesUrl,
    contentName,
    topicId,
    status: "upcoming",
  };

  // --- DB transactions ---
  try {
    await db.insert(episodes).values(newEpisode);
  } catch (error) {
    console.error("Database Error: ", error);
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return {
        message:
          "Failed to create episode: slug '" + slug + "' already exists.",
      };
    }
    // Ensure a string message is returned for generic errors
    return {
      message:
        error instanceof Error
          ? error.message
          : "An unknown database error occurred",
    };
  }

  revalidatePath("/admin");
  return redirect("/admin");
}
