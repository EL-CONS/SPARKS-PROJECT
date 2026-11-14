#!/bin/bash
# Tasks B/C/D/F: one field per array index, from data already in data/cache (no internet needed).
# Submit with:  N=$(python -c "import json;d=json.load(open('fields.json'));print(len(d.get('fields',d))-1)")
#               sbatch --array=0-$N%20 --export=FIELDS=fields.json docs/team/yuca/process_array.sbatch
#SBATCH --job-name=sparks-field
#SBATCH --partition=CONFIRMAR
#SBATCH --cpus-per-task=2
#SBATCH --mem=4G
#SBATCH --time=01:00:00
#SBATCH --output=logs/%x-%A_%a.out
set -euo pipefail
cd "$HOME/sparks"
mkdir -p logs
.venv/bin/python scripts/process_field_list.py "${FIELDS:-fields.json}" --index "$SLURM_ARRAY_TASK_ID"
