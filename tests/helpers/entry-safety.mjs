// SPDX-License-Identifier: AGPL-3.0-only
// Reverse only tested entry safety edits, including LCD and delegated targets.
// Historical pins still compare every other executable statement.
export function normalizeEntrySafety(source) {
  source = source.replace('creditFeltRung, shareCardModel, renderShareCardImage,', 'creditFeltRung, shareCardModel, shareCardText, renderShareCardImage, isShareworthy,')
    .replace('resolveDrumKit, recipeTracks, buildCompCellHits, activeBundleBacking:', 'resolveDrumKit, recipeTracks, resolveHumanSeed, buildCompCellHits, activeBundleBacking:');
  // Explicit primitive key conversion equals JavaScript's existing ToPropertyKey;
  // only these audited nullable string fields normalize, not arbitrary calls.
  for (const [table, key] of [
    ['PER_BEAT','sub0'], ['TONE_GM','pr.tone'], ['SAMPLE_BANK_PINS','pin'],
    ['STRING_SETUPS','cfg.stringSetup'], ['FUNCTION_HUE','e.fn'],
    ['ROLE_COLORS','s.role'], ['KIND_COLORS','s.kind'], ['AMP_PRESETS','slot.amp'],
    ['SEGMENT_ROLES','s.role'], ['KIND_LABELS','s.kind'], ['SEGMENT_ROLES','role'],
    ['ROLE_COLORS','c.role'], ['KIND_COLORS','c.kind'], ['STRING_SETUPS','setup?.value'],
    ['BAND_TONE_LABEL','slot.tone'], ['NOTE_ALIASES','cfg.key'], ['STRING_SETUPS','setupName'],
    ['STRING_SETUPS','tieredConfig.stringSetup'], ['ptData','practiceSelection.pathwayId'], ['PATHWAYS','st.prereq'],
    ['counts','h'], ['seen','h'], ['b.src','piece'], ['kit.pieces','piece'],
    ['DRUM_PIECE_GAIN','piece'], ['TONE_GM','harmProfile.pad.tone'],
    ['PATHWAYS','practiceSelection.pathwayId'], ['PATHWAYS','_activeSession.pathway_id']
  ]) source = source.replaceAll(`${table}[String(${key})]`, `${table}[${key}]`);
  source = source.replace("      const target = ev.target;\n      if (!target || !('value' in target) || typeof target.value !== 'string'\n          || !('name' in target) || typeof target.name !== 'string'\n          || !('closest' in target) || typeof target.closest !== 'function') return;\n", '')
    .replace("if (target.closest('.virtuoso-jam-inspector')) return;\n      const name = target.name;\n      if (target.closest('#virtuoso-file-practices')) return;", "if (ev && ev.target && ev.target.closest && ev.target.closest('.virtuoso-jam-inspector')) return;\n      const name = ev && ev.target ? ev.target.name : '';\n      if (ev.target?.closest?.('#virtuoso-file-practices')) return;")
    .replace("h.style.display = target.value !== 'none' ? '' : 'none';", "h.style.display = ev.target.value !== 'none' ? '' : 'none';")
    .replace("if (name === 'renderer') syncViewSwitcher(target.value);", "if (name === 'renderer') syncViewSwitcher(ev.target.value);");
  source = source.replace(/\n {2}\/\*\* @template \{keyof import\('\.\/src\/types\/event-dom.js'\).WidgetSelectors\} S @param \{EventTarget \| null\} target @param \{S\} selector @returns \{import\('\.\/src\/types\/event-dom.js'\).WidgetSelectors\[S\] \| null\} \*\/\n {2}function eventClosest\(target, selector\) \{\n {4}return \/\*\* @type \{import\('\.\/src\/types\/event-dom.js'\).WidgetSelectors\[S\] \| null\} \*\/ \(eventElement\(target\)\?\.closest\(selector\) \|\| null\);\n {2}\}\n/, '\n')
    .replace("const yes = eventClosest(e.target, '.virtuoso-starter-confirm-yes');\n      if (yes) loadStarter(yes.dataset.starterId, true);", "if (e.target.closest('.virtuoso-starter-confirm-yes')) loadStarter(e.target.closest('.virtuoso-starter-confirm-yes').dataset.starterId, true);")
    .replace(/eventClosest\(e.target, ('(?:\[data-act="depth-pattern"\]|\.virtuoso-progress-seg|\.virtuoso-starter-confirm-no|\[data-act="dismiss-summary"\]|\[data-act="copy-card"\], \[data-act="download-card"\])')\)/g, 'e.target.closest($1)')
    .replace(/eventClosest\(ev.target, ('(?:\.virtuoso-mixer-(?:viewtab|fader|pan|inbtn|tog|amp|kit|instr)|\.virtuoso-rig-(?:load|reset|out)|#virtuoso-rig-file)')\)/g, 'ev.target.closest && ev.target.closest($1)');
  if (source.includes('eventValueElement(')) source = source.replace(/\n {2}\/\*\* @param \{EventTarget \| null\} target @returns \{\(Element & \{value: string\}\) \| null\} \*\/\n {2}function eventValueElement\(target\) \{\n {4}const element = eventElement\(target\);\n {4}if \(!element \|\| !\('value' in element\) \|\| typeof element.value !== 'string'\) return null;\n {4}return \/\*\* @type \{Element & \{value: string\}\} \*\/ \(element\);\n {2}\}\n/, '\n')
    .replace("const target = eventValueElement(e.target);\n        if (target?.id === 'virtuoso-lcd-bpm' && e.key === 'Enter' && 'blur' in target && typeof target.blur === 'function') { e.preventDefault(); target.blur(); }", "if (e.target && e.target.id === 'virtuoso-lcd-bpm' && e.key === 'Enter') { e.preventDefault(); e.target.blur(); }")
    .replace('const target = eventValueElement(e.target); if (!target) return;\n        const id = target.id;', 'const id = e.target && e.target.id;')
    .replace('parseInt(target.value, 10)', 'parseInt(e.target.value, 10)')
    .replace('if (!v || !formBpm) { if (formBpm) target.value = formBpm.value; return; }', 'if (!v || !formBpm) { if (formBpm) e.target.value = formBpm.value; return; }')
    .replace('target.value = String(v);', 'e.target.value = String(v);')
    .replace('const field = eventValueElement(document.querySelector(\'#virtuoso-controls [name="\' + name + \'"]\'));', 'const field = document.querySelector(\'#virtuoso-controls [name="\' + name + \'"]\');')
    .replace('if (!field || String(field.value) === String(target.value)) return;', 'if (!field || String(field.value) === String(e.target.value)) return;')
    .replace('field.value = target.value;', 'field.value = e.target.value;');
  source = source.replace(/\n {2}\/\*\* @param \{EventTarget \| null\} target @returns \{Element \| null\} \*\/\n {2}function eventElement\(target\) \{[\s\S]*?\n {2}\}\n/, '\n')
    .replace(/eventElement\(e.target\)\?\.closest\(('(?:\.virtuoso-lib-add|\[data-filter\]|\[data-sfilter\]|\.virtuoso-routine-load|\.virtuoso-routine-del|\.virtuoso-starter-load)')\)/g, 'e.target.closest($1)');
  source = source.replace("const r = box ? box.getBoundingClientRect() : { width: canvas.width, height: canvas.height };\n      if (!canvas) return;",
    "const r = box ? box.getBoundingClientRect() : { width: canvas.width, height: canvas.height };")
    .replace('resize();\n      if (!ctx) return;', 'resize();')
    .replace('if (n.sus !== undefined && (n.sus || 0) > 0)', 'if ((n.sus || 0) > 0)')
    .replace('if (n.sus !== undefined && n.sus > 0 && t > n.t)', 'if (n.sus > 0 && t > n.t)')
    .replace('if (fingersOn && p.fg !== undefined && p.fg >= 1)', 'if (fingersOn && p.fg >= 1)')
    .replace('if (n.fg !== undefined && n.fg >= 1 && n.fg <= 4)', 'if (n.fg >= 1 && n.fg <= 4)')
    .replace('judged && pct !== null && pct < 65', 'judged && pct < 65')
    .replace('opts.barSec !== undefined && opts.barSec > 0', 'opts.barSec > 0');
  source = source.replace("const ctx = ensureAudioCtx();\n    if (ctx.state === 'suspended') ctx.resume().catch(() => {});\n    const base =",
    "ensureAudioCtx();\n    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});\n    const ctx = audioCtx, base =")
    .replace('delaySeconds !== undefined && Number.isFinite(delaySeconds)', 'Number.isFinite(delaySeconds)')
    .replace('toTime !== undefined && Number.isFinite(toTime)', 'Number.isFinite(toTime)')
    .replace('opts && opts.bright !== undefined && Number.isFinite(opts.bright)', 'opts && Number.isFinite(opts.bright)')
    .replace('opts && opts.level !== undefined && Number.isFinite(opts.level)', 'opts && Number.isFinite(opts.level)')
    .replace('cfg.countInBars !== undefined && cfg.countInBars > 0', 'cfg.countInBars > 0');
  source = source.replace('const w = _ptSpanPending.shift();\n      if (!w) continue;', 'const w = _ptSpanPending.shift();')
    .replace("return /** @type {import('./src/types/judgment-data.js').JudgmentWindow} */ (w);", 'return w;');
  source = source.replace("const bus = hostBus();\n    if (bus && typeof bus.navigate === 'function') return bus.navigate(id);",
    "if (hostBus() && typeof hostBus().navigate === 'function') return hostBus().navigate(id);");
  source = source.replaceAll('const bridge = hostDesktop()?.audio;', 'const bridge = hostDesktop() && hostDesktop().audio;')
    .replace("const bus = hostBus();\n    if (bus && typeof bus.emit === 'function') {\n      bus.emit('virtuoso:tier:unlocked',",
      "if (hostBus() && typeof hostBus().emit === 'function') {\n      hostBus().emit('virtuoso:tier:unlocked',")
    .replace("const bus = hostBus();\n    if (bus && typeof bus.emit === 'function') {\n      try { bus.emit('virtuoso:progress',",
      "if (hostBus() && typeof hostBus().emit === 'function') {\n      try { hostBus().emit('virtuoso:progress',")
    .replace(/const bus = hostBus\(\);\n {4}if \(bus && typeof bus.emit === 'function'\) \{\n {6}bus.emit\('virtuoso:loop:(set|clear)',/g,
      "if (hostBus() && typeof hostBus().emit === 'function') {\n      hostBus().emit('virtuoso:loop:$1',")
    .replace(/const bus = hostBus\(\);\n {10}if \(bus && typeof bus\.emit === 'function'\) \{\n {12}bus\.emit\('virtuoso:loop:(wrap)',/,
      "if (hostBus() && typeof hostBus().emit === 'function') {\n            hostBus().emit('virtuoso:loop:$1',");
  // Wave-1 strict-entry casts (2026-10-21): a JSDoc cast batch plus one tick
  // const-bus form; every entry below reverses to the pinned text byte-exactly.
  source = source.replaceAll("(/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect))", 'window.noteDetect')
  source = source.replaceAll('(/** @type {import(\'./src/core/fretboard-shapes.js\').ResolvedShape} */ (shape))', 'shape')
    .replaceAll('(/** @type {import(\'./src/core/fretboard-shapes.js\').ResolvedShape} */ (cShapeC))', 'cShapeC')
    .replaceAll('(/** @type {import(\'./src/core/fretboard-shapes.js\').ResolvedShape} */ (eShapeG))', 'eShapeG')
    .replaceAll('(/** @type {boolean} */ (/** @type {unknown} */ (cShapeC && cShapeC.fretMin === 0 && cShapeC.fretMax === 5)))', 'cShapeC && cShapeC.fretMin === 0 && cShapeC.fretMax === 5')
    .replaceAll('(/** @type {boolean} */ (/** @type {unknown} */ (eShapeG && eShapeG.fretMin === 2 && eShapeG.fretMax === 7)))', 'eShapeG && eShapeG.fretMin === 2 && eShapeG.fretMax === 7')
    .replaceAll('(/** @type {import(\'./src/types/entry-data.js\').EntryNote[]} */ (groups.get(k)))', 'groups.get(k)')
    .replaceAll('(/** @type {AudioBuffer} */ (entry.buf))', 'entry.buf')
    .replaceAll('(/** @type {Error} */ (lastErr))', 'lastErr')
    .replaceAll('(/** @type {import(\'./src/types/entry-data.js\').EntryBundle} */ (activeBundle))', 'activeBundle')
    .replaceAll('(/** @type {AudioContext} */ (audioCtx))', 'audioCtx')
    .replaceAll('(/** @type {{nodes: import(\'./src/types/audio-graph.js\').ScheduledResource[], endCtx: number}} */ (schedChunks.shift()))', 'schedChunks.shift()')
    .replaceAll('(/** @type {number[]} */ (cur.cpcs))', 'cur.cpcs')
    .replaceAll('(/** @type {Error} */ (e)).name', 'e.name')
    .replaceAll('(/** @type {NonNullable<import(\'./src/types/audio-graph.js\').AudioBus[\'amps\']>} */ (bus.amps))', 'bus.amps')
    .replaceAll('(/** @type {import(\'./src/types/audio-graph.js\').MelodicBusEffects} */ (fx))', 'fx')
    .replaceAll('(/** @type {Record<string, string | null>} */ (_mixerRevealSig))', '_mixerRevealSig')
    .replaceAll("/** @type {Element} */ ($('virtuoso-root'))", "$('virtuoso-root')")
    .replaceAll("/** @type {Uint8Array<ArrayBuffer>} */ (_mixMeterBuf)", "_mixMeterBuf")
    .replaceAll('(/** @type {import(\'./src/types/audio-graph.js\').AudioBus} */ (audioBus))', 'audioBus')
    .replaceAll('(/** @type {number} */ (info.leanMs))', 'info.leanMs')
    .replaceAll('(/** @type {import(\'./src/types/results-data.js\').CoachFocus} */ (prevFocus))', 'prevFocus')
    .replaceAll('(/** @type {number} */ (cfg.countInBars))', 'cfg.countInBars')
    .replaceAll('(/** @type {Record<string, import(\'./src/core/generation-types.js\').AudioVoice | null>} */ (/** @type {unknown} */ (prof)))', 'prof');
  source = source.replace("applyBassPlucking(/** @type {import('./src/core/notes.js').Note[]} */ ([", 'applyBassPlucking([')
    .replace("]), { bpm: 120, meter: { numerator: 4, denominator: 4 }, subdivision: 'sixteenth' });", "], { bpm: 120, meter: { numerator: 4, denominator: 4 }, subdivision: 'sixteenth' });");
  source = source.replace("$('virtuoso-play')?.addEventListener('click', onPlayToggle);", "$('virtuoso-play').addEventListener('click', onPlayToggle);")
    .replace("$('virtuoso-controls')?.addEventListener('change', (ev) => {", "$('virtuoso-controls').addEventListener('change', (ev) => {");
  for (const name of ['drawBackground', 'drawAnchorZones', 'drawStringLanes', 'drawBeatsAndPlayhead',
    'drawBackingChords', 'drawChordTiles', 'drawSectionMarkers', 'drawNotes', 'drawHud']) {
    source = source.replaceAll(`${name}(ctx, `, `${name}(`).replaceAll(`${name}(ctx)`, `${name}()`);
  }
  // Nullable closure/state correlation batch (2026-10-21): the seven audited
  // local guards keep the original statement shape for the saved dirty-before
  // pins; the correlated JSDoc casts reverse to the raw property reads below.
  source = source.replace('if (!el || !el.isConnected || pct === null) return;', 'if (!el.isConnected) return;');
  // Correlated JSDoc casts reverse back to the raw property reads byte-exactly.
  source = source.replaceAll("/** @type {import('./src/types/results-data.js').FeltCredit} */ (s.feltResult)", 's.feltResult')
    .replaceAll('/** @type {number} */ (s.clearedTier)', 's.clearedTier')
    .replaceAll("/** @type {NonNullable<import('./src/types/results-data.js').RunSummary['ladder']>} */ (s.ladder)", 's.ladder')
    .replaceAll("(/** @type {import('./src/types/results-data.js').Chapter[]} */ (s.chapters))", 's.chapters')
    .replaceAll('(/** @type {HTMLElement} */ (ev.target))', 'ev.target')
    .replaceAll('(/** @type {Element} */ (ev.currentTarget))', 'ev.currentTarget')
    .replaceAll('(/** @type {HTMLElement} */ (document.activeElement))', 'document.activeElement');
  source = source.replace("row.addEventListener('dragstart', (e) => { const dt = e.dataTransfer; if (!dt) return; dt.setData('text/plain', id); dt.effectAllowed = 'move'; row.classList.add('dragging'); });",
    "row.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; row.classList.add('dragging'); });");
  for (const col of ['_instCol', '_availCol']) {
    source = source.replace(`${col}?.addEventListener('dragover', (e) => { e.preventDefault(); const dt = e.dataTransfer; if (!dt) return; dt.dropEffect = 'move'; });`,
      `${col}?.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });`);
  }
  source = source.replace(/ {6}e\.preventDefault\(\); const dt = e\.dataTransfer; if \(!dt\) return;\n {6}const id = dt\.getData\('text\/plain'\); if \(!id \|\| !_packsDraft\) return;\n/g,
    "      e.preventDefault();\n      const id = e.dataTransfer.getData('text/plain'); if (!id || !_packsDraft) return;\n");
  source = source.replace("const nextAt = lv.nextAt;\n    if (lv.nextName && nextAt != null) rows.push(`<div class=\"virtuoso-pm-coming\">${(nextAt - lv.xp).toLocaleString()} XP of practice to ${lv.nextName}.</div>`);",
    "if (lv.nextName) rows.push(`<div class=\"virtuoso-pm-coming\">${(lv.nextAt - lv.xp).toLocaleString()} XP of practice to ${lv.nextName}.</div>`);");
  return source;
}
