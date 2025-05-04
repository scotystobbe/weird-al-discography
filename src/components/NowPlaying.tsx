import React from "react";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer";
import PlaybackControls from "./PlaybackControls";


export default function NowPlaying() {
  const { token } = useSpotifyAuth();
  const { player, track, isReady, error } = useSpotifyPlayer(token);

  if (!token) return null;

  return (
    <div className="flex items-center justify-between mb-4 p-3 border rounded-lg shadow-sm bg-white dark:bg-gray-800 min-h-[80px]">
      <div className="flex items-center min-w-0 flex-1">
        {track ? (
          <div className="relative w-16 h-16 mr-4">
            <img
              src={track.albumArt}
              alt={track.album}
              className="w-16 h-16 rounded shrink-0 cursor-pointer"
              aria-label="Spotify album art"
              title="Spotify album art"
            />
            {/* Overlay broken icon if error is 429/cooldown (not needed with SDK, but keep for fallback) */}
            {error === "Cooling down." && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
                {/* Broken icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0M12 17v-1m0-4V5m0 0L7 9m5-4l5 4" />
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div className="w-16 h-16 mr-4 rounded shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-2xl">♪</span>
          </div>
        )}
        <div className="min-w-0">
          {/* Only show error text if not a 429/cooldown */}
          {error && error !== "Cooling down." && (
            <div className="text-xs text-red-500 mb-1">{error}</div>
          )}
          {track ? (
            <>
              <p className="text-base font-semibold break-words whitespace-normal" title={track.name}>
                {track.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 break-words whitespace-normal" title={track.album}>
                {track.album}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nothing is currently playing on Spotify.</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        <PlaybackControls player={player} isReady={isReady} />
      </div>
    </div>
  );
}

