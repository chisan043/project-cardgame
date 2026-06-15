// Serializable run-state helpers. DOM updates and card cleanup stay in the main runtime.
(function exposeStateRules(global) {
    'use strict';

    function createEnemyState() {
        return {
            currentHp: 0,
            armor: 0,
            poison: 0,
            bleed: 0,
            burn: 0,
            stun: 0,
            curse: 0,
            vuln: 0,
            weak: 0,
            str: 0,
            nextMove: null,
            charged: false,
            minion: null,
            isPhase2: false,
            turnCount: 0,
            moveHistory: []
        };
    }

    function createInitialState() {
        return {
            hp: 80,
            maxHp: 80,
            mp: 5,
            gold: 50,
            floor: 0,
            armor: 0,
            deck: [],
            battleDeck: [],
            discardPile: [],
            exhaustPile: [],
            hand: [],
            relics: [],
            playedRetainPile: [],
            lastPlayedCard: null,
            enemy: createEnemyState(),
            mapData: [],
            currentNode: null,
            pathHistory: [],
            player: { thorns: 0, characterId: 'hero_warrior', name: '勇者战士' },
            p_poison: 0,
            p_bleed: 0,
            p_burn: 0,
            p_stun: 0,
            p_curse: 0,
            p_vuln: 0,
            p_weak: 0,
            p_echo_stack: 0,
            p_next_dmg: 0,
            p_reduce_dmg: 0,
            p_counter: 0,
            p_battle_dmg: 0,
            p_dmg_buff: 0,
            p_chant: 0,
            p_aim: 0,
            p_sidestep: 0,
            p_blood_debt: 0,
            p_blood_debt_turns: 0,
            p_blood_debt_pending_damage: 0,
            p_blood_debt_paid: 0,
            p_blood_debt_power: 1,
            r_discard_count: 0,
            isNodeClickLocked: false,
            next_card_echo: 0,
            turn_first_card: true,
            currentShop: null,
            isEnemyTurn: false,
            battleLog: []
        };
    }

    function createRunSavePayload(state, { shopDeletePrice = 50, savedAt = Date.now() } = {}) {
        return {
            version: 1,
            savedAt,
            floor: state.floor,
            hp: state.hp,
            maxHp: state.maxHp,
            gold: state.gold,
            deck: state.deck,
            relics: state.relics,
            mapData: state.mapData,
            pathHistory: state.pathHistory,
            currentNodeId: state.currentNode?.id || null,
            player: state.player,
            shopDeletePrice
        };
    }

    function findMapNodeById(mapData, nodeId) {
        if (!nodeId || !Array.isArray(mapData)) return null;
        for (const floor of mapData) {
            const node = floor?.nodes?.find(candidate => candidate.id === nodeId);
            if (node) return node;
        }
        return null;
    }

    function resolveSavedCurrentNode(mapData, pathHistory, savedNodeId) {
        const fallbackId = pathHistory?.length ? pathHistory[pathHistory.length - 1] : null;
        return findMapNodeById(mapData, savedNodeId || fallbackId);
    }

    function resolveCharacter(characters = {}, characterId = 'hero_warrior', fallbackCharacterId = 'hero_warrior') {
        return characters[characterId] || characters[fallbackCharacterId] || {};
    }

    function getCharacterBaseEnergy(character = {}, { hasBaseEnergyRelic = false } = {}) {
        return (character.baseEnergy || 5) + (hasBaseEnergyRelic ? 1 : 0);
    }

    function getCharacterTurnDrawCount(character = {}, { hasFirstDrawRelic = false } = {}) {
        return (character.openingHand || 5) + (hasFirstDrawRelic ? 1 : 0);
    }

    function getCharacterRunStats(character = {}, {
        hasBaseEnergyRelic = false
    } = {}) {
        const maxHp = character.maxHp || 80;
        return {
            gold: character.startingGold ?? 50,
            hp: maxHp,
            maxHp,
            mp: getCharacterBaseEnergy(character, { hasBaseEnergyRelic }),
            player: {
                characterId: character.id || 'hero_warrior',
                name: character.name || '勇者战士'
            }
        };
    }

    global.QuestersStateRules = {
        createEnemyState,
        createInitialState,
        createRunSavePayload,
        findMapNodeById,
        getCharacterBaseEnergy,
        getCharacterRunStats,
        getCharacterTurnDrawCount,
        resolveCharacter,
        resolveSavedCurrentNode
    };
})(window);
