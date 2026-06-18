# Questers Shop Asset Manifest v1

This manifest lists the production assets needed to implement the approved Questers shop UI direction.

Companion rules: `assets/source/ui/events/shop/shop_ui_asset_rules_v1.md`
Style reference: `assets/source/ui/concepts/event_screens_stained_glass_cel_concept_v1.png`
Imagegen production pack: `assets/source/ui/events/shop/prompts/shop_imagegen_production_pack_v1.md`

## Production Principles

- Assets are transparent-background PNGs unless marked otherwise.
- Asset art should be blank: no readable text, no Chinese characters, no numbers, no coin symbols, no baked item art, no baked card slots.
- Text, icons, prices, card art, relic art, counts, tooltips, selected state, disabled logic, and animation timing belong to the HTML/CSS/JS UI layer.
- Use image art for material quality, frame shape, glow, and stained-glass/cel texture.
- Use code for layout, exact item count, click targets, focus states, accessibility labels, and responsive scaling.
- Keep source prompts next to generated assets when final generation begins.

## Target Shop Layout

- Shop body starts at the merchant portrait arch and excludes the separate event-introduction panel.
- Overall shop body ratio: about `1.6:1`.
- Left merchant arch: about `22-24%` of shop width.
- Center goods shelf: about `50-52%` of shop width.
- Right detail column: about `24%` of shop width.
- Top mode tabs sit above the center shelf.
- Bottom restock strip sits beneath the center shelf.

## Directory Plan

Final source assets should live under:

```text
assets/source/ui/events/shop/
```

Recommended subfolders once real PNGs are generated:

```text
assets/source/ui/events/shop/frames/
assets/source/ui/events/shop/buttons/
assets/source/ui/events/shop/overlays/
assets/source/ui/events/shop/badges/
assets/source/ui/events/shop/secondary/
assets/source/ui/events/shop/prompts/
```

## Frame Assets

| Asset id | Suggested final path | Ratio | Suggested canvas | Purpose | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `shop_merchant_arch_frame` | `frames/shop_merchant_arch_frame_v1.png` | `0.42:1` | `768x1792` | Left merchant portrait window | Empty blue stained-glass arch only; no merchant, no intro panel. |
| `shop_goods_shelf_frame` | `frames/shop_goods_shelf_frame_v1.png` | `1.6:1` | `1792x1120` | Center goods shelf | Flexible large container with upper/lower zones only; no fixed product slots. |
| `shop_detail_panel_frame` | `frames/shop_detail_panel_frame_v1.png` | `0.55:1` | `896x1632` | Right item detail panel | Blank parchment detail area, blank price plaque zone, blank buy button zone. |
| `shop_top_tab_bar_frame` | `frames/shop_top_tab_bar_frame_v1.png` | `4.5:1` | `1536x352` | Optional connected tab-bar backing | Use only if separate tab buttons need a shared rail. |
| `shop_restock_strip_frame` | `frames/shop_restock_strip_frame_v1.png` | `6:1` | `1536x256` | Bottom restock/status strip | No dot rows, no fixed markers, no numbers. |

## Button Assets

Each button family needs separate state files. Button art stays blank; game text/icons are rendered on top.

Required states:

- `idle`
- `hover`
- `pressed` if materially different from hover
- `disabled`
- `active` for top tabs only

| Asset family | Suggested paths | Ratio | Suggested canvas | Use |
| --- | --- | ---: | ---: | --- |
| `shop_tab_button` | `buttons/shop_tab_button_{idle,hover,active,disabled}_v1.png` | `3.2:1` | `512x160` | `货架`, `拓印`, `精简` tabs. |
| `shop_primary_button` | `buttons/shop_primary_button_{idle,hover,pressed,disabled}_v1.png` | `3.8:1` | `608x160` | Buy, confirm, restock, proceed-like actions. |
| `shop_exit_button` | `buttons/shop_exit_button_{idle,hover,pressed,disabled}_v1.png` | `2.4:1` | `384x160` | Exit shop / leave panel. |
| `shop_service_button` | `buttons/shop_service_button_{idle,hover,pressed,disabled}_v1.png` | `3.2:1` | `512x160` | Copy/remove/choose-card flow actions. |
| `shop_icon_button_square` | `buttons/shop_icon_button_square_{idle,hover,pressed,disabled}_v1.png` | `1:1` | `192x192` | Icon-only remove/copy/close utilities. |

Button-state art direction:

- `idle`: dark teal enamel and thin antique-gold border.
- `hover`: brighter gold rim light and subtle blue inner glow.
- `pressed`: slightly darker inset center, compressed highlight, readable rim.
- `disabled`: desaturated teal and worn dim gold.
- `active`: selected tab with stronger gold/blue frame, still not oversized.

## Overlay Assets

These are placed above real cards, relics, and buttons.

Card and relic hover/selected feedback should not be generated as fixed image assets. Use runtime glow/filter/box-shadow effects on the real rendered card or relic element so the outline matches its actual size, rounded corners, and crop.

| Asset id | Suggested final path | Ratio | Suggested canvas | Use | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `shop_disabled_veil_card` | `overlays/shop_disabled_veil_card_v1.png` | card ratio | `384x560` | Unavailable card overlay | Translucent, reusable. |
| `shop_disabled_veil_rect` | `overlays/shop_disabled_veil_rect_v1.png` | `3.2:1` | `512x160` | Disabled button/service overlay | Translucent, reusable. |
| `shop_attention_glint` | `overlays/shop_attention_glint_v1.png` | `1:1` | `256x256` | Small sparkle/rim accent | Keep restrained, no icon. |

## Badge And Price Assets

These are small and must not cover important item art.

| Asset id | Suggested final path | Ratio | Suggested canvas | Use | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `shop_price_plaque_normal` | `badges/shop_price_plaque_normal_v1.png` | `2.8:1` | `448x160` | Price background | No coin icon, no number. |
| `shop_price_plaque_discount` | `badges/shop_price_plaque_discount_v1.png` | `2.8:1` | `448x160` | Discount price background | Slight red/gold accent only. |
| `shop_half_price_corner_ribbon` | `badges/shop_half_price_corner_ribbon_v1.png` | `1:1` | `192x192` | Half-price corner mark | Blank red ribbon/wax shape, compact. |
| `shop_sale_seal_badge` | `badges/shop_sale_seal_badge_v1.png` | `1:1` | `192x192` | Optional sale seal | Blank, compact. |
| `shop_unavailable_corner_tag` | `badges/shop_unavailable_corner_tag_v1.png` | `1.4:1` | `224x160` | Sold/unavailable mark | Blank, desaturated. |
| `shop_warning_note_strip` | `badges/shop_warning_note_strip_v1.png` | `5:1` | `960x192` | Note/warning text backing | Blank parchment/dark-red strip. |

## Secondary Menu Assets

These support copy-card, remove-card, and choose-card workflows where the player deck can be large.

| Asset id | Suggested final path | Ratio | Suggested canvas | Use | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `shop_card_selection_panel` | `secondary/shop_card_selection_panel_v1.png` | `1.7:1` | `1792x1056` | Scrollable deck grid backing | No fixed cells or card silhouettes. |
| `shop_filter_dropdown_frame` | `secondary/shop_filter_dropdown_frame_v1.png` | `4:1` | `640x160` | Filter/dropdown backing | Blank. |
| `shop_scrollbar_track` | `secondary/shop_scrollbar_track_v1.png` | `0.12:1` | `128x1024` | Vertical scroll track | Blank, repeat-safe if possible. |
| `shop_scrollbar_thumb` | `secondary/shop_scrollbar_thumb_v1.png` | `0.25:1` | `128x512` | Vertical scroll thumb | Works on track. |
| `shop_selected_card_detail_panel` | `secondary/shop_selected_card_detail_panel_v1.png` | `0.7:1` | `640x912` | Selected card/cost detail | Blank parchment area. |
| `shop_empty_state_plaque` | `secondary/shop_empty_state_plaque_v1.png` | `2.2:1` | `704x320` | No valid card / empty list backing | Blank. |
| `shop_confirm_warning_strip` | `secondary/shop_confirm_warning_strip_v1.png` | `5:1` | `960x192` | Remove/copy confirmation notice | Blank. |
| `shop_cancel_back_button` | `secondary/shop_cancel_back_button_{idle,hover,pressed,disabled}_v1.png` | `2.8:1` | `448x160` | Back/cancel action | Same state rules as buttons. |

## Runtime Layer Responsibilities

The game UI layer should render:

- button labels,
- button icons,
- card and relic art,
- prices and coin symbols,
- discount numbers,
- disabled reasons,
- hover/focus state switching,
- card/relic hover and selected glow using the actual rendered element bounds,
- scroll position,
- item counts,
- all click handlers,
- layout for current item count.

The art layer should provide:

- material texture,
- ornate frame silhouettes,
- stained-glass depth,
- parchment surfaces,
- badge and plaque shapes.

## First Generation Batch

Generate and review source images in this order before slicing final transparent PNGs:

1. `prompts/shop_shell_component_sheet_v1.prompt.txt`
2. `prompts/shop_goods_tab_source_v1.prompt.txt`
3. `prompts/shop_copy_tab_source_v1.prompt.txt`
4. `prompts/shop_remove_tab_source_v1.prompt.txt`
5. `prompts/shop_buttons_and_overlays_sheet_v1.prompt.txt`

After those source images pass review, slice/clean the following production assets in this order:

1. `shop_goods_shelf_frame`
2. `shop_merchant_arch_frame`
3. `shop_detail_panel_frame`
4. `shop_tab_button` states
5. `shop_primary_button` states
6. `shop_price_plaque_normal`, `shop_price_plaque_discount`
7. `shop_half_price_corner_ribbon`
8. `shop_card_selection_panel`
9. `shop_scrollbar_track`, `shop_scrollbar_thumb`

After these pass visual review, generate the remaining smaller variants.
