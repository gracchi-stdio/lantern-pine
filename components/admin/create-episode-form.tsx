// components/admin/create-episode-form.tsx
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { createEpisodeSchema } from "@/lib/validations/episodes";

type CreateEpisodeFormProps = {
  topics: { id: number; title: string }[];
  action: (
    prevState: unknown, // Use unknown instead of any
    formData: FormData,
  ) => Promise<{
    errors?: Record<string, string[] | undefined>;
    message?: string;
  } | void>; // Specify error type
};

export function CreateEpisodeForm({ topics, action }: CreateEpisodeFormProps) {
  const form = useForm<z.infer<typeof createEpisodeSchema>>({
    resolver: zodResolver(createEpisodeSchema),
    defaultValues: {
      slug: "",
      resourcesUrl: "",
      contentName: "",
      topicId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof createEpisodeSchema>) => {
    const formData = new FormData();
    formData.append("slug", values.slug);
    formData.append("scheduledAt", values.scheduledAt.toISOString());
    if (values.resourcesUrl)
      formData.append("resourcesUrl", values.resourcesUrl); // Include resourcesUrl
    formData.append("contentName", values.contentName);
    if (values.topicId) formData.append("topicId", values.topicId);

    const result = await action(undefined, formData);

    if (result?.errors) {
      console.error("Server side errors:", result.errors);
      const errors = result.errors; // Assign to a variable after the check
      Object.keys(errors).forEach((fieldName) => {
        // Use the new variable 'errors' which is guaranteed to be defined here
        const message = errors[fieldName]?.[0]; // Safely access the first error message
        if (message) {
          // Only set error if a message exists
          form.setError(
            fieldName as keyof z.infer<typeof createEpisodeSchema>,
            {
              message: message || "", // Provide fallback to satisfy TS
            },
          );
        }
      });
    } else if (result?.message) {
      console.error("Server message:", result.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-h-full overflow-y-auto"
      >
        {/* Slug Field */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="e.g., my-first-episode" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier for the episode URL (lowercase, alphanumeric,
                hyphens).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Scheduled Date and Time Field */}
        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scheduled Date and Time</FormLabel>
              <DateTimePicker hourCycle={12} {...field} />

              <FormDescription>
                The date and time the episode recording/session is scheduled
                for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resources URL Field (was Signature Reading URL) */}
        <FormField
          control={form.control}
          name="resourcesUrl" // Uses resourcesUrl
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resources URL</FormLabel> {/* Updated Label */}
              <FormControl>
                <Input
                  placeholder="https://example.com/resources.pdf"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional link to resources for the session.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content Name Field (for the future MD? file) */}
        <FormField
          control={form.control}
          name="contentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MD Content File Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 2024-08-15-my-episode.md"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The expected filename for the MD file in the content repository
                (e.g., including date and slug).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Topic Select Field */}
        <FormField
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {topics.length === 0 && (
                    <SelectGroup>
                      <SelectLabel>No Topic Yet</SelectLabel>
                    </SelectGroup>
                  )}
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id.toString()}>
                      {topic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Optionally associate the episode with a topic.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className=""
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Creating..."
            : "Create Upcoming Episode"}
        </Button>
      </form>
    </Form>
  );
}
