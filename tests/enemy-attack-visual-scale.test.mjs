import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('v2 enemy attack frames preserve battle-stand display scale', () => {
  const result = spawnSync('python3', ['-c', `
from pathlib import Path
from PIL import Image

slugs = [
    'abyss_overlord',
    'ancient_spider',
    'angry_boar',
    'blood_bat',
    'bone_soldier',
    'boss_oni_shura',
    'crimson_blood_witch',
    'elite_minotaur',
    'fallen_swordsman',
    'greedy_thief',
    'iron_crab',
    'lost_fox',
    'nether_mage',
    'shadow_assassin',
    'sick_slime',
    'stitched_brute',
    'stone_golem',
    'undead_bone_dragon',
    'venom_toad',
    'wild_wolf',
]
enemy_box_w = 760
enemy_box_h = 570
frame_h = 900
ready_min_ratio = 0.97
motion_min_area_ratio = 0.72
motion_min_major_ratio = 0.92
failures = []

def content_size(path):
    img = Image.open(path).convert('RGBA')
    bbox = img.getchannel('A').getbbox()
    if bbox is None:
        return 0, 0, img.size
    return bbox[2] - bbox[0], bbox[3] - bbox[1], img.size

def display_scale(size):
    width, height = size
    return min(enemy_box_w / width, enemy_box_h / height)

for slug in slugs:
    battle_path = f'assets/enemies/battle/{slug}_battle_v1.webp'
    battle_w, battle_h, battle_canvas = content_size(battle_path)
    battle_scale = display_scale(battle_canvas)
    expected_canvas = (round(frame_h * battle_canvas[0] / battle_canvas[1]), frame_h)

    for frame_index in range(1, 7):
        frame_path = f'assets/enemies/attack/{slug}_attack_{frame_index:02d}_v2.webp'
        if not Path(frame_path).exists():
            failures.append(f'{slug} frame {frame_index}: missing')
            continue
        frame_w, frame_h_visible, frame_canvas = content_size(frame_path)
        if frame_canvas != expected_canvas:
            failures.append(f'{slug} frame {frame_index}: canvas {frame_canvas}, expected {expected_canvas}')
            continue

        frame_scale = display_scale(frame_canvas)
        width_ratio = (frame_w * frame_scale) / (battle_w * battle_scale) if battle_w else 0
        height_ratio = (frame_h_visible * frame_scale) / (battle_h * battle_scale) if battle_h else 0
        if frame_index in (1, 6):
            if width_ratio < ready_min_ratio or height_ratio < ready_min_ratio:
                failures.append(f'{slug} frame {frame_index}: ready ratio {width_ratio:.3f}w/{height_ratio:.3f}h')
        else:
            area_ratio = width_ratio * height_ratio
            major_ratio = max(width_ratio, height_ratio)
            if area_ratio < motion_min_area_ratio and major_ratio < motion_min_major_ratio:
                failures.append(f'{slug} frame {frame_index}: motion ratio {width_ratio:.3f}w/{height_ratio:.3f}h area {area_ratio:.3f}')

assert not failures, failures
`], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
});
