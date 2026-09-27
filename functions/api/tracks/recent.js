// GET /api/tracks/recent - the newest few Liked Songs, for the strip on /blog/.
// A slice of the same tracks.json as /api/tracks, so the blog page doesn't
// download the whole library.
const RECENT = 5;

export async function onRequestGet({ env }) {
  const obj = await env.SPOTIFY.get("tracks.json");
  if (!obj) return Response.json({ tracks: [] }, { status: 404 });

  const { tracks } = await obj.json();
  return Response.json(
    { tracks: tracks.slice(0, RECENT) },
    // it only changes once a day
    { headers: { "cache-control": "public, max-age=3600" } }
  );
}
