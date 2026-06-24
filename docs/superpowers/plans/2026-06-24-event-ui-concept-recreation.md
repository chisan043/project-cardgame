# Event UI Concept Recreation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the approved shop, encounter, and campfire concept UI in the live Questers HTML client while excluding the concept-board-only left module strip.

**Architecture:** Keep `questers_demo_v0.99.html` as the live implementation surface and add a deterministic screenshot harness under `tools/` to open every scoped event state. Visual work proceeds state-by-state, with screenshots proving alignment and small contract tests protecting the state matrix and development-only UI rules.

**Tech Stack:** Static HTML/CSS/JS, existing Questers runtime globals, Node.js ESM tools, Node built-in test runner, Playwright via bundled/runtime Node modules or existing local Playwright cache.

---

### Task 1: Event UI Snapshot Scenario Registry

**Files:**
- Create: `tools/event-ui-snapshot-scenarios.mjs`
- Create: `tests/event-ui-snapshot-scenarios.test.mjs`

- [x] **Step 1: Write the failing scenario registry test**

Create `tests/event-ui-snapshot-scenarios.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONCEPT_CROP_X,
  EVENT_UI_SCENARIOS,
  EVENT_UI_VIEWPORTS
} from '../tools/event-ui-snapshot-scenarios.mjs';

test('defines every concept state that must be visually verified', () => {
  assert.deepEqual(
    EVENT_UI_SCENARIOS.map(scenario => scenario.id),
    [
      'shop-buy',
      'shop-copy',
      'shop-delete',
      'encounter-home',
      'encounter-treasure',
      'encounter-trial',
      'encounter-pack',
      'campfire-home',
      'campfire-rest',
      'campfire-upgrade',
      'campfire-delete'
    ]
  );
});

test('each scenario declares its event family and opening expression', () => {
  for (const scenario of EVENT_UI_SCENARIOS) {
    assert.match(scenario.id, /^(shop|encounter|campfire)-/);
    assert.ok(['shop', 'encounter', 'campfire'].includes(scenario.family));
    assert.equal(typeof scenario.openExpression, 'string');
    assert.ok(scenario.openExpression.length > 0);
  }
});

test('concept comparison excludes the left module-introduction strip', () => {
  assert.equal(CONCEPT_CROP_X, 218);
});

test('desktop verification viewports include concept and game baselines', () => {
  assert.deepEqual(EVENT_UI_VIEWPORTS, [
    { name: 'concept', width: 1672, height: 941 },
    { name: 'game', width: 1280, height: 720 }
  ]);
});
```

- [x] **Step 2: Run the failing test**

Run:

```bash
/Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/event-ui-snapshot-scenarios.test.mjs
```

Expected: fail because `tools/event-ui-snapshot-scenarios.mjs` does not exist.

- [x] **Step 3: Implement the scenario registry**

Create `tools/event-ui-snapshot-scenarios.mjs`:

```js
export const CONCEPT_CROP_X = 218;

export const EVENT_UI_VIEWPORTS = [
  { name: 'concept', width: 1672, height: 941 },
  { name: 'game', width: 1280, height: 720 }
];

export const EVENT_UI_SCENARIOS = [
  { id: 'shop-buy', family: 'shop', openExpression: "state.gold = 236; state.currentShop = null; openShop();" },
  { id: 'shop-copy', family: 'shop', openExpression: "state.gold = 236; state.currentShop = null; openShop(); renderShopCopy();" },
  { id: 'shop-delete', family: 'shop', openExpression: "state.gold = 236; state.currentShop = null; openShop(); renderShopDelete();" },
  { id: 'encounter-home', family: 'encounter', openExpression: 'triggerEventNode();' },
  { id: 'encounter-treasure', family: 'encounter', openExpression: 'triggerEventNode(); selectEventRelic();' },
  { id: 'encounter-trial', family: 'encounter', openExpression: 'triggerEventNode(); selectEventUpgrade();' },
  { id: 'encounter-pack', family: 'encounter', openExpression: 'triggerEventNode(); selectEventTuneDeck();' },
  { id: 'campfire-home', family: 'campfire', openExpression: "showRestHome(); showOverlay('overlay-rest');" },
  { id: 'campfire-rest', family: 'campfire', openExpression: "showRestHome(); showOverlay('overlay-rest'); resolveRest();" },
  { id: 'campfire-upgrade', family: 'campfire', openExpression: "showRestHome(); showOverlay('overlay-rest'); renderRestUpgrade();" },
  { id: 'campfire-delete', family: 'campfire', openExpression: "showRestHome(); showOverlay('overlay-rest'); renderRestDelete();" }
];
```

- [x] **Step 4: Run the test again**

Run:

```bash
/Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/event-ui-snapshot-scenarios.test.mjs
```

Expected: pass.

- [x] **Step 5: Commit**

```bash
git add tools/event-ui-snapshot-scenarios.mjs tests/event-ui-snapshot-scenarios.test.mjs
git commit -m "Add event UI snapshot scenarios"
```

### Task 2: Screenshot Capture Harness

**Files:**
- Create: `tools/capture_event_ui_states.mjs`
- Modify: `tools/event-ui-snapshot-scenarios.mjs`
- Test: `tests/event-ui-snapshot-scenarios.test.mjs`

- [x] **Step 1: Add failing tests for screenshot paths**

Extend `tests/event-ui-snapshot-scenarios.test.mjs`:

```js
import { getEventUiSnapshotPath } from '../tools/event-ui-snapshot-scenarios.mjs';

test('snapshot paths are stable and grouped by viewport', () => {
  assert.equal(
    getEventUiSnapshotPath('/tmp/out', 'concept', 'shop-buy'),
    '/tmp/out/concept/shop-buy.png'
  );
  assert.equal(
    getEventUiSnapshotPath('/tmp/out/', 'game', 'campfire-delete'),
    '/tmp/out/game/campfire-delete.png'
  );
});
```

- [x] **Step 2: Run the failing test**

Run:

```bash
/Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/event-ui-snapshot-scenarios.test.mjs
```

Expected: fail because `getEventUiSnapshotPath` is not exported.

- [x] **Step 3: Implement path helper and CLI harness**

Add to `tools/event-ui-snapshot-scenarios.mjs`:

```js
export function getEventUiSnapshotPath(outputDir, viewportName, scenarioId) {
  const normalized = outputDir.replace(/\/+$/, '');
  return `${normalized}/${viewportName}/${scenarioId}.png`;
}
```

Create `tools/capture_event_ui_states.mjs` with a CLI that:
- starts from `questers_demo_v0.99.html` served by an already-running local server,
- opens a deterministic warrior run,
- evaluates each scenario `openExpression`,
- writes screenshots to `test_reports/event-ui-concept/<timestamp>/<viewport>/<scenario>.png`,
- writes `manifest.json` with scenario ids, viewport names, and file paths.

- [x] **Step 4: Run tests and a smoke screenshot pass**

Run:

```bash
/Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/event-ui-snapshot-scenarios.test.mjs
python3 -m http.server 8765
NODE_PATH=/Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules /Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tools/capture_event_ui_states.mjs --base-url http://127.0.0.1:8765/questers_demo_v0.99.html --out test_reports/event-ui-concept/smoke
```

Expected: tests pass and `test_reports/event-ui-concept/smoke/manifest.json` lists all 22 screenshots.

### Task 3: Remove Development-Only Shop Layout Editor From Gameplay

**Files:**
- Modify: `questers_demo_v0.99.html`
- Create or modify: `tests/event-ui-contracts.test.mjs`

- [x] **Step 1: Write failing contract test**

Create `tests/event-ui-contracts.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../questers_demo_v0.99.html', import.meta.url), 'utf8');

test('shop layout editor is not visible in normal gameplay markup', () => {
  assert.match(html, /id="shop-layout-editor-toggle"[^>]*hidden/);
});
```

Expected initial result: fail because the toggle button currently lacks `hidden`.

- [x] **Step 2: Add `hidden` to the layout editor toggle**

Change the button to:

```html
<button id="shop-layout-editor-toggle" class="shop-layout-editor-toggle" type="button" onclick="toggleShopLayoutEditor()" hidden>布局</button>
```

- [x] **Step 3: Run the contract test**

Run:

```bash
/Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/event-ui-contracts.test.mjs
```

Expected: pass.

### Task 4: Shop Layout Tightening

**Files:**
- Modify: `questers_demo_v0.99.html`
- Use: `tools/capture_event_ui_states.mjs`

- [x] Tighten `--shop-shell-width`, `--shop-shell-height`, `--shop-rail-width`, tab placement, gold placement, leave placement, goods board height, detail column width, card scale, relic row placement, and restock placement to better match `compare_shop.png`.
- [x] Capture `shop-buy`, `shop-copy`, and `shop-delete` at both viewports.
- [x] Verify no card, price, button, or tab text overlaps.
- [ ] Commit with `git commit -m "Align shop concept UI"`.

### Task 5: Encounter Follow-Up State Tightening

**Files:**
- Modify: `questers_demo_v0.99.html`
- Use: `tools/capture_event_ui_states.mjs`

- [x] Capture `encounter-home`, `encounter-treasure`, `encounter-trial`, and `encounter-pack`.
- [x] Keep the home state aligned with `event_encounter_actual_ui_concept_v1.png`.
- [ ] Align result/deck/reward states with the concept-board selected option panels.
- [x] Verify leave/confirm/skip actions remain readable and stable.
- [ ] Commit with `git commit -m "Align encounter concept UI"`.

### Task 6: Campfire Follow-Up State Tightening

**Files:**
- Modify: `questers_demo_v0.99.html`
- Use: `tools/capture_event_ui_states.mjs`

- [ ] Capture `campfire-home`, `campfire-rest`, `campfire-upgrade`, and `campfire-delete`.
- [ ] Keep the home state aligned with `rest_campfire_actual_ui_concept_v1.png`.
- [ ] Align rest, upgrade, and forget flows with the concept-board compositions.
- [ ] Verify the continue action and card browser states are stable at both viewports.
- [ ] Commit with `git commit -m "Align campfire concept UI"`.

### Task 7: Final Verification And Push

**Files:**
- Generate: `test_reports/event-ui-concept/<run>/`

- [ ] Run all Node tests:

```bash
/Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

- [ ] Run release checks:

```bash
/Users/chi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tools/run_release_checks.mjs
```

- [ ] Generate final screenshots for all event UI states at both viewports.
- [ ] Review screenshots against cropped concept references.
- [ ] Commit final report artifacts if they are intended for repo inspection.
- [ ] Push the current branch:

```bash
git push
```
