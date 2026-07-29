# CV

Source of truth: `cv.tex`. The PDF is a build artifact, not something to edit by hand.

Served at [max.me.uk/cv](https://max.me.uk/cv), which renders the PDF itself - nothing
else. The published file is `static/cv/max-mitchell-cv.pdf`, and the `location ~ ^/cv/?$`
block in `nginx.conf` maps the bare `/cv` route onto it (so it opens inline in the
browser, and saves under a sensible filename).

## Build locally

Requires XeLaTeX:

    brew install --cask mactex-no-gui   # or your platform's texlive-xetex
    xelatex cv.tex                      # twice, so hyperref settles
    cp cv.pdf ../static/cv/max-mitchell-cv.pdf

Inconsolata is vendored in `fonts/` (regular and bold, from Google Fonts), so there is
no system font to install and the build is identical everywhere. `cv/cv.pdf` is
gitignored; the copy under `static/` is the one that ships.

## Build in CI

`.github/workflows/cv.yml` compiles on any push that touches `cv/`, and fails the build
if either:

- the output is **more than one page**, or
- `static/cv/max-mitchell-cv.pdf` is **out of date** with `cv.tex` (compared by extracted
  text, since every build stamps a fresh timestamp).

So editing `cv.tex` means recompiling and committing the PDF in the same change.

## Layout dials

Everything that controls whether it fits on one page lives in the preamble:

- `\documentclass[10pt,...]` - base type size
- `Scale=0.92` on `\setmainfont` - font size relative to that
- `\titlespacing{\section}{0pt}{7pt}{3pt}` - space around section headings
- `itemsep` / `topsep` in the `\setlist[itemize]` line - space between bullets
- `geometry` margins

## Conventions

- Red (`accent`, `#bc2122`, the site's `$red`) is only ever used for tool and technology names.
- Pipe separators in the tool lines stay black.
- Plain hyphens throughout, not en or em dashes.
