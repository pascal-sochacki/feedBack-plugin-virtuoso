// SPDX-License-Identifier: AGPL-3.0-only
import { BUILT_IN_SESSIONS } from '../content/workouts.js';
import { SEGMENT_TEMPLATES } from '../content/segments.js';
import { materializeSegment, segmentEstDuration, refreshWorkout } from '../core/segments.js';
import { lengthPresetSec } from '../core/workout-length.js';
import { materializeWorkoutConfig } from '../core/workout-config.js';
import { KIND_COLORS, KIND_LABELS } from './workout-display.js';

/** @typedef {import('../core/workout-config.js').WorkoutDraft} WorkoutDraft */
/** @typedef {import('../core/session-types.js').Segment} Segment */
/** @param {string} id */
const $ = id => document.getElementById(id);
/** @param {unknown} value */
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** @param {Event} event */
const target = event => /** @type {HTMLElement | null} */ (event.target);
/** @param {WorkoutDraft | null} session */
const hasRefs = session => !!(session && (session.segments || []).some(s => s && s.templateId && !s.kind));

/**
 * Drafts survive visits; DOM listeners do not. Preview is the only transport edge.
 * No storage/host reads occur during construction or import.
 * @param {(index: number) => Promise<void>} preview
 */
export function createWorkoutEditor(preview) {
  let selectedId = Object.keys(BUILT_IN_SESSIONS)[0];
  /** @type {WorkoutDraft | null} */
  let draft = null;
  /** @type {string | null} */
  let draftId = null;
  let dirty = false;
  /** @type {Array<() => void>} */
  let listeners = [];
  let visit = 0;
  let dragFrom = -1;
  /** @type {Set<'timeline' | 'options'>} */
  const mounted = new Set();

  /** @param {string} id */
  function cloneStarter(id) {
    const base = BUILT_IN_SESSIONS[/** @type {keyof typeof BUILT_IN_SESSIONS} */ (id)];
    return base ? JSON.parse(JSON.stringify(base)) : null;
  }
  function clearSummary() {
    const el = $('virtuoso-refresh-summary'); if (el) { el.hidden = true; el.innerHTML = ''; }
  }
  /** @param {string[]} lines */
  function showSummary(lines) {
    const el = $('virtuoso-refresh-summary'); if (!el) return;
    if (!lines.length) {
      el.innerHTML = `<span>Refreshed — nothing changed this pass.</span><button type="button" class="virtuoso-refresh-summary-close" aria-label="Dismiss" title="Dismiss">✕</button>`;
    } else {
      const shown = lines.slice(0, 2), more = lines.length - shown.length;
      el.innerHTML = `<span>Re-rolled — ${shown.join(' · ')}${more > 0 ? ` · +${more} more` : ''}</span><button type="button" class="virtuoso-refresh-summary-close" aria-label="Dismiss" title="Dismiss">✕</button>`;
    }
    el.hidden = false;
  }
  /** @param {Segment} seg @param {number} index */
  function cardHtml(seg, index) {
    const color = KIND_COLORS[seg.kind || ''] || '#94a3b8';
    const label = KIND_LABELS[seg.kind || ''] || seg.kind;
    const dur = segmentEstDuration(seg);
    const durStr = dur < 60 ? `~${Math.round(dur)}s` : `~${Math.floor(dur / 60)}m${Math.round(dur % 60)}s`;
    const cfg = seg.config || {};
    const parts = [];
    if (seg.kind === 'chromatic') {
      if (cfg.chromaticPattern) parts.push(`Pattern ${cfg.chromaticPattern}`);
      parts.push(`Frets ${cfg.fretMin ?? 1}–${cfg.fretMax ?? 4}`);
    } else if (cfg.key) {
      parts.push(`${cfg.key} ${(cfg.scale || 'major').replace(/_/g, ' ')}`);
    }
    if (cfg.shape && seg.kind !== 'chromatic') parts.push(`${cfg.shape}-shape`);
    if (cfg.progression && cfg.progression !== 'none' && ['chord_scales','guide_tones','progression_arpeggios'].includes(seg.kind || '')) parts.push(cfg.progression);
    if (seg.kind === 'guide_tones' && cfg.voices) parts.push(voiceLabel(cfg.voices));
    if (seg.kind === 'chord_scales' && cfg.chordScaleStrategy) {
      parts.push(cfg.chordScaleStrategy === 'chord_tone_emphasis' ? 'park'
        : (cfg.chordScaleStrategy === 'mode_of_moment_enclose' ? 'connect+enclose' : 'connect'));
    }
    if (cfg.bpm) parts.push(`${cfg.bpm} BPM`);
    if (cfg.bars) parts.push(`${cfg.bars} bars`);
    parts.push(durStr);
    const tmpl = seg.templateId ? SEGMENT_TEMPLATES[seg.templateId] : null;
    const canReroll = !!(tmpl && tmpl.vary && tmpl.vary.length > 1);
    const canRemove = (draft?.segments || []).length > 1;
    return `<div class="virtuoso-segment-card" data-kind="${esc(seg.kind)}" data-seg-index="${index}" draggable="true" title="Drag to reorder · click to preview from here">
      <div class="virtuoso-segment-header">
        <span class="virtuoso-segment-grip" data-act="grip" aria-hidden="true" title="Drag to reorder">⋮⋮</span>
        <span class="virtuoso-segment-badge" style="color:${color}">${esc(label)}</span>
        <span class="virtuoso-segment-name">${esc(seg.name || '')}</span>
        <button type="button" class="virtuoso-segment-menu-btn" data-act="menu" aria-label="Block actions" title="Block actions">⋯</button>
      </div>
      <div class="virtuoso-segment-meta">${esc(parts.join(' · '))}</div>
      <div class="virtuoso-segment-actions" hidden>
        <button type="button" data-act="dup" title="Add a copy of this block below">Duplicate</button>
        <button type="button" data-act="reroll"${canReroll ? '' : ' disabled'} title="${canReroll ? 'Re-roll just this block into a fresh variation' : 'This block has no variations to re-roll'}">↻ Re-roll</button>
        <button type="button" data-act="remove"${canRemove ? '' : ' disabled'} title="${canRemove ? 'Remove this block' : 'A workout needs at least one block'}">Remove</button>
      </div>
    </div>`;
  }
  function render() {
    const session = draft;
    const info = $('virtuoso-session-info'), list = $('virtuoso-segment-list');
    if (!info || !list) return;
    if (!session) { info.innerHTML = ''; list.innerHTML = ''; return; }
    // Raw indexes must survive unresolved refs so edit actions still address the draft.
    const materialized = (session.segments || []).map(materializeSegment);
    const displaySegs = materialized.filter(isSegment);
    const totalDur = displaySegs.reduce((s, seg) => s + segmentEstDuration(seg), 0);
    const bpms = displaySegs.map(s => s.config?.bpm).filter(isBpm);
    const bpmStr = bpms.length ? (Math.min(...bpms) === Math.max(...bpms) ? `${Math.min(...bpms)} BPM` : `${Math.min(...bpms)}–${Math.max(...bpms)} BPM`) : '';
    const presetSec = lengthPresetSec(session.lengthPreset);
    const durStr = presetSec ? `≈ ${Math.round(presetSec / 60)} min`
      : (totalDur < 60 ? `${Math.round(totalDur)}s` : `${Math.floor(totalDur / 60)}m ${Math.round(totalDur % 60)}s`);
    const lenSel = /** @type {HTMLSelectElement | null} */ ($('virtuoso-length-preset'));
    if (lenSel) lenSel.value = session.lengthPreset || '';
    const tags = (session.tags || []).join(', ');
    const longNote = displaySegs.length >= 10
      ? `<div class="virtuoso-session-longnote">That's a long set — every block can loop or be trimmed, and you never have to finish it all in one sitting.</div>`
      : '';
    info.innerHTML = `
      <div class="virtuoso-session-info-name">${session.name}</div>
      <div class="virtuoso-session-info-desc">${session.description || ''}</div>
      <div class="virtuoso-session-info-stats">
        <span class="virtuoso-session-info-stat">${displaySegs.length} segments</span>
        <span class="virtuoso-session-info-stat">${durStr}</span>
        ${bpmStr ? `<span class="virtuoso-session-info-stat">${bpmStr}</span>` : ''}
        ${tags ? `<span class="virtuoso-session-info-stat">${tags}</span>` : ''}
      </div>${longNote}`;
    list.innerHTML = materialized.map((m, i) => m ? cardHtml(m, i) : '').join('');
    const breathe = /** @type {HTMLInputElement | null} */ ($('virtuoso-breathe-toggle'));
    if (breathe) breathe.checked = (session.interBlockBreak || 'auto') !== 'off';
    const btn = /** @type {HTMLButtonElement | null} */ ($('virtuoso-workout-refresh'));
    if (btn) {
      const can = hasRefs(session);
      btn.disabled = !can;
      btn.title = can ? 'Re-roll every block into a fresh variation — same workout, new keys & positions'
                      : 'This workout’s blocks are fixed (no variations to re-roll)';
    }
  }
  /** @param {string} id @param {WorkoutDraft | null} value */
  function replace(id, value) {
    selectedId = id; draftId = id; draft = value ? JSON.parse(JSON.stringify(value)) : null; dirty = false;
    clearSummary(); render();
  }
  /** @param {string} id */
  function select(id) {
    selectedId = id;
    if (id !== draftId) { draft = cloneStarter(id); draftId = id; dirty = false; clearSummary(); }
    render();
  }
  function edited() { dirty = true; clearSummary(); render(); }
  /** @param {number} from @param {number | null} beforeIndex */
  function move(from, beforeIndex) {
    const segs = draft?.segments; if (!segs || from < 0 || from >= segs.length) return;
    const [moved] = segs.splice(from, 1);
    let to = (beforeIndex == null || beforeIndex < 0) ? segs.length : (beforeIndex > from ? beforeIndex - 1 : beforeIndex);
    to = Math.max(0, Math.min(to, segs.length));
    if (to === from && beforeIndex != null) { segs.splice(from, 0, moved); return; }
    segs.splice(to, 0, moved); edited();
  }
  /** @param {number} index */
  function duplicate(index) {
    const segs = draft?.segments; if (!segs || index < 0 || index >= segs.length) return;
    const clone = JSON.parse(JSON.stringify(segs[index]));
    if (clone.id) clone.id = clone.id + '__copy' + Date.now().toString(36).slice(-3);
    segs.splice(index + 1, 0, clone); edited();
  }
  /** @param {number} index */
  function remove(index) {
    const segs = draft?.segments; if (!segs || segs.length <= 1 || index < 0 || index >= segs.length) return;
    segs.splice(index, 1); edited();
  }
  /** @param {number | 'all'} scope */
  function reroll(scope) {
    if (!draft || !hasRefs(draft)) return;
    if (scope !== 'all') {
      const seg = draft.segments?.[scope];
      if (!(seg && seg.templateId && !seg.kind)) return;
      const tmpl = SEGMENT_TEMPLATES[seg.templateId];
      if (!tmpl?.vary || tmpl.vary.length <= 1) return;
    }
    const before = JSON.parse(JSON.stringify(draft));
    draft = refreshWorkout(draft, {scope}); dirty = true;
    showSummary(describeRefreshDiff(before, draft)); render();
  }
  /** @param {string} templateId @param {number | null} [atIndex] */
  function add(templateId, atIndex) {
    if (!SEGMENT_TEMPLATES[templateId] || !draft) return;
    const ref = {id:templateId + '__add' + Date.now().toString(36).slice(-3),templateId,variantIdx:0};
    const segs = draft.segments || (draft.segments = []);
    if (atIndex == null || atIndex < 0 || atIndex >= segs.length) segs.push(ref);
    else segs.splice(atIndex + 1, 0, ref);
    edited();
  }
  /** @param {HTMLElement} card */
  function toggleMenu(card) {
    const list = $('virtuoso-segment-list'); if (!list) return;
    const menu = card.querySelector('.virtuoso-segment-actions'); if (!(menu instanceof HTMLElement)) return;
    const willOpen = menu.hidden;
    list.querySelectorAll('.virtuoso-segment-actions').forEach(m => { if (m !== menu && m instanceof HTMLElement) m.hidden = true; });
    list.querySelectorAll('.virtuoso-segment-card.menu-open').forEach(c => { if (c !== card) c.classList.remove('menu-open'); });
    menu.hidden = !willOpen; card.classList.toggle('menu-open', willOpen);
  }
  function unmount() {
    visit++; dragFrom = -1;
    for (const removeListener of listeners) removeListener();
    listeners = [];
    mounted.clear();
    $('virtuoso-segment-list')?.querySelectorAll('.dragging, .drop-target').forEach(el => el.classList.remove('dragging','drop-target'));
  }
  /** @param {'timeline' | 'options'} section */
  function mount(section) {
    if (mounted.has(section)) return;
    mounted.add(section);
    // Entry binds these two clusters at their original boot positions.
    const identity = visit;
    /** @param {string} id @param {string} type @param {(event: Event) => void | Promise<void>} handler */
    function on(id, type, handler) {
      const el = $(id); if (!el) return;
      const fn = /** @param {Event} event */ event => { if (visit === identity) return handler(event); };
      el.addEventListener(type, fn); listeners.push(() => el.removeEventListener(type, fn));
    }
    if (section === 'options') {
      on('virtuoso-workout-refresh','click',() => {
        if (!draft || !hasRefs(draft)) return;
        reroll('all');
        const btn = $('virtuoso-workout-refresh');
        if (btn && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          btn.classList.remove('vir-refresh-tick'); void btn.offsetWidth; btn.classList.add('vir-refresh-tick');
        }
      });
      on('virtuoso-breathe-toggle','change',e => { if (draft) draft.interBlockBreak = /** @type {HTMLInputElement} */ (e.target).checked ? 'auto' : 'off'; });
      on('virtuoso-length-preset','change',e => { if (draft) { draft.lengthPreset = /** @type {HTMLSelectElement} */ (e.target).value || null; render(); } });
      on('virtuoso-refresh-summary','click',e => { if (target(e)?.closest('.virtuoso-refresh-summary-close')) clearSummary(); });
      return;
    }
    on('virtuoso-segment-list','click', async e => {
      const card = target(e)?.closest('.virtuoso-segment-card'); if (!card) return;
      const i = parseInt(/** @type {HTMLElement} */ (card).dataset.segIndex || '',10);
      const ctl = /** @type {HTMLButtonElement | null} */ (target(e)?.closest('[data-act]'));
      if (!ctl) { await preview(i); return; }
      if (ctl.dataset.act === 'menu') toggleMenu(/** @type {HTMLElement} */ (card));
      else if (ctl.dataset.act === 'dup') duplicate(i);
      else if (ctl.dataset.act === 'reroll' && !ctl.disabled) reroll(i);
      else if (ctl.dataset.act === 'remove' && !ctl.disabled) remove(i);
    });
    on('virtuoso-segment-list','dragstart',e => {
      const card = target(e)?.closest('.virtuoso-segment-card'); if (!card) return;
      dragFrom = parseInt(/** @type {HTMLElement} */ (card).dataset.segIndex || '',10);
      const transfer = /** @type {DragEvent} */ (e).dataTransfer;
      if (transfer) { transfer.effectAllowed = 'move'; try { transfer.setData('text/plain',String(dragFrom)); } catch (_) {} }
      card.classList.add('dragging');
    });
    on('virtuoso-segment-list','dragend',() => {
      dragFrom = -1;
      $('virtuoso-segment-list')?.querySelectorAll('.dragging, .drop-target').forEach(el => el.classList.remove('dragging','drop-target'));
    });
    on('virtuoso-segment-list','dragover',e => {
      if (dragFrom < 0) return;
      e.preventDefault(); const ev = /** @type {DragEvent} */ (e);
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
      const list = $('virtuoso-segment-list'); if (!list) return;
      const under = cardUnder(list,ev.clientY);
      list.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
      if (under != null) list.querySelector(`.virtuoso-segment-card[data-seg-index="${under}"]`)?.classList.add('drop-target');
    });
    on('virtuoso-segment-list','drop',e => {
      if (dragFrom < 0) return;
      e.preventDefault(); const list = $('virtuoso-segment-list'); if (!list) return;
      move(dragFrom,cardUnder(list,/** @type {DragEvent} */ (e).clientY)); dragFrom = -1;
    });
  }
  /** @param {import('../core/workout-config.js').WorkoutLaunchOptions} options */
  function launchConfig(options) {
    const id = selectedId || Object.keys(BUILT_IN_SESSIONS)[0];
    const base = BUILT_IN_SESSIONS[/** @type {keyof typeof BUILT_IN_SESSIONS} */ (id)]; if (!base) return null;
    if (!draft || draftId !== id) { draft = cloneStarter(id); draftId = id; }
    return materializeWorkoutConfig(draft || base,options);
  }
  return {get draft() {return draft;},get selectedId() {return selectedId;},get dirty() {return dirty;},select,replace,render,add,mount,unmount,launchConfig};
}

/** @param {Segment | null | undefined} seg @returns {seg is Segment} */
function isSegment(seg) { return !!seg; }
/** @param {number | undefined} bpm @returns {bpm is number} */
function isBpm(bpm) { return !!bpm; }
/** @param {HTMLElement} container @param {number} clientY */
function cardUnder(container, clientY) {
  for (const c of Array.from(container.querySelectorAll('.virtuoso-segment-card'))) {
    const box = c.getBoundingClientRect();
    if (clientY < box.top + box.height / 2) return parseInt(/** @type {HTMLElement} */ (c).dataset.segIndex || '',10);
  }
  return null;
}
/** @param {string | undefined} v */
function voiceLabel(v) { return ({thirds_only:'3rds',sevenths_only:'7ths',both_alternating:'3rds+7ths'})[v || ''] || v; }
/** @param {WorkoutDraft} before @param {WorkoutDraft} after */
function describeRefreshDiff(before, after) {
  const lines = [], a = before.segments || [], b = after.segments || [];
  /** @param {unknown} s */
  const pretty = s => String(s).replace(/_/g, ' ');
  for (let i = 0; i < Math.min(a.length,b.length); i++) {
    if (!a[i] || !a[i].templateId || a[i].kind) continue;
    if ((/** @type {number} */ (a[i].variantIdx) | 0) === (/** @type {number} */ (b[i].variantIdx) | 0)) continue;
    const ca = materializeSegment(a[i])?.config || {}, cb = materializeSegment(b[i])?.config || {};
    const tmpl = SEGMENT_TEMPLATES[/** @type {string} */ (a[i].templateId)];
    const label = tmpl?.label || a[i].id || `Block ${i + 1}`;
    const parts = [];
    if (cb.key && ca.key !== cb.key) parts.push(`key ${ca.key || '?'}→${cb.key}`);
    if (cb.shape && ca.shape !== cb.shape) parts.push(`${ca.shape || '?'}-shape→${cb.shape}-shape`);
    if (cb.progression && cb.progression !== 'none' && ca.progression !== cb.progression) parts.push(`${pretty(ca.progression || '?')}→${pretty(cb.progression)}`);
    if (cb.scale && ca.scale !== cb.scale) parts.push(`${pretty(ca.scale || '?')}→${pretty(cb.scale)}`);
    if (cb.chromaticPattern && ca.chromaticPattern !== cb.chromaticPattern) parts.push(`pattern ${ca.chromaticPattern || '?'}→${cb.chromaticPattern}`);
    const fA = (ca.fretMin != null || ca.fretMax != null) ? `${ca.fretMin ?? '?'}–${ca.fretMax ?? '?'}` : null;
    const fB = (cb.fretMin != null || cb.fretMax != null) ? `${cb.fretMin ?? '?'}–${cb.fretMax ?? '?'}` : null;
    if (fB && fA !== fB) parts.push(`frets ${fA || '?'}→${fB}`);
    if (cb.voices && ca.voices !== cb.voices) parts.push(`${voiceLabel(ca.voices)}→${voiceLabel(cb.voices)}`);
    if (cb.subdivision && ca.subdivision !== cb.subdivision) parts.push(`${pretty(ca.subdivision)}→${pretty(cb.subdivision)}`);
    if (cb.bendTarget != null && ca.bendTarget !== cb.bendTarget) parts.push(`bend ${ca.bendTarget ?? '?'}→${cb.bendTarget}`);
    if (cb.swing != null && ca.swing !== cb.swing) parts.push(`swing ${ca.swing ? 'on' : 'off'}→${cb.swing ? 'on' : 'off'}`);
    if (parts.length) lines.push(`<b>${label}</b> ${parts.join(' · ')}`);
  }
  return lines;
}
