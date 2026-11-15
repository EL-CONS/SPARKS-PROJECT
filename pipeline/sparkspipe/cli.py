"""Command-line interface for the pipeline.

    python -m sparkspipe discover wise0855
    python -m sparkspipe run all --cap 12 --workers 3
    python -m sparkspipe verify data-new/wise0855
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from . import binfmt
from .config import FRAME_CAP_PER_DET_SEASON, MAX_WORKERS, TARGETS, TARGET_BY_ID
from .discovery import discover
from .http import HttpClient
from .run import run_target


def _select(ids: list[str]):
    if not ids or ids == ["all"]:
        return list(TARGETS)
    out = []
    for name in ids:
        target = TARGET_BY_ID.get(name)
        if target is None:
            raise SystemExit(f"objetivo desconocido: {name}. Opciones: {', '.join(TARGET_BY_ID)}")
        out.append(target)
    return out


def cmd_discover(args: argparse.Namespace) -> int:
    for target in _select(args.targets):
        client = HttpClient(retries=4, backoff=2.0, timeout=420.0)
        ra, dec = target.position_at(args.reference_mjd)
        print(f"[{target.id}] SIA2 en {ra:.5f} {dec:.5f}", flush=True)
        t0 = time.time()
        records, seasons, trace = discover(client, target, position=(ra, dec))
        print(
            f"[{target.id}] {len(records)} imagenes, {len(seasons)} temporadas, "
            f"{time.time() - t0:.0f} s",
            flush=True,
        )
        print(json.dumps(trace, indent=1, ensure_ascii=False), flush=True)
    return 0


def cmd_run(args: argparse.Namespace) -> int:
    from .config import REFERENCE_MJD

    for target in _select(args.targets):
        summary = run_target(
            target,
            cap=args.cap,
            workers=args.workers,
            limit=args.limit,
            reuse_only=args.reuse_only,
            verbose=not args.quiet,
        )
        print(json.dumps({k: summary[k] for k in ("target", "status", "blockers") if k in summary},
                         indent=1, ensure_ascii=False), flush=True)
    return 0


def cmd_verify(args: argparse.Namespace) -> int:
    folder = Path(args.folder)
    result = binfmt.verify_barnard(folder)
    print(json.dumps(result, indent=1, ensure_ascii=False))
    return 0 if result.get("all_ok") else 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="sparkspipe", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("discover", help="query SIA2 only and save the response")
    p.add_argument("targets", nargs="*", default=["all"])
    p.add_argument("--reference-mjd", type=float, default=61000.0)
    p.set_defaults(func=cmd_discover)

    p = sub.add_parser("run", help="full pipeline for a target")
    p.add_argument("targets", nargs="*", default=["all"])
    p.add_argument("--cap", type=int, default=FRAME_CAP_PER_DET_SEASON,
                   help="maximum frames per detector and season")
    p.add_argument("--workers", type=int, default=MAX_WORKERS)
    p.add_argument("--limit", type=int, default=None, help="test: process only N frames")
    p.add_argument(
        "--reuse-only",
        action="store_true",
        help="do not download: use only cached cutouts in _work and count the rest as failed",
    )
    p.add_argument("--quiet", action="store_true")
    p.set_defaults(func=cmd_run)

    p = sub.add_parser("verify", help="check shapes and dtypes of a data folder")
    p.add_argument("folder")
    p.set_defaults(func=cmd_verify)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
