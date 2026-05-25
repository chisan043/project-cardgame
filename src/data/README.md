# Gameplay Data

This directory holds side-effect-free data extracted from `幻境残卷demo_v0.99.html`.

Load order in the demo:

1. `relics.js`
2. `cards.js`
3. `enemies.js`
4. `characters.js`

Keep runtime logic, DOM reads/writes, save handling, and battle resolution in the main runtime until those systems are split deliberately.
