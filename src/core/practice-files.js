// SPDX-License-Identifier: AGPL-3.0-only
import { parseMeter, secondsPerDivision } from './timing.js';

// Packaging security inventory, not a second lesson catalog.
export const PRACTICE_ASSET_PATHS = [
  "guitar/beginner/chromatic-warmup.md",
  "guitar/beginner/chromatic-warmup-ladder.md",
  "guitar/pathways/file-pulse_muting.md",
  "guitar/pathways/file-pent_foundation.md",
  "guitar/pathways/file-power_chord_comping.md",
  "guitar/pathways/file-blues_foundation.md",
  "guitar/pathways/file-bend_drill.md",
  "guitar/pathways/file-core_root_third_fifth.md",
  "guitar/pathways/file-major_scale_caged.md",
  "guitar/pathways/file-sixteenth_pocket.md",
  "guitar/pathways/file-dorian_groove.md",
  "guitar/pathways/file-chord_tone_targeting.md",
  "guitar/pathways/file-modal_awareness.md",
  "guitar/pathways/file-diatonic_triad_drill.md",
  "guitar/pathways/file-seventh_vocab.md",
  "guitar/pathways/file-whole_neck_freedom.md",
  "guitar/pathways/file-guide_tones_path.md",
  "guitar/pathways/file-ii_V_I_workout.md",
  "guitar/pathways/file-modal_vamp.md",
  "guitar/pathways/file-melmin_exotic_12key.md",
  "guitar/pathways/file-harmonic_minor_exotic.md",
  "guitar/pathways/file-sweep_arpeggio_primer.md",
  "guitar/pathways/file-blues_box.md",
  "guitar/pathways/file-blues_shuffle.md",
  "guitar/pathways/file-blues_bends.md",
  "guitar/pathways/file-blues_call_response.md",
  "guitar/pathways/file-blues_mix.md",
  "guitar/pathways/file-blues_turnaround.md",
  "guitar/pathways/file-blues_turnaround_build.md",
  "guitar/pathways/file-major_pent_country.md",
  "guitar/pathways/file-country_cowboy_changes.md",
  "guitar/pathways/file-country_double_stops.md",
  "guitar/pathways/file-country_chicken_pickin.md",
  "guitar/pathways/file-country_pedal_bends.md",
  "guitar/pathways/file-country_train.md",
  "guitar/pathways/file-melodic_metal_gallop.md",
  "guitar/pathways/file-metal_lead_changes.md",
  "guitar/pathways/file-metal_lead_phrygian.md",
  "guitar/pathways/file-melodeath_twin_leads.md",
  "guitar/pathways/file-rock_power_backbeat.md",
  "guitar/pathways/file-rock_pentatonic.md",
  "guitar/pathways/file-rock_lead_vocab.md",
  "guitar/pathways/file-rock_pedal_riff.md",
  "guitar/pathways/file-rock_classic_changes.md",
  "guitar/pathways/file-chord_cowboy.md",
  "guitar/pathways/file-chord_caged_shapes.md",
  "guitar/pathways/file-chord_barre_changes.md",
  "guitar/pathways/file-chord_caged_progression.md",
  "guitar/pathways/file-chord_sevenths.md",
  "guitar/pathways/file-chord_diatonic_7ths.md",
  "guitar/pathways/file-chord_color_extensions.md",
  "guitar/pathways/file-triad_inversions.md",
  "guitar/pathways/file-triad_five_shapes.md",
  "guitar/pathways/file-triads_over_changes.md",
  "guitar/pathways/file-triad_pairs.md",
  "guitar/pathways/file-arp_seventh_shapes.md",
  "guitar/pathways/file-arp_inversions.md",
  "guitar/pathways/file-arp_over_changes.md",
  "guitar/pathways/file-arp_sweeps.md",
  "guitar/pathways/file-vl_shells.md",
  "guitar/pathways/file-vl_guide_tones.md",
  "guitar/pathways/file-vl_guide_changes.md",
  "guitar/pathways/file-vl_connect.md",
  "guitar/pathways/file-fb_one_box.md",
  "guitar/pathways/file-fb_caged_links.md",
  "guitar/pathways/file-fb_position_shifts.md",
  "guitar/pathways/file-fb_3nps.md",
  "guitar/pathways/file-fb_whole_neck.md",
  "guitar/pathways/file-diatonic_intervals.md",
  "guitar/pathways/file-int_sixths.md",
  "guitar/pathways/file-int_across_neck.md",
  "guitar/pathways/file-int_mixed.md",
  "guitar/pathways/file-exp_vibrato.md",
  "guitar/pathways/file-exp_bend_half.md",
  "guitar/pathways/file-exp_bend_whole.md",
  "guitar/pathways/file-exp_bend_mixed.md",
  "guitar/pathways/file-rhy_subdivision.md",
  "guitar/pathways/file-rhy_sixteenth.md",
  "guitar/pathways/file-rhy_swing.md",
  "guitar/pathways/file-rhy_displacement.md",
  "guitar/pathways/file-rhy_gallop_snap.md",
  "guitar/pathways/file-rhy_accent_displace.md",
  "guitar/pathways/file-rhy_single_string.md",
  "guitar/pathways/file-rhy_half_double.md",
  "guitar/pathways/file-rhy_trade_bars.md",
  "guitar/pathways/file-pick_tremolo.md",
  "guitar/pathways/file-pick_alternate.md",
  "guitar/pathways/file-pick_chromatic_16ths.md",
  "guitar/pathways/file-pick_economy.md",
  "guitar/pathways/file-pick_string_skip.md",
  "guitar/pathways/file-pick_hybrid.md",
  "guitar/pathways/file-pick_herta.md",
  "guitar/pathways/file-leg_hopo.md",
  "guitar/pathways/file-leg_runs.md",
  "guitar/pathways/file-sweep3_triad.md",
  "guitar/pathways/file-sweep5_box.md",
  "guitar/pathways/file-sweep_roll_apex.md",
  "guitar/pathways/file-sweep7_color.md",
  "guitar/pathways/file-sweep_changes.md",
  "guitar/pathways/file-tap_articulation.md",
  "guitar/pathways/file-tap_cell.md",
  "guitar/pathways/file-tap_cascade.md",
  "guitar/pathways/file-tap_sevenths.md",
  "guitar/pathways/file-tap_changes.md",
  "guitar/pathways/file-fs_pima_foundation.md",
  "guitar/pathways/file-fs_spider_adjacent.md",
  "guitar/pathways/file-fs_spider_skip.md",
  "guitar/pathways/file-fs_spider_wide.md"
];

/** @typedef {{t:number, s:number, f:number, sus:number, fg?:number, pkd?:number}} PracticeNote */
/** @typedef {{id:string, title:string, hint?:string, duration:number, notes:PracticeNote[]}} PracticeVariant */
/** @typedef {{id:string, title:string, instrument:string, tuning:string, meter:string, referenceTempo:number, prose:string, variants?:PracticeVariant[], pathway?:Record<string, any>}} Practice */

/** @param {unknown} value @param {number} min @param {number} max */
function number(value, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error('Invalid practice number');
  return value;
}
/** @param {unknown} value @returns {Record<string, any>} */
function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected practice object');
  return /** @type {Record<string, any>} */ (value);
}
/** @param {Record<string, any>} value @param {string[]} allowed */
function keys(value, allowed) {
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new Error('Unsupported practice field or technique');
}
/** @param {unknown} value */
export function validatePracticeIndex(value) {
  const index = object(value);
  keys(index, ['practices']);
  if (!Array.isArray(index.practices)) throw new Error('Invalid practice index');
  const entries = index.practices.map(raw => {
    const item = object(raw);
    keys(item, ['id', 'title', 'path', 'use', 'instAgnostic']);
    slug(item.id); plainText(item.title, 120);
    if (!PRACTICE_ASSET_PATHS.includes(item.path) || !['custom', 'pathway'].includes(item.use)) throw new Error('Unknown practice index entry');
    if (item.instAgnostic !== undefined && typeof item.instAgnostic !== 'boolean') throw new Error('Invalid pathway applicability');
    return { id:item.id, title:item.title, path:item.path, use:item.use, ...(item.instAgnostic ? {instAgnostic:true} : {}) };
  });
  if (new Set(entries.map(item => item.id)).size !== entries.length || new Set(entries.map(item => item.path)).size !== entries.length) throw new Error('Duplicate practice index entry');
  return entries;
}

/** @param {unknown} value */
function slug(value) {
  if (typeof value !== 'string' || value.length > 64 || !/^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/.test(value)) throw new Error('Invalid practice id');
}
/** @param {unknown} value @param {number} max */
function plainText(value, max) {
  // eslint-disable-next-line no-control-regex -- Titles and hints must reject ASCII control characters.
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) throw new Error('Invalid practice title or hint');
}
/** @param {unknown} value @returns {PracticeVariant} */
function validateVariant(value) {
  const variant = object(value);
  keys(variant, ['id', 'title', 'hint', 'duration', 'notes']);
  slug(variant.id);
  plainText(variant.title, 120);
  if (variant.hint !== undefined) plainText(variant.hint, 500);
  number(variant.duration, 0.01, 600);
  if (!Array.isArray(variant.notes) || !variant.notes.length || variant.notes.length > 4096) throw new Error('Invalid practice notes');
  let previousOnset = -1, previousEnd = 0;
  const notes = variant.notes.map(raw => {
    const note = object(raw);
    keys(note, ['t', 's', 'f', 'sus', 'fg', 'pkd']);
    number(note.t, 0, 600); number(note.sus, 0, 600);
    number(note.s, 0, 5); number(note.f, 0, 24);
    if (!Number.isInteger(note.s) || !Number.isInteger(note.f)) throw new Error('String and fret must be integers');
    if (note.t <= previousOnset || note.t < previousEnd) throw new Error('Only ordered, non-overlapping single notes are supported (no chords)');
    previousOnset = note.t; previousEnd = note.t + note.sus;
    if (previousEnd > variant.duration) throw new Error('Duration must cover every note sustain');
    if (note.fg !== undefined) {
      number(note.fg, 0, 4);
      if (!Number.isInteger(note.fg) || (note.f === 0 ? note.fg !== 0 : note.fg === 0)) throw new Error('Invalid fret-hand finger');
    }
    if (note.pkd !== undefined && note.pkd !== 0 && note.pkd !== 1) throw new Error('Invalid pick stroke');
    return /** @type {PracticeNote} */ ({ ...note });
  });
  if (variant.duration <= previousOnset) throw new Error('Duration must extend past the final onset');
  return /** @type {PracticeVariant} */ ({ ...variant, notes });
}

/** @param {unknown} value @param {PracticeVariant[]} variants */
function validatePathwayMetadata(value, variants) {
  const pathway = object(value);
  keys(pathway, ['goal', 'formCues', 'base', 'tiers', 'variations']);
  plainText(pathway.goal, 2000);
  if (!Array.isArray(pathway.formCues) || !pathway.formCues.length) throw new Error('Invalid pathway form cues');
  pathway.formCues.forEach(slug);
  const base = object(pathway.base);
  keys(base, ['practiceType', 'chromaticPattern', 'strokePolicy', 'meter', 'subdivision', 'bpm', 'bars', 'direction', 'advancedMode', 'fretboardSystem', 'stringSetup', 'renderer', 'fretMin', 'fretMax']);
  if (base.practiceType !== 'chromatic' || base.strokePolicy !== 'alternate' || base.meter !== '4/4' ||
      base.direction !== 'up_down' || base.advancedMode !== false || base.fretboardSystem !== 'position' ||
      base.stringSetup !== 'guitar_6_standard' || !['highway_3d', 'highway_2d', 'builtin_2d', 'tab_2d', 'notation_2d'].includes(base.renderer)) throw new Error('Unsupported pathway config');
  /** @param {unknown} raw */
  const validateFrame = raw => {
    const frame = object(raw);
    if (!['1234','4321','1324','1342'].includes(frame.chromaticPattern)) throw new Error('Unsupported chromatic pattern');
    number(frame.fretMin, 1, 21); number(frame.fretMax, 4, 24);
    if (!Number.isInteger(frame.fretMin) || frame.fretMax !== frame.fretMin + 3) throw new Error('Invalid chromatic frame');
  };
  validateFrame(base);
  if (!Array.isArray(pathway.tiers) || pathway.tiers.length !== 4) throw new Error('Four pathway tiers required');
  let previousBpm = 0;
  for (const raw of pathway.tiers) {
    const tier = object(raw); keys(tier, ['bpm', 'subdivision', 'bars']);
    number(tier.bpm, 30, 260); number(tier.bars, 1, 32);
    if (!Number.isInteger(tier.bars) || tier.bpm <= previousBpm || !['quarter','eighth'].includes(tier.subdivision)) throw new Error('Invalid pathway tier');
    previousBpm = tier.bpm;
  }
  const first = pathway.tiers[0];
  if (base.bpm !== first.bpm || base.bars !== first.bars || base.subdivision !== first.subdivision || first.bpm / 60 * (first.subdivision === 'eighth' ? 2 : 1) > 2.4) throw new Error('Invalid beginner entry tier');
  if (!Array.isArray(pathway.variations) || !pathway.variations.length || pathway.variations.length > 16) throw new Error('Invalid pathway variations');
  const ids = new Set(), references = new Set();
  for (const raw of pathway.variations) {
    const variation = object(raw); keys(variation, ['id', 'title', 'config', 'charts']);
    slug(variation.id); plainText(variation.title, 120);
    if (ids.has(variation.id)) throw new Error('Duplicate pathway variation');
    ids.add(variation.id);
    keys(object(variation.config), ['chromaticPattern','fretMin','fretMax']); validateFrame(variation.config);
    if (!Array.isArray(variation.charts) || variation.charts.length !== pathway.tiers.length) throw new Error('Invalid tier chart mapping');
    for (const chartId of variation.charts) {
      slug(chartId);
      if (!variants.some(variant => variant.id === chartId)) throw new Error('Unknown pathway chart reference');
      references.add(chartId);
    }
  }
  if (references.size !== variants.length) throw new Error('Unreferenced pathway chart');
}

const PATHWAY_CONFIG_KEYS = ['practiceType','scale','meter','subdivision','bpm','bars','direction','sequence','advancedMode','fretboardSystem','stringSetup','renderer','progression','chordDepth','chordOverride','drums','backingStyle','swing','audioProfile','key','fretMin','fretMax','chordScaleStrategy','shape','voices','bendTarget','motifCell','motifPhase','harmonize','rfoPattern','walkApproach','rhTechMode','pulseAccent','pulseOffbeat','anchor','anchorFret','chromaticPattern','walkFeel','strokePolicy','hertaAccent','hertaWalk','sweepStrings','tapArp','pimaPattern','voicingPosition','spiderPair','strumPattern','shapeWalk','backingComp','backingBass','tremolo','customOpenMidis'];

/** @param {unknown} value */
function validateGeneratedPathway(value) {
  const pathway = object(value);
  keys(pathway, ['goal','scales','formCues','base','vary','tempoTiers','tempoTierSubdivs','tempoTierBars','instAgnostic']);
  plainText(pathway.goal, 2000);
  for (const field of ['scales','formCues']) {
    if (pathway[field] === undefined && field === 'formCues') continue;
    if (!Array.isArray(pathway[field]) || (field === 'formCues' && !pathway[field].length)) throw new Error(`Invalid pathway ${field}`);
    pathway[field].forEach((/** @type {unknown} */ item) => { if (field === 'formCues') slug(item); else slug(item); });
  }
  if (pathway.instAgnostic !== undefined && typeof pathway.instAgnostic !== 'boolean') throw new Error('Invalid pathway applicability');
  const config = (/** @type {unknown} */ raw) => {
    const result = object(raw);
    keys(result, PATHWAY_CONFIG_KEYS);
    for (const [key, item] of Object.entries(result)) {
      if (!['string','number','boolean'].includes(typeof item) || (typeof item === 'number' && !Number.isFinite(item))) throw new Error(`Invalid pathway config value: ${key}`);
    }
    return result;
  };
  const base = config(pathway.base);
  if (base.stringSetup !== 'guitar_6_standard' || base.meter !== '4/4' || typeof base.practiceType !== 'string') throw new Error('Unsupported generated pathway config');
  if (!Array.isArray(pathway.vary) || !pathway.vary.length || pathway.vary.length > 16) throw new Error('Invalid pathway variations');
  pathway.vary.forEach(config);
  if (!Array.isArray(pathway.tempoTiers) || pathway.tempoTiers.length < 2 || pathway.tempoTiers.length > 8) throw new Error('Invalid pathway tempo tiers');
  let previous = 0;
  for (const bpm of pathway.tempoTiers) {
    number(bpm, 30, 260);
    if (!Number.isInteger(bpm) || bpm <= previous) throw new Error('Invalid pathway tempo tiers');
    previous = bpm;
  }
  if (pathway.tempoTierSubdivs !== undefined) {
    if (!Array.isArray(pathway.tempoTierSubdivs) || pathway.tempoTierSubdivs.length !== pathway.tempoTiers.length || pathway.tempoTierSubdivs.some((/** @type {unknown} */ item) => !['whole','half','quarter','eighth','triplet','sixteenth','sixteenth_triplet','thirtysecond'].includes(String(item)))) throw new Error('Invalid pathway subdivisions');
  }
  if (pathway.tempoTierBars !== undefined) {
    if (!Array.isArray(pathway.tempoTierBars) || pathway.tempoTierBars.length !== pathway.tempoTiers.length) throw new Error('Invalid tempoTierBars');
    pathway.tempoTierBars.forEach((/** @type {unknown} */ item) => number(item, 1, 64));
  }
}

/** File-owned metadata adapts to the existing mutable Ladder registry.
 * @param {Practice} input */
export function practicePathwayEntry(input) {
  const practice = validatePractice(input), pathway = practice.pathway;
  if (!pathway) throw new Error('Practice is not a Ladder lesson');
  if (!practice.variants) return { label:practice.title, goal:pathway.goal, scales:pathway.scales.slice(), ...(pathway.formCues ? {formCues:pathway.formCues.slice()} : {}), ...(pathway.instAgnostic ? {instAgnostic:true} : {}),
    tempoTiers:pathway.tempoTiers.slice(), ...(pathway.tempoTierSubdivs ? {tempoTierSubdivs:pathway.tempoTierSubdivs.slice()} : {}),
    ...(pathway.tempoTierBars ? {tempoTierBars:pathway.tempoTierBars.slice()} : {}), base:{ ...pathway.base }, vary:pathway.vary.map((/** @type {Record<string, any>} */ variation) => ({ ...variation })) };
  return { label:practice.title, goal:pathway.goal, scales:[], practiceFile:practice, formCues:pathway.formCues.slice(),
    tempoTiers:pathway.tiers.map((/** @type {Record<string, any>} */ tier) => tier.bpm), tempoTierSubdivs:pathway.tiers.map((/** @type {Record<string, any>} */ tier) => tier.subdivision),
    tempoTierBars:pathway.tiers.map((/** @type {Record<string, any>} */ tier) => tier.bars), base:{ ...pathway.base },
    vary:pathway.variations.map((/** @type {Record<string, any>} */ variation) => ({ ...variation.config })) };
}

/** @param {Practice} input @param {number} variationIndex @param {number} tierIndex */
export function practicePathwaySelection(input, variationIndex, tierIndex) {
  const practice = validatePractice(input), pathway = practice.pathway;
  if (!pathway || !Number.isInteger(variationIndex) || !Number.isInteger(tierIndex)) throw new Error('Invalid pathway selection');
  const variation = pathway.variations[variationIndex], tier = pathway.tiers[tierIndex];
  if (!variation || !tier) throw new Error('Unknown pathway variation or tier');
  return { ...pathway.base, ...variation.config, ...tier, practiceFile:practice,
    practiceVariantId:variation.charts[tierIndex], practicePathwayId:practice.id, practicePathwayVariationId:variation.id,
    practicePathwayTierIndex:tierIndex };
}

/** Pedagogical identity/density, not a performance judge.
 * @param {Record<string, any>} cfg @param {Practice} practice */
export function practicePathwayCredit(cfg, practice) {
  const pathway = practice.pathway;
  if (!pathway || !practice.variants || cfg.practicePathwayId !== practice.id) return null;
  const variation = pathway.variations.find((/** @type {Record<string, any>} */ item) => item.id === cfg.practicePathwayVariationId);
  const index = cfg.practicePathwayTierIndex, tier = pathway.tiers[index];
  if (!Number.isInteger(index) || !variation || !tier || variation.charts[index] !== cfg.practiceVariantId ||
      cfg.subdivision !== tier.subdivision || cfg.bars !== tier.bars || cfg.practiceType !== pathway.base.practiceType) return null;
  const chart = practice.variants.find(item => item.id === cfg.practiceVariantId);
  const step = secondsPerDivision({bpm:practice.referenceTempo, subdivision:tier.subdivision});
  if (!chart || chart.notes.some((note, i) => Math.abs(note.t - i * step) > 0.000001) ||
      chart.notes.some(note => note.f < variation.config.fretMin || note.f > variation.config.fretMax)) return null;
  let creditTier = -1;
  for (let i = 0; i <= index; i++) {
    if (pathway.tiers[i].subdivision === tier.subdivision && cfg.bpm >= pathway.tiers[i].bpm) creditTier = i;
  }
  return { pathwayId:practice.id, tierIndex:creditTier, variantId:cfg.practiceVariantId };
}

/** @param {unknown} value @returns {Practice} */
export function validatePractice(value) {
  const practice = object(value);
  keys(practice, ['id', 'title', 'instrument', 'tuning', 'meter', 'referenceTempo', 'prose', 'variants', 'pathway']);
  slug(practice.id);
  plainText(practice.title, 120);
  if (practice.instrument !== 'guitar' || practice.tuning !== 'standard' || practice.meter !== '4/4') throw new Error('Only guitar standard six-string 4/4 practices are supported');
  number(practice.referenceTempo, 30, 260);
  if (typeof practice.prose !== 'string' || practice.prose.length > 65536) throw new Error('Invalid practice prose');
  let variants;
  if (practice.variants !== undefined) {
    if (!Array.isArray(practice.variants) || !practice.variants.length || practice.variants.length > 32) throw new Error('Invalid practice variants');
    variants = practice.variants.map(validateVariant);
    if (new Set(variants.map(variant => variant.id)).size !== variants.length) throw new Error('Duplicate practice variant id');
    if (variants.reduce((total, variant) => total + variant.notes.length, 0) > 4096) throw new Error('Too many practice notes');
    if (practice.pathway !== undefined) validatePathwayMetadata(practice.pathway, variants);
  } else {
    if (practice.pathway === undefined) throw new Error('Practice requires variants or generated pathway metadata');
    validateGeneratedPathway(practice.pathway);
  }
  return /** @type {Practice} */ (variants ? { ...practice, variants } : { ...practice });
}

/** Strict scalar frontmatter and one JSON fence, not a general YAML/Markdown parser.
 * @param {string} source */
export function parsePracticeMarkdown(source) {
  if (typeof source !== 'string' || source.length > 65536) throw new Error('Practice source is too large');
  let bytes = 0;
  for (const char of source) {
    const code = /** @type {number} */ (char.codePointAt(0));
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    if (bytes > 65536) throw new Error('Practice source is too large');
  }
  const text = source.replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!match) throw new Error('Missing scalar frontmatter');
  /** @type {Record<string, any>} */
  const metadata = {};
  const fields = ['id', 'title', 'instrument', 'tuning', 'meter', 'referenceTempo'];
  for (const line of match[1].split('\n')) {
    const row = /^([A-Za-z]+): ([^\r\n]+)$/.exec(line);
    if (!row || !fields.includes(row[1]) || Object.hasOwn(metadata, row[1])) throw new Error('Invalid or duplicate frontmatter field');
    metadata[row[1]] = row[2].trim();
  }
  if (fields.some(key => !Object.hasOwn(metadata, key))) throw new Error('Missing frontmatter field');
  if (!/^\d+(?:\.\d+)?$/.test(metadata.referenceTempo)) throw new Error('Invalid referenceTempo');
  metadata.referenceTempo = Number(metadata.referenceTempo);
  const body = match[2];
  const fence = /(?:^|\n)```json\n([\s\S]*?)\n```(?:\n|$)/g;
  const fences = [...body.matchAll(fence)];
  if (fences.length !== 1 || (body.match(/```|~~~/g) || []).length !== 2) throw new Error('Exactly one authoritative JSON fence is required');
  let chart;
  try { chart = object(JSON.parse(fences[0][1])); } catch { throw new Error('Malformed practice JSON'); }
  // JSON.parse otherwise silently chooses the last duplicate key.
  const tokens = fences[0][1].match(/"(?:\\.|[^"\\])*"|[{}[\]:]/g) || [];
  /** @type {Array<Set<string> | null>} */
  const stack = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '{' || token === '[') stack.push(token === '{' ? new Set() : null);
    else if (token === '}' || token === ']') stack.pop();
    else if (token.startsWith('"') && tokens[i + 1] === ':') {
      const names = stack.at(-1), name = JSON.parse(token);
      if (names?.has(name)) throw new Error('Duplicate practice JSON key');
      names?.add(name);
    }
  }
  keys(chart, ['variants', 'pathway']);
  return validatePractice({ ...metadata, ...chart, prose:body.replace(fence, '\n').trim() });
}

/** @param {Record<string, any>} cfg */
export function buildPracticeFileExercise(cfg) {
  const practice = validatePractice(cfg.practiceFile);
  if (!practice.variants) throw new Error('Generated pathway definitions are not authored-note practices');
  const requestedId = cfg.practiceVariantId === undefined ? practice.variants[0].id : cfg.practiceVariantId;
  const variant = practice.variants.find(item => item.id === requestedId);
  if (!variant) throw new Error('Unknown practice variant id');
  const standard = [40,45,50,55,59,64];
  const tuning = cfg.customOpenMidis || cfg.openMidis || standard;
  if (cfg.instrument !== 'guitar' || cfg.stringSetup !== 'guitar_6_standard' || cfg.stringCount !== 6 ||
      !Array.isArray(tuning) || tuning.length !== 6 || tuning.some((m, i) => m !== standard[i])) {
    throw new Error('File practice requires your current guitar to have six strings in standard E A D G B e tuning. No settings were changed.');
  }
  const factor = practice.referenceTempo / number(cfg.bpm, 30, 260);
  if (cfg.practicePathwayId !== undefined) {
    if (!practice.pathway || cfg.practicePathwayId !== practice.id) throw new Error('Invalid pathway practice identity');
    // The old chart clock accumulated each division before six-decimal rounding.
    // Preserve that clock (including its floating-point behavior), not new notes.
    const step = secondsPerDivision({ bpm:cfg.bpm, subdivision:cfg.subdivision });
    const sourceStep = secondsPerDivision({ bpm:practice.referenceTempo, subdivision:cfg.subdivision });
    const defaults = { sl:-1, slu:-1, bn:0, bt:0, ho:false, po:false, hm:false, hp:false, pm:false, mt:false, vb:false, tr:false, ac:false, tp:false };
    let clock = 0, previous = 0;
    const notes = variant.notes.map(note => {
      clock += (note.t - previous) / sourceStep * step;
      previous = note.t;
      return { t:Number(clock.toFixed(6)), s:note.s, f:note.f, sus:step * (note.sus / sourceStep), ...defaults, fg:note.fg, pkd:note.pkd };
    });
    const duration = Number((variant.duration * factor).toFixed(6));
    const credit = practicePathwayCredit(cfg, practice);
    if (!credit) throw new Error('Invalid authored pathway tier/density identity');
    const session = { ...cfg, practiceFileId:practice.id, practiceFileVariantId:variant.id,
      practiceFileVariantTitle:variant.title, practiceFileVariantHint:variant.hint, referenceTempo:practice.referenceTempo,
      practicePathwayCredit:credit };
    return { version:1, session, chart:{ notes, chords:[], chordTemplates:[], handShapes:[],
      sections:[{ name:variant.title, number:1, time:0 }], duration } };
  }
  const notes = variant.notes.map(note => ({ ...note, t:note.t * factor, sus:note.sus * factor }));
  const duration = variant.duration * factor;
  const frets = notes.map(note => note.f);
  const session = { ...cfg, practiceFile:practice, practiceVariantId:variant.id, practiceFileId:practice.id,
    practiceFileVariantId:variant.id, practiceFileVariantTitle:variant.title, practiceFileVariantHint:variant.hint,
    mode:'file', practiceType:'file',
    sessionName:practice.title, meter:parseMeter(practice.meter), referenceTempo:practice.referenceTempo,
    bars:variant.duration * practice.referenceTempo / 240, subdivision:'quarter', swing:'straight', backingDensity:0,
    drums:'none', keyCycle:'none', jamStyle:null, targetSec:null, shapeNotes:null, shapeDisplayName:null,
    fretboardSystem:'position', fretMin:Math.min(...frets), fretMax:Math.max(...frets),
    audio:{ ...cfg.audio, harmony:false } };
  return { version:1, session, chart:{ notes, duration, chords:[], chordTemplates:[], handShapes:[],
    sections:[{ name:practice.title, number:1, time:0 }], anchors:[{ time:0, fret:session.fretMin, width:Math.max(3, session.fretMax - session.fretMin + 1) }],
    beats:[], backingEvents:[], timeline:[] } };
}
