# Asset Directory Boundaries

This project keeps visual assets in three separate lanes so runtime references,
review material, and editable sources do not drift into each other.

## Runtime

Runtime assets are files that the demo can load directly. They live under:

- `assets/cards/`
- `assets/characters/`
- `assets/enemies/`
- `assets/npc/`
- `assets/relics/`
- `assets/scenes/`
- `assets/ui/`
- `assets/vfx/`

Runtime assets should use short ASCII paths and final web formats such as
`.webp` or optimized `.png`.

## Source

Editable source files live under `assets/source/`. They can be referenced by
generated registries as provenance, but runtime code should not load them
directly.

## Candidates

Review-only candidates live under `assets/candidates/`. Promote a candidate
into the matching runtime directory before wiring it into gameplay, HUD, map,
or scene code.

## Archive

Unused legacy material lives under `assets/archive/unused/`. Archive files are
kept for history and review; runtime code should not reference them.

## Checks

- `tools/audit_assets.py` classifies active, source, candidate, legacy, and
  unreferenced assets.
- `tools/check_asset_boundaries.mjs` fails when runtime code references
  `assets/source/`, `assets/candidates/`, or `assets/archive/unused/`.
- `tools/run_release_checks.mjs` runs both checks before the registry and
  gameplay guardrails.
