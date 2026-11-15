# Revision cientifica del clasificador de ML (`ml-clasificador/`)

Revision del paquete `ml-clasificador/` (rama `joako`, commit `5a8e8f0`: `README.md`, `entrenar.py` y `resultados.json`), que entrena un `RandomForestClassifier` (`n_estimators=200`, `max_depth=4`, `min_samples_leaf=1`, `class_weight="balanced"`, `random_state=42`) sobre los 36 objetos de `docs/sprint-13-30/verdad-terreno.csv` y `docs/sprint-13-30/gaia-fotometria.csv` en cuatro clases (`estrella`, `enana marron`, `enana blanca`, `variable`) con seis variables de entrada (`en_gaia`, `log10_paralaje`, `mg_gaia`, `bp_rp`, `g_mag`, `log10_mu`).

---

## 1. Fugas de informacion y sesgos de seleccion detectados

### 1.1 `log10_mu` (importancia `0.1666`, tercera variable del bosque)
- **Fuga de catalogo y sesgo de muestra:** en `entrenar.py` (linea 41), `mu` se lee de la columna `mu_total_arcsec_yr` de `verdad-terreno.csv`, es decir, **del catalogo de verdad de terreno (Gaia DR3 / literatura)** y no del movimiento propio medido por la canalizacion SPHEREx.
- **Correlacion artificial por como se construyo la tabla:** en los 36 objetos, las 6 variables (`rwaur`, `rdra`, `mira`, `chicyg`, `sscyg`, `uori`) son estrellas distantes seleccionadas como controles de variabilidad con $\mu \in [0.014, 0.117]\text{ arcsec/a}$ (`log10_mu < -0.9`), mientras que las 17 estrellas y 4 enanas blancas con Gaia fueron elegidas especificamente por ser *high proper motion stars* cercanas con $\mu \in [0.668, 10.393]\text{ arcsec/a}$ (`log10_mu > -0.18`).
- **Consecuencia fisica:** un arbol que corta en `log10_mu < -0.5` separa el 100 % de las variables con Gaia de las estrellas y enanas blancas de la tabla **sin mirar ni una sola curva de luz ni una imagen de diferencia**. En el cielo real, la mayoria de las estrellas normales de campo tienen $\mu < 0.1\text{ arcsec/a}$; al aplicar `modelo.json` a un campo cualquiera, el bosque etiquetara estrellas estaticas de campo como `variable` por tener movimiento propio pequeno.

### 1.2 `log10_paralaje` (`0.2197`, segunda variable) y `g_mag` (`0.1386`)
- **Mismo sesgo de distancia:** todas las estrellas y enanas blancas con Gaia en la tabla estan a $d < 18\text{ pc}$ ($\varpi \in [58.1, 547.0]\text{ mas}$, `log10_paralaje > 1.76`), mientras que las variables con paralaje en Gaia estan a $d > 110\text{ pc}$ ($\varpi \in [1.25, 8.85]\text{ mas}$, `log10_paralaje < 0.95`).
- El bosque aprende **"cercano = estrella/enana blanca, lejano = variable"**, que es un artefacto del muestreo de los 36 objetos y no una propiedad astrofisica de las estrellas variables (por ejemplo, una fulgurante M cercana como UV Ceti o Wolf 359 tiene paralaje grande, y una estrella constante a 200 pc tiene paralaje pequeno).
- Ademas, `g_mag` es magnitud aparente: depende de la distancia y duplica la combinacion de `mg_gaia` y `log10_paralaje`.

### 1.3 `en_gaia` (`0.0607`) y el centinela `FALTA = -999.0`
- En `entrenar.py` (lineas 25 y 42-48), cualquier dato faltante se codifica como `-999.0`.
- De las 8 enanas marrones, **7 no tienen paralaje ni fotometria en Gaia** (todas quedan en `[-999, -999, -999, -999]` en paralaje, $M_G$, $BP-RP$ y $G$). Por tanto, el bosque aprende la regla **"si faltan datos de Gaia (`<= -500`), predice `enana marron`"**.
- Eso explica exactamente los **tres unicos fallos de LOO** reportados en `resultados.json`:
  1. **Mira** (`variable`): fuente muy brillante ($G = 3.57$) saturada en Gaia DR3 sin paralaje ni PM (`log10_paralaje = -999`, `mg_gaia = -999`, `log10_mu = -999`). Como sus variables valen `-999`, cae en la rama de datos faltantes y el bosque la clasifica como **`enana marron`**.
  2. **Procyon B** (`enana blanca`): companera a ~5" de Procyon A sin entrada en Gaia DR3 (`en_gaia = 0`, todo en `-999`). El bosque la clasifica como **`enana marron`**.
  3. **Luhman 16** (`enana marron`): es la unica enana marron con `en_gaia = 1` ($G = 16.92$, $BP-RP = 6.10$), pero sin paralaje ni PM en Gaia DR3 (`-999`). Como tiene $BP-RP = 6.10$ muy rojo (similar a Mira $5.59$, Chi Cyg $7.38$, U Ori $5.97$) y `log10_mu = -999`, el bosque la clasifica como **`variable`**.

---

## 2. Etiquetas y afirmaciones que deben matizarse

1. **Objeto mal etiquetado en la verdad de terreno (`t605760` = Wolf 489, `enana blanca` DZ10 etiquetada como `estrella`):**
   - En `docs/sprint-13-30/verdad-terreno.csv`, el objeto `t605760` (`Gaia DR3 3713594960831605760`, en el split `prueba`) fue etiquetado originalmente como `estrella` con la nota *"Sin nombre comun. Clase inferida de Gaia: M_G=14.77, BP-RP=1.15 (K/M). Congelado."* porque la regla simple del prototipo corta en $BP-RP \le 0.80$.
   - Al cruzar sus coordenadas y su `source_id` (`Gaia DR3 3713594960831605760`) en SIMBAD, este objeto es **Wolf 489** (`WD 1334+039`), una **enana blanca fria de atmosfera de helio de tipo espectral DZ10** (`otype = WD*`, $T_{\text{eff}} \approx 5030\text{ K}$, Giammichele et al. 2012, Holberg et al. 2016).
   - En el diagrama HR de Gaia ($M_G = 14.77$, $BP-RP = 1.15$), Wolf 489 esta 6 magnitudes por debajo de la secuencia principal (una enana K/M con $BP-RP = 1.15$ tendria $M_G \approx 6.5$, mientras que una enana M con $M_G = 14.77$ tendria $BP-RP > 3.8$). Tanto `regla_gaia` ($BP-RP \le 0.8$) como el `RandomForest` entrenado solo con las 4 enanas blancas calientes/templadas originales ($BP-RP \in [-0.28, +0.60]$) la clasifican erroneamente como `estrella`. Hemos mantenido la fila `t605760` congelada por trazabilidad del split `prueba`, pero en la ampliacion a 69 objetos anadimos 6 enanas blancas adicionales que cubren desde DA calientes hasta DC/DQ frias (`WD 0009+501`, `Stein 2051 B`, `Gliese 223.2` DZ9 con $BP-RP = 1.00$, etc.).
2. **Evaluacion en el `split_congelado_horacio` (`3 de 3`):**
   - Los 3 objetos del conjunto `prueba` (`t452800` Lacaille 9352, `t744064` Gliese 1, `t605760` Wolf 489) tenian etiqueta nominal `estrella` (y, corrigiendo `t605760` a `enana blanca`, el modelo realmente acierta **2 de 3** en `prueba`, fallando en `t605760`). Ademas, no hay ninguna enana marron ni variable en `prueba`. Decir "3 de 3 en el split de prueba" no valida las cuatro clases y oculta el falso negativo en la enana blanca fria `t605760`.
3. **Comparacion contra `regla_gaia` (`91.7 % vs 77.8 %`):**
   - En `entrenar.py` (lineas 54-62), `regla_gaia(x)` nunca devuelve `"variable"` (solo devuelve `"enana marron"`, `"enana blanca"` o `"estrella"`), por lo que falla por diseno en las 6 variables (`6/36 = 16.7 %` de penalizacion automatica). El propio `README.md` lo advierte en sus limites; conviene que en cualquier tabla comparativa se aclare que `regla_gaia` es una ablacion de solo 3 clases sin informacion temporal ni infrarroja.
4. **Etiquetas astrofisicas duales en `verdad-terreno.csv`:**
   - **Wolf 359** (`BY*` / `Fl*`, estrella fulgurante UV Ceti), **Barnard's Star** (`BY*`), **61 Cygni A** (`BY*`) y **Epsilon Eridani** (`BY*`) tienen tipos SIMBAD de estrellas con variabilidad rotacional o fulguraciones, pero en el reto estan etiquetadas como `estrella` (movers) frente a las variables de gran amplitud (`Mi*`, `TT*`, `CV*`, `S*`). Esto es coherente con la definicion operativa del reto (fuentes cuyo residuo entre temporadas esta dominado por traslacion vs cambio de flujo), pero debe declararse como definicion cinematica/fotometrica y no como "estrellas constantes".

---

## 3. Mejoras concretas recomendadas y variables de SPHEREx disponibles

### 3.1 Que quitar o restringir en las variables de Gaia
1. **Eliminar `g_mag` y `log10_paralaje` como predictores directos de clase:** la informacion intrinseca de luminosidad ya esta contenida en `mg_gaia` ($M_G = G + 5 + 5\log_{10}(\varpi/1000)$). Usar `log10_paralaje` y `g_mag` por separado solo introduce el sesgo de distancia de la muestra.
2. **No usar `log10_mu` de catalogo para separar variables de estrellas:** si se incluye movimiento propio, debe ser el medido por la canalizacion (`mu_measured / mu_err`, significancia del dipolo) o bien un indicador cinematico de SPHEREx, nunca el PM de Gaia DR3 de una lista preseleccionada de estrellas rapidas.
3. **Separar la ausencia de dato (`missing`) de la no deteccion optica real:** Mira y Procyon B no tienen paralaje en Gaia por saturacion o brillo de una primaria ($G < 4$), mientras que WISE 0855 e $\varepsilon$ Indi B no estan en Gaia porque son ultrafrias en el optico ($T_{\text{eff}} \sim 250\text{--}1300\text{ K}$). Sin variables infrarrojas de SPHEREx esas dos situaciones son indistinguibles en la tabla de Gaia.

### 3.2 Variables de SPHEREx que conviene anadir y para que objetos las tenemos

Las tres variables fisicas medidas sobre SPHEREx que rompen la degeneracion de `en_gaia = 0` y de las variables son:

1. **`cold_ratio` ($F_{\text{D6}} / F_{\text{D2}}$, banda $4.4\text{--}5.0\,\mu\text{m}$ sobre $1.1\text{--}1.6\,\mu\text{m}$):**
   - En estrellas y enanas blancas ($T_{\text{eff}} > 2500\text{ K}$, cola de Rayleigh-Jeans), $F_{\text{D6}}/F_{\text{D2}} < 0.5$.
   - En enanas T/Y ($T_{\text{eff}} < 1400\text{ K}$), $F_{\text{D6}}/F_{\text{D2}} > 1.2$ (y $> 10$ en enanas Y como WISE 0855).
2. **`methane_depth` ($1 - F(3.15\text{--}3.45\,\mu\text{m}) / F(3.90\text{--}4.10\,\mu\text{m})$):**
   - Mide la banda fundamental de $\text{CH}_4$ a $3.3\,\mu\text{m}$ en D4 frente al pseudocontinuo a $4.0\,\mu\text{m}$ en D5.
   - Separa limpiamente las enanas T/Y ($\text{CH}_4 \ge 0.80$) de estrellas, enanas blancas y variables ($\text{CH}_4 \lesssim 0.05$), **incluso cuando la enana marron tiene o no tiene Gaia**.
3. **`snr_dipole_ vs_monopole` (o `mu_snr = mu_measured / mu_err` en SPHEREx):**
   - Separa objetos con traslacion significativa entre temporadas ($\mu/\sigma_\mu \ge 3$) de objetos variables sin desplazamiento astrometrico.

#### Inventario exacto de objetos con variables de SPHEREx medidas en el repositorio

Combinando `data-new/results.json` (nuestra canalizacion `pipeline/sparkspipe` con resta de PSF de estrella vecina en WISE 0855) y `data-sample/results.json`:

| `id_campo` | Nombre | Clase | `F_D6/F_D2` (`data-new`) | `methane_depth` (`data-new`) | `F_D6/F_D2` (`data-sample`) | `methane_depth` (`data-sample`) | $\mu \pm \sigma_\mu$ SPHEREx (`data-new` / `data-sample`) |
|---|---|---|---|---|---|---|---|
| `wise0855` | WISE 0855-0714 | `enana marron` | `>= 10.09` (`lower_limit`) | `1.20 +- 0.10` | `>= 10.88` (`lower_limit`) | `1.03 +- 0.07` | `6.04 +- 0.76` / `7.91 +- 1.35` "/a |
| `epsindib` | $\varepsilon$ Indi B | `enana marron` | `1.31` (`measured`) | `0.80 +- 0.002` | `1.73` (`measured`) | `0.81 +- 0.00` | `4.21 +- 0.28` / `4.54 +- 0.11` "/a |
| `vanmaanen` | Van Maanen's Star | `enana blanca` | - | - | `0.16` (`measured`) | `-0.34 +- 0.02` | - / `2.90 +- 0.15` "/a |
| `t503424` | Gaia DR3 6281432246412503424 | `estrella` | - | - | `0.45` (`measured`) | `-0.37 +- 0.02` | - / `3.46 +- 0.15` "/a |
| `t605760` | Gaia DR3 3713594960831605760 | `estrella` | - | - | `0.21` (`measured`) | `0.04 +- 0.02` | - / `3.82 +- 0.17` "/a |
| `barnard` | Barnard's Star | `estrella` | - | - | saturada en D1-D4 | saturada en D4 | - / `10.23 +- 0.43` "/a |
| `teegarden` | Teegarden's Star | `estrella` | - | - | parcial (D1,D5,D6) | - | - / `5.08 +- 0.20` "/a |
| `wolf359` | Wolf 359 | `estrella` | - | - | parcial (D1,D6) | - | - / `4.57 +- 0.66` "/a |
| `rwaur` | RW Aurigae | `variable` | cota sup. PM | - | `lightcurve` por alas PSF | - | `1.32 +- 0.57` (no det., $<3\sigma$) |
| `rdra` | R Draconis | `variable` | saturada | - | `lightcurve` por alas PSF | - | nulo (nucleo saturado) |

Con la actualizacion del conjunto verificado (`docs/sprint-13-30/verdad-terreno.csv` y `gaia-fotometria.csv`, ampliado de 36 a **69 objetos**: `20 estrellas`, `20 enanas marrones` L/T/Y, `18 variables` de distintos tipos —Mira, T Tauri, RR Lyrae, Cefeidas, UV Ceti, BY Draconis, RV Tauri y cataclismicas— y `11 enanas blancas` DA/DC/DQ/DZ), el clasificador puede reentrenarse eliminando `g_mag` y `log10_paralaje` crudos y evaluando en un split estratificado que incluya las cuatro clases.
