// Likes-per-week heatmap: a row per year, a square per week. Shared by /music/
// (static/js/tracks.js draws it as HTML) and /api/heatmap/<id>.svg
// (functions/api/heatmap/[id].js draws it with heatmapSvg below).

const YEARS = 10; // at most
const DAY_MS = 24 * 60 * 60 * 1000;
// week w of a year starts on day 7w, so Dec 31 (day 364, or 365 in a leap
// year) lands in week 52
export const WEEKS = Math.floor(365 / 7) + 1;

// none, then the site's $red from faint to full
export const SHADES = [
  "rgba(58, 58, 58, .08)",
  "rgba(188, 33, 34, .3)",
  "rgba(188, 33, 34, .55)",
  "rgba(188, 33, 34, .8)",
  "rgb(188, 33, 34)",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// UTC, the same as the "liked" dates on /music/
export function day(date) {
  const d = new Date(date);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// "2026-09-27T08:41:10Z" -> "2026-09-27", the UTC day
export const dayKey = (iso) => iso.split("T")[0];
const weekOfYear = (date) => Math.floor((date - Date.UTC(date.getUTCFullYear(), 0, 1)) / DAY_MS / 7);
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function streaks(days, today) {
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const k of Object.keys(days).sort()) {
    const t = Date.parse(k);
    run = prev !== null && t - prev === DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }

  // a streak isn't broken until today ends without a like
  let d = days[dayKey(today.toISOString())] ? today : new Date(today - DAY_MS);
  let current = 0;
  while (days[dayKey(d.toISOString())]) {
    current++;
    d = new Date(d - DAY_MS);
  }
  return { current, longest };
}

// addedAts: when each song was liked, as ISO timestamps.
// Returns the summary line and, newest year first, a row of WEEKS cells:
// { shade, title, from, to } for each week so far (from/to are its first and
// last day, as "YYYY-MM-DD"), null for weeks still to come.
export function heatmap(addedAts, now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const thisYear = today.getUTCFullYear();
  // no rows for the years before the first like
  const oldest = addedAts.reduce((min, a) => (a < min ? a : min), today.toISOString());
  const firstYear = Math.max(thisYear - YEARS + 1, new Date(oldest).getUTCFullYear());

  // count by day with string keys, then parse each day once: far cheaper than
  // a Date per like, which matters under the 10ms CPU limit
  const days = {};
  for (const a of addedAts) {
    const k = dayKey(a);
    days[k] = (days[k] ?? 0) + 1;
  }
  const weeks = {};
  for (const [k, n] of Object.entries(days)) {
    const d = new Date(k);
    if (d.getUTCFullYear() < firstYear) continue;
    const w = `${d.getUTCFullYear()}-${weekOfYear(d)}`;
    weeks[w] = (weeks[w] ?? 0) + n;
  }

  // shade by where a week sits among the weeks with likes, like GitHub does,
  // so one huge week doesn't wash out the rest
  const shown = Object.values(weeks).sort((a, b) => a - b);
  const top = SHADES.length - 1;
  const shades = new Map();
  shown.forEach((n, i) => shades.set(n, Math.ceil((top * (i + 1)) / shown.length)));
  const shade = (n) => shades.get(n) ?? 0;

  const years = [];
  for (let y = thisYear; y >= firstYear; y--) {
    const cells = [];
    for (let w = 0; w < WEEKS; w++) {
      const start = new Date(Date.UTC(y, 0, 1 + 7 * w));
      if (start > today) {
        cells.push(null);
        continue;
      }
      const end = new Date(Math.min(+start + 6 * DAY_MS, Date.UTC(y, 11, 31)));
      const n = weeks[`${y}-${w}`] ?? 0;
      const when = +end === +start ? day(start) : `${day(start)} – ${day(end)}`;
      cells.push({
        shade: shade(n),
        title: `${plural(n, "like")}, ${when}`,
        from: dayKey(start.toISOString()),
        to: dayKey(end.toISOString()),
      });
    }
    years.push({ year: y, cells });
  }

  const s = streaks(days, today);
  const total = shown.reduce((a, b) => a + b, 0);
  return {
    summary: `${plural(total, "like")} since ${firstYear} · ${s.current} day streak · longest ${s.longest}`,
    years,
  };
}

// ---------------------------------------------------------------- svg

const CELL = 10;
const GAP = 2;
const LABEL = 34; // room for the year
const WORD = 30; // room for "Less" and "More" either side of the legend
const LINE = 20; // a line of text, above and below the grid
const FONT = `font-family="Inconsolata, Menlo, monospace" font-size="11" fill="#636363"`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function heatmapSvg({ summary, years }, title) {
  const label = esc(`${title}: ${summary}`);
  const step = CELL + GAP;
  const width = LABEL + WEEKS * step - GAP;
  const gridTop = LINE;
  const height = gridTop + years.length * step - GAP + LINE;

  const rows = years.map(({ year, cells }, r) => {
    const y = gridTop + r * step;
    const squares = cells
      .map((c, w) =>
        c ? `<rect x="${LABEL + w * step}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${SHADES[c.shade]}"><title>${c.title}</title></rect>` : ""
      )
      .join("");
    return `<text x="0" y="${y + CELL - 1}" ${FONT}>${year}</text>${squares}`;
  });

  // right-aligned under the grid: Less [shades] More
  const legendY = height - CELL;
  const legendX = width - WORD - SHADES.length * step;
  const legend = SHADES.map(
    (fill, i) => `<rect x="${legendX + i * step}" y="${legendY}" width="${CELL}" height="${CELL}" rx="2" fill="${fill}"/>`
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
<title>${label}</title>
<text x="0" y="${LINE - 8}" ${FONT}>${summary}</text>
${rows.join("\n")}
<text x="${legendX - 4}" y="${legendY + CELL - 1}" text-anchor="end" ${FONT}>Less</text>${legend}<text x="${width}" y="${legendY + CELL - 1}" text-anchor="end" ${FONT}>More</text>
</svg>`;
}
