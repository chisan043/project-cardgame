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

    global.QuestersBattleRules = {
        cleanupAfterBattleWin,
        resetBattleStartState,
        resetPlayerBattleStatuses
    };
})(window);
