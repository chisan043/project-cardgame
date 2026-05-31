#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / "UI" / "教堂彩窗赛璐璐" / "地图UI" / "image_gen资产" / "map_ui_fullscreen_imagegen_v1.png"
OUT = ROOT / "UI" / "教堂彩窗赛璐璐" / "地图UI" / "image_gen资产" / "可用切图_v1"


RECT_ASSETS = [
    ("fullscreen", "map_ui_fullscreen_imagegen_v1.png", (0, 0, 1672, 941), "完整 image-gen 概念图"),
    ("backgrounds", "map_center_painted_area_v1.png", (296, 66, 1233, 875), "中央手绘地图区，含路线与节点构图参考"),
    ("backgrounds", "map_center_landscape_crop_v1.png", (318, 90, 1210, 850), "中央地貌绘制参考，可作为后续净背景重绘底稿"),
    ("panels", "map_left_legend_panel_v1.png", (61, 95, 298, 710), "左侧图例面板"),
    ("panels", "map_right_detail_panel_v1.png", (1252, 17, 1639, 881), "右侧地点详情面板整件"),
    ("panels", "map_right_church_window_v1.png", (1264, 38, 1621, 459), "右侧教堂彩窗预览图"),
    ("panels", "map_right_text_area_v1.png", (1265, 477, 1618, 865), "右侧文字与按钮区域"),
    ("panels", "map_top_region_banner_v1.png", (515, 8, 1146, 125), "顶部区域标题铭牌"),
    ("buttons", "map_enter_button_v1.png", (1305, 724, 1572, 804), "进入按钮"),
    ("frames", "map_main_frame_v1.png", (28, 39, 1236, 886), "左侧与中央地图大框架"),
]

NODE_ASSETS = [
    ("map_node_battle_imagegen_v1.png", (123, 150), 50, "战斗节点徽章"),
    ("map_node_elite_imagegen_v1.png", (123, 237), 50, "精英战斗节点徽章"),
    ("map_node_shop_imagegen_v1.png", (123, 323), 50, "商店节点徽章"),
    ("map_node_rest_imagegen_v1.png", (123, 408), 50, "休整节点徽章"),
    ("map_node_event_imagegen_v1.png", (123, 493), 50, "奇遇节点徽章"),
    ("map_node_portal_imagegen_v1.png", (123, 578), 50, "传送门节点徽章"),
    ("map_node_boss_imagegen_v1.png", (123, 663), 50, "首领节点徽章"),
]


def crop_rect(src: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    return src.crop(box).convert("RGBA")


def crop_round(src: Image.Image, center: tuple[int, int], radius: int) -> Image.Image:
    cx, cy = center
    box = (cx - radius, cy - radius, cx + radius, cy + radius)
    img = src.crop(box).convert("RGBA")
    size = radius * 2
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((1, 1, size - 2, size - 2), fill=255)
    img.putalpha(mask)
    return img


def save(img: Image.Image, category: str, filename: str) -> Path:
    target = OUT / category / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    img.save(target)
    return target


def make_overview(asset_paths: list[Path]) -> Path:
    overview = Image.new("RGBA", (1400, 980), (10, 24, 31, 255))
    draw = ImageDraw.Draw(overview)
    draw.text((36, 28), "Image-gen 地图 UI 可用切图 v1", fill=(238, 214, 160, 255))

    x, y = 36, 80
    for path in asset_paths:
        if "fullscreen/" in str(path):
            continue
        img = Image.open(path).convert("RGBA")
        max_w, max_h = (260, 180)
        if "panels" in path.parts:
            max_w, max_h = (250, 250)
        if "backgrounds" in path.parts or "frames" in path.parts:
            max_w, max_h = (360, 250)
        if "nodes" in path.parts:
            max_w, max_h = (92, 92)
        scale = min(max_w / img.width, max_h / img.height, 1)
        thumb = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.LANCZOS)
        if x + max_w > overview.width - 36:
            x = 36
            y += 250
        overview.alpha_composite(thumb, (x, y))
        draw.text((x, y + thumb.height + 8), path.name, fill=(214, 196, 150, 255))
        x += max_w + 28

    path = OUT / "map_imagegen_sliced_overview_v1.png"
    overview.save(path)
    return path


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    manifest = {
        "source": str(SRC.relative_to(ROOT)),
        "output": str(OUT.relative_to(ROOT)),
        "assets": [],
    }

    generated_paths = []

    for category, filename, box, note in RECT_ASSETS:
        path = save(crop_rect(src, box), category, filename)
        generated_paths.append(path)
        manifest["assets"].append({
            "path": str(path.relative_to(ROOT)),
            "category": category,
            "source_box": box,
            "note": note,
        })

    for filename, center, radius, note in NODE_ASSETS:
        path = save(crop_round(src, center, radius), "nodes", filename)
        generated_paths.append(path)
        manifest["assets"].append({
            "path": str(path.relative_to(ROOT)),
            "category": "nodes",
            "source_center": center,
            "source_radius": radius,
            "note": note,
        })

    overview_path = make_overview(generated_paths)
    manifest["assets"].append({
        "path": str(overview_path.relative_to(ROOT)),
        "category": "overview",
        "note": "切图总览板",
    })

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    readme = [
        "# Image-gen 地图 UI 可用切图 v1",
        "",
        "从 `map_ui_fullscreen_imagegen_v1.png` 切分出的工程候选资产。",
        "",
        "说明：这批资产只做资源化拆分，尚未接入 demo，尚未提交或推送。节点徽章已做圆形透明裁切；大面板仍保留矩形边界，方便后续二次清理或九宫格化。",
        "",
        "## 目录",
        "",
        "- `backgrounds/`：中央地图区域与地貌参考",
        "- `panels/`：左图例、右详情、教堂窗、顶部区域铭牌",
        "- `buttons/`：进入按钮",
        "- `frames/`：大框架候选",
        "- `nodes/`：透明节点徽章",
        "- `manifest.json`：切图来源坐标与说明",
        "",
    ]
    (OUT / "README.md").write_text("\n".join(readme), encoding="utf-8")
    print(f"wrote {len(manifest['assets'])} sliced assets to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
