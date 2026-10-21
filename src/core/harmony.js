// SPDX-License-Identifier: AGPL-3.0-only
import { SCALE_INTERVALS } from './scale-intervals.js';
import { CHORD_FORMULAS, DIATONIC_QUALITIES } from './chord-theory.js';
import { NOTE_ALIASES, pcName } from './pitch.js';

// Qualities the CAGED chord-TEMPLATE path can voice (triads + basic 7ths).
// Power chords and 9/11/13 extensions are NOT triad/7th shapes — they skip the
// template and fall back to interval-derived positions (see cagedShapeQualityKey).
export const TEMPLATE_QUALITIES = new Set(['maj','min','dim','aug','sus2','sus4','maj7','min7','dom7','min7b5','dim7','min_maj7','add9','6','min6']);

// Tonic chord identity for genuinely-exotic scales that have NO DIATONIC_QUALITIES
// row. Without this, chordQualityForDegree silently borrows major's row (line ~2126),
// so a static_i drone under e.g. locrian ♮2 (a m7♭5 chord-scale) or the altered scale
// (a dominant) sounds a bare MAJOR triad — a major 3rd ringing against the scale's ♭3.
// Only consulted at the TONIC degree (these are used over one-chord drones); non-tonic
// degrees of these scales still fall through to the major-borrow (no full rows authored).
// Values are existing CHORD_FORMULAS qualities (7th-family = the honest chord-scale tonic).
// Pentatonic/blues are deliberately OMITTED — their major-borrow backing is unchanged.
// Derived from harmony-theory-architect's spec (2026-05-31 Core review), adapted to
// existing qualities; fuller accuracy (7alt / maj7#5) is a logged future enhancement.
/** @type {Record<string, string>} */
export const SCALE_TONIC_QUALITY = {
  lydian_dominant:'dom7', altered:'dom7', mixolydian_b6:'dom7', phrygian_dominant:'dom7',
  bebop_dominant:'dom7', locrian_sharp2:'min7b5', dorian_b2:'min7', bebop_major:'maj7',
  lydian_augmented:'aug', whole_tone:'aug', diminished:'dim7'
};

/** @type {Record<string, import('./generation-types.js').Degree[]>} */
export const COMMON_PROGRESSIONS = {
  diatonic:[1,2,3,4,5,6,7,1],
  diatonic_7ths:[1,2,3,4,5,6,7],   // the harmonized-key lap (Chords ladder): one diatonic 7th per degree, no wrap. With chordDepth:'seventh' + chordOverride:'auto' → Imaj7 ii7 iii7 IVmaj7 V7 vi7 vii7♭5 (modal over dorian/mixo).
  static_i:[1],                 // one-chord vamp — Beginner Core "static vamp" (Pulse & Muting); roots stay on the tonic
  'I-IV':[1,4,1,4],
  'I-IV-V':[1,4,5,1],
  'I-IV-I-V':[1,4,1,5],
  'I-V-vi-IV':[1,5,6,4],
  'I-vi-IV-V':[1,6,4,5],
  'I-vi-ii-V':[1,6,2,5],
  'ii-V-I':[2,5,1,1],
  'vi-ii-V-I':[6,2,5,1],
  'I-iii-IV-V':[1,3,4,5],
  'I-IV-vi-V':[1,4,6,5],
  'I-ii-IV-V':[1,2,4,5],
  'vi-IV-I-V':[6,4,1,5],
  pachelbel:[1,5,6,3,4,1,4,5],
  circle_diatonic:[1,4,7,3,6,2,5,1],
  '12_bar_blues':[1,1,1,1,4,4,1,1,5,4,1,5],
  quick_change_blues:[1,4,1,1,4,4,1,1,5,4,1,5],
  // The turnaround's OWN changes — bars 11-12 of the 12-bar isolated as a
  // loopable I|V cell (a motif cell owns its progression, riff-vocab D2; this
  // is "the turnaround-figure token" the held blues turnaround rung was
  // gated on). Looping it lands each pass's V back onto the next pass's I.
  blues_turnaround:[1,5],
  // Jazz 12-bar blues — the quick-change form with the bar-6 ♯iv°7 passing
  // diminished, the bar-8 VI7 secondary dominant, and a bar 9–10 ii–V turnaround
  // (vs the plain blues' static V–IV). I/IV/V are dominant (override below); the
  // ii is min7; the ♯iv°7 and VI7 carry their own quality via the token.
  jazz_blues:[1, 4, 1, 1, 4, { semis:6, q:'dim7', rn:'♯iv°7' }, 1, { semis:9, q:'dom7', rn:'VI7' }, 2, 5, 1, 5],
  'i-VI-III-VII':[1,6,3,7],
  'i-VII-VI-VII':[1,7,6,7],
  minor_ii_V_i:[2,5,1,1],
  // Rhythm Changes (Gershwin "I Got Rhythm" form) — simplified to degree system.
  // A section: I–VI7–ii–V turnaround × 2 (bars 1–8). VI is a secondary dominant.
  rhythm_changes_a:[1,6,2,5,1,6,2,5],
  // Bridge: chain of secondary dominants resolving III7→VI7→II7→V7→I.
  rhythm_changes_bridge:[3,6,2,5],
  // Chromatic / substitution progressions — authored with the {deg|semis,q,rn}
  // token form. `semis` is a chromatic root offset from the key root; `q` sets the
  // quality at that position; `rn` is a display-only Roman label. These need roots
  // no diatonic degree can express (♭II, ♭VII, ♭III, ♭VI). Resolved by
  // chordRootForDegree / chordQualityForDegree, which accept tokens.
  tritone_sub_ii_V_I:[2, { semis:1,  q:'dom7', rn:'♭II7' }, 1, 1],                 // Dm7–D♭7–C : tritone-sub V
  backdoor_ii_V:[{ deg:4, q:'min7' }, { semis:10, q:'dom7', rn:'♭VII7' }, 1, 1],   // Fm7–B♭7–C : backdoor dominant
  tadd_dameron:[1, { semis:3, q:'dom7', rn:'♭III7' }, { semis:8, q:'maj7', rn:'♭VImaj7' }, { semis:1, q:'dom7', rn:'♭II7' }], // C–E♭7–A♭maj7–D♭7
  // Metal / heavy-genre power-chord roots (genre-framework §3). Spelled against
  // natural-minor degrees; the pedal-riff / power-chord generators take the roots
  // and voice the 5ths. Chromatic moves use {semis} (♭II, tritone) — the
  // non-functional semitone motion that defines the heavy styles.
  // ♭VI/♭VII spelled as semis tokens (not bare degrees 6/7) so harmonic-minor's
  // raised 7th can't turn ♭VII into the leading tone (A–F–G♯ instead of A–F–G).
  'metal_i_bVI_bVII':[1, { semis:8, rn:'♭VI' }, { semis:10, rn:'♭VII' }],            // i–♭VI–♭VII : melodic/heavy metal
  'metal_i_bVII_bVI_V':[1, { semis:10, rn:'♭VII' }, { semis:8, rn:'♭VI' }, 5],       // i–♭VII–♭VI–V : neoclassical minor descent (V stays diatonic)
  'metal_pedal_chromatic':[1, { semis:1, rn:'♭II' }, 1, { semis:10, rn:'♭VII' }],    // i–♭II–i–♭VII over a pedal : metalcore/melodeath
  'metal_death_tritone':[1, { semis:1, rn:'♭II' }, 1, { semis:6, rn:'♭v' }],         // i–♭II–i–tritone : death-metal chromatic
  // Bright-modal vamps (M1, 2026-06-02) — the "major-side" modal family the dark/metal
  // set above lacked. Spelled with BARE degrees so the paired modal chord-scale supplies
  // the characteristic quality via DIATONIC_QUALITIES (Dorian's major/dom7 IV, Mixolydian's
  // major ♭VII, Lydian's major II) — pair each with its mode scale. Ship with
  // chordOverride:'auto' (NEVER 'dom7' — a stray dom7 override mis-colours the whole vamp).
  // The Phrygian ♭II is a {semis:1,q:'maj'} token so it stays major in any pairing.
  // Canonical add-list from harmony-theory-architect's modal audit (M1 keystone).
  mixolydian_rock:[1,7,4],                                 // I–♭VII–IV over mixolydian : classic/Southern/country "train" rock
  mixolydian_vamp:[1,7,4,1],                               // I–♭VII–IV–I over mixolydian : the riff-vamp variant
  dorian_vamp:[1,4],                                       // i–IV over dorian : the funk/modal-jazz i7–IV7 groove (the major/dom7 IV carries the ♮6)
  lydian_vamp:[1,2],                                       // I–II over lydian : two major triads a step apart (the ♯4 lives in the II)
  so_what:[1,7],                                           // i–♭VII over dorian : the modal-jazz two-chord vamp (true quartal voicing = the M2 engine task)
  phrygian_vamp:[1, { semis:1, q:'maj', rn:'♭II' }],       // i–♭II over phrygian/phrygian_dominant : the Spanish/flamenco move (q pinned major)
  andalusian:[1,7,6,5],                                    // i–♭VII–♭VI–V over natural_minor : the Andalusian cadence (V→dom7 via override below)
  modal_mixture:[1,4,{ deg:4, q:'min7' },5],               // I–IV–iv–V : borrowed-minor-iv modal mixture (the iv is the colour)
  // ── World / genre vamps (band-intel genre batch, 2026-06-13) ──────────────
  'i-iv':[1,4],                                             // i–iv minor vamp (reggae / minor soul) — pair with natural_minor so the iv stays MINOR (Am→Dm); distinct from dorian_vamp's major IV
  'I-II7-V':[1, { semis:2, q:'dom7', rn:'II7' }, 5, 1],     // I–II7–V : bright secondary-dominant country / western-swing pull
  soul_turnaround:[1, { semis:9, q:'dom7', rn:'VI7' }, 2, 5], // I–VI7–ii–V : the soul/Motown turnaround — the VI is a SECONDARY DOMINANT (the soul colour), not the diatonic vi
  // Ragtime secondary-dominant chain (III7–VI7–II7–V7–I) — every link a dom7 (the
  // bright forward-leaning ragtime motion); same {semis,q:'dom7'} chromatic form as
  // soul_turnaround (harmony-confirmed mechanism). Pair with major; the I lands home.
  ragtime_circle:[{ semis:4, q:'dom7', rn:'III7' }, { semis:9, q:'dom7', rn:'VI7' }, { semis:2, q:'dom7', rn:'II7' }, { semis:7, q:'dom7', rn:'V7' }, 1],
  // ── Western swing (panel 2026-06-15, harmony-theory) — the 6th-chord turnaround that IS
  // the genre's signature cadence (I6 → secondary-dominant circle VI7–II7–V7), and a swing
  // blues with a bar-9 ii–V tag (bluesier than jazz_blues: no bar-6 ♯iv°7). Same {semis,
  // q:'dom7'} secondary-dominant form as soul_turnaround/ragtime_circle.
  ws_sixth_turnaround:[{ deg:1, q:'6' }, { semis:9, q:'dom7', rn:'VI7' }, { semis:2, q:'dom7', rn:'II7' }, { semis:7, q:'dom7', rn:'V7' }],
  ws_swing_blues:[1, 4, 1, 1, 4, 4, 1, { semis:9, q:'dom7', rn:'VI7' }, 2, 5, 1, 5],
  // Synthwave (panel 2026-06-15, harmony-theory) — the somber dreamwave i–v–♭VI; the v
  // stays MINOR (no dom7 override) — that's the whole floaty character. Over natural_minor.
  'i-v-VI':[1,5,6]
};

// Per-progression chord quality overrides — win over diatonic scale harmony,
// but lose to a user-specified chordOverride. Used by chordQualityForDegree.
/** @type {Record<string, Record<number, string>>} */
export const PROGRESSION_QUALITY_OVERRIDES = {
  minor_ii_V_i:        { 2:'min7b5', 5:'dom7', 1:'min7' },
  rhythm_changes_a:    { 6:'dom7' },
  rhythm_changes_bridge:{ 3:'dom7', 6:'dom7', 2:'dom7', 5:'dom7' },
  jazz_blues:          { 1:'dom7', 4:'dom7', 5:'dom7', 2:'min7' },   // dominant I/IV/V, min7 ii (the ♯iv°7/VI7 carry their own q via the token)
  andalusian:          { 5:'dom7' },   // the Andalusian V is the one idiomatic dominant in a modal prog (flamenco variant uses {5:'maj'} over phrygian — handled at the pathway stage)
  ws_swing_blues:      { 1:'dom7', 4:'dom7', 5:'dom7', 2:'min7' }   // western-swing blues: dominant I/IV/V, min7 ii (the VI7 carries its own q via the token)
};

// Minor-spelled progressions: their Roman numerals (bVI / bIII / bVII) are
// spelled against the NATURAL-minor (Aeolian) degrees. Harmonic and melodic
// minor RAISE the 7th (and melodic also the 6th) — those are MELODIC devices
// (the leading tone), not chord-root choices. If the chord roots followed
// those raised degrees, degree VII would land on the raised leading tone:
// e.g. i-VI-III-VII in A over harmonic_minor produced G#7 for the VII instead
// of the intended bVII (G). So for these scales we pin the chord ROOTS to
// natural minor; chord QUALITY still comes from the chord-scale / overrides.
//
// Natural minor already gives Aeolian roots (no pinning needed). Dorian and
// phrygian are deliberately NOT pinned: their characteristic altered degrees
// (dorian's natural 6, phrygian's b2) are the point of choosing them, and the
// backing should match the scale the player is actually using rather than be
// forced back to Aeolian. Major-scale pairings are likewise left untouched.
export const MINOR_SPELLED_PROGRESSIONS = new Set(['i-VI-III-VII', 'i-VII-VI-VII', 'minor_ii_V_i']);

export const ROOT_PIN_NATURAL_MINOR_SCALES = new Set(['harmonic_minor', 'melodic_minor']);

// Default chord-scale for "mode of the moment". These follow the codebase's
// documented jazz stance (see docs/theory/theory-jazz-advanced.md "Chord-scale
// defaults"): prefer scales that dodge the avoid-note a half-step above a
// chord tone, even though that's a more advanced choice than the textbook
// functional scale.
//   maj7  → Lydian        — #11 avoids the Ionian 4th avoid-note.
//   dom7  → Lydian dominant — #11 avoids the Mixolydian 4th avoid-note.
//   min7  → Dorian        — most consonant minor chord-scale.
//   m7b5  → Locrian ♮2     — avoids the plain-Locrian b2 clash.
// These are DEFAULTS for auto chord-scale selection; the user can still pick
// Ionian / Mixolydian explicitly when a strictly functional sound is wanted.
/** @type {Record<string, string>} */
export const MODE_FOR_QUALITY = {
  maj:'major',           maj7:'lydian',
  min:'dorian',          min7:'dorian',
  dom7:'lydian_dominant',
  dim:'locrian',         min7b5:'locrian_sharp2', dim7:'locrian',
  aug:'major',           sus4:'mixolydian', add9:'major',
  // Power chords are third-less; minor pentatonic is the universal "play over a
  // power chord" choice across rock/metal/blues.
  '5':'minor_pentatonic', '5oct':'minor_pentatonic',
  sus2:'mixolydian', '6':'major', min6:'dorian', '69':'major', min_maj7:'melodic_minor',
  // Extensions follow their parent 7th's chord-scale; the natural-11 dominant
  // (dom11) takes mixolydian (natural 11) rather than lydian dominant (♯11).
  maj9:'lydian',          min9:'dorian',          dom9:'lydian_dominant',
  maj11:'lydian',         min11:'dorian',         dom11:'mixolydian',
  maj13:'lydian',         min13:'dorian',         dom13:'lydian_dominant'
};

// ===========================================================================
// §5 · CHORD-DEPTH / DIATONIC EXTENSION ENGINE
// ===========================================================================
// --- Chord depth / diatonic extension engine -----------------------------
// Depth → number of stacked tones. Extended depths stack further diatonic
// thirds on top of the seventh (9th, 11th, 13th).
/** @type {Record<string, number>} */
export const DEPTH_TONES = { triad:3, seventh:4, ninth:5, eleventh:6, thirteenth:7 };

export const EXTENDED_DEPTHS = new Set(['ninth','eleventh','thirteenth']);

// Promote a NAMED quality to its natural extended form. Used for chords that
// are deliberate harmonic choices (progression overrides — secondary dominants,
// and future tritone subs) rather than plain diatonic chords: those extend with
// conventional natural tensions, NOT by stacking the home key's scale. Unlisted
// bases fall through unchanged.
/** @type {Record<string, Record<string, string>>} */
export const QUALITY_EXTEND = {
  ninth:      { maj7:'maj9', min7:'min9', dom7:'dom9', maj:'add9', min:'min9', '6':'69' },
  eleventh:   { maj7:'maj11', min7:'min11', dom7:'dom11', maj:'maj11', min:'min11' },
  thirteenth: { maj7:'maj13', min7:'min13', dom7:'dom13', maj:'maj13', min:'min13' }
};

/** @param {string} base @param {string} depth */
export function extendNamedQuality(base, depth) { const m = QUALITY_EXTEND[depth]; return (m && m[base]) || base; }

// Build the diatonic chord on `degree` of `scale`, stacked to `tones` notes, as
// semitone intervals from the chord root — by stacking scale thirds (every other
// scale tone). For heptatonic scales this yields the TRUE diatonic chord at any
// extension, including altered tensions (e.g. the iii chord's ♭9/♭13 and the IV
// chord's ♯11 in major fall out automatically).
/** @param {string} scale @param {number} degree @param {number} tones */
export function diatonicChordIntervals(scale, degree, tones) {
  const sc = SCALE_INTERVALS[scale] || SCALE_INTERVALS.major;
  const n = sc.length, rootIdx = (degree - 1 + n * 99) % n, rootPitch = sc[rootIdx], out = [];
  for (let k = 0; k < tones; k++) { const step = rootIdx + 2 * k; out.push(sc[step % n] + 12 * Math.floor(step / n) - rootPitch); }
  return out;
}

// Derive a readable jazz chord symbol from an interval stack. Base triad/7th +
// extension figure + characteristic altered tensions. NOTES are always exact;
// the symbol approximates but flags the spicy tensions (♭9 / ♯11 / ♭13 …).
/** @param {number[]} iv */
export function deriveChordSymbol(iv) {
  /** @param {number} x */
  const has = x => iv.includes(x);
  const third = has(4) ? 'M' : has(3) ? 'm' : null;
  const dim5 = has(6) && !has(7), aug5 = has(8) && !has(7);
  const maj7 = has(11), b7 = has(10), dd7 = has(9) && !has(10) && !has(11);
  let stem, special = false;
  if (third === 'm' && dim5 && b7) { stem = 'm7♭5'; special = true; }
  else if (dim5 && dd7) { stem = 'dim7'; special = true; }
  else if (third === 'M' && maj7) stem = 'maj';
  else if (third === 'M' && b7) stem = '';            // dominant
  else if (third === 'm' && maj7) { stem = 'm(maj7)'; special = true; }
  else if (third === 'm') stem = 'm';
  else if (aug5) { stem = 'aug'; special = true; }
  else stem = third === 'M' ? 'maj' : 'm';
  const fig = (has(20) || has(21)) ? '13' : (has(17) || has(18)) ? '11' : (has(13) || has(14) || has(15)) ? '9' : (maj7 || b7 || dd7) ? '7' : '';
  const alt = [];
  if (aug5 && !special) alt.push('♯5');                 // augmented-maj7 (III of harmonic/melodic minor)
  if (dim5 && !special && third === 'M') alt.push('♭5'); // dominant ♭5
  if (has(13)) alt.push('♭9'); if (has(15)) alt.push('♯9');
  if (has(18) && !has(17)) alt.push('♯11');
  if (has(20) && !has(21)) alt.push('♭13');
  if (special) { const inner = []; if (fig && fig !== '7') inner.push(fig); inner.push(...alt); return stem + (inner.length ? `(${inner.join(',')})` : '') || 'maj'; }
  return (stem + fig + (alt.length ? `(${alt.join('')})` : '')) || 'maj';
}

// Register (memoised) a synthetic CHORD_FORMULAS entry for a diatonically-stacked
// extended chord; return its key. Consumers read CHORD_FORMULAS[key] exactly like
// a static quality, so no call site needs to change. `mode` carries the chord-
// scale for mode-of-the-moment (the diatonic mode of the base seventh chord).
/** @param {string} scale @param {number} degree @param {string} depth */
export function diatonicExtendedQuality(scale, degree, depth) {
  const key = `__d:${scale}:${degree}:${depth}`;
  if (!CHORD_FORMULAS[key]) {
    const intervals = diatonicChordIntervals(scale, degree, DEPTH_TONES[depth] || 5);
    const fam = DIATONIC_QUALITIES[scale] || DIATONIC_QUALITIES.major;
    const base7 = (fam.seventh || fam.triad)[(degree - 1 + 7) % 7] || 'maj7';
    CHORD_FORMULAS[key] = { symbol: deriveChordSymbol(intervals), intervals, mode: MODE_FOR_QUALITY[base7] || 'major' };
  }
  return key;
}

/** @param {string} scale @param {string} depth @param {import('./generation-types.js').Degree} degree @param {string} [override] @param {string} [progression] @returns {string} */
export function chordQualityForDegree(scale, depth, degree, override, progression) {
  if (override && override !== 'auto') return override;            // explicit override wins fully
  const ext = EXTENDED_DEPTHS.has(depth);
  // Progression token: {deg|semis, q, rn}. An explicit q wins (promoted by depth);
  // a deg-only token defers to the diatonic path; a chromatic semis token with no
  // quality is assumed dominant (the usual chromatic-chord case).
  if (degree && typeof degree === 'object') {
    if (degree.q) return ext ? extendNamedQuality(degree.q, depth) : degree.q;
    if (degree.deg != null) return chordQualityForDegree(scale, depth, degree.deg, override, progression);
    return ext ? extendNamedQuality('dom7', depth) : 'dom7';
  }
  const progOverride = progression && PROGRESSION_QUALITY_OVERRIDES[progression];
  if (progOverride && progOverride[/** @type {number} */ (degree)] != null) {
    const base = progOverride[/** @type {number} */ (degree)];
    return ext ? extendNamedQuality(base, depth) : base;          // promote borrowed/secondary chords
  }
  // Diatonic chords: extended depths stack true scale thirds (heptatonic scales
  // only — the DIATONIC_QUALITIES set); triad/seventh use the hand-verified rows.
  if (ext && DIATONIC_QUALITIES[scale] && (SCALE_INTERVALS[scale] || []).length === 7) {
    return diatonicExtendedQuality(scale, /** @type {number} */ (degree), depth);
  }
  // Exotic scale with no diatonic row: give its TONIC the honest chord identity
  // rather than silently borrowing a major triad. Tonic only (degree 1/8); other
  // degrees still fall through. Pentatonic/blues aren't in the map → unchanged.
  if (!DIATONIC_QUALITIES[scale] && ((/** @type {number} */ (degree) - 1 + 7) % 7) === 0 && SCALE_TONIC_QUALITY[scale]) {
    const base = SCALE_TONIC_QUALITY[scale];
    return ext ? extendNamedQuality(base, depth) : base;
  }
  const family = DIATONIC_QUALITIES[scale] || DIATONIC_QUALITIES.major;
  if (ext) {
    // Non-heptatonic scale (pentatonic/blues/etc.): promote the fallback seventh.
    const base = (family.seventh || family.triad)[(/** @type {number} */ (degree) - 1 + 7) % 7] || 'maj7';
    return extendNamedQuality(base, depth);
  }
  const row = family[depth === 'seventh' ? 'seventh' : 'triad'] || family.triad;
  return row[(/** @type {number} */ (degree) - 1 + 7) % 7] || 'maj';
}

// A chord is "dominant" if it has a major 3rd + minor 7th and no major 7th —
// covers dom7/9/11/13 (named or synthetic). Used to decide tritone-sub targets.
/** @param {string} quality */
export function isDominantQuality(quality) {
  const f = CHORD_FORMULAS[quality];
  if (!f) return false;
  const s = new Set(f.intervals.map(i => i % 12));
  return s.has(4) && s.has(10) && !s.has(11);
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {import('./generation-types.js').Degree} degree @returns {number} */
export function chordRootForDegree(cfg, degree) {
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  // Progression token: {deg|semis, …}. An explicit semis is a chromatic root
  // offset from the key root (and is taken literally — no auto tritone-sub on an
  // already-authored chromatic chord); a deg-only token routes the normal path.
  if (degree && typeof degree === 'object') {
    if (degree.semis != null) return ((keyPc + degree.semis) % 12 + 12) % 12;
    return chordRootForDegree(cfg, degree.deg != null ? degree.deg : 1);
  }
  // For a minor-spelled progression played over a minor-family chord-scale,
  // pin the chord ROOTS to natural minor so bVI/bIII/bVII keep their Aeolian
  // spelling (harmonic minor's raised 7th, etc. would otherwise move them).
  // All other cases follow the chosen chord-scale's own degree positions.
  const useNaturalMinorRoots = cfg.progression
    && MINOR_SPELLED_PROGRESSIONS.has(cfg.progression)
    && ROOT_PIN_NATURAL_MINOR_SCALES.has(cfg.scale);
  const rootScale = useNaturalMinorRoots ? 'natural_minor' : cfg.scale;
  let intervals = SCALE_INTERVALS[rootScale] || SCALE_INTERVALS.major;
  // Progression degrees (I/IV/V…) are FUNCTIONAL and need a 7-note scale to index.
  // Pentatonic / blues / other non-heptatonic lead scales have no usable IV or V
  // position — indexing them roots the IV on the ♭5 (blues) or 5th (pentatonic),
  // which is the long-standing blues-IV dissonance. Fall back to a diatonic scale
  // for root mapping: natural minor for minor-spelled progressions, else major
  // (the dominant-blues / major-key I–IV–V functional reading). Lead notes still
  // use cfg.scale; only the chord ROOTS are pinned to a diatonic reading.
  if (intervals.length !== 7) intervals = SCALE_INTERVALS[useNaturalMinorRoots ? 'natural_minor' : 'major'];
  let rootPc = (keyPc + intervals[(/** @type {number} */ (degree) - 1 + intervals.length) % intervals.length]) % 12;
  // Tritone substitution: replace a dominant chord with the dominant a tritone
  // (6 semitones) away — G7 → D♭7. Quality stays dominant (so the name follows
  // the new root) and mode-of-the-moment over it resolves to that root's lydian
  // dominant, which is the classic altered-scale relationship. Extended depths
  // ride along automatically (G13 → D♭13). Subs only fire on actual dominant-7th
  // chords, so it needs Seventh-or-richer depth (or a dominant override).
  if (cfg.tritoneSub && cfg.tritoneSub !== 'off') {
    const q = chordQualityForDegree(cfg.scale, cfg.chordDepth, degree, cfg.chordOverride, cfg.progression);
    const inScope = cfg.tritoneSub === 'all_dominants' || (cfg.tritoneSub === 'dominant_v' && degree === 5);
    if (inScope && isDominantQuality(q)) rootPc = (rootPc + 6) % 12;
  }
  return rootPc;
}

/** @param {number} rootPc @param {string} quality */
export function chordName(rootPc, quality) { const f = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj; return pcName(rootPc) + (f.symbol === 'maj' ? 'maj' : f.symbol); }

/** @param {import('./generation-types.js').GenerationConfig} cfg */
export function progressionDegreesForConfig(cfg) { return cfg.mode === 'diatonic_arpeggios' ? COMMON_PROGRESSIONS.diatonic : (COMMON_PROGRESSIONS[cfg.progression] || COMMON_PROGRESSIONS['I-V-vi-IV']); }
