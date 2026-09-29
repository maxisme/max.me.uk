// Daily scrape of Spotify Liked Songs into R2: mine, and those of anyone else
// who logs in at /spotify for a heatmap.
//
// Each account has three objects in the SPOTIFY bucket (see files()):
//   tracks.json - the songs, newest like first. Mine are served whole by
//                 functions/api/tracks.js; everyone else's only keep when and
//                 what they liked. Songs since un-liked stay, with unliked_at.
//   likes.json  - just the added_at dates, for functions/api/heatmap/[id].js
//   state.json  - private: the refresh token (put there by functions/spotify.js
//                 at login), any half-done rescan, and when it last synced
//
// Free Workers get 50 subrequests and 10ms of CPU per run, and parsing
// Spotify's pages is what eats the CPU. So instead of re-reading the whole
// library every day:
//   1. read from the newest end until we hit a track we already have
//   2. if the count then matches Spotify's total, that's it (the normal case)
//   3. otherwise something was un-liked, so rescan everything - resuming on
//      the next run if the library is too big to read in one go - and mark
//      what's gone with unliked_at

// market= swaps each track's and album's ~185-country available_markets list
// for one is_playable flag, which cuts a page from ~160KB to ~65KB
const LIKED = "https://api.spotify.com/v1/me/tracks?limit=50&market=from_token";
// 1,000 tracks a run: ~3ms of JSON.parse on an M-series Mac, so room to spare
// under 10ms on Cloudflare's slower cores. Bigger rescans carry on next run.
const MAX_PAGES = 20;
// The cron runs hourly. Mine syncs at this hour (UTC); everyone else syncs in
// the other hours, a few a run, as parsing each library costs CPU too.
const MY_HOUR = 9;
const MAX_ACCOUNTS = 3;

// Spotify ids are lowercase letters and digits; old usernames can have . _ -
export const SPOTIFY_ID = /^[A-Za-z0-9._-]{1,64}$/;

// Mine live at the top of the bucket; anyone else's under users/<id>/.
export const MINE = { prefix: "", slim };
export const account = (id) => ({ prefix: `users/${id}/`, slim: bare });
export const files = ({ prefix }) => ({
  state: `${prefix}state.json`,
  tracks: `${prefix}tracks.json`,
  likes: `${prefix}likes.json`,
});

export default {
  async scheduled(event, env) {
    const now = new Date(event.scheduledTime);
    const mine = (await getJSON(env, files(MINE).state)) ?? {};
    // a rescan of mine carries on every hour until it's done
    if (now.getUTCHours() === MY_HOUR || mine.rescan) {
      await sync(env, MINE);
      return;
    }
    await syncOthers(env, now);
  },

  // `wrangler dev --test-scheduled` then hit /__scheduled to run it by hand
  async fetch() {
    return new Response("not found", { status: 404 });
  },
};

// Everyone who has logged in and hasn't synced today (UTC) or is part way
// through a rescan, longest-waiting first, sharing one run's page budget.
async function syncOthers(env, now) {
  const listed = await env.SPOTIFY.list({ prefix: "users/", delimiter: "/" });
  const ids = listed.delimitedPrefixes.map((p) => p.split("/")[1]);
  const today = now.toISOString().split("T")[0];

  const due = [];
  for (const id of ids) {
    const state = (await getJSON(env, files(account(id)).state)) ?? {};
    if (state.rescan || !state.synced_at?.startsWith(today)) due.push({ id, synced: state.synced_at ?? "" });
  }
  due.sort((a, b) => a.synced.localeCompare(b.synced));

  const budget = { pages: MAX_PAGES };
  for (const { id } of due.slice(0, MAX_ACCOUNTS)) {
    if (!budget.pages) break;
    try {
      await sync(env, account(id), budget);
    } catch (e) {
      console.log(`${id}: ${e.message}`);
    }
  }
}

export async function sync(env, acct, budget = { pages: MAX_PAGES }) {
  const f = files(acct);
  const state = (await getJSON(env, f.state)) ?? {};
  const current = await getJSON(env, f.tracks);
  const save = (tracks) => saveTracks(env, f, tracks);

  try {
    const token = await accessToken(env, state);
    const page = async (url) => {
      budget.pages--;
      return spotify(url, token);
    };

    if (!state.rescan && current) {
      const liked = current.tracks.filter((t) => !t.unliked_at);
      const known = new Set(liked.map(key));
      const fresh = [];
      let url = LIKED;
      let total;
      let caughtUp = false;

      while (url && !caughtUp && budget.pages > 0) {
        const res = await page(url);
        total = res.total;
        for (const item of res.items) {
          const t = acct.slim(item);
          if (known.has(key(t))) {
            caughtUp = true;
            break;
          }
          fresh.push(t);
        }
        url = res.next;
      }

      if ((caughtUp || !url) && fresh.length + liked.length === total) {
        // likes.json is newer than some tracks.json, so write it if missing
        if (fresh.length || !(await env.SPOTIFY.head(f.likes))) await save([...fresh, ...current.tracks]);
        console.log(`${fresh.length} new, ${total} total`);
        return;
      }
      console.log(`have ${fresh.length + liked.length}, spotify says ${total} - rescanning`);
    }

    state.rescan ??= { next: LIKED, tracks: [] };
    while (state.rescan.next && budget.pages > 0) {
      const res = await page(state.rescan.next);
      state.rescan.tracks.push(...res.items.map(acct.slim));
      state.rescan.next = res.next;
    }

    if (state.rescan.next) {
      console.log(`rescan paused at ${state.rescan.tracks.length} tracks, continuing next run`);
    } else {
      // items shift if I like/unlike mid-rescan, which can repeat one
      const seen = new Set();
      const tracks = state.rescan.tracks.filter((t) => !seen.has(key(t)) && seen.add(key(t)));
      // unliked_at is when a rescan first found it gone, not when I un-liked
      // it. A song that rescan skipped (items shifting again) is marked too,
      // but then the counts are off, the next run rescans, and finding it
      // there drops the marked copy.
      const now = new Date().toISOString();
      const unliked = (current?.tracks ?? [])
        .filter((t) => !seen.has(key(t)))
        .map((t) => (t.unliked_at ? t : { ...t, unliked_at: now }));
      const all = [...tracks, ...unliked].sort((a, b) => b.added_at.localeCompare(a.added_at));
      await save(all);
      delete state.rescan;
      console.log(`rescanned ${tracks.length} tracks, ${unliked.length} unliked`);
    }
  } finally {
    // keep the (possibly rotated) refresh token and rescan progress even if
    // Spotify errored part way through. synced_at counts failed tries too, so
    // a revoked login is retried daily rather than hourly.
    state.synced_at = new Date().toISOString();
    await env.SPOTIFY.put(f.state, JSON.stringify(state));
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

// Everyone else's: only what the heatmap and key() need.
function bare({ added_at, track: t }) {
  return { added_at, uri: t.uri };
}

// local files have no id, so key on uri; added_at so a re-like counts as new
const key = (t) => `${t.added_at}|${t.uri}`;

// --------------------------------------------------------------------- r2

export async function getJSON(env, name) {
  const obj = await env.SPOTIFY.get(name);
  return obj ? obj.json() : null;
}

async function saveTracks(env, f, tracks) {
  // total is what's still liked, to match Spotify's count
  const total = tracks.filter((t) => !t.unliked_at).length;
  const body = { updated_at: new Date().toISOString(), total, tracks };
  const json = { httpMetadata: { contentType: "application/json" } };
  await env.SPOTIFY.put(f.tracks, JSON.stringify(body), json);
  await env.SPOTIFY.put(f.likes, JSON.stringify(tracks.map((t) => t.added_at)), json);
}
