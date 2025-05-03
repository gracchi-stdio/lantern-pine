import { notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { TZDate } from "@date-fns/tz";
import { getDictionary, getLocalizedField } from "@/lib/utils";
import { getEpisodeById } from "@/lib/db/queries";

import { CalendarEventButton } from "@/components/calendar-event-button";
type Props = {
  params: Promise<{
    lang: "en" | "fa";
    episodeId: string;
  }>;
};

export default async function UpcomingEpisodePage({ params }: Props) {
  const { episodeId, lang } = await params;

  // --- Get episodes ---
  const episode = await getEpisodeById(episodeId);
  if (!episode || episode.status !== "upcoming") {
    return notFound();
  }

  const dict = await getDictionary(lang);
  const title = (getLocalizedField(episode, "title", lang) as string) || "";
  const descriptionHTML =
    (getLocalizedField(episode, "title", lang) as string) || "";

  const localizedDate = (
    date: Date | null,
    tz: string = "Asia/Tehran",
  ): TZDate | null => (date ? TZDate.tz(tz, date) : null);

  return (
    <div className="container mx-auto px-4 py-8 h-full">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          {descriptionHTML.length > 0 && (
            <CardDescription className="text-lg">
              <div dangerouslySetInnerHTML={{ __html: descriptionHTML }}></div>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {episode.scheduledAt ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">
                {dict.episodes.scheduled_time}
              </h3>
              <p className="text-lg">
                {TZDate.tz("Asia/Tehran", episode.scheduledAt).toLocaleString(
                  lang,
                  {
                    dateStyle: "full",
                    timeStyle: "short",
                  },
                )}{" "}
                {dict.time.tehran_time}
              </p>
            </div>
          ) : null}

          <div className="flex gap-4 mt-6">
            <CalendarEventButton
              title={title}
              descriptionHTML={descriptionHTML}
              startDate={localizedDate(episode.scheduledAt)?.toString() || ""}
            >
              {dict.episodes.add_to_calendar}
            </CalendarEventButton>

            {/* <Button variant="secondary">{dict.episodes.remind_me}</Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
