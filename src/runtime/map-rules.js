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
        battlePreviewVariants = [],
        previewPanelData = {}
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
        getMapNodeRenderState,
        getMapNodeRouteStatus,
        getMapNodeType,
        getMapPreviewVariant,
        getNodeFloorLabel,
        getSelectedMapPreviewNode,
        isMapNodeReachable
    };
})(window);
