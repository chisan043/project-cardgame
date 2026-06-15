// Battle lifecycle and combat math helpers. Animations and card execution stay in the main runtime.
(function exposeBattleRules(global) {
    'use strict';

    const ACTION_STATUS_LABELS = {
        poison: '剧毒',
        bleed: '流血',
        burn: '燃烧',
        stun: '眩晕',
        curse: '诅咒',
        vuln: '易伤',
        weak: '虚弱'
    };
    const ENEMY_ACTION_STATUS_KEYS = ['p_poison', 'p_bleed', 'p_burn', 'p_stun', 'p_curse', 'p_vuln', 'p_weak'];
    const PLAYER_ACTION_STATUS_KEYS = ['poison', 'bleed', 'burn', 'stun', 'curse', 'vuln', 'weak'];

    function getFrenzyBonus(card, {
        hasFrenzyVeil = false,
        discardCount = 0
    } = {}) {
        let bonus = (parseInt(card?.val) || 4) + (card?.up ? 4 : 3);
        if (hasFrenzyVeil) bonus += Math.floor(discardCount / 2);
        return bonus;
    }

    function getEnchantBonus(card, {
        includeRelics = true,
        hasEnchantCrystal = false
    } = {}) {
        let bonus = Math.max(4, (parseInt(card?.val) || 4) + (card?.up ? 4 : 2));
        if (includeRelics && hasEnchantCrystal) bonus *= 2;
        return bonus;
    }

    function getSwordBonus(card, {
        armor = 0,
        counter = 0,
        hasSwordOath = false
    } = {}) {
        if (!card?.tags?.includes('圣剑')) return 0;
        const swordRatio = hasSwordOath ? 0.7 : 0.5;
        return Math.floor((armor || 0) * swordRatio) + ((counter || 0) * 4);
    }

    function getCounterParryValue(incomingDamage) {
        const dmg = Math.max(0, Number(incomingDamage) || 0);
        return Math.min(dmg, Math.ceil(dmg * 0.5));
    }

    function getEncounterScale(type, floor = 1) {
        if (type === 'boss') return 1 + floor * 0.058;
        if (type === 'elite') return 1 + floor * 0.085;
        return 1 + floor * 0.1;
    }

    function getEnemyActionLifeTotal(state) {
        return Math.max(0, state?.enemy?.currentHp || 0) + Math.max(0, state?.enemy?.minion?.hp || 0);
    }

    function getBattleActionSnapshot(state = {}) {
        return {
            playerHp: state.hp || 0,
            playerArmor: state.armor || 0,
            enemyLife: getEnemyActionLifeTotal(state),
            enemyArmor: state.enemy?.armor || 0,
            enemyStatuses: Object.fromEntries(PLAYER_ACTION_STATUS_KEYS.map(k => [k, state.enemy?.[k] || 0])),
            playerStatuses: Object.fromEntries(ENEMY_ACTION_STATUS_KEYS.map(k => [k, state[k] || 0])),
            discardCount: state.discardPile?.length || 0,
            enemyMinionHp: state.enemy?.minion?.hp || 0
        };
    }

    function addStatusGainLines(parts, keys, beforeStatuses = {}, afterStatuses = {}) {
        keys.forEach(key => {
            const statusKey = key.replace(/^p_/, '');
            const gain = (afterStatuses[key] || afterStatuses[statusKey] || 0) - (beforeStatuses[key] || beforeStatuses[statusKey] || 0);
            if (gain > 0) parts.push(`施加${ACTION_STATUS_LABELS[statusKey]} ${gain} 层`);
        });
    }

    function describePlayerCardResult({
        after = {},
        before = {}
    } = {}) {
        const parts = [];
        const damage = Math.max(0, (before.enemyLife || 0) - (after.enemyLife || 0));
        const armorBreak = Math.max(0, (before.enemyArmor || 0) - (after.enemyArmor || 0));
        const shieldGain = Math.max(0, (after.playerArmor || 0) - (before.playerArmor || 0));
        const healGain = Math.max(0, (after.playerHp || 0) - (before.playerHp || 0));
        if (damage > 0) parts.push(`造成 ${damage} 点伤害`);
        else if (armorBreak > 0) parts.push(`削减 ${armorBreak} 点护甲`);
        if (shieldGain > 0) parts.push(`获得 ${shieldGain} 点护盾`);
        if (healGain > 0) parts.push(`回复 ${healGain} 点生命`);
        addStatusGainLines(parts, PLAYER_ACTION_STATUS_KEYS, before.enemyStatuses, after.enemyStatuses);
        return parts.length ? parts.join('，') : '完成效果';
    }

    function describeEnemyMoveResult(move, {
        after = {},
        before = {}
    } = {}) {
        const parts = [];
        const damage = Math.max(0, (before.playerHp || 0) - (after.playerHp || 0));
        const shieldGain = Math.max(0, (after.enemyArmor || 0) - (before.enemyArmor || 0));
        if (damage > 0) parts.push(`造成 ${damage} 点伤害`);
        else if (move?.type?.includes('attack')) parts.push('未造成生命伤害');
        if (shieldGain > 0) parts.push(`获得 ${shieldGain} 点护甲`);
        addStatusGainLines(parts, ENEMY_ACTION_STATUS_KEYS, before.playerStatuses, after.playerStatuses);
        const junkGain = Math.max(0, (after.discardCount || 0) - (before.discardCount || 0));
        if (move?.type === 'junk' && junkGain > 0) parts.push(`塞入 ${junkGain} 张诅咒牌`);
        const minionGain = Math.max(0, (after.enemyMinionHp || 0) - (before.enemyMinionHp || 0));
        if (move?.type === 'summon' && minionGain > 0) parts.push(`召唤 ${minionGain} 血分身`);
        if (move?.type === 'buff' && move.val > 0) parts.push(`力量提升 ${move.val}`);
        if (move?.type === 'buff_thorns' && move.val > 0) parts.push(`获得荆棘 ${move.val}`);
        if (move?.type === 'charge') parts.push('进入蓄力');
        if (move?.type === 'seal') parts.push(`封印 ${move.val} 张牌`);
        return parts.length ? parts.join('，') : '完成行动';
    }

    function getBaseEnemyName(enemy) {
        return (enemy?.name || '').replace(/·.*?(?=】)/, '').replace(/·暴走/g, '');
    }

    function getBattleBackgroundPathForEnemy(enemy, {
        backgroundByEnemy = {},
        fallbackBackground = ''
    } = {}) {
        return backgroundByEnemy[getBaseEnemyName(enemy)] || fallbackBackground;
    }

    function getEncounterBattleBackgroundPath({
        backgroundByEnemy = {},
        enemy = null,
        fallbackBackground = '',
        nodeBattleBackground = ''
    } = {}) {
        return nodeBattleBackground || getBattleBackgroundPathForEnemy(enemy, {
            backgroundByEnemy,
            fallbackBackground
        });
    }

    function resetPlayerBattleStatuses(state) {
        state.p_poison = 0;
        state.p_bleed = 0;
        state.p_burn = 0;
        state.p_stun = 0;
        state.p_curse = 0;
        state.p_vuln = 0;
        state.p_weak = 0;
        state.p_echo_stack = 0;
        state.p_next_dmg = 0;
        state.p_reduce_dmg = 0;
        state.p_counter = 0;
        state.p_battle_dmg = 0;
        state.p_dmg_buff = 0;
        state.p_chant = 0;
        state.p_aim = 0;
        state.p_sidestep = 0;
        state.p_blood_debt = 0;
        state.p_blood_debt_turns = 0;
        state.p_blood_debt_pending_damage = 0;
        state.p_crown_oath = false;
    }

    function resetBattleStartState(state, { hasBattleWhetstone = false } = {}) {
        resetPlayerBattleStatuses(state);
        state.r_discard_count = 0;
        state.next_card_echo = 0;
        state.lastPlayedCard = null;
        state.turn_first_card = true;
        state.isEnemyTurn = false;
        state.r_exile_cache_sidestep_used = false;
        state.r_signature_setup_used = false;
        state.r_signature_attack_ready = false;
        state.r_signature_archer_pending = false;
        state.r_warrior_start_used = false;
        state.r_warrior_start_ready = false;
        state.p_blood_debt_paid = 0;
        state.p_blood_debt_power = 1;
        state.r_counter_gate_used = false;
        state.r_protect_armor_used = false;
        state.r_bloodlet_hourglass_used = false;
        state.r_blood_debt_reduction_used = false;
        state.r_blood_clear_used = false;
        state.r_scarlet_whet_used = false;
        state.r_oath_transfusion_used = false;
        state.r_lifedebt_clear_used = false;
        if (hasBattleWhetstone) state.p_battle_dmg += 2;

        state.playedRetainPile = [];
        state.discardPile = [];
        state.exhaustPile = [];
        state.hand = [];
        state.armor = 0;
        state.player.thorns = 0;
    }

    function cleanupAfterBattleWin(state) {
        resetPlayerBattleStatuses(state);
        state.armor = 0;
        state.player.thorns = 0;
        state.p_buffs = {};
        state.deck.forEach(card => { card.sealed = false; });
        state.deck = state.deck.filter(card => !card.isJunk && !card.isKnife);
    }

    function getRuntimeFailureHint(state, cause = '') {
        const enemyHp = Math.max(0, state.enemy?.currentHp || 0);
        const enemyMaxHp = state.enemy?.maxHp || 0;
        const enemyHpRatio = enemyMaxHp ? enemyHp / enemyMaxHp : 1;
        const pendingBloodDebt = state.p_blood_debt_pending_damage || 0;
        if (cause === 'curse') {
            return '手牌中的诅咒反噬击倒了你：下次优先移除厄运印记，或在敌人塞牌后尽快打空手牌。';
        }
        if (pendingBloodDebt > 0) {
            return '血债清算压垮了你：下次需要在倒计时前用吸血或偿债牌还清。';
        }
        if (cause === 'status') {
            return '持续伤害结算击倒了你：下次要更早处理毒、流血、燃烧，或保留回复与减伤牌。';
        }
        if (enemyMaxHp > 0 && enemyHpRatio <= 0.25) {
            return `敌人只剩 ${Math.round(enemyHpRatio * 100)}% 生命：斩杀窗口接近，但需要保留爆发牌或补一张收束牌。`;
        }
        if ((state.armor || 0) <= 0 && (state.p_reduce_dmg || 0) <= 0 && (state.p_sidestep || 0) <= 0) {
            return '防线断档：下次需要在敌方攻击回合保留护盾、闪避、虚弱或眩晕。';
        }
        return '当前牌组没能同时接住输出与防线压力：下次优先补桥接牌、升级核心牌，或在事件中整理行囊。';
    }

    global.QuestersBattleRules = {
        cleanupAfterBattleWin,
        describeEnemyMoveResult,
        describePlayerCardResult,
        getBaseEnemyName,
        getBattleBackgroundPathForEnemy,
        getBattleActionSnapshot,
        getCounterParryValue,
        getEnchantBonus,
        getEnemyActionLifeTotal,
        getEncounterScale,
        getEncounterBattleBackgroundPath,
        getFrenzyBonus,
        getRuntimeFailureHint,
        getSwordBonus,
        resetBattleStartState,
        resetPlayerBattleStatuses
    };
})(window);
