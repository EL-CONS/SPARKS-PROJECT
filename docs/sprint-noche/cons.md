# Trabajo de la noche · Cons

Sábado 14 de noviembre de 2026, 19:30 en adelante. El hackatón cierra a las 20:00 y la entrega local es el domingo de 8:00 a 12:00. Esto es lo que más pesa; sube lo que tengas cada hora.

## Mensaje para ti

Cons, ya está todo lo que necesitas dentro del proyecto. Trabaja en la rama **`frontend-del-cons`** (la del front con tu modo claro, último commit 19:06) y trae lo demás con:

```bash
git fetch origin
git checkout frontend-del-cons
git checkout origin/Horacio -- data-new
git checkout origin/joako -- ml-clasificador
git merge origin/cons
```

Novedad de las 19:15: Horacio actualizó `data-new/`. Ya incluye `data-new/results.json` (el validador `check-data` ya no debería fallar por eso) y el índice de frío de WISE 0855 y ε Indi B. WISE 0855 ahora sale con 6.04 ± 0.76″/año contra 8.09 esperado (2.7 sigma, "acuerdo dentro de 3 sigma"); ε Indi B, 4.21 ± 0.28 contra 4.68 (1.7 sigma). Vuelve a traer `data-new` antes de empezar.

## Tareas, en orden

1. **Cargador con dos carpetas.** Que `loader.ts` lea `data-sample/index.json` y `data-new/index.json`, los una, y cada campo recuerde de cuál carpeta salió para armar rutas de PNG y manifiesto. Prueba que cargue los 5 campos.
2. **Estados del manifiesto.** Si un manifiesto trae `status: "parcial"` o `caveats`, el front lo muestra con su texto (claves de `i18n`, en español e inglés), no lo oculta. R Draconis (saturada, sin movimiento medido) y RW Aurigae (variable, el valor medido no es una detección) son `parcial`. WISE 0855 y ε Indi B sí tienen medición.
3. **Clasificador de ML.** Copia `ml-clasificador/predecir.mjs` y `modelo.json` a `app/src/core/` con tipos. Escribe `featuresDeCampo(campo)` que arme `[en_gaia, log10_paralaje, mg_gaia, bp_rp, g_mag, log10_mu]` (usa -999 donde falte). Los de Gaia están en cada `catalogs.json` y en `ml-clasificador/datos/gaia-fotometria.csv`. Hook `useClase(campo)`: la clase, las probabilidades y el veredicto de tu regla juntos, marcando cuándo no coinciden. Pruebas con `ml-clasificador/paridad.json` (36 casos): la misma clase que scikit-learn.
4. **`check-data`** que acepte una carpeta sin `results.json` y que pase con `data-new/`.
5. **Panel del clasificador** (tú y Joaquín lo ven juntos): la clase, el porcentaje y la frase visible "candidato a clase, entrenado con 36 objetos (33 de 36 al dejar uno fuera)". Son "candidatos", nunca "identificamos".

## Deuda pendiente tuya
- `package-lock.json` y que `npm ci` pase (llevas varias veces).
- Tu prueba de Barnard: llama "segunda corrida" a la que cambió el umbral de 0.60 a 0.50 después de ver el resultado, y resuelve la contradicción entre las separaciones de la tabla (4.5 a 9.4 píxeles) y el texto (2.0).
- Cuando termines lo de arriba, corre `ml/eval_field.py` con los umbrales congelados, **sin cambiarlos**, sobre `data-new/wise0855` y `data-new/epsindib`, y reporta la tabla por detector aunque salga mala.

## Reglas
Español, sin emojis. Cada cifra con su corrida. "Candidatos", no "descubrimientos". No toques `Logo/`. Pull request a `main` al terminar y avisa al grupo qué rama dejas.
