#!/bin/bash
# One-time environment setup on Yuca. [CONFIRMAR] module names and whether uv is allowed.
# Run on the login node (needs internet for pip/uv).
set -euo pipefail
# module load python/3.12        # [CONFIRMAR] name of the Python module, if any
cd "$HOME/sparks"                # [CONFIRMAR] where the repo is cloned
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync                          # creates .venv with the exact versions of uv.lock
.venv/bin/python -c "import astropy, reproject, lightgbm; print('ok', astropy.__version__)"
