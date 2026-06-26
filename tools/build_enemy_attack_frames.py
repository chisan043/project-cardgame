#!/usr/bin/env python3
"""Build normalized enemy attack WebP frames from a generated horizontal strip."""

from __future__ import annotations

import argparse
import math
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


FRAME_COUNT = 6
FRAME_WIDTH = 675
FRAME_HEIGHT = 900
DEFAULT_KEY = "#ff00ff"


def parse_hex_color(value: str) -> tuple[int, int, int]:
    value = value.strip()
    if value.startswith("#"):
        value = value[1:]
    if len(value) != 6:
        raise argparse.ArgumentTypeError("Color must be a six-digit hex value.")
    try:
        return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))
    except ValueError as exc:
        raise argparse.ArgumentTypeError("Color must be a six-digit hex value.") from exc


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Split a six-frame enemy attack strip into normalized WebP frames."
    )
    parser.add_argument("--input", required=True, help="Generated horizontal strip image.")
    parser.add_argument("--slug", required=True, help="Enemy asset slug for output names.")
    parser.add_argument("--out-dir", required=True, help="Directory for exported WebP frames.")
    parser.add_argument("--preview", help="Optional checkerboard preview PNG path.")
    parser.add_argument(
        "--key-color",
        type=parse_hex_color,
        default=parse_hex_color(DEFAULT_KEY),
        help=f"Flat chroma-key color to remove. Default: {DEFAULT_KEY}.",
    )
    parser.add_argument(
        "--key-threshold",
        type=float,
        default=42.0,
        help="Euclidean color distance treated as background. Default: 42.",
    )
    parser.add_argument(
        "--alpha-threshold",
        type=int,
        default=8,
        help="Pixels above this alpha count as sprite content. Default: 8.",
    )
    parser.add_argument(
        "--padding-ratio",
        type=float,
        default=0.94,
        help="Fraction of the target frame occupied by the largest source frame. Default: 0.94.",
    )
    parser.add_argument(
        "--extract-mode",
        choices=("auto", "components", "slots"),
        default="auto",
        help="Frame extraction strategy. Default: auto.",
    )
    parser.add_argument(
        "--min-component-area",
        type=int,
        default=96,
        help="Small detached alpha components below this area are removed. Default: 96.",
    )
    parser.add_argument(
        "--min-component-ratio",
        type=float,
        default=0.035,
        help="Detached components below this fraction of the largest component are removed. Default: 0.035.",
    )
    return parser.parse_args()


def remove_chroma_key(
    image: Image.Image,
    key_color: tuple[int, int, int],
    threshold: float,
) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    threshold_sq = threshold * threshold
    key_r, key_g, key_b = key_color
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            distance_sq = (r - key_r) ** 2 + (g - key_g) ** 2 + (b - key_b) ** 2
            if distance_sq <= threshold_sq:
                pixels[x, y] = (r, g, b, 0)
    return remove_connected_chroma_fringe(image, 0)


def remove_connected_chroma_fringe(image: Image.Image, alpha_threshold: int) -> Image.Image:
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        index = (y * width) + x
        if visited[index]:
            return
        visited[index] = 1
        queue.append((x, y))

    for x in range(width):
        push(x, 0)
        push(x, height - 1)
    for y in range(1, height - 1):
        push(0, y)
        push(width - 1, y)

    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        traversable_background = a <= alpha_threshold or is_chroma_fringe_pixel(r, g, b, a)
        if not traversable_background:
            continue
        if a > alpha_threshold:
            pixels[x, y] = (r, g, b, 0)
        for ny in range(max(0, y - 1), min(height, y + 2)):
            for nx in range(max(0, x - 1), min(width, x + 2)):
                if nx == x and ny == y:
                    continue
                push(nx, ny)
    return image


def split_strip(strip: Image.Image) -> list[Image.Image]:
    step = strip.width / FRAME_COUNT
    frames = []
    for index in range(FRAME_COUNT):
        left = int(round(index * step))
        right = int(round((index + 1) * step))
        frames.append(strip.crop((left, 0, right, strip.height)))
    return frames


def collect_alpha_components(
    image: Image.Image,
    alpha_threshold: int,
) -> list[dict[str, object]]:
    alpha = image.getchannel("A")
    alpha_pixels = alpha.load()
    width, height = image.size
    visited: set[tuple[int, int]] = set()
    components: list[dict[str, object]] = []

    for y in range(height):
        for x in range(width):
            if alpha_pixels[x, y] <= alpha_threshold or (x, y) in visited:
                continue
            queue: deque[tuple[int, int]] = deque([(x, y)])
            visited.add((x, y))
            pixels: list[tuple[int, int]] = []
            min_x = max_x = x
            min_y = max_y = y
            while queue:
                px, py = queue.popleft()
                pixels.append((px, py))
                min_x = min(min_x, px)
                max_x = max(max_x, px)
                min_y = min(min_y, py)
                max_y = max(max_y, py)
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if (
                        0 <= nx < width
                        and 0 <= ny < height
                        and alpha_pixels[nx, ny] > alpha_threshold
                        and (nx, ny) not in visited
                    ):
                        visited.add((nx, ny))
                        queue.append((nx, ny))
            components.append({
                "area": len(pixels),
                "bbox": (min_x, min_y, max_x + 1, max_y + 1),
                "pixels": pixels,
            })
    return components


def remove_small_components(
    image: Image.Image,
    alpha_threshold: int,
    min_component_area: int,
    min_component_ratio: float,
) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    components = collect_alpha_components(image, alpha_threshold)
    if not components:
        return image

    largest_area = max(int(component["area"]) for component in components)
    minimum_area = max(min_component_area, int(round(largest_area * min_component_ratio)))
    output_pixels = image.load()
    for component in components:
        pixels = component["pixels"]
        assert isinstance(pixels, list)
        xs = [point[0] for point in pixels]
        touches_horizontal_cut = min(xs) <= 0 or max(xs) >= width - 1
        area = int(component["area"])
        is_main_component = area == largest_area
        if area >= minimum_area and (is_main_component or not touches_horizontal_cut):
            continue
        for x, y in pixels:
            r, g, b, _a = output_pixels[x, y]
            output_pixels[x, y] = (r, g, b, 0)
    return image


def extract_main_components(
    image: Image.Image,
    alpha_threshold: int,
) -> list[Image.Image] | None:
    components = collect_alpha_components(image, alpha_threshold)
    if len(components) < FRAME_COUNT:
        return None

    selected = sorted(components, key=lambda component: int(component["area"]), reverse=True)[:FRAME_COUNT]
    selected.sort(key=lambda component: ((component["bbox"][0] + component["bbox"][2]) / 2))
    extracted: list[Image.Image] = []
    source_pixels = image.load()
    for component in selected:
        bbox = component["bbox"]
        assert isinstance(bbox, tuple)
        left, top, right, bottom = bbox
        frame = Image.new("RGBA", (right - left, bottom - top), (0, 0, 0, 0))
        frame_pixels = frame.load()
        pixels = component["pixels"]
        assert isinstance(pixels, list)
        for x, y in pixels:
            frame_pixels[x - left, y - top] = source_pixels[x, y]
        extracted.append(frame)
    return extracted


def content_bbox(image: Image.Image, alpha_threshold: int) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A").point(lambda value: 255 if value > alpha_threshold else 0)
    return alpha.getbbox()


def crop_content(image: Image.Image, alpha_threshold: int) -> Image.Image | None:
    bbox = content_bbox(image, alpha_threshold)
    if bbox is None:
        return None
    return image.crop(bbox)


def get_shared_scale(contents: list[Image.Image | None], padding_ratio: float) -> float:
    visible = [content for content in contents if content is not None]
    if not visible:
        raise SystemExit("No visible frame content found after chroma-key removal.")
    max_width = max(content.width for content in visible)
    max_height = max(content.height for content in visible)
    return min((FRAME_WIDTH * padding_ratio) / max_width, (FRAME_HEIGHT * padding_ratio) / max_height)


def compose_frame(content: Image.Image | None, scale: float) -> Image.Image:
    canvas = Image.new("RGBA", (FRAME_WIDTH, FRAME_HEIGHT), (0, 0, 0, 0))
    if content is None:
        return canvas
    width = max(1, int(round(content.width * scale)))
    height = max(1, int(round(content.height * scale)))
    resized = content.resize((width, height), Image.Resampling.LANCZOS)
    x = (FRAME_WIDTH - width) // 2
    y = FRAME_HEIGHT - height
    canvas.alpha_composite(resized, (x, y))
    return canvas


def has_transparent_neighbor(
    alpha_pixels,
    x: int,
    y: int,
    width: int,
    height: int,
    alpha_threshold: int,
    radius: int = 1,
) -> bool:
    if x < radius or y < radius or x >= width - radius or y >= height - radius:
        return True
    for ny in range(max(0, y - radius), min(height, y + radius + 1)):
        for nx in range(max(0, x - radius), min(width, x + radius + 1)):
            if nx == x and ny == y:
                continue
            if alpha_pixels[nx, ny] <= alpha_threshold:
                return True
    return False


def is_chroma_fringe_pixel(r: int, g: int, b: int, a: int) -> bool:
    pink_key_bleed = (
        r > 150
        and b > 120
        and g < 140
        and (r + b - (2 * g)) > 160
    )
    hot_red_key_bleed = (
        r > 200
        and b > 55
        and g < 90
        and (r + b - (2 * g)) > 150
    )
    soft_pink_key_bleed = (
        r > 165
        and b > 140
        and g < 135
        and abs(r - b) < 90
        and (r + b - (2 * g)) > 80
    )
    red_key_bleed = (
        r > 170
        and b > 30
        and g < 95
        and (r + b - (2 * g)) > 120
    )
    faint_red_key_bleed = (
        a < 96
        and r > 160
        and b > 45
        and g < 110
        and (r + b - (2 * g)) > 95
    )
    return (
        pink_key_bleed
        or hot_red_key_bleed
        or soft_pink_key_bleed
        or red_key_bleed
        or faint_red_key_bleed
    )


def remove_chroma_fringe(image: Image.Image, alpha_threshold: int, passes: int = 3) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    edge_alpha_threshold = max(alpha_threshold, 16)
    edge_radius = 12
    for _pass_index in range(passes):
        alpha_pixels = image.getchannel("A").load()
        fringe_pixels: list[tuple[int, int, int, int, int]] = []
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                if a == 0:
                    continue
                if not is_chroma_fringe_pixel(r, g, b, a):
                    continue
                is_edge = a < 250 or has_transparent_neighbor(
                    alpha_pixels,
                    x,
                    y,
                    width,
                    height,
                    edge_alpha_threshold,
                    edge_radius,
                )
                if is_edge:
                    fringe_pixels.append((x, y, r, g, b))
        if not fringe_pixels:
            break
        for x, y, r, g, b in fringe_pixels:
            pixels[x, y] = (r, g, b, 0)
    return image


def paint_checkerboard(image: Image.Image, tile: int = 24) -> None:
    draw = ImageDraw.Draw(image)
    colors = ((235, 239, 244, 255), (216, 222, 230, 255))
    for y in range(0, image.height, tile):
        for x in range(0, image.width, tile):
            draw.rectangle(
                (x, y, x + tile, y + tile),
                fill=colors[((x // tile) + (y // tile)) % 2],
            )


def render_preview(frames: list[Image.Image], output: Path) -> None:
    gap = 16
    columns = 6
    rows = math.ceil(len(frames) / columns)
    width = columns * FRAME_WIDTH + (columns - 1) * gap
    height = rows * FRAME_HEIGHT + max(0, rows - 1) * gap
    preview = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    paint_checkerboard(preview)
    for index, frame in enumerate(frames):
        x = (index % columns) * (FRAME_WIDTH + gap)
        y = (index // columns) * (FRAME_HEIGHT + gap)
        preview.alpha_composite(frame, (x, y))
    output.parent.mkdir(parents=True, exist_ok=True)
    preview.save(output)


def main() -> None:
    args = parse_args()
    source = Image.open(args.input).convert("RGBA")
    keyed = remove_chroma_key(source, args.key_color, args.key_threshold)
    component_frames = None
    if args.extract_mode in ("auto", "components"):
        component_frames = extract_main_components(keyed, args.alpha_threshold)
        if component_frames is None and args.extract_mode == "components":
            raise SystemExit("Could not find six main components in the source strip.")
    if component_frames is None:
        component_frames = [
            remove_small_components(slot, args.alpha_threshold, args.min_component_area, args.min_component_ratio)
            for slot in split_strip(keyed)
        ]
    contents = [crop_content(frame, args.alpha_threshold) for frame in component_frames]
    scale = get_shared_scale(contents, args.padding_ratio)
    frames = [
        remove_small_components(
            remove_chroma_fringe(compose_frame(content, scale), args.alpha_threshold),
            args.alpha_threshold,
            args.min_component_area,
            min(args.min_component_ratio, 0.005),
        )
        for content in contents
    ]

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for index, frame in enumerate(frames, start=1):
        output = out_dir / f"{args.slug}_attack_{index:02d}_v2.webp"
        frame.save(output, format="WEBP", lossless=True, quality=95, method=6)

    if args.preview:
        render_preview(frames, Path(args.preview))


if __name__ == "__main__":
    main()
