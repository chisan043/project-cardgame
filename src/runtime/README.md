# Runtime Modules

This directory holds gameplay runtime helpers that are not raw data and do not
own DOM rendering.

- `reward-rules.js`: reward selection weights, rarity rolls, candidate filtering,
  and reward skip-gold math.
- `map-rules.js`: map node layout, path connection, and node-type assignment.

Keep `src/data/*` side-effect-free. Keep DOM creation, overlay rendering, and
state mutation in the main runtime until those surfaces are split deliberately.
