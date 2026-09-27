// Renders /music/ from /api/tracks: a likes heatmap and every song.
// See functions/api/tracks.js.
(function () {
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function day(iso) {
    var d = new Date(iso);
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function row(t) {
    var li = el("li");
    li.appendChild(el("img", { src: t.image || "/images/ico.svg", alt: "", loading: "lazy", width: 64, height: 64 }));

    var text = el("div", { class: "track-text" });
    var name = t.url
      ? el("a", { href: t.url, target: "_blank", rel: "noopener" }, t.name)
      : el("span", { class: "track-name" }, t.name);
    text.appendChild(name);
    text.appendChild(el("span", { class: "track-by" }, t.artists.join(", ") + (t.album ? " — " + t.album : "")));
    text.appendChild(el("span", { class: "track-added" }, "liked " + day(t.added_at)));
    li.appendChild(text);

    li.dataset.search = [t.name, t.artists.join(" "), t.album].join(" ").toLowerCase();
    return li;
  }

  function load(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    });
  }

  function fill(list, tracks) {
    var frag = document.createDocumentFragment();
    tracks.forEach(function (t) { frag.appendChild(row(t)); });
    list.appendChild(frag);
  }

  // ---------------------------------------------------- likes heatmap

  var YEARS = 10; // at most
  var DAY_MS = 24 * 60 * 60 * 1000;
  // week w of a year starts on day 7w, so Dec 31 (day 364, or 365 in a leap
  // year) lands in week 52
  var WEEKS = Math.floor(365 / 7) + 1;

  // UTC days, the same as the "liked" dates in the list
  function dayKey(date) {
    return date.toISOString().split("T")[0];
  }

  function weekOfYear(date) {
    return Math.floor((date - Date.UTC(date.getUTCFullYear(), 0, 1)) / DAY_MS / 7);
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  function streaks(counts, today) {
    var days = Object.keys(counts).sort();
    var longest = 0;
    var run = 0;
    var prev = null;
    days.forEach(function (k) {
      var t = Date.parse(k);
      run = prev !== null && t - prev === DAY_MS ? run + 1 : 1;
      longest = Math.max(longest, run);
      prev = t;
    });

    // a streak isn't broken until today ends without a like
    var d = counts[dayKey(today)] ? today : new Date(today - DAY_MS);
    var current = 0;
    while (counts[dayKey(d)]) {
      current++;
      d = new Date(d - DAY_MS);
    }
    return { current: current, longest: longest };
  }

  function graph(tracks) {
    var box = document.getElementById("likes-graph");
    var grid = box.querySelector(".likes-grid");
    var top = box.querySelectorAll(".likes-legend i").length - 1;

    var now = new Date();
    var today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    var thisYear = today.getUTCFullYear();
    // no rows for the years before my first like
    var oldest = tracks.reduce(function (min, t) { return t.added_at < min ? t.added_at : min; }, today.toISOString());
    var firstYear = Math.max(thisYear - YEARS + 1, new Date(oldest).getUTCFullYear());

    var days = {};
    var weeks = {};
    tracks.forEach(function (t) {
      var d = new Date(t.added_at);
      var k = dayKey(d);
      days[k] = (days[k] || 0) + 1;
      if (d.getUTCFullYear() < firstYear) return;
      var w = d.getUTCFullYear() + "-" + weekOfYear(d);
      weeks[w] = (weeks[w] || 0) + 1;
    });

    // shade by where a week sits among the weeks with likes, like GitHub
    // does, so one huge week doesn't wash out the rest
    var shown = Object.keys(weeks).map(function (w) { return weeks[w]; });
    function level(n) {
      if (!n) return 0;
      var atOrBelow = shown.filter(function (m) { return m <= n; }).length;
      return Math.ceil((top * atOrBelow) / shown.length);
    }

    grid.style.gridTemplateColumns = "auto repeat(" + WEEKS + ", 1fr)";
    for (var y = thisYear; y >= firstYear; y--) {
      grid.appendChild(el("span", { class: "likes-year" }, String(y)));
      for (var w = 0; w < WEEKS; w++) {
        var start = new Date(Date.UTC(y, 0, 1 + 7 * w));
        if (start > today) {
          grid.appendChild(el("i", { class: "future" }));
          continue;
        }
        var end = new Date(Math.min(+start + 6 * DAY_MS, Date.UTC(y, 11, 31)));
        var n = weeks[y + "-" + w] || 0;
        var when = +end === +start ? day(start) : day(start) + " – " + day(end);
        grid.appendChild(el("i", { class: "l" + level(n), title: plural(n, "like") + ", " + when }));
      }
    }

    var s = streaks(days, today);
    var total = shown.reduce(function (a, b) { return a + b; }, 0);
    var summary = plural(total, "like") + " since " + firstYear + " · " + s.current + " day streak · longest " + s.longest;
    box.querySelector(".likes-summary").textContent = summary;
    grid.setAttribute("aria-label", summary);
    box.hidden = false;
  }

  var list = document.getElementById("tracks-list");
  if (list) {
    var status = document.getElementById("tracks-status");
    var filter = document.getElementById("tracks-filter");
    load("/api/tracks")
      .then(function (data) {
        fill(list, data.tracks);
        graph(data.tracks);
        status.textContent = data.total + " songs, newest first · updated " + day(data.updated_at);
        filter.hidden = false;
        filter.addEventListener("input", function () {
          var q = filter.value.trim().toLowerCase();
          for (var i = 0; i < list.children.length; i++) {
            var li = list.children[i];
            li.hidden = q && li.dataset.search.indexOf(q) === -1;
          }
        });
      })
      .catch(function () {
        status.textContent = "Couldn't load the songs right now.";
      });
  }
})();
