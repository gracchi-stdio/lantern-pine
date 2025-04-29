import { env } from "@/env.mjs";
import { drizzle } from "drizzle-orm/libsql";
import { dbSchema } from "./schema";
import { createClient } from "@libsql/client";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});
export const db = drizzle(client, { schema: dbSchema });
