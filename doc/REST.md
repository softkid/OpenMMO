# Rested Growth & Mindfulness Nudges

두 가지 작은 장치를 다룬다. 공통점은 하나다 — **둘 다 아무것도 빼앗지
않는다.** 휴식 보상은 보너스만 얹고, 마음챙김 넛지는 메시지 하나만
보낸다. "안 하면 손해"라는 구조를 만들지 않는 것이 설계의 전부다.
배경은 [doc/NEXT_GEN_VISION.md](NEXT_GEN_VISION.md) 4.1, 4.2절.

## 휴식 보상 (Rested Growth)

접속을 끊고 있던 시간만큼, 다시 접속했을 때 잠시 경험치를 더 준다.
WoW의 "rested XP" 개념을 참고했지만 구현은 더 단순하다 — 저장해 뒀다
까먹는 "풀(pool)"이 아니라, **로그인 시 정해지는 시간 창(window)** 이다.

- 로그아웃 상태로 10분 이상 지나야 발동한다 (재접속 남용 방지).
- 오프라인 1시간당 1분씩, 최대 120분(2시간)까지 "+50% 경험치" 창이
  열린다.
- 창이 열려 있는 동안 얻는 모든 몬스터 처치 경험치에 50%가 더 붙는다.
  창은 시간이 다 되면 그냥 끝난다 — 다 못 쓴다고 손해 보는 것도, 아껴서
  나중에 쓸 수 있는 것도 아니다.
- 로그인 시 시스템 메시지로 알려준다: "Welcome back — you're well
  rested. The next N minutes of play earn +50% XP."

캐릭터 레벨과 무관하게 "얼마나 쉬었는가"만 본다 — 초반 캐릭터든 고레벨
캐릭터든 같은 2시간을 쉬면 같은 2시간의 보너스를 받는다. 절대 경험치
액수로 캡을 잡으면 레벨마다 다시 튜닝해야 하는데, 시간으로 캡을 잡으면
그럴 필요가 없다.

### 데이터

`characters` 테이블에 `logged_out_at`(INTEGER, nullable) 컬럼을
추가했다. 이 컬럼은 Rust 코드가 직접 쓰지 않는다 — 매 저장(주기적
자동저장이든 로그아웃이든)마다 `write_character_states`의 UPDATE문이
SQLite 자신의 시계(`strftime('%s','now')`)로만 채운다. 클라이언트가
보낸 시각을 신뢰하지 않기 위해서고, 서버가 비정상 종료돼도 마지막
자동저장 시각이 "대략 언제 그만뒀는지"의 합리적인 근사치로 남는다는
부수 효과도 있다.

### 조정 손잡이

- `RESTED_MINUTES_PER_HOUR_AWAY`, `RESTED_MAX_MINUTES`,
  `RESTED_MIN_AWAY_SECS` — 창의 길이와 발동 조건.
- `RESTED_BONUS_NUM` / `RESTED_BONUS_DEN` — 보너스 비율(현재 1/2 = +50%).
- 구현: [server/src/game_state/wellbeing.rs](../server/src/game_state/wellbeing.rs)
  (`rested_minutes_for_gap`, `grant_rested_bonus`, `apply_rested_bonus`).
  적용 지점은 [server/src/game_state/combat.rs](../server/src/game_state/combat.rs)의
  `grant_monster_kill_xp` — 수령자별로 각자의 창을 따로 확인하므로, 파티
  중 한 명만 쉬고 왔어도 그 사람만 보너스를 받는다.

## 마음챙김 세션 넛지

일정 시간 이상 연속 접속해 있으면, 판단하지 않는 부드러운 알림을 딱 한
번 보낸다. 강제 로그아웃도, 카운트다운도, 경고 문구도 아니다.

| 경과 시간 | 메시지 |
| --------- | ------ |
| ~2시간 | "You've been playing for about 2 hours. No rush — just a friendly clock check." |
| ~4시간 | "Around 4 hours in this session now. A good moment for a stretch and some water, if you feel like it." |

세션마다 각 메시지는 최대 한 번만 뜬다. 로그인할 때 세션 시계가
새로 시작되고, 로그아웃하면 버려진다 — 어떤 것도 저장되지 않고, 어떤
것도 다음 접속에 영향을 주지 않는다.

- 구현: `wellbeing.rs`의 `NUDGE_THRESHOLDS` / `due_nudge` /
  `tick_wellbeing_nudges`.
- 60초 주기 백그라운드 틱에서 돌아간다
  ([server/src/main.rs](../server/src/main.rs)의 `"wellbeing"` 틱).
- 공식 NPC는 세션 시계 자체가 생기지 않는다 — 알림 대상이 아니다.

### 조정 손잡이

- `NUDGE_THRESHOLDS` 배열에 항목을 추가/수정하면 된다. 문구를 바꿀
  때는 "권유"가 아니라 "정보 제공"의 톤을 유지할 것 — 이 시스템의
  전제는 플레이어를 신뢰하는 것이지 관리하는 것이 아니다.
