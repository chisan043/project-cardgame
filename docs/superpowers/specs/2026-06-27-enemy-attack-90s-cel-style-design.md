# Enemy Attack 90s Cel Style Redo Design

## Context

The five `v2` enemy attack samples solved the frame-count, per-enemy motion, fallback, and left-down attack direction requirements, but the generated art direction is wrong. The current samples read as modern dark fantasy illustration: dense rendering, soft gradients, material texture, painterly volume, and concept-art detail. The approved correction is to regenerate the sample attack frames from the real enemy battle illustrations, preserving the project's 1990s Japanese cel-animation fantasy style.

This is a style redo of the existing five-enemy sample batch, not a new roster expansion and not a runtime behavior change.

## Approved Style Target

The new attack frames must read as source-locked 1990s cel-animation enemy battle frames:

- same monster identity, palette, silhouette, and face/key features as `assets/enemies/battle/<slug>_battle_v1.webp`
- hand-drawn organic linework matching the enemy battle illustration
- two or three hard-edged cel shadow levels
- restrained highlights and film-era color values
- low texture density without glossy modern rendering
- stable readable silhouettes and consistent bottom anchoring
- transparent background after processing
- one horizontal six-frame animation strip per enemy before normalization

The result should feel like missing keyframes drawn from the existing monster battle stand, not a new generic reinterpretation of that monster.

## Explicit Anti-Targets

The new assets must avoid:

- modern painterly rendering
- generic monster redesigns that drift from the battle illustration
- realistic fur, cloth, slime, bone, smoke, or metal materials
- soft airbrushed gradients
- cinematic lighting
- high-frequency brush texture
- poster composition
- concept-art detail density
- extra scenery, labels, UI, shadows, or additional characters

## Scope

Redo only the existing five sample enemies:

- `sick_slime`
- `wild_wolf`
- `greedy_thief`
- `nether_mage`
- `undead_bone_dragon`

Each enemy keeps the existing six-frame `v2` runtime convention:

- `assets/enemies/attack/<slug>_attack_01_v2.webp`
- `assets/enemies/attack/<slug>_attack_02_v2.webp`
- `assets/enemies/attack/<slug>_attack_03_v2.webp`
- `assets/enemies/attack/<slug>_attack_04_v2.webp`
- `assets/enemies/attack/<slug>_attack_05_v2.webp`
- `assets/enemies/attack/<slug>_attack_06_v2.webp`

The existing `v1` enemy attack assets remain untouched and continue to provide fallback coverage for non-sample enemies and load failures.

## Motion Requirements

The existing motion direction requirement remains binding. Enemies stand on the right side of the battle screen, so every strike, lunge, spell, splash, bite, slash, or breath attack must aim diagonally left-down toward the player character. Any rightward attack direction is invalid.

The five enemies should still have distinct attack language:

- `sick_slime`: squash, build pressure, fling acidic body mass left-down, recoil.
- `wild_wolf`: crouch, spring, bite or claw left-down, recover.
- `greedy_thief`: draw blade, dash left-down, slash or stab, withdraw.
- `nether_mage`: gather spectral power, cast left-down, release ghostfire, robe settles.
- `undead_bone_dragon`: rear or spread wings, breathe or rake left-down, recover.

## Asset Pipeline

Use the existing in-game enemy battle illustration as the primary subject and style anchor. Generate or edit one six-slot horizontal strip per enemy rather than producing isolated frames independently. This preserves identity and reduces frame drift.

Use a removable flat background or another clean extraction method, then run the existing normalization tool so final frames share the current frame size, bottom-center alignment, transparency, and WebP format. For black-background source-locked strips, remove only border-connected near-black background so internal dark linework and shadow shapes are not punched out.

Source strips and preview sheets should stay under `assets/source/enemies/attack/v2_samples/`. Runtime references should continue to point only at normalized `assets/enemies/attack/*_v2.webp` frames.

## Comparison Standard

The current enemy battle illustrations are the primary style reference. The player-character back-view attack frames may help with timing and action readability, but they must not override the enemy battle illustration's linework, palette, silhouette, or rendering language.

During review, compare the regenerated enemy frames against:

- current rejected enemy `v2` frames for what to avoid
- corresponding enemy `assets/enemies/battle/<slug>_battle_v1.webp` files for identity and style fidelity
- player-character attack frames only for broad animation readability
- the live battle screen for size, direction, and frame timing

## Chosen Approach

Use the current five-enemy sample batch as the implementation boundary, but replace the source art direction and re-export the same file names. This keeps the working runtime integration and tests while correcting the visual problem at the asset level.

Rejected alternatives:

- Runtime filters or CSS stylization: this would not create real cel-style frame art.
- Editing only edge cleanup or color balance: this cannot remove the painterly rendering structure.
- Expanding to the full enemy roster now: this would multiply the style risk before the corrected sample is approved.

## Verification

Before committing the style redo:

- render a contact sheet comparing the regenerated frames
- inspect for hard cel shadows, low texture density, clean silhouettes, and left-down attack direction
- confirm all 30 normalized WebP frames exist and are `675x900`
- confirm transparency and no obvious chroma fringe
- run `node tests/enemy-attack-frames.test.mjs`
- run `node tests/enemy-attack-frame-tool.test.mjs`
- run `node tools/run_release_checks.mjs`
- run `node --test tests/*.test.mjs`
- verify unrelated untracked files are not staged

## Acceptance

The redo is acceptable when the user can look at the five sample attacks and read them as usable keyframes derived from the existing 1990s cel-style enemy battle illustrations, while still preserving each enemy identity and the correct left-down attack direction.
