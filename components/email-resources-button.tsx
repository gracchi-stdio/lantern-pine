"use client";
import { Dictionary } from "@/lib/utils";
import { Button } from "./ui/button";
import { emailEpisodeResource } from "@/lib/actions";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalHeader,
  ResponsiveModalContent,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useFormStatus } from "react-dom"; // Import useFormStatus
import { getEmailResourceFormSchema } from "@/lib/validations/frontend";

// Internal component for the Submit Button using useFormStatus
function SubmitButton({ dict }: { dict: Dictionary }) {
  const { pending } = useFormStatus(); // Get pending state from the form

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? dict?.common.loading || "Sending..."
        : dict.episodes?.send_link || "Send Link"}
    </Button>
  );
}

export default function EmailResourcesButton({
  link,
  dict,
}: {
  link: string;
  dict: Dictionary;
}) {
  // State for success message and server-side errors
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamically create schema with dict
  const formSchema = getEmailResourceFormSchema(dict);

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission - now simpler, no need to manage isLoading manually
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null); // Reset errors on new submission
    setIsSuccess(false); // Reset success state

    // Create FormData object
    const formData = new FormData();
    formData.append("email", values.email);

    try {
      // Call the server action
      // The pending state will be handled by useFormStatus in the SubmitButton
      const result = await emailEpisodeResource(link, dict, formData);

      console.log(result);
      if (result?.errors) {
        if (typeof result.errors === "string") {
          setError(result.errors);
        } else if (result.errors?.email) {
          // Set error using react-hook-form's setError
          form.setError("email", {
            type: "server",
            message: result.errors?.email.join(", "),
          });
        } else {
          setError(
            dict?.errors.generic_error || "An unexpected error occurred.",
          );
        }
      } else {
        setIsSuccess(true);
        form.reset(); // Reset form on success
        // Close modal after delay? Example: setTimeout(() => setOpen(false), 2000);
        // You would need useState for modal open state if you want to control it like this.
      }
    } catch (e) {
      console.error("Submission error:", e);
      setError(dict?.errors.generic_error || "An unexpected error occurred.");
    }
    // No need to set isLoading(false) here anymore
  }

  return (
    // You might need state for controlling the modal's open/closed status
    // if you want to close it programmatically on success.
    // Example: const [open, setOpen] = useState(false);
    // <ResponsiveModal open={open} onOpenChange={setOpen}>
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button variant="outline">{dict.episodes.remind_me}</Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent side="top">
        <Form {...form}>
          {/* We pass the server action directly to the form's action prop */}
          {/* However, react-hook-form's onSubmit is usually preferred for client-side validation */}
          {/* So we keep form.handleSubmit(onSubmit) */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>
                {dict.episodes?.email_resource_title || "Get Resource Link"}
              </ResponsiveModalTitle>
              <ResponsiveModalDescription>
                {dict.episodes?.email_resource_desc ||
                  "Enter your email below, and we'll send you the link."}
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="px-6 pt-2">
                  {/* Added top padding */}
                  <FormLabel>
                    {dict.episodes?.email_label || "Email Address"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        dict.episodes?.email_placeholder || "your@email.com"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {dict.episodes?.email_resource_hint ||
                      "We'll send the link to this address."}
                  </FormDescription>
                  {/* react-hook-form's FormMessage handles client and server field errors */}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display General Server Error (non-field specific) */}
            {error && (
              <p className="text-sm font-medium text-destructive px-6">
                {error}
              </p>
            )}

            {/* Display Success Message */}
            {isSuccess && (
              <p className="text-sm font-medium text-green-600 px-6">
                {dict.episodes?.email_success || "Email sent successfully!"}
              </p>
            )}

            <ResponsiveModalFooter>
              {/* Use the dedicated SubmitButton component */}
              <SubmitButton dict={dict} />
            </ResponsiveModalFooter>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
