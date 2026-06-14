// Battle lifecycle helpers. Damage resolution, animations, and card execution stay in the main runtime.
(function exposeBattleRules(global) {
    'use strict';

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
        getRuntimeFailureHint,
        resetBattleStartState,
        resetPlayerBattleStatuses
    };
})(window);
