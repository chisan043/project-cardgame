# Status Icon Assets

Runtime HUD status icons live in this directory as:

`status_<id>_asset_v1.webp`

The matching source slices live in:

`assets/source/ui/hud/status_icons/status_<id>_asset_v1_source.png`

Candidate source sheets live in:

`assets/candidates/ui/hud/status_icons/`

Runtime ids are registered in `src/runtime/visual-rules.js` as `STATUS_ICON_IDS`
and resolved through `QuestersVisualRules.getStatusIconPath(id)`.
