# Questers Event UI Concept Recreation Design

## Goal

Recreate the approved Questers event UI concept art in the live HTML client for shop, encounter, and campfire nodes.

The leftmost module-introduction strip in `assets/source/ui/concepts/event_screens_stained_glass_cel_concept_v1.png` is not part of the in-game interface. It is a concept-board annotation only. The implementation target starts at the actual event shell: NPC portrait area, top title/tab/action area, main content area, detail/action panels, and state-specific controls.

## Source Of Truth

- Live implementation surface: `questers_demo_v0.99.html`.
- Overall concept board: `assets/source/ui/concepts/event_screens_stained_glass_cel_concept_v1.png`.
- Encounter home reference: `assets/source/ui/concepts/event_encounter_actual_ui_concept_v1.png`.
- Campfire home reference: `assets/source/ui/concepts/rest_campfire_actual_ui_concept_v1.png`.
- Existing production assets:
  - `assets/ui/events/shop/`
  - `assets/ui/events/encounter/`
  - `assets/ui/events/rest/`
  - `assets/npc/`

## Scope

The recreation includes every concept state shown in the approved board.

Shop:
- Home shell with merchant portrait.
- `货架` state with card goods, relic goods, selected item detail, price, buy button, gold counter, restock button, and permanent leave button.
- `拓印` state with a large-deck browser, filters/count context where available, selected-card preview, price plaque, and confirm button.
- `精简` state with a large-deck browser, selected-card preview, warning strip, current cost, and confirm button.

Encounter:
- Home shell with angel/sacred NPC portrait, ruined chapel background, three option plaques, and permanent leave button.
- `探寻宝库` result state with relic reward presentation and confirm action.
- `接受试炼` state with deck browser, before/after upgrade preview, and confirm action.
- `整理行囊` state with deck browser, forget action, three-card supply reward, and optional skip action.

Campfire:
- Home shell with elder portrait, campfire background, three option cards, and permanent continue button.
- `休息` state with HP preview/result and rest-complete action.
- `淬炼` state with deck browser, before/after upgrade preview, and confirm action.
- `遗忘` state with deck browser, selected-card preview, ash/removal framing, and confirm action.
- Continue/advance affordance matching the concept board.

Out of scope:
- Changing the underlying mechanics or balance.
- Replacing real rendered cards with baked screenshots.
- Baking dynamic text, prices, card art, relic art, or deck contents into static background images.
- Implementing the leftmost module-introduction strip as playable UI.

## Current Baseline

Temporary baseline screenshots were generated in `/tmp/questers_event_baseline/`:

- `current_shop.png`
- `current_encounter_home.png`
- `current_campfire_home.png`
- `compare_shop.png`
- `compare_encounter.png`
- `compare_campfire.png`

Observed baseline:
- The implementation already hides the old left-side explanatory rail copy for these event shells.
- Encounter and campfire home states are visually close to their single-screen concept references.
- Shop has the correct functional states and reusable assets, but the visual density, proportions, and state layouts still need closer alignment with the concept board.
- The shop layout editor button is visible in the live shop overlay and must not ship in the final recreated UI.
- Follow-up states for encounter and campfire need systematic screenshot coverage, not just home-state review.

## Design Direction

Use the existing asset-layer approach rather than a baked full-screen image. The concept art should be recreated as a functional UI made from reusable frames, NPC art, backgrounds, buttons, card rendering, relic rendering, deck browsers, and CSS positioning.

The target feeling is a dark gothic stained-glass deckbuilder screen:
- deep navy/teal/blue-black background plates,
- antique gold linework and jewel nodes,
- arched NPC portraits,
- parchment reading panels,
- stained-glass option medallions,
- cel-shaded NPC integration,
- restrained state motion that clarifies hover/selection only.

## Layout Requirements

All three event types should share one recognizable event-screen shell:
- outer ornate frame aligned to the concept-board proportions,
- left NPC portrait zone instead of the module-introduction text strip,
- title or tab zone at the top,
- permanent leave/continue action in the upper-right or concept-specific right action area,
- main state content centered and balanced against the portrait zone,
- no nested generic cards that fight the painted asset frames.

Responsive behavior:
- Desktop target must be verified at `1672x941`, matching concept dimensions.
- Standard desktop target must be verified at `1280x720`, matching the current game viewport.
- The event shell may scale down to fit smaller viewports, but text and buttons must not overlap or overflow.

## State Requirements

Shop:
- `货架` should feel like the concept's merchant reliquary: three card goods, up to three relic medallions, visible selected detail panel, compact prices, and clear restock.
- `拓印` and `精简` should use the same shop shell and top tabs, with the center converted into a large-deck browser and the right column into a selected-card preview/action panel.
- Tabs, gold counter, leave button, restock area, detail panel, and selected item glow should stay stable across state changes.

Encounter:
- Home cards should match the single-screen encounter concept: three tall stained-glass plaques with title cap, circular art/medallion area, parchment body, and blue-gold action button.
- Result and deck states should preserve the same shell and background rather than reverting to generic overlays.
- Reward, upgrade, and organize flows should visually read as selected option expansions from the home screen.

Campfire:
- Home cards should match the single-screen campfire concept: elder portrait on left, campfire visible on right, three tall option cards centered.
- Rest, upgrade, and forget states should preserve the campfire shell and use the concept-board compositions where possible.
- The continue action should remain clear and visually consistent with the top-right/advance treatment in the concept board.

## Implementation Approach

Recommended approach:
1. Add a small screenshot harness for the event UI states so every state can be opened directly in a deterministic browser session.
2. Hide or remove development-only shop layout editor controls from normal gameplay.
3. Tighten shop layout first, because it is the largest visual gap and has the most state complexity.
4. Add screenshot coverage for shop `货架`, `拓印`, `精简`.
5. Tighten encounter follow-up states after home-state alignment.
6. Tighten campfire follow-up states after home-state alignment.
7. Run browser screenshots at `1672x941` and `1280x720`, then compare against cropped concept references.

This approach keeps gameplay functional while moving visual fidelity toward the concept.

## Verification

Required local verification before claiming completion:
- Generate screenshots for all scoped states at `1672x941`.
- Generate screenshots for all scoped states at `1280x720`.
- Confirm the leftmost module-introduction strip does not appear in the playable UI.
- Confirm no development-only layout editor controls appear in normal gameplay.
- Confirm card/relic content remains dynamic and clickable.
- Confirm deck-browser states support large decks without text or card overlap.
- Run the existing Questers release or smoke checks available in the repo.

Completion is not proven by code inspection alone. It requires current screenshots for every scoped state plus functional checks for the live controls.

## Acceptance Checklist

- Shop `货架` visually matches the approved concept structure after excluding the concept-board module strip.
- Shop `拓印` visually matches the approved concept structure after excluding the concept-board module strip.
- Shop `精简` visually matches the approved concept structure after excluding the concept-board module strip.
- Encounter home visually matches the approved encounter concept.
- Encounter treasure result matches the approved concept structure.
- Encounter trial/upgrade flow matches the approved concept structure.
- Encounter organize flow matches the approved concept structure.
- Campfire home visually matches the approved campfire concept.
- Campfire rest flow matches the approved concept structure.
- Campfire upgrade flow matches the approved concept structure.
- Campfire forget flow matches the approved concept structure.
- Continue/leave actions are stable, readable, and concept-consistent.
- No playable UI contains the concept-board-only module-introduction strip.
- No unrelated files are included in the implementation commit.
