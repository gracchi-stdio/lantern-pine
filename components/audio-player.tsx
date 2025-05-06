"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { DownloadIcon, PauseIcon, PlayIcon } from "lucide-react";

type AudioPlayerContextType = {
  audioUrl: string | null;
  isPlaying: boolean;
  loadAudio: (url: string) => void;
  togglePlay: () => void;
  seek: (time: number) => void; // Added seek function
  duration: number;
  currentTime: number;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadAudio = (url: string) => {
    setAudioUrl(url);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Audio play failed:", error);
        setIsPlaying(false); // Ensure state is correct on failure
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Function to seek to a specific time
  const seek = (time: number) => {
    if (audioRef.current && duration) {
      // Clamp time between 0 and duration
      const newTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime); // Update state immediately for responsiveness
    }
  };

  // Effect to reset state when audioUrl changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [audioUrl]);

  // Effect to handle audio events
  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      const handleLoadedMetadata = () => {
        setDuration(isNaN(audio.duration) ? 0 : audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(duration); // Set time to end when finished
      };

      // Need to set canplay to ensure duration is available on some browsers/loads
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("durationchange", handleLoadedMetadata); // Handle duration changes
      audio.addEventListener("canplay", handleLoadedMetadata); // Ensure metadata ready
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);

      // Initial check in case metadata is already loaded
      if (audio.readyState >= 1) {
        handleLoadedMetadata();
      }

      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("durationchange", handleLoadedMetadata);
        audio.removeEventListener("canplay", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioUrl, duration]); // Re-run if audioUrl changes or duration gets set

  return (
    <AudioPlayerContext.Provider
      value={{
        audioUrl,
        isPlaying,
        loadAudio,
        togglePlay,
        seek, // Provide seek function
        duration,
        currentTime,
      }}
    >
      {children}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          key={audioUrl}
          preload="metadata"
          onLoadedMetadata={() => {
            // Directly update duration on metadata load
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
        />
      )}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}

export function AudioPlayerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AudioPlayerProvider>
      {children}
      <PersistentAudioPlayer />
    </AudioPlayerProvider>
  );
}

// Helper function to format time
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === Infinity || seconds < 0) {
    return "--:--";
  }
  const floorSeconds = Math.floor(seconds);
  const min = Math.floor(floorSeconds / 60);
  const sec = floorSeconds % 60;
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function PersistentAudioPlayer() {
  const { isPlaying, togglePlay, audioUrl, duration, currentTime, seek } =
    useAudioPlayer();
  const progressBarRef = useRef<HTMLDivElement>(null); // Ref for the progress bar container

  // Calculate progress value (0-100)
  const progressValue =
    duration && !isNaN(duration) && duration > 0
      ? (currentTime / duration) * 100
      : 0;

  // Handle clicking on the progress bar to seek
  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (clickX / width) * 100)); // Clamp between 0 and 100
    const targetTime = (percentage / 100) * duration;
    seek(targetTime);
  };

  // Handle keyboard skipping
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if modifier keys are pressed or if no audio is loaded
      if (event.metaKey || event.ctrlKey || event.altKey || !audioUrl) {
        return;
      }

      const skipAmount = 5; // Skip 5 seconds

      if (event.key === "ArrowLeft") {
        event.preventDefault(); // Prevent default browser action (like scrolling)
        seek(currentTime - skipAmount);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        seek(currentTime + skipAmount);
      }
      // Consider adding space bar for play/pause as well?
      else if (event.key === " ") {
        event.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // Dependencies: Ensure handler uses latest state/context values
  }, [seek, currentTime, duration, audioUrl, togglePlay, isPlaying]);

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="container mx-auto flex items-center gap-4">
        <Button
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon></PauseIcon> : <PlayIcon></PlayIcon>}
        </Button>
        <p>{formatTime(currentTime)}</p>
        {/* Container for the progress bar to attach click listener */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="w-full cursor-pointer group py-2"
        >
          <Progress
            value={progressValue}
            aria-valuenow={progressValue}
            aria-label="Audio progress"
            // You can potentially add more styling on group-hover if needed
          />
        </div>
        <p>{formatTime(duration)}</p>

        <Button size="icon" variant="default" asChild>
          <a
            href={audioUrl}
            download={audioUrl.split("/").pop() || "audio_download"}
            aria-label="Download audio"
            target="_blank"
          >
            <DownloadIcon />
            <span className="sr-only">Download</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
