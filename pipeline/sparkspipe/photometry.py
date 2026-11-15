"""Fotometria de apertura con mascara de estrella y cociente de frio.

WISE 0855 tiene una estrella de fondo a ~7 arcsec (1.2 px en la malla de
6.15 arcsec/px). A esa separacion las dos fuentes no se pueden descomponer:
un ajuste de dos Gaussianas es degenerado. El metodo que si es estable es
enmascarar el nucleo de la estrella, cuya posicion se fija desde D1 (donde el
objetivo no se ve), y medir el resto con la apertura de siempre. La mascara
quita tambien una parte del objetivo; por eso el resultado se declara como
medicion con esa limitacion, no como una separacion limpia.

El flujo se mide como la suma de la apertura menos el fondo del anillo:

    F[mJy] = sum(imagen - bkg) * (pixel_arcsec/206265)^2 * 1e9

El cociente entre bandas cancela el factor de apertura, igual que en el
procesamiento anterior (docs/methods.md, indice de frio).
"""

from __future__ import annotations

import math
from typing import Any, Iterable

import numpy as np

from .config import PIXEL_ARCSEC

PIXEL_SR = (PIXEL_ARCSEC / 206265.0) ** 2
DEFAULT_PSF_SIGMA_PX = 0.60
MIN_SNR_FLUX = 3.0
APERTURE_RADIUS_PX = 3.0
ANNULUS_RADIUS_PX = (6.0, 10.0)

# Definicion del procesamiento anterior (docs/methods.md).
COLD_BANDS = {
    "short": (1.10, 1.63),
    "long": (4.42, 5.01),
    "ch4": (3.15, 3.45),
    "ch4_cont": (3.90, 4.10),
}


def flux_to_mjy(values_mjy_sr: float) -> float:
    """Suma de apertura en MJy/sr a flujo integrado en mJy."""
    return float(values_mjy_sr * PIXEL_SR * 1e9)


def _patch(image: np.ndarray, x0: float, y0: float, half: int = 6):
    ny, nx = image.shape
    xa = max(int(math.floor(x0)) - half, 0)
    xb = min(int(math.ceil(x0)) + half + 1, nx)
    ya = max(int(math.floor(y0)) - half, 0)
    yb = min(int(math.ceil(y0)) + half + 1, ny)
    yy, xx = np.mgrid[ya:yb, xa:xb]
    return image[ya:yb, xa:xb], xx.astype(float), yy.astype(float)


def fit_star_profile(
    images: Iterable[np.ndarray],
    *,
    expected: tuple[float, float] = (31.5, 31.5),
    psf_sigma0: float = DEFAULT_PSF_SIGMA_PX,
) -> dict[str, Any]:
    """Ajusta una Gaussiana a la estrella de fondo en las coadds de D1.

    Devuelve posicion media y sigma media. La malla es fija, asi que la posicion
    de la estrella es la misma en todas las temporadas; la media es una
    estimacion directa y la dispersion queda como error.
    """
    from scipy.optimize import least_squares

    xs: list[float] = []
    ys: list[float] = []
    sigmas: list[float] = []
    for image in images:
        image = np.asarray(image, dtype=float)
        patch, xx, yy = _patch(image, expected[0], expected[1], 6)
        good = np.isfinite(patch)
        if good.sum() < 20:
            continue
        x = xx[good]
        y = yy[good]
        values = patch[good]

        def model(p):
            A, xc, yc, s, b = p
            return b + A * np.exp(-((x - xc) ** 2 + (y - yc) ** 2) / (2.0 * s**2))

        p0 = [
            float(np.nanmax(patch) - np.nanmedian(patch)),
            expected[0],
            expected[1],
            psf_sigma0,
            float(np.nanmedian(patch)),
        ]
        lo = [-1.0, expected[0] - 3.0, expected[1] - 3.0, 0.30, -1.0]
        hi = [10.0, expected[0] + 3.0, expected[1] + 3.0, 1.20, 5.0]
        try:
            res = least_squares(lambda p: model(p) - values, p0, bounds=(lo, hi), loss="soft_l1", f_scale=0.01)
        except Exception:  # noqa: BLE001
            continue
        if not res.success:
            continue
        _, xc, yc, s, _ = res.x
        xs.append(float(xc))
        ys.append(float(yc))
        sigmas.append(float(s))
    if not xs:
        return {"ok": False, "x": expected[0], "y": expected[1], "sigma": psf_sigma0, "n": 0}
    return {
        "ok": True,
        "x": float(np.mean(xs)),
        "y": float(np.mean(ys)),
        "sigma": float(np.median(sigmas)),
        "ex": float(np.std(xs)) if len(xs) > 1 else 0.0,
        "ey": float(np.std(ys)) if len(ys) > 1 else 0.0,
        "n": len(xs),
        "positions": [[float(a), float(b)] for a, b in zip(xs, ys)],
    }


def star_mask(
    shape: tuple[int, int],
    star_xy: tuple[float, float] | None,
    radius_px: float,
) -> np.ndarray:
    """Mascara booleana con el nucleo de la estrella de fondo."""
    mask = np.zeros(shape, dtype=bool)
    if star_xy is None:
        return mask
    yy, xx = np.mgrid[0 : shape[0], 0 : shape[1]]
    return np.hypot(xx - star_xy[0], yy - star_xy[1]) <= radius_px


def aperture_flux(
    image: np.ndarray,
    sigma: np.ndarray | None,
    target_xy: tuple[float, float],
    *,
    mask: np.ndarray | None = None,
    ap: float = APERTURE_RADIUS_PX,
    ann: tuple[float, float] = ANNULUS_RADIUS_PX,
) -> dict[str, Any]:
    """Flujo en una apertura con fondo del anillo, excluyendo la mascara."""
    image = np.asarray(image, dtype=float)
    ny, nx = image.shape
    yy, xx = np.mgrid[0:ny, 0:nx]
    r = np.hypot(xx - target_xy[0], yy - target_xy[1])
    bad = np.zeros_like(image, dtype=bool) if mask is None else np.asarray(mask, dtype=bool)
    finite = np.isfinite(image)

    annulus = (r >= ann[0]) & (r <= ann[1]) & ~bad & finite
    if annulus.sum() < 8:
        return {"ok": False, "note": "sin anillo de cielo suficiente"}
    bkg = float(np.median(image[annulus]))
    bkg_sigma = float(1.4826 * np.median(np.abs(image[annulus] - bkg)))
    if bkg_sigma > 0:
        keep = annulus & (np.abs(image - bkg) < 3.0 * bkg_sigma)
        if keep.sum() >= 8:
            bkg = float(np.median(image[keep]))

    aperture = (r <= ap) & ~bad & finite
    if aperture.sum() < 4:
        return {"ok": False, "note": "sin pixeles de apertura"}
    flux = float(np.nansum(image[aperture] - bkg))
    if sigma is not None:
        sig = np.asarray(sigma, dtype=float)
        var = np.where(np.isfinite(sig[aperture]) & (sig[aperture] > 0), sig[aperture] ** 2, np.nan)
        noise = float(np.sqrt(np.nansum(var)))
    else:
        noise = float(bkg_sigma * math.sqrt(max(int(aperture.sum()), 1)))
    if not np.isfinite(noise) or noise <= 0:
        noise = float("nan")
    snr = flux / noise if np.isfinite(noise) and noise > 0 else 0.0
    return {
        "ok": bool(np.isfinite(flux)),
        "flux_mjy_sr": flux,
        "noise_mjy_sr": noise,
        "flux_mjy": flux_to_mjy(flux),
        "flux_err_mjy": flux_to_mjy(noise) if np.isfinite(noise) else float("nan"),
        "snr": float(snr),
        "bkg": bkg,
        "n_pix": int(aperture.sum()),
        "masked": int((bad & (r <= ap)).sum()),
    }


def _weighted_mean(values: list[float], errors: list[float]) -> tuple[float, float, int]:
    v = np.asarray(values, dtype=float)
    e = np.asarray(errors, dtype=float)
    good = np.isfinite(v) & np.isfinite(e) & (e > 0)
    if not good.any():
        return float("nan"), float("nan"), 0
    w = 1.0 / e[good] ** 2
    mean = float((w * v[good]).sum() / w.sum())
    err = float(math.sqrt(1.0 / w.sum()))
    return mean, err, int(good.sum())


def cold_index(points: Iterable[dict[str, Any]]) -> dict[str, Any]:
    """Cociente F_D6/F_D2 y profundidad de metano a 3.3 um.

    ``points``: dicts con ``lam`` (um), ``flux_mjy`` y ``flux_err_mjy``. Se
    agrupan por las bandas de ``COLD_BANDS`` y se promedian con pesos 1/error^2,
    igual que el procesamiento anterior. Si la banda corta no se detecta a
    3 sigma, el cociente se reporta como limite inferior.
    """
    bands: dict[str, list[dict[str, Any]]] = {k: [] for k in COLD_BANDS}
    for p in points:
        lam = p.get("lam")
        if lam is None or not np.isfinite(lam):
            continue
        for name, (lo, hi) in COLD_BANDS.items():
            if lo <= lam <= hi:
                bands[name].append(p)
                break
    summary: dict[str, Any] = {}
    for name, items in bands.items():
        flux, err, n = _weighted_mean(
            [float(p["flux_mjy"]) for p in items], [float(p["flux_err_mjy"]) for p in items]
        )
        summary[name] = {"flux_mjy": flux, "err_mjy": err, "n": n}

    long_f = summary["long"]["flux_mjy"]
    long_e = summary["long"]["err_mjy"]
    short_f = summary["short"]["flux_mjy"]
    short_e = summary["short"]["err_mjy"]
    out: dict[str, Any] = {
        "long_mjy": long_f if np.isfinite(long_f) else None,
        "long_err": long_e if np.isfinite(long_e) else None,
        "short_mjy": short_f if np.isfinite(short_f) else None,
        "short_err": short_e if np.isfinite(short_e) else None,
        "n_short": summary["short"]["n"],
        "n_long": summary["long"]["n"],
        "bands": summary,
    }
    if not (np.isfinite(long_f) and np.isfinite(short_f)):
        out.update({"ratio": None, "ratio_kind": "sin datos", "methane_depth": None, "methane_err": None})
        return out
    if short_f < MIN_SNR_FLUX * short_e:
        denom = max(short_f, 0.0) + MIN_SNR_FLUX * short_e
        out["ratio"] = float(long_f / denom) if denom > 0 else None
        out["ratio_kind"] = "lower_limit"
    else:
        out["ratio"] = float(long_f / short_f) if short_f != 0 else None
        out["ratio_kind"] = "measured"

    ch4 = summary["ch4"]
    cont = summary["ch4_cont"]
    if ch4["n"] and cont["n"] and np.isfinite(ch4["flux_mjy"]) and cont["flux_mjy"]:
        depth = 1.0 - ch4["flux_mjy"] / cont["flux_mjy"]
        rel = math.sqrt(
            (ch4["err_mjy"] / cont["flux_mjy"]) ** 2
            + (ch4["flux_mjy"] * cont["err_mjy"] / cont["flux_mjy"] ** 2) ** 2
        )
        out["methane_depth"] = float(depth)
        out["methane_err"] = float(abs(rel))
    else:
        out["methane_depth"] = None
        out["methane_err"] = None
    return out
