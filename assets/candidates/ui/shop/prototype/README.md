# Questers Shop Prototype

独立商店原型，不接入正式 `questers_demo_v0.99.html`。

## 文件

- `shop_prototype.html`：可直接打开的交互原型。
- `shop_art_plate_v2.png`：当前接入的商店美术底板。
- `shop_art_service_workbench.png`：拓印 / 精简服务页的透明 PNG 装饰件。
- `shop_art_relic_tray.png`：奇珍页的透明 PNG 陈列托盘。
- `shop_prototype_plate_v1.png`：上一版原型底板，保留用于对比。
- `shop_prototype_market.png`：货架状态验证截图。
- `shop_prototype_relic.png`：奇珍状态验证截图。
- `shop_prototype_copy.png`：拓印状态验证截图。
- `shop_prototype_delete.png`：精简状态验证截图。
- `build_shop_art_assets.py`：当前候选 PNG 的生成脚本，方便继续调底板布局和功能装饰件。

## 范围

- 使用 20 张游戏内卡牌样本。
- 只模拟 `货架 / 奇珍 / 拓印 / 精简` 四个视图。
- 右下角保留固定操作位：货架/奇珍为补货，服务页为返回货架，离开商店始终固定。
- 正式接入时再改为读取完整牌组、真实商品、真实价格和推进地图逻辑。
