# Enemy Attack VFX Frame Sync Design

## Goal

Enemy attack effects should match the new six-frame enemy attack animations instead of using one generic image moved by CSS. The effect direction must always read from the enemy side on the right toward the player position at lower left.

## Scope

- Create six-frame `v2` enemy attack VFX sequences for all 20 current VFX types under `assets/vfx/enemy_attack/`.
- Retain each image-generated black-background source sheet under `assets/source/vfx/enemy_attack/sheets/`.
- Keep the existing single-image `v1` effects as fallback assets.
- Sync VFX frame durations to the active enemy attack-frame durations.
- Start enemy attack VFX at the same time as the enemy body attack animation, with the strongest visual beat on frames 3-4.
- Do not use CSS translation as the primary attack motion for `v2` enemy VFX.

## Asset Contract

VFX frame names use:

```text
assets/vfx/enemy_attack/<type>_vfx_01_v2.webp
assets/vfx/enemy_attack/<type>_vfx_02_v2.webp
...
assets/vfx/enemy_attack/<type>_vfx_06_v2.webp
```

Each frame is a transparent `384x384` WebP sliced from a retained image-generated source sheet. The local slicing tool may crop panels, remove the connected black background, and bake the generated art onto the left-down attack path, but it must not draw the attack effect. The visible effect should move or bloom from right/top toward left/down across the sequence. Direction validation compares frame 2 and frame 4 with alpha centroid plus impact-bounds checks so large beams and heavy cleaves are not misread by their trailing effects.

## Runtime Contract

`QuestersVisualRules.getEnemyAttackVfxFrames()` returns the six `v2` frame paths plus the existing `v1` image as a fallback. The HTML client plays those frames on the existing `#vfx-e-atk` layer using the enemy attack-frame timings. If a `v2` frame fails to load, the image falls back to the corresponding single `v1` effect.

## Verification

- Unit test VFX frame path generation.
- Asset test all 120 VFX frames for existence, transparency, non-empty alpha, and left-down direction.
- Source-sheet test that all 20 image-generated black-background sheets are retained.
- Source contract test that enemy attack VFX starts before the impact wait, so it can sync with the body attack frames.
- Run release checks and all Node tests before commit.
