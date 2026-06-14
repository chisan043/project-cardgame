// Extracted gameplay data. Keep this file free of DOM/runtime side effects.
const ENEMIES = [
    { name: "病弱史莱姆", icon: "🟢", baseHp: 30, tier: 1, ai: { type: 'tactical', aggression: 0.95, opener: 1, maxNonAttack: 1 }, moves: [{type:'attack', val:6, name:"凝胶撞击"}, {type:'debuff', subType:'weak', val:1, name:"软泥缠身"}, {type:'defend', val:6, name:"分裂增殖"}, {type:'attack', val:3, name:"酸液喷溅", times: 2}] },
    { name: "枯骨煞兵", icon: "💀", baseHp: 40, tier: 1, ai: { type: 'tactical', aggression: 1.05, opener: 1, maxNonAttack: 1 }, moves: [{type:'attack', val:8, name:"骨刃劈砍"}, {type:'debuff', subType:'weak', val:2, name:"灵魂战吼"}, {type:'buff', val:1, name:"骨火燃刃"}, {type:'attack', val:4, name:"碎骨连斩", times: 2}] },
    { name: "贪婪盗贼", icon: "🥷", baseHp: 35, tier: 1, ai: { type: 'tactical', aggression: 1.15, opener: 0, maxNonAttack: 1 }, moves: [{type:'attack', val:4, name:"双匕连刺", times: 2}, {type:'defend', val:6, name:"隐匿翻滚"}, {type:'junk', val:1, name:"暗袋诡计"}, {type:'attack', val:10, name:"背刺割喉"}] },
    { name: "嗜血蝙蝠", icon: "🦇", baseHp: 28, tier: 1, ai: { type: 'tactical', aggression: 1.2, opener: 1, maxNonAttack: 1 }, moves: [{type:'attack', val:4, name:"血牙连咬", times: 2}, {type:'debuff', subType:'bleed', val:2, name:"撕裂伤口"}, {type:'attack_lifesteal', val:7, name:"汲血俯冲"}, {type:'debuff', subType:'weak', val:1, name:"尖啸扰神"}] },
    { name: "迷途妖狐", icon: "🦊", baseHp: 45, tier: 1, ai: { type: 'tactical', aggression: 1.05, opener: 1, maxNonAttack: 1 }, moves: [{type:'attack', val:7, name:"狐火扑击"}, {type:'debuff', subType:'burn', val:2, name:"狐火灼烧"}, {type:'seal', val:1, name:"妖言惑众"}, {type:'debuff', subType:'vuln', val:2, name:"惑心凝视"}, {type:'attack', val:4, name:"幻尾掠影", times: 2}] },

    { name: "荒野煞狼", icon: "🐺", baseHp: 65, tier: 2, ai: { type: 'tactical', aggression: 1.25, opener: 1, maxNonAttack: 1 }, moves: [{type:'attack', val:9, name:"嗜血撕咬"}, {type:'buff', val:2, name:"对月狂嚎"}, {type:'debuff', subType:'bleed', val:3, name:"利爪开膛"}, {type:'attack', val:5, name:"群猎扑杀", times: 2}] },
    { name: "千载魔蛛", icon: "🕷️", baseHp: 75, tier: 2, ai: { type: 'tactical', aggression: 1.05, opener: 2, maxNonAttack: 1 }, moves: [{type:'attack', val:5, name:"毒牙交错", times: 2}, {type:'defend', val:10, name:"结茧防御"}, {type:'junk', val:1, name:"毒丝包覆"}, {type:'debuff', subType:'poison', val:3, name:"蛛毒注入"}, {type:'attack', val:12, name:"蛛腿穿刺"}] },
    { name: "剧毒蟾蜍", icon: "🐸", baseHp: 85, tier: 2, ai: { type: 'tactical', aggression: 1.0, opener: 1, maxNonAttack: 1 }, moves: [{type:'attack', val:13, name:"泰山压顶"}, {type:'debuff', subType:'poison', val:3, name:"猛毒喷射"}, {type:'junk', val:1, name:"恶臭粘液"}, {type:'debuff', subType:'weak', val:2, name:"麻痹毒雾"}, {type:'attack', val:7, name:"毒舌抽击", times: 2}] },
    { name: "暴躁野猪", icon: "🐗", baseHp: 80, tier: 2, ai: { type: 'tactical', aggression: 1.25, opener: 0, maxNonAttack: 1 }, moves: [{type:'charge', val:0, name:"刨地蓄能"}, {type:'attack', val:16, name:"野蛮冲撞"}, {type:'debuff', subType:'stun', val:1, name:"震地冲击"}, {type:'attack', val:6, name:"獠牙乱顶", times: 3}] },
    { name: "铁甲巨蟹", icon: "🦀", baseHp: 70, tier: 2, ai: { type: 'tactical', aggression: 1.05, opener: 0, maxNonAttack: 1 }, moves: [{type:'defend', val:15, name:"铁甲硬化"}, {type:'buff_thorns', val:4, name:"甲壳生刺"}, {type:'attack', val:10, name:"巨钳剪切"}, {type:'debuff', subType:'vuln', val:2, name:"钳碎护势"}, {type:'attack', val:6, name:"横行碾压", times: 2}] },

    { name: "堕落剑客", icon: "🤺", baseHp: 105, tier: 3, ai: { type: 'tactical', aggression: 1.15, opener: 1, maxNonAttack: 1 }, moves: [{type:'attack', val:5, name:"燕返三连斩", times: 3}, {type:'buff', val:2, name:"剑气汇聚"}, {type:'seal', val:1, name:"挑飞武器"}, {type:'attack', val:15, name:"堕影居合"}] },
    { name: "幽冥法师", icon: "🧙‍♂️", baseHp: 100, tier: 3, ai: { type: 'tactical', aggression: 1.05, opener: 0, maxNonAttack: 1 }, moves: [{type:'summon', val:25, atk:5, name:"唤灵仪式"}, {type:'attack', val:13, name:"幽冥鬼火"}, {type:'junk', val:2, name:"散播诅咒"}, {type:'debuff', subType:'curse', val:2, name:"亡语缠魂"}, {type:'attack', val:6, name:"幽火连弹", times: 2}] },
    { name: "巨力石魔", icon: "🪨", baseHp: 135, tier: 3, ai: { type: 'tactical', aggression: 1.0, opener: 2, maxNonAttack: 1 }, moves: [{type:'charge', val:0, name:"大地共鸣"}, {type:'attack', val:20, name:"崩天陨星击"}, {type:'defend', val:16, name:"磐石之护"}, {type:'attack', val:8, name:"碎岩横扫", times: 2}] },
    { name: "魅影刺客", icon: "🦹‍♂️", baseHp: 95, tier: 3, ai: { type: 'tactical', aggression: 1.35, opener: 2, maxNonAttack: 1 }, moves: [{type:'attack', val:8, name:"影袭双刺", times:2}, {type:'seal', val:2, name:"封喉禁咒"}, {type:'debuff', subType:'vuln', val:3, name:"破甲飞镖"}, {type:'attack', val:20, name:"背影处决"}] },
    { name: "缝合巨怪", icon: "🧟", baseHp: 130, tier: 3, ai: { type: 'tactical', aggression: 1.15, opener: 2, maxNonAttack: 1 }, moves: [{type:'attack', val:17, name:"碎肉重砸"}, {type:'junk', val:2, name:"尸毒爆发"}, {type:'debuff', subType:'poison', val:4, name:"腐败毒气"}, {type:'attack_lifesteal', val:12, name:"吞噬缝补"}] },

    { name: "【精英】狂暴牛头人", icon: "🐂", baseHp: 150, type: 'elite', tier: 1, ai: { type: 'tactical', aggression: 1.15, opener: 2, maxNonAttack: 1 }, moves: [{type:'charge', val:0, name:"战争践踏"}, {type:'attack', val:17, name:"毁灭打击"}, {type:'buff', val:2, name:"血怒咆哮"}, {type:'attack', val:6, name:"蛮角连冲", times: 3}] },
    { name: "【精英】猩红血巫", icon: "🧛‍♀️", baseHp: 140, type: 'elite', tier: 2, ai: { type: 'tactical', aggression: 1.2, opener: 2, maxNonAttack: 1 }, moves: [{type:'attack_lifesteal', val:13, name:"鲜血虹吸"}, {type:'debuff', subType:'curse', val:2, name:"血之诅咒"}, {type:'summon', val:30, atk:6, name:"召唤血仆"}, {type:'debuff', subType:'bleed', val:4, name:"血线牵缚"}, {type:'attack', val:7, name:"血刃飞散", times: 2}], revives: 1, reviveRatio: 0.5 },
    { name: "【精英】不死骨龙", icon: "🐉", baseHp: 175, type: 'elite', tier: 3, ai: { type: 'tactical', aggression: 1.12, opener: 1, maxNonAttack: 1 }, moves: [{type:'attack', val:6, name:"幽冥龙息", times:3}, {type:'debuff', subType:'vuln', val:2, name:"龙威震慑"}, {type:'buff_thorns', val:3, name:"骨刺横生"}, {type:'attack', val:21, name:"骨翼俯冲"}] },

    { name: "【首领】鬼面修罗", icon: "👹", baseHp: 245, type: 'boss', ai: { type: 'tactical', aggression: 1.08, opener: 0, maxNonAttack: 1 }, moves: [{type:'summon', val:30, atk:5, name:"唤醒法相"}, {type:'attack', val:5, name:"修罗连斩", times:3}, {type:'seal', val:1, name:"六道封禁"}, {type:'charge', val:0, name:"魔气内敛"}, {type:'attack', val:24, name:"修罗一击"}, {type:'debuff', subType:'vuln', val:2, name:"鬼面威压"}] },
    { name: "【深渊主宰】", icon: "👁️", baseHp: 280, type: 'boss',
        ai: { type: 'tactical', aggression: 1.05, opener: 0, maxNonAttack: 1 },
        moves: [{type:'summon', val:38, atk:6, name:"深渊触须"}, {type:'junk', val:2, name:"理智剥夺"}, {type:'attack', val:8, name:"精神鞭笞", times:2}, {type:'debuff', subType:'weak', val:2, name:"深渊凝视"}, {type:'debuff', subType:'curse', val:1, name:"梦魇回声"}, {type:'attack', val:16, name:"虚空碾压"}],
        phase2: { name: "【深渊主宰·暴走】", icon: "🌌", maxHp: 190, ai: { type: 'tactical', aggression: 1.12, opener: 0, maxNonAttack: 1 }, moves: [{type:'attack', val:9, name:"湮灭射线", times:3}, {type:'seal', val:2, name:"秩序崩坏"}, {type:'charge', val:0, name:"深渊坍缩"}, {type:'attack', val:31, name:"纪元终结"}, {type:'junk', val:1, name:"残卷污染"}] }
    }
];

const MAP_NODE_META = {
    battle: { icon: "⚔️", label: "战斗" },
    elite: { icon: "💀", label: "精英" },
    rest: { icon: "🔥", label: "营火" },
    event: { icon: "📜", label: "奇遇" },
    boss: { icon: "🐉", label: "首领" },
    shop: { icon: "💰", label: "商栈" }
};
const MAP_LANE_LEFT = [18, 32, 46, 60, 74];
const MAP_FLOOR_GAP = 150;
const MAP_BASE_BOTTOM = 140;
