// Daily scrape of my Spotify Liked Songs into R2.
//
// Writes two objects to the SPOTIFY bucket:
//   tracks.json - public, served by functions/api/tracks.js
//   state.json  - private: the refresh token (put there by functions/spotify.js
//                 when I log in at /spotify) and any half-done rescan
//
// Free Workers get 50 subrequests and 10ms of CPU per run, and parsing
// Spotify's pages is what eats the CPU. So instead of re-reading the whole
// library every day:
//   1. read from the newest end until we hit a track we already have
//   2. if the count then matches Spotify's total, that's it (the normal case)
//   3. otherwise something was un-liked, so rescan everything - resuming on
//      the next run if the library is too big to read in one go

// market= swaps each track's and album's ~185-country available_markets list
// for one is_playable flag, which cuts a page from ~160KB to ~65KB
const LIKED = "https://api.spotify.com/v1/me/tracks?limit=50&market=from_token";
// 1,000 tracks a run: ~3ms of JSON.parse on an M-series Mac, so room to spare
// under 10ms on Cloudflare's slower cores. Bigger rescans carry on next run.
const MAX_PAGES = 20;

export default {
  async scheduled(_event, env) {
    await sync(env);
  },

  // `wrangler dev --test-scheduled` then hit /__scheduled to run it by hand
  async fetch() {
    return new Response("not found", { status: 404 });
  },
};

export async function sync(env) {
  const state = (await getJSON(env, "state.json")) ?? {};
  const current = await getJSON(env, "tracks.json");
  let pages = 0;

  try {
    const token = await accessToken(env, state);
    const page = async (url) => {
      pages++;
      return spotify(url, token);
    };

    if (!state.rescan && current) {
      const known = new Set(current.tracks.map(key));
      const fresh = [];
      let url = LIKED;
      let total;
      let caughtUp = false;

      while (url && !caughtUp && pages < MAX_PAGES) {
        const res = await page(url);
        total = res.total;
        for (const item of res.items) {
          const t = slim(item);
          if (known.has(key(t))) {
            caughtUp = true;
            break;
          }
          fresh.push(t);
        }
        url = res.next;
      }

      const merged = [...fresh, ...current.tracks];
      if ((caughtUp || !url) && merged.length === total) {
        if (fresh.length) await save(env, merged);
        console.log(`${fresh.length} new, ${total} total`);
        return;
      }
      console.log(`have ${merged.length}, spotify says ${total} - rescanning`);
    }

    state.rescan ??= { next: LIKED, tracks: [] };
    while (state.rescan.next && pages < MAX_PAGES) {
      const res = await page(state.rescan.next);
      state.rescan.tracks.push(...res.items.map(slim));
      state.rescan.next = res.next;
    }

    if (state.rescan.next) {
      console.log(`rescan paused at ${state.rescan.tracks.length} tracks, continuing next run`);
    } else {
      // items shift if I like/unlike mid-rescan, which can repeat one
      const seen = new Set();
      const tracks = state.rescan.tracks.filter((t) => !seen.has(key(t)) && seen.add(key(t)));
      await save(env, tracks);
      delete state.rescan;
      console.log(`rescanned ${tracks.length} tracks`);
    }
  } finally {
    // keep the (possibly rotated) refresh token and rescan progress even if
    // Spotify errored part way through
    await env.SPOTIFY.put("state.json", JSON.stringify(state));
  }
}

// ------------------------------------------------------------------ spotify

async function accessToken(env, state) {
  const refresh = state.refresh_token;
  if (!refresh) throw new Error("no refresh token - log in at https://max.me.uk/spotify");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
  });
  if (!res.ok) throw new Error(`token refresh: ${res.status} ${await res.text()}`);

  const body = await res.json();
  // Spotify sometimes rotates it; the old one then stops working
  state.refresh_token = body.refresh_token ?? refresh;
  return body.access_token;
}

async function spotify(url, token) {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text()}`);
  return res.json();
}

// Only what the page shows - the full track object is ~4KB, mostly markets.
function slim({ added_at, track: t }) {
  // images come largest first; the last is the 64px thumbnail
  const images = t.album?.images ?? [];
  return {
    added_at,
    id: t.id,
    uri: t.uri,
    name: t.name,
    url: t.external_urls?.spotify ?? null,
    artists: (t.artists ?? []).map((a) => a.name),
    album: t.album?.name ?? null,
    image: images.at(-1)?.url ?? null,
    duration_ms: t.duration_ms,
  };
}

// local files have no id, so key on uri; added_at so a re-like counts as new
const key = (t) => `${t.added_at}|${t.uri}`;

// --------------------------------------------------------------------- r2

async function getJSON(env, name) {
  const obj = await env.SPOTIFY.get(name);
  return obj ? obj.json() : null;
}

async function save(env, tracks) {
  const body = { updated_at: new Date().toISOString(), total: tracks.length, tracks };
  await env.SPOTIFY.put("tracks.json", JSON.stringify(body), {
    httpMetadata: { contentType: "application/json" },
  });
}
