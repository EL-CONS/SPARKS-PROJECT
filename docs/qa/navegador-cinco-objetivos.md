# Los cinco objetivos en el navegador

Sábado 14 de noviembre de 2026, 22:56 a 23:10. Rama `joako-integracion` (commits `dff3c68` a `5261b36`). App en `npm run dev` (puerto 5190), abierta en el navegador integrado de la sesión de Claude Code, con viewport emulado de 1440 × 900 y de 390 × 844, en español y tema oscuro (único tema; ver paso C en `docs/integracion/estado.md`).

**Cómo se revisó.** Para cada objetivo, un guion en la página (JavaScript en la consola) recorre la interfaz real con clics: elige el objetivo en la mira, pasa al paso 2, prueba parpadeo (reproducir y comprobar que cambia la imagen), suma y resta (cuenta los píxeles no negros de cada lienzo), pulsa cada par de la resta, cambia el campo de visión a 3.28′, 1.64′ y 6.56′ (lee `fov` de la URL y la escala aplicada), lee las casillas de Gaia y CatWISE, pulsa "Medir el objetivo" del espectro y lee el paso 3. Las capturas se tomaron aparte. Sin `console.error` ni errores no capturados en una corrida limpia de los cinco a 390 px, con escucha instalada antes de empezar (resultado: lista vacía). La corrida a 1440 px encontró los tres fallos de abajo.

**Qué no se revisó.** El panel del clasificador (es el paso E). El tema claro (no existe en esta rama). Teclado y lector de pantalla (los revisó la auditoría solo en Barnard; no se repitió). El inglés de punta a punta: solo se vieron los textos nuevos en las pruebas.

## Fallos encontrados y arreglados

| # | Objetivo | Fallo | Arreglo |
|---|---|---|---|
| 1 | R Draconis | "Medir el objetivo" tumbaba toda la app (`TypeError: Cannot read properties of null (reading 'toFixed')` en `Spectrum`): sus puntos del objetivo traen `x: null`, porque no se midió posición | `93f88fc`: `isMeasured` y `targetPixel` en `app/src/ui/sky.ts`; sin posición medida se usa el centro del recorte. `Stage` solo dibuja puntos medidos. Prueba: `app/tests/punto-objetivo.test.ts` |
| 2 | RW Aurigae | El paso 3 decía "Se mueve 1.32 ± 0.57 ″ por año", pero el índice da ese valor como cota superior y no como detección | `93f88fc`: `app/src/core/movimiento.ts` (detección solo a 3 sigma o más y sin estado `parcial`); si no, el texto dice que es cota superior (es y en). Prueba: `app/tests/movimiento.test.ts` |
| 3 | ε Indi B | La resta solo ofrecía 3 de los 6 pares (tomaba los de D1, que no tiene la cuarta temporada), y en el par por defecto D1 y D4 se quedaban en "cargando" para siempre | `5261b36`: `diffPairs` une los pares de todos los detectores; un panel sin resta lo dice (`shell.noDiff`, es y en). Prueba sobre `data-new/epsindib/manifest.json` |

## Codificación de `frames.bin`

Los cuatro manifiestos de `data-new/` declaran `frames_encoding`: `int16 little-endian`, `valor = round((imagen - bkg) / sigma * 1000)`. Es la misma que supone `app/src/core/spectrum.ts` (líneas 5 a 7). `data-sample/barnard/manifest.json` no trae el campo. Tamaños: 116 cuadros × 64 × 64 × 2 bytes = 950 272 bytes en `epsindib/frames.bin`, que coincide con `N = 64` de `sky.ts`.

## Barnard (`data-sample/barnard`)

| Comprobación | 1440 px | 390 px |
|---|---|---|
| Carga y "con fotos" en la mira | sí | sí |
| Parpadeo | 6 paneles PNG cargados; al reproducir pasa de `coadd_D1_S0` a `coadd_D1_S1`; 3 temporadas (ago 2025, mar 2026, ago 2026) | igual |
| Suma | 6 lienzos con imagen | igual |
| Resta y pares | 6 lienzos; 3 pares, el activo es ago 2025 → ago 2026 | igual |
| Campo de visión | 3.28′ → escala 2, 1.64′ → escala 4, 6.56′ → sin escala; `fov` en la URL | igual |
| Gaia / CatWISE | habilitadas, 943 y 692 fuentes | igual |
| Espectro al vuelo | en la posición del objetivo, 0 de 355 fotos medibles: todas saturadas, y la interfaz lo dice ("Prueba con una estrella más débil") | igual |
| Paso 3 | "Se mueve 10.23 ± 0.43 ″ por año. Gaia DR3 esperaba 10.39" | igual |
| Captura | `capturas/1440-barnard-parpadeo.jpg` | `capturas/390-barnard-parpadeo.jpg` |

## WISE 0855 (`data-new/wise0855`, estado `ok`)

| Comprobación | 1440 px | 390 px |
|---|---|---|
| Carga | sí | sí |
| Parpadeo | 6 paneles; reproduce; 3 temporadas (may 2025, oct 2025, abr 2026) | igual |
| Suma / resta | 6 y 6 lienzos; 3 pares | igual |
| Campo de visión | funciona | funciona |
| Gaia / CatWISE | deshabilitadas, "(0)" cada una, sin error | igual |
| Espectro | 126 de 153 fotos medidas, 126 puntos dibujados | igual |
| Paso 3 | "Se mueve 6.04 ± 0.76 ″ por año […] esperaba 8.09. No coinciden del todo" | igual |
| Captura | `capturas/1440-wise0855-resta.jpg` | `capturas/390-wise0855-resta.jpg` |

## ε Indi B (`data-new/epsindib`, estado `ok`)

| Comprobación | 1440 px | 390 px |
|---|---|---|
| Carga | sí | sí |
| Parpadeo | 6 paneles; reproduce; 4 temporadas | igual |
| Suma | 6 lienzos (22 sumas en el manifiesto: D1 y D4 sin la cuarta temporada) | igual |
| Resta | tras el arreglo 3: 6 pares; en abr 2025 → sep 2026, D1 y D4 dicen por qué no hay resta | igual |
| Gaia / CatWISE | deshabilitadas, "(0)" | igual |
| Espectro | 5 de 116 fotos medibles (108 saturadas o fuera de rango, 3 con banderas), 5 puntos | igual |
| Paso 3 | "Se mueve 4.21 ± 0.28 ″ por año […] esperaba 4.68. Coinciden" | igual |
| Captura | `capturas/1440-epsindib-resta-sin-par-d1.jpg` | `capturas/390-epsindib-resta-sin-par-d1-d4.jpg` |

## RW Aurigae (`data-new/rwaur`, estado `parcial`)

| Comprobación | 1440 px | 390 px |
|---|---|---|
| Explica `parcial` | sí: insignia "Procesamiento parcial" y el motivo del índice bajo el nombre ("movimiento medido consistente con cero a 3 sigma; se reporta como cota superior, no como deteccion"); en el paso 3, salvedades y bloqueos del manifiesto | igual |
| Parpadeo / suma / resta | 6 / 6 / 6; 3 temporadas, 3 pares | igual |
| Gaia / CatWISE | deshabilitadas, "(0)" | igual |
| Espectro | 0 de 101 medibles (saturadas), la interfaz lo dice | igual |
| Movimiento | tras el arreglo 2: "Aquí no se midió movimiento: el ajuste da 1.32 ± 0.57 ″ por año […] solo es una cota superior"; sin brújula de dirección | igual |
| Captura | `capturas/1440-rwaur-cota-superior.jpg` | `capturas/390-rwaur-veredicto.jpg` |

## R Draconis (`data-new/rdra`, estado `parcial`)

| Comprobación | 1440 px | 390 px |
|---|---|---|
| Explica `parcial` | sí: insignia y motivo ("detecciones utilizables 0 < 3; no se mide movimiento propio"); en el paso 3, la salvedad de saturación en las seis bandas | igual |
| Parpadeo / suma / resta | 6 / 6 / 6; 2 temporadas (abr 2025, ago 2025), 1 par | igual |
| Gaia / CatWISE | deshabilitadas, "(0)" | igual |
| Espectro | tras el arreglo 1: mide en el centro del recorte, 0 de 62 (62 con banderas de la NASA), sin romper la app | igual |
| Movimiento | no se muestra ninguno (no hay ajuste) | igual |
| Captura | `capturas/1440-rdra-parcial.jpg` | `capturas/390-rdra-parcial.jpg` |

## Observaciones que quedan (no rompen nada)

- El motivo de `parcial` y las salvedades del paso 3 salen tal cual del índice y del manifiesto: solo en español y sin acentos ("deteccion", "anio"). En la interfaz en inglés se ven en español. Dueño: Horacio (datos) o se traduce en la app.
- En R Draconis, la tarjeta de color dice "No pudimos medir su color: 0 de 0 fotos salieron saturadas" y la de banderas termina con "Aquí casi todo está bien" aunque el 100 % de lo marcado son problemas reales. Son textos fijos de `app/src/i18n/insights.ts` que no contemplan un campo sin espectro.
- El valor esperado de los objetivos de `data-new/` se rotula "data-sample/index.json (valor del reto; fuente primaria sin verificar salvo Gaia DR3)": es el texto de `expected.catalog` del manifiesto.
- Las capturas a 1440 px son del panel del navegador, reducido a 800 px de ancho.

## Pasada final sobre el sitio construido (23:20, commit `47e1715`)

`app/dist/` construido con `VITE_BASE=/SPARKS-PROJECT/` y servido por `python3 -m http.server` (sin Vite), en `http://127.0.0.1:4175/SPARKS-PROJECT/`. Mismo guion, con escucha de `error`, `unhandledrejection` y `console.error` desde el inicio. Resultado: **cero errores** en los diez recorridos.

| Objetivo | 1440 px: parpadeo / suma / resta / pares / espectro | 390 px: igual, sin scroll horizontal | Paso 3 |
|---|---|---|---|
| Barnard | 6 / 6 / 6 / 3 / 0 de 355 (saturadas) | 6 / 6 / 6 / 3 / 0 de 355; ancho 390 | "Se mueve 10.23 ± 0.43"; clasificador "acierta 78 % en 69 objetos"; variable: no, por `kind` |
| WISE 0855 | 6 / 6 / 6 / 3 / 126 de 153 | igual | "Se mueve 6.04 ± 0.76"; variable: no, por `kind` |
| ε Indi B | 6 / 6 / 4 + 2 paneles que explican la falta de resta / 6 / 5 de 116 | igual | "Se mueve 4.21 ± 0.28"; variable: no, por `kind` |
| RW Aurigae | 6 / 6 / 6 / 3 / 0 de 101 | igual | parcial; "Aquí no se midió movimiento […] cota superior"; variable: sí, por `kind` |
| R Draconis | 6 / 6 / 6 / 1 / 0 de 62 | igual | parcial; sin frase de movimiento; variable: sí, por `kind` |

Capas de Gaia y CatWISE: habilitadas en Barnard (943 y 692) y deshabilitadas con "(0)" en los otros cuatro. Campo de visión: 3.28′, 1.64′ y 6.56′ cambian `fov` en la URL en los cinco.
