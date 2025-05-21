import React, { useEffect, useState, useCallback, useRef } from "react";
import useSWR from 'swr';

function normalize(str: string) {
  return str
    .toLowerCase()
    .replace(/\([^)]*\)/g, "") // Remove parentheticals
    .replace(/[^a-z0-9\s]/gi, "") // Remove punctuation
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

function fuzzyMatch(a: string, b: string) {
  if (!a || !b) return false;
  a = normalize(a);
  b = normalize(b);
  if (a.includes(b) || b.includes(a)) return true;
  function lev(s: string, t: string) {
    const d = Array.from({ length: s.length + 1 }, (_, i) => [i, ...Array(t.length).fill(0)]);
    for (let j = 1; j <= t.length; j++) d[0][j] = j;
    for (let i = 1; i <= s.length; i++) {
      for (let j = 1; j <= t.length; j++) {
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1)
        );
      }
    }
    return d[s.length][t.length];
  }
  return lev(a, b) <= 2;
}

export default function NowPlaying() {
  const [error, setError] = useState('');
  const [track, setTrack] = useState<any>(null); // Spotify track
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const lastTrackId = useRef<string | null>(null);
  const [matchedTrack, setMatchedTrack] = useState<any>(null);

  // Fetch all tracks from DB
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: tracks = [] } = useSWR('/api/tracks', fetcher, {
    dedupingInterval: 3600000, // 1 hour
    revalidateOnFocus: false,
  });

  // Fetch currently playing from proxy
  const fetchCurrentlyPlaying = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch('/api/spotify-proxy/currently-playing');
      if (res.status === 401) {
        setIsAuthenticated(false);
        if (isInitial) setInitialLoading(false);
        return;
      }
      setIsAuthenticated(true);
      const data = await res.json();
      if (!data || data.playing === false || !data.id) {
        setTrack(null);
        setMatchedTrack(null);
        if (isInitial) setInitialLoading(false);
        return;
      }
      setTrack(data);
      lastTrackId.current = data.id;
      // Fuzzy match against Track table
      const spotifyTitle = data.title || '';
      let match = tracks.find((t: any) => fuzzyMatch(t.title, spotifyTitle) || (t.searchAliases && t.searchAliases.some((alias: string) => fuzzyMatch(alias, spotifyTitle))));
      setMatchedTrack(match || null);
      if (isInitial) setInitialLoading(false);
    } catch (err: any) {
      setError('Failed to fetch currently playing track.');
      if (isInitial) setInitialLoading(false);
    }
  }, [tracks]);

  useEffect(() => {
    fetchCurrentlyPlaying(true);
    const interval = setInterval(() => fetchCurrentlyPlaying(false), 5000);
    return () => clearInterval(interval);
  }, [fetchCurrentlyPlaying]);

  const handleConnect = () => {
    window.location.href = '/api/spotify-proxy/login';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#18181b', color: '#fff', padding: 24 }}>
      <h1 style={{ textAlign: 'center', fontSize: 32, marginBottom: 32 }}>Now Playing</h1>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, background: '#232326', borderRadius: 16 }}>
        {initialLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div>
        ) : !isAuthenticated ? (
          <button
            onClick={handleConnect}
            style={{ padding: '12px 32px', background: '#1db954', color: '#fff', borderRadius: 8, fontSize: 18, fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Connect to Spotify
          </button>
        ) : !track ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>No track currently playing. Play something on Spotify!</p>
        ) : (
          <>
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>From Spotify</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{track.title}</h3>
                <p style={{ fontSize: 18, marginBottom: 4, textAlign: 'center' }}>{track.artist}</p>
                <p style={{ fontSize: 16, marginBottom: 12, textAlign: 'center', color: '#bbb' }}>{track.album}</p>
                <iframe
                  src={`https://open.spotify.com/embed/track/${track.id}`}
                  width="300"
                  height="80"
                  frameBorder="0"
                  allow="encrypted-media"
                  style={{ borderRadius: 8, marginTop: 16 }}
                  title="Spotify Player"
                ></iframe>
              </div>
            </section>
            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Matched from DB</h2>
              {matchedTrack ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{matchedTrack.title}</h3>
                  <p style={{ fontSize: 18, marginBottom: 4, textAlign: 'center' }}>{matchedTrack.album?.title}</p>
                  <p style={{ fontSize: 16, marginBottom: 8, textAlign: 'center', color: '#bbb' }}>{matchedTrack.type}</p>
                  {matchedTrack.originalSong && (
                    <p style={{ fontSize: 16, marginBottom: 4, textAlign: 'center', color: '#bbb' }}>
                      <strong>Original Song:</strong> {matchedTrack.originalSong}
                    </p>
                  )}
                  {matchedTrack.originalArtist && (
                    <p style={{ fontSize: 16, marginBottom: 4, textAlign: 'center', color: '#bbb' }}>
                      <strong>Original Artist:</strong> {matchedTrack.originalArtist}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#aaa' }}>No match found in discography.</div>
              )}
            </section>
          </>
        )}
        {error && <div style={{ color: '#ff6b6b', marginTop: 16, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  );
} 