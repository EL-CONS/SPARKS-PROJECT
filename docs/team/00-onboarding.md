# 00 · Onboarding de Sparks (para los cuatro, ~1 hora)

Objetivo: que cada uno de ustedes pueda explicar Sparks en un minuto, correrlo en su máquina y saber dónde vive cada pieza. Los números citados salen de `results/results.json`; si un número de aquí no coincide con ese archivo, manda el archivo.

---

## 1. Sparks en una página (10 min)

**El problema del reto.** SPHEREx (NASA) fotografía todo el cielo cada ~6 meses, en 102 colores del infrarrojo (0.75–5 µm). El reto pide una herramienta web pública: el usuario escribe RA/Dec y ve una serie de imágenes "como un videíto" para notar lo que se mueve. Hay que probarla con 5 objetivos: la estrella de Barnard, ε Indi B, WISE 0855−0714, RW Aurigae y R Draconis.

**La idea.** El "comparador de parpadeo" de Clyde Tombaugh (Plutón, 1930): alternar dos fotos del mismo cielo tomadas en fechas distintas. Lo que salta, se movió.

**Por qué no es trivial con SPHEREx.**
1. Los píxeles son enormes: 6.15″. Una estrella cercana avanza 1–2 píxeles en el año y pico que lleva la misión.
2. Cada imagen se toma en un color distinto (filtros lineales variables). Comparar dos imágenes al azar es comparar colores distintos: "todo cambia".
3. El detector tiene píxeles malos, saturación, reflejos (GHOST) y la luz zodiacal de fondo.

**Lo que hace Sparks (en 6 pasos).**
1. Pregunta a IRSA (el archivo infrarrojo de la NASA) qué imágenes de SPHEREx tocan ese punto.
2. Lee solo los píxeles necesarios de cada archivo (no baja los 65 MB).
3. Quita el fondo zodiacal, aplica las banderas de calidad y lleva todo a una rejilla común.
4. Suma las imágenes por detector y temporada (baja el ruido 4–5 veces), las alinea con estrellas de Gaia/CatWISE y resta temporada contra temporada **usando solo imágenes del mismo color**.
5. Mide: cuánto se movió el objeto (con barra de error, contra Gaia o CatWISE), su brillo en cada imagen (espectro de 102 colores), un índice físico de "frío" y la curva de luz.
6. Busca otros "candidatos" en la resta y les pone una etiqueta con una regla transparente (y una segunda opinión de ML experimental).

**Lo que dice el producto:** "candidatos para revisar", nunca "descubrimos".

## 2. Arquitectura (5 min)

```
                         ┌─────────────────────── offline (make precompute) ───────────────────────┐
 IRSA ObsTAP ─► discover ─► SIA2 coverage ─► remote_fits (HTTP ranges) ─► frames (−ZODI, flags)      │
                                                                         │                          │
                     Gaia DR3 (ESA TAP) / CatWISE (IRSA) ─► catalogs     ▼                          │
                                                       coadd (1/σ², por detector × temporada)       │
                                                                         │                          │
                                         field: registro ─► restas λ-emparejadas ─► astrometría     │
                                                            fotometría forzada ─► espectro, frío    │
                                                                         │                          │
                                         candidates (regla) + ml (LightGBM) ─► export (manifest)    │
                         └────────────────────────────────────────┬───────────────────────────────┘
                                                                  ▼
                              app/public/fields/<id>/  (JSON + binarios float16/32 + PNG)
                                                                  │
                              app/ (Vite + TypeScript, canvas)  ◄─┘   ← funciona sin servidor
                                    │  ▲
                     cualquier RA/Dec│  │ campo nuevo (~2 min en frío)
                                    ▼  │
                              api/ (FastAPI) ─► el mismo pipeline, reducido (D2+D6, 4′)
```

## 3. Cómo correrlo (10 min)

Requisitos: Linux o macOS, `uv` (Python 3.12), Node 20+.

```bash
make setup        # una vez: uv sync + npm install
make dev          # http://localhost:5173 — los 5 objetivos + galería, sin backend
make api          # opcional, otra terminal: modo en vivo (:8000)
make test         # pytest + parser de coordenadas + check_numbers
make build && make e2e   # build estática + pruebas en navegador
```

Para regenerar los datos (≈ 15 min, ~2 GB de lecturas parciales a IRSA): `make precompute`. No lo corran todos a la vez: IRSA es un servicio compartido.

## 4. Recorrido por los 5 objetivos (20 min)

Abran `make dev` y sigan esto con la app enfrente. Para cada pantalla: qué ves, qué significa, qué decir si te preguntan.

### Barnard (`?field=barnard`) — "se mueve"
- **Abre en "Subtract B−A"**: 6 paneles (uno por detector). Mancha azul = dónde estaba la estrella en la primera temporada; ámbar = dónde está en la última.
- **Tarjeta (derecha)**: el dial con dos flechas, la medida de Sparks y la de Gaia DR3. Sparks 10.23 ± 0.43″/año contra Gaia 10.39″/año.
- **Por qué no hay espectro**: Barnard satura SPHEREx en todas las imágenes; la tarjeta lo dice.
- **Pruébenlo**: cambien a "Blink" (alterna A ↔ B) y a "Every image" (el video crudo, cada cuadro de otro color).

### ε Indi B (`?field=epsindib`) — "se mueve y es fría"
- Abre en "Blink". Movimiento 4.54 ± 0.11″/año contra Gaia 4.68.
- **Huella de 102 colores** (6 × 17 cuadritos): más brillante a la derecha (infrarrojo largo).
- **Espectro**: la caída a 3.3 µm es metano: una enana T.
- Activen **"Flags"** en "Every image": el anillo en D6 es un GHOST (reflejo) de ε Indi A, la estrella brillante vecina.

### WISE 0855 (`?field=wise0855&det=6`) — "Gaia no la ve"
- Abre en "Stack A+B". En D1–D3 no hay nada; en D5–D6, un punto.
- **"Not in Gaia DR3"**: la fuente de Gaia más cercana está a 10.7″.
- **Huella**: apagada al principio, encendida al final. **Índice de frío**: cociente de flujos > 10.9 y metano 1.03 ± 0.07 (absorción total).
- **Movimiento**: 7.91 ± 1.35″/año contra CatWISE 8.09. En 2026 pasa encima de otra estrella; el brillo de esa vecina se fijó con la temporada en que estaban separadas.

### RW Aurigae (`?field=rwaur`) y R Draconis (`?field=rdra`) — "cambian de brillo"
- Abren en "Minus median": cada imagen menos la mediana de su detector.
- **Curva de luz** en la tarjeta. Las dos saturan, así que el brillo se mide en un anillo justo afuera del núcleo saturado ("alas del PSF").
- R Dra baja de 1.47 a 0.79 (relativo) en los 6 detectores: es una Mira. RW Aur: sugerente, no concluyente (la app y los documentos lo dicen así).

### Lo demás de la pantalla
- **Barra de arriba**: escribir coordenadas (sexagesimales o decimales), botones de objetivos, "Above Hermosillo now", galería.
- **Controles**: play/pausa, velocidad, paso, detector, temporadas A/B, campo de visión (con estimación de MB y tiempo en vivo), Flags, Catalog stars.
- **Pestañas de abajo**: Sky context (Aladin Lite), Image details (metadatos y banderas por imagen), Candidates (lista con su razón y la columna "ML (experimental)"), Data & method.
- **Share / Embed / QR**: todo el estado vive en la URL.

## 5. Glosario sin jerga (10 min)

| Término | En una frase |
|---|---|
| **RA/Dec** | La "longitud y latitud" del cielo. RA (ascensión recta) en horas o grados; Dec (declinación) en grados. |
| **Segundo de arco (″)** | 1/3600 de grado. La Luna mide ~1800″. Un píxel de SPHEREx mide 6.15″. |
| **Movimiento propio** | Cuánto se desplaza una estrella en el cielo por año, por su viaje real por la galaxia. Barnard: ~10″/año. |
| **Paralaje** | Bamboleo aparente de una estrella cercana porque la Tierra le da la vuelta al Sol. Sparks lo resta (no lo mide). |
| **Enana café** | "Estrella fallida": no tiene masa para fusionar hidrógeno. Las más frías brillan sobre todo en infrarrojo y tienen metano. |
| **PSF** | Cómo se ve un punto de luz en la imagen (una manchita, no un punto). Sparks la aproxima con una gaussiana. |
| **WCS** | La "traducción" de píxel a RA/Dec guardada en el archivo. SPHEREx también trae un WCS espectral (`W`) que da la longitud de onda de cada píxel. |
| **FITS** | El formato estándar de imágenes astronómicas: varias "extensiones" (imagen, banderas, varianza, fondo…) en un solo archivo. |
| **Coadd (suma)** | Promedio ponderado de muchas imágenes alineadas. Baja el ruido. |
| **S/N** | Señal entre ruido. S/N 5 = apenas se distingue; 50 = clarísimo. |
| **Resta de imágenes** | Temporada B menos temporada A. Lo que no cambió desaparece; lo que cambió queda. |
| **Dipolo** | La huella de algo que se movió en una resta: un lóbulo negativo (antes) junto a uno positivo (ahora). |
| **Saturación** | Cuando una estrella es tan brillante que el píxel se "llena". Ese centro no sirve y se enmascara. |
| **Banderas (flags)** | Un número por píxel que dice qué le pasa: malo, saturado, reflejo (GHOST), rayo cósmico… |
| **ZODI** | El modelo del brillo zodiacal (polvo del sistema solar) que trae cada imagen; se resta. |
| **Temporada** | Un grupo de visitas a la misma zona separadas por menos de 40 días. SPHEREx vuelve cada ~6 meses. |
| **Detector (D1–D6)** | SPHEREx tiene 6 detectores; cada uno cubre un rango de colores (D1 ≈ 0.75–1.09 µm … D6 ≈ 4.42–5.0 µm). |
| **λ (lambda)** | Longitud de onda = "color". En micras (µm). |
| **Regla vs ML** | La regla son condiciones escritas a mano que cualquiera puede leer. El ML (LightGBM) aprende las condiciones de ejemplos. |
| **Completitud** | De los objetos reales que había, ¿qué fracción encontraste? |
| **Pureza** | De lo que dijiste que era "mover", ¿qué fracción realmente lo era? |
| **Validación vs prueba** | Validación: datos que puedes mirar para ajustar. Prueba: datos que se miran **una sola vez**, al final, con todo congelado. Si ajustas viendo la prueba, el resultado ya no vale. |
| **Conjunto de desarrollo** | Los campos con los que se construyó y ajustó Sparks (los 5 del reto + 4 de galería). Sus resultados no prueban nada sobre datos nuevos. |

## 6. Mapa del repo (5 min)

| Ruta | Qué hace |
|---|---|
| `pipeline/sparks/config.py` | Constantes: objetivos, bits de banderas, DOIs, rutas. |
| `pipeline/sparks/discover.py` | Lista colecciones de SPHEREx (ObsTAP) y la cobertura de un punto (SIA2); agrupa temporadas. |
| `pipeline/sparks/remote_fits.py` | Lee solo los bytes necesarios de cada FITS con peticiones HTTP por rangos. |
| `pipeline/sparks/frames.py` | Baja y cachea recortes en paralelo; resta ZODI; arma máscaras. |
| `pipeline/sparks/coadd.py` | Rejilla común, reproyección y sumas 1/σ². |
| `pipeline/sparks/catalogs.py` | Conos de Gaia DR3 y CatWISE2020. |
| `pipeline/sparks/astrometry.py` | Paralaje, propagación de posiciones, centroides gaussianos con vecinas, ajuste de movimiento propio. |
| `pipeline/sparks/photometry.py` | Fotometría forzada PSF, alas de saturadas, índice de frío. |
| `pipeline/sparks/field.py` | Orquesta un campo completo: registro, restas, objetivo, espectro, curva de luz. |
| `pipeline/sparks/candidates.py` | Residuos en las restas, rasgos explicables y la regla. |
| `pipeline/sparks/ml.py` | Inyecciones de fuentes sintéticas y conjunto de entrenamiento del ML. |
| `pipeline/sparks/export.py` | Escribe `manifest.json` y binarios para la app. |
| `scripts/precompute.py`, `gallery.py` | Corren los 5 objetivos y la galería. |
| `scripts/select_test_stars.py`, `process_eval_fields.py`, `eval_known_movers.py` | Protocolo de validación y prueba final. |
| `scripts/train_ml.py` | Entrena y valida el ML. |
| `scripts/collect_results.py`, `check_numbers.py` | Fuente única de números y su verificación en documentos. |
| `scripts/check_releases.py` | Detecta lotes nuevos de SPHEREx y regenera. |
| `app/src/main.ts` | Estado ⇄ URL, botones, diálogos, teclado. |
| `app/src/stage.ts` | El flipbook (canvas) y las marcas SVG. |
| `app/src/card.ts`, `panes.ts` | Tarjeta del objeto y pestañas. |
| `api/main.py` | Modo en vivo. |
| `tests/` | pytest, prueba JS del parser, e2e con Playwright. |
| `models/` | Modelo ML y reportes (protocolo, validación, prueba final). |
| `docs/` | Métodos, cumplimiento del reto, auditoría de diseño, pitch, este material. |

Siguiente paso: lean `docs/team/README.md` (reparto y calendario) y la guía de su rol.
