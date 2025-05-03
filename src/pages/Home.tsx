import React, { useEffect, useState } from "react";
import albumsData from "../data/albums.json";
import { Input } from "../components/ui/input";
import AlbumCard from "../components/AlbumCard";
import SpotifyStatus from "../components/SpotifyStatus";
import NowPlaying from "../components/NowPlaying";
import { useNowPlaying } from "../hooks/useSpotifyNowPlaying";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";



export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [albumSort, setAlbumSort] = useState<'year' | 'alpha'>("year");
  const [trackSort, setTrackSort] = useState<'original' | 'alpha'>("original");
  const [showFilters, setShowFilters] = useState(false);

  const { token } = useSpotifyAuth();
  const { track } = useNowPlaying(token);

  // Autofill search term when track updates
  useEffect(() => {
    if (track?.fullQuery) {
      setSearchTerm(track.fullQuery);
    }
  }, [track]);


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
      <h1 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
        Weird Al Discography
      </h1>

      <SpotifyStatus />
      <NowPlaying />
      <div className="relative mb-4 flex items-center">
        <div className="flex-1 relative">
          {/* Search icon inside input */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Clear search"
              tabIndex={0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.83-10.83a1 1 0 00-1.41 0L10 8.59 8.59 7.17a1 1 0 10-1.41 1.41L8.59 10l-1.41 1.41a1 1 0 101.41 1.41L10 11.41l1.41 1.41a1 1 0 001.41-1.41L11.41 10l1.41-1.41a1 1 0 000-1.42z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(f => !f)}
          className="ml-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="Show sorting options"
        >
          {/* Inline sort_icon.svg, theme-aware color */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="currentColor">
            <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
          </svg>
        </button>
      </div>
      {showFilters && (
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
      )}
      <div className="space-y-4">
        {filteredAlbums.map(album => (
          <AlbumCard key={album.title} album={album} searchTerm={searchTerm} trackSort={trackSort} />
        ))}
      </div>
    </div>
  );
}
