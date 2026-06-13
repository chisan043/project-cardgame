#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
    'questers_demo_v0.99.html',
    'src/data/cards.js',
    'src/data/card-tags.js'
];
const forbidden = ['generateProceduralCard', 'GEN_DICT', 'TAG_POOL', 'getValidTags'];
const violations = [];

for (const file of files) {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const token of forbidden) {
        if (source.includes(token)) violations.push(`${file}: ${token}`);
    }
}

if (violations.length) {
    console.error(`Procedural card generation guard failed:\n${violations.join('\n')}`);
    process.exit(1);
}

console.log('Procedural card generation guard: pass');
