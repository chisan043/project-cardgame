#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_AUDIT_REPORT = 'asset-audit/asset-usage-report.json';
const NON_RUNTIME_ROOTS = [
    'assets/archive/unused/',
    'assets/candidates/',
    'assets/source/'
];
const RUNTIME_ROOTS = [
    'assets/cards/',
    'assets/characters/',
    'assets/enemies/',
    'assets/npc/',
    'assets/relics/',
    'assets/scenes/',
    'assets/ui/',
    'assets/vfx/'
];
const RUNTIME_FILENAME_FORBIDDEN_RE = /(?:^|[_-])(?:source|candidate)(?:[_-]|$)|contact_sheet/i;

function parseArgs(argv) {
    const result = { auditReport: DEFAULT_AUDIT_REPORT };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--audit-report') result.auditReport = argv[++i];
        else throw new Error(`Unknown argument: ${argv[i]}`);
    }
    return result;
}

function readJson(relOrAbsPath) {
    const absPath = path.isAbsolute(relOrAbsPath) ? relOrAbsPath : path.join(ROOT, relOrAbsPath);
    return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

function isUnderAny(assetPath, roots) {
    return roots.some(root => assetPath.startsWith(root));
}

function isRuntimeAssetPath(assetPath) {
    return isUnderAny(assetPath, RUNTIME_ROOTS) && !isUnderAny(assetPath, NON_RUNTIME_ROOTS);
}

function runtimeRefs(record) {
    return (record.references || []).filter(ref => ref.kind === 'runtime');
}

function fail(label, items) {
    if (!items.length) return;
    console.error(`\n${label}: ${items.length}`);
    for (const item of items.slice(0, 20)) console.error(`- ${item}`);
    if (items.length > 20) console.error(`- ... ${items.length - 20} more`);
    throw new Error(`${label}: ${items.length}`);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const auditReport = readJson(args.auditReport);
    const assets = auditReport.assets || [];

    const runtimeReferenceLeaks = assets
        .filter(record => isUnderAny(record.path, NON_RUNTIME_ROOTS) && runtimeRefs(record).length)
        .map(record => {
            const refs = runtimeRefs(record).map(ref => `${ref.file}:${ref.line}`).join(', ');
            return `${record.path} referenced by ${refs}`;
        });

    const activeNonRuntimeAssets = assets
        .filter(record => isUnderAny(record.path, NON_RUNTIME_ROOTS) && record.status === 'active')
        .map(record => record.path);

    const runtimeNamingLeaks = assets
        .filter(record => isRuntimeAssetPath(record.path))
        .filter(record => RUNTIME_FILENAME_FORBIDDEN_RE.test(path.basename(record.path)))
        .map(record => record.path);

    fail('Runtime references to source/candidate/archive assets', runtimeReferenceLeaks);
    fail('Source/candidate/archive assets classified as active', activeNonRuntimeAssets);
    fail('Source/candidate/contact-sheet names in runtime asset roots', runtimeNamingLeaks);

    console.log([
        'Asset boundaries: pass',
        `${assets.length} audited assets`,
        '0 runtime references to source/candidate/archive roots',
        '0 active assets in source/candidate/archive roots',
        '0 source/candidate/contact-sheet names in runtime roots'
    ].join(', '));
}

main();
