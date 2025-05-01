// env.mjs

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    DATABASE_URL: z.string().url().min(1), // Required database connection URL
    DATABASE_AUTH_TOKEN: z.string().min(1).optional(),
    GITHUB_CONTENT_WEBHOOK_SECRET: z.string().min(1),
    GITHUB_CONTENT_REPO_PAT: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    // Add client-side variables here, prefixed with NEXT_PUBLIC_
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   *
   * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
   */
  runtimeEnv: {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL, // Map DATABASE_URL
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    GITHUB_CONTENT_WEBHOOK_SECRET: process.env.GITHUB_CONTENT_WEBHOOK_SECRET,
    GITHUB_CONTENT_REPO_PAT: process.env.GITHUB_CONTENT_REPO_PAT,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,

    // Map other variables from process.env here
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION=true` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
