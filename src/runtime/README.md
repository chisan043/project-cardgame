# Runtime Modules

This directory holds gameplay runtime helpers that are not raw data and do not
own DOM rendering.

- `reward-rules.js`: reward selection weights, rarity rolls, build
  profile/bridge matching, candidate filtering, and reward skip-gold math.
- `map-rules.js`: map node layout, path connection, and node-type assignment.
- `state-rules.js`: initial run-state templates, save payload snapshots, and
  map node lookup helpers.
- `card-rules.js`: card instance cloning, starter deck creation, upgrade, and
  copy cleanup helpers.
- `battle-rules.js`: battle-start and battle-win state cleanup helpers.

Keep `src/data/*` side-effect-free. Keep DOM creation, overlay rendering, and
state mutation in the main runtime until those surfaces are split deliberately.
