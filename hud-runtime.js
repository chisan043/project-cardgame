(function (global) {
    'use strict';

    const DEFAULT_REFERENCE_WIDTH = 1280;
    const DEFAULT_REFERENCE_HEIGHT = 720;
    const HUD_CONFIG_SCHEMA = 'huanjing-hud-config';
    const HUD_CONFIG_VERSION = 2;
    const HUD_SYNC_CHANNEL = 'huanjing-hud-layout-sync';
    const HUD_SYNC_STORAGE_KEY = 'huanjing-hud-layout-live-config-v1';
    const HUD_DEFAULT_PRESET_STORAGE_KEY = 'huanjing-hud-layout-default-preset-v1';

    function numberOr(value, fallback) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : fallback;
    }

    function getItemKey(item) {
        return `${item?.name || ''} ${item?.assetId || ''} ${item?.src || ''}`;
    }

    function isEnergyGemItem(item) {
        return /能量晶石/.test(item?.name || '');
    }

    function isHpLagItem(item) {
        const binding = getItemBinding(item);
        return binding === 'player-hp-lag' || (/生命残影/.test(item?.name || '') && binding !== 'enemy-hp-lag');
    }

    function isHpFillItem(item) {
        const binding = getItemBinding(item);
        return binding === 'player-hp-fill' || (/生命填充/.test(item?.name || '') && binding !== 'enemy-hp-fill');
    }

    function getItemBinding(item) {
        const key = getItemKey(item);
        const name = item?.name || '';
        const x = numberOr(item?.x, 0);
        const isEnemy = /敌|enemy|副本/i.test(key);
        if (item?.binding) {
            if (isEnemy) {
                if (item.binding === 'player-hp-lag') return 'enemy-hp-lag';
                if (item.binding === 'player-hp-fill') return 'enemy-hp-fill';
                if (item.binding === 'player-hp') return 'enemy-hp';
                if (item.binding === 'player-status') return 'enemy-status';
            }
            return item.binding;
        }
        if (item?.role && item.role !== 'static') {
            if (item.role === 'hp-fill') return 'player-hp-fill';
            if (item.role === 'hp-lag') return 'player-hp-lag';
            return item.role;
        }
        if (isEnergyGemItem(item)) return 'energy';

        if (/结束回合|end[_-]?turn/i.test(key)) return 'end-turn';
        if (/回合计数|回合显示|turn[_-]?counter|turn[_-]?dial|inner[_-]?dial/i.test(key)) return 'turn-counter';
        if (/手牌承托|手牌托|手牌槽|hand[_-]?tray|hand[_-]?fan|card[_-]?tray/i.test(key)) return 'hand-tray';
        if (/抽牌堆|draw[_-]?pile|draw[_-]?stack/i.test(key)) return 'draw-pile';
        if (/弃牌堆|discard[_-]?pile|discard[_-]?stack/i.test(key)) return 'discard-pile';
        if (/放逐堆|exile[_-]?pile|exhaust[_-]?pile|exile[_-]?stack/i.test(key)) return 'exhaust-pile';
        if (/pile[_-]?count|计数牌签|牌签/i.test(name) || /pile[_-]?count/i.test(item?.assetId || '')) {
            if (/抽|draw/i.test(name)) return 'draw-count';
            if (/弃|discard/i.test(name)) return 'discard-count';
            if (/放逐|exile|exhaust/i.test(name)) return 'exhaust-count';
            if (x >= 1100) return 'discard-count';
            if (x >= 900) return 'exhaust-count';
            return 'draw-count';
        }

        if (/玩家头像框|player[_-]?portrait/i.test(key)) return 'player-portrait';
        if (/敌方头像框|敌人头像框|enemy[_-]?portrait|敌人面板底部/i.test(key)) return 'enemy-portrait';
        if (/玩家名牌|player[_-]?name/i.test(key)) return 'player-name';
        if (/敌方名牌|敌人名牌|enemy[_-]?name/i.test(key)) return 'enemy-name';
        if (/玩家状态栏|player[_-]?status/i.test(key)) return 'player-status';
        if (/敌方状态栏|敌人状态栏|enemy[_-]?status/i.test(key)) return 'enemy-status';
        if (/敌方意图|敌人意图|intent/i.test(key)) return 'enemy-intent';

        if (/生命残影|damage[_-]?trail/i.test(key)) return isEnemy ? 'enemy-hp-lag' : 'player-hp-lag';
        if (/生命填充/i.test(key) || (/hp[_-]?bar.*fill|long[_-]?fill/i.test(key) && !/gray|base|trail|heart|残影|灰底|心标/i.test(key))) {
            return isEnemy ? 'enemy-hp-fill' : 'player-hp-fill';
        }
        if (/生命条框|生命空框|hp[_-]?bar.*shell|hp[_-]?bar.*frame/i.test(key)) return isEnemy ? 'enemy-hp' : 'player-hp';
        if (/护甲条框|护甲|armor[_-]?bar.*shell|armor[_-]?bar.*frame/i.test(key)) return isEnemy ? 'enemy-armor' : 'player-armor';

        return '';
    }

    function getItemFitMode(item) {
        if (item?.fit) return item.fit;
        const key = getItemKey(item);
        if (/long_fill|生命灰底|生命残影|生命填充|状态栏|status[_-]?bar|status/i.test(key)) return 'fill';
        if (/portrait-inner|live-portrait|头像内层|角色立绘/i.test(key)) return 'cover';
        if (/turn[_-]?counter|turn[_-]?dial|inner[_-]?dial|回合计数|回合显示/i.test(key)) return 'contain';
        return 'contain';
    }

    function getItemRole(item) {
        const binding = getItemBinding(item);
        if (binding === 'energy') return 'energy';
        if (binding === 'player-hp-lag') return 'hp-lag';
        if (binding === 'player-hp-fill') return 'hp-fill';
        if (binding === 'enemy-hp-lag') return 'enemy-hp-lag';
        if (binding === 'enemy-hp-fill') return 'enemy-hp-fill';
        if (binding === 'player-armor-fill') return 'player-armor-fill';
        if (binding === 'enemy-armor-fill') return 'enemy-armor-fill';
        return 'static';
    }

    function normalizePair(value, fallback) {
        if (Array.isArray(value)) {
            return [
                numberOr(value[0], fallback[0]),
                numberOr(value[1], fallback[1])
            ];
        }
        return [fallback[0], fallback[1]];
    }

    function getReferenceResolution(layout) {
        const reference = layout?.referenceResolution || {};
        return {
            width: Math.max(1, numberOr(reference.width ?? layout?.stageWidth, DEFAULT_REFERENCE_WIDTH)),
            height: Math.max(1, numberOr(reference.height ?? layout?.stageHeight, DEFAULT_REFERENCE_HEIGHT))
        };
    }

    function syncItemLayoutFields(item) {
        if (!item) return item;
        const hasAbsoluteX = Number.isFinite(Number(item.x));
        const hasAbsoluteY = Number.isFinite(Number(item.y));
        const width = numberOr(item.width ?? item.size?.[0], 100);
        const height = numberOr(item.height ?? item.size?.[1], 100);
        const x = numberOr(item.x ?? item.position?.[0] ?? item.offset?.[0], 0);
        const y = numberOr(item.y ?? item.position?.[1] ?? item.offset?.[1], 0);
        const anchor = item.anchor || 'top_left';
        const useAnchorLayout = item.layoutMode === 'anchor'
            || (anchor !== 'top_left' && (!hasAbsoluteX || !hasAbsoluteY));
        item.x = x;
        item.y = y;
        item.width = width;
        item.height = height;
        item.anchor = anchor;
        item.layoutMode = useAnchorLayout ? 'anchor' : 'absolute';
        item.pivot = normalizePair(item.pivot, [0, 0]);
        item.offset = useAnchorLayout
            ? normalizePair(item.offset ?? item.position, [x, y])
            : [x, y];
        item.position = [x, y];
        item.size = normalizePair(item.size, [width, height]);
        item.scaleMode = item.scaleMode || 'reference_resolution';
        item.fit = item.fit || getItemFitMode(item);
        item.binding = item.binding || getItemBinding(item) || undefined;
        item.role = item.role || getItemRole(item);
        return item;
    }

    function normalizeItem(item = {}) {
        const normalized = { ...item };
        syncItemLayoutFields(normalized);
        normalized.z = numberOr(normalized.z, 1);
        normalized.rotation = numberOr(normalized.rotation, 0);
        normalized.flipX = Boolean(normalized.flipX);
        normalized.flipY = Boolean(normalized.flipY);
        normalized.opacity = numberOr(normalized.opacity, 1);
        normalized.hidden = Boolean(normalized.hidden);
        normalized.locked = Boolean(normalized.locked);
        return normalized;
    }

    function normalizeLayout(layout = {}) {
        const referenceResolution = getReferenceResolution(layout);
        return {
            ...layout,
            schema: layout.schema || HUD_CONFIG_SCHEMA,
            version: numberOr(layout.version, HUD_CONFIG_VERSION),
            referenceResolution,
            stageWidth: referenceResolution.width,
            stageHeight: referenceResolution.height,
            items: (layout.items || []).map(normalizeItem)
        };
    }

    function getSortedItems(layout, options = {}) {
        const includeHidden = Boolean(options.includeHidden);
        return (layout?.items || [])
            .filter(item => item && item.src && (includeHidden || !item.hidden))
            .slice()
            .sort((a, b) => numberOr(a.z, 0) - numberOr(b.z, 0));
    }

    function anchorPoint(anchor, viewportWidth, viewportHeight) {
        const points = {
            top_left: [0, 0],
            top_center: [0.5, 0],
            top_right: [1, 0],
            center_left: [0, 0.5],
            center: [0.5, 0.5],
            center_right: [1, 0.5],
            bottom_left: [0, 1],
            bottom_center: [0.5, 1],
            bottom_right: [1, 1]
        };
        const [x, y] = points[anchor] || points.top_left;
        return [viewportWidth * x, viewportHeight * y];
    }

    function calculateRect(item, layout, viewport = {}) {
        const reference = getReferenceResolution(layout);
        const referenceWidth = reference.width;
        const referenceHeight = reference.height;
        const viewportWidth = numberOr(viewport.width, referenceWidth);
        const viewportHeight = numberOr(viewport.height, referenceHeight);
        const scale = item.scaleMode === 'reference_resolution'
            ? Math.min(viewportWidth / referenceWidth, viewportHeight / referenceHeight)
            : 1;
        const width = numberOr(item.width ?? item.size?.[0], 0) * scale;
        const height = numberOr(item.height ?? item.size?.[1], 0) * scale;

        if (item.layoutMode === 'anchor' || (item.anchor && item.anchor !== 'top_left' && !Number.isFinite(Number(item.x)) && !Number.isFinite(Number(item.y)))) {
            const [anchorX, anchorY] = anchorPoint(item.anchor, viewportWidth, viewportHeight);
            const offset = item.offset || item.position || [0, 0];
            const pivot = item.pivot || [0, 0];
            return {
                x: anchorX + numberOr(offset[0], 0) * scale - numberOr(pivot[0], 0) * width,
                y: anchorY + numberOr(offset[1], 0) * scale - numberOr(pivot[1], 0) * height,
                width,
                height
            };
        }

        return {
            x: numberOr(item.x, 0) * scale,
            y: numberOr(item.y, 0) * scale,
            width,
            height
        };
    }

    function resolveItemSource(item, resolver) {
        return typeof resolver === 'function' ? resolver(item) : item.src;
    }

    function renderLayout(options) {
        const {
            root,
            layout,
            viewport,
            itemClassName = 'hud-runtime-item',
            selectedIds = [],
            selectedClassName = 'selected',
            includeHidden = false,
            filterItem,
            resolveSource,
            decorateItem
        } = options || {};
        if (!root) return { items: [], elements: [], metrics: {} };

        const selectedSet = new Set(selectedIds);
        root.innerHTML = '';
        const normalizedLayout = normalizeLayout(layout);
        const items = getSortedItems(normalizedLayout, { includeHidden }).filter(item => (
            typeof filterItem === 'function' ? filterItem(item) : true
        ));
        const elements = [];
        const metrics = { hpFillWidth: 0, hpLagWidth: 0, energy: null };

        for (const item of items) {
            const role = getItemRole(item);
            const fitMode = item.fit || getItemFitMode(item);
            const rect = calculateRect(item, normalizedLayout, viewport);
            const element = document.createElement('div');
            element.className = itemClassName;
            if (selectedSet.has(item.id)) element.classList.add(selectedClassName);
            if (fitMode === 'fill') element.classList.add('fit-fill');
            if (fitMode === 'cover') element.classList.add('fit-cover');
            if (role === 'hp-lag' || role === 'enemy-hp-lag') element.classList.add('is-hp-lag');
            if (role === 'hp-fill' || role === 'enemy-hp-fill') element.classList.add('is-hp-fill');
            element.dataset.id = item.id || '';
            element.dataset.hudRole = role;
            element.dataset.hudBinding = getItemBinding(item);
            element.dataset.fitMode = fitMode;
            element.dataset.flipX = item.flipX ? 'true' : 'false';
            element.dataset.flipY = item.flipY ? 'true' : 'false';
            element.dataset.baseWidth = String(Math.round(rect.width));
            element.dataset.baseHeight = String(Math.round(rect.height));
            element.setAttribute('aria-hidden', 'true');
            element.style.left = `${Math.round(rect.x)}px`;
            element.style.top = `${Math.round(rect.y)}px`;
            element.style.width = `${Math.round(rect.width)}px`;
            element.style.height = `${Math.round(rect.height)}px`;
            element.style.transform = `rotate(${numberOr(item.rotation, 0)}deg) scale(${item.flipX ? -1 : 1}, ${item.flipY ? -1 : 1})`;
            element.style.transformOrigin = 'center center';
            element.style.opacity = String(item.opacity ?? 1);
            element.style.zIndex = String(Math.round(numberOr(item.z, 1) * 10));
            element.style.display = item.hidden ? 'none' : 'block';

            const img = document.createElement('img');
            img.src = resolveItemSource(item, resolveSource);
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            element.appendChild(img);

            if (role === 'hp-fill') metrics.hpFillWidth = rect.width;
            if (role === 'hp-lag') metrics.hpLagWidth = rect.width;

            if (typeof decorateItem === 'function') {
                decorateItem({ element, img, item, role, fitMode, rect });
            }
            root.appendChild(element);
            elements.push(element);
        }

        const energyItems = getSortedItems(normalizedLayout, { includeHidden }).filter(isEnergyGemItem);
        if (energyItems.length) {
            const first = energyItems[0];
            const last = energyItems[energyItems.length - 1];
            const firstRect = calculateRect(first, normalizedLayout, viewport);
            const lastRect = calculateRect(last, normalizedLayout, viewport);
            metrics.energy = {
                firstCenterX: firstRect.x + firstRect.width / 2,
                lastCenterX: lastRect.x + lastRect.width / 2,
                y: firstRect.y,
                width: firstRect.width,
                height: firstRect.height
            };
        }

        return { items, elements, metrics };
    }

    function applyConfig(targetLayout, config) {
        const normalized = normalizeLayout(config);
        if (!targetLayout || typeof targetLayout !== 'object') return normalized;
        Object.keys(targetLayout).forEach(key => delete targetLayout[key]);
        Object.assign(targetLayout, normalized);
        return targetLayout;
    }

    function createHudItem(name, src, x, y, width, height, z, options = {}) {
        return syncItemLayoutFields({
            id: options.id || `hud-${name.replace(/\s+/g, '-').toLowerCase()}`,
            name,
            src,
            x,
            y,
            width,
            height,
            z,
            rotation: 0,
            flipX: Boolean(options.flipX),
            flipY: Boolean(options.flipY),
            opacity: options.opacity ?? 1,
            hidden: Boolean(options.hidden),
            locked: Boolean(options.locked),
            anchor: options.anchor || 'top_left',
            pivot: options.pivot || [0, 0],
            offset: options.offset || [x, y],
            position: [x, y],
            size: [width, height],
            layoutMode: options.layoutMode || 'absolute',
            scaleMode: options.scaleMode || 'reference_resolution',
            fit: options.fit || undefined,
            binding: options.binding || undefined,
            role: options.role || undefined
        });
    }

    function createDefaultBattleHudLayout(seed = {}) {
        const items = [
            createHudItem('玩家头像框', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/玩家面板/player_portrait_frame_asset_v1.webp', 14, 18, 202, 199, 10),
            createHudItem('玩家名牌', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/玩家面板/player_nameplate_shell_asset_v1.webp', 170, 20, 434, 84, 11),
            createHudItem('玩家生命条框', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/玩家面板/player_hp_bar_shell_asset_v1.webp', 202, 91, 472, 63, 12),
            createHudItem('玩家护甲条框', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/玩家面板/player_armor_bar_shell_asset_v1.webp', 198, 147, 472, 84, 13),
            createHudItem('玩家能量槽', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/玩家面板/player_energy_tray_asset_v1.webp', 166, 221, 486, 86, 14),
            createHudItem('玩家状态栏', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/状态栏/player_status_bar_shell_asset_v1.webp', 32, 275, 392, 56, 15, { fit: 'fill' }),

            createHudItem('敌方总图参考', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/battle_hud_enemy_panel_asset_v1.webp', 696, 18, 570, 206, 20, { opacity: 0.22, locked: true }),
            createHudItem('敌方头像框', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/敌方面板/enemy_portrait_frame_asset_v1.webp', 1060, 21, 198, 199, 21),
            createHudItem('敌方名牌', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/敌方面板/enemy_nameplate_shell_asset_v1.webp', 788, 27, 440, 84, 22),
            createHudItem('敌方生命条框', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/敌方面板/enemy_hp_bar_shell_asset_v1.webp', 767, 67, 420, 64, 23),
            createHudItem('敌方护甲条框', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/敌方面板/enemy_armor_bar_shell_asset_v1.webp', 767, 106, 420, 84, 24),
            createHudItem('敌方状态栏', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/状态栏/enemy_status_bar_shell_asset_v1.webp', 768, 112, 340, 48, 25, { fit: 'fill' }),
            createHudItem('敌方意图框', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/敌方意图面板/enemy_intent_panel_shell_asset_v1.webp', 765, 151, 360, 44, 26, { fit: 'fill' }),

            createHudItem('手牌承托', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/手牌承托/hand_fan_tray_shell_asset_v1.webp', 210, 528, 860, 206, 30),
            createHudItem('结束回合按钮', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/中轴控件/end_turn_button_shell_asset_v1.webp', 964, 396, 292, 110, 31),
            createHudItem('回合计数器', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/中轴控件/turn_counter_inner_dial_asset_v1.webp', 607, 13, 67, 67, 31.5, { binding: 'turn-counter' }),
            createHudItem('抽牌堆', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/牌堆/draw_pile_stack_asset_v1.webp', 36, 520, 88, 128, 32),
            createHudItem('弃牌堆', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/牌堆/discard_pile_stack_asset_v1.webp', 1156, 520, 88, 128, 33),
            createHudItem('放逐堆', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/牌堆/exile_pile_stack_asset_v1.webp', 1034, 520, 88, 128, 34),
            createHudItem('抽牌堆计数牌签', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/牌堆/pile_count_plate_asset_v1_transparent.webp', 47, 641, 66, 34, 35),
            createHudItem('弃牌堆计数牌签', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/牌堆/pile_count_plate_asset_v1_transparent.webp', 1167, 641, 66, 34, 36),
            createHudItem('放逐堆计数牌签', 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/牌堆/pile_count_plate_asset_v1_transparent.webp', 1045, 641, 66, 34, 37)
        ];
        for (let i = 0; i < 5; i += 1) {
            items.push(createHudItem(`能量晶石 ${i + 1}`, 'UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/玩家面板/player_energy_gem_on_asset_v1.webp', 348 + i * 52, 238, 28, 44, 40 + i, { role: 'energy' }));
        }
        const defaults = normalizeLayout({
            ...seed,
            schema: HUD_CONFIG_SCHEMA,
            version: HUD_CONFIG_VERSION,
            referenceResolution: { width: 1280, height: 720 },
            stageWidth: 1280,
            stageHeight: 720,
            background: seed.background || '场景/主场景/bg_battle_ancient_forest_day.webp',
            backgroundFit: seed.backgroundFit || 'cover',
            items
        });
        if (!Array.isArray(seed.items) || !seed.items.length) return defaults;
        return mergeLayoutWithDefaults(seed, defaults);
    }

    function mergeLayoutWithDefaults(layout, defaults = createDefaultBattleHudLayout()) {
        const normalized = normalizeLayout(layout);
        const existingNames = new Set((normalized.items || []).map(item => item.name));
        const mergedItems = [
            ...(normalized.items || []),
            ...(defaults.items || []).filter(item => !existingNames.has(item.name)).map(item => ({ ...item }))
        ];
        return normalizeLayout({
            ...defaults,
            ...normalized,
            referenceResolution: defaults.referenceResolution,
            stageWidth: defaults.stageWidth,
            stageHeight: defaults.stageHeight,
            background: normalized.background || defaults.background,
            backgroundFit: normalized.backgroundFit || defaults.backgroundFit,
            items: mergedItems
        });
    }

    function publishConfig(config, options = {}) {
        const payload = normalizeLayout(config);
        const message = {
            type: 'hud-config-updated',
            source: options.source || 'unknown',
            updatedAt: Date.now(),
            payload
        };
        if (options.storage !== false) {
            try {
                global.localStorage?.setItem(HUD_SYNC_STORAGE_KEY, JSON.stringify(payload));
            } catch (error) {
                console.warn('HUD 同步配置写入 localStorage 失败。', error);
            }
        }
        if (options.channel !== false && 'BroadcastChannel' in global) {
            try {
                const channel = new BroadcastChannel(HUD_SYNC_CHANNEL);
                channel.postMessage(message);
                channel.close();
            } catch (error) {
                console.warn('HUD BroadcastChannel 同步失败。', error);
            }
        }
        try {
            global.dispatchEvent(new CustomEvent('huanjing-hud-config-updated', { detail: message }));
        } catch (error) {
            console.warn('HUD 同步事件派发失败。', error);
        }
        return payload;
    }

    function installConfigReceiver(callback, options = {}) {
        if (typeof callback !== 'function') return () => {};
        const ignoreSource = options.ignoreSource;
        let channel = null;
        const receive = message => {
            const data = message?.data || message?.detail || message;
            if (!data || data.type !== 'hud-config-updated') return;
            if (ignoreSource && data.source === ignoreSource) return;
            if (!data.payload || !Array.isArray(data.payload.items)) return;
            callback(normalizeLayout(data.payload), data);
        };
        if ('BroadcastChannel' in global) {
            channel = new BroadcastChannel(HUD_SYNC_CHANNEL);
            channel.addEventListener('message', receive);
        }
        const onStorage = event => {
            if (event.key !== HUD_SYNC_STORAGE_KEY || !event.newValue) return;
            try {
                callback(normalizeLayout(JSON.parse(event.newValue)), {
                    type: 'hud-config-updated',
                    source: 'storage',
                    updatedAt: Date.now()
                });
            } catch (error) {
                console.warn('HUD 同步配置解析失败。', error);
            }
        };
        global.addEventListener('storage', onStorage);
        return () => {
            if (channel) {
                channel.removeEventListener('message', receive);
                channel.close();
            }
            global.removeEventListener('storage', onStorage);
        };
    }

    global.HuanjingHUDRuntime = {
        HUD_SYNC_CHANNEL,
        HUD_SYNC_STORAGE_KEY,
        HUD_DEFAULT_PRESET_STORAGE_KEY,
        HUD_CONFIG_SCHEMA,
        HUD_CONFIG_VERSION,
        applyConfig,
        calculateRect,
        createDefaultBattleHudLayout,
        getItemFitMode,
        getItemBinding,
        getItemKey,
        getItemRole,
        getReferenceResolution,
        getSortedItems,
        isEnergyGemItem,
        isHpFillItem,
        isHpLagItem,
        normalizeItem,
        normalizeLayout,
        mergeLayoutWithDefaults,
        syncItemLayoutFields,
        renderLayout,
        publishConfig,
        installConfigReceiver
    };
})(window);
