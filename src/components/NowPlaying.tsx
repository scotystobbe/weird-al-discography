import React from "react";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useNowPlaying } from "../hooks/useSpotifyNowPlaying";
import PlaybackControls from "./PlaybackControls";


export default function NowPlaying() {
  const { token } = useSpotifyAuth();
  const { track, loading, error, refresh } = useNowPlaying(token);

  if (!token) return null;

  return (
    <div className="flex items-center justify-between mb-4 p-3 border rounded-lg shadow-sm bg-white dark:bg-gray-800 min-h-[80px]">
      <div className="flex items-center min-w-0 flex-1">
        {track ? (
          <img
            src={track.albumArt}
            alt={track.album}
            className="w-16 h-16 mr-4 rounded shrink-0 cursor-pointer"
            onClick={refresh}
            aria-label="Refresh now playing from Spotify"
            title="Refresh now playing from Spotify"
          />
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
              {/* <p className="text-sm text-gray-600 dark:text-gray-300">{track.artist}</p> */}
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

