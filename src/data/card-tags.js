// Card keyword definitions and side-effect-free value rules.
const TAGS = {
    '重置': '自动丢弃除本牌外的未封印手牌，并抽取等量的牌。',
    '血祭': '失去 4 点生命，但不会使生命低于 1 点；本场战斗所有伤害 +{val}。未升级为 +3，升级后为 +5。',
    '血誓': '失去生命换取伤害。自我失血不会使生命低于 1 点；按各卡牌比例追加已损生命伤害，卡面显示当前追加值。',
    '狂热': '自动丢弃 1 张优先级最低的手牌，本回合所有伤害 +{val}。数值为卡牌数值 +3；升级后为卡牌数值 +4。',
    '附魔': '自动丢弃 1 张优先级最低的手牌，你下一次攻击额外造成 {val} 点伤害并抽 1 张牌。基础为卡牌数值+2，升级后为卡牌数值+4。',
    '庇护': '本回合受到的伤害减少 {val} 点。',
    '反击': '进入反击姿态：受到下一次敌方主体攻击时，招架本次伤害的 50%，并按招架值反击。反击姿态不可叠加。',
    '回收': '按卡牌说明，自动从墓地或放逐区回收牌，送回手牌或抽牌堆。每回收 1 张放逐牌，造成 7 点流动伤害。',
    '复刻': '复制上一张非复刻牌的效果；没有可复制目标时不触发。',
    '吸血': '造成伤害时，回复等同于伤害一半的生命（史诗卡为全额回复）。',
    '保留': '打出后，下回合将回到手牌中。如果不打出则正常丢弃。',
    '回响': '这张牌的效果会立即再触发一次。',
    '放逐': '使用后移至放逐区，本局战斗不可再用。放逐游侠牌进入放逐区时会造成 5 点流动伤害。',
    '抽牌': '额外抽取 {val} 张牌。',
    '剧毒': '施加 3 层剧毒(每回合造成伤害并衰减)。',
    '出血': '施加 3 层出血(每回合受层数一半的伤害并衰减)。',
    '燃烧': '施加 1 层燃烧(每层每回合造成最大生命 3% 的伤害并衰减)。',
    '眩晕': '施加 1 层眩晕(跳过下一次行动回合)。',
    '诅咒': '施加 2 层诅咒(无法恢复生命并随回合衰减)。',
    '放血': '引爆敌方的出血状态，每层造成 3 点伤害，随后清空。',
    '重击': '攻击牌卡面伤害已计入重击；实际结算为基础数值伤害翻倍。',
    '穿甲': '无视敌方护甲，直接扣除生命。',
    '圣剑': '战士专属攻击词条：额外造成当前护盾 40% 的伤害，反击姿态再 +4；拥有圣剑誓印时护盾比例提高到 55%。',
    '咏唱': '法师通用资源：积累 {val} 层咏唱并获得 4 点护盾；爆发牌会消耗咏唱，每层追加 10 点伤害。',
    '爆发': '法师专属：攻击会消耗所有咏唱层数，每层追加 10 点伤害并获得 1 点庇护，庇护最多 10 点；没有咏唱时仍追加 5 点伤害。',
    '蓄力': '弓箭手专属：获得风势。打出攻击牌时消耗 1 层风势，追加一次轻灵追射并获得少量庇护。',
    '自然': '弓箭手专属：回复 1 点能量；若已有风势，额外抽 1 张牌并获得少量庇护。',
    '闪避': '弓箭手专属：每层可完全闪避本轮敌方主体的 1 段攻击。多段攻击会逐段消耗，敌方行动结束后剩余层数消失。',
    '追击': '攻击额外触发 1 次。同一张牌不会因重复的追击标签继续增加触发次数。',
    '连击': '若本回合已打出过其他牌，此牌数值增加50%。',
    '易伤': '给予目标 2 层易伤(每层使受到的伤害增加5%)。',
    '虚弱': '给予目标 2 层虚弱(造成的伤害减少25%)。',
    '充能': '回复 1 点能量。',
    '荆棘': '获得 8 层荆棘(被攻击时反弹等于荆棘层数的伤害，战士会根据护盾额外获得荆棘)。',
    '治愈': '回复 {val} 点生命。',
    '销毁': '打出后彻底消失，不进入放逐区或墓地。放逐游侠牌销毁时会造成 4 点流动伤害。',
    '流动伤害': '放逐游侠专属伤害：放逐流派牌进入墓地造成 3 点穿甲伤害，进入放逐区造成 5 点，每回收 1 张放逐牌造成 7 点，销毁造成 4 点。'
};

const TAG_DISPLAY_NAMES = {};

const CARD_RECYCLE_MODES = {
    neutral_return_scroll: ['discardToHand'],
    neutral_old_dream_return: ['exhaustToDraw', 'discardToHand'],
    archer_cycle_branch: ['exhaustToDraw'],
    archer_pick_feather: ['discardToHand'],
    archer_soul_return: ['exhaustToHand'],
    archer_blood_feather: ['discardToHand'],
    archer_outerwood_recall: ['exhaustToHand'],
    archer_deadbranch_shuffle: ['exhaustToDraw'],
    archer_lost_arrow_mark: ['discardToHand'],
    archer_nest_track: ['exhaustToDraw'],
    archer_old_arrow_dream: ['exhaustToHand'],
    archer_leaf_search: ['discardToHand'],
    archer_forest_specimen: ['exhaustToDraw'],
    s_exhaust: ['allExhaustToDraw'],
    a_green_resonance: ['discardToHand'],
    a_exile_recall: ['exhaustToHand', 'exhaustToDraw'],
    a_exile_archive: ['discardToHand', 'exhaustToDraw']
};

const HIGH_IMPACT_TAGS = new Set([
    '血祭', '血誓', '眩晕', '放逐', '咏唱', '吸血', '自然', '荆棘', '爆发',
    '剧毒', '虚弱', '复刻', '闪避', '回收', '回响', '保留', '燃烧'
]);

const DIRECT_EFFECT_TAGS = {
    '抽牌': 'draw',
    '充能': 'energy',
    '庇护': 'protection',
    '保留': 'retain',
    '治愈': 'heal'
};
const DIRECT_EFFECT_PRIORITY = ['draw', 'energy', 'protection', 'retain', 'heal'];

function getCardDataId(card = {}) {
    return card.poolId || card.specialId || card.id || card.name;
}

function getCardRecycleModes(card = {}) {
    return [...(card.recycleModes || CARD_RECYCLE_MODES[getCardDataId(card)] || [])];
}

function getRecycleModeDescription(mode) {
    if (mode === 'exhaustToHand') return '自动从放逐区回收牌到手牌';
    if (mode === 'exhaustToDraw') return '自动从放逐区回收牌洗入抽牌堆';
    if (mode === 'discardToHand') return '自动从墓地回收牌到手牌';
    if (mode === 'allExhaustToDraw') return '将放逐区所有牌洗入抽牌堆';
    return '按卡牌说明回收牌';
}

function applyCardTagBudget(card) {
    if (!card) return card;
    const original = normalizeTagConflicts(card.tags || []);
    card.recycleModes = [...(card.recycleModes || CARD_RECYCLE_MODES[getCardDataId(card)] || [])];
    const originalDirectEffects = { ...(card.directEffects || {}) };
    card.directEffects = { ...originalDirectEffects };

    const semanticTags = original.filter(tag => !DIRECT_EFFECT_TAGS[tag] && tag !== '销毁');
    const keywordCandidates = [];
    let keptDirectTag = false;
    for (const tag of original) {
        const directKey = DIRECT_EFFECT_TAGS[tag];
        if (!directKey) {
            keywordCandidates.push(tag);
            continue;
        }
        if (semanticTags.length === 0 && !keptDirectTag) {
            keywordCandidates.push(tag);
            keptDirectTag = true;
        } else {
            card.directEffects[directKey] = true;
        }
    }

    let cap = card.rarity === '史诗' || card.isSpecial ? 2 : 1;
    if (!card.isSpecial && keywordCandidates.includes('销毁') && keywordCandidates.length > 1) cap = Math.max(cap, 2);

    const result = [];
    let highImpactCount = 0;
    for (const tag of keywordCandidates) {
        if (result.length >= cap) break;
        const isHighImpact = HIGH_IMPACT_TAGS.has(tag) && tag !== '回收';
        if (!card.isSpecial && (Number(card.cost) || 0) <= 1 && card.rarity !== '史诗' && isHighImpact && highImpactCount >= 1) continue;
        result.push(tag);
        if (isHighImpact) highImpactCount++;
    }
    if (keywordCandidates.includes('销毁') && !result.includes('销毁') && result.length < cap) result.push('销毁');
    if (keywordCandidates.includes('销毁') && !result.includes('销毁') && result.length === cap) result[result.length - 1] = '销毁';

    card.tags = normalizeTagConflicts(result);
    for (const tag of original) {
        if (card.tags.includes(tag)) continue;
        const directKey = DIRECT_EFFECT_TAGS[tag];
        if (directKey) card.directEffects[directKey] = true;
    }
    if (!card.isSpecial) {
        const visibleSemanticTags = card.tags.filter(tag => !DIRECT_EFFECT_TAGS[tag] && tag !== '销毁');
        const allowedDirectEffects = card.preserveDirectEffects
            ? Object.keys(card.directEffects || {}).length
            : (visibleSemanticTags.length > 0 ? 0 : 1);
        const keptDirectEffects = {};
        for (const key of DIRECT_EFFECT_PRIORITY) {
            if (card.directEffects?.[key] && Object.keys(keptDirectEffects).length < allowedDirectEffects) {
                keptDirectEffects[key] = true;
            }
        }
        card.directEffects = keptDirectEffects;
    }
    if (!Object.keys(card.directEffects).length) delete card.directEffects;
    const changed = original.length !== card.tags.length || original.some((tag, index) => card.tags[index] !== tag);
    const directChanged = JSON.stringify(originalDirectEffects) !== JSON.stringify(card.directEffects || {});
    if ((changed || directChanged) && !card.isSpecial) delete card.desc;
    return card;
}

function hasDirectCardEffect(card, effect) {
    return !!card?.directEffects?.[effect];
}

const STATUS_DESC = {
    armor: '<span style="color:white; font-weight:bold;">护盾</span><br>抵挡等量的伤害，回合结束时若未被打破则保留。',
    poison: '<span style="color:var(--nature); font-weight:bold;">剧毒</span><br>回合结束时受到等量的伤害。触发后层数减少1层。',
    bleed: '<span style="color:var(--crimson); font-weight:bold;">出血</span><br>回合结束时受到层数一半的伤害(向上取整)。触发后层数减少1层。',
    burn: '<span style="color:var(--fire); font-weight:bold;">燃烧</span><br>每层每回合造成最大生命 3% 的伤害。触发后层数减少1层。',
    stun: '<span style="color:var(--gold); font-weight:bold;">眩晕</span><br>每层跳过下一次行动回合。',
    curse: '<span style="color:var(--purple); font-weight:bold;">诅咒</span><br>无法恢复生命。敌方回合结算时每层受到 3 点伤害，随后层数减少1层。',
    vuln: '<span style="color:var(--purple); font-weight:bold;">易伤</span><br>每层使受到的所有伤害增加 5%。',
    weak: '<span style="color:#bbb; font-weight:bold;">虚弱</span><br>造成的攻击伤害减少 25%。',
    str: '<span style="color:var(--fire); font-weight:bold;">力量</span><br>每次攻击额外造成等量的固定伤害。',
    thorns: '<span style="color:var(--nature); font-weight:bold;">荆棘</span><br>被攻击时反弹等于荆棘层数的伤害。<br>战士打出荆棘牌时，会根据当前护盾额外获得荆棘。',
    charge: '<span style="color:var(--crimson); font-weight:bold;">蓄力</span><br>下一次攻击造成的伤害翻倍！',
    chant: '<span style="color:var(--purple); font-weight:bold;">咏唱</span><br>法师的爆发牌会消耗咏唱层数，每层追加 10 点伤害。',
    aim: '<span style="color:var(--nature); font-weight:bold;">风势</span><br>弓箭手的灵动身法。攻击时消耗 1 层，追加一次轻灵追射并获得 3 点庇护。'
};

function getTagDisplayName(tag) {
    return TAG_DISPLAY_NAMES[tag] || tag;
}

function normalizeTagConflicts(tags = []) {
    const aliases = { '招魂': '回收', '轮回': '回收', '拾遗': '回收', '连射': '追击', '多段': '追击', '错身': '闪避' };
    const result = [...new Set(tags.map(tag => aliases[tag] || tag))];
    const removeTag = (tag) => {
        const index = result.indexOf(tag);
        if (index !== -1) result.splice(index, 1);
    };
    if (result.includes('灵祭')) {
        removeTag('灵祭');
        if (!result.includes('充能')) result.push('充能');
    }
    if (result.includes('重置') && result.includes('抽牌')) removeTag('抽牌');
    if (result.includes('放逐') && result.includes('保留')) removeTag('保留');
    if (result.includes('销毁')) {
        removeTag('放逐');
        removeTag('保留');
    }
    return result;
}

function getWindGain(card) {
    const base = parseInt(card?.val) || (card?.rarity === '史诗' ? 8 : 5);
    return Math.min(3, Math.max(1, Math.ceil(base / 4)));
}

function getSidestepGain(card) {
    const explicit = Number(card?.sidestepVal);
    if (Number.isFinite(explicit) && explicit > 0) return Math.min(3, Math.floor(explicit));
    if (card?.type === '能力') return Math.min(3, Math.max(1, parseInt(card?.val) || 1));
    return 1;
}

function getCostPowerMultiplier(card) {
    const cost = Math.max(0, Number(card?.cost) || 0);
    if (cost >= 3) return 1.7;
    if (cost === 2) return 1.35;
    return 1;
}

function getScaledCardValue(card) {
    return Math.round(Math.max(0, Number(card?.val) || 0) * getCostPowerMultiplier(card));
}

function getAbilityPotency(card) {
    const cost = Math.max(0, Number(card?.cost) || 0);
    return 2 + Math.max(0, cost - 1) + (card?.up ? 1 : 0);
}

function getCardDrawCount(card) {
    const explicit = Number(card?.drawCount);
    if (Number.isFinite(explicit) && explicit > 0) return Math.floor(explicit);
    const cost = Math.max(0, Number(card?.cost) || 0);
    return 1 + Math.max(0, cost - 1) + (card?.tags?.includes('回响') ? 1 : 0) + (card?.up ? 1 : 0);
}

function getCardHealValue(card) {
    if (Number.isFinite(Number(card?.healValue))) return Number(card.healValue);
    const cost = Math.max(0, Number(card?.cost) || 0);
    const basePerCost = card?.rarity === '史诗' ? 10 : 8;
    return Math.round(cost * basePerCost * getCostPowerMultiplier(card));
}

function getCardChantGain(card) {
    const rarityBase = card?.rarity === '史诗' ? 2 : 1;
    return rarityBase + Math.max(0, (Number(card?.cost) || 0) - 1) + (card?.up ? 1 : 0);
}

function getProtectionValue(card) {
    const explicit = Number(card?.protectVal);
    if (Number.isFinite(explicit) && explicit > 0) return Math.floor(explicit);
    const base = getScaledCardValue(card) || (card?.up ? 10 : 6);
    return card?.type === '防御' ? Math.max(3, Math.ceil(base / 2)) : base;
}
