// Extracted gameplay data. Keep this file free of DOM/runtime side effects.
const GEN_DICT = {
    atkPre: ["狂暴的", "嗜血的", "致命的", "沉重的", "迅捷的", "淬毒的", "破甲的", "雷霆", "连击"], atkSuf: ["斩击", "重锤", "刺杀", "飞刃", "猛击", "爆破", "双斩"],
    defPre: ["坚固的", "不动的", "灵动的", "玄龟之", "守护的"], defSuf: ["屏障", "护体", "阵法", "铁壁", "御诀"]
};

const TAG_POOL = {
    hero_warrior: {
        '攻击': ['圣剑', '重击', '穿甲', '连击', '保留', '吸血', '血祭', '剧毒', '出血', '燃烧', '放血'],
        '防御': ['庇护', '荆棘', '保留', '充能', '治愈'],
        '能力': ['庇护', '充能', '抽牌', '血祭', '剧毒', '出血', '燃烧', '放血']
    },
    hero_mage: {
        '攻击': ['爆发', '易伤', '燃烧', '剧毒', '出血', '放血', '虚弱', '回响', '充能', '附魔'],
        '防御': ['咏唱', '充能', '治愈', '回响', '庇护'],
        '能力': ['咏唱', '充能', '抽牌', '回响', '复刻', '重置', '附魔', '易伤', '虚弱', '燃烧', '剧毒', '出血', '放血', '眩晕', '诅咒']
    },
    hero_archer: {
        '攻击': ['连射', '穿甲', '连击', '多段', '放逐', '剧毒', '出血', '燃烧', '放血'],
        '防御': ['自然', '蓄力', '保留', '重置', '庇护'],
        '能力': ['蓄力', '自然', '抽牌', '保留', '充能', '重置', '招魂', '轮回', '拾遗', '放逐', '剧毒', '出血', '燃烧', '放血']
    },
    neutral: {
        '攻击': ['吸血', '回响', '放逐', '抽牌', '剧毒', '出血', '燃烧', '放血', '重击', '穿甲', '连击', '多段', '易伤', '虚弱', '充能'],
        '防御': ['复刻', '保留', '回响', '放逐', '易伤', '虚弱', '充能', '荆棘', '治愈'],
        '能力': ['重置', '血祭', '狂热', '附魔', '庇护', '招魂', '轮回', '拾遗', '复刻', '回响', '放逐', '抽牌', '剧毒', '出血', '燃烧', '放血', '易伤', '虚弱', '眩晕', '诅咒', '充能', '治愈']
    }
};

const CARD_ART_REGISTRY = {
    // Full character card illustrations.
    '圣剑突击': '新角色一/角色一_卡面插画_圣剑突击.webp',
    '遗迹立誓': '新角色一/角色一_卡面插画_遗迹立誓.webp',
    '紫焰爆裂': '角色二/角色二_卡面插画_紫焰爆裂.webp',
    '遗迹咏唱': '角色二/角色二_卡面插画_遗迹咏唱.webp',
    '拉弓瞄准': '新角色三/角色三_卡面插画_拉弓瞄准.webp',
    '疾风连射': '新角色三/角色三_卡面插画_疾风连射.webp',

    // Generated unframed card art for standard pool cards.
    '盾墙反身': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_盾墙反身.webp',
    '誓约追击': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_誓约追击.webp',
    '圣堂守势': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_圣堂守势.webp',
    '圣剑解放': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_圣剑解放.webp',
    '破晓格挡': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_破晓格挡.webp',
    '裂光一闪': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_裂光一闪.webp',
    '王冠反斩': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_王冠反斩.webp',
    '铁壁圣痕': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_铁壁圣痕.webp',
    '血誓斩': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_血誓斩.webp',
    '棘甲冲锋': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_棘甲冲锋.webp',
    '战旗压阵': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_战旗压阵.webp',
    '血祭壁垒': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_血祭壁垒.webp',
    '誓约留锋': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_誓约留锋.webp',
    '魂誓换锋': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_魂誓换锋.webp',
    '狂誓裂斩': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_狂誓裂斩.webp',
    '终誓裁断': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_终誓裁断.webp',
    '紫焰火花': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_紫焰火花.webp',
    '魔流庇护': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_魔流庇护.webp',
    '虚空导引': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_虚空导引.webp',
    '星火连祷': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_星火连祷.webp',
    '星屑预兆': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_星屑预兆.webp',
    '余烬点燃': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_余烬点燃.webp',
    '法环回流': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_法环回流.webp',
    '裂界紫雷': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_裂界紫雷.webp',
    '星环复写': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_星环复写.webp',
    '燃魂导流': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_燃魂导流.webp',
    '回声护幕': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_回声护幕.webp',
    '虚弱星尘': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_虚弱星尘.webp',
    '紫焰刻印': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_紫焰刻印.webp',
    '星缚咒印': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_星缚咒印.webp',
    '咒回星环': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_咒回星环.webp',
    '裂星禁术': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_裂星禁术.webp',
    '林风整备': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_林风整备.webp',
    '猎手翻步': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_猎手翻步.webp',
    '狩影穿枝': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_狩影穿枝.webp',
    '森冠齐射': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_森冠齐射.webp',
    '森息伏击': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_森息伏击.webp',
    '风羽换位': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_风羽换位.webp',
    '鹰眼贯枝': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_鹰眼贯枝.webp',
    '回环箭雨': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_回环箭雨.webp',
    '回风藏箭': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_回风藏箭.webp',
    '逐影放矢': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_逐影放矢.webp',
    '轮枝归射': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_轮枝归射.webp',
    '拾羽连步': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_拾羽连步.webp',
    '翠毒连矢': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_翠毒连矢.webp',
    '林魂招矢': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_林魂招矢.webp',
    '赤痕放血': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_赤痕放血.webp',
    '逐风绝矢': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_逐风绝矢.webp',
    '古誓护印': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_古誓护印.webp',
    '星轨换手': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_星轨换手.webp',
    '碎星短刃': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_碎星短刃.webp',
    '圣像微光': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_圣像微光.webp',
    '回音残卷': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_回音残卷.webp',

    // Starter and temporary cards reuse the closest generated art so the demo does not fall back to emoji.
    '基础斩击': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_誓约追击.webp',
    '基础防御': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_盾墙反身.webp',
    '基础法弹': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_紫焰火花.webp',
    '秘仪预兆': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_魔流庇护.webp',
    '秘仪屏障': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_魔流庇护.webp',
    '基础射击': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_狩影穿枝.webp',
    '林地回避': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_猎手翻步.webp',
    '飞刀': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_碎星短刃.webp',
    '厄运印记': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_回音残卷.webp'
};

const CARD_TYPE_ART_FALLBACK = {
    '攻击': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_碎星短刃.webp',
    '防御': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_古誓护印.webp',
    '能力': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_星轨换手.webp',
    '诅咒': '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/中立法则_回音残卷.webp'
};

const CARD_FRAME_ASSETS = {
    warrior: '卡牌设计/教堂彩窗赛璐璐/卡框UI/圣剑彩窗框.webp',
    mage: '卡牌设计/教堂彩窗赛璐璐/卡框UI/秘法彩窗框.webp',
    archer: '卡牌设计/教堂彩窗赛璐璐/卡框UI/森灵彩窗框.webp',
    neutral: '卡牌设计/教堂彩窗赛璐璐/卡框UI/中立彩窗框.webp'
};

const CARD_FRAME_THEME_BY_NAME = {
    '圣剑突击': 'warrior', '遗迹立誓': 'warrior', '盾墙反身': 'warrior', '誓约追击': 'warrior', '圣堂守势': 'warrior', '圣剑解放': 'warrior', '破晓格挡': 'warrior', '裂光一闪': 'warrior', '王冠反斩': 'warrior', '铁壁圣痕': 'warrior', '血誓斩': 'warrior', '棘甲冲锋': 'warrior', '战旗压阵': 'warrior', '血祭壁垒': 'warrior', '誓约留锋': 'warrior', '魂誓换锋': 'warrior', '狂誓裂斩': 'warrior', '终誓裁断': 'warrior', '基础斩击': 'warrior', '基础防御': 'warrior',
    '紫焰爆裂': 'mage', '遗迹咏唱': 'mage', '紫焰火花': 'mage', '魔流庇护': 'mage', '虚空导引': 'mage', '星火连祷': 'mage', '星屑预兆': 'mage', '余烬点燃': 'mage', '法环回流': 'mage', '裂界紫雷': 'mage', '星环复写': 'mage', '燃魂导流': 'mage', '回声护幕': 'mage', '虚弱星尘': 'mage', '紫焰刻印': 'mage', '星缚咒印': 'mage', '咒回星环': 'mage', '裂星禁术': 'mage', '基础法弹': 'mage', '秘仪预兆': 'mage', '秘仪屏障': 'mage',
    '拉弓瞄准': 'archer', '疾风连射': 'archer', '林风整备': 'archer', '猎手翻步': 'archer', '狩影穿枝': 'archer', '森冠齐射': 'archer', '森息伏击': 'archer', '风羽换位': 'archer', '鹰眼贯枝': 'archer', '回环箭雨': 'archer', '回风藏箭': 'archer', '逐影放矢': 'archer', '轮枝归射': 'archer', '拾羽连步': 'archer', '翠毒连矢': 'archer', '林魂招矢': 'archer', '赤痕放血': 'archer', '逐风绝矢': 'archer', '基础射击': 'archer', '林地回避': 'archer',
    '古誓护印': 'neutral', '星轨换手': 'neutral', '碎星短刃': 'neutral', '圣像微光': 'neutral', '回音残卷': 'neutral', '飞刀': 'neutral', '厄运印记': 'neutral',
    '万物归墟': 'neutral', '厄毒爆发': 'neutral', '泰山压顶': 'neutral', '天道回音': 'neutral', '诛仙剑阵': 'warrior', '血海深渊': 'neutral', '万劫不灭体': 'neutral', '无极生太极': 'neutral',
    '剑诀·破军': 'warrior', '毒蛊·万毒': 'mage', '阵法·四象': 'neutral', '魔修·血煞': 'neutral', '天道·森罗': 'mage',
    '铸剑·淬火': 'warrior', '秘术·血炼': 'neutral', '奇门·遁甲': 'neutral', '符箓·注灵': 'mage', '道法·聚灵': 'mage'
};

const NEUTRAL_CARD_POOL = [
    { poolId: 'neutral_guard', name: '古誓护印', type: '防御', cost: 1, icon: '⛩️', val: 8, tags: ['保留'], rarity: '稀有' },
    { poolId: 'neutral_cycle', name: '星轨换手', type: '能力', cost: 1, icon: '🌌', val: 0, tags: ['重置'], rarity: '稀有' },
    { poolId: 'neutral_spark', name: '碎星短刃', type: '攻击', cost: 0, icon: '✨', val: 4, tags: ['销毁'], rarity: '普通' },
    { poolId: 'neutral_bless', name: '圣像微光', type: '能力', cost: 1, icon: '🕯️', val: 0, tags: ['治愈'], rarity: '普通' },
    { poolId: 'neutral_echo', name: '回音残卷', type: '能力', cost: 2, icon: '📜', val: 0, tags: ['回响', '抽牌'], rarity: '史诗' },
    { poolId: 'neutral_vow_guard', name: '巡誓护符', type: '防御', cost: 1, icon: '🔰', val: 7, tags: ['庇护', '保留'], rarity: '稀有', desc: '获得 7 点护盾。附带[庇护]与[保留]。战士可把它转成额外护盾，弓手可借保留获得风势。' },
    { poolId: 'neutral_mirror_spark', name: '镜火短章', type: '能力', cost: 1, icon: '🪞', val: 0, tags: ['回响', '充能'], rarity: '稀有', desc: '触发[回响]并[充能]。法师会因回响额外积累咏唱。' },
    { poolId: 'neutral_blood_mark', name: '血契刻痕', type: '能力', cost: 1, icon: '🩸', val: 5, tags: ['血祭', '附魔'], rarity: '稀有', desc: '触发[血祭]与[附魔]。战士会把血祭转成额外护盾。' },
    { poolId: 'neutral_exile_blade', name: '流亡短刃', type: '攻击', cost: 1, icon: '🗡️', val: 9, tags: ['放逐', '穿甲'], rarity: '稀有', desc: '造成 9 点穿甲伤害并[放逐]。一次性强攻，弓手可借放逐获得风势。' },
    { poolId: 'neutral_return_scroll', name: '归页残卷', type: '能力', cost: 1, icon: '📖', val: 0, tags: ['拾遗', '抽牌'], rarity: '稀有', desc: '从墓地选择 1 张牌回到手牌，并[抽牌]。弓手会因回收牌获得风势。' },
    { poolId: 'neutral_soul_flame', name: '魂火祭文', type: '能力', cost: 1, icon: '🔥', val: 0, tags: ['充能', '抽牌'], rarity: '稀有', desc: '回复能量并[抽牌]。适合把手牌资源转成职业启动。' },
    { poolId: 'neutral_frenzy_edge', name: '狂锋断章', type: '攻击', cost: 1, icon: '⚔️', val: 6, tags: ['狂热', '连击'], rarity: '稀有', desc: '丢弃 1 张牌获得[狂热]，随后造成 6 点伤害；若本回合已出牌则触发[连击]。' },
    { poolId: 'neutral_bloodlet_rite', name: '断脉残页', type: '能力', cost: 1, icon: '🩸', val: 0, tags: ['放血', '抽牌'], rarity: '稀有', desc: '引爆敌方已有[出血]层数，然后[抽牌]。没有出血时只作为过牌。' },
    { poolId: 'neutral_sealed_thunder', name: '封雷断页', type: '攻击', cost: 2, icon: '🌩️', val: 13, tags: ['眩晕', '放逐'], rarity: '史诗', desc: '造成 13 点伤害，施加[眩晕]后[放逐]。一次性控制牌，放逐威能会额外提高伤害。' }
];

const CHARACTER_CARD_POOLS = {
    hero_warrior: [
        { poolId: 'warrior_charge', name: '圣剑突击', type: '攻击', cost: 2, icon: '✨', val: 12, tags: ['圣剑', '重击'], rarity: '稀有' },
        { poolId: 'warrior_oath', name: '遗迹立誓', type: '能力', cost: 2, icon: '📖', val: 6, tags: ['庇护', '反击', '抽牌'], rarity: '稀有' },
        { poolId: 'warrior_wall', name: '盾墙反身', type: '防御', cost: 1, icon: '🔰', val: 10, tags: ['反击'], rarity: '史诗' },
        { poolId: 'warrior_follow', name: '誓约追击', type: '攻击', cost: 1, icon: '🗡️', val: 8, tags: ['圣剑', '连击'], rarity: '普通' },
        { poolId: 'warrior_guard', name: '圣堂守势', type: '防御', cost: 2, icon: '🛡️', val: 14, tags: ['反击', '荆棘'], rarity: '史诗' },
        { poolId: 'warrior_release', name: '圣剑解放', type: '攻击', cost: 3, icon: '⚔️', val: 18, tags: ['圣剑', '穿甲', '重击'], rarity: '史诗' },
        { poolId: 'warrior_dawn_guard', name: '破晓格挡', type: '防御', cost: 1, icon: '🌅', val: 8, tags: ['保留'], rarity: '普通' },
        { poolId: 'warrior_flash', name: '裂光一闪', type: '攻击', cost: 1, icon: '⚡', val: 7, tags: ['圣剑', '穿甲'], rarity: '普通' },
        { poolId: 'warrior_crown_riposte', name: '王冠反斩', type: '能力', cost: 1, icon: '👑', val: 0, tags: ['反击', '抽牌'], rarity: '史诗' },
        { poolId: 'warrior_scar', name: '铁壁圣痕', type: '防御', cost: 2, icon: '🛡️', val: 16, tags: ['庇护', '保留'], rarity: '史诗' },
        { poolId: 'warrior_blood_vow_slash', name: '血誓斩', type: '攻击', cost: 1, icon: '🩸', val: 7, tags: ['圣剑', '吸血'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_血誓斩.webp', desc: '造成 7 点伤害。附带[圣剑]与[吸血]，溢出治疗可配合战士遗物转成护盾。' },
        { poolId: 'warrior_thorn_charge', name: '棘甲冲锋', type: '攻击', cost: 2, icon: '🌹', val: 10, tags: ['圣剑', '荆棘'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_棘甲冲锋.webp', desc: '造成 10 点伤害。附带[圣剑]与[荆棘]，护盾越高越容易触发盾棘共鸣。' },
        { poolId: 'warrior_banner_guard', name: '战旗压阵', type: '能力', cost: 1, icon: '🚩', val: 5, tags: ['庇护', '抽牌'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_战旗压阵.webp', desc: '触发[庇护]并[抽牌]。若已有护盾，战士联动会额外加固护盾。' },
        { poolId: 'warrior_blood_wall', name: '血祭壁垒', type: '能力', cost: 1, icon: '🛡️', val: 5, tags: ['血祭', '庇护', '荆棘'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_血祭壁垒.webp', desc: '触发[血祭]与[庇护]，并获得[荆棘]。战士会把血祭转成护盾，为盾棘和下一次圣剑铺垫。' },
        { poolId: 'warrior_oath_retainer', name: '誓约留锋', type: '防御', cost: 1, icon: '🔰', val: 9, tags: ['保留', '充能'], rarity: '普通', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_誓约留锋.webp', desc: '获得 9 点护盾。附带[保留]与[充能]，战士会因防御保留额外获得护盾。' },
        { poolId: 'warrior_soul_oath', name: '魂誓换锋', type: '能力', cost: 1, icon: '📖', val: 5, tags: ['充能', '抽牌', '庇护'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_魂誓换锋.webp', desc: '触发[充能]、[抽牌]与[庇护]。把节奏转成护盾，为后续圣剑攻击铺垫。' },
        { poolId: 'warrior_bleed_edge', name: '誓血裂口', type: '攻击', cost: 1, icon: '🩸', val: 6, tags: ['圣剑', '出血'], rarity: '普通', desc: '造成 6 点伤害，附带[圣剑]与[出血]。护盾越厚，伤口越深。' },
        { poolId: 'warrior_bloodlet_cleave', name: '断誓开锋', type: '攻击', cost: 1, icon: '⚔️', val: 7, tags: ['圣剑', '放血'], rarity: '稀有', desc: '造成 7 点伤害，附带[圣剑]。随后引爆敌方已有[出血]层数。' },
        { poolId: 'warrior_venom_scar', name: '蚀毒剑痕', type: '攻击', cost: 1, icon: '☠️', val: 6, tags: ['圣剑', '剧毒'], rarity: '稀有', desc: '造成 6 点伤害，附带[圣剑]与[剧毒]。适合把护盾压制转成持续伤害。' },
        { poolId: 'warrior_ember_oath', name: '烬誓斩', type: '攻击', cost: 2, icon: '🔥', val: 9, tags: ['圣剑', '燃烧', '荆棘'], rarity: '稀有', desc: '造成 9 点伤害，附带[圣剑]、[燃烧]与[荆棘]。战士会用护盾额外放大盾棘收益。' },
        { poolId: 'warrior_frenzy_cleave', name: '狂誓裂斩', type: '攻击', cost: 2, icon: '🔥', val: 9, tags: ['狂热', '圣剑', '重击'], rarity: '史诗', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_狂誓裂斩.webp', desc: '丢弃 1 张手牌获得[狂热]，随后以[圣剑]与[重击]造成重击伤害。' },
        { poolId: 'warrior_exile_judgement', name: '终誓裁断', type: '攻击', cost: 2, icon: '⚔️', val: 16, tags: ['圣剑', '重击', '放逐'], rarity: '史诗', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/勇者战士_终誓裁断.webp', desc: '造成 16 点伤害，附带[圣剑]、[重击]与[放逐]。一次性终结牌，放逐威能会额外提高伤害。' }
    ],
    hero_mage: [
        { poolId: 'mage_flame', name: '紫焰爆裂', type: '攻击', cost: 2, icon: '💥', val: 11, tags: ['爆发', '易伤'], rarity: '稀有' },
        { poolId: 'mage_chant', name: '遗迹咏唱', type: '能力', cost: 2, icon: '📜', val: 0, tags: ['咏唱', '充能', '抽牌'], rarity: '稀有' },
        { poolId: 'mage_spark', name: '紫焰火花', type: '攻击', cost: 1, icon: '🔥', val: 7, tags: ['爆发', '燃烧'], rarity: '普通' },
        { poolId: 'mage_barrier', name: '魔流庇护', type: '能力', cost: 1, icon: '🛡️', val: 0, tags: ['咏唱', '治愈'], rarity: '稀有' },
        { poolId: 'mage_void', name: '虚空导引', type: '能力', cost: 2, icon: '🌌', val: 0, tags: ['咏唱', '回响'], rarity: '稀有' },
        { poolId: 'mage_cascade', name: '星火连祷', type: '能力', cost: 2, icon: '🪄', val: 0, tags: ['咏唱', '复刻', '充能'], rarity: '史诗' },
        { poolId: 'mage_omen', name: '星屑预兆', type: '能力', cost: 0, icon: '✦', val: 0, tags: ['咏唱', '销毁'], rarity: '普通' },
        { poolId: 'mage_ember', name: '余烬点燃', type: '攻击', cost: 0, icon: '🔥', val: 3, tags: ['爆发', '销毁'], rarity: '普通' },
        { poolId: 'mage_loop', name: '法环回流', type: '能力', cost: 1, icon: '🔮', val: 0, tags: ['咏唱', '充能', '抽牌'], rarity: '稀有' },
        { poolId: 'mage_thunder', name: '裂界紫雷', type: '攻击', cost: 3, icon: '🌩️', val: 16, tags: ['爆发', '穿甲', '回响'], rarity: '史诗' },
        { poolId: 'mage_star_copy', name: '星环复写', type: '能力', cost: 1, icon: '🪞', val: 0, tags: ['复刻', '咏唱'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_虚空导引.webp', desc: '触发[复刻]并积累[咏唱]。法师联动会让复刻再额外推进咏唱。' },
        { poolId: 'mage_ember_flow', name: '燃魂导流', type: '攻击', cost: 1, icon: '🔥', val: 5, tags: ['爆发', '燃烧', '充能'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_余烬点燃.webp', desc: '造成 5 点伤害。附带[爆发]、[燃烧]与[充能]，状态词条会为法师标记下一次伤害。' },
        { poolId: 'mage_venom_sigils', name: '毒星符阵', type: '能力', cost: 1, icon: '☠️', val: 0, tags: ['剧毒', '咏唱'], rarity: '普通', desc: '施加[剧毒]并积累[咏唱]。持续伤害也能为下一次爆发铺垫。' },
        { poolId: 'mage_blood_orbit', name: '血月星轨', type: '攻击', cost: 1, icon: '🩸', val: 5, tags: ['爆发', '出血'], rarity: '稀有', desc: '造成 5 点伤害。附带[爆发]与[出血]，状态词条会为法师标记下一次伤害。' },
        { poolId: 'mage_bloodlet_omen', name: '断血预兆', type: '能力', cost: 1, icon: '🌑', val: 0, tags: ['放血', '咏唱'], rarity: '稀有', desc: '引爆敌方已有[出血]层数，并积累[咏唱]。适合把持续伤口转成爆发窗口。' },
        { poolId: 'mage_echo_veil', name: '回声护幕', type: '能力', cost: 1, icon: '🛡️', val: 0, tags: ['回响', '治愈'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_魔流庇护.webp', desc: '触发[回响]与[治愈]。法师会因回响或受伤治疗积累咏唱。' },
        { poolId: 'mage_void_dust', name: '虚弱星尘', type: '攻击', cost: 1, icon: '✦', val: 6, tags: ['爆发', '虚弱'], rarity: '普通', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_星屑预兆.webp', desc: '造成 6 点伤害。附带[爆发]与[虚弱]，有咏唱时会标记下一次伤害。' },
        { poolId: 'mage_arcane_mark', name: '紫焰刻印', type: '能力', cost: 1, icon: '🔮', val: 5, tags: ['附魔', '易伤'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_裂界紫雷.webp', desc: '触发[附魔]并施加[易伤]。法师可把状态词条转成下一次爆发的额外标记。' },
        { poolId: 'mage_stasis_hex', name: '星缚咒印', type: '能力', cost: 2, icon: '⛓️', val: 0, tags: ['眩晕', '诅咒', '咏唱'], rarity: '史诗', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_虚空导引.webp', desc: '施加[眩晕]与[诅咒]，并积累[咏唱]。控制与爆发铺垫合一。' },
        { poolId: 'mage_curse_echo', name: '咒回星环', type: '能力', cost: 1, icon: '🌑', val: 0, tags: ['诅咒', '回响'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_法环回流.webp', desc: '施加[诅咒]并触发[回响]。法师会因回响额外积累咏唱，并用诅咒标记下一次伤害。' },
        { poolId: 'mage_exile_nova', name: '裂星禁术', type: '攻击', cost: 2, icon: '🌌', val: 15, tags: ['爆发', '穿甲', '放逐'], rarity: '史诗', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/萝莉魔导士_裂界紫雷.webp', desc: '造成 15 点穿甲伤害，附带[爆发]与[放逐]。一次性禁术，放逐威能会额外提高伤害。' }
    ],
    hero_archer: [
        { poolId: 'archer_aim', name: '拉弓瞄准', type: '能力', cost: 1, icon: '🎯', val: 9, tags: ['蓄力', '抽牌'], rarity: '稀有' },
        { poolId: 'archer_barrage', name: '疾风连射', type: '攻击', cost: 1, icon: '💨', val: 5, tags: ['连射'], rarity: '稀有' },
        { poolId: 'archer_ready', name: '林风整备', type: '能力', cost: 1, icon: '🪶', val: 6, tags: ['自然', '蓄力'], rarity: '稀有' },
        { poolId: 'archer_step', name: '猎手翻步', type: '能力', cost: 1, icon: '🥾', val: 5, tags: ['自然', '保留'], rarity: '普通' },
        { poolId: 'archer_shadow', name: '狩影穿枝', type: '攻击', cost: 2, icon: '🗡️', val: 10, tags: ['连射', '穿甲'], rarity: '稀有' },
        { poolId: 'archer_grove', name: '森冠齐射', type: '攻击', cost: 2, icon: '🏹', val: 7, tags: ['连射', '多段', '穿甲'], rarity: '史诗' },
        { poolId: 'archer_ambush', name: '森息伏击', type: '能力', cost: 0, icon: '🍃', val: 4, tags: ['蓄力', '销毁'], rarity: '普通' },
        { poolId: 'archer_shift', name: '风羽换位', type: '能力', cost: 1, icon: '🪶', val: 0, tags: ['自然', '重置'], rarity: '稀有' },
        { poolId: 'archer_hawkeye', name: '鹰眼贯枝', type: '攻击', cost: 2, icon: '🎯', val: 12, tags: ['蓄力', '穿甲'], rarity: '稀有' },
        { poolId: 'archer_rain', name: '回环箭雨', type: '攻击', cost: 2, icon: '🌧️', val: 6, tags: ['连射', '回响'], rarity: '史诗' },
        { poolId: 'archer_hidden_arrow', name: '回风藏箭', type: '能力', cost: 1, icon: '🪶', val: 6, tags: ['保留', '蓄力'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_风羽换位.webp', desc: '获得风势。附带[保留]与[蓄力]，弓手会因保留额外获得风势。' },
        { poolId: 'archer_exile_shot', name: '逐影放矢', type: '攻击', cost: 1, icon: '🏹', val: 8, tags: ['放逐', '连射'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_狩影穿枝.webp', desc: '造成 8 点伤害。附带[放逐]与[连射]，弓手会因放逐获得风势，且放逐威能会额外提高伤害。' },
        { poolId: 'archer_cycle_branch', name: '轮枝归射', type: '攻击', cost: 2, icon: '🧭', val: 9, tags: ['轮回', '连射'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_回环箭雨.webp', desc: '造成 9 点伤害。可触发[轮回]并[连射]，回收放逐牌时获得风势。' },
        { poolId: 'archer_pick_feather', name: '拾羽连步', type: '能力', cost: 1, icon: '🍃', val: 0, tags: ['拾遗', '自然'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_猎手翻步.webp', desc: '触发[拾遗]与[自然]。弓手会因回收墓地牌获得风势。' },
        { poolId: 'archer_venom_flurry', name: '翠毒连矢', type: '攻击', cost: 1, icon: '☠️', val: 5, tags: ['连射', '剧毒'], rarity: '普通', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_森息伏击.webp', desc: '造成 5 点伤害。附带[连射]与[剧毒]，适合把风势追射转成多段上毒。' },
        { poolId: 'archer_ember_feather', name: '燎羽连射', type: '攻击', cost: 1, icon: '🔥', val: 5, tags: ['连射', '燃烧'], rarity: '普通', desc: '造成 5 点伤害。附带[连射]与[燃烧]，把轻灵追射转成持续压制。' },
        { poolId: 'archer_soul_return', name: '林魂招矢', type: '能力', cost: 1, icon: '🏮', val: 0, tags: ['招魂', '自然'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_林风整备.webp', desc: '从放逐区选择 1 张牌回到手牌，并触发[自然]。弓手会因招魂获得风势。' },
        { poolId: 'archer_red_mark', name: '赤痕连矢', type: '攻击', cost: 1, icon: '🩸', val: 5, tags: ['出血', '连射'], rarity: '普通', desc: '造成 5 点伤害。附带[出血]与[连射]，专门负责快速叠出血层数。' },
        { poolId: 'archer_blood_release', name: '赤痕放血', type: '攻击', cost: 1, icon: '🩸', val: 6, tags: ['放血', '连射'], rarity: '稀有', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_森息伏击.webp', desc: '造成 6 点伤害，然后引爆敌方已有[出血]层数；[连射]让引爆回合更灵动。' },
        { poolId: 'archer_exile_storm', name: '逐风绝矢', type: '攻击', cost: 2, icon: '💨', val: 12, tags: ['放逐', '连射', '多段'], rarity: '史诗', art: '卡牌设计/教堂彩窗赛璐璐/卡面插画_无框/精灵弓箭手_回环箭雨.webp', desc: '造成 12 点伤害，附带[放逐]、[连射]与[多段]。一次性爆发，会获得放逐威能。' }
    ]
};

const CARD_POOL_BY_ID = {
    pool_warrior: CHARACTER_CARD_POOLS.hero_warrior,
    pool_mage: CHARACTER_CARD_POOLS.hero_mage,
    pool_archer: CHARACTER_CARD_POOLS.hero_archer
};
