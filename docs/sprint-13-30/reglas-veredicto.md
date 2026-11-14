# Reglas de Veredicto Físico · Sparks

> **Sprint 13:30 a 14:30** · Asignación de Horacio · Rama: `Horacio`  
> **Entregables:** `docs/sprint-13-30/reglas-veredicto.md`, `docs/sprint-13-30/verdad-terreno.csv`, `docs/sprint-13-30/gaia-fotometria.csv` y `prototipo/veredicto.py`.

---

## 0. Qué cambió en esta corrección

1. **Se eliminó la lógica por nombre.** La versión anterior reconocía a Van Maanen con `nombre_campo == "vanmaanen"`. Ahora la decisión sale de fotometría y astrometría de Gaia DR3: `source_id`, `G`, `BP-RP` y paralaje.
2. **Se consultó Gaia DR3 por TAP** (`gaiadr3.gaia_source`) para cada objeto. La tabla resultante está en `gaia-fotometria.csv`. No se usan enlaces genéricos de archivo: cada fila con contraparte lleva su `source_id`, y las que no la tienen se marcan como tales y se respaldan con un artículo.
3. **Se corrigieron cuatro identificadores equivocados** de la versión anterior:

   | Objeto | `source_id` anterior | `source_id` verificado |
   |---|---|---|
   | Barnard's Star | 4472832130942585856 | **4472832130942575872** |
   | Kapteyn's Star | 4758925345759714432 | **4810594479418041856** |
   | Lacaille 9352 (`t452800`) | 6553614215268105472 | **6553614253923452800** |
   | Gliese 1 (`t744064`) | 2306962213267266688 | **2306965202564744064** |

   Los dos últimos eran especialmente graves: apuntaban a fuentes débiles de fondo, no a las estrellas del split de prueba.
4. **La verdad de terreno tiene 36 objetos** (antes 37, con un duplicado). Se eliminó `LP 145-141` porque es el mismo objeto que `Gliese 440`.
5. **Se agregó la columna `aislado`** para marcar compañeros que no se separarán a la escala de SPHEREx (6.15″/píxel) y priorizar objetos aislados.
6. **Se documenta la regla del split y la semilla.** La regla es determinista y no usó semilla; se explica en la sección 6.
7. **Resultado honesto:** 10/10 en el split de desarrollo, con la advertencia de que las reglas se ajustaron sobre esos mismos 10 objetos. Control externo de enanas blancas: 3/4; Procyon B falla porque no tiene fotometría Gaia verificable.

---

## 1. Tabla de decisión (jerarquía de dos pasos)

| Paso | Condición física | Clase | Umbral y justificación | Razón reportada |
|---|---|---|---|---|
| **1** | Residuo sin dipolo: cambia de flujo, no de posición | `variable` | Flujo residual neto $\int \Delta I \ne 0$ con centroide estático ($< 0.05$ px). Casos: RW Aur (T Tauri), R Dra (Mira). | "residuo sin dipolo: cambia de brillo, no de posición" |
| **2a** | Movimiento + absorción profunda de metano | `enana marron` | $\mathrm{CH}_4 \ge 0.5$ en la banda de $3.3\,\mu\mathrm{m}$ (D4). Diagnóstica de atmósferas frías ($T \lesssim 1400$ K). Se evalúa antes que Gaia. | "se mueve y presenta absorción profunda de metano (CH₄ = …)" |
| **2b** | Movimiento + exceso infrarrojo extremo + ausente en Gaia | `enana marron` | $F_{D6}/F_{D2} \ge 10.0$ y sin contraparte Gaia. Límite inferior medido en WISE 0855: 10.88. | "se mueve, ausente en Gaia y cociente D6/D2 ≥ 10" |
| **2c** | Movimiento + contraparte Gaia + color y luminosidad de enana blanca | `enana blanca` | $M_G = G + 5 + 5\log_{10}(\varpi/1000) \ge 10.0$ **y** $G_{BP}-G_{RP} \le 0.8$. Ambos criterios son necesarios. | "Gaia DR3 …: M_G = … ≥ 10.0 y BP-RP = … ≤ 0.8" |
| **2d** | Movimiento + contraparte Gaia sin firma de enana blanca | `estrella` | Gaia DR3 con paralaje y movimiento propio estelar; sin metano. Si falta fotometría/paralaje en la tabla, se reporta `estrella` con razón explícita; no se inventa $M_G$. | "Gaia DR3 …: M_G = …, BP-RP = …; no cumple el criterio de enana blanca" |
| **3** | Salto intra-temporada muy rápido + efemérides JPL Horizons | `asteroide` | Decenas de píxeles en horas, concordante con la eclíptica y con un objeto del Sistema Solar. | "movimiento rápido dentro de la temporada coincidente con el Sistema Solar" |
| **Defecto** | Movimiento sin contraparte ni firma concluyente | `sin clasificar` | No cumple metano, cociente frío ni entrada en catálogos. | "candidato a mover sin contraparte ni firma fría concluyente" |

---

## 2. La regla de enana blanca (corrección principal)

### 2.1 Fórmula

Para cada objeto con contraparte Gaia DR3 se calcula la magnitud absoluta en banda G:

$$M_G = G + 5 + 5\log_{10}\left(\frac{\varpi}{1000}\right)$$

donde $\varpi$ es la paralaje en milisegundos de arco. Se clasifica como `enana blanca` si y solo si:

$$M_G \ge 10.0 \quad \text{y} \quad G_{BP}-G_{RP} \le 0.8$$

La segunda condición es imprescindible. Sin ella, estrellas rojas de baja luminosidad (como Kapteyn) caerían falsamente en la secuencia de enanas blancas.

### 2.2 Por qué funciona

Una enana blanca es un remanente estelar con radio terrestre: es muy poco luminosa para su color azul. En Gaia se separa de la secuencia principal porque, a igual color, está varias magnitudes por debajo. El corte $M_G \ge 10$ la pone del lado de los remanentes; el corte $BP-RP \le 0.8$ exige que el color sea azul/blanco, no rojo.

### 2.3 Ejemplo real: Van Maanen's Star

Consulta TAP: `source_id = 2552928187080872832`.

| Cantidad | Valor Gaia DR3 |
|---|---|
| $G$ | 12.299 |
| $BP-RP$ | 0.598 |
| $\varpi$ | 231.78 mas |
| $M_G$ | **14.12** |
| Veredicto | `enana blanca` porque 14.12 ≥ 10.0 y 0.598 ≤ 0.8 |

### 2.4 Contraejemplo real: Kapteyn's Star

| Cantidad | Valor Gaia DR3 |
|---|---|
| $G$ | 8.064 |
| $BP-RP$ | 2.027 |
| $\varpi$ | 254.20 mas |
| $M_G$ | **10.09** |
| Veredicto | `estrella`: $M_G$ supera 10, pero el color rojo (2.027 > 0.8) descarta la enana blanca |

Este caso muestra por qué no alcanza con el corte de $M_G$.

### 2.5 Enanas blancas del catálogo

| Objeto | `source_id` | $G$ | $BP-RP$ | $\varpi$ (mas) | $M_G$ | Resultado |
|---|---|---|---|---|---|---|
| Van Maanen's Star | 2552928187080872832 | 12.299 | 0.598 | 231.78 | 14.12 | `enana blanca` |
| Sirius B | 2947050466531873024 | 8.524 | −0.278 | 374.49 | 11.39 | `enana blanca` |
| Stein 2051 B | 470826482637310848 | 12.336 | 0.442 | 181.27 | 13.63 | `enana blanca` |
| Gliese 440 (= LP 145-141) | 5332606522595645952 | 11.423 | 0.286 | 215.68 | 13.09 | `enana blanca` |
| Procyon B | — | — | — | — | — | sin fotometría Gaia verificable |

Sirius B tiene `ruwe = 2.42` por la contaminación de Sirius A; se reporta la limitación en la tabla. Procyon B no figura en Gaia DR3 en la región consultada (Procyon A satura el campo); por eso **no se calcula $M_G$** y el prototipo lo reporta como `estrella` con una razón explícita. Es una limitación conocida, no un acierto.

### 2.6 Si falta la fotometría de Gaia

Si un objeto tiene `in_gaia = true` pero la tabla no trae `G`, `BP-RP` o paralaje, el prototipo devuelve:

> `estrella`: "se mueve y tiene contraparte en Gaia, pero la tabla no trae fotometría/paralaje verificable; no se puede calcular M_G"

No se inventa el veredicto ni se usa el nombre del objeto como atajo.

---

## 3. Enanas marrones

### 3.1 El metano manda

La absorción de metano a $3.3\,\mu\mathrm{m}$ ($\mathrm{CH}_4 \ge 0.5$) es una firma molecular de atmósferas frías. Se evalúa **antes** del cruce con Gaia, porque una enana T puede estar ligada a una estrella y aun así ser enana marrón.

### 3.2 WISE 0855−0714

- $\mathrm{CH}_4 = 1.03$.
- $F_{D6}/F_{D2} = 10.88$ (límite inferior reportado).
- Sin contraparte Gaia DR3 ($G > 20.7$).
- Veredicto: `enana marron` por metano; la rama 2b también se cumpliría.

### 3.3 Epsilon Indi B

- Binaria T1+T6, compañera ancha de ε Indi A (unos 6.7′).
- $\mathrm{CH}_4 = 0.81$, $F_{D6}/F_{D2} = 1.73$.
- Gaia DR3 resuelve a ε Indi A (`6412595290592307840`, $G=4.32$, $\varpi=274.84$ mas), pero no a la enana T.
- Veredicto: `enana marron` por metano, no por el cociente frío. Exigir "ausente en Gaia" habría fallado aquí.

### 3.4 Luhman 16 y Gliese 229 B

- **Luhman 16:** binaria L7.5+T0.5. Gaia DR3 detecta la componente A (`5353626573555863424`, $G=16.92$, $BP-RP=6.10$) pero con paralaje y movimiento propio nulos; no se puede calcular $M_G$. Clase establecida por Luhman (2013), no por el prototipo.
- **Gliese 229 B:** compañera T7 a ~1″ de Gl 229 A; no resuelta en Gaia. Clase establecida por Nakajima et al. (1995).

Ninguno de los dos está en `results.json`, así que no se evalúan con la regla; están en el catálogo como verdad de terreno para futuras pruebas.

### 3.5 Enanas marrones WISE del catálogo

WISEP J1541−2250, WISE 1506+7027, WISE J0350−5658 y WISE 0359−5401 no tienen contraparte Gaia DR3 verificada ni features de SPHEREx en `results.json`. Su clase viene de los artículos de descubrimiento; no se evalúan con la regla.

---

## 4. Reglas de honestidad

- **No se inventan movimientos propios.** La columna `mu_total_arcsec_yr` se calcula como $\sqrt{\mu_\alpha^2+\mu_\delta^2}/1000$ a partir de `pmra` y `pmdec` de Gaia DR3. Si no hay Gaia, dice `sin verificar`.
- **No se inventan coordenadas.** Para los 28 objetos con Gaia se usan `ra`/`dec` de Gaia DR3 (época 2016.0). Para los demás se usa Sesame/SIMBAD (J2000) o la coordenada de literatura, y la columna `epoca_coords` lo indica.
- **No se reconocen objetos por nombre.** El nombre solo sirve para unir la tabla con `results.json`; la decisión física usa `source_id`, `G`, `BP-RP`, paralaje y las features de SPHEREx.
- **Lo no verificado se marca.** IRSA/CatWISE no respondió desde este entorno; por eso las coordenadas y los movimientos propios de los objetos WISE quedan como `sin verificar`.

---

## 5. Verdad de terreno

### 5.1 Composición

`verdad-terreno.csv` tiene **36 objetos**:

| Clase | Cantidad |
|---|---|
| `estrella` | 17 |
| `enana marron` | 8 |
| `enana blanca` | 5 |
| `variable` | 6 |

De los 36, **28 tienen `source_id` de Gaia DR3** y **26 tienen $M_G$ calculable**. Los 8 sin contraparte Gaia son: ε Indi B, Gl 229 B, Procyon B, WISE 0855−0714, WISEP J1541−2250, WISE 1506+7027, WISE J0350−5658 y WISE 0359−5401.

### 5.2 Columnas

| Columna | Contenido |
|---|---|
| `id_campo` | Identificador estable usado por el prototipo; coincide con `data-sample/results.json` cuando el objeto está ahí |
| `nombre` | Nombre del objeto |
| `ra_deg`, `dec_deg` | Coordenadas; la época se indica en `epoca_coords` |
| `clase` | `estrella`, `enana blanca`, `enana marron` o `variable` |
| `mu_total_arcsec_yr` | Movimiento propio total desde Gaia, o `sin verificar` |
| `fuente_clase` | SIMBAD (con el `otype`) o artículo de descubrimiento |
| `enlace_fuente` | Enlace directo a SIMBAD, arXiv o DOI |
| `gaia_source_id` | `source_id` de Gaia DR3 (vacío si no hay contraparte) |
| `en_gaia` | `si` / `no` |
| `aislado` | `si` / `no` (ver 5.3) |
| `split` | `desarrollo` o `prueba` (ver 6) |
| `verificacion` | Qué se verificó y qué quedó pendiente |

### 5.3 La columna `aislado`

`aislado = no` para objetos que son compañeros y que no se separarán a la escala de SPHEREx (6.15″/píxel), o que tienen una fuente vecina comparable dentro de ~12″:

- **Sirius B:** compañera de Sirius A; el contraste la hace inseparable aunque la separación sea ~11″.
- **Procyon B:** compañera de Procyon A a pocos segundos de arco.
- **Stein 2051 B:** compañera de Stein 2051 A a ~10″.
- **Gliese 229 B:** compañera de Gl 229 A a ~1″.
- **Luhman 16:** binaria L7.5+T0.5 con separación sub-arcosegundo.
- **Gliese 725 A:** dos fuentes Gaia a 12″ con el mismo paralaje; la componente no está confirmada.

ε Indi B es `aislado = si` porque está a ~6.7′ de ε Indi A, muy por encima de un píxel de SPHEREx. 61 Cyg A es `aislado = si` porque 61 Cyg B está a ~30″ (~5 píxeles), aunque se anota la contaminación.

### 5.4 Duplicado eliminado

`LP 145-141` y `Gliese 440` son el mismo objeto (WD 1145−645). Se conservó una sola fila, `Gliese 440 (LP 145-141)`, con el `source_id` 5332606522595645952. Así el catálogo no infla el conteo con un duplicado.

### 5.5 Fuentes por objeto

- Estrellas y enanas blancas: SIMBAD, con el `otype` (`PM*`, `BY*`, `LM*`, `Pe*`, `WD*`) y enlace `simbad.cds.unistra.fr/simbad/sim-id?Ident=…`.
- Enanas marrones: artículo de descubrimiento o caracterización (arXiv/DOI), por ejemplo Luhman & Esplin 2014 para WISE 0855, McCaughrean et al. 2004 para ε Indi B, Luhman 2013 para Luhman 16, Nakajima et al. 1995 para Gl 229 B, Kirkpatrick et al. 2011/2012 para los WISE.
- Campos sin nombre común (`t503424`, `t605760`): enlace directo a la fuente de Gaia DR3, no a la página genérica del archivo.

---

## 6. Split `desarrollo` / `prueba`

### 6.1 Regla exacta

El split es determinista y se define por el identificador de `data-sample/index.json`:

- **`prueba` (3 objetos):** los campos cuyo `id` empieza con la letra `t`:
  - `t452800` = Lacaille 9352
  - `t744064` = Gliese 1
  - `t605760` = Gaia DR3 3713594960831605760
- **`desarrollo` (33 objetos):** todos los demás del catálogo, incluidos los 10 campos con features de SPHEREx en `results.json`:
  `barnard`, `teegarden`, `wolf359`, `kapteyn`, `t503424`, `vanmaanen`, `wise0855`, `epsindib`, `rwaur`, `rdra`.

### 6.2 Semilla

**No se usó semilla.** El split no se generó con un sorteo aleatorio: los tres objetos de prueba ya estaban separados antes de ajustar la regla y se congelaron. La regla del prefijo `t` es la forma reproducible de describir esa separación. Si en el futuro se quiere un split aleatorio para una validación nueva, hay que declarar la semilla antes de mirar los resultados y no reutilizar estos tres objetos.

### 6.3 Garantía

Los tres objetos de `prueba` **no se evalúan** en `prototipo/veredicto.py` y sus etiquetas y features no se usaron para elegir los umbrales ($\mathrm{CH}_4 \ge 0.5$, cociente $\ge 10$, $M_G \ge 10$, $BP-RP \le 0.8$).

La corrección de los `source_id` de `t452800` y `t744064` en la tabla Gaia es una corrección de datos, no de regla: sus veredictos no se calcularon ni se usaron para ajustar nada. Se corrigieron porque los identificadores anteriores apuntaban a fuentes de fondo equivocadas.

---

## 7. Resultados

### 7.1 Split de desarrollo

Evaluación de `prototipo/veredicto.py` sobre los 10 objetos de desarrollo con features en `results.json`:

| Campo | Verdad | Veredicto | Razón |
|---|---|---|---|
| `barnard` | estrella | estrella | Gaia: $M_G=11.88$, $BP-RP=2.83$ |
| `teegarden` | estrella | estrella | Gaia: $M_G=14.35$, $BP-RP=4.53$ |
| `wolf359` | estrella | estrella | Gaia: $M_G=14.13$, $BP-RP=4.18$ |
| `kapteyn` | estrella | estrella | Gaia: $M_G=10.09$, $BP-RP=2.03$ |
| `t503424` | estrella | estrella | Gaia: $M_G=15.45$, $BP-RP=5.21$ |
| `vanmaanen` | enana blanca | enana blanca | Gaia: $M_G=14.12$, $BP-RP=0.60$ |
| `wise0855` | enana marron | enana marron | $\mathrm{CH}_4=1.03$ |
| `epsindib` | enana marron | enana marron | $\mathrm{CH}_4=0.81$ |
| `rwaur` | variable | variable | residuo sin dipolo |
| `rdra` | variable | variable | residuo sin dipolo |

**Acierto: 10/10 (100 %).**

**Advertencia honesta:** las reglas se ajustaron sobre este mismo conjunto (n=10) y solo hay una enana blanca en desarrollo (Van Maanen). El 10/10 no es una validación independiente; es una prueba de consistencia.

### 7.2 Control externo de enanas blancas

Para no depender solo de Van Maanen, se aplicó la misma regla a cuatro enanas blancas del catálogo que no están entre los 10 campos evaluados de `results.json` (aunque figuran como `desarrollo`):

| Objeto | Verdad | Veredicto | Razón |
|---|---|---|---|
| Sirius B | enana blanca | enana blanca | $M_G=11.39$, $BP-RP=-0.28$ |
| Stein 2051 B | enana blanca | enana blanca | $M_G=13.63$, $BP-RP=0.44$ |
| Gliese 440 | enana blanca | enana blanca | $M_G=13.09$, $BP-RP=0.29$ |
| Procyon B | enana blanca | estrella | sin fotometría Gaia verificable |

**Control externo: 3/4.** Procyon B falla porque Gaia DR3 no ofrece fotometría/paralaje utilizable en esa región. La regla prefiere decir `estrella` con una razón explícita antes que inventar una enana blanca. Es la limitación conocida de este sprint.

### 7.3 Qué prueba y qué no prueba

- **Prueba:** la regla ya no depende del nombre; usa fotometría Gaia real y reproduce los 10 casos de desarrollo.
- **Prueba:** la regla distingue Van Maanen (enana blanca) de Kapteyn (estrella roja) usando el mismo corte físico.
- **No prueba:** que la regla generalice a todo el cielo. El conjunto es pequeño, las features de SPHEREx solo existen para 10 objetos y la clase `asteroide` no tiene ningún caso en los datos actuales.

---

## 8. Clase asteroide y JPL Horizons

- La API de JPL Horizons responde (HTTP 200) y permite generar efemérides en segundos.
- En los 13 campos precalculados de `data-sample` no hay ningún asteroide conocido cruzando los parches de 4′ durante las exposiciones.
- La clase `asteroide` se mantiene definida en la tabla (salto rápido intra-temporada + JPL Horizons), pero **no se evalúa** en este sprint.

---

## 9. Reproducibilidad

### 9.1 Consulta Gaia usada para la tabla

Para los objetos con `source_id` conocido:

```sql
SELECT source_id, ra, dec, phot_g_mean_mag, bp_rp, parallax,
       pmra, pmdec, ruwe
FROM gaiadr3.gaia_source
WHERE source_id IN (...)
```

Para los objetos de alto movimiento propio se usó un cono amplio, porque las coordenadas J2000 y la época de Gaia (2016.0) pueden diferir hasta ~166″ (caso Barnard):

```sql
SELECT TOP 25 source_id, ra, dec, phot_g_mean_mag, bp_rp, parallax,
       parallax_over_error, pmra, pmdec, ruwe
FROM gaiadr3.gaia_source
WHERE 1 = CONTAINS(POINT('ICRS', ra, dec),
                   CIRCLE('ICRS', <ra_j2000>, <dec_j2000>, 0.12))
  AND phot_g_mean_mag < 17.5
  AND parallax > 20
ORDER BY parallax DESC
```

Los candidatos se validaron por paralaje, movimiento propio y color. Esa validación es la que detectó los cuatro `source_id` equivocados de la versión anterior.

### 9.2 Cómo correr el prototipo

Desde la raíz del repo:

```bash
python prototipo/veredicto.py
```

El script lee `data-sample/results.json` y `docs/sprint-13-30/gaia-fotometria.csv`. No necesita red.

### 9.3 Archivos

| Archivo | Contenido |
|---|---|
| `docs/sprint-13-30/verdad-terreno.csv` | 36 objetos, clase, coordenadas, fuente, `source_id`, `aislado`, split y verificación |
| `docs/sprint-13-30/gaia-fotometria.csv` | Fotometría y astrometría Gaia DR3 usada por la regla ($G$, $BP-RP$, paralaje, PM, `ruwe`, $M_G$) |
| `docs/sprint-13-30/reglas-veredicto.md` | Este documento |
| `prototipo/veredicto.py` | Prototipo que aplica la regla y evalúa solo desarrollo |

---

## 10. Pendientes conocidos

1. **Procyon B:** no tiene fotometría Gaia DR3 verificable en este entorno. Si se consigue un `source_id` o fotometría de otra fuente, se puede completar el control externo.
2. **WISE:** IRSA/CatWISE no respondió desde este entorno. Las coordenadas y los movimientos propios de los objetos WISE quedan como `sin verificar`; la clase sí está respaldada por los artículos.
3. **SIMBAD TAP:** el servicio TAP devolvió HTTP 404; las coordenadas y los `otype` se obtuvieron por Sesame. Los enlaces de SIMBAD del CSV son para verificación humana.
4. **Tamaño del conjunto:** solo hay 10 objetos con features de SPHEREx y una enana blanca en desarrollo. Para una validación real hacen falta más objetos y un split aleatorio declarado antes de mirar los resultados.
5. **Asteroide:** la clase está definida pero no tiene casos evaluables en `data-sample`.
