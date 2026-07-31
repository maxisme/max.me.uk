#!/usr/bin/env node
// Static site build. Replaces Hugo.
//
//   node build.mjs        -> writes dist/
//   node build.mjs --serve -> writes dist/ and serves it on :1313
//
// Reads content/*.md (TOML front matter), renders with the templates in
// templates.mjs, copies static/ over the top.

import { readFile, readdir, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { createServer } from "node:http";
import { join, extname } from "node:path";
import { createReadStream } from "node:fs";
import { parse as parseToml } from "smol-toml";
import { marked } from "marked";

import config from "./site.config.mjs";
import * as T from "./templates.mjs";

const OUT = "dist";

// ------------------------------------------------------------------ content

// Front matter is TOML fenced by +++. The body is normally empty because
// Forestry stashed the markdown in a `content` key instead; fall back to the
// body for anything written the normal way.
async function readContent(path) {
  const raw = await readFile(path, "utf8");
  const m = raw.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${path}: no +++ TOML front matter`);
  const data = parseToml(m[1]);
  const body = (data.content ?? "").trim() || m[2].trim();
  return { ...data, body };
}

async function loadPosts() {
  const files = (await readdir("content/blog")).filter(
    (f) => f.endsWith(".md") && f !== "_index.md"
  );

  const posts = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const data = await readContent(join("content/blog", file));
    if (data.draft) continue; // Hugo excluded drafts from production builds
    const url = `/blog/${slug}/`;
    posts.push({
      ...data,
      slug,
      url,
      permalink: `${config.baseURL}${url}`,
      date: data.date instanceof Date ? data.date.toISOString() : String(data.date),
      html: marked.parse(data.body),
    });
  }

  // newest first, matching Hugo's default page ordering
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

// -------------------------------------------------------------------- write

async function emit(path, contents) {
  const full = join(OUT, path);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, contents);
}

async function build() {
  const home = await readContent("content/_index.md");
  const posts = await loadPosts();

  const ctx = (page) => ({ page, home, posts });

  // home
  await emit("index.html", T.homePage(ctx({ isHome: true, title: "", url: "/" })));

  // blog list
  await emit(
    "blog/index.html",
    // content/blog/_index.md is empty, so Hugo gave this page no title and the
    // <title> fell through to the site name. Kept as-is.
    T.listPage(ctx({ isHome: false, title: "", url: "/blog/", permalink: `${config.baseURL}/blog/` }), {
      heading: "Blog Posts",
      items: posts,
    })
  );

  // posts
  for (const post of posts) {
    await emit(`blog/${post.slug}/index.html`, T.postPage(ctx({ ...post, isHome: false })));
  }

  // tags
  const byTag = new Map();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push(post);
    }
  }

  const tagUrls = [];
  for (const [tag, tagged] of [...byTag].sort(([a], [b]) => a.localeCompare(b))) {
    const url = `/tags/${T.urlize(tag)}/`;
    tagUrls.push(url);
    // Hugo lowercases a taxonomy term to key it, then title-cases it for
    // display - so `ssh` renders "Ssh", `CLI` renders "Cli", `GitHub` "Github".
    const display = T.titleCase(tag.toLowerCase());
    await emit(
      `tags/${T.urlize(tag)}/index.html`,
      T.listPage(ctx({ isHome: false, title: display, url, permalink: `${config.baseURL}${url}` }), {
        heading: display,
        sub: `Blog posts tagged with "${display}"`,
        items: tagged,
      })
    );
  }

  // tag index
  await emit(
    "tags/index.html",
    // Hugo rendered the taxonomy index through the same tag template, so it
    // gets the same "Blog posts tagged with ..." subheading and an empty list.
    T.listPage(ctx({ isHome: false, title: "Tags", url: "/tags/", permalink: `${config.baseURL}/tags/` }), {
      heading: "Tags",
      sub: `Blog posts tagged with "Tags"`,
      items: [],
    })
  );

  await emit("404.html", T.notFoundPage(ctx({ isHome: false, title: "404", url: "/404.html", permalink: `${config.baseURL}/404.html` })));
  await emit("index.xml", T.rss({ posts }));
  await emit("sitemap.xml", T.sitemap({ urls: ["/", "/blog/", ...posts.map((p) => p.url), "/tags/", ...tagUrls] }));

  // /cv and /cv/ render the CV pdf inline (this used to live in nginx.conf,
  // which Cloudflare Pages never reads).
  await emit("_redirects", "/cv    /cv/max-mitchell-cv.pdf    200\n");

  // static assets last so they win any name clash
  await cp("static", OUT, { recursive: true });

  console.log(`built ${posts.length} posts + ${tagUrls.length} tag pages -> ${OUT}/`);
}

await rm(OUT, { recursive: true, force: true });
await build();

// ------------------------------------------------------------------- serve

if (process.argv.includes("--serve")) {
  const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".xml": "application/xml",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".pdf": "application/pdf",
    ".ico": "image/x-icon",
    ".ttf": "font/ttf",
  };

  createServer((req, res) => {
    let path = decodeURIComponent(req.url.split("?")[0]);
    if (path === "/cv" || path === "/cv/") path = "/cv/max-mitchell-cv.pdf";
    if (path.endsWith("/")) path += "index.html";

    const file = join(OUT, path);
    const stream = createReadStream(file);
    stream.on("open", () => {
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
      stream.pipe(res);
    });
    stream.on("error", () => {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      createReadStream(join(OUT, "404.html")).pipe(res);
    });
  }).listen(1313, () => console.log("http://localhost:1313"));
}
