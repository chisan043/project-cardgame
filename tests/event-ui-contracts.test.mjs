import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../questers_demo_v0.99.html', import.meta.url), 'utf8');

test('shop layout editor is not visible in normal gameplay markup', () => {
  assert.match(html, /id="shop-layout-editor-toggle"[^>]*hidden/);
});

const SHOP_CONCEPT_LAYOUT_VARS = new Map([
  ['--shop-shell-width', '1100px'],
  ['--shop-shell-height', '746px'],
  ['--shop-rail-width', '275px'],
  ['--shop-board-width', '810px'],
  ['--shop-board-height', '560px'],
  ['--shop-detail-width', '245px'],
  ['--shop-card-scale', '0.76'],
  ['--shop-refresh-width', '530px'],
  ['--shop-portrait-frame-width', '255px'],
  ['--shop-portrait-image-height', '580px']
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRootCssVar(name) {
  const match = html.match(new RegExp(`${escapeRegExp(name)}:\\s*([^;]+);`));
  return match?.[1]?.trim();
}

function getShopLayoutControlValue(name) {
  const pattern = new RegExp(`css:\\s*'${escapeRegExp(name)}'[\\s\\S]*?value:\\s*([\\d.-]+)`);
  const match = html.match(pattern);
  return match?.[1];
}

test('shop defaults use the approved concept layout proportions', () => {
  for (const [cssVar, expected] of SHOP_CONCEPT_LAYOUT_VARS) {
    assert.equal(getRootCssVar(cssVar), expected, `${cssVar} should be the concept layout default`);
    assert.equal(
      `${getShopLayoutControlValue(cssVar)}${expected.endsWith('px') ? 'px' : ''}`,
      expected,
      `${cssVar} editor control should match the concept layout default`
    );
  }
});

test('encounter reward states use concept-specific compositions', () => {
  assert.match(html, /class="event-relic-result-view"/);
  assert.match(html, /class="event-relic-medallion"/);
  assert.match(html, /class="event-relic-parchment"/);
  assert.match(html, /class="btn-gorgeous btn-confirm event-relic-claim"/);
  assert.match(html, /deck-browser-preview-card compare event-upgrade-compare/);
});

test('encounter pack reward uses the two-step concept panel', () => {
  assert.match(html, /class="event-pack-reward-view"/);
  assert.match(html, /class="event-pack-forgotten-slot"/);
  assert.match(html, /class="event-pack-reward-options"/);
  assert.match(html, /event-pack-skip/);
});

test('campfire follow-up states use concept-specific compositions', () => {
  assert.match(html, /class="rest-result-view rest-result-campfire-view"/);
  assert.match(html, /class="rest-result-firebowl"/);
  assert.match(html, /deck-browser-preview-card compare rest-upgrade-compare/);
  assert.match(html, /class="rest-delete-preview"/);
});

test('campfire deck browser states keep a unified four-column card rhythm', () => {
  assert.match(
    html,
    /#overlay-rest \.rest-mode-upgrade \.deck-browser-grid\s*\{[\s\S]*?grid-template-columns:repeat\(4, minmax\(0, 1fr\)\);/
  );
});
