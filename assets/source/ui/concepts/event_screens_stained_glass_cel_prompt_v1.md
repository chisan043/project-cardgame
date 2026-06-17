# Questers Event Screen Concept Prompt v1

This note records the approved direction for the Shop, Encounter, and Campfire event screens.

The matching concept image is the latest generated event-screen concept board from the June 17, 2026 design pass. If the image is exported from the generator, store it beside this file as:

`event_screens_stained_glass_cel_concept_v1.png`

## Core Style

Questers is not generic 1990s cel fantasy. The event UI must match the existing game assets:

- 1990s anime cel character art.
- Gothic stained-glass fantasy UI.
- Deep navy, teal, and blue-black panels.
- Antique gold filigree borders and thin gold linework.
- Blue jewel corner nodes and stained-glass medallion icons.
- Parchment information insets for readable descriptions.
- Pointed arches and cathedral-like frame silhouettes.
- Hard ink outlines, cel-shaded NPCs, and painted background plates.
- Candle/fire highlights against cool blue-violet shadows.

Avoid:

- Generic wood-only fantasy shop UI.
- Modern CSS panels or flat vector UI.
- Glossy mobile-game gradients.
- Purple-blue gradient blob backgrounds.
- Crowded card text in miniature card grids.
- Multiple entrances for one event. Use one shell with tabs.

## Canonical Prompt

Create a production UI concept sheet for the game Questers, matching its existing art direction: 1990s anime cel character art fused with gothic stained-glass fantasy UI. The style must look consistent with a dark cathedral roguelike deckbuilder: deep navy and teal panels, antique gold filigree borders, blue jewel corner nodes, stained-glass icon medallions, parchment text insets, ornate pointed arches, hard ink outlines, cel-shaded characters, painted background plates, high-contrast candlelight, subtle aged texture. Do NOT make generic wood-only fantasy UI, do NOT make modern CSS panels, do NOT make flat vector UI, do NOT use glossy mobile-game gradients.

The image is a 16:9 concept board showing event screen states for 商店, 奇遇, 营火. Chinese labels should be clean and large enough to read. The concept must preserve Questers' existing visual language: gold cathedral frames, stained glass blue/red/green/purple accents, dark blue-black backgrounds, parchment description panels, ornate buttons like relic UI, circular stained-glass icons, anime cel NPC portrait integration.

Composition: three rows, each row contains a unified event screen shell plus state variations. All screens share the same reusable Questers UI component system.

ROW 1: SHOP / 商店. Unified shop interface with one entrance, not multiple entrances. A cel-shaded merchant portrait on the left inside an arched stained-glass character frame. Main area uses a dark teal gothic panel with gold filigree and parchment inset zones. Left or top tab rail with stained-glass icon tabs: “货架”, “拓印”, “精简”. A clear exit button “离开” is permanently reserved in the upper right, using the same ornate blue-gold button style as the existing game.

货架 tab active: show 3 card goods in Questers-like card frames and up to 3 relic goods in circular stained-glass relic medallion slots. One item has a red wax/gold seal “半价”. Include gold counter, price tags, “补货 10” button, selected item gold glow, right-side parchment detail panel and confirm button “购买”. Make the goods feel like displayed sacred artifacts in an ornate merchant reliquary, not a modern shop grid.

拓印 tab active: same shop shell. Center becomes a large scrollable deck browser with many compact card thumbnails arranged in rows, using miniature Questers card backs/frames. Visible slim ornate scrollbar, small filter plaques at top, selected card enlarged in right parchment preview, price badge, confirm button “拓印”. It must clearly solve large deck space.

精简 tab active: same shell. Center becomes a scrollable deck browser for removal, selected card preview right, warning parchment strip, cost tag “50”, confirm button “遗忘”. Make deletion feel solemn: dimmed card slots, ash-like vignette, but still same blue-gold cathedral UI.

ROW 2: ENCOUNTER / 奇遇. Background: moonlit ruined chapel or roadside shrine with stained glass fragments, matching Questers dark cathedral fantasy. Cel-shaded angel NPC portrait or sacred figure in an arched frame on the left. Three large option plaques across the center with stained-glass medallion icons: “探寻宝库”, “接受试炼”, “整理行囊”. A quiet ornate exit button “离开”. Selected option expands into a right parchment action panel: treasure option shows relic medallion reward/chest; trial shows before-after card upgrade with gold light; organize shows forget-one-card deck browser plus three reward cards and an optional skip button “不拿补给”.

ROW 3: CAMPFIRE / 营火. Background: campfire in ruined cathedral courtyard, orange flame against blue shadows, gold linework and broken stained glass. Cel-shaded elder portrait in an arched frame on the left. Three action tabs/buttons: “休息”, “淬炼”, “遗忘”. Selected state variations: rest has HP bar preview and flask, upgrade has card before-after near sacred flame, forget has deck browser and card dissolving into ash basin. Include clear final advance button area “继续”.

Functional UX requirements: one consistent event screen shell, stable tab/button locations, no crowded card text, large-deck actions use scrollable compact thumbnails plus right-side preview, exit/continue button always has reserved space, tabs feel like physical stained-glass buttons, card/relic slots are asset-ready components. Overall look must be Questers-specific: stained glass gothic UI + ornate gold frame + parchment panels + 90s cel anime figures + dark fantasy battle-scene palettes.

## Short Reuse Prompt

Questers event UI, 1990s anime cel characters fused with gothic stained-glass fantasy interface, deep navy teal panels, antique gold filigree, blue jewel nodes, stained-glass medallion icons, parchment insets, pointed cathedral arches, hard ink outlines, cel shading, painted background plates, candlelight against cool blue shadows, matching existing Questers card/HUD/map assets.

## Asset References

Use these existing assets as style anchors:

- `assets/source/ui/concepts/stained_glass_cel_fusion_direction_v1.png`
- `assets/source/ui/map/review/map_ui_imagegen_component_sheet_transparent_v1_source.png`
- `assets/npc/shopkeeper_portrait_v1.webp`
- `assets/npc/encounter_angel_portrait_v1.webp`
- `assets/npc/campfire_elder_portrait_v1.webp`
- `assets/candidates/scenes/review/scene_palette_overview_v1.png`
- `assets/source/ui/menu/main_menu_key_art_v1_source.png`

