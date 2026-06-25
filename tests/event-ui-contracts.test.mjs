import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

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
  assert.match(html, /renderUpgradeResultPreview\(card, 'event-upgrade-result'\)/);
});

test('encounter relic reward uses authored medallion art and readable parchment ink', () => {
  const frameFile = `${['event', 'relic', 'medallion', 'frame', 'v1'].join('_')}.${['p', 'ng'].join('')}`;
  const frameAssetPath = ['assets', 'ui', 'events', 'encounter', 'frames', frameFile].join('/');
  assert.match(
    html,
    new RegExp(`--asset-event-relic-medallion-frame:\\s*url\\('${escapeRegExp(frameAssetPath)}'\\);`)
  );
  assert.match(
    html,
    /#overlay-event \.event-relic-medallion\s*\{[^}]*background:var\(--asset-event-relic-medallion-frame\) center \/ contain no-repeat;/
  );
  assert.doesNotMatch(
    html,
    /#overlay-event \.event-relic-medallion\s*\{[^}]*radial-gradient/
  );
  assert.match(
    html,
    /#overlay-event \.event-relic-medallion::before\s*\{[^}]*display:none;/
  );
  assert.match(
    html,
    /#overlay-event \.event-relic-parchment p\s*\{[^}]*color:#2f2418;/
  );
  assert.match(
    html,
    /#overlay-event \.event-relic-parchment p span\s*\{[^}]*color:#7b3f00 !important;/
  );
  const framePath = ['..', frameAssetPath].join('/');
  assert.equal(existsSync(new URL(framePath, import.meta.url)), true);
});

test('encounter pack reward uses the two-step concept panel', () => {
  assert.match(html, /class="event-pack-reward-view"/);
  assert.match(html, /class="event-pack-forgotten-slot"/);
  assert.match(html, /class="event-pack-reward-options"/);
  assert.match(html, /event-pack-skip/);
});

test('encounter pack forget preview uses the standard parchment card slot', () => {
  const tuneDeckMatch = html.match(/function selectEventTuneDeck\(\) \{[\s\S]*?setEventActions/);
  assert.ok(tuneDeckMatch, 'selectEventTuneDeck should be present');
  assert.doesNotMatch(tuneDeckMatch[0], /deck-browser-preview-card upgrade-preview/);
  assert.match(tuneDeckMatch[0], /class="event-forget-preview"/);
  assert.match(
    html,
    /#overlay-event \.event-mode-deck \.event-forget-preview\s*\{[\s\S]*?left:var\(--shop-parchment-left\);[\s\S]*?top:calc\(var\(--shop-parchment-top\) \+ 42px\);[\s\S]*?width:var\(--shop-parchment-width\);[\s\S]*?align-items:flex-start;/
  );
  assert.match(
    html,
    /#overlay-event \.event-mode-deck \.event-forget-preview \.static-card\s*\{[\s\S]*?position:relative !important;[\s\S]*?transform:scale\(0\.84\) !important;[\s\S]*?margin:0 0 -62px !important;/
  );
  assert.match(
    html,
    /#overlay-event \.event-mode-deck \.event-forget-preview \+ \.deck-browser-preview-note\s*\{[\s\S]*?display:none;/
  );
});

test('campfire follow-up states use concept-specific compositions', () => {
  assert.match(html, /class="rest-result-view rest-result-campfire-view"/);
  assert.match(html, /class="rest-result-campfire-art"/);
  assert.match(html, /renderUpgradeResultPreview\(card, 'rest-upgrade-result'\)/);
  assert.doesNotMatch(html, /rest-upgrade-compare/);
  assert.match(html, /class="rest-delete-preview"/);
});

test('campfire rest result uses prose and authored scene art instead of button-like generated elements', () => {
  const iconFile = `${['rest', 'campfire', 'brazier', 'icon', 'v1'].join('_')}.${['p', 'ng'].join('')}`;
  const iconAssetPath = ['assets', 'ui', 'events', 'rest', 'icons', iconFile].join('/');
  assert.match(html, /<p class="rest-result-strip">在温暖的火光中恢复体力。<\/p>/);
  assert.doesNotMatch(
    html,
    /#overlay-rest \.rest-result-strip\s*\{[^}]*background:var\(--asset-event-choice-button\)/
  );
  assert.match(
    html,
    new RegExp(`--asset-rest-campfire-icon:\\s*url\\('${escapeRegExp(iconAssetPath)}'\\);`)
  );
  assert.match(
    html,
    /#overlay-rest \.rest-result-campfire-art\s*\{[^}]*background:var\(--asset-rest-campfire-icon\) center \/ contain no-repeat;/
  );
  assert.doesNotMatch(html, /#overlay-rest \.rest-result-campfire-art\s*\{[^}]*var\(--event-scene-bg\)/);
  assert.doesNotMatch(html, /rest-result-firebowl/);
  const iconPath = ['..', iconAssetPath].join('/');
  assert.equal(
    existsSync(new URL(iconPath, import.meta.url)),
    true
  );
});

test('campfire deck browser states keep a unified four-column card rhythm', () => {
  assert.match(
    html,
    /#overlay-event \.event-mode-deck \.deck-browser-grid,\s*#overlay-rest \.rest-scene\.rest-mode-upgrade \.deck-browser-grid\s*\{[\s\S]*?grid-template-columns:repeat\(4, minmax\(0, 1fr\)\);/
  );
});

test('upgrade result cards use the campfire panel and fit inside the parchment', () => {
  assert.doesNotMatch(html, /event-upgrade-compare/);
  assert.doesNotMatch(html, /event-upgrade-card-before/);
  assert.doesNotMatch(html, /event-upgrade-card-after/);
  assert.doesNotMatch(html, /event-upgrade-arrow/);
  assert.doesNotMatch(html, /title: '选择试炼中要淬炼的卡牌'/);
  assert.doesNotMatch(html, /getActionLabel: \(\) => '接受试炼'/);
  assert.match(html, /title: '选择要淬炼的卡牌'/);
  assert.match(html, /getActionLabel: \(\) => '确认淬炼'/);
  assert.match(
    html,
    /#overlay-event \.quest-event-shell\.event-scene\.event-mode-deck \.deck-browser-preview-card\.upgrade-preview\.event-upgrade-result,\s*#overlay-rest \.quest-event-shell\.rest-scene\.rest-mode-upgrade \.deck-browser-preview-card\.upgrade-preview\.rest-upgrade-result\s*\{[\s\S]*?top:var\(--shop-parchment-top\);[\s\S]*?height:var\(--shop-parchment-height\);[\s\S]*?align-items:center;/
  );
  assert.match(
    html,
    /#overlay-event \.event-mode-deck \.deck-browser-shell,\s*#overlay-rest \.rest-scene\.rest-mode-upgrade \.deck-browser-shell\s*\{[\s\S]*?--shop-board-height: 466px;[\s\S]*?--shop-detail-width: 224px;[\s\S]*?--shop-detail-height: 454px;[\s\S]*?--shop-parchment-left: 22px;[\s\S]*?--shop-parchment-top: 40px;[\s\S]*?--shop-parchment-width: 180px;[\s\S]*?--shop-parchment-height: 300px;[\s\S]*?--shop-action-left: 20px;[\s\S]*?--shop-action-bottom: 24px;[\s\S]*?--shop-action-width: 184px;/
  );
  assert.match(
    html,
    /#overlay-event \.quest-event-shell\.event-scene\.event-mode-deck \.deck-browser-preview-card\.upgrade-preview\.event-upgrade-result \.static-card,\s*#overlay-rest \.quest-event-shell\.rest-scene\.rest-mode-upgrade \.deck-browser-preview-card\.upgrade-preview\.rest-upgrade-result \.static-card\s*\{[\s\S]*?transform:scale\(0\.94\) !important;[\s\S]*?transform-origin:center center !important;[\s\S]*?margin:0 !important;/
  );
});
