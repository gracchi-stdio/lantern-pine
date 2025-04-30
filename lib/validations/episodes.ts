import { z } from "zod";

export const createEpisodeSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric or hyphens"),
  scheduledAt: z.date({
    required_error: "Scheduled date and time are required",
    invalid_type_error: "Invalid date format",
  }),
  resourcesUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  contentName: z
    .string()
    .min(1, "Content name is required")
    .regex(/^[a-zA-Z0-9_.-]+\.md$/, "Content name must be a valid MD filename"),
  topicId: z.string().optional(),
});
