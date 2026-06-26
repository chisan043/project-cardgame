# Enemy Attack VFX Frame Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace single-image enemy attack VFX motion with six-frame `v2` VFX sequences synced to enemy attack frames.

**Architecture:** Add a runtime helper that resolves VFX frame sequences and durations, retain image-generated black-background source sheets for each current enemy VFX type, slice those sheets into transparent WebP frames, and update `questers_demo_v0.99.html` so enemy VFX plays frame-by-frame from attack start. Existing `v1` VFX assets remain as fallbacks.

**Tech Stack:** Browser HTML/CSS/JS runtime, `src/runtime/visual-rules.js`, Node `node:test`, built-in image generation for source sheets, and Python 3 with Pillow only for slicing, black-background removal, and baked frame alignment.

---

### Task 1: Tests First

**Files:**
- Create: `tests/enemy-attack-vfx-frames.test.mjs`

- [ ] Write tests for `getEnemyAttackVfxFrames()`.
- [ ] Write an asset inspection test for all 20 VFX types and 120 `v2` frames.
- [ ] Write a source-order test proving `triggerVFX('e-atk')` starts before waiting for `enemyAttackTiming.impactDelay`.
- [ ] Run the test and confirm it fails because the helper and assets do not exist.

### Task 2: Runtime Frame Playback

**Files:**
- Modify: `src/runtime/visual-rules.js`
- Modify: `questers_demo_v0.99.html`

- [ ] Add `getEnemyAttackVfxFrames()` to visual rules.
- [ ] Remove legacy CSS motion from enemy attack VFX.
- [ ] Update `triggerEnemyAttackVfx()` to play the six frame sources with fallback.
- [ ] Trigger enemy VFX at attack start, not after the impact delay.

### Task 3: Image-Generated VFX Source Sheets And Slicing

**Files:**
- Create: `tools/slice_enemy_attack_vfx_sheet.py`
- Create/modify: `assets/source/vfx/enemy_attack/sheets/*_vfx_sheet_v2.png`
- Create/modify: `assets/vfx/enemy_attack/*_vfx_??_v2.webp`

- [ ] Generate a black-background six-frame image sheet for each VFX type with image generation.
- [ ] Match each sheet to the corresponding monster attack-frame motion and attack identity.
- [ ] Slice each sheet into six transparent `384x384` frames.
- [ ] Bake frames 2-4 onto the enemy-right to player-left-down attack path without CSS motion.
- [ ] Render a contact sheet for review.

### Task 4: Verification And Commit

**Files:**
- Update generated VFX registry if release checks require it.

- [ ] Run `node tests/enemy-attack-vfx-frames.test.mjs`.
- [ ] Run `node tools/run_release_checks.mjs`.
- [ ] Run `node --test tests/*.test.mjs`.
- [ ] Stage only this task's files, commit, and push.
