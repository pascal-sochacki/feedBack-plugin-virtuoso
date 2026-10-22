// SPDX-License-Identifier: AGPL-3.0-only
// Skill tree topology — positions as % of the inner container (x left→right, y top→bottom).
// Edges draw pedagogical flow lines; clicking a node selects the pathway.
export const SKILL_TREE_NODES = [
  { id: 'chromatic_warmup',      x:  6, y: 50, short: 'Chromatic' },
  // Beginner band (x20)
  { id: 'pent_foundation',       x: 20, y: 20, short: 'Pentatonic' },
  { id: 'pulse_muting',          x: 20, y: 42, short: 'Pulse/Mute' },
  { id: 'blues_foundation',      x: 20, y: 64, short: 'Blues Scale' },
  { id: 'bend_drill',            x: 20, y: 86, short: 'Bending' },
  // Beginner-2 / Beg→Int bridge band (x36)
  { id: 'major_pent_country',    x: 36, y: 10, short: 'Major Pent' },
  { id: 'dorian_groove',         x: 36, y: 32, short: 'Dorian' },
  { id: 'power_chord_comping',   x: 36, y: 54, short: 'Power Chords' },
  { id: 'blues_shuffle',         x: 36, y: 72, short: 'Blues Shuffle' },
  { id: 'harmonic_minor_exotic', x: 36, y: 90, short: 'Harm. Minor' },
  // Intermediate band (x54)
  { id: 'chord_tone_targeting',  x: 54, y: 14, short: 'Chord Tones' },
  { id: 'major_scale_caged',     x: 54, y: 36, short: 'Major CAGED' },
  { id: 'modal_awareness',       x: 54, y: 56, short: 'Modal Aware.' },
  { id: 'sixteenth_pocket',      x: 54, y: 76, short: '16th Pocket' },
  { id: 'diatonic_triad_drill',  x: 54, y: 92, short: 'Triad Drill' },
  // Advanced band (x72 / x88)
  { id: 'modal_vamp',            x: 72, y: 22, short: 'Modal Vamp' },
  { id: 'seventh_vocab',         x: 72, y: 44, short: '7th Chords' },
  { id: 'melmin_exotic_12key',   x: 72, y: 66, short: 'Mel-Min' },
  { id: 'sweep_arpeggio_primer', x: 72, y: 88, short: 'Sweep Arps' },
  { id: 'guide_tones_path',      x: 88, y: 30, short: 'Guide Tones' },
  { id: 'whole_neck_freedom',    x: 88, y: 52, short: 'Whole Neck' },
  { id: 'ii_V_I_workout',        x: 88, y: 74, short: 'ii–V–I' },
  // Metal / heavy-genre pack — advanced offshoots along the bottom band.
  { id: 'metalcore_chug',        x: 44, y: 97, short: 'Metalcore' },
  { id: 'melodic_metal_gallop',  x: 57, y: 97, short: 'Gallop' },
  { id: 'melodeath_twin_leads',  x: 70, y: 97, short: 'Twin Leads' },
  { id: 'djent_polymeter',       x: 83, y: 97, short: 'Djent' },
  { id: 'death_chromatic',       x: 96, y: 97, short: 'Death' },
];
export const SKILL_TREE_EDGES = [
  ['chromatic_warmup',    'pent_foundation'],
  ['chromatic_warmup',    'blues_foundation'],
  ['pent_foundation',     'bend_drill'],
  ['blues_foundation',    'bend_drill'],
  ['blues_foundation',    'blues_shuffle'],
  ['pent_foundation',     'major_pent_country'],
  ['pent_foundation',     'dorian_groove'],
  ['blues_foundation',    'dorian_groove'],
  ['blues_foundation',    'harmonic_minor_exotic'],
  ['dorian_groove',       'chord_tone_targeting'],
  ['dorian_groove',       'modal_awareness'],
  ['major_pent_country',  'chord_tone_targeting'],
  ['modal_awareness',     'modal_vamp'],
  ['modal_awareness',     'diatonic_triad_drill'],
  ['chord_tone_targeting','diatonic_triad_drill'],
  ['diatonic_triad_drill','seventh_vocab'],
  ['diatonic_triad_drill','sweep_arpeggio_primer'],
  ['seventh_vocab',       'ii_V_I_workout'],
  ['modal_vamp',          'ii_V_I_workout'],
  // Guitar Core ★ nodes — prerequisite flow (build-queue #1).
  ['chromatic_warmup',    'pulse_muting'],          // B0 → B1
  ['chromatic_warmup',    'pick_chromatic_16ths'],  // the warmup's speed version (16ths moved out of B0)
  // Fingerstyle pack: pima → the spider widths (first edge = the "Builds on" hint).
  ['chord_cowboy',        'fs_pima_foundation'],
  ['fs_pima_foundation',  'fs_spider_adjacent'],
  ['chromatic_warmup',    'fs_spider_adjacent'],
  ['fs_spider_adjacent',  'fs_spider_skip'],
  ['fs_spider_skip',      'fs_spider_wide'],
  ['pulse_muting',        'power_chord_comping'],   // B1 → B3 (power chords in Beginner)
  ['pulse_muting',        'sixteenth_pocket'],      // B1 → I8
  ['pent_foundation',     'major_scale_caged'],     // B2 → I1
  ['major_scale_caged',   'whole_neck_freedom'],    // I1 → A6
  ['modal_awareness',     'melmin_exotic_12key'],   // I3 → A7
  ['seventh_vocab',       'guide_tones_path'],      // A1 → A2
  ['guide_tones_path',    'ii_V_I_workout'],        // A2 → A3 (guide-tones before voice-leading)
  // Metal pack branches off the advanced minor/arpeggio nodes.
  ['harmonic_minor_exotic','metalcore_chug'],
  ['harmonic_minor_exotic','melodic_metal_gallop'],
  ['sweep_arpeggio_primer','melodeath_twin_leads'],
  ['sweep_arpeggio_primer','death_chromatic'],
  // Djent sub-ladder chain (panel 2026-06-05) — supersedes the old
  // sweep_arpeggio_primer→djent_polymeter edge: the ladder gives the grouping
  // rung a real prereq climb. Rung 1 builds on the Rhythm band's one-note pulse
  // (the reuse ledger: djent is that skill at maximum heaviness; soft hint only).
  ['rhy_single_string',  'djent_chug_lock'],
  ['djent_chug_lock',    'djent_accent_grid'],
  ['djent_accent_grid',  'djent_polymeter'],
  ['djent_polymeter',    'djent_skip_gallop'],
  ['djent_skip_gallop',  'djent_moving_chug'],
  ['djent_moving_chug',  'djent_herta_chug'],
  ['djent_herta_chug',   'djent_lock_the_cell'],
  // Metal LEAD-over-backing application rungs (panel 2026-06-13): the gallop
  // teaches the i–♭VI–♭VII power chords; now SOLO over them, then add the
  // Phrygian color, then trade bars in the jam cap.
  ['melodic_metal_gallop', 'metal_lead_changes'],
  ['metal_lead_changes',   'metal_lead_phrygian'],
  ['metal_lead_phrygian',  'djent_lock_the_cell'],
  // ── CORE: BASS spine prereqs (2026-06-08) — the bass Beginner→Advanced climb
  // through the instrument-aware Core bands (bass_rh_pulse is the on-ramp).
  ['bass_rh_pulse',          'bass_root_click'],
  ['bass_root_click',        'bass_finger_gym'],
  ['bass_finger_gym',        'bass_finger_legato'],          // pinky HO/PO follows the finger gym
  ['bass_finger_gym',        'bass_root_fifth_octave'],
  ['bass_root_fifth_octave', 'bass_octave_groove'],
  ['bass_octave_groove',     'bass_lc_roots'],
  ['bass_lc_roots',          'bass_scale_one_box'],          // Beginner → Intermediate
  ['bass_scale_one_box',     'bass_scale_two_octave'],
  ['bass_root_fifth_octave', 'bass_arp_triads'],             // root-5-8 is half a triad
  ['bass_arp_triads',        'bass_arp_sevenths'],
  ['bass_octave_groove',     'bass_dead_notes'],
  ['bass_dead_notes',        'bass_rh_sixteenth'],
  ['bass_arp_sevenths',      'bass_arp_neck'],               // 7th boxes up the neck (position travel)
  ['bass_arp_sevenths',      'bass_walking'],                // Intermediate capstone
  ['bass_scale_two_octave',  'bass_scale_modes'],            // Intermediate → Advanced
  ['bass_scale_modes',       'bass_scale_shifts'],
  ['bass_scale_shifts',      'bass_scale_whole_neck'],
  ['bass_arp_sevenths',      'bass_arp_changes'],
  ['bass_arp_sevenths',      'bass_lc_guide_tones'],
  ['bass_walking',           'bass_lc_approach'],
  ['bass_lc_guide_tones',    'bass_lc_approach'],
  ['bass_rh_sixteenth',      'bass_rh_three_finger'],
  ['bass_lc_approach',       'bass_lc_capstone'],            // the hard application
  ['bass_lc_capstone',       'bass_lc_trade'],               // the creative on-ramp (the true destination)
  // Bass: Slap & Funk elective — builds on the Core pocket + arps.
  ['bass_dead_notes',        'bass_rh_funk_pocket'],
  ['bass_rh_funk_pocket',    'bass_rh_crossing'],
  ['bass_arp_sevenths',      'bass_arp_inversions'],
  ['bass_rh_funk_pocket',    'bass_slap'],
  // Blues vocabulary rungs (riff-vocab pilot): the turnaround device builds on
  // knowing the 12-bar form (shuffle); drill before construct; the construct
  // step also draws on the call-and-answer skill (the JAM hand-off edge).
  ['blues_shuffle',          'blues_turnaround'],
  ['blues_turnaround',       'blues_turnaround_build'],
  ['blues_call_response',    'blues_turnaround_build'],
  // Sweep Picking ladder — builds on the Arpeggios pack's sweep rung, then climbs.
  ['arp_sweeps',         'sweep3_triad'],
  ['sweep3_triad',       'sweep5_box'],
  ['sweep5_box',         'sweep_roll_apex'],
  ['sweep_roll_apex',    'sweep7_color'],
  ['sweep7_color',       'sweep_changes'],
  // Tapping ladder (panel 2026-07-14) — guitar builds on Legato (tapping = both-hands
  // legato) with a cross-link to Arpeggios (know the shape before you tap it, same
  // logic as arp_sweeps→sweep3_triad); bass builds on the pinky-legato rung + the
  // neck-arpeggio rung. First incoming edge = each rung's "Builds on" hint.
  ['leg_runs',           'tap_articulation'],
  ['tap_articulation',   'tap_cell'],
  ['tap_cell',           'tap_cascade'],
  ['arp_seventh_shapes', 'tap_cascade'],
  ['tap_cascade',        'tap_sevenths'],
  ['tap_sevenths',       'tap_changes'],
  ['bass_finger_legato', 'btap_articulation'],
  ['btap_articulation',  'btap_arpeggio'],
  ['bass_arp_neck',      'btap_arpeggio'],
  ['btap_arpeggio',      'btap_groove'],
  ['btap_groove',        'btap_apply'],
];
// Band map — the single source for the two-level picker that replaces the SVG
// skill-tree display (which tangles at 27 nodes). L1 = band (array order); L2 =
// ordered pathway list per band (array order, top = do-first). Authored by
// learning-design-architect (project_guitar_pathway_bands); the SVG tree
// (SKILL_TREE_NODES/EDGES) is kept for the future RPG view. Style pathways' Core
// prereq comes from SKILL_TREE_EDGES (first incoming edge), surfaced as a soft
// "Builds on …" hint. When a new guitar pathway is added, slot it here.
// A "pack" === a band (no parallel registry). `kind` drives the Pack-manager
// (§11): Core packs are pinned-first / locked / always-installed (the staircase),
// Style packs are installable/orderable and each declares a Core foundation
// (`buildsOn`, player vocabulary, informational — never a lock) + a `family`
// (groups the Available column into a curriculum map as the roster grows).
export const PATHWAY_BANDS = [
  // Core is INSTRUMENT-AWARE (2026-06-08): each band holds the guitar spine AND the
  // bass spine (b-lite); isHiddenNode shows only the active instrument's rungs, so a
  // bass player sees a pinned bass Beginner→Advanced staircase in the SAME 3 bands —
  // parity with guitar, not a separate taxonomy. Bass spine = the dissolved bass Style
  // packs (Foundations/Scales/Arps/Groove) re-homed + the new Core/L&C rungs.
  { id:'core_beginner',     label:'Beginner',     kind:'core', pinned:true, pathways:['chromatic_warmup','pulse_muting','pent_foundation','power_chord_comping','blues_foundation','bend_drill','bass_rh_pulse','bass_root_click','bass_finger_gym','bass_finger_legato','bass_root_fifth_octave','core_root_third_fifth','bass_octave_groove','bass_lc_roots'] },
  { id:'core_intermediate', label:'Intermediate', kind:'core', pinned:true, pathways:['major_scale_caged','sixteenth_pocket','dorian_groove','chord_tone_targeting','modal_awareness','diatonic_triad_drill','bass_scale_one_box','bass_scale_two_octave','bass_arp_triads','bass_arp_sevenths','bass_arp_neck','bass_dead_notes','bass_rh_sixteenth','bass_walking'] },
  { id:'core_advanced',     label:'Advanced',     kind:'core', pinned:true, pathways:['seventh_vocab','whole_neck_freedom','guide_tones_path','ii_V_I_workout','modal_vamp','melmin_exotic_12key','harmonic_minor_exotic','sweep_arpeggio_primer','bass_scale_modes','bass_scale_shifts','bass_scale_whole_neck','bass_arp_changes','bass_lc_guide_tones','bass_lc_approach','bass_rh_three_finger','bass_lc_capstone','bass_lc_trade'] },
  { id:'style_blues',       label:'Blues',        kind:'style', family:'Roots & Rock',          buildsOn:'Builds on Core Beginner — minor-pentatonic box 1, the blue note (♭5), and a steady pulse over the 12-bar form.', pathways:['blues_box','blues_shuffle','blues_bends','blues_call_response','blues_mix','blues_turnaround','blues_turnaround_build'] },
  { id:'style_country',     label:'Country',      kind:'style', family:'Roots & Rock',          buildsOn:'Builds on Core Beginner→Intermediate — major pentatonic and the CAGED major scale; you target chord tones inside the shape, then add the country idiom (double-stops, chicken pickin\', the ♭VII train change).', pathways:['major_pent_country','country_cowboy_changes','country_double_stops','country_chicken_pickin','country_pedal_bends','country_train'] },
  { id:'style_metal',       label:'Metal',        kind:'style', family:'High-Gain & Technical', buildsOn:'Builds on Core — power chords and palm-mute pulse (Beginner), tight 16th picking (Intermediate), plus exotic/harmonic-minor scales and sweep mechanics (Advanced). The djent sub-ladder climbs chug precision → accent control → grouping cells → cell vocabulary → moving stacks, topping out in a trade-bars jam; and the lead rungs put you SOLOING over a full chugging rhythm section.', pathways:['metalcore_chug','melodic_metal_gallop','metal_lead_changes','metal_lead_phrygian','djent_chug_lock','djent_accent_grid','djent_polymeter','djent_skip_gallop','djent_moving_chug','djent_herta_chug','djent_lock_the_cell','melodeath_twin_leads','death_chromatic'] },
  { id:'style_rock',        label:'Rock',         kind:'style', family:'Roots & Rock',          buildsOn:'Builds on Core — power chords + the backbeat (Beginner), the pentatonic box (Beginner), then the blues-rock mix, pedal-tone riffs, and the ♭VII classic-rock changes.', pathways:['rock_power_backbeat','rock_pentatonic','rock_lead_vocab','rock_pedal_riff','rock_classic_changes'] },
  // Concepts family — "concept ladders" (one skill, sequenced easy→mastery): a
  // VERTICAL column through difficulty, vs the Core bands' horizontal staircase.
  // Style-kind so they're opt-in via the Pack manager; family 'Concepts' heads the
  // Available column. First of a planned set (Arpeggio, Voice-Leading, Fretboard…).
  // See docs/plugin/design/triad-mastery-ladder.md + memory project_python_generator_reconciliation.
  { id:'concept_chords', label:'Chords', kind:'style', family:'Concepts', buildsOn:'Builds on Core Beginner — power chords and a steady strum hand; and Core Intermediate — the CAGED major scale (a barre chord is that scale shape\'s skeleton). Hold the grip, change it cleanly in time, then move it around the neck: open cowboy chords -> the five CAGED shapes -> movable barres -> comping a whole progression.', pathways:['chord_cowboy','chord_caged_shapes','chord_barre_changes','chord_caged_progression','chord_sevenths','chord_diatonic_7ths','chord_color_extensions'] },
  { id:'concept_triads', label:'Triads', kind:'style', family:'Concepts', buildsOn:'Builds on Core Intermediate — the CAGED major scale. A triad is the top three strings of the barre chords you already know; own the three inversions, then use them over the changes.', pathways:['triad_inversions','triad_five_shapes','triads_over_changes','triad_pairs'] },
  { id:'concept_arpeggios', label:'Arpeggios', kind:'style', family:'Concepts', buildsOn:'Builds on Core Intermediate — diatonic triads and the CAGED shapes. An arpeggio is a chord one note at a time; spell the sevenths, invert them, then chase them through the changes.', pathways:['arp_seventh_shapes','arp_inversions','arp_over_changes','arp_sweeps'] },
  { id:'concept_voiceleading', label:'Guide Tones', kind:'style', family:'Concepts', buildsOn:'Builds on Core — diatonic seventh chords and the major scale. The 3rd and 7th are a chord\'s identity; voice-lead just those through the changes, then play a line that follows them.', pathways:['vl_shells','vl_guide_tones','vl_guide_changes','vl_connect'] },
  { id:'concept_fretboard', label:'Fretboard', kind:'style', family:'Concepts', buildsOn:'Builds on Core — the pentatonic box and the CAGED major scale. Stop thinking in one box: connect the shapes, shift positions, learn the 3NPS system, and map the whole neck.', pathways:['fb_one_box','fb_caged_links','fb_position_shifts','fb_3nps','fb_whole_neck'] },
  { id:'concept_intervals', label:'Intervals', kind:'style', family:'Concepts', buildsOn:'Builds on Core — a scale you can play in one box and a steady pulse. Stop playing the scale step-by-step: skip through it in thirds, then fourths & fifths, then sixths, then take the same intervals up and down the neck and finally mix them over a backing. The ear/hand drill behind melody, bass fills, and connecting chord tones — diatonic, so it transposes for free. Works on guitar or bass.', pathways:['diatonic_intervals','int_sixths','bass_int_sixths','int_across_neck','bass_int_walk','int_mixed'] },
  { id:'concept_expression', label:'Expression', kind:'style', family:'Concepts', buildsOn:'Builds on Core Beginner — a fretted note and a target pitch. Make the note SING: vibrato width first, then bends that land dead in tune (half → whole → mixed).', pathways:['exp_vibrato','exp_bend_half','exp_bend_whole','exp_bend_mixed'] },
  { id:'concept_rhythm', label:'Rhythm', kind:'style', family:'Concepts', buildsOn:'Builds on Core — a steady pulse and the pentatonic box. Own TIME itself, easy→mastery: the grid (subdivisions, the 16th pocket) → the feel (swing, syncopation, the gallop, moving the accent) → the pulse frame (one-note pulse, half/double-time, odd meters) → two pulses at once (over the barline) → trade bars and make your own groove. World rhythms (tresillo, clave) ride the one-note pulse. Instrument-agnostic — works on guitar or bass.', pathways:['rhy_subdivision','rhy_sixteenth','rhy_swing','rhy_displacement','rhy_gallop_snap','rhy_accent_displace','rhy_single_string','rhy_half_double','rhy_odd_meter','rhy_over_barline','rhy_trade_bars'] },
  { id:'concept_picking', label:'Picking', kind:'style', family:'Concepts', buildsOn:'Builds on Core — the chromatic warmup and one-finger-per-fret sync. The pick-hand engine: tremolo, alternate across strings, economy crossings, string skipping, hybrid picking.', pathways:['pick_tremolo','pick_alternate','pick_chromatic_16ths','pick_economy','pick_string_skip','pick_hybrid','pick_herta'] },
  { id:'concept_legato', label:'Legato', kind:'style', family:'Concepts', buildsOn:'Builds on Core — clean fretting and a scale shape. The fretting-hand engine: hammer-ons/pull-offs, then 3NPS legato runs. (Two-hand tapping graduated into its own Tapping ladder.)', pathways:['leg_hopo','leg_runs'] },
  { id:'concept_sweeps', label:'Sweep Picking', kind:'style', family:'Concepts', buildsOn:'Builds on the Arpeggios pack — you can already spell a triad across the neck in a shape. Sweep picking turns that vertical chord shape into one fluid raked motion, the fretting hand muting everything not sounding: 3-string triad -> the 5-string box -> the finger-roll & clean apex -> seventh sweeps -> sweeps through the changes. Cleanliness comes first; speed is a byproduct.', pathways:['sweep3_triad','sweep5_box','sweep_roll_apex','sweep7_color','sweep_changes'] },
  // Tapping ladder — two-hand legato, carved out of the Legato pack (panel
  // 2026-07-14). Guitar climbs to the neoclassical cascade; the bass rungs (btap_*)
  // are register-clamped and shown only on bass via isHiddenNode. Guitar and bass
  // mirror rungs 1–2, then diverge (guitar → shred cascade, bass → tapped groove).
  { id:'concept_tapping', label:'Tapping', kind:'style', family:'Concepts', buildsOn:"Builds on the Legato pack — clean hammer-ons and pull-offs. Tapping is legato with both hands: the picking hand joins the fretting hand on the fingerboard to sound notes beyond one hand's reach. Isolate the tap-and-pull, build the tapped cell, then the wide arpeggio cascades — and end over the changes and in a groove, not as fireworks.", pathways:['tap_articulation','tap_cell','tap_cascade','tap_sevenths','tap_changes','btap_articulation','btap_arpeggio','btap_groove','btap_apply'] },
  // Bass family — DISSOLVED into the instrument-aware Core (2026-06-08): the former
  // Bass: Foundations/Scales/Arpeggios/Groove packs were fundamentals filed as Style
  // only because there was no bass Core band. Their rungs now live in core_* above
  // (de-dup: a rung is in Core OR a Style pack, never both). What remains a genuine
  // opt-in elective is the genre-specific Slap & Funk lane (slap moves OUT of the
  // old Foundations capstone here) + the arpeggio-inversions deepening.
  // First band of the Acoustic & Fingerstyle family (the slot has waited in
  // PACK_FAMILY_ORDER since the pack-manager build). Community-seeded: the
  // spider trio came from the 2026-06-12 beta thread, graded by pair width.
  { id:'style_fingerstyle', label:'Fingerstyle', kind:'style', family:'Acoustic & Fingerstyle', buildsOn:'Builds on Core Beginner — the chromatic warmup\'s one-finger-per-fret frame — and the Chords pack\'s open grips. The fingerstyle hand from the ground up: name the fingers (p-i-m-a, each owning its string), run the free-stroke pattern over open chords, then the two-string crossing spider at three widths — adjacent strings, a skip, then the full-width stretch. The standing rule: let everything ring.', pathways:['fs_pima_foundation','fs_spider_adjacent','fs_spider_skip','fs_spider_wide'] },
  { id:'bass_slap_funk', label:'Bass: Slap & Funk', kind:'style', family:'Bass', buildsOn:"Builds on Core: Bass — the dead-note pocket, the i-m motor, and arpeggios. The funk-bass lane: the 16th funk pocket at speed, string-crossing rakes, arpeggio inversions for slap fills, then thumb-slap & pop.", pathways:['bass_rh_funk_pocket','bass_rh_crossing','bass_arp_inversions','bass_slap'] },
];
// Family display order for the Pack-manager Available column (Core-branch-point
// depth → the catalog reads as a curriculum map, not a scrolling wall).
export const PACK_FAMILY_ORDER = ['Concepts', 'Roots & Rock', 'Groove', 'Jazz & Sophisticated Harmony', 'High-Gain & Technical', 'Acoustic & Fingerstyle', 'Bass'];
// ===========================================================================
