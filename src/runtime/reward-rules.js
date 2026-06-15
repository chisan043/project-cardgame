// Side-effect-free reward helpers. DOM rendering and run-state mutation stay in the main runtime.
(function exposeRewardRules(global) {
    'use strict';

    function rollWeighted(pool, weightFn, rng = Math.random) {
        if (!pool.length) return null;
        const weighted = pool.map(item => ({ item, weight: Math.max(0.1, weightFn(item)) }));
        const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = rng() * total;
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) return entry.item;
        }
        return weighted[weighted.length - 1].item;
    }

    function rollRewardRarity({ floor = 1, rng = Math.random } = {}) {
        const floorBonus = Math.min(floor * 0.015, 0.14);
        const roll = rng();
        if (roll < 0.12 + floorBonus) return '史诗';
        if (roll < 0.68) return '稀有';
        return '普通';
    }

    function getCardChoiceKey(card) {
        return card?.specialId || card?.poolId || card?.name;
    }

    function getBattleRewardSkipGold({
        floor = 1,
        hasRewardCrown = false,
        hasCampfirePouch = false
    } = {}) {
        return 25 + Math.min(30, floor * 2) + (hasRewardCrown ? 15 : 0) + (hasCampfirePouch ? 10 : 0);
    }

    function getBattleWinRewards({
        enemyVulnerable = false,
        hasSilverPurse = false,
        hasFinisherCoin = false,
        hasWarmPendant = false
    } = {}) {
        return {
            gold: 30 + (hasSilverPurse ? 10 : 0) + (hasFinisherCoin && enemyVulnerable ? 10 : 0),
            heal: hasWarmPendant ? 6 : 0
        };
    }

    function getRewardOverlayPresentation({
        availableRelicCount = 0,
        relicChance = 0.2,
        rng = Math.random
    } = {}) {
        const isRelicReward = Number(availableRelicCount || 0) > 0 && rng() < relicChance;
        return isRelicReward
            ? {
                kind: 'relic',
                title: '奇珍战利品',
                desc: '战斗余烬里浮出三件奇珍，请选择一件收入囊中。'
            }
            : {
                kind: 'card',
                title: '卡牌战利品',
                desc: '战斗余烬仍在发光...请选择一张卡牌加入牌组。'
            };
    }

    function getRestHealResult({ hp = 0, maxHp = 0, heal = 30 } = {}) {
        const currentHp = Number(hp) || 0;
        const cap = Math.max(0, Number(maxHp) || 0);
        const nextHp = Math.min(cap, currentHp + heal);
        return {
            hp: nextHp,
            heal: Math.max(0, nextHp - currentHp)
        };
    }

    function getShopCopyPrice(card = {}, { hasCopySeal = false } = {}) {
        let price = 65;
        if (card.rarity === '稀有') price += 20;
        if (card.rarity === '史诗') price += 45;
        if (card.up) price += 25;
        if (hasCopySeal) price -= 20;
        return Math.max(30, price);
    }

    function getDeckBuildProfile({
        deck = [],
        directions = {},
        characterId = null,
        getExplicitBuildTags = () => [],
        getCardBuildTags = () => [],
        starterWeight = 0.25
    } = {}) {
        const profile = Object.fromEntries(Object.keys(directions).map(key => [key, 0]));
        deck.forEach(card => {
            const weight = card.isStarter ? starterWeight : 1;
            getExplicitBuildTags(card).forEach(tag => {
                if (profile[tag] !== undefined) profile[tag] += 2 * weight;
            });
            getCardBuildTags(card, characterId).forEach(tag => {
                if (profile[tag] !== undefined) profile[tag] += 1 * weight;
            });
        });
        return profile;
    }

    function getPrimaryBuildTag(profile = {}, {
        minScore = 1,
        minLead = 0.75
    } = {}) {
        const ranked = Object.entries(profile).sort((a, b) => b[1] - a[1]);
        if (!ranked.length || ranked[0][1] <= minScore) return null;
        if (ranked[1] && ranked[0][1] - ranked[1][1] < minLead) return null;
        return ranked[0][0];
    }

    function deckHasTag(tag, deck = []) {
        return deck.some(card => card.tags && card.tags.includes(tag));
    }

    function deckHasCardMatch(match, deck = []) {
        return deck.some(card => match(card));
    }

    function getRewardBridgeSpec(deck = [], characterId = 'hero_warrior') {
        const hasBleed = deckHasTag('出血', deck);
        const hasBloodlet = deckHasTag('放血', deck);
        if (hasBleed && !hasBloodlet) return { label: '出血缺放血', match: card => (card.tags || []).includes('放血') };
        if (hasBloodlet && !hasBleed) return { label: '放血缺出血', match: card => (card.tags || []).includes('出血') };

        if (characterId === 'hero_archer') {
            const hasExile = deckHasTag('放逐', deck);
            const hasRecycle = deckHasTag('回收', deck);
            if (hasExile && !hasRecycle) return { label: '放逐缺回收', match: card => (card.tags || []).includes('回收') };
            if (hasRecycle && !hasExile) return { label: '回收缺放逐', match: card => (card.tags || []).includes('放逐') };
        }

        if (characterId === 'hero_mage') {
            const hasCopy = deckHasTag('复刻', deck);
            const hasEcho = deckHasTag('回响', deck);
            if (hasCopy && !hasEcho) return { label: '复刻缺回响', match: card => (card.tags || []).includes('回响') };
            if (hasEcho && !hasCopy) return { label: '回响缺复刻', match: card => (card.tags || []).includes('复刻') };
        }

        if (characterId === 'hero_warrior') {
            const hasDebtGain = deckHasCardMatch(card => Number(card.bloodDebtGain) > 0, deck);
            const hasDebtRepay = deckHasCardMatch(card => Number(card.bloodDebtRepay) > 0 || Number(card.bloodDebtRepayFromBleed) > 0, deck);
            if (hasDebtGain && !hasDebtRepay) return { label: '血债缺偿债', match: card => Number(card.bloodDebtRepay) > 0 || Number(card.bloodDebtRepayFromBleed) > 0 };
            if (hasDebtRepay && !hasDebtGain) return { label: '偿债缺借债', match: card => Number(card.bloodDebtGain) > 0 };
        }

        return null;
    }

    function getRewardCandidatePool({
        classPool = [],
        neutralPool = [],
        mode = 'general',
        rarity = null,
        used = new Set(),
        primaryBuildTag = null,
        getCardBuildTags = () => [],
        rng = Math.random
    } = {}) {
        let candidates = [...classPool, ...neutralPool].filter(card => !used.has(getCardChoiceKey(card)));
        if (rarity) candidates = candidates.filter(card => card.rarity === rarity);
        if (mode === 'aligned' && primaryBuildTag) {
            candidates = candidates.filter(card => getCardBuildTags(card).includes(primaryBuildTag));
        } else if (mode === 'pivot' && primaryBuildTag) {
            candidates = candidates.filter(card => {
                const tags = getCardBuildTags(card);
                return tags.length && !tags.includes(primaryBuildTag);
            });
        } else if (mode === 'general') {
            candidates = candidates.filter(card => {
                const tags = getCardBuildTags(card);
                return !primaryBuildTag || !tags.includes(primaryBuildTag) || rng() < 0.68;
            });
        }
        return candidates;
    }

    function getBuildRewardCandidates({
        classPool = [],
        neutralPool = [],
        mode = 'general',
        rarity = null,
        used = new Set(),
        primaryBuildTag = null,
        getCardBuildTags = () => [],
        rng = Math.random
    } = {}) {
        let candidates = getRewardCandidatePool({
            classPool,
            neutralPool,
            mode,
            rarity,
            used,
            primaryBuildTag,
            getCardBuildTags,
            rng
        });
        if (!candidates.length) {
            candidates = getRewardCandidatePool({
                classPool,
                neutralPool,
                mode,
                used,
                primaryBuildTag,
                getCardBuildTags,
                rng
            });
        }
        return candidates;
    }

    function getBuildRewardWeight({
        tags = [],
        primaryBuildTag = null,
        boost = 1
    } = {}) {
        if (!tags.length) return 1;
        if (primaryBuildTag && tags.includes(primaryBuildTag)) return 4.2 * boost;
        return 0.95 * boost;
    }

    function getRewardCardCandidates({
        allCards = [],
        rarity = null,
        used = new Set()
    } = {}) {
        const unused = allCards.filter(card => !used.has(getCardChoiceKey(card)));
        let candidates = rarity ? unused.filter(card => card.rarity === rarity) : unused;
        if (!candidates.length) candidates = unused.filter(card => card.rarity === '稀有');
        if (!candidates.length) candidates = unused;
        return candidates;
    }

    function getRewardBridgeCandidates({
        allCards = [],
        bridgeSpec = null,
        used = new Set()
    } = {}) {
        if (!bridgeSpec) return [];
        return allCards.filter(card => bridgeSpec.match(card) && !used.has(getCardChoiceKey(card)));
    }

    function getRewardSlotPlan({ primaryBuildTag = null } = {}) {
        return primaryBuildTag
            ? ['aligned', 'general', 'pivot']
            : ['general', 'general', 'general'];
    }

    function getRewardFixedFallbackCandidates({
        allCards = [],
        used = new Set()
    } = {}) {
        const uniqueCandidates = allCards.filter(card => !used.has(getCardChoiceKey(card)));
        return uniqueCandidates.length ? uniqueCandidates : allCards;
    }

    function getSpecialEpicRewardChance({ floor = 1 } = {}) {
        return 0.12 + floor * 0.01;
    }

    function getSpecialEpicRewardWeight({
        tags = [],
        primaryBuildTag = null,
        boost = 1
    } = {}) {
        const baseWeight = primaryBuildTag && tags.includes(primaryBuildTag) ? 5 : 1;
        return Math.max(1, Math.round(baseWeight * boost));
    }

    global.QuestersRewardRules = {
        deckHasCardMatch,
        deckHasTag,
        getBattleRewardSkipGold,
        getBattleWinRewards,
        getBuildRewardCandidates,
        getBuildRewardWeight,
        getCardChoiceKey,
        getDeckBuildProfile,
        getPrimaryBuildTag,
        getRestHealResult,
        getRewardOverlayPresentation,
        getRewardBridgeSpec,
        getRewardBridgeCandidates,
        getRewardCardCandidates,
        getRewardCandidatePool,
        getRewardFixedFallbackCandidates,
        getRewardSlotPlan,
        getSpecialEpicRewardChance,
        getSpecialEpicRewardWeight,
        getShopCopyPrice,
        rollRewardRarity,
        rollWeighted
    };
})(window);
