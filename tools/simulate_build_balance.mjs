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
        TAGS, BUILD_DIRECTIONS, CARD_BUILD_TAGS_BY_ID, NEUTRAL_CARD_POOL, STARTER_DECKS,
        CHARACTER_CARD_POOLS, SPECIAL_EPIC_POOLS, ROLE_CARD_TAG_POLICY_DROPS, RELIC_POOL, RELIC_BUILD_TAGS_BY_ID,
        COMMON_RELIC_IDS, ROLE_RELIC_IDS, STARTING_RELIC_BY_ROLE, STARTING_RELIC_IDS, RELIC_CARD_REWARD_BONUS_BY_ID,
        ENEMIES, CHARACTERS, getScaledCardValue,
        getAbilityPotency, getCardDrawCount, getCardHealValue,
        getCardChantGain, getProtectionValue, getWindGain, getSidestepGain,
        getCardRecycleModes, hasDirectCardEffect
    };`, context);
    return context.__balanceData;
}

function parseArgs(argv) {
    const result = { runs: 2000, seed: 20260612, output: '', mode: 'pure' };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--runs') result.runs = Number(argv[++i]);
        else if (argv[i] === '--seed') result.seed = Number(argv[++i]);
        else if (argv[i] === '--output') result.output = argv[++i];
        else if (argv[i] === '--mode') result.mode = argv[++i];
    }
    if (!Number.isFinite(result.runs) || result.runs < 100) throw new Error('--runs must be at least 100');
    if (result.mode === 'baseline') result.mode = 'pure';
    if (!['pure', 'mid', 'mature'].includes(result.mode)) throw new Error('--mode must be pure, mid or mature');
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
        { name: '林地回避', type: '能力', cost: 1, val: 1, tags: ['闪避'], buildNeutral: true, sidestepVal: 1, rarity: '普通' }
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
        relics: ['r_poison_fang', 'r_bleed_knife', 'r_bloodlet_draw']
    },
    exile: {
        core: 's_exhaust',
        relics: ['r_exile_cache', 'r_exhaust_dmg', 'r_return_knife']
    }
};

const MIDGAME_RELICS = {
    oathblade: 'r_sword_oath',
    execution: 'r_pierce_amulet',
    bloodoath: 'r_blood_suture',
    chant: 'r_sac_jade',
    mirror: 'r_echo_archive_pin',
    calamity: 'r_plague_glass',
    gale: 'r_wind_quiver',
    venom: 'r_poison_fang',
    exile: 'r_exile_cache'
};

const BLOOD_DEBT_WINDOW_TURNS = 3;
const BLOOD_DEBT_ATTACK_HP_LOSS = 3;

function cardBuildTags(data, card) {
    return card.buildTags || data.CARD_BUILD_TAGS_BY_ID[card.poolId || card.id] || [];
}

function getBuildPool(data, roleId, buildId) {
    return data.CHARACTER_CARD_POOLS[roleId]
        .filter(card => cardBuildTags(data, card).includes(buildId))
        .filter(card => !card.isSpecial);
}

function getLoadout(data, roleId, buildId, mode, override = null) {
    if (override) {
        const coreCard = override.core
            ? data.SPECIAL_EPIC_POOLS[roleId].find(card => card.id === override.core)
            : null;
        return { core: override.core || null, coreCard, relics: [...(override.relics || [])] };
    }
    if (mode === 'pure' || mode === 'baseline') return { core: null, coreCard: null, relics: [] };
    if (mode === 'mid') {
        const relicId = MIDGAME_RELICS[buildId];
        if (!relicId || !data.RELIC_POOL.some(relic => relic.id === relicId)) throw new Error(`Missing midgame relic for ${buildId}`);
        return { core: null, coreCard: null, relics: [relicId] };
    }
    const loadout = MATURE_LOADOUTS[buildId];
    if (!loadout) throw new Error(`Missing mature loadout for ${buildId}`);
    const coreCard = data.SPECIAL_EPIC_POOLS[roleId].find(card => card.id === loadout.core);
    if (!coreCard) throw new Error(`Missing special core ${loadout.core}`);
    for (const relicId of loadout.relics) {
        if (!data.RELIC_POOL.some(relic => relic.id === relicId)) throw new Error(`Missing relic ${relicId}`);
    }
    return { ...loadout, coreCard };
}

function cloneForSimulation(card, disabledTags = null) {
    const result = clone(card);
    if (disabledTags?.size && result.tags && !result.isSpecial) {
        result.tags = result.tags.filter(tag => !disabledTags.has(tag));
    }
    if (disabledTags?.has('血债') && !result.isSpecial) {
        for (const key of [
            'bloodDebtGain', 'bloodDebtPowerGain',
            'bloodDebtDamageRatio', 'bloodDebtRepay', 'bloodDebtRepayFromBleed',
            'bloodDebtSpendAll', 'bloodDebtSpendDamage', 'bloodDebtClearDamage',
            'bloodDebtClearHeal', 'bloodDebtDrawOnRepay', 'bloodDebtBleed',
            'bloodDebtWeak', 'bloodDebtStun'
        ]) delete result[key];
    }
    return result;
}

function makeDeck(data, rng, roleId, buildId, buildCards = 8, foundationCards = 4, loadout = null, disabledTags = null) {
    const pool = getBuildPool(data, roleId, buildId);
    const deck = [];
    for (let i = 0; i < foundationCards; i++) deck.push(cloneForSimulation(FOUNDATION[roleId][i % FOUNDATION[roleId].length], disabledTags));
    const choices = shuffle(rng, pool);
    for (let i = 0; i < buildCards; i++) deck.push(cloneForSimulation(choices[i % choices.length], disabledTags));
    if (loadout?.coreCard) deck.push({ ...cloneForSimulation(loadout.coreCard, disabledTags), specialId: loadout.coreCard.id });
    return shuffle(rng, deck).map((card, index) => ({ ...card, simId: `${index}:${card.poolId || card.name}` }));
}

function makeStarterDeck(data, rng, roleId, loadout = null, disabledTags = null) {
    const starterDeckId = data.CHARACTERS[roleId]?.starterDeckId;
    const starter = data.STARTER_DECKS[starterDeckId];
    if (!starter) throw new Error(`Missing starter deck ${starterDeckId} for ${roleId}`);
    const deck = starter.cards.flatMap(card => Array.from(
        { length: Math.max(1, Number(card.copies) || 1) },
        () => cloneForSimulation(card, disabledTags)
    ));
    if (loadout?.coreCard) deck.push({ ...cloneForSimulation(loadout.coreCard, disabledTags), specialId: loadout.coreCard.id });
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

function encounterScale(checkpoint) {
    if (checkpoint.type === 'boss') return 1 + checkpoint.floor * 0.058;
    if (checkpoint.type === 'elite') return 1 + checkpoint.floor * 0.085;
    return 1 + checkpoint.floor * 0.1;
}

function createEnemy(data, rng, checkpoint, enemyName = null) {
    const pool = encounterPool(data, checkpoint);
    const selected = enemyName ? pool.find(enemy => enemy.name === enemyName) : pick(rng, pool);
    if (!selected) throw new Error(`Enemy ${enemyName} is not available at checkpoint ${checkpoint.id}`);
    const template = clone(selected);
    const scale = encounterScale(checkpoint);
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

function createBattle(data, rng, roleId, deck, hp, checkpoint, loadout, options = {}) {
    const character = data.CHARACTERS[roleId];
    const enemy = createEnemy(data, rng, checkpoint, options.enemyName);
    const relicIds = [...(loadout?.relics || [])];
    const startingRelicId = data.STARTING_RELIC_BY_ROLE[roleId];
    if (startingRelicId && !relicIds.includes(startingRelicId)) relicIds.push(startingRelicId);
    const state = {
        data, rng, roleId, character, maxHp: character.maxHp, hp,
        energy: character.baseEnergy, armor: roleId === 'hero_warrior' ? 5 : 0,
        thorns: 0, protection: 0, counter: 0, chant: 0, aim: 0, sidestep: 0,
        battleDamage: 0, turnDamage: 0, nextDamage: 0, weak: 0, vuln: 0,
        bloodDebt: 0, bloodDebtTurns: 0, bloodDebtPendingDamage: 0, bloodDebtPaid: 0, bloodDebtPower: 1,
        poison: 0, bleed: 0, burn: 0, curse: 0,
        drawPile: shuffle(rng, deck.map(clone)), discard: [], exhaust: [], destroyed: [], hand: [], retained: [],
        lastCard: null, cardsPlayed: 0, enemy, encounterName: enemy.name, turns: 0,
        damageTaken: 0, healing: 0, relics: new Set(relicIds),
        totalDamageDealt: 0, energyWasted: 0, lastDamageCause: null, lastEnemyDamageSource: null,
        cardOpportunities: {}, cardPlays: {}, cardMeta: {},
        playStyle: { attacks: 0, defenses: 0, abilities: 0, setup: 0, burst: 0, sustain: 0, control: 0, cycle: 0 },
        discardCount: 0,
        protectArmorUsed: false, chantReservoirUsed: false, tailwindSpoolUsed: false,
        echoArchivePinUsed: false, statusLedgerUsed: false, exileCacheSidestepUsed: false, abilityCardsPlayed: 0,
        bloodDebtReductionUsed: false, bloodClearUsed: false, scarletWhetUsed: false, oathTransfusionUsed: false, lifedebtClearUsed: false,
        knifeSequence: 0, signatureSetupUsed: false, signatureAttackReady: false,
        warriorStartUsed: false, warriorStartReady: false, crownOath: false
    };
    if (hasRelic(state, 'r_thorn_shield_new')) state.armor += 6;
    return state;
}

function hasRelic(state, relicId) {
    return state.relics.has(relicId);
}

function applyEnemyTypeDamageBonus(state, amount) {
    let damage = Math.max(0, Math.floor(amount));
    if (state.enemy?.type === 'elite' && hasRelic(state, 'r_elite_hunter')) damage = Math.floor(damage * 1.15);
    if (state.enemy?.type === 'boss' && hasRelic(state, 'r_boss_slayer')) damage = Math.floor(damage * 1.2);
    return damage;
}

function addBloodDebt(state, amount) {
    let gain = Math.max(0, Math.floor(Number(amount) || 0));
    if (gain <= 0) return 0;
    if (hasRelic(state, 'r_blood_suture') && !state.bloodDebtReductionUsed) {
        state.bloodDebtReductionUsed = true;
        gain = Math.max(0, gain - 2);
        state.turnDamage += 4;
    }
    state.bloodDebt = Math.min(40, state.bloodDebt + gain);
    if (gain > 0) state.bloodDebtTurns = BLOOD_DEBT_WINDOW_TURNS;
    if (hasRelic(state, 'r_scarlet_whet') && !state.scarletWhetUsed) {
        state.scarletWhetUsed = true;
        state.turnDamage += 3;
    }
    return gain;
}

function repayBloodDebt(state, amount) {
    const before = state.bloodDebt;
    const paid = Math.min(before, Math.max(0, Math.floor(Number(amount) || 0)));
    if (paid <= 0) return { paid: 0, cleared: false };
    state.bloodDebt -= paid;
    state.bloodDebtPaid += paid;
    const cleared = before > 0 && state.bloodDebt === 0;
    if (cleared) {
        state.bloodDebtTurns = 0;
        state.bloodDebtPendingDamage = 0;
    }
    if (cleared && hasRelic(state, 'r_bloodoath_contract') && !state.bloodClearUsed) {
        state.bloodClearUsed = true;
        state.battleDamage += Math.min(4, Math.max(1, Math.floor(state.bloodDebtPaid / 3)));
    }
    if (cleared && hasRelic(state, 'r_oath_transfusion') && !state.oathTransfusionUsed) {
        state.oathTransfusionUsed = true;
        state.energy++;
    }
    if (cleared && hasRelic(state, 'r_lifedebt_scale') && state.hp <= state.maxHp / 2 && !state.lifedebtClearUsed) {
        state.lifedebtClearUsed = true;
        heal(state, 6);
    }
    return { paid, cleared };
}

function settleBloodDebt(state) {
    if (state.bloodDebt <= 0) {
        state.bloodDebtTurns = 0;
        state.bloodDebtPendingDamage = 0;
        return 0;
    }
    state.bloodDebtTurns = Math.max(0, (state.bloodDebtTurns || 1) - 1);
    if (state.bloodDebtTurns > 0) return 0;
    const pending = Math.max(0, Math.floor(state.bloodDebtPendingDamage || 0));
    const actual = Math.min(Math.max(0, state.hp), pending);
    state.hp -= actual;
    state.damageTaken += actual;
    if (actual > 0) state.lastDamageCause = '血债清算';
    state.bloodDebt = 0;
    state.bloodDebtTurns = 0;
    state.bloodDebtPendingDamage = 0;
    return actual;
}

function payBloodDebtAttackCost(state) {
    if (state.bloodDebt <= 0) return 0;
    const actual = Math.min(Math.max(0, state.hp - 1), BLOOD_DEBT_ATTACK_HP_LOSS);
    state.hp -= actual;
    state.bloodDebtPendingDamage = (state.bloodDebtPendingDamage || 0) + actual;
    state.damageTaken += actual;
    if (actual > 0) state.lastDamageCause = '血债攻势';
    return actual;
}

function enemyDebuffCount(state) {
    return ['poison', 'bleed', 'burn', 'curse', 'vuln', 'weak', 'stun']
        .filter(key => state.enemy[key] > 0).length;
}

function cardMetricKey(card) {
    return card.poolId || card.specialId || card.id || card.name;
}

function recordCardOpportunity(state, card) {
    const key = cardMetricKey(card);
    state.cardOpportunities[key] = (state.cardOpportunities[key] || 0) + 1;
    state.cardMeta[key] ||= { name: card.name, cost: card.cost || 0, type: card.type, tags: [...(card.tags || [])], directEffects: { ...(card.directEffects || {}) } };
}

function recordCardPlay(state, card) {
    const key = cardMetricKey(card);
    state.cardPlays[key] = (state.cardPlays[key] || 0) + 1;
    state.cardMeta[key] ||= { name: card.name, cost: card.cost || 0, type: card.type, tags: [...(card.tags || [])], directEffects: { ...(card.directEffects || {}) } };
    if (card.type === '攻击') state.playStyle.attacks++;
    else if (card.type === '防御') state.playStyle.defenses++;
    else state.playStyle.abilities++;
    const tags = card.tags || [];
    if (tags.some(tag => ['咏唱', '蓄力', '血祭', '血债', '自然'].includes(tag)) || card.bloodDebtGain) state.playStyle.setup++;
    if (tags.some(tag => ['爆发', '重击', '穿甲', '追击', '放血', '圣剑'].includes(tag))) state.playStyle.burst++;
    if (tags.some(tag => ['庇护', '反击', '闪避', '吸血', '荆棘', '治愈', '保留'].includes(tag)) || card.bloodDebtRepay || card.bloodDebtRepayFromBleed) state.playStyle.sustain++;
    if (tags.some(tag => ['剧毒', '出血', '燃烧', '眩晕', '诅咒', '易伤', '虚弱'].includes(tag))) state.playStyle.control++;
    if (tags.some(tag => ['抽牌', '充能', '重置', '回响', '复刻', '回收', '放逐', '销毁'].includes(tag))) state.playStyle.cycle++;
}

function cardHasBuildTag(state, card, buildTag) {
    if (!card) return false;
    const cardId = card.poolId || card.specialId || card.id;
    const buildTags = card.buildTags || state.data.CARD_BUILD_TAGS_BY_ID?.[cardId] || [];
    return buildTags.includes(buildTag);
}

function getExileFlowDamage(state, card, eventType) {
    if (!card || card.isJunk || card.isKnife || state.roleId !== 'hero_archer') return 0;
    if (!cardHasBuildTag(state, card, 'exile')) return 0;
    const baseByEvent = { discard: 3, exhaust: 5, return: 7, destroy: 4 };
    let damage = baseByEvent[eventType] || 0;
    if (eventType === 'exhaust' && hasRelic(state, 'r_exile_cache')) damage += 3;
    return damage;
}

function dealExileFlowDamage(state, card, eventType) {
    const damage = getExileFlowDamage(state, card, eventType);
    if (damage <= 0) return 0;
    hitEnemy(state, damage, true, '牌区流动');
    if (eventType === 'exhaust' && hasRelic(state, 'r_exile_cache')) {
        state.aim = Math.min(6, state.aim + 1);
        if (!state.exileCacheSidestepUsed) {
            state.exileCacheSidestepUsed = true;
            state.sidestep = Math.min(3, state.sidestep + 1);
        }
    }
    return damage;
}

function getAutoDiscardPriority(card) {
    if (!card) return 9999;
    if (card.isJunk) return -9999;
    const tags = card.tags || [];
    const rarityScore = card.rarity === '史诗' ? 9 : card.rarity === '稀有' ? 5 : 2;
    const valueScore = Math.min(18, Math.max(0, Number(card.val) || 0));
    let score = rarityScore + valueScore - Math.max(0, Number(card.cost) || 0) * 2;
    if (card.type === '攻击') score += 2;
    if (tags.includes('抽牌') || stateHasDirectEffect(card, 'draw')) score += 5;
    if (tags.includes('充能') || stateHasDirectEffect(card, 'energy')) score += 4;
    if (tags.includes('回收') || tags.includes('复刻') || tags.includes('回响')) score += 5;
    if (tags.includes('保留') || stateHasDirectEffect(card, 'retain')) score += 3;
    if (tags.includes('销毁')) score -= 3;
    return score;
}

function stateHasDirectEffect(card, key) {
    return Boolean(card?.directEffects?.[key]);
}

function discardLowestPriorityHandCard(state) {
    if (!state.hand.length) return null;
    const ranked = state.hand
        .map((card, index) => ({ card, index, score: getAutoDiscardPriority(card) }))
        .sort((a, b) => a.score - b.score || a.index - b.index);
    const selected = ranked[0];
    if (!selected) return null;
    const [discarded] = state.hand.splice(selected.index, 1);
    state.discard.push(discarded);
    if (!discarded.isJunk) state.discardCount++;
    dealExileFlowDamage(state, discarded, 'discard');
    return discarded;
}

function addKnives(state, count) {
    for (let i = 0; i < count; i++) {
        const knife = {
            name: '归风飞刀', type: '攻击', cost: 0, val: 4, tags: ['销毁'], rarity: '普通',
            isKnife: true, simId: `knife:${state.knifeSequence++}`
        };
        state.hand.push(knife);
        recordCardOpportunity(state, knife);
    }
}

function returnFromExhaust(state, destination) {
    if (!state.exhaust.length) return false;
    const card = state.exhaust.splice(Math.floor(state.rng() * state.exhaust.length), 1)[0];
    if (destination === 'hand') {
        state.hand.push(card);
        recordCardOpportunity(state, card);
    }
    else state.drawPile.push(card);
    dealExileFlowDamage(state, card, 'return');
    if (hasRelic(state, 'r_return_knife')) {
        addKnives(state, 1);
    }
    return true;
}

function returnFromDiscard(state) {
    if (!state.discard.length) return false;
    const card = state.discard.splice(Math.floor(state.rng() * state.discard.length), 1)[0];
    state.hand.push(card);
    recordCardOpportunity(state, card);
    dealExileFlowDamage(state, card, 'return');
    return true;
}

function applyRoleSynergy(state, card, echo, cycleReturned, resetCount) {
    if (echo || card.isJunk) return;
    const tags = card.tags || [];
    if (state.roleId === 'hero_warrior') {
        if (card.type === '防御' && tags.includes('保留')) state.armor += 3;
        if (tags.includes('庇护') && state.armor > 0) state.armor += 2;
        if (tags.includes('荆棘') && state.armor > 0) state.thorns += Math.min(8, Math.max(2, Math.ceil(state.armor / 8)));
    } else if (state.roleId === 'hero_mage') {
        if (tags.includes('回响') || tags.includes('复刻')) state.chant = Math.min(12, state.chant + 1);
        if (['易伤', '虚弱', '剧毒', '出血', '燃烧', '诅咒'].some(tag => tags.includes(tag))) state.nextDamage += 3;
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
        const card = state.drawPile.pop();
        state.hand.push(card);
        recordCardOpportunity(state, card);
    }
}

function heal(state, amount) {
    if (state.curse > 0 || amount <= 0) return;
    const actual = Math.min(amount, state.maxHp - state.hp);
    state.hp += actual;
    state.healing += actual;
}

function hitEnemy(state, amount, pierce = false, source = '卡牌伤害') {
    let damage = Math.max(0, Math.floor(amount));
    if (state.enemy.vuln > 0) damage = Math.floor(damage * (1 + state.enemy.vuln * 0.05));
    if (state.weak > 0) damage = Math.floor(damage * 0.75);
    if (state.enemy.minion?.hp > 0) {
        const blocked = Math.min(damage, state.enemy.minion.hp);
        state.enemy.minion.hp -= blocked;
        damage -= blocked;
    }
    damage = applyEnemyTypeDamageBonus(state, damage);
    if (damage <= 0) return 0;
    if (!pierce) {
        const blocked = Math.min(damage, state.enemy.armor);
        state.enemy.armor -= blocked;
        damage -= blocked;
    }
    state.enemy.hp -= damage;
    state.totalDamageDealt += damage;
    if (damage > 0) state.lastEnemyDamageSource = source;
    if (state.enemy.thorns > 0) takeDamage(state, state.enemy.thorns, '敌方荆棘');
    return damage;
}

function takeDamage(state, amount, cause = '敌方攻击', { allowSidestep = false } = {}) {
    let damage = Math.max(0, Math.floor(amount));
    if (allowSidestep && state.sidestep > 0 && damage > 0) {
        state.sidestep--;
        damage = 0;
    }
    if (state.protection > 0) {
        const reduced = Math.min(damage, state.protection);
        state.protection -= reduced;
        damage -= reduced;
    }
    if (state.counter > 0 && damage > 0) {
        const parry = Math.ceil(damage * 0.5);
        damage -= parry;
        state.counter = 0;
        hitEnemy(state, parry, false, '反击');
        if (state.crownOath) state.armor += parry;
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
        state.lastDamageCause = cause;
    }
    if (amount > 0 && state.thorns > 0) {
        state.enemy.hp -= state.thorns;
        state.totalDamageDealt += state.thorns;
        state.lastEnemyDamageSource = '荆棘';
    }
    return damage;
}

function estimateCard(state, card, incoming, move) {
    const tags = card.tags || [];
    const cost = Math.max(0.35, card.cost || 0);
    let score = 0;
    if (card.isSpecial) {
        const synergyCards = state.hand.filter(held => held !== card && (held.tags || []).some(tag => tags.includes(tag))).length;
        const specialScores = {
            s_shield: state.armor + 18,
            s_thorns: Math.min(incoming + 18, 30) + 10,
            a_syn_sword: 28 + (state.enemy.vuln > 0 ? 18 : 0),
            a_syn_array: Math.min(incoming + 16, 30) + 8,
            w_oath_fortress: Math.min(incoming + 14, 26) + 7,
            w_last_verdict: 56 + state.enemy.vuln * 6 + synergyCards * 6,
            a_syn_blood: state.bloodDebt > 0
                ? 18 + state.bloodDebt * 2 + Math.min(state.maxHp - state.hp, 8)
                : -16,
            s_magic: state.lastCard ? 44 : 18,
            s_pierce: 32 + state.chant * 14,
            a_syn_magic: 24,
            m_forbidden_comet: 56 + state.chant * 26,
            m_echo_archive: state.lastCard ? 32 : 12,
            m_mirror_hallway: 30,
            m_status_supernova: 52 + enemyDebuffCount(state) * 18,
            s_energy: 32 + state.aim * 3,
            a_gale_verdict: 14 + Math.min(3, state.aim) * 6,
            s_poison: (state.enemy.poison + state.enemy.bleed) * 2.5 + 28,
            s_exhaust: (state.exhaust.length + 1) * 16 + (state.exhaust.length ? 14 : 0)
        };
        score += specialScores[card.specialId] || 0;
    }
    let value = state.data.getScaledCardValue(card);
    if (tags.includes('重击')) value *= hasRelic(state, 'r_heavy_badge') ? 2.5 : 2;
    if (tags.includes('连击') && state.cardsPlayed > 0) value *= 1.5;
    let repeats = 1 + (tags.includes('追击') ? 1 : 0) + (tags.includes('回响') ? 1 : 0);
    if (card.type === '攻击') {
        if (tags.includes('爆发')) value += state.chant ? state.chant * 8 : 4;
        if (tags.includes('圣剑')) value += Math.floor(state.armor * (hasRelic(state, 'r_sword_oath') ? 0.7 : 0.5)) + state.counter * 4;
        if (card.bloodDebtDamageRatio) value += state.bloodDebt * Number(card.bloodDebtDamageRatio) * state.bloodDebtPower;
        score += value * repeats * (tags.includes('穿甲') ? 1.12 : 1);
        if (tags.includes('放血')) score += state.enemy.bleed * 3;
        if (tags.includes('吸血')) {
            const ratio = Number.isFinite(Number(card.lifestealRatio)) ? Number(card.lifestealRatio) : (card.rarity === '史诗' ? 1 : 0.5);
            score += Math.min(state.maxHp - state.hp + state.bloodDebt, value * ratio) * 0.8;
        }
    }
    const hasProtection = tags.includes('庇护') || state.data.hasDirectCardEffect(card, 'protection');
    const hasHeal = tags.includes('治愈') || state.data.hasDirectCardEffect(card, 'heal');
    const hasDraw = tags.includes('抽牌') || state.data.hasDirectCardEffect(card, 'draw');
    const hasEnergy = tags.includes('充能') || state.data.hasDirectCardEffect(card, 'energy');
    if (card.type === '防御') score += Math.min(incoming + 8, value + (hasProtection ? state.data.getProtectionValue(card) : 0)) * (incoming > 0 ? 1.25 : 0.45);
    else if (hasProtection) score += Math.min(incoming + 6, state.data.getProtectionValue(card)) * (incoming > 0 ? 1.15 : 0.5);
    if (hasHeal) score += Math.min(state.maxHp - state.hp, state.data.getCardHealValue(card)) * 1.15;
    if (hasDraw) score += state.data.getCardDrawCount(card) * 5;
    if (hasEnergy || tags.includes('自然')) score += 5;
    if (card.bloodDebtGain) {
        const repaymentCapacity = state.hand.reduce((sum, held) => {
            if (held === card) return sum;
            if (held.bloodDebtSpendAll) return sum + 40;
            let capacity = Number(held.bloodDebtRepay) || 0;
            if ((held.tags || []).includes('吸血')) {
                const ratio = Number.isFinite(Number(held.lifestealRatio)) ? Number(held.lifestealRatio) : (held.rarity === '史诗' ? 1 : 0.5);
                capacity += Math.max(1, Math.floor((Number(held.val) || 0) * ratio));
            }
            if (held.bloodDebtRepayFromBleed) capacity += state.enemy.bleed * 3 * Number(held.bloodDebtRepayFromBleed);
            return sum + capacity;
        }, 0);
        const projectedDebt = state.bloodDebt + Number(card.bloodDebtGain);
        const unsafeDebt = Math.max(0, projectedDebt - repaymentCapacity - 3);
        score += repaymentCapacity > 0 ? card.bloodDebtGain * 1.6 : card.bloodDebtGain * 0.25;
        score -= unsafeDebt * 3;
        if (state.hp <= 12) score -= card.bloodDebtGain * 1.5;
    }
    if (card.bloodDebtRepay) score += Math.min(state.bloodDebt, card.bloodDebtRepay) * 2.2;
    if (card.bloodDebtRepayFromBleed) score += Math.min(state.bloodDebt, state.enemy.bleed * 3 * card.bloodDebtRepayFromBleed) * 1.5;
    if (card.bloodDebtClearDamage && state.bloodDebt > 0) score += card.bloodDebtClearDamage * 0.5;
    if (card.bloodDebtBleed) score += card.bloodDebtBleed * 1.6;
    if (card.bloodDebtWeak) score += incoming > 0 ? card.bloodDebtWeak * 4 : card.bloodDebtWeak * 2;
    if (card.bloodDebtStun) score += 13 * card.bloodDebtStun;
    if (tags.includes('反击')) score += incoming > 0 ? 10 : 4;
    if (tags.includes('回响') && card.type !== '攻击') score += 4;
    const needsDiscardCost = tags.includes('狂热') || tags.includes('附魔');
    if (needsDiscardCost) {
        const discardCandidates = state.hand.filter(held => held !== card);
        if (!discardCandidates.length) score -= 100;
        else score -= Math.max(1, Math.min(8, getAutoDiscardPriority(discardCandidates.slice().sort((a, b) => getAutoDiscardPriority(a) - getAutoDiscardPriority(b))[0]) / 4));
    }
    if (tags.includes('狂热')) {
        let frenzyBonus = (Number(card.val) || 4) + (card.up ? 4 : 3);
        if (hasRelic(state, 'r_frenzy_veil')) frenzyBonus += Math.floor((state.discardCount + 1) / 2);
        score += frenzyBonus * Math.max(1, state.hand.filter(held => held !== card && held.type === '攻击').length);
    }
    if (tags.includes('附魔')) {
        const baseEnchant = Math.max(4, (Number(card.val) || 4) + (card.up ? 4 : 2));
        const sinkEnergy = Math.min(Number(card.energySink?.max) || 0, Math.max(0, state.energy - (card.cost || 0)));
        score += baseEnchant + sinkEnergy * (Number(card.energySink?.enchantPerEnergy) || 0) * 0.8;
    }
    if (tags.includes('咏唱')) score += state.data.getCardChantGain(card) * 5;
    if (tags.includes('蓄力')) score += state.data.getWindGain(card) * 4;
    if (tags.includes('闪避')) {
        const availableLayers = Math.max(0, 3 - state.sidestep);
        const gainedLayers = Math.min(availableLayers, state.data.getSidestepGain(card));
        if (move?.type?.includes('attack')) {
            let bodyDamage = move.val + state.enemy.str;
            if (state.enemy.weak > 0) bodyDamage *= 0.75;
            if (state.enemy.charged) bodyDamage *= 2;
            const protectedHits = Math.min(gainedLayers, move.times || 1);
            score += Math.max(1, Math.floor(bodyDamage)) * protectedHits;
        }
    }
    if (tags.includes('眩晕')) score += 13;
    if (tags.includes('虚弱')) {
        const potency = card.type === '能力' ? state.data.getAbilityPotency(card) : 1;
        score += (incoming > 0 ? 8 : 4) + Math.max(0, potency - 1) * 2;
    }
    if (tags.includes('易伤')) {
        const potency = card.type === '能力' ? state.data.getAbilityPotency(card) : 1;
        score += 7 + Math.max(0, potency - 1) * 3;
    }
    if (tags.includes('剧毒')) score += 8;
    if (tags.includes('出血')) score += 7;
    if (tags.includes('燃烧')) score += 8;
    if (tags.includes('诅咒')) score += 4;
    if (tags.includes('放血')) score += state.enemy.bleed * 3;
    if (tags.includes('回收')) score += state.exhaust.length > 0 || state.discard.length > 0 ? 8 : 1;
    if (cardHasBuildTag(state, card, 'exile')) {
        if (tags.includes('放逐')) score += getExileFlowDamage(state, card, 'exhaust') + 3;
        else if (tags.includes('回收')) score += (state.exhaust.length || state.discard.length) ? 10 : 2;
        else if (tags.includes('销毁')) score += getExileFlowDamage(state, card, 'destroy') + 2;
        else score += getExileFlowDamage(state, card, 'discard');
    }
    if (tags.includes('保留') || state.data.hasDirectCardEffect(card, 'retain')) score += 2;
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
    if ((card.tags || []).includes('销毁')) {
        state.destroyed.push(card);
        dealExileFlowDamage(state, card, 'destroy');
    }
    else if ((card.tags || []).includes('放逐')) {
        state.exhaust.push(card);
        dealExileFlowDamage(state, card, 'exhaust');
        if (hasRelic(state, 'r_exhaust_dmg')) state.battleDamage += 1;
    }
    else if ((card.tags || []).includes('保留') || state.data.hasDirectCardEffect(card, 'retain')) state.retained.push(card);
    else {
        state.discard.push(card);
        dealExileFlowDamage(state, card, 'discard');
    }
}

function executeSpecialCard(state, card, echo = false) {
    const specialId = card.specialId || card.id;
    if (specialId === 'w_counter_crown') {
        if (card.type === '攻击') payBloodDebtAttackCost(state);
        const swordRatio = hasRelic(state, 'r_sword_oath') ? 0.7 : 0.5;
        const swordBonus = Math.floor(state.armor * swordRatio) + state.counter * 4;
        hitEnemy(state, 16 + state.battleDamage + swordBonus);
        state.counter = 1;
        state.crownOath = true;
    } else if (specialId === 's_shield') {
        if (card.type === '攻击') payBloodDebtAttackCost(state);
        hitEnemy(state, state.armor + state.battleDamage);
        state.counter = 1;
    } else if (specialId === 's_thorns') {
        state.armor += 18;
        state.thorns += hasRelic(state, 'r_thorn_shield_new') ? 16 : 8;
    } else if (specialId === 'a_syn_sword') {
        if (card.type === '攻击') payBloodDebtAttackCost(state);
        hitEnemy(state, 28 + state.battleDamage, true);
        if (state.enemy.hp > 0 && state.enemy.vuln > 0) state.battleDamage += 12;
    } else if (specialId === 'a_syn_array') {
        if (state.counter > 0) state.protection += 8;
        else state.armor += 16;
        state.counter = 1;
    } else if (specialId === 'w_oath_fortress') {
        state.armor += 14;
        state.protection += 4 + (hasRelic(state, 'r_protect_armor') ? 3 : 0);
        state.counter = 1;
    } else if (specialId === 'w_last_verdict') {
        if (card.type === '攻击') payBloodDebtAttackCost(state);
        const executionHand = state.hand.filter(held => (held.tags || []).some(tag => ['连击', '穿甲'].includes(tag))).length;
        hitEnemy(state, 48 + state.battleDamage + state.enemy.vuln * 6 + executionHand * 6, true);
    } else if (specialId === 'a_syn_blood') {
        if (card.type === '攻击') payBloodDebtAttackCost(state);
        const spentDebt = state.bloodDebt;
        if (spentDebt > 0) repayBloodDebt(state, spentDebt);
        const dealt = hitEnemy(state, (Number(card.val) || 16) + spentDebt * (card.bloodDebtSpendDamage || 2) + state.battleDamage, true);
        let healing = Math.floor(dealt * (card.lifestealRatio || 0.5));
        if (hasRelic(state, 'r_lifedebt_scale') && state.hp <= state.maxHp / 2) healing = Math.floor(healing * 1.5);
        const repayment = repayBloodDebt(state, healing);
        const remainingHeal = healing - repayment.paid;
        const overheal = Math.max(0, remainingHeal - Math.max(0, state.maxHp - state.hp));
        heal(state, remainingHeal + (spentDebt > 0 ? (card.bloodDebtClearHeal || 0) : 0));
        if (hasRelic(state, 'r_vamp_ring') && overheal > 0) state.battleDamage += Math.min(5, overheal);
    } else if (specialId === 's_magic') {
        const lastWasReplica = (state.lastCard?.tags || []).includes('复刻');
        if (state.lastCard && !state.lastCard.isJunk && !lastWasReplica) {
            executeCard(state, state.lastCard, true);
            if (state.enemy.hp > 0) executeCard(state, state.lastCard, true);
            if (hasRelic(state, 'r_echo_archive_pin') && !state.echoArchivePinUsed) {
                state.echoArchivePinUsed = true;
                state.energy++;
                state.nextDamage += 8;
            }
        } else {
            draw(state, 2);
        }
    } else if (specialId === 's_pierce') {
        if (card.type === '攻击') payBloodDebtAttackCost(state);
        const chantSpent = state.chant;
        hitEnemy(state, 32 + state.battleDamage + chantSpent * 14, true);
        state.chant = hasRelic(state, 'r_burst_lens') ? Math.ceil(chantSpent / 2) : 0;
    } else if (specialId === 'a_syn_magic') {
        state.nextDamage += 8;
        draw(state, 1);
    } else if (specialId === 'm_forbidden_comet') {
        if (card.type === '攻击') payBloodDebtAttackCost(state);
        const chantSpent = state.chant;
        hitEnemy(state, 56 + state.battleDamage + chantSpent * 24, true);
        state.protection += Math.min(48, chantSpent * 6);
        if (state.enemy.hp > 0 && chantSpent > 0) {
            state.battleDamage += Math.min(36, Math.max(10, chantSpent * 5));
        }
        state.chant = hasRelic(state, 'r_burst_lens') ? Math.ceil(chantSpent / 2) : 0;
    } else if (specialId === 'm_echo_archive') {
        const lastWasReplica = (state.lastCard?.tags || []).includes('复刻');
        if (state.lastCard && !state.lastCard.isJunk && !lastWasReplica) {
            executeCard(state, state.lastCard, true);
            if (hasRelic(state, 'r_echo_archive_pin') && !state.echoArchivePinUsed) {
                state.echoArchivePinUsed = true;
                state.energy++;
                state.nextDamage += 8;
            }
            state.nextDamage += 10;
            draw(state, 1);
        }
        else {
            state.chant = Math.min(12, state.chant + 3);
            draw(state, 2);
        }
    } else if (specialId === 'm_mirror_hallway') {
        state.nextDamage += 6;
        if (!echo) draw(state, 1);
    } else if (specialId === 'm_status_supernova') {
        const debuffs = enemyDebuffCount(state);
        hitEnemy(state, 52 + state.battleDamage + debuffs * 16);
        state.protection += Math.min(30, debuffs * 6);
        state.enemy.burn += Math.min(4, Math.max(1, debuffs));
    } else if (specialId === 'a_gale_verdict') {
        if (card.type === '攻击') payBloodDebtAttackCost(state);
        const shots = Math.min(3, state.aim);
        state.aim -= shots;
        hitEnemy(state, 14 + state.battleDamage + shots * 6, true);
        state.protection += shots;
    } else if (specialId === 's_energy') {
        const hadWind = state.aim > 0;
        state.aim = Math.min(6, state.aim + 3 + (hasRelic(state, 'r_wind_quiver') ? 1 : 0));
        draw(state, 2);
        if (hadWind) state.energy++;
    } else if (specialId === 's_poison') {
        const layers = state.enemy.poison + state.enemy.bleed;
        hitEnemy(state, 24 + layers * 2.5);
        state.protection += Math.min(8, layers);
    } else if (specialId === 's_exhaust') {
        const returned = state.exhaust.length + 1;
        if (hasRelic(state, 'r_exhaust_dmg')) state.battleDamage += 1;
        hitEnemy(state, returned * 16);
        state.aim = Math.min(6, state.aim + Math.floor(returned / 2));
        if (returned >= 2) state.sidestep = Math.min(3, state.sidestep + 1);
        if (hasRelic(state, 'r_return_knife')) addKnives(state, state.exhaust.length);
        card.returnedBySpecial = true;
        for (const returnedCard of state.exhaust) dealExileFlowDamage(state, returnedCard, 'return');
        state.drawPile = shuffle(state.rng, state.drawPile.concat(state.exhaust, [card]));
        state.exhaust = [];
    } else {
        return false;
    }
    return true;
}

function executeCard(state, card, echo = false) {
    const tags = card.tags || [];
    if (card.isSpecial && executeSpecialCard(state, card, echo)) return;
    let cycleReturned = false;
    let resetCount = 0;
    let paidDiscardCost = false;
    let debtClearedByCard = false;
    let debtPaidByCard = 0;
    if (!echo && (tags.includes('狂热') || tags.includes('附魔'))) {
        paidDiscardCost = Boolean(discardLowestPriorityHandCard(state));
        if (!paidDiscardCost) return;
    }
    if (!echo && card.bloodDebtGain) addBloodDebt(state, card.bloodDebtGain);
    if (!echo && card.bloodDebtPowerGain) state.bloodDebtPower += Number(card.bloodDebtPowerGain) || 0;
    if (tags.includes('血祭')) {
        state.hp = Math.max(1, state.hp - 4);
        state.battleDamage += card.up ? 5 : 3;
        if (hasRelic(state, 'r_blood_suture')) heal(state, 2);
    }
    if (tags.includes('庇护') || state.data.hasDirectCardEffect(card, 'protection')) {
        state.protection += state.data.getProtectionValue(card) + (tags.includes('庇护') && hasRelic(state, 'r_protect_armor') ? 3 : 0);
    }
    if (tags.includes('反击')) state.counter = 1;
    if (tags.includes('闪避') && !echo) {
        let gain = state.data.getSidestepGain(card) + (hasRelic(state, 'r_wind_quiver') ? 1 : 0);
        if (hasRelic(state, 'r_tailwind_spool') && !state.tailwindSpoolUsed) {
            gain++;
            state.tailwindSpoolUsed = true;
            state.protection += 3;
        }
        state.sidestep = Math.min(3, state.sidestep + gain);
    }
    if (tags.includes('咏唱') && !echo) {
        let gain = state.data.getCardChantGain(card);
        if (hasRelic(state, 'r_chant_reservoir') && !state.chantReservoirUsed) {
            gain++;
            state.chantReservoirUsed = true;
            draw(state, 1);
        }
        state.chant = Math.min(12, state.chant + gain);
        state.armor += 6;
        if (hasRelic(state, 'r_sac_jade')) state.energy++;
        if (hasRelic(state, 'r_sac_jade')) state.protection += 2;
    }
    if (tags.includes('狂热') && paidDiscardCost) {
        let frenzyBonus = (Number(card.val) || 4) + (card.up ? 4 : 3);
        if (hasRelic(state, 'r_frenzy_veil')) frenzyBonus += Math.floor(state.discardCount / 2);
        state.turnDamage += frenzyBonus;
    }
    if (tags.includes('附魔') && paidDiscardCost) {
        const sinkEnergy = Math.min(Number(card.energySink?.max) || 0, Math.max(0, state.energy));
        const baseEnchant = Math.max(4, (Number(card.val) || 4) + (card.up ? 4 : 2));
        state.energy -= sinkEnergy;
        state.nextDamage += baseEnchant + sinkEnergy * (Number(card.energySink?.enchantPerEnergy) || 0);
        if (!echo) draw(state, 1);
    }
    if (tags.includes('蓄力') && !echo) {
        let gain = state.data.getWindGain(card) + (hasRelic(state, 'r_wind_quiver') ? 1 : 0);
        if (hasRelic(state, 'r_tailwind_spool') && !state.tailwindSpoolUsed) {
            gain++;
            state.tailwindSpoolUsed = true;
            state.protection += 3;
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
    if (tags.includes('充能') || state.data.hasDirectCardEffect(card, 'energy')) state.energy += 1;
    if (tags.includes('治愈') || state.data.hasDirectCardEffect(card, 'heal')) heal(state, state.data.getCardHealValue(card));
    if ((tags.includes('抽牌') || state.data.hasDirectCardEffect(card, 'draw')) && !echo) draw(state, state.data.getCardDrawCount(card));
    if (tags.includes('荆棘')) state.thorns += hasRelic(state, 'r_thorn_shield_new') ? 16 : 8;
    const statusBonus = hasRelic(state, 'r_plague_glass') && card.type === '能力' && enemyDebuffCount(state) > 0 ? 1 : 0;
    if (statusBonus > 0 && !echo) state.protection += 4;
    if (tags.includes('剧毒')) state.enemy.poison += 4 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1) + statusBonus + (hasRelic(state, 'r_poison_fang') ? 1 : 0);
    if (tags.includes('出血')) state.enemy.bleed += 4 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1) + statusBonus + (hasRelic(state, 'r_poison_fang') ? 1 : 0);
    if (card.bloodDebtBleed) {
        state.enemy.bleed += Math.max(0, Math.floor(card.bloodDebtBleed));
        if (hasRelic(state, 'r_vein_cup')) {
            const result = repayBloodDebt(state, 1);
            debtPaidByCard += result.paid;
            debtClearedByCard ||= result.cleared;
        }
    }
    if (tags.includes('燃烧')) state.enemy.burn += (card.type === '能力' ? state.data.getAbilityPotency(card) : 1) + statusBonus;
    if (tags.includes('诅咒')) {
        state.enemy.curse += 2 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1) + statusBonus;
        if (hasRelic(state, 'r_hex_incense')) state.enemy.weak++;
    }
    if (tags.includes('易伤')) state.enemy.vuln += 2 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1);
    if (tags.includes('虚弱')) state.enemy.weak += 2 * (card.type === '能力' ? state.data.getAbilityPotency(card) : 1);
    if (card.bloodDebtWeak) state.enemy.weak += Math.max(0, Math.floor(card.bloodDebtWeak));
    if (card.bloodDebtStun) state.enemy.stun += Math.max(0, Math.floor(card.bloodDebtStun));
    if (tags.includes('眩晕')) state.enemy.stun += 1;
    if (tags.includes('回收') && !echo) {
        for (const mode of state.data.getCardRecycleModes(card)) {
            if (mode === 'exhaustToHand') cycleReturned = returnFromExhaust(state, 'hand') || cycleReturned;
            else if (mode === 'exhaustToDraw') cycleReturned = returnFromExhaust(state, 'draw') || cycleReturned;
            else if (mode === 'discardToHand') cycleReturned = returnFromDiscard(state) || cycleReturned;
        }
    }
    if (tags.includes('放血') && state.enemy.bleed > 0) {
        const bloodletDamage = state.enemy.bleed * (hasRelic(state, 'r_bleed_knife') ? 5 : 3);
        hitEnemy(state, bloodletDamage, true);
        if (card.bloodDebtRepayFromBleed) {
            const result = repayBloodDebt(state, Math.floor(bloodletDamage * Number(card.bloodDebtRepayFromBleed)));
            debtPaidByCard += result.paid;
            debtClearedByCard ||= result.cleared;
        }
        state.enemy.bleed = hasRelic(state, 'r_rupture_charm') ? 3 : 0;
        if (hasRelic(state, 'r_rupture_charm')) {
            const result = repayBloodDebt(state, 2);
            debtPaidByCard += result.paid;
            debtClearedByCard ||= result.cleared;
        }
    }
    if (card.type === '防御') state.armor += state.data.getScaledCardValue(card);
    if (card.type === '攻击') {
        payBloodDebtAttackCost(state);
        let value = state.data.getScaledCardValue(card);
        if (tags.includes('重击')) value *= hasRelic(state, 'r_heavy_badge') ? 2.5 : 2;
        if (tags.includes('连击') && state.cardsPlayed > 0 && !echo) value = Math.floor(value * 1.5);
        let damage = value + state.battleDamage + state.turnDamage;
        if (card.bloodDebtDamageRatio) damage += Math.floor(state.bloodDebt * Number(card.bloodDebtDamageRatio) * state.bloodDebtPower);
        if (tags.includes('放逐') && hasRelic(state, 'r_exile_cache')) damage += 2;
        if (tags.includes('圣剑')) damage += Math.floor(state.armor * (hasRelic(state, 'r_sword_oath') ? 0.7 : 0.5)) + state.counter * 4;
        if (tags.includes('爆发')) {
            const chantSpent = state.chant;
            damage += chantSpent > 0 ? chantSpent * 10 : 5;
            state.protection += Math.min(10, chantSpent);
            state.chant = hasRelic(state, 'r_burst_lens') ? Math.ceil(chantSpent / 2) : 0;
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
        if (hasRelic(state, 'r_multishot_fletching') && tags.includes('追击')) damage += 2;
        const pierce = tags.includes('穿甲');
        if (pierce && hasRelic(state, 'r_pierce_amulet')) damage = Math.floor(damage * 1.25);
        const dealt = hitEnemy(state, damage, pierce);
        if (pierce && tags.includes('重击') && state.enemy.vuln > 0 && hasRelic(state, 'r_execute_scabbard')) {
            hitEnemy(state, 24, true);
            if (state.enemy.hp > 0) state.battleDamage += 6;
        }
        if (tags.includes('吸血')) {
            const lifestealRatio = Number.isFinite(Number(card.lifestealRatio)) ? Number(card.lifestealRatio) : (card.rarity === '史诗' ? 1 : 0.5);
            let healing = Math.floor(dealt * lifestealRatio);
            if (hasRelic(state, 'r_lifedebt_scale') && state.hp <= state.maxHp / 2) healing = Math.floor(healing * 1.5);
            if (hasRelic(state, 'r_blood') && state.enemy.bleed > 0) {
                const bonus = repayBloodDebt(state, state.enemy.bleed);
                debtPaidByCard += bonus.paid;
                debtClearedByCard ||= bonus.cleared;
            }
            const result = repayBloodDebt(state, healing);
            debtPaidByCard += result.paid;
            debtClearedByCard ||= result.cleared;
            const remainingHeal = healing - result.paid;
            const overheal = Math.max(0, remainingHeal - Math.max(0, state.maxHp - state.hp));
            heal(state, remainingHeal);
            if (hasRelic(state, 'r_vamp_ring') && overheal > 0) state.battleDamage += Math.min(5, overheal);
        }
    }
    if (card.bloodDebtRepay) {
        const result = repayBloodDebt(state, card.bloodDebtRepay);
        debtPaidByCard += result.paid;
        debtClearedByCard ||= result.cleared;
    }
    if (debtPaidByCard > 0 && card.bloodDebtDrawOnRepay && !echo) draw(state, card.bloodDebtDrawOnRepay);
    if (debtClearedByCard && card.bloodDebtClearDamage) hitEnemy(state, card.bloodDebtClearDamage, true, '血债清偿');
    if (debtClearedByCard && card.bloodDebtClearHeal) heal(state, card.bloodDebtClearHeal);
    if (tags.includes('复刻') && state.lastCard && !echo) {
        executeCard(state, state.lastCard, true);
        if (hasRelic(state, 'r_echo_archive_pin') && !state.echoArchivePinUsed) {
            state.echoArchivePinUsed = true;
            state.energy++;
            state.nextDamage += 8;
        }
    }
    if (tags.includes('重置') && !echo) {
        const count = state.hand.length;
        for (const discardedCard of state.hand) {
            state.discard.push(discardedCard);
            if (!discardedCard.isJunk) state.discardCount++;
            dealExileFlowDamage(state, discardedCard, 'discard');
        }
        resetCount = count;
        state.hand = [];
        draw(state, count);
    }
    if (hasRelic(state, 'r_status_ledger') && enemyDebuffCount(state) >= 3 && card.type === '能力' && !state.statusLedgerUsed && !echo) {
        state.statusLedgerUsed = true;
        draw(state, 1);
    }
    applyRoleSynergy(state, card, echo, cycleReturned, resetCount);
}

function playPlayerTurn(state, move) {
    state.energy = state.character.baseEnergy + (state.warriorStartReady ? 1 : 0);
    state.cardsPlayed = 0;
    state.abilityCardsPlayed = 0;
    state.turnDamage = 0;
    state.protection = 0;
    state.chantReservoirUsed = false;
    state.tailwindSpoolUsed = false;
    state.echoArchivePinUsed = false;
    state.statusLedgerUsed = false;
    state.bloodDebtPaid = 0;
    state.bloodDebtPower = 1;
    state.bloodDebtReductionUsed = false;
    state.bloodClearUsed = false;
    state.scarletWhetUsed = false;
    state.oathTransfusionUsed = false;
    state.lifedebtClearUsed = false;
    state.signatureSetupUsed = false;
    state.signatureAttackReady = false;
    state.hand.push(...state.retained);
    state.retained.forEach(card => recordCardOpportunity(state, card));
    state.retained = [];
    draw(state, state.character.openingHand + (state.warriorStartReady ? 1 : 0));
    state.warriorStartReady = false;
    let safety = 0;
    while (safety++ < 30 && state.enemy.hp > 0 && state.hp > 0) {
        const incoming = expectedIncoming(state, move);
        const playable = state.hand.filter(card => (card.cost || 0) <= state.energy);
        if (!playable.length) break;
        const ranked = playable.map(card => ({ card, score: estimateCard(state, card, incoming, move) })).sort((a, b) => b.score - a.score);
        if (ranked[0].score < 1) break;
        const card = ranked[0].card;
        state.hand.splice(state.hand.indexOf(card), 1);
        state.energy -= card.cost || 0;
        recordCardPlay(state, card);
        let specialWindRun = 0;
        if (card.isSpecial && card.type === '攻击' && state.aim > 0 && (card.specialId || card.id) !== 'a_gale_verdict') {
            state.aim--;
            state.protection += 3;
            specialWindRun = 1;
        }
        if (card.type === '能力') {
            state.abilityCardsPlayed++;
            if (hasRelic(state, 'r_double_quill') && state.abilityCardsPlayed === 2) draw(state, 1);
        }
        let archerSignatureAfterCard = false;
        if (card.type === '能力' && !state.signatureSetupUsed && (state.roleId === 'hero_mage' || state.roleId === 'hero_archer')) {
            state.signatureSetupUsed = true;
            state.signatureAttackReady = true;
        } else if (card.type === '攻击' && state.signatureAttackReady) {
            state.signatureAttackReady = false;
            if (hasRelic(state, 'r_start_mage')) state.chant = Math.min(12, state.chant + 1);
            else if (hasRelic(state, 'r_start_archer')) archerSignatureAfterCard = true;
        }
        executeCard(state, card, false);
        if (archerSignatureAfterCard && state.enemy.hp > 0) {
            state.aim = Math.min(6, state.aim + 1);
        }
        if (state.hp <= 0 || state.enemy.hp <= 0) break;
        if ((card.tags || []).includes('回响')) {
            executeCard(state, card, true);
            if (hasRelic(state, 'r_echo_archive_pin') && !state.echoArchivePinUsed) {
                state.echoArchivePinUsed = true;
                state.energy++;
                state.nextDamage += 8;
            }
            if (hasRelic(state, 'r_echo_mirror_relic')) executeCard(state, card, true);
        }
        if (state.hp <= 0 || state.enemy.hp <= 0) break;
        const extraRuns = specialWindRun + ((card.tags || []).includes('追击') ? 1 : 0);
        for (let i = 0; i < extraRuns && state.enemy.hp > 0; i++) executeCard(state, card, true);
        discardPlayedCard(state, card);
        if (!(card.tags || []).includes('复刻')) state.lastCard = card;
        state.cardsPlayed++;
    }
    state.energyWasted += Math.max(0, state.energy);
    state.discard.push(...state.hand.filter(card => !(card.tags || []).includes('保留') && !state.data.hasDirectCardEffect(card, 'retain')));
    state.retained.push(...state.hand.filter(card => (card.tags || []).includes('保留') || state.data.hasDirectCardEffect(card, 'retain')));
    state.hand = [];
    settleBloodDebt(state);
}

function applyEnemyMove(state, move) {
    const enemy = state.enemy;
    if (enemy.minion?.hp > 0) takeDamage(state, enemy.minion.atk, '召唤物攻击');
    if (enemy.stun > 0) {
        enemy.stun--;
        state.sidestep = 0;
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
            const dealt = takeDamage(state, damage, '首领主体攻击', { allowSidestep: true });
            if (move.type === 'attack_lifesteal' && enemy.curse <= 0) enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(dealt / 2));
            if (state.hp <= 0 || enemy.hp <= 0) break;
        }
        if (hasRelic(state, 'r_start_warrior') && !state.warriorStartUsed) {
            state.warriorStartUsed = true;
            state.warriorStartReady = true;
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
        else if (key === 'stun') takeDamage(state, 3 * move.val, '眩晕伤害');
    }
    state.sidestep = 0;
}

function endRound(state) {
    const enemy = state.enemy;
    if (enemy.poison > 0) {
        enemy.hp -= enemy.poison;
        state.totalDamageDealt += enemy.poison;
        state.lastEnemyDamageSource = '剧毒';
        enemy.poison--;
    }
    if (enemy.bleed > 0) {
        const bleedDamage = Math.ceil(enemy.bleed / 2);
        enemy.hp -= bleedDamage;
        state.totalDamageDealt += bleedDamage;
        state.lastEnemyDamageSource = '出血';
        enemy.bleed--;
    }
    if (enemy.burn > 0) {
        const burnDamage = Math.max(1, Math.ceil(enemy.maxHp * 0.03 * enemy.burn));
        enemy.hp -= burnDamage;
        state.totalDamageDealt += burnDamage;
        state.lastEnemyDamageSource = '燃烧';
        enemy.burn--;
    }
    if (state.poison > 0) {
        takeDamage(state, state.poison, '剧毒伤害');
        state.poison--;
    }
    if (state.bleed > 0) {
        takeDamage(state, Math.ceil(state.bleed / 2), '出血伤害');
        state.bleed--;
    }
    if (state.burn > 0) {
        takeDamage(state, Math.max(1, Math.ceil(state.maxHp * 0.03 * state.burn)), '燃烧伤害');
        state.burn--;
    }
    if (enemy.curse > 0) {
        const curseDamage = enemy.curse * 3;
        enemy.hp -= curseDamage;
        state.totalDamageDealt += curseDamage;
        state.lastEnemyDamageSource = '诅咒';
        enemy.curse--;
    }
    if (enemy.vuln > 0) enemy.vuln--;
    if (enemy.weak > 0) enemy.weak--;
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
    state.bloodDebt = 0;
    state.bloodDebtTurns = 0;
    state.bloodDebtPendingDamage = 0;
    return true;
}

function battleResult(state, win, deathCause = null) {
    return {
        win,
        hp: Math.max(0, state.hp),
        turns: state.turns,
        enemy: state.encounterName,
        damageTaken: state.damageTaken,
        damageDealt: state.totalDamageDealt,
        healing: state.healing,
        energyWasted: state.energyWasted,
        deathCause: win ? null : (deathCause || state.lastDamageCause || '回合上限'),
        victoryCause: win ? (state.lastEnemyDamageSource || '卡牌伤害') : null,
        cardOpportunities: state.cardOpportunities,
        cardPlays: state.cardPlays,
        cardMeta: state.cardMeta,
        playStyle: state.playStyle
    };
}

function simulateBattle(data, rng, roleId, deck, hp, checkpoint, loadout, options = {}) {
    const state = createBattle(data, rng, roleId, deck, hp, checkpoint, loadout, options);
    while (state.turns++ < 30 && state.hp > 0) {
        const moveIndex = chooseMove(state);
        const move = state.enemy.moves[moveIndex];
        playPlayerTurn(state, move);
        if (resolveEnemyDeath(state)) return battleResult(state, true);
        if (state.hp <= 0) break;
        applyEnemyMove(state, move);
        if (resolveEnemyDeath(state)) return battleResult(state, true);
        if (state.hp <= 0) break;
        endRound(state);
        if (resolveEnemyDeath(state)) return battleResult(state, true);
        state.enemy.lastMove = moveIndex;
        state.enemy.turn++;
    }
    return battleResult(state, false, state.hp > 0 ? '回合上限' : null);
}

function addCounter(target, key, amount = 1) {
    target[key] = (target[key] || 0) + amount;
}

function mergeCounters(target, source) {
    for (const [key, value] of Object.entries(source || {})) addCounter(target, key, value);
}

function summarizeCardUsage(plays, opportunities, metadata, runs) {
    return Object.keys(metadata).map(key => ({
        id: key,
        ...metadata[key],
        plays: plays[key] || 0,
        opportunities: opportunities[key] || 0,
        playsPerBattle: (plays[key] || 0) / runs,
        usageRate: (plays[key] || 0) / Math.max(1, opportunities[key] || 0)
    })).sort((left, right) => right.plays - left.plays || right.usageRate - left.usageRate);
}

function simulateCheckpoint(data, roleId, buildId, checkpoint, runs, seed, mode, options = {}) {
    let wins = 0;
    let turns = 0;
    let hpLeft = 0;
    let hpLeftOnWin = 0;
    let damageTaken = 0;
    let damageDealt = 0;
    let healing = 0;
    let energyWasted = 0;
    const enemies = {};
    const deathCauses = {};
    const victoryCauses = {};
    const cardPlays = {};
    const cardOpportunities = {};
    const cardMeta = {};
    const playStyle = {};
    const loadout = getLoadout(data, roleId, buildId, mode, options.loadoutOverride);
    for (let i = 0; i < runs; i++) {
        const rng = createRng(seed + i * 7919);
        const deckSize = checkpoint.id === 'early' ? [5, 5] : checkpoint.id === 'mid' ? [7, 4] : [10, 3];
        const deck = makeDeck(data, rng, roleId, buildId, deckSize[0], deckSize[1], loadout, options.disabledTags);
        if (['late', 'elite', 'boss'].includes(checkpoint.id)) upgradeRandomCard(rng, deck);
        const result = simulateBattle(data, rng, roleId, deck, data.CHARACTERS[roleId].maxHp, checkpoint, loadout, options);
        wins += result.win ? 1 : 0;
        turns += result.turns;
        hpLeft += result.hp;
        hpLeftOnWin += result.win ? result.hp : 0;
        damageTaken += result.damageTaken;
        damageDealt += result.damageDealt;
        healing += result.healing;
        energyWasted += result.energyWasted;
        if (result.deathCause) addCounter(deathCauses, result.deathCause);
        if (result.victoryCause) addCounter(victoryCauses, result.victoryCause);
        mergeCounters(cardPlays, result.cardPlays);
        mergeCounters(cardOpportunities, result.cardOpportunities);
        Object.assign(cardMeta, result.cardMeta);
        mergeCounters(playStyle, result.playStyle);
        enemies[result.enemy] ||= { games: 0, wins: 0 };
        enemies[result.enemy].games++;
        enemies[result.enemy].wins += result.win ? 1 : 0;
    }
    return {
        winRate: wins / runs,
        averageTurns: turns / runs,
        averageHpLeft: hpLeft / runs,
        averageHpLeftOnWin: hpLeftOnWin / Math.max(1, wins),
        averageDamageTaken: damageTaken / runs,
        averageDamageDealt: damageDealt / runs,
        averageHealing: healing / runs,
        averageEnergyWasted: energyWasted / runs,
        energyWastedPerTurn: energyWasted / Math.max(1, turns),
        deathCauses,
        victoryCauses,
        cardUsage: summarizeCardUsage(cardPlays, cardOpportunities, cardMeta, runs),
        playStyle: Object.fromEntries(Object.entries(playStyle).map(([key, value]) => [key, value / runs])),
        enemies
    };
}

function simulateExpedition(data, roleId, buildId, runs, seed, mode, options = {}) {
    let clears = 0;
    let reached = Array(CHECKPOINTS.length).fill(0);
    let deaths = {};
    const loadout = getLoadout(data, roleId, buildId, mode, options.loadoutOverride);
    for (let i = 0; i < runs; i++) {
        const rng = createRng(seed + i * 104729);
        let deck = makeDeck(data, rng, roleId, buildId, 4, 6, loadout, options.disabledTags);
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
        model: args.mode === 'mature'
            ? 'mature build with epic core and three relics v3'
            : args.mode === 'mid'
                ? 'midgame build with one relic and no epic core v1'
                : 'pure card build v2',
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

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) run();

export {
    CHECKPOINTS,
    FOUNDATION,
    MIDGAME_RELICS,
    MATURE_LOADOUTS,
    createRng,
    getBuildPool,
    getLoadout,
    loadGameData,
    makeStarterDeck,
    simulateBattle,
    simulateCheckpoint,
    simulateExpedition
};
