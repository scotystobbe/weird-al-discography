// src/components/PlaybackControls.tsx
import React, { useEffect, useState } from "react";

interface PlaybackControlsProps {
  token: string;
}

export default function PlaybackControls({ token }: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState<boolean | null>(null);

  const sendCommand = async (endpoint: string, method = "POST") => {
    await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (endpoint === "play") setIsPlaying(true);
    if (endpoint === "pause") setIsPlaying(false);
  };

  const fetchPlaybackState = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
        className="text-gray-500 hover:text-white text-xl"
        aria-label="Previous"
      >
        ⏮
      </button>
      <button
        onClick={togglePlayPause}
        className="text-gray-500 hover:text-white text-2xl"
        aria-label="Play or Pause"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button
        onClick={() => sendCommand("next")}
        className="text-gray-500 hover:text-white text-xl"
        aria-label="Next"
      >
        ⏭
      </button>
    </div>
  );
}
