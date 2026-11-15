> **ACTUALIZACION (v2, 14 nov, noche).** La revision cientifica de Horacio (`docs/ml/revision-ciencia-clasificador.md`) encontro que el 91.7 % de abajo (v1) estaba inflado: tres variables (movimiento propio de catalogo, paralaje y magnitud G) reflejaban el sesgo de distancia de la muestra y no la fisica de cada clase, y los datos faltantes se leian como "enana marron". La **v2** quita esas variables, usa solo luminosidad y color de Gaia (`mg_gaia`, `bp_rp`) mas banderas de si hay dato, y se entrena con el catalogo ampliado de **69 objetos**.
>
> **Resultado honesto de la v2 (LOO, 69 objetos): 75.4 % (52 de 69)**, contra 29.0 % de la clase mayoritaria; prueba de permutacion p = 0.032. Recall: enana marron 0.90, enana blanca 0.82, estrella 0.75, **variable 0.56**. Las variables no se separan bien solo con Gaia: para eso hace falta la imagen de diferencia de SPHEREx (dipolo contra monopolo), que este modelo todavia no usa. Archivos: `entrenar_v2.py`, `modelo_v2.json` (usa el mismo `predecir.mjs`, con 4 variables: `[en_gaia, tiene_fotometria, mg_gaia, bp_rp]`), `resultados_v2.json`, `paridad_v2.json`. Ojo: en `datos/verdad-terreno-v2.csv` el objeto `Gaia DR3 3713594960831605760` (Wolf 489) sigue etiquetado como estrella aunque Horacio lo identifico como enana blanca; el modelo lo llama enana blanca y cuenta como fallo hasta que se corrija la etiqueta.
>
> **Lo que se puede decir en el pitch:** "un bosque aleatorio sobre luminosidad y color de Gaia acierta 75 % en 69 objetos con clase verificada y supera con claridad el azar; separa muy bien las enanas marrones y mal las variables, que requieren la imagen de SPHEREx". Todo lo de abajo es la v1, que se deja como historia.

# Clasificador de ML por clase de objeto

Un bosque aleatorio (200 arboles, profundidad 4, semilla 42) que clasifica un objeto en **estrella, enana marron, enana blanca o variable** a partir de seis variables de Gaia DR3: si esta en Gaia, paralaje, magnitud absoluta, color BP-RP, magnitud G y movimiento propio. Se entrena con los 36 objetos de `datos/verdad-terreno.csv` (clase verificada con SIMBAD o articulo) y `datos/gaia-fotometria.csv`, ambos de Horacio.

## Resultados (leave-one-out, 36 objetos)

| | Exactitud |
|---|---|
| **Bosque aleatorio (ML)** | **91.7 % (33 de 36)** |
| Clase mayoritaria (no aprende nada) | 47.2 % |
| Regla fisica solo con variables de Gaia, sin entrenar | 77.8 % |

Prueba de permutacion (40 repeticiones con etiquetas barajadas): ninguna igualo el acierto, p = 0.024. Recall por clase: estrella 1.00, enana marron 0.88, enana blanca 0.80, variable 0.83. Con el split de Horacio (entrenar con 33, probar con 3 estrellas de prueba): 3 de 3.

Los tres fallos: Mira (variable, sin paralaje en Gaia, el modelo la llama enana marron), Luhman 16 (enana marron con Gaia, la llama variable) y Procyon B (enana blanca sin fotometria de Gaia, la llama enana marron). Los tres tienen datos de Gaia ausentes o raros.

## Limites (leelos antes de decirlo en el pitch)
- **Son 36 objetos.** Es una prueba de concepto honesta, no una validacion a escala. El intervalo de confianza de 33/36 es ancho.
- La regla de enana blanca y el modelo usan variables parecidas (magnitud absoluta y color), asi que el ML no descubre fisica nueva ahi: la reproduce.
- La regla de "solo Gaia" no puede separar variables, asi que la comparacion con ella no es justa; la regla completa de la app usa ademas la imagen de diferencia.
- Las enanas marrones salen casi siempre por no estar en Gaia. Para separarlas de otros objetos debiles hay que usar la huella de SPHEREx (cociente D6/D2 y metano), que este modelo todavia no usa.
- Es "candidato a clase", no una identificacion definitiva.

## Archivos
- `entrenar.py`: entrena, evalua y exporta. Requiere `scikit-learn` y `numpy`.
- `modelo.json`: el bosque exportado. `predecir.mjs`: inferencia en JavaScript sin dependencias, para el navegador.
- `probar-paridad.mjs`: comprueba que `predecir.mjs` da lo mismo que scikit-learn en los 36 objetos (corre con `node`): 0 clases distintas, diferencia maxima de probabilidad de 7e-8.
- `resultados.json`: todas las cifras de arriba, la matriz de confusion y la importancia de variables.
