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
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none text-white hover:text-white"
        aria-label="Previous"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"/><rect x="13" y="5" width="3" height="14" rx="1" fill="currentColor"/></svg>
      </button>
      <button
        onClick={togglePlayPause}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none text-white hover:text-white"
        aria-label="Play or Pause"
      >
        {isPlaying ? (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
        )}
      </button>
      <button
        onClick={() => sendCommand("next")}
        className="p-0 m-0 bg-transparent border-none outline-none focus:outline-none text-white hover:text-white"
        aria-label="Next"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 5 22 12 13 19 13 5"/><rect x="8" y="5" width="3" height="14" rx="1" fill="currentColor"/></svg>
      </button>
    </div>
  );
}
