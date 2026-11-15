"""HTTP client with retries and per-attempt logging.

IRSA intermittently responds with 502 from the team's network. Each request is
retried with exponential backoff, logging the URL, timestamp and result so
``metodo.md`` can cite the evidence.
"""

from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

USER_AGENT = "sparks-pipeline/0.1 (NASA Space Apps; contacto: equipo EL-CONS)"
# Cap on the wait between retries, in seconds. At 1.6^13 the last attempt of
# a 14-try streak would wait 8 minutes; the service recovers sooner.
MAX_BACKOFF_S = 10.0


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


@dataclass
class Attempt:
    url: str
    method: str
    attempt: int
    status: int | None
    bytes: int
    seconds: float
    error: str | None
    utc: str = field(default_factory=utc_now)

    def as_dict(self) -> dict[str, Any]:
        return {
            "url": self.url,
            "method": self.method,
            "attempt": self.attempt,
            "status": self.status,
            "bytes": self.bytes,
            "seconds": round(self.seconds, 3),
            "error": self.error,
            "utc": self.utc,
        }


class HttpClient:
    def __init__(
        self,
        *,
        retries: int = 6,
        backoff: float = 1.5,
        timeout: float = 120.0,
        log_path: Path | None = None,
    ) -> None:
        self.retries = retries
        self.backoff = backoff
        self.timeout = timeout
        self.log_path = log_path
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})
        self.attempts: list[Attempt] = []

    def _log(self, attempt: Attempt) -> None:
        self.attempts.append(attempt)

    def request(
        self,
        method: str,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
        stream: bool = False,
    ) -> requests.Response:
        last: Exception | None = None
        for i in range(1, self.retries + 1):
            t0 = time.time()
            try:
                r = self.session.request(
                    method,
                    url,
                    params=params,
                    data=data,
                    timeout=self.timeout,
                    stream=stream,
                )
                elapsed = time.time() - t0
                ok = 200 <= r.status_code < 300
                self._log(
                    Attempt(
                        url=r.url,
                        method=method,
                        attempt=i,
                        status=r.status_code,
                        bytes=len(r.content) if not stream else int(r.headers.get("content-length", 0) or 0),
                        seconds=elapsed,
                        error=None if ok else r.text[:160].replace("\n", " "),
                    )
                )
                if ok:
                    return r
                # 4xx other than 429 do not improve on retry.
                if 400 <= r.status_code < 500 and r.status_code != 429:
                    r.raise_for_status()
            except Exception as exc:  # noqa: BLE001
                elapsed = time.time() - t0
                self._log(
                    Attempt(
                        url=url,
                        method=method,
                        attempt=i,
                        status=None,
                        bytes=0,
                        seconds=elapsed,
                        error=f"{type(exc).__name__}: {exc}",
                    )
                )
                last = exc
            # Wait grows exponentially but is capped: without a cap, 14 retries
            # at 1.6^n add up to hours and block the run.
            time.sleep(min(self.backoff ** (i - 1), MAX_BACKOFF_S))
        if last is not None:
            raise last
        raise RuntimeError(f"sin respuesta para {url}")

    def get(self, url: str, **kwargs: Any) -> requests.Response:
        return self.request("GET", url, **kwargs)

    def post(self, url: str, **kwargs: Any) -> requests.Response:
        return self.request("POST", url, **kwargs)

    def tap(self, query: str, *, fmt: str = "json") -> dict[str, Any]:
        r = self.post(TAP_SYNC, data={"QUERY": query, "FORMAT": fmt})
        return r.json()

    def write_log(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = [a.as_dict() for a in self.attempts]
        path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


TAP_SYNC = "https://irsa.ipac.caltech.edu/TAP/sync"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()
