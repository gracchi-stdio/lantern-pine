"use client";

import { TZDate } from "react-day-picker";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { addHours } from "date-fns";

interface CalendarEventButtonProps {
  title: string;
  descriptionHTML: string;
  startDate: string;
  children: React.ReactNode;
}
export function CalendarEventButton({
  title,
  descriptionHTML,
  startDate,
  children,
}: CalendarEventButtonProps) {
  const handleCreateEvent = () => {
    if (!startDate) return;
    // Parse the ISO string back into a Date object
    const startDateTime = TZDate.tz("Asia/Tehran", startDate);
    if (isNaN(startDateTime.getTime())) {
      console.error("Invalid startDate prop:", startDate);
      return; // Or handle the error appropriately
    }
    const event = {
      title,
      description: descriptionHTML,
      start: startDateTime, // Use the parsed Date object
      end: addHours(startDateTime, 2), // Use the parsed Date object
      timeZone: "Asia/Tehran",
    };
    const url = new URL("https://www.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", title);
    url.searchParams.set("details", descriptionHTML);
    url.searchParams.set(
      "dates",
      // Use the Date objects for toISOString
      `${event.start.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${event.end.toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
    );
    url.searchParams.set("ctz", event.timeZone);
    window.open(url.toString(), "_blank");
  };
  return (
    <Button variant="outline" className="gap-2" onClick={handleCreateEvent}>
      <CalendarIcon className="h-4 w-4" />
      {children}
    </Button>
  );
}
