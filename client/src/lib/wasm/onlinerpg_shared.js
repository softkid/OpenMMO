/* @ts-self-types="./onlinerpg_shared.d.ts" */

/**
 * Re-sync an owned monster's brain to the server's position after a refused move.
 * @param {string} monster_id
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function ai_apply_authoritative_position(monster_id, x, y, z) {
    const ptr0 = passStringToWasm0(monster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.ai_apply_authoritative_position(ptr0, len0, x, y, z);
}

/**
 * @param {any} val
 */
export function ai_create_brain(val) {
    const ret = wasm.ai_create_brain(val);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * @param {string} monster_id
 */
export function ai_handle_death(monster_id) {
    const ptr0 = passStringToWasm0(monster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.ai_handle_death(ptr0, len0);
}

/**
 * `attacker_id` is `f64`, not `u64`: wasm-bindgen maps `u64` to a JS BigInt,
 * and the client holds player ids as plain numbers. Exact by `PlayerId`'s
 * below-2^53 invariant.
 * @param {string} monster_id
 * @param {number} attacker_id
 * @param {boolean} hit
 * @param {number} damage
 * @returns {any}
 */
export function ai_handle_hit(monster_id, attacker_id, hit, damage) {
    const ptr0 = passStringToWasm0(monster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.ai_handle_hit(ptr0, len0, attacker_id, hit, damage);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} json
 */
export function ai_load_behavior_trees(json) {
    const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.ai_load_behavior_trees(ptr0, len0);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * @param {string} monster_id
 */
export function ai_remove_brain(monster_id) {
    const ptr0 = passStringToWasm0(monster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.ai_remove_brain(ptr0, len0);
}

/**
 * @param {string} monster_id
 * @param {number} delta_ms
 * @param {any} nearby_players
 * @returns {any}
 */
export function ai_tick_brain(monster_id, delta_ms, nearby_players) {
    const ptr0 = passStringToWasm0(monster_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.ai_tick_brain(ptr0, len0, delta_ms, nearby_players);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Close code the server refuses a stale build with. Exported so the web
 * client compares against the same number the server sends; callers must
 * cache it while wasm is loaded, since `onclose` also fires before that.
 * @returns {number}
 */
export function close_code_protocol_mismatch() {
    const ret = wasm.close_code_protocol_mismatch();
    return ret;
}

/**
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function deserialize_server_message(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.deserialize_server_message(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Generate the dungeon's passability (all floors + stair shafts,
 * including the surface entrance stairwell) and register it in the same
 * cache houses use. Movement collision, click-to-move A* and monster AI
 * pathing then work in the dungeon unchanged.
 * @param {string} entrance_id
 * @param {number} entrance_x
 * @param {number} entrance_y
 * @param {number} entrance_z
 */
export function dungeon_add_passability(entrance_id, entrance_x, entrance_y, entrance_z) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.dungeon_add_passability(ptr0, len0, entrance_x, entrance_y, entrance_z);
}

/**
 * Shared dungeon constants so the TS side never hardcodes them.
 * @returns {any}
 */
export function dungeon_constants() {
    const ret = wasm.dungeon_constants();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Surface entrance ramp height at (x, z), or `NaN` off the entrance shaft —
 * out there the terrain sampler owns Y.
 * @param {string} entrance_id
 * @param {number} x
 * @param {number} z
 * @returns {number}
 */
export function dungeon_entrance_ramp_height_at(entrance_id, x, z) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.dungeon_entrance_ramp_height_at(ptr0, len0, x, z);
    return ret;
}

/**
 * Ground height on dungeon floor `depth` at (x, z), stair ramps included, or
 * `NaN` when the dungeon has no such floor. The single Y model every client
 * shares — see `dungeon::stairs`.
 * @param {string} entrance_id
 * @param {number} depth
 * @param {number} x
 * @param {number} z
 * @returns {number}
 */
export function dungeon_floor_height_at(entrance_id, depth, x, z) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.dungeon_floor_height_at(ptr0, len0, depth, x, z);
    return ret;
}

/**
 * Interior-door specs for one floor: wall side, opening span, wall line and
 * door id (see `dungeon::doors`).
 * @param {string} entrance_id
 * @param {number} depth
 * @returns {any}
 */
export function dungeon_interior_doors(entrance_id, depth) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.dungeon_interior_doors(ptr0, len0, depth);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Full layout of every floor of a dungeon, generated from the entrance
 * id. Identical to what the server generates natively from the same id.
 * @param {string} entrance_id
 * @returns {any}
 */
export function dungeon_layout(entrance_id) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.dungeon_layout(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Debug: dump one floor's per-cell edge bitmask (N=1, E=2, S=4, W=8) plus
 * its world min-corner origin and Y, so the client can draw a passability
 * wireframe. Returns null when the dungeon isn't registered or the floor
 * level isn't present.
 * @param {string} entrance_id
 * @param {number} floor_level
 * @returns {any}
 */
export function dungeon_passability_floor_cells(entrance_id, floor_level) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.dungeon_passability_floor_cells(ptr0, len0, floor_level);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Rebuild one dungeon floor's passability with its current dynamic state:
 * `broken` props (indices into that floor's `props`) destroyed, opening their
 * cells, and every interior door not in `open_door_ids` sealed (the closed
 * segments are derived from the layout, same as the server). Both the
 * broken-prop set and the open-door set route the full current state through
 * here (on-entry snapshots and live toggles alike), so the two never clobber
 * each other.
 * @param {string} entrance_id
 * @param {number} depth
 * @param {Uint32Array} broken
 * @param {Uint32Array} open_door_ids
 */
export function dungeon_rebuild_floor(entrance_id, depth, broken, open_door_ids) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(broken, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(open_door_ids, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    wasm.dungeon_rebuild_floor(ptr0, len0, depth, ptr1, len1, ptr2, len2);
}

/**
 * @param {string} entrance_id
 */
export function dungeon_remove_passability(entrance_id) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.dungeon_remove_passability(ptr0, len0);
}

/**
 * Run position along one of floor `depth`'s shafts, in `[0, shaft_len)` from
 * the entry (shallow) end; `NaN` off the footprint. `down` picks the shaft
 * descending to `depth + 1` instead of the one arriving at `depth`.
 * @param {string} entrance_id
 * @param {number} depth
 * @param {boolean} down
 * @param {number} x
 * @param {number} z
 * @returns {number}
 */
export function dungeon_shaft_run_pos(entrance_id, depth, down, x, z) {
    const ptr0 = passStringToWasm0(entrance_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.dungeon_shaft_run_pos(ptr0, len0, depth, down, x, z);
    return ret;
}

/**
 * How long a cast is airborne (`CAST_MS`), so the client can line the splash
 * up with the bobber landing instead of the swing that threw it.
 * @returns {number}
 */
export function fishing_cast_ms() {
    const ret = wasm.fishing_cast_ms();
    return ret >>> 0;
}

/**
 * Whether an object type is solid furniture (blocks movement). The editor uses
 * this to snap solid furniture to 90° yaw so its footprint lands on whole cells.
 * @param {string} type_id
 * @returns {boolean}
 */
export function furniture_is_solid(type_id) {
    const ptr0 = passStringToWasm0(type_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.furniture_is_solid(ptr0, len0);
    return ret !== 0;
}

/**
 * Cast range (`MAX_CAST_DISTANCE_METERS`), so the client can walk toward
 * out-of-range water instead of sending a cast the server will reject.
 * @returns {number}
 */
export function max_cast_distance_m() {
    const ret = wasm.max_cast_distance_m();
    return ret;
}

/**
 * Cast-vs-walk depth threshold (`MIN_FISHABLE_DEPTH_M`), so the client's
 * click test uses the server's exact water test.
 * @returns {number}
 */
export function min_fishable_depth_m() {
    const ret = wasm.min_fishable_depth_m();
    return ret;
}

/**
 * @param {any} val
 */
export function passability_add_house(val) {
    const ret = wasm.passability_add_house(val);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * The gate the server applies to every landed blow, so the client stops
 * swinging through shut doors instead of collecting rejections.
 * @param {number} from_x
 * @param {number} from_z
 * @param {number} to_x
 * @param {number} to_z
 * @param {number} floor_level
 * @returns {boolean}
 */
export function passability_attack_line_blocked(from_x, from_z, to_x, to_z, floor_level) {
    const ret = wasm.passability_attack_line_blocked(from_x, from_z, to_x, to_z, floor_level);
    return ret !== 0;
}

/**
 * @returns {any}
 */
export function passability_debug_info() {
    const ret = wasm.passability_debug_info();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} start_x
 * @param {number} start_z
 * @param {number} start_floor
 * @param {number} goal_x
 * @param {number} goal_z
 * @param {number} goal_floor
 * @returns {any}
 */
export function passability_find_path(start_x, start_z, start_floor, goal_x, goal_z, goal_floor) {
    const ret = wasm.passability_find_path(start_x, start_z, start_floor, goal_x, goal_z, goal_floor);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * `passability_find_path` with an explicit node budget — dungeon floors
 * are mazes and cross-floor routes can exhaust the housing default.
 * @param {number} start_x
 * @param {number} start_z
 * @param {number} start_floor
 * @param {number} goal_x
 * @param {number} goal_z
 * @param {number} goal_floor
 * @param {number} max_nodes
 * @returns {any}
 */
export function passability_find_path_budget(start_x, start_z, start_floor, goal_x, goal_z, goal_floor, max_nodes) {
    const ret = wasm.passability_find_path_budget(start_x, start_z, start_floor, goal_x, goal_z, goal_floor, max_nodes);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} x
 * @param {number} z
 * @param {number} y
 * @returns {number}
 */
export function passability_get_floor_at(x, z, y) {
    const ret = wasm.passability_get_floor_at(x, z, y);
    return ret;
}

/**
 * @param {number} x
 * @param {number} z
 * @param {number} floor_level
 * @returns {number}
 */
export function passability_get_floor_y_base(x, z, floor_level) {
    const ret = wasm.passability_get_floor_y_base(x, z, floor_level);
    return ret;
}

/**
 * @param {number} cell_x
 * @param {number} cell_z
 * @param {number} dx
 * @param {number} dz
 * @param {number} floor_level
 * @returns {boolean}
 */
export function passability_is_cardinal_move_blocked(cell_x, cell_z, dx, dz, floor_level) {
    const ret = wasm.passability_is_cardinal_move_blocked(cell_x, cell_z, dx, dz, floor_level);
    return ret !== 0;
}

/**
 * @param {number} x
 * @param {number} z
 * @param {number} r
 * @param {number} floor_level
 * @param {number} y
 * @returns {boolean}
 */
export function passability_is_circle_blocked(x, z, r, floor_level, y) {
    const ret = wasm.passability_is_circle_blocked(x, z, r, floor_level, y);
    return ret !== 0;
}

/**
 * The browser's only movement check, so it uses the mover variant: a player
 * furniture has sealed in can step back out. Pathfinding and smoothing run
 * entirely Rust-side and never come through here.
 * @param {number} from_x
 * @param {number} from_z
 * @param {number} to_x
 * @param {number} to_z
 * @param {number} floor_level
 * @param {number} y
 * @returns {boolean}
 */
export function passability_is_movement_blocked(from_x, from_z, to_x, to_z, floor_level, y) {
    const ret = wasm.passability_is_movement_blocked(from_x, from_z, to_x, to_z, floor_level, y);
    return ret !== 0;
}

/**
 * @param {string} key
 */
export function passability_remove_furniture(key) {
    const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.passability_remove_furniture(ptr0, len0);
}

/**
 * @param {string} house_id
 */
export function passability_remove_house(house_id) {
    const ptr0 = passStringToWasm0(house_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.passability_remove_house(ptr0, len0);
}

/**
 * Register (or replace) a region's solid furniture under `key` in the same
 * passability cache houses and dungeons use. Takes the raw region object
 * placements; solidity and footprint cells are resolved by `furniture` (shared
 * with the agent-client and server). Movement collision and click-to-move A*
 * then both treat the sealed cells as impassable — a character can neither walk
 * through the furniture nor path through it. A region with no solid furniture
 * removes the entry. Returns the sealed pieces (cells + floor Y) for the debug
 * overlay.
 * @param {string} key
 * @param {any} val
 * @returns {any}
 */
export function passability_set_furniture(key, val) {
    const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.passability_set_furniture(ptr0, len0, val);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Floor an A* endpoint at (x, z, y) must be keyed to — the same as
 * `passability_get_floor_at` off the stairs, the stairwell's lower floor on an
 * intermediate step. See `pathfinding::start_floor_at`.
 * @param {number} x
 * @param {number} z
 * @param {number} y
 * @returns {number}
 */
export function passability_start_floor_at(x, z, y) {
    const ret = wasm.passability_start_floor_at(x, z, y);
    return ret;
}

/**
 * @param {string} house_id
 * @param {any} room_val
 * @param {any} wall_dir_val
 * @param {number} segment_index
 * @param {boolean} is_open
 */
export function passability_update_door(house_id, room_val, wall_dir_val, segment_index, is_open) {
    const ptr0 = passStringToWasm0(house_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.passability_update_door(ptr0, len0, room_val, wall_dir_val, segment_index, is_open);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Wire protocol version the bundled wasm was built against; the web client
 * puts it in its `ClientInfo` so a stale cached bundle is refused with a
 * "reload" notice instead of failing later on some other message.
 * @returns {number}
 */
export function protocol_version() {
    return 103;
}

/**
 * @param {any} val
 * @returns {Uint8Array}
 */
export function serialize_client_message(val) {
    const ret = wasm.serialize_client_message(val);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * The shared skill level cap (`SKILL_LEVEL_CAP`), for capped-out displays.
 * @returns {number}
 */
export function skill_level_cap() {
    const ret = wasm.skill_level_cap();
    return ret >>> 0;
}

/**
 * Cumulative XP threshold for a trained-skill level (fishing etc.), so the
 * client's progress bars use the exact server curve. Skill XP tops out far
 * below safe-integer range, so no saturation is needed.
 * @param {number} level
 * @returns {number}
 */
export function skill_xp_for_level(level) {
    const ret = wasm.skill_xp_for_level(level);
    return ret;
}

/**
 * XP threshold for a given level, as an f64 for JS interop.
 * Saturates at Number.MAX_SAFE_INTEGER for levels beyond safe integer range.
 * @param {number} level
 * @returns {number}
 */
export function xp_for_level(level) {
    const ret = wasm.xp_for_level(level);
    return ret;
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_83742b46f01ce22d: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_Number_a5a435bd7bbec835: function(arg0) {
            const ret = Number(arg0);
            return ret;
        },
        __wbg_String_8564e559799eccda: function(arg0, arg1) {
            const ret = String(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_bigint_get_as_i64_447a76b5c6ef7bda: function(arg0, arg1) {
            const v = arg1;
            const ret = typeof(v) === 'bigint' ? v : undefined;
            getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_boolean_get_c0f3f60bac5a78d1: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_5398f5bb970e0daa: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_in_41dbb8413020e076: function(arg0, arg1) {
            const ret = arg0 in arg1;
            return ret;
        },
        __wbg___wbindgen_is_bigint_e2141d4f045b7eda: function(arg0) {
            const ret = typeof(arg0) === 'bigint';
            return ret;
        },
        __wbg___wbindgen_is_function_3c846841762788c1: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_object_781bc9f159099513: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_string_7ef6b97b02428fae: function(arg0) {
            const ret = typeof(arg0) === 'string';
            return ret;
        },
        __wbg___wbindgen_is_undefined_52709e72fb9f179c: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_eq_ee31bfad3e536463: function(arg0, arg1) {
            const ret = arg0 === arg1;
            return ret;
        },
        __wbg___wbindgen_jsval_loose_eq_5bcc3bed3c69e72b: function(arg0, arg1) {
            const ret = arg0 == arg1;
            return ret;
        },
        __wbg___wbindgen_number_get_34bb9d9dcfa21373: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_395e606bd0ee4427: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_6ddd609b62940d55: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_call_2d781c1f4d5c0ef8: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_call_e133b57c9155d22c: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments); },
        __wbg_crypto_38df2bab126b63dc: function(arg0) {
            const ret = arg0.crypto;
            return ret;
        },
        __wbg_done_08ce71ee07e3bd17: function(arg0) {
            const ret = arg0.done;
            return ret;
        },
        __wbg_entries_e8a20ff8c9757101: function(arg0) {
            const ret = Object.entries(arg0);
            return ret;
        },
        __wbg_getRandomValues_c44a50d8cfdaebeb: function() { return handleError(function (arg0, arg1) {
            arg0.getRandomValues(arg1);
        }, arguments); },
        __wbg_get_326e41e095fb2575: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_a8ee5c45dabc1b3b: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_unchecked_329cfe50afab7352: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_with_ref_key_6412cf3094599694: function(arg0, arg1) {
            const ret = arg0[arg1];
            return ret;
        },
        __wbg_instanceof_ArrayBuffer_101e2bf31071a9f6: function(arg0) {
            let result;
            try {
                result = arg0 instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Uint8Array_740438561a5b956d: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isArray_33b91feb269ff46e: function(arg0) {
            const ret = Array.isArray(arg0);
            return ret;
        },
        __wbg_isSafeInteger_ecd6a7f9c3e053cd: function(arg0) {
            const ret = Number.isSafeInteger(arg0);
            return ret;
        },
        __wbg_iterator_d8f549ec8fb061b1: function() {
            const ret = Symbol.iterator;
            return ret;
        },
        __wbg_length_b3416cf66a5452c8: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_ea16607d7b61445b: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_msCrypto_bd5a034af96bcba6: function(arg0) {
            const ret = arg0.msCrypto;
            return ret;
        },
        __wbg_new_49d5571bd3f0c4d4: function() {
            const ret = new Map();
            return ret;
        },
        __wbg_new_5f486cdf45a04d78: function(arg0) {
            const ret = new Uint8Array(arg0);
            return ret;
        },
        __wbg_new_a70fbab9066b301f: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_ab79df5bd7c26067: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_with_length_825018a1616e9e55: function(arg0) {
            const ret = new Uint8Array(arg0 >>> 0);
            return ret;
        },
        __wbg_next_11b99ee6237339e3: function() { return handleError(function (arg0) {
            const ret = arg0.next();
            return ret;
        }, arguments); },
        __wbg_next_e01a967809d1aa68: function(arg0) {
            const ret = arg0.next;
            return ret;
        },
        __wbg_node_84ea875411254db1: function(arg0) {
            const ret = arg0.node;
            return ret;
        },
        __wbg_process_44c7a14e11e9f69e: function(arg0) {
            const ret = arg0.process;
            return ret;
        },
        __wbg_prototypesetcall_d62e5099504357e6: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_randomFillSync_6c25eac9869eb53c: function() { return handleError(function (arg0, arg1) {
            arg0.randomFillSync(arg1);
        }, arguments); },
        __wbg_require_b4edbdcf3e2a1ef0: function() { return handleError(function () {
            const ret = module.require;
            return ret;
        }, arguments); },
        __wbg_set_282384002438957f: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        },
        __wbg_set_bf7251625df30a02: function(arg0, arg1, arg2) {
            const ret = arg0.set(arg1, arg2);
            return ret;
        },
        __wbg_static_accessor_GLOBAL_8adb955bd33fac2f: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_ad356e0db91c7913: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_f207c857566db248: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_bb9f1ba69d61b386: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_subarray_a068d24e39478a8a: function(arg0, arg1, arg2) {
            const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_value_21fc78aab0322612: function(arg0) {
            const ret = arg0.value;
            return ret;
        },
        __wbg_versions_276b2795b1c6a219: function(arg0) {
            const ret = arg0.versions;
            return ret;
        },
        __wbindgen_cast_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0) {
            // Cast intrinsic for `I64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000004: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000005: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./onlinerpg_shared_bg.js": import0,
    };
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('onlinerpg_shared_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
