# Asset Migration Plan: ui_menu

This is a review-only plan. No source asset was moved, renamed, copied, or archived.

## Scope

- Source prefix: `UI/主菜单/`
- Include prefixes: `assets/ui/menu/`, `assets/source/ui/menu/`, `assets/candidates/ui/menu/`
- Target runtime directory: `assets/ui/menu`
- Assets in scope: 4
- Duplicate extension groups: 0

## Counts

### Status
- active: 1
- candidate: 2
- source: 1

### Action

- already_migrated: 4

### Git Tracking

- tracked: 4

## Proposed Entries

### `assets/candidates/ui/menu/main_menu_key_art_candidate_v1.png`

- Suggested path: `assets/candidates/ui/menu/main_menu_key_art_candidate_v1.png`
- Action: `already_migrated`
- Status: `candidate`
- Tracked: `True`
- References: none
- Notes: candidate asset; keep outside formal runtime directory

### `assets/candidates/ui/menu/main_menu_key_art_candidate_v2.png`

- Suggested path: `assets/candidates/ui/menu/main_menu_key_art_candidate_v2.png`
- Action: `already_migrated`
- Status: `candidate`
- Tracked: `True`
- References: none
- Notes: candidate asset; keep outside formal runtime directory

### `assets/source/ui/menu/main_menu_key_art_v1_source.png`

- Suggested path: `assets/source/ui/menu/main_menu_key_art_v1_source.png`
- Action: `already_migrated`
- Status: `source`
- Tracked: `True`
- References: none
- Notes: review before migration

### `assets/ui/menu/main_menu_key_art_v1.webp`

- Suggested path: `assets/ui/menu/main_menu_key_art_v1.webp`
- Action: `already_migrated`
- Status: `active`
- Tracked: `True`
- References: questers_demo_v0.99.html:67 (runtime)
- Notes: runtime/config referenced

## Duplicate Extension Groups

- None.

## Next Review Questions

- Is the active runtime asset name acceptable?
- Should untracked candidate files be adopted, ignored, or archived later?
- Should PNG counterparts be treated as source files or candidate files?
