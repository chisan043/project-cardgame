from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
SHOPKEEPER = ROOT / "source/npc/shopkeeper_alpha_fullres_v1_source.png"
W, H = 1920, 1080
RNG = random.Random(1996)


INK = (25, 19, 18, 245)
LINE = (68, 45, 32, 245)
GOLD = (220, 167, 82, 245)
GOLD_LIGHT = (255, 226, 142, 230)
TEAL = (38, 108, 112, 235)
BURGUNDY = (112, 43, 52, 235)
WALNUT = (95, 54, 32, 245)
PARCHMENT = (216, 188, 128, 235)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def cel_bg() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img, "RGBA")
    for y in range(H):
        t = y / H
        draw.line((0, y, W, y), fill=(lerp(70, 17, t), lerp(44, 24, t), lerp(30, 28, t), 255))

    # Broad cel-animation color planes.
    draw.polygon([(0, 0), (540, 0), (365, 1080), (0, 1080)], fill=(87, 46, 28, 170))
    draw.polygon([(1180, 0), (1920, 0), (1920, 1080), (1420, 1080)], fill=(18, 69, 72, 150))
    draw.polygon([(270, 170), (810, 120), (1030, 530), (620, 895), (210, 720)], fill=(129, 72, 36, 96))
    draw.polygon([(1060, 110), (1600, 170), (1780, 650), (1270, 740)], fill=(22, 87, 90, 82))
    draw.arc((-120, -20, 730, 960), 84, 272, fill=(180, 98, 42, 86), width=46)
    draw.arc((1260, -140, 2080, 860), 96, 278, fill=(42, 148, 146, 72), width=38)

    for _ in range(130):
        x = RNG.randint(0, W)
        y = RNG.randint(0, H)
        length = RNG.randint(12, 58)
        col = RNG.choice([(245, 190, 95, 42), (63, 171, 164, 40), (21, 17, 17, 58)])
        draw.line((x, y, x + length, y - RNG.randint(2, 13)), fill=col, width=1)
    return img


def outlined_round(draw: ImageDraw.ImageDraw, box, radius=18, fill=(18, 31, 35, 215), outline=GOLD, width=5):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=INK, width=width + 5)
    draw.rounded_rectangle((x1 + 2, y1 + 2, x2 - 2, y2 - 2), radius=radius, outline=outline, width=width)
    draw.rounded_rectangle((x1 + 22, y1 + 22, x2 - 22, y2 - 22), radius=max(4, radius - 9), outline=(255, 224, 145, 55), width=2)


def wood_board(draw: ImageDraw.ImageDraw, box, fill=WALNUT):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=9, fill=INK, outline=INK, width=5)
    draw.rounded_rectangle((x1 + 3, y1 + 3, x2 - 3, y2 - 3), radius=7, fill=fill, outline=GOLD, width=3)
    for _ in range(12):
        yy = RNG.randint(y1 + 12, y2 - 12)
        x = RNG.randint(x1 + 16, x2 - 96)
        draw.arc((x, yy - 12, x + RNG.randint(80, 160), yy + 14), 8, 176, fill=(154, 88, 45, 170), width=2)
    for x in range(x1 + 22, x2 - 20, 96):
        draw.ellipse((x - 5, y1 + 8, x + 5, y1 + 18), fill=(42, 24, 18, 220))


def card_stand(draw: ImageDraw.ImageDraw, x: int, y: int, fill):
    draw.rounded_rectangle((x - 62, y - 92, x + 62, y + 80), radius=12, fill=INK, outline=INK, width=6)
    draw.rounded_rectangle((x - 57, y - 87, x + 57, y + 75), radius=10, fill=fill, outline=GOLD_LIGHT, width=3)
    draw.rectangle((x - 43, y + 26, x + 43, y + 32), fill=(255, 226, 142, 125))
    draw.polygon([(x - 50, y + 74), (x + 50, y + 74), (x + 22, y + 112), (x - 30, y + 106)], fill=(53, 32, 22, 210), outline=LINE)


def relic_icon(draw: ImageDraw.ImageDraw, cx: int, cy: int, kind: str):
    draw.ellipse((cx - 46, cy - 46, cx + 46, cy + 46), fill=INK, outline=GOLD, width=5)
    draw.ellipse((cx - 34, cy - 34, cx + 34, cy + 34), fill=(24, 75, 78, 230), outline=(95, 204, 190, 170), width=3)
    if kind == "compass":
        draw.polygon([(cx, cy - 30), (cx + 16, cy + 12), (cx, cy + 28), (cx - 16, cy + 12)], fill=PARCHMENT, outline=LINE)
        draw.line((cx - 24, cy - 8, cx + 25, cy + 18), fill=(92, 212, 193, 180), width=3)
    elif kind == "vial":
        draw.rounded_rectangle((cx - 17, cy - 38, cx + 17, cy + 34), radius=12, fill=(187, 48, 63, 225), outline=GOLD_LIGHT, width=3)
        draw.rectangle((cx - 12, cy - 52, cx + 12, cy - 32), fill=(77, 48, 31, 240), outline=LINE)
    else:
        draw.regular_polygon((cx, cy, 30), n_sides=6, rotation=0.5, fill=(139, 99, 50, 240), outline=GOLD_LIGHT)
        draw.line((cx - 20, cy, cx + 20, cy), fill=(88, 221, 195, 190), width=3)
        draw.line((cx, cy - 20, cx, cy + 20), fill=(88, 221, 195, 190), width=3)


def service_tools(draw: ImageDraw.ImageDraw, offset=(0, 0), scale=1.0):
    ox, oy = offset

    def p(v: float) -> int:
        return int(v * scale)

    draw.rounded_rectangle((ox + p(0), oy + p(116), ox + p(520), oy + p(208)), radius=p(18), fill=INK, outline=INK, width=p(5))
    draw.rounded_rectangle((ox + p(5), oy + p(120), ox + p(515), oy + p(203)), radius=p(14), fill=WALNUT, outline=GOLD, width=p(3))
    draw.rounded_rectangle((ox + p(120), oy + p(16), ox + p(260), oy + p(128)), radius=p(14), fill=(52, 38, 29, 245), outline=GOLD, width=p(4))
    draw.rectangle((ox + p(150), oy + p(-22), ox + p(230), oy + p(24)), fill=(119, 74, 42, 240), outline=LINE, width=p(3))
    draw.ellipse((ox + p(176), oy + p(-42), ox + p(204), oy + p(-14)), fill=TEAL, outline=GOLD_LIGHT, width=p(3))
    draw.rounded_rectangle((ox + p(142), oy + p(70), ox + p(282), oy + p(108)), radius=p(8), fill=PARCHMENT, outline=LINE, width=p(2))
    draw.rounded_rectangle((ox + p(175), oy + p(92), ox + p(322), oy + p(132)), radius=p(8), fill=(122, 220, 207, 95), outline=(84, 213, 195, 160), width=p(3))
    draw.polygon([(ox + p(360), oy + p(36)), (ox + p(454), oy + p(154)), (ox + p(420), oy + p(162)), (ox + p(326), oy + p(48))], fill=(22, 24, 27, 245), outline=GOLD_LIGHT)
    draw.ellipse((ox + p(370), oy + p(150), ox + p(488), oy + p(196)), fill=(42, 31, 27, 240), outline=GOLD, width=p(3))
    for x in [42, 64, 86, 470, 492]:
        draw.ellipse((ox + p(x), oy + p(158), ox + p(x + 32), oy + p(176)), fill=(219, 166, 74, 225), outline=GOLD_LIGHT, width=p(2))


def make_plate() -> None:
    img = cel_bg()
    draw = ImageDraw.Draw(img, "RGBA")

    # Painted shop stall structures and safe UI recesses.
    outlined_round(draw, (44, 76, 382, 965), radius=26, fill=(20, 31, 34, 214), outline=GOLD, width=5)
    outlined_round(draw, (408, 112, 1272, 932), radius=28, fill=(17, 31, 35, 206), outline=GOLD, width=5)
    outlined_round(draw, (1304, 112, 1850, 610), radius=30, fill=(13, 29, 34, 214), outline=GOLD, width=5)
    outlined_round(draw, (1304, 642, 1850, 918), radius=26, fill=(29, 22, 25, 218), outline=GOLD, width=5)

    # Merchant alcove uses the actual game shopkeeper.
    draw.rounded_rectangle((66, 98, 336, 404), radius=18, fill=(15, 18, 20, 225), outline=GOLD, width=3)
    keeper = Image.open(SHOPKEEPER).convert("RGBA")
    keeper.thumbnail((260, 520), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", keeper.size, (0, 0, 0, 0))
    shadow.alpha_composite(keeper)
    shadow = Image.new("RGBA", keeper.size, (0, 0, 0, 150))
    img.alpha_composite(shadow, (111, 88))
    img.alpha_composite(keeper, (102, 78))
    draw.arc((86, 384, 330, 506), 180, 360, fill=GOLD, width=6)
    wood_board(draw, (70, 430, 338, 478), fill=(87, 50, 32, 246))

    # Functional tab sockets stay visibly part of the same shop counter.
    for y, fill in [(430, TEAL), (548, (94, 55, 127, 235)), (666, (48, 119, 76, 235)), (784, BURGUNDY)]:
        outlined_round(draw, (302, y, 368, y + 66), radius=12, fill=fill, outline=GOLD, width=3)
        draw.ellipse((322, y + 18, 348, y + 44), fill=(236, 216, 158, 170), outline=LINE, width=1)

    # Central shop shelves.
    for y in [376, 568, 800]:
        wood_board(draw, (470, y, 1220, y + 48), fill=WALNUT)
        for x in [552, 725, 905, 1088]:
            draw.line((x, y + 49, x - 14, y + 126), fill=INK, width=5)
            draw.line((x + 18, y + 49, x + 8, y + 126), fill=(205, 112, 51, 150), width=2)

    for x, kind in [(578, "compass"), (802, "vial"), (1030, "charm")]:
        relic_icon(draw, x, 494, kind)
    service_tools(draw, (540, 670), 0.94)

    # Right-side content recesses are empty enough for DOM cards/details.
    draw.rounded_rectangle((1366, 178, 1788, 552), radius=20, fill=(8, 18, 22, 190), outline=(92, 196, 190, 135), width=4)
    draw.line((1352, 718, 1788, 718), fill=GOLD_LIGHT, width=3)
    draw.line((1352, 760, 1748, 760), fill=(110, 190, 182, 72), width=2)

    # Top resource strip and bottom buttons.
    outlined_round(draw, (786, 30, 1268, 92), radius=18, fill=(21, 37, 39, 206), outline=GOLD, width=3)
    wood_board(draw, (1320, 954, 1580, 1024), fill=(46, 92, 96, 235))
    wood_board(draw, (1624, 954, 1870, 1024), fill=(105, 45, 47, 235))

    # Cel-style highlights, ink accents, and dust.
    draw.arc((18, 24, 402, 416), 186, 278, fill=(255, 226, 142, 72), width=10)
    draw.arc((1280, 54, 1872, 620), 275, 354, fill=(255, 226, 142, 64), width=9)
    for _ in range(92):
        x = RNG.randint(20, W - 20)
        y = RNG.randint(20, H - 20)
        col = RNG.choice([(252, 207, 106, 80), (82, 211, 196, 70), (255, 245, 180, 68)])
        draw.polygon([(x, y - 3), (x + 3, y), (x, y + 3), (x - 3, y)], fill=col)

    img = img.filter(ImageFilter.UnsharpMask(radius=1.0, percent=112, threshold=3))
    img.convert("RGB").save(OUT_DIR / "shop_art_plate_v2.png", quality=95)


def transparent_canvas(size: tuple[int, int]) -> Image.Image:
    return Image.new("RGBA", size, (0, 0, 0, 0))


def make_service_prop() -> None:
    img = transparent_canvas((720, 430))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((118, 8, 612, 388), fill=(40, 151, 145, 54))
    service_tools(draw, (92, 98), 1.0)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.0, percent=110, threshold=3))
    img.save(OUT_DIR / "shop_art_service_workbench.png")


def make_relic_tray() -> None:
    img = transparent_canvas((760, 420))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((116, 4, 650, 384), fill=(38, 150, 145, 52))
    wood_board(draw, (76, 250, 684, 348), fill=(101, 56, 34, 242))
    draw.polygon([(118, 252), (642, 252), (588, 178), (174, 178)], fill=(93, 43, 49, 238), outline=INK)
    for x, kind in [(208, "compass"), (380, "vial"), (552, "charm")]:
        draw.ellipse((x - 74, 160, x + 74, 304), fill=(43, 24, 32, 224), outline=GOLD, width=4)
        relic_icon(draw, x, 204, kind)
    for x in [104, 628]:
        draw.ellipse((x, 288, x + 36, 308), fill=(214, 164, 73, 220), outline=GOLD_LIGHT, width=2)
        draw.ellipse((x + 16, 270, x + 52, 290), fill=(197, 144, 62, 220), outline=GOLD_LIGHT, width=2)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.0, percent=110, threshold=3))
    img.save(OUT_DIR / "shop_art_relic_tray.png")


def main() -> None:
    make_plate()
    make_service_prop()
    make_relic_tray()


if __name__ == "__main__":
    main()
