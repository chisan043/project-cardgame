from __future__ import annotations

import math
import random
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "卡牌设计" / "教堂彩窗赛璐璐"
FRAME_DIR = OUT_ROOT / "卡框UI"
PREVIEW_DIR = OUT_ROOT / "套框预览"
SAFE_DIR = OUT_ROOT / "文案安全区"
EMBLEM_DIR = OUT_ROOT / "无插画卡预览"
GENERATED_ART_DIR = OUT_ROOT / "卡面插画_无框"

CARD_W = 768
CARD_H = 1152
CARD_RADIUS = 42

ART_BOX = (62, 142, 706, 824)
TITLE_BOX = (126, 48, 642, 122)
TYPE_BOX = (554, 70, 700, 118)
TEXT_BOX = (66, 850, 702, 1084)
DESC_BOX = (94, 902, 674, 1008)
TAG_BOX = (94, 1018, 674, 1066)
COST_CENTER = (82, 82)

HUD_DIR = ROOT / "UI" / "教堂彩窗赛璐璐" / "战斗HUD" / "正式资产" / "子模块"
ICON_PATHS = {
    "攻击": HUD_DIR / "图标徽记" / "icon_attack_asset_v1.png",
    "防御": HUD_DIR / "图标徽记" / "icon_defense_asset_v1.png",
    "能力": HUD_DIR / "图标徽记" / "icon_skill_asset_v1.png",
}
ENERGY_GEM = HUD_DIR / "玩家面板" / "player_energy_gem_on_asset_v1.png"

FONT_CANDIDATES = {
    "title": [
        "/System/Library/Fonts/Supplemental/Songti.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
    ],
    "body": [
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/Songti.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    ],
}


@dataclass(frozen=True)
class Theme:
    key: str
    frame_name: str
    accent: tuple[int, int, int]
    accent_dark: tuple[int, int, int]
    gem: tuple[int, int, int]


@dataclass(frozen=True)
class CardSpec:
    name: str
    role: str
    theme_key: str
    art_path: Path | None
    card_type: str
    cost: int
    value: int
    tags: tuple[str, ...]
    rarity: str


THEMES = {
    "warrior": Theme(
        key="warrior",
        frame_name="圣剑彩窗框",
        accent=(148, 45, 42),
        accent_dark=(69, 27, 27),
        gem=(212, 76, 58),
    ),
    "mage": Theme(
        key="mage",
        frame_name="秘法彩窗框",
        accent=(91, 60, 134),
        accent_dark=(39, 27, 60),
        gem=(128, 96, 203),
    ),
    "archer": Theme(
        key="archer",
        frame_name="森灵彩窗框",
        accent=(48, 104, 82),
        accent_dark=(24, 55, 48),
        gem=(69, 153, 113),
    ),
    "neutral": Theme(
        key="neutral",
        frame_name="中立彩窗框",
        accent=(56, 88, 118),
        accent_dark=(28, 41, 60),
        gem=(83, 151, 180),
    ),
}

RARITY_COLORS = {
    "普通": (145, 139, 126),
    "稀有": (112, 157, 178),
    "史诗": (157, 103, 196),
    "传说": (205, 160, 72),
    "诅咒": (144, 46, 70),
}

CARDS = [
    CardSpec(
        name="圣剑突击",
        role="勇者战士",
        theme_key="warrior",
        art_path=ROOT / "新角色一" / "角色一_卡面插画_圣剑突击.png",
        card_type="攻击",
        cost=2,
        value=12,
        tags=("圣剑", "重击"),
        rarity="稀有",
    ),
    CardSpec(
        name="遗迹立誓",
        role="勇者战士",
        theme_key="warrior",
        art_path=ROOT / "新角色一" / "角色一_卡面插画_遗迹立誓.png",
        card_type="能力",
        cost=2,
        value=6,
        tags=("庇护", "反击", "圣剑"),
        rarity="稀有",
    ),
    CardSpec(
        name="紫焰爆裂",
        role="萝莉魔导士",
        theme_key="mage",
        art_path=ROOT / "角色二" / "角色二_卡面插画_紫焰爆裂.png",
        card_type="攻击",
        cost=2,
        value=11,
        tags=("爆发", "易伤"),
        rarity="稀有",
    ),
    CardSpec(
        name="遗迹咏唱",
        role="萝莉魔导士",
        theme_key="mage",
        art_path=ROOT / "角色二" / "角色二_卡面插画_遗迹咏唱.png",
        card_type="能力",
        cost=2,
        value=0,
        tags=("咏唱", "充能", "抽牌"),
        rarity="稀有",
    ),
    CardSpec(
        name="拉弓瞄准",
        role="精灵弓箭手",
        theme_key="archer",
        art_path=ROOT / "新角色三" / "角色三_卡面插画_拉弓瞄准.png",
        card_type="能力",
        cost=1,
        value=9,
        tags=("蓄力", "抽牌"),
        rarity="稀有",
    ),
    CardSpec(
        name="疾风连射",
        role="精灵弓箭手",
        theme_key="archer",
        art_path=ROOT / "新角色三" / "角色三_卡面插画_疾风连射.png",
        card_type="攻击",
        cost=1,
        value=5,
        tags=("连射",),
        rarity="稀有",
    ),
]

def generated_art_path(role: str, name: str) -> Path:
    return GENERATED_ART_DIR / f"{role}_{name}.png"


EMBLEM_CARDS = [
    CardSpec("盾墙反身", "勇者战士", "warrior", generated_art_path("勇者战士", "盾墙反身"), "防御", 1, 10, ("反击",), "稀有"),
    CardSpec("誓约追击", "勇者战士", "warrior", generated_art_path("勇者战士", "誓约追击"), "攻击", 1, 8, ("圣剑", "连击"), "普通"),
    CardSpec("圣堂守势", "勇者战士", "warrior", generated_art_path("勇者战士", "圣堂守势"), "防御", 2, 14, ("反击", "荆棘"), "稀有"),
    CardSpec("圣剑解放", "勇者战士", "warrior", generated_art_path("勇者战士", "圣剑解放"), "攻击", 3, 18, ("圣剑", "穿甲", "重击"), "史诗"),
    CardSpec("破晓格挡", "勇者战士", "warrior", generated_art_path("勇者战士", "破晓格挡"), "防御", 1, 8, ("反击", "庇护"), "普通"),
    CardSpec("裂光一闪", "勇者战士", "warrior", generated_art_path("勇者战士", "裂光一闪"), "攻击", 1, 7, ("圣剑", "穿甲"), "普通"),
    CardSpec("王冠反斩", "勇者战士", "warrior", generated_art_path("勇者战士", "王冠反斩"), "能力", 1, 0, ("反击", "抽牌"), "稀有"),
    CardSpec("铁壁圣痕", "勇者战士", "warrior", generated_art_path("勇者战士", "铁壁圣痕"), "防御", 2, 16, ("庇护", "保留"), "史诗"),
    CardSpec("紫焰火花", "萝莉魔导士", "mage", generated_art_path("萝莉魔导士", "紫焰火花"), "攻击", 1, 7, ("爆发", "燃烧"), "普通"),
    CardSpec("魔流庇护", "萝莉魔导士", "mage", generated_art_path("萝莉魔导士", "魔流庇护"), "能力", 1, 0, ("咏唱", "治愈"), "稀有"),
    CardSpec("虚空导引", "萝莉魔导士", "mage", generated_art_path("萝莉魔导士", "虚空导引"), "能力", 2, 0, ("咏唱", "回响"), "稀有"),
    CardSpec("星火连祷", "萝莉魔导士", "mage", generated_art_path("萝莉魔导士", "星火连祷"), "能力", 2, 0, ("咏唱", "复刻", "充能"), "史诗"),
    CardSpec("星屑预兆", "萝莉魔导士", "mage", generated_art_path("萝莉魔导士", "星屑预兆"), "能力", 0, 0, ("咏唱", "销毁"), "普通"),
    CardSpec("余烬点燃", "萝莉魔导士", "mage", generated_art_path("萝莉魔导士", "余烬点燃"), "攻击", 0, 3, ("爆发", "销毁"), "普通"),
    CardSpec("法环回流", "萝莉魔导士", "mage", generated_art_path("萝莉魔导士", "法环回流"), "能力", 1, 0, ("咏唱", "充能", "抽牌"), "稀有"),
    CardSpec("裂界紫雷", "萝莉魔导士", "mage", generated_art_path("萝莉魔导士", "裂界紫雷"), "攻击", 3, 16, ("爆发", "穿甲", "回响"), "史诗"),
    CardSpec("林风整备", "精灵弓箭手", "archer", generated_art_path("精灵弓箭手", "林风整备"), "能力", 1, 6, ("自然", "蓄力"), "稀有"),
    CardSpec("猎手翻步", "精灵弓箭手", "archer", generated_art_path("精灵弓箭手", "猎手翻步"), "能力", 1, 5, ("自然", "保留"), "普通"),
    CardSpec("狩影穿枝", "精灵弓箭手", "archer", generated_art_path("精灵弓箭手", "狩影穿枝"), "攻击", 2, 10, ("连射", "穿甲"), "稀有"),
    CardSpec("森冠齐射", "精灵弓箭手", "archer", generated_art_path("精灵弓箭手", "森冠齐射"), "攻击", 2, 7, ("连射", "多段", "穿甲"), "史诗"),
    CardSpec("森息伏击", "精灵弓箭手", "archer", generated_art_path("精灵弓箭手", "森息伏击"), "能力", 0, 4, ("蓄力", "销毁"), "普通"),
    CardSpec("风羽换位", "精灵弓箭手", "archer", generated_art_path("精灵弓箭手", "风羽换位"), "能力", 1, 0, ("自然", "重置", "抽牌"), "稀有"),
    CardSpec("鹰眼贯枝", "精灵弓箭手", "archer", generated_art_path("精灵弓箭手", "鹰眼贯枝"), "攻击", 2, 12, ("蓄力", "穿甲"), "稀有"),
    CardSpec("回环箭雨", "精灵弓箭手", "archer", generated_art_path("精灵弓箭手", "回环箭雨"), "攻击", 2, 6, ("连射", "回响"), "史诗"),
    CardSpec("古誓护印", "中立法则", "neutral", generated_art_path("中立法则", "古誓护印"), "防御", 1, 8, ("保留",), "稀有"),
    CardSpec("星轨换手", "中立法则", "neutral", generated_art_path("中立法则", "星轨换手"), "能力", 1, 0, ("重置", "抽牌"), "稀有"),
    CardSpec("碎星短刃", "中立法则", "neutral", generated_art_path("中立法则", "碎星短刃"), "攻击", 0, 4, ("销毁",), "普通"),
    CardSpec("圣像微光", "中立法则", "neutral", generated_art_path("中立法则", "圣像微光"), "能力", 1, 0, ("治愈",), "普通"),
    CardSpec("回音残卷", "中立法则", "neutral", generated_art_path("中立法则", "回音残卷"), "能力", 2, 0, ("回响", "抽牌"), "史诗"),
]


def ensure_dirs() -> None:
    for path in (FRAME_DIR, PREVIEW_DIR, SAFE_DIR, EMBLEM_DIR, GENERATED_ART_DIR):
        path.mkdir(parents=True, exist_ok=True)


def font(kind: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES[kind]:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


FONTS = {
    "title": font("title", 42),
    "subtitle": font("body", 19),
    "type": font("body", 21),
    "cost": font("body", 42),
    "desc": font("body", 27),
    "tag": font("body", 21),
    "guide": font("body", 22),
    "glyph": font("title", 230),
}


def rgba(color: tuple[int, int, int], alpha: int = 255) -> tuple[int, int, int, int]:
    return (*color, alpha)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    text: str,
    fnt: ImageFont.ImageFont,
    fill: tuple[int, int, int, int],
    stroke_fill: tuple[int, int, int, int] | None = None,
    stroke_width: int = 0,
) -> None:
    width, height = text_size(draw, text, fnt)
    x = box[0] + (box[2] - box[0] - width) / 2
    y = box[1] + (box[3] - box[1] - height) / 2 - 2
    draw.text(
        (x, y),
        text,
        font=fnt,
        fill=fill,
        stroke_width=stroke_width,
        stroke_fill=stroke_fill,
    )


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def resize_cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    src_w, src_h = img.size
    dst_w, dst_h = size
    src_ratio = src_w / src_h
    dst_ratio = dst_w / dst_h
    if src_ratio > dst_ratio:
        new_h = dst_h
        new_w = round(dst_h * src_ratio)
    else:
        new_w = dst_w
        new_h = round(dst_w / src_ratio)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - dst_w) // 2
    top = (new_h - dst_h) // 2
    return resized.crop((left, top, left + dst_w, top + dst_h))


def open_asset_rgba(src_path: Path) -> Image.Image:
    src = Image.open(src_path)
    rgba_img = src.convert("RGBA")
    if "A" in src.getbands() and rgba_img.getchannel("A").getextrema()[0] < 255:
        return rgba_img

    corners = [
        rgba_img.getpixel((0, 0)),
        rgba_img.getpixel((rgba_img.width - 1, 0)),
        rgba_img.getpixel((0, rgba_img.height - 1)),
        rgba_img.getpixel((rgba_img.width - 1, rgba_img.height - 1)),
    ]
    light_corners = sum(1 for r, g, b, _ in corners if r > 230 and g > 230 and b > 230)
    if light_corners < 2:
        return rgba_img

    pixels = rgba_img.load()
    for y in range(rgba_img.height):
        for x in range(rgba_img.width):
            r, g, b, a = pixels[x, y]
            if r > 232 and g > 232 and b > 232:
                pixels[x, y] = (r, g, b, 0)
            elif r > 214 and g > 214 and b > 214:
                pixels[x, y] = (r, g, b, min(a, 90))
    return rgba_img


def paste_contain(base: Image.Image, src_path: Path, box: tuple[int, int, int, int], alpha: int = 255) -> None:
    src = open_asset_rgba(src_path)
    width = box[2] - box[0]
    height = box[3] - box[1]
    src.thumbnail((width, height), Image.Resampling.LANCZOS)
    if alpha < 255:
        src.putalpha(src.getchannel("A").point(lambda p: int(p * alpha / 255)))
    x = box[0] + (width - src.width) // 2
    y = box[1] + (height - src.height) // 2
    base.alpha_composite(src, (x, y))


def draw_stained_glass(base: Image.Image, theme: Theme, seed: str) -> None:
    rng = random.Random(seed)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for y in range(24, CARD_H - 24, 92):
        for x in range(24, CARD_W - 24, 92):
            wobble = rng.randint(-18, 18)
            color = rng.choice(
                [
                    (17, 30, 47),
                    (18, 37, 54),
                    (28, 43, 58),
                    theme.accent_dark,
                    tuple(max(0, c - 36) for c in theme.accent),
                ]
            )
            poly = [
                (x + rng.randint(-18, 14), y + rng.randint(-16, 14)),
                (x + 90 + wobble, y + rng.randint(-16, 14)),
                (x + 78 + rng.randint(-10, 18), y + 92 + rng.randint(-18, 14)),
                (x + rng.randint(-12, 18), y + 84 + rng.randint(-18, 18)),
            ]
            draw.polygon(poly, fill=rgba(color, rng.randint(26, 52)))

    for _ in range(72):
        x1 = rng.randint(34, CARD_W - 34)
        y1 = rng.randint(36, CARD_H - 36)
        length = rng.randint(64, 170)
        angle = rng.choice([0, math.pi / 4, -math.pi / 4, math.pi / 2]) + rng.uniform(-0.12, 0.12)
        x2 = int(x1 + math.cos(angle) * length)
        y2 = int(y1 + math.sin(angle) * length)
        line_color = (179, 137, 65, rng.randint(30, 66))
        draw.line((x1, y1, x2, y2), fill=line_color, width=rng.choice([1, 1, 2]))

    mask = rounded_mask((CARD_W, CARD_H), CARD_RADIUS)
    overlay.putalpha(Image.composite(overlay.getchannel("A"), Image.new("L", base.size, 0), mask))
    base.alpha_composite(overlay)


def draw_diamond(
    draw: ImageDraw.ImageDraw,
    center: tuple[int, int],
    radius: int,
    fill: tuple[int, int, int, int],
    outline: tuple[int, int, int, int],
    width: int,
) -> None:
    x, y = center
    points = [(x, y - radius), (x + radius, y), (x, y + radius), (x - radius, y)]
    draw.polygon(points, fill=fill)
    for offset in range(width):
        r = radius - offset
        draw.line([(x, y - r), (x + r, y), (x, y + r), (x - r, y), (x, y - r)], fill=outline, width=1)


def create_frame(theme: Theme) -> Image.Image:
    frame = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    gold = (189, 151, 73)
    gold_light = (236, 213, 149)
    dark = (11, 17, 25)
    slate = (21, 32, 45)
    rarity = RARITY_COLORS["稀有"]

    draw.rounded_rectangle((22, 18, CARD_W - 22, CARD_H - 22), radius=CARD_RADIUS, outline=rgba(gold, 245), width=6)
    draw.rounded_rectangle((34, 32, CARD_W - 34, CARD_H - 34), radius=34, outline=rgba(gold_light, 200), width=2)
    draw.rounded_rectangle((44, 42, CARD_W - 44, CARD_H - 44), radius=30, outline=rgba(theme.accent, 220), width=5)
    draw.rounded_rectangle((54, 52, CARD_W - 54, CARD_H - 54), radius=24, outline=rgba(gold, 175), width=2)

    draw.rounded_rectangle(TITLE_BOX, radius=18, fill=rgba(theme.accent_dark, 238), outline=rgba(gold_light, 230), width=3)
    draw.rounded_rectangle((TITLE_BOX[0] + 12, TITLE_BOX[1] + 11, TITLE_BOX[2] - 12, TITLE_BOX[3] - 11), radius=10, outline=rgba(gold, 150), width=1)

    draw.rounded_rectangle((ART_BOX[0] - 10, ART_BOX[1] - 10, ART_BOX[2] + 10, ART_BOX[3] + 10), radius=18, outline=rgba(gold, 225), width=4)
    draw.rounded_rectangle((ART_BOX[0] - 2, ART_BOX[1] - 2, ART_BOX[2] + 2, ART_BOX[3] + 2), radius=12, outline=rgba(gold_light, 180), width=2)

    draw.rounded_rectangle(TEXT_BOX, radius=22, fill=(16, 21, 29, 238), outline=rgba(gold, 220), width=4)
    draw.rounded_rectangle((TEXT_BOX[0] + 12, TEXT_BOX[1] + 12, TEXT_BOX[2] - 12, TEXT_BOX[3] - 12), radius=15, outline=rgba(theme.accent, 135), width=2)
    draw.line((TEXT_BOX[0] + 28, 892, TEXT_BOX[2] - 28, 892), fill=rgba(gold, 150), width=2)
    draw.line((TAG_BOX[0], TAG_BOX[1] - 10, TAG_BOX[2], TAG_BOX[1] - 10), fill=rgba(gold, 130), width=1)

    draw.rounded_rectangle(TYPE_BOX, radius=18, fill=rgba((15, 22, 31), 240), outline=rgba(gold_light, 220), width=3)
    draw.rectangle((TYPE_BOX[0] + 18, TYPE_BOX[1] + 7, TYPE_BOX[0] + 52, TYPE_BOX[3] - 7), fill=rgba(theme.accent_dark, 140))

    for cx, cy, flip_x, flip_y in [
        (72, 82, 1, 1),
        (CARD_W - 72, 82, -1, 1),
        (72, CARD_H - 82, 1, -1),
        (CARD_W - 72, CARD_H - 82, -1, -1),
    ]:
        gem_color = rarity if cy < 200 else theme.gem
        draw.ellipse((cx - 19, cy - 19, cx + 19, cy + 19), fill=rgba(gem_color, 235), outline=rgba(gold_light, 230), width=3)
        arc_box = (cx - 48, cy - 48, cx + 48, cy + 48)
        draw.arc(arc_box, 0, 360, fill=rgba(gold, 130), width=2)
        draw.line((cx, cy, cx + flip_x * 58, cy), fill=rgba(gold, 150), width=2)
        draw.line((cx, cy, cx, cy + flip_y * 48), fill=rgba(gold, 125), width=2)

    draw_diamond(draw, COST_CENTER, 48, rgba((18, 37, 55), 245), rgba(gold_light, 245), 4)
    draw_diamond(draw, COST_CENTER, 36, rgba(theme.accent_dark, 230), rgba(theme.gem, 210), 2)

    return frame


def create_card_base(theme: Theme, seed: str) -> Image.Image:
    card = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    draw.rounded_rectangle((22, 18, CARD_W - 22, CARD_H - 22), radius=CARD_RADIUS, fill=(10, 15, 23, 255))
    draw_stained_glass(card, theme, seed)
    return card


def create_art_layer(card: CardSpec) -> Image.Image:
    if card.art_path is None or not card.art_path.exists():
        return create_emblem_layer(card)
    art = Image.open(card.art_path).convert("RGB")
    art = resize_cover(art, (ART_BOX[2] - ART_BOX[0], ART_BOX[3] - ART_BOX[1])).convert("RGBA")
    art = ImageEnhanceLike.cel_unify(art)

    layer = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
    glow = art.filter(ImageFilter.GaussianBlur(16))
    glow.putalpha(96)
    layer.alpha_composite(glow, (ART_BOX[0], ART_BOX[1]))
    layer.alpha_composite(art, (ART_BOX[0], ART_BOX[1]))
    return layer


def draw_starburst(draw: ImageDraw.ImageDraw, center: tuple[int, int], radius: int, points: int, fill: tuple[int, int, int, int]) -> None:
    cx, cy = center
    coords = []
    for index in range(points * 2):
        angle = -math.pi / 2 + index * math.pi / points
        r = radius if index % 2 == 0 else radius * 0.46
        coords.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
    draw.polygon(coords, fill=fill)


def draw_sword(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, angle: float, blade: tuple[int, int, int], hilt: tuple[int, int, int]) -> None:
    cx, cy = center
    length = 330 * scale
    width = 28 * scale
    guard = 78 * scale

    def transform(px: float, py: float) -> tuple[float, float]:
        ca = math.cos(angle)
        sa = math.sin(angle)
        return cx + px * ca - py * sa, cy + px * sa + py * ca

    blade_poly = [
        transform(0, -length * 0.52),
        transform(width, length * 0.22),
        transform(0, length * 0.38),
        transform(-width, length * 0.22),
    ]
    draw.polygon(blade_poly, fill=rgba(blade, 238), outline=rgba((245, 226, 156), 230))
    draw.line([transform(0, -length * 0.44), transform(0, length * 0.28)], fill=rgba((255, 248, 210), 185), width=max(2, int(3 * scale)))
    draw.line([transform(-guard, length * 0.34), transform(guard, length * 0.34)], fill=rgba(hilt, 240), width=max(8, int(13 * scale)))
    draw.line([transform(0, length * 0.36), transform(0, length * 0.58)], fill=rgba((86, 50, 30), 245), width=max(9, int(16 * scale)))
    draw.line([transform(0, length * 0.36), transform(0, length * 0.58)], fill=rgba((236, 205, 132), 145), width=max(2, int(4 * scale)))
    pommel = transform(0, length * 0.62)
    r = 13 * scale
    draw.ellipse((pommel[0] - r, pommel[1] - r, pommel[0] + r, pommel[1] + r), fill=rgba(hilt, 245), outline=rgba((246, 226, 155), 220), width=2)


def draw_attack_scene(draw: ImageDraw.ImageDraw, panel: Image.Image, theme: Theme, width: int, height: int, rng: random.Random) -> None:
    center = (width // 2, height // 2 - 8)
    draw_starburst(draw, center, 245, 9, rgba(theme.accent, 72))
    draw_starburst(draw, (center[0] + 18, center[1] - 16), 172, 8, rgba((228, 163, 64), 52))
    draw_sword(draw, (center[0] - 34, center[1] + 12), 1.05, -0.72, (221, 216, 188), (191, 138, 62))
    draw_sword(draw, (center[0] + 44, center[1] + 8), 0.98, 0.72, (188, 204, 202), (178, 125, 58))
    for offset in (-105, -62, -18, 40, 92):
        draw.line(
            (center[0] - 265, center[1] + offset + 110, center[0] + 280, center[1] + offset - 138),
            fill=rgba((247, 210, 104), 120),
            width=rng.choice([3, 4, 5]),
        )
    draw.arc((center[0] - 252, center[1] - 238, center[0] + 252, center[1] + 238), 212, 326, fill=rgba((255, 225, 116), 170), width=8)


def draw_defense_scene(draw: ImageDraw.ImageDraw, panel: Image.Image, theme: Theme, width: int, height: int, rng: random.Random) -> None:
    center = (width // 2, height // 2 - 14)
    for index, radius in enumerate((262, 218, 174)):
        draw.arc((center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius), 200, 340, fill=rgba((110, 177, 214), 82 + index * 34), width=8)
        draw.arc((center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius), 20, 160, fill=rgba((236, 213, 149), 52), width=4)
    shield = [
        (center[0], center[1] - 228),
        (center[0] + 168, center[1] - 148),
        (center[0] + 132, center[1] + 98),
        (center[0], center[1] + 238),
        (center[0] - 132, center[1] + 98),
        (center[0] - 168, center[1] - 148),
    ]
    draw.polygon(shield, fill=rgba((31, 73, 96), 235), outline=rgba((236, 213, 149), 235))
    inner = [
        (center[0], center[1] - 180),
        (center[0] + 115, center[1] - 118),
        (center[0] + 92, center[1] + 68),
        (center[0], center[1] + 176),
        (center[0] - 92, center[1] + 68),
        (center[0] - 115, center[1] - 118),
    ]
    draw.polygon(inner, fill=rgba(theme.accent_dark, 205), outline=rgba((185, 147, 74), 210))
    draw.line((center[0], center[1] - 176, center[0], center[1] + 168), fill=rgba((236, 213, 149), 160), width=4)
    for y in range(center[1] - 120, center[1] + 140, 72):
        draw.line((center[0] - 98, y, center[0] + 98, y + rng.randint(-12, 12)), fill=rgba((236, 213, 149), 92), width=2)
    for x in range(center[0] - 230, center[0] + 240, 78):
        draw.rectangle((x, center[1] + 190 + rng.randint(-8, 8), x + 52, center[1] + 230 + rng.randint(-8, 8)), fill=rgba((43, 58, 66), 130), outline=rgba((172, 137, 76), 58))


def draw_skill_scene(draw: ImageDraw.ImageDraw, panel: Image.Image, theme: Theme, width: int, height: int, rng: random.Random) -> None:
    center = (width // 2, height // 2 - 12)
    for radius, alpha, line_width in [(240, 138, 6), (196, 108, 4), (142, 150, 4), (82, 170, 3)]:
        draw.ellipse((center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius), outline=rgba((214, 176, 91), alpha), width=line_width)
    for angle in [i * math.pi / 6 for i in range(12)]:
        x1 = center[0] + math.cos(angle) * 76
        y1 = center[1] + math.sin(angle) * 76
        x2 = center[0] + math.cos(angle) * 232
        y2 = center[1] + math.sin(angle) * 232
        draw.line((x1, y1, x2, y2), fill=rgba(theme.gem, 112), width=3)
    draw_starburst(draw, center, 178, 7, rgba(theme.gem, 86))
    draw_starburst(draw, center, 108, 8, rgba((241, 216, 141), 72))
    for index in range(18):
        angle = index * math.tau / 18
        x = center[0] + math.cos(angle) * 205
        y = center[1] + math.sin(angle) * 205
        tick = rng.choice(["I", "V", "X", "*"])
        draw.text((x - 8, y - 11), tick, font=FONTS["subtitle"], fill=rgba((232, 213, 152), 115))
    crystal = [
        (center[0], center[1] - 108),
        (center[0] + 78, center[1] - 18),
        (center[0] + 36, center[1] + 114),
        (center[0] - 36, center[1] + 114),
        (center[0] - 78, center[1] - 18),
    ]
    draw.polygon(crystal, fill=rgba(theme.gem, 182), outline=rgba((244, 225, 154), 220))
    draw.line((center[0], center[1] - 92, center[0], center[1] + 96), fill=rgba((255, 246, 204), 142), width=3)
    glow = Image.new("RGBA", panel.size, (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    for radius in (120, 190, 260):
        gdraw.ellipse((center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius), outline=rgba(theme.gem, 34), width=16)
    panel.alpha_composite(glow.filter(ImageFilter.GaussianBlur(8)))


def draw_tag_accents(draw: ImageDraw.ImageDraw, card: CardSpec, theme: Theme, width: int, height: int) -> None:
    tag_color = {
        "剧毒": (72, 156, 95),
        "治愈": (103, 177, 117),
        "荆棘": (73, 140, 96),
        "充能": (98, 190, 218),
        "抽牌": (216, 184, 110),
        "穿甲": (224, 204, 143),
        "多段": (228, 188, 84),
        "易伤": (164, 86, 171),
        "虚弱": (118, 118, 140),
        "回响": (135, 103, 196),
        "圣剑": (232, 196, 96),
        "反击": (214, 170, 92),
        "庇护": (112, 170, 214),
        "爆发": (178, 94, 226),
        "咏唱": (132, 102, 214),
        "燃烧": (226, 116, 66),
        "蓄力": (79, 176, 119),
        "自然": (98, 190, 128),
        "连射": (132, 205, 166),
    }
    x = 72
    y = height - 72
    for tag in card.tags[:4]:
        color = tag_color.get(tag, theme.gem)
        draw.rounded_rectangle((x, y, x + 92, y + 30), radius=8, fill=rgba((8, 13, 20), 185), outline=rgba(color, 170), width=2)
        draw.text((x + 16, y + 2), tag[:2], font=FONTS["tag"], fill=rgba(color, 235))
        x += 104


def create_emblem_layer(card: CardSpec) -> Image.Image:
    theme = THEMES[card.theme_key]
    layer = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
    panel = Image.new("RGBA", (ART_BOX[2] - ART_BOX[0], ART_BOX[3] - ART_BOX[1]), rgba((10, 17, 25), 245))
    draw = ImageDraw.Draw(panel)
    width, height = panel.size

    draw.rectangle((0, 0, width, height), fill=rgba((11, 18, 28), 245))
    rng = random.Random(card.name)
    for y in range(-20, height, 96):
        for x in range(-20, width, 96):
            color = rng.choice([(14, 28, 43), theme.accent_dark, (22, 36, 50), (10, 22, 34)])
            poly = [
                (x + rng.randint(-10, 22), y + rng.randint(-10, 18)),
                (x + 88 + rng.randint(-18, 14), y + rng.randint(-10, 18)),
                (x + 82 + rng.randint(-16, 18), y + 88 + rng.randint(-14, 16)),
                (x + rng.randint(-12, 20), y + 82 + rng.randint(-14, 16)),
            ]
            draw.polygon(poly, fill=rgba(color, rng.randint(110, 170)))

    for x in range(36, width, 92):
        draw.line((x, 0, x - 72, height), fill=(181, 141, 70, 52), width=1)
    for y in range(54, height, 112):
        draw.line((0, y, width, y - 76), fill=(181, 141, 70, 40), width=1)

    glyph = {"攻击": "攻", "防御": "守", "能力": "术"}.get(card.card_type, "法")
    glyph_w, glyph_h = text_size(draw, glyph, FONTS["glyph"])
    draw.text(
        ((width - glyph_w) / 2, (height - glyph_h) / 2 - 28),
        glyph,
        font=FONTS["glyph"],
        fill=rgba(theme.gem, 42),
        stroke_width=2,
        stroke_fill=rgba((230, 194, 110), 42),
    )

    if card.card_type == "攻击":
        draw_attack_scene(draw, panel, theme, width, height, rng)
    elif card.card_type == "防御":
        draw_defense_scene(draw, panel, theme, width, height, rng)
    else:
        draw_skill_scene(draw, panel, theme, width, height, rng)

    draw_tag_accents(draw, card, theme, width, height)

    vignette = Image.new("L", panel.size, 0)
    vdraw = ImageDraw.Draw(vignette)
    vdraw.ellipse((-120, -80, width + 120, height + 120), fill=235)
    shade = Image.new("RGBA", panel.size, (0, 0, 0, 92))
    shade.putalpha(Image.eval(vignette, lambda p: 100 - int(p * 0.34)))
    panel.alpha_composite(shade)

    layer.alpha_composite(panel, (ART_BOX[0], ART_BOX[1]))
    return layer


class ImageEnhanceLike:
    @staticmethod
    def cel_unify(img: Image.Image) -> Image.Image:
        # A restrained pass: keeps the source art intact while nudging it toward
        # the lower-gloss HUD palette used by the surrounding frame.
        rgb = img.convert("RGB")
        lut = []
        for value in range(256):
            shifted = int(max(0, min(255, (value - 8) * 1.04 + 8)))
            lut.append(shifted)
        rgb = rgb.point(lut * 3)
        return rgb.convert("RGBA")


def rule_text(card: CardSpec) -> str:
    tags = [tag for tag in card.tags if tag not in {"放逐", "销毁", "回响"}]
    if card.card_type == "攻击":
        text = f"造成 {card.value} 点伤害。"
        if tags:
            text += "\n附带 " + "、".join(f"「{tag}」" for tag in tags) + "。"
        return text
    if card.card_type == "防御":
        text = f"获得 {card.value} 点护盾。"
        if tags:
            text += "\n附带 " + "、".join(f"「{tag}」" for tag in tags) + "。"
        return text
    if tags:
        return "施展 " + "、".join(f"「{tag}」" for tag in tags) + "。"
    return "发动一项能力效果。"


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for raw_line in text.splitlines():
        current = ""
        for char in raw_line:
            trial = current + char
            if text_size(draw, trial, fnt)[0] <= max_width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = char
        if current:
            lines.append(current)
    return lines


def draw_card_text(card_img: Image.Image, card: CardSpec, theme: Theme) -> None:
    draw = ImageDraw.Draw(card_img)
    gold_light = (240, 223, 172, 255)
    gold = (198, 159, 79, 255)
    ink = (232, 225, 204, 255)

    draw_centered_text(draw, TITLE_BOX, card.name, FONTS["title"], gold_light, (0, 0, 0, 180), 2)
    draw.text((100, 870), f"{card.role} / {card.rarity}", font=FONTS["subtitle"], fill=(208, 184, 126, 255))

    type_icon = ICON_PATHS[card.card_type]
    paste_contain(card_img, type_icon, (566, 76, 606, 112), alpha=245)
    draw.text((613, 80), card.card_type, font=FONTS["type"], fill=gold_light, stroke_width=1, stroke_fill=(0, 0, 0, 180))

    paste_contain(card_img, ENERGY_GEM, (58, 40, 106, 122), alpha=210)
    draw_centered_text(draw, (56, 48, 108, 108), str(card.cost), FONTS["cost"], (255, 247, 214, 255), (0, 0, 0, 220), 2)

    desc_lines = wrap_text(draw, rule_text(card), FONTS["desc"], DESC_BOX[2] - DESC_BOX[0])
    y = DESC_BOX[1]
    for line in desc_lines[:4]:
        draw.text((DESC_BOX[0], y), line, font=FONTS["desc"], fill=ink, stroke_width=1, stroke_fill=(0, 0, 0, 160))
        y += 38

    x = TAG_BOX[0]
    for tag in card.tags:
        label = f" {tag} "
        width, height = text_size(draw, label, FONTS["tag"])
        chip = (x, TAG_BOX[1], x + width + 20, TAG_BOX[1] + 34)
        draw.rounded_rectangle(chip, radius=8, fill=rgba(theme.accent_dark, 235), outline=gold, width=2)
        draw.text((x + 10, TAG_BOX[1] + 3), label, font=FONTS["tag"], fill=(236, 222, 176, 255))
        x += width + 30


def build_card(card: CardSpec) -> Image.Image:
    theme = THEMES[card.theme_key]
    image = create_card_base(theme, card.name)
    image.alpha_composite(create_art_layer(card))
    image.alpha_composite(create_frame(theme))
    draw_card_text(image, card, theme)
    return image


def export_generated_art(card: CardSpec) -> None:
    if card.art_path is None or card.art_path.exists():
        return
    layer = create_emblem_layer(card)
    art = layer.crop(ART_BOX)
    art.save(card.art_path)


def draw_safe_overlay(card_img: Image.Image, card: CardSpec) -> Image.Image:
    safe = card_img.copy()
    overlay = Image.new("RGBA", safe.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    guide = (238, 218, 139, 210)
    accent = rgba(THEMES[card.theme_key].gem, 190)
    zones = [
        ("标题安全区", TITLE_BOX),
        ("插画安全区", ART_BOX),
        ("规则文字安全区", DESC_BOX),
        ("标签安全区", TAG_BOX),
    ]
    for label, box in zones:
        draw.rounded_rectangle(box, radius=8, outline=guide, width=3)
        label_box = (box[0] + 8, box[1] + 8, box[0] + 154, box[1] + 38)
        draw.rounded_rectangle(label_box, radius=6, fill=(7, 10, 16, 205), outline=accent, width=1)
        draw.text((label_box[0] + 8, label_box[1] + 4), label, font=FONTS["guide"], fill=guide)
    safe.alpha_composite(overlay)
    return safe


def build_frame_exports() -> None:
    for theme in THEMES.values():
        frame = create_card_base(theme, theme.key)
        frame.alpha_composite(create_frame(theme))
        frame.save(FRAME_DIR / f"{theme.frame_name}.png")

        safe = frame.copy()
        blank_spec = next((card for card in [*CARDS, *EMBLEM_CARDS] if card.theme_key == theme.key), CARDS[0])
        draw_safe_overlay(safe, blank_spec).save(FRAME_DIR / f"{theme.frame_name}_安全区模板.png")


def build_contact_sheet(preview_paths: list[Path], output_path: Path, cols: int = 3) -> None:
    thumb_w = 280
    thumb_h = int(thumb_w * CARD_H / CARD_W)
    rows = math.ceil(len(preview_paths) / cols)
    pad = 24
    gap = 16
    sheet_w = cols * thumb_w + pad * 2 + (cols - 1) * gap
    sheet_h = rows * thumb_h + pad * 2 + (rows - 1) * gap
    if len(preview_paths) == 6 and cols == 3:
        sheet_h = max(sheet_h, sheet_w)
    sheet = Image.new("RGB", (sheet_w, sheet_h), (15, 18, 24))
    for index, path in enumerate(preview_paths):
        img = Image.open(path).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = pad + (index % cols) * (thumb_w + gap)
        y = pad + (index // cols) * (thumb_h + gap)
        sheet.paste(img, (x, y))
    sheet.save(output_path, quality=95)


def main() -> None:
    ensure_dirs()
    build_frame_exports()

    preview_paths: list[Path] = []
    for card in CARDS:
        output_name = f"{card.role}_{card.name}"
        card_img = build_card(card)
        preview_path = PREVIEW_DIR / f"{output_name}_套框预览.png"
        safe_path = SAFE_DIR / f"{output_name}_安全区版.png"
        card_img.save(preview_path)
        draw_safe_overlay(card_img, card).save(safe_path)
        preview_paths.append(preview_path)

    emblem_paths: list[Path] = []
    for card in EMBLEM_CARDS:
        export_generated_art(card)
        output_name = f"{card.role}_{card.name}"
        card_img = build_card(card)
        emblem_path = EMBLEM_DIR / f"{output_name}_无插画预览.png"
        card_img.save(emblem_path)
        emblem_paths.append(emblem_path)

    build_contact_sheet(preview_paths, OUT_ROOT / "卡牌设计总览.png", cols=3)
    build_contact_sheet(emblem_paths, OUT_ROOT / "无插画卡设计总览.png", cols=4)
    build_contact_sheet([*preview_paths, *emblem_paths], OUT_ROOT / "全卡池设计总览.png", cols=4)
    print(f"Built {len(preview_paths)} illustrated previews and {len(emblem_paths)} no-art previews under {OUT_ROOT}")


if __name__ == "__main__":
    main()
