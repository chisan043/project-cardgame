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
const COMMON_ROLE_CARD_TAGS = ['抽牌', '充能', '保留', '重置', '销毁'];
const ROLE_ALLOWED_CARD_TAGS = {
    hero_warrior: new Set([
        ...COMMON_ROLE_CARD_TAGS,
        '血祭', '血誓', '狂热', '附魔', '庇护', '反击', '吸血', '治愈', '出血', '放血',
        '重击', '穿甲', '圣剑', '连击', '易伤', '虚弱', '眩晕', '荆棘'
    ]),
    hero_mage: new Set([
        ...COMMON_ROLE_CARD_TAGS,
        '附魔', '庇护', '回响', '复刻', '燃烧', '眩晕', '诅咒',
        '穿甲', '咏唱', '爆发', '易伤', '虚弱', '治愈'
    ]),
    hero_archer: new Set([
        ...COMMON_ROLE_CARD_TAGS,
        '回收', '放逐', '剧毒', '出血', '放血', '穿甲',
        '蓄力', '自然', '闪避', '追击', '易伤', '虚弱', '眩晕'
    ])
};
const NEUTRAL_CARD_LIMIT = 8;
const NEUTRAL_ALLOWED_CARD_TAGS = new Set([
    '抽牌', '充能', '保留', '重置', '销毁', '庇护', '治愈', '易伤', '虚弱', '眩晕'
]);

const source = SOURCES.map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
const staleTokens = FORBIDDEN_TOKENS.filter(token => source.includes(token));
if (staleTokens.length) throw new Error(`Opening archetype selection returned: ${staleTokens.join(', ')}`);

const data = loadGameData();
if (data.CHARACTERS.hero_warrior.subtitle !== '圣剑 / 处刑 / 魔剑') {
    throw new Error(`Warrior subtitle should be 圣剑 / 处刑 / 魔剑, got ${data.CHARACTERS.hero_warrior.subtitle}`);
}
const activeLegacyRelics = data.RELIC_POOL.filter(relic => LEGACY_OPENING_RELIC_IDS.has(relic.id));
if (activeLegacyRelics.length) {
    throw new Error(`Legacy opening relics remain obtainable: ${activeLegacyRelics.map(relic => relic.id).join(', ')}`);
}
if (data.ROLE_CARD_TAG_POLICY_DROPS?.length) {
    const drops = data.ROLE_CARD_TAG_POLICY_DROPS
        .map(drop => `${drop.roleId}/${drop.cardName}:${drop.tags.join('+')}`);
    throw new Error(`Source card tags outside role vocabulary: ${drops.join(', ')}`);
}
if (data.NEUTRAL_CARD_POOL.length > NEUTRAL_CARD_LIMIT) {
    throw new Error(`Neutral card pool is too large: ${data.NEUTRAL_CARD_POOL.length}/${NEUTRAL_CARD_LIMIT}`);
}
const neutralOffVocabulary = data.NEUTRAL_CARD_POOL.flatMap(card => (card.tags || [])
    .filter(tag => !NEUTRAL_ALLOWED_CARD_TAGS.has(tag))
    .map(tag => `${card.name}:${tag}`));
if (neutralOffVocabulary.length) {
    throw new Error(`Neutral cards use role-specific tags: ${neutralOffVocabulary.join(', ')}`);
}

function checkRoleCardTags(roleId, cards, sourceName) {
    const allowedTags = ROLE_ALLOWED_CARD_TAGS[roleId];
    if (!allowedTags) return [];
    return cards.flatMap(card => (card.tags || [])
        .filter(tag => !allowedTags.has(tag))
        .map(tag => `${sourceName}/${roleId}/${card.name}:${tag}`));
}

const offRoleTags = [
    ...Object.entries(data.CHARACTER_CARD_POOLS)
        .flatMap(([roleId, cards]) => checkRoleCardTags(roleId, cards, 'cardPool')),
    ...Object.values(data.STARTER_DECKS)
        .flatMap(deck => checkRoleCardTags(deck.roleId, deck.cards, 'starterDeck')),
    ...Object.entries(data.SPECIAL_EPIC_POOLS)
        .flatMap(([roleId, cards]) => checkRoleCardTags(roleId, cards, 'specialEpicPool'))
];
if (offRoleTags.length) {
    throw new Error(`Off-role card tags remain: ${offRoleTags.join(', ')}`);
}

for (const roleId of Object.keys(data.CHARACTERS)) {
    const relicId = data.STARTING_RELIC_BY_ROLE[roleId];
    if (!relicId || !data.STARTING_RELIC_IDS.has(relicId)) throw new Error(`Missing fixed starting relic for ${roleId}`);
    if (!data.RELIC_POOL.some(relic => relic.id === relicId)) throw new Error(`Starting relic is absent from relic data: ${relicId}`);
    if (!data.ROLE_RELIC_IDS[roleId]?.has(relicId)) throw new Error(`Starting relic is not owned by ${roleId}: ${relicId}`);
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

const specialCards = Object.values(data.SPECIAL_EPIC_POOLS).flat();
function findSpecialCard(id) {
    const card = specialCards.find(item => item.id === id);
    if (!card) throw new Error(`Missing special card: ${id}`);
    return card;
}

const executionClaim = findSpecialCard('w_exec_claim');
if ((Number(executionClaim.val) || 0) < 15 || !data.hasDirectCardEffect(executionClaim, 'draw')) {
    throw new Error('Execution core contract failed: w_exec_claim needs at least 15 base value and direct draw');
}

const bloodCrucible = findSpecialCard('w_blood_crucible');
if (bloodCrucible.directEffects?.protection || (bloodCrucible.tags || []).includes('庇护') || bloodCrucible.type === '防御') {
    throw new Error('Bloodoath identity contract failed: w_blood_crucible must not rely on shield/protection');
}
if ((Number(bloodCrucible.drawCount) || 0) < 3 || (Number(bloodCrucible.bloodDebtWeak) || 0) < 2) {
    throw new Error('Bloodoath floor contract failed: w_blood_crucible needs draw and weak pressure');
}

const mirrorFlow = findSpecialCard('a_syn_magic');
if ((Number(mirrorFlow.nextDamageBonus) || 0) < 16) {
    throw new Error('Mirror core contract failed: a_syn_magic next damage bonus is too low');
}

const statusSupernova = findSpecialCard('m_status_supernova');
const supernovaTags = statusSupernova.tags || [];
const supernovaMappedBuilds = data.CARD_BUILD_TAGS_BY_ID.m_status_supernova || [];
if (supernovaTags.includes('爆发') || supernovaMappedBuilds.includes('chant') || (statusSupernova.buildTags || []).includes('chant')) {
    throw new Error('Calamity core contract failed: m_status_supernova must not be classified as chant');
}

const poisonArray = findSpecialCard('a_syn_poison');
for (const [field, minimum] of Object.entries({ basePoison: 1, baseBleed: 1, baseDamage: 1, poisonPerDiscard: 1, bleedPerDiscard: 1, damagePerDiscard: 1, protectVal: 1 })) {
    if ((Number(poisonArray[field]) || 0) < minimum) {
        throw new Error(`Venom core contract failed: a_syn_poison missing ${field}`);
    }
}
if ((Number(poisonArray.drawCount) || 0) < 1 || (Number(poisonArray.energyOnDiscard) || 0) < 1) {
    throw new Error('Venom core contract failed: a_syn_poison needs draw and discard energy compensation');
}

const poisonStep = data.CHARACTER_CARD_POOLS.hero_archer.find(card => card.poolId === 'archer_poison_step');
if (!poisonStep || (Number(poisonStep.val) || 0) > 13) {
    throw new Error('Venom non-core contract failed: archer_poison_step should no longer outclass venom cores');
}

console.log('Open build flow guard: pass');
