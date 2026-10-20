// Chord qualities defined as semitone intervals from the root. This is a
// pitch-primary definition: a chord is a stack of intervals, instrument-agnostic
// by design (see ROADMAP Phase 6 — piano). Extensions go ABOVE the octave
// (9th = 14, 11th = 17, 13th = 21) so the stack is the complete set of chord
// tones. ACTUAL VOICING (which notes to play, octave placement, drop-2, omitting
// the 3rd under an 11th, etc.) is a render-time concern, NOT encoded here — the
// guitar position-pickers reduce these to pitch classes (% 12); a future piano
// voicing engine can read the full stack. `add9` already proved intervals > 12
// work end-to-end.
/** @type {Record<string, {symbol: string, intervals: number[], mode?: string}>} */
export const CHORD_FORMULAS = {
  // Triads
  maj:{symbol:'maj', intervals:[0,4,7]}, min:{symbol:'min', intervals:[0,3,7]}, dim:{symbol:'dim', intervals:[0,3,6]}, aug:{symbol:'aug', intervals:[0,4,8]},
  // Power chords — third-less; the harmonic atom of rock/metal/punk/djent.
  // `5` = root+5th; `5oct` = root+5th+octave (the "spread across 3 strings" voicing).
  '5':{symbol:'5', intervals:[0,7]}, '5oct':{symbol:'5', intervals:[0,7,12]},
  // Suspended
  sus2:{symbol:'sus2', intervals:[0,2,7]}, sus4:{symbol:'sus4', intervals:[0,5,7]},
  // Sixths / add
  '6':{symbol:'6', intervals:[0,4,7,9]}, min6:{symbol:'m6', intervals:[0,3,7,9]},
  add9:{symbol:'add9', intervals:[0,4,7,14]}, '69':{symbol:'6/9', intervals:[0,4,7,9,14]},
  // Sevenths
  maj7:{symbol:'maj7', intervals:[0,4,7,11]}, min7:{symbol:'min7', intervals:[0,3,7,10]}, dom7:{symbol:'7', intervals:[0,4,7,10]},
  min7b5:{symbol:'m7b5', intervals:[0,3,6,10]}, dim7:{symbol:'dim7', intervals:[0,3,6,9]}, min_maj7:{symbol:'m(maj7)', intervals:[0,3,7,11]},
  // Ninths
  maj9:{symbol:'maj9', intervals:[0,4,7,11,14]}, min9:{symbol:'m9', intervals:[0,3,7,10,14]}, dom9:{symbol:'9', intervals:[0,4,7,10,14]},
  // Elevenths — 11th chords commonly OMIT the 3rd in real voicings (the 3rd↔11th
  // ♭9 clash); the full stack is kept here for completeness, voicing decides.
  maj11:{symbol:'maj11', intervals:[0,4,7,11,14,17]}, min11:{symbol:'m11', intervals:[0,3,7,10,14,17]}, dom11:{symbol:'11', intervals:[0,4,7,10,14,17]},
  // Thirteenths
  maj13:{symbol:'maj13', intervals:[0,4,7,11,14,21]}, min13:{symbol:'m13', intervals:[0,3,7,10,14,21]}, dom13:{symbol:'13', intervals:[0,4,7,10,14,21]}
};

/** @type {Record<string, {triad: string[], seventh: string[]}>} */
export const DIATONIC_QUALITIES = {
  major:         {triad:['maj','min','min','maj','maj','min','dim'],    seventh:['maj7','min7','min7','maj7','dom7','min7','min7b5']},
  dorian:        {triad:['min','min','maj','maj','min','dim','maj'],    seventh:['min7','min7','maj7','dom7','min7','min7b5','maj7']},
  phrygian:      {triad:['min','maj','maj','min','dim','maj','min'],    seventh:['min7','maj7','dom7','min7','min7b5','maj7','min7']},
  lydian:        {triad:['maj','maj','min','dim','maj','min','min'],    seventh:['maj7','dom7','min7','min7b5','maj7','min7','min7']},
  mixolydian:    {triad:['maj','min','dim','maj','min','min','maj'],    seventh:['dom7','min7','min7b5','maj7','min7','min7','maj7']},
  natural_minor: {triad:['min','dim','maj','min','min','maj','maj'],    seventh:['min7','min7b5','maj7','min7','min7','maj7','dom7']},
  locrian:       {triad:['dim','maj','min','min','maj','maj','min'],    seventh:['min7b5','maj7','min7','min7','maj7','dom7','min7']},
  harmonic_minor:{triad:['min','dim','aug','min','maj','maj','dim'],    seventh:['min7','min7b5','maj7','min7','dom7','maj7','dim7']},
  melodic_minor: {triad:['min','min','aug','maj','maj','dim','dim'],    seventh:['min7','min7','maj7','dom7','dom7','min7b5','min7b5']}
};
