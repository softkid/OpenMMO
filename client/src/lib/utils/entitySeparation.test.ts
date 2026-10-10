import { describe, expect, it } from 'vitest'
import { separateOnGroundPlane, type Vec3Like } from './entitySeparation'

describe('separateOnGroundPlane', () => {
  it('returns null when already far enough apart', () => {
    const viewer: Vec3Like = { x: 0, y: 0, z: 0 }
    const target: Vec3Like = { x: 5, y: 1, z: 0 }
    expect(separateOnGroundPlane(viewer, target, 0.7)).toBeNull()
  })

  it('returns null exactly at the boundary (not strictly closer)', () => {
    const viewer: Vec3Like = { x: 0, y: 0, z: 0 }
    const target: Vec3Like = { x: 0.7, y: 1, z: 0 }
    expect(separateOnGroundPlane(viewer, target, 0.7)).toBeNull()
  })

  it('pushes an overlapping target out to exactly minDistance', () => {
    const viewer: Vec3Like = { x: 0, y: 0, z: 0 }
    const target: Vec3Like = { x: 0.1, y: 1, z: 0 }
    const result = separateOnGroundPlane(viewer, target, 0.7)
    expect(result).not.toBeNull()
    const dist = Math.hypot(result!.x - viewer.x, result!.z - viewer.z)
    expect(dist).toBeCloseTo(0.7, 10)
  })

  it('preserves direction from viewer to target', () => {
    const viewer: Vec3Like = { x: 2, y: 0, z: 2 }
    // Target is up and to the right of the viewer, well inside minDistance.
    const target: Vec3Like = { x: 2.2, y: 0, z: 2.1 }
    const result = separateOnGroundPlane(viewer, target, 1)!
    const originalAngle = Math.atan2(target.z - viewer.z, target.x - viewer.x)
    const resultAngle = Math.atan2(
      result.z - viewer.z,
      result.x - viewer.x
    )
    expect(resultAngle).toBeCloseTo(originalAngle, 10)
  })

  it('leaves Y untouched', () => {
    const viewer: Vec3Like = { x: 0, y: 0, z: 0 }
    const target: Vec3Like = { x: 0.1, y: 3.5, z: 0 }
    const result = separateOnGroundPlane(viewer, target, 0.7)!
    expect(result.y).toBe(3.5)
  })

  it('does not mutate the input target object', () => {
    const viewer: Vec3Like = { x: 0, y: 0, z: 0 }
    const target: Vec3Like = { x: 0.1, y: 0, z: 0 }
    const snapshot = { ...target }
    separateOnGroundPlane(viewer, target, 0.7)
    expect(target).toEqual(snapshot)
  })

  it('handles the exact-same-position degenerate case without NaN', () => {
    const viewer: Vec3Like = { x: 5, y: 0, z: -3 }
    const target: Vec3Like = { x: 5, y: 0, z: -3 }
    const result = separateOnGroundPlane(viewer, target, 0.7)!
    expect(Number.isFinite(result.x)).toBe(true)
    expect(Number.isFinite(result.z)).toBe(true)
    const dist = Math.hypot(result.x - viewer.x, result.z - viewer.z)
    expect(dist).toBeCloseTo(0.7, 10)
  })

  it('returns a new object, never the same reference as target', () => {
    const viewer: Vec3Like = { x: 0, y: 0, z: 0 }
    const target: Vec3Like = { x: 0.1, y: 0, z: 0 }
    const result = separateOnGroundPlane(viewer, target, 0.7)
    expect(result).not.toBe(target)
  })
})
