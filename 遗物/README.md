# 遗物美术资产

本目录补齐了《幻境残卷》遗物系统的首版美术资源，方向与现有 `UI/图标` 保持一致：

- 90 年代日式奇幻游戏 UI 语境
- 深蓝 / 暗金 / 红宝石点缀
- 小尺寸高可读性的徽章式遗物图标
- 透明背景 PNG，方便直接接入前端

## 目录结构

- `图标/`
  - 按遗物系统 `id` 导出的成品图标
  - 当前共 `51` 张
  - 统一尺寸 `384x384`

- `母版/`
  - 可复用的主题母版图标
  - 当前共 `14` 张
  - 统一尺寸 `512x512`

## 使用说明

- `图标/` 下文件名直接对应当前遗物池中的 `id`
- 可以直接用这些 PNG 替换现有 emoji 占位
- 如果后续希望做“每件遗物唯一图”，建议基于 `母版/` 继续细化，而不是重开新风格

## 母版复用关系

- `relic_master_echo_mirror.png`
  - `r_echo_mirror_relic`

- `relic_master_venom_fang.png`
  - `r_poison_fang`
  - `r_poison_leech`
  - `r_plague`

- `relic_master_blood_dagger.png`
  - `r_bone_ring`
  - `r_bleed_knife`
  - `r_bleed_return_exhaust`
  - `r_brutal`
  - `r_blood`
  - `r_execute`

- `relic_master_cursed_mask.png`
  - `r_frenzy_veil`
  - `r_weak_mask`
  - `r_frenzy`

- `relic_master_thorn_shield.png`
  - `r_thorn_shield_new`
  - `r_pass_thorns`

- `relic_master_soul_lantern.png`
  - `r_soul_lantern`
  - `r_ethereal`

- `relic_master_cycle_compass.png`
  - `r_cycle_compass`
  - `r_yin_yang`

- `relic_master_energy_core.png`
  - `r_enchant_crys`
  - `r_energy_crys`
  - `r_base_energy`
  - `r_pass_energy`

- `relic_master_holy_bloom.png`
  - `r_sac_jade`
  - `r_vamp_ring`
  - `r_heal_relic`
  - `r_overheal`

- `relic_master_cursed_seal.png`
  - `r_corrupt_cup`
  - `r_decay_seal`
  - `r_omni_seal`
  - `r_despair`
  - `r_perma_curse`
  - `r_long_decay`

- `relic_master_grimoire_lockbox.png`
  - `r_luck_box`
  - `r_skill_cost`
  - `r_pass_draw`

- `relic_master_stone_totem.png`
  - `r_protect_armor`
  - `r_counter_amulet`
  - `r_life_totem`
  - `r_exhaust_stone`
  - `r_def_cost`

- `relic_master_martial_crest.png`
  - `r_pierce_amulet`
  - `r_combo_ring`
  - `r_heavy_badge`
  - `r_fast_foot`
  - `r_exhaust_knife`
  - `r_return_knife`
  - `r_pierce`

- `relic_master_ghost_banner.png`
  - `r_exhaust_dmg`
  - `r_return_poison`
  - `r_return_bleed`

## 后续建议

- 若要进一步提升辨识度，优先细化这些复用较多的组：
  - `cursed_seal`
  - `martial_crest`
  - `stone_totem`
  - `holy_bloom`
- 如果接入代码层，建议把遗物数据里的 `icon` 字段逐步改成图片路径字段，而不是继续使用 emoji。
