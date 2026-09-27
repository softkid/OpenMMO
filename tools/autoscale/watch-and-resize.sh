#!/usr/bin/env bash
# tools/autoscale/watch-and-resize.sh — samples the server's memory and
# concurrent-connection count on a timer; if either crosses a threshold,
# resizes the VM up a tier via the cloud provider's API. See doc/SCALING.md
# for why this is vertical (one bigger box), not horizontal (more boxes) —
# this server is a single stateful process holding the whole world, so it
# cannot simply be load-balanced across copies.
#
# SAFE BY DEFAULT: DRY_RUN=true unless you explicitly set DRY_RUN=false.
# A resize means poweroff -> change_type -> poweron: real downtime, on a
# real server, that costs real money. Watch the dry-run log output for a
# while before trusting it to act unattended.
#
# The resize_up() function below is Hetzner Cloud's API as one concrete
# example (docs.hetzner.cloud/reference/cloud) — swap it for your provider's
# equivalent (DigitalOcean's `droplets/{id}/actions` with type "resize", AWS's
# ModifyInstanceAttribute + a stop/start, ...). Verify the exact current
# request shape against your provider's docs before relying on this; APIs
# drift and this comment can't chase every provider's changelog.
set -euo pipefail

# ---- what to watch -----------------------------------------------------
CONTAINER="${CONTAINER:-openmmo-server-1}"
WS_PORT="${WS_PORT:-10006}"
MEM_LIMIT_MIB="${MEM_LIMIT_MIB:?set to the VM total RAM in MiB, e.g. 2048}"
MEM_THRESHOLD_PCT="${MEM_THRESHOLD_PCT:-80}"
CONN_THRESHOLD="${CONN_THRESHOLD:-150}"
CHECK_INTERVAL_SECS="${CHECK_INTERVAL_SECS:-60}"
COOLDOWN_SECS="${COOLDOWN_SECS:-1800}"
LOG_FILE="${LOG_FILE:-/var/log/openmmo-autoscale.log}"

# ---- what to do about it (Hetzner example) ------------------------------
DRY_RUN="${DRY_RUN:-true}"
HCLOUD_TOKEN="${HCLOUD_TOKEN:-}"
HCLOUD_SERVER_ID="${HCLOUD_SERVER_ID:-}"
# Ordered ladder: next_tier() below just steps to the next entry. Edit to
# match what you actually want to pay for — this file does not know your
# budget.
TIER_LADDER=(cx22 cx32 cx42 cx52)

log() { echo "$(date -Iseconds) $*" | tee -a "$LOG_FILE"; }

current_mem_mib() {
  # docker stats prints e.g. "134.2MiB / 2GiB" — MiB or GiB depending on
  # scale, so normalize both to MiB.
  docker stats "$CONTAINER" --no-stream --format '{{.MemUsage}}' \
    | awk -F'/' '{
        v=$1; gsub(/ /,"",v);
        if (v ~ /GiB$/) { gsub(/GiB/,"",v); printf "%.0f", v*1024 }
        else { gsub(/MiB/,"",v); printf "%.0f", v }
      }'
}

current_conn_count() {
  # Established TCP connections on the game port — a coarse but zero-code
  # proxy for concurrent players until doc/SCALING.md's proposed /api/metrics
  # endpoint exists. Overcounts slightly (a player with a flaky connection
  # can hold two sockets briefly); good enough for a threshold check.
  ss -tn state established "( dport = :$WS_PORT or sport = :$WS_PORT )" 2>/dev/null \
    | tail -n +2 | wc -l
}

next_tier() {
  local current="$1"
  for i in "${!TIER_LADDER[@]}"; do
    if [[ "${TIER_LADDER[$i]}" == "$current" ]]; then
      local next_idx=$((i + 1))
      if [[ $next_idx -lt ${#TIER_LADDER[@]} ]]; then
        echo "${TIER_LADDER[$next_idx]}"
        return 0
      fi
      log "Already at the top of TIER_LADDER (${current}) — nothing to grow into."
      return 1
    fi
  done
  log "WARNING: current server_type not found in TIER_LADDER — can't compute next tier."
  return 1
}

hetzner_current_type() {
  curl -fsS -H "Authorization: Bearer ${HCLOUD_TOKEN}" \
    "https://api.hetzner.cloud/v1/servers/${HCLOUD_SERVER_ID}" \
    | grep -o '"name":"[a-z0-9]*"' | head -1 | cut -d'"' -f4
}

# poweroff -> change_type -> poweron. Hetzner's documented flow for a type
# change that isn't upgrade-only-more-cores-live (docs.hetzner.cloud);
# verify against current docs before trusting this unattended.
resize_up() {
  local to_type="$1"
  if [[ "$DRY_RUN" == "true" ]]; then
    log "[DRY RUN] Would resize ${HCLOUD_SERVER_ID} -> ${to_type} (poweroff/change_type/poweron)"
    return 0
  fi
  log "Resizing ${HCLOUD_SERVER_ID} -> ${to_type}..."
  curl -fsS -X POST -H "Authorization: Bearer ${HCLOUD_TOKEN}" \
    "https://api.hetzner.cloud/v1/servers/${HCLOUD_SERVER_ID}/actions/poweroff" >/dev/null
  sleep 10
  curl -fsS -X POST -H "Authorization: Bearer ${HCLOUD_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"server_type\":\"${to_type}\",\"upgrade_disk\":false}" \
    "https://api.hetzner.cloud/v1/servers/${HCLOUD_SERVER_ID}/actions/change_type" >/dev/null
  sleep 10
  curl -fsS -X POST -H "Authorization: Bearer ${HCLOUD_TOKEN}" \
    "https://api.hetzner.cloud/v1/servers/${HCLOUD_SERVER_ID}/actions/poweron" >/dev/null
  log "Resize to ${to_type} requested. Give it a couple minutes, then re-check docker stats."
}

last_action=0
log "Starting: mem limit ${MEM_LIMIT_MIB}MiB @ ${MEM_THRESHOLD_PCT}% threshold, conn threshold ${CONN_THRESHOLD}, DRY_RUN=${DRY_RUN}"

while true; do
  mem_mib="$(current_mem_mib || echo 0)"
  conns="$(current_conn_count || echo 0)"
  mem_pct=$(( mem_mib * 100 / MEM_LIMIT_MIB ))
  log "mem=${mem_mib}MiB (${mem_pct}%) conns=${conns}"

  now=$(date +%s)
  since_last=$(( now - last_action ))

  if { [[ $mem_pct -ge $MEM_THRESHOLD_PCT ]] || [[ $conns -ge $CONN_THRESHOLD ]]; } \
     && [[ $since_last -ge $COOLDOWN_SECS ]]; then
    log "Threshold crossed (mem=${mem_pct}% conns=${conns}) and cooldown elapsed — considering resize."
    if [[ -n "$HCLOUD_TOKEN" && -n "$HCLOUD_SERVER_ID" ]]; then
      current_type="$(hetzner_current_type || echo "")"
      if [[ -n "$current_type" ]]; then
        if target_type="$(next_tier "$current_type")"; then
          resize_up "$target_type"
          last_action=$now
        fi
      else
        log "Could not read current server_type from Hetzner API — skipping this cycle."
      fi
    else
      log "HCLOUD_TOKEN/HCLOUD_SERVER_ID not set — logging only, no provider call made."
    fi
  elif { [[ $mem_pct -ge $MEM_THRESHOLD_PCT ]] || [[ $conns -ge $CONN_THRESHOLD ]]; }; then
    log "Threshold crossed but still in cooldown (${since_last}s / ${COOLDOWN_SECS}s) — skipping."
  fi

  sleep "$CHECK_INTERVAL_SECS"
done
