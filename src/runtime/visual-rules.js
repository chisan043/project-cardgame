// Side-effect-free visual asset helpers. DOM preloading and animation stay in the main runtime.
(function exposeVisualRules(global) {
    'use strict';

    const DEFAULT_ATTACK_FRAME_DURATIONS = [110, 120, 170, 120];
    const ARCHER_WIND_BUFF_CARD_IDS = ['s_energy', 's_exhaust', 'a_green_resonance'];
    const MAGE_CHANT_BUFF_CARD_IDS = ['m_chant_singularity', 'm_echo_archive', 'm_arcane_aegis'];
    const STATUS_ICON_IDS = new Set([
        'armor', 'thorns', 'str', 'charge', 'echo', 'blood', 'enchant', 'guard',
        'counter', 'poison', 'bleed', 'burn', 'stun', 'curse', 'vuln', 'weak'
    ]);
    const WARRIOR_SHIELD_BUFF_CARD_IDS = ['s_thorns', 'a_syn_array', 'w_bastion_prayer', 'w_oath_fortress'];

    function defaultBaseEnemyName(enemy) {
        return (enemy?.name || '').replace(/·.*?(?=】)/, '').replace(/·暴走/g, '');
    }

    function getEnemyAssetSlug(enemy, {
        enemyAssetSlugs = {},
        getBaseEnemyName = defaultBaseEnemyName
    } = {}) {
        if (!enemy || !enemy.name) return null;
        return enemyAssetSlugs[getBaseEnemyName(enemy)] || null;
    }

    function getEnemyVisualPath(enemy, options = {}) {
        const slug = getEnemyAssetSlug(enemy, options);
        return slug ? `assets/enemies/battle/${slug}_battle_v1.webp` : null;
    }

    function getEnemyAvatarPath(enemy, options = {}) {
        const slug = getEnemyAssetSlug(enemy, options);
        return slug ? `assets/enemies/portraits/${slug}_portrait_v1.webp` : null;
    }

    function getCardFrameTheme(card, {
        cardFrameAssets = {},
        cardFrameThemeByName = {}
    } = {}) {
        if (!card) return 'neutral';
        if (card.frameTheme && cardFrameAssets[card.frameTheme]) return card.frameTheme;
        if (cardFrameThemeByName[card.name]) return cardFrameThemeByName[card.name];
        if (card.poolId && card.poolId.startsWith('warrior_')) return 'warrior';
        if (card.poolId && card.poolId.startsWith('mage_')) return 'mage';
        if (card.poolId && card.poolId.startsWith('archer_')) return 'archer';
        if (card.type === '诅咒' || card.isJunk || card.isKnife) return 'neutral';
        return 'neutral';
    }

    function getCardFramePath(card, {
        cardFrameAssets = {},
        cardFrameThemeByName = {}
    } = {}) {
        const theme = getCardFrameTheme(card, { cardFrameAssets, cardFrameThemeByName });
        return cardFrameAssets[theme] || cardFrameAssets.neutral || '';
    }

    function getRelicIconPath(relic, {
        formalRelicIconIds = new Set(),
        relicMasterIconById = {}
    } = {}) {
        if (!relic || !relic.id) return '';
        if (formalRelicIconIds.has(relic.id)) return `assets/relics/icons/${relic.id}_icon_v1.webp`;
        return relicMasterIconById[relic.id] || '';
    }

    function getStatusIconPath(id, {
        statusIconIds = STATUS_ICON_IDS
    } = {}) {
        if (!statusIconIds.has(id)) return '';
        return `assets/ui/hud/status_icons/status_${id}_asset_v1.webp`;
    }

    function getEnemyAttackFrames(enemy, {
        frameDurations = DEFAULT_ATTACK_FRAME_DURATIONS,
        ...slugOptions
    } = {}) {
        const slug = getEnemyAssetSlug(enemy, slugOptions);
        if (!slug) return [];
        return frameDurations.map((duration, index) => ({
            src: `assets/enemies/attack/${slug}_attack_${String(index + 1).padStart(2, '0')}_v1.webp`,
            duration
        }));
    }

    function getFrameSequenceDuration(frames = [], { minDuration = 0 } = {}) {
        return Math.max(
            minDuration,
            frames.reduce((sum, frame) => sum + (Number(frame.duration) || 0), 0)
        );
    }

    function getFrameSequenceLeadDuration(frames = [], frameIndex = 0) {
        const safeIndex = Math.max(0, Math.min(Number(frameIndex) || 0, frames.length));
        return frames
            .slice(0, safeIndex)
            .reduce((sum, frame) => sum + (Number(frame.duration) || 0), 0);
    }

    function getEnemyAttackAnimationTiming(frames = [], {
        defaultFirstFrameDuration = 110,
        defaultSecondFrameDuration = 120,
        impactBuffer = 45,
        maxImpactDelay = 300,
        minDuration = 420
    } = {}) {
        const totalDuration = getFrameSequenceDuration(frames, { minDuration });
        const impactDelay = Math.min(
            maxImpactDelay,
            (Number(frames[0]?.duration) || defaultFirstFrameDuration)
                + (Number(frames[1]?.duration) || defaultSecondFrameDuration)
                + impactBuffer
        );
        return { impactDelay, duration: totalDuration };
    }

    function getPlayerAttackAnimationTiming(frames = [], {
        attackImpactMs = 140,
        minDuration = 480
    } = {}) {
        const totalDuration = getFrameSequenceDuration(frames, { minDuration });
        return {
            impactDelay: Math.min(attackImpactMs || 140, totalDuration),
            duration: totalDuration
        };
    }

    function getPlayerAttackVfxLayout({
        avatarRect = null,
        enemyRect = null,
        origin = { x: 0.5, y: 0.5 },
        type = 'warrior'
    } = {}) {
        if (!avatarRect || !enemyRect) return null;
        const target = {
            x: enemyRect.left + enemyRect.width * 0.5,
            y: enemyRect.top + enemyRect.height * 0.46
        };
        const size = type === 'warrior'
            ? { width: 360, height: 468 }
            : type === 'mage'
                ? { width: 300, height: 270 }
                : { width: 360, height: 240 };
        const start = type === 'warrior' ? target : {
            x: avatarRect.left + avatarRect.width * origin.x,
            y: avatarRect.top + avatarRect.height * origin.y
        };
        return {
            deltaX: target.x - start.x,
            deltaY: target.y - start.y,
            height: size.height,
            left: start.x - size.width / 2,
            top: start.y - size.height / 2,
            width: size.width
        };
    }

    function getPlayerBuffVfxLayout({
        avatarRect = null,
        config = {},
        viewportHeight = 0,
        viewportWidth = 0
    } = {}) {
        const width = config.width || 390;
        const height = config.height || 520;
        const origin = config.origin || { x: 0.52, y: 0.45 };
        const center = avatarRect
            ? {
                x: avatarRect.left + avatarRect.width * origin.x,
                y: avatarRect.top + avatarRect.height * origin.y
            }
            : {
                x: viewportWidth * 0.34,
                y: viewportHeight * 0.55
            };
        return {
            height,
            width,
            x: center.x,
            y: center.y
        };
    }

    function getCardBuffVfxKind({
        card = null,
        hasDirectEffect = (candidate, effect) => !!candidate?.directEffects?.[effect],
        roleId = ''
    } = {}) {
        if (!card) return null;
        const tags = card.tags || [];
        if (roleId === 'hero_archer') {
            if (tags.includes('闪避') || card.specialId === 'a_wind_dance') return 'dodge';
            if (
                tags.includes('蓄力') ||
                tags.includes('自然') ||
                ARCHER_WIND_BUFF_CARD_IDS.includes(card.specialId)
            ) return 'wind';
        }
        if (roleId === 'hero_mage') {
            if (
                tags.includes('咏唱') ||
                MAGE_CHANT_BUFF_CARD_IDS.includes(card.specialId)
            ) return 'chant';
        }
        if (roleId === 'hero_warrior') {
            if (
                card.type === '防御' ||
                tags.includes('庇护') ||
                tags.includes('反击') ||
                tags.includes('荆棘') ||
                hasDirectEffect(card, 'protection') ||
                WARRIOR_SHIELD_BUFF_CARD_IDS.includes(card.specialId)
            ) return 'shield';
        }
        return null;
    }

    function getShieldHitVfxLayout(absorbed = 0, {
        playerRect = null,
        viewportHeight = 0,
        viewportWidth = 0
    } = {}) {
        const impactX = playerRect
            ? playerRect.left + playerRect.width * 0.52
            : viewportWidth * 0.34;
        const impactY = playerRect
            ? playerRect.top + playerRect.height * 0.47
            : viewportHeight * 0.52;
        const width = Math.max(430, Math.min(535, 430 + Math.max(0, absorbed) * 5));
        return {
            height: Math.round(width * 1.34),
            impactX,
            impactY,
            width
        };
    }

    function getEnemyAttackVfxAsset(type) {
        return `assets/vfx/enemy_attack/${String(type || '').replace(/-/g, '_')}_vfx_v1.webp`;
    }

    function getEnemyAttackVfxLayout({
        enemyRect = null,
        layout = {},
        playerRect = null
    } = {}) {
        const width = layout.width || 260;
        const height = layout.height || 260;
        const style = {
            deltaX: '-380px',
            deltaY: '20px',
            duration: layout.duration || 560,
            endScale: layout.endScale || '1.08',
            filter: layout.filter || 'drop-shadow(0 0 18px rgba(255,255,255,0.65)) saturate(1.18) brightness(1.12)',
            height,
            left: '58%',
            motion: layout.motion || 'projectile',
            rotate: layout.rotate || '0deg',
            startScale: layout.startScale || '0.58',
            top: '28%',
            width
        };

        if (!enemyRect || !playerRect) return style;

        const startX = enemyRect.left + enemyRect.width * (layout.startX ?? 0.34);
        const startY = enemyRect.top + enemyRect.height * (layout.startY ?? 0.44);
        const targetX = playerRect.left + playerRect.width * (layout.targetX ?? 0.67);
        const targetY = playerRect.top + playerRect.height * (layout.targetY ?? 0.46);
        return {
            ...style,
            deltaX: `${targetX - startX}px`,
            deltaY: `${targetY - startY}px`,
            left: `${startX - width * 0.5}px`,
            top: `${startY - height * 0.5}px`
        };
    }

    function getEnemyAttackVfxType({
        defaultVfxType = 'dark-iaijutsu',
        enemy = null,
        enemyAssetSlugs = {},
        enemyAttackVfxBySlug = {},
        getBaseEnemyName = defaultBaseEnemyName,
        move = null
    } = {}) {
        if (move?.type === 'attack_lifesteal') return 'blood-siphon';
        const moveName = move?.name || '';
        if (moveName.includes('龙息')) return 'dragon-breath';
        if (moveName.includes('声波') || moveName.includes('超声')) return 'sonic-wave';
        const slug = getEnemyAssetSlug(enemy, { enemyAssetSlugs, getBaseEnemyName });
        return enemyAttackVfxBySlug[slug] || defaultVfxType;
    }

    global.QuestersVisualRules = {
        getCardBuffVfxKind,
        getCardFramePath,
        getCardFrameTheme,
        getEnemyAssetSlug,
        getEnemyAttackAnimationTiming,
        getEnemyAttackFrames,
        getEnemyAttackVfxAsset,
        getEnemyAttackVfxLayout,
        getEnemyAttackVfxType,
        getEnemyAvatarPath,
        getEnemyVisualPath,
        getFrameSequenceDuration,
        getFrameSequenceLeadDuration,
        getPlayerAttackAnimationTiming,
        getPlayerAttackVfxLayout,
        getPlayerBuffVfxLayout,
        getRelicIconPath,
        getStatusIconPath,
        getShieldHitVfxLayout
    };
})(window);
