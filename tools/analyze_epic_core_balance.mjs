#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CHECKPOINTS,
    MATURE_LOADOUTS,
    loadGameData,
    simulateCheckpoint
} from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FOCUS_CHECKPOINT_IDS = ['late', 'elite', 'boss'];
const FOCUS_CHECKPOINTS = CHECKPOINTS.filter(checkpoint => FOCUS_CHECKPOINT_IDS.includes(checkpoint.id));
const DEFAULT_OUT_DIR = '/tmp/questers_epic_core_balance';
const SCENARIOS = [
    { id: 'baselineNoCore', label: '无核心纯卡', withCore: false, withMatureRelics: false },
    { id: 'coreOnly', label: '单核心无遗物', withCore: true, withMatureRelics: false },
    { id: 'benchmarkOnly', label: '优质非核心无遗物', withBenchmark: true, withMatureRelics: false },
    { id: 'matureRelicsNoCore', label: '成熟遗物无核心', withCore: false, withMatureRelics: true },
    { id: 'benchmarkWithMatureRelics', label: '优质非核心加成熟遗物', withBenchmark: true, withMatureRelics: true },
    { id: 'coreWithMatureRelics', label: '核心加成熟遗物', withCore: true, withMatureRelics: true }
];

function parseArgs(argv) {
    const result = {
        runs: 120,
        seed: 20260616,
        outDir: DEFAULT_OUT_DIR,
        json: '',
        markdown: '',
        csv: '',
        anomaliesCsv: ''
    };
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        if (arg === '--runs') result.runs = Number(argv[++index]);
        else if (arg === '--seed') result.seed = Number(argv[++index]);
        else if (arg === '--out-dir') result.outDir = argv[++index];
        else if (arg === '--json') result.json = argv[++index];
        else if (arg === '--markdown') result.markdown = argv[++index];
        else if (arg === '--csv') result.csv = argv[++index];
        else if (arg === '--anomalies-csv') result.anomaliesCsv = argv[++index];
    }
    if (!Number.isFinite(result.runs) || result.runs < 20) throw new Error('--runs must be at least 20');
    if (!Number.isFinite(result.seed)) throw new Error('--seed must be a finite number');
    return result;
}

function resolveOutput(filePath, outDir, fallbackName) {
    if (filePath) return path.resolve(ROOT, filePath);
    return path.join(outDir, fallbackName);
}

function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function pp(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}pp`;
}

function fixed(value, digits = 2) {
    return Number.isFinite(value) ? value.toFixed(digits) : '0.00';
}

function cardId(card) {
    return card.poolId || card.specialId || card.id || card.name;
}

function cardBuildTags(data, roleId, card) {
    if (card.buildNeutral) return [];
    const explicit = card.buildTags || data.CARD_BUILD_TAGS_BY_ID[cardId(card)] || [];
    if (explicit.length) return [...new Set(explicit)];
    const inferred = Object.entries(data.BUILD_DIRECTIONS[roleId] || {})
        .filter(([, config]) => (card.tags || []).some(tag => (config.triggerTags || []).includes(tag)))
        .map(([buildId]) => buildId);
    return [...new Set(inferred)];
}

function buildName(data, roleId, buildId) {
    return data.BUILD_DIRECTIONS[roleId]?.[buildId]?.name || buildId;
}

function relicNames(data, relicIds) {
    return relicIds.map(id => data.RELIC_POOL.find(relic => relic.id === id)?.name || id);
}

function scaledCardValue(data, card) {
    return data.getScaledCardValue(card) + (card.directEffects?.draw ? 5 : 0) + (card.directEffects?.energy ? 4 : 0);
}

function benchmarkScore(data, roleId, buildId, card, targetCost) {
    const tags = card.tags || [];
    let score = scaledCardValue(data, card) / Math.max(1, Number(card.cost) || 1);
    if (cardBuildTags(data, roleId, card).includes(buildId)) score += 8;
    if (card.rarity === '稀有') score += 2;
    if (tags.includes('抽牌') || card.directEffects?.draw) score += 4;
    if (tags.includes('充能') || card.directEffects?.energy) score += 3;
    if (tags.includes('重置') || tags.includes('回收') || tags.includes('复刻') || tags.includes('回响')) score += 3;
    if (tags.includes('穿甲') || tags.includes('重击') || tags.includes('追击') || tags.includes('爆发')) score += 2;
    score -= Math.abs((Number(card.cost) || 0) - targetCost) * 4;
    return score;
}

function pickBenchmarkCard(data, roleId, buildId, coreCard) {
    const targetCost = Number(coreCard.cost) || 0;
    const allCards = [...(data.CHARACTER_CARD_POOLS[roleId] || []), ...(data.NEUTRAL_CARD_POOL || [])]
        .filter(card => !card.isSpecial && ['普通', '稀有'].includes(card.rarity))
        .filter(card => Math.abs((Number(card.cost) || 0) - targetCost) <= 1);
    const preferred = allCards.filter(card => {
        const tags = cardBuildTags(data, roleId, card);
        return tags.includes(buildId) || card.buildNeutral || tags.length === 0;
    });
    const candidates = preferred.length ? preferred : allCards;
    return candidates
        .map(card => ({ card, score: benchmarkScore(data, roleId, buildId, card, targetCost) }))
        .sort((left, right) => right.score - left.score)[0]?.card || null;
}

function makeSeed(base, roleIndex, cardIndex, buildIndex, checkpointIndex, scenarioIndex) {
    return base
        + roleIndex * 1000003
        + cardIndex * 100003
        + buildIndex * 10007
        + checkpointIndex * 1009
        + scenarioIndex * 101;
}

function loadSpecialBranchSets() {
    const runtimeSource = fs.readFileSync(path.join(ROOT, 'questers_demo_v0.99.html'), 'utf8');
    const simulatorSource = fs.readFileSync(path.join(ROOT, 'tools/simulate_build_balance.mjs'), 'utf8');
    return {
        runtime: extractSpecialBranches(runtimeSource),
        simulator: extractSpecialBranches(simulatorSource)
    };
}

function extractSpecialBranches(source) {
    const branches = new Set();
    const regex = /\b(?:card\.)?specialId\s*={2,3}\s*['"]([^'"]+)['"]/g;
    for (const match of source.matchAll(regex)) branches.add(match[1]);
    return branches;
}

function scenarioLoadout(buildId, card, benchmark, scenario) {
    const matureRelics = MATURE_LOADOUTS[buildId]?.relics || [];
    return {
        core: scenario.withCore ? card.id : null,
        coreCard: scenario.withBenchmark && benchmark ? benchmark : null,
        relics: scenario.withMatureRelics ? [...matureRelics] : []
    };
}

function compactCheckpoint(result, coreId) {
    const usage = result.cardUsage.find(card => card.id === coreId) || null;
    return {
        winRate: result.winRate,
        averageTurns: result.averageTurns,
        averageHpLeft: result.averageHpLeft,
        averageDamageTaken: result.averageDamageTaken,
        averageDamageDealt: result.averageDamageDealt,
        averageHealing: result.averageHealing,
        energyWastedPerTurn: result.energyWastedPerTurn,
        deathCauses: result.deathCauses,
        victoryCauses: result.victoryCauses,
        coreUsage: usage ? {
            plays: usage.plays,
            opportunities: usage.opportunities,
            playsPerBattle: usage.playsPerBattle,
            usageRate: usage.usageRate
        } : {
            plays: 0,
            opportunities: 0,
            playsPerBattle: 0,
            usageRate: 0
        }
    };
}

function runSample(data, branchSets, roleId, buildId, card, indexes, args) {
    const checkpoints = {};
    const benchmark = pickBenchmarkCard(data, roleId, buildId, card);
    for (let scenarioIndex = 0; scenarioIndex < SCENARIOS.length; scenarioIndex++) {
        const scenario = SCENARIOS[scenarioIndex];
        const scenarioEntry = { label: scenario.label, checkpoints: {} };
        for (let checkpointIndex = 0; checkpointIndex < FOCUS_CHECKPOINTS.length; checkpointIndex++) {
            const checkpoint = FOCUS_CHECKPOINTS[checkpointIndex];
            const result = simulateCheckpoint(
                data,
                roleId,
                buildId,
                checkpoint,
                args.runs,
                makeSeed(args.seed, indexes.roleIndex, indexes.cardIndex, indexes.buildIndex, checkpointIndex, scenarioIndex),
                'pure',
                { loadoutOverride: scenarioLoadout(buildId, card, benchmark, scenario) }
            );
            scenarioEntry.checkpoints[checkpoint.id] = compactCheckpoint(result, scenario.withBenchmark && benchmark ? cardId(benchmark) : card.id);
        }
        checkpoints[scenario.id] = scenarioEntry;
    }
    const matureRelics = MATURE_LOADOUTS[buildId]?.relics || [];
    const sample = {
        roleId,
        role: data.CHARACTERS[roleId]?.name || roleId,
        buildId,
        build: buildName(data, roleId, buildId),
        card: {
            id: card.id,
            name: card.name,
            type: card.type,
            cost: card.cost,
            val: card.val || 0,
            tags: card.tags || [],
            buildTags: cardBuildTags(data, roleId, card),
            desc: card.desc || ''
        },
        loadout: {
            matureCore: MATURE_LOADOUTS[buildId]?.core || null,
            matureRelics,
            matureRelicNames: relicNames(data, matureRelics),
            benchmark: benchmark ? {
                id: cardId(benchmark),
                name: benchmark.name,
                rarity: benchmark.rarity,
                cost: benchmark.cost,
                type: benchmark.type,
                tags: benchmark.tags || []
            } : null
        },
        branchCoverage: {
            runtimeSpecialBranch: branchSets.runtime.has(card.id),
            simulatorSpecialBranch: branchSets.simulator.has(card.id),
            runtimeWithoutSimulator: branchSets.runtime.has(card.id) && !branchSets.simulator.has(card.id),
            simulatorWithoutRuntime: branchSets.simulator.has(card.id) && !branchSets.runtime.has(card.id)
        },
        scenarios: checkpoints
    };
    sample.metrics = sampleMetrics(sample);
    sample.anomalies = diagnoseSample(sample);
    return sample;
}

function sampleMetrics(sample) {
    const metrics = {};
    for (const checkpoint of FOCUS_CHECKPOINTS) {
        const id = checkpoint.id;
        const baseline = sample.scenarios.baselineNoCore.checkpoints[id];
        const coreOnly = sample.scenarios.coreOnly.checkpoints[id];
        const benchmarkOnly = sample.scenarios.benchmarkOnly.checkpoints[id];
        const relicsNoCore = sample.scenarios.matureRelicsNoCore.checkpoints[id];
        const benchmarkFull = sample.scenarios.benchmarkWithMatureRelics.checkpoints[id];
        const full = sample.scenarios.coreWithMatureRelics.checkpoints[id];
        metrics[id] = {
            coreOnlyLiftPp: (coreOnly.winRate - baseline.winRate) * 100,
            benchmarkOnlyLiftPp: (benchmarkOnly.winRate - baseline.winRate) * 100,
            coreVsBenchmarkPp: (coreOnly.winRate - benchmarkOnly.winRate) * 100,
            matureLiftPp: (full.winRate - relicsNoCore.winRate) * 100,
            matureVsBenchmarkPp: (full.winRate - benchmarkFull.winRate) * 100,
            coreOnlyUsageRate: coreOnly.coreUsage.usageRate,
            benchmarkOnlyUsageRate: benchmarkOnly.coreUsage.usageRate,
            fullUsageRate: full.coreUsage.usageRate,
            coreOnlyPlaysPerBattle: coreOnly.coreUsage.playsPerBattle,
            benchmarkOnlyPlaysPerBattle: benchmarkOnly.coreUsage.playsPerBattle,
            fullPlaysPerBattle: full.coreUsage.playsPerBattle
        };
    }
    return metrics;
}

function diagnoseSample(sample) {
    const issues = [];
    if (sample.branchCoverage.runtimeWithoutSimulator) {
        issues.push({ severity: 'high', kind: '分支缺失', detail: '主游戏有特殊分支，但模拟器没有同名分支' });
    }
    if (sample.branchCoverage.simulatorWithoutRuntime) {
        issues.push({ severity: 'high', kind: '分支不一致', detail: '模拟器有特殊分支，但主游戏没有同名分支' });
    }
    if (!sample.card.buildTags.length) {
        issues.push({ severity: 'high', kind: '构筑标签缺失', detail: '史诗核心没有可测试的构筑标签' });
    }
    const lowCoreLift = FOCUS_CHECKPOINTS.every(checkpoint => sample.metrics[checkpoint.id].coreOnlyLiftPp < 3);
    const bossCoreLift = sample.metrics.boss.coreOnlyLiftPp;
    const bossCoreUsage = sample.metrics.boss.coreOnlyUsageRate;
    const bossFullUsage = sample.metrics.boss.fullUsageRate;
    const bossFullLift = sample.metrics.boss.matureLiftPp;
    const baselineBoss = sample.scenarios.baselineNoCore.checkpoints.boss.winRate;
    const coreOnlyBoss = sample.scenarios.coreOnly.checkpoints.boss.winRate;
    const saturatedBaseline = baselineBoss >= 0.88;
    if ((lowCoreLift && (!saturatedBaseline || coreOnlyBoss < baselineBoss - 0.02) && bossFullLift < 4)
        || bossCoreLift < -3
        || (bossCoreLift < 2 && bossCoreUsage < 0.18)) {
        issues.push({
            severity: 'high',
            kind: '弱核心',
            detail: `单核心对照抬升不足，首领抬升 ${pp(bossCoreLift)}，使用率 ${pct(bossCoreUsage)}`
        });
    }
    if ((bossFullLift < 2 && bossFullUsage < 0.25) || bossFullLift < -3) {
        issues.push({
            severity: 'medium',
            kind: '成熟低贡献',
            detail: `成熟遗物下首领抬升 ${pp(bossFullLift)}，使用率 ${pct(bossFullUsage)}`
        });
    }
    if (sample.loadout.benchmark) {
        const bossCoreVsBenchmark = sample.metrics.boss.coreVsBenchmarkPp;
        const matureCoreVsBenchmark = sample.metrics.boss.matureVsBenchmarkPp;
        if (bossCoreVsBenchmark < -4 && matureCoreVsBenchmark < 0) {
            issues.push({
                severity: 'high',
                kind: '不如非核心',
                detail: `首领低于 ${sample.loadout.benchmark.name} ${pp(-bossCoreVsBenchmark)}，成熟对照 ${pp(matureCoreVsBenchmark)}`
            });
        } else if (bossCoreVsBenchmark < -2) {
            issues.push({
                severity: 'medium',
                kind: '非核心压制',
                detail: `首领单核心低于 ${sample.loadout.benchmark.name} ${pp(-bossCoreVsBenchmark)}`
            });
        }
    }
    const fullBoss = sample.scenarios.coreWithMatureRelics.checkpoints.boss;
    const relicBoss = sample.scenarios.matureRelicsNoCore.checkpoints.boss;
    const coreLateLift = sample.metrics.late.coreOnlyLiftPp;
    if ((fullBoss.winRate - relicBoss.winRate) * 100 > 18 || coreLateLift > 22) {
        issues.push({
            severity: 'medium',
            kind: '过强候选',
            detail: `首领成熟抬升 ${pp((fullBoss.winRate - relicBoss.winRate) * 100)}，后期单核心抬升 ${pp(coreLateLift)}`
        });
    }
    for (const checkpoint of FOCUS_CHECKPOINTS) {
        const full = sample.scenarios.coreWithMatureRelics.checkpoints[checkpoint.id];
        if (full.coreUsage.opportunities >= Math.max(20, Math.floor(full.coreUsage.plays * 1.2))
            && full.coreUsage.usageRate < 0.18
            && full.coreUsage.playsPerBattle < 0.25) {
            issues.push({
                severity: 'medium',
                kind: '低使用率',
                detail: `${checkpoint.label}核心使用率 ${pct(full.coreUsage.usageRate)}，每战 ${fixed(full.coreUsage.playsPerBattle)} 次`
            });
        }
        if (full.averageTurns > 12) {
            issues.push({
                severity: 'medium',
                kind: '战斗过长',
                detail: `${checkpoint.label}平均 ${fixed(full.averageTurns, 1)} 回合`
            });
        }
    }
    return issues.length ? issues : [{ severity: 'ok', kind: '通过', detail: '未触发史诗核心审计阈值' }];
}

function allCoreSamples(data, branchSets, args) {
    const results = [];
    let roleIndex = 0;
    for (const [roleId, cards] of Object.entries(data.SPECIAL_EPIC_POOLS)) {
        for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
            const card = cards[cardIndex];
            const buildTags = cardBuildTags(data, roleId, card);
            const builds = buildTags.length
                ? buildTags.filter(buildId => data.BUILD_DIRECTIONS[roleId]?.[buildId])
                : Object.keys(data.BUILD_DIRECTIONS[roleId] || {});
            if (!builds.length) {
                results.push({
                    roleId,
                    role: data.CHARACTERS[roleId]?.name || roleId,
                    buildId: '',
                    build: '',
                    card: {
                        id: card.id,
                        name: card.name,
                        type: card.type,
                        cost: card.cost,
                        val: card.val || 0,
                        tags: card.tags || [],
                        buildTags,
                        desc: card.desc || ''
                    },
                    loadout: { matureCore: null, matureRelics: [], matureRelicNames: [] },
                    branchCoverage: {
                        runtimeSpecialBranch: branchSets.runtime.has(card.id),
                        simulatorSpecialBranch: branchSets.simulator.has(card.id),
                        runtimeWithoutSimulator: branchSets.runtime.has(card.id) && !branchSets.simulator.has(card.id),
                        simulatorWithoutRuntime: branchSets.simulator.has(card.id) && !branchSets.runtime.has(card.id)
                    },
                    scenarios: {},
                    metrics: {},
                    anomalies: [{ severity: 'high', kind: '构筑覆盖缺失', detail: '无法映射到任何职业构筑' }]
                });
                continue;
            }
            for (let buildIndex = 0; buildIndex < builds.length; buildIndex++) {
                results.push(runSample(data, branchSets, roleId, builds[buildIndex], card, {
                    roleIndex,
                    cardIndex,
                    buildIndex
                }, args));
            }
        }
        roleIndex++;
    }
    return results;
}

function severityWeight(severity) {
    return { high: 0, medium: 1, ok: 3 }[severity] ?? 2;
}

function anomalyRows(results) {
    return results.flatMap(sample => sample.anomalies
        .filter(anomaly => anomaly.severity !== 'ok')
        .map(anomaly => ({
            severity: anomaly.severity,
            kind: anomaly.kind,
            role: sample.role,
            build: sample.build,
            cardId: sample.card.id,
            cardName: sample.card.name,
            detail: anomaly.detail
        }))).sort((left, right) => severityWeight(left.severity) - severityWeight(right.severity)
            || left.role.localeCompare(right.role, 'zh-CN')
            || left.build.localeCompare(right.build, 'zh-CN')
            || left.cardName.localeCompare(right.cardName, 'zh-CN'));
}

function flatRows(results) {
    return results.map(sample => ({
        role: sample.role,
        build: sample.build,
        cardId: sample.card.id,
        cardName: sample.card.name,
        cost: sample.card.cost,
        type: sample.card.type,
        tags: sample.card.tags.join('/'),
        runtimeBranch: sample.branchCoverage.runtimeSpecialBranch ? 'yes' : 'no',
        simulatorBranch: sample.branchCoverage.simulatorSpecialBranch ? 'yes' : 'no',
        lateCoreLiftPp: sample.metrics.late?.coreOnlyLiftPp ?? 0,
        eliteCoreLiftPp: sample.metrics.elite?.coreOnlyLiftPp ?? 0,
        bossCoreLiftPp: sample.metrics.boss?.coreOnlyLiftPp ?? 0,
        lateMatureLiftPp: sample.metrics.late?.matureLiftPp ?? 0,
        eliteMatureLiftPp: sample.metrics.elite?.matureLiftPp ?? 0,
        bossMatureLiftPp: sample.metrics.boss?.matureLiftPp ?? 0,
        bossCoreVsBenchmarkPp: sample.metrics.boss?.coreVsBenchmarkPp ?? 0,
        bossMatureVsBenchmarkPp: sample.metrics.boss?.matureVsBenchmarkPp ?? 0,
        benchmarkId: sample.loadout.benchmark?.id || '',
        benchmarkName: sample.loadout.benchmark?.name || '',
        bossCoreUsage: sample.metrics.boss?.coreOnlyUsageRate ?? 0,
        bossFullUsage: sample.metrics.boss?.fullUsageRate ?? 0,
        anomalies: sample.anomalies.map(anomaly => `${anomaly.severity}:${anomaly.kind}`).join(';')
    }));
}

function csvEscape(value) {
    const text = String(value ?? '');
    if (!/[",\n]/.test(text)) return text;
    return `"${text.replace(/"/g, '""')}"`;
}

function writeCsv(filePath, rows) {
    if (!rows.length) {
        fs.writeFileSync(filePath, '\n');
        return;
    }
    const headers = Object.keys(rows[0]);
    const lines = [
        headers.map(csvEscape).join(','),
        ...rows.map(row => headers.map(header => csvEscape(row[header])).join(','))
    ];
    fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function checkpointRates(sample, scenarioId) {
    return FOCUS_CHECKPOINT_IDS.map(id => pct(sample.scenarios[scenarioId]?.checkpoints?.[id]?.winRate || 0)).join(' / ');
}

function checkpointLifts(sample, key) {
    return FOCUS_CHECKPOINT_IDS.map(id => pp(sample.metrics[id]?.[key] || 0)).join(' / ');
}

function markdownReport(report) {
    const anomalies = anomalyRows(report.results);
    const lines = [
        '# 史诗核心逐张平衡审计',
        '',
        `测试日期：${report.generatedAt.slice(0, 10)}`,
        '',
        `样本量：每张史诗核心、每个构筑、每个节点、每个场景 ${report.runsPerSample} 局；随机种子：\`${report.seed}\`。`,
        '',
        '场景：无核心纯卡、单核心无遗物、优质非核心替换、成熟遗物无核心、优质非核心加成熟遗物、核心加成熟遗物。节点：后期普通 / 后期精英 / 最终首领。',
        '',
        '## 异常概览',
        '',
        anomalies.length
            ? '| 严重度 | 类型 | 职业 | 构筑 | 卡牌 | 说明 |\n|---|---|---|---|---|---|\n'
                + anomalies.slice(0, 80).map(row => `| ${row.severity} | ${row.kind} | ${row.role} | ${row.build} | ${row.cardName} | ${row.detail} |`).join('\n')
            : '没有触发 high/medium 异常。',
        '',
        '## 核心对照表',
        '',
        '| 职业 | 构筑 | 史诗核心 | 非核心对照 | 无核心 后期/精英/首领 | 单核心 后期/精英/首领 | 非核心 后期/精英/首领 | 成熟完整 后期/精英/首领 | 单核心抬升 | 核心对非核心 首领/成熟 | 首领使用率 单核/成熟 | 诊断 |',
        '|---|---|---|---|---|---|---|---|---|---|---|---|',
        ...report.results.map(sample => {
            const bossCoreUsage = sample.metrics.boss?.coreOnlyUsageRate || 0;
            const bossFullUsage = sample.metrics.boss?.fullUsageRate || 0;
            const diagnosis = sample.anomalies.map(anomaly => `${anomaly.severity}:${anomaly.kind}`).join('；');
            const benchmark = sample.loadout.benchmark?.name || '-';
            return `| ${sample.role} | ${sample.build} | ${sample.card.name} | ${benchmark} | ${checkpointRates(sample, 'baselineNoCore')} | ${checkpointRates(sample, 'coreOnly')} | ${checkpointRates(sample, 'benchmarkOnly')} | ${checkpointRates(sample, 'coreWithMatureRelics')} | ${checkpointLifts(sample, 'coreOnlyLiftPp')} | ${pp(sample.metrics.boss?.coreVsBenchmarkPp || 0)} / ${pp(sample.metrics.boss?.matureVsBenchmarkPp || 0)} | ${pct(bossCoreUsage)} / ${pct(bossFullUsage)} | ${diagnosis} |`;
        }),
        '',
        '## 分支覆盖',
        '',
        '| 职业 | 构筑 | 史诗核心 | 主游戏特殊分支 | 模拟器特殊分支 |',
        '|---|---|---|---|---|',
        ...report.results
            .filter(sample => sample.branchCoverage.runtimeSpecialBranch || sample.branchCoverage.simulatorSpecialBranch)
            .map(sample => `| ${sample.role} | ${sample.build} | ${sample.card.name} | ${sample.branchCoverage.runtimeSpecialBranch ? '有' : '无'} | ${sample.branchCoverage.simulatorSpecialBranch ? '有' : '无'} |`)
    ];
    return `${lines.join('\n')}\n`;
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const outDir = path.resolve(ROOT, args.outDir);
    const jsonPath = resolveOutput(args.json, outDir, 'epic_core_balance_report.json');
    const markdownPath = resolveOutput(args.markdown, outDir, 'epic_core_balance_report.md');
    const csvPath = resolveOutput(args.csv, outDir, 'epic_core_balance.csv');
    const anomaliesPath = resolveOutput(args.anomaliesCsv, outDir, 'epic_core_anomalies.csv');
    const data = loadGameData();
    const branchSets = loadSpecialBranchSets();
    const results = allCoreSamples(data, branchSets, args);
    const report = {
        generatedAt: new Date().toISOString(),
        seed: args.seed,
        runsPerSample: args.runs,
        checkpoints: FOCUS_CHECKPOINTS.map(checkpoint => ({ id: checkpoint.id, label: checkpoint.label })),
        scenarios: SCENARIOS.map(({ id, label }) => ({ id, label })),
        totalCoreCards: Object.values(data.SPECIAL_EPIC_POOLS).reduce((sum, cards) => sum + cards.length, 0),
        testedSamples: results.length,
        results
    };
    for (const filePath of [jsonPath, markdownPath, csvPath, anomaliesPath]) ensureDir(filePath);
    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(markdownPath, markdownReport(report));
    writeCsv(csvPath, flatRows(results));
    writeCsv(anomaliesPath, anomalyRows(results));

    const anomalies = anomalyRows(results);
    const high = anomalies.filter(row => row.severity === 'high');
    const medium = anomalies.filter(row => row.severity === 'medium');
    console.log(`Epic core balance audit: ${report.totalCoreCards} cards, ${report.testedSamples} card/build samples, ${args.runs} runs per scenario checkpoint.`);
    console.log(`Reports: ${jsonPath}`);
    console.log(`Anomalies: high ${high.length}, medium ${medium.length}`);
    for (const row of high.slice(0, 12)) {
        console.log(`HIGH\t${row.role}\t${row.build}\t${row.cardName}\t${row.kind}\t${row.detail}`);
    }
    for (const row of medium.slice(0, 8)) {
        console.log(`MED\t${row.role}\t${row.build}\t${row.cardName}\t${row.kind}\t${row.detail}`);
    }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) run();
