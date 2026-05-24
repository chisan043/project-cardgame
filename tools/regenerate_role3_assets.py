#!/usr/bin/env python3
from pathlib import Path
from math import cos, sin, radians

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
DST_DIR = ROOT / "新角色三"

LANDSCAPE = (1536, 1024)
PORTRAIT = (1024, 1536)
SELECT = (512, 1024)

SCALE = 3

INK = (36, 29, 23, 255)
SKETCH = (92, 86, 76, 220)
HAIR = (226, 190, 103, 255)
HAIR_SHADOW = (166, 126, 56, 255)
SKIN = (238, 203, 162, 255)
SKIN_SHADOW = (191, 135, 101, 255)
GREEN = (38, 88, 56, 255)
GREEN_DARK = (19, 48, 37, 255)
GREEN_LIGHT = (92, 135, 84, 255)
CAPE = (26, 61, 42, 255)
CAPE_SHADOW = (14, 36, 31, 255)
LEATHER = (79, 52, 34, 255)
LEATHER_DARK = (43, 31, 25, 255)
GOLD = (185, 148, 70, 255)
GOLD_LIGHT = (231, 202, 116, 255)
ARROW = (226, 209, 159, 255)
FX = (108, 202, 139, 170)


FILES = [
    "角色三_三视图_配色版.png",
    "角色三_三视图_线稿版.png",
    "角色三_武器设定_长弓.png",
    "角色三_我方背面_待机.png",
    "角色三_我方背面_攻击起手.png",
    "角色三_我方背面_技能释放.png",
    "角色三_我方背面_受击.png",
    "角色三_敌方正面_待机.png",
    "角色三_敌方正面_攻击起手.png",
    "角色三_敌方正面_技能释放.png",
    "角色三_敌方正面_受击.png",
    "角色三_卡面插画_拉弓瞄准.png",
    "角色三_卡面插画_疾风连射.png",
    "角色三_角色选择_彩窗立绘.png",
]


def canvas(size):
    return Image.new("RGBA", (size[0] * SCALE, size[1] * SCALE), (0, 0, 0, 0))


def downsample(im):
    return im.resize((im.width // SCALE, im.height // SCALE), Image.Resampling.LANCZOS)


def pts(points, cx, cy, s=1, rot=0):
    a = radians(rot)
    ca, sa = cos(a), sin(a)
    out = []
    for x, y in points:
        tx, ty = x * s, y * s
        out.append((cx + tx * ca - ty * sa, cy + tx * sa + ty * ca))
    return out


def poly(draw, points, fill, outline=INK, width=5):
    draw.polygon(points, fill=fill)
    draw.line(points + [points[0]], fill=outline, width=width, joint="curve")


def line(draw, points, fill=INK, width=5):
    draw.line(points, fill=fill, width=width, joint="curve")


def ellipse(draw, box, fill, outline=INK, width=5):
    draw.ellipse(box, fill=fill, outline=outline, width=width)


def draw_bow(draw, cx, cy, s=1, rot=0, line_only=False):
    curve = [(0, -185), (26, -125), (36, -55), (24, 18), (8, 92), (0, 185)]
    bow_pts = pts(curve, cx, cy, s, rot)
    if not line_only:
        line(draw, bow_pts, LEATHER, int(14 * s))
        line(draw, bow_pts, GOLD, int(5 * s))
    line(draw, bow_pts, INK if not line_only else SKETCH, int(4 * s))
    string = pts([(0, -181), (-42, 0), (0, 181)], cx, cy, s, rot)
    line(draw, string, (235, 224, 184, 230) if not line_only else SKETCH, max(2, int(2 * s)))


def draw_arrow(draw, cx, cy, length=220, s=1, rot=0, alpha=255):
    color = (*ARROW[:3], alpha)
    outline = (*INK[:3], alpha)
    shaft = pts([(-length / 2, 0), (length / 2, 0)], cx, cy, s, rot)
    line(draw, shaft, outline, max(3, int(5 * s)))
    line(draw, shaft, color, max(1, int(2 * s)))
    head = pts([(length / 2, 0), (length / 2 - 28, -12), (length / 2 - 18, 0), (length / 2 - 28, 12)], cx, cy, s, rot)
    poly(draw, head, color, outline, max(2, int(3 * s)))
    feathers = pts([(-length / 2 + 18, 0), (-length / 2 - 14, -12), (-length / 2 + 4, 2), (-length / 2 - 14, 12)], cx, cy, s, rot)
    poly(draw, feathers, (75, 132, 81, alpha), outline, max(2, int(3 * s)))


def leaf_fx(draw, cx, cy, s=1, rot=0):
    for i, offset in enumerate((-90, -40, 18, 64, 118)):
        a = rot + i * 18 - 22
        p = pts([(offset, -18), (offset + 28, -3), (offset, 16), (offset - 22, -1)], cx, cy, s, a)
        draw.polygon(p, fill=(106, 177, 99, 110), outline=(59, 114, 69, 150))
    for r in (120, 178, 238):
        box = [cx - r * s, cy - r * 0.35 * s, cx + r * s, cy + r * 0.35 * s]
        draw.arc(box, 198 + rot, 338 + rot, fill=FX, width=max(2, int(4 * s)))


def draw_elf(draw, cx, foot_y, s=1, view="front", pose="idle", line_only=False):
    ink = SKETCH if line_only else INK
    fill_none = (0, 0, 0, 0)
    head_y = foot_y - 555 * s
    shoulder_y = foot_y - 440 * s
    hip_y = foot_y - 258 * s
    cape_sway = {"idle": 0, "attack": -30, "skill": -55, "hurt": 28}.get(pose, 0)
    body_lean = {"idle": 0, "attack": -8, "skill": -12, "hurt": 13}.get(pose, 0)
    facing = -1 if view == "back" else 1

    # Cape and hair silhouette.
    cape_pts = pts(
        [(-88, -420), (78, -420), (128 + cape_sway, -260), (82 + cape_sway, -30),
         (8, -92), (-52, -18), (-126 + cape_sway, -250)],
        cx, foot_y, s, body_lean
    )
    poly(draw, cape_pts, fill_none if line_only else CAPE, ink, max(3, int(5 * s)))
    if not line_only:
        shadow = pts([(48, -400), (120 + cape_sway, -255), (45 + cape_sway, -70), (10, -118)], cx, foot_y, s, body_lean)
        draw.polygon(shadow, fill=CAPE_SHADOW)

    hair_pts = pts(
        [(-42, -594), (40, -594), (70, -462), (48 + cape_sway, -265), (5, -330),
         (-54 + cape_sway, -232), (-76, -455)],
        cx, foot_y, s, body_lean
    )
    poly(draw, hair_pts, fill_none if line_only else HAIR, ink, max(3, int(5 * s)))
    if not line_only:
        draw.polygon(pts([(18, -574), (65, -454), (42 + cape_sway, -290), (10, -354)], cx, foot_y, s, body_lean), fill=HAIR_SHADOW)

    # Legs and boots.
    leg_l = pts([(-44, -256), (-18, -250), (-32, -56), (-72, -56)], cx, foot_y, s, body_lean)
    leg_r = pts([(34, -256), (62, -244), (88, -58), (47, -58)], cx, foot_y, s, body_lean)
    if pose == "attack":
        leg_l = pts([(-48, -252), (-20, -242), (-92, -44), (-134, -54)], cx, foot_y, s, body_lean)
        leg_r = pts([(34, -252), (65, -248), (120, -72), (78, -55)], cx, foot_y, s, body_lean)
    if pose == "hurt":
        leg_l = pts([(-50, -252), (-22, -242), (-80, -54), (-122, -60)], cx, foot_y, s, body_lean)
    for leg in (leg_l, leg_r):
        poly(draw, leg, fill_none if line_only else LEATHER_DARK, ink, max(3, int(5 * s)))
    for bx, by, br in [(-60, -48, -10), (74, -48, 10)]:
        boot = pts([(-34, -8), (24, -11), (50, 10), (0, 22), (-42, 14)], cx + bx * s, foot_y + by * s, s, br + body_lean)
        poly(draw, boot, fill_none if line_only else LEATHER, ink, max(3, int(5 * s)))

    # Torso armor and skirt plates.
    torso = pts([(-62, -438), (58, -438), (80, -304), (42, -244), (-42, -244), (-82, -304)], cx, foot_y, s, body_lean)
    poly(draw, torso, fill_none if line_only else GREEN, ink, max(3, int(5 * s)))
    if not line_only:
        draw.polygon(pts([(2, -430), (60, -414), (72, -312), (24, -250), (4, -303)], cx, foot_y, s, body_lean), fill=GREEN_DARK)
        draw.line(pts([(0, -425), (-8, -252)], cx, foot_y, s, body_lean), fill=GOLD, width=max(2, int(5 * s)))
    belt = pts([(-72, -310), (74, -310), (80, -287), (-76, -286)], cx, foot_y, s, body_lean)
    poly(draw, belt, fill_none if line_only else LEATHER, ink, max(3, int(4 * s)))
    for dx in (-42, 0, 42):
        plate = pts([(dx - 25, -286), (dx + 25, -286), (dx + 12, -203), (dx - 18, -207)], cx, foot_y, s, body_lean)
        poly(draw, plate, fill_none if line_only else GREEN_DARK, ink, max(2, int(3 * s)))

    # Head, ears, face.
    ear_l = pts([(-45, -558), (-106, -536), (-47, -512)], cx, foot_y, s, body_lean)
    ear_r = pts([(45, -558), (106, -536), (47, -512)], cx, foot_y, s, body_lean)
    if view == "side":
        ear_r = pts([(40, -556), (116, -538), (42, -514)], cx, foot_y, s, body_lean)
    for ear in (ear_l, ear_r):
        poly(draw, ear, fill_none if line_only else SKIN, ink, max(3, int(4 * s)))
    ellipse(draw, [cx - 48 * s, head_y - 42 * s, cx + 48 * s, head_y + 56 * s], fill_none if line_only else SKIN, ink, max(3, int(5 * s)))
    if not line_only and view != "back":
        draw.line([(cx - 19 * s, head_y + 5 * s), (cx - 4 * s, head_y + 7 * s)], fill=INK, width=max(2, int(3 * s)))
        draw.line([(cx + 15 * s, head_y + 5 * s), (cx + 30 * s, head_y + 2 * s)], fill=INK, width=max(2, int(3 * s)))
        draw.arc([cx - 12 * s, head_y + 24 * s, cx + 18 * s, head_y + 42 * s], 8, 172, fill=INK, width=max(1, int(2 * s)))
    bang = pts([(-52, -594), (0, -628), (52, -592), (18, -558), (-24, -566)], cx, foot_y, s, body_lean)
    poly(draw, bang, fill_none if line_only else HAIR, ink, max(3, int(5 * s)))

    # Arms and bow/arrow by pose.
    if pose in ("attack", "skill"):
        arm_l = pts([(-54, -410), (-156, -370), (-192, -330)], cx, foot_y, s, body_lean)
        arm_r = pts([(52, -405), (150, -395), (210, -360)], cx, foot_y, s, body_lean)
        bow_cx = cx + 232 * s * facing
        bow_rot = -9 if view != "back" else 11
        arrow_rot = -8 if view != "back" else 172
    elif pose == "hurt":
        arm_l = pts([(-60, -405), (-135, -470), (-176, -432)], cx, foot_y, s, body_lean)
        arm_r = pts([(56, -405), (130, -320), (168, -274)], cx, foot_y, s, body_lean)
        bow_cx = cx + 176 * s
        bow_rot = 18
        arrow_rot = -40
    else:
        arm_l = pts([(-62, -407), (-116, -314), (-138, -230)], cx, foot_y, s, body_lean)
        arm_r = pts([(62, -407), (116, -315), (140, -230)], cx, foot_y, s, body_lean)
        bow_cx = cx + 153 * s
        bow_rot = 4
        arrow_rot = -28
    for arm in (arm_l, arm_r):
        line(draw, arm, ink if line_only else LEATHER, max(5, int(13 * s)))
        if not line_only:
            line(draw, arm, SKIN, max(3, int(6 * s)))
    draw_bow(draw, bow_cx, shoulder_y + 54 * s, 0.78 * s, bow_rot, line_only)
    if pose in ("attack", "skill"):
        draw_arrow(draw, cx + 42 * s * facing, shoulder_y + 52 * s, 300, 0.82 * s, arrow_rot, 245)
        if pose == "skill" and not line_only:
            leaf_fx(draw, cx + 70 * s * facing, shoulder_y + 44 * s, 0.78 * s, arrow_rot)


def render_pose(filename, view, pose, card=False):
    im = canvas(PORTRAIT)
    draw = ImageDraw.Draw(im, "RGBA")
    if card:
        leaf_fx(draw, 512 * SCALE, 646 * SCALE, 2.0, -6 if "拉弓" in filename else -18)
        for i in range(4 if "疾风" in filename else 1):
            draw_arrow(draw, (450 + i * 55) * SCALE, (530 + i * 68) * SCALE, 650, 1.0 * SCALE, -16, 110)
        draw_elf(draw, 506 * SCALE, 1235 * SCALE, 1.28 * SCALE, "front", "skill" if "疾风" in filename else "attack")
    else:
        x = 520 if view == "front" else 492
        draw_elf(draw, x * SCALE, 1255 * SCALE, 1.28 * SCALE, view, pose)
    downsample(im).save(DST_DIR / filename)


def render_three_view(line_only=False):
    im = canvas(LANDSCAPE)
    draw = ImageDraw.Draw(im, "RGBA")
    for x, view in [(382, "front"), (768, "side"), (1138, "back")]:
        draw_elf(draw, x * SCALE, 876 * SCALE, 0.78 * SCALE, view, "idle", line_only)
    draw_bow(draw, 1368 * SCALE, 528 * SCALE, 0.75 * SCALE, 2, line_only)
    if line_only:
        for x in (382, 768, 1138):
            line(draw, [(x * SCALE - 92 * SCALE, 878 * SCALE), (x * SCALE + 92 * SCALE, 878 * SCALE)], SKETCH, 2 * SCALE)
    downsample(im).save(DST_DIR / ("角色三_三视图_线稿版.png" if line_only else "角色三_三视图_配色版.png"))


def render_weapon_sheet():
    im = canvas(LANDSCAPE)
    draw = ImageDraw.Draw(im, "RGBA")
    draw_bow(draw, 275 * SCALE, 510 * SCALE, 1.18 * SCALE, 0)
    draw_bow(draw, 585 * SCALE, 510 * SCALE, 0.92 * SCALE, -9)
    draw_bow(draw, 920 * SCALE, 510 * SCALE, 0.72 * SCALE, 14)
    draw_arrow(draw, 1165 * SCALE, 408 * SCALE, 430, 1.0 * SCALE, 0)
    draw_arrow(draw, 1165 * SCALE, 550 * SCALE, 430, 1.0 * SCALE, 0)
    for x, y in [(740, 300), (705, 705), (1240, 665)]:
        gem = [(x * SCALE, (y - 28) * SCALE), ((x + 28) * SCALE, y * SCALE), (x * SCALE, (y + 28) * SCALE), ((x - 28) * SCALE, y * SCALE)]
        poly(draw, gem, GREEN_LIGHT, INK, 4 * SCALE)
        draw.line([(x * SCALE - 17 * SCALE, y * SCALE), (x * SCALE + 18 * SCALE, y * SCALE)], fill=GOLD_LIGHT, width=3 * SCALE)
    downsample(im).save(DST_DIR / "角色三_武器设定_长弓.png")


def render_select():
    im = canvas(SELECT)
    draw = ImageDraw.Draw(im, "RGBA")
    frame = [48 * SCALE, 52 * SCALE, 464 * SCALE, 972 * SCALE]
    draw.rounded_rectangle(frame, radius=120 * SCALE, fill=(0, 0, 0, 0), outline=GOLD, width=8 * SCALE)
    draw.arc(frame, 180, 360, fill=GOLD_LIGHT, width=5 * SCALE)
    for x in (138, 256, 374):
        draw.line([(x * SCALE, 112 * SCALE), (x * SCALE, 918 * SCALE)], fill=(64, 120, 83, 90), width=2 * SCALE)
    for y in (244, 410, 596, 770):
        draw.line([(77 * SCALE, y * SCALE), (435 * SCALE, (y + 30) * SCALE)], fill=(64, 120, 83, 90), width=2 * SCALE)
    draw_elf(draw, 260 * SCALE, 890 * SCALE, 0.86 * SCALE, "front", "idle")
    downsample(im).save(DST_DIR / "角色三_角色选择_彩窗立绘.png")


def write_manifest():
    text = """角色三美术资产清单

风格基准：
90年代日本赛璐璐奇幻动画风、传统手绘线稿、2到3阶硬边阴影、胶片时代配色、非Q版。

本次重生成果：
- 根据《美术需求文档》重新生成，未读取、裁切或复用旧 `角色三/` 文件夹素材。
- 按角色二交付格式整理：设定图、武器设定、战斗关键帧、卡面插画、角色选择立绘。
- 所有 PNG 均为透明底，无独立背景图；卡面仅保留角色、箭矢与克制的赛璐璐式风元素。
- 战斗立绘与卡面插画为 1024x1536；三视图与武器设定为 1536x1024；角色选择立绘为 512x1024。

已交付文件：
"""
    for i, name in enumerate(FILES, 1):
        text += f"{i}. {name}\n"
    text += (
        "\n说明：\n"
        "- 角色三定位：成熟冷艳的女精灵弓箭手，长金发、长耳、墨绿色轻甲、半披风、修长长弓。\n"
        "- 关键识别点：后视角长发与半披风剪影、长弓持握、绿金轻甲、克制风系箭矢特效。\n"
    )
    (DST_DIR / "资产清单.txt").write_text(text, encoding="utf-8")


def main():
    DST_DIR.mkdir(exist_ok=True)
    render_three_view(line_only=False)
    render_three_view(line_only=True)
    render_weapon_sheet()
    render_pose("角色三_我方背面_待机.png", "back", "idle")
    render_pose("角色三_我方背面_攻击起手.png", "back", "attack")
    render_pose("角色三_我方背面_技能释放.png", "back", "skill")
    render_pose("角色三_我方背面_受击.png", "back", "hurt")
    render_pose("角色三_敌方正面_待机.png", "front", "idle")
    render_pose("角色三_敌方正面_攻击起手.png", "front", "attack")
    render_pose("角色三_敌方正面_技能释放.png", "front", "skill")
    render_pose("角色三_敌方正面_受击.png", "front", "hurt")
    render_pose("角色三_卡面插画_拉弓瞄准.png", "front", "attack", card=True)
    render_pose("角色三_卡面插画_疾风连射.png", "front", "skill", card=True)
    render_select()
    write_manifest()
    print(f"generated {len(FILES)} role 3 assets in {DST_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
