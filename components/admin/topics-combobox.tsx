"use client";

import { NewTopic, Topic } from "@/lib/db/schema"; // Import NewTopic
import { ComboboxOption, ComboboxPopover } from "../ui/combobox-popover";
import { useState, useRef, useEffect } from "react"; // Import useRef, useEffect
import {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "../ui/responsive-modal";
import { Button } from "../ui/button";
import { createTopic } from "@/lib/actions/episodes"; // Import the server action
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { ValidationError } from "next/dist/compiled/amphtml-validator";

interface TopicsComboboxProps {
  value: string;
  topics: Topic[];
  locale: "fa" | "en";
  onChange: (value: string) => void;
}

type ValidationErrors = {
  titleEn?: [];
  titleFa?: [];
};

export default function TopicsCombobox({
  locale,
  topics,
  value,
  onChange,
}: TopicsComboboxProps) {
  const [updatableTopics, setUpdatableTopics] = useState<Topic[]>(topics);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInput, setCreateInput] = useState({
    titleEn: "",
    titleFa: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<ValidationErrors>({});
  // Store promise resolution callbacks
  const creationPromiseRef = useRef<{
    resolve: (option: ComboboxOption) => void;
    reject: (reason?: unknown) => void; // Allow rejection reason
  } | null>(null);

  // Update local topics if the initial prop changes
  useEffect(() => {
    setUpdatableTopics(topics);
  }, [topics]);

  const options: ComboboxOption[] = updatableTopics.map((topic) => ({
    value: topic.id,
    label: locale === "en" ? topic.titleEn : topic.titleFa,
  }));

  const handleCreateRequest = async (searchQuery: string) => {
    // Reset state for new creation attempt
    setCreateInput({
      titleEn: locale === "en" ? searchQuery : "",
      titleFa: locale === "fa" ? searchQuery : "",
    });
    setCreateError(null); // Clear previous errors
    setIsCreating(false);
    setIsCreateModalOpen(true);

    // Return a promise that will be settled by the modal interaction
    return new Promise<ComboboxOption>((resolve, reject) => {
      creationPromiseRef.current = { resolve, reject };
    });
  };

  const handleCreateConfirm = async () => {
    setIsCreating(true);
    setCreateError(null);
    const formData = new FormData();
    formData.append("titleEn", createInput.titleEn);
    formData.append("titleFa", createInput.titleFa);

    try {
      // Call the Server Action
      const result = await createTopic(null, formData);

      if (result && typeof result === "object" && "id" in result) {
        // Action Succeeded! returned the new Topic object
        const newTopic = result as NewTopic; // Type assertion
        setUpdatableTopics((prev) => [...prev, newTopic]); // Update local list
        onChange(newTopic.id); // Update parent's selected value

        // Resolve the promise for ComboboxPopover
        const newOption = {
          value: newTopic.id,
          label: locale === "en" ? newTopic.titleEn : newTopic.titleFa,
        };
        creationPromiseRef.current?.resolve(newOption);

        setIsCreating(false);
        setIsCreateModalOpen(false);
      } else if (
        result &&
        typeof result === "object" &&
        ("message" in result || "errors" in result)
      ) {
        // Action returned an error message/object
        const errorResult = result as { message?: string; errors?: unknown };
        console.error(
          "Failed to create topic:",
          errorResult.message,
          errorResult.errors,
        );

        setValidationError(errorResult.errors as ValidationError);
        setIsCreating(false);
        // Do not reject the promise here, let the user correct input and retry
        // Do not close the modal
      } else {
        throw new Error("Unexpected response from createTopic action");
      }
    } catch (error) {
      console.error("Error calling createTopic action:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setCreateError(errorMessage);
      setIsCreating(false);
      // Reject the promise on unexpected errors
      creationPromiseRef.current?.reject(error);
      // Consider closing the modal or showing error differently
    } finally {
      setIsCreating(false); // Clear loading state
      // Clear the ref only if modal is intended to close or promise settled
      if (!isCreateModalOpen || !(createError && !isCreating)) {
        creationPromiseRef.current = null;
      }
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open);
    setCreateInput({
      titleEn: "",
      titleFa: "",
    });
    if (!open) {
      // If modal is closed without confirmation, reject the promise
      creationPromiseRef.current?.reject(new Error("Creation canceled"));
      setIsCreating(false);
      creationPromiseRef.current = null; // Clear the ref
    }
  };

  return (
    <>
      <ComboboxPopover
        placeholder="Select a topic..."
        options={options}
        selectedValue={value} // Use controlled value from props
        onSelect={onChange} // Use onChange from props
        onCreateRequest={handleCreateRequest}
      />

      <ResponsiveModal
        open={isCreateModalOpen}
        onOpenChange={handleModalOpenChange} // Use the handler
      >
        <ResponsiveModalContent side="bottom">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Create New Topic</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Please provide both English and Farsi labels.
            </ResponsiveModalDescription>
            {createError && ( // Display creation errors
              <p className="text-sm text-red-600 dark:text-red-400">
                {createError}
              </p>
            )}
          </ResponsiveModalHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                className={cn({ "text-red-500": !!validationError.titleEn })}
                htmlFor="titleEn"
              >
                English Title
              </Label>
              <Input
                id="titleEn"
                className={cn(
                  { "border-red-500": !!validationError.titleEn },
                  "col-span-3",
                )}
                value={createInput.titleEn}
                onChange={(e) =>
                  setCreateInput((prev) => ({
                    ...prev,
                    titleEn: e.target.value,
                  }))
                }
                disabled={isCreating}
              />
              {!!validationError.titleEn && (
                <span className="text-red-500 text-sm col-span-3 col-start-2">
                  {validationError.titleEn.join(". ")}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                className={cn({ "text-red-500": !!validationError.titleFa })}
                htmlFor="titleFa"
              >
                Farsi Title
              </Label>
              <Input
                id="titleFa"
                className={cn(
                  { "border-red-500": !!validationError.titleFa },
                  "col-span-3",
                )}
                value={createInput.titleFa}
                onChange={(e) =>
                  setCreateInput((prev) => ({
                    ...prev,
                    titleFa: e.target.value,
                  }))
                }
                dir="rtl"
                disabled={isCreating}
              />
              {!!validationError.titleFa && (
                <span className="text-red-500 text-sm col-span-3 col-start-2">
                  {validationError.titleFa.join(". ")}
                </span>
              )}
            </div>
          </div>

          <ResponsiveModalFooter>
            {/* Rely on onOpenChange for cancel */}
            <ResponsiveModalClose asChild>
              <Button variant="outline" disabled={isCreating}>
                Cancel
              </Button>
            </ResponsiveModalClose>
            <Button onClick={handleCreateConfirm} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
