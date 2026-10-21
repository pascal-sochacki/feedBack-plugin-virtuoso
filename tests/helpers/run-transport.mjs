import {parse} from '../../scripts/vendor/acorn.mjs';
import {normalizeEntrySafety} from './entry-safety.mjs';

export const transportChangedStatements = new Set([
  'transport','stopRunAudio','currentPracticeTime','playAnchorCtx','paused','_preRollUntil','playStartChartTime',
  'segmentLoopA','tpA','sessionPausedMs','stopRendererPlayback','preparePlayback',
  'endFiniteRun','anchorPlayClock','tick','startPlayback','stopPlayback','pausePlayback','resumePlayback',
  'onPlayToggle','onLaunchSession','seekTo','commitLoop','resetTransportLoop','loopCurrentSegment','nudgeLoopEdge',
  'onTransportKey','jamPlay','jamHotSwapAtWrap','bind','setSegmentLoop','clearSegmentLoop',
  'rendererLifecycle','practiceSelection','sessionLaunch','sessionLaunchIdentity', 'eventElement', 'eventValueElement', 'eventClosest'
]);

// Only these audited, callerless private declarations may leave the old order pin.
export const removedUnusedStatements = new Set([
  'FRETBOARD_SYSTEM_LABELS', 'SEQUENCE_LABELS', 'PT_WIN_LATE', 'fretboardSystemLabel',
  'pianoPathwayActive', 'proofCardText', '_ndCardApi', '_resultsCardData', '_virCardOverlay'
]);

export function normalizeTransport(source) {
  source = normalizeEntrySafety(source);
  // Parentheses needed to attach type trivia have no executable AST effect;
  // normalize only these exact audited expressions, not arbitrary syntax.
  source = source.replace('(buildBackingEvents(cfg, cl)).concat', 'buildBackingEvents(cfg, cl).concat')
    .replace("({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[c]", "{ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[c]")
    .replace("((BUILT_IN_SESSIONS[id].segments || []).map(materializeSegment).filter(Boolean))", "(BUILT_IN_SESSIONS[id].segments || []).map(materializeSegment).filter(Boolean)")
    .replace("((sess.segments || []).map(materializeSegment).filter(Boolean))", "(sess.segments || []).map(materializeSegment).filter(Boolean)")
    .replace("const wafVar  = gm => (/** @type {`_tone_${string}`} */ ('_tone_' + wafFile(gm)));", "const wafVar  = gm => '_tone_' + wafFile(gm);")
    .replace("const wafVar  = gm => /** @type {`_tone_${string}`} */ ('_tone_' + wafFile(gm));", "const wafVar  = gm => '_tone_' + wafFile(gm);")
    .replace(/(xAt: |tAt: |inView: |at = )\(\/\*\* @type \{number\} \*\/ (t|cx)\) =>/g, '$1$2 =>')
    .replace('next.cpcs.every((/** @type {number} */ pc) =>', 'next.cpcs.every(pc =>')
    .replace('all.filter((/** @type {import(\'./src/types/progress-data.js\').Routine | null} */ p) =>', 'all.filter(p =>')
    .replace('st.installed.filter((/** @type {string} */ id) =>', 'st.installed.filter(id =>')
    .replace('st.order.filter((/** @type {string} */ id) =>', 'st.order.filter(id =>')
    .replace('inst.forEach((/** @type {string} */ id) =>', 'inst.forEach(id =>')
    .replace('_sessions.map((/** @type {{date: string}} */ s) =>', '_sessions.map(s =>')
    .replace(".filter((/** @type {string} */ id) => STYLE_PALETTES[id])", '.filter(id => STYLE_PALETTES[id])');
  // The saved entry had no JSDoc. Remove only developer type trivia, keeping
  // executable source and every pre-existing behavior comment in the byte pin.
  source = source.replace(/^[ \t]*\/\*\*(?:(?!\*\/)[\s\S])*?@(type|param|template|overload|returns)\b(?:(?!\*\/)[\s\S])*?\*\/[ \t]*\n/gm, '')
    .replace(/\/\*\*\s*@type\s+\{[^\n]*?\}\s*\*\/[ \t]*/g, '');
  source = source.replace('    function inWindow(t, now) { const dt = t - now; return dt >= -BEHIND && dt <= AHEAD; }\n', '')
    .replace('const padX = 2, usableW = W - padX * 2, lz =', 'const padX = 2, lz =')
    .replace("let TXT = '#f8fafc', DIM = '#cbd5e1', MUT = '#94a3b8', FAINT = '#64748b';", "let TXT = '#f8fafc', DIM = '#cbd5e1', MUT = '#94a3b8';")
    .replace("MUT = gv('--vir-card-faint', MUT); FAINT = MUT;", "MUT = gv('--vir-card-faint', MUT);")
    .replace('// path). _ndCardApi/_resultsCardData/_virCardOverlay are kept dormant below\n    // in case a host-level card capability ever supersedes ours.', '// path). The unused private delegation adapters have been retired.');
  // Keep immutable before-source hashes: only the audited unused parameter edits
  // normalize, never their bodies or arbitrary underscore-prefixed identifiers.
  source = source.replace('function maybeScheduleLoopAhead() {', 'function maybeScheduleLoopAhead(nowMs) {')
    .replace('function scheduleBackingEnvelope(bundle, _ctx, base, startFrom, duration) {', 'function scheduleBackingEnvelope(bundle, ctx, base, startFrom, duration) {')
    .replace('s.ladder.tiers.map((_tier, i) => {', 's.ladder.tiers.map((b, i) => {')
    .replace('tiers.forEach((_bpm, i) => {', 'tiers.forEach((bpm, i) => {');
  const fields = {playing:'playing',paused:'paused',time:'currentPracticeTime',startTime:'playStartChartTime',
    anchorTime:'playAnchorChartTime',anchorMs:'playAnchorMs',anchorAudio:'playAnchorCtx',preRollUntil:'_preRollUntil',
    loopA:'segmentLoopA',loopB:'segmentLoopB',markerA:'tpA',markerB:'tpB',wraps:'_loopWraps'};
  for (const [field, name] of Object.entries(fields)) {
    source = source.replaceAll(`${name}:transport.${field}`, name)
      .replaceAll(`transport.${field}`, name);
  }
  return source;
}

export function transportStatements(source, excluded = new Set(), normalize = text => text) {
  const body = parse(source,{ecmaVersion:2022,sourceType:'module'}).body.find(node=>node.expression?.callee?.type==='FunctionExpression').expression.callee.body.body;
  return body.filter(node=>!transportChangedStatements.has(node.id?.name||node.declarations?.[0]?.id?.name)
    && !removedUnusedStatements.has(node.id?.name||node.declarations?.[0]?.id?.name)
    && !excluded.has(node.id?.name||node.declarations?.[0]?.id?.name)
    && !source.slice(node.start,node.end).includes("Object.defineProperty(globalThis.__ss_debug, 'lifecycle'"))
    .map(node=>normalize(normalizeTransport(source.slice(node.start,node.end))));
}
