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
import { createEpisodeSchema } from "@/lib/validations/episodes";
import { Separator } from "../ui/separator";
import { TipTapEditor } from "../admin/tiptap-editor";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import TopicsCombobox from "./topics-combobox";
import { Topic } from "@/lib/db/schema";
import { useEffect } from "react";
type Locale = "fa" | "en";
import {
  DEFAULT_LOCALE,
  LOCALES,
  DEFAULT_TIMEZONE,
  timezones,
} from "@/lib/settings";
import { TZDate } from "react-day-picker";
import { ComboboxPopover } from "../ui/combobox-popover";

type CreateEpisodeFormProps = {
  topics: Topic[];
  action: (
    prevState: unknown, // Use unknown instead of any
    formData: FormData,
  ) => Promise<{
    errors?: Record<string, string[] | undefined>;
    message?: string;
  } | void>; // Specify error type
};

// Helper function to generate a slug
const generateSlug = (title: string): string => {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

export function CreateEpisodeForm({ topics, action }: CreateEpisodeFormProps) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [tz, setTz] = useState<string>(DEFAULT_TIMEZONE);
  const form = useForm<z.infer<typeof createEpisodeSchema>>({
    resolver: zodResolver(createEpisodeSchema),
    defaultValues: {
      slug: "",
      resourcesUrl: "",
      contentName: "",
      topicId: "",
      // Add default values for new fields
      titleFa: "",
      descriptionFa: "",
      titleEn: "",
      descriptionEn: "",
    },
  });

  // Watch titleEn and update slug
  const titleEnValue = form.watch("titleEn");

  useEffect(() => {
    const slug = generateSlug(titleEnValue);
    form.setValue("slug", slug);
  }, [titleEnValue, form]); // Depend on titleEnValue and form

  const onSubmit = async (values: z.infer<typeof createEpisodeSchema>) => {
    const formData = new FormData();
    const fields = [
      { key: "slug", value: values.slug },
      {
        key: "scheduledAt",
        value: TZDate.tz(tz, values.scheduledAt).toISOString(),
      },
      { key: "resourcesUrl", value: values.resourcesUrl, optional: true },
      { key: "contentName", value: values.contentName },
      { key: "topicId", value: values.topicId, optional: true },
      { key: "titleEn", value: values.titleEn },
      { key: "descriptionEn", value: values.descriptionEn, optional: true },
      { key: "titleFa", value: values.titleFa },
      { key: "descriptionFa", value: values.descriptionFa, optional: true },
    ];

    for (const { key, value, optional } of fields) {
      // Append all fields unless they are optional AND empty
      if (!optional || (optional && value)) {
        formData.append(key, value as string);
      }
    }

    const result = await action(undefined, formData);

    if (result?.errors) {
      console.error("Server side errors:", result.errors);
      const errors = result.errors;
      Object.keys(errors).forEach((fieldName) => {
        // Skip setting error and focusing for description fields to avoid the TypeError
        if (fieldName === "descriptionEn" || fieldName === "descriptionFa") {
          console.warn(
            `Skipping form.setError for ${fieldName} to avoid focus issue.`,
          );
          return;
        }

        const message = errors[fieldName]?.[0];
        if (message) {
          form.setError(
            fieldName as keyof z.infer<typeof createEpisodeSchema>,
            {
              message: message || "",
            },
          );
        }
      });
    } else if (result?.message) {
      console.error("Server message:", result.message);
    }
  };

  return (
    <>
      <ComboboxPopover
        onSelect={setTz}
        placeholder={tz}
        options={timezones.map((timezone) => ({
          value: timezone,
          label: timezone,
        }))}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <div className="flex-grow overflow-y-auto px-2 space-y-8">
            {/* Language tabs */}
            <Tabs
              defaultValue={locale}
              onValueChange={(e) => setLocale(e as Locale)}
            >
              <TabsList className="mb-4">
                {LOCALES.map((locale) => (
                  <TabsTrigger key={locale} value={locale}>
                    {locale.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent className="space-y-4" value="en">
                {/* English Title */}
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. A New Session on Capital"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        English title of the episode and required.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* English Description */}
                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English Description</FormLabel>
                      <FormControl>
                        <TipTapEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional English description of the episode.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="fa">
                {/* Farsi Title */}
                <FormField
                  control={form.control}
                  name="titleFa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farsi Title</FormLabel>
                      <FormControl>
                        <Input
                          dir="rtl"
                          placeholder="نشت چهارم در مورد کتاب سرمایه"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Farsi title of the episode and required.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Farsi Description */}
                <FormField
                  control={form.control}
                  name="descriptionFa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farsi Description</FormLabel>
                      <FormControl>
                        <TipTapEditor
                          dir="rtl"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional Farsi description of the episode.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Select Topics */}
            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topics</FormLabel>
                  <FormControl>
                    <TopicsCombobox
                      topics={topics}
                      locale={locale}
                      onChange={field.onChange}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Select topics related to the episode.
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
              name="resourcesUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resources URL</FormLabel>
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
                    The expected filename for the MD file in the content
                    repository (e.g., including date and slug).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Unique identifier for the episode URL (lowercase,
                    alphanumeric, hyphens).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="sticky bottom-0 bg-background h-20 flex flex-col space-y-4 items-end mt-4">
            <Separator />
            <Button
              className=""
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
