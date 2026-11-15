# Use of Superintelligence (SI) Tools Disclosure · Sparks

NASA Space Apps Challenge 2026 rules (`docs/reto/normas.md`, based on *NASA Space Apps Challenge 2026 Participant FAQs*) require submissions to honestly describe how **Superintelligence (SI)** tools (language models, coding assistants, text/image generators, and development agents) were used during development.

**Status:** consolidated draft. Items marked `[CONFIRM]` must be confirmed by the relevant team member before final submission.

---

## 1. Which SI Tools Were Used

- **Claude (Anthropic) via Claude Code:** primary coding assistant for integration and frontend work. Commits include `Co-Authored-By` trailers indicating the model used: **Claude Sonnet 5.5**, **Claude Opus 5.5**, and **Claude Fable 5.2**.
  - In the integration branch history (`joako-integracion`, as of November 14 at 23:17), **49 of 74 commits** carry that trailer (all under Joaquin's account, 52 commits); the 22 from Cons do not carry it, which does not prove no SI tool was used.
  - Across the earlier full repository history (`git log --all` inspected on `carlos`), **16 commits** record `Claude Opus 5.5` and **34 commits** record `Claude Sonnet 5.5`.
- **Terminal and IDE assistants/agents (Gemini / Antigravity and terminal agents) on branch `carlos`:** used on Saturday, November 14 to draft Python coverage/cutout verification scripts, browser tests against S3 (`Range` + CORS), sprint reports, and submission drafts. Commits on `carlos` do not carry `Co-Authored-By` trailers.
- **Agent skill packs loaded (`skills-lock.json`):** `astropy`, `design-taste-frontend`, `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines`, `webapp-testing`.
- **`[CONFIRM WITH CONS AND HORACIO]`** whether they used any SI assistants in their local sessions (`cons`, `frontend-del-cons`, `Horacio`) and which tools.

---

## 2. What They Were Used For and What Humans Reviewed, Tested, and Fixed

| Area | Use of SI | What a Human Reviewed, Tested, and Corrected |
|---|---|---|
| Web UI (`app/src/ui/`, `app/src/styles/`) | The assistant wrote most of the code for the three design iterations (`Constelacion`, `Escotilla`, `Planetario`) and the selected one (`Constelacion`). | Joaquin set the direction, chose between iterations, reviewed the result in the browser, and decided on a single dark theme (`#06080C`). Cons integrates and maintains the branch. |
| App logic (`app/src/core/`, `app/src/data/`) | Field of view, on-the-fly spectrum, dual loader (`data-sample/` + `data-new/`), and automated tests assisted by SI (`[CONFIRM the rest with Cons]`). | Reviewed by Joaquin; unit tests executed with `npm test` (`64/64`), `npm run typecheck`, `npm run check-data`, and manual checks at `1440 px` and `390 px`. |
| Object-type classifier (`ml-clasificador/`) | The assistant wrote training scripts (`entrenar.py`, `entrenar_v2.py`), v2 retraining, and JS inference (`predecir.mjs`, `probar-paridad-v2.mjs`). | Horacio caught distance leakage in v1 (`proper motion`, `parallax`, `G magnitude`) and the mislabeled `Wolf 489` entry (`Gaia DR3 3713594960831605760`), assembling the verified 69-object catalog (`78.3%`, `54/69`, `p = 0.0323` in `resultados_v2.json`); Joaquin reviewed leave-one-out evaluation and Cons/Joaquin verified JS/Python parity. |
| Data pipeline (`pipeline/`, `data-new/`) | `[CONFIRM with Horacio]`. | Horacio ran and validated `pipeline/sparkspipe/` on `wise0855`, `epsindib`, `rwaur`, and `rdra`, detected `R Draconis` saturation (`534/534` frames), and identified coordinate fixes for `ε Indi A/B`. |
| Research, IRSA coverage, and browser S3 test (`docs/sprint-13-30/`) | Assistance on zero-dependency Python scripts (`cobertura.py`, `recortes.py`), HTML test (`s3-range-test.html`), and technical diagnostics (HTTP `503`, `/SIA2` → `404`, `spherex_qr2` → `0` rows in SIA). | Carlos ran `109` live SIA queries across `36` objects (`cobertura.csv`), downloaded and verified `578` cutouts (`0/578` with `EPSF`), and ran `s3-range-test.html` live in headless Firefox (`Nov 14`, `22:08–22:15 MST`), fixing header slicing (`23,040 B` to dynamic `28,800 B` blocks), big-endian `BITPIX = -32` decoding, `TAN + SIP` inversion, and verifying byte-for-byte parity against Python (`FNV-1a = 1bc318be`). |
| Work plans, rules, and docs (`docs/reto/`, `docs/auditoria/`, `docs/entrega/`, `README.md`) | Drafted and updated with SI assistants. | Joaquin reviewed official rules (`docs/reto/normas.md`), enforced the single-run frozen test protocol, and audited every figure for source traceability; Carlos drafted and refined submission pieces (`pagina-equipo-en.md`, `video-30s-guion-en.md`, `diapositivas-outline.md`, `checklist-qa.md`) with zero discovery claims. |
| Logo and illustrations (`Logo/`, `branding/`) | `ASSETS_CREDITS.md` states icons and astronomical illustrations were hand-drawn in SVG by the team (`[CONFIRM whether the logo used any SI tool]`). | Team visual review; `Logo/` remains unmodified. |

---

## 3. What SI Was NOT Used For

- **Sky images are not generated or retouched with SI.** They are public SPHEREx data downloaded from NASA/IPAC IRSA and processed with our own code.
- **No scientific number was produced by a language model.** Proper motions, noise, flags, and spectra come from the pipeline and data files; the app reads them directly.
- **The app does not call any SI service at run time.**
- **The object-type classifier** (`ml-clasificador/resultados_v2.json`) is a classical random forest trained by the team on 69 verified-class objects (`78.3%`, `54/69`). It is classical ML, not a generative model, and is shown as a candidate class with its limitations.
- **No SI-generated music, voice, or video exists in the repository.** `[CONFIRM for the 30-second video once recorded.]`

---

## 4. Short Summary (for `spaceappschallenge.org`)

> **Use of SI tools.** We used AI coding assistants during development: Claude (Anthropic) via Claude Code (recorded in Git `Co-Authored-By` trailers across 49 of 74 integration commits with Claude Sonnet 5.5, Opus 5.5, and Fable 5.2) for front-end UI iterations, automated tests, classifier training/inference scripts, and integration docs; and terminal/IDE LLM agents (including Gemini / Antigravity) on branch `carlos` for standard-library IRSA SIA coverage checks, cutout downloads, the browser S3 `Range` CORS test, and draft submission docs. Team members set the architecture and visual direction, chose between iterations, checked live browser behavior (`1440 px` and `390 px`, `64/64` tests), reviewed scientific validity (removing 3 distance-biased features and a mislabeled object in the v2 classifier catalog), verified coordinates and saturation limits, and validated byte-for-byte S3 FITS reads against Python. `[CONFIRM / ADD whether Cons and Horacio used any local SI tools.]`
>
> SI was not used to create or alter any sky image: every image is public SPHEREx data from NASA/IPAC IRSA processed by our own code. No scientific number in Sparks was produced by a language model: proper motions, noise, flags, and spectra are computed from the data. The app calls no SI service at run time. Our object-type classifier is a classical random forest trained on 69 objects with a verified class (`78.3%` leave-one-out accuracy, `54/69`); it is shown strictly as a candidate class with its limits. No SI-generated audio, voice, or video exists in the repository.
