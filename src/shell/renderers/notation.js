// SPDX-License-Identifier: AGPL-3.0-only
import { RENDER_THEMES, chartBeatSeconds, stringLabelForMidi, rhGlyph } from './display-policy.js';
import { orderHandMarks, selectHandMarks } from './hand-marks.js';
import { resolveNotationKey, STAFF_NATURALS } from './notation-pitch.js';

// MIRROR local display only: no standalone general host Notation factory (2026-10-20).
/** @param {import('./renderer-types.js').DisplayPreferences} preferences
 * @returns {import('./renderer-types.js').NotationRenderer} */
export function makeBuiltin2DNotationRenderer({ getRenderTheme, handMarksOn }) {
  // Standard staff notation: treble clef for guitar (8va transposing) or
  // bass clef. Key signature, note heads, stems, beams (8th/16th groups),
  // ledger lines, and accidentals use the fixed palette shared with Tab.
  /** @type {HTMLCanvasElement | null} */
  let canvas = null;
  /** @type {CanvasRenderingContext2D | null} */
  let ctx = null;
  let W = 0, H = 0;
  let dpr = 1;
  let spellings = resolveNotationKey('C', 'major').spellings;
  let beatDur = 0.5, numAcc = 0, isFlats = false, isBass = false;
  /** @type {Record<number, number>} */
  let ksAlter = {};
  /** @type {import('./renderer-types.js').BeamGroup[]} */
  let beamGroups = [];
  /** @type {import('./renderer-types.js').RenderNote[]} */
  let handNotes = [];
  /** @type {import('./renderer-types.js').RenderNote[] | undefined} */
  let handSource;
  let mode = 'both'; // 'both' | 'tab' | 'notation'
  let t = RENDER_THEMES.light;  // refreshed at the top of each draw()
  const LEFT_PAD = 68, RIGHT_PAD = 24;
  let AHEAD = 5, BEHIND = 1.5;   // view window (seconds); set per draw, beat-relative
  const STAFF_LEFT = 6;          // staff/tab lines begin here (clef sits on them)
  const BAR_LEAD = 13;           // px the bar line sits left of its downbeat note
  let contentLeft = LEFT_PAD;    // x where note content starts; set per draw so
                                 // the clef + key signature get room on the staff

  function resize() {
    if (!canvas) return;
    const r = /** @type {HTMLElement} */ (canvas.parentElement).getBoundingClientRect();
    W = Math.max(640, Math.round(r.width || 1280));
    H = Math.max(500, Math.round(r.height || 720));
    dpr = window.devicePixelRatio || 1;
    const width = Math.round(W * dpr), height = Math.round(H * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  }
  /** @param {number} dt */
  function xForDt(dt) {
    return contentLeft + ((dt + BEHIND) / (AHEAD + BEHIND)) * (W - contentLeft - RIGHT_PAD);
  }

  // ── Pitch / staff mapping ────────────────────────────────────────────
  // Each pitch class spells to a staff LETTER (0=C..6=B) + chromatic alter.
  // Sharp keys spell black keys as lower-letter+sharp (C#); flat keys as
  // upper-letter+flat (Db) so flat-key notation reads correctly — e.g. Bb
  // sits on the B line, not the A line.
  // Guitar/bass are 8va transposing: display pitch = sounding + 12.
  // Treble bottom line = E4; bass bottom line = G2 (clef-base offsets below).
  /** @param {number} soundingMidi */
  function spellMidi(soundingMidi) {
    const written = soundingMidi + 12;
    const pc = ((written % 12) + 12) % 12;
    const [letter, alter] = spellings[pc];
    const oct = Math.floor((written - STAFF_NATURALS[letter] - alter) / 12) - 1;
    const step = (oct * 7 + letter) - (isBass ? (2 * 7 + 4) : (4 * 7 + 2));
    return { step, alter, letter };
  }
  /** @param {number} soundingMidi */
  function midiToStep(soundingMidi) { return spellMidi(soundingMidi).step; }
  /** @param {number} step @param {number} bottomY @param {number} ls */
  function stepToY(step, bottomY, ls) { return bottomY - step * (ls / 2); }

  // Key-signature alteration per staff letter (0=C..6=B): +1 sharp, -1 flat.
  const SHARP_LETTERS = [3, 0, 4, 1, 5, 2, 6]; // F C G D A E B
  const FLAT_LETTERS  = [6, 2, 5, 1, 4, 0, 3]; // B E A D G C F
  function keySigLetterAlter() {
    /** @type {Record<number, number>} */
    const map = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const n = Math.min(Math.abs(numAcc), 7);
    const order = numAcc >= 0 ? SHARP_LETTERS : FLAT_LETTERS;
    const alt = numAcc >= 0 ? 1 : -1;
    for (let i = 0; i < n; i++) map[order[i]] = alt;
    return map;
  }
  // Accidental a note needs on the roll: null when the key signature already
  // accounts for it; else 'sharp' | 'flat' | 'natural' (natural cancels a
  // key-sig accidental on that letter, e.g. the raised 7th G# in A minor, or
  // an F♮ in G major).
  /** @param {number} soundingMidi @param {Record<number, number>} ksAlter */
  function noteAccidental(soundingMidi, ksAlter) {
    const { alter, letter } = spellMidi(soundingMidi);
    const sig = ksAlter[letter] || 0;
    if (alter === sig) return null;
    return alter > 0 ? 'sharp' : alter < 0 ? 'flat' : 'natural';
  }

  // ── Key signature ─────────────────────────────────────────────────────
  const T_SHARP=[8,5,9,6,3,7,4], T_FLAT=[4,7,3,6,2,5,1]; // treble staff steps
  const B_SHARP=[6,3,7,4,1,5,2], B_FLAT=[2,5,1,4,0,3,-1]; // bass staff steps

  // ── Rhythm / beaming ─────────────────────────────────────────────────
  const NV = [
    {name:'whole',        beats:4,    filled:false,hasStem:false,flags:0},
    {name:'half',         beats:2,    filled:false,hasStem:true, flags:0},
    {name:'quarter',      beats:1,    filled:true, hasStem:true, flags:0},
    {name:'eighth',       beats:0.5,  filled:true, hasStem:true, flags:1},
    {name:'sixteenth',    beats:0.25, filled:true, hasStem:true, flags:2},
    {name:'thirtysecond', beats:0.125,filled:true, hasStem:true, flags:3},
  ];
  /** @param {number} dur */
  function quantize(dur) {
    const b = dur / beatDur;
    return NV.reduce((best, nv) => Math.abs(b - nv.beats) < Math.abs(b - best.beats) ? nv : best, NV[2]);
  }
  /** @param {import('./renderer-types.js').RenderNote[]} notes */
  function buildBeamGroups(notes) {
    if (!beatDur) return [];
    const sorted = [...notes].sort((a, b) => a.t - b.t);
    /** @type {import('./renderer-types.js').BeamGroup[]} */
    const groups = [];
    /** @type {import('./renderer-types.js').BeamGroup | null} */
    let cur = null;
    for (const n of sorted) {
      const nv = quantize(n.sus || beatDur * 0.5);
      const beat = Math.floor((n.t + 0.0001) / beatDur);
      if (!nv.flags) { if (cur) { groups.push(cur); cur = null; } continue; }
      if (!cur || cur.beat !== beat) { if (cur) groups.push(cur); cur = {beat, notes:[n]}; }
      else cur.notes.push(n);
    }
    if (cur) groups.push(cur);
    return groups.filter(g => g.notes.length >= 2);
  }

  // ── Layout helpers ────────────────────────────────────────────────────
  // ls = staff line spacing in px. Cap it so the staff stays a sane size on
  // tall canvases — without the cap, ls scales with notH and the clef/staff
  // balloon to fill the window. Notation mode is notation-only (no tab pane).
  function staffLayout() {
    const ratio = mode === 'notation' ? 1.0 : mode === 'tab' ? 0 : 0.56;
    const notH = Math.floor(H * ratio);
    const ls = Math.max(8, Math.min(14, Math.floor(notH * 0.04)));
    const staffHeight = ls * 4;
    const bottomY = Math.floor((notH - staffHeight) / 2) + staffHeight;
    return { notH, ls, bottomY };
  }
  function tabLayout() {
    if (mode === 'tab') return { tabTop: Math.floor(H * 0.04), tabH: Math.floor(H * 0.88) };
    if (mode === 'notation') return { tabTop: 0, tabH: 0 };
    return { tabTop: Math.floor(H * 0.62), tabH: Math.floor(H * 0.38) };
  }
  /** @param {number} s @param {number} nStr @param {number} tabTop @param {number} tabH */
  function tabLaneY(s, nStr, tabTop, tabH) {
    const top = tabTop + tabH * 0.12, bottom = tabTop + tabH * 0.88;
    return top + (nStr - 1 - s) * ((bottom - top) / Math.max(1, nStr - 1));
  }

  // ── Backgrounds ───────────────────────────────────────────────────────
  // Flat ground in light mode (looks like paper), a soft gradient in dark
  // (gives the staff some depth on a low-contrast ink).
  /** @param {CanvasRenderingContext2D} ctx @param {number} notH @param {number} tabTop @param {number} tabH */
  function drawBg(ctx, notH, tabTop, tabH) {
    if (t.bg === t.bgAlt) {
      ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H);
    } else {
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0, t.bgAlt); g.addColorStop(1, t.bg);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // Divider between notation and (currently disabled) tab pane.
    if (mode === 'both' && tabH > 0) {
      ctx.strokeStyle = t.faintLine; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0,notH); ctx.lineTo(W,notH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,tabTop); ctx.lineTo(W,tabTop); ctx.stroke();
    }
  }

  // ── Staff lines ───────────────────────────────────────────────────────
  /** @param {CanvasRenderingContext2D} ctx @param {number} bottomY @param {number} ls */
  function drawStaff(ctx, bottomY, ls) {
    ctx.strokeStyle = t.ink; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = bottomY - i * ls;
      ctx.beginPath(); ctx.moveTo(STAFF_LEFT, y); ctx.lineTo(W - RIGHT_PAD, y); ctx.stroke();
    }
  }

  // ── Clef ─────────────────────────────────────────────────────────────
  // Unicode music-symbol glyphs are sized so that a font-size of roughly
  // 4–5× staff-line-spacing produces a properly-proportioned clef.
  /** @param {CanvasRenderingContext2D} ctx @param {number} bottomY @param {number} ls */
  function drawClef(ctx, bottomY, ls) {
    const ch = isBass ? '\u{1D122}' : '\u{1D11E}';
    const size = isBass ? ls * 4 : ls * 4.6;
    ctx.font = `${size}px "Segoe UI Symbol","Apple Symbols","Noto Symbols 2",serif`;
    ctx.fillStyle = t.ink; ctx.textAlign = 'left';
    // Vertically centre the glyph on the staff (middle line = bottomY - 2·ls)
    // using a middle baseline, then restore the default baseline so the rest
    // of the notation text isn't affected.
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, 8, bottomY - ls * 2);
    ctx.textBaseline = 'alphabetic';
  }

  // ── Key signature ─────────────────────────────────────────────────────
  /** @param {CanvasRenderingContext2D} ctx @param {number} bottomY @param {number} ls */
  function drawKeySig(ctx, bottomY, ls) {
    const n = Math.min(Math.abs(numAcc), 7); if (!n) return;
    const steps = isFlats ? (isBass ? B_FLAT : T_FLAT) : (isBass ? B_SHARP : T_SHARP);
    const ch = isFlats ? '♭' : '♯';
    const x0 = STAFF_LEFT + ls * 3.2; // clear of the clef, on the staff
    ctx.fillStyle = t.keysig; ctx.font = `${ls*1.5}px serif`; ctx.textAlign = 'center';
    for (let i = 0; i < n; i++) ctx.fillText(ch, x0 + i*ls*1.0, stepToY(steps[i],bottomY,ls) + ls*0.4);
    ctx.textAlign = 'left';
  }

  // ── Bar lines ─────────────────────────────────────────────────────────
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} bottomY @param {number} ls */
  function drawNotationBarLines(ctx, bundle, now, bottomY, ls) {
    const staffTop = bottomY - ls * 4;
    for (const b of bundle.beats || []) {
      if (b.measure < 0) continue;
      const dt = b.time - now; if (dt < -BEHIND || dt > AHEAD) continue;
      // Draw the bar line a hair LEFT of the downbeat so the downbeat note
      // sits just after it — standard engraving (notes lie between bar lines,
      // not on them). BAR_LEAD is the measure's small left margin.
      const x = xForDt(dt) - BAR_LEAD;
      ctx.strokeStyle = t.ink; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, staffTop); ctx.lineTo(x, bottomY); ctx.stroke();
      ctx.fillStyle = t.dim; ctx.font = '10px "Cambria","Georgia",serif'; ctx.fillText(String(b.measure), x+3, staffTop-4);
    }
  }

  // ── Note rendering ────────────────────────────────────────────────────
  /** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {import('./renderer-types.js').NoteValue} nv @param {number} ls */
  function noteHead(ctx, x, y, nv, ls) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.18);
    if (nv.filled) { ctx.fillStyle = t.noteFill; ctx.beginPath(); ctx.ellipse(0,0,ls*0.6,ls*0.42,0,0,Math.PI*2); ctx.fill(); }
    else { ctx.strokeStyle = t.noteOutline; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.ellipse(0,0,ls*0.6,ls*0.42,0,0,Math.PI*2); ctx.stroke(); }
    ctx.restore();
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {boolean} up @param {import('./renderer-types.js').NoteValue} nv @param {number} ls */
  function noteStemAndFlag(ctx, x, y, up, nv, ls) {
    const sx = x + (up ? ls*0.58 : -ls*0.58);
    const len = ls * 3.2;
    const tipY = y + (up ? -len : len);
    ctx.strokeStyle = t.stem; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx, y + (up ? -ls*0.38 : ls*0.38)); ctx.lineTo(sx, tipY); ctx.stroke();
    if (nv.flags) {
      const dir = up ? 1 : -1;
      for (let f = 0; f < nv.flags; f++) {
        const fy = tipY + dir * f * ls * 0.55;
        ctx.beginPath(); ctx.moveTo(sx, fy);
        ctx.bezierCurveTo(sx+ls*1.1, fy+dir*ls*0.6, sx+ls*0.9, fy+dir*ls*1.3, sx+ls*0.15, fy+dir*ls*1.7);
        ctx.stroke();
      }
    }
    return { sx, tipY };
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} step @param {number} bottomY @param {number} ls */
  function ledgerLines(ctx, x, step, bottomY, ls) {
    const rw = ls * 0.7; ctx.strokeStyle = t.ledger; ctx.lineWidth = 1;
    for (let s = -2; s >= step; s -= 2) { const y = stepToY(s,bottomY,ls); ctx.beginPath(); ctx.moveTo(x-rw,y); ctx.lineTo(x+rw,y); ctx.stroke(); }
    for (let s = 10; s <= step; s += 2) { const y = stepToY(s,bottomY,ls); ctx.beginPath(); ctx.moveTo(x-rw,y); ctx.lineTo(x+rw,y); ctx.stroke(); }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {string} type @param {number} ls */
  function drawAccidental(ctx, x, y, type, ls) {
    const ch = type === 'sharp' ? '♯' : type === 'flat' ? '♭' : '♮';
    ctx.fillStyle = t.accidental; ctx.font = `bold ${ls*1.45}px serif`; ctx.textAlign = 'right';
    ctx.fillText(ch, x - ls*0.6, y + ls*0.42); ctx.textAlign = 'left';
  }

  // ── Beams ─────────────────────────────────────────────────────────────
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderNote[][]} groups @param {number} now @param {number} bottomY @param {number} ls @param {number[] | null} openMidis */
  function drawBeams(ctx, groups, now, bottomY, ls, openMidis) {
    for (const vis of groups) {
      const stems = vis.map(n => {
        const midi = (openMidis?.[n.s] ?? 40) + n.f;
        const step = midiToStep(midi);
        const hy = stepToY(step, bottomY, ls);
        const up = step < 4;
        const sx = xForDt(n.t - now) + (up ? ls*0.58 : -ls*0.58);
        const tipY = hy + (up ? -ls*3.2 : ls*3.2);
        return { sx, tipY, hy, up, nv: quantize(n.sus || beatDur*0.5) };
      });
      ctx.strokeStyle = t.beam; ctx.lineWidth = ls * 0.38; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(stems[0].sx, stems[0].tipY); ctx.lineTo(stems[stems.length-1].sx, stems[stems.length-1].tipY); ctx.stroke();
      if (stems.some(s => s.nv.flags >= 2)) {
        const off = stems[0].up ? ls*0.42 : -ls*0.42; ctx.lineWidth = ls*0.35;
        ctx.beginPath(); ctx.moveTo(stems[0].sx, stems[0].tipY+off); ctx.lineTo(stems[stems.length-1].sx, stems[stems.length-1].tipY+off); ctx.stroke();
      }
      ctx.strokeStyle = t.stem; ctx.lineCap = 'round'; ctx.lineWidth = 1.5;
      for (const sd of stems) { ctx.beginPath(); ctx.moveTo(sd.sx, sd.hy+(sd.up?-ls*0.38:ls*0.38)); ctx.lineTo(sd.sx, sd.tipY); ctx.stroke(); }
    }
  }

  // ── Draw all notation notes ───────────────────────────────────────────
  // Whole-bar rests for the count-in lead-in bars. A whole rest (a filled bar
  // hanging under the 2nd staff line from the top) denotes a full measure of
  // silence in any time signature, so it's meter-appropriate. Only the lead-in
  // bars get one — the music's own bars draw notes.
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} bottomY @param {number} ls */
  function drawNotationRests(ctx, bundle, now, bottomY, ls) {
    const lead = bundle.leadIn || 0;
    if (lead <= 0) return;
    const downs = (bundle.beats || []).filter(b => (b.measure ?? -1) >= 0).map(b => b.time).sort((a, b) => a - b);
    const restW = ls * 0.95, restH = ls * 0.42, restTop = bottomY - 3 * ls; // hangs from the 4th line
    ctx.fillStyle = t.ink;
    for (let i = 0; i < downs.length; i++) {
      const d0 = downs[i];
      if (d0 >= lead - 1e-3) break;                       // lead-in bars only
      const d1 = (i + 1 < downs.length) ? Math.min(downs[i + 1], lead) : lead;
      const dt = (d0 + d1) / 2 - now;
      if (dt < -BEHIND || dt > AHEAD) continue;
      ctx.fillRect(xForDt(dt) - restW / 2, restTop, restW, restH);
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} bottomY @param {number} ls @param {number[] | null} openMidis */
  function drawNotationNotes(ctx, bundle, now, bottomY, ls, openMidis) {
    const visible = (bundle.notes || []).filter(n => n.t - now >= -BEHIND && n.t - now <= AHEAD);
    const visibleSet = new Set(visible);
    const groups = beamGroups.map(g => g.notes.filter(n => visibleSet.has(n))).filter(g => g.length >= 2);
    const beamed = new Set(groups.flat());
    drawBeams(ctx, groups, now, bottomY, ls, openMidis);
    for (const n of visible) {
      const dt = n.t - now;
      const x = xForDt(dt);
      const midi = (openMidis?.[n.s] ?? 40) + n.f;
      const step = midiToStep(midi);
      const y = stepToY(step, bottomY, ls);
      const nv = quantize(n.sus || beatDur);
      const up = step < 4;
      // Hit paint (2026-06-06 feel panel, UX spec): a credited note gets a
      // snug ink RING around its head (never a fill — fill changes duration
      // semantics); a missed note's head/stem fade. Unjudged stays plain.
      const st = bundle.getNoteState ? bundle.getNoteState(n) : null;
      const dimmed = st === 'miss';
      if (dimmed) ctx.globalAlpha = 0.35;
      ledgerLines(ctx, x, step, bottomY, ls);
      const acc = noteAccidental(midi, ksAlter);
      if (acc) drawAccidental(ctx, x, y, acc, ls);
      noteHead(ctx, x, y, nv, ls);
      if (nv.hasStem && !beamed.has(n)) noteStemAndFlag(ctx, x, y, up, nv, ls);
      if (dimmed) ctx.globalAlpha = 1;
      if (st === 'hit' || st === 'active') {
        // credited hit → GREEN ring + glow around the notehead (host green-hit
        // grammar; a ring, never a fill — fill would change duration semantics).
        ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 9;
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.ellipse(x, y, ls * 0.95, ls * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0; ctx.lineWidth = 1;
      }
    }
  }

  // ── Hand marks (hand-marks Slice-1 tail; UX engraving spec ruling #2) ──
  // The fg numeral sits on the side OPPOSITE the stem (ls·1.3 from the head
  // center — the collision-driven placement engraving allows; clears beams).
  // Unlike tab, fg 0 IS drawn (classical open-string convention; there is no
  // fret digit here to say "open"). Pick strokes reuse the Tab renderer's
  // fixed-lane idiom above the staff (staffTop − ls·2.5), lifting locally
  // when a high ledger head enters the lane. Same MANDATORY simile
  // decimation as tab: dense strokes thin to phrase starts + alternation
  // BREAKS; dense fingers thin to shifts/string crossings.
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} bottomY @param {number} ls @param {number[] | null} openMidis */
  function drawNotationHandMarks(ctx, bundle, now, bottomY, ls, openMidis) {
    if (!handMarksOn()) return;
    if (handSource !== bundle.notes) {
      handSource = bundle.notes;
      handNotes = orderHandMarks(handSource || []);
    }
    const pxPerSec = (W - contentLeft - RIGHT_PAD) / (AHEAD + BEHIND);
    const {strokes, fingers, hasStrokes, hasFingers} = selectHandMarks(handNotes, bundle, now, BEHIND, AHEAD, pxPerSec, true);
    const staffTop = bottomY - ls * 4;
    // Stroke lane: pick glyphs (⊓/∨) and/or pluck-finger letters (p-i-m-a-c —
    // standard notation convention for the plucking hand). Same generalized
    // decimation as tab: a repeated mark (economy crossing / rake) is the
    // information and stays visible.
    if (hasStrokes) {
      const yLane = staffTop - ls * 2.5;
      ctx.strokeStyle = t.ink; ctx.lineWidth = 1.25;
      for (const n of strokes) {
        const x = xForDt(n.t - now);
        // Lift locally if a high ledger head reaches into the lane — and
        // clear the fg numeral too when one sits on the above side (stem-down
        // heads put the numeral above; engraving order is digit nearest the
        // head, stroke glyph above it).
        const step = midiToStep((openMidis?.[n.s] ?? 40) + n.f);
        const headY = stepToY(step, bottomY, ls);
        const fgAbove = n.fg != null && !n.mt && step >= 4;
        const yPick = Math.min(yLane, headY - (fgAbove ? ls * 2.3 : ls * 1.2));
        if (n.rh != null) {
          ctx.fillStyle = t.ink; ctx.font = `italic 600 ${Math.max(9, Math.round(ls))}px "Cambria","Georgia",serif`; ctx.textAlign = 'center';
          ctx.fillText(rhGlyph(n), x, yPick + 3.5); ctx.textAlign = 'left';
        } else {
          ctx.beginPath();
          if (n.pkd === 0) { // downstroke: the staple ⊓
            ctx.moveTo(x - 3.5, yPick + 3); ctx.lineTo(x - 3.5, yPick - 3); ctx.lineTo(x + 3.5, yPick - 3); ctx.lineTo(x + 3.5, yPick + 3);
          } else {           // upstroke: the chevron ∨
            ctx.moveTo(x - 3.5, yPick - 3); ctx.lineTo(x, yPick + 3.5); ctx.lineTo(x + 3.5, yPick - 3);
          }
          ctx.stroke();
        }
      }
    }
    if (hasFingers) {
      ctx.fillStyle = t.inkSoft || t.dim;
      ctx.font = `600 ${Math.max(8, Math.round(ls * 0.9))}px "Cambria","Georgia",serif`;
      ctx.textAlign = 'center';
      for (const n of fingers) {
        const x = xForDt(n.t - now);
        const step = midiToStep((openMidis?.[n.s] ?? 40) + n.f);
        const y = stepToY(step, bottomY, ls);
        const up = step < 4; // the stem rule in drawNotationNotes
        // Opposite the stem; baselines chosen so the digit's visual center
        // lands ~ls·1.3 from the head center on either side.
        ctx.fillText(String(n.fg), x, up ? y + ls * 1.7 : y - ls * 0.95);
      }
      ctx.textAlign = 'left';
    }
  }

  // ── Playhead ──────────────────────────────────────────────────────────
  /** @param {CanvasRenderingContext2D} ctx @param {number} notH @param {number} bottomY @param {number} ls */
  function drawNotationPlayhead(ctx, notH, bottomY, ls) {
    const x = xForDt(0), staffTop = bottomY - ls*4;
    ctx.strokeStyle = t.playhead; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, staffTop-22); ctx.lineTo(x, notH-4); ctx.stroke();
    ctx.fillStyle = t.playhead;
    ctx.beginPath(); ctx.moveTo(x-5,staffTop-24); ctx.lineTo(x+5,staffTop-24); ctx.lineTo(x,staffTop-16); ctx.closePath(); ctx.fill();
  }

  // ── Tab section (only used if mode != 'notation'; currently always
  //    'notation' since the sub-toggle was removed, but kept for safety.) ──
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now */
  function drawTabSection(ctx, bundle, now) {
    const { tabTop, tabH } = tabLayout();
    const nStr = Math.max(1, bundle.stringCount || 6);
    const openMidis = bundle.openMidis || null;
    const topLane = tabLaneY(nStr-1, nStr, tabTop, tabH);
    const botLane = tabLaneY(0,       nStr, tabTop, tabH);
    for (let s = 0; s < nStr; s++) {
      const y = tabLaneY(s, nStr, tabTop, tabH);
      ctx.strokeStyle = t.faintLine; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(LEFT_PAD-4, y); ctx.lineTo(W-RIGHT_PAD, y); ctx.stroke();
      ctx.fillStyle = t.inkSoft; ctx.font = '600 11px "Cambria","Georgia",serif';
      const label = openMidis ? stringLabelForMidi(openMidis[s]) : `S${s+1}`;
      ctx.textAlign = 'right'; ctx.fillText((s===nStr-1&&label==='E')?'e':label, LEFT_PAD-10, y+4); ctx.textAlign = 'left';
    }
    ctx.fillStyle = t.dim; ctx.font = 'italic 700 11px "Cambria","Georgia",serif'; ctx.textAlign = 'right';
    ctx.fillText('TAB', LEFT_PAD-2, tabTop+tabH*0.5); ctx.textAlign = 'left';
    for (const b of bundle.beats || []) {
      if (b.measure < 0) continue;
      const dt = b.time - now; if (dt < -BEHIND || dt > AHEAD) continue;
      const x = xForDt(dt);
      ctx.strokeStyle = t.faintLine; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, topLane); ctx.lineTo(x, botLane); ctx.stroke();
    }
    for (const n of bundle.notes || []) {
      const dt = n.t - now; if (dt < -BEHIND || dt > AHEAD) continue;
      const x = xForDt(dt), y = tabLaneY(n.s, nStr, tabTop, tabH);
      const fretText = n.mt ? 'x' : String(n.f);
      const pw = Math.max(14, fretText.length*8+4);
      ctx.fillStyle = t.bg; ctx.fillRect(x-pw/2, y-7, pw, 14);
      ctx.fillStyle = t.ink; ctx.font = '700 12px ui-monospace,monospace'; ctx.textAlign = 'center';
      ctx.fillText(fretText, x, y+5); ctx.textAlign = 'left';
    }
    const x = xForDt(0);
    ctx.strokeStyle = t.playhead; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, tabTop+4); ctx.lineTo(x, botLane+8); ctx.stroke();
  }

  // ── Chord names + section markers + HUD ──────────────────────────────
  // Plain italic chord names floating above the staff, no pill background
  // — matches the Tab renderer's typography.
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} notH */
  function drawChordNames(ctx, bundle, now, notH) {
    ctx.fillStyle = t.chordName; ctx.font = 'italic 600 13px "Cambria","Georgia",serif';
    ctx.textAlign = 'center';
    for (const ch of bundle.chords || []) {
      const dt = ch.t - now; if (dt < -BEHIND || dt > AHEAD) continue;
      const name = bundle.chordTemplates?.[ch.id]?.displayName || bundle.chordTemplates?.[ch.id]?.name || '';
      if (!name) continue;
      ctx.fillText(name, xForDt(dt), notH-12);
    }
    ctx.textAlign = 'left';
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now */
  function drawSectionMarkers(ctx, bundle, now) {
    ctx.fillStyle = t.sectionLabel; ctx.font = 'italic 600 11px "Cambria","Georgia",serif';
    ctx.textAlign = 'center';
    for (const sec of bundle.sections || []) {
      const dt = sec.time - now; if (dt < -BEHIND || dt > AHEAD) continue;
      ctx.fillText(sec.name||'·', xForDt(dt), H-6);
    }
    ctx.textAlign = 'left';
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} _now @param {number} notH */
  function drawHud(ctx, bundle, _now, notH) {
    // Title + clef only — the single timer lives in the player HUD (top-right).
    ctx.fillStyle = t.dim; ctx.font = 'italic 600 12px "Cambria","Georgia",serif';
    ctx.fillText(bundle.songInfo?.title||'Virtuoso', 8, 18);
    ctx.font = '600 10px "Cambria","Georgia",serif';
    ctx.fillText(isBass ? 'Bass Clef (8va)' : 'Treble Clef (8va)', 8, notH-6);
  }

  // ── Main draw ─────────────────────────────────────────────────────────
  /** @param {import('./renderer-types.js').RenderBundle} bundle */
  function draw(bundle) {
    if (!ctx || !bundle) return;
    resize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Beams leave round caps behind; bitmap resets used to restore this default.
    ctx.lineCap = 'butt';
    t = getRenderTheme();
    const now = bundle.currentTime || 0, openMidis = bundle.openMidis || null;
    // Beat-relative window (see Tab renderer): ~6.8 beats across the view at
    // any tempo for consistent, comfortable note density; constant within a
    // chart so the scroll speed is unchanged.
    const winBeat = chartBeatSeconds(bundle);
    AHEAD = Math.max(2.5, Math.min(6, winBeat * 5));
    BEHIND = Math.max(0.9, Math.min(2.2, winBeat * 1.8));
    const { notH, ls, bottomY } = staffLayout();
    const { tabTop, tabH } = tabLayout();
    // Reserve room for the clef + key signature so notes start clear of them.
    const nAcc = Math.min(Math.abs(numAcc), 7);
    contentLeft = (mode === 'tab')
      ? LEFT_PAD
      : Math.max(LEFT_PAD, Math.round(STAFF_LEFT + ls * 3.2 + nAcc * ls * 1.0 + ls * 1.6));
    drawBg(ctx, notH, tabTop, tabH);
    if (mode !== 'tab') {
      drawStaff(ctx, bottomY, ls);
      drawClef(ctx, bottomY, ls);
      drawKeySig(ctx, bottomY, ls);
      drawNotationBarLines(ctx, bundle, now, bottomY, ls);
      drawNotationRests(ctx, bundle, now, bottomY, ls);
      drawNotationNotes(ctx, bundle, now, bottomY, ls, openMidis);
      drawNotationHandMarks(ctx, bundle, now, bottomY, ls, openMidis);
      drawNotationPlayhead(ctx, notH, bottomY, ls);
      drawChordNames(ctx, bundle, now, notH);
    }
    if (mode !== 'notation') drawTabSection(ctx, bundle, now);
    drawSectionMarkers(ctx, bundle, now);
    drawHud(ctx, bundle, now, notH);
  }

  return {
    /** @param {HTMLCanvasElement} c @param {import('./renderer-types.js').RenderBundle} [bundle] */
    init(c, bundle) {
      canvas = c; ctx = c.getContext('2d'); resize(); window.addEventListener('resize', resize);
      handNotes = orderHandMarks(bundle?.notes || []);
      handSource = bundle?.notes;
      if (!bundle) return;
      /** @type {Partial<import('../../core/generation-types.js').GenerationConfig>} */
      const cfg = bundle.config || {};
      beatDur = 60 / (cfg.bpm || 120);
      const key = resolveNotationKey(cfg.key || 'C', cfg.scale || 'major');
      numAcc = key.numAcc; spellings = key.spellings;
      isFlats = numAcc < 0;
      ksAlter = keySigLetterAlter();
      isBass = bundle.songInfo?.arrangement === 'Bass' || (bundle.openMidis?.[0] ?? 40) < 36;
      beamGroups = buildBeamGroups(bundle.notes || []);
    },
    /** @param {string} m */
    setMode(m) { mode = m; },
    draw, resize,
    destroy() { window.removeEventListener('resize', resize); canvas = null; ctx = null; }
  };
}
