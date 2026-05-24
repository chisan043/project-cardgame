# 怪物动作关键帧资产

本目录资源基于现有 `怪物/战斗立绘/` 主立绘扩展而来，用于首版战斗动作接入。

## 输出位置

- `怪物/动作关键帧/怪物名/动作名.png`
- `怪物/动作关键帧_总览.png`

## 命名规范

普通怪：

- `idle_front`
- `attack_start_front`
- `attack_hit_front`
- `skill_cast_front`
- `hurt_front`
- `defeat_front`

精英怪：

- `idle_front`
- `attack_start_front`
- `attack_hit_front`
- `skill_start_front`
- `skill_cast_front`
- `hurt_front`
- `hurt_heavy_front`
- `defeat_front`

Boss / 准 Boss：

- `idle_front`
- `attack_start_front`
- `attack_hit_front`
- `skill_start_front` 或 `skill1_start_front`
- `skill_cast_front` 或 `skill1_cast_front`
- `skill2_start_front`
- `skill2_cast_front`
- `hurt_front`
- `hurt_heavy_front` 或 `enrage_front`
- `defeat_front`

## 当前交付策略

- 统一保持透明背景 PNG
- 保持敌方正面 / 3/4 正面的底部锚点一致
- 以姿态偏移、轮廓强化、属性特效来区分待机、攻击、技能、受击、死亡
- 适合代码侧先用 pose 切换 + 位移 + VFX 的方式接入
