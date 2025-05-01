import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import { episodes } from "./schema";

export const getEpisodeById = async (episodeId: number | string) => {
  let safeEpisodeId;
  if (typeof episodeId === "string") {
    safeEpisodeId = parseInt(episodeId);
  } else {
    safeEpisodeId = episodeId;
  }

  const episode = await db.query.episodes.findFirst({
    where: eq(episodes.id, safeEpisodeId),
  });
  return episode;
};
