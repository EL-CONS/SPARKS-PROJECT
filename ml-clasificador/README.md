# Clasificador de ML por clase de objeto (v2 vigente)

Da un **candidato a clase** para un objeto: estrella, enana marron, enana blanca o variable. No es una verificacion ni una identificacion: la clase real sale de SIMBAD o de la literatura, no de este modelo.

Todas las cifras de esta seccion se leen de `resultados_v2.json` (reentreno del 14 nov, noche, con Wolf 489 corregido). Por que se rehizo la v1 y que limites quedan: `docs/ml/revision-ciencia-clasificador.md` (rama `Horacio`, commit `f7878e4`), secciones 1 y 4.

## Que es
- Bosque aleatorio de scikit-learn: 200 arboles, profundidad maxima 4, `class_weight="balanced"`, semilla 42 (`entrenar_v2.py`).
- **Variables (4), todas de Gaia DR3:** `en_gaia` (1 si la fuente esta en Gaia), `tiene_fotometria` (1 si hay `mg_gaia` y `bp_rp`), `mg_gaia` (magnitud absoluta G) y `bp_rp` (color BP-RP). El dato faltante se codifica como `-999`. La v1 usaba ademas paralaje, magnitud G aparente y movimiento propio de catalogo; se quitaron porque reflejaban el sesgo de distancia de la muestra (revision de Horacio, seccion 1). Todavia **no usa ninguna variable de SPHEREx**.
- **Datos:** 69 objetos con clase verificada (`datos/verdad-terreno-v2.csv`, copia de `docs/sprint-13-30/verdad-terreno.csv` de Horacio, y `datos/gaia-fotometria-v2.csv`): 19 estrellas, 20 enanas marrones, 12 enanas blancas, 18 variables.

## Como se evaluo
Dejando uno fuera (LOO): se entrena con 68 objetos, se predice el que queda fuera, y se repite 69 veces. Ademas, prueba de permutacion con 30 repeticiones de etiquetas barajadas (con bosques de 30 arboles para que tarde menos).

| | Antes (`da9bb1c`, Wolf 489 como estrella) | Ahora (Wolf 489 como enana blanca) |
|---|---|---|
| **Exactitud LOO** | 75.4 % (52 de 69) | **78.3 % (54 de 69)** |
| Clase mayoritaria (no aprende nada) | 29.0 % | 29.0 % |
| Prueba de permutacion | p = 0.032 | p = 0.032 |
| Recall estrella | 0.750 (15 de 20) | 0.789 (15 de 19) |
| Recall enana marron | 0.900 (18 de 20) | 0.900 (18 de 20) |
| Recall enana blanca | 0.818 (9 de 11) | 0.917 (11 de 12) |
| Recall variable | 0.556 (10 de 18) | 0.556 (10 de 18) |

El p = 0.032 es el minimo posible con 30 repeticiones (1/31): dice que ninguna permutacion igualo el acierto, no que la significancia sea exactamente esa. Con 69 objetos el intervalo de confianza de la exactitud es ancho.

Que cambio con la correccion: Wolf 489, G 240-72 y 82 G. Eridani pasan a acierto; Gaia DR3 6281432246412503424 (estrella, M_G = 15.45, BP-RP = 5.21) pasa a fallo, ahora como enana marron. Corrida: `entrenar_v2.py` con Python 3.12.14 y scikit-learn 1.9.1; con el CSV anterior, ese mismo entorno reproduce byte a byte los JSON de `da9bb1c`.

## Limites (leelos antes de decirlo en el pitch)
1. **Separa mal las variables (recall 0.556).** Con fotometria estatica de Gaia no se puede separar una variable de una estrella normal (revision de Horacio, 4.2.2). Acierta las variables muy luminosas o muy rojas; confunde con estrella a RW Aurigae, TW Hydrae, SS Cygni, U Geminorum y Z Camelopardalis, llama enana blanca a RR Lyrae, y manda a variable tres estrellas normales (61 Cygni A, Epsilon Eridani, Delta Pavonis). Lo que falta es la imagen de diferencia de SPHEREx (dipolo contra monopolo, `pipeline/dipole_features.py` de Horacio), que este modelo no usa.
2. **"Sin fotometria de Gaia" se lee como "enana marron" (fuga residual).** Mira, R Leonis y Procyon B no tienen `mg_gaia` (segun la revision, por saturacion o por una primaria brillante; Procyon B ni siquiera esta en Gaia DR3) y salen como enana marron (revision de Horacio, 4.2.1). El modelo no distingue "no se ve en el optico porque es fria" de "Gaia no la midio". No se corrige cambiando el modelo: hace falta la huella infrarroja de SPHEREx (cociente D6/D2 y metano). En el reentreno aparece un cuarto falso positivo hacia enana marron, Gaia DR3 6281432246412503424, que si tiene fotometria (M_G = 15.45, BP-RP = 5.21, valores de `paridad_v2.json`); la causa de ese fallo no esta analizada.
3. **El 0.900 de enana marron depende en parte de esa misma fuga:** 12 de las 20 enanas marrones no tienen fotometria de Gaia, y para ellas el modelo acierta porque falta el dato, no por su fisica.
4. **Son 69 objetos**, escogidos a mano. Es una prueba de concepto, no una validacion a escala; no se sabe como se comporta en un campo cualquiera del cielo.
5. **Es un candidato a clase, no una verificacion.** En la interfaz debe mostrarse como sugerencia junto a la clase de catalogo.

**Lo que se puede decir en el pitch:** "un bosque aleatorio sobre luminosidad y color de Gaia acierta 78 % (54 de 69) en objetos con clase verificada, contra 29 % de la clase mayoritaria; separa bien las enanas marrones y las enanas blancas y mal las variables, que requieren la imagen de diferencia de SPHEREx". Si se menciona el acierto en enanas marrones, anadir que depende en parte de que no esten en Gaia.

## Archivos de la v2
- `entrenar_v2.py`: entrena, evalua y exporta. Requiere `scikit-learn` y `numpy`. Tarda alrededor de un minuto y cuarto.
- `modelo_v2.json`: el bosque exportado; se usa con el mismo `predecir.mjs` (entrada `[en_gaia, tiene_fotometria, mg_gaia, bp_rp]`).
- `probar-paridad-v2.mjs`: comprueba con `node` que `predecir.mjs` da lo mismo que scikit-learn en los 69 objetos. Resultado del reentreno: 0 clases distintas, diferencia maxima de probabilidad 1.8e-8.
- `resultados_v2.json`: exactitud, recall, matriz de confusion, fallos de LOO e importancia de variables (`mg_gaia` 0.437, `bp_rp` 0.417, `en_gaia` 0.084, `tiene_fotometria` 0.062).
- `paridad_v2.json`: predicciones de scikit-learn para la prueba de paridad.

---

Todo lo de abajo es la v1, que se deja como historia. Sus cifras (91.7 %) estaban infladas; no usarlas.

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
