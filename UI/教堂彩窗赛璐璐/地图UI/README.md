# 地图 UI 美术资产

这一批是地图推进界面的美术资产包。v2 已按 `概念图/地图概念图.png` 对齐：羊皮纸山川地图、左侧图例、顶部区域铭牌、黄铜纹章节点、右侧地点详情面板与蓝金“进入”按钮。

正式接入建议优先使用这些 v2 文件。

## 文件

- `UI/教堂彩窗赛璐璐/地图UI/正式资产/bg_map_silverwind_hills_01.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_full_layout_frame_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_region_banner_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_side_legend_panel_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_detail_panel_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_detail_illustration_church_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_enter_button_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_path_styles_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_floor_label_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_battle_normal_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_battle_reachable_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_battle_current_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_battle_passed_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_elite_normal_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_elite_reachable_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_elite_current_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_elite_passed_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_shop_normal_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_shop_reachable_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_shop_current_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_shop_passed_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_rest_normal_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_rest_reachable_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_rest_current_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_rest_passed_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_event_normal_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_event_reachable_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_event_current_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_event_passed_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_empty_normal_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_empty_reachable_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_empty_current_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_empty_passed_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_boss_normal_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_boss_reachable_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_boss_current_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/节点/map_node_boss_passed_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/正式资产/map_node_sheet_asset_v2.png`
- `UI/教堂彩窗赛璐璐/地图UI/地图UI_整体概念板_v2.png`

## 建议接入

- `bg_map_silverwind_hills_01.png` 可替换当前 `#scene-map` 的纯 CSS 背景。
- `map_full_layout_frame_asset_v2.png` 提供整屏黄铜边框与右侧详情区骨架。
- `节点/` 下的 v2 PNG 按 `normal / reachable / current / passed` 四态组织，可用于替换现有 `.node` CSS 圆形节点。
- `map_path_styles_asset_v2.png` 是路线视觉参考；实际路线仍建议用 SVG path 渲染，保持当前动态连线能力。
- `地图UI_整体概念板_v2.png` 用于验收整体观感与后续迭代沟通。
