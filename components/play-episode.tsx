"use client";
import { Episode } from "@/lib/db/schema";
import { useAudioPlayer } from "./audio-player";
import { Button } from "./ui/button";
import { HeadphonesIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PlayEpisode({ episode }: { episode: Episode }) {
  const { loadAudio } = useAudioPlayer();

  return (
    <>
      {episode?.audioUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="secondary"
                size={"icon"}
                onClick={() => loadAudio(episode.audioUrl as string)}
              >
                <span className="sr-only">record</span>
                <HeadphonesIcon size={30} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Listen to the recorded audio</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
