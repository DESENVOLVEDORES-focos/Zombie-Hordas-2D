#!/usr/bin/env bash
# Teste headless da simulação (mapas, pathfinding, hordas, zumbis, construção, loja).
# Uso: bash scripts/run-headless.sh [--ascii]
set -e
cd "$(dirname "$0")/.."
npx esbuild scripts/headless.ts --bundle --platform=node --format=esm --outfile=/tmp/headless.mjs --log-level=error
node /tmp/headless.mjs "$@"
