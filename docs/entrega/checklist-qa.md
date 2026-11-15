# Manual QA Checklist · Sparks

Test checklist to run on the integrated branch (`carlos` or `main`) before Sunday submission.

**How to start locally (on the integrated branch):**

```bash
cd app
npm install
npm run dev
```

Open the local URL (`http://localhost:5173`) in a browser. Record any failure with screenshot, exact URL, viewport resolution, and console message.

---

## 1. Viewports and Responsive Layout (`390 px` and `1440 px`)

- [ ] **Desktop (`1440 × 900`):**
  - Header shows logo, tabs (`Home` / `Explore`), language toggle (`ES`/`EN`), and `NASA Space Apps Challenge 2026` badge without overlaps.
  - No horizontal overflow (`scrollWidth <= innerWidth`) on `Home` or across all 3 steps of `Explore`.
  - The polar scope (`SkyScope`) and 6-detector stage (`D1`–`D6`) display readable labels without clipping or overlapping.
- [ ] **Mobile (`390 × 844`):**
  - The Space Apps badge switches to its compact variant without overflowing the header.
  - Target pins in the polar scope, coordinate input `#q`, mode buttons (`Blink` / `Stack` / `Subtract`), playback controls (`1/2/3 Hz`), and `Insights` charts fit within `390 px` width without horizontal scrolling.
  - Footer and step navigation (`Back` / `Next`) remain touch-friendly and accessible.

---

## 2. Single Dark Theme

- [ ] **Dark mode only (no light-mode toggle, decision `bd9a632`):** deep-space background `#06080C`, high-contrast readable text, dimmed `Starfield` in `explore` mode (`quiet`), light logo (`symbol.svg`, `spaceapps-color-white.svg`), and clearly distinguishable blue (**before**) and amber (**now**) markers in `Subtract B−A`.

---

## 3. Keyboard Navigation and Accessibility

- [ ] **Skip link:** pressing `Tab` on load reveals the `skip` link to `#cielo`; activating with `Enter` moves focus to main content.
- [ ] **Tab order and visible focus:** step through header, tabs, target scope, `#q` form, modes (`blink`, `stack`, `diff`), detector selector (`All`, `D1`–`D6`), and `Back`/`Next` buttons with `Tab` / `Shift+Tab`. All show a visible focus ring.
- [ ] **Step shortcuts:** in the `Explore` tab, pressing `ArrowRight` and `ArrowLeft` switches between steps (`1 -> 2 -> 3`) when the next step is enabled.
- [ ] **Photosensitive safety (WCAG 2.3.1):**
  - Opening a field starts blinking **paused** (`playing = false`).
  - Triggering playback/blinking for the first time opens the `role="alertdialog"` (`askFlash`) confirmation; it can be confirmed or canceled via keyboard.
  - With `prefers-reduced-motion: reduce` enabled in the OS/browser, autoplay does not start.
- [ ] **Language (`ES` / `EN`):** clicking the language toggle updates UI copy, step titles, target notes, `aria-label` attributes, and the URL (`?lang=es` / `?lang=en`).

---

## 4. The Five Challenge Targets

Test each target by selecting it from `SkyScope` (step 1) and advancing to step 2 (`View`) and step 3 (`Analyze`):

- [ ] **1. Barnard's Star (`269.4485 / +4.7394`):**
  - Loads immediately with images (`with photos`).
  - In `Subtract`, the blue/amber dipole pair and proper-motion arrow are visible (`10.23 ± 0.43″/yr` in `data-sample/results.json` vs. `10.39″/yr` in Gaia DR3).
  - URL reflects coordinates and parameters with zero console errors.
- [ ] **2. ε Indi B (`331.0441 / −56.7828`, J2000):**
  - Verify displayed coordinates match **ε Indi B** (`331.044 / −56.783`) and **not** ε Indi A (`330.84 / −56.786`).
  - Confirm all 4 seasons load (`DR1 + QR3`, `4.21 ± 0.28″/yr` in `data-new/results.json`) without fabricating data.
- [ ] **3. WISE 0855 (`133.7951 / −7.2451`):**
  - Displays the **"Not in Gaia DR3"** label (or Spanish equivalent).
  - In `D5` and `D6` (zooming the panel), the infrared source is visible and step 3 shows the 102-color fingerprint dark at short wavelengths and bright at `4–5 µm` (`D6/D2 >= 10.09` in `data-new/results.json`).
- [ ] **4. RW Aurigae (`76.9561 / +30.4012`):**
  - Presented as a **variable** star (no significant proper-motion vector; `data-new/results.json` reports `status: "parcial"`, motion consistent with zero at 3σ).
- [ ] **5. R Draconis (`248.1674 / +66.7550`):**
  - Shows the **saturation** notice/limitation (`534/534` saturated frames in `entrega-horacio.md`; `status: "parcial"` with `0 < 3` usable detections in `data-new/results.json`), without displaying a false core proper motion.

---

## 5. Arbitrary Coordinates and Search Edge Cases (`#q`)

- [ ] **Invalid input (e.g. `hello world` or `400 10`):** submitting `#q` displays a clear error message with `role="alert"` and does not crash the app.
- [ ] **Distant arbitrary coordinate (`> 0.2°`, e.g. `210.8023 54.3488` or `150.0000 -25.0000`):**
  - Displays the `far-box` notice showing distance to the nearest preloaded field and a button to jump to it.
  - If the live flow is available (`Query field live`), verify honest state transitions (`queued` → `processing` with progress bar → `ready` with `Inspect field` button, or `failed` with error message).
- [ ] **Shareable URL persistence:** copy the generated URL with `?ra=...&dec=...&mode=...&det=...&lang=...`, open it in a new tab, and confirm it opens directly in `explore` with the same mode, detector, and language.

---

## 6. Execution Log (fill in when running QA)

| Date / time | Branch / commit tested | Browser | Result (`390 px` / `1440 px` / keyboard / 5 targets / coordinate) | Issues found |
|---|---|---|---|---|
| `[[PENDING]]` | `[[PENDING]]` | `[[PENDING]]` | `[UNVERIFIED ON INTEGRATED APP]` | `[[NONE / DETAILS]]` |
