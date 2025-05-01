"use client";

import { createContext, useContext, useState, useRef } from "react";
import { Button } from "./ui/button";

type AudioPlayerContextType = {
  audioUrl: string | null;
  isPlaying: boolean;
  loadAudio: (url: string) => void;
  togglePlay: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadAudio = (url: string) => {
    setAudioUrl(url);
    // iOS requires explicit user interaction before playing,
    // so we load but don't auto-play
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // iOS requires this to be triggered directly by user interaction
      audioRef.current.play().catch((error) => {
        console.error("Audio play failed:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <AudioPlayerContext.Provider
      value={{ audioUrl, isPlaying, loadAudio, togglePlay }}
    >
      {children}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          key={audioUrl}
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

function PersistentAudioPlayer() {
  const { isPlaying, togglePlay, audioUrl } = useAudioPlayer();

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="container mx-auto flex items-center gap-4">
        <Button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</Button>
        <span className="text-sm">{audioUrl}</span>
      </div>
    </div>
  );
}
