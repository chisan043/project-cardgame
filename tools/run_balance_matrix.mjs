#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_SEEDS = [20260614, 20260615, 20260616];
const DEFAULT_REPORT_DIR = 'tools/playtest_reports';
const FULL_REPORT_FILES = [
    '完整跑局体验与平衡测试报告.md',
    'full_playtest_report.json',
    'single_runs.csv',
    'card_stats.csv',
    'relic_stats.csv',
    'enemy_stats.csv',
    'floor_heatmap.csv',
    'route_stats.csv',
    'failure_feedback.csv',
    'anomalies.csv',
    'combo_stats.csv'
];

function parseArgs(argv) {
    const result = {
        seeds: [...DEFAULT_SEEDS],
        outDir: DEFAULT_REPORT_DIR,
        fullRunsPerBuild: 40,
        noviceRunsPerBuild: 12,
        practicalRuns: 500,
        epicRuns: 120,
        relicRuns: 100,
        skipFull: false,
        skipPractical: false,
        skipEpic: false,
        skipRelic: false
    };
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        if (arg === '--seeds') result.seeds = argv[++index].split(',').map(Number).filter(Number.isFinite);
        else if (arg === '--out-dir') result.outDir = argv[++index];
        else if (arg === '--full-runs-per-build') result.fullRunsPerBuild = Number(argv[++index]);
        else if (arg === '--novice-runs-per-build') result.noviceRunsPerBuild = Number(argv[++index]);
        else if (arg === '--practical-runs') result.practicalRuns = Number(argv[++index]);
        else if (arg === '--epic-runs') result.epicRuns = Number(argv[++index]);
        else if (arg === '--relic-runs') result.relicRuns = Number(argv[++index]);
        else if (arg === '--skip-full') result.skipFull = true;
        else if (arg === '--skip-practical') result.skipPractical = true;
        else if (arg === '--skip-epic') result.skipEpic = true;
        else if (arg === '--skip-relic') result.skipRelic = true;
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

function localReportDateTime(value) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(new Date(value)).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
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

function mirrorLatestFullReport(sourceDir, outputDir) {
    for (const fileName of FULL_REPORT_FILES) {
        const sourcePath = path.join(sourceDir, fileName);
        if (fs.existsSync(sourcePath)) fs.copyFileSync(sourcePath, path.join(outputDir, fileName));
    }
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
        anomalies: rows,
        topAnomalies: rows.slice(0, 20)
    };
}

function summarizeRelic(report) {
    const rows = report.anomalies
        .filter(item => item.severity !== 'info')
        .map(item => ({
            severity: item.severity,
            kind: item.kind,
            role: item.role,
            build: item.build,
            relic: item.relic,
            detail: item.detail
        })).sort((left, right) => {
            const rank = { high: 0, medium: 1 };
            return (rank[left.severity] ?? 2) - (rank[right.severity] ?? 2)
                || left.role.localeCompare(right.role, 'zh-CN')
                || left.build.localeCompare(right.build, 'zh-CN')
                || left.relic.localeCompare(right.relic, 'zh-CN');
        });
    return {
        totalRelics: report.totalRelics,
        testedSamples: report.testedSamples,
        highCount: rows.filter(row => row.severity === 'high').length,
        mediumCount: rows.filter(row => row.severity === 'medium').length,
        nonCombatCount: report.anomalies.filter(item => item.kind === '非战斗遗物').length,
        anomalies: rows,
        topAnomalies: rows.slice(0, 20)
    };
}

function reportPath(outDir, ...parts) {
    return path.join(outDir, ...parts);
}

function markdownSummary(summary) {
    const lines = [
        '# Questers 平衡矩阵总报告',
        '',
        `生成时间：${localReportDateTime(summary.generatedAt)}`,
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
        `| 遗物审计 seeds | ${summary.relic.length ? summary.relic.map(item => item.seed).join(', ') : '跳过'} |`,
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
    if (summary.relic.length) {
        lines.push(
            '## 遗物审计',
            '',
            '| Seed | 遗物 | 样本 | High | Medium | 非战斗覆盖 |',
            '|---:|---:|---:|---:|---:|---:|',
            ...summary.relic.map(item => `| ${item.seed} | ${item.totalRelics} | ${item.testedSamples} | ${item.highCount} | ${item.mediumCount} | ${item.nonCombatCount} |`),
            ''
        );
        const top = summary.relic[0].topAnomalies.slice(0, 16);
        lines.push(
            '### 首个 seed 遗物异常样例',
            '',
            '| 严重度 | 类型 | 职业 | 构筑 | 遗物 | 说明 |',
            '|---|---|---|---|---|---|',
            ...(top.length ? top.map(row => `| ${row.severity} | ${row.kind} | ${row.role} | ${row.build} | ${row.relic} | ${row.detail} |`) : ['| ok | 无 | - | - | - | 未发现战斗遗物异常 |']),
            ''
        );
    }
    return `${lines.join('\n')}\n`;
}

function markdownCompleteReport(summary) {
    const lines = [
        '# 完整跑局体验与平衡测试报告',
        '',
        `测试时间：${localReportDateTime(summary.generatedAt)}`,
        '',
        `输出目录：\`${summary.outDir}\``,
        '',
        '## 测试覆盖',
        '',
        '| 测试模块 | 状态 | 原始报告 |',
        '|---|---|---|',
        `| 基础发布检查 | ${summary.release.status === 0 ? '通过' : '失败'} | - |`,
        `| 路线规则检查 | ${summary.route.status === 0 ? '通过' : '失败'} | - |`,
        `| 完整跑局 | ${summary.full.length ? `${summary.full.length} 个 seed` : '跳过'} | \`${summary.outDir}/full_<seed>/完整跑局体验与平衡测试报告.md\` |`,
        `| 实战缺核心 | ${summary.practical.length ? `${summary.practical.length} 个 seed` : '跳过'} | \`${summary.outDir}/practical_<seed>.md\` |`,
        `| 史诗核心审计 | ${summary.epic.length ? `${summary.epic.length} 个 seed` : '跳过'} | \`${summary.outDir}/epic_<seed>/epic_core_balance_report.md\` |`,
        `| 遗物逐个审计 | ${summary.relic.length ? `${summary.relic.length} 个 seed` : '跳过'} | \`${summary.outDir}/relic_<seed>/relic_balance_report.md\` |`,
        '',
        '## 完整跑局汇总',
        ''
    ];

    if (summary.full.length) {
        lines.push(
            '| Seed | 跑局 | 熟练通关 | 新手到一章Boss | 异常 | 子报告 |',
            '|---:|---:|---:|---:|---:|---|',
            ...summary.full.map(item => `| ${item.seed} | ${item.totalRuns} | ${pct(item.experiencedClearRate)} | ${pct(item.noviceAct1BossReachRate)} | ${item.anomalyCount} | \`${reportPath(summary.outDir, `full_${item.seed}`, '完整跑局体验与平衡测试报告.md')}\` |`),
            `| 平均 | ${Math.round(avg(summary.full.map(item => item.totalRuns)))} | ${pct(avg(summary.full.map(item => item.experiencedClearRate)))} | ${pct(avg(summary.full.map(item => item.noviceAct1BossReachRate)))} | ${avg(summary.full.map(item => item.anomalyCount)).toFixed(1)} | - |`,
            '',
            '### 完整跑局数据文件',
            '',
            '| 文件 | 说明 |',
            '|---|---|',
            `| \`${reportPath(summary.outDir, 'full_playtest_report.json')}\` | 最新 seed 的完整跑局 JSON |`,
            `| \`${reportPath(summary.outDir, 'single_runs.csv')}\` | 最新 seed 的单局记录 |`,
            `| \`${reportPath(summary.outDir, 'card_stats.csv')}\` | 最新 seed 的卡牌选择和使用统计 |`,
            `| \`${reportPath(summary.outDir, 'relic_stats.csv')}\` | 最新 seed 的遗物获得和通关统计 |`,
            `| \`${reportPath(summary.outDir, 'enemy_stats.csv')}\` | 最新 seed 的敌人统计 |`,
            `| \`${reportPath(summary.outDir, 'floor_heatmap.csv')}\` | 最新 seed 的楼层热区 |`,
            `| \`${reportPath(summary.outDir, 'route_stats.csv')}\` | 最新 seed 的路线选择统计 |`,
            `| \`${reportPath(summary.outDir, 'failure_feedback.csv')}\` | 最新 seed 的失败反馈分类 |`,
            `| \`${reportPath(summary.outDir, 'anomalies.csv')}\` | 最新 seed 的完整跑局异常项 |`,
            `| \`${reportPath(summary.outDir, 'combo_stats.csv')}\` | 最新 seed 的组合胜率统计 |`,
            ''
        );
    } else {
        lines.push('本轮跳过完整跑局。', '');
    }

    lines.push('## 实战缺核心测试', '');
    if (summary.practical.length) {
        lines.push(
            '| Seed | 问题构筑数 | 原始报告 |',
            '|---:|---:|---|',
            ...summary.practical.map(item => `| ${item.seed} | ${item.issueCount} | \`${reportPath(summary.outDir, `practical_${item.seed}.md`)}\` |`),
            '',
            '### 缺核心问题明细',
            '',
            '| Seed | 职业 | 构筑 | 诊断 |',
            '|---:|---|---|---|'
        );
        const rows = summary.practical.flatMap(item => item.issues.map(issue => ({ seed: item.seed, ...issue })));
        lines.push(...(rows.length
            ? rows.map(row => `| ${row.seed} | ${row.role} | ${row.build} | ${row.diagnosis.join('；')} |`)
            : ['| - | - | - | 未发现缺核心体验问题 |']));
        lines.push('');
    } else {
        lines.push('本轮跳过实战缺核心测试。', '');
    }

    lines.push('## 史诗核心审计', '');
    if (summary.epic.length) {
        lines.push(
            '| Seed | 核心牌 | 样本 | High | Medium | 原始报告 |',
            '|---:|---:|---:|---:|---:|---|',
            ...summary.epic.map(item => `| ${item.seed} | ${item.totalCoreCards} | ${item.testedSamples} | ${item.highCount} | ${item.mediumCount} | \`${reportPath(summary.outDir, `epic_${item.seed}`, 'epic_core_balance_report.md')}\` |`),
            '',
            '### 史诗核心异常明细',
            '',
            '| Seed | 严重度 | 类型 | 职业 | 构筑 | 卡牌 | 说明 |',
            '|---:|---|---|---|---|---|---|'
        );
        const rows = summary.epic.flatMap(item => item.anomalies.map(row => ({ seed: item.seed, ...row })));
        lines.push(...(rows.length
            ? rows.map(row => `| ${row.seed} | ${row.severity} | ${row.kind} | ${row.role} | ${row.build} | ${row.card} | ${row.detail} |`)
            : ['| - | ok | 无 | - | - | - | 未发现史诗核心异常 |']));
        lines.push('');
    } else {
        lines.push('本轮跳过史诗核心审计。', '');
    }

    lines.push('## 遗物逐个审计', '');
    if (summary.relic.length) {
        lines.push(
            '| Seed | 遗物 | 样本 | High | Medium | 非战斗覆盖 | 原始报告 |',
            '|---:|---:|---:|---:|---:|---:|---|',
            ...summary.relic.map(item => `| ${item.seed} | ${item.totalRelics} | ${item.testedSamples} | ${item.highCount} | ${item.mediumCount} | ${item.nonCombatCount} | \`${reportPath(summary.outDir, `relic_${item.seed}`, 'relic_balance_report.md')}\` |`),
            '',
            '### 遗物异常明细',
            '',
            '| Seed | 严重度 | 类型 | 职业 | 构筑 | 遗物 | 说明 |',
            '|---:|---|---|---|---|---|---|'
        );
        const rows = summary.relic.flatMap(item => item.anomalies.map(row => ({ seed: item.seed, ...row })));
        lines.push(...(rows.length
            ? rows.map(row => `| ${row.seed} | ${row.severity} | ${row.kind} | ${row.role} | ${row.build} | ${row.relic} | ${row.detail} |`)
            : ['| - | ok | 无 | - | - | - | 未发现战斗遗物异常 |']));
        lines.push(
            '',
            '非战斗遗物会在各 seed 的遗物原始报告中列出；它们主要影响金币、奖励、商店、路线或战后收益，不用战斗胜率直接判定强弱。',
            ''
        );
    } else {
        lines.push('本轮跳过遗物逐个审计。', '');
    }

    lines.push(
        '## 矩阵汇总文件',
        '',
        `- 矩阵摘要：\`${reportPath(summary.outDir, 'balance_matrix_summary.md')}\``,
        `- 矩阵 JSON：\`${reportPath(summary.outDir, 'balance_matrix_summary.json')}\``
    );
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
        epic: [],
        relic: []
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
            mirrorLatestFullReport(reportDir, outDir);
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
        if (!args.skipRelic) {
            const relicDir = path.join(outDir, `relic_${seed}`);
            const result = runStep(`relic audit ${seed}`, [
                'tools/analyze_relic_balance.mjs',
                '--runs', String(args.relicRuns),
                '--seed', String(seed),
                '--out-dir', relicDir
            ]);
            if (result.status !== 0) throw new Error(`relic audit failed for seed ${seed}`);
            summary.relic.push({ seed, ...summarizeRelic(readJson(path.join(relicDir, 'relic_balance_report.json'))) });
        }
    }

    fs.writeFileSync(path.join(outDir, 'balance_matrix_summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
    fs.writeFileSync(path.join(outDir, 'balance_matrix_summary.md'), markdownSummary(summary));
    fs.writeFileSync(path.join(outDir, '完整跑局体验与平衡测试报告.md'), markdownCompleteReport(summary));
    console.log(`\nBalance matrix complete: ${outDir}`);
    console.log(`Summary: ${path.join(outDir, 'balance_matrix_summary.md')}`);
    console.log(`Complete report: ${path.join(outDir, '完整跑局体验与平衡测试报告.md')}`);
}

run();
