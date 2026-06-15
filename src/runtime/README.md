# Runtime Modules

This directory holds gameplay runtime helpers that are not raw data and do not
own DOM rendering.

- `reward-rules.js`: reward selection weights, rarity rolls, build
  profile/bridge matching, candidate filtering, battle reward math,
  rest healing, skip-gold math, and shop economy helpers.
- `map-rules.js`: map node layout, path connection, node-type assignment,
  route-state checks, render-state flags, preview-node selection, preview
  variant selection, and floor labels.
- `state-rules.js`: initial run-state templates, save payload snapshots, map
  node lookup helpers, and character run-stat derivation.
- `card-rules.js`: card instance cloning, starter deck creation, upgrade, and
  copy cleanup helpers.
- `battle-rules.js`: battle-start, battle-win, run-failure, encounter scaling,
  and combat math helpers.

Keep `src/data/*` side-effect-free. Keep DOM creation, overlay rendering, and
state mutation in the main runtime until those surfaces are split deliberately.
