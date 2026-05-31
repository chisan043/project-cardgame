#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "UI" / "教堂彩窗赛璐璐" / "地图UI" / "image_gen资产" / "无背景资产_v1"

GOLD = (216, 164, 62, 255)
GOLD_LIGHT = (248, 214, 126, 255)
GOLD_DARK = (82, 52, 22, 255)
INK = (7, 23, 30, 238)
INK_DARK = (4, 12, 17, 245)
PARCHMENT = (207, 182, 126, 246)
BLUE = (28, 80, 128, 245)
RED = (142, 35, 30, 255)
VIOLET = (102, 46, 145, 255)
TEAL = (35, 120, 134, 255)
CREAM = (245, 224, 169, 255)


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                pass
    return ImageFont.load_default()


def save(img: Image.Image, category: str, filename: str, manifest: list[dict], note: str) -> Path:
    path = OUT / category / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    manifest.append({
        "path": str(path.relative_to(ROOT)),
        "category": category,
        "size": img.size,
        "note": note,
    })
    return path


def add_shadow(base: Image.Image, alpha: Image.Image, color=(0, 0, 0, 120), radius=10, offset=(0, 6)) -> None:
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    blur = alpha.filter(ImageFilter.GaussianBlur(radius))
    layer = Image.new("RGBA", base.size, color)
    layer.putalpha(blur.point(lambda p: min(color[3], p)))
    shadow.alpha_composite(layer, offset)
    base.alpha_composite(shadow)


def ornate_panel(size: tuple[int, int], radius=16, fill=INK) -> Image.Image:
    w, h = size
    pad = 22
    bottom_pad = 30
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    mask = Image.new("L", size, 0)
    md = ImageDraw.Draw(mask)
    box = (pad, pad, w - pad, h - bottom_pad)
    md.rounded_rectangle(box, radius=radius, fill=255)
    add_shadow(img, mask, radius=8, offset=(0, 5))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle(box, radius=radius, fill=fill)
    d.rounded_rectangle(box, radius=radius, outline=(30, 20, 10, 255), width=6)
    d.rounded_rectangle((pad + 7, pad + 7, w - pad - 7, h - bottom_pad - 7), radius=max(3, radius - 4), outline=GOLD, width=3)
    d.rounded_rectangle((pad + 17, pad + 17, w - pad - 17, h - bottom_pad - 17), radius=max(2, radius - 8), outline=(111, 72, 28, 210), width=2)
    for cx, cy, sx, sy in [
        (pad + 12, pad + 12, 1, 1),
        (w - pad - 12, pad + 12, -1, 1),
        (pad + 12, h - bottom_pad - 12, 1, -1),
        (w - pad - 12, h - bottom_pad - 12, -1, -1),
    ]:
        d.line((cx, cy, cx + sx * 28, cy, cx, cy + sy * 28), fill=GOLD, width=3)
        d.ellipse((cx + sx * 18 - 5, cy + sy * 18 - 5, cx + sx * 18 + 5, cy + sy * 18 + 5), fill=TEAL, outline=GOLD_LIGHT)
    return img


def draw_icon(d: ImageDraw.ImageDraw, kind: str, c: tuple[int, int], scale: float, color: tuple[int, int, int, int]) -> None:
    cx, cy = c
    w = max(2, int(5 * scale))
    if kind == "battle":
        d.line((cx - 24 * scale, cy + 21 * scale, cx + 22 * scale, cy - 25 * scale), fill=color, width=w)
        d.line((cx - 22 * scale, cy - 25 * scale, cx + 24 * scale, cy + 21 * scale), fill=color, width=w)
        d.polygon([(cx - 30 * scale, cy + 25 * scale), (cx - 14 * scale, cy + 18 * scale), (cx - 22 * scale, cy + 34 * scale)], fill=color)
        d.polygon([(cx + 30 * scale, cy + 25 * scale), (cx + 14 * scale, cy + 18 * scale), (cx + 22 * scale, cy + 34 * scale)], fill=color)
    elif kind == "elite":
        for a in range(0, 360, 45):
            x1 = cx + math.cos(math.radians(a)) * 9 * scale
            y1 = cy + math.sin(math.radians(a)) * 9 * scale
            x2 = cx + math.cos(math.radians(a)) * 33 * scale
            y2 = cy + math.sin(math.radians(a)) * 33 * scale
            d.line((x1, y1, x2, y2), fill=color, width=w)
        d.ellipse((cx - 14 * scale, cy - 14 * scale, cx + 14 * scale, cy + 14 * scale), fill=color)
    elif kind == "shop":
        d.rounded_rectangle((cx - 30 * scale, cy - 12 * scale, cx + 30 * scale, cy + 28 * scale), radius=int(8 * scale), fill=color)
        d.arc((cx - 18 * scale, cy - 32 * scale, cx + 18 * scale, cy + 10 * scale), 205, 335, fill=color, width=w)
        d.line((cx - 20 * scale, cy + 4 * scale, cx + 20 * scale, cy + 4 * scale), fill=(20, 25, 30, 180), width=max(1, int(2 * scale)))
    elif kind == "rest":
        d.polygon([(cx, cy - 34 * scale), (cx + 23 * scale, cy + 18 * scale), (cx, cy + 34 * scale), (cx - 23 * scale, cy + 18 * scale)], fill=color)
        d.polygon([(cx, cy - 18 * scale), (cx + 12 * scale, cy + 11 * scale), (cx, cy + 21 * scale), (cx - 12 * scale, cy + 11 * scale)], fill=(250, 88, 50, 255))
    elif kind == "event":
        qfont = font(int(64 * scale))
        d.text((cx - 18 * scale, cy - 39 * scale), "?", fill=color, font=qfont)
    elif kind == "portal":
        d.rounded_rectangle((cx - 24 * scale, cy - 28 * scale, cx + 24 * scale, cy + 30 * scale), radius=int(20 * scale), outline=color, width=w)
        d.rectangle((cx - 16 * scale, cy - 3 * scale, cx + 16 * scale, cy + 30 * scale), fill=color)
        d.rectangle((cx - 8 * scale, cy + 6 * scale, cx + 8 * scale, cy + 30 * scale), fill=(18, 36, 54, 220))
    elif kind == "boss":
        d.rounded_rectangle((cx - 28 * scale, cy - 22 * scale, cx + 28 * scale, cy + 24 * scale), radius=int(12 * scale), fill=color)
        d.ellipse((cx - 20 * scale, cy - 9 * scale, cx - 6 * scale, cy + 5 * scale), fill=(25, 10, 25, 210))
        d.ellipse((cx + 6 * scale, cy - 9 * scale, cx + 20 * scale, cy + 5 * scale), fill=(25, 10, 25, 210))
        d.polygon([(cx - 7 * scale, cy + 18 * scale), (cx, cy + 8 * scale), (cx + 7 * scale, cy + 18 * scale)], fill=(25, 10, 25, 210))


def node(kind: str, fill: tuple[int, int, int, int], icon_color=CREAM) -> Image.Image:
    img = Image.new("RGBA", (192, 192), (0, 0, 0, 0))
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse((30, 28, 162, 160), fill=255)
    add_shadow(img, mask, radius=12, offset=(0, 7))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse((30, 28, 162, 160), fill=(36, 25, 16, 255), outline=(13, 8, 5, 255), width=5)
    d.ellipse((42, 40, 150, 148), fill=fill, outline=GOLD, width=5)
    d.ellipse((53, 51, 139, 137), outline=(255, 226, 145, 130), width=2)
    for a in range(0, 360, 45):
        x = 96 + math.cos(math.radians(a)) * 74
        y = 94 + math.sin(math.radians(a)) * 74
        d.polygon([(x, y - 8), (x + 8, y), (x, y + 8), (x - 8, y)], fill=GOLD_DARK, outline=GOLD)
    draw_icon(d, kind, (96, 94), 1.04, icon_color)
    return img


def enter_button() -> Image.Image:
    img = Image.new("RGBA", (380, 112), (0, 0, 0, 0))
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.polygon([(38, 18), (342, 18), (370, 56), (342, 94), (38, 94), (10, 56)], fill=255)
    add_shadow(img, mask, radius=8, offset=(0, 6))
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(38, 18), (342, 18), (370, 56), (342, 94), (38, 94), (10, 56)], fill=BLUE, outline=(22, 13, 8, 255))
    d.polygon([(48, 27), (332, 27), (356, 56), (332, 85), (48, 85), (24, 56)], outline=GOLD, fill=None)
    d.text((156, 35), "进入", fill=CREAM, font=font(34))
    for x in [34, 346]:
        d.polygon([(x, 56), (x + (14 if x < 100 else -14), 42), (x + (28 if x < 100 else -28), 56), (x + (14 if x < 100 else -14), 70)], fill=TEAL, outline=GOLD_LIGHT)
    return img


def region_banner() -> Image.Image:
    img = Image.new("RGBA", (700, 140), (0, 0, 0, 0))
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.polygon([(80, 20), (620, 20), (684, 70), (620, 120), (80, 120), (16, 70)], fill=255)
    add_shadow(img, mask, radius=10, offset=(0, 7))
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(80, 20), (620, 20), (684, 70), (620, 120), (80, 120), (16, 70)], fill=PARCHMENT, outline=(30, 18, 10, 255))
    d.line((96, 32, 604, 32), fill=GOLD, width=4)
    d.line((96, 108, 604, 108), fill=GOLD_DARK, width=3)
    d.text((276, 45), "银风丘陵", fill=(35, 25, 15, 255), font=font(38))
    for x in [72, 628]:
        d.polygon([(x, 70), (x + (22 if x < 350 else -22), 44), (x + (44 if x < 350 else -44), 70), (x + (22 if x < 350 else -22), 96)], fill=BLUE, outline=GOLD_LIGHT)
    return img


def side_legend() -> Image.Image:
    img = ornate_panel((300, 720), radius=14, fill=(20, 26, 27, 232))
    d = ImageDraw.Draw(img, "RGBA")
    entries = [
        ("battle", RED, "战斗"),
        ("elite", (118, 92, 20, 255), "精英战斗"),
        ("shop", BLUE, "商店"),
        ("rest", TEAL, "休整"),
        ("event", (34, 88, 144, 255), "奇遇"),
        ("portal", (34, 74, 128, 255), "传送门"),
        ("boss", VIOLET, "首领"),
    ]
    for i, (kind, color, label) in enumerate(entries):
        y = 68 + i * 86
        n = node(kind, color).resize((62, 62), Image.LANCZOS)
        img.alpha_composite(n, (42, y - 25))
        d.text((120, y - 8), label, fill=CREAM, font=font(26))
    return img


def church_window() -> Image.Image:
    img = ornate_panel((420, 500), radius=34, fill=(40, 92, 114, 235))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((52, 48, 368, 410), radius=26, fill=(86, 143, 171, 255), outline=GOLD, width=3)
    d.polygon([(76, 386), (160, 270), (250, 386)], fill=(63, 94, 79, 255))
    d.polygon([(170, 386), (300, 245), (372, 386)], fill=(70, 96, 82, 255))
    d.rectangle((160, 235, 284, 392), fill=(54, 59, 70, 255), outline=(23, 20, 23, 255), width=3)
    d.polygon([(138, 235), (222, 158), (308, 235)], fill=(44, 49, 61, 255), outline=(20, 16, 18, 255))
    d.polygon([(214, 158), (238, 52), (258, 160)], fill=(35, 39, 54, 255), outline=(18, 14, 17, 255))
    for x in [184, 248]:
        d.rounded_rectangle((x, 280, x + 22, 338), radius=10, fill=(117, 169, 182, 230), outline=(30, 36, 42, 255))
    for x in [112, 196, 280]:
        d.line((x, 52, x, 408), fill=(211, 162, 68, 110), width=2)
    for y in [158, 270]:
        d.line((54, y, 366, y), fill=(211, 162, 68, 100), width=2)
    return img


def right_detail_panel() -> Image.Image:
    img = ornate_panel((460, 760), radius=18, fill=INK_DARK)
    d = ImageDraw.Draw(img, "RGBA")
    win = church_window().resize((336, 400), Image.LANCZOS)
    img.alpha_composite(win, (62, 36))
    d.text((108, 450), "被遗忘的教堂", fill=GOLD_LIGHT, font=font(34))
    d.line((75, 502, 385, 502), fill=GOLD, width=3)
    d.text((80, 540), "古老信仰的残存之地，", fill=CREAM, font=font(25))
    d.text((80, 580), "似乎在召唤迷途之人。", fill=CREAM, font=font(25))
    btn = enter_button().resize((250, 74), Image.LANCZOS)
    img.alpha_composite(btn, (105, 644))
    return img


def text_box() -> Image.Image:
    img = ornate_panel((430, 230), radius=14, fill=INK_DARK)
    d = ImageDraw.Draw(img, "RGBA")
    d.text((58, 46), "被遗忘的教堂", fill=GOLD_LIGHT, font=font(30))
    d.line((58, 90, 372, 90), fill=GOLD, width=3)
    d.text((58, 124), "古老信仰的残存之地，", fill=CREAM, font=font(24))
    d.text((58, 162), "似乎在召唤迷途之人。", fill=CREAM, font=font(24))
    return img


def main_frame() -> Image.Image:
    img = Image.new("RGBA", (1280, 900), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((18, 18, 1262, 882), radius=10, outline=(22, 13, 8, 255), width=8)
    d.rounded_rectangle((28, 28, 1252, 872), radius=8, outline=GOLD, width=4)
    d.rounded_rectangle((44, 44, 1236, 856), radius=6, outline=GOLD_DARK, width=2)
    for cx, cy, sx, sy in [(34, 34, 1, 1), (1246, 34, -1, 1), (34, 866, 1, -1), (1246, 866, -1, -1)]:
        d.line((cx, cy, cx + sx * 50, cy, cx, cy + sy * 50), fill=GOLD, width=4)
        d.ellipse((cx + sx * 30 - 6, cy + sy * 30 - 6, cx + sx * 30 + 6, cy + sy * 30 + 6), fill=TEAL, outline=GOLD_LIGHT)
    return img


def overview(paths: list[Path]) -> Image.Image:
    img = Image.new("RGBA", (1500, 1180), (9, 24, 31, 255))
    d = ImageDraw.Draw(img, "RGBA")
    d.text((40, 32), "地图 UI 无背景资产 v1", fill=CREAM, font=font(30))
    x, y = 40, 92
    cell_w, cell_h = 330, 250
    for path in paths:
        if path.name.startswith("overview"):
            continue
        item = Image.open(path).convert("RGBA")
        mw, mh = (250, 155)
        if "panels" in path.parts:
            mw, mh = (280, 170)
        if "frames" in path.parts:
            mw, mh = (300, 180)
        if "nodes" in path.parts:
            mw, mh = (112, 112)
        scale = min(mw / item.width, mh / item.height, 1)
        item = item.resize((max(1, int(item.width * scale)), max(1, int(item.height * scale))), Image.LANCZOS)
        if x + cell_w > img.width - 40:
            x = 40
            y += cell_h
        img.alpha_composite(item, (x, y))
        d.text((x, y + item.height + 10), path.name, fill=(210, 192, 146, 255), font=font(14))
        x += cell_w
    return img


def write_readme(manifest: list[dict]) -> None:
    lines = [
        "# 地图 UI 无背景资产 v1",
        "",
        "按 image-gen 概念图的造型语言重新绘制的透明 PNG。没有从整图脏切抠边，组件外部为透明背景。",
        "",
        "未接入 demo，未提交，未推送。",
        "",
        "## 文件",
        "",
    ]
    for item in manifest:
        lines.append(f"- `{item['path']}`：{item['note']}")
    (OUT / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    manifest: list[dict] = []
    generated: list[Path] = []

    generated.append(save(region_banner(), "panels", "map_region_banner_transparent_v1.png", manifest, "顶部区域铭牌，透明背景"))
    generated.append(save(side_legend(), "panels", "map_side_legend_panel_transparent_v1.png", manifest, "左侧图例面板，透明背景"))
    generated.append(save(church_window(), "panels", "map_church_window_transparent_v1.png", manifest, "教堂彩窗预览框，透明背景"))
    generated.append(save(text_box(), "panels", "map_location_text_box_transparent_v1.png", manifest, "地点文字信息框，透明背景"))
    generated.append(save(right_detail_panel(), "panels", "map_detail_panel_transparent_v1.png", manifest, "右侧地点详情面板，透明背景"))
    generated.append(save(enter_button(), "buttons", "map_enter_button_transparent_v1.png", manifest, "进入按钮，透明背景"))
    generated.append(save(main_frame(), "frames", "map_main_frame_overlay_transparent_v1.png", manifest, "主地图黄铜边框叠加层，透明背景"))

    node_specs = [
        ("battle", RED, "map_node_battle_transparent_v1.png", "战斗节点，透明背景"),
        ("elite", (118, 92, 20, 255), "map_node_elite_transparent_v1.png", "精英战斗节点，透明背景"),
        ("shop", BLUE, "map_node_shop_transparent_v1.png", "商店节点，透明背景"),
        ("rest", TEAL, "map_node_rest_transparent_v1.png", "休整节点，透明背景"),
        ("event", (34, 88, 144, 255), "map_node_event_transparent_v1.png", "奇遇节点，透明背景"),
        ("portal", (34, 74, 128, 255), "map_node_portal_transparent_v1.png", "传送门节点，透明背景"),
        ("boss", VIOLET, "map_node_boss_transparent_v1.png", "首领节点，透明背景"),
    ]
    for kind, fill, filename, note in node_specs:
        generated.append(save(node(kind, fill), "nodes", filename, manifest, note))

    ov = overview(generated)
    generated.append(save(ov, "overview", "overview_map_transparent_assets_v1.png", manifest, "无背景资产总览板"))
    (OUT / "manifest.json").write_text(json.dumps({"assets": manifest}, ensure_ascii=False, indent=2), encoding="utf-8")
    write_readme(manifest)
    print(f"wrote {len(generated)} transparent assets to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
