# Playful Ground — How To Guide

## 1. Launching the Website

### Prerequisites
- **Node.js 18+** installed (`node --version` to check)
- **npm** (comes with Node.js)

### First-time setup
```bash
cd playful-ground-recreation
npm install
```

### Development server (hot-reload)
```bash
npm run dev
```
Opens at **http://localhost:5173**. Any file you edit saves and the browser updates instantly.

### Production build
```bash
npm run build
```
Outputs a fully static site to the `dist/` folder. This is what you deploy.

### Preview the production build locally
```bash
npm run preview
```
Serves `dist/` at a local URL so you can test the build before deploying.

---

## 2. Adding More Photos to the Portfolio Grid

Two steps:

### Step 1 — Add the image file
Place your image (PNG, JPG, WebP, etc.) into the **`public/`** folder:
```
playful-ground-recreation/public/myNewRender.png
```

### Step 2 — Register it in code
Open `src/components/PortfolioGallery.jsx` and add one line to the `portfolioImages` array at the top (line 3):

```js
const portfolioImages = [
  { src: '/1337H4Xrender.png', category: '3D Render', title: '1337H4X' },
  // ... existing entries ...
  { src: '/myNewRender.png', category: '3D Render', title: 'My New Render' },  // ← new
];
```

| Field | What it does |
|-------|-------------|
| `src` | Path to the file. **Always starts with `/`** because it lives in `public/`. Case-sensitive. |
| `category` | Existing category (see list below) **or a new one**. New categories automatically appear as filter buttons. |
| `title` | Display name shown on hover overlay and in the lightbox. |

### Existing categories
`3D Render`, `Character`, `Environment`, `Agency`, `Seasonal`, `Art`, `Abstract`, `Pop Culture`, `Weapon Render`, `Horror`, `Photography`

### That's it
The grid, filter buttons, lightbox, lazy-loading, shimmer placeholder, and accessibility attributes all update automatically from the data. No other file changes needed.

---

## 3. Changing the Two Tilt Cards (above the grid)

Edit the `cards` array at the top of `src/components/CardSection.jsx` (line 5):

```js
const cards = [
  {
    title: 'WebGL & 3D Experiments',
    description: 'Interactive 3D scenes...',
    image: '/1337H4Xrender.png',   // ← change this to your image in public/
    link: '/lab',
    linkText: 'EXPLORE LAB',
  },
  // ...
];
```

---

## 4. Changing Other Text / Content

| What | Where |
|------|-------|
| Hero title ("Playful Ground") | `src/components/HeroSection.jsx` |
| Tagline rotation ("Animate. Iterate. Play." etc.) | `src/components/TaglineSection.jsx` |
| "Where Ideas Take Shape" heading + cards | `src/components/CardSection.jsx` |
| Portfolio heading + subtitle | `src/components/PortfolioGallery.jsx` (lines 105-106) |
| Contact text + button | `src/components/TextSection.jsx` |
| Footer copyright + socials | `src/components/Footer.jsx` |
| Side nav links (01 HOME, 02 LAB, 03 ABOUT) | `src/components/SideNavigation.jsx` |
| Header logo + sound + menu | `src/components/Header.jsx` |
| Page routes (`/`, `/lab`, `/about`) | `src/App.jsx` |

---

## 5. Deploying / Sharing the Site

### Build
```bash
npm run build
```

### Host `dist/` on a static platform

| Platform | How |
|----------|-----|
| **Netlify** | Drag-and-drop `dist/`, or connect repo with build command `npm run build` + publish dir `dist` |
| **Vercel** | Connect repo, framework preset "Vite", or drag-and-drop `dist/` |
| **GitHub Pages** | Push `dist/` contents to a `gh-pages` branch |
| **Any web server** | Serve the `dist/` folder contents as root |

### SPA routing (important)
The site uses React Router with `/lab` and `/about` routes. Static hosts need a **fallback redirect** so these paths don't 404 on hard refresh:

- **Netlify:** Add `public/_redirects` with content: `/* /index.html 200`
- **Vercel:** Add `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- **GitHub Pages:** Add `404.html` that is a copy of `index.html`, or use a `_headers` trick

---

## 6. Things to Know

### Images must be in `public/`
Files in `public/` are served at the root path (`/filename.png`). The `src` field in `PortfolioGallery.jsx` always starts with `/` to reference them. Files in `src/` are not accessible at the URL root — they must be imported, which this project doesn't do.

### File size matters
The current portfolio uses ~44 PNGs, which is why the Vite build warns about chunk size >500KB. For new photos, prefer **WebP** or **JPEG** over PNG when possible to keep page weight down. A 2MB PNG becomes ~200KB as WebP with similar visual quality.

### Custom cursor
Only visible on devices with a fine pointer (`@media (pointer: fine)` in `index.css`). On touch devices, the normal OS cursor is used.

### Reduced motion
Respects `prefers-reduced-motion`: disables CRT animation, gallery fade-in, shimmer, and hides the custom cursor.

### Sound
Uses the Web Audio API. Browsers require a user gesture (click) before audio can start — that's why the sound toggle button exists in the header rather than auto-playing.

### Tailwind v4 layering
The project uses **Tailwind CSS v4** (`@import "tailwindcss"` + `@tailwindcss/postcss`). Custom CSS in `index.css` that needs to be overridable by Tailwind utilities must go inside `@layer base` or `@layer components`. Unlayered CSS beats Tailwind utilities because unlayered rules always win in the cascade.

### Dev server auto-reload
Vite's HMR (Hot Module Replacement) means you can edit any `.jsx` or `.css` file in `src/` and see the change instantly in the browser without restarting.

### `TASK_STATE.md`
This file tracks project status, decisions, and known issues. Update it as you make significant changes so future sessions have context.

---

## 7. Quick Troubleshooting

| Symptom | Likely cause / fix |
|---------|-------------------|
| Image shows shimmer but never loads | File missing from `public/`, or `src` path is wrong (case-sensitive: `MyImage.png` ≠ `myimage.png`) |
| New category button doesn't appear | Category string has a typo or extra space — must match exactly |
| `/lab` or `/about` gives 404 after deploy | Static host needs SPA fallback (see §5) |
| `npm run dev` fails with "vite not found" | Run `npm install` first |
| Fonts don't load | Google Fonts is loaded via CSS `@import` — needs internet. For offline, self-host the font files. |
| Page looks unstyled | Tailwind not processing — check that `postcss.config.js` has `@tailwindcss/postcss` and `index.css` starts with `@import "tailwindcss"` |

---

## 8. Project Structure (quick reference)

```
playful-ground-recreation/
├── public/              ← All images + favicon live here
├── src/
│   ├── App.jsx          ← Routes, layout, menu state
│   ├── main.jsx         ← React entry point
│   ├── index.css        ← Tailwind import, custom CSS, gallery, lightbox
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LabPage.jsx
│   │   └── AboutPage.jsx
│   └── components/
│       ├── LoadingScreen.jsx
│       ├── Header.jsx
│       ├── SideNavigation.jsx
│       ├── HeroSection.jsx
│       ├── TaglineSection.jsx
│       ├── CardSection.jsx       ← 2 tilt cards
│       ├── PortfolioGallery.jsx  ← Grid + filters + lightbox
│       ├── TextSection.jsx
│       ├── ProgressBar.jsx
│       ├── WebGLBackground.jsx   ← Three.js particles
│       ├── CustomCursor.jsx
│       └── Footer.jsx
├── index.html
├── vite.config.js
├── postcss.config.js
├── package.json
├── scripts/
│   └── generate-thumbs.mjs ← /lab 512×512 WebP thumbnail generator
└── TASK_STATE.md
```

---

## 9. Adding / Updating Artwork on the `/lab` Page

The `/lab` page renders each project's **grid & list thumbnails as 512×512 WebP** (in `public/thumbs/`) for speed, while the **lightbox always opens the original full-resolution PNG** from `public/`. A small script (`scripts/generate-thumbs.mjs`) generates those WebP thumbnails, wired up as an npm script.

### How the thumbnail path is derived
`src/pages/LabPage.jsx` keeps the original path in each project's `image` field (e.g. `'/Christmas.png'`). The grid and list derive the thumbnail automatically from that value:

```js
const thumbUrl = (originalPath) => originalPath.replace(/\.png$/i, '.webp').replace(/^/, '/thumbs/');
// '/Christmas.png'  →  '/thumbs/Christmas.webp'
```

So **you never write a thumbnail path by hand** — the lightbox uses `project.image` (original), the grid/list use `thumbUrl(project.image)`.

### Adding a new artwork (3 steps)
1. **Add the image** to `public/`, e.g. `public/MyNewRender.png`.
2. **Register it** in the `projects` array in `src/pages/LabPage.jsx`:
   ```js
   { id: 48, title: 'My New Render', image: '/MyNewRender.png' },
   ```
3. **Generate its thumbnail**:
   ```bash
   npm run thumbnails
   ```
   This discovers the new PNG, creates `public/thumbs/MyNewRender.webp` (512×512, centered crop, WebP quality 78), and **skips every thumbnail that already matches its source**.

### Updating an existing artwork
Overwrite `public/Existing.png`, then run `npm run thumbnails`. Only `public/thumbs/Existing.webp` is regenerated (its source is now newer); the rest are skipped.

### How "skip unchanged" works (mtime freshness)
For each project image, the script compares the **last-modified time** of the source PNG against the existing thumbnail:
- Thumbnail missing or empty → **regenerated**.
- Source PNG is **newer** than the thumbnail (you edited the image) → **regenerated**.
- Thumbnail is newer/equal and non-empty → **skipped** (left exactly as-is).

So re-running `npm run thumbnails` is safe and idempotent — it never re-encodes or overwrites a thumbnail whose source hasn't changed.

### Command reference
| Command | What it does |
|---------|-------------|
| `npm run thumbnails` | Generate missing/outdated 512×512 WebP thumbs from the Lab PNGs (skips unchanged). Reports `Generated` vs `Skipped` counts. |

### Things to know
- **Originals are never modified.** The script only reads `public/*.png` and writes `public/thumbs/*.webp`.
- **Only Lab images are processed.** The script reads the `projects` array in `LabPage.jsx`, so unrelated PNGs in `public/` are ignored and never turned into Lab thumbnails.
- **Removing an artwork:** delete its `projects` entry. Its now-unreferenced `public/thumbs/<name>.webp` and original PNG can be deleted manually — the script never auto-deletes files.
