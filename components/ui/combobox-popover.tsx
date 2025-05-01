"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ComboboxOption = {
  value: string;
  label: string;
};

interface ComboboxPopoverProps {
  options: ComboboxOption[];
  placeholder?: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
  onCreateRequest?: (searchQuery: string) => Promise<ComboboxOption>; // Parent handles creation
}

export function ComboboxPopover({
  options,
  placeholder = "+ Set status",
  selectedValue,
  onSelect,
  onCreateRequest,
}: ComboboxPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const newOption = await onCreateRequest(searchQuery);
      onSelect(newOption.value);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {selectedOption?.label || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="right" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create..."
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : `Create "${searchQuery}"`}
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={onSelect}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
