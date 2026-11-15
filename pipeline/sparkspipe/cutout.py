"""Descarga y extraccion de recortes SPHEREx (MEF de 7 extensiones en DR1).

El servicio de recortes de IRSA devuelve un MEF con PRIMARY, IMAGE, FLAGS,
VARIANCE, ZODI, EPSF y WCS-WAVE. La extension EPSF es el 98 % del peso y no se
usa aqui, asi que se elimina antes de guardar el recorte reducido.

La WCS de IMAGE ya esta centrada en el recorte: el pixel del objeto cae en
(17, 17) para un recorte de 35x35. Los coeficientes SIP incluyen el termino
constante que hace ese desplazamiento, por eso no hay que componer WCS.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np
from astropy import units as u
from astropy.coordinates import SkyCoord
from astropy.io import fits
from astropy.wcs import WCS
from scipy.interpolate import RegularGridInterpolator

from .config import CUTOUT_SIZE_DEG
from .discovery import ImageRecord, processing_version
from .http import HttpClient
from .quality import count_flags, flag_bits_from_header


@dataclass
class CutoutFrame:
    obs_id: str
    det: int
    image: np.ndarray
    variance: np.ndarray
    zodi: np.ndarray
    flags: np.ndarray
    header: dict[str, Any]
    wcs: WCS
    wl_um: float | None
    bw_um: float | None
    mjd: float
    release: str
    version: str
    exptime: float
    source_url: str
    cached_path: str
    flag_bits: dict[str, str] = field(default_factory=dict)
    flag_pixels: dict[str, int] = field(default_factory=dict)
    pix_total: int = 0

    def as_dict(self) -> dict[str, Any]:
        return {
            "obs_id": self.obs_id,
            "det": self.det,
            "mjd": self.mjd,
            "wl_um": self.wl_um,
            "bw_um": self.bw_um,
            "release": self.release,
            "version": self.version,
            "exptime": self.exptime,
            "source_url": self.source_url,
            "cached_path": self.cached_path,
            "flag_bits": self.flag_bits,
            "flag_pixels": self.flag_pixels,
            "pix_total": self.pix_total,
        }


def _as_float(value: Any, default: float = float("nan")) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _obs_id(header: fits.Header, url: str) -> str:
    for key in ("OBSID", "OBS_ID", "OBSIDSTR"):
        if key in header:
            return str(header[key]).strip()
    name = Path(url.split("?")[0]).name
    match = re.search(r"level2_([0-9A-Za-z_]+)_spx", name)
    if match:
        return match.group(1)
    return name.replace(".fits", "")


def download_cutout(h: HttpClient, record: ImageRecord, url: str, dest: Path) -> Path:
    """Descarga el recorte. El servicio responde 503 'Server busy' a menudo."""
    if dest.exists() and dest.stat().st_size > 1024:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    r = h.get(url)
    content = r.content
    if content.lstrip()[:15].lower().startswith(b"server busy"):
        raise RuntimeError(f"servicio de recortes ocupado: {content[:80]!r}")
    if len(content) < 1024:
        raise ValueError(f"recorte demasiado pequeno: {len(content)} B")
    tmp.write_bytes(content)
    tmp.replace(dest)
    return dest


def trim_mef(src: Path, dst: Path) -> Path:
    """Copia el MEF sin la extension EPSF."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    with fits.open(src, memmap=False) as hdul:
        keep = [
            hdu.copy()
            for hdu in hdul
            if str(hdu.header.get("EXTNAME", "")).upper() not in {"EPSF"}
        ]
        fits.HDUList(keep).writeto(dst, overwrite=True, output_verify="silentfix")
    return dst


def wave_at_pixel(
    hdul: fits.HDUList,
    x: float,
    y: float,
    image_header: fits.Header | None = None,
) -> tuple[float | None, float | None]:
    """Longitud de onda y ancho de banda en el pixel (0-based) del recorte.

    La tabla WCS-WAVE guarda una rejilla de control en coordenadas del detector
    completo. La relacion entre el pixel del recorte y esa rejilla esta en
    ``CRPIX1W``/``CRVAL1W`` del encabezado de IMAGE (no del de WCS-WAVE, que no
    los trae). Usar el encabezado equivocado dejaba todas las longitudes de onda
    en el borde azul de cada detector. Se interpola bilinealmente.
    """
    try:
        hdu = hdul["WCS-WAVE"]
    except KeyError:
        return None, None
    data = hdu.data
    if data is None or len(data) == 0:
        return None, None
    row = data[0]
    xgrid = np.asarray(row["X"], dtype=float)
    ygrid = np.asarray(row["Y"], dtype=float)
    values = np.asarray(row["VALUES"], dtype=float)  # (ny, nx, 2)
    if values.ndim != 3 or values.shape[2] < 2:
        return None, None
    header = hdu.header
    source = image_header if image_header is not None else header
    x_raw = (x - float(source.get("CRPIX1W", 0.0))) * float(source.get("CDELT1W", 1.0)) + float(
        source.get("CRVAL1W", 1.0)
    )
    y_raw = (y - float(source.get("CRPIX2W", 0.0))) * float(source.get("CDELT2W", 1.0)) + float(
        source.get("CRVAL2W", 1.0)
    )
    try:
        interp_wl = RegularGridInterpolator((ygrid, xgrid), values[:, :, 0], bounds_error=False, fill_value=np.nan)
        interp_bw = RegularGridInterpolator((ygrid, xgrid), values[:, :, 1], bounds_error=False, fill_value=np.nan)
        wl = float(interp_wl((y_raw, x_raw)))
        bw = float(interp_bw((y_raw, x_raw)))
    except Exception:  # noqa: BLE001
        return None, None
    if not np.isfinite(wl) or wl <= 0:
        return None, None
    return wl, bw if np.isfinite(bw) else None


def extract_frame(path: Path, ra: float, dec: float, record: ImageRecord) -> CutoutFrame:
    with fits.open(path, memmap=False) as hdul:
        by_name = {str(hdu.header.get("EXTNAME", "")).upper(): hdu for hdu in hdul}
        image_hdu = by_name.get("IMAGE") or hdul[1]
        flags_hdu = by_name.get("FLAGS") or hdul[2]
        var_hdu = by_name.get("VARIANCE") or hdul[3]
        zodi_hdu = by_name.get("ZODI") or hdul[4]

        header = image_hdu.header
        wcs = WCS(header)
        sky = SkyCoord(ra=ra, dec=dec, unit="deg")
        x, y = wcs.world_to_pixel(sky)
        x = float(np.asarray(x).ravel()[0])
        y = float(np.asarray(y).ravel()[0])

        wl, bw = wave_at_pixel(hdul, x, y, header)
        if wl is None and record.lam_um is not None:
            wl = record.lam_um
        if bw is None and record.dlam_um is not None:
            bw = record.dlam_um

        image = np.asarray(image_hdu.data, dtype=np.float64)
        variance = (
            np.asarray(var_hdu.data, dtype=np.float64)
            if var_hdu.data is not None
            else np.full_like(image, np.nan)
        )
        zodi = (
            np.asarray(zodi_hdu.data, dtype=np.float64)
            if zodi_hdu.data is not None
            else np.full_like(image, np.nan)
        )
        flags = (
            np.asarray(flags_hdu.data, dtype=np.int64)
            if flags_hdu.data is not None
            else np.zeros(image.shape, dtype=np.int64)
        )

        flag_bits = flag_bits_from_header(flags_hdu.header)
        flag_pixels = count_flags(flags, flag_bits)
        version = processing_version(record.access_url) or str(header.get("VERSION", "")).strip()

        return CutoutFrame(
            obs_id=_obs_id(header, record.access_url),
            det=int(header.get("DETECTOR", record.det or 0)),
            image=image,
            variance=variance,
            zodi=zodi,
            flags=flags,
            header={k: header[k] for k in header},
            wcs=wcs,
            wl_um=wl,
            bw_um=bw,
            mjd=_as_float(header.get("MJD-OBS"), record.mjd),
            release=record.release,
            version=version,
            exptime=_as_float(header.get("XPOSURE"), _as_float(header.get("EXPTIME"), 0.0)),
            source_url=record.access_url,
            cached_path=str(path),
            flag_bits=flag_bits,
            flag_pixels=flag_pixels,
            pix_total=int(image.size),
        )


def pixel_in_frame(frame: CutoutFrame, ra: float, dec: float, margin: int = 0) -> bool:
    x, y = frame.wcs.world_to_pixel(SkyCoord(ra=ra, dec=dec, unit="deg"))
    x = float(np.asarray(x).ravel()[0])
    y = float(np.asarray(y).ravel()[0])
    ny, nx = frame.image.shape
    return (margin <= x < nx - margin) and (margin <= y < ny - margin)


def cutout_path(root: Path, record: ImageRecord) -> Path:
    return root / f"{record.obs_id}_D{record.det}.fits"


def download_and_extract(
    h: HttpClient,
    record: ImageRecord,
    *,
    ra: float,
    dec: float,
    cutout_dir: Path,
    raw_dir: Path,
    size_deg: float = CUTOUT_SIZE_DEG,
) -> CutoutFrame:
    from .discovery import cutout_url

    raw = raw_dir / f"{record.obs_id}_D{record.det}_raw.fits"
    trimmed = cutout_path(cutout_dir, record)

    # Reutilizar un recorte ya reducido si contiene el centro pedido. El
    # recorte puede haberse pedido con otro centro (por ejemplo tras corregir
    # la epoca); su WCS absoluta sigue siendo valida mientras el centro caiga
    # dentro. Esto evita volver a descargar al repetir una corrida.
    if trimmed.exists() and trimmed.stat().st_size > 1024:
        try:
            cached = extract_frame(trimmed, ra, dec, record)
            if pixel_in_frame(cached, ra, dec, margin=2):
                return cached
        except Exception:  # noqa: BLE001
            pass

    url = cutout_url(record.access_url, ra, dec, size_deg)
    download_cutout(h, record, url, raw)
    try:
        trim_mef(raw, trimmed)
    finally:
        raw.unlink(missing_ok=True)
    return extract_frame(trimmed, ra, dec, record)
