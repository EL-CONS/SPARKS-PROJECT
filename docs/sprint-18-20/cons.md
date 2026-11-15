# Sprint 18:00 a 20:00 · Cons · último sprint en el lugar

Sábado 14 de noviembre de 2026. El hackatón cierra a las 20:00; la entrega local es el domingo de 8:00 a 12:00. Seguimos trabajando en la noche, pero lo que no esté subido a las 19:40 no cuenta para este sprint. Trabajas en tu rama `cons` y abres pull request a `main` al final.

## Mensaje para ti

Cons, tu trabajo de las últimas horas está muy bien encaminado: 28 pruebas pasan, el build funciona, aislaste los fondos de entrenamiento, portaste las reglas de Gaia a TypeScript y el contrato de la API de campos en vivo es sensato. Ahora toca juntar tu trabajo con el diseño, que ya existe.

**La rama donde está el front más reciente es `iter/01-constelacion`** (último commit a las 17:23, "Constelación"). Las ramas `iter/02-escotilla` e `iter/03-planetario` son direcciones alternativas: no las integres. El front vive en `app/src/ui/` y `app/src/styles/`; los tokens están en `app/src/styles/tokens.css` y el sistema visual, en el `DESIGN.md` de esa rama. **Ese `DESIGN.md` es el diseño vigente y sí lo debes leer ahora**: la orden de no leer los archivos de diseño era para no copiar pautas viejas, y esas ya no existen. Lo que no se toca es el diseño: lo integras, no lo cambias.

Esa rama partió de tu primera estructura (`6dd831f`), así que **no tiene** tu trabajo posterior: `motionModel`, `veredicto`, `contract`, `gaiaPhotometry`, el estado de campos en vivo ni los cambios a `loader.ts` e `i18n/index.ts`. Joaquín añadió `i18n/ui.ts`, `intro.ts` e `insights.ts`.

Aviso, por cuarta vez: `package-lock.json` (`npm ci` sigue fallando) y `App.tsx` mínimo. Esta vez entran en la primera tarea.

## Tu sprint

| Hora | Qué |
|---|---|
| 18:00 a 18:15 | Fusionar el front y arreglar el bloqueo |
| 18:15 a 19:00 | Conectar el modelo, el veredicto y los estados de datos al front |
| 19:00 a 19:40 | Plan de respaldo para los datos o prueba con datos nuevos |
| 19:40 a 20:00 | Cierre, pull request y reporte |

### 1. Fusionar el front (18:00 a 18:15)
1. `git fetch origin && git checkout cons && git merge origin/iter/01-constelacion`. Resuelve los conflictos conservando **tu** `core/` y `data/`, y **el** `ui/`, `styles/` e `i18n/ui.ts`, `intro.ts` e `insights.ts` del front. En `i18n/index.ts` y `data/loader.ts` une los dos lados: tus claves y funciones nuevas más las que el front ya usa.
2. Corre `npm install` y sube el `package-lock.json` corregido. Con `npm ci` limpio, `npm run typecheck`, `npm test` y `npm run build` tienen que pasar.
3. Borra `app/src/App.tsx` si el front usa `ui/App.tsx` (revisa `main.tsx`) y deja un solo punto de entrada.
4. No mezcles `data-sample/` en tu pull request: eso lo sube Joaquín.

### 2. Conectar tu trabajo al front (18:15 a 19:00)
Cambia solo lo necesario en `app/src/ui/` y avisa a Joaquín qué tocaste. Mejor: exporta hooks y que él los use.
1. **Veredicto.** Un hook `useVeredicto(campo)` sobre tu `veredicto.ts` que devuelva la clase, la razón en una frase y qué datos faltan. Que el panel de veredicto del front lo use. Las razones salen de `i18n`, nada de texto fijo.
2. **Contrato.** Que el cargador valide con tu `contract.ts` y que un archivo con error muestre el estado de error del front, con el mensaje del contrato, y no una pantalla vacía.
3. **Campos en vivo.** Los cuatro estados (`en_cola`, `procesando`, `listo`, `fallo`) con sus textos en español e inglés. Pruébalos con tu `server/demo-server.mjs`.
4. **Modelo de movimiento.** Si no hay espacio claro en la interfaz, no lo fuerces: déjalo como función exportada con una prueba y dile a Joaquín dónde quedaría.

### 3. Datos nuevos (19:00 a 19:40), con dos caminos
Mira primero `origin/Horacio`: si ya tiene `pipeline/` y `data-new/`, **camino A**; si no, **camino B**.

- **Camino A.** Corre tu `ml/eval_field.py` y la regla de Horacio sobre `data-new/wise0855` y `data-new/epsindib`, con los umbrales de `docs/ml/protocolo-congelado.md` **sin cambiarlos**. Reporta la tabla por detector tal como salga, aunque sea mala. Pasa `npm run check-data` sobre esas carpetas.
- **Camino B (respaldo, si a las 18:15 Horacio no ha subido `pipeline/`).** Carlos tiene los recortes crudos de R Draconis y RW Aurigae (144 por campo, 8 cuadros por detector y temporada) y los comparte por la nube. Escribe una canalización mínima en `pipeline-min/` que haga coadds por detector y temporada, diferencias entre temporadas y un `manifest.json` en el mismo formato que `data-sample/barnard/`. Empieza por RW Aurigae (R Draconis tiene todos los cuadros saturados y hay que medir en el anillo exterior). Coordina con Carlos para no duplicar descargas, y avisa a Horacio para que no haya dos canalizaciones distintas sin saberlo. Etiquétala como "subconjunto de cuadros" en el método.

### 4. Tu corrección pendiente de la prueba de Barnard
En `docs/ml/protocolo-congelado.md`: el criterio cambió de P ≥ 0.60 a P ≥ 0.50 después de ver el primer resultado, así que llama a la segunda corrida "segunda corrida" y deja la primera (3 de 6, inconcluso) a la vista. Y resuelve la contradicción: el texto dice que D1 separa 2.0 píxeles y la tabla dice 5.9; la figura `ml/residuo_barnard_det1.png` tiene que mostrar con una marca cuál es cuál. Quita los enlaces `file:///home/gcons17/...` de los documentos.

## Si sobra tiempo
- `docs/backend/publicacion.md`: confirma con una prueba real que `npm run build` más `vite preview` sirven la app con `data-sample/`, y qué hace falta cambiar en la configuración de Vite (`base`) para publicarla en una ruta que no sea la raíz.
- Prueba que la app abre sin errores en la consola a 390 px y a 1440 px.

## Reglas
Español, sin emojis. Cada cifra con su corrida. "Candidatos", no "descubrimientos". Nada del proyecto anterior. No modifiques `Logo/`. Si algo te bloquea más de cinco minutos, avisa en el grupo.
