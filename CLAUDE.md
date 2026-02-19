# Radiant Arrays — Walter Ory Portfolio Website

A single-page portfolio site for artist Walter Ory, showcasing geometric light and shadow installations made from painted wood, nails, and light.

## Stack
- Plain HTML / CSS / JavaScript (no build tools, no frameworks)
- Vanilla JS with a canvas-based animated hero and cursor trail effect
- Google Fonts: Cormorant Garamond + Inter

## File Structure
- `index.html` — Single page with sections: hero, gallery, about, contact, footer, lightbox, inquiry modal
- `style.css` — All styles
- `script.js` — Artwork data (`ARTWORKS` array), gallery rendering, lightbox, inquiry form, hero canvas animation
- `Website Photos/` — Untracked folder containing source photos (not yet wired up)

## Adding Artwork Photos
Images are expected at `images/<filename>.jpg`. Each artwork in `script.js`'s `ARTWORKS` array has an `image` field (currently empty strings) with a comment showing the target path. Drop images into an `images/` folder and fill in those paths.

## Contact / Social
- Email: radiantarrays@gmail.com
- Instagram: @radiantarrays
