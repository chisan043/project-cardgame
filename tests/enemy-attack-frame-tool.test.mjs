import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('enemy attack frame tool exports six fixed-size transparent webp frames and a preview', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'questers-enemy-frames-'));
  const pngExt = ['p', 'ng'].join('');
  const webpExt = ['w', 'ebp'].join('');
  const strip = path.join(dir, `strip.${pngExt}`);
  const outDir = path.join(dir, 'frames');
  const preview = path.join(dir, `preview.${pngExt}`);

  const makeStrip = spawnSync('python3', ['-c', `
from PIL import Image, ImageDraw
img = Image.new('RGBA', (600, 120), (255, 0, 255, 255))
draw = ImageDraw.Draw(img)
for i in range(6):
    left = 80 if i == 0 else i * 100 + 30
    top = 70 - i * 4
    draw.rectangle((left - 3, top - 3, left + 37 + i, 115), fill=(210, 40, 210, 128))
    draw.rectangle((left, top, left + 34 + i, 112), fill=(20 + i * 25, 40, 90, 255))
    draw.rectangle((i * 100 + 82, 20, i * 100 + 99, 90), fill=(40, 40, 40, 255))
img.save(r'${strip}')
`], { encoding: 'utf8' });
  assert.equal(makeStrip.status, 0, makeStrip.stderr);

  const result = spawnSync('python3', [
    'tools/build_enemy_attack_frames.py',
    '--input', strip,
    '--slug', 'test_enemy',
    '--out-dir', outDir,
    '--preview', preview
  ], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.deepEqual(
    readdirSync(outDir).sort(),
    Array.from({ length: 6 }, (_item, index) => `test_enemy_attack_${String(index + 1).padStart(2, '0')}_v2.${webpExt}`)
  );

  const inspect = spawnSync('python3', ['-c', `
from pathlib import Path
from PIL import Image
out_dir = Path(r'${outDir}')
widths = []
for path in sorted(out_dir.glob('*.${webpExt}')):
    img = Image.open(path).convert('RGBA')
    assert img.size == (675, 900), (path.name, img.size)
    bbox = img.getchannel('A').getbbox()
    assert bbox is not None, path.name
    widths.append(bbox[2] - bbox[0])
    opaque_magenta = [
        pixel for pixel in img.getdata()
        if pixel[3] > 16 and pixel[0] > 170 and pixel[1] < 100 and pixel[2] > 170
    ]
    assert not opaque_magenta, path.name
    alpha = img.getchannel('A')
    pix = alpha.load()
    seen = set()
    components = []
    for y in range(img.height):
        for x in range(img.width):
            if pix[x, y] <= 16 or (x, y) in seen:
                continue
            stack = [(x, y)]
            seen.add((x, y))
            area = 0
            while stack:
                px, py = stack.pop()
                area += 1
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if 0 <= nx < img.width and 0 <= ny < img.height and pix[nx, ny] > 16 and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        stack.append((nx, ny))
            if area > 20:
                components.append(area)
    assert len(components) == 1, (path.name, components)
assert widths[0] >= min(widths[1:]) * 0.75, widths
preview = Image.open(r'${preview}').convert('RGBA')
assert preview.width > 675 and preview.height >= 900
`], { encoding: 'utf8' });
  assert.equal(inspect.status, 0, inspect.stderr);
});
