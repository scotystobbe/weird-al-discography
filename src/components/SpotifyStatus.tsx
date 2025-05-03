import { useSpotifyAuth } from "../hooks/useSpotifyAuth";

export default function SpotifyStatus() {
  const { token, login } = useSpotifyAuth();

  return (
    <div className="p-4">
      {!token ? (
        <button onClick={login} className="bg-green-500 text-white px-4 py-2 rounded">
          Connect Spotify
        </button>
      ) : (
        <p>Spotify connected!</p>
      )}
    </div>
  );
}
