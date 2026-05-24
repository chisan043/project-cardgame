# 战斗 HUD 资产

## 本轮产出

- `战斗HUD_整体概念板_v1.png`
  - 依据 `../概念图/02_教堂彩窗_赛璐璐融合方向图.png` 重做的完整战斗 HUD 组合稿
  - 重点先统一铭牌、状态条、能量段、回合盘、意图框、结束回合、牌堆与手牌承托的家族关系
- `战斗HUD_整体概念板_v2.png`
  - 在整体板中补入放逐堆条目后的更新版
- `战斗HUD_牌堆家族图_v1.png`
  - 将抽牌堆、弃牌堆、放逐堆整理为同页对照图，方便继续精修与程序接入
- `正式资产/`
  - 按模块重生成的正式透明底 HUD 美术资产目录
- `拆分/`
  - 从整体概念板裁出的第一批模块图，便于继续评审、前端占位或下一轮精修

## 当前拆分列表

### 与概念板编号对应

- `1` 我方信息面板: `拆分/battle_hud_player_panel_v1.png`
- `2` 敌方信息面板: `拆分/battle_hud_enemy_panel_v1.png`
- `3` 回合计数器: `拆分/battle_hud_turn_counter_v1.png`
- `4` 结束回合按钮: `拆分/battle_hud_end_turn_button_v1.png`
- `5` 敌方意图面板: `拆分/battle_hud_enemy_intent_panel_v1.png`
- `6` 我方状态图标区域: `拆分/battle_hud_player_status_bar_v1.png`
- `7` 敌方状态图标区域: `拆分/battle_hud_enemy_status_bar_v1.png`
- `8` 抽牌堆: `拆分/battle_hud_draw_pile_v1.png`
- `9` 手牌展开区: `拆分/battle_hud_hand_fan_area_v1.png`
- `10` 弃牌堆: `拆分/battle_hud_discard_pile_v1.png`
- `11` 费用标识（能量水晶）: `拆分/battle_hud_energy_gems_v1.png`
- `12` 常用小图标: `拆分/battle_hud_icon_set_v1.png`
- `13` 材质与边框参考: `拆分/battle_hud_material_swatches_v1.png`
- `14` 字体与数字样式参考: `拆分/battle_hud_typography_sample_v1.png`

### 扩展模块

- 放逐堆: `拆分/battle_hud_exile_pile_v1.png`
- 抽牌堆净件: `拆分/battle_hud_draw_pile_clean_v1.png`
- 弃牌堆净件: `拆分/battle_hud_discard_pile_clean_v1.png`
- 放逐堆净件: `拆分/battle_hud_exile_pile_clean_v1.png`

### 正式资产（重生成）

- 我方信息面板: `正式资产/battle_hud_player_panel_asset_v1.png`
- 敌方信息面板: `正式资产/battle_hud_enemy_panel_asset_v1.png`

### 正式资产子模块（我方信息面板）

- 头像框: `正式资产/子模块/玩家面板/player_portrait_frame_asset_v1.png`
- 名牌底: `正式资产/子模块/玩家面板/player_nameplate_shell_asset_v1.png`
- 生命条框: `正式资产/子模块/玩家面板/player_hp_bar_shell_asset_v1.png`
- 护甲条框: `正式资产/子模块/玩家面板/player_armor_bar_shell_asset_v1.png`
- 能量槽: `正式资产/子模块/玩家面板/player_energy_tray_asset_v1.png`
- 能量晶体亮态: `正式资产/子模块/玩家面板/player_energy_gem_on_asset_v1.png`
- 能量晶体灭态: `正式资产/子模块/玩家面板/player_energy_gem_off_asset_v1.png`

### 正式资产子模块（敌方信息面板）

- 敌方头像框: `正式资产/子模块/敌方面板/enemy_portrait_frame_asset_v1.png`
- 敌方名牌底: `正式资产/子模块/敌方面板/enemy_nameplate_shell_asset_v1.png`
- 敌方生命条框: `正式资产/子模块/敌方面板/enemy_hp_bar_shell_asset_v1.png`
- 敌方护甲条框: `正式资产/子模块/敌方面板/enemy_armor_bar_shell_asset_v1.png`
- 敌方状态徽记: `正式资产/子模块/敌方面板/enemy_status_crest_asset_v1.png`

### 正式资产子模块（中轴控件）

- 回合计数器外框: `正式资产/子模块/中轴控件/turn_counter_outer_frame_asset_v1.png`
- 回合计数器内盘: `正式资产/子模块/中轴控件/turn_counter_inner_dial_asset_v1.png`
- 结束回合按钮底: `正式资产/子模块/中轴控件/end_turn_button_shell_asset_v1.png`
- 结束回合按钮装饰宝石: `正式资产/子模块/中轴控件/end_turn_button_gem_asset_v1.png`

### 正式资产子模块（敌方意图面板）

- 意图面板底: `正式资产/子模块/敌方意图面板/enemy_intent_panel_shell_asset_v1.png`
- 攻击意图圆章: `正式资产/子模块/敌方意图面板/enemy_intent_attack_medallion_asset_v1.png`
- 数值承载条: `正式资产/子模块/敌方意图面板/enemy_intent_value_lane_asset_v1.png`
- 辅助空槽: `正式资产/子模块/敌方意图面板/enemy_intent_aux_socket_asset_v1.png`

### 正式资产子模块（状态栏）

- 我方状态栏底: `正式资产/子模块/状态栏/player_status_bar_shell_asset_v1.png`
- 敌方状态栏底: `正式资产/子模块/状态栏/enemy_status_bar_shell_asset_v1.png`
- 通用状态空槽: `正式资产/子模块/状态栏/status_socket_empty_asset_v1.png`
- 强调态状态槽: `正式资产/子模块/状态栏/status_socket_highlight_asset_v1.png`

### 正式资产子模块（牌堆）

- 抽牌堆本体: `正式资产/子模块/牌堆/draw_pile_stack_asset_v1.png`
- 弃牌堆本体: `正式资产/子模块/牌堆/discard_pile_stack_asset_v1.png`
- 放逐堆本体: `正式资产/子模块/牌堆/exile_pile_stack_asset_v1.png`
- 共用计数牌签: `正式资产/子模块/牌堆/pile_count_plate_asset_v1.png`

### 正式资产子模块（图标徽记）

- 攻击图标: `正式资产/子模块/图标徽记/icon_attack_asset_v1.png`
- 防御图标: `正式资产/子模块/图标徽记/icon_defense_asset_v1.png`
- 技能图标: `正式资产/子模块/图标徽记/icon_skill_asset_v1.png`
- 治疗图标: `正式资产/子模块/图标徽记/icon_heal_asset_v1.png`
- 诅咒图标: `正式资产/子模块/图标徽记/icon_curse_asset_v1.png`
- 能量图标: `正式资产/子模块/图标徽记/icon_energy_asset_v1.png`

### 正式资产子模块（手牌承托）

- 手牌承托主底: `正式资产/子模块/手牌承托/hand_fan_tray_shell_asset_v1.png`
- 手牌承托中央徽记: `正式资产/子模块/手牌承托/hand_fan_center_crest_asset_v1.png`
- 手牌承托左端饰: `正式资产/子模块/手牌承托/hand_fan_endcap_left_asset_v1.png`
- 手牌承托右端饰: `正式资产/子模块/手牌承托/hand_fan_endcap_right_asset_v1.png`

### 正式资产子模块（材质边框）

- 主框架边框基底: `正式资产/子模块/材质边框/frame_master_border_asset_v1.png`
- 蓝色玻璃材质底件: `正式资产/子模块/材质边框/glass_blue_panel_tile_asset_v1.png`
- 紫色玻璃材质底件: `正式资产/子模块/材质边框/glass_purple_panel_tile_asset_v1.png`
- 绿色玻璃材质底件: `正式资产/子模块/材质边框/glass_green_panel_tile_asset_v1.png`
- 红色玻璃材质底件: `正式资产/子模块/材质边框/glass_red_panel_tile_asset_v1.png`
- 羊皮纸材质底件: `正式资产/子模块/材质边框/parchment_panel_tile_asset_v1.png`

### 正式资产子模块（数值文字承载）

- 长标题牌: `正式资产/子模块/数值文字承载/title_banner_long_asset_v1.png`
- 短暗色标题牌: `正式资产/子模块/数值文字承载/title_plate_dark_short_asset_v1.png`
- 圆形数字盘: `正式资产/子模块/数值文字承载/number_medallion_round_asset_v1.png`
- 小型计数牌签: `正式资产/子模块/数值文字承载/count_plate_small_asset_v1.png`
- 菱形徽记装饰: `正式资产/子模块/数值文字承载/diamond_crest_accent_asset_v1.png`

## 说明

- 本批拆分基于整体组合稿裁切，优先保证整体语言统一
- 当前已覆盖概念板 `1-14` 的全部模块，对应关系可直接按上面的编号查看
- `battle_hud_exile_pile_v1.png` 为后补的放逐区模块，沿用牌堆骨架并用紫红封印色区分功能
- `*_clean_v1.png` 为进一步收紧边界后的独立牌堆资源，适合继续接正式界面或做状态版扩展
- 若要进一步接正式游戏资源，建议下一轮按这些模块继续做独立高净底版本与交互态版本
- 文字、数值、状态图标仍可在后续按程序接入规范继续二次精修
