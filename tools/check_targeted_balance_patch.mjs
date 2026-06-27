#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILES = [
    'src/data/relics.js',
    'src/data/card-tags.js',
    'src/data/cards.js'
];

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function loadGameData() {
    const source = DATA_FILES.map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
    const context = vm.createContext({ window: {} });
    vm.runInContext(`${source}\n;globalThis.__targetedBalanceData = {
        CHARACTER_CARD_POOLS,
        SPECIAL_EPIC_POOLS,
        RELIC_POOL
    };`, context);
    return context.__targetedBalanceData;
}

function readSource(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function hasPattern(source, pattern) {
    return pattern.test(source.replace(/\s+/g, ' '));
}

const data = loadGameData();
const cards = Object.values(data.CHARACTER_CARD_POOLS).flat();
const specialCards = Object.values(data.SPECIAL_EPIC_POOLS).flat();
const cardsSource = readSource('src/data/cards.js');

function card(poolId) {
    const found = cards.find(item => item.poolId === poolId);
    assert(found, `Missing card ${poolId}`);
    return found;
}

function special(id) {
    const found = specialCards.find(item => item.id === id);
    assert(found, `Missing special ${id}`);
    return found;
}

function relic(id) {
    const found = data.RELIC_POOL.find(item => item.id === id);
    assert(found, `Missing relic ${id}`);
    return found;
}

const bloodWall = card('warrior_blood_wall');
assert(bloodWall.bloodOathCost === 4, '血痕引路 should lose 4 HP');
assert(bloodWall.bloodDebtBleed === 7, '血痕引路 should apply 7 bleed');
assert(/失去 4 点生命/.test(bloodWall.desc) && /7 层出血/.test(bloodWall.desc), '血痕引路 text should match its tuned values');

const veinOath = card('warrior_vein_oath');
assert(veinOath.bloodOathCost === 4, '裂脉誓印 should keep 4 HP cost');
assert(veinOath.bloodDebtBleed === 7, '裂脉誓印 should apply 7 bleed');
assert(/7 层出血/.test(veinOath.desc), '裂脉誓印 text should mention 7 bleed');

const bloodGuardStep = card('warrior_blood_guard_step');
assert(bloodGuardStep.val === 9, '偿血追命 should deal 9 base damage');
assert(bloodGuardStep.lifestealRatio === 0.55, '偿血追命 should lifesteal 55%');
assert(/poolId: 'warrior_blood_guard_step'[\s\S]*?55%/.test(cardsSource), '偿血追命 source text should mention 55% lifesteal');

const plagueStar = special('m_calamity_plague_star');
assert(plagueStar.extraVulnerable === 1, '疫星坠落 should add 1 explicit vulnerability');
assert(/易伤/.test(plagueStar.desc), '疫星坠落 text should mention vulnerability');

const recall = special('a_exile_recall');
assert(recall.val === 8, '归巢双令 should grant 2 wind through val 8');
assert(recall.drawOnExhaustPile === 1, '归巢双令 should draw when the exile pile has cards');
assert(/放逐区有牌/.test(recall.desc) && /抽 1/.test(recall.desc), '归巢双令 text should mention conditional draw');

const skyfall = special('a_skyfall_shot');
assert(skyfall.val === 22, '坠星绝矢 should deal 22 base damage');
assert(/造成 22/.test(skyfall.desc) && /额外造成 5/.test(skyfall.desc), '坠星绝矢 text should match 22/+5 tuning');

assert(/2 种/.test(relic('r_status_ledger').desc), '异状账簿 should trigger at 2 debuff types');
assert(/4 点流动伤害/.test(relic('r_bloodlet_draw').desc), '赤脉弦扣 should mention flow damage');
assert(/6 点护盾/.test(relic('r_thorn_shield_new').desc), '蔷薇重盾 should mention 6 starting armor');

const html = readSource('questers_demo_v0.99.html');
const simulator = readSource('tools/simulate_build_balance.mjs');

assert(hasPattern(html, /r_status_ledger.*getEnemyDebuffTypeCount\(\) >= 2/), 'HTML should use 2-debuff ledger threshold');
assert(hasPattern(simulator, /r_status_ledger.*enemyDebuffCount\(state\) >= 2/), 'Simulator should use 2-debuff ledger threshold');
assert(hasPattern(html, /a_skyfall_shot.*Math\.floor\(state\.exhaustPile\.length \/ 2\) \* 5.*22/s), 'HTML should resolve 坠星绝矢 as 22/+5');
assert(hasPattern(simulator, /a_skyfall_shot.*22 \+ state\.battleDamage \+ Math\.floor\(state\.exhaust\.length \/ 2\) \* 5/s), 'Simulator should resolve 坠星绝矢 as 22/+5');
assert(html.includes('drawOnExhaustPile') && simulator.includes('drawOnExhaustPile'), 'HTML and simulator should implement 归巢双令 conditional draw');
assert(html.includes('extraVulnerable') && simulator.includes('extraVulnerable'), 'HTML and simulator should implement 疫星坠落 explicit vulnerability');
assert(html.includes('triggerBloodletDrawRelic') && simulator.includes('triggerBloodletDrawRelic'), 'HTML and simulator should share 赤脉弦扣 battle behavior');
assert(html.includes("hasRelic('r_thorn_shield_new')) state.armor += 6"), 'HTML should grant 6 starting armor from 蔷薇重盾');
assert(simulator.includes("hasRelic(state, 'r_thorn_shield_new')) state.armor += 6"), 'Simulator should grant 6 starting armor from 蔷薇重盾');

console.log('Targeted balance patch guard: pass');
