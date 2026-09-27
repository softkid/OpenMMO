//! Minimal, LLM-free load generator (doc/SCALING.md). Opens N WebSocket
//! connections against a running server via the same `AuthenticateNpc` path
//! `agent-client` uses, then just holds them open and drains whatever the
//! server sends. No AI backend, no gameplay decisions — the only job here is
//! to be *realistic connection load* (a real logged-in `Player` entity with
//! a real inventory, gold entry, wellbeing session, etc.) so that sampling
//! the server's RSS at each ramp step (see `measure.sh`) measures actual
//! bytes-per-player instead of a guess.
//!
//! Deliberately not a dependent of the `agent-client` crate: that would drag
//! in its LLM/Google-auth/axum dependency tree for no reason. This
//! reimplements just the handshake, trimmed to what a bot that never acts
//! needs.

use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use std::time::Duration;

use clap::Parser;
use futures_util::{SinkExt, StreamExt};
use onlinerpg_shared::{
    deserialize_server_msg, serialize_client_msg, CharacterClass, ClientMessage, Gender,
    ServerMessage,
};
use tokio_tungstenite::tungstenite::Message;
use tracing::{info, warn};

type WsStream =
    tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>;

#[derive(Parser)]
#[command(about = "Ramps up N idle bot connections against an OpenMMO server \
to measure server memory per concurrent player (doc/SCALING.md). Prints \
`READY <n>` to stdout at each ramp plateau so a wrapper script can sample \
the server's RSS in step.")]
struct Cli {
    /// WebSocket URL of the game port (10006 in docker-compose.yml) — not
    /// the HTTP API port (10007).
    #[arg(long, default_value = "ws://127.0.0.1:10006")]
    url: String,

    /// Must match the server's NPC_AUTH_TOKEN env var. Each bot authenticates
    /// as its own account under this shared token, same as agent-client.
    #[arg(long, env = "NPC_AUTH_TOKEN")]
    npc_token: String,

    /// Total bots to ramp up to.
    #[arg(long, default_value_t = 100)]
    count: u32,

    /// Bots added per ramp step.
    #[arg(long, default_value_t = 10)]
    ramp_step: u32,

    /// Seconds to wait between ramp steps — gives a wrapper script time to
    /// sample the server's memory at each plateau before more load lands.
    #[arg(long, default_value_t = 5)]
    ramp_interval_secs: u64,

    /// Seconds to hold at the full count before exiting. 0 holds forever
    /// (Ctrl-C to stop, or let the wrapper script kill this process).
    #[arg(long, default_value_t = 0)]
    hold_secs: u64,

    /// Prefix for each bot's account name. Reusing the same prefix across
    /// runs reuses the same characters (AuthenticateNpc auto-creates the
    /// account, EnterGame reuses an existing character) instead of piling up
    /// new throwaway ones every run.
    #[arg(long, default_value = "loadtest")]
    account_prefix: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();
    let cli = Cli::parse();

    let connected = Arc::new(AtomicU32::new(0));
    let failed = Arc::new(AtomicU32::new(0));

    let mut next_bot = 0u32;
    while next_bot < cli.count {
        let batch_end = (next_bot + cli.ramp_step.max(1)).min(cli.count);
        for i in next_bot..batch_end {
            let url = cli.url.clone();
            let npc_token = cli.npc_token.clone();
            let account = format!("{}-{i:05}", cli.account_prefix);
            let connected = Arc::clone(&connected);
            let failed = Arc::clone(&failed);
            tokio::spawn(async move {
                if let Err(e) = run_bot(&url, &npc_token, &account, &connected).await {
                    failed.fetch_add(1, Ordering::Relaxed);
                    warn!("[{account}] gave up: {e}");
                }
                connected.fetch_sub(1, Ordering::Relaxed);
            });
        }
        next_bot = batch_end;

        // Bots connect concurrently and asynchronously, so give this step's
        // batch a moment to actually finish logging in before reporting —
        // otherwise the printed count undercounts stragglers.
        tokio::time::sleep(Duration::from_millis(500)).await;
        info!(
            "Ramped to {next_bot}/{} requested — {} confirmed connected, {} failed so far",
            cli.count,
            connected.load(Ordering::Relaxed),
            failed.load(Ordering::Relaxed)
        );
        println!("READY {next_bot}");
        if next_bot < cli.count {
            tokio::time::sleep(Duration::from_secs(cli.ramp_interval_secs)).await;
        }
    }

    if cli.hold_secs == 0 {
        info!(
            "Holding indefinitely at {} bots — Ctrl-C to stop.",
            cli.count
        );
        std::future::pending::<()>().await;
    } else {
        info!("Holding for {}s before exiting.", cli.hold_secs);
        tokio::time::sleep(Duration::from_secs(cli.hold_secs)).await;
    }
    Ok(())
}

/// One bot's whole life: connect, log in as `account` (auto-created on first
/// use), enter with its first character (rolling and creating one if it has
/// none yet), then just drain the socket until it closes or errors. Bumps
/// `connected` the moment login succeeds — including RollCharacterStats/
/// CreateCharacter time, since the server is already holding an account and
/// (once created) an inventory for this bot by then.
async fn run_bot(
    url: &str,
    npc_token: &str,
    account: &str,
    connected: &AtomicU32,
) -> anyhow::Result<()> {
    let (stream, _) = tokio_tungstenite::connect_async(url).await?;
    let (mut tx, mut rx) = stream.split();

    send(
        &mut tx,
        &ClientMessage::ClientInfo {
            protocol_version: onlinerpg_shared::PROTOCOL_VERSION,
            client_kind: "cli".to_string(),
            client_version: "loadtest".to_string(),
        },
    )
    .await?;

    send(
        &mut tx,
        &ClientMessage::AuthenticateNpc {
            account_name: account.to_string(),
            npc_token: npc_token.to_string(),
        },
    )
    .await?;
    let characters = match recv(&mut rx).await? {
        ServerMessage::AuthSuccess { characters, .. } => characters,
        ServerMessage::AuthError { message } => {
            anyhow::bail!("auth rejected: {message}")
        }
        other => anyhow::bail!("unexpected reply to AuthenticateNpc: {other:?}"),
    };
    connected.fetch_add(1, Ordering::Relaxed);

    let character_id = if let Some(existing) = characters.first() {
        existing.id
    } else {
        send(
            &mut tx,
            &ClientMessage::RollCharacterStats {
                character_class: CharacterClass::Knight,
                gender: Gender::Male,
            },
        )
        .await?;
        match recv(&mut rx).await? {
            ServerMessage::CharacterStatsRolled { .. } => {}
            other => anyhow::bail!("unexpected reply to RollCharacterStats: {other:?}"),
        }
        send(
            &mut tx,
            &ClientMessage::CreateCharacter {
                character_name: account.to_string(),
                character_class: CharacterClass::Knight,
                gender: Gender::Male,
            },
        )
        .await?;
        match recv(&mut rx).await? {
            ServerMessage::CharacterCreated { character } => character.id,
            ServerMessage::CharacterError { message } => {
                anyhow::bail!("character creation rejected: {message}")
            }
            other => anyhow::bail!("unexpected reply to CreateCharacter: {other:?}"),
        }
    };

    send(&mut tx, &ClientMessage::EnterGame { character_id }).await?;

    // From here on this is a real logged-in player as far as the server's
    // memory is concerned. Just drain everything it sends — world
    // snapshots, GameTimeSync, whatever — until the socket ends. A rejected
    // EnterGame surfaces here as a Close or an AuthError-shaped message
    // rather than a dedicated reply, so this loop is where that failure
    // would be caught too.
    loop {
        match rx.next().await {
            Some(Ok(Message::Binary(_))) => continue,
            Some(Ok(Message::Ping(_) | Message::Pong(_))) => continue,
            Some(Ok(Message::Close(frame))) => {
                let reason = frame.map(|f| f.reason.to_string()).unwrap_or_default();
                anyhow::bail!("server closed connection: {reason}");
            }
            Some(Ok(_)) => continue,
            Some(Err(e)) => anyhow::bail!("websocket error: {e}"),
            None => anyhow::bail!("stream ended"),
        }
    }
}

async fn send(
    tx: &mut futures_util::stream::SplitSink<WsStream, Message>,
    msg: &ClientMessage,
) -> anyhow::Result<()> {
    let bytes = serialize_client_msg(msg)?;
    tx.send(Message::Binary(bytes.into())).await?;
    Ok(())
}

async fn recv(
    rx: &mut futures_util::stream::SplitStream<WsStream>,
) -> anyhow::Result<ServerMessage> {
    loop {
        match rx.next().await {
            Some(Ok(Message::Binary(bytes))) => return Ok(deserialize_server_msg(&bytes)?),
            Some(Ok(Message::Ping(_) | Message::Pong(_))) => continue,
            Some(Ok(Message::Close(frame))) => {
                let reason = frame.map(|f| f.reason.to_string()).unwrap_or_default();
                anyhow::bail!("server closed connection during handshake: {reason}");
            }
            Some(Ok(_)) => continue,
            Some(Err(e)) => anyhow::bail!("websocket error during handshake: {e}"),
            None => anyhow::bail!("stream ended during handshake"),
        }
    }
}
