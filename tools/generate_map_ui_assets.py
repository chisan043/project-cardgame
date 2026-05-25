#!/usr/bin/env python3
from pathlib import Path
import math
import random

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "UI" / "教堂彩窗赛璐璐" / "地图UI"
ASSET_DIR = OUT / "正式资产"
NODE_DIR = ASSET_DIR / "节点"

GOLD = (222, 178, 82, 255)
GOLD_DARK = (132, 92, 38, 255)
CRIMSON = (166, 30, 43, 255)
CYAN = (55, 169, 183, 255)
VIOLET = (104, 68, 154, 255)
INK = (8, 9, 16, 255)
PANEL = (14, 16, 27, 228)
TEXT = (242, 225, 180, 255)
MUTED = (122, 116, 106, 255)


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                pass
    return ImageFont.load_default()


def ensure_dirs():
    NODE_DIR.mkdir(parents=True, exist_ok=True)


def save(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)


def add_glow(base, mask, color, radius=18, opacity=180):
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    alpha = mask.filter(ImageFilter.GaussianBlur(radius))
    glow.putalpha(alpha.point(lambda p: min(opacity, p)))
    color_layer = Image.new("RGBA", base.size, color)
    glow = ImageChops.multiply(glow, color_layer)
    base.alpha_composite(glow)


def radial_mask(size, center, radius):
    w, h = size
    cx, cy = center
    mask = Image.new("L", size, 0)
    pix = mask.load()
    for y in range(h):
        for x in range(w):
            d = math.hypot((x - cx) / radius, (y - cy) / radius)
            pix[x, y] = max(0, min(255, int((1 - d) * 255)))
    return mask


def draw_brass_frame(draw, box, radius=18, width=4, accent=True):
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=radius, outline=(64, 45, 26, 255), width=width + 2)
    draw.rounded_rectangle((x0 + 3, y0 + 3, x1 - 3, y1 - 3), radius=radius - 3, outline=GOLD, width=width)
    draw.rounded_rectangle((x0 + 9, y0 + 9, x1 - 9, y1 - 9), radius=max(4, radius - 8), outline=(245, 221, 142, 120), width=1)
    if accent:
        for cx, cy in [(x0 + 18, y0 + 18), (x1 - 18, y0 + 18), (x0 + 18, y1 - 18), (x1 - 18, y1 - 18)]:
            draw.polygon([(cx, cy - 7), (cx + 7, cy), (cx, cy + 7), (cx - 7, cy)], fill=(42, 126, 147, 235), outline=GOLD)


def create_background(width=1920, height=1080):
    img = Image.new("RGBA", (width, height), INK)
    pix = img.load()
    for y in range(height):
        t = y / (height - 1)
        for x in range(width):
            v = int(10 + 13 * (1 - t))
            r = int(v + 8 * math.sin((x / width) * math.pi))
            g = int(v + 2)
            b = int(18 + 20 * (1 - t))
            pix[x, y] = (r, g, b, 255)

    d = ImageDraw.Draw(img, "RGBA")
    for step, alpha in [(72, 28), (144, 18)]:
        for x in range(0, width, step):
            d.line((x, 0, x, height), fill=(218, 170, 80, alpha), width=1)
        for y in range(0, height, step):
            d.line((0, y, width, y), fill=(218, 170, 80, alpha), width=1)

    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    for center, color, radius in [
        ((width * 0.52, height * 0.13), (191, 58, 58, 70), width * 0.36),
        ((width * 0.27, height * 0.44), (45, 137, 151, 48), width * 0.3),
        ((width * 0.72, height * 0.54), (116, 74, 161, 42), width * 0.34),
    ]:
        mask = radial_mask(img.size, center, radius)
        color_layer = Image.new("RGBA", img.size, color)
        color_layer.putalpha(mask.point(lambda p: min(color[3], p)))
        glow.alpha_composite(color_layer)
    img.alpha_composite(glow)

    random.seed(7)
    for _ in range(220):
        x = random.randint(0, width - 1)
        y = random.randint(0, height - 1)
        if random.random() < 0.62 and y > height * 0.78:
            continue
        a = random.randint(25, 105)
        d.ellipse((x, y, x + 1, y + 1), fill=(244, 220, 153, a))

    # Subtle cathedral-window silhouette.
    cx = width // 2
    top = 72
    arch_w = 470
    arch_h = 620
    d.rounded_rectangle((cx - arch_w // 2, top + 120, cx + arch_w // 2, top + arch_h), radius=arch_w // 2, outline=(219, 169, 75, 34), width=3)
    for i in range(-2, 3):
        x = cx + i * 92
        d.line((x, top + 150, x, top + arch_h - 16), fill=(219, 169, 75, 24), width=2)
    for yy in [top + 255, top + 365, top + 475]:
        d.line((cx - arch_w // 2 + 32, yy, cx + arch_w // 2 - 32, yy), fill=(219, 169, 75, 24), width=2)

    vignette = Image.new("L", img.size, 0)
    vp = vignette.load()
    for y in range(height):
        for x in range(width):
            dx = abs(x / width - 0.5) * 2
            dy = abs(y / height - 0.5) * 2
            a = int(max(0, (max(dx, dy) - 0.44) / 0.56) * 185)
            vp[x, y] = a
    dark = Image.new("RGBA", img.size, (0, 0, 0, 255))
    dark.putalpha(vignette)
    img.alpha_composite(dark)
    return img


def create_title_card():
    img = Image.new("RGBA", (420, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((18, 18, 402, 202), radius=16, fill=PANEL)
    draw_brass_frame(d, (18, 18, 402, 202), radius=16, width=3)
    d.line((52, 78, 368, 78), fill=(222, 178, 82, 138), width=2)
    d.text((54, 40), "幻境星图", fill=TEXT, font=font(32))
    lines = ["选择下一处幻境", "金色路线可前进", "赤红路线记录已踏过的命运"]
    for i, line in enumerate(lines):
        d.text((56, 100 + i * 28), line, fill=(189, 179, 153, 255), font=font(20))
    return img


def create_button():
    img = Image.new("RGBA", (360, 96), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((14, 14, 346, 82), radius=10, fill=(15, 18, 28, 238))
    draw_brass_frame(d, (14, 14, 346, 82), radius=10, width=3, accent=False)
    d.polygon([(36, 48), (51, 33), (66, 48), (51, 63)], fill=CYAN, outline=GOLD)
    d.text((88, 32), "地图按钮底板", fill=TEXT, font=font(24))
    return img


def create_legend_pill():
    img = Image.new("RGBA", (220, 56), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((8, 8, 212, 48), radius=6, fill=(18, 21, 30, 220), outline=(222, 178, 82, 140), width=2)
    d.ellipse((24, 20, 36, 32), fill=GOLD)
    d.text((50, 16), "可前进", fill=(214, 203, 170, 255), font=font(20))
    return img


def node_palette(state):
    palettes = {
        "normal": ((35, 37, 49, 255), (77, 78, 91, 255), (120, 116, 102, 140)),
        "reachable": ((51, 45, 28, 255), GOLD, (255, 226, 130, 220)),
        "current": ((55, 18, 22, 255), CRIMSON, (255, 104, 96, 220)),
        "passed": ((32, 12, 13, 255), (111, 44, 30, 255), (175, 73, 58, 120)),
    }
    return palettes[state]


def draw_icon(d, kind, center, scale, fill):
    cx, cy = center
    f = fill
    w = max(2, int(5 * scale))
    if kind == "battle":
        d.line((cx - 23 * scale, cy + 18 * scale, cx + 20 * scale, cy - 25 * scale), fill=f, width=w)
        d.line((cx - 20 * scale, cy - 25 * scale, cx + 23 * scale, cy + 18 * scale), fill=f, width=w)
        d.polygon([(cx - 27 * scale, cy + 21 * scale), (cx - 13 * scale, cy + 16 * scale), (cx - 20 * scale, cy + 30 * scale)], fill=f)
        d.polygon([(cx + 27 * scale, cy + 21 * scale), (cx + 13 * scale, cy + 16 * scale), (cx + 20 * scale, cy + 30 * scale)], fill=f)
    elif kind == "elite":
        d.polygon([(cx - 28 * scale, cy - 6 * scale), (cx - 14 * scale, cy - 27 * scale), (cx, cy - 7 * scale), (cx + 14 * scale, cy - 27 * scale), (cx + 28 * scale, cy - 6 * scale), (cx + 22 * scale, cy + 20 * scale), (cx - 22 * scale, cy + 20 * scale)], fill=f)
        d.rectangle((cx - 24 * scale, cy + 18 * scale, cx + 24 * scale, cy + 26 * scale), fill=f)
    elif kind == "event":
        for r in [28, 18, 8]:
            d.arc((cx - r * scale, cy - r * scale, cx + r * scale, cy + r * scale), 35, 305, fill=f, width=w)
        d.ellipse((cx + 17 * scale, cy - 22 * scale, cx + 29 * scale, cy - 10 * scale), fill=f)
    elif kind == "shop":
        d.rounded_rectangle((cx - 28 * scale, cy - 8 * scale, cx + 28 * scale, cy + 30 * scale), radius=int(7 * scale), fill=f)
        d.arc((cx - 18 * scale, cy - 27 * scale, cx + 18 * scale, cy + 13 * scale), 205, 335, fill=f, width=w)
        d.line((cx - 17 * scale, cy + 5 * scale, cx + 17 * scale, cy + 5 * scale), fill=(8, 9, 16, 185), width=max(1, int(2 * scale)))
    elif kind == "rest":
        d.polygon([(cx, cy - 31 * scale), (cx + 22 * scale, cy + 16 * scale), (cx, cy + 31 * scale), (cx - 22 * scale, cy + 16 * scale)], fill=f)
        d.polygon([(cx, cy - 15 * scale), (cx + 12 * scale, cy + 10 * scale), (cx, cy + 19 * scale), (cx - 12 * scale, cy + 10 * scale)], fill=(255, 102, 58, 220))
    elif kind == "boss":
        d.rounded_rectangle((cx - 30 * scale, cy - 25 * scale, cx + 30 * scale, cy + 25 * scale), radius=int(13 * scale), fill=f)
        d.ellipse((cx - 21 * scale, cy - 10 * scale, cx - 6 * scale, cy + 5 * scale), fill=(15, 5, 8, 210))
        d.ellipse((cx + 6 * scale, cy - 10 * scale, cx + 21 * scale, cy + 5 * scale), fill=(15, 5, 8, 210))
        d.polygon([(cx - 7 * scale, cy + 18 * scale), (cx, cy + 8 * scale), (cx + 7 * scale, cy + 18 * scale)], fill=(15, 5, 8, 210))
    else:
        d.ellipse((cx - 24 * scale, cy - 24 * scale, cx + 24 * scale, cy + 24 * scale), outline=f, width=w)
        d.line((cx - 18 * scale, cy, cx + 18 * scale, cy), fill=f, width=w)


def create_node(kind, state):
    img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    bg, border, glow = node_palette(state)
    d = ImageDraw.Draw(img, "RGBA")
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    if kind == "boss":
        shape = (38, 34, 122, 118)
        md.rounded_rectangle(shape, radius=18, fill=255)
    elif kind == "elite":
        shape = [(80, 26), (124, 70), (105, 124), (55, 124), (36, 70)]
        md.polygon(shape, fill=255)
    else:
        shape = (40, 34, 120, 114)
        md.ellipse(shape, fill=255)

    add_glow(img, mask, glow, radius=16, opacity=145)
    if kind == "boss":
        d.rounded_rectangle((38, 34, 122, 118), radius=18, fill=bg, outline=border, width=4)
        d.rounded_rectangle((45, 41, 115, 111), radius=14, outline=(245, 222, 150, 100), width=2)
    elif kind == "elite":
        d.polygon([(80, 26), (124, 70), (105, 124), (55, 124), (36, 70)], fill=bg, outline=border)
        d.line([(80, 26), (124, 70), (105, 124), (55, 124), (36, 70), (80, 26)], fill=border, width=4)
    else:
        d.ellipse((40, 34, 120, 114), fill=bg, outline=border, width=4)
        d.ellipse((48, 42, 112, 106), outline=(245, 222, 150, 94), width=2)
    d.arc((48, 42, 112, 106), 205, 322, fill=(255, 255, 255, 45), width=4)
    icon_color = (238, 218, 157, 235) if state != "normal" else (145, 139, 122, 150)
    draw_icon(d, kind, (80, 76), 1.0, icon_color)
    if state == "passed":
        d.line((53, 119, 107, 119), fill=(169, 68, 56, 160), width=4)
    return img


def create_path_styles():
    img = Image.new("RGBA", (560, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    labels = [("未探索", (91, 91, 105, 210), None), ("已通过", CRIMSON, None), ("可前进", GOLD, (16, 12))]
    for i, (label, color, dash) in enumerate(labels):
        y = 48 + i * 58
        if dash:
            x = 32
            while x < 410:
                d.line((x, y, min(x + dash[0], 410), y), fill=color, width=7)
                x += sum(dash)
        else:
            d.line((32, y, 410, y), fill=color, width=6)
        d.ellipse((24, y - 8, 40, y + 8), fill=color)
        d.ellipse((402, y - 8, 418, y + 8), fill=color)
        d.text((440, y - 16), label, fill=TEXT if i else MUTED, font=font(22))
    return img


def create_floor_label():
    img = Image.new("RGBA", (260, 54), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.line((26, 27, 92, 27), fill=(222, 178, 82, 80), width=2)
    d.line((168, 27, 234, 27), fill=(222, 178, 82, 80), width=2)
    d.text((100, 12), "第 8 层", fill=(222, 178, 82, 124), font=font(22))
    return img


def create_node_sheet(node_paths):
    labels = {
        "battle": "战斗",
        "elite": "精英",
        "event": "事件",
        "shop": "商店",
        "rest": "休整",
        "boss": "首领",
        "empty": "空白",
    }
    states = ["normal", "reachable", "current", "passed"]
    img = Image.new("RGBA", (1040, 900), (8, 9, 16, 255))
    d = ImageDraw.Draw(img, "RGBA")
    d.text((42, 32), "地图节点资产族 v1", fill=TEXT, font=font(38))
    d.text((42, 84), "普通 / 可前进 / 当前 / 已通过", fill=(180, 171, 145, 255), font=font(22))
    for c, state in enumerate(states):
        d.text((190 + c * 190, 130), state, fill=GOLD if state == "reachable" else (178, 168, 142, 255), font=font(18))
    for r, kind in enumerate(labels):
        y = 170 + r * 96
        d.text((50, y + 30), labels[kind], fill=TEXT, font=font(24))
        for c, state in enumerate(states):
            node = Image.open(node_paths[(kind, state)]).convert("RGBA").resize((86, 86), Image.LANCZOS)
            img.alpha_composite(node, (210 + c * 190, y))
    return img


def draw_map_path(d, p1, p2, color, width=6, dash=None):
    x1, y1 = p1
    x2, y2 = p2
    mid = y1 + (y2 - y1) * 0.52
    points = []
    for i in range(80):
        t = i / 79
        x = (1 - t) ** 3 * x1 + 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3 * x2
        y = (1 - t) ** 3 * y1 + 3 * (1 - t) ** 2 * t * mid + 3 * (1 - t) * t ** 2 * mid + t ** 3 * y2
        points.append((x, y))
    if not dash:
        d.line(points, fill=color, width=width)
    else:
        for i in range(0, len(points) - 2, 6):
            d.line(points[i:i + 4], fill=color, width=width)


def create_concept_board(node_paths):
    img = create_background(1600, 900)
    d = ImageDraw.Draw(img, "RGBA")
    d.text((64, 50), "地图 UI 美术资产概念板 v1", fill=TEXT, font=font(40))
    d.text((66, 104), "教堂彩窗结构、黄铜线框、赛璐璐平涂、暗色星图底板", fill=(191, 179, 145, 255), font=font(22))

    card = create_title_card().resize((336, 176), Image.LANCZOS)
    img.alpha_composite(card, (68, 168))

    lanes = [690, 840, 990, 1140]
    rows = [710, 590, 470, 350, 230]
    nodes = [
        ("battle", "current", lanes[1], rows[0]),
        ("battle", "passed", lanes[0], rows[1]),
        ("event", "reachable", lanes[2], rows[1]),
        ("elite", "normal", lanes[1], rows[2]),
        ("shop", "normal", lanes[3], rows[2]),
        ("rest", "normal", lanes[2], rows[3]),
        ("boss", "normal", lanes[1], rows[4]),
    ]
    draw_map_path(d, (lanes[1], rows[0] + 44), (lanes[0], rows[1] + 44), CRIMSON, 7)
    draw_map_path(d, (lanes[1], rows[0] + 44), (lanes[2], rows[1] + 44), GOLD, 7, dash=True)
    draw_map_path(d, (lanes[0], rows[1] + 44), (lanes[1], rows[2] + 44), (91, 91, 105, 205), 4)
    draw_map_path(d, (lanes[2], rows[1] + 44), (lanes[3], rows[2] + 44), (91, 91, 105, 205), 4)
    draw_map_path(d, (lanes[1], rows[2] + 44), (lanes[2], rows[3] + 44), (91, 91, 105, 205), 4)
    draw_map_path(d, (lanes[2], rows[3] + 44), (lanes[1], rows[4] + 44), (91, 91, 105, 205), 4)
    for kind, state, x, y in nodes:
        n = Image.open(node_paths[(kind, state)]).convert("RGBA").resize((112, 112), Image.LANCZOS)
        img.alpha_composite(n, (int(x - 56), int(y)))

    button = create_button().resize((288, 77), Image.LANCZOS)
    img.alpha_composite(button, (70, 736))
    pill = create_legend_pill()
    img.alpha_composite(pill, (74, 368))
    return img


def parchment_noise(size, base=(151, 129, 86, 255), seed=12):
    random.seed(seed)
    w, h = size
    img = Image.new("RGBA", size, base)
    pix = img.load()
    for y in range(h):
        for x in range(w):
            n = random.randint(-10, 10)
            wave = int(8 * math.sin(x * 0.018) + 5 * math.sin((x + y) * 0.012))
            r = max(0, min(255, base[0] + n + wave))
            g = max(0, min(255, base[1] + n + wave))
            b = max(0, min(255, base[2] + n + wave))
            pix[x, y] = (r, g, b, 255)
    return img.filter(ImageFilter.SMOOTH_MORE)


def draw_polyline(draw, points, fill, width=4, joint="curve"):
    if len(points) < 2:
        return
    draw.line(points, fill=fill, width=width, joint=joint)


def draw_mountains(draw, origin, count=6, scale=1.0):
    ox, oy = origin
    for i in range(count):
        x = ox + i * 54 * scale + random.randint(-10, 10) * scale
        y = oy + random.randint(-18, 18) * scale
        w = random.randint(42, 76) * scale
        h = random.randint(70, 118) * scale
        ridge = [(x, y), (x - w * 0.45, y + h), (x + w * 0.48, y + h)]
        draw.polygon(ridge, fill=(108, 104, 79, 210), outline=(62, 59, 44, 210))
        draw.polygon([(x, y + 8 * scale), (x - w * 0.18, y + h * 0.62), (x + w * 0.05, y + h * 0.45)], fill=(202, 190, 143, 100))
        draw.line((x, y, x - w * 0.08, y + h * 0.7), fill=(50, 49, 38, 120), width=max(1, int(2 * scale)))


def draw_forest(draw, box, density=90):
    x0, y0, x1, y1 = box
    random.seed(x0 + y0 + density)
    for _ in range(density):
        x = random.randint(x0, x1)
        y = random.randint(y0, y1)
        s = random.randint(5, 12)
        color = random.choice([(48, 91, 58, 145), (64, 108, 63, 130), (38, 72, 55, 150)])
        draw.polygon([(x, y - s), (x - s, y + s), (x + s, y + s)], fill=color)


def create_parchment_map_background(width=1920, height=1080):
    img = parchment_noise((width, height), (148, 126, 84, 255), seed=31)
    d = ImageDraw.Draw(img, "RGBA")
    random.seed(42)

    # Terrain layers.
    draw_forest(d, (360, 235, 900, 715), 210)
    draw_forest(d, (880, 220, 1390, 530), 135)
    draw_mountains(d, (260, 270), 7, 1.25)
    draw_mountains(d, (1080, 210), 8, 1.05)
    draw_mountains(d, (935, 665), 7, 1.22)
    draw_mountains(d, (550, 560), 5, 0.95)

    river = [(1240, 130), (1200, 250), (1255, 360), (1172, 490), (1208, 650), (1050, 775), (1030, 1000)]
    draw_polyline(d, river, (42, 93, 117, 135), width=44)
    draw_polyline(d, river, (118, 157, 159, 100), width=22)
    draw_polyline(d, river, (31, 57, 78, 115), width=3)

    # Old map routes, faintly embedded in the parchment.
    roads = [
        [(370, 805), (555, 620), (750, 700), (925, 530), (1140, 610), (1340, 410)],
        [(530, 255), (760, 420), (930, 255), (1130, 420), (1330, 275)],
        [(540, 255), (545, 620), (760, 420), (930, 255), (925, 530), (1128, 420), (1140, 610)],
    ]
    for pts in roads:
        draw_polyline(d, pts, (63, 55, 40, 96), width=10)
        draw_polyline(d, pts, (216, 199, 145, 112), width=4)

    for _ in range(70):
        x = random.randint(160, width - 260)
        y = random.randint(120, height - 100)
        d.ellipse((x, y, x + 2, y + 2), fill=(44, 39, 31, random.randint(32, 88)))

    # Vignette and ink-wash edge.
    edge = Image.new("L", img.size, 0)
    ep = edge.load()
    for y in range(height):
        for x in range(width):
            dx = min(x, width - x) / (width * 0.18)
            dy = min(y, height - y) / (height * 0.18)
            a = int(max(0, 1 - min(dx, dy)) * 130)
            ep[x, y] = a
    dark = Image.new("RGBA", img.size, (21, 16, 12, 255))
    dark.putalpha(edge)
    img.alpha_composite(dark)
    return img


def draw_ornate_frame(draw, box, radius=8, line=5, fill=None):
    x0, y0, x1, y1 = box
    if fill:
        draw.rounded_rectangle(box, radius=radius, fill=fill)
    draw.rounded_rectangle(box, radius=radius, outline=(39, 31, 20, 255), width=line + 4)
    draw.rounded_rectangle((x0 + 5, y0 + 5, x1 - 5, y1 - 5), radius=radius, outline=(205, 151, 61, 255), width=line)
    draw.rounded_rectangle((x0 + 14, y0 + 14, x1 - 14, y1 - 14), radius=max(2, radius - 4), outline=(78, 52, 24, 210), width=2)
    for cx, cy, sx, sy in [(x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)]:
        pts = [(cx + sx * 16, cy), (cx + sx * 44, cy + sy * 12), (cx + sx * 28, cy + sy * 28), (cx + sx * 8, cy + sy * 42)]
        draw.line(pts, fill=(204, 149, 58, 245), width=3)
        draw.ellipse((cx + sx * 24 - 5, cy + sy * 24 - 5, cx + sx * 24 + 5, cy + sy * 24 + 5), fill=(37, 95, 138, 255), outline=(220, 168, 67, 255))


def create_full_layout_frame():
    img = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    draw_ornate_frame(d, (32, 38, 1416, 1036), radius=8, line=5)
    draw_ornate_frame(d, (1438, 38, 1888, 1036), radius=12, line=5, fill=(12, 28, 38, 225))
    d.line((1440, 520, 1886, 520), fill=(205, 151, 61, 230), width=5)
    return img


def create_region_banner():
    img = Image.new("RGBA", (620, 124), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(64, 22), (556, 22), (604, 62), (556, 102), (64, 102), (16, 62)], fill=(193, 169, 121, 245), outline=(42, 31, 20, 255))
    draw_ornate_frame(d, (32, 16, 588, 108), radius=8, line=3)
    for x in [54, 566]:
        d.polygon([(x, 62), (x + (18 if x < 300 else -18), 42), (x + (36 if x < 300 else -36), 62), (x + (18 if x < 300 else -18), 82)], fill=(35, 90, 144, 245), outline=(209, 156, 63, 255))
    d.text((226, 39), "银风丘陵", fill=(31, 24, 17, 255), font=font(36))
    return img


def create_side_legend_panel():
    img = Image.new("RGBA", (250, 620), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    draw_ornate_frame(d, (12, 12, 238, 608), radius=8, line=3, fill=(113, 96, 62, 180))
    entries = [("battle", "战斗"), ("elite", "精英战斗"), ("shop", "商店"), ("rest", "奇遇"), ("event", "事件"), ("empty", "传送门"), ("boss", "首领")]
    for i, (kind, label) in enumerate(entries):
        y = 54 + i * 72
        node = create_node(kind, "normal").resize((48, 48), Image.LANCZOS)
        img.alpha_composite(node, (36, y - 16))
        d.text((96, y - 5), label, fill=(38, 29, 19, 255), font=font(26))
    return img


def create_detail_illustration():
    img = Image.new("RGBA", (370, 360), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    draw_ornate_frame(d, (16, 12, 354, 348), radius=24, line=4, fill=(58, 93, 105, 255))
    sky = Image.new("RGBA", (302, 258), (87, 132, 158, 255))
    sd = ImageDraw.Draw(sky, "RGBA")
    for y in range(258):
        t = y / 257
        sd.line((0, y, 302, y), fill=(int(100 - 30 * t), int(151 - 45 * t), int(178 - 55 * t), 255))
    sd.polygon([(0, 228), (80, 135), (150, 222)], fill=(71, 92, 78, 255))
    sd.polygon([(90, 226), (190, 112), (302, 226)], fill=(82, 98, 81, 255))
    sd.rectangle((118, 122, 224, 226), fill=(62, 62, 68, 255), outline=(24, 26, 31, 255), width=3)
    sd.polygon([(102, 125), (172, 76), (242, 125)], fill=(47, 51, 61, 255), outline=(20, 22, 28, 255))
    sd.polygon([(168, 75), (185, 8), (200, 78)], fill=(39, 43, 57, 255), outline=(14, 16, 22, 255))
    sd.rectangle((154, 156, 188, 226), fill=(35, 42, 51, 255))
    for x in [134, 204]:
        sd.rounded_rectangle((x, 146, x + 22, 186), radius=10, fill=(104, 142, 154, 230), outline=(31, 38, 44, 255))
    sd.line((0, 226, 302, 226), fill=(34, 55, 45, 255), width=4)
    mask = Image.new("L", (302, 258), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, 302, 258), radius=22, fill=255)
    img.alpha_composite(sky, (34, 44))
    img.putalpha(ImageChops.lighter(img.getchannel("A"), Image.new("L", img.size, 0)))
    for x in [88, 154, 220]:
        d.line((x, 46, x, 302), fill=(204, 151, 61, 96), width=2)
    d.line((36, 170, 334, 170), fill=(204, 151, 61, 96), width=2)
    return img


def create_detail_panel():
    img = Image.new("RGBA", (430, 640), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    draw_ornate_frame(d, (14, 14, 416, 626), radius=12, line=4, fill=(13, 28, 37, 242))
    ill = create_detail_illustration().resize((348, 338), Image.LANCZOS)
    img.alpha_composite(ill, (41, 34))
    d.text((88, 386), "被遗忘的教堂", fill=GOLD, font=font(34))
    d.line((62, 432, 368, 432), fill=(205, 151, 61, 180), width=3)
    for i, line in enumerate(["古老信仰的残存之地，", "似乎在召唤迷途之人。"]):
        d.text((64, 464 + i * 44), line, fill=(204, 184, 138, 255), font=font(26))
    btn = create_enter_button().resize((246, 74), Image.LANCZOS)
    img.alpha_composite(btn, (92, 534))
    return img


def create_enter_button():
    img = Image.new("RGBA", (300, 88), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(30, 18), (270, 18), (292, 44), (270, 70), (30, 70), (8, 44)], fill=(28, 72, 111, 245), outline=(31, 24, 16, 255))
    draw_ornate_frame(d, (14, 12, 286, 76), radius=4, line=3, fill=None)
    d.text((113, 27), "进入", fill=(238, 212, 155, 255), font=font(32))
    return img


def node_palette_v2(kind, state):
    base = {
        "battle": ((115, 42, 31, 255), (232, 213, 158, 255)),
        "elite": ((98, 72, 24, 255), (235, 218, 141, 255)),
        "shop": ((38, 71, 112, 255), (222, 197, 122, 255)),
        "rest": ((31, 82, 125, 255), (212, 232, 238, 255)),
        "event": ((74, 56, 32, 255), (223, 197, 131, 255)),
        "empty": ((42, 78, 116, 255), (218, 224, 214, 255)),
        "boss": ((88, 42, 112, 255), (215, 118, 223, 255)),
    }
    fill, icon = base[kind]
    if state == "normal":
        return fill, icon, (46, 36, 22, 255), 120
    if state == "reachable":
        return fill, icon, GOLD, 215
    if state == "current":
        return (125, 36, 35, 255), (250, 224, 168, 255), CRIMSON, 220
    return (80, 46, 34, 255), (169, 136, 92, 255), (112, 52, 30, 255), 105


def create_node_v2(kind, state):
    img = Image.new("RGBA", (164, 164), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    fill, icon, ring, glow_alpha = node_palette_v2(kind, state)
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse((28, 22, 136, 130), fill=255)
    add_glow(img, mask, ring, radius=15, opacity=glow_alpha)
    d.ellipse((28, 22, 136, 130), fill=(39, 27, 18, 255), outline=(20, 16, 12, 255), width=5)
    d.ellipse((36, 30, 128, 122), fill=fill, outline=ring, width=5)
    for i, r in enumerate([50, 44, 36]):
        d.ellipse((82 - r, 76 - r, 82 + r, 76 + r), outline=(214, 160, 66, 110 - i * 22), width=2)
    for a in range(0, 360, 45):
        x = 82 + math.cos(math.radians(a)) * 60
        y = 76 + math.sin(math.radians(a)) * 60
        d.polygon([(x, y - 7), (x + 7, y), (x, y + 7), (x - 7, y)], fill=(42, 31, 18, 255), outline=(205, 151, 61, 255))
    draw_icon(d, kind, (82, 76), 0.82, icon)
    if state == "passed":
        d.line((49, 128, 115, 128), fill=(176, 70, 44, 190), width=5)
    return img


def create_path_styles_v2():
    img = Image.new("RGBA", (620, 230), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    labels = [("未探索路线", (82, 72, 52, 205), None), ("已通过路线", CRIMSON, None), ("可前进路线", GOLD, (22, 14))]
    for i, (label, color, dash) in enumerate(labels):
        y = 50 + i * 60
        d.line((32, y + 3, 410, y + 3), fill=(35, 25, 16, 180), width=10)
        if dash:
            x = 32
            while x < 410:
                d.line((x, y, min(x + dash[0], 410), y), fill=color, width=5)
                x += sum(dash)
        else:
            d.line((32, y, 410, y), fill=color, width=5)
        d.text((446, y - 18), label, fill=(47, 35, 22, 255), font=font(24))
    return img


def create_concept_board_v2(node_paths):
    img = Image.new("RGBA", (1600, 900), (9, 25, 33, 255))
    map_bg = create_parchment_map_background(1600, 900)
    img.alpha_composite(map_bg)
    d = ImageDraw.Draw(img, "RGBA")
    draw_ornate_frame(d, (10, 38, 1200, 858), radius=6, line=4)
    draw_ornate_frame(d, (1215, 38, 1588, 858), radius=12, line=4, fill=(13, 28, 37, 232))
    banner = create_region_banner().resize((496, 99), Image.LANCZOS)
    img.alpha_composite(banner, (552, 5))
    legend = create_side_legend_panel().resize((210, 521), Image.LANCZOS)
    img.alpha_composite(legend, (28, 92))
    detail = create_detail_panel().resize((348, 518), Image.LANCZOS)
    img.alpha_composite(detail, (1230, 120))

    route_nodes = [
        ("battle", "current", 430, 160),
        ("shop", "normal", 385, 400),
        ("event", "normal", 610, 300),
        ("event", "normal", 785, 185),
        ("rest", "normal", 770, 485),
        ("shop", "normal", 940, 395),
        ("boss", "normal", 1110, 285),
        ("battle", "normal", 1030, 610),
        ("empty", "passed", 430, 660),
    ]
    connections = [
        ((430, 210), (385, 450)), ((430, 210), (610, 350)), ((385, 450), (430, 710)),
        ((385, 450), (770, 535)), ((610, 350), (785, 235)), ((610, 350), (770, 535)),
        ((785, 235), (940, 445)), ((940, 445), (1110, 335)), ((940, 445), (1030, 660)),
        ((1110, 335), (1030, 660)),
    ]
    for p1, p2 in connections:
        d.line((p1, p2), fill=(35, 26, 17, 190), width=11)
        d.line((p1, p2), fill=(211, 195, 142, 175), width=5)
    for kind, state, x, y in route_nodes:
        node = Image.open(node_paths[(kind, state)]).convert("RGBA").resize((112, 112), Image.LANCZOS)
        img.alpha_composite(node, (x - 56, y - 56))
    return img


def create_node_sheet_v2(node_paths):
    labels = {
        "battle": "战斗",
        "elite": "精英战斗",
        "shop": "商店",
        "rest": "奇遇",
        "event": "事件",
        "empty": "传送门",
        "boss": "首领",
    }
    states = ["normal", "reachable", "current", "passed"]
    img = parchment_noise((1080, 900), (143, 123, 84, 255), seed=72)
    d = ImageDraw.Draw(img, "RGBA")
    draw_ornate_frame(d, (20, 20, 1060, 880), radius=8, line=4)
    d.text((54, 46), "地图节点纹章资产族 v2", fill=(40, 30, 18, 255), font=font(38))
    d.text((56, 96), "参考概念图：黄铜外环、职业色内盘、清晰四态", fill=(58, 45, 28, 255), font=font(22))
    for c, state in enumerate(states):
        d.text((245 + c * 198, 140), state, fill=(48, 36, 22, 255), font=font(20))
    for r, kind in enumerate(labels):
        y = 180 + r * 94
        d.text((58, y + 30), labels[kind], fill=(40, 30, 18, 255), font=font(25))
        for c, state in enumerate(states):
            node = Image.open(node_paths[(kind, state)]).convert("RGBA").resize((84, 84), Image.LANCZOS)
            img.alpha_composite(node, (250 + c * 198, y))
    return img


def write_readme(paths):
    rels = [str(p.relative_to(ROOT)) for p in paths]
    body = """# 地图 UI 美术资产

这一批是地图推进界面的美术资产包。v2 已按 `概念图/地图概念图.png` 对齐：羊皮纸山川地图、左侧图例、顶部区域铭牌、黄铜纹章节点、右侧地点详情面板与蓝金“进入”按钮。

保留旧 v1 星图稿作为历史探索；正式接入建议优先使用 v2 文件。

## 文件

"""
    for rel in rels:
        body += f"- `{rel}`\n"
    body += """
## 建议接入

- `bg_map_silverwind_hills_01.png` 可替换当前 `#scene-map` 的纯 CSS 背景。
- `map_full_layout_frame_asset_v2.png` 提供整屏黄铜边框与右侧详情区骨架。
- `节点/` 下的 v2 PNG 按 `normal / reachable / current / passed` 四态组织，可用于替换现有 `.node` CSS 圆形节点。
- `map_path_styles_asset_v2.png` 是路线视觉参考；实际路线仍建议用 SVG path 渲染，保持当前动态连线能力。
- `地图UI_整体概念板_v2.png` 用于验收整体观感与后续迭代沟通。
"""
    (OUT / "README.md").write_text(body, encoding="utf-8")


def main():
    ensure_dirs()
    paths = []

    bg = create_parchment_map_background()
    bg_path = ASSET_DIR / "bg_map_silverwind_hills_01.png"
    save(bg, bg_path)
    paths.append(bg_path)

    for name, img in [
        ("map_full_layout_frame_asset_v2.png", create_full_layout_frame()),
        ("map_region_banner_asset_v2.png", create_region_banner()),
        ("map_side_legend_panel_asset_v2.png", create_side_legend_panel()),
        ("map_detail_panel_asset_v2.png", create_detail_panel()),
        ("map_detail_illustration_church_asset_v2.png", create_detail_illustration()),
        ("map_enter_button_asset_v2.png", create_enter_button()),
        ("map_path_styles_asset_v2.png", create_path_styles_v2()),
        ("map_floor_label_asset_v2.png", create_floor_label()),
    ]:
        p = ASSET_DIR / name
        save(img, p)
        paths.append(p)

    node_paths = {}
    kinds = ["battle", "elite", "shop", "rest", "event", "empty", "boss"]
    states = ["normal", "reachable", "current", "passed"]
    for kind in kinds:
        for state in states:
            img = create_node_v2(kind, state)
            path = NODE_DIR / f"map_node_{kind}_{state}_asset_v2.png"
            save(img, path)
            node_paths[(kind, state)] = path
            paths.append(path)

    sheet_path = ASSET_DIR / "map_node_sheet_asset_v2.png"
    save(create_node_sheet_v2(node_paths), sheet_path)
    paths.append(sheet_path)

    board_path = OUT / "地图UI_整体概念板_v2.png"
    save(create_concept_board_v2(node_paths), board_path)
    paths.append(board_path)

    write_readme(paths)
    print(f"generated {len(paths)} map UI assets under {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
