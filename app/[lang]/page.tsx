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
import { buttonVariants } from "@/components/ui/button";

// Define the props type including params
type HomePageProps = {
  params: Promise<{ lang: "fa" | "en" }>;
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
    <main className="container mx-auto px-4 py-8 space-y-12 max-w-7xl font-vazirmatn">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8 flex flex-col">
        <Image
          className="dark:invert mx-auto"
          src="/lantern-pine-logo.svg"
          alt="Fanus vs Kaj"
          width={100}
          height={40}
          priority
        />
        <h1 className="text-2xl font-black">LANTERN & PINE</h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          {dict.home.description}
        </p>
        <div className="py-2">
          {lang === "en" ? (
            <Link className={buttonVariants({ size: "sm" })} href="/fa">
              به زبان فارسی
            </Link>
          ) : (
            <Link className={buttonVariants({ size: "sm" })} href="/en">
              I prefare English
            </Link>
          )}
        </div>
      </section>

      <div className="lg:flex flex-wrap space-x-4 space-y-4">
        {/* Upcoming Episodes Section */}
        {upcomingEpisodes.length > 0 && (
          <section className="space-y-4 flex-1">
            <h2 className="text-2xl font-bold">{dict.episodes.upcoming}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
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
                      <div
                        className="text-sm text-muted-foreground line-clamp-3 min-h-[4.75rem]"
                        dangerouslySetInnerHTML={{
                          __html:
                            (lang === "en"
                              ? episode.descriptionEn
                              : episode.descriptionFa) || "<p></p>",
                        }}
                      ></div>
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
            <div className="grid gap-6 sm:grid-cols-2">
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
                      <div
                        className="text-sm text-muted-foreground line-clamp-3 min-h-[4.75rem]"
                        dangerouslySetInnerHTML={{
                          __html:
                            (lang === "en"
                              ? episode.descriptionEn
                              : episode.descriptionFa) || "<p></p>",
                        }}
                      ></div>
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
