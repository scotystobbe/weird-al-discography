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

  const sendCommand = async (endpoint: string) => {
    let method: string = "POST";
    if (endpoint === "play" || endpoint === "pause") {
      method = "PUT";
    }
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
      if (endpoint === "next" || endpoint === "previous") {
        // Refresh playback state to get the new track
        fetchPlaybackState();
      }
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
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none"
        aria-label="Previous"
      >
        <img src="/skip_start_icon.svg" alt="Previous" className="w-8 h-8 filter invert" />
      </button>
      <button
        onClick={togglePlayPause}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none"
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
        <img src="/skip_end_icon.svg" alt="Next" className="w-8 h-8 filter invert" />
      </button>
    </div>
  );
}
