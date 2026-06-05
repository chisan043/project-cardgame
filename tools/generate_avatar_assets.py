from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ENEMY_OUT = ROOT / "assets/source/enemies/portraits"

ROLE_SOURCES = {
    "hero_warrior": ROOT / "assets/source/characters/warrior/select_portrait_v1_source.png",
    "hero_mage": ROOT / "assets/source/characters/mage/select_portrait_v1_source.png",
    "hero_archer": ROOT / "assets/source/characters/archer/select_portrait_v1_source.png",
}

ROLE_OUTPUTS = {
    "hero_warrior": ROOT / "assets/source/characters/warrior/avatar_portrait_v1_source.png",
    "hero_mage": ROOT / "assets/source/characters/mage/avatar_portrait_v1_source.png",
    "hero_archer": ROOT / "assets/source/characters/archer/avatar_portrait_v1_source.png",
}

ROLE_PROFILES = {
    "hero_warrior": (0.50, 0.11, 0.50, "width"),
    "hero_mage": (0.50, 0.20, 0.56, "width"),
    "hero_archer": (0.50, 0.12, 0.56, "width"),
}


def alpha_bbox(image):
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    return image.getchannel("A").getbbox()


def crop_avatar(src, dest, cx_ratio=0.5, cy_ratio=0.25, size_ratio=1.1, side_mode="mixed", out_size=384):
    image = Image.open(src).convert("RGBA")
    bbox = alpha_bbox(image) or (0, 0, image.width, image.height)
    left, top, right, bottom = bbox
    bbox_width = right - left
    bbox_height = bottom - top
    center_x = left + bbox_width * cx_ratio
    center_y = top + bbox_height * cy_ratio
    if side_mode == "width":
        side = bbox_width * size_ratio
    else:
        side = max(bbox_width * 0.46, bbox_height * 0.34) * size_ratio

    x1 = int(round(center_x - side / 2))
    y1 = int(round(center_y - side / 2))
    x2 = int(round(center_x + side / 2))
    y2 = int(round(center_y + side / 2))

    pad_left = max(0, -x1)
    pad_top = max(0, -y1)
    pad_right = max(0, x2 - image.width)
    pad_bottom = max(0, y2 - image.height)
    if any((pad_left, pad_top, pad_right, pad_bottom)):
        image = ImageOps.expand(
            image,
            border=(pad_left, pad_top, pad_right, pad_bottom),
            fill=(0, 0, 0, 0),
        )
        x1 += pad_left
        x2 += pad_left
        y1 += pad_top
        y2 += pad_top

    cropped = image.crop((x1, y1, x2, y2)).resize((out_size, out_size), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(dest)
    return dest


def monster_profile(name):
    if "lost_fox" in name:
        return (0.42, 0.41, 0.46, "width")
    if "blood_bat" in name:
        return (0.5, 0.32, 1.34, "mixed")
    if "iron_crab" in name:
        return (0.5, 0.28, 1.28, "mixed")
    if "venom_toad" in name or "sick_slime" in name:
        return (0.5, 0.36, 1.18, "mixed")
    if "ancient_spider" in name:
        return (0.5, 0.30, 1.2, "mixed")
    if "abyss_overlord" in name:
        return (0.5, 0.34, 1.16, "mixed")
    if "undead_bone_dragon" in name:
        return (0.5, 0.28, 1.24, "mixed")
    return (0.5, 0.24, 1.12, "mixed")


def write_preview(files):
    thumb = 112
    pad = 18
    cols = 6
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (thumb + pad) + pad, rows * (thumb + 42) + pad), (24, 24, 28))
    draw = ImageDraw.Draw(sheet)
    for index, file_path in enumerate(files):
        x = pad + (index % cols) * (thumb + pad)
        y = pad + (index // cols) * (thumb + 42)
        image = Image.open(file_path).convert("RGBA").resize((thumb, thumb), Image.Resampling.LANCZOS)
        bg = Image.new("RGBA", (thumb, thumb), (55, 48, 65, 255))
        bg.alpha_composite(image)
        sheet.paste(bg.convert("RGB"), (x, y))
        draw.text((x, y + thumb + 4), file_path.stem[:10], fill=(230, 220, 190))
    preview_path = ROOT / "assets/candidates/characters/avatar_crop_preview.png"
    preview_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(preview_path)


def main():
    generated = []
    for role_id, source in ROLE_SOURCES.items():
        generated.append(crop_avatar(source, ROLE_OUTPUTS[role_id], *ROLE_PROFILES[role_id]))

    for source in sorted((ROOT / "assets/source/enemies/battle").glob("*_battle_v1_source.png")):
        portrait_name = source.name.replace("_battle_v1_source.png", "_portrait_v1_source.png")
        generated.append(crop_avatar(source, ENEMY_OUT / portrait_name, *monster_profile(source.stem)))

    write_preview(generated)
    print(f"generated {len(generated)} avatar assets")


if __name__ == "__main__":
    main()
