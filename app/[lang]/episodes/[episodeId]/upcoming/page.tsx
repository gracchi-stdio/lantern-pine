import { notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TZDate } from "@date-fns/tz";
import { getDictionary } from "@/lib/utils";
import { getEpisodeById } from "@/lib/db/queries";
import { CalendarIcon } from "lucide-react";

type Props = {
  params: Promise<{
    lang: "en" | "fa";
    episodeId: string;
  }>;
};

export default async function UpcomingEpisodePage({ params }: Props) {
  const { episodeId, lang } = await params;
  const episode = await getEpisodeById(episodeId);
  const dict = await getDictionary(lang);

  if (!episode || episode.status !== "upcoming") {
    return notFound();
  }

  const localizedTitle = lang === "fa" ? episode.titleFa : episode.titleEn;
  const localizedDescription =
    lang === "fa" ? episode.descriptionFa : episode.descriptionEn;

  // const handleCreateEvent = () => {
  //   const event = {
  //     title: localizedTitle,
  //     description: localizedDescription,
  //     start: episode.scheduledAt,
  //     end: new Date(episode.scheduledAt.getTime() + 60 * 60 * 1000), // 1 hour later
  //     timeZone: "Asia/Tehran",
  //   };
  //   const url = new URL("https://www.google.com/calendar/render");
  //   url.searchParams.set("action", "TEMPLATE");
  //   url.searchParams.set("text", event.title);
  //   url.searchParams.set("details", event.description);
  //   url.searchParams.set(
  //     "dates",
  //     `${event.start.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${event.end.toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
  //   );
  //   url.searchParams.set("ctz", event.timeZone);
  //   window.open(url.toString(), "_blank");
  // };
  return (
    <div className="container mx-auto px-4 py-8 h-full">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{localizedTitle}</CardTitle>
          <CardDescription className="text-lg">
            <div
              dangerouslySetInnerHTML={{ __html: localizedDescription }}
            ></div>
          </CardDescription>
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
                )}
              </p>
            </div>
          ) : null}

          <div className="flex gap-4 mt-6">
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dict.episodes.add_to_calendar}
            </Button>
            <Button variant="secondary">{dict.episodes.remind_me}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
