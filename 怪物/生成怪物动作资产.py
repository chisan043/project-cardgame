from __future__ import annotations

import math
import random
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageColor, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent
SOURCE_DIR = PROJECT_ROOT / "assets" / "source" / "enemies" / "battle"
OUTPUT_DIR = PROJECT_ROOT / "assets" / "candidates" / "enemies" / "keyframes"
PREVIEW_PATH = PROJECT_ROOT / "assets" / "candidates" / "enemies" / "review" / "enemy_keyframes_overview_v1.png"


@dataclass(frozen=True)
class MonsterSpec:
    tier: str
    aura: str
    accent: str
    fx: str


MONSTERS: dict[str, MonsterSpec] = {
    "病弱史莱姆": MonsterSpec("normal", "#86e05f", "#d7ff92", "liquid"),
    "枯骨煞兵": MonsterSpec("normal", "#8bc7d9", "#f3ead0", "bone"),
    "贪婪盗贼": MonsterSpec("normal", "#d1a043", "#fff1b4", "smoke"),
    "嗜血蝙蝠": MonsterSpec("normal", "#8f1f35", "#ff8ca3", "blood"),
    "迷途妖狐": MonsterSpec("normal", "#4fd9dd", "#d9fffb", "fire"),
    "荒野煞狼": MonsterSpec("normal", "#58749e", "#dce8ff", "shadow"),
    "千载魔蛛": MonsterSpec("normal", "#7d5bca", "#d6cbff", "web"),
    "剧毒蟾蜍": MonsterSpec("normal", "#6fca49", "#d7ff95", "poison"),
    "暴躁野猪": MonsterSpec("normal", "#d56a2d", "#ffd27d", "smoke"),
    "铁甲巨蟹": MonsterSpec("normal", "#6fa8c7", "#dff7ff", "stone"),
    "堕落剑客": MonsterSpec("elite", "#6e52c8", "#cab8ff", "fire"),
    "幽冥法师": MonsterSpec("elite", "#53b7f7", "#e0fcff", "spirit"),
    "巨力石魔": MonsterSpec("elite", "#cf9341", "#ffe6b0", "stone"),
    "魅影刺客": MonsterSpec("elite", "#8f52f2", "#edd8ff", "shadow"),
    "缝合巨怪": MonsterSpec("elite", "#b44d4d", "#ffd0bc", "flesh"),
    "【精英】狂暴牛头人": MonsterSpec("bosslite", "#c84b32", "#ffd2a8", "fire"),
    "【精英】猩红血巫": MonsterSpec("bosslite", "#b22345", "#ffc2d3", "blood"),
    "【精英】不死骨龙": MonsterSpec("bosslite", "#5db8d8", "#e1fdff", "bone"),
    "【首领】鬼面修罗": MonsterSpec("boss", "#7f4de0", "#f0ddff", "fire"),
    "【深渊主宰】": MonsterSpec("boss", "#8a3bd6", "#f4c0ff", "abyss"),
}

MONSTER_ASSET_SLUGS: dict[str, str] = {
    "病弱史莱姆": "sick_slime",
    "枯骨煞兵": "bone_soldier",
    "贪婪盗贼": "greedy_thief",
    "嗜血蝙蝠": "blood_bat",
    "迷途妖狐": "lost_fox",
    "荒野煞狼": "wild_wolf",
    "千载魔蛛": "ancient_spider",
    "剧毒蟾蜍": "venom_toad",
    "暴躁野猪": "angry_boar",
    "铁甲巨蟹": "iron_crab",
    "堕落剑客": "fallen_swordsman",
    "幽冥法师": "nether_mage",
    "巨力石魔": "stone_golem",
    "魅影刺客": "shadow_assassin",
    "缝合巨怪": "stitched_brute",
    "【精英】狂暴牛头人": "elite_minotaur",
    "【精英】猩红血巫": "crimson_blood_witch",
    "【精英】不死骨龙": "undead_bone_dragon",
    "【首领】鬼面修罗": "boss_oni_shura",
    "【深渊主宰】": "abyss_overlord",
}


ACTIONS_BY_TIER = {
    "normal": [
        "idle_front",
        "attack_start_front",
        "attack_hit_front",
        "skill_cast_front",
        "hurt_front",
        "defeat_front",
    ],
    "elite": [
        "idle_front",
        "attack_start_front",
        "attack_hit_front",
        "skill_start_front",
        "skill_cast_front",
        "hurt_front",
        "hurt_heavy_front",
        "defeat_front",
    ],
    "bosslite": [
        "idle_front",
        "attack_start_front",
        "attack_hit_front",
        "skill_start_front",
        "skill_cast_front",
        "hurt_front",
        "hurt_heavy_front",
        "enrage_front",
        "defeat_front",
    ],
    "boss": [
        "idle_front",
        "attack_start_front",
        "attack_hit_front",
        "skill1_start_front",
        "skill1_cast_front",
        "skill2_start_front",
        "skill2_cast_front",
        "hurt_front",
        "enrage_front",
        "defeat_front",
    ],
}


ACTION_POSE = {
    "idle_front": dict(scale=1.0, rotate=-1, dx=0, dy=0, glow=0.35, contrast=1.02, saturation=1.02),
    "attack_start_front": dict(scale=1.05, rotate=-7, dx=-38, dy=-24, glow=0.28, contrast=1.1, saturation=1.08),
    "attack_hit_front": dict(scale=1.11, rotate=-14, dx=-82, dy=10, glow=0.3, contrast=1.16, saturation=1.12),
    "skill_start_front": dict(scale=1.04, rotate=-3, dx=-12, dy=-28, glow=0.75, contrast=1.08, saturation=1.12),
    "skill_cast_front": dict(scale=1.1, rotate=-6, dx=-50, dy=-44, glow=1.0, contrast=1.18, saturation=1.18),
    "skill1_start_front": dict(scale=1.06, rotate=-4, dx=-18, dy=-34, glow=0.85, contrast=1.1, saturation=1.12),
    "skill1_cast_front": dict(scale=1.12, rotate=-7, dx=-60, dy=-48, glow=1.05, contrast=1.18, saturation=1.2),
    "skill2_start_front": dict(scale=1.08, rotate=1, dx=-6, dy=-48, glow=1.05, contrast=1.12, saturation=1.15),
    "skill2_cast_front": dict(scale=1.16, rotate=-10, dx=-72, dy=-54, glow=1.2, contrast=1.22, saturation=1.22),
    "hurt_front": dict(scale=0.98, rotate=11, dx=34, dy=28, glow=0.18, contrast=0.98, saturation=0.92),
    "hurt_heavy_front": dict(scale=0.95, rotate=17, dx=54, dy=52, glow=0.15, contrast=0.94, saturation=0.86),
    "enrage_front": dict(scale=1.14, rotate=-2, dx=-16, dy=-36, glow=1.1, contrast=1.2, saturation=1.22),
    "defeat_front": dict(scale=0.9, rotate=18, dx=68, dy=92, glow=0.0, contrast=0.88, saturation=0.72),
}


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    rgb = ImageColor.getrgb(hex_color)
    return (rgb[0], rgb[1], rgb[2], alpha)


def ensure_clean_output() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    for old in OUTPUT_DIR.glob("*"):
        if old.is_dir():
            for child in old.glob("*.png"):
                child.unlink()
        elif old.suffix.lower() == ".png":
            old.unlink()


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    return image.getchannel("A").getbbox() or (0, 0, image.width, image.height)


def crop_sprite(image: Image.Image) -> tuple[Image.Image, tuple[int, int, int, int]]:
    bbox = alpha_bbox(image)
    return image.crop(bbox), bbox


def recolor_glow(alpha: Image.Image, color: str, blur: int, strength: float) -> Image.Image:
    glow = alpha.filter(ImageFilter.GaussianBlur(blur))
    glow = ImageEnhance.Brightness(glow).enhance(strength)
    overlay = Image.new("RGBA", alpha.size, rgba(color, 0))
    overlay.putalpha(glow)
    return overlay


def transformed_sprite(base: Image.Image, action: str) -> tuple[Image.Image, Image.Image]:
    sprite, bbox = crop_sprite(base)
    pose = ACTION_POSE[action]
    sw = max(1, int(sprite.width * pose["scale"]))
    sh = max(1, int(sprite.height * pose["scale"]))
    sprite = sprite.resize((sw, sh), Image.Resampling.LANCZOS)
    sprite = sprite.rotate(pose["rotate"], resample=Image.Resampling.BICUBIC, expand=True)
    canvas = Image.new("RGBA", base.size, (0, 0, 0, 0))
    x = int((base.width - sprite.width) / 2 + pose["dx"])
    y = int(base.height - sprite.height - (base.height - bbox[3]) + pose["dy"])
    canvas.alpha_composite(sprite, (x, y))
    return canvas, canvas.getchannel("A")


def enhance_subject(image: Image.Image, action: str) -> Image.Image:
    pose = ACTION_POSE[action]
    image = ImageEnhance.Contrast(image).enhance(pose["contrast"])
    image = ImageEnhance.Color(image).enhance(pose["saturation"])
    if "skill" in action or action == "enrage_front":
        image = ImageEnhance.Brightness(image).enhance(1.05)
    if action == "defeat_front":
        image = ImageEnhance.Brightness(image).enhance(0.93)
    return image


def add_motion_echo(canvas: Image.Image, alpha: Image.Image, color: str, offsets: list[tuple[int, int]], opacity: int) -> None:
    for dx, dy in offsets:
        ghost = Image.new("RGBA", canvas.size, rgba(color, opacity))
        ghost.putalpha(alpha)
        ghost = ImageChops.offset(ghost, dx, dy)
        canvas.alpha_composite(ghost)


def scatter_orbs(draw: ImageDraw.ImageDraw, bounds: tuple[int, int, int, int], color: str, count: int, seed: int) -> None:
    rng = random.Random(seed)
    x1, y1, x2, y2 = bounds
    for _ in range(count):
        r = rng.randint(6, 18)
        cx = rng.randint(max(0, x1 - 40), min(x2 + 40, x2 + 160))
        cy = rng.randint(max(0, y1 - 120), y2)
        fill = rgba(color, rng.randint(64, 128))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill)


def apply_fx(canvas: Image.Image, alpha: Image.Image, bounds: tuple[int, int, int, int], monster: str, spec: MonsterSpec, action: str) -> Image.Image:
    effect = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(effect, "RGBA")
    x1, y1, x2, y2 = bounds
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2

    if action == "idle_front":
        scatter_orbs(draw, bounds, spec.accent, 5, hash((monster, action)) & 0xFFFFFFFF)

    if action == "attack_start_front":
        add_motion_echo(effect, alpha, spec.aura, [(32, 22), (54, 40)], 38)

    if action == "attack_hit_front":
        add_motion_echo(effect, alpha, spec.aura, [(26, 14), (56, 26), (84, 36)], 42)
        draw.polygon(
            [
                (max(0, x1 - 20), cy - 40),
                (max(0, x1 - 200), cy - 8),
                (max(0, x1 - 150), cy + 20),
                (max(0, x1 - 12), cy + 44),
            ],
            fill=rgba(spec.accent, 110),
        )

    if "skill" in action:
        ring_w = max(260, x2 - x1 + 100)
        ring_h = max(120, (y2 - y1) // 3)
        draw.ellipse(
            (cx - ring_w // 2, y2 - 100, cx + ring_w // 2, y2 - 20),
            outline=rgba(spec.aura, 140),
            width=8,
        )
        scatter_orbs(draw, bounds, spec.accent, 12, hash((monster, action, "skill")) & 0xFFFFFFFF)
        if spec.fx in {"fire", "blood", "poison", "abyss", "spirit"}:
            for i in range(5):
                flame_y = y1 + 30 + i * 60
                draw.ellipse((x2 - 90, flame_y, x2 + 40, flame_y + 140), fill=rgba(spec.aura, 48))

    if action == "hurt_front":
        draw.rectangle((x1 - 8, y1 - 8, x2 + 8, y2 + 8), outline=rgba("#ffffff", 84), width=5)
        draw.line((x2, y1 + 20, x2 + 120, y1 - 60), fill=rgba("#ffd8d8", 96), width=8)

    if action == "hurt_heavy_front":
        for i in range(5):
            draw.line(
                (x1 + i * 70, y1 + 20, x1 + i * 70 - 90, y2 - 10),
                fill=rgba("#ffd0d0", 90),
                width=10,
            )
        if spec.fx in {"stone", "bone"}:
            rng = random.Random(hash((monster, action, "debris")) & 0xFFFFFFFF)
            for _ in range(18):
                px = rng.randint(max(0, x1 - 40), min(canvas.width - 1, x2 + 60))
                py = rng.randint(y1, min(canvas.height - 1, y2 + 120))
                size = rng.randint(8, 24)
                draw.rectangle((px, py, px + size, py + size), fill=rgba(spec.accent, 90))

    if action == "enrage_front":
        for i in range(4):
            pad = 24 + i * 22
            draw.ellipse((x1 - pad, y1 - pad, x2 + pad, y2 + pad), outline=rgba(spec.aura, 90 - i * 15), width=10)
        scatter_orbs(draw, bounds, spec.accent, 16, hash((monster, action, "rage")) & 0xFFFFFFFF)

    if action == "defeat_front":
        draw.arc((x1 - 80, y2 - 120, x2 + 80, y2 + 60), 15, 165, fill=rgba("#ffffff", 56), width=6)
        if spec.fx in {"liquid", "flesh", "abyss"}:
            draw.ellipse((x1 - 40, y2 - 20, x2 + 40, min(canvas.height - 1, y2 + 60)), fill=rgba(spec.aura, 70))

    if spec.fx == "web" and "skill" in action:
        for angle in range(0, 180, 25):
            rad = math.radians(angle)
            length = 220
            draw.line(
                (cx, cy, cx + math.cos(rad) * length, cy - math.sin(rad) * length),
                fill=rgba(spec.aura, 80),
                width=3,
            )

    if spec.fx == "bone" and "skill" in action:
        for i in range(4):
            bx = x1 + i * max(40, (x2 - x1) // 4)
            draw.line((bx, y1 + 40, bx + 36, y1 - 40), fill=rgba(spec.accent, 120), width=8)
            draw.line((bx + 18, y1 + 20, bx + 54, y1 + 80), fill=rgba(spec.accent, 120), width=8)

    if spec.fx == "stone" and ("skill" in action or action == "attack_hit_front"):
        rng = random.Random(hash((monster, action, "stone")) & 0xFFFFFFFF)
        for _ in range(24):
            px = rng.randint(max(0, x1 - 100), min(canvas.width - 1, x2 + 100))
            py = rng.randint(max(0, y1 - 40), min(canvas.height - 1, y2 + 140))
            w = rng.randint(10, 28)
            h = rng.randint(10, 28)
            draw.rectangle((px, py, px + w, py + h), fill=rgba(spec.accent, 70))

    if spec.fx == "shadow" and ("attack" in action or "skill" in action):
        add_motion_echo(effect, alpha, "#000000", [(20, 6), (46, 16)], 28)

    if spec.fx == "liquid" and action in {"attack_hit_front", "hurt_front", "defeat_front"}:
        rng = random.Random(hash((monster, action, "liquid")) & 0xFFFFFFFF)
        for _ in range(10):
            px = rng.randint(x1 - 20, x2 + 20)
            py = rng.randint(y2 - 120, min(canvas.height - 1, y2 + 40))
            r = rng.randint(10, 24)
            draw.ellipse((px - r, py - r, px + r, py + r), fill=rgba(spec.aura, 90))

    if spec.fx == "poison" and "skill" in action:
        rng = random.Random(hash((monster, action, "poison")) & 0xFFFFFFFF)
        for _ in range(16):
            px = rng.randint(x1 - 30, x2 + 120)
            py = rng.randint(y1 - 40, y2 + 60)
            r = rng.randint(8, 22)
            draw.ellipse((px - r, py - r, px + r, py + r), outline=rgba(spec.accent, 90), width=4)

    if spec.fx == "blood" and ("attack_hit_front" in action or "skill" in action):
        rng = random.Random(hash((monster, action, "blood")) & 0xFFFFFFFF)
        for _ in range(14):
            px = rng.randint(max(0, x1 - 120), min(canvas.width - 1, x2 + 80))
            py = rng.randint(max(0, y1 - 60), min(canvas.height - 1, y2 + 140))
            rx = rng.randint(8, 26)
            ry = rng.randint(14, 34)
            draw.ellipse((px - rx, py - ry, px + rx, py + ry), fill=rgba(spec.aura, 74))

    if spec.fx == "spirit" and "skill" in action:
        for i in range(5):
            sx = x2 - 40 + i * 16
            sy = y1 + i * 48
            draw.pieslice((sx - 64, sy - 24, sx + 64, sy + 92), 180, 360, fill=rgba(spec.aura, 66))

    if spec.fx == "flesh" and action in {"hurt_front", "hurt_heavy_front", "defeat_front"}:
        rng = random.Random(hash((monster, action, "flesh")) & 0xFFFFFFFF)
        for _ in range(12):
            px = rng.randint(x1 - 40, x2 + 50)
            py = rng.randint(y1 + 40, y2 + 60)
            draw.ellipse((px - 18, py - 10, px + 18, py + 10), fill=rgba(spec.aura, 62))

    if spec.fx == "abyss":
        if "skill" in action or action == "enrage_front":
            for i in range(7):
                pad = 80 + i * 24
                draw.arc((cx - pad, cy - pad, cx + pad, cy + pad), 210, 345, fill=rgba(spec.aura, 60), width=8)
        if action == "defeat_front":
            draw.ellipse((x1 - 120, y2 - 30, x2 + 120, min(canvas.height - 1, y2 + 80)), fill=rgba(spec.aura, 96))

    return effect.filter(ImageFilter.GaussianBlur(4))


def apply_state_tint(canvas: Image.Image, alpha: Image.Image, action: str) -> Image.Image:
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    if action == "hurt_front":
        tint = Image.new("RGBA", canvas.size, rgba("#ffd0d0", 56))
        tint.putalpha(alpha.filter(ImageFilter.GaussianBlur(2)))
        overlay.alpha_composite(tint)
    elif action == "hurt_heavy_front":
        tint = Image.new("RGBA", canvas.size, rgba("#fff0f0", 86))
        tint.putalpha(alpha.filter(ImageFilter.GaussianBlur(4)))
        overlay.alpha_composite(tint)
    elif action == "defeat_front":
        fade = Image.linear_gradient("L").resize(canvas.size).rotate(90, expand=False)
        fade = ImageEnhance.Brightness(fade).enhance(0.75)
        faded = Image.new("RGBA", canvas.size, rgba("#1d1026", 120))
        faded.putalpha(ImageChops.multiply(alpha, fade))
        overlay.alpha_composite(faded)
    return overlay


def render_action(base: Image.Image, monster: str, spec: MonsterSpec, action: str) -> Image.Image:
    subject, alpha = transformed_sprite(base, action)
    subject = enhance_subject(subject, action)
    bounds = alpha_bbox(subject)

    canvas = Image.new("RGBA", base.size, (0, 0, 0, 0))
    pose = ACTION_POSE[action]
    if pose["glow"] > 0:
        canvas.alpha_composite(recolor_glow(alpha, spec.aura, 18, pose["glow"]))
        if "skill" in action or action == "enrage_front":
            canvas.alpha_composite(recolor_glow(alpha, spec.accent, 32, pose["glow"] * 0.8))

    fx = apply_fx(canvas, alpha, bounds, monster, spec, action)
    state_tint = apply_state_tint(canvas, alpha, action)

    canvas.alpha_composite(fx)
    canvas.alpha_composite(subject)
    canvas.alpha_composite(state_tint)
    return canvas


def make_preview(entries: list[tuple[str, str, Path]]) -> None:
    thumb_w = 260
    thumb_h = 340
    label_h = 56
    cols = 4
    rows = math.ceil(len(entries) / cols)
    sheet = Image.new("RGBA", (cols * thumb_w, rows * (thumb_h + label_h)), (10, 8, 14, 255))
    draw = ImageDraw.Draw(sheet, "RGBA")

    for idx, (monster, action, image_path) in enumerate(entries):
        row, col = divmod(idx, cols)
        ox = col * thumb_w
        oy = row * (thumb_h + label_h)
        draw.rounded_rectangle((ox + 8, oy + 8, ox + thumb_w - 8, oy + thumb_h + label_h - 8), radius=20, fill=(28, 22, 34, 255), outline=(120, 90, 150, 255), width=2)
        image = Image.open(image_path).convert("RGBA")
        image.thumbnail((thumb_w - 28, thumb_h - 28), Image.Resampling.LANCZOS)
        px = ox + (thumb_w - image.width) // 2
        py = oy + thumb_h - image.height - 14
        sheet.alpha_composite(image, (px, py))
        draw.text((ox + 18, oy + thumb_h + 4), monster, fill=(245, 236, 221, 255))
        draw.text((ox + 18, oy + thumb_h + 28), action, fill=(185, 172, 205, 255))

    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(PREVIEW_PATH)


def build_assets() -> list[tuple[str, str, Path]]:
    ensure_clean_output()
    preview_entries: list[tuple[str, str, Path]] = []
    for monster, spec in MONSTERS.items():
        slug = MONSTER_ASSET_SLUGS[monster]
        source_name = f"{slug}_battle_v1_source.png"
        source_path = SOURCE_DIR / source_name
        if not source_path.exists():
            raise FileNotFoundError(f"Missing source art: {source_path}")
        out_dir = OUTPUT_DIR / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        base = Image.open(source_path).convert("RGBA")
        actions = ACTIONS_BY_TIER[spec.tier]
        for action in actions:
            rendered = render_action(base, monster, spec, action)
            out_path = out_dir / f"{action}.png"
            rendered.save(out_path)
            preview_entries.append((monster, action, out_path))
    return preview_entries


if __name__ == "__main__":
    entries = build_assets()
    make_preview(entries)
    print(f"Generated {len(entries)} action frames in {OUTPUT_DIR}")
