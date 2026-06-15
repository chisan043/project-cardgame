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
        getEnemyAttackFrames,
        getEnemyAttackVfxAsset,
        getEnemyAttackVfxType,
        getEnemyAvatarPath,
        getEnemyVisualPath
    };
})(window);
