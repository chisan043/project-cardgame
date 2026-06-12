#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    CHECKPOINTS,
    FOUNDATION,
    getBuildPool,
    loadGameData,
    simulateCheckpoint
} from './simulate_build_balance.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_CHECKPOINTS = CHECKPOINTS.filter(checkpoint => ['late', 'elite', 'boss'].includes(checkpoint.id));
const MODES = ['baseline', 'mature'];
const UNMODELED_TAGS = new Set(['狂热', '附魔']);
const ROLE_LABELS = {
    hero_warrior: '勇者战士',
    hero_mage: '萝莉魔导士',
    hero_archer: '精灵弓箭手',
    neutral: '中立'
};
const TAG_GROUPS = {
    '伤害放大': new Set(['重击', '穿甲', '圣剑', '爆发', '连击', '多段', '连射', '放血']),
    '资源循环': new Set(['抽牌', '充能', '重置', '保留', '回响', '复刻', '招魂', '轮回', '拾遗']),
    '防御恢复': new Set(['庇护', '反击', '错身', '吸血', '荆棘', '治愈']),
    '状态控制': new Set(['剧毒', '出血', '燃烧', '眩晕', '诅咒', '易伤', '虚弱']),
    '职业引擎': new Set(['咏唱', '蓄力', '自然']),
    '代价条件': new Set(['血祭', '狂热', '附魔', '放逐', '销毁'])
};

function parseArgs(argv) {
    const result = {
        runs: 1000,
        seed: 20260612,
        json: 'tools/tag_efficiency_report.json',
        markdown: '卡牌词条能效测试报告.md'
    };
    for (let index = 0; index < argv.length; index++) {
        if (argv[index] === '--runs') result.runs = Number(argv[++index]);
        else if (argv[index] === '--seed') result.seed = Number(argv[++index]);
        else if (argv[index] === '--json') result.json = argv[++index];
        else if (argv[index] === '--markdown') result.markdown = argv[++index];
    }
    if (!Number.isFinite(result.runs) || result.runs < 200) throw new Error('--runs must be at least 200');
    return result;
}

function cardBuildTags(data, card) {
    return card.buildTags || data.CARD_BUILD_TAGS_BY_ID[card.poolId || card.id] || [];
}

function getAllCards(data) {
    return [
        ...Object.entries(data.CHARACTER_CARD_POOLS).flatMap(([roleId, cards]) => cards.map(card => ({ ...card, roleId, source: 'cardPool' }))),
        ...data.NEUTRAL_CARD_POOL.map(card => ({ ...card, roleId: 'neutral', source: 'neutral' })),
        ...Object.entries(data.SPECIAL_EPIC_POOLS).flatMap(([roleId, cards]) => cards.map(card => ({ ...card, roleId, source: 'epicCore' })))
    ];
}

function getTagGroup(tag) {
    for (const [group, tags] of Object.entries(TAG_GROUPS)) {
        if (tags.has(tag)) return group;
    }
    return '其他';
}

function makeSeed(baseSeed, roleIndex, buildIndex, checkpointIndex, modeIndex) {
    return baseSeed + roleIndex * 1000003 + buildIndex * 100003 + checkpointIndex * 10007 + modeIndex * 1009;
}

function relevantBuilds(data, tag, mode) {
    const result = [];
    let roleIndex = 0;
    for (const [roleId, builds] of Object.entries(data.BUILD_DIRECTIONS)) {
        const foundationHasTag = FOUNDATION[roleId].some(card => card.tags?.includes(tag));
        let buildIndex = 0;
        for (const buildId of Object.keys(builds)) {
            const poolHasTag = getBuildPool(data, roleId, buildId).some(card => card.tags?.includes(tag));
            if (foundationHasTag || poolHasTag) result.push({ roleId, buildId, roleIndex, buildIndex });
            buildIndex++;
        }
        roleIndex++;
    }
    return result;
}

function summarizeCorpus(data, cards) {
    const countDistribution = {};
    for (const card of cards) {
        const count = card.tags?.length || 0;
        countDistribution[count] = (countDistribution[count] || 0) + 1;
    }
    const byRole = Object.keys(ROLE_LABELS).map(roleId => {
        const roleCards = cards.filter(card => card.roleId === roleId);
        return {
            roleId,
            role: ROLE_LABELS[roleId],
            cards: roleCards.length,
            averageTags: roleCards.reduce((sum, card) => sum + (card.tags?.length || 0), 0) / roleCards.length,
            cardsWithThreeTags: roleCards.filter(card => (card.tags?.length || 0) >= 3).length
        };
    });
    return {
        totalTags: Object.keys(data.TAGS).length,
        totalCards: cards.length,
        averageTags: cards.reduce((sum, card) => sum + (card.tags?.length || 0), 0) / cards.length,
        cardsWithAtLeastTwoTags: cards.filter(card => (card.tags?.length || 0) >= 2).length,
        cardsWithThreeTags: cards.filter(card => (card.tags?.length || 0) >= 3).length,
        countDistribution,
        byRole
    };
}

function buildReferenceResults(data, args) {
    const reference = new Map();
    let roleIndex = 0;
    for (const [roleId, builds] of Object.entries(data.BUILD_DIRECTIONS)) {
        let buildIndex = 0;
        for (const buildId of Object.keys(builds)) {
            for (let modeIndex = 0; modeIndex < MODES.length; modeIndex++) {
                const mode = MODES[modeIndex];
                for (let checkpointIndex = 0; checkpointIndex < TEST_CHECKPOINTS.length; checkpointIndex++) {
                    const checkpoint = TEST_CHECKPOINTS[checkpointIndex];
                    const seed = makeSeed(args.seed, roleIndex, buildIndex, checkpointIndex, modeIndex);
                    reference.set(`${mode}:${roleId}:${buildId}:${checkpoint.id}`, simulateCheckpoint(
                        data, roleId, buildId, checkpoint, args.runs, seed, mode
                    ));
                }
            }
            buildIndex++;
        }
        roleIndex++;
    }
    return reference;
}

function auditTag(data, cards, tag, args, reference) {
    const taggedCards = cards.filter(card => card.tags?.includes(tag));
    const samples = [];
    for (let modeIndex = 0; modeIndex < MODES.length; modeIndex++) {
        const mode = MODES[modeIndex];
        for (const build of relevantBuilds(data, tag, mode)) {
            for (let checkpointIndex = 0; checkpointIndex < TEST_CHECKPOINTS.length; checkpointIndex++) {
                const checkpoint = TEST_CHECKPOINTS[checkpointIndex];
                const seed = makeSeed(args.seed, build.roleIndex, build.buildIndex, checkpointIndex, modeIndex);
                const base = reference.get(`${mode}:${build.roleId}:${build.buildId}:${checkpoint.id}`);
                const ablated = simulateCheckpoint(
                    data,
                    build.roleId,
                    build.buildId,
                    checkpoint,
                    args.runs,
                    seed,
                    mode,
                    { disabledTags: new Set([tag]) }
                );
                samples.push({
                    mode,
                    roleId: build.roleId,
                    buildId: build.buildId,
                    checkpoint: checkpoint.id,
                    winRateImpact: base.winRate - ablated.winRate,
                    hpImpact: base.averageHpLeft - ablated.averageHpLeft,
                    turnImpact: ablated.averageTurns - base.averageTurns
                });
            }
        }
    }
    const mean = key => samples.reduce((sum, sample) => sum + sample[key], 0) / Math.max(1, samples.length);
    const meanWinRateImpact = mean('winRateImpact');
    return {
        tag,
        group: getTagGroup(tag),
        modeled: !UNMODELED_TAGS.has(tag),
        cardCount: taggedCards.length,
        prevalence: taggedCards.length / cards.length,
        samples: samples.length,
        affectedBuilds: [...new Set(samples.map(sample => `${sample.mode}:${sample.roleId}:${sample.buildId}`))].length,
        meanWinRateImpact,
        meanWinRateImpactPp: meanWinRateImpact * 100,
        meanHpImpact: mean('hpImpact'),
        meanTurnImpact: mean('turnImpact'),
        maxWinRateImpactPp: Math.max(...samples.map(sample => sample.winRateImpact * 100), 0),
        minWinRateImpactPp: Math.min(...samples.map(sample => sample.winRateImpact * 100), 0)
    };
}

function classifyTag(result) {
    if (!result.modeled) return '未建模';
    if (result.meanWinRateImpactPp >= 5 || result.meanHpImpact >= 6) return '高';
    if (result.meanWinRateImpactPp >= 2 || result.meanHpImpact >= 3) return '中';
    if (result.meanWinRateImpactPp <= -1) return '负收益';
    return '低';
}

function buildCardRisks(cards, tagResults) {
    const powerByTag = new Map(tagResults.map(result => [result.tag, classifyTag(result)]));
    return cards.map(card => {
        const tags = card.tags || [];
        const highPowerTags = tags.filter(tag => powerByTag.get(tag) === '高');
        const mediumPowerTags = tags.filter(tag => powerByTag.get(tag) === '中');
        let riskScore = tags.length + highPowerTags.length * 2 + mediumPowerTags.length;
        if ((card.cost || 0) === 0) riskScore += 1;
        if (tags.includes('销毁') || tags.includes('放逐')) riskScore -= 1;
        return {
            id: card.poolId || card.id || card.name,
            name: card.name,
            roleId: card.roleId,
            role: ROLE_LABELS[card.roleId],
            source: card.source,
            type: card.type,
            cost: card.cost,
            rarity: card.rarity,
            tags,
            highPowerTags,
            mediumPowerTags,
            riskScore
        };
    }).filter(card => card.tags.length >= 3 || card.highPowerTags.length >= 2)
        .sort((left, right) => right.riskScore - left.riskScore || right.tags.length - left.tags.length || left.cost - right.cost);
}

function pct(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function signed(value, digits = 1) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}`;
}

function markdownReport(report) {
    const sortedTags = [...report.tags].sort((left, right) => right.meanWinRateImpactPp - left.meanWinRateImpactPp);
    const lowTags = sortedTags.filter(tag => classifyTag(tag) === '低' || classifyTag(tag) === '负收益');
    const unmodeledTags = sortedTags.filter(tag => !tag.modeled);
    const overloaded = report.cardRisks.slice(0, 30);
    const lines = [
        '# 卡牌词条能效测试报告',
        '',
        `测试日期：${report.generatedAt.slice(0, 10)}`,
        '',
        `随机种子：\`${report.seed}\``,
        '',
        `样本量：每个受影响构筑在后期、精英、首领三个节点分别测试 ${report.runsPerSample} 局，并在纯卡牌与成熟构筑下逐个移除普通卡词条进行配对比较。史诗核心计入词条密度，但其专属脚本效果不参与单词条剥离。`,
        '',
        '## 词条密度',
        '',
        `- 当前共有 **${report.corpus.totalTags} 个词条**、**${report.corpus.totalCards} 张卡牌**。`,
        `- 平均每张卡 **${report.corpus.averageTags.toFixed(2)} 个词条**。`,
        `- ${report.corpus.cardsWithAtLeastTwoTags} 张卡拥有至少 2 个词条，占 ${pct(report.corpus.cardsWithAtLeastTwoTags / report.corpus.totalCards)}。`,
        `- ${report.corpus.cardsWithThreeTags} 张卡拥有 3 个词条，占 ${pct(report.corpus.cardsWithThreeTags / report.corpus.totalCards)}。`,
        '',
        '| 职业 | 卡牌数 | 平均词条 | 三词条卡 |',
        '|---|---:|---:|---:|',
        ...report.corpus.byRole.map(role => `| ${role.role} | ${role.cards} | ${role.averageTags.toFixed(2)} | ${role.cardsWithThreeTags} |`),
        '',
        '## 逐词条剥离结果',
        '',
        '“胜率边际”表示移除该词条后，受影响构筑平均损失的胜率百分点。正数越高，表示词条越强；负数表示当前 AI 或构筑中该词条可能产生负收益。',
        '',
        '| 词条 | 分类 | 强度 | 卡牌数 | 覆盖率 | 胜率边际 | 剩余生命边际 | 回合加速 | 波动范围 |',
        '|---|---|---:|---:|---:|---:|---:|---:|---:|',
        ...sortedTags.map(tag => `| ${tag.tag} | ${tag.group} | ${classifyTag(tag)} | ${tag.cardCount} | ${pct(tag.prevalence)} | ${signed(tag.meanWinRateImpactPp)}pp | ${signed(tag.meanHpImpact)} | ${signed(tag.meanTurnImpact)} | ${signed(tag.minWinRateImpactPp)} ~ ${signed(tag.maxWinRateImpactPp)}pp |`),
        '',
        '## 高风险卡牌',
        '',
        '以下卡牌拥有 3 个词条，或同时携带至少 2 个高边际词条。风险分同时考虑词条数量、词条强度、费用以及销毁/放逐代价。',
        '',
        '| 卡牌 | 职业 | 费用 | 稀有度 | 词条 | 高边际词条 | 风险分 |',
        '|---|---|---:|---|---|---|---:|',
        ...overloaded.map(card => `| ${card.name} | ${card.role} | ${card.cost} | ${card.rarity} | ${card.tags.join('、')} | ${card.highPowerTags.join('、') || '-'} | ${card.riskScore} |`),
        '',
        '## 结论',
        '',
        `- 当前 ${pct(report.corpus.cardsWithAtLeastTwoTags / report.corpus.totalCards)} 的卡牌至少拥有两个词条，“双词条”已经成为默认模板，词条不再承担稀有或构筑识别作用。`,
        `- 法师平均每张卡 ${report.corpus.byRole.find(role => role.roleId === 'hero_mage').averageTags.toFixed(2)} 个词条，且三词条卡最多，是认知负担最高的职业。`,
        `- 高风险清单中有 ${report.cardRisks.filter(card => card.cost <= 1).length} 张 0 至 1 费卡，说明低费卡同时承担启动、资源和防御的情况较多。`,
        `- 低边际或负收益词条包括：${lowTags.map(tag => tag.tag).join('、') || '无'}。低边际不等于应直接删除：拾遗、放血、重置、连击更适合检查合并或改成正文；穿甲、反击、诅咒则应先检查敌人护甲、攻击频率和回复机制是否给了足够发挥空间。`,
        `- 尚未纳入模拟器的词条包括：${unmodeledTags.map(tag => tag.tag).join('、') || '无'}。这些结果不能用于强弱判断，应先补齐行为模型。`,
        '',
        '## 建议标准',
        '',
        '- 普通卡默认 0 至 1 个词条，稀有卡默认 1 个，史诗卡默认不超过 2 个。',
        '- 只有带明确代价的 0 费卡、史诗核心或构筑终结牌可以出现 3 个词条。',
        '- 高边际词条应作为卡牌主效果。0 至 1 费卡原则上不能同时拥有两个高边际词条。',
        '- 抽牌、充能、回响、复刻、多段、连射这类完整资源或倍率效果，应按主效果计价，不应视为免费附属词条。',
        '- 招魂、轮回、拾遗可考虑合并为统一的“回收”体系，并在正文说明目标区域与返回位置。',
        '- 连射、多段、回响共享重复执行逻辑，建议保留职业特色最强的两个名称，其余改为卡牌正文或统一底层关键词。',
        '- 下一轮调整先处理高风险卡牌的词条数量，再重新测试数值；不要同时削词条和基础数值。',
        '',
        '完整数据：`tools/tag_efficiency_report.json`'
    ];
    return `${lines.join('\n')}\n`;
}

function run() {
    const args = parseArgs(process.argv.slice(2));
    const data = loadGameData();
    const cards = getAllCards(data);
    const reference = buildReferenceResults(data, args);
    const tags = Object.keys(data.TAGS).map(tag => auditTag(data, cards, tag, args, reference));
    const report = {
        generatedAt: new Date().toISOString(),
        seed: args.seed,
        runsPerSample: args.runs,
        modes: MODES,
        ablationScope: 'regular cards and foundation cards; epic core scripted effects are retained',
        checkpoints: TEST_CHECKPOINTS,
        corpus: summarizeCorpus(data, cards),
        tags,
        cardRisks: buildCardRisks(cards, tags)
    };
    fs.writeFileSync(path.resolve(ROOT, args.json), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.resolve(ROOT, args.markdown), markdownReport(report));
    console.log(`Tag audit complete: ${report.corpus.totalTags} tags, ${report.corpus.totalCards} cards, ${args.runs} runs per sample.`);
    console.log(`Average tags per card: ${report.corpus.averageTags.toFixed(2)}; cards with 3 tags: ${report.corpus.cardsWithThreeTags}.`);
    console.log('Top marginal tags:');
    for (const tag of [...tags].sort((left, right) => right.meanWinRateImpactPp - left.meanWinRateImpactPp).slice(0, 10)) {
        console.log(`${tag.tag}\t${signed(tag.meanWinRateImpactPp)}pp\t${tag.cardCount} cards`);
    }
}

run();
