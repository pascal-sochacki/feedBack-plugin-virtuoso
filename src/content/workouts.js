/** Passive starter workouts; the binding is fixed, nested data remains mutable. */
/** @type {Record<string, import('../core/session-types.js').Session & {description: string, tags: string[], stringSetup: string}>} */
export const BUILT_IN_SESSIONS = {
    // The soft-default workout arc: warm-up → technique → application. It's the
    // first key, so it's the default-selected session (and onLaunchSession's
    // fallback). A starting point to make your own, NOT a locked program — block
    // reorder/swap (authoring) arrives with the Workout-authoring flow.
    starter_arc: {
      version:1,
      name:'Starter — warm-up · technique · application',
      description:'The default practice arc to build from: a chromatic warm-up, a scale-focus technique block, then applying it over changes. Start here and make it your own.',
      stringSetup:'guitar_6_standard',
      tags:['starter','any level'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'warmup',      name:'Warm-up — chromatic',          kind:'chromatic',
          config:{ chromaticPattern:'1234', bpm:70, bars:8, direction:'up_down', fretboardSystem:'position', fretMin:1, fretMax:4, meter:'4/4', subdivision:'sixteenth', keyCycle:'none' } },
        { id:'technique',   name:'Technique — C major (E-shape)', kind:'scale',
          config:{ key:'C', scale:'major', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'application', name:'Application — over I–IV–V',     kind:'chord_scales',
          config:{ key:'C', scale:'major', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', chordScaleStrategy:'mode_of_moment', progression:'I-IV-V', chordDepth:'triad', chordOverride:'auto', keyCycle:'none' } }
      ]
    },
    ii_v_i_workshop: {
      version:1,
      name:'ii–V–I Workshop',
      description:"Structured jazz learning sequence for any progression: guide tones first (3rds, then 7ths, then alternating), then chord scales, then arpeggios. All in C major / E-shape position.",
      stringSetup:'guitar_6_standard',
      tags:['jazz','intermediate'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'gt_thirds',   name:'Guide tones — 3rds',        kind:'guide_tones',
          config:{ key:'C', scale:'major', progression:'ii-V-I', chordDepth:'seventh', voices:'thirds_only',    bpm:60, bars:8, meter:'4/4', subdivision:'quarter',  fretboardSystem:'caged', shape:'E', direction:'up_down', sequence:'none', keyCycle:'none' } },
        { id:'gt_sevenths', name:'Guide tones — 7ths',        kind:'guide_tones',
          config:{ key:'C', scale:'major', progression:'ii-V-I', chordDepth:'seventh', voices:'sevenths_only', bpm:60, bars:8, meter:'4/4', subdivision:'quarter',  fretboardSystem:'caged', shape:'E', direction:'up_down', sequence:'none', keyCycle:'none' } },
        { id:'gt_both',     name:'Guide tones — alternating', kind:'guide_tones',
          config:{ key:'C', scale:'major', progression:'ii-V-I', chordDepth:'seventh', voices:'both_alternating', bpm:60, bars:8, meter:'4/4', subdivision:'quarter', fretboardSystem:'caged', shape:'E', direction:'up_down', sequence:'none', keyCycle:'none' } },
        { id:'chord_scales',name:'Chord scales — mode of moment', kind:'chord_scales',
          config:{ key:'C', scale:'major', progression:'ii-V-I', chordScaleStrategy:'mode_of_moment', chordDepth:'seventh', chordOverride:'auto', bpm:80, bars:8, meter:'4/4', subdivision:'eighth', fretboardSystem:'caged', shape:'E', direction:'up_down', sequence:'none', keyCycle:'none' } },
        { id:'arpeggios',   name:'Diatonic 7th arpeggios',   kind:'diatonic_arpeggios',
          config:{ key:'C', scale:'major', chordDepth:'seventh', chordOverride:'auto', bpm:80, bars:8, meter:'4/4', subdivision:'eighth', fretboardSystem:'caged', shape:'E', direction:'up_down', keyCycle:'none' } }
      ]
    },
    daily_intermediate: {
      version:1,
      name:'Daily 30-min Intermediate',
      description:'Segmented practice session: chromatic warmup, CAGED scale run, sequence pattern, diatonic arpeggios, sweep arpeggios.',
      stringSetup:'guitar_6_standard',
      tags:['intermediate','technique'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'chromatic',   name:'Chromatic warmup',            kind:'chromatic',
          config:{ chromaticPattern:'1234', bpm:80, bars:8, direction:'up_down', fretboardSystem:'position', fretMin:1, fretMax:4, meter:'4/4', subdivision:'sixteenth', keyCycle:'none' } },
        { id:'caged_scale', name:'C major — E-shape',           kind:'scale',
          config:{ key:'C', scale:'major', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'fours',       name:'Fours ascending sequence',    kind:'scale',
          config:{ key:'C', scale:'major', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'ascending', sequence:'fours', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'arpeggios',   name:'Diatonic 7th arpeggios',      kind:'diatonic_arpeggios',
          config:{ key:'C', scale:'major', chordDepth:'seventh', chordOverride:'auto', bpm:100, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'sweeps',      name:'Sweep arpeggios — Am',        kind:'sweep_arpeggios',
          config:{ key:'A', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', bpm:70, bars:8, meter:'4/4', subdivision:'sixteenth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } }
      ]
    },
    blues_fundamentals: {
      version:1,
      name:'Blues Fundamentals',
      description:'Chromatic warmup → minor pentatonic box 1 → blues scale → chord scales over 12-bar form. The essential first-year blues vocabulary in A.',
      stringSetup:'guitar_6_standard',
      tags:['beginner','blues'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'chromatic',  name:'Chromatic warmup',             kind:'chromatic',
          config:{ chromaticPattern:'1234', bpm:70, bars:8, direction:'up_down', fretboardSystem:'position', fretMin:1, fretMax:4, meter:'4/4', subdivision:'sixteenth', keyCycle:'none' } },
        { id:'pent',       name:'A minor pentatonic — E-shape', kind:'scale',
          config:{ key:'A', scale:'minor_pentatonic', bpm:80, bars:12, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', progression:'12_bar_blues', chordDepth:'seventh', chordOverride:'dom7', keyCycle:'none' } },
        { id:'blues',      name:'A blues scale — E-shape',      kind:'scale',
          config:{ key:'A', scale:'blues', bpm:80, bars:12, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', progression:'12_bar_blues', chordDepth:'seventh', chordOverride:'dom7', keyCycle:'none' } },
        { id:'chord_scales',name:'Chord scales — 12-bar',       kind:'chord_scales',
          config:{ key:'A', scale:'minor_pentatonic', bpm:90, bars:12, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', chordScaleStrategy:'mode_of_moment', progression:'12_bar_blues', chordDepth:'seventh', chordOverride:'dom7', keyCycle:'none' } }
      ]
    },
    bebop_fundamentals: {
      version:1,
      name:'Bebop Fundamentals',
      description:'Dominant bebop scale applied to ii-V-I. Chromatic passing tone ensures chord tones land on strong beats — the grammar of bebop improvisation.',
      stringSetup:'guitar_6_standard',
      tags:['jazz','bebop','intermediate'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'chromatic',       name:'Chromatic warmup',          kind:'chromatic',
          config:{ chromaticPattern:'1234', bpm:80, bars:8, direction:'up_down', fretboardSystem:'position', fretMin:1, fretMax:4, meter:'4/4', subdivision:'sixteenth', keyCycle:'none' } },
        { id:'major_scale',     name:'C major — E-shape',         kind:'scale',
          config:{ key:'C', scale:'major', bpm:80, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'bebop_dominant',  name:'Bebop dominant — ii-V-I',   kind:'chord_scales',
          config:{ key:'C', scale:'bebop_dominant', progression:'ii-V-I', chordScaleStrategy:'mode_of_moment', chordDepth:'seventh', chordOverride:'auto', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'ascending', sequence:'none', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'ii_v_i_arps',     name:'ii–V–I arpeggios',          kind:'progression_arpeggios',
          config:{ key:'C', scale:'major', progression:'ii-V-I', chordDepth:'seventh', chordOverride:'auto', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } }
      ]
    },
    // ── Added 2026-06-02 to reach a credible starter library (≥10). Spread
    // across goal × level × time × genre × instrument, and DELIBERATELY shallow
    // on the primitive palette (each uses 3–4 of the 29 types, a handful of
    // scales/progressions) so a user's own workout has plenty of room to differ.
    quick_warmup: {
      version:1,
      name:'Warm-up — 10 minutes',
      description:'A fast loosen-up before you really practise: chromatic finger independence, a clean scale run, then flowing legato. Any level, any day.',
      stringSetup:'guitar_6_standard',
      tags:['warm-up','short','any level'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'chromatic', name:'Chromatic 1-2-3-4',      kind:'chromatic',
          config:{ chromaticPattern:'1234', bpm:80, bars:8, direction:'up_down', fretboardSystem:'position', fretMin:1, fretMax:4, meter:'4/4', subdivision:'sixteenth', keyCycle:'none' } },
        { id:'scale',     name:'C major — E-shape',       kind:'scale',
          config:{ key:'C', scale:'major', bpm:100, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'legato',    name:'Legato — A minor pent',   kind:'legato',
          config:{ key:'A', scale:'minor_pentatonic', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } }
      ]
    },
    beginner_foundations: {
      version:1,
      name:'Beginner Foundations',
      description:'The first-year guitar bedrock: the minor-pentatonic box, the major scale in a second shape, then turning the scale into chord tones with triad arpeggios.',
      stringSetup:'guitar_6_standard',
      tags:['beginner','foundational'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'pent',   name:'A minor pentatonic — E-shape', kind:'scale',
          config:{ key:'A', scale:'minor_pentatonic', bpm:75, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'major',  name:'C major — C-shape',            kind:'scale',
          config:{ key:'C', scale:'major', bpm:80, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'C', keyCycle:'none' } },
        { id:'triads', name:'Diatonic triads',              kind:'diatonic_arpeggios',
          config:{ key:'C', scale:'major', chordDepth:'triad', chordOverride:'auto', bpm:80, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } }
      ]
    },
    rock_essentials: {
      version:1,
      name:'Rock Essentials',
      description:'Power-chord pedal riffing, the minor-pentatonic lead box, and expressive whole-step bends — the core rock rhythm-and-lead vocabulary in E minor.',
      stringSetup:'guitar_6_standard',
      tags:['rock','beginner'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'riff',    name:'Power-chord pedal riff',    kind:'pedal_riff',
          config:{ harmonize:false, scale:'natural_minor', key:'E', meter:'4/4', subdivision:'eighth', bpm:100, bars:8, direction:'up_down', fretboardSystem:'position', progression:'i-VII-VI-VII', chordOverride:'5', swing:'straight', fretMin:0, fretMax:7, keyCycle:'none' } },
        { id:'pent',    name:'E minor pentatonic — E-shape', kind:'scale',
          config:{ key:'E', scale:'minor_pentatonic', bpm:100, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'bends',   name:'Whole-step bends',          kind:'bending',
          config:{ bendTarget:'whole', scale:'minor_pentatonic', key:'E', meter:'4/4', subdivision:'quarter', bpm:70, bars:8, direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } }
      ]
    },
    funk_pocket: {
      version:1,
      name:'Funk Pocket & Vocabulary',
      description:'Sit in a 16th-note Dorian pocket, displace the rhythm, comp two-note shell voicings, then snap octaves — the building blocks of funk phrasing in A Dorian.',
      stringSetup:'guitar_6_standard',
      tags:['funk','intermediate'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'pocket',  name:'A Dorian — 16th pocket',    kind:'scale',
          config:{ key:'A', scale:'dorian', bpm:95, bars:8, meter:'4/4', subdivision:'sixteenth', direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'displace',name:'Rhythmic displacement',     kind:'rhythmic_displacement',
          config:{ key:'A', scale:'dorian', bpm:95, bars:8, meter:'4/4', subdivision:'sixteenth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'shells',  name:'Shell voicings',            kind:'shell_voicings',
          config:{ key:'A', scale:'dorian', progression:'i-VII-VI-VII', chordDepth:'seventh', chordOverride:'min7', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'octaves', name:'Octave displacement',       kind:'octave_displacement',
          config:{ key:'A', scale:'dorian', bpm:95, bars:8, meter:'4/4', subdivision:'sixteenth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } }
      ]
    },
    metal_technique: {
      version:1,
      name:'Metal Technique',
      description:'Chromatic warm-up into a chromatic-pedal chug, the Phrygian-dominant exotic run, then minor-triad sweeps — the heavy rhythm-and-shred toolkit in E.',
      stringSetup:'guitar_6_standard',
      tags:['metal','advanced'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'warmup',  name:'Chromatic warm-up',         kind:'chromatic',
          config:{ chromaticPattern:'1234', bpm:90, bars:8, direction:'up_down', fretboardSystem:'position', fretMin:1, fretMax:4, meter:'4/4', subdivision:'sixteenth', keyCycle:'none' } },
        { id:'chug',    name:'Chromatic pedal chug',      kind:'pedal_riff',
          config:{ harmonize:false, scale:'phrygian', key:'E', meter:'4/4', subdivision:'sixteenth', bpm:120, bars:8, direction:'up_down', fretboardSystem:'position', progression:'metal_pedal_chromatic', chordOverride:'5', swing:'straight', fretMin:0, fretMax:7, keyCycle:'none' } },
        { id:'exotic',  name:'Phrygian dominant — fours',  kind:'scale',
          config:{ key:'E', scale:'phrygian_dominant', bpm:100, bars:8, meter:'4/4', subdivision:'sixteenth', direction:'up_down', sequence:'fours', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'sweeps',  name:'Minor-triad sweeps',        kind:'sweep_arpeggios',
          config:{ key:'E', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:80, bars:8, direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } }
      ]
    },
    // Djent ladder rung 6 — "The Breathe" (panel 2026-06-05). The clean↔heavy
    // dynamic arc is the skill djent players most lack; a single pathway can't
    // switch audioProfile mid-exercise, so it ships as a two-block Workout (the
    // flagged per-section profile toggle would collapse this to one rung). Same
    // key both blocks: the clean let-ring block makes room an octave up, then
    // resolves INTO the grouping chug — the heavy hits harder because the clean
    // breathed first. Memory project_djent_ladder_design.
    djent_breathe: {
      version:1,
      name:'Djent — The Breathe (clean ↔ heavy)',
      description:'The dynamic arc most chug practice skips: a clean, let-ring arpeggio interlude that makes space, resolving into the palm-muted 3+3+2 grouping chug. Same key, two worlds — dynamics are the skill, not speed.',
      stringSetup:'guitar_6_drop_d',
      tags:['metal','djent','dynamics','intermediate'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        { id:'breathe', name:'The Breathe — clean let-ring arpeggios', kind:'diatonic_arpeggios',
          config:{ key:'D', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', bpm:90, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', fretboardSystem:'caged', shape:'E', keyCycle:'none' } },
        { id:'resolve', name:'The Resolve — grouping chug (3+3+2)',    kind:'pedal_riff',
          config:{ harmonize:false, key:'D', scale:'phrygian', meter:'8/8:3+3+2', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', fretboardSystem:'position', progression:'metal_pedal_chromatic', chordOverride:'5oct', audioProfile:'djent', swing:'straight', fretMin:0, fretMax:7, keyCycle:'none' } }
      ]
    },
    bass_foundations: {
      version:1,
      name:'Bass Foundations',
      description:'A first bass routine: chromatic finger drills, the minor-pentatonic box, chord-tone (arpeggio) targeting, then a walking line over ii–V–I.',
      stringSetup:'bass_4_standard',
      tags:['bass','beginner'],
      bpmLadder:{ enabled:false },
      keyCycle:{ enabled:false },
      segments:[
        // Window at frets 5–8, NOT 1–4 (bass-pedagogy fix-first, 2026-06-06): a
        // flat four-fret stretch at the nut on a 34" scale is the veto-case
        // fingering; every bass method runs this drill from the 5th fret.
        { id:'chromatic', name:'Chromatic 1-2-3-4',       kind:'chromatic',
          config:{ chromaticPattern:'1234', bpm:70, bars:8, direction:'up_down', fretboardSystem:'position', fretMin:5, fretMax:8, meter:'4/4', subdivision:'eighth', stringSetup:'bass_4_standard', keyCycle:'none' } },
        { id:'pent',      name:'A minor pentatonic',       kind:'scale',
          config:{ key:'A', scale:'minor_pentatonic', bpm:80, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', sequence:'none', fretboardSystem:'position', fretMin:0, fretMax:5, stringSetup:'bass_4_standard', keyCycle:'none' } },
        { id:'arps',      name:'Chord-tone targeting',     kind:'diatonic_arpeggios',
          config:{ key:'C', scale:'major', chordDepth:'triad', chordOverride:'auto', bpm:80, bars:8, meter:'4/4', subdivision:'eighth', direction:'up_down', fretboardSystem:'position', stringSetup:'bass_4_standard', keyCycle:'none' } },
        { id:'walk',      name:'Walking bass — ii–V–I',    kind:'walking_bass',
          config:{ key:'C', scale:'major', progression:'ii-V-I', chordDepth:'seventh', chordOverride:'auto', bpm:80, bars:8, meter:'4/4', subdivision:'quarter', direction:'up_down', fretboardSystem:'position', stringSetup:'bass_4_standard', keyCycle:'none' } }
      ]
    },

    // ═══ Phase 7 — starter sessions as ROLE-SKELETONS of template-refs ═════════
    // Each segment is a { id, templateId } ref into SEGMENT_TEMPLATES (materialized
    // at the top of buildSessionChart via rollSegment); inline-config sessions above
    // still work. Composition rules: warm-up first · ≥1 isolation before application
    // · ≤2 same-primitive in a row · ~3–5 blocks. The session's stringSetup must
    // match the templates' instrument (guitar refs in guitar sessions, bass in bass).
    core_beginner_guitar: {
      version:1, name:'Core — Beginner (guitar)',
      description:'The first-year bedrock as one routine: chromatic warm-up → the minor-pentatonic box → the major scale in CAGED shapes → diatonic triads → a relaxed cool-down.',
      stringSetup:'guitar_6_standard', tags:['beginner','foundational','guitar'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'g_warm_chromatic' }, { id:'box', templateId:'g_tech_pentatonic_box' }, { id:'scale', templateId:'g_scale_major_caged' }, { id:'arps', templateId:'g_arp_triads' }, { id:'cool', templateId:'g_cool_scale' } ],
    },
    rock_rhythm_lead: {
      version:1, name:'Rock — Rhythm & Lead',
      description:'Warm up, lock power-chord changes, drive an eighth-note power-chord strum, then improvise over a rock vamp.',
      stringSetup:'guitar_6_standard', tags:['rock','beginner','guitar'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'g_warm_chromatic' }, { id:'power', templateId:'g_tech_power_chords' }, { id:'strum', templateId:'g_comp_rock' }, { id:'jam', templateId:'g_jam_rock' } ],
    },
    blues_workout: {
      version:1, name:'Blues — Lead Workout',
      description:'Warm up, work whole-step bend intonation, learn the blues scale, phrase it over a 12-bar shuffle, then jam.',
      stringSetup:'guitar_6_standard', tags:['blues','intermediate','guitar'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'g_warm_chromatic' }, { id:'bends', templateId:'g_tech_bending' }, { id:'scale', templateId:'g_blues_scale' }, { id:'shuffle', templateId:'g_app_blues_shuffle' }, { id:'jam', templateId:'g_jam_blues' } ],
    },
    jazz_changes: {
      version:1, name:'Jazz — Playing the Changes',
      description:'Warm up, build seventh-arpeggio vocabulary, voice-lead guide tones, run scales over a ii–V–I, then explore a modal vamp.',
      stringSetup:'guitar_6_standard', tags:['jazz','intermediate','guitar'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'g_warm_scale' }, { id:'arps', templateId:'g_arp_diatonic_7th' }, { id:'guide', templateId:'g_app_guide_tones' }, { id:'changes', templateId:'g_app_ii_v_i' }, { id:'vamp', templateId:'g_jam_modal' } ],
    },
    metal_shred: {
      version:1, name:'Metal — Technique',
      description:'Chromatic warm-up → metalcore pedal chug → melodic gallop → the Phrygian-dominant exotic run → minor-triad sweeps.',
      stringSetup:'guitar_6_standard', tags:['metal','advanced','guitar'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'g_warm_chromatic' }, { id:'chug', templateId:'g_metal_metalcore' }, { id:'gallop', templateId:'g_metal_gallop' }, { id:'exotic', templateId:'g_metal_phrygian' }, { id:'sweeps', templateId:'g_tech_sweep' } ],
    },
    funk_rhythm_guitar: {
      version:1, name:'Funk — Rhythm Guitar',
      description:'Warm up, sit in a 16th-note pocket, lock a muted 16th funk-scratch comp, then jam over a modal vamp.',
      stringSetup:'guitar_6_standard', tags:['funk','intermediate','guitar'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'g_warm_chromatic' }, { id:'pocket', templateId:'g_tech_16th_pocket' }, { id:'scratch', templateId:'g_comp_funk' }, { id:'jam', templateId:'g_jam_modal' } ],
    },
    lead_technique: {
      version:1, name:'Lead Technique Builder',
      description:'Warm up, then drill the lead toolkit: legato fluency, clean sweep picking, and a pentatonic recall.',
      stringSetup:'guitar_6_standard', tags:['technique','intermediate','guitar'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'g_warm_chromatic' }, { id:'legato', templateId:'g_tech_legato' }, { id:'sweep', templateId:'g_tech_sweep' }, { id:'review', templateId:'g_review_pentatonic' } ],
    },
    daily_balanced_guitar: {
      version:1, name:'Daily — Balanced (guitar)',
      description:'A rounded daily session: chromatic warm-up → the pentatonic box → a Dorian scale focus → a mode-per-chord application → a cool-down.',
      stringSetup:'guitar_6_standard', tags:['daily','intermediate','guitar'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'g_warm_chromatic' }, { id:'box', templateId:'g_tech_pentatonic_box' }, { id:'dorian', templateId:'g_scale_dorian' }, { id:'modal', templateId:'g_app_modal' }, { id:'cool', templateId:'g_cool_arpeggio' } ],
    },
    bass_foundations_groove: {
      version:1, name:'Bass — Foundations & Groove',
      description:'The bass bedrock in the right order: chromatic warm-up → right-hand alternation → the root–5th–octave box → the major scale box → a walking line.',
      stringSetup:'bass_4_standard', tags:['bass','beginner','foundational'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'b_warm_chromatic' }, { id:'rh', templateId:'b_tech_right_hand' }, { id:'box', templateId:'b_tech_root_fifth_octave' }, { id:'scale', templateId:'b_scale_major' }, { id:'walk', templateId:'b_app_walking' } ],
    },
    bass_technique_gym: {
      version:1, name:'Bass — Technique Gym',
      description:"Hands first, the bass way — for when you're not practicing songs: chromatic warm-up → pinky hammer-ons & pull-offs → right-hand alternation → a position shift → seventh-arp boxes → spend it on a walking line. Build the fretting and plucking hand, then end on real music.",
      stringSetup:'bass_4_standard', tags:['bass','technique','foundational'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'b_warm_chromatic' }, { id:'legato', templateId:'b_tech_legato' }, { id:'rh', templateId:'b_tech_right_hand' }, { id:'shift', templateId:'b_tech_position_shift' }, { id:'arps', templateId:'b_arp_sevenths' }, { id:'walk', templateId:'b_app_walking' } ],
    },
    bass_pocket: {
      version:1, name:'Bass — The Pocket',
      description:'Right-hand stamina → the octave bounce → the 16th-note dead-note pocket → a funk groove jam. Groove first, the bass way.',
      stringSetup:'bass_4_standard', tags:['bass','funk','intermediate'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'b_warm_chromatic' }, { id:'rh', templateId:'b_tech_right_hand' }, { id:'octave', templateId:'b_tech_octave_groove' }, { id:'dead', templateId:'b_tech_dead_note' }, { id:'jam', templateId:'b_jam_funk' } ],
    },
    bass_walking: {
      version:1, name:'Bass — Walking Lines',
      description:'Warm up, build seventh-arpeggio chord tones, voice-lead guide tones, then walk a ii–V–I and a 12-bar blues.',
      stringSetup:'bass_4_standard', tags:['bass','jazz','intermediate'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'b_warm_scale' }, { id:'arps', templateId:'b_arp_sevenths' }, { id:'guide', templateId:'b_app_guide_tones' }, { id:'walk', templateId:'b_app_walking' }, { id:'blues', templateId:'b_app_walking_blues' } ],
    },
    bass_slap_workout: {
      version:1, name:'Bass — Slap & Pop',
      description:'Build the right hand and the dead-note pocket first, THEN add slap & pop (gated after fingerstyle), and jam it.',
      stringSetup:'bass_4_standard', tags:['bass','funk','advanced'],
      bpmLadder:{ enabled:false }, keyCycle:{ enabled:false },
      segments:[ { id:'warmup', templateId:'b_warm_chromatic' }, { id:'rh', templateId:'b_tech_right_hand' }, { id:'dead', templateId:'b_tech_dead_note' }, { id:'slap', templateId:'b_tech_slap' }, { id:'jam', templateId:'b_jam_funk' } ],
    }
  };
