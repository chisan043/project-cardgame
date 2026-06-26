#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from collections import deque

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "vfx" / "enemy_attack"
FRAME_COUNT = 6
FRAME_SIZE = 384
LEFT_DOWN_TARGET_CENTERS = [
    (304, 122),
    (276, 142),
    (220, 188),
    (146, 248),
    (112, 270),
    (96, 286),
]


def parse_hex_color(value: str) -> tuple[int, int, int]:
    color = value.strip().lstrip("#")
    if len(color) != 6:
        raise ValueError(f"Expected #rrggbb color, got {value!r}")
    return (int(color[0:2], 16), int(color[2:4], 16), int(color[4:6], 16))


def key_distance(pixel: tuple[int, int, int], key: tuple[int, int, int]) -> int:
    return max(abs(pixel[index] - key[index]) for index in range(3))


def find_connected_key_background(image: Image.Image, key: tuple[int, int, int], threshold: int) -> set[tuple[int, int]]:
    rgb = image.convert("RGB")
    pixels = rgb.load()
    width, height = rgb.size
    queue: deque[tuple[int, int]] = deque()
    visited: set[tuple[int, int]] = set()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(1, height - 1):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        if key_distance(pixels[x, y], key) > threshold:
            continue
        visited.add((x, y))
        if x > 0:
            queue.append((x - 1, y))
        if x < width - 1:
            queue.append((x + 1, y))
        if y > 0:
            queue.append((x, y - 1))
        if y < height - 1:
            queue.append((x, y + 1))
    return visited


def chroma_to_alpha(image: Image.Image, key: tuple[int, int, int], transparent: int, opaque: int) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    background = find_connected_key_background(rgba, key, opaque)
    edge_candidates = set()

    for x, y in background:
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        for nx in (x - 1, x, x + 1):
            for ny in (y - 1, y, y + 1):
                if 0 <= nx < rgba.width and 0 <= ny < rgba.height and (nx, ny) not in background:
                    edge_candidates.add((nx, ny))

    softness = max(1, opaque - transparent)
    for x, y in edge_candidates:
        r, g, b, a = pixels[x, y]
        distance = key_distance((r, g, b), key)
        if distance <= transparent:
            pixels[x, y] = (r, g, b, min(a, 32))
        elif distance < opaque:
            alpha = round((distance - transparent) / softness * 255)
            pixels[x, y] = (r, g, b, min(a, max(32, alpha)))
    return rgba


def alpha_centroid(image: Image.Image) -> tuple[float, float] | None:
    alpha = image.getchannel("A")
    pixels = alpha.load()
    total = 0
    sx = 0
    sy = 0
    for y in range(image.height):
        for x in range(image.width):
            value = pixels[x, y]
            if value <= 12:
                continue
            total += value
            sx += x * value
            sy += y * value
    if total <= 0:
        return None
    return (sx / total, sy / total)


def align_to_target_center(image: Image.Image, target: tuple[int, int]) -> Image.Image:
    center = alpha_centroid(image)
    if center is None:
        return image
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        return image

    dx = round(target[0] - center[0])
    dy = round(target[1] - center[1])
    min_x, min_y, max_x, max_y = bbox
    margin = 4
    dx = max(margin - min_x, min(dx, FRAME_SIZE - margin - max_x))
    dy = max(margin - min_y, min(dy, FRAME_SIZE - margin - max_y))

    aligned = Image.new("RGBA", image.size, (0, 0, 0, 0))
    aligned.alpha_composite(image, (dx, dy))
    return aligned


def crop_frame(sheet: Image.Image, index: int, inset_ratio: float) -> Image.Image:
    panel_width = sheet.width / FRAME_COUNT
    side = min(panel_width, sheet.height)
    left = round(index * panel_width + (panel_width - side) / 2)
    top = round((sheet.height - side) / 2)
    right = round(left + side)
    bottom = round(top + side)
    inset = round(side * inset_ratio)
    left += inset
    top += inset
    right -= inset
    bottom -= inset
    return sheet.crop((left, top, right, bottom))


def save_frames(
    sheet_path: Path,
    effect_type: str,
    key: tuple[int, int, int],
    transparent: int,
    opaque: int,
    inset_ratio: float,
    align_path: bool,
) -> list[Path]:
    sheet = Image.open(sheet_path).convert("RGB")
    file_type = effect_type.replace("-", "_")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    saved = []
    for index in range(FRAME_COUNT):
        frame = crop_frame(sheet, index, inset_ratio)
        frame = chroma_to_alpha(frame, key, transparent, opaque)
        frame = frame.resize((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS)
        if align_path:
            frame = align_to_target_center(frame, LEFT_DOWN_TARGET_CENTERS[index])
        out_path = OUT_DIR / f"{file_type}_vfx_{index + 1:02d}_v2.webp"
        frame.save(out_path, "WEBP", lossless=True, method=6)
        saved.append(out_path)
    return saved


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Slice an image-generated six-frame enemy attack VFX sheet into transparent runtime frames."
    )
    parser.add_argument("sheet", type=Path, help="Image-generated six-frame sheet.")
    parser.add_argument("--type", required=True, help="Enemy attack VFX type, e.g. acid-spit.")
    parser.add_argument("--key", default="#000000", help="Flat chroma key color used by the image sheet.")
    parser.add_argument("--transparent-threshold", type=int, default=8)
    parser.add_argument("--opaque-threshold", type=int, default=28)
    parser.add_argument("--inset-ratio", type=float, default=0.018, help="Crop inside each panel to remove generated guide lines.")
    parser.add_argument("--no-align-path", action="store_true", help="Skip baked-in upper-right to lower-left frame alignment.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    saved = save_frames(
        args.sheet,
        args.type,
        parse_hex_color(args.key),
        args.transparent_threshold,
        args.opaque_threshold,
        args.inset_ratio,
        not args.no_align_path,
    )
    print(f"Sliced {args.sheet} into {len(saved)} frames for {args.type}")


if __name__ == "__main__":
    main()
