// GET /spotify - log in to Spotify so workers/spotify can scrape Liked Songs.
//
// With no ?code it redirects to Spotify; Spotify sends me back here with one
// (this URL is the app's redirect URI). The refresh token goes into the R2
// state.json the worker reads, then the first scrape runs straight away.
//
// Anyone can open this page, so the token is only kept if the account is
// SPOTIFY_USER_ID - otherwise someone could swap in their own library.
import { sync } from "../workers/spotify/src/index.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const redirect = `${url.origin}/spotify`;

  const error = url.searchParams.get("error");
  if (error) return text(`Spotify said: ${error}`, 400);

  const code = url.searchParams.get("code");
  if (!code) {
    const state = crypto.randomUUID();
    const auth = new URL("https://accounts.spotify.com/authorize");
    auth.search = new URLSearchParams({
      response_type: "code",
      client_id: env.SPOTIFY_CLIENT_ID,
      scope: "user-library-read",
      redirect_uri: redirect,
      state,
    });
    return new Response(null, {
      status: 302,
      headers: {
        location: auth.toString(),
        "set-cookie": `spotify_state=${state}; Path=/spotify; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  const cookie = request.headers.get("cookie")?.match(/(?:^|;\s*)spotify_state=([^;]+)/)?.[1];
  if (!cookie || cookie !== url.searchParams.get("state")) {
    return text("Login expired or didn't start here - try /spotify again.", 400);
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirect }),
  });
  if (!res.ok) return text(`Token exchange failed: ${res.status} ${await res.text()}`, 502);
  const token = await res.json();

  const me = await fetch("https://api.spotify.com/v1/me", {
    headers: { authorization: `Bearer ${token.access_token}` },
  }).then((r) => r.json());

  if (!env.SPOTIFY_USER_ID) {
    return text(`Logged in as "${me.id}". Set SPOTIFY_USER_ID to that in the Pages project, redeploy, then open /spotify again.`, 403);
  }
  if (me.id !== env.SPOTIFY_USER_ID) return text("Not the Spotify account this site shows.", 403);

  const obj = await env.SPOTIFY.get("state.json");
  const state = obj ? await obj.json() : {};
  state.refresh_token = token.refresh_token;
  await env.SPOTIFY.put("state.json", JSON.stringify(state));

  try {
    await sync(env);
  } catch (e) {
    return text(`Logged in, but the first scrape failed (the daily one will retry): ${e.message}`, 502);
  }
  return new Response(null, {
    status: 302,
    headers: { location: "/music/", "set-cookie": "spotify_state=; Path=/spotify; Max-Age=0" },
  });
}

const text = (body, status) =>
  new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } });
