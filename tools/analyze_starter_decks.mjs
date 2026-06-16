#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CHECKPOINTS,
    createRng,
    loadGameData,
    makeStarterDeck,
    simulateBattle
} from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_CHECKPOINTS = CHECKPOINTS.filter(checkpoint => ['early', 'mid', 'late'].includes(checkpoint.id));
const TARGETS = {
    early: { min: 0.95, max: 1 },
    mid: { min: 0.70, max: 0.95 },
    late: { min: 0, max: 0.25 }
};

function parseArgs(argv) {
    const result = {
        runs: 1000,
        seed: 20260612,
        json: 'tools/starter_deck_report.json',
        markdown: '初始牌组测试报告.md'
    };
    for (let index = 0; index < argv.length; index++) {
        if (argv[index] === '--runs') result.runs = Number(argv[++index]);
        else if (argv[index] === '--seed') result.seed = Number(argv[++index]);
        else if (argv[index] === '--json') result.json = argv[++index];
        else if (argv[index] === '--markdown') result.markdown = argv[++index];
    }
    if (!Number.isFinite(result.runs) || result.runs < 100) throw new Error('--runs must be at least 100');
    return result;
}

function encounterPool(data, checkpoint) {
    const tier = checkpoint.floor < 5 ? 1 : checkpoint.floor < 12 ? 2 : 3;
    return data.ENEMIES.filter(enemy => enemy.tier === tier && !enemy.type);
}

function addCounter(target, key, amount = 1) {
    target[key] = (target[key] || 0) + amount;
}

function mergeCounters(target, source) {
    for (const [key, value] of Object.entries(source || {})) addCounter(target, key, value);
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function localDate(date) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

function targetStatus(value, target) {
    if (value < target.min) return '偏低';
    if (value > target.max) return '偏高';
    return '达标';
}

function summarizeUsage(meta, plays, opportunities) {
    return Object.keys(meta).map(id => ({
        id,
        ...meta[id],
        plays: plays[id] || 0,
        opportunities: opportunities[id] || 0,
        usageRate: (plays[id] || 0) / Math.max(1, opportunities[id] || 0)
    })).sort((left, right) => left.usageRate - right.usageRate);
}

function getExplicitBuildTags(data, card) {
    if (card.buildNeutral) return [];
    if (Array.isArray(card.buildTags) && card.buildTags.length) return card.buildTags;
    const keys = [card.poolId, card.specialId, card.id, card.name].filter(Boolean);
    for (const key of keys) {
        if (data.CARD_BUILD_TAGS_BY_ID[key]) return data.CARD_BUILD_TAGS_BY_ID[key];
    }
    return [];
}

function getCardBuildTags(data, roleId, card) {
    if (card.buildNeutral) return [];
    const explicit = getExplicitBuildTags(data, card);
    const inferred = [];
    const tags = card.tags || [];
    for (const [buildTag, config] of Object.entries(data.BUILD_DIRECTIONS[roleId] || {})) {
        if ((config.triggerTags || []).some(tag => tags.includes(tag))) inferred.push(buildTag);
    }
    return [...new Set([...explicit, ...inferred])];
}

function getRelicBuildTags(data, roleId, relic) {
    const explicit = data.RELIC_BUILD_TAGS_BY_ID[relic.id] || [];
    if (explicit.length) return explicit;
    const text = `${relic.name || ''}${relic.desc || ''}`;
    const inferred = [];
    for (const [buildTag, config] of Object.entries(data.BUILD_DIRECTIONS[roleId] || {})) {
        if ((config.triggerTags || []).some(tag => text.includes(`[${tag}]`) || text.includes(tag))) inferred.push(buildTag);
    }
    return [...new Set([...explicit, ...inferred])];
}

function analyzeStarterBias(data, roleId, starter) {
    const directions = Object.keys(data.BUILD_DIRECTIONS[roleId] || {});
    const buildSignals = Object.fromEntries(directions.map(tag => [tag, 0]));
    const buildProfile = Object.fromEntries(directions.map(tag => [tag, 0]));
    for (const card of starter.cards) {
        const copies = Math.max(1, Number(card.copies) || 1);
        const explicit = getExplicitBuildTags(data, card);
        const allTags = getCardBuildTags(data, roleId, card);
        for (const tag of allTags) {
            if (buildSignals[tag] !== undefined) buildSignals[tag] += copies;
        }
        for (const tag of explicit) {
            if (buildProfile[tag] !== undefined) buildProfile[tag] += copies * 0.5;
        }
        for (const tag of allTags) {
            if (buildProfile[tag] !== undefined) buildProfile[tag] += copies * 0.25;
        }
    }
    const classPool = data.CHARACTER_CARD_POOLS[roleId] || [];
    const bloodoathShieldViolations = roleId === 'hero_warrior'
        ? [
            ...classPool.filter(card => getCardBuildTags(data, roleId, card).includes('bloodoath') && (
            card.type === '防御'
            || (card.tags || []).includes('庇护')
            || card.directEffects?.protection
            )).map(card => `卡牌：${card.name}`),
            ...data.RELIC_POOL.filter(relic => getRelicBuildTags(data, roleId, relic).includes('bloodoath') && (
                /(?:获得|转化为)[^。；]*(?:护盾|庇护)/.test(relic.desc || '') || relic.directEffects?.protection
            )).map(relic => `遗物：${relic.name}`)
        ]
        : [];
    const bloodoathCards = roleId === 'hero_warrior'
        ? classPool.filter(card => getCardBuildTags(data, roleId, card).includes('bloodoath'))
        : [];
    const bloodDebtRoleCoverage = roleId === 'hero_warrior' ? {
        selfDamage: bloodoathCards.filter(card => card.bloodOathCost > 0).map(card => card.name),
        lowHpPayoff: bloodoathCards.filter(card => card.bloodOathMissingRatio > 0).map(card => card.name),
        recovery: bloodoathCards.filter(card => (card.tags || []).includes('吸血') || (card.tags || []).includes('治愈') || Number(card.healValue) > 0).map(card => card.name),
        tension: bloodoathCards.filter(card => card.bloodOathCost >= 5 || card.bloodDebtStun > 0).map(card => card.name)
    } : null;
    const bloodDebtCoveragePassed = !bloodDebtRoleCoverage || Object.values(bloodDebtRoleCoverage).every(cards => cards.length >= 2);
    const directionRewardCoverage = Object.fromEntries(directions.map(buildTag => {
        const exact = classPool.filter(card => {
            const tags = getCardBuildTags(data, roleId, card);
            return tags.length === 1 && tags[0] === buildTag;
        }).length;
        const fallback = classPool.filter(card => getCardBuildTags(data, roleId, card).includes(buildTag)).length;
        return [buildTag, { exact, fallback }];
    }));
    const bridgeCoverage = {};
    for (let left = 0; left < directions.length; left++) {
        for (let right = left + 1; right < directions.length; right++) {
            const pair = [directions[left], directions[right]];
            bridgeCoverage[pair.join('+')] = classPool.filter(card => {
                const tags = getCardBuildTags(data, roleId, card);
                return pair.every(tag => tags.includes(tag));
            }).map(card => card.name);
        }
    }
    const requiredBridgePairs = roleId === 'hero_warrior'
        ? ['oathblade+execution', 'execution+bloodoath']
        : [];
    const bridgeCoveragePassed = requiredBridgePairs.every(pair => (bridgeCoverage[pair] || []).length > 0);
    const starterRule = {
        hero_warrior: {
            survival: { poolId: 'starter_warrior_guard', copies: 4, type: '防御', tag: null, label: '4 张护盾牌' },
            requiredSignals: { oathblade: 1, execution: 1, bloodoath: 1 },
            maxSignals: { bloodoath: 1 }
        },
        hero_mage: {
            survival: { poolId: 'starter_mage_heal', copies: 2, type: '能力', tag: '治愈', label: '2 张治愈牌' },
            requiredSignals: { chant: 2 },
            forbiddenSignals: ['mirror', 'calamity']
        },
        hero_archer: {
            survival: { poolId: 'starter_archer_step', copies: 2, type: '能力', tag: '闪避', label: '2 张闪避牌' },
            requiredSignals: { gale: 2 },
            maxSignals: { exile: 1, venom: 0 }
        }
    }[roleId];
    const survivalRule = starterRule.survival;
    const survivalCard = starter.cards.find(card => card.poolId === survivalRule.poolId);
    const survivalIdentity = {
        ...survivalRule,
        actualCopies: Math.max(1, Number(survivalCard?.copies) || 1),
        passed: !!survivalCard
            && survivalCard.type === survivalRule.type
            && (!survivalRule.tag || (survivalCard.tags || []).includes(survivalRule.tag))
            && Math.max(1, Number(survivalCard.copies) || 1) === survivalRule.copies
    };
    const signalValues = Object.values(buildSignals);
    const profileValues = Object.values(buildProfile);
    const signalSpread = Math.max(...signalValues) - Math.min(...signalValues);
    const profileSpread = Math.max(...profileValues) - Math.min(...profileValues);
    const balancedSignalsPassed = !starterRule.balancedSignals || (signalValues.every(value => value === 1) && profileSpread === 0);
    const requiredSignalsPassed = Object.entries(starterRule.requiredSignals || {})
        .every(([tag, minimum]) => (buildSignals[tag] || 0) >= minimum);
    const maxSignalsPassed = Object.entries(starterRule.maxSignals || {})
        .every(([tag, maximum]) => (buildSignals[tag] || 0) <= maximum);
    const forbiddenSignalsPassed = (starterRule.forbiddenSignals || [])
        .every(tag => (buildSignals[tag] || 0) === 0);
    const starterTeachingPassed = balancedSignalsPassed
        && requiredSignalsPassed
        && maxSignalsPassed
        && forbiddenSignalsPassed;
    const passed = starterTeachingPassed
        && Object.values(directionRewardCoverage).every(value => value.exact > 0)
        && survivalIdentity.passed
        && bloodoathShieldViolations.length === 0
        && bloodDebtCoveragePassed
        && bridgeCoveragePassed;
    return {
        buildSignals,
        buildProfile,
        signalSpread,
        profileSpread,
        directionRewardCoverage,
        bloodoathShieldViolations,
        bloodDebtRoleCoverage,
        bloodDebtCoveragePassed,
        bridgeCoverage,
        requiredBridgePairs,
        bridgeCoveragePassed,
        survivalIdentity,
        starterTeachingPassed,
        passed
    };
}

function runEncounter(data, roleId, checkpoint, enemyName, runs, seed) {
    let wins = 0;
    let turns = 0;
    let hp = 0;
    let energyWasted = 0;
    const plays = {};
    const opportunities = {};
    const meta = {};
    for (let index = 0; index < runs; index++) {
        const rng = createRng(seed + index * 7919);
        const deck = makeStarterDeck(data, rng, roleId);
        const result = simulateBattle(
            data,
            rng,
            roleId,
            deck,
            data.CHARACTERS[roleId].maxHp,
            checkpoint,
            { core: null, coreCard: null, relics: [] },
            { enemyName }
        );
        wins += result.win ? 1 : 0;
        turns += result.turns;
        hp += result.hp;
        energyWasted += result.energyWasted;
        mergeCounters(plays, result.cardPlays);
        mergeCounters(opportunities, result.cardOpportunities);
        Object.assign(meta, result.cardMeta);
    }
    return {
        games: runs,
        winRate: wins / runs,
        averageTurns: turns / runs,
        averageHpLeft: hp / runs,
        energyWastedPerTurn: energyWasted / Math.max(1, turns),
        cardUsage: summarizeUsage(meta, plays, opportunities)
    };
}

function aggregateCheckpoint(enemies, target) {
    const values = Object.values(enemies);
    const winRate = values.reduce((sum, entry) => sum + entry.winRate * entry.games, 0)
        / Math.max(1, values.reduce((sum, entry) => sum + entry.games, 0));
    return {
        winRate,
        status: targetStatus(winRate, target),
        lowestEnemy: Object.entries(enemies).sort((left, right) => left[1].winRate - right[1].winRate)[0]?.[0] || '',
        highestEnemy: Object.entries(enemies).sort((left, right) => right[1].winRate - left[1].winRate)[0]?.[0] || ''
    };
}

function runRole(data, roleId, args, roleIndex) {
    const checkpoints = {};
    for (let checkpointIndex = 0; checkpointIndex < TEST_CHECKPOINTS.length; checkpointIndex++) {
        const checkpoint = TEST_CHECKPOINTS[checkpointIndex];
        const enemies = {};
        const pool = encounterPool(data, checkpoint);
        for (let enemyIndex = 0; enemyIndex < pool.length; enemyIndex++) {
            const enemy = pool[enemyIndex];
            enemies[enemy.name] = runEncounter(
                data,
                roleId,
                checkpoint,
                enemy.name,
                args.runs,
                args.seed + roleIndex * 1000003 + checkpointIndex * 100003 + enemyIndex * 1009
            );
        }
        checkpoints[checkpoint.id] = {
            label: checkpoint.label,
            enemies,
            aggregate: aggregateCheckpoint(enemies, TARGETS[checkpoint.id])
        };
    }
    const starterId = data.CHARACTERS[roleId].starterDeckId;
    const starter = data.STARTER_DECKS[starterId];
    const bias = analyzeStarterBias(data, roleId, starter);
    return {
        roleId,
        role: data.CHARACTERS[roleId].name,
        starterId,
        deckSize: starter.cards.reduce((sum, card) => sum + Math.max(1, Number(card.copies) || 1), 0),
        cards: starter.cards.map(card => ({
            name: card.name,
            copies: Math.max(1, Number(card.copies) || 1),
            cost: card.cost,
            type: card.type,
            tags: card.tags || [],
            directEffects: card.directEffects || {}
        })),
        bias,
        checkpoints
    };
}

function renderMarkdown(report) {
    const lines = [
        '# 初始牌组测试报告',
        '',
        `测试日期：${report.generatedDate}`,
        '',
        `每个角色、节点、敌人样本量：${report.runsPerEnemy} 局；随机种子：\`${report.seed}\`。`,
        '',
        '目标：前期普通战 95%–100%；中期在没有奖励牌时为 70%–95%；后期仍不拿奖励牌时不高于 25%。',
        '',
        '## 总体胜率',
        '',
        '| 角色 | 牌组大小 | 前期 | 中期无奖励 | 后期无奖励 | 判断 |',
        '| --- | ---: | ---: | ---: | ---: | --- |'
    ];
    for (const result of report.results) {
        const early = result.checkpoints.early.aggregate;
        const mid = result.checkpoints.mid.aggregate;
        const late = result.checkpoints.late.aggregate;
        lines.push(`| ${result.role} | ${result.deckSize} | ${pct(early.winRate)} | ${pct(mid.winRate)} | ${pct(late.winRate)} | ${early.status} / ${mid.status} / ${late.status} |`);
    }
    lines.push('', '## 分敌人胜率', '');
    for (const result of report.results) {
        lines.push(`### ${result.role}`, '');
        lines.push('| 节点 | 敌人 | 胜率 | 平均回合 | 平均剩余生命 | 浪费能量/回合 |');
        lines.push('| --- | --- | ---: | ---: | ---: | ---: |');
        for (const checkpoint of Object.values(result.checkpoints)) {
            for (const [enemyName, enemy] of Object.entries(checkpoint.enemies)) {
                lines.push(`| ${checkpoint.label} | ${enemyName} | ${pct(enemy.winRate)} | ${enemy.averageTurns.toFixed(2)} | ${enemy.averageHpLeft.toFixed(1)} | ${enemy.energyWastedPerTurn.toFixed(2)} |`);
            }
        }
        lines.push('');
    }
    lines.push('## 开放构筑检查', '');
    lines.push('| 角色 | 生存基牌 | 初始信号 | 构筑分差 | 单路线候选 | 桥接覆盖 | 结果 |');
    lines.push('| --- | --- | --- | ---: | --- | --- | --- |');
    for (const result of report.results) {
        const signals = Object.entries(result.bias.buildSignals).map(([tag, value]) => `${tag} ${value}`).join(' / ');
        const coverage = Object.entries(result.bias.directionRewardCoverage).map(([tag, value]) => `${tag} ${value.exact}`).join(' / ');
        const bridges = Object.entries(result.bias.bridgeCoverage)
            .filter(([, cards]) => cards.length)
            .map(([pair, cards]) => `${pair} ${cards.length}`)
            .join(' / ') || '无';
        lines.push(`| ${result.role} | ${result.bias.survivalIdentity.label} | ${signals} | ${result.bias.profileSpread.toFixed(2)} | ${coverage} | ${bridges} | ${result.bias.passed ? '通过' : '失败'} |`);
    }
    lines.push('', '通过条件：三个角色保留各自的基础生存轴；战士初始牌聚焦基础攻防，并各保留 1 个圣剑、处刑、血誓魔剑信号且不预塞反击，法师初始牌聚焦咏唱闭环且不预塞镜像/灾厄，弓手初始牌聚焦风势与有限闪避且不预塞猎毒；每个方向都有独立牌可选；战士至少保留圣剑与处刑、处刑与血誓魔剑两类桥接牌；血誓魔剑不得出现护盾或庇护。', '');
    lines.push('## 初始卡使用率', '');
    for (const result of report.results) {
        const teachingEnemies = ['early', 'mid'].flatMap(id => Object.values(result.checkpoints[id].enemies));
        const usageByName = {};
        for (const enemy of teachingEnemies) {
            for (const card of enemy.cardUsage) {
                usageByName[card.name] ||= { plays: 0, opportunities: 0 };
                usageByName[card.name].plays += card.plays;
                usageByName[card.name].opportunities += card.opportunities;
            }
        }
        lines.push(`### ${result.role}`, '');
        lines.push('| 卡牌 | 张数 | 费用 | 主词条 | 抽到后使用率 |');
        lines.push('| --- | ---: | ---: | --- | ---: |');
        for (const card of result.cards) {
            const usage = usageByName[card.name] || { plays: 0, opportunities: 0 };
            lines.push(`| ${card.name} | ${card.copies} | ${card.cost} | ${card.tags.join('、') || '无'} | ${pct(usage.plays / Math.max(1, usage.opportunities))} |`);
        }
        lines.push('');
    }
    return `${lines.join('\n').trimEnd()}\n`;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const data = loadGameData();
    const results = Object.keys(data.CHARACTERS).map((roleId, roleIndex) => runRole(data, roleId, args, roleIndex));
    const generatedAt = new Date();
    const report = {
        generatedAt: generatedAt.toISOString(),
        generatedDate: localDate(generatedAt),
        model: 'starter deck, survival identity and open-build simulation v5',
        runsPerEnemy: args.runs,
        seed: args.seed,
        results
    };
    fs.writeFileSync(path.resolve(ROOT, args.json), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.resolve(ROOT, args.markdown), renderMarkdown(report));
    console.log(`Starter deck simulation: ${args.runs} runs per role, checkpoint and enemy`);
    for (const result of results) {
        console.log(`${result.role}\t前期 ${pct(result.checkpoints.early.aggregate.winRate)}\t中期 ${pct(result.checkpoints.mid.aggregate.winRate)}\t后期 ${pct(result.checkpoints.late.aggregate.winRate)}\t开放构筑 ${result.bias.passed ? '通过' : '失败'}`);
    }
}

main();
