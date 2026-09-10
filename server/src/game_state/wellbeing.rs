//! Rested growth and mindfulness nudges (doc/REST.md): two small,
//! deliberately non-punishing counterweights to "log in constantly or fall
//! behind" pressure. Neither one ever takes anything away — rested growth
//! only ever adds a temporary XP bonus, and the session nudge only ever
//! sends a once-per-threshold, judgment-free system message. Both are
//! exempt for official NPCs, mirroring `hunger.rs`'s exemption.
//!
//! In-memory only: a restart forgets an in-progress rested window or
//! session clock, which is the conservative failure direction for a bonus
//! (never a punishment) and a clock (never a lockout).

use crate::types::PlayerId;

/// A rested-XP window granted at login, consumed passively as XP comes in
/// (see `GameState::apply_rested_bonus`) until it expires.
pub(crate) struct RestedBonus {
    /// Wall-clock ms (`GameState::now_ms`) after which the bonus no longer
    /// applies, spent or not — it is a window, not a banked amount, so it
    /// never rewards sitting idle to "save it up".
    pub(crate) expires_at_ms: u64,
}

/// One player's session clock, for the mindfulness nudge only. Never
/// persisted, never read by anything else, never used to restrict play.
pub(crate) struct SessionClock {
    pub(crate) started_at_ms: u64,
    /// How many of `NUDGE_THRESHOLDS` have already fired this session, so
    /// each one sends at most once.
    pub(crate) nudged_through: usize,
}

/// Extra XP while a rested bonus is active: +50%.
pub(crate) const RESTED_BONUS_NUM: u32 = 1;
pub(crate) const RESTED_BONUS_DEN: u32 = 2;

/// One minute of +50% XP per hour logged out.
const RESTED_MINUTES_PER_HOUR_AWAY: u64 = 1;
/// Cap on the window itself — generous for a long weekend away, but a
/// month-long absence isn't worth more than that: this is a welcome-back
/// gift, not a reason to stay away longer.
const RESTED_MAX_MINUTES: u64 = 120;
/// Below this gap, nothing is granted — a reconnect or a crash-and-relog
/// isn't "rest", and this keeps the bonus from being farmed by relogging.
const RESTED_MIN_AWAY_SECS: i64 = 600;

/// From a DB `logged_out_at` (epoch seconds; `None` for a character that has
/// never logged out) and the current time, how many minutes of +50% XP this
/// login earns — 0 if there is nothing to grant.
pub(crate) fn rested_minutes_for_gap(logged_out_at: Option<i64>, now_unix_secs: i64) -> u64 {
    let Some(logged_out_at) = logged_out_at else {
        return 0;
    };
    let away_secs = now_unix_secs.saturating_sub(logged_out_at);
    if away_secs < RESTED_MIN_AWAY_SECS {
        return 0;
    }
    let away_hours = (away_secs / 3600) as u64;
    (away_hours * RESTED_MINUTES_PER_HOUR_AWAY).min(RESTED_MAX_MINUTES)
}

/// The login system message for a granted rested window. Only called when
/// `minutes` is nonzero — the caller skips it entirely otherwise.
pub(crate) fn rested_welcome_message(minutes: u64) -> String {
    format!(
        "Welcome back — you're well rested. The next {minutes} minute{} of play earn +50% XP.",
        if minutes == 1 { "" } else { "s" }
    )
}

/// Session-length nudge thresholds (elapsed ms since login) and the message
/// each sends, in order. Deliberately not a countdown, a hard stop, or
/// anything framed as a warning — a visible, one-time "you might want to
/// know," nothing more.
const NUDGE_THRESHOLDS: &[(u64, &str)] = &[
    (
        2 * 60 * 60 * 1000,
        "You've been playing for about 2 hours. No rush — just a friendly clock check.",
    ),
    (
        4 * 60 * 60 * 1000,
        "Around 4 hours in this session now. A good moment for a stretch and some water, if you feel like it.",
    ),
];

/// Which nudge (if any) is newly due for a session `elapsed_ms` old that has
/// already sent `nudged_through` of them, in order. `None` if nothing is due
/// yet, otherwise the message and the new `nudged_through` count.
fn due_nudge(elapsed_ms: u64, nudged_through: usize) -> Option<(&'static str, usize)> {
    let (threshold_ms, message) = NUDGE_THRESHOLDS.get(nudged_through)?;
    (elapsed_ms >= *threshold_ms).then_some((*message, nudged_through + 1))
}

impl super::GameState {
    /// Start (or restart, on rejoin) this player's session clock. Skipped
    /// for official NPCs — nothing about this system concerns them.
    pub(crate) async fn register_wellbeing_session(&self, player_id: &PlayerId) {
        self.wellbeing_sessions.write().await.insert(
            *player_id,
            SessionClock {
                started_at_ms: Self::now_ms(),
                nudged_through: 0,
            },
        );
    }

    /// Compute and store this login's rested-XP window from the character's
    /// last logout, returning the granted minutes (0 if none) so the caller
    /// can fold a welcome message into the login response. Skipped for
    /// official NPCs.
    pub(crate) async fn grant_rested_bonus(
        &self,
        player_id: &PlayerId,
        logged_out_at: Option<i64>,
    ) -> u64 {
        let now_unix_secs = (Self::now_ms() / 1000) as i64;
        let minutes = rested_minutes_for_gap(logged_out_at, now_unix_secs);
        if minutes == 0 {
            return 0;
        }
        let expires_at_ms = Self::now_ms() + minutes * 60_000;
        self.rested_bonus
            .write()
            .await
            .insert(*player_id, RestedBonus { expires_at_ms });
        minutes
    }

    /// Apply any active rested bonus to a base XP award, consuming none of
    /// it early — the window is time-based, not a spendable pool, so a big
    /// kill doesn't burn through it faster than a small one.
    pub(crate) async fn apply_rested_bonus(&self, player_id: &PlayerId, base_xp: u32) -> u32 {
        let active = self
            .rested_bonus
            .read()
            .await
            .get(player_id)
            .is_some_and(|bonus| bonus.expires_at_ms > Self::now_ms());
        if !active {
            return base_xp;
        }
        base_xp + base_xp * RESTED_BONUS_NUM / RESTED_BONUS_DEN
    }

    /// Sweep every session clock for a newly due nudge and send it. Cheap
    /// empty-map early-out; meant for a ~60s background tick.
    pub(crate) async fn tick_wellbeing_nudges(&self) {
        let due: Vec<(PlayerId, &'static str)> = {
            let mut sessions = self.wellbeing_sessions.write().await;
            if sessions.is_empty() {
                return;
            }
            let now = Self::now_ms();
            let mut due = Vec::new();
            for (player_id, clock) in sessions.iter_mut() {
                let elapsed = now.saturating_sub(clock.started_at_ms);
                if let Some((message, next)) = due_nudge(elapsed, clock.nudged_through) {
                    clock.nudged_through = next;
                    due.push((*player_id, message));
                }
            }
            due
        };
        for (player_id, message) in due {
            self.send_system_message(&player_id, message).await;
        }
    }

    /// Drop both the rested window and the session clock. Cheap even when
    /// neither exists (most disconnects: the window expired, or it's an
    /// official NPC that never had one).
    pub(crate) async fn forget_wellbeing(&self, player_id: &PlayerId) {
        self.rested_bonus.write().await.remove(player_id);
        self.wellbeing_sessions.write().await.remove(player_id);
    }
}
