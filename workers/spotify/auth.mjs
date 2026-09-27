#!/usr/bin/env node
// One-off: log in to Spotify and print a refresh token for the worker.
//
//   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node auth.mjs
//
// The Spotify app needs http://127.0.0.1:8888/callback as a redirect URI.

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET");
  process.exit(1);
}

const redirect = "http://127.0.0.1:8888/callback";
const state = randomBytes(16).toString("hex");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== "/callback") return res.writeHead(404).end();

  if (url.searchParams.get("state") !== state) return res.writeHead(400).end("state mismatch");
  const code = url.searchParams.get("code");
  if (!code) return res.writeHead(400).end(url.searchParams.get("error") ?? "no code");

  const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirect }),
  }).then((r) => r.json());

  if (!token.refresh_token) {
    res.writeHead(500).end("no refresh token - see terminal");
    console.error(token);
  } else {
    res.end("Done - back to the terminal.");
    console.log(`\nrefresh token:\n\n${token.refresh_token}\n`);
    console.log("next: npx wrangler secret put SPOTIFY_REFRESH_TOKEN");
  }
  server.close();
});

server.listen(8888, "127.0.0.1", () => {
  const auth = new URL("https://accounts.spotify.com/authorize");
  auth.search = new URLSearchParams({
    response_type: "code",
    client_id: id,
    scope: "user-library-read",
    redirect_uri: redirect,
    state,
  });
  console.log(`open this and log in:\n\n${auth}\n`);
});
