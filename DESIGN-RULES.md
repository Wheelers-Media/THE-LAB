# THE LAB site design rules

The tokens live at the top of the "Foundation" block in `src/assets/css/lab.css`. Change them there, not page by page.

## Titles
- One H1 per page. Never skip a level (H1, then H2, then H3).
- H1 over a photo (service page heroes): `.page-h1`, `--fs-hero`, 46 to 96px.
- H1 on text-only page heads (store, contact, policies): `.pg-h1`, `--fs-h1`, 42 to 88px. The home hero keeps `.hero-h1`.
- H2 section title: `.bay-title`, `--fs-h2`, 34 to 60px. Feature spreads use `.spread-title`; the closing call to action uses `.close-title`. Step titles inside builders and forms use H3 (`--fs-h3`).
- Titles are uppercase through `.display` and wrap balanced (`text-wrap: balance`).
- Space under a title: 16px to a paragraph, 24px to a grid or list.

## Spacing and sections
- Every content section gets `--section-y` above it (56px on phones, 80px on desktop) and nothing below, so the gap between blocks never doubles. Panel sections (`.band`, `.bay`) keep their own padding on both sides.
- Spacing steps: `--sp-1` to `--sp-8` (4, 8, 12, 16, 24, 32, 48, 72px). Do not invent values.
- Body copy is never wider than `--measure` (62ch). A lede is 46ch. Paragraphs wrap with `text-wrap: pretty`.
- One idea per section: a title, a short intro, then the content. No more than one hero per page.

## Photos
- Every `<img>` has `width` and `height` so nothing jumps. The hero has `fetchpriority="high"`; everything else has `loading="lazy"`.
- Export sizes: hero 1600x900 under 150 KB; gallery 900x600 (3:2) or 800x1000 (4:5) under 120 KB. JPEG, quality 4 to 5 in ffmpeg. Never upload originals.
- Crop in the file, not in CSS, when the subject matters. One aspect ratio per gallery.
- Alt text says what is in the photo (truck, bumper, place). Captions are 13.5px, muted. Credit photos that are not ours.
- Real shop photos first. Nothing with another company's branding visible.

## Motion
- 200 to 600ms, `--ease-out`, opacity and transform only, once per element. Respect reduced motion (CSS and `reveal.js` both check it).
- Scroll reveals come from `src/assets/js/reveal.js`, which tags elements below the first screen. Never add `data-reveal` by hand.
- Steps animate with `.step-in` (`window.labStepIn`). A step change must land below the sticky header: `html { scroll-padding-top: calc(var(--header-h) + 16px) }`, and `chrome.js` keeps `--header-h` equal to the real header height.
- Native scrolling only. No scroll-jacking libraries.

## Forms
- One idea per step, contact details last. Choices with six or fewer options are tiles; the hidden `<select>` stays underneath so validation and email fields keep working.
- Inputs are dark with 52px minimum height. Next and Back keep the step title visible.
- Prices come from the service pages (and Shopify). The quote tool (`quote.js`) reads them from those pages, so never copy a price into code.
