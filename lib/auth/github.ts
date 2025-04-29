// lib/auth/github.ts
import { GitHub } from "arctic";
import { env } from "@/env.mjs"; // Assuming root level env.mjs, adjust if placed elsewhere (e.g. "@/src/env.mjs")

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  null,
);
