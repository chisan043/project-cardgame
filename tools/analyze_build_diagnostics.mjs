#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CHECKPOINTS,
    MATURE_LOADOUTS,
    getLoadout,
    loadGameData,
    simulateCheckpoint
} from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODES = ['pure', 'mid', 'mature'];
const ABLATION_CHECKPOINTS = CHECKPOINTS.filter(checkpoint => ['late', 'elite', 'boss'].includes(checkpoint.id));
const TARGETS = {
    late: { min: 0.78, max: 0.90 },
    elite: { min: 0.30, max: 0.45 },
    boss: { min: 0.05, max: 0.12 }
};
const MODE_LABELS = { pure: '纯卡构筑', mid: '中期构筑', mature: '完整成熟构筑' };

function parseArgs(argv) {
    const result = {
        runs: 1000,
        seed: 20260612,
        json: 'tools/build_diagnostics_report.json',
        markdown: '构筑四阶段诊断报告.md'
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

function makeSeed(base, roleIndex, buildIndex, checkpointIndex, modeIndex, componentIndex = 0) {
    return base + roleIndex * 1000003 + buildIndex * 100003 + checkpointIndex * 10007 + modeIndex * 1009 + componentIndex * 101;
}

function loadoutSummary(data, roleId, buildId, mode) {
    const loadout = getLoadout(data, roleId, buildId, mode);
    return {
        core: loadout.coreCard ? { id: loadout.coreCard.id, name: loadout.coreCard.name } : null,
        relics: loadout.relics.map(id => ({ id, name: data.RELIC_POOL.find(relic => relic.id === id)?.name || id }))
    };
}

function runModes(data, args) {
    const results = [];
    let roleIndex = 0;
    for (const [roleId, builds] of Object.entries(data.BUILD_DIRECTIONS)) {
        let buildIndex = 0;
        for (const [buildId, build] of Object.entries(builds)) {
            const entry = { roleId, role: data.CHARACTERS[roleId].name, buildId, build: build.name, modes: {} };
            for (let modeIndex = 0; modeIndex < MODES.length; modeIndex++) {
                const mode = MODES[modeIndex];
                const modeEntry = { loadout: loadoutSummary(data, roleId, buildId, mode), checkpoints: {} };
                for (let checkpointIndex = 0; checkpointIndex < CHECKPOINTS.length; checkpointIndex++) {
                    const checkpoint = CHECKPOINTS[checkpointIndex];
                    modeEntry.checkpoints[checkpoint.id] = simulateCheckpoint(
                        data, roleId, buildId, checkpoint, args.runs,
                        makeSeed(args.seed, roleIndex, buildIndex, checkpointIndex, modeIndex), mode
                    );
                }
                entry.modes[mode] = modeEntry;
            }
            results.push(entry);
            buildIndex++;
        }
        roleIndex++;
    }
    return results;
}

function runAblations(data, args, modeResults) {
    let roleIndex = 0;
    for (const [roleId, builds] of Object.entries(data.BUILD_DIRECTIONS)) {
        let buildIndex = 0;
        for (const buildId of Object.keys(builds)) {
            const entry = modeResults.find(result => result.roleId === roleId && result.buildId === buildId);
            const mature = MATURE_LOADOUTS[buildId];
            const components = [
                { type: 'core', id: mature.core, label: data.SPECIAL_EPIC_POOLS[roleId].find(card => card.id === mature.core)?.name || mature.core },
                ...mature.relics.map(id => ({ type: 'relic', id, label: data.RELIC_POOL.find(relic => relic.id === id)?.name || id }))
            ];
            entry.ablations = [];
            for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
                const component = components[componentIndex];
                const override = {
                    core: component.type === 'core' ? null : mature.core,
                    relics: component.type === 'relic' ? mature.relics.filter(id => id !== component.id) : [...mature.relics]
                };
                const checkpoints = {};
                for (let checkpointIndex = 0; checkpointIndex < ABLATION_CHECKPOINTS.length; checkpointIndex++) {
                    const checkpoint = ABLATION_CHECKPOINTS[checkpointIndex];
                    checkpoints[checkpoint.id] = simulateCheckpoint(
                        data, roleId, buildId, checkpoint, args.runs,
                        makeSeed(args.seed, roleIndex, buildIndex, CHECKPOINTS.findIndex(item => item.id === checkpoint.id), 2),
                        'mature', { loadoutOverride: override }
                    );
                }
                entry.ablations.push({ ...component, checkpoints });
            }
            buildIndex++;
        }
        roleIndex++;
    }
}

function styleVector(checkpoint) {
    const style = checkpoint.playStyle || {};
    const keys = ['attacks', 'defenses', 'abilities', 'setup', 'burst', 'sustain', 'control', 'cycle'];
    const total = keys.reduce((sum, key) => sum + (style[key] || 0), 0) || 1;
    return Object.fromEntries(keys.map(key => [key, (style[key] || 0) / total]));
}

function cosine(left, right) {
    const keys = Object.keys(left);
    const dot = keys.reduce((sum, key) => sum + left[key] * right[key], 0);
    const leftSize = Math.sqrt(keys.reduce((sum, key) => sum + left[key] ** 2, 0));
    const rightSize = Math.sqrt(keys.reduce((sum, key) => sum + right[key] ** 2, 0));
    return dot / Math.max(0.0001, leftSize * rightSize);
}

function buildStyleAnalysis(results) {
    const byRole = [];
    for (const roleId of [...new Set(results.map(result => result.roleId))]) {
        const builds = results.filter(result => result.roleId === roleId).map(result => ({
            buildId: result.buildId,
            build: result.build,
            vector: styleVector(result.modes.mature.checkpoints.late)
        }));
        const pairs = [];
        for (let left = 0; left < builds.length; left++) {
            for (let right = left + 1; right < builds.length; right++) {
                pairs.push({
                    left: builds[left].build,
                    right: builds[right].build,
                    similarity: cosine(builds[left].vector, builds[right].vector)
                });
            }
        }
        byRole.push({ roleId, role: results.find(result => result.roleId === roleId).role, builds, pairs });
    }
    return byRole;
}

function analyzeDescriptions(data) {
    const cards = [
        ...Object.values(data.CHARACTER_CARD_POOLS).flat(),
        ...data.NEUTRAL_CARD_POOL,
        ...Object.values(data.SPECIAL_EPIC_POOLS).flat()
    ];
    const unique = [...new Map(cards.map(card => [`${card.roleId || 'neutral'}:${card.id}`, card])).values()];
    const entries = unique.filter(card => card.desc).map(card => {
        const text = card.desc.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        return { id: card.id, name: card.name, length: [...text].length, text };
    }).sort((left, right) => right.length - left.length);
    return {
        totalCards: unique.length,
        explicitDescriptions: entries.length,
        averageLength: entries.reduce((sum, entry) => sum + entry.length, 0) / Math.max(1, entries.length),
        maxLength: entries[0]?.length || 0,
        overLimit: entries.filter(entry => entry.length > 72),
        longest: entries.slice(0, 10)
    };
}

function targetStatus(value, target) {
    if (value < target.min) return '偏低';
    if (value > target.max) return '偏高';
    return '达标';
}

function dominantCounter(counter = {}) {
    const entries = Object.entries(counter).sort((left, right) => right[1] - left[1]);
    if (!entries.length) return '-';
    return `${entries[0][0]} ${entries[0][1]}`;
}

function diagnoseBuild(entry) {
    const boss = entry.modes.mature.checkpoints.boss;
    const elite = entry.modes.mature.checkpoints.elite;
    const issues = [];
    if (boss.winRate < TARGETS.boss.min && boss.averageDamageDealt < 220) issues.push('首领输出不足');
    if (elite.winRate < TARGETS.elite.min && elite.averageDamageTaken > 75) issues.push('精英生存不足');
    if (boss.energyWastedPerTurn > 0.35) issues.push('能量利用偏低');
    if (boss.averageTurns <= 4.5 && boss.winRate < TARGETS.boss.min) issues.push('启动前即被压垮');
    const lowUsage = boss.cardUsage.filter(card => card.opportunities >= 50 && card.usageRate < 0.2 && !card.name.includes('诅咒')).slice(0, 3);
    if (lowUsage.length) issues.push(`低使用率卡：${lowUsage.map(card => card.name).join('、')}`);
    return issues.length ? issues : ['指标结构正常'];
}

function enrichReport(results) {
    for (const entry of results) {
        entry.targets = Object.fromEntries(Object.entries(TARGETS).map(([id, target]) => [id, {
            ...target,
            value: entry.modes.mature.checkpoints[id].winRate,
            status: targetStatus(entry.modes.mature.checkpoints[id].winRate, target)
        }]));
        entry.diagnosis = diagnoseBuild(entry);
        for (const ablation of entry.ablations) {
            ablation.impacts = Object.fromEntries(ABLATION_CHECKPOINTS.map(checkpoint => [checkpoint.id, {
                winRatePp: (entry.modes.mature.checkpoints[checkpoint.id].winRate - ablation.checkpoints[checkpoint.id].winRate) * 100,
                turns: ablation.checkpoints[checkpoint.id].averageTurns - entry.modes.mature.checkpoints[checkpoint.id].averageTurns,
                damageTaken: ablation.checkpoints[checkpoint.id].averageDamageTaken - entry.modes.mature.checkpoints[checkpoint.id].averageDamageTaken
            }]));
        }
    }
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function signed(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;
}

function markdownReport(report) {
    const lines = [
        '# 构筑四阶段诊断报告',
        '',
        `测试日期：${report.generatedAt.slice(0, 10)}`,
        '',
        `每个构筑、节点与拆件样本量：${report.runsPerSample} 局；随机种子：\`${report.seed}\`。`,
        '',
        '成熟构筑目标：后期普通战 78%–90%，精英 30%–45%，首领 5%–12%。',
        '',
        '## 四阶段胜率',
        '',
        '| 职业 | 构筑 | 纯卡后期/精英/首领 | 中期后期/精英/首领 | 成熟后期/精英/首领 | 目标状态 |',
        '|---|---|---|---|---|---|',
        ...report.results.map(entry => {
            const rates = mode => ['late', 'elite', 'boss'].map(id => pct(entry.modes[mode].checkpoints[id].winRate)).join(' / ');
            return `| ${entry.role} | ${entry.build} | ${rates('pure')} | ${rates('mid')} | ${rates('mature')} | ${Object.values(entry.targets).map(target => target.status).join(' / ')} |`;
        }),
        '',
        '## 成熟构筑诊断',
        '',
        '| 构筑 | 首领回合 | 承伤 | 剩余生命 | 浪费能量/回合 | 主要死亡原因 | 主要击杀来源 | 诊断 |',
        '|---|---:|---:|---:|---:|---|---|---|',
        ...report.results.map(entry => {
            const boss = entry.modes.mature.checkpoints.boss;
            return `| ${entry.build} | ${boss.averageTurns.toFixed(2)} | ${boss.averageDamageTaken.toFixed(1)} | ${boss.averageHpLeft.toFixed(1)} | ${boss.energyWastedPerTurn.toFixed(2)} | ${dominantCounter(boss.deathCauses)} | ${dominantCounter(boss.victoryCauses)} | ${entry.diagnosis.join('；')} |`;
        }),
        '',
        '## 拆件测试',
        '',
        '数值为移除组件后成熟构筑损失的胜率百分点；负数表示该组件在当前自动策略下可能产生副作用。',
        '',
        '| 构筑 | 移除组件 | 后期 | 精英 | 首领 |',
        '|---|---|---:|---:|---:|',
        ...report.results.flatMap(entry => entry.ablations.map(ablation => `| ${entry.build} | ${ablation.label} | ${signed(ablation.impacts.late.winRatePp)}pp | ${signed(ablation.impacts.elite.winRatePp)}pp | ${signed(ablation.impacts.boss.winRatePp)}pp |`)),
        '',
        '## 流派差异',
        '',
        '相似度越接近 1，表示攻击/防御/能力牌比例以及启动、爆发、续航、控制、循环操作越接近。0.92 以上列为高相似风险。',
        '',
        '| 职业 | 流派组合 | 操作相似度 | 判断 |',
        '|---|---|---:|---|',
        ...report.styleAnalysis.flatMap(role => role.pairs.map(pair => `| ${role.role} | ${pair.left} / ${pair.right} | ${pair.similarity.toFixed(3)} | ${pair.similarity >= 0.92 ? '高相似' : pair.similarity >= 0.85 ? '需观察' : '差异明确'} |`)),
        '',
        '## 卡牌使用率',
        '',
        '每个构筑列出首领战中机会数不少于样本量 30% 且使用率最低的三张非诅咒卡，便于识别读起来很强、实际经常卡手的设计。',
        '',
        '| 构筑 | 低使用率卡牌 |',
        '|---|---|',
        ...report.results.map(entry => {
            const cards = entry.modes.mature.checkpoints.boss.cardUsage
                .filter(card => card.opportunities >= report.runsPerSample * 0.3 && !card.name.includes('诅咒'))
                .sort((left, right) => left.usageRate - right.usageRate)
                .slice(0, 3)
                .map(card => `${card.name} ${pct(card.usageRate)}`)
                .join('、') || '-';
            return `| ${entry.build} | ${cards} |`;
        }),
        '',
        '## 卡面文字密度',
        '',
        `共 ${report.descriptionAnalysis.totalCards} 张卡；${report.descriptionAnalysis.explicitDescriptions} 张保留显式描述。平均 ${report.descriptionAnalysis.averageLength.toFixed(1)} 字，最长 ${report.descriptionAnalysis.maxLength} 字，超过 72 字 ${report.descriptionAnalysis.overLimit.length} 张。`,
        '',
        '| 最长描述卡牌 | 字数 |',
        '|---|---:|',
        ...report.descriptionAnalysis.longest.map(card => `| ${card.name} | ${card.length} |`),
        '',
        '完整数据：`tools/build_diagnostics_report.json`'
    ];
    return `${lines.join('\n')}\n`;
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const data = loadGameData();
    const results = runModes(data, args);
    runAblations(data, args, results);
    enrichReport(results);
    const report = {
        generatedAt: new Date().toISOString(),
        seed: args.seed,
        runsPerSample: args.runs,
        modes: MODES.map(id => ({ id, label: MODE_LABELS[id] })),
        targets: TARGETS,
        results,
        styleAnalysis: buildStyleAnalysis(results),
        descriptionAnalysis: analyzeDescriptions(data)
    };
    fs.writeFileSync(path.resolve(ROOT, args.json), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.resolve(ROOT, args.markdown), markdownReport(report));
    console.log(`Build diagnostics complete: ${results.length} builds, ${args.runs} runs per sample.`);
    for (const entry of results) {
        console.log(`${entry.build}\t${pct(entry.modes.mature.checkpoints.late.winRate)}\t${pct(entry.modes.mature.checkpoints.elite.winRate)}\t${pct(entry.modes.mature.checkpoints.boss.winRate)}\t${entry.diagnosis.join(' / ')}`);
    }
}

run();
