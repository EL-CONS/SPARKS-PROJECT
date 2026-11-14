# Design audit (web-design-guidelines)

Rules fetched 2026-11-05 from `vercel-labs/web-interface-guidelines/command.md`. Files reviewed: `app/index.html`, `app/src/*.ts`, `app/src/styles/*.css`. Also checked with Playwright at 1440×900 and 390×844 (`tests/e2e/run_e2e.py`, `tests/e2e/shots.py`).

## Pass 1 · after M2/M5 (2026-11-05)

### Fixed
- `index.html` – no `<h1>` → visually hidden h1 added.
- `index.html` – no preconnect for jsDelivr (Aladin) → added.
- `stage.ts` – clickable `div.panel-sky` (tap to enlarge) → `role="button"`, `tabindex=0`, `aria-label`, Enter key.
- `panes.ts` – candidate rows clickable without keyboard → Enter/Space handler (rows already `role="button"`, `tabindex=0`).
- `i18n.ts` – placeholder did not end with `…` → fixed (EN/ES).
- `app.css` – no `touch-action: manipulation` / tap highlight → added.
- `app.css` – headings without `text-wrap: balance` → added.
- `app.css` – dialog without `overscroll-behavior: contain` → added.
- Brand and target names marked `translate="no"`.
- Colour contrast measured (WCAG 2.x formula): `--plate-faint` was 3.8:1 on `--chassis-2` → changed to `#858D9B` (≥ 5.2:1 on all surfaces). Table in `DESIGN.md` §5.

### Pass (no change needed)
- Icon-only buttons have `aria-label` (prev/play/next); language buttons use `aria-pressed`; modes use `role="radio"` + `aria-checked` + arrow keys; tabs use `role="tab"` + `aria-selected`.
- Visible focus everywhere (`:focus-visible` 2 px amber ring); the coordinate field replaces its outline with an amber border + glow.
- `prefers-reduced-motion`: durations go to 0, the flipbook does not autoplay, no spark flash. The flipbook (autoplay > 5 s) always has a pause button.
- No `transition: all`; only transform, colour and border transitions.
- `color-scheme: dark`, `<meta name="theme-color">` = page background; native `<select>` with explicit background and colour.
- Status messages use `role="status"` + `aria-live="polite"`.
- Numbers use `tabular-nums` globally.
- Full state in the URL (view, detector, seasons, FOV, step, flags, catalogs, language); Share and Embed dialogs.
- No horizontal scroll at 390 px (e2e test), play button on the first screen at 390 px (e2e test), touch targets ≥ 44 px on phones.

### Deliberate deviations
- **Sentence case** for buttons and headings instead of Title Case: `DESIGN.md` §2 (typography) wins; it reads calmer and is consistent in Spanish.
- **ISO dates** (`2025-08-27`) instead of `Intl.DateTimeFormat`: astronomical data are dated in ISO/UTC; localised dates would hide the timezone.
- Canvas sky images are `role="img"` with a text label (detector, λ, date); they are data, not decorative.
