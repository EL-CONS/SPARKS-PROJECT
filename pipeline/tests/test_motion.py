import math

import numpy as np
from astropy.coordinates import SkyCoord

from sparkspipe import motion
from sparkspipe.config import N_PIX, REFERENCE_MJD, Target, MJD_J2000
from sparkspipe.grid import target_wcs


RA0 = 120.0
DEC0 = -10.0


def _gaussian_image(x: float, y: float, *, peak: float = 20.0, sigma: float = 1.2) -> np.ndarray:
    yy, xx = np.mgrid[0:N_PIX, 0:N_PIX]
    return peak * np.exp(-((xx - x) ** 2 + (yy - y) ** 2) / (2.0 * sigma**2))


def _target(mu: float, pa: float) -> Target:
    return Target(
        id="test",
        name="test",
        ra=RA0,
        dec=DEC0,
        kind="mover",
        mu_expected_arcsec_yr=mu,
        pa_expected_deg=pa,
        source="test",
        coord_epoch_mjd=MJD_J2000,
    )


def _points(mu: float, pa: float, mjds, dets=(1, 2)):
    wcs = target_wcs(RA0, DEC0)
    pmra = mu * math.sin(math.radians(pa))
    pmdec = mu * math.cos(math.radians(pa))
    out = []
    for det in dets:
        for mjd in mjds:
            dt = (mjd - REFERENCE_MJD) / 365.25
            ra = RA0 + pmra * dt / 3600.0 / math.cos(math.radians(DEC0))
            dec = DEC0 + pmdec * dt / 3600.0
            x, y = wcs.world_to_pixel(SkyCoord(ra=ra, dec=dec, unit="deg"))
            img = _gaussian_image(float(x), float(y))
            out.append(
                {
                    "det": det,
                    "season": mjds.index(mjd),
                    "mjd": float(mjd),
                    "image": img,
                    "sigma": np.full_like(img, 0.05),
                    "mask": np.zeros_like(img, dtype=bool),
                }
            )
    return out


def test_recovers_known_motion():
    wcs = target_wcs(RA0, DEC0)
    mu, pa = 8.0, 277.36
    mjds = [60850.0, 61030.0, 61210.0]
    result = motion.measure_motion(_points(mu, pa, mjds), wcs, RA0, DEC0, _target(mu, pa))
    assert result["measured"] is not None, result["reason"]
    measured = result["measured"]
    assert abs(measured["mu"] - mu) < 0.5 * mu
    dpa = abs(((measured["pa_deg"] - pa + 180) % 360) - 180)
    assert dpa < 15.0
    assert measured["n_points"] == 6
    assert result["comparison"]["available"] is True


def test_short_baseline_returns_null():
    wcs = target_wcs(RA0, DEC0)
    mu, pa = 8.0, 277.36
    mjds = [60850.0, 60851.0, 60852.0]
    result = motion.measure_motion(_points(mu, pa, mjds), wcs, RA0, DEC0, _target(mu, pa))
    assert result["measured"] is None
    assert "linea base" in result["reason"] or "temporadas" in result["reason"]


def test_no_source_returns_null():
    wcs = target_wcs(RA0, DEC0)
    mu, pa = 8.0, 277.36
    blank = np.zeros((N_PIX, N_PIX)) + 1.0
    points = [
        {
            "det": det,
            "season": i,
            "mjd": mjd,
            "image": blank,
            "sigma": np.full_like(blank, 0.1),
            "mask": np.zeros_like(blank, dtype=bool),
        }
        for det in (1, 2)
        for i, mjd in enumerate([60850.0, 61030.0, 61210.0])
    ]
    result = motion.measure_motion(points, wcs, RA0, DEC0, _target(mu, pa))
    assert result["measured"] is None
    assert result["n_used"] == 0


def test_compare_to_expected_verdict():
    measured = {"mu": 8.0, "mu_err": 0.5, "pa_deg": 277.0, "pa_err_deg": 2.0}
    expected = {"mu": 8.2, "pa_deg": 277.4}
    cmp = motion.compare_to_expected(measured, expected)
    assert cmp["available"] is True
    assert math.isclose(cmp["sigma_mu"], 0.4, rel_tol=1e-6)
    assert "1 sigma" in cmp["verdict"]
