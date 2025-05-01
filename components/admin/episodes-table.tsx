"use client";
import { Episode } from "@/lib/db/schema";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { TZDate } from "@date-fns/tz";
import { DEFAULT_LOCALE, LOCALES, DEFAULT_TIMEZONE } from "@/lib/settings";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getLangDir } from "@/lib/utils";
interface EpisodesTableProps {
  allEpisodes: Episode[];
}

export default function EpisodesTable({ allEpisodes }: EpisodesTableProps) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const localizeDate = (date: Date) => {
    const tzDate = TZDate.tz(DEFAULT_TIMEZONE, date);
    return tzDate.toLocaleString(locale);
  };
  return (
    <>
      <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
        {LOCALES.map((l) => (
          <button
            className={cn(
              "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
            data-state={locale === l ? "active" : "inactive"}
            key={l}
            onClick={() => setLocale(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{`Scheduled At (${DEFAULT_TIMEZONE})`}</TableHead>
            <TableHead>Content Name</TableHead>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allEpisodes.map((episode) => (
            <TableRow key={episode.id}>
              <TableCell>{episode.id}</TableCell>
              <TableCell>{episode.status}</TableCell>

              <TableCell dir={getLangDir(locale)}>
                {episode.scheduledAt
                  ? localizeDate(episode.scheduledAt)
                  : "N/A"}
              </TableCell>
              <TableCell>{episode.contentName}</TableCell>

              <TableCell dir={getLangDir(locale)}>
                {locale === "fa" ? episode.titleFa : episode.titleEn}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
