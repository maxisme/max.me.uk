// GET /api/heatmap/<spotify id>.svg - a Spotify likes heatmap as an image, for
// anyone who has logged in at /spotify. Drawn by static/js/heatmap.js from the
// likes.json that workers/spotify writes.
import { z } from "zod";
import { heatmap, heatmapSvg } from "../../../static/js/heatmap.js";
import { MINE, account, files, SPOTIFY_ID } from "../../../workers/spotify/src/index.js";

const SVG = ".svg";
const Path = z
  .string()
  .refine((p) => p.endsWith(SVG) && SPOTIFY_ID.test(p.slice(0, -SVG.length)))
  .transform((p) => p.slice(0, -SVG.length));

export async function onRequestGet({ params, env, request, waitUntil }) {
  const id = Path.safeParse(params.id);
  if (!id.success) return new Response("not found", { status: 404 });

  // drawing it costs CPU, and it only changes once a day
  const cache = caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;

  const acct = id.data === env.SPOTIFY_USER_ID ? MINE : account(id.data);
  const obj = await env.SPOTIFY.get(files(acct).likes);
  if (!obj) {
    return new Response(`No heatmap for ${id.data} - log in at https://max.me.uk/spotify to make one.`, {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const svg = heatmapSvg(heatmap(await obj.json()), `Spotify likes of ${id.data}`);
  const res = new Response(svg, {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
  waitUntil(cache.put(request, res.clone()));
  return res;
}
