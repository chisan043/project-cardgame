#!/usr/bin/env python3
"""Generate WebP runtime assets and rewrite page references.

This keeps the original art files intact while making the GitHub Pages build
request lighter WebP files for the assets the demo actually uses.
"""

from __future__ import annotations

import argparse
import glob
import json
import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]

TEXT_TARGETS = [
    Path("幻境残卷demo_v0.99.html"),
    Path("hud-runtime.js"),
    Path("hud-layout-data.js"),
    Path("src/data/cards.js"),
    Path("src/data/characters.js"),
    Path("src/data/enemies.js"),
    Path("src/data/relics.js"),
]

IMAGE_LITERAL_RE = re.compile(r"(?P<path>[^'\"()<>`\\]+?\.(?:png|jpg|jpeg|webp))", re.IGNORECASE)
IMAGE_EXT_RE = re.compile(r"\.(png|jpg|jpeg)$", re.IGNORECASE)

DYNAMIC_IMAGE_GLOBS = [
    "assets/source/enemies/battle/*.png",
    "assets/source/enemies/portraits/*.png",
    "UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/状态栏/状态图标/status_*_asset_v1.png",
    "遗物/图标/*.png",
]


def normalize_path(raw: str) -> str:
    return raw.split("?", 1)[0].strip()


def webp_path_for(asset_path: Path) -> Path:
    path = asset_path.as_posix()
    if path.startswith("assets/source/enemies/battle/") and path.endswith("_battle_v1_source.png"):
        return Path(path.replace("assets/source/enemies/battle/", "assets/enemies/battle/").replace("_battle_v1_source.png", "_battle_v1.webp"))
    if path.startswith("assets/source/enemies/portraits/") and path.endswith("_portrait_v1_source.png"):
        return Path(path.replace("assets/source/enemies/portraits/", "assets/enemies/portraits/").replace("_portrait_v1_source.png", "_portrait_v1.webp"))
    return asset_path.with_suffix(".webp")


def collect_static_asset_paths() -> set[Path]:
    paths: set[Path] = set()
    for target in TEXT_TARGETS:
        text_path = ROOT / target
        if not text_path.exists():
            continue
        text = text_path.read_text(encoding="utf-8")
        for match in IMAGE_LITERAL_RE.finditer(text):
            raw = normalize_path(match.group("path"))
            if raw.startswith(("http://", "https://", "data:", "blob:", "input:")):
                continue
            asset_path = ROOT / raw
            if asset_path.suffix.lower() == ".webp":
                for source_suffix in (".png", ".jpg", ".jpeg"):
                    source = asset_path.with_suffix(source_suffix)
                    if source.is_file():
                        paths.add(source.relative_to(ROOT))
                        break
                continue
            if asset_path.is_file():
                paths.add(Path(raw))
    return paths


def collect_dynamic_asset_paths() -> set[Path]:
    paths: set[Path] = set()
    for pattern in DYNAMIC_IMAGE_GLOBS:
        for path in glob.glob(str(ROOT / pattern)):
            file_path = Path(path)
            if file_path.is_file():
                paths.add(file_path.relative_to(ROOT))
    return paths


def convert_to_webp(source_rel: Path, quality: int, force: bool) -> dict | None:
    source = ROOT / source_rel
    target = webp_path_for(source)
    if not force and target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return {
            "source": str(source_rel),
            "webp": str(target.relative_to(ROOT)),
            "sourceBytes": source.stat().st_size,
            "webpBytes": target.stat().st_size,
            "status": "cached",
        }

    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image.load()
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(target, "WEBP", quality=quality, method=6)

    return {
        "source": str(source_rel),
        "webp": str(target.relative_to(ROOT)),
        "sourceBytes": source.stat().st_size,
        "webpBytes": target.stat().st_size,
        "status": "generated",
    }


def should_rewrite(record: dict, min_saving_ratio: float) -> bool:
    source = record["sourceBytes"]
    webp = record["webpBytes"]
    return source > 0 and webp < source * (1 - min_saving_ratio)


def rewrite_references(rewrite_map: dict[str, str]) -> list[dict]:
    changes = []
    if not rewrite_map:
        return changes

    pattern = re.compile("|".join(re.escape(key) for key in sorted(rewrite_map, key=len, reverse=True)))
    for target in TEXT_TARGETS:
        path = ROOT / target
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8")
        updated = pattern.sub(lambda match: rewrite_map[match.group(0)], original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changes.append({"file": str(target), "replacements": sum(1 for _ in pattern.finditer(original))})
    return changes


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--quality", type=int, default=78, help="WebP quality, 1-100.")
    parser.add_argument("--min-saving-ratio", type=float, default=0.05, help="Only rewrite references when WebP is this much smaller.")
    parser.add_argument("--force", action="store_true", help="Regenerate WebP files even when they are newer than the source.")
    parser.add_argument("--no-rewrite", action="store_true", help="Only generate WebP files; do not edit source references.")
    args = parser.parse_args()

    assets = collect_static_asset_paths() | collect_dynamic_asset_paths()
    records = []
    for asset in sorted(assets):
        try:
            record = convert_to_webp(asset, args.quality, args.force)
        except Exception as exc:  # noqa: BLE001 - report and keep the batch moving.
            records.append({"source": str(asset), "status": "error", "error": str(exc)})
            continue
        if record:
            records.append(record)

    rewrite_map = {
        record["source"]: record["webp"]
        for record in records
        if record.get("status") in {"generated", "cached"} and should_rewrite(record, args.min_saving_ratio)
    }
    reference_changes = [] if args.no_rewrite else rewrite_references(rewrite_map)

    total_source = sum(record.get("sourceBytes", 0) for record in records)
    total_webp = sum(record.get("webpBytes", 0) for record in records)
    report = {
        "assetCount": len(records),
        "rewrittenAssetCount": len(rewrite_map),
        "sourceBytes": total_source,
        "webpBytes": total_webp,
        "savedBytes": total_source - total_webp,
        "referenceChanges": reference_changes,
        "assets": records,
    }
    report_path = ROOT / "tools/pages_asset_optimization_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"assets: {len(records)}")
    print(f"rewritten assets: {len(rewrite_map)}")
    print(f"source MB: {total_source / 1024 / 1024:.2f}")
    print(f"webp MB: {total_webp / 1024 / 1024:.2f}")
    print(f"saved MB: {(total_source - total_webp) / 1024 / 1024:.2f}")
    print(f"report: {report_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
