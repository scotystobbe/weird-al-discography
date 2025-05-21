import React, { useEffect, useState, useCallback, useRef } from "react";
import useSWR from 'swr';

function EditableStarRating({ rating, onRatingChange, size = 32 }: any) {
  return (
    <div style={{ display: 'flex', gap: 8, margin: '16px 0', justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ fontSize: size, cursor: 'pointer', color: star <= rating ? '#FFD700' : '#CCC' }}
          onClick={() => {
            if (star === 1 && rating === 1) {
              onRatingChange(null);
            } else {
              onRatingChange(star);
            }
          }}
        >
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

export default function NowPlaying() {
  const [error, setError] = useState('');
  const [track, setTrack] = useState<any>(null);
  const [dbSong, setDbSong] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const lastTrackId = useRef<string | null>(null);
  const [prevTrack, setPrevTrack] = useState<any>(null);
  const [prevDbSong, setPrevDbSong] = useState<any>(null);

  // SWR for songs
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: songs = [], mutate: mutateSongs } = useSWR('/api/songs', fetcher, {
    dedupingInterval: 3600000, // 1 hour
    revalidateOnFocus: false,
  });

  // Helper to check auth and fetch currently playing
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
      if (!data || data.playing === false || !data.item) {
        if (isInitial) setTrack(null);
        if (isInitial) setDbSong(null);
        if (isInitial) setInitialLoading(false);
        return;
      }
      // Only update if the track has changed
      if (lastTrackId.current !== data.item.id) {
        if (editingNotes) {
          // Don't update if editing notes
          return;
        }
        setPrevTrack(track);
        setPrevDbSong(dbSong);
        setTrack(data.item);
        lastTrackId.current = data.item.id;
        // Use SWR-cached songs
        const match = songs.find((s: any) => s.spotifyLink && s.spotifyLink.includes(data.item.id));
        setDbSong(match || null);
        setNotes(match?.notes || '');
        setEditingNotes(false);
      }
      if (isInitial) setInitialLoading(false);
    } catch (err: any) {
      setError('Failed to fetch currently playing track.');
      if (isInitial) setInitialLoading(false);
    }
  }, [editingNotes, track, dbSong, songs]);

  useEffect(() => {
    fetchCurrentlyPlaying(true);
    const interval = setInterval(() => fetchCurrentlyPlaying(false), 5000);
    return () => clearInterval(interval);
  }, [fetchCurrentlyPlaying]);

  const handleConnect = () => {
    window.location.href = '/api/spotify-proxy/login';
  };

  const handleRatingChange = async (newRating: number | null) => {
    if (!dbSong) return;
    setDbSong({ ...dbSong, rating: newRating });
    try {
      await fetch('/api/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dbSong.id, rating: newRating }),
      });
      mutateSongs();
    } catch (err) {
      setError('Could not save rating.');
    }
  };

  const handleNoteSave = async () => {
    if (!dbSong) return;
    setSaving(true);
    setError('');
    try {
      await fetch('/api/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dbSong.id, notes }),
      });
      setDbSong({ ...dbSong, notes });
      setEditingNotes(false);
      mutateSongs();
    } catch (err) {
      setError('Could not save notes.');
    } finally {
      setSaving(false);
    }
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
          <p style={{ textAlign: 'center', color: '#aaa' }}>No track currently playing.</p>
        ) : dbSong ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {dbSong.artworkUrl && (
              <img src={dbSong.artworkUrl} alt={dbSong.title} style={{ width: 224, height: 224, borderRadius: 16, objectFit: 'cover', marginBottom: 24 }} />
            )}
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{dbSong.title}</h2>
            <p style={{ fontSize: 22, marginBottom: 4, textAlign: 'center' }}>{dbSong.artist}</p>
            <p style={{ fontSize: 16, marginBottom: 12, textAlign: 'center', color: '#bbb' }}>{dbSong.album || track?.album?.name}</p>
            <EditableStarRating rating={dbSong.rating} onRatingChange={handleRatingChange} size={40} />
            <div
              style={{ background: '#18181b', borderRadius: 8, padding: 16, width: '100%', minHeight: 60, marginTop: 8, color: '#fff', cursor: editingNotes ? 'auto' : 'text' }}
              onClick={() => !editingNotes && setEditingNotes(true)}
            >
              {editingNotes ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 4, background: '#232326', color: '#fff', border: '1px solid #333', minHeight: 60 }}
                    autoFocus
                  />
                  <button
                    onClick={handleNoteSave}
                    style={{ alignSelf: 'flex-end', padding: '4px 16px', background: '#333', color: '#fff', borderRadius: 4, border: 'none', cursor: 'pointer' }}
                    disabled={saving}
                  >{saving ? 'Saving...' : 'Save'}</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <p style={{ whiteSpace: 'pre-wrap', flex: 1, color: dbSong.notes ? '#fff' : '#aaa' }}>{dbSong.notes || <em>No notes</em>}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
        {error && <div style={{ color: '#ff6b6b', marginTop: 16, textAlign: 'center' }}>{error}</div>}
      </div>
      {/* Previous Song Card */}
      {prevDbSong && prevTrack && !editingNotes && (
        <div style={{ position: 'fixed', left: '50%', bottom: 32, transform: 'translateX(-50%)', background: '#232326', borderRadius: 12, boxShadow: '0 2px 8px #0008', padding: 12, minWidth: 220, minHeight: 48, zIndex: 100 }}>
          <div style={{ textAlign: 'center', fontWeight: 600, color: '#bbb' }}>{prevDbSong.title}</div>
          <div style={{ textAlign: 'center', fontSize: 14, color: '#aaa' }}>{prevDbSong.artist}</div>
          <EditableStarRating
            rating={typeof prevDbSong.rating === 'number' ? prevDbSong.rating : 0}
            onRatingChange={async (newRating: number | null) => {
              setPrevDbSong({ ...prevDbSong, rating: newRating });
              await fetch('/api/songs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: prevDbSong.id, rating: newRating }),
              });
            }}
            size={28}
          />
        </div>
      )}
    </div>
  );
} 