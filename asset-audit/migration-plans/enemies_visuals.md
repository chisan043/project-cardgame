# Asset Migration Plan: enemies_visuals

This is a review-only plan. No source asset was moved, renamed, copied, or archived.

## Scope

- Source prefix: `头像/怪物/`
- Include prefixes: `怪物/战斗立绘/`, `assets/enemies/`, `assets/source/enemies/`
- Target runtime directory: `assets/enemies`
- Assets in scope: 80
- Duplicate extension groups: 40

## Counts

### Status
- active_dynamic: 40
- source: 40

### Action

- move_as_source: 40
- move_then_rewrite_dynamic_refs: 40

### Git Tracking

- tracked: 80

## Proposed Entries

### `头像/怪物/【深渊主宰】.png`

- Suggested path: `assets/source/enemies/portraits/abyss_overlord_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/【深渊主宰】.webp`

- Suggested path: `assets/enemies/portraits/abyss_overlord_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/【精英】不死骨龙.png`

- Suggested path: `assets/source/enemies/portraits/undead_bone_dragon_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/【精英】不死骨龙.webp`

- Suggested path: `assets/enemies/portraits/undead_bone_dragon_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/【精英】狂暴牛头人.png`

- Suggested path: `assets/source/enemies/portraits/elite_minotaur_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/【精英】狂暴牛头人.webp`

- Suggested path: `assets/enemies/portraits/elite_minotaur_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/【精英】猩红血巫.png`

- Suggested path: `assets/source/enemies/portraits/crimson_blood_witch_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/【精英】猩红血巫.webp`

- Suggested path: `assets/enemies/portraits/crimson_blood_witch_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/【首领】鬼面修罗.png`

- Suggested path: `assets/source/enemies/portraits/boss_oni_shura_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/【首领】鬼面修罗.webp`

- Suggested path: `assets/enemies/portraits/boss_oni_shura_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/剧毒蟾蜍.png`

- Suggested path: `assets/source/enemies/portraits/venom_toad_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/剧毒蟾蜍.webp`

- Suggested path: `assets/enemies/portraits/venom_toad_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/千载魔蛛.png`

- Suggested path: `assets/source/enemies/portraits/ancient_spider_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/千载魔蛛.webp`

- Suggested path: `assets/enemies/portraits/ancient_spider_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/嗜血蝙蝠.png`

- Suggested path: `assets/source/enemies/portraits/blood_bat_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/嗜血蝙蝠.webp`

- Suggested path: `assets/enemies/portraits/blood_bat_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/堕落剑客.png`

- Suggested path: `assets/source/enemies/portraits/fallen_swordsman_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/堕落剑客.webp`

- Suggested path: `assets/enemies/portraits/fallen_swordsman_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/巨力石魔.png`

- Suggested path: `assets/source/enemies/portraits/stone_golem_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/巨力石魔.webp`

- Suggested path: `assets/enemies/portraits/stone_golem_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/幽冥法师.png`

- Suggested path: `assets/source/enemies/portraits/nether_mage_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/幽冥法师.webp`

- Suggested path: `assets/enemies/portraits/nether_mage_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/暴躁野猪.png`

- Suggested path: `assets/source/enemies/portraits/angry_boar_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/暴躁野猪.webp`

- Suggested path: `assets/enemies/portraits/angry_boar_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/枯骨煞兵.png`

- Suggested path: `assets/source/enemies/portraits/bone_soldier_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/枯骨煞兵.webp`

- Suggested path: `assets/enemies/portraits/bone_soldier_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/病弱史莱姆.png`

- Suggested path: `assets/source/enemies/portraits/sick_slime_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/病弱史莱姆.webp`

- Suggested path: `assets/enemies/portraits/sick_slime_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/缝合巨怪.png`

- Suggested path: `assets/source/enemies/portraits/stitched_brute_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/缝合巨怪.webp`

- Suggested path: `assets/enemies/portraits/stitched_brute_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/荒野煞狼.png`

- Suggested path: `assets/source/enemies/portraits/wild_wolf_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/荒野煞狼.webp`

- Suggested path: `assets/enemies/portraits/wild_wolf_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/贪婪盗贼.png`

- Suggested path: `assets/source/enemies/portraits/greedy_thief_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/贪婪盗贼.webp`

- Suggested path: `assets/enemies/portraits/greedy_thief_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/迷途妖狐.png`

- Suggested path: `assets/source/enemies/portraits/lost_fox_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/迷途妖狐.webp`

- Suggested path: `assets/enemies/portraits/lost_fox_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/铁甲巨蟹.png`

- Suggested path: `assets/source/enemies/portraits/iron_crab_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/铁甲巨蟹.webp`

- Suggested path: `assets/enemies/portraits/iron_crab_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `头像/怪物/魅影刺客.png`

- Suggested path: `assets/source/enemies/portraits/shadow_assassin_portrait_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `头像/怪物/魅影刺客.webp`

- Suggested path: `assets/enemies/portraits/shadow_assassin_portrait_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/【深渊主宰】.png`

- Suggested path: `assets/source/enemies/battle/abyss_overlord_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/【深渊主宰】.webp`

- Suggested path: `assets/enemies/battle/abyss_overlord_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/【精英】不死骨龙.png`

- Suggested path: `assets/source/enemies/battle/undead_bone_dragon_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/【精英】不死骨龙.webp`

- Suggested path: `assets/enemies/battle/undead_bone_dragon_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/【精英】狂暴牛头人.png`

- Suggested path: `assets/source/enemies/battle/elite_minotaur_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/【精英】狂暴牛头人.webp`

- Suggested path: `assets/enemies/battle/elite_minotaur_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/【精英】猩红血巫.png`

- Suggested path: `assets/source/enemies/battle/crimson_blood_witch_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/【精英】猩红血巫.webp`

- Suggested path: `assets/enemies/battle/crimson_blood_witch_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/【首领】鬼面修罗.png`

- Suggested path: `assets/source/enemies/battle/boss_oni_shura_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/【首领】鬼面修罗.webp`

- Suggested path: `assets/enemies/battle/boss_oni_shura_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/剧毒蟾蜍.png`

- Suggested path: `assets/source/enemies/battle/venom_toad_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/剧毒蟾蜍.webp`

- Suggested path: `assets/enemies/battle/venom_toad_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/千载魔蛛.png`

- Suggested path: `assets/source/enemies/battle/ancient_spider_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/千载魔蛛.webp`

- Suggested path: `assets/enemies/battle/ancient_spider_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/嗜血蝙蝠.png`

- Suggested path: `assets/source/enemies/battle/blood_bat_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/嗜血蝙蝠.webp`

- Suggested path: `assets/enemies/battle/blood_bat_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/堕落剑客.png`

- Suggested path: `assets/source/enemies/battle/fallen_swordsman_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/堕落剑客.webp`

- Suggested path: `assets/enemies/battle/fallen_swordsman_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/巨力石魔.png`

- Suggested path: `assets/source/enemies/battle/stone_golem_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/巨力石魔.webp`

- Suggested path: `assets/enemies/battle/stone_golem_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/幽冥法师.png`

- Suggested path: `assets/source/enemies/battle/nether_mage_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/幽冥法师.webp`

- Suggested path: `assets/enemies/battle/nether_mage_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/暴躁野猪.png`

- Suggested path: `assets/source/enemies/battle/angry_boar_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/暴躁野猪.webp`

- Suggested path: `assets/enemies/battle/angry_boar_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/枯骨煞兵.png`

- Suggested path: `assets/source/enemies/battle/bone_soldier_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/枯骨煞兵.webp`

- Suggested path: `assets/enemies/battle/bone_soldier_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/病弱史莱姆.png`

- Suggested path: `assets/source/enemies/battle/sick_slime_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/病弱史莱姆.webp`

- Suggested path: `assets/enemies/battle/sick_slime_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/缝合巨怪.png`

- Suggested path: `assets/source/enemies/battle/stitched_brute_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/缝合巨怪.webp`

- Suggested path: `assets/enemies/battle/stitched_brute_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/荒野煞狼.png`

- Suggested path: `assets/source/enemies/battle/wild_wolf_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/荒野煞狼.webp`

- Suggested path: `assets/enemies/battle/wild_wolf_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/贪婪盗贼.png`

- Suggested path: `assets/source/enemies/battle/greedy_thief_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/贪婪盗贼.webp`

- Suggested path: `assets/enemies/battle/greedy_thief_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/迷途妖狐.png`

- Suggested path: `assets/source/enemies/battle/lost_fox_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/迷途妖狐.webp`

- Suggested path: `assets/enemies/battle/lost_fox_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/铁甲巨蟹.png`

- Suggested path: `assets/source/enemies/battle/iron_crab_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/铁甲巨蟹.webp`

- Suggested path: `assets/enemies/battle/iron_crab_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

### `怪物/战斗立绘/魅影刺客.png`

- Suggested path: `assets/source/enemies/battle/shadow_assassin_battle_v1_source.png`
- Action: `move_as_source`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `怪物/战斗立绘/魅影刺客.webp`

- Suggested path: `assets/enemies/battle/shadow_assassin_battle_v1.webp`
- Action: `move_then_rewrite_dynamic_refs`
- Status: `active_dynamic`
- Tracked: `True`
- References: none
- Notes: dynamic runtime reference from src/data/enemies.js and demo path helpers

## Duplicate Extension Groups

- `头像/怪物/【深渊主宰】`: .png, .webp
- `头像/怪物/【精英】不死骨龙`: .png, .webp
- `头像/怪物/【精英】狂暴牛头人`: .png, .webp
- `头像/怪物/【精英】猩红血巫`: .png, .webp
- `头像/怪物/【首领】鬼面修罗`: .png, .webp
- `头像/怪物/剧毒蟾蜍`: .png, .webp
- `头像/怪物/千载魔蛛`: .png, .webp
- `头像/怪物/嗜血蝙蝠`: .png, .webp
- `头像/怪物/堕落剑客`: .png, .webp
- `头像/怪物/巨力石魔`: .png, .webp
- `头像/怪物/幽冥法师`: .png, .webp
- `头像/怪物/暴躁野猪`: .png, .webp
- `头像/怪物/枯骨煞兵`: .png, .webp
- `头像/怪物/病弱史莱姆`: .png, .webp
- `头像/怪物/缝合巨怪`: .png, .webp
- `头像/怪物/荒野煞狼`: .png, .webp
- `头像/怪物/贪婪盗贼`: .png, .webp
- `头像/怪物/迷途妖狐`: .png, .webp
- `头像/怪物/铁甲巨蟹`: .png, .webp
- `头像/怪物/魅影刺客`: .png, .webp
- `怪物/战斗立绘/【深渊主宰】`: .png, .webp
- `怪物/战斗立绘/【精英】不死骨龙`: .png, .webp
- `怪物/战斗立绘/【精英】狂暴牛头人`: .png, .webp
- `怪物/战斗立绘/【精英】猩红血巫`: .png, .webp
- `怪物/战斗立绘/【首领】鬼面修罗`: .png, .webp
- `怪物/战斗立绘/剧毒蟾蜍`: .png, .webp
- `怪物/战斗立绘/千载魔蛛`: .png, .webp
- `怪物/战斗立绘/嗜血蝙蝠`: .png, .webp
- `怪物/战斗立绘/堕落剑客`: .png, .webp
- `怪物/战斗立绘/巨力石魔`: .png, .webp
- `怪物/战斗立绘/幽冥法师`: .png, .webp
- `怪物/战斗立绘/暴躁野猪`: .png, .webp
- `怪物/战斗立绘/枯骨煞兵`: .png, .webp
- `怪物/战斗立绘/病弱史莱姆`: .png, .webp
- `怪物/战斗立绘/缝合巨怪`: .png, .webp
- `怪物/战斗立绘/荒野煞狼`: .png, .webp
- `怪物/战斗立绘/贪婪盗贼`: .png, .webp
- `怪物/战斗立绘/迷途妖狐`: .png, .webp
- `怪物/战斗立绘/铁甲巨蟹`: .png, .webp
- `怪物/战斗立绘/魅影刺客`: .png, .webp

## Next Review Questions

- Is the active runtime asset name acceptable?
- Should untracked candidate files be adopted, ignored, or archived later?
- Should PNG counterparts be treated as source files or candidate files?
