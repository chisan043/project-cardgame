#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGameData } from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = [
    'questers_demo_v0.99.html',
    'src/data/cards.js',
    'src/data/relics.js'
];
const FORBIDDEN_TOKENS = [
    'overlay-init-relic',
    'showInitRelicOverlay',
    'applyStarterCoreRelic',
    'STARTER_CORE_RELIC_IDS',
    'STARTER_CORE_CARD_TRANSFORMS',
    'shouldOfferStarterDirectionChoice',
    'generateStarterDirectionChoices',
    '选择战斗方向'
];
const LEGACY_OPENING_RELIC_IDS = new Set([
    'r_oathblade_beacon', 'r_execution_warrant', 'r_bloodoath_contract',
    'r_chant_astrolabe', 'r_mirror_catalog', 'r_calamity_orb',
    'r_gale_weatherwane', 'r_venom_seedcase', 'r_exile_roadsign'
]);

const source = SOURCES.map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
const staleTokens = FORBIDDEN_TOKENS.filter(token => source.includes(token));
if (staleTokens.length) throw new Error(`Opening archetype selection returned: ${staleTokens.join(', ')}`);

const data = loadGameData();
const activeLegacyRelics = data.RELIC_POOL.filter(relic => LEGACY_OPENING_RELIC_IDS.has(relic.id));
if (activeLegacyRelics.length) {
    throw new Error(`Legacy opening relics remain obtainable: ${activeLegacyRelics.map(relic => relic.id).join(', ')}`);
}

function getCardBuildTags(roleId, card) {
    if (card.buildNeutral) return [];
    const explicit = card.buildTags || data.CARD_BUILD_TAGS_BY_ID[card.poolId || card.id] || [];
    const inferred = Object.entries(data.BUILD_DIRECTIONS[roleId] || {})
        .filter(([, config]) => (card.tags || []).some(tag => (config.triggerTags || []).includes(tag)))
        .map(([buildTag]) => buildTag);
    return [...new Set([...explicit, ...inferred])];
}

for (const [roleId, directions] of Object.entries(data.BUILD_DIRECTIONS)) {
    const roleRelics = data.ROLE_RELIC_IDS[roleId];
    for (const buildTag of Object.keys(directions)) {
        const probabilityRelics = Object.entries(data.RELIC_CARD_REWARD_BONUS_BY_ID)
            .filter(([, tag]) => tag === buildTag)
            .map(([id]) => data.RELIC_POOL.find(relic => relic.id === id))
            .filter(relic => relic && (roleRelics.has(relic.id) || data.COMMON_RELIC_IDS.has(relic.id)));
        if (!probabilityRelics.length) throw new Error(`Missing obtainable probability relic for ${roleId}/${buildTag}`);
    }
}

const warriorCards = data.CHARACTER_CARD_POOLS.hero_warrior;
for (const pair of [['oathblade', 'execution'], ['execution', 'bloodoath']]) {
    const bridges = warriorCards.filter(card => pair.every(tag => getCardBuildTags('hero_warrior', card).includes(tag)));
    if (!bridges.length) throw new Error(`Missing warrior bridge cards for ${pair.join('+')}`);
}

const bloodoathShieldViolations = warriorCards.filter(card => {
    const tags = getCardBuildTags('hero_warrior', card);
    return tags.includes('bloodoath') && (
        card.type === '防御'
        || (card.tags || []).includes('庇护')
        || card.directEffects?.protection
    );
});
if (bloodoathShieldViolations.length) {
    throw new Error(`Bloodoath shield regression: ${bloodoathShieldViolations.map(card => card.name).join(', ')}`);
}

console.log('Open build flow guard: pass');
