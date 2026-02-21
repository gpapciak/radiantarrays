/* ============================================================
   RADIANT ARRAYS — Walter Ory Portfolio
   script.js
   ============================================================ */

'use strict';

/* ======================== ARTWORK DATA ========================
   To add real photos: set the `image` field to the file path.
   Example: image: 'images/singularity-field.jpg'
   Expected image folder: radiantarrays/images/
   ============================================================ */
const ARTWORKS = [
  {
    id: 0,
    title: 'Singularity Field',
    year: 2023,
    medium: 'Mixed media',
    dimensions: '95cm × 78cm',
    w: 95, h: 78, isCircle: false,
    available: true,
    image: 'images/singularity-field.jpg',
  },
  {
    id: 1,
    title: 'Chromatic Wheel',
    year: 2023,
    medium: 'Mixed media',
    dimensions: '46cm diameter',
    w: 46, h: 46, isCircle: true,
    available: true,
    image: 'images/chromatic-wheel.jpg',
  },
  {
    id: 2,
    title: 'Oxide Spirals',
    year: 2022,
    medium: 'Mixed media',
    dimensions: '46cm diameter',
    w: 46, h: 46, isCircle: true,
    available: true,
    image: 'images/oxide-spirals.jpg',
  },
  {
    id: 3,
    title: 'Convergence Chamber',
    year: 2023,
    medium: 'Mixed media',
    dimensions: '80cm × 80cm',
    w: 80, h: 80, isCircle: false,
    available: true,
    image: 'images/convergence-chamber.jpg',
  },
  {
    id: 5,
    title: 'Radiant Axis',
    year: 2025,
    medium: 'Mixed media',
    dimensions: '46cm diameter',
    w: 46, h: 46, isCircle: true,
    available: true,
    image: 'images/radiant-axis.jpg',
  },
  {
    id: 4,
    title: 'Radiant Dialogue',
    year: 2022,
    medium: 'Mixed media',
    dimensions: '120cm × 60cm',
    w: 120, h: 60, isCircle: false,
    available: true,
    image: 'images/radiant-dialogue.jpg',
  },
  {
    id: 6,
    title: 'Refraction in Hexadecagon & Derivatives',
    year: 2021,
    medium: 'Mixed media',
    dimensions: '61cm diameter',
    w: 61, h: 61, isCircle: true,
    available: false,
    image: 'images/refraction-hexadecagon.jpg',
  },
  {
    id: 7,
    title: 'Circular Radiants No.2',
    year: 2022,
    medium: 'Mixed media',
    dimensions: '60cm × 60cm',
    w: 60, h: 60, isCircle: false,
    available: true,
    image: 'images/circular-radiants-2.jpg',
  },
  {
    id: 8,
    title: 'Bilateral Radiance',
    year: 2025,
    medium: 'Mixed media',
    dimensions: '61cm diameter',
    w: 61, h: 61, isCircle: true,
    available: true,
    image: 'images/bilateral-radiance.jpg',
  },
];

/* ======================== STATE ======================== */
const state = {
  filter: 'all',
  filtered: [...ARTWORKS],   // artworks visible after filter
  lightboxIndex: 0,          // index into state.filtered
  lightboxOpen: false,
};


/* ======================================================
   CUSTOM CURSOR + LIGHT TRAIL
   ====================================================== */
(function initCursor() {
  const isTouchDevice = () =>
    window.matchMedia('(hover: none)').matches ||
    'ontouchstart' in window;

  if (isTouchDevice()) return;

  const cursorEl   = document.getElementById('cursor');
  const trailCanvas= document.getElementById('cursorTrail');
  if (!cursorEl || !trailCanvas) return;

  const ctx = trailCanvas.getContext('2d');
  let W = 0, H = 0;
  let mx = -200, my = -200;
  const trail = []; // { x, y, age }
  const MAX_TRAIL = 28;

  function resize() {
    W = trailCanvas.width  = window.innerWidth;
    H = trailCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Track raw mouse
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    // Move cursor div
    cursorEl.style.left = mx + 'px';
    cursorEl.style.top  = my + 'px';
    // Push trail point
    trail.push({ x: mx, y: my, age: 0 });
    if (trail.length > MAX_TRAIL) trail.shift();
  }, { passive: true });

  // Hover effect on interactive elements
  const hoverSelectors = 'a, button, .artwork-card, .filter-btn, input, textarea, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelectors)) cursorEl.classList.add('hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelectors)) cursorEl.classList.remove('hovering');
  });

  // Trail render loop
  function renderTrail() {
    ctx.clearRect(0, 0, W, H);
    trail.forEach(p => p.age++);
    // Remove expired
    while (trail.length && trail[0].age > MAX_TRAIL) trail.shift();

    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1];
      const p1 = trail[i];
      const t  = i / trail.length;           // 0 → 1 (older → newer)
      const a  = t * 0.45 * (1 - p1.age / MAX_TRAIL);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(201, 169, 110, ${a})`;
      ctx.lineWidth   = 1.5 * t + 0.5;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
    requestAnimationFrame(renderTrail);
  }
  renderTrail();
})();


/* ======================================================
   HERO CANVAS — GENERATIVE GEOMETRY ANIMATION
   ====================================================== */
(function initHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy;
  let t = 0;
  // Normalised mouse offset, -0.5 → 0.5
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };

  // Each "system" is an independent geometric form
  const systems = [
    // 0 — Large hexagonal web
    {
      depth: 0.7, rot: 0, rotSpeed: 0.00014,
      draw(ctx, rot, offX, offY) {
        const r = Math.min(W, H) * 0.38;
        ctx.save();
        ctx.translate(cx + offX, cy + offY);
        ctx.rotate(rot);
        poly(ctx, 6, r, 0,         0.10);
        poly(ctx, 6, r * 0.65, 0,  0.06);
        radials(ctx, 6,  r, 0,     0.05);
        // Diameters
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI;
          line(ctx, Math.cos(a)*r, Math.sin(a)*r, Math.cos(a+Math.PI)*r, Math.sin(a+Math.PI)*r, 0.03);
        }
        ctx.restore();
      },
    },
    // 1 — Slow outer octagon ring
    {
      depth: 0.25, rot: Math.PI / 8, rotSpeed: -0.00009,
      draw(ctx, rot, offX, offY) {
        const r = Math.min(W, H) * 0.54;
        ctx.save();
        ctx.translate(cx + offX, cy + offY);
        ctx.rotate(rot);
        poly(ctx, 8, r, 0, 0.035);
        radials(ctx, 24, r, 0, 0.018);
        ctx.restore();
      },
    },
    // 2 — Inner Star of David / overlapping triangles
    {
      depth: 1.1, rot: 0, rotSpeed: 0.00022,
      draw(ctx, rot, offX, offY) {
        const r = Math.min(W, H) * 0.17;
        ctx.save();
        ctx.translate(cx + offX, cy + offY);
        ctx.rotate(rot);
        poly(ctx, 3, r, 0,              0.11);
        poly(ctx, 3, r, Math.PI,        0.09);
        radials(ctx, 12, r * 1.4, 0,   0.04);
        ctx.restore();
      },
    },
    // 3 — Far-back grid of lines
    {
      depth: 0.12, rot: Math.PI / 7, rotSpeed: 0.00007,
      draw(ctx, rot, offX, offY) {
        const size = Math.min(W, H) * 0.08;
        const count = 9;
        ctx.save();
        ctx.translate(cx + offX, cy + offY);
        ctx.rotate(rot);
        ctx.strokeStyle = 'rgba(201,169,110,0.022)';
        ctx.lineWidth = 0.5;
        for (let i = -count; i <= count; i++) {
          ctx.beginPath();
          ctx.moveTo(i * size, -count * size);
          ctx.lineTo(i * size,  count * size);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-count * size, i * size);
          ctx.lineTo( count * size, i * size);
          ctx.stroke();
        }
        ctx.restore();
      },
    },
    // 4 — Mid-speed radiant burst
    {
      depth: 0.55, rot: Math.PI / 12, rotSpeed: -0.00017,
      draw(ctx, rot, offX, offY) {
        const r = Math.min(W, H) * 0.28;
        ctx.save();
        ctx.translate(cx + offX, cy + offY);
        ctx.rotate(rot);
        radials(ctx, 18, r, 0, 0.04);
        // Concentric arcs
        for (let i = 1; i <= 4; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, r * (i / 4), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(201,169,110,${0.03 - i * 0.005})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        ctx.restore();
      },
    },
    // 5 — Very large outer ring (vignette-like frame)
    {
      depth: 0.08, rot: 0, rotSpeed: 0.00004,
      draw(ctx, rot, offX, offY) {
        const r = Math.min(W, H) * 0.78;
        ctx.save();
        ctx.translate(cx + offX, cy + offY);
        ctx.rotate(rot);
        poly(ctx, 12, r, 0, 0.025);
        ctx.restore();
      },
    },
  ];

  /* — helpers — */
  function poly(ctx, sides, r, rotOff, opacity) {
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2 + rotOff;
      if (i === 0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
      else         ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.strokeStyle = `rgba(201,169,110,${opacity})`;
    ctx.lineWidth   = 0.7;
    ctx.stroke();
  }

  function radials(ctx, count, r, rotOff, opacity) {
    ctx.strokeStyle = `rgba(201,169,110,${opacity})`;
    ctx.lineWidth   = 0.5;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rotOff;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      ctx.stroke();
    }
  }

  function line(ctx, x1, y1, x2, y2, opacity) {
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(201,169,110,${opacity})`;
    ctx.lineWidth   = 0.5;
    ctx.stroke();
  }

  function resize() {
    canvas.width  = W = window.innerWidth;
    canvas.height = H = window.innerHeight;
    cx = W / 2; cy = H / 2;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / W) - 0.5;
    targetMouse.y = (e.clientY / H) - 0.5;
  }, { passive: true });

  function frame() {
    ctx.clearRect(0, 0, W, H);
    // Smooth mouse
    mouse.x += (targetMouse.x - mouse.x) * 0.038;
    mouse.y += (targetMouse.y - mouse.y) * 0.038;

    systems.forEach(sys => {
      sys.rot += sys.rotSpeed;
      // Gentle opacity breath: modulate via sin
      const breath = 0.85 + 0.15 * Math.sin(t * 0.0008 + sys.depth * 4);
      ctx.globalAlpha = breath;
      // Parallax offset from mouse
      const offX = mouse.x * sys.depth * 55;
      const offY = mouse.y * sys.depth * 55;
      sys.draw(ctx, sys.rot, offX, offY);
    });
    ctx.globalAlpha = 1;
    t++;
    requestAnimationFrame(frame);
  }
  frame();

  /* — Parallax scroll on hero layers — */
  const heroContent = document.getElementById('heroContent');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const heroH = document.getElementById('hero').offsetHeight;
    if (sy > heroH * 1.2) return;
    // Canvas drifts at half speed
    canvas.style.transform = `translateY(${sy * 0.18}px)`;
    // Content rises faster and fades
    if (heroContent) {
      heroContent.style.transform = `translateY(${sy * 0.42}px)`;
      heroContent.style.opacity   = Math.max(0, 1 - sy / (heroH * 0.55));
    }
  }, { passive: true });
})();


/* ======================================================
   NAVIGATION
   ====================================================== */
(function initNav() {
  const nav    = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  // Scrolled state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile hamburger
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Close on link click
    links.querySelectorAll('.nav-link').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }
})();


/* ======================================================
   GALLERY — render, filter, scroll-reveal
   ====================================================== */
(function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  /* Render all cards */
  function renderCards() {
    grid.innerHTML = '';
    ARTWORKS.forEach((art, i) => {
      const ar = (art.w / art.h).toFixed(4);
      const card = document.createElement('article');
      card.className = 'artwork-card';
      card.dataset.id        = String(art.id);
      card.dataset.available = String(art.available);
      card.style.setProperty('--ar', ar);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${art.title}`);

      // Image or placeholder
      const imgHTML = art.image
        ? `<img src="${art.image}" alt="${art.title}, ${art.year}" loading="lazy">`
        : `<div class="card-placeholder">
             <svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
               <rect x="3" y="3" width="18" height="18" rx="1"/>
               <circle cx="8.5" cy="8.5" r="1.5"/>
               <polyline points="21 15 16 10 5 21"/>
             </svg>
             <span class="ph-label">
               Add photo:<br>${art.image || suggestFilename(art.title)}
             </span>
           </div>`;

      card.innerHTML = `
        <div class="card-image">${imgHTML}</div>
        <div class="card-info">
          <p class="card-title">${art.title}</p>
          <p class="card-year">${art.year} &nbsp;·&nbsp; ${art.dimensions}</p>
          <span class="card-status ${art.available ? 'available' : 'sold'}">
            ${art.available ? 'Available' : 'Sold'}
          </span>
        </div>`;

      card.addEventListener('click',   () => openLightbox(i));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });

      grid.appendChild(card);
    });

    observeCards();
  }

  /* Suggest a clean filename */
  function suggestFilename(title) {
    return 'images/' + title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '.jpg';
  }

  /* Scroll-reveal via IntersectionObserver */
  function observeCards() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    grid.querySelectorAll('.artwork-card').forEach((card, i) => {
      // Stagger
      card.style.transitionDelay = `${(i % 3) * 0.08}s`;
      obs.observe(card);
    });
  }

  /* Filter */
  function applyFilter(filter) {
    state.filter = filter;
    const cards = grid.querySelectorAll('.artwork-card');
    const filtered = [];
    cards.forEach(card => {
      const avail = card.dataset.available === 'true';
      const show  = filter === 'all'
                 || (filter === 'available' && avail)
                 || (filter === 'sold'      && !avail);
      card.classList.toggle('card-hidden', !show);
      if (show) filtered.push(ARTWORKS[parseInt(card.dataset.id)]);
    });
    state.filtered = filtered;
  }

  /* Filter button clicks */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  renderCards();
})();


/* ======================================================
   SIZE VISUALIZER — SVG scale reference
   Renders a human silhouette next to the artwork
   ====================================================== */
function buildSizeViz(art) {
  // Everything in cm → SVG units (1 unit = 1 cm)
  const personH    = 170;
  const headR      = 10;
  const torsoH     = personH * 0.37;
  const legH       = personH * 0.41;
  const shoulderW  = 28;
  const legW       = 11;
  const personWTotal = shoulderW;

  const pCX    = headR + personWTotal / 2 + 4;   // person centre-x
  const padTop = headR + 4;
  const baseline = padTop + personH;
  const gap    = 22;

  // Artwork dims
  const artW = art.w;
  const artH = art.isCircle ? art.w : art.h;   // for circle, diameter
  const artX = pCX + personWTotal / 2 + gap;
  const artY = baseline - artH;

  const svgW = artX + artW + 14;
  const svgH = baseline + 20;

  // Person body parts (y measured from top)
  const headCY    = padTop + headR;
  const neckY     = headCY + headR + 1;
  const shoulderY = neckY + 3;
  const hipY      = shoulderY + torsoH;
  const feetY     = baseline;
  const armY      = shoulderY + torsoH * 0.18;

  const artShape = art.isCircle
    ? `<circle cx="${artX + artW / 2}" cy="${baseline - artW / 2}"
         r="${artW / 2}"
         fill="rgba(201,169,110,0.06)"
         stroke="rgba(201,169,110,0.55)"
         stroke-width="1.5"/>`
    : `<rect x="${artX}" y="${artY}" width="${artW}" height="${artH}"
         fill="rgba(201,169,110,0.06)"
         stroke="rgba(201,169,110,0.55)"
         stroke-width="1.5"/>`;

  const dimLabel  = art.isCircle ? `⌀ ${art.w}cm` : `${art.w}cm × ${art.h}cm`;

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
    <!-- Person silhouette -->
    <g opacity="0.28" fill="#e8e3da">
      <!-- Head -->
      <circle cx="${pCX}" cy="${headCY}" r="${headR}"/>
      <!-- Neck -->
      <rect x="${pCX - 4}" y="${neckY}" width="8" height="4" rx="1"/>
      <!-- Torso -->
      <rect x="${pCX - shoulderW/2}" y="${shoulderY}" width="${shoulderW}" height="${torsoH}" rx="4"/>
      <!-- Left arm -->
      <rect x="${pCX - shoulderW/2 - 7}" y="${armY}" width="7" height="${torsoH * 0.75}" rx="3"/>
      <!-- Right arm -->
      <rect x="${pCX + shoulderW/2}" y="${armY}" width="7" height="${torsoH * 0.75}" rx="3"/>
      <!-- Left leg -->
      <rect x="${pCX - legW - 1}" y="${hipY}" width="${legW}" height="${legH}" rx="3"/>
      <!-- Right leg -->
      <rect x="${pCX + 1}" y="${hipY}" width="${legW}" height="${legH}" rx="3"/>
    </g>

    <!-- Baseline ground -->
    <line x1="4" y1="${baseline}" x2="${svgW - 4}" y2="${baseline}"
      stroke="rgba(255,255,255,0.08)" stroke-width="0.7"/>

    <!-- Person label -->
    <text x="${pCX}" y="${baseline + 12}"
      text-anchor="middle"
      fill="rgba(255,255,255,0.22)"
      font-size="7.5"
      font-family="Inter,sans-serif">170cm</text>

    <!-- Artwork shape -->
    ${artShape}

    <!-- Artwork label -->
    <text x="${artX + artW / 2}" y="${baseline + 12}"
      text-anchor="middle"
      fill="rgba(201,169,110,0.65)"
      font-size="7.5"
      font-family="Inter,sans-serif">${dimLabel}</text>
  </svg>`;
}


/* ======================================================
   LIGHTBOX
   ====================================================== */
const lbEl       = document.getElementById('lightbox');
const lbImageWrap= document.getElementById('lbImageWrap');
const lbTitle    = document.getElementById('lbTitle');
const lbDetails  = document.getElementById('lbDetails');
const lbStatus   = document.getElementById('lbStatus');
const sizeVizCon = document.getElementById('sizeVizContainer');
const inquireBtn = document.getElementById('inquireBtn');

// Pan/Zoom state
const pz = { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 };
const PZ_MIN = 0.5, PZ_MAX = 10;

function getTransformEl() {
  return lbImageWrap.querySelector('.lb-img, .lb-placeholder');
}

function applyPZ() {
  const el = getTransformEl();
  if (el) el.style.transform = `translate(${pz.x}px, ${pz.y}px) scale(${pz.scale})`;
}

function resetPZ() {
  pz.scale = 1; pz.x = 0; pz.y = 0;
  applyPZ();
}

function openLightbox(galleryIndex) {
  // galleryIndex is the index in ARTWORKS array
  // Map to index in state.filtered
  const art = ARTWORKS[galleryIndex];
  const filtIdx = state.filtered.findIndex(a => a.id === art.id);
  state.lightboxIndex = filtIdx >= 0 ? filtIdx : 0;
  state.lightboxOpen  = true;

  lbEl.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderLightbox();
}

function closeLightbox() {
  lbEl.classList.remove('open');
  document.body.style.overflow = '';
  state.lightboxOpen = false;
  resetPZ();
}

function navigateLightbox(dir) {
  const len = state.filtered.length;
  state.lightboxIndex = (state.lightboxIndex + dir + len) % len;
  resetPZ();
  renderLightbox();
}

function renderLightbox() {
  const art = state.filtered[state.lightboxIndex];
  if (!art) return;

  /* Image / placeholder */
  const ar = (art.w / art.h).toFixed(4);
  if (art.image) {
    lbImageWrap.innerHTML = `<img class="lb-img" src="${art.image}" alt="${art.title}" style="--ar:${ar}">`;
  } else {
    const fn = art.image || suggestFilenameFromTitle(art.title);
    lbImageWrap.innerHTML = `
      <div class="lb-placeholder" style="--ar:${ar}">
        <svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
          <rect x="3" y="3" width="18" height="18" rx="1"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p class="ph-filename">Add photo: images/${fn}</p>
      </div>`;
  }

  /* Info panel */
  lbTitle.textContent = art.title;
  lbDetails.innerHTML = `
    <dt>Year</dt><dd>${art.year}</dd>
    <dt>Medium</dt><dd>${art.medium}</dd>
    <dt>Dimensions</dt><dd>${art.dimensions}</dd>`;

  lbStatus.className   = 'lb-status ' + (art.available ? 'available' : 'sold');
  lbStatus.textContent = art.available ? 'Available' : 'Sold';

  /* Size visualizer */
  sizeVizCon.innerHTML = buildSizeViz(art);

  /* Inquire button */
  inquireBtn.disabled = !art.available;
  inquireBtn.onclick  = () => openInquiry(art);

  resetPZ();
}

function suggestFilenameFromTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.jpg';
}

/* — Pan / Zoom bindings — */
lbImageWrap.addEventListener('wheel', (e) => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.12 : 0.9;
  pz.scale = Math.min(PZ_MAX, Math.max(PZ_MIN, pz.scale * factor));
  applyPZ();
}, { passive: false });

lbImageWrap.addEventListener('mousedown', (e) => {
  pz.dragging = true;
  pz.startX   = e.clientX - pz.x;
  pz.startY   = e.clientY - pz.y;
  lbImageWrap.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', (e) => {
  if (!pz.dragging) return;
  pz.x = e.clientX - pz.startX;
  pz.y = e.clientY - pz.startY;
  applyPZ();
});
window.addEventListener('mouseup', () => {
  pz.dragging = false;
  lbImageWrap.style.cursor = '';
});

lbImageWrap.addEventListener('dblclick', resetPZ);

/* Touch pinch-to-zoom */
let lastPinchDist = 0;
lbImageWrap.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastPinchDist = Math.hypot(dx, dy);
  }
}, { passive: true });
lbImageWrap.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    if (lastPinchDist > 0) {
      pz.scale = Math.min(PZ_MAX, Math.max(PZ_MIN, pz.scale * (dist / lastPinchDist)));
      applyPZ();
    }
    lastPinchDist = dist;
  }
}, { passive: false });

/* Lightbox controls */
document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => navigateLightbox(-1));
document.getElementById('lbNext').addEventListener('click', () => navigateLightbox(+1));

/* Keyboard navigation */
document.addEventListener('keydown', (e) => {
  if (!state.lightboxOpen) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   navigateLightbox(-1);
  if (e.key === 'ArrowRight')  navigateLightbox(+1);
});

/* Click outside panel to close */
lbEl.addEventListener('click', (e) => {
  if (e.target === lbEl) closeLightbox();
});


/* ======================================================
   INQUIRY MODAL
   ====================================================== */
const inquiryOverlay = document.getElementById('inquiryOverlay');
const inquiryModal   = document.getElementById('inquiryModal');
const inquiryClose   = document.getElementById('inquiryClose');
const inquiryPiece   = document.getElementById('inquiryPiece');
const inquiryForm    = document.getElementById('inquiryForm');
let   currentArtwork = null;

function openInquiry(art) {
  currentArtwork = art;
  inquiryPiece.textContent = art.title + ' (' + art.year + ')';
  inquiryForm.reset();
  // Remove any previous success message
  const existing = inquiryForm.querySelector('.form-success');
  if (existing) existing.remove();
  // Restore submit button
  const submitBtn = inquiryForm.querySelector('.inquiry-submit');
  if (submitBtn) submitBtn.style.display = '';

  inquiryOverlay.classList.add('open');
  inquiryModal.classList.add('open');
  document.getElementById('inqName').focus();
}

function closeInquiry() {
  inquiryOverlay.classList.remove('open');
  inquiryModal.classList.remove('open');
}

inquiryClose.addEventListener('click', closeInquiry);
inquiryOverlay.addEventListener('click', closeInquiry);

inquiryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name    = document.getElementById('inqName').value.trim();
  const email   = document.getElementById('inqEmail').value.trim();
  const message = document.getElementById('inqMsg').value.trim();

  if (!name || !email) return;

  const subject = `Inquiry: ${currentArtwork.title}`;
  const body    = [
    `Artwork: ${currentArtwork.title} (${currentArtwork.year})`,
    `From: ${name}`,
    `Reply-to: ${email}`,
    '',
    message || '(No additional message)',
  ].join('\n');

  window.location.href =
    `mailto:radiantarrays@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Show success note
  const submitBtn = inquiryForm.querySelector('.inquiry-submit');
  if (submitBtn) submitBtn.style.display = 'none';
  const success = document.createElement('p');
  success.className = 'form-success';
  success.textContent = 'Your inquiry is ready — a draft email should open in your mail client.';
  inquiryForm.appendChild(success);
});

/* Escape closes inquiry too */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && inquiryModal.classList.contains('open')) closeInquiry();
});


/* ======================================================
   VISUALIZE — Illustration-based colour tool
   Loads two PNG illustrations (light off / on) and applies
   colour tints via pixel-level multiply blend:
     · Pure white pixels OUTSIDE the circle → wall colour
     · Pure white pixels INSIDE  the circle → surface colour
     · All other pixels (black, grey) → unchanged
   ====================================================== */
(function initVisualize() {
  const canvas = document.getElementById('visualizeCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const MAX_DIM = 1600;
  const WHITE_THRESHOLD = 238; // pixels with R,G,B >= this are treated as "pure white"

  /* --- State --- */
  const vizState = {
    wallColor:    { r: 245, g: 240, b: 232 }, // #F5F0E8 warm white
    surfaceColor: { r: 245, g: 240, b: 232 }, // #F5F0E8 warm white
    lightOn: false,
    loaded: false,
  };

  let pixelsOff  = null;   // ImageData for visualize-no-light.png
  let pixelsOn   = null;   // ImageData for visualize-with-light.png
  let insideMask = null;   // Uint8Array — 1 = inside circle, 0 = outside
  let outImageData = null;
  let CW = 0, CH = 0;
  let renderPending = false;

  /* --- Hex → RGB --- */
  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }

  /* --- Initial dark placeholder --- */
  canvas.width  = 800;
  canvas.height = 800;
  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, 800, 800);

  /* --- Load both illustration PNGs --- */
  function loadImages() {
    let doneCount = 0;
    const tmp    = document.createElement('canvas');
    const tmpCtx = tmp.getContext('2d', { willReadFrequently: true });

    function onLoaded(key, img) {
      if (img) {
        /* Set canvas dimensions from first image that arrives */
        if (CW === 0) {
          const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
          CW = Math.round(img.naturalWidth  * scale);
          CH = Math.round(img.naturalHeight * scale);
          canvas.width  = CW;
          canvas.height = CH;
          outImageData  = ctx.createImageData(CW, CH);
          tmp.width  = CW;
          tmp.height = CH;
        }
        tmpCtx.clearRect(0, 0, CW, CH);
        tmpCtx.drawImage(img, 0, 0, CW, CH);
        if (key === 'off') pixelsOff = tmpCtx.getImageData(0, 0, CW, CH);
        else               pixelsOn  = tmpCtx.getImageData(0, 0, CW, CH);
      }
      doneCount++;
      if (doneCount === 2) {
        buildCircleMask();
        vizState.loaded = true;
        render();
      }
    }

    ['off', 'on'].forEach(key => {
      const img = new Image();
      img.onload  = () => onLoaded(key, img);
      img.onerror = () => onLoaded(key, null);
      img.src = key === 'off' ? 'visualize-no-light.png' : 'visualize-with-light.png';
    });
  }

  /* --- Build inside/outside mask via flood fill seeded from the wall region ---
     Always uses pixelsOff (no-light image) — it has a clean white wall with no
     shadow lines. The with-light image has radiating shadow lines extending into
     the wall area which would act as false barriers and corrupt the mask.
     Seeds the BFS from the true image perimeter (INSET=0) since the images have
     no solid black frame. The circle border acts as a closed barrier; every
     reachable pixel is "outside" (wall). White pixels not reachable are inside. */
  function buildCircleMask() {
    const src = pixelsOff;
    if (!src) return;
    const d = src.data;

    insideMask = new Uint8Array(CW * CH);

    /* Threshold: pixels with all channels below this are treated as barriers.
       100 catches the solid circle border AND its anti-aliased edge pixels (~80). */
    const BLACK_THRESH = 100;

    /* No inset needed — images have no solid black outer frame. */
    const INSET = 0;

    const outside = new Uint8Array(CW * CH);
    const queue   = new Int32Array(CW * CH);
    let qHead = 0, qTail = 0;

    function tryEnqueue(x, y) {
      if (x < 0 || x >= CW || y < 0 || y >= CH) return;
      const idx = y * CW + x;
      if (outside[idx]) return;
      const pi = idx * 4;
      /* Barrier: opaque pixel that is dark on all channels */
      if (d[pi] < BLACK_THRESH && d[pi + 1] < BLACK_THRESH && d[pi + 2] < BLACK_THRESH) return;
      outside[idx] = 1;
      queue[qTail++] = idx;
    }

    /* Seed from the true image perimeter — wall pixels start here. */
    for (let x = INSET; x < CW - INSET; x++) {
      tryEnqueue(x, INSET);
      tryEnqueue(x, CH - 1 - INSET);
    }
    for (let y = INSET + 1; y < CH - INSET - 1; y++) {
      tryEnqueue(INSET, y);
      tryEnqueue(CW - 1 - INSET, y);
    }

    while (qHead < qTail) {
      const idx = queue[qHead++];
      const x   = idx % CW;
      const y   = (idx / CW) | 0;
      tryEnqueue(x - 1, y);
      tryEnqueue(x + 1, y);
      tryEnqueue(x,     y - 1);
      tryEnqueue(x,     y + 1);
    }

    /* insideMask = 1 for white pixels that were NOT reachable from the wall */
    const T = WHITE_THRESHOLD;
    for (let i = 0; i < CW * CH; i++) {
      const pi = i * 4;
      insideMask[i] = (d[pi] >= T && d[pi + 1] >= T && d[pi + 2] >= T && !outside[i]) ? 1 : 0;
    }
  }

  /* --- Render: pixel-level multiply tint on pure-white regions only --- */
  function scheduleRender() {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => { renderPending = false; render(); });
  }

  function render() {
    if (!vizState.loaded) return;

    const pixels = vizState.lightOn ? pixelsOn : pixelsOff;
    if (!pixels) return;

    const src = pixels.data;
    const out = outImageData.data;
    const wR = vizState.wallColor.r,    wG = vizState.wallColor.g,    wB = vizState.wallColor.b;
    const sR = vizState.surfaceColor.r, sG = vizState.surfaceColor.g, sB = vizState.surfaceColor.b;
    const n   = src.length;
    const T   = WHITE_THRESHOLD;

    for (let i = 0; i < n; i += 4) {
      const r = src[i], g = src[i + 1], b = src[i + 2];

      if (r >= T && g >= T && b >= T) {
        /* Pure white pixel — apply colour via multiply blend */
        if (insideMask && insideMask[i >> 2]) {
          /* Inside circle → surface colour */
          out[i]     = (r * sR / 255) | 0;
          out[i + 1] = (g * sG / 255) | 0;
          out[i + 2] = (b * sB / 255) | 0;
        } else {
          /* Outside circle → wall colour */
          out[i]     = (r * wR / 255) | 0;
          out[i + 1] = (g * wG / 255) | 0;
          out[i + 2] = (b * wB / 255) | 0;
        }
      } else {
        /* Non-white pixel (black border, grey shadows, nails) — unchanged */
        out[i]     = r;
        out[i + 1] = g;
        out[i + 2] = b;
      }
      out[i + 3] = src[i + 3];
    }

    ctx.putImageData(outImageData, 0, 0);
  }

  /* --- UI controls --- */
  function bindControls() {
    const wallPicker  = document.getElementById('wallColorPicker');
    const surfPicker  = document.getElementById('surfaceColorPicker');
    const wallHexEl   = document.getElementById('wallColorHex');
    const surfHexEl   = document.getElementById('surfaceColorHex');
    const toggleBtn   = document.getElementById('lightToggleBtn');
    const toggleLabel = document.getElementById('lightToggleLabel');

    if (wallPicker) {
      wallPicker.addEventListener('input', e => {
        const hex = e.target.value;
        vizState.wallColor = hexToRgb(hex);
        if (wallHexEl) wallHexEl.textContent = hex.toUpperCase();
        updateActiveSwatches('wall', hex);
        scheduleRender();
      });
    }

    if (surfPicker) {
      surfPicker.addEventListener('input', e => {
        const hex = e.target.value;
        vizState.surfaceColor = hexToRgb(hex);
        if (surfHexEl) surfHexEl.textContent = hex.toUpperCase();
        updateActiveSwatches('surface', hex);
        scheduleRender();
      });
    }

    /* Light toggle button — fade out, swap illustration, fade in */
    let fadeTimer = null;
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        vizState.lightOn = !vizState.lightOn;
        toggleBtn.setAttribute('aria-pressed', String(vizState.lightOn));
        toggleBtn.classList.toggle('light-on', vizState.lightOn);
        if (toggleLabel) toggleLabel.textContent = vizState.lightOn ? 'Light On' : 'Light Off';

        canvas.style.opacity = '0';
        clearTimeout(fadeTimer);
        fadeTimer = setTimeout(() => {
          render();
          canvas.style.opacity = '1';
        }, 220);
      });
    }

    /* Preset swatches — wall and surface handled by data-target */
    document.querySelectorAll('.preset-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        const target = sw.dataset.target;
        const hex    = sw.dataset.color;
        if (target === 'wall') {
          vizState.wallColor = hexToRgb(hex);
          if (wallPicker) wallPicker.value = hex;
          if (wallHexEl)  wallHexEl.textContent = hex.toUpperCase();
          updateActiveSwatches('wall', hex);
        } else if (target === 'surface') {
          vizState.surfaceColor = hexToRgb(hex);
          if (surfPicker) surfPicker.value = hex;
          if (surfHexEl)  surfHexEl.textContent = hex.toUpperCase();
          updateActiveSwatches('surface', hex);
        }
        scheduleRender();
      });
    });

    /* Mark default active swatches */
    updateActiveSwatches('wall',    '#f5f0e8');
    updateActiveSwatches('surface', '#f5f0e8');
  }

  function updateActiveSwatches(target, hex) {
    const norm = hex.toLowerCase();
    document.querySelectorAll(`.preset-swatch[data-target="${target}"]`).forEach(sw => {
      sw.classList.toggle('active', sw.dataset.color.toLowerCase() === norm);
    });
  }

  bindControls();
  loadImages();
}());


/* ======================================================
   MISC — Footer year, scroll-reveal for non-gallery sections
   ====================================================== */
(function misc() {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll-reveal for about / contact sections
  const revealEls = document.querySelectorAll('#about .about-layout, #contact .contact-inner');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition= 'opacity 0.9s ease, transform 0.9s ease';
    obs.observe(el);
  });
})();
