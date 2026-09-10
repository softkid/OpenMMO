/* tslint:disable */
/* eslint-disable */

/**
 * Re-sync an owned monster's brain to the server's position after a refused move.
 */
export function ai_apply_authoritative_position(monster_id: string, x: number, y: number, z: number): void;

export function ai_create_brain(val: any): void;

export function ai_handle_death(monster_id: string): void;

/**
 * `attacker_id` is `f64`, not `u64`: wasm-bindgen maps `u64` to a JS BigInt,
 * and the client holds player ids as plain numbers. Exact by `PlayerId`'s
 * below-2^53 invariant.
 */
export function ai_handle_hit(monster_id: string, attacker_id: number, hit: boolean, damage: number): any;

export function ai_load_behavior_trees(json: string): void;

export function ai_remove_brain(monster_id: string): void;

export function ai_tick_brain(monster_id: string, delta_ms: number, nearby_players: any): any;

/**
 * Close code the server refuses a stale build with. Exported so the web
 * client compares against the same number the server sends; callers must
 * cache it while wasm is loaded, since `onclose` also fires before that.
 */
export function close_code_protocol_mismatch(): number;

export function deserialize_server_message(bytes: Uint8Array): any;

/**
 * Generate the dungeon's passability (all floors + stair shafts,
 * including the surface entrance stairwell) and register it in the same
 * cache houses use. Movement collision, click-to-move A* and monster AI
 * pathing then work in the dungeon unchanged.
 */
export function dungeon_add_passability(entrance_id: string, entrance_x: number, entrance_y: number, entrance_z: number): void;

/**
 * Shared dungeon constants so the TS side never hardcodes them.
 */
export function dungeon_constants(): any;

/**
 * Surface entrance ramp height at (x, z), or `NaN` off the entrance shaft —
 * out there the terrain sampler owns Y.
 */
export function dungeon_entrance_ramp_height_at(entrance_id: string, x: number, z: number): number;

/**
 * Ground height on dungeon floor `depth` at (x, z), stair ramps included, or
 * `NaN` when the dungeon has no such floor. The single Y model every client
 * shares — see `dungeon::stairs`.
 */
export function dungeon_floor_height_at(entrance_id: string, depth: number, x: number, z: number): number;

/**
 * Interior-door specs for one floor: wall side, opening span, wall line and
 * door id (see `dungeon::doors`).
 */
export function dungeon_interior_doors(entrance_id: string, depth: number): any;

/**
 * Full layout of every floor of a dungeon, generated from the entrance
 * id. Identical to what the server generates natively from the same id.
 */
export function dungeon_layout(entrance_id: string): any;

/**
 * Debug: dump one floor's per-cell edge bitmask (N=1, E=2, S=4, W=8) plus
 * its world min-corner origin and Y, so the client can draw a passability
 * wireframe. Returns null when the dungeon isn't registered or the floor
 * level isn't present.
 */
export function dungeon_passability_floor_cells(entrance_id: string, floor_level: number): any;

/**
 * Rebuild one dungeon floor's passability with its current dynamic state:
 * `broken` props (indices into that floor's `props`) destroyed, opening their
 * cells, and every interior door not in `open_door_ids` sealed (the closed
 * segments are derived from the layout, same as the server). Both the
 * broken-prop set and the open-door set route the full current state through
 * here (on-entry snapshots and live toggles alike), so the two never clobber
 * each other.
 */
export function dungeon_rebuild_floor(entrance_id: string, depth: number, broken: Uint32Array, open_door_ids: Uint32Array): void;

export function dungeon_remove_passability(entrance_id: string): void;

/**
 * Run position along one of floor `depth`'s shafts, in `[0, shaft_len)` from
 * the entry (shallow) end; `NaN` off the footprint. `down` picks the shaft
 * descending to `depth + 1` instead of the one arriving at `depth`.
 */
export function dungeon_shaft_run_pos(entrance_id: string, depth: number, down: boolean, x: number, z: number): number;

/**
 * How long a cast is airborne (`CAST_MS`), so the client can line the splash
 * up with the bobber landing instead of the swing that threw it.
 */
export function fishing_cast_ms(): number;

/**
 * Whether an object type is solid furniture (blocks movement). The editor uses
 * this to snap solid furniture to 90° yaw so its footprint lands on whole cells.
 */
export function furniture_is_solid(type_id: string): boolean;

/**
 * Cast range (`MAX_CAST_DISTANCE_METERS`), so the client can walk toward
 * out-of-range water instead of sending a cast the server will reject.
 */
export function max_cast_distance_m(): number;

/**
 * Cast-vs-walk depth threshold (`MIN_FISHABLE_DEPTH_M`), so the client's
 * click test uses the server's exact water test.
 */
export function min_fishable_depth_m(): number;

export function passability_add_house(val: any): void;

/**
 * The gate the server applies to every landed blow, so the client stops
 * swinging through shut doors instead of collecting rejections.
 */
export function passability_attack_line_blocked(from_x: number, from_z: number, to_x: number, to_z: number, floor_level: number): boolean;

export function passability_debug_info(): any;

export function passability_find_path(start_x: number, start_z: number, start_floor: number, goal_x: number, goal_z: number, goal_floor: number): any;

/**
 * `passability_find_path` with an explicit node budget — dungeon floors
 * are mazes and cross-floor routes can exhaust the housing default.
 */
export function passability_find_path_budget(start_x: number, start_z: number, start_floor: number, goal_x: number, goal_z: number, goal_floor: number, max_nodes: number): any;

export function passability_get_floor_at(x: number, z: number, y: number): number;

export function passability_get_floor_y_base(x: number, z: number, floor_level: number): number;

export function passability_is_cardinal_move_blocked(cell_x: number, cell_z: number, dx: number, dz: number, floor_level: number): boolean;

export function passability_is_circle_blocked(x: number, z: number, r: number, floor_level: number, y: number): boolean;

/**
 * The browser's only movement check, so it uses the mover variant: a player
 * furniture has sealed in can step back out. Pathfinding and smoothing run
 * entirely Rust-side and never come through here.
 */
export function passability_is_movement_blocked(from_x: number, from_z: number, to_x: number, to_z: number, floor_level: number, y: number): boolean;

export function passability_remove_furniture(key: string): void;

export function passability_remove_house(house_id: string): void;

/**
 * Register (or replace) a region's solid furniture under `key` in the same
 * passability cache houses and dungeons use. Takes the raw region object
 * placements; solidity and footprint cells are resolved by `furniture` (shared
 * with the agent-client and server). Movement collision and click-to-move A*
 * then both treat the sealed cells as impassable — a character can neither walk
 * through the furniture nor path through it. A region with no solid furniture
 * removes the entry. Returns the sealed pieces (cells + floor Y) for the debug
 * overlay.
 */
export function passability_set_furniture(key: string, val: any): any;

/**
 * Floor an A* endpoint at (x, z, y) must be keyed to — the same as
 * `passability_get_floor_at` off the stairs, the stairwell's lower floor on an
 * intermediate step. See `pathfinding::start_floor_at`.
 */
export function passability_start_floor_at(x: number, z: number, y: number): number;

export function passability_update_door(house_id: string, room_val: any, wall_dir_val: any, segment_index: number, is_open: boolean): void;

/**
 * Wire protocol version the bundled wasm was built against; the web client
 * puts it in its `ClientInfo` so a stale cached bundle is refused with a
 * "reload" notice instead of failing later on some other message.
 */
export function protocol_version(): number;

export function serialize_client_message(val: any): Uint8Array;

/**
 * The shared skill level cap (`SKILL_LEVEL_CAP`), for capped-out displays.
 */
export function skill_level_cap(): number;

/**
 * Cumulative XP threshold for a trained-skill level (fishing etc.), so the
 * client's progress bars use the exact server curve. Skill XP tops out far
 * below safe-integer range, so no saturation is needed.
 */
export function skill_xp_for_level(level: number): number;

/**
 * XP threshold for a given level, as an f64 for JS interop.
 * Saturates at Number.MAX_SAFE_INTEGER for levels beyond safe integer range.
 */
export function xp_for_level(level: number): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly ai_apply_authoritative_position: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly ai_create_brain: (a: any) => [number, number];
    readonly ai_handle_death: (a: number, b: number) => void;
    readonly ai_handle_hit: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly ai_load_behavior_trees: (a: number, b: number) => [number, number];
    readonly ai_remove_brain: (a: number, b: number) => void;
    readonly ai_tick_brain: (a: number, b: number, c: number, d: any) => [number, number, number];
    readonly close_code_protocol_mismatch: () => number;
    readonly deserialize_server_message: (a: number, b: number) => [number, number, number];
    readonly dungeon_add_passability: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly dungeon_constants: () => [number, number, number];
    readonly dungeon_entrance_ramp_height_at: (a: number, b: number, c: number, d: number) => number;
    readonly dungeon_floor_height_at: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly dungeon_interior_doors: (a: number, b: number, c: number) => [number, number, number];
    readonly dungeon_layout: (a: number, b: number) => [number, number, number];
    readonly dungeon_passability_floor_cells: (a: number, b: number, c: number) => [number, number, number];
    readonly dungeon_rebuild_floor: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly dungeon_remove_passability: (a: number, b: number) => void;
    readonly dungeon_shaft_run_pos: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly fishing_cast_ms: () => number;
    readonly furniture_is_solid: (a: number, b: number) => number;
    readonly max_cast_distance_m: () => number;
    readonly min_fishable_depth_m: () => number;
    readonly passability_add_house: (a: any) => [number, number];
    readonly passability_attack_line_blocked: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly passability_debug_info: () => [number, number, number];
    readonly passability_find_path: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly passability_find_path_budget: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly passability_get_floor_at: (a: number, b: number, c: number) => number;
    readonly passability_get_floor_y_base: (a: number, b: number, c: number) => number;
    readonly passability_is_cardinal_move_blocked: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly passability_is_circle_blocked: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly passability_is_movement_blocked: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly passability_remove_furniture: (a: number, b: number) => void;
    readonly passability_remove_house: (a: number, b: number) => void;
    readonly passability_set_furniture: (a: number, b: number, c: any) => [number, number, number];
    readonly passability_start_floor_at: (a: number, b: number, c: number) => number;
    readonly passability_update_door: (a: number, b: number, c: any, d: any, e: number, f: number) => [number, number];
    readonly protocol_version: () => number;
    readonly serialize_client_message: (a: any) => [number, number, number, number];
    readonly skill_level_cap: () => number;
    readonly skill_xp_for_level: (a: number) => number;
    readonly xp_for_level: (a: number) => number;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
