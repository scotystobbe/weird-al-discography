// src/hooks/useNowPlaying.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchSpotifyApi } from "../lib/spotifyAuth";
import { useSpotifyAuth } from "./useSpotifyAuth";

interface NowPlayingTrack {
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  fullQuery: string;
}

export function useNowPlaying(token: string | null) {
  const [track, setTrack] = useState<NowPlayingTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // NOTE: If you see a linter error here about arguments, it is incorrect. useSpotifyAuth takes no arguments.
  // Try restarting your editor or clearing the TypeScript cache if the error persists.
  const { login, refreshAccessToken } = useSpotifyAuth();
  const fetchNowPlayingRef = useRef<() => Promise<void>>();

  const fetchNowPlaying = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSpotifyApi(
        "https://api.spotify.com/v1/me/player",
        token,
        () => {
          // Automatically re-authenticate if refresh fails
          login();
        },
        refreshAccessToken
      );

      if (res.status === 204) {
        setTrack(null); // nothing playing
      } else if (res.ok) {
        const data = await res.json();
        const item = data.item;

        // If item is missing but there is a device and context, keep the previous track
        if (!item) {
          // If there are no devices or no context, clear track
          if (!data.device || data.device === null) {
            setTrack(null);
            return;
          }
          // Otherwise, keep previous track (do not set to null)
          return;
        }

        const title = item.name;
        const artist = item.artists.map((a: any) => a.name).join(", ");
        const album = item.album.name;
        const albumArt = item.album.images[0]?.url ?? "";

        // Only update if the track has actually changed
        setTrack(prev => {
          if (
            prev &&
            prev.title === title &&
            prev.artist === artist &&
            prev.album === album &&
            prev.albumArt === albumArt
          ) {
            return prev; // No change
          }
          return {
            title,
            artist,
            album,
            albumArt,
            fullQuery: title,
          };
        });
      } else {
        const errorText = await res.text();
        setError(errorText);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, login, refreshAccessToken]);

  // Store the latest fetchNowPlaying in a ref for external use
  fetchNowPlayingRef.current = fetchNowPlaying;

  useEffect(() => {
    if (!token) return;
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token, fetchNowPlaying]);

  // Expose a stable refresh function
  const refresh = useCallback(() => {
    if (fetchNowPlayingRef.current) {
      fetchNowPlayingRef.current();
    }
  }, []);

  return { track, loading, error, refresh };
}
