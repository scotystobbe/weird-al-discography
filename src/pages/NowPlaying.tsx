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
    if (!track) return null;
    if (track.type === 'Parody') {
      return (
        <div style={{ fontSize: 16, marginTop: 12, color: '#bbb', textAlign: 'center' }}>
          Parody of <strong>{track.originalSong}</strong> by <strong>{track.originalArtist}</strong>
        </div>
      );
    }
    if (track.type === 'Style Parody') {
      // Remove 'Style of' from the originalArtist string if present
      let artist = track.originalArtist || '';
      artist = artist.replace(/^Style of\s*/i, '').trim();
      return (
        <div style={{ fontSize: 16, marginTop: 12, color: '#bbb', textAlign: 'center' }}>
          Style Parody of <strong>{artist}</strong>
        </div>
      );
    }
    if (track.type === 'Original') {
      return (
        <div style={{ fontSize: 16, marginTop: 12, color: '#bbb', textAlign: 'center' }}>
          Original Song
        </div>
      );
    }
    if (track.type === 'Polka Medley') {
      return (
        <div style={{ fontSize: 16, marginTop: 12, color: '#bbb', textAlign: 'center' }}>
          Polka Medley
          <button
            style={{ marginLeft: 12, padding: '2px 10px', borderRadius: 6, background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}
            onClick={() => setShowPolkaSongs(s => !s)}
          >
            {showPolkaSongs ? 'Hide Songs' : 'Show Songs'}
          </button>
          {showPolkaSongs && track.featuredSongs && track.featuredSongs.length > 0 && (
            <ul style={{ marginTop: 10, paddingLeft: 0, listStyle: 'none', textAlign: 'center' }}>
              {track.featuredSongs.map((song: string, idx: number) => (
                <li key={idx} style={{ color: '#eee', fontSize: 15, marginBottom: 2 }}>{song}</li>
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
        ) : !track || !matchedTrack ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>No track currently playing or no match found in discography.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {track.artworkUrl && (
              <img
                src={track.artworkUrl}
                alt={matchedTrack.title}
                style={{ width: 180, height: 180, borderRadius: 16, objectFit: 'cover', marginBottom: 24, boxShadow: '0 2px 12px #0008' }}
              />
            )}
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{matchedTrack.title}</h2>
            <p style={{ fontSize: 20, marginBottom: 4, textAlign: 'center', color: '#bbb' }}>{matchedTrack.album?.title}</p>
            {getTypeDisplay(matchedTrack)}
          </div>
        )}
        {error && <div style={{ color: '#ff6b6b', marginTop: 16, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  );
} 