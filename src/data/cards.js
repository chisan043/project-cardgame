// Extracted gameplay data. Keep this file free of DOM/runtime side effects.
const CARD_ART_REGISTRY = {
    // Full character card illustrations.
    '誓光破阵': 'assets/cards/art/warrior/warrior_charge_art_v1.webp',
    '遗迹立誓': 'assets/cards/art/warrior/warrior_oath_art_v1.webp',
    '紫焰爆裂': 'assets/cards/art/mage/mage_flame_art_v1.webp',
    '遗迹咏唱': 'assets/cards/art/mage/mage_chant_art_v1.webp',
    '风痕定弦': 'assets/cards/art/archer/archer_aim_art_v1.webp',
    '逐风连矢': 'assets/cards/art/archer/archer_barrage_art_v1.webp',

    // Generated unframed card art for standard pool cards.
    '圣垒回身': 'assets/cards/art/warrior/warrior_wall_art_v1.webp',
    '誓约追击': 'assets/cards/art/warrior/warrior_follow_art_v1.webp',
    '圣堂守势': 'assets/cards/art/warrior/warrior_guard_art_v1.webp',
    '誓刃解封': 'assets/cards/art/warrior/warrior_release_art_v1.webp',
    '裂光一闪': 'assets/cards/art/warrior/warrior_flash_art_v1.webp',
    '王冠反斩': 'assets/cards/art/warrior/warrior_crown_riposte_art_v1.webp',
    '铁壁圣痕': 'assets/cards/art/warrior/warrior_scar_art_v1.webp',
    '血誓裂锋': 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp',
    '魔剑': 'assets/cards/art/warrior/warrior_magic_sword_art_v1.png',
    '血火回命': 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp',
    '裂隙刻印': 'assets/cards/art/warrior/warrior_flash_art_v1.webp',
    '誓反架势': 'assets/cards/art/warrior/warrior_guard_art_v1.webp',
    '决绝斩': 'assets/cards/art/warrior/warrior_final_judgement_art_v1.webp',
    '棘甲冲锋': 'assets/cards/art/warrior/warrior_thorn_charge_art_v1.webp',
    '誓旗护阵': 'assets/cards/art/warrior/warrior_banner_guard_art_v1.webp',
    '血痕引路': 'assets/cards/art/warrior/warrior_blood_wall_art_v1.webp',
    '誓约留锋': 'assets/cards/art/warrior/warrior_oath_retainer_art_v1.webp',
    '魂誓换锋': 'assets/cards/art/warrior/warrior_soul_oath_art_v1.webp',
    '狂誓裂斩': 'assets/cards/art/warrior/warrior_frenzy_cleave_art_v1.webp',
    '终誓处刑': 'assets/cards/art/warrior/warrior_final_judgement_art_v1.webp',
    '紫焰火花': 'assets/cards/art/mage/mage_spark_art_v1.webp',
    '魔流庇护': 'assets/cards/art/mage/mage_barrier_art_v1.webp',
    '虚空导引': 'assets/cards/art/mage/mage_void_art_v1.webp',
    '星火连祷': 'assets/cards/art/mage/mage_cascade_art_v1.webp',
    '星屑预兆': 'assets/cards/art/mage/mage_omen_art_v1.webp',
    '余烬点燃': 'assets/cards/art/mage/mage_ember_art_v1.webp',
    '法环回流': 'assets/cards/art/mage/mage_loop_art_v1.webp',
    '星页整理': 'assets/cards/art/mage/mage_loop_art_v1.webp',
    '星火预兆': 'assets/cards/art/mage/mage_chant_art_v1.webp',
    '镜页预兆': 'assets/cards/art/mage/mage_star_copy_art_v1.webp',
    '灾星预兆': 'assets/cards/art/mage/mage_stasis_hex_art_v1.webp',
    '裂界紫雷': 'assets/cards/art/mage/mage_thunder_art_v1.webp',
    '星环复写': 'assets/cards/art/mage/mage_star_copy_art_v1.webp',
    '燃魂导流': 'assets/cards/art/mage/mage_ember_flow_art_v1.webp',
    '回声护幕': 'assets/cards/art/mage/mage_echo_veil_art_v1.webp',
    '衰星尘': 'assets/cards/art/mage/mage_void_dust_art_v1.webp',
    '紫焰烙印': 'assets/cards/art/mage/mage_arcane_mark_art_v1.webp',
    '星缚咒印': 'assets/cards/art/mage/mage_stasis_hex_art_v1.webp',
    '裂星禁术': 'assets/cards/art/mage/mage_exile_nova_art_v1.webp',
    '林风束羽': 'assets/cards/art/archer/archer_ready_art_v1.webp',
    '踏叶掠影': 'assets/cards/art/archer/archer_step_art_v1.webp',
    '狩影穿枝': 'assets/cards/art/archer/archer_shadow_art_v1.webp',
    '森冠齐射': 'assets/cards/art/archer/archer_grove_art_v1.webp',
    '森息伏击': 'assets/cards/art/archer/archer_ambush_art_v1.webp',
    '鹰眼贯枝': 'assets/cards/art/archer/archer_hawkeye_art_v1.webp',
    '回环箭雨': 'assets/cards/art/archer/archer_rain_art_v1.webp',
    '回风藏箭': 'assets/cards/art/archer/archer_hidden_arrow_art_v1.webp',
    '旅箭整束': 'assets/cards/art/archer/archer_ready_art_v1.webp',
    '顺风瞄准': 'assets/cards/art/archer/archer_aim_art_v1.webp',
    '毒弦瞄准': 'assets/cards/art/archer/archer_ambush_art_v1.webp',
    '空弦瞄准': 'assets/cards/art/archer/archer_shadow_art_v1.webp',
    '血誓开锋': 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp',
    '逐影离弦': 'assets/cards/art/archer/archer_exile_shot_art_v1.webp',
    '轮枝归矢': 'assets/cards/art/archer/archer_cycle_branch_art_v1.webp',
    '拾羽连步': 'assets/cards/art/archer/archer_pick_feather_art_v1.webp',
    '翠毒连矢': 'assets/cards/art/archer/archer_venom_flurry_art_v1.webp',
    '林魂招矢': 'assets/cards/art/archer/archer_soul_return_art_v1.webp',
    '赤痕裂放': 'assets/cards/art/archer/archer_blood_release_art_v1.webp',
    '逐风绝矢': 'assets/cards/art/archer/archer_exile_storm_art_v1.webp',
    '古誓护印': 'assets/cards/art/neutral/neutral_guard_art_v1.webp',
    '星轨流转': 'assets/cards/art/neutral/neutral_cycle_art_v1.webp',
    '碎星短刃': 'assets/cards/art/neutral/neutral_spark_art_v1.webp',
    '圣像微光': 'assets/cards/art/neutral/neutral_bless_art_v1.webp',
    '回音残卷': 'assets/cards/art/neutral/neutral_echo_art_v1.webp',

    // Flow archetype card art. Filenames ending with "母版" are registered by their playable card name.
    '断脉残页': 'assets/cards/art/neutral/neutral_bloodlet_rite_art_v1.png',
    '厄毒爆发': 'assets/cards/art/neutral/neutral_poison_burst_art_v1.png',
    '封雷断页': 'assets/cards/art/neutral/neutral_sealed_thunder_art_v1.png',
    '灰烬路标': 'assets/cards/art/neutral/neutral_ash_marker_art_v1.png',
    '魂火祭文': 'assets/cards/art/neutral/neutral_soul_flame_art_v1.png',
    '镜火短章': 'assets/cards/art/neutral/neutral_mirror_spark_art_v1.png',
    '旧梦回收': 'assets/cards/art/neutral/neutral_old_dream_return_art_v1.png',
    '空白契约': 'assets/cards/art/neutral/neutral_blank_pact_art_v1.png',
    '狂锋断章': 'assets/cards/art/neutral/neutral_frenzy_edge_art_v1.png',
    '冷铁护页': 'assets/cards/art/neutral/neutral_cold_iron_page_art_v1.png',
    '流亡短刃': 'assets/cards/art/neutral/neutral_exile_blade_art_v1.png',
    '旅人短歌': 'assets/cards/art/neutral/neutral_traveler_song_art_v1.png',
    '无名重锋': 'assets/cards/art/neutral/neutral_nameless_heavy_art_v1.png',
    '血契刻痕': 'assets/cards/art/neutral/neutral_blood_mark_art_v1.png',
    '巡誓护符': 'assets/cards/art/neutral/neutral_vow_guard_art_v1.png',
    '猩红喘息': 'assets/cards/art/warrior/warrior_crimson_pause_art_v1.png',
    '垒誓残页': 'assets/cards/art/warrior/warrior_bastion_ledger_art_v1.png',
    '裁决虚锋': 'assets/cards/art/warrior/warrior_verdict_feint_art_v1.png',
    '残红回锋': 'assets/cards/art/warrior/warrior_red_return_art_v1.png',
    '偿血追命': 'assets/cards/art/warrior/warrior_blood_guard_step_art_v1.png',
    '断刑步': 'assets/cards/art/warrior/warrior_execute_step_art_v1.png',
    '穿心试探': 'assets/cards/art/warrior/warrior_heart_probe_art_v1.png',
    '锁腕断誓': 'assets/cards/art/warrior/warrior_disarm_press_art_v1.png',
    '沸血突进': 'assets/cards/art/warrior/warrior_boiling_drive_art_v1.png',
    '孤锋二连': 'assets/cards/art/warrior/warrior_lone_double_art_v1.png',
    '回生血契': 'assets/cards/art/warrior/warrior_life_contract_art_v1.png',
    '禁誓开脉': 'assets/cards/art/warrior/warrior_open_vein_art_v1.png',
    '裂脉誓印': 'assets/cards/art/warrior/warrior_vein_oath_art_v1.png',
    '裂隙点刺': 'assets/cards/art/warrior/warrior_rift_probe_art_v1.png',
    '鸣钢镇压': 'assets/cards/art/warrior/warrior_steel_pressure_art_v1.png',
    '默步突刺': 'assets/cards/art/warrior/warrior_silent_lunge_art_v1.png',
    '窥隙烙印': 'assets/cards/art/warrior/warrior_gap_finder_art_v1.png',
    '破阵换位': 'assets/cards/art/warrior/warrior_break_form_art_v1.png',
    '圣痕破势': 'assets/cards/art/warrior/warrior_saintbreaker_art_v1.png',
    '圣徽举盾': 'assets/cards/art/warrior/warrior_crest_guard_art_v1.png',
    '誓壁反转': 'assets/cards/art/warrior/warrior_oath_reversal_art_v1.png',
    '誓血缚阵': 'assets/cards/art/warrior/warrior_oath_pressure_art_v1.png',
    '噬痕终击': 'assets/cards/art/warrior/warrior_devour_finish_art_v1.png',
    '守誓待击': 'assets/cards/art/warrior/warrior_oath_watch_art_v1.png',
    '王誓蓄锋': 'assets/cards/art/warrior/warrior_oath_charge_art_v1.png',
    '刑架削锋': 'assets/cards/art/warrior/warrior_scaffold_cut_art_v1.png',
    '血潮续斩': 'assets/cards/art/warrior/warrior_blood_tide_art_v1.png',
    '血痕留锋': 'assets/cards/art/warrior/warrior_debt_scar_art_v1.png',
    '殉誓斩': 'assets/cards/art/warrior/warrior_martyr_cut_art_v1.png',
    '终裁量尺': 'assets/cards/art/warrior/warrior_final_measure_art_v1.png',
    '暗月留疤': 'assets/cards/art/mage/mage_dark_moon_scar_art_v1.png',
    '镜璃递归': 'assets/cards/art/mage/mage_glass_recursion_art_v1.png',
    '残星护文': 'assets/cards/art/mage/mage_star_ward_art_v1.png',
    '倒影护幕': 'assets/cards/art/mage/mage_reflect_veil_art_v1.png',
    '倒影批注': 'assets/cards/art/mage/mage_reflection_note_art_v1.png',
    '灯火续咏': 'assets/cards/art/mage/mage_lantern_chant_art_v1.png',
    '逆时针护刻': 'assets/cards/art/mage/mage_second_hand_art_v1.png',
    '厄兆连珠': 'assets/cards/art/mage/mage_bad_omen_chain_art_v1.png',
    '复写残响': 'assets/cards/art/mage/mage_copy_pierce_art_v1.png',
    '恒星回填': 'assets/cards/art/mage/mage_solar_refill_art_v1.png',
    '辉烬爆律': 'assets/cards/art/mage/mage_radiant_law_art_v1.png',
    '回声页标': 'assets/cards/art/mage/mage_echo_index_art_v1.png',
    '回声换位': 'assets/cards/art/mage/mage_echo_shift_art_v1.png',
    '禁言星砂': 'assets/cards/art/mage/mage_mute_sand_art_v1.png',
    '镜页摹写': 'assets/cards/art/mage/mage_mirror_trial_art_v1.png',
    '镜阵留声': 'assets/cards/art/mage/mage_mirror_array_art_v1.png',
    '聚焰读秒': 'assets/cards/art/mage/mage_countdown_art_v1.png',
    '群星枯萎': 'assets/cards/art/mage/mage_withered_stars_art_v1.png',
    '蚀星雾': 'assets/cards/art/mage/mage_corrupt_mist_art_v1.png',
    '双生火花': 'assets/cards/art/mage/mage_twin_spark_art_v1.png',
    '双页归档': 'assets/cards/art/mage/mage_double_archive_art_v1.png',
    '星轨锁定': 'assets/cards/art/mage/mage_orbit_lock_art_v1.png',
    '星核预充': 'assets/cards/art/mage/mage_star_precharge_art_v1.png',
    '星涌短波': 'assets/cards/art/mage/mage_star_surge_art_v1.png',
    '余音导流': 'assets/cards/art/mage/mage_aftertone_flow_art_v1.png',
    '厄星调律': 'assets/cards/art/mage/mage_calamity_tune_art_v1.png',
    '抄录星环': 'assets/cards/art/mage/mage_transcribe_ring_art_v1.png',
    '坠星病灶': 'assets/cards/art/mage/mage_sick_star_art_v1.png',
    '霜咒压迫': 'assets/cards/art/mage/mage_frost_hex_art_v1.png',
    '腐辉导线': 'assets/cards/art/mage/mage_decay_wire_art_v1.png',
    '孢影伏击': 'assets/cards/art/archer/archer_spore_shadow_art_v1.png',
    '残脉连矢': 'assets/cards/art/archer/archer_pulse_burst_art_v1.png',
    '赤潮弦': 'assets/cards/art/archer/archer_red_tide_bow_art_v1.png',
    '赤线追猎': 'assets/cards/art/archer/archer_redline_hunt_art_v1.png',
    '毒荆护步': 'assets/cards/art/archer/archer_poison_step_art_v1.png',
    '毒血换羽': 'assets/cards/art/archer/archer_venom_blood_shift_art_v1.png',
    '毒雨留痕': 'assets/cards/art/archer/archer_poison_rain_art_v1.png',
    '轻羽连射': 'assets/cards/art/archer/archer_ember_feather_art_v1.png',
    '裂筋倒钩': 'assets/cards/art/archer/archer_hook_sinew_art_v1.png',
    '飞叶封存': 'assets/cards/art/archer/archer_leaf_store_art_v1.png',
    '风誓扣弦': 'assets/cards/art/archer/archer_wind_string_art_v1.png',
    '腐叶陷网': 'assets/cards/art/archer/archer_rotten_net_art_v1.png',
    '归巢血轨': 'assets/cards/art/archer/archer_nest_track_art_v1.png',
    '回风掠步': 'assets/cards/art/archer/archer_backstep_art_v1.png',
    '残枝回轮': 'assets/cards/art/archer/archer_deadbranch_shuffle_art_v1.png',
    '急羽破廊': 'assets/cards/art/archer/archer_quick_corridor_art_v1.png',
    '旧箭入梦': 'assets/cards/art/archer/archer_old_arrow_dream_art_v1.png',
    '空谷飞刃': 'assets/cards/art/archer/archer_empty_valley_knife_art_v1.png',
    '空弦匿羽': 'assets/cards/art/archer/archer_empty_string_art_v1.png',
    '苦藤攀附': 'assets/cards/art/archer/archer_bitter_vine_art_v1.png',
    '裂肤箭': 'assets/cards/art/archer/archer_skin_splitter_art_v1.png',
    '林外归魂': 'assets/cards/art/archer/archer_outerwood_recall_art_v1.png',
    '绿雾终幕': 'assets/cards/art/archer/archer_green_mist_end_art_v1.png',
    '青牙初矢': 'assets/cards/art/archer/archer_green_fang_art_v1.png',
    '森毒锁喉': 'assets/cards/art/archer/archer_throat_poison_art_v1.png',
    '蛇瞳烙印': 'assets/cards/art/archer/archer_snake_eye_art_v1.png',
    '踏叶侧射': 'assets/cards/art/archer/archer_leaf_sidestep_art_v1.png',
    '血羽归魂': 'assets/cards/art/archer/archer_blood_feather_art_v1.png',
    '叶脉寻踪': 'assets/cards/art/archer/archer_leaf_search_art_v1.png',
    '叶脉换弦': 'assets/cards/art/archer/archer_wind_string_art_v1.png',
    '遗矢星标': 'assets/cards/art/archer/archer_lost_arrow_mark_art_v1.png',
    '归林遗羽': 'assets/cards/art/archer/archer_forest_specimen_art_v1.png',
    '影羽裂线': 'assets/cards/art/archer/archer_shadow_line_art_v1.png',
    '影匣齐射': 'assets/cards/art/archer/archer_shadow_box_art_v1.png',
    '游侠断后': 'assets/cards/art/archer/archer_rearguard_art_v1.png',
    '归羽刃': 'assets/cards/art/archer/archer_returning_feather_art_v1.png',
    '掠空羽矢': 'assets/cards/art/archer/archer_ember_feather_art_v1.png',
    '侧风护步': 'assets/cards/art/archer/archer_leaf_store_art_v1.png',
    '失路羽囊': 'assets/cards/art/archer/archer_empty_string_art_v1.png',

    // Starter and temporary cards reuse the closest generated art so the demo does not fall back to emoji.
    '铁誓斩': 'assets/cards/art/warrior/warrior_follow_art_v1.webp',
    '誓盾守': 'assets/cards/art/warrior/warrior_wall_art_v1.webp',
    '誓光斩': 'assets/cards/art/warrior/warrior_charge_art_v1.webp',
    '星尘法弹': 'assets/cards/art/mage/mage_spark_art_v1.webp',
    '月泉愈流': 'assets/cards/art/mage/mage_barrier_art_v1.webp',
    '秘仪预兆': 'assets/cards/art/mage/mage_chant_art_v1.webp',
    '秘仪护幕': 'assets/cards/art/mage/mage_barrier_art_v1.webp',
    '星火破封': 'assets/cards/art/mage/mage_flame_art_v1.webp',
    '林影矢': 'assets/cards/art/archer/archer_shadow_art_v1.webp',
    '林隙闪步': 'assets/cards/art/archer/archer_step_art_v1.webp',
    '飞刀': 'assets/cards/art/neutral/neutral_spark_art_v1.webp',
    '厄运印记': 'assets/cards/art/neutral/neutral_echo_art_v1.webp'
};

const CARD_TYPE_ART_FALLBACK = {
    '攻击': 'assets/cards/art/neutral/neutral_spark_art_v1.webp',
    '防御': 'assets/cards/art/neutral/neutral_guard_art_v1.webp',
    '能力': 'assets/cards/art/neutral/neutral_cycle_art_v1.webp',
    '诅咒': 'assets/cards/art/neutral/neutral_echo_art_v1.webp'
};

const CARD_FRAME_ASSETS = {
    warrior: 'assets/cards/frames/warrior_frame_v1.webp',
    mage: 'assets/cards/frames/mage_frame_v1.webp',
    archer: 'assets/cards/frames/archer_frame_v1.webp',
    neutral: 'assets/cards/frames/neutral_frame_v1.webp'
};

const CARD_FRAME_THEME_BY_NAME = {
    '誓光破阵': 'warrior', '遗迹立誓': 'warrior', '圣垒回身': 'warrior', '誓约追击': 'warrior', '圣堂守势': 'warrior', '誓刃解封': 'warrior', '裂光一闪': 'warrior', '王冠反斩': 'warrior', '铁壁圣痕': 'warrior', '血誓裂锋': 'warrior', '魔剑': 'warrior', '棘甲冲锋': 'warrior', '誓旗护阵': 'warrior', '血痕引路': 'warrior', '血誓开锋': 'warrior', '偿血追命': 'warrior', '誓约留锋': 'warrior', '魂誓换锋': 'warrior', '狂誓裂斩': 'warrior', '终誓处刑': 'warrior', '铁誓斩': 'warrior', '誓盾守': 'warrior', '誓光斩': 'warrior',
    '紫焰爆裂': 'mage', '遗迹咏唱': 'mage', '紫焰火花': 'mage', '魔流庇护': 'mage', '虚空导引': 'mage', '星火连祷': 'mage', '星屑预兆': 'mage', '余烬点燃': 'mage', '法环回流': 'mage', '裂界紫雷': 'mage', '星环复写': 'mage', '燃魂导流': 'mage', '回声护幕': 'mage', '衰星尘': 'mage', '紫焰烙印': 'mage', '星缚咒印': 'mage', '裂星禁术': 'mage', '星尘法弹': 'mage', '月泉愈流': 'mage', '秘仪预兆': 'mage', '秘仪护幕': 'mage',
    '风痕定弦': 'archer', '逐风连矢': 'archer', '林风束羽': 'archer', '踏叶掠影': 'archer', '狩影穿枝': 'archer', '森冠齐射': 'archer', '森息伏击': 'archer', '鹰眼贯枝': 'archer', '回环箭雨': 'archer', '回风藏箭': 'archer', '逐影离弦': 'archer', '轮枝归矢': 'archer', '拾羽连步': 'archer', '翠毒连矢': 'archer', '林魂招矢': 'archer', '赤痕裂放': 'archer', '逐风绝矢': 'archer', '林影矢': 'archer', '林隙闪步': 'archer',
    '古誓护印': 'neutral', '星轨流转': 'neutral', '碎星短刃': 'neutral', '圣像微光': 'neutral', '回音残卷': 'neutral', '飞刀': 'neutral', '厄运印记': 'neutral',
    '万物归墟': 'neutral', '厄毒爆发': 'neutral', '泰山压顶': 'neutral', '天道回音': 'neutral', '诛仙剑阵': 'warrior', '血海深渊': 'neutral', '万劫不灭体': 'neutral', '无极生太极': 'neutral',
    '剑诀·破军': 'warrior', '毒蛊·万毒': 'mage', '阵法·四象': 'neutral', '魔修·血煞': 'neutral', '天道·森罗': 'mage',
    '铸剑·淬火': 'warrior', '秘术·血炼': 'neutral', '奇门·遁甲': 'neutral', '符箓·注灵': 'mage', '道法·聚灵': 'mage'
};

const NEUTRAL_CARD_POOL = [
    { poolId: 'neutral_guard', name: '古誓护印', type: '防御', cost: 1, icon: '⛩️', val: 8, tags: ['保留'], rarity: '稀有' },
    { poolId: 'neutral_cycle', name: '星轨流转', type: '能力', cost: 0, icon: '🌌', val: 0, tags: ['重置', '销毁'], rarity: '稀有', desc: '[重置]手牌后[销毁]。' },
    { poolId: 'neutral_spark', name: '碎星短刃', type: '攻击', cost: 0, icon: '✨', val: 4, tags: ['销毁'], rarity: '普通' },
    { poolId: 'neutral_bless', name: '圣像微光', type: '能力', cost: 1, icon: '🕯️', val: 0, tags: ['治愈'], directEffects: { draw: true }, preserveDirectEffects: true, rarity: '普通', desc: '回复生命并抽 1 张牌。' },
    { poolId: 'neutral_sealed_thunder', name: '封雷断页', type: '攻击', cost: 2, icon: '🌩️', val: 13, tags: ['眩晕', '销毁'], rarity: '史诗', desc: '造成 13 点伤害，施加[眩晕]后[销毁]。' }
];

const CHARACTER_CARD_POOLS = {
    hero_warrior: [
        { poolId: 'warrior_charge', name: '誓光破阵', type: '攻击', cost: 2, icon: '✨', val: 8, tags: ['圣剑', '重击'], rarity: '稀有' },
        { poolId: 'warrior_oath', name: '遗迹立誓', type: '能力', cost: 1, icon: '📖', val: 4, tags: ['庇护', '抽牌', '保留'], rarity: '稀有', desc: '获得 4 点庇护并抽 1 张牌，打出后下回合回到手牌。' },
        { poolId: 'warrior_wall', name: '圣垒回身', type: '防御', cost: 1, icon: '🔰', val: 8, tags: ['庇护'], rarity: '史诗' },
        { poolId: 'warrior_follow', name: '誓约追击', type: '攻击', cost: 1, icon: '🗡️', val: 8, tags: ['圣剑', '连击'], rarity: '普通' },
        { poolId: 'warrior_guard', name: '圣堂守势', type: '防御', cost: 1, icon: '🛡️', val: 8, tags: ['荆棘'], rarity: '史诗', desc: '获得 8 点护盾，并增加荆棘。' },
        { poolId: 'warrior_release', name: '誓刃解封', type: '攻击', cost: 3, icon: '⚔️', val: 14, tags: ['圣剑', '重击'], buildTags: ['oathblade'], rarity: '史诗', desc: '造成 14 点[圣剑][重击]伤害。' },
        { poolId: 'warrior_flash', name: '裂光一闪', type: '攻击', cost: 1, icon: '⚡', val: 7, tags: ['圣剑', '穿甲'], rarity: '普通' },
        { poolId: 'warrior_crown_riposte', name: '王冠反斩', type: '攻击', cost: 3, icon: '👑', val: 12, tags: ['反击', '重击'], directEffects: { protection: true }, preserveDirectEffects: true, rarity: '史诗', desc: '造成 12 点[重击]伤害，获得[庇护]并进入[反击]。' },
        { poolId: 'warrior_scar', name: '铁壁圣痕', type: '防御', cost: 2, icon: '🛡️', val: 13, tags: ['庇护', '保留'], rarity: '史诗' },
        { poolId: 'warrior_blood_vow_slash', name: '血誓裂锋', type: '攻击', cost: 1, icon: '🩸', val: 9, tags: ['血誓'], bloodOathCost: 4, bloodOathMissingRatio: 0.5, buildTags: ['bloodoath'], rarity: '稀有', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', desc: '失去 4 点生命；造成 9 点伤害；追加已损生命 50% 的伤害。' },
        { poolId: 'warrior_magic_sword', name: '魔剑', type: '攻击', cost: 1, icon: '🗡️', val: 4, tags: [], magicSwordGrowth: 1, buildTags: ['bloodoath'], rarity: '稀有', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_magic_sword_art_v1.png', desc: '造成 4 点伤害；自身实际失去生命或本牌击杀敌人时，永久 +1 伤害。' },
        { poolId: 'warrior_thorn_charge', name: '棘甲冲锋', type: '攻击', cost: 2, icon: '🌹', val: 10, tags: ['圣剑', '荆棘'], rarity: '稀有', art: 'assets/cards/art/warrior/warrior_thorn_charge_art_v1.webp', desc: '造成 10 点[圣剑]伤害并触发[荆棘]。' },
        { poolId: 'warrior_banner_guard', name: '誓旗护阵', type: '能力', cost: 1, icon: '🚩', val: 6, tags: ['庇护', '抽牌'], rarity: '稀有', art: 'assets/cards/art/warrior/warrior_banner_guard_art_v1.webp', desc: '获得 6 点庇护并抽 1 张牌。' },
        { poolId: 'warrior_blood_wall', name: '血痕引路', type: '能力', cost: 1, icon: '🩸', val: 0, tags: ['血誓'], bloodOathCost: 5, bloodDebtBleed: 6, buildTags: ['bloodoath'], rarity: '稀有', art: 'assets/cards/art/warrior/warrior_blood_wall_art_v1.webp', desc: '失去 5 点生命并施加 6 层出血。' },
        { poolId: 'warrior_oath_retainer', name: '誓约留锋', type: '防御', cost: 1, icon: '🔰', val: 6, tags: ['保留', '充能'], rarity: '普通', art: 'assets/cards/art/warrior/warrior_oath_retainer_art_v1.webp', desc: '获得 6 点护盾，[保留]并回复 1 点能量。' },
        { poolId: 'warrior_soul_oath', name: '魂誓换锋', type: '能力', cost: 1, icon: '📖', val: 4, tags: ['充能', '庇护'], rarity: '稀有', art: 'assets/cards/art/warrior/warrior_soul_oath_art_v1.webp', desc: '获得 4 点庇护并回复 1 点能量。' },
        { poolId: 'warrior_bleed_edge', name: '誓血裂口', type: '攻击', cost: 1, icon: '🩸', val: 8, tags: ['血誓'], bloodOathCost: 3, bloodDebtBleed: 5, buildTags: ['bloodoath'], rarity: '普通', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', desc: '失去 3 点生命；造成 8 点伤害并施加 5 层出血。' },
        { poolId: 'warrior_bloodlet_cleave', name: '断誓开锋', type: '攻击', cost: 1, icon: '⚔️', val: 10, tags: ['血誓'], bloodOathMissingRatio: 0.7, bloodDebtWeak: 1, buildTags: ['bloodoath'], rarity: '稀有', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', desc: '造成 10 点伤害；追加已损生命 70% 的伤害；施加 1 层[虚弱]。' },
        { poolId: 'warrior_venom_scar', name: '破势剑痕', type: '攻击', cost: 1, icon: '☠️', val: 11, tags: ['易伤', '穿甲'], buildTags: ['execution'], rarity: '稀有', art: 'assets/cards/art/warrior/warrior_flash_art_v1.webp', desc: '造成 11 点[穿甲]伤害并施加[易伤]。' },
        { poolId: 'warrior_frenzy_cleave', name: '狂誓裂斩', type: '攻击', cost: 2, icon: '🔥', val: 8, tags: ['狂热', '重击'], buildTags: ['execution'], rarity: '史诗', art: 'assets/cards/art/warrior/warrior_frenzy_cleave_art_v1.webp', desc: '触发[狂热]，造成 8 点[重击]伤害。' },
        { poolId: 'warrior_exile_judgement', name: '终誓处刑', type: '攻击', cost: 2, icon: '⚔️', val: 18, tags: ['穿甲', '重击'], buildTags: ['execution'], rarity: '史诗', art: 'assets/cards/art/warrior/warrior_final_judgement_art_v1.webp', desc: '造成 18 点[穿甲][重击]伤害。' },
        { poolId: 'warrior_flaw_mark', name: '裂隙刻印', type: '能力', cost: 0, icon: '🎯', val: 0, tags: ['易伤'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['execution', 'bloodoath'], rarity: '稀有', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_flash_art_v1.webp', desc: '免费施加[易伤]并抽 1 张牌。' },
        { poolId: 'warrior_duel_cut', name: '破甲誓斗', type: '攻击', cost: 1, icon: '🗡️', val: 12, tags: ['穿甲', '连击', '虚弱'], buildTags: ['execution'], rarity: '普通', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_flash_art_v1.webp', desc: '造成 12 点[穿甲]伤害并施加[虚弱]；若本回合已出牌，触发[连击]。' },
        { poolId: 'warrior_execute_window', name: '断首星隙', type: '攻击', cost: 2, icon: '⚔️', val: 15, tags: ['易伤', '重击'], buildTags: ['execution'], rarity: '史诗', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_final_judgement_art_v1.webp', desc: '造成 15 点[重击]伤害并施加[易伤]。' },
        { poolId: 'warrior_blood_drive', name: '不赦血契', type: '能力', cost: 1, icon: '🩸', val: 0, tags: ['血誓'], bloodOathCost: 6, bloodDebtStun: 1, buildTags: ['bloodoath'], rarity: '稀有', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_wall_art_v1.webp', desc: '失去 6 点生命并眩晕敌人。' },
        { poolId: 'warrior_lifebite', name: '偿命追击', type: '攻击', cost: 1, icon: '🩸', val: 10, tags: ['吸血', '血誓'], lifestealRatio: 0.5, bloodOathMissingRatio: 0.5, bloodDebtWeak: 1, buildTags: ['bloodoath'], rarity: '普通', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', desc: '造成 10 点伤害；追加已损生命 50% 的伤害；施加 1 层[虚弱]；按一半伤害[吸血]。' },
        { poolId: 'warrior_blood_oath_finish', name: '血誓终击', type: '攻击', cost: 2, icon: '🩸', val: 12, tags: ['血誓', '吸血'], lifestealRatio: 0.75, bloodOathMissingRatio: 1, buildTags: ['bloodoath'], rarity: '史诗', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_blood_vow_slash_art_v1.webp', desc: '造成 12 点伤害；追加已损生命 100% 的伤害；按 75% 伤害[吸血]。' }
    ],
    hero_mage: [
        { poolId: 'mage_flame', name: '紫焰爆裂', type: '攻击', cost: 2, icon: '💥', val: 12, tags: ['爆发', '易伤'], rarity: '稀有' },
        { poolId: 'mage_chant', name: '遗迹咏唱', type: '能力', cost: 1, icon: '📜', val: 0, tags: ['咏唱', '充能', '抽牌'], rarity: '稀有' },
        { poolId: 'mage_spark', name: '紫焰火花', type: '攻击', cost: 1, icon: '🔥', val: 10, tags: ['爆发', '燃烧'], rarity: '普通' },
        { poolId: 'mage_barrier', name: '魔流庇护', type: '能力', cost: 0, icon: '🛡️', val: 0, tags: ['咏唱', '治愈'], rarity: '稀有' },
        { poolId: 'mage_void', name: '虚空导引', type: '能力', cost: 1, icon: '🌌', val: 0, tags: ['咏唱', '回响'], rarity: '稀有' },
        { poolId: 'mage_cascade', name: '星火连祷', type: '能力', cost: 1, icon: '🪄', val: 0, tags: ['咏唱', '复刻'], directEffects: { draw: true }, rarity: '史诗', desc: '积累[咏唱]，复制上一张非复刻牌，并抽 1 张牌。' },
        { poolId: 'mage_omen', name: '星屑预兆', type: '能力', cost: 0, icon: '✦', val: 0, tags: ['咏唱', '销毁'], rarity: '普通' },
        { poolId: 'mage_ember', name: '余烬点燃', type: '攻击', cost: 0, icon: '🔥', val: 4, tags: ['爆发', '销毁'], rarity: '普通' },
        { poolId: 'mage_loop', name: '法环回流', type: '能力', cost: 1, icon: '🔮', val: 0, tags: ['咏唱', '充能', '抽牌'], rarity: '稀有' },
        { poolId: 'mage_thunder', name: '裂界紫雷', type: '攻击', cost: 3, icon: '🌩️', val: 20, tags: ['爆发', '回响'], rarity: '史诗', desc: '造成 20 点[爆发]伤害，本牌再触发一次。' },
        { poolId: 'mage_star_copy', name: '星环复写', type: '能力', cost: 1, icon: '🪞', val: 0, tags: ['复刻', '咏唱'], rarity: '稀有', art: 'assets/cards/art/mage/mage_void_art_v1.webp', desc: '积累[咏唱]，并复制上一张非复刻牌。' },
        { poolId: 'mage_ember_flow', name: '燃魂导流', type: '攻击', cost: 1, icon: '🔥', val: 5, tags: ['爆发', '燃烧', '充能'], rarity: '稀有', art: 'assets/cards/art/mage/mage_ember_art_v1.webp', desc: '造成 5 点[爆发]伤害，施加[燃烧]并回复 1 点能量。' },
        { poolId: 'mage_venom_sigils', name: '厄星符阵', type: '能力', cost: 0, icon: '☠️', val: 0, tags: ['虚弱'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['calamity'], rarity: '普通', art: 'assets/cards/art/mage/mage_stasis_hex_art_v1.webp', desc: '免费施加[虚弱]并抽 1 张牌。' },
        { poolId: 'mage_blood_orbit', name: '灼月星轨', type: '攻击', cost: 1, icon: '🔥', val: 9, tags: ['燃烧'], buildTags: ['calamity'], rarity: '稀有', art: 'assets/cards/art/mage/mage_omen_art_v1.webp', desc: '造成 9 点伤害并施加[燃烧]。' },
        { poolId: 'mage_bloodlet_omen', name: '断咒预兆', type: '能力', cost: 1, icon: '🌑', val: 0, tags: ['诅咒'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['calamity'], rarity: '稀有', art: 'assets/cards/art/mage/mage_curse_echo_art_v1.webp', desc: '施加[诅咒]并抽 1 张牌。' },
        { poolId: 'mage_echo_veil', name: '回声护幕', type: '防御', cost: 1, icon: '🛡️', val: 5, tags: ['回响'], rarity: '稀有', art: 'assets/cards/art/mage/mage_barrier_art_v1.webp', desc: '获得 5 点护盾，并让本牌再触发一次。' },
        { poolId: 'mage_void_dust', name: '衰星尘', type: '攻击', cost: 1, icon: '✦', val: 9, tags: ['虚弱'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['calamity'], rarity: '普通', art: 'assets/cards/art/mage/mage_omen_art_v1.webp', desc: '造成 9 点伤害，施加[虚弱]并抽 1 张牌。' },
        { poolId: 'mage_arcane_mark', name: '紫焰烙印', type: '能力', cost: 2, icon: '🔮', val: 3, tags: ['附魔', '易伤'], rarity: '稀有', energySink: { max: 2, enchantPerEnergy: 3 }, art: 'assets/cards/art/mage/mage_thunder_art_v1.webp', desc: '触发[附魔]并施加[易伤]。可额外消耗至多 2 点能量，每点使本次附魔提高 3。' },
        { poolId: 'mage_stasis_hex', name: '星缚咒印', type: '能力', cost: 2, icon: '⛓️', val: 0, tags: ['眩晕', '诅咒', '咏唱'], rarity: '史诗', art: 'assets/cards/art/mage/mage_void_art_v1.webp', desc: '施加[眩晕]与[诅咒]，并积累[咏唱]。' },
        { poolId: 'mage_exile_nova', name: '裂星禁术', type: '攻击', cost: 2, icon: '🌌', val: 17, tags: ['爆发'], rarity: '史诗', art: 'assets/cards/art/mage/mage_thunder_art_v1.webp', desc: '造成 17 点伤害并触发[爆发]。' }
    ],
    hero_archer: [
        { poolId: 'archer_aim', name: '风痕定弦', type: '能力', cost: 1, icon: '🎯', val: 9, tags: ['蓄力', '抽牌'], rarity: '稀有' },
        { poolId: 'archer_barrage', name: '逐风连矢', type: '攻击', cost: 1, icon: '💨', val: 4, tags: ['追击'], rarity: '稀有' },
        { poolId: 'archer_ready', name: '林风束羽', type: '能力', cost: 1, icon: '🪶', val: 8, tags: ['蓄力'], directEffects: { draw: true }, preserveDirectEffects: true, rarity: '稀有', desc: '获得 2 层风势并抽 1 张牌。' },
        { poolId: 'archer_step', name: '踏叶掠影', type: '能力', cost: 1, icon: '🥾', val: 5, tags: ['自然'], directEffects: { retain: true }, preserveDirectEffects: true, sidestepVal: 1, rarity: '普通', desc: '触发[自然]，获得 1 层[闪避]；打出后下回合回到手牌。' },
        { poolId: 'archer_shadow', name: '狩影穿枝', type: '攻击', cost: 2, icon: '🗡️', val: 10, tags: ['追击', '穿甲'], rarity: '稀有' },
        { poolId: 'archer_grove', name: '森冠齐射', type: '攻击', cost: 2, icon: '🏹', val: 7, tags: ['追击', '穿甲'], rarity: '史诗' },
        { poolId: 'archer_ambush', name: '森息伏击', type: '能力', cost: 0, icon: '🍃', val: 4, tags: ['蓄力', '销毁'], rarity: '普通' },
        { poolId: 'archer_hawkeye', name: '鹰眼贯枝', type: '攻击', cost: 2, icon: '🎯', val: 12, tags: ['蓄力', '穿甲'], rarity: '稀有' },
        { poolId: 'archer_rain', name: '回环箭雨', type: '攻击', cost: 2, icon: '🌧️', val: 6, tags: ['追击'], rarity: '史诗' },
        { poolId: 'archer_hidden_arrow', name: '回风藏箭', type: '能力', cost: 1, icon: '🪶', val: 6, tags: ['保留', '蓄力'], rarity: '稀有', art: 'assets/cards/art/archer/archer_shift_art_v1.webp', desc: '获得风势，附带[保留]与[蓄力]。' },
        { poolId: 'archer_exile_shot', name: '逐影离弦', type: '攻击', cost: 1, icon: '🏹', val: 9, tags: ['放逐'], buildTags: ['exile'], rarity: '稀有', art: 'assets/cards/art/archer/archer_shadow_art_v1.webp', desc: '造成 9 点伤害并[放逐]；进入放逐区时造成 5 点[流动伤害]。' },
        { poolId: 'archer_cycle_branch', name: '轮枝归矢', type: '攻击', cost: 1, icon: '🧭', val: 8, tags: ['回收'], buildTags: ['exile'], rarity: '稀有', art: 'assets/cards/art/archer/archer_rain_art_v1.webp', desc: '造成 8 点伤害，并[回收] 1 张放逐区牌洗入牌库；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_pick_feather', name: '拾羽连步', type: '能力', cost: 1, icon: '🍃', val: 0, tags: ['回收'], buildTags: ['exile'], rarity: '稀有', art: 'assets/cards/art/archer/archer_step_art_v1.webp', desc: '[回收] 1 张墓地牌；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_venom_flurry', name: '翠毒连矢', type: '攻击', cost: 1, icon: '☠️', val: 10, tags: ['剧毒', '虚弱'], buildTags: ['venom'], rarity: '普通', art: 'assets/cards/art/archer/archer_ambush_art_v1.webp', desc: '造成 10 点伤害，施加[剧毒]与[虚弱]。' },
        { poolId: 'archer_ember_feather', name: '轻羽连射', type: '攻击', cost: 1, icon: '🪶', val: 5, tags: ['追击'], rarity: '普通', art: 'assets/cards/art/archer/archer_ember_feather_art_v1.png', desc: '造成 5 点伤害并触发[追击]。' },
        { poolId: 'archer_soul_return', name: '林魂招矢', type: '能力', cost: 1, icon: '🏮', val: 0, tags: ['回收'], buildTags: ['exile'], rarity: '稀有', art: 'assets/cards/art/archer/archer_ready_art_v1.webp', desc: '[回收] 1 张放逐区牌到手牌；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_red_mark', name: '赤痕连矢', type: '攻击', cost: 1, icon: '🩸', val: 10, tags: ['出血', '追击', '虚弱'], buildTags: ['venom'], rarity: '普通', art: 'assets/cards/art/archer/archer_blood_release_art_v1.webp', desc: '造成 10 点伤害，附带[出血]、[追击]与[虚弱]。' },
        { poolId: 'archer_blood_release', name: '赤痕裂放', type: '攻击', cost: 1, icon: '🩸', val: 11, tags: ['放血'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['venom'], rarity: '稀有', art: 'assets/cards/art/archer/archer_ambush_art_v1.webp', desc: '造成 11 点伤害，触发[放血]并抽 1 张牌。' },
        { poolId: 'archer_exile_storm', name: '逐风绝矢', type: '攻击', cost: 2, icon: '💨', val: 10, tags: ['放逐', '追击'], buildTags: ['exile', 'gale'], rarity: '史诗', art: 'assets/cards/art/archer/archer_rain_art_v1.webp', desc: '造成 10 点伤害，触发[追击]后[放逐]；进入放逐区时造成 5 点[流动伤害]。' }
    ]
};

const CARD_POOL_BY_ID = {
    pool_warrior: CHARACTER_CARD_POOLS.hero_warrior,
    pool_mage: CHARACTER_CARD_POOLS.hero_mage,
    pool_archer: CHARACTER_CARD_POOLS.hero_archer
};

const BUILD_DIRECTIONS = {
    hero_warrior: {
        oathblade: { name: '圣剑反击', desc: '护盾、反击与圣剑互相放大，是当前勇者的默认成长方向。', triggerTags: ['圣剑', '反击', '庇护', '荆棘', '保留', '重击'] },
        execution: { name: '处刑连斩', desc: '用易伤、穿甲与连击制造短窗口爆发，减少对护盾堆叠的依赖。', triggerTags: ['易伤', '穿甲', '连击', '眩晕'] },
        bloodoath: { name: '血誓魔剑', desc: '承受实际失血来淬炼魔剑，并用已损生命、出血与吸血在危险血线中换取爆发。', triggerTags: ['血誓', '吸血', '出血', '放血'] }
    },
    hero_mage: {
        chant: { name: '星火咏唱', desc: '积累咏唱后用爆发牌收束。', triggerTags: ['咏唱', '爆发', '穿甲', '充能'] },
        mirror: { name: '镜像回路', desc: '安排牌序，先打关键牌，再用回响或复刻把它回放。', triggerTags: ['回响', '复刻', '抽牌', '充能'] },
        calamity: { name: '灾厄术士', desc: '堆叠多种负面状态，通过状态数量和持续压制获胜。', triggerTags: ['诅咒', '虚弱', '易伤', '燃烧', '眩晕'] }
    },
    hero_archer: {
        gale: { name: '逐风连矢', desc: '连续打出攻击牌，用追击和低费箭术把攻势串起来。', triggerTags: ['追击', '穿甲', '销毁', '保留'] },
        venom: { name: '猎毒陷袭', desc: '用剧毒、出血和放血形成延迟爆发。', triggerTags: ['剧毒', '出血', '放血', '虚弱'] },
        exile: { name: '放逐游侠', desc: '让牌进入墓地、放逐区并被回收，靠牌区流动造成持续伤害；少量桥牌可衔接毒血或风势。', triggerTags: ['放逐', '回收', '销毁'] }
    }
};

const COMMON_ROLE_CARD_TAGS = ['抽牌', '充能', '保留', '重置', '销毁'];
const ROLE_ALLOWED_CARD_TAGS = {
    hero_warrior: new Set([
        ...COMMON_ROLE_CARD_TAGS,
        '血祭', '血誓', '狂热', '附魔', '庇护', '反击', '吸血', '治愈', '出血', '放血',
        '重击', '穿甲', '圣剑', '连击', '易伤', '虚弱', '眩晕', '荆棘'
    ]),
    hero_mage: new Set([
        ...COMMON_ROLE_CARD_TAGS,
        '附魔', '庇护', '回响', '复刻', '燃烧', '眩晕', '诅咒',
        '穿甲', '咏唱', '爆发', '易伤', '虚弱', '治愈'
    ]),
    hero_archer: new Set([
        ...COMMON_ROLE_CARD_TAGS,
        '回收', '放逐', '剧毒', '出血', '放血', '穿甲',
        '蓄力', '自然', '闪避', '追击', '易伤', '虚弱', '眩晕'
    ])
};
const ROLE_CARD_TAG_POLICY_DROPS = [];

function applyRoleCardTagPolicy(roleId, card) {
    const allowedTags = ROLE_ALLOWED_CARD_TAGS[roleId];
    if (!allowedTags || !Array.isArray(card?.tags)) return card;
    const originalLength = card.tags.length;
    const droppedTags = card.tags.filter(tag => !allowedTags.has(tag));
    if (droppedTags.length) {
        ROLE_CARD_TAG_POLICY_DROPS.push({
            roleId,
            cardId: card.poolId || card.specialId || card.id || card.name,
            cardName: card.name,
            tags: droppedTags
        });
    }
    card.tags = card.tags.filter(tag => allowedTags.has(tag));
    if (card.tags.length !== originalLength) delete card.desc;
    return card;
}

const CARD_BUILD_TAGS_BY_ID = {
    warrior_charge: ['oathblade'],
    warrior_oath: ['oathblade'],
    warrior_wall: ['oathblade'],
    warrior_follow: ['oathblade'],
    warrior_guard: ['oathblade'],
    warrior_flash: ['oathblade'],
    warrior_crown_riposte: ['oathblade'],
    warrior_release: ['oathblade'],
    warrior_scar: ['oathblade'],
    warrior_thorn_charge: ['oathblade'],
    warrior_banner_guard: ['oathblade'],
    warrior_oath_retainer: ['oathblade'],
    warrior_soul_oath: ['oathblade'],
    warrior_blood_vow_slash: ['bloodoath'],
    warrior_magic_sword: ['bloodoath'],
    warrior_blood_wall: ['bloodoath'],
    warrior_bleed_edge: ['bloodoath'],
    warrior_bloodlet_cleave: ['bloodoath'],
    warrior_venom_scar: ['execution'],
    warrior_frenzy_cleave: ['execution'],
    warrior_exile_judgement: ['execution'],
    warrior_flaw_mark: ['execution'],
    warrior_duel_cut: ['execution'],
    warrior_execute_window: ['execution'],
    warrior_blood_drive: ['bloodoath'],
    warrior_lifebite: ['bloodoath'],
    warrior_blood_oath_finish: ['bloodoath'],
    mage_flame: ['chant', 'calamity'],
    mage_chant: ['chant'],
    mage_spark: ['chant', 'calamity'],
    mage_barrier: ['chant'],
    mage_void: ['chant', 'mirror'],
    mage_cascade: ['chant', 'mirror'],
    mage_thunder: ['chant', 'mirror'],
    mage_omen: ['chant'],
    mage_loop: ['chant'],
    mage_star_copy: ['mirror'],
    mage_ember_flow: ['chant', 'calamity'],
    mage_venom_sigils: ['calamity'],
    mage_blood_orbit: ['calamity'],
    mage_bloodlet_omen: ['calamity'],
    mage_echo_veil: ['mirror'],
    mage_void_dust: ['calamity'],
    mage_arcane_mark: ['chant', 'calamity'],
    mage_stasis_hex: ['calamity'],
    mage_exile_nova: ['chant'],
    archer_aim: ['gale'],
    archer_barrage: ['gale'],
    archer_ready: ['gale'],
    archer_step: ['gale'],
    archer_shadow: ['gale'],
    archer_grove: ['gale'],
    archer_ambush: ['gale'],
    archer_hawkeye: ['gale'],
    archer_rain: ['gale'],
    archer_hidden_arrow: ['gale'],
    archer_ember_feather: ['gale'],
    archer_venom_flurry: ['venom'],
    archer_red_mark: ['venom'],
    archer_blood_release: ['venom'],
    archer_exile_shot: ['exile'],
    archer_cycle_branch: ['exile'],
    archer_pick_feather: ['exile'],
    archer_soul_return: ['exile'],
    archer_exile_storm: ['exile'],
    s_shield: ['oathblade'],
    s_thorns: ['oathblade'],
    a_syn_sword: ['execution'],
    a_syn_array: ['oathblade'],
    a_syn_blood: ['bloodoath'],
    w_counter_crown: ['oathblade'],
    w_bastion_prayer: ['oathblade'],
    w_thorn_judgement: ['oathblade'],
    w_oath_fortress: ['oathblade'],
    w_last_verdict: ['execution'],
    s_magic: ['mirror'],
    s_pierce: ['chant'],
    a_syn_magic: ['mirror'],
    m_chant_singularity: ['chant'],
    m_status_supernova: ['calamity', 'chant'],
    m_echo_archive: ['mirror'],
    m_ember_orbit: ['calamity'],
    m_forbidden_comet: ['chant'],
    m_curse_gravity: ['calamity'],
    m_blood_moon_rite: ['calamity'],
    s_exhaust: ['exile'],
    s_poison: ['venom'],
    a_syn_poison: ['venom'],
    s_energy: ['gale'],
    a_wind_dance: ['gale'],
    a_gale_verdict: ['gale'],
    a_red_rain: ['venom'],
    a_bloodlet_gale: ['venom'],
    a_green_resonance: ['exile', 'gale'],
    a_skyfall_shot: ['exile']
};

const BUILD_EXPANSION_CARDS = {
    hero_warrior: [
        { poolId: 'warrior_crest_guard', name: '圣徽举盾', type: '防御', cost: 1, icon: '🔰', val: 9, tags: ['庇护', '保留'], buildTags: ['oathblade'], rarity: '普通', frameTheme: 'warrior', desc: '获得 9 点护盾，触发[庇护]并[保留]。' },
        { poolId: 'warrior_oath_charge', name: '王誓蓄锋', type: '防御', cost: 1, icon: '📜', val: 10, tags: ['保留'], buildTags: ['oathblade'], rarity: '稀有', frameTheme: 'warrior', desc: '获得 10 点护盾，打出后下回合回到手牌。' },
        { poolId: 'warrior_rift_probe', name: '裂隙点刺', type: '攻击', cost: 0, icon: '🗡️', val: 5, tags: ['易伤', '销毁'], buildTags: ['execution'], rarity: '普通', frameTheme: 'warrior', desc: '造成 5 点伤害并施加[易伤]，随后[销毁]。' },
        { poolId: 'warrior_disarm_press', name: '锁腕断誓', type: '能力', cost: 0, icon: '⛓️', val: 0, tags: ['眩晕'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['execution'], rarity: '稀有', frameTheme: 'warrior', desc: '免费施加[眩晕]并抽 1 张牌。' },
        { poolId: 'warrior_heart_probe', name: '穿心试探', type: '攻击', cost: 2, icon: '🎯', val: 16, tags: ['穿甲', '虚弱'], buildTags: ['execution'], rarity: '稀有', frameTheme: 'warrior', desc: '造成 16 点[穿甲]伤害并施加[虚弱]。' },
        { poolId: 'warrior_lone_double', name: '孤锋二连', type: '攻击', cost: 2, icon: '⚔️', val: 10, tags: ['连击', '重击'], buildTags: ['execution'], rarity: '稀有', frameTheme: 'warrior', desc: '造成 10 点[重击]伤害；若本回合已出牌，触发[连击]。' },
        { poolId: 'warrior_break_form', name: '破阵换位', type: '能力', cost: 0, icon: '🚩', val: 0, tags: ['重置', '销毁'], buildTags: ['execution'], rarity: '稀有', frameTheme: 'warrior', desc: '自动丢弃除本牌外的未封印手牌并抽取等量的牌，随后[销毁]。' },
        { poolId: 'warrior_steel_pressure', name: '鸣钢镇压', type: '攻击', cost: 2, icon: '🔨', val: 14, tags: ['穿甲', '虚弱'], buildTags: ['execution'], rarity: '稀有', frameTheme: 'warrior', desc: '造成 14 点[穿甲]伤害并施加[虚弱]。' },
        { poolId: 'warrior_execute_step', name: '断刑步', type: '能力', cost: 0, icon: '👣', val: 0, tags: ['易伤', '销毁'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['execution'], rarity: '普通', frameTheme: 'warrior', desc: '免费施加[易伤]并抽 1 张牌，随后[销毁]。' },
        { poolId: 'warrior_vein_oath', name: '裂脉誓印', type: '能力', cost: 1, icon: '🩸', val: 0, tags: ['血誓'], bloodOathCost: 4, bloodDebtBleed: 6, buildTags: ['bloodoath'], rarity: '普通', frameTheme: 'warrior', desc: '失去 4 点生命并施加 6 层出血。' },
        { poolId: 'warrior_blood_guard_step', name: '偿血追命', type: '攻击', cost: 1, icon: '🩸', val: 9, tags: ['血誓', '吸血'], lifestealRatio: 0.5, bloodOathMissingRatio: 0.55, bloodDebtWeak: 1, buildTags: ['bloodoath'], rarity: '稀有', frameTheme: 'warrior', desc: '造成 9 点伤害；追加已损生命 55% 的伤害；施加 1 层[虚弱]；按一半伤害[吸血]。' },
        { poolId: 'warrior_boiling_drive', name: '沸血突进', type: '攻击', cost: 1, icon: '🔥', val: 8, tags: ['血誓'], bloodOathCost: 4, bloodOathMissingRatio: 0.75, buildTags: ['bloodoath'], rarity: '稀有', frameTheme: 'warrior', desc: '失去 4 点生命；造成 8 点伤害；追加已损生命 75% 的伤害。' },
        { poolId: 'warrior_red_return', name: '残红回锋', type: '攻击', cost: 1, icon: '💍', val: 7, tags: ['吸血', '血誓'], lifestealRatio: 0.5, bloodOathMissingRatio: 0.45, buildTags: ['bloodoath'], rarity: '普通', frameTheme: 'warrior', desc: '造成 7 点伤害；追加已损生命 45% 的伤害；按一半伤害[吸血]。' },
        { poolId: 'warrior_blood_tide', name: '血潮续斩', type: '攻击', cost: 2, icon: '🌊', val: 13, tags: ['放血', '血誓'], bloodOathCost: 4, bloodOathMissingRatio: 0.7, bloodDebtWeak: 2, buildTags: ['bloodoath'], rarity: '史诗', frameTheme: 'warrior', desc: '失去 4 点生命；造成 13 点伤害；追加已损生命 70% 的伤害；施加 2 层[虚弱]并触发[放血]。' },
        { poolId: 'warrior_open_vein', name: '禁誓开脉', type: '能力', cost: 0, icon: '🕯️', val: 0, tags: ['血誓', '销毁'], bloodOathCost: 6, directEffects: { energy: true }, buildTags: ['bloodoath'], rarity: '普通', frameTheme: 'warrior', desc: '失去 6 点生命并回复 1 点能量，随后[销毁]。' },
        { poolId: 'warrior_life_contract', name: '回生血契', type: '能力', cost: 1, icon: '📖', val: 0, tags: ['治愈'], healValue: 10, directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['bloodoath'], rarity: '稀有', frameTheme: 'warrior', desc: '回复 10 点生命并抽 1 张牌。' },
        { poolId: 'warrior_debt_scar', name: '血痕留锋', type: '攻击', cost: 1, icon: '🩸', val: 7, tags: ['血誓'], bloodOathMissingRatio: 0.5, buildTags: ['bloodoath'], rarity: '普通', frameTheme: 'warrior', desc: '造成 7 点伤害；追加已损生命 50% 的伤害。' },
        { poolId: 'warrior_oath_pressure', name: '誓血缚阵', type: '能力', cost: 1, icon: '🚩', val: 0, tags: ['血誓'], bloodOathCost: 4, bloodDebtStun: 1, buildTags: ['bloodoath'], rarity: '稀有', frameTheme: 'warrior', desc: '失去 4 点生命并眩晕敌人。' },
        { poolId: 'warrior_martyr_cut', name: '殉誓斩', type: '攻击', cost: 0, icon: '🗡️', val: 6, tags: ['血誓', '销毁'], bloodOathCost: 3, bloodOathMissingRatio: 0.6, buildTags: ['bloodoath'], rarity: '普通', frameTheme: 'warrior', desc: '失去 3 点生命；造成 6 点伤害；追加已损生命 60% 的伤害，随后[销毁]。' },
        { poolId: 'warrior_devour_finish', name: '噬痕终击', type: '攻击', cost: 3, icon: '🩸', val: 18, tags: ['吸血', '血誓'], lifestealRatio: 0.75, bloodOathMissingRatio: 1.05, buildTags: ['bloodoath'], rarity: '史诗', frameTheme: 'warrior', desc: '造成 18 点伤害；追加已损生命 105% 的伤害；按 75% 伤害[吸血]。' },
        { poolId: 'warrior_oath_watch', name: '守誓待击', type: '能力', cost: 0, icon: '👁️', val: 0, tags: ['反击', '销毁'], buildTags: ['oathblade'], rarity: '普通', frameTheme: 'warrior', desc: '免费进入[反击]姿态，使用后[销毁]。' },
        { poolId: 'warrior_bastion_ledger', name: '垒誓残页', type: '能力', cost: 1, icon: '📒', val: 0, tags: ['庇护', '抽牌'], buildTags: ['oathblade'], rarity: '稀有', frameTheme: 'warrior', desc: '获得[庇护]并[抽牌]。' },
        { poolId: 'warrior_saintbreaker', name: '圣痕破势', type: '攻击', cost: 2, icon: '✨', val: 11, tags: ['圣剑', '易伤'], buildTags: ['oathblade', 'execution'], rarity: '稀有', frameTheme: 'warrior', desc: '造成 11 点[圣剑]伤害并施加[易伤]。' },
        { poolId: 'warrior_oath_reversal', name: '誓壁反转', type: '防御', cost: 2, icon: '🔁', val: 12, tags: ['反击', '重置'], buildTags: ['oathblade'], rarity: '史诗', frameTheme: 'warrior', desc: '获得 16 点护盾，进入[反击]并[重置]手牌。' },
        { poolId: 'warrior_verdict_feint', name: '裁决虚锋', type: '攻击', cost: 0, icon: '⚖️', val: 4, tags: ['连击', '易伤', '销毁'], buildTags: ['execution'], rarity: '普通', frameTheme: 'warrior', desc: '免费造成 4 点伤害并施加[易伤]，随后[销毁]。' },
        { poolId: 'warrior_gap_finder', name: '窥隙烙印', type: '攻击', cost: 1, icon: '🔎', val: 7, tags: ['穿甲', '抽牌'], buildTags: ['execution'], rarity: '稀有', frameTheme: 'warrior', desc: '造成 7 点[穿甲]伤害并[抽牌]。' },
        { poolId: 'warrior_silent_lunge', name: '默步突刺', type: '攻击', cost: 1, icon: '🤫', val: 10, tags: ['穿甲', '眩晕'], buildTags: ['execution'], rarity: '稀有', frameTheme: 'warrior', desc: '造成 10 点[穿甲]伤害并[眩晕]。' },
        { poolId: 'warrior_scaffold_cut', name: '刑架削锋', type: '攻击', cost: 2, icon: '⛓️', val: 12, tags: ['重击', '虚弱'], buildTags: ['execution', 'bloodoath'], rarity: '稀有', frameTheme: 'warrior', desc: '造成 12 点[重击]伤害并施加[虚弱]。' },
        { poolId: 'warrior_final_measure', name: '终裁量尺', type: '攻击', cost: 2, icon: '📏', val: 17, tags: ['穿甲', '重击'], buildTags: ['execution'], rarity: '史诗', frameTheme: 'warrior', desc: '造成 17 点[穿甲][重击]伤害。' },
        { poolId: 'warrior_crimson_pause', name: '猩红喘息', type: '能力', cost: 0, icon: '🫀', val: 0, tags: ['治愈', '保留'], healValue: 8, directEffects: { draw: true, retain: true }, preserveDirectEffects: true, buildTags: ['bloodoath'], rarity: '普通', frameTheme: 'warrior', desc: '回复 8 点生命并抽 1 张牌。下回合回到手牌。' }
    ],
    hero_mage: [
        { poolId: 'mage_star_precharge', name: '星核预充', type: '能力', cost: 1, icon: '🔮', val: 0, tags: ['咏唱', '充能', '庇护'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['chant'], rarity: '普通', frameTheme: 'mage', desc: '积累[咏唱]、回复能量并抽 1 张牌。' },
        { poolId: 'mage_radiant_law', name: '辉烬爆律', type: '攻击', cost: 2, icon: '🔥', val: 14, tags: ['爆发', '穿甲'], buildTags: ['chant'], rarity: '稀有', frameTheme: 'mage', desc: '造成 14 点[穿甲]伤害，附带[爆发]。' },
        { poolId: 'mage_star_ward', name: '残星护文', type: '防御', cost: 1, icon: '🛡️', val: 12, tags: ['咏唱', '保留'], buildTags: ['chant'], rarity: '普通', frameTheme: 'mage', desc: '获得 12 点护盾，积累[咏唱]并[保留]。' },
        { poolId: 'mage_countdown', name: '聚焰读秒', type: '能力', cost: 2, icon: '⏳', val: 3, tags: ['咏唱', '附魔'], buildTags: ['chant'], rarity: '稀有', energySink: { max: 2, enchantPerEnergy: 3 }, frameTheme: 'mage', desc: '积累[咏唱]并触发[附魔]。可额外消耗至多 2 点能量，每点使本次附魔提高 3。' },
        { poolId: 'mage_star_surge', name: '星涌短波', type: '攻击', cost: 1, icon: '⚡', val: 10, tags: ['爆发', '充能'], buildTags: ['chant'], rarity: '普通', frameTheme: 'mage', desc: '造成 10 点伤害，附带[爆发]与[充能]。' },
        { poolId: 'mage_solar_refill', name: '恒星回填', type: '能力', cost: 1, icon: '🌞', val: 0, tags: ['咏唱', '抽牌', '庇护'], buildTags: ['chant'], rarity: '史诗', frameTheme: 'mage', desc: '积累[咏唱]、[抽牌]并获得[庇护]。' },
        { poolId: 'mage_mirror_trial', name: '镜页摹写', type: '能力', cost: 1, icon: '🪞', val: 0, tags: ['复刻'], directEffects: { draw: true }, buildTags: ['mirror'], rarity: '普通', frameTheme: 'mage', desc: '复制上一张非复刻牌，并抽 1 张牌。' },
        { poolId: 'mage_twin_spark', name: '双生火花', type: '攻击', cost: 1, icon: '🔥', val: 6, tags: ['回响'], buildTags: ['mirror', 'calamity'], rarity: '稀有', frameTheme: 'mage', desc: '造成 6 点伤害，并让本牌再触发一次。' },
        { poolId: 'mage_echo_shift', name: '回声换位', type: '能力', cost: 1, icon: '🔁', val: 0, tags: ['重置'], directEffects: { energy: true }, preserveDirectEffects: true, buildTags: ['mirror'], rarity: '稀有', frameTheme: 'mage', desc: '重置手牌，并回复 1 点能量。' },
        { poolId: 'mage_reflect_veil', name: '倒影护幕', type: '防御', cost: 1, icon: '🛡️', val: 8, tags: ['回响'], buildTags: ['mirror'], rarity: '普通', frameTheme: 'mage', desc: '获得 8 点护盾，并让本牌再触发一次。' },
        { poolId: 'mage_mirror_array', name: '镜阵留声', type: '能力', cost: 2, icon: '📜', val: 0, tags: ['复刻'], directEffects: { retain: true }, buildTags: ['mirror'], rarity: '稀有', frameTheme: 'mage', desc: '复制上一张非复刻牌，打出后下回合回到手牌。' },
        { poolId: 'mage_aftertone_flow', name: '余音导流', type: '能力', cost: 1, icon: '🎼', val: 0, tags: ['充能'], buildTags: ['mirror'], rarity: '普通', frameTheme: 'mage', desc: '回复 1 点能量。' },
        { poolId: 'mage_copy_pierce', name: '复写残响', type: '攻击', cost: 2, icon: '🌩️', val: 14, tags: ['回响', '穿甲'], buildTags: ['mirror'], rarity: '史诗', frameTheme: 'mage', desc: '造成 14 点穿甲伤害，并让本牌再触发一次。' },
        { poolId: 'mage_transcribe_ring', name: '抄录星环', type: '能力', cost: 1, icon: '🔮', val: 0, tags: ['复刻'], directEffects: { energy: true }, buildTags: ['mirror'], rarity: '稀有', frameTheme: 'mage', desc: '复制上一张非复刻牌，并回复 1 点能量。' },
        { poolId: 'mage_double_archive', name: '双页归档', type: '能力', cost: 1, icon: '📚', val: 0, tags: ['复刻'], buildTags: ['mirror'], rarity: '史诗', frameTheme: 'mage', desc: '复制上一张非复刻牌。' },
        { poolId: 'mage_corrupt_mist', name: '蚀星雾', type: '能力', cost: 1, icon: '☠️', val: 0, tags: ['诅咒'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['calamity'], rarity: '普通', frameTheme: 'mage', desc: '施加[诅咒]并抽 1 张牌。' },
        { poolId: 'mage_frost_hex', name: '霜咒压迫', type: '攻击', cost: 1, icon: '🌑', val: 9, tags: ['虚弱', '诅咒'], buildTags: ['calamity'], rarity: '稀有', frameTheme: 'mage', desc: '造成 9 点伤害，施加[虚弱]与[诅咒]。' },
        { poolId: 'mage_sick_star', name: '坠星病灶', type: '攻击', cost: 1, icon: '☄️', val: 8, tags: ['易伤'], buildTags: ['calamity'], rarity: '稀有', frameTheme: 'mage', desc: '造成 8 点伤害并施加[易伤]。' },
        { poolId: 'mage_mute_sand', name: '禁言星砂', type: '能力', cost: 1, icon: '⛓️', val: 0, tags: ['眩晕', '虚弱'], buildTags: ['calamity'], rarity: '史诗', frameTheme: 'mage', desc: '施加[眩晕]与[虚弱]。' },
        { poolId: 'mage_decay_wire', name: '腐辉导线', type: '能力', cost: 0, icon: '🧪', val: 0, tags: ['诅咒'], buildTags: ['calamity'], rarity: '普通', frameTheme: 'mage', desc: '免费施加[诅咒]。' },
        { poolId: 'mage_bad_omen_chain', name: '厄兆连珠', type: '攻击', cost: 1, icon: '🔥', val: 8, tags: ['燃烧', '虚弱'], buildTags: ['calamity'], rarity: '稀有', frameTheme: 'mage', desc: '造成 8 点伤害，施加[燃烧]与[虚弱]。' },
        { poolId: 'mage_dark_moon_scar', name: '暗月留疤', type: '能力', cost: 0, icon: '🌙', val: 0, tags: ['易伤'], buildTags: ['calamity'], rarity: '稀有', frameTheme: 'mage', desc: '免费施加[易伤]。' },
        { poolId: 'mage_withered_stars', name: '群星枯萎', type: '攻击', cost: 2, icon: '✦', val: 12, tags: ['诅咒', '虚弱'], buildTags: ['calamity'], rarity: '史诗', frameTheme: 'mage', desc: '造成 12 点伤害，施加[诅咒]与[虚弱]。' },
        { poolId: 'mage_calamity_tune', name: '厄星调律', type: '攻击', cost: 1, icon: '💠', val: 10, tags: ['诅咒'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['calamity'], rarity: '稀有', frameTheme: 'mage', desc: '造成 10 点伤害，施加[诅咒]并抽 1 张牌。' },
        { poolId: 'mage_lantern_chant', name: '灯火续咏', type: '能力', cost: 0, icon: '🏮', val: 8, tags: ['咏唱', '庇护'], buildTags: ['chant'], rarity: '普通', frameTheme: 'mage', desc: '免费积累[咏唱]并获得 8 点[庇护]。' },
        { poolId: 'mage_orbit_lock', name: '星轨锁定', type: '能力', cost: 1, icon: '🎯', val: 4, tags: ['咏唱', '易伤'], buildTags: ['chant'], rarity: '稀有', frameTheme: 'mage', desc: '积累[咏唱]并施加[易伤]。' },
        { poolId: 'mage_reflection_note', name: '倒影批注', type: '能力', cost: 0, icon: '📝', val: 0, tags: ['复刻', '销毁'], buildTags: ['mirror'], rarity: '普通', frameTheme: 'mage', desc: '免费复制上一张非复刻牌，打出后销毁。' },
        { poolId: 'mage_echo_index', name: '回声页标', type: '能力', cost: 1, icon: '🔖', val: 0, tags: ['抽牌'], buildTags: ['mirror'], rarity: '普通', frameTheme: 'mage', desc: '抽 1 张牌。' },
        { poolId: 'mage_glass_recursion', name: '镜璃递归', type: '攻击', cost: 1, icon: '💠', val: 8, tags: ['复刻', '穿甲'], buildTags: ['mirror'], rarity: '稀有', frameTheme: 'mage', desc: '造成 8 点穿甲伤害，并复制上一张非复刻牌。' },
        { poolId: 'mage_second_hand', name: '逆时针护刻', type: '防御', cost: 2, icon: '🕰️', val: 5, tags: ['回响'], buildTags: ['mirror'], rarity: '史诗', frameTheme: 'mage', desc: '获得 5 点护盾，并让本牌再触发一次。' }
    ],
    hero_archer: [
        { poolId: 'archer_leaf_sidestep', name: '踏叶侧射', type: '攻击', cost: 1, icon: '🍃', val: 6, tags: ['追击', '自然'], buildTags: ['gale'], rarity: '普通', frameTheme: 'archer', desc: '造成 6 点伤害，触发[追击]与[自然]。' },
        { poolId: 'archer_wind_string', name: '风誓扣弦', type: '能力', cost: 1, icon: '🏹', val: 8, tags: ['蓄力'], directEffects: { energy: true }, preserveDirectEffects: true, buildTags: ['gale'], rarity: '普通', frameTheme: 'archer', desc: '获得 2 层风势并回复 1 点能量。' },
        { poolId: 'archer_backstep', name: '回风掠步', type: '防御', cost: 1, icon: '🪶', val: 8, tags: ['自然', '重置'], buildTags: ['gale'], rarity: '稀有', frameTheme: 'archer', desc: '获得 8 点护盾，触发[自然]并[重置]手牌。' },
        { poolId: 'archer_quick_corridor', name: '急羽破廊', type: '攻击', cost: 2, icon: '💨', val: 11, tags: ['追击', '穿甲'], buildTags: ['gale'], rarity: '稀有', frameTheme: 'archer', desc: '造成 11 点[穿甲]伤害，附带[追击]。' },
        { poolId: 'archer_green_fang', name: '青牙初矢', type: '攻击', cost: 0, icon: '☠️', val: 6, tags: ['剧毒', '销毁'], buildTags: ['venom'], rarity: '普通', frameTheme: 'archer', desc: '造成 6 点伤害，施加[剧毒]后[销毁]。' },
        { poolId: 'archer_poison_rain', name: '毒雨留痕', type: '攻击', cost: 1, icon: '🌧️', val: 8, tags: ['剧毒'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['venom'], rarity: '稀有', frameTheme: 'archer', desc: '造成 8 点伤害，施加[剧毒]并抽 1 张牌。' },
        { poolId: 'archer_hook_sinew', name: '裂筋倒钩', type: '攻击', cost: 1, icon: '🪝', val: 9, tags: ['放血', '虚弱'], buildTags: ['venom'], rarity: '稀有', frameTheme: 'archer', desc: '造成 9 点伤害，触发[放血]并施加[虚弱]。' },
        { poolId: 'archer_spore_shadow', name: '孢影伏击', type: '能力', cost: 0, icon: '🍄', val: 0, tags: ['剧毒'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['venom'], rarity: '普通', frameTheme: 'archer', desc: '免费施加[剧毒]并抽 1 张牌。' },
        { poolId: 'archer_blood_feather', name: '血羽归魂', type: '能力', cost: 1, icon: '🩸', val: 0, tags: ['出血', '回收'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['venom', 'exile'], rarity: '史诗', frameTheme: 'archer', desc: '施加[出血]，回收 1 张墓地牌并抽 1 张牌。' },
        { poolId: 'archer_snake_eye', name: '蛇瞳烙印', type: '能力', cost: 0, icon: '🐍', val: 0, tags: ['易伤'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['venom'], rarity: '稀有', frameTheme: 'archer', desc: '免费施加[易伤]并抽 1 张牌。' },
        { poolId: 'archer_red_tide_bow', name: '赤潮弦', type: '攻击', cost: 1, icon: '🏹', val: 9, tags: ['出血'], buildTags: ['venom'], rarity: '普通', frameTheme: 'archer', desc: '造成 9 点伤害并施加[出血]。' },
        { poolId: 'archer_throat_poison', name: '森毒锁喉', type: '攻击', cost: 1, icon: '☠️', val: 10, tags: ['剧毒'], buildTags: ['venom'], rarity: '稀有', frameTheme: 'archer', desc: '造成 10 点伤害并施加[剧毒]。' },
        { poolId: 'archer_pulse_burst', name: '残脉连矢', type: '攻击', cost: 1, icon: '🩸', val: 7, tags: ['放血'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['venom'], rarity: '普通', frameTheme: 'archer', desc: '造成 7 点伤害，触发[放血]并抽 1 张牌。' },
        { poolId: 'archer_poison_step', name: '毒荆护步', type: '防御', cost: 1, icon: '🥾', val: 13, tags: ['虚弱'], buildTags: ['venom'], rarity: '稀有', frameTheme: 'archer', desc: '获得 13 点护盾并施加[虚弱]。' },
        { poolId: 'archer_rotten_net', name: '腐叶陷网', type: '能力', cost: 1, icon: '🕸️', val: 0, tags: ['剧毒', '眩晕'], buildTags: ['venom'], rarity: '史诗', frameTheme: 'archer', desc: '施加[剧毒]并[眩晕]。' },
        { poolId: 'archer_redline_hunt', name: '赤线追猎', type: '攻击', cost: 1, icon: '🧵', val: 10, tags: ['出血', '易伤'], buildTags: ['venom'], rarity: '普通', frameTheme: 'archer', desc: '造成 10 点伤害，施加[出血]与[易伤]。' },
        { poolId: 'archer_bitter_vine', name: '苦藤攀附', type: '能力', cost: 1, icon: '🌿', val: 0, tags: ['剧毒', '充能'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['venom'], rarity: '稀有', frameTheme: 'archer', desc: '施加[剧毒]、回复能量并抽 1 张牌。' },
        { poolId: 'archer_skin_splitter', name: '裂肤箭', type: '攻击', cost: 1, icon: '🩸', val: 9, tags: ['出血', '穿甲'], buildTags: ['venom'], rarity: '稀有', frameTheme: 'archer', desc: '造成 9 点[穿甲]伤害并施加[出血]。' },
        { poolId: 'archer_venom_blood_shift', name: '毒血换羽', type: '能力', cost: 1, icon: '🪶', val: 0, tags: ['放血', '充能'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['venom'], rarity: '稀有', frameTheme: 'archer', desc: '触发[放血]、回复能量并抽 1 张牌。' },
        { poolId: 'archer_green_mist_end', name: '绿雾终幕', type: '攻击', cost: 2, icon: '☠️', val: 14, tags: ['剧毒', '放血', '虚弱'], buildTags: ['venom'], rarity: '史诗', frameTheme: 'archer', desc: '造成 14 点伤害，施加[剧毒]与[虚弱]并触发[放血]。' },
        { poolId: 'archer_returning_feather', name: '归羽刃', type: '攻击', cost: 1, icon: '🪶', val: 9, tags: ['放逐'], buildTags: ['exile'], rarity: '普通', frameTheme: 'archer', desc: '造成 9 点伤害后[放逐]；进入放逐区时造成 5 点[流动伤害]。' },
        { poolId: 'archer_empty_string', name: '空弦匿羽', type: '能力', cost: 0, icon: '🏹', val: 0, tags: ['放逐'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['exile'], rarity: '普通', frameTheme: 'archer', desc: '自身[放逐]并抽 1 张牌，进入放逐区时造成 5 点[流动伤害]。' },
        { poolId: 'archer_outerwood_recall', name: '林外归魂', type: '能力', cost: 0, icon: '🏮', val: 0, tags: ['回收'], buildTags: ['exile'], rarity: '稀有', frameTheme: 'archer', desc: '[回收] 1 张放逐区牌到手牌；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_deadbranch_shuffle', name: '残枝回轮', type: '能力', cost: 1, icon: '🧭', val: 0, tags: ['回收', '蓄力'], buildTags: ['exile', 'gale'], rarity: '史诗', frameTheme: 'archer', desc: '获得风势，并[回收] 1 张放逐区牌洗入牌库；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_shadow_line', name: '影羽裂线', type: '攻击', cost: 1, icon: '🗡️', val: 9, tags: ['放逐'], buildTags: ['exile'], rarity: '普通', frameTheme: 'archer', desc: '造成 9 点伤害后[放逐]；进入放逐区时造成 5 点[流动伤害]。' },
        { poolId: 'archer_lost_arrow_mark', name: '遗矢星标', type: '能力', cost: 1, icon: '📍', val: 0, tags: ['回收'], buildTags: ['exile'], rarity: '稀有', frameTheme: 'archer', desc: '[回收] 1 张墓地牌到手牌；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_leaf_store', name: '飞叶封存', type: '防御', cost: 1, icon: '🍂', val: 9, tags: ['闪避', '保留'], buildTags: ['gale'], rarity: '普通', frameTheme: 'archer', desc: '获得 9 点护盾，获得 1 层[闪避]并[保留]。' },
        { poolId: 'archer_nest_track', name: '归巢血轨', type: '攻击', cost: 2, icon: '🧭', val: 12, tags: ['回收', '出血'], buildTags: ['exile', 'venom'], rarity: '史诗', frameTheme: 'archer', desc: '造成 12 点伤害，施加[出血]，并[回收] 1 张放逐区牌洗入牌库；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_empty_valley_knife', name: '空谷飞刃', type: '攻击', cost: 0, icon: '🗡️', val: 3, tags: ['销毁'], buildTags: ['exile'], rarity: '普通', frameTheme: 'archer', desc: '造成 3 点伤害后[销毁]，销毁时造成 4 点[流动伤害]。' },
        { poolId: 'archer_old_arrow_dream', name: '旧箭入梦', type: '能力', cost: 1, icon: '💤', val: 0, tags: ['回收'], buildTags: ['exile'], rarity: '稀有', frameTheme: 'archer', desc: '[回收] 1 张放逐区牌到手牌；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_leaf_search', name: '叶脉寻踪', type: '能力', cost: 0, icon: '🔎', val: 0, tags: ['回收'], buildTags: ['exile'], rarity: '稀有', frameTheme: 'archer', desc: '[回收] 1 张墓地牌到手牌；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_rearguard', name: '游侠断后', type: '攻击', cost: 2, icon: '🏹', val: 9, tags: ['放逐', '蓄力'], buildTags: ['exile', 'gale'], rarity: '史诗', frameTheme: 'archer', desc: '造成 9 点伤害，获得风势后[放逐]；进入放逐区时造成 5 点[流动伤害]。' },
        { poolId: 'archer_forest_specimen', name: '归林遗羽', type: '能力', cost: 1, icon: '📦', val: 0, tags: ['回收'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['exile'], rarity: '稀有', frameTheme: 'archer', desc: '[回收] 1 张放逐区牌洗入牌库并抽 1 张牌；回收放逐牌时造成 7 点[流动伤害]。' },
        { poolId: 'archer_shadow_box', name: '影匣齐射', type: '攻击', cost: 2, icon: '📦', val: 9, tags: ['放逐', '追击'], buildTags: ['exile', 'gale'], rarity: '史诗', frameTheme: 'archer', desc: '造成 9 点伤害，触发[追击]后[放逐]；进入放逐区时造成 5 点[流动伤害]。' },
        { poolId: 'archer_leaf_reload', name: '叶脉换弦', type: '能力', cost: 0, icon: '🍃', val: 4, tags: ['蓄力'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['gale'], rarity: '普通', frameTheme: 'archer', desc: '免费获得 1 层风势并抽 1 张牌。' },
        { poolId: 'archer_sky_skim', name: '掠空羽矢', type: '攻击', cost: 0, icon: '🪶', val: 3, tags: ['追击', '销毁'], buildTags: ['gale'], rarity: '普通', frameTheme: 'archer', desc: '造成 3 点伤害，触发[追击]后[销毁]。' },
        { poolId: 'archer_crosswind_guard', name: '侧风护步', type: '防御', cost: 1, icon: '🥾', val: 9, tags: ['自然', '保留'], buildTags: ['gale'], rarity: '稀有', frameTheme: 'archer', desc: '获得 9 点护盾，触发[自然]并[保留]。' },
        { poolId: 'archer_lostroad_cache', name: '失路羽囊', type: '能力', cost: 1, icon: '📦', val: 0, tags: ['放逐'], directEffects: { draw: true }, preserveDirectEffects: true, buildTags: ['exile'], rarity: '普通', frameTheme: 'archer', desc: '自身[放逐]并抽 1 张牌，进入放逐区时造成 5 点[流动伤害]。' }
    ],
    neutral: [
        { poolId: 'neutral_blank_pact', name: '空白契约', type: '能力', cost: 0, icon: '📄', val: 0, tags: ['抽牌', '销毁'], rarity: '普通', desc: '[抽牌]后[销毁]。' },
        { poolId: 'neutral_cold_iron_page', name: '冷铁护页', type: '防御', cost: 1, icon: '📘', val: 7, tags: ['庇护'], rarity: '普通', desc: '获得 7 点护盾并触发[庇护]。' },
        { poolId: 'neutral_ash_marker', name: '灰烬路标', type: '能力', cost: 0, icon: '🔥', val: 0, tags: ['易伤', '抽牌'], rarity: '稀有', desc: '施加[易伤]并[抽牌]。' }
    ]
};

Object.entries(BUILD_EXPANSION_CARDS).forEach(([characterId, cards]) => {
    if (characterId === 'neutral') {
        NEUTRAL_CARD_POOL.push(...cards);
    } else {
        CHARACTER_CARD_POOLS[characterId].push(...cards);
    }
});

const STARTER_DECKS = {
    starter_warrior: {
        roleId: 'hero_warrior',
        cards: [
            { poolId: 'starter_warrior_strike', name: '铁誓斩', type: '攻击', cost: 1, icon: '⚔️', val: 8, tags: [], rarity: '普通', copies: 3, frameTheme: 'warrior', desc: '造成 8 点伤害。' },
            { poolId: 'starter_warrior_guard', name: '誓盾守', type: '防御', cost: 1, icon: '🛡️', val: 7, tags: [], rarity: '普通', copies: 4, frameTheme: 'warrior', desc: '获得 7 点护盾。' },
            { poolId: 'starter_warrior_oath', name: '誓光斩', type: '攻击', cost: 1, icon: '✨', val: 6, tags: ['圣剑'], buildTags: ['oathblade'], rarity: '普通', copies: 1, frameTheme: 'warrior', desc: '造成 6 点伤害；[圣剑]会追加当前护盾的一部分伤害。' },
            { poolId: 'warrior_magic_sword', name: '魔剑', type: '攻击', cost: 1, icon: '🗡️', val: 4, tags: [], magicSwordGrowth: 1, buildTags: ['bloodoath'], rarity: '稀有', frameTheme: 'warrior', art: 'assets/cards/art/warrior/warrior_magic_sword_art_v1.png', desc: '造成 4 点伤害；自身实际失去生命或本牌击杀敌人时，永久 +1 伤害。' },
            { poolId: 'starter_warrior_flaw', name: '裂隙刻印', type: '能力', cost: 0, icon: '🎯', val: 0, tags: ['易伤'], buildTags: ['execution'], directEffects: { draw: true }, rarity: '普通', frameTheme: 'warrior', desc: '免费施加[易伤]并抽 1 张牌。' }
        ]
    },
    starter_mage: {
        roleId: 'hero_mage',
        cards: [
            { poolId: 'starter_mage_bolt', name: '星尘法弹', type: '攻击', cost: 1, icon: '🪄', val: 10, tags: [], rarity: '普通', copies: 3, frameTheme: 'mage', desc: '造成 10 点伤害。' },
            { poolId: 'starter_mage_heal', name: '月泉愈流', type: '能力', cost: 0, icon: '✚', val: 8, healValue: 8, tags: ['治愈'], buildNeutral: true, rarity: '普通', copies: 2, frameTheme: 'mage', desc: '免费回复 8 点生命。' },
            { poolId: 'starter_mage_omen', name: '秘仪预兆', type: '能力', cost: 0, icon: '🔮', val: 0, tags: ['咏唱'], directEffects: { draw: true }, buildTags: ['chant'], rarity: '普通', copies: 2, frameTheme: 'mage', desc: '免费积累[咏唱]、获得职业护盾并抽 1 张牌。' },
            { poolId: 'starter_mage_release', name: '星火破封', type: '攻击', cost: 1, icon: '✨', val: 10, tags: ['爆发'], buildNeutral: true, rarity: '普通', copies: 2, frameTheme: 'mage', desc: '造成 10 点伤害；[爆发]会消耗全部咏唱追加伤害。' },
            { poolId: 'starter_mage_curse', name: '蚀星雾', type: '能力', cost: 1, icon: '☠️', val: 0, tags: ['诅咒'], buildTags: ['calamity'], rarity: '普通', copies: 1, frameTheme: 'mage', desc: '施加[诅咒]。' }
        ]
    },
    starter_archer: {
        roleId: 'hero_archer',
        cards: [
            { poolId: 'starter_archer_shot', name: '林影矢', type: '攻击', cost: 1, icon: '🏹', val: 7, tags: [], rarity: '普通', copies: 4, frameTheme: 'archer', desc: '造成 7 点伤害。' },
            { poolId: 'starter_archer_step', name: '林隙闪步', type: '能力', cost: 1, icon: '🍃', val: 1, tags: ['闪避'], buildNeutral: true, sidestepVal: 1, rarity: '普通', copies: 2, frameTheme: 'archer', desc: '获得 1 层[闪避]，完全躲开本轮敌方主体的下一段攻击。' },
            { poolId: 'starter_archer_aim', name: '风痕定弦', type: '能力', cost: 1, icon: '🎯', val: 4, tags: ['蓄力'], buildTags: ['gale'], directEffects: { draw: true }, rarity: '普通', copies: 2, frameTheme: 'archer', desc: '获得风势并抽 1 张牌。' },
            { poolId: 'starter_archer_exile', name: '逐影离弦', type: '攻击', cost: 1, icon: '🏹', val: 8, tags: ['放逐'], buildTags: ['exile'], rarity: '普通', frameTheme: 'archer', desc: '造成 8 点伤害并[放逐]；进入放逐区时造成 5 点[流动伤害]。' },
            { poolId: 'starter_archer_focus', name: '旅箭整束', type: '能力', cost: 0, icon: '🪶', val: 0, tags: [], buildNeutral: true, directEffects: { draw: true }, rarity: '普通', frameTheme: 'archer', desc: '免费抽 1 张牌。' }
        ]
    }
};

Object.entries(CHARACTER_CARD_POOLS).forEach(([roleId, cards]) => {
    cards.forEach(card => applyCardTagBudget(applyRoleCardTagPolicy(roleId, card)));
});
NEUTRAL_CARD_POOL.forEach(applyCardTagBudget);
Object.entries(SPECIAL_EPIC_POOLS).forEach(([roleId, cards]) => {
    cards.forEach(card => applyCardTagBudget(applyRoleCardTagPolicy(roleId, card)));
});
Object.values(STARTER_DECKS).forEach(deck => {
    deck.cards.forEach(card => applyCardTagBudget(applyRoleCardTagPolicy(deck.roleId, card)));
});
