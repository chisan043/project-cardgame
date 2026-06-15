// Side-effect-free visual asset helpers. DOM preloading and animation stay in the main runtime.
(function exposeVisualRules(global) {
    'use strict';

    const DEFAULT_ATTACK_FRAME_DURATIONS = [110, 120, 170, 120];
    const ARCHER_WIND_BUFF_CARD_IDS = ['s_energy', 's_exhaust', 'a_green_resonance'];
    const CARD_NAME_TAG_PRIORITY = [
        '出血', '吸血', '放血', '血祭', '荆棘', '剧毒', '燃烧',
        '易伤', '虚弱', '诅咒', '眩晕',
        '圣剑', '穿甲', '重击', '连击', '追击', '爆发',
        '咏唱', '回响', '复刻', '充能', '附魔',
        '庇护', '闪避', '治愈', '抽牌', '保留', '蓄力', '自然', '重置',
        '放逐', '回收', '销毁', '狂热'
    ];
    const CARD_NAME_VARIANT_WORD_BY_TAG = {
        '出血': '溢血',
        '吸血': '汲血',
        '放血': '裂血',
        '血祭': '血誓',
        '荆棘': '棘甲',
        '剧毒': '蚀毒',
        '燃烧': '烬焰',
        '易伤': '裂隙',
        '虚弱': '虚蚀',
        '诅咒': '咒印',
        '眩晕': '星缚',
        '圣剑': '圣剑',
        '穿甲': '裂甲',
        '重击': '重锋',
        '连击': '连锋',
        '追击': '疾射',
        '爆发': '爆焰',
        '咏唱': '咏星',
        '回响': '回音',
        '复刻': '复写',
        '充能': '充灵',
        '附魔': '魔印',
        '庇护': '护誓',
        '治愈': '愈光',
        '抽牌': '灵引',
        '保留': '留锋',
        '蓄力': '蓄势',
        '自然': '林息',
        '重置': '回流',
        '放逐': '逐影',
        '回收': '归羽',
        '销毁': '碎尘',
        '狂热': '狂焰'
    };
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

    function getRegisteredCardArtPath(card, {
        cardArtRegistry = {}
    } = {}) {
        return card?.art || cardArtRegistry[card?.name] || null;
    }

    function getDirectCardArtPath(card, {
        cardArtRegistry = {},
        cardTypeArtFallback = {}
    } = {}) {
        return getRegisteredCardArtPath(card, { cardArtRegistry })
            || cardTypeArtFallback[card?.type]
            || null;
    }

    function getCardBottomTagList(card = {}, {
        normalizeTags = tags => tags,
        tagDefinitions = {}
    } = {}) {
        if (!Array.isArray(card.tags)) return [];
        const tagSet = new Set(normalizeTags(card.tags));
        return Object.keys(tagDefinitions).filter(tag => tagSet.has(tag));
    }

    function getCardTextDensityClass({
        descHtml = '',
        tagCount = 0
    } = {}) {
        const plain = String(descHtml || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, '');
        const lineHints = (String(descHtml || '').match(/<br\s*\/?>/gi) || []).length;
        if (plain.length >= 58 || lineHints >= 2 || tagCount >= 4) return 'desc-ultra';
        if (plain.length >= 38 || lineHints >= 1 || tagCount >= 3) return 'desc-dense';
        return '';
    }

    function renderTagNames(tags = [], {
        getTagDisplayName = tag => tag
    } = {}) {
        return (tags || []).map(tag => {
            if (tag === '回响') return '<span style="color:var(--gold);">本牌再触发一次</span>';
            if (tag === '复刻') return '<span style="color:var(--gold);">复制上一张非复刻牌</span>';
            return `<span style="color:var(--gold);">${getTagDisplayName(tag)}</span>`;
        }).join('、');
    }

    function formatRatioText(ratio) {
        const percent = Math.round((Number(ratio) || 0) * 100);
        if (percent === 100) return '等量';
        if (percent === 200) return '2倍';
        if (percent % 100 === 0) return `${percent / 100}倍`;
        return `${percent}%`;
    }

    function formatTurnCounterValue(value) {
        const numeric = Math.max(1, Number(value || 1));
        return String(numeric).padStart(2, '0');
    }

    function getStatusLayerCount(card, tag, {
        getAbilityPotency = () => 1
    } = {}) {
        const potency = card?.type === '能力' ? getAbilityPotency(card) : 1;
        if (tag === '剧毒' || tag === '出血') return 3 * potency;
        if (tag === '诅咒' || tag === '易伤' || tag === '虚弱') return 2 * potency;
        if (tag === '燃烧' || tag === '眩晕') return potency;
        return 0;
    }

    function getFlowDamageLine(amount) {
        return `造成 <span class="card-desc-value">${amount}</span> 点流动伤害。`;
    }

    function hasBuildGuideCue(text) {
        return /(适合|用于|帮助|专门|不是|而是|不必|负责|牌组|路线|节奏|窗口|寻找|补足|补强|转向|慢慢|更容易|更稳定|管理|证明|测试|值得|服务|便于|收束|铺垫|凑齐|调度|形成|转成|换取|作为|核心爆点|长线探索)/.test(text);
    }

    function cleanEffectDisplayText(desc, options = {}) {
        if (!desc) return '';
        const effectCues = /(造成|获得|施加|触发|回复|抽牌|放逐|销毁|重置|保留|消耗|复制|丢弃|洗入|清空|进入|引爆|改为|额外|若|每有|层|伤害|护盾|生命|能量)/;
        const preserveRewardWeight = options.preserveRewardWeight !== false;
        return String(desc)
            .replace(/<br\s*\/?>/gi, '。')
            .split(/[。；;]/)
            .map(s => s.trim())
            .map(s => {
                if (preserveRewardWeight && /(卡牌奖励|商栈补货|出现权重|权重提高)/.test(s)) return s;
                if (!hasBuildGuideCue(s)) return s;
                return s
                    .split(/，|,/)
                    .map(part => part.trim())
                    .filter(part => part && !hasBuildGuideCue(part))
                    .join('，');
            })
            .filter(s => s && (effectCues.test(s) || (preserveRewardWeight && /(卡牌奖励|商栈补货|出现权重|权重提高)/.test(s))))
            .map(s => `${s}。`)
            .join('<br>');
    }

    function getEffectOnlySpecialDesc(desc) {
        return cleanEffectDisplayText(desc, { preserveRewardWeight: false });
    }

    function getDisplayRelicDesc(relic) {
        return cleanEffectDisplayText(relic?.desc || '', { preserveRewardWeight: true }) || relic?.desc || '';
    }

    function getRelicBottomTags(relic, {
        formatKeywords = text => text,
        getDisplayTags = () => [],
        getTagDisplayName = tag => tag,
        tagDefinitions = {}
    } = {}) {
        let tagsHtml = '';
        getDisplayTags(relic).forEach(tag => {
            if (tagDefinitions[tag]) {
                const tooltip = tagDefinitions[tag].replace(/\{val\}/g, 'X');
                tagsHtml += `<span class="keyword-tag">${getTagDisplayName(tag)}<span class="keyword-tooltip">${formatKeywords(tooltip)}</span></span>`;
            }
        });
        if (tagsHtml) return `<div style="display:flex; flex-wrap:wrap; align-content:flex-start; margin-top:auto; padding-top:8px; border-top:1px dashed #444; width:100%;">${tagsHtml}</div>`;
        return '';
    }

    function renderRelicVisual(relic, {
        fallbackClass = '',
        imgClass = '',
        resolveRelicIconPath = () => '',
        wrapperClass = ''
    } = {}) {
        const fallback = relic?.icon || '❔';
        const src = resolveRelicIconPath(relic);
        return `<span class="relic-visual ${wrapperClass}"><span class="relic-fallback ${fallbackClass}">${fallback}</span><img class="relic-image ${imgClass}" src="${src}" alt="${relic?.name || '遗物'}" loading="lazy" onload="markRelicImageLoaded(this)" onerror="fallbackRelicImage(this)"></span>`;
    }

    function renderRelicCard(relic, {
        cardClass = 'relic-item-box',
        formatKeywords = text => text,
        getDisplayRelicDesc = item => item?.desc || '',
        getRelicBottomTags = () => '',
        iconClass = '',
        iconSize = 50,
        renderRelicVisual = item => item?.icon || ''
    } = {}) {
        return `<div class="${cardClass}"><div class="${iconClass}" style="font-size:${iconSize}px;">${renderRelicVisual(relic)}</div><div style="color:white; font-weight:bold; font-size:18px;">${relic.name}</div><div style="flex:1; color:#aaa; font-size:12px; margin:10px 0; line-height:1.5; text-align:left;">${formatKeywords(getDisplayRelicDesc(relic))}</div>${getRelicBottomTags(relic)}</div>`;
    }

    function renderHudStatusIcons(entries = [], {
        getStatusIconPath = () => ''
    } = {}) {
        return entries.map(entry => {
            const iconPath = getStatusIconPath(entry.id);
            return `<div class="status-badge ${entry.tone || ''}">` +
                (iconPath ? `<img class="status-icon-img" src="${iconPath}" alt="" aria-hidden="true">` : `<span class="status-icon-glyph" aria-hidden="true">${entry.icon}</span>`) +
                (entry.value !== null && entry.value !== undefined ? `<span class="status-stack">x${entry.value}</span>` : '') +
                `<div class="status-tooltip"><span style="color:var(--gold); font-weight:bold;">${entry.label}</span><br>${entry.tooltip}</div>` +
            `</div>`;
        }).join('');
    }

    function renderHudRelicIcons(relics = [], {
        getDisplayRelicDesc = relic => relic?.desc || '',
        getTooltipTextWithKeywords = text => text,
        renderRelicVisual = relic => relic?.icon || ''
    } = {}) {
        return relics.map(relic => (
            `<div class="relic-icon">` +
                `${renderRelicVisual(relic)}` +
                `<div class="status-tooltip"><span style="color:var(--gold); font-weight:bold;">${relic.name}</span><br>${getTooltipTextWithKeywords(getDisplayRelicDesc(relic))}</div>` +
            `</div>`
        )).join('');
    }

    function normalizeCardEffectText(text = '') {
        return String(text)
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, '');
    }

    function getCardEffectSignature(card, {
        normalizeTags = tags => tags
    } = {}) {
        if (!card) return '';
        const tags = normalizeTags(card.tags || [])
            .filter(Boolean)
            .sort()
            .join('+');
        const specialText = card.isSpecial ? normalizeCardEffectText(card.desc) : '';
        return [
            card.type || '',
            Number(card.cost) || 0,
            Number(card.val) || 0,
            tags,
            JSON.stringify(card.directEffects || {}),
            JSON.stringify({
                bloodDebtGain: card.bloodDebtGain || 0,
                bloodDebtDamageRatio: card.bloodDebtDamageRatio || 0,
                bloodDebtRepay: card.bloodDebtRepay || 0,
                bloodDebtRepayFromBleed: card.bloodDebtRepayFromBleed || 0,
                bloodDebtBleed: card.bloodDebtBleed || 0,
                bloodDebtWeak: card.bloodDebtWeak || 0,
                bloodDebtStun: card.bloodDebtStun || 0,
                bloodDebtClearDamage: card.bloodDebtClearDamage || 0,
                bloodDebtClearHeal: card.bloodDebtClearHeal || 0
            }),
            specialText
        ].join('|');
    }

    function getCardNameFamilyKey(card, options = {}) {
        if (!card || card.isSpecial || card.isJunk || card.isKnife) return '';
        return [
            getCardFrameTheme(card, options),
            card.type || '',
            Number(card.cost) || 0,
            Number(card.val) || 0
        ].join('|');
    }

    function getCardVisualSignature(card, options = {}) {
        return `${getCardFrameTheme(card, options)}|${getCardEffectSignature(card, options)}`;
    }

    function getCardNameTags(card, {
        normalizeTags = tags => tags
    } = {}) {
        return normalizeTags(card?.tags || [])
            .filter(Boolean)
            .sort((a, b) => {
                const aIdx = CARD_NAME_TAG_PRIORITY.indexOf(a);
                const bIdx = CARD_NAME_TAG_PRIORITY.indexOf(b);
                return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx) || a.localeCompare(b);
            });
    }

    function getCardNameVariantWord(variantTags = []) {
        const tags = Array.isArray(variantTags) ? variantTags : [];
        if (!tags.length) return '';
        if (tags.includes('血祭') && tags.includes('荆棘')) return '血棘';
        if (tags.includes('出血') && tags.includes('放血')) return '裂血';
        if (tags.includes('剧毒') && tags.includes('出血')) return '毒血';
        if (tags.includes('燃烧') && tags.includes('荆棘')) return '烬棘';
        if (tags.includes('回响') && tags.includes('复刻')) return '回写';
        if (tags.includes('庇护') && tags.includes('抽牌')) return '护引';
        return CARD_NAME_VARIANT_WORD_BY_TAG[tags[0]] || String(tags[0]).slice(0, 2);
    }

    function applyCardNameVariant(baseName, variantWord) {
        if (!baseName || !variantWord) return baseName || '';
        const chars = [...baseName];
        if (chars.length <= 2) return variantWord;
        return `${variantWord}${chars.slice(-2).join('')}`;
    }

    function getCardVariantName(card, family, options = {}) {
        if (!family) return card?.name || '';
        const tags = getCardNameTags(card, options);
        const familyTags = family.tags instanceof Set ? family.tags : new Set(family.tags || []);
        const diffTags = tags.filter(tag => !familyTags.has(tag));
        const variantTags = diffTags.length ? diffTags : tags;
        return applyCardNameVariant(family.name, getCardNameVariantWord(variantTags));
    }

    function getCardDisplayName(card, {
        cardEffectNameBySignature = new Map(),
        cardNameFamilyByKey = new Map(),
        ...signatureOptions
    } = {}) {
        if (!card) return '';
        if (card.displayName) return card.displayName;
        if (card.isStarter || card.isSpecial || card.isJunk || card.isKnife) return card.name || '';
        const signature = getCardVisualSignature(card, signatureOptions);
        const exactName = cardEffectNameBySignature.get(signature);
        if (exactName && (exactName.count > 1 || exactName.name !== card.name)) return exactName.name;
        const family = cardNameFamilyByKey.get(getCardNameFamilyKey(card, signatureOptions));
        if (!family || family.signature === signature) return card.name || '';
        return getCardVariantName(card, family, signatureOptions);
    }

    function getCardArtPath(card, {
        cardArtRegistry = {},
        cardEffectArtBySignature = new Map(),
        cardTypeArtFallback = {},
        ...signatureOptions
    } = {}) {
        const registeredArt = getRegisteredCardArtPath(card, { cardArtRegistry });
        if (registeredArt) return registeredArt;
        return cardEffectArtBySignature.get(getCardVisualSignature(card, signatureOptions))
            || getDirectCardArtPath(card, { cardArtRegistry, cardTypeArtFallback });
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
        applyCardNameVariant,
        cleanEffectDisplayText,
        formatRatioText,
        formatTurnCounterValue,
        getCardArtPath,
        getCardBottomTagList,
        getCardBuffVfxKind,
        getDirectCardArtPath,
        getCardDisplayName,
        getCardEffectSignature,
        getCardFramePath,
        getCardFrameTheme,
        getCardNameFamilyKey,
        getCardNameTags,
        getCardNameVariantWord,
        getRegisteredCardArtPath,
        getCardTextDensityClass,
        getCardVariantName,
        getCardVisualSignature,
        getFlowDamageLine,
        getStatusLayerCount,
        hasBuildGuideCue,
        renderTagNames,
        getEnemyAssetSlug,
        getEnemyAttackAnimationTiming,
        getEnemyAttackFrames,
        getEnemyAttackVfxAsset,
        getEnemyAttackVfxLayout,
        getEnemyAttackVfxType,
        getEnemyAvatarPath,
        getEnemyVisualPath,
        getDisplayRelicDesc,
        getEffectOnlySpecialDesc,
        getFrameSequenceDuration,
        getFrameSequenceLeadDuration,
        getPlayerAttackAnimationTiming,
        getPlayerAttackVfxLayout,
        getPlayerBuffVfxLayout,
        getRelicBottomTags,
        getRelicIconPath,
        getStatusIconPath,
        getShieldHitVfxLayout,
        normalizeCardEffectText,
        renderHudRelicIcons,
        renderHudStatusIcons,
        renderRelicCard,
        renderRelicVisual
    };
})(window);
