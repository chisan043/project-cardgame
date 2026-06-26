import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('v2 enemy attack ready frames preserve battle-stand visual scale', () => {
  const result = spawnSync('python3', ['-c', `
from pathlib import Path
from PIL import Image

slugs = ['sick_slime', 'wild_wolf', 'greedy_thief', 'nether_mage', 'undead_bone_dragon']
minimum_ratio = 0.92
failures = []

def content_height(path):
    img = Image.open(path).convert('RGBA')
    bbox = img.getchannel('A').getbbox()
    if bbox is None:
        return 0, img.height
    return bbox[3] - bbox[1], img.height

for slug in slugs:
    battle_h, battle_canvas_h = content_height(f'assets/enemies/battle/{slug}_battle_v1.webp')
    battle_visible_ratio = battle_h / battle_canvas_h
    for frame_index in (1, 6):
        frame_h, frame_canvas_h = content_height(f'assets/enemies/attack/{slug}_attack_{frame_index:02d}_v2.webp')
        frame_visible_ratio = frame_h / frame_canvas_h
        ratio = frame_visible_ratio / battle_visible_ratio
        if ratio < minimum_ratio:
            failures.append(f'{slug} frame {frame_index}: {ratio:.3f}')

assert not failures, failures
`], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
});
