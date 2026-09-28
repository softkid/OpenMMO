# 📊 OpenMMO 동접자별 서버 상황 및 확장 구조 분석 보고서

> **문서 식별자**: `U_server_capacity_and_scaling_20260928`  
> **작성일자**: 2026년 9월 28일  
> **대상 시스템**: OpenMMO (Rust 기반 MMORPG 전용 인메모리 권위 서버 & Svelte/WebGL 클라이언트)

---

## 1. 개요 (Overview)

OpenMMO 서버는 **Rust (Tokio 멀티스레드 비동기 런타임)** 기반으로 구축된 단일 권위(Single Authoritative) MMORPG 월드 엔진입니다. 

본 문서는 동시 접속자 수(CCU: Concurrent Users) 증가에 따른 **서버 자원(CPU, RAM, Disk, Network) 사용 현황**, **부하 병목 지점**, **단계별 수직/수평 확장(Scale-Up / Scale-Out) 건축 구조**를 명확히 정의하여 안정적인 서비스 운영 가이드를 제공합니다.

---

## 2. 동접자(CCU) 구간별 서버 상황 및 권장 스펙

| 구분 | 동접자(CCU) | 권장 서버 스펙 (NCP 기준) | CPU 사용률 | RAM 사용량 | 추천 용도 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **1 ~ 30명** | **Micro**<br>(vCPU 1개, RAM 2GB, 20GB SSD) | 10% ~ 25% | ~ 350 MB | 내부 개발, 소규모 테스트 |
| **Tier 2** | **30 ~ 200명** | **Standard**<br>(vCPU 2개, RAM 8GB, 50GB SSD) | 15% ~ 35% | ~ 800 MB | 알파/베타 테스트, 입문 서비스 |
| **Tier 3** | **200 ~ 1,000명** | **High Performance**<br>(vCPU 4개, RAM 16GB, 50GB SSD) | 40% ~ 70% | 1.5GB ~ 3GB | 상용 정식 서비스 단일 서버 |
| **Tier 4** | **1,000명 이상** | **Multi-Shard / Channel**<br>(vCPU 4개 × N대 채널 분할) | 분산 처리 | 분산 처리 | 대규모 유저 서비스 (수평 확장) |

---

## 3. 세부 구간 분석 및 자원 현황

### 🔹 Tier 1: 초소형/개발 테스트 (CCU 1 ~ 30명)
* **서버 환경**: 1 vCPU / 2GB RAM / 20GB Disk
* **자원 상황**:
  * **실행 런타임**: 게임 서버 프로세스 자체 메모리는 약 100MB 내외로 매우 가볍게 유지됩니다.
  * **컴파일 이슈**: 서버에서 직접 `cargo build --release` 컴파일 시 피크 메모리가 2GB~4GB를 넘어 **OOM(Out Of Memory) 현상 발생**.
* **운영 전략**:
  * VM 내부 직접 컴파일을 금지하고, 로컬 또는 CI(GitHub Actions)에서 pre-built된 Docker 이미지를 가져와 실행(`docker compose up -d`).

### 🔹 Tier 2: 소규모 정식 운영 (CCU 30 ~ 200명)
* **서버 환경**: 2 vCPU / 8GB RAM / 50GB SSD (NCP Standard 타입)
* **자원 상황**:
  * **CPU/RAM**: 동접 200명 기준 실측 RAM 사용량은 약 800MB 수준으로 매우 안정적입니다.
  * **빌드 속도**: 2 vCPU + 8GB RAM 환경에서는 필요 시 서버 내부 직접 빌드(`docker compose up -d --build`)도 3분 내로 정상 처리됩니다.
* **운영 전략**:
  * Naver Cloud Platform (NCP) 30만원 크레딧 활용 시 가장 가성비가 뛰어난 구간 (월 약 5~6만원 수준).

### 🔹 Tier 3: 중규모 정식 서비스 (CCU 200 ~ 1,000명)
* **서버 환경**: 4 vCPU / 16GB RAM / 50GB NVMe SSD
* **자원 상황**:
  * **공간 분할(Spatial Grid) 처리**: 플레이어 이동 패킷, 충돌 판정, 몬스터 시야각(AoI: Area of Interest) 계산 및 동기화 부하 증가.
  * **네트워크**: 유저당 약 5~15 Kbps 트래픽 소모 (CCU 1,000명 시 약 10~15 Mbps 대역폭 유지).
* **운영 전략**:
  * 단일 노드(Single Node Monolith) 구조로 수용 가능한 최적의 한계 구간.

---

## 4. OpenMMO 핵심 병목 요인 및 해결책

```
[클라이언트 웹/WASM] 
        │
   (WebSocket: /ws)
        ▼
┌────────────────────────────────────────────────────────┐
│ OpenMMO Server Node (Rust / Tokio Async)                │
│                                                        │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │ Connection State │    │ Spatial Grid & Pathfind  │  │
│  │ (Auth & Session) │    │ (Monster AI / Collision) │  │
│  └──────────────────┘    └──────────────────────────┘  │
│            │                          │                │
└────────────┼──────────────────────────┼────────────────┘
             ▼                          ▼
     [SQLite State DB]         [Tile / Terrain Cache]
```

### 1) 컴파일 타임(Build-Time) vs 런타임(Run-Time) 메모리 분리
* **컴파일 타임**: Rust의 `rusqlite`, `tokio`, `reqwest` 등 중량 크레이트 코드젠으로 인해 빌드 시 최대 4GB RAM 필요.
* **런타임**: 정적 데이터(`items.csv`, `monsters.csv` 등 10여 개 파일) 총합은 **약 50KB**에 불과하며, 유저 1명당 할당 세션 메모리는 약 **200KB ~ 500KB** 수준.

### 2) 50GB 디스크 설정이 필수적인 이유
* **Docker BuildKit 캐시 유지**: 50GB 공간을 확보하면 Docker가 Rust 빌드 중간 아티팩트 및 WASM 툴체인 레이어를 계속 보관할 수 있어 재배포 시간이 5분 → **10초**로 단축됨.
* **비용 대 효과**: NCP 등 클라우드에서 50GB SSD 디스크 추가 비용은 월 약 5,000원 수준으로 매우 경제적임.

### 3) 접속 세션 속도 제한 (Rate Limiting)
* `server/src/conn_limit.rs` 모듈에 의해 동일 IP당 버스트 20개 접속, 이후 초당 2개 리필 규칙 적용. (부하 테스트 시 봇 생성 속도 조절 필요)

---

## 5. 단계별 시스템 확장 구조 (Scaling Architecture)

### 🏗️ 1단계: 수직 확장 (Vertical Scaling - Scale Up)
단일 프로세스가 전체 월드 상태(인벤토리, 위치, 골드, 몬스터)를 통째로 보유하는 아키텍처이므로 가장 쉽고 확실한 방식입니다.

```
[ 기존: Micro ] ──(NCP 콘솔 스펙 변경)──> [ 변경: Standard ]
1 vCPU / 2GB RAM                          4 vCPU / 16GB RAM / 50GB SSD
```
* **적용 방법**: NCP 콘솔에서 서버 정지 후 `vCPU 4개 / RAM 16GB`로 스펙 업그레이드 후 `resize2fs /dev/vdb` 실행.

### 🏗️ 2단계: 수평 확장 (Horizontal Scaling - Channel Sharding)
CCU 1,000명 이상으로 증가할 경우, 완전히 독립된 샤드(채널) 서버를 복수로 배치하는 수평 확장 구조를 적용합니다.

```
                         ┌─── [ Channel 1 Server Stack ] (CCU 500)
                         │     └─ SQLite DB-1
[ Web Gateway / Router ] ┼─── [ Channel 2 Server Stack ] (CCU 500)
                         │     └─ SQLite DB-2
                         └─── [ Channel 3 Server Stack ] (CCU 500)
                               └─ SQLite DB-3
```

* **구조 특징**:
  * 각 채널은 독립된 Docker Compose 스택으로 실행 (자체 SQLite DB 및 독립 인스턴스).
  * 채널 간 데이터 정합성 충돌이 없어 무제한 확장이 가능.
  * 로그인 단계에서 인구가 적은 채널로 유저를 라우팅해주는 중앙 게이트웨이만 추가 배치.

---

## 6. 운영 유지보수 명령어 킷 (Ops Commands)

### 📌 1) 서버 디스크 확장 적용 (NCP Storage 확장 후)
```bash
# 디스크 파일시스템 인식 및 50GB 확장 적용
resize2fs /dev/vdb

# 용량 확인
df -h /mnt/storage
```

### 📌 2) Docker 캐시 정리 및 재빌드
```bash
# 깨진 빌드 캐시 초기화
docker builder prune -af

# 최신 소스코드 기반 서버 강제 재빌드 및 가동
cd /mnt/storage/OpenMMO
docker compose up -d --build --force-recreate
```

### 📌 3) 부하 테스트 수행 (`tools/loadtest`)
```bash
# 100명의 가상 봇 접속 테스트
NPC_TOKEN=openmmo-secret-token \
CONTAINER=openmmo-server-1 \
COUNT=100 STEP=10 INTERVAL=8 \
  ./tools/loadtest/measure.sh
```

---
*본 문서는 OpenMMO 프로젝트의 `doc/U_server_capacity_and_scaling_20260928.md`에 저장되어 보관됩니다.*
