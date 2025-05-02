import { PlayEpisode } from "@/components/play-episode";
import { getEpisodeById } from "@/lib/db/queries";
import { notFound } from "next/navigation";

interface EpisodePageProps {
  params: {
    lang: string;
    episodeId: string;
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { lang, episodeId } = params;
  const episode = await getEpisodeById(episodeId);
  if (!episode) {
    return notFound();
  }

  let description =
    lang === "en" ? episode.descriptionEn : episode.descriptionFa;
  if (!description) {
    description = "<p></p>";
  }
  return (
    <div className="container mx-auto max-w-7xl ">
      <h1>{lang === "en" ? episode.titleEn : episode.titleFa}</h1>
      <PlayEpisode episode={episode} />
      <div
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
    </div>
  );
}
