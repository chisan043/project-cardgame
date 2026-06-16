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

    function getEncounterRewardProfile(encounterType = 'battle') {
        if (encounterType === 'boss') return {
            goldBonus: 80,
            skipGoldBonus: 45,
            floorRarityBonus: 0.16,
            relicChanceBonus: 0.26,
            cardChoices: 5
        };
        if (encounterType === 'elite') return {
            goldBonus: 35,
            skipGoldBonus: 20,
            floorRarityBonus: 0.1,
            relicChanceBonus: 0.16,
            cardChoices: 5
        };
        return {
            goldBonus: 0,
            skipGoldBonus: 0,
            floorRarityBonus: 0,
            relicChanceBonus: 0,
            cardChoices: 3
        };
    }

    function rollRewardRarity({ floor = 1, encounterType = 'battle', rng = Math.random } = {}) {
        const profile = getEncounterRewardProfile(encounterType);
        const floorBonus = Math.min(floor * 0.015 + profile.floorRarityBonus, 0.26);
        const roll = rng();
        if (roll < 0.12 + floorBonus) return '史诗';
        if (roll < 0.68 + profile.floorRarityBonus * 0.5) return '稀有';
        return '普通';
    }

    function getCardChoiceKey(card) {
        return card?.specialId || card?.poolId || card?.name;
    }

    function getBattleRewardSkipGold({
        floor = 1,
        encounterType = 'battle',
        hasRewardCrown = false,
        hasCampfirePouch = false
    } = {}) {
        const profile = getEncounterRewardProfile(encounterType);
        return 25 + Math.min(30, floor * 2) + profile.skipGoldBonus + (hasRewardCrown ? 15 : 0) + (hasCampfirePouch ? 10 : 0);
    }

    function getBattleWinRewards({
        encounterType = 'battle',
        enemyVulnerable = false,
        hasSilverPurse = false,
        hasFinisherCoin = false,
        hasWarmPendant = false,
        hasStartArcher = false
    } = {}) {
        const profile = getEncounterRewardProfile(encounterType);
        return {
            gold: 30 + profile.goldBonus + (hasSilverPurse ? 10 : 0) + (hasFinisherCoin && enemyVulnerable ? 10 : 0),
            heal: (hasWarmPendant ? 6 : 0) + (hasStartArcher ? 16 : 0)
        };
    }

    function getRewardOverlayPresentation({
        availableRelicCount = 0,
        encounterType = 'battle',
        relicChance = 0.2,
        rng = Math.random
    } = {}) {
        const profile = getEncounterRewardProfile(encounterType);
        const finalRelicChance = Math.min(0.65, relicChance + profile.relicChanceBonus);
        const isRelicReward = Number(availableRelicCount || 0) > 0 && rng() < finalRelicChance;
        return isRelicReward
            ? {
                kind: 'relic',
                title: encounterType === 'boss' ? '首领奇珍' : encounterType === 'elite' ? '精英奇珍' : '奇珍战利品',
                desc: encounterType === 'battle' ? '战斗余烬里浮出三件奇珍，请选择一件收入囊中。' : '强敌遗留的战利品更丰厚，请选择一件收入囊中。'
            }
            : {
                kind: 'card',
                title: encounterType === 'boss' ? '首领卡牌战利品' : encounterType === 'elite' ? '精英卡牌战利品' : '卡牌战利品',
                desc: encounterType === 'battle' ? '战斗余烬仍在发光...请选择一张卡牌加入牌组。' : '强敌战利品会提供更多选择，并提高稀有牌出现概率。'
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

    function getGoldSpendResult({
        gold = 0,
        price = 0
    } = {}) {
        const currentGold = Number(gold) || 0;
        const cost = Math.max(0, Number(price) || 0);
        if (currentGold < cost) {
            return {
                canSpend: false,
                gold: currentGold,
                spent: 0
            };
        }
        return {
            canSpend: true,
            gold: currentGold - cost,
            spent: cost
        };
    }

    function getShopDeleteResult({
        deletePrice = 50,
        deleteStep = 25,
        gold = 0
    } = {}) {
        const currentDeletePrice = Math.max(0, Number(deletePrice) || 0);
        const spend = getGoldSpendResult({
            gold,
            price: currentDeletePrice
        });
        return {
            canDelete: spend.canSpend,
            deletePrice: spend.canSpend ? currentDeletePrice + deleteStep : currentDeletePrice,
            gold: spend.gold,
            spent: spend.spent
        };
    }

    function getShopRefreshResult({
        isFree = false,
        gold = 0,
        refreshCost = 10,
        refreshStep = 10
    } = {}) {
        const currentGold = Number(gold) || 0;
        const currentRefreshCost = Math.max(0, Number(refreshCost) || 0);
        const cost = isFree ? 0 : currentRefreshCost;
        if (currentGold < cost) {
            return {
                canRefresh: false,
                gold: currentGold,
                refreshCost: currentRefreshCost,
                spent: 0
            };
        }
        return {
            canRefresh: true,
            gold: currentGold - cost,
            refreshCost: isFree ? currentRefreshCost : currentRefreshCost + refreshStep,
            spent: cost
        };
    }

    function getShopCardBasePrice({ rng = Math.random } = {}) {
        return 40 + Math.floor(rng() * 20);
    }

    function getSalePrice(price, { isSale = false, saleMultiplier = 0.5 } = {}) {
        const basePrice = Math.max(0, Number(price) || 0);
        return isSale ? Math.floor(basePrice * saleMultiplier) : basePrice;
    }

    function buildShopInventory({
        cards = [],
        relics = [],
        rng = Math.random
    } = {}) {
        const shopCards = cards.map(card => ({ ...card }));
        const shopRelics = relics.map(relic => ({ ...relic }));
        const allItems = [...shopCards, ...shopRelics];
        if (allItems.length) {
            const discountIdx = Math.min(allItems.length - 1, Math.floor(rng() * allItems.length));
            allItems[discountIdx].isSale = true;
        }

        shopCards.forEach(card => {
            const basePrice = getShopCardBasePrice({ rng });
            card.originalPrice = basePrice;
            card.price = getSalePrice(basePrice, { isSale: card.isSale });
        });
        shopRelics.forEach(relic => {
            const basePrice = Number(relic.price) || 0;
            relic.originalPrice = basePrice;
            relic.price = getSalePrice(basePrice, { isSale: relic.isSale });
        });
        return {
            cards: shopCards,
            relics: shopRelics
        };
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
            const hasBloodOathCost = deckHasCardMatch(card => Number(card.bloodOathCost) > 0, deck);
            const hasBloodOathPayoff = deckHasCardMatch(card => Number(card.bloodOathMissingRatio) > 0, deck);
            const hasBloodRecovery = deckHasCardMatch(card => (card.tags || []).includes('吸血') || (card.tags || []).includes('治愈') || Number(card.healValue) > 0, deck);
            if (hasBloodOathCost && !hasBloodOathPayoff) return { label: '血誓魔剑缺爆发', match: card => Number(card.bloodOathMissingRatio) > 0 };
            if (hasBloodOathCost && !hasBloodRecovery) return { label: '血誓魔剑缺回血', match: card => (card.tags || []).includes('吸血') || (card.tags || []).includes('治愈') || Number(card.healValue) > 0 };
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

    function getRelicBuildRewardWeight({
        tags = [],
        primaryBuildTag = null
    } = {}) {
        if (!tags.length) return 1;
        if (primaryBuildTag && tags.includes(primaryBuildTag)) return 2;
        return 1.1;
    }

    function getBuildRewardBoostMultiplier({
        tags = [],
        boostedTags = [],
        hasGrayMarketMap = false
    } = {}) {
        let multiplier = 1;
        if (hasGrayMarketMap && tags.length) multiplier *= 1.25;
        if (!boostedTags.length || !tags.length) return multiplier;
        return boostedTags.some(tag => tags.includes(tag)) ? multiplier * 1.35 : multiplier;
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

    function pickRandomCandidate(pool = [], rng = Math.random) {
        if (!pool.length) return null;
        const index = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
        return pool[index];
    }

    function pickRewardCardCandidate({
        allCards = [],
        rarity = null,
        used = new Set(),
        rng = Math.random
    } = {}) {
        return pickRandomCandidate(getRewardCardCandidates({
            allCards,
            rarity,
            used
        }), rng);
    }

    function getRewardBridgeCandidates({
        allCards = [],
        bridgeSpec = null,
        used = new Set()
    } = {}) {
        if (!bridgeSpec) return [];
        return allCards.filter(card => bridgeSpec.match(card) && !used.has(getCardChoiceKey(card)));
    }

    function pickRewardBridgeCard({
        allCards = [],
        bridgeSpec = null,
        used = new Set(),
        rng = Math.random
    } = {}) {
        return pickRandomCandidate(getRewardBridgeCandidates({
            allCards,
            bridgeSpec,
            used
        }), rng);
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

    function pickRewardFixedFallbackCandidate({
        allCards = [],
        used = new Set(),
        rng = Math.random
    } = {}) {
        return pickRandomCandidate(getRewardFixedFallbackCandidates({
            allCards,
            used
        }), rng);
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

    function getWeightedSpecialEpicPool({
        specialPool = [],
        primaryBuildTag = null,
        getCardBuildTags = () => [],
        getBoostMultiplier = () => 1
    } = {}) {
        if (!primaryBuildTag) return specialPool;
        const weighted = [];
        specialPool.forEach(card => {
            const tags = getCardBuildTags(card);
            const weight = getSpecialEpicRewardWeight({
                tags,
                primaryBuildTag,
                boost: getBoostMultiplier(tags, card)
            });
            for (let i = 0; i < weight; i++) weighted.push(card);
        });
        return weighted.length ? weighted : specialPool;
    }

    function pickSpecialEpicRewardCard({
        specialPool = [],
        used = new Set(),
        rng = Math.random
    } = {}) {
        return pickRandomCandidate(
            specialPool.filter(card => !used.has(getCardChoiceKey(card))),
            rng
        );
    }

    function buildRewardChoices({
        count = 3,
        bridgeSpec = null,
        primaryBuildTag = null,
        makeBridgeRewardCard = () => null,
        makeBuildRewardCard = () => null,
        makeGeneralRewardCard = () => null,
        makeFixedFallbackRewardCard = () => null,
        maxGeneralAttempts = 40
    } = {}) {
        const choices = [];
        const used = new Set();
        const addChoice = (card, { allowDuplicate = false } = {}) => {
            if (!card || choices.length >= count) return false;
            const key = getCardChoiceKey(card);
            if (used.has(key) && !allowDuplicate) return false;
            used.add(key);
            choices.push(card);
            return true;
        };

        if (bridgeSpec) addChoice(makeBridgeRewardCard(bridgeSpec, used));

        const slotPlan = getRewardSlotPlan({ primaryBuildTag });
        for (const mode of slotPlan) {
            if (choices.length >= count) break;
            addChoice(makeBuildRewardCard(mode, used, primaryBuildTag));
        }

        let guard = 0;
        while (choices.length < count && guard < maxGeneralAttempts) {
            guard++;
            const card = makeGeneralRewardCard(used);
            if (!card) break;
            addChoice(card);
        }

        while (choices.length < count) {
            const card = makeFixedFallbackRewardCard(used);
            if (!card) break;
            addChoice(card, { allowDuplicate: true });
        }

        return choices;
    }

    function buildRewardChoiceCards({
        count = 3,
        deck = [],
        characterId = 'hero_warrior',
        classPool = [],
        neutralPool = [],
        specialPool = [],
        floor = 1,
        primaryBuildTag = null,
        getCardBuildTags = () => [],
        getBoostMultiplier = () => 1,
        cloneCard = card => card,
        cloneSpecial = card => cloneCard(card),
        rollRarity = () => rollRewardRarity({ floor }),
        rng = Math.random
    } = {}) {
        const allCards = [...classPool, ...neutralPool];
        const bridgeSpec = getRewardBridgeSpec(deck, characterId);
        const getTags = card => getCardBuildTags(card, characterId);
        const clonePickedCard = card => (card ? cloneCard(card) : null);

        return buildRewardChoices({
            count,
            bridgeSpec,
            primaryBuildTag,
            makeBridgeRewardCard: (spec, used) => clonePickedCard(pickRewardBridgeCard({
                allCards,
                bridgeSpec: spec,
                used,
                rng
            })),
            makeBuildRewardCard: (mode, used, activePrimaryBuildTag) => {
                const rarity = rollRarity({ floor, mode, used });
                const candidates = getBuildRewardCandidates({
                    classPool,
                    neutralPool,
                    mode,
                    rarity,
                    used,
                    primaryBuildTag: activePrimaryBuildTag,
                    getCardBuildTags: getTags,
                    rng
                });
                if (!candidates.length) return null;
                const weightPrimaryTag = mode === 'aligned' ? activePrimaryBuildTag : null;
                const picked = rollWeighted(candidates, card => {
                    const tags = getTags(card);
                    return getBuildRewardWeight({
                        tags,
                        primaryBuildTag: weightPrimaryTag,
                        boost: getBoostMultiplier(tags, card, mode)
                    });
                }, rng);
                return clonePickedCard(picked);
            },
            makeGeneralRewardCard: used => {
                if (rng() < getSpecialEpicRewardChance({ floor })) {
                    const special = pickSpecialEpicRewardCard({ specialPool, used, rng });
                    if (special) return cloneSpecial(special);
                }

                const rarity = rollRarity({ floor, mode: 'general', used });
                return clonePickedCard(pickRewardCardCandidate({
                    allCards,
                    rarity,
                    used,
                    rng
                }));
            },
            makeFixedFallbackRewardCard: used => clonePickedCard(pickRewardFixedFallbackCandidate({
                allCards,
                used,
                rng
            }))
        });
    }

    function getWeightedRelicOrder({
        relics = [],
        getWeight = () => 1,
        rng = Math.random
    } = {}) {
        const result = [];
        const rest = relics.slice();
        while (rest.length) {
            const picked = rollWeighted(rest, getWeight, rng);
            const idx = rest.indexOf(picked);
            result.push(picked);
            rest.splice(idx, 1);
        }
        return result;
    }

    function pickWeightedRelic({
        relics = [],
        getWeight = () => 1,
        rng = Math.random
    } = {}) {
        return rollWeighted(relics, getWeight, rng);
    }

    function getRelicRoleSet(characterId = 'hero_warrior', {
        roleRelicIds = {}
    } = {}) {
        return roleRelicIds[characterId] || null;
    }

    function isCommonRelic(relic, {
        commonRelicIds = new Set()
    } = {}) {
        return !!(relic && commonRelicIds.has(relic.id));
    }

    function isRoleRelic(relic, {
        characterId = 'hero_warrior',
        commonRelicIds = new Set(),
        roleRelicIds = {}
    } = {}) {
        const roleSet = getRelicRoleSet(characterId, { roleRelicIds });
        return !!(roleSet && relic && (roleSet.has(relic.id) || isCommonRelic(relic, { commonRelicIds })));
    }

    function getRoleRelicPool({
        characterId = 'hero_warrior',
        commonRelicIds = new Set(),
        preferRelic = () => true,
        relics = [],
        roleRelicIds = {},
        startingRelicIds = new Set()
    } = {}) {
        const pool = Array.isArray(relics) ? relics.slice() : [];
        const preferred = pool.filter(preferRelic);
        const prioritizedPool = preferred.length ? preferred : pool;
        return prioritizedPool.filter(relic => (
            isRoleRelic(relic, { characterId, commonRelicIds, roleRelicIds })
            && !startingRelicIds.has(relic.id)
        ));
    }

    function getRolePreferredRelics({
        characterId = 'hero_warrior',
        commonRelicIds = new Set(),
        getWeight = () => 1,
        preferRelic = () => true,
        relics = [],
        rng = Math.random,
        roleRelicIds = {},
        startingRelicIds = new Set()
    } = {}) {
        return getWeightedRelicOrder({
            relics: getRoleRelicPool({
                characterId,
                commonRelicIds,
                preferRelic,
                relics,
                roleRelicIds,
                startingRelicIds
            }),
            getWeight,
            rng
        });
    }

    function pickRolePreferredRelic({
        characterId = 'hero_warrior',
        commonRelicIds = new Set(),
        getWeight = () => 1,
        preferRelic = () => true,
        relics = [],
        rng = Math.random,
        roleRelicIds = {},
        startingRelicIds = new Set()
    } = {}) {
        const pool = getRoleRelicPool({
            characterId,
            commonRelicIds,
            preferRelic,
            relics,
            roleRelicIds,
            startingRelicIds
        });
        if (!pool.length) return null;
        return pickWeightedRelic({ relics: pool, getWeight, rng });
    }

    global.QuestersRewardRules = {
        buildRewardChoiceCards,
        buildRewardChoices,
        deckHasCardMatch,
        deckHasTag,
        getBattleRewardSkipGold,
        getBattleWinRewards,
        getEncounterRewardProfile,
        getBuildRewardCandidates,
        getBuildRewardBoostMultiplier,
        getBuildRewardWeight,
        getRelicBuildRewardWeight,
        getCardChoiceKey,
        getDeckBuildProfile,
        getPrimaryBuildTag,
        getRelicRoleSet,
        getRestHealResult,
        getRolePreferredRelics,
        getRoleRelicPool,
        getRewardOverlayPresentation,
        getSalePrice,
        getRewardBridgeSpec,
        getRewardBridgeCandidates,
        getRewardCardCandidates,
        getRewardCandidatePool,
        getRewardFixedFallbackCandidates,
        getRewardSlotPlan,
        getSpecialEpicRewardChance,
        getSpecialEpicRewardWeight,
        getWeightedSpecialEpicPool,
        getGoldSpendResult,
        buildShopInventory,
        getShopCardBasePrice,
        getShopCopyPrice,
        getShopDeleteResult,
        getShopRefreshResult,
        pickRewardBridgeCard,
        pickRewardCardCandidate,
        pickRewardFixedFallbackCandidate,
        pickRolePreferredRelic,
        pickSpecialEpicRewardCard,
        pickWeightedRelic,
        rollRewardRarity,
        getWeightedRelicOrder,
        rollWeighted
    };
})(window);
