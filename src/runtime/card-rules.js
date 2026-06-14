// Side-effect-free card instance and upgrade helpers. Rendering stays in the main runtime.
(function exposeCardRules(global) {
    'use strict';

    function createId(rng = Math.random) {
        return rng().toString(36).substr(2, 9);
    }

    function clonePlain(value) {
        return JSON.parse(JSON.stringify(value));
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

    function upgradeCard(card) {
        if (card.rarity === '传说' || card.up) return false;
        const oldVal = Number(card.val) || 0;
        const oldCost = Number(card.cost) || 0;
        if (oldVal > 0) {
            card.val = oldVal * 2;
            if (card.tags && card.tags.includes('放逐') && card.type !== '能力') card.val += 2;
        } else if (oldCost > 0 && card.type !== '能力') {
            card.cost = Math.max(0, oldCost - 1);
        } else if (oldVal <= 0 && oldCost <= 0) {
            card.val = 1;
        }
        syncUpgradedCardDescription(card, oldVal, Number(card.val) || 0);
        card.rarity = '史诗';
        card.up = true;
        return true;
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
        buildStarterDeckForCharacter,
        cloneCardDefinition,
        cloneSpecialEpic,
        copyDeckCard,
        createStarterCard,
        syncUpgradedCardDescription,
        upgradeCard
    };
})(window);
