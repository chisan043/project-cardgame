# Enemy Attack Frame Regeneration Design

## Context

Enemy attack animations currently feel too generic because the visible motion is dominated by shared runtime effects. The project already has four `v1` attack frames per enemy under `assets/enemies/attack/`, and `questers_demo_v0.99.html` can switch those frames during an enemy attack. The next improvement should regenerate the attack frames themselves so each enemy has a clearer, character-specific attack beat like the player characters.

## Approved Scope

The approved rollout now covers all 20 current enemy battle-art slugs. The first five enemies were used as the pilot batch, then the same pipeline was extended to the remaining roster:

- `sick_slime`
- `bone_soldier`
- `greedy_thief`
- `blood_bat`
- `lost_fox`
- `wild_wolf`
- `ancient_spider`
- `venom_toad`
- `angry_boar`
- `iron_crab`
- `fallen_swordsman`
- `nether_mage`
- `stone_golem`
- `shadow_assassin`
- `stitched_brute`
- `elite_minotaur`
- `crimson_blood_witch`
- `undead_bone_dragon`
- `boss_oni_shura`
- `abyss_overlord`

Each enemy gets six new attack frames:

- `assets/enemies/attack/<slug>_attack_01_v2.webp`
- `assets/enemies/attack/<slug>_attack_02_v2.webp`
- `assets/enemies/attack/<slug>_attack_03_v2.webp`
- `assets/enemies/attack/<slug>_attack_04_v2.webp`
- `assets/enemies/attack/<slug>_attack_05_v2.webp`
- `assets/enemies/attack/<slug>_attack_06_v2.webp`

Existing `v1` assets remain in place and are not overwritten.

## Animation Direction

Every enemy should demonstrate distinct body language:

- `sick_slime`: squash down, swell with pressure, launch acid or body mass forward, recoil into idle.
- `wild_wolf`: crouch, spring forward, bite or claw at peak reach, land and recover.
- `greedy_thief`: draw weapon, dash in, rapid stab or slash, withdraw into guarded stance.
- `nether_mage`: gather spectral energy, raise staff or hands, release ghostfire, robe settles.
- `undead_bone_dragon`: spread wings, rear back, breathe or strike, fold back toward idle.
- Humanoid weapon enemies: draw, lunge diagonally left-down, strike, and recover with weapon-readable poses.
- Heavy beast or brute enemies: compress, charge or slam diagonally left-down, then recoil into idle.
- Caster or occult enemies: gather compact spell energy, release toward the lower-left player position, then settle.
- Wide-bodied enemies such as `ancient_spider` and `iron_crab`: keep their wide silhouette and avoid shrinking during the attack.

The frames must keep each enemy's existing silhouette family, palette, facing direction, proportions, and key readable features.
Because enemies stand on the right side of the battle screen, every attack pose must aim diagonally left-down toward the player character. Any rightward attack thrust, slash, pounce, or projectile direction is invalid.

## Asset Pipeline

For each enemy, use the existing in-game battle sprite as the identity seed. Generate one horizontal six-frame animation strip per enemy rather than generating individual frames independently. This reduces frame-to-frame identity drift.

The generated strip should use a clean removable background or transparent output, contain one row of six equal slots, and avoid scenery, labels, UI, shadows, or extra characters. After generation, split and normalize frames to a transparent WebP canvas with a 900px height and a width derived from the enemy's battle-art canvas aspect ratio. This keeps wide enemies from visually shrinking when the browser swaps from the battle sprite to attack frames. Frames should use bottom-center alignment.

Keep source or review artifacts under a source/review path if needed, but only the accepted normalized `v2` frames should be referenced by runtime code.

## Runtime Integration

Update the enemy attack-frame lookup so it can use per-enemy animation metadata:

- All current enemy slugs use the six `v2` frames.
- If a `v2` frame is missing or fails to load, the enemy should still be able to fall back to the existing `v1` frame convention.

The runtime timing should support variable frame counts. Sample `v2` animations should use a rhythm closer to player attacks, with quick anticipation, a strong impact frame, and a short recovery. Enemy attack VFX timing should remain tied to the calculated impact delay.

## Verification

Basic verification after implementation:

- Confirm the new files exist and match the naming convention.
- Confirm attack frame canvas sizes match each enemy's battle-art aspect ratio.
- Run the existing release or asset checks available for this repository.
- Inspect a full-roster contact sheet for direction, scale, and obvious cropping problems.
- Confirm the runtime now resolves all current enemies to six `v2` frames.
- Confirm unrelated untracked files are not staged or committed.

## Rollout Plan

The initial sample batch has been expanded to the full current enemy roster. Future enemy additions should include matching six-frame `v2` attack frames and a canvas width derived from the new battle-art aspect ratio.
