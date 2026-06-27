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

const warriorDuelCut = card('warrior_duel_cut');
assert(warriorDuelCut.val === 13, '破甲誓斗 should deal 13 pierce damage');
assert(/poolId: 'warrior_duel_cut'[\s\S]*?造成 13 点\[穿甲\]伤害/.test(cardsSource), '破甲誓斗 source text should mention 13 pierce damage');

const warriorHeartProbe = card('warrior_heart_probe');
assert(warriorHeartProbe.val === 16, '穿心试探 should deal 16 pierce damage');
assert(/poolId: 'warrior_heart_probe'[\s\S]*?造成 16 点\[穿甲\]伤害/.test(cardsSource), '穿心试探 source text should mention 16 pierce damage');

const warriorSteelPressure = card('warrior_steel_pressure');
assert(warriorSteelPressure.val === 14, '鸣钢镇压 should deal 14 pierce damage');
assert(/poolId: 'warrior_steel_pressure'[\s\S]*?造成 14 点\[穿甲\]伤害/.test(cardsSource), '鸣钢镇压 source text should mention 14 pierce damage');

const warriorSilentLunge = card('warrior_silent_lunge');
assert(warriorSilentLunge.val === 13, '默步突刺 should deal 13 pierce damage');
assert(/poolId: 'warrior_silent_lunge'[\s\S]*?造成 13 点\[穿甲\]伤害/.test(cardsSource), '默步突刺 source text should mention 13 pierce damage');

const plagueStar = special('m_calamity_plague_star');
assert(plagueStar.extraVulnerable === 1, '疫星坠落 should add 1 explicit vulnerability');
assert(/易伤/.test(plagueStar.desc), '疫星坠落 text should mention vulnerability');

const recall = special('a_exile_recall');
assert(recall.val === 8, '归巢双令 should grant 2 wind through val 8');
assert(recall.drawOnExhaustPile === 1, '归巢双令 should draw when the exile pile has cards');
assert(/放逐区有牌/.test(recall.desc) && /抽 1/.test(recall.desc), '归巢双令 text should mention conditional draw');

const skyfall = special('a_skyfall_shot');
assert(skyfall.val === 26, '坠星绝矢 should deal 26 base damage');
assert(skyfall.exileDamagePerCard === 3, '坠星绝矢 should gain 3 damage per exiled card');
assert(skyfall.exileDamageCap === 24, '坠星绝矢 exile bonus should cap at 24');
assert(/造成 26/.test(skyfall.desc) && /每有 1 张牌/.test(skyfall.desc) && /最多 24/.test(skyfall.desc), '坠星绝矢 text should match 26/+3 capped tuning');

const mirrorRewrite = special('s_magic');
assert(mirrorRewrite.energyOnCopy === 1, '镜界复写 should refund 1 energy when it copies a card');
assert(/回复 1 点能量/.test(mirrorRewrite.desc), '镜界复写 text should mention successful-copy energy refund');

const blackSnow = special('m_calamity_black_snow');
assert(blackSnow.val === 18, '黑雪预兆 should deal 18 base damage');
assert(blackSnow.debuffDamageBonus === 6, '黑雪预兆 should deal 6 calamity damage per debuff type');
assert(blackSnow.debuffDamageCap === 5, '黑雪预兆 should count up to 5 debuff types');
assert(/每种负面状态追加 6/.test(blackSnow.desc) && /最多 5 种/.test(blackSnow.desc), '黑雪预兆 text should mention debuff-type finisher damage');

const executionLine = special('w_exec_line');
assert(executionLine.drawOnCombo === 1, '银线破甲 should draw when played after another card');
assert(/先施加/.test(executionLine.desc) && /抽 1/.test(executionLine.desc), '银线破甲 text should mention pre-damage vulnerability and combo draw');

const bloodDrum = special('w_blood_drum');
assert(bloodDrum.drawCount === 2, '血鼓战誓 should draw 2 cards');
assert(bloodDrum.turnDamageBonus === 4, '血鼓战誓 should grant +4 attack damage this turn');
assert(/抽 2/.test(bloodDrum.desc) && /本回合攻击伤害 \+4/.test(bloodDrum.desc), '血鼓战誓 text should mention draw 2 and turn attack damage');

assert(/2 种/.test(relic('r_status_ledger').desc), '异状账簿 should trigger at 2 debuff types');
assert(/4 点流动伤害/.test(relic('r_bloodlet_draw').desc), '赤脉弦扣 should mention flow damage');
assert(/6 点护盾/.test(relic('r_thorn_shield_new').desc), '蔷薇重盾 should mention 6 starting armor');

const html = readSource('questers_demo_v0.99.html');
const simulator = readSource('tools/simulate_build_balance.mjs');

assert(hasPattern(html, /r_status_ledger.*getEnemyDebuffTypeCount\(\) >= 2/), 'HTML should use 2-debuff ledger threshold');
assert(hasPattern(simulator, /r_status_ledger.*enemyDebuffCount\(state\) >= 2/), 'Simulator should use 2-debuff ledger threshold');
assert(hasPattern(html, /a_skyfall_shot.*Math\.min\(Number\(card\.exileDamageCap\).*state\.exhaustPile\.length \* \(Number\(card\.exileDamagePerCard\).*26/s), 'HTML should resolve 坠星绝矢 as 26/+3 capped');
assert(hasPattern(simulator, /a_skyfall_shot.*exileCount = state\.exhaust\.length \+ 1.*Math\.min\(Number\(card\.exileDamageCap\).*exileCount \* \(Number\(card\.exileDamagePerCard\).*26/s), 'Simulator should resolve 坠星绝矢 as 26/+3 capped');
assert(hasPattern(html, /s_magic.*energyRefund = Number\(card\.energyOnCopy\).*state\.mp \+= energyRefund/s), 'HTML should refund energy for successful 镜界复写 copies');
assert(hasPattern(simulator, /s_magic.*state\.energy \+= Number\(card\.energyOnCopy\)/s), 'Simulator should refund energy for successful 镜界复写 copies');
assert(hasPattern(html, /m_calamity_black_snow.*Math\.min\(Number\(card\.debuffDamageCap\).*getEnemyDebuffTypeCount\(\)\).*Number\(card\.debuffDamageBonus\)/s), 'HTML should apply 黑雪预兆 debuff-type damage');
assert(hasPattern(simulator, /m_calamity_black_snow.*Math\.min\(Number\(card\.debuffDamageCap\).*enemyDebuffCount\(state\)\).*Number\(card\.debuffDamageBonus\)/s), 'Simulator should apply 黑雪预兆 debuff-type damage');
assert(hasPattern(html, /w_exec_line.*state\.enemy\.vuln \+= 2.*cardsPlayedThisTurn > 1.*drawCards\(Number\(card\.drawOnCombo\)/s), 'HTML should apply 银线破甲 pre-hit vulnerability and combo draw');
assert(hasPattern(simulator, /w_exec_line.*state\.enemy\.vuln \+= 2.*state\.cardsPlayed > 0.*draw\(state, Number\(card\.drawOnCombo\)/s), 'Simulator should apply 银线破甲 pre-hit vulnerability and combo draw');
assert(hasPattern(html, /w_blood_drum.*state\.p_dmg_buff \+= Number\(card\.turnDamageBonus\)/s), 'HTML should apply 血鼓战誓 turn damage bonus');
assert(hasPattern(simulator, /w_blood_drum.*state\.turnDamage \+= Number\(card\.turnDamageBonus\)/s), 'Simulator should apply 血鼓战誓 turn damage bonus');
assert(html.includes('drawOnExhaustPile') && simulator.includes('drawOnExhaustPile'), 'HTML and simulator should implement 归巢双令 conditional draw');
assert(html.includes('extraVulnerable') && simulator.includes('extraVulnerable'), 'HTML and simulator should implement 疫星坠落 explicit vulnerability');
assert(html.includes('triggerBloodletDrawRelic') && simulator.includes('triggerBloodletDrawRelic'), 'HTML and simulator should share 赤脉弦扣 battle behavior');
assert(html.includes("hasRelic('r_thorn_shield_new')) state.armor += 6"), 'HTML should grant 6 starting armor from 蔷薇重盾');
assert(simulator.includes("hasRelic(state, 'r_thorn_shield_new')) state.armor += 6"), 'Simulator should grant 6 starting armor from 蔷薇重盾');

console.log('Targeted balance patch guard: pass');
