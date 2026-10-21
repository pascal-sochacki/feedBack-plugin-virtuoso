// ── Classic 2D Highway (host-parity MIRROR) ─────────────────────────────
// A faithful port of the host's "Classic 2D Highway" (Byron's) — the
// perspective falling-fret highway that is createHighway()'s private
// _defaultRenderer (static/highway.js + static/js/highway-{geometry,draw,
// state-primitives}.js). HOST CHECK 2026-07-10: that renderer is core,
// closure-fed + websocket-fed, and exposes no viz factory, so it can't be
// BORROWED — verdict MIRROR (issue got-feedBack/feedBack#835 asks the host to
// ship a bundle-driven feedBackViz_highway_2d, which would flip this to a
// pure borrow). This drives the `highway_2d` view slot; entry's horizontal-lane
// makeBuiltin2DRenderer stays the Jumping-Tab fallback + the >8-string path.
//
// Ported faithfully (constants + geometry lifted from the host source): the
// #080810 BG, the perspective project() (VISIBLE_SECONDS/Z_CAM/Z_MAX), the
// centered fretX() trapezoid, the fret lines, the beat sweep, the string
// palette (DEFAULT_STRING_COLORS/DIM/BRIGHT), the strike (now) line, the
// falling fret-number gems, and the amber fret-number rail with anchor
// highlight. Deliberate approximations (documented, not oversights): the
// exotic overlays our bundle doesn't feed (unison-bend connectors, strum-
// group brackets, master-difficulty phrase filtering, lyrics, chord frames)
// are omitted; and a CREDITED hit keeps Virtuoso's own green-gem grammar
// (#22c55e + glow — the cross-surface "a hit is unmistakable" guarantee from
// the 2026-07-09 tester fix) rather than the host's string-bright lit gem,
// so the hit stays as visible here as on our Tab/Notation surfaces.
/** @returns {import('./renderer-types.js').Renderer} */
export function makeClassic2DHighwayRenderer() {
  /** @type {HTMLCanvasElement | null} */
  let canvas = null;
  /** @type {CanvasRenderingContext2D | null} */
  let ctx = null;
  let W = 0, H = 0;
  /** @type {number | null} */
  let lastTime = null;
  let displayMaxFret = 12;
  const VISIBLE_SECONDS = 3.0, Z_CAM = 2.2, Z_MAX = 10.0, BG = '#080810';
  const SC = ['#cc0000','#cca800','#0066cc','#cc6600','#00cc66','#9900cc','#cc00aa','#00cccc'];
  const SDIM = ['#520000','#524200','#002952','#522900','#005229','#3d0052','#520042','#005252'];

  function resize() {
    if (!canvas) return;
    const box = canvas.parentElement || document.getElementById('virtuoso-render-host');
    const r = box ? box.getBoundingClientRect() : { width: canvas.width, height: canvas.height };
    W = Math.max(640, Math.round(r.width || 1280));
    H = Math.max(420, Math.round(r.height || 720));
    canvas.width = W; canvas.height = H;
  }
  // Perspective projection: fret plane recedes UP from the strike line at
  // y=0.82. Exact host math (highway-geometry.js project()).
  /** @param {number} tOff */
  function project(tOff) {
    if (tOff > VISIBLE_SECONDS || tOff < -0.05) return null;
    if (tOff < 0) return { y: 0.82 + Math.abs(tOff) * 0.3, scale: 1.0 };
    const z = tOff * (Z_MAX / VISIBLE_SECONDS), denom = z + Z_CAM;
    if (denom < 0.01) return null;
    const scale = Z_CAM / denom;
    return { y: 0.82 + (0.08 - 0.82) * (1.0 - scale), scale };
  }
  // Centered fret→x band (highway-state-primitives.js fretX()).
  /** @param {number} fret @param {number} scale */
  function fretX(fret, scale) {
    const hw = W * 0.52 * scale, margin = hw * 0.06, usable = hw * 2 - 2 * margin;
    return W / 2 - hw + margin + (fret / Math.max(1, displayMaxFret)) * usable;
  }
  /** @param {import('./renderer-types.js').RenderBundle} bundle */
  function anchorsOf(bundle) { return bundle.anchors && bundle.anchors.length ? bundle.anchors : null; }
  /** @param {import('./renderer-types.js').RenderBundle} bundle @param {number} t */
  function anchorAt(bundle, t) {
    const src = anchorsOf(bundle);
    if (!src) { let mf = 0; for (const n of bundle.notes || []) if (n.f > mf) mf = n.f; return { fret: 0, width: Math.max(4, mf) }; }
    let a = src[0] || { fret: 1, width: 4 };
    for (const anc of src) { if (anc.time > t) break; a = anc; }
    return a;
  }
  /** @param {import('./renderer-types.js').RenderBundle} bundle @param {number} t */
  function maxFretInWindow(bundle, t) {
    const src = anchorsOf(bundle);
    if (!src) { let mf = 0; for (const n of bundle.notes || []) if (n.f > mf) mf = n.f; return mf; }
    let mf = 0;
    for (const anc of src) {
      if (anc.time > t + VISIBLE_SECONDS + 2) break;
      if (anc.time + 2 < t) continue;
      const top = anc.fret + anc.width; if (top > mf) mf = top;
    }
    return mf;
  }
  /** @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {number} dt */
  function smoothFret(bundle, now, dt) {
    const a = anchorAt(bundle, now);
    const needed = Math.max(a.fret + a.width, maxFretInWindow(bundle, now));
    const target = Math.max(needed + 3, 8);
    displayMaxFret += (target - displayMaxFret) * Math.min(0.4 * dt, 0.4);
  }
  // Text stays left-to-right readable under the lefty mirror transform.
  /** @param {CanvasRenderingContext2D} ctx @param {string} txt @param {number} x @param {number} y @param {boolean} lefty */
  function textReadable(ctx, txt, x, y, lefty) {
    if (!lefty) { ctx.fillText(txt, x, y); return; }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillText(txt, W - x, y); ctx.restore();
  }

  /** @param {CanvasRenderingContext2D} ctx */
  function drawHighway(ctx) {
    const strips = 40;
    for (let i = 0; i < strips; i++) {
      const p0 = project((i / strips) * VISIBLE_SECONDS), p1 = project(((i + 1) / strips) * VISIBLE_SECONDS);
      if (!p0 || !p1) continue;
      const hw0 = W * 0.26 * p0.scale, hw1 = W * 0.26 * p1.scale, bright = 18 + 10 * p0.scale;
      ctx.fillStyle = `rgb(${bright | 0},${bright | 0},${(bright + 14) | 0})`;
      ctx.beginPath();
      ctx.moveTo(W / 2 - hw0, p0.y * H); ctx.lineTo(W / 2 + hw0, p0.y * H);
      ctx.lineTo(W / 2 + hw1, p1.y * H); ctx.lineTo(W / 2 - hw1, p1.y * H);
      ctx.fill();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  function drawFretLines(ctx) {
    const hi = Math.ceil(displayMaxFret);
    ctx.strokeStyle = '#2d2d45'; ctx.lineWidth = 1;
    for (let fret = 0; fret <= hi; fret++) {
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const p = project((i / 40) * VISIBLE_SECONDS); if (!p) continue;
        const x = fretX(fret, p.scale);
        if (i === 0) ctx.moveTo(x, p.y * H); else ctx.lineTo(x, p.y * H);
      }
      ctx.stroke();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now */
  function drawBeats(ctx, bundle, now) {
    for (const beat of bundle.beats || []) {
      const p = project(beat.time - now);
      if (!p || p.scale < 0.06) continue;
      const hw = W * 0.26 * p.scale, isMeasure = beat.measure >= 0;
      ctx.strokeStyle = isMeasure ? '#343450' : '#202038'; ctx.lineWidth = isMeasure ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(W / 2 - hw, p.y * H); ctx.lineTo(W / 2 + hw, p.y * H); ctx.stroke();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} nStr @param {boolean} inverted */
  function drawStrings(ctx, nStr, inverted) {
    const strTop = H * 0.83, strBot = H * 0.95, margin = W * 0.03, span = Math.max(1, nStr - 1);
    ctx.lineWidth = 3;
    for (let i = 0; i < nStr; i++) {
      const yi = inverted ? (nStr - 1 - i) : i, y = strTop + (yi / span) * (strBot - strTop);
      ctx.strokeStyle = SC[i] || '#888';
      ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); ctx.stroke();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  function drawNowLine(ctx) {
    const y = H * 0.82, hw = W * 0.26;
    for (let i = 1; i < 5; i++) {
      const a = Math.max(0, 70 - i * 15);
      ctx.strokeStyle = `rgba(${a},${a},${a + 8},1)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2 - hw, y - i); ctx.lineTo(W / 2 + hw, y - i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 - hw, y + i); ctx.lineTo(W / 2 + hw, y + i); ctx.stroke();
    }
    ctx.strokeStyle = '#dce0f0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2 - hw, y); ctx.lineTo(W / 2 + hw, y); ctx.stroke();
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {boolean} lefty */
  function drawFretNumbers(ctx, bundle, now, lefty) {
    const y = H * 0.97, hi = Math.ceil(displayMaxFret), a = anchorAt(bundle, now);
    ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let fret = 0; fret <= hi; fret++) {
      const inAnchor = fret >= a.fret && fret <= a.fret + a.width;
      ctx.fillStyle = inAnchor ? '#e8c040' : '#8a6830';
      textReadable(ctx, String(fret), fretX(fret, 1.0), y, lefty);
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now */
  function drawSustains(ctx, bundle, now) {
    for (const n of bundle.notes || []) {
      if (!(n.sus > 0)) continue;
      const p0 = project(Math.max(-0.05, n.t - now)), p1 = project(Math.max(-0.05, n.t + n.sus - now));
      if (!p0 && !p1) continue;
      const yTop = (p1 ? p1.y : 0.0) * H, yBot = (p0 ? p0.y : 0.82) * H, sc = p0 ? p0.scale : 1.0;
      const x = fretX(n.f, sc), w = Math.max(3, 10 * sc * (H / 900));
      ctx.strokeStyle = SDIM[n.s] || '#333'; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, Math.min(yBot, H * 0.82)); ctx.lineTo(fretX(n.f, p1 ? p1.scale : sc), yTop); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {import('./renderer-types.js').RenderNote} n @param {number} x @param {number} y @param {number} scale @param {boolean} lefty */
  function drawNote(ctx, bundle, n, x, y, scale, lefty) {
    const sz = Math.max(12, 80 * scale * (H / 900)), half = sz / 2, s = n.s;
    const st = bundle.getNoteState ? bundle.getNoteState(n) : null;
    const stState = st && (typeof st === 'string' ? st : st.state);
    const hit = stState === 'hit' || stState === 'active', miss = stState === 'miss';
    // Dead/muted note: hollow X (host draws an X marker; keep it simple).
    if (n.mt) {
      ctx.strokeStyle = SC[s] || '#888'; ctx.lineWidth = Math.max(2, sz / 8);
      ctx.beginPath(); ctx.moveTo(x - half * 0.6, y - half * 0.6); ctx.lineTo(x + half * 0.6, y + half * 0.6);
      ctx.moveTo(x + half * 0.6, y - half * 0.6); ctx.lineTo(x - half * 0.6, y + half * 0.6); ctx.stroke();
      return;
    }
    if (miss) ctx.globalAlpha = 0.5;
    // Open string: wide centered bar (host grammar).
    if (n.f === 0) {
      const hw = W * 0.26 * scale, barH = Math.max(6, sz * 0.45);
      ctx.fillStyle = SDIM[s] || '#222'; roundRectPath(ctx, W / 2 - hw - 1, y - barH / 2 - 1, hw * 2 + 2, barH + 2, 3); ctx.fill();
      if (hit) { ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 14; }
      ctx.fillStyle = hit ? '#22c55e' : (SC[s] || '#888'); roundRectPath(ctx, W / 2 - hw, y - barH / 2, hw * 2, barH, 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(8, sz * 0.5) | 0}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      textReadable(ctx, '0', W / 2, y, lefty);
      if (miss) ctx.globalAlpha = 1;
      return;
    }
    // Fretted gem: glow rect + body rounded rect + white fret number.
    ctx.fillStyle = hit ? '#166534' : (SDIM[s] || '#222');
    roundRectPath(ctx, x - half - 4, y - half - 4, sz + 8, sz + 8, sz / 3); ctx.fill();
    if (hit) { ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 14; }
    ctx.fillStyle = hit ? '#22c55e' : (SC[s] || '#888');
    roundRectPath(ctx, x - half, y - half, sz, sz, sz / 5); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(10, sz * 0.5) | 0}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    textReadable(ctx, String(n.f), x, y, lefty);
    // Technique glyph above (PM / h / p / ~ / accent) — small, host-adjacent.
    if (sz >= 14) {
      const g = n.pm ? 'PM' : n.ho ? 'H' : n.po ? 'P' : n.tp ? 'T' : n.tr ? '~' : '';
      if (g) { ctx.fillStyle = '#ffe08a'; ctx.font = `bold ${Math.max(9, sz * 0.3) | 0}px sans-serif`; textReadable(ctx, g, x, y - half - 6, lefty); }
    }
    if (miss) ctx.globalAlpha = 1;
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} w @param {number} h @param {number} r */
  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
  }
  /** @param {CanvasRenderingContext2D} ctx @param {import('./renderer-types.js').RenderBundle} bundle @param {number} now @param {boolean} lefty */
  function drawNotes(ctx, bundle, now, lefty) {
    // Far notes first so nearer (bigger) gems paint over them.
    const src = (bundle.notes || []).filter(n => { const dt = n.t - now; return dt <= VISIBLE_SECONDS && (dt > -0.05 || (n.sus > 0 && n.t + n.sus > now)); });
    src.sort((a, b) => b.t - a.t);
    for (const n of src) {
      let tOff = n.t - now, p;
      if (tOff < -0.05 && n.sus > 0 && n.t + n.sus > now) p = { y: 0.82, scale: 1.0 };
      else p = project(tOff);
      if (!p) continue;
      drawNote(ctx, bundle, n, fretX(n.f, p.scale), p.y * H, p.scale, lefty);
    }
  }

  /** @param {import('./renderer-types.js').RenderBundle} bundle */
  function draw(bundle) {
    if (!ctx || !bundle) return;
    resize();
    const now = bundle.currentTime || 0;
    const dt = lastTime == null ? 1 / 60 : Math.max(1 / 240, Math.min(0.1, now - lastTime));
    lastTime = now;
    smoothFret(bundle, now, dt);
    const nStr = Math.max(1, bundle.stringCount || 6), inverted = !!bundle.inverted, lefty = !!bundle.lefty;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (lefty) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    drawHighway(ctx);
    drawFretLines(ctx);
    drawBeats(ctx, bundle, now);
    drawStrings(ctx, nStr, inverted);
    drawSustains(ctx, bundle, now);
    drawNowLine(ctx);
    drawNotes(ctx, bundle, now, lefty);
    drawFretNumbers(ctx, bundle, now, lefty);
    ctx.restore();
  }

  return {
    init(c, bundle) { canvas = c; ctx = c.getContext('2d'); displayMaxFret = 12; lastTime = null; resize(); if (bundle) { const a = (bundle.anchors || [])[0]; if (a) displayMaxFret = Math.max(8, a.fret + a.width + 3); } window.addEventListener('resize', resize); },
    draw,
    resize,
    destroy() { window.removeEventListener('resize', resize); canvas = null; ctx = null; }
  };
}
