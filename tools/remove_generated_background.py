#!/usr/bin/env python3
from collections import Counter, deque
from pathlib import Path
import sys

from PIL import Image


def dist(a, b):
    return sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: remove_generated_background.py <input> <output>")

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    pix = im.load()

    samples = []
    step = max(1, min(w, h) // 192)
    for x in range(0, w, step):
        samples.append(pix[x, 0][:3])
        samples.append(pix[x, h - 1][:3])
    for y in range(0, h, step):
        samples.append(pix[0, y][:3])
        samples.append(pix[w - 1, y][:3])

    keys = [color for color, _ in Counter(samples).most_common(8)]
    threshold = 34

    def bgish(rgb):
        return any(dist(rgb, key) < threshold for key in keys)

    mask = bytearray(w * h)
    q = deque()

    def push(x, y):
        i = y * w + x
        if not mask[i] and bgish(pix[x, y][:3]):
            mask[i] = 1
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                push(nx, ny)

    for y in range(h):
        for x in range(w):
            if mask[y * w + x]:
                r, g, b, _ = pix[x, y]
                pix[x, y] = (r, g, b, 0)

    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst)
    print(f"wrote {dst} with alpha; removed {sum(mask)}/{w*h} background pixels")


if __name__ == "__main__":
    main()
