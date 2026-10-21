// SPDX-License-Identifier: AGPL-3.0-only
import { PATHWAYS } from '../content/pathways.js';
import { practiceFormCue } from '../core/practice-form-cue.js';
import { compCellForConfig, COMP_GROOVES } from '../core/comp-cells.js';
import { bassFigureForConfig, BASS_FIGURES } from '../core/bass-figures.js';
import { STRING_SETUPS, TUNING_PRESETS, openMidisForConfig } from '../core/instrument-tuning.js';
import { midiToFreq } from '../core/pitch.js';
import { isShapeAwareSystem } from '../core/fretboard-shapes.js';
import { CHROMATIC_PATTERN_LABELS } from '../core/builders/chromatic.js';
import { STYLE_PALETTES } from '../core/style-palettes.js';

/** @typedef {{label: string, goal?: string, tempoTiers?: number[], formCues?: string[], vary?: Record<string, unknown>[], practiceFile?: import('../core/practice-files.js').Practice}} PresentationPathway */
/** The binding is readonly; catalog hydration and metadata remain live and mutable. @type {Record<string, PresentationPathway>} */
const pathways = PATHWAYS;
/** @type {Record<string, {label: string, midis: number[]}[]>} */
const tunings = TUNING_PRESETS;

/**
 * @typedef {Object} CurrentPractice
 * @property {string | null} pathwayId
 * @property {number} tierIndex
 * @property {number} variationIndex
 * @property {string | null} bandId
 * @property {ReturnType<import('./practice-config.js').readConfig> | null} cfg
 * @property {number | null} bestBpm
 * @property {boolean} proveClean
 * @property {{stringSetup: string, midis: number[] | null} | null} instrument
 * @property {number} detectorMinHz
 * @property {string} concertKey
 * @property {import('../core/practice-files.js').Practice | null} practiceFile
 * @property {string | null} practiceVariantId
 * @property {boolean} playing
 * @property {boolean} paused
 * @property {boolean} jamMode
 * @property {string} jamIntent
 * @property {{practiceFile?: unknown, sessionName?: string, practiceFileVariantTitle?: string, bpm?: number, referenceTempo?: number, jamStyle?: string, key?: string} | null} session
 */
/** @param {string} id */
const $ = id => typeof document === 'undefined' ? null : document.getElementById(id);
/** @param {string} id @param {string | null} text */
function line(id, text) {
  const el = $(id);
  if (!el) return;
  el.textContent = text || '';
  el.style.display = text ? '' : 'none';
}
/** @param {{getCurrentPractice: (view: 'goal' | 'position' | 'start' | 'description' | 'file', pathwayId?: string | null) => CurrentPractice}} dependencies */
export function createPracticePresentation({getCurrentPractice}) {
  /** @param {CurrentPractice} state */
  function renderStart(state) {
    const cta = $('virtuoso_lab-start-cta');
    if (!cta) return;
    const pw = state.pathwayId && state.pathwayId !== 'custom' ? pathways[state.pathwayId] : null;
    const verb = $('virtuoso_lab-start-verb'), name = $('virtuoso_lab-start-name'), skill = $('virtuoso_lab-start-skill');
    if (verb) verb.textContent = state.playing && !state.paused ? '⏸ PAUSE' : state.paused ? '▶ RESUME' : '▶ START';
    if (name) name.textContent = pw ? pw.label : 'this exercise';
    if (skill) {
      const seg = pw?.goal ? pw.goal.split(/[—:.]/)[0].trim() : '';
      skill.textContent = seg.length > 52 ? seg.slice(0, 50).trim() + '…' : seg;
    }
    cta.classList.toggle('playing', !!state.playing);
    cta.classList.toggle('paused', !!(state.playing && state.paused));
  }
  /** @param {string | null} pathwayId @param {boolean} [modified] @param {{name?: string, id?: string}} [favoritePreset] */
  function renderGoal(pathwayId, modified, favoritePreset) {
    const card = $('virtuoso_lab-pathway-goal-card');
    if (!card) return;
    const tag = $('virtuoso_lab-pathway-tag'), title = $('virtuoso_lab-pathway-title'), goal = $('virtuoso_lab-pathway-goal');
    if (favoritePreset) {
      if (title) title.textContent = favoritePreset.name || favoritePreset.id || 'Favorite';
      if (goal) goal.textContent = 'Saved preset.';
      const more = $('virtuoso_lab-goal-more'); if (more) more.style.display = 'none';
      if (tag) tag.textContent = 'Favorite';
      card.classList.remove('modified');
      return;
    }
    const state = getCurrentPractice('goal', pathwayId), cfg = state.cfg;
    const pw = pathwayId ? pathways[pathwayId] : null;
    if (pw) {
      if (title) title.textContent = pw.label || pathwayId;
      // Recognition stays visible; authored prose and hints stay plain text in disclosure.
      const full = pw.goal || '', match = full.match(/^(.*?[.!?])\s+(.+)$/s);
      if (goal) goal.textContent = match ? match[1] : full;
      const rest = $('virtuoso_lab-pathway-goal-rest');
      if (rest) {
        const practice = pw.practiceFile, pathway = practice?.pathway;
        const variation = pathway?.variations[state.variationIndex], tier = pathway?.tiers[state.tierIndex];
        if (practice && (!variation || !tier)) throw new Error('Unknown pathway variation or tier');
        const hint = practice?.variants.find(variant => variant.id === variation.charts[state.tierIndex])?.hint;
        rest.textContent = [match ? match[2].trim() : '', hint].filter(Boolean).join('\n\n');
      }
      if (tag) tag.textContent = modified ? 'Modified' : 'Goal';
      card.classList.toggle('modified', !!modified);
    }
    const best = pw && state.bestBpm;
    const next = best && pw?.tempoTiers?.find(t => t > best);
    line('virtuoso_lab-pathway-pb', best ? next ? `Your clean best here: ${best} BPM — beat it (next rung at ${next})` : `Your clean best here: ${best} BPM — the top rung is yours` : null);
    const off = parseInt(/** @type {HTMLInputElement | null} */ ($('virtuoso_lab-tuning-offset'))?.value || '0', 10) || 0;
    const station = /** @type {HTMLInputElement | null} */ ($('virtuoso_lab-anchor-station'))?.value || '';
    const concertKey = state.concertKey;
    let tuning = null;
    if (pw && station) {
      let subFloor = false;
      try {
        if (cfg) {
          const opens = openMidisForConfig({...cfg, customOpenMidis:cfg.customOpenMidis || undefined}), fret = station === 'open' ? 0 : parseInt(station.replace('fret ', ''), 10) || 0;
          subFloor = midiToFreq((opens[0] || 40) + fret) < state.detectorMinHz;
        }
      } catch (_) {}
      tuning = (station === 'open' ? `Anchored on your open lowest string — that's ${concertKey} on your instrument.` : `Pedal at ${station} of your lowest string — that's ${concertKey} on your instrument.`)
        + (subFloor ? ' This register sits below what the mic can track — graded by your ears and the click.' : '');
    } else if (pw && off !== 0) {
      const inst = state.instrument, setup = inst && STRING_SETUPS[inst.stringSetup];
      const preset = inst && (tunings[`${setup?.instrument}_${setup?.openMidis.length || 0}`] || [])
        .find(p => inst.midis && p.midis.length === inst.midis.length && p.midis.every((x,i) => x === inst.midis?.[i]));
      const name = preset ? preset.label.replace(/\s*\(.*\)$/, '') : 'your tuning';
      const steps = Math.abs(off) === 1 ? 'a half step' : Math.abs(off) === 2 ? 'a whole step' : `${Math.abs(off)} semitones`;
      tuning = `Charted for your ${name} — same frets, sounds ${steps} ${off < 0 ? 'down' : 'up'} (key of ${concertKey}).`;
    }
    line('virtuoso_lab-pathway-tuning-note', tuning);
    let cue = null;
    if (pw && pathwayId && cfg) { try { cue = practiceFormCue(pathwayId, pw, state.tierIndex, cfg, state.bandId); } catch (_) {} }
    line('virtuoso_lab-pathway-form-cue', cue ? 'Form · ' + cue : null);
    let backing = null;
    try {
      if (cfg) {
        // The legacy generation contract excludes nullable form shapes, although
        // backing selection never reads them. Preserve the actual cfg unchanged.
        const backingCfg = /** @type {import('../core/generation-types.js').GenerationConfig} */ (/** @type {unknown} */ (cfg));
        const cid = compCellForConfig(backingCfg), fid = bassFigureForConfig(backingCfg), parts = [];
        if (cid && COMP_GROOVES[cid]) parts.push(COMP_GROOVES[cid].label);
        if (fid && BASS_FIGURES[fid]) parts.push(BASS_FIGURES[fid].label);
        backing = parts.length ? parts.join(' + ') : cfg.backingDensity === 0 ? 'click only' : null;
      }
    } catch (_) {}
    line('virtuoso_lab-pathway-backing-note', backing && pw ? 'Backing · ' + backing : null);
    const prove = $('virtuoso_lab-prove-clean'); if (prove) prove.style.display = pw && state.proveClean ? '' : 'none';
    const more = $('virtuoso_lab-goal-more');
    if (more) more.style.display = ['virtuoso_lab-pathway-goal-rest','virtuoso_lab-pathway-tuning-note','virtuoso_lab-pathway-form-cue','virtuoso_lab-pathway-backing-note'].some(id => ($(id)?.textContent || '').trim()) ? '' : 'none';
    renderStart(state);
  }
  function renderPosition() {
    const row = $('virtuoso_lab-position-row'), label = $('virtuoso_lab-position-label'), select = $('virtuoso_lab-shape'), readout = $('virtuoso_lab-position-readout');
    if (!row || !label || !select || !readout) return;
    const state = getCurrentPractice('position'), pw = state.pathwayId && state.pathwayId !== 'custom' ? pathways[state.pathwayId] : null;
    if (positionStepperIsShapeMode()) {
      row.classList.remove('no-variations'); label.textContent = 'Position'; select.hidden = false; readout.hidden = true; return;
    }
    select.hidden = true;
    const length = pw?.vary?.length || 0;
    if (!pw || length < 2) { row.classList.add('no-variations'); readout.hidden = true; return; }
    row.classList.remove('no-variations');
    const axis = variationAxisLabel(pw), idx = ((state.variationIndex % length) + length) % length;
    label.textContent = axis === 'Variation' ? 'Change' : axis;
    readout.hidden = false;
    readout.textContent = `${variationValueLabel(pw, idx, axis)} (${idx + 1}/${length})`;
  }
  function describe() {
    const state = getCurrentPractice('description'), session = state.session;
    if (session?.practiceFile) return `File practice — ${session.sessionName} · ${session.practiceFileVariantTitle} · ${session.bpm} BPM (reference ${session.referenceTempo})`;
    // Jam describes the active bundle, never the leftover drill form.
    if (state.jamMode && session?.jamStyle && STYLE_PALETTES[session.jamStyle]) return `Jam — ${STYLE_PALETTES[session.jamStyle].label} in ${session.key} · ${session.bpm} BPM` + (state.jamIntent ? ` · ${state.jamIntent}` : '');
    const cfg = state.cfg; if (!cfg) return '';
    if (cfg.mode === 'chromatic') return `Chromatic ${CHROMATIC_PATTERN_LABELS[cfg.chromaticPattern] || cfg.chromaticPattern}, frets ${cfg.fretMin}–${cfg.fretMax}`;
    return `${cfg.key} ${String(cfg.scale || '').replace(/_/g, ' ')}, frets ${cfg.fretMin}–${cfg.fretMax}`;
  }
  function renderFile() {
    const prose = $('virtuoso_lab-file-prose'), unload = $('virtuoso_lab-file-unload'), variants = $('virtuoso_lab-file-variants');
    const select = /** @type {HTMLSelectElement | null} */ ($('virtuoso_lab-file-variant')), next = /** @type {HTMLButtonElement | null} */ ($('virtuoso_lab-file-next')), hint = $('virtuoso_lab-file-hint');
    if (!prose && !unload && !variants && !select && !next && !hint) return;
    const {practiceFile:practice, practiceVariantId} = getCurrentPractice('file');
    if (prose) displayPracticeProse(prose, practice);
    if (unload) unload.hidden = !practice;
    if (variants) variants.hidden = !practice;
    if (select) {
      select.replaceChildren();
      for (const variant of practice?.variants || []) {
        const option = document.createElement('option');
        option.value = variant.id; option.textContent = variant.title; select.appendChild(option);
      }
      select.value = practiceVariantId || ''; select.disabled = !practice;
    }
    if (next) next.disabled = !practice;
    if (hint) hint.textContent = practice?.variants.find(variant => variant.id === practiceVariantId)?.hint || '';
  }
  return {renderGoal, renderPosition, renderFile, renderStart:() => { if ($('virtuoso_lab-start-cta')) renderStart(getCurrentPractice('start')); }, describe};
}
/** Prose is deliberately plain text: HTML, links and Markdown never execute.
 * @param {{textContent: string | null}} element @param {import('../core/practice-files.js').Practice | null} practice */
export function displayPracticeProse(element, practice) {
  element.textContent = practice ? `${practice.title}\nReference tempo: ${practice.referenceTempo} BPM · ${practice.meter} · guitar standard six-string\n\n${practice.prose}` : '';
}
export function positionStepperIsShapeMode() {
  const systemEl = /** @type {HTMLSelectElement | null} */ ($('virtuoso_lab-fretboard-system'));
  const system = systemEl ? systemEl.value : 'caged';
  const shape = /** @type {HTMLSelectElement | null} */ ($('virtuoso_lab-shape'));
  return !$('virtuoso_lab-root')?.classList.contains('virtuoso_lab-bass-instrument') && isShapeAwareSystem(system) && !!shape && shape.options.length > 1;
}
/** @param {PresentationPathway} pw */
function variationAxisLabel(pw) {
  const vary = pw.vary || []; if (vary.length < 2) return 'Variation';
  /** @param {string} field */
  const changes = field => new Set(vary.map(v => v[field])).size > 1;
  for (const [field,axis] of [['voices','Voicing'],['inversion','Inversion'],['progression','Progression'],['scale','Scale']]) if (changes(field)) return axis;
  if (changes('sequence') || changes('chromaticPattern')) return 'Pattern';
  if (changes('swing')) return 'Feel'; if (changes('key')) return 'Key'; return 'Variation';
}
/** @param {PresentationPathway} pw @param {number} idx @param {string} axis */
function variationValueLabel(pw, idx, axis) {
  if (pw.practiceFile?.pathway) return pw.practiceFile.pathway.variations[idx].title;
  const v = pw.vary?.[idx] || {};
  switch (axis) {
    case 'Voicing': return typeof v.voices === 'string' && v.voices ? v.voices.replace(/_/g,' ') : `#${idx+1}`;
    case 'Inversion': return v.inversion != null ? `Inv ${v.inversion}` : `#${idx+1}`;
    case 'Progression': return v.progression || `#${idx+1}`;
    case 'Scale': return typeof v.scale === 'string' && v.scale ? v.scale.replace(/_/g,' ') : `#${idx+1}`;
    case 'Pattern': return v.chromaticPattern || v.sequence || `#${idx+1}`;
    case 'Feel': return v.swing || `#${idx+1}`;
    case 'Key': return v.key || `#${idx+1}`;
    default: return `Variation ${idx+1}`;
  }
}
