from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path("/Users/chi/Desktop/幻境残卷/卡牌设计")
ILLUS_DIR = ROOT / "插画原图"
FRAME_DIR = ROOT / "卡框UI"
PREVIEW_DIR = ROOT / "套框预览"
SAFE_DIR = ROOT / "文案安全区"

CARD_W = 768
CARD_H = 1152
BLEED = 24
INNER_X = 58
INNER_Y = 84
INNER_W = CARD_W - INNER_X * 2
INNER_H = 760

TITLE_H = 86
TEXT_H = 184
GEM_Y = 42

FONT = ImageFont.load_default()


ASSETS = [
    (
        "勇者战士_拔剑斩",
        Path(
            "/Users/chi/.codex/generated_images/019e213e-337c-7e03-9135-93df970a97dd/ig_01c0a004989df378016a0470a3e354819681b229693e0e43c5.png"
        ),
        "warrior",
        0.0,
    ),
    (
        "勇者战士_圣剑解放",
        Path(
            "/Users/chi/.codex/generated_images/019e2141-bec6-76f2-bb95-21b07f4364f2/ig_0b983bf6e936dea9016a0470df91e88194bf5773e143c6de4e.png"
        ),
        "warrior",
        0.045,
    ),
    (
        "萝莉魔导士_火球术",
        Path(
            "/Users/chi/.codex/generated_images/019e2141-bec6-76f2-bb95-21b07f4364f2/ig_0b983bf6e936dea9016a046c70b0948194852016602da661f9.png"
        ),
        "mage",
        0.0,
    ),
    (
        "萝莉魔导士_秘仪咏唱",
        Path(
            "/Users/chi/.codex/generated_images/019e2141-bec6-76f2-bb95-21b07f4364f2/ig_0b983bf6e936dea9016a046d10c5fc8194b98b0e105bca7d6e.png"
        ),
        "mage",
        0.0,
    ),
    (
        "精灵弓箭手_拉弓瞄准",
        Path(
            "/Users/chi/.codex/generated_images/019e2141-bec6-76f2-bb95-21b07f4364f2/ig_0b983bf6e936dea9016a046daf3d80819483c550e4f7e41264.png"
        ),
        "elf",
        0.0,
    ),
    (
        "精灵弓箭手_疾风连射",
        Path(
            "/Users/chi/.codex/generated_images/019e2141-bec6-76f2-bb95-21b07f4364f2/ig_0b983bf6e936dea9016a046e5e97308194b3dc9e38803cbee3.png"
        ),
        "elf",
        0.0,
    ),
]


THEMES = {
    "warrior": {
        "name": "圣剑金红框",
        "metal": (189, 153, 76, 255),
        "dark": (56, 27, 22, 255),
        "accent": (153, 42, 40, 255),
        "gem": (224, 87, 68, 255),
    },
    "mage": {
        "name": "秘法紫金框",
        "metal": (174, 146, 84, 255),
        "dark": (33, 24, 50, 255),
        "accent": (90, 58, 126, 255),
        "gem": (128, 92, 203, 255),
    },
    "elf": {
        "name": "森灵翠金框",
        "metal": (172, 151, 92, 255),
        "dark": (27, 50, 44, 255),
        "accent": (49, 104, 84, 255),
        "gem": (73, 154, 115, 255),
    },
}


def ensure_dirs():
    for path in [ILLUS_DIR, FRAME_DIR, PREVIEW_DIR, SAFE_DIR]:
        path.mkdir(parents=True, exist_ok=True)


def resize_cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    src_w, src_h = img.size
    dst_w, dst_h = size
    src_ratio = src_w / src_h
    dst_ratio = dst_w / dst_h
    if src_ratio > dst_ratio:
        new_h = dst_h
        new_w = int(new_h * src_ratio)
    else:
        new_w = dst_w
        new_h = int(new_w / src_ratio)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - dst_w) // 2
    top = (new_h - dst_h) // 2
    return resized.crop((left, top, left + dst_w, top + dst_h))


def create_frame(theme_key: str) -> Image.Image:
    theme = THEMES[theme_key]
    frame = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)

    draw.rounded_rectangle((0, 0, CARD_W - 1, CARD_H - 1), radius=38, outline=theme["dark"], width=14)
    draw.rounded_rectangle(
        (BLEED, BLEED, CARD_W - BLEED, CARD_H - BLEED),
        radius=32,
        outline=theme["metal"],
        width=8,
    )
    draw.rounded_rectangle(
        (36, 36, CARD_W - 36, CARD_H - 36), radius=30, outline=theme["accent"], width=10
    )

    draw.rounded_rectangle(
        (48, 34, CARD_W - 48, 34 + TITLE_H),
        radius=24,
        fill=(*theme["accent"][:3], 228),
        outline=theme["metal"],
        width=5,
    )
    draw.rounded_rectangle(
        (48, CARD_H - TEXT_H - 48, CARD_W - 48, CARD_H - 48),
        radius=26,
        fill=(*theme["dark"][:3], 232),
        outline=theme["metal"],
        width=5,
    )

    draw.rounded_rectangle(
        (INNER_X - 2, INNER_Y - 2, INNER_X + INNER_W + 2, INNER_Y + INNER_H + 2),
        radius=18,
        outline=theme["metal"],
        width=4,
    )

    for x in (94, CARD_W - 94):
        draw.ellipse((x - 24, GEM_Y - 24, x + 24, GEM_Y + 24), fill=theme["gem"])
        draw.ellipse((x - 31, GEM_Y - 31, x + 31, GEM_Y + 31), outline=theme["metal"], width=5)

    corner_offset = 18
    for x1, y1, x2, y2 in [
        (56, 110, 132, 186),
        (CARD_W - 132, 110, CARD_W - 56, 186),
        (56, CARD_H - 220, 132, CARD_H - 144),
        (CARD_W - 132, CARD_H - 220, CARD_W - 56, CARD_H - 144),
    ]:
        draw.arc((x1, y1, x2, y2), 0, 270, fill=theme["metal"], width=4)
        draw.arc(
            (x1 + corner_offset, y1 + corner_offset, x2 - corner_offset, y2 - corner_offset),
            0,
            270,
            fill=theme["accent"],
            width=3,
        )

    return frame


def create_safe_overlay(theme_key: str, title: str) -> Image.Image:
    theme = THEMES[theme_key]
    overlay = create_frame(theme_key)
    draw = ImageDraw.Draw(overlay)

    guide = (*theme["gem"][:3], 180)
    draw.rectangle(
        (INNER_X, INNER_Y, INNER_X + INNER_W, INNER_Y + INNER_H),
        outline=guide,
        width=4,
    )
    draw.rectangle(
        (76, 52, CARD_W - 76, 52 + 54),
        outline=(236, 224, 186, 180),
        width=3,
    )
    draw.rectangle(
        (74, CARD_H - TEXT_H - 22, CARD_W - 74, CARD_H - 112),
        outline=(236, 224, 186, 180),
        width=3,
    )
    draw.text((88, 60), "TITLE SAFE", fill=(242, 235, 214, 255), font=FONT)
    draw.text((88, CARD_H - TEXT_H), "RULE TEXT SAFE", fill=(242, 235, 214, 255), font=FONT)
    draw.text((INNER_X + 14, INNER_Y + 14), title, fill=(255, 255, 255, 240), font=FONT)
    return overlay


def add_rules_text(base: Image.Image, card_name: str, theme_key: str) -> Image.Image:
    theme = THEMES[theme_key]
    draw = ImageDraw.Draw(base)
    name_x = 86
    name_y = 62
    draw.text((name_x, name_y), card_name, fill=(245, 233, 199, 255), font=FONT)
    subtitle = {
        "warrior": "Melee Skill / Hero Exclusive",
        "mage": "Spell Card / Hero Exclusive",
        "elf": "Ranged Skill / Hero Exclusive",
    }[theme_key]
    draw.text((86, 92), subtitle, fill=(231, 211, 162, 255), font=FONT)

    rules_y = CARD_H - TEXT_H - 8
    rules_text = {
        "warrior": "Deal heavy slash damage.\nIf this is your first attack,\ngain +1 momentum.",
        "mage": "Cast a focused spell effect.\nGenerate 1 arcane charge.\nEffects stay readable for UI.",
        "elf": "Shoot a precise ranged strike.\nIf you moved this turn,\ndraw 1 card.",
    }[theme_key]
    draw.multiline_text((86, rules_y), rules_text, fill=(228, 221, 202, 255), font=FONT, spacing=6)
    cost_box = (CARD_W - 138, 52, CARD_W - 78, 112)
    draw.ellipse(cost_box, fill=theme["gem"], outline=theme["metal"], width=4)
    draw.text((CARD_W - 118, 74), "3", fill=(255, 249, 234, 255), font=FONT)
    return base


def save_illustration(src: Path, dest_name: str, crop_ratio: float) -> Path:
    img = Image.open(src).convert("RGB")
    if crop_ratio > 0:
        w, h = img.size
        dx = int(w * crop_ratio)
        dy = int(h * crop_ratio)
        img = img.crop((dx, dy, w - dx, h - dy))
    dest = ILLUS_DIR / f"{dest_name}.png"
    img.save(dest, quality=95)
    return dest


def build_preview(art_path: Path, card_name: str, theme_key: str):
    art = Image.open(art_path).convert("RGB")
    art_cover = resize_cover(art, (INNER_W, INNER_H))

    card = Image.new("RGBA", (CARD_W, CARD_H), THEMES[theme_key]["dark"])
    bg = art_cover.filter(ImageFilter.GaussianBlur(18)).resize((CARD_W, CARD_H)).convert("RGBA")
    bg.putalpha(110)
    card.alpha_composite(bg)
    card.alpha_composite(art_cover.convert("RGBA"), (INNER_X, INNER_Y))
    card.alpha_composite(create_frame(theme_key))

    preview = add_rules_text(card, card_name, theme_key)
    preview.save(PREVIEW_DIR / f"{card_name}_套框预览.png")

    safe = preview.copy()
    safe.alpha_composite(create_safe_overlay(theme_key, card_name))
    safe.save(SAFE_DIR / f"{card_name}_安全区版.png")


def build_frame_exports():
    for key, theme in THEMES.items():
        frame = create_frame(key)
        frame.save(FRAME_DIR / f"{theme['name']}.png")
        overlay = create_safe_overlay(key, theme["name"])
        overlay.save(FRAME_DIR / f"{theme['name']}_安全区模板.png")


def build_contact_sheet():
    files = sorted(PREVIEW_DIR.glob("*_套框预览.png"))
    if not files:
        return
    thumb_w = 280
    thumb_h = int(thumb_w * CARD_H / CARD_W)
    cols = 3
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb_w + 80, rows * thumb_h + 80), (18, 20, 26))
    for idx, path in enumerate(files):
        img = Image.open(path).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = 24 + (idx % cols) * thumb_w
        y = 24 + (idx // cols) * thumb_h
        sheet.paste(img, (x, y))
    sheet.save(ROOT / "卡牌设计总览.png", quality=95)


def main():
    ensure_dirs()
    build_frame_exports()
    for name, src, theme_key, crop_ratio in ASSETS:
        art_path = save_illustration(src, name, crop_ratio)
        build_preview(art_path, name, theme_key)
    build_contact_sheet()


if __name__ == "__main__":
    main()
