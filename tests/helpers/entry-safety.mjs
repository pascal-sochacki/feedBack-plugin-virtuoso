// SPDX-License-Identifier: AGPL-3.0-only
// Reverse only tested entry safety edits, including LCD and delegated targets.
// Historical pins still compare every other executable statement.
export function normalizeEntrySafety(source) {
  source = source.replace("JSON.parse(localStorage.getItem('virtuoso.rig') ?? 'null')", "JSON.parse(localStorage.getItem('virtuoso.rig'))");
  source = source.replace(/function scheduleDrumHit\([\s\S]*?\n {2}\}/, fn => fn
    .replace('/** @type {number} */ (dur), kit.level || 1)) return;', 'dur, kit.level || 1)) return;')
    .replace('scheduleDkHit(ctx, b, /** @type {string} */ (piece),', 'scheduleDkHit(ctx, b, piece,')
    .replace('ensureDrumPiece(kit, /** @type {string} */ (piece));', 'ensureDrumPiece(kit, piece);')
    .replace("scheduleSynthDrumHit(ctx, '909', /** @type {string} */ (piece),", "scheduleSynthDrumHit(ctx, '909', piece,")
    .replace("scheduleSynthDrumHit(ctx, (kit && kit.preset) || '909', /** @type {string} */ (piece),", "scheduleSynthDrumHit(ctx, (kit && kit.preset) || '909', piece,")
    .replace('when, vol, /** @type {number} */ (dur), kit.level || 1)', 'when, vol, dur, kit.level || 1)')
    .replace("when, vol, /** @type {number} */ (dur));   // fallback: cold-load / missing piece", "when, vol, dur);   // fallback: cold-load / missing piece")
    .replace("when, vol, /** @type {number} */ (dur));\n  }", "when, vol, dur);\n  }"));
  source = source.replace(/function jamHotSwapAtWrap\(\) \{[\s\S]*?\n {2}\}/, swap =>
    swap.replace('rendererLifecycle.setBundle(activeBundle, /** @type {string} */ (cfg.renderer));',
      'rendererLifecycle.setBundle(activeBundle, cfg.renderer);'));
  source = source.replace("(piece === 'hh_open' && Number.isFinite(dur)) ? (/** @type {number} */ (dur)) : (DRUM_NATURAL_DUR[String(piece)] || 0.4)",
    "(piece === 'hh_open' && Number.isFinite(dur)) ? dur : (DRUM_NATURAL_DUR[String(piece)] || 0.4)");
  source = source.replace('scheduleDrumHit(ctx, drumKit, /** @type {string} */ (ev.voice),',
    'scheduleDrumHit(ctx, drumKit, ev.voice,');
  source = source.replace(/function syncTempoTierButtons\(\) \{[\s\S]*?\n {2}\}/, fn => fn
    .replace("    const activePathway = /** @type {import('./src/content/pathways.js').Pathway} */ (pw);\n", '')
    .replace('practiceSelection.applyTier(activePathway, i);', 'practiceSelection.applyTier(pw, i);')
    .replaceAll('tierChipLabel(activePathway, i)', 'tierChipLabel(pw, i)')
    .replaceAll('tierChipLabel(activePathway, nextIdx)', 'tierChipLabel(pw, nextIdx)'));
  source = source.replace("const summary = /** @type {HTMLDivElement} */ ($('virtuoso-summary'));",
    "const summary = $('virtuoso-summary');");
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
  source = source.replace("String(rigOutputDb(amp)) + ' dB'", "rigOutputDb(amp) + ' dB'");
  source = source.replace("try { const bus = hostBus(); if (bus && typeof bus.navigate === 'function') bus.navigate('settings'); } catch (_) {}",
    "try { if (hostBus() && typeof hostBus().navigate === 'function') hostBus().navigate('settings'); } catch (_) {}");
  source = source.replace("const screenBus = hostBus();\n    if (screenBus && typeof screenBus.on === 'function') {\n      screenBus.on('screen:changed',",
    "if (hostBus() && typeof hostBus().on === 'function') {\n      hostBus().on('screen:changed',");
  source = source.replace("$('virtuoso-pathway-scale')?.addEventListener('change', (ev) => { setFieldSilent('scale', (/** @type {HTMLSelectElement} */ (ev.target)).value);",
    "$('virtuoso-pathway-scale')?.addEventListener('change', (ev) => { setFieldSilent('scale', ev.target.value);")
    .replace("$('virtuoso-view-select')?.addEventListener('change', (e) => onViewSwitch((/** @type {HTMLSelectElement} */ (e.target)).value));",
      "$('virtuoso-view-select')?.addEventListener('change', (e) => onViewSwitch(e.target.value));")
    .replace("$('virtuoso-countin-default')?.addEventListener('change', (e) => { try { localStorage.setItem('virtuoso.countInDefault', (/** @type {HTMLSelectElement} */ (e.target)).value); } catch (_) {} applyCountInDefault((/** @type {HTMLSelectElement} */ (e.target)).value); });",
      "$('virtuoso-countin-default')?.addEventListener('change', (e) => { try { localStorage.setItem('virtuoso.countInDefault', e.target.value); } catch (_) {} applyCountInDefault(e.target.value); });");
  source = source.replace("  /** @type {Set<string | null | undefined>} */\n  const SEQ_SUPPORTING = new Set(['scale', 'chord_scales']);",
    "  const SEQ_SUPPORTING = new Set(['scale', 'chord_scales']);")
    .replace('    if (!pw) return null;\n    const pt = pw.base && pw.base.practiceType;',
      '    const pt = pw && pw.base && pw.base.practiceType;');
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
    .replaceAll('(/** @type {Error} */ (error)).message', 'error.message')
    .replaceAll('(/** @type {Error} */ (e)).message', 'e.message')
    .replaceAll('(/** @type {Error} */ (e2)).message', 'e2.message')
    .replaceAll('(/** @type {NonNullable<import(\'./src/types/audio-graph.js\').AudioBus[\'amps\']>} */ (bus.amps))', 'bus.amps')
    .replaceAll('(/** @type {import(\'./src/types/audio-graph.js\').MelodicBusEffects} */ (fx))', 'fx')
    .replaceAll('(/** @type {Record<string, string | null>} */ (_mixerRevealSig))', '_mixerRevealSig')
    .replaceAll("/** @type {Element} */ ($('virtuoso-root'))", "$('virtuoso-root')")
    .replaceAll("/** @type {Uint8Array<ArrayBuffer>} */ (_mixMeterBuf)", "_mixMeterBuf")
    .replaceAll('(/** @type {import(\'./src/types/audio-graph.js\').AudioBus} */ (audioBus))', 'audioBus')
    .replaceAll('(/** @type {NonNullable<typeof _jamMirror>} */ (_jamMirror)).noteCount++', '_jamMirror.noteCount++')
    .replaceAll('(/** @type {NonNullable<typeof _jamMirror>} */ (_jamMirror)).pcs.add(p)', '_jamMirror.pcs.add(p)')
    .replaceAll('(/** @type {number} */ (info.leanMs))', 'info.leanMs')
    .replaceAll('(/** @type {number} */ (info.leanN))', 'info.leanN')
    .replaceAll('(/** @type {number} */ (info.nearMiss))', 'info.nearMiss')
    .replaceAll('practiceSelection.setTier(/** @type {number} */ (primary.idx));', 'practiceSelection.setTier(primary.idx);')
    .replaceAll('practiceSelection.applyTier(pw, /** @type {number} */ (primary.idx))', 'practiceSelection.applyTier(pw, primary.idx)')
    .replaceAll('tiers[/** @type {number} */ (primary.idx)]', 'tiers[primary.idx]')
    .replaceAll('practiceSelection.setTier(/** @type {number} */ (stepdown.idx));', 'practiceSelection.setTier(stepdown.idx);')
    .replaceAll('practiceSelection.applyTier(pw, /** @type {number} */ (stepdown.idx))', 'practiceSelection.applyTier(pw, stepdown.idx)')
    .replaceAll('tiers[/** @type {number} */ (stepdown.idx)]', 'tiers[stepdown.idx]')
    .replaceAll("(/** @type {string} */ ((readConfig() || {}).key))", '(readConfig() || {}).key')
    .replaceAll("(/** @type {typeof showResultsModal & {_autoSig?: string}} */ (showResultsModal))", 'showResultsModal')
    .replaceAll('(/** @type {unknown[]} */ (s.tuning))', 's.tuning')
    .replaceAll('(/** @type {number} */ (cents))', 'cents')
    .replaceAll('(/** @type {number | undefined} */ (ev.dur))', 'ev.dur')
    .replaceAll('(/** @type {number} */ (ev.dur))', 'ev.dur')
    .replaceAll('(/** @type {number} */ (WAF_VOICE_VOL.drums))', 'WAF_VOICE_VOL.drums')
    .replaceAll('(/** @type {number} */ (ev.velocity))', 'ev.velocity')
    .replaceAll('DRUMKIT_BANKS[String(kit.bank)]', 'DRUMKIT_BANKS[kit.bank]')
    .replaceAll('DRUM_NATURAL_DUR[String(piece)]', 'DRUM_NATURAL_DUR[piece]')
    .replaceAll('(/** @type {number[]} */ (byBar.get(b)))', 'byBar.get(b)')
    .replaceAll("(/** @type {NonNullable<typeof bridge> & {getLevels: NonNullable<NonNullable<typeof bridge>['getLevels']>}} */ (bridge))", 'bridge')
    .replaceAll("(/** @type {NonNullable<ReturnType<typeof makeBundle>>} */ (bundle))", 'bundle')
    .replaceAll("(/** @type {NonNullable<import('./src/types/results-data.js').RunSummary['chapters']>} */ (s.chapters))", 's.chapters')
    .replaceAll("(/** @type {import('./src/types/results-data.js').RunSummary} */ (s))", 's')
    .replaceAll("(/** @type {import('./src/types/waf.js').WafPlayer} */ (wafPlayer))", 'wafPlayer')
    .replaceAll('(/** @type {number} */ (lvlBase))', 'lvlBase')
    .replaceAll("(/** @type {AnalyserNode} */ (_lvlAnalyser)).getFloatTimeDomainData(_lvlData)", '_lvlAnalyser.getFloatTimeDomainData(_lvlData)')
    .replaceAll("(/** @type {Float32Array<ArrayBuffer>} */ (_lvlData)).length", '_lvlData.length')
    .replaceAll("(/** @type {Float32Array<ArrayBuffer>} */ (_lvlData))[i]", '_lvlData[i]')
    .replaceAll("(/** @type {NonNullable<ReturnType<typeof hostMinigames>> & {scoring: Required<NonNullable<NonNullable<ReturnType<typeof hostMinigames>>['scoring']>>}} */ (hostMinigames()))", 'hostMinigames()')
    .replace("if ((/** @type {AudioContext} */ (audioCtx)).state === 'suspended') (/** @type {AudioContext} */ (audioCtx)).resume().catch(() => {});",
      "if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});")
    .replaceAll("(/** @type {import('./src/types/waf.js').WafPlayer} */ (wafPlayer))", 'wafPlayer')
    .replaceAll('(/** @type {number} */ (lvlBase))', 'lvlBase')
    .replace("ensureAudioCtx();\n    if ((/** @type {AudioContext} */ (audioCtx)).state === 'suspended') (/** @type {AudioContext} */ (audioCtx)).resume().catch(() => {});",
      "ensureAudioCtx();\n    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});")
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
  source = source.replace(/function showResultsModal\(s\) \{[\s\S]*?\n {2}\}/, modal =>
    modal.replaceAll('jamArmFromDrill(/** @type {string} */ (jamStyle),', 'jamArmFromDrill(jamStyle,'));
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
  source = source.replace("const bands = visiblePackOrder()\n      .map(id => PATHWAY_BANDS.find(b => b.id === id))\n      .filter(b => b !== undefined)",
    "const bands = visiblePackOrder()\n      .map(id => PATHWAY_BANDS.find(b => b.id === id))\n      .filter(Boolean)");
  source = source.replace(/function renderSkillTree\(\) \{[\s\S]*?\n {2}\}/, tree => tree
    .replace("line.setAttribute('x1', String(a.x)); line.setAttribute('y1', String(a.y));\n      line.setAttribute('x2', String(b.x)); line.setAttribute('y2', String(b.y));",
      "line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);\n      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);"));
  source = source.replace(/function renderPathwayList\(\) \{[\s\S]*?\n {2}\}/, list =>
    list.replace('b.ids.includes(/** @type {string} */ (practiceSelection.pathwayId))',
      'b.ids.includes(practiceSelection.pathwayId)'));
  source = source.replace(/function syncProgressStrip\(\) \{[\s\S]*?\n {2}\}/, strip => strip
    .replace('numEl.textContent = String(streak);', 'numEl.textContent = streak;'));
  source = source.replace(/function schedulePreviewAudio\([\s\S]*?\n {2}\}/, schedule => schedule
    .replace("        const drumEvent = /** @type {import('./src/core/generation-types.js').DrumEvent} */ (ev);\n", '')
    .replaceAll('drumEvent.voice', 'ev.voice')
    .replaceAll('drumEvent.velocity', 'ev.velocity')
    .replaceAll('drumEvent.dur', 'ev.dur')
    .replaceAll('(/** @type {number} */ (ev.dur))', 'ev.dur'));
  source = source.replace('const inner = /** @type {HTMLElement} */ (container.firstChild);', 'const inner = container.firstChild;');
  source = source.replace('function blockFeltInfo(b, devsOpt) {\n    if (!b) return null;\n',
    'function blockFeltInfo(b, devsOpt) {\n');
  source = source.replace(/function advancePathwayTier\(session\) \{[\s\S]*?\n {2}\}/, advance =>
    advance.replace('(/** @type {number} */ (session.bpm))', 'session.bpm'));
  source = source.replace(/function applyAnchorPolicy\(cfg\) \{[\s\S]*?\n {2}\}/, policy =>
    policy.replace('parseInt(/** @type {string} */ (/** @type {unknown} */ (cfg.anchorFret)), 10)', 'parseInt(cfg.anchorFret, 10)'));
  source = source.replace(/function reapplyActivePathway\(\) \{[\s\S]*?\n {2}\}/, pathway =>
    pathway.replace('parseInt(/** @type {string} */ (/** @type {unknown} */ (merged.anchorFret)), 10)', 'parseInt(merged.anchorFret, 10)'));
  source = source.replace(/function sessionBegin\(\) \{[\s\S]*?\n {2}\}/, begin =>
    begin.replace('/** @type {number} */ (bpm) >= t', 'bpm >= t'));
  source = source.replace(/function onTransportKey\(e\) \{[\s\S]*?\n {2}\}/, handler => handler
    .replace("const tag = ((/** @type {HTMLElement | null} */ (e.target))?.tagName || '').toLowerCase();",
      "const tag = (e.target?.tagName || '').toLowerCase();")
    .replace("|| (/** @type {HTMLElement | null} */ (e.target))?.isContentEditable) return;",
      '|| e.target?.isContentEditable) return;'));
  source = source.replace(/function snapshotFormState\(\) \{[\s\S]*?\n {2}\}/, handler =>
    handler.replace("if (cb instanceof HTMLInputElement && cb.type === 'checkbox' && cb.name && !(cb.name in out))",
      "if (cb.type === 'checkbox' && cb.name && !(cb.name in out))"));
  source = source.replace(/function sessionEnd\(\) \{[\s\S]*?\n {2}\}/, end =>
    end.replace('measureSeconds((/** @type {NonNullable<typeof activeBundle>} */ (activeBundle)).config)',
      'measureSeconds(activeBundle.config)'));
  source = source.replace(/function ptLeanBarsSnapshot\(\) \{[\s\S]*?\n {2}\}/, snapshot =>
    snapshot.replace('        const event = tl[ci];\n        if (!event) continue;\n        const eventSec = event.startSec != null ? event.startSec : event.t;\n        if (eventSec == null) continue;\n        const t0 = eventSec + lead;',
      '        const t0 = (tl[ci].startSec != null ? tl[ci].startSec : tl[ci].t) + lead;'));
  source = source.replace(/function _startWebLevelMeter\(\) \{[\s\S]*?\n {2}\}/, meter =>
    meter.replace(/const tick = \(\) => \{[\s\S]*?\n {8}\};/, tick =>
      tick.replace('(/** @type {AnalyserNode} */ (_lvlAnalyser)).getFloatTimeDomainData',
        '_lvlAnalyser.getFloatTimeDomainData')
        .replace('getFloatTimeDomainData(/** @type {Float32Array<ArrayBuffer>} */ (_lvlData))',
          'getFloatTimeDomainData(_lvlData)')));
  source = source.replace(/async function shareCardAction\(s, action\) \{[\s\S]*?\n {2}\}/, action =>
    action.replace("(/** @type {HTMLCanvasElement} */ (cv)).toBlob(r, 'image/png')",
      "cv.toBlob(r, 'image/png')"));
  source = source.replace(/async function onLaunchSession\(\) \{[\s\S]*?\n {2}\}/, handler =>
    handler.replace("const launchAudioCtx = ensureAudioCtx();\n    if (launchAudioCtx.state === 'suspended') launchAudioCtx.resume().catch(() => {});",
      "ensureAudioCtx();\n    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});")
      .replace("      if (!session) { showStatus('Build a Workout first.'); return; }\n", ''));
  source = source.replace(/function applyFormState\(state\) \{[\s\S]*?\n {2}\}/, apply =>
    apply.replace('/** @typedef {{type?: unknown, checked?: boolean, value?: string | boolean, length?: number, 0?: FormStateField}} FormStateField */\n      /** @type {FormStateField | null | undefined} */\n      let field = (/** @type {{[name: string]: FormStateField | null | undefined}} */ (/** @type {unknown} */ (form.elements)))[name];',
      'let field = form.elements[name];'));
  source = source.replace("profile: /** @type {string} */ (/** @type {unknown} */ (cfg.audioProfile || ''))", "profile: cfg.audioProfile || ''");
  source = source.replace(/document\.addEventListener\('click', \(e\) => \{\n {6}const pop = \$\('virtuoso-setup-popover'\);[\s\S]*?\n {4}\}\);/, listener =>
    listener.replaceAll('/** @type {Node | null} */ (e.target)', 'e.target'));
  source = source.replace(/document\.addEventListener\('click', \(e\) => \{\n {6}const menu = \$\('virtuoso-settings-menu'\);[\s\S]*?\n {4}\}\);/, listener =>
    listener.replaceAll('/** @type {Node | null} */ (e.target)', 'e.target'));
  source = source.replace(/rulerCanvas\.addEventListener\('pointerdown', \(e\) => \{[\s\S]*?\n {6}\}\);/, listener => listener
    .replace("if (!activeBundle || dur() <= 0) return;\n        const g = rulerGeom(); if (!g) return;\n        e.preventDefault();",
      "if (!activeBundle || dur() <= 0) return;\n        e.preventDefault();")
    .replace('prevA = transport.markerA; prevB = transport.markerB;\n        const y = e.clientY - g.rect.top;',
      'prevA = transport.markerA; prevB = transport.markerB;\n        const g = rulerGeom(); const y = e.clientY - g.rect.top;'));
  source = source.replace(/setTimeout\(\(\) => \{\n {8}const bus = hostBus\(\);\n {8}if \(!host\.offsetParent && bus && typeof bus\.on === 'function'\) return;\n {8}fire\(\);\n {6}\}, 1000\);/,
    "setTimeout(() => {\n        if (!host.offsetParent && hostBus() && typeof hostBus().on === 'function') return;\n        fire();\n      }, 1000);");
  return source;
}
