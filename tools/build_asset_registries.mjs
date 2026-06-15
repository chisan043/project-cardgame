#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGameData } from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARD_REGISTRY_PATH = 'assets/cards/card-art-registry.json';
const RELIC_REGISTRY_PATH = 'assets/relics/relic-icon-registry.json';
const CHARACTER_REGISTRY_PATH = 'assets/characters/character-asset-registry.json';
const ENEMY_REGISTRY_PATH = 'assets/enemies/enemy-asset-registry.json';
const SCENE_REGISTRY_PATH = 'assets/scenes/scene-asset-registry.json';
const VFX_REGISTRY_PATH = 'assets/vfx/vfx-asset-registry.json';
const ASSET_EXTENSIONS = new Set(['.avif', '.gif', '.jpg', '.jpeg', '.png', '.webp']);
const ENEMY_ATTACK_FRAME_DURATIONS = [110, 120, 170, 120];
const ROLE_SELECT_FRAME_FILE = `role_select_frame_v1${'.webp'}`;

function parseArgs(argv) {
    return {
        check: argv.includes('--check')
    };
}

function posixPath(...parts) {
    return parts.join('/').replace(/\\/g, '/');
}

function readSource(file) {
    return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function extractCardArtRegistry() {
    const source = readSource('src/data/cards.js');
    const match = source.match(/const CARD_ART_REGISTRY = \{([\s\S]*?)\n\};/);
    if (!match) throw new Error('CARD_ART_REGISTRY block not found');
    const entries = [];
    const entryRe = /'([^']+)':\s*'([^']+)'/g;
    let entry;
    while ((entry = entryRe.exec(match[1]))) {
        entries.push({ name: entry[1], path: entry[2], source: 'CARD_ART_REGISTRY' });
    }
    return entries;
}

function extractPythonStringMap(file, mapName) {
    const source = readSource(file);
    const match = source.match(new RegExp(`${mapName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\}`));
    if (!match) throw new Error(`${mapName} block not found in ${file}`);
    const entries = {};
    const entryRe = /["']([^"']+)["']:\s*["']([^"']+)["']/g;
    let entry;
    while ((entry = entryRe.exec(match[1]))) entries[entry[1]] = entry[2];
    return entries;
}

function addUsage(map, assetPath, usage) {
    if (!assetPath) return;
    if (!map.has(assetPath)) map.set(assetPath, []);
    map.get(assetPath).push(usage);
}

function uniqueSorted(values) {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function assetExists(assetPath) {
    return fs.existsSync(path.join(ROOT, assetPath));
}

function assetKey(assetPath, prefix = 'assets/') {
    return assetPath.replace(new RegExp(`^${prefix}`), '').replace(/\.(?:avif|gif|jpe?g|png|webp)$/i, '');
}

function pushAsset(assets, assetPath, usage) {
    if (!assetPath) return;
    let asset = assets.find(item => item.path === assetPath);
    if (!asset) {
        asset = {
            key: assetKey(assetPath),
            path: assetPath,
            exists: assetExists(assetPath),
            usedBy: []
        };
        assets.push(asset);
    }
    if (usage) asset.usedBy.push(usage);
}

function pushFrameAssets(assets, frames = [], usage) {
    for (const frame of frames) pushAsset(assets, frame.src, usage);
}

function sortAssets(assets) {
    return assets
        .map(asset => ({
            ...asset,
            usedBy: asset.usedBy.sort((a, b) => `${a.kind || ''}:${a.name || ''}`.localeCompare(`${b.kind || ''}:${b.name || ''}`))
        }))
        .sort((a, b) => a.path.localeCompare(b.path));
}

function collectAssetFiles(rootRelPath) {
    const rootPath = path.join(ROOT, rootRelPath);
    if (!fs.existsSync(rootPath)) return [];
    const results = [];
    const walk = directory => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            if (entry.name === '.DS_Store') continue;
            const absPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(absPath);
                continue;
            }
            if (!ASSET_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
            results.push(path.relative(ROOT, absPath).replace(/\\/g, '/'));
        }
    };
    walk(rootPath);
    return results.sort((a, b) => a.localeCompare(b));
}

function collectCards(data) {
    const cards = [];
    for (const [roleId, pool] of Object.entries(data.CHARACTER_CARD_POOLS)) {
        for (const card of pool) cards.push({ ...card, roleId: card.roleId || roleId, pool: 'character' });
    }
    for (const card of data.NEUTRAL_CARD_POOL) cards.push({ ...card, roleId: card.roleId || 'neutral', pool: 'neutral' });
    for (const [roleId, pool] of Object.entries(data.SPECIAL_EPIC_POOLS)) {
        for (const card of pool) cards.push({ ...card, roleId: card.roleId || roleId, pool: 'special_epic' });
    }
    for (const [deckId, deck] of Object.entries(data.STARTER_DECKS)) {
        for (const card of deck.cards) cards.push({ ...card, roleId: deck.roleId, pool: 'starter', deckId });
    }
    return cards;
}

function cardAssetKey(assetPath) {
    const match = assetPath.match(/^assets\/cards\/art\/([^/]+)\//);
    return match ? match[1] : 'unknown';
}

function buildCardRegistry(data) {
    const artByName = new Map(extractCardArtRegistry().map(item => [item.name, item.path]));
    const usageByPath = new Map();
    for (const card of collectCards(data)) {
        const assetPath = card.art || artByName.get(card.name);
        addUsage(usageByPath, assetPath, {
            id: card.id || card.poolId || null,
            name: card.name,
            roleId: card.roleId || null,
            pool: card.pool,
            deckId: card.deckId || null,
            rarity: card.rarity || null
        });
    }

    const assets = [...usageByPath.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([assetPath, usages]) => ({
            key: assetPath.replace(/^assets\/cards\/art\//, '').replace(/\.(?:png|webp)$/i, ''),
            path: assetPath,
            domain: 'cards',
            theme: cardAssetKey(assetPath),
            exists: fs.existsSync(path.join(ROOT, assetPath)),
            usedBy: usages.sort((a, b) => `${a.pool}:${a.name}`.localeCompare(`${b.pool}:${b.name}`))
        }));

    return {
        generatedBy: 'tools/build_asset_registries.mjs',
        sourceData: ['src/data/cards.js'],
        policy: 'Runtime card art lives under assets/cards/art/<theme>/ and is referenced by stable path keys.',
        assetCount: assets.length,
        missingAssetCount: assets.filter(asset => !asset.exists).length,
        cardsWithArtCount: assets.reduce((total, asset) => total + asset.usedBy.length, 0),
        themes: uniqueSorted(assets.map(asset => asset.theme)),
        assets
    };
}

function buildRelicRegistry(data) {
    const assets = data.RELIC_POOL
        .map(relic => {
            const assetPath = posixPath('assets/relics/icons', `${relic.id}_icon_v1.webp`);
            return {
                key: relic.id,
                path: assetPath,
                domain: 'relics',
                exists: fs.existsSync(path.join(ROOT, assetPath)),
                sourcePath: posixPath('assets/source/relics/icons', `${relic.id}_icon_v1_source.png`),
                sourceExists: fs.existsSync(path.join(ROOT, 'assets/source/relics/icons', `${relic.id}_icon_v1_source.png`)),
                usedBy: [{
                    id: relic.id,
                    name: relic.name,
                    roleId: relic.roleId || null,
                    rarity: relic.rarity || null,
                    buildTags: data.RELIC_BUILD_TAGS_BY_ID[relic.id] || []
                }]
            };
        })
        .sort((a, b) => a.key.localeCompare(b.key));

    return {
        generatedBy: 'tools/build_asset_registries.mjs',
        sourceData: ['src/data/relics.js'],
        policy: 'Runtime relic icons live under assets/relics/icons and use {relic_id}_icon_v1.webp.',
        assetCount: assets.length,
        missingAssetCount: assets.filter(asset => !asset.exists).length,
        missingSourceCount: assets.filter(asset => !asset.sourceExists).length,
        assets
    };
}

function roleSlug(characterId) {
    return String(characterId).replace(/^hero_/, '');
}

function buildCharacterRegistry(data) {
    const assets = [];
    for (const character of Object.values(data.CHARACTERS)) {
        const usageBase = {
            id: character.id,
            name: character.name,
            roleId: character.id
        };
        pushAsset(assets, character.portrait, { ...usageBase, kind: 'role_select_portrait' });
        pushAsset(assets, character.avatarPortrait, { ...usageBase, kind: 'hud_avatar' });
        pushAsset(assets, character.battleBack, { ...usageBase, kind: 'battle_idle' });
        pushFrameAssets(assets, character.battleBackAttackFrames, { ...usageBase, kind: 'battle_attack_animation' });
        pushFrameAssets(assets, character.battleBackHurtFrames, { ...usageBase, kind: 'battle_hurt_animation' });
        pushAsset(assets, posixPath('assets/characters', roleSlug(character.id), ROLE_SELECT_FRAME_FILE), {
            ...usageBase,
            kind: 'role_select_frame'
        });
    }

    const sortedAssets = sortAssets(assets);
    return {
        generatedBy: 'tools/build_asset_registries.mjs',
        sourceData: ['src/data/characters.js', 'questers_demo_v0.99.html'],
        policy: 'Runtime character portraits, role frames, and battle animation frames live under assets/characters/<role>/ and are registered from character data.',
        assetCount: sortedAssets.length,
        missingAssetCount: sortedAssets.filter(asset => !asset.exists).length,
        charactersCovered: Object.keys(data.CHARACTERS).length,
        assets: sortedAssets
    };
}

function baseEnemyName(enemy) {
    return (enemy?.name || '').replace(/·.*?(?=】)/, '').replace(/·暴走/g, '');
}

function collectEnemyVariants(data) {
    const enemies = [];
    for (const enemy of data.ENEMIES) {
        enemies.push({ ...enemy, variant: 'base' });
        if (enemy.phase2) {
            enemies.push({
                ...enemy.phase2,
                variant: 'phase2',
                parentName: enemy.name,
                type: enemy.type || enemy.phase2.type || null
            });
        }
    }
    return enemies;
}

function buildEnemyRegistry(data) {
    const enemyNameSlugs = extractPythonStringMap('tools/plan_asset_migration.py', 'ENEMY_NAME_SLUGS');
    const assets = [];
    const enemies = collectEnemyVariants(data);
    const missingSlugNames = [];

    for (const enemy of enemies) {
        const slug = enemyNameSlugs[baseEnemyName(enemy)];
        if (!slug) {
            missingSlugNames.push(enemy.name);
            continue;
        }
        const usageBase = {
            name: enemy.name,
            baseName: baseEnemyName(enemy),
            slug,
            tier: enemy.tier || null,
            type: enemy.type || 'normal',
            variant: enemy.variant
        };
        pushAsset(assets, posixPath('assets/enemies/battle', `${slug}_battle_v1.webp`), {
            ...usageBase,
            kind: 'battle_sprite'
        });
        pushAsset(assets, posixPath('assets/enemies/portraits', `${slug}_portrait_v1.webp`), {
            ...usageBase,
            kind: 'hud_portrait'
        });
        ENEMY_ATTACK_FRAME_DURATIONS.forEach((duration, index) => {
            pushAsset(assets, posixPath('assets/enemies/attack', `${slug}_attack_${String(index + 1).padStart(2, '0')}_v1.webp`), {
                ...usageBase,
                kind: 'attack_animation',
                frame: index + 1,
                duration
            });
        });
    }

    const sortedAssets = sortAssets(assets);
    return {
        generatedBy: 'tools/build_asset_registries.mjs',
        sourceData: ['src/data/enemies.js', 'src/runtime/visual-rules.js', 'tools/plan_asset_migration.py'],
        policy: 'Runtime enemy portraits, battle sprites, and four attack frames use stable slug-based paths.',
        assetCount: sortedAssets.length,
        missingAssetCount: sortedAssets.filter(asset => !asset.exists).length,
        enemyCount: enemies.length,
        missingSlugNames,
        assets: sortedAssets
    };
}

function buildSceneRegistry() {
    const assets = collectAssetFiles('assets/scenes').map(assetPath => ({
        key: assetKey(assetPath, 'assets/scenes/'),
        path: assetPath,
        domain: 'scenes',
        exists: assetExists(assetPath),
        usedBy: [{
            kind: assetPath.startsWith('assets/scenes/event/') ? 'event_scene' : 'battle_background',
            name: path.basename(assetPath, path.extname(assetPath))
        }]
    }));

    return {
        generatedBy: 'tools/build_asset_registries.mjs',
        sourceData: ['assets/scenes/**', 'src/runtime/map-rules.js', 'questers_demo_v0.99.html'],
        policy: 'Active scene backgrounds live under assets/scenes and are inventoried so additions/removals update the generated registry.',
        assetCount: assets.length,
        missingAssetCount: assets.filter(asset => !asset.exists).length,
        groups: uniqueSorted(assets.map(asset => path.dirname(asset.path).replace(/^assets\/scenes\/?/, '') || 'root')),
        assets
    };
}

function buildVfxRegistry(data) {
    const assets = [];
    for (const character of Object.values(data.CHARACTERS)) {
        const usageBase = {
            id: character.id,
            name: character.name,
            roleId: character.id
        };
        pushFrameAssets(assets, character.battleAttackVfxFrames, { ...usageBase, kind: 'player_attack_vfx' });
        for (const [kind, config] of Object.entries(character.battleBuffVfx || {})) {
            pushFrameAssets(assets, config.frames, { ...usageBase, kind: `player_buff_vfx:${kind}` });
        }
    }
    for (const assetPath of collectAssetFiles('assets/vfx/player_defense')) {
        pushAsset(assets, assetPath, { kind: 'player_defense_vfx', name: path.basename(assetPath, path.extname(assetPath)) });
    }
    for (const assetPath of collectAssetFiles('assets/vfx/enemy_attack')) {
        pushAsset(assets, assetPath, { kind: 'enemy_attack_vfx', name: path.basename(assetPath, path.extname(assetPath)) });
    }

    const sortedAssets = sortAssets(assets).map(asset => ({
        ...asset,
        domain: 'vfx'
    }));
    return {
        generatedBy: 'tools/build_asset_registries.mjs',
        sourceData: ['src/data/characters.js', 'src/runtime/visual-rules.js', 'questers_demo_v0.99.html', 'assets/vfx/**'],
        policy: 'Active player, enemy, and defense VFX assets live under assets/vfx and are registered from character data plus active VFX folders.',
        assetCount: sortedAssets.length,
        missingAssetCount: sortedAssets.filter(asset => !asset.exists).length,
        groups: uniqueSorted(sortedAssets.map(asset => path.dirname(asset.path).replace(/^assets\/vfx\/?/, '') || 'root')),
        assets: sortedAssets
    };
}

function writeJson(relPath, data) {
    fs.mkdirSync(path.dirname(path.join(ROOT, relPath)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, relPath), `${JSON.stringify(data, null, 2)}\n`);
}

function assertRegistryFresh(relPath, data) {
    const absPath = path.join(ROOT, relPath);
    const expected = `${JSON.stringify(data, null, 2)}\n`;
    if (!fs.existsSync(absPath)) throw new Error(`Missing generated registry: ${relPath}`);
    const current = fs.readFileSync(absPath, 'utf8');
    if (current !== expected) throw new Error(`Generated registry is stale: ${relPath}`);
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const data = loadGameData();
    const registries = [
        [CARD_REGISTRY_PATH, buildCardRegistry(data)],
        [RELIC_REGISTRY_PATH, buildRelicRegistry(data)],
        [CHARACTER_REGISTRY_PATH, buildCharacterRegistry(data)],
        [ENEMY_REGISTRY_PATH, buildEnemyRegistry(data)],
        [SCENE_REGISTRY_PATH, buildSceneRegistry(data)],
        [VFX_REGISTRY_PATH, buildVfxRegistry(data)]
    ];
    const missing = registries
        .map(([registryPath, registry]) => [registryPath, registry.missingAssetCount || 0])
        .filter(([, count]) => count > 0);
    if (missing.length) {
        throw new Error(`Missing registry assets: ${missing.map(([registryPath, count]) => `${registryPath}=${count}`).join(', ')}`);
    }
    const enemyRegistry = registries.find(([registryPath]) => registryPath === ENEMY_REGISTRY_PATH)[1];
    if (enemyRegistry.missingSlugNames.length) {
        throw new Error(`Missing enemy asset slugs: ${enemyRegistry.missingSlugNames.join(', ')}`);
    }
    if (args.check) {
        for (const [registryPath, registry] of registries) {
            assertRegistryFresh(registryPath, registry);
            console.log(`Checked ${registryPath}: ${registry.assetCount} assets`);
        }
        return;
    }
    for (const [registryPath, registry] of registries) {
        writeJson(registryPath, registry);
        console.log(`Wrote ${registryPath}: ${registry.assetCount} assets`);
    }
}

run();
