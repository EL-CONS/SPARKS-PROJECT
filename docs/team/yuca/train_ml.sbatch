#!/bin/bash
# Task C (final step): build the injection sets and train. Development + validation fields only.
#SBATCH --job-name=sparks-train
#SBATCH --partition=CONFIRMAR
#SBATCH --cpus-per-task=8
#SBATCH --mem=16G
#SBATCH --time=12:00:00
#SBATCH --output=logs/%x-%j.out
set -euo pipefail
cd "$HOME/sparks"
mkdir -p logs
.venv/bin/python scripts/train_ml.py --rebuild
