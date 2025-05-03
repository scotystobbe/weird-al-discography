import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import SongDialog from "./SongDialog";
import { Dialog, DialogContent } from "./ui/dialog";

interface Track {
  title: string;
  type: string;
  originalArtist?: string;
  originalSong?: string;
}

interface Album {
  title: string;
  year: number;
  cover: string;
  tracks: Track[];
}

interface AlbumCardProps {
  album: Album;
  searchTerm?: string;
  trackSort?: 'original' | 'alpha';
  matchInfo?: any[];
}

export default function AlbumCard({ album, searchTerm = "", trackSort = 'original', matchInfo }: AlbumCardProps) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Auto-expand if searchTerm matches album or any track
  useEffect(() => {
    if (!searchTerm) return setExpanded(false);
    const lower = searchTerm.toLowerCase();
    if (
      album.title.toLowerCase().includes(lower) ||
      album.tracks.some(track => track.title.toLowerCase().includes(lower))
    ) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [searchTerm, album]);

  // Helper to highlight search term or fuzzy match
  function highlight(text: string, match?: {indices: [number, number][]}) {
    if (match && match.indices.length > 0) {
      let lastIndex = 0;
      const parts = [];
      match.indices.forEach(([start, end], i) => {
        if (lastIndex < start) {
          parts.push(text.slice(lastIndex, start));
        }
        parts.push(<span key={i} className="font-semibold bg-yellow-200 dark:bg-yellow-700 rounded px-1">{text.slice(start, end + 1)}</span>);
        lastIndex = end + 1;
      });
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }
      return parts;
    }
    if (searchTerm) {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, "gi");
      return text.split(regex).map((part, i) =>
        regex.test(part)
          ? <span key={i} className="font-semibold">{part}</span>
          : part
      );
    }
    return text;
  }
  
  // Find match info for album title and tracks
  let albumTitleMatch: any = null;
  let trackMatches: Record<string, any> = {};
  if (matchInfo && Array.isArray(matchInfo)) {
    for (const match of matchInfo) {
      if (match.key === 'title') albumTitleMatch = match;
      if (match.key && match.key.startsWith('tracks')) {
        const idx = match.refIndex;
        if (typeof idx === 'number') trackMatches[idx] = match;
      }
    }
  }

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg cursor-pointer">
      <CardContent className="p-4 text-gray-900 dark:text-gray-100">
        {/* Header: artwork, title, year, arrow */}
        <div
          className="flex items-center space-x-4 select-none"
          onClick={() => setExpanded((prev) => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(prev => !prev); }}
          aria-expanded={expanded}
        >
          <img
            src={album.cover}
            alt={album.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {highlight(album.title, albumTitleMatch)}
              {albumTitleMatch && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 rounded">Fuzzy</span>}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{album.year}</p>
          </div>
          {/* Arrow indicator */}
          <span
            className="text-3xl text-gray-400 dark:text-gray-300 transition-transform duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-100"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▾' : '▸'}
          </span>
        </div>

        {/* Track list only if expanded */}
        {expanded && (
          <ul className="mt-4 space-y-2">
            {(() => {
              let tracks: Track[];
              const lower = searchTerm.toLowerCase();
              if (searchTerm && album.title.toLowerCase().includes(lower)) {
                tracks = album.tracks;
              } else if (searchTerm) {
                tracks = album.tracks.filter(track => track.title.toLowerCase().includes(lower));
              } else {
                tracks = album.tracks;
              }
              if (trackSort === 'alpha') {
                tracks = [...tracks].sort((a, b) => a.title.localeCompare(b.title));
              }
              return tracks.map((track, idx) => (
                <li key={idx}>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedTrack(track); }}
                    className="text-left w-full rounded-lg px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border-0 outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                  >
                    {highlight(track.title, trackMatches[idx])}
                    {trackMatches[idx] && trackMatches[idx].key && trackMatches[idx].key.includes('searchAliases') && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 rounded">Alias</span>
                    )}
                    {trackMatches[idx] && trackMatches[idx].key && trackMatches[idx].key.includes('originalSong') && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-100 rounded">Original Song</span>
                    )}
                  </button>
                </li>
              ));
            })()}
          </ul>
        )}
      </CardContent>

      {/* Dialog for song details, only if expanded */}
      {expanded && selectedTrack && (
        <Dialog>
          <DialogContent className="relative" onClose={() => setSelectedTrack(null)}>
            {/* Close button */}
            <button
              onClick={() => setSelectedTrack(null)}
              className="absolute top-2 right-3 text-4xl font-extrabold text-black hover:text-red-600"
              aria-label="Close"
            >
              ×
            </button>
            <SongDialog track={selectedTrack} />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
