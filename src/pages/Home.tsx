import React, { useState } from "react";
import albumsData from "../data/albums.json";
import { Input } from "../components/ui/input";
import AlbumCard from "../components/AlbumCard";
import SpotifyStatus from "../components/SpotifyStatus";


export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [albumSort, setAlbumSort] = useState<'year' | 'alpha'>("year");
  const [trackSort, setTrackSort] = useState<'original' | 'alpha'>("original");

  let filteredAlbums = albumsData.albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.tracks.some(track =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort albums
  filteredAlbums = [...filteredAlbums].sort((a, b) => {
    if (albumSort === "year") {
      return a.year - b.year;
    } else {
      const aSort = a.sortTitle || a.title;
      const bSort = b.sortTitle || b.title;
      return aSort.localeCompare(bSort);
    }
  });

  return (
    <div className="p-4 max-w-screen-md mx-auto">
       <SpotifyStatus /> {/* ✅ Add here */}
      <div className="relative mb-4">
        <Input
          placeholder="Search for albums or songs..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xl focus:outline-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          Album Sort:
          <select value={albumSort} onChange={e => setAlbumSort(e.target.value as 'year' | 'alpha')} className="border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <option value="year">Year</option>
            <option value="alpha">A-Z</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          Track Sort:
          <select value={trackSort} onChange={e => setTrackSort(e.target.value as 'original' | 'alpha')} className="border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <option value="original">Original</option>
            <option value="alpha">A-Z</option>
          </select>
        </label>
      </div>
      <div className="space-y-4">
        {filteredAlbums.map(album => (
          <AlbumCard key={album.title} album={album} searchTerm={searchTerm} trackSort={trackSort} />
        ))}
      </div>
    </div>
  );
}
