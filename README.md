# max.me.uk

Static site. No framework, no Hugo — `build.mjs` reads the markdown in
`content/` and writes plain HTML to `dist/`.

```bash
npm install
npm run serve   # build + serve on http://localhost:1313
npm run build   # build only, into dist/
```

## Layout

| Path               | What it is                                        |
| ------------------ | ------------------------------------------------- |
| `content/`         | Markdown + TOML front matter (the actual content) |
| `templates.mjs`    | The HTML                                          |
| `build.mjs`        | Turns one into the other                          |
| `site.config.mjs`  | Title, base URL, Disqus shortname                 |
| `static/`          | CSS, JS, images, the CV pdf — copied as-is        |
| `functions/`       | Cloudflare Pages Functions (just `/api/tracks`)   |
| `workers/spotify/` | Daily Spotify Liked Songs scraper                 |

Posts with `draft = true` are skipped.

## Deploying

Cloudflare Pages, building from `master`:

- **Build command:** `npm run build`
- **Output directory:** `dist`

`/cv` serves the CV pdf inline — that's the generated `dist/_redirects`.

## Liked Songs (`/music/`)

A Worker in `workers/spotify/` runs once a day, pages through
`GET /v1/me/tracks`, and writes a trimmed `tracks.json` to an R2 bucket. The
Pages Function `functions/api/tracks.js` serves it at `/api/tracks`, and
`static/js/tracks.js` renders it on `/music/`.

R2 because it's the cheapest Cloudflare storage — and at one small JSON file
and a write a day, it sits well inside the free tier anyway.

One-time setup:

1. Create a Spotify app at <https://developer.spotify.com/dashboard> with
   redirect URI `http://127.0.0.1:8888/callback`.
2. Get a refresh token:
   ```bash
   cd workers/spotify
   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node auth.mjs
   ```
3. Create the bucket, set the secrets and deploy:
   ```bash
   npx wrangler r2 bucket create spotify-tracks
   npx wrangler secret put SPOTIFY_CLIENT_ID
   npx wrangler secret put SPOTIFY_CLIENT_SECRET
   npx wrangler secret put SPOTIFY_REFRESH_TOKEN
   npx wrangler deploy
   ```
4. In the Pages project: **Settings → Bindings → Add → R2 bucket**, variable
   name `SPOTIFY`, bucket `spotify-tracks`. Redeploy the site.

The first scrape happens on the next cron (04:17 UTC). To run it now against
the real bucket, put the three secrets in `workers/spotify/.dev.vars`
(`KEY=value` lines, gitignored), then:

```bash
npx wrangler dev --remote --test-scheduled
curl localhost:8787/__scheduled
```

Re-running `auth.mjs` and updating `SPOTIFY_REFRESH_TOKEN` replaces the
token the worker has saved.

`npm run serve` has no `/api/tracks`; to see the page with data locally use
`npx wrangler pages dev dist --r2 SPOTIFY=spotify-tracks`.

## CSS

`static/css/style.css` is compiled from the sass next to it:

```bash
sass --watch static/css/style.sass:static/css/style.css
```
