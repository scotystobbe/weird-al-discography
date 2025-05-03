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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastManualRefreshRef = useRef<number>(0);
  const isTabActiveRef = useRef<boolean>(true);
  const backoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

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

      if (res.status === 429) {
        // Rate limited by Spotify
        setError("Rate limited by Spotify. Please wait a couple minutes.");
        clearPolling();
        if (backoffTimeoutRef.current) clearTimeout(backoffTimeoutRef.current);
        backoffTimeoutRef.current = setTimeout(() => {
          setError(null);
          if (isTabActiveRef.current) {
            fetchNowPlaying();
            pollingIntervalRef.current = setInterval(fetchNowPlaying, 90000); // 90s
          }
        }, 120000); // 2 minutes
        return;
      }

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

  // Polling logic: only when tab is active
  useEffect(() => {
    if (!token) return;
    function handleVisibilityChange() {
      isTabActiveRef.current = !document.hidden;
      if (document.hidden) {
        clearPolling();
      } else {
        fetchNowPlaying();
        clearPolling();
        pollingIntervalRef.current = setInterval(fetchNowPlaying, 90000); // 90s
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Start polling if tab is active
    if (!document.hidden) {
      fetchNowPlaying();
      pollingIntervalRef.current = setInterval(fetchNowPlaying, 90000); // 90s
    }
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearPolling();
      if (backoffTimeoutRef.current) clearTimeout(backoffTimeoutRef.current);
    };
  }, [token, fetchNowPlaying]);

  // Expose a stable, debounced refresh function for manual refresh
  const refresh = useCallback(() => {
    const now = Date.now();
    if (now - lastManualRefreshRef.current < 10000) {
      setError("Please wait a few seconds before refreshing again.");
      return;
    }
    lastManualRefreshRef.current = now;
    setError(null);
    fetchNowPlaying();
  }, [fetchNowPlaying]);

  return { track, loading, error, refresh };
}
