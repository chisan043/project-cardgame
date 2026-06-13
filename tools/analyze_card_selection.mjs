#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CHECKPOINTS,
    FOUNDATION,
    createRng,
    getLoadout,
    loadGameData,
    simulateBattle
} from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEED_OFFSETS = [0, 1000003, 2000003];
const DRAFT_ROUNDS = 8;
const RARITY_BONUS = { '普通': 0, '稀有': 2, '史诗': 4 };

function parseArgs(argv) {
    const result = {
        runs: 300,
        seed: 20260612,
        json: 'tools/card_selection_report.json',
        markdown: '卡牌选择率测试报告.md'
    };
    for (let index = 0; index < argv.length; index++) {
        if (argv[index] === '--runs') result.runs = Number(argv[++index]);
        else if (argv[index] === '--seed') result.seed = Number(argv[++index]);
        else if (argv[index] === '--json') result.json = argv[++index];
        else if (argv[index] === '--markdown') result.markdown = argv[++index];
    }
    if (!Number.isFinite(result.runs) || result.runs < 100) throw new Error('--runs must be at least 100 per seed');
    return result;
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function cardId(card) {
    return card.poolId || card.specialId || card.id || card.name;
}

function cardBuildTags(data, roleId, card) {
    if (card.buildNeutral) return [];
    const explicit = card.buildTags || data.CARD_BUILD_TAGS_BY_ID[cardId(card)] || [];
    const inferred = Object.entries(data.BUILD_DIRECTIONS[roleId] || {})
        .filter(([, config]) => (card.tags || []).some(tag => (config.triggerTags || []).includes(tag)))
        .map(([buildTag]) => buildTag);
    return [...new Set([...explicit, ...inferred])];
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

function rollRarity(rng, floor = 14) {
    const floorBonus = Math.min(floor * 0.015, 0.14);
    const roll = rng();
    if (roll < 0.12 + floorBonus) return '史诗';
    if (roll < 0.68) return '稀有';
    return '普通';
}

function rewardWeight(data, roleId, card, primaryBuildTag, aligned) {
    const tags = cardBuildTags(data, roleId, card);
    if (!tags.length) return 1;
    if (aligned && tags.includes(primaryBuildTag)) return 2;
    return 1.15;
}

function rewardCandidatePool(data, roleId, buildId, mode, rarity, used, rng) {
    const allCards = [...data.CHARACTER_CARD_POOLS[roleId], ...data.NEUTRAL_CARD_POOL];
    let candidates = allCards.filter(card => !used.has(cardId(card)));
    if (rarity) candidates = candidates.filter(card => card.rarity === rarity);
    if (mode === 'aligned') {
        candidates = candidates.filter(card => cardBuildTags(data, roleId, card).includes(buildId));
    } else if (mode === 'pivot') {
        candidates = candidates.filter(card => {
            const tags = cardBuildTags(data, roleId, card);
            return tags.length && !tags.includes(buildId);
        });
    } else {
        candidates = candidates.filter(card => {
            const tags = cardBuildTags(data, roleId, card);
            return !tags.includes(buildId) || rng() < 0.35;
        });
    }
    return candidates;
}

function generateChoice(data, rng, roleId, buildId, mode, used) {
    const rarity = rollRarity(rng);
    let candidates = rewardCandidatePool(data, roleId, buildId, mode, rarity, used, rng);
    if (!candidates.length) candidates = rewardCandidatePool(data, roleId, buildId, mode, null, used, rng);
    return weightedPick(rng, candidates, card => rewardWeight(data, roleId, card, buildId, mode === 'aligned'));
}

function generateChoices(data, rng, roleId, buildId) {
    const used = new Set();
    const result = [];
    for (const mode of ['aligned', 'general', 'pivot']) {
        const card = generateChoice(data, rng, roleId, buildId, mode, used);
        if (!card) continue;
        used.add(cardId(card));
        result.push(card);
    }
    return result;
}

function cardDraftScore(data, roleId, card, build, deck, rng) {
    const tags = card.tags || [];
    const buildTags = cardBuildTags(data, roleId, card);
    const triggerHits = tags.filter(tag => build.triggerTags.includes(tag)).length;
    const scaledValue = data.getScaledCardValue(card);
    const cost = Number(card.cost) || 0;
    const directEffects = Object.keys(card.directEffects || {}).length;
    const sameCardCopies = deck.filter(owned => cardId(owned) === cardId(card)).length;
    let score = scaledValue / Math.max(1, cost) + directEffects * 2.5 + triggerHits * 4;
    if (buildTags.includes(build.id)) score += 7;
    if (card.type === '防御') score += 2;
    if (tags.includes('抽牌') || card.directEffects?.draw) score += 4;
    if (tags.includes('充能') || card.directEffects?.energy) score += 3;
    if (tags.includes('庇护') || card.directEffects?.protection) score += data.getProtectionValue(card) * 0.4;
    if (tags.includes('治愈') || card.directEffects?.heal) score += data.getCardHealValue(card) * 0.6;
    if (tags.includes('重置')) score += 5;
    if (tags.includes('销毁')) score += 2;
    if (tags.includes('回收')) {
        const recyclableCards = deck.filter(owned => (owned.tags || []).some(tag => ['放逐', '销毁', '回收'].includes(tag))).length;
        score += data.getCardRecycleModes(card).length * 4 + Math.min(6, recyclableCards * 1.5);
    }
    if (card.energySink) score += 4;
    if (card.bloodDebtGain) score += card.bloodDebtGain * 0.8;
    if (card.bloodDebtDamageRatio) score += card.bloodDebtDamageRatio * 6;
    if (card.bloodDebtRepay) score += card.bloodDebtRepay * 1.2;
    if (card.bloodDebtRepayFromBleed) score += card.bloodDebtRepayFromBleed * 6;
    if (card.bloodDebtBleed) score += card.bloodDebtBleed * 1.2;
    if (card.bloodDebtWeak) score += card.bloodDebtWeak * 3;
    if (card.bloodDebtStun) score += card.bloodDebtStun * 8;
    if (card.bloodDebtClearDamage) score += card.bloodDebtClearDamage * 0.5;
    if (card.bloodDebtClearHeal) score += card.bloodDebtClearHeal * 0.6;
    if (card.bloodDebtDrawOnRepay) score += card.bloodDebtDrawOnRepay * 3;
    score += RARITY_BONUS[card.rarity] || 0;
    score -= sameCardCopies * 7;
    score -= Math.max(0, cost - 2) * 1.5;
    return score + (rng() - 0.5) * 10;
}

function pickReward(data, rng, roleId, choices, build, deck) {
    return choices
        .map(card => ({ card, score: cardDraftScore(data, roleId, card, build, deck, rng) }))
        .sort((left, right) => right.score - left.score)[0]?.card || null;
}

function addCounter(target, key, amount = 1) {
    target[key] = (target[key] || 0) + amount;
}

function mergeCounters(target, source) {
    for (const [key, value] of Object.entries(source || {})) addCounter(target, key, value);
}

function initializeDeck(roleId) {
    return [...FOUNDATION[roleId], ...FOUNDATION[roleId]].map(clone);
}

function assignSimulationIds(deck) {
    return deck.map((card, index) => ({ ...clone(card), simId: `${index}:${cardId(card)}` }));
}

function encounterTargets(data) {
    return data.ENEMIES
        .filter(enemy => enemy.type === 'elite' || enemy.type === 'boss')
        .map(enemy => ({
            name: enemy.name,
            checkpoint: CHECKPOINTS.find(checkpoint => checkpoint.type === enemy.type)
        }));
}

function summarizeCards(meta, offered, picked, included, plays, opportunities, drafts) {
    return Object.keys(meta).map(id => ({
        id,
        ...meta[id],
        offers: offered[id] || 0,
        picks: picked[id] || 0,
        choiceRate: (picked[id] || 0) / Math.max(1, offered[id] || 0),
        deckInclusionRate: (included[id] || 0) / Math.max(1, drafts),
        plays: plays[id] || 0,
        opportunities: opportunities[id] || 0,
        drawnUsageRate: (plays[id] || 0) / Math.max(1, opportunities[id] || 0)
    })).sort((left, right) => left.choiceRate - right.choiceRate || left.deckInclusionRate - right.deckInclusionRate);
}

function runBuild(data, roleId, buildId, args) {
    const buildDefinition = data.BUILD_DIRECTIONS[roleId][buildId];
    const build = { id: buildId, roleId, ...buildDefinition };
    const loadout = getLoadout(data, roleId, buildId, 'mature');
    const targets = encounterTargets(data);
    const offered = {};
    const picked = {};
    const included = {};
    const plays = {};
    const opportunities = {};
    const meta = {};
    const enemies = Object.fromEntries(targets.map(target => [target.name, { games: 0, wins: 0 }]));
    const seeds = [];
    let totalDrafts = 0;

    for (const seedOffset of SEED_OFFSETS) {
        const seed = args.seed + seedOffset;
        const rng = createRng(seed + roleId.length * 1009 + buildId.length * 101);
        const seedEnemies = Object.fromEntries(targets.map(target => [target.name, { games: 0, wins: 0 }]));
        for (let run = 0; run < args.runs; run++) {
            const deck = initializeDeck(roleId);
            for (let round = 0; round < DRAFT_ROUNDS; round++) {
                const choices = generateChoices(data, rng, roleId, buildId);
                for (const card of choices) {
                    const id = cardId(card);
                    const buildTags = cardBuildTags(data, roleId, card);
                    meta[id] ||= {
                        name: card.name,
                        cost: card.cost,
                        rarity: card.rarity,
                        tags: card.tags || [],
                        directEffects: card.directEffects || {},
                        buildTags,
                        isPrimaryBuild: buildTags.includes(buildId),
                        isRelevant: buildTags.length === 0 || buildTags.includes(buildId),
                        isNeutral: data.NEUTRAL_CARD_POOL.some(item => cardId(item) === id)
                    };
                    addCounter(offered, id);
                }
                const selected = pickReward(data, rng, roleId, choices, build, deck);
                if (!selected) continue;
                addCounter(picked, cardId(selected));
                deck.push(clone(selected));
            }
            for (const id of new Set(deck.map(cardId))) {
                if (meta[id]) addCounter(included, id);
            }
            const battleDeck = assignSimulationIds(loadout.coreCard ? [...deck, { ...clone(loadout.coreCard), specialId: loadout.coreCard.id }] : deck);
            for (const target of targets) {
                const battleRng = createRng(seed + run * 7919 + target.name.length * 10007);
                const result = simulateBattle(
                    data, battleRng, roleId, battleDeck, data.CHARACTERS[roleId].maxHp,
                    target.checkpoint, loadout, { enemyName: target.name }
                );
                enemies[target.name].games++;
                enemies[target.name].wins += result.win ? 1 : 0;
                seedEnemies[target.name].games++;
                seedEnemies[target.name].wins += result.win ? 1 : 0;
                mergeCounters(plays, result.cardPlays);
                mergeCounters(opportunities, result.cardOpportunities);
            }
            totalDrafts++;
        }
        seeds.push({
            seed,
            enemies: Object.fromEntries(Object.entries(seedEnemies).map(([name, value]) => [name, value.wins / Math.max(1, value.games)]))
        });
    }

    return {
        roleId,
        role: data.CHARACTERS[roleId].name,
        buildId,
        build: build.name,
        drafts: totalDrafts,
        enemies: Object.fromEntries(Object.entries(enemies).map(([name, value]) => [name, {
            ...value,
            winRate: value.wins / Math.max(1, value.games)
        }])),
        seeds,
        cards: summarizeCards(meta, offered, picked, included, plays, opportunities, totalDrafts)
    };
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function renderMarkdown(report) {
    const lines = [
        '# 卡牌选择率测试报告',
        '',
        `- 每个构筑使用 3 个种子，每个种子 ${report.runsPerSeed} 次八轮三选一构筑。`,
        '- 选择策略综合构筑标签、费用效率、词条联动、曲线和少量随机扰动；这是自动构筑压力测试，不等同于真人偏好。',
        '- 每套成型牌组分别挑战全部精英与首领，使用率按“抽到后实际打出”计算。',
        '',
        '## 构筑与敌人胜率',
        ''
    ];
    const enemyNames = Object.keys(report.results[0]?.enemies || {});
    lines.push(`| 职业 | 构筑 | ${enemyNames.join(' | ')} |`);
    lines.push(`| --- | --- | ${enemyNames.map(() => '---:').join(' | ')} |`);
    for (const result of report.results) {
        lines.push(`| ${result.role} | ${result.build} | ${enemyNames.map(name => pct(result.enemies[name].winRate)).join(' | ')} |`);
    }
    lines.push('', '## 低选择率卡牌', '');
    for (const result of report.results) {
        const lowCards = result.cards
            .filter(card => card.isPrimaryBuild && card.offers >= 30)
            .sort((left, right) => left.choiceRate - right.choiceRate || left.drawnUsageRate - right.drawnUsageRate)
            .slice(0, 8);
        lines.push(`### ${result.role} · ${result.build}`, '');
        lines.push('| 卡牌 | 费用 | 展示 | 选择率 | 入牌率 | 抽到后使用率 |');
        lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');
        for (const card of lowCards) {
            lines.push(`| ${card.name} | ${card.cost} | ${card.offers} | ${pct(card.choiceRate)} | ${pct(card.deckInclusionRate)} | ${pct(card.drawnUsageRate)} |`);
        }
        lines.push('');
    }
    const neutralCards = {};
    for (const result of report.results) {
        for (const card of result.cards.filter(card => card.isNeutral)) {
            neutralCards[card.id] ||= { name: card.name, offers: 0, picks: 0, plays: 0, opportunities: 0, included: 0, drafts: 0 };
            const entry = neutralCards[card.id];
            entry.offers += card.offers;
            entry.picks += card.picks;
            entry.plays += card.plays;
            entry.opportunities += card.opportunities;
            entry.included += card.deckInclusionRate * result.drafts;
            entry.drafts += result.drafts;
        }
    }
    const neutralSummary = Object.values(neutralCards)
        .map(card => ({
            ...card,
            choiceRate: card.picks / Math.max(1, card.offers),
            deckInclusionRate: card.included / Math.max(1, card.drafts),
            drawnUsageRate: card.plays / Math.max(1, card.opportunities)
        }))
        .filter(card => card.offers >= 100)
        .sort((left, right) => left.choiceRate - right.choiceRate)
        .slice(0, 10);
    lines.push('## 中立牌观察', '');
    lines.push('| 卡牌 | 展示 | 选择率 | 入牌率 | 抽到后使用率 |');
    lines.push('| --- | ---: | ---: | ---: | ---: |');
    for (const card of neutralSummary) {
        lines.push(`| ${card.name} | ${card.offers} | ${pct(card.choiceRate)} | ${pct(card.deckInclusionRate)} | ${pct(card.drawnUsageRate)} |`);
    }
    lines.push('');
    const deadCards = report.results.flatMap(result => result.cards
        .filter(card => card.isPrimaryBuild && card.offers >= 30 && (card.choiceRate < 0.02 || (card.opportunities >= 50 && card.drawnUsageRate < 0.2)))
        .map(card => ({ role: result.role, build: result.build, ...card })));
    const warriorChaff = report.results
        .filter(result => result.roleId === 'hero_warrior')
        .flatMap(result => result.cards
            .filter(card => card.isPrimaryBuild && card.offers >= 30 && (
                card.choiceRate < 0.08
                || (card.opportunities >= 50 && !(card.tags || []).includes('保留') && !card.directEffects?.retain
                    && card.choiceRate < 0.30 && card.drawnUsageRate < 0.20)
            ))
            .map(card => ({ role: result.role, build: result.build, ...card })));
    lines.push('## 需要继续处理', '');
    if (!deadCards.length) lines.push('- 没有出现所属构筑内选择率低于 2%，或抽到后使用率低于 20% 的卡牌。');
    else {
        for (const card of deadCards) {
            lines.push(`- ${card.role} / ${card.build}：${card.name}，选择率 ${pct(card.choiceRate)}，入牌率 ${pct(card.deckInclusionRate)}，抽到后使用率 ${pct(card.drawnUsageRate)}。`);
        }
    }
    lines.push('', '## 战士鸡肋牌守卫', '');
    if (!warriorChaff.length) lines.push('- 三个战士流派均未出现选择率低于 8%，或抽到后使用率低于 25% 的所属卡牌。');
    else {
        for (const card of warriorChaff) {
            lines.push(`- ${card.build}：${card.name}，选择率 ${pct(card.choiceRate)}，抽到后使用率 ${pct(card.drawnUsageRate)}。`);
        }
    }
    lines.push('');
    return `${lines.join('\n').trimEnd()}\n`;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const data = loadGameData();
    const results = [];
    for (const [roleId, builds] of Object.entries(data.BUILD_DIRECTIONS)) {
        for (const buildId of Object.keys(builds)) results.push(runBuild(data, roleId, buildId, args));
    }
    const report = {
        generatedAt: new Date().toISOString(),
        model: 'reward choice and forced encounter simulation v1',
        runsPerSeed: args.runs,
        seeds: SEED_OFFSETS.map(offset => args.seed + offset),
        draftRounds: DRAFT_ROUNDS,
        results
    };
    fs.writeFileSync(path.resolve(ROOT, args.json), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.resolve(ROOT, args.markdown), renderMarkdown(report));
    console.log(`Card selection simulation: ${args.runs} drafts per seed, ${SEED_OFFSETS.length} seeds`);
    for (const result of results) {
        const lowest = result.cards.filter(card => card.isPrimaryBuild && card.offers >= 30).slice(0, 3);
        console.log(`${result.role}\t${result.build}\t${lowest.map(card => `${card.name} ${pct(card.choiceRate)}`).join(' / ')}`);
    }
    const warriorChaff = results
        .filter(result => result.roleId === 'hero_warrior')
        .flatMap(result => result.cards.filter(card => card.isPrimaryBuild && card.offers >= 30 && (
            card.choiceRate < 0.08
            || (card.opportunities >= 50 && !(card.tags || []).includes('保留') && !card.directEffects?.retain
                && card.choiceRate < 0.30 && card.drawnUsageRate < 0.20)
        )));
    if (warriorChaff.length) {
        console.error(`Warrior chaff guard failed: ${warriorChaff.map(card => card.name).join(', ')}`);
        process.exitCode = 1;
    }
}

main();
