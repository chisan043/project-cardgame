// Extracted gameplay data. Keep this file free of DOM/runtime side effects.
const CHARACTER_ORDER = ['hero_warrior', 'hero_mage', 'hero_archer'];
const CHARACTERS = {
    hero_warrior: {
        id: 'hero_warrior',
        name: '勇者战士',
        subtitle: '近战 / 防御 / 圣剑',
        desc: '稳定的护盾与反击路线，适合喜欢明确信号与稳步压制的对局体验。',
        tags: ['圣剑反击', '处刑连斩', '血誓狂战'],
        maxHp: 90,
        baseEnergy: 5,
        openingHand: 5,
        startingGold: 50,
        starterDeckId: 'starter_warrior',
        cardPoolId: 'pool_warrior',
        passive: '更高生命上限。每场战斗开始获得 5 点护盾；圣剑攻击会借护盾与反击姿态追加伤害。',
        portrait: 'assets/characters/warrior/select_portrait_v1.webp',
        avatarPortrait: 'assets/characters/warrior/avatar_portrait_v1.webp',
        battleBack: 'assets/characters/warrior/battle_back_idle_v1.webp',
        battleBackAttackFrames: [
            { src: 'assets/characters/warrior/battle_back_attack_01_v2.webp', duration: 80 },
            { src: 'assets/characters/warrior/battle_back_attack_02_v2.webp', duration: 90 },
            { src: 'assets/characters/warrior/battle_back_attack_03_v2.webp', duration: 110 },
            { src: 'assets/characters/warrior/battle_back_attack_04_v2.webp', duration: 80 },
            { src: 'assets/characters/warrior/battle_back_attack_05_v2.webp', duration: 120 },
            { src: 'assets/characters/warrior/battle_back_attack_06_v2.webp', duration: 100 }
        ],
        battleBackAttackScale: 1.38,
        battleBackAttackOffset: { x: 56, y: 6 },
        battleBackAttackImpactMs: 360,
        battleAttackVfxType: 'warrior',
        battleAttackVfxImpactFrame: 3,
        battleAttackVfxFrames: [
            { src: 'assets/vfx/player_attack/warrior_slash_01_v1.webp', duration: 50 },
            { src: 'assets/vfx/player_attack/warrior_slash_02_v1.webp', duration: 50 },
            { src: 'assets/vfx/player_attack/warrior_slash_03_v1.webp', duration: 60 },
            { src: 'assets/vfx/player_attack/warrior_slash_04_v1.webp', duration: 70 },
            { src: 'assets/vfx/player_attack/warrior_slash_05_v1.webp', duration: 70 },
            { src: 'assets/vfx/player_attack/warrior_slash_06_v1.webp', duration: 90 }
        ],
        battleBackHurtFrames: [
            { src: 'assets/characters/warrior/battle_back_hurt_01_v2.webp', duration: 60 },
            { src: 'assets/characters/warrior/battle_back_hurt_02_v2.webp', duration: 70 },
            { src: 'assets/characters/warrior/battle_back_hurt_03_v2.webp', duration: 80 },
            { src: 'assets/characters/warrior/battle_back_hurt_04_v2.webp', duration: 110 },
            { src: 'assets/characters/warrior/battle_back_hurt_05_v2.webp', duration: 100 },
            { src: 'assets/characters/warrior/battle_back_hurt_06_v2.webp', duration: 90 }
        ],
        accentClass: '',
        starterHint: '护盾是战士的基础生存手段；开局通过核心遗物确定圣剑反击、处刑连斩或血誓狂战路线。'
    },
    hero_mage: {
        id: 'hero_mage',
        name: '萝莉魔导士',
        subtitle: '法术 / 爆发 / 咏唱',
        desc: '先积累咏唱，再用爆发法术一次性倾斜战局，适合偏爱节奏铺垫与高回报连段的路线。',
        tags: ['星火咏唱', '镜像回路', '灾厄术士'],
        maxHp: 72,
        baseEnergy: 6,
        openingHand: 5,
        startingGold: 55,
        starterDeckId: 'starter_mage',
        cardPoolId: 'pool_mage',
        passive: '基础能量 +1，初始金币略高，但生命上限较低；爆发牌会消耗咏唱造成追加伤害。',
        portrait: 'assets/characters/mage/select_portrait_v1.webp',
        avatarPortrait: 'assets/characters/mage/avatar_portrait_v1.webp',
        battleBack: 'assets/characters/mage/battle_back_idle_v1.webp',
        battleBackAttackFrames: [
            { src: 'assets/characters/mage/battle_back_attack_01_v2.webp', duration: 90 },
            { src: 'assets/characters/mage/battle_back_attack_02_v2.webp', duration: 90 },
            { src: 'assets/characters/mage/battle_back_attack_03_v2.webp', duration: 110 },
            { src: 'assets/characters/mage/battle_back_attack_04_v2.webp', duration: 90 },
            { src: 'assets/characters/mage/battle_back_attack_05_v2.webp', duration: 110 },
            { src: 'assets/characters/mage/battle_back_attack_06_v2.webp', duration: 100 }
        ],
        battleBackAttackScale: 1.49,
        battleBackAttackOffset: { x: 56, y: 8 },
        battleBackAttackImpactMs: 380,
        battleAttackVfxType: 'mage',
        battleAttackVfxImpactFrame: 4,
        battleAttackVfxFrames: [
            { src: 'assets/vfx/player_attack/mage_magic_bolt_01_v1.webp', duration: 45 },
            { src: 'assets/vfx/player_attack/mage_magic_bolt_02_v1.webp', duration: 55 },
            { src: 'assets/vfx/player_attack/mage_magic_bolt_03_v1.webp', duration: 60 },
            { src: 'assets/vfx/player_attack/mage_magic_bolt_04_v1.webp', duration: 70 },
            { src: 'assets/vfx/player_attack/mage_magic_bolt_05_v1.webp', duration: 75 },
            { src: 'assets/vfx/player_attack/mage_magic_bolt_06_v1.webp', duration: 80 }
        ],
        battleBackHurtFrames: [
            { src: 'assets/characters/mage/battle_back_hurt_01_v2.webp', duration: 60 },
            { src: 'assets/characters/mage/battle_back_hurt_02_v2.webp', duration: 70 },
            { src: 'assets/characters/mage/battle_back_hurt_03_v2.webp', duration: 80 },
            { src: 'assets/characters/mage/battle_back_hurt_04_v2.webp', duration: 110 },
            { src: 'assets/characters/mage/battle_back_hurt_05_v2.webp', duration: 100 },
            { src: 'assets/characters/mage/battle_back_hurt_06_v2.webp', duration: 90 }
        ],
        accentClass: 'featured',
        starterHint: '治愈是法师的基础生存手段；开局通过核心遗物确定星火咏唱、镜像回路或灾厄术士路线。'
    },
    hero_archer: {
        id: 'hero_archer',
        name: '精灵弓箭手',
        subtitle: '连射 / 操作 / 自然',
        desc: '通过风势、自然调度与连射组织持续输出，攻击之间穿插走位与追射，更像远程游走型构筑。',
        tags: ['疾风连射', '猎毒陷袭', '放逐游侠'],
        maxHp: 78,
        baseEnergy: 5,
        openingHand: 6,
        startingGold: 45,
        starterDeckId: 'starter_archer',
        cardPoolId: 'pool_archer',
        passive: '每回合抽牌多 1 张；蓄力会转化为风势，攻击时消耗 1 层风势追加追射并获得庇护。',
        portrait: 'assets/characters/archer/select_portrait_v1.webp',
        avatarPortrait: 'assets/characters/archer/avatar_portrait_v1.webp',
        battleBack: 'assets/characters/archer/battle_back_idle_v1.webp',
        battleBackAttackFrames: [
            { src: 'assets/characters/archer/battle_back_attack_01_v2.webp', duration: 80 },
            { src: 'assets/characters/archer/battle_back_attack_02_v2.webp', duration: 90 },
            { src: 'assets/characters/archer/battle_back_attack_03_v2.webp', duration: 110 },
            { src: 'assets/characters/archer/battle_back_attack_04_v2.webp', duration: 100 },
            { src: 'assets/characters/archer/battle_back_attack_05_v2.webp', duration: 80 },
            { src: 'assets/characters/archer/battle_back_attack_06_v2.webp', duration: 100 }
        ],
        battleBackAttackScale: 1.24,
        battleBackAttackOffset: { x: 56, y: -38 },
        battleBackAttackImpactMs: 380,
        battleAttackVfxType: 'archer',
        battleAttackVfxImpactFrame: 4,
        battleAttackVfxFrames: [
            { src: 'assets/vfx/player_attack/archer_arrow_01_v1.webp', duration: 40 },
            { src: 'assets/vfx/player_attack/archer_arrow_02_v1.webp', duration: 45 },
            { src: 'assets/vfx/player_attack/archer_arrow_03_v1.webp', duration: 50 },
            { src: 'assets/vfx/player_attack/archer_arrow_04_v1.webp', duration: 55 },
            { src: 'assets/vfx/player_attack/archer_arrow_05_v1.webp', duration: 70 },
            { src: 'assets/vfx/player_attack/archer_arrow_06_v1.webp', duration: 80 }
        ],
        battleBackHurtFrames: [
            { src: 'assets/characters/archer/battle_back_hurt_01_v2.webp', duration: 60 },
            { src: 'assets/characters/archer/battle_back_hurt_02_v2.webp', duration: 70 },
            { src: 'assets/characters/archer/battle_back_hurt_03_v2.webp', duration: 80 },
            { src: 'assets/characters/archer/battle_back_hurt_04_v2.webp', duration: 110 },
            { src: 'assets/characters/archer/battle_back_hurt_05_v2.webp', duration: 100 },
            { src: 'assets/characters/archer/battle_back_hurt_06_v2.webp', duration: 90 }
        ],
        accentClass: '',
        starterHint: '基础射击输出，闪避可完全躲开一段主体攻击；开局通过核心遗物确定疾风、猎毒或放逐路线。'
    }
};
