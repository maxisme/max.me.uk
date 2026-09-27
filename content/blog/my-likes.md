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

As usual the code is all in my [repo](https://github.com/maxisme/max.me.uk) - `workers/spotify/` and `functions/`.
