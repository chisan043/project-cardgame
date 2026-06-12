#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CHECKPOINTS,
    applyStarterCoreTransform,
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
    const text = `${relic.name || ''}${relic.desc || ''}`;
    const inferred = [];
    for (const [buildTag, config] of Object.entries(data.BUILD_DIRECTIONS[roleId] || {})) {
        if ((config.triggerTags || []).some(tag => text.includes(`[${tag}]`) || text.includes(tag))) inferred.push(buildTag);
    }
    return [...new Set([...explicit, ...inferred])];
}

function analyzeStarterBias(data, roleId, starter) {
    const isWarriorEconomyV1 = roleId === 'hero_warrior'
        && (data.STARTER_CORE_RELIC_IDS[roleId] || []).length === 0
        && starter.cards.every(card => card.economyV1);
    const directions = data.STARTER_DIRECTION_REWARD_POOLS[roleId] || [];
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
    const bloodoathShieldViolations = roleId === 'hero_warrior' && !isWarriorEconomyV1
        ? classPool.filter(card => getCardBuildTags(data, roleId, card).includes('bloodoath') && (
            card.type === '防御'
            || (card.tags || []).includes('庇护')
            || card.directEffects?.protection
        )).map(card => card.name)
        : [];
    const directionRewardCoverage = Object.fromEntries(directions.map(buildTag => {
        const exact = classPool.filter(card => {
            const tags = getCardBuildTags(data, roleId, card);
            return tags.length === 1 && tags[0] === buildTag;
        }).length;
        const fallback = classPool.filter(card => getCardBuildTags(data, roleId, card).includes(buildTag)).length;
        return [buildTag, { exact, fallback }];
    }));
    const coreChoices = (data.STARTER_CORE_RELIC_IDS[roleId] || []).map(id => ({
        id,
        buildTag: data.RELIC_CARD_REWARD_BONUS_BY_ID[id] || null,
        exists: data.RELIC_POOL.some(relic => relic.id === id)
    }));
    const expectedSourcePoolId = {
        hero_warrior: 'starter_warrior_guard',
        hero_mage: 'starter_mage_omen',
        hero_archer: 'starter_archer_aim'
    }[roleId];
    const survivalRule = {
        hero_warrior: { poolId: 'starter_warrior_guard', copies: isWarriorEconomyV1 ? 4 : 3, type: '防御', tag: null, label: isWarriorEconomyV1 ? '4 张基础防御' : '3 张护盾牌' },
        hero_mage: { poolId: 'starter_mage_heal', copies: 3, type: '能力', tag: '治愈', label: '3 张治愈牌' },
        hero_archer: { poolId: 'starter_archer_step', copies: 1, type: '能力', tag: '闪避', label: '1 张闪避牌' }
    }[roleId];
    const survivalCard = starter.cards.find(card => card.poolId === survivalRule.poolId);
    const survivalIdentity = {
        ...survivalRule,
        actualCopies: Math.max(1, Number(survivalCard?.copies) || 1),
        passed: !!survivalCard
            && survivalCard.type === survivalRule.type
            && (!survivalRule.tag || (survivalCard.tags || []).includes(survivalRule.tag))
            && Math.max(1, Number(survivalCard.copies) || 1) === survivalRule.copies
    };
    const coreTransforms = coreChoices.map(choice => {
        const transform = data.STARTER_CORE_CARD_TRANSFORMS[choice.id];
        const sourceCopies = starter.cards
            .filter(card => card.poolId === transform?.sourcePoolId)
            .reduce((sum, card) => sum + Math.max(1, Number(card.copies) || 1), 0);
        return {
            id: choice.id,
            sourcePoolId: transform?.sourcePoolId || null,
            sourceCopies,
            transformedBuildTags: transform?.card?.buildTags || [],
            shieldlessBloodoath: choice.buildTag !== 'bloodoath' || (
                transform?.card?.type !== '防御'
                && !(transform?.card?.tags || []).includes('庇护')
                && !transform?.card?.directEffects?.protection
            )
        };
    });
    const signalValues = Object.values(buildSignals);
    const profileValues = Object.values(buildProfile);
    const signalSpread = Math.max(...signalValues) - Math.min(...signalValues);
    const profileSpread = Math.max(...profileValues) - Math.min(...profileValues);
    const legacyPassed = signalValues.every(value => value === 1)
        && profileSpread === 0
        && Object.values(directionRewardCoverage).every(value => value.exact > 0)
        && coreChoices.length === 3
        && coreChoices.every(choice => choice.exists && directions.includes(choice.buildTag))
        && survivalIdentity.passed
        && bloodoathShieldViolations.length === 0
        && coreTransforms.every(transform => transform.sourcePoolId === expectedSourcePoolId
            && transform.sourceCopies > 0
            && transform.transformedBuildTags.length === 1
            && transform.shieldlessBloodoath);
    const economyV1Passed = signalValues.every(value => value === 0)
        && profileSpread === 0
        && Object.values(directionRewardCoverage).every(value => value.exact > 0)
        && coreChoices.length === 0
        && survivalIdentity.passed
        && starter.cards.reduce((sum, card) => sum + Math.max(1, Number(card.copies) || 1), 0) === 10;
    const passed = isWarriorEconomyV1 ? economyV1Passed : legacyPassed;
    return {
        buildSignals,
        buildProfile,
        signalSpread,
        profileSpread,
        directionRewardCoverage,
        bloodoathShieldViolations,
        coreChoices,
        coreTransforms,
        survivalIdentity,
        passed
    };
}

function runEncounter(data, roleId, checkpoint, enemyName, runs, seed, coreRelicId = null) {
    let wins = 0;
    let turns = 0;
    let hp = 0;
    let energyWasted = 0;
    const plays = {};
    const opportunities = {};
    const meta = {};
    for (let index = 0; index < runs; index++) {
        const rng = createRng(seed + index * 7919);
        let deck = makeStarterDeck(data, rng, roleId);
        if (coreRelicId) deck = applyStarterCoreTransform(data, deck, coreRelicId);
        const coreRelic = coreRelicId ? data.RELIC_POOL.find(relic => relic.id === coreRelicId) : null;
        const result = simulateBattle(
            data,
            rng,
            roleId,
            deck,
            data.CHARACTERS[roleId].maxHp,
            checkpoint,
            { core: null, coreCard: null, relics: coreRelic ? [coreRelic] : [] },
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

function runCoreVariants(data, roleId, args, roleIndex) {
    return (data.STARTER_CORE_RELIC_IDS[roleId] || []).map((relicId, coreIndex) => {
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
                    args.seed + roleIndex * 3000001 + coreIndex * 500009 + checkpointIndex * 100003 + enemyIndex * 1009,
                    relicId
                );
            }
            checkpoints[checkpoint.id] = aggregateCheckpoint(enemies, TARGETS[checkpoint.id]);
        }
        const relic = data.RELIC_POOL.find(entry => entry.id === relicId);
        const transform = data.STARTER_CORE_CARD_TRANSFORMS[relicId];
        return {
            relicId,
            relic: relic?.name || relicId,
            buildTag: data.RELIC_CARD_REWARD_BONUS_BY_ID[relicId],
            transformedCard: transform?.card?.name || '',
            checkpoints
        };
    });
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
        coreVariants: runCoreVariants(data, roleId, args, roleIndex),
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
    lines.push('## 流派锁定检查', '');
    lines.push('| 角色 | 生存基牌 | 初始信号 | 构筑分差 | 核心遗物覆盖 | 首次奖励精准候选 | 结果 |');
    lines.push('| --- | --- | --- | ---: | --- | --- | --- |');
    for (const result of report.results) {
        const signals = Object.entries(result.bias.buildSignals).map(([tag, value]) => `${tag} ${value}`).join(' / ');
        const cores = result.bias.coreChoices.map(choice => choice.buildTag || choice.id).join(' / ');
        const coverage = Object.entries(result.bias.directionRewardCoverage).map(([tag, value]) => `${tag} ${value.exact}`).join(' / ');
        lines.push(`| ${result.role} | ${result.bias.survivalIdentity.label} | ${signals} | ${result.bias.profileSpread.toFixed(2)} | ${cores} | ${coverage} | ${result.bias.passed ? '通过' : '失败'} |`);
    }
    lines.push('', '通过条件：战士经济版使用 10 张中立牌、4 张基础防御且不开局锁路线；法师与弓手继续检查生存基牌、三件开局核心遗物和三条奖励方向覆盖。', '');
    lines.push('## 核心改造实测', '');
    lines.push('| 角色 | 核心遗物 | 改造牌 | 前期 | 中期无奖励 | 后期无奖励 |');
    lines.push('| --- | --- | --- | ---: | ---: | ---: |');
    for (const result of report.results) {
        for (const variant of result.coreVariants) {
            lines.push(`| ${result.role} | ${variant.relic} | ${variant.transformedCard} | ${pct(variant.checkpoints.early.winRate)} | ${pct(variant.checkpoints.mid.winRate)} | ${pct(variant.checkpoints.late.winRate)} |`);
        }
    }
    lines.push('');
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
        model: 'starter deck, survival identity and core-relic selection simulation v4',
        runsPerEnemy: args.runs,
        seed: args.seed,
        results
    };
    fs.writeFileSync(path.resolve(ROOT, args.json), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.resolve(ROOT, args.markdown), renderMarkdown(report));
    console.log(`Starter deck simulation: ${args.runs} runs per role, checkpoint and enemy`);
    for (const result of results) {
        console.log(`${result.role}\t前期 ${pct(result.checkpoints.early.aggregate.winRate)}\t中期 ${pct(result.checkpoints.mid.aggregate.winRate)}\t后期 ${pct(result.checkpoints.late.aggregate.winRate)}\t流派锁定 ${result.bias.passed ? '通过' : '失败'}`);
    }
}

main();
