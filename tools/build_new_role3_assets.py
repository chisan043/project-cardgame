#!/usr/bin/env python3
from collections import Counter, deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "角色三"
DST_DIR = ROOT / "新角色三"

LANDSCAPE = (1536, 1024)
PORTRAIT = (1024, 1536)
SELECT = (512, 1024)

BATTLE_KEYS = ("我方背面", "敌方正面")
CARD_KEYS = ("卡面插画",)


def color_distance(a, b):
    return sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5


def remove_edge_background(image):
    im = image.convert("RGBA")
    w, h = im.size
    pix = im.load()

    samples = []
    step = max(1, min(w, h) // 160)
    for x in range(0, w, step):
        samples.append(pix[x, 0][:3])
        samples.append(pix[x, h - 1][:3])
    for y in range(0, h, step):
        samples.append(pix[0, y][:3])
        samples.append(pix[w - 1, y][:3])

    keys = [color for color, _ in Counter(samples).most_common(6)]
    threshold = 32

    def is_bg(rgb):
        return any(color_distance(rgb, key) < threshold for key in keys)

    mask = bytearray(w * h)
    q = deque()

    def push(x, y):
        idx = y * w + x
        if not mask[idx] and is_bg(pix[x, y][:3]):
            mask[idx] = 1
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                push(nx, ny)

    for y in range(h):
        for x in range(w):
            if mask[y * w + x]:
                r, g, b, _ = pix[x, y]
                pix[x, y] = (r, g, b, 0)

    return im


def alpha_bbox(im):
    return im.getchannel("A").getbbox()


def fit_to_canvas(im, target_size, fill_ratio):
    im = im.convert("RGBA")
    bbox = alpha_bbox(im)
    if not bbox:
        return Image.new("RGBA", target_size, (0, 0, 0, 0))

    crop = im.crop(bbox)
    tw, th = target_size
    max_w = int(tw * fill_ratio)
    max_h = int(th * fill_ratio)
    scale = min(max_w / crop.width, max_h / crop.height)
    size = (max(1, int(crop.width * scale)), max(1, int(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    x = (tw - crop.width) // 2
    y = int((th - crop.height) * 0.52)
    canvas.alpha_composite(crop, (x, y))
    return canvas


def target_for(path):
    name = path.name
    if "角色选择" in name:
        return SELECT, 0.98
    if any(key in name for key in BATTLE_KEYS):
        return PORTRAIT, 0.9
    if any(key in name for key in CARD_KEYS):
        return PORTRAIT, 0.96
    return LANDSCAPE, 0.96


def write_manifest(files):
    manifest = """角色三美术资产清单

风格基准：
90年代日本赛璐璐奇幻动画风、传统手绘线稿、2到3阶硬边阴影、胶片时代配色、非Q版。

本次重生成果：
- 新目录交付，未覆盖旧 `角色三/` 资源。
- 按角色二交付格式整理，不附带额外独立背景图资产。
- 战斗立绘按角色二规格统一为 1024x1536 竖版透明 PNG。
- 三视图与武器设定为 1536x1024；角色选择立绘为 512x1024；卡面插画为 1024x1536。
- 战斗立绘为透明底，卡面插画保留类似角色二的完整插画构图。

已交付文件：
"""
    lines = [manifest]
    for index, file in enumerate(files, start=1):
        lines.append(f"{index}. {file.name}\n")
    lines.append(
        "\n说明：\n"
        "- 角色三定位为御姐女精灵弓箭手：长金发、长耳、墨绿色轻甲、半披风、长弓。\n"
        "- 资产用于后续排版、套框、战斗站位与动作补帧。\n"
    )
    (DST_DIR / "资产清单.txt").write_text("".join(lines), encoding="utf-8")


def main():
    DST_DIR.mkdir(exist_ok=True)
    files = []
    for src in sorted(SRC_DIR.glob("*.png")):
        im = Image.open(src)
        if im.mode != "RGBA" or "A" not in im.getbands():
            im = remove_edge_background(im)
        else:
            im = im.convert("RGBA")

        target_size, fill_ratio = target_for(src)
        out = fit_to_canvas(im, target_size, fill_ratio)
        dst = DST_DIR / src.name
        out.save(dst)
        files.append(dst)
        print(f"{dst.relative_to(ROOT)} {out.size[0]}x{out.size[1]} alpha")

    write_manifest(files)
    print(f"{(DST_DIR / '资产清单.txt').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
