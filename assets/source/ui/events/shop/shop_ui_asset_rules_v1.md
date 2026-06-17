# Questers Shop UI Asset Rules v1

This note records the approved shop UI asset direction for the stained-glass cel event-screen redesign.

## Style Anchor

- Match `assets/source/ui/concepts/event_screens_stained_glass_cel_concept_v1.png`.
- 1990s Japanese cel-animation fantasy game UI.
- Dark cathedral stained glass, deep navy/teal enamel panels, antique gold filigree trim, hard ink outlines, aged hand-painted texture, blue jewel nodes, small red/green stained-glass accents, and candlelit gold highlights.
- Match the existing Questers card/relic art mood; avoid generic gothic UI, modern mobile-game chunkiness, and unrelated decorative frames.

## Shop Boundary

- The actual shop interface starts at the merchant portrait arch.
- Do not include the separate event-introduction panel/module on the far left.
- The shop screen body should include:
  - left merchant portrait arch,
  - top function tabs,
  - central goods shelf,
  - right item detail panel,
  - currency/exit area,
  - bottom restock strip.

## Proportions

- Use the cropped shop concept as the layout reference.
- Overall shop body is a compact wide rectangle, roughly `1.6:1`.
- Left merchant arch takes roughly one quarter of the width.
- Central goods shelf takes roughly one half of the width.
- Right detail panel takes roughly one quarter of the width.
- Preserve the concept's thin border weight, tight spacing, and dense but readable old-console UI rhythm.

## Flexible Goods Shelf Rule

- The central goods shelf asset must be a flexible stage frame, not a fixed item grid.
- Draw only:
  - outer ornate frame,
  - optional low blank title plaque that stays inside the shelf frame,
  - broad upper content area for cards,
  - broad lower content area for relics,
  - one subtle horizontal divider,
  - optional faint row-label ornaments with no text.
- Do not draw:
  - tall or protruding top ornaments,
  - crown-like top decorations,
  - large jewel plaques above the shelf,
  - any shelf decoration that enters the top function-tab area,
  - individual card slots,
  - individual relic slots,
  - fixed five-item wells,
  - price plaques under individual items,
  - discount badges,
  - card or relic placeholders.
- The shelf top edge must stay clean and low so the `货架` / `拓印` / `精简` function tabs have unobstructed space above it.
- Real cards, relics, prices, half-price badges, hover states, and item spacing must be controlled by the game UI layer.

## Interactive Button Split Rule

- Clickable controls must be separate assets from the large shop frames.
- Button frame assets should be blank; text, icons, coin symbols, prices, and keyboard hints are rendered by the game UI layer.
- Required button families:
  - top mode tab button,
  - primary action button for purchase/confirm/restock,
  - small exit button,
  - service/action button for copy/remove/choose-card flows,
  - square icon button for actions such as remove/copy when an icon-only affordance is clearer.
- Required visual states:
  - idle,
  - hover or pressed,
  - disabled,
  - active-selected for top tabs.
- Hover/pressed should use brighter gold rim light or subtle blue inner glow.
- Disabled should be desaturated and dim but still readable.
- Do not bake click effects into the main shelf/detail/arch frame; keep them controllable per button.
- Keep button ornamentation restrained enough that it does not overlap adjacent UI or force fixed text sizes.

## Asset Output Rules

- Transparent-background PNG assets are preferred for production.
- For built-in image generation, generate on a flat chroma-key background first, then remove the key locally.
- Each asset should avoid readable text, Chinese characters, numbers, watermarks, full-screen mockups, and baked-in game content unless explicitly requested.
