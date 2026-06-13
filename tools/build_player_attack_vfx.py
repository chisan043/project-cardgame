#!/usr/bin/env python3
"""Split a chroma-keyed VFX strip into normalized transparent game frames."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--runtime-dir", required=True, type=Path)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--frames", type=int, default=6)
    parser.add_argument("--width", type=int, required=True)
    parser.add_argument("--height", type=int, required=True)
    parser.add_argument("--vertical-padding", type=int, default=24)
    return parser.parse_args()


def fit_frame(frame: Image.Image, size: tuple[int, int]) -> Image.Image:
    frame = frame.copy()
    frame.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    offset = ((size[0] - frame.width) // 2, (size[1] - frame.height) // 2)
    canvas.alpha_composite(frame, offset)
    return canvas


def build_preview(frames: list[Image.Image], output: Path) -> None:
    cell_width, cell_height = frames[0].size
    preview = Image.new("RGBA", (cell_width * len(frames), cell_height), "#15111d")
    draw = ImageDraw.Draw(preview)
    for index, frame in enumerate(frames):
        x = index * cell_width
        preview.alpha_composite(frame, (x, 0))
        draw.text((x + 10, 8), str(index + 1), fill="#f3e8c8")
    preview.save(output)


def main() -> None:
    args = parse_args()
    strip = Image.open(args.input).convert("RGBA")
    if strip.width % args.frames:
        raise ValueError(f"strip width {strip.width} is not divisible by {args.frames}")

    slot_width = strip.width // args.frames
    alpha_box = strip.getchannel("A").getbbox()
    if not alpha_box:
        raise ValueError("input strip has no visible pixels")
    top = max(0, alpha_box[1] - args.vertical_padding)
    bottom = min(strip.height, alpha_box[3] + args.vertical_padding)

    args.source_dir.mkdir(parents=True, exist_ok=True)
    args.runtime_dir.mkdir(parents=True, exist_ok=True)
    frames: list[Image.Image] = []
    for index in range(args.frames):
        frame = strip.crop((index * slot_width, top, (index + 1) * slot_width, bottom))
        frame = fit_frame(frame, (args.width, args.height))
        frames.append(frame)
        frame.save(args.source_dir / f"frame_{index + 1:02d}_v1.png")
        frame.save(
            args.runtime_dir / f"{args.prefix}_{index + 1:02d}_v1.webp",
            "WEBP",
            lossless=True,
            method=6,
        )

    build_preview(frames, args.source_dir / "preview_v1.png")
    print(f"Built {len(frames)} frames from {args.input}")


if __name__ == "__main__":
    main()
