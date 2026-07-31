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

Posts with `draft = true` are skipped.

## Deploying

Cloudflare Pages, building from `master`:

- **Build command:** `npm run build`
- **Output directory:** `dist`

`/cv` serves the CV pdf inline — that's the generated `dist/_redirects`.

## CSS

`static/css/style.css` is compiled from the sass next to it:

```bash
sass --watch static/css/style.sass:static/css/style.css
```
