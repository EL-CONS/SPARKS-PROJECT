"""Prepara las imágenes de la presentación desde los datos del repositorio.

- Copia tal cual los PNG de suma (coadd) que usa la app: no se retocan.
- Pinta las restas desde diffs.bin y diffs_sig.bin con el mismo mapa que la app
  (paintDiff y diffColor de app/src/ui/sky.ts: azul = antes, ámbar = ahora,
  ±8 sigma a color completo, curva ^1.5, negro donde no hay dato).
Solo usa la biblioteca estándar. Uso: python3 docs/pitch/presentacion/hacer-assets.py
"""
import json, shutil, struct, zlib
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / "assets"
N = 64
BEFORE, NIGHT, NOW = (98, 182, 232), (14, 17, 22), (255, 178, 56)
DIFF_CLIP = 8.0


def color(t):
    a = min(1.0, abs(t)) ** 1.5
    to = BEFORE if t < 0 else NOW
    return tuple(round(NIGHT[k] + (to[k] - NIGHT[k]) * a) for k in range(3))


def png(path, rows):
    raw = b"".join(b"\x00" + bytes(v for px in row for v in px) for row in rows)
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", N, N, 8, 2, 0, 0, 0))
    data += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(data)


def resta(campo, det, a, b, nombre):
    d = RAIZ / campo
    m = json.loads((d / "manifest.json").read_text(encoding="utf-8"))
    e = next(x for x in m["diffs"] if x["det"] == det and x["a"] == a and x["b"] == b)
    off = e["i"] * N * N * 4
    dif = (d / "diffs.bin").read_bytes()[off:off + N * N * 4]
    sig = (d / "diffs_sig.bin").read_bytes()[off:off + N * N * 4]
    dv = struct.unpack(f"<{N*N}f", dif)
    sv = struct.unpack(f"<{N*N}f", sig)
    rows = []
    for y in range(N):
        row = []
        for x in range(N):
            p = (N - 1 - y) * N + x  # mismo volteo vertical que paintDiff
            v, s = dv[p], sv[p]
            if v != v or s != s or s <= 0:
                row.append((0, 0, 0))
            else:
                row.append(color(max(-1.0, min(1.0, v / s / DIFF_CLIP))))
        rows.append(row)
    png(OUT / nombre, rows)


OUT.mkdir(exist_ok=True)
for campo, archivos in {
    "data-sample/barnard/png": ["coadd_D2_S0.png", "coadd_D2_S2.png"],
    "data-new/wise0855/png": ["coadd_D1_S2.png", "coadd_D6_S0.png", "coadd_D6_S2.png"],
}.items():
    pref = campo.split("/")[1]
    for f in archivos:
        shutil.copyfile(RAIZ / campo / f, OUT / f"{pref}-{f}")
resta("data-sample/barnard", 2, 0, 2, "barnard-resta_D2_S0_S2.png")
resta("data-new/wise0855", 6, 0, 2, "wise0855-resta_D6_S0_S2.png")
for f in ["symbol.svg", "symbol-animated.svg", "logo-horizontal.svg"]:
    shutil.copyfile(RAIZ / "Logo" / f, OUT / f)
shutil.copyfile(RAIZ / "app/src/ui/assets/spaceapps/spaceapps-color-white.svg", OUT / "spaceapps-color-white.svg")
print("listo:", sorted(p.name for p in OUT.iterdir()))
