import React, { useState } from "react";

interface Track {
  title: string;
  type: string;
  originalArtist?: string;
  originalSong?: string;
  featuredSongs?: string[];
}

export default function SongDialog({ track }: { track: Track }) {
  const [showFeatured, setShowFeatured] = useState(false);

  return (
    <div className="p-6 text-left space-y-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl">
      <h3 className="text-xl font-bold">{track.title}</h3>
      <p><strong>Type:</strong> {track.type}</p>
      {track.originalSong && (
        <p><strong>Original Song:</strong> {track.originalSong}</p>
      )}
      {track.originalArtist && (
        <p><strong>Original Artist:</strong> {track.originalArtist}</p>
      )}
      {Array.isArray(track.featuredSongs) && track.featuredSongs.length > 0 && (
        <div className="mt-4">
          <button
            className="text-blue-600 dark:text-blue-400 underline font-semibold mb-2"
            onClick={() => setShowFeatured(v => !v)}
            aria-expanded={showFeatured}
          >
            {showFeatured ? 'Hide' : 'Show'} Featured Songs
          </button>
          {showFeatured && (
            <ul className="list-disc list-inside mt-2 space-y-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              {track.featuredSongs.map((song, i) => (
                <li key={i} className="text-gray-800 dark:text-gray-200">{song}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ✅ Add Search Lyrics Button */}
      <div className="pt-4">
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(
                `Weird Al Yankovic ${track.title} lyrics`
              )}`,
              "_blank"
            )
          }
          className="px-4 py-2 rounded-md bg-gray-300 text-gray-900 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
        >
          Search Lyrics
        </button>
      </div>
    </div>
  );
}
