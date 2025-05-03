import React, { useState } from "react";

interface Track {
  title: string;
  type: string;
  originalArtist?: string;
  originalSong?: string;
  featuredSongs?: string[];
}

interface SongDialogProps {
  track: Track;
  large?: boolean;
  albumCover?: string;
  onToggleLarge?: () => void;
}

export default function SongDialog({ track, large = false, albumCover, onToggleLarge }: SongDialogProps) {
  const [showFeatured, setShowFeatured] = useState(false);

  return (
    <div className={`relative p-6 text-left bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl transition-all ${large ? 'text-3xl p-12' : ''} ${large ? 'space-y-8' : 'space-y-2'}${!large ? ' pb-14' : ''}`}>
      {/* Album art in large mode */}
      {large && albumCover && (
        <div className="flex justify-center mb-6">
          <img src={albumCover} alt="Album cover" className="rounded-xl max-w-xs max-h-64 object-contain shadow-lg" />
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <h3 className={`font-bold ${large ? 'text-4xl' : 'text-xl'} m-0`}>{track.title}</h3>
      </div>
      {large ? (
        <div>
          <div className="flex items-center gap-2"><span>Type:</span><span className="font-bold">{track.type}</span></div>
          {track.originalSong && (
            <div className="mt-4">
              <div>Original Song:</div>
              <div className="font-bold">{track.originalSong}</div>
            </div>
          )}
          {track.originalArtist && (
            track.type === 'Style Parody' ? (
              <div className="mt-4 font-bold">{track.originalArtist}</div>
            ) : (
              <div className="mt-4">
                <div>Original Artist:</div>
                <div className="font-bold">{track.originalArtist}</div>
              </div>
            )
          )}
        </div>
      ) : (
        <>
          <p><strong>Type:</strong> {track.type}</p>
          {track.originalSong && (
            <p className="flex items-center gap-2">
              <strong>Original Song:</strong><span>{track.originalSong}</span>
              {track.originalArtist && (
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(track.originalSong + ' ' + track.originalArtist)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center opacity-50 hover:opacity-80 transition-opacity ml-1"
                  title="Search on Spotify"
                  tabIndex={0}
                >
                  <img src="/spotify_icon.png" alt="Spotify" className="h-5 w-5 grayscale" />
                </a>
              )}
            </p>
          )}
          {track.originalArtist && (
            track.type === 'Style Parody' ? (
              <p className="font-bold">{track.originalArtist}</p>
            ) : (
              <p><strong>Original Artist:</strong> {track.originalArtist}</p>
            )
          )}
        </>
      )}
      {Array.isArray(track.featuredSongs) && track.featuredSongs.length > 0 && (
        <div className="mt-4">
          {/* Hide both buttons in large mode, show both side by side in normal mode */}
          {!large && (
            <div className="flex gap-3 mb-2 flex-nowrap">
              <button
                className="px-3 py-2 rounded-md bg-gray-300 text-gray-900 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition whitespace-nowrap"
                onClick={() => setShowFeatured(v => !v)}
                aria-expanded={showFeatured}
              >
                {showFeatured ? 'Hide Songs' : 'Show Songs'}
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(
                      `Weird Al Yankovic ${track.title} lyrics`
                    )}`,
                    "_blank"
                  )
                }
                className="px-3 py-2 rounded-md bg-gray-300 text-gray-900 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition whitespace-nowrap"
              >
                Search Lyrics
              </button>
            </div>
          )}
          {showFeatured && !large && (
            <ul className="list-disc list-inside mt-2 space-y-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              {track.featuredSongs.map((song, i) => (
                <li key={i} className="text-gray-800 dark:text-gray-200">{song}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
