# 07 · Skills, paquetes y tutoriales

Consulta: 2026-11-05.

## 1. Skills de Claude Code

**En el proyecto** (`.claude/skills/`) [VERIFICADO: listado]:
| Skill | Uso en Sparks |
|---|---|
| `astropy` (v1.5, revisada 2026-09-30, apunta a Astropy 8.0.1) | WCS, FITS MEF, `Cutout2D`, tiempos MJD, coordenadas sexagesimales → decimales |
| `frontend-design` | Identidad visual del flipbook y la landing (evitar el "dashboard genérico") |
| `webapp-testing` | Pruebas con Playwright: los 5 objetivos cargan, la URL con coordenadas reproduce el estado, funciona en móvil |

**Disponibles en la sesión** (no en `.claude/skills/`) que sirven [VERIFICADO: lista de skills de la sesión]: `dataviz` (espectros y curvas de luz), `frontend-slides` / `pptx` (deck si Canva falla), `anti-ai-slop-ui` / `baseline-ui` (pulido), `superpowers:test-driven-development` (pipeline), `skill-creator` (por si queremos una skill "spherex-cutouts" para el equipo).

**Faltaría** [INFERENCIA]: no hace falta crear skills nuevas antes del 14. Una skill propia de SPHEREx tendría sentido solo si varios del equipo van a pedirle a Claude código de cutouts; las reglas de este documento y `02-spherex-datos.md` ya cubren lo esencial.

## 2. Paquetes

**Python** (en `research/planetx/scratch/.venv`, solo para la investigación) [VERIFICADO]: astropy 8.0.2, astroquery 0.4.11, pyvo 1.10.0, numpy, scipy.

**Para el producto, por instalar el sábado** [INFERENCIA]:
| Paquete | Para qué |
|---|---|
| `reproject` | Llevar cutouts a una malla común antes de sumar o restar |
| `photutils` | Detección, centroides, ajuste ePSF |
| `fsspec`, `s3fs` | Leer secciones de MEF en S3 |
| `fastapi`, `uvicorn`, `httpx` (async) | Backend y cutouts en paralelo |
| `scikit-learn` o `lightgbm`; `torch` (CPU) si hay CNN | Clasificador de candidatos |
| `Pillow` | WebP de los cuadros |

**JS** [VERIFICADO: npm]: `aladin-lite@3.8.2` (jsDelivr). Opcionales: un framework ligero (Vite + vanilla, o Svelte), `uPlot` o `Chart.js` para espectros, `qrcode` para el QR del demo en vivo, Web Audio API (nativa) para la sonificación.

## 3. Tutoriales oficiales de IRSA para el sábado

Repositorio: https://github.com/Caltech-IPAC/irsa-tutorials/tree/main/tutorials/spherex (archivos `spherex_intro.md`, `spherex_cutouts.md`, `spherex_psf.md`, `spherex_mosaic.md`, `spherex_source_discovery`) [VERIFICADO: listado por API de GitHub]

| Tutorial | Qué enseña | Cuándo usarlo |
|---|---|---|
| Introduction to SPHEREx Spectral Images — https://caltech-ipac.github.io/irsa-tutorials/spherex-intro/ | SIA con astroquery, abrir el MEF, extensiones | Hora 1 |
| Spectral Image Cutouts — https://caltech-ipac.github.io/irsa-tutorials/spherex-cutouts/ | **TAP `spherex.artifact JOIN spherex.plane`** que arma URLs de cutout ya con `center` y `size`; descarga serial o paralela; guarda la λ central y `VERSION` de cada cutout | Hora 1–2: es casi nuestro pipeline de ingesta |
| PSF in Spectral Image Cutouts — https://caltech-ipac.github.io/irsa-tutorials/spherex-psf/ | Elegir la zona PSF/ePSF correcta en un cutout; corrección del header | Para centroides y espectros |
| Source Discovery Tool — https://caltech-ipac.github.io/irsa-tutorials/spherex-source-discovery-tool-demo/ | Detectar fuentes solo con SPHEREx; ejemplo de `cloud_access` | Detector de candidatos |
| Mosaic (`spherex_mosaic.md`) | Mosaicos | Opcional |
| Cloud Access Intro — https://caltech-ipac.github.io/irsa-tutorials/cloud-access-intro | Leer de S3 | Si los cutouts IBE fallan |

Nota: el tutorial de cutouts sube `astropy.utils.data.conf.remote_timeout` a 120 s porque leer SPHEREx puede exceder el timeout por defecto. Hay que hacer lo mismo. [VERIFICADO: código del tutorial]
