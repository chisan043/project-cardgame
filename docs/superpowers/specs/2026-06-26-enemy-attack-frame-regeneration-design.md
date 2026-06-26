# Enemy Attack Frame Regeneration Design

## Context

Enemy attack animations currently feel too generic because the visible motion is dominated by shared runtime effects. The project already has four `v1` attack frames per enemy under `assets/enemies/attack/`, and `questers_demo_v0.99.html` can switch those frames during an enemy attack. The next improvement should regenerate the attack frames themselves so each enemy has a clearer, character-specific attack beat like the player characters.

## Approved Scope

Create a sample batch for five representative enemies before expanding to the full enemy roster:

- `sick_slime`
- `wild_wolf`
- `greedy_thief`
- `nether_mage`
- `undead_bone_dragon`

Each sample enemy gets six new attack frames:

- `assets/enemies/attack/<slug>_attack_01_v2.webp`
- `assets/enemies/attack/<slug>_attack_02_v2.webp`
- `assets/enemies/attack/<slug>_attack_03_v2.webp`
- `assets/enemies/attack/<slug>_attack_04_v2.webp`
- `assets/enemies/attack/<slug>_attack_05_v2.webp`
- `assets/enemies/attack/<slug>_attack_06_v2.webp`

Existing `v1` assets remain in place and are not overwritten.

## Animation Direction

The five sample enemies should demonstrate distinct body language:

- `sick_slime`: squash down, swell with pressure, launch acid or body mass forward, recoil into idle.
- `wild_wolf`: crouch, spring forward, bite or claw at peak reach, land and recover.
- `greedy_thief`: draw weapon, dash in, rapid stab or slash, withdraw into guarded stance.
- `nether_mage`: gather spectral energy, raise staff or hands, release ghostfire, robe settles.
- `undead_bone_dragon`: spread wings, rear back, breathe or strike, fold back toward idle.

The frames must keep each enemy's existing silhouette family, palette, facing direction, proportions, and key readable features.

## Asset Pipeline

For each sample enemy, use the existing in-game battle sprite as the identity seed. Generate one horizontal six-frame animation strip per enemy rather than generating individual frames independently. This reduces frame-to-frame identity drift.

The generated strip should use a clean removable background or transparent output, contain one row of six equal slots, and avoid scenery, labels, UI, shadows, or extra characters. After generation, split and normalize frames to the existing game frame size and bottom-center alignment. The final exported format should be WebP to match existing enemy assets.

Keep source or review artifacts under a source/review path if needed, but only the accepted normalized `v2` frames should be referenced by runtime code.

## Runtime Integration

Update the enemy attack-frame lookup so it can use per-enemy animation metadata:

- Sample enemies use the six `v2` frames.
- Other enemies continue using the existing four `v1` frames.
- If a `v2` frame is missing or fails to load, the enemy should still be able to fall back to the existing `v1` frame convention.

The runtime timing should support variable frame counts. Sample `v2` animations should use a rhythm closer to player attacks, with quick anticipation, a strong impact frame, and a short recovery. Enemy attack VFX timing should remain tied to the calculated impact delay.

## Verification

Basic verification after implementation:

- Confirm the new files exist and match the naming convention.
- Run the existing release or asset checks available for this repository.
- Run the HTML client through a local server and inspect at least the five sample enemies in battle.
- Confirm non-sample enemies still attack with the old `v1` frames.
- Confirm unrelated untracked files are not staged or committed.

## Rollout Plan

This change is intentionally a sample batch. After the user approves the five sample animations in-game, extend the same pipeline to the remaining enemy roster in a second pass.
