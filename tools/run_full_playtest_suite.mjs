#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CHECKPOINTS,
    MATURE_LOADOUTS,
    createRng,
    loadGameData,
    makeStarterDeck,
    simulateBattle
} from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_REPORT_DIR = 'tools/playtest_reports';
const NODE_LABELS = {
    normal: '普通怪',
    elite: '精英',
    shop: '商店',
    event: '事件',
    rest: '休息点',
    chest: '宝箱',
    boss: 'Boss'
};
const PROFILE_LABELS = {
    experienced: '熟练玩家',
    novice: '新手'
};
const TARGETS = {
    experiencedClearRate: { min: 0.50, max: 0.75 },
    noviceAct1BossReachRate: { min: 0.65 },
    deadCardRatio: { max: 0.20 },
    maxRunMinutes: { max: 55 },
    maxBattleTurns: { max: 18 },
    maxHealingToHpRatio: { max: 2.2 }
};

function parseArgs(argv) {
    const result = {
        runsPerBuild: 40,
        noviceRunsPerBuild: 12,
        seed: 20260614,
        reportDir: DEFAULT_REPORT_DIR
    };
    for (let index = 0; index < argv.length; index++) {
        if (argv[index] === '--runs-per-build') result.runsPerBuild = Number(argv[++index]);
        else if (argv[index] === '--novice-runs-per-build') result.noviceRunsPerBuild = Number(argv[++index]);
        else if (argv[index] === '--seed') result.seed = Number(argv[++index]);
        else if (argv[index] === '--report-dir') result.reportDir = argv[++index];
    }
    if (!Number.isFinite(result.runsPerBuild) || result.runsPerBuild < 5) throw new Error('--runs-per-build must be at least 5');
    if (!Number.isFinite(result.noviceRunsPerBuild) || result.noviceRunsPerBuild < 0) throw new Error('--novice-runs-per-build must be at least 0');
    return result;
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function fixed(value, digits = 1) {
    return Number.isFinite(value) ? value.toFixed(digits) : '0.0';
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function cardId(card) {
    return card.poolId || card.specialId || card.id || card.name;
}

function relicName(data, id) {
    return data.RELIC_POOL.find(relic => relic.id === id)?.name || id;
}

function cardBuildTags(data, roleId, card) {
    if (card.buildNeutral) return [];
    const explicit = card.buildTags || data.CARD_BUILD_TAGS_BY_ID[cardId(card)] || [];
    const inferred = Object.entries(data.BUILD_DIRECTIONS[roleId] || {})
        .filter(([, config]) => (card.tags || []).some(tag => (config.triggerTags || []).includes(tag)))
        .map(([buildTag]) => buildTag);
    return [...new Set([...explicit, ...inferred])];
}

function shuffle(rng, items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const swap = Math.floor(rng() * (index + 1));
        [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
}

function weightedPick(rng, items, weightOf) {
    const weighted = items.map(item => ({ item, weight: Math.max(0.01, weightOf(item)) }));
    let roll = rng() * weighted.reduce((sum, entry) => sum + entry.weight, 0);
    for (const entry of weighted) {
        roll -= entry.weight;
        if (roll <= 0) return entry.item;
    }
    return weighted.at(-1)?.item || null;
}

function makeEmptyStats() {
    return {
        runs: [],
        cards: {},
        relics: {},
        enemies: {},
        floors: {},
        chapters: {},
        routes: {},
        routePairs: {},
        combos: {},
        anomalies: [],
        battleCaps: { maxTurns: 0, maxHealingToHpRatio: 0, maxCardsPlayed: 0 }
    };
}

function getCardStats(stats, data, roleId, card) {
    const id = cardId(card);
    stats.cards[id] ||= {
        id,
        name: card.name,
        roleId,
        type: card.type || '',
        rarity: card.rarity || '',
        tags: (card.tags || []).join('/'),
        buildTags: cardBuildTags(data, roleId, card).join('/'),
        appearances: 0,
        selections: 0,
        upgraded: 0,
        drawOpportunities: 0,
        plays: 0,
        selectedRuns: 0,
        selectedRunWins: 0,
        contribution: 0,
        playerRatingTotal: 0,
        playerRatingCount: 0
    };
    return stats.cards[id];
}

function getRelicStats(stats, data, relicId) {
    stats.relics[relicId] ||= {
        id: relicId,
        name: relicName(data, relicId),
        obtained: 0,
        floorTotal: 0,
        runWins: 0,
        triggerCount: 0,
        estimatedBenefit: 0,
        playerRatingTotal: 0,
        playerRatingCount: 0
    };
    return stats.relics[relicId];
}

function getEnemyStats(stats, enemyName) {
    stats.enemies[enemyName] ||= {
        name: enemyName,
        encounters: 0,
        wins: 0,
        deaths: 0,
        damageTaken: 0,
        turns: 0,
        negativeFeedback: 0
    };
    return stats.enemies[enemyName];
}

function getFloorStats(stats, floor) {
    stats.floors[floor] ||= {
        floor,
        reached: 0,
        deaths: 0,
        battles: 0,
        wins: 0,
        hpLeft: 0,
        battleTurns: 0,
        damageTaken: 0
    };
    return stats.floors[floor];
}

function getChapterStats(stats, chapter) {
    stats.chapters[chapter] ||= {
        chapter,
        reached: 0,
        deaths: 0,
        battles: 0,
        wins: 0,
        bossAttempts: 0,
        bossWins: 0,
        eliteAttempts: 0,
        eliteWins: 0,
        hpLeft: 0,
        battleTurns: 0,
        damageTaken: 0
    };
    return stats.chapters[chapter];
}

function getRouteStats(stats, nodeType) {
    stats.routes[nodeType] ||= {
        nodeType,
        label: NODE_LABELS[nodeType],
        offered: 0,
        chosen: 0,
        hpDelta: 0,
        goldDelta: 0,
        cardRewards: 0,
        relicRewards: 0,
        upgrades: 0,
        removes: 0,
        winsAfterChoice: 0
    };
    return stats.routes[nodeType];
}

function chapterOf(floor) {
    if (floor <= 7) return 1;
    if (floor <= 14) return 2;
    return 3;
}

function checkpointForNode(floor, nodeType) {
    if (nodeType === 'boss') {
        if (floor < 20) return { id: `floor_${floor}_boss`, label: `第${chapterOf(floor)}章Boss`, floor: floor <= 7 ? 8 : 13, type: 'elite' };
        return { id: 'floor_20_final_boss', label: '最终Boss', floor: 19, type: 'boss' };
    }
    if (nodeType === 'elite') return { id: `floor_${floor}_elite`, label: `第${floor}层精英`, floor, type: 'elite' };
    return { id: `floor_${floor}_normal`, label: `第${floor}层普通战`, floor, type: 'normal' };
}

function fixedNodeType(floor) {
    if ([7, 14, 20].includes(floor)) return 'boss';
    if ([6, 13, 19].includes(floor)) return 'rest';
    return null;
}

function routeChoiceWeights(floor) {
    const chapter = chapterOf(floor);
    if (chapter === 1) return { normal: 6, elite: 1.3, shop: 1.0, event: 2.2, rest: 0.4, chest: 0.8 };
    if (chapter === 2) return { normal: 4.5, elite: 2.1, shop: 1.3, event: 1.8, rest: 0.7, chest: 1.0 };
    return { normal: 3.8, elite: 2.5, shop: 1.2, event: 1.4, rest: 0.8, chest: 1.1 };
}

function generateRouteChoices(rng, floor, hpRatio, gold, profile) {
    const fixedType = fixedNodeType(floor);
    if (fixedType) return [fixedType];
    const weights = routeChoiceWeights(floor);
    if (hpRatio < 0.45) weights.rest += 3.5;
    if (gold >= 80) weights.shop += 2;
    if (profile === 'novice') {
        weights.elite *= 0.45;
        weights.rest += 1.3;
        weights.normal += 1;
    }
    const choices = new Set(['normal']);
    let safety = 0;
    while (choices.size < 3 && safety++ < 20) {
        choices.add(weightedPick(rng, Object.keys(weights), type => weights[type]));
    }
    return [...choices];
}

function chooseRoute(rng, choices, hpRatio, gold, profile) {
    const skillNoise = profile === 'novice' ? 4.5 : 2.2;
    return choices
        .map(type => {
            let score = 0;
            if (type === 'normal') score = 5;
            if (type === 'elite') score = hpRatio > 0.65 ? 5.8 : hpRatio > 0.48 ? 3.8 : -4;
            if (type === 'shop') score = gold >= 90 ? 5.8 : gold >= 55 ? 4.5 : 0;
            if (type === 'event') score = hpRatio > 0.35 ? 4.5 : 1;
            if (type === 'rest') score = hpRatio < 0.45 ? 9 : hpRatio < 0.7 ? 5 : 1;
            if (type === 'chest') score = 5.4;
            if (type === 'boss') score = 99;
            if (profile === 'novice' && type === 'elite') score -= 2.5;
            return { type, score: score + (rng() - 0.5) * skillNoise };
        })
        .sort((left, right) => right.score - left.score)[0].type;
}

function allRewardCards(data, roleId) {
    return [...data.CHARACTER_CARD_POOLS[roleId], ...data.NEUTRAL_CARD_POOL];
}

function rewardRarity(rng, floor) {
    const bonus = Math.min(0.16, floor * 0.012);
    const roll = rng();
    if (roll < 0.08 + bonus) return '史诗';
    if (roll < 0.42 + bonus) return '稀有';
    return '普通';
}

function generateCardChoices(data, rng, roleId, buildId, floor, profile) {
    const rarity = rewardRarity(rng, floor);
    const cards = allRewardCards(data, roleId);
    const picked = [];
    const used = new Set();
    const noise = profile === 'novice' ? 0.85 : 0.35;
    for (let index = 0; index < 3; index++) {
        let candidates = cards.filter(card => !used.has(cardId(card)) && card.rarity === rarity);
        if (!candidates.length) candidates = cards.filter(card => !used.has(cardId(card)));
        const card = weightedPick(rng, candidates, candidate => {
            const buildTags = cardBuildTags(data, roleId, candidate);
            const aligned = buildTags.includes(buildId);
            const bridge = buildTags.length > 1;
            const neutral = candidate.buildNeutral || buildTags.length === 0;
            return (aligned ? 4.5 : bridge ? 2.5 : neutral ? 1.8 : 0.9) * (1 + rng() * noise);
        });
        if (!card) break;
        used.add(cardId(card));
        picked.push(card);
    }
    return picked;
}

function estimateCardScore(data, roleId, buildId, card, deck, hpRatio, profile, rng) {
    const buildTags = cardBuildTags(data, roleId, card);
    const tags = card.tags || [];
    let score = data.getScaledCardValue(card) / Math.max(1, Number(card.cost) || 1);
    if (buildTags.includes(buildId)) score += 12;
    else if (buildTags.length > 1) score += 6;
    else if (!buildTags.length || card.buildNeutral) score += 3;
    else score -= profile === 'novice' ? 1 : 3;
    if (card.type === '防御' && hpRatio < 0.6) score += 4;
    if (tags.includes('抽牌') || card.directEffects?.draw) score += 5;
    if (tags.includes('充能') || card.directEffects?.energy) score += 3;
    if (tags.includes('治愈') && hpRatio < 0.65) score += 4;
    if (tags.includes('回收')) score += deck.some(owned => (owned.tags || []).includes('放逐')) ? 5 : 1;
    if (tags.includes('放血')) score += deck.some(owned => (owned.tags || []).includes('出血')) ? 4 : 0;
    if (tags.includes('复刻') || tags.includes('回响')) score += deck.some(owned => owned.type === '攻击' || (owned.tags || []).includes('咏唱')) ? 3 : 0;
    score += card.rarity === '史诗' ? 3 : card.rarity === '稀有' ? 1.5 : 0;
    score -= deck.filter(owned => cardId(owned) === cardId(card)).length * 6;
    score += (rng() - 0.5) * (profile === 'novice' ? 12 : 5);
    return score;
}

function pickCardReward(data, rng, roleId, buildId, choices, deck, hpRatio, profile) {
    const skipScore = profile === 'novice' ? 2 : 4 + Math.max(0, deck.length - 16) * 1.2;
    const ranked = choices
        .map(card => ({ card, score: estimateCardScore(data, roleId, buildId, card, deck, hpRatio, profile, rng) }))
        .sort((left, right) => right.score - left.score);
    if (!ranked.length || ranked[0].score < skipScore) return null;
    return ranked[0].card;
}

function relicPool(data, roleId, owned) {
    const roleRelics = data.ROLE_RELIC_IDS[roleId] || new Set();
    return data.RELIC_POOL.filter(relic => !owned.has(relic.id)
        && !data.STARTING_RELIC_IDS.has(relic.id)
        && (data.COMMON_RELIC_IDS.has(relic.id) || roleRelics.has(relic.id)));
}

function awardRelic(data, rng, roleId, buildId, ownedRelics, floor) {
    const matureRelics = new Set(MATURE_LOADOUTS[buildId]?.relics || []);
    const candidates = relicPool(data, roleId, ownedRelics);
    if (!candidates.length) return null;
    const relic = weightedPick(rng, candidates, candidate => {
        let weight = 1;
        if (matureRelics.has(candidate.id)) weight += 5;
        if (data.RELIC_BUILD_TAGS_BY_ID[candidate.id] === buildId) weight += 4;
        if (floor >= 12 && candidate.price >= 180) weight += 1;
        return weight;
    });
    ownedRelics.add(relic.id);
    return relic.id;
}

function addCoreCardIfFound(data, rng, roleId, buildId, deck, floor, force = false) {
    const coreId = MATURE_LOADOUTS[buildId]?.core;
    if (!coreId || deck.some(card => cardId(card) === coreId)) return null;
    const chance = floor >= 14 ? 0.28 : floor >= 7 ? 0.16 : 0.04;
    if (!force && rng() > chance) return null;
    const core = data.SPECIAL_EPIC_POOLS[roleId].find(card => card.id === coreId);
    if (!core) return null;
    deck.push({ ...clone(core), specialId: core.id });
    return core;
}

function worstRemovableCard(deck) {
    const protectedCards = new Set(deck.filter(card => card.isSpecial).map(cardId));
    return deck
        .map((card, index) => {
            const tags = card.tags || [];
            let score = 0;
            score += dataValue(card) * 0.35;
            if (card.type === '攻击') score += 1;
            if (tags.includes('抽牌') || card.directEffects?.draw) score += 4;
            if (tags.includes('充能') || card.directEffects?.energy) score += 3;
            if (tags.includes('治愈') || tags.includes('闪避') || tags.includes('庇护')) score += 2;
            if (card.rarity === '史诗') score += 6;
            if (card.rarity === '稀有') score += 3;
            if (protectedCards.has(cardId(card))) score += 999;
            return { card, index, score };
        })
        .sort((left, right) => left.score - right.score)[0];
}

function dataValue(card) {
    return Math.max(0, Number(card.val) || 0) / Math.max(1, Number(card.cost) || 1);
}

function upgradeBestCard(deck, rng) {
    const candidates = deck.filter(card => !card.up && !card.isSpecial);
    if (!candidates.length) return null;
    const target = candidates
        .map(card => {
            const tags = card.tags || [];
            let score = dataValue(card);
            if (card.type === '攻击') score += 2;
            if (tags.includes('穿甲') || tags.includes('追击') || tags.includes('爆发') || tags.includes('重击')) score += 2;
            if (tags.includes('抽牌') || card.directEffects?.draw) score += 1.5;
            return { card, score: score + rng() };
        })
        .sort((left, right) => right.score - left.score)[0].card;
    target.up = true;
    target.rarity = '史诗';
    if ((Number(target.val) || 0) > 0) target.val *= 2;
    return target;
}

function assignSimulationIds(deck) {
    return deck.map((card, index) => ({ ...clone(card), simId: `${index}:${cardId(card)}` }));
}

function dominantBuild(data, roleId, deck) {
    const counts = {};
    for (const card of deck) {
        for (const tag of cardBuildTags(data, roleId, card)) counts[tag] = (counts[tag] || 0) + 1;
    }
    const [buildId] = Object.entries(counts).sort((left, right) => right[1] - left[1])[0] || [];
    return buildId ? data.BUILD_DIRECTIONS[roleId][buildId]?.name || buildId : '混合通用';
}

function estimateCardContribution(data, roleId, card, plays, opportunities) {
    const tags = card.tags || [];
    let value = data.getScaledCardValue(card);
    if (card.type === '防御') value *= 0.7;
    if (tags.includes('抽牌') || card.directEffects?.draw) value += 5;
    if (tags.includes('充能') || card.directEffects?.energy) value += 4;
    if (tags.includes('治愈') || card.directEffects?.heal) value += data.getCardHealValue(card) * 0.8;
    if (tags.includes('庇护') || card.directEffects?.protection) value += data.getProtectionValue(card) * 0.6;
    if (tags.includes('回收') || tags.includes('复刻') || tags.includes('回响')) value += 4;
    if (tags.includes('放逐') && roleId === 'hero_archer') value += 5;
    return value * plays / Math.max(1, opportunities || plays || 1);
}

function estimateRelicBattleImpact(relicId, result) {
    const plays = Object.values(result.cardPlays || {}).reduce((sum, value) => sum + value, 0);
    let triggers = 0;
    let benefit = 0;
    if (relicId.includes('boss') && result.enemy?.includes('首领')) {
        triggers = Math.max(1, Math.floor(plays / 2));
        benefit = result.damageDealt * 0.16;
    } else if (relicId.includes('elite') && result.enemy?.includes('精英')) {
        triggers = Math.max(1, Math.floor(plays / 2));
        benefit = result.damageDealt * 0.12;
    } else if (relicId.includes('draw') || relicId.includes('quill') || relicId.includes('spool')) {
        triggers = Math.max(0, Math.floor(plays / 3));
        benefit = triggers * 4;
    } else if (relicId.includes('poison') || relicId.includes('bleed') || relicId.includes('exhaust') || relicId.includes('return')) {
        triggers = Math.max(0, Math.floor(plays / 4));
        benefit = triggers * 5;
    } else if (relicId.includes('shield') || relicId.includes('protect') || relicId.includes('armor')) {
        triggers = Math.max(1, Math.floor(result.turns / 2));
        benefit = Math.min(result.damageTaken, triggers * 4);
    } else {
        triggers = result.turns > 0 ? 1 : 0;
        benefit = result.win ? 4 : 1;
    }
    return { triggers, benefit };
}

function subjectiveRunScore(run) {
    let score = run.cleared ? 4.3 : 1.4 + run.floorReached / 20 * 2.2;
    if (run.cleared && run.finalHpRatio > 0.45) score += 0.4;
    if (!run.cleared && run.floorReached >= 14) score += 0.4;
    if (run.deathReason && ['回合上限'].includes(run.deathReason)) score -= 0.8;
    if (run.totalMinutes > TARGETS.maxRunMinutes.max) score -= 0.5;
    return clamp(score, 1, 5);
}

function cardRating(choiceRate, usageRate, winRate) {
    return clamp(1 + choiceRate * 1.2 + usageRate * 1.4 + winRate * 1.5, 1, 5);
}

function relicRating(winRate, triggerPerRun, benefitPerRun) {
    return clamp(1 + winRate * 1.6 + Math.min(1.2, triggerPerRun * 0.08) + Math.min(1.2, benefitPerRun * 0.02), 1, 5);
}

function applyCardReward(data, stats, rng, roleId, buildId, deck, floor, hpRatio, profile, runCardsPicked) {
    const choices = generateCardChoices(data, rng, roleId, buildId, floor, profile);
    for (const card of choices) getCardStats(stats, data, roleId, card).appearances++;
    const selected = pickCardReward(data, rng, roleId, buildId, choices, deck, hpRatio, profile);
    if (!selected) return null;
    getCardStats(stats, data, roleId, selected).selections++;
    deck.push(clone(selected));
    runCardsPicked.add(cardId(selected));
    return selected;
}

function recordRouteChoices(stats, choices, chosenType) {
    for (const type of choices) getRouteStats(stats, type).offered++;
    getRouteStats(stats, chosenType).chosen++;
}

function simulateFullRun(data, stats, runConfig) {
    const { runId, roleId, buildId, profile, difficulty, seed } = runConfig;
    const rng = createRng(seed);
    const character = data.CHARACTERS[roleId];
    const deck = makeStarterDeck(data, rng, roleId, { relics: [], coreCard: null }).map(card => {
        const copy = clone(card);
        delete copy.simId;
        return copy;
    });
    const ownedRelics = new Set();
    const acquiredRelics = [];
    const coreCards = [];
    const coreRelics = new Set(MATURE_LOADOUTS[buildId]?.relics || []);
    const runCardsPicked = new Set();
    const runRelicsPicked = new Set();
    let hp = character.maxHp;
    let gold = profile === 'novice' ? 65 : 90;
    let totalMinutes = 0;
    let eliteKills = 0;
    let shops = 0;
    let removes = 0;
    let upgrades = 0;
    let deathFloor = null;
    let deathReason = '';
    let floorReached = 0;
    let act1BossReached = false;
    let act1BossPassed = false;
    let cleared = false;
    let lastBattleResult = null;
    const enteredChapters = new Set();

    for (let floor = 1; floor <= 20; floor++) {
        floorReached = floor;
        const chapter = chapterOf(floor);
        getFloorStats(stats, floor).reached++;
        if (!enteredChapters.has(chapter)) {
            enteredChapters.add(chapter);
            getChapterStats(stats, chapter).reached++;
        }
        const hpBeforeNode = hp;
        const goldBeforeNode = gold;
        const cardsBeforeNode = runCardsPicked.size;
        const relicsBeforeNode = acquiredRelics.length;
        const upgradesBeforeNode = upgrades;
        const removesBeforeNode = removes;
        const hpRatio = hp / character.maxHp;
        const choices = generateRouteChoices(rng, floor, hpRatio, gold, profile);
        const nodeType = chooseRoute(rng, choices, hpRatio, gold, profile);
        recordRouteChoices(stats, choices, nodeType);
        if (floor === 7) act1BossReached = true;

        if (['normal', 'elite', 'boss'].includes(nodeType)) {
            const checkpoint = checkpointForNode(floor, nodeType);
            const battleDeck = assignSimulationIds(deck);
            const battleLoadout = { relics: [...ownedRelics], coreCard: null };
            const result = simulateBattle(data, rng, roleId, battleDeck, hp, checkpoint, battleLoadout);
            lastBattleResult = result;
            const floorStats = getFloorStats(stats, floor);
            const chapterStats = getChapterStats(stats, chapter);
            const enemyStats = getEnemyStats(stats, result.enemy);
            floorStats.battles++;
            chapterStats.battles++;
            chapterStats.battleTurns += result.turns;
            chapterStats.damageTaken += result.damageTaken;
            enemyStats.encounters++;
            enemyStats.damageTaken += result.damageTaken;
            enemyStats.turns += result.turns;
            if (nodeType === 'elite') chapterStats.eliteAttempts++;
            if (nodeType === 'boss') chapterStats.bossAttempts++;
            totalMinutes += 1.3 + result.turns * 0.55;
            stats.battleCaps.maxTurns = Math.max(stats.battleCaps.maxTurns, result.turns);
            stats.battleCaps.maxHealingToHpRatio = Math.max(stats.battleCaps.maxHealingToHpRatio, result.healing / character.maxHp);
            stats.battleCaps.maxCardsPlayed = Math.max(stats.battleCaps.maxCardsPlayed, Object.values(result.cardPlays || {}).reduce((sum, value) => sum + value, 0));

            for (const [id, count] of Object.entries(result.cardOpportunities || {})) {
                const card = battleDeck.find(item => cardId(item) === id) || { name: id, tags: [] };
                getCardStats(stats, data, roleId, card).drawOpportunities += count;
            }
            for (const [id, count] of Object.entries(result.cardPlays || {})) {
                const card = battleDeck.find(item => cardId(item) === id) || { name: id, tags: [] };
                const cardStats = getCardStats(stats, data, roleId, card);
                cardStats.plays += count;
                cardStats.contribution += estimateCardContribution(data, roleId, card, count, result.cardOpportunities?.[id] || count);
            }
            for (const relicId of ownedRelics) {
                const impact = estimateRelicBattleImpact(relicId, result);
                const relicStats = getRelicStats(stats, data, relicId);
                relicStats.triggerCount += impact.triggers;
                relicStats.estimatedBenefit += impact.benefit;
            }

            if (!result.win) {
                floorStats.deaths++;
                chapterStats.deaths++;
                enemyStats.deaths++;
                enemyStats.negativeFeedback += result.damageTaken > character.maxHp * 0.7 || result.turns <= 4 ? 1 : 0;
                deathFloor = floor;
                deathReason = result.deathCause || '未知';
                hp = Math.max(0, result.hp);
                break;
            }

            floorStats.wins++;
            chapterStats.wins++;
            floorStats.hpLeft += result.hp;
            floorStats.battleTurns += result.turns;
            floorStats.damageTaken += result.damageTaken;
            chapterStats.hpLeft += result.hp;
            enemyStats.wins++;
            hp = Math.max(1, result.hp);
            if (nodeType === 'elite') {
                eliteKills++;
                chapterStats.eliteWins++;
                const relic = awardRelic(data, rng, roleId, buildId, ownedRelics, floor);
                if (relic) {
                    acquiredRelics.push({ id: relic, floor });
                    runRelicsPicked.add(relic);
                    const relicStats = getRelicStats(stats, data, relic);
                    relicStats.obtained++;
                    relicStats.floorTotal += floor;
                }
                gold += 35;
            } else if (nodeType === 'boss') {
                chapterStats.bossWins++;
                if (floor === 7) act1BossPassed = true;
                hp = Math.min(character.maxHp, hp + Math.ceil(character.maxHp * 0.35));
                gold += 60;
                const relic = awardRelic(data, rng, roleId, buildId, ownedRelics, floor);
                if (relic) {
                    acquiredRelics.push({ id: relic, floor });
                    runRelicsPicked.add(relic);
                    const relicStats = getRelicStats(stats, data, relic);
                    relicStats.obtained++;
                    relicStats.floorTotal += floor;
                }
                const core = addCoreCardIfFound(data, rng, roleId, buildId, deck, floor, floor >= 14 && profile === 'experienced' && rng() < 0.18);
                if (core) coreCards.push(core);
            } else {
                gold += 18;
            }
            if (floor < 20) applyCardReward(data, stats, rng, roleId, buildId, deck, floor, hp / character.maxHp, profile, runCardsPicked);
        } else if (nodeType === 'shop') {
            shops++;
            totalMinutes += 2.4;
            if (gold >= 95 && rng() < 0.6) {
                const relic = awardRelic(data, rng, roleId, buildId, ownedRelics, floor);
                if (relic) {
                    gold -= 95;
                    acquiredRelics.push({ id: relic, floor });
                    runRelicsPicked.add(relic);
                    const relicStats = getRelicStats(stats, data, relic);
                    relicStats.obtained++;
                    relicStats.floorTotal += floor;
                }
            }
            if (gold >= 50 && rng() < (profile === 'novice' ? 0.35 : 0.7)) {
                const removable = worstRemovableCard(deck);
                if (removable && deck.length > 8) {
                    deck.splice(removable.index, 1);
                    gold -= 50;
                    removes++;
                }
            }
            if (gold >= 45 && rng() < 0.75) {
                const selected = applyCardReward(data, stats, rng, roleId, buildId, deck, floor, hp / character.maxHp, profile, runCardsPicked);
                if (selected) gold -= 45;
            }
        } else if (nodeType === 'rest') {
            totalMinutes += 1.4;
            if (hp / character.maxHp < 0.55) {
                hp = Math.min(character.maxHp, hp + Math.ceil(character.maxHp * 0.35));
            } else {
                const upgraded = upgradeBestCard(deck, rng);
                if (upgraded) {
                    upgrades++;
                    getCardStats(stats, data, roleId, upgraded).upgraded++;
                }
            }
        } else if (nodeType === 'event') {
            totalMinutes += 1.8;
            const roll = rng();
            if (roll < 0.24) {
                gold += 45;
            } else if (roll < 0.48) {
                hp = Math.max(1, hp - Math.ceil(character.maxHp * 0.12));
                const relic = awardRelic(data, rng, roleId, buildId, ownedRelics, floor);
                if (relic) {
                    acquiredRelics.push({ id: relic, floor });
                    runRelicsPicked.add(relic);
                    const relicStats = getRelicStats(stats, data, relic);
                    relicStats.obtained++;
                    relicStats.floorTotal += floor;
                }
            } else if (roll < 0.72) {
                applyCardReward(data, stats, rng, roleId, buildId, deck, floor, hp / character.maxHp, profile, runCardsPicked);
            } else {
                const removable = worstRemovableCard(deck);
                if (removable && deck.length > 8) {
                    deck.splice(removable.index, 1);
                    removes++;
                }
            }
        } else if (nodeType === 'chest') {
            totalMinutes += 0.8;
            const relic = awardRelic(data, rng, roleId, buildId, ownedRelics, floor);
            if (relic) {
                acquiredRelics.push({ id: relic, floor });
                runRelicsPicked.add(relic);
                const relicStats = getRelicStats(stats, data, relic);
                relicStats.obtained++;
                relicStats.floorTotal += floor;
            }
            if (rng() < 0.22) {
                const core = addCoreCardIfFound(data, rng, roleId, buildId, deck, floor);
                if (core) coreCards.push(core);
            }
            gold += 20;
        }

        const routeStats = getRouteStats(stats, nodeType);
        routeStats.hpDelta += hp - hpBeforeNode;
        routeStats.goldDelta += gold - goldBeforeNode;
        routeStats.cardRewards += runCardsPicked.size - cardsBeforeNode;
        routeStats.relicRewards += acquiredRelics.length - relicsBeforeNode;
        routeStats.upgrades += upgrades - upgradesBeforeNode;
        routeStats.removes += removes - removesBeforeNode;
        if (floor === 20 && !deathFloor) cleared = true;
    }

    if (!deathFloor && floorReached >= 20) cleared = true;
    const finalHpRatio = hp / character.maxHp;
    const runRecord = {
        runId,
        roleId,
        role: character.name,
        difficulty,
        profile,
        profileLabel: PROFILE_LABELS[profile],
        targetBuildId: buildId,
        targetBuild: data.BUILD_DIRECTIONS[roleId][buildId].name,
        cleared,
        deathFloor: deathFloor || '',
        deathReason: deathReason || '',
        floorReached,
        act1BossReached,
        act1BossPassed,
        finalBuild: dominantBuild(data, roleId, deck),
        coreCards: [...new Set(coreCards.map(card => card.name))].join('/'),
        coreRelics: acquiredRelics.filter(relic => coreRelics.has(relic.id)).map(relic => relicName(data, relic.id)).join('/'),
        totalMinutes,
        eliteKills,
        shops,
        removes,
        upgrades,
        finalHpRatio,
        subjectiveScore: 0
    };
    runRecord.subjectiveScore = subjectiveRunScore(runRecord);
    stats.runs.push(runRecord);

    for (const card of deck) {
        const cardStats = getCardStats(stats, data, roleId, card);
        cardStats.selectedRuns++;
        if (cleared) cardStats.selectedRunWins++;
        cardStats.playerRatingTotal += runRecord.subjectiveScore;
        cardStats.playerRatingCount++;
    }
    for (const relicId of runRelicsPicked) {
        const relicStats = getRelicStats(stats, data, relicId);
        if (cleared) relicStats.runWins++;
        relicStats.playerRatingTotal += runRecord.subjectiveScore;
        relicStats.playerRatingCount++;
    }
    for (const relicId of runRelicsPicked) {
        for (const cardIdValue of runCardsPicked) {
            const key = `${relicId}+${cardIdValue}`;
            stats.combos[key] ||= { left: relicId, right: cardIdValue, runs: 0, wins: 0, type: '遗物+卡牌' };
            stats.combos[key].runs++;
            if (cleared) stats.combos[key].wins++;
        }
        for (const otherRelic of runRelicsPicked) {
            if (otherRelic <= relicId) continue;
            const key = `${relicId}+${otherRelic}`;
            stats.combos[key] ||= { left: relicId, right: otherRelic, runs: 0, wins: 0, type: '遗物+遗物' };
            stats.combos[key].runs++;
            if (cleared) stats.combos[key].wins++;
        }
    }
    for (const type of new Set(Object.keys(stats.routes))) {
        if (runRecord.cleared) getRouteStats(stats, type).winsAfterChoice++;
    }
    return { ...runRecord, lastBattleResult };
}

function summarizeCards(stats) {
    return Object.values(stats.cards).map(card => {
        const choiceRate = card.selections / Math.max(1, card.appearances);
        const useRate = card.plays / Math.max(1, card.drawOpportunities);
        const selectedWinRate = card.selectedRunWins / Math.max(1, card.selectedRuns);
        return {
            ...card,
            choiceRate,
            upgradeRate: card.upgraded / Math.max(1, card.selectedRuns),
            drawnUseRate: useRate,
            selectedWinRate,
            averageContribution: card.contribution / Math.max(1, card.selectedRuns),
            playerRating: card.playerRatingCount ? card.playerRatingTotal / card.playerRatingCount : cardRating(choiceRate, useRate, selectedWinRate)
        };
    }).sort((left, right) => right.appearances - left.appearances || left.choiceRate - right.choiceRate);
}

function summarizeRelics(stats) {
    return Object.values(stats.relics).map(relic => ({
        ...relic,
        averageFloor: relic.floorTotal / Math.max(1, relic.obtained),
        winRateAfterObtain: relic.runWins / Math.max(1, relic.obtained),
        triggerPerRun: relic.triggerCount / Math.max(1, relic.obtained),
        averageBenefit: relic.estimatedBenefit / Math.max(1, relic.obtained),
        playerRating: relic.playerRatingCount
            ? relic.playerRatingTotal / relic.playerRatingCount
            : relicRating(relic.runWins / Math.max(1, relic.obtained), relic.triggerCount / Math.max(1, relic.obtained), relic.estimatedBenefit / Math.max(1, relic.obtained))
    })).sort((left, right) => right.obtained - left.obtained);
}

function summarizeEnemies(stats) {
    return Object.values(stats.enemies).map(enemy => ({
        ...enemy,
        winRate: enemy.wins / Math.max(1, enemy.encounters),
        deathRate: enemy.deaths / Math.max(1, enemy.encounters),
        averageDamageTaken: enemy.damageTaken / Math.max(1, enemy.encounters),
        averageTurns: enemy.turns / Math.max(1, enemy.encounters)
    })).sort((left, right) => right.deathRate - left.deathRate || right.encounters - left.encounters);
}

function summarizeFloors(stats) {
    return Object.values(stats.floors).map(floor => ({
        ...floor,
        chapter: chapterOf(Number(floor.floor)),
        deathRate: floor.deaths / Math.max(1, floor.reached),
        battleWinRate: floor.wins / Math.max(1, floor.battles),
        averageHpLeft: floor.hpLeft / Math.max(1, floor.wins),
        averageBattleTurns: floor.battleTurns / Math.max(1, floor.battles),
        averageDamageTaken: floor.damageTaken / Math.max(1, floor.battles)
    })).sort((left, right) => Number(left.floor) - Number(right.floor));
}

function summarizeChapters(stats) {
    return Object.values(stats.chapters).map(chapter => ({
        ...chapter,
        deathRate: chapter.deaths / Math.max(1, chapter.reached),
        bossPassRate: chapter.bossWins / Math.max(1, chapter.bossAttempts),
        eliteKillRate: chapter.eliteWins / Math.max(1, chapter.eliteAttempts),
        averageHpLeft: chapter.hpLeft / Math.max(1, chapter.wins),
        averageBattleTurns: chapter.battleTurns / Math.max(1, chapter.battles),
        averageDamageTaken: chapter.damageTaken / Math.max(1, chapter.battles)
    })).sort((left, right) => left.chapter - right.chapter);
}

function summarizeRoutes(stats) {
    return Object.values(stats.routes).map(route => ({
        ...route,
        choiceRate: route.chosen / Math.max(1, route.offered),
        averageHpDelta: route.hpDelta / Math.max(1, route.chosen),
        averageGoldDelta: route.goldDelta / Math.max(1, route.chosen),
        averageCardRewards: route.cardRewards / Math.max(1, route.chosen),
        averageRelicRewards: route.relicRewards / Math.max(1, route.chosen),
        averageUpgrades: route.upgrades / Math.max(1, route.chosen),
        averageRemoves: route.removes / Math.max(1, route.chosen)
    })).sort((left, right) => right.chosen - left.chosen);
}

function summarizeCombos(stats, data, cards, relics) {
    const cardNames = Object.fromEntries(cards.map(card => [card.id, card.name]));
    const relicNames = Object.fromEntries(relics.map(relic => [relic.id, relic.name]));
    return Object.values(stats.combos)
        .filter(combo => combo.runs >= 3)
        .map(combo => ({
            ...combo,
            leftName: relicNames[combo.left] || relicName(data, combo.left),
            rightName: relicNames[combo.right] || cardNames[combo.right] || relicName(data, combo.right),
            winRate: combo.wins / Math.max(1, combo.runs)
        }))
        .sort((left, right) => right.winRate - left.winRate || right.runs - left.runs)
        .slice(0, 80);
}

function addAnomaly(anomalies, type, severity, subject, detail, metric, value, threshold) {
    anomalies.push({ type, severity, subject, detail, metric, value, threshold });
}

function buildAnomalies(report) {
    const anomalies = [];
    const experiencedRuns = report.runs.filter(run => run.profile === 'experienced');
    const noviceRuns = report.runs.filter(run => run.profile === 'novice');
    const experiencedClear = experiencedRuns.filter(run => run.cleared).length / Math.max(1, experiencedRuns.length);
    const noviceAct1Reach = noviceRuns.filter(run => run.act1BossReached).length / Math.max(1, noviceRuns.length);
    if (experiencedClear < TARGETS.experiencedClearRate.min || experiencedClear > TARGETS.experiencedClearRate.max) {
        addAnomaly(anomalies, '通关率', 'high', '普通难度熟练玩家', '通关率不在 50%-75% 目标区间', 'clearRate', experiencedClear, `${TARGETS.experiencedClearRate.min}-${TARGETS.experiencedClearRate.max}`);
    }
    if (noviceRuns.length && noviceAct1Reach < TARGETS.noviceAct1BossReachRate.min) {
        addAnomaly(anomalies, '新手体验', 'high', '新手前几局', '到达第一章 Boss 的比例偏低', 'act1BossReachRate', noviceAct1Reach, TARGETS.noviceAct1BossReachRate.min);
    }
    const offeredCards = report.cards.filter(card => card.appearances >= Math.max(6, report.config.totalRuns * 0.04));
    const deadCards = offeredCards.filter(card => card.choiceRate < 0.08 && card.drawnUseRate < 0.18);
    const deadCardRatio = deadCards.length / Math.max(1, offeredCards.length);
    if (deadCardRatio > TARGETS.deadCardRatio.max) {
        addAnomaly(anomalies, '废卡比例', 'high', '卡池', '低选择且低使用的牌过多', 'deadCardRatio', deadCardRatio, TARGETS.deadCardRatio.max);
    }
    for (const card of deadCards.slice(0, 20)) {
        addAnomaly(anomalies, '废卡', 'medium', card.name, '出现后很少被选，抽到后也很少打出', 'choice/use', `${pct(card.choiceRate)}/${pct(card.drawnUseRate)}`, '8%/18%');
    }
    const averageClear = experiencedClear;
    for (const card of report.cards.filter(card => card.selectedRuns >= 10)) {
        if (card.selectedWinRate > averageClear + 0.22 && card.choiceRate > 0.45) {
            addAnomaly(anomalies, '过强卡', 'medium', card.name, '选后通关率显著高于总体', 'selectedWinRate', card.selectedWinRate, averageClear + 0.22);
        }
    }
    for (const relic of report.relics.filter(relic => relic.obtained >= 6)) {
        if (relic.winRateAfterObtain > averageClear + 0.24) {
            addAnomaly(anomalies, '过强遗物', 'medium', relic.name, '获得后通关率显著高于总体', 'winRateAfterObtain', relic.winRateAfterObtain, averageClear + 0.24);
        }
    }
    for (const enemy of report.enemies) {
        if (enemy.encounters >= 8 && enemy.deathRate > 0.45) {
            addAnomaly(anomalies, '过难敌人', 'high', enemy.name, '遭遇死亡率过高', 'deathRate', enemy.deathRate, 0.45);
        }
        if (enemy.negativeFeedback / Math.max(1, enemy.encounters) > 0.35) {
            addAnomaly(anomalies, '敌人负反馈', 'medium', enemy.name, '高损血或速死反馈偏多', 'negativeFeedbackRate', enemy.negativeFeedback / enemy.encounters, 0.35);
        }
    }
    for (const floor of report.floors) {
        if (floor.reached >= 10 && floor.deathRate > 0.22) {
            addAnomaly(anomalies, '死亡热区', 'high', `第${floor.floor}层`, '楼层死亡率过高', 'deathRate', floor.deathRate, 0.22);
        }
    }
    if (report.battleCaps.maxTurns > TARGETS.maxBattleTurns.max) {
        addAnomaly(anomalies, '单局过长', 'medium', '战斗回合', '存在超长战斗，需要排查无解防御或输出不足', 'maxBattleTurns', report.battleCaps.maxTurns, TARGETS.maxBattleTurns.max);
    }
    if (report.battleCaps.maxHealingToHpRatio > TARGETS.maxHealingToHpRatio.max) {
        addAnomaly(anomalies, '无限回血风险', 'medium', '回血链', '单场回血量相对最大生命过高', 'maxHealingToHpRatio', report.battleCaps.maxHealingToHpRatio, TARGETS.maxHealingToHpRatio.max);
    }
    for (const route of report.routes) {
        if (route.choiceRate > 0.55 && !['boss', 'rest'].includes(route.nodeType)) {
            addAnomaly(anomalies, '路线单一', 'medium', route.label, '玩家可能总走同一路线', 'choiceRate', route.choiceRate, 0.55);
        }
    }
    return anomalies;
}

function toCsv(rows, columns) {
    const escape = value => {
        if (value === null || value === undefined) return '';
        const text = String(value);
        return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    };
    return [
        columns.join(','),
        ...rows.map(row => columns.map(column => escape(row[column])).join(','))
    ].join('\n') + '\n';
}

function writeCsvReports(report, outputDir) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'single_runs.csv'), toCsv(report.runs, [
        'runId', 'role', 'difficulty', 'profileLabel', 'targetBuild', 'cleared', 'deathFloor',
        'deathReason', 'floorReached', 'finalBuild', 'coreCards', 'coreRelics', 'totalMinutes',
        'eliteKills', 'shops', 'removes', 'upgrades', 'subjectiveScore'
    ]));
    fs.writeFileSync(path.join(outputDir, 'card_stats.csv'), toCsv(report.cards, [
        'id', 'name', 'type', 'rarity', 'tags', 'buildTags', 'appearances', 'selections',
        'choiceRate', 'upgradeRate', 'drawOpportunities', 'plays', 'drawnUseRate',
        'selectedWinRate', 'averageContribution', 'playerRating'
    ]));
    fs.writeFileSync(path.join(outputDir, 'relic_stats.csv'), toCsv(report.relics, [
        'id', 'name', 'obtained', 'averageFloor', 'winRateAfterObtain', 'triggerCount',
        'triggerPerRun', 'averageBenefit', 'playerRating'
    ]));
    fs.writeFileSync(path.join(outputDir, 'enemy_stats.csv'), toCsv(report.enemies, [
        'name', 'encounters', 'winRate', 'deathRate', 'averageDamageTaken', 'averageTurns',
        'negativeFeedback'
    ]));
    fs.writeFileSync(path.join(outputDir, 'floor_heatmap.csv'), toCsv(report.floors, [
        'floor', 'chapter', 'reached', 'deaths', 'deathRate', 'battleWinRate',
        'averageHpLeft', 'averageBattleTurns', 'averageDamageTaken'
    ]));
    fs.writeFileSync(path.join(outputDir, 'route_stats.csv'), toCsv(report.routes, [
        'nodeType', 'label', 'offered', 'chosen', 'choiceRate', 'averageHpDelta',
        'averageGoldDelta', 'averageCardRewards', 'averageRelicRewards', 'averageUpgrades',
        'averageRemoves'
    ]));
    fs.writeFileSync(path.join(outputDir, 'anomalies.csv'), toCsv(report.anomalies, [
        'type', 'severity', 'subject', 'detail', 'metric', 'value', 'threshold'
    ]));
    fs.writeFileSync(path.join(outputDir, 'combo_stats.csv'), toCsv(report.combos, [
        'type', 'leftName', 'rightName', 'runs', 'wins', 'winRate'
    ]));
}

function markdownReport(report, outputDir) {
    const experiencedRuns = report.runs.filter(run => run.profile === 'experienced');
    const noviceRuns = report.runs.filter(run => run.profile === 'novice');
    const experiencedClear = experiencedRuns.filter(run => run.cleared).length / Math.max(1, experiencedRuns.length);
    const noviceAct1Reach = noviceRuns.filter(run => run.act1BossReached).length / Math.max(1, noviceRuns.length);
    const averageScore = report.runs.reduce((sum, run) => sum + run.subjectiveScore, 0) / Math.max(1, report.runs.length);
    const lines = [
        '# 完整跑局体验与平衡测试报告',
        '',
        `测试日期：${report.generatedAt.slice(0, 10)}`,
        '',
        `样本：熟练玩家 ${experiencedRuns.length} 局，新手 ${noviceRuns.length} 局；随机种子：\`${report.config.seed}\`。`,
        '',
        '## 关键判定',
        '',
        `- 普通难度熟练玩家通关率：${pct(experiencedClear)}，目标 ${pct(TARGETS.experiencedClearRate.min)}-${pct(TARGETS.experiencedClearRate.max)}。`,
        `- 新手到达第一章 Boss：${pct(noviceAct1Reach)}，目标至少 ${pct(TARGETS.noviceAct1BossReachRate.min)}。`,
        `- 平均主观评分：${fixed(averageScore, 2)} / 5。`,
        `- 最大战斗回合：${report.battleCaps.maxTurns}；最大单场回血/最大生命：${fixed(report.battleCaps.maxHealingToHpRatio, 2)}。`,
        `- 异常项：${report.anomalies.length} 条。`,
        '',
        '## 楼层死亡热区',
        '',
        '| 楼层 | 到达 | 死亡率 | 战斗胜率 | 平均剩余血量 | 平均回合 | 平均损血 |',
        '|---:|---:|---:|---:|---:|---:|---:|',
        ...report.floors.map(floor => `| ${floor.floor} | ${floor.reached} | ${pct(floor.deathRate)} | ${pct(floor.battleWinRate)} | ${fixed(floor.averageHpLeft)} | ${fixed(floor.averageBattleTurns)} | ${fixed(floor.averageDamageTaken)} |`),
        '',
        '## 章节与 Boss',
        '',
        '| 章节 | 到达 | 死亡率 | Boss 通过率 | 精英击杀率 | 平均剩余血量 | 平均战斗回合 | 平均损血 |',
        '|---:|---:|---:|---:|---:|---:|---:|---:|',
        ...report.chapters.map(chapter => `| ${chapter.chapter} | ${chapter.reached} | ${pct(chapter.deathRate)} | ${pct(chapter.bossPassRate)} | ${pct(chapter.eliteKillRate)} | ${fixed(chapter.averageHpLeft)} | ${fixed(chapter.averageBattleTurns)} | ${fixed(chapter.averageDamageTaken)} |`),
        '',
        '## 路线选择',
        '',
        '| 节点 | 出现 | 选择 | 选择率 | 平均血量变化 | 平均金币变化 | 卡牌收益 | 遗物收益 |',
        '|---|---:|---:|---:|---:|---:|---:|---:|',
        ...report.routes.map(route => `| ${route.label} | ${route.offered} | ${route.chosen} | ${pct(route.choiceRate)} | ${fixed(route.averageHpDelta)} | ${fixed(route.averageGoldDelta)} | ${fixed(route.averageCardRewards, 2)} | ${fixed(route.averageRelicRewards, 2)} |`),
        '',
        '## 异常项 Top 20',
        '',
        '| 类型 | 严重度 | 对象 | 说明 | 指标 | 值 | 阈值 |',
        '|---|---|---|---|---|---:|---:|',
        ...report.anomalies.slice(0, 20).map(item => `| ${item.type} | ${item.severity} | ${item.subject} | ${item.detail} | ${item.metric} | ${typeof item.value === 'number' ? fixed(item.value, 3) : item.value} | ${item.threshold} |`),
        '',
        '## 重点报表文件',
        '',
        `- 单局跑局表：\`${path.join(outputDir, 'single_runs.csv')}\``,
        `- 卡牌选择率/通关率表：\`${path.join(outputDir, 'card_stats.csv')}\``,
        `- 遗物获得率/通关率表：\`${path.join(outputDir, 'relic_stats.csv')}\``,
        `- 敌人死亡率表：\`${path.join(outputDir, 'enemy_stats.csv')}\``,
        `- 楼层死亡热区表：\`${path.join(outputDir, 'floor_heatmap.csv')}\``,
        `- 路线选择统计表：\`${path.join(outputDir, 'route_stats.csv')}\``,
        `- 异常项列表：\`${path.join(outputDir, 'anomalies.csv')}\``,
        `- 组合胜率表：\`${path.join(outputDir, 'combo_stats.csv')}\``,
        '',
        `完整 JSON：\`${path.join(outputDir, 'full_playtest_report.json')}\``
    ];
    return `${lines.join('\n')}\n`;
}

function buildReport(data, stats, config) {
    const cards = summarizeCards(stats);
    const relics = summarizeRelics(stats);
    const report = {
        generatedAt: new Date().toISOString(),
        config: {
            seed: config.seed,
            runsPerBuild: config.runsPerBuild,
            noviceRunsPerBuild: config.noviceRunsPerBuild,
            totalRuns: stats.runs.length,
            targets: TARGETS
        },
        runs: stats.runs,
        cards,
        relics,
        enemies: summarizeEnemies(stats),
        floors: summarizeFloors(stats),
        chapters: summarizeChapters(stats),
        routes: summarizeRoutes(stats),
        combos: [],
        battleCaps: stats.battleCaps,
        anomalies: []
    };
    report.combos = summarizeCombos(stats, data, cards, relics);
    report.anomalies = buildAnomalies(report);
    return report;
}

function runSuite(data, args) {
    const stats = makeEmptyStats();
    let runNumber = 0;
    const roles = Object.keys(data.BUILD_DIRECTIONS);
    for (const roleId of roles) {
        for (const buildId of Object.keys(data.BUILD_DIRECTIONS[roleId])) {
            for (let index = 0; index < args.runsPerBuild; index++) {
                simulateFullRun(data, stats, {
                    runId: `E${String(++runNumber).padStart(4, '0')}`,
                    roleId,
                    buildId,
                    profile: 'experienced',
                    difficulty: 'normal',
                    seed: args.seed + runNumber * 100003
                });
            }
            for (let index = 0; index < args.noviceRunsPerBuild; index++) {
                simulateFullRun(data, stats, {
                    runId: `N${String(++runNumber).padStart(4, '0')}`,
                    roleId,
                    buildId,
                    profile: 'novice',
                    difficulty: 'normal',
                    seed: args.seed + runNumber * 100003 + 777
                });
            }
        }
    }
    return buildReport(data, stats, args);
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const data = loadGameData();
    const outputDir = path.resolve(ROOT, args.reportDir);
    const report = runSuite(data, args);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'full_playtest_report.json'), `${JSON.stringify(report, null, 2)}\n`);
    writeCsvReports(report, outputDir);
    fs.writeFileSync(path.join(outputDir, '完整跑局体验与平衡测试报告.md'), markdownReport(report, args.reportDir));
    console.log(`Full playtest suite complete: ${report.config.totalRuns} runs.`);
    const experienced = report.runs.filter(run => run.profile === 'experienced');
    const novice = report.runs.filter(run => run.profile === 'novice');
    console.log(`熟练通关率\t${pct(experienced.filter(run => run.cleared).length / Math.max(1, experienced.length))}`);
    console.log(`新手到达一章Boss\t${pct(novice.filter(run => run.act1BossReached).length / Math.max(1, novice.length))}`);
    console.log(`异常项\t${report.anomalies.length}`);
    console.log(`报告目录\t${args.reportDir}`);
}

run();
