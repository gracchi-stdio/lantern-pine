import { PlayEpisode } from "@/components/play-episode";
import { getEpisodeById } from "@/lib/db/queries";
import { notFound } from "next/navigation";

interface EpisodePageProps {
  params: Promise<{
    lang: string;
    episodeId: string;
  }>;
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { lang, episodeId } = await params;
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
    <div className="container mx-auto prose">
      <section className="md:flex justify-between items-center">
        <h1>{lang === "en" ? episode.titleEn : episode.titleFa}</h1>
        <PlayEpisode episode={episode} />
      </section>
      <div
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
    </div>
  );
}
