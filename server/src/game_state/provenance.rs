//! Player-facing read access to the trade ledger `doc/TRADE.md` already
//! writes transactionally and permanently. This module adds no new writes
//! and no new state to `GameState` — it only formats what
//! `AuthService::trade_history_for` reads back for the player who asks.
//!
//! This is the whole "Play-and-own" transparency layer described in
//! `doc/PROVENANCE.md`: proof of what you own and how you got it, read
//! straight from a record that was written in the same transaction as the
//! trade and can't be edited or backdated afterward. No token, no real-money
//! conversion, no "earn" promise anywhere in it — see that doc for why that
//! omission is the point, not a missing feature.

use crate::auth::{AuthService, TradeHistoryRow};
use crate::types::PlayerId;

/// How many trades `/history` shows. Deliberately small — this is a player
/// glancing at their own recent activity, not an accounting export. Raw SQL
/// against the ledger remains the tool for anything deeper (doc/TRADE.md).
const HISTORY_LIMIT: i64 = 20;

impl super::GameState {
    /// `/history` — this player's own last `HISTORY_LIMIT` trades, newest
    /// first.
    pub(crate) async fn send_trade_history(&self, player_id: &PlayerId, auth: &AuthService) {
        let character_id = {
            let chars = self.player_characters.read().await;
            chars.get(player_id).map(|(id, _, _)| *id)
        };
        let Some(character_id) = character_id else {
            self.send_system_message(player_id, "No character on this connection.")
                .await;
            return;
        };

        let rows = match auth.trade_history_for(character_id, HISTORY_LIMIT) {
            Ok(rows) => rows,
            Err(e) => {
                tracing::warn!("trade history query failed for character {character_id}: {e}");
                self.send_system_message(player_id, "Couldn't read your trade history right now.")
                    .await;
                return;
            }
        };

        if rows.is_empty() {
            self.send_system_message(
                player_id,
                "No recorded trades yet. Every player-to-player trade is logged here \
                 permanently the moment it completes — nothing to show until you make one.",
            )
            .await;
            return;
        }

        let now_secs = (Self::now_ms() / 1000) as i64;
        let mut lines = vec![format!(
            "Your last {} trade(s), newest first — the same permanent record used to \
             investigate disputes. Nothing here can be edited after the fact.",
            rows.len()
        )];
        lines.extend(rows.iter().map(|row| format_history_row(row, now_secs)));
        self.send_system_message(player_id, lines.join("\n")).await;
    }
}

fn format_history_row(row: &TradeHistoryRow, now_secs: i64) -> String {
    let gold_delta = row.my_gold_after - row.my_gold_before;
    let gold_str = if gold_delta >= 0 {
        format!("+{gold_delta}c")
    } else {
        format!("{gold_delta}c")
    };
    format!(
        "[{}] with {}: {gold_str} | gave {} | got {}",
        relative_time(row.traded_at, now_secs),
        row.counterparty_name,
        summarize_items(&row.my_items_given),
        summarize_items(&row.items_received),
    )
}

/// "3m ago" / "5h ago" / "12d ago" — deliberately relative rather than a
/// calendar date: correct calendar math (leap years, month lengths) needs a
/// date crate this workspace doesn't carry, and silently getting it wrong
/// would undermine a feature whose whole point is being trustworthy.
/// Relative-from-now needs nothing but subtraction.
fn relative_time(traded_at_secs: i64, now_secs: i64) -> String {
    let elapsed = now_secs.saturating_sub(traded_at_secs).max(0);
    if elapsed < 60 {
        "just now".to_string()
    } else if elapsed < 3_600 {
        format!("{}m ago", elapsed / 60)
    } else if elapsed < 86_400 {
        format!("{}h ago", elapsed / 3_600)
    } else {
        format!("{}d ago", elapsed / 86_400)
    }
}

/// `[{"def": "...", "qty": N, "ench": N}, ...]` -> `"iron_sword x1 (+3), ..."`.
/// Malformed or empty JSON reads as "nothing" rather than failing the whole
/// command — a cosmetic fallback for an edge case, never the happy path,
/// since every row here came from `ledger_items` in `player_trade.rs`.
fn summarize_items(json: &str) -> String {
    let Ok(serde_json::Value::Array(items)) = serde_json::from_str(json) else {
        return "nothing".to_string();
    };
    if items.is_empty() {
        return "nothing".to_string();
    }
    items
        .iter()
        .map(|item| {
            let def = item.get("def").and_then(|v| v.as_str()).unwrap_or("?");
            let qty = item.get("qty").and_then(|v| v.as_u64()).unwrap_or(1);
            let ench = item.get("ench").and_then(|v| v.as_i64()).unwrap_or(0);
            if ench > 0 {
                format!("{def} x{qty} (+{ench})")
            } else {
                format!("{def} x{qty}")
            }
        })
        .collect::<Vec<_>>()
        .join(", ")
}
