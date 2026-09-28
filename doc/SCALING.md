# Scaling & Memory

## 빌드 vs 실행: 2GB VM에서 무엇이 버벅였는가

**결론: `cargo build --release`가 원인이었다.** 서버를 "실행"해서
버벅인 게 아니라 "컴파일"하다 버벅인 것으로 확인됐다 — 이 둘을 구분하는
게 이 문서 전체의 출발점이다.

근거:
- `server` 크레이트가 로드하는 정적 데이터(`data-src/*.csv`) 전부 합쳐서
  **약 50KB**다 (아래 "정적 데이터 실측" 참고). 파싱해서 메모리에 올려도
  무시할 수 있는 수준이라, 서버 프로세스 자체가 2GB를 압박할 이유가
  없다.
- 반면 `Cargo.toml`엔 `rusqlite`(`bundled` — 매번 SQLite C 소스를 처음부터
  컴파일), `tokio full`, `reqwest`+`rustls`가 있고 워크스페이스 전체
  소스가 9만7천 줄이다. 콜드 캐시에서 `cargo build --release`는 rustc
  코드젠 프로세스가 병렬로 여러 개 뜨면서 피크 RSS가 2~4GB를 쉽게
  넘는다 — Rust 생태계에서 "2GB짜리 VPS/VM에서 빌드가 OOM난다"는 매우
  흔한 케이스다.

### 해법: 그 VM에서 빌드하지 않는다

이 리포는 이미 이 문제를 풀어놓은 상태다 — `.github/workflows/docker-publish.yml`이
`master` 브랜치/태그 푸시마다 서버를 빌드해서
`ghcr.io/<계정>/openmmo-server`에 멀티아키텍처(amd64/arm64) 이미지로
퍼블리시한다. `docker-compose.yml`도 이미 이 이미지를 기본값으로 쓰도록
돼 있다(`IMAGE_BASE:-ghcr.io/softkid`).

가장 빠른 경로:
1. 이 zip(또는 수정한 포크)을 본인 GitHub 저장소에 푸시한다.
2. CI가 알아서 빌드해서 `ghcr.io/<본인계정>/openmmo-server`에 올린다
   (GitHub Actions 러너는 RAM이 넉넉해서 이 빌드가 문제될 일이 없다).
3. 2GB VM에서는 컴파일을 아예 하지 않고:
   ```bash
   IMAGE_BASE=ghcr.io/<본인계정> docker compose up -d
   ```
   실행되는 건 `debian:bookworm-slim` 기반의 이미 컴파일된 바이너리 +
   최소 런타임뿐이다(`docker/server.Dockerfile`의 두 번째 스테이지).

그래도 그 VM에서 직접 빌드해야 하는 상황이라면:
- 스왑 2~4GB를 추가한다 (가장 확실한 안전망).
- `cargo build --release -j 1`로 병렬 코드젠을 1개로 제한한다 (느려지지만
  피크 메모리가 크게 줄어든다).

## 정적 데이터 실측

실제로 리포를 열어서 잰 수치다 (`data-src/*.csv`, 서버가 부팅 시 로드하는
전부):

| 파일 | 크기 | 행 수 |
| ---- | ---: | ----: |
| items.csv | 12K | 64 |
| world_drop.csv | 4K | 11 |
| player_anim_timing.csv | 4K | 8 |
| npcs.csv | 4K | 5 |
| monsters.csv | 4K | 14 |
| merchants.csv | 4K | 3 |
| map_labels.csv | 4K | 27 |
| dungeons.csv | 4K | 4 |
| debuffs.csv | 4K | 3 |
| bgm.csv | 4K | 44 |
| **합계** | **~50KB** | |

지형은 `height_sampler`/`water_sampler`(온디맨드 절차 생성 + 타일 캐시,
`sweep_stale_tiles`로 유휴 타일을 주기적으로 비움)라 부팅 시점엔 사실상
0이고, 플레이어가 실제로 탐험한 만큼만 자란다. **"정적 데이터가 메모리를
많이 먹는다"는 시나리오는 이 프로젝트 규모에선 성립하지 않는다** — 문제가
생긴다면 정적 데이터가 아니라 동접 상태(인벤토리, 골드, 이번에 추가한
`rested_bonus`/`wellbeing_sessions`/`rapport` 등)나 빌드 자체다.

## 동접당 메모리 실측: `tools/loadtest`

추정 대신 실측하는 도구를 새로 만들었다. `tools/loadtest`는 LLM 없이
`AuthenticateNpc` 경로로 로그인만 하고 그냥 연결을 들고 있는 최소
봇이다 — `agent-client`처럼 실제 게임을 하지 않는다, 딱 "서버 메모리
관점에서 진짜 플레이어 1명"이 되는 것까지만 한다.

```bash
# 서버가 이미 떠 있다고 가정 (docker compose up -d)
NPC_TOKEN=<서버의 NPC_AUTH_TOKEN 값> \
CONTAINER=openmmo-server-1 \
COUNT=100 STEP=10 INTERVAL=8 \
  ./tools/loadtest/measure.sh
```

`bots,server_mem,unix_time` 형식의 `rss_vs_connections.csv`를 만든다 —
0봇일 때의 베이스라인과, 봇이 늘 때마다의 기울기를 그대로 읽으면
"플레이어 1명당 몇 MB"가 나온다. 구조체만 보고 어림잡으면(가방+장착
아이템, 위치/스탯, WS 버퍼 등) 인당 수십~수백 KB 수준일 걸로 보이지만,
이건 진짜 숫자가 아니라 추정이다 — 위 스크립트로 실측하는 게 맞다.

**푸시 전 필수 작업 한 가지**: `tools/loadtest`를 워크스페이스 멤버로
새로 추가했는데, 이 zip을 만든 샌드박스는 `Cargo.lock`을 갱신할 수 있는
최신 Rust 툴체인이 없었다. `Cargo.lock`이 새 멤버를 아직 모르는 상태라
`cargo build --locked`를 쓰는 기존 CI(`ci.yml`)와 Docker 빌드가 깨질 수
있다 — 최신 Rust가 있는 환경에서 `cargo build`(또는 `cargo update`)를
`--locked` 없이 한 번 돌려서 `Cargo.lock`을 갱신한 뒤에 푸시할 것.

**주의**: 서버에 IP당 연결 속도 제한이 있다(`server/src/conn_limit.rs`) —
버스트 20개, 이후 초당 2개로 리필. `STEP`을 20 이하로, `INTERVAL`을
너무 짧게 잡지 말 것. 이 이상으로 밀어붙이면 일부 봇이
`CLOSE_CODE_RATE_LIMITED`로 거부되고 "failed" 카운트에 잡힌다 —
버그가 아니라 서버가 원래 하는 일이 정상 작동한 것이다.

## 동접 기반 자동 확장: `tools/autoscale`

먼저 짚어야 할 게 있다 — **이 서버는 `player_gold`/`inventories`/`rapport`
등을 프로세스 하나가 통째로 들고 있는 단일 권위 월드다.** stateless
API처럼 "로드밸런서 뒤에 복사본을 더 띄운다"가 그대로 통하지 않는다 —
복사본마다 월드 상태가 따로 논다. 그래서 두 단계로 나눈다.

### 지금 가능한 것: 수직 확장 자동화 (`watch-and-resize.sh`)

메모리 사용률/동접수를 주기적으로 재서 임계치를 넘으면 클라우드 API로
VM 스펙을 한 단계 올린다. Hetzner Cloud API를 예시로 구현했고(다른
프로바이더는 `resize_up()` 함수만 바꾸면 됨), **기본값은
`DRY_RUN=true`** — 실제로 서버를 끄고 리사이즈하고 켜는 건 명시적으로
`DRY_RUN=false`를 줘야 한다. 재부팅이 끼는 다운타임이 있다는 것도
감안할 것.

```bash
MEM_LIMIT_MIB=2048 CONN_THRESHOLD=150 \
HCLOUD_TOKEN=<token> HCLOUD_SERVER_ID=<id> DRY_RUN=true \
  ./tools/autoscale/watch-and-resize.sh
```

동접수는 `ss`로 게임 포트(10006)의 ESTABLISHED 연결을 세는 방식이라
코드 변경 없이 바로 쓸 수 있지만 다소 거친 근사치다. 서버에
`/api/metrics` 같은 정확한 엔드포인트(`self.players.read().await.len()`
하나 노출하는 정도)를 추가하면 훨씬 정확해진다 — 원하면 다음 단계로
만들 수 있다.

### 진짜 수평 확장: 월드 인스턴스(채널) 분할

인구가 한 대의 한계를 넘으면, 고전 MMO처럼 **완전히 독립된 월드 사본을
하나 더 띄우는 방식**을 권한다. 이미 코드에 있는 `floor_level` 개념으로
존/층을 잘게 쪼개는 것보다 훨씬 간단하다 — 각 인스턴스가 독립된
`docker compose` 스택(자체 SQLite, 자체 `player_gold`/`inventories`)이라
샤드 간 정합성 문제 자체가 없다. 신규 로그인을 인구가 적은 인스턴스로
돌리는 라우팅 로직만 있으면 된다. 대가는 플레이어가 인스턴스별로
나뉜다는 것 — 파티·거래·채팅이 인스턴스를 못 넘나든다. 이건 순수한
설계 작업이고, 지금 코드베이스는 아직 이걸 하지 않은 상태다.

## 관련 파일

| 역할 | 파일 |
| ---- | ---- |
| 배포 이미지 정의 | [docker/server.Dockerfile](../docker/server.Dockerfile) |
| 스택 구성 | [docker-compose.yml](../docker-compose.yml) |
| CI 빌드/퍼블리시 | [.github/workflows/docker-publish.yml](../.github/workflows/docker-publish.yml) |
| 동접 부하 생성기 | [tools/loadtest](../tools/loadtest) |
| RSS 측정 래퍼 | [tools/loadtest/measure.sh](../tools/loadtest/measure.sh) |
| 수직 확장 자동화 | [tools/autoscale/watch-and-resize.sh](../tools/autoscale/watch-and-resize.sh) |
| IP당 연결 제한 | [server/src/conn_limit.rs](../server/src/conn_limit.rs) |
