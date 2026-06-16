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

ENEMY_PROFILES = {
    "abyss_overlord": (0.50, 0.31, 0.88, "mixed"),
    "ancient_spider": (0.50, 0.53, 0.82, "mixed"),
    "angry_boar": (0.50, 0.49, 0.92, "mixed"),
    "blood_bat": (0.50, 0.54, 0.76, "mixed"),
    "bone_soldier": (0.52, 0.24, 0.98, "mixed"),
    "boss_oni_shura": (0.50, 0.27, 0.94, "mixed"),
    "crimson_blood_witch": (0.50, 0.27, 0.98, "mixed"),
    "elite_minotaur": (0.50, 0.30, 0.98, "mixed"),
    "fallen_swordsman": (0.50, 0.27, 1.00, "mixed"),
    "greedy_thief": (0.53, 0.26, 0.98, "mixed"),
    "iron_crab": (0.50, 0.38, 0.92, "mixed"),
    "lost_fox": (0.42, 0.41, 0.46, "width"),
    "nether_mage": (0.50, 0.25, 0.98, "mixed"),
    "shadow_assassin": (0.50, 0.25, 1.00, "mixed"),
    "sick_slime": (0.50, 0.36, 1.02, "mixed"),
    "stitched_brute": (0.50, 0.26, 0.98, "mixed"),
    "stone_golem": (0.50, 0.24, 1.00, "mixed"),
    "undead_bone_dragon": (0.48, 0.50, 0.74, "mixed"),
    "venom_toad": (0.50, 0.36, 1.02, "mixed"),
    "wild_wolf": (0.38, 0.50, 0.62, "mixed"),
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
    slug = name.replace("_battle_v1_source", "")
    return ENEMY_PROFILES.get(slug, (0.5, 0.24, 1.12, "mixed"))


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
