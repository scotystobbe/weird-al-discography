import { useEffect, useRef, useState, useCallback } from "react";

interface SpotifyPlayerTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumArt: string;
  durationMs: number;
  positionMs: number;
  isPlaying: boolean;
}

interface UseSpotifyPlayer {
  player: any;
  track: SpotifyPlayerTrack | null;
  isReady: boolean;
  error: string | null;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

// Add minimal Spotify namespace for type safety
// You can replace 'any' with the official types if you install @types/spotify-web-playback-sdk
// declare global {
//   namespace Spotify {
//     interface Player {}
//   }
// }

export function useSpotifyPlayer(token: string | null): UseSpotifyPlayer {
  const [player, setPlayer] = useState<any>(null);
  const [track, setTrack] = useState<SpotifyPlayerTrack | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  // Dynamically load the SDK script
  useEffect(() => {
    if (window.Spotify) return;
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize the player
  useEffect(() => {
    if (!token) return;
    if (!window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady = () => initPlayer();
      return;
    }
    initPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const initPlayer = useCallback(() => {
    if (!token || !window.Spotify) return;
    if (playerRef.current) return;
    const _player = new window.Spotify.Player({
      name: "Weird Al Discography Player",
      getOAuthToken: (cb: any) => cb(token),
      volume: 0.8,
    });
    playerRef.current = _player;
    setPlayer(_player);

    _player.addListener("ready", ({ device_id }: any) => {
      setIsReady(true);
      setError(null);
      // Optionally transfer playback here
    });
    _player.addListener("not_ready", () => {
      setIsReady(false);
    });
    _player.addListener("initialization_error", ({ message }: any) => {
      setError("Spotify SDK init error: " + message);
    });
    _player.addListener("authentication_error", ({ message }: any) => {
      setError("Spotify SDK auth error: " + message);
    });
    _player.addListener("account_error", ({ message }: any) => {
      setError("Spotify SDK account error: " + message);
    });
    _player.addListener("player_state_changed", (state: any) => {
      if (!state || !state.track_window.current_track) {
        setTrack(null);
        return;
      }
      const t = state.track_window.current_track;
      setTrack({
        id: t.id,
        name: t.name,
        artists: t.artists.map((a: any) => a.name).join(", "),
        album: t.album.name,
        albumArt: t.album.images[0]?.url ?? "",
        durationMs: t.duration_ms,
        positionMs: state.position,
        isPlaying: !state.paused,
      });
    });
    _player.connect();
  }, [token]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, []);

  return { player, track, isReady, error };
} 