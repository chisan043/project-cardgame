#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_SEEDS = [20260614, 20260615, 20260616];

function parseArgs(argv) {
    const result = {
        seeds: [...DEFAULT_SEEDS],
        outDir: path.join(os.tmpdir(), `questers_balance_matrix_${Date.now()}`),
        fullRunsPerBuild: 40,
        noviceRunsPerBuild: 12,
        practicalRuns: 500,
        epicRuns: 120,
        skipFull: false,
        skipPractical: false,
        skipEpic: false
    };
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        if (arg === '--seeds') result.seeds = argv[++index].split(',').map(Number).filter(Number.isFinite);
        else if (arg === '--out-dir') result.outDir = argv[++index];
        else if (arg === '--full-runs-per-build') result.fullRunsPerBuild = Number(argv[++index]);
        else if (arg === '--novice-runs-per-build') result.noviceRunsPerBuild = Number(argv[++index]);
        else if (arg === '--practical-runs') result.practicalRuns = Number(argv[++index]);
        else if (arg === '--epic-runs') result.epicRuns = Number(argv[++index]);
        else if (arg === '--skip-full') result.skipFull = true;
        else if (arg === '--skip-practical') result.skipPractical = true;
        else if (arg === '--skip-epic') result.skipEpic = true;
    }
    if (!result.seeds.length) throw new Error('--seeds must include at least one number');
    return result;
}

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function avg(values) {
    return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function runStep(label, args, options = {}) {
    console.log(`\n== ${label} ==`);
    console.log([process.execPath, ...args].join(' '));
    const result = spawnSync(process.execPath, args, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        ...options
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    return {
        label,
        status: result.status ?? 1,
        stdout: result.stdout || '',
        stderr: result.stderr || ''
    };
}

function summarizeFull(report) {
    const experienced = report.runs.filter(run => run.profile === 'experienced');
    const novice = report.runs.filter(run => run.profile === 'novice');
    return {
        totalRuns: report.config.totalRuns,
        experiencedClearRate: experienced.filter(run => run.cleared).length / Math.max(1, experienced.length),
        noviceAct1BossReachRate: novice.filter(run => run.act1BossReached).length / Math.max(1, novice.length),
        anomalyCount: report.anomalies.length,
        topAnomalies: report.anomalies.slice(0, 12).map(item => item.message || item.detail || String(item))
    };
}

function summarizePractical(report) {
    const issueRows = report.results
        .filter(entry => !entry.diagnosis.every(item => item === '缺核心体验可接受'))
        .map(entry => ({
            role: entry.role,
            build: entry.build,
            diagnosis: entry.diagnosis
        }));
    return {
        builds: report.results.length,
        issueCount: issueRows.length,
        issues: issueRows
    };
}

function summarizeEpic(report) {
    const rows = report.results.flatMap(sample => sample.anomalies
        .filter(item => item.severity !== 'ok')
        .map(item => ({
            severity: item.severity,
            kind: item.kind,
            role: sample.role,
            build: sample.build,
            card: sample.card.name,
            detail: item.detail
        }))).sort((left, right) => {
        const rank = { high: 0, medium: 1 };
        return (rank[left.severity] ?? 2) - (rank[right.severity] ?? 2)
            || left.role.localeCompare(right.role, 'zh-CN')
            || left.build.localeCompare(right.build, 'zh-CN')
            || left.card.localeCompare(right.card, 'zh-CN');
    });
    return {
        totalCoreCards: report.totalCoreCards,
        testedSamples: report.testedSamples,
        highCount: rows.filter(row => row.severity === 'high').length,
        mediumCount: rows.filter(row => row.severity === 'medium').length,
        topAnomalies: rows.slice(0, 20)
    };
}

function markdownSummary(summary) {
    const lines = [
        '# Questers 平衡矩阵总报告',
        '',
        `生成时间：${summary.generatedAt}`,
        '',
        `输出目录：\`${summary.outDir}\``,
        '',
        '## 总览',
        '',
        '| 项目 | 结果 |',
        '|---|---|',
        `| 基础发布检查 | ${summary.release.status === 0 ? '通过' : '失败'} |`,
        `| 路线规则检查 | ${summary.route.status === 0 ? '通过' : '失败'} |`,
        `| 完整跑局 seeds | ${summary.full.length ? summary.full.map(item => item.seed).join(', ') : '跳过'} |`,
        `| 实战缺核心 seeds | ${summary.practical.length ? summary.practical.map(item => item.seed).join(', ') : '跳过'} |`,
        `| 史诗核心审计 seeds | ${summary.epic.length ? summary.epic.map(item => item.seed).join(', ') : '跳过'} |`,
        ''
    ];
    if (summary.full.length) {
        lines.push(
            '## 完整跑局',
            '',
            '| Seed | 跑局 | 熟练通关 | 新手到一章Boss | 异常 |',
            '|---:|---:|---:|---:|---:|',
            ...summary.full.map(item => `| ${item.seed} | ${item.totalRuns} | ${pct(item.experiencedClearRate)} | ${pct(item.noviceAct1BossReachRate)} | ${item.anomalyCount} |`),
            `| 平均 | ${Math.round(avg(summary.full.map(item => item.totalRuns)))} | ${pct(avg(summary.full.map(item => item.experiencedClearRate)))} | ${pct(avg(summary.full.map(item => item.noviceAct1BossReachRate)))} | ${avg(summary.full.map(item => item.anomalyCount)).toFixed(1)} |`,
            ''
        );
    }
    if (summary.practical.length) {
        lines.push(
            '## 实战缺核心',
            '',
            '| Seed | 问题构筑数 |',
            '|---:|---:|',
            ...summary.practical.map(item => `| ${item.seed} | ${item.issueCount} |`),
            ''
        );
    }
    if (summary.epic.length) {
        lines.push(
            '## 史诗核心审计',
            '',
            '| Seed | 核心牌 | 样本 | High | Medium |',
            '|---:|---:|---:|---:|---:|',
            ...summary.epic.map(item => `| ${item.seed} | ${item.totalCoreCards} | ${item.testedSamples} | ${item.highCount} | ${item.mediumCount} |`),
            ''
        );
        const top = summary.epic[0].topAnomalies.slice(0, 16);
        lines.push(
            '### 首个 seed 异常样例',
            '',
            '| 严重度 | 类型 | 职业 | 构筑 | 卡牌 | 说明 |',
            '|---|---|---|---|---|---|',
            ...top.map(row => `| ${row.severity} | ${row.kind} | ${row.role} | ${row.build} | ${row.card} | ${row.detail} |`),
            ''
        );
    }
    return `${lines.join('\n')}\n`;
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const outDir = path.resolve(ROOT, args.outDir);
    ensureDir(outDir);
    const summary = {
        generatedAt: new Date().toISOString(),
        outDir,
        config: args,
        release: runStep('release checks', ['tools/run_release_checks.mjs']),
        route: runStep('route rules', ['tools/check_route_rules.mjs']),
        full: [],
        practical: [],
        epic: []
    };
    if (summary.release.status !== 0 || summary.route.status !== 0) {
        fs.writeFileSync(path.join(outDir, 'balance_matrix_summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
        throw new Error('Balance matrix stopped because a guard failed');
    }

    for (const seed of args.seeds) {
        if (!args.skipFull) {
            const reportDir = path.join(outDir, `full_${seed}`);
            const result = runStep(`full playtest ${seed}`, [
                'tools/run_full_playtest_suite.mjs',
                '--runs-per-build', String(args.fullRunsPerBuild),
                '--novice-runs-per-build', String(args.noviceRunsPerBuild),
                '--seed', String(seed),
                '--report-dir', reportDir
            ]);
            if (result.status !== 0) throw new Error(`full playtest failed for seed ${seed}`);
            summary.full.push({ seed, ...summarizeFull(readJson(path.join(reportDir, 'full_playtest_report.json'))) });
        }
        if (!args.skipPractical) {
            const jsonPath = path.join(outDir, `practical_${seed}.json`);
            const mdPath = path.join(outDir, `practical_${seed}.md`);
            const result = runStep(`practical balance ${seed}`, [
                'tools/analyze_practical_balance.mjs',
                '--runs', String(args.practicalRuns),
                '--seed', String(seed),
                '--json', jsonPath,
                '--markdown', mdPath
            ]);
            if (result.status !== 0) throw new Error(`practical balance failed for seed ${seed}`);
            summary.practical.push({ seed, ...summarizePractical(readJson(jsonPath)) });
        }
        if (!args.skipEpic) {
            const epicDir = path.join(outDir, `epic_${seed}`);
            const result = runStep(`epic core audit ${seed}`, [
                'tools/analyze_epic_core_balance.mjs',
                '--runs', String(args.epicRuns),
                '--seed', String(seed),
                '--out-dir', epicDir
            ]);
            if (result.status !== 0) throw new Error(`epic core audit failed for seed ${seed}`);
            summary.epic.push({ seed, ...summarizeEpic(readJson(path.join(epicDir, 'epic_core_balance_report.json'))) });
        }
    }

    fs.writeFileSync(path.join(outDir, 'balance_matrix_summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
    fs.writeFileSync(path.join(outDir, 'balance_matrix_summary.md'), markdownSummary(summary));
    console.log(`\nBalance matrix complete: ${outDir}`);
    console.log(`Summary: ${path.join(outDir, 'balance_matrix_summary.md')}`);
}

run();
