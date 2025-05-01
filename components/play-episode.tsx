"use client";
import { Episode } from "@/lib/db/schema";
import { useAudioPlayer } from "./audio-player";
import { Button } from "./ui/button";

export function PlayEpisode({ episode }: { episode: Episode }) {
  const { loadAudio } = useAudioPlayer();

  return (
    <>
      {episode?.audioUrl && (
        <Button onClick={() => loadAudio(episode.audioUrl as string)}>
          Play
        </Button>
      )}
    </>
  );
}
