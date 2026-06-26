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
  '【深渊主宰】': 'abyss_overlord',
  '【精英】不死骨龙': 'undead_bone_dragon',
  '【精英】狂暴牛头人': 'elite_minotaur',
  '【精英】猩红血巫': 'crimson_blood_witch',
  '【首领】鬼面修罗': 'boss_oni_shura',
  '千载魔蛛': 'ancient_spider',
  '嗜血蝙蝠': 'blood_bat',
  '堕落剑客': 'fallen_swordsman',
  '巨力石魔': 'stone_golem',
  '幽冥法师': 'nether_mage',
  '暴躁野猪': 'angry_boar',
  '枯骨煞兵': 'bone_soldier',
  '病弱史莱姆': 'sick_slime',
  '缝合巨怪': 'stitched_brute',
  '荒野煞狼': 'wild_wolf',
  '贪婪盗贼': 'greedy_thief',
  '迷途妖狐': 'lost_fox',
  '铁甲巨蟹': 'iron_crab',
  '魅影刺客': 'shadow_assassin',
  '剧毒蟾蜍': 'venom_toad'
};

const enemyAttackFrameSets = {
  abyss_overlord: { version: 'v2', frameCount: 6, durations: [85, 95, 115, 130, 100, 85] },
  ancient_spider: { version: 'v2', frameCount: 6, durations: [75, 85, 105, 125, 95, 80] },
  angry_boar: { version: 'v2', frameCount: 6, durations: [80, 95, 115, 135, 105, 90] },
  blood_bat: { version: 'v2', frameCount: 6, durations: [60, 70, 85, 100, 80, 70] },
  bone_soldier: { version: 'v2', frameCount: 6, durations: [70, 80, 95, 115, 90, 80] },
  boss_oni_shura: { version: 'v2', frameCount: 6, durations: [70, 80, 95, 115, 90, 80] },
  crimson_blood_witch: { version: 'v2', frameCount: 6, durations: [85, 95, 115, 130, 100, 85] },
  elite_minotaur: { version: 'v2', frameCount: 6, durations: [80, 95, 115, 135, 105, 90] },
  fallen_swordsman: { version: 'v2', frameCount: 6, durations: [70, 80, 95, 115, 90, 80] },
  greedy_thief: { version: 'v2', frameCount: 6, durations: [60, 70, 85, 95, 85, 75] },
  iron_crab: { version: 'v2', frameCount: 6, durations: [80, 95, 115, 135, 105, 90] },
  lost_fox: { version: 'v2', frameCount: 6, durations: [85, 95, 115, 130, 100, 85] },
  nether_mage: { version: 'v2', frameCount: 6, durations: [85, 95, 115, 125, 95, 80] },
  shadow_assassin: { version: 'v2', frameCount: 6, durations: [60, 70, 85, 100, 80, 70] },
  sick_slime: { version: 'v2', frameCount: 6, durations: [70, 80, 95, 125, 90, 80] },
  stitched_brute: { version: 'v2', frameCount: 6, durations: [80, 95, 115, 135, 105, 90] },
  stone_golem: { version: 'v2', frameCount: 6, durations: [80, 95, 115, 135, 105, 90] },
  undead_bone_dragon: { version: 'v2', frameCount: 6, durations: [90, 100, 125, 140, 105, 90] },
  venom_toad: { version: 'v2', frameCount: 6, durations: [75, 85, 105, 125, 95, 80] },
  wild_wolf: { version: 'v2', frameCount: 6, durations: [65, 75, 90, 120, 90, 75] }
};

test('configured roster enemies use v2 six-frame attack sets', () => {
  for (const [enemyName, slug] of Object.entries(enemyAssetSlugs)) {
    const frames = visualRules.getEnemyAttackFrames(
      { name: enemyName },
      {
        enemyAssetSlugs,
        enemyAttackFrameSets
      }
    );

    assert.deepEqual(
      Array.from(frames, frame => frame.src),
      Array.from({ length: 6 }, (_, index) => (
        `assets/enemies/attack/${slug}_attack_${String(index + 1).padStart(2, '0')}_v2.webp`
      )),
      enemyName
    );
    assert.deepEqual(
      Array.from(frames, frame => frame.duration),
      enemyAttackFrameSets[slug].durations,
      enemyName
    );
    assert.equal(frames[0].fallbackSrc, `assets/enemies/attack/${slug}_attack_01_v1.webp`, enemyName);
    assert.equal(frames[5].fallbackSrc, `assets/enemies/attack/${slug}_attack_04_v1.webp`, enemyName);
  }
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
