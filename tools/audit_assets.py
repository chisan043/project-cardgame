#!/usr/bin/env python3
"""Audit project asset paths before any rename or archive migration.

The audit is intentionally read-only for existing assets and source files. It
builds reports that make later migrations depend on references and module
usage, not on filename guesses.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]

ASSET_EXTENSIONS = {
    ".avif",
    ".bmp",
    ".gif",
    ".jpeg",
    ".jpg",
    ".mp3",
    ".mp4",
    ".ogg",
    ".png",
    ".psd",
    ".svg",
    ".wav",
    ".webm",
    ".webp",
}

TEXT_EXTENSIONS = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".ts",
    ".txt",
}

EXCLUDED_DIRS = {
    ".git",
    ".DS_Store",
    "__pycache__",
    "node_modules",
    ".pytest_cache",
}

REPORT_DIR = Path("asset-audit")
EXCLUDED_TEXT_FILES = {
    "tools/pages_asset_optimization_report.json",
}
MAX_TEXT_BYTES = 5 * 1024 * 1024
LONG_PATH_THRESHOLD = 120
LONG_COMPONENT_THRESHOLD = 48

IMAGE_LITERAL_RE = re.compile(
    r"(?P<path>[A-Za-z0-9_\-./\u3400-\u9fff【】（）]+"
    r"\.(?:avif|bmp|gif|jpeg|jpg|mp3|mp4|ogg|png|psd|svg|wav|webm|webp))",
    re.IGNORECASE,
)
MAX_LITERAL_LENGTH = 260


@dataclass(frozen=True)
class TextFile:
    path: Path
    text: str


def as_posix(path: Path) -> str:
    return path.as_posix()


def contains_non_ascii(value: str) -> bool:
    return any(ord(char) > 127 for char in value)


def is_template_suffix_fragment(path: str) -> bool:
    return "/" not in path and path.startswith("_")


def iter_files() -> Iterable[Path]:
    for current_root, dirnames, filenames in os.walk(ROOT):
        root_path = Path(current_root)
        dirnames[:] = [
            dirname
            for dirname in dirnames
            if dirname not in EXCLUDED_DIRS
            and as_posix((root_path / dirname).relative_to(ROOT)) != as_posix(REPORT_DIR)
        ]
        for filename in filenames:
            path = root_path / filename
            try:
                rel = path.relative_to(ROOT)
            except ValueError:
                continue
            if rel.parts and rel.parts[0] == REPORT_DIR.parts[0]:
                continue
            yield rel


def collect_assets() -> list[Path]:
    return sorted(path for path in iter_files() if path.suffix.lower() in ASSET_EXTENSIONS)


def collect_text_files() -> list[TextFile]:
    text_files: list[TextFile] = []
    for rel in iter_files():
        if as_posix(rel) in EXCLUDED_TEXT_FILES:
            continue
        if as_posix(rel).startswith("assets/archive/unused/"):
            continue
        if rel.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        abs_path = ROOT / rel
        try:
            if abs_path.stat().st_size > MAX_TEXT_BYTES:
                continue
            text = abs_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        text_files.append(TextFile(path=rel, text=text))
    return sorted(text_files, key=lambda item: as_posix(item.path))


def relic_formal_icon_ids() -> set[str]:
    data_path = ROOT / "src/data/relics.js"
    try:
        text = data_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return set()
    match = re.search(r"FORMAL_RELIC_ICON_IDS = new Set\(\[(.*?)\]\);", text, re.S)
    if not match:
        return set()
    return set(re.findall(r"'([^']+)'", match.group(1)))


FORMAL_RELIC_ICON_IDS = relic_formal_icon_ids()


def infer_reference_context(text_path: Path) -> tuple[str, str]:
    path = as_posix(text_path)
    if path in {
        "questers_demo_v0.99.html",
        "hud-runtime.js",
        "hud-layout-data.js",
        "hud_layout_editor.html",
        "hud-group-final.json",
        "src/data/cards.js",
        "src/data/characters.js",
        "src/data/enemies.js",
        "src/data/relics.js",
    }:
        kind = "runtime"
    elif path.startswith("tools/"):
        kind = "tool"
    elif text_path.suffix.lower() in {".md", ".txt"}:
        kind = "documentation"
    else:
        kind = "config"

    if path == "src/data/cards.js" or "/cards" in path:
        return "cards", kind
    if path == "src/data/characters.js" or "character" in path or "角色" in path:
        return "characters", kind
    if path == "src/data/enemies.js" or "enemy" in path or "怪物" in path:
        return "enemies", kind
    if path == "src/data/relics.js" or "relic" in path or "遗物" in path:
        return "relics", kind
    if "hud" in path.lower():
        return "ui.hud", kind
    if path.endswith(".html"):
        return "demo", kind
    return "misc", kind


def infer_asset_module(asset_path: Path, references: list[dict]) -> str:
    path = as_posix(asset_path)
    if path.startswith("assets/relics/"):
        return str(Path(path).parent)
    if path.startswith("assets/source/relics/"):
        return str(Path(path).parent)
    if path.startswith("遗物/图标/"):
        return "assets/relics/icons"
    if path.startswith("遗物/母版/"):
        return "assets/relics/masters"
    if path.startswith("assets/cards/"):
        return str(Path(path).parent)
    if path.startswith("assets/source/cards/"):
        return str(Path(path).parent)
    if path.startswith("assets/candidates/cards/"):
        return str(Path(path).parent)
    if path.startswith("卡牌设计/教堂彩窗赛璐璐/卡框UI/"):
        return "assets/cards/frames"
    if path.startswith("卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/"):
        return "assets/cards/art"
    if path.startswith("卡牌设计/教堂彩窗赛璐璐/imagegen流派原画_"):
        return "assets/cards/art"
    if path.startswith("卡牌设计/教堂彩窗赛璐璐/"):
        return "assets/candidates/cards"
    if path.startswith("场景/主场景/"):
        return "assets/scenes/battle"
    if path.startswith("场景/色调变体/"):
        return "assets/scenes/battle/variants"
    if path.startswith("场景/源图/"):
        return "assets/source/scenes"
    if path.startswith("场景/"):
        return "assets/scenes/review"
    if path.startswith("头像/怪物/"):
        return "assets/enemies/portrait"
    if path.startswith("头像/角色/"):
        return "assets/characters/portrait"
    if path.startswith("怪物/战斗立绘/"):
        return "assets/enemies/battle"
    if path.startswith("assets/enemies/"):
        return str(Path(path).parent)
    if path.startswith("assets/source/enemies/"):
        return str(Path(path).parent)
    if path.startswith("NPC/源图/"):
        return "assets/source/npc"
    if path.startswith("NPC/"):
        return "assets/npc"
    if path.startswith("UI/主菜单/"):
        return "assets/ui/menu"
    if "战斗HUD" in path:
        return "assets/ui/hud"
    if "角色选择" in path:
        return "assets/ui/character_select"
    if path.startswith("UI/"):
        return "assets/ui/review"
    if path.startswith("卡牌设计/"):
        return "assets/cards/review"
    if path.startswith("新角色一/"):
        return "assets/characters/warrior"
    if path.startswith("角色二/"):
        return "assets/characters/mage"
    if path.startswith("新角色三/"):
        return "assets/characters/archer"
    if path.startswith("旧美术资产/"):
        return "assets/legacy"

    modules = sorted({reference["module"] for reference in references})
    if len(modules) == 1:
        return f"assets/{modules[0].replace('.', '/')}/review"
    return "assets/review"


def safe_ascii_filename(asset_path: Path, digest: str) -> tuple[str, bool]:
    stem = asset_path.stem.lower()
    suffix = asset_path.suffix.lower()
    normalized = re.sub(r"[^a-z0-9_]+", "_", stem).strip("_")
    normalized = re.sub(r"_+", "_", normalized)
    if normalized and not contains_non_ascii(stem):
        return f"{normalized}{suffix}", False
    return f"review_{digest[:10]}{suffix}", True


def file_digest(rel: Path) -> str:
    digest = hashlib.sha256()
    with (ROOT / rel).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def collect_references(assets: list[Path], text_files: list[TextFile]) -> tuple[dict[str, list[dict]], list[dict]]:
    references: dict[str, list[dict]] = {as_posix(asset): [] for asset in assets}
    asset_set = set(references)
    missing_literals: list[dict] = []

    for text_file in text_files:
        text = text_file.text
        module, kind = infer_reference_context(text_file.path)

        for match in IMAGE_LITERAL_RE.finditer(text):
            raw_path = match.group("path").split("?", 1)[0]
            if len(raw_path) > MAX_LITERAL_LENGTH:
                continue
            if is_template_suffix_fragment(raw_path):
                continue
            if raw_path.startswith(("http://", "https://", "data:", "blob:", "input:")):
                continue
            line = text.count("\n", 0, match.start()) + 1
            if raw_path in asset_set:
                references[raw_path].append(
                    {
                        "file": as_posix(text_file.path),
                        "line": line,
                        "module": module,
                        "kind": kind,
                    }
                )
            elif not (ROOT / raw_path).is_file():
                missing_literals.append(
                    {
                        "path": raw_path,
                        "file": as_posix(text_file.path),
                        "line": line,
                        "module": module,
                        "kind": kind,
                    }
                )

    for asset_refs in references.values():
        asset_refs.sort(key=lambda item: (item["file"], item["line"]))

    unique_missing = {}
    for item in missing_literals:
        key = (item["path"], item["file"], item["line"])
        unique_missing[key] = item
    return references, sorted(unique_missing.values(), key=lambda item: (item["path"], item["file"], item["line"]))


def classify_status(asset_path: Path, references: list[dict]) -> str:
    path = as_posix(asset_path)
    lowered = path.lower()
    runtime_references = [ref for ref in references if ref["kind"] in {"runtime", "config"}]
    if runtime_references:
        return "active"
    if path.startswith("遗物/图标/") and asset_path.stem in FORMAL_RELIC_ICON_IDS:
        if asset_path.suffix.lower() == ".webp":
            return "active"
        return "source"
    if path.startswith("assets/relics/icons/") and path.endswith("_icon_v1.webp"):
        return "active"
    if path.startswith("assets/source/relics/"):
        return "source"
    if (
        path.startswith(("assets/enemies/battle/", "assets/enemies/portraits/"))
        and asset_path.suffix.lower() == ".webp"
    ):
        return "active"
    if path.startswith("assets/source/enemies/"):
        return "source"
    if references and all(ref["kind"] == "documentation" for ref in references):
        return "documented"
    if references and all(ref["kind"] == "tool" for ref in references):
        return "tool_reference"
    if path.startswith("assets/source/cards/"):
        return "source"
    if path.startswith("assets/candidates/cards/"):
        return "candidate"
    if path.startswith("assets/cards/"):
        return "active"
    if any(token in path for token in ("源图", "母版")) or "source" in lowered or "master" in lowered:
        return "source"
    if any(token in path for token in ("candidate", "候选", "预览", "preview", "contact_sheet")):
        return "candidate"
    if any(token in path for token in ("旧", "archive", "legacy")):
        return "legacy"
    return "unreferenced"


def build_reports() -> tuple[dict, list[dict], str]:
    assets = collect_assets()
    text_files = collect_text_files()
    references, missing_literals = collect_references(assets, text_files)

    digest_to_paths: dict[str, list[str]] = defaultdict(list)
    digest_by_path: dict[str, str] = {}
    for asset in assets:
        digest = file_digest(asset)
        digest_by_path[as_posix(asset)] = digest
        digest_to_paths[digest].append(as_posix(asset))

    asset_records = []
    proposals = []
    extension_pairs: dict[str, set[str]] = defaultdict(set)

    for asset in assets:
        path_text = as_posix(asset)
        refs = references[path_text]
        digest = digest_by_path[path_text]
        components = list(asset.parts)
        path_length = len(path_text)
        max_component_length = max((len(component) for component in components), default=0)
        status = classify_status(asset, refs)
        reference_modules = sorted({ref["module"] for ref in refs})
        inferred_dir = infer_asset_module(asset, refs)
        filename, needs_name_review = safe_ascii_filename(asset, digest)
        suggested_path = f"{inferred_dir}/{filename}"

        extension_pairs[as_posix(asset.with_suffix(""))].add(asset.suffix.lower())

        risks = []
        if contains_non_ascii(path_text):
            risks.append("non_ascii_path")
        if path_length > LONG_PATH_THRESHOLD:
            risks.append("long_path")
        if max_component_length > LONG_COMPONENT_THRESHOLD:
            risks.append("long_component")
        if status in {"unreferenced", "documented", "tool_reference"}:
            risks.append("unreferenced")
        if len(reference_modules) > 1:
            risks.append("multi_module_reference")

        record = {
            "path": path_text,
            "extension": asset.suffix.lower(),
            "bytes": (ROOT / asset).stat().st_size,
            "sha256": digest,
            "status": status,
            "references": refs,
            "referenceModules": reference_modules,
            "pathLength": path_length,
            "maxComponentLength": max_component_length,
            "containsNonAscii": contains_non_ascii(path_text),
            "risks": risks,
            "identicalContentGroup": [],
        }
        asset_records.append(record)

        if risks:
            proposals.append(
                {
                    "sourcePath": path_text,
                    "suggestedPath": suggested_path,
                    "suggestedDirectory": inferred_dir,
                    "status": status,
                    "referenceModules": reference_modules,
                    "requiresHumanNameReview": needs_name_review,
                    "risks": risks,
                    "derivedFrom": path_text,
                    "visualGroup": f"visual_{digest[:10]}",
                    "notes": "Suggested path is advisory. Migration must be reviewed before execution.",
                }
            )

    for record in asset_records:
        group = digest_to_paths[record["sha256"]]
        if len(group) > 1:
            record["identicalContentGroup"] = sorted(group)
            if "identical_content" not in record["risks"]:
                record["risks"].append("identical_content")

    duplicate_extension_groups = [
        {"basePath": base_path, "extensions": sorted(extensions)}
        for base_path, extensions in extension_pairs.items()
        if len(extensions) > 1
    ]

    status_counts = Counter(record["status"] for record in asset_records)
    risk_counts = Counter(risk for record in asset_records for risk in record["risks"])
    module_counts = Counter()
    for record in asset_records:
        for module in record["referenceModules"]:
            module_counts[module] += 1

    usage_report = {
        "generatedBy": "tools/audit_assets.py",
        "assetExtensions": sorted(ASSET_EXTENSIONS),
        "thresholds": {
            "longPath": LONG_PATH_THRESHOLD,
            "longComponent": LONG_COMPONENT_THRESHOLD,
        },
        "summary": {
            "assetCount": len(asset_records),
            "textFileCount": len(text_files),
            "referencedAssetCount": sum(1 for record in asset_records if record["references"]),
            "activeAssetCount": sum(1 for record in asset_records if record["status"] == "active"),
            "unreferencedAssetCount": sum(1 for record in asset_records if not record["references"]),
            "missingReferenceCount": len(missing_literals),
            "missingRuntimeReferenceCount": sum(
                1 for item in missing_literals if item["kind"] in {"runtime", "config"}
            ),
            "statusCounts": dict(sorted(status_counts.items())),
            "riskCounts": dict(sorted(risk_counts.items())),
            "referenceModuleCounts": dict(sorted(module_counts.items())),
            "duplicateExtensionGroupCount": len(duplicate_extension_groups),
            "identicalContentGroupCount": sum(1 for paths in digest_to_paths.values() if len(paths) > 1),
        },
        "assets": sorted(asset_records, key=lambda item: item["path"]),
        "missingReferences": missing_literals,
        "duplicateExtensionGroups": sorted(duplicate_extension_groups, key=lambda item: item["basePath"]),
        "identicalContentGroups": [
            {"sha256": digest, "paths": sorted(paths)}
            for digest, paths in sorted(digest_to_paths.items())
            if len(paths) > 1
        ],
    }

    proposals = sorted(proposals, key=lambda item: (item["suggestedDirectory"], item["sourcePath"]))

    risk_report = render_risk_report(usage_report, proposals)
    return usage_report, proposals, risk_report


def render_risk_report(usage_report: dict, proposals: list[dict]) -> str:
    summary = usage_report["summary"]
    assets = usage_report["assets"]

    def top_records(risk: str, limit: int = 12) -> list[dict]:
        return [record for record in assets if risk in record["risks"]][:limit]

    lines = [
        "# Asset Audit Risk Report",
        "",
        "This is a read-only audit. No source asset was moved, renamed, or archived.",
        "",
        "## Summary",
        "",
        f"- Assets scanned: {summary['assetCount']}",
        f"- Text files scanned for references: {summary['textFileCount']}",
        f"- Referenced assets: {summary['referencedAssetCount']}",
        f"- Active runtime/config assets: {summary['activeAssetCount']}",
        f"- Unreferenced assets: {summary['unreferencedAssetCount']}",
        f"- Missing asset-like references: {summary['missingReferenceCount']}",
        f"- Missing runtime/config references: {summary['missingRuntimeReferenceCount']}",
        f"- Duplicate extension groups: {summary['duplicateExtensionGroupCount']}",
        f"- Identical content groups: {summary['identicalContentGroupCount']}",
        "",
        "## Status Counts",
        "",
    ]

    for key, value in summary["statusCounts"].items():
        lines.append(f"- {key}: {value}")

    lines.extend(["", "## Risk Counts", ""])
    for key, value in summary["riskCounts"].items():
        lines.append(f"- {key}: {value}")

    lines.extend(["", "## Longest Paths", ""])
    for record in sorted(assets, key=lambda item: item["pathLength"], reverse=True)[:15]:
        lines.append(f"- {record['pathLength']} chars: `{record['path']}`")

    lines.extend(["", "## Non-ASCII Path Examples", ""])
    for record in top_records("non_ascii_path"):
        lines.append(f"- `{record['path']}`")

    lines.extend(["", "## Unreferenced Examples", ""])
    for record in top_records("unreferenced"):
        lines.append(f"- `{record['path']}`")

    lines.extend(["", "## Multi-Module Reference Examples", ""])
    for record in top_records("multi_module_reference"):
        modules = ", ".join(record["referenceModules"])
        lines.append(f"- `{record['path']}` used by {modules}")

    lines.extend(["", "## Missing References", ""])
    if usage_report["missingReferences"]:
        for item in usage_report["missingReferences"][:30]:
            lines.append(f"- `{item['path']}` in `{item['file']}:{item['line']}`")
    else:
        lines.append("- None found.")

    lines.extend(["", "## First Migration Candidates", ""])
    candidate_dirs = Counter(item["suggestedDirectory"] for item in proposals if item["status"] == "active")
    for directory, count in candidate_dirs.most_common(12):
        lines.append(f"- `{directory}`: {count} active risky assets")

    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- Suggested rename paths are advisory and must be reviewed before any migration.",
            "- Assets with the same visual source should be copied into each owning module during migration, then linked with `derivedFrom` and `visualGroup` in the manifest.",
            "- Unreferenced does not mean delete. It means archive review is needed after active migrations are complete.",
        ]
    )
    return "\n".join(lines) + "\n"


def write_reports(output_dir: Path) -> None:
    usage_report, proposals, risk_report = build_reports()
    abs_output = ROOT / output_dir
    abs_output.mkdir(parents=True, exist_ok=True)

    (abs_output / "asset-usage-report.json").write_text(
        json.dumps(usage_report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (abs_output / "asset-rename-proposal.json").write_text(
        json.dumps(
            {
                "generatedBy": "tools/audit_assets.py",
                "proposalType": "advisory",
                "proposals": proposals,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (abs_output / "asset-risk-report.md").write_text(risk_report, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate read-only asset audit reports.")
    parser.add_argument(
        "--output-dir",
        default=as_posix(REPORT_DIR),
        help="Directory for audit reports, relative to the project root.",
    )
    args = parser.parse_args()
    write_reports(Path(args.output_dir))


if __name__ == "__main__":
    main()
