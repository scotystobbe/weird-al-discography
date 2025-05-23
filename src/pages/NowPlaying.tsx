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
  const [showPolkaSongs, setShowPolkaSongs] = useState(false);

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

  // Helper for type display
  function getTypeDisplay(track: any) {
    const detailStyle = { fontSize: '2.5rem', marginTop: 12, color: '#bbb', textAlign: 'center' as const, fontWeight: 400 as const, letterSpacing: '0.5px', lineHeight: 1.15 };
    if (!track) return null;
    if (track.type === 'Parody') {
      return (
        <div style={detailStyle}>
          Parody of <strong>{track.originalSong}</strong> by <strong>{track.originalArtist}</strong>
        </div>
      );
    }
    if (track.type === 'Style Parody') {
      let artist = track.originalArtist || '';
      artist = artist.replace(/^Style of\s*/i, '').trim();
      return (
        <div style={detailStyle}>
          Style Parody of <strong>{artist}</strong>
        </div>
      );
    }
    if (track.type === 'Original') {
      return (
        <div style={detailStyle}>
          Original Song
        </div>
      );
    }
    if (track.type === 'Polka Medley') {
      return (
        <div style={detailStyle}>
          Polka Medley
          <button
            style={{ marginLeft: 18, padding: '4px 16px', borderRadius: 8, background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 500 }}
            onClick={() => setShowPolkaSongs(s => !s)}
          >
            {showPolkaSongs ? 'Hide Songs' : 'Show Songs'}
          </button>
          {showPolkaSongs && track.featuredSongs && track.featuredSongs.length > 0 && (
            <ul style={{
              marginTop: 10,
              paddingLeft: 0,
              listStyle: 'none',
              textAlign: 'center' as const,
              maxWidth: 600,
              margin: '10px auto 0 auto',
            }}>
              {track.featuredSongs.map((song: string, idx: number) => (
                <li
                  key={idx}
                  style={{
                    color: '#eee',
                    fontSize: '2rem',
                    lineHeight: 1.3,
                    padding: '10px 0',
                    borderBottom: idx !== track.featuredSongs.length - 1 ? '1px solid #333' : 'none',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  }}
                >
                  {song}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#18181b', color: '#fff', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 0 }}>
        {initialLoading ? (
          <div style={{ textAlign: 'center', padding: 32, fontSize: '2.5rem' }}>Loading...</div>
        ) : !isAuthenticated ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <button
              onClick={handleConnect}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 28px',
                background: '#1db954',
                color: '#fff',
                borderRadius: 8,
                fontSize: '1.1rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002',
              }}
            >
              Connect to Spotify
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#191414" />
                <path d="M17.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="#1DB954" />
              </svg>
            </button>
          </div>
        ) : !track || !matchedTrack ? (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '2.5rem' }}>Nothing playing...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {track.artworkUrl && (
              <img
                src={track.artworkUrl}
                alt={matchedTrack.title}
                style={{ width: 210, height: 210, borderRadius: 8, objectFit: 'cover', marginBottom: 24 }}
              />
            )}
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16, textAlign: 'center', color: '#fff', letterSpacing: '0.5px', lineHeight: 1.15 }}>{matchedTrack.title}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: 8, textAlign: 'center', color: '#b0b0b0', fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.15 }}>{matchedTrack.album?.title}</p>
            {getTypeDisplay(matchedTrack)}
          </div>
        )}
        {error && <div style={{ color: '#ff6b6b', marginTop: 24, textAlign: 'center', fontSize: '2.5rem' }}>{error}</div>}
      </div>
    </div>
  );
} 