// GET /spotify - log in to Spotify so workers/spotify can scrape Liked Songs.
//
// With no ?code it redirects to Spotify; Spotify sends you back here with one
// (this URL is the app's redirect URI). The refresh token goes into the R2
// state.json the worker reads, then the first scrape runs straight away.
//
// SPOTIFY_USER_ID (me) lands on /music/. Anyone else gets their own files
// under users/<id>/ - so they can't touch mine - and a heatmap at
// /api/heatmap/<id>.svg.
import { z } from "zod";
import { sync, MINE, account, files, getJSON, SPOTIFY_ID } from "../workers/spotify/src/index.js";

// Spotify sends far more than the id; only the id is kept
const Me = z.object({ id: z.string().regex(SPOTIFY_ID) });

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

  const meRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { authorization: `Bearer ${token.access_token}` },
  });
  // while the Spotify app is in development mode, only accounts added under
  // User Management in its dashboard get past here
  if (!meRes.ok) {
    return text(`Spotify wouldn't share your account (${meRes.status}). Ask Max to add your Spotify account to the app.`, 403);
  }
  const me = Me.safeParse(await meRes.json());
  if (!me.success) return text("Spotify sent back an account id this site can't use.", 502);
  const { id } = me.data;

  const mine = id === env.SPOTIFY_USER_ID;
  const acct = mine ? MINE : account(id);
  const f = files(acct);
  const state = (await getJSON(env, f.state)) ?? {};
  state.refresh_token = token.refresh_token;
  await env.SPOTIFY.put(f.state, JSON.stringify(state));

  try {
    await sync(env, acct);
  } catch (e) {
    return text(`Logged in, but the first scrape failed (the next one will retry): ${e.message}`, 502);
  }
  const clear = { "set-cookie": "spotify_state=; Path=/spotify; Max-Age=0" };
  if (mine) return new Response(null, { status: 302, headers: { location: "/music/", ...clear } });

  const svg = `${url.origin}/api/heatmap/${id}.svg`;
  return new Response(
    `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your Spotify heatmap</title>
<body style="font-family: Inconsolata, Menlo, monospace; max-width: 720px; margin: 2em auto; padding: 0 16px; color: #3a3a3a">
<h1 style="font-weight: lighter; color: #bc2122">Your Spotify heatmap</h1>
<p>Public at <a href="${svg}">${svg}</a> and updated once a day. Big libraries fill in over a few hours.</p>
<p><img src="${svg}" alt="Spotify likes heatmap" style="max-width: 100%"></p>
<p>To embed it in a GitHub README:</p>
<pre style="white-space: pre-wrap; background: #e3e3e3; padding: 8px">![My Spotify likes](${svg})</pre>
</body>`,
    { headers: { "content-type": "text/html; charset=utf-8", ...clear } }
  );
}

const text = (body, status) =>
  new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } });
