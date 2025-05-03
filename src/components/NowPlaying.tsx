import React from "react";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useNowPlaying } from "../hooks/useSpotifyNowPlaying";
import PlaybackControls from "./PlaybackControls";


export default function NowPlaying() {
  const { token } = useSpotifyAuth();
  const { track, loading, error } = useNowPlaying(token);

  if (!token) return null;
  if (loading) return <p className="text-sm text-gray-500 mb-4">Fetching now playing...</p>;
  if (error) return <p className="text-sm text-red-500 mb-4">Error: {error}</p>;
  if (!track) return <p className="text-sm text-gray-500 mb-4">Nothing is currently playing on Spotify.</p>;

  return (
    <div className="flex items-center justify-between mb-4 p-3 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <div className="flex items-center">
        <img src={track.albumArt} alt={track.album} className="w-16 h-16 mr-4 rounded" />
        <div>
          <p className="text-lg font-semibold">{track.title}</p>
          {/* <p className="text-sm text-gray-600 dark:text-gray-300">{track.artist}</p> */}
          <p className="text-sm text-gray-600 dark:text-gray-300">{track.album}</p>
        </div>
      </div>
      <PlaybackControls token={token} />
    </div>
  );
}

