// SPDX-License-Identifier: AGPL-3.0-only
import { RENDER_THEMES, chartBeatSeconds, stringLabelForMidi, bendLabel, rhGlyph } from './display-policy.js';
import { orderHandMarks, selectHandMarks } from './hand-marks.js';

// MIRROR local display only: no standalone general host Tab factory (2026-10-20).
/** @param {import('./renderer-types.js').DisplayPreferences} preferences
 * @returns {import('./renderer-types.js').Renderer} */
export function makeBuiltin2DTabRenderer({ getRenderTheme, handMarksOn }) {
  // Standard guitar-tab look: paper background, string lines, fret numbers
  // sitting on the strings with the line broken behind each number, plain
  // bar lines, chord names above the staff, HOPO arcs, slides and bends as
  // inline glyphs. The display palette stays fixed to the light presentation.
  /** @type {HTMLCanvasElement | null} */
  let canvas = null;
  /** @type {CanvasRenderingContext2D | null} */
  let ctx = null;
  let W = 0, H = 0;
  let dpr = 1;
  /** @type {{from: import('./renderer-types.js').RenderNote, to: import('./renderer-types.js').RenderNote, isHo: boolean}[]} */
  let hopoPairs = [];
  /** @type {import('./renderer-types.js').RenderNote[]} */
  let handNotes = [];
  /** @type {import('./renderer-types.js').RenderNote[] | undefined} */
  let handSource;
  let t = RENDER_THEMES.light;  // refreshed at the top of each draw()
  const LEFT_PAD = 56, RIGHT_PAD = 20;
  let AHEAD = 5, BEHIND = 1.5;  // view window (seconds); set per draw, beat-relative
  const BAR_LEAD = 13;          // px the bar line sits left of its downbeat note

  function resize() {
    if (!canvas) return;
    const r = /** @type {HTMLElement} */ (canvas.parentElement).getBoundingClientRect();
    W = Math.max(640, Math.round(r.width || 1280));
    H = Math.max(280, Math.round(r.height || 480));
    dpr = window.devicePixelRatio || 1;
    const width = Math.round(W * dpr), height = Math.round(H * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  }
  /** @param {number} nStr */
  function staffMetrics(nStr) {
    // Staff occupies the vertical center with comfortable padding.
    // Lane gap stays in a readable range regardless of canvas size.
    const gap = Math.max(14, Math.min(22, Math.floor(H / (nStr + 6))));
    const staffH = gap * (nStr - 1);
    const top = Math.floor((H - staffH) / 2);
    return { gap, top, bottom: top + staffH };
  }
  /** @param {number} s @param {number} nStr @param {number} top @param {number} gap */
  function laneY(s, nStr, top, gap) {
    // s=0 is low E (lowest pitch); standard tab puts low E at the bottom,
    // high e at the top — so map s=0 → bottom, s=nStr-1 → top.
    return top + (nStr - 1 - s) * gap;
  }
  /** @param {number} dt */
  function xForDt(dt) {
    return LEFT_PAD + ((dt + BEHIND) / (AHEAD + BEHIND)) * (W - LEFT_PAD - RIGHT_PAD);
  }
  /** @param {import('./renderer-types.js').RenderNote[]} notes */
  function preprocess(notes) {
    hopoPairs = [];
    const sorted = [...notes].sort((a, b) => a.t - b.t);
    for (let i = 0; i < sorted.length; i++) {
      if (!sorted[i].ho && !sorted[i].po) continue;
      for (let j = i - 1; j >= 0; j--) {
        if (sorted[j].s === sorted[i].s) {
          hopoPairs.push({ from: sorted[j], to: sorted[i], isHo: !!sorted[i].ho });
          break;
        }
      }
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  function drawBackground(ctx) {
    ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H);
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} nStr @param {number} top @param {number} gap @param {number[] | null} openMidis */
  function drawStaff(ctx, nStr, top, gap, openMidis) {
    ctx.strokeStyle = t.ink; ctx.lineWidth = 1;
    for (let s = 0; s < nStr; s++) {
      const y = laneY(s, nStr, top, gap);
      ctx.beginPath(); ctx.moveTo(LEFT_PAD, y); ctx.lineTo(W - RIGHT_PAD, y); ctx.stroke();
    }
    // Left-edge string-tuning labels (e.g. e B G D A E).
    ctx.fillStyle = t.ink; ctx.font = '600 11px "Cambria","Georgia",serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let s = 0; s < nStr; s++) {
      const y = laneY(s, nStr, top, gap);
      const label = openMidis ? stringLabelForMidi(openMidis[s]) : `S${s+1}`;
      const display = (s === nStr - 1 && label === 'E') ? 'e' : label;
      ctx.fillText(display, LEFT_PAD - 8, y);
    }
    ctx.textBaseline = 'alphabetic';
    // "TAB" letter stack at the left, mimicking a clef position.
    const midY = (top + (top + gap * (nStr - 1))) / 2;
    ctx.fillStyle = t.ink; ctx.font = 'italic 700 18px "Cambria","Georgia",serif';
    ctx.textAlign = 'center';
    ctx.fillText('T', LEFT_PAD - 28, midY - gap * 0.9);
    ctx.fillText('A', LEFT_PAD - 28, midY + gap * 0.2);
    ctx.fillText('B', LEFT_PAD - 28, midY + gap * 1.3);
    ctx.textAlign = 'left';
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} nStr @param {number} top @param {number} gap */
  function drawBarLines(ctx, bundle, now, nStr, top, gap) {
    const yTop = laneY(nStr - 1, nStr, top, gap);
    const yBot = laneY(0, nStr, top, gap);
    ctx.strokeStyle = t.ink; ctx.fillStyle = t.dim;
    for (const b of bundle.beats || []) {
      const dt = b.time - now;
      if (dt < -BEHIND || dt > AHEAD) continue;
      // Bar line sits just left of the downbeat so the downbeat note lands
      // after it — standard tab (notes lie between bar lines, not on them).
      const x = xForDt(dt) - BAR_LEAD;
      if (b.measure >= 0) {
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBot); ctx.stroke();
        ctx.font = '10px "Cambria","Georgia",serif';
        ctx.fillText(String(b.measure), x + 3, yTop - 6);
      }
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} top @param {number} gap @param {number} nStr */
  function drawPlayhead(ctx, top, gap, nStr) {
    const x = xForDt(0);
    const yTop = laneY(nStr - 1, nStr, top, gap);
    const yBot = laneY(0, nStr, top, gap);
    ctx.strokeStyle = t.playhead; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, yTop - 14); ctx.lineTo(x, yBot + 8); ctx.stroke();
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} top */
  function drawChordNames(ctx, bundle, now, top) {
    ctx.fillStyle = t.chordName; ctx.font = 'italic 600 13px "Cambria","Georgia",serif';
    ctx.textAlign = 'center';
    for (const ch of bundle.chords || []) {
      const dt = ch.t - now;
      if (dt < -BEHIND || dt > AHEAD) continue;
      const name = bundle.chordTemplates?.[ch.id]?.displayName || bundle.chordTemplates?.[ch.id]?.name || '';
      if (!name) continue;
      ctx.fillText(name, xForDt(dt), top - 16);
    }
    ctx.textAlign = 'left';
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} top @param {number} gap @param {number} nStr */
  function drawSectionMarkers(ctx, bundle, now, top, gap, nStr) {
    const yBot = laneY(0, nStr, top, gap);
    ctx.fillStyle = t.sectionLabel; ctx.font = 'italic 600 11px "Cambria","Georgia",serif';
    ctx.textAlign = 'center';
    for (const sec of bundle.sections || []) {
      const dt = sec.time - now;
      if (dt < -BEHIND || dt > AHEAD) continue;
      ctx.fillText(sec.name || '·', xForDt(dt), yBot + 22);
    }
    ctx.textAlign = 'left';
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} now @param {number} nStr @param {number} top @param {number} gap */
  function drawHopoPairs(ctx, now, nStr, top, gap) {
    ctx.strokeStyle = t.hopo; ctx.fillStyle = t.hopo;
    for (const p of hopoPairs) {
      const dtFrom = p.from.t - now, dtTo = p.to.t - now;
      if (dtFrom < -BEHIND - 0.1 || dtTo > AHEAD + 0.1 || p.from.s !== p.to.s) continue;
      const x1 = xForDt(dtFrom), x2 = xForDt(dtTo);
      const y = laneY(p.from.s, nStr, top, gap);
      const arcH = Math.min(10, Math.max(5, (x2 - x1) * 0.25));
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x1, y - 6);
      ctx.quadraticCurveTo((x1 + x2) / 2, y - 6 - arcH, x2, y - 6); ctx.stroke();
      ctx.font = 'italic 600 9px "Cambria","Georgia",serif'; ctx.textAlign = 'center';
      ctx.fillText(p.isHo ? 'h' : 'p', (x1 + x2) / 2, y - 6 - arcH - 2);
      ctx.textAlign = 'left';
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} x2 */
  function drawSustainTie(ctx, x, y, x2) {
    // A short horizontal tie line on the string, drawn in ink with the
    // string line still visible beneath — minimal styling.
    ctx.strokeStyle = t.ink; ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y); ctx.stroke();
    ctx.setLineDash([]);
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderNote} n
   * @param {string | {state: string} | null} st @param {number} x @param {number} y @param {number} fontSize */
  function paintFret(ctx, n, st, x, y, fontSize) {
      const fretText = n.mt ? 'x' : String(n.f);
      // "Erase" the string line behind the fret number so the digit reads cleanly.
      ctx.font = `700 ${fontSize}px ui-monospace,"Consolas","Courier New",monospace`;
      const tw = ctx.measureText(fretText).width;
      // Hit paint ("the ink commits" — 2026-06-06 feel panel, UX spec): a
      // credited note's erase-box becomes a FILLED ink chip with the digit
      // knocked out in bg (inverted video — the strongest mono-ink signal,
      // theme-free); a missed note's ink fades to dim ("the ink didn't
      // take"). Exempt/unjudged notes draw plain — silence never reads as a
      // miss. State comes from the same hook the highway gems read; it is
      // null outside a scored run and always null in Jam (mirror rule).
      if (st === 'hit' || st === 'active') {
        // credited hit → GREEN tile + glow (matches the highway/host green-hit
        // grammar; the number stays readable in the tile's bg color).
        ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x - tw/2 - 3, y - fontSize/2 - 2, tw + 6, fontSize + 4, 3);
        else ctx.rect(x - tw/2 - 3, y - fontSize/2 - 2, tw + 6, fontSize + 4);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = t.bg;
      } else {
        ctx.fillStyle = t.bg; ctx.fillRect(x - tw/2 - 2, y - fontSize/2 - 1, tw + 4, fontSize + 2);
        ctx.fillStyle = st === 'miss' ? (t.inkSoft || t.dim) : t.ink;
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(fretText, x, y);
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
       ctx.fillStyle = t.ink;
       return tw;
  }

  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderNote} n
   * @param {number} x @param {number} y @param {number} tw @param {number} fontSize @param {number} gap */
  function paintTechniques(ctx, n, x, y, tw, fontSize, gap) {
      // Slide indicator: small "/" or "\" after the fret number.
      if ((n.sl ?? -1) >= 0 && !n.mt) {
        const ch = /** @type {number} */ (n.sl) > n.f ? '/' : '\\';
        ctx.font = `600 ${fontSize}px "Cambria","Georgia",serif`;
        ctx.fillStyle = t.ink; ctx.fillText(ch, x + tw/2 + 3, y + 3);
      }
      // Bend — caret + label above the note.
      if ((n.bn || 0) > 0 && !n.mt) {
        ctx.font = '600 9px "Cambria","Georgia",serif'; ctx.fillStyle = t.bend;
        ctx.textAlign = 'center';
        ctx.fillText(`b ${bendLabel(/** @type {number} */ (n.bn))}`, x, y - gap * 0.6);
        ctx.textAlign = 'left';
      }
      // Palm-mute bracket above the note.
      if (n.pm) {
        ctx.strokeStyle = t.ink; ctx.lineWidth = 1;
        const px = x, py = y - gap * 0.5;
        ctx.beginPath(); ctx.moveTo(px - 4, py + 4); ctx.lineTo(px - 4, py); ctx.lineTo(px + 4, py); ctx.lineTo(px + 4, py + 4); ctx.stroke();
        ctx.fillStyle = t.ink; ctx.font = '600 8px "Cambria","Georgia",serif';
        ctx.textAlign = 'center'; ctx.fillText('P.M.', px, py - 2); ctx.textAlign = 'left';
      }
      // Vibrato / tremolo glyph above the note.
      if (n.vb || n.tr) {
        ctx.fillStyle = t.ink; ctx.font = `600 ${fontSize}px "Cambria","Georgia",serif`;
        ctx.textAlign = 'center';
        ctx.fillText(n.tr ? '≈' : '~', x, y - gap * 0.55);
        ctx.textAlign = 'left';
      }
      // Harmonic: angle-brackets around the fret number — redraw with brackets.
      if ((n.hm || n.hp) && !n.mt) {
        ctx.fillStyle = t.ink; ctx.font = `700 ${fontSize}px "Cambria","Georgia",serif`;
        ctx.textAlign = 'center';
        ctx.fillText('〈', x - tw/2 - 3, y + 4);
        ctx.fillText('〉', x + tw/2 + 3, y + 4);
        ctx.textAlign = 'left';
      }
      // Pinch harmonic gets a "P.H." label above the bracketed fret.
      if (n.hp && !n.mt) {
        ctx.fillStyle = t.ink; ctx.font = '600 8px "Cambria","Georgia",serif';
        ctx.textAlign = 'center'; ctx.fillText('P.H.', x, y - gap * 0.55); ctx.textAlign = 'left';
      }
      // Tap — "T" above the note (tapping technique).
      if (n.tp && !n.mt) {
        ctx.fillStyle = t.ink; ctx.font = '700 10px "Cambria","Georgia",serif';
        ctx.textAlign = 'center'; ctx.fillText('T', x, y - gap * 0.6); ctx.textAlign = 'left';
      }
      // Accent — ">" above the note.
      if (n.ac && !n.mt) {
        ctx.fillStyle = t.ink; ctx.font = '800 11px "Cambria","Georgia",serif';
        ctx.textAlign = 'center'; ctx.fillText('>', x, y - gap * 0.9); ctx.textAlign = 'left';
      }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} nStr @param {number} top @param {number} gap */
  function drawNotes(ctx, bundle, now, nStr, top, gap) {
    ctx.fillStyle = t.ink;
    const fontSize = Math.max(11, Math.min(14, gap - 4));
    for (const n of bundle.notes || []) {
      const dt = n.t - now;
      if (dt < -BEHIND || dt > AHEAD) continue;
      const x = xForDt(dt), y = laneY(n.s, nStr, top, gap);
      const st = bundle.getNoteState ? bundle.getNoteState(n) : null;
      const tw = paintFret(ctx, n, st, x, y, fontSize);
      if (n.sus !== undefined && (n.sus || 0) > 0 && !n.mt) {
        const x2 = Math.min(W - RIGHT_PAD, xForDt(dt + n.sus));
        drawSustainTie(ctx, x + tw/2 + 3, y, x2);
      }
      paintTechniques(ctx, n, x, y, tw, fontSize, gap);
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle */
  function drawHud(ctx, bundle) {
    // Title only — the single timer lives in the player HUD (top-right).
    ctx.fillStyle = t.dim; ctx.font = 'italic 600 12px "Cambria","Georgia",serif';
    ctx.fillText(bundle.songInfo?.title || 'Virtuoso', 12, 18);
  }
  // Hand-marks lanes (hand-marks Slice 1; UX engraving spec): pick strokes in
  // a FIXED lane above the staff (⊓ down / ∨ up, canvas strokes, mono ink),
  // fret-hand fingers in a fixed lane below (subordinate gray; fg 0 omitted in
  // tab — the fret digit 0 already says open). MANDATORY simile decimation:
  // at dense spacing, strokes thin to phrase starts + alternation BREAKS (the
  // economy/sweep event — exactly the information); fingers thin to shifts
  // and string crossings. Published fast passages are engraved the same way.
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} nStr @param {number} top @param {number} gap */
  function drawHandMarks(ctx, bundle, now, nStr, top, gap) {
    if (!handMarksOn()) return;
    if (handSource !== bundle.notes) {
      handSource = bundle.notes;
      handNotes = orderHandMarks(handSource || []);
    }
    const pxPerSec = (W - LEFT_PAD - RIGHT_PAD) / (AHEAD + BEHIND);
    const {strokes, fingers, hasStrokes, hasFingers} = selectHandMarks(handNotes, bundle, now, BEHIND, AHEAD, pxPerSec, false);
    // Stroke lane: pick glyphs (⊓/∨) AND/OR pluck-finger letters (p-i-m-a-c,
    // the bass/classical convention — hand-marks Slice 2). Exclusive per note
    // (the pkd/rh guard); the decimation "break" generalizes: for pkd a
    // repeated stroke = the economy/sweep event, for rh a repeated finger =
    // the RAKE — both are exactly the information, so both stay visible.
    if (hasStrokes) {
      const yPick = top - gap * 1.35;
      ctx.strokeStyle = t.ink; ctx.lineWidth = 1.25;
      for (const n of strokes) {
        const x = xForDt(n.t - now);
        if (n.rh != null) {
          ctx.fillStyle = t.ink; ctx.font = 'italic 600 10px "Cambria","Georgia",serif'; ctx.textAlign = 'center';
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
      const yFing = top + (nStr - 1) * gap + gap * 0.85;
      ctx.fillStyle = t.inkSoft || t.dim; ctx.font = '600 9px "Cambria","Georgia",serif'; ctx.textAlign = 'center';
      for (const n of fingers) {
        ctx.fillText(String(n.fg), xForDt(n.t - now), yFing);
      }
      ctx.textAlign = 'left';
    }
  }
  /** @param {import('./renderer-types.js').RenderBundle} bundle */
  function draw(bundle) {
    if (!ctx || !bundle) return;
    resize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    t = getRenderTheme();
    const now = bundle.currentTime || 0, nStr = Math.max(1, bundle.stringCount || 6);
    // Beat-relative window: ~6.8 beats across the view at any tempo, so note
    // density (≈ px per beat) stays comfortable and consistent — fast tempos
    // no longer cram. Constant within a chart → scroll speed unchanged.
    const winBeat = chartBeatSeconds(bundle);
    AHEAD = Math.max(2.5, Math.min(6, winBeat * 5));
    BEHIND = Math.max(0.9, Math.min(2.2, winBeat * 1.8));
    const { gap, top } = staffMetrics(nStr);
    drawBackground(ctx);
    drawHud(ctx, bundle);
    drawChordNames(ctx, bundle, now, top);
    drawStaff(ctx, nStr, top, gap, bundle.openMidis || null);
    drawBarLines(ctx, bundle, now, nStr, top, gap);
    drawHopoPairs(ctx, now, nStr, top, gap);
    drawNotes(ctx, bundle, now, nStr, top, gap);
    drawHandMarks(ctx, bundle, now, nStr, top, gap);
    drawSectionMarkers(ctx, bundle, now, top, gap, nStr);
    drawPlayhead(ctx, top, gap, nStr);
  }
  return {
    /** @param {HTMLCanvasElement} c @param {import('./renderer-types.js').RenderBundle} [bundle] */
    init(c, bundle) {
      canvas = c; ctx = c.getContext('2d'); resize(); window.addEventListener('resize', resize);
      handNotes = orderHandMarks(bundle?.notes || []);
      handSource = bundle?.notes;
      if (bundle?.notes) preprocess(bundle.notes);
    },
    draw, resize,
    destroy() { window.removeEventListener('resize', resize); canvas = null; ctx = null; }
  };
}
