// SPDX-License-Identifier: AGPL-3.0-only

// ── STYLE_PALETTES — one shared style→harmony table (build-queue #2) ──────────
// The single source a Pathway, a Custom config, and a Jam style all draw from:
// a loopable progression set + lead scales + quality defaults + a guide-tone flag
// + the backing feel + the audio profile, per style. It does NOT compose song form
// — it hands a consumer the genre's *grammar* to loop and riff against (north star:
// "teach the grammar, not the sentences"). Everything here is the style DNA already
// encoded in shipped, agent-vetted pathway `base` configs + AUDIO_PROFILES + real
// COMMON_PROGRESSIONS/SCALE_INTERVALS tokens — consolidated, not invented. New genre
// entries (and broadening this beyond the seed set) want genre-idiom + harmony review
// before Jam/pathways consume them (CLAUDE.md agent-workflow). Fields:
//   progressions[]  loopable COMMON_PROGRESSIONS keys (index 0 = default)
//   leadScales[]    SCALE_INTERVALS keys idiomatic for soloing (index 0 = default)
//   chordDepth      'triad'|'seventh'|'ninth'… (power chords come via chordOverride)
//   chordOverride   default chord-quality override ('auto'|'dom7'|'min7'|'5'|'5oct'…)
//   guideTones      is guide-tone voice-leading a *defining* skill of the style
//   feel            { swing, backingStyle } — the backing feel
//   audioProfile    AUDIO_PROFILES key (the sound), or null → clean family inferred
/** @type {Record<string, import('./generation-types.js').StylePalette>} */
export const STYLE_PALETTES = {
  blues:   { label:'Blues',      defaultKey:'A', progressions:['12_bar_blues','quick_change_blues','jazz_blues','blues_turnaround'], leadScales:['blues','minor_pentatonic'], chordDepth:'seventh', chordOverride:'dom7', guideTones:false, feel:{ swing:'shuffle', backingStyle:'boogie' }, audioProfile:'blues' },
  // J-2 (D-J5b) modal-vamp wiring: the dormant bright-modal tokens join the
  // styles whose leadScales already speak the mode (rock/funk ride mixolydian's
  // ♭VII; metal's phrygian i–♭II is its signature semitone move). lydian_vamp
  // stays dormant — no style leads lydian yet. Genre-idiom vetting sweep owed
  // (same batch as the JAM_PROMPTS/JAM_INTENTS copy).
  rock:    { label:'Rock',       defaultKey:'E', progressions:['i-VII-VI-VII','I-V-vi-IV','I-IV-V','mixolydian_rock','mixolydian_vamp'], leadScales:['minor_pentatonic','natural_minor','mixolydian'], chordDepth:'triad', chordOverride:'5', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'rock' },
  metal:   { label:'Metal',      defaultKey:'E', progressions:['metal_i_bVI_bVII','metal_pedal_chromatic','metal_i_bVII_bVI_V','phrygian_vamp'], leadScales:['phrygian','natural_minor','harmonic_minor'], chordDepth:'triad', chordOverride:'5', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'metal' },
  djent:   { label:'Djent',      defaultKey:'E', progressions:['metal_pedal_chromatic'], leadScales:['phrygian','natural_minor'], chordDepth:'triad', chordOverride:'5oct', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'djent' },
  jazz:    { label:'Jazz',       defaultKey:'C', progressions:['ii-V-I','vi-ii-V-I','minor_ii_V_i','rhythm_changes_a','so_what','jazz_blues','tritone_sub_ii_V_I','backdoor_ii_V','tadd_dameron'], leadScales:['major','dorian','mixolydian'], chordDepth:'seventh', chordOverride:'auto', guideTones:true, feel:{ swing:'swing', backingStyle:'pad' }, audioProfile:'jazz' },
  // Funk goes Dorian (modal-M1 ride-along, approved 2026-06-05): dorian_vamp's
  // dom7 IV carries the ♮6 — the James Brown sound — so chordOverride must be
  // 'auto' (a min7 override would silence the vamp's major/dom IV).
  funk:    { label:'Funk / R&B', defaultKey:'A', progressions:['dorian_vamp','static_i','i-VII-VI-VII','mixolydian_vamp'], leadScales:['dorian','minor_pentatonic'], chordDepth:'seventh', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'funk' },
  pop:     { label:'Pop',        defaultKey:'C', progressions:['I-V-vi-IV','vi-IV-I-V','I-vi-IV-V'], leadScales:['major','major_pentatonic'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'pop' },
  country: { label:'Country',    defaultKey:'G', progressions:['I-IV-V','I-IV-I-V','I-II7-V','I-V-vi-IV','mixolydian_rock'], leadScales:['major_pentatonic','major'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'country' },
  gospel:  { label:'Gospel',     defaultKey:'C', progressions:['ii-V-I','I-vi-ii-V'], leadScales:['major','dorian'], chordDepth:'ninth', chordOverride:'auto', guideTones:true, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'gospel' },
  // ── World / genre batch (band-intel, panel 2026-06-13) — each genre vetted by
  // its idiom agent; the band each one declares lives in ARRANGEMENT_RECIPES.
  reggae:   { label:'Reggae',       defaultKey:'A', progressions:['static_i','i-iv','i-VII-VI-VII','I-IV-V','I-V-vi-IV'], leadScales:['minor_pentatonic','natural_minor','dorian'], chordDepth:'seventh', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'reggae' },
  disco:    { label:'Disco',        defaultKey:'A', progressions:['i-VII-VI-VII','dorian_vamp','vi-IV-I-V','static_i'], leadScales:['minor_pentatonic','dorian','natural_minor'], chordDepth:'seventh', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'disco' },
  latin:    { label:'Latin / Bossa', defaultKey:'A', progressions:['ii-V-I','minor_ii_V_i','I-vi-ii-V'], leadScales:['major','dorian','minor_pentatonic'], chordDepth:'seventh', chordOverride:'auto', guideTones:true, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'latin' },
  soul:     { label:'Soul / Motown', defaultKey:'C', progressions:['I-vi-IV-V','soul_turnaround','modal_mixture','ii-V-I','I-IV-V'], leadScales:['major_pentatonic','dorian','minor_pentatonic'], chordDepth:'seventh', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'soul' },
  afrobeat: { label:'Afrobeat',     defaultKey:'A', progressions:['static_i','I-IV','dorian_vamp','mixolydian_vamp','I-IV-V'], leadScales:['dorian','mixolydian','major_pentatonic'], chordDepth:'seventh', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'afrobeat' },
  // ── World / genre Wave 2 (band-intel, panel 2026-06-13) — feel is straight/pad
  // for ALL so the genre's ARRANGEMENT_RECIPE drives (backingStyle:'boogie' or a
  // non-straight swing pre-empt the recipe; the recipe cells carry each feel).
  norteno:     { label:'Norteño',        defaultKey:'G', progressions:['I-IV-V','I-V-vi-IV','I-vi-IV-V','ii-V-I'], leadScales:['major','major_pentatonic','mixolydian'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'norteno' },
  tango:       { label:'Tango',          defaultKey:'A', progressions:['andalusian','i-VII-VI-VII','minor_ii_V_i'], leadScales:['harmonic_minor','natural_minor','phrygian_dominant','minor_pentatonic'], chordDepth:'seventh', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'tango' },
  bluegrass:   { label:'Bluegrass',      defaultKey:'G', progressions:['I-IV-V','I-V-vi-IV','vi-IV-I-V'], leadScales:['major_pentatonic','major','mixolydian','blues'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'bluegrass' },
  'city-pop':  { label:'City Pop',       defaultKey:'F', progressions:['I-vi-ii-V','vi-ii-V-I','ii-V-I','I-V-vi-IV'], leadScales:['major','dorian','major_pentatonic','mixolydian'], chordDepth:'ninth', chordOverride:'auto', guideTones:true, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'city-pop' },
  new_orleans: { label:'New Orleans',    defaultKey:'C', progressions:['12_bar_blues','quick_change_blues','I-IV-V','blues_turnaround'], leadScales:['blues','mixolydian','major_pentatonic','minor_pentatonic'], chordDepth:'seventh', chordOverride:'dom7', guideTones:true, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'new_orleans' },
  // ── World / genre Wave 3a (band-intel, panel 2026-06-13) — the DRUMLESS solo /
  // technique idioms. feel straight/pad so the recipe drives; the fingerstyle/
  // stride accompaniment carries the time (no kit).
  classical:   { label:'Classical',      defaultKey:'C', progressions:['pachelbel','circle_diatonic','I-IV-V','ii-V-I','andalusian'], leadScales:['major','natural_minor','harmonic_minor','dorian'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'classical' },
  flamenco:    { label:'Flamenco',       defaultKey:'E', progressions:['andalusian','phrygian_vamp'], leadScales:['phrygian','phrygian_dominant','harmonic_minor'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'flamenco' },
  folk:        { label:'Folk',           defaultKey:'G', progressions:['I-IV-V','I-V-vi-IV','I-vi-IV-V','vi-IV-I-V','mixolydian_rock'], leadScales:['major','major_pentatonic','mixolydian','dorian'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'folk' },
  gypsy_jazz:  { label:'Gypsy Jazz',     defaultKey:'A', progressions:['minor_ii_V_i','i-VI-III-VII','rhythm_changes_a','andalusian'], leadScales:['harmonic_minor','melodic_minor','dorian','major'], chordDepth:'seventh', chordOverride:'auto', guideTones:true, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'gypsy_jazz' },
  ragtime:     { label:'Ragtime / Stride', defaultKey:'C', progressions:['I-IV-V','circle_diatonic','I-vi-ii-V','ragtime_circle'], leadScales:['major','major_pentatonic','mixolydian','blues'], chordDepth:'seventh', chordOverride:'auto', guideTones:true, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'ragtime' },
  // ── World / genre Wave 3b (band-intel, panel 2026-06-13) — the rock-family bands
  // + meter-driven prog. Mostly reuse the rock cells; the signature is the LEAD
  // technique + TONE (a sound-design lane), not the band structure.
  surf:        { label:'Surf',           defaultKey:'E', progressions:['andalusian','i-VII-VI-VII','phrygian_vamp','i-VI-III-VII','I-IV-V'], leadScales:['harmonic_minor','phrygian_dominant','minor_pentatonic','major'], chordDepth:'triad', chordOverride:'5', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'surf' },
  shoegaze:    { label:'Shoegaze',       defaultKey:'A', progressions:['I-V-vi-IV','vi-IV-I-V','i-VII-VI-VII','static_i'], leadScales:['major','natural_minor','major_pentatonic'], chordDepth:'ninth', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'shoegaze' },
  emo:         { label:'Emo',            defaultKey:'D', progressions:['I-V-vi-IV','vi-IV-I-V','I-vi-IV-V','dorian_vamp'], leadScales:['major','major_pentatonic','lydian','dorian'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'emo' },
  punk:        { label:'Punk',           defaultKey:'E', progressions:['I-IV-V','I-V-vi-IV','i-VII-VI-VII'], leadScales:['major_pentatonic','minor_pentatonic','major','natural_minor'], chordDepth:'triad', chordOverride:'5', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'punk' },
  prog:        { label:'Prog',           defaultKey:'E', progressions:['dorian_vamp','lydian_vamp','mixolydian_vamp','i-VII-VI-VII','so_what','ii-V-I'], leadScales:['dorian','lydian','mixolydian','melodic_minor','major'], chordDepth:'ninth', chordOverride:'auto', guideTones:true, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'prog' },
  // ── Western swing + Synthwave (panel 2026-06-15) — western swing LEADS with the 6th-
  // turnaround so a bare Jam sounds like 6ths (harmony+guitar: seventh+auto comps maj7,
  // the signature 6th lives in the genre tokens + voicing); swing:'shuffle' (0.667 triplet,
  // rhythm-meter). synthwave = minor-key Aeolian loops, straight machine feel.
  western_swing: { label:'Western Swing', defaultKey:'G', progressions:['ws_sixth_turnaround','ws_swing_blues','rhythm_changes_a','I-vi-ii-V'], leadScales:['major_pentatonic','mixolydian','major','blues'], chordDepth:'seventh', chordOverride:'auto', guideTones:true, feel:{ swing:'shuffle', backingStyle:'pad' }, audioProfile:'western_swing' },
  synthwave:     { label:'Synthwave',     defaultKey:'A', progressions:['i-VI-III-VII','i-VII-VI-VII','andalusian','i-v-VI','i-iv'], leadScales:['natural_minor','minor_pentatonic','harmonic_minor'], chordDepth:'triad', chordOverride:'auto', guideTones:false, feel:{ swing:'straight', backingStyle:'pad' }, audioProfile:'synthwave' },
};

// Player-facing names for the progressions the Jam picker exposes (slice J-1,
// D-J5a: the palettes already carry progressions[] plural — name them so the
// picker speaks the player's vocabulary). Fallback = prettified token.
/** @type {Record<string, string>} */
export const JAM_PROG_LABELS = {
  'I-IV':'I–IV vamp', 'I-IV-I-V':'I–IV–I–V train-beat', 'I-II7-V':'I–II7–V secondary dominant',
  '12_bar_blues':'12-Bar Blues', quick_change_blues:'Quick-Change Blues',
  'i-VII-VI-VII':'i–♭VII–♭VI–♭VII', 'I-V-vi-IV':'I–V–vi–IV', 'I-IV-V':'I–IV–V',
  'I-vi-IV-V':'I–vi–IV–V', 'vi-IV-I-V':'vi–IV–I–V', 'I-vi-ii-V':'I–vi–ii–V',
  mixolydian_rock:'Mixolydian rock', metal_i_bVI_bVII:'i–♭VI–♭VII',
  metal_pedal_chromatic:'Chromatic pedal', metal_i_bVII_bVI_V:'i–♭VII–♭VI–V',
  'ii-V-I':'ii–V–I', 'vi-ii-V-I':'vi–ii–V–I', minor_ii_V_i:'Minor ii–V–i',
  rhythm_changes_a:'Rhythm changes (A)', so_what:'Dorian modal vamp',
  dorian_vamp:'Dorian vamp', static_i:'One-chord vamp',
  mixolydian_vamp:'Mixolydian vamp (I–♭VII–IV)', phrygian_vamp:'Phrygian vamp (i–♭II)',
  'i-iv':'i–iv minor vamp', soul_turnaround:'Soul turnaround (I–VI7–ii–V)',
  andalusian:'Andalusian (i–♭VII–♭VI–V)', blues_turnaround:'Blues turnaround',
  jazz_blues:'Jazz blues', tritone_sub_ii_V_I:'Tritone-sub ii–V–I', backdoor_ii_V:'Backdoor ii–V', tadd_dameron:'Tadd Dameron turn',
  modal_mixture:'Borrowed iv (I–IV–iv–V)',
  pachelbel:'Pachelbel (I–V–vi–iii–IV…)', circle_diatonic:'Circle of 5ths', 'i-VI-III-VII':'i–♭VI–♭III–♭VII',
  // Preserve the authored repeated assignment and ordinary property order.
  ragtime_circle:'Ragtime chain (III7–VI7–II7–V7–I)', .../** @type {Record<string, string>} */ ({'I-vi-ii-V':'I–vi–ii–V'}),
  lydian_vamp:'Lydian vamp (I–II)',
  ws_sixth_turnaround:'6th turnaround (I6–VI7–II7–V7)', ws_swing_blues:'Swing blues (ii–V tag)', 'i-v-VI':'i–v–♭VI (dreamwave)',
};

/** @param {string} token */
export function jamProgressionLabel(token) {
  return JAM_PROG_LABELS[token] || String(token || '').replace(/_/g, ' ');
}
