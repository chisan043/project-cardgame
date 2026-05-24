from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


OUT_DIR = Path(__file__).resolve().parent
SIZE = 512
SCALE = 3
W = SIZE * SCALE
C = W // 2


STATUSES = [
    {"id": "armor", "name": "护盾", "kind": "buff", "tone": "defense", "symbol": "shield", "color": "#4fb3ff"},
    {"id": "thorns", "name": "荆棘", "kind": "buff", "tone": "nature", "symbol": "thorns", "color": "#61d36e"},
    {"id": "str", "name": "力量", "kind": "buff", "tone": "power", "symbol": "fist", "color": "#ff9b42"},
    {"id": "charge", "name": "蓄力", "kind": "buff", "tone": "gold", "symbol": "charge_crystal", "color": "#ffd75f"},
    {"id": "echo", "name": "回音", "kind": "buff", "tone": "magic", "symbol": "echo", "color": "#9b6dff"},
    {"id": "blood", "name": "血祭", "kind": "buff", "tone": "blood", "symbol": "blood_rite", "color": "#b31d38"},
    {"id": "enchant", "name": "附魔", "kind": "buff", "tone": "power", "symbol": "sword", "color": "#ffd45a"},
    {"id": "guard", "name": "庇护", "kind": "buff", "tone": "defense", "symbol": "ward", "color": "#8fd8ff"},
    {"id": "counter", "name": "招架准备", "kind": "buff", "tone": "gold", "symbol": "bolt", "color": "#ffd75f"},
    {"id": "poison", "name": "剧毒", "kind": "debuff", "tone": "poison", "symbol": "skull", "color": "#61d36e"},
    {"id": "bleed", "name": "出血", "kind": "debuff", "tone": "bleed", "symbol": "slash_drop", "color": "#d83b3b"},
    {"id": "burn", "name": "燃烧", "kind": "debuff", "tone": "fire", "symbol": "wildfire", "color": "#ff7a1a"},
    {"id": "stun", "name": "眩晕", "kind": "debuff", "tone": "gold", "symbol": "starburst", "color": "#ffd75f"},
    {"id": "curse", "name": "诅咒", "kind": "debuff", "tone": "curse", "symbol": "chain", "color": "#a86cff"},
    {"id": "vuln", "name": "易伤", "kind": "debuff", "tone": "curse", "symbol": "target", "color": "#b86cff"},
    {"id": "weak", "name": "虚弱", "kind": "debuff", "tone": "curse", "symbol": "down", "color": "#bfc0c8"},
]


def hex_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.strip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def lighten(color: tuple[int, int, int, int], amount: float) -> tuple[int, int, int, int]:
    r, g, b, a = color
    return (
        min(255, int(r + (255 - r) * amount)),
        min(255, int(g + (255 - g) * amount)),
        min(255, int(b + (255 - b) * amount)),
        a,
    )


def darken(color: tuple[int, int, int, int], amount: float) -> tuple[int, int, int, int]:
    r, g, b, a = color
    return (max(0, int(r * (1 - amount))), max(0, int(g * (1 - amount))), max(0, int(b * (1 - amount))), a)


def ellipse_mask(box: tuple[int, int, int, int], blur: int = 0) -> Image.Image:
    mask = Image.new("L", (W, W), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse(box, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(blur)) if blur else mask


def polygon_points(cx: int, cy: int, r: int, n: int, rotation: float = -math.pi / 2) -> list[tuple[int, int]]:
    return [
        (int(cx + math.cos(rotation + i * math.tau / n) * r), int(cy + math.sin(rotation + i * math.tau / n) * r))
        for i in range(n)
    ]


def draw_stained_segments(draw: ImageDraw.ImageDraw, color: tuple[int, int, int, int]) -> None:
    outer = 196 * SCALE
    inner = 145 * SCALE
    for i in range(12):
        start = i * 30 + 4
        end = start + 22
        seg_color = lighten(color, 0.16 if i % 2 else 0.02)
        draw.pieslice((C - outer, C - outer, C + outer, C + outer), start, end, fill=seg_color)
        draw.pieslice((C - inner, C - inner, C + inner, C + inner), start, end, fill=(0, 0, 0, 0))
    for i in range(12):
        ang = math.radians(i * 30)
        x1 = C + math.cos(ang) * inner
        y1 = C + math.sin(ang) * inner
        x2 = C + math.cos(ang) * outer
        y2 = C + math.sin(ang) * outer
        draw.line((x1, y1, x2, y2), fill=(69, 42, 15, 230), width=5 * SCALE)


def draw_frame(base: Image.Image, color: tuple[int, int, int, int]) -> None:
    d = ImageDraw.Draw(base, "RGBA")
    glow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((64 * SCALE, 64 * SCALE, W - 64 * SCALE, W - 64 * SCALE), outline=lighten(color, 0.25), width=20 * SCALE)
    base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(18 * SCALE)))

    d.ellipse((62 * SCALE, 62 * SCALE, W - 62 * SCALE, W - 62 * SCALE), fill=(10, 9, 13, 230))
    draw_stained_segments(d, (*color[:3], 155))
    d.ellipse((132 * SCALE, 132 * SCALE, W - 132 * SCALE, W - 132 * SCALE), fill=(20, 18, 15, 245))

    gold_dark = (80, 48, 16, 255)
    gold = (211, 151, 44, 255)
    gold_hi = (255, 224, 126, 255)
    for inset, width, outline in [(48, 10, gold_dark), (56, 8, gold), (70, 4, gold_hi), (124, 8, gold_dark), (135, 5, gold)]:
        d.ellipse((inset * SCALE, inset * SCALE, W - inset * SCALE, W - inset * SCALE), outline=outline, width=width * SCALE)

    for angle in (0, 90, 180, 270):
        rad = math.radians(angle - 90)
        cx = C + int(math.cos(rad) * 194 * SCALE)
        cy = C + int(math.sin(rad) * 194 * SCALE)
        star = polygon_points(cx, cy, 28 * SCALE, 4, math.radians(45))
        d.polygon(star, fill=gold, outline=gold_dark)
        inner = polygon_points(cx, cy, 13 * SCALE, 4, math.radians(45))
        d.polygon(inner, fill=lighten(color, 0.28), outline=gold_hi)


def draw_symbol_shadow(draw_fn, layer: Image.Image, *args) -> None:
    shadow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow, "RGBA")
    draw_fn(sd, *args, shadow=True)
    shadow = ImageChops.offset(shadow.filter(ImageFilter.GaussianBlur(5 * SCALE)), 4 * SCALE, 7 * SCALE)
    layer.alpha_composite(shadow)
    draw_fn(ImageDraw.Draw(layer, "RGBA"), *args, shadow=False)


def symbol_color(color: tuple[int, int, int, int], shadow: bool) -> tuple[int, int, int, int]:
    return (0, 0, 0, 150) if shadow else lighten(color, 0.34)


def outline_color(shadow: bool) -> tuple[int, int, int, int]:
    return (0, 0, 0, 0) if shadow else (255, 239, 180, 235)


def draw_shield(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    pts = [(C, 142*SCALE), (328*SCALE, 184*SCALE), (310*SCALE, 322*SCALE), (C, 384*SCALE), (202*SCALE, 322*SCALE), (184*SCALE, 184*SCALE)]
    d.polygon(pts, fill=fill, outline=outline)
    d.line([(C, 164*SCALE), (C, 348*SCALE)], fill=darken(fill, 0.22), width=8*SCALE)


def draw_thorns(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.arc((146*SCALE, 182*SCALE, 366*SCALE, 396*SCALE), 202, 340, fill=fill, width=20*SCALE)
    d.arc((144*SCALE, 118*SCALE, 364*SCALE, 334*SCALE), 20, 158, fill=fill, width=20*SCALE)
    for x, y, rot in [(210, 225, -25), (296, 280, 30), (260, 170, 0)]:
        pts = [(x*SCALE, (y-38)*SCALE), ((x-16)*SCALE, (y+10)*SCALE), ((x+18)*SCALE, (y+6)*SCALE)]
        d.polygon(pts, fill=lighten(fill, 0.2), outline=outline)


def draw_fist(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    for x in (174, 220, 266, 312):
        d.rounded_rectangle((x*SCALE, 158*SCALE, (x+48)*SCALE, 242*SCALE), radius=18*SCALE, fill=fill, outline=outline, width=4*SCALE)
    d.rounded_rectangle((184*SCALE, 232*SCALE, 348*SCALE, 340*SCALE), radius=34*SCALE, fill=fill, outline=outline, width=5*SCALE)
    d.polygon([(178*SCALE, 258*SCALE), (128*SCALE, 278*SCALE), (188*SCALE, 320*SCALE)], fill=fill, outline=outline)


def draw_flame(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    pts = [(C, 116*SCALE), (340*SCALE, 226*SCALE), (310*SCALE, 366*SCALE), (C, 405*SCALE), (194*SCALE, 360*SCALE), (176*SCALE, 260*SCALE), (226*SCALE, 214*SCALE)]
    d.polygon(pts, fill=fill, outline=outline)
    d.polygon([(C, 210*SCALE), (292*SCALE, 298*SCALE), (C, 354*SCALE), (224*SCALE, 304*SCALE)], fill=lighten(fill, 0.28), outline=None)


def draw_wildfire(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    left = [(206*SCALE, 382*SCALE), (146*SCALE, 296*SCALE), (178*SCALE, 218*SCALE), (230*SCALE, 274*SCALE)]
    center = [(C, 106*SCALE), (336*SCALE, 236*SCALE), (316*SCALE, 378*SCALE), (C, 420*SCALE), (196*SCALE, 374*SCALE), (182*SCALE, 252*SCALE), (228*SCALE, 206*SCALE)]
    right = [(306*SCALE, 386*SCALE), (370*SCALE, 304*SCALE), (336*SCALE, 222*SCALE), (286*SCALE, 286*SCALE)]
    d.polygon(left, fill=darken(fill, 0.08), outline=outline)
    d.polygon(right, fill=darken(fill, 0.04), outline=outline)
    d.polygon(center, fill=fill, outline=outline)
    d.polygon([(C, 222*SCALE), (288*SCALE, 312*SCALE), (C, 366*SCALE), (224*SCALE, 314*SCALE)], fill=lighten(fill, 0.34))


def draw_charge_crystal(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.polygon([(C, 102*SCALE), (324*SCALE, 206*SCALE), (C, 378*SCALE), (188*SCALE, 206*SCALE)], fill=fill, outline=outline)
    d.polygon([(C, 126*SCALE), (292*SCALE, 210*SCALE), (C, 350*SCALE), (220*SCALE, 210*SCALE)], fill=lighten(fill, 0.22), outline=None)
    d.polygon([(C, 142*SCALE), (282*SCALE, 236*SCALE), (C, 312*SCALE), (230*SCALE, 236*SCALE)], fill=darken(fill, 0.18), outline=None)
    d.line((C, 128*SCALE, C, 352*SCALE), fill=outline or fill, width=7*SCALE)
    d.polygon([(C, 86*SCALE), (224*SCALE, 150*SCALE), (288*SCALE, 150*SCALE)], fill=lighten(fill, 0.28), outline=outline)


def draw_echo(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    for r, a in [(120, 120), (82, 170), (44, 230)]:
        d.ellipse((C-r*SCALE, C-r*SCALE, C+r*SCALE, C+r*SCALE), outline=(*fill[:3], a), width=10*SCALE)
    star = polygon_points(C, C, 34*SCALE, 8)
    d.polygon(star, fill=lighten(fill, 0.35), outline=outline)


def draw_blood_flame(d, color, shadow=False):
    draw_wildfire(d, color, shadow)
    fill = symbol_color(color, shadow)
    d.ellipse((220*SCALE, 226*SCALE, 292*SCALE, 324*SCALE), fill=darken(fill, 0.08), outline=outline_color(shadow), width=4*SCALE)


def draw_blood_rite(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.arc((150*SCALE, 102*SCALE, 362*SCALE, 314*SCALE), 28, 152, fill=fill, width=13*SCALE)
    d.arc((150*SCALE, 198*SCALE, 362*SCALE, 410*SCALE), 208, 332, fill=fill, width=13*SCALE)
    d.line((168*SCALE, C, 344*SCALE, C), fill=fill, width=12*SCALE)
    d.polygon([(C, 156*SCALE), (296*SCALE, 246*SCALE), (C, 350*SCALE), (216*SCALE, 246*SCALE)], fill=lighten(fill, 0.12), outline=outline)
    d.ellipse((226*SCALE, 214*SCALE, 286*SCALE, 306*SCALE), fill=darken(fill, 0.08), outline=outline, width=4*SCALE)
    d.line((C, 132*SCALE, C, 380*SCALE), fill=outline or fill, width=7*SCALE)


def draw_sword(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.polygon([(C, 112*SCALE), (292*SCALE, 292*SCALE), (C, 390*SCALE), (220*SCALE, 292*SCALE)], fill=fill, outline=outline)
    d.line((180*SCALE, 320*SCALE, 332*SCALE, 320*SCALE), fill=outline or fill, width=12*SCALE)
    d.rounded_rectangle((240*SCALE, 315*SCALE, 272*SCALE, 404*SCALE), radius=10*SCALE, fill=darken(fill, 0.2), outline=outline)


def draw_ward(d, color, shadow=False):
    draw_shield(d, color, shadow)
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.line((C, 198*SCALE, C, 330*SCALE), fill=outline or fill, width=8*SCALE)
    d.line((198*SCALE, C, 314*SCALE, C), fill=outline or fill, width=8*SCALE)


def draw_bolt(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    pts = [(292*SCALE, 120*SCALE), (178*SCALE, 278*SCALE), (254*SCALE, 278*SCALE), (220*SCALE, 400*SCALE), (340*SCALE, 226*SCALE), (266*SCALE, 226*SCALE)]
    d.polygon(pts, fill=fill, outline=outline)


def draw_starburst(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    pts = []
    for i in range(16):
        r = 140 if i % 2 == 0 else 58
        ang = -math.pi / 2 + i * math.tau / 16
        pts.append((int(C + math.cos(ang) * r * SCALE), int(C + math.sin(ang) * r * SCALE)))
    d.polygon(pts, fill=fill, outline=outline)
    d.ellipse((218*SCALE, 218*SCALE, 294*SCALE, 294*SCALE), fill=lighten(fill, 0.32), outline=outline)


def draw_chain(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.rounded_rectangle((140*SCALE, 192*SCALE, 278*SCALE, 284*SCALE), radius=42*SCALE, outline=fill, width=26*SCALE)
    d.rounded_rectangle((234*SCALE, 228*SCALE, 372*SCALE, 320*SCALE), radius=42*SCALE, outline=fill, width=26*SCALE)
    d.line((218*SCALE, 238*SCALE, 294*SCALE, 276*SCALE), fill=outline or fill, width=10*SCALE)
    d.line((232*SCALE, 270*SCALE, 304*SCALE, 232*SCALE), fill=outline or fill, width=10*SCALE)


def draw_skull(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.ellipse((164*SCALE, 132*SCALE, 348*SCALE, 320*SCALE), fill=fill, outline=outline, width=5*SCALE)
    d.rectangle((204*SCALE, 276*SCALE, 308*SCALE, 368*SCALE), fill=fill, outline=outline, width=5*SCALE)
    eye = darken(fill, 0.65)
    d.ellipse((198*SCALE, 214*SCALE, 238*SCALE, 254*SCALE), fill=eye)
    d.ellipse((274*SCALE, 214*SCALE, 314*SCALE, 254*SCALE), fill=eye)
    d.polygon([(C, 250*SCALE), (238*SCALE, 288*SCALE), (274*SCALE, 288*SCALE)], fill=eye)
    for x in (218, 250, 282):
        d.line((x*SCALE, 312*SCALE, x*SCALE, 360*SCALE), fill=darken(fill, 0.45), width=5*SCALE)


def draw_drop(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    pts = [(C, 118*SCALE), (340*SCALE, 282*SCALE), (C, 398*SCALE), (172*SCALE, 282*SCALE)]
    d.polygon(pts, fill=fill, outline=outline)
    d.ellipse((172*SCALE, 226*SCALE, 340*SCALE, 394*SCALE), fill=fill, outline=outline, width=5*SCALE)
    d.arc((204*SCALE, 188*SCALE, 306*SCALE, 332*SCALE), 208, 260, fill=lighten(fill, 0.35), width=9*SCALE)


def draw_slash_drop(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.line((168*SCALE, 360*SCALE, 342*SCALE, 132*SCALE), fill=fill, width=28*SCALE)
    d.line((168*SCALE, 360*SCALE, 342*SCALE, 132*SCALE), fill=outline or fill, width=8*SCALE)
    pts = [(278*SCALE, 210*SCALE), (342*SCALE, 302*SCALE), (278*SCALE, 392*SCALE), (214*SCALE, 302*SCALE)]
    d.polygon(pts, fill=fill, outline=outline)
    d.ellipse((214*SCALE, 266*SCALE, 342*SCALE, 394*SCALE), fill=fill, outline=outline, width=5*SCALE)
    d.arc((236*SCALE, 244*SCALE, 318*SCALE, 358*SCALE), 208, 260, fill=lighten(fill, 0.34), width=8*SCALE)


def draw_target(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    for r in (126, 78, 30):
        d.ellipse((C-r*SCALE, C-r*SCALE, C+r*SCALE, C+r*SCALE), outline=fill if r > 30 else outline, width=12*SCALE)
    d.line((C, 120*SCALE, C, 392*SCALE), fill=outline or fill, width=8*SCALE)
    d.line((120*SCALE, C, 392*SCALE, C), fill=outline or fill, width=8*SCALE)


def draw_down(d, color, shadow=False):
    fill = symbol_color(color, shadow)
    outline = outline_color(shadow)
    d.rounded_rectangle((232*SCALE, 120*SCALE, 280*SCALE, 286*SCALE), radius=16*SCALE, fill=fill, outline=outline, width=5*SCALE)
    pts = [(152*SCALE, 278*SCALE), (360*SCALE, 278*SCALE), (C, 398*SCALE)]
    d.polygon(pts, fill=fill, outline=outline)
    d.arc((168*SCALE, 144*SCALE, 344*SCALE, 356*SCALE), 200, 340, fill=darken(fill, 0.25), width=9*SCALE)


DRAWERS = {
    "shield": draw_shield,
    "thorns": draw_thorns,
    "fist": draw_fist,
    "flame": draw_flame,
    "wildfire": draw_wildfire,
    "charge_crystal": draw_charge_crystal,
    "echo": draw_echo,
    "blood_flame": draw_blood_flame,
    "blood_rite": draw_blood_rite,
    "sword": draw_sword,
    "ward": draw_ward,
    "bolt": draw_bolt,
    "starburst": draw_starburst,
    "chain": draw_chain,
    "skull": draw_skull,
    "drop": draw_drop,
    "slash_drop": draw_slash_drop,
    "target": draw_target,
    "down": draw_down,
}


def render_icon(spec: dict[str, str]) -> Image.Image:
    color = hex_rgba(spec["color"])
    base = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    draw_frame(base, color)

    symbol_layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    draw_symbol_shadow(DRAWERS[spec["symbol"]], symbol_layer, color)
    base.alpha_composite(symbol_layer)

    shine = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shine, "RGBA")
    sd.arc((118*SCALE, 92*SCALE, 394*SCALE, 372*SCALE), 210, 312, fill=(255, 255, 255, 72), width=6*SCALE)
    base.alpha_composite(shine)

    return base.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def main() -> None:
    manifest = []
    for spec in STATUSES:
        image = render_icon(spec)
        filename = f"status_{spec['id']}_asset_v1.png"
        image.save(OUT_DIR / filename)
        manifest.append({
            "id": spec["id"],
            "name": spec["name"],
            "kind": spec["kind"],
            "tone": spec["tone"],
            "symbol": spec["symbol"],
            "file": filename,
            "size": [SIZE, SIZE],
        })

    (OUT_DIR / "manifest.json").write_text(json.dumps({
        "version": 1,
        "style": "church stained-glass cel HUD status icons",
        "sourceSize": [SIZE, SIZE],
        "statuses": manifest,
        "extensionNote": "Add a new spec entry in generate_status_icons.py and rerun the script to create additional status icons.",
    }, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
