---
version: 1
slug: "app-src-ui-sparksapp-tsx"
primary_target: "app/src/ui/SparksApp.tsx"
related_targets: ["app/src/styles/sparks.css"]
---

# Sparks comparator (app/src/ui)

Scope: the single-page comparator, its opening state (portada), the sky stage, coordinate bar, log, reading layers, glossary. Mode: Operate, with a wonder register for an 8-year-old and full rigor for an astrophysicist.

Job: type a sky position or tap a target, watch the same sky across seasons, see what moved, then dig to the exact number with its unit, uncertainty and source. Proof: real SPHEREx data (Barnard only in data-sample; the other four targets are "soon").

Constraints: logo colors carry fixed meaning (blue = before, amber = now); SPHEREx pixels are never filtered or decorated; WCAG 2.2 AA; blink ≤ 3 Hz, starts paused, pause always visible; EN/ES; Cons owns core/data/i18n.

## Direction contract

THESIS: Sparks is the observing log of one patch of sky; blinking is turning its pages. Refuses the centered hero with three buttons and the admin dashboard of cards.

OWN-WORLD: Night ground (#06080C) with ink-blue surfaces, placa text #ECE7DC; blue #62B6E8 = before, amber #FFB238 = now, cream #FFF4DC only at the instant of change; light only as radial halos that fall to zero. Archivo (logo face) for titles, Atkinson Hyperlegible Next for prose, Atkinson Hyperlegible Mono for every number. Rows of the log, not cards. Paper theme (#FAF8F3, #0D1117, #2F8BCB, #F09A0C) designed apart; the sky stage stays night in both.

STORY: A child reads one sentence and presses "See what moves"; the log page turns, a dot jumps. An astrophysicist reads the same row as UTC, release, version, λ and σ, then opens the measured motion with its error and Gaia reference.

FIRST VIEWPORT: Top bar (logo, language, theme, glossary). Coordinate bar with the five targets as small coded stamps. Left two thirds: six detector panels, 3x2, real pixels, with the one-sentence layer above and the amber "See what moves" + transport under it. Right third: the log, three season entries on a rising diagonal rail, the live one lit amber, then the reading (10.23 ± 0.43 ″/yr vs Gaia 10.39).

FORM: Observing log (candidate 5 of 7; assigned by the roll). seed:7d33b15bb2cea395. Raises: margin apparatus beside each number (from centre-rail reference setting); target stamps in a whole-cell grid (from the convention catalog); every claim followed by its proof image (from monochrome product marketing). Signature move: the live log entry lights amber with the logo's cream lens flash on every season change, its blue partner dimmed beside it.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
