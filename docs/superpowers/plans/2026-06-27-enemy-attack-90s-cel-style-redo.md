# Enemy Attack 90s Cel Style Redo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rejected enemy `v2` attack samples with six-frame attack frames derived from the existing 1990s cel-style enemy battle illustrations while preserving runtime integration and left-down attack direction. The scope has since expanded from the original five sample enemies to the full current enemy roster.

**Architecture:** Keep the runtime contract unchanged: configured enemies resolve to `assets/enemies/attack/<slug>_attack_01_v2.webp` through `_06_v2.webp`, while each `v2` frame keeps a `v1` fallback source. Generate one six-slot strip per enemy, normalize with `tools/build_enemy_attack_frames.py`, and review outputs through contact sheets before committing. For scale correctness, output canvases use 900px height and a width derived from each enemy's battle-art aspect ratio, so wide enemies do not shrink during the attack swap.

**Tech Stack:** Built-in `image_gen` for raster strip generation, Pillow/Python for contact sheets and alpha validation, existing `tools/build_enemy_attack_frames.py` for normalization, Node test runner for runtime/asset checks.

---

## File Structure

- Modify regenerated runtime assets: `assets/enemies/attack/<slug>_attack_01_v2.webp` through `_06_v2.webp` for all current enemy slugs.
- Modify regenerated source previews: `assets/source/enemies/attack/v2_samples/<slug>_attack_preview_v2.png`.
- Modify source strips only after a strip is accepted: `assets/source/enemies/attack/v2_samples/<slug>_attack_strip_v2_source.png`.
- Read style spec: `docs/superpowers/specs/2026-06-27-enemy-attack-90s-cel-style-design.md`.
- Read existing runtime tests: `tests/enemy-attack-frames.test.mjs` and `tests/enemy-attack-frame-tool.test.mjs`.
- Do not modify runtime code unless tests reveal the existing metadata no longer points at the regenerated files.

## Shared Prompt Contract

Use this shared style block in every image generation prompt:

```text
Input image role: the matching assets/enemies/battle/<slug>_battle_v1.webp image is the strict identity, palette, linework, cel-shading, edge-treatment, and rendering reference.
Style target: source-locked 1990s Japanese cel fantasy anime keyframes, not a generic monster reinterpretation and not modern illustration.
Visual language: hand-drawn organic linework matching the battle illustration, 2-3 hard-edged shadow levels, restrained highlights, film-era colors, stable readable silhouette.
Composition: one horizontal six-frame spritesheet, exactly six equal slots, one enemy only, solid pure black #000000 background for style review, generous padding, no scenery, no labels, no UI, no cast shadow.
Animation direction: the enemy is on the right side of the battle screen, so all attacks must aim diagonally left-down toward the player.
Avoid: generic redesign, modern painterly rendering, realistic material texture, soft airbrushed gradients, cinematic lighting, high-frequency brushwork, concept-art detail, poster composition, extra characters.
```

Use these enemy action clauses:

```text
sick_slime: squash down, swell with pressure, fling acidic body mass diagonally left-down, recoil into idle.
wild_wolf: crouch, spring forward, bite or claw diagonally left-down, land and recover.
greedy_thief: draw blade, dash diagonally left-down, slash or stab, withdraw into guarded stance.
nether_mage: gather spectral power, cast diagonally left-down, release ghostfire, robe settles.
undead_bone_dragon: rear back or spread wings, breathe or rake diagonally left-down, fold back toward idle.
```

### Task 1: Pilot One Enemy Before Batch Replacement

**Files:**
- Modify after acceptance: `assets/source/enemies/attack/v2_samples/wild_wolf_attack_strip_v2_source.png`
- Modify after acceptance: `assets/source/enemies/attack/v2_samples/wild_wolf_attack_preview_v2.png`
- Modify after acceptance: `assets/enemies/attack/wild_wolf_attack_01_v2.webp` through `assets/enemies/attack/wild_wolf_attack_06_v2.webp`

- [ ] **Step 1: Generate a single pilot strip for `wild_wolf`**

View `assets/enemies/battle/wild_wolf_battle_v1.webp`, then use built-in `image_gen` with this prompt:

```text
Use case: stylized-concept
Asset type: 2D browser game enemy attack spritesheet
Primary request: Create a six-frame attack spritesheet for the Questers wild wolf enemy.
Subject: the exact wild wolf from wild_wolf_battle_v1, preserving the huge ragged mane, red eyes, red crack markings, tan-gray legs, dark claws, and low stalking posture.
Action: wild_wolf: crouch, spring forward, bite or claw diagonally left-down, land and recover.
Style target: source-locked 1990s Japanese cel fantasy anime keyframes, not a generic monster reinterpretation and not modern illustration.
Visual language: hand-drawn organic linework matching the battle illustration, 2-3 hard-edged shadow levels, restrained highlights, film-era colors, stable readable silhouette.
Composition: one horizontal six-frame spritesheet, exactly six equal slots, one enemy only, solid pure black #000000 background, generous padding, no scenery, no labels, no UI, no cast shadow.
Animation direction: the enemy is on the right side of the battle screen, so all attacks must aim diagonally left-down toward the player.
Avoid: generic redesign, modern painterly rendering, realistic material texture, soft airbrushed gradients, cinematic lighting, high-frequency brushwork, concept-art detail, poster composition, extra characters.
```

Expected: one generated image containing exactly six horizontal frame slots, with a flat black background and no cropped body parts.

- [ ] **Step 2: Save the generated pilot strip**

Copy the selected generated image, remove only border-connected near-black background to preserve internal dark linework, then save to:

```text
assets/source/enemies/attack/v2_samples/wild_wolf_attack_strip_v2_source.png
```

Expected: the file exists and opens as a normal image.

- [ ] **Step 3: Normalize the pilot strip**

Run:

```bash
python3 tools/build_enemy_attack_frames.py \
  --extract-mode slots \
  --input assets/source/enemies/attack/v2_samples/wild_wolf_attack_strip_v2_source.png \
  --slug wild_wolf \
  --out-dir assets/enemies/attack \
  --preview assets/source/enemies/attack/v2_samples/wild_wolf_attack_preview_v2.png \
  --key-color '#ff00ff' \
  --key-threshold 4 \
  --padding-ratio 0.92
```

Expected: six `wild_wolf_attack_*_v2.webp` files and one preview PNG are written.

- [ ] **Step 4: Inspect the pilot**

Open:

```text
assets/source/enemies/attack/v2_samples/wild_wolf_attack_preview_v2.png
```

Accept only if it reads like keyframes derived from the wild wolf battle illustration, keeps the original palette and face/key features, has no modern glossy rendering, no clipped body parts, and attacks left-down. If it fails, repeat Steps 1-4 with stricter source-lock language.

- [ ] **Step 5: Run pilot validation**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
from PIL import Image
frames = sorted(Path('assets/enemies/attack').glob('wild_wolf_attack_*_v2.webp'))
assert len(frames) == 6, len(frames)
for path in frames:
    img = Image.open(path).convert('RGBA')
    assert img.size == (675, 900), (path.name, img.size)
    assert img.getchannel('A').getbbox() is not None, path.name
print('wild_wolf pilot frames ok')
PY
```

Expected: `wild_wolf pilot frames ok`.

### Task 2: Regenerate the Remaining Four Enemy Strips

**Files:**
- Modify: `assets/source/enemies/attack/v2_samples/sick_slime_attack_strip_v2_source.png`
- Modify: `assets/source/enemies/attack/v2_samples/greedy_thief_attack_strip_v2_source.png`
- Modify: `assets/source/enemies/attack/v2_samples/nether_mage_attack_strip_v2_source.png`
- Modify: `assets/source/enemies/attack/v2_samples/undead_bone_dragon_attack_strip_v2_source.png`

- [ ] **Step 1: Generate `sick_slime`**

Use built-in `image_gen` with the shared prompt contract and this subject/action:

```text
Subject: a sick green slime monster with one readable eye, sagging goo silhouette, and toxic acidic body.
Action: sick_slime: squash down, swell with pressure, fling acidic body mass diagonally left-down, recoil into idle.
Extra style guard: simplify slime into clean cel color shapes with hard shadow shapes; no glossy realistic liquid rendering; no complex texture.
```

Save selected output to:

```text
assets/source/enemies/attack/v2_samples/sick_slime_attack_strip_v2_source.png
```

- [ ] **Step 2: Generate `greedy_thief`**

Use built-in `image_gen` with the shared prompt contract and this subject/action:

```text
Subject: a hooded rogue thief enemy with dark cloak, small blade, guarded posture, readable humanoid silhouette.
Action: greedy_thief: draw blade, dash diagonally left-down, slash or stab, withdraw into guarded stance.
Extra style guard: keep cloak folds simple and graphic; no painterly leather or cloth material rendering.
```

Save selected output to:

```text
assets/source/enemies/attack/v2_samples/greedy_thief_attack_strip_v2_source.png
```

- [ ] **Step 3: Generate `nether_mage`**

Use built-in `image_gen` with the shared prompt contract and this subject/action:

```text
Subject: a skeletal dark-robed nether mage with staff, tall robe silhouette, pale face or skull-like features, ghostfire magic.
Action: nether_mage: gather spectral power, cast diagonally left-down, release ghostfire, robe settles.
Extra style guard: draw smoke and magic as simple cel-animation flame shapes; no volumetric smoke or modern glow rendering.
```

Save selected output to:

```text
assets/source/enemies/attack/v2_samples/nether_mage_attack_strip_v2_source.png
```

- [ ] **Step 4: Generate `undead_bone_dragon`**

Use built-in `image_gen` with the shared prompt contract and this subject/action:

```text
Subject: an undead skeletal bone dragon with wings, long neck, bony limbs, green necrotic energy in the chest.
Action: undead_bone_dragon: rear back or spread wings, breathe or rake diagonally left-down, fold back toward idle.
Extra style guard: simplify bones and wings into readable cel shapes; no high-frequency bone texture; no painterly rendering.
```

Save selected output to:

```text
assets/source/enemies/attack/v2_samples/undead_bone_dragon_attack_strip_v2_source.png
```

Expected: four saved source strips, each one row of six slots with alpha after border-connected black-background removal.

### Task 3: Normalize the Full Five-Enemy Batch

**Files:**
- Modify: `assets/enemies/attack/<slug>_attack_01_v2.webp` through `_06_v2.webp` for all five sample enemies.
- Modify: `assets/source/enemies/attack/v2_samples/<slug>_attack_preview_v2.png` for all five sample enemies.

- [ ] **Step 1: Normalize all accepted strips**

Run:

```bash
for slug in sick_slime wild_wolf greedy_thief nether_mage undead_bone_dragon; do
  python3 tools/build_enemy_attack_frames.py \
    --extract-mode slots \
    --input assets/source/enemies/attack/v2_samples/${slug}_attack_strip_v2_source.png \
    --slug ${slug} \
    --out-dir assets/enemies/attack \
    --preview assets/source/enemies/attack/v2_samples/${slug}_attack_preview_v2.png \
    --key-color '#ff00ff' \
    --key-threshold 4 \
    --padding-ratio 0.92
done
```

Expected: each command exits with status `0`.

- [ ] **Step 2: Validate frame counts, dimensions, alpha, and no exact chroma key**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
from PIL import Image
slugs = ['sick_slime', 'wild_wolf', 'greedy_thief', 'nether_mage', 'undead_bone_dragon']
for slug in slugs:
    frames = sorted(Path('assets/enemies/attack').glob(f'{slug}_attack_*_v2.webp'))
    assert len(frames) == 6, (slug, len(frames))
    for path in frames:
        img = Image.open(path).convert('RGBA')
        assert img.size == (675, 900), (path.name, img.size)
        assert img.getchannel('A').getbbox() is not None, path.name
        exact_key = sum(1 for r, g, b, a in img.getdata() if a > 16 and r > 245 and g < 16 and b > 245)
        assert exact_key == 0, (path.name, exact_key)
print('checked 30 cel-style attack frames')
PY
```

Expected: `checked 30 cel-style attack frames`.

### Task 4: Render Review Contact Sheets

**Files:**
- Create or update review-only files outside git or under source review paths as needed.
- Do not stage temporary files under `/tmp`.

- [ ] **Step 1: Render a five-enemy contact sheet**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
from PIL import Image, ImageDraw
slugs = ['sick_slime', 'wild_wolf', 'greedy_thief', 'nether_mage', 'undead_bone_dragon']
thumb_w, thumb_h = 225, 300
label_h, gap = 28, 8
out = Image.new('RGBA', (6 * thumb_w + 5 * gap, len(slugs) * (thumb_h + label_h) + (len(slugs) - 1) * gap), (245, 247, 250, 255))
draw = ImageDraw.Draw(out)
for row, slug in enumerate(slugs):
    y0 = row * (thumb_h + label_h + gap)
    draw.text((4, y0 + 6), slug, fill=(20, 24, 32, 255))
    for col, path in enumerate(sorted(Path('assets/enemies/attack').glob(f'{slug}_attack_*_v2.webp'))):
        img = Image.open(path).convert('RGBA').resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        out.alpha_composite(img, (col * (thumb_w + gap), y0 + label_h))
out.save('/tmp/questers_enemy_attack_90s_cel_contact.png')
print('/tmp/questers_enemy_attack_90s_cel_contact.png')
PY
```

Expected: `/tmp/questers_enemy_attack_90s_cel_contact.png`.

- [ ] **Step 2: Visual inspect the contact sheet**

Open `/tmp/questers_enemy_attack_90s_cel_contact.png` and check:

```text
PASS if each enemy reads as an action-keyframe extension of its matching battle illustration, preserves identity, has transparent output, avoids obvious clipping, and attacks left-down.
FAIL if any enemy reads as a generic redesign, has heavy modern rendering, attacks rightward, has obvious chroma fringe, or has clipped body parts.
```

If any enemy fails, return to Task 2 for that enemy only and regenerate its strip with a stricter prompt.

### Task 5: Runtime and Release Verification

**Files:**
- Test: `tests/enemy-attack-frames.test.mjs`
- Test: `tests/enemy-attack-frame-tool.test.mjs`
- Test: all files matched by `tests/*.test.mjs`

- [ ] **Step 1: Run enemy frame metadata tests**

Run:

```bash
node tests/enemy-attack-frames.test.mjs
```

Expected: all tests pass.

- [ ] **Step 2: Run export tool regression tests**

Run:

```bash
node tests/enemy-attack-frame-tool.test.mjs
```

Expected: all tests pass.

- [ ] **Step 3: Run release checks**

Run:

```bash
node tools/run_release_checks.mjs
```

Expected: `Release checks: pass`.

- [ ] **Step 4: Run full Node tests**

Run:

```bash
node --test tests/*.test.mjs
```

Expected: all tests pass.

### Task 6: Commit and Push Only Related Files

**Files:**
- Stage only the regenerated five enemy `v2` attack frame sets.
- Stage only the corresponding five source strips and five preview PNGs.
- Do not stage `test_reports/`.
- Do not stage `tools/build_missing_flow_card_art.py`.

- [ ] **Step 1: Inspect status**

Run:

```bash
git status --short
```

Expected: changed files are limited to regenerated attack assets/source previews, plus the known unrelated untracked files `test_reports/` and `tools/build_missing_flow_card_art.py`.

- [ ] **Step 2: Stage related assets**

Run:

```bash
git add \
  assets/enemies/attack/*_v2.webp \
  assets/source/enemies/attack/v2_samples/*_attack_strip_v2_source.png \
  assets/source/enemies/attack/v2_samples/*_attack_preview_v2.png
```

Expected: only related attack asset files are staged.

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "Redo enemy attacks in cel style"
```

Expected: commit succeeds.

- [ ] **Step 4: Push**

Run:

```bash
git push
```

Expected: push succeeds to the current tracking branch.

## Self-Review

- Spec coverage: The plan covers the approved 1990s cel style target, anti-targets, five-enemy scope, left-down motion direction, existing file naming, source/preview paths, normalization, contact-sheet review, tests, and unrelated-file staging guard.
- Completion scan: No task contains unresolved markers or an unspecified implementation step.
- Type and command consistency: Slugs, file names, and commands match the existing `v2` asset convention and the current `tools/build_enemy_attack_frames.py` CLI.
