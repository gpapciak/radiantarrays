# Radiant Arrays — Walter Ory Portfolio Website

A single-page portfolio site for artist Walter Ory, showcasing geometric light and shadow installations made from painted wood, nails, and light.

## Stack
- Plain HTML / CSS / JavaScript (no build tools, no frameworks)
- Vanilla JS with a canvas-based animated hero and cursor trail effect
- Google Fonts: Cormorant Garamond + Inter + Inconsolata (used in Process section labels)

## File Structure
- `index.html` — Single page with sections: hero, gallery, process, about, contact, footer, lightbox, inquiry modal
- `style.css` — All styles
- `script.js` — Artwork data (`ARTWORKS` array), gallery rendering, lightbox, inquiry form, hero canvas animation
- `images/` — All artwork photos and artist portrait, served from here with clean filenames
- `Website Photos/` — Original source photos (untracked)
- `process-section_1.html` — Original standalone process section file (kept as reference)

## Page Sections (in order)
1. **Hero** — Animated canvas with generative geometry, parallax cursor effect
2. **Gallery** — 3-column masonry grid with filter (All / Available / Sold), lightbox with pan/zoom, size visualiser, inquiry modal
3. **Process** — Seven architectural SVG drawings (I–VII) with body text explaining the making process, including an LED series subsection
4. **About** — Artist photo + bio + contact links
5. **Contact** — Email and Instagram
6. **Footer**

## Artworks (`ARTWORKS` array in script.js)
9 works, ids 0–8. Each has: `id`, `title`, `year`, `medium`, `dimensions`, `w`, `h`, `isCircle`, `available`, `image`.
- Images live at `images/<slug>.jpg`
- `isCircle: true` affects the size visualiser in the lightbox (renders a circle instead of rectangle)
- Gallery order in the array controls visual position in the 3-column masonry layout

## Key CSS Notes
- `.artwork-card[data-id="4"]` — Radiant Dialogue has an overridden `aspect-ratio: 4/3` to make its card taller in the gallery (the actual artwork is 2:1 landscape)
- `.arch-drawing` — SVG drawings in the Process section use white backgrounds intentionally (architectural drawing style)
- Process section uses class prefix `process-` to avoid conflicts with existing `.section-title` etc.

## Adding / Editing Artworks
- Add entry to `ARTWORKS` array in `script.js` with a unique `id`
- Place image at `images/<filename>.jpg` and set the `image` field
- Array order determines gallery position (columns flow top-to-bottom, left-to-right with `columns: 3`)

## Contact / Social
- Email: radiantarrays@gmail.com
- Instagram: @radiantarrays
