# Enemy Attack Frame Regeneration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> Status note: this plan records the original five-enemy pilot. The current implementation has expanded the same `v2` six-frame pipeline to the full enemy roster, with per-enemy canvas widths derived from battle-art aspect ratio instead of a single fixed `675x900` canvas.

**Goal:** Generate and integrate real six-frame attack animations for five sample enemies without relying on CSS stretch effects.

**Architecture:** Use existing battle sprites as identity seeds, generate one six-slot strip per enemy, normalize each strip into `675x900` transparent WebP frames, and update runtime frame lookup to prefer configured `v2` six-frame sets. Keep non-sample enemies on the existing `v1` four-frame convention.

**Tech Stack:** Browser HTML/CSS/JS runtime, `src/runtime/visual-rules.js`, Node `node:test`, Python 3 with Pillow, local WebP assets.

---

### Task 1: Runtime Frame Lookup Tests

**Files:**
- Create: `tests/enemy-attack-frames.test.mjs`
- Modify: `src/runtime/visual-rules.js`
- Modify: `questers_demo_v0.99.html`

- [ ] **Step 1: Write the failing test**

Create `tests/enemy-attack-frames.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadVisualRules() {
  const source = readFileSync(new URL('../src/runtime/visual-rules.js', import.meta.url), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.QuestersVisualRules;
}

const visualRules = loadVisualRules();
const enemyAssetSlugs = {
  '病弱史莱姆': 'sick_slime',
  '荒野煞狼': 'wild_wolf'
};

test('configured sample enemies use v2 six-frame attack sets', () => {
  const frames = visualRules.getEnemyAttackFrames(
    { name: '病弱史莱姆' },
    {
      enemyAssetSlugs,
      enemyAttackFrameSets: {
        sick_slime: {
          version: 'v2',
          frameCount: 6,
          durations: [70, 80, 95, 125, 90, 80]
        }
      }
    }
  );

  assert.deepEqual(
    frames.map(frame => frame.src),
    [
      'assets/enemies/attack/sick_slime_attack_01_v2.webp',
      'assets/enemies/attack/sick_slime_attack_02_v2.webp',
      'assets/enemies/attack/sick_slime_attack_03_v2.webp',
      'assets/enemies/attack/sick_slime_attack_04_v2.webp',
      'assets/enemies/attack/sick_slime_attack_05_v2.webp',
      'assets/enemies/attack/sick_slime_attack_06_v2.webp'
    ]
  );
  assert.deepEqual(frames.map(frame => frame.duration), [70, 80, 95, 125, 90, 80]);
  assert.equal(frames[0].fallbackSrc, 'assets/enemies/attack/sick_slime_attack_01_v1.webp');
  assert.equal(frames[5].fallbackSrc, 'assets/enemies/attack/sick_slime_attack_04_v1.webp');
});

test('unconfigured enemies keep the existing v1 four-frame convention', () => {
  const frames = visualRules.getEnemyAttackFrames(
    { name: '荒野煞狼' },
    { enemyAssetSlugs }
  );

  assert.deepEqual(
    frames.map(frame => frame.src),
    [
      'assets/enemies/attack/wild_wolf_attack_01_v1.webp',
      'assets/enemies/attack/wild_wolf_attack_02_v1.webp',
      'assets/enemies/attack/wild_wolf_attack_03_v1.webp',
      'assets/enemies/attack/wild_wolf_attack_04_v1.webp'
    ]
  );
  assert.deepEqual(frames.map(frame => frame.duration), [110, 120, 170, 120]);
  assert.equal(frames.every(frame => frame.fallbackSrc === null), true);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node tests/enemy-attack-frames.test.mjs
```

Expected: FAIL because `getEnemyAttackFrames()` ignores `enemyAttackFrameSets` and returns four `v1` frames.

- [ ] **Step 3: Implement frame-set metadata support**

In `src/runtime/visual-rules.js`, update `getEnemyAttackFrames()` so it accepts `enemyAttackFrameSets`. A configured set should control `version`, `frameCount`, and `durations`; fallback sources should point to the closest existing four-frame `v1` frame.

In `questers_demo_v0.99.html`, add `ENEMY_ATTACK_FRAME_SETS` for:

```js
{
  sick_slime: { version: 'v2', frameCount: 6, durations: [70, 80, 95, 125, 90, 80] },
  wild_wolf: { version: 'v2', frameCount: 6, durations: [65, 75, 90, 120, 90, 75] },
  greedy_thief: { version: 'v2', frameCount: 6, durations: [60, 70, 85, 95, 85, 75] },
  nether_mage: { version: 'v2', frameCount: 6, durations: [85, 95, 115, 125, 95, 80] },
  undead_bone_dragon: { version: 'v2', frameCount: 6, durations: [90, 100, 125, 140, 105, 90] }
}
```

Pass that map into `QuestersVisualRules.getEnemyAttackFrames()`.

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
node tests/enemy-attack-frames.test.mjs
```

Expected: PASS.

### Task 2: Enemy Strip Normalization Tool

**Files:**
- Create: `tools/build_enemy_attack_frames.py`
- Create: `tests/enemy-attack-frame-tool.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/enemy-attack-frame-tool.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('enemy attack frame tool exports six fixed-size transparent webp frames and a preview', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'questers-enemy-frames-'));
  const strip = path.join(dir, 'strip.png');
  const outDir = path.join(dir, 'frames');
  const preview = path.join(dir, 'preview.png');

  const makeStrip = spawnSync('python3', ['-c', `
from PIL import Image, ImageDraw
img = Image.new('RGBA', (600, 120), (255, 0, 255, 255))
draw = ImageDraw.Draw(img)
for i in range(6):
    left = i * 100 + 30
    top = 70 - i * 4
    draw.rectangle((left, top, left + 34 + i, 112), fill=(20 + i * 25, 40, 90, 255))
img.save(r'${strip}')
`], { encoding: 'utf8' });
  assert.equal(makeStrip.status, 0, makeStrip.stderr);

  const result = spawnSync('python3', [
    'tools/build_enemy_attack_frames.py',
    '--input', strip,
    '--slug', 'test_enemy',
    '--out-dir', outDir,
    '--preview', preview
  ], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.deepEqual(
    readdirSync(outDir).sort(),
    [
      'test_enemy_attack_01_v2.webp',
      'test_enemy_attack_02_v2.webp',
      'test_enemy_attack_03_v2.webp',
      'test_enemy_attack_04_v2.webp',
      'test_enemy_attack_05_v2.webp',
      'test_enemy_attack_06_v2.webp'
    ]
  );

  const inspect = spawnSync('python3', ['-c', `
from pathlib import Path
from PIL import Image
out_dir = Path(r'${outDir}')
for path in sorted(out_dir.glob('*.webp')):
    img = Image.open(path).convert('RGBA')
    assert img.size == (675, 900), (path.name, img.size)
    assert img.getchannel('A').getbbox() is not None, path.name
preview = Image.open(r'${preview}').convert('RGBA')
assert preview.width > 675 and preview.height >= 900
`], { encoding: 'utf8' });
  assert.equal(inspect.status, 0, inspect.stderr);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node tests/enemy-attack-frame-tool.test.mjs
```

Expected: FAIL because `tools/build_enemy_attack_frames.py` does not exist.

- [ ] **Step 3: Implement the tool**

Create `tools/build_enemy_attack_frames.py` with these behaviors:

- split a horizontal strip into six equal slots;
- remove a flat chroma-key background, default `#ff00ff`;
- crop each slot to visible content;
- normalize with one shared scale into `675x900`;
- bottom-center align each frame;
- export `*_attack_01_v2.webp` through `*_attack_06_v2.webp`;
- render a checkerboard preview sheet when `--preview` is provided.

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
node tests/enemy-attack-frame-tool.test.mjs
```

Expected: PASS.

### Task 3: Generate Five Six-Frame Strips

**Files:**
- Create: `assets/source/enemies/attack/v2_samples/*_attack_strip_v2_source.png`
- Create: `assets/source/enemies/attack/v2_samples/*_attack_preview_v2.png`
- Create: `assets/enemies/attack/*_attack_01_v2.webp` through `*_attack_06_v2.webp` for five sample enemies

- [ ] **Step 1: Generate strips from seed sprites**

Use the existing battle sprites as visual references:

```text
assets/enemies/battle/sick_slime_battle_v1.webp
assets/enemies/battle/wild_wolf_battle_v1.webp
assets/enemies/battle/greedy_thief_battle_v1.webp
assets/enemies/battle/nether_mage_battle_v1.webp
assets/enemies/battle/undead_bone_dragon_battle_v1.webp
```

For each enemy, prompt for a single horizontal six-frame strip, a flat `#ff00ff` chroma-key background, consistent bottom baseline, no scenery, no text, no UI, and no CSS-style stretching. Each strip should show unique body mechanics for the enemy. Since enemies stand on the right side of the battle screen, all pounces, thrusts, slashes, sprays, breath attacks, and spell releases must aim diagonally left-down toward the player character; rightward attacks are invalid.

- [ ] **Step 2: Normalize each generated strip**

Run one command per enemy:

```bash
python3 tools/build_enemy_attack_frames.py --input assets/source/enemies/attack/v2_samples/<slug>_attack_strip_v2_source.png --slug <slug> --out-dir assets/enemies/attack --preview assets/source/enemies/attack/v2_samples/<slug>_attack_preview_v2.png
```

Expected: six WebP frames in `assets/enemies/attack/` and one preview PNG per enemy.

- [ ] **Step 3: Inspect preview sheets**

Open each `*_attack_preview_v2.png` and check:

- six visible frames;
- character identity is stable;
- action progresses frame-to-frame;
- attack direction reads diagonally left-down toward the player;
- no labels or UI;
- no flat chroma background remains.

### Task 4: Runtime Integration and Fallback

**Files:**
- Modify: `questers_demo_v0.99.html`
- Modify: `src/runtime/visual-rules.js`
- Modify: `src/runtime/README.md`

- [ ] **Step 1: Add configured sample sets**

Update the HTML runtime so the five sample slugs use `ENEMY_ATTACK_FRAME_SETS` and six `v2` frames. Keep other enemies unconfigured.

- [ ] **Step 2: Add missing-frame fallback during attack playback**

When `triggerEnemyAttackAnimation()` swaps an attack frame, store `frame.fallbackSrc` on the avatar before assigning `frame.src`. Update the enemy image error handler so attack-frame load errors try that fallback before showing the emoji fallback.

- [ ] **Step 3: Update runtime docs**

Update `src/runtime/README.md` to mention enemy attack-frame set metadata and `v2` sample assets.

### Task 5: Verification, Commit, and Push

**Files:**
- Stage only files changed for this task.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
node tests/enemy-attack-frames.test.mjs
node tests/enemy-attack-frame-tool.test.mjs
```

Expected: both PASS.

- [ ] **Step 2: Run baseline repository verification**

Run:

```bash
node tools/run_release_checks.mjs
```

Expected: PASS. If release checks fail only because documentation/source prompt references are missing while runtime references are valid, inspect the output and do not ignore runtime/config missing references.

- [ ] **Step 3: Run browser visual smoke test**

Serve the repo locally:

```bash
python3 -m http.server 8765
```

Open:

```text
http://127.0.0.1:8765/questers_demo_v0.99.html
```

Confirm the sample enemies can use six-frame attack images in battle and non-sample enemies still resolve `v1` frames.

- [ ] **Step 4: Commit and push**

Stage only the spec, plan, runtime code, tests, tool, generated sample frames, and preview/source assets. Do not stage unrelated existing untracked files:

```bash
git add docs/superpowers/plans/2026-06-26-enemy-attack-frame-regeneration.md \
  src/runtime/visual-rules.js src/runtime/README.md questers_demo_v0.99.html \
  tests/enemy-attack-frames.test.mjs tests/enemy-attack-frame-tool.test.mjs \
  tools/build_enemy_attack_frames.py \
  assets/enemies/attack/*_attack_*_v2.webp \
  assets/source/enemies/attack/v2_samples
git commit -m "Add enemy attack frame samples"
git push
```
