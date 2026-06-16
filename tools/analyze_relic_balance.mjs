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
const DEFAULT_OUT_DIR = '/tmp/questers_relic_balance';
const FOCUS_CHECKPOINT_IDS = ['late', 'elite', 'boss'];
const FOCUS_CHECKPOINTS = CHECKPOINTS.filter(checkpoint => FOCUS_CHECKPOINT_IDS.includes(checkpoint.id));
const CHECKPOINT_WEIGHTS = { late: 0.2, elite: 0.35, boss: 0.45 };
const NON_COMBAT_RELIC_RE = /金币|奖励|商栈|商店|补货|价格|售|放弃奖励|战后|路线|事件|营火|升级|移除|卡牌奖励|构筑方向|权重/;

function parseArgs(argv) {
    const result = {
        runs: 100,
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

function normalizeTags(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function roleBuildEntries(data) {
    return Object.entries(data.BUILD_DIRECTIONS).flatMap(([roleId, builds]) => Object.entries(builds).map(([buildId, build]) => ({
        roleId,
        role: data.CHARACTERS[roleId]?.name || roleId,
        buildId,
        build: build.name || buildId
    })));
}

function isObtainableByRole(data, roleId, relicId) {
    return data.COMMON_RELIC_IDS.has(relicId)
        || data.ROLE_RELIC_IDS[roleId]?.has(relicId)
        || data.STARTING_RELIC_BY_ROLE[roleId] === relicId;
}

function isStartingRelic(data, relicId) {
    return data.STARTING_RELIC_IDS.has(relicId);
}

function relicBuildTags(data, relicId) {
    return normalizeTags(data.RELIC_BUILD_TAGS_BY_ID[relicId]);
}

function isMatureRelic(buildId, relicId) {
    return (MATURE_LOADOUTS[buildId]?.relics || []).includes(relicId);
}

function isNonCombatRelic(relic) {
    return NON_COMBAT_RELIC_RE.test(`${relic.name || ''}${relic.desc || ''}`);
}

function contextsForRelic(data, relic) {
    const tags = new Set(relicBuildTags(data, relic.id));
    const allEntries = roleBuildEntries(data).filter(entry => isObtainableByRole(data, entry.roleId, relic.id));
    if (!allEntries.length) return [];
    if (!tags.size) return allEntries;
    const tagged = allEntries.filter(entry => tags.has(entry.buildId));
    return tagged.length ? tagged : allEntries;
}

function makeSeed(base, roleIndex, relicIndex, buildIndex, checkpointIndex, scenarioIndex) {
    return base
        + roleIndex * 1000003
        + relicIndex * 100003
        + buildIndex * 10007
        + checkpointIndex * 1009
        + scenarioIndex * 101;
}

function scenarioLoadouts(buildId, relicId) {
    const mature = MATURE_LOADOUTS[buildId];
    const matureRelics = mature?.relics || [];
    return [
        {
            id: 'baselineNoRelic',
            label: '无核心无遗物',
            loadout: { core: null, relics: [] }
        },
        {
            id: 'singleRelicNoCore',
            label: '单遗物无核心',
            loadout: { core: null, relics: [relicId] }
        },
        {
            id: 'matureWithoutRelic',
            label: isMatureRelic(buildId, relicId) ? '成熟移除该遗物' : '完整成熟',
            loadout: { core: mature.core, relics: matureRelics.filter(id => id !== relicId) }
        },
        {
            id: 'matureWithRelic',
            label: isMatureRelic(buildId, relicId) ? '完整成熟' : '成熟加入该遗物',
            loadout: { core: mature.core, relics: [...new Set([...matureRelics, relicId])] }
        }
    ];
}

function compactCheckpoint(result) {
    return {
        winRate: result.winRate,
        averageTurns: result.averageTurns,
        averageHpLeft: result.averageHpLeft,
        averageDamageTaken: result.averageDamageTaken,
        averageDamageDealt: result.averageDamageDealt,
        averageHealing: result.averageHealing,
        energyWastedPerTurn: result.energyWastedPerTurn,
        deathCauses: result.deathCauses,
        victoryCauses: result.victoryCauses
    };
}

function weightedAverage(valuesByCheckpoint) {
    return Object.entries(CHECKPOINT_WEIGHTS).reduce((sum, [id, weight]) => sum + (valuesByCheckpoint[id] || 0) * weight, 0);
}

function checkpointDiffs(left, right) {
    return Object.fromEntries(FOCUS_CHECKPOINTS.map(checkpoint => {
        const leftWin = left.checkpoints[checkpoint.id]?.winRate || 0;
        const rightWin = right.checkpoints[checkpoint.id]?.winRate || 0;
        return [checkpoint.id, (leftWin - rightWin) * 100];
    }));
}

function addAnomaly(sample, severity, kind, detail, metric, value, threshold) {
    sample.anomalies.push({
        severity,
        kind,
        role: sample.role,
        build: sample.build,
        relic: sample.relic.name,
        detail,
        metric,
        value,
        threshold
    });
}

function analyzeSample(sample) {
    const baseline = sample.scenarios.baselineNoRelic;
    const single = sample.scenarios.singleRelicNoCore;
    const matureWithout = sample.scenarios.matureWithoutRelic;
    const matureWith = sample.scenarios.matureWithRelic;
    const singleLift = checkpointDiffs(single, baseline);
    const matureLift = checkpointDiffs(matureWith, matureWithout);
    sample.metrics = {
        singleLift,
        matureLift,
        weightedSingleLiftPp: weightedAverage(singleLift),
        weightedMatureLiftPp: weightedAverage(matureLift),
        matureRelic: sample.matureRelic
    };

    if (sample.nonCombat) {
        addAnomaly(sample, 'info', '非战斗遗物', '该遗物主要影响经济、奖励或路线，专项战斗审计不判定强弱。', 'coverage', 'full-run-needed', 'checkpoint-battle');
        return;
    }

    const taggedOrMature = sample.buildTagged || sample.matureRelic || sample.startingRelic;
    const singleBoss = singleLift.boss || 0;
    const matureBoss = matureLift.boss || 0;
    const singleWeighted = sample.metrics.weightedSingleLiftPp;
    const matureWeighted = sample.metrics.weightedMatureLiftPp;

    if ((taggedOrMature && singleWeighted <= -8 && matureWeighted <= -3)
        || matureWeighted <= -8
        || (singleBoss <= -16 && matureBoss <= 0)) {
        addAnomaly(sample, taggedOrMature ? 'high' : 'medium', '负贡献遗物', `单遗物 ${pp(singleWeighted)}，成熟贡献 ${pp(matureWeighted)}，可能干扰构筑节奏。`, 'weightedLiftPp', fixed(Math.min(singleWeighted, matureWeighted)), taggedOrMature ? '-8.00' : '-10.00');
    } else if ((taggedOrMature && (singleWeighted >= 18 || matureWeighted >= 16 || singleBoss >= 24 || matureBoss >= 20))
        || singleWeighted >= 22
        || matureWeighted >= 20) {
        addAnomaly(sample, 'high', '过强遗物', `单遗物 ${pp(singleWeighted)}，成熟贡献 ${pp(matureWeighted)}，可能压过卡牌选择。`, 'weightedLiftPp', fixed(Math.max(singleWeighted, matureWeighted)), taggedOrMature ? '16.00' : '20.00');
    } else if (sample.matureRelic && (matureWeighted >= 12 || matureBoss >= 16)) {
        addAnomaly(sample, 'medium', '成熟依赖过高', `移除后损失 ${pp(matureWeighted)}，该流派可能过度依赖此遗物。`, 'matureLiftPp', fixed(matureWeighted), '12.00');
    } else if (taggedOrMature && singleWeighted < 2 && matureWeighted < 2 && singleBoss < 4 && matureBoss < 4) {
        addAnomaly(sample, sample.matureRelic ? 'high' : 'medium', '弱遗物', `单遗物 ${pp(singleWeighted)}，成熟贡献 ${pp(matureWeighted)}，与流派标签不匹配。`, 'weightedLiftPp', fixed(Math.max(singleWeighted, matureWeighted)), '2.00');
    } else if (singleWeighted <= -6 || matureWeighted <= -6 || singleBoss <= -12 || matureBoss <= -12) {
        addAnomaly(sample, 'medium', '误拿风险', `单遗物 ${pp(singleWeighted)}，成熟贡献 ${pp(matureWeighted)}，在该构筑中可能拖累节奏。`, 'weightedLiftPp', fixed(Math.min(singleWeighted, matureWeighted)), '-6.00');
    } else if (singleWeighted >= 10 || matureWeighted >= 10 || singleBoss >= 14 || matureBoss >= 14) {
        addAnomaly(sample, 'medium', '偏强候选', `单遗物 ${pp(singleWeighted)}，成熟贡献 ${pp(matureWeighted)}，建议多 seed 复核。`, 'weightedLiftPp', fixed(Math.max(singleWeighted, matureWeighted)), '10.00');
    }
}

function runSample(data, relic, context, indexes, args) {
    const tags = relicBuildTags(data, relic.id);
    const scenarios = {};
    const scenarioDefs = scenarioLoadouts(context.buildId, relic.id);
    for (let scenarioIndex = 0; scenarioIndex < scenarioDefs.length; scenarioIndex++) {
        const scenario = scenarioDefs[scenarioIndex];
        const scenarioEntry = { label: scenario.label, checkpoints: {} };
        for (let checkpointIndex = 0; checkpointIndex < FOCUS_CHECKPOINTS.length; checkpointIndex++) {
            const checkpoint = FOCUS_CHECKPOINTS[checkpointIndex];
            const result = simulateCheckpoint(
                data,
                context.roleId,
                context.buildId,
                checkpoint,
                args.runs,
                makeSeed(args.seed, indexes.roleIndex, indexes.relicIndex, indexes.buildIndex, checkpointIndex, scenarioIndex),
                'mature',
                { loadoutOverride: scenario.loadout }
            );
            scenarioEntry.checkpoints[checkpoint.id] = compactCheckpoint(result);
        }
        scenarios[scenario.id] = scenarioEntry;
    }
    const sample = {
        roleId: context.roleId,
        role: context.role,
        buildId: context.buildId,
        build: context.build,
        relic: {
            id: relic.id,
            name: relic.name,
            price: relic.price || 0,
            tags,
            desc: relic.desc || ''
        },
        buildTagged: tags.includes(context.buildId),
        matureRelic: isMatureRelic(context.buildId, relic.id),
        startingRelic: isStartingRelic(data, relic.id),
        nonCombat: isNonCombatRelic(relic),
        scenarios,
        metrics: {},
        anomalies: []
    };
    analyzeSample(sample);
    return sample;
}

function flattenSamples(samples) {
    return samples.map(sample => ({
        role: sample.role,
        build: sample.build,
        relicId: sample.relic.id,
        relic: sample.relic.name,
        tags: sample.relic.tags.join('/'),
        buildTagged: sample.buildTagged,
        matureRelic: sample.matureRelic,
        startingRelic: sample.startingRelic,
        nonCombat: sample.nonCombat,
        singleLateLiftPp: fixed(sample.metrics.singleLift?.late || 0),
        singleEliteLiftPp: fixed(sample.metrics.singleLift?.elite || 0),
        singleBossLiftPp: fixed(sample.metrics.singleLift?.boss || 0),
        singleWeightedLiftPp: fixed(sample.metrics.weightedSingleLiftPp || 0),
        matureLateLiftPp: fixed(sample.metrics.matureLift?.late || 0),
        matureEliteLiftPp: fixed(sample.metrics.matureLift?.elite || 0),
        matureBossLiftPp: fixed(sample.metrics.matureLift?.boss || 0),
        matureWeightedLiftPp: fixed(sample.metrics.weightedMatureLiftPp || 0),
        anomalySeverity: sample.anomalies[0]?.severity || 'ok',
        anomalyKind: sample.anomalies[0]?.kind || 'ok'
    }));
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

function markdownReport(report) {
    const anomalies = report.anomalies.filter(item => item.severity !== 'info');
    const top = anomalies.slice(0, 40);
    const nonCombat = report.anomalies.filter(item => item.kind === '非战斗遗物').slice(0, 24);
    const lines = [
        '# 遗物平衡专项审计',
        '',
        `测试日期：${report.generatedAt.slice(0, 10)}`,
        '',
        `总遗物：${report.totalRelics}；测试样本：${report.testedSamples}；每个样本/节点：${report.runsPerSample} 局；随机种子：\`${report.seed}\`。`,
        '',
        '场景：无核心无遗物、单遗物无核心、完整成熟/成熟移除该遗物、成熟加入该遗物。节点：后期普通 / 后期精英 / 最终首领。',
        '',
        '## 异常概览',
        '',
        '| 严重度 | 类型 | 职业 | 构筑 | 遗物 | 说明 |',
        '|---|---|---|---|---|---|',
        ...(top.length ? top.map(row => `| ${row.severity} | ${row.kind} | ${row.role} | ${row.build} | ${row.relic} | ${row.detail} |`) : ['| ok | 无 | - | - | - | 未发现战斗遗物异常 |']),
        '',
        '## 非战斗遗物覆盖',
        '',
        '这些遗物主要影响经济、奖励或路线，本脚本只记录覆盖，不用战斗胜率判定强弱；需要结合完整跑局的获得后通关率与路线/商店数据。',
        '',
        '| 职业 | 构筑 | 遗物 |',
        '|---|---|---|',
        ...(nonCombat.length ? nonCombat.map(row => `| ${row.role} | ${row.build} | ${row.relic} |`) : ['| - | - | 无 |']),
        '',
        '## 完整数据',
        '',
        `- JSON：\`${report.outputs.json}\``,
        `- CSV：\`${report.outputs.csv}\``,
        `- 异常 CSV：\`${report.outputs.anomaliesCsv}\``
    ];
    return `${lines.join('\n')}\n`;
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const outDir = path.resolve(ROOT, args.outDir);
    const jsonPath = resolveOutput(args.json, outDir, 'relic_balance_report.json');
    const markdownPath = resolveOutput(args.markdown, outDir, 'relic_balance_report.md');
    const csvPath = resolveOutput(args.csv, outDir, 'relic_balance_samples.csv');
    const anomaliesCsvPath = resolveOutput(args.anomaliesCsv, outDir, 'relic_balance_anomalies.csv');
    [jsonPath, markdownPath, csvPath, anomaliesCsvPath].forEach(ensureDir);

    const data = loadGameData();
    const samples = [];
    const allEntries = roleBuildEntries(data);
    for (let relicIndex = 0; relicIndex < data.RELIC_POOL.length; relicIndex++) {
        const relic = data.RELIC_POOL[relicIndex];
        const contexts = contextsForRelic(data, relic);
        for (const context of contexts) {
            const roleIndex = Object.keys(data.BUILD_DIRECTIONS).indexOf(context.roleId);
            const buildIndex = allEntries.findIndex(entry => entry.roleId === context.roleId && entry.buildId === context.buildId);
            samples.push(runSample(data, relic, context, { roleIndex, relicIndex, buildIndex }, args));
        }
    }

    const anomalies = samples
        .flatMap(sample => sample.anomalies)
        .sort((left, right) => {
            const rank = { high: 0, medium: 1, info: 2 };
            return (rank[left.severity] ?? 3) - (rank[right.severity] ?? 3)
                || left.role.localeCompare(right.role, 'zh-CN')
                || left.build.localeCompare(right.build, 'zh-CN')
                || left.relic.localeCompare(right.relic, 'zh-CN');
        });
    const report = {
        generatedAt: new Date().toISOString(),
        seed: args.seed,
        runsPerSample: args.runs,
        totalRelics: data.RELIC_POOL.length,
        testedSamples: samples.length,
        checkpoints: FOCUS_CHECKPOINTS.map(checkpoint => ({ id: checkpoint.id, label: checkpoint.label })),
        scenarios: [
            { id: 'baselineNoRelic', label: '无核心无遗物' },
            { id: 'singleRelicNoCore', label: '单遗物无核心' },
            { id: 'matureWithoutRelic', label: '完整成熟/成熟移除该遗物' },
            { id: 'matureWithRelic', label: '成熟加入该遗物/完整成熟' }
        ],
        samples,
        anomalies,
        outputs: {
            json: jsonPath,
            markdown: markdownPath,
            csv: csvPath,
            anomaliesCsv: anomaliesCsvPath
        }
    };

    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(markdownPath, markdownReport(report));
    fs.writeFileSync(csvPath, toCsv(flattenSamples(samples), [
        'role', 'build', 'relicId', 'relic', 'tags', 'buildTagged', 'matureRelic', 'startingRelic', 'nonCombat',
        'singleLateLiftPp', 'singleEliteLiftPp', 'singleBossLiftPp', 'singleWeightedLiftPp',
        'matureLateLiftPp', 'matureEliteLiftPp', 'matureBossLiftPp', 'matureWeightedLiftPp',
        'anomalySeverity', 'anomalyKind'
    ]));
    fs.writeFileSync(anomaliesCsvPath, toCsv(anomalies, [
        'severity', 'kind', 'role', 'build', 'relic', 'detail', 'metric', 'value', 'threshold'
    ]));

    const highCount = anomalies.filter(item => item.severity === 'high').length;
    const mediumCount = anomalies.filter(item => item.severity === 'medium').length;
    const infoCount = anomalies.filter(item => item.severity === 'info').length;
    console.log(`Relic balance audit complete: ${data.RELIC_POOL.length} relics, ${samples.length} samples, ${args.runs} runs per sample.`);
    console.log(`Anomalies: high ${highCount}, medium ${mediumCount}, info ${infoCount}.`);
    console.log(`Report: ${markdownPath}`);
}

run();
