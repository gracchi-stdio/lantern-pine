import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/utils";
import Image from "next/image";

import { db } from "@/lib/db/drizzle";
import { desc } from "drizzle-orm";
import { Episode, episodes } from "@/lib/db/schema";
import Link from "next/link";

// Define the props type including params
type HomePageProps = {
  params: { lang: "fa" | "en" };
};

// Accept params in the function signature
export default async function Home({ params }: Readonly<HomePageProps>) {
  const { lang } = await params;
  const allEpisodes = await db.query.episodes.findMany({
    orderBy: [desc(episodes.createdAt)],
  });
  const dict = await getDictionary(lang);

  const upcomingEpisodes = allEpisodes.filter((ep) => ep.status === "upcoming");
  const recentEpisodes = allEpisodes.filter((ep) => ep.status === "published");
  const getEpisodeLink = (episode: Episode) => {
    return `/${lang}/episodes/${episode.id}/${episode.status}`;
  };
  return (
    <main className="container mx-auto px-4 py-8 space-y-12 max-w-7xl">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8 flex flex-col">
        <Image
          className="dark:invert mx-auto"
          src="/fanus-kaj.svg"
          alt="Fanus vs Kaj"
          width={200}
          height={40}
          priority
        />

        <p className="text-muted-foreground max-w-[600px] mx-auto">
          {dict.home.description}
        </p>
      </section>

      <div className="lg:flex flex-wrap space-x-4 space-y-4">
        {/* Upcoming Episodes Section */}
        {upcomingEpisodes.length > 0 && (
          <section className="space-y-4 flex-1">
            <h2 className="text-2xl font-bold">{dict.episodes.upcoming}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEpisodes.map((episode) => (
                <Link href={getEpisodeLink(episode)} key={episode.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {lang === "en" ? episode.titleEn : episode.titleFa}
                      </CardTitle>
                      <CardDescription>
                        {new Date(episode.createdAt).toLocaleDateString(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mt-4 line-clamp-3 min-h-[4.75rem]">
                        {lang === "en"
                          ? episode.descriptionEn
                          : episode.descriptionFa}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Episodes Section */}
        {recentEpisodes.length > 0 && (
          <section className="space-y-4 flex-1">
            <h2 className="text-2xl font-bold">{dict.episodes.published}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentEpisodes.slice(0, 3).map((episode) => (
                <Link href={getEpisodeLink(episode)} key={episode.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {lang === "en" ? episode.titleEn : episode.titleFa}
                      </CardTitle>
                      <CardDescription>
                        {new Date(episode.createdAt).toLocaleDateString(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 min-h-[4.75rem]">
                        {lang === "en"
                          ? episode.descriptionEn
                          : episode.descriptionFa}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
