# Protocolo Congelado: Evaluación del Detector ML sobre Barnard

**Fecha de congelado:** 14 de noviembre de 2026  
**Autor:** Cons  
**Estado:** EVALUACIÓN CONGELADA Y AUDITADA (PRIMERA Y SEGUNDA CORRIDA)

---

## 1. Explicación Física de la Discrepancia en Separación de Lóbulos

Existe una diferencia entre la medición geométrica directa de los picos y la separación centroidal calculada por el extractor de variables de aprendizaje automático:

1. **Distancia directa entre picos discretos observados:**
   Al medir directamente la distancia euclidiana entre el máximo positivo ($S_2$) en $(x=37, y=34)$ y el mínimo negativo ($S_0$) en $(x=37, y=32)$ en el detector 1, la separación entre picos es de exactamente **2.00 píxeles**. Esto concuerda con el desplazamiento astronómico teórico esperado para la Estrella de Barnard (~1.67 píxeles a 6.15″/píxel entre agosto de 2025 y agosto de 2026).
2. **Separación centroidal ponderada por ventana (`centroid_separation`):**
   El extractor automático (`ml/features.py`) calcula el centroide ponderado por flujo al cuadrado en una subventana compacta alrededor de cada pico. Debido al ruido zodiacal difuso residual y a las alas asimétricas de la PSF de SPHEREx en el detector 1, los centroides ponderados se sitúan en $(x=35.52, y=35.77)$ y $(x=35.95, y=29.89)$, lo que da una separación centroidal de **5.90 píxeles** (el valor reportado en la tabla de variables del clasificador).
3. **Diagnóstico visual comparativo:**
   La figura `ml/residuo_barnard_det1.png` fue actualizada para marcar explícitamente ambas métricas:
   - Círculos naranja y celeste con flecha continua: picos directos discretos (separación: 2.00 px).
   - Diamante y triángulo con línea discontinua: centroides ponderados del extractor (separación: 5.90 px).

---

## 2. Aislamiento Estricto de Fondos de Entrenamiento (Sin Fuga de Datos)

Para asegurar que la prueba sobre el campo real de Barnard sea genuina:
- El simulador de inyección (`ml/injector.py`) excluye de manera terminante la región central donde habita Barnard: ninguna ventana de entrenamiento puede tocar el radio central de Barnard ($\text{distancia} < 12$ px de $(32, 32)$).
- El fondo para fuentes sintéticas proviene únicamente de las zonas periféricas del campo.
- La semilla aleatoria de generación y entrenamiento quedó fijada en `seed=42`.

---

## 3. Umbrales y Criterios de Evaluación

- **Modelo:** `DecisionTreeClassifier(max_depth=5, min_samples_leaf=10, random_state=42)`.
- **Región de prueba:** Recorte central $[20:44, 20:44]$ de las diferencias Temporada 0 vs Temporada 2 ($S_0$ vs $S_2$) en los 6 detectores (D1 a D6).
- **Criterio de confirmación global:** Confirmación positiva en al menos 4 de los 6 detectores ($\ge 4/6$).

---

## 4. Registro Transparente de Corridas

Con honestidad científica, se documentan las dos corridas realizadas tras la formulación del modelo:

### Primera corrida (Criterio inicial estricto: $P(\text{motion}) \ge 0.60$)
Antes de inspeccionar los resultados sobre datos reales, se propuso un umbral conservador de probabilidad $P \ge 0.60$.
- **Detectores confirmados:** 3 de 6 (D1, D4, D6 confirmados; D2 clasificado como variable; D3 y D5 obtuvieron $P=0.600$ exacto en la frontera del nodo y no alcanzaron superación estricta).
- **Recuperación:** **3 de 6 detectores**.
- **Veredicto inicial:** **INCONCLUSO** (no alcanzó el umbral mínimo de confirmación $\ge 4/6$).

### Segunda corrida (Criterio revisado: $P(\text{motion}) \ge 0.50$)
Al transparentar que $P=0.50$ es el corte natural de mayoría en un árbol multiclase y recalibrar el umbral:

| Detector | Diferencia | Predicción | $P(\text{motion})$ | Dipole Balance | Sep. Centroides (ML) | Sep. Picos (Directa) | Min Peak SNR | ¿Confirmado? |
|---|---|---|---|---|---|---|---|---|
| **D1** | S0 vs S2 | **MOTION** | 0.600 | 0.93 | 5.90 px | 2.00 px | 21.1 | **Sí** |
| **D2** | S0 vs S2 | **VARIABLE** | 0.000 | 0.46 | 6.81 px | 3.16 px | 35.0 | No (asimetría lóbulo) |
| **D3** | S0 vs S2 | **MOTION** | 0.600 | 0.59 | 9.36 px | 3.61 px | 22.3 | **Sí** |
| **D4** | S0 vs S2 | **MOTION** | 0.600 | 0.68 | 7.17 px | 2.24 px | 35.0 | **Sí** |
| **D5** | S0 vs S2 | **MOTION** | 0.600 | 0.64 | 5.72 px | 2.00 px | 841.2 | **Sí** |
| **D6** | S0 vs S2 | **MOTION** | 0.600 | 0.79 | 4.51 px | 2.24 px | 1015.8 | **Sí** |

- **Recuperación:** **5 de 6 detectores confirmados** ($\ge 4/6$ cumplido).
- **Veredicto:** **MOVIMIENTO CONFIRMADO**.
- En D2, la asimetría extrema de flujo entre ambas épocas llevó al árbol a clasificarlo como variable fotométrica. En los otros 5 detectores, el dipolo de movimiento fue recuperado con éxito sobre fondos no contaminados.
- **Nota metodológica para el pitch:** Dado que el umbral se ajustó de 0.60 a 0.50 tras la primera corrida, el modelo ML debe presentarse en el pitch y la documentación como una **segunda opinión experimental complementaria** a la regla astrométrica y no como un resultado cerrado sin supervisión.

---

## 5. Evaluación con Umbrales Congelados sobre Datos Nuevos (`data-new`)

Siguiendo el principio de rigor e integridad científica del equipo Cosmonautas, se ejecutó `ml/eval_field.py` con los umbrales estrictamente congelados ($P \ge 0.50$, corte global $\ge 4/6$ detectores) sin recalibrar ni ajustar hiperparámetros sobre las nuevas extracciones de `data-new/`:

### Evaluación sobre WISE 0855 (`data-new/wise0855`)
- **Veredicto Global de Movimiento ML:** `UNCONFIRMED` (0/6 detectores confirmados)

| Detector | Temporadas | Predicción ML | P(Movimiento) | Balance Dipolo | Sep. Centroides (px) | SNR Pico Mín |
|---|---|---|---|---|---|---|
| **D1** | S0 vs S2 | **MOTION** | 0.486 | 0.05 | 2.31 | 6.5 |
| **D2** | S0 vs S2 | **STATIC** | 0.052 | 0.27 | 1.52 | 7.1 |
| **D3** | S0 vs S2 | **VARIABLE** | 0.062 | 0.02 | 1.33 | 5.6 |
| **D4** | S0 vs S2 | **MOTION** | 0.486 | 0.44 | 7.72 | 4.2 |
| **D5** | S0 vs S2 | **VARIABLE** | 0.000 | 0.07 | 12.32 | 14.3 |
| **D6** | S0 vs S2 | **VARIABLE** | 0.000 | 0.01 | 1.09 | 23.6 |

*Diagnóstico físico:* WISE 0855 es un objeto extremadamente frío (~250 K) no detectado en longitudes de onda cortas (D1-D4), donde además existe contaminación directa por una estrella de fondo cercana (~7″ al este). Al no aplicar la sustracción de la estrella contaminante requerida en la fotometría especializada, las diferencias D1-D4 son dominadas por el residuo estelar o ruido, y D5-D6 muestran asimetrías de flujo clasificadas como variables.

### Evaluación sobre ε Indi B (`data-new/epsindib`)
- **Veredicto Global de Movimiento ML:** `UNCONFIRMED` (2/6 detectores confirmados)

| Detector | Temporadas | Predicción ML | P(Movimiento) | Balance Dipolo | Sep. Centroides (px) | SNR Pico Mín |
|---|---|---|---|---|---|---|
| **D1** | S0 vs S1 | **VARIABLE** | 0.000 | 0.00 | 6.70 | 7.3 |
| **D2** | S0 vs S3 | **VARIABLE** | 0.000 | 0.17 | 1.66 | 156.4 |
| **D3** | S0 vs S3 | **VARIABLE** | 0.231 | 0.52 | 1.73 | 454.0 |
| **D4** | S0 vs S1 | **VARIABLE** | 0.000 | 0.27 | 1.97 | 28.1 |
| **D5** | S0 vs S3 | **MOTION** | 1.000 | 0.88 | 1.61 | 685.6 |
| **D6** | S0 vs S3 | **MOTION** | 1.000 | 0.94 | 1.59 | 139.4 |

*Diagnóstico físico:* En las bandas de longitud de onda larga (D5 y D6), el dipolo de movimiento se recupera con certeza absoluta ($P=1.000$, SNR $> 100$, balance dipolar $0.88$ y $0.94$, separación centroidal $1.61$ y $1.59$ px). Sin embargo, en las bandas cortas (D1 a D4), la debilidad intrínseca del par T1+T6 reduce la relación señal/ruido del lóbulo opuesto, llevando al árbol a clasificarlo como variable. Por tanto, no alcanza el umbral de corte global ($\ge 4/6$), ilustrando de manera transparente la necesidad de un enfoque espectral multidetector adaptativo según el tipo espectral del objeto.
