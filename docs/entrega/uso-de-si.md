# Use of SI (AI) Tools Disclosure · Sparks

NASA Space Apps Challenge 2026 rules require submissions to describe how "Superintelligence" (SI) / AI tools were used during development.

**Status: draft.** Items marked with `[CONFIRM]` must be confirmed by each team member; they cannot be inferred from the repository history alone.

## Tools Used

Anthropic Claude, via the Claude Code coding assistant. Commits include `Co-Authored-By` trailers indicating the model used (Claude Sonnet 5.5, Claude Opus 5.5, and Claude Fable 5.2).

As of November 14 at 23:17, in the integration branch history (`joako-integracion`), 49 of 74 commits carry that trailer; all 49 are from Joaquin's account (52 commits). The 22 commits from Cons's account do not carry it; that does not prove no SI tool was used. (At 20:40 across all branches, it was 47 of 90.) `[CONFIRM with Cons, Horacio, and Carlos whether they used any assistant and for what.]`

## Where SI Was Used

| Area | Use of SI | Human Contribution |
|---|---|---|
| Web UI (`app/src/ui/`, `app/src/styles/`) | The assistant wrote most of the code for the three design iterations and the chosen one ("Constelacion") | Joaquin set the direction, chose between iterations, and reviewed the result in the browser. Cons integrates and maintains the branch |
| App logic (`app/src/core/`: coordinates, URL, player, field of view, spectrum) | Field of view and on-the-fly spectrum were written with the assistant, along with automated tests. `[CONFIRM the rest with Cons]` | Reviewed by Joaquin; tests run via `npm test` |
| Object-type classifier (`ml-clasificador/`) | The assistant wrote the training scripts, v2 retraining, and JavaScript inference | Horacio reviewed the science (found the v1 data leakage and the Wolf 489 label) and built the verified 69-object catalog; Joaquin reviewed the leave-one-out evaluation |
| Data pipeline (`pipeline/`, `data-new/`) | `[CONFIRM with Horacio]` | Horacio |
| Research (`docs/sprint-*`, `Investigacion.md`, IRSA coverage) | `[CONFIRM with Carlos and Horacio]` | Carlos and Horacio |
| Work plans and documents (`docs/reto/`, sprint plans, requirement audits, this document, `README.md`) | Drafted with the assistant | Joaquin reviews them before use |
| Logo and illustrations | `ASSETS_CREDITS.md` states that icons and astronomical characters were hand-drawn in SVG by the team. `[CONFIRM whether the logo used any SI tool]` | — |
| Pitch copy, team page, and video script (`docs/pitch/`) | `[CONFIRM with Carlos]` | Carlos |

## Where SI Was NOT Used

- **Sky images are not generated or retouched with SI.** They are public NASA SPHEREx / WISE data downloaded from NASA/IPAC IRSA and processed with our own code.
- **No scientific number was produced by a language model.** Proper motions, noise, flags, and spectra are computed by the pipeline and data files; the app reads them from there.
- The app does not call any SI service at run time.
- The object-type classifier is a classical machine-learning model trained by the team on 69 verified-class objects (v2; its metrics are in `ml-clasificador/`). It is classical ML, not a generative model, and is presented as a candidate class with its limitations.
- There is no SI-generated music, voice, or video in the repository. `[CONFIRM for the 30-second video once recorded.]`

## Short Summary (for the Submission Form)

> **Use of SI tools.** We used Claude (Anthropic), through the Claude Code assistant, to speed up development: it wrote most of the front-end code, parts of the application logic with their automated tests, the training and inference code of our small object-class classifier, and drafts of our planning and documentation. Team members set the direction, chose between design iterations, and reviewed the code and the results in the browser. `[ADD: what Cons, Horacio and Carlos used, if anything.]`
>
> SI was not used to create or alter any sky image: every image is public SPHEREx data from NASA/IPAC IRSA processed by our own code. No scientific number in Sparks was produced by a language model: proper motions, noise, flags and spectra are computed from the data. The app calls no SI service at run time. Our classifier is a classical ML model trained on 69 objects with a verified class; it is shown as a candidate class, with its limits.
