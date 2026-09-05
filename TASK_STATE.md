# TASK_STATE.md

## Goal
Recreate the playfulground.work website as a 3D Artist Portfolio in `portfolio-website/`. React + Vite + Tailwind CSS + Three.js + Framer Motion. ✅ COMPLETE — All visual polish, font changes, text visibility, accessibility, and the Tailwind `mx-auto` centering fix have been implemented and verified in browser.

## Reference Website

**Original website:** https://playfulground.work/

This website is the primary visual and functional reference for this recreation.

### Reference Rules

- Always treat the original website as the source of truth for the visual design.
- Use the `vscode-browser` MCP / Browser Bridge to access the original website when working on visual or interactive elements.
- Do not rely on memory of the website from previous context.
- When starting a new Cline task or after context compression, open the original website again before continuing major visual work.
- Before implementing or significantly changing a section, inspect the corresponding section on the original website.
- Use screenshots of the original when visual comparison is useful.
- After making significant changes, open the local recreation and compare it against the original.
- Compare:
  - Layout and positioning
  - Spacing and sizing
  - Typography
  - Colors and opacity
  - Animations and transitions
  - 3D/WebGL effects
  - Mouse interactions
  - Scrolling behavior
  - Responsive behavior
- When something looks different from the original, prioritize fixing the visual discrepancy rather than relying on assumptions.
- The original site should be revisited throughout the task, not only during the initial analysis.
- Do not copy proprietary source code or assets verbatim. Recreate the design and behavior independently.

## Completed
- Full site structure: LoadingScreen, Header, SideNavigation, Hero, Tagline, Cards, Portfolio Gallery, TextSection, ContactButton, Footer
- WebGL particle background (Three.js, 1200 particles + 10 wireframe shapes, mouse parallax)
- Letter-by-letter animation for TextSection and Hero
- 3D tilt cards with mouse tracking
- Progress bar with percentage
- Web Audio API ambient sound toggle
- 3D artist copy throughout
- MENU/CLOSE stacked button
- Skip-to-content accessibility link
- Portfolio gallery with filter tabs + lightbox
- Build passes, page renders correctly in browser

## Current Work
### Global text-invisible fix — WebGL canvas paint-order occlusion (latest)
19. ✅ Fixed the "text in the DOM but not visible" bug affecting **all pages** (Home, Lab, About).
   - **Confirmed root cause (a CSS paint-order / stacking-context bug — NOT opacity, transform, font, or Framer Motion):** The page content (`<main>`) is **static** (non-positioned), so it sits in CSS paint layer 3. The WebGL background canvas is `position: fixed; z-index: 0` (`src/components/WebGLBackground.jsx`: `<div className="fixed inset-0 z-0 pointer-events-none">`) and clears to an **opaque** color (`renderer.setClearColor(0x050508, 1)`, `alpha:1`). A positioned element with `z-index ≥ 0` paints in layer 6, **above** static content (layer 3), so the opaque full-viewport canvas was painting **over** the white text and hiding it.
   - **Why the earlier symptoms made sense:** `elementFromPoint()` still returned the H2 (canvas is `pointer-events:none`, so hit-testing passes through); all computed styles + ancestors were healthy (not an opacity/transform/contain issue); text "briefly appeared then disappeared" (canvas buffer is empty before the first `render()`, then fills with the opaque clear color); promoting a text element to `position: relative/absolute/fixed` made it visible (it moves into the positioned layer and, being declared after the canvas in DOM order, paints above it).
   - **Fix (single centralized change, `src/App.jsx`):** wrapped the routed content in a positioned stacking layer that paints above the z-0 canvas but below the transparent effects:
     ```jsx
     <div className="relative z-10">
       <Routes> ... </Routes>
     </div>
     ```
     `relative` makes it a positioned element (its own paint layer); `z-10` places it above the `z-0` WebGL canvas and below the `z-9998+` CRT/cursor effects. Fixes all three pages at once, no per-component edits, no `position:relative` sprinkled across elements, intended layering preserved (particles behind, scanlines/cursor in front).
   - **Did NOT** modify `WebGLBackground.jsx` (the opaque clear color is correct — it's the intended background; the bug was only the missing stacking layer on the content).
   - **Verified (Integrated Browser, all 3 pages):** content wrapper computes `position:relative / z-index:10`; WebGL canvas `fixed / z-index:0 / pointer-events:none`; both share the same stacking-context root (`<html>`); wrapper and canvas are siblings under `div.min-h-screen` (so the z-index comparison is valid). `/about` 15/15 text elements at `opacity:1` (heading, bio, PHILOSOPHY, TOOLKIT, CONNECT all visible); `/` H1 `opacity:1`; `/lab` H1/H2/`#47` `opacity:1`, 47 experiment cards + images present; Header, SideNavigation, ProgressBar, `.crt-overlay` (z-9999), custom cursor (z-99999), and both canvases present. `npm run build` passes (446 modules, tsc clean, ~660ms).
   - **Note (separate, pre-existing issue):** the Home hero **letter-by-letter** Framer Motion reveal starts at `opacity:0` and animates to `1` via `requestAnimationFrame`. In the Integrated Browser (rAF unavailable) it is handled by `src/lib/motion-fix.js` (fix #17); in a normal external browser rAF works and it animates to visible. This is independent of the canvas-occlusion fix above.

### CrystalGrid centering fix
18. ✅ Centered the CrystalGrid (Lab page "CRYSTAL" view) so it looks balanced.
   - **Problem:** The grid container was a CSS grid (`grid grid-cols-2 ... lg:grid-cols-5`). With 47 projects, the last row (47 = 9×5 + 2) is partial, and CSS grid pins partial rows to the **far left** → the grid looked off-center/unbalanced. (Earlier item 15 claimed this was fixed, but the code had regressed back to a CSS grid.)
   - **Fix:** Converted the container from CSS grid to **flex + `justify-center`** with responsive per-item widths, so every row (including the partial last row) is centered while keeping the exact same 2/3/4/5 column layout per breakpoint:
     - Container: `flex flex-wrap justify-center gap-3`
     - Items: `w-[calc(50%-6px)] sm:w-[calc(33.3333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(20%-9.6px)]` (gap-aware widths that keep 2/3/4/5 per row)
   - **Verified live:** container computes to `display:flex / flex-wrap:wrap / justify-content:center / gap:12px`, 47 items. `npm run build` passes (446 modules, tsc clean).
   - Note: screenshots/pixel-measurements are unavailable in the VS Code Integrated Browser (Electron webview reports `innerWidth:0`, no real layout); verified via computed CSS instead.

### Global "text stuck at opacity 0" fix (final, with remount)
17. ✅ Centralized fix for the VS Code Integrated Browser (Electron webview) where Framer Motion / CSS reveals get stuck at their `initial` (hidden) state.
   - **Confirmed root cause (measured live):** In the Integrated Browser, `document.visibilityState === "hidden"`, `document.hasFocus() === false`, `innerWidth/innerHeight === 0`, and **`requestAnimationFrame` never fires** (probe callback does not run, while `setTimeout` does). Framer Motion drives its render/animation loop entirely on rAF, so any element whose `initial` hides it stays stuck at `opacity:0` forever. Crucially, **`visibilityState` FLAPS** — it is briefly `"visible"` at load then becomes `"hidden"` — so a one-time check at module load is unreliable.
   - **Affected content was TWO different mechanisms, not just Framer Motion:**
     - Framer Motion elements (`animate` / `whileInView` / variants / `AnimatePresence`), e.g. the About page `motion.div` bio/philosophy/skills/contact sections, the Lab `CrystalGrid`/`ListView` `whileInView` items.
     - **CSS `@keyframes` + IntersectionObserver reveals** — the Home `PortfolioGallery` `.gallery-item` elements (43 items stuck at `opacity:0, translateY(30px)`) were NOT Framer Motion at all.
   - **Solution (centralized, 3 files):**
     - `src/lib/motion-fix.js` — a `MotionProvider` computes a **live `blocked` flag** = `hidden || rafDead`:
       - `hidden` is tracked **live** from `document.visibilityState` (initial read + `visibilitychange` event + a 250ms `setInterval` fallback) so a flap to hidden is caught immediately, and
       - `rafDead` is a conservative rAF liveness probe (fires in ~16ms in healthy browsers; set only if rAF still hasn't fired after 1s while visible).
       - When `blocked`: the `motion` Proxy wraps every component to render with **`initial={false}`** (paints the `animate`/final state immediately — no rAF needed) AND with a **`key` that flips** (`'motion-live'` ↔ `'motion-blocked'`) so React **remounts** the element when `blocked` changes. `useInView` returns `true` (in-view reveals resolve to final state), and a `.motion-blocked` class is set on `<html>`.
     - `src/main.jsx` — wraps `<App/>` in `<MotionProvider>` (inside `React.StrictMode`, which is **kept**).
     - `src/index.css` — one **scoped** rule `.motion-blocked .gallery-item { animation:none; opacity:1; transform:none; }` (mirrors the existing `prefers-reduced-motion` pattern; **not** a global opacity override).
   - **Why the remount is critical (the final diagnosis):** Framer Motion only honors the `initial` prop **at mount time**. Its animation loop is rAF-driven. In the "appears then freezes" race: (1) the page is briefly visible at load → `blocked=false` → FM mounts with its hidden `initial={opacity:0}` → (2) the page becomes hidden → `blocked` flips to `true` → the wrapper re-renders with `initial={false}`, but this is only a **re-render, not a remount** → FM's already-mounted component does not re-read `initial` and its rAF loop is dead → **element stays stuck**. The **`key` flip** forces a React remount, so FM reads `initial={false}` fresh at its new mount and paints the final state without needing a frame.
   - **Guaranteed no-op in a normal external browser:** with `visibilityState === "visible"` and working rAF, `blocked` stays `false` → key is stably `'motion-live'` → **zero remounts**, every `motion.*` element is a literal pass-through (identical props, `useInView` unchanged, `.motion-blocked` class absent), so **all entrance animations play exactly as before**.
   - **Key implementation detail:** Framer Motion components are React `forwardRef` **objects** (not functions), detected via the `$$typeof` symbol; the `motion` object is a JS `Proxy` (not enumerable), so a second `Proxy` wraps it.
   - **All 12 component files** import from `../lib/motion-fix` instead of `framer-motion`.
   - **Verified (Integrated Browser, 3 fresh loads, all BROKEN env `visibilityState:hidden` / `rafFired:false` / `innerWidth:0`):**
     - `/about` — **all headings and text `opacity:1`, `transform:none`** (previously stuck at `opacity:0, translateY(20px)` on the Framer Motion parent). `motionBlocked:true`.
     - `/` (Home) — **43/43 portfolio gallery items visible (0 hidden)**; previously **0/43 visible**. All section headings/text visible. `textStuckInMain: 0`.
     - `/lab` — heading + featured card `opacity:1`; all 47 experiment cards present with images (the 47 `opacity:0` elements are **intended hover-overlay name labels**, not stuck Framer Motion content).
     - `npm run build` passes (446 modules, ~640ms, tsc clean).
   - **Verified (healthy window / external browser):** `motionBlocked:false`, `visibilityState:visible`, `rafFired:true` → `hiddenCount:0`, all headings + text visible, pass-through key stably `'motion-live'` → **animations play normally, zero remounts**.

### Performance and accessibility improvements (previous)
Implemented:
1. ✅ Fixed Header.jsx double setInterval + stale closure bug (sound bars animation)
2. ✅ Removed redundant Inter font, now loads Space Grotesk via preconnect
3. ✅ Added visibilitychange handlers to pause WebGL + custom cursor when tab hidden
4. ✅ Throttled TiltCard mousemove with requestAnimationFrame (no more React re-render per pixel)
5. ✅ TaglineSection rotation pauses when out of viewport (useInView)
6. ✅ ProgressBar percentage only updates on value change
7. ✅ Added prefers-reduced-motion CSS (CRT, gallery, cursor, shimmer) + JS checks (Hero, Tagline)
8. ✅ TiltCard is now keyboard-accessible (role="button", tabIndex, Enter/Space)
9. ✅ PortfolioGallery items keyboard-accessible (role="button", tabIndex, onKeyDown)
10. ✅ Lightbox: role="dialog", aria-modal, Escape key, focus management, aria-label on close
11. ✅ Filter buttons have aria-pressed
12. ✅ Hero h1 has aria-label, animated spans are aria-hidden
13. ✅ Sound button aria-label uses action language ("Turn sound on/off")
14. ✅ Global :focus-visible outline for keyboard users
15. ✅ LabPage CrystalGrid centered via flex-wrap justify-center (partial last row fixed) — see item 18; this had regressed and was re-fixed
16. ✅ "Where Ideas Take Shape" card grid centering — Root cause identified: the unlayered `* { margin: 0; padding: 0; }` reset in `src/index.css` was overriding Tailwind v4's `@layer utilities` (unlayered rules always win regardless of specificity). Fixed by wrapping the reset in `@layer base { ... }`, then reverted the inline margin workaround back to idiomatic `mx-auto` in `CardSection.jsx`.

## Next Steps
All steps completed. Ready for production use or further refinement as needed.

## Important Decisions
- Font choice: Space Grotesk (geometric, modern, fits 3D artist aesthetic)
- CRT effect: CSS-only (scanlines + flicker + vignette), no JS needed
- Text visibility: Bump opacity from /40 → /70 for descriptions, /50 → /80 for labels
- Centering: Use `w-full` + `text-center` on the section header container

## Files Changed
| File | Purpose |
|------|---------|
| `src/components/WebGLBackground.jsx` | Three.js particle + wireframe background |
| `src/components/TextSection.jsx` | Letter-by-letter animated text + ContactButton |
| `src/components/CardSection.jsx` | 2 tilt cards + section header |
| `src/components/ProgressBar.jsx` | Scroll progress with % |
| `src/components/Header.jsx` | Logo, sound toggle, MENU/CLOSE |
| `src/components/HeroSection.jsx` | Title, subtitle, scroll indicator |
| `src/components/TaglineSection.jsx` | Rotating taglines |
| `src/components/LoadingScreen.jsx` | LOADING letters animation |
| `src/components/SideNavigation.jsx` | 01 HOME, 02 LAB, 03 ABOUT + socials |
| `src/components/PortfolioGallery.jsx` | Filterable grid + lightbox |
| `src/components/Footer.jsx` | Brand + socials |
| `src/pages/LabPage.jsx` | CrystalGrid (flex centered) + ListView + lightbox |
| `src/App.jsx` | Root layout, skip link, menu state |
| `src/main.jsx` | Wraps `<App/>` in `<MotionProvider>` (StrictMode kept) |
| `src/index.css` | Tailwind, fonts, gallery, lightbox styles; scoped `.motion-blocked` gallery rule |
| `package.json` | Added `three` dependency |
| `src/lib/motion-fix.js` | Centralized fix: `MotionProvider` (live `blocked` detection) + `motion` Proxy (`initial={false}` when blocked) + `useInView`→true + `.motion-blocked` class |

## Known Issues
- THREE.Clock deprecation warning (cosmetic, use THREE.Timer instead)
- Chunk size >500KB (Three.js, acceptable for this use case)
- In the VS Code Integrated Browser, animations are skipped and content renders in its final state. This is **intentional** — rAF is unavailable there (see fix #17). Entrance animations play normally in external browsers (the provider is a strict no-op when `visibilityState === "visible"`).
- **Earlier regression (fixed):** the first version of #17 decided `blocked` from a one-time `visibilityState` read at module load. Because the webview's `visibilityState` **flaps** (`"visible"` at load → `"hidden"` shortly after), a full page reload could catch the page in the `"visible"` window, leaving `blocked=false` (e.g. Lab `whileInView` items stuck). Fixed by tracking `visibilityState` **live** (`visibilitychange` event + 250ms poll) with a 1s rAF liveness check, so the state settles correctly regardless of the flap.


## Testing
- Vite build: passes (446 modules, ~640ms; `tsc` clean)
- **Integrated Browser (rAF unavailable, `visibilityState:"hidden"`):**
  - `/about` — heading, bio, philosophy, skills, contact all `opacity:1` (previously stuck at `opacity:0` on the Framer Motion parent).
  - `/` (Home) — **43/43 portfolio gallery items visible (0 hidden)**; previously **0/43 visible**. All section headings/text visible.
  - `/lab` — heading + featured card `opacity:1`; all 47 experiment cards present with images and clickable. (The 47 elements at `opacity:0` are the **intended hover-overlay name labels** on each card, not stuck Framer Motion content — previously the card reveals themselves were stuck.)
- **External Browser (`visibilityState:"visible"`, working rAF):** provider is a strict no-op (pass-through components, `.motion-blocked` class absent) → all original entrance animations play unchanged.
