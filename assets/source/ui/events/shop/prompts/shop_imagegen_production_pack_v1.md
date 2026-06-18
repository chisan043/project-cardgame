# Questers Shop Imagegen Production Prompt Pack v1

This pack turns the approved shop concept into source-image prompts for real image generation.

Use the built-in `image_gen` path first. These prompts ask for a flat `#ff00ff` chroma-key background so the result can be converted into transparent PNG assets after review. Do not replace these with scripted/Pillow-drawn placeholders.

## Style Lock

Every generated source must match:

- `assets/source/ui/concepts/event_screens_stained_glass_cel_concept_v1.png`
- existing Questers card/relic/HUD/map materials,
- 1990s Japanese cel-animation fantasy UI,
- gothic stained-glass cathedral framing,
- deep navy and teal enamel panels,
- antique gold filigree and thin hard ink outlines,
- blue jewel nodes with tiny red/green stained-glass accents,
- parchment surfaces only where the runtime needs readable text areas.

Avoid:

- generic wood tavern shop UI,
- modern CSS panels,
- flat vector buttons,
- bulky mobile-game beveled buttons,
- protruding crests that invade the tab row,
- fixed baked-in card/relic slots,
- readable text, Chinese characters, numbers, coin symbols, or item art.

## Intended Imagegen Sequence

1. Generate `shop_shell_component_sheet_v1.prompt.txt`.
   - Purpose: lock the proportions of the shared portrait arch, goods shelf, right detail panel, top tabs, exit button zone, and bottom restock strip.
   - Review first. If this proportion fails, do not generate the smaller parts yet.
2. Generate `shop_goods_tab_source_v1.prompt.txt`.
   - Purpose: clean goods-tab source frame with a flexible upper card area and lower relic area.
3. Generate `shop_copy_tab_source_v1.prompt.txt`.
   - Purpose: large-deck copy-card browser source with scrollable-grid art backing and right preview panel.
4. Generate `shop_remove_tab_source_v1.prompt.txt`.
   - Purpose: large-deck remove-card browser source with warning strip and right preview panel.
5. Generate `shop_buttons_and_overlays_sheet_v1.prompt.txt`.
   - Purpose: stateful buttons, price plaques, half-price badge, disabled veils, scrollbars, and warning strips as sliceable parts.
   - Card/relic hover and selected feedback should stay in runtime CSS/SVG glow so it matches the actual card/relic bounds.

## Post-Generation Landing Rules

For each approved generated source:

1. Save the raw source beside the prompts under `assets/source/ui/events/shop/review/`.
2. Convert chroma key to alpha with the shared imagegen helper.
3. Slice approved components into:

```text
assets/source/ui/events/shop/frames/
assets/source/ui/events/shop/buttons/
assets/source/ui/events/shop/overlays/
assets/source/ui/events/shop/badges/
assets/source/ui/events/shop/secondary/
```

4. Keep source prompts, reviewed source images, sliced transparent PNGs, and final WebP runtime assets traceable by version suffix.
5. Do not commit generated art that is only a local placeholder or a procedural mock.

## Review Gate

A source image passes only if:

- the shop starts at the shared portrait arch and excludes the old far-left intro module,
- the top `货架 / 拓印 / 精简` tab zone is visually reserved and unobstructed,
- the `离开` button area is reserved in the upper right,
- the goods shelf is one flexible large frame, not fixed slots,
- cards and relics can be positioned by runtime DOM without fighting baked art,
- copy/remove flows clearly support many player cards through a scrollable center browser,
- the generated parts are blank enough for runtime text, prices, icons, cards, and click states.
