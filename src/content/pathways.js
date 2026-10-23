// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Christian Cowan
/**
 * Authored form overrides precede readConfig: meter is text and shape may be a
 * numeric 3NPS position, unlike the realized GenerationConfig. Base and variation
 * share this partial contract so guards can inspect either without union gaps.
 * @typedef {Object} PathwayConfig
 * @property {string} [practiceType]
 * @property {string} [scale]
 * @property {string} [meter]
 * @property {string} [subdivision]
 * @property {number} [bpm]
 * @property {number} [bars]
 * @property {string} [direction]
 * @property {string} [sequence]
 * @property {boolean} [advancedMode]
 * @property {string} [fretboardSystem]
 * @property {string} [stringSetup]
 * @property {string} [renderer]
 * @property {string} [progression]
 * @property {string} [chordDepth]
 * @property {string} [chordOverride]
 * @property {string} [drums]
 * @property {string} [backingStyle]
 * @property {string} [swing]
 * @property {string} [audioProfile]
 * @property {string} [key]
 * @property {number} [fretMin]
 * @property {number} [fretMax]
 * @property {string} [chordScaleStrategy]
 * @property {string | number} [shape]
 * @property {string} [voices]
 * @property {string} [bendTarget]
 * @property {string} [motifCell]
 * @property {string} [motifPhase]
 * @property {boolean} [harmonize]
 * @property {string} [rfoPattern]
 * @property {string} [walkApproach]
 * @property {string} [rhTechMode]
 * @property {number} [pulseAccent]
 * @property {boolean} [pulseOffbeat]
 * @property {string} [anchor]
 * @property {number} [anchorFret]
 * @property {string} [chromaticPattern]
 * @property {string} [walkFeel]
 * @property {string} [strokePolicy]
 * @property {number} [hertaAccent]
 * @property {boolean} [hertaWalk]
 * @property {number} [sweepStrings]
 * @property {boolean} [tapArp]
 * @property {string} [pimaPattern]
 * @property {string} [voicingPosition]
 * @property {string} [spiderPair]
 * @property {string} [strumPattern]
 * @property {boolean} [shapeWalk]
 * @property {string} [backingComp]
 * @property {string} [backingBass]
 * @property {boolean} [tremolo]
 * @property {string} [customOpenMidis]
 *
 * Static lessons and the catalog-hydrated chromatic_warmup share this registry.
 * Density arrays are absent on ordinary tempo-only ladders, not empty defaults.
 * @typedef {Object} Pathway
 * @property {string} label
 * @property {string} goal
 * @property {string[]} scales
 * @property {number[]} tempoTiers
 * @property {PathwayConfig} base
 * @property {PathwayConfig[]} vary
 * @property {boolean} [instAgnostic]
 * @property {boolean} [feltGate]
 * @property {string[]} [tempoTierSubdivs]
 * @property {number[]} [tempoTierBars]
 * @property {import('../core/practice-files.js').Practice} [practiceFile]
 * @property {string[]} [formCues]
 */
// Keep this shared object mutable: the shell catalog inserts authored lessons.
/** @type {Record<string, Pathway>} */
export const PATHWAYS = {
    // ── Triad Mastery ladder (Concepts family) ──────────────────────────────────
    // A "concept ladder": one skill sequenced easy→mastery (inversions → positions →
    // over changes → pairs), a VERTICAL column through difficulty vs the Core bands'
    // horizontal staircase. ~80% curation of existing arpeggio generators; the
    // differentiating rung (upper-structure triad over a moving bass) is the queued
    // new generator — see docs/plugin/design/triad-mastery-ladder.md. Reviewed: guitar-pedagogy +
    // harmony-theory (2026-06-03). Each goal-card NAMES the transferable skill.
    // ── Guide-Tones & Voice-Leading ladder (Concepts family) ────────────────────
    // The single highest-value harmony ladder (harmony-theory): changes are LINES,
    // not boxes — the 3rd/7th skeleton + nearest-tone voice leading through a tune.
    // Pure curation (shell_voicings → guide_tones → chord_scales/Connect). Reviewed
    // by harmony-theory (2026-06-03). See docs/plugin/design/triad-mastery-ladder.md (concept-ladder pattern).
    // ── Arpeggio Mastery ladder (Concepts family) ───────────────────────────────
    // The arpeggio-spelling spine (harmony-theory): seventh arps → inversions → over
    // changes → swept application. Bridges Triads (below) and Guide-Tones (above).
    // Pure curation. Reviewed by harmony-theory + guitar-pedagogy (2026-06-03).
    // ── Fretboard Freedom ladder (Concepts family) ──────────────────────────────
    // The fretboard-mastery vertical (learning-design's "#1 player ask"): one box →
    // CAGED links → position shifts → 3NPS → whole-neck. Pure curation (scale across
    // fretboardSystems + position_shift). Difficulty axis = spatial coverage, not tempo.
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
    // GUITAR Sixths (instrument-SPLIT, panel ruling 2026-06-11): 6ths are a guitar-
    // specific grip lesson — the major-3rd between strings 2-3 (the B string) makes a
    // 6th a tidy adjacent/skipped-string shape that SHIFTS one fret across that
    // boundary. Bass's uniform 4ths can't mirror it (a bass 6th is a punishing
    // consecutive cross-string run), so bass gets its own rung below (isHiddenNode
    // shows each instrument only its own).
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
    // Core-Beginner SEED rung (instAgnostic) — the discoverability fix the L&D review
    // asked for: a beginner who can't find interval practice meets it in the always-
    // visible Core (the Intervals pack is opt-in). One rung only — Root–3rd–5th by ear
    // — a tiny step up from bass_root_fifth_octave (same box, add the 3rd). Lives in the
    // core_beginner band; the full treatment is the opt-in Intervals ladder above.
    // ── Expression ladder (Concepts family) ─────────────────────────────────────
    // The "make a note SING" vertical (guitar-pedagogy #1): vibrato → half-bend →
    // whole-bend → mixed. Difficulty axis = pitch CONTROL/accuracy, not tempo (so
    // tempo tiers stay slow). Pure curation (vibrato + bending bendTarget). The
    // unison/oblique + microbend rungs (a 2-note bend param) are a queued follow-on.
    // ── BLUES genre ladder (deepens the style_blues pack) ───────────────────────
    // Genre ladder = the APPLICATION layer (vocabulary→technique→application→improv)
    // in the blues accent. Blues is the LEAST backing-gated genre (the boogie/shuffle
    // backing is built). Reviewed by blues-idiom-architect (2026-06-03). The turnaround
    // rung — held since 2026-06-03 pending "a turnaround-figure token" — shipped
    // 2026-06-12 as the riff-vocabulary pilot (blues_turnaround + _build below):
    // the token is COMMON_PROGRESSIONS.blues_turnaround + MOTIF_CELLS.
    // ── Blues VOCABULARY rungs (riff-vocabulary pilot, 2026-06-12) ──────────────
    // The arc NAME → DRILL → VARY → CONSTRUCT → JAM (docs/plugin/riff-vocabulary-playbook.md):
    // the goal-card NAMES the device, the drill rung's vary[] is ONE axis
    // (transposition — D9: a lick clean in 5 keys is a transferable device; the
    // same lick at 200 BPM in one key is a parlor trick; tempoTiers short), the
    // _build rung IS the construction step, and the jam hand-off is the prereq
    // edge back into blues_call_response/blues_mix. The cell owns its harmony
    // (prog + dom7) — the rung deliberately codes NO progression/chordOverride.
    // ── ROCK genre ladder (new style_rock pack) ─────────────────────────────────
    // Classic/hard/alt rock (Metal already has its own pack). The APPLICATION layer:
    // power-chord drive → pentatonic lead → double-stops → riff-building → ♭VII changes.
    // Fully buildable on existing generators; the FEEL ceiling is the backing rebuild
    // (pad, not a rhythm-guitar). Reviewed by rock-idiom-architect (2026-06-03).
    // ── COUNTRY genre ladder (deepens the style_country pack) ────────────────────
    // Reviewed by country-idiom-architect (2026-06-03). major_pent_country is reused
    // as rung 1. The chicken-pickin' "cluck" (an mt ghost) + true oblique double-stop
    // bends are flagged as deferred technique/backing-engine enhancements.
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
    // Capstone — the on-ramp to creation (the north star's "drills are the entrance,
    // creativity the destination"): echo the rhythm, then make the answer your own.
    // ── PICKING concept ladder (new concept_picking pack) ───────────────────────
    // The pick-hand engine (guitar-pedagogy #2). Difficulty axis = coordination/crossing,
    // tempo last. Pure curation (tremolo_picking, scale, string_skipping, hybrid_picking).
    // The 16th-note chromatic — moved OUT of chromatic_warmup (2026-06-12 beginner
    // dogfood: 16ths in the entry rung were "too complicated by an actual
    // beginner"). Here it is what it always really was: an alternate-picking
    // speed/endurance drill that assumes the warmup's hand sync is already owned.
    // Economy crossings (hand-marks Slice 2; the Picking band's crossing-strategy
    // gap — L&D's named rung). The strokePolicy field drives the pkd marks: the
    // economy school's crossing continues the pick's travel direction (the mini
    // sweep), contrasted against strict alternate (whose crossings split into
    // outside/inside). 3NPS makes the crossings land predictably. "Built for the
    // economy school" — shown, never judged (stroke direction is undetectable).
    // The herta: a rolling 4-note burst (Tier-3; Christian's dogfood ask). The GUITAR
    // adaptation — pick/hammer/pull/pick on one string — labelled honestly as a
    // herta-STYLE burst (the authentic drum rudiment R-R-L-R accent-last is a
    // separate drum node). Difficulty axis = tempo (the BPM climb); vary = the
    // accent-control + add-pitch ladder (accent on 1 → the authentic accent-last →
    // mid → walk the base through the scale). Static-pitch first so it's pure hand
    // coordination before navigation. See ROADMAP "Tier 3" + memory user_christian_herta_dogfood.
    // ── LEGATO concept ladder (new concept_legato pack) ─────────────────────────
    // The fretting-hand engine (guitar-pedagogy #3). Pure curation (legato, tapping).
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
    // ── CHORDS ladder, Phase B (the STRUM_GRIPS extended-grip tier) ─────────────
    // Unlocked by the STRUM_GRIPS movable 7th/9th/11th/13th table (§ above): real
    // sounded seventh/extension chords, NOT triad reductions. Order: the 7th
    // FOUNDATION first (min7/maj7/dom7), then the harmonized-key lap, then color
    // extensions. Honesty rules from the panel: the diatonic lap ships
    // chordOverride:'auto' (never a stray dom7 — modal-audit rule); the dominant
    // extension is labelled dom9, never "11". Specs: agent-memory/{harmony-theory,
    // learning-design,guitar-pedagogy}-* / project_chord_concept_ladder.
    // ── Guitar Core ★ nodes (Development Pathways — guitar Core spec) ────────
    // New rungs over EXISTING generators (build-queue #1). Each names its
    // transferable skill (north star). Comping nodes (B5/I6/I7) await
    // buildCompingExercise; the master/improv rung (A8) awaits its engine.
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
    // ── Metal LEAD over the band (band-intel application rungs, panel 2026-06-13) ──
    // The Metal pack's missing APPLICATION layer: the band is all riff-drills with
    // no "solo over the band." These put the player in a pure LEAD role over a real
    // distorted rhythm section (double-tracked DI-through-Metal-amp power-chord comp
    // + a root-pump bass + drums) — the live trigger for the distorted-comp realism.
    // The LEAD stays clean DI in STANDARD tuning, high in the singing register
    // (fret 11–15 box) — DECOUPLED from the heavy backing (guitar-pedagogy ruling:
    // the "lead must use the low open string" rule is for ONE player covering both
    // roles; here the backing is audio and the hands are free). Comp = power 5ths.
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
