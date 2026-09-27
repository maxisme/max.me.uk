+++
date = 2026-09-27T00:00:00Z
meta_description = "Every song I've liked on Spotify, updated daily - and a tldr of how it runs on Cloudflare."
redirect = "/music/"
tags = ["Cloudflare", "Spotify"]
title = "My Likes"

+++
Every song I have liked on Spotify, newest first. It updates once a day.

## How it works (tldr)

It all runs on Cloudflare's free tier:

* **Scraping** - a cron [Worker](https://developers.cloudflare.com/workers/) runs at 9am (UTC) every day and pages through Spotify's `GET /v1/me/tracks` (50 songs a request). Free Workers only get 50 outbound requests a run, so it reads from the newest end and stops at the first song it already has - normally one request. If the count then doesn't match Spotify's total (I un-liked something) it re-reads the whole library, spread over a few days if it has to.
* **Storage** - one `tracks.json` in an [R2](https://developers.cloudflare.com/r2/) bucket. R2 is the cheapest storage Cloudflare has, and one small file a day doesn't cost anything anyway.
* **Serving** - the site is on Cloudflare Pages, so a Pages Function at `/api/tracks` reads the file from the same bucket and a bit of JS renders it below.
* **Logging in** - `/spotify` is the Spotify app's callback. It saves the refresh token into the bucket for the Worker, but only for my Spotify account, so nobody else can swap their library in.

## tracks.json

Spotify's full track object is ~4KB (mostly the list of countries it's available in) so the Worker only keeps what this page shows - about 300 bytes a song:

```json
{
  "updated_at": "2026-09-27T09:00:03.412Z",
  "total": 553,
  "tracks": [
    {
      "added_at": "2026-09-27T08:41:10Z",
      "id": "4uLU6hMCjMI75M1A2tKUQC",
      "uri": "spotify:track:4uLU6hMCjMI75M1A2tKUQC",
      "name": "Windowlicker",
      "url": "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
      "artists": ["Aphex Twin"],
      "album": "Windowlicker",
      "image": "https://i.scdn.co/image/...",
      "duration_ms": 367000
    }
  ]
}
```

* `tracks` is newest first, in Spotify's order. `added_at` is when I liked it, which is what the heatmap counts.
* `id` and `url` are `null` for local files, so the Worker matches songs on `added_at` + `uri` instead (which also means un-liking and re-liking a song counts as a new like).
* `image` is the smallest (64px) album cover.
* `updated_at` only changes when there is something new, not on every run.

The bucket has one other file, `state.json`, which isn't public - it holds the Spotify refresh token and, if a full re-read is part way through, the page to carry on from the next day.

As usual the code is all in my [repo](https://github.com/maxisme/max.me.uk) - `workers/spotify/` and `functions/`.
