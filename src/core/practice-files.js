// SPDX-License-Identifier: AGPL-3.0-only
import { parseMeter, secondsPerDivision } from './timing.js';

/** @typedef {{t:number, s:number, f:number, sus:number, fg?:number, pkd?:number}} PracticeNote */
/** @typedef {{id:string, title:string, hint?:string, duration:number, notes:PracticeNote[]}} PracticeVariant */
/** @typedef {{goal?:string, scales?:string[], formCues?:string[], instAgnostic?:boolean, base?:Record<string, any>, vary?:Record<string, any>[], variations?:{id:string, title:string, config:Record<string, any>, charts:string[]}[], tiers?:{bpm:number, subdivision:string, bars:number}[], tempoTiers?:number[], tempoTierSubdivs?:string[], tempoTierBars?:number[], practiceType?:string}} PracticePathway */
/** @typedef {{id:string, title:string, instrument:string, tuning:string, meter:string, referenceTempo:number, genre?:string, skill?:string, applicability?:string[], role?:string, competency?:string, practiceTypeLabel?:string, prose:string, block?:Record<string, any>, variants?:PracticeVariant[], pathway?:PracticePathway}} Practice */

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
    if (typeof item.path !== 'string' || !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.md$/.test(item.path) || !['custom', 'pathway', 'block'].includes(item.use)) throw new Error('Unknown practice index entry');
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
  if (!practice.variants) {
    const generated = /** @type {PracticePathway & {goal:string, scales:string[], base:Record<string, any>, vary:Record<string, any>[], tempoTiers:number[]}} */ (pathway);
    return { label:practice.title, goal:generated.goal, scales:generated.scales.slice(), ...(generated.formCues ? {formCues:generated.formCues.slice()} : {}), ...(generated.instAgnostic ? {instAgnostic:true} : {}),
      tempoTiers:generated.tempoTiers.slice(), ...(generated.tempoTierSubdivs ? {tempoTierSubdivs:generated.tempoTierSubdivs.slice()} : {}),
      ...(generated.tempoTierBars ? {tempoTierBars:generated.tempoTierBars.slice()} : {}), base:{ ...generated.base }, vary:generated.vary.map(variation => ({ ...variation })) };
  }
  const authored = /** @type {PracticePathway & {goal:string, formCues:string[], base:Record<string, any>, tiers:{bpm:number, subdivision:string, bars:number}[], variations:{id:string, config:Record<string, any>, charts:string[]}[]}} */ (pathway);
  return { label:practice.title, goal:authored.goal, scales:[], practiceFile:practice, formCues:authored.formCues.slice(),
    tempoTiers:authored.tiers.map(tier => tier.bpm), tempoTierSubdivs:authored.tiers.map(tier => tier.subdivision),
    tempoTierBars:authored.tiers.map(tier => tier.bars), base:{ ...authored.base },
    vary:authored.variations.map(variation => ({ ...variation.config })) };
}

/** @param {Practice} input @param {number} variationIndex @param {number} tierIndex */
export function practicePathwaySelection(input, variationIndex, tierIndex) {
  const practice = validatePractice(input), pathway = practice.pathway;
  if (!pathway || !Number.isInteger(variationIndex) || !Number.isInteger(tierIndex)) throw new Error('Invalid pathway selection');
  const authored = /** @type {PracticePathway & {base:Record<string, any>, tiers:{bpm:number, subdivision:string, bars:number}[], variations:{id:string, config:Record<string, any>, charts:string[]}[]}} */ (pathway);
  const variation = authored.variations[variationIndex], tier = authored.tiers[tierIndex];
  if (!variation || !tier) throw new Error('Unknown pathway variation or tier');
  return { ...pathway.base, ...variation.config, ...tier, practiceFile:practice,
    practiceVariantId:variation.charts[tierIndex], practicePathwayId:practice.id, practicePathwayVariationId:variation.id,
    practicePathwayTierIndex:tierIndex };
}

/** @param {Practice} input @param {number | string | undefined} variantId @returns {import('./session-types.js').Segment & {config: import('./session-types.js').SegmentConfig}} */
export function practiceWorkoutSegment(input, variantId) {
  const practice = validatePractice(input);
  if (practice.block) {
    const block = practice.block;
    return { id:practice.id, name:practice.title, kind:block.kind, role:block.role, practiceId:practice.id,
      config:{...block.base, practiceFileId:practice.id, bpm:block.base.bpm || practice.referenceTempo} };
  }
  if (practice.variants && practice.pathway?.variations) {
    const selectedVariation = typeof variantId === 'number'
      ? {variationIndex:variantId,tierIndex:0}
      : (() => {
          const variationIndex = practice.pathway.variations.findIndex((item) => item.id === variantId || (typeof variantId === 'string' && item.charts.includes(variantId)));
          const tierIndex = typeof variantId === 'string' ? (practice.pathway.variations[variationIndex]?.charts.indexOf(variantId) ?? 0) : 0;
          return {variationIndex:Math.max(0,variationIndex),tierIndex:Math.max(0,tierIndex)};
        })();
    const config = /** @type {Record<string, any>} */ (practicePathwaySelection(practice, selectedVariation.variationIndex, selectedVariation.tierIndex));
    return {id:practice.id,name:practice.title,kind:config.practiceType,role:practice.role || 'technique',practiceId:practice.id,config,practiceFile:practice};
  }
  if (practice.variants) return { id:practice.id, name:practice.title, kind:'file', role:practice.role || 'technique', practiceId:practice.id,
    config:{bpm:practice.referenceTempo, meter:practice.meter, bars:4, subdivision:'quarter', practiceFile:practice}, practiceFile:practice };
  const pathway = /** @type {PracticePathway & {base:Record<string, any>, variations:{id:string, config:Record<string, any>, charts:string[]}[], tiers:{bpm:number, subdivision:string, bars:number}[]}} */ (practice.pathway);
  if (!pathway) throw new Error('Practice has no workout capability');
  const variationIndex = Math.max(0, typeof variantId === 'number' ? variantId
    : pathway.variations ? pathway.variations.findIndex((/** @type {Record<string, any>} */ item) => item.id === variantId)
      : Number(String(variantId || '').replace(/^variation-/,'')) || 0);
  const variation = pathway.vary?.[variationIndex] || pathway.variations?.[variationIndex]?.config || {};
  const tier = pathway.tempoTiers?.[0] ? {bpm:pathway.tempoTiers[0], subdivision:pathway.tempoTierSubdivs?.[0], bars:pathway.tempoTierBars?.[0]} : pathway.tiers?.[0];
  const config = /** @type {Record<string, any>} */ ({...pathway.base, ...variation, ...tier, ...(pathway.variations ? {practiceFile:practice,practiceFileId:practice.id} : {})});
  if (pathway.variations) Object.assign(config, {practicePathwayId:practice.id, practicePathwayVariationId:pathway.variations[variationIndex].id, practicePathwayTierIndex:0, practiceVariantId:pathway.variations[variationIndex].charts[0]});
  return {id:practice.id,name:practice.title,kind:config.practiceType || 'scale',role:practice.role || 'technique',practiceId:practice.id,config,
    ...(pathway.variations ? {practiceFile:practice} : {})};
}

/** Pedagogical identity/density, not a performance judge.
 * @param {Record<string, any>} cfg @param {Practice} practice */
export function practicePathwayCredit(cfg, practice) {
  const pathway = /** @type {PracticePathway & {base:Record<string, any>, variations:{id:string, config:Record<string, any>, charts:string[]}[], tiers:{bpm:number, subdivision:string, bars:number}[]}} */ (practice.pathway);
  if (!pathway || !practice.variants || cfg.practicePathwayId !== practice.id) return null;
  const variation = pathway.variations.find(item => item.id === cfg.practicePathwayVariationId);
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
  keys(practice, ['id', 'title', 'instrument', 'tuning', 'meter', 'referenceTempo', 'genre', 'skill', 'applicability', 'role', 'competency', 'practiceTypeLabel', 'prose', 'block', 'variants', 'pathway']);
  slug(practice.id);
  plainText(practice.title, 120);
  if (!['guitar','bass'].includes(practice.instrument) || practice.tuning !== 'standard' || typeof practice.meter !== 'string') throw new Error('Unsupported practice instrument or tuning');
  for (const field of ['genre','skill','role','competency','practiceTypeLabel']) if (practice[field] !== undefined) plainText(practice[field], 120);
  if (practice.skill !== undefined && !['beginner','intermediate','advanced'].includes(practice.skill)) throw new Error('Invalid practice skill level');
  if (practice.applicability !== undefined && (!Array.isArray(practice.applicability) || !practice.applicability.length || practice.applicability.some(item => !['guitar','bass'].includes(item)))) throw new Error('Invalid practice applicability');
  number(practice.referenceTempo, 30, 260);
  if (typeof practice.prose !== 'string' || practice.prose.length > 65536) throw new Error('Invalid practice prose');
  let variants;
  if (practice.block !== undefined) {
    const block = object(practice.block); keys(block, ['role','label','competency','band','instrument','style','paletteLock','kind','base','vary']);
    if (!['warmup','technique','scale_arp','application','jam','review','cooldown'].includes(block.role) || !['beginner','intermediate','advanced'].includes(block.band) || block.instrument !== practice.instrument || typeof block.kind !== 'string' || typeof block.label !== 'string' || typeof block.competency !== 'string') throw new Error('Invalid workout block metadata');
    const base = object(block.base); keys(base, PATHWAY_CONFIG_KEYS);
    if (base.stringSetup && !['guitar_6_standard','bass_4_standard','bass_5_standard','guitar_7_standard','guitar_8_standard'].includes(base.stringSetup)) throw new Error('Unsupported workout block setup');
    if (!Array.isArray(block.vary) || !block.vary.length) throw new Error('Workout block requires variants');
    if (block.paletteLock !== undefined && typeof block.paletteLock !== 'boolean') throw new Error('Invalid workout palette lock');
    block.vary.forEach(raw => { keys(object(raw), PATHWAY_CONFIG_KEYS); });
    if (practice.pathway !== undefined || practice.variants !== undefined) throw new Error('Workout block cannot also define a practice chart');
  } else if (practice.variants !== undefined) {
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
  const fields = ['id', 'title', 'instrument', 'tuning', 'meter', 'referenceTempo', 'genre', 'skill', 'applicability', 'role', 'competency', 'practiceTypeLabel'];
  for (const line of match[1].split('\n')) {
    const row = /^([A-Za-z]+): ([^\r\n]+)$/.exec(line);
    if (!row || !fields.includes(row[1]) || Object.hasOwn(metadata, row[1])) throw new Error('Invalid or duplicate frontmatter field');
    metadata[row[1]] = row[2].trim();
  }
  if (['id', 'title', 'instrument', 'tuning', 'meter', 'referenceTempo'].some(key => !Object.hasOwn(metadata, key))) throw new Error('Missing frontmatter field');
  if (!/^\d+(?:\.\d+)?$/.test(metadata.referenceTempo)) throw new Error('Invalid referenceTempo');
  if (metadata.applicability !== undefined) metadata.applicability = metadata.applicability.split(',').map((/** @type {string} */ value) => value.trim());
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
  keys(chart, ['variants', 'pathway', 'block']);
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
