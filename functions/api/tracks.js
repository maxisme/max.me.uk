// GET /api/tracks - my Spotify Liked Songs, as scraped daily by
// workers/spotify into the R2 bucket bound here as SPOTIFY.
export async function onRequestGet({ env, request }) {
  const obj = await env.SPOTIFY.get("tracks.json", { onlyIf: request.headers });
  if (!obj) {
    return Response.json({ updated_at: null, total: 0, tracks: [] }, { status: 404 });
  }

  const headers = new Headers({
    "content-type": "application/json",
    etag: obj.httpEtag,
    // it only changes once a day
    "cache-control": "public, max-age=3600",
  });

  // onlyIf matched the browser's If-None-Match: no body
  if (!("body" in obj)) return new Response(null, { status: 304, headers });
  return new Response(obj.body, { headers });
}
