/** @type {Record<string, number[]>} */
export const SCALE_INTERVALS = {
  // Diatonic and common scales
  major:[0,2,4,5,7,9,11], natural_minor:[0,2,3,5,7,8,10], harmonic_minor:[0,2,3,5,7,8,11],
  melodic_minor:[0,2,3,5,7,9,11],
  // Pentatonic / blues
  minor_pentatonic:[0,3,5,7,10], major_pentatonic:[0,2,4,7,9], blues:[0,3,5,6,7,10],
  // Bebop scales (chromatic passing tone so chord tones land on strong beats)
  bebop_major:[0,2,4,5,7,8,9,11], bebop_dominant:[0,2,4,5,7,9,10,11],
  // Bebop minor (dorian + chromatic passing tone between b3 and the 4th) — keeps
  // the minor 3rd so it sits correctly over minor/dorian tonalities.
  bebop_dorian:[0,2,3,4,5,7,9,10],
  // Modes of the major scale
  dorian:[0,2,3,5,7,9,10], phrygian:[0,1,3,5,7,8,10], lydian:[0,2,4,6,7,9,11],
  mixolydian:[0,2,4,5,7,9,10], locrian:[0,1,3,5,6,8,10],
  // Other common jazz scales
  phrygian_dominant:[0,1,4,5,7,8,10], lydian_dominant:[0,2,4,6,7,9,10],
  whole_tone:[0,2,4,6,8,10], diminished:[0,2,3,5,6,8,9,11],
  // Modes of melodic minor — for jazz chord-scale applications
  dorian_b2:[0,1,3,5,7,9,10],       // mode II: over m7 with half-step root motion above
  lydian_augmented:[0,2,4,6,8,9,11], // mode III: over maj7#5, floating quality
  mixolydian_b6:[0,2,4,5,7,8,10],   // mode V: over V7 resolving to minor
  locrian_sharp2:[0,2,3,5,6,8,10],  // mode VI: over m7b5 (preferred over plain Locrian)
  altered:[0,1,3,4,6,8,10],         // mode VII: maximum tension over V7alt
  // Symmetric / exotic — fusion, neoclassical, metal (genre-framework §2.2)
  half_whole_dim:[0,1,3,4,6,7,9,10],  // dominant diminished (half-whole) — over dom7, symmetric metal runs
  double_harmonic:[0,1,4,5,7,8,11],   // Byzantine / double harmonic major — neoclassical / exotic death metal
  hungarian_minor:[0,2,3,6,7,8,11],   // harmonic minor ♯4 — neoclassical / melodic metal
  neapolitan_minor:[0,1,3,5,7,8,11],  // dark classical-metal colour
};
