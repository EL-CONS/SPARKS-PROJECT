"""Coadds por detector y temporada, diferencias emparejadas en longitud de onda.

Se usa recorte por sigma y media ponderada por la varianza. El ruido del coadd
sale de la propagacion de la varianza, no de la dispersion observada, para no
subestimar el error cuando hay pocos cuadros.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

import numpy as np

from .config import MAX_CLIP_ITERS, MIN_FRAMES_PER_COADD, SIGMA_CLIP


@dataclass
class CoaddResult:
    det: int
    season: int
    image: np.ndarray
    sigma: np.ndarray
    n_frames: int
    lam_mean: float
    lam_min: float
    lam_max: float
    sigma_single: float
    sigma_coadd: float
    snr_gain: float
    members: list[int] = field(default_factory=list)

    def as_dict(self, i: int, png: str) -> dict:
        return {
            "i": i,
            "det": self.det,
            "season": self.season,
            "n_frames": self.n_frames,
            "lam_mean": float(self.lam_mean),
            "lam_min": float(self.lam_min),
            "lam_max": float(self.lam_max),
            "sigma_single": float(self.sigma_single),
            "sigma_coadd": float(self.sigma_coadd),
            "snr_gain": float(self.snr_gain),
            "png": png,
        }


@dataclass
class DiffResult:
    det: int
    a: int
    b: int
    lam_lo: float
    lam_hi: float
    lambda_matched: bool
    n_a: int
    n_b: int
    image: np.ndarray
    sigma: np.ndarray

    def as_dict(self, i: int) -> dict:
        return {
            "i": i,
            "det": self.det,
            "a": self.a,
            "b": self.b,
            "lam_lo": float(self.lam_lo),
            "lam_hi": float(self.lam_hi),
            "lambda_matched": bool(self.lambda_matched),
            "n_a": self.n_a,
            "n_b": self.n_b,
            "sigma": float(np.nanmedian(self.sigma)),
        }


def _weighted_mean(images: np.ndarray, variances: np.ndarray, valid: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    with np.errstate(invalid="ignore", divide="ignore"):
        weights = np.where(valid, 1.0 / np.where(variances > 0, variances, np.inf), 0.0)
        wsum = weights.sum(axis=0)
        image = np.nansum(np.where(valid, images * weights, 0.0), axis=0) / np.where(wsum > 0, wsum, np.nan)
        sigma = np.sqrt(1.0 / np.where(wsum > 0, wsum, np.nan))
    return image, sigma


def sigma_clipped_coadd(
    images: np.ndarray,
    variances: np.ndarray,
    masks: np.ndarray,
    *,
    sigma: float = SIGMA_CLIP,
    iters: int = MAX_CLIP_ITERS,
) -> tuple[np.ndarray, np.ndarray, int]:
    """Media recortada por sigma, ponderada por 1/varianza.

    ``images``, ``variances`` y ``masks``: (n, ny, nx).
    Devuelve (imagen, sigma_imagen, n_pixeles_usados_por_pixel_medio).
    """
    images = np.asarray(images, dtype=np.float64)
    variances = np.asarray(variances, dtype=np.float64)
    masks = np.asarray(masks, dtype=bool)
    n = images.shape[0]
    valid = np.isfinite(images) & np.isfinite(variances) & (variances > 0) & ~masks
    if not valid.any():
        nan = np.full(images.shape[1:], np.nan, dtype=np.float64)
        return nan, nan.copy(), 0

    # Para pocos cuadros el recorte por sigma no tiene sentido estadistico.
    if n < 3:
        image, sigma_img = _weighted_mean(images, variances, valid)
        return image, sigma_img, int(np.median(valid.sum(axis=0)))

    keep = valid.copy()
    initial, _ = _weighted_mean(images, variances, keep)
    for _ in range(max(1, iters)):
        with np.errstate(invalid="ignore"):
            std = np.nanstd(np.where(keep, images, np.nan), axis=0)
        std = np.where(np.isfinite(std) & (std > 0), std, np.nan)
        with np.errstate(invalid="ignore"):
            new_keep = valid & (
                np.abs(images - initial[None, :, :]) <= sigma * np.maximum(std[None, :, :], 1e-12)
            )
        if np.array_equal(new_keep, keep):
            break
        keep = new_keep
        image, _ = _weighted_mean(images, variances, keep)
        initial = np.where(np.isfinite(image), image, initial)

    image, sigma_img = _weighted_mean(images, variances, keep)
    n_used = int(np.median(keep.sum(axis=0)))
    return image, sigma_img, n_used


def coadd_by_det_season(
    frames: Iterable[dict],
    *,
    min_frames: int = MIN_FRAMES_PER_COADD,
) -> tuple[list[CoaddResult], dict[tuple[int, int], list[int]]]:
    """``frames``: dicts con det, season, image, variance, mask, wl_um, bw_um, index."""
    groups: dict[tuple[int, int], list[dict]] = {}
    for fr in frames:
        key = (int(fr["det"]), int(fr["season"]))
        groups.setdefault(key, []).append(fr)

    results: list[CoaddResult] = []
    members: dict[tuple[int, int], list[int]] = {}
    for (det, season), items in sorted(groups.items()):
        if len(items) < min_frames:
            continue
        images = np.stack([it["image"] for it in items])
        variances = np.stack([it["variance"] for it in items])
        masks = np.stack([it["mask"] for it in items])
        image, sigma_img, _ = sigma_clipped_coadd(images, variances, masks)
        wls = np.array([it["wl_um"] for it in items if it.get("wl_um")], dtype=float)
        sigma_single = float(np.nanmedian([np.sqrt(np.nanmedian(v)) for v in variances if np.isfinite(v).any()]))
        sigma_coadd = float(np.nanmedian(sigma_img))
        results.append(
            CoaddResult(
                det=det,
                season=season,
                image=image,
                sigma=sigma_img,
                n_frames=len(items),
                lam_mean=float(np.nanmean(wls)) if wls.size else float("nan"),
                lam_min=float(np.nanmin(wls)) if wls.size else float("nan"),
                lam_max=float(np.nanmax(wls)) if wls.size else float("nan"),
                sigma_single=sigma_single,
                sigma_coadd=sigma_coadd,
                snr_gain=float(sigma_single / sigma_coadd) if sigma_coadd > 0 else float("nan"),
                members=[int(it["index"]) for it in items],
            )
        )
        members[(det, season)] = [int(it["index"]) for it in items]
    return results, members


def season_diffs(coadds: list[CoaddResult]) -> list[DiffResult]:
    """Todas las parejas de temporadas por detector, con emparejado de lambda.

    ``lambda_matched`` es verdadero cuando los intervalos [lam_min, lam_max] de
    las dos temporadas se solapan. ``lam_lo``/``lam_hi`` son ese solapamiento.
    """
    by_det: dict[int, list[CoaddResult]] = {}
    for c in coadds:
        by_det.setdefault(c.det, []).append(c)

    out: list[DiffResult] = []
    for det, items in sorted(by_det.items()):
        items = sorted(items, key=lambda c: c.season)
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                a, b = items[i], items[j]
                lo = max(a.lam_min, b.lam_min)
                hi = min(a.lam_max, b.lam_max)
                matched = bool(np.isfinite(lo) and np.isfinite(hi) and hi > lo)
                diff = b.image - a.image
                sigma = np.sqrt(np.maximum(a.sigma**2 + b.sigma**2, 0))
                out.append(
                    DiffResult(
                        det=det,
                        a=a.season,
                        b=b.season,
                        lam_lo=float(lo),
                        lam_hi=float(hi),
                        lambda_matched=matched,
                        n_a=a.n_frames,
                        n_b=b.n_frames,
                        image=diff,
                        sigma=sigma,
                    )
                )
    return out


def median_per_detector(frames: Iterable[dict]) -> np.ndarray:
    """Mediana por detector sobre todos los cuadros (forma 6 x n x n)."""
    by_det: dict[int, list[np.ndarray]] = {}
    for fr in frames:
        by_det.setdefault(int(fr["det"]), []).append(fr["image"])
    channels = sorted(by_det)
    if not channels:
        return np.zeros((0, 0, 0), dtype=np.float32)
    first = by_det[channels[0]][0]
    out = np.full((6, *first.shape), np.nan, dtype=np.float32)
    for det in channels:
        if 1 <= det <= 6:
            out[det - 1] = np.nanmedian(np.stack(by_det[det]), axis=0)
    return out
