# Segunda tanda de la noche · Cons

Sábado 14 de noviembre de 2026, 22:15. Entrega el domingo de 8:00 a 12:00. Tu rama de trabajo sigue siendo `frontend-del-cons`.

## Mensaje para ti

Cons, buen avance: verifiqué tu commit de las 19:55 y pasan `typecheck`, 38 de 38 pruebas y el build (379 KB, 101 KB comprimido), y `check-data` pasa sobre `data-new/`. El cargador de dos carpetas y las advertencias ya funcionan. Tres cosas:

1. **Cambia el modelo del clasificador.** La revisión de Horacio (`docs/ml/revision-ciencia-clasificador.md`, rama `Horacio`) encontró que el 91.7 % de mi v1 estaba inflado: usaba movimiento propio de catálogo, paralaje y magnitud G, que reflejaban el sesgo de distancia de la muestra. Reentrené sin esas variables y con 69 objetos: **75.4 % (52 de 69)**, enanas marrones 0.90, enanas blancas 0.82, estrellas 0.75 y **variables 0.56**. Lo nuevo está en `ml-clasificador/` de la rama `joako` (`modelo_v2.json`, `paridad_v2.json`, `probar-paridad-v2.mjs`, commit `da9bb1c`). Trae esos archivos, reemplaza el modelo y deja las variables en `[en_gaia, tiene_fotometria, mg_gaia, bp_rp]` (`tiene_fotometria` = 1 si hay `mg_gaia` y `bp_rp`; -999 donde falte). Actualiza tus pruebas de paridad a `paridad_v2.json` (69 casos) y el texto del panel: "candidato a clase; acierta 75 % en 69 objetos con clase verificada; separa mal las variables".
2. **Variable o no, por la imagen.** Como el ML con Gaia separa mal las variables, la decisión de "variable" debe salir de lo que la app ya sabe de la imagen (tu modelo de movimiento por dipolo, o el campo `kind` del manifiesto), y el ML decide solo entre estrella, enana marrón y enana blanca. Muéstralo así en el panel y dilo en el texto.
3. **El archivo de bloqueo (`npm ci`) sigue fallando.** Es la quinta vez. `npm install`, sube el `package-lock.json` y confirma con `npm ci` limpio.

## Tareas, en orden
1. Los tres puntos de arriba.
2. **Publicación.** Verifica con una prueba real que `npm run build` más `npm run preview` sirven la app con los datos, qué `base` de Vite hace falta si se publica en una ruta que no es la raíz, y ajusta `docs/backend/publicacion.md` con lo que de verdad comprobaste. No afirmes que funciona con repositorio privado si no lo probaste.
3. **Prueba en el navegador.** Abre la app a 390 px y a 1440 px, en oscuro y claro, con los cinco objetivos. Anota todo lo que se rompa en `docs/qa/cons-navegador.md`, con capturas, y arregla lo que sea tuyo.
4. Pull request a `main` con lo que esté listo y avísame la rama.

## Reglas
Español, sin emojis. Cada cifra con su corrida. "Candidatos", no "descubrimientos".
