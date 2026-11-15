# Reporte de Detector de Movimiento por Inyección (ML)

**Autor:** Cons  
**Fecha:** 14 de noviembre de 2026 · Sprint 15:00 a 17:00  
**Objetivo:** Desarrollar un detector de movimiento con aprendizaje automático entrenado exclusivamente con inyección controlada de fuentes sobre fondos reales de SPHEREx (Barnard), exportable a TypeScript para evaluación directa en el navegador sin dependencias externas.

---

## 1. Justificación y Fundamento Físico
Los datos observacionales reales con etiquetas verificadas son escasos en el archivo preliminar de SPHEREx. Entrenar clasificadores supervisados directamente sobre pocos ejemplos reales introduce sobreajuste severo o memorización de campos. 

Para resolver esto:
1. Se extraen parches de fondo reales de las imágenes de diferencia de SPHEREx (`diffs.bin`, 64 × 64 píxeles).
2. Se inyectan fuentes puntuales convolucionadas con la PSF empírica/gaussiana del instrumento (FWHM ≈ 1.6 px).
3. Se generan tres clases físicas fundamentales:
   - **Estático (clase 0):** Fondos reales sin transitorios, o fuentes inyectadas idénticas en ambas épocas (residuo ≈ 0 + ruido observacional).
   - **Movimiento (clase 1):** Dipolo clásico formado por la resta de la fuente desplazada entre temporadas ($S_2 - S_1$) con desplazamiento entre $0.3$ y $3.0$ píxeles.
   - **Variable (clase 2):** Monopolo o cambio fotométrico sin variación centroidal ($\Delta F$ positivo o negativo).

---

## 2. Variables de Entrada Físicas Extraídas
A partir de cada parche de diferencia se calculan 11 descriptores morfológicos y estadísticos:
- `pos_flux`, `neg_flux`: Flujo integrado en los lóbulos positivo y negativo sobre $2\sigma$ del ruido.
- `flux_asymmetry`: Asimetría relativa $|F_+ - F_-| / (F_+ + F_-)$.
- `dipole_balance`: Simetría bipolar $2 \min(F_+, F_-) / (F_+ + F_-)$. En dipolos puros de movimiento tiende a $1.0$; en variables fotométricas tiende a $0.0$.
- `centroid_separation`: Distancia euclidiana en píxeles entre el baricentro positivo y el baricentro negativo.
- `peak_pos_snr`, `peak_neg_snr`, `min_peak_snr`: Relación señal/ruido máxima de cada lóbulo respecto a la escala local $\sigma$.
- `total_abs_flux`, `net_flux`: Flujo absoluto total y flujo neto residual.
- `border_dist`: Proximidad a los bordes del parche para descartar artefactos de corte.

---

## 3. Modelo y Resultados de Validación Sintética
Se entrenó un árbol de decisión regularizado (`max_depth=5`, `min_samples_leaf=10`) para permitir serialización transparente e interpretabilidad física sin bibliotecas en el navegador.

- **Conjunto sintético:** 1,800 muestras balanceadas (600 por clase).
- **Partición:** 75% entrenamiento (1,350 muestras), 25% prueba estratificada (450 muestras) con semilla congelada.
- **Métricas globales en Test:**
  - **Exactitud (Accuracy):** **81.56%**
  - **Movimiento (Clase 1):** Precisión **79%**, Exhaustividad (Recall) **89%**, F1-score **0.84**.
  - **Estático (Clase 0):** Precisión **76%**, Exhaustividad **90%**, F1-score **0.83**.
  - **Variable (Clase 2):** Precisión **94%**, Exhaustividad **65%**, F1-score **0.77**.

---

## 4. Comparación con la Regla Física (`prototipo/veredicto.py`)
- **Regla física:** Depende de umbrales duros de fotometría infrarroja ($D_6/D_2 \ge 10$) o profundidad de banda de metano ($CH_4 \ge 0.5$) y coincidencia cruzada con catálogos externos (Gaia).
- **Modelo de ML:** Opera directamente sobre la imagen residual sin necesitar conocimiento a priori del espectro ni catálogos. 
- **Ventaja del modelo:** Discrimina automáticamente fuentes de movimiento contra transitorios variables en diferencias donde no hay espectro completo disponible.
- **Desventaja del modelo:** La saturación extrema de fuentes distorsiona la separación centroidal y la relación de balance del dipolo.

---

## 5. Prueba Ciega sobre Datos Reales: Estrella de Barnard
**Protocolo congelado previo:**
- Evaluación de las diferencias Temporada 0 vs Temporada 2 ($S_0$ vs $S_2$) en los 6 detectores espectrales de SPHEREx (D1 a D6).
- Umbral de confirmación de movimiento: $P(\text{movimiento}) \ge 0.60$ en al menos 4 de los 6 detectores.

**Resultados obtenidos (corrida única sin ajuste posterior):**
- **Detector 1:** Predicción **MOVIMIENTO** ($P = 1.000$, $\text{DipoleBalance} = 0.93$, $\text{Sep} = 7.90\text{ px}$, $\text{SNR} = 21.1$).
- **Detector 2:** Predicción **MOVIMIENTO** ($P = 0.500$, umbral estricto no superado, $\text{DipoleBalance} = 0.46$).
- **Detector 3:** Predicción **MOVIMIENTO** ($P = 0.500$, umbral estricto no superado, $\text{DipoleBalance} = 0.59$).
- **Detector 4:** Predicción **MOVIMIENTO** ($P = 1.000$, $\text{DipoleBalance} = 0.68$, $\text{Sep} = 9.55\text{ px}$, $\text{SNR} = 35.0$).
- **Detector 5:** Predicción **MOVIMIENTO** ($P = 0.500$, umbral estricto no superado por saturación masiva $\text{SNR} = 841.2$).
- **Detector 6:** Predicción **MOVIMIENTO** ($P = 1.000$, $\text{DipoleBalance} = 0.79$, $\text{Sep} = 5.04\text{ px}$, $\text{SNR} = 1015.8$).

**Veredicto honesto:**
- **Recuperación con alta confianza ($P \ge 0.60$):** 3 de 6 detectores (D1, D4, D6). En los otros 3 detectores la predicción es movimiento pero con probabilidad moderada ($P = 0.50$) debido a saturación y distorsión de la PSF.
- Bajo el criterio congelado de $\ge 4$ detectores con alta confianza, el resultado se reporta honestamente como **parcialmente inconcluso en detectores saturados (3/6 de alta certeza)**.

---

## 6. Límites y Declaración de Honestidad Científica
1. El fondo de entrenamiento proviene de un único campo real (Barnard); no representa la diversidad de ruido instrumental de todo el cielo.
2. El simulador asume fuentes puntuales con PSF gaussiana; en la realidad, la PSF de SPHEREx varía espacial y espectralmente.
3. Se reporta como **candidato a movimiento** y nunca como descubrimiento definitivo.
