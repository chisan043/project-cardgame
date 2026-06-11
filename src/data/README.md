# Gameplay Data

This directory holds side-effect-free data extracted from `questers_demo_v0.99.html`.

Load order in the demo:

1. `relics.js`
2. `card-tags.js`
3. `cards.js`
4. `enemies.js`
5. `characters.js`

`card-tags.js` owns keyword pools, keyword/status descriptions, display aliases,
and side-effect-free card value calculations. Battle state mutations, relic
checks, animation, and DOM rendering remain in the main runtime.

Keep runtime logic, DOM reads/writes, save handling, and battle resolution in the main runtime until those systems are split deliberately.
