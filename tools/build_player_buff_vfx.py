#!/usr/bin/env python3
"""Build normalized player buff VFX frames from a chroma-keyed strip."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--runtime-dir", required=True, type=Path)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--version", default="v2")
    parser.add_argument("--frames", type=int, default=6)
    parser.add_argument("--width", type=int, default=384)
    parser.add_argument("--height", type=int, default=512)
    parser.add_argument("--crop-bottom", type=int, default=120)
    parser.add_argument("--slot-trim-x", type=int, default=3)
    parser.add_argument("--key", default="00ff00")
    parser.add_argument("--transparent-threshold", type=float, default=54)
    parser.add_argument("--opaque-threshold", type=float, default=132)
    return parser.parse_args()


def parse_hex_color(value: str) -> tuple[int, int, int]:
    value = value.strip().removeprefix("#")
    if len(value) != 6:
        raise SystemExit("--key must be a 6-digit hex color")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def color_distance(pixel: tuple[int, int, int], key: tuple[int, int, int]) -> float:
    return sum((pixel[index] - key[index]) ** 2 for index in range(3)) ** 0.5


def chroma_key(image: Image.Image, key: tuple[int, int, int], transparent: float, opaque: float) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            distance = color_distance((r, g, b), key)
            if distance <= transparent:
                pixels[x, y] = (r, g, b, 0)
            elif distance < opaque:
                alpha = int(a * (distance - transparent) / (opaque - transparent))
                r = min(255, int(r + max(0, g - max(r, b)) * 0.22))
                b = min(255, int(b + max(0, g - max(r, b)) * 0.16))
                pixels[x, y] = (r, min(g, max(r, b, 70)), b, alpha)
    return image


def fit_frame(frame: Image.Image, size: tuple[int, int]) -> Image.Image:
    alpha = frame.getchannel("A").filter(ImageFilter.MaxFilter(3))
    bbox = alpha.getbbox()
    if bbox:
        frame = frame.crop(bbox)
    frame.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    offset = ((size[0] - frame.width) // 2, (size[1] - frame.height) // 2)
    canvas.alpha_composite(frame, offset)
    return canvas


def build_preview(frames: list[Image.Image], output: Path) -> None:
    cell_width, cell_height = frames[0].size
    preview = Image.new("RGBA", (cell_width * len(frames), cell_height), (18, 16, 24, 255))
    draw = ImageDraw.Draw(preview)
    for index, frame in enumerate(frames):
        x = index * cell_width
        preview.alpha_composite(frame, (x, 0))
        draw.text((x + 10, 8), str(index + 1), fill=(243, 232, 200, 230))
    preview.save(output)


def main() -> None:
    args = parse_args()
    key = parse_hex_color(args.key)
    strip = Image.open(args.input).convert("RGBA")
    if args.crop_bottom > 0:
        strip = strip.crop((0, 0, strip.width, max(1, strip.height - args.crop_bottom)))

    keyed = chroma_key(strip, key, args.transparent_threshold, args.opaque_threshold)

    args.source_dir.mkdir(parents=True, exist_ok=True)
    args.runtime_dir.mkdir(parents=True, exist_ok=True)
    strip.save(args.source_dir / f"strip_chromakey_{args.version}.png")
    keyed.save(args.source_dir / f"strip_alpha_{args.version}.png")

    frames: list[Image.Image] = []
    for index in range(args.frames):
        left = round(strip.width * index / args.frames)
        right = round(strip.width * (index + 1) / args.frames)
        frame = keyed.crop((
            min(right, left + args.slot_trim_x),
            0,
            max(left, right - args.slot_trim_x),
            keyed.height,
        ))
        frame = fit_frame(frame, (args.width, args.height))
        frames.append(frame)
        frame.save(args.source_dir / f"frame_{index + 1:02d}_{args.version}.png")
        frame.save(
            args.runtime_dir / f"{args.prefix}_{index + 1:02d}_{args.version}.webp",
            "WEBP",
            lossless=True,
            method=6,
        )

    build_preview(frames, args.source_dir / f"preview_{args.version}.png")
    print(f"Built {len(frames)} frames for {args.prefix} from {args.input}")


if __name__ == "__main__":
    main()
