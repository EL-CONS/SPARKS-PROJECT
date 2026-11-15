"""Medicion de movimiento propio sobre las coadds.

El metodo es deliberadamente simple y no se ajusta al resultado esperado:

1. En cada coadd (detector, temporada) se mide el centroide del objeto en una
   apertura de radio 3 px sobre un anillo de cielo de 6 a 10 px.
2. El centroide se convierte a desplazamiento en arcsec respecto del centro de
   la malla usando la WCS. La malla esta centrada en la posicion del catalogo
   propagada a una epoca de referencia; no se recentra con los datos.
3. Se ajusta una recta por minimos cuadrados ponderados a cada coordenada
   contra el tiempo. El resultado es el movimiento propio.

Si no hay detecciones suficientes o la linea base es menor que
``MIN_BASELINE_YR``, se devuelve un resultado nulo con la razon escrita. No se
rellena con el valor esperado.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Iterable

import numpy as np
from astropy import units as u
from astropy.coordinates import SkyCoord
from astropy.wcs import WCS

from .config import (
    ANNULUS_RADIUS_PX,
    APERTURE_RADIUS_PX,
    MIN_BASELINE_YR,
    MIN_SEASONS_FOR_PM,
    PIXEL_ARCSEC,
)
from . import photometry

DAYS_PER_YEAR = 365.25
SNR_MIN = 3.0
MAX_OFFSET_PX = 10.0
MAX_SEP_FROM_CENTRE_PX = 12.0
CENTROID_FLOOR_PX = 0.05


@dataclass
class Detection:
    det: int
    season: int
    mjd: float
    x: float
    y: float
    ex: float
    ey: float
    snr: float
    flux: float
    bkg: float
    blended: bool
    use: bool
    note: str = ""

    def as_dict(self) -> dict[str, Any]:
        return {
            "det": self.det,
            "season": self.season,
            "mjd": round(float(self.mjd), 6),
            "x": round(float(self.x), 4),
            "y": round(float(self.y), 4),
            "ex": round(float(self.ex), 4),
            "ey": round(float(self.ey), 4),
            "snr": round(float(self.snr), 3),
            "flux": round(float(self.flux), 6),
            "bkg": round(float(self.bkg), 6),
            "blended": bool(self.blended),
            "use": bool(self.use),
            "note": self.note,
        }


def _robust_sigma(values: np.ndarray) -> float:
    values = values[np.isfinite(values)]
    if values.size == 0:
        return float("nan")
    med = np.median(values)
    return float(1.4826 * np.median(np.abs(values - med)))


def centroid_in_image(
    image: np.ndarray,
    sigma: np.ndarray | None,
    mask: np.ndarray | None,
    expected: tuple[float, float] = (31.5, 31.5),
    *,
    ap: float = APERTURE_RADIUS_PX,
    ann: tuple[float, float] = ANNULUS_RADIUS_PX,
    snr_min: float = SNR_MIN,
) -> dict[str, Any]:
    """Centroide por apertura y anillo. Devuelve tambien la razon si falla."""
    image = np.asarray(image, dtype=np.float64)
    ny, nx = image.shape
    if sigma is None or not np.isfinite(sigma).any():
        sigma = np.full_like(image, np.nan)
    sigma = np.asarray(sigma, dtype=np.float64)
    bad = np.zeros_like(image, dtype=bool) if mask is None else np.asarray(mask) > 0

    yy, xx = np.mgrid[0:ny, 0:nx]
    ex0, ey0 = expected
    r = np.hypot(xx - ex0, yy - ey0)

    annulus = (r >= ann[0]) & (r <= ann[1]) & ~bad & np.isfinite(image)
    if annulus.sum() < 8:
        annulus = (r >= ann[0]) & (r <= ann[1]) & np.isfinite(image)
    if annulus.sum() < 8:
        return {
            "ok": False,
            "note": "sin anillo de cielo suficiente",
            "x": float("nan"),
            "y": float("nan"),
            "ex": float("nan"),
            "ey": float("nan"),
            "snr": 0.0,
            "flux": float("nan"),
            "bkg": float("nan"),
            "blended": False,
        }

    bkg = float(np.median(image[annulus]))
    bkg_sigma = _robust_sigma(image[annulus])
    # Segundo recorte del anillo para quitar estrellas de paso.
    keep = annulus & (np.abs(image - bkg) < 3.0 * bkg_sigma) if bkg_sigma > 0 else annulus
    if keep.sum() >= 8:
        bkg = float(np.median(image[keep]))
        bkg_sigma = _robust_sigma(image[keep])

    aperture = (r <= ap) & ~bad & np.isfinite(image)
    if aperture.sum() < 4:
        aperture = (r <= ap) & np.isfinite(image)
    if aperture.sum() < 4:
        return {
            "ok": False,
            "note": "sin pixeles de apertura",
            "x": float("nan"),
            "y": float("nan"),
            "ex": float("nan"),
            "ey": float("nan"),
            "snr": 0.0,
            "flux": float("nan"),
            "bkg": bkg,
            "blended": False,
        }

    resid = np.where(aperture, image - bkg, 0.0)
    weights = np.where(aperture & (resid > 0), resid, 0.0)
    flux = float(resid.sum())
    var = np.where(np.isfinite(sigma[aperture]), sigma[aperture] ** 2, np.nan)
    noise = float(np.sqrt(np.nansum(var)))
    if not np.isfinite(noise) or noise <= 0:
        noise = float(bkg_sigma * math.sqrt(max(int(aperture.sum()), 1))) if np.isfinite(bkg_sigma) else float("nan")
    snr = flux / noise if np.isfinite(noise) and noise > 0 else 0.0

    wsum = float(weights.sum())
    if wsum <= 0:
        return {
            "ok": False,
            "note": "objeto no detectado (flujo no positivo)",
            "x": float("nan"),
            "y": float("nan"),
            "ex": float("nan"),
            "ey": float("nan"),
            "snr": float(snr),
            "flux": flux,
            "bkg": bkg,
            "blended": False,
        }

    x = float((weights * xx).sum() / wsum)
    y = float((weights * yy).sum() / wsum)

    sig_ap = np.where(np.isfinite(sigma), sigma, bkg_sigma if np.isfinite(bkg_sigma) else 0.0)
    var_x = float(((xx - x) ** 2 * sig_ap**2)[aperture].sum() / wsum**2)
    var_y = float(((yy - y) ** 2 * sig_ap**2)[aperture].sum() / wsum**2)
    ex = max(math.sqrt(max(var_x, 0.0)), CENTROID_FLOOR_PX)
    ey = max(math.sqrt(max(var_y, 0.0)), CENTROID_FLOOR_PX)

    # Mezcla: un segundo maximo local parecido dentro de 5 px.
    peak = float(np.nanmax(np.where(aperture, image - bkg, np.nan)))
    blended = False
    if np.isfinite(peak) and peak > 0:
        near = (r <= 5.0) & (r >= 1.5) & np.isfinite(image)
        if near.any():
            second = float(np.nanmax(np.where(near, image - bkg, np.nan)))
            blended = bool(second > 0.6 * peak)

    offset = math.hypot(x - ex0, y - ey0)
    ok = bool(
        np.isfinite(flux)
        and np.isfinite(snr)
        and snr >= snr_min
        and offset <= MAX_OFFSET_PX
        and np.isfinite(x)
        and np.isfinite(y)
    )
    note = ""
    if not ok:
        if not np.isfinite(snr) or snr < snr_min:
            note = f"SNR {snr:.2f} < {snr_min:.1f}"
        elif offset > MAX_OFFSET_PX:
            note = f"centroide a {offset:.1f} px del predicho"
    return {
        "ok": ok,
        "note": note,
        "x": x,
        "y": y,
        "ex": ex,
        "ey": ey,
        "snr": float(snr),
        "flux": flux,
        "bkg": bkg,
        "blended": blended,
        "offset_px": offset,
    }


def _wls_design(
    t: np.ndarray,
    y: np.ndarray,
    ey: np.ndarray,
    groups: np.ndarray,
    *,
    per_group_intercept: bool,
) -> dict[str, float]:
    """Minimos cuadrados ponderados con recta comun y, opcionalmente, un
    intercepto por detector.

    Un intercepto por detector absorbe el posible desplazamiento sistematico
    entre detectores sin tocar la pendiente, que es lo que se mide.
    """
    w = 1.0 / np.maximum(ey, 1e-6) ** 2
    t_mean = float((w * t).sum() / w.sum())
    dt = t - t_mean
    if per_group_intercept:
        labels = sorted(set(int(g) for g in groups))
        cols = [np.isclose(groups, lab).astype(float) for lab in labels]
    else:
        cols = [np.ones_like(t)]
    X = np.column_stack(cols + [dt])
    A = X * np.sqrt(w)[:, None]
    b = y * np.sqrt(w)
    coef, residuals, rank, _ = np.linalg.lstsq(A, b, rcond=None)
    if rank < X.shape[1]:
        return {
            "slope": float("nan"),
            "slope_err": float("nan"),
            "intercept": float("nan"),
            "chi2": float("nan"),
            "t_mean": t_mean,
        }
    model = X @ coef
    chi2 = float((w * (y - model) ** 2).sum())
    dof = max(len(t) - X.shape[1], 1)
    chi2_red = chi2 / dof
    try:
        cov = np.linalg.inv(A.T @ A) * max(chi2_red, 1e-12)
        slope_err = float(math.sqrt(max(cov[-1, -1], 0.0)))
    except np.linalg.LinAlgError:
        slope_err = float("nan")
    return {
        "slope": float(coef[-1]),
        "slope_err": slope_err,
        "intercept": float(coef[0]),
        "chi2": chi2_red,
        "t_mean": t_mean,
    }


def _fit_offsets(
    points: list[Detection],
    wcs: WCS,
    ra0: float,
    dec0: float,
    *,
    clip_sigma: float = 3.0,
    per_det_intercept: bool = True,
) -> dict[str, Any] | None:
    if len(points) < 3:
        return None
    mjd = np.array([p.mjd for p in points], dtype=float)
    t = (mjd - mjd[0]) / DAYS_PER_YEAR
    if float(t.max() - t.min()) <= 0:
        return None
    dra, ddec, era, edec = _offsets_arcsec(points, wcs, ra0, dec0)
    groups = np.array([p.det for p in points], dtype=int)

    # Con menos de dos puntos por grupo el intercepto por detector no aporta y
    # consume grados de libertad; se usa un intercepto comun.
    counts = {int(g): int((groups == g).sum()) for g in set(groups.tolist())}
    use_group_intercept = per_det_intercept and min(counts.values()) >= 2
    if len(counts) == 1:
        use_group_intercept = False

    keep = np.ones(len(points), dtype=bool)
    fit_ra = _wls_design(t, dra, era, groups, per_group_intercept=use_group_intercept)
    fit_dec = _wls_design(t, ddec, edec, groups, per_group_intercept=use_group_intercept)
    if len(points) >= 5:
        # Recorte sigma con un modelo simple (sin intercepto por grupo) para no
        # gastar grados de libertad antes de tener el ajuste final.
        simple_ra = _wls_design(t, dra, era, groups, per_group_intercept=False)
        simple_dec = _wls_design(t, ddec, edec, groups, per_group_intercept=False)
        pred_ra = simple_ra["intercept"] + simple_ra["slope"] * (t - simple_ra["t_mean"])
        pred_dec = simple_dec["intercept"] + simple_dec["slope"] * (t - simple_dec["t_mean"])
        new_keep = (np.abs(dra - pred_ra) < clip_sigma * era) & (np.abs(ddec - pred_dec) < clip_sigma * edec)
        if new_keep.sum() >= 3:
            keep = new_keep
            dra, ddec, era, edec, t, groups = (arr[keep] for arr in (dra, ddec, era, edec, t, groups))
            counts = {int(g): int((groups == g).sum()) for g in set(groups.tolist())}
            use_group_intercept = per_det_intercept and min(counts.values()) >= 2 and len(counts) > 1
            fit_ra = _wls_design(t, dra, era, groups, per_group_intercept=use_group_intercept)
            fit_dec = _wls_design(t, ddec, edec, groups, per_group_intercept=use_group_intercept)

    mu_ra = fit_ra["slope"]
    mu_dec = fit_dec["slope"]
    mu = float(math.hypot(mu_ra, mu_dec))
    pa = float(math.degrees(math.atan2(mu_ra, mu_dec)) % 360.0) if mu > 0 else float("nan")
    if mu > 0 and math.isfinite(mu):
        pa_err = float(
            math.degrees(
                math.sqrt((mu_dec**2 * fit_ra["slope_err"] ** 2 + mu_ra**2 * fit_dec["slope_err"] ** 2)) / mu**2
            )
        )
    else:
        pa_err = float("nan")
    return {
        "mu_ra": float(mu_ra),
        "mu_ra_err": float(fit_ra["slope_err"]),
        "chi2_ra": float(fit_ra["chi2"]),
        "mu_dec": float(mu_dec),
        "mu_dec_err": float(fit_dec["slope_err"]),
        "chi2_dec": float(fit_dec["chi2"]),
        "mu": mu,
        "mu_err": float(math.hypot(fit_ra["slope_err"], fit_dec["slope_err"])),
        "pa_deg": pa,
        "pa_err_deg": pa_err,
        "baseline_yr": float(t.max() - t.min()),
        "n_points": int(keep.sum()),
        "detectors": sorted({int(p.det) for p, k in zip(points, keep) if k}),
        "parallax_removed_mas": 0.0,
        "per_detector_intercept": bool(use_group_intercept),
    }


def _offsets_arcsec(
    points: list[Detection],
    wcs: WCS,
    ra0: float,
    dec0: float,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    x = np.array([p.x for p in points], dtype=float)
    y = np.array([p.y for p in points], dtype=float)
    world = wcs.pixel_to_world(x, y)
    ra = np.asarray(world.ra.deg, dtype=float)
    dec = np.asarray(world.dec.deg, dtype=float)
    dra = ((ra - ra0 + 180.0) % 360.0 - 180.0) * math.cos(math.radians(dec0)) * 3600.0
    ddec = (dec - dec0) * 3600.0
    return dra, ddec, np.array([p.ex for p in points]) * PIXEL_ARCSEC, np.array([p.ey for p in points]) * PIXEL_ARCSEC


def expected_pm(target: Any) -> dict[str, Any] | None:
    mu = getattr(target, "mu_expected_arcsec_yr", None)
    pa = getattr(target, "pa_expected_deg", None)
    if mu is None:
        return None
    return {
        "mu": float(mu),
        "pa_deg": float(pa) if pa is not None else None,
        "pmra": float(mu * math.sin(math.radians(pa))) if pa is not None else None,
        "pmdec": float(mu * math.cos(math.radians(pa))) if pa is not None else None,
        "catalog": "data-sample/index.json (valor del reto; fuente primaria sin verificar salvo Gaia DR3)",
        "mu_err": None,
    }


def compare_to_expected(measured: dict[str, Any] | None, expected: dict[str, Any] | None) -> dict[str, Any]:
    if not measured or not expected or expected.get("mu") is None:
        return {"available": False, "verdict": "sin valor esperado"}
    if not math.isfinite(measured.get("mu", float("nan"))):
        return {"available": False, "verdict": "sin medicion"}
    delta_mu = measured["mu"] - expected["mu"]
    err = measured.get("mu_err")
    sigma_mu = abs(delta_mu) / err if err and err > 0 else None
    out: dict[str, Any] = {
        "available": True,
        "mu_expected": expected["mu"],
        "delta_mu": float(delta_mu),
        "sigma_mu": float(sigma_mu) if sigma_mu is not None else None,
        "expected_err_used": False,
    }
    if expected.get("pa_deg") is not None and math.isfinite(measured.get("pa_deg", float("nan"))):
        dpa = ((measured["pa_deg"] - expected["pa_deg"] + 180.0) % 360.0) - 180.0
        out["pa_expected"] = expected["pa_deg"]
        out["delta_pa"] = float(dpa)
        out["sigma_pa"] = (
            float(abs(dpa) / measured["pa_err_deg"]) if measured.get("pa_err_deg") else None
        )
    if sigma_mu is None:
        out["verdict"] = "sin error medido; no se puede hablar de sigmas"
    elif sigma_mu <= 1:
        out["verdict"] = "acuerdo dentro de 1 sigma"
    elif sigma_mu <= 2:
        out["verdict"] = "acuerdo dentro de 2 sigma"
    elif sigma_mu <= 3:
        out["verdict"] = "acuerdo dentro de 3 sigma"
    else:
        out["verdict"] = "desacuerdo mayor que 3 sigma"
    return out


def measure_motion(
    per_coadd: Iterable[dict[str, Any]],
    wcs: WCS,
    ra0: float,
    dec0: float,
    target: Any,
    *,
    expected_center: tuple[float, float] = (31.5, 31.5),
    star: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """``per_coadd``: dicts con det, season, mjd, image, sigma, mask.

    ``star`` fija la estrella de fondo: ``{"xy": (x, y), "sigma": px,
    "detectors": (5, 6)}``. En esos detectores se ajusta un modelo de dos
    Gaussianas con la estrella en posicion fija, en lugar del centroide de
    apertura que mezclaba las dos fuentes.

    Devuelve el bloque ``target`` del manifiesto: puntos, medicion combinada,
    medicion por detector y comparacion con el valor esperado.
    """
    detections: list[Detection] = []
    star_dets = tuple(int(d) for d in (star or {}).get("detectors", ()))
    for item in per_coadd:
        item_mask = item.get("mask")
        if star and int(item["det"]) in star_dets:
            # Enmascarar el nucleo de la estrella de fondo. A 1.2 px no se puede
            # separar en dos fuentes; la mascara quita la estrella y una parte
            # del objetivo, y eso se declara en el manifiesto.
            disk = photometry.star_mask(
                np.asarray(item["image"]).shape,
                tuple(star["xy"]),
                float(star.get("mask_radius") or 0.7),
            )
            item_mask = disk if item_mask is None else (np.asarray(item_mask, dtype=bool) | disk)
        result = centroid_in_image(
            item["image"],
            item.get("sigma"),
            item_mask,
            expected_center,
        )
        detections.append(
            Detection(
                det=int(item["det"]),
                season=int(item["season"]),
                mjd=float(item["mjd"]),
                x=float(result.get("x", float("nan"))),
                y=float(result.get("y", float("nan"))),
                ex=float(result.get("ex", float("nan"))),
                ey=float(result.get("ey", float("nan"))),
                snr=float(result.get("snr", 0.0)),
                flux=float(result.get("flux", float("nan"))),
                bkg=float(result.get("bkg", float("nan"))),
                blended=bool(result.get("blended", False)),
                use=bool(result.get("ok", False)),
                note=str(result.get("note", "")),
            )
        )

    used = [d for d in detections if d.use]
    seasons = sorted({d.season for d in used})
    expected = expected_pm(target)
    result: dict[str, Any] = {
        "points": [d.as_dict() for d in detections],
        "expected": expected,
        "measured": None,
        "comparison": {"available": False},
        "reason": "",
        "n_used": len(used),
        "n_seasons_used": len(seasons),
        "method": (
            "centroide en apertura de 3 px con anillo 6-10 px; recta ponderada "
            "por 1/error^2 sobre las coadds por detector y temporada"
            + (
                "; en D5/D6 se enmascara el nucleo de la estrella de fondo con "
                "posicion fija desde D1"
                if star
                else ""
            )
        ),
    }
    if star:
        result["star_subtraction"] = {
            "xy": [float(star["xy"][0]), float(star["xy"][1])],
            "mask_radius_px": float(star.get("mask_radius") or 0.7),
            "detectors": list(star_dets),
            "source": star.get("source", "D1 (donde el objetivo no se ve)"),
            "note": (
                "a 1.2 px las dos fuentes no se resuelven; la mascara quita el "
                "nucleo de la estrella y tambien una parte del objetivo"
            ),
        }
    if len(used) < 3:
        result["reason"] = (
            f"detecciones utilizables {len(used)} < 3; no se mide movimiento propio"
        )
        return result
    if len(seasons) < MIN_SEASONS_FOR_PM:
        result["reason"] = (
            f"temporadas utilizables {len(seasons)} < {MIN_SEASONS_FOR_PM}; "
            "no se puede separar movimiento propio de variabilidad"
        )
        return result
    combined = _fit_offsets(used, wcs, ra0, dec0)
    if combined is None:
        result["reason"] = "la linea base temporal es nula"
        return result
    if combined["baseline_yr"] < MIN_BASELINE_YR:
        result["reason"] = (
            f"linea base {combined['baseline_yr']:.2f} anios < {MIN_BASELINE_YR:.1f}; "
            "no se mide movimiento propio"
        )
        return result

    combined["per_detector"] = {}
    for det in sorted({d.det for d in used}):
        fit = _fit_offsets([d for d in used if d.det == det], wcs, ra0, dec0)
        if fit is not None:
            combined["per_detector"][str(det)] = fit
    result["measured"] = combined
    result["comparison"] = compare_to_expected(combined, expected)
    if combined["mu"] < 3.0 * combined["mu_err"]:
        result["reason"] = (
            "movimiento medido consistente con cero a 3 sigma; se reporta como "
            "cota superior, no como deteccion"
        )
    return result


def prediction_offsets(
    points: list[dict[str, Any]], expected: dict[str, Any] | None, mjd0: float
) -> list[dict[str, Any]]:
    """Desplazamiento esperado en pixeles, solo para diagnostico del manifiesto."""
    if not expected or expected.get("pmra") is None:
        return []
    out = []
    for p in points:
        dt = (float(p["mjd"]) - mjd0) / DAYS_PER_YEAR
        dra = expected["pmra"] * dt / math.cos(math.radians(p.get("dec", 0.0) or 0.0))
        out.append({"mjd": p["mjd"], "dra_arcsec": dra, "ddec_arcsec": expected["pmdec"] * dt})
    return out
