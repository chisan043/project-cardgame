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

    if stem == "main_menu_key_art_candidate_v3_cel" and suffix == ".webp":
        return f"{target_dir}/main_menu_key_art_v1.webp", "copy_then_rewrite_runtime_refs"
    if stem == "main_menu_key_art_candidate_v3_cel" and suffix == ".png":
        return "assets/source/ui/menu/main_menu_key_art_v1_source.png", "copy_as_source"
    if "candidate" in stem or status == "candidate":
        return f"assets/candidates/ui/menu/{normalize_slug(stem)}{suffix}", "copy_as_candidate"
    return f"{target_dir}/{normalize_slug(stem)}{suffix}", "review"


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
    return default_suggestion(source_path, status, target_dir, module_slug)


def load_assets(usage_report: Path, prefix: str) -> list[dict]:
    data = json.loads((ROOT / usage_report).read_text(encoding="utf-8"))
    return [asset for asset in data["assets"] if asset["path"].startswith(prefix)]


def build_plan(prefix: str, target_dir: str, module_slug: str, usage_report: Path) -> dict:
    assets = load_assets(usage_report, prefix)
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
    parser.add_argument("--target-dir", required=True, help="Target runtime asset directory.")
    parser.add_argument("--module-slug", required=True, help="Short ASCII module id for output filenames.")
    parser.add_argument("--usage-report", default=as_posix(DEFAULT_USAGE_REPORT))
    parser.add_argument("--output-dir", default=as_posix(DEFAULT_OUTPUT_DIR))
    args = parser.parse_args()

    plan = build_plan(args.prefix, args.target_dir, args.module_slug, Path(args.usage_report))
    write_plan(plan, Path(args.output_dir))


if __name__ == "__main__":
    main()
