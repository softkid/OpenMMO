#!/bin/sh
# Fills an empty terrain volume, then exits. Compose runs this as a one-shot
# `terrain-init` service that the server waits on.
#
# Timing note: a bake costs ~3 minutes almost regardless of region range,
# because erosion and road generation simulate the whole 32x32 km world before
# any tiles are written. The range only controls disk usage — see the floor
# computed below, not the old "~65 MB/region" guess this comment used to
# have (never verified against anything; doc/REFACTOR_2026-09.md has the
# correction).
set -eu

. /usr/local/bin/entrypoint-lib.sh

TERRAIN_DIR="${TERRAIN_DIR:-/terrain}"
REGION_MIN="${TERRAIN_REGION_MIN:--2}"
REGION_MAX="${TERRAIN_REGION_MAX:-1}"
SEED_ZONES=/opt/openmmo/seed/terrain/zones

mkdir -p "$TERRAIN_DIR"

seed_zones() {
    # Zone files carry town no-spawn areas and monster spawn rectangles. They
    # are tracked in git and terrain-gen never writes them, so without this the
    # world bakes fine but monsters spawn inside towns.
    seed_into "$SEED_ZONES" "$TERRAIN_DIR/zones"
    chown -R openmmo:openmmo "$TERRAIN_DIR/zones"
}

# Pulls one integer field out of worldgen.json's "baked_region_range" object.
# No jq in this image (deliberately — one small, predictable, self-authored
# JSON shape doesn't justify the dependency); this format is written by our
# own build_worldgen_json in tools/terrain-gen/src/bake.rs, pretty-printed by
# serde_json, so grep+sed on a known shape is fine. Prints nothing (not an
# error) if the field can't be found — callers treat that as "can't verify".
worldgen_region_field() {
    grep -A5 '"baked_region_range"' "$TERRAIN_DIR/worldgen.json" 2>/dev/null \
        | grep "\"$1\"" | sed 's/[^0-9-]//g'
}

# worldgen.json is written last, so its presence means a bake ran to
# completion. A half-finished bake leaves tiles but no marker and is redone
# on next start. On top of that: also rebake if the *region range actually
# baked* doesn't match what's configured now — otherwise changing
# TERRAIN_REGION_MIN/MAX and restarting silently does nothing, which is
# exactly what happened before this check existed (doc/REFACTOR_2026-09.md).
if [ -f "$TERRAIN_DIR/worldgen.json" ] && [ -z "${TERRAIN_FORCE_BAKE:-}" ]; then
    baked_x_min="$(worldgen_region_field x_min)"
    baked_x_max="$(worldgen_region_field x_max)"
    baked_z_min="$(worldgen_region_field z_min)"
    baked_z_max="$(worldgen_region_field z_max)"
    if [ -n "$baked_x_min" ] && [ -n "$baked_x_max" ] \
        && [ -n "$baked_z_min" ] && [ -n "$baked_z_max" ] \
        && [ "$baked_x_min" = "$REGION_MIN" ] && [ "$baked_x_max" = "$REGION_MAX" ] \
        && [ "$baked_z_min" = "$REGION_MIN" ] && [ "$baked_z_max" = "$REGION_MAX" ]; then
        echo "terrain-init: worldgen.json present and covers the configured region ${REGION_MIN}..${REGION_MAX}, skipping bake"
        seed_zones
        own_volume "$TERRAIN_DIR"
        exit 0
    fi
    echo "terrain-init: worldgen.json present but baked region (x ${baked_x_min:-?}..${baked_x_max:-?}, z ${baked_z_min:-?}..${baked_z_max:-?}) doesn't match configured region (${REGION_MIN}..${REGION_MAX}) — rebaking"
fi

echo "terrain-init: baking regions ${REGION_MIN}..${REGION_MAX} on both axes"
echo "terrain-init: this takes about 3 minutes; global simulation dominates"

# doc/TERRAIN_GENERATION.md: the full 32x32 km world is region range
# -16..15 on both axes (32x32 regions, 262,144 tiles). Height+splat alone
# (65+16KB/tile per doc/MAP_DESIGN.md) floors that at ~6.5GB; tree/grass
# binaries (Phase 8) add more, by an amount that varies with terrain content
# — measure with `du -sh data/terrain` after a real bake rather than trusting
# any single quoted number, this one included. This compose file's default
# (TERRAIN_REGION_MIN/MAX, -2..1) is a 4x4-region *development* patch picked
# to keep a first `docker compose up` fast and light on disk — about 1.5% of
# the documented full world by area. Shipped as-is to players,
# movement/pathing/auto-chase all behave correctly *inside* that small patch
# and then hit unbaked terrain at its edge, which looks like broken movement,
# not like "you reached the edge of what was baked". Leaving this warning
# here beats a quiet CSV-footnote nobody reads at deploy time.
if [ "$REGION_MIN" -ge -4 ] && [ "$REGION_MAX" -le 3 ]; then
    echo "terrain-init: WARNING — this region range covers a small patch, not"
    echo "terrain-init:   the documented full 32x32 km world (doc/TERRAIN_GENERATION.md"
    echo "terrain-init:   section 5.1: full world is -16..15). Fine for local dev; for a"
    echo "terrain-init:   real deployment, set TERRAIN_REGION_MIN/TERRAIN_REGION_MAX wider."
fi

# Pre-flight disk check: fail loudly *before* a ~3+ minute bake rather than
# mid-write. Required-space estimate scales the measured 24,834 bytes/tile
# (height+splat; see the comment above) by tile count in the requested range,
# x3 as a deliberately rough safety margin for tree/grass data this script
# can't size exactly, plus a flat 1GB pad. This is a floor-plus-margin guess,
# not a promise — `du -sh "$TERRAIN_DIR"` after a bake is the real number.
region_span() {
    # Inclusive region count on one axis: max - min + 1.
    echo $(( $2 - $1 + 1 ))
}
x_regions=$(region_span "$REGION_MIN" "$REGION_MAX")
z_regions=$(region_span "$REGION_MIN" "$REGION_MAX")
tile_count=$(( x_regions * z_regions * 256 ))
required_kb=$(( tile_count * 25 * 3 + 1024 * 1024 ))
available_kb=$(df -Pk "$TERRAIN_DIR" | tail -1 | awk '{print $4}')
if [ -n "$available_kb" ] && [ "$available_kb" -lt "$required_kb" ]; then
    required_gb=$(( (required_kb + 1024 * 1024 - 1) / 1024 / 1024 ))
    available_gb=$(( available_kb / 1024 / 1024 ))
    echo "terrain-init: ERROR — only ~${available_gb}GB free on ${TERRAIN_DIR}'s filesystem," >&2
    echo "terrain-init:   this bake's rough estimate needs at least ~${required_gb}GB. Refusing" >&2
    echo "terrain-init:   to start a multi-minute bake that's likely to run out of disk" >&2
    echo "terrain-init:   partway through. Free up space, shrink TERRAIN_REGION_MIN/MAX, or" >&2
    echo "terrain-init:   set TERRAIN_SKIP_DISK_CHECK=1 to bake anyway." >&2
    if [ -z "${TERRAIN_SKIP_DISK_CHECK:-}" ]; then
        exit 1
    fi
    echo "terrain-init: TERRAIN_SKIP_DISK_CHECK set, proceeding despite the estimate above."
fi

terrain-gen bake \
    --out "$TERRAIN_DIR" \
    --region-x-min "$REGION_MIN" \
    --region-x-max "$REGION_MAX" \
    --region-z-min "$REGION_MIN" \
    --region-z-max "$REGION_MAX"

seed_zones
# The bake ran as root and rewrote the tree, so own_volume's fast path
# would wrongly skip.
chown -R openmmo:openmmo "$TERRAIN_DIR"
echo "terrain-init: done"
