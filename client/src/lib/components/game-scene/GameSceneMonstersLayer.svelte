<script lang="ts">
  import Monster from '../Monster.svelte'
  import { monsterManager } from '../../managers/monsterManager'
  import { currentDungeonDepth } from '../../stores/dungeonStore'
  import { OFFSCREEN_Y } from '../../utils/house-geo-utils'
  import { unwrapWorldXNear, WORLD_WIDTH_X } from '../../terrain/world-wrap'
  import { separateOnGroundPlane } from '../../utils/entitySeparation'
  import type { LocalPlayer } from '../../stores/gameStore'
  import type { MonsterData } from '../../types/Monster'

  interface Props {
    monsters: Map<string, MonsterData>
    currentPlayer: LocalPlayer | null
    monsterModels?: (Monster | undefined)[]
  }

  let {
    monsters,
    currentPlayer,
    monsterModels = $bindable<(Monster | undefined)[]>([]),
  }: Props = $props()

  // Floor filter: underground shows only same-depth monsters; on the
  // surface dungeon monsters are hidden. Mismatches are parked at
  // OFFSCREEN_Y instead of unmounted (no pipeline churn, indices stable).
  let viewerFloor = $derived(
    $currentDungeonDepth >= 1 ? -$currentDungeonDepth : 0
  )
  const HIDDEN_POS = { x: 0, y: OFFSCREEN_Y, z: 0 }

  // Flat starting radius for doc/REFACTOR_2026-09.md's "몹과 부딪혀도 그림이
  // 겹침" fix — a visual-only floor so a melee target never renders
  // standing exactly on top of the player. Doesn't vary by monster size yet
  // (no reliable per-type radius data was available while implementing this
  // blind — i.e. without being able to see it rendered); tune per monster
  // type once someone can look at it.
  const MONSTER_SEPARATION_MIN_DISTANCE = 0.7

  function isOnViewerFloor(monster: MonsterData): boolean {
    const fl = monster.floorLevel ?? 0
    return viewerFloor < 0 ? fl === viewerFloor : fl >= 0
  }

  // Server state is canonical X; render the periodic copy nearest the viewer so
  // a monster across the seam isn't a world width away. Returns the stored
  // object unless the seam actually moves it — a fresh literal every frame
  // would push a pose into three.js for every idle monster and corpse.
  //
  // The same "don't allocate unless something actually changes" rule covers
  // the separation nudge below: `separateOnGroundPlane` returns `null` for
  // the overwhelming majority of monsters (anyone not standing right next to
  // the player), so most frames return the exact object they'd have
  // returned before this fix existed.
  function displayPosition(monster: MonsterData) {
    if (!isOnViewerFloor(monster)) return HIDDEN_POS
    const viewerX = currentPlayer?.position.x
    const unwrapped =
      viewerX === undefined ||
      Math.abs(monster.position.x - viewerX) <= WORLD_WIDTH_X / 2
        ? monster.position
        : { ...monster.position, x: unwrapWorldXNear(viewerX, monster.position.x) }

    if (!currentPlayer) return unwrapped
    const separated = separateOnGroundPlane(
      currentPlayer.position,
      unwrapped,
      MONSTER_SEPARATION_MIN_DISTANCE
    )
    return separated ?? unwrapped
  }
</script>

{#each [...monsters.values()] as monster, index (monster.id)}
  <Monster
    bind:this={monsterModels[index]}
    id={monster.id}
    type={monster.type}
    position={displayPosition(monster)}
    rotation={monster.rotation}
    monsterState={monster.state}
    attackCounter={monster.attackCounter}
    lastDamageInfo={monster.lastDamageInfo}
    droppedWeaponItemDefId={monster.droppedWeaponItemDefId}
    onHitFinished={() => monsterManager.handleMonsterHitFinished(monster.id)}
  />
{/each}
