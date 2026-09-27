// Renders my Liked Songs: all of them on /music/ from /api/tracks, and the
// newest few on /blog/ from /api/tracks/recent. See functions/api/.
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

  var list = document.getElementById("tracks-list");
  if (list) {
    var status = document.getElementById("tracks-status");
    var filter = document.getElementById("tracks-filter");
    load("/api/tracks")
      .then(function (data) {
        fill(list, data.tracks);
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

  // stays hidden if there's nothing to show - it's an extra on the blog page
  var recent = document.getElementById("recent-tracks");
  if (recent) {
    load("/api/tracks/recent").then(function (data) {
      if (!data.tracks.length) return;
      fill(recent.querySelector("ol"), data.tracks);
      recent.hidden = false;
    }).catch(function () {});
  }
})();
