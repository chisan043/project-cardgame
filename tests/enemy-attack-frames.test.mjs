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
    Array.from(frames, frame => frame.src),
    [
      'assets/enemies/attack/sick_slime_attack_01_v2.webp',
      'assets/enemies/attack/sick_slime_attack_02_v2.webp',
      'assets/enemies/attack/sick_slime_attack_03_v2.webp',
      'assets/enemies/attack/sick_slime_attack_04_v2.webp',
      'assets/enemies/attack/sick_slime_attack_05_v2.webp',
      'assets/enemies/attack/sick_slime_attack_06_v2.webp'
    ]
  );
  assert.deepEqual(Array.from(frames, frame => frame.duration), [70, 80, 95, 125, 90, 80]);
  assert.equal(frames[0].fallbackSrc, 'assets/enemies/attack/sick_slime_attack_01_v1.webp');
  assert.equal(frames[5].fallbackSrc, 'assets/enemies/attack/sick_slime_attack_04_v1.webp');
});

test('unconfigured enemies keep the existing v1 four-frame convention', () => {
  const frames = visualRules.getEnemyAttackFrames(
    { name: '荒野煞狼' },
    { enemyAssetSlugs }
  );

  assert.deepEqual(
    Array.from(frames, frame => frame.src),
    [
      'assets/enemies/attack/wild_wolf_attack_01_v1.webp',
      'assets/enemies/attack/wild_wolf_attack_02_v1.webp',
      'assets/enemies/attack/wild_wolf_attack_03_v1.webp',
      'assets/enemies/attack/wild_wolf_attack_04_v1.webp'
    ]
  );
  assert.deepEqual(Array.from(frames, frame => frame.duration), [110, 120, 170, 120]);
  assert.equal(Array.from(frames, frame => frame.fallbackSrc === null).every(Boolean), true);
});
