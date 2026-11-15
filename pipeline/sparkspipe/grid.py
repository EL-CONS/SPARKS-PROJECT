"""Common grid and reprojection.

The final grid matches ``data-sample/barnard``:
64 x 64 pixels, 6.15 arcsec/pixel, TAN centered on the target, ``crpix`` 32.5.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from astropy.wcs import WCS

from .config import CDELT_DEG, CRPIX, CTYPE, N_PIX


def target_wcs(ra: float, dec: float) -> WCS:
    w = WCS(naxis=2)
    w.wcs.ctype = list(CTYPE)
    w.wcs.crval = [ra, dec]
    w.wcs.crpix = [CRPIX, CRPIX]
    w.wcs.cdelt = [-CDELT_DEG, CDELT_DEG]
    return w


@dataclass
class Resampled:
    image: np.ndarray
    variance: np.ndarray
    mask: np.ndarray
    coverage: np.ndarray


def resample(
    image: np.ndarray,
    wcs: WCS,
    out_wcs: WCS,
    *,
    variance: np.ndarray | None = None,
    mask: np.ndarray | None = None,
) -> Resampled:
    """Reprojects onto the common grid. Returns image, variance, mask and coverage."""
    from reproject import reproject_interp

    arr, footprint = reproject_interp((image.astype(np.float64), wcs), out_wcs, shape_out=(N_PIX, N_PIX))
    arr = np.asarray(arr, dtype=np.float64)
    arr[footprint <= 0] = np.nan

    if variance is not None:
        var, _ = reproject_interp((variance.astype(np.float64), wcs), out_wcs, shape_out=(N_PIX, N_PIX))
        var = np.asarray(var, dtype=np.float64)
        var[footprint <= 0] = np.nan
    else:
        var = np.full((N_PIX, N_PIX), np.nan)

    if mask is not None:
        # Mask is propagated by nearest neighbor, flagging any pixel whose
        # source neighbor is masked.
        from reproject import reproject_interp as ri

        m, _ = ri(((mask > 0).astype(np.float64), wcs), out_wcs, shape_out=(N_PIX, N_PIX), order="nearest-neighbor")
        m = np.asarray(m, dtype=np.float64)
        mask_out = np.where(m > 0.5, 1, 0).astype(np.uint8)
        mask_out[footprint <= 0] = 1
    else:
        mask_out = np.where(footprint <= 0, 1, 0).astype(np.uint8)

    return Resampled(image=arr, variance=var, mask=mask_out, coverage=np.asarray(footprint, dtype=np.float64))


def pixel_scale_and_pa(wcs: WCS) -> tuple[float, float]:
    """Pixel scale (arcsec/pixel) and +x axis position angle, for diagnostics."""
    from astropy import units as u
    from astropy.coordinates import SkyCoord

    p0 = wcs.pixel_to_world(31.5, 31.5)
    p1 = wcs.pixel_to_world(32.5, 31.5)
    sep = p0.separation(p1).to(u.arcsec).value
    pa = p0.position_angle(p1).to(u.deg).value
    return float(sep), float(pa)
