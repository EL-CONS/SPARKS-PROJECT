# Mapa de ramas de Sparks

Hecho el sábado 14 de noviembre de 2026, 19:40–20:40 (hora de Hermosillo), con `git fetch --all`. Todo el historial de Git empieza el 14 de noviembre a las 10:58; las fechas anteriores solo aparecen dentro de los archivos (ver `procedencia.md`).

## Actualización: 14 de noviembre, 23:40 (`joako-integracion`)

| Rama | Último commit | Estado |
|---|---|---|
| `origin/main` | `dbdfc97`, 14:47 | Sin cambios; sigue sin `app/` |
| `origin/frontend-del-cons` | `cbef27d`, Cons, 22:49 | Unida en `joako-integracion` (`1cf9546`) |
| `origin/joako` | `da9bb1c`, 22:04 | `ml-clasificador/` v2 traído en `ea4e82c` y reentrenado en `3174434` |
| `origin/Horacio` | `f7878e4`, 22:10 | `data-new/` completo (`git diff origin/Horacio -- data-new` vacío); `verdad-terreno.csv` corregido traído en `ea4e82c`; `pipeline/dipole_features.py` portado a `app/src/core/dipolo.ts` |
| `origin/carlos` | `3f77eec`, 22:29 | Trae `docs/entrega/` (6 piezas). No unida: se usa como fuente de la entrega (ver `docs/integracion/estado.md`) |
| `origin/cons` | `abda4fa`, 22:04 | Solo el plan; su código ya estaba en `frontend-del-cons` |
| `joako-requisitos` (local) | `de9eea8`, 22:04 | Unida en `joako-integracion` (`dff3c68`) |
| **`joako-integracion`** (local) | ver `git log` | Rama de entrega: front de Cons + auditoría + `data-new/` de Horacio + clasificador v2 reentrenado. Worktree `../sparks-integracion` |

Lo que cambió en "Dónde vive cada requisito": A3, B2, B4, B5, D7 y C1 están completos en `joako-integracion`. Los puntos 1, 2 y 3 de "Trabajo duplicado" quedaron resueltos: hay un solo cargador de dos carpetas, el clasificador de la interfaz es el de `ml-clasificador/` (v2), y `data-new/` es la de Horacio. El punto 4 sigue: los textos del pitch citan cifras viejas (ver `docs/integracion/estado.md`, tabla de cifras).

## Ramas a las 19:40

| Rama | Último commit | Quién la usa | Qué aporta que `main` no tiene | Estado |
|---|---|---|---|---|
| `main` | `dbdfc97`, Joaquín, 14:47 | Todos (base) | Contexto, `research/`, `models/report/`, `prototipo/`, `Logo/`, `branding/`, planes de sprint. **No tiene `app/` ni datos.** | Atrasada: nada del producto está aquí |
| `joako` | `9351f6a`, Joaquín, 19:35 | Joaquín | `app/` (versión anterior al diseño Constelación), `data-sample/`, `data-new/` (copia de Horacio, sin `results.json`), `ml-clasificador/`, `docs/reto/`, `docs/pitch/` completo, `docs/team/`, `docs/compliance.md` | Activa. Es la única con el clasificador y con los textos de entrega |
| `cons` | `b2761c4`, Cons, 19:37 | Cons | Front Constelación más: contrato de datos (`app/src/data/contract.ts`), `check-data`, modelo de movimiento en TS (`core/motionModel.ts`, `core/veredicto.ts`, `useVeredicto`), cliente de campo en vivo, `ml/` (detector por inyección), `pipeline-min/`, `docs/backend/`, `docs/ml/`, `data-new/rwaur` | Activa. **No lee `data-new/`, no tiene estados `parcial` ni el clasificador de `ml-clasificador/`** |
| `frontend-del-cons` | `f5b2e9e`, Joaquín, 19:25 | Cons | Diseño Constelación con modo claro. Solo `data-sample/` | Base de esta auditoría |
| `Horacio` | `f6ba8c4`, Joaquín, 19:25 | Horacio | `pipeline/` (canalización nueva `sparkspipe` 0.1.0, con pruebas), `data-new/` con los cuatro objetivos y `results.json`, `docs/pipeline/` | Activa. Fuente de `data-new/` |
| `carlos` | `360418e`, Joaquín, 19:25 | Carlos | `docs/sprint-13-30/` (cobertura y acceso a IRSA medidos), planes | Solo documentos |
| `iter/01-constelacion` | `b76f33b`, 17:23 | Joaquín | Iteración de diseño elegida; ya está dentro de `frontend-del-cons` y `cons` | Cerrada |
| `iter/02-escotilla`, `iter/03-planetario` | 15:11 y 15:14 | Joaquín | Iteraciones de diseño descartadas | Cerradas |
| `iter/kit`, `design/kit` (solo locales) | 15:06 y 14:10 | Joaquín | Base común de las iteraciones | Cerradas, sin subir |
| `joako-requisitos` (local, esta auditoría) | ver `git log` | Joaquín | `frontend-del-cons` + `data-new` + `data-sample` + `ml-clasificador` + lo implementado en la auditoría | Sin subir |

Nota sobre el nombre: el encargo pedía `joako/requisitos`, pero Git no permite esa rama mientras exista `joako` (las dos referencias chocan). Se llama `joako-requisitos`.

Copias de trabajo (`git worktree list`): el repositorio principal en `joako`; `../sparks-requisitos` en `joako-requisitos`; y cuatro copias temporales en `/tmp` (`iter-01`, `iter-02`, `iter-03`, y una de `cons` en `17554cd`) que se pueden borrar con `git worktree prune` cuando ya no existan.

Autores en Git: Joaco2025 (Joaquín), EL-CONS (correo `gabrielcons…`), NeruX, ComputerChemistry (correo `carloseduardo…`). Por descarte NeruX sería Horacio y EL-CONS sería Gabriel "Cons", pero **no está confirmado** (ver E5 en `requisitos.md`).

## Dónde vive cada requisito

| Requisito | Código | Datos | Rama donde está completo | Cómo traerlo |
|---|---|---|---|---|
| A1–A2 herramienta, coordenadas, video | `app/src/core/coords.ts`, `core/player.ts`, `ui/` | `data-sample/barnard` | `frontend-del-cons`, `cons`, `joako-requisitos` | ya está |
| A3 cinco objetivos | cargador `app/src/data/loader.ts`, `ui/kit/useSparks.ts`, `ui/sky.ts` | Barnard en `data-sample/`; los otros cuatro en `data-new/` | **En ninguna**: los datos están, el cargador no los lee | Datos: `git checkout origin/Horacio -- data-new`. Cargador: pendiente de Cons |
| B1 actualizable | `pipeline/` y `docs/pipeline/` | — | `Horacio` | `git checkout origin/Horacio -- pipeline docs/pipeline` |
| B2 bandas y espectro | `app/src/core/spectrum.ts`, `ui/components/Spectrum.tsx` | `frames.bin`, `masks.bin` | `joako-requisitos` | esta rama |
| B3 suma y resta | `ui/components/Stage.tsx`, `ui/sky.ts` | `coadds.bin`, `diffs.bin` | las tres del front | ya está |
| B4 campo de visión | `app/src/core/fov.ts` | — | `joako-requisitos` | esta rama |
| B5 Gaia y WISE | `ui/sky.ts` (`loadCatalogs`), `Stage.tsx` | `catalogs.json` | `joako-requisitos` (CatWISE); Gaia en todas | esta rama |
| B6 URL | `app/src/core/urlState.ts` | — | las tres del front | ya está |
| B7 banderas | `ui/kit/Insights.tsx` (`Quality`) | `manifest.frames[].flag_pixels` | las tres del front | ya está |
| B8 Astropy y Aladin | `pipeline/requirements.txt` (Astropy) | — | `Horacio`. **Aladin no se usa en ninguna rama** | — |
| D7 clasificador | `ml-clasificador/` (modelo y `predecir.mjs`) | `ml-clasificador/datos` | `joako` (modelo); **en ninguna rama aparece en la interfaz** | `git checkout origin/joako -- ml-clasificador`; el hook es de Cons |
| C3 textos de entrega | `docs/pitch/` | — | `joako` | `git checkout origin/joako -- docs/pitch` |

## Trabajo duplicado o contradictorio

1. **Dos lectores de manifiesto.** `app/src/data/loader.ts` (`loadFieldAssets`, que nadie llama) y `app/src/ui/kit/useSparks.ts` más `app/src/ui/sky.ts` (los que sí se usan), cada uno con su ruta fija a `data-sample/`. Cuando Cons haga el cargador de dos carpetas tiene que cambiar los tres sitios, incluido `loadFrames` y `loadCatalogs` de `sky.ts`.
2. **Dos clasificadores distintos.** `ml/` y `core/motionModel.ts` en `cons` detectan *movimiento* por inyección; `ml-clasificador/` en `joako` clasifica *tipo de objeto* (bosque aleatorio, 36 objetos). El requisito D7 habla del segundo. `models/report/` en `main` describe un tercero (LightGBM de un proyecto anterior) cuyo código no está en el repositorio.
3. **Dos versiones de `data-new/`.** La de `joako` no trae `data-new/results.json` y tiene 120 archivos de WISE 0855; la de `Horacio` trae `results.json` y 180. La vigente es la de `Horacio`. `cons` solo tiene `data-new/rwaur` (115 archivos, versión vieja).
4. **Cifras que no cuadran entre el índice viejo y los datos nuevos.** `data-sample/index.json` (canalización 0.3.0, 5 de noviembre) dice ε Indi B 4.54 ± 0.11 y WISE 0855 7.91 ± 1.35 ″/año. `data-new/index.json` (canalización 0.1.0 de Horacio, hoy) dice 4.21 ± 0.28 y 6.04 ± 0.76. `docs/pitch/team-page-en.md` y `video-30s-en.md` citan las viejas.
5. **`docs/compliance.md` (rama `joako`) describe otra aplicación**: habla de `stage.ts`, `api/main.py`, Aladin Lite 3.8.2, modo en vivo, galería y pruebas e2e que no existen en este repositorio, y de una prueba "del 5 de noviembre". No sirve como evidencia de esta entrega.
6. **`DESIGN.md` de la rama del front** describe la dirección "Bitácora de la noche" (Archivo, Atkinson, `tokens.css`), pero el código vigente es "Constelación" (Unbounded, Nunito, Martian Mono, sin `tokens.css`). Las reglas de color, movimiento y temas sí se cumplen; la tipografía y los nombres de clase del documento ya no corresponden. `ASSETS_CREDITS.md` acredita las fuentes viejas.
7. **`app/.vite/`** (caché de Vite, 10 archivos) está versionado en `frontend-del-cons` y `joako`. En esta rama ya está en `.gitignore`; falta borrarlo del índice.
