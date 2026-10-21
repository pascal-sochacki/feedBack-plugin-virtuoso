// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Christian Cowan
// Keep this shared object mutable: the shell catalog inserts authored lessons.
export const PATHWAYS = {
    blues_foundation: {
      label:'Blues Scale Foundation',
      goal:'Minor pentatonic with the flat-5 blue note added. That one extra note is what separates a scale run from a blues lick. Play it over a 12-bar blues and land on the b5 for tension — resolve it up to the 5th.',
      scales:['blues','minor_pentatonic'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'blues', meter:'4/4', subdivision:'eighth', bpm:80, bars:12, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'12_bar_blues', chordDepth:'seventh', chordOverride:'dom7', drums:'none' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' } ]
    },
    blues_shuffle: {
      label:'Blues Shuffle',
      goal:'Play blues licks over a real shuffle. The backing walks a root–5–6–♭7 boogie bass with off-beat 9th-chord stabs, all swung — the dominant I7–IV7–V7 feel. Lock your phrasing to the triplet pocket: land chord tones on the beat, save the ♭5 and ♭3 for the swung off-beats. This is where the scale becomes music.',
      scales:['blues','minor_pentatonic'],
      tempoTiers:[80, 100, 120, 140],
      base:{ practiceType:'scale', scale:'blues', meter:'4/4', subdivision:'eighth', bpm:100, bars:12, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'12_bar_blues', chordDepth:'seventh', chordOverride:'dom7', backingStyle:'boogie', swing:'shuffle', audioProfile:'blues' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' }, { key:'D', shape:'E' } ]
    },
    pent_foundation: {
      label:'Pentatonic Foundation',
      goal:'Play minor pentatonic box 1 over a 12-bar blues. The single most useful guitar drill — every rock and blues solo lives in this combination.',
      scales:['minor_pentatonic','blues','major_pentatonic'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:80, bars:12, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'12_bar_blues', chordDepth:'seventh', chordOverride:'dom7', drums:'none' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' } ]
    },
    major_pent_country: {
      label:'Major Pentatonic Country',
      goal:'Country and southern rock vocabulary. Major pentatonic sits over the chord so every note is a chord tone or a step away — nothing clashes. Target the 2nd and 6th for the Nashville twang. G is the classic country key; I-IV-V keeps it honest.',
      scales:['major_pentatonic','major','blues'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'scale', scale:'major_pentatonic', meter:'4/4', subdivision:'eighth', bpm:95, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'I-IV-V', chordDepth:'triad', chordOverride:'auto', key:'G', fretMin:3, fretMax:7 },
      vary:[ { key:'G', shape:'G' }, { key:'A', shape:'E' }, { key:'D', shape:'E' }, { key:'E', shape:'E' }, { key:'C', shape:'E' } ]
    },
    dorian_groove: {
      label:'Dorian Groove',
      goal:'Natural minor with a raised 6th — that one note gives it a brighter, jazzier feel than straight Aeolian. The raised 6th is the money note; it lives in the major IV chord (the i–IV Dorian vamp), so the backing actually sounds it against the i. Dorian is the go-to scale for blues-jazz and funk grooves.',
      scales:['dorian','natural_minor','minor_pentatonic'],
      tempoTiers:[65, 85, 105, 125],
      base:{ practiceType:'scale', scale:'dorian', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'dorian_vamp', chordDepth:'seventh', chordOverride:'auto', key:'A', fretMin:5, fretMax:9 },
      vary:[ { key:'A', shape:'E' }, { key:'D', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' } ]
    },
    chord_tone_targeting: {
      label:'Chord Tone Targeting',
      goal:"Keep the key's scale, but watch the accents shift to chord tones as the progression moves. Trains chord-tone awareness inside familiar scale shapes.",
      scales:['major','natural_minor','dorian','mixolydian'],
      tempoTiers:[65, 90, 110, 130],
      base:{ practiceType:'chord_scales', chordScaleStrategy:'chord_tone_emphasis', scale:'major', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'ascending', sequence:'fours', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', fretMin:0, fretMax:7 },
      vary:[ { key:'C', progression:'diatonic' }, { key:'C', progression:'I-IV-V' }, { key:'G', progression:'I-V-vi-IV' }, { key:'D', progression:'I-vi-IV-V' }, { key:'A', progression:'vi-IV-I-V' } ]
    },
    modal_awareness: {
      label:'Modal Awareness',
      goal:'Train your ear to follow the harmony: every chord is voiced as a dom7 so the chord-scale must shift dramatically from bar to bar, and you learn to HEAR the change and re-orient instantly. The skill is per-chord awareness — switching scale color the moment the chord moves, the foundation of playing the changes. (A deliberate ear-training exaggeration; for the true diatonic modes in context, use the modal vamps.)',
      scales:['major','dorian','phrygian','lydian','mixolydian','natural_minor','locrian'],
      tempoTiers:[60, 85, 105, 125],
      base:{ practiceType:'chord_scales', chordScaleStrategy:'mode_of_moment', scale:'major', chordDepth:'seventh', chordOverride:'dom7', progression:'diatonic', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', fretMin:0, fretMax:7 },
      vary:[ { key:'C' }, { key:'G' }, { key:'D' }, { key:'A' }, { key:'F' } ]
    },
    diatonic_triad_drill: {
      label:'Diatonic Triad Drill',
      goal:'Build the triad of every chord in the key, in order — the 7-chord lap. The skill is spelling each diatonic chord as an arpeggio and hearing the qualities change (minor, diminished, major…). This is how a scale becomes chord tones — the foundation of arpeggio soloing, and the entry to the Triads ladder.',
      scales:['natural_minor','major','harmonic_minor','melodic_minor'],
      tempoTiers:[70, 100, 120, 144],
      base:{ practiceType:'diatonic_arpeggios', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:100, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'G' }, { key:'C', shape:'A' } ]
    },
    // ── Triad Mastery ladder (Concepts family) ──────────────────────────────────
    // A "concept ladder": one skill sequenced easy→mastery (inversions → positions →
    // over changes → pairs), a VERTICAL column through difficulty vs the Core bands'
    // horizontal staircase. ~80% curation of existing arpeggio generators; the
    // differentiating rung (upper-structure triad over a moving bass) is the queued
    // new generator — see docs/plugin/design/triad-mastery-ladder.md. Reviewed: guitar-pedagogy +
    // harmony-theory (2026-06-03). Each goal-card NAMES the transferable skill.
    triad_inversions: {
      label:'Triad Inversions',
      goal:"The three inversions of a triad in one place — root position (1-3-5), first (3-5-1), second (5-1-3). The skill is hearing which chord tone is on TOP and recognizing the same triad in three shapes. This is how you find a chord anywhere on the neck and voice-lead smoothly between changes.",
      scales:['major','natural_minor'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'arpeggio_inversions', scale:'major', chordDepth:'triad', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:7 },
      vary:[ { key:'C', scale:'major' }, { key:'A', scale:'natural_minor' }, { key:'G', scale:'major' }, { key:'E', scale:'natural_minor' }, { key:'D', scale:'major' } ]
    },
    triad_five_shapes: {
      label:'Triads Across the Neck',
      goal:'The same triads, five positions. Walk the diatonic triads through each CAGED shape so you see a chord in every region of the neck — a triad is the top three strings of the barre chord you already know. Connect the shapes and the whole fretboard opens up.',
      scales:['major','natural_minor','dorian'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'diatonic_arpeggios', scale:'major', chordDepth:'triad', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:95, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'C' },
      vary:[ { key:'C', shape:'C' }, { key:'C', shape:'A' }, { key:'C', shape:'G' }, { key:'C', shape:'E' }, { key:'C', shape:'D' } ]
    },
    triads_over_changes: {
      label:'Triads Over Changes',
      goal:'Now use them: outline each chord with its triad as the progression moves (I-V-vi-IV). Land on the nearest inversion instead of jumping back to the root every bar — the start of real voice-leading. Triads are the skeleton under every solo and comp.',
      scales:['major','natural_minor'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'progression_arpeggios', scale:'major', chordDepth:'triad', chordOverride:'auto', progression:'I-V-vi-IV', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'C' },
      vary:[ { key:'C', progression:'I-V-vi-IV' }, { key:'C', progression:'I-IV-V' }, { key:'G', progression:'I-V-vi-IV' }, { key:'A', progression:'vi-IV-I-V' }, { key:'D', progression:'I-vi-IV-V' } ]
    },
    triad_pairs: {
      label:'Triad Pairs',
      goal:'Two triads a step apart, superimposed over one chord — six scale tones, the modern fusion / Lydian sound (C + D triads over Cmaj = the bright ♯11 color). A triad pair is an instant, symmetrical lead vocabulary you can sequence to sound sophisticated fast.',
      scales:['major','lydian','dorian'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'triadic_pairs', scale:'major', chordDepth:'triad', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:9 },
      vary:[ { key:'C', scale:'major' }, { key:'C', scale:'lydian' }, { key:'D', scale:'dorian' }, { key:'G', scale:'major' }, { key:'F', scale:'lydian' } ]
    },
    // ── Guide-Tones & Voice-Leading ladder (Concepts family) ────────────────────
    // The single highest-value harmony ladder (harmony-theory): changes are LINES,
    // not boxes — the 3rd/7th skeleton + nearest-tone voice leading through a tune.
    // Pure curation (shell_voicings → guide_tones → chord_scales/Connect). Reviewed
    // by harmony-theory (2026-06-03). See docs/plugin/design/triad-mastery-ladder.md (concept-ladder pattern).
    vl_shells: {
      label:'Shell Voicings',
      goal:'Three notes spell a chord: root, 3rd, 7th. Comp a ii–V–I with just those shells and you have the skeleton of jazz rhythm guitar — economical, voice-led, no mud. The 3rd and 7th carry the sound; the root only names it.',
      scales:['major'],
      tempoTiers:[55, 75, 95, 115],
      base:{ practiceType:'shell_voicings', scale:'major', progression:'ii-V-I', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'quarter', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:9 },
      vary:[ { key:'C' }, { key:'F' }, { key:'G' }, { key:'Bb' }, { key:'D' } ]
    },
    vl_guide_tones: {
      label:'Guide-Tone Lines',
      goal:'Drop the root and keep only the 3rd and 7th — the two notes that move the least and say the most. Through a ii–V–I they voice-lead by half-steps (the ♭7→3 resolution is the engine of the cadence). Two notes per chord, and you hear the changes.',
      scales:['major','dorian','mixolydian'],
      tempoTiers:[55, 75, 95, 115],
      base:{ practiceType:'guide_tones', scale:'major', progression:'ii-V-I', chordDepth:'seventh', voices:'both_alternating', meter:'4/4', subdivision:'quarter', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'E' },
      vary:[ { voices:'thirds_only' }, { voices:'sevenths_only' }, { voices:'both_alternating' }, { key:'F' }, { key:'Bb' } ]
    },
    vl_guide_changes: {
      label:'Guide Tones Through Changes',
      goal:'Take the guide-tone line off the single cadence and through a full progression (vi–ii–V–I, then the Rhythm-Changes A section). Same skill — nearest-tone voice leading — sustained across a tune. This is what makes a solo or comp follow the changes instead of running scales over them.',
      scales:['major','dorian'],
      tempoTiers:[55, 75, 95, 115],
      base:{ practiceType:'guide_tones', scale:'major', progression:'vi-ii-V-I', chordDepth:'seventh', voices:'both_alternating', meter:'4/4', subdivision:'quarter', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'E' },
      vary:[ { progression:'vi-ii-V-I' }, { progression:'rhythm_changes_a' }, { key:'F', progression:'vi-ii-V-I' }, { key:'Bb', progression:'rhythm_changes_a' }, { key:'G', progression:'vi-ii-V-I' } ]
    },
    vl_connect: {
      label:'Connect the Changes',
      goal:"Apply it as a line: run each chord's scale, but instead of restarting on the root every bar, land on the nearest guide tone (3rd or 7th) of the NEXT chord. That one habit — aim for the guide tone across the bar line — is what \"playing the changes\" means. The scale becomes a melody that follows the harmony.",
      scales:['major','dorian','mixolydian'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'chord_scales', chordScaleStrategy:'mode_of_moment', scale:'major', progression:'ii-V-I', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', swing:'swing', audioProfile:'jazz', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:7 },
      vary:[ { progression:'ii-V-I' }, { progression:'vi-ii-V-I' }, { key:'F', progression:'ii-V-I' }, { key:'G', progression:'I-V-vi-IV' }, { key:'Bb', progression:'vi-ii-V-I' } ]
    },
    // ── Arpeggio Mastery ladder (Concepts family) ───────────────────────────────
    // The arpeggio-spelling spine (harmony-theory): seventh arps → inversions → over
    // changes → swept application. Bridges Triads (below) and Guide-Tones (above).
    // Pure curation. Reviewed by harmony-theory + guitar-pedagogy (2026-06-03).
    arp_seventh_shapes: {
      label:'Seventh Arpeggios',
      goal:'Spell every diatonic seventh chord as an arpeggio — maj7, m7, dom7, m7♭5 — and find each in the CAGED shapes. A seventh arpeggio is the chord laid out one note at a time; learn the shapes and you can outline any chord anywhere on the neck.',
      scales:['major','natural_minor','dorian'],
      tempoTiers:[65, 90, 110, 130],
      base:{ practiceType:'diatonic_arpeggios', scale:'major', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'E' },
      vary:[ { shape:'E' }, { shape:'A' }, { shape:'G' }, { shape:'C' }, { shape:'D' } ]
    },
    arp_inversions: {
      label:'Arpeggio Inversions',
      goal:'The same seventh chord, started from each chord tone: root, 3rd, 5th, 7th. Inversions let you connect arpeggios up the neck and begin a line on any note — the difference between a stiff up-and-down arpeggio and one that flows into the next chord.',
      scales:['major','natural_minor'],
      tempoTiers:[60, 85, 105, 125],
      base:{ practiceType:'arpeggio_inversions', scale:'major', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:8 },
      vary:[ { key:'C', scale:'major' }, { key:'A', scale:'natural_minor' }, { key:'G', scale:'major' }, { key:'D', scale:'major' }, { key:'E', scale:'natural_minor' } ]
    },
    arp_over_changes: {
      label:'Arpeggios Over Changes',
      goal:"Outline a progression: play each chord's arpeggio as the changes move (ii–V–I, then vi–ii–V–I). Chasing the arpeggio of the moment is the most direct way to spell the harmony in a solo — every note is a chord tone, so you're never wrong, only more or less melodic.",
      scales:['major','dorian'],
      tempoTiers:[65, 90, 110, 130],
      base:{ practiceType:'progression_arpeggios', scale:'major', chordDepth:'seventh', chordOverride:'auto', progression:'ii-V-I', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'E' },
      vary:[ { progression:'ii-V-I' }, { progression:'vi-ii-V-I' }, { key:'F', progression:'ii-V-I' }, { key:'G', progression:'I-V-vi-IV' }, { key:'A', progression:'vi-IV-I-V' } ]
    },
    arp_sweeps: {
      label:'Sweep Arpeggios',
      goal:'The fast application: one chord tone per string, raked low-to-high with a hammer/pull turnaround at the apex, then back down. Sweep picking turns the arpeggio into a fluid cascade. Start slow — sweeps reward clean string-muting and hand-sync over speed.',
      scales:['natural_minor','harmonic_minor','major'],
      tempoTiers:[50, 65, 80, 100],
      base:{ practiceType:'sweep_arpeggios', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:65, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'A', shape:'A' }, { key:'D', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'G' } ]
    },
    // ── Fretboard Freedom ladder (Concepts family) ──────────────────────────────
    // The fretboard-mastery vertical (learning-design's "#1 player ask"): one box →
    // CAGED links → position shifts → 3NPS → whole-neck. Pure curation (scale across
    // fretboardSystems + position_shift). Difficulty axis = spatial coverage, not tempo.
    fb_one_box: {
      label:'One Box',
      goal:'Own one box cold. The major scale in a single CAGED position — the same five-fret zone in every key. Before you connect the neck you need one shape so automatic you can solo in it without looking. The foundation the whole map is built on.',
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[60, 85, 105, 130],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'E' },
      vary:[ { key:'C', shape:'E' }, { key:'A', shape:'E' }, { key:'G', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' } ]
    },
    fb_caged_links: {
      label:'CAGED Links',
      goal:'Connect the boxes. The same major scale through all five CAGED shapes in one key — E, A, G, C, D — overlapping zones that cover the neck. The skill is seeing where one shape ends and the next begins, so the scale stops being a box and becomes a continuum.',
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[60, 85, 105, 130],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'E' },
      vary:[ { shape:'E' }, { shape:'A' }, { shape:'G' }, { shape:'C' }, { shape:'D' } ]
    },
    fb_position_shifts: {
      label:'Position Shifts',
      goal:'Move between zones smoothly. A run that deliberately shifts position mid-phrase — slide a finger to the next region instead of staying boxed in. Clean position shifts are how a solo travels the neck without a seam.',
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[60, 85, 105, 130],
      base:{ practiceType:'position_shift', scale:'major', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:5 },
      vary:[ { key:'C', fretMin:0, fretMax:5 }, { key:'G', fretMin:2, fretMax:7 }, { key:'A', fretMin:4, fretMax:9 }, { key:'E', fretMin:0, fretMax:5 }, { key:'D', fretMin:2, fretMax:7 } ]
    },
    fb_3nps: {
      label:'Three Notes Per String',
      goal:'Three notes per string — the seven modal positions that make fast legato and alternate-picked runs flow. The even three-per-string layout is the shred system: each position is one mode, and they tile the whole neck.',
      scales:['major','natural_minor','dorian'],
      tempoTiers:[65, 90, 110, 135],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'3nps', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:1 },
      vary:[ { shape:1 }, { shape:2 }, { shape:3 }, { shape:5 }, { shape:7 } ]
    },
    fb_whole_neck: {
      label:'Whole-Neck Freedom',
      goal:'Stop thinking in boxes at all. The full-neck map shows every note in the key from the nut to the top — one connected field. The endgame: find any key by feel anywhere, connect zones without seams, and play the whole fretboard as one instrument.',
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'full_neck', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C' },
      vary:[ { key:'C' }, { key:'G' }, { key:'A' }, { key:'E' }, { key:'D' } ]
    },
    // ── Intervals ladder (Concepts family) ──────────────────────────────────────
    // The single-note diatonic interval-SEQUENCE skill, easy→mastery: 3rds/4ths/5ths
    // in one box → 6ths → the same intervals traveling the neck → mixed over a backing.
    // Distinct from the harmonized scale_thirds/scale_sixths DOUBLE-STOPS. Each pattern
    // indexes consecutive scale DEGREES, so the offset IS the diatonic interval (quality
    // alternates to stay in key: the vii 5th is a dim5, the IV 4th an aug4 — correct,
    // not a bug). instAgnostic — adapts to guitar (CAGED shape) OR bass (position box +
    // the player's tuning). Bass windows (fretMin/fretMax) follow the key so the root
    // sits low in the box, per the bass spine; guitar uses the shape + ignores them.
    // Built from beyoki's Discord ask (a beginning bassist) + a 4-agent panel review
    // (guitar/bass-pedagogy + harmony + L&D), 2026-06-11.
    diatonic_intervals: {
      label:'Thirds, Fourths & Fifths',
      goal:"Play the scale in leaps, not steps: thirds (1-3, 2-4…), then fourths and fifths. Skipping through the scale this way trains your ear to HEAR each interval and your hand to FIND it anywhere in the key — and stacking the diatonic 3rds IS the harmonized scale, every chord in the key. It stays diatonic, so it's locked to the key: change the key and the intervals follow. One leap per key sounds 'spicy' — the tritone (the ♭5 between the 4th and 7th degrees); that's the diatonic truth, not a wrong note. Start slow in one box and keep every leap dead even and in tune — speed comes after the ear does. Works the same on guitar or bass.",
      scales:['major','natural_minor'],
      tempoTiers:[50, 65, 80, 95],
      instAgnostic:true,
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:55, bars:8, direction:'up_down', sequence:'thirds', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E', fretMin:2, fretMax:7 },
      vary:[ { sequence:'thirds', key:'G', fretMin:2, fretMax:7 }, { sequence:'fourths', key:'G', fretMin:2, fretMax:7 }, { sequence:'fifths', key:'G', fretMin:2, fretMax:7 }, { sequence:'thirds', key:'E', fretMin:0, fretMax:5 }, { sequence:'fifths', key:'E', fretMin:0, fretMax:5 } ]
    },
    // GUITAR Sixths (instrument-SPLIT, panel ruling 2026-06-11): 6ths are a guitar-
    // specific grip lesson — the major-3rd between strings 2-3 (the B string) makes a
    // 6th a tidy adjacent/skipped-string shape that SHIFTS one fret across that
    // boundary. Bass's uniform 4ths can't mirror it (a bass 6th is a punishing
    // consecutive cross-string run), so bass gets its own rung below (isHiddenNode
    // shows each instrument only its own).
    int_sixths: {
      label:'Sixths',
      goal:"The widest of the small skips: diatonic sixths (1-6, 2-7…). On guitar the third between the G and B strings makes 6ths fall into a tidy two-string shape — but that shape SHIFTS a fret the moment the pair crosses the B string, which is the real lesson. Sixths are the sound of harmonized leads — soul, country, classic rock. Mind the string-skip and let the grip move at the B string; keep every pair even and in tune.",
      scales:['major','natural_minor'],
      tempoTiers:[50, 65, 80, 95],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:55, bars:8, direction:'up_down', sequence:'sixths', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E' },
      vary:[ { key:'G', shape:'E' }, { key:'E', shape:'E' }, { key:'A', shape:'E' }, { key:'A', scale:'natural_minor', shape:'E' }, { key:'C', shape:'A' } ]
    },
    // BASS Sixths (instrument-split): on a 4-string all-4ths neck a 6th is a 2-string
    // skip — a wide, cross-string reach, not the guitar grip. Drill it slow and
    // relaxed in a key-tracked box; in real bass lines a 6th is usually octave-
    // displaced (played as a descending 3rd), so this builds the ear + the reach, not
    // a lick. Bass-pedagogy ruling 2026-06-11.
    bass_int_sixths: {
      label:'Sixths',
      goal:"On bass a sixth is a wide two-string skip — the biggest reach in the interval set. Take it slow: hear the sweet major 6th and the darker minor 6th, and let the fretting hand learn the clean cross-string jump. In real bass lines you'll often flip a 6th down into a 3rd (same notes, an octave closer) — but owning the full reach first means you can hear and place it either way.",
      scales:['major','natural_minor'],
      tempoTiers:[45, 58, 72, 88],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:50, bars:8, direction:'up_down', sequence:'sixths', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'G', fretMin:2, fretMax:7 },
      vary:[ { key:'G', fretMin:2, fretMax:7 }, { key:'E', fretMin:0, fretMax:5 }, { key:'A', fretMin:4, fretMax:9 }, { key:'A', scale:'natural_minor', fretMin:4, fretMax:9 }, { key:'C', fretMin:5, fretMax:10 } ]
    },
    // GUITAR Across-the-Neck (instrument-split): the CAGED-shape ROTATION lesson —
    // one key, the same interval, rotated through the five C-A-G-E-D zones up the
    // neck. CAGED is a guitar system; bass has no C/A/G/E/D box geometry, so bass
    // gets the honest equivalent (a position-shift WALK) below — never a hidden gap.
    int_across_neck: {
      label:'Across the Neck',
      goal:"Take the intervals off-island. Play thirds through one key, but shift the SAME interval up the neck through the five CAGED zones — C, A, G, E, D — until you can find a third (or any interval) anywhere, not just in one shape. This is the 'up and down the fretboard' skill: the interval is the constant, the CAGED position is the variable.",
      scales:['major','natural_minor'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:60, bars:8, direction:'up_down', sequence:'thirds', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E' },
      vary:[ { shape:'G' }, { shape:'E' }, { shape:'D' }, { shape:'C' }, { shape:'A' } ]
    },
    // BASS Walk-the-Interval (instrument-split): the honest bass equivalent of the
    // guitar CAGED-rotation rung — same interval, one key, SHIFT the position box up
    // the neck (the bass player's neck-coverage skill is position shifting, not CAGED).
    bass_int_walk: {
      label:'Walk the Interval',
      goal:"Find the interval anywhere on the neck. Play thirds in one key, then shift your hand up a box at a time — same interval, new position — so you're not locked to one spot. This is the bassist's 'up and down the neck' skill: the interval stays the same, your hand learns to find it high or low. The reach between boxes is the lesson; keep the shifts clean and in time.",
      scales:['major','natural_minor'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:60, bars:8, direction:'up_down', sequence:'thirds', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'G', fretMin:2, fretMax:7 },
      vary:[ { fretMin:2, fretMax:7 }, { fretMin:5, fretMax:10 }, { fretMin:7, fretMax:12 }, { fretMin:9, fretMax:14 }, { fretMin:0, fretMax:5 } ]
    },
    int_mixed: {
      label:'Interval Workout',
      goal:"Own them all, by ear. Cycle thirds → fourths → fifths → sixths → arpeggios over a I-IV-V backing, so you're not just running shapes — you're HEARING each interval against a chord and using it to connect to the next chord tone. This is where the drill becomes music: the intervals you've banked turn into melodies and fills.",
      scales:['major','natural_minor'],
      tempoTiers:[60, 75, 90, 105],
      instAgnostic:true,
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:60, bars:8, direction:'up_down', sequence:'thirds', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E', fretMin:2, fretMax:7, progression:'I-IV-V', chordDepth:'triad', chordOverride:'auto' },
      vary:[ { sequence:'thirds' }, { sequence:'fourths' }, { sequence:'fifths' }, { sequence:'sixths' }, { sequence:'broken_triads' } ]
    },
    // Core-Beginner SEED rung (instAgnostic) — the discoverability fix the L&D review
    // asked for: a beginner who can't find interval practice meets it in the always-
    // visible Core (the Intervals pack is opt-in). One rung only — Root–3rd–5th by ear
    // — a tiny step up from bass_root_fifth_octave (same box, add the 3rd). Lives in the
    // core_beginner band; the full treatment is the opt-in Intervals ladder above.
    core_root_third_fifth: {
      label:'Root–3rd–5th by Ear',
      goal:"The three notes every chord is built from — root, third, fifth — spelled up through the scale (1-3-5, 2-4-6…). The third is the note that tells major from minor; the fifth is a bass player's home base. Hear and find these and you can outline any chord in the key by ear — the foundation of arpeggios, bass lines, and improvising. Start slow in one box; name each note as you play it.",
      scales:['major','natural_minor'],
      // Density ladder (panel 2026-06-12, bass-pedagogy MUST-fix): a broken-triad
      // sequence is constant position shifts — the cold-hands load is shifts/sec,
      // not BPM. Quarter floor first (both instruments — the parity rule), eighths
      // only after the shape is owned; short bars at the bottom.
      tempoTiers:[50, 65, 70, 85],
      tempoTierSubdivs:['quarter', 'quarter', 'eighth', 'eighth'],
      tempoTierBars:[4, 4, 8, 8],
      instAgnostic:true,
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'quarter', bpm:50, bars:4, direction:'up_down', sequence:'broken_triads', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E', fretMin:2, fretMax:7 },
      vary:[ { key:'G', fretMin:2, fretMax:7 }, { key:'E', fretMin:0, fretMax:5 }, { key:'A', fretMin:4, fretMax:9 }, { key:'A', scale:'natural_minor', fretMin:4, fretMax:9 }, { key:'C', fretMin:5, fretMax:10 } ]
    },
    // ── Expression ladder (Concepts family) ─────────────────────────────────────
    // The "make a note SING" vertical (guitar-pedagogy #1): vibrato → half-bend →
    // whole-bend → mixed. Difficulty axis = pitch CONTROL/accuracy, not tempo (so
    // tempo tiers stay slow). Pure curation (vibrato + bending bendTarget). The
    // unison/oblique + microbend rungs (a 2-note bend param) are a queued follow-on.
    exp_vibrato: {
      label:'Vibrato',
      goal:'Make a fretted note sing. Controlled vibrato — even width, even speed, returning to pitch — is the difference between a dead note and a vocal one. Start wide and slow; the control is the skill, and it carries every other expressive move.',
      scales:['minor_pentatonic','blues','major_pentatonic','major'],
      tempoTiers:[45, 60, 75, 90],
      base:{ practiceType:'vibrato', scale:'minor_pentatonic', meter:'4/4', subdivision:'quarter', bpm:55, bars:8, direction:'up_down', sequence:'none', advancedMode:false, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'A' } ]
    },
    exp_bend_half: {
      label:'Half-Step Bends',
      goal:"The smaller bend, the harder ear. Half-step bends cover the least distance, so intonation is unforgiving — push to exactly a half step and hold it. If you can hear when you're sharp on a half-step bend, every bigger bend gets easier.",
      scales:['minor_pentatonic','blues','major_pentatonic'],
      tempoTiers:[50, 65, 80, 95],
      base:{ practiceType:'bending', bendTarget:'half', scale:'minor_pentatonic', meter:'4/4', subdivision:'quarter', bpm:55, bars:8, direction:'up_down', advancedMode:false, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'A' } ]
    },
    exp_bend_whole: {
      label:'Whole-Step Bends',
      goal:'The staple of blues and rock. Whole-step bends on the top three strings — push up a full tone, land dead in tune, hold, listen. Consistent intonation is the entire point; speed and showmanship come after the pitch is reliable.',
      scales:['minor_pentatonic','blues','major_pentatonic'],
      tempoTiers:[50, 65, 80, 95],
      base:{ practiceType:'bending', bendTarget:'whole', scale:'minor_pentatonic', meter:'4/4', subdivision:'quarter', bpm:55, bars:8, direction:'up_down', advancedMode:false, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'A' } ]
    },
    exp_bend_mixed: {
      label:'Mixed Bends',
      goal:"Now discriminate. Half- and whole-step bends interleaved — your hand has to know which distance it's pushing before it pushes. Mixing the two trains the muscle memory that makes bends land in tune every time, not just when you're thinking about it.",
      scales:['minor_pentatonic','blues','major_pentatonic'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'bending', bendTarget:'mixed', scale:'minor_pentatonic', meter:'4/4', subdivision:'quarter', bpm:60, bars:8, direction:'up_down', advancedMode:false, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'A' } ]
    },
    // ── BLUES genre ladder (deepens the style_blues pack) ───────────────────────
    // Genre ladder = the APPLICATION layer (vocabulary→technique→application→improv)
    // in the blues accent. Blues is the LEAST backing-gated genre (the boogie/shuffle
    // backing is built). Reviewed by blues-idiom-architect (2026-06-03). The turnaround
    // rung — held since 2026-06-03 pending "a turnaround-figure token" — shipped
    // 2026-06-12 as the riff-vocabulary pilot (blues_turnaround + _build below):
    // the token is COMMON_PROGRESSIONS.blues_turnaround + MOTIF_CELLS.
    blues_box: {
      label:'The Box & the Blue Note',
      goal:'Minor-pentatonic box 1 with the ♭5 blue note added, ridden over a 12-bar shuffle. The ♭5 is a passing target, not a landing — brush it and resolve up to the 5th. Get the shape automatic over the groove before you try to say anything with it. The home base of every blues solo.',
      scales:['blues','minor_pentatonic'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'scale', scale:'blues', meter:'4/4', subdivision:'eighth', bpm:70, bars:12, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'12_bar_blues', chordDepth:'seventh', chordOverride:'dom7', backingStyle:'boogie', swing:'shuffle', audioProfile:'blues', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' }, { key:'D', shape:'E' } ]
    },
    blues_bends: {
      label:'Bends & Vibrato — the Cry',
      goal:'The pitches blues lives on: the ♭3→3 curl, the whole-step cry, wide slow vibrato. Bend up to the target and HOLD it in tune; let the note shake. This is where scale tones become speech — a blues player is recognized by their bends and vibrato before their notes.',
      scales:['blues','minor_pentatonic'],
      tempoTiers:[50, 65, 80, 95],
      base:{ practiceType:'bending', bendTarget:'mixed', scale:'minor_pentatonic', meter:'4/4', subdivision:'quarter', bpm:60, bars:12, direction:'up_down', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'12_bar_blues', chordOverride:'dom7', backingStyle:'boogie', swing:'shuffle', audioProfile:'blues', key:'A', shape:'E' },
      vary:[ { bendTarget:'whole' }, { bendTarget:'half' }, { bendTarget:'mixed' }, { key:'E', bendTarget:'mixed' }, { key:'G', bendTarget:'whole' } ]
    },
    blues_call_response: {
      label:'Call & Response',
      goal:'The conversation at the heart of the blues: a 2-bar phrase that asks, then space, then an answer that resolves. Play the call, leave the rest — the silence is the phrasing. Learn to ask and answer with the same three notes and you are playing blues, not running a scale.',
      scales:['blues','minor_pentatonic','major_pentatonic'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'call_response', scale:'blues', meter:'4/4', subdivision:'eighth', bpm:75, bars:12, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'12_bar_blues', chordOverride:'dom7', backingStyle:'boogie', swing:'shuffle', audioProfile:'blues', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'A' }, { key:'D', shape:'E' } ]
    },
    blues_mix: {
      label:'Major / Minor Mix',
      goal:'The sound of the pros: slipping between minor and major pentatonic over the same blues — the gritty ♭3 over the IV, the sweet major 6th over the I. Mixing the two boxes is what gives blues-rock and Texas blues its vocal, three-dimensional sound.',
      scales:['major_pentatonic','minor_pentatonic','blues'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'major_pentatonic', meter:'4/4', subdivision:'eighth', bpm:85, bars:12, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'12_bar_blues', chordDepth:'seventh', chordOverride:'dom7', backingStyle:'boogie', swing:'shuffle', audioProfile:'blues', key:'A', shape:'E' },
      vary:[ { scale:'major_pentatonic' }, { scale:'minor_pentatonic' }, { scale:'blues' }, { key:'E', scale:'major_pentatonic' }, { key:'G', scale:'minor_pentatonic' } ]
    },
    // ── Blues VOCABULARY rungs (riff-vocabulary pilot, 2026-06-12) ──────────────
    // The arc NAME → DRILL → VARY → CONSTRUCT → JAM (docs/plugin/riff-vocabulary-playbook.md):
    // the goal-card NAMES the device, the drill rung's vary[] is ONE axis
    // (transposition — D9: a lick clean in 5 keys is a transferable device; the
    // same lick at 200 BPM in one key is a parlor trick; tempoTiers short), the
    // _build rung IS the construction step, and the jam hand-off is the prereq
    // edge back into blues_call_response/blues_mix. The cell owns its harmony
    // (prog + dom7) — the rung deliberately codes NO progression/chordOverride.
    blues_turnaround: {
      label:'The Turnaround',
      goal:'The descending-3rds turnaround: parallel thirds sliding chromatically down from the ♭7 over the I, then turning to the V from a half-step above. This is the punctuation of the 12-bar form — bars 11 and 12, the figure that closes one chorus and hands you the next. Drill the same movable shape through five keys until it travels with you; then take it to Build Your Turnaround and assemble your own from the same moves.',
      scales:['blues','minor_pentatonic'],
      tempoTiers:[60, 80, 100],
      base:{ practiceType:'motif', motifCell:'blues_turnaround_thirds', scale:'blues', meter:'4/4', subdivision:'eighth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', backingStyle:'boogie', swing:'shuffle', audioProfile:'blues', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' }, { key:'D', shape:'E' } ]
    },
    blues_turnaround_build: {
      label:'Build Your Turnaround',
      goal:'The construction step: the band plays the descending-3rds turnaround as a two-bar call, then leaves two empty bars — yours. Answer with YOUR OWN turnaround: keep the chromatic-walkdown idea, change the rhythm, the register, the landing. The answer window is never scored — it is yours. When your own figure lands the V on time without thinking, you own the device, not a tab.',
      scales:['blues','minor_pentatonic'],
      tempoTiers:[60, 80, 100],
      base:{ practiceType:'motif', motifCell:'blues_turnaround_thirds', motifPhase:'construct', scale:'blues', meter:'4/4', subdivision:'eighth', bpm:70, bars:16, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', backingStyle:'boogie', swing:'shuffle', audioProfile:'blues', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' }, { key:'D', shape:'E' } ]
    },
    // ── ROCK genre ladder (new style_rock pack) ─────────────────────────────────
    // Classic/hard/alt rock (Metal already has its own pack). The APPLICATION layer:
    // power-chord drive → pentatonic lead → double-stops → riff-building → ♭VII changes.
    // Fully buildable on existing generators; the FEEL ceiling is the backing rebuild
    // (pad, not a rhythm-guitar). Reviewed by rock-idiom-architect (2026-06-03).
    rock_power_backbeat: {
      label:'Power Chords & the Backbeat',
      goal:'The engine of rock: root-5th power chords strummed through a three-chord change, locked to the backbeat. The skill is changing shapes cleanly in time and driving the 2-and-4 — the rhythm guitar every rock song is built on, before a single note of lead.',
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'strum_comp', scale:'major', chordDepth:'triad', chordOverride:'5', progression:'I-IV-V', meter:'4/4', subdivision:'eighth', bpm:100, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'E', shape:'E' },
      vary:[ { progression:'I-IV-V' }, { progression:'I-V-vi-IV', key:'G' }, { progression:'i-VII-VI-VII', scale:'natural_minor' }, { progression:'vi-IV-I-V', key:'A' }, { progression:'I-IV-V', key:'A' } ]
    },
    rock_pentatonic: {
      label:'The Pentatonic Box',
      goal:"Home territory for rock lead — minor pentatonic box 1, then the blues scale's ♭5 color, over a I-IV-V. Every classic rock solo lives here. Own the box cold so your hands are free to phrase, not hunt for notes.",
      scales:['minor_pentatonic','blues','major_pentatonic'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:95, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'I-IV-V', chordDepth:'triad', chordOverride:'auto', key:'E', shape:'E' },
      vary:[ { scale:'minor_pentatonic' }, { scale:'blues' }, { key:'A', scale:'minor_pentatonic' }, { key:'G', scale:'blues' }, { key:'D', scale:'minor_pentatonic' } ]
    },
    rock_lead_vocab: {
      label:'Double-Stops & Twin Leads',
      goal:'The harmony move that defines rock lead: double-stops in 3rds and 6ths, and harmonized twin-guitar lines. Two notes at once turn a single-line solo into a part. (For bends and vibrato, drill the Expression ladder — they pair directly with this.)',
      scales:['major','mixolydian','natural_minor'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale_thirds', scale:'major', harmonize:true, meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'I-IV-V', chordDepth:'triad', chordOverride:'auto', key:'A', shape:'E' },
      vary:[ { key:'A' }, { key:'G' }, { key:'E', scale:'mixolydian' }, { key:'D' }, { key:'A', scale:'mixolydian' } ]
    },
    rock_pedal_riff: {
      label:'Riff-Building with Pedal Tones',
      goal:'Where rock becomes architecture: a low pedal tone alternating with power-chord stabs, looser than a metal gallop, locked to the backbeat. The skill is building a RIFF — a repeating rhythmic-harmonic hook — not running a scale. The DNA of the rock song.',
      scales:['natural_minor','minor_pentatonic'],
      tempoTiers:[70, 90, 110, 130],
      base:{ practiceType:'pedal_riff', harmonize:false, scale:'natural_minor', key:'E', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'i-VII-VI-VII', chordOverride:'5', swing:'straight', fretMin:0, fretMax:7 },
      vary:[ { progression:'i-VII-VI-VII' }, { progression:'mixolydian_rock', scale:'mixolydian' }, { progression:'i-VI-III-VII' }, { progression:'I-IV-V', scale:'major', key:'A' }, { progression:'i-VII-VI-VII', key:'A' } ]
    },
    rock_classic_changes: {
      label:'Classic-Rock Changes',
      goal:'The harmonic fingerprint of classic rock — the I-♭VII-IV "train" cadence and the i-♭VII-♭VI minor loop — and soloing over them. Run the pentatonic/Mixolydian over the changes, landing chord tones as the progression moves. The ♭VII is the sound that separates rock from pop.',
      scales:['mixolydian','minor_pentatonic','natural_minor'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'chord_scales', chordScaleStrategy:'chord_tone_emphasis', scale:'mixolydian', chordDepth:'triad', chordOverride:'auto', progression:'mixolydian_rock', meter:'4/4', subdivision:'eighth', bpm:100, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'E', fretMin:0, fretMax:9 },
      vary:[ { progression:'mixolydian_rock', scale:'mixolydian' }, { progression:'i-VII-VI-VII', scale:'natural_minor' }, { progression:'I-V-vi-IV', scale:'major', key:'G' }, { progression:'mixolydian_rock', key:'A' }, { progression:'i-VI-III-VII', scale:'natural_minor' } ]
    },
    // ── COUNTRY genre ladder (deepens the style_country pack) ────────────────────
    // Reviewed by country-idiom-architect (2026-06-03). major_pent_country is reused
    // as rung 1. The chicken-pickin' "cluck" (an mt ghost) + true oblique double-stop
    // bends are flagged as deferred technique/backing-engine enhancements.
    country_cowboy_changes: {
      label:'Cowboy Changes',
      goal:'Open-position G, C, and D changes strummed in time — the rhythm-guitar bedrock of country. The skill is changing the open "cowboy" chords cleanly on the beat and hearing the I-IV-V root motion. Every country song lives on these three chords.',
      scales:['major'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'strum_comp', scale:'major', chordDepth:'triad', chordOverride:'auto', progression:'I-IV-V', meter:'4/4', subdivision:'eighth', bpm:100, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E' },
      vary:[ { progression:'I-IV-V' }, { progression:'I-V-vi-IV' }, { key:'A', progression:'I-IV-V' }, { key:'D', progression:'I-IV-V' }, { key:'C', progression:'I-V-vi-IV' } ]
    },
    country_double_stops: {
      label:'Double-Stops in 3rds & 6ths',
      goal:'The two-note country lead: diatonic double-stops in 6ths (and 3rds) sliding along the string pairs — the pedal-steel and Telecaster sound. Two notes at once turn a single line into a country part. This is the move that makes it sound country, not just major pentatonic.',
      scales:['major','major_pentatonic'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale_sixths', scale:'major', harmonize:true, progression:'I-IV-V', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E' },
      vary:[ { key:'G' }, { key:'A' }, { key:'D' }, { key:'C' }, { key:'E' } ]
    },
    country_chicken_pickin: {
      label:"Chicken Pickin'",
      goal:'The percussive country attack: flatpick the low note, snap the high note with your middle finger (hybrid picking). The skill is the pop-and-snap that drives a country lead. (The signature muted "cluck" ghost note is a backing-engine/technique enhancement still to come — for now, drill the pick-and-pluck coordination.)',
      scales:['major_pentatonic','major','mixolydian'],
      tempoTiers:[75, 95, 115, 135],
      base:{ practiceType:'hybrid_picking', scale:'major_pentatonic', progression:'I-IV-V', meter:'4/4', subdivision:'eighth', bpm:95, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E' },
      vary:[ { key:'G', shape:'E' }, { key:'A', shape:'E' }, { key:'D', shape:'E' }, { scale:'mixolydian', key:'G' }, { key:'C', shape:'E' } ]
    },
    country_pedal_bends: {
      label:'Pedal-Steel Bends',
      goal:'Mimic the pedal steel: slow, controlled bends that ease up into pitch. Country bends are about smooth, vocal intonation, not the aggressive blues-rock push — land the note dead in tune and let it sit. (True oblique double-stop bends, one voice bending while another holds, are a technique enhancement still to come.)',
      scales:['major_pentatonic','major'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'bending', bendTarget:'mixed', scale:'major_pentatonic', meter:'4/4', subdivision:'quarter', bpm:65, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E' },
      vary:[ { bendTarget:'whole' }, { bendTarget:'half' }, { bendTarget:'mixed' }, { key:'A' }, { key:'D' } ]
    },
    country_train: {
      label:'The Train & Soloing',
      goal:'The ♭VII "train" change — the I-♭VII-IV move that gives country-rock its drive — and soloing over it. Run major pentatonic and Mixolydian over the changes, landing chord tones as the ♭VII passes. The ♭VII is the chord that turns country into Southern rock.',
      scales:['mixolydian','major_pentatonic','major'],
      tempoTiers:[80, 100, 120, 145],
      base:{ practiceType:'chord_scales', chordScaleStrategy:'mode_of_moment', scale:'mixolydian', chordDepth:'triad', chordOverride:'auto', progression:'mixolydian_rock', meter:'4/4', subdivision:'eighth', bpm:100, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', fretMin:0, fretMax:9 },
      vary:[ { progression:'mixolydian_rock' }, { progression:'I-IV-V', scale:'major_pentatonic' }, { key:'A', progression:'mixolydian_rock' }, { key:'D', progression:'I-V-vi-IV', scale:'major' }, { progression:'mixolydian_rock', key:'E' } ]
    },
    // ── BASS FOUNDATIONS ladder (the first bass-NATIVE ladder) ───────────────────
    // Cross-instrument parity (project_cross_instrument_backing_unification): the
    // engine is shared; this is the bass-native CONTENT over the 5 bass groove
    // primitives (bass-pedagogy: "re-label, don't port" the guitar ladders). All
    // bass_4_standard / position. Reviewed by bass-pedagogy-architect's per-ladder verdict.
    bass_root_fifth_octave: {
      label:'Root–5th–Octave',
      feltGate:true,   // bass FEEL rung (tag pass 2026-06-12, QUALIFY): the 5th/octave partners clear the floor; the box is found "by feel".
      goal:'The foundational bass box: root, fifth, octave, fifth, anchored on each chord. Before scales, a bassist owns this shape — it outlines any chord and lays the harmonic floor under the band. The skill is finding the root and reaching the 5th/octave by feel in any key.',
      scales:['major','natural_minor'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'root_fifth_octave', scale:'major', progression:'I-IV-V', chordDepth:'triad', chordOverride:'auto', meter:'4/4', subdivision:'quarter', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:5, rfoPattern:'r5o' },
      // Final vary = the low-fifth reach (R–low5–5–8): the same box, now also
      // dropping BELOW the root — the move the low string exists for (and the
      // whole point of a 5-string's B). rfoPattern is coded explicitly in base
      // ('r5o') so the variant never leaks across this rung's own vary steps.
      vary:[ { key:'C', progression:'I-IV-V' }, { key:'G', progression:'I-IV-V' }, { key:'A', progression:'i-VII-VI-VII', scale:'natural_minor' }, { key:'E', progression:'I-V-vi-IV' }, { key:'D', progression:'I-IV-V' }, { key:'C', progression:'I-IV-V', rfoPattern:'low5', fretMin:0, fretMax:7 } ]
    },
    bass_octave_groove: {
      label:'Octave Groove',
      feltGate:true,   // bass FEEL rung (tag pass 2026-06-12, QUALIFY): the octave-up (≥82Hz) clears the floor every other onset. Dogfood watch: tier-4 (135, 8ths) is at the top of the measurable window.
      goal:'The disco/pop octave bounce: root and its octave, locked to the kick, the weight landing on the high octave (the pop up). The skill is the relentless, even octave pulse that drives dance and pop — the bassline as the engine of the groove.',
      scales:['major','natural_minor','dorian'],
      tempoTiers:[70, 95, 115, 135],
      base:{ practiceType:'octave_groove', scale:'major', progression:'I-V-vi-IV', chordDepth:'triad', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:100, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:5 },
      vary:[ { progression:'I-V-vi-IV' }, { progression:'vi-IV-I-V', key:'A' }, { progression:'i-VII-VI-VII', scale:'natural_minor', key:'A' }, { key:'G' }, { key:'E' } ]
    },
    bass_dead_notes: {
      label:'Dead-Note Pocket',
      goal:'The funk 16th pocket: real notes on the syncopated pushes, muted ghost notes filling the rest, only a couple of accents per bar. The skill is the pocket — which 16ths you sound, which you ghost, and locking the one to the kick. This is what makes a bassline groove instead of just outline the chord.',
      scales:['dorian','minor_pentatonic'],
      tempoTiers:[70, 90, 110, 130],
      base:{ practiceType:'dead_note_groove', scale:'dorian', progression:'static_i', chordDepth:'seventh', chordOverride:'min7', meter:'4/4', subdivision:'sixteenth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:0, fretMax:5 },
      vary:[ { key:'A' }, { key:'E' }, { progression:'i-VII-VI-VII' }, { key:'D' }, { key:'G' } ]
    },
    bass_walking: {
      label:'Walking Bass',
      feltGate:true,   // bass FEEL rung (v1 pilot): completes on a sustained POCKET (Settling-or-better), not a %; LOCKED raises the feltBpm PB. See docs/plugin/design/bass-felt-hold-roundtable.md.
      goal:'The jazz/blues engine: one note per beat, walking from chord to chord — root on the downbeat, chord tones and chromatic approach notes leading into the next change. The skill is voice-leading the bass line so it both outlines the harmony and pulls forward. The most-wanted bass skill in jazz and blues.',
      scales:['major','dorian','mixolydian'],
      tempoTiers:[65, 85, 105, 125],
      base:{ practiceType:'walking_bass', scale:'major', progression:'ii-V-I', chordDepth:'seventh', chordOverride:'auto', walkApproach:'chromatic', meter:'4/4', subdivision:'quarter', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:7 },
      vary:[ { progression:'ii-V-I', walkApproach:'chromatic' }, { progression:'12_bar_blues', chordOverride:'dom7', scale:'mixolydian', walkApproach:'mixed' }, { progression:'vi-ii-V-I', walkApproach:'dominant' }, { key:'F', progression:'ii-V-I' }, { key:'G', progression:'12_bar_blues', chordOverride:'dom7', walkApproach:'mixed' } ]
    },
    bass_slap: {
      label:'Slap & Pop',
      feltGate:true,   // bass FEEL rung (tag pass 2026-06-12, QUALIFY — thinnest sample): pops/accents clear the floor. Tiers 3–4 (110/130 16ths) sit past the bass-16th detection break → they degrade to "practiced" by the evidence gate (the gate WORKING); flips reliable at 70–90.
      goal:'The funk slap pocket: thumb-slapped roots (low) and popped octaves (high), ghost notes between, space and accents that snap. The skill is the percussive thumb/pop coordination and the syncopation against the one. Advanced — drill the fingerstyle pocket first, then add the snap.',
      scales:['minor_pentatonic','dorian'],
      tempoTiers:[70, 90, 110, 130],
      base:{ practiceType:'slap_pop', scale:'minor_pentatonic', progression:'static_i', chordDepth:'seventh', chordOverride:'min7', meter:'4/4', subdivision:'sixteenth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:0, fretMax:5 },
      vary:[ { key:'A' }, { key:'E' }, { progression:'i-VII-VI-VII' }, { key:'G' }, { key:'D' } ]
    },
    // ── BASS: SCALES / FRETBOARD ladder (new bass_scales_ladder pack) ───────────
    // The missing bass scale foundation (Foundations is groove-only). bass-pedagogy
    // panel 2026-06-07: the all-4ths MOVABLE box (never CAGED), foundation-first —
    // one box → two-octave shape → the modes in one shape → position shifts →
    // whole-neck. Difficulty axis = neck coverage. fretboardSystem:'position'
    // (+ 'full_neck' on the capstone); the window tracks the key so the ONE shape
    // stays movable. Spec: .claude/plans/proud-swinging-codd-agent-aff275c5*.md.
    bass_scale_one_box: {
      label:'One-Position Box',
      goal:"Own one box cold. The major scale in a single hand position — the same movable shape in every key, because the bass is tuned all in 4ths (no CAGED shapes to juggle). Below the 5th fret, reach it 1-2-4 (index–middle–pinky) with a small shift, not a flat four-fret stretch. The foundation the whole neck is built on.",
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'G', fretMin:2, fretMax:7 },
      vary:[ { key:'G', fretMin:2, fretMax:7 }, { key:'A', fretMin:4, fretMax:9 }, { key:'C', fretMin:7, fretMax:12 }, { key:'E', fretMin:0, fretMax:5 }, { key:'D', fretMin:2, fretMax:7 } ]
    },
    bass_scale_two_octave: {
      label:'The Two-Octave Scale',
      goal:"The bassist's signature shape: the scale climbing across all the strings, root to octave to octave. On a 4-string you reach about an octave and a half in one position, then shift the last stretch; on a 5-string the whole two octaves sit under one hand. The shape you'll run to warm up for the rest of your life.",
      scales:['major','natural_minor','dorian'],
      tempoTiers:[55, 75, 95, 115],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'G', fretMin:2, fretMax:9 },
      vary:[ { key:'G', fretMin:2, fretMax:9 }, { key:'C', fretMin:5, fretMax:12 }, { key:'A', scale:'natural_minor', fretMin:4, fretMax:11 }, { key:'E', stringSetup:'bass_5_standard', fretMin:0, fretMax:9 }, { key:'D', scale:'dorian', fretMin:2, fretMax:9 } ]
    },
    bass_scale_modes: {
      label:'Modes in One Shape',
      goal:"One fingering, seven modes. Keep the same box and just move which note is home: start on the 2nd degree and it's Dorian, on the 5th and it's Mixolydian. Because the bass box is symmetric (all 4ths) the SHAPE never changes — only the tonic does. Hear each mode's color out of one shape you already own.",
      scales:['major','dorian','mixolydian','natural_minor','phrygian'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:5, fretMax:10 },
      vary:[ { key:'C', scale:'major' }, { key:'D', scale:'dorian' }, { key:'E', scale:'phrygian' }, { key:'G', scale:'mixolydian' }, { key:'A', scale:'natural_minor' } ]
    },
    bass_scale_shifts: {
      label:'Position Shifts',
      goal:"Travel the neck. A run that deliberately shifts position mid-phrase — pivot a finger to the next zone instead of staying boxed in. An open string buys you the shift for free. Clean shifts are how a bassline moves up the neck without a seam.",
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[55, 70, 90, 110],
      base:{ practiceType:'position_shift', scale:'natural_minor', meter:'4/4', subdivision:'eighth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:0, fretMax:7 },
      vary:[ { key:'A', fretMin:0, fretMax:7 }, { key:'E', fretMin:0, fretMax:7 }, { key:'G', fretMin:2, fretMax:9 }, { key:'C', scale:'major', fretMin:3, fretMax:10 }, { key:'D', fretMin:2, fretMax:9 } ]
    },
    bass_scale_whole_neck: {
      label:'Whole-Neck Coverage',
      goal:"Stop thinking in boxes. The whole key from the open strings to the top, as one connected field — find any note in the key anywhere and connect zones without seams. A 5-string adds the low end below E. This is fretboard freedom: the bassline goes where the music needs, not where the box ends.",
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[50, 70, 90, 110],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'full_neck', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'G' },
      vary:[ { key:'G' }, { key:'C' }, { key:'A', scale:'natural_minor' }, { key:'E', stringSetup:'bass_5_standard' }, { key:'D' } ]
    },
    // ── BASS: ARPEGGIOS ladder (new bass_arpeggios_ladder pack) ─────────────────
    // Outline the changes — bass spells harmony from the root up. Starts ABOVE
    // root-5th-octave (that lives in Foundations): triads → sevenths → inversions →
    // over changes. Harmony guardrails (harmony panel): blues = all-dominant
    // (force dom7+mixolydian); auto elsewhere. Spec: agent-aff275c5* / -acd22ff6*.
    bass_arp_triads: {
      label:'Triad Arpeggios',
      goal:"A chord, one note at a time: root–3rd–5th for every diatonic triad. The root–5th–octave box gave you the frame; the 3rd is the note that tells major from minor. Spell each chord in the key and you can outline any progression from the bottom up.",
      scales:['major','natural_minor'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'diatonic_arpeggios', scale:'major', chordDepth:'triad', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:2, fretMax:9 },
      vary:[ { key:'C' }, { key:'G' }, { key:'A', scale:'natural_minor' }, { key:'E' }, { key:'F' } ]
    },
    bass_arp_sevenths: {
      label:'Seventh Arpeggios',
      goal:"Add the 7th: maj7, m7, dom7, m7♭5 — the four sevenths that build every diatonic chord. The 7th gives a chord its flavor and pulls the harmony forward. A bassist who can spell these outlines a jazz or soul tune with no chart in front of them.",
      scales:['major','natural_minor','dorian'],
      tempoTiers:[60, 85, 105, 125],
      base:{ practiceType:'diatonic_arpeggios', scale:'major', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:2, fretMax:9 },
      vary:[ { key:'C' }, { key:'A', scale:'natural_minor' }, { key:'G' }, { key:'F' }, { key:'D', scale:'dorian' } ]
    },
    // 7th-arp BOXES across positions (Discord — Gungr: "7th arps in all positions over
    // the neck", with a box diagram). Where bass_arp_sevenths travels by KEY, this
    // travels by POSITION: one quality box walked up the neck. The four qualities are a
    // one-note-edit chain (maj7→dom7→min7→m7♭5). Pure config (static_i + chordOverride +
    // a stepped window), no new generator. See docs/plugin/design/bass-technique-content-roundtable.md.
    bass_arp_neck: {
      label:'Seventh Boxes — Up the Neck',
      goal:"One seventh-chord box, walked up the whole neck: the same shape — root, 3rd, 5th, 7th — in each position from low to high, so the arpeggio lives everywhere, not just one spot. Four boxes, each a single finger-move from the last: maj7, drop the 7 for dom7, drop the 3 for min7, drop the 5 for m7♭5. The 3rd says major or minor, the ♭7 says dominant — own these and you outline the changes anywhere on the bass with no chart.",
      scales:['major'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'diatonic_arpeggios', progression:'static_i', scale:'major', chordDepth:'seventh', chordOverride:'maj7', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:5 },
      vary:[ { chordOverride:'maj7', fretMin:0, fretMax:5 }, { chordOverride:'dom7', fretMin:3, fretMax:8 }, { chordOverride:'min7', fretMin:5, fretMax:10 }, { chordOverride:'min7b5', fretMin:7, fretMax:12 }, { chordOverride:'maj7', fretMin:10, fretMax:15 } ]
    },
    bass_arp_inversions: {
      label:'Arpeggio Inversions',
      goal:"The same seventh chord, started from each chord tone: root, 3rd, 5th, 7th. Inversions let you begin a line on any note and connect arpeggios up the neck — the bassist's tool for landing on the strongest note over each change instead of always thumping the root.",
      scales:['major','natural_minor'],
      tempoTiers:[55, 75, 95, 115],
      base:{ practiceType:'arpeggio_inversions', scale:'major', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:9 },
      vary:[ { key:'C' }, { key:'A', scale:'natural_minor' }, { key:'G' }, { key:'E', stringSetup:'bass_5_standard', fretMin:0, fretMax:9 }, { key:'F' } ]
    },
    bass_arp_changes: {
      label:'Arpeggios Over Changes',
      goal:"Outline a progression: play each chord's arpeggio as the changes move (ii–V–I, then vi–ii–V–I). Every note is a chord tone, so the line is never wrong — only more or less melodic. This is the bridge from arpeggios to real walking bass and bass soloing.",
      scales:['major','dorian','mixolydian'],
      tempoTiers:[65, 85, 105, 125],
      base:{ practiceType:'progression_arpeggios', scale:'major', chordDepth:'seventh', chordOverride:'auto', progression:'ii-V-I', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:9 },
      vary:[ { key:'C', progression:'ii-V-I' }, { key:'C', progression:'vi-ii-V-I' }, { key:'F', progression:'ii-V-I' }, { key:'G', progression:'12_bar_blues', chordOverride:'dom7', scale:'mixolydian' }, { key:'A', progression:'i-VII-VI-VII', scale:'natural_minor', stringSetup:'bass_5_standard' } ]
    },
    // ── BASS: GROOVE & RIGHT HAND ladder (new bass_groove_rh_ladder pack) ────────
    // The plucking-hand engine Foundations skipped (it shipped with no
    // right_hand_technique rung). rhTechMode (built this session) drives it: the
    // i-m motor → string crossing & raking → 16th stamina → the funk pocket AT
    // SPEED → three-finger. Overlap with Foundations' Dead-Note Pocket resolved:
    // rung 4 is the at-speed application (faster tiers), not a second intro.
    bass_rh_pulse: {
      label:'Alternating-Finger Pulse',
      goal:"The motor under every bassline: strict index–middle alternation, dead even, never breaking stride, while the floating thumb mutes the strings you're not playing. The hand pattern IS the drill — even attacks, even volume, locked to the click. Build this and everything else gets easier.",
      scales:['natural_minor','minor_pentatonic'],
      // Density ladder (panel 2026-06-12, bass-pedagogy): introduce the i-m
      // alternation at quarters first — alternation fatigues faster than a pick
      // at equal density — then climb eighths by BPM.
      tempoTiers:[60, 70, 95, 120],
      tempoTierSubdivs:['quarter', 'eighth', 'eighth', 'eighth'],
      base:{ practiceType:'right_hand_technique', rhTechMode:'pulse', scale:'natural_minor', progression:'static_i', chordDepth:'seventh', chordOverride:'min7', meter:'4/4', subdivision:'quarter', bpm:60, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'E', fretMin:5, fretMax:9 },
      vary:[ { key:'E' }, { key:'A' }, { key:'G' }, { key:'B', stringSetup:'bass_5_standard', fretMin:0, fretMax:4 }, { key:'C' } ]
    },
    bass_rh_crossing: {
      label:'String Crossing & Raking',
      goal:"Move the motor across strings without losing the pulse. The crossing to the next string, and the rake — letting ONE finger fall through two or three adjacent strings on the way down instead of re-plucking each. Raking is the efficiency every electric bassist steals from the upright.",
      scales:['natural_minor','dorian'],
      tempoTiers:[55, 75, 95, 115],
      base:{ practiceType:'right_hand_technique', rhTechMode:'rake', scale:'natural_minor', progression:'i-VII-VI-VII', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:5, fretMax:9 },
      vary:[ { key:'A' }, { key:'E' }, { key:'D', scale:'dorian' }, { key:'G' }, { key:'C' } ]
    },
    bass_rh_sixteenth: {
      label:'Sixteenth-Note Stamina',
      goal:"Drive the i–m motor at sixteenths and keep it relaxed. This is where speed lives — and where it falls apart first on bass, somewhere around 95–110 BPM. Find your wall, sit just under it, and let the motor get effortless before you push past it.",
      scales:['minor_pentatonic','dorian'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'right_hand_technique', rhTechMode:'pulse', scale:'minor_pentatonic', progression:'static_i', chordDepth:'seventh', chordOverride:'min7', meter:'4/4', subdivision:'sixteenth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'E', fretMin:5, fretMax:9 },
      vary:[ { key:'E' }, { key:'A' }, { key:'G' }, { key:'D', scale:'dorian' }, { key:'C' } ]
    },
    bass_rh_funk_pocket: {
      label:'The Funk Pocket — Applied',
      goal:"Now spend the motor on a real groove. Real notes on the syncopated pushes, muted ghosts filling every other sixteenth, a couple of hard accents per bar — at performance tempo. The ghosts never stop; the hand keeps the sixteenth grid even when the note is dead. The at-speed application of the pocket.",
      scales:['minor_pentatonic','dorian'],
      tempoTiers:[85, 105, 125, 145],
      base:{ practiceType:'dead_note_groove', scale:'minor_pentatonic', progression:'static_i', chordDepth:'seventh', chordOverride:'min7', meter:'4/4', subdivision:'sixteenth', bpm:105, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'E', fretMin:0, fretMax:7 },
      vary:[ { key:'E' }, { key:'A' }, { key:'D', scale:'dorian', progression:'i-VII-VI-VII', chordOverride:'auto' }, { key:'B', stringSetup:'bass_5_standard', fretMin:0, fretMax:7 }, { key:'G' } ]
    },
    bass_rh_three_finger: {
      label:'Three-Finger Independence',
      goal:"Add the ring finger: index–middle–ring in rotation. Three fingers spread fast sixteenth and triplet streams across more digits so no one finger fatigues — the technique behind relentless metal and Latin bass. The skill is evenness: all three landing with identical tone and timing.",
      scales:['minor_pentatonic','natural_minor'],
      tempoTiers:[70, 90, 110, 130],
      base:{ practiceType:'right_hand_technique', rhTechMode:'three_finger', scale:'minor_pentatonic', progression:'static_i', chordDepth:'seventh', chordOverride:'min7', meter:'4/4', subdivision:'sixteenth', bpm:95, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'E', fretMin:5, fretMax:9 },
      vary:[ { key:'E' }, { key:'A' }, { key:'D', subdivision:'triplet' }, { key:'G' }, { key:'B', stringSetup:'bass_5_standard', fretMin:0, fretMax:4 } ]
    },
    // ── BASS CORE rungs (the pinned Core: Bass spine, 2026-06-08 panel) ──────────
    // These slot INTO the existing core_beginner/intermediate/advanced bands (b-lite:
    // bass ids alongside guitar ids; isHiddenNode shows the active instrument's set).
    // Naming/structure parallel guitar Core. The motor (bass_rh_pulse), root_click +
    // finger_gym are the missing PHYSICAL floor; the bass_lc_* rungs are the Lines &
    // Changes harmony-literacy lane (over the shipped walking-approach flags).
    bass_root_click: {
      label:'Root on the Click',
      goal:"Bass is the timekeeper — before anything else, one note has to sit dead on the beat. One low-string root, struck in a steady pulse, locked to the click so it lands WITH the kick. With no fretting-hand variable your plucking hand IS the metronome — the most direct way to build rock-solid time. Quarters first, then eighths: every strike even and relaxed, no rushing or dragging.",
      scales:['minor_pentatonic'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'rhythm_pulse', pulseAccent:0, pulseOffbeat:false, scale:'minor_pentatonic', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'quarter', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d' },
      vary:[ { subdivision:'quarter' }, { subdivision:'eighth' }, { anchorFret:3 }, { anchorFret:5 }, { subdivision:'eighth', anchorFret:5 } ]
    },
    bass_finger_gym: {
      label:'Finger Gym',
      goal:"The fretting hand's foundation: one finger per fret, pressing just behind the fret, every note clean and even. Up at the 5th–8th frets the four frets sit comfortably under your four fingers (1-2-3-4). Down at the bottom of the neck the stretch is too wide — there you switch to 1-2-4 (index, middle, pinky) with a small shift, never a flat four-finger reach. Build finger independence and a relaxed hand before speed.",
      scales:['minor_pentatonic'],
      // Density ladder (panel 2026-06-12, bass-pedagogy): an eighth chromatic
      // spider cold is a real demand on big strings — quarter floor first, then
      // eighths; short bars at the bottom (cap continuous reps for cold hands).
      tempoTiers:[55, 65, 75, 85],
      tempoTierSubdivs:['quarter', 'quarter', 'eighth', 'eighth'],
      tempoTierBars:[4, 4, 8, 8],
      base:{ practiceType:'chromatic', chromaticPattern:'1234', scale:'minor_pentatonic', meter:'4/4', subdivision:'quarter', bpm:55, bars:4, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', fretMin:5, fretMax:8 },
      vary:[ { chromaticPattern:'1234', fretMin:5, fretMax:8 }, { chromaticPattern:'1324', fretMin:5, fretMax:8 }, { chromaticPattern:'4321', fretMin:5, fretMax:8 }, { chromaticPattern:'1342', fretMin:5, fretMax:8 }, { chromaticPattern:'1234', fretMin:7, fretMax:10 } ]
    },
    // Bass pinky / legato rung (Discord ask — Daniel: "pinky hammer-ons & pull-offs,
    // not a creative circle of hell"). MUSICAL pentatonic-box legato, not chromatic:
    // the minor-3rd reach in the box lands the hammered note on the PINKY (fg 4), so
    // it builds exactly the finger bassists most need. Starts at the comfortable 5th
    // fret; felt/clean, never scored on the slur. Core: Bass (NOT the CAGED concept
    // rung). See docs/plugin/design/bass-technique-content-roundtable.md.
    bass_finger_legato: {
      label:'Pinky Power — Hammer-Ons & Pull-Offs',
      goal:"The fretting hand makes the sound and the pinky earns its keep: hammer onto the higher note, pull off to the lower, pick only the first note on each string. In the pentatonic box the reach lands on your pinky — the very finger bassists most need to strengthen. Up at the 5th fret the stretch is easy; as your slurs get clean and even, work it lower. No straining, no flat four-finger reach — just the strength and independence that let a bassline flow.",
      scales:['minor_pentatonic','natural_minor'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'legato', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:5, fretMax:8 },
      vary:[ { key:'A', fretMin:5, fretMax:8 }, { key:'D', fretMin:5, fretMax:8 }, { key:'E', fretMin:5, fretMax:9 }, { scale:'natural_minor', key:'A', fretMin:5, fretMax:9 }, { key:'G', fretMin:3, fretMax:7 } ]
    },
    bass_lc_roots: {
      label:'Roots on the One',
      feltGate:true,   // bass FEEL rung (tag pass 2026-06-12, PRIME): "locked to the kick, never miss the change" IS the pocket; the line stays graded (frets 0–7).
      goal:"The first step into playing the changes: the root of each chord, on beat 1, held — change exactly when the chord changes. No flash, just the right note at the right moment, locked to the kick. This is what a bassline IS before anything else — the harmonic floor that tells the whole band where the music is. Follow a real progression and never miss the change.",
      scales:['major','natural_minor'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'walking_bass', walkFeel:'roots', scale:'major', progression:'I-V-vi-IV', chordDepth:'triad', chordOverride:'auto', meter:'4/4', subdivision:'quarter', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:7 },
      vary:[ { progression:'I-V-vi-IV' }, { progression:'I-IV-V', key:'G' }, { progression:'ii-V-I' }, { progression:'i-VII-VI-VII', scale:'natural_minor', key:'A' }, { progression:'vi-IV-I-V' } ]
    },
    bass_lc_guide_tones: {
      label:'Guide-Tone Targets',
      goal:"The 3rd and the 7th are a chord's identity — they're what make a m7 sound different from a dom7. Land on those guide tones as the changes move, in the bass register, and your line spells the harmony with two notes per chord. This is the bassist's secret to outlining changes without playing every chord tone: hit the guide tones and the ear hears the whole chord.",
      scales:['major','dorian'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'guide_tones', scale:'major', progression:'ii-V-I', chordDepth:'seventh', voices:'both_alternating', meter:'4/4', subdivision:'quarter', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:9 },
      vary:[ { progression:'ii-V-I' }, { progression:'vi-ii-V-I' }, { key:'F', progression:'ii-V-I' }, { key:'G', progression:'I-vi-ii-V' }, { progression:'12_bar_blues', chordOverride:'dom7', scale:'mixolydian' } ]
    },
    bass_lc_approach: {
      label:'Approach-Note Lines',
      feltGate:true,   // bass FEEL rung (tag pass 2026-06-12, PRIME): walking quarters, the pocket pulls the line forward.
      goal:"Now connect the changes like a jazz bassist: a chromatic half-step or a dominant 5th on the last beat, pulling your ear into the next chord's root. This is the device that turns roots-and-fifths into a walking LINE that leads. Then graduate the feel — half-time 'in 2' for the head, four-to-the-bar quarters when it's time to walk. The engine of jazz and blues bass.",
      scales:['major','dorian','mixolydian'],
      tempoTiers:[65, 85, 105, 125],
      base:{ practiceType:'walking_bass', walkApproach:'chromatic', scale:'major', progression:'ii-V-I', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'quarter', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:7 },
      vary:[ { walkApproach:'chromatic' }, { walkApproach:'dominant' }, { walkApproach:'mixed', progression:'vi-ii-V-I' }, { walkApproach:'chromatic', walkFeel:'two' }, { key:'F', walkApproach:'mixed' } ]
    },
    bass_lc_capstone: {
      label:'The 12-Bar Walk',
      feltGate:true,   // bass FEEL rung (tag pass 2026-06-12, PRIME): "walk it without thinking at tempo" = a held pocket over the full form.
      goal:"The hard application: walk a complete JAZZ 12-bar blues — every change outlined with roots, chord tones, and approach notes, the line resolving through the bar-6 diminished passing chord and the bar 9–10 ii–V turnaround that separate a jazz blues from a plain one. A full, real walking bassline over an authentic form. Learn it, then play it clean at tempo: when you can walk it without thinking, you're ready to build your own — that's the next rung.",
      scales:['mixolydian','major'],
      tempoTiers:[70, 90, 110, 130],
      base:{ practiceType:'walking_bass', walkApproach:'mixed', scale:'mixolydian', progression:'jazz_blues', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'quarter', bpm:90, bars:12, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'C', fretMin:0, fretMax:7, backingStyle:'boogie', swing:'shuffle' },
      vary:[ { key:'C' }, { key:'G' }, { key:'F' }, { progression:'12_bar_blues', chordOverride:'dom7', key:'Bb' }, { progression:'ii-V-I', bars:8, scale:'major', chordOverride:'auto' } ]
    },
    bass_lc_trade: {
      label:'Trade the Blues — Build a Line',
      goal:"The destination of the whole bass journey: two bars of a blues bass phrase, then two bars of space that are YOURS. Echo the line back, then start changing it — your own approach notes, your own chord tones, your own pocket — until the line is yours, not ours. This is where the vocabulary becomes creativity: you're not running a drill anymore, you're building basslines you own and take off the screen. Trade with the band over the 12-bar form; make the space your own. (Your answers are your space — nothing here is scored.)",
      scales:['blues','minor_pentatonic','dorian'],
      tempoTiers:[70, 90, 110, 130],
      base:{ practiceType:'call_response', scale:'blues', progression:'12_bar_blues', chordOverride:'dom7', meter:'4/4', subdivision:'eighth', bpm:90, bars:12, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:0, fretMax:7, backingStyle:'boogie', swing:'shuffle', audioProfile:'blues' },
      vary:[ { key:'A' }, { key:'E' }, { scale:'dorian', progression:'ii-V-I', chordOverride:'auto', swing:'swing', audioProfile:'jazz' }, { key:'G' }, { scale:'minor_pentatonic', key:'C' } ]
    },
    // ── RHYTHM / TIME concept ladder (new concept_rhythm pack) ───────────────────
    // The time/pocket spine — learning-design's #2 underserved gap. Instrument-AGNOSTIC
    // generators (scale + rhythmic_displacement work on guitar AND bass — set the string
    // setup). Difficulty axis = subdivision/feel control, not pitch. Pure curation.
    rhy_subdivision: {
      label:'Subdivisions',
      goal:'The grid under everything: play one scale at each subdivision — quarters, eighths, triplets, sixteenths — staying dead even as they get faster. The skill is internalizing the divisions of the beat so your time is a grid you trust, not a guess. The foundation of every groove. Want the punk version? Drive even eighths with ALL downstrokes — same hand motion every note — and push the tempo until downstrokes physically can\'t keep up (~the 200 bpm "wall"). That breaking point, where the pros switch to alternate picking, is the real lesson.',
      scales:['minor_pentatonic','major','dorian'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { subdivision:'quarter' }, { subdivision:'eighth' }, { subdivision:'triplet' }, { subdivision:'sixteenth' }, { subdivision:'eighth', sequence:'fours' } ]
    },
    rhy_sixteenth: {
      label:'The 16th Pocket',
      goal:'Four even sixteenths per beat — the resolution where funk, R&B, and modern rhythm live. Accent the downbeat of each four, keep the rest even and relaxed. The skill is a sixteenth-note pulse you can sit in without rushing or dragging.',
      scales:['minor_pentatonic','dorian','blues'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'4/4', subdivision:'sixteenth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { sequence:'none' }, { sequence:'fours' }, { key:'G', scale:'major' }, { key:'E' }, { key:'D', scale:'dorian' } ]
    },
    rhy_swing: {
      label:'Swing & Shuffle',
      goal:'Same notes, different feel: play a line straight, then swing the eighths, then push to a hard triplet shuffle. Hearing and switching between straight and swung time is a feel skill that unlocks jazz, blues, and half of pop. The pocket is in the ratio.',
      scales:['minor_pentatonic','major','dorian'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', swing:'straight', key:'A', shape:'E' },
      vary:[ { swing:'straight' }, { swing:'swing' }, { swing:'shuffle' }, { swing:'swing', key:'E' }, { swing:'shuffle', scale:'blues' } ]
    },
    rhy_displacement: {
      label:'Displacement & Syncopation',
      goal:'Break the grid on purpose: start the pattern off the downbeat and let the accents land between the beats. Rhythmic displacement and syncopation are what make a part feel like a groove instead of an exercise — the push and pull that pulls a listener in.',
      scales:['minor_pentatonic','dorian','major'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'rhythmic_displacement', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { subdivision:'sixteenth' }, { key:'D', scale:'dorian' }, { key:'G', scale:'major' } ]
    },
    rhy_odd_meter: {
      label:'Odd Meters',
      goal:"Feel a bar that isn't four: 7/8 grouped 2+2+3, then 5/8 and other odd meters. Count the groups, lock to the uneven pulse, and a meter that felt impossible becomes a groove. Odd time is the gateway to prog, math rock, and a deeper command of the beat. (Added per the rhythm-meter audit — reuses the existing odd/grouping-meter engine.)",
      scales:['minor_pentatonic','dorian','phrygian'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'7/8:2+2+3', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { meter:'7/8:2+2+3' }, { meter:'5/8:3+2' }, { meter:'7/8:3+2+2' }, { meter:'5/8:2+3' }, { meter:'6/8:3+3' } ]
    },
    // Capstone of the Rhythm band (Tier 2 of the 2026-06-03 meter fix). The
    // FLIP-SIDE of Odd Meters: instead of locking TO the 2+2+3 pulse, deliberately
    // play a steady QUARTER line ACROSS it. A 7/8 bar is 3.5 quarters, so the line
    // phases — re-landing on the downbeat only every 2 bars = metric
    // superimposition (2-against-7). The Tier-1 meter-aware default bumps a
    // *user's* coarse pick up to the pulse; this pathway PRESETS subdivision:
    // 'quarter' (silently, via setFieldSilent), so it survives that bump by design
    // — the trap becomes the lesson. Band keeps the pitch vehicle constant
    // (pentatonic box, see note above) so the difficulty axis stays pure rhythm.
    // 5-agent panel: prog/L&D/guitar/bass-pedagogy/rhythm-meter. The truer 3-over-7
    // CELL version is deferred to the Tier-3 polymeter primitive (needs a decoupled
    // phrase clock). swing:'straight' explicit so a stray shuffle can't muddy the
    // phase boundary; the click (on by default) sounds the 2+2+3 pulse underneath.
    rhy_over_barline: {
      label:'Over the Barline',
      goal:"Now break the bar you just learned to lock. Play a steady stream of QUARTER notes over 7/8 — and listen to it drift. Seven eighths is three-and-a-half quarters, so your line won't fit the bar; it re-lands on the downbeat only every TWO bars, leaning across the barline in between. That misalignment isn't a mistake — it's the device: metric superimposition, laying an even pulse over an odd one on purpose. Count the underlying 2+2+3 out loud (or tap it with your foot) and keep your quarters dead even against it — feeling the two pulses pull apart and snap back is the whole skill. It's the tension behind prog, math rock, and modern metal; once you can ride one pulse against another, polyrhythm and odd-time soloing start to sound like intent, not accident.",
      scales:['minor_pentatonic','dorian','phrygian'],
      tempoTiers:[54, 66, 78, 90],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'7/8:2+2+3', subdivision:'quarter', bpm:54, bars:8, direction:'up_down', sequence:'none', swing:'straight', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { meter:'7/8:2+2+3' }, { meter:'5/8:3+2' }, { meter:'9/8:3+3+3' }, { meter:'7/8:3+2+2' }, { meter:'11/8:3+3+3+2' } ]
    },
    // ── Rhythm ladder — genre-spanning expansion (panel 2026-06-04) ──────────────
    // Spec docs/plugin/design/rhythm-ladder-roundtable.md. ONE genre-neutral spine; genres attach as
    // a vary[] step / their own Style-pack app rung / goal-card prose — never a new band
    // rung. New rungs over the RHYTHM_CELLS substrate + the buildRhythmPulseExercise
    // keystone. Difficulty axis = feel/accent control; the pitch vehicle stays simple.
    rhy_gallop_snap: {
      label:'Gallop & Snap',
      goal:'The galloping picking hand: one rhythmic cell — an eighth plus two sixteenths — repeated until it\'s automatic, then its mirror (reverse gallop) and the dotted "skip" and front-weighted "snap" variants. The gallop is the NWOBHM/thrash engine and a pure picking-hand TIME skill: down on the eighth, down-up on the sixteenths, palm-muted. Lock one feel cold, then switch between them by ear — the device is the rhythm cell, not the notes.',
      scales:['minor_pentatonic','natural_minor','harmonic_minor'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'4/4', subdivision:'gallop', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { subdivision:'gallop' }, { subdivision:'reverse_gallop' }, { subdivision:'skip_chug' }, { subdivision:'snap' }, { subdivision:'gallop', scale:'harmonic_minor' } ]
    },
    rhy_accent_displace: {
      label:'Accent Displacement',
      goal:'Same notes, different groove: play an even stream of sixteenths on one note and move WHERE the accent falls — on the beat, then the "e", the "&", the "a". Relocating the accent turns one rhythm into four feels; it\'s the highest-leverage groove skill a drummer owns, and it makes your time feel intentional instead of mechanical. Count out loud and let the accent — not the notes — carry the groove (this is the engine under the bluegrass roll, the funk "one", the tango marcato).',
      scales:['minor_pentatonic'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'rhythm_pulse', pulseAccent:0, scale:'minor_pentatonic', anchor:'open_lowest', anchorFret:5, meter:'4/4', subdivision:'sixteenth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', shape:'E' },
      vary:[ { pulseAccent:0 }, { pulseAccent:1 }, { pulseAccent:2 }, { pulseAccent:3 }, { subdivision:'eighth', pulseAccent:1 } ]
    },
    rhy_single_string: {
      label:'Single-String Pulse',
      goal:'Strip everything away: ONE palm-muted note on a low string, struck in a steady pulse against the click. With no fretting-hand variable, your picking hand IS the metronome — the most direct way to build rock-solid time. Quarters, then eighths, then sixteenths; keep every strike even and relaxed. Then tap a world-rhythm on the same one note — the tresillo (3-3-2), the son clave — and feel its TIME (a single line teaches the time of a feel, not the whole band). Or shift the pulse onto the upbeats for the reggae skank: play only the "&" and trust the empty downbeat — the hardest, most useful time skill is feeling the beat you do NOT play.',
      scales:['minor_pentatonic'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'rhythm_pulse', pulseAccent:0, pulseOffbeat:false, scale:'minor_pentatonic', anchor:'open_lowest', anchorFret:5, meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', shape:'E' },
      vary:[ { subdivision:'quarter' }, { subdivision:'eighth' }, { subdivision:'sixteenth' }, { subdivision:'tresillo' }, { subdivision:'son_clave' }, { subdivision:'quarter', pulseOffbeat:true } ]
    },
    rhy_half_double: {
      label:'Half-Time & Double-Time',
      goal:'Same tempo, different feel: the CLICK never changes — your note density does. Play in quarters and the groove leans back into a half-time feel; double it to sixteenths and it drives as double-time. Learning to shift the felt pulse over a steady click — without rushing or dragging the click itself — is how a rhythm section makes a song breathe and surge. The metronome is the constant; the feel is your choice.',
      scales:['minor_pentatonic','dorian'],
      tempoTiers:[70, 85, 100, 115],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { subdivision:'quarter' }, { subdivision:'eighth' }, { subdivision:'sixteenth' }, { subdivision:'eighth', sequence:'fours' }, { subdivision:'sixteenth', key:'E' } ]
    },
    // Capstone — the on-ramp to creation (the north star's "drills are the entrance,
    // creativity the destination"): echo the rhythm, then make the answer your own.
    rhy_trade_bars: {
      label:'Trade Bars — Make a Groove',
      goal:'The payoff: two bars of call, two bars of space to answer. Echo the rhythm back, then start changing it — your own accents, your own gallop, your own syncopation — until the answer is YOURS. This is where the rhythm vocabulary becomes creativity: you\'re not running a drill anymore, you\'re trading fours and building grooves you own off the screen. Trade with the click; make the space your own.',
      scales:['minor_pentatonic','dorian','blues'],
      tempoTiers:[70, 85, 100, 120],
      base:{ practiceType:'call_response', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { subdivision:'eighth' }, { subdivision:'sixteenth' }, { swing:'swing' }, { key:'E', scale:'blues' }, { subdivision:'eighth', key:'D', scale:'dorian' } ]
    },
    // ── PICKING concept ladder (new concept_picking pack) ───────────────────────
    // The pick-hand engine (guitar-pedagogy #2). Difficulty axis = coordination/crossing,
    // tempo last. Pure curation (tremolo_picking, scale, string_skipping, hybrid_picking).
    pick_tremolo: {
      label:'Tremolo Picking',
      goal:'The pick-hand engine: rapid alternate picking on a single note, kept even and relaxed. Tremolo builds the speed, endurance, and wrist motion every fast passage rides on. Start slow — evenness first, speed second; tension is the enemy.',
      scales:['minor_pentatonic','natural_minor','harmonic_minor'],
      tempoTiers:[70, 95, 120, 150],
      base:{ practiceType:'tremolo_picking', scale:'minor_pentatonic', meter:'4/4', subdivision:'sixteenth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { scale:'natural_minor' }, { key:'D', shape:'E' }, { scale:'harmonic_minor', key:'A' } ]
    },
    pick_alternate: {
      label:'Alternate Across Strings',
      goal:'Strict alternate picking through a scale — down-up-down-up across string changes. The hard part is the crossing: keeping the pattern unbroken as the pick moves to a new string. This is the picking discipline that makes scale runs clean at speed.',
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[65, 90, 115, 140],
      base:{ practiceType:'scale', strokePolicy:'alternate', scale:'major', meter:'4/4', subdivision:'sixteenth', bpm:85, bars:8, direction:'up_down', sequence:'fours', advancedMode:true, fretboardSystem:'3nps', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:1 },
      vary:[ { sequence:'fours' }, { sequence:'none' }, { shape:2 }, { sequence:'triplets', subdivision:'triplet' }, { shape:3 } ]
    },
    // The 16th-note chromatic — moved OUT of chromatic_warmup (2026-06-12 beginner
    // dogfood: 16ths in the entry rung were "too complicated by an actual
    // beginner"). Here it is what it always really was: an alternate-picking
    // speed/endurance drill that assumes the warmup's hand sync is already owned.
    pick_chromatic_16ths: {
      label:'Chromatic Sixteenths',
      goal:'The 1-2-3-4 warmup grown into a picking workout — strict alternate sixteenths across all six strings, four notes per click. Your hands already know the pattern from the Chromatic Warmup; now the pick leads: down-up unbroken through every string crossing, evenness before speed. The endurance builder fast scale runs ride on.',
      scales:[],
      tempoTiers:[60, 75, 90, 105],
      base:{ practiceType:'chromatic', chromaticPattern:'1234', strokePolicy:'alternate', meter:'4/4', subdivision:'sixteenth', bpm:60, bars:8, direction:'up_down', advancedMode:false, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', fretMin:1, fretMax:4 },
      vary:[
        { chromaticPattern:'1234', fretMin:1, fretMax:4 },
        { chromaticPattern:'4321', fretMin:1, fretMax:4 },
        { chromaticPattern:'1324', fretMin:1, fretMax:4 },
        { chromaticPattern:'1342', fretMin:1, fretMax:4 },
        { chromaticPattern:'1234', fretMin:5, fretMax:8 },
        { chromaticPattern:'1234', fretMin:9, fretMax:12 }
      ]
    },
    // Economy crossings (hand-marks Slice 2; the Picking band's crossing-strategy
    // gap — L&D's named rung). The strokePolicy field drives the pkd marks: the
    // economy school's crossing continues the pick's travel direction (the mini
    // sweep), contrasted against strict alternate (whose crossings split into
    // outside/inside). 3NPS makes the crossings land predictably. "Built for the
    // economy school" — shown, never judged (stroke direction is undetectable).
    pick_economy: {
      label:'Economy Crossings',
      goal:'Two ways across the strings — and when to use each. Strict alternate picking makes every string change a coin flip: sometimes the pick travels OUTSIDE the two strings (the easy crossing), sometimes it gets trapped INSIDE them (the hard one — name it and you can finally practice it). Economy picking removes the flip: crossing to a new string, the pick keeps moving the SAME direction — two downs in a row ascending, two ups descending — a mini sweep through the crossing. Three-notes-per-string makes every crossing land on the same stroke, so each rep drills the same move. Run the economy steps, then the alternate contrast step, and feel the difference: alternate keeps the metronomic hand, economy glides. Neither school is "correct" — the skill is owning the crossing instead of being surprised by it.',
      scales:['major','natural_minor','dorian'],
      tempoTiers:[60, 85, 110, 135],
      base:{ practiceType:'scale', strokePolicy:'economy', scale:'major', meter:'4/4', subdivision:'sixteenth', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'3nps', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:1 },
      vary:[
        { strokePolicy:'economy', direction:'ascending' },    // every crossing = down-down
        { strokePolicy:'economy', direction:'descending' },   // every crossing = up-up
        { strokePolicy:'economy', direction:'up_down' },      // the turn: both crossings in one run
        { strokePolicy:'alternate', direction:'up_down' },    // contrast: the outside/inside coin-flip
        { strokePolicy:'economy', shape:2 },
      ]
    },
    pick_string_skip: {
      label:'String Skipping',
      goal:'Skip a string mid-run — the pick has to clear the string between, and the fretting hand has to leap. String skipping builds picking accuracy and the wide-interval vocabulary that makes a line sound less scalar and more angular.',
      scales:['major','minor_pentatonic','natural_minor'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'string_skipping', scale:'major', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'E' },
      vary:[ { key:'C', shape:'E' }, { key:'A', scale:'minor_pentatonic' }, { key:'G', shape:'E' }, { key:'E', scale:'natural_minor' }, { key:'D', shape:'E' } ]
    },
    pick_hybrid: {
      label:'Hybrid Picking',
      goal:"Pick and fingers together: the flatpick plays the low note, the middle and ring fingers pluck the higher strings. Hybrid picking unlocks wide string-spanning licks, snappy double-stops, and the country/fusion vocabulary you can't get with a pick alone.",
      scales:['major','major_pentatonic','mixolydian'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'hybrid_picking', scale:'major', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G', shape:'E' },
      vary:[ { key:'G', shape:'E' }, { key:'C', shape:'E' }, { scale:'major_pentatonic' }, { key:'A', scale:'mixolydian' }, { key:'D', shape:'E' } ]
    },
    // The herta: a rolling 4-note burst (Tier-3; Christian's dogfood ask). The GUITAR
    // adaptation — pick/hammer/pull/pick on one string — labelled honestly as a
    // herta-STYLE burst (the authentic drum rudiment R-R-L-R accent-last is a
    // separate drum node). Difficulty axis = tempo (the BPM climb); vary = the
    // accent-control + add-pitch ladder (accent on 1 → the authentic accent-last →
    // mid → walk the base through the scale). Static-pitch first so it's pure hand
    // coordination before navigation. See ROADMAP "Tier 3" + memory user_christian_herta_dogfood.
    pick_herta: {
      label:'Herta Burst',
      goal:"The herta on guitar: a four-note rolling burst — pick, hammer-on, pull-off, pick — fired off one string as four even sixteenths, the accent landing on the beat. Borrowed from the drum rudiment of the same name, it's the snapping fill that punctuates fast metal and prog. Start static on one note so it's pure hand coordination — dead-even sixteenths, a clean ringing pull-off, a clear accent — then move the accent around and walk it through the scale. The skill is a relaxed, even burst you can drop into a line at will; a tense hand and a dead pull-off are what kill it, so build the tempo slowly.",
      scales:['minor_pentatonic','natural_minor','harmonic_minor'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'herta', hertaAccent:0, hertaWalk:false, scale:'minor_pentatonic', meter:'4/4', subdivision:'sixteenth', bpm:60, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { hertaAccent:0 }, { hertaAccent:3 }, { hertaAccent:2 }, { hertaWalk:true }, { hertaWalk:true, key:'E' } ]
    },
    // ── LEGATO concept ladder (new concept_legato pack) ─────────────────────────
    // The fretting-hand engine (guitar-pedagogy #3). Pure curation (legato, tapping).
    leg_hopo: {
      label:'Hammer-Ons & Pull-Offs',
      goal:'The fretting hand making the sound: hammer onto a higher fret, pull off to a lower one, pick only the first note of each string. Clean, even slurs are the foundation of legato — the strength and independence that let a line flow instead of being picked note-for-note.',
      scales:['natural_minor','minor_pentatonic','major'],
      tempoTiers:[55, 75, 95, 115],
      base:{ practiceType:'legato', scale:'natural_minor', meter:'4/4', subdivision:'eighth', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { scale:'minor_pentatonic' }, { key:'D', shape:'E' }, { key:'G', shape:'E' } ]
    },
    leg_runs: {
      label:'Legato Runs (3NPS)',
      goal:'Slurred runs across the neck — three-notes-per-string legato where you pick once per string and hammer/pull the rest. The 3NPS layout is built for this. The skill is endurance and evenness: a flowing, vocal line with no pick attack on every note.',
      scales:['natural_minor','major','dorian'],
      tempoTiers:[65, 90, 115, 140],
      base:{ practiceType:'legato', scale:'natural_minor', meter:'4/4', subdivision:'sixteenth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'3nps', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:1 },
      vary:[ { shape:1 }, { shape:2 }, { shape:3 }, { scale:'major', key:'C' }, { shape:5 } ]
    },
    // (Tapping moved out of Legato into its own concept_tapping ladder — panel
    // 2026-07-14. The old single `leg_tapping` rung is re-homed as `tap_articulation`,
    // the ladder's rung 1; the full guitar+bass ladders live below the sweep pack.)
    // ── SWEEP PICKING ladder (new concept_sweeps pack) ──────────────────────────
    // The dedicated sweep vertical (was only 2 isolated rungs). guitar-pedagogy +
    // metal-idiom panel 2026-06-07: string count grows 3→5→6, tempo ceilings DESCEND
    // on harder rungs (clean before fast). The A-shape is the signature 5-string
    // sweep (root on A); the E-shape is the 6-string. Engine facts (this session):
    //   • sweepStrings:N constrains the rake to the top N strings (3-string entry).
    //   • Seventh sweeps route through the interval-derived greedy arpeggio (the
    //     CAGED chordTemplates carry only triads) anchored at the shape's position,
    //     so the 7th actually sounds; rung 4 sets a wide fretMin/fretMax window.
    //   • The roll lives in the E-shape (index barre across same-fret G/B/e) + a
    //     clean +3 apex HO/PO on the MINOR shape. Specs: agent-a2cf05d3*/-a61eefea*.
    sweep3_triad: {
      label:'Three-String Triad Sweep',
      goal:"The raw sweep motion with the least to mute: one rake across the top three strings, down and back. The A-shape minor sliced to its top three strings is a clean descending staircase — one finger per fret, nothing to roll yet. Start dead slow; the lesson is one clean pick-stroke per string, never speed.",
      scales:['natural_minor','harmonic_minor','major'],
      tempoTiers:[50, 65, 85, 110],
      base:{ practiceType:'sweep_arpeggios', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:50, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'A', sweepStrings:3 },
      vary:[ { key:'A', shape:'A' }, { key:'E', shape:'A' }, { key:'A', shape:'A', scale:'major' }, { key:'D', shape:'A' }, { key:'C', shape:'A', scale:'major' } ]
    },
    sweep5_box: {
      label:'Five-String Box',
      goal:"The signature five-string sweep — root on the A string, one pick-stroke per string raked up to the high E and back. Anchor the rake on the bass-string root and keep every note its own clean event. Slow and even beats fast and smeared, every single time.",
      scales:['natural_minor','harmonic_minor','major'],
      tempoTiers:[50, 65, 80, 100],
      base:{ practiceType:'sweep_arpeggios', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:55, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'A' },
      vary:[ { key:'A', shape:'A' }, { key:'E', shape:'A' }, { key:'D', shape:'A' }, { key:'A', shape:'A', scale:'major' }, { key:'B', shape:'A' } ]
    },
    sweep_roll_apex: {
      label:'The Roll & Clean Apex',
      goal:"The two skills that separate a real sweep from a smear. The fingertip ROLL: where same-fret strings sit under one finger, roll the tip across them joint by joint so only one rings at a time — never a flat barre. And the clean APEX: a hammer-on/pull-off flips the rake at the top with no pick-stroke. If the roll buzzes or two notes blur, drop a tempo tier — the roll is the whole lesson.",
      scales:['natural_minor','harmonic_minor'],
      tempoTiers:[45, 60, 75, 90],
      base:{ practiceType:'sweep_arpeggios', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:50, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'A', shape:'E', scale:'harmonic_minor' }, { key:'D', shape:'E' }, { key:'G', shape:'E' } ]
    },
    sweep7_color: {
      label:'Seventh Sweeps',
      goal:"Four-note arpeggios — m7, maj7, dom7 — adding the 7th's color and one more string-crossing to the rake. The seventh is what turns a triad sweep into a chord with a voice. The harmonic-minor variation hands you the diminished-7th sweep: the symmetric shape that slides up every minor third.",
      scales:['natural_minor','major','harmonic_minor'],
      tempoTiers:[45, 58, 72, 88],
      base:{ practiceType:'sweep_arpeggios', scale:'natural_minor', chordDepth:'seventh', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:48, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E', fretMin:0, fretMax:17 },
      vary:[ { key:'A', shape:'E' }, { key:'A', shape:'A' }, { key:'D', shape:'E' }, { key:'A', shape:'E', scale:'major' }, { key:'A', shape:'E', scale:'harmonic_minor' } ]
    },
    sweep_changes: {
      label:'Sweeps Over Changes',
      goal:"The musical payoff: run the sweep through a progression, re-rooting the box on each chord's bass note in time. One shape slides to the nearest position per change — the skill is landing the new root cleanly on the downbeat, not the fireworks. This is a sweep turned into music.",
      scales:['natural_minor','major','harmonic_minor'],
      tempoTiers:[50, 60, 72, 85],
      base:{ practiceType:'sweep_arpeggios', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:52, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E', fretMin:0, fretMax:17 },
      vary:[ { key:'A', shape:'E', progression:'i-VI-III-VII' }, { key:'A', shape:'A', progression:'i-VII-VI-VII' }, { key:'C', shape:'E', scale:'major', progression:'ii-V-I' }, { key:'G', shape:'E', scale:'major', progression:'I-vi-IV-V' }, { key:'A', shape:'E', scale:'harmonic_minor', chordDepth:'seventh', progression:'minor_ii_V_i' } ]
    },
    // ── TAPPING ladder (new concept_tapping pack) ──────────────────────────────
    // The two-hand-legato vertical, carved out of Legato (panel 2026-07-14:
    // learning-design chair + guitar/bass-pedagogy + metal-idiom + harmony + rhythm).
    // Engine facts this pack rides on:
    //   • Rung 1 is the ARTICULATION drill (plain 'tapping': single-string tap→pull);
    //     rungs 2–5 set tapArp:true → the CASCADE builder (tap→pull→hammer per string,
    //     the wide interval always routed to the RH tap).
    //   • Subdivision tracks the CELL note-count so cells land on the beat (rhythm):
    //     tap→pull = eighth, the 3-note tap-pull-hammer cell = triplet, the rolling
    //     two-cells-per-beat cascade = sixteenth_triplet.
    //   • Ceilings DESCEND on the wider-reach rungs (clean before fast — the sweep
    //     ladder's discipline; a tapped note must ring as loud as a picked one).
    //   • Cascade rungs stay on scales WITH a diatonic-quality row (natural/harmonic
    //     minor, major) — never pentatonic (no seventh row).
    tap_articulation: {
      label:'Tap & Pull-Off',
      goal:"The atom of tapping: the picking-hand finger joins the fretboard, TAPS a note high on the string, then flicks OFF it — a pull-off that sounds the note your fretting hand is already holding. One string, one tapped note, one fretted note. The whole lesson is the pull-off being a sideways flick toward the palm (it plucks the string), not a lift, so the fretted note rings clean instead of dying. Tap on the beat, pull-off on the '&' — a dead-even trill. A click instead of a note is what kills it; build the tempo slowly.",
      scales:['minor_pentatonic','natural_minor'],
      tempoTiers:[60, 75, 90, 105],
      base:{ practiceType:'tapping', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:60, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'single_string', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A' },
      vary:[ { key:'A' }, { key:'E' }, { key:'D' }, { scale:'natural_minor', key:'A' }, { scale:'natural_minor', key:'E' } ]
    },
    tap_cell: {
      label:'The Tapped Cell',
      goal:"The figure that made tapping famous — the Van Halen cell. On one string: TAP a high note, PULL OFF to a fretting finger, HAMMER ON to a second — three notes spelling a triad you could never reach with one hand, fired as a rolling triplet. The tap buys the wide interval the stretch can't; that's the whole point of the technique. Start with the root-octave-fifth shape and keep the triplet dead even — clean and slow beats fast and smeared, every time.",
      scales:['natural_minor','harmonic_minor'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'tapping', tapArp:true, scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'triplet', bpm:55, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E', sweepStrings:1, fretMin:5, fretMax:14 },
      vary:[ { key:'A' }, { key:'E' }, { scale:'harmonic_minor', key:'A' }, { key:'D' }, { scale:'harmonic_minor', key:'E' } ]
    },
    tap_cascade: {
      label:'Tapped Arpeggio Cascade',
      goal:"Move the cell across the strings and a whole arpeggio pours down the neck — tap→pull→hammer on one string hands off to the next, outlining a triad through octaves you could never sweep cleanly. The lesson is the string change: a gap-free hand-off with no doubled note, each string muted the instant it's done. Learn the shape as one cell per beat, then let it double into the rolling cascade — the density jump IS the rung.",
      scales:['natural_minor','harmonic_minor','major'],
      tempoTiers:[50, 62, 66, 74],
      tempoTierSubdivs:['triplet', 'triplet', 'sixteenth_triplet', 'sixteenth_triplet'],
      base:{ practiceType:'tapping', tapArp:true, scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'triplet', bpm:50, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E', sweepStrings:3, fretMin:5, fretMax:17 },
      vary:[ { sweepStrings:3, key:'A' }, { sweepStrings:5, key:'E' }, { sweepStrings:5, key:'A' }, { sweepStrings:6, key:'D' }, { sweepStrings:6, key:'A', scale:'harmonic_minor' } ]
    },
    tap_sevenths: {
      label:'Seventh & Diminished Cascade',
      goal:"Add the 7th and one more string-crossing: m7 / maj7 / dom7 arpeggios tapped across the neck, the seventh's color turning the triad into a chord with a voice. Harmonic minor hands you the diminished-7th cascade — one symmetric shape you slide up in minor thirds over the dominant, the sound of a shred solo taking flight. Outline the chord, not a scale; a clean tapped 7th is worth more than a fast blur.",
      scales:['natural_minor','major','harmonic_minor'],
      tempoTiers:[46, 58, 70, 82],
      base:{ practiceType:'tapping', tapArp:true, scale:'natural_minor', chordDepth:'seventh', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'triplet', bpm:46, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E', fretMin:0, fretMax:19 },
      vary:[ { scale:'natural_minor', key:'A' }, { scale:'major', key:'C' }, { scale:'harmonic_minor', key:'A' }, { key:'E' }, { scale:'harmonic_minor', key:'D' } ]
    },
    tap_changes: {
      label:'Tapping the Changes',
      goal:"The musical payoff: run the tapped cascade through a progression, re-rooting the shape on each chord in time. One figure slides to the nearest position per change — the skill is landing the new root's first tap cleanly on the downbeat, not the fireworks. This is tapping turned into a line, not a trick.",
      scales:['natural_minor','major','harmonic_minor'],
      tempoTiers:[50, 60, 70, 80],
      base:{ practiceType:'tapping', tapArp:true, scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'triplet', bpm:50, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E', fretMin:0, fretMax:17 },
      vary:[ { progression:'i-VI-III-VII', key:'A' }, { progression:'i-VII-VI-VII', key:'A' }, { scale:'major', key:'C', progression:'ii-V-I' }, { scale:'major', key:'G', progression:'I-vi-IV-V' }, { scale:'harmonic_minor', chordDepth:'seventh', progression:'minor_ii_V_i', key:'A' } ]
    },
    // ── Bass tapping ladder (mirrors the arc; DIVERGES on content — bass-pedagogy
    // 2026-07-14). Register-clamped octave/arpeggio taps: the fretted note stays in
    // the neck's meat (5–12), the tap reaches past hand-span (a feature, not a
    // stretch). 2-note tap→pull cells (root + one chord tone — no dense low clusters);
    // the two-hand-independence capstone needs a two-voice engine, staged for v2.
    btap_articulation: {
      label:'Bass Tap & Pull-Off',
      goal:"Tapping's atom on bass: the picking hand taps a note up the string, then flicks off it — a pull-off that sounds the fretted note your fretting hand holds. Stay in the meat of the neck where the low strings speak clean and punchy; a weak tap gives a dead thump, so the lesson is an articulate tap and a ringing pull-off. Tap on the beat, pull on the '&'.",
      scales:['minor_pentatonic','natural_minor'],
      tempoTiers:[52, 64, 76, 88],
      base:{ practiceType:'tapping', scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bpm:52, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'single_string', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A' },
      vary:[ { key:'A' }, { key:'E' }, { key:'G' }, { scale:'natural_minor', key:'A' }, { stringSetup:'bass_5_standard', key:'E' } ]
    },
    btap_arpeggio: {
      label:'Tapped Arpeggio Reach',
      goal:"Now use the tap for what only tapping can do: reach past your hand. Tap the octave (or tenth) above, pull to the fretted root and chord tone below — a wide arpeggio spanned without shifting your fretting hand at all. Two independent hands, so the twelve-fret span is a gift, not a stretch. Root low and clean on the downbeat; keep the strings you're not tapping damped.",
      scales:['natural_minor','harmonic_minor'],
      tempoTiers:[44, 54, 64, 72],
      base:{ practiceType:'tapping', tapArp:true, scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:44, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:5, fretMax:15, sweepStrings:2 },
      vary:[ { key:'A' }, { key:'E' }, { key:'D' }, { scale:'harmonic_minor', key:'A' }, { stringSetup:'bass_5_standard', key:'B' } ]
    },
    btap_groove: {
      label:'The Tapped Figure',
      goal:"Tapping as a LINE, not a stunt: a repeating tapped arpeggio figure that could carry a groove, spread across the strings and locked in a pocket. Damping is the whole game on bass — sequence a few strings before more, and let only the note you mean to sound ring. Make it repeatable and even over eight bars; a tapped figure you can hold is worth more than a fast one you can't.",
      scales:['natural_minor','harmonic_minor'],
      tempoTiers:[46, 56, 66, 76],
      base:{ practiceType:'tapping', tapArp:true, scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:46, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:5, fretMax:17, sweepStrings:3 },
      vary:[ { sweepStrings:3, key:'A' }, { sweepStrings:3, key:'E' }, { sweepStrings:4, key:'A' }, { key:'D' }, { stringSetup:'bass_5_standard', key:'B', sweepStrings:4 } ]
    },
    btap_apply: {
      label:'Tapping Over a Vamp',
      goal:"The payoff: run the tapped figure over a vamp, re-rooting on each chord in time so the tapped line serves the harmony. Land the new root low on the downbeat and let the figure follow the changes — a musical tapped bass line, not decoration. This is where the technique earns its place in a song.",
      scales:['natural_minor','harmonic_minor'],
      tempoTiers:[46, 56, 66, 76],
      base:{ practiceType:'tapping', tapArp:true, scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'eighth', bpm:46, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'bass_4_standard', renderer:'highway_3d', key:'A', fretMin:5, fretMax:17, sweepStrings:3 },
      vary:[ { progression:'i-VI-III-VII', key:'A' }, { progression:'i-VII-VI-VII', key:'A' }, { key:'E' }, { key:'D' }, { stringSetup:'bass_5_standard', key:'B', progression:'i-VI-III-VII' } ]
    },
    // ── FINGERSTYLE pack (Acoustic & Fingerstyle — 2026-06-12, the community
    // spider thread). The fingerstyle hand from the ground up: the p-i-m-a
    // free-stroke pattern over open grips, then the two-string crossing spider
    // at three widths (adjacent → skip → full-width). Let everything ring.
    fs_pima_foundation: {
      label:'p-i-m-a Foundation',
      goal:'The fingerstyle hand, named: thumb is p, index i, middle m, ring a — each finger owns its string (thumb on the bass, i-m-a on G, B and E). Hold an open chord and run the pattern, free stroke, letting every note ring into the next — the arpeggio-study tradition every classical method starts from. The skill is independence and evenness: four equal voices from four different fingers, no pick anywhere.',
      scales:['major'],
      tempoTiers:[55, 65, 80, 95],
      tempoTierSubdivs:['quarter', 'eighth', 'eighth', 'eighth'],
      tempoTierBars:[4, 8, 8, 8],
      base:{ practiceType:'fingerstyle_arp', pimaPattern:'pima', scale:'major', chordDepth:'triad', chordOverride:'auto', progression:'I-IV-V', voicingPosition:'open', meter:'4/4', subdivision:'quarter', bpm:55, bars:4, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G' },
      vary:[
        { pimaPattern:'pima' },
        { pimaPattern:'pami' },
        { pimaPattern:'pimami' },
        { pimaPattern:'pmim' },
        { pimaPattern:'pima', key:'C' },
        { pimaPattern:'pami', key:'G', progression:'I-vi-IV-V' }
      ]
    },
    fs_spider_adjacent: {
      label:'Spider — Middle Strings',
      goal:'The fingerstyle spider (a teacher-handed warmup from our beta thread): one finger per fret, but EVERY note crosses between the D and G strings — first the treble string leads, then the bar mirrors and the bass string leads. Thumb takes every D-string note, index every G-string note, and everything RINGS — the crossing only counts if the previous note keeps sounding. The frame walks up the neck one fret per cycle and back. Start at the 5th fret where the stretches are kind.',
      scales:[],
      tempoTiers:[60, 75, 90, 105],
      tempoTierSubdivs:['quarter', 'quarter', 'quarter', 'eighth'],
      base:{ practiceType:'spider', spiderPair:'adjacent', chromaticPattern:'1342', meter:'4/4', subdivision:'quarter', bpm:60, bars:8, direction:'up_down', advancedMode:false, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', fretMin:5, fretMax:12 },
      vary:[
        { spiderPair:'adjacent', chromaticPattern:'1342', fretMin:5, fretMax:12 },
        { spiderPair:'adjacent', chromaticPattern:'1234', fretMin:5, fretMax:12 },
        { spiderPair:'adjacent', chromaticPattern:'1324', fretMin:5, fretMax:12 },
        { spiderPair:'adjacent', chromaticPattern:'4321', fretMin:5, fretMax:12 },
        { spiderPair:'adjacent', chromaticPattern:'1342', fretMin:1, fretMax:8 }
      ]
    },
    fs_spider_skip: {
      label:'Spider — Skip Strings',
      goal:'The spider stretched: the same crossing pattern, but the pair jumps to the A and B strings — a string skipped on both sides. The right hand reaches further (thumb low, middle finger high), the left hand stretches wider, and the untouched middle strings must stay silent while the played ones ring. This is where the spider starts earning its name.',
      scales:[],
      tempoTiers:[60, 72, 85, 100],
      tempoTierSubdivs:['quarter', 'quarter', 'quarter', 'eighth'],
      base:{ practiceType:'spider', spiderPair:'skip', chromaticPattern:'1342', meter:'4/4', subdivision:'quarter', bpm:60, bars:8, direction:'up_down', advancedMode:false, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', fretMin:5, fretMax:12 },
      vary:[
        { spiderPair:'skip', chromaticPattern:'1342', fretMin:5, fretMax:12 },
        { spiderPair:'skip', chromaticPattern:'1234', fretMin:5, fretMax:12 },
        { spiderPair:'skip', chromaticPattern:'1324', fretMin:5, fretMax:12 },
        { spiderPair:'skip', chromaticPattern:'1342', fretMin:7, fretMax:12 }
      ]
    },
    fs_spider_wide: {
      label:'Spider — Full Width',
      goal:'The capstone stretch: the crossing pattern across BOTH outside strings — low E under the thumb, high E under the ring finger, four silent strings in between. Maximum right-hand span, maximum left-hand reach, and the let-ring rule still applies. Slow is the whole point here; if the index-to-middle stretch complains, drop back a rung. (In the source thread this one came with a warning: "if you like pain".)',
      scales:[],
      tempoTiers:[55, 70, 85, 95],
      tempoTierSubdivs:['quarter', 'quarter', 'quarter', 'eighth'],
      base:{ practiceType:'spider', spiderPair:'wide', chromaticPattern:'1342', meter:'4/4', subdivision:'quarter', bpm:55, bars:8, direction:'up_down', advancedMode:false, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', fretMin:5, fretMax:12 },
      vary:[
        { spiderPair:'wide', chromaticPattern:'1342', fretMin:5, fretMax:12 },
        { spiderPair:'wide', chromaticPattern:'1234', fretMin:5, fretMax:12 },
        { spiderPair:'wide', chromaticPattern:'1342', fretMin:7, fretMax:12 }
      ]
    },
    // ── CHORDS concept ladder (new concept_chords pack) ─────────────────────────
    // Triads/grips SOUNDED TOGETHER (vs the Triads ladder's arpeggios). 6-agent panel
    // 2026-06-04 (harmony chair + L&D + guitar/bass-pedagogy + host + folk). Phase A:
    // triad+power over strum_comp — cowboy → the 5 CAGED shapes → movable barres →
    // comping a progression. Folk lane: default DDU-UDU strum, real progressions (a
    // song's bones, not flashcards), name the common tones. Phase B (below): 7th/9th/
    // 11th/13th block chords NOW BUILT via the STRUM_GRIPS table — real sounded
    // sevenths/extensions, not triad reductions (3 added rungs). Guitar-only (bass n-a).
    // Specs: .claude/agent-memory/{harmony-theory,learning-design,guitar-pedagogy,
    // bass-pedagogy}-* / project_chord_concept_ladder.
    chord_cowboy: {
      label:'Cowboy Chords',
      goal:'The open "cowboy" chords every song is built from — G, C, D, A, E, Em, Am — changed cleanly and in time over a real strum. The skill is the change itself: getting from one grip to the next without stuttering, and hearing the I–IV–V / I–V–vi–IV root motion (C→Am shares two notes; the open G rings into C). This is rhythm guitar\'s first language — the bones you take to any campfire.',
      scales:['major'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'strum_comp', scale:'major', chordDepth:'triad', chordOverride:'auto', progression:'I-IV-V', strumPattern:'folk_pop_ddu_udu', voicingPosition:'open', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G' },
      vary:[ { progression:'I-IV-V' }, { progression:'I-V-vi-IV' }, { progression:'vi-IV-I-V', key:'C' }, { key:'A', progression:'I-IV-V' }, { key:'D', progression:'I-V-vi-IV' } ]
    },
    chord_caged_shapes: {
      label:'The Five CAGED Shapes',
      goal:'The same chord, five ways up the neck — one pass WALKS all five CAGED shapes in order, climbing from the open-position grip toward the 12th fret (each chord box names its shape). E and A are the workhorse movable barres; C, G and D are the partial/anchor grips — the movable G rings as its standard partial grab, the honest form real players use. Learn the ladder and you stop being trapped at the nut: any chord, any region. The key variations re-walk the same ladder from new frets — that is the proof the SHAPES are what you own, not one set of fret numbers. (Minor keys walk the shapes that exist as real grips — the movable G and C minor forms do not, so the minor ladder is shorter on purpose.)',
      scales:['major','natural_minor'],
      tempoTiers:[60, 80, 100, 120],
      // shapeWalk: bar i is voiced in the i-th CAGED shape low→high (the canonical
      // stack — in G: G→E→D→C→A); static_i keeps it "the SAME chord five ways".
      // fretboardSystem 'position' (not 'caged') so the variation stepper walks
      // the key vary[] instead of hijacking the shape select (the walk owns the
      // shapes). 10 bars = two full laps of the five shapes.
      base:{ practiceType:'strum_comp', scale:'major', chordDepth:'triad', chordOverride:'auto', progression:'static_i', strumPattern:'folk_pop_ddu_udu', voicingPosition:'movable', shapeWalk:true, meter:'4/4', subdivision:'eighth', bpm:80, bars:10, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G' },
      vary:[ { key:'G' }, { key:'C' }, { key:'A' }, { key:'D' }, { key:'E' } ]
    },
    chord_barre_changes: {
      label:'Barre Chords',
      goal:'Lock the E-shape and A-shape barres and play a progression in any key, up the neck, with no open strings. The skill is the movable barre: one shape becomes every chord just by sliding it to the root — and it unlocks the keys the open "cowboy" chords can\'t reach.',
      scales:['major','natural_minor'],
      tempoTiers:[65, 85, 105, 125],
      base:{ practiceType:'strum_comp', scale:'major', chordDepth:'triad', chordOverride:'auto', progression:'I-IV-V', strumPattern:'folk_pop_ddu_udu', voicingPosition:'movable', shape:'E', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'F' },
      vary:[ { shape:'E', key:'F' }, { shape:'A', key:'C' }, { shape:'E', progression:'I-V-vi-IV', key:'G' }, { shape:'A', progression:'I-IV-V', key:'D' }, { shape:'E', progression:'vi-IV-I-V', key:'A' } ]
    },
    chord_caged_progression: {
      label:'Comping the Changes',
      goal:'Comp a full progression — four-chord songs, ii–V–I — keeping the changes in time across positions. The skill is voice-economy: finding the nearest grip for each chord so your hand barely moves, the lazy-in-the-best-way rhythm-guitar feel that lets you comp a whole song without thinking about it.',
      scales:['major','natural_minor'],
      tempoTiers:[80, 105, 125, 150],
      // voicingPosition 'economy' = the goal's actual promise: from the second
      // chord on, pick the grip NEAREST the previous one across ALL five shapes
      // ("your hand barely moves"). The old config forced a fixed E-shape, which
      // marched barres up the neck — the OPPOSITE of voice economy (dogfood
      // catch 2026-06-06).
      base:{ practiceType:'strum_comp', scale:'major', chordDepth:'triad', chordOverride:'auto', progression:'I-V-vi-IV', strumPattern:'folk_pop_ddu_udu', voicingPosition:'economy', meter:'4/4', subdivision:'eighth', bpm:105, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'G' },
      vary:[ { progression:'I-V-vi-IV' }, { progression:'vi-IV-I-V', key:'C' }, { progression:'I-vi-IV-V', key:'C' }, { progression:'ii-V-I', key:'C' }, { progression:'I-IV-V', key:'E' } ]
    },
    // ── CHORDS ladder, Phase B (the STRUM_GRIPS extended-grip tier) ─────────────
    // Unlocked by the STRUM_GRIPS movable 7th/9th/11th/13th table (§ above): real
    // sounded seventh/extension chords, NOT triad reductions. Order: the 7th
    // FOUNDATION first (min7/maj7/dom7), then the harmonized-key lap, then color
    // extensions. Honesty rules from the panel: the diatonic lap ships
    // chordOverride:'auto' (never a stray dom7 — modal-audit rule); the dominant
    // extension is labelled dom9, never "11". Specs: agent-memory/{harmony-theory,
    // learning-design,guitar-pedagogy}-* / project_chord_concept_ladder.
    chord_sevenths: {
      label:'Sevenths Around the Neck',
      goal:'The three seventh-chord QUALITIES as movable barre grips — min7, dom7, maj7 — the colors that make soul, funk and jazz sound like themselves. Grab each as an E-shape and an A-shape barre and move it: a ii–V–I lays all three in a row (Dm7 → G7 → Cmaj7). The seventh is the chord\'s character; this is the grip that carries it (the Triads ladder spells it one note at a time — here it rings as a chord).',
      scales:['major'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'strum_comp', scale:'major', chordDepth:'seventh', chordOverride:'auto', progression:'ii-V-I', strumPattern:'folk_pop_ddu_udu', voicingPosition:'movable', shape:'E', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C' },
      vary:[ { shape:'E' }, { shape:'A' }, { shape:'E', progression:'I-vi-ii-V' }, { shape:'A', progression:'ii-V-I', key:'G' }, { shape:'E', progression:'vi-ii-V-I', key:'A' } ]
    },
    chord_diatonic_7ths: {
      label:'The Harmonized Key',
      goal:'Build the seventh chord on every degree of the key, in order: Imaj7 – ii m7 – iii m7 – IVmaj7 – V7 – vi m7 – vii m7♭5. Comping the whole harmonized scale teaches you which quality each degree wants — the map every progression is carved out of. Take the dorian variant and the IV turns dom7 (the bright modal carrier). Pick the nearest grip each time so the hand barely moves.',
      scales:['major','dorian'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'strum_comp', scale:'major', chordDepth:'seventh', chordOverride:'auto', progression:'diatonic_7ths', strumPattern:'folk_pop_ddu_udu', voicingPosition:'open', meter:'4/4', subdivision:'eighth', bpm:70, bars:7, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C' },
      vary:[ { key:'C' }, { key:'G' }, { scale:'dorian', key:'D' }, { scale:'dorian', key:'A' }, { key:'F' } ]
    },
    chord_color_extensions: {
      label:'Color: 9ths, 11ths & 13ths',
      goal:'The extension grips that add color over a seventh: the funk dom9 (E9/A9), the neo-soul min9 and min11, and the big-band dom13. Each lives on the top strings — the low strings keep the root and 5th. One honest lesson baked in: a guitar "11 chord" is really a min11 or a 9sus (a true dominant 11th drops the 3rd), so we label the funk grip dom9, never "11".',
      scales:['mixolydian','dorian'],
      tempoTiers:[60, 78, 95, 110],
      base:{ practiceType:'strum_comp', scale:'mixolydian', chordDepth:'seventh', chordOverride:'dom9', progression:'I-IV-V', strumPattern:'folk_pop_ddu_udu', voicingPosition:'open', meter:'4/4', subdivision:'eighth', bpm:78, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C' },
      vary:[ { chordOverride:'dom9', scale:'mixolydian', progression:'I-IV-V', key:'C' }, { chordOverride:'dom13', scale:'mixolydian', progression:'I-IV-V', key:'C' }, { chordOverride:'min9', scale:'dorian', progression:'static_i', key:'C' }, { chordOverride:'min11', scale:'dorian', progression:'static_i', key:'A' }, { chordOverride:'sus4', scale:'major', progression:'I-IV-V', key:'D' } ]
    },
    seventh_vocab: {
      label:'Seventh Chord Vocabulary',
      goal:'Every diatonic seventh chord as an arpeggio, in order: m7, m7♭5, maj7, m7, m7, maj7, dom7. The skill is hearing and fingering each seventh QUALITY in context — the four chord colors that make jazz, soul, and sophisticated harmony sound like themselves. The seventh is the chord\'s character; learn to spell it everywhere.',
      scales:['natural_minor','major','dorian','harmonic_minor'],
      tempoTiers:[65, 90, 110, 130],
      base:{ practiceType:'diatonic_arpeggios', scale:'natural_minor', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'G' }, { key:'C', shape:'A' } ]
    },
    ii_V_I_workout: {
      label:'ii–V–I Workout',
      goal:'The most common cadence in jazz — ii–V–I — run by playing each chord\'s mode over the changes (Dorian → Mixolydian → Ionian). The skill is hearing the harmony move and switching scale color per chord — the first real step toward playing the changes instead of one scale over everything.',
      scales:['major','dorian','mixolydian','melodic_minor','bebop_major','bebop_dominant'],
      tempoTiers:[70, 100, 120, 144],
      base:{ practiceType:'chord_scales', chordScaleStrategy:'mode_of_moment', scale:'major', chordDepth:'seventh', chordOverride:'auto', progression:'ii-V-I', meter:'4/4', subdivision:'eighth', swing:'swing', audioProfile:'jazz', bpm:100, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', fretMin:0, fretMax:7 },
      vary:[ { key:'C' }, { key:'F' }, { key:'Bb' }, { key:'G' }, { key:'D' }, { key:'A' } ]
    },
    harmonic_minor_exotic: {
      label:'Harmonic Minor Exotic',
      goal:'The Yngwie / flamenco sound: harmonic minor over a minor progression, mode-of-the-moment with a dom7 on every chord so each bar lands the raised 7th — the leading tone that pulls outside the key. The skill is the exotic color and the V7→i resolution that defines neoclassical and Spanish playing.',
      scales:['harmonic_minor','phrygian_dominant','natural_minor'],
      tempoTiers:[70, 95, 115, 140],
      base:{ practiceType:'chord_scales', chordScaleStrategy:'mode_of_moment', scale:'harmonic_minor', chordDepth:'seventh', chordOverride:'dom7', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:110, bars:8, direction:'up_down', sequence:'fours', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'B', shape:'E' } ]
    },
    sweep_arpeggio_primer: {
      label:'Sweep Arpeggio Primer',
      goal:'One chord tone per string, swept low-to-high with a hammer-on/pull-off turnaround at the apex, then swept back down. Root anchors the bass string. Start slow — sweeps reward cleanliness over speed.',
      scales:['natural_minor','harmonic_minor','major'],
      tempoTiers:[50, 65, 80, 100],
      base:{ practiceType:'sweep_arpeggios', scale:'natural_minor', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', shape:'E' }, { key:'A', shape:'A' }, { key:'D', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'G' } ]
    },
    modal_vamp: {
      label:'Modal Vamp',
      goal:'One scale, one pedal, no chord changes — extended melodic exploration in a single tonality. Essential for modal jazz, fusion, and building phrase vocabulary without harmonic distractions.',
      scales:['dorian','mixolydian','lydian','phrygian','natural_minor','lydian_dominant','altered'],
      tempoTiers:[65, 85, 105, 125],
      base:{ practiceType:'modal_vamp', scale:'dorian', meter:'4/4', subdivision:'eighth', bpm:80, bars:16, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[ { key:'A', scale:'dorian', shape:'E' }, { key:'D', scale:'dorian', shape:'E' }, { key:'G', scale:'mixolydian', shape:'E' }, { key:'A', scale:'lydian', shape:'E' }, { key:'A', scale:'altered', shape:'E' } ]
    },
    bend_drill: {
      label:'Bending Drill',
      goal:'Whole-step bends on the upper three strings. Bend up to the target pitch, hold, listen. Consistent intonation is the entire point — if you can\'t hear when you\'re sharp, slow down. Classic blues and rock vocabulary.',
      scales:['minor_pentatonic','blues','major_pentatonic','major'],
      tempoTiers:[50, 65, 80, 95],
      base:{ practiceType:'bending', bendTarget:'whole', scale:'minor_pentatonic', meter:'4/4', subdivision:'quarter', bpm:60, bars:8, direction:'up_down', advancedMode:false, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'A', shape:'E' },
      vary:[
        { key:'A', shape:'E', bendTarget:'whole' },
        { key:'A', shape:'E', bendTarget:'half' },
        { key:'E', shape:'E', bendTarget:'whole' },
        { key:'A', shape:'E', bendTarget:'mixed' },
        { key:'D', shape:'E', bendTarget:'whole' },
      ]
    },
    // ── Guitar Core ★ nodes (Development Pathways — guitar Core spec) ────────
    // New rungs over EXISTING generators (build-queue #1). Each names its
    // transferable skill (north star). Comping nodes (B5/I6/I7) await
    // buildCompingExercise; the master/improv rung (A8) awaits its engine.
    pulse_muting: {
      label:'Pulse & Muting',
      goal:'The foundation under everything: lock to the click and control the mute. A palm-muted pedal on your open lowest string chugs the beat while a tight power chord (root+5th) lands on each downbeat — straight feel first. The skill is the metronome relationship and both-hand muting (palm-mute + left-hand dampening), not the notes. The later steps move the pedal to a FRETTED root — a different mute: your fretting finger owns the note length. Own this and every riff sits in the pocket.',
      scales:['natural_minor','minor_pentatonic'],
      tempoTiers:[50, 65, 80, 95],
      base:{ practiceType:'pedal_riff', harmonize:false, scale:'natural_minor', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'eighth', bpm:60, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'static_i', chordOverride:'5', swing:'straight', drums:'none', fretMin:0, fretMax:5 },
      // The sixteenth step lands LAST (guitar-pedagogy 2026-06-12): the old
      // order doubled 8th→16th straight out of the entry step with no bridge —
      // the fretted-pedal moves come first, density doubles only at the end.
      vary:[
        { progression:'static_i', subdivision:'eighth' },
        { progression:'static_i', anchorFret:5 },
        { progression:'static_i', anchorFret:3 },
        { progression:'static_i', subdivision:'sixteenth' },
      ]
    },
    power_chord_comping: {
      label:'Power-Chord Comping',
      goal:'Power chords as harmony, not metal — root+5th dyads moving through a musical minor progression (i–♭VII–♭VI–♭VII) over a tonic pedal. The skill is changing power-chord shapes cleanly in time and hearing the root motion. Works in any tuning — the riff anchors on your lowest string; this is the chord vocabulary every rock and pop rhythm part is built from.',
      scales:['natural_minor','minor_pentatonic','major'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'pedal_riff', harmonize:false, scale:'natural_minor', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'i-VII-VI-VII', chordOverride:'5', swing:'straight', drums:'none', fretMin:0, fretMax:7 },
      vary:[
        { progression:'i-VII-VI-VII' },
        { progression:'I-V-vi-IV', scale:'major', anchorFret:3 },
        { progression:'i-VI-III-VII' },
        { progression:'I-IV-V', scale:'major', anchorFret:5 },
      ]
    },
    major_scale_caged: {
      label:'Major Scale — CAGED',
      goal:'The headline scale, learned as five connected shapes. Start with C major in the E shape (the most ergonomic box), then move through the A, G, C, and D shapes — same notes, five zones of the neck. The skill is connecting positions so the major scale stops being one box and becomes the whole fretboard. The map every other scale is measured against.',
      scales:['major'],
      tempoTiers:[60, 85, 105, 130],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:85, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'I-IV-V', chordDepth:'triad', chordOverride:'auto', key:'C', shape:'E' },
      vary:[ { key:'C', shape:'E' }, { key:'C', shape:'A' }, { key:'C', shape:'G' }, { key:'C', shape:'C' }, { key:'C', shape:'D' } ]
    },
    sixteenth_pocket: {
      label:'Sixteenth-Note Pocket',
      goal:'Rhythm at the next resolution: four even sixteenths per beat, then loosen them into a swung feel. Run minor pentatonic as the vehicle, but the focus is the subdivision — staying even, accenting the downbeat of each group, then flipping to swing. The 16th pocket is the engine of funk, R&B, and modern rhythm playing.',
      scales:['minor_pentatonic','blues','dorian'],
      tempoTiers:[55, 70, 85, 100],
      base:{ practiceType:'scale', scale:'minor_pentatonic', meter:'4/4', subdivision:'sixteenth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'i-VII-VI-VII', chordDepth:'seventh', chordOverride:'min7', key:'A', shape:'E', swing:'straight' },
      vary:[ { swing:'straight' }, { swing:'swing' }, { sequence:'fours' }, { key:'E', shape:'E' }, { key:'G', shape:'E' } ]
    },
    guide_tones_path: {
      label:'Guide Tones',
      goal:'The 3rds and 7ths are what spell a chord — and they move by the smallest steps through a progression. Voice-lead just those two notes through a ii–V–I and you hear the changes with two notes per chord. The skill is voice leading: connecting chords by their closest tones. The spine of jazz comping and melodic soloing over changes.',
      scales:['major','dorian','mixolydian'],
      tempoTiers:[55, 75, 95, 115],
      base:{ practiceType:'guide_tones', scale:'major', progression:'ii-V-I', chordDepth:'seventh', voices:'both_alternating', meter:'4/4', subdivision:'quarter', bpm:75, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', key:'C', shape:'E' },
      vary:[ { voices:'thirds_only' }, { voices:'sevenths_only' }, { voices:'both_alternating' }, { key:'F', voices:'both_alternating' }, { key:'Bb', voices:'both_alternating' } ]
    },
    whole_neck_freedom: {
      label:'Whole-Neck Freedom',
      goal:'Stop thinking in boxes. The full-neck map plays the major scale across all positions at once — every note in the key, fret 0 to the top. The skill is freedom of movement: finding any key by feel anywhere on the neck, connecting zones without seams. The endgame of the pitch map.',
      scales:['major','natural_minor','minor_pentatonic'],
      tempoTiers:[60, 80, 100, 120],
      base:{ practiceType:'scale', scale:'major', meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'full_neck', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'I-V-vi-IV', chordDepth:'triad', chordOverride:'auto', key:'C' },
      vary:[ { key:'C' }, { key:'G' }, { key:'A' }, { key:'E' }, { key:'D' } ]
    },
    melmin_exotic_12key: {
      label:'Melodic Minor & Exotic',
      goal:'Beyond the diatonic world: melodic-minor modes and symmetric/exotic scales, cycled through keys. Lydian dominant, altered, Locrian ♮2, plus diminished and whole-tone colors — the vocabulary of fusion, film, and modern jazz. The skill is hearing and fingering these unusual scales in any key, on demand.',
      scales:['melodic_minor','lydian_dominant','altered','locrian_sharp2','lydian_augmented','diminished','whole_tone'],
      tempoTiers:[65, 90, 110, 135],
      base:{ practiceType:'scale', scale:'melodic_minor', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'caged', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'static_i', chordDepth:'seventh', chordOverride:'auto', key:'A', shape:'E' },
      vary:[ { scale:'melodic_minor', key:'A' }, { scale:'lydian_dominant', key:'C' }, { scale:'altered', key:'E' }, { scale:'locrian_sharp2', key:'B' }, { scale:'lydian_augmented', key:'G' } ]
    },
    // ── Metal / heavy-genre pack (genre-framework §3) ────────────────────────
    metalcore_chug: {
      label:'Metalcore Pedal Chug',
      goal:'The defining heavy riff: a palm-muted pedal on your open lowest string alternating with power chords that move by semitone (i–♭II–i–♭VII). Lock the pedal chugs to the click, keep the power chords tight and muted. Any tuning — the pedal rides whatever your lowest string sounds. Start slow — the groove is in the precision, not the speed.',
      scales:['phrygian','natural_minor'],
      tempoTiers:[80, 100, 120, 140],
      base:{ practiceType:'pedal_riff', harmonize:false, scale:'phrygian', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'eighth', bpm:80, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_drop_d', renderer:'highway_3d', progression:'metal_pedal_chromatic', chordOverride:'5', fretMin:0, fretMax:7 },
      vary:[
        { progression:'metal_pedal_chromatic', subdivision:'eighth' },
        { progression:'metal_i_bVI_bVII', subdivision:'eighth' },
        { scale:'natural_minor', progression:'metal_pedal_chromatic' },
        { progression:'metal_pedal_chromatic', subdivision:'gallop' },
      ]
    },
    melodic_metal_gallop: {
      label:'Melodic Metal Gallop',
      goal:'Galloping power chords (eighth + two sixteenths) over a minor/harmonic-minor key — the NWOBHM / power-metal engine. The gallop lives in the picking hand: down on the eighth, down-up on the sixteenths, palm muted. i–♭VI–♭VII root motion.',
      scales:['harmonic_minor','natural_minor'],
      tempoTiers:[90, 120, 150, 180],
      base:{ practiceType:'pedal_riff', harmonize:false, scale:'harmonic_minor', anchor:'open_lowest', anchorFret:5, meter:'4/4', subdivision:'gallop', bpm:120, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_standard', renderer:'highway_3d', progression:'metal_i_bVI_bVII', chordOverride:'5', fretMin:0, fretMax:9 },
      vary:[
        { subdivision:'gallop', progression:'metal_i_bVI_bVII' },
        { subdivision:'reverse_gallop', progression:'metal_i_bVI_bVII' },
        { scale:'natural_minor', subdivision:'gallop' },
        { progression:'metal_i_bVII_bVI_V', subdivision:'gallop' },
      ]
    },
    // ── Metal LEAD over the band (band-intel application rungs, panel 2026-06-13) ──
    // The Metal pack's missing APPLICATION layer: the band is all riff-drills with
    // no "solo over the band." These put the player in a pure LEAD role over a real
    // distorted rhythm section (double-tracked DI-through-Metal-amp power-chord comp
    // + a root-pump bass + drums) — the live trigger for the distorted-comp realism.
    // The LEAD stays clean DI in STANDARD tuning, high in the singing register
    // (fret 11–15 box) — DECOUPLED from the heavy backing (guitar-pedagogy ruling:
    // the "lead must use the low open string" rule is for ONE player covering both
    // roles; here the backing is audio and the hands are free). Comp = power 5ths.
    metal_lead_changes: {
      label:'Lead Over the Band',
      goal:'Stop drilling riffs — SOLO over them. A full metal rhythm section chugs i–♭VI–♭VII (Em–C–D) underneath: double-tracked palm-muted power chords, a locked bass, drums. Your job is the lead — run E natural minor in the 12th-fret box, in time, and HEAR the band move under you. Every note of the box fits all three chords (it IS the key), so you can\'t hit a wrong note — the skill is phrasing in time and feeling the changes. Then start landing chord tones as each chord arrives (the root or 5th of the chord playing NOW). A clean lead tone over a heavy band is exactly how real metal lead practice sounds: the backing can be as detuned and heavy as you like — your lead stays in standard, up where it sings.',
      scales:['natural_minor','harmonic_minor'],
      tempoTiers:[80, 100, 110, 120],
      base:{ practiceType:'scale', scale:'natural_minor', key:'E', progression:'metal_i_bVI_bVII', chordOverride:'5', backingComp:'metal_chug_8', backingBass:'root_pump', audioProfile:'metal', meter:'4/4', subdivision:'eighth', bpm:100, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', fretMin:11, fretMax:15, stringSetup:'guitar_6_standard', renderer:'highway_3d', swing:'straight' },
      vary:[
        { key:'E' },
        { key:'A' },
        { scale:'harmonic_minor', key:'E' },
        { key:'G' },
      ]
    },
    metal_lead_phrygian: {
      label:'Phrygian Lead Over a Vamp',
      goal:'The metal/neoclassical LEAD color: E Phrygian over a static i–♭II vamp. The rhythm guitar pedals a heavy djent sixteenth chug on one tonal center — no changes to track, so pour everything into the MODE. The signature is the ♭2 (F natural): reach for it (and the ♭6, C) as TENSION, then drop a half-step down to the root or 5th — the "Phrygian drop" is the whole sound. Same 12th-fret box as the natural-minor rung with the 2nd flattened — one new note, a big new flavor. Stay up in the singing register; let the band stay low and heavy underneath.',
      scales:['phrygian','harmonic_minor'],
      tempoTiers:[90, 105, 115, 125],
      base:{ practiceType:'scale', scale:'phrygian', key:'E', progression:'phrygian_vamp', chordOverride:'5', backingComp:'metal_pedal_16', backingBass:'root_pump', audioProfile:'djent', meter:'4/4', subdivision:'eighth', bpm:105, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', fretMin:11, fretMax:15, stringSetup:'guitar_6_standard', renderer:'highway_3d', swing:'straight' },
      vary:[
        { key:'E' },
        { scale:'harmonic_minor', key:'E' },
        { key:'A' },
        { key:'D' },
      ]
    },
    melodeath_twin_leads: {
      label:'Melodic Death Twin Leads',
      goal:'The Gothenburg signature: two guitars harmonized a 3rd apart, both voices sounding together over a minor key. Play the lower line cleanly first, then let the harmony ring with it. Natural and harmonic minor; tremolo-pick for the full melodeath feel.',
      scales:['natural_minor','harmonic_minor'],
      tempoTiers:[80, 100, 120, 140],
      base:{ practiceType:'scale_thirds', harmonize:true, tremolo:true, scale:'natural_minor', key:'E', meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'caged', shape:'E', stringSetup:'guitar_6_standard', renderer:'highway_3d' },
      vary:[
        { practiceType:'scale_thirds', harmonize:true, scale:'natural_minor' },
        { practiceType:'scale_sixths', harmonize:true, scale:'natural_minor' },
        { practiceType:'scale_thirds', harmonize:true, scale:'harmonic_minor', key:'D' },
        { practiceType:'scale_thirds', harmonize:true, scale:'natural_minor', subdivision:'gallop' },
      ]
    },
    // ── Djent sub-ladder (panel 2026-06-05; memory project_djent_ladder_design) ──
    // A DEEPEN of this Metal pack, not a new band: the old lone djent_polymeter rung
    // started a learner at the summit; these rungs build the climb under it. Pure
    // curation — rhythm_pulse / RHYTHM_CELLS / pedal_riff + grouping meters; the
    // difficulty axis is rhythmic grouping/displacement + tempo, never pitch.
    // `instAgnostic:true` rungs are pure TIME skills: applyPathwayById adapts them to
    // the player's instrument (the bass djent job is locking the same cell on the low
    // fundamental — bass-pedagogy ruling: rhythm_pulse IS the bass chug; pedal_riff's
    // chord stack is guitar-coded). TRUE polymeter (a cell coprime with the bar that
    // drifts + re-locks after lcm bars) is GATED on the `@` decoupled phrase clock —
    // do not promise it in a goal-card; the 16/8 long cell is the honest stand-in.
    djent_chug_lock: {
      label:'Low Chug Lock',
      goal:'The bedrock of djent: ONE palm-muted note on the lowest string, struck dead even against the click. The pitched content is a single note — the music is the staccato gate: pick-hand evenness, consistent palm-mute depth, and the fret-hand mute that chokes the string between hits. Your picking hand IS the metronome (this is the Single-String Pulse skill at maximum heaviness). All downstrokes for the tight, aggressive default — and know the gate: past roughly 200 BPM in eighths the wrist ceiling hits and real players switch to alternate picking. Tightness beats speed. On bass this rung adapts as-is — pick, palm-muted, locked on the low fundamental is the canonical djent-bass attack; if the picking forearm tightens, drop a tier — relaxation is the skill.',
      scales:['phrygian','natural_minor'],
      tempoTiers:[70, 90, 110, 130],
      instAgnostic:true,
      base:{ practiceType:'rhythm_pulse', pulseAccent:0, pulseOffbeat:false, strokePolicy:'metal', scale:'phrygian', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'eighth', bpm:70, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_drop_d', renderer:'highway_3d', audioProfile:'djent', fretMin:0, fretMax:4 },
      vary:[
        { subdivision:'eighth' },
        { subdivision:'triplet' },
        { subdivision:'sixteenth' },
        { subdivision:'eighth', pulseOffbeat:true },
        { subdivision:'sixteenth', stringSetup:'guitar_7_standard' },
      ]
    },
    djent_accent_grid: {
      label:'Accent the Grid',
      goal:'Keep the chug dead even and move WHERE the accent falls — on the beat, then the "e", the "&", the "a". The accented-vs-ghost chug is djent\'s groove engine: one rhythm becomes four feels without changing a single note. The grid stays square; only the emphasis walks. Count out loud and let the accent carry the groove — this is Accent Displacement applied at full weight, and it\'s what separates a riff that leans from a riff that just repeats.',
      scales:['phrygian'],
      tempoTiers:[55, 70, 85, 100],
      instAgnostic:true,
      base:{ practiceType:'rhythm_pulse', pulseAccent:0, pulseOffbeat:false, scale:'phrygian', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'sixteenth', bpm:55, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_drop_d', renderer:'highway_3d', audioProfile:'djent', fretMin:0, fretMax:4 },
      vary:[
        { pulseAccent:0 },
        { pulseAccent:1 },
        { pulseAccent:2 },
        { pulseAccent:3 },
        { subdivision:'eighth', pulseOffbeat:true },
      ]
    },
    // Rung 3 — the former "Djent Polymeter Chug", RELABELLED (panel honesty fix):
    // 8/8:3+3+2 is an additive GROUPING that re-locks every bar, not true polymeter.
    // The id stays `djent_polymeter` (stored progress/lastPathway references).
    djent_polymeter: {
      label:'Chug & Stab (Grouping Cells)',
      goal:'THE djent signature: a palm-muted low pedal with power-chord stabs (root+5th+octave) landing on the starts of an additive grouping — 3+3+2 over a steady count. Count the eighths 1-2-3 / 1-2-3 / 1-2 and let the stabs walk against the grid; the bar snaps them back on the downbeat. The harmony is static — the "progression" IS the grouping. Named honestly: this cell re-locks every bar (an additive grouping, metric superimposition\'s square cousin) — TRUE polymeter, where a riff cell drifts across many bars before realigning, is the summit this ladder builds toward. The 16/8 variation is the longest honest climb: a cell twice as long before it resolves.',
      scales:['phrygian','natural_minor'],
      tempoTiers:[70, 90, 110, 130],
      base:{ practiceType:'pedal_riff', harmonize:false, scale:'phrygian', anchor:'open_lowest', anchorFret:0, meter:'8/8:3+3+2', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_7_standard', renderer:'highway_3d', progression:'metal_pedal_chromatic', chordOverride:'5oct', audioProfile:'djent', fretMin:0, fretMax:7 },
      // anchor: the djent pedal idiom IS the open lowest string — whatever the
      // player's instrument makes it (was key:'B' hand-tuned to the 7-string;
      // the anchor model derives it for any tuning/string count).
      vary:[
        { meter:'8/8:3+3+2', chordOverride:'5oct' },
        { meter:'16/8:3+3+3+3+2+2', chordOverride:'5oct' },
        { meter:'8/8:3+3+2', scale:'natural_minor' },
        { meter:'7/8:3+2+2', chordOverride:'5oct' },
      ]
    },
    djent_skip_gallop: {
      label:'Skip & Gallop Chug',
      goal:'The cell vocabulary ON the chug: the gallop (an eighth + two sixteenths), then its mirror the reverse gallop — the djent stutter, back-weighted and meaner — then the dotted "skip" and the front-loaded "snap". Down on the eighth, down-up on the sixteenths, palm muted throughout. Lock one cell until it\'s automatic, then switch cells by ear; the device is the rhythm cell, not the notes. These stay in 4/4 on purpose — a gallop doesn\'t divide an asymmetric bar, so the cells live on the square grid here and the groupings live in Chug & Stab.',
      scales:['phrygian','natural_minor'],
      tempoTiers:[60, 80, 100, 120],
      instAgnostic:true,
      base:{ practiceType:'rhythm_pulse', pulseAccent:0, pulseOffbeat:false, scale:'phrygian', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'gallop', bpm:80, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_drop_d', renderer:'highway_3d', audioProfile:'djent', fretMin:0, fretMax:4 },
      vary:[
        { subdivision:'gallop' },
        { subdivision:'reverse_gallop' },
        { subdivision:'skip_chug' },
        { subdivision:'snap' },
        { subdivision:'reverse_gallop', stringSetup:'guitar_7_standard' },
      ]
    },
    djent_moving_chug: {
      label:'Moving Power-Chord Chug',
      goal:'Move the riff, not just the accent: shift the root+5th+octave stack across the low strings inside a dead-even palm-muted chug — semitone menace first (i–♭II), then the modal i–♭VI–♭VII. The skill is hand independence: the fretting hand jumps, the picking hand never flinches. On drop tunings, fret the low stack with the THUMB OVER the neck — the named technique that frees fingers 1–4 for everything above the pedal. The variations walk the floor down: 7-string B standard → drop A → 8-string F♯. The sixteenth variation sits past the all-downstroke ceiling — alternate-pick it.',
      scales:['phrygian','natural_minor'],
      tempoTiers:[70, 90, 110, 130],
      base:{ practiceType:'pedal_riff', harmonize:false, scale:'phrygian', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_7_standard', renderer:'highway_3d', progression:'metal_pedal_chromatic', chordOverride:'5oct', audioProfile:'djent', fretMin:0, fretMax:7 },
      vary:[
        { progression:'metal_pedal_chromatic' },
        { progression:'metal_i_bVI_bVII' },
        { subdivision:'sixteenth', progression:'metal_pedal_chromatic' },
        { customOpenMidis:'33,40,45,50,55,59,64', progression:'metal_pedal_chromatic' },
        { stringSetup:'guitar_8_standard', progression:'metal_pedal_chromatic' },
      ]
    },
    // Capstone — the on-ramp to creation (mirror of the Rhythm band's Trade Bars):
    // echo the chug cell, then construct your own grouping. Mirror, not judge.
    // The HERTA CHUG (Christian's dogfood ask 2026-06-12: the melodic
    // pick_herta drill was NOT this — he wanted the famous djent RHYTHM
    // figure). One palm-muted chug note, the [16th + two 32nds + 16th] herta
    // cell repeated gapless — a ¾-beat cell that phases 3-over-2 against the
    // 4/4 backbeat and re-aligns every 3 beats. Canonical tempo ≈115 (the
    // Push tier). Cell ruling verified against the drum-transcription
    // literature 2026-06-12 (metal-idiom review + source check).
    djent_herta_chug: {
      label:'Herta Chug',
      goal:'THE modern-djent rhythm figure, on one palm-muted chug note: a sixteenth, two thirty-seconds, then another sixteenth — the drummers\' "herta" — repeated with no gap. The cell is three sixteenths long, so its accent walks across the 4/4 backbeat (a 3-over-2) and only re-lands on a downbeat every 3 beats: that lurch-that-isn\'t-a-meter-change is the entire sound. Strict alternate picking, machine-even, accents from the wrist not the forearm; the drums hold a dead-simple half-time groove underneath — your job is to phase against it without losing the one. When the doubles smear into a buzz or the forearm pumps, drop a tier. The Push tier sits at the figure\'s canonical tempo; the straight-16ths variation is the endurance contrast (same wrist motion, no lurch).',
      scales:['phrygian','natural_minor'],
      tempoTiers:[60, 80, 100, 115],
      instAgnostic:true,
      base:{ practiceType:'rhythm_pulse', pulseAccent:0, pulseOffbeat:false, strokePolicy:'alternate', scale:'phrygian', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'herta_chug', bpm:60, bars:9, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_drop_d', renderer:'highway_3d', audioProfile:'djent', fretMin:0, fretMax:4 },
      vary:[
        { subdivision:'herta_chug' },
        { subdivision:'sixteenth' },
        { subdivision:'herta_chug', anchorFret:1 },
        { subdivision:'herta_chug', stringSetup:'guitar_7_standard' },
      ]
    },
    djent_lock_the_cell: {
      label:'Lock the Cell — Djent Jam',
      goal:'The payoff: two bars of call, two bars of space to answer. Echo the call\'s RHYTHM back, then start bending it — your accents, your gallop, your grouping — until the answer is YOUR riff. This is where the cell grammar becomes writing: you\'re not running a drill anymore, you\'re constructing djent over a steady pulse, the way the bands you listen to actually write. Trade with the click and make the space heavy — in this style the silence between chugs is part of the riff.',
      scales:['phrygian','minor_pentatonic'],
      tempoTiers:[70, 85, 100, 120],
      instAgnostic:true,
      base:{ practiceType:'call_response', scale:'phrygian', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'eighth', bpm:90, bars:8, direction:'up_down', sequence:'none', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_6_drop_d', renderer:'highway_3d', audioProfile:'djent', fretMin:0, fretMax:4 },
      vary:[
        { subdivision:'eighth' },
        { subdivision:'sixteenth' },
        { subdivision:'reverse_gallop' },
        { meter:'8/8:3+3+2' },
        { subdivision:'sixteenth', stringSetup:'guitar_7_standard' },
      ]
    },
    death_chromatic: {
      label:'Death Metal Chromatic Riffs',
      goal:'Non-functional, tritone-laced power-chord riffs over the darkest scales (Locrian, diminished, double harmonic). Roots move by semitone and tritone — no key gravity, pure menace. Tremolo-pick at speed; lowest tunings. i–♭II–i–♭v.',
      scales:['locrian','phrygian','diminished','double_harmonic'],
      tempoTiers:[100, 130, 160, 190],
      base:{ practiceType:'pedal_riff', harmonize:false, tremolo:true, scale:'locrian', anchor:'open_lowest', anchorFret:0, meter:'4/4', subdivision:'eighth', bpm:120, bars:8, direction:'up_down', advancedMode:true, fretboardSystem:'position', stringSetup:'guitar_7_standard', renderer:'highway_3d', progression:'metal_death_tritone', chordOverride:'5', fretMin:0, fretMax:9 },
      vary:[
        { progression:'metal_death_tritone', scale:'locrian' },
        { progression:'metal_death_tritone', scale:'diminished' },
        { progression:'metal_pedal_chromatic', scale:'phrygian', subdivision:'gallop' },
        { progression:'metal_death_tritone', scale:'double_harmonic' },
      ]
    }
  };
