"""Configuracion central de la canalizacion SPHEREx.

Todos los numeros de la malla son los mismos que usa ``data-sample/barnard``
para que el front pueda leer ``data-new/`` sin cambios.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

# --- Malla comun ---------------------------------------------------------
N_PIX = 64
PIXEL_ARCSEC = 6.15
FOV_ARCMIN = N_PIX * PIXEL_ARCSEC / 60.0  # 6.56 arcmin
CUTOUT_SIZE_DEG = 0.12  # 7.2 arcmin: cubre las esquinas de la malla de 64x64
CUTOUT_SIZE_ARCMIN = CUTOUT_SIZE_DEG * 60.0
CUTOUT_PX = 80  # valor de referencia de Barnard; el recorte real lo fija el WCS
CDELT_DEG = PIXEL_ARCSEC / 3600.0
CRPIX = (N_PIX + 1) / 2.0  # 32.5
CTYPE = ("RA---TAN", "DEC--TAN")

# --- Deteccion / calidad -------------------------------------------------
SIGMA_CLIP = 3.0
MAX_CLIP_ITERS = 5
MIN_FRAMES_PER_COADD = 2

# --- Movimiento propio ---------------------------------------------------
# Limite de seguridad: no se acepta un ajuste con menos de dos temporadas.
MIN_SEASONS_FOR_PM = 2
MIN_BASELINE_YR = 0.25
MIN_DETECTIONS_FOR_PSF = 3

# Epoca a la que se lleva la posicion del catalogo para centrar la malla.
# La malla es fija: no se recentra con los datos, para no inyectar el
# movimiento que se quiere medir.
REFERENCE_MJD = 61000.0  # ~2025-12-22, en medio de las observaciones de DR1
MJD_J2000 = 51544.5
MJD_J2016 = 57388.5
# Epoca de la posicion WISE de WISE 0855 en Luhman & Esplin 2014 (Tabla 2).
# Las coordenadas del index coinciden con el designativo J085510.83-071442.5,
# que se definio con la posicion WISE de 2010 y NO con una posicion J2000.
MJD_WISE0855_POSITION = 55320.4
PSF_FWHM_ARCSEC = 7.45  # mediana del encabezado PSF_FWHM de los recortes DR1
APERTURE_RADIUS_PX = 3.0
ANNULUS_RADIUS_PX = (6.0, 10.0)
# Radio de la mascara que quita el nucleo de una estrella de fondo a ~1.2 px.
# Se fija a priori: cubre los dos pixeles mas cercanos al pico de la estrella.
STAR_MASK_RADIUS_PX = 0.7

# --- Descubrimiento ------------------------------------------------------
SIA_URL = "https://irsa.ipac.caltech.edu/SIA"
SIA_RADIUS_DEG = 0.06  # circulo de busqueda; el recorte final es 0.12 deg
SIA_RADII_DEG = (0.06, 0.12)  # segundo intento si el primero vuelve vacio
S3_BUCKET = "https://nasa-irsa-spherex.s3.amazonaws.com"
CUTOUT_BASE = "https://irsa.ipac.caltech.edu/"
TAP_URL = "https://irsa.ipac.caltech.edu/TAP/sync"
RELEASES = [
    {
        "collection": "spherex_dr1",
        "release": "DR1",
        "doi": "10.26131/IRSA678",
        "url": "https://doi.org/10.26131/IRSA678",
    },
    {
        "collection": "spherex_qr3",
        "release": "QR3",
        "doi": "10.26131/IRSA662",
        "url": "https://doi.org/10.26131/IRSA662",
    },
    {
        "collection": "spherex_qr2",
        "release": "QR2",
        "doi": "10.26131/IRSA652",
        "url": "https://doi.org/10.26131/IRSA652",
    },
]

# Bits de bandera. El encabezado FLAGS de cada recorte manda; esto solo es
# el respaldo cuando el encabezado no trae MSKNnnnn.
DEFAULT_FLAG_BITS = {
    "0": "TRANSIENT",
    "1": "OVERFLOW",
    "2": "SUR_ERROR",
    "4": "PHANTOM",
    "5": "REFERENCE",
    "6": "NONFUNC",
    "7": "DICHROIC",
    "9": "MISSING_DATA",
    "10": "HOT",
    "11": "COLD",
    "12": "FULLSAMPLE",
    "14": "PHANMISS",
    "15": "NONLINEAR",
    "17": "PERSIST",
    "19": "OUTLIER",
    "20": "CROSSTALK",
    "21": "SOURCE",
    "22": "GHOST",
    "23": "GHOST_FPA",
    "24": "GHOST_EXT",
    "25": "STREAK",
    "26": "BLOOM",
    "27": "SNOWBALL",
    "28": "HALO",
}

# Temporadas: se agrupan los MJD con un corte de separacion.
# Se usa 35 dias porque es mayor que el hueco normal entre visitas del mismo
# campo (mediana 0) y menor que el hueco estacional real. Con 60 dias R Dra
# cae en una sola temporada (su mayor hueco es 37.8 d) y el movimiento propio
# no se puede medir. Con 35 d los cuatro campos quedan en 3-4 temporadas. El
# corte se fija por cadencia, no por el movimiento propio esperado; la
# sensibilidad a este numero esta en docs/pipeline/metodo.md.
SEASON_GAP_DAYS = 35.0
# Cuadros maximos por (detector, temporada). Se eligen repartidos en el tiempo.
FRAME_CAP_PER_DET_SEASON = 12
# Descargas simultaneas. El servicio de recortes devuelve 503 si se le exige.
MAX_WORKERS = 3
DOWNLOAD_RETRIES = 14
DOWNLOAD_BACKOFF = 1.6
DOWNLOAD_TIMEOUT_S = 240.0


@dataclass(frozen=True)
class Target:
    id: str
    name: str
    ra: float
    dec: float
    kind: str
    mu_expected_arcsec_yr: float | None
    pa_expected_deg: float | None
    source: str
    note: str = ""
    gaia_source_id: str | None = None
    in_gaia: bool = False
    coord_epoch_mjd: float = MJD_J2000
    coord_epoch_label: str = "J2000"
    expected_source: str = ""
    # Advertencias que nacen del analisis de los datos, no del catalogo. Se
    # copian al manifiesto para que quien lea la salida sepa que limitacion
    # tiene esa medicion concreta.
    caveats: tuple[str, ...] = ()
    # Detectores que se descargan completos (sin tope por temporada). Vacio
    # significa que todos usan el tope comun.
    full_detectors: tuple[int, ...] = ()
    # Detectores que entran en el ajuste de movimiento propio. Vacio significa
    # todos los procesados. Para WISE 0855 solo D5 y D6: en D1-D4 domina la
    # estrella de fondo.
    motion_detectors: tuple[int, ...] = ()
    # Detector donde el objetivo no se ve y la estrella de fondo si. Se usa para
    # fijar la posicion de la estrella que luego se resta en el resto de bandas.
    star_detector: int | None = None

    @property
    def coord(self) -> tuple[float, float]:
        return self.ra, self.dec

    def pm_components(self) -> tuple[float | None, float | None]:
        """(pmra*cosdec, pmdec) en arcsec/anio a partir de mu y PA."""
        if self.mu_expected_arcsec_yr is None or self.pa_expected_deg is None:
            return None, None
        import math

        pa = math.radians(self.pa_expected_deg)
        return self.mu_expected_arcsec_yr * math.sin(pa), self.mu_expected_arcsec_yr * math.cos(pa)

    def position_at(self, mjd: float) -> tuple[float, float]:
        """Posicion del catalogo propagada con el PM esperado a ``mjd``.

        Sirve solo para centrar la malla y pedir los recortes. Si no hay PM,
        devuelve la posicion del catalogo sin tocar.
        """
        import math

        pmra, pmdec = self.pm_components()
        if pmra is None or pmdec is None:
            return self.ra, self.dec
        dt = (float(mjd) - float(self.coord_epoch_mjd)) / 365.25
        ra = self.ra + pmra * dt / 3600.0 / math.cos(math.radians(self.dec))
        dec = self.dec + pmdec * dt / 3600.0
        return ra, dec


# Orden exacto del sprint 15:00-17:00.
TARGETS: tuple[Target, ...] = (
    Target(
        id="wise0855",
        name="WISE 0855-0714",
        ra=133.795129,
        dec=-7.245147,
        kind="mover",
        mu_expected_arcsec_yr=8.087789,
        pa_expected_deg=277.357342,
        source=(
            "Coordenadas del index del reto, que coinciden con el designativo "
            "J085510.83-071442.5; Luhman & Esplin 2014 (ApJL 786, L18) publica "
            "esa posicion en la epoca WISE MJD 55320.4. Movimiento propio del "
            "index del reto (valor sin verificar: la fuente primaria da "
            "pmRA*cosdec=-8.06, pmdec=+0.70, mu=8.09, PA=275.0)"
        ),
        note=(
            "Enana marron T, sin contraparte Gaia. A 2.3 pc. Las coordenadas "
            "estan a la epoca WISE de 2010, no a J2000; tratarlas como J2000 "
            "desplazaba la malla ~14 px."
        ),
        in_gaia=False,
        coord_epoch_mjd=MJD_WISE0855_POSITION,
        coord_epoch_label="MJD 55320.4 (epoca WISE, Luhman & Esplin 2014)",
        expected_source=(
            "data-sample/index.json (PM y PA del reto, sin verificar); "
            "posicion y epoca confirmadas en arXiv:1404.6501"
        ),
        caveats=(
            "Una estrella de fondo a ~7 arcsec (1.2 px) al este contamina el "
            "fotocentro. En D1 (0.75-1.1 um) solo se ve la estrella y WISE 0855 "
            "no aparece; por eso el movimiento se mide unicamente en D5 y D6 "
            "enmascarando el nucleo de la estrella (radio 0.7 px fijado desde D1), "
            "y en la fotometria de D1-D4 se ajusta y resta ademas su PSF gaussiana "
            "(sigma 0.61 px). Tras la resta, la banda corta no se detecta a 3 sigma "
            "(-0.006 +- 0.009 mJy; cota superior 3 sigma de 0.028 mJy) y F_D6/F_D2 = "
            "10.09 se reporta como cota inferior. Ver docs/pipeline/metodo.md.",
        ),
        full_detectors=(5, 6),
        motion_detectors=(5, 6),
        star_detector=1,
    ),
    Target(
        id="epsindib",
        name="epsilon Indi B",
        ra=331.0438,
        dec=-56.7828,
        kind="mover",
        mu_expected_arcsec_yr=4.684165,
        pa_expected_deg=121.778186,
        source=(
            "Coordenadas J2000 del index, que coinciden con la posicion 2MASS "
            "de epsilon Indi B (22 04 10.5 -56 46 58, epoca 1999.86) en "
            "McCaughrean et al. 2004 (A&A 413, 1029). Movimiento propio del "
            "index (sin verificar): la fuente primaria da pmRA*cosdec=+3.976, "
            "pmdec=-2.500 arcsec/anio (mu=4.70, PA=122.2), compatible."
        ),
        note=(
            "Par T1+T6 (Ba+Bb) con separacion 0.732 arcsec: no resuelto por "
            "SPHEREx (6.15 arcsec/pixel). epsilon Indi A queda a 402.3 arcsec "
            "(6.70 arcmin), fuera de la malla de 6.56 arcmin."
        ),
        in_gaia=False,
        coord_epoch_mjd=MJD_J2000,
        coord_epoch_label="J2000",
        expected_source=(
            "data-sample/index.json; posicion, binariedad y PM en "
            "arXiv:astro-ph/0309256 (McCaughrean et al. 2004) y "
            "arXiv:astro-ph/0212487 (Scholz et al. 2003)"
        ),
        caveats=(
            "El ajuste combinado mezcla 3 temporadas DR1 y 1 de QR3. Solo con "
            "DR1 (10 puntos, 0.97 anios) sale 4.42 +- 0.43 \"/anio con "
            "PA 109.7 +- 4.3; el ajuste conjunto (16 puntos, 1.39 anios) da "
            "4.21 +- 0.28 y PA 124.9 +- 2.8. Las dos PA difieren 15 grados y la "
            "diferencia se declara. El par T1+T6 no se resuelve: se mide su "
            "fotocentro.",
        ),
    ),
    Target(
        id="rdra",
        name="R Draconis",
        ra=248.1675,
        dec=66.7550,
        kind="variable",
        mu_expected_arcsec_yr=0.021539,
        pa_expected_deg=286.587074,
        source="Coordenadas J2016.0 y PM de Gaia DR3 segun docs/sprint-13-30/verdad-terreno.csv",
        note="Mira, periodo ~246 dias.",
        in_gaia=True,
        gaia_source_id="1648328016354496384",
        coord_epoch_mjd=MJD_J2016,
        coord_epoch_label="J2016.0 (Gaia DR3)",
        expected_source="Gaia DR3 por source_id; clase SIMBAD (Mi*)",
        caveats=(
            "R Dra satura en las seis bandas: las banderas de BLOOM, HALO y "
            "OVERFLOW cubren un disco de ~9 px de radio alrededor del objeto y "
            "la mascara de calidad deja el nucleo sin pixeles. Por eso no hay "
            "detecciones utilizables y no se mide movimiento propio; no se "
            "rellena con el valor de Gaia. Su PM esperado (0.0215 \"/anio) es "
            "0.003 px/anio a 6.15 \"/px, imposible de medir aqui. Ademas, 13 de "
            "los 33 cuadros de la temporada S1 son QR3 y comparten coadd con "
            "DR1; no hay intercepto por release.",
        ),
    ),
    Target(
        id="rwaur",
        name="RW Aurigae",
        ra=76.9564,
        dec=30.4014,
        kind="variable",
        mu_expected_arcsec_yr=0.027525,
        pa_expected_deg=174.494704,
        source="Coordenadas J2016.0 y PM de Gaia DR3 segun docs/sprint-13-30/verdad-terreno.csv",
        note="T Tauri con atenuaciones; no se espera movimiento medible.",
        in_gaia=True,
        gaia_source_id="156430822114424576",
        coord_epoch_mjd=MJD_J2016,
        coord_epoch_label="J2016.0 (Gaia DR3)",
        expected_source="Gaia DR3 por source_id; clase SIMBAD (TT*)",
        caveats=(
            "El valor medido (1.32 \"/anio) NO es una deteccion de movimiento "
            "propio: es ~48 veces el valor de Gaia y su incertidumbre (0.57) es "
            "casi la mitad del valor. El veredicto 'acuerdo dentro de 3 sigma' "
            "sale de dividir por ese error grande, no de una coincidencia; se "
            "reporta como cota superior. Con 6.15 \"/px, 0.0275 \"/anio son "
            "0.004 px/anio. La temporada S2 es QR3 (33 cuadros) y S0/S1 son "
            "DR1; la mezcla de releases no lleva intercepto propio.",
        ),
    ),
)

TARGET_BY_ID = {t.id: t for t in TARGETS}


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def data_new_root() -> Path:
    return repo_root() / "data-new"


def work_root() -> Path:
    # Cache de recortes y productos intermedios, fuera de git.
    return repo_root() / "pipeline" / "_work"


def release_meta(release: str) -> dict | None:
    for rel in RELEASES:
        if rel["release"].upper() == release.upper():
            return rel
    return None
