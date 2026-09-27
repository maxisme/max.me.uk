// Renders /music/ from /api/tracks: a likes heatmap and every song.
// See functions/api/tracks.js.
import { heatmap, day, dayKey, SHADES, WEEKS } from "/js/heatmap.js";

const status = document.getElementById("tracks-status");
const list = document.getElementById("tracks-list");
const filter = document.getElementById("tracks-filter");
const box = document.getElementById("likes-graph");
const grid = box.querySelector(".likes-grid");
const tip = box.querySelector(".likes-tip");
const picked = box.querySelector(".likes-picked");

function el(tag, attrs, text) {
  const e = document.createElement(tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
}

function row(t) {
  const li = el("li");
  li.appendChild(el("img", { src: t.image || "/images/ico.svg", alt: "", loading: "lazy", width: 64, height: 64 }));

  const text = el("div", { class: "track-text" });
  const name = t.url
    ? el("a", { href: t.url, target: "_blank", rel: "noopener" }, t.name)
    : el("span", { class: "track-name" }, t.name);
  text.appendChild(name);
  text.appendChild(el("span", { class: "track-by" }, t.artists.join(", ") + (t.album ? " — " + t.album : "")));
  text.appendChild(el("span", { class: "track-added" }, "liked " + day(t.added_at)));
  li.appendChild(text);

  li.dataset.search = [t.name, t.artists.join(" "), t.album].join(" ").toLowerCase();
  li.dataset.day = dayKey(t.added_at);
  return li;
}

// ------------------------------------------------------------ filtering

let week = null; // the heatmap square clicked, if any

function applyFilter() {
  const q = filter.value.trim().toLowerCase();
  let shown = 0;
  for (const li of list.children) {
    const inWeek = !week || (li.dataset.day >= week.dataset.from && li.dataset.day <= week.dataset.to);
    li.hidden = !inWeek || (q && !li.dataset.search.includes(q));
    if (!li.hidden) shown++;
  }
  if (week) picked.firstChild.textContent = `${week.dataset.title} · showing ${shown} · `;
  picked.hidden = !week;
}

// clicking the picked square again clears it
function pick(cell) {
  week?.classList.remove("picked");
  week = cell === week ? null : cell;
  week?.classList.add("picked");
  applyFilter();
}

// -------------------------------------------------------------- heatmap

function graph(tracks) {
  const h = heatmap(tracks.map((t) => t.added_at));

  grid.style.gridTemplateColumns = `auto repeat(${WEEKS}, 1fr)`;
  for (const { year, cells } of h.years) {
    grid.appendChild(el("span", { class: "likes-year" }, String(year)));
    for (const c of cells) {
      if (!c) {
        grid.appendChild(el("i", { class: "future" }));
        continue;
      }
      const i = el("i", { "data-title": c.title, "data-from": c.from, "data-to": c.to });
      i.style.background = SHADES[c.shade];
      grid.appendChild(i);
    }
  }

  const legend = box.querySelector(".likes-legend");
  for (const fill of SHADES) {
    const i = el("i");
    i.style.background = fill;
    legend.insertBefore(i, legend.lastElementChild);
  }

  // shows straight away, unlike a title attribute
  grid.addEventListener("mouseover", (e) => {
    const cell = e.target.closest("i[data-title]");
    if (!cell) return;
    tip.textContent = cell.dataset.title;
    tip.hidden = false;
    const b = box.getBoundingClientRect();
    const c = cell.getBoundingClientRect();
    // centred over the square, but kept inside the heatmap
    const left = c.left - b.left + c.width / 2 - tip.offsetWidth / 2;
    tip.style.left = `${Math.max(0, Math.min(left, b.width - tip.offsetWidth))}px`;
    tip.style.top = `${c.top - b.top - tip.offsetHeight - 4}px`;
  });
  grid.addEventListener("mouseleave", () => (tip.hidden = true));
  grid.addEventListener("click", (e) => {
    const cell = e.target.closest("i[data-title]");
    if (cell) pick(cell);
  });
  picked.querySelector("button").addEventListener("click", () => pick(week));

  box.querySelector(".likes-summary").textContent = h.summary;
  grid.setAttribute("aria-label", h.summary);
  box.hidden = false;
}

fetch("/api/tracks")
  .then((res) => {
    if (!res.ok) throw new Error(res.status);
    return res.json();
  })
  .then((data) => {
    const frag = document.createDocumentFragment();
    data.tracks.forEach((t) => frag.appendChild(row(t)));
    list.appendChild(frag);
    graph(data.tracks);

    status.textContent = `${data.total} songs, newest first · updated ${day(data.updated_at)}`;
    filter.hidden = false;
    filter.addEventListener("input", applyFilter);
  })
  .catch(() => {
    status.textContent = "Couldn't load the songs right now.";
  });
