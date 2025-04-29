import { github } from "@/lib/auth/github";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/db/session";
import { settings } from "@/lib/utils";
import { OAuth2Tokens } from "arctic";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(request: Request): Promise<Response> {
  // --- Get Cookies and State ---
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storeState = cookieStore.get("github_oauth_state")?.value ?? null;

  // --- Validate Cookies ---
  if (!code || !state || !storeState) {
    return new Response("Invalid request", { status: 400 });
  }

  if (state !== storeState) {
    return new Response("Invalid state", { status: 400 });
  }

  let token: OAuth2Tokens;
  try {
    token = await github.validateAuthorizationCode(code);
  } catch (error) {
    console.error(error);
    return new Response("Failed to validate authorization code", {
      status: 400,
    });
  }

  // --- Retrieve User ---
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.accessToken()}`,
    },
  });
  const githubUser = await githubUserResponse.json();
  const githubUserId = githubUser.id;
  const githubUserName = githubUser.login;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubUserId))
    .get();

  // --- If user exists then create session ---
  if (existingUser) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: settings.admin.dashboard,
      },
    });
  }

  // --- Create a new user if does not exist ---
  const newUser = await db
    .insert(users)
    .values({
      githubId: githubUserId,
      username: githubUserName,
    })
    .returning()
    .get();

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, newUser.id);
  await setSessionTokenCookie(sessionToken, session.expiresAt);
  return new Response(null, {
    status: 302,
    headers: {
      Location: settings.admin.dashboard,
    },
  });
}
