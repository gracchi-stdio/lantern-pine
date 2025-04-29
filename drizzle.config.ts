// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { env } from "./env.mjs"; // Import your env schema

// Define base credentials
const dbCredentials: { url: string; authToken?: string } = {
  url: env.DATABASE_URL,
};

// Conditionally add authToken if it exists (for Turso)
if (env.DATABASE_AUTH_TOKEN) {
  dbCredentials.authToken = env.DATABASE_AUTH_TOKEN;
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials, // Use the conditionally built credentials object
  verbose: true,
  strict: true,
});
