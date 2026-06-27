import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

function loadVisualRules() {
  const source = readFileSync(new URL('../src/runtime/visual-rules.js', import.meta.url), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.QuestersVisualRules;
}

const visualRules = loadVisualRules();
const vfxTypes = [
  'acid-spit',
  'blood-siphon',
  'bone-slash',
  'charge-dust',
  'claw-bite',
  'dagger-flurry',
  'dark-iaijutsu',
  'dragon-breath',
  'foxfire',
  'ghostfire',
  'meat-slam',
  'pincer-snap',
  'poison-spit',
  'rock-shock',
  'shadow-darts',
  'shura-cleave',
  'sonic-wave',
  'venom-web',
  'void-beam',
  'war-axe'
];

test('enemy attack VFX resolves six v2 frames with v1 fallback', () => {
  const attackFrames = [
    { duration: 70 },
    { duration: 80 },
    { duration: 95 },
    { duration: 125 },
    { duration: 90 },
    { duration: 80 }
  ];
  const frames = visualRules.getEnemyAttackVfxFrames('acid-spit', { attackFrames });

  assert.deepEqual(
    Array.from(frames, frame => frame.src),
    [
      'assets/vfx/enemy_attack/acid_spit_vfx_01_v2.webp',
      'assets/vfx/enemy_attack/acid_spit_vfx_02_v2.webp',
      'assets/vfx/enemy_attack/acid_spit_vfx_03_v2.webp',
      'assets/vfx/enemy_attack/acid_spit_vfx_04_v2.webp',
      'assets/vfx/enemy_attack/acid_spit_vfx_05_v2.webp',
      'assets/vfx/enemy_attack/acid_spit_vfx_06_v2.webp'
    ]
  );
  assert.deepEqual(Array.from(frames, frame => frame.duration), [70, 80, 95, 125, 90, 80]);
  assert.equal(frames[0].fallbackSrc, 'assets/vfx/enemy_attack/acid_spit_vfx_v1.webp');
});

test('generated enemy attack VFX frames are transparent six-frame left-down sequences', () => {
  const result = spawnSync('python3', ['-c', `
from pathlib import Path
from PIL import Image

types = ${JSON.stringify(vfxTypes)}
failures = []

def alpha_centroid(img):
    alpha = img.getchannel('A')
    pixels = alpha.load()
    total = 0
    sx = 0
    sy = 0
    bbox = alpha.getbbox()
    if bbox is None:
        return None, None
    for y in range(img.height):
        for x in range(img.width):
            value = pixels[x, y]
            if value <= 12:
                continue
            total += value
            sx += x * value
            sy += y * value
    if total <= 0:
        return None, bbox
    return (sx / total, sy / total), bbox

for effect_type in types:
    file_type = effect_type.replace('-', '_')
    centers = {}
    bboxes = {}
    for frame_index in range(1, 7):
        path = Path(f'assets/vfx/enemy_attack/{file_type}_vfx_{frame_index:02d}_v2.webp')
        if not path.exists():
            failures.append(f'{path}: missing')
            continue
        img = Image.open(path).convert('RGBA')
        if img.size != (384, 384):
            failures.append(f'{path.name}: size {img.size}')
        center, bbox = alpha_centroid(img)
        if center is None:
            failures.append(f'{path.name}: empty alpha')
            continue
        if img.getpixel((0, 0))[3] != 0:
            failures.append(f'{path.name}: corner not transparent')
        centers[frame_index] = center
        bboxes[frame_index] = bbox
    if 2 in centers and 4 in centers:
        leftward_center = centers[4][0] < centers[2][0] - 18
        downward_center = centers[4][1] > centers[2][1] + 10
        leftward_impact = bboxes[4][0] < bboxes[2][0] - 8
        downward_impact = bboxes[4][3] > bboxes[2][3] + 10
        if not (leftward_center or leftward_impact):
            failures.append(f'{effect_type}: frame 4 is not left of frame 2 ({centers[2][0]:.1f}->{centers[4][0]:.1f}, bbox {bboxes[2]}->{bboxes[4]})')
        if not (downward_center or downward_impact):
            failures.append(f'{effect_type}: frame 4 is not below frame 2 ({centers[2][1]:.1f}->{centers[4][1]:.1f}, bbox {bboxes[2]}->{bboxes[4]})')

assert not failures, failures
`], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
});

test('enemy attack VFX frames are sliced from retained image-generated source sheets', () => {
  const result = spawnSync('python3', ['-c', `
from pathlib import Path

types = ${JSON.stringify(vfxTypes)}
failures = []
for effect_type in types:
    file_type = effect_type.replace('-', '_')
    path = Path(f'assets/source/vfx/enemy_attack/sheets/{file_type}_vfx_sheet_v2.png')
    if not path.exists():
        failures.append(f'{path}: missing image-generated source sheet')

assert not failures, failures
`], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
});

test('enemy attack VFX layout anchors the generated impact frame on the player body', () => {
  const layout = visualRules.getEnemyAttackVfxLayout({
    enemyRect: { left: 780, top: 180, width: 300, height: 360 },
    playerRect: { left: 90, top: 260, width: 220, height: 390 },
    layout: {
      width: 260,
      height: 260,
      startX: 0.34,
      startY: 0.44,
      targetX: 0.52,
      targetY: 0.47
    }
  });

  const left = Number.parseFloat(layout.left);
  const top = Number.parseFloat(layout.top);
  const impactX = left + layout.width * (146 / 384);
  const impactY = top + layout.height * (248 / 384);
  const playerImpactX = 90 + 220 * 0.52;
  const playerImpactY = 260 + 390 * 0.47;

  assert.ok(Math.abs(impactX - playerImpactX) <= 1, `impact x ${impactX} should match player ${playerImpactX}`);
  assert.ok(Math.abs(impactY - playerImpactY) <= 1, `impact y ${impactY} should match player ${playerImpactY}`);
  assert.ok(left < playerImpactX && top < playerImpactY, 'VFX should cover the player impact point instead of staying at enemy start');
});

test('enemy attack VFX starts with the body attack instead of after impact wait', () => {
  const source = readFileSync(new URL('../questers_demo_v0.99.html', import.meta.url), 'utf8');
  const attackLoop = source.match(/const enemyAttackTiming = triggerEnemyAttackAnimation\('enemy'\);[\s\S]*?let dmg = baseDmg;/);

  assert.ok(attackLoop, 'enemy attack loop source not found');
  const triggerIndex = attackLoop[0].indexOf("triggerVFX('e-atk'");
  const impactWaitIndex = attackLoop[0].indexOf('enemyAttackTiming.impactDelay');

  assert.ok(triggerIndex > -1, 'enemy attack loop should trigger VFX');
  assert.ok(impactWaitIndex > -1, 'enemy attack loop should still wait for impact damage timing');
  assert.ok(triggerIndex < impactWaitIndex, 'enemy VFX should begin before the impact wait');
});

test('enemy attack VFX is driven by generated image frames rather than CSS motion', () => {
  const source = readFileSync(new URL('../questers_demo_v0.99.html', import.meta.url), 'utf8');
  const vfxFunction = source.match(/function triggerEnemyAttackVfx\([\s\S]*?\n    const BATTLE_BACKGROUND_BY_ENEMY = \{/);

  assert.ok(vfxFunction, 'enemy attack VFX function not found');
  assert.equal(source.includes('enemyImageSequenceVfx'), false, 'enemy VFX should not use CSS sequence keyframes');
  assert.equal(source.includes('enemyProjectileVfx'), false, 'enemy VFX should not use legacy CSS projectile keyframes');
  assert.equal(source.includes('enemyImageProjectileVfx'), false, 'enemy VFX should not use legacy CSS image-motion keyframes');
  assert.equal(vfxFunction[0].includes('enemy-asset-sequence'), false, 'enemy VFX should not opt into CSS sequence animation');
  assert.equal(vfxFunction[0].includes('style.animation'), false, 'enemy VFX should not animate generated frames with CSS');
  assert.equal(vfxFunction[0].includes('--enemy-vfx-dx'), false, 'enemy VFX should not expose CSS motion deltas');
  assert.ok(vfxFunction[0].includes('frames.slice(1).forEach'), 'enemy VFX should advance through generated frame images');
});
