import type { MonsterData } from '../../types/Monster'
import type { Position } from '../../utils/movementUtils'
import { shortestWrappedDeltaX } from '../../terrain/world-wrap'

export const AUTO_HUNT_RADIUS_METERS = 20

export interface AutoHuntTarget {
  id: string
  position: Position
  distance: number
}

export function findAutoHuntTarget(
  from: Position,
  floor: number,
  monsters: Iterable<MonsterData>,
  isBlocked: (to: Position) => boolean,
  radius = AUTO_HUNT_RADIUS_METERS
): AutoHuntTarget | null {
  let best: AutoHuntTarget | null = null
  for (const m of monsters) {
    if (m.state === 'dead' || m.isDeadPending) continue
    if ((m.floorLevel ?? 0) !== floor) continue
    const dx = shortestWrappedDeltaX(from.x, m.position.x)
    const dz = m.position.z - from.z
    const distance = Math.hypot(dx, dz)
    if (distance > radius || (best && distance >= best.distance)) continue
    if (isBlocked(m.position)) continue
    best = { id: m.id, position: m.position, distance }
  }
  return best
}
