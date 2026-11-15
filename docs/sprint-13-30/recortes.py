#!/usr/bin/env python3
"""Descarga recortes SPHEREx para los cuatro campos asignados.

Campos: R Draconis, RW Aurigae, WISE 0855 y epsilon Indi B.

Reglas del sprint:
- ~8 cuadros por detector y temporada.
- Reintentos con espera ante 5xx/timeout.
- 4 a 6 hilos en paralelo.
- Se quita el cubo EPSF antes de guardar.
- Los datos se guardan FUERA de git.
- Cada campo tiene su propio consultas.json con cada intento (hora, HTTP, bytes).

Los dos campos con movimiento propio alto (WISE 0855 y epsilon Indi B) llevan
la posicion del catalogo a la epoca de cada cuadro antes de pedir el recorte.
La consulta SIA sigue usando la posicion del catalogo: el campo de SPHEREx es
mucho mayor que el desplazamiento y la busqueda por POS devuelve las imagenes
que cubren esa zona. Lo que se centra por cuadro es el recorte.

La seleccion y las consultas SIA reutilizan funciones de cobertura.py. No se
usa nada del proyecto anterior. Si origin/Horacio llega a tener pipeline/, hay
que revisar su modulo de recortes antes de volver a ejecutar esto.
"""

import argparse
import bisect
import csv
import io
import json
import math
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

from cobertura import fetch_csv, mjd_to_date, seasons, sia_url

# Lista vigente de Horacio (commit 83c9607) y correcciones del sprint 18-20.
# epsilon Indi B queda en 331.044 / -56.783 y epsilon Indi A en 330.84 / -56.786;
# en este script solo entra B.
# pmRA*cosdec y pmdec en arcsec/anio. La epoca es la del sistema de referencia
# de la coordenada: J2000 (MJD 51544.5) o 2010.37 (MJD 55320.4) para WISE 0855.
OBJETOS = {
    "R Draconis": {"slug": "R_Draconis", "ra": 248.1674, "dec": 66.7550},
    "RW Aurigae": {"slug": "RW_Aurigae", "ra": 76.9561, "dec": 30.4012},
    "WISE 0855": {
        "slug": "WISE_0855", "ra": 133.7951, "dec": -7.2451,
        "epoca_mjd": 55320.4, "pmra_cosdec": -8.06, "pmdec": 0.70,
        "fuente_pm": "Luhman & Esplin 2014 (ApJL 786, L18); epoca 2010.37",
    },
    "epsilon Indi B": {
        "slug": "Epsilon_Indi_B", "ra": 331.0441, "dec": -56.7828,
        "epoca_mjd": 51544.5, "pmra_cosdec": 3.976, "pmdec": -2.500,
        "fuente_pm": "Gaia DR3 de epsilon Indi A (sistema comun); epoca J2000",
    },
}
COLECCIONES = ("spherex_dr1", "spherex_qr3")
DETECTOR_RE = re.compile(r"SPHEREx-(D\d)")
DEFAULT_OUT = Path.home() / "Documents" / "SPARKS-PROJECT-data" / "recortes"
REPO_ROOT = Path(__file__).resolve().parents[2]


def iso_now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def write_json(path: Path, obj) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding="utf-8")
    os.replace(tmp, path)


def parse_detector(row) -> str:
    m = DETECTOR_RE.search(row.get("energy_bandpassname", ""))
    return m.group(1) if m else ""


def season_bounds(rows):
    times = sorted({round(float(r["t_min"]), 4) for r in rows})
    bounds = []
    for a, b in zip(times, times[1:]):
        if b - a > 60:
            bounds.append((a + b) / 2)
    return bounds


def season_of(mjd: float, bounds) -> int:
    return bisect.bisect_right(bounds, mjd) + 1


def propagate(ra: float, dec: float, mjd: float, info):
    """Lleva la posicion del catalogo a la epoca de observacion (mjd).

    Devuelve la misma posicion si el objeto no tiene movimiento propio
    declarado. pmRA*cosdec se divide por cos(dec) para obtener el cambio en RA.
    """
    epoch = info.get("epoca_mjd")
    pmra = info.get("pmra_cosdec")
    pmdec = info.get("pmdec")
    if epoch is None or pmra is None or pmdec is None:
        return ra, dec
    years = (mjd - float(epoch)) / 365.25
    cosd = math.cos(math.radians(dec))
    if abs(cosd) < 1e-6:
        return ra, dec
    ra2 = (ra + (float(pmra) * years / 3600.0) / cosd) % 360.0
    dec2 = dec + float(pmdec) * years / 3600.0
    return ra2, dec2


def pick_evenly(rows, n: int):
    rows = sorted(rows, key=lambda r: (float(r["t_min"]), r.get("obs_id", "")))
    if len(rows) <= n:
        return rows
    if n == 1:
        return [rows[len(rows) // 2]]
    picked = []
    used = set()
    for i in range(n):
        j = round(i * (len(rows) - 1) / (n - 1))
        while j in used and j < len(rows) - 1:
            j += 1
        while j in used and j > 0:
            j -= 1
        used.add(j)
        picked.append(rows[j])
    return picked


def select_frames(nombre, info, frames, log, lock):
    ra, dec = info["ra"], info["dec"]
    rows = []
    for coll in COLECCIONES:
        url = sia_url(coll, ra, dec)
        t0 = time.monotonic()
        data, status, elapsed, err = fetch_csv(url, timeout=90, retries=2)
        entry = {
            "hora": iso_now(), "campo": nombre, "tipo": "sia",
            "coleccion": coll, "intento": 1, "url": url, "http": status,
            "filas": len(data) if not err else None,
            "segundos": round(time.monotonic() - t0, 3), "error": err,
        }
        with lock:
            log.append(entry)
        if err:
            raise RuntimeError(f"SIA {coll}: {err}")
        for r in data:
            r["_coleccion"] = coll
        rows.extend(data)
        print(f"  SIA {coll}: {len(data)} filas en {entry['segundos']} s", flush=True)

    bounds = season_bounds(rows)
    nseasons = len(bounds) + 1
    groups = {}
    for r in rows:
        det = parse_detector(r)
        if not det or not r.get("access_url"):
            continue
        s = season_of(float(r["t_min"]), bounds)
        groups.setdefault((s, det), []).append(r)

    selected = []
    for (s, det), items in sorted(groups.items()):
        # Evita contar dos veces la misma exposicion si SIA repite una fila.
        seen = set()
        uniq = []
        for r in items:
            key = r.get("obs_id", "")
            if key in seen:
                continue
            seen.add(key)
            uniq.append(r)
        chosen = pick_evenly(uniq, frames)
        for r in chosen:
            r["_temporada"] = s
            r["_detector"] = det
            r["_ra_centro"], r["_dec_centro"] = propagate(
                ra, dec, float(r["t_min"]), info
            )
            selected.append(r)
        print(f"  temporada {s} {det}: {len(uniq)} disponibles, {len(chosen)} elegidos", flush=True)

    return selected, nseasons, len(rows)


def card_value(raw: bytes):
    raw = raw.strip()
    if raw.startswith(b"'"):
        end = raw.find(b"'", 1)
        return raw[1:end].decode("ascii", "replace").strip()
    return raw.split(b"/")[0].strip().decode("ascii", "replace")


def split_hdus(data: bytes):
    hdus = []
    off = 0
    while off < len(data):
        i = off
        cards = {}
        extname = ""
        xtension = ""
        while True:
            card = data[i:i + 80]
            if len(card) < 80:
                raise ValueError("FITS truncado")
            key = card[:8].decode("ascii", "replace").strip()
            if key == "END":
                i += 80
                break
            if card[8:10] == b"= ":
                val = card_value(card[10:])
                cards[key] = val
                if key == "EXTNAME":
                    extname = val
                if key == "XTENSION":
                    xtension = val
            i += 80
        header_end = off + ((i - off + 2879) // 2880) * 2880
        naxis = int(cards.get("NAXIS", 0) or 0)
        n = 1
        for k in range(1, naxis + 1):
            n *= int(cards.get(f"NAXIS{k}", 0) or 0)
        bitpix = abs(int(cards.get("BITPIX", 8) or 8))
        pcount = int(cards.get("PCOUNT", 0) or 0)
        gcount = int(cards.get("GCOUNT", 1) or 1)
        if xtension.strip().upper() == "BINTABLE":
            nbytes = (n * bitpix // 8 + pcount) * gcount
        else:
            nbytes = ((n * bitpix + 7) // 8) * gcount + pcount
        data_end = header_end + ((nbytes + 2879) // 2880) * 2880
        hdus.append({
            "start": off, "end": data_end,
            "extname": extname.strip().upper(), "xtension": xtension.strip().upper(),
            "size": data_end - off,
        })
        off = data_end
    return hdus


def filter_epsf(data: bytes):
    hdus = split_hdus(data)
    kept, removed = [], []
    out = bytearray()
    for h in hdus:
        name = h["extname"] or "PRIMARY"
        if name == "EPSF" or "EPSF" in name:
            removed.append(name)
            continue
        out += data[h["start"]:h["end"]]
        kept.append(name)
    return bytes(out), kept, removed


def cutout_url(access_url: str, ra: float, dec: float, size: float) -> str:
    sep = "&" if "?" in access_url else "?"
    return f"{access_url}{sep}center={ra},{dec}d&size={size}&gzip=false"


def frame_path(out_root: Path, slug: str, row) -> Path:
    season = row["_temporada"]
    det = row["_detector"]
    obs_id = row.get("obs_id", "sin_obs_id")
    return out_root / slug / f"temporada_{season}" / det / f"{obs_id}_{det}.fits"


def download_one(nombre, slug, row, ra, dec, size, out_root, log, lock, max_attempts):
    season = row["_temporada"]
    det = row["_detector"]
    coll = row["_coleccion"]
    obs_id = row.get("obs_id", "sin_obs_id")
    cra = row.get("_ra_centro", ra)
    cdec = row.get("_dec_centro", dec)
    url = cutout_url(row["access_url"], cra, cdec, size)
    dest = frame_path(out_root, slug, row)
    rel = dest.relative_to(out_root)
    dest.parent.mkdir(parents=True, exist_ok=True)

    for attempt in range(1, max_attempts + 1):
        t0 = time.monotonic()
        status = 0
        raw = b""
        err = ""
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "sparks-recortes/1.0"}
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                status = resp.status
                raw = resp.read()
            if not raw.startswith(b"SIMPLE"):
                raise ValueError("la respuesta no empieza con SIMPLE (no es FITS)")
            filtered, kept, removed = filter_epsf(raw)
            tmp = dest.with_suffix(".fits.tmp")
            tmp.write_bytes(filtered)
            os.replace(tmp, dest)
            entry = {
                "hora": iso_now(), "campo": nombre, "tipo": "cutout",
                "temporada": season, "detector": det, "coleccion": coll,
                "obs_id": obs_id, "intento": attempt, "url": url,
                "centro_ra": round(cra, 6), "centro_dec": round(cdec, 6),
                "http": status, "bytes_descargados": len(raw),
                "bytes_guardados": len(filtered), "segundos": round(time.monotonic() - t0, 3),
                "archivo": str(rel), "hdus_conservados": kept,
                "hdus_eliminados": removed, "error": "", "ok": True,
            }
            with lock:
                log.append(entry)
            return True, entry
        except urllib.error.HTTPError as exc:
            status = exc.code
            try:
                raw = exc.read()
            except Exception:
                raw = b""
            err = f"HTTP {exc.code}: {raw[:160].decode('utf-8', 'replace').strip()}"
        except Exception as exc:
            err = f"{type(exc).__name__}: {exc}"

        entry = {
            "hora": iso_now(), "campo": nombre, "tipo": "cutout",
            "temporada": season, "detector": det, "coleccion": coll,
            "obs_id": obs_id, "intento": attempt, "url": url,
            "centro_ra": round(cra, 6), "centro_dec": round(cdec, 6),
            "http": status, "bytes_descargados": len(raw), "bytes_guardados": 0,
            "segundos": round(time.monotonic() - t0, 3), "archivo": "",
            "hdus_conservados": [], "hdus_eliminados": [], "error": err,
            "ok": False,
        }
        with lock:
            log.append(entry)
        retryable = not (400 <= status < 500 and status != 429)
        if attempt < max_attempts and retryable:
            wait = min(30, 3 * (2 ** (attempt - 1)))
            print(f"    reintento {attempt}/{max_attempts} en {wait}s: {obs_id} {det}: {err}", flush=True)
            time.sleep(wait)
        elif not retryable:
            print(f"    sin reintento (HTTP {status}): {obs_id} {det}", flush=True)
            break
    return False, entry


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default=str(DEFAULT_OUT), help="carpeta de datos fuera de git")
    ap.add_argument("--frames", type=int, default=8, help="cuadros por detector y temporada")
    ap.add_argument("--workers", type=int, default=6, help="hilos en paralelo (4 a 6)")
    ap.add_argument("--size", type=float, default=0.11, help="tamano del recorte en grados")
    ap.add_argument("--attempts", type=int, default=5, help="intentos por recorte")
    ap.add_argument("--solo-faltantes", action="store_true", help="no repetir archivos que ya existen")
    ap.add_argument("--objeto", action="append", choices=sorted(OBJETOS), help="solo este campo")
    args = ap.parse_args()

    out_root = Path(args.out).expanduser().resolve()
    if out_root.is_relative_to(REPO_ROOT):
        raise SystemExit(f"ERROR: {out_root} esta dentro del repositorio; usa una ruta fuera de git")
    if not (4 <= args.workers <= 6):
        raise SystemExit("ERROR: --workers debe estar entre 4 y 6")
    if not (1 <= args.frames <= 20):
        raise SystemExit("ERROR: --frames fuera de rango")
    out_root.mkdir(parents=True, exist_ok=True)

    nombres = args.objeto or sorted(OBJETOS)
    resumen_path = out_root / "resumen.json"
    resumen = json.loads(resumen_path.read_text(encoding="utf-8")) if resumen_path.exists() else {"campos": {}}
    resumen["generado"] = iso_now()
    resumen["salida"] = str(out_root)
    for nombre in nombres:
        info = OBJETOS[nombre]
        print(f"\n=== {nombre} ({info['ra']}, {info['dec']}) ===", flush=True)
        field_dir = out_root / info["slug"]
        field_dir.mkdir(parents=True, exist_ok=True)
        log_path = field_dir / "consultas.json"
        log = []
        if log_path.exists():
            log = json.loads(log_path.read_text(encoding="utf-8")).get("intentos", [])
        lock = threading.Lock()

        selected, nseasons, nrows = select_frames(
            nombre, info, args.frames, log, lock
        )
        seleccion = [{
            "temporada": r["_temporada"], "detector": r["_detector"],
            "coleccion": r["_coleccion"], "obs_id": r.get("obs_id", ""),
            "t_min": r.get("t_min", ""), "fecha": mjd_to_date(float(r["t_min"])).date().isoformat(),
            "centro_ra": round(r["_ra_centro"], 6),
            "centro_dec": round(r["_dec_centro"], 6),
            "access_url": r.get("access_url", ""),
        } for r in selected]
        write_json(field_dir / "seleccion.json", {
            "campo": nombre, "ra": info["ra"], "dec": info["dec"],
            "epoca_mjd": info.get("epoca_mjd"),
            "pmra_cosdec": info.get("pmra_cosdec"),
            "pmdec": info.get("pmdec"),
            "fuente_pm": info.get("fuente_pm", ""),
            "centro_propagado_por_cuadro": bool(info.get("epoca_mjd")),
            "temporadas": nseasons, "filas_sia": nrows,
            "cuadros_por_detector_temporada": args.frames,
            "seleccionados": len(seleccion), "frames": seleccion,
        })

        if args.solo_faltantes:
            antes = len(selected)
            selected = [r for r in selected if not frame_path(out_root, info["slug"], r).exists()]
            print(f"  faltantes: {len(selected)} de {antes}", flush=True)

        ok = 0
        fail = 0
        bytes_in = bytes_out = 0
        t0 = time.monotonic()
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = [
                pool.submit(
                    download_one, nombre, info["slug"], r, info["ra"], info["dec"],
                    args.size, out_root, log, lock, args.attempts,
                )
                for r in selected
            ]
            for fut in as_completed(futures):
                good, entry = fut.result()
                if good:
                    ok += 1
                    bytes_in += entry["bytes_descargados"]
                    bytes_out += entry["bytes_guardados"]
                else:
                    fail += 1
                print(
                    f"  [{ok+fail:3d}/{len(selected)}] "
                    f"{'ok' if good else 'FALLO'} {entry['temporada']}-{entry['detector']} "
                    f"{entry['obs_id']} http={entry['http']} "
                    f"{entry['bytes_guardados']/1024:.0f} kB",
                    flush=True,
                )
        elapsed = time.monotonic() - t0

        # Se reescribe al final con todos los intentos, en orden cronologico.
        log.sort(key=lambda x: (x["hora"], x.get("obs_id", ""), x.get("detector", ""), x.get("intento", 0)))
        write_json(log_path, {
            "campo": nombre, "ra": info["ra"], "dec": info["dec"],
            "generado": iso_now(), "intentos": log,
        })

        # Cuenta el estado real en disco, no solo la corrida de ahora.
        presentes = len(list(field_dir.rglob("*.fits")))
        total = len(seleccion)
        previo = resumen["campos"].get(nombre, {})
        segundos_previos = float(previo.get("segundos_acumulados", 0) or 0)
        corridas = int(previo.get("corridas", 0) or 0) + 1
        bytes_desc = sum(x.get("bytes_descargados", 0) for x in log if x.get("tipo") == "cutout" and x.get("ok"))
        bytes_saved = sum(x.get("bytes_guardados", 0) for x in log if x.get("tipo") == "cutout" and x.get("ok"))
        resumen["campos"][nombre] = {
            "temporadas": nseasons, "filas_sia": nrows,
            "seleccionados": total, "archivos_presentes": presentes,
            "descargados": presentes, "fallidos": total - presentes,
            "intentos_registrados": len(log), "bytes_descargados": bytes_desc,
            "bytes_guardados": bytes_saved,
            "segundos_acumulados": round(segundos_previos + elapsed, 1),
            "segundos_ultima_corrida": round(elapsed, 1),
            "corridas": corridas,
            "carpeta": str(field_dir),
        }
        print(
            f"  RESULTADO {nombre}: {presentes}/{total} archivos presentes, "
            f"{total-presentes} faltan; esta corrida bajo {bytes_in/1e6:.1f} MB y guardo "
            f"{bytes_out/1e6:.1f} MB en {elapsed/60:.1f} min",
            flush=True,
        )

    write_json(resumen_path, resumen)
    print(f"\nResumen: {resumen_path}")
    return 0 if all(v["fallidos"] == 0 for v in resumen["campos"].values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
