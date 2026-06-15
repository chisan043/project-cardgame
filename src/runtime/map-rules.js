// Side-effect-free map generation helpers. DOM rendering and node entry remain in the main runtime.
(function exposeMapRules(global) {
    'use strict';

    const DEFAULT_HEIGHT = 20;
    const LANE_SETS = {
        1: [[2]],
        2: [[1, 3], [0, 4]],
        3: [[1, 2, 3], [0, 2, 4], [0, 1, 3]],
        4: [[0, 1, 3, 4], [0, 2, 3, 4], [0, 1, 2, 4]],
        5: [[0, 1, 2, 3, 4]]
    };
    const FLOOR_COUNTS = [3, 3, 4, 3, 4, 3, 5, 4, 3, 4, 3, 5, 4, 3, 4, 4, 3, 2, 1, 1];
    const DEFAULT_LANE_LEFT_PERCENT_BY_LANE = [18, 32, 46, 60, 74];
    const DEFAULT_PREVIEW_PANEL_DATA = {
        battle: {
            title: '雾岭小径',
            desc: '敌影在山道间游荡。沿着金色路线前进，踏入下一场战斗。',
            image: 'assets/ui/map/stained_windows/map_stained_window_mountain_plain_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/mountain_plain_day_v1.webp'
        },
        elite: {
            title: '失落圣堂',
            desc: '更强的守卫盘踞于此。胜利后，稀有机缘也会随之显现。',
            image: 'assets/ui/map/stained_windows/map_stained_window_temple_hall_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/temple_hall_grand_v1.webp'
        },
        rest: {
            title: '静息营火',
            desc: '短暂的火光能修整伤势，也能让讨魔的锋刃重新明亮。',
            image: 'assets/ui/map/stained_windows/map_stained_window_ancient_forest_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/ancient_forest_day_v1.webp'
        },
        event: {
            title: '古碑回廊',
            desc: '残留的低语藏着转机，也可能把命运推向另一条岔路。',
            image: 'assets/ui/map/stained_windows/map_stained_window_stone_ruins_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/stone_ruins_day_v1.webp'
        },
        boss: {
            title: '终幕尖塔',
            desc: '首领守在高处。穿过最后一段路，试炼将在此收束。',
            image: 'assets/ui/map/stained_windows/map_stained_window_town_castle_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/temple_hall_grand_v1.webp'
        },
        shop: {
            title: '灯火商栈',
            desc: '旅商在旧城门下等待。金币可以换来卡牌、奇珍与一次喘息。',
            image: 'assets/ui/map/stained_windows/map_stained_window_town_castle_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/event/town_distant_day_v1.webp'
        }
    };
    const DEFAULT_BATTLE_PREVIEW_VARIANTS = [
        {
            title: '雾岭小径',
            desc: '山雾贴着旧路流动，前方的敌影正从林线后靠近。',
            image: 'assets/ui/map/stained_windows/map_stained_window_mountain_plain_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/mountain_plain_day_v1.webp'
        },
        {
            title: '碎石古道',
            desc: '残破石阶通向荒废哨站，那里常有伏击者守候。',
            image: 'assets/ui/map/stained_windows/map_stained_window_stone_ruins_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/stone_ruins_day_v1.webp'
        },
        {
            title: '暮色荒原',
            desc: '风卷起暗红尘沙，野性的敌人会在开阔处逼近。',
            image: 'assets/ui/map/stained_windows/map_stained_window_wasteland_dusk_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/wasteland_dusk_v1.webp'
        },
        {
            title: '寒洞裂隙',
            desc: '岩壁间传来低响，潮冷洞窟里潜伏着不安的轮廓。',
            image: 'assets/ui/map/stained_windows/map_stained_window_cold_cave_imagegen_transparent_v1.webp',
            battleBg: 'assets/scenes/battle/cave_cold_v1.webp'
        }
    ];

    function pick(items, rng) {
        return items[Math.floor(rng() * items.length)];
    }

    function shuffle(items, rng) {
        return [...items].sort(() => 0.5 - rng());
    }

    function connectMapNodes(parent, child) {
        if (!parent || !child) return;
        if (!parent.children.includes(child.id)) parent.children.push(child.id);
        if (!child.parents.includes(parent.id)) child.parents.push(parent.id);
    }

    function getMapNodeType(floorIndex, height, rng) {
        if (floorIndex === height - 1) return 'boss';
        if (floorIndex === height - 2 || floorIndex === 8 || floorIndex === 14) return 'rest';
        if (floorIndex === 0) return 'battle';

        const roll = rng();
        const canElite = floorIndex >= 5 && floorIndex <= 16 && ![8, 14, 18].includes(floorIndex);
        if (floorIndex === 3 || floorIndex === 10 || floorIndex === 15) {
            return roll < 0.5 ? 'event' : (roll < 0.78 ? 'shop' : 'battle');
        }
        if (canElite && roll < 0.22) return 'elite';
        if (roll < 0.72) return 'battle';
        if (roll < 0.88) return 'event';
        return 'shop';
    }

    function createMapFloors({ height = DEFAULT_HEIGHT, rng = Math.random } = {}) {
        const mapData = [];
        for (let floorIndex = 0; floorIndex < height; floorIndex++) {
            let count = FLOOR_COUNTS[floorIndex] || 3;
            if (floorIndex === 0) count = 3;
            if (floorIndex >= height - 2) count = 1;
            const lanes = pick(LANE_SETS[count], rng);
            const floor = { nodes: [] };
            lanes.forEach((lane, nodeIndex) => {
                const drift = (floorIndex > 0 && floorIndex < height - 2) ? (rng() - 0.5) * 0.18 : 0;
                floor.nodes.push({
                    id: `f${floorIndex}n${nodeIndex}`,
                    type: 'empty',
                    x: lane + drift,
                    lane,
                    floor: floorIndex,
                    children: [],
                    parents: []
                });
            });
            mapData.push(floor);
        }
        return mapData;
    }

    function connectMapFloors(mapData, { rng = Math.random } = {}) {
        for (let floorIndex = 0; floorIndex < mapData.length - 1; floorIndex++) {
            const currentNodes = mapData[floorIndex].nodes;
            const nextNodes = mapData[floorIndex + 1].nodes;
            currentNodes.forEach(node => {
                const sourceLane = node.lane ?? Math.round(node.x);
                let candidates = nextNodes.filter(nextNode => Math.abs((nextNode.lane ?? Math.round(nextNode.x)) - sourceLane) <= 1);
                if (!candidates.length) {
                    candidates = [...nextNodes]
                        .sort((left, right) => Math.abs(left.x - node.x) - Math.abs(right.x - node.x))
                        .slice(0, 1);
                }
                const maxPaths = (floorIndex >= mapData.length - 3) ? 1 : (rng() < 0.44 ? 2 : 1);
                shuffle(candidates, rng)
                    .slice(0, Math.min(maxPaths, candidates.length))
                    .forEach(nextNode => connectMapNodes(node, nextNode));
            });

            nextNodes.forEach(nextNode => {
                if (nextNode.parents.length > 0) return;
                const nearest = [...currentNodes].sort((left, right) => Math.abs(left.x - nextNode.x) - Math.abs(right.x - nextNode.x))[0];
                connectMapNodes(nearest, nextNode);
            });
        }
    }

    function assignMapNodeTypes(mapData, { rng = Math.random } = {}) {
        const height = mapData.length;
        mapData.forEach((floor, floorIndex) => {
            floor.nodes.forEach(node => {
                node.type = getMapNodeType(floorIndex, height, rng);
            });
        });
    }

    function isMapNodeReachable(node, { currentNode = null } = {}) {
        if (!node) return false;
        if (!currentNode) return node.floor === 0;
        return (currentNode.children || []).includes(node.id);
    }

    function findMapNodeById(mapData, nodeId) {
        if (!nodeId || !Array.isArray(mapData)) return null;
        for (const floor of mapData) {
            const found = floor.nodes?.find(node => node.id === nodeId);
            if (found) return found;
        }
        return null;
    }

    function getDefaultMapPreviewNode(mapData, { currentNode = null } = {}) {
        if (!Array.isArray(mapData) || !mapData.length) return null;
        if (currentNode) {
            const nextNode = (currentNode.children || [])
                .map(nodeId => findMapNodeById(mapData, nodeId))
                .find(Boolean);
            return nextNode || currentNode;
        }
        const firstFloor = mapData[0]?.nodes || [];
        return firstFloor[Math.floor(firstFloor.length / 2)] || firstFloor[0] || null;
    }

    function getSelectedMapPreviewNode(mapData, {
        currentNode = null,
        mapPreviewNodeId = null
    } = {}) {
        const selected = findMapNodeById(mapData, mapPreviewNodeId);
        return selected && isMapNodeReachable(selected, { currentNode }) ? selected : null;
    }

    function getMapNodeRouteStatus(node, {
        currentNode = null,
        pathHistory = []
    } = {}) {
        if (!node) return '';
        if (currentNode && currentNode.id === node.id) return '当前驻足点';
        if (pathHistory.includes(node.id)) return '已踏过';
        if (isMapNodeReachable(node, { currentNode })) return '可前往';
        return '尚未连通';
    }

    function getNodeFloorLabel(node) {
        if (!node) return '';
        if (node.type === 'boss') return '首领';
        return `第 ${Number(node.floor || 0) + 1} 层`;
    }

    function getMapPreviewVariant(node, {
        battlePreviewVariants = DEFAULT_BATTLE_PREVIEW_VARIANTS,
        previewPanelData = DEFAULT_PREVIEW_PANEL_DATA
    } = {}) {
        const defaultPanel = previewPanelData.battle || null;
        if (!node) return defaultPanel;
        if (node.type === 'battle' && battlePreviewVariants.length) {
            const lane = Math.round(Number(node.x || 0));
            const idx = Math.abs((Number(node.floor || 0) * 3 + lane)) % battlePreviewVariants.length;
            return battlePreviewVariants[idx];
        }
        return previewPanelData[node.type] || defaultPanel;
    }

    function getMapDetailPanelState(node, {
        currentNode = null,
        isNodeClickLocked = false,
        nodeMeta = {},
        pathHistory = []
    } = {}) {
        const panelData = getMapPreviewVariant(node);
        const meta = nodeMeta[node?.type] || nodeMeta.battle || {};
        const panelTitle = panelData?.title || meta.label || '';
        const panelDesc = panelData?.desc || meta.label || '';
        return {
            ariaLabel: panelTitle,
            desc: `${getMapNodeRouteStatus(node, { currentNode, pathHistory })}。${panelDesc}`,
            enterDisabled: !isMapNodeReachable(node, { currentNode }) || !!isNodeClickLocked,
            image: panelData?.image || '',
            previewNodeId: node?.id || null,
            title: `${getNodeFloorLabel(node)} · ${panelTitle}`
        };
    }

    function getMapNodeRenderState(node, {
        currentNode = null,
        pathHistory = []
    } = {}) {
        const isCurrent = !!(node && currentNode && currentNode.id === node.id);
        const isPassed = !!(node && pathHistory.includes(node.id) && !isCurrent);
        const isReachable = isMapNodeReachable(node, { currentNode });
        return {
            isCurrent,
            isPassed,
            isReachable,
            className: `${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''} ${isReachable ? 'reachable' : ''}`.trim()
        };
    }

    function getMapNodeSlotLayout(node, {
        laneLeftPercentByLane = DEFAULT_LANE_LEFT_PERCENT_BY_LANE,
        fallbackLeftPercent = 46,
        driftScale = 70
    } = {}) {
        const x = Number(node?.x || 0);
        const lane = Math.round(x);
        return {
            leftPercent: laneLeftPercentByLane[lane] || fallbackLeftPercent,
            translateX: (x - lane) * driftScale
        };
    }

    function getMapPathLineType(parentNodeId, childNodeId, {
        currentNode = null,
        pathHistory = []
    } = {}) {
        if (pathHistory.includes(parentNodeId) && pathHistory.includes(childNodeId)) return 'red';
        if (currentNode && currentNode.id === parentNodeId) return 'yellow';
        return 'gray';
    }

    function generateMapData(options = {}) {
        const mapData = createMapFloors(options);
        connectMapFloors(mapData, options);
        assignMapNodeTypes(mapData, options);
        return mapData;
    }

    global.QuestersMapRules = {
        assignMapNodeTypes,
        connectMapFloors,
        connectMapNodes,
        createMapFloors,
        generateMapData,
        getDefaultMapPreviewNode,
        getMapDetailPanelState,
        getMapNodeRenderState,
        getMapNodeRouteStatus,
        getMapNodeSlotLayout,
        getMapPathLineType,
        getMapNodeType,
        getMapPreviewVariant,
        getNodeFloorLabel,
        getSelectedMapPreviewNode,
        isMapNodeReachable
    };
})(window);
