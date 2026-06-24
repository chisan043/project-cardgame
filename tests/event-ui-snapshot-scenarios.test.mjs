import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONCEPT_CROP_X,
  EVENT_UI_SCENARIOS,
  EVENT_UI_VIEWPORTS,
  getEventUiSnapshotPath
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
      'encounter-pack-reward',
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

test('snapshot paths are stable and grouped by viewport', () => {
  const tmpOut = ['', 'tmp', 'out'].join('/');
  const shopBuyPng = ['shop-buy', 'png'].join('.');
  const campfireDeletePng = ['campfire-delete', 'png'].join('.');

  assert.equal(
    getEventUiSnapshotPath(tmpOut, 'concept', 'shop-buy'),
    [tmpOut, 'concept', shopBuyPng].join('/')
  );
  assert.equal(
    getEventUiSnapshotPath(`${tmpOut}/`, 'game', 'campfire-delete'),
    [tmpOut, 'game', campfireDeletePng].join('/')
  );
});
