#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CHECKPOINTS,
    FOUNDATION,
    MATURE_LOADOUTS,
    createRng,
    getBuildPool,
    getLoadout,
    loadGameData,
    simulateBattle,
    simulateCheckpoint
} from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FOCUS_CHECKPOINTS = CHECKPOINTS.filter(checkpoint => ['late', 'elite', 'boss'].includes(checkpoint.id));
const SCENARIO_LABELS = {
    pure: '纯流派无核心',
    mid: '单方向遗物',
    noCoreMatureRelics: '成熟遗物缺核心',
    coreOnly: '只有核心无遗物',
    mixedNoCore: '混合拿牌无核心',
    mixedMidRelic: '混合拿牌单遗物',
    mature: '完整成熟'
};
const WEAK_FLOORS = {
    late: 0.70,
    elite: 0.28,
    boss: 0.03
};
const CORE_DEPENDENCY_LIMIT = {
    late: 18,
    elite: 15,
    boss: 7
};
const NORMAL_MIXED_SHARE = 0.8;

function parseArgs(argv) {
    const result = {
        runs: 800,
        seed: 20260614,
        json: 'tools/practical_balance_report.json',
        markdown: '实战缺核心平衡测试报告.md'
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

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function pp(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}pp`;
}

function makeSeed(base, roleIndex, buildIndex, checkpointIndex, scenarioIndex) {
    return base
        + roleIndex * 1000003
        + buildIndex * 100003
        + checkpointIndex * 10007
        + scenarioIndex * 1009;
}

function cardBuildTags(data, card) {
    return card.buildTags || data.CARD_BUILD_TAGS_BY_ID[card.poolId || card.id] || [];
}

function roleMixedPool(data, roleId, buildId) {
    return data.CHARACTER_CARD_POOLS[roleId]
        .filter(card => !card.isSpecial && !card.buildNeutral)
        .filter(card => {
            const tags = cardBuildTags(data, card);
            return tags.length && !tags.includes(buildId);
        });
}

function shuffle(rng, items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const swap = Math.floor(rng() * (index + 1));
        [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
}

function isMagicSwordCard(card) {
    return card && (card.poolId === 'warrior_magic_sword' || card.name === '魔剑');
}

function upgradeRandomCard(rng, deck) {
    const candidates = deck.filter(card => !card.up && !card.isSpecial);
    if (!candidates.length) return;
    const card = candidates[Math.floor(rng() * candidates.length)];
    card.up = true;
    card.rarity = '史诗';
    if (isMagicSwordCard(card)) {
        const oldGrowth = Math.max(1, Math.floor(Number(card.magicSwordGrowth) || 1));
        card.magicSwordGrowth = Math.max(2, oldGrowth + 1);
    } else if ((Number(card.val) || 0) > 0) {
        card.val *= 2;
    }
}

function makeMixedDeck(data, rng, roleId, buildId, checkpoint, loadout) {
    const ownPool = shuffle(rng, getBuildPool(data, roleId, buildId));
    const mixedPool = shuffle(rng, roleMixedPool(data, roleId, buildId));
    const foundationCards = checkpoint.id === 'mid' ? 4 : 3;
    const ownCards = checkpoint.id === 'mid' ? 3 : 5;
    const offBuildCards = checkpoint.id === 'mid' ? 3 : 5;
    const deck = [];
    for (let index = 0; index < foundationCards; index++) {
        deck.push(clone(FOUNDATION[roleId][index % FOUNDATION[roleId].length]));
    }
    for (let index = 0; index < ownCards; index++) {
        deck.push(clone(ownPool[index % ownPool.length]));
    }
    for (let index = 0; index < offBuildCards && mixedPool.length; index++) {
        deck.push(clone(mixedPool[index % mixedPool.length]));
    }
    if (loadout?.coreCard) deck.push({ ...clone(loadout.coreCard), specialId: loadout.coreCard.id });
    if (['late', 'elite', 'boss'].includes(checkpoint.id)) upgradeRandomCard(rng, deck);
    return shuffle(rng, deck).map((card, index) => ({ ...card, simId: `${index}:${card.poolId || card.name}` }));
}

function addCounter(target, key, amount = 1) {
    target[key] = (target[key] || 0) + amount;
}

function mergeCounters(target, source) {
    for (const [key, value] of Object.entries(source || {})) addCounter(target, key, value);
}

function summarizeCardUsage(plays, opportunities, metadata, runs) {
    return Object.keys(metadata).map(key => ({
        id: key,
        ...metadata[key],
        plays: plays[key] || 0,
        opportunities: opportunities[key] || 0,
        playsPerBattle: (plays[key] || 0) / runs,
        usageRate: (plays[key] || 0) / Math.max(1, opportunities[key] || 0)
    })).sort((left, right) => right.plays - left.plays || right.usageRate - left.usageRate);
}

function simulateMixedCheckpoint(data, roleId, buildId, checkpoint, runs, seed, loadout) {
    let wins = 0;
    let turns = 0;
    let hpLeft = 0;
    let damageTaken = 0;
    let damageDealt = 0;
    const deathCauses = {};
    const victoryCauses = {};
    const cardPlays = {};
    const cardOpportunities = {};
    const cardMeta = {};
    for (let index = 0; index < runs; index++) {
        const rng = createRng(seed + index * 7919);
        const deck = makeMixedDeck(data, rng, roleId, buildId, checkpoint, loadout);
        const result = simulateBattle(data, rng, roleId, deck, data.CHARACTERS[roleId].maxHp, checkpoint, loadout);
        wins += result.win ? 1 : 0;
        turns += result.turns;
        hpLeft += result.hp;
        damageTaken += result.damageTaken;
        damageDealt += result.damageDealt;
        if (result.deathCause) addCounter(deathCauses, result.deathCause);
        if (result.victoryCause) addCounter(victoryCauses, result.victoryCause);
        mergeCounters(cardPlays, result.cardPlays);
        mergeCounters(cardOpportunities, result.cardOpportunities);
        Object.assign(cardMeta, result.cardMeta);
    }
    return {
        winRate: wins / runs,
        averageTurns: turns / runs,
        averageHpLeft: hpLeft / runs,
        averageDamageTaken: damageTaken / runs,
        averageDamageDealt: damageDealt / runs,
        deathCauses,
        victoryCauses,
        cardUsage: summarizeCardUsage(cardPlays, cardOpportunities, cardMeta, runs)
    };
}

function loadoutForScenario(data, roleId, buildId, scenarioId) {
    const mature = MATURE_LOADOUTS[buildId];
    if (scenarioId === 'pure' || scenarioId === 'mixedNoCore') {
        return getLoadout(data, roleId, buildId, 'pure');
    }
    if (scenarioId === 'mid' || scenarioId === 'mixedMidRelic') {
        return getLoadout(data, roleId, buildId, 'mid');
    }
    if (scenarioId === 'mature') {
        return getLoadout(data, roleId, buildId, 'mature');
    }
    if (scenarioId === 'noCoreMatureRelics') {
        return getLoadout(data, roleId, buildId, 'mature', { core: null, relics: [...mature.relics] });
    }
    if (scenarioId === 'coreOnly') {
        return getLoadout(data, roleId, buildId, 'mature', { core: mature.core, relics: [] });
    }
    throw new Error(`Unknown scenario ${scenarioId}`);
}

function simulateScenario(data, roleId, buildId, checkpoint, runs, seed, scenarioId) {
    const loadout = loadoutForScenario(data, roleId, buildId, scenarioId);
    if (scenarioId === 'mixedNoCore' || scenarioId === 'mixedMidRelic') {
        return simulateMixedCheckpoint(data, roleId, buildId, checkpoint, runs, seed, loadout);
    }
    const mode = scenarioId === 'pure' ? 'pure'
        : scenarioId === 'mid' ? 'mid'
            : 'mature';
    const override = ['noCoreMatureRelics', 'coreOnly'].includes(scenarioId)
        ? {
            core: loadout.core || null,
            relics: [...loadout.relics]
        }
        : null;
    return simulateCheckpoint(data, roleId, buildId, checkpoint, runs, seed, mode, {
        loadoutOverride: override
    });
}

function dominant(counter = {}) {
    const entries = Object.entries(counter).sort((left, right) => right[1] - left[1]);
    if (!entries.length) return '-';
    return `${entries[0][0]} ${entries[0][1]}`;
}

function diagnoseEntry(entry) {
    const issues = [];
    for (const checkpoint of FOCUS_CHECKPOINTS) {
        const weak = entry.scenarios.noCoreMatureRelics.checkpoints[checkpoint.id].winRate;
        if (weak < WEAK_FLOORS[checkpoint.id]) {
            issues.push(`${checkpoint.label}缺核心底线偏低(${pct(weak)})`);
        }
        const mature = entry.scenarios.mature.checkpoints[checkpoint.id].winRate;
        const dependency = (mature - weak) * 100;
        if (dependency > CORE_DEPENDENCY_LIMIT[checkpoint.id]) {
            issues.push(`${checkpoint.label}核心依赖过高(${pp(dependency)})`);
        }
    }
    const mixedLate = entry.scenarios.mixedNoCore.checkpoints.late.winRate;
    const pureLate = entry.scenarios.pure.checkpoints.late.winRate;
    if ((pureLate - mixedLate) * 100 > 12) issues.push(`混合拿牌后期掉点明显(${pp((mixedLate - pureLate) * 100)})`);
    for (const checkpoint of FOCUS_CHECKPOINTS) {
        const normalNoCore = weightedNormalRate(entry, 'mixedNoCore', 'pure', checkpoint.id);
        if (normalNoCore < WEAK_FLOORS[checkpoint.id]) {
            issues.push(`${checkpoint.label}正常混合底线偏低(${pct(normalNoCore)})`);
        }
    }
    const bossCoreOnly = entry.scenarios.coreOnly.checkpoints.boss.winRate;
    const bossNoCore = entry.scenarios.noCoreMatureRelics.checkpoints.boss.winRate;
    if ((bossCoreOnly - bossNoCore) * 100 > 8) issues.push(`首领战过度依赖核心牌(${pp((bossCoreOnly - bossNoCore) * 100)})`);
    return issues.length ? issues : ['缺核心体验可接受'];
}

function weightedNormalRate(entry, mixedScenario, pureScenario, checkpointId) {
    return entry.scenarios[mixedScenario].checkpoints[checkpointId].winRate * NORMAL_MIXED_SHARE
        + entry.scenarios[pureScenario].checkpoints[checkpointId].winRate * (1 - NORMAL_MIXED_SHARE);
}

function runPracticalBalance(data, args) {
    const scenarios = ['pure', 'mid', 'noCoreMatureRelics', 'coreOnly', 'mixedNoCore', 'mixedMidRelic', 'mature'];
    const results = [];
    let roleIndex = 0;
    for (const [roleId, builds] of Object.entries(data.BUILD_DIRECTIONS)) {
        let buildIndex = 0;
        for (const [buildId, build] of Object.entries(builds)) {
            const entry = {
                roleId,
                role: data.CHARACTERS[roleId].name,
                buildId,
                build: build.name,
                scenarios: {}
            };
            for (let scenarioIndex = 0; scenarioIndex < scenarios.length; scenarioIndex++) {
                const scenarioId = scenarios[scenarioIndex];
                const scenarioEntry = { label: SCENARIO_LABELS[scenarioId], checkpoints: {} };
                for (let checkpointIndex = 0; checkpointIndex < FOCUS_CHECKPOINTS.length; checkpointIndex++) {
                    const checkpoint = FOCUS_CHECKPOINTS[checkpointIndex];
                    scenarioEntry.checkpoints[checkpoint.id] = simulateScenario(
                        data,
                        roleId,
                        buildId,
                        checkpoint,
                        args.runs,
                        makeSeed(args.seed, roleIndex, buildIndex, checkpointIndex, scenarioIndex),
                        scenarioId
                    );
                }
                entry.scenarios[scenarioId] = scenarioEntry;
            }
            entry.diagnosis = diagnoseEntry(entry);
            results.push(entry);
            buildIndex++;
        }
        roleIndex++;
    }
    return results;
}

function markdownReport(report) {
    const lines = [
        '# 实战缺核心平衡测试报告',
        '',
        `测试日期：${report.generatedAt.slice(0, 10)}`,
        '',
        `每个构筑、场景与节点样本量：${report.runsPerSample} 局；随机种子：\`${report.seed}\`。`,
        '',
        '本报告专门测试玩家没有顺利拿到核心牌或拿牌混杂时的体验，不替代成熟构筑上限测试。',
        '',
        '## 缺核心压力表',
        '',
        '| 职业 | 构筑 | 纯卡后期/精英/首领 | 单遗物后期/精英/首领 | 成熟遗物缺核心 后期/精英/首领 | 完整成熟 后期/精英/首领 | 诊断 |',
        '|---|---|---|---|---|---|---|',
        ...report.results.map(entry => {
            const rates = scenario => ['late', 'elite', 'boss']
                .map(id => pct(entry.scenarios[scenario].checkpoints[id].winRate))
                .join(' / ');
            return `| ${entry.role} | ${entry.build} | ${rates('pure')} | ${rates('mid')} | ${rates('noCoreMatureRelics')} | ${rates('mature')} | ${entry.diagnosis.join('；')} |`;
        }),
        '',
        '## 混合拿牌测试',
        '',
        `正常玩家测试口径：约 ${Math.round(NORMAL_MIXED_SHARE * 100)}% 跑局按多流派混合构筑理解，混合牌组中目标流派与其它流派牌接近各半；纯流派只保留为 ${Math.round((1 - NORMAL_MIXED_SHARE) * 100)}% 对照组。`,
        '',
        '| 职业 | 构筑 | 正常无核心加权 后期/精英/首领 | 混合无核心 后期/精英/首领 | 混合单遗物 后期/精英/首领 | 纯卡对照 后期/精英/首领 |',
        '|---|---|---|---|---|---|',
        ...report.results.map(entry => {
            const rates = scenario => ['late', 'elite', 'boss']
                .map(id => pct(entry.scenarios[scenario].checkpoints[id].winRate))
                .join(' / ');
            const normalRates = ['late', 'elite', 'boss']
                .map(id => pct(weightedNormalRate(entry, 'mixedNoCore', 'pure', id)))
                .join(' / ');
            return `| ${entry.role} | ${entry.build} | ${normalRates} | ${rates('mixedNoCore')} | ${rates('mixedMidRelic')} | ${rates('pure')} |`;
        }),
        '',
        '## 核心依赖差值',
        '',
        '差值为完整成熟胜率减去“成熟遗物缺核心”胜率。数值越大，表示该流派越容易因为没拿到核心牌而体验断崖。',
        '',
        '| 职业 | 构筑 | 后期 | 精英 | 首领 | 主要缺核心死亡原因 | 主要完整击杀来源 |',
        '|---|---|---:|---:|---:|---|---|',
        ...report.results.map(entry => {
            const diff = id => (entry.scenarios.mature.checkpoints[id].winRate
                - entry.scenarios.noCoreMatureRelics.checkpoints[id].winRate) * 100;
            return `| ${entry.role} | ${entry.build} | ${pp(diff('late'))} | ${pp(diff('elite'))} | ${pp(diff('boss'))} | ${dominant(entry.scenarios.noCoreMatureRelics.checkpoints.boss.deathCauses)} | ${dominant(entry.scenarios.mature.checkpoints.boss.victoryCauses)} |`;
        }),
        '',
        '完整数据：`tools/practical_balance_report.json`'
    ];
    return `${lines.join('\n')}\n`;
}

function compactCheckpoint(checkpoint) {
    return {
        winRate: checkpoint.winRate,
        averageTurns: checkpoint.averageTurns,
        averageHpLeft: checkpoint.averageHpLeft,
        averageDamageTaken: checkpoint.averageDamageTaken,
        averageDamageDealt: checkpoint.averageDamageDealt,
        deathCauses: checkpoint.deathCauses,
        victoryCauses: checkpoint.victoryCauses
    };
}

function compactResults(results) {
    return results.map(entry => ({
        ...entry,
        scenarios: Object.fromEntries(Object.entries(entry.scenarios).map(([scenarioId, scenario]) => [scenarioId, {
            label: scenario.label,
            checkpoints: Object.fromEntries(Object.entries(scenario.checkpoints).map(([checkpointId, checkpoint]) => [
                checkpointId,
                compactCheckpoint(checkpoint)
            ]))
        }]))
    }));
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const data = loadGameData();
    const results = runPracticalBalance(data, args);
    const report = {
        generatedAt: new Date().toISOString(),
        seed: args.seed,
        runsPerSample: args.runs,
        scenarios: Object.entries(SCENARIO_LABELS).map(([id, label]) => ({ id, label })),
        checkpoints: FOCUS_CHECKPOINTS,
        weakFloors: WEAK_FLOORS,
        coreDependencyLimitPp: CORE_DEPENDENCY_LIMIT,
        normalMixedShare: NORMAL_MIXED_SHARE,
        results: compactResults(results)
    };
    fs.writeFileSync(path.resolve(ROOT, args.json), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.resolve(ROOT, args.markdown), markdownReport(report));
    console.log(`Practical balance analysis complete: ${results.length} builds, ${args.runs} runs per sample.`);
    for (const entry of results) {
        const noCore = entry.scenarios.noCoreMatureRelics.checkpoints;
        const mature = entry.scenarios.mature.checkpoints;
        console.log([
            entry.role,
            entry.build,
            `缺核心 ${pct(noCore.late.winRate)}/${pct(noCore.elite.winRate)}/${pct(noCore.boss.winRate)}`,
            `成熟 ${pct(mature.late.winRate)}/${pct(mature.elite.winRate)}/${pct(mature.boss.winRate)}`,
            entry.diagnosis.join(' / ')
        ].join('\t'));
    }
}

run();
