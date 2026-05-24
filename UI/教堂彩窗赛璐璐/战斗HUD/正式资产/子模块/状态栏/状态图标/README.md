# 状态栏图标资产

当前战斗 HUD 会显示 16 类状态图标：

- 正向/功能状态 9 个：`armor`, `thorns`, `str`, `charge`, `echo`, `blood`, `enchant`, `guard`, `counter`
- 负向状态 7 个：`poison`, `bleed`, `burn`, `stun`, `curse`, `vuln`, `weak`

文件命名：

- `status_<id>_asset_v1.png`
- 透明 PNG，512 x 512
- 风格统一为教堂彩窗赛璐璐 HUD：金属外环、暗石底、彩窗色芯、简化状态符号

配套文件：

- `manifest.json`：状态 id、中文名、类型、色调、文件名
- `status_icon_overview_v1.png`：整套图标总览
- `generate_status_icons.py`：可重复生成脚本

未来扩展：

在 `generate_status_icons.py` 的 `STATUSES` 里新增一条配置，并选择或新增一个 `symbol` 绘制函数，然后重新运行：

```bash
python3 UI/教堂彩窗赛璐璐/战斗HUD/正式资产/子模块/状态栏/状态图标/generate_status_icons.py
```
