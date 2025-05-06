// lib/db/schema.ts
import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Users Table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  githubId: integer("github_id").unique().notNull(),
  username: text("username").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(unixepoch('subsec') * 1000)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).$onUpdate(
    () => new Date(),
  ),
});

// Sessions Table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

// --- Episode tables ---
export const topics = sqliteTable("topics", {
  id: text("id").primaryKey(),
  titleFa: text("titleFa").notNull().unique(),
  titleEn: text("titleEn").notNull().unique(),
});
export const episodes = sqliteTable("episodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  status: text("status", { enum: ["upcoming", "published", "archived"] })
    .default("upcoming")
    .notNull(),
  slug: text("slug").unique().notNull(),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  contentName: text("content_name").notNull(),
  resourcesUrl: text("resources_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(unixepoch('subsec') * 1000)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).$onUpdate(
    () => new Date(),
  ),

  topicId: text("topic_id").references(() => topics.id),

  // synced from repo
  audioUrl: text("audio_url"),
  titleEn: text("title_en"),
  titleFa: text("title_fa"),
  descriptionEn: text("description_en"),
  descriptionFa: text("description_fa"),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),

  // SEO/UI tbd
});

// ---Relationships ---
export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));
export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const episodeRelations = relations(episodes, ({ one }) => ({
  topic: one(topics, { fields: [episodes.topicId], references: [topics.id] }),
}));
export const topicRelations = relations(topics, ({ many }) => ({
  episodes: many(episodes),
}));

// Types for convenience
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;

export const dbSchema = {
  users,
  sessions,
  episodes,
  topics,
  userRelations,
  topicRelations,
  sessionRelations,
  episodeRelations,
};
