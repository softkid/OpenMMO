use super::*;

// --- Enchant weapon scrolls ---

/// Instance id the scroll stack takes in every setup below; the equipped
/// pieces number up from 1.
const SCROLL_ID: u64 = 9;

/// Spawn a live player wearing `equipped` (slot, def id, enchant) with a stack
/// of `scroll_def_id` in the bag, and return their direct channel.
async fn setup_enchant_reader(
    game_state: &GameState,
    equipped: &[(EquipSlot, &str, i32)],
    scroll_def_id: &str,
    scrolls: u32,
) -> DirectRx {
    game_state.add_player(make_player("reader", 0.0, 0.0)).await;
    let rx = game_state.register_direct_channel(&pid("reader")).await;

    let mut inv: onlinerpg_shared::inventory::PlayerInventory = Default::default();
    for (index, (slot, item_def_id, enchant)) in equipped.iter().enumerate() {
        inv.equipped.insert(
            *slot,
            ItemInstance {
                instance_id: index as u64 + 1,
                item_def_id: item_def_id.to_string(),
                quantity: 1,
                enchant: *enchant,
            },
        );
    }
    inv.bag.push(bag_item(SCROLL_ID, scroll_def_id, scrolls));
    game_state
        .inventories
        .write()
        .await
        .insert(pid("reader"), inv);
    rx
}

/// The weapon-scroll setup: a wielded `weapon` at an enchant level, or nothing
/// in hand.
async fn setup_weapon_enchant_reader(
    game_state: &GameState,
    weapon: Option<(&str, i32)>,
    scrolls: u32,
) -> DirectRx {
    let equipped: Vec<(EquipSlot, &str, i32)> = weapon
        .map(|(def_id, enchant)| (EquipSlot::MainHand, def_id, enchant))
        .into_iter()
        .collect();
    setup_enchant_reader(game_state, &equipped, "scroll_of_enchant_weapon", scrolls).await
}

#[tokio::test]
async fn enchant_scroll_enchants_wielded_weapon() {
    let game_state = make_test_game_state("enchant_ok");
    let _rx = setup_weapon_enchant_reader(&game_state, Some(("iron_sword", 0)), 1).await;

    game_state.use_item(&pid("reader"), SCROLL_ID).await;

    let inv = game_state
        .get_player_inventory(&pid("reader"))
        .await
        .unwrap();
    let weapon = inv.equipped.get(&EquipSlot::MainHand).unwrap();
    assert_eq!(weapon.enchant, 1);
    assert!(inv.bag.is_empty(), "the scroll should be consumed");
}

#[tokio::test]
async fn enchant_scroll_requires_wielded_weapon() {
    let game_state = make_test_game_state("enchant_no_weapon");
    let mut rx = setup_weapon_enchant_reader(&game_state, None, 1).await;

    game_state.use_item(&pid("reader"), SCROLL_ID).await;

    let inv = game_state
        .get_player_inventory(&pid("reader"))
        .await
        .unwrap();
    assert_eq!(inv.bag.len(), 1, "the scroll should be kept");
    match rx.try_recv() {
        Ok(ServerMessage::SystemMessage { message }) => {
            assert!(
                message.contains("no weapon"),
                "unexpected message: {message}"
            );
        }
        other => panic!("Expected a system reply, got {:?}", other),
    }
}

// --- Enchant armor scrolls ---

/// The armor-scroll setup: whatever gear the case needs worn.
async fn setup_armor_enchant_reader(
    game_state: &GameState,
    armor: &[(EquipSlot, &str, i32)],
    scrolls: u32,
) -> DirectRx {
    setup_enchant_reader(game_state, armor, "scroll_of_enchant_armor", scrolls).await
}

#[tokio::test]
async fn enchant_armor_scroll_enchants_worn_armor() {
    let game_state = make_test_game_state("enchant_armor_ok");
    let _rx =
        setup_armor_enchant_reader(&game_state, &[(EquipSlot::Chest, "leather_armor", 0)], 1).await;

    let base_guard = game_state.effective_guard(&pid("reader")).await;
    game_state.use_item(&pid("reader"), SCROLL_ID).await;

    let inv = game_state
        .get_player_inventory(&pid("reader"))
        .await
        .unwrap();
    assert_eq!(inv.equipped.get(&EquipSlot::Chest).unwrap().enchant, 1);
    assert!(inv.bag.is_empty(), "the scroll should be consumed");
    assert_eq!(
        game_state.effective_guard(&pid("reader")).await,
        base_guard + 1,
        "the enchant should raise guard"
    );
}

#[tokio::test]
async fn enchant_armor_scroll_ignores_weapons_and_accessories() {
    let game_state = make_test_game_state("enchant_armor_targets");
    let _rx = setup_armor_enchant_reader(
        &game_state,
        &[
            (EquipSlot::MainHand, "iron_sword", 0),
            (EquipSlot::Ring, "ring_of_protection", 0),
            (EquipSlot::Chest, "leather_armor", 0),
        ],
        1,
    )
    .await;

    game_state.use_item(&pid("reader"), SCROLL_ID).await;

    let inv = game_state
        .get_player_inventory(&pid("reader"))
        .await
        .unwrap();
    assert_eq!(inv.equipped.get(&EquipSlot::Chest).unwrap().enchant, 1);
    assert_eq!(inv.equipped.get(&EquipSlot::MainHand).unwrap().enchant, 0);
    assert_eq!(inv.equipped.get(&EquipSlot::Ring).unwrap().enchant, 0);
}

#[tokio::test]
async fn enchant_armor_scroll_requires_worn_armor() {
    let game_state = make_test_game_state("enchant_armor_none");
    let mut rx =
        setup_armor_enchant_reader(&game_state, &[(EquipSlot::MainHand, "iron_sword", 0)], 1).await;

    game_state.use_item(&pid("reader"), SCROLL_ID).await;

    let inv = game_state
        .get_player_inventory(&pid("reader"))
        .await
        .unwrap();
    assert_eq!(inv.bag.len(), 1, "the scroll should be kept");
    match rx.try_recv() {
        Ok(ServerMessage::SystemMessage { message }) => {
            assert!(
                message.contains("no armor"),
                "unexpected message: {message}"
            );
        }
        other => panic!("Expected a system reply, got {:?}", other),
    }
}

/// Non-destructive design: a missed enchant fizzles (item unchanged) rather
/// than destroying the item, no matter how deep into the tail the piece
/// already is. Replaces the old `..._destroys_over_enchanted_...` tests.
#[tokio::test]
async fn enchant_armor_scroll_never_destroys_over_enchanted_armor() {
    let game_state = make_test_game_state("enchant_armor_persists");
    let _rx =
        setup_armor_enchant_reader(&game_state, &[(EquipSlot::Chest, "leather_armor", 12)], 100)
            .await;
    game_state
        .player_gold
        .write()
        .await
        .insert(pid("reader"), 10_000_000);

    let reader = pid("reader");
    let mut saw_a_fizzle = false;
    let mut previous_enchant = 12;
    for _ in 0..100 {
        game_state.use_item(&reader, SCROLL_ID).await;
        let inv = game_state.get_player_inventory(&reader).await.unwrap();
        let piece = inv
            .equipped
            .get(&EquipSlot::Chest)
            .expect("armor must never be destroyed — only hold or advance");
        if piece.enchant == previous_enchant {
            saw_a_fizzle = true;
        }
        previous_enchant = piece.enchant;
    }
    assert!(
        saw_a_fizzle,
        "at a 20% floor, 100 reads should include at least one miss that leaves the item untouched"
    );
}

#[tokio::test]
async fn enchant_scroll_never_destroys_over_enchanted_weapon() {
    let game_state = make_test_game_state("enchant_weapon_persists");
    let _rx = setup_weapon_enchant_reader(&game_state, Some(("iron_sword", 12)), 100).await;
    game_state
        .player_gold
        .write()
        .await
        .insert(pid("reader"), 10_000_000);

    let reader = pid("reader");
    let mut saw_a_fizzle = false;
    let mut previous_enchant = 12;
    for _ in 0..100 {
        game_state.use_item(&reader, SCROLL_ID).await;
        let inv = game_state.get_player_inventory(&reader).await.unwrap();
        let weapon = inv
            .equipped
            .get(&EquipSlot::MainHand)
            .expect("the weapon must never be destroyed — only hold or advance");
        if weapon.enchant == previous_enchant {
            saw_a_fizzle = true;
        }
        previous_enchant = weapon.enchant;
    }
    assert!(
        saw_a_fizzle,
        "at a 20% floor, 100 reads should include at least one miss that leaves the item untouched"
    );
}

/// The polishing-oil fee gates the attempt itself: too poor to pay it, and
/// the scroll is kept unread rather than being spent on a roll the player
/// can't afford.
#[tokio::test]
async fn enchant_weapon_scroll_requires_affordable_oil_fee() {
    let game_state = make_test_game_state("enchant_weapon_poor");
    let mut rx = setup_weapon_enchant_reader(&game_state, Some(("iron_sword", 12)), 1).await;
    // No gold seeded — a fresh wallet starts at 0, and the +12 fee is 50,000c.

    game_state.use_item(&pid("reader"), SCROLL_ID).await;

    let inv = game_state
        .get_player_inventory(&pid("reader"))
        .await
        .unwrap();
    assert_eq!(
        inv.bag.len(),
        1,
        "the scroll should be kept when the fee can't be paid"
    );
    assert_eq!(
        inv.equipped.get(&EquipSlot::MainHand).unwrap().enchant,
        12,
        "the weapon should be untouched"
    );
    match rx.try_recv() {
        Ok(ServerMessage::SystemMessage { message }) => {
            assert!(
                message.contains("polishing oil"),
                "unexpected message: {message}"
            );
        }
        other => panic!("Expected a system reply, got {:?}", other),
    }
}
