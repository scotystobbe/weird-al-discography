// src/components/PlaybackControls.tsx
import React, { useEffect, useState } from "react";
import { fetchSpotifyApi } from "../lib/spotifyAuth";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";

interface PlaybackControlsProps {
  player: any;
  isReady: boolean;
}

export default function PlaybackControls({ player, isReady }: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState<boolean | null>(null);

  // Listen for player state changes to update play/pause button
  useEffect(() => {
    if (!player) return;
    const handler = (state: any) => {
      setIsPlaying(state && !state.paused);
    };
    player.addListener("player_state_changed", handler);
    player.getCurrentState && player.getCurrentState().then((state: any) => {
      setIsPlaying(state && !state.paused);
    });
    return () => {
      player.removeListener("player_state_changed", handler);
    };
  }, [player]);

  const togglePlayPause = () => {
    if (!player) return;
    player.togglePlay();
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={() => player && player.previousTrack()}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none"
        aria-label="Previous"
        disabled={!isReady || !player}
      >
        <img src="/skip_start_icon.svg" alt="Previous" className="w-6 h-6 filter invert opacity-80" />
      </button>
      <button
        onClick={togglePlayPause}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none mx-2"
        aria-label="Play or Pause"
        disabled={!isReady || !player}
      >
        {isPlaying ? (
          <img src="/pause_icon.svg" alt="Pause" className="w-10 h-10 filter invert opacity-80" />
        ) : (
          <img src="/play_icon.svg" alt="Play" className="w-10 h-10 filter invert opacity-80" />
        )}
      </button>
      <button
        onClick={() => player && player.nextTrack()}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none"
        aria-label="Next"
        disabled={!isReady || !player}
      >
        <img src="/skip_end_icon.svg" alt="Next" className="w-6 h-6 filter invert opacity-80" />
      </button>
    </div>
  );
}
