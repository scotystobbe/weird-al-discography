// src/hooks/useNowPlaying.ts
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!token) return;

    const fetchNowPlaying = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 204) {
          setTrack(null); // nothing playing
        } else if (res.ok) {
          const data = await res.json();
          const item = data.item;

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
