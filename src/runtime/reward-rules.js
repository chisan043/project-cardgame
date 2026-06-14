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

    global.QuestersRewardRules = {
        getBattleRewardSkipGold,
        getCardChoiceKey,
        getRewardCandidatePool,
        rollRewardRarity,
        rollWeighted
    };
})(window);
