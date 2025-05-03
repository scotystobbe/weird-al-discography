// src/hooks/useNowPlaying.ts
import { useEffect, useState } from "react";
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
  const { login, refreshAccessToken } = useSpotifyAuth();

  useEffect(() => {
    if (!token) return;

    const fetchNowPlaying = async () => {
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

          setTrack({
            title,
            artist,
            album,
            albumArt,
            fullQuery: title,
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
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  return { track, loading, error };
}
