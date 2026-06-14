// Extracted gameplay data. Keep this file free of DOM/runtime side effects.
const SPECIAL_EPIC_POOLS = {
    hero_warrior: [
        { id: 's_shield', name: '圣盾崩击', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_release_art_v1.webp', type: '能力', cost: 3, icon: '🛡️', val: 0, tags: ['圣剑'], rarity: '史诗', isSpecial: true, desc: '造成等同于你当前护盾值 2 倍的伤害。若已处于[反击]姿态，触发[圣剑]姿态加成。' },
        { id: 's_thorns', name: '圣棘誓壁', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_guard_art_v1.webp', type: '防御', cost: 3, icon: '🛡️', val: 0, tags: ['荆棘'], rarity: '史诗', isSpecial: true, desc: '获得 30 点护甲与 10 层[荆棘]。' },
        { id: 'a_syn_sword', name: '裁决破军', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_flash_art_v1.webp', type: '攻击', cost: 2, icon: '🗡️', val: 10, tags: ['穿甲', '易伤'], rarity: '史诗', isSpecial: true, desc: '造成 10 点[穿甲]伤害。手牌每有 1 张[易伤]/[穿甲]/[连击]/[重击]，追加 12 伤害。' },
        { id: 'a_syn_array', name: '王誓阵列', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_scar_art_v1.webp', type: '防御', cost: 2, icon: '⛩️', val: 10, tags: ['保留', '荆棘'], rarity: '史诗', isSpecial: true, desc: '获得 10 护甲。手牌每有 1 张[保留]/[荆棘]，额外获得 8 护甲与 3 层[荆棘]。' },
        { id: 'a_syn_blood', name: '血海誓斩', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', type: '攻击', cost: 2, icon: '🩸', val: 30, tags: ['血债', '吸血'], lifestealRatio: 1, bloodDebtSpendAll: true, bloodDebtSpendDamage: 10, rarity: '史诗', isSpecial: true, desc: '造成 30 点穿甲伤害，对首领追加 10% 最大生命伤害。耗尽血债：每点追加 10 伤害，并以全部伤害[吸血]。' },
        { id: 'w_counter_crown', name: '王冠回锋', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_crown_riposte_art_v1.webp', type: '攻击', cost: 3, icon: '👑', val: 16, tags: ['反击', '圣剑'], rarity: '史诗', isSpecial: true, desc: '造成 16 点伤害并进入[反击]姿态。本场战斗中，每次反击后获得等同本次招架值的护盾。' },
        { id: 'w_bastion_prayer', name: '圣壁祷言', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_banner_guard_art_v1.webp', type: '能力', cost: 1, icon: '🚩', val: 10, tags: ['庇护', '抽牌'], rarity: '史诗', isSpecial: true, desc: '获得 10 点[庇护]，若当前拥有护盾，再获得等同庇护值的护盾并[抽牌]。' },
        { id: 'w_thorn_judgement', name: '荆冠审判', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_thorn_charge_art_v1.webp', type: '攻击', cost: 2, icon: '🌹', val: 8, tags: ['圣剑', '荆棘'], rarity: '史诗', isSpecial: true, desc: '造成 8 点伤害。额外造成当前[荆棘]层数 3 倍的伤害，并获得 6 层[荆棘]。' },
        { id: 'w_oath_fortress', name: '誓约壁垒', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_scar_art_v1.webp', type: '防御', cost: 3, icon: '🏰', val: 14, tags: ['反击', '保留'], rarity: '史诗', isSpecial: true, desc: '获得 14 点护盾与 4 点庇护并进入[反击]。打出后下回合回到手牌。' },
        { id: 'w_last_verdict', name: '终誓处刑', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_final_judgement_art_v1.webp', type: '攻击', cost: 2, icon: '⚔️', val: 48, tags: ['穿甲', '重击'], rarity: '史诗', isSpecial: true, desc: '造成 48 点[穿甲]。对首领追加 18% 最大生命伤害；每层[易伤]追加 10 伤害，手牌每张[连击]/[穿甲]追加 14 伤害。' }
    ],
    hero_mage: [
        { id: 's_magic', name: '星界回音', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_cascade_art_v1.webp', type: '能力', cost: 3, icon: '🌌', val: 0, tags: ['回响'], rarity: '史诗', isSpecial: true, desc: '本回合接下来打出的 3 张牌，其所有的标签效果会额外触发 2 次。' },
        { id: 's_pierce', name: '裂界紫雷', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_thunder_art_v1.webp', type: '攻击', cost: 4, icon: '⚡', val: 40, tags: ['爆发', '穿甲', '易伤'], rarity: '史诗', isSpecial: true, desc: '造成 40 点[穿甲]伤害。敌方每有 1 层[易伤]，伤害额外提升 50%。' },
        { id: 'a_syn_magic', name: '森罗雷仪', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_void_art_v1.webp', type: '能力', cost: 3, icon: '🌌', val: 0, tags: ['回响', '复刻', '充能'], rarity: '史诗', isSpecial: true, desc: '手牌每有 1 张[回响]/[复刻]，造成 15 点[穿甲]并回复 1 能量。' },
        { id: 'm_chant_singularity', name: '星核咏唱', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_chant_art_v1.webp', type: '能力', cost: 1, icon: '🔮', val: 0, tags: ['咏唱', '充能'], rarity: '史诗', isSpecial: true, desc: '获得 3 层[咏唱]并回复 1 点能量。若敌方有负面状态，额外[抽牌] 1 张。' },
        { id: 'm_status_supernova', name: '万象超新星', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_flame_art_v1.webp', type: '攻击', cost: 2, icon: '💥', val: 36, tags: ['爆发', '燃烧'], rarity: '史诗', isSpecial: true, desc: '造成 36 点伤害。敌方每种负面状态追加 9 伤害并获得 4 点庇护，随后施加最多 3 层[燃烧]。' },
        { id: 'm_echo_archive', name: '回声秘藏', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_loop_art_v1.webp', type: '能力', cost: 1, icon: '🪞', val: 0, tags: ['回响', '复刻'], rarity: '史诗', isSpecial: true, desc: '复制上一张非复刻牌，抽 1，并获得 2 庇护；对首领追加 2% 最大生命。无目标时积累 2 层[咏唱]并抽 2。' },
        { id: 'm_ember_orbit', name: '余烬星轨', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_ember_art_v1.webp', type: '能力', cost: 1, icon: '🔥', val: 0, tags: ['燃烧', '易伤', '抽牌'], rarity: '史诗', isSpecial: true, desc: '施加 6 层[燃烧]与 3 层[易伤]。若敌方已有任意负面状态，额外[抽牌] 2 张。' },
        { id: 'm_forbidden_comet', name: '裂星禁术', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_thunder_art_v1.webp', type: '攻击', cost: 2, icon: '🌌', val: 48, tags: ['爆发', '销毁', '穿甲'], rarity: '史诗', isSpecial: true, desc: '造成 48 点[穿甲]后[销毁]。对首领追加 21% 最大生命伤害；每层[咏唱]追加 16 伤害并获得 4 庇护。' },
        { id: 'm_curse_gravity', name: '咒星重力', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_void_art_v1.webp', type: '能力', cost: 2, icon: '⛓️', val: 0, tags: ['诅咒', '虚弱', '抽牌'], rarity: '史诗', isSpecial: true, desc: '施加 5[诅咒]与 3[虚弱]。敌方每种负面状态使下次伤害提高 2；3 种以上再抽 1。' },
        { id: 'm_blood_moon_rite', name: '暗月仪轨', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_omen_art_v1.webp', type: '能力', cost: 1, icon: '🌙', val: 0, tags: ['诅咒', '易伤'], rarity: '史诗', isSpecial: true, desc: '施加 5[诅咒]与 2[易伤]。敌方每种负面状态造成 6 点灾厄伤害。' }
    ],
    hero_archer: [
        { id: 's_exhaust', name: '风葬归矢', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_rain_art_v1.webp', type: '能力', cost: 3, icon: '🕳️', val: 0, tags: ['放逐', '回收'], rarity: '史诗', isSpecial: true, desc: '每张放逐牌造成 15 伤害，并获得 2 护盾与 2 庇护；对首领追加 10% 最大生命伤害。随后洗回放逐区。' },
        { id: 's_poison', name: '猎毒齐爆', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_ambush_art_v1.webp', type: '能力', cost: 2, icon: '💥', val: 36, tags: ['剧毒', '出血'], rarity: '史诗', isSpecial: true, desc: '造成 36 真实伤害；再按剧毒与出血总层数造成 3 倍伤害，不清层。按总层数获得至多 12 庇护。' },
        { id: 'a_syn_poison', name: '万毒箭阵', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_hawkeye_art_v1.webp', type: '能力', cost: 1, icon: '🧪', val: 0, tags: ['剧毒', '出血'], rarity: '史诗', isSpecial: true, desc: '丢弃手牌所有[剧毒]/[出血]牌。每弃 1 张，施加 6 层剧毒与出血，并造成 10 伤害。' },
        { id: 's_energy', name: '林风整备', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_ready_art_v1.webp', type: '能力', cost: 2, icon: '🍃', val: 0, tags: ['重置', '自然'], rarity: '史诗', isSpecial: true, desc: '丢弃你所有的手牌。每丢弃一张，回复 1 点能量并抽取 1 张牌。' },
        { id: 'a_wind_dance', name: '踏风连步', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_shift_art_v1.webp', type: '能力', cost: 1, icon: '🪶', val: 0, tags: ['蓄力', '自然', '闪避'], rarity: '史诗', isSpecial: true, desc: '获得 4 层风势与 1 层[闪避]，回复 1 点能量并抽 1。若已有风势，获得 6 点[庇护]。' },
        { id: 'a_gale_verdict', name: '疾风裁决', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_barrage_art_v1.webp', type: '攻击', cost: 2, icon: '💨', val: 18, tags: ['穿甲'], buildTags: ['gale'], rarity: '史诗', isSpecial: true, desc: '造成 18 点[穿甲]。对首领追加 2% 最大生命伤害。消耗至多 3 层风势：每层追加 10 伤害并获得 2 庇护，满 3 层获得 1 层闪避。' },
        { id: 'a_red_rain', name: '赤痕箭雨', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_rain_art_v1.webp', type: '攻击', cost: 2, icon: '🩸', val: 7, tags: ['出血', '追击'], rarity: '史诗', isSpecial: true, desc: '造成 7 点伤害并施加 8 层[出血]。若敌方已有[剧毒]，额外施加 4 层[剧毒]并[抽牌] 1 张。' },
        { id: 'a_bloodlet_gale', name: '断脉齐爆', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_ambush_art_v1.webp', type: '攻击', cost: 1, icon: '🩸', val: 6, tags: ['放血', '抽牌'], rarity: '史诗', isSpecial: true, desc: '造成 6 点伤害并触发[放血]。成功引爆出血时，额外[抽牌] 1 张；若敌方有[剧毒]，不清空出血。' },
        { id: 'a_green_resonance', name: '翠林回响', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_ready_art_v1.webp', type: '能力', cost: 1, icon: '🍃', val: 0, tags: ['自然', '回收'], rarity: '史诗', isSpecial: true, desc: '从墓地选择 1 张牌回到手牌，随后触发[自然]并获得 2 层风势。' },
        { id: 'a_skyfall_shot', name: '坠星绝矢', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_shadow_art_v1.webp', type: '攻击', cost: 2, icon: '🌠', val: 16, tags: ['放逐', '穿甲', '追击'], rarity: '史诗', isSpecial: true, desc: '造成 16 点[穿甲]伤害并[放逐]。放逐区每有 2 张牌，此牌额外造成 4 点伤害。' }
    ]
};

const BUILD_EXPANSION_SPECIAL_EPICS = {
    hero_warrior: [
        { id: 'w_oath_clock', name: '誓钟回击', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_crown_riposte_art_v1.webp', type: '能力', cost: 3, icon: '🕰️', val: 0, tags: ['反击', '保留'], buildTags: ['oathblade'], rarity: '史诗', isSpecial: true, desc: '进入[反击]并[保留]关键牌。' },
        { id: 'w_exec_silence', name: '断声处决', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_flash_art_v1.webp', type: '能力', cost: 1, icon: '⛓️', val: 0, tags: ['眩晕', '易伤'], buildTags: ['execution'], rarity: '史诗', isSpecial: true, desc: '施加[眩晕]与[易伤]。用一回合控制打开处刑窗口。' },
        { id: 'w_exec_line', name: '一线断甲', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_flash_art_v1.webp', type: '攻击', cost: 2, icon: '🗡️', val: 13, tags: ['穿甲', '连击'], buildTags: ['execution'], rarity: '史诗', isSpecial: true, desc: '造成 13 点伤害。若本回合已出牌，[连击]会放大这次[穿甲]攻击。' },
        { id: 'w_exec_flash', name: '白刃瞬裁', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_flash_art_v1.webp', type: '攻击', cost: 0, icon: '⚡', val: 7, tags: ['穿甲', '销毁'], buildTags: ['execution'], rarity: '史诗', isSpecial: true, desc: '造成 7 点[穿甲]伤害后[销毁]。压缩牌组，让处刑收束更快出现。' },
        { id: 'w_exec_claim', name: '认罪剑痕', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_final_judgement_art_v1.webp', type: '攻击', cost: 1, icon: '⚖️', val: 8, tags: ['易伤', '重击'], buildTags: ['execution'], rarity: '史诗', isSpecial: true, desc: '造成 8 点伤害并施加[易伤]。附带[重击]，适合作为处刑链中段。' },
        { id: 'w_exec_rehearse', name: '刑步预演', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_frenzy_cleave_art_v1.webp', type: '能力', cost: 1, icon: '👣', val: 0, tags: ['重置', '抽牌'], buildTags: ['execution'], rarity: '史诗', isSpecial: true, desc: '[重置]手牌并[抽牌]。' },
        { id: 'w_exec_finisher', name: '裂冠终斩', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_final_judgement_art_v1.webp', type: '攻击', cost: 3, icon: '👑', val: 18, tags: ['穿甲', '重击'], buildTags: ['execution'], rarity: '史诗', isSpecial: true, desc: '造成 18 点[穿甲]伤害并触发[重击]。处刑线的高费收束。' },
        { id: 'w_blood_crucible', name: '血誓坩埚', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_wall_art_v1.webp', type: '能力', cost: 1, icon: '🏺', val: 0, tags: ['血债'], bloodDebtGain: 6, drawCount: 2, directEffects: { draw: true }, buildTags: ['bloodoath'], rarity: '史诗', isSpecial: true, desc: '获得 6 点[血债]并抽 2 张牌。' },
        { id: 'w_blood_rain', name: '赤雨冲锋', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', type: '攻击', cost: 2, icon: '🩸', val: 14, tags: ['血债'], bloodDebtGain: 3, bloodDebtBleed: 5, buildTags: ['bloodoath'], rarity: '史诗', isSpecial: true, desc: '获得 3 点[血债]。造成 14 点伤害并施加 5 层出血。' },
        { id: 'w_blood_siphon', name: '噬誓回流', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', type: '攻击', cost: 1, icon: '💍', val: 8, tags: ['吸血', '放血'], lifestealRatio: 1, buildTags: ['bloodoath'], rarity: '史诗', isSpecial: true, desc: '造成 8 点伤害，触发[放血]，并以全部伤害[吸血]。' },
        { id: 'w_blood_drum', name: '战血鼓点', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_wall_art_v1.webp', type: '能力', cost: 0, icon: '🥁', val: 0, tags: ['血债'], bloodDebtGain: 4, directEffects: { energy: true }, buildTags: ['bloodoath'], rarity: '史诗', isSpecial: true, desc: '获得 4 点[血债]并回复 1 点能量。' },
        { id: 'w_blood_chain', name: '赤链二斩', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_frenzy_cleave_art_v1.webp', type: '攻击', cost: 1, icon: '⛓️', val: 7, tags: ['血债', '连击'], bloodDebtDamageRatio: 1, buildTags: ['bloodoath'], rarity: '史诗', isSpecial: true, desc: '造成 7 点伤害并追加当前血债 100% 的伤害；若本回合已出牌，再触发[连击]。' },
        { id: 'w_blood_oathmark', name: '血印再立', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_wall_art_v1.webp', type: '能力', cost: 1, icon: '📜', val: 0, tags: ['血债'], bloodDebtGain: 5, drawCount: 2, directEffects: { draw: true }, buildTags: ['bloodoath'], rarity: '史诗', isSpecial: true, desc: '获得 5 点[血债]并抽 2 张牌。' },
        { id: 'w_blood_lastcup', name: '末杯回命', roleId: 'hero_warrior', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', type: '攻击', cost: 2, icon: '🍷', val: 14, tags: ['吸血', '重击'], lifestealRatio: 1, buildTags: ['bloodoath'], rarity: '史诗', isSpecial: true, desc: '造成 14 点[重击]伤害，并以全部伤害[吸血]。' }
    ],
    hero_mage: [
        { id: 'm_chant_overflow', name: '溢星咏唱', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_chant_art_v1.webp', type: '能力', cost: 1, icon: '🔮', val: 0, tags: ['咏唱', '抽牌'], buildTags: ['chant'], rarity: '史诗', isSpecial: true, desc: '获得[咏唱]并[抽牌]。' },
        { id: 'm_chant_bolt', name: '星涌雷令', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_thunder_art_v1.webp', type: '攻击', cost: 1, icon: '⚡', val: 7, tags: ['爆发', '充能'], buildTags: ['chant'], rarity: '史诗', isSpecial: true, desc: '造成 7 点伤害，附带[爆发]与[充能]。' },
        { id: 'm_chant_ward', name: '恒咏护星', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_barrier_art_v1.webp', type: '防御', cost: 2, icon: '🛡️', val: 12, tags: ['咏唱', '庇护'], buildTags: ['chant'], rarity: '史诗', isSpecial: true, desc: '获得 12 点护盾，积累[咏唱]并触发[庇护]。' },
        { id: 'm_chant_lockstar', name: '锁星终读', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_thunder_art_v1.webp', type: '能力', cost: 2, icon: '🎯', val: 0, tags: ['咏唱', '易伤'], buildTags: ['chant'], rarity: '史诗', isSpecial: true, desc: '积累[咏唱]并施加[易伤]。' },
        { id: 'm_mirror_twinseal', name: '双镜印', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_star_copy_art_v1.webp', type: '能力', cost: 1, icon: '🪞', val: 0, tags: ['回响', '复刻'], buildTags: ['mirror'], rarity: '史诗', isSpecial: true, desc: '本牌自回放，并复制上一张非复刻牌。' },
        { id: 'm_mirror_rewind', name: '倒带法环', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_loop_art_v1.webp', type: '能力', cost: 1, icon: '🔁', val: 0, tags: ['复刻', '重置'], buildTags: ['mirror'], rarity: '史诗', isSpecial: true, desc: '复制上一张非复刻牌，并重置手牌。' },
        { id: 'm_mirror_footnote', name: '镜页脚注', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_star_copy_art_v1.webp', type: '能力', cost: 0, icon: '📝', val: 0, tags: ['复刻', '销毁'], buildTags: ['mirror'], rarity: '史诗', isSpecial: true, desc: '免费复制上一张非复刻牌，打出后销毁。' },
        { id: 'm_mirror_hallway', name: '折廊回声', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_loop_art_v1.webp', type: '能力', cost: 2, icon: '🏛️', val: 0, tags: ['回响', '保留'], buildTags: ['mirror'], rarity: '史诗', isSpecial: true, desc: '本牌自回放，打出后下回合回到手牌。' },
        { id: 'm_mirror_glassbolt', name: '镜棱短雷', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_thunder_art_v1.webp', type: '攻击', cost: 1, icon: '💠', val: 6, tags: ['回响', '穿甲'], buildTags: ['mirror'], rarity: '史诗', isSpecial: true, desc: '造成 6 点穿甲伤害，并让本牌再触发一次。' },
        { id: 'm_calamity_plague_star', name: '疫星坠落', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_stasis_hex_art_v1.webp', type: '能力', cost: 2, icon: '☠️', val: 0, tags: ['诅咒'], buildTags: ['calamity'], rarity: '史诗', isSpecial: true, desc: '施加[诅咒]。' },
        { id: 'm_calamity_black_snow', name: '黑雪预兆', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_omen_art_v1.webp', type: '攻击', cost: 1, icon: '🌑', val: 6, tags: ['虚弱', '燃烧'], buildTags: ['calamity'], rarity: '史诗', isSpecial: true, desc: '造成 6 点伤害，施加[虚弱]与[燃烧]。' },
        { id: 'm_calamity_silence', name: '暗月禁言', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_omen_art_v1.webp', type: '能力', cost: 1, icon: '🌙', val: 0, tags: ['眩晕', '诅咒'], buildTags: ['calamity'], rarity: '史诗', isSpecial: true, desc: '施加[眩晕]与[诅咒]。' },
        { id: 'm_calamity_blacklist', name: '厄名黑册', roleId: 'hero_mage', frameTheme: 'mage', art: 'assets/cards/art/mage/mage_stasis_hex_art_v1.webp', type: '能力', cost: 1, icon: '📓', val: 0, tags: ['诅咒', '易伤'], buildTags: ['calamity'], rarity: '史诗', isSpecial: true, desc: '施加[诅咒]与[易伤]。' }
    ],
    hero_archer: [
        { id: 'a_gale_updraft', name: '上升气流', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_shift_art_v1.webp', type: '能力', cost: 1, icon: '🪶', val: 0, tags: ['蓄力', '闪避', '抽牌'], buildTags: ['gale'], rarity: '史诗', isSpecial: true, desc: '获得风势、[闪避]并[抽牌]。' },
        { id: 'a_gale_splinter', name: '碎风齐射', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_barrage_art_v1.webp', type: '攻击', cost: 1, icon: '💨', val: 5, tags: ['追击'], buildTags: ['gale'], rarity: '史诗', isSpecial: true, desc: '造成 5 点伤害并触发[追击]。' },
        { id: 'a_gale_crosswind', name: '侧风判线', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_shift_art_v1.webp', type: '能力', cost: 1, icon: '📏', val: 0, tags: ['自然', '闪避', '易伤'], buildTags: ['gale'], rarity: '史诗', isSpecial: true, desc: '触发[自然]，获得[闪避]并施加[易伤]。' },
        { id: 'a_gale_featherbank', name: '羽库连装', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_barrage_art_v1.webp', type: '攻击', cost: 2, icon: '🏹', val: 6, tags: ['追击', '抽牌'], buildTags: ['gale'], rarity: '史诗', isSpecial: true, desc: '造成 6 点伤害，触发[追击]并[抽牌]。' },
        { id: 'a_venom_bloom', name: '毒花齐绽', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_ambush_art_v1.webp', type: '能力', cost: 1, icon: '🌿', val: 0, tags: ['剧毒', '出血'], buildTags: ['venom'], rarity: '史诗', isSpecial: true, desc: '施加[剧毒]与[出血]。' },
        { id: 'a_venom_burst', name: '毒脉爆箭', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_blood_release_art_v1.webp', type: '攻击', cost: 1, icon: '☠️', val: 6, tags: ['放血', '剧毒'], buildTags: ['venom'], rarity: '史诗', isSpecial: true, desc: '造成 6 点伤害，触发[放血]并施加[剧毒]。' },
        { id: 'a_venom_cage', name: '腐藤囚笼', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_ambush_art_v1.webp', type: '能力', cost: 2, icon: '🕸️', val: 0, tags: ['剧毒', '眩晕'], buildTags: ['venom'], rarity: '史诗', isSpecial: true, desc: '施加[剧毒]并[眩晕]。' },
        { id: 'a_venom_redfog', name: '赤雾落弦', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_rain_art_v1.webp', type: '攻击', cost: 2, icon: '🩸', val: 6, tags: ['出血', '追击'], buildTags: ['venom'], rarity: '史诗', isSpecial: true, desc: '造成 6 点伤害，附带[追击]并施加[出血]。' },
        { id: 'a_exile_map', name: '流亡路线图', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_shadow_art_v1.webp', type: '能力', cost: 1, icon: '🗺️', val: 0, tags: ['放逐', '抽牌'], buildTags: ['exile'], rarity: '史诗', isSpecial: true, desc: '自身[放逐]并[抽牌]。' },
        { id: 'a_exile_recall', name: '归途双令', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_ready_art_v1.webp', type: '能力', cost: 1, icon: '🧭', val: 0, tags: ['回收'], buildTags: ['exile'], rarity: '史诗', isSpecial: true, desc: '从放逐区选择 1 张牌回到手牌，再选择 1 张洗入抽牌堆。' },
        { id: 'a_exile_knives', name: '影匣飞刀', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_shadow_art_v1.webp', type: '攻击', cost: 0, icon: '🗡️', val: 4, tags: ['销毁'], buildTags: ['exile'], rarity: '史诗', isSpecial: true, desc: '造成 4 点伤害后[销毁]。作为放逐游侠的低费压缩件。' },
        { id: 'a_exile_piercer', name: '界外穿枝', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_shadow_art_v1.webp', type: '攻击', cost: 2, icon: '🌠', val: 12, tags: ['放逐', '穿甲'], buildTags: ['exile'], rarity: '史诗', isSpecial: true, desc: '造成 12 点[穿甲]伤害并[放逐]。' },
        { id: 'a_exile_archive', name: '失林归档', roleId: 'hero_archer', frameTheme: 'archer', art: 'assets/cards/art/archer/archer_cycle_branch_art_v1.webp', type: '能力', cost: 2, icon: '📚', val: 0, tags: ['回收'], buildTags: ['exile'], rarity: '史诗', isSpecial: true, desc: '从墓地选择 1 张牌回到手牌，再从放逐区选择 1 张洗入抽牌堆。' }
    ]
};

Object.entries(BUILD_EXPANSION_SPECIAL_EPICS).forEach(([characterId, cards]) => {
    SPECIAL_EPIC_POOLS[characterId].push(...cards);
});

const SPECIAL_EPICS = Object.values(SPECIAL_EPIC_POOLS).flat();
const REMOVED_BATTLE_IMPRINT_SPECIAL_IDS = new Set([
    'a_ench_array', 'a_ench_blood', 'a_ench_spirit', 'a_ench_gather',
    'a_ench_chant', 'a_ench_forge', 'a_ench_hunt'
]);

const RELIC_POOL = [
    { id: 'r_start_warrior', name: '不屈战徽', icon: '🛡️', desc: '战士初始遗物：每场战斗第一次遭受敌方主体攻击后，下回合额外获得 1 点能量并抽 1 张牌。', price: 0 },
    { id: 'r_start_mage', name: '余辉法印', icon: '🔯', desc: '法师初始遗物：每回合第一次打出能力牌后，下一张攻击牌结算前获得 1 层[咏唱]。', price: 0 },
    { id: 'r_start_archer', name: '逐风羽饰', icon: '🪶', desc: '弓手初始遗物：每回合第一次打出能力牌后，下一张攻击牌结算时获得 1 层风势。', price: 0 },
    { id: 'r_bone_ring', name: '誓约骨环', icon: '🦴', desc: '战士/弓手：每丢弃 1 张非诅咒手牌，本场战斗所有伤害提高 1；适合把弃牌转成血誓卖血、处刑连段或重置爆发。', price: 100 },
    { id: 'r_frenzy_veil', name: '疾影面纱', icon: '🎭', desc: '弓手：触发[重置]时额外[抽牌] 1 张；本战斗弃牌越多，[狂热]提供的伤害越高。', price: 130 },
    { id: 'r_sac_jade', name: '咏唱玉坠', icon: '📿', desc: '法师：每次获得[咏唱]时，回复 1 点能量并获得 2 点庇护。', price: 150 },
    { id: 'r_enchant_crys', name: '紫焰棱晶', icon: '💎', desc: '法师：触发[附魔]时加成翻倍；[爆发]结算时额外追加紫焰伤害。', price: 140 },
    { id: 'r_poison_fang', name: '森蚀箭簇', icon: '🐍', desc: '弓手：施加[剧毒]或[出血]时额外增加 1 层；敌方带有出血时受到的伤害提高。', price: 120 },
    { id: 'r_bleed_knife', name: '猎痕短刃', icon: '🔪', desc: '弓手：引爆[放血]时，每层额外造成 2 点伤害，并补 1 层[剧毒]。', price: 160 },
    { id: 'r_weak_mask', name: '破势面具', icon: '🎭', desc: '法师/弓手：施加[易伤]或[虚弱]时持续回合延长 1；攻击虚弱目标伤害提高。', price: 130 },
    { id: 'r_thorn_shield_new', name: '蔷薇重盾', icon: '🛡️', desc: '战士：[荆棘]效果翻倍；战斗开始时获得 6 点护盾。', price: 180 },
    { id: 'r_protect_armor', name: '圣壁石甲', icon: '🪨', desc: '战士：打出[庇护]牌额外获得 3 点减伤；每场战斗首次受到生命伤害时将该次伤害减半。', price: 150 },
    { id: 'r_counter_amulet', name: '招架护符', icon: '🧿', desc: '战士：进入[反击]姿态时立刻获得 5 点[庇护]减伤；重复获得反击不会重复触发。', price: 120 },
    { id: 'r_life_totem', name: '守誓图腾', icon: '🗿', desc: '战士：生命低于 50% 时，[防御]牌护盾与[庇护]减伤提升 50%，用于低血线稳住下一轮。', price: 140 },
    { id: 'r_pierce_amulet', name: '裂甲剑坠', icon: '⛓️', desc: '战士/弓手：[穿甲]伤害额外提升 25%，适合处刑破甲或放逐穿枝路线。', price: 110 },
    { id: 'r_combo_ring', name: '连弦指环', icon: '🤜', desc: '弓手：[连击]增幅提高至 70%；[追击]额外多触发 1 次。', price: 130 },
    { id: 'r_heavy_badge', name: '重锋徽记', icon: '⚔️', desc: '战士：[重击]倍数提升至 2.5 倍，是易伤、穿甲和处刑收束牌的核心爆点。', price: 150 },
    { id: 'r_fast_foot', name: '先手靴扣', icon: '🥾', desc: '弓手：每回合第一张攻击牌伤害提高 50%，适合用[蓄力]与[闪避]打开安全的起手窗口。', price: 160 },
    { id: 'r_soul_lantern', name: '林魂灯笼', icon: '🏮', desc: '弓手：[回收]到手牌时可选数量增加 1，带回的牌获得[保留]。', price: 140 },
    { id: 'r_cycle_compass', name: '风轮罗盘', icon: '🧭', desc: '弓手：通过[回收]洗入牌库的牌会立刻免费触发一次效果。', price: 170 },
    { id: 'r_echo_mirror_relic', name: '秘仪魔镜', icon: '🪞', desc: '法师：[回响]额外触发 1 次；[复刻]可复制双倍效果。', price: 190 },
    { id: 'r_energy_crys', name: '星辉法核', icon: '🔮', desc: '法师：每次[充能]额外回复 1 点能量；获得[咏唱]时额外积累 1 层。', price: 160 },
    { id: 'r_vamp_ring', name: '血誓指环', icon: '💍', desc: '战士：[吸血]偿清血债并产生溢出治疗时，本场战斗伤害提高，单次最多提高 5。', price: 140 },
    { id: 'r_heal_relic', name: '月露圣物', icon: '🌿', desc: '法师/弓手：[治愈]效果额外提高 3，提供铺垫回合的生存空间。', price: 130 },
    { id: 'r_luck_box', name: '占星牌匣', icon: '📦', desc: '法师/弓手：[抽牌]额外抽 1 张，帮助寻找回响、灾厄、放逐或毒血收束牌。', price: 150 },
    { id: 'r_decay_seal', name: '破绽咒印', icon: '📜', desc: '法师：对带有任意负面状态的敌人，全伤害提高 20%，适合先叠状态再接爆发或灾厄收束。', price: 160 },
    { id: 'r_yin_yang', name: '星轨命盘', icon: '☯️', desc: '法师：你的正面增益在回合结束时不再清零，只缓慢衰减一半。', price: 180 },
    { id: 'r_omni_seal', name: '万法空印', icon: '🕉️', desc: '法师：每回合首次打出的非诅咒卡牌额外免费触发一次，可复制[咏唱]或[爆发]节奏。', price: 200 },
    
    { id: 'r_exhaust_dmg', name: '狩影烬坠', icon: '🔥', desc: '弓手：每当有卡牌被[放逐]，本场战斗所有伤害提高 1。', price: 160 },
    { id: 'r_exhaust_knife', name: '猎手飞刀带', icon: '🥋', desc: '弓手：每当有卡牌被[放逐]，为手牌添加两张 0 耗能、4 点伤害的[销毁]飞刀。', price: 170 },
    { id: 'r_return_poison', name: '青毒归羽', icon: '☠️', desc: '弓手：每当卡牌从放逐区回到手牌或牌库，给予敌人 2 层[剧毒]。', price: 150 },
    { id: 'r_return_bleed', name: '赤痕归羽', icon: '🩸', desc: '弓手：每当卡牌从放逐区回到手牌或牌库，给予敌人 2 层[出血]。', price: 150 },
    { id: 'r_skill_cost', name: '秘仪教本', icon: '📘', desc: '法师/弓手：战斗开始时，所有[能力]牌耗能 -1（最低为 0），更容易启动咏唱、回响、灾厄或风势调度。', price: 200 },
    { id: 'r_def_cost', name: '圣盾甲片', icon: '🐢', desc: '战士：战斗开始时，所有[防御]牌耗能 -1（最低为 0），更容易架起护盾节奏。', price: 200 },
    { id: 'r_bleed_return_exhaust', name: '猎魂镰刃', icon: '🪝', desc: '弓手：触发[放血]时，放逐区的所有卡牌回到手牌，把毒血引爆和放逐循环接在一起。', price: 250 },
    { id: 'r_return_knife', name: '回风刀鞘', icon: '🪃', desc: '弓手：每当卡牌从放逐区返回，获得 1 点庇护并添加一张[销毁]飞刀。', price: 180 },
    { id: 'r_base_energy', name: '源能核心', icon: '💠', desc: '通用：战斗开始时基础能量提高 1，让三种职业都能更早展开核心节奏。', price: 280 },
    { id: 'r_shield', name: '古誓护印', icon: '🔰', desc: '通用：所有[防御]牌额外获得 4 点护甲，适合任何需要稳住节奏的牌组。', price: 150 },
    { id: 'r_combo', name: '流转沙漏', icon: '⌛', desc: '通用：一回合内每打出 3 张牌，额外[抽牌] 1 张，帮助连段与找牌。', price: 210 },
    { id: 'r_battle_whetstone', name: '磨锋砥石', icon: '🪨', desc: '通用：每场战斗开始时，本场战斗所有伤害提高 2。', price: 170 },
    { id: 'r_first_draw', name: '启程星图', icon: '🌠', desc: '通用：每回合摸牌数提高 1，让任意职业都更容易凑齐核心组合。', price: 230 },
    { id: 'r_warm_pendant', name: '余烬护符', icon: '🔆', desc: '通用：每场战斗胜利后回复 6 点生命，适合长线探索。', price: 160 },
    { id: 'r_silver_purse', name: '银纹钱袋', icon: '👛', desc: '通用：每场战斗胜利后额外获得 10 枚金币，强化商栈路线。', price: 180 },
    
    { id: 'r_brutal', name: '余烬回响', icon: '🔥', desc: '法师：每触发一次[回响]，对敌人施加 1 层[燃烧]，让连锁法术带来持续压力。', price: 250 },
    { id: 'r_ethereal', name: '风行之手', icon: '🖐️', desc: '弓手：具有[保留]的卡牌回到手牌时，本回合耗能 -1，方便保留风势后的收束牌。', price: 200 },
    { id: 'r_poison_leech', name: '毒脉汲取', icon: '🧪', desc: '弓手：当敌方带有[剧毒]时，你的[吸血]回复量翻倍。', price: 220 },
    { id: 'r_pierce', name: '破甲箭锋', icon: '🗡️', desc: '弓手：你的[追击]攻击视为[穿甲]攻击。', price: 280 },
    { id: 'r_pass_energy', name: '自然回流', icon: '⚡', desc: '弓手：使用带有[放逐]的牌回复 1 点能量；触发[自然]时额外再回复 1 点。', price: 300 },
    { id: 'r_frenzy', name: '连祷狂热', icon: '🔥', desc: '法师：一回合内每打出 4 张牌后，下一张非诅咒卡牌自动触发[回响]。', price: 280 },
    { id: 'r_pass_draw', name: '职业秘卷', icon: '📚', desc: '通用：通过效果[抽牌]时，按当前职业为抽到的牌赋予职业基础词条，适合作为临时转向或补强工具。', price: 250 },
    { id: 'r_blood', name: '血池圣印', icon: '💉', desc: '战士：对带[出血]的敌人发动[吸血]时，额外偿还等同其出血层数的血债。', price: 220 },
    { id: 'r_execute', name: '猎首时刻', icon: '⚖️', desc: '弓手：对处于[易伤]状态的敌人触发[放血]时，不会清空其[出血]层数。', price: 260 },
    { id: 'r_pass_thorns', name: '圣棘花冠', icon: '🌹', desc: '战士：[荆棘]受击时不再减少，新回合开始时也不再自动减半。', price: 280 },
    { id: 'r_overheal', name: '圣疗溢光', icon: '💖', desc: '战士/法师：满生命时，溢出的[治愈]或[吸血]转化为等量护盾。', price: 240 },
    { id: 'r_despair', name: '虚弱星环', icon: '🌑', desc: '法师：敌方每拥有 1 层[虚弱]，你的攻击伤害提高 10%。', price: 250 },
    { id: 'r_perma_curse', name: '永续法印', icon: '⛓️', desc: '法师：敌方身上的[易伤]与[虚弱]在回合结束时不再衰减。', price: 260 },
    { id: 'r_long_decay', name: '长驻猎痕', icon: '⏳', desc: '弓手：敌方的[剧毒]与[出血]层数在回合结束时不再自动衰减。', price: 260 },
    { id: 'r_guardian_core', name: '守誓炉心', icon: '🛡️', desc: '战士：获得[庇护]时，同时获得其数值一半的护盾。', price: 170 },
    { id: 'r_sword_oath', name: '圣剑誓印', icon: '⚔️', desc: '战士：[圣剑]攻击从护盾获得的伤害提升，由 50% 提高到 70%。', price: 190 },
    { id: 'r_thorn_bloom', name: '棘辉冠冕', icon: '🌹', desc: '战士：打出[圣剑]攻击后，若你拥有[荆棘]，额外造成等同荆棘层数的穿甲伤害。', price: 210 },
    { id: 'r_counter_gate', name: '招架门徽', icon: '🚪', desc: '战士：每场战斗第一次单张防御牌获得 15 点以上护盾时，进入[反击]姿态。', price: 180 },
    { id: 'r_status_prism', name: '星蚀棱镜', icon: '💠', desc: '法师：每张牌首次施加负面状态时，获得 1 层[咏唱]。', price: 190 },
    { id: 'r_burst_lens', name: '聚爆透镜', icon: '🔍', desc: '法师：[爆发]或裂星禁术消耗咏唱后会保留一半咏唱层数。', price: 230 },
    { id: 'r_chant_ink', name: '恒咏墨瓶', icon: '🖋️', desc: '法师：你的回合开始时，若[咏唱]低于 2 层，补到 2 层。', price: 210 },
    { id: 'r_wind_quiver', name: '踏风箭囊', icon: '🏹', desc: '弓手：每次通过卡牌或职业联动获得风势或[闪避]时，额外获得 1 层对应状态。', price: 190 },
    { id: 'r_exile_cache', name: '流亡箭匣', icon: '📦', desc: '弓手：带[放逐]的攻击牌获得的放逐威能从 50% 提高到 75%。', price: 200 },
    { id: 'r_bloodlet_draw', name: '赤脉弦扣', icon: '🩸', desc: '弓手：触发[放血]并成功引爆出血后，额外[抽牌] 1 张。', price: 170 },
    { id: 'r_copy_seal', name: '复写印泥', icon: '📜', desc: '通用：商栈拓印卡牌的价格降低 20 金币。', price: 160 },
    { id: 'r_reward_crown', name: '弃赏王冠', icon: '👑', desc: '通用：放弃战斗后的卡牌或遗物奖励时，换取的金币额外增加 15。', price: 170 }
];
const FORMAL_RELIC_ICON_IDS = new Set([
    'r_fast_foot', 'r_decay_seal', 'r_poison_leech', 'r_skill_cost', 'r_yin_yang',
    'r_frenzy_veil', 'r_pierce', 'r_exhaust_dmg', 'r_poison_fang', 'r_ethereal',
    'r_luck_box', 'r_echo_mirror_relic', 'r_heavy_badge', 'r_thorn_shield_new', 'r_pierce_amulet',
    'r_bone_ring', 'r_def_cost', 'r_sac_jade', 'r_weak_mask', 'r_energy_crys',
    'r_enchant_crys', 'r_long_decay', 'r_overheal', 'r_despair', 'r_combo_ring',
    'r_return_poison', 'r_frenzy', 'r_return_bleed', 'r_vamp_ring',
    'r_blood', 'r_pass_draw', 'r_perma_curse', 'r_brutal',
    'r_omni_seal', 'r_bleed_return_exhaust', 'r_pass_thorns', 'r_life_totem',
    'r_return_knife', 'r_pass_energy', 'r_base_energy', 'r_exhaust_knife', 'r_heal_relic',
    'r_counter_amulet', 'r_bleed_knife', 'r_execute', 'r_cycle_compass', 'r_soul_lantern',
    'r_protect_armor', 'r_guardian_core', 'r_sword_oath', 'r_thorn_bloom', 'r_counter_gate',
    'r_status_prism', 'r_burst_lens', 'r_chant_ink', 'r_wind_quiver', 'r_exile_cache',
    'r_bloodlet_draw', 'r_copy_seal', 'r_reward_crown'
]);
const RELIC_MASTER_ICON_BY_ID = {
    r_echo_mirror_relic: 'assets/relics/masters/echo_mirror_master_v1.webp',
    r_poison_fang: 'assets/relics/masters/venom_fang_master_v1.webp',
    r_poison_leech: 'assets/relics/masters/venom_fang_master_v1.webp',
    r_bone_ring: 'assets/relics/masters/blood_dagger_master_v1.webp',
    r_bleed_knife: 'assets/relics/masters/blood_dagger_master_v1.webp',
    r_bleed_return_exhaust: 'assets/relics/masters/blood_dagger_master_v1.webp',
    r_brutal: 'assets/relics/masters/blood_dagger_master_v1.webp',
    r_blood: 'assets/relics/masters/blood_dagger_master_v1.webp',
    r_execute: 'assets/relics/masters/blood_dagger_master_v1.webp',
    r_frenzy_veil: 'assets/relics/masters/cursed_mask_master_v1.webp',
    r_weak_mask: 'assets/relics/masters/cursed_mask_master_v1.webp',
    r_frenzy: 'assets/relics/masters/cursed_mask_master_v1.webp',
    r_thorn_shield_new: 'assets/relics/masters/thorn_shield_master_v1.webp',
    r_pass_thorns: 'assets/relics/masters/thorn_shield_master_v1.webp',
    r_soul_lantern: 'assets/relics/masters/soul_lantern_master_v1.webp',
    r_ethereal: 'assets/relics/masters/soul_lantern_master_v1.webp',
    r_cycle_compass: 'assets/relics/masters/cycle_compass_master_v1.webp',
    r_yin_yang: 'assets/relics/masters/cycle_compass_master_v1.webp',
    r_enchant_crys: 'assets/relics/masters/energy_core_master_v1.webp',
    r_energy_crys: 'assets/relics/masters/energy_core_master_v1.webp',
    r_base_energy: 'assets/relics/masters/energy_core_master_v1.webp',
    r_pass_energy: 'assets/relics/masters/energy_core_master_v1.webp',
    r_sac_jade: 'assets/relics/masters/holy_bloom_master_v1.webp',
    r_vamp_ring: 'assets/relics/masters/holy_bloom_master_v1.webp',
    r_heal_relic: 'assets/relics/masters/holy_bloom_master_v1.webp',
    r_overheal: 'assets/relics/masters/holy_bloom_master_v1.webp',
    r_decay_seal: 'assets/relics/masters/cursed_seal_master_v1.webp',
    r_omni_seal: 'assets/relics/masters/cursed_seal_master_v1.webp',
    r_despair: 'assets/relics/masters/cursed_seal_master_v1.webp',
    r_perma_curse: 'assets/relics/masters/cursed_seal_master_v1.webp',
    r_long_decay: 'assets/relics/masters/cursed_seal_master_v1.webp',
    r_luck_box: 'assets/relics/masters/grimoire_lockbox_master_v1.webp',
    r_skill_cost: 'assets/relics/masters/grimoire_lockbox_master_v1.webp',
    r_pass_draw: 'assets/relics/masters/grimoire_lockbox_master_v1.webp',
    r_combo: 'assets/relics/masters/cycle_compass_master_v1.webp',
    r_first_draw: 'assets/relics/masters/cycle_compass_master_v1.webp',
    r_silver_purse: 'assets/relics/masters/grimoire_lockbox_master_v1.webp',
    r_protect_armor: 'assets/relics/masters/stone_totem_master_v1.webp',
    r_counter_amulet: 'assets/relics/masters/stone_totem_master_v1.webp',
    r_life_totem: 'assets/relics/masters/stone_totem_master_v1.webp',
    r_def_cost: 'assets/relics/masters/stone_totem_master_v1.webp',
    r_shield: 'assets/relics/masters/stone_totem_master_v1.webp',
    r_warm_pendant: 'assets/relics/masters/holy_bloom_master_v1.webp',
    r_pierce_amulet: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_combo_ring: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_heavy_badge: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_fast_foot: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_exhaust_knife: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_return_knife: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_battle_whetstone: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_pierce: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_exhaust_dmg: 'assets/relics/masters/ghost_banner_master_v1.webp',
    r_return_poison: 'assets/relics/masters/ghost_banner_master_v1.webp',
    r_return_bleed: 'assets/relics/masters/ghost_banner_master_v1.webp',
    r_guardian_core: 'assets/relics/masters/stone_totem_master_v1.webp',
    r_sword_oath: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_thorn_bloom: 'assets/relics/masters/thorn_shield_master_v1.webp',
    r_counter_gate: 'assets/relics/masters/stone_totem_master_v1.webp',
    r_status_prism: 'assets/relics/masters/energy_core_master_v1.webp',
    r_burst_lens: 'assets/relics/masters/grimoire_lockbox_master_v1.webp',
    r_chant_ink: 'assets/relics/masters/grimoire_lockbox_master_v1.webp',
    r_wind_quiver: 'assets/relics/masters/martial_crest_master_v1.webp',
    r_exile_cache: 'assets/relics/masters/ghost_banner_master_v1.webp',
    r_bloodlet_draw: 'assets/relics/masters/blood_dagger_master_v1.webp',
    r_copy_seal: 'assets/relics/masters/grimoire_lockbox_master_v1.webp',
    r_reward_crown: 'assets/relics/masters/cycle_compass_master_v1.webp'
};
const COMMON_RELIC_IDS = new Set([
    'r_base_energy', 'r_pass_draw', 'r_shield', 'r_combo',
    'r_battle_whetstone', 'r_first_draw', 'r_warm_pendant', 'r_silver_purse',
    'r_copy_seal', 'r_reward_crown'
]);
const STARTING_RELIC_BY_ROLE = {
    hero_warrior: 'r_start_warrior',
    hero_mage: 'r_start_mage',
    hero_archer: 'r_start_archer'
};
const STARTING_RELIC_IDS = new Set(Object.values(STARTING_RELIC_BY_ROLE));
const ROLE_RELIC_IDS = {
    hero_warrior: new Set([
        'r_start_warrior',
        'r_bone_ring', 'r_thorn_shield_new', 'r_protect_armor', 'r_counter_amulet',
        'r_life_totem', 'r_pierce_amulet', 'r_heavy_badge', 'r_vamp_ring',
        'r_def_cost', 'r_blood', 'r_pass_thorns', 'r_overheal',
        'r_guardian_core', 'r_sword_oath', 'r_thorn_bloom', 'r_counter_gate'
    ]),
    hero_mage: new Set([
        'r_start_mage',
        'r_sac_jade', 'r_enchant_crys', 'r_weak_mask', 'r_echo_mirror_relic',
        'r_energy_crys', 'r_heal_relic', 'r_luck_box', 'r_decay_seal',
        'r_yin_yang', 'r_omni_seal', 'r_skill_cost', 'r_brutal',
        'r_frenzy', 'r_despair', 'r_perma_curse',
        'r_status_prism', 'r_burst_lens', 'r_chant_ink'
    ]),
    hero_archer: new Set([
        'r_start_archer',
        'r_bone_ring', 'r_frenzy_veil', 'r_poison_fang', 'r_bleed_knife',
        'r_soul_lantern', 'r_cycle_compass',
        'r_exhaust_dmg', 'r_exhaust_knife', 'r_return_poison', 'r_return_bleed',
        'r_skill_cost', 'r_bleed_return_exhaust', 'r_return_knife', 'r_ethereal',
        'r_poison_leech', 'r_pierce', 'r_pass_energy',
        'r_execute', 'r_long_decay', 'r_combo_ring', 'r_fast_foot',
        'r_wind_quiver', 'r_exile_cache', 'r_bloodlet_draw'
    ])
};

const RELIC_BUILD_TAGS_BY_ID = {
    r_guardian_core: ['oathblade'],
    r_sword_oath: ['oathblade'],
    r_thorn_bloom: ['oathblade'],
    r_counter_gate: ['oathblade'],
    r_thorn_shield_new: ['oathblade'],
    r_counter_amulet: ['oathblade'],
    r_protect_armor: ['oathblade', 'execution'],
    r_life_totem: ['oathblade'],
    r_def_cost: ['oathblade'],
    r_heavy_badge: ['execution', 'oathblade'],
    r_pierce_amulet: ['execution'],
    r_battle_whetstone: ['execution'],
    r_combo: ['execution'],
    r_vamp_ring: ['bloodoath'],
    r_blood: ['bloodoath'],
    r_overheal: ['oathblade'],
    r_bone_ring: ['bloodoath', 'execution', 'gale'],
    r_status_prism: ['calamity'],
    r_burst_lens: ['chant'],
    r_chant_ink: ['chant'],
    r_sac_jade: ['chant'],
    r_energy_crys: ['chant'],
    r_enchant_crys: ['chant', 'calamity'],
    r_heal_relic: ['chant'],
    r_luck_box: ['chant', 'mirror', 'calamity'],
    r_yin_yang: ['chant', 'mirror'],
    r_echo_mirror_relic: ['mirror'],
    r_omni_seal: ['mirror'],
    r_frenzy: ['mirror'],
    r_brutal: ['mirror', 'calamity'],
    r_decay_seal: ['calamity'],
    r_despair: ['calamity'],
    r_perma_curse: ['calamity'],
    r_weak_mask: ['calamity'],
    r_wind_quiver: ['gale'],
    r_fast_foot: ['gale'],
    r_combo_ring: ['gale'],
    r_frenzy_veil: ['gale'],
    r_pierce: ['gale'],
    r_skill_cost: ['gale', 'chant', 'mirror'],
    r_poison_fang: ['venom'],
    r_bleed_knife: ['venom'],
    r_poison_leech: ['venom'],
    r_execute: ['venom'],
    r_long_decay: ['venom'],
    r_bloodlet_draw: ['venom'],
    r_exile_cache: ['exile'],
    r_exhaust_dmg: ['exile'],
    r_exhaust_knife: ['exile'],
    r_return_poison: ['exile', 'venom'],
    r_return_bleed: ['exile', 'venom'],
    r_bleed_return_exhaust: ['exile', 'venom'],
    r_return_knife: ['exile'],
    r_soul_lantern: ['exile'],
    r_cycle_compass: ['exile'],
    r_pass_energy: ['exile', 'gale'],
    r_ethereal: ['exile', 'gale']
};

const BUILD_EXPANSION_RELICS = [
    { id: 'r_flaw_lens', name: '破绽透镜', icon: '🔍', desc: '战士：[穿甲]攻击命中带[易伤]的敌人时，伤害提高 15%。', price: 170 },
    { id: 'r_duel_glove', name: '决斗手甲', icon: '🥊', desc: '战士：每回合首次触发[连击]时额外[抽牌] 1 张。', price: 150 },
    { id: 'r_stun_chain', name: '缄默锁链', icon: '⛓️', desc: '战士：施加[眩晕]时，额外施加 1 层[易伤]。', price: 160 },
    { id: 'r_execute_scabbard', name: '断罪剑鞘', icon: '🗡️', desc: '战士：[重击]命中带[易伤]的敌人时，额外造成 24 点[穿甲]伤害并获得 12 点庇护。', price: 190 },
    { id: 'r_pierce_meter', name: '裂甲刻尺', icon: '📏', desc: '战士：每回合首次打出[穿甲]攻击时，获得 1 点能量。', price: 160 },
    { id: 'r_combo_warrant', name: '连斩密令', icon: '📜', desc: '战士：一回合内每打出第 2 张攻击牌，下一次伤害提高 6。', price: 170 },
    { id: 'r_finisher_coin', name: '终斩金币', icon: '🪙', desc: '战士：击败敌人时若敌方带有[易伤]，战后额外获得 10 金币。', price: 150 },
    { id: 'r_blood_suture', name: '赤线缝针', icon: '🧵', desc: '战士：每回合首次获得血债时，少获得 2 点血债，并获得 4 点本回合伤害。', price: 160 },
    { id: 'r_vein_cup', name: '脉搏圣杯', icon: '🍷', desc: '战士：每次施加[出血]时，偿还 1 点血债。', price: 170 },
    { id: 'r_rupture_charm', name: '裂口护符', icon: '💔', desc: '战士：触发[放血]后，若清空了出血，额外施加 3 层[出血]并偿还 2 点血债。', price: 170 },
    { id: 'r_lifedebt_scale', name: '命债天平', icon: '⚖️', desc: '战士：生命低于一半时，[吸血]的偿债与回复总量提高 50%；每回合首次完全清偿血债时回复 6 点生命。', price: 190 },
    { id: 'r_scarlet_whet', name: '猩红砥石', icon: '🪨', desc: '战士：每回合首次获得血债后，本回合所有伤害提高 3。', price: 160 },
    { id: 'r_bloodlet_hourglass', name: '放血沙漏', icon: '⌛', desc: '战士：每场战斗首次触发[放血]后，额外[抽牌] 1 张。', price: 170 },
    { id: 'r_oath_transfusion', name: '誓血导管', icon: '🧪', desc: '战士：每回合首次完全清偿血债时，回复 1 点能量。', price: 180 },
    { id: 'r_chant_reservoir', name: '蓄咏水晶', icon: '💎', desc: '法师：每回合首次获得[咏唱]时，额外获得 1 层并抽 1 张牌。', price: 160 },
    { id: 'r_burst_censer', name: '聚爆香炉', icon: '🕯️', desc: '法师：[爆发]消耗至少 3 层咏唱时，额外施加 2 层[燃烧]。', price: 170 },
    { id: 'r_echo_archive_pin', name: '回声书签', icon: '🔖', desc: '法师：每回合首次触发[回响]时，获得 1 点能量与 6 点庇护。', price: 160 },
    { id: 'r_copy_lattice', name: '复写晶格', icon: '💠', desc: '法师：[复刻]没有目标时，改为[抽牌] 1 张并获得 1 层[咏唱]。', price: 170 },
    { id: 'r_rewind_sand', name: '倒带砂瓶', icon: '⌛', desc: '法师：触发[重置]并实际弃牌后，额外[抽牌] 1 张。', price: 160 },
    { id: 'r_double_quill', name: '双墨羽笔', icon: '🖋️', desc: '法师：每回合第二张能力牌额外[抽牌] 1 张。', price: 170 },
    { id: 'r_hex_incense', name: '咒雾香', icon: '🕯️', desc: '法师：施加[诅咒]时，额外施加 1 层[虚弱]。', price: 160 },
    { id: 'r_plague_glass', name: '疫光玻片', icon: '🧫', desc: '法师：敌方已有负面状态时，能力牌状态层数增加 1，并获得 4 点庇护。', price: 170 },
    { id: 'r_status_ledger', name: '异状账簿', icon: '📒', desc: '法师：敌方负面状态达到 4 种时，每回合首次能力牌额外[抽牌] 1 张。', price: 170 },
    { id: 'r_tailwind_spool', name: '顺风线轴', icon: '🧵', desc: '弓手：每回合首次获得风势或[闪避]时，额外获得 1 层并获得 3 点庇护。', price: 160 },
    { id: 'r_multishot_fletching', name: '分羽箭尾', icon: '🪶', desc: '弓手：[追击]攻击额外造成 2 点伤害。', price: 170 },
    { id: 'r_gray_market_map', name: '灰市地图', icon: '🗺️', desc: '通用：卡牌奖励与商栈补货中，带职业构筑方向的卡牌权重提高。', price: 180 },
    { id: 'r_campfire_pouch', name: '营火锦囊', icon: '🎒', desc: '通用：放弃奖励时获得更多金币，适合慢慢寻找关键构筑件。', price: 170 }
];

RELIC_POOL.push(...BUILD_EXPANSION_RELICS);

[
    'r_flaw_lens', 'r_duel_glove', 'r_stun_chain',
    'r_execute_scabbard', 'r_pierce_meter', 'r_combo_warrant', 'r_finisher_coin'
].forEach(id => ROLE_RELIC_IDS.hero_warrior.add(id));
[
    'r_blood_suture', 'r_vein_cup', 'r_rupture_charm',
    'r_lifedebt_scale', 'r_scarlet_whet', 'r_bloodlet_hourglass', 'r_oath_transfusion'
].forEach(id => ROLE_RELIC_IDS.hero_warrior.add(id));
[
    'r_chant_reservoir', 'r_burst_censer',
    'r_echo_archive_pin', 'r_copy_lattice', 'r_rewind_sand', 'r_double_quill',
    'r_hex_incense', 'r_plague_glass', 'r_status_ledger'
].forEach(id => ROLE_RELIC_IDS.hero_mage.add(id));
[
    'r_tailwind_spool', 'r_multishot_fletching'
].forEach(id => ROLE_RELIC_IDS.hero_archer.add(id));
[
    'r_gray_market_map', 'r_campfire_pouch'
].forEach(id => COMMON_RELIC_IDS.add(id));

Object.assign(RELIC_BUILD_TAGS_BY_ID, {
    r_flaw_lens: ['execution'],
    r_duel_glove: ['execution'],
    r_stun_chain: ['execution'],
    r_execute_scabbard: ['execution'],
    r_pierce_meter: ['execution'],
    r_combo_warrant: ['execution'],
    r_finisher_coin: ['execution'],
    r_blood_suture: ['bloodoath'],
    r_vein_cup: ['bloodoath'],
    r_rupture_charm: ['bloodoath'],
    r_lifedebt_scale: ['bloodoath'],
    r_scarlet_whet: ['bloodoath'],
    r_bloodlet_hourglass: ['bloodoath'],
    r_oath_transfusion: ['bloodoath'],
    r_chant_reservoir: ['chant'],
    r_burst_censer: ['chant'],
    r_echo_archive_pin: ['mirror'],
    r_copy_lattice: ['mirror'],
    r_rewind_sand: ['mirror'],
    r_double_quill: ['mirror'],
    r_hex_incense: ['calamity'],
    r_plague_glass: ['calamity'],
    r_status_ledger: ['calamity'],
    r_tailwind_spool: ['gale'],
    r_multishot_fletching: ['gale']
});

const RELIC_CARD_REWARD_BONUS_BY_ID = {
    r_sword_oath: 'oathblade',
    r_pierce_amulet: 'execution',
    r_blood_suture: 'bloodoath',
    r_sac_jade: 'chant',
    r_echo_archive_pin: 'mirror',
    r_plague_glass: 'calamity',
    r_wind_quiver: 'gale',
    r_poison_fang: 'venom',
    r_exile_cache: 'exile',
    // Legacy save compatibility for removed opening core relics.
    r_oathblade_beacon: 'oathblade',
    r_execution_warrant: 'execution',
    r_bloodoath_contract: 'bloodoath',
    r_chant_astrolabe: 'chant',
    r_mirror_catalog: 'mirror',
    r_calamity_orb: 'calamity',
    r_gale_weatherwane: 'gale',
    r_venom_seedcase: 'venom',
    r_exile_roadsign: 'exile'
};
