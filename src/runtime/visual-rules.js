// Side-effect-free visual asset helpers. DOM preloading and animation stay in the main runtime.
(function exposeVisualRules(global) {
    'use strict';

    const DEFAULT_ATTACK_FRAME_DURATIONS = [110, 120, 170, 120];

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
        getEnemyAssetSlug,
        getEnemyAttackAnimationTiming,
        getEnemyAttackFrames,
        getEnemyAttackVfxAsset,
        getEnemyAttackVfxType,
        getEnemyAvatarPath,
        getEnemyVisualPath,
        getFrameSequenceDuration,
        getFrameSequenceLeadDuration,
        getPlayerAttackAnimationTiming,
        getPlayerAttackVfxLayout,
        getShieldHitVfxLayout
    };
})(window);
