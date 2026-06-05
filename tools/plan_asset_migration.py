#!/usr/bin/env python3
"""Build a review-only migration plan for one asset module.

This script consumes the read-only audit report and writes a focused plan. It
does not move, rename, copy, or archive assets.
"""

from __future__ import annotations

import argparse
import hashlib
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


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


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


ENEMY_NAME_SLUGS = {
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


def enemy_slug(stem: str) -> str:
    clean_name = re.sub(r"·.*?(?=】)", "", stem).replace("·暴走", "")
    return ENEMY_NAME_SLUGS.get(clean_name, normalize_slug(stem))


def enemy_suggestion(source_path: str, status: str) -> tuple[str, str]:
    path = Path(source_path)
    suffix = path.suffix.lower()
    slug = enemy_slug(path.stem)

    if source_path.startswith(("assets/enemies/", "assets/source/enemies/")):
        return source_path, "already_migrated"
    if source_path.startswith("头像/怪物/"):
        if suffix == ".webp":
            return f"assets/enemies/portraits/{slug}_portrait_v1.webp", "move_then_rewrite_dynamic_refs"
        return f"assets/source/enemies/portraits/{slug}_portrait_v1_source{suffix}", "move_as_source"
    if source_path.startswith("怪物/战斗立绘/"):
        if suffix == ".webp":
            return f"assets/enemies/battle/{slug}_battle_v1.webp", "move_then_rewrite_dynamic_refs"
        return f"assets/source/enemies/battle/{slug}_battle_v1_source{suffix}", "move_as_source"
    return f"assets/enemies/review/{slug}{suffix}", "review"


CHARACTER_PATH_MAP = {
    "头像/角色/hero_warrior.webp": ("assets/characters/warrior/avatar_portrait_v1.webp", "move_then_rewrite_runtime_refs"),
    "头像/角色/hero_warrior.png": ("assets/source/characters/warrior/avatar_portrait_v1_source.png", "move_as_source"),
    "头像/角色/hero_mage.webp": ("assets/characters/mage/avatar_portrait_v1.webp", "move_then_rewrite_runtime_refs"),
    "头像/角色/hero_mage.png": ("assets/source/characters/mage/avatar_portrait_v1_source.png", "move_as_source"),
    "头像/角色/hero_archer.webp": ("assets/characters/archer/avatar_portrait_v1.webp", "move_then_rewrite_runtime_refs"),
    "头像/角色/hero_archer.png": ("assets/source/characters/archer/avatar_portrait_v1_source.png", "move_as_source"),
    "新角色一/角色一_角色选择_立绘.webp": ("assets/characters/warrior/select_portrait_v1.webp", "move_then_rewrite_runtime_refs"),
    "新角色一/角色一_角色选择_立绘.png": ("assets/source/characters/warrior/select_portrait_v1_source.png", "move_as_source"),
    "新角色一/角色一_我方背面_待机.webp": ("assets/characters/warrior/battle_back_idle_v1.webp", "move_then_rewrite_runtime_refs"),
    "新角色一/角色一_我方背面_待机.png": ("assets/source/characters/warrior/battle_back/idle_v1_source.png", "move_as_source"),
    "新角色一/角色一_我方背面_攻击起手.png": ("assets/source/characters/warrior/battle_back/attack_start_v1_source.png", "move_as_source"),
    "新角色一/角色一_我方背面_技能释放.png": ("assets/source/characters/warrior/battle_back/skill_cast_v1_source.png", "move_as_source"),
    "新角色一/角色一_我方背面_受击.png": ("assets/source/characters/warrior/battle_back/hurt_v1_source.png", "move_as_source"),
    "新角色一/角色一_敌方正面_待机.png": ("assets/source/characters/warrior/battle_front/idle_v1_source.png", "move_as_source"),
    "新角色一/角色一_敌方正面_攻击起手.png": ("assets/source/characters/warrior/battle_front/attack_start_v1_source.png", "move_as_source"),
    "新角色一/角色一_敌方正面_技能释放.png": ("assets/source/characters/warrior/battle_front/skill_cast_v1_source.png", "move_as_source"),
    "新角色一/角色一_敌方正面_受击.png": ("assets/source/characters/warrior/battle_front/hurt_v1_source.png", "move_as_source"),
    "新角色一/角色一_三视图_线稿版.png": ("assets/source/characters/warrior/design/turnaround_line_v1_source.png", "move_as_source"),
    "新角色一/角色一_三视图_配色版.png": ("assets/source/characters/warrior/design/turnaround_color_v1_source.png", "move_as_source"),
    "新角色一/角色一_武器设定_圣剑.png": ("assets/source/characters/warrior/design/weapon_sword_v1_source.png", "move_as_source"),
    "角色二/角色二_角色选择_立绘.webp": ("assets/characters/mage/select_portrait_v1.webp", "move_then_rewrite_runtime_refs"),
    "角色二/角色二_角色选择_立绘.png": ("assets/source/characters/mage/select_portrait_v1_source.png", "move_as_source"),
    "角色二/角色二_角色选择_彩窗立绘.png": ("assets/source/characters/mage/design/select_stained_glass_v1_source.png", "move_as_source"),
    "角色二/角色二_我方背面_待机.webp": ("assets/characters/mage/battle_back_idle_v1.webp", "move_then_rewrite_runtime_refs"),
    "角色二/角色二_我方背面_待机.png": ("assets/source/characters/mage/battle_back/idle_v1_source.png", "move_as_source"),
    "角色二/角色二_我方背面_攻击起手.png": ("assets/source/characters/mage/battle_back/attack_start_v1_source.png", "move_as_source"),
    "角色二/角色二_我方背面_技能释放.png": ("assets/source/characters/mage/battle_back/skill_cast_v1_source.png", "move_as_source"),
    "角色二/角色二_我方背面_受击.png": ("assets/source/characters/mage/battle_back/hurt_v1_source.png", "move_as_source"),
    "角色二/角色二_敌方正面_待机.png": ("assets/source/characters/mage/battle_front/idle_v1_source.png", "move_as_source"),
    "角色二/角色二_敌方正面_攻击起手.png": ("assets/source/characters/mage/battle_front/attack_start_v1_source.png", "move_as_source"),
    "角色二/角色二_敌方正面_技能释放.png": ("assets/source/characters/mage/battle_front/skill_cast_v1_source.png", "move_as_source"),
    "角色二/角色二_敌方正面_受击.png": ("assets/source/characters/mage/battle_front/hurt_v1_source.png", "move_as_source"),
    "角色二/角色二_三视图_线稿版.png": ("assets/source/characters/mage/design/turnaround_line_v1_source.png", "move_as_source"),
    "角色二/角色二_三视图_配色版.png": ("assets/source/characters/mage/design/turnaround_color_v1_source.png", "move_as_source"),
    "角色二/角色二_武器设定_法杖.png": ("assets/source/characters/mage/design/weapon_staff_v1_source.png", "move_as_source"),
    "新角色三/角色三_角色选择_立绘.webp": ("assets/characters/archer/select_portrait_v1.webp", "move_then_rewrite_runtime_refs"),
    "新角色三/角色三_角色选择_立绘.png": ("assets/source/characters/archer/select_portrait_v1_source.png", "move_as_source"),
    "新角色三/角色三_我方背面_待机.webp": ("assets/characters/archer/battle_back_idle_v1.webp", "move_then_rewrite_runtime_refs"),
    "新角色三/角色三_我方背面_待机.png": ("assets/source/characters/archer/battle_back/idle_v1_source.png", "move_as_source"),
    "新角色三/角色三_我方背面_攻击起手.png": ("assets/source/characters/archer/battle_back/attack_start_v1_source.png", "move_as_source"),
    "新角色三/角色三_我方背面_技能释放.png": ("assets/source/characters/archer/battle_back/skill_cast_v1_source.png", "move_as_source"),
    "新角色三/角色三_我方背面_受击.png": ("assets/source/characters/archer/battle_back/hurt_v1_source.png", "move_as_source"),
    "新角色三/角色三_敌方正面_待机.png": ("assets/source/characters/archer/battle_front/idle_v1_source.png", "move_as_source"),
    "新角色三/角色三_敌方正面_攻击起手.png": ("assets/source/characters/archer/battle_front/attack_start_v1_source.png", "move_as_source"),
    "新角色三/角色三_敌方正面_技能释放.png": ("assets/source/characters/archer/battle_front/skill_cast_v1_source.png", "move_as_source"),
    "新角色三/角色三_敌方正面_受击.png": ("assets/source/characters/archer/battle_front/hurt_v1_source.png", "move_as_source"),
    "新角色三/角色三_三视图_线稿版.png": ("assets/source/characters/archer/design/turnaround_line_v1_source.png", "move_as_source"),
    "新角色三/角色三_三视图_配色版.png": ("assets/source/characters/archer/design/turnaround_color_v1_source.png", "move_as_source"),
    "新角色三/角色三_武器设定_长弓.png": ("assets/source/characters/archer/design/weapon_bow_v1_source.png", "move_as_source"),
    "UI/教堂彩窗赛璐璐/角色选择/imagegen_v2/role_arch_warrior_uniform_v1.webp": ("assets/characters/warrior/role_select_frame_v1.webp", "move_then_rewrite_runtime_refs"),
    "UI/教堂彩窗赛璐璐/角色选择/imagegen_v2/role_arch_warrior_uniform_v1.png": ("assets/source/characters/warrior/role_select_frame_v1_source.png", "move_as_source"),
    "UI/教堂彩窗赛璐璐/角色选择/imagegen_v2/role_arch_mage_uniform_v1.webp": ("assets/characters/mage/role_select_frame_v1.webp", "move_then_rewrite_runtime_refs"),
    "UI/教堂彩窗赛璐璐/角色选择/imagegen_v2/role_arch_mage_uniform_v1.png": ("assets/source/characters/mage/role_select_frame_v1_source.png", "move_as_source"),
    "UI/教堂彩窗赛璐璐/角色选择/imagegen_v2/role_arch_archer_uniform_v1.webp": ("assets/characters/archer/role_select_frame_v1.webp", "move_then_rewrite_runtime_refs"),
    "UI/教堂彩窗赛璐璐/角色选择/imagegen_v2/role_arch_archer_uniform_v1.png": ("assets/source/characters/archer/role_select_frame_v1_source.png", "move_as_source"),
}


def is_character_asset(source_path: str) -> bool:
    if source_path.startswith(("assets/characters/", "assets/source/characters/")):
        return True
    return source_path in CHARACTER_PATH_MAP


def character_suggestion(source_path: str, status: str) -> tuple[str, str]:
    if source_path.startswith(("assets/characters/", "assets/source/characters/")):
        return source_path, "already_migrated"
    if source_path in CHARACTER_PATH_MAP:
        return CHARACTER_PATH_MAP[source_path]
    return f"assets/characters/review/{normalize_slug(Path(source_path).stem)}{Path(source_path).suffix.lower()}", "review"


def relic_data() -> tuple[set[str], dict[str, str]]:
    text = (ROOT / "src/data/relics.js").read_text(encoding="utf-8")
    formal_match = re.search(r"FORMAL_RELIC_ICON_IDS = new Set\(\[(.*?)\]\);", text, re.S)
    master_match = re.search(r"RELIC_MASTER_ICON_BY_ID = \{(.*?)\n\};", text, re.S)
    formal_ids = set(re.findall(r"'([^']+)'", formal_match.group(1))) if formal_match else set()
    master_by_id = dict(re.findall(r"(r_[a-z0-9_]+): '([^']+)'", master_match.group(1))) if master_match else {}
    return formal_ids, master_by_id


def relic_master_slug(path: Path) -> str:
    stem = path.stem
    if stem.startswith("relic_master_"):
        stem = stem.removeprefix("relic_master_")
    return normalize_slug(stem)


def relic_icon_id(path: Path) -> str:
    stem = path.stem
    if stem.endswith("_icon_v1"):
        return stem.removesuffix("_icon_v1")
    return stem


def relic_suggestion(source_path: str, status: str) -> tuple[str, str]:
    path = Path(source_path)
    suffix = path.suffix.lower()

    if source_path.startswith((
        "assets/relics/icons/",
        "assets/relics/masters/",
        "assets/source/relics/",
        "assets/candidates/relics/",
    )):
        return source_path, "already_migrated"

    if source_path.startswith("遗物/图标/"):
        icon_id = relic_icon_id(path)
        if suffix == ".webp":
            return f"assets/relics/icons/{icon_id}_icon_v1.webp", "move_then_rewrite_dynamic_refs"
        return f"assets/source/relics/icons/{icon_id}_icon_v1_source{suffix}", "move_as_source"

    if source_path.startswith("遗物/母版/"):
        slug = relic_master_slug(path)
        if suffix == ".webp":
            return f"assets/relics/masters/{slug}_master_v1.webp", "move_then_rewrite_runtime_refs"
        return f"assets/source/relics/masters/{slug}_master_v1_source{suffix}", "move_as_source"

    concept_names = {
        "03614FA0-1D7F-4432-8472-D0902EE0CE9E": "relic_icon_sheet_candidate_v1",
        "55E4AE04-98F0-4560-AD06-1441CE8F3FA9": "relic_icon_sheet_candidate_v2",
    }
    if source_path.startswith("遗物/") and path.stem in concept_names:
        return f"assets/candidates/relics/{concept_names[path.stem]}{suffix}", "move_as_candidate"

    return f"assets/archive/review/relics/{normalize_slug(path.stem)}{suffix}", "review_before_archive"


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
    if module_slug == "enemies_visuals":
        return enemy_suggestion(source_path, status)
    if module_slug == "characters":
        return character_suggestion(source_path, status)
    if module_slug == "relics_visuals":
        return relic_suggestion(source_path, status)
    return default_suggestion(source_path, status, target_dir, module_slug)


def load_assets(usage_report: Path, prefixes: list[str], module_slug: str) -> list[dict]:
    data = json.loads((ROOT / usage_report).read_text(encoding="utf-8"))
    assets = [
        asset
        for asset in data["assets"]
        if any(asset["path"].startswith(prefix) for prefix in prefixes)
    ]
    if module_slug == "characters":
        return [asset for asset in assets if is_character_asset(asset["path"])]
    return assets


def missing_relic_icon_entries(existing_paths: set[str], tracked: set[str]) -> list[dict]:
    formal_ids, master_by_id = relic_data()
    entries = []
    for relic_id in sorted(formal_ids):
        runtime_target = f"assets/relics/icons/{relic_id}_icon_v1.webp"
        source_target = f"assets/source/relics/icons/{relic_id}_icon_v1_source.png"
        if runtime_target in existing_paths or f"遗物/图标/{relic_id}.webp" in existing_paths:
            continue

        master_path = master_by_id.get(relic_id)
        if not master_path:
            continue
        master_source = str(Path(master_path).with_suffix(".png"))
        if master_path not in existing_paths or master_source not in existing_paths:
            continue
        digest = file_sha256(ROOT / master_path)
        source_digest = file_sha256(ROOT / master_source)
        entries.extend(
            [
                {
                    "sourcePath": master_path,
                    "suggestedPath": runtime_target,
                    "action": "copy_from_master_runtime",
                    "status": "active_dynamic",
                    "tracked": master_path in tracked,
                    "references": [
                        {
                            "file": "src/data/relics.js",
                            "line": 173,
                            "kind": "runtime",
                        }
                    ],
                    "referenceModules": ["relics"],
                    "risks": [],
                    "sha256": digest,
                    "derivedFrom": master_path,
                    "visualGroup": f"visual_{digest[:10]}",
                    "notes": f"missing formal relic icon for {relic_id}; copy from master fallback",
                },
                {
                    "sourcePath": master_source,
                    "suggestedPath": source_target,
                    "action": "copy_from_master_source",
                    "status": "source",
                    "tracked": master_source in tracked,
                    "references": [],
                    "referenceModules": ["relics"],
                    "risks": [],
                    "sha256": source_digest,
                    "derivedFrom": master_source,
                    "visualGroup": f"visual_{source_digest[:10]}",
                    "notes": f"source counterpart for missing formal relic icon {relic_id}",
                },
            ]
        )
    return entries


def build_plan(prefix: str, include_prefixes: list[str], target_dir: str, module_slug: str, usage_report: Path) -> dict:
    prefixes = [prefix, *include_prefixes]
    assets = load_assets(usage_report, prefixes, module_slug)
    tracked = git_tracked_paths()

    by_stem: dict[str, list[dict]] = defaultdict(list)
    entries = []
    for asset in assets:
        source_path = asset["path"]
        target_path, action = suggested_path(source_path, asset["status"], target_dir, module_slug)
        status = effective_status(asset["status"], action)
        is_tracked = source_path in tracked
        stem_key = as_posix(Path(source_path).with_suffix(""))
        by_stem[stem_key].append(asset)
        entries.append(
            {
                "sourcePath": source_path,
                "suggestedPath": target_path,
                "action": action,
                "status": status,
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
    if module_slug == "relics_visuals":
        existing_paths = {asset["path"] for asset in assets}
        entries.extend(missing_relic_icon_entries(existing_paths, tracked))

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


def effective_status(audit_status: str, action: str) -> str:
    if action == "move_then_rewrite_dynamic_refs":
        return "active_dynamic"
    if action == "copy_from_master_runtime":
        return "active_dynamic"
    if action == "copy_from_master_source":
        return "source"
    if action == "move_as_source" and audit_status == "unreferenced":
        return "source"
    return audit_status


def notes_for(asset: dict, is_tracked: bool, action: str) -> str:
    notes = []
    if not is_tracked:
        notes.append("untracked file; do not include in migration commit unless intentionally accepted")
    if (
        asset["status"] == "active"
        and not asset["references"]
        and asset["path"].startswith(("assets/enemies/battle/", "assets/enemies/portraits/"))
    ):
        notes.append("dynamic runtime asset inferred from enemy data and demo path helpers")
    elif asset["status"] == "active":
        notes.append("runtime/config referenced")
    if asset["status"] == "candidate":
        notes.append("candidate asset; keep outside formal runtime directory")
    if action == "copy_as_source":
        notes.append("source counterpart for active runtime asset")
    if action == "move_then_rewrite_dynamic_refs":
        if asset["path"].startswith(("遗物/图标/", "assets/relics/icons/")):
            notes.append("dynamic runtime reference from FORMAL_RELIC_ICON_IDS and resolveRelicIconPath")
        else:
            notes.append("dynamic runtime reference from src/data/enemies.js and demo path helpers")
    if action == "copy_from_master_runtime":
        notes.append("copy runtime relic icon from master fallback for a formal relic id")
    if action == "copy_from_master_source":
        notes.append("copy source relic icon from master source for a formal relic id")
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
