#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILES = [
    'src/data/relics.js',
    'src/data/card-tags.js',
    'src/data/cards.js',
    'src/data/enemies.js',
    'src/data/characters.js'
];

function loadGameData() {
    const source = DATA_FILES.map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
    const context = vm.createContext({});
    vm.runInContext(`${source}\n;globalThis.__balanceData = {
        TAGS, BUILD_DIRECTIONS, CARD_BUILD_TAGS_BY_ID, NEUTRAL_CARD_POOL,
        CHARACTER_CARD_POOLS, SPECIAL_EPIC_POOLS, RELIC_POOL, RELIC_BUILD_TAGS_BY_ID,
        ENEMIES, CHARACTERS, getScaledCardValue,
        getAbilityPotency, getCardDrawCount, getCardHealValue,
        getCardChantGain, getProtectionValue, getWindGain, getSidestepGain
    };`, context);
    return context.__balanceData;
}

function parseArgs(argv) {
    const result = { runs: 2000, seed: 20260612, output: '', mode: 'baseline' };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--runs') result.runs = Number(argv[++i]);
        else if (argv[i] === '--seed') result.seed = Number(argv[++i]);
        else if (argv[i] === '--output') result.output = argv[++i];
        else if (argv[i] === '--mode') result.mode = argv[++i];
    }
    if (!Number.isFinite(result.runs) || result.runs < 100) throw new Error('--runs must be at least 100');
    if (!['baseline', 'mature'].includes(result.mode)) throw new Error('--mode must be baseline or mature');
    return result;
}

function createRng(seed) {
    let state = seed >>> 0;
    return () => {
        state += 0x6D2B79F5;
        let value = state;
        value = Math.imul(value ^ value >>> 15, value | 1);
        value ^= value + Math.imul(value ^ value >>> 7, value | 61);
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
}

function pick(rng, items) {
    return items[Math.floor(rng() * items.length)];
}

function shuffle(rng, items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const FOUNDATION = {
    hero_warrior: [
        { name: '基础斩击', type: '攻击', cost: 1, val: 8, tags: [], rarity: '普通' },
        { name: '基础防御', type: '防御', cost: 1, val: 7, tags: [], rarity: '普通' }
    ],
    hero_mage: [
        { name: '基础法弹', type: '攻击', cost: 1, val: 7, tags: ['爆发'], rarity: '普通' },
        { name: '基础愈流', type: '能力', cost: 1, val: 0, tags: ['治愈'], rarity: '普通' }
    ],
    hero_archer: [
        { name: '基础射击', type: '攻击', cost: 1, val: 6, tags: [], rarity: '普通' },
        { name: '林地回避', type: '能力', cost: 1, val: 1, tags: ['错身'], rarity: '普通' }
    ]
};

const CHECKPOINTS = [
    { id: 'early', label: '前期普通', floor: 3, type: 'normal' },
    { id: 'mid', label: '中期普通', floor: 8, type: 'normal' },
    { id: 'late', label: '后期普通', floor: 14, type: 'normal' },
    { id: 'elite', label: '后期精英', floor: 15, type: 'elite' },
    { id: 'boss', label: '最终首领', floor: 19, type: 'boss' }
];

const MATURE_LOADOUTS = {
    oathblade: {
        core: 'w_oath_fortress',
        relics: ['r_sword_oath', 'r_thorn_shield_new', 'r_protect_armor']
    },
    execution: {
        core: 'w_last_verdict',
        relics: ['r_pierce_amulet', 'r_heavy_badge', 'r_execute_scabbard']
    },
    bloodoath: {
        core: 'a_syn_blood',
        relics: ['r_blood_suture', 'r_lifedebt_scale', 'r_rupture_charm']
    },
    chant: {
        core: 'm_forbidden_comet',
        relics: ['r_sac_jade', 'r_burst_lens', 'r_chant_reservoir']
    },
    mirror: {
        core: 'm_echo_archive',
        relics: ['r_echo_mirror_relic', 'r_echo_archive_pin', 'r_double_quill']
    },
    calamity: {
        core: 'm_status_supernova',
        relics: ['r_plague_glass', 'r_hex_incense', 'r_status_ledger']
    },
    gale: {
        core: 'a_gale_verdict',
        relics: ['r_wind_quiver', 'r_tailwind_spool', 'r_multishot_fletching']
    },
    venom: {
        core: 's_poison',
        relics: ['r_poison_fang', 'r_bleed_knife', 'r_corrupt_cup']
    },
    exile: {
        core: 's_exhaust',
        relics: ['r_exile_cache', 'r_exhaust_dmg', 'r_return_knife']
    }
};

function cardBuildTags(data, card) {
    return card.buildTags || data.CARD_BUILD_TAGS_BY_ID[card.poolId || card.id] || [];
}

function getBuildPool(data, roleId, buildId) {
    return data.CHARACTER_CARD_POOLS[roleId]
        .filter(card => cardBuildTags(data, card).includes(buildId))
        .filter(card => !card.isSpecial);
}

function getLoadout(data, roleId, buildId, mode) {
    if (mode !== 'mature') return { core: null, coreCard: null, relics: [] };
    const loadout = MATURE_LOADOUTS[buildId];
    if (!loadout) throw new Error(`Missing mature loadout for ${buildId}`);
    const coreCard = data.SPECIAL_EPIC_POOLS[roleId].find(card => card.id === loadout.core);
    if (!coreCard) throw new Error(`Missing special core ${loadout.core}`);
    for (const relicId of loadout.relics) {
        if (!data.RELIC_POOL.some(relic => relic.id === relicId)) throw new Error(`Missing relic ${relicId}`);
    }
    return { ...loadout, coreCard };
}

function makeDeck(data, rng, roleId, buildId, buildCards = 8, foundationCards = 4, loadout = null) {
    const pool = getBuildPool(data, roleId, buildId);
    const deck = [];
    for (let i = 0; i < foundationCards; i++) deck.push(clone(FOUNDATION[roleId][i % FOUNDATION[roleId].length]));
    const choices = shuffle(rng, pool);
    for (let i = 0; i < buildCards; i++) deck.push(clone(choices[i % choices.length]));
    if (loadout?.coreCard) deck.push({ ...clone(loadout.coreCard), specialId: loadout.coreCard.id });
    return shuffle(rng, deck).map((card, index) => ({ ...card, simId: `${index}:${card.poolId || card.name}` }));
}

function upgradeRandomCard(rng, deck) {
    const candidates = deck.filter(card => !card.up && !card.isSpecial);
    if (!candidates.length) return;
    const card = pick(rng, candidates);
    card.up = true;
    card.rarity = '史诗';
    if ((Number(card.val) || 0) > 0) card.val *= 2;
}

function encounterPool(data, checkpoint) {
    if (checkpoint.type === 'boss') return data.ENEMIES.filter(enemy => enemy.type === 'boss');
    if (checkpoint.type === 'elite') return data.ENEMIES.filter(enemy => enemy.type === 'elite');
    const tier = checkpoint.floor < 5 ? 1 : checkpoint.floor < 12 ? 2 : 3;
    return data.ENEMIES.filter(enemy => enemy.tier === tier && !enemy.type);
}

function createEnemy(data, rng, checkpoint) {
    const template = clone(pick(rng, encounterPool(data, checkpoint)));
    const scale = 1 + checkpoint.floor * 0.15;
    template.maxHp = Math.floor(template.baseHp * scale);
    template.hp = template.maxHp;
    template.armor = 0;
    template.poison = 0;
    template.bleed = 0;
    template.burn = 0;
    template.stun = 0;
    template.curse = 0;
    template.vuln = 0;
    template.weak = 0;
    template.str = 0;
    template.thorns = 0;
    template.charged = false;
    template.minion = null;
    template.turn = 0;
    template.lastMove = -1;
    template.moves = template.moves.map(move => ({
        ...move,
        val: Math.floor(move.val * ((move.type.includes('attack') || ['defend', 'summon'].includes(move.type)) ? scale : 1))
    }));
    return template;
}

function createBattle(data, rng, roleId, deck, hp, checkpoint, loadout) {
    const character = data.CHARACTERS[roleId];
    const enemy = createEnemy(data, rng, checkpoint);
    const state = {
        data, rng, roleId, character, maxHp: character.maxHp, hp,
        energy: character.baseEnergy, armor: roleId === 'hero_warrior' ? 5 : 0,
        thorns: 0, protection: 0, counter: 0, chant: 0, aim: 0, sidestep: 0,
        battleDamage: 0, turnDamage: 0, nextDamage: 0, weak: 0, vuln: 0,
        poison: 0, bleed: 0, burn: 0, curse: 0,
        drawPile: shuffle(rng, deck.map(clone)), discard: [], exhaust: [], destroyed: [], hand: [], retained: [],
        lastCard: null, cardsPlayed: 0, enemy, encounterName: enemy.name, turns: 0,
        damageTaken: 0, healing: 0, relics: new Set(loadout?.relics || []),
        protectArmorUsed: false, chantReservoirUsed: false, tailwindSpoolUsed: false,
        echoArchivePinUsed: false, statusLedgerUsed: false, abilityCardsPlayed: 0,
        knifeSequence: 0
    };
    if (hasRelic(state, 'r_thorn_shield_new')) state.armor += 6;
    return state;
}

function hasRelic(state, relicId) {
    return state.relics.has(relicId);
}

function enemyDebuffCount(state) {
    return ['poison', 'bleed', 'burn', 'curse', 'vuln', 'weak', 'stun']
        .filter(key => state.enemy[key] > 0).length;
}

function addKnives(state, count) {
    for (let i = 0; i < count; i++) {
        state.hand.push({
            name: '归风飞刀', type: '攻击', cost: 0, val: 4, tags: ['销毁'], rarity: '普通',
            isKnife: true, simId: `knife:${state.knifeSequence++}`
        });
    }
}

function returnFromExhaust(state, destination) {
    if (!state.exhaust.length) return false;
    const card = state.exhaust.splice(Math.floor(state.rng() * state.exhaust.length), 1)[0];
    if (destination === 'hand') state.hand.push(card);
    else state.drawPile.push(card);
    if (hasRelic(state, 'r_return_knife')) addKnives(state, 1);
    return true;
}

function returnFromDiscard(state) {
    if (!state.discard.length) return false;
    state.hand.push(state.discard.splice(Math.floor(state.rng() * state.discard.length), 1)[0]);
    return true;
}

function applyRoleSynergy(state, card, echo, cycleReturned, resetCount) {
    if (echo || card.isJunk) return;
    const tags = card.tags || [];
    if (state.roleId === 'hero_warrior') {
        if (card.type === '防御' && tags.includes('保留')) state.armor += 3;
        if (tags.includes('庇护') && state.armor > 0) state.armor += 2;
        if (tags.includes('血祭')) state.armor += 5;
        if (tags.includes('荆棘') && state.armor > 0) state.thorns += Math.min(8, Math.max(2, Math.ceil(state.armor / 8)));
    } else if (state.roleId === 'hero_mage') {
        if (tags.includes('回响') || tags.includes('复刻')) state.chant = Math.min(9, state.chant + 1);
        if (['易伤', '虚弱', '剧毒', '出血', '燃烧', '诅咒'].some(tag => tags.includes(tag))) state.nextDamage += 2;
    } else if (state.roleId === 'hero_archer') {
        let windGain = 0;
        if (tags.includes('保留')) windGain++;
        if (tags.includes('放逐')) windGain++;
        if (tags.includes('重置') && resetCount > 0) windGain += Math.min(2, resetCount);
        if (cycleReturned) {
            windGain++;
            state.protection += 4;
        }
        if (windGain > 0) state.aim = Math.min(6, state.aim + windGain + (hasRelic(state, 'r_wind_quiver') ? 1 : 0));
    }
}

function draw(state, count) {
    for (let i = 0; i < count; i++) {
        if (!state.drawPile.length) {
            if (!state.discard.length) return;
            state.drawPile = shuffle(state.rng, state.discard);
            state.discard = [];
        }
        state.hand.push(state.drawPile.pop());
    }
}

function heal(state, amount) {
    if (state.curse > 0 || amount <= 0) return;
    const actual = Math.min(amount, state.maxHp - state.hp);
    state.hp += actual;
    state.healing += actual;
}

function hitEnemy(state, amount, pierce = false) {
    let damage = Math.max(0, Math.floor(amount));
    if (state.enemy.vuln > 0) damage = Math.floor(damage * (1 + state.enemy.vuln * 0.05));
    if (state.weak > 0) damage = Math.floor(damage * 0.75);
    if (state.enemy.minion?.hp > 0) {
        const blocked = Math.min(damage, state.enemy.minion.hp);
        state.enemy.minion.hp -= blocked;
        damage -= blocked;
    }
    if (damage <= 0) return 0;
    if (!pierce) {
        const blocked = Math.min(damage, state.enemy.armor);
        state.enemy.armor -= blocked;
        damage -= blocked;
    }
    state.enemy.hp -= damage;
    if (state.enemy.thorns > 0) takeDamage(state, state.enemy.thorns);
    return damage;
}

function takeDamage(state, amount) {
    let damage = Math.max(0, Math.floor(amount));
    if (state.protection > 0) {
        const reduced = Math.min(damage, state.protection);
        state.protection -= reduced;
        damage -= reduced;
    }
    if (state.sidestep > 0 && damage > 0) {
        damage -= Math.max(1, Math.floor(damage * 0.4));
        state.sidestep--;
        state.aim = Math.min(6, state.aim + 1);
    }
    if (state.counter > 0 && damage > 0) {
        const parry = Math.ceil(damage * 0.5);
        damage -= parry;
        state.counter = 0;
        hitEnemy(state, parry);
    }
    const blocked = Math.min(damage, state.armor);
    state.armor -= blocked;
    damage -= blocked;
    if (damage > 0 && hasRelic(state, 'r_protect_armor') && !state.protectArmorUsed) {
        state.protectArmorUsed = true;
        damage = Math.ceil(damage * 0.5);
    }
    if (damage > 0) {
        state.hp -= damage;
        state.damageTaken += damage;
    }
    if (amount > 0 && state.thorns > 0) state.enemy.hp -= state.thorns;
    return damage;
}

function estimateCard(state, card, incoming) {
    const tags = card.tags || [];
    const cost = Math.max(0.35, card.cost || 0);
    let score = 0;
    if (card.isSpecial) {
        const synergyCards = state.hand.filter(held => held !== card && (held.tags || []).some(tag => tags.includes(tag))).length;
        const specialScores = {
            w_oath_fortress: Math.min(incoming + 12, 25),
            w_last_verdict: 26 + state.enemy.vuln * 5 + synergyCards * 5,
            a_syn_blood: state.hp > 18 ? 18 + synergyCards * 10 : 3,
            m_forbidden_comet: 20 + state.chant * 7,
            m_echo_archive: state.lastCard ? 22 : 8,
            m_status_supernova: 10 + enemyDebuffCount(state) * 10,
            a_gale_verdict: 14 + Math.min(3, state.aim) * 8,
            s_poison: (state.enemy.poison + state.enemy.bleed) * 3 + 4,
            s_exhaust: state.exhaust.length * 8 + (state.exhaust.length ? 16 : 0)
        };
        score += specialScores[card.specialId] || 0;
    }
    let value = state.data.getScaledCardValue(card);
    if (tags.includes('重击')) value *= hasRelic(state, 'r_heavy_badge') ? 2.5 : 2;
    if (tags.includes('连击') && state.cardsPlayed > 0) value *= 1.5;
    let repeats = 1 + (tags.includes('连射') ? 1 : 0) + (tags.includes('多段') ? 1 : 0) + (tags.includes('回响') ? 1 : 0);
    if (card.type === '攻击') {
        if (tags.includes('爆发')) value += state.chant ? state.chant * 7 : 4;
        if (tags.includes('圣剑')) value += Math.floor(state.armor * (hasRelic(state, 'r_sword_oath') ? 0.6 : 0.5)) + state.counter * 4;
        score += value * repeats * (tags.includes('穿甲') ? 1.12 : 1);
        if (tags.includes('放血')) score += state.enemy.bleed * 3;
        if (tags.includes('吸血')) score += Math.min(state.maxHp - state.hp, value / 2) * 0.8;
    }
    if (card.type === '防御') score += Math.min(incoming + 8, value + (tags.includes('庇护') ? state.data.getProtectionValue(card) : 0)) * (incoming > 0 ? 1.25 : 0.45);
    if (tags.includes('治愈')) score += Math.min(state.maxHp - state.hp, state.data.getCardHealValue(card)) * 1.15;
    if (tags.includes('抽牌')) score += state.data.getCardDrawCount(card) * 5;
    if (tags.includes('充能') || tags.includes('自然')) score += 5;
    if (tags.includes('咏唱')) score += state.data.getCardChantGain(card) * 5;
    if (tags.includes('蓄力')) score += state.data.getWindGain(card) * 4;
    if (tags.includes('错身')) score += incoming > 0 ? 8 : 3;
    if (tags.includes('眩晕')) score += 13;
    if (tags.includes('虚弱')) score += incoming > 0 ? 8 : 4;
    if (tags.includes('易伤')) score += 7;
    if (tags.includes('剧毒')) score += 8;
    if (tags.includes('出血')) score += 7;
    if (tags.includes('燃烧')) score += 8;
    if (tags.includes('诅咒')) score += 4;
    if (tags.includes('血祭')) score += state.hp > 20 ? 7 : -20;
    if (tags.includes('复刻') && state.lastCard) score += 10;
    if (tags.includes('重置') && state.hand.length >= 4) score += 6;
    return score / cost;
}

function chooseMove(state) {
    const enemy = state.enemy;
    const opener = enemy.ai?.opener;
    if (enemy.turn === 0 && Number.isInteger(opener) && enemy.moves[opener]) return opener;
    const candidates = enemy.moves.map((move, index) => ({ move, index })).filter(entry => entry.index !== enemy.lastMove || enemy.moves.length === 1);
    const attackBias = enemy.ai?.aggression || 1;
    const weights = candidates.map(({ move }) => move.type.includes('attack') ? 3 * attackBias : move.type === 'charge' ? 1.2 : 1);
    let roll = state.rng() * weights.reduce((sum, value) => sum + value, 0);
    for (let i = 0; i < candidates.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return candidates[i].index;
    }
    return candidates[candidates.length - 1].index;
}

function expectedIncoming(state, move) {
    if (!move?.type?.includes('attack')) return state.enemy.minion?.atk || 0;
    let damage = (move.val + state.enemy.str) * (move.times || 1);
    if (state.enemy.weak > 0) damage *= 0.75;
    if (state.enemy.charged) damage *= 2;
    return Math.floor(damage) + (state.enemy.minion?.atk || 0);
}

function discardPlayedCard(state, card) {
    if (card.returnedBySpecial) {
        delete card.returnedBySpecial;
        return;
    }
    if ((card.tags || []).includes('销毁')) state.destroyed.push(card);
    else if ((card.tags || []).includes('放逐')) {
        state.exhaust.push(card);
        if (hasRelic(state, 'r_exhaust_dmg')) state.battleDamage += 2;
    }
    else if ((card.tags || []).includes('保留')) state.retained.push(card);
    else state.discard.push(card);
}

function executeSpecialCard(state, card) {
    const specialId = card.specialId || card.id;
    if (specialId === 'w_oath_fortress') {
        state.armor += 12;
        state.protection += 5 + (hasRelic(state, 'r_protect_armor') ? 3 : 0);
        if (state.hp < state.maxHp / 2) state.counter = 1;
    } else if (specialId === 'w_last_verdict') {
        const executionHand = state.hand.filter(held => (held.tags || []).some(tag => ['连击', '穿甲'].includes(tag))).length;
        hitEnemy(state, 20 + state.battleDamage + state.enemy.vuln * 5 + executionHand * 7, true);
    } else if (specialId === 'a_syn_blood') {
        const bloodHand = state.hand.filter(held => (held.tags || []).some(tag => ['血祭', '吸血', '出血', '放血'].includes(tag))).length;
        state.hp = Math.max(1, state.hp - bloodHand * 2);
        const dealt = hitEnemy(state, 6 + bloodHand * 12 + state.battleDamage);
        state.armor += Math.min(18, bloodHand * 3);
        let healing = Math.floor(dealt / 2);
        if (hasRelic(state, 'r_lifedebt_scale') && state.hp <= state.maxHp / 2) healing = Math.floor(healing * 1.5);
        heal(state, healing);
    } else if (specialId === 'm_forbidden_comet') {
        const chantSpent = state.chant;
        hitEnemy(state, 20 + state.battleDamage + chantSpent * 6, true);
        state.protection += Math.min(18, chantSpent * 3);
        state.chant = hasRelic(state, 'r_burst_lens') ? Math.ceil(chantSpent / 2) : 0;
    } else if (specialId === 'm_echo_archive') {
        if (state.lastCard && !state.lastCard.isJunk) executeCard(state, state.lastCard, true);
        else {
            state.chant = Math.min(12, state.chant + 2);
            draw(state, 1);
        }
    } else if (specialId === 'm_status_supernova') {
        const debuffs = enemyDebuffCount(state);
        hitEnemy(state, 8 + state.battleDamage + debuffs * 5);
        state.enemy.burn += Math.min(2, Math.max(1, debuffs));
    } else if (specialId === 'a_gale_verdict') {
        const shots = Math.min(3, state.aim);
        state.aim -= shots;
        hitEnemy(state, 12 + state.battleDamage + shots * 7, true);
        state.protection += shots * 3;
    } else if (specialId === 's_poison') {
        const layers = state.enemy.poison + state.enemy.bleed;
        hitEnemy(state, layers * 3);
        state.protection += Math.min(12, layers);
    } else if (specialId === 's_exhaust') {
        const returned = state.exhaust.length + 1;
        if (hasRelic(state, 'r_exhaust_dmg')) state.battleDamage += 2;
        hitEnemy(state, returned * 8);
        state.armor += Math.min(18, returned * 3);
        if (hasRelic(state, 'r_return_knife')) addKnives(state, returned);
        card.returnedBySpecial = true;
        state.drawPile = shuffle(state.rng, state.drawPile.concat(state.exhaust, [card]));
        state.exhaust = [];
    } else {
        return false;
    }
    return true;
}

function executeCard(state, card, echo = false) {
    const tags = card.tags || [];
    if (card.isSpecial && executeSpecialCard(state, card)) return;
    let cycleReturned = false;
    let resetCount = 0;
    if (tags.includes('血祭')) {
        state.hp = Math.max(1, state.hp - 4);
        state.battleDamage += card.up ? 5 : 3;
        if (hasRelic(state, 'r_blood_suture')) heal(state, 2);
    }
    if (tags.includes('庇护')) state.protection += state.data.getProtectionValue(card) + (hasRelic(state, 'r_protect_armor') ? 3 : 0);
    if (tags.includes('反击')) state.counter = 1;
    if (tags.includes('错身') && !echo) {
        let gain = state.data.getSidestepGain(card) + (hasRelic(state, 'r_wind_quiver') ? 1 : 0);
        if (hasRelic(state, 'r_tailwind_spool') && !state.tailwindSpoolUsed) {
            gain++;
            state.tailwindSpoolUsed = true;
        }
        state.sidestep = Math.min(3, state.sidestep + gain);
    }
    if (tags.includes('咏唱') && !echo) {
        let gain = state.data.getCardChantGain(card);
        if (hasRelic(state, 'r_chant_reservoir') && !state.chantReservoirUsed) {
            gain++;
            state.chantReservoirUsed = true;
        }
        state.chant = Math.min(12, state.chant + gain);
        state.armor += 4;
        if (hasRelic(state, 'r_sac_jade')) state.energy++;
    }
    if (tags.includes('蓄力') && !echo) {
        let gain = state.data.getWindGain(card) + (hasRelic(state, 'r_wind_quiver') ? 1 : 0);
        if (hasRelic(state, 'r_tailwind_spool') && !state.tailwindSpoolUsed) {
            gain++;
            state.tailwindSpoolUsed = true;
        }
        state.aim = Math.min(6, state.aim + gain);
    }
    if (tags.includes('自然') && !echo) {
        state.energy += 1;
        if (state.aim > 0) {
            state.protection += 3;
            draw(state, 1);
        }
    }
    if (tags.includes('充能')) state.energy += 1;
    if (tags.includes('治愈')) heal(state, state.data.getCardHealValue(card));
    if (tags.includes('抽牌') && !echo) draw(state, state.data.getCardDrawCount(card));
    if (tags.includes('荆棘')) state.thorns += hasRelic(state, 'r_thorn_shield_new') ? 16 : 8;
    const statusBonus = hasRelic(state, 'r_plague_glass') && card.type === '能力' && enemyDebuffCount(state) > 0 ? 1 : 0;
    if (tags.includes('剧毒')) state.enemy.poison += 3 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1) + statusBonus + (hasRelic(state, 'r_poison_fang') ? 1 : 0);
    if (tags.includes('出血')) state.enemy.bleed += 3 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1) + statusBonus + (hasRelic(state, 'r_poison_fang') ? 1 : 0);
    if (tags.includes('燃烧')) state.enemy.burn += (card.type === '能力' ? state.data.getAbilityPotency(card) : 1) + statusBonus;
    if (tags.includes('诅咒')) {
        state.enemy.curse += 2 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1) + statusBonus;
        if (hasRelic(state, 'r_hex_incense')) state.enemy.weak++;
    }
    if (tags.includes('易伤')) state.enemy.vuln += 2 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1);
    if (tags.includes('虚弱')) state.enemy.weak += 2 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1);
    if (tags.includes('眩晕')) state.enemy.stun += 1;
    if (tags.includes('招魂') && !echo) cycleReturned = returnFromExhaust(state, 'hand') || cycleReturned;
    if (tags.includes('轮回') && !echo) cycleReturned = returnFromExhaust(state, 'draw') || cycleReturned;
    if (tags.includes('拾遗') && !echo) cycleReturned = returnFromDiscard(state) || cycleReturned;
    if (tags.includes('放血') && state.enemy.bleed > 0) {
        hitEnemy(state, state.enemy.bleed * (hasRelic(state, 'r_bleed_knife') ? 5 : 3), true);
        state.enemy.bleed = hasRelic(state, 'r_rupture_charm') ? 2 : 0;
    }
    if (card.type === '防御') state.armor += state.data.getScaledCardValue(card);
    if (card.type === '攻击') {
        let value = state.data.getScaledCardValue(card);
        if (tags.includes('重击')) value *= hasRelic(state, 'r_heavy_badge') ? 2.5 : 2;
        if (tags.includes('连击') && state.cardsPlayed > 0 && !echo) value = Math.floor(value * 1.5);
        let damage = value + state.battleDamage + state.turnDamage;
        if (tags.includes('放逐')) damage += Math.max(5, Math.floor(value * (hasRelic(state, 'r_exile_cache') ? 0.75 : 0.5)));
        if (tags.includes('圣剑')) damage += Math.floor(state.armor * (hasRelic(state, 'r_sword_oath') ? 0.6 : 0.5)) + state.counter * 4;
        if (tags.includes('爆发')) {
            const chantSpent = state.chant;
            damage += chantSpent > 0 ? chantSpent * 7 : 4;
            state.protection += Math.min(8, chantSpent);
            state.chant = 0;
        }
        if (state.nextDamage > 0) {
            damage += state.nextDamage;
            state.nextDamage = 0;
        }
        if (state.aim > 0 && !echo) {
            state.aim--;
            state.protection += 3;
            hitEnemy(state, Math.max(3, Math.ceil(value * 0.4)), tags.includes('穿甲'));
        }
        if (hasRelic(state, 'r_multishot_fletching') && tags.includes('多段')) damage += 2;
        const pierce = tags.includes('穿甲');
        if (pierce && hasRelic(state, 'r_pierce_amulet')) damage = Math.floor(damage * 1.25);
        const dealt = hitEnemy(state, damage, pierce);
        if (pierce && tags.includes('重击') && state.enemy.vuln > 0 && hasRelic(state, 'r_execute_scabbard')) hitEnemy(state, 8, true);
        if (tags.includes('吸血')) {
            let healing = card.rarity === '史诗' ? dealt : Math.floor(dealt / 2);
            if (hasRelic(state, 'r_lifedebt_scale') && state.hp <= state.maxHp / 2) healing = Math.floor(healing * 1.5);
            heal(state, healing);
        }
    }
    if (tags.includes('复刻') && state.lastCard && !echo) executeCard(state, state.lastCard, true);
    if (tags.includes('重置') && !echo) {
        state.discard.push(...state.hand);
        const count = state.hand.length;
        resetCount = count;
        state.hand = [];
        draw(state, count);
    }
    if (hasRelic(state, 'r_status_ledger') && enemyDebuffCount(state) >= 4 && card.type === '能力' && !state.statusLedgerUsed && !echo) {
        state.statusLedgerUsed = true;
        draw(state, 1);
    }
    applyRoleSynergy(state, card, echo, cycleReturned, resetCount);
}

function playPlayerTurn(state, move) {
    state.energy = state.character.baseEnergy;
    state.cardsPlayed = 0;
    state.abilityCardsPlayed = 0;
    state.turnDamage = 0;
    state.protection = 0;
    state.chantReservoirUsed = false;
    state.tailwindSpoolUsed = false;
    state.echoArchivePinUsed = false;
    state.statusLedgerUsed = false;
    state.hand.push(...state.retained);
    state.retained = [];
    draw(state, state.character.openingHand);
    let safety = 0;
    while (safety++ < 30 && state.enemy.hp > 0 && state.hp > 0) {
        const incoming = expectedIncoming(state, move);
        const playable = state.hand.filter(card => (card.cost || 0) <= state.energy);
        if (!playable.length) break;
        const ranked = playable.map(card => ({ card, score: estimateCard(state, card, incoming) })).sort((a, b) => b.score - a.score);
        if (ranked[0].score < 1) break;
        const card = ranked[0].card;
        state.hand.splice(state.hand.indexOf(card), 1);
        state.energy -= card.cost || 0;
        let specialWindRun = 0;
        if (card.isSpecial && card.type === '攻击' && state.aim > 0) {
            state.aim--;
            state.protection += 3;
            specialWindRun = 1;
        }
        if (card.type === '能力') {
            state.abilityCardsPlayed++;
            if (hasRelic(state, 'r_double_quill') && state.abilityCardsPlayed === 2) draw(state, 1);
        }
        executeCard(state, card, false);
        if (state.hp <= 0 || state.enemy.hp <= 0) break;
        if ((card.tags || []).includes('回响')) {
            executeCard(state, card, true);
            if (hasRelic(state, 'r_echo_archive_pin') && !state.echoArchivePinUsed) {
                state.echoArchivePinUsed = true;
                state.energy++;
            }
            if (hasRelic(state, 'r_echo_mirror_relic')) executeCard(state, card, true);
        }
        if (state.hp <= 0 || state.enemy.hp <= 0) break;
        const extraRuns = specialWindRun + ((card.tags || []).includes('连射') ? 1 : 0) + ((card.tags || []).includes('多段') ? 1 : 0);
        for (let i = 0; i < extraRuns && state.enemy.hp > 0; i++) executeCard(state, card, true);
        discardPlayedCard(state, card);
        if (!(card.tags || []).includes('复刻')) state.lastCard = card;
        state.cardsPlayed++;
    }
    state.discard.push(...state.hand.filter(card => !(card.tags || []).includes('保留')));
    state.retained.push(...state.hand.filter(card => (card.tags || []).includes('保留')));
    state.hand = [];
}

function applyEnemyMove(state, move) {
    const enemy = state.enemy;
    if (enemy.minion?.hp > 0) takeDamage(state, enemy.minion.atk);
    if (enemy.stun > 0) {
        enemy.stun--;
        return;
    }
    if (move.type.includes('attack')) {
        let damage = move.val + enemy.str;
        if (enemy.weak > 0) damage = Math.floor(damage * 0.75);
        if (enemy.charged) {
            damage *= 2;
            enemy.charged = false;
        }
        for (let i = 0; i < (move.times || 1); i++) {
            const dealt = takeDamage(state, damage);
            if (move.type === 'attack_lifesteal' && enemy.curse <= 0) enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(dealt / 2));
            if (state.hp <= 0 || enemy.hp <= 0) break;
        }
    } else if (move.type === 'defend') enemy.armor += move.val;
    else if (move.type === 'buff') enemy.str += move.val;
    else if (move.type === 'buff_thorns') enemy.thorns += move.val;
    else if (move.type === 'charge') enemy.charged = true;
    else if (move.type === 'summon') enemy.minion = { hp: move.val, atk: move.atk || 5 };
    else if (move.type === 'junk') {
        for (let i = 0; i < move.val; i++) state.discard.push({ name: '诅咒', type: '能力', cost: 99, val: 0, tags: [], isJunk: true });
    } else if (move.type === 'seal') {
        for (let i = 0; i < move.val && state.drawPile.length; i++) state.drawPile[Math.floor(state.rng() * state.drawPile.length)].cost += 1;
    } else if (move.type === 'debuff') {
        const key = move.subType;
        if (key === 'weak') state.weak += move.val;
        else if (key === 'vuln') state.vuln += move.val;
        else if (key === 'poison') state.poison += move.val;
        else if (key === 'bleed') state.bleed += move.val;
        else if (key === 'burn') state.burn += move.val;
        else if (key === 'curse') state.curse += move.val;
        else if (key === 'stun') takeDamage(state, 3 * move.val);
    }
}

function endRound(state) {
    const enemy = state.enemy;
    if (enemy.poison > 0) {
        enemy.hp -= enemy.poison;
        if (hasRelic(state, 'r_corrupt_cup')) heal(state, 2);
        enemy.poison--;
    }
    if (enemy.bleed > 0) {
        enemy.hp -= Math.ceil(enemy.bleed / 2);
        enemy.bleed--;
    }
    if (enemy.burn > 0) {
        enemy.hp -= Math.max(1, Math.ceil(enemy.maxHp * 0.03 * enemy.burn));
        enemy.burn--;
    }
    if (state.poison > 0) {
        takeDamage(state, state.poison);
        state.poison--;
    }
    if (state.bleed > 0) {
        takeDamage(state, Math.ceil(state.bleed / 2));
        state.bleed--;
    }
    if (state.burn > 0) {
        takeDamage(state, Math.max(1, Math.ceil(state.maxHp * 0.03 * state.burn)));
        state.burn--;
    }
    if (enemy.vuln > 0) enemy.vuln--;
    if (enemy.weak > 0) enemy.weak--;
    if (enemy.curse > 0) enemy.curse--;
    if (state.weak > 0) state.weak--;
    if (state.vuln > 0) state.vuln--;
    if (state.curse > 0) state.curse--;
}

function resolveEnemyDeath(state) {
    const enemy = state.enemy;
    if (enemy.hp > 0) return false;
    if (enemy.revives > 0) {
        enemy.revives--;
        enemy.hp = Math.floor(enemy.maxHp * enemy.reviveRatio);
        return false;
    }
    if (enemy.phase2 && !enemy.isPhase2) {
        const phase = clone(enemy.phase2);
        enemy.isPhase2 = true;
        enemy.name = phase.name;
        enemy.icon = phase.icon;
        enemy.maxHp = phase.maxHp;
        enemy.hp = phase.maxHp;
        enemy.ai = phase.ai;
        enemy.moves = phase.moves;
        enemy.turn = 0;
        enemy.lastMove = -1;
        enemy.armor = 0;
        enemy.minion = null;
        return false;
    }
    return true;
}

function simulateBattle(data, rng, roleId, deck, hp, checkpoint, loadout) {
    const state = createBattle(data, rng, roleId, deck, hp, checkpoint, loadout);
    while (state.turns++ < 30 && state.hp > 0) {
        const moveIndex = chooseMove(state);
        const move = state.enemy.moves[moveIndex];
        playPlayerTurn(state, move);
        if (resolveEnemyDeath(state)) return { win: true, hp: state.hp, turns: state.turns, enemy: state.encounterName, damageTaken: state.damageTaken };
        if (state.hp <= 0) break;
        applyEnemyMove(state, move);
        if (resolveEnemyDeath(state)) return { win: true, hp: state.hp, turns: state.turns, enemy: state.encounterName, damageTaken: state.damageTaken };
        if (state.hp <= 0) break;
        endRound(state);
        if (resolveEnemyDeath(state)) return { win: true, hp: state.hp, turns: state.turns, enemy: state.encounterName, damageTaken: state.damageTaken };
        state.enemy.lastMove = moveIndex;
        state.enemy.turn++;
    }
    return { win: false, hp: Math.max(0, state.hp), turns: state.turns, enemy: state.encounterName, damageTaken: state.damageTaken };
}

function simulateCheckpoint(data, roleId, buildId, checkpoint, runs, seed, mode) {
    let wins = 0;
    let turns = 0;
    let hpLeft = 0;
    const enemies = {};
    const loadout = getLoadout(data, roleId, buildId, mode);
    for (let i = 0; i < runs; i++) {
        const rng = createRng(seed + i * 7919);
        const deckSize = checkpoint.id === 'early' ? [5, 5] : checkpoint.id === 'mid' ? [7, 4] : [10, 3];
        const deck = makeDeck(data, rng, roleId, buildId, deckSize[0], deckSize[1], loadout);
        if (['late', 'elite', 'boss'].includes(checkpoint.id)) upgradeRandomCard(rng, deck);
        const result = simulateBattle(data, rng, roleId, deck, data.CHARACTERS[roleId].maxHp, checkpoint, loadout);
        wins += result.win ? 1 : 0;
        turns += result.turns;
        hpLeft += result.hp;
        enemies[result.enemy] ||= { games: 0, wins: 0 };
        enemies[result.enemy].games++;
        enemies[result.enemy].wins += result.win ? 1 : 0;
    }
    return {
        winRate: wins / runs,
        averageTurns: turns / runs,
        averageHpLeft: hpLeft / runs,
        enemies
    };
}

function simulateExpedition(data, roleId, buildId, runs, seed, mode) {
    let clears = 0;
    let reached = Array(CHECKPOINTS.length).fill(0);
    let deaths = {};
    const loadout = getLoadout(data, roleId, buildId, mode);
    for (let i = 0; i < runs; i++) {
        const rng = createRng(seed + i * 104729);
        let deck = makeDeck(data, rng, roleId, buildId, 4, 6, loadout);
        let hp = data.CHARACTERS[roleId].maxHp;
        let cleared = true;
        for (let c = 0; c < CHECKPOINTS.length; c++) {
            reached[c]++;
            const checkpoint = CHECKPOINTS[c];
            const result = simulateBattle(data, rng, roleId, deck, hp, checkpoint, loadout);
            if (!result.win) {
                deaths[checkpoint.id] = (deaths[checkpoint.id] || 0) + 1;
                cleared = false;
                break;
            }
            hp = Math.min(data.CHARACTERS[roleId].maxHp, result.hp + Math.ceil(data.CHARACTERS[roleId].maxHp * 0.22));
            const pool = getBuildPool(data, roleId, buildId).filter(card => !deck.some(owned => owned.poolId === card.poolId));
            if (pool.length) deck.push(clone(pick(rng, pool)));
            if (c >= 1) upgradeRandomCard(rng, deck);
        }
        if (cleared) clears++;
    }
    return { clearRate: clears / runs, reached, deaths };
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const data = loadGameData();
    const results = [];
    let buildIndex = 0;
    for (const [roleId, builds] of Object.entries(data.BUILD_DIRECTIONS)) {
        for (const [buildId, build] of Object.entries(builds)) {
            const loadout = getLoadout(data, roleId, buildId, args.mode);
            const entry = {
                roleId, role: data.CHARACTERS[roleId].name, buildId, build: build.name,
                loadout: {
                    core: loadout.coreCard ? { id: loadout.coreCard.id, name: loadout.coreCard.name } : null,
                    relics: loadout.relics.map(id => {
                        const relic = data.RELIC_POOL.find(item => item.id === id);
                        return { id, name: relic.name };
                    })
                },
                checkpoints: {}
            };
            for (let i = 0; i < CHECKPOINTS.length; i++) {
                entry.checkpoints[CHECKPOINTS[i].id] = simulateCheckpoint(data, roleId, buildId, CHECKPOINTS[i], args.runs, args.seed + buildIndex * 1000003 + i * 10007, args.mode);
            }
            entry.expedition = simulateExpedition(data, roleId, buildId, args.runs, args.seed + buildIndex * 2000003, args.mode);
            results.push(entry);
            buildIndex++;
        }
    }
    const report = {
        generatedAt: new Date().toISOString(),
        model: args.mode === 'mature' ? 'mature build with epic core and relics v2' : 'card-build baseline v1',
        mode: args.mode,
        runsPerBuildAndCheckpoint: args.runs,
        seed: args.seed,
        checkpoints: CHECKPOINTS,
        results
    };
    if (args.output) fs.writeFileSync(path.resolve(ROOT, args.output), `${JSON.stringify(report, null, 2)}\n`);

    console.log(`Build balance simulation (${args.mode}): ${args.runs} runs per checkpoint, seed ${args.seed}`);
    console.log('职业\t构筑\t前期\t中期\t后期\t精英\t首领\t远征通关');
    for (const entry of results) {
        console.log([
            entry.role, entry.build,
            ...CHECKPOINTS.map(checkpoint => pct(entry.checkpoints[checkpoint.id].winRate)),
            pct(entry.expedition.clearRate)
        ].join('\t'));
    }
}

run();
