#!/usr/bin/env bash
# tools/loadtest/measure.sh — ramps loadtest bots against a running `server`
# container while sampling its memory at each plateau, so you get measured
# bytes-per-connection instead of a guess. See doc/SCALING.md.
#
# Usage:
#   NPC_TOKEN=... CONTAINER=openmmo-server-1 ./tools/loadtest/measure.sh
#
# Requires: the server already running (docker compose up -d), and
# `cargo run -p loadtest` buildable (build it once ahead of time with
# `cargo build --release -p loadtest` if the box is memory-constrained —
# see doc/SCALING.md's build-vs-run note before running this ON the same
# small VM you're trying to measure).
set -euo pipefail

CONTAINER="${CONTAINER:-openmmo-server-1}"
URL="${URL:-ws://127.0.0.1:10006}"
NPC_TOKEN="${NPC_TOKEN:?set NPC_TOKEN to match the server NPC_AUTH_TOKEN value}"
COUNT="${COUNT:-100}"
STEP="${STEP:-10}"
INTERVAL="${INTERVAL:-8}"
OUT="${OUT:-rss_vs_connections.csv}"
LOADTEST_BIN="${LOADTEST_BIN:-cargo run --release -p loadtest --}"

# docker stats prints e.g. "134.2MiB / 2GiB" — keep just the used side.
sample_mem() {
  docker stats "$CONTAINER" --no-stream --format '{{.MemUsage}}' \
    | awk -F'/' '{gsub(/ /,"",$1); print $1}'
}

echo "bots,server_mem,unix_time" > "$OUT"
echo "Baseline (0 bots): $(sample_mem)"
echo "0,$(sample_mem),$(date +%s)" >> "$OUT"

# A FIFO, not a `cmd | while read` pipeline: piping would background the
# *reader* under `&`, and `$!` would then track the reader's PID instead of
# the loadtest binary's — `kill` on cleanup would miss the real process.
FIFO="$(mktemp -u)"
mkfifo "$FIFO"
cleanup() {
  kill "$LOADTEST_PID" 2>/dev/null || true
  rm -f "$FIFO"
}
trap cleanup INT TERM EXIT

# shellcheck disable=SC2086
$LOADTEST_BIN \
  --url "$URL" --npc-token "$NPC_TOKEN" \
  --count "$COUNT" --ramp-step "$STEP" --ramp-interval-secs "$INTERVAL" \
  --hold-secs 0 \
  > "$FIFO" 2>&1 &
LOADTEST_PID=$!

# The loadtest binary prints `READY <n>` to stdout at every ramp plateau —
# read that instead of guessing sleep timings, so a sample is always taken
# right after that many bots actually finished logging in.
while read -r line; do
  echo "$line"
  case "$line" in
    READY\ *)
      n="${line#READY }"
      mem="$(sample_mem)"
      echo "$n,$mem,$(date +%s)" >> "$OUT"
      echo "  -> $n bots, server mem: $mem"
      ;;
  esac
done < "$FIFO"

wait "$LOADTEST_PID" 2>/dev/null || true
echo
echo "Done. Samples written to $OUT — plot server_mem against bots to read"
echo "off the baseline (0 bots) and the slope (memory per player)."
