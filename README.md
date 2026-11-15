# Sparks

*"Every spark that moves has a fingerprint."*

Herramienta web del equipo **Cosmonautas** (Hermosillo, Sonora, México) para el reto **Planet X and SPHEREx** del NASA Space Apps Challenge 2026.

Escribes una posición del cielo y Sparks pone a parpadear las fotos que el telescopio SPHEREx de la NASA tomó de ese lugar en fechas distintas. Lo que salta, se movió. Azul es dónde estaba; ámbar, dónde está ahora.

Sparks muestra **candidatos para revisar**, nunca descubrimientos. Es un proyecto independiente, no afiliado ni respaldado por la NASA.

## Objetivos del reto incluidos

- **Barnard's Star** (`269.4485 / +4.7394`, J2016)
- **ε Indi B** (`331.0441 / −56.7828`, J2000; distinta de ε Indi A en `330.8404 / −56.7869`)
- **WISE 0855** (`133.7951 / −7.2451`)
- **RW Aurigae** (`76.9561 / +30.4012`)
- **R Draconis** (`248.1674 / +66.7550`, J2016)

## Qué hace

- Acepta coordenadas en grados (`269.4486 4.7672`), en horas y grados (`08h55m10.831s -7d14m42.53s`, `17:57:48.5 +04:41:36`) o el nombre de un objetivo del reto.
- Muestra el parche en los seis detectores de SPHEREx, en tres vistas: **parpadeo** (alterna las temporadas, a 1, 2 o 3 cambios por segundo), **suma** (promedio de las temporadas, con menos ruido) y **resta** (una temporada menos otra, en múltiplos del ruido).
- **Campo de visión elegible**: el recorte completo, la mitad o la cuarta parte.
- **Espectro al vuelo**: tocas un punto y Sparks lo mide en cada foto suelta.
- Capas de **Gaia DR3** y **CatWISE2020** encima de la foto.
- Banderas de calidad de la NASA, ruido por detector, y cada cifra con su fuente.
- Todo el estado viaja en la URL, para compartir o incrustar: `?ra=269.4486&dec=4.7672&fov=3.28&mode=diff&det=all&lang=es#explorar`.
- Español e inglés. Un solo tema, oscuro (decisión de Joaquín, 14 de noviembre).

Qué requisitos del reto se cumplen y cuáles no, con evidencia: [`docs/auditoria/requisitos.md`](docs/auditoria/requisitos.md).

## Cómo correrlo

Probado con Node 26; Vite 5 pide Node 18 o más reciente.

```bash
cd app
npm ci
npm run dev        # abre http://localhost:5173
```

Otros comandos, también dentro de `app/`:

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas de la lógica (coordenadas, URL, reproductor, campo de visión, espectro) |
| `npm run typecheck` | Revisión de tipos |
| `npm run check-data` | Revisa que `data-sample/` y `data-new/` cumplan el formato |
| `npm run build` | Genera el sitio en `app/dist/`, con los datos incluidos |
| `npm run preview` | Sirve `app/dist/` en http://localhost:4173 para probarlo antes de publicar |

## Cómo publicarlo

`npm run build` deja en `app/dist/` un sitio estático completo (unos 21 MB con los datos). Sirve en cualquier alojamiento de archivos estáticos gratuito.

- **En la raíz de un dominio** (Netlify, Cloudflare Pages, Vercel): `npm run build` y publicar `app/dist/`.
- **En una subcarpeta**, como GitHub Pages en `https://<usuario>.github.io/SPARKS-PROJECT/`: la base tiene que llevar el nombre del repositorio.

```bash
VITE_BASE=/SPARKS-PROJECT/ npm run build
```

Para GitHub Pages el repositorio tiene que ser público (o la cuenta, de pago).

## Qué es cada carpeta

| Carpeta | Qué es |
|---|---|
| `app/` | La aplicación web (Vite, React, TypeScript). `src/core/` es lógica pura con pruebas; `src/data/` lee los datos; `src/ui/` es la interfaz; `src/i18n/` son los textos en español e inglés; `src/styles/` son los estilos |
| `data-sample/` | Campo de la estrella de Barnard ya procesado, más el índice de objetivos. Formato en [`data-sample/README.md`](data-sample/README.md) |
| `data-new/` | Campos de WISE 0855, ε Indi B, RW Aurigae y R Draconis, procesados durante el hackatón con `pipeline/` |
| `ml-clasificador/` | Clasificador de tipo de objeto (`estrella`, `enana marron`, `enana blanca`, `variable`): v2, bosque aleatorio con 69 objetos de clase verificada (`78.3%`, `54/69` dejando uno fuera en `resultados_v2.json`; la v1 queda como historia) |
| `docs/reto/` | El enunciado del reto, sus recursos y las normas del evento |
| `docs/sprint-13-30/` | Scripts sin dependencias externas (`cobertura.py`, `recortes.py`) y prueba directa S3 `Range` en navegador (`s3-range-test.html`), con sus reportes |
| `docs/auditoria/` | Auditoría de requisitos, mapa de ramas, procedencia del material y capturas |
| `docs/entrega/` | Lo que se pega en el sitio de Space Apps: declaración de uso de SI y lista de entrega |
| `Logo/`, `branding/` | Identidad de Sparks |
| `design-proto/` | Prototipos de diseño descartados y el elegido |

La canalización que baja y procesa las imágenes (`pipeline/`) y su método (`docs/pipeline/`) están en la rama `Horacio`. Quién tiene qué en cada rama: [`docs/auditoria/mapa-de-ramas.md`](docs/auditoria/mapa-de-ramas.md).

## De dónde salen los datos

- **Imágenes**: misión SPHEREx de la NASA, mediante el servicio SIA de NASA/IPAC IRSA (`https://irsa.ipac.caltech.edu/SIA`, colecciones `spherex_dr1` y `spherex_qr3`; `spherex_qr2` devuelve `0` filas en SIA sobre los 36 objetos revisados en [`docs/sprint-13-30/cobertura.csv`](docs/sprint-13-30/cobertura.csv)). Los manifiestos de `data-new/` documentan DR1 (`10.26131/IRSA678`, 338 cuadros) y QR3 (74 cuadros); el archivo público S3 `nasa-irsa-spherex` (`us-east-1`) también admite lecturas parciales `HTTP 206` desde el navegador con CORS ([`docs/sprint-13-30/lectura-navegador.md`](docs/sprint-13-30/lectura-navegador.md)).
- **Posiciones y movimientos de referencia**: Gaia DR3 (`gea.esac.esa.int/tap-server/tap/sync`, ESA/Gaia/DPAC), CatWISE2020 (infrarrojo medio para fuentes frías invisibles en Gaia como `WISE 0855`) y SIMBAD (espejo de Harvard).
- **Procesado**: recortes de 64 × 64 píxeles (6.56′ de lado, 6.15″ por píxel), alineados y sumados por detector y temporada. La app no retoca las imágenes: solo las amplía sin suavizar y dibuja marcas en una capa aparte.

## Cómo sumar un campo o un lanzamiento nuevo

1. Procesar el campo con `pipeline/` (rama `Horacio`; pasos en `docs/pipeline/`). Sale una carpeta con `manifest.json`, `catalogs.json`, los cubos `.bin` y `png/`.
2. Copiar la carpeta a `data-new/<id>/` y añadir el campo a `data-new/index.json`.
3. Correr `npm run check-data` dentro de `app/`.
4. `npm run build` y publicar.

La aplicación web (`app/src/data/loader.ts`) lee tanto `data-sample/index.json` como `data-new/index.json`, y `npm run build` empaqueta ambas carpetas en `app/dist/`.

### Scripts independientes de verificación (`docs/sprint-13-30/`)

Solo requieren Python 3 estándar (sin dependencias externas):

- `python3 docs/sprint-13-30/cobertura.py` — Consulta SIA sobre 36 objetos (`spherex_dr1`, `spherex_qr3`, `spherex_qr2`).
- `python3 docs/sprint-13-30/recortes.py --out <ruta_fuera_de_git>` — Descarga recortes `size=0.11` sin cubo `EPSF`, con 6 hilos y reintentos.

## Qué NO hacemos (alcance y límites)

- **No afirmamos descubrimientos:** Sparks entrega **candidatos para revisar** con trazabilidad de error y fuente, no hallazgos definitivos.
- **No reemplazamos la regla física cuando falla un modelo:** en la corrida previa `data-sample/results.json` (procedencia en revisión en [`docs/auditoria/procedencia.md`](docs/auditoria/procedencia.md)), la regla física superó al modelo LightGBM en la prueba congelada (`8/9` con `0` falsas alarmas frente a `6/9` con `10` falsas alarmas); el veredicto principal usa reglas físicas y el bosque aleatorio v2 queda como señal auxiliar de clase.
- **No medimos núcleo en fuentes saturadas:** `R Draconis` está saturado en `534/534` cuadros ([`docs/sprint-13-30/entrega-horacio.md`](docs/sprint-13-30/entrega-horacio.md)), por lo que `data-new/results.json` reporta estado `parcial` (`0 < 3` detecciones de núcleo).
- **No hacemos calibración FITS completa en el navegador todavía:** la lectura directa S3 `Range` está verificada para el plano `IMAGE` (`551,040 B` en 2 peticiones o `45,184 B` en 65 peticiones), pero el cliente web no ejecuta resta de `ZODI`, decodificación `Rice` de `FLAGS` ni reproyección al vuelo.
- **Privacidad y limpieza del repositorio:** sin menores de 18 años en fotos/voces según [`docs/reto/normas.md`](docs/reto/normas.md); los `578` recortes FITS se mantienen fuera de Git y no se reutiliza código ni datos del material preliminar en `research/`.

## Equipo

Cosmonautas, Hermosillo, Sonora. Uso de herramientas de SI durante el desarrollo: [`docs/entrega/uso-de-si.md`](docs/entrega/uso-de-si.md).
