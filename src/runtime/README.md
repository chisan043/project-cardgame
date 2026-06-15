# Runtime Modules

This directory holds gameplay runtime helpers that are not raw data and do not
own DOM rendering.

- `reward-rules.js`: reward selection weights, rarity rolls, build
  profile/bridge matching, candidate filtering, battle reward math,
  rest healing, skip-gold math, role relic-pool filtering, shop spending, and
  shop economy helpers.
- `map-rules.js`: map node layout, path connection, node-type assignment,
  route-state checks, render-state flags, preview-node selection, preview
  variant selection, and floor labels.
- `state-rules.js`: initial run-state templates, save payload snapshots,
  saved-run hydration, map node lookup helpers, character resolution, and
  run-stat derivation.
- `card-rules.js`: card instance cloning, battle instance id normalization,
  starter deck creation, upgrade preview/application, copy cleanup helpers, and
  automatic card-selection priority helpers.
- `battle-rules.js`: battle-start, battle-win, run-failure, enemy move AI,
  encounter scaling, encounter background selection, and combat math helpers.
- `visual-rules.js`: card visual indexes, enemy visual asset paths,
  attack-frame paths/timing, player animation/VFX timing/layout, and enemy
  attack VFX type/path selection.

Keep `src/data/*` side-effect-free. Keep DOM creation, overlay rendering, and
state mutation in the main runtime until those surfaces are split deliberately.
