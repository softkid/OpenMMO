# HAHAOGAMES MMORPG - 캐릭터 및 이미지 에셋 교체 가이드

본 문서는 **HAHAOGAMES MMORPG**의 캐릭터 3D 모델, 초상화 원화, 몬스터, UI 아이콘 및 아이템 그래픽을 커스텀 디자인으로 교체하고 수정하기 위한 전체 리스트 및 가이드입니다.

---

## 👤 1. 플레이어 캐릭터 (Player Classes)

게임 내 플레이어 직업별 3D 모델 파일(`.glb`)과 선택 화면 및 프로필용 초상화 이미지 리스트입니다.

### 1) 캐릭터 3D 모델 (위치: `client/public/models/` 또는 로컬 빌드 경로)
| 직업 (Class) | 성별 | 3D 모델 파일명 | 주요 비고 |
| :--- | :---: | :--- | :--- |
| **Knight** (기사) | 남성 | `knight.glb` | 기본 판금 갑옷 / 검 장착 |
| **Knight** (기사) | 여성 | `female_knight.glb` | 여성 기사 판금 갑옷 |
| **Barbarian** (야만전사) | 남성 | `barbarian.glb` | 야성적인 전사 스타일 |
| **Barbarian** (야만전사) | 여성 | `female_barbarian.glb` | 여성 바바리안 |
| **Caveman** (원시전사) | 남성 | `caveman.glb` | 원시 스타일 몽둥이 전사 |
| **Caveman** (원시전사) | 여성 | `cavewoman.glb` | 여성 원시전사 |
| **Priest** (사제) | 남성 | `priest.glb` | 사제 로브 / 지팡이 |
| **Priest** (사제) | 여성 | `female_priest.glb` | 여성 성직자 |
| **Ranger** (궁수) | 남성 | `ranger.glb` | 가죽 갑옷 / 활 장착 |
| **Rogue** (도적) | 남성 | `rogue.glb` | 암살자 / 단검 스텔스 |
| **Rogue** (도적) | 여성 | `female_rogue.glb` | 여성 도적 |
| **Valkyrie** (발키리) | 단일(여) | `valkyrie.glb` | 창과 방패를 든 여전사 |
| **Bard** (바드) | 단일(여) | `female_bard.glb` | 만돌린 악기를 든 방랑시인 |

### 2) 캐릭터 초상화 및 원화 (위치: `client/public/character_concepts/`)
캐릭터 선택 화면 및 대표 프로필에 표시되는 이미지 파일 리스트입니다:

* `knight.png` / `female_knight.png`
* `barbarian.png` / `female_barbarian.png`
* `caveman.png` / `cavewoman.png`
* `priest.png` / `female_priest.png`
* `ranger.png`
* `rogue.png` / `female_rogue.png`
* `valkyrie.jpg`
* `female_bard.png`

---

## 🏬 2. NPC 캐릭터 (Non-Player Characters)

마을과 거점에 배치된 주요 NPC 3D 모델 및 프로필 초상화입니다.

| NPC 이름 | 역할 | 3D 모델 파일명 | 프로필 초상화 경로 |
| :--- | :--- | :--- | :--- |
| **Karl** (칼) | 경비병 | `guard.glb` | `client/public/portraits/karl.png` |
| **Rica** (리카) | 일반 상인 | `npc_woman.glb` | `client/public/portraits/rica.png` |
| **Wick** (윅) | 야간 암시장 상인 | `night_merchant.glb` | - |

---

## 👹 3. 몬스터 3D 모델 (Monsters)

필드 및 던전에서 등장하는 몬스터 3D GLTF 모델 리스트입니다.

| 몬스터 분류 | 3D 모델 파일명 | 특징 및 애니메이션 |
| :--- | :--- | :--- |
| **Orc** (오크 전사) | `orc.glb` / `female_orc.glb` | 가죽 갑옷 전사 몬스터 |
| **Goblin** (고블린) | `goblin.glb` | 정찰형 소형 몬스터 |
| **Hobgoblin** (홉고블린) | `hobgoblin.glb` | 중형 아머 장착 오크 |
| **Gnoll** (놀) | `gnoll.glb` | 하이에나 수인 야수형 몬스터 |
| **Bugbear** (버그베어) | `bugbear.glb` | 대형 철퇴 수인 전사 |
| **Ogre** (오거) | `ogre.glb` | 거대 대형 몽둥이 오거 |
| **Troll** (트롤) | `troll.glb` | 재생 능력을 가진 대형 트롤 |
| **Kobold** (코볼드) | `kobold.glb` | 지하 유적 소형 몬스터 |

---

## 🛡️ 4. UI 및 직업 벡터 아이콘 (Party UI & Class Icons)

파티 창, HP바 및 직업 구분 표시에 사용되는 SVG 벡터 아이콘 리스트입니다.

* **위치**: `client/public/icons/party/`
  * `class-knight.svg`: 기사 직업 아이콘
  * `class-barbarian.svg`: 야만전사 직업 아이콘
  * `class-caveman.svg`: 원시전사 직업 아이콘
  * `class-valkyrie.svg`: 발키리 직업 아이콘
  * `class-ranger.svg`: 궁수 직업 아이콘
  * `class-priest.svg`: 사제 직업 아이콘
  * `class-rogue.svg`: 도적 직업 아이콘
  * `class-bard.svg`: 바드 직업 아이콘
  * `leader-crown.svg`: 파티장 왕관 표시 아이콘

---

## 🗡️ 5. 아이템 그래픽 아이콘 (Items & Inventory Icons)

인벤토리, 장비창, 상점에서 표시되는 아이템 2D 슬롯 그래픽입니다.

* **무기 (`client/public/items/weapons/`)**:
  * `iron_sword.png` (철검), `steel_longsword.png` (강철 롱소드), `dagger.png` (단검)
  * `spear_icon.png` (창), `greatclub.png` (대형 몽둥이), `mandolin.png` (만돌린)
  * `fishing_rod.png` (낚싯대), `torch.png` (횃불)
* **방어구 (`client/public/items/armor/`)**:
  * `plate_armor.png`, `plate_helmet.png`, `plate_gauntlets.png`, `plate_greaves.png`
  * `leather_armor.png`, `leather_helmet.png`, `leather_boots.png`, `leather_gloves.png`
  * `chain_mail.png`, `iron_boots.png`, `shield_wooden.png`, `shield_raven.png`
* **악세사리 & 소비재 (`client/public/items/objects/`, `accessory/`)**:
  * `healing_potion.png` (체력 포션), `scroll_of_enchant_weapon.png` (무기 강화 주문서)
  * `scroll_of_enchant_armor.png` (방어구 강화 주문서), `scroll_of_return.png` (귀환 주문서)
  * `gold_ring.png` (반지), `silver_necklace.png` (목걸이), `coin_pile.png` (골드 주머니)

---

## 🎨 6. 그래픽 및 3D 모델 교체 작업 가이드

1. **2D 이미지/초상화 교체**:
   * 동일한 파일명과 PNG/SVG 포맷으로 해당 경로에 덮어쓰기만 하면 즉시 적용됩니다.
2. **3D 캐릭터/몬스터 모델 교체**:
   * 3D 모델은 **Mixamo 리깅(Mixamo Humanoid Rig)** 이 적용된 `.glb` (GLTF Binary) 포맷을 사용합니다.
   * Blender 등에서 애니메이션 bone 이름의 `mixamorig:` 접두사를 제거하고 `Y-Up` 좌표계로 export 하여 `client/public/models/` 경로에 배치하면 런타임에 모션이 자동 연동됩니다.
