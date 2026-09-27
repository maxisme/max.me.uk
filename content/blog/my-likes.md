+++
date = 2026-09-27T00:00:00Z
meta_description = "How the Spotify Liked Songs page on this site runs on Cloudflare's free tier."
tags = ["Cloudflare", "Spotify"]
title = "My Likes"

+++
Every song I have liked on Spotify is now on [/music](/music/) - newest first, with a heatmap of how many I have liked each week. It updates once a day.

## How it works (tldr)

It all runs on Cloudflare's free tier:

* **Scraping** - a cron [Worker](https://developers.cloudflare.com/workers/) runs every hour. At 9am (UTC) it pages through my library with Spotify's `GET /v1/me/tracks` (50 songs a request). Free Workers only get 50 outbound requests and 10ms of CPU a run, so it reads from the newest end and stops at the first song it already has - normally one request. It also asks for `market=from_token`, which drops the list of ~185 countries each song is available in and makes each page less than half the size to parse. If the count then doesn't match Spotify's total (I un-liked something) it re-reads the whole library, carrying on each hour if it takes more than one run.
* **Storage** - one `tracks.json` in an [R2](https://developers.cloudflare.com/r2/) bucket. R2 is the cheapest storage Cloudflare has, and one small file a day doesn't cost anything anyway.
* **Serving** - the site is on Cloudflare Pages, so a Pages Function at `/api/tracks` reads the file from the same bucket and a bit of JS renders it on [/music](/music/).
* **History** - a GitHub Action checks `/api/tracks` every hour and commits it to the repo as [data/tracks.json](https://github.com/maxisme/max.me.uk/blob/master/data/tracks.json) whenever it has changed.
* **Logging in** - `/spotify` is the Spotify app's callback. It saves the refresh token into the bucket for the Worker. Anyone else who logs in gets their own folder in the bucket (`users/<id>/`), so they can't touch mine.

## Get your own heatmap

Log in at [/spotify](/spotify) and you get your likes as an SVG at `https://max.me.uk/api/heatmap/<your spotify id>.svg`, updated once a day - handy for a GitHub README. The Worker syncs everyone else in the hours between mine, a few accounts a run, and only keeps when and what you liked (not the song names).

While the Spotify app is in development mode Spotify only lets accounts I have added log in, so message me first.

## tracks.json

Spotify's full track object is ~4KB (mostly the list of countries it's available in) so the Worker only keeps what [/music](/music/) shows - about 300 bytes a song:

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
