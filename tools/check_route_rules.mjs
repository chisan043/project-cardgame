#!/usr/bin/env node

import {
    chooseRoute,
    fixedNodeType,
    generateRouteChoices
} from './run_full_playtest_suite.mjs';
import { createRng } from './simulate_build_balance.mjs';

function fail(message) {
    throw new Error(`Route rules guard failed: ${message}`);
}

function assert(condition, message) {
    if (!condition) fail(message);
}

function run() {
    for (const floor of [1, 2, 3, 4, 5]) {
        for (const profile of ['experienced', 'novice']) {
            for (const hpRatio of [0.25, 0.5, 0.8, 1]) {
                for (const gold of [0, 60, 120]) {
                    for (let seed = 0; seed < 200; seed++) {
                        const choices = generateRouteChoices(createRng(20260616 + floor * 10000 + seed), floor, hpRatio, gold, profile);
                        assert(!choices.includes('elite'), `floor ${floor} offered elite for ${profile}, hp ${hpRatio}, gold ${gold}`);
                        const picked = chooseRoute(createRng(20260617 + floor * 10000 + seed), choices, hpRatio, gold, profile, []);
                        assert(picked !== 'elite', `floor ${floor} picked elite for ${profile}, hp ${hpRatio}, gold ${gold}`);
                    }
                }
            }
        }
    }

    for (const floor of [7, 14, 20]) {
        assert(fixedNodeType(floor) === 'boss', `floor ${floor} should be fixed boss`);
        const choices = generateRouteChoices(createRng(20260616 + floor), floor, 1, 0, 'experienced');
        assert(choices.length === 1 && choices[0] === 'boss', `floor ${floor} should only offer boss`);
    }

    for (const floor of [6, 13, 19]) {
        assert(fixedNodeType(floor) === 'rest', `floor ${floor} should be fixed rest`);
        const choices = generateRouteChoices(createRng(20260616 + floor), floor, 1, 0, 'experienced');
        assert(choices.length === 1 && choices[0] === 'rest', `floor ${floor} should only offer rest`);
    }

    for (const floor of [8, 9, 10, 11, 12, 15, 16, 17, 18]) {
        const choices = generateRouteChoices(createRng(20260616 + floor), floor, 1, 120, 'experienced');
        assert(choices.length <= 3, `floor ${floor} offered more than three choices`);
        assert(choices.includes('normal'), `floor ${floor} should include normal route`);
    }

    console.log('Route rules guard: pass');
}

run();
