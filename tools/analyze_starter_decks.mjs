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
        checkpoints
    };
}

function renderMarkdown(report) {
    const lines = [
        '# 初始牌组测试报告',
        '',
        `测试日期：${report.generatedAt.slice(0, 10)}`,
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
    const report = {
        generatedAt: new Date().toISOString(),
        model: 'starter deck forced encounter simulation v1',
        runsPerEnemy: args.runs,
        seed: args.seed,
        results
    };
    fs.writeFileSync(path.resolve(ROOT, args.json), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.resolve(ROOT, args.markdown), renderMarkdown(report));
    console.log(`Starter deck simulation: ${args.runs} runs per role, checkpoint and enemy`);
    for (const result of results) {
        console.log(`${result.role}\t前期 ${pct(result.checkpoints.early.aggregate.winRate)}\t中期 ${pct(result.checkpoints.mid.aggregate.winRate)}\t后期 ${pct(result.checkpoints.late.aggregate.winRate)}`);
    }
}

main();
