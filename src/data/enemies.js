// Extracted gameplay data. Keep this file free of DOM/runtime side effects.
const ENEMIES = [
    { name: "病弱史莱姆", icon: "🟢", baseHp: 30, tier: 1, ai: { type: 'sequence', pattern: [0, 1] }, moves: [{type:'attack', val:5, name:"凝胶撞击"}, {type:'defend', val:5, name:"分裂增殖"}] },
    { name: "枯骨煞兵", icon: "💀", baseHp: 40, tier: 1, ai: { type: 'first_turn_fixed', firstMove: 1, fallbackType: 'random_no_repeat' }, moves: [{type:'attack', val:7, name:"骨刃劈砍"}, {type:'debuff', subType:'weak', val:2, name:"灵魂战吼"}] },
    { name: "贪婪盗贼", icon: "🥷", baseHp: 35, tier: 1, ai: { type: 'random_no_repeat' }, moves: [{type:'attack', val:3, name:"双匕连刺", times: 2}, {type:'defend', val:6, name:"隐匿翻滚"}] },
    { name: "嗜血蝙蝠", icon: "🦇", baseHp: 28, tier: 1, ai: { type: 'sequence', pattern: [1, 0, 0] }, moves: [{type:'attack', val:4, name:"血牙连咬", times: 2}, {type:'debuff', subType:'bleed', val:2, name:"撕裂伤口"}] },
    { name: "迷途妖狐", icon: "🦊", baseHp: 45, tier: 1, ai: { type: 'first_turn_fixed', firstMove: 1, fallbackType: 'random_no_repeat' }, moves: [{type:'debuff', subType:'burn', val:2, name:"狐火灼烧"}, {type:'seal', val:1, name:"妖言惑众"}] },

    { name: "荒野煞狼", icon: "🐺", baseHp: 65, tier: 2, ai: { type: 'sequence', pattern: [1, 2, 0, 0] }, moves: [{type:'attack', val:8, name:"嗜血撕咬"}, {type:'buff', val:2, name:"对月狂嚎"}, {type:'debuff', subType:'bleed', val:3, name:"利爪开膛"}] },
    { name: "千载魔蛛", icon: "🕷️", baseHp: 75, tier: 2, ai: { type: 'first_turn_fixed', firstMove: 2, fallbackType: 'random_no_repeat' }, moves: [{type:'attack', val:5, name:"毒牙交错", times: 2}, {type:'defend', val:10, name:"结茧防御"}, {type:'junk', val:1, name:"毒丝包覆"}] },
    { name: "剧毒蟾蜍", icon: "🐸", baseHp: 85, tier: 2, ai: { type: 'sequence', pattern: [2, 1, 0] }, moves: [{type:'attack', val:12, name:"泰山压顶"}, {type:'debuff', subType:'poison', val:3, name:"猛毒喷射"}, {type:'junk', val:1, name:"恶臭粘液"}] },
    { name: "暴躁野猪", icon: "🐗", baseHp: 80, tier: 2, ai: { type: 'sequence', pattern: [0, 1, 2] }, moves: [{type:'charge', val:0, name:"刨地蓄能"}, {type:'attack', val:15, name:"野蛮冲撞"}, {type:'debuff', subType:'stun', val:1, name:"震地冲击"}] },
    { name: "铁甲巨蟹", icon: "🦀", baseHp: 70, tier: 2, ai: { type: 'sequence', pattern: [1, 0, 2, 2] }, moves: [{type:'defend', val:15, name:"铁甲硬化"}, {type:'buff_thorns', val:4, name:"甲壳生刺"}, {type:'attack', val:9, name:"巨钳剪切"}] },

    { name: "堕落剑客", icon: "🤺", baseHp: 110, tier: 3, ai: { type: 'sequence', pattern: [1, 0, 2] }, moves: [{type:'attack', val:6, name:"燕返三连斩", times: 3}, {type:'buff', val:3, name:"剑气汇聚"}, {type:'seal', val:1, name:"挑飞武器"}] },
    { name: "幽冥法师", icon: "🧙‍♂️", baseHp: 100, tier: 3, ai: { type: 'first_turn_fixed', firstMove: 0, fallbackType: 'random_no_repeat' }, moves: [{type:'summon', val:25, atk:5, name:"唤灵仪式"}, {type:'attack', val:12, name:"幽冥鬼火"}, {type:'junk', val:2, name:"散播诅咒"}] },
    { name: "巨力石魔", icon: "🪨", baseHp: 150, tier: 3, ai: { type: 'sequence', pattern: [2, 0, 1] }, moves: [{type:'charge', val:0, name:"大地共鸣(蓄力)"}, {type:'attack', val:25, name:"崩天陨星击"}, {type:'defend', val:20, name:"磐石之护"}] },
    { name: "魅影刺客", icon: "🦹‍♂️", baseHp: 95, tier: 3, ai: { type: 'sequence', pattern: [2, 1, 0, 0] }, moves: [{type:'attack', val:8, name:"影袭双刺", times:2}, {type:'seal', val:2, name:"封喉禁咒"}, {type:'debuff', subType:'vuln', val:3, name:"破甲飞镖"}] },
    { name: "缝合巨怪", icon: "🧟", baseHp: 130, tier: 3, ai: { type: 'random_no_repeat' }, moves: [{type:'attack', val:16, name:"碎肉重砸"}, {type:'junk', val:2, name:"尸毒爆发"}, {type:'debuff', subType:'poison', val:4, name:"腐败毒气"}] },

    { name: "【精英】狂暴牛头人", icon: "🐂", baseHp: 180, type: 'elite', tier: 1, ai: { type: 'sequence', pattern: [2, 0, 1] }, moves: [{type:'charge', val:0, name:"战争践踏(蓄力)"}, {type:'attack', val:22, name:"毁灭打击"}, {type:'buff', val:3, name:"血怒咆哮"}] },
    { name: "【精英】猩红血巫", icon: "🧛‍♀️", baseHp: 140, type: 'elite', tier: 2, ai: { type: 'first_turn_fixed', firstMove: 2, fallbackType: 'random_no_repeat' }, moves: [{type:'attack_lifesteal', val:12, name:"鲜血虹吸"}, {type:'debuff', subType:'curse', val:2, name:"血之诅咒"}, {type:'summon', val:30, atk:6, name:"召唤血仆"}], revives: 1, reviveRatio: 0.5 },
    { name: "【精英】不死骨龙", icon: "🐉", baseHp: 220, type: 'elite', tier: 3, ai: { type: 'sequence', pattern: [1, 2, 0, 0] }, moves: [{type:'attack', val:9, name:"幽冥龙息", times:3}, {type:'debuff', subType:'vuln', val:3, name:"龙威震慑"}, {type:'buff_thorns', val:5, name:"骨刺横生"}] },

    { name: "【首领】鬼面修罗", icon: "👹", baseHp: 350, type: 'boss', ai: { type: 'sequence', pattern: [0, 1, 1, 2, 3, 4] }, moves: [{type:'summon', val:50, atk:8, name:"唤醒法相"}, {type:'attack', val:8, name:"修罗连斩", times:3}, {type:'seal', val:2, name:"六道封禁"}, {type:'charge', val:0, name:"魔气内敛"}, {type:'attack', val:35, name:"修罗一击"}] },
    { name: "【深渊主宰】", icon: "👁️", baseHp: 400, type: 'boss', 
        ai: { type: 'sequence', pattern: [0, 3, 2, 1] },
        moves: [{type:'summon', val:60, atk:10, name:"深渊触须"}, {type:'junk', val:3, name:"理智剥夺"}, {type:'attack', val:12, name:"精神鞭笞", times:2}, {type:'debuff', subType:'weak', val:3, name:"深渊凝视"}],
        phase2: { name: "【深渊主宰·暴走】", icon: "🌌", maxHp: 350, ai: { type: 'sequence', pattern: [1, 2, 3, 0] }, moves: [{type:'attack', val:15, name:"湮灭射线", times:3}, {type:'seal', val:3, name:"秩序崩坏"}, {type:'charge', val:0, name:"深渊坍缩"}, {type:'attack', val:50, name:"纪元终结"}] }
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
