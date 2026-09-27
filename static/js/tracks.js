// Renders /music/ from /api/tracks: a likes-per-day heatmap and every song.
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

  // --------------------------------------------- likes-per-day heatmap

  var WEEKS = 53; // a year, ending this week; narrow screens clip the oldest
  var DAY_MS = 24 * 60 * 60 * 1000;

  // UTC days, the same as the "liked" dates in the list
  function dayKey(date) {
    return date.toISOString().split("T")[0];
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

    var counts = {};
    tracks.forEach(function (t) {
      var k = dayKey(new Date(t.added_at));
      counts[k] = (counts[k] || 0) + 1;
    });

    var now = new Date();
    var today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    var firstSunday = new Date(today - (today.getUTCDay() + (WEEKS - 1) * 7) * DAY_MS);

    // shade by where a day sits among the days with likes, like GitHub does,
    // so one huge day doesn't wash out the rest
    var shown = [];
    for (var d = firstSunday; d <= today; d = new Date(+d + DAY_MS)) {
      if (counts[dayKey(d)]) shown.push(counts[dayKey(d)]);
    }
    shown.sort(function (a, b) { return a - b; });
    function level(n) {
      if (!n) return 0;
      var atOrBelow = shown.filter(function (m) { return m <= n; }).length;
      return Math.ceil((top * atOrBelow) / shown.length);
    }

    // newest week first: the CSS lays them out right to left
    for (var w = WEEKS - 1; w >= 0; w--) {
      var col = el("div", { class: "likes-week" });
      for (var i = 0; i < 7; i++) {
        var date = new Date(+firstSunday + (w * 7 + i) * DAY_MS);
        if (date > today) {
          col.appendChild(el("i", { class: "future" }));
          continue;
        }
        var n = counts[dayKey(date)] || 0;
        col.appendChild(el("i", { class: "l" + level(n), title: plural(n, "like") + " on " + day(date.toISOString()) }));
      }
      grid.appendChild(col);
    }

    var s = streaks(counts, today);
    var year = shown.reduce(function (a, b) { return a + b; }, 0);
    var summary = plural(year, "like") + " in the last year · " + s.current + " day streak · longest " + s.longest;
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
