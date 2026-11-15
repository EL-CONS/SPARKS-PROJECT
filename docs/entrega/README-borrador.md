# Borrador de README del repositorio · Sparks

**Lema:** *"Every spark that moves has a fingerprint."*
**Equipo:** Cosmonautas (Hermosillo, Sonora, México) — NASA Space Apps Challenge 2026, reto *Planet X and SPHEREx*.

> **Nota sobre la rama actual (`carlos`):** en este repositorio el trabajo del sprint está repartido por ramas mientras se integra a `main`. Las carpetas `app/`, `data-sample/` y `server/` viven en `origin/cons`; `pipeline/` y `data-new/` viven en `origin/Horacio` (también integrados en `origin/cons` / `origin/joako`); `ml-clasificador/` vive en `origin/joako` (y `origin/cons`). En la rama `carlos` residen la verificación de acceso/cobertura de IRSA, la prueba S3 `Range`, los scripts de respaldo de recortes y estos documentos de entrega.

---

## 1. Qué es Sparks

Sparks es una herramienta web pública inspirada en el comparador de parpadeo con el que Clyde Tombaugh encontró a Plutón en 1930. El usuario escribe una coordenada del cielo (`RA / Dec`) o elige uno de los cinco objetivos del reto:

- **Barnard's Star** (`269.4485 / +4.7394`, J2016)
- **ε Indi B** (`331.0441 / −56.7828`, J2000; distinta de ε Indi A en `330.8404 / −56.7869`)
- **WISE 0855** (`133.7951 / −7.2451`)
- **RW Aurigae** (`76.9561 / +30.4012`)
- **R Draconis** (`248.1674 / +66.7550`, J2016)

Sparks alinea las temporadas disponibles de SPHEREx en los 6 detectores (`D1`–`D6`, 102 bandas infrarrojas), permite alternar o restar temporadas en **azul** (antes) y **ámbar** (ahora), superpone el vector de movimiento propio medido frente a Gaia DR3 / CatWISE2020 y muestra la huella espectral para señalar **candidatos a revisar**.

---

## 2. Cómo correrlo localmente

### Aplicación web (`app/`, rama `cons` o rama integrada)

Requisitos: Node.js y npm. Según `origin/cons:app/package.json`:

```bash
cd app
npm install
npm run dev
```

Vite sirve la interfaz en `http://localhost:5173` y expone `/data-sample` desde el directorio padre mediante el plugin `serve-data-sample` (`app/vite.config.ts`).

Otros scripts disponibles en `app/package.json`:
- `npm run build` — Compila TypeScript y genera `app/dist/` (`tsc && vite build`).
- `npm run preview` — Sirve el build generado.
- `npm run typecheck` — Verifica tipos sin emitir archivos (`tsc --noEmit`).
- `npm test` — Ejecuta la suite de pruebas unitarias con Vitest (`vitest run`).
- `npm run check-data` — Valida los JSON de datos (`node scripts/check-data.mjs`).

### Servidor de respaldo en vivo (`server/`, rama `cons`)
- `node server/demo-server.mjs` — Servidor auxiliar para consultas en vivo cuando el backend Python no corre en la máquina cliente.

### Canalización científica (`pipeline/`, rama `Horacio`)
- Paquete Python `pipeline/sparkspipe/` con dependencias en `pipeline/requirements.txt` (`astropy`, `numpy`, `requests`, `scipy`, `reproject`; no instaladas en la máquina de `carlos`). Genera `data-new/` (`coadds.bin`, `diffs.bin`, `medians.bin`, `masks.bin`, `manifest.json`, `catalogs.json`, `results.json`).

### Scripts de cobertura y recortes (`docs/sprint-13-30/`, rama `carlos`)
Solo biblioteca estándar de Python 3 (sin dependencias externas):
- `python3 docs/sprint-13-30/cobertura.py` — Consulta SIA sobre 36 objetos (`spherex_dr1`, `spherex_qr3`, `spherex_qr2`).
- `python3 docs/sprint-13-30/recortes.py --out <ruta_fuera_de_git>` — Descarga recortes `size=0.11` sin cubo `EPSF`, con 6 hilos y reintentos.

---

## 3. Qué es cada carpeta del repositorio

| Carpeta | Rama donde vive | Contenido y función |
|---|---|---|
| `app/` | `origin/cons`, `origin/joako` | Frontend React + TypeScript + Vite (`src/core/`, `src/data/`, `src/i18n/`, `src/ui/`, `tests/`). |
| `data-sample/` | `origin/cons`, `origin/joako` | Paquete de datos previo al sprint (`results.json` del `2026-11-06`, `barnard/`, `index.json`). No modificar. |
| `data-new/` | `origin/Horacio`, `origin/cons` | Salidas nuevas generadas el `2026-11-14/15` por `pipeline/sparkspipe/` para `wise0855`, `epsindib`, `rwaur`, `rdra`, con `results.json`. |
| `pipeline/` | `origin/Horacio`, `origin/joako` | Canalización Python nueva (`sparkspipe/`) para descubrimiento SIA, descarga, coadición por temporada, resta de fondo/PSF vecina, astrometría y fotometría. |
| `ml-clasificador/` | `origin/joako`, `origin/cons` | Clasificador Random Forest por clase de objeto (`estrella`, `enana marron`, `enana blanca`, `variable`) con entrenamiento Python (`entrenar_v2.py`, `75.4%` LOO en 69 objetos) e inferencia JS (`predecir.mjs`, `modelo_v2.json`). |
| `docs/` | Todas las ramas | Documentación del reto, planes por sprint, pruebas de acceso (`sprint-13-30/`), reglas (`reto/normas.md`), guiones de pitch (`pitch/`) y piezas de entrega (`entrega/`). |
| `branding/` y `Logo/` | Todas las ramas | Identidad visual, paletas (`#06080C`, `#62B6E8`, `#FFB238`) y logotipos SVG/PNG de Sparks. No modificar `Logo/`. |

*(Nota: `research/` contiene material de investigación preliminar; según las reglas del sprint, no se reutiliza código ni datos del proyecto anterior).*

---

## 4. De dónde salen los datos

1. **Imágenes y metadatos de SPHEREx:** servicio SIA de NASA/IPAC IRSA (`https://irsa.ipac.caltech.edu/SIA`) consultando `spherex_dr1` y `spherex_qr3` (`spherex_qr2` devuelve `0` filas en SIA sobre los 36 objetos revisados en `docs/sprint-13-30/cobertura.csv`). El bucket público S3 `nasa-irsa-spherex` (`us-east-1`) entrega archivos completos o lecturas por rango (`HTTP 206` con CORS habilitado, verificado en `docs/sprint-13-30/lectura-navegador.md`).
2. **Catálogos astrométricos y fotométricos de referencia:**
   - **ESA Gaia DR3** (TAP `gea.esac.esa.int/tap-server/tap/sync`): movimientos propios, paralajes y fotometría `G`, `BP-RP`.
   - **CatWISE2020** (infrarrojo medio): movimiento propio de referencia para fuentes frías invisibles en Gaia como `WISE 0855` (`origin/cons:data-sample/results.json`).
   - **SIMBAD (espejo Harvard)** y literatura de referencia (`Luhman & Esplin 2014` para época y movimiento propio de `WISE 0855` en `recortes.py`).

---

## 5. Qué NO hacemos (alcance y límites honestos)

- **No afirmamos descubrimientos:** Sparks no anuncia hallazgos de Planet X ni clasificaciones definitivas; entrega **candidatos a revisar** con trazabilidad de error y fuente.
- **No reemplazamos al detector físico con ML cuando falla:** en la prueba congelada previa (`origin/cons:data-sample/results.json`, sin verificar en `carlos`), la regla física superó al modelo LightGBM (`8/9` con `0` falsas alarmas frente a `6/9` con `10` falsas alarmas); por eso el veredicto principal usa reglas físicas y el ML queda como segunda opinión.
- **No medimos núcleo en fuentes saturadas:** `R Draconis` está saturado en `534/534` cuadros (`docs/sprint-13-30/entrega-horacio.md`), por lo que no permite centroide de núcleo (`0` detecciones utilizables en `origin/Horacio:data-new/results.json`).
- **No hacemos calibración FITS completa en el navegador todavía:** aunque la lectura directa `S3 Range` funciona para el plano `IMAGE` (`551,040 B` en 2 peticiones o `45,184 B` en 65 peticiones), el cliente web aún no ejecuta resta de `ZODI`, decodificación `Rice` de `FLAGS` ni reproyección `WCS-WAVE` al vuelo.
- **No subimos los 578 recortes FITS a Git ni incluimos menores de 18 años:** los recortes viven fuera del repositorio y la entrega cumple las restricciones de privacidad de `docs/reto/normas.md`.
