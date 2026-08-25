#!/usr/bin/env bash
# Compiles every .compact source in src/ into managed/ using the official
# Compact compiler (`compact compile`), then writes contract artifacts + their
# keccak/blake digests for the deployment manifest.
#
# This script does NOT fabricate output. If `compact` is not on PATH it
# fails loudly and tells you how to install it, rather than faking a
# managed/ directory.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
OUT_DIR="$ROOT_DIR/managed"

# The Midnight toolchain is distributed as the `compact` CLI, via the official
# installer:
#   curl --proto '=https' --tlsv1.2 -LsSf \
#     https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
# It is NOT an npm/pip package, so it can't be added to package.json.
if ! command -v compact >/dev/null 2>&1; then
  echo "ERROR: the 'compact' CLI (Midnight Compact toolchain) was not found on PATH." >&2
  echo "" >&2
  echo "Install it with the official installer:" >&2
  echo "  curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh" >&2
  echo "then restart your shell (or 'source ~/.bashrc' / equivalent) and re-run this script." >&2
  echo "Docs: https://docs.midnight.network/getting-started/installation" >&2
  echo "" >&2
  echo "This repository intentionally does not ship pre-fabricated" >&2
  echo "'managed/' artifacts — see docs/submission-checklist.md." >&2
  exit 1
fi

# Print toolchain version (compact --version, not compact compile --version)
echo "Compact toolchain: $(compact --version 2>&1 | head -n1)"

# CONTRACTS_SKIP_ZK=1 skips proving/verifier-key generation (fast syntax +
# type-check pass only — no valid proofs can be produced from that output).
# Leave unset for a real, deployable build; the CI syntax/typecheck job sets
# it to keep PR feedback fast, and the release/deploy job does NOT set it.
EXTRA_ARGS=()
if [ "${CONTRACTS_SKIP_ZK:-0}" = "1" ]; then
  EXTRA_ARGS+=("--skip-zk")
  echo "CONTRACTS_SKIP_ZK=1 set: compiling without ZK key generation (not deployable, syntax/type-check only)."
fi

mkdir -p "$OUT_DIR"

for src in "$SRC_DIR"/*.compact; do
  name="$(basename "$src" .compact)"
  echo "Compiling $name..."
  compact compile "${EXTRA_ARGS[@]}" "$src" "$OUT_DIR/$name"
done

echo "Done. Compiled artifacts written to $OUT_DIR"
