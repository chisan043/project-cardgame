#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function runStep(label, command, args, options = {}) {
    console.log(`\n== ${label} ==`);
    console.log([command, ...args].join(' '));
    const result = spawnSync(command, args, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        ...options
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) {
        throw new Error(`${label} failed with exit code ${result.status ?? 'unknown'}`);
    }
    return result;
}

function readJson(relPath) {
    const absPath = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
    return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

function main() {
    const auditDir = path.join(os.tmpdir(), `questers_release_asset_audit_${Date.now()}`);
    runStep('asset audit', 'python3', ['tools/audit_assets.py', '--output-dir', auditDir]);

    const auditReport = readJson(path.join(auditDir, 'asset-usage-report.json'));
    if (auditReport.summary.missingReferenceCount !== 0) {
        throw new Error(`Asset audit has missing references: ${auditReport.summary.missingReferenceCount}`);
    }
    if (auditReport.summary.missingRuntimeReferenceCount !== 0) {
        throw new Error(`Asset audit has missing runtime/config references: ${auditReport.summary.missingRuntimeReferenceCount}`);
    }
    console.log(`Asset audit: ${auditReport.summary.assetCount} assets, 0 missing references`);

    runStep('asset boundaries', process.execPath, ['tools/check_asset_boundaries.mjs', '--audit-report', path.join(auditDir, 'asset-usage-report.json')]);
    runStep('asset registries', process.execPath, ['tools/build_asset_registries.mjs', '--check']);
    runStep('procedural-card guard', process.execPath, ['tools/check_no_procedural_cards.mjs']);
    runStep('open-build-flow guard', process.execPath, ['tools/check_open_build_flow.mjs']);

    console.log('\nRelease checks: pass');
}

main();
