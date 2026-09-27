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
| `functions/`       | Pages Functions: `/api/tracks`, `/spotify` login  |
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
   redirect URI `https://max.me.uk/spotify`.
2. Create the bucket, set the worker's secrets and deploy it:
   ```bash
   cd workers/spotify
   npx wrangler r2 bucket create spotify-tracks
   npx wrangler secret put SPOTIFY_CLIENT_ID
   npx wrangler secret put SPOTIFY_CLIENT_SECRET
   npx wrangler deploy
   ```
3. In the Pages project:
   - **Settings → Bindings → Add → R2 bucket**: variable `SPOTIFY`, bucket
     `spotify-tracks`.
   - **Settings → Variables and Secrets**: `SPOTIFY_CLIENT_ID` and
     `SPOTIFY_CLIENT_SECRET` (as secrets), and `SPOTIFY_USER_ID` - your
     Spotify username. Don't know it? Leave it out, and step 4 will tell you.
   - Redeploy the site.
4. Open <https://max.me.uk/spotify> and log in. That saves the refresh token
   to the bucket, runs the first scrape and drops you on `/music/`. Do the
   same if the token ever stops working.

`/spotify` only keeps the token for `SPOTIFY_USER_ID`, so nobody else can
swap their library in.

`npm run serve` has no `/api/tracks`; to see the page with data locally use
`npx wrangler pages dev dist --r2 SPOTIFY=spotify-tracks`.

## CSS

`static/css/style.css` is compiled from the sass next to it:

```bash
sass --watch static/css/style.sass:static/css/style.css
```
