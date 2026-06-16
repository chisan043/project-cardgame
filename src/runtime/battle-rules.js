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
        const swordRatio = hasSwordOath ? 0.55 : 0.4;
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

    function isAttackMove(move) {
        return (move?.type || '').includes('attack');
    }

    function getRandomMoveNoRepeat(maxCount, {
        history = [],
        rng = Math.random
    } = {}) {
        if (maxCount <= 1) return 0;
        const lastMove = history.length > 0 ? history[history.length - 1] : -1;
        let nextMove;
        let attempts = 0;
        do {
            nextMove = Math.floor(rng() * maxCount);
            attempts++;
        } while (nextMove === lastMove && attempts < 20);
        if (nextMove === lastMove) return (lastMove + 1) % maxCount;
        return nextMove;
    }

    function getRecentEnemyNonAttackCount(enemy = {}) {
        let count = 0;
        const history = enemy.moveHistory || [];
        for (let i = history.length - 1; i >= 0; i--) {
            const move = enemy.moves?.[history[i]];
            if (!move || isAttackMove(move)) break;
            count++;
        }
        return count;
    }

    function scoreEnemyMove(move, index, {
        aiConfig = {},
        enemy = {},
        maxNonAttack = 1,
        player = {},
        recentNonAttack = 0,
        rng = Math.random
    } = {}) {
        if (!move) return 1;
        const history = enemy.moveHistory || [];
        const lastMove = history.length > 0 ? history[history.length - 1] : -1;
        const enemyHpRatio = enemy.maxHp > 0 ? enemy.currentHp / enemy.maxHp : 1;
        const playerHpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 1;
        const aggression = aiConfig.aggression || 1;
        const isAttack = isAttackMove(move);
        let score = 10 + rng() * 8;

        if (isAttack) {
            score += 22 * aggression + (move.val || 0) * 0.35 + ((move.times || 1) - 1) * 6;
            if (playerHpRatio <= 0.35) score += 24;
            if (player.p_vuln > 0 || player.p_weak > 0 || player.p_bleed > 0 || player.p_poison > 0 || player.p_burn > 0) score += 10;
            if (player.armor > 14 && (move.times || 1) > 1) score -= 6;
            if (enemyHpRatio <= 0.35) score += move.type === 'attack_lifesteal' ? 24 : 10;
            if (recentNonAttack >= maxNonAttack) score += 45;
        } else {
            score -= recentNonAttack * 18;
            if (recentNonAttack >= maxNonAttack) score -= 40;
        }

        if (move.type === 'defend') {
            score += 10;
            if (enemyHpRatio <= 0.45) score += 12;
            if (enemy.armor > 0) score -= 16;
        }
        else if (move.type === 'debuff') {
            score += 16;
            const currentStatus = player[`p_${move.subType}`] || 0;
            if (currentStatus > 0) score -= 8;
            if (move.subType === 'vuln' && player.armor > 8) score += 10;
            if ((move.subType === 'bleed' || move.subType === 'poison' || move.subType === 'burn') && enemy.turnCount <= 2) score += 8;
            if ((move.subType === 'weak' || move.subType === 'stun') && player.armor > 12) score += 6;
            if (playerHpRatio <= 0.35) score -= 12;
        }
        else if (move.type === 'buff') {
            score += enemy.str > 4 ? 2 : 18;
            if (enemy.turnCount <= 1) score += 8;
        }
        else if (move.type === 'buff_thorns') {
            score += (enemy.thorns || 0) > 6 ? 2 : 18;
        }
        else if (move.type === 'charge') {
            score += enemy.charged ? -80 : 20;
            if (playerHpRatio <= 0.35) score -= 14;
        }
        else if (move.type === 'seal' || move.type === 'junk') {
            score += enemy.turnCount <= 2 ? 14 : 8;
            if (playerHpRatio <= 0.35) score -= 12;
        }
        else if (move.type === 'summon') {
            score += enemy.minion && enemy.minion.hp > 0 ? -70 : 22;
            if (enemyHpRatio <= 0.45) score += 8;
        }

        if (index === lastMove) score -= 18;
        const previousMove = history.length > 1 ? history[history.length - 2] : -1;
        if (index === lastMove && index === previousMove) score -= 60;
        return Math.max(1, score);
    }

    function chooseWeightedMoveIndex(scoredMoves, {
        rng = Math.random
    } = {}) {
        const total = scoredMoves.reduce((sum, item) => sum + Math.max(1, item.score), 0);
        let roll = rng() * total;
        for (const item of scoredMoves) {
            roll -= Math.max(1, item.score);
            if (roll <= 0) return item.index;
        }
        return scoredMoves[0]?.index || 0;
    }

    function getHighestScoredAttackMoveIndex({
        aiConfig = {},
        attackIndexes = [],
        enemy = {},
        player = {},
        rng = Math.random
    } = {}) {
        const recentNonAttack = getRecentEnemyNonAttackCount(enemy);
        let best = attackIndexes[0] || 0;
        let bestScore = -Infinity;
        attackIndexes.forEach(index => {
            const score = scoreEnemyMove(enemy.moves?.[index], index, {
                aiConfig,
                enemy,
                maxNonAttack: aiConfig.maxNonAttack || 1,
                player,
                recentNonAttack,
                rng
            });
            if (score > bestScore) {
                bestScore = score;
                best = index;
            }
        });
        return best;
    }

    function selectTacticalEnemyMoveIndex({
        aiConfig = {},
        enemy = {},
        player = {},
        rng = Math.random
    } = {}) {
        const moves = enemy.moves || [];
        if (moves.length <= 1) return 0;

        const opener = aiConfig.opener;
        if (enemy.turnCount === 0 && Number.isInteger(opener) && moves[opener]) return opener;

        const attackIndexes = moves
            .map((move, index) => isAttackMove(move) ? index : -1)
            .filter(index => index >= 0);
        if (attackIndexes.length === 0) return getRandomMoveNoRepeat(moves.length, {
            history: enemy.moveHistory,
            rng
        });

        if (enemy.charged) return getHighestScoredAttackMoveIndex({
            aiConfig,
            attackIndexes,
            enemy,
            player,
            rng
        });

        const recentNonAttack = getRecentEnemyNonAttackCount(enemy);
        const maxNonAttack = Number.isInteger(aiConfig.maxNonAttack) ? aiConfig.maxNonAttack : 1;
        if (recentNonAttack >= maxNonAttack) return getHighestScoredAttackMoveIndex({
            aiConfig,
            attackIndexes,
            enemy,
            player,
            rng
        });

        const scores = moves.map((move, index) => ({
            index,
            score: scoreEnemyMove(move, index, {
                aiConfig,
                enemy,
                maxNonAttack,
                player,
                recentNonAttack,
                rng
            })
        }));
        return chooseWeightedMoveIndex(scores, { rng });
    }

    function selectEnemyMoveIndex({
        enemy = {},
        player = {},
        rng = Math.random
    } = {}) {
        const aiConfig = enemy.ai || { type: 'random_no_repeat' };
        const movesCount = enemy.moves?.length || 0;
        let moveIndex = 0;

        if (aiConfig.type === 'tactical') {
            moveIndex = selectTacticalEnemyMoveIndex({
                aiConfig,
                enemy,
                player,
                rng
            });
        }
        else if (aiConfig.type === 'sequence') {
            const patternIdx = enemy.turnCount % aiConfig.pattern.length;
            moveIndex = aiConfig.pattern[patternIdx];
        }
        else if (aiConfig.type === 'first_turn_fixed') {
            if (enemy.turnCount === 0) {
                moveIndex = aiConfig.firstMove;
            } else {
                if (aiConfig.fallbackType === 'random_no_repeat') {
                    moveIndex = getRandomMoveNoRepeat(movesCount, {
                        history: enemy.moveHistory,
                        rng
                    });
                } else {
                    moveIndex = Math.floor(rng() * movesCount);
                }
            }
        }
        else if (aiConfig.type === 'random_no_repeat') {
            moveIndex = getRandomMoveNoRepeat(movesCount, {
                history: enemy.moveHistory,
                rng
            });
        }
        else {
            moveIndex = Math.floor(rng() * movesCount);
        }

        if (!Number.isInteger(moveIndex) || moveIndex < 0 || moveIndex >= movesCount) return 0;
        return moveIndex;
    }

    function appendBattleActionLogEntry(entries = [], entry = {}, {
        limit = 30
    } = {}) {
        return [entry, ...(Array.isArray(entries) ? entries : [])].slice(0, Math.max(1, limit));
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
        state.r_counter_gate_used = false;
        state.r_protect_armor_used = false;
        state.r_bloodlet_hourglass_used = false;
        state.r_blood_oath_reduction_used = false;
        state.r_scarlet_whet_used = false;
        state.r_vamp_ring_used = false;
        state.r_oath_transfusion_used = false;
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
        if (cause === 'curse') {
            return '手牌中的诅咒反噬击倒了你：下次优先移除厄运印记，或在敌人塞牌后尽快打空手牌。';
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
        appendBattleActionLogEntry,
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
        getHighestScoredAttackMoveIndex,
        getRandomMoveNoRepeat,
        getRecentEnemyNonAttackCount,
        getRuntimeFailureHint,
        getSwordBonus,
        chooseWeightedMoveIndex,
        scoreEnemyMove,
        selectEnemyMoveIndex,
        selectTacticalEnemyMoveIndex,
        resetBattleStartState,
        resetPlayerBattleStatuses
    };
})(window);
