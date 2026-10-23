// SPDX-License-Identifier: AGPL-3.0-only

/** @type {Record<string, import('../core/session-types.js').SegmentTemplate>} */
export const SEGMENT_TEMPLATES = {
  g_warm_chromatic: {
    role:'warmup', label:'Chromatic 1-2-3-4', competency:'finger independence',
    band:'beginner', instrument:'guitar', style:null, kind:'chromatic',
    base:{ chromaticPattern:'1234', meter:'4/4', subdivision:'sixteenth', bars:8, direction:'up_down', fretboardSystem:'position' },
    vary:[ { chromaticPattern:'1234', fretMin:1, fretMax:4 }, { chromaticPattern:'4321', fretMin:1, fretMax:4 }, { chromaticPattern:'1324', fretMin:1, fretMax:4 }, { chromaticPattern:'1234', fretMin:5, fretMax:8 } ],
  },
  g_tech_pentatonic_box: {
    role:'technique', label:'Minor pentatonic box', competency:'pentatonic box 1',
    band:'beginner', instrument:'guitar', style:null, kind:'scale',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' } ],
  },
  g_blues_scale: {
    role:'scale_arp', label:'Blues scale', competency:'blues vocabulary',
    band:'beginner', instrument:'guitar', style:'blues', kind:'scale',
    base:{ scale:'blues', meter:'4/4', subdivision:'eighth', bars:12, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' } ],
  },
  g_arp_diatonic_7th: {
    role:'scale_arp', label:'Diatonic 7th arpeggios', competency:'seventh-chord vocabulary',
    band:'intermediate', instrument:'guitar', style:null, kind:'diatonic_arpeggios',
    base:{ scale:'natural_minor', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'G' }, { key:'C', shape:'A' } ],
  },
  g_app_ii_v_i: {
    role:'application', label:'ii–V–I over the changes', competency:'play the changes',
    band:'intermediate', instrument:'guitar', style:'jazz', kind:'chord_scales',
    base:{ scale:'major', chordScaleStrategy:'mode_of_moment', chordDepth:'seventh', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged', fretMin:0, fretMax:7 },
    vary:[ { key:'C' }, { key:'F' }, { key:'Bb' }, { key:'G' }, { key:'D' } ],
  },
  g_metal_phrygian: {
    role:'technique', label:'Phrygian-dominant run', competency:'exotic-scale shred',
    band:'advanced', instrument:'guitar', style:'metal', kind:'scale',
    base:{ scale:'phrygian_dominant', meter:'4/4', subdivision:'sixteenth', bars:8, direction:'up_down', sequence:'fours', fretboardSystem:'caged' },
    vary:[ { key:'E', shape:'E' }, { key:'A', shape:'E' }, { key:'D', shape:'E' }, { key:'B', shape:'E' } ],
  },
  // Application: solo over a real chugging metal band (the distorted-comp realism
  // trigger as a timed Workout block — band-intel, panel 2026-06-13). vary holds
  // duration constant (length-locked): key/scale only.
  g_metal_lead: {
    role:'application', label:'Lead over a metal band', competency:'metal lead phrasing over changes',
    band:'advanced', instrument:'guitar', style:'metal', kind:'scale',
    base:{ scale:'natural_minor', progression:'metal_i_bVI_bVII', chordOverride:'5', backingComp:'metal_chug_8', backingBass:'root_pump', audioProfile:'metal', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'position', fretMin:11, fretMax:15 },
    vary:[ { key:'E' }, { key:'A' }, { scale:'harmonic_minor', key:'E' }, { key:'D' } ],
  },

  // ── Phase 5 guitar library — derived from already-vetted PATHWAYS bases (so the
  // content is genre-validated) + role-tagged. vary[] holds duration CONSTANT
  // (no meter/bpm/bars changes) per the length-locked invariant. ───────────────
  // Technique role
  g_tech_pulse_mute: {
    role:'technique', label:'Pulse & muting', competency:'click-lock + palm mute',
    band:'beginner', instrument:'guitar', style:null, kind:'pedal_riff',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', progression:'static_i', chordOverride:'5', harmonize:false, swing:'straight', fretMin:0, fretMax:5 },
    vary:[ { key:'E' }, { key:'A' }, { key:'G' }, { key:'D' } ],
  },
  g_tech_power_chords: {
    role:'technique', label:'Power-chord comping', competency:'clean power-chord changes',
    band:'beginner', instrument:'guitar', style:null, kind:'pedal_riff',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', chordOverride:'5', harmonize:false, swing:'straight', fretMin:0, fretMax:7 },
    vary:[ { key:'E', progression:'i-VII-VI-VII' }, { key:'A', progression:'i-VI-III-VII' }, { key:'E', progression:'i-VII-VI-VII' }, { key:'D', progression:'i-VI-III-VII' } ],
  },
  g_tech_bending: {
    role:'technique', label:'Bending drill', competency:'bend intonation',
    band:'beginner', instrument:'guitar', style:null, kind:'bending',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'quarter', bars:8, direction:'up_down', fretboardSystem:'caged', bendTarget:'whole' },
    vary:[ { key:'A', shape:'E', bendTarget:'whole' }, { key:'A', shape:'E', bendTarget:'half' }, { key:'E', shape:'E', bendTarget:'whole' }, { key:'D', shape:'E', bendTarget:'mixed' } ],
  },
  g_tech_sweep: {
    role:'technique', label:'Sweep arpeggio primer', competency:'clean sweep picking',
    band:'advanced', instrument:'guitar', style:null, kind:'sweep_arpeggios',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'sixteenth', bars:8, direction:'up_down', fretboardSystem:'caged', chordDepth:'triad', chordOverride:'auto', progression:'i-VI-III-VII' },
    vary:[ { key:'A', shape:'E' }, { key:'A', shape:'A' }, { key:'D', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'G' } ],
  },
  g_tech_legato: {
    role:'technique', label:'Legato runs', competency:'hammer/pull fluency',
    band:'intermediate', instrument:'guitar', style:null, kind:'legato',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' } ],
  },
  g_tech_16th_pocket: {
    role:'technique', label:'Sixteenth-note pocket', competency:'16th subdivision + feel',
    band:'intermediate', instrument:'guitar', style:null, kind:'scale',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'sixteenth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged', progression:'i-VII-VI-VII', chordDepth:'seventh', chordOverride:'min7', swing:'straight' },
    vary:[ { key:'A', shape:'E', swing:'straight' }, { key:'A', shape:'E', swing:'swing' }, { key:'E', shape:'E' }, { key:'G', shape:'E' } ],
  },
  // Scale / Arp role
  g_scale_major_caged: {
    role:'scale_arp', label:'Major scale — CAGED', competency:'connect the 5 shapes',
    band:'beginner', instrument:'guitar', style:null, kind:'scale',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged', progression:'I-IV-V', chordDepth:'triad', chordOverride:'auto' },
    vary:[ { key:'C', shape:'E' }, { key:'C', shape:'A' }, { key:'C', shape:'G' }, { key:'C', shape:'C' }, { key:'C', shape:'D' } ],
  },
  g_scale_dorian: {
    role:'scale_arp', label:'Dorian groove', competency:'the raised-6th colour',
    band:'intermediate', instrument:'guitar', style:null, kind:'scale',
    base:{ scale:'dorian', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged', progression:'i-VII-VI-VII', chordDepth:'seventh', chordOverride:'min7' },
    vary:[ { key:'A', shape:'E' }, { key:'D', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' } ],
  },
  g_scale_country_pent: {
    role:'scale_arp', label:'Major pentatonic — country', competency:'major-pentatonic over changes',
    band:'beginner', instrument:'guitar', style:'country', kind:'scale',
    base:{ scale:'major_pentatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'G', shape:'G' }, { key:'A', shape:'E' }, { key:'D', shape:'E' }, { key:'E', shape:'E' }, { key:'C', shape:'E' } ],
  },
  g_arp_triads: {
    role:'scale_arp', label:'Diatonic triads', competency:'triad arpeggio vocabulary',
    band:'beginner', instrument:'guitar', style:null, kind:'diatonic_arpeggios',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged', chordDepth:'triad', chordOverride:'auto' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'G' }, { key:'C', shape:'A' } ],
  },
  g_scale_full_neck: {
    role:'scale_arp', label:'Whole-neck freedom', competency:'connect the whole neck',
    band:'intermediate', instrument:'guitar', style:null, kind:'scale',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'full_neck', progression:'I-V-vi-IV', chordDepth:'triad', chordOverride:'auto' },
    vary:[ { key:'C' }, { key:'G' }, { key:'A' }, { key:'E' }, { key:'D' } ],
  },
  g_scale_melmin: {
    role:'scale_arp', label:'Melodic minor & exotic', competency:'melodic-minor + symmetric colours',
    band:'advanced', instrument:'guitar', style:null, kind:'modal_vamp',
    base:{ scale:'melodic_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged', progression:'static_i', chordDepth:'seventh', chordOverride:'auto' },
    vary:[ { scale:'melodic_minor', key:'A', shape:'E' }, { scale:'lydian_dominant', key:'C', shape:'E' }, { scale:'altered', key:'E', shape:'E' }, { scale:'locrian_sharp2', key:'B', shape:'E' }, { scale:'lydian_augmented', key:'G', shape:'E' } ],
  },
  // Application role (over the changes)
  g_app_chord_tone: {
    role:'application', label:'Chord-tone targeting', competency:'chord tones inside the scale',
    band:'intermediate', instrument:'guitar', style:null, kind:'chord_scales',
    base:{ scale:'major', chordScaleStrategy:'chord_tone_emphasis', chordDepth:'seventh', chordOverride:'auto', meter:'4/4', subdivision:'eighth', bars:8, direction:'ascending', sequence:'fours', fretboardSystem:'caged', fretMin:0, fretMax:7 },
    vary:[ { key:'C', progression:'diatonic' }, { key:'C', progression:'I-IV-V' }, { key:'G', progression:'I-V-vi-IV' }, { key:'D', progression:'I-vi-IV-V' }, { key:'A', progression:'vi-IV-I-V' } ],
  },
  g_app_modal: {
    role:'application', label:'Modal awareness', competency:'a mode per chord',
    band:'intermediate', instrument:'guitar', style:null, kind:'chord_scales',
    base:{ scale:'major', chordScaleStrategy:'mode_of_moment', chordDepth:'seventh', chordOverride:'dom7', progression:'diatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged', fretMin:0, fretMax:7 },
    vary:[ { key:'C' }, { key:'G' }, { key:'D' }, { key:'A' }, { key:'F' } ],
  },
  g_app_guide_tones: {
    role:'application', label:'Guide tones', competency:'voice-lead 3rds & 7ths',
    band:'intermediate', instrument:'guitar', style:'jazz', kind:'guide_tones',
    base:{ scale:'major', chordDepth:'seventh', voices:'both_alternating', meter:'4/4', subdivision:'quarter', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged', shape:'E' },
    vary:[ { key:'C', voices:'thirds_only' }, { key:'C', voices:'sevenths_only' }, { key:'C', voices:'both_alternating' }, { key:'F', voices:'both_alternating' }, { key:'Bb', voices:'both_alternating' } ],
  },
  g_app_blues_shuffle: {
    role:'application', label:'Blues shuffle', competency:'phrasing over a 12-bar',
    band:'intermediate', instrument:'guitar', style:'blues', kind:'scale',
    base:{ scale:'blues', meter:'4/4', subdivision:'eighth', bars:12, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'C', shape:'E' }, { key:'D', shape:'E' } ],
  },
  g_app_harmonic_minor: {
    role:'application', label:'Harmonic-minor exotic', competency:'the raised-7th over changes',
    band:'advanced', instrument:'guitar', style:null, kind:'chord_scales',
    base:{ scale:'harmonic_minor', chordScaleStrategy:'mode_of_moment', chordDepth:'seventh', chordOverride:'dom7', progression:'i-VI-III-VII', meter:'4/4', subdivision:'sixteenth', bars:8, direction:'up_down', sequence:'fours', fretboardSystem:'caged' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'D', shape:'E' }, { key:'B', shape:'E' } ],
  },
  // Metal pack (technique-heavy)
  g_metal_metalcore: {
    role:'technique', label:'Metalcore pedal chug', competency:'palm-mute pedal + semitone power chords',
    band:'intermediate', instrument:'guitar', style:'metal', kind:'pedal_riff',
    base:{ scale:'phrygian', harmonize:false, meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', progression:'metal_pedal_chromatic', chordOverride:'5', fretMin:0, fretMax:7 },
    vary:[ { progression:'metal_pedal_chromatic' }, { progression:'metal_i_bVI_bVII' }, { progression:'metal_pedal_chromatic', scale:'natural_minor' }, { progression:'metal_i_bVI_bVII', subdivision:'gallop' } ],
  },
  g_metal_gallop: {
    role:'technique', label:'Melodic metal gallop', competency:'the galloping picking hand',
    band:'advanced', instrument:'guitar', style:'metal', kind:'pedal_riff',
    base:{ scale:'harmonic_minor', harmonize:false, meter:'4/4', subdivision:'gallop', bars:8, direction:'up_down', fretboardSystem:'position', progression:'metal_i_bVI_bVII', chordOverride:'5', fretMin:0, fretMax:9 },
    vary:[ { subdivision:'gallop' }, { subdivision:'reverse_gallop' }, { scale:'natural_minor', subdivision:'gallop' }, { progression:'metal_i_bVII_bVI_V', subdivision:'gallop' } ],
  },
  g_metal_twin_leads: {
    role:'scale_arp', label:'Melodic-death twin leads', competency:'harmonized thirds',
    band:'advanced', instrument:'guitar', style:'metal', kind:'scale_thirds',
    base:{ scale:'natural_minor', harmonize:true, tremolo:true, meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged', shape:'E' },
    vary:[ { key:'E', scale:'natural_minor' }, { key:'D', scale:'natural_minor' }, { key:'D', scale:'harmonic_minor' }, { key:'A', scale:'natural_minor' } ],
  },
  g_metal_djent: {
    role:'technique', label:'Djent polymeter chug', competency:'3+3+2 against the count',
    band:'advanced', instrument:'guitar', style:'djent', kind:'pedal_riff',
    base:{ scale:'phrygian', harmonize:false, meter:'8/8:3+3+2', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', progression:'metal_pedal_chromatic', chordOverride:'5oct', fretMin:0, fretMax:7 },
    vary:[ { scale:'phrygian' }, { scale:'natural_minor' }, { progression:'metal_pedal_chromatic' }, { scale:'phrygian', progression:'metal_pedal_chromatic' } ],
  },
  g_metal_death: {
    role:'technique', label:'Death-metal chromatic riffs', competency:'tritone/atonal riffing',
    band:'advanced', instrument:'guitar', style:null, kind:'pedal_riff',
    base:{ scale:'locrian', harmonize:false, tremolo:true, meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', progression:'metal_death_tritone', chordOverride:'5', fretMin:0, fretMax:9 },
    vary:[ { scale:'locrian', progression:'metal_death_tritone' }, { scale:'diminished', progression:'metal_death_tritone' }, { scale:'phrygian', progression:'metal_pedal_chromatic', subdivision:'gallop' }, { scale:'double_harmonic', progression:'metal_death_tritone' } ],
  },
  // Jam role (play along over a backing — the application summit)
  g_jam_modal: {
    role:'jam', label:'Modal vamp jam', competency:'phrase over one tonality',
    band:'intermediate', instrument:'guitar', style:null, kind:'modal_vamp',
    base:{ scale:'dorian', meter:'4/4', subdivision:'eighth', bars:16, direction:'up_down', sequence:'none', fretboardSystem:'caged', progression:'static_i', shape:'E' },
    vary:[ { scale:'dorian', key:'A' }, { scale:'mixolydian', key:'G' }, { scale:'lydian', key:'C' }, { scale:'phrygian', key:'E' }, { scale:'altered', key:'A' } ],
  },
  g_jam_blues: {
    role:'jam', label:'Blues jam', competency:'improvise over a 12-bar',
    band:'beginner', instrument:'guitar', style:'blues', kind:'scale',
    base:{ scale:'blues', meter:'4/4', subdivision:'eighth', bars:12, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'D', shape:'E' }, { key:'C', shape:'E' } ],
  },
  g_jam_rock: {
    role:'jam', label:'Rock jam', competency:'pentatonic over a rock vamp',
    band:'beginner', instrument:'guitar', style:'rock', kind:'scale',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'E', shape:'E' }, { key:'A', shape:'E' }, { key:'D', shape:'E' }, { key:'G', shape:'E' } ],
  },
  // Cool-down role (gentle, low tempo)
  g_cool_scale: {
    role:'cooldown', label:'Cool-down scale', competency:'relaxed clean tone',
    band:'beginner', instrument:'guitar', style:null, kind:'scale',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'C', shape:'C' }, { key:'G', shape:'E' }, { key:'A', shape:'E' }, { key:'D', shape:'E' } ],
  },
  g_cool_arpeggio: {
    role:'cooldown', label:'Cool-down arpeggios', competency:'relaxed triad arps',
    band:'beginner', instrument:'guitar', style:null, kind:'diatonic_arpeggios',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged', chordDepth:'triad', chordOverride:'auto' },
    vary:[ { key:'C', shape:'C' }, { key:'G', shape:'G' }, { key:'A', shape:'A' }, { key:'D', shape:'E' } ],
  },
  // Comping (strum_comp) — v1 voices triads + power chords; the STRUM_GRIPS dom9/sus
  // upgrade for funk/pop is the remaining carried-over Phase-3 piece.
  g_comp_folk: {
    role:'technique', label:'Folk strumming', competency:'open-chord changes + strum hand',
    band:'beginner', instrument:'guitar', style:null, kind:'strum_comp',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged', chordDepth:'triad', chordOverride:'auto', strumPattern:'folk_pop_ddu_udu', voicingPosition:'open' },
    vary:[ { key:'G', progression:'I-V-vi-IV' }, { key:'C', progression:'I-vi-IV-V' }, { key:'D', progression:'I-IV-V' }, { key:'A', progression:'vi-IV-I-V' } ],
  },
  g_comp_pop: {
    role:'technique', label:'Pop comping', competency:'pop changes + groove',
    band:'beginner', instrument:'guitar', style:'pop', kind:'strum_comp',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged', chordDepth:'triad', strumPattern:'folk_pop_ddu_udu', voicingPosition:'open' },
    vary:[ { key:'C', progression:'I-V-vi-IV' }, { key:'G', progression:'vi-IV-I-V' }, { key:'D', progression:'I-vi-IV-V' }, { key:'A', progression:'I-V-vi-IV' } ],
  },
  g_comp_funk: {
    role:'technique', label:'Funk scratch comping', competency:'16th-note rhythm-hand pocket',
    band:'intermediate', instrument:'guitar', style:'funk', kind:'strum_comp',
    base:{ scale:'dorian', meter:'4/4', subdivision:'sixteenth', bars:8, direction:'up_down', fretboardSystem:'caged', chordDepth:'seventh', strumPattern:'sixteenth_funk_scratch', voicingPosition:'movable', shape:'E' },
    vary:[ { key:'A', progression:'i-VII-VI-VII' }, { key:'E', progression:'static_i' }, { key:'D', progression:'i-VII-VI-VII' }, { key:'G', progression:'static_i' } ],
  },
  g_comp_rock: {
    role:'technique', label:'Rock power-chord strum', competency:'driving 8th power chords',
    band:'beginner', instrument:'guitar', style:'rock', kind:'strum_comp',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged', chordOverride:'5', strumPattern:'eighth_down', voicingPosition:'movable', shape:'E' },
    vary:[ { key:'E', progression:'i-VII-VI-VII' }, { key:'A', progression:'I-IV-V' }, { key:'D', progression:'I-V-vi-IV' }, { key:'G', progression:'i-VII-VI-VII' } ],
  },
  // Review role (resurface an earlier skill)
  g_review_pentatonic: {
    role:'review', label:'Pentatonic review', competency:'recall the box',
    band:'beginner', instrument:'guitar', style:null, kind:'scale',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'A', shape:'E' }, { key:'E', shape:'E' }, { key:'G', shape:'E' }, { key:'D', shape:'E' } ],
  },
  g_review_triads: {
    role:'review', label:'Triad review', competency:'recall diatonic triads',
    band:'beginner', instrument:'guitar', style:null, kind:'diatonic_arpeggios',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'caged', chordDepth:'triad', chordOverride:'auto' },
    vary:[ { key:'C', shape:'C' }, { key:'G', shape:'G' }, { key:'A', shape:'A' }, { key:'E', shape:'E' } ],
  },
  // Warm-up variety
  g_warm_scale: {
    role:'warmup', label:'Scale warm-up', competency:'gentle position warm-up',
    band:'beginner', instrument:'guitar', style:null, kind:'scale',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'caged' },
    vary:[ { key:'C', shape:'E' }, { key:'G', shape:'E' }, { key:'A', shape:'E' }, { key:'E', shape:'E' } ],
  },

  // ═══ Phase 6 — BASS segment-template library ═══════════════════════════════
  // Bass is GROOVE + RIGHT-HAND first (the arc inverts the guitar shred instinct:
  // right_hand → root_fifth_octave → octave_groove → dead_note → scales/arps →
  // walking/guide_tones → slap). Movable `position` box (NO CAGED/shape). The 5
  // groove primitives are bass-native (offerable()). vary[] holds duration constant
  // (key / fretMin-Max / progression-in-band — never meter/bpm/bars). FEEL of the
  // groove templates (octave/dead-note/slap) → funk/R&B + Motown/soul idiom agents
  // validate at this stage per the bass-pedagogy consult.
  // Warm-up
  b_warm_chromatic: {
    role:'warmup', label:'Chromatic warm-up', competency:'finger independence',
    band:'beginner', instrument:'bass', style:null, kind:'chromatic',
    base:{ chromaticPattern:'1234', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', fretMin:1, fretMax:4 },
    vary:[ { chromaticPattern:'1234', fretMin:1, fretMax:4 }, { chromaticPattern:'4321', fretMin:1, fretMax:4 }, { chromaticPattern:'1234', fretMin:5, fretMax:8 }, { chromaticPattern:'1324', fretMin:1, fretMax:4 } ],
  },
  b_warm_scale: {
    role:'warmup', label:'Scale warm-up', competency:'gentle position box',
    band:'beginner', instrument:'bass', style:null, kind:'scale',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'position', fretMin:0, fretMax:5 },
    vary:[ { key:'C' }, { key:'G' }, { key:'A' }, { key:'E' } ],
  },
  // Technique (groove + right-hand first)
  b_tech_right_hand: {
    role:'technique', label:'Right-hand technique', competency:'alternating i-m stamina',
    band:'beginner', instrument:'bass', style:null, kind:'right_hand_technique',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', progression:'static_i', fretMin:0, fretMax:5 },
    vary:[ { key:'E' }, { key:'A' }, { key:'G', subdivision:'sixteenth' }, { key:'C' } ],
  },
  b_tech_root_fifth_octave: {
    role:'technique', label:'Root–5th–octave box', competency:'the foundational bass box',
    band:'beginner', instrument:'bass', style:null, kind:'root_fifth_octave',
    base:{ scale:'major', meter:'4/4', subdivision:'quarter', bars:8, direction:'up_down', fretboardSystem:'position', progression:'I-IV-V', fretMin:0, fretMax:7 },
    vary:[ { key:'C', progression:'I-IV-V' }, { key:'G', progression:'I-V-vi-IV' }, { key:'A', progression:'i-VII-VI-VII' }, { key:'E', progression:'I-IV-V' } ],
  },
  b_tech_octave_groove: {
    role:'technique', label:'Octave groove', competency:'disco/Motown octave bounce',
    band:'intermediate', instrument:'bass', style:null, kind:'octave_groove',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', progression:'I-V-vi-IV', fretMin:0, fretMax:7 },
    vary:[ { key:'C', progression:'I-V-vi-IV' }, { key:'A', progression:'i-VII-VI-VII' }, { key:'G', progression:'I-IV-V' }, { key:'D', progression:'vi-IV-I-V' } ],
  },
  b_tech_dead_note: {
    role:'technique', label:'Dead-note pocket', competency:'16th pocket + muting',
    band:'intermediate', instrument:'bass', style:'funk', kind:'dead_note_groove',
    base:{ scale:'dorian', meter:'4/4', subdivision:'sixteenth', bars:8, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:7 },
    vary:[ { key:'A', progression:'i-VII-VI-VII' }, { key:'E', progression:'static_i' }, { key:'D', progression:'i-VII-VI-VII' }, { key:'G', progression:'static_i' } ],
  },
  b_tech_slap: {
    role:'technique', label:'Slap & pop', competency:'slapped octave + ghosts',
    band:'advanced', instrument:'bass', style:'funk', kind:'slap_pop',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:7 },
    vary:[ { key:'E', progression:'static_i' }, { key:'A', progression:'i-VII-VI-VII' }, { key:'G', progression:'static_i' }, { key:'D', progression:'i-VII-VI-VII' } ],
  },
  b_tech_legato: {
    role:'technique', label:'Legato (HO/PO)', competency:'hammer/pull on bass',
    band:'intermediate', instrument:'bass', style:null, kind:'legato',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:5 },
    vary:[ { key:'A' }, { key:'E' }, { key:'G' }, { key:'D' } ],
  },
  b_tech_position_shift: {
    role:'technique', label:'Position shifts', competency:'move cleanly up the neck',
    band:'intermediate', instrument:'bass', style:null, kind:'position_shift',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:7 },
    vary:[ { key:'A' }, { key:'E' }, { key:'G' }, { key:'C' } ],
  },
  // Scale / Arp (the position box)
  b_scale_major: {
    role:'scale_arp', label:'Major scale box', competency:'the movable major box',
    band:'beginner', instrument:'bass', style:null, kind:'scale',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'position', fretMin:0, fretMax:5 },
    vary:[ { key:'C', fretMin:0, fretMax:5 }, { key:'G', fretMin:2, fretMax:7 }, { key:'A', fretMin:4, fretMax:9 }, { key:'E', fretMin:0, fretMax:5 } ],
  },
  b_scale_minor: {
    role:'scale_arp', label:'Minor scale box', competency:'natural-minor box',
    band:'beginner', instrument:'bass', style:null, kind:'scale',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'position', fretMin:0, fretMax:5 },
    vary:[ { key:'A' }, { key:'E' }, { key:'D' }, { key:'G', fretMin:2, fretMax:7 } ],
  },
  b_scale_pentatonic: {
    role:'scale_arp', label:'Pentatonic box', competency:'minor-pentatonic box',
    band:'beginner', instrument:'bass', style:null, kind:'scale',
    base:{ scale:'minor_pentatonic', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'position', fretMin:0, fretMax:5 },
    vary:[ { key:'A' }, { key:'E' }, { key:'G' }, { key:'D' } ],
  },
  b_arp_triads: {
    role:'scale_arp', label:'Triad arpeggios', competency:'chord-tone targeting', creditsPathway:'bass_arp_triads',
    band:'beginner', instrument:'bass', style:null, kind:'diatonic_arpeggios',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', chordDepth:'triad', chordOverride:'auto', fretMin:0, fretMax:7 },
    vary:[ { key:'C' }, { key:'G' }, { key:'A' }, { key:'E' } ],
  },
  b_arp_sevenths: {
    role:'scale_arp', label:'Seventh arpeggios', competency:'7th chord tones', creditsPathway:'bass_arp_sevenths',
    band:'intermediate', instrument:'bass', style:null, kind:'diatonic_arpeggios',
    base:{ scale:'natural_minor', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', chordDepth:'seventh', chordOverride:'auto', fretMin:0, fretMax:7 },
    vary:[ { key:'A' }, { key:'E' }, { key:'D' }, { key:'C' } ],
  },
  // Application (over the changes)
  b_app_walking: {
    role:'application', label:'Walking bass — ii–V–I', competency:'walk the changes', creditsPathway:'bass_walking',
    band:'intermediate', instrument:'bass', style:'jazz', kind:'walking_bass',
    base:{ scale:'major', meter:'4/4', subdivision:'quarter', bars:8, direction:'up_down', fretboardSystem:'position', chordDepth:'seventh', chordOverride:'auto', fretMin:0, fretMax:7 },
    vary:[ { key:'C', progression:'ii-V-I' }, { key:'F', progression:'ii-V-I' }, { key:'C', progression:'vi-ii-V-I' }, { key:'G', progression:'ii-V-I' } ],
  },
  b_app_walking_blues: {
    role:'application', label:'Walking blues', competency:'walk a 12-bar',
    band:'intermediate', instrument:'bass', style:'blues', kind:'walking_bass',
    base:{ scale:'blues', meter:'4/4', subdivision:'quarter', bars:12, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:7 },
    vary:[ { key:'A' }, { key:'E' }, { key:'G' }, { key:'C' } ],
  },
  b_app_guide_tones: {
    role:'application', label:'Guide tones', competency:'3rds & 7ths on bass',
    band:'intermediate', instrument:'bass', style:'jazz', kind:'guide_tones',
    base:{ scale:'major', chordDepth:'seventh', voices:'both_alternating', meter:'4/4', subdivision:'quarter', bars:8, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:9 },
    vary:[ { key:'C', voices:'both_alternating' }, { key:'F', voices:'thirds_only' }, { key:'G', voices:'sevenths_only' }, { key:'Bb', voices:'both_alternating' } ],
  },
  b_app_root_motion: {
    role:'application', label:'Root motion through changes', competency:'arpeggiate the progression',
    band:'intermediate', instrument:'bass', style:null, kind:'progression_arpeggios',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', chordDepth:'seventh', chordOverride:'auto', progression:'ii-V-I', fretMin:0, fretMax:9 },
    vary:[ { key:'C', progression:'ii-V-I' }, { key:'G', progression:'I-V-vi-IV' }, { key:'A', progression:'i-VII-VI-VII' }, { key:'F', progression:'ii-V-I' } ],
  },
  b_app_octave_disco: {
    role:'application', label:'Disco octave line', competency:'octave bounce over changes',
    band:'intermediate', instrument:'bass', style:'pop', kind:'octave_groove',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:9 },
    vary:[ { key:'C', progression:'I-V-vi-IV' }, { key:'G', progression:'vi-IV-I-V' }, { key:'D', progression:'I-vi-IV-V' }, { key:'A', progression:'I-V-vi-IV' } ],
  },
  // Jam (the player IS the bass)
  b_jam_funk: {
    role:'jam', label:'Funk groove jam', competency:'hold a funk pocket',
    band:'intermediate', instrument:'bass', style:'funk', kind:'dead_note_groove',
    base:{ scale:'dorian', meter:'4/4', subdivision:'sixteenth', bars:8, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:7 },
    vary:[ { key:'A', progression:'static_i' }, { key:'E', progression:'i-VII-VI-VII' }, { key:'D', progression:'static_i' }, { key:'G', progression:'i-VII-VI-VII' } ],
  },
  b_jam_blues: {
    role:'jam', label:'Blues bass jam', competency:'groove a 12-bar',
    band:'beginner', instrument:'bass', style:'blues', kind:'walking_bass',
    base:{ scale:'blues', meter:'4/4', subdivision:'quarter', bars:12, direction:'up_down', fretboardSystem:'position', fretMin:0, fretMax:7 },
    vary:[ { key:'A' }, { key:'E' }, { key:'G' }, { key:'C' } ],
  },
  // Review + cool-down
  b_review_box: {
    role:'review', label:'Root–5th–octave review', competency:'recall the box',
    band:'beginner', instrument:'bass', style:null, kind:'root_fifth_octave',
    base:{ scale:'major', meter:'4/4', subdivision:'quarter', bars:8, direction:'up_down', fretboardSystem:'position', progression:'I-IV-V', fretMin:0, fretMax:7 },
    vary:[ { key:'C' }, { key:'G' }, { key:'A' }, { key:'E' } ],
  },
  b_cool_scale: {
    role:'cooldown', label:'Cool-down scale', competency:'relaxed box',
    band:'beginner', instrument:'bass', style:null, kind:'scale',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', sequence:'none', fretboardSystem:'position', fretMin:0, fretMax:5 },
    vary:[ { key:'C' }, { key:'G' }, { key:'A' }, { key:'E' } ],
  },
  b_cool_arpeggio: {
    role:'cooldown', label:'Cool-down arpeggios', competency:'relaxed triad arps',
    band:'beginner', instrument:'bass', style:null, kind:'diatonic_arpeggios',
    base:{ scale:'major', meter:'4/4', subdivision:'eighth', bars:8, direction:'up_down', fretboardSystem:'position', chordDepth:'triad', chordOverride:'auto', fretMin:0, fretMax:7 },
    vary:[ { key:'C' }, { key:'G' }, { key:'A' }, { key:'E' } ],
  },
};

/** @type {Record<string, {label: string, order: number}>} */
export const SEGMENT_ROLES = {
  warmup:      { label:'Warm-up',     order:0 },
  technique:   { label:'Technique',   order:1 },
  scale_arp:   { label:'Scale / Arp', order:2 },
  application: { label:'Application', order:3 },
  jam:         { label:'Jam',         order:4 },
  review:      { label:'Review',      order:5 },
  cooldown:    { label:'Cool-down',   order:6 },
};

export const SEGMENT_BANDS = ['beginner','intermediate','advanced'];
