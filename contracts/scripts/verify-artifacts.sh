#!/usr/bin/env bash
# Fails CI if contracts/managed/ doesn't actually contain compiled output
# for every contract in src/. This exists so a compile step that exits 0
# without producing real artifacts (e.g. a misconfigured toolchain) can't
# silently pass CI — see docs/submission-checklist.md and the CI workflow's
# "Compile Compact contracts" step, which must not be allowed to skip.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
OUT_DIR="$ROOT_DIR/managed"

missing=()
for src in "$SRC_DIR"/*.compact; do
  name="$(basename "$src" .compact)"
  if [ ! -d "$OUT_DIR/$name" ] || [ -z "$(ls -A "$OUT_DIR/$name" 2>/dev/null)" ]; then
    missing+=("$name")
  fi
done

if [ "${#missing[@]}" -ne 0 ]; then
  echo "ERROR: missing/empty compiled artifacts for: ${missing[*]}" >&2
  echo "Expected non-empty directories under $OUT_DIR for each contract in $SRC_DIR." >&2
  exit 1
fi

echo "All $(ls "$SRC_DIR"/*.compact | wc -l | tr -d ' ') contract(s) have compiled artifacts in $OUT_DIR."
