#!/usr/bin/env python3
"""Build a review-only migration plan for one asset module.

This script consumes the read-only audit report and writes a focused plan. It
does not move, rename, copy, or archive assets.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_USAGE_REPORT = Path("asset-audit/asset-usage-report.json")
DEFAULT_OUTPUT_DIR = Path("asset-audit/migration-plans")


def as_posix(path: Path) -> str:
    return path.as_posix()


def normalize_slug(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9_]+", "_", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("_") or "asset"


def git_tracked_paths() -> set[str]:
    output = subprocess.check_output(["git", "-c", "core.quotePath=false", "ls-files"], cwd=ROOT, text=True)
    return set(output.splitlines())


def menu_suggestion(source_path: str, status: str, target_dir: str) -> tuple[str, str]:
    path = Path(source_path)
    suffix = path.suffix.lower()
    stem = path.stem

    if source_path.startswith(f"{target_dir}/") or source_path.startswith("assets/source/ui/menu/"):
        return source_path, "already_migrated"
    if stem == "main_menu_key_art_candidate_v3_cel" and suffix == ".webp":
        return f"{target_dir}/main_menu_key_art_v1.webp", "copy_then_rewrite_runtime_refs"
    if stem == "main_menu_key_art_candidate_v3_cel" and suffix == ".png":
        return "assets/source/ui/menu/main_menu_key_art_v1_source.png", "copy_as_source"
    if "candidate" in stem or status == "candidate":
        return f"assets/candidates/ui/menu/{normalize_slug(stem)}{suffix}", "copy_as_candidate"
    return f"{target_dir}/{normalize_slug(stem)}{suffix}", "review"


def scene_main_suggestion(source_path: str, status: str) -> tuple[str, str]:
    path = Path(source_path)
    suffix = path.suffix.lower()
    stem = path.stem

    if source_path.startswith(("assets/scenes/battle/", "assets/scenes/event/", "assets/source/scenes/")):
        return source_path, "already_migrated"

    replacements = {
        "bg_battle_ancient_forest_day": ("battle", "ancient_forest_day"),
        "bg_battle_cave_cold": ("battle", "cave_cold"),
        "bg_battle_dungeon_corridor_torch": ("battle", "dungeon_corridor_torch"),
        "bg_battle_mountain_plain_day": ("battle", "mountain_plain_day"),
        "bg_battle_stone_ruins_day": ("battle", "stone_ruins_day"),
        "bg_battle_temple_hall_grand": ("battle", "temple_hall_grand"),
        "bg_battle_temple_inner_light": ("battle", "temple_inner_light"),
        "bg_battle_wasteland_dusk": ("battle", "wasteland_dusk"),
        "bg_event_town_distant_day": ("event", "town_distant_day"),
    }
    scene_type, scene_slug = replacements.get(stem, ("review", normalize_slug(stem)))

    if status == "active":
        return f"assets/scenes/{scene_type}/{scene_slug}_v1{suffix}", "move_then_rewrite_runtime_refs"
    return f"assets/source/scenes/{scene_type}/{scene_slug}_v1_source{suffix}", "move_as_source"


def npc_suggestion(source_path: str, status: str) -> tuple[str, str]:
    path = Path(source_path)
    suffix = path.suffix.lower()
    stem = path.stem

    if source_path.startswith(("assets/npc/", "assets/source/npc/")):
        return source_path, "already_migrated"

    name_map = {
        "shopkeeper_portrait": "shopkeeper_portrait_v1",
        "campfire_elder_portrait": "campfire_elder_portrait_v1",
        "encounter_angel_portrait": "encounter_angel_portrait_v1",
        "shopkeeper_alpha_fullres": "shopkeeper_alpha_fullres_v1",
        "campfire_elder_alpha_fullres": "campfire_elder_alpha_fullres_v1",
        "encounter_angel_alpha_fullres": "encounter_angel_alpha_fullres_v1",
        "shopkeeper_source_chromakey": "shopkeeper_chromakey_source_v1",
        "campfire_elder_source_chromakey": "campfire_elder_chromakey_source_v1",
        "encounter_angel_source_chromakey": "encounter_angel_chromakey_source_v1",
    }
    slug = name_map.get(stem, f"{normalize_slug(stem)}_v1")

    if status == "active":
        return f"assets/npc/{slug}{suffix}", "move_then_rewrite_runtime_refs"
    source_slug = slug if "source" in slug else f"{slug}_source"
    return f"assets/source/npc/{source_slug}{suffix}", "move_as_source"


def default_suggestion(source_path: str, status: str, target_dir: str, module_slug: str) -> tuple[str, str]:
    path = Path(source_path)
    filename = f"{normalize_slug(path.stem)}{path.suffix.lower()}"
    if status == "active":
        return f"{target_dir}/{filename}", "copy_then_rewrite_runtime_refs"
    if status == "source":
        return f"assets/source/{module_slug}/{filename}", "copy_as_source"
    if status == "candidate":
        return f"assets/candidates/{module_slug}/{filename}", "copy_as_candidate"
    if status == "legacy":
        return f"assets/legacy/{module_slug}/{filename}", "copy_as_legacy"
    return f"assets/archive/review/{module_slug}/{filename}", "review_before_archive"


def suggested_path(source_path: str, status: str, target_dir: str, module_slug: str) -> tuple[str, str]:
    if module_slug == "ui_menu":
        return menu_suggestion(source_path, status, target_dir)
    if module_slug == "scenes_main":
        return scene_main_suggestion(source_path, status)
    if module_slug == "npc":
        return npc_suggestion(source_path, status)
    return default_suggestion(source_path, status, target_dir, module_slug)


def load_assets(usage_report: Path, prefixes: list[str]) -> list[dict]:
    data = json.loads((ROOT / usage_report).read_text(encoding="utf-8"))
    return [
        asset
        for asset in data["assets"]
        if any(asset["path"].startswith(prefix) for prefix in prefixes)
    ]


def build_plan(prefix: str, include_prefixes: list[str], target_dir: str, module_slug: str, usage_report: Path) -> dict:
    prefixes = [prefix, *include_prefixes]
    assets = load_assets(usage_report, prefixes)
    tracked = git_tracked_paths()

    by_stem: dict[str, list[dict]] = defaultdict(list)
    entries = []
    for asset in assets:
        source_path = asset["path"]
        target_path, action = suggested_path(source_path, asset["status"], target_dir, module_slug)
        is_tracked = source_path in tracked
        stem_key = as_posix(Path(source_path).with_suffix(""))
        by_stem[stem_key].append(asset)
        entries.append(
            {
                "sourcePath": source_path,
                "suggestedPath": target_path,
                "action": action,
                "status": asset["status"],
                "tracked": is_tracked,
                "references": asset["references"],
                "referenceModules": asset["referenceModules"],
                "risks": asset["risks"],
                "sha256": asset["sha256"],
                "derivedFrom": source_path,
                "visualGroup": f"visual_{asset['sha256'][:10]}",
                "notes": notes_for(asset, is_tracked, action),
            }
        )

    duplicate_extension_groups = []
    for stem_key, group in sorted(by_stem.items()):
        extensions = sorted({asset["extension"] for asset in group})
        if len(extensions) > 1:
            duplicate_extension_groups.append(
                {
                    "basePath": stem_key,
                    "extensions": extensions,
                    "paths": sorted(asset["path"] for asset in group),
                }
            )

    status_counts = Counter(entry["status"] for entry in entries)
    action_counts = Counter(entry["action"] for entry in entries)
    tracked_counts = Counter("tracked" if entry["tracked"] else "untracked" for entry in entries)

    return {
        "generatedBy": "tools/plan_asset_migration.py",
        "proposalType": "review_only",
        "moduleSlug": module_slug,
        "sourcePrefix": prefix,
        "includePrefixes": include_prefixes,
        "targetDirectory": target_dir,
        "strategy": [
            "Review this plan before executing any filesystem migration.",
            "Copy active runtime assets into the owning module first.",
            "Rewrite references only after copied assets exist.",
            "Keep source and candidate assets separate from formal runtime assets.",
            "Do not archive unreferenced assets until active migration validation passes.",
        ],
        "summary": {
            "assetCount": len(entries),
            "statusCounts": dict(sorted(status_counts.items())),
            "actionCounts": dict(sorted(action_counts.items())),
            "trackedCounts": dict(sorted(tracked_counts.items())),
            "duplicateExtensionGroupCount": len(duplicate_extension_groups),
        },
        "entries": sorted(entries, key=lambda item: item["sourcePath"]),
        "duplicateExtensionGroups": duplicate_extension_groups,
    }


def notes_for(asset: dict, is_tracked: bool, action: str) -> str:
    notes = []
    if not is_tracked:
        notes.append("untracked file; do not include in migration commit unless intentionally accepted")
    if asset["status"] == "active":
        notes.append("runtime/config referenced")
    if asset["status"] == "candidate":
        notes.append("candidate asset; keep outside formal runtime directory")
    if action == "copy_as_source":
        notes.append("source counterpart for active runtime asset")
    if not notes:
        notes.append("review before migration")
    return "; ".join(notes)


def render_markdown(plan: dict) -> str:
    summary = plan["summary"]
    lines = [
        f"# Asset Migration Plan: {plan['moduleSlug']}",
        "",
        "This is a review-only plan. No source asset was moved, renamed, copied, or archived.",
        "",
        "## Scope",
        "",
        f"- Source prefix: `{plan['sourcePrefix']}`",
        f"- Include prefixes: {', '.join(f'`{prefix}`' for prefix in plan['includePrefixes']) or 'none'}",
        f"- Target runtime directory: `{plan['targetDirectory']}`",
        f"- Assets in scope: {summary['assetCount']}",
        f"- Duplicate extension groups: {summary['duplicateExtensionGroupCount']}",
        "",
        "## Counts",
        "",
        "### Status",
    ]
    for key, value in summary["statusCounts"].items():
        lines.append(f"- {key}: {value}")

    lines.extend(["", "### Action", ""])
    for key, value in summary["actionCounts"].items():
        lines.append(f"- {key}: {value}")

    lines.extend(["", "### Git Tracking", ""])
    for key, value in summary["trackedCounts"].items():
        lines.append(f"- {key}: {value}")

    lines.extend(["", "## Proposed Entries", ""])
    for entry in plan["entries"]:
        ref_text = ", ".join(
            f"{ref['file']}:{ref['line']} ({ref['kind']})" for ref in entry["references"]
        )
        if not ref_text:
            ref_text = "none"
        lines.extend(
            [
                f"### `{entry['sourcePath']}`",
                "",
                f"- Suggested path: `{entry['suggestedPath']}`",
                f"- Action: `{entry['action']}`",
                f"- Status: `{entry['status']}`",
                f"- Tracked: `{entry['tracked']}`",
                f"- References: {ref_text}",
                f"- Notes: {entry['notes']}",
                "",
            ]
        )

    lines.extend(["## Duplicate Extension Groups", ""])
    if plan["duplicateExtensionGroups"]:
        for group in plan["duplicateExtensionGroups"]:
            lines.append(f"- `{group['basePath']}`: {', '.join(group['extensions'])}")
    else:
        lines.append("- None.")

    lines.extend(
        [
            "",
            "## Next Review Questions",
            "",
            "- Is the active runtime asset name acceptable?",
            "- Should untracked candidate files be adopted, ignored, or archived later?",
            "- Should PNG counterparts be treated as source files or candidate files?",
        ]
    )
    return "\n".join(lines) + "\n"


def write_plan(plan: dict, output_dir: Path) -> None:
    abs_output_dir = ROOT / output_dir
    abs_output_dir.mkdir(parents=True, exist_ok=True)
    base = abs_output_dir / plan["moduleSlug"]
    (base.with_suffix(".json")).write_text(
        json.dumps(plan, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (base.with_suffix(".md")).write_text(render_markdown(plan), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a review-only migration plan for one asset module.")
    parser.add_argument("--prefix", required=True, help="Source path prefix to include.")
    parser.add_argument(
        "--include-prefix",
        action="append",
        default=[],
        help="Additional path prefix to include in the same module plan.",
    )
    parser.add_argument("--target-dir", required=True, help="Target runtime asset directory.")
    parser.add_argument("--module-slug", required=True, help="Short ASCII module id for output filenames.")
    parser.add_argument("--usage-report", default=as_posix(DEFAULT_USAGE_REPORT))
    parser.add_argument("--output-dir", default=as_posix(DEFAULT_OUTPUT_DIR))
    args = parser.parse_args()

    plan = build_plan(args.prefix, args.include_prefix, args.target_dir, args.module_slug, Path(args.usage_report))
    write_plan(plan, Path(args.output_dir))


if __name__ == "__main__":
    main()
