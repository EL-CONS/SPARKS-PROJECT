# Dossier de Investigación Científica · Sparks × SPHEREx

> **Responsable:** Horacio (Rol de Ciencia y Física del Motor)  
> **Equipo:** Cosmonautas · Hermosillo, Sonora  
> **Proyecto:** Sparks (NASA Space Apps Challenge · Reto SPHEREx)  
> **Rama de trabajo:** `Horacio`  
> **Última actualización:** 14 de noviembre de 2026

---

## 1. Alcance y Objetivos de la Investigación

Este documento concentra el fundamento astrofísico, los límites físicos de detección instrumental, las ecuaciones de cinemática estelar y del Sistema Solar, y las firmas espectrales que rigen el motor de análisis de **Sparks**.

### Objetivos clave del rol de Ciencia:
1. **Física del Motor:** Definir con rigor matemático cómo la diferencia temporal de imágenes revela movimiento verdadero mediante dipolos y cómo aislarlo de la variabilidad de brillo y de artefactos instrumentales.
2. **Firmas Espectrales:** Utilizar las 102 bandas espectrales continuas de SPHEREx ($0.75\text{--}5.0\,\mu\text{m}$) para autenticar la naturaleza de objetos ultrafríos (enanas marrones tipo T e Y) mediante absorción molecular de metano y agua, superando las limitaciones de encuestas de solo dos bandas como WISE.
3. **Cinemática y Escalas de Tiempo:** Establecer con unidades exactas cuánto se mueve cada clase celeste y qué es medible frente al tamaño de píxel de SPHEREx ($6.15''$).
4. **Honestidad Científica y Validación:** Verificar cada número con fuentes astronómicas primarias (Gaia DR3, SIMBAD, IRSA/IPAC, literatura en arXiv) y contrastar la regla física del detector con el modelo de Machine Learning sobre pruebas ciegas.

---

## 2. Parámetros Instrumentales de SPHEREx

Para fundamentar cualquier afirmación científica, debemos partir de las especificaciones reales del telescopio espacial SPHEREx (datos QR2 y QR3 de IRSA):

| Parámetro | Valor | Implicación física para Sparks |
|---|---|---|
| **Escala de placa (píxel)** | $6.15''/\text{pixel}$ | Resolución gruesa de cielo completo. Todo movimiento estelar típico ($<1''$) está en el régimen subpíxel; solo objetos de altísimo movimiento propio superan $1\text{ px}$. |
| **FWHM óptico** | $\approx 6.6''$ (en Detector 6) | Una fuente puntual ilumina típicamente un parche de $2 \times 2$ a $3 \times 3$ píxeles. |
| **Rango espectral** | $0.75\,\mu\text{m}$ a $5.00\,\mu\text{m}$ (102 canales) | Cubre visible lejano, infrarrojo cercano (NIR) e infrarrojo medio (MIR). |
| **Resolución espectral** | $R \approx 41$ (D1–D3), $R \approx 135$ (D4–D6) | Permite espectrofotometría detallada y resolución de bandas moleculares anchas. |
| **Detectores (6 arreglos)** | D1: $0.75\text{--}1.11\,\mu\text{m}$<br>D2: $1.11\text{--}1.64\,\mu\text{m}$<br>D3: $1.64\text{--}2.42\,\mu\text{m}$<br>D4: $2.42\text{--}3.82\,\mu\text{m}$<br>D5: $3.82\text{--}4.42\,\mu\text{m}$<br>D6: $4.42\text{--}5.00\,\mu\text{m}$ | Cada detector opera con filtros variables lineales (LVF); una fuente puntual cambia de longitud de onda observada según su posición en el arreglo. |
| **Cadencia temporal** | 6 meses entre coberturas completas | La base de datos actual (QR2 + QR3) ofrece una línea base temporal de $\Delta t \approx 1.0\text{--}1.5\text{ años}$. |

---

## 3. Cinemática Celeste: Regímenes de Movimiento y Unidades Rigurosas

> **Regla de oro del equipo:** Una sola unidad por régimen dinámico. $''/\text{año}$ para estrellas y enanas marrones; $''/\text{día}$ o $''/\text{hora}$ para cuerpos menores del Sistema Solar.

### 3.1. Estrellas y Enanas Marrones (Vecindario Solar)

El desplazamiento angular en la esfera celeste se rige por el movimiento propio total $\mu$:
$$\mu = \sqrt{(\mu_\alpha \cos\delta)^2 + \mu_\delta^2} \quad [\text{unidades: } ''/\text{año}]$$

El salto esperado en píxeles de SPHEREx tras una base temporal $\Delta t$ es:
$$\Delta x_{\text{px}} = \frac{\mu \cdot \Delta t}{6.15''}$$

#### Análisis de los objetivos de calibración y prueba (con datos reales de `results.json` y manifiestos):

1. **Barnard's Star (M4V, distancia: $1.83\,\text{pc}$):**
   * $\mu \approx 10.39''/\text{año}$ (Gaia DR3).
   * Línea base en SPHEREx: 15 ago 2025 a 22 sep 2026 ($\Delta t = 0.98\,\text{años}$, distribuida en tres temporadas: S0 15 ago – 1 oct 2025, S1 11 mar – 5 may 2026, S2 16 ago – 22 sep 2026).
   * Desplazamiento esperado con Gaia: $10.39 \times 0.98 / 6.15 = \mathbf{1.66\,\text{px}}$ ($\sim 10.18''$).
   * Medición real de Sparks (`results.json`): $\mu = 10.23 \pm 0.43''/\text{año} \rightarrow \mathbf{1.63\,\text{px}}$ (acuerdo a $0.4\sigma$).
   * *Diagnóstico:* Se observa como un dipolo clarísimo en la resta. Al ser una estrella brillante ($V \sim 9.5$, muy luminosa en IR), presenta saturación de núcleo en SPHEREx, requiriendo medición en los lóbulos de las alas de la PSF.
2. **WISE 0855−0714 (Enana marrón Y4, $T \approx 250\,\text{K}$, distancia: $2.23\,\text{pc}$):**
   * $\mu = 8.09 \pm 0.17''/\text{año}$; paralaje $\pi = 0.449 \pm 0.008''$ (CatWISE2020 / Luhman 2014).
   * Línea base en SPHEREx: 5 may 2025 a 14 may 2026 ($\Delta t = 0.99\,\text{años}$, en QR2).
   * Desplazamiento esperado con CatWISE: $8.09 \times 0.99 / 6.15 = \mathbf{1.30\,\text{px}}$ ($\sim 8.01''$).
   * Medición real de Sparks (`results.json`): $\mu = 7.91 \pm 1.35''/\text{año} \rightarrow \mathbf{1.27\,\text{px}}$ (acuerdo a $0.1\sigma$).
   * *Diagnóstico:* Invisible en los detectores D1 a D3 ($<2.4\,\mu\text{m}$). Emerge con alto S/N en D5 y D6 ($4\text{--}5\,\mu\text{m}$). Es el caso de estudio clave para demostrar que **el movimiento sumado al espectro MIR identifica el objeto sin lugar a dudas**.
3. **$\mathbf{\epsilon}$ Indi Ba/Bb (Sistema binario T1 + T6, distancia: $3.6\,\text{pc}$):**
   * $\mu \approx 4.70''/\text{año}$ (Gaia DR3, movimiento común con $\epsilon$ Indi A).
   * Separación orbital de la pareja: $0.732''$ (físicamente **no resuelta** por el píxel de $6.15''$).
   * Línea base en SPHEREx: may-2025 a oct-2026 ($\Delta t = 1.39\,\text{años}$, bloques QR2 desde may-2025 hasta QR3 el 2 oct 2026).
   * Desplazamiento esperado con Gaia: $4.70 \times 1.39 / 6.15 = \mathbf{1.06\,\text{px}}$ ($\sim 6.53''$).
   * Medición real de Sparks (`results.json`): $\mu = 4.54 \pm 0.11''/\text{año} \rightarrow \mathbf{1.03\,\text{px}}$ (acuerdo a $1.5\sigma$).
   * *Riesgo:* $\epsilon$ Indi A (estrella K4V brillante) está a solo $\sim 6.7'$ de distancia, introduciendo artefactos y fantasmas ópticos (bandera `GHOST`).

> **Veredicto sobre Paralaje Estelar:**  
> La paralaje de las estrellas más cercanas es $\pi < 1''$ (Barnard $\sim 0.55''$, WISE 0855 $\sim 0.45''$). Frente a un píxel de $6.15''$, la oscilación semianual es de apenas $\pm 0.07\text{ px}$. **La paralaje estelar no es medible de forma directa ni ajustada en Sparks; se retira o se ignora en la cinemática de primer orden.**

---

### 3.2. Cuerpos Menores del Sistema Solar

A diferencia de las estrellas, los asteroides y cometas están dominados por la velocidad orbital heliocéntrica y la velocidad de traslación de la Tierra ($v_\oplus \approx 29.8\,\text{km/s}$):

| Objeto | Distancia típica | Movimiento angular aparente | Desplazamiento en una visita (horas/días) | Firma en SPHEREx |
|---|---|---|---|---|
| **NEO (Asteroide cercano)** | $< 1.3\,\text{UA}$ | Decenas a cientos de $''/\text{min}$ | Decenas de píxeles; puede dejar traza (*trail*) | Sale rápidamente del campo de visión; detectable en exposiciones individuales consecutivas. |
| **Cinturón Principal (en oposición)** | $2.1\text{--}3.3\,\text{UA}$ | $\sim 0.25^\circ/\text{día} \approx \mathbf{35\text{--}40''/\text{hora}}$ | Decenas de píxeles en cuestión de horas | **El objetivo más dinámico y visual:** se desplaza muchos píxeles dentro de la misma temporada de observación. |
| **Objeto Transneptuniano (TNO)** | $\sim 40\,\text{UA}$ | $\sim 3''/\text{hora} \approx 72''/\text{día}$ | $0.5\text{--}1.0\text{ px}$ por hora | Requiere enlace temporal (*tracklets*) de varios días. |
| **Hipotético Planeta X** | $\sim 500\,\text{UA}$ | $\sim 0.3''/\text{hora} \approx \mathbf{7''/\text{día}}$ | $\sim 1\text{ px}$ por día | Movimiento aparente dominado casi por completo por la paralaje refleja de la Tierra. |

*Corrección de mito:* En borradores iniciales se estimaba "TNOs / Planeta X $< 2''/\text{día}$". Dicha cifra era errónea. La paralaje de traslación terrestre a $500\,\text{UA}$ proyecta hasta $\sim 7''/\text{día}$ durante la oposición.

---

### 3.3. Exoplanetas: Límite Físico Fundamental

* **¿Es posible clasificar o detectar exoplanetas por movimiento directo en SPHEREx?**
* **Respuesta categórica:** **NO.**
* **Justificación física:**
  1. *Escala angular:* Un planeta a $10\,\text{pc}$ de la Tierra con órbita tipo Júpiter ($5\,\text{UA}$) tiene una separación angular máxima de $\theta = 5\,\text{UA} / 10\,\text{pc} \approx 0.5''$. En SPHEREx ($6.15''/\text{px}$), toda la órbita ocurre dentro de una doceava parte de un solo píxel.
  2. *Contraste de flujo:* La estrella anfitriona es entre $10^6$ y $10^9$ veces más brillante en el infrarrojo. El flujo del planeta queda enterrado bajo el ruido de fotones estelar.
  3. *Conclusión para el pitch:* Cualquier propuesta de "detectar exoplanetas que se mueven" en imágenes de SPHEREx destruiría la credibilidad del equipo ante un jurado astrofísico.

---

## 4. Física del Motor: Detección por Diferencia y Formación de Dipolos

### 4.1. El Principio del Dipolo
Cuando se sustraen dos imágenes apiladas de épocas distintas registradas astrométricamente:
$$\Delta I(x, y) = I_{t_2}(x, y) - I_{t_1}(x, y)$$

* En la posición original $(x_1, y_1)$ de una fuente móvil: $I_{t_2} \approx I_{\text{cielo}}$ y $I_{t_1} \approx I_{\text{fuente}}$, generando un **lóbulo negativo** (valle con $\Delta I < 0$).
* En la nueva posición $(x_2, y_2)$: $I_{t_2} \approx I_{\text{fuente}}$ y $I_{t_1} \approx I_{\text{cielo}}$, generando un **lóbulo positivo** (pico con $\Delta I > 0$).
* La firma geométrica resultante es un **dipolo espacial antisimétrico**:
$$\int \Delta I(x,y) \, dx \, dy \approx 0$$
* El vector que une el centroide del valle con el centroide del pico define la dirección del movimiento propio en la proyección local:
$$\vec{d} = (x_2 - x_1, y_2 - y_1)$$

```
      Lóbulo Negativo (Antes: t₁)       Lóbulo Positivo (Ahora: t₂)
           [ - Flujo ] ───────────────> [ + Flujo ]
                               Vector μ
```

### 4.2. Régimen de Saturación Estelar
Para fuentes brillantes ($G < 8$ o saturadas en SPHEREx):
* El centroide del núcleo está marcado con banderas `OVERFLOW` o `NONLINEAR` (valores NaN en la resta).
* Sin embargo, las **alas de la PSF** (a radios $r > 1.5 \times \text{FWHM}$) no están saturadas y sí se desplazan.
* El motor de Sparks identifica pares de lóbulos residuales en lados opuestos del núcleo enmascarado alineados simétricamente con el movimiento.

---

## 5. Separación Física: Movimiento Propio vs. Variabilidad

El reto más complejo para el detector de transitorios es discriminar entre un objeto que cambia de posición y una fuente estática que cambia de brillo:

| Criterio | Objeto que se Mueve (Mover) | Fuente Variable (Variable) | Artefacto / Ruido |
|---|---|---|---|
| **Morfología del residuo** | **Dipolo antisimétrico** (par negativo/positivo balanceado) | **Residuo monopolar simétrico** (pico único positivo o negativo) | Mancha irregular o residuo monocromático |
| **Integral de flujo residual** | $\int \Delta I \approx 0$ | $\int \Delta I \ne 0$ (flujo neto residual neto grande) | Aleatorio |
| **Salto de centroide** | Desplazamiento $> 0.3\text{ px}$ entre temporadas | Desplazamiento nulo ($< 0.05\text{ px}$) del centro de luz | Sin correlación |
| **Consistencia multidetector** | Dipolo alineado con idéntico vector en $\ge 2$ detectores | Variación monopolar coordinada en múltiples bandas | Típicamente restringido a 1 detector (fantasmas, rayos cósmicos) |

### Casos de Estudio Reales de Variabilidad en Sparks:

1. **R Draconis (Variable tipo Mira):**
   * Período de pulsación: **246 días**. Amplitud en visible: mag $6.7$ a $13.2$.
   * En el infrarrojo, la variabilidad es menor pero muy evidente.
   * Con SPHEREx hay $\sim 25$ bloques entre may-2025 y jul-2026 ($\sim 430$ días, $\approx 1.7$ ciclos).
   * *Resultado en Sparks:* Desplazamiento $\ll 0.05\text{ px}$. Deja un residuo simétrico positivo cuando está en máximo y negativo cuando está en mínimo. Se clasifica de forma limpia como **Variable** sin generar falsas alarmas de movimiento.
2. **RW Aurigae (Estrella T Tauri binaria joven):**
   * Muestra oscurecimientos masivos de $\Delta V \gtrsim 2\,\text{mag}$ causados por nubes de polvo circumestelar caliente ($500\text{--}700\,\text{K}$).
   * *Resultado en Sparks:* Espectro con exceso variable en $3\text{--}5\,\mu\text{m}$. La posición estelar permanece estática en submilisegundos de arco.

---

## 6. Firmas Espectrales en 102 Bandas: Enanas Marrones vs. Estrellas

### 6.1. ¿Por qué la aproximación de Planck (Cuerpo Negro) es incorrecta?
En las primeras discusiones se propuso ajustar una curva de Planck para estimar la temperatura de las enanas marrones. **Esta idea fue descartada**:
* Las enanas marrones de tipo T e Y (temperaturas $< 1000\,\text{K}$) **no se comportan como cuerpos negros**.
* Sus atmósferas tienen opacidades colosales dominadas por absorción molecular de metano ($\text{CH}_4$), vapor de agua ($\text{H}_2\text{O}$), amoníaco ($\text{NH}_3$) y dióxido de carbono ($\text{CO}_2$).
* En lugar de una curva suave de Planck, el espectro presenta valles profundos de absorción y ventanas estrechas de escape fotónico.

### 6.2. Bandas Diagnósticas Clave en SPHEREx

```
Longitud de onda (µm):
0.75 ────── 1.4 ────── 1.9 ────── 2.2 ────── 3.3 ────── 4.26 ────── 4.6 ────── 5.0
Detectores: [--- D1 ---] [--- D2 ---] [--- D3 ---] [--- D4 ---] [--- D5 ---] [--- D6 ---]
Líneas:      H₂O (1.4)  H₂O (1.9)  CH₄ (2.2)  CH₄ (3.3)  CO₂ (4.26)  CO (4.6)
                                              ▲ VALLE    ▲ VENTANA DE EMISIÓN (4-5 µm)
```

1. **Vapor de Agua ($\text{H}_2\text{O}$):** Absorciones prominentes en **$1.4\,\mu\text{m}$** (límite D1/D2) y **$1.9\,\mu\text{m}$** (D3).
2. **Metano ($\text{CH}_4$):**
   * Bandas en $1.66\,\mu\text{m}$ y $2.2\,\mu\text{m}$.
   * **Banda fundamental en $3.3\,\mu\text{m}$ (Detector 4):** Provoca un hundimiento casi total del continuo. Esta es la huella digital indiscutible de las enanas frías tipo T e Y.
3. **Pico Térmico a $4\text{--}5\,\mu\text{m}$ (Detectores D5 y D6):**
   * Debido a la opacidad del metano en $3.3\,\mu\text{m}$ y del agua en bandas más cortas, la energía térmica de una enana Y como WISE 0855 ($250\,\text{K}$) escapa casi exclusivamente a través de la ventana de $4\text{ a }5\,\mu\text{m}$.
   * El cociente de flujo entre el detector D6 y el detector D2 medido en Sparks (`results.json`, `fields.wise0855.cold`) es:
     $$\frac{F_{\text{D6}} (4.5\text{--}5.0\,\mu\text{m})}{F_{\text{D2}} (1.1\text{--}1.6\,\mu\text{m})} \ge 10.88$$
     Este valor de **10.88 es un límite inferior** (`ratio_kind: lower_limit`), debido a que en D2 WISE 0855 apenas alcanza $S/N \sim 1.0$ con un flujo apilado de apenas $0.007\,\text{mJy}$, mientras que en bandas largas D5/D6 emite $0.31\,\text{mJy}$ ($S/N > 10$). Para una estrella ordinaria de la secuencia principal (e.g. tipo solar o M temprano), este cociente es $\lesssim 1$.

### 6.3. El Filtro Óptico "Gaia-Blind"
* Las enanas marrones más frías son tan débiles en el rango óptico que están muy por debajo del límite de detección de Gaia DR3 ($G \approx 20.7$).
* Regla de decisión científica: Si una fuente tiene un dipolo de movimiento confirmado en SPHEREx, emite intensamente en D5 y D6, y **no tiene detección en Gaia DR3**, la probabilidad de que se trate de una enana marrón fría del vecindario solar es máxima.

---

## 7. Validación del Detector: Regla Física vs. Machine Learning

La metodología de validación de Sparks se construyó bajo un estricto principio de reproducibilidad y congelación previa:

### 7.1. Definición del Motor
* **Regla física (`pipeline/sparks/candidates.py`):**
  * Busca dipolos en la resta con $S/N \ge 5\sigma$ en al menos 2 detectores (o $S/N \ge 10\sigma$ a $\ge 4\text{ px}$ del borde).
  * Evalúa el balance de lóbulos positivo/negativo.
  * En saturación, identifica lóbulos emparejados en las alas exteriores.
  * Asigna rótulo `variable` si el residuo es monopolar en $\ge 3$ detectores.
* **Spark Detector ML (`pipeline/sparks/ml.py`):**
  * Modelo LightGBM (300 árboles, 15 hojas, balanceo de clases) sobre 21 características morfológicas y espectrales.
  * Entrenado sobre 9 campos de desarrollo con fuentes sintéticas inyectadas con ruido empírico (30% de las inyecciones saturadas).

### 7.2. Resultados en la Prueba Final Ciega (`models/report/final_test.md`)
Sobre una muestra de 9 estrellas veloces de Gaia DR3 ($pm > 100\,\text{mas/año}$, $G < 19$, shift $\ge 0.5\text{ px}$) nunca vistas durante el ajuste:

| Métrica | Regla Física Transparente | Spark Detector (LightGBM) |
|---|---|---|
| **Recuperación de Movers Conocidos** | **8 / 9** ($88.9\%$) | **6 / 9** ($66.7\%$) |
| **Movedores adicionales sin verificar (sobre 541 candidatos)** | **0** ($0.0\%$) | **10** ($1.8\%$) |
| **Explicabilidad** | Total (cada candidato detalla su razón física) | Caja negra (vector de probabilidad) |

### 7.3. Veredicto del Equipo
La regla física superó al modelo de ML tanto en exhaustividad como en pureza estricta (cero movedores adicionales sin verificar). Por tanto:
1. **La aplicación web Sparks clasifica sus candidatos usando la regla física.**
2. **El modelo LightGBM se muestra como una segunda opinión experimental.**

---

## 8. Datos Requeridos para un Clasificador Multiclase y Diagnóstico de Acceso en Vivo

Para trascender la detección binaria (*mover* vs *no-mover*) y construir un clasificador astronómico completo que categorice objetos en familias celestes (asteroides, cometas, enanas marrones, estrellas veloces, estrellas variables y artefactos instrumentales), se requiere una infraestructura de datos específica.

A continuación se detalla qué datos se requieren por familia celeste y el diagnóstico de acceso a las fuentes oficiales:

### 8.1. Datos adicionales requeridos por familia celeste

| Familia celeste | Datos requeridos del catálogo o telescopio | Función en el clasificador |
|---|---|---|
| **Asteroides y Cometas** | • **Efemérides orbitales con sello de tiempo (JD/MJD):** Coordenadas $(\alpha, \delta)$ calculadas en el instante exacto de la exposición de SPHEREx.<br>• **Morfología espacial (FWHM y perfil radial):** Contraste entre perfiles puntuales (asteroides) y fuentes difusas con coma extendida (cometas). | Permite la confirmación cruzada determinista con el Sistema Solar sin depender de hipótesis orbitales a ciegas. |
| **Enanas Marrones Frías (T / Y)** | • **Fotometría en los 6 detectores:** Flujos calibrados en las 102 bandas ($0.75\text{--}5.0\,\mu\text{m}$), evaluando el cociente $F_{\text{D6}} / F_{\text{D2}} \ge 10.88$ y el pozo de absorción de $\text{CH}_4$ a $3.3\,\mu\text{m}$.<br>• **Filtro óptico de descarte ("Gaia-Blind"):** Confirmación de no-detección en catálogos visibles ($G > 20.7$). | Separa enanas marrones ultrafrías de estrellas enanas M veloces que tienen desplazamientos angulares idénticos. |
| **Estrellas de Alto Movimiento Propio (HPM)** | • **Astrometría óptica de alta precisión (Gaia DR3):** Movimiento propio ($\mu_\alpha, \mu_\delta$), paralaje ($\varpi$) y magnitudes $G, G_{\text{BP}}, G_{\text{RP}}$. | Valida que el vector del dipolo medido por Sparks coincide con la física estelar conocida. |
| **Estrellas Variables (Miras, T Tauri)** | • **Series temporales fotométricas (curvas de luz):** Flujo medido en $>5$ fechas distintas a lo largo de las temporadas QR2 y QR3. | Determina el periodo y la amplitud $\Delta m$, certificando que el residuo en la resta proviene de pulsación de brillo y no de traslación espacial. |
| **Artefactos y Ruido Instrumental** | • **Máscaras de píxeles y banderas de calidad de SPHEREx:** Banderas `OVERFLOW`, `NONLINEAR`, `GHOST`, `SATURATED`, `EDGE` y mapas de difracción alrededor de estrellas brillantes. | Evita clasificar falsos dipolos producidos por reflejos ópticos internos o residuos de resta en núcleos saturados. |

### 8.2. Diagnóstico de conectividad y acceso a las fuentes

Evaluación directa de conectividad y latencia hacia las APIs astronómicas oficiales:

| Fuente / API | Protocolo / Endpoint | Estado de Acceso | Diagnóstico técnico y mitigación |
|---|---|---|---|
| **JPL Horizons API** (NASA / JPL-Caltech) | REST JSON (`ssd.jpl.nasa.gov/api/horizons.api`) | DISPONIBLE (HTTP 200) | **Acceso total e inmediato.** Permite generar efemérides precisas para cualquier asteroide o cometa conocido en segundos para la fecha exacta de cualquier imagen de SPHEREx. |
| **Gaia Archive TAP** (ESA / ESAC) | TAP / ADQL (`gea.esac.esa.int/tap-server/tap/sync`) | DISPONIBLE (HTTP 200) | **Acceso total.** Permite consultas remotas en lenguaje ADQL sobre Gaia DR3 para cruzar al vuelo movimientos propios, paralajes y magnitudes ópticas. |
| **IRSA TAP / ObsTAP** (IPAC / Caltech) | TAP / ADQL (`irsa.ipac.caltech.edu/TAP/sync`) | ALTA LATENCIA (15 a 60 s) | **Funcional para lotes, inviable para consultas web en vivo.** Las consultas a CatWISE2020 y metadatos de SPHEREx tardan entre 15 y 60 s. Estrategia: precálculo de tablas estáticas por campo. |
| **SIMBAD / VizieR** (CDS Estrasburgo) | TAP / HTTP (`simbad.cds.unistra.fr`) | BLOQUEO / TIMEOUT DE RED | Los servidores del CDS presentan restricciones de red o latencia inmanejable desde este entorno. Mitigación: consultar directamente el TAP de Gaia en ESA o los espejos de IRSA. |
| **Datos locales en el repositorio** | Archivos locales (`research/planetx/scratch/`, `data-sample/`) | 100% DISPONIBLE | Coberturas, metadatos y listas de imágenes descargadas para los campos objetivo (Barnard, WISE 0855, $\epsilon$ Indi B, RW Aurigae, R Draconis) y 9 estrellas de prueba en `models/report/final_test.md`. |

*Nota de entorno:* El estado de SIMBAD (404/timeout) y los tiempos de respuesta de IRSA (15 a 60 s) corresponden a mediciones locales realizadas desde este entorno a las 12:2x h, reflejando condiciones puntuales de latencia y red en ese instante, y no una propiedad permanente del servicio oficial.

### 8.3. Conclusión de viabilidad para el Hackatón
Para el alcance del hackatón, **sí contamos con la infraestructura de datos necesaria**:
1. El cruce con **Gaia DR3** (vía ESA TAP) resuelve la confirmación de estrellas y el filtro "Gaia-Blind" para enanas marrones.
2. El acceso a **JPL Horizons** resuelve la identificación determinista de asteroides.
3. Los datos precalculados de **SPHEREx** resuelven la extracción de las 102 bandas espectrales.
No es necesario reentrenar una red neuronal compleja desde cero; la arquitectura híbrida (regla física de dipolos + cruces en tiempo real con Gaia y Horizons) entrega la máxima precisión científica sin movedores adicionales sin verificar.

---

## 9. Corrección de Mitos y Verificación de Números para el Pitch

Para blindar la presentación del equipo ante las preguntas técnicas de la astrónoma del jurado:

| Afirmación Errónea / Ingenua | Corrección Científica Verificada |
|---|---|
| *"Descubrimos nuevos cuerpos celestes"* | **No.** Detectamos **candidatos a verificar**. Ningún descubrimiento es válido sin seguimiento temporal y espectroscópico independiente. |
| *"Con SPHEREx vemos moverse a WISE 0855 en video como un asteroide"* | **Falso.** En 1 año se mueve $\sim 1.3\text{ px}$ ($1.27\text{ px}$ medido en Sparks). En un video de cuadros crudos no se aprecia; se revela mediante **coadds estacionales y resta de imágenes (dipolos)**. |
| *"Calculamos la temperatura exacta con la curva de Planck"* | **Incorrecto.** Las enanas marrones no son cuerpos negros; la absorción de $\text{CH}_4$ y $\text{H}_2\text{O}$ deforma el continuo. Usamos un **índice de color infrarrojo** ($F_{\text{D6}} / F_{\text{D2}} \ge 10.88$, límite inferior medido en Sparks). |
| *"Medimos el paralaje de las estrellas cercanas"* | **Imposible con este píxel.** El paralaje estelar es $< 1''$, frente a píxeles de $6.15''$. La paralaje se remueve, no se ajusta. |
| *"Buscamos exoplanetas en movimiento"* | **Físicamente inviable.** La separación angular es de $\sim 0.5''$ para un análogo de Júpiter a $10\,\text{pc}$ y el contraste es de $10^6\text{--}10^9$. |

---

## 10. Bibliografía y Enlaces a Fuentes Primarias

1. **Luhman, K. L. (2014):** *Discovery of a ~250 K Brown Dwarf at 2 pc from the Sun with WISE.* The Astrophysical Journal Letters, 786:L18. [arXiv:1405.7350](https://arxiv.org/abs/1405.7350).
2. **Rustamkulov, Z. et al. (2026):** *SPHEREx Spectroscopy of Ultracool Brown Dwarfs.* [arXiv:2607.00543](https://arxiv.org/abs/2607.00543) [sin verificar: no abierto hoy en texto completo].
3. **Duev, D. A. et al. (2019):** *Real-bogus classification for the Zwicky Transient Facility using deep learning.* MNRAS, 489(3), 3582–3590. [arXiv:1904.05920](https://arxiv.org/abs/1904.05920) [rendimiento >95% tomado de abstract, sin verificar].
4. **Holman, M. J. et al. (2018):** *HelioLinx: A Clean Algorithm for Linking Solar System Observations.* The Astronomical Journal. [arXiv:1806.07920](https://arxiv.org/abs/1806.07920) [sin verificar: citado por referencia de catálogo].
5. **Backyard Worlds: Planet 9:** Proyecto de Ciencia Ciudadana de la NASA / Zooniverse. [backyardworlds.org](https://backyardworlds.org/).
6. **IRSA / IPAC SPHEREx Mission Archive & Tutorials:** [irsa.ipac.caltech.edu/Missions/spherex.html](https://irsa.ipac.caltech.edu/Missions/spherex.html).
7. **Gaia Collaboration (2022):** *Gaia Data Release 3: Summary of the content and survey properties.* [archive.stsci.edu/missions-and-data/gaia](https://archive.stsci.edu/missions-and-data/gaia).
