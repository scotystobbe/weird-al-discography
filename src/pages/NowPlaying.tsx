import React, { useEffect, useState, useCallback, useRef } from "react";
import useSWR from 'swr';

export default function NowPlaying() {
  const [error, setError] = useState('');
  const [track, setTrack] = useState<any>(null); // Spotify track
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const lastTrackId = useRef<string | null>(null);

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
        if (isInitial) setInitialLoading(false);
        return;
      }
      setTrack(data);
      lastTrackId.current = data.id;
      if (isInitial) setInitialLoading(false);
    } catch (err: any) {
      setError('Failed to fetch currently playing track.');
      if (isInitial) setInitialLoading(false);
    }
  }, []);

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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{track.title}</h2>
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
        )}
        {error && <div style={{ color: '#ff6b6b', marginTop: 16, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  );
} 