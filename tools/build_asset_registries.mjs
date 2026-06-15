#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGameData } from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARD_REGISTRY_PATH = 'assets/cards/card-art-registry.json';
const RELIC_REGISTRY_PATH = 'assets/relics/relic-icon-registry.json';

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

function addUsage(map, assetPath, usage) {
    if (!assetPath) return;
    if (!map.has(assetPath)) map.set(assetPath, []);
    map.get(assetPath).push(usage);
}

function uniqueSorted(values) {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
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
    const cardRegistry = buildCardRegistry(data);
    const relicRegistry = buildRelicRegistry(data);
    if (cardRegistry.missingAssetCount || relicRegistry.missingAssetCount) {
        throw new Error(`Missing registry assets: cards=${cardRegistry.missingAssetCount}, relics=${relicRegistry.missingAssetCount}`);
    }
    if (args.check) {
        assertRegistryFresh(CARD_REGISTRY_PATH, cardRegistry);
        assertRegistryFresh(RELIC_REGISTRY_PATH, relicRegistry);
        console.log(`Checked ${CARD_REGISTRY_PATH}: ${cardRegistry.assetCount} assets`);
        console.log(`Checked ${RELIC_REGISTRY_PATH}: ${relicRegistry.assetCount} assets`);
        return;
    }
    writeJson(CARD_REGISTRY_PATH, cardRegistry);
    writeJson(RELIC_REGISTRY_PATH, relicRegistry);
    console.log(`Wrote ${CARD_REGISTRY_PATH}: ${cardRegistry.assetCount} assets`);
    console.log(`Wrote ${RELIC_REGISTRY_PATH}: ${relicRegistry.assetCount} assets`);
}

run();
