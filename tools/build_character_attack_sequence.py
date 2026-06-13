#!/usr/bin/env python3
"""Build normalized character attack frames from a horizontal alpha strip."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--source-out-dir", required=True, type=Path)
    parser.add_argument("--runtime-out-dir", required=True, type=Path)
    parser.add_argument("--runtime-prefix", required=True)
    parser.add_argument("--frames", type=int, default=6)
    parser.add_argument("--canvas-width", type=int, default=1024)
    parser.add_argument("--canvas-height", type=int, default=1536)
    parser.add_argument("--padding-x", type=int, default=42)
    parser.add_argument("--padding-top", type=int, default=54)
    parser.add_argument("--padding-bottom", type=int, default=72)
    parser.add_argument("--alpha-threshold", type=int, default=8)
    parser.add_argument("--quality", type=int, default=86)
    return parser.parse_args()


def content_bbox(image: Image.Image, threshold: int) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A").point(lambda value: 255 if value > threshold else 0)
    return alpha.getbbox()


def connected_components(image: Image.Image, threshold: int) -> list[list[int]]:
    width, height = image.size
    alpha = image.getchannel("A")
    alpha_values = getattr(alpha, "get_flattened_data", alpha.getdata)()
    pending = bytearray(1 if value > threshold else 0 for value in alpha_values)
    components: list[list[int]] = []
    for position, visible in enumerate(pending):
        if not visible:
            continue
        pending[position] = 0
        stack = [position]
        component: list[int] = []
        while stack:
            current = stack.pop()
            component.append(current)
            y, x = divmod(current, width)
            for neighbor_y in range(max(0, y - 1), min(height, y + 2)):
                row = neighbor_y * width
                for neighbor_x in range(max(0, x - 1), min(width, x + 2)):
                    neighbor = row + neighbor_x
                    if pending[neighbor]:
                        pending[neighbor] = 0
                        stack.append(neighbor)
        components.append(component)
    return components


def split_merged_component(component: list[int], width: int) -> list[list[int]]:
    xs = [position % width for position in component]
    left = min(xs)
    right = max(xs) + 1
    search_left = round(left + (right - left) * 0.35)
    search_right = round(left + (right - left) * 0.65)
    column_counts = {x: 0 for x in range(search_left, search_right)}
    for x in xs:
        if x in column_counts:
            column_counts[x] += 1
    boundary = min(column_counts, key=lambda x: (column_counts[x], abs(x - (left + right) / 2)))
    return [
        [position for position in component if position % width < boundary],
        [position for position in component if position % width >= boundary],
    ]


def isolate_component(strip: Image.Image, component: list[int]) -> Image.Image:
    width, _ = strip.size
    xs = [position % width for position in component]
    ys = [position // width for position in component]
    bbox = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
    mask = Image.new("L", (bbox[2] - bbox[0], bbox[3] - bbox[1]), 0)
    mask_pixels = mask.load()
    for position in component:
        y, x = divmod(position, width)
        mask_pixels[x - bbox[0], y - bbox[1]] = 255
    mask = mask.filter(ImageFilter.MaxFilter(5))
    crop = strip.crop(bbox)
    crop.putalpha(ImageChops.multiply(crop.getchannel("A"), mask))
    return crop


def extract_frames(strip: Image.Image, frame_count: int, threshold: int) -> list[Image.Image]:
    components = connected_components(strip, threshold)
    largest_area = max(len(component) for component in components)
    figures = [
        component for component in components if len(component) >= largest_area * 0.08
    ]
    if len(figures) == frame_count - 1:
        merged = max(figures, key=lambda component: max(p % strip.width for p in component) - min(p % strip.width for p in component))
        figures.remove(merged)
        figures.extend(split_merged_component(merged, strip.width))
    if len(figures) != frame_count:
        raise SystemExit(
            f"Expected {frame_count} figure components, detected {len(figures)}."
        )
    figures.sort(key=lambda component: sum(p % strip.width for p in component) / len(component))
    return [isolate_component(strip, component) for component in figures]


def make_preview(frames: list[Image.Image], source_out_dir: Path) -> None:
    thumb_width = 256
    thumb_height = 384
    gap = 18
    columns = 3
    rows = 2
    preview = Image.new(
        "RGBA",
        (
            columns * thumb_width + (columns + 1) * gap,
            rows * thumb_height + (rows + 1) * gap,
        ),
        (24, 19, 34, 255),
    )
    draw = ImageDraw.Draw(preview)
    for index, frame in enumerate(frames):
        thumb = frame.resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        x = gap + (index % columns) * (thumb_width + gap)
        y = gap + (index // columns) * (thumb_height + gap)
        preview.alpha_composite(thumb, (x, y))
        draw.text((x + 8, y + 8), str(index + 1), fill=(255, 255, 255, 220))
    preview.save(source_out_dir / "preview_v2.png")


def main() -> None:
    args = parse_args()
    if args.frames < 1:
        raise SystemExit("--frames must be positive")

    strip = Image.open(args.input).convert("RGBA")
    crops = extract_frames(strip, args.frames, args.alpha_threshold)

    available_width = args.canvas_width - args.padding_x * 2
    available_height = args.canvas_height - args.padding_top - args.padding_bottom
    max_width = max(image.width for image in crops)
    max_height = max(image.height for image in crops)
    scale = min(available_width / max_width, available_height / max_height)

    args.source_out_dir.mkdir(parents=True, exist_ok=True)
    args.runtime_out_dir.mkdir(parents=True, exist_ok=True)
    normalized: list[Image.Image] = []
    for index, crop in enumerate(crops, start=1):
        width = max(1, round(crop.width * scale))
        height = max(1, round(crop.height * scale))
        sprite = crop.resize((width, height), Image.Resampling.LANCZOS)
        frame = Image.new(
            "RGBA", (args.canvas_width, args.canvas_height), (0, 0, 0, 0)
        )
        x = (args.canvas_width - width) // 2
        y = args.canvas_height - args.padding_bottom - height
        frame.alpha_composite(sprite, (x, y))
        normalized.append(frame)

        frame.save(args.source_out_dir / f"{index:02d}.png", optimize=True)
        frame.save(
            args.runtime_out_dir / f"{args.runtime_prefix}_{index:02d}_v2.webp",
            "WEBP",
            quality=args.quality,
            method=6,
        )

    make_preview(normalized, args.source_out_dir)
    print(
        f"Built {len(normalized)} frames at {args.canvas_width}x{args.canvas_height}; "
        f"shared scale={scale:.4f}"
    )


if __name__ == "__main__":
    main()
