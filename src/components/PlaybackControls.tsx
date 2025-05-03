// src/components/PlaybackControls.tsx
import React, { useEffect, useState } from "react";
import { fetchSpotifyApi } from "../lib/spotifyAuth";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";

interface PlaybackControlsProps {
  token: string;
}

export default function PlaybackControls({ token }: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState<boolean | null>(null);
  const { login } = useSpotifyAuth();

  const sendCommand = async (endpoint: string, method = "POST") => {
    try {
      await fetchSpotifyApi(
        `https://api.spotify.com/v1/me/player/${endpoint}`,
        token,
        () => {
          if (window.confirm("Spotify session expired. Re-authenticate?")) {
            login();
          }
        },
        null,
        { method }
      );
      if (endpoint === "play") setIsPlaying(true);
      if (endpoint === "pause") setIsPlaying(false);
    } catch (err) {
      // Optionally handle error
    }
  };

  const fetchPlaybackState = async () => {
    try {
      const res = await fetchSpotifyApi(
        "https://api.spotify.com/v1/me/player",
        token,
        () => {
          if (window.confirm("Spotify session expired. Re-authenticate?")) {
            login();
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setIsPlaying(data.is_playing);
      }
    } catch (err) {
      console.error("Failed to fetch playback state", err);
    }
  };

  useEffect(() => {
    fetchPlaybackState();
    const interval = setInterval(fetchPlaybackState, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const togglePlayPause = () => {
    sendCommand(isPlaying ? "pause" : "play");
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <button
        onClick={() => sendCommand("previous")}
        className="text-white hover:text-white text-2xl"
        aria-label="Previous"
      >
        ⏮
      </button>
      <button
        onClick={togglePlayPause}
        className="text-white hover:text-white text-3xl"
        aria-label="Play or Pause"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button
        onClick={() => sendCommand("next")}
        className="text-white hover:text-white text-2xl"
        aria-label="Next"
      >
        ⏭
      </button>
    </div>
  );
}
