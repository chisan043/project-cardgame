// Side-effect-free card instance and upgrade helpers. Rendering stays in the main runtime.
(function exposeCardRules(global) {
    'use strict';

    function createId(rng = Math.random) {
        return rng().toString(36).substr(2, 9);
    }

    function clonePlain(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function ensureBattleCardInstanceId(card, { rng = Math.random } = {}) {
        if (!card) return card;
        if (!card.instId) card.instId = createId(rng);
        if (!Array.isArray(card.tags)) card.tags = [];
        return card;
    }

    function getAutoSelectKey(card) {
        return String(card?.instId || card?.id || card?.poolId || card?.name || '');
    }

    function getAutoCardPriority(card, {
        mode = 'keep',
        getScaledCardValue = candidate => Number(candidate?.val) || 0,
        hasDirectCardEffect = () => false
    } = {}) {
        if (!card) return -9999;
        if (card.isJunk) return -5000;
        const tags = card.tags || [];
        const rarityScore = card.rarity === '史诗' ? 9 : card.rarity === '稀有' ? 5 : 2;
        const valueScore = Math.min(18, Math.max(0, getScaledCardValue(card) || Number(card.val) || 0));
        const costPenalty = Math.max(0, Number(card.cost) || 0) * 2;
        let score = rarityScore + valueScore - costPenalty;
        if (card.type === '攻击') score += 2;
        if (tags.includes('抽牌') || hasDirectCardEffect(card, 'draw')) score += 5;
        if (tags.includes('充能') || hasDirectCardEffect(card, 'energy')) score += 4;
        if (tags.includes('回收') || tags.includes('复刻') || tags.includes('回响')) score += 5;
        if (tags.includes('保留') || hasDirectCardEffect(card, 'retain')) score += 3;
        if (tags.includes('销毁')) score -= 3;
        if (mode === 'returnToHand') score += Math.max(0, 3 - (Number(card.cost) || 0)) * 3;
        if (mode === 'returnToDraw') score += tags.includes('回收') || tags.includes('放逐') ? 2 : 0;
        return score;
    }

    function getAutoSelectableCards(sourceArray = [], {
        excludedKeys = new Set()
    } = {}) {
        return (Array.isArray(sourceArray) ? sourceArray : [])
            .filter(card => card && !card.sealed && !excludedKeys.has(getAutoSelectKey(card)));
    }

    function autoSelectLowestPriorityCards(sourceArray = [], count = 0, options = {}) {
        return getAutoSelectableCards(sourceArray, options)
            .sort((a, b) => getAutoCardPriority(a, options) - getAutoCardPriority(b, options))
            .slice(0, count);
    }

    function autoSelectHighestPriorityCards(sourceArray = [], count = 0, options = {}) {
        return getAutoSelectableCards(sourceArray, options)
            .sort((a, b) => getAutoCardPriority(b, options) - getAutoCardPriority(a, options))
            .slice(0, count);
    }

    function normalizeTags(tags, normalizeTagConflicts = tags => tags) {
        return normalizeTagConflicts(Array.isArray(tags) ? tags : []);
    }

    function cloneCardDefinition(cardDef, {
        normalizeTagConflicts = tags => tags,
        applyCardTagBudget = card => card,
        getCardBuildTags = () => [],
        rng = Math.random
    } = {}) {
        const card = clonePlain(cardDef);
        card.id = createId(rng);
        card.tags = normalizeTags(card.tags, normalizeTagConflicts);
        card.rarity = card.rarity || '普通';
        card.buildTags = getCardBuildTags(cardDef);
        card.up = !!card.up;
        return applyCardTagBudget(card);
    }

    function cloneSpecialEpic(special, {
        extractTagsFromText = () => [],
        normalizeTagConflicts = tags => tags,
        applyCardTagBudget = card => card,
        getCardBuildTags = () => [],
        rng = Math.random
    } = {}) {
        const sTags = extractTagsFromText(special?.desc || '');
        if (special?.tags) special.tags.forEach(tag => {
            if (!sTags.includes(tag)) sTags.push(tag);
        });
        return applyCardTagBudget({
            ...clonePlain(special),
            id: createId(rng),
            specialId: special.id,
            tags: normalizeTags(sTags, normalizeTagConflicts),
            buildTags: getCardBuildTags(special),
            up: false
        });
    }

    function createStarterCard(cardDefinition, {
        normalizeTagConflicts = tags => tags,
        applyCardTagBudget = card => card,
        rng = Math.random
    } = {}) {
        const definition = clonePlain(cardDefinition);
        delete definition.copies;
        return applyCardTagBudget({
            ...definition,
            id: createId(rng),
            tags: normalizeTags(definition.tags, normalizeTagConflicts),
            isStarter: true,
            up: false
        });
    }

    function buildStarterDeckForCharacter(characterId, {
        characters = {},
        starterDecks = {},
        fallbackCharacterId = 'hero_warrior',
        fallbackStarterDeckId = 'starter_warrior',
        createStarterCardOptions = {}
    } = {}) {
        const character = characters[characterId] || characters[fallbackCharacterId] || {};
        const starter = starterDecks[character.starterDeckId] || starterDecks[fallbackStarterDeckId] || { cards: [] };
        return starter.cards.flatMap(card => Array.from(
            { length: Math.max(1, Number(card.copies) || 1) },
            () => createStarterCard(card, createStarterCardOptions)
        ));
    }

    function syncUpgradedCardDescription(card, oldVal, newVal) {
        if (!card.desc || !oldVal || oldVal === newVal) return;
        const replacements = [
            [`造成 ${oldVal}`, `造成 ${newVal}`],
            [`获得 ${oldVal}`, `获得 ${newVal}`],
            [`施加 ${oldVal}`, `施加 ${newVal}`],
            [`回复 ${oldVal}`, `回复 ${newVal}`]
        ];
        for (const [from, to] of replacements) {
            if (card.desc.includes(from)) {
                card.desc = card.desc.replace(from, to);
                return;
            }
        }
    }

    function isMagicSwordCard(card) {
        return card && (card.poolId === 'warrior_magic_sword' || card.name === '魔剑');
    }

    function upgradeMagicSword(card) {
        const oldGrowth = Math.max(1, Math.floor(Number(card.magicSwordGrowth) || 1));
        card.magicSwordGrowth = Math.max(2, oldGrowth + 1);
        if (card.desc) {
            card.desc = card.desc.replace(`永久 +${oldGrowth} 伤害`, `永久 +${card.magicSwordGrowth} 伤害`);
        }
    }

    function upgradeCard(card) {
        if (card.rarity === '传说' || card.up) return false;
        const oldVal = Number(card.val) || 0;
        const oldCost = Number(card.cost) || 0;
        if (isMagicSwordCard(card)) {
            upgradeMagicSword(card);
        } else if (oldVal > 0) {
            card.val = oldVal * 2;
            if (card.tags && card.tags.includes('放逐') && card.type !== '能力') card.val += 2;
        } else if (oldCost > 0 && card.type !== '能力') {
            card.cost = Math.max(0, oldCost - 1);
        } else if (oldVal <= 0 && oldCost <= 0) {
            card.val = 1;
        }
        if (!isMagicSwordCard(card)) syncUpgradedCardDescription(card, oldVal, Number(card.val) || 0);
        card.rarity = '史诗';
        card.up = true;
        return true;
    }

    function createUpgradePreviewCard(card) {
        const preview = clonePlain(card);
        upgradeCard(preview);
        return preview;
    }

    function copyDeckCard(card, cloneOptions = {}) {
        const clone = cloneCardDefinition(card, cloneOptions);
        delete clone.instId;
        delete clone.purchased;
        delete clone._roleSynergyKey;
        clone.sealed = false;
        return clone;
    }

    global.QuestersCardRules = {
        autoSelectHighestPriorityCards,
        autoSelectLowestPriorityCards,
        buildStarterDeckForCharacter,
        cloneCardDefinition,
        cloneSpecialEpic,
        copyDeckCard,
        createUpgradePreviewCard,
        createStarterCard,
        ensureBattleCardInstanceId,
        getAutoCardPriority,
        getAutoSelectKey,
        syncUpgradedCardDescription,
        upgradeCard
    };
})(window);
