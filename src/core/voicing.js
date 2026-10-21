// SPDX-License-Identifier: AGPL-3.0-only

/** @typedef {{maxVoices?: number, bassLow?: number, bassHigh?: number, upperHigh?: number, voicingStyle?: string, instrument?: string}} VoicingOptions */

// Turn a chord (root pc + tertian interval stack) into a good-sounding block
// voicing: keep guide tones, drop the avoid-note 11 on major/dominant chords,
// keep the top colour tension, avoid muddy low clusters, tensions on top.
// Block/backing only — arpeggios sweep all tones elsewhere.
/** @type {Record<string, number>} */
export const VOICE_ORDER = { '3rd':0, 'b5':1, '5th':1, '#5':1, '7th':2, 'dim7':2, 'b9':3, '9':3, '#9':3, '11':4, '#11':4, '13':5, 'b13':5 };

// Which comp VOICING STYLE a genre uses (Layer 2, genre-band 2026-06-13): 'triad' =
// the low, root-DOUBLED GUITAR voicing (the strum genres, where the mid-register
// rootless jazz spread sounded wrong/"jazzy"); else 'shell' = the rootless-ish spread
// that voice-leads and swings (jazz/funk/soul/gospel/blues + the default). Keyed by
// profile id because rock's family is 'clean' (family alone would mis-route it).
export const VOICING_TRIAD = new Set(['country', 'folk', 'bluegrass', 'rock', 'punk', 'surf', 'norteno']);

// ===========================================================================
// §6 · VOICING ENGINE
// ===========================================================================
// --- Voicing engine (docs/theory/musicality-guardrails.md Layer 2) ----------------
// Classify each chord-tone pitch class (mod 12) into a role + inclusion rank
// (lower = kept first). Context resolves ambiguity: a minor 3rd is a ♯9 when a
// major 3rd is also present; the ♭5/♯5 vs ♯11/♭13 split depends on the natural 5th;
// the natural 11 is a low-priority avoid-note on major/dominant chords but a kept
// colour on minor chords; the plain 5th is mandatory only when there is no 7th.
/** @param {number[]} intervals */
export function classifyChordTones(intervals) {
  const pcs = new Set(intervals.map(i => ((i % 12) + 12) % 12));
  const M3 = pcs.has(4), m3 = pcs.has(3), P5 = pcs.has(7);
  const seventh = pcs.has(11) ? 11 : pcs.has(10) ? 10 : (pcs.has(9) && m3 && pcs.has(6)) ? 9 : null;
  const roles = [];
  for (const pc of pcs) {
    let kind, rank;
    switch (pc) {
      case 0:  kind = 'root'; rank = 0; break;
      case 4:  kind = '3rd';  rank = 1; break;
      case 3:  if (M3) { kind = '#9'; rank = 3; } else { kind = '3rd'; rank = 1; } break;
      case 11: kind = '7th';  rank = 1; break;
      case 10: kind = '7th';  rank = 1; break;
      case 9:  if (pc === seventh) { kind = 'dim7'; rank = 1; } else { kind = '13'; rank = 3; } break;
      case 7:  kind = '5th';  rank = seventh === null ? 1 : 5; break;  // complete the triad only when there's no 7th
      case 6:  if (P5) { kind = '#11'; rank = 3; } else { kind = 'b5'; rank = 2; } break;
      case 8:  if (P5) { kind = 'b13'; rank = 3; } else { kind = '#5'; rank = 2; } break;
      case 2:  kind = '9';   rank = 4; break;
      case 1:  kind = 'b9';  rank = 3; break;
      case 5:  kind = '11';  rank = M3 ? 90 : 3; break;   // avoid-note on major/dominant; consonant on minor
      default: kind = 'other'; rank = 6;
    }
    roles.push({ pc, kind, rank });
  }
  return roles;
}

/** @param {number} rootPc @param {number[]} intervals @param {VoicingOptions | null} [opts] */
export function voiceChord(rootPc, intervals, opts) {
  const o = opts || {};
  const maxVoices = o.maxVoices || 4;
  const bassLow = o.bassLow ?? 36, bassHigh = o.bassHigh ?? 48;
  const upperHigh = o.upperHigh ?? 74;
  // Hard-drop the natural 11 when a major 3rd is present (rank 90 sentinel).
  const roles = classifyChordTones(intervals).filter(r => r.rank < 90);
  // Mandatory guide tones (rank ≤ 1) always kept; fill remaining slots by rank.
  const mandatory = roles.filter(r => r.rank <= 1);
  const optional = roles.filter(r => r.rank > 1).sort((a, b) => a.rank - b.rank);
  const keep = mandatory.slice();
  for (const r of optional) { if (keep.length >= maxVoices) break; keep.push(r); }
  // Bass = root, folded into the bass window.
  let bass = ((rootPc % 12) + 12) % 12;
  while (bass < bassLow) bass += 12;
  while (bass > bassHigh) bass -= 12;
  const out = [bass];
  // Upper voices: core (3rd/5th/7th) low, tensions high — placed ascending so
  // colour tones naturally land on top; min gap in the low region kills mud.
  const upper = keep.filter(r => r.kind !== 'root').sort((a, b) => (VOICE_ORDER[a.kind] ?? 9) - (VOICE_ORDER[b.kind] ?? 9));
  // The FIRST upper voice is register-anchored near a centre (~G3) so major and
  // minor chords sit in the SAME register — a minor 3rd no longer folds an octave
  // above a major 3rd. A bass→upper MINIMUM GAP (not a fixed floor) keeps
  // consistent clearance regardless of root and kills low-register mud.
  // Backing voicing STYLE (genre-band, harmony 2026-06-13): 'triad' (strum genres —
  // country/folk/rock) sits a guitar register LOWER + tighter to the bass, root
  // doubled on top = a strummed cowboy chord, NOT the mid-register jazz-piano spread
  // that made every genre sound jazzy. Default 'shell' = the rootless-ish mid spread
  // that swings for jazz/funk. (Metal's power 5ths come via the root5 target.)
  const style = o.voicingStyle || 'shell';
  const minBassGap = o.instrument === 'bass' ? 14 : (style === 'triad' ? 4 : 10);
  const CENTER = style === 'triad' ? 50 : 55; // triad sits ~a 3rd lower (~D3)
  let cursor = bass + minBassGap, first = true;
  for (const r of upper) {
    // r.pc is the interval ABOVE THE ROOT (0..11); the actual pitch class is
    // rootPc + that interval. (Placing the bare interval put every non-C-rooted
    // chord's upper voices on the wrong pitches — correct bass, wrong triad.)
    const apc = (((rootPc + r.pc) % 12) + 12) % 12;
    let midi;
    if (first) {
      midi = apc; while (midi < CENTER - 6) midi += 12; while (midi > CENTER + 6) midi -= 12; // pc in the octave nearest the centre
      while (midi < cursor) midi += 12;                                                        // but never inside the bass gap
      first = false;
    } else {
      midi = cursor + ((((apc - cursor) % 12) + 12) % 12);   // lowest pc ≥ cursor
    }
    if (midi > upperHigh) midi -= 12;
    if (!out.includes(midi)) out.push(midi);
    cursor = midi + (midi < 67 ? 3 : 2);   // inter-voice min gap: ≥3 below ~G4, ≥2 above (anti-cluster)
  }
  // Triad/guitar: double the root an octave above the top voice — the open-chord
  // RING that reads as a strummed guitar, not a keyboard. One extra voice over the cap.
  if (style === 'triad' && out.length <= maxVoices) {
    const top = Math.max.apply(null, out), rpc = ((rootPc % 12) + 12) % 12;
    let rd = rpc; while (rd <= top) rd += 12;
    if (rd <= upperHigh + 6 && out.indexOf(rd) < 0) out.push(rd);
  }
  return out.sort((a, b) => a - b);
}

/** @param {string} profileId */
export function backingVoicingStyle(profileId) { return VOICING_TRIAD.has(profileId) ? 'triad' : 'shell'; }

/** @param {number} rootPc @param {number[]} intervals @param {string | undefined} instrument @param {boolean} [lift] @param {string} [voicingStyle] */
export function voiceBackingChord(rootPc, intervals, instrument, lift, voicingStyle) {
  // Register LIFT (backing-engine step 4): when a real BASS FIGURE plays, the
  // comp drops its folded low root — lowest voice ≥48, the bass-pedagogy
  // pad-lift rule — so pad/cell voicings never fight the bass lane's register.
  // Triad/guitar voicings sit a bit LOWER (overlapping the bass's top, the way a real
  // guitar+bass band does — open chords reach down to E2) so they read as a strummed
  // guitar, not a lifted mid-register pad. Other styles keep the clear-of-the-bass lift.
  const bassWin = (voicingStyle === 'triad' && instrument !== 'bass')
    ? (lift ? { bassLow: 43, bassHigh: 55 } : { bassLow: 40, bassHigh: 52 })
    : lift ? { bassLow: 48, bassHigh: 59 }
    : instrument === 'bass' ? { bassLow: 23, bassHigh: 40 } : { bassLow: 36, bassHigh: 48 };
  // Register (mud + minor-chord octave consistency) is handled inside voiceChord
  // by the register-anchor + bass-gap, so no upperLow floor here.
  return voiceChord(rootPc, intervals, Object.assign({ instrument, maxVoices: 4, upperHigh: 74, voicingStyle }, bassWin));
}

// A SUSTAINED pad/Keys voicing for the Keys (pad) bus — the 2nd harmonic layer
// (Keys un-orphan, panel 2026-06-13). ROOTLESS and placed just ABOVE the comp's
// top voice so it never doubles a comp pitch in the same octave (harmony-theory's
// mud rule): the bass owns the root, the comp owns the rhythmic mids, the pad
// floats guide-tones + one colour up top. Subordinate by construction (≤3 voices,
// low level + the comp-duck downstream). Deterministic — no rng.
/** @param {number} rootPc @param {number[]} intervals @param {number[]} compMidis */
export function voiceBackingPad(rootPc, intervals, compMidis) {
  const iv = (intervals || []).map(i => (((i % 12) + 12) % 12));
  /** @param {number} x */
  const has = x => iv.includes(x);
  const degs = [];
  const third = has(4) ? 4 : has(3) ? 3 : null;
  const sev = has(10) ? 10 : has(11) ? 11 : null;
  if (third != null) degs.push(third);
  if (sev != null) degs.push(sev);
  if (has(2)) degs.push(2); else if (has(9)) degs.push(9); else if (has(7)) degs.push(7);  // 9th / 6th / 5th colour
  if (!degs.length) degs.push(has(7) ? 7 : 0);                                              // last-ditch (power chord) → 5th/root
  // Lowest pad voice sits just OVER the comp ceiling (rootless, no same-octave
  // double); capped so it stays a treble shimmer, not stratospheric.
  const compTop = (compMidis && compMidis.length) ? Math.max.apply(null, compMidis) : 64;
  const LO = Math.min(76, Math.max(62, compTop + 1)), HI = LO + 22;
  /** @type {number[]} */
  const out = []; let cursor = LO;
  for (const d of degs) {
    const apc = (((rootPc + d) % 12) + 12) % 12;
    let m = cursor + ((((apc - cursor) % 12) + 12) % 12);   // lowest pc ≥ cursor
    if (m > HI) m -= 12;
    if (!out.includes(m) && !((compMidis || []).includes(m))) out.push(m);
    cursor = m + 2;
  }
  return out.sort((a, b) => a - b);
}

// ── Voice-leading between successive backing chords (backing-engine step 2) ──
// The named differentiator: the comp moves like a comper's hand, not a machine.
// Piano-pedagogy rule-set: anchor only the FIRST chord to the register centre
// (voiceChord's CENTER); after that, common tones HOLD at the same literal
// pitch and the other voices take the nearest chord tone (minimal total
// motion — the 7th resolving down by step into the next 3rd falls out of it).
// The bass voice stays the ROOT (bass motion is root motion), folded to the
// octave nearest the previous bass inside the bass window. Re-anchoring
// happens only at the top of the form (see buildBackingEvents). Guards:
// register band, unison dedupe, the 48–55 ≥minor-3rd low-interval row, and a
// one-hand span cap on the upper structure — an unfixable shape re-anchors
// fresh rather than emit mud. Guarded by smoke-backing-engine's VL row.
/** @param {number} rootPc @param {number[]} intervals @param {string | undefined} instrument @param {number[] | null} prev @param {boolean} lift */
export function voiceLeadBackingChord(rootPc, intervals, instrument, prev, lift) {
  const fresh = voiceBackingChord(rootPc, intervals, instrument, lift);
  if (!prev || prev.length < 2 || fresh.length < 2) return fresh;
  // Lifted window (step 4, see voiceBackingChord): 48–55 is < an octave wide,
  // so an unreachable pc falls through to fresh[0] (already lifted) below.
  const bassWin = lift ? { lo: 48, hi: 55 } : instrument === 'bass' ? { lo: 23, hi: 40 } : { lo: 36, hi: 48 };
  const rpc = ((rootPc % 12) + 12) % 12;
  let bass = null;
  for (let m = rpc; m <= bassWin.hi; m += 12) {
    if (m < bassWin.lo) continue;
    if (bass === null || Math.abs(m - prev[0]) < Math.abs(bass - prev[0])) bass = m;
  }
  if (bass == null) bass = fresh[0];
  // Upper targets: reuse voiceChord's tone SELECTION (avoid-notes dropped,
  // guide tones kept, voice cap respected) — only the PLACEMENT changes.
  const targetPcs = [...new Set(fresh.slice(1).map(m => ((m % 12) + 12) % 12))];
  const prevUpper = prev.slice(1);
  const LO = 50, HI = 76, CENTER = 55;
  // Nearest placement of a pc to a previous voice (≤6 semitones either way —
  // a common tone lands at distance 0, i.e. holds literally).
  /** @param {number} pc @param {number} v */
  const nearTo = (pc, v) => { let m = v + ((((pc - v) % 12) + 12) % 12); if (m - v > 6) m -= 12; return m; };
  // Minimal-total-motion assignment of target pcs onto previous voices
  // (≤4 voices → brute-force permutations). Extra targets place fresh near
  // the centre; extra previous voices drop (the chord got smaller).
  const n = targetPcs.length, k = prevUpper.length;
  /** @param {number[]} arr @returns {number[][]} */
  const perm = (arr) => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perm(arr.slice(0, i).concat(arr.slice(i + 1))).map(p => [x, ...p]));
  let best = null;
  for (const order of perm(targetPcs.map((_, i) => i))) {
    let cost = 0; const placed = [];
    for (let v = 0; v < Math.min(n, k); v++) {
      const m = nearTo(targetPcs[order[v]], prevUpper[v]);
      cost += Math.abs(m - prevUpper[v]);
      placed.push({ i: order[v], m });
    }
    if (best === null || cost < best.cost) best = { cost, placed };
  }
  const used = new Set(/** @type {NonNullable<typeof best>} */ (best).placed.map(p => p.i));
  let out = /** @type {NonNullable<typeof best>} */ (best).placed.map(p => p.m);
  for (let i = 0; i < n; i++) {                       // targets with no prior voice
    if (used.has(i)) continue;
    let m = targetPcs[i]; while (m < CENTER - 6) m += 12; while (m > CENTER + 6) m -= 12;
    out.push(m);
  }
  out = [...new Set(out.map(m => { while (m < LO) m += 12; while (m > HI) m -= 12; return m; }))].sort((a, b) => a - b);
  // Low-interval row: between MIDI 48–55, adjacent voices need ≥ a minor 3rd —
  // lift the upper offender an octave (drop it if the band is full).
  for (let i = 1, guard = 0; i < out.length && guard < 12; i++) {
    if (out[i] - out[i - 1] < 3 && out[i] < 55) {
      if (out[i] + 12 <= HI && !out.includes(out[i] + 12)) out[i] += 12; else out.splice(i, 1);
      out.sort((a, b) => a - b); i = 0; guard++;
    }
  }
  if (out.length < 2 || out[out.length - 1] - out[0] > 14) return fresh;   // shape broke — re-anchor
  return [bass, ...out].sort((a, b) => a - b);
}

// Place a pitch class (0..11) at or above a floor MIDI.
/** @param {number} pc @param {number} floor */
export function pcAtOrAbove(pc, floor) { let m = ((pc % 12) + 12) % 12; while (m < floor) m += 12; return m; }
