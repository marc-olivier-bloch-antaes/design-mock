# SiL crawl - proof-of-concept refonte

Crawl of the "Services industriels de Lausanne" (SiL) section of lausanne.ch,
scoped to `/vie-pratique/energies-et-eau/services-industriels`, produced for a
UX/React/dev team building a redesign proof of concept. This replaces an
earlier, broken crawl attempt (empty pages, no titles/images, no navigation).

## How it was built

1. **`scripts/fetch.js`** (Node + Playwright/Chromium): loads each URL from
   `scripts/pages.config.json` in a real browser, dismisses the cookie
   banner, **clicks every content tab** (`.contenu-structure__comp__tab`) so
   its content is fetched and injected client-side, waits for
   `.pre-loading-icon` placeholders to disappear, then saves:
   - the fully rendered HTML to `raw/<slug>.html`
   - `screenshots/<slug>-desktop.png` (1440px, full page)
   - `screenshots/<slug>-mobile.png` (390px, full page)
   `scripts/fetch_one.js` is the same logic for re-fetching a single page
   (used to fix the two swapped pages and the `reglements` alias, see below).
2. **`scripts/extract.py`** (Python + BeautifulSoup): parses every
   `raw/<slug>.html` into `content/<slug>.json`, and collects every
   image/icon URL it touches into `scripts/image_map.json` /
   `scripts/icon_map.json`.
3. **`scripts/download_assets.py`**: downloads every referenced image/icon
   into `assets/images` / `assets/icons`, plus the fixed brand assets (logo,
   favicon, Ville de Lausanne "ecusson", main CSS bundle) into
   `assets/brand`. `.../original/...` imaging variants are swapped for the
   `1920x` preset to avoid pulling multi-MB source files.
4. **`scripts/build_navigation.py`**: rebuilds `navigation.json` from the
   real desktop mega-menu (`#nav-desktop`) captured in `raw/accueil.html`.
5. **`scripts/build_pages_manifest.py`**: builds `pages.json` from the
   content JSON + navigation tree.
6. **`scripts/validate.py`**: the QA pass described below.

Re-running the whole pipeline: `node scripts/fetch.js` (needs `npm i` once,
see `package.json`), then `python3 scripts/extract.py && python3
scripts/download_assets.py && python3 scripts/build_navigation.py &&
python3 scripts/build_pages_manifest.py && python3 scripts/validate.py`.

One second pause between requests, explicit User-Agent
(`SIL-POC-Crawler/1.0`), 1 request at a time.

## Scope and page selection

20 pages under `/vie-pratique/energies-et-eau/services-industriels`,
deduplicated (`.html`/trailing slash/query string normalised, `?tab=`
treated as part of the page it belongs to, not a separate page). No
lausanne.ch pages outside the SiL section, no external domains, no
authenticated pages (`Mon Compte`, `Compte Pro` and their sub-pages were
intentionally **not** crawled - they require login), no `recherche.html`.

The site's top-level menu entries (`particuliers.html`, `professionnels.html`,
`partenaires.html`, `a-propos-sil.html`, `carrieres.html`) all render the
**exact same homepage content** (verified byte-for-byte) - they are not real
landing pages, just menu anchors. They were excluded from the crawl for that
reason; `navigation.json` still lists them (without a `slug`) since a real
prototype's menu needs them as clickable top-level entries.

Two swaps were made after the first extraction pass, because the originally
picked page had too little content (see validation, below):
- `particuliers/je-produis-mon-energie.html` (a thin index page) &rarr;
  replaced by `particuliers/j-optimise-ma-consommation/economies-d-energie-particuliers.html`.
- `professionnels/les-offres.html` (a thin index page) &rarr; replaced by
  `professionnels/produire-de-l-energie/solaire-photovoltaique.html`.

One alias was discovered and corrected: the "Règlements" entry under
**Partenaires** (`partenaires/reglements.html`) is not a real page - visiting
it triggers a client-side redirect (`page.url()` changes after
`networkidle`, with **no** HTTP 30x involved) to its canonical location,
`a-propos-sil/nos-activites/reglements.html`. The page is crawled once, under
slug `a-propos-reglements`; `navigation.json` still shows both menu
locations pointing at the same slug.

## Templates observed

| Template | `<main>` marker | Used by |
|---|---|---|
| Homepage | hand-built sections, no template class | `accueil` |
| Content page with tabs | `main.contenu-structure` | electricite/chaleur/gaz/multimedia/solaire/telegestion/raccordements detail pages |
| Index / teaser list | `main.sommaire-rubrique`, real content is a `sommaireDataModel` JS object | `je-choisis-mon-offre.html` and similar hub pages |
| Article | `main#content` with no extra class, one or more `<article class="container">` | contact, portrait, activités, engagement, C-FOR, métiers, économies d'énergie... |

`contenu-structure` pages have a `h1` + `.lead` + optional CTA button in
`.entete-de-page`, a background hero image on `.contenu-structure__bkg`, and
their real content lives in **tabs** (`data-ref="produits|tarifs|
raccordement|securite|faq"` etc., URL `?tab=xxx`). The tab HTML is loaded
client-side; the same URL with `?tab=xxx&xhr=1` (discovered from the network
log) returns a full HTML page with only that tab pre-rendered - Playwright
tab-clicking was used instead of hitting that endpoint directly, because it
reliably produces one single, fully-loaded page per URL with **all** tabs
present, source of truth for one page = one browser session.

A quirk worth knowing for the redesign: `<title>`/`<h1>` on `contenu-structure`
pages are rewritten by client-side JS to reflect whichever tab was clicked
*last*. The extractor reconstructs the canonical title using the *first*
(default) tab instead.

## Content JSON shape

```json
{
  "slug": "...", "url": "...", "path": "/particuliers/je-choisis-mon-offre/electricite",
  "title": "...", "section": "particuliers|professionnels|partenaires|a-propos|carrieres|accueil",
  "breadcrumb": [{"label": "...", "url": "...", "slug": "... if crawled"}],
  "lead": "cleaned inline HTML of the chapeau, or null",
  "heroImage": "assets/images/... or null",
  "cta": [{"label": "...", "url": "...", "slug": "... if internal & crawled"}],
  "tabs": [{"id": "produits", "label": "Produits", "icon": "assets/icons/....svg", "blocks": [...]}],
  "blocks": [ ... blocks outside any tab ... ]
}
```

Paragraph HTML keeps only `a/strong/em/br/sup/sub` (`b`&rarr;`strong`,
`i`&rarr;`em`), no classes/styles; internal links are resolved to absolute
URLs; HTML entities are decoded (real UTF-8 characters, not `&eacute;`
etc.). Internal links to a crawled page carry a `slug`; links to pages that
exist but weren't crawled do not (by design, per spec).

### Block types

| Type | Fields | Notes |
|---|---|---|
| `heading` | `level, text` | |
| `paragraph` | `html` | cleaned inline HTML |
| `list` | `ordered, items[html]` | |
| `image` | `src, alt, caption` | `src` is a local `assets/images/...` path |
| `gallery` | `title, items[{src,alt,caption}]` | photo carousels (`.full-width-carousel`); de-duplicated against the transition-frame duplicates Bootstrap/flickity leave in the DOM |
| `teasers` | `title, variant, items[{title,text,url,slug?,image,external?}]` | `variant`: `grid` (from a `sommaireDataModel` index page), `carousel` (homepage promo carousel), `accroche` (homepage "tiles") |
| `links` | `title, variant?, items[{label,url,slug?,external}]` | `variant`: `icon-nav` (icon quick-links, e.g. homepage universes or in-page sub-nav), `news` ("Quoi de neuf ?" widget) |
| `documents` | `items[{label,url,format,size,date}]` | PDFs are **referenced, not downloaded**; `format` is `LINK` for a non-PDF item grouped with PDFs in the same list |
| `accordion` | `items[{title, blocks[...]}]` | `blocks` recurses through the same block set (so an accordion item can itself contain headings/paragraphs/lists/documents) |
| `table` | `headers[html], rows[[html]]` | |
| `contact` | `title, lines[text], logo, links[{label,url,external}]` | two source patterns unified: the standard `.page-footer`/`.coordinates` block and the sidebar `.white-box-container.coordonnees` widget |
| `keyfigures` | `title, items[{value,label}]` | "Les SiL, ce sont..." stat blocks |
| `cta` | `label, url, slug?` | a standalone `.cta-button` link found inline in the content |
| `video` | `url` | any `<iframe>` embed - YouTube, Datawrapper charts, Google My Maps, etc. all use this type; `url` tells them apart |

No block type is emitted for empty content; consecutive `teasers`
(`variant: accroche`) and consecutive `accordion` blocks that the source
markup splits into several DOM widgets are merged into one, since they read
as a single list to a visitor (e.g. the homepage's four single-tile
"accroche" widgets, or a FAQ split across two side-by-side one-question
boxes).

## Assets

- `assets/images/` - 96 unique content/hero/teaser images, ~15 MB total.
  `.../original/...` imaging URLs are swapped for the `1920x` preset before
  download.
- `assets/icons/` - 19 unique tab picto SVGs (`picto-onglet-*.svg`).
- `assets/brand/` - `logo-sil.svg` (header logo,
  `/dam/jcr:9130c40a-.../Logo_SiL(2).svg`), `logo-sil-footer.svg` (the
  simpler mark used in every page-footer contact block), `logo-sil-filigrane.svg`
  (mega-menu watermark), `ecusson-lausanne.svg` (Ville de Lausanne emblem,
  found as a CSS background-image on `.ecusson`, not inline HTML),
  `favicon.png`, and `main.min.css` (the live, ~770 KB minified stylesheet
  the whole page renders from).

## Brand colors (`brand.json`)

Colors were extracted from `main.min.css` (by literal frequency count) *and*
from inline `<style>` overrides in the page HTML (per-button color
overrides). Headline finding: the **CTA green `#09a16d`** used on every
"nativa"/energy-choice action button across every universe is **not** in the
CSS at all - it's injected as a one-off inline `<style>` block per button
instance (`#cta-button-<uuid>{background-color:#09a16d}`). The rest of the
UI (headings, `.bkgRed`, focus/interactive states) uses the shared
lausanne.ch red (`#e1313c`) / blue (`#0080bf`) design system. There is no
per-universe (electricité/gaz/chaleur/...) color coding anywhere. Single
typeface: self-hosted **Open Sans** (300-800), no secondary/display font.
A few meta-only colors (Windows tile, Safari pinned-tab, Leaflet marker
states) were found and explicitly excluded as non-brand (see
`colorsExcludedAsNonBrand` in `brand.json`).

## Navigation (`navigation.json`)

Rebuilt from the real desktop mega-menu markup (`#nav-desktop`) rather than
hand-typed, so it's an accurate 3-level tree (Particuliers/Professionnels/
Partenaires/A propos des SiL/Carrières &rarr; sub-section &rarr; leaf page),
including menu entries that were not crawled (no `slug` key on those).

## Known limitations / things to double-check downstream

- **`particuliers-je-choisis-mon-offre`** (the one `sommaire-rubrique` index
  page kept in the set) has only 2 top-level blocks (a 5-item teaser grid +
  a contact block). That's a faithful representation of the template -
  index pages on this site genuinely carry no body copy beyond the
  teasers - but it's the one page under the "&lt;3 blocks" validation
  threshold; kept deliberately as the sole example of that template.
- Global, cross-page chrome was intentionally **not** extracted as content:
  the mega-menu, the SiL-specific 5-column footer link list
  (À propos/Produits/Subventions/Conseils énergétiques/Mon compte), the
  weather widget, the cookie banner, and the share buttons. These are
  navigation/boilerplate, not page content, and would need to be modeled
  once as a layout component by whoever builds the React app.
- A handful of `icon-nav` labels come straight from the source SVG
  `<title>` and are mildly wrong in the *original site* (e.g. the
  "Règlements" icon on `a-propos-nos-activites` is titled "facture" in the
  source markup) - left as-is, faithfully reproduced rather than "fixed".
- `video` is a catch-all for any iframe embed (YouTube playlist, Datawrapper
  chart, Google My Maps); there was no true self-hosted `<video>` tag
  anywhere in the crawled set.
- PDF documents are referenced by absolute URL only, never downloaded
  (`assets/` contains no PDFs), per spec.

## Verification (`scripts/validate.py`)

Run: `python3 scripts/validate.py`. Checks, per page: block counts by type
(tabs included, accordion items counted recursively), title present, every
referenced `assets/...` path exists on disk, no duplicate crawled URLs, no
residual `.pre-loading-icon` in the rendered HTML, no empty paragraph
blocks. Current result: **PASS**, 0 blocking problems, 1 warning (the index
page noted above). Totals: 20 pages, 1137 blocks counted across page bodies
and tabs (accordion items flattened in), 96 images, 19 icons, 0 duplicate
URLs, 0 residual loading placeholders, 0 empty paragraphs.
