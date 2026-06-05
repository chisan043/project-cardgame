# Relic Art Assets

This directory contains runtime relic visuals for the demo.

## Runtime

- `icons/`
  - One formal runtime icon per relic id.
  - File format: `{relic_id}_icon_v1.webp`.
  - Icons missing from the old formal icon set were copied from their configured master fallback so `FORMAL_RELIC_ICON_IDS` never points at a missing file.

- `masters/`
  - Shared fallback runtime masters for non-formal relics and future derivation.
  - File format: `{theme}_master_v1.webp`.

## Source

- `assets/source/relics/icons/`
  - PNG source counterparts for formal relic icons.

- `assets/source/relics/masters/`
  - PNG source counterparts for fallback masters.

## Candidates

- `assets/candidates/relics/`
  - Unreferenced concept sheets and review-only candidate material.

Chinese display names remain in `src/data/relics.js`; asset paths should stay short ASCII paths.
