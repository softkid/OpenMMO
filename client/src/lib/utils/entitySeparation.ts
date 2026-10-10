export interface Vec3Like {
  x: number
  y: number
  z: number
}

/**
 * Visual-only nudge for doc/REFACTOR_2026-09.md's "몹/NPC와 부딪혀도 그림이
 * 겹침" fix: if `target` is closer to `viewer` than `minDistance` on the X/Z
 * ground plane, returns `target` pushed straight out to exactly
 * `minDistance` along the line between them (Y is left untouched — this
 * separates footprints, not heights). Returns `null` when no adjustment is
 * needed, so the caller can keep reusing the original position object
 * unchanged (see `GameSceneMonstersLayer.svelte`'s `displayPosition`
 * comment on why that matters for render perf — a fresh object every frame
 * for every idle monster pushes a needless pose update into three.js).
 *
 * This only ever adjusts what gets drawn. `target`'s real,
 * server-authoritative position is never touched, and nothing computed here
 * feeds back into range checks, hit detection, pathing, or anything else
 * gameplay logic reads — see the caller for where that distinction is
 * enforced.
 *
 * Degenerate case: `viewer` and `target` at the exact same X/Z (direction
 * undefined) pushes along +X — arbitrary, but deterministic and finite
 * rather than dividing by zero.
 */
export function separateOnGroundPlane(
  viewer: Vec3Like,
  target: Vec3Like,
  minDistance: number
): Vec3Like | null {
  const dx = target.x - viewer.x
  const dz = target.z - viewer.z
  const distSq = dx * dx + dz * dz
  const minDistSq = minDistance * minDistance
  if (distSq >= minDistSq) return null

  const dist = Math.sqrt(distSq)
  if (dist < 1e-6) {
    return { ...target, x: viewer.x + minDistance, z: viewer.z }
  }
  const scale = minDistance / dist
  return {
    ...target,
    x: viewer.x + dx * scale,
    z: viewer.z + dz * scale,
  }
}
