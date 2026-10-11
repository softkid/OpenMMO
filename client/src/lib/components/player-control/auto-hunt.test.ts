import { describe, expect, it } from 'vitest'
import type { MonsterData } from '../../types/Monster'
import { findAutoHuntTarget } from './auto-hunt'

const mk = (id: string, x: number, extra: Partial<MonsterData> = {}) =>
  ({ id, state: 'idle', position: { x, y: 0, z: 0 }, ...extra }) as MonsterData

describe('findAutoHuntTarget', () => {
  const origin = { x: 0, y: 0, z: 0 }

  it('picks the nearest live monster on the same floor', () => {
    const monsters = [
      mk('far', 10),
      mk('dead', 1, { state: 'dead' }),
      mk('pending', 1.5, { isDeadPending: true }),
      mk('upstairs', 2, { floorLevel: 1 }),
      mk('near', 4),
    ]
    expect(findAutoHuntTarget(origin, 0, monsters, () => false)?.id).toBe(
      'near'
    )
  })

  it('skips blocked and out-of-radius monsters', () => {
    const monsters = [mk('walled', 2), mk('distant', 50)]
    const blocked = (p: { x: number }) => p.x === 2
    expect(findAutoHuntTarget(origin, 0, monsters, blocked)).toBeNull()
  })
})
