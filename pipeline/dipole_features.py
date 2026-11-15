"""Calcula metricas morfologicas en imagenes de diferencia (dipolo vs monopolo) para separar movimientos propios de estrellas variables."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np


DEFAULT_FIELDS: list[tuple[str, str, str]] = [
    ("barnard", "estrella", "data-sample/barnard"),
    ("epsindib", "enana marron", "data-new/epsindib"),
    ("wise0855", "enana marron", "data-new/wise0855"),
    ("rwaur", "variable", "data-new/rwaur"),
    ("rdra", "variable", "data-new/rdra"),
]


def compute_diff_features(
    field_dir: Path,
    radius_px: float = 10.0,
    bg_inner_px: float = 10.0,
    bg_outer_px: float = 22.0,
    snr_thresh: float = 2.0,
    min_max_snr: float = 4.0,
) -> list[dict[str, Any]]:
    """Calcula dipole_balance, peak_snr_balance y lobe_sep_px para cada diferencia de un campo."""
    manifest = json.loads((field_dir / "manifest.json").read_text(encoding="utf-8"))
    diffs_meta = manifest.get("diffs", [])
    n = len(diffs_meta)
    if n == 0:
        return []

    diffs = np.fromfile(field_dir / "diffs.bin", dtype=np.float32).reshape(n, 64, 64)
    sigs = np.fromfile(field_dir / "diffs_sig.bin", dtype=np.float32).reshape(n, 64, 64)

    yy, xx = np.mgrid[0:64, 0:64]
    r2 = (xx - 31.5) ** 2 + (yy - 31.5) ** 2
    ap = r2 <= radius_px ** 2
    ann = (r2 >= bg_inner_px ** 2) & (r2 <= bg_outer_px ** 2)

    records: list[dict[str, Any]] = []
    for k, meta in enumerate(diffs_meta):
        img = diffs[k]
        sig = sigs[k]

        bg_mask = ann & np.isfinite(img)
        bg = float(np.median(img[bg_mask])) if bg_mask.sum() >= 20 else 0.0
        img_sub = img - bg

        valid = ap & np.isfinite(img_sub) & np.isfinite(sig) & (sig > 0)
        if valid.sum() < 8:
            continue

        vals = img_sub[valid]
        svals = sig[valid]
        snr = vals / svals
        snr_pos = float(max(0.0, np.max(snr)))
        snr_neg = float(max(0.0, np.max(-snr)))
        max_snr = max(snr_pos, snr_neg)
        if max_snr < min_max_snr:
            continue

        f_pos = float(vals[snr > snr_thresh].sum())
        f_neg = float((-vals[snr < -snr_thresh]).sum())
        tot = f_pos + f_neg
        dipole_balance = (2.0 * min(f_pos, f_neg) / tot) if tot > 0 else 0.0
        peak_snr_balance = (min(snr_pos, snr_neg) / max_snr) if max_snr > 0 else 0.0

        snr_map = np.where(sig > 0, img_sub / np.where(sig > 0, sig, 1.0), 0.0)
        mpos = valid & (snr_map > snr_thresh)
        mneg = valid & (snr_map < -snr_thresh)
        if mpos.sum() > 0 and mneg.sum() > 0:
            wp = img_sub[mpos]
            wn = -img_sub[mneg]
            xp = float((xx[mpos] * wp).sum() / wp.sum())
            yp = float((yy[mpos] * wp).sum() / wp.sum())
            xn = float((xx[mneg] * wn).sum() / wn.sum())
            yn = float((yy[mneg] * wn).sum() / wn.sum())
            lobe_sep_px = float(np.hypot(xp - xn, yp - yn))
        else:
            lobe_sep_px = 0.0

        records.append({
            "det": int(meta["det"]),
            "a": int(meta["a"]),
            "b": int(meta["b"]),
            "max_snr": round(max_snr, 2),
            "dipole_balance": round(dipole_balance, 4),
            "peak_snr_balance": round(peak_snr_balance, 4),
            "lobe_sep_px": round(lobe_sep_px, 3),
        })
    return records


def summarize_fields(root: Path) -> list[dict[str, Any]]:
    """Resume la mediana y rango de las metricas por campo."""
    summary: list[dict[str, Any]] = []
    for fid, clase, rel in DEFAULT_FIELDS:
        recs = compute_diff_features(root / rel)
        if not recs:
            summary.append({"id": fid, "clase": clase, "n_diffs": 0})
            continue
        db = [r["dipole_balance"] for r in recs]
        pb = [r["peak_snr_balance"] for r in recs]
        ls = [r["lobe_sep_px"] for r in recs]
        summary.append({
            "id": fid,
            "clase": clase,
            "n_diffs": len(recs),
            "dipole_balance_median": round(float(np.median(db)), 3),
            "dipole_balance_min": round(float(min(db)), 3),
            "dipole_balance_max": round(float(max(db)), 3),
            "peak_snr_balance_median": round(float(np.median(pb)), 3),
            "peak_snr_balance_min": round(float(min(pb)), 3),
            "peak_snr_balance_max": round(float(max(pb)), 3),
            "lobe_sep_px_median": round(float(np.median(ls)), 2),
        })
    return summary


if __name__ == "__main__":
    repo_root = Path(__file__).resolve().parent.parent
    print(json.dumps(summarize_fields(repo_root), ensure_ascii=False, indent=2))
