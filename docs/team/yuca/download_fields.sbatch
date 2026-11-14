#!/bin/bash
# Task A: download (and process) a list of fields ONCE, sequentially, gentle with IRSA.
# Needs internet on the node that runs it. [CONFIRMAR] if compute nodes have it; if not,
# run the python line directly on the login/transfer node instead of sbatch.
#SBATCH --job-name=sparks-download
#SBATCH --partition=CONFIRMAR
#SBATCH --cpus-per-task=4
#SBATCH --mem=8G
#SBATCH --time=24:00:00
#SBATCH --output=logs/%x-%j.out
set -euo pipefail
cd "$HOME/sparks"
mkdir -p logs
# one field after another; inside each field the pipeline uses 6 parallel requests (do not raise it)
.venv/bin/python scripts/process_field_list.py "${FIELDS:-fields.json}"
