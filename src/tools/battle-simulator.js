/**
 * 战斗模拟器 - 卡牌平衡性测试工具
 * 用于验证不同职业在各种构筑下的胜率和表现
 * 
 * 使用方式：
 * const simulator = new BattleSimulator();
 * const results = simulator.runBatchTests(1000);
 * console.table(results);
 */

class BattleSimulator {
    constructor() {
        this.CHARACTER_POOLS = {
            hero_warrior: this.getMockWarriorCards(),
            hero_mage: this.getMockMageCards(),
            hero_archer: this.getMockArcherCards()
        };
        
        this.BUILD_CONFIGS = {
            warrior: {
                oathblade: { name: '圣剑反击', focus: ['庇护', '反击', '圣剑'] },
                execution: { name: '处刑连斩', focus: ['易伤', '穿甲', '连击'] },
                bloodoath: { name: '血誓狂战', focus: ['血祭', '吸血', '出血'] }
            },
            mage: {
                chant: { name: '星火咏唱', focus: ['咏唱', '爆发', '穿甲'] },
                mirror: { name: '镜像回路', focus: ['回响', '复刻', '抽牌'] },
                calamity: { name: '灾厄术士', focus: ['诅咒', '虚弱', '易伤'] }
            },
            archer: {
                gale: { name: '逐风连矢', focus: ['追击', '蓄力', '自然'] },
                venom: { name: '猎毒陷袭', focus: ['剧毒', '出血', '放血'] },
                exile: { name: '放逐游侠', focus: ['放逐', '回收'] }
            }
        };

        this.ENEMY_PRESETS = [
            { name: '弱敌', hp: 40, dmg: 3, armor: 0, intention: 'attack' },
            { name: '标准敌', hp: 60, dmg: 5, armor: 2, intention: 'attack' },
            { name: '强敌', hp: 85, dmg: 7, armor: 5, intention: 'balanced' },
            { name: '坦克敌', hp: 100, dmg: 3, armor: 8, intention: 'defend' },
            { name: '敏捷敌', hp: 50, dmg: 8, armor: 1, intention: 'aggro' }
        ];

        this.stats = {};
    }

    /**
     * 获取战士卡牌模拟数据
     */
    getMockWarriorCards() {
        return [
            { name: '誓光破阵', type: '攻击', cost: 2, val: 8, tags: ['圣剑', '重击'], rarity: '稀有' },
            { name: '圣垒回身', type: '防御', cost: 1, val: 10, tags: ['庇护'], rarity: '史诗' },
            { name: '誓约追击', type: '攻击', cost: 1, val: 8, tags: ['圣剑', '连击'], rarity: '普通' },
            { name: '血誓裂锋', type: '攻击', cost: 1, val: 7, tags: ['吸血', '连击'], rarity: '稀有' },
            { name: '王冠反斩', type: '能力', cost: 3, val: 12, tags: ['反击', '庇护', '抽牌'], rarity: '史诗' },
            { name: '誓刃解封', type: '攻击', cost: 3, val: 11, tags: ['圣剑', '穿甲', '重击'], rarity: '史诗' },
            { name: '铁誓斩', type: '攻击', cost: 1, val: 5, tags: ['连击'], rarity: '普通' },
            { name: '旧盾守', type: '防御', cost: 1, val: 6, tags: ['庇护'], rarity: '普通' }
        ];
    }

    /**
     * 获取法师卡牌模拟数据
     */
    getMockMageCards() {
        return [
            { name: '紫焰爆裂', type: '攻击', cost: 2, val: 11, tags: ['爆发', '易伤'], rarity: '稀有' },
            { name: '遗迹咏唱', type: '能力', cost: 2, val: 0, tags: ['咏唱', '充能', '抽牌'], rarity: '稀有' },
            { name: '紫焰火花', type: '攻击', cost: 1, val: 7, tags: ['爆发', '燃烧'], rarity: '普通' },
            { name: '魔流庇护', type: '能力', cost: 1, val: 0, tags: ['咏唱', '治愈'], rarity: '稀有' },
            { name: '裂界紫雷', type: '攻击', cost: 3, val: 16, tags: ['爆发', '穿甲', '回响'], rarity: '史诗' },
            { name: '星环复写', type: '能力', cost: 1, val: 0, tags: ['复刻', '咏唱'], rarity: '稀有' },
            { name: '星尘法弹', type: '攻击', cost: 1, val: 5, tags: ['爆发'], rarity: '普通' },
            { name: '秘仪护幕', type: '能力', cost: 1, val: 0, tags: ['咏唱'], rarity: '普通' }
        ];
    }

    /**
     * 获取弓箭手卡牌模拟数据
     */
    getMockArcherCards() {
        return [
            { name: '风痕定弦', type: '能力', cost: 1, val: 9, tags: ['蓄力', '抽牌'], rarity: '稀有' },
            { name: '逐风连矢', type: '攻击', cost: 1, val: 4, tags: ['追击'], rarity: '稀有' },
            { name: '林风束羽', type: '能力', cost: 1, val: 6, tags: ['自然', '蓄力'], rarity: '稀有' },
            { name: '狩影穿枝', type: '攻击', cost: 2, val: 10, tags: ['追击', '穿甲'], rarity: '稀有' },
            { name: '森冠齐射', type: '攻击', cost: 2, val: 7, tags: ['追击', '穿甲'], rarity: '史诗' },
            { name: '鹰眼贯枝', type: '攻击', cost: 2, val: 12, tags: ['蓄力', '穿甲'], rarity: '稀有' },
            { name: '林影矢', type: '攻击', cost: 1, val: 5, tags: ['追击'], rarity: '普通' },
            { name: '林隙闪步', type: '能力', cost: 1, val: 5, tags: ['自然'], rarity: '普通' }
        ];
    }

    /**
     * 创建玩家对象
     */
    createPlayer(character, buildConfig) {
        const cards = this.CHARACTER_POOLS[character];
        // 按构筑焦点筛选卡牌（简化版）
        const focusedCards = cards.filter(c => 
            buildConfig.focus.some(tag => c.tags.includes(tag)) || c.type === '防御'
        );
        
        return {
            character,
            build: buildConfig.name,
            hp: 80,
            maxHp: 80,
            armor: 0,
            energy: 3,
            maxEnergy: 3,
            hand: [],
            deck: focusedCards.length > 0 ? focusedCards : cards,
            discardPile: [],
            status: {
                poison: 0,
                bleed: 0,
                vuln: 0,
                weak: 0,
                str: 0
            },
            turnsDamageDealt: 0,
            turnsAlive: 0,
            totalDamageDealt: 0,
            cardsPlayed: 0
        };
    }

    /**
     * 创建敌人对象
     */
    createEnemy(preset) {
        return {
            name: preset.name,
            hp: preset.hp,
            maxHp: preset.hp,
            armor: preset.armor,
            dmg: preset.dmg,
            intention: preset.intention,
            status: {
                poison: 0,
                bleed: 0,
                vuln: 0,
                weak: 0
            },
            turnsAlive: 0
        };
    }

    /**
     * 模拟一轮战斗
     */
    simulateBattle(character, buildConfig, enemyPreset, seed = Math.random()) {
        const player = this.createPlayer(character, buildConfig);
        const enemy = this.createEnemy(enemyPreset);
        let turn = 0;
        const maxTurns = 50; // 最多50回合防止死循环

        while (turn < maxTurns && player.hp > 0 && enemy.hp > 0) {
            turn++;
            
            // ===== 玩家回合 =====
            // 抽卡
            if (player.hand.length < 5 && player.deck.length > 0) {
                player.hand.push(player.deck[Math.floor(Math.random() * player.deck.length)]);
            }
            
            // 充能
            player.energy = player.maxEnergy;
            
            // 打卡牌
            let cardsThisTurn = 0;
            let damageThisTurn = 0;
            let armorThisTurn = 0;
            
            while (player.energy > 0 && player.hand.length > 0) {
                const cardIdx = Math.floor(Math.random() * player.hand.length);
                const card = player.hand[cardIdx];
                
                if (card.cost <= player.energy) {
                    player.hand.splice(cardIdx, 1);
                    player.energy -= card.cost;
                    cardsThisTurn++;
                    player.cardsPlayed++;
                    
                    // 计算卡牌效果
                    if (card.type === '攻击') {
                        let damage = card.val;
                        // 应用易伤
                        if (enemy.status.vuln > 0) damage = Math.ceil(damage * 1.25);
                        // 应用虚弱
                        if (enemy.status.weak > 0) damage = Math.ceil(damage * 0.75);
                        damageThisTurn += damage;
                        player.totalDamageDealt += damage;
                    } else if (card.type === '防御') {
                        armorThisTurn += card.val;
                    } else if (card.type === '能力') {
                        // 简化版：能力卡给予混合效果
                        if (card.tags.includes('抽牌')) {
                            if (player.hand.length < 5 && player.deck.length > 0) {
                                player.hand.push(player.deck[Math.floor(Math.random() * player.deck.length)]);
                            }
                        }
                        damageThisTurn += Math.ceil(card.val * 0.5);
                    }
                } else {
                    break;
                }
            }
            
            player.armor += armorThisTurn;
            player.turnsDamageDealt = damageThisTurn;
            enemy.hp -= damageThisTurn;
            
            // ===== 敌人回合 =====
            if (enemy.hp > 0) {
                player.turnsAlive++;
                enemy.turnsAlive++;
                
                let enemyDamage = enemy.dmg;
                // 应用玩家状态
                if (player.status.str > 0) enemyDamage = Math.ceil(enemyDamage * 0.8);
                
                // 护甲吸收伤害
                const actualDamage = Math.max(1, enemyDamage - player.armor);
                player.hp -= actualDamage;
                player.armor = Math.max(0, player.armor - enemyDamage);
                
                // 每回合状态衰减
                if (enemy.status.poison > 0) enemy.status.poison--;
                if (enemy.status.bleed > 0) enemy.status.bleed--;
                if (enemy.status.vuln > 0) enemy.status.vuln--;
                if (player.status.weak > 0) player.status.weak--;
                if (player.status.str > 0) player.status.str--;
            }
            
            // 舍弃牌（回合结束）
            player.discardPile.push(...player.hand);
            player.hand = [];
            if (player.deck.length === 0 && player.discardPile.length > 0) {
                player.deck = player.discardPile;
                player.discardPile = [];
            }
        }

        // 判定胜负
        const playerWon = enemy.hp <= 0 && player.hp > 0;
        
        return {
            character,
            build: buildConfig.name,
            enemy: enemyPreset.name,
            playerWon,
            finalPlayerHp: player.hp,
            finalEnemyHp: Math.max(0, enemy.hp),
            playerTurnsAlive: player.turnsAlive,
            totalTurns: turn,
            damageDealt: player.totalDamageDealt,
            cardsPlayed: player.cardsPlayed,
            avgDamagePerCard: player.cardsPlayed > 0 ? (player.totalDamageDealt / player.cardsPlayed).toFixed(2) : 0
        };
    }

    /**
     * 批量测试
     */
    runBatchTests(testsPerConfig = 100) {
        const results = [];
        let testCount = 0;
        const totalTests = testsPerConfig * Object.keys(this.CHARACTER_POOLS).length * 
                          Object.keys(this.BUILD_CONFIGS.warrior).length * 
                          this.ENEMY_PRESETS.length;

        for (const [character, _] of Object.entries(this.CHARACTER_POOLS)) {
            const characterKey = character.replace('hero_', '');
            const builds = this.BUILD_CONFIGS[characterKey] || {};

            for (const [buildKey, buildConfig] of Object.entries(builds)) {
                for (const enemyPreset of this.ENEMY_PRESETS) {
                    let wins = 0;
                    let totalDamage = 0;
                    let totalTurns = 0;
                    let totalCardsPlayed = 0;

                    for (let i = 0; i < testsPerConfig; i++) {
                        const result = this.simulateBattle(character, buildConfig, enemyPreset, Math.random());
                        if (result.playerWon) wins++;
                        totalDamage += result.damageDealt;
                        totalTurns += result.totalTurns;
                        totalCardsPlayed += result.cardsPlayed;
                        testCount++;
                        
                        // 进度报告
                        if (testCount % (testsPerConfig * 5) === 0) {
                            console.log(`进度: ${((testCount / totalTests) * 100).toFixed(1)}%`);
                        }
                    }

                    const winRate = ((wins / testsPerConfig) * 100).toFixed(1);
                    const avgDamage = (totalDamage / testsPerConfig).toFixed(1);
                    const avgTurns = (totalTurns / testsPerConfig).toFixed(1);
                    const avgCardsPerTurn = ((totalCardsPlayed / totalTurns) * 1.0).toFixed(2);

                    results.push({
                        character: characterKey.toUpperCase(),
                        build: buildConfig.name,
                        enemy: enemyPreset.name,
                        winRate: `${winRate}%`,
                        avgDamage,
                        avgTurns,
                        avgCardsPerTurn,
                        assessment: this.assessBalance(parseFloat(winRate))
                    });
                }
            }
        }

        return results;
    }

    /**
     * 平衡性评估
     */
    assessBalance(winRate) {
        if (winRate > 75) return '🔴 过强';
        if (winRate > 60) return '🟡 偏强';
        if (winRate > 40) return '🟢 平衡';
        if (winRate > 25) return '🟡 偏弱';
        return '🔴 过弱';
    }

    /**
     * 生成详细报告
     */
    generateReport(results) {
        console.log('\n' + '='.repeat(80));
        console.log('🎮 卡牌平衡性测试报告');
        console.log('='.repeat(80) + '\n');

        // 按职业汇总
        const characterStats = {};
        results.forEach(r => {
            if (!characterStats[r.character]) {
                characterStats[r.character] = { winRates: [], builds: {} };
            }
            characterStats[r.character].winRates.push(parseFloat(r.winRate));
            if (!characterStats[r.character].builds[r.build]) {
                characterStats[r.character].builds[r.build] = [];
            }
            characterStats[r.character].builds[r.build].push(parseFloat(r.winRate));
        });

        // 职业总体平衡性
        console.log('📊 职业总体胜率统计：\n');
        Object.entries(characterStats).forEach(([character, data]) => {
            const avgWinRate = (data.winRates.reduce((a, b) => a + b) / data.winRates.length).toFixed(1);
            const maxWinRate = Math.max(...data.winRates).toFixed(1);
            const minWinRate = Math.min(...data.winRates).toFixed(1);
            console.log(`${character}`);
            console.log(`  平均胜率: ${avgWinRate}%`);
            console.log(`  最高/最低: ${maxWinRate}% / ${minWinRate}%`);
            console.log(`  构筑差异: ${(maxWinRate - minWinRate).toFixed(1)}pp`);
            console.log();
        });

        // 构筑强度排名
        console.log('🏆 构筑强度排名（按平均胜率）：\n');
        const buildStats = {};
        results.forEach(r => {
            const key = `${r.character} - ${r.build}`;
            if (!buildStats[key]) buildStats[key] = [];
            buildStats[key].push(parseFloat(r.winRate));
        });

        const buildRankings = Object.entries(buildStats)
            .map(([name, winRates]) => ({
                name,
                avg: (winRates.reduce((a, b) => a + b) / winRates.length).toFixed(1)
            }))
            .sort((a, b) => b.avg - a.avg);

        buildRankings.forEach((b, idx) => {
            const tier = idx < 3 ? '🥇' : idx < 6 ? '🥈' : '🥉';
            console.log(`${idx + 1}. ${tier} ${b.name}: ${b.avg}%`);
        });

        // 对手难度分析
        console.log('\n💪 对手难度分析：\n');
        const enemyStats = {};
        results.forEach(r => {
            if (!enemyStats[r.enemy]) {
                enemyStats[r.enemy] = [];
            }
            enemyStats[r.enemy].push(parseFloat(r.winRate));
        });

        Object.entries(enemyStats).forEach(([enemy, winRates]) => {
            const avg = (winRates.reduce((a, b) => a + b) / winRates.length).toFixed(1);
            const difficulty = avg > 60 ? '简单 ✅' : avg > 40 ? '适中 ⚖️' : '困难 ⚠️';
            console.log(`${enemy}: 平均胜率 ${avg}% (${difficulty})`);
        });

        // 平衡性问题识别
        console.log('\n⚠️  潜在平衡问题：\n');
        const issues = [];
        
        Object.entries(characterStats).forEach(([char, data]) => {
            const buildVariance = Math.max(...data.winRates) - Math.min(...data.winRates);
            if (buildVariance > 30) {
                issues.push(`${char} 的构筑强度差异过大 (${buildVariance.toFixed(1)}pp)`);
            }
        });

        buildRankings.forEach((b, idx) => {
            const winRate = parseFloat(b.avg);
            if (winRate > 75) {
                issues.push(`${b.name} 胜率过高 (${b.avg}%)`);
            } else if (winRate < 25) {
                issues.push(`${b.name} 胜率过低 (${b.avg}%)`);
            }
        });

        if (issues.length === 0) {
            console.log('✅ 未发现严重的平衡性问题！');
        } else {
            issues.forEach(issue => console.log(`• ${issue}`));
        }

        console.log('\n' + '='.repeat(80) + '\n');
        return { characterStats, buildStats, issues };
    }
}

// ===== 导出 =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleSimulator;
}

// ===== 快速测试脚本 =====
if (typeof require !== 'undefined' && require.main === module) {
    console.log('🚀 启动卡牌平衡性测试...\n');
    const simulator = new BattleSimulator();
    const results = simulator.runBatchTests(50); // 快速测试模式
    
    console.table(results.slice(0, 20)); // 显示前20条结果
    simulator.generateReport(results);
}
