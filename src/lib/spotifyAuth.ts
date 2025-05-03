export const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
export const REDIRECT_URI = "https://weird-al-discography.vercel.app/callback";
export const SCOPES = ["user-read-playback-state", "user-read-currently-playing"];

function base64encode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64encode(digest);
}

export function generateRandomString(length: number) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length })
    .map(() => possible[Math.floor(Math.random() * possible.length)])
    .join("");
}

/**
 * Wrapper for Spotify API fetch that handles 401 (expired token) and triggers re-auth.
 * @param url Spotify API endpoint
 * @param token Access token
 * @param onAuthError Callback to trigger re-auth prompt
 * @param options Additional fetch options
 */
export async function fetchSpotifyApi(url: string, token: string, onAuthError: () => void, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    onAuthError();
    throw new Error("Spotify token expired");
  }
  return res;
}
