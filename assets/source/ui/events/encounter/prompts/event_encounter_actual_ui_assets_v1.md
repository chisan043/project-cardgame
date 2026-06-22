# Event Encounter Actual UI Assets v1

Style anchor: `assets/source/ui/concepts/event_encounter_actual_ui_concept_v1.png`

Use the Questers 1990s Japanese cel-animation stained-glass fantasy UI style:
dark ruined cathedral, deep navy/teal glass, antique thin gold filigree, blue jewel nodes, aged parchment, hard ink outlines, hand-painted texture, candlelit gold highlights.

Actual encounter screen boundary:
- The left module-introduction text panel from the larger concept sheet is not part of the playable UI.
- The playable encounter UI starts at the shared portrait arch and contains:
  - background cathedral scene,
  - shared left portrait arch with encounter NPC,
  - three event choice panels,
  - right/top exit button,
  - outer hairline frame.

Generated project assets:
- `assets/ui/events/encounter/backgrounds/event_encounter_cathedral_bg_v1.png`
- `assets/ui/events/encounter/frames/event_choice_panel_frame_v1.png`
- `assets/ui/events/encounter/frames/event_choice_panel_frame_v2.png`
- `assets/ui/events/encounter/frames/event_choice_panel_frame_v3.png`
- `assets/ui/events/encounter/icons/event_choice_icon_treasure_v1.png`
- `assets/ui/events/encounter/icons/event_choice_icon_trial_v1.png`
- `assets/ui/events/encounter/icons/event_choice_icon_pack_v1.png`
- `assets/ui/events/encounter/buttons/event_choice_button_v1.png`
- `assets/ui/events/encounter/buttons/event_exit_button_v1.png`
- `assets/npc/encounter_angel_portrait_bust_v1.png`
- `assets/npc/encounter_angel_portrait_bust_v2.png`
- `assets/npc/encounter_angel_window_v1.png`
- `assets/npc/encounter_angel_window_v2.png`

Generation rules:
- Component assets use a flat chroma-key source and local alpha extraction.
- `event_choice_panel_frame_v2.png` uses a flat `#ff00ff` chroma-key source so the blue/teal glass stays intact.
- `encounter_angel_portrait_bust_v2.png` is the encounter-home half-body portrait; it replaces the earlier full-body/wing-heavy portrait for concept-match layout.
- `event_choice_panel_frame_v3.png` is the preferred home choice panel: darker, thinner gold linework, no bottom hole, no baked button slot.
- `encounter_angel_window_v1.png` is the preferred encounter-home portrait insert: NPC and stained glass are baked together, then placed under the shared arch frame.
- `encounter_angel_window_v2.png` is the preferred encounter-home portrait window: a full window/half-body guardian composition, used without the shared shop arch overlay to match the concept image more closely.
- Runtime/source copies are both kept in the repository.
- Do not bake Chinese text, numbers, prices, cards, relics, or clickable state into the frame assets.
- Runtime renders all text and click targets.
- The three choice cards use the same reusable frame and separate icon artwork.
- Choice panel frames must match the actual concept proportions: broad vertical cards, not skinny columns.
- Choice panel frames must not include a bottom button hole or baked button slot; the blue action button is a separate clickable overlay.
