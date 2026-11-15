"""Parsing of VOTable (XML) responses and nested JSON returned by IRSA TAP.

IRSA TAP with ``FORMAT=json`` does not return ``{metadata, data}``, but a tree
``{"VOTABLE": {"RESOURCE_ARRAY": [{"TABLE": {"FIELD_ARRAY": ..., "DATA": ...}}]}}``.
SIA2 returns standard VOTable XML, but astropy renames columns to ``ID``
(``col_0``, ``col_1``...) instead of ``name``. Here we preserve the real
``name``.
"""

from __future__ import annotations

import io
import json
from typing import Any
from xml.etree import ElementTree as ET

import numpy as np
from astropy.io.votable import parse as parse_votable
from astropy.table import Table


def _strip_ns(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _py(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, np.ma.core.MaskedConstant):
        return None
    if isinstance(value, np.generic):
        value = value.item()
    if isinstance(value, bytes):
        return value.decode("utf-8", "replace").strip()
    if isinstance(value, str):
        return value.strip()
    return value


def parse_json_votable(payload: str | bytes | dict) -> list[dict[str, Any]]:
    if isinstance(payload, (str, bytes)):
        payload = json.loads(payload)
    vot = payload.get("VOTABLE", payload)
    resources = vot.get("RESOURCE_ARRAY") or []
    rows: list[dict[str, Any]] = []
    for res in resources:
        table = res.get("TABLE")
        if not table:
            continue
        fields = [f.get("<xmlattr>", f) for f in table.get("FIELD_ARRAY", [])]
        names = [f.get("name") for f in fields]
        data = table.get("DATA", {})
        tab = data.get("TABLEDATA") or []
        for row in tab:
            rows.append(dict(zip(names, row)))
    return rows


def parse_votable_xml(payload: str | bytes) -> list[dict[str, Any]]:
    if isinstance(payload, str):
        payload = payload.encode("utf-8")
    root = ET.parse(io.BytesIO(payload)).getroot()
    for elem in root.iter():
        if _strip_ns(elem.tag) == "INFO" and elem.get("name") == "QUERY_STATUS":
            if (elem.get("value") or "").upper() != "OK":
                raise RuntimeError(f"VOTable QUERY_STATUS={elem.get('value')}: {elem.text}")
    rows: list[dict[str, Any]] = []
    for table in root.iter():
        if _strip_ns(table.tag) != "TABLE":
            continue
        names: list[str] = []
        for field in table:
            if _strip_ns(field.tag) == "FIELD":
                names.append(field.get("name"))
        for data in table:
            if _strip_ns(data.tag) != "DATA":
                continue
            for tabledata in data:
                if _strip_ns(tabledata.tag) != "TABLEDATA":
                    continue
                for tr in tabledata:
                    if _strip_ns(tr.tag) != "TR":
                        continue
                    vals = []
                    for td in tr:
                        vals.append((td.text or "").strip())
                    rows.append(dict(zip(names, vals)))
    return rows


def parse(payload: str | bytes) -> list[dict[str, Any]]:
    text = payload.decode("utf-8", "replace") if isinstance(payload, bytes) else payload
    stripped = text.lstrip()
    if stripped.startswith("{"):
        return parse_json_votable(stripped)
    if stripped.startswith("<"):
        return parse_votable_xml(stripped)
    raise ValueError(f"respuesta no reconocida: {stripped[:120]}")


def parse_sia_columns(payload: bytes | str) -> dict[str, list[Any]]:
    """Read a full SIA2 response and return columns keyed by their real name.

    Uses astropy because a 60 MB response with 35,000 rows is too slow for
    ``ElementTree``. Picks the table with the most rows (the results table;
    the metadata table has zero).
    """
    if isinstance(payload, str):
        payload = payload.encode("utf-8")
    vot = parse_votable(io.BytesIO(payload), verify="ignore")
    best = None
    best_rows = -1
    for table in vot.iter_tables():
        n = len(table.array)
        if n > best_rows:
            best = table
            best_rows = n
    if best is None or best_rows <= 0:
        return {}
    arr = best.array
    names = list(arr.dtype.names or ())
    out: dict[str, list[Any]] = {}
    for field in best.fields:
        key = field.ID if field.ID in names else field.name
        if key not in names:
            continue
        col = arr[key]
        if isinstance(col, np.ma.MaskedArray):
            col = col.filled(None)
        out[field.name] = [_py(v) for v in col]
    return out


def to_table(rows: list[dict[str, Any]]) -> Table:
    if not rows:
        return Table()
    keys = list(rows[0].keys())
    return Table(rows=[tuple(r.get(k) for k in keys) for r in rows], names=keys)
