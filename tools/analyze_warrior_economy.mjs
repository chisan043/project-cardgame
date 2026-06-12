#!/usr/bin/env node

import {
    createRng,
    loadGameData,
    makeStarterDeck,
    simulateBattle
} from './simulate_build_balance.mjs';

const RUNS = 1000;
const SEED = 20260613;
const ROLE_ID = 'hero_warrior';

function average(total, count) {
    return total / Math.max(1, count);
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function runEncounter(data, enemy, enemyIndex) {
    const totals = {
        wins: 0,
        turns: 0,
        hp: 0,
        cardsPlayed: 0,
        cardsLeft: 0,
        handCost: 0,
        handSamples: 0,
        emptyTurns: 0,
        energyWasted: 0
    };

    for (let run = 0; run < RUNS; run++) {
        const rng = createRng(SEED + enemyIndex * 100003 + run * 7919);
        const deck = makeStarterDeck(data, rng, ROLE_ID);
        const result = simulateBattle(
            data,
            rng,
            ROLE_ID,
            deck,
            data.CHARACTERS[ROLE_ID].maxHp,
            { id: 'economy-early', label: '前期经济', floor: 0, type: 'normal' },
            { core: null, coreCard: null, relics: [] },
            { enemyName: enemy.name }
        );
        totals.wins += result.win ? 1 : 0;
        totals.turns += result.turns;
        totals.hp += result.hp;
        totals.cardsPlayed += result.cardsPlayed;
        totals.cardsLeft += result.cardsLeft;
        totals.handCost += result.handCost;
        totals.handSamples += result.handSamples;
        totals.emptyTurns += result.handEmptyTurns;
        totals.energyWasted += result.energyWasted;
    }

    return {
        enemy: enemy.name,
        winRate: totals.wins / RUNS,
        turns: average(totals.turns, RUNS),
        hpLost: data.CHARACTERS[ROLE_ID].maxHp - average(totals.hp, RUNS),
        cardsPlayed: average(totals.cardsPlayed, totals.turns),
        cardsLeft: average(totals.cardsLeft, totals.turns),
        handCost: average(totals.handCost, totals.handSamples),
        energyUsed: 5 - average(totals.energyWasted, totals.turns),
        emptyRate: average(totals.emptyTurns, totals.turns)
    };
}

function run() {
    const data = loadGameData();
    const character = data.CHARACTERS[ROLE_ID];
    const pool = data.CHARACTER_CARD_POOLS[ROLE_ID];
    const starter = data.STARTER_DECKS[character.starterDeckId].cards;
    const starterSize = starter.reduce((sum, card) => sum + Math.max(1, Number(card.copies) || 1), 0);
    const starterTotalCost = starter.reduce((sum, card) => sum + Math.max(1, Number(card.copies) || 1) * card.cost, 0);
    const averageStarterHandCost = starterTotalCost / starterSize * character.openingHand;
    const averagePoolCost = pool.reduce((sum, card) => sum + card.cost, 0) / pool.length;
    const costCounts = Object.fromEntries([0, 1, 2, 3, 4, 5].map(cost => [cost, pool.filter(card => card.cost === cost).length]));

    assert(character.baseEnergy === 5, '战士基础能量必须为 5');
    assert(character.openingHand === 5, '战士每回合必须抽 5 张牌');
    assert(starterSize === 10, `初始牌组应为 10 张，实际为 ${starterSize}`);
    assert(pool.length === 30, `战士奖励池应为 30 张，实际为 ${pool.length}`);
    assert(new Set(pool.map(card => card.poolId)).size === pool.length, '战士奖励池存在重复 poolId');
    assert(new Set(pool.map(card => card.name)).size === pool.length, '战士奖励池存在重复卡名');
    assert(pool.every(card => card.economyV1), '战士奖励池存在未迁移到 economyV1 的卡牌');
    for (const buildTag of data.STARTER_DIRECTION_REWARD_POOLS[ROLE_ID]) {
        assert(pool.filter(card => (card.buildTags || []).includes(buildTag)).length === 10, `${buildTag} 方向应恰好有 10 张牌`);
    }
    assert(data.STARTER_CORE_RELIC_IDS[ROLE_ID].length === 0, '战士不应在开局强制选择核心遗物');
    assert(averageStarterHandCost >= 9 && averageStarterHandCost <= 12, '初始五张手牌费用不在 9 至 12 区间');
    assert(averagePoolCost >= 2.2 && averagePoolCost <= 2.5, '奖励池平均费用不在 2.2 至 2.5 区间');
    assert(costCounts[1] / pool.length >= 0.15, '1 费牌占比低于 15%');
    assert(costCounts[4] / pool.length >= 0.05, '4 费牌占比低于 5%');

    const enemies = data.ENEMIES.filter(enemy => enemy.tier === 1 && !enemy.type);
    const results = enemies.map(runEncounter.bind(null, data));
    const aggregate = {
        winRate: average(results.reduce((sum, item) => sum + item.winRate, 0), results.length),
        turns: average(results.reduce((sum, item) => sum + item.turns, 0), results.length),
        hpLost: average(results.reduce((sum, item) => sum + item.hpLost, 0), results.length),
        cardsPlayed: average(results.reduce((sum, item) => sum + item.cardsPlayed, 0), results.length),
        cardsLeft: average(results.reduce((sum, item) => sum + item.cardsLeft, 0), results.length),
        handCost: average(results.reduce((sum, item) => sum + item.handCost, 0), results.length),
        energyUsed: average(results.reduce((sum, item) => sum + item.energyUsed, 0), results.length),
        emptyRate: average(results.reduce((sum, item) => sum + item.emptyRate, 0), results.length)
    };

    console.log('战士战斗经济静态检查');
    console.log(`初始牌组 ${starterSize} 张，五张手牌平均费用 ${averageStarterHandCost.toFixed(2)}`);
    console.log(`奖励池 ${pool.length} 张，平均费用 ${averagePoolCost.toFixed(2)}，费用分布 ${JSON.stringify(costCounts)}`);
    console.log('');
    console.log('敌人\t胜率\t回合\t损失生命\t出牌/回合\t剩牌/回合\t手牌费用\t耗能/回合\t打光率');
    for (const result of [...results, { enemy: '总体', ...aggregate }]) {
        console.log([
            result.enemy,
            pct(result.winRate),
            result.turns.toFixed(2),
            result.hpLost.toFixed(1),
            result.cardsPlayed.toFixed(2),
            result.cardsLeft.toFixed(2),
            result.handCost.toFixed(2),
            result.energyUsed.toFixed(2),
            pct(result.emptyRate)
        ].join('\t'));
    }
}

run();
