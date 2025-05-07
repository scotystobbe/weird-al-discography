import React, { useState } from "react";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useNowPlaying } from "../hooks/useSpotifyNowPlaying";
import PlaybackControls from "./PlaybackControls";


export default function NowPlaying() {
  const { token } = useSpotifyAuth();
  const { track, loading, error, refresh, history } = useNowPlaying(token);
  const [showHistory, setShowHistory] = useState(false);

  if (!token) return null;

  return (
    <div className="relative flex items-center justify-between mb-4 p-3 border rounded-lg shadow-sm bg-white dark:bg-gray-800 min-h-[80px]">
      {/* History Icon Button */}
      <button
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Show song history"
        onClick={() => setShowHistory(h => !h)}
      >
        {/* Simple history SVG icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-300">
          <path d="M3 3v5h5" />
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
          <path d="M12 7v5l4 2" />
        </svg>
      </button>
      {/* History Dropdown */}
      {showHistory && (
        <div className="absolute right-2 top-10 z-10 w-64 max-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3">
          <div className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-200">Last 10 Songs</div>
          {history.length === 0 ? (
            <div className="text-xs text-gray-400">No history yet.</div>
          ) : (
            <ol className="list-decimal list-inside space-y-1">
              {history.map((title, i) => (
                <li key={i} className="truncate text-xs text-gray-700 dark:text-gray-200" title={title}>{title}</li>
              ))}
            </ol>
          )}
        </div>
      )}
      <div className="flex items-center min-w-0 flex-1">
        {track ? (
          <div className="relative w-16 h-16 mr-4">
            <img
              src={track.albumArt}
              alt={track.album}
              className="w-16 h-16 rounded shrink-0 cursor-pointer"
              onClick={refresh}
              aria-label="Refresh now playing from Spotify"
              title="Refresh now playing from Spotify"
            />
          </div>
        ) : (
          <div className="w-16 h-16 mr-4 rounded shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-2xl">♪</span>
          </div>
        )}
        <div className="min-w-0">
          {error && (
            <div className="text-xs text-red-500 mb-1">{error}</div>
          )}
          {track ? (
            <>
              <p className="text-base font-semibold break-words whitespace-normal" title={track.title}>
                {track.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 break-words whitespace-normal" title={track.album}>
                {track.album}
              </p>
            </>
          ) : !loading && !error ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nothing is currently playing on Spotify.</p>
          ) : null}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        <PlaybackControls token={token} onSkip={refresh} />
      </div>
    </div>
  );
}

