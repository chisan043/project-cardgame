# Browser Acceptance Report - 2026-06-16

## Scope

Stage 5 desktop browser acceptance pass for `questers_demo_v0.99.html` served
from a local static server. Mobile adaptation is intentionally out of scope for
this pass.

## Covered

- Desktop main menu boot: pass.
- Desktop role select: pass for three visible roles and warrior selection.
- Desktop map entry: pass for generated map, top bar, detail panel, and entry.
- Desktop battle loop: pass for first combat entry, card play, enemy action,
  VFX visibility, new-turn hand refill, victory, and reward overlay.
- Desktop reward overlay: pass for three card rewards and skip-for-gold action.
- Desktop shop overlay: pass for shop banner, NPC art, command buttons, and exit.
- Desktop non-combat text selection: pass after applying the same selection
  guard used by combat UI to menu, map, event, shop, and campfire surfaces.
  Verified by dragging across map detail text in Safari without producing a
  visible selection highlight.

## Findings

### P2 - Desktop Hand Bottom Is Clipped

At the default desktop viewport, battle is playable and visually coherent, but
the lower edge of hand cards is clipped by the viewport. Card names, costs, and
art remain readable; lower rules text can be cut off.

Owner area: desktop hand tray height, bottom offset, and card fan transform.

### Fixed - Non-Combat Surfaces Allowed Blue Text Selection

Safari could drag-select text on the main menu, map, event, shop, and campfire
screens, while combat already blocked selection. The global UI now applies the
same non-selectable rule with the Safari-prefixed property and the same
selection event guard, leaving editable text fields as the only selectable
exception.

## Not Covered Yet

- Event overlay from a naturally reached event node.
- Rest/campfire overlay from a naturally reached rest node.
- Boss encounter and boss reward/ending path.

## Commands

- `python3 -m http.server 8765`
- Browser-driven playtest through the in-app browser.
- `node tools/run_release_checks.mjs`
