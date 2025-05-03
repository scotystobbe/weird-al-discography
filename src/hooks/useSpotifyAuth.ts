import { useEffect, useState } from "react";
import {
  SPOTIFY_CLIENT_ID,
  REDIRECT_URI,
  SCOPES,
  generateCodeChallenge,
  generateRandomString,
} from "../lib/spotifyAuth";

export function useSpotifyAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      const verifier = localStorage.getItem("spotify_code_verifier");
      if (!verifier) return;

      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        }),
      })
        .then(async res => {
          const responseText = await res.text(); // read raw response
          console.log("Spotify token response:", responseText); // 🔍 LOG THIS
          return JSON.parse(responseText);
        })
        .then(data => {
          if (data.access_token) {
            setToken(data.access_token);
            localStorage.setItem("spotify_access_token", data.access_token);
            window.history.replaceState({}, "", "/");
          } else {
            console.error("Token exchange failed:", data);
          }
        });
    } else {
      const saved = localStorage.getItem("spotify_access_token");
      if (saved) setToken(saved);
    }
  }, []);

  const login = async () => {
    const verifier = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem("spotify_code_verifier", verifier);

    const url = new URL("https://accounts.spotify.com/authorize");
    url.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("scope", SCOPES.join(" "));
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", challenge);

    console.log("Redirecting to Spotify:", url.toString());
    window.location.href = url.toString();
  };

  return { token, login };
}
