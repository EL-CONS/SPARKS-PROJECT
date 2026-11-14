#!/usr/bin/env python3
"""Cobertura de SPHEREx por objeto (servicio SIA de IRSA; ruta /SIA).

Lee una lista de objetos con columnas nombre,ra_deg,dec_deg y consulta, para
cada uno, cuantas imagenes hay en las colecciones de SPHEREx. Calcula las
temporadas agrupando las fechas de observacion con un corte de 60 dias.

Uso:
    python3 cobertura.py [entrada.csv] [salida.csv]

Por defecto lee verdad-terreno.csv y escribe cobertura.csv en esta carpeta.
No usa dependencias externas: solo la biblioteca estandar.

Notas de honestidad:
- Una consulta que falla se marca vacia ("") y con nota; no se escribe 0,
  porque 0 significaria "la coleccion no tiene imagenes de ese objeto".
- QR2 ya no se indexa para busqueda: se consulta con un tiempo corto y se
  espera 0 filas. Un 0 no significa que los archivos no existan.
"""

import csv
import json
import ssl
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE = "https://irsa.ipac.caltech.edu/SIA"
RADIUS_DEG = 0.0005          # 1.8 arcsec; el mismo radio usado en sprint-12-1
SEASON_GAP_DAYS = 60         # corte entre temporadas (las campanas distan ~3-6 meses)
TIMEOUT_S = 12
RETRIES = 1
MAX_WORKERS = 8

COLLECTIONS = ["spherex_qr2", "spherex_dr1", "spherex_qr3"]
# QR2 responde vacio o se cuelga; no vale la pena esperarlo.
TIMEOUT_BY = {"spherex_qr2": 5}
RETRIES_BY = {"spherex_qr2": 0}

HEADER = [
    "objeto", "ra_deg", "dec_deg",
    "imagenes_qr2", "imagenes_qr3", "temporadas",
    "fecha_consulta", "hora_consulta",
    "imagenes_dr1", "imagenes_total", "temporadas_qr3", "temporadas_dr1", "nota",
]


def sia_url(collection: str, ra: float, dec: float) -> str:
    pos = f"circle+{ra}+{dec}+{RADIUS_DEG}"
    return f"{BASE}?COLLECTION={collection}&POS={pos}&RESPONSEFORMAT=CSV"


def fetch_csv(url: str, timeout: float = TIMEOUT_S, retries: int = RETRIES):
    """Devuelve (filas, estado, segundos, error). Reintenta ante fallos de red."""
    last_err = ""
    elapsed = 0.0
    for attempt in range(retries + 1):
        t0 = time.monotonic()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "sparks-cobertura/1.0"})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
                elapsed = time.monotonic() - t0
                rows = list(csv.DictReader(raw.splitlines()))
                return rows, resp.status, elapsed, ""
        except urllib.error.HTTPError as exc:
            last_err = f"HTTP {exc.code}"
            elapsed = time.monotonic() - t0
            if exc.code < 500:
                return [], exc.code, elapsed, last_err
        except (urllib.error.URLError, TimeoutError, ssl.SSLError, OSError) as exc:
            last_err = f"{type(exc).__name__}: {exc}"
            elapsed = time.monotonic() - t0
        if attempt < retries:
            time.sleep(1.0 * (attempt + 1))
    return [], 0, elapsed, last_err


def mjd_to_date(mjd: float) -> datetime:
    return datetime(1858, 11, 17, tzinfo=timezone.utc) + timedelta(days=mjd)


def seasons(dates_mjd, gap_days: int = SEASON_GAP_DAYS) -> int:
    """Cuenta bloques separados por mas de gap_days entre observaciones."""
    days = sorted({round(float(m), 4) for m in dates_mjd})
    if not days:
        return 0
    count = 1
    for prev, cur in zip(days, days[1:]):
        if cur - prev > gap_days:
            count += 1
    return count


def query_object(obj, log):
    name = obj["nombre"].strip()
    ra = float(obj["ra_deg"])
    dec = float(obj["dec_deg"])
    result = {"nombre": name, "ra": ra, "dec": dec, "data": {}}
    for coll in COLLECTIONS:
        url = sia_url(coll, ra, dec)
        rows, status, elapsed, err = fetch_csv(
            url,
            timeout=TIMEOUT_BY.get(coll, TIMEOUT_S),
            retries=RETRIES_BY.get(coll, RETRIES),
        )
        log.append({
            "objeto": name, "coleccion": coll, "url": url, "http": status,
            "filas": len(rows) if not err else None, "segundos": round(elapsed, 3),
            "error": err, "hora": datetime.now().astimezone().isoformat(timespec="seconds"),
        })
        result["data"][coll] = {
            "count": None if err else len(rows),
            "tmins": [float(r["t_min"]) for r in rows if r.get("t_min")],
            "error": err,
        }
    return result


def retry_failures(results, log):
    """Segunda pasada, secuencial, solo para las consultas que fallaron."""
    for res in results:
        for coll, info in res["data"].items():
            if info["error"]:
                url = sia_url(coll, res["ra"], res["dec"])
                rows, status, elapsed, err = fetch_csv(url, timeout=25, retries=1)
                log.append({
                    "objeto": res["nombre"], "coleccion": coll, "url": url,
                    "http": status, "filas": len(rows) if not err else None,
                    "segundos": round(elapsed, 3), "error": err,
                    "hora": datetime.now().astimezone().isoformat(timespec="seconds"),
                    "reintento": True,
                })
                if not err:
                    res["data"][coll] = {
                        "count": len(rows),
                        "tmins": [float(r["t_min"]) for r in rows if r.get("t_min")],
                        "error": "",
                    }


def build_row(res):
    d = res["data"]
    n_qr2, n_dr1, n_qr3 = (d[c]["count"] for c in COLLECTIONS)
    combined = d["spherex_dr1"]["tmins"] + d["spherex_qr3"]["tmins"]
    n_seasons = seasons(combined)

    notes = []
    if d["spherex_qr2"]["error"]:
        notes.append("QR2: error de red")
    elif n_qr2 == 0:
        notes.append("QR2: 0 filas en SIA (no indexado)")
    if combined:
        first = mjd_to_date(min(combined)).date().isoformat()
        last = mjd_to_date(max(combined)).date().isoformat()
        notes.append(f"{first} a {last}")
    else:
        notes.append("sin cobertura en DR1/QR3")
    for coll, label in (("spherex_dr1", "DR1"), ("spherex_qr3", "QR3")):
        if d[coll]["error"]:
            notes.append(f"{label}: error de red, sin verificar")

    total = None
    if n_dr1 is not None and n_qr3 is not None:
        total = n_dr1 + n_qr3
    now = datetime.now().astimezone()
    blank = lambda v: "" if v is None else v
    return {
        "objeto": res["nombre"],
        "ra_deg": res["ra"],
        "dec_deg": res["dec"],
        "imagenes_qr2": blank(n_qr2),
        "imagenes_qr3": blank(n_qr3),
        "temporadas": n_seasons,
        "fecha_consulta": now.date().isoformat(),
        "hora_consulta": now.strftime("%H:%M:%S %Z"),
        "imagenes_dr1": blank(n_dr1),
        "imagenes_total": blank(total),
        "temporadas_qr3": seasons(d["spherex_qr3"]["tmins"]),
        "temporadas_dr1": seasons(d["spherex_dr1"]["tmins"]),
        "nota": "; ".join(notes),
    }


def main() -> int:
    here = Path(__file__).resolve().parent
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else here / "verdad-terreno.csv"
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else here / "cobertura.csv"

    with src.open(newline="", encoding="utf-8") as fh:
        objects = list(csv.DictReader(fh))

    log = []
    results = [None] * len(objects)
    t0 = time.monotonic()
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(query_object, obj, log): i for i, obj in enumerate(objects)}
        for fut in as_completed(futures):
            i = futures[fut]
            results[i] = fut.result()
            r = results[i]
            d = r["data"]
            print(f"[{i+1:2d}/{len(objects)}] {r['nombre'][:30]:30s} "
                  f"dr1={d['spherex_dr1']['count']} qr3={d['spherex_qr3']['count']}",
                  flush=True)

    retry_failures(results, log)
    rows = [build_row(r) for r in results]

    with dst.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=HEADER)
        writer.writeheader()
        writer.writerows(rows)

    with (here / "consultas.json").open("w", encoding="utf-8") as fh:
        json.dump(log, fh, ensure_ascii=False, indent=1)

    with_two = sum(1 for r in rows if r["temporadas"] >= 2)
    failed = [r["objeto"] for r in rows if "sin verificar" in r["nota"]]
    print(f"\nEscrito {dst} en {time.monotonic()-t0:.0f}s")
    print(f"Objetos con >=2 temporadas: {with_two}/{len(rows)}")
    if failed:
        print("Con consultas sin verificar:", ", ".join(failed))
    print(f"Consultas registradas: {len(log)} -> {here / 'consultas.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
