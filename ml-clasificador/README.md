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
