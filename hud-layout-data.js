window.HUANJING_HUD_LAYOUT = {
  "background": "assets/scenes/battle/ancient_forest_day_v1.webp",
  "referenceResolution": {
    "width": 1280,
    "height": 720
  },
  "stageWidth": 1280,
  "stageHeight": 720,
  "backgroundFit": "cover",
  "showGrid": false,
  "showGuides": false,
  "items": [
    {
      "id": "hud-手牌承托",
      "name": "手牌承托",
      "src": "assets/ui/hud/hand_tray/hand_fan_tray_shell_asset_v1.webp",
      "x": 172,
      "y": 513,
      "width": 937,
      "height": 256,
      "z": 1,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        172,
        513
      ],
      "position": [
        172,
        513
      ],
      "size": [
        860,
        206
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "hand-tray",
      "role": "static"
    },
    {
      "id": "hud-结束回合按钮",
      "name": "结束回合按钮",
      "src": "assets/ui/hud/center_controls/end_turn_button_shell_asset_v1.webp",
      "x": 986,
      "y": 400,
      "width": 292,
      "height": 110,
      "z": 2,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        986,
        400
      ],
      "position": [
        986,
        400
      ],
      "size": [
        292,
        110
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "end-turn",
      "role": "static"
    },
    {
      "id": "hud-回合计数器",
      "name": "回合计数器",
      "src": "assets/ui/hud/center_controls/turn_counter_inner_dial_asset_v1.webp",
      "x": 607,
      "y": 13,
      "width": 67,
      "height": 67,
      "z": 2.5,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        607,
        13
      ],
      "position": [
        607,
        13
      ],
      "size": [
        67,
        67
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "turn-counter",
      "role": "static"
    },
    {
      "id": "hud-抽牌堆",
      "name": "抽牌堆",
      "src": "assets/ui/hud/piles/draw_pile_stack_asset_v1.webp",
      "x": 36,
      "y": 520,
      "width": 88,
      "height": 128,
      "z": 3,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        36,
        520
      ],
      "position": [
        36,
        520
      ],
      "size": [
        88,
        128
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "draw-pile",
      "role": "static"
    },
    {
      "id": "hud-弃牌堆",
      "name": "弃牌堆",
      "src": "assets/ui/hud/piles/discard_pile_stack_asset_v1.webp",
      "x": 1156,
      "y": 520,
      "width": 88,
      "height": 128,
      "z": 4,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        1156,
        520
      ],
      "position": [
        1156,
        520
      ],
      "size": [
        88,
        128
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "discard-pile",
      "role": "static"
    },
    {
      "id": "hud-放逐堆",
      "name": "放逐堆",
      "src": "assets/ui/hud/piles/exile_pile_stack_asset_v1.webp",
      "x": 1034,
      "y": 520,
      "width": 88,
      "height": 128,
      "z": 5,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        1034,
        520
      ],
      "position": [
        1034,
        520
      ],
      "size": [
        88,
        128
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "exhaust-pile",
      "role": "static"
    },
    {
      "id": "item-drq27qm",
      "name": "玩家面板/player_hp_bar_long_fill_gray_base_asset_v1",
      "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_gray_base_asset_v1.webp",
      "x": 76,
      "y": 92,
      "width": 298,
      "height": 182,
      "z": 6,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": "input:玩家面板/player_hp_bar_long_fill_gray_base_asset_v1.png",
      "sourceType": "folder-input",
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        76,
        92
      ],
      "position": [
        76,
        92
      ],
      "size": [
        298,
        182
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "role": "static"
    },
    {
      "id": "item-86orh2k",
      "name": "玩家名牌",
      "src": "assets/ui/hud/player_panel/player_nameplate_shell_asset_v1.webp",
      "x": 117,
      "y": 15,
      "width": 325,
      "height": 69,
      "z": 7,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        117,
        15
      ],
      "position": [
        117,
        15
      ],
      "size": [
        325,
        69
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "player-name",
      "role": "static"
    },
    {
      "id": "item-twdkx6f",
      "name": "player_energy_tray_asset_v1_no_circles_transparent.png",
      "src": "assets/ui/hud/player_panel/player_energy_tray_asset_v1_no_circles_transparent.webp",
      "x": 98,
      "y": 81,
      "width": 363,
      "height": 124,
      "z": 8,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        98,
        81
      ],
      "position": [
        98,
        81
      ],
      "size": [
        363,
        124
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "role": "static"
    },
    {
      "id": "item-ft8mjek",
      "name": "玩家状态栏",
      "src": "assets/ui/hud/status_bar/player_status_bar_shell_asset_v1.webp",
      "x": 85,
      "y": 133,
      "width": 287,
      "height": 110,
      "z": 9,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        85,
        133
      ],
      "position": [
        85,
        133
      ],
      "size": [
        287,
        110
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "binding": "player-status",
      "role": "static"
    },
    {
      "id": "item-clz10qa",
      "name": "能量晶石 1",
      "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
      "x": 244,
      "y": 124,
      "width": 21,
      "height": 37,
      "z": 10,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        244,
        124
      ],
      "position": [
        244,
        124
      ],
      "size": [
        21,
        37
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "energy",
      "role": "energy"
    },
    {
      "id": "item-d1kiimt",
      "name": "能量晶石 2",
      "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
      "x": 277,
      "y": 124,
      "width": 21,
      "height": 37,
      "z": 11,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        277,
        124
      ],
      "position": [
        277,
        124
      ],
      "size": [
        21,
        37
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "energy",
      "role": "energy"
    },
    {
      "id": "item-as61n9g",
      "name": "能量晶石 3",
      "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
      "x": 311,
      "y": 124,
      "width": 21,
      "height": 37,
      "z": 12,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        311,
        124
      ],
      "position": [
        311,
        124
      ],
      "size": [
        21,
        37
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "energy",
      "role": "energy"
    },
    {
      "id": "item-lxoy2ug",
      "name": "能量晶石 4",
      "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
      "x": 345,
      "y": 124,
      "width": 21,
      "height": 37,
      "z": 13,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        345,
        124
      ],
      "position": [
        345,
        124
      ],
      "size": [
        21,
        37
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "energy",
      "role": "energy"
    },
    {
      "id": "item-kseyctz",
      "name": "能量晶石 5",
      "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
      "x": 378,
      "y": 124,
      "width": 21,
      "height": 37,
      "z": 14,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        378,
        124
      ],
      "position": [
        378,
        124
      ],
      "size": [
        21,
        37
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "energy",
      "role": "energy"
    },
    {
      "id": "item-rtg403e",
      "name": "生命灰底",
      "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_gray_base_editor_asset_v1.webp",
      "x": 154,
      "y": 76,
      "width": 300,
      "height": 36,
      "z": 15,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        154,
        76
      ],
      "position": [
        154,
        76
      ],
      "size": [
        300,
        36
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "role": "static"
    },
    {
      "id": "item-tmvgo6w",
      "name": "生命残影",
      "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_damage_trail_editor_asset_v1.webp",
      "x": 154,
      "y": 76,
      "width": 300,
      "height": 36,
      "z": 16,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 0.96,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        154,
        76
      ],
      "position": [
        154,
        76
      ],
      "size": [
        300,
        36
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "binding": "player-hp-lag",
      "role": "hp-lag"
    },
    {
      "id": "item-uoveutk",
      "name": "生命填充",
      "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_editor_asset_v1.webp",
      "x": 154,
      "y": 76,
      "width": 300,
      "height": 36,
      "z": 17,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        154,
        76
      ],
      "position": [
        154,
        76
      ],
      "size": [
        300,
        36
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "binding": "player-hp-fill",
      "role": "hp-fill"
    },
    {
      "id": "item-8gbkasb",
      "name": "生命心标",
      "src": "assets/ui/hud/player_panel/player_hp_bar_heart_fill_editor_asset_v1.webp",
      "x": 157,
      "y": 79,
      "width": 30,
      "height": 34,
      "z": 18,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        157,
        79
      ],
      "position": [
        157,
        79
      ],
      "size": [
        30,
        34
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "role": "static"
    },
    {
      "id": "item-1uxydgc",
      "name": "生命空框",
      "src": "assets/ui/hud/player_panel/player_hp_bar_empty_frame_editor_asset_v1.webp",
      "x": 127,
      "y": 68,
      "width": 355,
      "height": 56,
      "z": 19,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        127,
        68
      ],
      "position": [
        127,
        68
      ],
      "size": [
        355,
        56
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "player-hp",
      "role": "static"
    },
    {
      "id": "item-hr1r7j9",
      "name": "玩家面板/avatar_circle_gray_base_asset_v1",
      "src": "assets/ui/hud/player_panel/avatar_circle_gray_base_asset_v1.webp",
      "x": 16,
      "y": 19,
      "width": 135,
      "height": 149,
      "z": 20,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": "input:玩家面板/avatar_circle_gray_base_asset_v1.png",
      "sourceType": "folder-input",
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        16,
        19
      ],
      "position": [
        16,
        19
      ],
      "size": [
        135,
        149
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "role": "static"
    },
    {
      "id": "item-tlfo2hh",
      "name": "玩家头像框",
      "src": "assets/ui/hud/player_panel/player_portrait_frame_asset_v1.webp",
      "x": 8,
      "y": 11,
      "width": 151,
      "height": 165,
      "z": 21,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        8,
        11
      ],
      "position": [
        8,
        11
      ],
      "size": [
        151,
        165
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "player-portrait",
      "role": "static"
    },
    {
      "id": "item-6kbu9mx",
      "name": "pile_count_plate_asset_v1_transparent",
      "src": "assets/ui/hud/piles/pile_count_plate_asset_v1_transparent.webp",
      "x": 27,
      "y": 599,
      "width": 107,
      "height": 118,
      "z": 22,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": "input:pile_count_plate_asset_v1_transparent.png",
      "sourceType": "folder-input",
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        27,
        599
      ],
      "position": [
        27,
        599
      ],
      "size": [
        107,
        118
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "draw-count",
      "role": "static"
    },
    {
      "id": "item-ucft2gu",
      "name": "pile_count_plate_asset_v1_transparent 副本",
      "src": "assets/ui/hud/piles/pile_count_plate_asset_v1_transparent.webp",
      "x": 1147,
      "y": 599,
      "width": 107,
      "height": 118,
      "z": 23,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": "input:pile_count_plate_asset_v1_transparent.png",
      "sourceType": "folder-input",
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        1147,
        599
      ],
      "position": [
        1147,
        599
      ],
      "size": [
        107,
        118
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "discard-count",
      "role": "static"
    },
    {
      "id": "item-qv62zbb",
      "name": "pile_count_plate_asset_v1_transparent 副本 副本",
      "src": "assets/ui/hud/piles/pile_count_plate_asset_v1_transparent.webp",
      "x": 1025,
      "y": 599,
      "width": 107,
      "height": 118,
      "z": 24,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": "input:pile_count_plate_asset_v1_transparent.png",
      "sourceType": "folder-input",
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        1025,
        599
      ],
      "position": [
        1025,
        599
      ],
      "size": [
        107,
        118
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "exhaust-count",
      "role": "static"
    },
    {
      "id": "hud-敌方名牌",
      "name": "敌方名牌",
      "src": "assets/ui/hud/enemy_panel/enemy_nameplate_shell_asset_v1.webp",
      "x": 799,
      "y": -25,
      "width": 395,
      "height": 167,
      "z": 25,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        799,
        -25
      ],
      "position": [
        799,
        -25
      ],
      "size": [
        440,
        84
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "enemy-name",
      "role": "static"
    },
    {
      "id": "item-15c9qkq",
      "name": "敌方状态底",
      "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_gray_base_asset_v1.webp",
      "x": 896,
      "y": 92,
      "width": 298,
      "height": 182,
      "z": 26,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": "input:玩家面板/player_hp_bar_long_fill_gray_base_asset_v1.png",
      "sourceType": "folder-input",
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        896,
        92
      ],
      "position": [
        896,
        92
      ],
      "size": [
        298,
        182
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "role": "static"
    },
    {
      "id": "item-nsiuppt",
      "name": "敌方意图框",
      "src": "assets/ui/hud/enemy_intent/enemy_intent_panel_shell_asset_v1.webp",
      "x": 809,
      "y": 81,
      "width": 363,
      "height": 124,
      "z": 27,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        809,
        81
      ],
      "position": [
        809,
        81
      ],
      "size": [
        363,
        124
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "enemy-intent",
      "role": "static"
    },
    {
      "id": "item-4yspg7n",
      "name": "敌方状态栏",
      "src": "assets/ui/hud/status_bar/player_status_bar_shell_asset_v1.webp",
      "x": 898,
      "y": 133,
      "width": 287,
      "height": 110,
      "z": 28,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        898,
        133
      ],
      "position": [
        898,
        133
      ],
      "size": [
        287,
        110
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "binding": "player-status",
      "role": "static"
    },
    {
      "id": "item-5dkxe6e",
      "name": "生命灰底 副本",
      "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_gray_base_editor_asset_v1.webp",
      "x": 816,
      "y": 76,
      "width": 300,
      "height": 36,
      "z": 29,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        816,
        76
      ],
      "position": [
        816,
        76
      ],
      "size": [
        300,
        36
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "role": "static"
    },
    {
      "id": "item-f24xsej",
      "name": "生命残影 副本",
      "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_damage_trail_editor_asset_v1.webp",
      "x": 816,
      "y": 76,
      "width": 300,
      "height": 36,
      "z": 30,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 0.96,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        816,
        76
      ],
      "position": [
        816,
        76
      ],
      "size": [
        300,
        36
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "binding": "player-hp-lag",
      "role": "hp-lag"
    },
    {
      "id": "item-6ef6qab",
      "name": "生命填充 副本",
      "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_editor_asset_v1.webp",
      "x": 816,
      "y": 76,
      "width": 300,
      "height": 36,
      "z": 31,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        816,
        76
      ],
      "position": [
        816,
        76
      ],
      "size": [
        300,
        36
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "fill",
      "binding": "player-hp-fill",
      "role": "hp-fill"
    },
    {
      "id": "item-ltjpty9",
      "name": "生命心标 副本",
      "src": "assets/ui/hud/player_panel/player_hp_bar_heart_fill_editor_asset_v1.webp",
      "x": 1083,
      "y": 79,
      "width": 30,
      "height": 34,
      "z": 32,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        1083,
        79
      ],
      "position": [
        1083,
        79
      ],
      "size": [
        30,
        34
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "role": "static"
    },
    {
      "id": "item-ttomk42",
      "name": "生命空框 副本",
      "src": "assets/ui/hud/player_panel/player_hp_bar_empty_frame_editor_asset_v1.webp",
      "x": 788,
      "y": 68,
      "width": 355,
      "height": 56,
      "z": 33,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        788,
        68
      ],
      "position": [
        788,
        68
      ],
      "size": [
        355,
        56
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "player-hp",
      "role": "static"
    },
    {
      "id": "item-3pryd2x",
      "name": "敌方头像滴",
      "src": "assets/ui/hud/player_panel/avatar_circle_gray_base_asset_v1.webp",
      "x": 1119,
      "y": 19,
      "width": 135,
      "height": 149,
      "z": 34,
      "rotation": 0,
      "flipX": true,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": "input:玩家面板/avatar_circle_gray_base_asset_v1.png",
      "sourceType": "folder-input",
      "groupId": null,
      "groupName": "玩家血条组",
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        1119,
        19
      ],
      "position": [
        1119,
        19
      ],
      "size": [
        135,
        149
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "role": "static"
    },
    {
      "id": "hud-敌方头像框",
      "name": "敌方头像框",
      "src": "assets/ui/hud/enemy_panel/enemy_portrait_frame_asset_v1.webp",
      "x": 1112,
      "y": 10,
      "width": 150,
      "height": 168,
      "z": 35,
      "rotation": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "hidden": false,
      "locked": false,
      "assetId": null,
      "sourceType": null,
      "groupId": null,
      "groupName": null,
      "anchor": "top_left",
      "pivot": [
        0,
        0
      ],
      "offset": [
        1112,
        10
      ],
      "position": [
        1112,
        10
      ],
      "size": [
        198,
        199
      ],
      "layoutMode": "absolute",
      "scaleMode": "reference_resolution",
      "fit": "contain",
      "binding": "enemy-portrait",
      "role": "static"
    }
  ],
  "groupPresets": [
    {
      "id": "group-ciyv8dh",
      "name": "玩家血条组",
      "createdAt": "2026-05-15T15:22:22.923Z",
      "items": [
        {
          "name": "玩家面板/player_hp_bar_long_fill_gray_base_asset_v1",
          "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_gray_base_asset_v1.webp",
          "assetId": "input:玩家面板/player_hp_bar_long_fill_gray_base_asset_v1.png",
          "sourceType": "folder-input",
          "x": 91,
          "y": 98,
          "width": 398,
          "height": 220,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 1
        },
        {
          "name": "玩家名牌",
          "src": "assets/ui/hud/player_panel/player_nameplate_shell_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 145,
          "y": 4,
          "width": 434,
          "height": 84,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 2
        },
        {
          "name": "player_energy_tray_asset_v1_no_circles_transparent.png",
          "src": "assets/ui/hud/player_panel/player_energy_tray_asset_v1_no_circles_transparent.webp",
          "assetId": null,
          "sourceType": null,
          "x": 120,
          "y": 85,
          "width": 485,
          "height": 150,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 3
        },
        {
          "name": "玩家状态栏",
          "src": "assets/ui/hud/status_bar/player_status_bar_shell_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 103,
          "y": 148,
          "width": 384,
          "height": 132,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 4
        },
        {
          "name": "能量晶石 1",
          "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 315,
          "y": 137,
          "width": 28,
          "height": 44,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 5
        },
        {
          "name": "能量晶石 2",
          "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 360,
          "y": 137,
          "width": 28,
          "height": 44,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 6
        },
        {
          "name": "能量晶石 3",
          "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 405,
          "y": 137,
          "width": 28,
          "height": 44,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 7
        },
        {
          "name": "能量晶石 4",
          "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 450,
          "y": 137,
          "width": 28,
          "height": 44,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 8
        },
        {
          "name": "能量晶石 5",
          "src": "assets/ui/hud/player_panel/player_energy_gem_on_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 495,
          "y": 137,
          "width": 28,
          "height": 44,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 9
        },
        {
          "name": "生命灰底",
          "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_gray_base_editor_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 195,
          "y": 80,
          "width": 401,
          "height": 43,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 10
        },
        {
          "name": "生命残影",
          "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_damage_trail_editor_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 195,
          "y": 80,
          "width": 401,
          "height": 43,
          "rotation": 0,
          "opacity": 0.96,
          "hidden": false,
          "locked": false,
          "z": 11
        },
        {
          "name": "生命填充",
          "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_editor_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 195,
          "y": 80,
          "width": 401,
          "height": 43,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 12
        },
        {
          "name": "生命心标",
          "src": "assets/ui/hud/player_panel/player_hp_bar_heart_fill_editor_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 200,
          "y": 83,
          "width": 40,
          "height": 40,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 13
        },
        {
          "name": "生命空框",
          "src": "assets/ui/hud/player_panel/player_hp_bar_empty_frame_editor_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 160,
          "y": 68,
          "width": 475,
          "height": 67,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 14
        },
        {
          "name": "玩家面板/avatar_circle_gray_base_asset_v1",
          "src": "assets/ui/hud/player_panel/avatar_circle_gray_base_asset_v1.webp",
          "assetId": "input:玩家面板/avatar_circle_gray_base_asset_v1.png",
          "sourceType": "folder-input",
          "x": 11,
          "y": 9,
          "width": 180,
          "height": 180,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 15
        },
        {
          "name": "玩家头像框",
          "src": "assets/ui/hud/player_panel/player_portrait_frame_asset_v1.webp",
          "assetId": null,
          "sourceType": null,
          "x": 0,
          "y": 0,
          "width": 202,
          "height": 199,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 16
        }
      ]
    },
    {
      "id": "builtin-player-damage-hp-bar",
      "name": "玩家动态掉血血条",
      "createdAt": "2026-05-15T00:00:00.000Z",
      "items": [
        {
          "name": "生命灰底",
          "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_gray_base_editor_asset_v1.webp",
          "x": 52,
          "y": 16,
          "width": 402,
          "height": 37,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 1,
          "assetId": null,
          "sourceType": null
        },
        {
          "name": "生命残影",
          "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_damage_trail_editor_asset_v1.webp",
          "x": 52,
          "y": 16,
          "width": 402,
          "height": 37,
          "rotation": 0,
          "opacity": 0.96,
          "hidden": false,
          "locked": false,
          "z": 2,
          "assetId": null,
          "sourceType": null
        },
        {
          "name": "生命填充",
          "src": "assets/ui/hud/player_panel/player_hp_bar_long_fill_editor_asset_v1.webp",
          "x": 52,
          "y": 16,
          "width": 402,
          "height": 37,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 3,
          "assetId": null,
          "sourceType": null
        },
        {
          "name": "生命心标",
          "src": "assets/ui/hud/player_panel/player_hp_bar_heart_fill_editor_asset_v1.webp",
          "x": 46,
          "y": 19,
          "width": 28,
          "height": 28,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 4,
          "assetId": null,
          "sourceType": null
        },
        {
          "name": "生命空框",
          "src": "assets/ui/hud/player_panel/player_hp_bar_empty_frame_editor_asset_v1.webp",
          "x": 0,
          "y": 0,
          "width": 472,
          "height": 63,
          "rotation": 0,
          "opacity": 1,
          "hidden": false,
          "locked": false,
          "z": 5,
          "assetId": null,
          "sourceType": null
        }
      ]
    }
  ],
  "folderAssetSource": null,
  "customAssets": [],
  "schema": "huanjing-hud-config",
  "version": 2
};
