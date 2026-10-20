// SPDX-License-Identifier: AGPL-3.0-only
import { parseMeter } from './timing.js';

export const PRACTICE_FILES = [
  { id:'chromatic-warmup', title:'Chromatic warm-up', path:'guitar/beginner/chromatic-warmup.md' }
];

/** @typedef {{t:number, s:number, f:number, sus:number, fg?:number, pkd?:number}} PracticeNote */
/** @typedef {{id:string, title:string, instrument:string, tuning:string, meter:string, referenceTempo:number, prose:string, duration:number, notes:PracticeNote[]}} Practice */

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
  if (!Array.isArray(index.practices) || index.practices.length !== PRACTICE_FILES.length) throw new Error('Invalid practice index');
  return index.practices.map((raw, i) => {
    const item = object(raw), known = PRACTICE_FILES[i];
    keys(item, ['id', 'title', 'path']);
    // Exact reviewed paths exclude URLs, encoded traversal and unreviewed content.
    if (item.id !== known.id || item.path !== known.path || item.title !== known.title) throw new Error('Unknown practice index entry');
    return { ...known };
  });
}

/** @param {unknown} value @returns {Practice} */
export function validatePractice(value) {
  const practice = object(value);
  keys(practice, ['id', 'title', 'instrument', 'tuning', 'meter', 'referenceTempo', 'prose', 'duration', 'notes']);
  if (typeof practice.id !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(practice.id)) throw new Error('Invalid practice id');
  if (typeof practice.title !== 'string' || !practice.title.trim() || practice.title.length > 120 || /[\r\n]/.test(practice.title)) throw new Error('Invalid practice title');
  if (practice.instrument !== 'guitar' || practice.tuning !== 'standard' || practice.meter !== '4/4') throw new Error('Only guitar standard six-string 4/4 practices are supported');
  number(practice.referenceTempo, 30, 260);
  number(practice.duration, 0.01, 600);
  if (typeof practice.prose !== 'string' || practice.prose.length > 65536) throw new Error('Invalid practice prose');
  if (!Array.isArray(practice.notes) || !practice.notes.length || practice.notes.length > 4096) throw new Error('Invalid practice notes');
  let previousOnset = -1, previousEnd = 0;
  const notes = practice.notes.map(raw => {
    const note = object(raw);
    keys(note, ['t', 's', 'f', 'sus', 'fg', 'pkd']);
    number(note.t, 0, 600); number(note.sus, 0, 600);
    number(note.s, 0, 5); number(note.f, 0, 24);
    if (!Number.isInteger(note.s) || !Number.isInteger(note.f)) throw new Error('String and fret must be integers');
    if (note.t <= previousOnset || note.t < previousEnd) throw new Error('Only ordered, non-overlapping single notes are supported (no chords)');
    previousOnset = note.t; previousEnd = note.t + note.sus;
    if (previousEnd > practice.duration) throw new Error('Duration must cover every note sustain');
    if (note.fg !== undefined) {
      number(note.fg, 0, 4);
      if (!Number.isInteger(note.fg) || (note.f === 0 ? note.fg !== 0 : note.fg === 0)) throw new Error('Invalid fret-hand finger');
    }
    if (note.pkd !== undefined && note.pkd !== 0 && note.pkd !== 1) throw new Error('Invalid pick stroke');
    return /** @type {PracticeNote} */ ({ ...note });
  });
  if (practice.duration <= previousOnset) throw new Error('Duration must extend past the final onset');
  return /** @type {Practice} */ ({ ...practice, notes });
}

/** Strict scalar frontmatter and one JSON fence, not a general YAML/Markdown parser.
 * @param {string} source */
export function parsePracticeMarkdown(source) {
  if (typeof source !== 'string' || source.length > 65536) throw new Error('Practice source is too large');
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
  const tokens = fences[0][1].match(/"(?:\\.|[^"\\])*"|[{}\[\]:]/g) || [];
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
  keys(chart, ['duration', 'notes']);
  return validatePractice({ ...metadata, ...chart, prose:body.replace(fence, '\n').trim() });
}

/** @param {Record<string, any>} cfg */
export function buildPracticeFileExercise(cfg) {
  const practice = validatePractice(cfg.practiceFile);
  const standard = [40,45,50,55,59,64];
  const tuning = cfg.customOpenMidis || standard;
  if (cfg.instrument !== 'guitar' || cfg.stringSetup !== 'guitar_6_standard' || cfg.stringCount !== 6 ||
      !Array.isArray(tuning) || tuning.length !== 6 || tuning.some((m, i) => m !== standard[i])) {
    throw new Error('File practice requires your current guitar to have six strings in standard E A D G B e tuning. No settings were changed.');
  }
  const factor = practice.referenceTempo / number(cfg.bpm, 30, 260);
  const notes = practice.notes.map(note => ({ ...note, t:note.t * factor, sus:note.sus * factor }));
  const duration = practice.duration * factor;
  const frets = notes.map(note => note.f);
  const session = { ...cfg, practiceFile:practice, practiceFileId:practice.id, mode:'file', practiceType:'file',
    sessionName:practice.title, meter:parseMeter(practice.meter), referenceTempo:practice.referenceTempo,
    bars:practice.duration * practice.referenceTempo / 240, subdivision:'quarter', swing:'straight', backingDensity:0,
    drums:'none', keyCycle:'none', jamStyle:null, targetSec:null, shapeNotes:null, shapeDisplayName:null,
    fretboardSystem:'position', fretMin:Math.min(...frets), fretMax:Math.max(...frets),
    audio:{ ...cfg.audio, harmony:false } };
  return { version:1, session, chart:{ notes, duration, chords:[], chordTemplates:[], handShapes:[],
    sections:[{ name:practice.title, number:1, time:0 }], anchors:[{ time:0, fret:session.fretMin, width:Math.max(3, session.fretMax - session.fretMin + 1) }],
    beats:[], backingEvents:[], timeline:[] } };
}
