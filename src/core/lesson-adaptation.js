// SPDX-License-Identifier: AGPL-3.0-only
import {STRING_SETUPS, TUNING_PRESETS} from './instrument-tuning.js';
import {NOTE_ALIASES, NOTE_NAMES} from './pitch.js';

/** Derived lesson metadata belongs to the current physical setup, not a tab snapshot.
 * @param {import('../types/authored-config.js').AuthoredConfig} lesson
 * @param {string} stringSetup
 * @param {string} customOpenMidis
 * @returns {Record<string, unknown>}
 */
export function deriveLessonFields(lesson, stringSetup, customOpenMidis) {
  const setup = STRING_SETUPS[stringSetup] || STRING_SETUPS.guitar_6_standard;
  const parsed = customOpenMidis.split(',').map(Number);
  const opens = customOpenMidis.trim() && parsed.length === setup.openMidis.length && parsed.every(Number.isFinite) ? parsed : setup.openMidis;
  const fields = {keyNominal:'', tuningOffset:0, anchorStation:''};
  if (lesson.anchor === 'open_lowest') {
    const fret = Math.max(0, Math.min(11, Number(lesson.anchorFret) || 0));
    return {...fields, key:NOTE_NAMES[((opens[0] + fret) % 12 + 12) % 12], anchorStation:fret ? `fret ${fret}` : 'open'};
  }
  if (!lesson.key) return fields;
  const authored = STRING_SETUPS[lesson.stringSetup || 'guitar_6_standard'];
  if (authored && !lesson.customOpenMidis && authored.instrument === setup.instrument && authored.openMidis.length === opens.length) {
    const delta = opens[0] - authored.openMidis[0];
    const preset = (TUNING_PRESETS[`${setup.instrument}_${opens.length}`] || []).find(item => item.offset && item.midis.every((midi,index) => midi === opens[index]));
    if (preset && delta && opens.every((midi,index) => midi - authored.openMidis[index] === delta)) {
      return {...fields, key:NOTE_NAMES[((NOTE_ALIASES[String(lesson.key)] ?? 0) + delta + 120) % 12], keyNominal:lesson.key, tuningOffset:delta};
    }
  }
  return {...fields, key:lesson.key};
}
