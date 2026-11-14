# Team page (English)

**Team:** Cosmonautas · Hermosillo, Sonora, Mexico · NASA Space Apps Challenge 2026
**Challenge:** Planet X and SPHEREx
**Project:** Sparks

## Who we are
We are Computer Science students from Hermosillo, in the Sonoran Desert. We started this year looking down — at radar measurements of the Earth, then at wildfires — and even named that project Sparks. Then we read how a young man from a Kansas farm found Pluto in 1930 by blinking two photographs of the sky. We realised we were called Cosmonautas and had never looked up. Our sparks changed meaning: no longer fire, but points of light that move and that nobody has noticed yet.

## What we built
Sparks turns NASA's SPHEREx archive into a flipbook of the sky that tells you **what moves and what is cold**. Type any RA/Dec and the sky blinks in SPHEREx's six detectors. Sparks stacks images of the same color and season, aligns them on known stars, subtracts one season from another and measures how fast a star moves — with an error bar — and compares it with Gaia or CatWISE. Every source also gets a 102-color fingerprint and a spectrum measured on the fly.

## What it found on the challenge targets (real runs, 5 Nov 2026)
- **Barnard's Star:** 10.23 ± 0.43″/yr measured vs 10.39″/yr from Gaia DR3.
- **ε Indi B:** 4.54 ± 0.11″/yr vs 4.68″/yr from Gaia DR3; its spectrum shows the methane band of a T dwarf.
- **WISE 0855−0714:** 7.91 ± 1.35″/yr vs 8.09″/yr from CatWISE2020; not in Gaia DR3; nearly dark below 3.7 µm and bright at 4–5 µm; methane absorbs all of its light at 3.3 µm.
- **RW Aurigae and R Draconis:** saturate SPHEREx in most images; Sparks measures their brightness in the PSF wings and says so on screen.

## Honest notes
- We say "candidates for review", never "discovery".
- Our first test was flawed: we tuned the rule while looking at the test stars. We said so, turned those stars into a development set, picked 14 new fast stars from Gaia DR3, split them by a fixed random seed into validation and final test before looking, and ran the final test once with everything frozen. Result: the transparent rule flags 8 of 9 as movers with no false alarms; our machine-learning classifier finds more faint injected movers but only 6 of the 9 real ones, with 10 false alarms. So the app uses the rule and shows the model as a second opinion.

## Data and tools
NASA/IPAC SPHEREx Quick Release 2 and 3 (DOIs 10.26131/IRSA652, 10.26131/IRSA662) · ESA Gaia DR3 · CatWISE2020 (IRSA) · AllWISE HiPS (CDS) · Astropy · reproject · photutils · LightGBM · Aladin Lite · Vite. Code: MIT license.

## Use of AI
We used an AI coding assistant (Claude) to help write code and documentation. All numbers come from our own pipeline runs against public NASA/ESA data.
