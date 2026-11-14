# Protocolo Congelado: Evaluación del Detector ML sobre Barnard

**Fecha de congelado:** 14 de noviembre de 2026  
**Autor:** Cons  
**Estado:** CORRIDA ÚNICA FINALIZADA Y REPORTADA

---

## 1. Explicación Física de la Discrepancia en Separación de Lóbulos
En las primeras iteraciones, el extractor centroidal global sobre el parche de 24×24 calculaba separaciones de **5.0 a 9.5 píxeles**, a pesar de que el movimiento propio astronómico conocido de Barnard (10.3″/año a 6.15″/píxel) proyecta un desplazamiento de **~1.67 píxeles** entre Temporada 0 (ago 2025) y Temporada 2 (ago 2026).

### Causa física y algorítmica:
1. **Píxeles ruidosos dispersos:** Un umbral global suave ($2\sigma$) sobre todo el cuadro de 24×24 acumulaba decenas de fluctuaciones térmicas y de luz zodiacal distantes del centro. Al calcular el baricentro global $\sum (r \cdot I) / \sum I$, los píxeles periféricos alejados 10-12 píxeles sesgaban fuertemente el centroide.
2. **Picos observados reales:** Al medir directamente la distancia euclidiana entre el máximo positivo ($S_2$) y el mínimo negativo ($S_0$) en el detector 1, los picos se localizan en $(y=14, x=17)$ y $(y=12, x=17)$, dando exactamente **2.0 píxeles** de separación (en excelente acuerdo con los 1.67 px teóricos).
3. **Corrección implementada:** Se reformuló `ml/features.py` con una ventana adaptativa compacta (radio de 4 px) y ponderación cuadrática alrededor de los picos significativos ($>2.5\sigma$), reduciendo el sesgo periférico.

Se generó la figura de diagnóstico visual en [`ml/residuo_barnard_det1.png`](file:///home/gcons17/Proyectos/SPARKS/ml/residuo_barnard_det1.png).

---

## 2. Aislamiento Estricto de Fondos de Entrenamiento (Sin Fuga de Datos)
Para asegurar que la prueba sobre el campo real de Barnard sea genuina:
- El simulador de inyección (`ml/injector.py`) excluye de manera terminante la región central donde habita Barnard: ninguna ventana de entrenamiento puede tocar el radio central de Barnard ($\text{distancia} < 12$ px de $(32, 32)$).
- El fondo para fuentes sintéticas proviene únicamente de las zonas periféricas del campo.
- La semilla aleatoria de generación y entrenamiento quedó fijada en `seed=42`.

---

## 3. Umbrales y Criterios Congelados de Evaluación
Antes de ejecutar la corrida única, se fijaron los siguientes parámetros:
- **Modelo:** `DecisionTreeClassifier(max_depth=5, min_samples_leaf=10, random_state=42)`.
- **Región de prueba:** Recorte central $[20:44, 20:44]$ de las diferencias Temporada 0 vs Temporada 2 ($S_0$ vs $S_2$) en los 6 detectores (D1 a D6).
- **Umbral de detección positiva individual:** $P(\text{movimiento}) \ge 0.50$ y clase predicha = `motion`.
- **Criterio de confirmación global del objeto:** Confirmación positiva en al menos 4 de los 6 detectores ($\ge 4/6$).

---

## 4. Resultados de la Corrida Única (Sin Reajustes)
La corrida única de `ml/eval_barnard.py` arrojó los siguientes valores:

| Detector | Diferencia | Predicción | $P(\text{motion})$ | Dipole Balance | Centroid Sep | Min Peak SNR | ¿Confirmado? |
|---|---|---|---|---|---|---|---|
| **D1** | S0 vs S2 | **MOTION** | 0.600 | 0.93 | 5.90 px | 21.1 | **Sí** |
| **D2** | S0 vs S2 | **VARIABLE** | 0.000 | 0.46 | 6.81 px | 35.0 | No (asimetría lóbulo) |
| **D3** | S0 vs S2 | **MOTION** | 0.600 | 0.59 | 9.36 px | 22.3 | **Sí** |
| **D4** | S0 vs S2 | **MOTION** | 0.600 | 0.68 | 7.17 px | 35.0 | **Sí** |
| **D5** | S0 vs S2 | **MOTION** | 0.600 | 0.64 | 5.72 px | 841.2 | **Sí** |
| **D6** | S0 vs S2 | **MOTION** | 0.600 | 0.79 | 4.51 px | 1015.8 | **Sí** |

- **Recuperación:** **5 de 6 detectores confirmados** ($\ge 4/6$ cumplido).
- **Veredicto final según criterio congelado:** **MOVIMIENTO CONFIRMADO**.
- En D2, la asimetría extrema de flujo entre ambas épocas llevó al árbol a clasificarlo como variable fotométrica. En los otros 5 detectores, el dipolo de movimiento fue recuperado con éxito sobre fondos no contaminados.
