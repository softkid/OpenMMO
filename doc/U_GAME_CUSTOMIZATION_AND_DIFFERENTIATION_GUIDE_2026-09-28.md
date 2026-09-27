# HAHAOGAMES MMORPG - 게임 독자성 확보 및 커스터마이징 가이드

본 문서는 **HAHAOGAMES MMORPG**가 기존 오픈소스 엔진 기반에서 탈피하여 독자적인 세계관과 정체성을 갖춘 차별화된 플레이 경험을 제공하기 위한 시스템별 수정 파일 위치 및 설정 가이드입니다.

---

## 🗺️ 1. 세계관 지명 및 맵 라벨 (Map Labels & World Names)

게임 내 미니맵과 전체 월드맵 탐험 시 노출되는 지명과 거점 명칭을 커스텀 변경합니다.

* **수정 파일**: `data-src/map_labels.csv`
* **주요 항목**:
  * `id`: 라벨 고유 식별자
  * `text`: 게임 내 맵상에 렌더링될 실제 지명 텍스트 (예: `하하고 중앙 광장`, `룬 성채 외곽`, `태양의 기슭`)
  * `x, y, z`: 지명 표시 월드 좌표

---

## 📜 2. NPC 스토리, 대사 및 상점 설정 (NPCs & Quests)

NPC의 이름, 역할, 대화 지문 및 상점 판매 품목을 새로운 게임 스토리에 맞게 변경합니다.

* **NPC 목록 및 대사 수정**: `data-src/npcs.csv`
  * NPC 이름, 기본 인사말, 퀘스트 지문 및 대화 스크립트
* **상인 판매 목록 수정**: `data-src/merchants.csv`
  * 마을 상인이 판매하는 물품 목록 및 골드 가격 설정

---

## 🗡️ 3. 아이템 & 몬스터 명칭 및 세계관 텍스트 (Items & Monsters Lore)

아이템 툴팁의 이름과 설명문, 몬스터 이름을 HAHAOGAMES 고유 명칭으로 변경합니다.

* **아이템 데이터 수정**: `data-src/items.csv`
  * `id`, `name`: 아이템 명칭 (예: `하하고 영웅의 세이버`, `빛나는 룬 포션`)
  * `description`: 아이템 배경 스토리(Lore) 및 효과 설명
  * `tier`, `value`: 아이템 등급 및 가치
* **몬스터 데이터 수정**: `data-src/monsters.csv`
  * `id`, `name`: 몬스터 명칭 (예: `그림자 골짜기 고블린`, `심연의 트롤`)
  * `hp`, `attack`, `exp`: 몬스터 밸런스 능력치

---

## 🎨 4. 인게임 UI 스킨 테마 & 폰트 (HUD UI Styling)

게임 접속 시 노출되는 체력바, 미니맵, 인벤토리, 채팅창 및 툴팁 프레임의 Visual Design을 다크 판타지 스타일로 변경합니다.

* **글로벌 타이포그래피 & 폰트**: `client/index.html`
  * Google Fonts (Cinzel, Outfit, Noto Sans KR 등 적용)
* **UI 컴포넌트 커스텀 위치**: `client/src/lib/components/`
  * `LoginScreen.svelte`: 랜딩 메인 화면
  * `HUD.svelte` / `StatusPanel.svelte`: 체력바 및 플레이어 상태창
  * `Inventory.svelte`: 인벤토리 및 장비 슬롯 프레임
  * `ItemTooltip.svelte`: 아이템 툴팁 디자인

---

## 🔊 5. 타격감 및 전투 효과음 (Sound Effects - SFX)

전투, 낚시, 포션 사용, 레벨업 시 재생되는 사운드 이펙트 리스트입니다.

* **위치**: `client/public/sounds/`
* **주요 효과음 파일**:
  * `sword-flesh.ogg`, `sword-flesh2.ogg`, `sword-flesh3.ogg`: 검 피격음
  * `sword-miss.ogg`, `sword-miss2.ogg`: 공격 회피/미스음
  * `sword-leather.ogg`: 갑옷 타격음
  * `fishing-cast.ogg`, `fishing-catch.ogg`, `fishing-splash.ogg`: 낚시 효과음

---

## ⚙️ 6. CSV 데이터 적용 방법

`data-src/` 폴더 내의 CSV 파일들을 수정한 후에는 프로젝트 빌드 시 자동으로 JSON 데이터로 변환되어 게임에 반영됩니다:

```bash
# 데이터 변환 스크립트 자동 실행
npm run generate:csv
```

수정 후 `git push`를 진행하시면 서버에 새로운 지명, 퀘스트, 아이템 명칭이 즉시 업데이트됩니다.
