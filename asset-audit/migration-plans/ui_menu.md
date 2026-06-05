# Asset Migration Plan: ui_menu

This is a review-only plan. No source asset was moved, renamed, copied, or archived.

## Scope

- Source prefix: `UI/主菜单/`
- Target runtime directory: `assets/ui/menu`
- Assets in scope: 4
- Duplicate extension groups: 1

## Counts

### Status
- active: 1
- candidate: 3

### Action

- copy_as_candidate: 2
- copy_as_source: 1
- copy_then_rewrite_runtime_refs: 1

### Git Tracking

- tracked: 2
- untracked: 2

## Proposed Entries

### `UI/主菜单/main_menu_key_art_candidate_v1.png`

- Suggested path: `assets/candidates/ui/menu/main_menu_key_art_candidate_v1.png`
- Action: `copy_as_candidate`
- Status: `candidate`
- Tracked: `False`
- References: none
- Notes: untracked file; do not include in migration commit unless intentionally accepted; candidate asset; keep outside formal runtime directory

### `UI/主菜单/main_menu_key_art_candidate_v2.png`

- Suggested path: `assets/candidates/ui/menu/main_menu_key_art_candidate_v2.png`
- Action: `copy_as_candidate`
- Status: `candidate`
- Tracked: `False`
- References: none
- Notes: untracked file; do not include in migration commit unless intentionally accepted; candidate asset; keep outside formal runtime directory

### `UI/主菜单/main_menu_key_art_candidate_v3_cel.png`

- Suggested path: `assets/source/ui/menu/main_menu_key_art_v1_source.png`
- Action: `copy_as_source`
- Status: `candidate`
- Tracked: `True`
- References: none
- Notes: candidate asset; keep outside formal runtime directory; source counterpart for active runtime asset

### `UI/主菜单/main_menu_key_art_candidate_v3_cel.webp`

- Suggested path: `assets/ui/menu/main_menu_key_art_v1.webp`
- Action: `copy_then_rewrite_runtime_refs`
- Status: `active`
- Tracked: `True`
- References: 幻境残卷demo_v0.99.html:67 (runtime)
- Notes: runtime/config referenced

## Duplicate Extension Groups

- `UI/主菜单/main_menu_key_art_candidate_v3_cel`: .png, .webp

## Next Review Questions

- Is the active runtime asset name acceptable?
- Should untracked candidate files be adopted, ignored, or archived later?
- Should PNG counterparts be treated as source files or candidate files?
