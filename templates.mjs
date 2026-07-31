// HTML templates. Straight port of the old layouts/ Hugo templates.
import config from "./site.config.mjs";

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// "my-macos-setup" -> matches Hugo's urlize for our tag set
export const urlize = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Hugo's `| title` filter, which defaults to AP style: capitalise each word
// except short function words, unless they are first or last. Existing capitals
// are left alone so "MacOS", "CLI" and "GitHub" survive.
const SMALL_WORDS = new Set(
  ("a an and are as at be but by en for if in is it nor not of on or per so " +
   "the to v v. via vs vs. from into than that with").split(" ")
);

export const titleCase = (s) => {
  const words = String(s).split(/(\s+)/); // keep the whitespace runs
  const lastIdx = words.length - 1;
  return words
    .map((w, i) => {
      if (!w.trim()) return w;
      if (i !== 0 && i !== lastIdx && SMALL_WORDS.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("");
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// Hugo's dateFormat "Monday, Jan 2, 2006"
export const formatDate = (d) => {
  const dt = new Date(d);
  return `${DAYS[dt.getUTCDay()]}, ${MONTHS[dt.getUTCMonth()].slice(0, 3)} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
};

// ---------------------------------------------------------------- head/header

function head({ page, home }) {
  const isHome = page.isHome;
  const desc = page.meta_description || home.meta?.description || "";
  const title = page.title ? `${esc(page.title)} | Max Mitchell` : "Maximilian Mitchell";

  const social = isHome ? "" : `
    <!-- Open Graph data -->
    <meta property="og:title" content="${esc(page.title)}"/>
    <meta property="og:type" content="article"/>
    <meta property="og:article:published_time" content="${esc(page.date ?? "")}"/>
    <meta property="og:article:section" content="Technology"/>
    <meta property="og:url" content="${esc(page.permalink)}"/>
${(page.tags ?? []).map((t) => `    <meta property="og:article:tag" content="${esc(t)}"/>`).join("\n")}
${page.image ? `    <meta property="og:image" content="${esc(config.baseURL)}${esc(page.image)}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="627"/>` : ""}
    <meta property="og:description" content="${esc(page.meta_description ?? "")}"/>
    <meta property="og:site_name" content="max.me.uk"/>
    <meta property="og:locale" content="en_GB"/>

    <!-- Twitter Card data -->
    <meta name="twitter:site" content="@maxisme">
    <meta name="twitter:creator" content="@maxisme">`;

  return `<!DOCTYPE html>
<html lang="en-gb">
<head>
    <meta name="description" content="${esc(desc)}">
    <title>${title}</title>
    <meta charset="UTF-8">
${social}

    <!-- mobile meta -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>

    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="preload stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@200;400;600;900&display=swap" rel="preload stylesheet">

    <!-- favicon -->
    <link rel="shortcut icon" href="/images/ico.svg">

    <!-- css -->
    <link rel="stylesheet" href="/css/materialize.min.css">
    <link rel="stylesheet" href="/css/style.css">
</head>`;
}

const toolList = (tools = []) =>
  tools
    .map(
      (t) => `                <div class="row valign-wrapper">
                    <div class="col"><i class="ico ${esc(t.devicon)}"></i></div>
                    <div class="col valign">${esc(t.languages_or_tool)}</div>
                </div>`
    )
    .join("\n");

function sidebar({ page, home, posts }) {
  const showFull = page.isHome; // the old templates keyed off `.Params.projects`

  const projects = !showFull ? "" : `
        <h2>Selected Projects</h2>
${(home.projects ?? [])
  .map((p) => {
    const favicon = p.ico_url || `${p.url}/images/icon.ico`;
    return `        <div class="row valign-wrapper">
            <div class="col valign"><a target="_blank" href="${esc(p.url)}"><img class="ico" src="${esc(favicon)}"></a></div>
            <div class="col valign"><a class="valign" target="_blank" href="${esc(p.url)}">${esc(p.name)}</a></div>
        </div>`;
  })
  .join("\n")}`;

  // home shows the 3 newest posts then a "More..." link; other pages show all
  const shown = showFull ? posts.slice(0, 3) : posts;
  const postLinks =
    shown.map((p) => `        <li><a href="${esc(p.permalink)}">${esc(titleCase(p.title))}</a></li>`).join("\n") +
    (showFull && posts.length >= 4 ? `\n        <li><a href="/blog/">More...</a></li>` : "");

  const details = !showFull ? "" : `
        <h2>My areas of expertise</h2>
        <p>${esc(home.areas_of_expertise)}</p>
        <h2>My extra areas of interest</h2>
        <p>${esc(home.extra_areas_of_interest)}</p>

        <h2>Languages &amp; Tools I'm good with</h2>
        <div class="good">
${toolList(home.good_tools)}
        </div>

        <h2>Languages &amp; Tools I know</h2>
        <div class="average">
${toolList(home.know_tools)}
        </div>

        <h2>Languages &amp; Tools I'm learning</h2>
        <div class="learning">
${toolList(home.learning_tools)}
        </div>

        <h2>Languages &amp; Tools I'm not good with</h2>
        <div>
${toolList(home.bad_tools)}
        </div>

        <h2>Other ways to come here</h2>
        <div class="domains">
${(home.maxdomains ?? []).map((d) => `            <a target="_blank" href="https://${esc(d)}/">${esc(d)}</a>`).join("\n")}
        </div>
        <h2>More domains</h2>
        <div class="domains">
${(home.domains ?? []).map((d) => `            <a target="_blank" href="https://${esc(d)}/">${esc(d)}</a>`).join("\n")}
        </div>
        <p>&nbsp;</p>
        <hr>
        ${home.blurb ?? ""}
        <p>&nbsp;</p>`;

  const postPaneOpen = page.isHome
    ? ""
    : `
    <!--- blog post -->
    <div id="post" class="col l8 offset-l4 m12 s12">
        <a href="#" class="top-nav sidenav-trigger full hide-on-large-only">
            <i class="material-icons menu">menu</i>
        </a>`;

  return `<body>
<div class="full-image">
    <div id='newim' class='full-image'></div>
</div>
<div class="row all-content">
    <div id="sidebar" class="col ${showFull ? "l4 m7 s12" : "slide-in-on-mobile-blog l4 s8"} sidebar">
        <div align="center">
            <h1><a href="/">Maximilian<br>Mitchell </a></h1>
        </div>
        <p class="info">${esc(home.description)}</p>
        <div class="row">
            <a class="col s6" href="mailto:max@max.me.uk"><img class="ico" src="/images/mail_animated.svg"><br>Email</a>
            <a class="col s6" target="_blank" href="https://github.com/maxisme"><img class="ico" src="/images/github_animated.svg"><br>GitHub</a>
        </div>
        <div class="row">
            <a class="col s6" target="_blank" href="https://www.linkedin.com/in/maxisme"><img class="ico" src="/images/linkedin_animated.svg"><br>Linked In</a>
            <a class="col s6" target="_blank" href="https://stackoverflow.com/story/maxisme"><img class="ico" src="/images/stackoverflow_animated.svg"><br>StackOverflow</a>
        </div>
${projects}

        <h2><a href="/blog/">Blog Posts</a></h2>
${postLinks}
${details}
    </div>${postPaneOpen}`;
}

function footer() {
  return `</div></div>
<script src="/js/jquery-3.2.1.js"></script>

<!-- materialize -->
<script src="/js/materialize.min.js"></script>

<!-- descrambler -->
<script src="/js/descrambler.js"></script>

<!-- cookie -->
<script src="/js/jquery.cookie.min.js"></script>

<!-- devicon. Note: static/css/devicon.min.css exists but is unusable - it wants
     fonts/devicon.* which were never vendored - so this stays on the CDN.
     cdn.rawgit.com is retired but still 301s to jsdelivr and serves fine. -->
<link rel="stylesheet" href="//cdn.rawgit.com/konpa/devicon/6910f0503efdd315c8f9b858234310c06e04d9c0/devicon.min.css">

<script src="/js/script.js"></script>
<script src="/js/js-noisy-gradient.js"></script>

</body>
</html>`;
}

const shell = (ctx, body) => `${head(ctx)}
${sidebar(ctx)}
${body}
${footer()}`;

// ------------------------------------------------------------------- pages

export function homePage(ctx) {
  return shell(ctx, `
<!-- NFC animation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
<div id="nfc">
    <img class="nfc-image" src="/images/RED.svg">
</div>`);
}

export function listPage(ctx, { heading, sub, items }) {
  return shell(ctx, `
<div align="center">
    <h1 class="list-header">${esc(heading)}</h1>
    ${sub ? `<sub>${esc(sub)}</sub>` : "<p>&nbsp;</p>"}
</div>
<div class="post-list">
${items
  .map(
    (p) => `    <li>
        <a href="${esc(p.permalink)}">${esc(titleCase(p.title))}</a>
        <br>${formatDate(p.date)}
    </li>`
  )
  .join("\n")}
</div>`);
}

export function postPage(ctx) {
  const { page } = ctx;
  const url = `${config.baseURL}${page.url}`;
  return shell(ctx, `
<!-- code block highlighting -->
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.0/styles/default.min.css">
<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.0/highlight.min.js"></script>
<script>hljs.initHighlightingOnLoad();</script>

<div class="center">
    <title class="center">${esc(page.title)}</title>
${page.banner ? `    <div class="banner"><img alt="banner image" src="${esc(page.banner)}"></div>` : ""}
    <div class="date">${formatDate(page.date)}</div>
    <div class="tags">
${(page.tags ?? [])
  .map((t) => `        <div class="tag-wrapper"><div class="tag"><a href="/tags/${urlize(t)}/">${esc(t)}</a></div></div>`)
  .join("\n")}
    </div>
</div>

<div class="content">
${page.html}
    <div class="tilde center">~</div>

    <div id="post-content" class="share centre">
        Share the ️💻
        <div class="center">
            <a target="_blank" href="https://www.facebook.com/sharer.php?u=${esc(url)}&amp;p[title]=${esc(page.title)}"><img alt="fb logo" src="/images/social/fb.svg"/></a>
            <a target="_blank" href="https://twitter.com/share?text=${esc(page.title)}&amp;url=${esc(url)}"><img alt="twitter logo" src="/images/social/tw.svg"/></a>
            <a target="_blank" href="https://www.linkedin.com/sharing/share-offsite/?url=${esc(url)}"><img alt="linkedin logo" src="/images/social/li.svg"/></a>
        </div>
    </div>

    <div class="centre tilde">~</div>
</div>

<div id="disqus_thread"></div>
<script type="application/javascript">
    var disqus_config = function () {
        this.page.url = ${JSON.stringify(url)};
        this.page.identifier = ${JSON.stringify(page.url)};
    };
    (function () {
        var d = document, s = d.createElement('script');
        s.src = 'https://${config.disqusShortname}.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
<a href="https://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>`);
}

export function notFoundPage(ctx) {
  return shell(ctx, `
<div align="center">
    <h1 class="list-header">404</h1>
    <p>That page doesn't exist. <a href="/">Head home</a>.</p>
</div>`);
}

export function rss({ posts }) {
  return `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(config.title)}</title>
    <link>${config.baseURL}/</link>
    <description>Recent content on ${esc(config.title)}</description>
    <generator>max.me.uk build</generator>
    <language>${config.languageCode}</language>
    <atom:link href="${config.baseURL}/index.xml" rel="self" type="application/rss+xml"/>
${posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${config.baseURL}${p.url}</link>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <guid>${config.baseURL}${p.url}</guid>
      <description>${esc(p.meta_description ?? "")}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;
}

export function sitemap({ urls }) {
  return `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${config.baseURL}${u}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}
