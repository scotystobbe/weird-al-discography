// src/components/PlaybackControls.tsx
import React, { useEffect, useState } from "react";
import { fetchSpotifyApi } from "../lib/spotifyAuth";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";

interface PlaybackControlsProps {
  token: string;
  isPlaying: boolean | null;
  refreshAccessToken: (() => Promise<string | null>) | null;
  forceRefresh: (durationMs?: number) => void;
  onSkip?: () => void;
}

export default function PlaybackControls({ token, isPlaying, refreshAccessToken, forceRefresh, onSkip }: PlaybackControlsProps) {
  const { login } = useSpotifyAuth();
  const [error, setError] = useState<string | null>(null);

  const sendCommand = async (endpoint: string) => {
    let method: string = "POST";
    if (endpoint === "play" || endpoint === "pause") {
      method = "PUT";
    }
    try {
      setError(null);
      await fetchSpotifyApi(
        `https://api.spotify.com/v1/me/player/${endpoint}`,
        token,
        () => {
          if (window.confirm("Spotify session expired. Re-authenticate?")) {
            login();
          }
        },
        refreshAccessToken,
        { method }
      );
      // After command, force fast polling for 5s
      forceRefresh(5000);
      if (endpoint === "next" || endpoint === "previous") {
        setTimeout(() => {
          if (onSkip) onSkip();
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send command to Spotify");
    }
  };

  const togglePlayPause = () => {
    sendCommand(isPlaying ? "pause" : "play");
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={() => sendCommand("previous")}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none"
        aria-label="Previous"
      >
        <img src="/skip_start_icon.svg" alt="Previous" className="w-6 h-6 filter invert" />
      </button>
      <button
        onClick={togglePlayPause}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none mx-2"
        aria-label="Play or Pause"
      >
        {isPlaying ? (
          <img src="/pause_icon.svg" alt="Pause" className="w-10 h-10 filter invert" />
        ) : (
          <img src="/play_icon.svg" alt="Play" className="w-10 h-10 filter invert" />
        )}
      </button>
      <button
        onClick={() => sendCommand("next")}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none"
        aria-label="Next"
      >
        <img src="/skip_end_icon.svg" alt="Next" className="w-6 h-6 filter invert" />
      </button>
      {error && <div className="text-xs text-red-500 ml-2">{error}</div>}
    </div>
  );
}
