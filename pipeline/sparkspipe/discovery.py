"""Discovery of SPHEREx images covering a sky position.

Route that works from the team's network (verified 2026-11-14): IRSA SIA2
with ``POS=CIRCLE ra dec radius`` and without ``COLLECTION`` or ``MAXREC``.
With those two parameters the service returns an empty table or metadata only;
without them it returns the images overlapping the position. The response is
tens of MB and takes ~30-100 s, so it is cached in ``pipeline/_work/``.

Synchronous and asynchronous TAP routes were tested and documented as failed
in ``docs/pipeline/metodo.md``: sync returns 502 or hangs, and async leaves
the job QUEUED for hours.
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import numpy as np
import requests
from astropy.time import Time

from . import votable
from .config import (
    RELEASES,
    SEASON_GAP_DAYS,
    SIA_RADII_DEG,
    SIA_RADIUS_DEG,
    SIA_URL,
    Target,
    work_root,
)
from .http import HttpClient, utc_now

MJD_EPOCH = datetime(1858, 11, 17, tzinfo=timezone.utc)


@dataclass
class ImageRecord:
    uri: str
    access_url: str
    planeid: int | None
    mjd: float
    bandpass: str
    det: int | None
    lam_um: float | None
    dlam_um: float | None
    release: str
    collection: str
    obs_id: str
    season: int | None = None
    raw: dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "uri": self.uri,
            "access_url": self.access_url,
            "planeid": self.planeid,
            "mjd": self.mjd,
            "bandpass": self.bandpass,
            "det": self.det,
            "lam_um": self.lam_um,
            "dlam_um": self.dlam_um,
            "release": self.release,
            "collection": self.collection,
            "obs_id": self.obs_id,
            "season": self.season,
        }


def mjd_to_iso(mjd: float) -> str:
    try:
        return (MJD_EPOCH + timedelta(days=float(mjd))).strftime("%Y-%m-%d %H:%M")
    except Exception:  # noqa: BLE001
        return ""


def mjd_to_date(mjd: float) -> str:
    return mjd_to_iso(mjd)[:10]


def _to_float(value: Any) -> float | None:
    try:
        if value is None or value == "":
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value: Any) -> int | None:
    try:
        if value is None or value == "":
            return None
        return int(float(value))
    except (TypeError, ValueError):
        return None


def det_from_url(url: str) -> int | None:
    match = re.search(r"_(\d)D(\d)_spx", url)
    if match:
        return int(match.group(2))
    match = re.search(r"/(\d)/level2_.*?D(\d)_spx", url)
    if match:
        return int(match.group(2))
    match = re.search(r"D(\d)", Path(url.split("?")[0]).name)
    return int(match.group(1)) if match else None


def release_from_collection(collection: str | None, url: str = "") -> str:
    text = f"{collection or ''} {url}".lower()
    if "qr3" in text:
        return "QR3"
    if "qr2" in text:
        return "QR2"
    if "dr1" in text:
        return "DR1"
    return "desconocido"


def processing_version(url: str) -> str:
    match = re.search(r"(l2b(?:[_-]retry)?-v\d+)", url)
    return match.group(1) if match else ""


def season_of_mjd(mjd: float, seasons: list[dict[str, Any]]) -> int | None:
    for season in seasons:
        if season["mjd_min"] <= mjd <= season["mjd_max"]:
            return int(season["id"])
    return None


def assign_seasons(records: list[ImageRecord], *, gap_days: float = SEASON_GAP_DAYS) -> list[dict[str, Any]]:
    """Group MJDs into seasons separated by gaps larger than ``gap_days``."""
    if not records:
        return []
    times = np.array(sorted({round(float(r.mjd), 6) for r in records if r.mjd > 0}))
    if times.size == 0:
        return []
    groups: list[list[float]] = [[float(times[0])]]
    for t in times[1:]:
        if t - groups[-1][-1] > gap_days:
            groups.append([float(t)])
        else:
            groups[-1].append(float(t))
    seasons: list[dict[str, Any]] = []
    for i, group in enumerate(groups):
        members = [r for r in records if season_of_mjd(r.mjd, [
            {"id": i, "mjd_min": min(group), "mjd_max": max(group)}
        ]) is not None]
        for r in members:
            r.season = i
        seasons.append(
            {
                "id": i,
                "mjd_min": float(min(group)),
                "mjd_max": float(max(group)),
                "mjd_mean": float(np.mean(group)),
                "start": mjd_to_date(min(group)),
                "end": mjd_to_date(max(group)),
                "n_frames": len(members),
                "releases": sorted({r.release.lower() for r in members}),
            }
        )
    return seasons


def select_frames(
    records: list[ImageRecord],
    *,
    cap_per_det_season: int,
    full_detectors: tuple[int, ...] = (),
) -> list[ImageRecord]:
    """Pick up to ``cap`` frames per (detector, season), spread out in time.

    ``full_detectors`` are downloaded in full: used when the target is only
    measurable in those bands and the rest serve as supporting photometry.
    """
    groups: dict[tuple[int, int], list[ImageRecord]] = {}
    for r in records:
        if r.det is None or r.season is None:
            continue
        groups.setdefault((r.det, r.season), []).append(r)
    selected: list[ImageRecord] = []
    for key in sorted(groups):
        items = sorted(groups[key], key=lambda x: x.mjd)
        cap = len(items) if key[0] in full_detectors else cap_per_det_season
        if len(items) <= cap:
            selected.extend(items)
            continue
        idx = np.linspace(0, len(items) - 1, cap)
        idx = sorted({int(round(i)) for i in idx})
        selected.extend(items[i] for i in idx)
    selected.sort(key=lambda x: (x.mjd, x.det or 0))
    for i, r in enumerate(selected):
        r.raw["selected_index"] = i
    return selected


def _query_sia(
    h: HttpClient,
    target: Target,
    radius_deg: float,
    dest: Path,
    *,
    position: tuple[float, float] | None = None,
    retries: int = 4,
    timeout: float = 420.0,
) -> dict[str, list[Any]]:
    """Download a SIA2 response and cache it. Returns columns by name."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    ra, dec = position or target.coord
    params = {
        "POS": f"CIRCLE {ra:.7f} {dec:.7f} {radius_deg:.5f}",
        "RESPONSEFORMAT": "votable",
    }
    # Reuse an already-downloaded response: it is tens of MB and takes minutes.
    # Only delete manually if you want to re-run the query.
    if dest.exists() and dest.stat().st_size > 1_000_000:
        cols = votable.parse_sia_columns(dest.read_bytes())
        if cols:
            return cols
    last: Exception | None = None
    for attempt in range(1, retries + 1):
        t0 = time.time()
        try:
            r = h.session.get(SIA_URL, params=params, timeout=timeout, stream=True)
            status = r.status_code
            if status != 200:
                last = RuntimeError(f"SIA {status}: {r.text[:180]}")
                time.sleep(min(60.0, 4.0 * attempt))
                continue
            n = 0
            with dest.open("wb") as fh:
                for chunk in r.iter_content(1 << 20):
                    if chunk:
                        fh.write(chunk)
                        n += len(chunk)
            elapsed = time.time() - t0
            if n < 1024:
                last = RuntimeError(f"SIA devolvio {n} bytes")
                time.sleep(4.0 * attempt)
                continue
            # Usage errors also arrive with HTTP 200; detect them from the body.
            if n < 200_000:
                head = dest.read_bytes()[:200_000].decode("utf-8", "replace")
                if 'QUERY_STATUS" value="ERROR"' in head:
                    raise RuntimeError(f"SIA error: {head[:500]}")
            cols = votable.parse_sia_columns(dest.read_bytes())
            h.attempts.append(
                _attempt(SIA_URL + "?" + "&".join(f"{k}={v}" for k, v in params.items()), status, n, elapsed)
            )
            return cols
        except Exception as exc:  # noqa: BLE001
            last = exc
            h.attempts.append(
                _attempt(
                    SIA_URL + "?" + "&".join(f"{k}={v}" for k, v in params.items()),
                    None,
                    0,
                    time.time() - t0,
                    f"{type(exc).__name__}: {exc}",
                )
            )
            time.sleep(min(60.0, 4.0 * attempt))
    raise RuntimeError(f"SIA fallo para {target.id} radio {radius_deg}: {last}")


def _attempt(url: str, status: int | None, nbytes: int, seconds: float, error: str | None = None):
    from .http import Attempt

    return Attempt(
        url=url,
        method="GET",
        attempt=1,
        status=status,
        bytes=nbytes,
        seconds=seconds,
        error=error,
    )


def _records_from_columns(
    cols: dict[str, list[Any]],
    target: Target,
) -> list[ImageRecord]:
    if not cols:
        return []
    n = len(next(iter(cols.values())))
    records: list[ImageRecord] = []
    seen: set[tuple[str, int | None]] = set()
    for i in range(n):
        collection = str(cols.get("obs_collection", [""] * n)[i] or "")
        dptype = str(cols.get("dataproduct_type", [""] * n)[i] or "")
        if "spherex" not in collection.lower():
            continue
        if dptype and dptype.lower() != "image":
            continue
        url = str(cols.get("access_url", [""] * n)[i] or "")
        if not url or "cube" in url.lower() or not url.lower().endswith(".fits"):
            continue
        det = det_from_url(url)
        if det is None:
            continue
        obs_id = str(cols.get("obs_id", [""] * n)[i] or "")
        key = (obs_id, det)
        if key in seen:
            continue
        seen.add(key)
        t_min = _to_float(cols.get("t_min", [None] * n)[i]) or 0.0
        em_min = _to_float(cols.get("em_min", [None] * n)[i])
        em_max = _to_float(cols.get("em_max", [None] * n)[i])
        lam = (em_min + em_max) / 2.0 * 1e6 if em_min is not None and em_max is not None else None
        dlam = (em_max - em_min) * 1e6 if em_min is not None and em_max is not None else None
        bandpass = str(cols.get("energy_bandpassname", [""] * n)[i] or "") or f"SPHEREx-D{det}"
        release = release_from_collection(collection, url)
        records.append(
            ImageRecord(
                uri=url.split("irsa.ipac.caltech.edu/")[-1],
                access_url=url,
                planeid=None,
                mjd=t_min,
                bandpass=bandpass,
                det=det,
                lam_um=lam,
                dlam_um=dlam,
                release=release,
                collection=collection,
                obs_id=obs_id,
                raw={
                    "s_ra": _to_float(cols.get("s_ra", [None] * n)[i]),
                    "s_dec": _to_float(cols.get("s_dec", [None] * n)[i]),
                    "s_fov": _to_float(cols.get("s_fov", [None] * n)[i]),
                    "t_max": _to_float(cols.get("t_max", [None] * n)[i]),
                    "calib_level": _to_int(cols.get("calib_level", [None] * n)[i]),
                    "obs_publisher_did": str(cols.get("obs_publisher_did", [""] * n)[i] or ""),
                },
            )
        )
    records.sort(key=lambda r: (r.mjd, r.det or 0))
    return records


def discover(
    h: HttpClient,
    target: Target,
    *,
    out_dir: Path | None = None,
    radii: tuple[float, ...] = SIA_RADII_DEG,
    position: tuple[float, float] | None = None,
) -> tuple[list[ImageRecord], list[dict[str, Any]], list[dict[str, Any]]]:
    """Return (images, seasons, trace)."""
    out_dir = out_dir or (work_root() / target.id)
    out_dir.mkdir(parents=True, exist_ok=True)
    trace: list[dict[str, Any]] = []
    records: list[ImageRecord] = []
    for radius in radii:
        dest = out_dir / f"sia_r{radius:.3f}.xml"
        t0 = time.time()
        try:
            cols = _query_sia(h, target, radius, dest, position=position)
            found = _records_from_columns(cols, target)
            trace.append(
                {
                    "path": "sia2",
                    "radius_deg": radius,
                    "status": "ok" if found else "empty",
                    "rows_total": len(next(iter(cols.values()))) if cols else 0,
                    "rows_spherex": len(found),
                    "file": str(dest.relative_to(out_dir.parents[1])) if dest.is_relative_to(out_dir.parents[1]) else str(dest),
                    "bytes": dest.stat().st_size if dest.exists() else 0,
                    "seconds": round(time.time() - t0, 1),
                    "utc": utc_now(),
                }
            )
            if found:
                records = found
                break
        except Exception as exc:  # noqa: BLE001
            trace.append(
                {
                    "path": "sia2",
                    "radius_deg": radius,
                    "status": "error",
                    "detail": f"{type(exc).__name__}: {exc}",
                    "seconds": round(time.time() - t0, 1),
                    "utc": utc_now(),
                }
            )
    seasons = assign_seasons(records)
    for r in records:
        if r.season is None:
            r.season = season_of_mjd(r.mjd, seasons)
    return records, seasons, trace


def cutout_url(access_url: str, ra: float, dec: float, size_deg: float) -> str:
    sep = "&" if "?" in access_url else "?"
    return f"{access_url}{sep}center={ra:.6f},{dec:.6f}d&size={size_deg:.4f}"


def release_summary(records: list[ImageRecord]) -> list[dict[str, Any]]:
    by_release: dict[str, dict[str, Any]] = {}
    for r in records:
        item = by_release.setdefault(
            r.release,
            {"release": r.release, "collection": r.collection, "n_frames": 0, "versions": set()},
        )
        item["n_frames"] += 1
        version = processing_version(r.access_url)
        if version:
            item["versions"].add(version)
    out = []
    for release, item in sorted(by_release.items()):
        meta = next((x for x in RELEASES if x["release"] == release), None)
        out.append(
            {
                "collection": item["collection"],
                "release": release,
                "doi": meta["doi"] if meta else None,
                "doi_url": meta["url"] if meta else None,
                "n_frames": item["n_frames"],
                "versions": sorted(item["versions"]),
            }
        )
    return out
