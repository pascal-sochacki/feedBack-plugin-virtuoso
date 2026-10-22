import { createRunTransport } from './src/shell/run-transport.js';
import { hostBus, hostMinigames, hostDesktop, loadScriptOnce } from './src/shell/renderers/host-factories.js';
import { createRendererLifecycle } from './src/shell/renderer-lifecycle.js';
import { SEGMENT_TEMPLATES, SEGMENT_ROLES, SEGMENT_BANDS } from './src/content/segments.js';
import { stylePaletteConfig } from './src/core/config-defaults.js';
import { readConfig, syncAdvancedMode, setFieldSilent, applyPracticeConfig } from './src/shell/practice-config.js';
import { createPracticePresets } from './src/shell/practice-presets.js';
import { createPracticeSelection } from './src/shell/practice-selection.js';
import { PRACTICE_APPLICABILITY, offerable } from './src/core/practice-selection.js';
import { createPracticePresentation } from './src/shell/practice-presentation.js';
import { countInSubTicks } from './src/core/count-in.js';
import { rollSegment, refreshWorkout, materializeSegment, prettyKind, segmentEstDuration } from './src/core/segments.js';
import { applyLengthPreset } from './src/core/workout-length.js';
// Empty imports preserve module evaluation order while removing obsolete bindings.
import {} from './src/core/session-config.js';
import {} from './src/core/session-chart.js';
import { generateSession } from './src/core/session.js';
import { STYLE_PALETTES, JAM_PROG_LABELS, jamProgressionLabel } from './src/core/style-palettes.js';
import { blockTargetSec } from './src/core/chart-tiling.js';
import {} from './src/core/key-cycle.js';
import { jamSpotlightPhraseNotes } from './src/core/jam-chart.js';
import { generateExercise } from './src/core/exercise.js';
import { AUDIO_FAMILY_DEFAULTS, AUDIO_PROFILES, resolveAudioProfile } from './src/core/audio-profiles.js';
import { DRUM_PIECE_GAIN, DRUM_GROOVES, resolveGroove, buildDrumEvents } from './src/core/drum-grooves.js';
import { recipeTracks, buildBackingEvents } from './src/core/backing.js';
import { SWING_RATIOS, swingNotesBacking, applyFeelLean } from './src/core/feel.js';
import { buildMotifExercise } from './src/core/builders/motif.js';
import {} from './src/core/exercise-dispatch.js';
import { cfgAudioProfile, ARRANGEMENT_TIERS, ARRANGEMENT_RECIPES, resolveArrangement } from './src/core/arrangement.js';
import { COMP_ARTIC, COMP_GROOVES, TGT, compCellForConfig, BANJO_DRONE_BY_TONIC, compTargetMidis, buildCompCellHits } from './src/core/comp-cells.js';
import { BASS_FIG_FLOOR, BASS_FIG_CEIL, BASS_FIGURES, bassFigureForConfig } from './src/core/bass-figures.js';
import { STRUM_GRIPS } from './src/core/strum-grips.js';
import { STRUM_PATTERNS } from './src/core/builders/strum.js';
import { compileChordTimeline, applyTimelinePush } from './src/core/chord-timeline.js';
import { MOTIF_CELLS, resolveMotifCell } from './src/core/motif.js';
import { pcAtOrAbove } from './src/core/voicing.js';
import {} from './src/core/builders/pedal-riff.js';
import {} from './src/core/builders/bass.js';
import {} from './src/core/builders/tapping.js';
import {} from './src/core/builders/guide-tones.js';
import { resolveHumanSeed } from './src/core/random.js';
import {} from './src/core/sequence.js';
import { scalePcs, nearestPositionForPc } from './src/core/positions.js';
import { buildBeats } from './src/core/chart-grid.js';
import { COMMON_PROGRESSIONS, chordRootForDegree } from './src/core/harmony.js';
import {} from './src/core/chord-positions.js';
import {} from './src/core/builders/scale.js';
import {} from './src/core/builders/technique.js';
import {} from './src/core/builders/arpeggio.js';
// Virtuoso — FeedBack practice chart generator + renderer adapter.
import { NOTE_NAMES, NOTE_ALIASES, pcName, midiToFreq } from './src/core/pitch.js';
import { SCALE_INTERVALS } from './src/core/scale-intervals.js';
import { CAGED_SHAPES, CAGED_CYCLE, THREE_NPS_POSITION_DEFS, THREE_NPS_CYCLE, openPcForString, pcOfDegree, degreeOfPc, resolveCAGEDShape, resolveThreeNPSPosition, resolveOpenShape, isOpenSystemSensible, fretWindowForShape, shapeOrderForKey, nextShapeInCycle, isShapeAwareSystem, defaultShapeForSystem } from './src/core/fretboard-shapes.js';
import { CHORD_FORMULAS, DIATONIC_QUALITIES } from './src/core/chord-theory.js';
import { RHYTHM_CELLS, parseMeter, secondsPerDivision, measureSeconds } from './src/core/timing.js';
import {} from './src/core/notes.js';
import { applyEconomyPicking, applyGypsyPicking, applyMetalPicking, applyBassPlucking } from './src/core/stroke-policy.js';
import { CHROMATIC_PATTERN_LABELS } from './src/core/builders/chromatic.js';
import {} from './src/core/practice-files.js';
import { PATHWAYS } from './src/content/pathways.js';
import { BUILT_IN_SESSIONS } from './src/content/workouts.js';
import { PATHWAY_BANDS, SKILL_TREE_NODES, SKILL_TREE_EDGES, PACK_FAMILY_ORDER } from './src/content/pathway-bands.js';

(function () {
  'use strict';

  // ===========================================================================
  // TABLE OF CONTENTS
  // The IIFE remains during bottom-up native-module extraction so startup and
  // closure state keep their original order. See docs/plugin/native-modules.md.
  // Major sections are marked with a "§N" banner below.
  //
  //   §1  Constants & music-theory data
  //   §2  Curated pathways (PATHWAYS)
  //   §3  Built-in sessions (BUILT_IN_SESSIONS)
  //   §4  CAGED / 3NPS / Open shape system (CAGED_SHAPES, resolveCAGEDShape)
  //   §5  Chord-depth / diatonic extension engine
  //   §6  Voicing engine (docs/theory/musicality-guardrails.md Layer 2)
  //   §7  Exercise builders (scale / chord-scale / arpeggio / sweep / chromatic / guide-tones)
  //   §8  generateExercise() dispatch
  //   §9  Session builders (segment / bpm-ladder / session charts, generateSession)
  //   §10 Exercise title + makeBundle()
  //   §11 Built-in 2D renderers (Jumping-Tab fallback, Tab, Notation)
  //   §12 Renderer factory + borrowed host viz
  //   §13 Live fretboard strip
  //   §14 Transport, HUD, playback clock + audio engine
  //   §15 DOM wiring (bind) + public surface (window.VirtuosoLab)
  // ===========================================================================
  //
  // CORE / SHELL BOUNDARY (host-independence — see CLAUDE.md "Key constraints"):
  // The GENERATION PATH — generateExercise/generateSession (§8–§9) and everything
  // they call (data tables §1–§3, shape/voicing/theory engines §4–§6, exercise
  // builders §7, the pure chart helpers in §10) — is the host- AND DOM-independent
  // engine: Virtuoso's durable IP and the basis for a future standalone app /
  // embeddable library. It takes a plain `cfg` and returns a plain
  // `{ version, session, chart }` (the CHART is the portable artifact) and must
  // NEVER reference window, document, localStorage, fetch, or any `slopsmith*`
  // global. Verified by smoke-core-purity.mjs (traps the host surface, runs every
  // builder). `makeBundle()` (§10) is the chart→renderer-bundle BOUNDARY — it reads
  // display prefs (highway inverted/lefty/render-scale/look), so it's the FIRST
  // SHELL step, not core. §11–§15 + routes.py are the THIN, DISPOSABLE SHELL;
  // FeedBack is one implementation behind it. `readConfig()` (§15) is the single
  // DOM→cfg funnel. (Other shell helpers — the AudioContext patch, goScreen, $(),
  // the WAF loader — are physically interleaved in the §1–§10 line span but are
  // shell-class; the guard is behavioural precisely because the file isn't
  // physically partitioned yet — a future Step-1 module split relocates them.)
  // ===========================================================================

  // Plugin version shown in the header next to the title. The host doesn't inject
  // a plugin's own version into its screen (note_detect hardcodes `_ND_VERSION`
  // the same way), so this is the display mirror of plugin.json's "version".
  // BUMP THIS WHENEVER plugin.json's version changes (release checklist).
  const VIRTUOSO_VERSION = '0.2.14-lab.1';

  // ===========================================================================
  // §1 · CONSTANTS & MUSIC-THEORY DATA
  // note names, string setups, scale intervals, chord formulas, diatonic
  // qualities, common progressions, sequence + chromatic patterns.
  // ===========================================================================
  const STRING_COLORS = ['#ef4444', '#eab308', '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ec4899', '#14b8a6'];
  const AUDIO_LOOKAHEAD_SECONDS = 0.20;
  // Rolling-window scheduling (backing-engine step 0, 2026-06-05). Audio is
  // scheduled in ~SCHED_WINDOW_SECONDS chunks of chart time rather than whole
  // passes: a Play on a 30-min Workout used to create ~39k audio nodes in one
  // 1.57s main-thread block (dev-ops audit), and the backing engine multiplies
  // event density several-fold. The tick refills the next chunk whenever the
  // scheduled horizon falls within SCHED_REFILL_AHEAD of the context clock —
  // chunk boundaries (incl. the loop seam) stay gapless because each chunk is
  // queued on the same AudioContext clock before the previous one ends.
  const SCHED_WINDOW_SECONDS = 10;
  const SCHED_REFILL_AHEAD = 4;
  // Detector tracking floor (Hz): pitches below this are honest-ungraded (excluded
  // from judgment like chords — the click is the judge); the tuner octave-folds
  // sub-floor targets (YIN reports the 2nd harmonic). LOWERED 70 → 30 (2026-06-28)
  // per the notedetect-expert verdict: note_detect's low-end is fixed (30 Hz
  // detection floor + 2048 frame ≈ 3× bass recall + sample-rate accumulation buffer
  // + HPS; native comb/ML on the DI rig), so the old 70 Hz gate OVER-exempted low
  // bass the detector now hears (E1 41 Hz, A1 55 Hz, 5-string low B 30.9 Hz). 30 Hz
  // sits just below low B. RISK (accepted on the user's call): 70 originally tracked
  // the minigames SDK's YIN minHz — if the WEB SDK is still 70, sub-70 notes go
  // MISSED, not exempt, on the web path; the desktop/DI-rig contained verifier is 30.
  const DETECTOR_MIN_HZ = 30;
  // Startup integrity guard (mirrors the no-unison / applicability / strum-grip guards):
  // a cell that doesn't close on a whole number of beats would desync the click, the
  // loop, and the count-in. Caught the panel's bad Scotch-snap [0.25,0.5] (¾ of a beat).
  (function assertRhythmCellsValid() {
    for (const name of Object.keys(RHYTHM_CELLS)) {
      const beats = RHYTHM_CELLS[name].beats;
      if (!Array.isArray(beats) || !beats.length) throw new Error(`[Virtuoso rhythm-cell] ${name} has no beats array`);
      if (beats.some(b => !(b > 0))) throw new Error(`[Virtuoso rhythm-cell] ${name} has a non-positive step`);
      const sum = beats.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - Math.round(sum)) > 1e-6) throw new Error(`[Virtuoso rhythm-cell] ${name} sums to ${sum} beats — must be a whole number of beats (it would phase against the bar)`);
      const strokes = RHYTHM_CELLS[name].strokes;
      if (strokes != null && (!Array.isArray(strokes) || strokes.length !== beats.length || strokes.some(s => s !== 'd' && s !== 'u'))) {
        throw new Error(`[Virtuoso rhythm-cell] ${name} strokes must be a d/u array matching beats (${beats.length})`);
      }
    }
  })();
  // Tempo tier labels — shared by all pathways. Index 0 = Slow.
  const TIER_LABELS = ['Slow', 'Med', 'Fast', 'Push'];
  // §2 · CURATED PATHWAYS
  // label, goal, scales[], tempoTiers[], base config, vary[] (Next-Variation cycle).
  // Passive definitions remain live through the selection owner's catalog hydration.
  // ===========================================================================

  // ===========================================================================
  // §3 · BUILT-IN SESSIONS
  // multi-segment session presets (ii-V-I Workshop, Daily 30-min, Blues, Bebop).
  // ===========================================================================
  //
  // A session is an ordered list of exercise segments. Each segment configures
  // one exercise type and duration. buildSessionChart() concatenates them into
  // a single sloppak with section markers. See docs/plugin/session-schema.md for the
  // full field reference.
  //
  // Segment `kind` values map to buildSingleChart() mode dispatch:
  //   scale | chord_scales | diatonic_arpeggios | progression_arpeggios |
  //   sweep_arpeggios | chromatic | guide_tones | modal_vamp | bending
  //
  // Built-in sessions follow established jazz pedagogy. The "ii-V-I Workshop"
  // segment order follows a standard guide-tone-first learning sequence.

  // Starter definitions are imported from src/content/workouts.js.

  // ===========================================================================
  // §4 · CAGED / 3NPS / OPEN SHAPE SYSTEM
  // CAGED_SHAPES (unified source of truth) + degree-driven, no-unison resolution.
  // ===========================================================================
  //
  // A "shape" is a way of organizing a scale across the fretboard. Virtuoso
  // supports three systems: CAGED (5 shapes), 3NPS (7 modal positions), and
  // Open (key-specific, uses open strings). The fret window of a shape is
  // *derived* from the key — it isn't a user-supplied fret range.
  //
  // String indices follow Virtuoso's existing convention: s=0 is the lowest
  // string (low E in standard tuning, index 0 of openMidis). s=5 is high E.
  //
  // See docs/theory/fretboard-pedagogy.md for the design rationale and
  // docs/archive/position-system-rework.md for how this data model is intended to
  // flow into the rest of the plugin.

  // Startup integrity guard (pedagogy review 2026-06-06; mirrors the
  // STRUM_GRIPS finger-collision guard): a chord template drawn MOVABLE must be
  // humanly fingerable — one finger holds ONE fret offset (equal fOffs = a
  // barre), and a barre may not cross a LOWER fret offset on a string inside
  // its span (the finger would have to lie through it). Caught the A:dim and
  // D:dim fg data bugs above on first run. Exclusions, by design:
  //   G:*  — an open-position shape; the strum lane voices its movable form as
  //          a PARTIAL (pickStrumGrip) and the walk skips movable G min/dim.
  //   C:min — no real movable C-minor grip exists (a 5-finger form); excluded
  //          from the strum lane's movable picks (walk + economy).
  //   E:dim — the full 6-string movable dim doesn't exist either (the ♭5 sits a
  //          fret BELOW the would-be barre); real dim comping uses the 4-string
  //          D/A forms. Excluded from the strum lane's movable picks likewise.
  (function assertCagedChordTemplatesValid() {
    const SKIP = new Set(['G:maj', 'G:min', 'G:dim', 'C:min', 'E:dim']);
    for (const shape of Object.keys(CAGED_SHAPES)) {
      const tmpls = CAGED_SHAPES[shape].chordTemplates || {};
      for (const q of Object.keys(tmpls)) {
        if (SKIP.has(`${shape}:${q}`)) continue;
        const ent = tmpls[q];
        /** @type {Record<string, {s: number, fOff: number, iv: number, fg: number}[]>} */
        const byFg = {};
        for (const n of ent) { if (!n.fg) continue; (byFg[n.fg] = byFg[n.fg] || []).push(n); }
        for (const fg of Object.keys(byFg)) {
          const grp = byFg[fg];
          const offs = new Set(grp.map(n => n.fOff));
          if (offs.size > 1) throw new Error(`[Virtuoso caged-template] ${shape}:${q} finger ${fg} spans fret offsets ${[...offs].join(',')} (impossible)`);
          if (grp.length >= 2) {
            const lo = Math.min.apply(null, grp.map(n => n.s)), hi = Math.max.apply(null, grp.map(n => n.s)), f = grp[0].fOff;
            for (const n of ent) {
              if (n.s > lo && n.s < hi && n.fOff < f) throw new Error(`[Virtuoso caged-template] ${shape}:${q} barre (finger ${fg} at fOff ${f}) crosses a lower stop on string ${n.s} (impossible)`);
            }
          }
        }
      }
    }
  })();

  // Resolve the shape selected in the form (or default) into fret range +
  // shape-note set. Called by readConfig. Returns null if the current system
  // isn't shape-aware (callers should fall back to raw fretMin/fretMax).
  // Expose for DevTools inspection and (soon) chart generation.
  if (typeof window !== 'undefined') {
    window.__virtuoso_labShapes = {
      CAGED_SHAPES,
      THREE_NPS_POSITION_DEFS,
      CAGED_CYCLE,
      THREE_NPS_CYCLE,
      resolveCAGEDShape,
      resolveThreeNPSPosition,
      resolveOpenShape,
      isOpenSystemSensible,
      fretWindowForShape,
      shapeOrderForKey,
      nextShapeInCycle,
      defaultShapeForSystem,
      isShapeAwareSystem,
      // Helpers
      openPcForString,
      pcOfDegree,
      degreeOfPc
    };
  }

  // Smoke tests — verify the data model produces correct output for known
  // reference cases. Fires once on load via console.assert; failures are
  // visible in DevTools but don't break the plugin.
  (function smokeTestShapeSystem() {
    const guitar = [40, 45, 50, 55, 59, 64];
    /** @param {import('./src/core/fretboard-shapes.js').ResolvedShape | null} shape */
    function fretsByString(shape) {
      /** @type {Record<string, number[]>} */
      const map = {};
      for (const n of (/** @type {import('./src/core/fretboard-shapes.js').ResolvedShape} */ (shape)).notes) {
        if (!map[n.s]) map[n.s] = [];
        map[n.s].push(n.f);
      }
      for (const s of Object.keys(map)) map[s] = map[s].slice().sort((a, b) => a - b);
      return map;
    }
    /** @param {(string | number)[] | null} a @param {(string | number)[] | null} b */
    function arraysEqual(a, b) {
      if (!a || !b || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }
    // CAGED C-shape in C major → frets 0–5, root at A-string fret 3
    const cShapeC = resolveCAGEDShape(0, 'C', 'major', guitar);
    console.assert((/** @type {boolean} */ (/** @type {unknown} */ (cShapeC && cShapeC.fretMin === 0 && cShapeC.fretMax === 5))),
      '[Virtuoso shapes] C-shape in C major should span frets 0–5', cShapeC);
    console.assert((/** @type {import('./src/core/fretboard-shapes.js').ResolvedShape} */ (cShapeC)).notes.some(n => n.s === 1 && n.f === 3 && n.isRoot),
      '[Virtuoso shapes] C-shape in C major should have root at s=1 f=3', cShapeC);
    // CAGED E-shape in G major → root on low E fret 3, span 2–7
    const eShapeG = resolveCAGEDShape(7, 'E', 'major', guitar);
    console.assert((/** @type {boolean} */ (/** @type {unknown} */ (eShapeG && eShapeG.fretMin === 2 && eShapeG.fretMax === 7))),
      '[Virtuoso shapes] E-shape in G major should span frets 2–7', eShapeG);
    console.assert((/** @type {import('./src/core/fretboard-shapes.js').ResolvedShape} */ (eShapeG)).notes.some(n => n.s === 0 && n.f === 3 && n.isRoot),
      '[Virtuoso shapes] E-shape in G major should have root at s=0 f=3', eShapeG);
    // 3NPS Position 1 (Ionian) in C major → low E starts at fret 8
    const pos1C = resolveThreeNPSPosition(0, 1, 'major', guitar);
    const pos1Frets = fretsByString(pos1C);
    console.assert(arraysEqual(pos1Frets[0], [8, 10, 12]),
      '[Virtuoso shapes] 3NPS Pos 1 in C major, low E should be [8,10,12]', pos1Frets);
    console.assert(arraysEqual(pos1Frets[4], [10, 12, 13]),
      '[Virtuoso shapes] 3NPS Pos 1 in C major, B string should be [10,12,13]', pos1Frets);
    // 3NPS Position 1 in G major → low E starts at fret 3
    const pos1G = resolveThreeNPSPosition(7, 1, 'major', guitar);
    const pos1GFrets = fretsByString(pos1G);
    console.assert(arraysEqual(pos1GFrets[0], [3, 5, 7]),
      '[Virtuoso shapes] 3NPS Pos 1 in G major, low E should be [3,5,7]', pos1GFrets);
    // CAGED order in C major: C → A → G → E → D
    const cagedC = shapeOrderForKey(0, 'caged', 'major', guitar);
    console.assert(arraysEqual(cagedC, ['C', 'A', 'G', 'E', 'D']),
      '[Virtuoso shapes] CAGED order in C major should be C,A,G,E,D', cagedC);
    // CAGED order in G major: G → E → D → C → A
    const cagedG = shapeOrderForKey(7, 'caged', 'major', guitar);
    console.assert(arraysEqual(cagedG, ['G', 'E', 'D', 'C', 'A']),
      '[Virtuoso shapes] CAGED order in G major should be G,E,D,C,A', cagedG);
    // Open is sensible for C major (root on B-string fret 1, plenty of notes)
    console.assert(isOpenSystemSensible(0, 'major', guitar),
      '[Virtuoso shapes] Open should be sensible for C major');
    // Open is NOT sensible for Db major or Ab major — those are the only two
    // major keys with no root note in frets 0-3 across any string.
    console.assert(!isOpenSystemSensible(1, 'major', guitar),
      '[Virtuoso shapes] Open should NOT be sensible for Db major (no root in frets 0-3)');
    console.assert(!isOpenSystemSensible(8, 'major', guitar),
      '[Virtuoso shapes] Open should NOT be sensible for Ab major (no root in frets 0-3)');
    // Next-variation cycle in C major CAGED: C → A → G → E → D → C
    console.assert(nextShapeInCycle(0, 'caged', 'C', 'major', guitar) === 'A',
      '[Virtuoso shapes] After C-shape in C major, next is A-shape');
    console.assert(nextShapeInCycle(0, 'caged', 'D', 'major', guitar) === 'C',
      '[Virtuoso shapes] After D-shape in C major, wraps to C-shape');
    // No-unison rule: a resolved scale shape must never place the same pitch
    // (openMidi + fret) on two strings. Roots in different octaves are distinct
    // midis and are kept; only true unisons are dropped. Regression guard for
    // the duplicate-root bug (fret-window blocks doubled pitches across strings).
    /** @param {import('./src/core/fretboard-shapes.js').ResolvedShape | null} resolved */
    const shapeDupMidis = (resolved) => {
      if (!resolved) return ['unresolved'];
      const seen = new Set(), dups = [];
      for (const n of resolved.notes) {
        const midi = guitar[n.s] + n.f;
        if (seen.has(midi)) dups.push(midi); else seen.add(midi);
      }
      return dups;
    };
    for (const k of [0, 7, 9, 2, 3]) for (const sc of ['major', 'natural_minor', 'harmonic_minor']) {
      for (const shape of CAGED_CYCLE) {
        const d = shapeDupMidis(resolveCAGEDShape(k, shape, sc, guitar));
        console.assert(d.length === 0,
          `[Virtuoso no-unison] CAGED ${shape}-shape key=${k} ${sc} doubles a pitch`, d);
      }
      const od = shapeDupMidis(resolveOpenShape(k, sc, guitar));
      console.assert(od.length === 0,
        `[Virtuoso no-unison] Open key=${k} ${sc} doubles a pitch`, od);
    }
    // Finger-collision guard over the authored CAGED chord templates
    // (hand-marks Slice 3 — mirrors assertStrumGripsValid's byFinger check;
    // the double-booked-finger class shipped twice in grip data before the
    // guard existed): one finger may barre many strings at ONE fret offset,
    // never sit on two different offsets. fg is display-only, so the pitch
    // checks above can't catch it — but a chord box drawing an impossible
    // fingering misteaches.
    for (const shapeKey of Object.keys(CAGED_SHAPES)) {
      const cts = CAGED_SHAPES[shapeKey].chordTemplates || {};
      for (const quality of Object.keys(cts)) {
        /** @type {Record<string, Set<number>>} */
        const byFinger = {};
        for (const n of cts[quality]) { if (!n.fg) continue; (byFinger[n.fg] = byFinger[n.fg] || new Set()).add(n.fOff); }
        for (const fg of Object.keys(byFinger)) {
          console.assert(byFinger[fg].size <= 1,
            `[Virtuoso chord-template] ${shapeKey}/${quality} finger ${fg} spans ${byFinger[fg].size} fret offsets (impossible)`);
        }
      }
    }
  })();

  let /** @type {ReturnType<typeof makeBundle> | null} */ activeBundle = null, /** @type {number | null} */ rafId = null, /** @type {import('./src/types/entry-data.js').EntryExercise | null} */ lastExercise = null;
  let sessionLaunch = null;
  let /** @type {((bundle: import('./src/types/entry-data.js').EntryBundle | null) => void) | null} */ playbackProbe = null, /** @type {((bundle: import('./src/types/entry-data.js').EntryBundle | null) => Promise<void>) | null} */ voicesProbe = null;
  const rendererLifecycle = createRendererLifecycle({
    makeHighway:makeBuiltin2DRenderer, makeTab:makeBuiltin2DTabRenderer, makeNotation:makeBuiltin2DNotationRenderer,
    onBeforeAttach:stopRendererPlayback,
    prepareScene(exercise, cfg) {
      syncPlayButton();
      activeBundle = makeBundle(exercise); transport.moveCursor(0);
      resetTransportLoop(); maybeResyncMixer(cfg); fretboardSyncRange();
      return activeBundle;
    },
    onRendererCommitted(label) { const status = $('virtuoso_lab-renderer-status'); if (status) status.textContent = label; drawOnce(); },
    onLayoutChanged:drawOnce, isPlaying:() => transport.playing, onWindowResized:ptDodgeOverlays
  });

  const practiceSelection = createPracticeSelection({
    getContext: () => ({family:currentFamily(), hasBundle:!!activeBundle}),
    bands:PATHWAY_BANDS,
    applySelectedConfig, changeModeView,
    stopAndInvalidatePlayback(reset) {
      stopRenderer();
      if (reset !== 'none') { activeBundle = null; lastExercise = null; transport.moveCursor(0); }
      if (reset === 'loop') resetTransportLoop();
    },
    regenerateSelectedConfig:onGenerate,
    presentation:{renderFile:() => practicePresentation.renderFile(), renderPosition:() => practicePresentation.renderPosition(), renderCatalog:renderPathwayList, refreshStatus:refreshStatusFromState}
  });
  const transport = createRunTransport({operation:rendererLifecycle, getBundle:()=>activeBundle,
    prepareVoices:awaitVoices, startPlayback,
    clockNow:()=>({wallMs:performance.now(), audioSeconds:audioCtx ? audioCtx.currentTime : null})});
  // Pause remains a sub-state of playing; session duration excludes its wall time.
  function sessionPausedMs() { return transport.sessionPausedMs(); }
  // Visible-rewind wrap animation (Workout-love Tier 2 polish): when the loop
  // wraps (whole-chart re-entry or an A–B loop), the overview playhead would just
  // teleport from the seam-out point back to the seam-in point. Instead we mirror
  // the host's animated loop-wrap with a brief draw-only "tape rewind" sweep of the
  // overview playhead. Draw-only — never touches the clock/audio (those already
  // wrapped seamlessly). { fromT, atMs } | null; reduced-motion + tiny loops skip it.
  /** @type {{fromT: number, atMs: number} | null} */
  let _wrapAnim = null;
  const WRAP_ANIM_MS = 300;
  // Reached-tracking for the end-of-Workout recap (Tier 3): a chapter shows
  // "practiced" only if the run actually reached it. _runMaxChartTime = furthest
  // chart time seen in the current pass; _runLooped = a loop wrap happened (so the
  // whole session was reached). Reset on each fresh start. Pure display state.
  let _runMaxChartTime = 0, _runLooped = false;
  // Per-block INPUT tracking (engagement Tier A — the foundational per-block
  // measurement). _blockHadInput[i] = real mic input arrived inside segmentBounds[i]'s
  // window this run → the recap can show "played ●" vs "scrolled past ○" honestly,
  // and the seam can drop a "done" claim on a block the player never sounded. Reset
  // per run; marked from the level path (the same gate that arms _ptHadInput).
  /** @type {boolean[]} */
  let _blockHadInput = [];
  function markBlockInput() {
    const sb = activeBundle && activeBundle.segmentBounds;
    if (!sb || sb.length < 2) return;
    const t = transport.time;
    for (let i = 0; i < sb.length; i++) { if (t >= sb[i].start - 1e-3 && t < sb[i].end + 1e-3) { _blockHadInput[i] = true; return; } }
  }
  /** @param {number} fromT @param {number} toT */
  function triggerWrapRewind(fromT, toT) {
    if (Math.abs(fromT - toT) < 2.5) return;   // a short A–B loop would strobe — only animate a meaningful span
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    _wrapAnim = { fromT, atMs: performance.now() };
  }
  let /** @type {import('./src/types/results-data.js').SessionLog | null} */ _activeSession = null, _sessionStartMs = 0, /** @type {number | null} */ _newlyUnlockedTier = null;
  /** @type {import('./src/types/results-data.js').RunSummary | null} */
  let _lastEndedSession = null;  // the just-finished session → the P-sheet "Last session" card
  // Session transport: index of the segment currently under the playhead, so
  // the highlight only touches the DOM when it actually changes.
  let _activeSegIdx = -1;
  let /** @type {AudioContext | null} */ audioCtx = null, /** @type {import('./src/types/audio-graph.js').ScheduledResource[]} */ audioNodes = [];
  // Rolling-window scheduling bookkeeping (see maybeScheduleLoopAhead).
  // scheduledUntilCtx = absolute AudioContext time up to which audio has been
  // scheduled (the horizon; the next chunk begins here). schedChartPos = the
  // chart time the next chunk starts from (wraps duration→leadIn at the loop
  // seam). schedChunks tracks each scheduled chunk's nodes + real sound-end
  // time so finished chunks can be disconnected — keeps the live node count
  // bounded (~2-3 chunks) during extended practice.
  let scheduledUntilCtx = 0, schedChartPos = 0, /** @type {{nodes: import('./src/types/audio-graph.js').ScheduledResource[], endCtx: number}[]} */ schedChunks = [];
  // highway_3d's _bgGetAnalyser() creates a fresh AudioContext every call
  // until setup succeeds, then calls ctx.close() in the catch block when
  // createMediaElementSource throws (stem_mixer already holds the element).
  // That close() produces an audible transient click. Fix: while Virtuoso
  // has an active context, return a lightweight stub instead. The stub throws
  // InvalidStateError on createMediaElementSource (flags the failure as
  // permanent so highway_3d stops retrying) and no-ops close() (no click).
  (function patchAudioContextForSharing() {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    // The stub must survive WHATEVER highway_3d's analyser setup calls on it, not
    // just createMediaElementSource: it also builds gain/analyser nodes around
    // that source. Any create* returns an inert no-op node (connect/disconnect
    // chainable); createMediaElementSource still throws (the signal that makes
    // highway_3d treat setup as permanently failed and stop retrying); close()
    // no-ops (no real context to close → no audible click). Without the catch-all
    // create*, an early audioCtx (now created on pathway-select preload) flips
    // highway into this path and `ctx.createGain()` throws "not a function".
    const makeFakeCtx = () => {
      const noopNode = new Proxy({}, { get: (_t, p) => ((p === 'connect' || p === 'disconnect') ? (() => noopNode) : (() => {})) });
      /** @type {Record<PropertyKey, unknown>} */
      const base = {
        state: 'closed',
        currentTime: 0,
        close: () => Promise.resolve(),
        createMediaElementSource: () => {
          throw new DOMException('AudioContext already in use by Virtuoso', 'InvalidStateError');
        },
      };
      return new Proxy(base, {
        get(target, prop) {
          if (prop in target) return target[prop];
          if (typeof prop === 'string' && prop.startsWith('create')) return () => noopNode;
          return undefined;
        },
      });
    };
    // Only hand out the click-suppressing stub while Virtuoso's OWN screen is
    // the active one (its root has a layout box → offsetParent set; the host
    // hides inactive plugin screens with display:none). When Virtuoso is
    // backgrounded — the user is on the host player loading a song — every
    // `new AudioContext()` MUST be the real thing, or OTHER plugins' stem
    // loaders get a context with no decodeAudioData/etc.
    //
    // This is the fix for the v0.5.0 cross-plugin regression: the old gate keyed
    // off "a Virtuoso audioCtx exists and isn't closed", which (once the
    // pathway-select preload created the ctx) stayed true for the rest of the
    // session and globally crippled `window.AudioContext` for the whole page —
    // breaking the host's stem decode ("ctx.decodeAudioData is not a function").
    // Scoping to the active screen keeps the highway-click fix (Virtuoso on
    // screen) while leaving the global pristine for everyone else.
    const virtuoso_labActive = () => { const r = document.getElementById('virtuoso_lab-root'); return !!(r && r.offsetParent); };
    /** @param {ConstructorParameters<typeof AudioContext>} args */
    const Patched = function(...args) {
      // Only fake when there's NO scoring SDK. The fake exists solely to suppress the
      // borrowed highway's audio-reactive-bg AudioContext (an audible click) on OLD
      // hosts that don't honor bundle.bgReactive:false (#650). A host WITH the Minigames
      // SDK is a current host: it honors bgReactive:false (no bg ctx → no click → no fake
      // needed) AND its scorer opens its OWN `new AudioContext()` for the mic — which the
      // fake would BREAK (resume() is undefined, state 'closed') → the tuner / grading /
      // per-note gems silently die. So when the SDK is present, always hand out the REAL
      // context. (ptAvailable() ⇔ "current host" — the scorer + #650 shipped together.)
      if (virtuoso_labActive() && audioCtx && audioCtx.state !== 'closed' && !ptAvailable()) return makeFakeCtx();
      return new Ctor(...args);
    };
    Patched.prototype = Ctor.prototype;
    Object.defineProperty(window, 'AudioContext', { value: Patched, configurable: true, writable: true });
    if (window.webkitAudioContext) Object.defineProperty(window, 'webkitAudioContext', { value: Patched, configurable: true, writable: true });
  }());
  // Notation renderer is notation-only — tab is its own renderer now.

  // Theme palette for the Tab and Notation renderers. The light theme is the
  // parchment-and-ink look we shipped for Tab; the dark theme mirrors it on a
  // navy ground. The 3D Highway and 2D Highway renderers are not affected —
  // they have their own color identities.
  // Active theme for renderers that participate. Light is the default.
  let currentRenderTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('virtuoso_lab.renderTheme')) || 'light';
  if (currentRenderTheme !== 'light' && currentRenderTheme !== 'dark') currentRenderTheme = 'light';
  function getRenderTheme() { return RENDER_THEMES[currentRenderTheme] || RENDER_THEMES.light; }
  // Hand-marks display switch (hand-marks Slice 1; UX ruling): ONE toggle,
  // default ON, persisted, never auto-flipped — beginner/advanced scaling
  // happens at EMISSION (the pedagogy lane), not by flipping the player's
  // switch. Read per-frame by the Tab renderer + fretboard strip.
  function handMarksOn() { try { return localStorage.getItem('virtuoso_lab.showHandMarks') !== 'off'; } catch (_) { return true; } }
  // Hand-marks "lesson" sets (panel ruling 2026-06-18): on these drills the marks
  // ARE the content, so the renderers must NOT thin them at dense spacing.
  // chromatic/spider/sweep/fingerstyle → the FRET-HAND fingers are the lesson;
  // picking/strum/bass-RH drills → the STROKES are the lesson. Keyed off
  // bundle.config.mode (single drills); mixed sessions keep the default simile
  // decimation. Display-only — none of this ever feeds scoring/XP.
  /** @param {string} name */
  function setRenderTheme(name) {
    if (name !== 'light' && name !== 'dark') return;
    currentRenderTheme = name;
    try { localStorage.setItem('virtuoso_lab.renderTheme', name); } catch (_) {}
    if (rendererLifecycle.renderer && activeBundle) drawOnce();
  }
  // Pitch tracker state — wraps slopsmithMinigames.scoring.createContinuous (no registration required)
  let /** @type {import('./src/types/host-interfaces.js').ContinuousPitchHandle | null} */ _ptHandle = null, /** @type {import('./src/types/entry-data.js').EntryNote[]} */ _ptNotes = [], /** @type {number[]} */ _ptOpenMidis = [], /** @type {Set<string>} */ _ptScored = new Set(), /** @type {Map<string, import('./src/types/entry-data.js').EntryNote>} */ _ptByKey = new Map(), _ptHadInput = false, /** @type {{t: number, f: number, c: number} | null} */ _ptLive = null;
  /** @type {import('./src/types/results-data.js').RunInfo | null} */
  let _ptRunInfo = null;        // results-modal diagnostics: judged universe + exemptions + which ear (set per run)
  let _ptSpanCount = 0;         // tremolo spans this run (unit-denominated)
  let _ptExempt = null;         // Slice-2 class counts { legato, fast, spanNotes, floorMs } (set per run)
  let _ptJamRun = false;        // Jam run: scorer may run for the meter, but no note ever paints judged
  let _deliberateStop = false;  // true only across an explicit Stop / finite-run end — gates the results modal
  // ── Input-level SILENCE gate (2026-06-09 grading FIX — mirror the host's
  //    ACTUAL gate; supersedes the 2026-06-08 onset gate) ─────────────────────
  // P0 (host-expert diff `project_grading_regression_diff_2026-06-09`, confirmed
  // twice against the live note_detect 1.10 consumer): the host's real grader
  // (note_detect :5550-5588) is a PURE ONE-WAY VETO — it runs ONLY on an already-
  // detected pitch verdict and, over ±200ms of the note, forces a MISS iff samples
  // are present AND peak inputLevel < 0.02 (_ND_SILENCE_THRESHOLD). It does NOT
  // require an attack onset, and SKIPS the veto when no samples cover the window
  // ("no telemetry ≠ silent"). The 2026-08 rebuild wrongly made the gate a POSITIVE
  // precondition that ALSO demanded a +11dB onset edge + inflated the floor (rest×4)
  // — on a high-gain/compressed/sustained DI the level envelope is flat, so a
  // re-pick is only a few dB over the ringing baseline → no onset fired → every note
  // after the first was rejected ("graded in FeedBack, not Virtuoso"). The fix:
  // match the host EXACTLY — a one-way level veto at fixed 0.02, NO onset, skip-when-
  // no-samples. The sub-0.02 idle-residual false-positive the rebuild targeted stays
  // dead (a residual below 0.02 is vetoed when the meter is live — and his is: the
  // host grades on the same getLevels source). No host level source → gate INACTIVE
  // (fail-open-to-honest; the detector's pitch/comb evidence still has to fire).
  const PT_LVL_FLOOR_MIN = 0.02;     // host's _ND_SILENCE_THRESHOLD (−34 dBFS on the host's 0..1 meter)
  const PT_LVL_RECENT_WIN = 0.2;     // a live (non-span) credit gates on the input level over the last 200ms (host's ±200ms), ending at the credit moment — NOT the note's future-extending window (which has no samples at its leading edge → would skip the veto)
  let _lvlMode = 'none';             // 'desktop' (getLevels) | 'web' (own analyser) | 'none' (gate inactive)
  /** @type {{jt: number, L: number}[]} */
  let _lvlSamples = [];              // ring of { jt: judge-time, L } (bounded 512)
  /** @type {ReturnType<typeof setInterval> | null} */
  let _lvlPoll = null;               // desktop getLevels interval
  let _lvlGen = 0;                   // bumped on every start/stop — an in-flight async getLevels resolving after teardown is ignored
  let _lvlRaf = 0;                   // web analyser RAF handle
  let /** @type {MediaStream | null} */ _lvlStream = null, /** @type {AnalyserNode | null} */ _lvlAnalyser = null, /** @type {Float32Array<ArrayBuffer> | null} */ _lvlData = null;   // web tap
  // ── Timing model (2026-06-06 seven-lane panel; MIRRORS the host's grader) ──
  // The host's note_detect judges with PARALLEL per-note candidate windows
  // (early-strict ±100ms; late grace rides the sustain, capped 1s), disambiguates
  // overlapping candidates by PITCH (an adjacent fret is 100¢ — candidates never
  // cross-verify), and subtracts a latency offset from the judging playhead
  // (its shipped default 0.080s). Virtuoso's old model — serialized first-match
  // active note + a 2-CONSECUTIVE-frame streak on the raw clock — judged every
  // attack against the PREVIOUS note in continuous runs (the chromatic
  // "unforgiving" complaint). See docs/archive/timing-judging-roundtable.md.
  const PT_DETECT_LATENCY = 0.080;  // the DEFAULT anchor (host's shipped default) — see ptLatency()
  // ── Slice 3: A/V latency auto-calibration (mirrors the host's sweep) ───────
  // The judge clock's anchor is a HIDDEN per-device setting, refined at the end
  // of each scored run by the host-mirror offset sweep (maximize matched notes
  // over the run's offset-free detections, refine by mean residual — the
  // host's `_ndCalibrateOffsetMs` objective, note_detect screen.js:708).
  // EMA-blended (0.7 old / 0.3 new), clamped 0–250ms, persisted
  // `virtuoso_lab.latencyMs`. No UI (the roundtable's "hidden latency setting");
  // disclosed in the verbose diagnostics. Seeding order (2026-06-07): our own
  // MEASURED anchor wins when stored; else the host tuner's latencyOffset
  // slider (localStorage['slopsmith_notedetect'] — the player already dialed
  // it for the same mic chain); else the host's shipped 80ms default. (The
  // host CORE's av_offset_ms is a different, server-side setting — still not
  // readable.) NEVER written host-side; the sweep self-corrects either way.
  let _ptLatencyS = (() => {
    // CONSUME the host tuner's player-dialed latencyOffset, else the host's
    // shipped 80ms default. We no longer SELF-MEASURE latency: the old
    // `virtuoso_lab.latencyMs` sweep was YIN-fed and never hears a DI, so it wrote
    // stale offsets (the 123ms that delayed the hit-flare). Sweep that key out.
    try { localStorage.removeItem('virtuoso_lab.latencyMs'); } catch (_) {}
    try {
      const s = JSON.parse(localStorage.getItem('slopsmith_notedetect') || '{}');
      if (Number.isFinite(s.latencyOffset)) return Math.max(0, Math.min(0.25, s.latencyOffset));
    } catch (_) {}
    return PT_DETECT_LATENCY;
  })();
  function ptLatency() { return _ptLatencyS; }
  const PT_CAL_MAX = 6000;          // offset-free detection log cap (~4 min at meter cadence)
  /** @type {{bt: number, m: number}[]} */
  let _ptCalLog = [];               // [{ bt: RAW practice time, m: float MIDI }] — reset per run
  // Cents to the NEAREST OCTAVE of the expected midi (host-mirror: octave-
  // tolerant matching keeps the sweep robust to 2nd-harmonic readings).
  /** @param {number} m @param {number} em */
  function ptNearestOctaveCents(m, em) {
    const c = (m - em) * 100;
    return c - 1200 * Math.round(c / 1200);
  }
  // The host-mirror sweep, pure: detections {bt, m} (bt RAW — our log carries
  // no latency subtraction, so the best offset ≈ −latency), single-pitch
  // windows from the run's table. Returns { offsetMs, matched, total } | null.
  /** @param {{bt: number, m: number}[]} detections @param {import('./src/types/judgment-data.js').JudgmentWindow[]} windows @param {{loMs?: number, hiMs?: number, stepMs?: number, minMatched?: number, winS?: number, tolCents?: number}} [opts] */
  function ptCalibrateOffsetMs(detections, windows, opts) {
    opts = opts || {};
    const loMs = opts.loMs != null ? opts.loMs : -250, hiMs = opts.hiMs != null ? opts.hiMs : 250;
    const stepMs = opts.stepMs || 10, minMatched = opts.minMatched != null ? opts.minMatched : 12;
    const winS = opts.winS || 0.15, tolCents = opts.tolCents || 50;
    if (!Array.isArray(detections) || detections.length < minMatched) return null;
    const exp = [];
    for (const w of (windows || [])) {
      if (w.span || !w.notes || w.notes.length !== 1) continue;   // single-pitch evidence only
      const n = w.notes[0], om = _ptOpenMidis[n.s];
      if (om != null) exp.push({ t: w.t, em: om + n.f });
    }
    if (exp.length < minMatched) return null;
    const dets = detections.slice().sort((a, b) => a.bt - b.bt);
    let best = null;
    for (let ms = loMs; ms <= hiMs; ms += stepMs) {
      const off = ms / 1000;
      let matched = 0, residSum = 0;
      for (const note of exp) {
        for (let i = 0; i < dets.length; i++) {
          const dt = dets[i].bt + off - note.t;
          if (dt < -winS) continue;
          if (dt > winS) break;                  // dets sorted by bt → past the window
          if (Math.abs(ptNearestOctaveCents(dets[i].m, note.em)) <= tolCents) { matched++; residSum += dt; break; }
        }
      }
      if (!best || matched > best.matched) best = { ms, matched, resid: matched ? residSum / matched : 0 };
    }
    if (!best || best.matched < minMatched) return null;
    const refinedMs = Math.round(best.ms - best.resid * 1000);   // center matches in their windows
    return { offsetMs: Math.max(-1000, Math.min(1000, refinedMs)), matched: best.matched, total: exp.length };
  }
  const PT_WIN_EARLY = 0.100;       // DEFAULT window pad (host's shipped timingHitThreshold) — see ndTimingInherit
  const PT_RING_CAP  = 1.0;         // ring credit rides the sustain, capped (host: min(sus, 1s))
  // ── Inherited timing windows (2026-06-07, Christian's "still unforgiving") ──
  // The host's answer to strictness is PLAYER SLIDERS: note_detect persists
  // "Clean Timing" (timingHitThreshold), the chord window, the match tolerance,
  // and a latency slider in localStorage['slopsmith_notedetect'] — the same key
  // ndLabelGates already reads. Virtuoso INHERITS those values per run
  // (inherit-never-write, the highway-settings doctrine): loosen the host tuner
  // once and every Virtuoso drill agrees. Clamp chain mirrors the host's own
  // load-time clamps (note_detect screen.js:1551–1558, 1593–1594); absent key /
  // absent fields = today's defaults, byte-identical behavior.
  let _ptNdWin = { single: PT_WIN_EARLY, chord: 0.150 };
  function ndTimingInherit() {
    const out = { single: PT_WIN_EARLY, chord: 0.150 };
    try {
      const s = JSON.parse(localStorage.getItem('slopsmith_notedetect') || '{}');
      const tol = Number.isFinite(s.timingTolerance) ? Math.max(0.03, Math.min(0.3, s.timingTolerance)) : 0.150;
      if (Number.isFinite(s.timingHitThreshold)) out.single = Math.max(0.03, Math.min(tol, s.timingHitThreshold));
      if (Number.isFinite(s.chordTimingHitThreshold)) out.chord = Math.min(tol, s.chordTimingHitThreshold);
      if (out.chord < out.single) out.chord = out.single;
    } catch (_) {}
    return out;
  }
  // Evidence rule (2026-06-06 feel panel, audio-engine source finding): the
  // HOST commits a hit on ONE clean frame — no pair rule exists in any host
  // path. And YIN confidence is BIMODAL by construction: a FRESH detection is
  // always > 0.85 (CMND < 0.15 at the accepted dip); every frame ≤ 0.85 is a
  // stale FADE re-emitting the previous pitch (×0.85/frame). So scoring
  // credits a single fresh frame; fades never score (they carry old pitch).
  // The old 2-frame pair guarded the 40ms-EMA lock-on sweep — that sweep died
  // with smoothingMs 12 (raw frames don't glide); the scoring-e2e wrong-key
  // negative control is the standing arbiter that single-frame stays honest.
  const PT_CONF_FRESH = 0.85;       // scoring evidence: fresh YIN locks only
  const PT_CONF_INPUT = 0.55;       // input-presence + meter display floor
  const PT_BEND_CENTS = 600;        // bn notes: lenient pitch gate (host convention — the hit rides
                                    // presence + timing, never a moving bend target)
  // ── Slice 2: the fast-idiom honesty layer (docs/archive/timing-judging-roundtable.md;
  //    constants characterized by probe-verifier-envelope 2026-06-06) ──────────
  const PT_MIN_RING_YIN = 0.045;      // per-note certifiability floor, YIN ear. Under
                                      // the single-frame commit (feel panel 2026-06-06)
                                      // a note is certifiable once its usable span
                                      // covers ≥1 fresh frame at the ~40ms detector
                                      // cadence (+ margin). Written-staccato spans are
                                      // measured net of the speak budget (the string
                                      // starts from mute); legato-ish runs ring ≈ IOI
                                      // (continuous energy re-locks fast — no speak
                                      // debit). A 180-BPM gallop doublet (~83ms ring,
                                      // staccato-cut) still exempts = checkpoint
                                      // judging preserved.
  const PT_MIN_RING_VERIFIER = 0.050; // MEASURED: the harmonic comb confirms 94% of
                                      // 50ms gated bursts (100% ≥100ms, degrades at
                                      // 35ms) → 200 BPM 16ths honestly judgeable in
                                      // verifier mode. Same probe: palm-mute SURVIVES
                                      // the comb (100%), and the verifier has NO 70Hz
                                      // floor (E1 + B0 100%) — the sub-floor exemption
                                      // dissolves in verifier mode (YIN keeps it).
  const PT_SPAN_BUCKET = 0.100;       // tremolo-span presence bucket (s)
  const PT_SPAN_RATIO = 0.6;          // span hit = rung buckets / total ≥ this
  // Contained-verifier chord credit: the engine scores each chord member
  // independently; a chord window credits when ≥ this fraction of its members
  // verified (N-of-M leniency — power-chord strings share harmonics, so not
  // every string verifies on a clean strum). Mirrors the host's 0.5 verify
  // ratio (note_detect _ND_VERIFY_MIN_HIT_RATIO); a single note is 1/1 → credit
  // on its one detected verdict.
  const PT_CHORD_HIT_RATIO = 0.5;
  // f0-derived post-roll speak budget (bass-pedagogy ruling: a low string's
  // usable evidence arrives late — SHIFT the evidence slot for physics, never
  // widen the timing tolerance as forgiveness). clamp(3·period+25, 35, 80)ms:
  // D2≈66ms, A2≈52ms, ≥G3≈35–40ms — drop-tuned guitar gets bass physics
  // automatically; a bassist high on the G string doesn't.
  /** @param {number} f0 */
  function ptSpeakBudget(f0) {
    return Math.min(0.080, Math.max(0.035, 3 / f0 + 0.025));
  }
  // Per-note identity key for the #254 gem hook: the host highway calls
  // bundle.getNoteState(note, note.t) and matches notes by (s, f, t), so we judge on
  // that same composite — reference-independent (the highway may normalize our notes).
  /** @param {import('./src/types/entry-data.js').EntryNote} n */
  const ptKey = (n) => n.s + '|' + n.f + '|' + Math.round((n.t || 0) * 1e4);
  // ── Precomputed window table — ONE source of truth for both ears ───────────
  // Built once per run in startPitchTracker from the judged set, grouped by
  // onset-group (a chord = one window). matchStart/matchEnd are the PARALLEL
  // candidate bounds (YIN ear; same-pitch neighbors clamp at the midpoint — the
  // one case pitch can't disambiguate, so a ringing chug/pedal can't credit its
  // successor). exclStart/exclEnd are the midpoint-split EXCLUSIVE bounds: the
  // verifier's one-target-at-a-time owner and the passed denominator. The cursor
  // is monotonic; a backward seek ≥ 0.25s (loop wrap, overview click-seek)
  // re-searches from the top — mirrors the host's backward-seek note reopen.
  /** @type {import('./src/types/judgment-data.js').JudgmentWindow[]} */
  let _ptWin = [];                 // [{ key, t, susEff, matchStart, matchEnd, exclStart, exclEnd, notes[], pcs, credited, span? }]
  /** @type {Map<string, import('./src/types/judgment-data.js').JudgmentWindow>} */
  let _ptWinByKey = new Map();     // ptKey(note) → window entry (gem miss-arming)
  let _ptWinLo = 0;                // monotonic cursor: first entry with matchEnd > tJudge
  let _ptWinLastT = -Infinity;
  /** @type {number[]} */
  let _ptWinPassedNotes = [];      // prefix sums of UNITS (span = 1, else notes.length) → passed denominator is O(1)
  let _ptScoredUnits = 0;          // unit-denominated hits (a tremolo span = 1 unit; a chord = its member count)
  /** @type {import('./src/types/judgment-data.js').SpanWindow[]} */
  let _ptSpanPending = [];         // span windows awaiting end-of-span evaluation (time-sorted)
  /** @type {{d: number, t: number, sb: number}[]} */
  let _ptDevs = [];                // first-evidence deviations vs onset (s) — the timing-tendency aggregate
  let _ptNearMiss = 0;             // in-pitch frames just OUTSIDE their window (the near-miss aggregate)
  /** @type {{key: string | null, cents: number}} */
  let _ptMeterEma = { key: null, cents: NaN };  // display-only cents smoothing (scoring uses raw frames)
  /** @param {import('./src/types/entry-data.js').EntryNote[]} notes @param {(note: import('./src/types/entry-data.js').EntryNote) => string} gk */
  function ptBuildWindows(notes, gk) {
    _ptWin = []; _ptWinByKey = new Map(); _ptWinLo = 0; _ptWinLastT = -Infinity; _ptWinPassedNotes = [];
    _ptScoredUnits = 0; _ptSpanPending = []; _ptDevs = []; _ptNearMiss = 0; _ptCalLog = [];
    _ptMeterEma = { key: null, cents: NaN };
    /** @type {Map<string, import('./src/types/entry-data.js').EntryNote[]>} */
    const groups = new Map();
    for (const n of notes) { const k = gk(n); if (!groups.has(k)) groups.set(k, []); (/** @type {import('./src/types/entry-data.js').EntryNote[]} */ (groups.get(k))).push(n); }
    const wins = [...groups.entries()].map(([key, gn]) => {
      const t = Math.min(...gn.map(n => n.t));
      // A tremolo SPAN (key 'tr@…', built by the Slice-2 classifier): one judged
      // unit covering the whole same-pitch run — its ring is the span itself,
      // never capped (host convention: tr = ONE judged note).
      const span = key.indexOf('tr@') === 0;
      const ringEnd = Math.max(...gn.map(n => n.t + (n.sus || 0.24)));
      const susEff = span ? (ringEnd - t) : Math.min(PT_RING_CAP, Math.max(...gn.map(n => n.sus || 0.24)));
      const pcs = new Set(gn.map(n => (_ptOpenMidis[n.s] ?? 0) + n.f));
      // f0-derived speak budget: extend the POST-roll so a late-speaking low
      // note's evidence lands in its own slot (clamped to the neighbor by the
      // midpoint pass below — never stolen from the next note).
      const budget = ptSpeakBudget(midiToFreq(Math.min(...pcs)));
      // Per-group threshold = the INHERITED host tuner values (_ptNdWin,
      // refreshed per run): singles ride "Clean Timing" (default ±100ms,
      // early-strict), chord groups the chord window (default ±150ms — strum
      // spread + FFT smear + anticipation; note_detect :1440). The same
      // threshold pads the LATE side past the ring (host: threshold + grace).
      const thr = gn.length > 1 ? _ptNdWin.chord : _ptNdWin.single;
      /** @type {import('./src/types/judgment-data.js').JudgmentWindowBase & Partial<Pick<import('./src/types/judgment-data.js').SpanWindow, 'span' | 'spanEnd' | 'bktN' | 'bkts'>>} */
      const w = { key, t, susEff, matchStart: t - thr, matchEnd: t + susEff + thr + budget,
               exclStart: t - thr, exclEnd: t + susEff + thr + budget, notes: gn, pcs,
               // Speak-budget EXCESS over the 35ms floor (s) — the register-DEPENDENT
               // part of detection lag (D2 ≈ +31ms, ≥G3 ≈ 0). The felt-hold verdict
               // subtracts it per deviation (D3, roundtable §7): the latency anchor
               // absorbs the CONSTANT lag, but a walking line crossing registers
               // would otherwise read its low notes late (fake "Dragging") and
               // inflate jitter past the Locked band. The guitar tendency line
               // keeps reading raw .d (anchor-calibrated, single-register).
               sbx: Math.max(0, budget - 0.035),
               credited: false };
      if (span) { w.span = true; w.spanEnd = ringEnd; w.bktN = Math.max(1, Math.ceil((ringEnd - t) / PT_SPAN_BUCKET)); w.bkts = new Set(); }
      return /** @type {import('./src/types/judgment-data.js').JudgmentWindow} */ (w);
    }).sort((a, b) => a.t - b.t);
    for (let i = 0; i + 1 < wins.length; i++) {
      const a = wins[i], b = wins[i + 1], mid = (a.t + b.t) / 2;
      a.exclEnd = Math.min(a.exclEnd, mid); b.exclStart = Math.max(b.exclStart, mid);
      let share = false; for (const pc of a.pcs) if (b.pcs.has(pc)) { share = true; break; }
      if (share) { a.matchEnd = Math.min(a.matchEnd, mid); b.matchStart = Math.max(b.matchStart, mid); }
    }
    let acc = 0;
    for (const w of wins) {
      acc += w.span ? 1 : w.notes.length;   // a span is ONE unit in the denominator
      _ptWinPassedNotes.push(acc);
      for (const n of w.notes) _ptWinByKey.set(ptKey(n), w);
      if (w.span) _ptSpanPending.push(w);
    }
    _ptWin = wins;
  }
  // ── Borrowed-highway judgment events (feel-panel reconciliation 2026-06-07) ─
  // The host 3D highway renders its native hit flare / miss mark + the
  // "↑ +Nms" / "♯ +N¢" label sprites from window CustomEvents
  // (notedetect:hit / notedetect:miss). Since feedBack#254 highway_3d's getNoteState
  // PROVIDER is authoritative over these window marks — see ptGetNoteState's live
  // keep-alive, which stops the provider-cull deleting a gem before our async verdict.
  // Dispatching them from OUR judge gets that rendering free. The panel's
  // binding conditions: HIGHWAY-ONLY (our own surfaces keep the quiet
  // grammar); dispatch = TRUTH (evidence-backed judged outcomes only — exempt
  // notes are never in the window table; Jam never dispatches; misses need
  // _ptHadInput, mirroring the gem gate); label FIELDS are gated by the
  // host's own showTimingErrors/showPitchErrors (read-only from
  // localStorage['slopsmith_notedetect'], absent = true — the
  // inherit-never-write doctrine): omitting a field yields the red mark with
  // no label (the host labels iff state truthy ≠ 'OK' + finite error).
  let _ptLabelGates = { timing: true, pitch: true };
  function ndLabelGates() {
    try {
      const s = JSON.parse(localStorage.getItem('slopsmith_notedetect') || '{}');
      return { timing: s.showTimingErrors !== false, pitch: s.showPitchErrors !== false };
    } catch (_) { return { timing: true, pitch: true }; }
  }
  /** @param {string} type @param {import('./src/types/judgment-data.js').JudgmentWindow} w @param {import('./src/types/judgment-data.js').JudgmentInfo | null} info */
  function ptDispatchJudgment(type, w, info) {
    if (_ptJamRun) return;   // the mirror never judges — no events in Jam
    for (const n of w.notes) {
      /** @type {import('./src/types/judgment-data.js').JudgmentInfo & {note: {s: number, f: number}, noteTime: number}} */
      const detail = { note: { s: n.s, f: n.f }, noteTime: n.t };
      if (info) {
        if (info.timingState && _ptLabelGates.timing) { detail.timingState = info.timingState; detail.timingError = info.timingError; }
        if (info.pitchState && _ptLabelGates.pitch) { detail.pitchState = info.pitchState; detail.pitchError = info.pitchError; }
      }
      try { window.dispatchEvent(new CustomEvent('notedetect:' + type, { detail, bubbles: true })); } catch (_) {}
    }
  }
  // Credit a window ONCE: gems light per member key; the accuracy counters are
  // unit-denominated (a span = 1; a chord = its member count, matching the
  // denominator's prefix sums).
  /** @param {import('./src/types/judgment-data.js').JudgmentWindow} w */
  function ptCreditWindow(w) {
    if (w.credited) return false;
    if (!ptCreditGatePasses(w)) return false;   // independent absolute-level + onset evidence (host-mirror silence gate)
    w.credited = true;
    _ptScoredUnits += w.span ? 1 : w.notes.length;
    for (const n of w.notes) _ptScored.add(ptKey(n));
    ptDispatchJudgment('hit', w, null);   // the host hit flare (label-free)
    return true;
  }
  // End-of-span evaluation: a tremolo span is a hit when in-tune presence
  // covered ≥ PT_SPAN_RATIO of its 100ms buckets (the "rang in tune over the
  // run" rule) — evaluated once the span has fully passed on the judge clock.
  /** @param {number} tJudge */
  function ptFinalizeSpans(tJudge) {
    while (_ptSpanPending.length && tJudge > _ptSpanPending[0].spanEnd + 0.05) {
      const w = _ptSpanPending.shift();
      if (!w) continue;
      if (!w.credited && w.bkts.size / w.bktN >= PT_SPAN_RATIO) ptCreditWindow(w);
    }
  }
  /** @param {number} tJudge */
  function ptWinSeek(tJudge) {   // advance (or re-search) the cursor; returns it
    if (tJudge < _ptWinLastT - 0.25) _ptWinLo = 0;
    _ptWinLastT = tJudge;
    while (_ptWinLo < _ptWin.length && _ptWin[_ptWinLo].matchEnd <= tJudge) {
      // Window expired un-credited = the miss MOMENT: dispatch the host miss
      // event once (flag guards the loop-wrap re-walk), with whatever
      // diagnostic the judge actually witnessed (in-window wrong-pitch →
      // SHARP/FLAT; in-pitch near-window → EARLY/LATE; nothing → mark-only).
      // _ptHadInput mirrors the gem miss gate (an idle mic never reds out).
      // Contained mode: the ENGINE owns miss (detected:false at window close,
      // dispatched in ndDrainContainedVerdicts) — the local cursor must NOT
      // race-expire the window before the async verdict lands, or every hit
      // verdict arrives to an already-missed window (the ~0-credit DI bug).
      const w = _ptWin[_ptWinLo];
      if (!w.credited && !w.missDispatched && _ptHadInput && !_ndContainedMode) {
        w.missDispatched = true;
        ptDispatchJudgment('miss', w, w.missInfo || null);
      }
      _ptWinLo++;
    }
    return _ptWinLo;
  }
  /** @param {number} tJudge */
  function ptWinPassedCount(tJudge) {   // notes whose candidate window fully passed (the denominator)
    const lo = ptWinSeek(tJudge);
    return lo > 0 ? _ptWinPassedNotes[lo - 1] : 0;
  }
  /** @param {number} tJudge */
  function ptWinOwnerAt(tJudge) {       // the one-target owner (midpoint-split exclusive bounds)
    for (let i = ptWinSeek(tJudge); i < _ptWin.length; i++) {
      const w = _ptWin[i];
      if (w.exclStart > tJudge) break;
      if (tJudge < w.exclEnd) return w;
    }
    return null;
  }
  // ── Verifier-backed scoring (host note_detect timing-free verify API) ───────
  // When the host exposes window.noteDetect.setVerifyTarget (notedetect #61),
  // we score against the harmonic-comb VERIFIER instead of the monophonic YIN
  // createContinuous. The verifier is polyphonic (chords become judgable — no
  // chord exemption) and distortion-robust, and we score it against the
  // PLAYER's real tuning via the per-call ctx (openMidis), independent of any
  // host song. The verifier owns hit SCORING; the YIN handle (if any) stays on
  // for the live pitch-strip readout + input-presence (_ptHadInput) only.
  // Doctrine unchanged: the host owns detection DSP, Virtuoso owns judgment.
  let _ndVerifyMode = false;        // verifier is the scoring ear this run
  /** @type {import('./src/types/host-interfaces.js').VerifyContext | null} */
  let _ndVerifyCtx = null;          // { arrangement, openMidis } — player's real tuning
  /** @type {import('./src/types/entry-data.js').EntryNote[]} */
  let _ndVerifyActive = [];         // note objects currently pushed as the target
  /** @type {string | null} */
  let _ndVerifyActiveKey = null;    // group key of the pushed target (dedupe pushes)
  /** @type {import('./src/types/judgment-data.js').JudgmentWindow | null} */
  let _ndVerifyActiveWin = null;    // the pushed target's WINDOW (span buckets + unit credit)
  /** @type {EventListener | null} */
  let _ndVerifyListener = null;     // bound notedetect:verify handler
  let _ndWeEnabledNoteDetect = false; // did WE enable note_detect? (restore on stop)
  // ── Contained-playback verifier (notedetect #64+) ──────────────────────────
  // When the host exposes the CONTAINED-chart verifier (desktop engine), we
  // drive the SAME timing-aware harmonic-comb NoteVerifier the 3D highway uses —
  // pushing OUR exercise chart + playhead and draining engine-finalized per-note
  // verdicts — instead of the timing-free setVerifyTarget. The engine owns
  // silence/onset/persistence gating, so Virtuoso's homegrown credit veto is
  // bypassed (ptCreditGatePasses) and judgment maps verdict.id → window via
  // ptKey. The setVerifyTarget path stays as the browser/downlevel FALLBACK.
  let _ndContainedMode = false;        // engine contained verifier is the scorer
  let _ndContainedFallback = false;    // browser/downlevel → old setVerifyTarget path
  let _ndContainedPushInFlight = false; // one getNoteVerdicts IPC at a time
  let _ndArmGen = 0;                    // bumped each arm + on stop — an async _ndArmVerify resuming after a stop/restart bails instead of arming the wrong run
  function ndVerifyAvailable() {
    return typeof window.noteDetect?.setVerifyTarget === 'function';
  }
  function ndContainedAvailable() {
    return typeof window.noteDetect?.isContainedVerifierAvailable === 'function'
      && window.noteDetect.isContainedVerifierAvailable();
  }
  // Active group at the playhead: the window-table OWNER on the latency-shifted
  // judge clock. The verifier's evidence runs ~50–170ms behind the string (its
  // analysis buffer is history), so anchoring the push on tJudge holds each
  // target through that arrival instead of swapping at the nominal boundary —
  // and midpoint-split exclusive bounds hand off promptly in dense runs.
  /** @param {number} t */
  function _ndActiveGroupAt(t) {
    const w = ptWinOwnerAt(t - ptLatency());
    if (!w) return { key: null, notes: [], win: null };
    return { key: w.key + '@' + Math.round((w.t || 0) * 1e4), notes: w.notes, win: w };
  }
  // Push (or refresh) the verify target for the current playhead. Cheap: only
  // re-pushes when the active group changes. Clears the target between notes so
  // the verifier never scores a stale note against live audio.
  function ndPushVerifyTarget() {
    if (!_ndVerifyMode || !ndVerifyAvailable()) return;
    const { key, notes, win } = _ndActiveGroupAt(transport.time);
    if (key === _ndVerifyActiveKey) return;     // no change → nothing to do
    _ndVerifyActiveKey = key;
    _ndVerifyActive = notes;
    _ndVerifyActiveWin = win;
    if (!notes.length) { try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).setVerifyTarget(null); } catch (_) {} return; }
    // Identity-tone reduction (harmony lane, grading rebuild): a chord voicing
    // octave-doubles its consonant skeleton (root/5th), so pushing the FULL grip
    // lets the host's fixed 0.5 hit-ratio pass on the doublings alone — a
    // WRONG-ROOT chord that shares the root/5th credits. Dedupe to DISTINCT
    // PITCH CLASSES so the ratio measures over the chord's actual tones (every
    // distinct tone — incl. the quality-defining 3rd/7th — is kept; only octave
    // duplicates drop). A wrong-root chord now shares too few tones to clear 0.5.
    // (Forcing maj↔min specifically isn't possible at the host's fixed 0.5 ratio
    // — that needs a host feature; logged. Single notes pass through untouched.)
    // Pass only host-meaningful flags: b = bend (Virtuoso `bn` magnitude → any
    // non-zero means "bends"); `mt` (muted) stays Virtuoso's own, never mapped
    // onto the host's `hm` (HARMONIC) — different techniques.
    const om = (_ndVerifyCtx && _ndVerifyCtx.openMidis) || _ptOpenMidis || [];
    const seenPc = new Set();
    const reduced = [];
    for (const n of notes) {
      const pc = ((((om[n.s] || 0) + n.f) % 12) + 12) % 12;
      if (seenPc.has(pc)) continue;          // drop octave/unison duplicates of a tone already in the target
      seenPc.add(pc); reduced.push(n);
    }
    const tgt = (reduced.length ? reduced : notes).map(n => ({ s: n.s, f: n.f, b: !!n.bn }));
    try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).setVerifyTarget(tgt, _ndVerifyCtx); } catch (_) {}
  }
  // notedetect:verify fires (every frame the target rings) with { isHit }. On a
  // hit, credit the whole pushed group into the SAME _ptScored/_ptByKey state
  // the gem hook + tier gates already read — so chords now score and light.
  // Note on miss feedback: the verifier only reports HITS (a wrong note emits
  // nothing), so input-presence (_ptHadInput, which arms miss gems) comes from
  // the YIN handle's ptOnPitch when the minigames ear is present (the normal
  // case — it's bundled). In a verifier-ONLY run (no minigames) _ptHadInput
  // first flips on the opening hit; a zero-hit pass shows no miss gems —
  // lenient, consistent with Virtuoso's "scoring degrades, never blocks".
  /** @param {(Event & {detail?: {isHit?: boolean}}) | null} ev */
  function ndOnVerify(ev) {
    // Paused: the last-pushed target survives the pause (tick stops refreshing
    // it), so live audio could keep crediting it against a frozen clock —
    // discard verify events while paused, mirroring ptOnPitch's paused guard.
    if (transport.paused) return;
    if (transport.preRollUntil > 0 && transport.time < transport.preRollUntil) return;   // resume pre-roll runway — discard verify frames (re-orienting, not playing)
    const d = ev && ev.detail;
    if (!d || !d.isHit || !_ndVerifyActive.length) return;
    // Input-presence: with a host level source the level meter owns _ptHadInput
    // (a raw isHit can fire on an inaudible residual — the very bug). Only fall
    // back to arming on the verify event when there is NO level source.
    if (_lvlMode === 'none') _ptHadInput = true;
    const w = _ndVerifyActiveWin;
    if (!w) return;
    if (w.span) {
      // Tremolo span: a verify hit marks its presence bucket; the credit
      // decision waits for end-of-span (ptFinalizeSpans, level-gated there).
      const bi = Math.floor((transport.time - ptLatency() - w.t) / PT_SPAN_BUCKET);
      if (bi >= 0 && bi < w.bktN) w.bkts.add(bi);
    } else {
      // Credit only if the level gate also passes (raw isHit is not enough —
      // host-mirror silence veto). Timing deviation { d, t, sb } records only on a
      // real credit — feeds both the timing-tendency line and the bass felt-hold
      // verdict (t = onset, needed for gap/trend detection; sb = the window's
      // register-dependent speak-budget excess, subtracted by feltHoldAnalyze).
      if (ptCreditWindow(w)) _ptDevs.push({ d: transport.time - ptLatency() - w.t, t: w.t, sb: w.sbx });
    }
  }
  function ndStopVerify() {
    _ndArmGen++;   // invalidate any in-flight _ndArmVerify so a stop/restart can't arm the wrong run
    // Release the engine chart slot UNCONDITIONALLY (not just when
    // _ndContainedMode): an arm whose setContainedChart is still in flight has
    // claimed the slot on the host side but not yet set _ndContainedMode here, so
    // a guarded release would leak it. releaseContainedChart is idempotent and a
    // no-op on the bridge when nothing is armed; it also cancels an in-flight
    // host-side arm (the host bumps its own generation), so that arm resolves
    // not-armed and can't outlive the run.
    try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).releaseContainedChart?.(); } catch (_) {}
    _ndContainedMode = false; _ndContainedFallback = false; _ndContainedPushInFlight = false;
    if (_ndVerifyListener) { window.removeEventListener('notedetect:verify', _ndVerifyListener); _ndVerifyListener = null; }
    if (_ndVerifyMode) { try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).setVerifyTarget(null); } catch (_) {} }
    // silent: Virtuoso shows its OWN results card — suppress note_detect's
    // end-of-song summary modal (nd disable() shows it by default), which would
    // otherwise fire with note_detect's OWN count (0/0, since the CONTAINED
    // verifier scored, not note_detect's own UI) — the "normal score card 0/0"
    // tester report, 2026-07-09. nd screen.js:13445 skips showSummary() on silent.
    if (_ndWeEnabledNoteDetect) { try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).disable?.({ silent: true }); } catch (_) {} _ndWeEnabledNoteDetect = false; }
    _ndVerifyMode = false; _ndVerifyCtx = null; _ndVerifyActive = []; _ndVerifyActiveKey = null; _ndVerifyActiveWin = null;
  }
  // Build the contained engine chart from the judged set. ptKey(n) is the stable
  // verdict id (the same key _ptWinByKey / _ptByKey / _ptScored use), so a
  // drained verdict maps straight back to its window and gem. Chord members are
  // pushed individually (distinct s → distinct id); ptBuildWindows already
  // grouped them into one window the per-member verdicts credit via N-of-M.
  function _ndBuildContainedChart() {
    return _ptNotes.map(n => ({
      id: ptKey(n), t: n.t || 0, s: n.s, f: n.f,
      sus: n.sus || 0, b: !!n.bn,
    }));
  }
  // Arm the verifier for the current run. Enables note_detect (awaiting it so
  // the desktop bridge is established before we probe for the contained
  // verifier), then takes the engine contained path on desktop or the
  // setVerifyTarget fallback on browser/downlevel. Async: the run may be
  // stopped mid-arm (ndStopVerify clears _ndVerifyMode), so re-check after each
  // await and bail without arming anything.
  async function _ndArmVerify() {
    // Capture this arm's generation. stopPitchTracker→ndStopVerify (and a fresh
    // arm) bump _ndArmGen, so if the run is stopped — OR stopped AND restarted
    // (a new run re-sets _ndVerifyMode true) — while we're awaiting enable() /
    // setContainedChart(), our resume sees a stale gen and bails WITHOUT touching
    // the new run's mode/listener state. (Re-checking _ndVerifyMode alone can't
    // tell our run from a restarted one.)
    const myGen = ++_ndArmGen;
    const superseded = () => myGen !== _ndArmGen || !_ndVerifyMode;
    // Track that WE enabled note_detect only AFTER enable() resolves — setting
    // the flag before the await let a stop racing the pending enable disable it
    // prematurely (then our resume left it enabled). If the run is gone by the
    // time enable resolves, undo the enable we just did.
    let weEnabled = false;
    try {
      if (!(/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).isEnabled?.()) { await (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).enable?.(); weEnabled = true; }
    } catch (_) {}
    if (weEnabled) _ndWeEnabledNoteDetect = true;
    if (superseded()) {
      if (weEnabled) { try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).disable?.({ silent: true }); } catch (_) {} _ndWeEnabledNoteDetect = false; }
      return;   // run stopped/restarted during enable() → don't arm
    }
    if (ndContainedAvailable()) {
      // Engine contained verifier (desktop): drive the SAME timing-aware
      // harmonic-comb NoteVerifier the 3D highway uses with OUR chart + playhead.
      let ok = null;
      try { ok = await (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).setContainedChart(_ndBuildContainedChart(), _ndVerifyCtx); }
      catch (_) { ok = null; }
      // Stopped/restarted during the arm: ndStopVerify already released the slot
      // (which also cancels this in-flight arm host-side), so just bail — don't
      // touch mode/listener state that may now belong to a newer run.
      if (superseded()) return;
      // Set the mode only AFTER a confirmed arm, so the gate-bypass
      // (ptCreditGatePasses) and the tick drain never engage against an
      // unconfirmed/failed chart.
      if (ok === true) _ndContainedMode = true;
      else _ndStartVerifyFallback();   // slot taken / unavailable → fall back
    } else {
      // Browser / downlevel host: the timing-free setVerifyTarget fallback.
      _ndStartVerifyFallback();
    }
  }
  // The browser/downlevel FALLBACK: the timing-free setVerifyTarget path
  // (unchanged from before the contained verifier). Wired only when the engine
  // contained verifier is unavailable, so Virtuoso degrades, never breaks.
  function _ndStartVerifyFallback() {
    if (!_ndVerifyMode) return;   // run stopped during arm → don't wire the listener
    _ndContainedFallback = true;
    _ndVerifyListener = ndOnVerify;
    window.addEventListener('notedetect:verify', _ndVerifyListener);
    ndPushVerifyTarget();
  }
  // Per-frame contained-verifier step (called from tick in _ndContainedMode):
  // (1) synchronously credit verdicts buffered since the last frame — BEFORE
  // ptWinSeek expires windows this frame — then (2) drive the engine clock with
  // our exercise playhead (async; buffers for the next frame's drain).
  function ndDrainContainedVerdicts() {
    if (!_ndContainedMode) return;
    const verdicts = (typeof window.noteDetect?.drainContainedVerdicts === 'function'
      ? window.noteDetect.drainContainedVerdicts() : null) || [];
    for (const v of verdicts) {
      if (!v || typeof v.id !== 'string') continue;
      const w = _ptWinByKey.get(v.id);
      // Already credited/missed → ignore (a late duplicate can't double-judge).
      if (!w || w.credited || w.missDispatched) continue;
      const detT = Number.isFinite(v.detectedSongTime) ? v.detectedSongTime : transport.time;
      if (v.detected) {
        // The engine IS the timing-aware judge in contained mode (the SAME
        // NoteVerifier the 3D highway uses): its detected:true is the hit — we
        // do NOT re-judge timing with the local cursor (ptWinSeek's miss is
        // disabled in contained mode so it can't race-expire the window before
        // this async verdict lands — the ~0-credit DI bug).
        _ptHadInput = true;   // a real engine hit proves live input (replaces the RMS level meter, which a transient-heavy DI reads as inputLevel 0)
        if (w.span) {
          // Tremolo span: a verdict marks its presence bucket; credit waits for
          // end-of-span (ptFinalizeSpans).
          const bi = Math.floor((detT - w.t) / PT_SPAN_BUCKET);
          if (bi >= 0 && bi < w.bktN) w.bkts.add(bi);
        } else if (w.notes.length > 1) {
          // Chord: accumulate distinct detected member ids; credit at N-of-M.
          if (!w._detIds) w._detIds = new Set();
          w._detIds.add(v.id);
          if (w._detIds.size / w.notes.length >= PT_CHORD_HIT_RATIO && ptCreditWindow(w)) {
            _ptDevs.push({ d: detT - w.t, t: w.t, sb: w.sbx });
          }
        } else {
          // Single note: one detected verdict credits.
          if (ptCreditWindow(w)) _ptDevs.push({ d: detT - w.t, t: w.t, sb: w.sbx });
        }
      } else if (_ptHadInput && !w.span && w.notes.length === 1) {
        // detected:false (finalized by the engine at window close) IS the miss
        // for a single note. Gated on _ptHadInput so a never-played run stays
        // neutral (lenient — matches the YIN path's "zero-hit pass shows no miss
        // gems"). Chords/spans stay lenient (credit at N-of-M / span-ratio).
        w.missDispatched = true;
        ptDispatchJudgment('miss', w, null);
      }
    }
    // Drive the engine clock with our exercise playhead (the judge clock the
    // window table reads). One IPC in flight at a time so a slow round-trip
    // can't pile up requests at frame rate.
    if (!_ndContainedPushInFlight && typeof window.noteDetect?.pushContainedPlayhead === 'function') {
      _ndContainedPushInFlight = true;
      // Push the engine our RAW playhead — NOT offset by our own A/V "latency"
      // calibration. The contained verifier owns timing (its ±100ms window is the
      // judge); subtracting ptLatency delayed every verdict — and so the host
      // hit-flare — by a stale ~123ms our YIN-fed sweep mis-tuned (it never hears
      // the DI). Consume the host judge; don't second-guess its clock (2026-06-21).
      const t = transport.time;
      const playing = !transport.paused && !(transport.preRollUntil > 0 && transport.time < transport.preRollUntil);
      try {
        Promise.resolve(window.noteDetect.pushContainedPlayhead(t, playing))
          .catch(() => {})
          .finally(() => { _ndContainedPushInFlight = false; });
      } catch (_) { _ndContainedPushInFlight = false; }
    }
  }
  let jamFeel = 'straight';   // Jam-mode feel (straight / swing / shuffle)
  // Jam slice J-1 state (persisted; restored in bind alongside jamHighlight):
  // guide-line AUDIO is opt-in (D-J1 — the band plays, the player is the lead
  // voice); band mode is the bass-role default (D-J2 — a bassist owns the
  // foundation, so the band's bass drops unless they opt back in).
  let jamGuideLine = false;       // audible generated line: OFF by default
  let jamBandMode = 'no_bass';    // bass players: 'no_bass' | 'drums_only' | 'full' (guitar always full)
  let _jamPending = false;        // J-2 (D-J3): a live panel change is queued for the next loop wrap
  /** @type {string[]} */
  let _jamPendingParts = [];      // the queued-change summary currently shown in the Jam pending chip
  /** @type {ReturnType<typeof jamPanelState> | null} */
  let _jamSnapshot = null;        // the panel state the CURRENT jam pass was built from (delta source)
  let _jamApplyToken = 0;         // Jam-UX reliability: monotonic guard so a stale async voice-swap apply can't win (the out-of-order race)
  let jamIntent = '';             // J-2 (D-J8): the picked intent — self-checked, shown, NEVER judged
  /** @type {string | null} */
  let _jamDeviceIntent = null;    // J-2 (D-J10): the drill→Jam hand-off's device intent (chip injected first)
  let jamDepth = 'core';          // J-2 (D-J5b): Harmonic-Depth dial — 'simple' | 'core' | 'rich' (persisted)
  let jamEnergy = 'auto';         // J-3: band-intensity macro — 'chill'|'groove'|'drive' PIN density (1/2/3); 'auto' = the build→peak→breakdown section-arc across passes (persisted)
  /** @type {{pc: number, midi: number, t: number, chartT: number}[]} */
  let _jamPlayed = [];            // J-3 played-note mirror: recent detected pitches {pc,midi,t(ms)} for the fading strip mark (Jam only)
  /** @type {{noteCount: number, pcs: Set<number>, lastPc: number, lastMs: number} | null} */
  let _jamMirror = null;          // J-3: cumulative jam recap accumulator (reset each jamPlay; read at the deliberate jam stop)
  let jamSpotlight = false;       // J-3 Spotlight (trade-solos form): you↔band take turns per pass; persisted virtuoso_lab.jamSpotlight
  /** @type {string | null} */
  let _spotlightCueTurn = null;   // last-shown spotlight turn — DOM-thrash guard for the cue banner

  /**
   * Fixed form/media IDs have markup-backed types, never a mounted-panel promise.
   * @template {string} Id
   * @overload
   * @param {Id} id
   * @returns {import('./src/types/dom-ids.js').ElementForId<Id>}
   */
  /** @param {string} id */
  function $(id) { return document.getElementById(id); }
  /** @param {string} key @param {string} fallback */
  function storage(key, fallback) { try { const value = localStorage.getItem(key); return value === null ? fallback : value; } catch { return fallback; } }
  function readHighwayInverted() { return storage('invertHighway', 'false') === 'true'; }
  function readLefty() { return storage('lefty', '0') === '1'; }
  function readRenderScale() { const value = parseFloat(storage('renderScale', '1')); return Number.isFinite(value) && value > 0 ? value : 1; }
  /** @param {{inverted?: boolean, lefty?: boolean, renderScale?: number} | null} bundle */
  function syncHighwaySettings(bundle) { if (!bundle) return; bundle.inverted = readHighwayInverted(); bundle.lefty = readLefty(); bundle.renderScale = readRenderScale(); }

  /** @param {string} id */
  function goScreen(id) {
    const bus = hostBus();
    if (bus && typeof bus.navigate === 'function') return bus.navigate(id);
    if (typeof window.showScreen === 'function') return window.showScreen(id);
    document.querySelector(`[data-screen="${id}"]`)?.click();
  }

  /** @param {EventTarget | null} target @returns {Element | null} */
  function eventElement(target) {
    if (!target || !('nodeType' in target) || target.nodeType !== 1 || !('closest' in target) || typeof target.closest !== 'function') return null;
    return /** @type {Element} */ (target);
  }

  /** @param {EventTarget | null} target @returns {(Element & {value: string}) | null} */
  function eventValueElement(target) {
    const element = eventElement(target);
    if (!element || !('value' in element) || typeof element.value !== 'string') return null;
    return /** @type {Element & {value: string}} */ (element);
  }

  /** @template {keyof import('./src/types/event-dom.js').WidgetSelectors} S @param {EventTarget | null} target @param {S} selector @returns {import('./src/types/event-dom.js').WidgetSelectors[S] | null} */
  function eventClosest(target, selector) {
    return /** @type {import('./src/types/event-dom.js').WidgetSelectors[S] | null} */ (eventElement(target)?.closest(selector) || null);
  }


  // ── Drum kits (audio-realism Phase D) ────────────────────────────────────────
  // A kit is a SOUND set; the groove (DRUM_GROOVES) is separate. Phase D1–D3 ship
  // only the procedural synth kits (zero asset, zero licensing, authentic-by-
  // construction, and the never-silent failover). Sampled CC0 acoustic kits
  // (kit_rock/kit_jazz/kit_acoustic_soft/…) land in Phase D4. `resolveDrumKit`
  // falls any unregistered kit id back to kit_909 → in D1–D3 every style plays a
  // synth beat until the sampled kits exist (intentional; fix on the backend in D4).
  // Sampled kits (Phase D4) play self-hosted VirtuosoLabWebAudioFont drum one-shots — one tiny
  // preset file per GM percussion note, served from static/wafonts/ by the /wafont
  // route (zero route changes), same MIT WAF provenance as the melodic tones. The
  // piece→GM-note map is shared (FluidR3_GM kit); kits differ by level/groove, not
  // sample set (brush/percussion sample sets are a later curation pass). NOTE:
  // FluidR3_GM is MIT (verified 2026-06-12; provenance in static/wafonts/README.md)
  // — the same font now also supplies the melodic tones.
  // Voice ids mirror the host's lib/drums.py PIECES vocabulary (snake_case) so a
  // Virtuoso drum event maps 1:1 onto the host's 18-piece kit (and a future
  // drum_tab.json export needs no translation). GM notes match where we overlap.
  const ACOUSTIC_PIECES = {
    kick:36, snare:38, snare_xstick:37,
    hh_closed:42, hh_open:46, hh_pedal:44,
    ride:51, ride_bell:53, bell:80,
    crash_l:49, crash_r:57, splash:55, china:52,
    tom_hi:50, tom_mid:47, tom_low:43, tom_floor:41,
    clap:39,
  };
  /** @param {number} note @param {string | undefined} font @param {number | undefined} variant */
  const drumFile = (note, font, variant) => `128${note}_${variant}_${font}_sf2_file.js`;
  /** @param {number} note @param {string | undefined} font @param {number | undefined} variant @returns {`_virtuoso_lab_drum_${string}`} */
  const drumVar  = (note, font, variant) => `_virtuoso_lab_drum_${note}_${variant}_${font}_sf2_file`;
  // GM notes that ACTUALLY ship a committed FluidR3 one-shot under static/wafonts.
  // The step-5 extended pieces (snare_xstick 37, tom_floor 41, china 52, ride_bell
  // 53, splash 55, crash_r 57, bell 80) have NO sample yet → they take the synth
  // voice instead of a per-hit 404 (loadWafPreset retries on 'failed'). ADD a note
  // here only when its sample file lands. (Drum curation pass = a later phase.)
  const SAMPLED_DRUM_NOTES = new Set([35, 36, 38, 39, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]);
  // REAL acoustic drum kit (Versilian/Karoryfer "virtuosity_drums", CC0) — a curated
  // lightweight subset replacing the GM FluidR3 one-shots (the drum-side of the melodic
  // sample-bank upgrade). Single medium-velocity layer per piece + round-robins (the #1
  // anti-machine-gun lever per the drum-pedagogy panel); dynamics come from `vol` scaling.
  // `src` maps an engine piece → the harvested source token (the 4 tom slots alias the 2
  // harvested toms); `rr` is the take count per token; missing pieces (ride_bell/splash/
  // china/crash_r/bell/clap) fall through to FluidR3 then synth. Files dk_<token>_<n>.ogg
  // in static/samples (the /sample route). Provenance: static/samples/README.md.
  /** @type {Record<string, import('./src/types/audio-graph.js').DrumBank>} */
  const DRUMKIT_BANKS = {
    virtuosity: {
      src: { kick:'kick', snare:'snare', snare_xstick:'xstick', hh_closed:'hhclosed',
             hh_open:'hhopen', hh_pedal:'hhpedal', ride:'ride', crash_l:'crash',
             tom_hi:'htom', tom_mid:'htom', tom_low:'ltom', tom_floor:'ltom' },
      rr: { kick:3, snare:3, xstick:2, hhclosed:4, hhopen:2, hhpedal:2, ride:3, crash:2, htom:2, ltom:2 },
      file: (token, n) => `dk_${token}_${n}.ogg`,
    },
  };
  /** @type {Record<string, import('./src/types/audio-graph.js').DrumKit>} */
  const KIT_REGISTRY = {
    kit_909: { engine: 'synth', preset: '909' },   // tight/punchy default electronic
    kit_808: { engine: 'synth', preset: '808' },   // sub-heavy, long kick tail
    // Sampled acoustic kits — REAL virtuosity_drums samples, FluidR3_GM = per-piece
    // fallback for the pieces the curated subset drops. Share the piece set; differ by level.
    kit_rock:          { engine: 'sample', bank: 'virtuosity', font: 'FluidR3_GM', variant: 0, level: 1.0,  pieces: ACOUSTIC_PIECES },
    kit_acoustic_soft: { engine: 'sample', bank: 'virtuosity', font: 'FluidR3_GM', variant: 0, level: 0.82, pieces: ACOUSTIC_PIECES },
    kit_jazz:          { engine: 'sample', bank: 'virtuosity', font: 'FluidR3_GM', variant: 0, level: 0.8,  pieces: ACOUSTIC_PIECES },  // brush sample set = later curation
    // kit_latin / kit_afro (percussion-led) → Phase D6
  };
  // Startup integrity (mirrors the no-unison / palette guards): every kit `bank` must
  // exist, and every mapped source token must declare a round-robin count.
  (function validateDrumKits() {
    for (const [id, k] of Object.entries(KIT_REGISTRY))
      if (k.bank && !DRUMKIT_BANKS[k.bank]) throw new Error(`[Virtuoso drumkit] ${id} bank "${k.bank}" missing`);
    for (const [bk, b] of Object.entries(DRUMKIT_BANKS))
      for (const [piece, token] of Object.entries(b.src))
        if (b.rr[token] == null) throw new Error(`[Virtuoso drumkit] ${bk}.${piece} → token "${token}" has no rr count`);
  })();
  // Core groove staples preloaded at generate; cymbals/toms lazy-load on first hit.
  const DRUM_CORE_PIECES = ['kick', 'snare', 'hh_closed', 'hh_open'];
  // Resolve a style palette into a mergeable partial config the way a Pathway/Custom/
  // Jam consumer uses it: Object.assign({}, base, stylePaletteConfig('blues')). opts let
  // a consumer pick a non-default progression/scale (by index) or pin key/progression/scale.
  // Startup integrity guard (mirrors the no-unison guard): every palette must point at
  // real engine tokens, so the shared style table can't silently rot as the engine
  // evolves. Throws on load if a palette references a missing progression/scale/profile.
  (function validateStylePalettes() {
    for (const id of Object.keys(STYLE_PALETTES)) {
      const p = STYLE_PALETTES[id];
      for (const pr of p.progressions) if (!COMMON_PROGRESSIONS[pr]) throw new Error(`[Virtuoso style-palette] ${id} references unknown progression "${pr}"`);
      for (const sc of p.leadScales)   if (!SCALE_INTERVALS[sc])     throw new Error(`[Virtuoso style-palette] ${id} references unknown scale "${sc}"`);
      if (p.audioProfile && !AUDIO_PROFILES[p.audioProfile])         throw new Error(`[Virtuoso style-palette] ${id} references unknown audioProfile "${p.audioProfile}"`);
    }
  })();
  (function validateJamProgressionLabels() {
    for (const id of Object.keys(STYLE_PALETTES)) {
      for (const pr of STYLE_PALETTES[id].progressions || []) {
        if (!JAM_PROG_LABELS[pr]) throw new Error(`[Virtuoso jam] ${id} progression "${pr}" needs a JAM_PROG_LABELS label`);
      }
    }
  })();
  // One per-style "try this" line (slice J-1 — the intent SEED, goal-card grammar:
  // a constraint to jam against, never a score). Draft prompts pending the
  // genre-idiom refinement sweep (logged in ROADMAP).
  /** @type {Record<string, string>} */
  const JAM_PROMPTS = {
    blues:   'Try: say something in 2 bars, then leave 2 empty — the silence is the phrasing.',
    rock:    'Try: ride the pentatonic box, then land the chord’s root on every change.',
    metal:   'Try: lock 8ths with the low pedal, break out for 2 bars, dive back in.',
    djent:   'Try: play the GAPS — make the band’s accents your accents.',
    jazz:    'Try: land the 3rd of each chord on beat 1 — walk to it from a half-step below.',
    funk:    'Try: one note, sixteen ways — ghost the 16ths, place ONE accent per bar.',
    pop:     'Try: sing a 2-bar hook over the loop, then find it on the neck and repeat it.',
    country: 'Try: major pentatonic over the I, then chase the chord tones through IV and V.',
    gospel:  'Try: answer the band — fill the space after each change with a 2-beat run-up.',
    reggae:  'Try: chop only the offbeats — let the bass own the downbeat, you ride the &.',
    disco:   'Try: lock a 16th muted scratch, pop a chord stab on the & of 2 and 4.',
    latin:   'Try: state the melody once, then trade space with the clave — never crowd it.',
    soul:    'Try: land the chank on 2 and 4 only — leave beats 1 and 3 for the pocket.',
    afrobeat:'Try: pick one 2-bar phrase and loop it hypnotically — the groove is repetition.',
    norteno: 'Try: float your line over the oom-pah — land the downbeat with the bass, then run.',
    tango:   'Try: play it staccato and dramatic — hit the marcato beats hard, then breathe.',
    bluegrass:'Try: major-pentatonic flatpicking — drive the time yourself, no drummer to lean on.',
    'city-pop':'Try: glide the ii–V chain — land color tones (9ths, 13ths), not just roots.',
    new_orleans:'Try: lock to the tresillo "big four" — leave space, let the second-line strut.',
    classical:'Try: let each broken chord ring — phrase your line over the harmony, not the beat.',
    flamenco: 'Try: feel the compás — accent hard, then let the Phrygian ♭2 pull you home.',
    folk:     'Try: a simple melody over the alternating thumb — let the open strings drone.',
    gypsy_jazz:'Try: chase the arpeggio of each chord — outline the changes, Django-style.',
    ragtime:  'Try: syncopate your right hand against the steady stride — land off the beat.',
    surf:     'Try: fast double-picked single notes in harmonic minor — drip the (imagined) reverb.',
    shoegaze: 'Try: bury a simple melody in the wash — bend into notes, let everything ring.',
    emo:      'Try: a twinkly arpeggio high on the neck — ring open strings against fretted notes.',
    punk:     'Try: all downstrokes, power chords, no let-up — three chords, attitude over polish.',
    prog:     'Try: outline the mode (Dorian/Lydian), phrase a long line that resolves where you mean it.',
    western_swing: 'Try: take a hot single-string "takeoff" over the changes — chase the 6th and the ♭7, then "take it away".',
    synthwave: 'Try: let the arp churn — float ONE long sustained line on top, then bend up into the next chord.',
  };
  // J-2 intent chips (D-J8: intents, not scores). An intent is a SELF-checked
  // musical aim the player picks before/while jamming — shown on the status line,
  // never judged, never scored (the mirror rule). Per-style guitar sets plus
  // style-specific bass sets (a bassist's job changes by idiom).
  /** @type {Record<string, string[]>} */
  const JAM_INTENTS = {
    blues:   ['Say it in 2 bars, leave 2 empty', 'End every phrase on a chord tone', 'One bend per phrase — in tune'],
    rock:    ['Land the root on every change', 'Build a riff, repeat it ×4', 'Double-stops on the chorus'],
    metal:   ['Lock 8ths with the pedal', 'Break out 2 bars, dive back in', 'Accent where the kick lands'],
    djent:   ['Play the gaps in the band\'s accents', 'One fill per cycle — pocket first', 'Choke every note you don\'t mean'],
    jazz:    ['Land the 3rd on beat 1', 'Approach each change from below', 'State a motif, then answer it'],
    funk:    ['Ghost the 16ths, place ONE accent', 'Sit out beat 1 — own the &', 'One note, sixteen ways'],
    pop:     ['Sing a hook, find it, repeat it', 'Melody only — no runs', 'Leave room for the vocal'],
    country: ['Chase chord tones through IV and V', 'Double-stop the turnaround', 'Bend into the 3rd, steel-style'],
    gospel:  ['Answer the band after each change', 'Walk up into beat 1', 'Resolve every run to a chord tone'],
    reggae:  ['Chop only the offbeats', 'Let the bass be the hook', 'One skank, locked for 8 bars'],
    disco:   ['16th scratch — never stop the hand', 'Octaves with the four-floor kick', 'Stab the & of 2 and 4'],
    latin:   ['Trade space with the clave', 'Land the 3rd, bossa-soft', 'State the melody, then vary it'],
    soul:    ['Chank on 2 and 4 only', 'Answer the vocal line', 'Sit in the pocket — less is more'],
    afrobeat:['Loop one 2-bar phrase', 'Interlock, don\'t solo', 'Lock to the kick, hypnotic'],
    norteno: ['Float over the oom-pah', 'Harmonize the melody in 3rds', 'Land the downbeat with the bass'],
    tango:   ['Marcato — hit every beat hard', 'Stark loud/soft contrast', 'Lean into the downbeat'],
    bluegrass:['Drive the time yourself', 'Chase chord tones through the changes', 'One G-run per turnaround'],
    'city-pop':['Land the 9th, not the root', 'Glide through the ii–Vs', 'Sit back, glossy'],
    new_orleans:['Lock to the tresillo "big four"', 'Bluesy dom7 vocabulary', 'Leave space — let it strut'],
    classical:['Phrase over the harmony', 'Let every note ring', 'Shape the dynamics'],
    flamenco: ['Accent the compás', 'Lean on the Phrygian ♭2', 'Rasgueado fire, then silence'],
    folk:     ['Melody over the drone', 'Keep it simple, song-serving', 'Ornament the Celtic turns'],
    gypsy_jazz:['Chase each chord arpeggio', 'Enclose the target note', 'Swing the eighths hard'],
    ragtime:  ['Syncopate against the stride', 'Land off the beat', 'Outline the secondary dominants'],
    surf:     ['Fast double-picking', 'Exotic harmonic-minor color', 'Glissando into the phrase'],
    shoegaze: ['Bury the melody in the wash', 'Bend into every note', 'Let it all ring'],
    emo:      ['Twinkle high on the neck', 'Open strings against fretted', 'Interlock, don\'t solo'],
    punk:     ['All downstrokes, no let-up', 'Three chords, attitude', 'Lock to the driving kick'],
    prog:     ['Outline the mode', 'Phrase across the barline', 'Resolve where you mean it'],
    western_swing: ['Chase chord tones — land the 6th', 'Take a hot solo, then "take it away"', 'Twin-fiddle it — harmonize in 3rds/6ths'],
    synthwave: ['Soar — one long held note per phrase', 'Land the ♭3, then lift to major', 'Ride the arp, answer the change'],
  };
  /** @type {Record<string, string[]>} */
  const JAM_INTENTS_BASS = {
    default: ['Root on the one', 'Approach the next root', 'Lock with the kick'],
    blues: ['Walk the I-IV-V roots', 'Approach the turnaround from below', 'Leave space after the V'],
    rock: ['Eight-note roots with authority', 'Fifth-to-root answers', 'Push into the chorus change'],
    metal: ['Pedal the root tightly', 'Mirror the kick accents', 'Mute every release cleanly'],
    djent: ['Own the low-string grid', 'Choke the gaps with the band', 'Answer accents, then disappear'],
    jazz: ['Walk quarters through every change', 'Chromatic approach into ii-V-I roots', 'Outline roots before color tones'],
    funk: ['One-bar pocket, repeat it', 'Ghost 16ths around the root', 'Lock accents with the kick'],
    pop: ['Hold the hook, not the fill', 'Lift into the pre-chorus root', 'Leave the vocal lane open'],
    country: ['Two-feel roots on 1 and 3', 'Walk into IV and V', 'Pedal the fifth on the turnaround'],
    gospel: ['Walk up into every one', 'Answer the left-hand push', 'Resolve fills to the root'],
    reggae: ['Hold the bass hook', 'Leave the one empty when it feels right', 'Answer the skank with space'],
    disco: ['Octaves with the kick', 'Root-octave engine for 8 bars', 'Ghost into each octave'],
    latin: ['Tumbao root-fifth motion', 'Leave room for the clave', 'Anticipate the barline softly'],
    soul: ['Motown approach into every root', 'Hold note endings full value', 'Pocket just behind the beat'],
    afrobeat: ['Repeat the ostinato until it hypnotizes', 'Interlock with kick and guitar', 'Small variation every 4 bars'],
    norteno: ['Oom-pah roots and fifths', 'Walk cleanly into the push', 'Let the accordion lead breathe'],
    tango: ['Marcato roots, full value', 'Pull hard into the downbeat', 'Silence after the accent'],
    bluegrass: ['Root-fifth drive without rushing', 'Walk into the turnaround', 'Keep the two-beat engine steady'],
    'city-pop': ['Smooth octave pocket', 'Approach ii-V roots chromatically', 'Let the synth bass breathe'],
    new_orleans: ['Big-four push into the root', 'Bounce the fifth, never rush', 'Leave room for the snare drag'],
    classical: ['Anchor harmonic roots clearly', 'Sustain through phrase cadences', 'Move by step when possible'],
    flamenco: ['Pedal the tonic hard', 'Lean into the Phrygian b2', 'Stop sharply after rasgueado answers'],
    folk: ['Drone the tonic when it fits', 'Step into the next chord', 'Keep the song pulse plain'],
    gypsy_jazz: ['Two-feel roots, then walk', 'Chromatic approach each dominant', 'Keep quarter notes light'],
    ragtime: ['Alternating root-fifth stride', 'Catch the syncopated push', 'Land secondary dominants cleanly'],
    surf: ['Palm-muted root engine', 'Slide into the V', 'Keep eighths even under reverb'],
    shoegaze: ['Long roots under the wash', 'Change late, sustain wide', 'Let octave blooms replace fills'],
    emo: ['Pedal open roots', 'Step through passing chords', 'Interlock with the high guitar figure'],
    punk: ['Downstroke roots with the kick', 'One fill before the chorus', 'No drift through the turnaround'],
    prog: ['Track the odd-meter one', 'Pedal through modal color', 'Outline roots before extensions'],
    western_swing: ['Two-feel roots and fifths', 'Walk the 6th into the change', 'Bounce behind the beat'],
    synthwave: ['Octave pulse under the arp', 'Hold the root through pad changes', 'Slide into the next bass note'],
  };
  /** @param {string} styleId */
  function jamBassIntents(styleId) { return JAM_INTENTS_BASS[styleId] || JAM_INTENTS_BASS.default; }

  // ===========================================================================
  // SEGMENT TEMPLATES + VARIATION ENGINE (Workout library substrate)
  // ---------------------------------------------------------------------------
  // A Workout segment is authored as a TEMPLATE, not a frozen preset. A template
  // carries a pedagogical ROLE, a competency, a difficulty BAND, a fixed `base`
  // config, and a bounded `vary[]` list of variant deltas (the same shape as a
  // PATHWAYS[].vary entry). Three reads of the one object:
  //   • BROWSE  → render role/label/band.
  //   • PICK    → rollSegment(t, { variantIdx: 0 }).
  //   • REFRESH → rollSegment(t, { variantIdx: n+1 }) — re-roll the variant.
  // rollSegment() materialises a template into a normal session segment
  // ({ id, name, kind, config }); it then flows through the EXISTING
  // buildSegmentConfig → buildSingleChart path, so the no-unison rule and the
  // voicing engine hold automatically — the engine adds NO new generators.
  //
  // REFRESH INVARIANTS (the anti-slot-machine spine + musical safety):
  //   1. Same BAND      — every variant of a template shares its difficulty band;
  //                       no easier variant exists to "spin for".
  //   2. Length-locked  — a vary delta may NOT carry bpm or targetSec (the Climb
  //                       axis owns difficulty/length); refresh varies CONTENT.
  //   3. Style-locked   — when a template names a `style`, progression + scale are
  //                       drawn from STYLE_PALETTES, so a blues slot can't re-roll
  //                       into I-IV-V pop. A vary delta may only name in-palette
  //                       progression/scale values.
  //   4. No-row gate    — an exotic/symmetric scale (no DIATONIC_QUALITIES row) may
  //                       only appear over a single-chord backing OR a forced
  //                       chordOverride (else its non-tonic chords fall to a bare
  //                       major triad).
  // validateSegmentTemplates() (mirroring the no-unison + style-palette guards)
  // enforces 1–4 over every variant of every template at load; smoke-variation.mjs
  // does the full roll+build behavioural check. See project memory
  // project_segment_library_and_refresh + the four agent-memory charette specs.
  // Backings over which a no-DIATONIC_QUALITIES-row scale is harmonically safe
  // (only the tonic quality matters): a single sustained chord area.
  const SINGLE_CHORD_BACKINGS = new Set(['static_i','none']);
  // No-row scales that are nonetheless SAFE over a multi-chord backing: common lead
  // scales (pentatonics / blues / bebop) whose chord derivation maps cleanly through
  // a FUNCTIONAL PARENT (major / minor / dominant) via the functional-root fix — they
  // aren't the exotic/symmetric case the no-row gate targets. Exempt them so a
  // pentatonic/blues lead over a progression isn't false-flagged.
  const GATE_EXEMPT_SCALES = new Set(['minor_pentatonic','major_pentatonic','blues','bebop_major','bebop_dominant']);
  /** @param {string | null | undefined} scale */
  function scaleHasQualityRow(scale){ return !!(scale && DIATONIC_QUALITIES && DIATONIC_QUALITIES[scale]); }
  /** @param {string} kind @param {string | undefined} progression */
  function isSingleChordBacking(kind, progression){
    return kind === 'modal_vamp' || !progression || progression === 'none' || SINGLE_CHORD_BACKINGS.has(progression);
  }

  // Passive templates/materialization are imported; startup validation stays here.
  // Startup integrity guard (mirrors validateStylePalettes + the no-unison guard):
  // injects each template's id, then enforces the four refresh invariants over every
  // variant of every template — throws on load if an authored template violates one.
  // Anchor-rung integrity guard (keyless-anchor model 2026-06-06; mirrors the
  // no-unison / palette / segment guards — throws at load so a mis-authored
  // rung can never ship): anchor rungs derive their key, so a co-coded `key`
  // is a contradiction; anchorFret 12+ aliases down an octave (re-author);
  // anchorFret without the anchor flag is dead data.
  (function assertAnchorRungsValid() {
    for (const [id, pw] of Object.entries(PATHWAYS)) {
      const isAnchor = (pw.base || {}).anchor === 'open_lowest';
      const variants = [pw.base || {}].concat(pw.vary || []);
      for (const v of variants) {
        if (v.anchor != null && v.anchor !== 'open_lowest') throw new Error(`[Virtuoso anchor] ${id}: unknown anchor '${v.anchor}'`);
        if (v.anchorFret != null && (!Number.isInteger(v.anchorFret) || v.anchorFret < 0 || v.anchorFret > 11))
          throw new Error(`[Virtuoso anchor] ${id}: anchorFret ${v.anchorFret} out of range 0-11 (12+ aliases down an octave — re-author)`);
        if (isAnchor && v.key != null) throw new Error(`[Virtuoso anchor] ${id}: 'key' co-coded with anchor:'open_lowest' — the key is DERIVED; author anchorFret instead`);
        if (!isAnchor && (v.anchor != null || v.anchorFret != null)) throw new Error(`[Virtuoso anchor] ${id}: anchor fields without anchor:'open_lowest' in base`);
      }
    }
  })();

  // Density-ladder integrity guard (panel 2026-06-12; mirrors the anchor guard —
  // throws at load so a mis-authored ladder can never ship). Two rules:
  // (1) a rung with tempoTierSubdivs/tempoTierBars must keep its arrays aligned
  //     with tempoTiers, use known subdivision tokens, and keep tempoTiers
  //     STRICTLY INCREASING — every bpm→tier inference in crediting
  //     (creditBlockTier / creditFeltRung / the custom-mode fuzzy match) scans
  //     `bpm >= tier`, so duplicate or descending BPMs would mis-credit a
  //     density tier it can't see;
  // (2) the BEGINNER DENSITY FLOOR (learning-design ruling): tier 0 of any
  //     core_beginner rung presents ≤ ~2 notes/sec — sixteenth@60-style entries
  //     ("wrecked from ez mode") become a load-time error, not a beta report.
  (function assertTierLaddersValid() {
    const TIER_SUBDIV_OK = new Set(['quarter', 'eighth', 'triplet', 'eighth_triplet', 'sixteenth', 'sixteenth_triplet']);
    /** @type {Record<string, number>} */
    const PER_BEAT = { quarter: 1, eighth: 2, triplet: 3, eighth_triplet: 3, sixteenth: 4, sixteenth_triplet: 6 };
    for (const [id, pw] of Object.entries(PATHWAYS)) {
      const tiers = pw.tempoTiers || [];
      if (pw.tempoTierSubdivs || pw.tempoTierBars) {
        if (pw.tempoTierSubdivs) {
          if (pw.tempoTierSubdivs.length !== tiers.length) throw new Error(`[Virtuoso tier-ladder] ${id}: tempoTierSubdivs length ${pw.tempoTierSubdivs.length} ≠ tempoTiers length ${tiers.length}`);
          for (const s of pw.tempoTierSubdivs) if (!TIER_SUBDIV_OK.has(s)) throw new Error(`[Virtuoso tier-ladder] ${id}: unknown tier subdivision '${s}'`);
        }
        if (pw.tempoTierBars && pw.tempoTierBars.length !== tiers.length) throw new Error(`[Virtuoso tier-ladder] ${id}: tempoTierBars length ${pw.tempoTierBars.length} ≠ tempoTiers length ${tiers.length}`);
        for (let i = 1; i < tiers.length; i++) {
          if (!(tiers[i] > tiers[i - 1])) throw new Error(`[Virtuoso tier-ladder] ${id}: tempoTiers must be strictly increasing when a density ladder is declared (bpm→tier crediting scans 'bpm ≥ tier'); got ${tiers[i - 1]} → ${tiers[i]}`);
        }
      }
    }
    const beginner = PATHWAY_BANDS.find(b => b.id === 'core_beginner');
    for (const id of (beginner ? beginner.pathways : [])) {
      const pw = PATHWAYS[id]; if (!pw || !pw.tempoTiers || !pw.tempoTiers.length) continue;
      const sub0 = (pw.tempoTierSubdivs && pw.tempoTierSubdivs[0]) || (pw.base || {}).subdivision;
      const perBeat = PER_BEAT[String(sub0)];
      if (perBeat == null) continue;   // cell tokens (gallop etc.) aren't entry-tier material; nothing to check
      const nps = (pw.tempoTiers[0] / 60) * perBeat;
      if (nps > 2.4) throw new Error(`[Virtuoso tier-ladder] ${id}: core_beginner tier 0 is ${nps.toFixed(1)} notes/sec (${sub0}@${pw.tempoTiers[0]}) — over the ~2/sec beginner floor; ramp density before BPM`);
    }
  })();

  (function validateSegmentTemplates() {
    for (const id of Object.keys(SEGMENT_TEMPLATES)) {
      const t = SEGMENT_TEMPLATES[id];
      t.id = id;
      if (!SEGMENT_ROLES[t.role])         throw new Error(`[Virtuoso segment-template] ${id} has unknown role "${t.role}"`);
      if (!SEGMENT_BANDS.includes(t.band)) throw new Error(`[Virtuoso segment-template] ${id} has unknown band "${t.band}"`);
      if (!t.kind || typeof t.kind !== 'string') throw new Error(`[Virtuoso segment-template] ${id} has no kind`);
      if (t.style && !STYLE_PALETTES[t.style]) throw new Error(`[Virtuoso segment-template] ${id} references unknown style "${t.style}"`);
      const vary = (t.vary && t.vary.length) ? t.vary : [{}];
      for (const d of vary) {
        for (const lk of ['bpm','targetSec','meter','bars']) if (lk in d) throw new Error(`[Virtuoso segment-template] ${id} vary delta sets ${lk} — length determinants (bpm/targetSec/meter/bars) must be held across variants`);
        if (t.style) {
          const pal = STYLE_PALETTES[t.style];
          if (d.progression && !pal.progressions.includes(d.progression)) throw new Error(`[Virtuoso segment-template] ${id} vary progression "${d.progression}" is not in the ${t.style} palette (style-lock)`);
          if (d.scale && !pal.leadScales.includes(d.scale))               throw new Error(`[Virtuoso segment-template] ${id} vary scale "${d.scale}" is not in the ${t.style} palette (style-lock)`);
        }
      }
      for (let i = 0; i < vary.length; i++) {
        const c = rollSegment(t, { variantIdx:i }).config;
        const forcedChord = c.chordOverride && c.chordOverride !== 'auto';
        if (c.scale && !scaleHasQualityRow(c.scale) && !GATE_EXEMPT_SCALES.has(c.scale) && !isSingleChordBacking(t.kind, c.progression) && !forcedChord)
          throw new Error(`[Virtuoso segment-template] ${id} variant ${i}: exotic scale "${c.scale}" over multi-chord backing "${c.progression}" with auto chords (no-row-scale gate)`);
      }
    }
  })();

  // ── Practice-type applicability (the ternary offerable() tag) ───────────────
  // ONE predicate for "is this practice type offered on this instrument", with a
  // TERNARY tag (bass-pedagogy + cross-instrument lock): native (idiomatic as-is) /
  // adapted (transfers but the generator changes behaviour) / n-a (don't offer).
  // Drives the instrument-aware UI (syncInstrumentClass) — the single source of
  // truth replacing the old bending-only hide. Only EXCEPTIONS are listed; anything
  // unlisted is 'native' for every instrument. The `adapted` behaviour contract
  // lives in the generators + the goal-cards (e.g. bass legato = HO/PO only, bass
  // "sweep" = a raked broken arpeggio). Per-lane spec: agent-memory/
  // bass-pedagogy-expert/project_bass_offerable_tag_table.
  // Startup integrity guard (mirrors the no-unison / style-palette / segment guards):
  // every applicability value must be one of the three tags.
  (function validateApplicability() {
    const ok = new Set(['native', 'adapted', 'n-a']);
    for (const k of Object.keys(PRACTICE_APPLICABILITY)) {
      const e = PRACTICE_APPLICABILITY[k];
      for (const inst of Object.keys(e)) if (!ok.has(e[inst])) throw new Error(`[Virtuoso applicability] ${k}.${inst} = "${e[inst]}" is not native/adapted/n-a`);
    }
  })();

  // ── VirtuosoLabWebAudioFont sampler (the engine:'sample' path) ───────────────────────
  // Borrows the host's GM-multisample approach. Loads the player + a GM preset
  // on demand, caches it, and harmony notes for sampled profiles play via
  // queueWaveTable onto the 'harmony' bus — with the oscillator voice as the
  // fallback until the (async) preset finishes loading. Self-hosted: bundled
  // under static/wafonts/, served by routes.py (no runtime CDN dependency,
  // offline-safe). LICENSING (verified 2026-06-12): VirtuosoLabWebAudioFont code is MIT;
  // the sound data is FluidR3_GM (MIT — provenance + license pointers in
  // static/wafonts/README.md). The previously-bundled JCLive variants were
  // REMOVED the same day: their sound-data provenance is unverifiable upstream
  // (an open license-clarification issue with no maintainer answer) — don't
  // reintroduce them in tracked files.
  const WAF_BASE = '/api/plugins/virtuoso_lab/wafont/';
  const WAF_PLAYER_URL = '/api/plugins/virtuoso_lab/wafont/WebAudioFontPlayer.js';
  const WAF_SF = 'FluidR3_GM_sf2_file';
  // Symbolic voice id → General MIDI program. Bundled under static/wafonts/ and
  // served by routes.py (offline-safe). guitar = steel acoustic (25); clean =
  // clean electric (27); bass = fingered electric (33); upright = acoustic bass (32).
  /** @type {Record<string, number>} */
  const TONE_GM = {
    piano: 0, epiano: 4, clav: 7, organ: 19, nylon: 24, guitar: 25, clean: 27,
    upright: 32, bass: 33, strings: 48, brass: 61, synthlead: 81, synthpad: 88, pad: 89,
  };
  // Startup integrity guard (mirrors validateStylePalettes/validateArrangementRecipes):
  // every AUDIO_PROFILES voice points at a real TONE_GM sample, every kit at a real
  // KIT_REGISTRY id, every pad.role is a known role, every family is known. Placed
  // HERE (not next to AUDIO_PROFILES) because it depends on TONE_GM, defined just above.
  // Closes a real gap: drums.kit was previously unguarded — a typo'd kit fell silently
  // to kit_909 at play time. Throws on load, same as a bad progression token.
  (function validateAudioProfiles() {
    const PAD_ROLES = new Set(['sustain', 'comp', 'counter']);
    /** @param {string} id @param {import('./src/core/generation-types.js').AudioVoice | null | undefined} slot @param {string} where */
    const chkTone = (id, slot, where) => {
      if (slot && (slot.engine == null || slot.engine === 'sample') && slot.tone != null && !(slot.tone in TONE_GM))
        throw new Error(`[Virtuoso audio-profile] ${id} ${where} tone "${slot.tone}" is not a TONE_GM voice`);
    };
    for (const id of Object.keys(AUDIO_PROFILES)) {
      const p = AUDIO_PROFILES[id];
      chkTone(id, p.harmony, 'harmony'); chkTone(id, p.bass, 'bass'); chkTone(id, p.pad, 'pad'); chkTone(id, p.notes, 'notes');
      if (p.pad && p.pad.role != null && !PAD_ROLES.has(p.pad.role)) throw new Error(`[Virtuoso audio-profile] ${id} pad.role "${p.pad.role}" not in ${[...PAD_ROLES].join('|')}`);
      if (p.drums && p.drums.kit != null && !KIT_REGISTRY[p.drums.kit]) throw new Error(`[Virtuoso audio-profile] ${id} drums.kit "${p.drums.kit}" is not a KIT_REGISTRY kit`);
      if (p.family && !AUDIO_FAMILY_DEFAULTS[p.family]) throw new Error(`[Virtuoso audio-profile] ${id} family "${p.family}" unknown`);
    }
  })();
  /** @param {number} gm */
  const wafFile = gm => String(gm * 10).padStart(4, '0') + '_' + WAF_SF;
  /** @param {number} gm */
  const wafVar  = gm => /** @type {`_virtuoso_lab_tone_${string}`} */ ('_virtuoso_lab_tone_' + wafFile(gm));
  /** @param {number} gm */
  const wafUrl  = gm => WAF_BASE + wafFile(gm) + '.js';
  /** @type {import('./src/types/waf.js').WafPlayer | null} */
  let wafPlayer = null;
  /** @type {Record<string, {state: string, preset: import('./src/types/waf.js').WavePreset | null, promise: Promise<void> | null}>} */
  const wafPresets = {}; // gm -> { state: 'loading'|'ready'|'failed', preset }
  // Audio assets and optional host visualization scripts share the imported
  // DOM-ID loader; a second cache would change existing in-flight semantics.
  // Returns an awaitable promise that resolves when the load SETTLES (ready OR
  // failed) — so callers can wait for the voice before scheduling, preventing the
  // oscillator→WAF swap mid-exercise. Concurrent calls share the in-flight promise.
  // Low-level loader: cache `key` → load `varName` from `url` (settles ready|failed).
  // Both the melodic GM path and the drum-preset path (Phase D4) go through this.
  /** @param {string | number | null} key @param {`_virtuoso_lab_tone_${string}` | `_virtuoso_lab_drum_${string}`} varName @param {string} url */
  function loadWafPreset(key, varName, url) {
    if (key == null) return Promise.resolve();
    const prev = wafPresets[key];
    if (prev && (prev.state === 'loading' || prev.state === 'ready')) return prev.promise || Promise.resolve(); // in-flight or done; RETRY on prior 'failed'
    /** @type {{state: string, preset: import('./src/types/waf.js').WavePreset | null, promise: Promise<void> | null}} */
    const entry = { state: 'loading', preset: null, promise: null };
    wafPresets[key] = entry;
    entry.promise = (async () => {
      try {
        await loadScriptOnce('virtuoso_lab-waf-player', WAF_PLAYER_URL);
        if (typeof VirtuosoLabWebAudioFontPlayer === 'undefined') throw new Error('VirtuosoLabWebAudioFontPlayer missing');
        if (!wafPlayer) wafPlayer = new VirtuosoLabWebAudioFontPlayer();
        const ctx = ensureAudioCtx();
        if (!window[varName]) await loadScriptOnce('virtuoso_lab-waf-' + key, url);
        const preset = window[varName];
        if (!preset) throw new Error('preset var missing');
        wafPlayer.adjustPreset(ctx, preset);
        entry.state = 'ready'; entry.preset = preset;
      } catch (e) {
        entry.state = 'failed'; entry.preset = null; // silent → oscillator/synth fallback
      }
    })();
    return entry.promise;
  }
  /** @param {number | null} gm */
  function ensureWafPreset(gm) {
    if (gm == null) return Promise.resolve();
    return loadWafPreset(gm, wafVar(gm), wafUrl(gm));
  }
  // Load a drum one-shot preset (Phase D4). Keyed by its var name (no collision with
  // the melodic GM-number keys), served from static/wafonts/ by the /wafont route.
  /** @param {`_virtuoso_lab_drum_${string}`} varName @param {string} file */
  function ensureDrumPreset(varName, file) { return loadWafPreset(varName, varName, WAF_BASE + file); }
  /** @param {number | string | null} gm */
  function getReadyWafPreset(gm) { return (gm != null && wafPresets[gm] && wafPresets[gm].state === 'ready') ? wafPresets[gm].preset : null; }
  // Which sampled-voice GM presets the bundle's ENABLED audio actually needs.
  /** @param {ReturnType<typeof makeBundle> | null} bundle */
  function resolveVoiceGms(bundle) {
    const cfg = readConfig();
    const audio = (bundle && bundle.config && bundle.config.audio) || cfg.audio;
    const prof = resolveAudioProfile({ ...cfg, audio });
    /** @type {number[]} */
    const out = [];
    /** @param {'notes' | 'harmony' | 'pad' | 'bass'} role @param {boolean | undefined} on @param {'notes' | 'harmony' | 'pad' | 'bass'} [profRole] */
    const pick = (role, on, profRole) => { const pr = prof[profRole || role]; if (!on) return; const g = mixerInstrumentFor(role) ?? (pr && pr.engine === 'sample' ? TONE_GM[String(pr.tone)] : null); if (g != null && out.indexOf(g) < 0) out.push(g); };
    // 'pad' (the Keys strip / sustained layer) preloads the profile's harmony
    // voice until profiles grow a dedicated pad slot.
    pick('notes', audio.notes); pick('harmony', audio.harmony); pick('pad', audio.harmony, 'harmony'); pick('bass', audio.harmony);
    // Extra per-track comp voices (track-architecture stage 3b): warm a genre's declared
    // tracks[] voices (the bluegrass guitar) so they're ready at Play. No-op for the genres
    // with no tracks[].
    if (audio.harmony) {
      try {
        for (const t of recipeTracks({ ...cfg, audio })) {
          if (t.role === 'comp' && t.id !== 'comp' && t.id !== 'pad' && t.voice != null) {
            const g = mixerInstrumentFor(t.bus) ?? TONE_GM[t.voice];
            if (g != null && out.indexOf(g) < 0) out.push(g);
          }
        }
      } catch (_) {}
    }
    return out;
  }
  // Kick the (async) load of every sampled voice the bundle needs, WITHOUT waiting —
  // call at generate time so the preset is usually warm by the time Play is pressed.
  /** @param {ReturnType<typeof makeBundle> | null} bundle */
  function prewarmVoices(bundle) {
    resolveVoiceGms(bundle || activeBundle).forEach(gm => ensureWafPreset(gm));
    const dk = activeSampleDrumKit(bundle || activeBundle);
    if (dk) DRUM_CORE_PIECES.forEach(p => ensureDrumPiece(dk, p));   // preload the groove staples (Phase D4)
    sgPrewarm(bundle || activeBundle);                               // sampled-guitar buffers (lazy, cached)
  }
  // The active sample-engine drum kit for this bundle (or null: synth kit / drums off).
  /** @param {ReturnType<typeof makeBundle> | null} bundle */
  function activeSampleDrumKit(bundle) {
    const cfg = readConfig();
    const audio = (bundle && bundle.config && bundle.config.audio) || cfg.audio;
    if (!audio || !audio.harmony || audio.drums === false) return null;
    const kit = resolveDrumKit(resolveAudioProfile({ ...cfg, audio }));
    return (kit && kit.engine === 'sample' && kit.pieces) ? kit : null;
  }
  /** @param {Extract<import('./src/types/audio-graph.js').DrumKit, {engine: 'sample'}>} kit @param {string} piece */
  function ensureDrumPiece(kit, piece) {
    // REAL sampled kit: prewarm every round-robin take of this piece (buffer player).
    const b = kit.bank && DRUMKIT_BANKS[kit.bank];
    if (b && b.src[piece]) {
      const token = b.src[piece], cnt = b.rr[token] || 1, ps = [];
      for (let n = 1; n <= cnt; n++) ps.push(ensureSgBuffer(b.file(token, n)));
      return Promise.all(ps);
    }
    const note = kit.pieces[piece]; if (note == null) return Promise.resolve();
    return ensureDrumPreset(drumVar(note, kit.font, kit.variant), drumFile(note, kit.font, kit.variant));
  }
  // WAIT (capped) for those loads before the first pass is scheduled, so playback
  // starts on the sampled voice instead of starting on the oscillator and swapping
  // to WAF mid-exercise once the load lands. Falls through on timeout/failure (the
  // per-voice oscillator/synth fallback still covers it). Includes the core drum
  // pieces so the kit starts on samples, not the synth fallback.
  /** @param {ReturnType<typeof makeBundle> | null} bundle @param {number} [capMs] */
  async function awaitVoices(bundle, capMs) {
    if (voicesProbe) return voicesProbe(bundle);
    const gms = resolveVoiceGms(bundle || activeBundle);
    const dk = activeSampleDrumKit(bundle || activeBundle);
    const drumPromises = dk ? DRUM_CORE_PIECES.map(p => ensureDrumPiece(dk, p)) : [];
    const sgPromises = sgPrewarm(bundle || activeBundle);
    if (!gms.length && !drumPromises.length && !sgPromises.length) return;
    let timer; const cap = new Promise(r => { timer = setTimeout(r, capMs || 2000); });
    try { await Promise.race([Promise.all([...gms.map(gm => ensureWafPreset(gm)), ...drumPromises, ...sgPromises]), cap]); }
    finally { clearTimeout(timer); }
  }

  // ── Shinyguitar sample voice (tone:'shiny' — the committed CC0 electric-DI guitar) ──
  // Plays the curated subset under static/samples/ (provenance + curation table:
  // static/samples/README.md; band-intelligence Track C2-sample). 17 sustain
  // keycenters (MIDI 37–84, minor-3rd spacing) × 2 velocity layers × 2 round-
  // robins, served by the /sample route. Pitched palm-mutes are NOT separate
  // samples: a 'chug' hit envelope-shortens the sustain on its gain node — the
  // same technique the source library uses (its CC110 "mute" control), and the
  // C1 artic-switch design (zero extra audio nodes beyond source+gain).
  // Loading mirrors the WAF contract: lazy fetch + decodeAudioData, cached,
  // per-chord all-or-nothing readiness so a half-sampled chord never sounds —
  // until ready the WAF clean-electric preset (then the oscillator pad) covers.
  // Selection: the GUIDE (notes) voice now DEFAULTS to this sample for guitar
  // instruments (profile notes.sg — the by-ear gate passed 2026-06-12, see
  // sgNotesWanted); Rhythm/Keys still opt in via the mixer 'Electric DI' pin.
  const SG_BASE = '/api/plugins/virtuoso_lab/sample/';
  const SG_KEYCENTERS = [37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84];
  const SG_VEL_HARD = 0.9;   // ev.vel ≥ 0.9 (accent tier) → the harder vl3 layer
  const SG_LEVEL = 1.0;      // voice trim vs the WAF voices (by-ear tunable)
  // Pseudo round-robin (single-take realism, source-agnostic). Per-hit deterministic
  // micro-variation so a repeated note never replays the identical waveform (the
  // "machine-gun" tell that gives a sampler away). All three by-ear tunable; 0 = off.
  const SG_VAR_CENTS = 4;     // ± cents micro-detune (sub-JND)
  const SG_VAR_GAIN  = 0.06;  // ± gain wobble (~±0.5 dB)
  const SG_VAR_START = 0.004; // up to N s buffer-start jitter (small — preserves the pick attack)
  /** @type {Record<string, {state: string, buf: AudioBuffer | null, promise: Promise<void> | null}>} */
  const sgBuffers = {};      // file -> { state:'loading'|'ready'|'failed', buf, promise }
  /** @type {Record<string, number>} */
  const sgRR = {};           // keycenter_layer -> alternating round-robin pick
  /** @param {number} midi @param {number[]} kcs */
  function sgNearestKc(midi, kcs) {
    const list = kcs || SG_KEYCENTERS;
    let best = list[0];
    for (const kc of list) if (Math.abs(kc - midi) < Math.abs(best - midi)) best = kc;
    return best;
  }
  // Salamander Grand Piano keycenters (CC-BY 3.0; harvested 2026-06-14) — A0..C8 every
  // minor third (A/C/D#/F# per octave), MIDI 21..108 step 3.
  const PF_KCS = Array.from({ length: 30 }, (_, i) => 21 + i * 3);
  // Emily acoustic-guitar keycenters (Karoryfer, CC0; harvested 2026-06-14) — the 18
  // recorded notes (Db2..D6, roughly minor-third spacing), MIDI as labelled in the SFZ.
  const EM_KCS = [37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 86];
  // Wurlitzer EP200 keycenters (Greg Sullivan, CC-BY 3.0; harvested 2026-06-14) — the 12
  // best-covered (mp) notes from a sparse vintage set; the authentic detune is kept. MIDI per SFZ.
  const WUR_KCS = [33, 40, 45, 51, 56, 61, 66, 71, 73, 79, 85, 92];
  // Banjo keycenters (ganjo, CC0; RE-HARVESTED 2026-06-15) — 25 base takes, MIDI per the
  // source SFZ `pitch_keycenter`. The source samples were ~+50¢ sharp of their keycenter and
  // the v1 harvest added ANOTHER ~+90¢ (so they rendered +120–150¢ sharp, worst in keys whose
  // drone landed on a corrupted take) — each was PITCH-CORRECTED onto its keycenter on
  // re-export (verified avg 1.5¢ / worst 8¢ off). The broken kc47 source (an octave low) was
  // dropped; 53/61/71 added for coverage. No per-bank `tune` correction needed now.
  const BJ_KCS = [39, 40, 41, 42, 43, 44, 45, 46, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 61, 63, 67, 68, 70, 71];
  // CP-80 electric grand keycenters (Greg Sullivan E-Pianos, CC-BY 3.0; harvested 2026-06-14)
  // — 21 notes (A0..D#7, ~minor-third spacing), 3 real velocity layers (mp/f/ff). The
  // leading number in the source filename IS the MIDI (no octave trap). Same pack as WUR.
  const CP_KCS = [27, 42, 46, 50, 53, 57, 60, 63, 65, 68, 72, 76, 80, 82, 85, 88, 91, 95, 97, 102, 107];
  // ── Sample BANKS — each instrument the region sampler can play is ONE descriptor row
  // (keycenters, round-robins, velocity layers, brightness, filename builder). velLayers
  // (soft→hard) let a hit pick the layer whose maxVel covers it; null = single layer.
  // Guitar artics (chuck/mutestr) are shiny-only; other banks fall back to WAF for those.
  // Adding an instrument = a row here (+ a SAMPLE_BANK_PINS flag + a mixer option).
  /** @type {Record<string, import('./src/types/audio-graph.js').SampleBank>} */
  const SAMPLE_BANKS = {
    // `amped`: a raw electric-DI guitar that NEEDS an amp to sound right (auto-defaults to
    // the Clean amp when the profile names none). Acoustic/keys banks omit it — they're
    // finished recordings, so no forced guitar-cab insert — but the amp selector stays on
    // the strip, so a Wurli/Rhodes CAN be run through one (they're amped instruments).
    shiny:      { kcs: SG_KEYCENTERS, rr: 2, bright: 0, amped: true,
                  velLayers: [{ tag: 'vl2', maxVel: SG_VEL_HARD }, { tag: 'vl3', maxVel: Infinity }],
                  file: (kc, layer, rr) => `sg_sus_${kc}_${layer}_rr${rr}.ogg` },
    salamander: { kcs: PF_KCS, rr: 1, bright: 0,
                  velLayers: [{ tag: 4, maxVel: 0.42 }, { tag: 9, maxVel: 0.75 }, { tag: 14, maxVel: Infinity }],
                  file: (kc, layer) => `sal_${kc}_v${layer}.ogg` },
    emily:      { kcs: EM_KCS, rr: 2, bright: 0,
                  velLayers: [{ tag: 'p', maxVel: 0.4 }, { tag: 'mf', maxVel: 0.75 }, { tag: 'f', maxVel: Infinity }],
                  file: (kc, layer, rr) => `em_${kc}_${layer}_rr${rr}.ogg` },
    wurli:      { kcs: WUR_KCS, rr: 1, bright: 0.5, velLayers: null,
                  file: (kc) => `wur_${kc}.ogg` },
    banjo:      { kcs: BJ_KCS, rr: 1, bright: 0.4, velLayers: null,
                  // RE-HARVESTED in tune (see BJ_KCS) — no `tune` correction needed.
                  file: (kc) => `bj_${kc}.ogg` },
    cp80:       { kcs: CP_KCS, rr: 1, bright: 0,
                  velLayers: [{ tag: 'mp', maxVel: 0.45 }, { tag: 'f', maxVel: 0.78 }, { tag: 'ff', maxVel: Infinity }],
                  file: (kc, layer) => `cp_${kc}_${layer}.ogg` },
  };
  /** @param {string} bank */
  const bankDesc = bank => SAMPLE_BANKS[bank] || SAMPLE_BANKS.shiny;
  // The velocity-layer tag for a hit (string/number), or null for a single-layer bank.
  /** @param {import('./src/types/audio-graph.js').SampleBank} desc @param {number | null | undefined} vel */
  function bankLayerTag(desc, vel) {
    if (!desc.velLayers) return null;
    const v = vel == null ? 1 : vel;
    for (const L of desc.velLayers) if (v < L.maxVel) return L.tag;
    return desc.velLayers[desc.velLayers.length - 1].tag;
  }
  // Per-register source trim (by-ear, 2026-06-13): the Shinyguitar DI's high
  // keycenters read quieter than the low/mid (a real guitar's top strings put out
  // less) — Christian's dogfood: "the guide's top two strings are quieter than the
  // rest." Lift the upper register to balance a run. Below MIDI 64 = no change, so
  // the metal comp's low power-5ths (root5 ≤ ~57) are untouched. By-ear tunable.
  /** @param {number} midi */
  function sgSourceTrim(midi) {
    if (midi <= 64) return 1;
    const db = Math.min(4, ((midi - 64) / 17) * 4);   // +0 dB @64 → +4 dB @~81
    return Math.pow(10, db / 20);
  }
  // Deterministic per-hit pseudo-RR variation (see SG_VAR_*). `seed` advances per hit
  // (a free-running counter below) so consecutive hits of the SAME note decorrelate;
  // a sine-hash keeps it reproducible within a run. Returns {cents, gainMul, startOff}.
  let sgVarCounter = 0;
  /** @param {number} seed */
  function sampleHitVar(seed) {
    /** @param {number} s */
    const h = s => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
    return {
      cents: (h(seed) - 0.5) * 2 * SG_VAR_CENTS,
      gainMul: 1 + (h(seed + 7.31) - 0.5) * 2 * SG_VAR_GAIN,
      startOff: h(seed + 19.7) * SG_VAR_START,
    };
  }
  /** @param {string} file */
  function ensureSgBuffer(file) {
    const prev = sgBuffers[file];
    if (prev && (prev.state === 'loading' || prev.state === 'ready')) return prev.promise || Promise.resolve();
    /** @type {{state: string, buf: AudioBuffer | null, promise: Promise<void> | null}} */
    const entry = { state: 'loading', buf: null, promise: null };
    sgBuffers[file] = entry;
    entry.promise = (async () => {
      try {
        const ctx = ensureAudioCtx();
        const res = await fetch(SG_BASE + file);
        if (!res.ok) throw new Error('http ' + res.status);
        const raw = await res.arrayBuffer();
        entry.buf = await ctx.decodeAudioData(raw);
        entry.state = 'ready';
      } catch (e) {
        entry.state = 'failed'; entry.buf = null;   // silent → WAF/oscillator fallback
      }
    })();
    return entry.promise;
  }
  // The file(s) a pitched hit needs, per the bank descriptor — every round-robin take
  // (multi-RR banks prewarm both so the alternation never trips a cold buffer mid-run).
  /** @param {number} midi @param {number} vel @param {string} bank */
  const sgFilesFor = (midi, vel, bank) => {
    const d = bankDesc(bank), kc = sgNearestKc(midi, d.kcs), layer = bankLayerTag(d, vel);
    const files = [];
    for (let r = 1; r <= d.rr; r++) files.push(d.file(kc, layer, r));
    return files;
  };
  /** @param {number[] | undefined} midis @param {number} vel @param {string} bank */
  const sgReadyFor = (midis, vel, bank) =>
    (midis || []).every(m => sgFilesFor(m, vel, bank).every(f => sgBuffers[f] && sgBuffers[f].state === 'ready'));
  // Which sample BANK a strip resolves to: a bank id or null/false.
  // (Truthy where callers test "is the sampled guitar on"; the string also names WHICH
  // set to load/play.) Profile defaults are unchanged by removing the opt-in DI bank.
  /** @type {Record<string, number>} */
  const SAMPLE_BANK_PINS = { shiny: 1, salamander: 1, emily: 1, wurli: 1, banjo: 1, cp80: 1 };
  /** @param {string} key */
  const sgToneFor = key => {
    const pin = mixerState[key] && mixerState[key].instrument;
    return SAMPLE_BANK_PINS[String(pin)] ? pin : null;
  };
  // GUIDE (notes) voice resolution — the by-ear gate PASSED 2026-06-12, so the DI
  // sample is the profile DEFAULT for guitar instruments (notes.sg): an explicit mixer
  // pin wins both ways (pin a sample bank forces it, any other pin defeats it); with no
  // pin, the resolved profile's sg flag decides (→ the default 'shiny' bank).
  /** @param {import('./src/core/generation-types.js').AudioProfile | null} prof */
  const sgNotesWanted = prof => {
    const pin = mixerState.notes && mixerState.notes.instrument;
    if (pin) return SAMPLE_BANK_PINS[pin] ? pin : false;
    const n = prof && prof.notes;
    return (n && n.bank) || (n && n.sg ? 'shiny' : false);
  };
  // RHYTHM (harmony) comp voice resolution — same contract (band-intel C3,
  // 2026-06-13): the distorted family's profile declares harmony.sg, so metal/
  // djent comp rides the DI through the Metal amp by default; a pin wins both ways.
  /** @param {import('./src/core/generation-types.js').AudioProfile | null} prof */
  const sgHarmWanted = prof => {
    const pin = mixerState.harmony && mixerState.harmony.instrument;
    if (pin) return SAMPLE_BANK_PINS[pin] ? pin : false;
    const h = prof && prof.harmony;
    return (h && h.bank) || (h && h.sg ? 'shiny' : false);
  };
  // KEYS (pad) voice resolution — a profile pad.bank makes a sampled instrument the Keys
  // default (e.g. the jazz piano comp → Salamander); a mixer pin still wins both ways.
  /** @param {import('./src/core/generation-types.js').AudioProfile | null} prof */
  const sgPadWanted = prof => {
    const pin = mixerState.pad && mixerState.pad.instrument;
    if (pin) return SAMPLE_BANK_PINS[pin] ? pin : false;
    const p = prof && prof.pad;
    return (p && p.bank) || (p && p.sg ? 'shiny' : false);
  };
  // Kick the lazy loads for every buffer the bundle's shiny-pinned strips need.
  // Returns the in-flight promises (awaitVoices races them against its cap).
  /** @param {ReturnType<typeof makeBundle> | null} bundle */
  function sgPrewarm(bundle) {
    /** @type {string | false | null} */
    let wantPad = sgToneFor('pad');
    let /** @type {string | false | null} */ wantHarm = sgToneFor('harmony'), /** @type {string | false | null} */ wantNotes = sgToneFor('notes');
    if (!wantHarm || !wantNotes || !wantPad) {
      try {
        const prof = resolveAudioProfile((bundle && bundle.config) || {});
        if (!wantHarm) wantHarm = sgHarmWanted(prof);
        if (!wantNotes) wantNotes = sgNotesWanted(prof);
        if (!wantPad) wantPad = sgPadWanted(prof);
      } catch (_) {}
    }
    if (!wantHarm && !wantPad && !wantNotes) return [];
    const files = new Set();
    if (bundle && (wantHarm || wantPad)) for (const ev of bundle.backingEvents || []) {
      if (ev.role === 'drums' || ev.role === 'bass') continue;
      const bank = ev.comp != null ? wantHarm : wantPad;
      if (!bank) continue;
      for (const m of ev.midis || []) sgFilesFor(m, ev.vel || 1, bank).forEach(f => files.add(f));
    }
    if (bundle && wantNotes) {
      const opens = (bundle.openMidis && bundle.openMidis.length) ? bundle.openMidis : [];
      for (const n of bundle.notes || []) {
        if (n._tail || n.s < 0 || n.s >= opens.length || n.f < 0) continue;
        sgFilesFor(opens[n.s] + n.f, 1, wantNotes).forEach(f => files.add(f));
      }
    }
    return [...files].map(ensureSgBuffer);
  }
  // Schedule one sampled guitar note. Returns false (caller falls through to the
  // WAF voice) when the buffer isn't decoded yet. artic 'chug' = the palm-mute
  // envelope; everything else sustains to `d` then releases naturally. `vel` picks
  // the velocity LAYER (timbre); `vol` is the gain — both vary, like a real hit.
  // opts (band-intel C2 double-track, 2026-06-13): { pan, delay, cents } — a
  // per-voice StereoPanner BEFORE the bus entry (the amp chain is channel-wise,
  // so L/R separation survives the WaveShaper/cab), a seeded onset offset, and
  // a small detune. The doubled voice naturally pulls the OTHER round-robin
  // take (sgRR increments per call) — real double-tracking is two takes.
  /** @param {AudioContext} ctx @param {string} busName @param {number} when @param {number} midi @param {number} d @param {number} vol @param {(string & {mutestr?: never}) | {mutestr: number} | undefined} artic @param {number} vel @param {{pan?: number, delay?: number, cents?: number, bank?: string, bright?: number}} [opts] */
  function sgVoice(ctx, busName, when, midi, d, vol, artic, vel, opts) {
    if (typeof globalThis !== 'undefined' && globalThis.__VIRTUOSO_LAB_HARNESS__) {
      const st = (globalThis.__virtuoso_lab_sgStats = globalThis.__virtuoso_lab_sgStats || { voices: 0, doubled: 0, chucks: 0, mutestr: 0 });
      st.voices++;
      if (opts && opts.pan != null) st.doubled++;
      if (artic === 'chuck') st.chucks++;
      if (artic && artic.mutestr != null) st.mutestr++;
    }
    const bank = (opts && opts.bank) || 'shiny';
    // Only the guitar DI 'shiny' bank has recorded chuck / dead-mute samples; every other
    // bank (salamander, …) bails on those so the caller falls back to WAF.
    if (bank !== 'shiny' && (artic === 'chuck' || (artic && artic.mutestr != null))) return false;
    let file;
    if (artic === 'chuck') {
      // Multi-string dead-strum chuck — unpitched, 4 recorded chucks × 2 RR.
      const n = (sgRR.chuck = ((sgRR.chuck || 0) + 1) % 8);
      file = `sg_chuck_${(n >> 1) + 1}_rr${(n & 1) + 1}.ogg`;
    } else if (artic && artic.mutestr != null) {
      // Per-string dead mute (sample string 1 = LOW = our s=0).
      const sN = Math.max(1, Math.min(6, artic.mutestr + 1));
      const rr = (sgRR['mut' + sN] = ((sgRR['mut' + sN] || 0) + 1) % 2);
      file = `sg_mutestr_${sN}_rr${rr + 1}.ogg`;
    } else {
      // Pitched sustain — resolve the bank's keycenter, velocity layer, and round-robin
      // take from its descriptor (single-take banks have rr=1 → no cycling).
      const d = bankDesc(bank), kc = sgNearestKc(midi, d.kcs), layer = bankLayerTag(d, vel == null ? 1 : vel);
      const rrKey = bank + '_' + kc + '_' + (layer == null ? '' : layer);
      const rr = d.rr > 1 ? ((sgRR[rrKey] = ((sgRR[rrKey] || 0) + 1) % d.rr) + 1) : 1;
      file = d.file(kc, layer, rr);
    }
    const entry = sgBuffers[file];
    if (!entry || entry.state !== 'ready') { ensureSgBuffer(file); return false; }
    const unpitched = artic === 'chuck' || (artic && artic.mutestr != null);
    // Pseudo-RR per-hit variation on PITCHED hits only (chucks/mutes are already
    // multi-RR and want their recorded percussive transient intact).
    const vary = unpitched ? null : sampleHitVar(midi + (sgVarCounter++));
    if (opts && opts.delay) when += opts.delay;
    const src = ctx.createBufferSource();
    src.buffer = entry.buf;
    src.playbackRate.value = unpitched
      ? 1
      : Math.pow(2, ((midi - sgNearestKc(midi, bankDesc(bank).kcs)) + ((bankDesc(bank).tune || 0) + ((opts && opts.cents) || 0) + (vary ? vary.cents : 0)) / 100) / 12);
    const g = ctx.createGain();
    // Per-register source trim on pitched hits only (the upper-register lift);
    // unpitched chucks/mutes play at their recorded level.
    const v = Math.max(0.0001, vol * SG_LEVEL * (vary ? vary.gainMul : 1) * (unpitched ? 1 : sgSourceTrim(midi)));
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(v, when + 0.003);
    let stopAt;
    if (unpitched) {
      // Recorded thunk — play it as-is, just bound the tail.
      stopAt = when + Math.min(0.5, (/** @type {AudioBuffer} */ (entry.buf)).duration + 0.05);
    } else if (artic === 'chug') {
      // Palm-mute: a short hold then an exponential tail — thump, not a gate.
      // (2026-06-13 dogfood: the rhythm chug "cut off too quickly to feel
      // realistic" — longer hold + slower decay so the muted chug has body.)
      g.gain.setValueAtTime(v, when + 0.04);
      g.gain.setTargetAtTime(0.0001, when + 0.04, 0.105);
      stopAt = when + 0.6;
    } else {
      const end = when + Math.max(0.08, d);
      g.gain.setValueAtTime(v, end);
      g.gain.setTargetAtTime(0.0001, end, 0.08);
      stopAt = end + 0.4;
    }
    // Velocity→brightness: single-layer sample sets fake dynamic timbre via a vel-
    // driven low-pass (opts.bright 0..1 = strength). Absent for multi-velocity-layer
    // sets like Shinyguitar — so no node + no tone change there. Soft → darker, hard → open.
    let head = g;
    // Per-bank brightness default (single-layer keys engage it; multi-layer banks like
    // Shinyguitar/Salamander stay off — no node, tone unchanged) unless a caller overrides.
    const bright = (opts && opts.bright != null) ? opts.bright : bankDesc(bank).bright;
    if (bright && !unpitched) {
      const vv = Math.max(0, Math.min(1, vel == null ? 1 : vel));
      if (vv < 0.98) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 18000 * Math.pow(1800 / 18000, (1 - vv) * bright);
        lp.connect(g); head = lp; audioNodes.push(lp);
      }
    }
    src.connect(head);
    /** @type {AudioNode} */
    let out = g;
    if (opts && opts.pan != null && typeof ctx.createStereoPanner === 'function') {
      const p = ctx.createStereoPanner(); p.pan.value = opts.pan;
      g.connect(p); out = p; audioNodes.push(p);
    }
    out.connect(trackBus(ctx, busName));
    src.start(when, vary ? Math.min(vary.startOff, ((/** @type {AudioBuffer} */ (entry.buf)).duration || 1) * 0.25) : 0);
    src.stop(stopAt);
    audioNodes.push(src, g);
    return true;
  }

  // Startup guard (no-unison pattern; the roundtable's per-policy asserts): run
  // each school over a tiny synthetic crossing run and throw if its defining
  // invariant breaks — a silently wrong stroke mark teaches a wrong habit,
  // worse than no mark at all.
  (function strokePolicyGuard() {
    /** @param {Partial<import('./src/core/notes.js').Note>} [extra] */
    const mk = (extra) => [
      { t: 0.00, s: 0, f: 5 }, { t: 0.25, s: 0, f: 7 }, { t: 0.50, s: 1, f: 5 },
      { t: 0.75, s: 1, f: 7 }, { t: 1.00, s: 0, f: 7 }, { t: 1.25, s: 0, f: 5 },
    ].map(n => Object.assign(n, extra || {}));
    const cfg = { bpm: 120, meter: { numerator: 4, denominator: 4 }, subdivision: 'eighth' };
    const eco = applyEconomyPicking(mk(), cfg);
    if (eco[2].pkd !== 0 || eco[4].pkd !== 1) throw new Error('[Virtuoso stroke-policy] economy crossing must continue the travel direction');
    const gy = applyGypsyPicking(mk(), cfg);
    for (let i = 1; i < gy.length; i++) if (gy[i].pkd === 1 && gy[i].s !== gy[i - 1].s) throw new Error('[Virtuoso stroke-policy] gypsy upstroke off the previous string');
    const mt = applyMetalPicking(mk({ pm: true }), cfg);
    if (mt.some(n => n.pkd !== 0)) throw new Error('[Virtuoso stroke-policy] metal palm-muted eighths under the ceiling must be all-down');
    const mtHi = applyMetalPicking(mk({ pm: true }), Object.assign({}, cfg, { bpm: 200 }));
    if (!mtHi.some(n => n.pkd === 1)) throw new Error('[Virtuoso stroke-policy] metal above the ceiling must flip to alternate');
    // Bass plucking: ghosts COUNT in parity; a descending adjacent-string 16th
    // crossing rakes (same finger) instead of alternating.
    const bp = applyBassPlucking(/** @type {import('./src/core/notes.js').Note[]} */ ([
      { t: 0.00, s: 1, f: 5 }, { t: 0.25, s: 1, f: 7 },
      { t: 0.50, s: 1, f: 5, mt: true }, { t: 0.75, s: 0, f: 5 },
    ]), { bpm: 120, meter: { numerator: 4, denominator: 4 }, subdivision: 'sixteenth' });
    if (bp[2].rh !== 1) throw new Error('[Virtuoso stroke-policy] bass ghost must count in i-m parity');
    if (bp[3].rh !== bp[2].rh) throw new Error('[Virtuoso stroke-policy] bass descending adjacent-string 16th crossing must rake (same finger)');
  })();
  // Count-in grid preview (rhythm-meter spec 2026-06-12): how many sub-ticks per
  // felt beat the COUNT-IN previews for this exercise — the underlying uniform
  // grid, never the cell's onsets (a gallop previews its eighth floor; skip/snap
  // live on a 16th grid). 1 = pulse only. Meter-correct via the beat-unit ratio
  // (bpm cancels): under an /8 meter the pulse already IS the eighth, so an
  // eighth-note exercise previews no extra ticks. Fixes the seam shock — the
  // count-in taught a quarter pulse, then 8ths/16ths arrived unannounced ("the
  // 8ths steamroll you unexpected when your hands are cold").
  // Seconds per metric beat (the meter's denominator unit) for a rendered
  // bundle. Used to size the Tab/Notation view window in beats rather than
  // fixed seconds, so note density stays comfortable across tempos.

  /** @type {Record<string, string>} */
  const FUNCTION_HUE = { tonic: '#3b82f6', subdominant: '#06b6d4', dominant: '#f59e0b' };
  function isJamMode() { const r = $('virtuoso_lab-root'); return !!(r && (r.classList.contains('virtuoso_lab_vir-mode-jam') || r.classList.contains('virtuoso_lab-jam-mode'))); }
  // Startup integrity guard (mirrors validateStrumPatterns): grid shape, known
  // targets/artics, a label on every cell (player-facing from day one).
  (function validateCompGrooves() {
    for (const id of Object.keys(COMP_GROOVES)) {
      const c = COMP_GROOVES[id];
      const expect = (c.bars || 1) * 4 * c.div;
      if (!c.label) throw new Error(`[Virtuoso comp-groove] ${id} has no player-facing label`);
      /** @param {import('./src/core/generation-types.js').CompCell['grid']} g @param {string} tag */
      const chkGrid = (g, tag) => {
        if (g.length !== expect) throw new Error(`[Virtuoso comp-groove] ${id} ${tag} has ${g.length} steps, expected ${expect}`);
        for (const s of g) {
          if (s === '.') continue;
          if (!s || typeof s !== 'object' || !TGT.has(s.t) || COMP_ARTIC[s.a] == null) throw new Error(`[Virtuoso comp-groove] ${id} ${tag} has a bad step ${JSON.stringify(s)}`);
        }
      };
      chkGrid(c.grid, 'grid');
      if (c.vary) c.vary.forEach((g, i) => chkGrid(g, `vary[${i}]`));   // Layer 3: each bar-variant
    }
  })();
  // Guard (mirrors validateCompGrooves): a drone that isn't a real BJ_KCS keycenter would
  // pitch-shift the always-on drone into a coverage gap — throw on load so it can't regress.
  (function validateBanjoDrone() {
    for (const pc in BANJO_DRONE_BY_TONIC) if (!BJ_KCS.includes(BANJO_DRONE_BY_TONIC[pc]))
      throw new Error(`[Virtuoso banjo] drone MIDI ${BANJO_DRONE_BY_TONIC[pc]} (tonic pc ${pc}) is not a BJ_KCS keycenter`);
  })();
  // Startup integrity guard (mirrors validateCompGrooves): grid shape, the
  // beat-1 root (the kick lock is structural), iv range, a root window under
  // the line ceiling, a label on every figure.
  (function validateBassFigures() {
    for (const id of Object.keys(BASS_FIGURES)) {
      const f = BASS_FIGURES[id];
      if (!f.label) throw new Error(`[Virtuoso bass-figure] ${id} has no player-facing label`);
      if (f.kind === 'gen') continue;
      const expect = (f.bars || 1) * 4 * f.div;
      if (!Array.isArray(f.grid) || f.grid.length !== expect) throw new Error(`[Virtuoso bass-figure] ${id} grid has ${(f.grid || []).length} steps, expected ${expect}`);
      let maxIv = 0;
      for (const s of f.grid) {
        if (s === '.') continue;
        if (!s || typeof s !== 'object' || !Number.isFinite(s.iv) || s.iv < 0 || s.iv > 12) throw new Error(`[Virtuoso bass-figure] ${id} has a bad step ${JSON.stringify(s)}`);
        maxIv = Math.max(maxIv, s.iv);
      }
      if (f.grid[0] === '.' || !f.grid[0] || f.grid[0].iv !== 0) throw new Error(`[Virtuoso bass-figure] ${id} must land the ROOT on beat 1 (the kick lock)`);
      if (BASS_FIG_CEIL - maxIv < BASS_FIG_FLOOR) throw new Error(`[Virtuoso bass-figure] ${id} maxIv ${maxIv} leaves no root window under the ${BASS_FIG_CEIL} ceiling`);
    }
  })();
  // Startup integrity guard (mirrors validateCompGrooves/validateBassFigures): the
  // key shape is style:feel:tier with a known tier, and every pointer resolves.
  (function validateArrangementRecipes() {
    for (const key of Object.keys(ARRANGEMENT_RECIPES)) {
      const parts = key.split(':');
      if (parts.length !== 3 || !ARRANGEMENT_TIERS.includes(parts[2])) throw new Error(`[Virtuoso arrangement] bad recipe key "${key}" — want style:feel:tier with tier in ${ARRANGEMENT_TIERS.join('|')}`);
      const p = ARRANGEMENT_RECIPES[key].picks || {};
      if (p.comp && !COMP_GROOVES[p.comp]) throw new Error(`[Virtuoso arrangement] ${key} comp "${p.comp}" is not a COMP_GROOVES cell`);
      if (p.bass && !BASS_FIGURES[p.bass]) throw new Error(`[Virtuoso arrangement] ${key} bass "${p.bass}" is not a BASS_FIGURES figure`);
      if (p.drums && !DRUM_GROOVES[p.drums]) throw new Error(`[Virtuoso arrangement] ${key} drums "${p.drums}" is not a DRUM_GROOVES groove`);
      for (const t of (ARRANGEMENT_RECIPES[key].tracks || [])) {   // track-arch stage 3b: extra comp lanes
        if (!t.id || !t.cell) throw new Error(`[Virtuoso arrangement] ${key} track needs {id, cell}`);
        if (!COMP_GROOVES[t.cell]) throw new Error(`[Virtuoso arrangement] ${key} track "${t.id}" cell "${t.cell}" is not a COMP_GROOVES cell`);
        if (t.voice != null && !(t.voice in TONE_GM)) throw new Error(`[Virtuoso arrangement] ${key} track "${t.id}" voice "${t.voice}" is not a TONE_GM voice`);
      }
    }
  })();
  // Startup integrity guard (mirrors assertRhythmCellsValid / assertStrumGripsValid
  // / the no-unison guard — throws at load so a mis-authored cell never ships):
  // schema sanity + bar-sum, the v1-limit fences, then the TRANSPOSITION SWEEP —
  // every cell must resolve in all 12 keys with at least one 6-fret position
  // window whose resolved span fits maxSpan, and a `changes` cell's final step
  // must land on a pc of the resolving chord (the device actually resolves).
  (function assertMotifCellsValid() {
    const opens = [40, 45, 50, 55, 59, 64];   // standard 6-string proof rig (cells are tuning-relative)
    const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const BN_OK = new Set([0, 0.25, 0.5, 1, 1.5, 2]);
    for (const [id, cell] of Object.entries(MOTIF_CELLS)) {
      /** @param {string} [k] */
      const tag = (k) => `[Virtuoso motif-cell] ${id}${k ? ' @ ' + k : ''}`;
      if (cell.bars !== 1 && cell.bars !== 2) throw new Error(`${tag()}: bars must be 1 or 2`);
      if (cell.pickup) throw new Error(`${tag()}: pickup/anacrusis is not supported yet (D4 — batch 2)`);
      if (cell.harmonyInterval) throw new Error(`${tag()}: harmonyInterval lands with the twin-lead slice`);
      const sum = (cell.steps || []).reduce((a, s) => a + (Number(s.d) || 0), 0);
      if (Math.abs(sum - cell.bars * 4) > 1e-6) throw new Error(`${tag()}: steps sum to ${sum} beats — must equal ${cell.bars * 4} (4/4 v1)`);
      for (const s of cell.steps) {
        if (s.deg == null && s.chr == null && s.a !== 'target') throw new Error(`${tag()}: a step needs deg, chr, or a:'target'`);
        if (s.bn != null && !BN_OK.has(s.bn)) throw new Error(`${tag()}: bn ${s.bn} not in {0,0.25,0.5,1,1.5,2}`);
        if (s.bt != null && !(s.bt >= 0 && s.bt <= 4)) throw new Error(`${tag()}: bt ${s.bt} out of range 0-4`);
      }
      for (const key of KEYS) {
        const cfg = { key, scale: cell.scale, bpm: 80, bars: cell.bars,
          meter: { numerator: 4, denominator: 4, grouping: [4] },
          progression: cell.prog || 'static_i', chordDepth: 'triad', chordOverride: 'auto',
          stringSetup: 'guitar_6_standard' };
        let ok = false, lastErr = null;
        for (let w = 0; w <= 10 && !ok; w++) {       // the sliding position windows the drill will use
          let r;
          try { r = resolveMotifCell(cell, cfg, opens, w, w + 5); } catch (e) { lastErr = e; continue; }
          const frets = [];
          for (const p of r.placed) { frets.push(p.f); for (const q of p.stack) frets.push(q.f); }
          if (Math.max.apply(null, frets) - Math.min.apply(null, frets) > (cell.maxSpan || 4)) continue;
          if (cell.bind === 'changes') {
            const lastP = r.placed[r.placed.length - 1];
            const ev = r.events.find(e => lastP.beat >= e.startBeat - 1e-6 && lastP.beat < e.startBeat + e.durBeats - 1e-6) || r.events[r.events.length - 1];
            const pc = ((lastP.midi % 12) + 12) % 12;
            if (!ev.cpcs.includes(pc)) throw new Error(`${tag(key)}: resolution lands pc ${pc} outside the resolving ${ev.name} (cpcs ${ev.cpcs.join(',')})`);
          }
          ok = true;
        }
        if (!ok) throw new Error(`${tag(key)}: no 6-fret position window resolves within maxSpan ${cell.maxSpan || 4}${lastErr ? ' — ' + (/** @type {Error} */ (lastErr)).message : ''}`);
      }
    }
  })();
  // Startup integrity guard (mirrors the no-unison / style-palette guards): every
  // cell's grid must fill exactly bars × 4 beats × div (authored in 4/4).
  (function validateStrumPatterns() {
    for (const id of Object.keys(STRUM_PATTERNS)) {
      const p = STRUM_PATTERNS[id];
      const expect = (p.bars || 1) * 4 * p.div;
      if (p.grid.length !== expect) throw new Error(`[Virtuoso strum-pattern] ${id} grid has ${p.grid.length} steps, expected ${expect} (bars×4×div)`);
    }
  })();

  // Startup guard (mirrors assertNoUnison): every STRUM_GRIPS grip, at several
  // frets, must voice ONLY chord tones of its CHORD_FORMULAS stack (subset — a
  // voicing may omit the 5th/9th), include the root + 3rd/♭3 + 7th + the headline
  // extension, and never double a MIDI (a same-pitch unison sounds dead). Throws on
  // load → any wrong fOff/interval is caught by every smoke as a pageerror.
  (function assertStrumGripsValid() {
    const opens = [40, 45, 50, 55, 59, 64];   // standard 6-string, for a tuning-independent relative check
    for (const quality of Object.keys(STRUM_GRIPS)) {
      const F = CHORD_FORMULAS[quality];
      if (!F) throw new Error(`[Virtuoso strum-grip] ${quality} has no CHORD_FORMULAS entry`);
      const formula = new Set(F.intervals.map(i => ((i % 12) + 12) % 12));
      const has3 = formula.has(4), hasFlat3 = formula.has(3), has7 = formula.has(10) || formula.has(11);
      // Only the NAME tone (the HIGHEST extension) must be voiced — real grips omit
      // inner extensions (a min11 drops the 9, a 13 may drop the 11).
      const exts = F.intervals.filter(i => i >= 13);
      const headline = exts.length ? ((Math.max.apply(null, exts) % 12) + 12) % 12 : null;
      for (const grip of STRUM_GRIPS[quality]) {
        // Finger-collision (fret-independent): one finger can barre many strings at
        // ONE fret, never two different frets. `fg` is a display hint (does not affect
        // pitch, so the pc checks below can't catch this) — but a chord box that draws
        // an impossible fingering misteaches. (guitar-pedagogy Phase-B review.)
        /** @type {Record<string, Set<number>>} */
        const byFinger = {};
        for (const n of grip.notes) { if (!n.fg) continue; (byFinger[n.fg] = byFinger[n.fg] || new Set()).add(n.fOff); }
        for (const fg of Object.keys(byFinger)) {
          if (byFinger[fg].size > 1) throw new Error(`[Virtuoso strum-grip] ${quality}/${grip.form} finger ${fg} spans ${byFinger[fg].size} frets (impossible)`);
        }
        for (const rootFret of [3, 5, 7, 9]) {
          const rootMidi = opens[grip.rootStr] + rootFret, midis = [], pcs = new Set();
          for (const n of grip.notes) { const m = opens[n.s] + rootFret + n.fOff; midis.push(m); pcs.add(((m - rootMidi) % 12 + 12) % 12); }
          const tag = `${quality}/${grip.form}@${rootFret}`;
          if (new Set(midis).size !== midis.length) throw new Error(`[Virtuoso strum-grip] ${tag} doubles a MIDI (unison)`);
          for (const pc of pcs) if (!formula.has(pc)) throw new Error(`[Virtuoso strum-grip] ${tag} has non-chord-tone ${pc}`);
          if (!pcs.has(0)) throw new Error(`[Virtuoso strum-grip] ${tag} missing the root`);
          if (pcs.size < 3) throw new Error(`[Virtuoso strum-grip] ${tag} has <3 distinct tones`);
          if (has3 && !pcs.has(4)) throw new Error(`[Virtuoso strum-grip] ${tag} missing the 3rd`);
          if (!has3 && hasFlat3 && !pcs.has(3)) throw new Error(`[Virtuoso strum-grip] ${tag} missing the ♭3`);
          if (has7 && !(pcs.has(10) || pcs.has(11))) throw new Error(`[Virtuoso strum-grip] ${tag} missing the 7th`);
          if (headline != null && !pcs.has(headline)) throw new Error(`[Virtuoso strum-grip] ${tag} missing the headline extension ${headline}`);
        }
      }
    }
  })();

  // §9 generation now lives in src/core/session*.js; live-tier run policy stays shell-side.
  // ── Right-sized finite runs (Depth Ladder slice 1) ──────────────────────────
  // A Pathways/Custom DRILL plays a RIGHT-SIZED, FINITE run, not an infinite loop:
  // length is DERIVED from what's being practised (a short pass-bounded box vs a
  // longer cycle-bounded over-the-changes drill), then tiled to that target via the
  // existing fillBlockToDuration (whole reps, never cut a phrase) and ended with the
  // existing session-summary closure. Jam stays endless (the mirror); Workout's own
  // per-block targetSec is untouched. See project_depth_ladder_and_run_length.
  //
  // Base target seconds per practiceType. Default ~50 for anything unlisted.
  /** @type {Record<string, number>} */
  const RUN_TARGET_SEC = {
    // Pass-bounded (short): scale boxes, chromatic, single-technique drills.
    scale:40, chromatic:40,
    legato:45, bending:45, vibrato:45, tremolo_picking:45, tapping:45,
    string_skipping:45, hybrid_picking:45, scale_thirds:45, scale_sixths:45,
    octave_displacement:45, position_shift:45, rhythmic_displacement:45,
    sweep_arpeggios:55,
    // Riff/comp drills — pass-bounded, use the ~50 default explicitly.
    pedal_point:50, pedal_riff:50, power_chord_comping:50,
    // Bass groove primitives — pass-bounded (pocket/stamina), short.
    root_fifth_octave:40, octave_groove:40, dead_note_groove:45, right_hand_technique:40, slap_pop:45,
    // Cycle-bounded (longer, legitimately >60s): the unit is the harmonic cycle.
    diatonic_arpeggios:50, progression_arpeggios:70, arpeggio_inversions:50,
    guide_tones:60, chord_scales:75, bebop_scale:50, chromatic_enclosures:50,
    call_response:60, walking_bass:60, motif:60,
    pentatonic_super:55, triadic_pairs:55, shell_voicings:55, strum_comp:55,
    // Fingerstyle pack: the spider is a pass-bounded warmup; the p-i-m-a study
    // is cycle-bounded (its unit is the progression lap).
    spider:45, fingerstyle_arp:55,
  };
  // Types whose UNIT is a harmonic cycle / whole-neck traversal, not the bar — they
  // get the higher ceiling (180s) and a longer base. The `scale` type joins this
  // set only in the full_neck case (handled in resolveRunTargetSec).
  const CYCLE_BOUNDED_TYPES = new Set([
    'chord_scales','guide_tones','progression_arpeggios','diatonic_arpeggios',
    'walking_bass','arpeggio_inversions','bebop_scale','chromatic_enclosures',
    'call_response','pentatonic_super','triadic_pairs','shell_voicings','strum_comp',
    'motif','fingerstyle_arp',
  ]);
  const RUN_FLOOR_SEC = 25;             // never shorter than this (settling + a couple judged passes)
  const RUN_CEIL_PASS_SEC = 90;         // pass-bounded ceiling (past it grinds sloppiness in)
  const RUN_CEIL_CYCLE_SEC = 180;       // cycle-bounded ceiling (long-cycle / whole-neck)
  // Speed-tier length modifier (the only ladder axis built today): on the Pathways
  // Climb the "groove" Slow tier gets a LONGER run (×1.5) and the "prove it" Fast/Push
  // tiers a SHORTER one (×0.75); Med = ×1.0. The Climb tier is the module-level
  // selected tier index (0=Slow,1=Med,2=Fast,3=Push, mirroring TIER_LABELS). Only applies
  // on a Pathway (Custom has no Climb) — keyed off cfg carrying the pathway's BPM tier
  // when present, else the live index when a pathway is active. Returns 1 otherwise.
  const RUN_TIER_MOD_BY_IDX = [1.5, 1.0, 0.75, 0.75];
  /** @param {import('./src/types/entry-data.js').EntryConfig | null} cfg */
  function runTierMod(cfg) {
    // Explicit tier on the cfg wins (forward-compat / Workout blocks that carry one).
    const named = cfg && (cfg.bpmTier || cfg.tempoTier || cfg.tier);
    if (named != null) {
      const i = TIER_LABELS.findIndex(l => l.toLowerCase() === String(named).toLowerCase());
      if (i >= 0) return RUN_TIER_MOD_BY_IDX[i] || 1;
    }
    // Live Pathways Climb tier — only meaningful while a pathway is the active mode.
    const pathwayMode = !!($('virtuoso_lab-root')?.classList.contains('virtuoso_lab-pathway-mode'));
    if (pathwayMode && practiceSelection.pathwayId && practiceSelection.pathwayId !== 'custom') {
      return RUN_TIER_MOD_BY_IDX[practiceSelection.tierIndex] || 1;
    }
    return 1;
  }
  // Resolve the target run length (seconds) for a single-exercise DRILL config:
  // base table → speed-tier modifier → clamp to [floor, ceiling] (ceiling depends on
  // pass- vs cycle-bounded). fillBlockToDuration then tiles WHOLE reps to ≥ this and
  // overshoots to a whole cell, so the cycle-completion guarantee (≥1 whole rep) is
  // already covered. Returns null when no sensible target applies (then the run is
  // bars-driven, i.e. unchanged behaviour).
  /** @param {import('./src/types/entry-data.js').EntryConfig | null} cfg */
  function resolveRunTargetSec(cfg) {
    if (!cfg) return null;
    const type = cfg.practiceType || cfg.mode || 'scale';
    // The scale type is pass-bounded normally, but a full-neck traversal is a
    // cycle-style (whole-neck) unit — longer base + the higher ceiling.
    const fullNeck = type === 'scale' && cfg.fretboardSystem === 'full_neck';
    const cycleBounded = fullNeck || CYCLE_BOUNDED_TYPES.has(type);
    let base = fullNeck ? 60 : (RUN_TARGET_SEC[type] != null ? RUN_TARGET_SEC[type] : 50);
    base *= runTierMod(cfg);
    const ceil = cycleBounded ? RUN_CEIL_CYCLE_SEC : RUN_CEIL_PASS_SEC;
    const target = Math.max(RUN_FLOOR_SEC, Math.min(ceil, base));
    return target > 0 ? target : null;
  }
  // Apply the per-type run target to a DRILL config so generateExercise tiles it to a
  // right-sized run via fillBlockToDuration. No-op when the caller already set a
  // targetSec (a Workout block, a saved preset, or a share link owns its own length) —
  // we never override an explicit one. NOT called on the Jam path (jamPlay builds its
  // own endless config) or for Workout (generateSession), so this stays drill-only.
  /** @template {import('./src/types/entry-data.js').EntryConfig | null} Config @param {Config} cfg */
  function withRunTarget(cfg) {
    if (cfg?.practiceFile && !cfg.practicePathwayId) return cfg;
    if (!cfg || blockTargetSec(cfg) != null) return cfg;
    const target = resolveRunTargetSec(cfg);
    return target != null ? Object.assign({}, cfg, { targetSec: target }) : cfg;
  }

  // Descriptive exercise title for the bundle's songInfo.title — what each
  // renderer draws as its in-canvas header (and the player HUD for 3D). e.g.
  // "E minor pentatonic". Sessions use their name; chromatic uses the pattern.
  // ===========================================================================
  // §10 · EXERCISE TITLE + makeBundle()
  // wraps an exercise into the renderer-ready bundle (activeBundle).
  // ===========================================================================
  /** @param {import('./src/types/entry-data.js').EntryConfig | null} cfg */
  function exerciseTitle(cfg) {
    try {
      if (!cfg) return 'Virtuoso';
      if (cfg.sessionName) return cfg.sessionName;
      if (cfg.mode === 'chromatic') return 'Chromatic ' + (CHROMATIC_PATTERN_LABELS[cfg.chromaticPattern] || cfg.chromaticPattern || '').toString().trim();
      const scaleLabel = String(cfg.scale || '').replace(/_/g, ' ');
      return [cfg.key, scaleLabel].filter(Boolean).join(' ').trim() || ('Virtuoso ' + (cfg.mode || '')).trim();
    } catch { return 'Virtuoso'; }
  }
  // Bake a count-in into the chart as real lead-in bars: shift every timed
  // element later by `lead` seconds, prepend count-in beats (so notation can
  // draw rests and the highway flows notes in), and extend the duration. The
  // music then lives at [lead, duration]; the loop cycles only that (see the
  // loop scheduler), so the count-in plays once. Bar numbers stay sequential.
  /** @param {import('./src/types/entry-data.js').EntryChart} chart @param {import('./src/types/entry-data.js').EntryConfig} cfg @param {number} lead @param {number} bars */
  function applyCountIn(chart, cfg, lead, bars) {
    /** @param {number | undefined} t */
    const sh = t => +(((t || 0)) + lead).toFixed(6);
    /** @template {{t?: number}} Note @param {Note[] | undefined} arr */
    const shiftNotes = arr => (arr || []).map(n => Object.assign({}, n, { t: sh(n.t) }));
    const notes = shiftNotes(chart.notes);
    const chords = (chart.chords || []).map(ch => Object.assign({}, ch, { t: sh(ch.t), notes: shiftNotes(ch.notes) }));
    const anchors = (chart.anchors || []).map(a => Object.assign({}, a, { time: sh(a.time) }));
    const sections = (chart.sections || []).map(s => Object.assign({}, s, { time: sh(s.time) }));
    const segmentBounds = (chart.segmentBounds || []).map(b => Object.assign({}, b, { start: sh(b.start), end: sh(b.end) }));
    // Count-in beats (cfg meter/bpm) for [0, lead), then the original beats
    // shifted + renumbered so measure numbers stay continuous.
    const leadBeats = buildBeats(cfg, Math.max(0, lead - 1e-4));
    const shifted = (chart.beats || []).map(b => Object.assign({}, b, { time: sh(b.time), measure: (b.measure ?? -1) >= 0 ? b.measure + bars : -1 }));
    const beats = leadBeats.concat(shifted);
    const duration = +(((chart.duration) || 0) + lead).toFixed(6);
    return Object.assign({}, chart, { notes, chords, anchors, sections, segmentBounds, beats, duration, leadIn: lead });
  }
  // Swing/shuffle as a post-process over a SINGLE-exercise bundle (one cfg → one
  // grid). Sessions are swung per-block at assembly instead, so makeBundle skips
  // this when the chart carries pre-assembled backingEvents. Clicks stay on the
  // grid — they're the steady reference you shuffle against.
  /** @param {ReturnType<typeof makeBundle>} bundle @param {import('./src/types/entry-data.js').EntryConfig} cfg */
  function applySwingToBundle(bundle, cfg) {
    if ((SWING_RATIOS[cfg.swing] || 0.5) === 0.5) return;
    const r = swingNotesBacking(bundle.notes, bundle.backingEvents, cfg);
    bundle.notes = r.notes;
    bundle.backingEvents = r.backing;
  }
  /** @param {import('./src/types/entry-data.js').EntryExercise} exercise */
  function makeBundle(exercise) {
    const cfg = exercise.session;
    // Count-in is baked here (not at generation) so the stored chart + LCD stay
    // count-in-free, and toggling count-in is a cheap re-attach, not a re-gen.
    const lead = (cfg.countInBars !== undefined && cfg.countInBars > 0) ? cfg.countInBars * measureSeconds(cfg) : 0;
    const c = lead > 0 ? applyCountIn(exercise.chart, cfg, lead, (/** @type {number} */ (cfg.countInBars))) : exercise.chart;
    // Seamless-loop tail: the loop cycles the music [lead, duration], but every
    // renderer draws a forward lookahead window — near the loop end that window
    // runs past `duration` into emptiness, so notes stop flowing before the
    // wrap. Append copies of the loop's opening notes/beats just past the loop
    // point (one or more loop-lengths, enough to fill any lookahead) so the next
    // pass's notes are already present to flow in. Flagged `_tail` so audio (which
    // loops via its own scheduler) skips them. duration stays the loop point.
    const dur = c.duration || 0, contentLen = dur - lead, LOOKAHEAD_TAIL = 10;
    let notesWithTail = c.notes, beatsWithTail = c.beats;
    if (contentLen > 0.05) {
      const tailNotes = [], tailBeats = [], copies = Math.ceil(LOOKAHEAD_TAIL / contentLen);
      for (let k = 1; k <= copies; k++) {
        const off = k * contentLen;
        for (const n of c.notes) { if (n.t < lead - 1e-6) continue; const tt = n.t + off; if (tt > dur + LOOKAHEAD_TAIL + 0.01) break; tailNotes.push(Object.assign({}, n, { t:+tt.toFixed(6), _tail:true })); }
        for (const b of (c.beats || [])) { if (b.time < lead - 1e-6) continue; const tt = b.time + off; if (tt > dur + LOOKAHEAD_TAIL + 0.01) continue; tailBeats.push(Object.assign({}, b, { time:+tt.toFixed(6), _tail:true })); }
      }
      if (tailNotes.length) notesWithTail = c.notes.concat(tailNotes);
      if (tailBeats.length) beatsWithTail = (c.beats || []).concat(tailBeats);
    }
    /** @type {import('./src/types/entry-data.js').EntryBundle} */
    const bundle = {
      currentTime:0,
      songInfo:{ title:exerciseTitle(cfg), artist:'Virtuoso', arrangement:cfg.instrument === 'bass' ? 'Bass' : 'Lead', tuning:tuningOffsetsForConfig(cfg), capo:0, duration:c.duration, format:'virtuoso_lab-practice', fretboardSystem:cfg.fretboardSystem },
      config:cfg,
      // Finite-run eligibility (Depth Ladder slice 1): a run with a real mode
      // (Pathways/Custom AND a Workout session) plays its tiled length ONCE then
      // ENDS with the recap, instead of looping forever — unless the user flips
      // "keep looping". A Workout MUST be finite: it is the engagement Tier-3 recap's
      // trigger, and looping it re-walked already-credited windows → every note past
      // the first pass painted a STALE "hit" while the counter froze (the ~250-note
      // dogfood bug, 2026-06-09). Jam (mode undefined + its own A–B segment loop)
      // stays endless and never judges. So: eligible = anything with a mode.
      finiteRun: cfg.mode != null,
    isReady:true, notes:notesWithTail, chords:c.chords, anchors:c.anchors, beats:beatsWithTail, sections:c.sections, chordTemplates:c.chordTemplates, handShapes:c.handShapes, segmentBounds:c.segmentBounds || null, timeline:c.timeline || null,
      leadIn:lead,
      // Backing comp/bass + drums cover the music only ([lead, duration]); generate
      // both for the content length, concat, then shift past the count-in (so drums
      // are silent through the count-in and swung with the band — Phase D).
      backingEvents:(function(){
        // Sessions: backing is pre-assembled PER-BLOCK on the chart timeline by
        // buildSessionChart (correct tempo/meter/key per block, silent in the breaks,
        // already swung). Single exercises (Pathways/Custom/Jam): one cfg, synthesize
        // here as before. Either way, shift past the count-in lead.
        const cl = Math.max(0, c.duration - lead);
        /** @type {import('./src/types/entry-data.js').EntryAccompaniment[]} */
        const src = c.backingEvents
          ? c.backingEvents
          // backingDensity 0 = click only (step 3): no comp, no bass, no drums.
          : cfg.backingDensity === 0 ? []
          : /** @type {import('./src/types/entry-data.js').EntryAccompaniment[]} */ (buildBackingEvents(cfg, cl)).concat(buildDrumEvents(cfg, cl, resolveGroove(cfg)));
        return lead ? src.map(ev => Object.assign({}, ev, { t:+(ev.t + lead).toFixed(6), end:+(ev.end + lead).toFixed(6) })) : src;
      })(),
      stringCount:cfg.stringCount, tuning:tuningOffsetsForConfig(cfg), openMidis:openMidisForConfig(cfg), capo:0,
      lyrics:[], toneChanges:[], toneBase:'', drumTab:null, mastery:1, hasPhraseData:false,
      inverted:readHighwayInverted(), lefty:readLefty(), renderScale:readRenderScale(), lyricsVisible:false, project:null, fretX:null,
      // #254 — per-note hit/miss GEMS on the highway. getNoteState returns the live
      // judgment; getNoteStateProvider returns the provider (non-null) only while a
      // scorer is actually running, which is the host's "detect mode active" signal
      // (drives the verdict cull-window + chord-rim). No scorer (no SDK / not playing)
      // → both inert → no gems, unchanged behavior. See ptGetNoteState.
      getNoteState: function(/** @type {import('./src/types/entry-data.js').EntryNote} */ note){ return ptGetNoteState(note); }, getNoteStateProvider: function(){ return (_ptHandle || _ndVerifyMode) ? ptGetNoteState : null; }
    };
    syncHighwaySettings(bundle);
    if (!c.backingEvents) applySwingToBundle(bundle, cfg);   // sessions are swung per-block at assembly; single exercises swing here
    applyFeelLean(bundle.backingEvents, cfg, c.duration);    // Tier-2: per-genre micro-timing LEAN (after swing) — the laid-back/pushed pocket
    // Don't project arpeggio/chord shapes onto the note highway — handShapes
    // drive the highway_3d overlay box. Chord names still appear via `chords`
    // events and the chord-preview thumbnail still renders from chordTemplates.
    bundle.handShapes = [];
    // Proof-loop guide-tones pilot: measure whether this generated line voice-leads
    // to the guide tones (the Connect engine) from the RAW chart — pre count-in/tail,
    // so note times align with chart.timeline. Cheap + harmless; only the flagged
    // verdict downstream reads bundle.proofMeta. (Park/chord_tone_emphasis is excluded
    // — it walks one parent scale, it isn't a changes-connecting line.)
    if (cfg.practiceType === 'chord_scales' && (cfg.chordScaleStrategy || 'mode_of_moment') !== 'chord_tone_emphasis') {
      bundle.proofMeta = measureGuideToneLandings(exercise.chart, cfg);
    }
    return bundle;
  }

  // Label for each open-string MIDI: shows tuning instead of "S1..Sn"
  function makeBuiltin2DRenderer() {
    let /** @type {HTMLCanvasElement | null} */ canvas = null, /** @type {CanvasRenderingContext2D | null} */ ctx = null, W = 0, H = 0;
    const LEFT_PAD = 64, RIGHT_PAD = 28, TOP_PAD = 96, BOTTOM_PAD = 52;
    const AHEAD = 8, BEHIND = 1.5;

    function resize() {
      if (!canvas) return;
      const box = canvas.parentElement || $('virtuoso_lab-render-host');
      const r = box ? box.getBoundingClientRect() : { width: canvas.width, height: canvas.height };
      if (!canvas) return;
      W = Math.max(640, Math.round(r.width || 1280));
      H = Math.max(420, Math.round(r.height || 720));
      canvas.width = W;
      canvas.height = H;
    }
    /** @param {number} s @param {number} count @param {boolean} inverted */
    function laneY(s, count, inverted) {
      const top = TOP_PAD, bottom = H - BOTTOM_PAD;
      const visualIndex = inverted ? s : (count - 1 - s);
      return bottom - (visualIndex * ((bottom - top) / Math.max(1, count - 1)));
    }
    /** @param {number} dt */
    function xForDt(dt) {
      return LEFT_PAD + ((dt + BEHIND) / (AHEAD + BEHIND)) * (W - LEFT_PAD - RIGHT_PAD);
    }

    /** @param {CanvasRenderingContext2D} ctx */
    function drawBackground(ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#08111f'); grad.addColorStop(1, '#050711');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    }

    /** @param {CanvasRenderingContext2D} ctx @param {import('./src/types/entry-data.js').JumpingTabBundle} bundle @param {number} now */
    function drawAnchorZones(ctx, bundle, now) {
      // Anchor zones: subtle highlighted vertical bands showing the current fret window
      const anchors = bundle.anchors || [];
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i], next = anchors[i + 1];
        const aStart = a.time, aEnd = next ? next.time : (bundle.songInfo?.duration || aStart + 1);
        if (aEnd < now - BEHIND || aStart > now + AHEAD) continue;
        const x1 = xForDt(Math.max(-BEHIND, aStart - now));
        const x2 = xForDt(Math.min(AHEAD, aEnd - now));
        ctx.fillStyle = 'rgba(96,165,250,0.04)';
        ctx.fillRect(x1, TOP_PAD - 6, Math.max(2, x2 - x1), H - TOP_PAD - BOTTOM_PAD + 12);
        // Seam label "→ Nfr" (hand-marks Slice 2; UX ruling: the only addition
        // this surface gets — the zone geometry already telegraphs the shift,
        // the label names the destination). First zone isn't a shift.
        if (handMarksOn() && i > 0 && a.fret != null) {
          ctx.fillStyle = 'rgba(148,163,184,0.75)'; ctx.font = '600 10px system-ui'; ctx.textAlign = 'left';
          ctx.fillText('→ ' + a.fret + 'fr', x1 + 4, TOP_PAD + 8);
        }
      }
    }

    /** @param {CanvasRenderingContext2D} ctx @param {number} nStr @param {boolean} inverted @param {number[] | null} openMidis */
    function drawStringLanes(ctx, nStr, inverted, openMidis) {
      ctx.lineWidth = 1;
      for (let s = 0; s < nStr; s++) {
        const y = laneY(s, nStr, inverted);
        ctx.strokeStyle = 'rgba(148,163,184,0.25)';
        ctx.beginPath(); ctx.moveTo(LEFT_PAD - 4, y); ctx.lineTo(W - RIGHT_PAD, y); ctx.stroke();
        const col = STRING_COLORS[s] || '#94a3b8';
        ctx.fillStyle = col;
        ctx.font = '700 13px system-ui';
        const label = openMidis ? stringLabelForMidi(openMidis[s]) : `S${s + 1}`;
        // high e (highest string) is lowercase by convention; low E stays uppercase
        const display = (s === nStr - 1 && label === 'E') ? 'e' : label;
        ctx.fillText(display, 14, y + 5);
      }
    }

    /** @param {CanvasRenderingContext2D} ctx @param {import('./src/types/entry-data.js').JumpingTabBundle} bundle @param {number} now */
    function drawBeatsAndPlayhead(ctx, bundle, now) {
      for (const b of bundle.beats || []) {
        const dt = b.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        ctx.strokeStyle = b.measure >= 0 ? 'rgba(96,165,250,0.55)' : 'rgba(148,163,184,0.18)';
        ctx.lineWidth = b.measure >= 0 ? 1.4 : 1;
        ctx.beginPath(); ctx.moveTo(x, TOP_PAD - 24); ctx.lineTo(x, H - BOTTOM_PAD + 6); ctx.stroke();
        if (b.measure >= 0) {
          ctx.fillStyle = '#93c5fd';
          ctx.font = '11px system-ui';
          ctx.fillText(String(b.measure), x + 4, TOP_PAD - 30);
        }
      }
      const playX = xForDt(0);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(playX, TOP_PAD - 36); ctx.lineTo(playX, H - BOTTOM_PAD + 6); ctx.stroke();
      // Playhead triangle
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(playX - 6, TOP_PAD - 38);
      ctx.lineTo(playX + 6, TOP_PAD - 38);
      ctx.lineTo(playX, TOP_PAD - 30);
      ctx.closePath();
      ctx.fill();
    }

    /** @param {CanvasRenderingContext2D} ctx @param {import('./src/types/entry-data.js').JumpingTabBundle} bundle @param {number} now */
    function drawBackingChords(ctx, bundle, now) {
      for (const ev of bundle.backingEvents || []) {
        if (!ev.name) continue; // boogie emits many nameless hits per bar — one label/bar
        const dt = ev.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        ctx.fillStyle = 'rgba(250,204,21,0.12)';
        ctx.fillRect(x - 42, 22, 84, 26);
        ctx.strokeStyle = 'rgba(250,204,21,0.45)';
        ctx.strokeRect(x - 42, 22, 84, 26);
        ctx.fillStyle = '#fde68a';
        ctx.font = '700 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(ev.name, x, 39);
        ctx.textAlign = 'left';
      }
    }

    /** @param {CanvasRenderingContext2D} ctx @param {import('./src/types/entry-data.js').JumpingTabBundle} bundle @param {number} now */
    function drawChordTiles(ctx, bundle, now) {
      for (const ch of bundle.chords || []) {
        const dt = ch.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        const name = bundle.chordTemplates?.[ch.id]?.displayName || bundle.chordTemplates?.[ch.id]?.name || '';
        ctx.fillStyle = 'rgba(168,85,247,0.18)';
        ctx.fillRect(x - 38, 52, 76, 22);
        ctx.strokeStyle = 'rgba(168,85,247,0.75)';
        ctx.strokeRect(x - 38, 52, 76, 22);
        ctx.fillStyle = '#e9d5ff';
        ctx.font = '700 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(name, x, 68);
        ctx.textAlign = 'left';
      }
    }

    /** @param {CanvasRenderingContext2D} ctx @param {import('./src/types/entry-data.js').JumpingTabBundle} bundle @param {number} now */
    function drawSectionMarkers(ctx, bundle, now) {
      for (const sec of bundle.sections || []) {
        const dt = sec.time - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        ctx.strokeStyle = 'rgba(244,114,182,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, H - BOTTOM_PAD + 8); ctx.lineTo(x, H - BOTTOM_PAD + 22); ctx.stroke();
        ctx.fillStyle = '#fbcfe8';
        ctx.font = '700 10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(sec.name || '·', x, H - BOTTOM_PAD + 36);
        ctx.textAlign = 'left';
      }
    }

    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    function techniqueGlyph(n) {
      if (n.ho) return 'h';
      if (n.po) return 'p';
      if (n.hm) return '◇'; // harmonic
      if (n.pm) return 'PM';
      if (n.mt) return 'x'; // dead/muted
      if (n.tr) return '~~';
      if (n.vb) return '~';
      if (n.tp) return 'T';
      if ((n.sl || -1) >= 0) return '/';
      if ((n.bn || 0) > 0) return `b${n.bn}`;
      return '';
    }

    /** @param {CanvasRenderingContext2D} ctx @param {import('./src/types/entry-data.js').JumpingTabBundle} bundle @param {number} now @param {number} nStr @param {boolean} inverted */
    function drawNotes(ctx, bundle, now, nStr, inverted) {
      for (const n of bundle.notes || []) {
        const dt = n.t - now;
        if (dt < -BEHIND || dt > AHEAD) continue;
        const x = xForDt(dt);
        const y = laneY(n.s, nStr, inverted);
        const col = STRING_COLORS[n.s] || '#94a3b8';
        // Hit paint (2026-06-06 feel panel — the host highway's grammar
        // translated): hit/active = bright outline; miss = dimmed tile with
        // the host-miss red rim; unjudged/exempt = plain.
        const st = bundle.getNoteState ? bundle.getNoteState(n) : null;
        const dimmed = st === 'miss';
        if (dimmed) ctx.globalAlpha = 0.45;

        // sustain bar
        if (n.sus !== undefined && (n.sus || 0) > 0) {
          const x2 = xForDt(dt + n.sus);
          ctx.strokeStyle = col;
          ctx.globalAlpha = dimmed ? 0.2 : (st === 'hit' || st === 'active') ? 0.85 : 0.4;
          ctx.lineWidth = 9;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(Math.min(W - RIGHT_PAD, x2), y); ctx.stroke();
          ctx.globalAlpha = dimmed ? 0.45 : 1;
        }

        // accent halo
        if (n.ac) {
          ctx.fillStyle = col;
          ctx.globalAlpha = dimmed ? 0.08 : 0.18;
          ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = dimmed ? 0.45 : 1;
        }

        // dead note: hollow X instead of fret-number tile
        if (n.mt) {
          ctx.strokeStyle = col;
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10); ctx.stroke();
        } else {
          // note tile — a CREDITED hit fills GREEN with a glow (the host highway's
          // green-hit grammar brought to our own surfaces so a hit is unmistakable
          // on 2D/Tab/Notation, not just the borrowed 3D highway — tester report
          // 2026-07-09). #22c55e/#4ade80 = the cleared/hit green (never themed).
          const hit = (st === 'hit' || st === 'active');
          if (hit) { ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 12; }
          ctx.fillStyle = hit ? '#22c55e' : col;
          ctx.beginPath(); ctx.roundRect(x - 17, y - 13, 34, 26, 7); ctx.fill();
          if (hit) ctx.shadowBlur = 0;
          ctx.strokeStyle = hit ? '#4ade80'
            : dimmed ? '#ff0066'
            : n.ac ? '#f8fafc' : 'rgba(248,250,252,0.5)';
          ctx.lineWidth = hit ? 3 : n.ac ? 3 : dimmed ? 2 : 1.2;
          ctx.stroke();
          ctx.fillStyle = '#020617';
          ctx.font = '800 14px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(String(n.f), x, y + 5);
        }
        if (dimmed) ctx.globalAlpha = 1;

        // palm mute under-bracket
        if (n.pm) {
          ctx.strokeStyle = 'rgba(248,250,252,0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x - 12, y + 18); ctx.lineTo(x - 12, y + 14); ctx.lineTo(x + 12, y + 14); ctx.lineTo(x + 12, y + 18); ctx.stroke();
        }

        // technique glyph above the note
        const glyph = techniqueGlyph(n);
        if (glyph) {
          ctx.fillStyle = '#fde68a';
          ctx.font = '700 11px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(glyph, x, y - 18);
        }
        ctx.textAlign = 'left';
      }
    }

    /** @param {CanvasRenderingContext2D} ctx @param {import('./src/types/entry-data.js').JumpingTabBundle} bundle @param {number} now */
    function drawHud(ctx, bundle, now) {
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '700 14px system-ui';
      ctx.fillText(bundle.songInfo?.title || 'Virtuoso', 14, 22);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui';
      const dur = bundle.songInfo?.duration || 0;
      ctx.fillText(`${now.toFixed(2)}s / ${dur.toFixed(2)}s`, 14, 42);
    }

    /** @param {import('./src/types/entry-data.js').JumpingTabBundle} bundle */
    function draw(bundle) {
      if (!ctx || !bundle) return;
      resize();
      if (!ctx) return;
      const now = bundle.currentTime || 0;
      const nStr = Math.max(1, bundle.stringCount || 6);
      const inverted = !!bundle.inverted;
      const openMidis = bundle.openMidis || null;

      drawBackground(ctx);
      drawAnchorZones(ctx, bundle, now);
      drawStringLanes(ctx, nStr, inverted, openMidis);
      drawBeatsAndPlayhead(ctx, bundle, now);
      drawBackingChords(ctx, bundle, now);
      drawChordTiles(ctx, bundle, now);
      drawSectionMarkers(ctx, bundle, now);
      drawNotes(ctx, bundle, now, nStr, inverted);
      drawHud(ctx, bundle, now);
    }

    return {
      init(/** @type {HTMLCanvasElement} */ c) { canvas = c; ctx = c.getContext('2d'); resize(); window.addEventListener('resize', resize); },
      draw,
      resize,
      destroy() { window.removeEventListener('resize', resize); canvas = null; ctx = null; }
    };
  }

  function makeBuiltin2DTabRenderer() { return makeTabRenderer({ getRenderTheme, handMarksOn }); }
  function makeBuiltin2DNotationRenderer() { return makeNotationRenderer({ getRenderTheme, handMarksOn }); }


  // ===========================================================================
  // §12 · RENDERER FACTORY + BORROWED HOST VIZ
  // Selection/loading live in src/shell/renderers; the probe and attachment
  // ownership stay here with launch cancellation, bundle and clock writers.
  // ===========================================================================
  /** @param {string} kind */
  async function resolveRendererFactory(kind) {
    return rendererLifecycle.resolveFactory(kind);
  }

  function stopAudio() { for (const n of audioNodes) { try { n.stop && n.stop(0); } catch {} try { n.disconnect && n.disconnect(); } catch {} } audioNodes = []; scheduledUntilCtx = 0; schedChartPos = 0; schedChunks = []; }

  // ── Rolling-window loop scheduling ───────────────────────────────────────────
  // Audio is queued in ~SCHED_WINDOW_SECONDS chunks of chart time (never the
  // whole chart at once — see the constant's comment). Chunk seams — including
  // the loop seam, which is just a chunk boundary where the chart position
  // wraps (duration→leadIn for a whole-chart loop, or B→A for an A-B segment
  // loop such as Jam / section looping) — are gapless because each chunk is
  // scheduled on the same AudioContext clock before the previous one ends; the
  // last note's tail rings naturally into the next chunk. The visual clock
  // wraps by phase-carry (see tick()), so neither audio nor playhead freezes.

  // Whether note/metronome/harmony audio is enabled for the active bundle.
  function loopAudioEnabled() {
    const audio = activeBundle?.config?.audio || readConfig().audio;
    return !!(audio && (audio.notes || audio.metronome || audio.harmony));
  }

  // Schedule the first chunk starting at the live playhead and (re)set the
  // window baseline. Used on play, seek, and re-anchor. Captures the nodes this
  // call created so the chunk can later be pruned. Caller stops prior audio.
  /** @param {number} delaySeconds */
  function scheduleCurrentPassAndAnchor(delaySeconds) {
    const dur = activeBundle?.songInfo?.duration || 0;
    const lead = activeBundle?.leadIn || 0;
    const from = transport.time;
    // Bound the first chunk at the active loop's high edge — B when an A-B
    // segment loop is engaged (Jam / section looping), else the chart duration —
    // so a loop's first lap never schedules dead audio past B; the seam refill
    // (scheduleNextChunk) takes over and wraps B→A from there.
    const hi = (transport.loopA != null && transport.loopB != null) ? transport.loopB : dur;
    // The first chunk covers at least the full count-in: its clicks must all
    // land even when the lead-in outruns the window (slow-tempo 2-bar count-in),
    // and with all audio off no refill ever runs (loopAudioEnabled gates it) —
    // a handful of click nodes, so scheduling them upfront costs nothing.
    const winEnd = Math.min(hi, Math.max(from + SCHED_WINDOW_SECONDS, from < lead ? lead + 0.01 : 0));
    const before = audioNodes.length;
    const ret = schedulePreviewAudio((/** @type {import('./src/types/entry-data.js').EntryBundle} */ (activeBundle)), from, delaySeconds, winEnd);
    if (ret == null) { scheduledUntilCtx = 0; schedChartPos = 0; schedChunks = []; return; }
    schedChunks = [{ endCtx: ret.end, nodes: audioNodes.slice(before) }];
    scheduledUntilCtx = ret.base + (winEnd - from);
    schedChartPos = winEnd;
  }

  // Schedule the next chunk starting at schedChartPos / scheduledUntilCtx. At
  // the loop seam the chart position wraps to leadIn — the music only, NOT the
  // count-in — so the count-in plays once and every loop is music. Finite
  // drills (Depth Ladder) never wrap: scheduling stops cleanly at duration.
  function scheduleNextChunk() {
    const dur = activeBundle?.songInfo?.duration || 0;
    const lead = activeBundle?.leadIn || 0;
    if (dur - lead <= 0) return;
    // The window the seam wraps within: an explicit A-B segment loop when
    // engaged (Jam, section looping), else the whole-chart music region. The
    // wrapped chunk is scheduled on the same ctx clock as the chunk before it,
    // so the B→A (or duration→leadIn) seam is gapless — no stopAudio.
    const lo = (transport.loopA != null && transport.loopB != null) ? transport.loopA : lead;
    const hi = (transport.loopA != null && transport.loopB != null) ? transport.loopB : dur;
    let from = schedChartPos;
    if (from >= hi - 1e-6) {
      if (finiteRunActive()) return;   // play-once drill: no audio past the end
      from = lo;                        // loop seam: wrap to the loop start
    }
    const winEnd = Math.min(hi, from + SCHED_WINDOW_SECONDS);
    const before = audioNodes.length;
    const ret = schedulePreviewAudio((/** @type {import('./src/types/entry-data.js').EntryBundle} */ (activeBundle)), from,
      Math.max(0, scheduledUntilCtx - (/** @type {AudioContext} */ (audioCtx)).currentTime), winEnd, /*onsetOnly*/ true);
    if (ret == null) return;
    schedChunks.push({ endCtx: ret.end, nodes: audioNodes.slice(before) });
    scheduledUntilCtx = ret.base + (winEnd - from);
    schedChartPos = winEnd;
  }

  // Disconnect + drop one fully-finished chunk per call (cheap, keeps >=1).
  // endCtx is the chunk's real last sound-end (incl. sustains that run past
  // the chunk's chart window), so ring-out tails are never cut.
  function pruneSchedChunks() {
    if (!audioCtx || schedChunks.length <= 1) return;
    if (schedChunks[0].endCtx + 0.5 >= audioCtx.currentTime) return; // keep ring-out tails
    const dead = (/** @type {{nodes: import('./src/types/audio-graph.js').ScheduledResource[], endCtx: number}} */ (schedChunks.shift()));
    const set = new Set(dead.nodes);
    for (const n of dead.nodes) { try { n.disconnect(); } catch {} }
    audioNodes = audioNodes.filter(n => !set.has(n));
  }

  // Per-frame: refill the next chunk before the scheduled horizon runs dry,
  // and re-anchor if the audio fell out of sync (a seek that bypassed the
  // anchor, or a long rAF stall). Called from tick() for every looping mode —
  // whole-chart, finite (which needs the refill too — its initial chunk no
  // longer covers the whole drill), AND the A-B segment loop (Jam / section
  // looping), whose seam is now gapless via the B→A wrap in scheduleNextChunk.
  function maybeScheduleLoopAhead() {
    if (!audioCtx || !activeBundle || !loopAudioEnabled()) return;
    const dur = activeBundle.songInfo?.duration || 0;
    if (dur <= 0) return;
    const ctxNow = audioCtx.currentTime;
    if (scheduledUntilCtx <= 0 || scheduledUntilCtx <= ctxNow) {
      // For a finite run past its scheduled end this would re-schedule the
      // tail of the drill from the playhead — harmless but pointless churn
      // each frame; the run is about to end at duration. Let it coast.
      if (finiteRunActive() && schedChartPos >= dur - 1e-6) return;
      // Out of sync — reschedule from the live playhead and realign the visual
      // clock. A brief lookahead here is fine: this only fires on a transition
      // (e.g. clearing an A-B loop), never at the steady-state chunk seam.
      stopAudio();
      scheduleCurrentPassAndAnchor(AUDIO_LOOKAHEAD_SECONDS);
      anchorPlayClock(transport.time);
      return;
    }
    if (ctxNow + SCHED_REFILL_AHEAD >= scheduledUntilCtx) scheduleNextChunk();
    pruneSchedChunks();
  }
  function stopRendererPlayback() {
    practiceSelection.cancelLoad();
    // "Sideways" stops land here while still playing (a setting change mid-play
    // regenerates; the Library/Plugins nav buttons leave the screen) — close the
    // practice-session log NOW (while the scorer state is alive, so hit/miss
    // counts are real, not wiped-and-read-as-clean) and release the wake lock,
    // exactly like stopPlayback does. Skipping these leaked the screen-awake
    // lock + let an abandoned run flush later as a fake clean pass (dev-ops
    // e2e audit, 2026-06-05; guarded in smoke-renderers' play/stop cycle).
    if (transport.playing) { sessionEnd(); releaseWakeLock(); }
    transport.stop(); stopRunAudio(); }
  function stopRunAudio() {
    stopAudio(); stopPitchTracker();
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }
  function stopRenderer() { stopRendererPlayback(); rendererLifecycle.reset(); syncPlayButton(); }

  /** @param {import('./src/types/entry-data.js').EntryExercise} exercise */
  async function attachRenderer(exercise) {
    return rendererLifecycle.attach(exercise);
  }

  function syncPlayButton() {
    const btn = $('virtuoso_lab-play');
    if (!btn) return;
    // Three transport states (DAW convention — Stop is its own button now):
    // stopped → "▶ Play" · running → "⏸ Pause" · paused → "▶ Play" (resume).
    // The button keeps the primary accent throughout; the danger red lives on
    // the dedicated Stop button (it was only ever red here because this button
    // used to BE the stop).
    btn.classList.toggle('is-playing', !!(transport.playing && !transport.paused));
    btn.classList.toggle('is-paused', !!(transport.playing && transport.paused));
    btn.textContent = (transport.playing && !transport.paused) ? '⏸' : '▶';
    const stopBtn = $('virtuoso_lab-stop');
    if (stopBtn) stopBtn.disabled = !transport.playing;   // enabled while running OR paused
    practicePresentation.renderStart();
  }
  // First-run primed START CTA (Pathways mode): names the exercise + a short skill
  // hook from the goal, and mirrors the transport (START ⇄ STOP). The one lit primary
  // action on first paint; the preview stays static until pressed (no auto-play).
  // ── Live fretboard strip ──────────────────────────────────────────────────
  // A horizontal neck diagram docked under the highway that lights up the
  // currently-sounding notes — the highway shows WHEN, this shows WHERE the
  // shape sits on the neck. Ported + generalised from the host Fretboard View
  // plugin: any string count, Virtuoso string colours, driven by our own clock.
  let /** @type {CanvasRenderingContext2D | null} */ fbCtx = null, fretboardOn = false;  // off by default; per-view toggle in JT + Notation
  let panelCollapsed = false;  // left settings panel show/hide (persisted)
  /** @type {CanvasRenderingContext2D | null} */
  let rulerCtx = null;  // unified DAW timeline ruler (bars/beats + playhead + A–B loop)
  let fbFretLo = 0, fbFretHi = 12, /** @type {{s: number, f: number, fg?: number}[]} */ fbPattern = [];  // zoomed fret window + unique pattern positions
  const FB_DOT_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
  const FB_DOUBLE_DOT = [12, 24];

  function fretboardStringCount() {
    return (activeBundle?.config?.stringCount) || (activeBundle?.openMidis?.length) || 6;
  }
  // Recompute the zoomed fret window + the exercise's unique note positions (the
  // "pattern") when the chart changes. The window hugs the pattern (±1 fret, with
  // a minimum span) so the shape fills/centres the strip instead of floating on a
  // sparse full neck — less eye travel to reference the current note.
  function fretboardSyncRange() {
    const notes = activeBundle?.notes || [];
    let lo = Infinity, hi = -Infinity; const seen = new Set(); fbPattern = [];
    for (const n of notes) {
      if (n.f < 0) continue;
      if (n.f < lo) lo = n.f;
      if (n.f > hi) hi = n.f;
      const k = n.s + ':' + n.f;
      if (!seen.has(k)) { seen.add(k); fbPattern.push({ s: n.s, f: n.f, fg: n.fg }); }   // fg rides for the finger-in-dot (first note wins — fingering is shape-stable)
    }
    if (!isFinite(lo)) { lo = 0; hi = 12; }
    lo = Math.max(0, lo - 1); hi = Math.min(24, hi + 1);
    const MIN_SPAN = 6;
    if (hi - lo < MIN_SPAN) hi = Math.min(24, lo + MIN_SPAN);
    if (hi - lo < MIN_SPAN) lo = Math.max(0, hi - MIN_SPAN);
    fbFretLo = lo; fbFretHi = hi;
  }
  // Jam target-highlight: the current teaching mirror on the strip. Guitar =
  // chord / guide / scale / off; bass reuses the SAME 4-step ladder but teaches the
  // bassist's job: roots / next root / approach / off. One control path, two jobs.
  /** @type {{guitar: Record<string, string>, bass: Record<string, string>}} */
  const JAM_HL_LABELS = {
    guitar: { chord:'Chord tones — most support', guide:'Guide tones (3rd & 7th)', scale:'Scale', off:'Off — bare neck' },
    bass:   { chord:'Roots — most support', guide:'Next root — see the change coming', scale:'Approach tones', off:'Off — bare neck' },
  };
  let jamHighlightMode = 'chord';   // chord | guide | scale | off
  try { const m = localStorage.getItem('virtuoso_lab.jamHighlight'); if (m) jamHighlightMode = m; } catch (_) {}
  // Spotlight (J-3): which turn the playhead is in — even pass = you solo, odd =
  // band solos. Derived from the per-pass sections (one per pass) so it tracks the
  // chart. null when not a spotlight jam.
  /** @param {number} t */
  function jamSpotlightTurn(t) {
    const b = activeBundle;
    if (!b || !b.config || !b.config.jamSpotlight) return null;
    const secs = b.sections || []; if (!secs.length) return null;
    let idx = 0;
    for (let i = 0; i < secs.length; i++) { if (secs[i].time <= t + 1e-6) idx = i; else break; }
    return (idx % 2 === 0) ? 'you' : 'band';
  }
  function jamCurrentCfg() { return (activeBundle && activeBundle.config) || readConfig(); }
  function jamInstrumentKind() {
    const cfg = jamCurrentCfg() || {};
    return ((STRING_SETUPS[String(cfg.stringSetup)] || {}).instrument || cfg.instrument || 'guitar');
  }
  function jamIsBassContext() { return jamInstrumentKind() === 'bass'; }
  function jamFretboardEligible() { const inst = jamInstrumentKind(); return inst === 'guitar' || inst === 'bass'; }
  // The fretboard highlight in effect right now: Spotlight OVERRIDES per turn (your
  // solo → SCALE sandbox / bass approaches; band solo → CHORD roots or chord tones),
  // else the user's pick.
  /** @param {number} t */
  function jamEffectiveHighlight(t) {
    const turn = jamSpotlightTurn(t);
    if (turn) return turn === 'band' ? 'chord' : 'scale';
    return jamHighlightMode;
  }
  /** @param {number} t */
  function jamCarrierInfo(t) {
    if (!activeBundle) return null;
    const beatSec = chartBeatSeconds(activeBundle) || 0.5;
    const lead = activeBundle.leadIn || 0;
    const tl = activeBundle.timeline || (activeBundle.chart && activeBundle.chart.timeline) || [];
    if (tl.length) {
      let curIdx = -1;
      for (let i = 0; i < tl.length; i++) {
        const at = lead + (tl[i].startSec != null ? tl[i].startSec : (tl[i].t || 0));
        if (at > t + 1e-6) break;
        curIdx = i;
      }
      if (curIdx >= 0) {
        const cur = tl[curIdx];
        const next = tl[curIdx + 1] || tl[0] || null;
        const nextAt = next
          ? (next === tl[0] && curIdx === tl.length - 1
            ? (activeBundle.songInfo?.duration || lead)
            : lead + (next.startSec != null ? next.startSec : (next.t || 0)))
          : (activeBundle.songInfo?.duration || lead);
        const sameChord = !!(next && cur.cpcs && next.cpcs
          && next.cpcs.length === cur.cpcs.length && next.cpcs.every((/** @type {number} */ pc) => cur.cpcs.includes(pc)));
        return { cur, next, beatSec, timeToNext: Math.max(0, nextAt - t), sameChord };
      }
    }
    const evs = activeBundle.backingEvents || [];
    if (!evs.length) return null;
    let curIdx = -1, firstCar = -1;
    for (let i = 0; i < evs.length; i++) {
      if (!evs[i].cpcs) continue;
      if (firstCar < 0) firstCar = i;
      if (evs[i].t > t + 1e-6) break;
      curIdx = i;
    }
    if (curIdx < 0) return null;
    let nextIdx = -1;
    for (let i = curIdx + 1; i < evs.length; i++) { if (evs[i].cpcs) { nextIdx = i; break; } }
    const cur = evs[curIdx];
    const next = nextIdx >= 0 ? evs[nextIdx] : (firstCar != curIdx ? evs[firstCar] : null);
    const timeToNext = nextIdx >= 0 ? evs[nextIdx].t - t : Math.max(0, (activeBundle.songInfo?.duration || 0) - t);
    const sameChord = !!(next && cur.cpcs && next.cpcs
      && next.cpcs.length === cur.cpcs.length && next.cpcs.every(pc => (/** @type {number[]} */ (cur.cpcs)).includes(pc)));
    return { cur, next, beatSec, timeToNext, sameChord };
  }
  /** @param {number} rootPc */
  function bassApproachPcs(rootPc) {
    const pc = ((rootPc % 12) + 12) % 12;
    return [pc, (pc + 11) % 12, (pc + 1) % 12];
  }
  /** @param {number} t */
  function jamTargetPcs(t) {
    const mode = jamEffectiveHighlight(t);
    if (mode === 'off' || !activeBundle) return null;
    if (jamIsBassContext()) {
      const info = jamCarrierInfo(t);
      if (!info || !info.cur) return null;
      const rootPc = (mode === 'guide' || mode === 'scale') && info.next && !info.sameChord
        ? info.next.rootPc : info.cur.rootPc;
      if (rootPc == null) return null;
      return mode === 'scale' ? new Set(bassApproachPcs(rootPc)) : new Set([((rootPc % 12) + 12) % 12]);
    }
    if (mode === 'scale') {
      const cfg = activeBundle.config; if (!cfg) return null;
      const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
      let ivs = SCALE_INTERVALS[cfg.scale] || [];
      // D-J6 (J-2): over a DOMINANT blues context the ♭3/♭5 are bends/passing
      // colors, not landing targets — painting them as equal "targets" teaches
      // the wrong notes. Light root/5/♭7 as home; leave ♭3/♭5 (and the 4 they
      // pass through) unmarked. Minor contexts keep the full scale (♭3 is home).
      if ((cfg.scale === 'blues' || cfg.scale === 'minor_pentatonic') && cfg.chordOverride === 'dom7') {
        ivs = [0, 7, 10];
      }
      return ivs.length ? new Set(ivs.map(i => (keyPc + i) % 12)) : null;
    }
    const info = jamCarrierInfo(t);
    if (!info || !info.cur) return null;
    const pcs = mode === 'guide' ? info.cur.gpcs : info.cur.cpcs;
    return (pcs && pcs.length) ? new Set(pcs) : null;
  }
  // Shift telegraph (hand-marks Slice 2; UX ruling): when the run is about to
  // LEAVE the current fret zone, collect the next position's note dots so the
  // strip can pre-light them as dashed ghosts in their own STRING colors ~1.5
  // beats early — the same anticipation grammar as the Jam next-chord ghost
  // (which stays amber/harmony-only; one grammar, two colors, two questions).
  /** @param {number} t */
  function fretboardShiftGhosts(t) {
    if (!handMarksOn() || !activeBundle) return null;
    const notes = activeBundle.notes || []; if (!notes.length) return null;
    const beat = chartBeatSeconds(activeBundle) || 0.5;
    const lead = beat * 1.5;
    // The current zone = frets sounded over the last ~2 beats.
    let lo = Infinity, hi = -Infinity;
    for (const n of notes) {
      if (n.t > t) break;
      if (n.t >= t - beat * 2 && n.f > 0) { if (n.f < lo) lo = n.f; if (n.f > hi) hi = n.f; }
    }
    if (!isFinite(lo)) return null;
    const out = [], seen = new Set();
    for (const n of notes) {
      if (n.t <= t) continue;
      if (n.t > t + lead) break;
      if (n.f > 0 && (n.f < lo - 2 || n.f > hi + 2)) {
        const k = n.s + ':' + n.f;
        if (!seen.has(k)) { seen.add(k); out.push({ s: n.s, f: n.f, at: n.t }); }
      }
    }
    return out.length ? { ghosts: out, lead } : null;
  }
  // Play-the-changes ANTICIPATION: within ~1.5 beats of the next chord, the NEXT
  // target is ghosted amber on the strip so the player preps the change before it
  // lands. Guitar = next guide tones; bass = next root / approach pocket. Wraps to
  // the top of the loop.
  /** @param {number} t */
  function jamNextGuidePcs(t) {
    const mode = jamEffectiveHighlight(t);
    if (mode === 'off' || !activeBundle) return null;
    const info = jamCarrierInfo(t);
    if (!info || !info.cur) return null;
    if (info.timeToNext > 1.6 * info.beatSec) return null;
    if (jamIsBassContext()) {
      const rootPc = info.next && !info.sameChord ? info.next.rootPc : info.cur.rootPc;
      if (rootPc == null) return null;
      return mode === 'scale' ? new Set(bassApproachPcs(rootPc)) : new Set([((rootPc % 12) + 12) % 12]);
    }
    if (!info.next || info.sameChord) {
      // D-J6 (J-2): a STATIC one-chord vamp has no "next chord" — instead of
      // going dark, pre-light the tonality's COLOR note near the wrap (Dorian
      // ♮6, Mixo ♭7, Lydian ♯4…): the note that says the mode, the thing worth
      // reaching for at the top of the cycle.
      const cfg = activeBundle.config || {};
      const colorIv = { dorian: 9, mixolydian: 10, lydian: 6, phrygian: 1, natural_minor: 8, aeolian: 8 }[cfg.scale];
      if (colorIv == null) return null;
      const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
      return new Set([(keyPc + colorIv) % 12]);
    }
    const pcs = info.next.gpcs || [];
    return pcs.length ? new Set(pcs) : null;
  }
  // Notes sounding within ~80ms of the playhead, with a sustain-based fade.
  /** @param {number} t */
  function fretboardActiveNotes(t) {
    const out = [], win = 0.08, notes = activeBundle?.notes || [];
    for (const n of notes) {
      if (n.t > t + 0.5) break;            // notes are time-sorted
      const end = n.t + (n.sus || 0);
      if (n.t <= t + win && end >= t - win) {
        let alpha = 1;
        if (n.sus !== undefined && n.sus > 0 && t > n.t) alpha = Math.max(0.3, 1 - (t - n.t) / n.sus * 0.7);
        out.push({ s: n.s, f: n.f, alpha, n });   // n rides for the hit-paint state lookup
      }
    }
    return out;
  }
  // Reflect the toggle state onto the root class (drives strip visibility) and
  // the toggle button. The strip only actually appears when the active renderer
  // is also fretboard-capable (see syncViewSwitcher's .virtuoso_lab-fb-capable).
  function syncJamHighlightUI() {
    const labels = jamIsBassContext() ? JAM_HL_LABELS.bass : JAM_HL_LABELS.guitar;
    $('virtuoso_lab-jam-hl')?.setAttribute('aria-label', jamIsBassContext() ? 'Bass target map' : 'Fretboard highlight');
    document.querySelectorAll('#virtuoso_lab-jam-hl .virtuoso_lab-jam-hl-btn').forEach(b => {
      const mode = b.dataset.hl || 'off';
      if (labels[mode]) b.textContent = labels[mode];
      b.classList.toggle('active', mode === jamHighlightMode);
    });
  }
  function syncFretboardUI() {
    $('virtuoso_lab-root')?.classList.toggle('virtuoso_lab-fb-on', fretboardOn);
    const toggle = $('virtuoso_lab-fretboard-toggle');
    toggle?.setAttribute('aria-checked', String(fretboardOn));
    const jam = isJamMode();
    const label = $('virtuoso_lab-fretboard-toggle-label');
    if (label) label.textContent = jam ? (fretboardOn ? 'Target map' : 'Target map off') : 'Fretboard view';
    toggle?.setAttribute('aria-label', jam ? (fretboardOn ? 'Toggle target map' : 'Turn target map on') : 'Toggle fretboard view');
    const wrap = $('virtuoso_lab-fretboard-toggle-wrap');
    if (wrap) wrap.title = jam
      ? (fretboardOn ? 'Chord and target tones light on the neck while you jam.' : 'Turn the target map on to light the changes on the neck while you jam.')
      : '';
  }
  function maybePrimeJamFretboardMap() {
    let hasPref = false;
    try { hasPref = localStorage.getItem('virtuoso_lab.fretboard') != null; } catch (_) {}
    if (hasPref || !jamFretboardEligible()) return false;
    if (!fretboardOn) fretboardOn = true;
    syncFretboardUI();
    return true;
  }
  // Reflect the keep-looping state onto its toggle (visibility is CSS, per mode).
  function syncKeepLoopUI() {
    $('virtuoso_lab-keeploop-toggle')?.setAttribute('aria-checked', String(keepLooping));
  }
  // Reflect the active swing/feel (hidden #virtuoso_lab-swing) onto the visible
  // Feel segmented control.
  function syncFeelControl() {
    const v = ($('virtuoso_lab-swing')?.value) || 'straight';
    document.querySelectorAll('.virtuoso_lab-feel-btn').forEach(b => {
      const on = b.dataset.feel === v;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  // Left settings panel collapse/expand. Reflects state onto the root class
  // (drives the layout) and the chevron button (glyph + a11y).
  function syncPanelToggle() {
    $('virtuoso_lab-root')?.classList.toggle('virtuoso_lab-collapsed', panelCollapsed);
    // « collapse (in the pane) / » expand (floats when collapsed) — CSS shows the
    // right one off .virtuoso_lab-collapsed; just keep a11y state honest.
    $('virtuoso_lab-pane-collapse-btn')?.setAttribute('aria-expanded', String(!panelCollapsed));
    $('virtuoso_lab-pane-expand-btn')?.setAttribute('aria-expanded', String(!panelCollapsed));
  }
  /** @param {boolean} v */
  function setPanelCollapsed(v) {
    panelCollapsed = !!v;  // session-only; startup/selection always resets to expanded
    syncPanelToggle();
    // The left pane now SLIDES (grid-template-columns, ~0.3s) → re-fit the renderer +
    // redraw across the slide so the borrowed viz tracks the widening/narrowing stage
    // (a one-shot re-fit would use the pre-slide width).
    refitStageDuring(340);
  }
  // ── Focus mode (fullscreen the stage) ──────────────────────────────────────
  // Fullscreens just the .virtuoso_lab-stage (transport + ruler + render) so the
  // host chrome drops away. requestFullscreen needs a user gesture (the click
  // provides it); Esc exits via the browser before the host's Escape handler.
  function toggleFocus() {
    const stage = document.querySelector('.virtuoso_lab-stage');
    if (!stage) return;
    if (!document.fullscreenElement) { try { stage.requestFullscreen?.(); } catch (_) {} }
    else { try { document.exitFullscreen?.(); } catch (_) {} }
  }
  function onFullscreenChange() {
    const on = !!document.fullscreenElement;
    $('virtuoso_lab-root')?.classList.toggle('virtuoso_lab-focused', on);
    $('virtuoso_lab-focus-btn')?.setAttribute('aria-pressed', String(on));
    // Re-fit the renderer to the resized stage on the next frame (after layout settles).
    rendererLifecycle.refitNextFrame();
  }

  // ===========================================================================
  // §13 · LIVE FRETBOARD STRIP
  // horizontal neck on #virtuoso_lab-fretboard; hollow pattern + glowing live notes.
  // ===========================================================================
  function drawFretboardFrame() {
    const canvas = $('virtuoso_lab-fretboard');
    if (!canvas || canvas.offsetParent === null) return;  // hidden (wrong view / piano / display:none)
    // The strip now SLIDES via max-height (it stays display:block when capable-but-
    // off), so also skip when it's collapsed/mid-close — no point drawing a canvas the
    // container has clipped to ~0. (clientHeight tracks the live max-height.)
    const _strip = canvas.parentElement; if (_strip && _strip.clientHeight < 4) return;
    if (!fbCtx || fbCtx.canvas !== canvas) fbCtx = canvas.getContext('2d');
    const ctx = fbCtx; if (!ctx) return;
    const dpr = window.devicePixelRatio || 1, rect = canvas.getBoundingClientRect();
    const pxW = Math.max(1, Math.floor(rect.width * dpr)), pxH = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== pxW || canvas.height !== pxH) { canvas.width = pxW; canvas.height = pxH; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width, H = rect.height;
    ctx.fillStyle = 'rgba(8,8,16,0.92)'; ctx.fillRect(0, 0, W, H);
    if (!activeBundle) return;

    const nStrings = fretboardStringCount();
    const opens = (activeBundle.openMidis && activeBundle.openMidis.length)
      ? activeBundle.openMidis : openMidisForConfig(activeBundle.config || readConfig());
    const padL = 34, padR = 12, padT = 12, padB = 18;
    const lo = fbFretLo, hi = fbFretHi, nSpaces = Math.max(1, hi - lo), usableW = W - padL - padR;
    // Cap per-fret width so the neck doesn't stretch edge-to-edge on wide strips
    // (a 6-fret window across ~1600px spread the frets ~270px apart); the capped
    // neck is centered in the usable area instead, so the shape reads tighter.
    const MAX_SPACE = 72;
    const spaceW = Math.min(usableW / nSpaces, MAX_SPACE);
    const neckW = spaceW * nSpaces;
    const x0 = padL + Math.max(0, (usableW - neckW) / 2);
    const rowH = (H - padT - padB) / Math.max(1, nStrings - 1);
    /** @param {number} s */
    const rowY = s => padT + (nStrings - 1 - s) * rowH;        // s=0 (lowest) at the bottom
    const midRow = (nStrings - 1) / 2;
    /** @param {number} f */
    const xLine = f => x0 + (f - lo) * spaceW;                 // fret-line x
    /** @param {number} f */
    const xNote = f => f === 0 ? Math.max(x0 + 4, xLine(0)) : xLine(f - 0.5);  // notehead x

    // Fret lines + nut (only the windowed frets)
    for (let f = lo; f <= hi; f++) {
      const x = xLine(f);
      ctx.strokeStyle = f === 0 ? '#555' : '#23233a'; ctx.lineWidth = f === 0 ? 3 : 1;
      ctx.beginPath(); ctx.moveTo(x, rowY(nStrings - 1)); ctx.lineTo(x, rowY(0)); ctx.stroke();
    }
    // Inlay dots inside the window
    ctx.fillStyle = '#1a1a30';
    for (const f of FB_DOT_FRETS) {
      if (f <= lo || f > hi) continue;
      const x = xLine(f - 0.5);
      if (FB_DOUBLE_DOT.includes(f)) {
        ctx.beginPath(); ctx.arc(x, padT + (midRow - 1) * rowH, 4, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.arc(x, padT + (midRow + 1) * rowH, 4, 0, 6.2832); ctx.fill();
      } else { ctx.beginPath(); ctx.arc(x, padT + midRow * rowH, 4, 0, 6.2832); ctx.fill(); }
    }
    // Strings + open-note labels
    ctx.font = 'bold 10px sans-serif'; ctx.textBaseline = 'middle';
    for (let s = 0; s < nStrings; s++) {
      const y = rowY(s), col = STRING_COLORS[s % STRING_COLORS.length];
      ctx.strokeStyle = col; ctx.globalAlpha = 0.4; ctx.lineWidth = 1 + (nStrings - 1 - s) * 0.3;
      ctx.beginPath(); ctx.moveTo(xLine(lo), y); ctx.lineTo(xLine(hi), y); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.textAlign = 'right';
      ctx.fillText(NOTE_NAMES[(opens[s] ?? 0) % 12], xLine(lo) - 7, y);
    }
    // Fret numbers (actual fret values across the window)
    ctx.fillStyle = '#4a4a5a'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let f = lo + 1; f <= hi; f++) ctx.fillText(String(f), xLine(f - 0.5), rowY(0) + 4);

    // The whole exercise pattern as hollow circles — shows the shape at a glance.
    // Finger-in-the-dot (hand-marks Slice 1; UX ruling): the HOLLOW pattern dots
    // carry the fret-hand finger digit — chord-diagram convention (a diagram
    // dot's digit IS the finger). The LIVE dot keeps its fret digit unchanged.
    // Legibility gate: digits render only at ≥22px per fret (lowered from 28 —
    // on a wide full-neck window 28px hid the digits entirely, reading as "the
    // toggle is broken" even where marks are supported; panel ruling 2026-06-18).
    const fingersOn = handMarksOn() && (xLine(lo + 1) - xLine(lo)) >= 22;
    for (const p of fbPattern) {
      if (p.s < 0 || p.s >= nStrings) continue;
      ctx.strokeStyle = STRING_COLORS[p.s % STRING_COLORS.length]; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(xNote(p.f), rowY(p.s), 7, 0, 6.2832); ctx.stroke();
      if (fingersOn && p.fg !== undefined && p.fg >= 1) {
        ctx.globalAlpha = 0.75; ctx.fillStyle = STRING_COLORS[p.s % STRING_COLORS.length];
        ctx.font = '700 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(p.fg), xNote(p.f), rowY(p.s));
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      }
      ctx.globalAlpha = 1;
    }
    // Jam target-highlight: light the current chord's chord/guide/scale tones within
    // the lead box (green = --virtuoso_lab_vir-meter "target") so the player sees which box notes to
    // aim for as the changes move. Drawn under the live glow.
    const jamOn = $('virtuoso_lab-root')?.classList.contains('virtuoso_lab_vir-mode-jam');
    // D-J7 ghost HOME BOX (slice J-1): a faint dashed frame around the suggested
    // box (the silent guide pattern's fret span) — a suggestion the player can
    // ignore; the whole neck stays live. Replaces the old hard frets-2-9 cage.
    if (jamOn && fbPattern.length) {
      let loF = 99, hiF = -1;
      for (const p of fbPattern) { if (p.f < loF) loF = p.f; if (p.f > hiF) hiF = p.f; }
      if (hiF >= loF) {
        const x0 = xNote(Math.max(0, loF)) - 10, x1 = xNote(hiF) + 10;
        const yA = rowY(0), yB = rowY(nStrings - 1);
        const yTop = Math.min(yA, yB) - 12, yH = Math.abs(yA - yB) + 24;
        ctx.globalAlpha = 0.06; ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x0, yTop, x1 - x0, yH);
        ctx.globalAlpha = 0.30; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.strokeStyle = '#60a5fa';
        ctx.strokeRect(x0, yTop, x1 - x0, yH);
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
    }
    // Anticipation ghost: the NEXT chord's guide tones (amber dashed) as the change
    // nears — prep the target before it lands. Drawn UNDER the current target.
    const nextPcs = jamOn ? jamNextGuidePcs(transport.time) : null;
    if (nextPcs) {
      ctx.setLineDash([2, 2]); ctx.lineWidth = 1.5; ctx.strokeStyle = '#f59e0b';
      for (const p of fbPattern) {
        if (p.s < 0 || p.s >= nStrings) continue;
        if (!nextPcs.has((opens[p.s] + p.f) % 12)) continue;
        ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(xNote(p.f), rowY(p.s), 11, 0, 6.2832); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    // Shift telegraph (hand-marks Slice 2): dashed next-position ghosts in their
    // own string colors as a shift approaches. Practice modes only — Jam carries
    // no prescriptions (the panel constitution), and its ghost slot is the
    // harmony anticipation above. Fade-in ~150ms, gated by reduced-motion.
    if (!jamOn) {
      const tg = fretboardShiftGhosts(transport.time);
      if (tg) {
        const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        ctx.setLineDash([3, 2]); ctx.lineWidth = 1.5;
        for (const g of tg.ghosts) {
          if (g.s < 0 || g.s >= nStrings) continue;
          const sinceQ = tg.lead - (g.at - transport.time);   // seconds since this ghost qualified
          const a = rm ? 0.4 : 0.4 * Math.max(0, Math.min(1, sinceQ / 0.15));
          if (a <= 0.01) continue;
          ctx.globalAlpha = a; ctx.strokeStyle = STRING_COLORS[g.s % STRING_COLORS.length];
          ctx.beginPath(); ctx.arc(xNote(g.f), rowY(g.s), 10, 0, 6.2832); ctx.stroke();
        }
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
    }
    const targetPcs = jamOn ? jamTargetPcs(transport.time) : null;
    if (targetPcs) {
      for (const p of fbPattern) {
        if (p.s < 0 || p.s >= nStrings) continue;
        if (!targetPcs.has((opens[p.s] + p.f) % 12)) continue;
        const x = xNote(p.f), y = rowY(p.s);
        ctx.globalAlpha = 0.30; ctx.fillStyle = '#22c55e';
        ctx.beginPath(); ctx.arc(x, y, 10, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 0.95; ctx.lineWidth = 2; ctx.strokeStyle = '#4ade80';
        ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    // Played-note mirror (J-3): a fading RIPPLE where YOUR detected pitch just
    // landed — the Jam mirror of your own playing (cool-white, expanding as it
    // fades; distinct from the green target + amber anticipation). Pure mirror:
    // it reflects what the detector heard, NEVER judges it (no hit/miss color).
    if (jamOn && _jamPlayed.length) {
      const nowMs = performance.now();
      for (const pn of _jamPlayed) {
        const age = nowMs - pn.t; if (age >= JAM_PLAYED_FADE_MS) continue;
        const a = 1 - age / JAM_PLAYED_FADE_MS;
        for (const p of fbPattern) {
          if (p.s < 0 || p.s >= nStrings) continue;
          if ((opens[p.s] + p.f) % 12 !== pn.pc) continue;
          ctx.globalAlpha = a * 0.85; ctx.lineWidth = 2; ctx.strokeStyle = '#e0e7ff';
          ctx.beginPath(); ctx.arc(xNote(p.f), rowY(p.s), 6 + (1 - a) * 6, 0, 6.2832); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    // Currently-sounding notes glow (filled) on top of their hollow markers.
    for (const n of fretboardActiveNotes(transport.time)) {
      if (n.s < 0 || n.s >= nStrings) continue;
      const y = rowY(n.s), x = xNote(n.f);
      const col = STRING_COLORS[n.s % STRING_COLORS.length];
      ctx.globalAlpha = n.alpha * 0.3; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = n.alpha; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(n.f), x, y);
      // Hand-marks on the live dot: the plucking/picking mark for the note you're
      // playing NOW — the bass RH lane (T/P thumb-pop, i-m fingers) and guitar pick
      // strokes (⊓/∨). This is the marks' home on the 3D Highway, whose gems are
      // closed to per-note marks (host check 2026-06-18). Display-only, never scored.
      if (handMarksOn() && n.n && (n.n.rh != null || n.n.pkd === 0 || n.n.pkd === 1)) {
        const sn = n.n; ctx.globalAlpha = 0.9; ctx.strokeStyle = col; ctx.fillStyle = col;
        if (sn.rh != null) {
          ctx.font = 'italic 700 9px "Cambria","Georgia",serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(rhGlyph(sn), x, y - 13);
        } else {
          ctx.lineWidth = 1.4; ctx.beginPath();
          if (sn.pkd === 0) { ctx.moveTo(x - 3, y - 11); ctx.lineTo(x - 3, y - 15); ctx.lineTo(x + 3, y - 15); ctx.lineTo(x + 3, y - 11); }
          else { ctx.moveTo(x - 3, y - 15); ctx.lineTo(x, y - 11); ctx.lineTo(x + 3, y - 15); }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      // Hit paint (2026-06-06 feel panel): a CREDITED note adds a bright
      // near-white ring around its live dot — reward-only; the strip is the
      // honesty surface, so a miss paints NOTHING here, ever. ptGetNoteState
      // self-guards (null without a scorer, always null in Jam).
      const st = n.n ? ptGetNoteState(n.n) : null;
      if (st === 'hit' || st === 'active') {
        // credited hit → GREEN glow-ring on the live dot (reward-only; a miss
        // paints nothing here — the strip is the honesty surface). Host green-hit
        // grammar, consistent with the note renderers (tester report 2026-07-09).
        ctx.globalAlpha = 1; ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 10;
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(x, y, 10.5, 0, 6.2832); ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
    }
  }

  // ── Unified DAW timeline ruler ───────────────────────────────────────────
  // One canvas carrying everything the two old widgets did, plus a bar/beat
  // grid: bar lines + bar numbers, beat/group ticks, the A–B loop band (with
  // edge grips), and the playhead. Time→x is linear across the chart duration.
  // The top strip (loopZoneH) is the loop/cycle zone; below it is the scrub
  // zone — see the pointer handler in bind(). Pure draw; reads tpA/tpB + time.
  const RULER_LOOP_ZONE = 18;  // px height of the top loop/cycle strip
  function rulerGeom() {
    const canvas = $('virtuoso_lab-ruler-canvas'); if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const padX = 2, usableW = Math.max(1, rect.width - padX * 2);
    const dur = activeBundle?.songInfo?.duration || 0;
    return { rect, padX, usableW, dur };
  }
  // The SAME scroll window the note renderers use (chartBeatSeconds + AHEAD/BEHIND),
  // so the ruler's bars stay pixel-aligned with the falling notes. Two-lane DAW
  // transport redesign — memory project_transport_two_lane_redesign.
  function rulerWindow() {
    const winBeat = chartBeatSeconds(activeBundle);
    const AHEAD = Math.max(2.5, Math.min(6, winBeat * 5));
    const BEHIND = Math.max(0.9, Math.min(2.2, winBeat * 1.8));
    return { AHEAD, BEHIND, span: AHEAD + BEHIND };
  }
  // One mapping used by both the draw and the pointer handlers so they never
  // diverge. Default = fixed-scale SCROLLING (playhead fixed ~22% left, timeline
  // scrolls under it). prefers-reduced-motion → fall back to the static fit-to-width
  // model (playhead moves; no scroll) so motion-sensitive users aren't scrolled.
  function rulerMap() {
    const g = rulerGeom(); if (!g) return null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const now = Math.max(0, Math.min(g.dur || 0, transport.time));
    if (reduce || g.dur <= 0) {
      return { g, scroll: false, now,
        xAt: (/** @type {number} */ t) => g.padX + (g.dur ? (t / g.dur) : 0) * g.usableW,
        tAt: (/** @type {number} */ cx) => Math.max(0, Math.min(g.dur, (cx - g.rect.left - g.padX) / g.usableW * g.dur)),
        inView: () => true };
    }
    const win = rulerWindow();
    return { g, scroll: true, now,
      xAt: (/** @type {number} */ t) => g.padX + ((t - now + win.BEHIND) / win.span) * g.usableW,
      tAt: (/** @type {number} */ cx) => Math.max(0, Math.min(g.dur, now + ((cx - g.rect.left - g.padX) / g.usableW) * win.span - win.BEHIND)),
      inView: (/** @type {number} */ t) => t >= now - win.BEHIND - 0.06 && t <= now + win.AHEAD + 0.06 };
  }
  // Are we mid-count-in / inter-block breath / resume pre-roll RIGHT NOW, and how
  // many beats until the next downbeat? The head count-in, the inter-block break,
  // the loop-wrap break, and the resume runway are one primitive — "establish the
  // incoming pulse before its notes" — so they share one countdown readout (the
  // Workout-love Tier-2 "the breath carries a visible count, not dead air" fix).
  // The count counts at the INCOMING block's pulse (the brk/lead beats are built in
  // its meter). Returns null when notes are playing. Memory: project_workout_love.
  function seamCountInfo() {
    const b = activeBundle; if (!b) return null;
    const beats = b.beats || []; if (!beats.length) return null;
    const lead = b.leadIn || 0, dur = b.songInfo?.duration || 0;
    const now = transport.time;
    let target = null, kind = null;
    if (transport.preRollUntil > 0 && now < transport.preRollUntil) { target = transport.preRollUntil; kind = 'resume'; }
    else if (lead > 0 && now < lead - 1e-4) { target = lead; kind = 'countin'; }
    else {
      // Inside a run of `brk` beats (inter-block break or trailing loop-wrap)?
      let cur = null;
      for (let i = 0; i < beats.length; i++) {
        const t1 = (i + 1 < beats.length ? beats[i + 1].time : Infinity);
        if (now >= beats[i].time - 1e-4 && now < t1 - 1e-4) { cur = beats[i]; break; }
      }
      if (cur && cur.brk) {
        for (let i = 0; i < beats.length; i++) { if (beats[i].time > now + 1e-4 && !beats[i].brk) { target = beats[i].time; break; } }
        if (target == null) target = dur;   // trailing wrap break → counts to the loop point
        kind = 'break';
      }
    }
    if (target == null || target <= now + 1e-4) return null;
    // The digit holds across its own beat: count from the current beat (inclusive)
    // to the downbeat (exclusive) → 4,3,2,1 then clear on the downbeat. Count only
    // within the CURRENT bar (to the next bar-start), not the whole break — a 3–4
    // bar verdict seam (Tier 3) would otherwise read "12 11 10…" (rhythm-meter
    // ruling). Multi-bar breaks then count 4·3·2·1 per bar, the DAW convention.
    let cbs = now;
    for (let i = beats.length - 1; i >= 0; i--) { if (beats[i].time <= now + 1e-4) { cbs = beats[i].time; break; } }
    let barEnd = target;
    for (let i = 0; i < beats.length; i++) {
      if (beats[i].time > cbs + 1e-4 && (beats[i].measure ?? -1) >= 0) { barEnd = Math.min(target, beats[i].time); break; }
    }
    let remain = 0;
    for (let i = 0; i < beats.length; i++) { if (beats[i].time >= cbs - 1e-4 && beats[i].time < barEnd - 1e-4) remain++; }
    return { kind, target, start: cbs, remain: Math.max(1, remain) };
  }
  // The per-block SEAM VERDICT (Tier 3): at a genuine inter-block break in a
  // multi-block Workout, which block just ended + which is next. Drives the DOM
  // breath card (the NAMES) and the ruler's "NEXT ▸ <name>" label. Excludes the
  // head count-in / resume runway (kind != 'break'), the trailing loop-wrap break
  // (target = the loop point, ≥ dur), Jam, and single-drill charts (< 2 blocks).
  /** @param {ReturnType<typeof seamCountInfo>} [seam] */
  function seamVerdictInfo(seam) {
    seam = seam || seamCountInfo();
    if (!seam || seam.kind !== 'break' || isJamMode()) return null;
    const b = activeBundle; if (!b) return null;
    const dur = b.songInfo?.duration || 0;
    if (seam.target >= dur - 1e-3) return null;            // trailing loop-wrap, not an inter-block transition
    const sb = Array.isArray(b.segmentBounds) ? b.segmentBounds : [];
    if (sb.length < 2) return null;
    let nextIdx = -1;
    for (let i = 0; i < sb.length; i++) { if (sb[i].start >= seam.target - 0.05) { nextIdx = i; break; } }
    if (nextIdx <= 0) return null;                          // no prior block to close
    return { done: sb[nextIdx - 1], next: sb[nextIdx], idx: nextIdx, total: sb.length };
  }
  function drawRulerFrame() {
    const canvas = $('virtuoso_lab-ruler-canvas');
    if (!canvas || canvas.offsetParent === null) return;  // hidden view
    if (!rulerCtx || rulerCtx.canvas !== canvas) rulerCtx = canvas.getContext('2d');
    const ctx = rulerCtx; if (!ctx) return;
    const dpr = window.devicePixelRatio || 1, rect = canvas.getBoundingClientRect();
    const pxW = Math.max(1, Math.floor(rect.width * dpr)), pxH = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== pxW || canvas.height !== pxH) { canvas.width = pxW; canvas.height = pxH; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width, H = rect.height;
    ctx.clearRect(0, 0, W, H);
    const dur = activeBundle?.songInfo?.duration || 0;
    if (!activeBundle || dur <= 0) return;
    const padX = 2, lz = Math.min(RULER_LOOP_ZONE, H * 0.4);
    const map = rulerMap(); if (!map) return;
    const xAt = map.xAt;
    // Jam: bar numbers are LOOP-RELATIVE (1…N each cycle), not 1…∞ — "where am I in
    // this cycle." N = the progression's bar count (the jam loop length).
    const jam = isJamMode();
    const cycN = jam ? (activeBundle.config?.bars || 0) : 0;
    const seam = seamCountInfo();   // mid count-in / break / resume runway? (suppresses the loop hint; drawn as a readout last)

    // Loop-zone backing + base track
    ctx.fillStyle = 'rgba(148,163,184,0.06)'; ctx.fillRect(0, 0, W, lz);
    ctx.strokeStyle = 'rgba(148,163,184,0.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, lz + 0.5); ctx.lineTo(W, lz + 0.5); ctx.stroke();

    // Bar lines + numbers + beat/group ticks — only those in the visible window.
    // Scrolling → ~7 bars on screen, always legible (no picket fence, no decimation).
    const beats = activeBundle.beats || [];
    ctx.textBaseline = 'top'; ctx.font = '10px ui-monospace, monospace';
    for (const b of beats) {
      if (!map.inView(b.time)) continue;
      const x = xAt(b.time), isBar = (b.measure ?? -1) >= 0;
      if (isBar) {
        ctx.strokeStyle = 'rgba(96,165,250,0.45)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, lz); ctx.lineTo(x, H); ctx.stroke();
        ctx.fillStyle = '#8aa0bd'; ctx.fillText(String(cycN > 0 ? ((((b.measure - 1) % cycN) + cycN) % cycN) + 1 : b.measure), x + 3, lz + 2);
      } else {
        const grp = b.accent === 'group';
        ctx.strokeStyle = grp ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.15)';
        ctx.lineWidth = 1; const tH = grp ? (H - lz) * 0.7 : (H - lz) * 0.42;
        ctx.beginPath(); ctx.moveTo(x, H - tH); ctx.lineTo(x, H); ctx.stroke();
      }
    }

    // A–B loop band (clipped to the visible window) + off-screen edge chevrons so
    // you always know which way an off-screen loop boundary lies.
    if (transport.markerA != null && transport.markerB != null && Math.abs(transport.markerA - transport.markerB) > 0.02) {
      const ax = xAt(Math.min(transport.markerA, transport.markerB)), bx = xAt(Math.max(transport.markerA, transport.markerB));
      const cax = Math.max(0, Math.min(W, ax)), cbx = Math.max(0, Math.min(W, bx));
      if (cbx > cax) {
        ctx.fillStyle = 'rgba(64,128,224,0.20)'; ctx.fillRect(cax, lz, cbx - cax, H - lz);
        ctx.fillStyle = 'rgba(64,128,224,0.85)'; ctx.fillRect(cax, 0, cbx - cax, lz);
      }
      ctx.fillStyle = '#9ec1ff';
      if (ax >= 0 && ax <= W) ctx.fillRect(ax - 1, 0, 2, H);
      else { ctx.beginPath(); ctx.moveTo(2, lz / 2 - 4); ctx.lineTo(9, lz / 2); ctx.lineTo(2, lz / 2 + 4); ctx.closePath(); ctx.fill(); }
      if (bx >= 0 && bx <= W) ctx.fillRect(bx - 1, 0, 2, H);
      else { ctx.beginPath(); ctx.moveTo(W - 2, lz / 2 - 4); ctx.lineTo(W - 9, lz / 2); ctx.lineTo(W - 2, lz / 2 + 4); ctx.closePath(); ctx.fill(); }
    } else if (!seam) {   // the seam readout owns the loop strip while counting in
      ctx.fillStyle = 'rgba(100,116,139,0.65)'; ctx.font = '8px sans-serif'; ctx.textBaseline = 'middle';
      ctx.fillText(jam ? 'CYCLE · drag to focus' : 'LOOP · drag here', padX + 3, lz / 2 + 0.5);
    }

    // Playhead: scrolling → FIXED at ~22% (xAt(now)) with the timeline moving under
    // it; reduced-motion fit → the playhead moves instead. Line + bottom flag.
    const px = xAt(map.now);
    ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.moveTo(px - 4, H); ctx.lineTo(px + 4, H); ctx.lineTo(px, H - 5); ctx.closePath(); ctx.fill();

    // Count-in / break readout — drawn LAST so it overlays. A silent breath used to
    // read as dead air; now the runway ahead of the playhead is washed amber, the
    // loop strip shows a label, and a countdown digit (4 3 2 1) sits over the runway.
    if (seam) {
      const rx0 = Math.max(0, px), rx1 = Math.min(W, xAt(seam.target));
      if (rx1 > rx0) { ctx.fillStyle = 'rgba(245,180,80,0.12)'; ctx.fillRect(rx0, lz, rx1 - rx0, H - lz); }
      ctx.fillStyle = 'rgba(245,180,80,0.20)'; ctx.fillRect(0, 0, W, lz);
      // The incoming block name rides the NEXT ▸ label (so 2D/Tab/Notation get it
      // even when the overview band is too narrow to render text) — the ruler owns
      // the digit, the DOM seam card owns the fuller closure. (Tier 3.)
      const sv = seamVerdictInfo(seam);
      let label = seam.kind === 'countin' ? 'COUNT-IN' : seam.kind === 'resume' ? 'RESUME' : 'NEXT ▸';
      if (sv && sv.next && sv.next.name) label = `NEXT ▸ ${sv.next.name}`;
      ctx.fillStyle = 'rgba(247,206,140,0.95)'; ctx.font = 'bold 8px ui-sans-serif, sans-serif';
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText(label, padX + 4, lz / 2 + 0.5);
      const dx = Math.max(px + 12, Math.min(W - 10, (Math.max(px, rx0) + rx1) / 2));
      ctx.fillStyle = '#ffd591'; ctx.font = 'bold 14px ui-monospace, monospace'; ctx.textAlign = 'center';
      ctx.fillText(String(seam.remain), dx, lz + (H - lz) / 2 + 0.5);
      ctx.textAlign = 'left';
    }
  }

  // ── Overview / marker strip (two-lane transport, lane 2) ─────────────────────
  // The whole-session MAP: fit-to-width, role-tinted NAMED segment bands (the DAW
  // arrangement track — mirrors the host's Section Map). The A–B loop is authored
  // here (you can't grab an off-screen loop on the scrolling working ruler), and
  // click = seek anywhere in the session. Degrades to one band for a single drill
  // (the progressive-disclosure "simplest transport"). Never meter-green (bands are
  // categorical role tints; green = cleared-only). Memory: project_transport_two_lane_redesign.
  /** @param {string} hex @param {number} a */
  function hexA(hex, a) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return hex || 'rgba(100,116,139,0.3)';
    const n = parseInt(m[1], 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  /** @returns {import('./src/types/entry-data.js').OverviewBand[]} */
  function overviewBands() {
    const b = activeBundle; if (!b) return [];
    const dur = b.songInfo?.duration || 0; if (dur <= 0) return [];
    // Jam: the CHORD LOOP — one cycle of the progression as chord bands (name +
    // roman), tinted by harmonic function. The DAW arrangement track for a jam.
    if (isJamMode()) {
      // Chord-change carriers only (one cpcs-tagged event per change): the
      // dense comp/bass lanes would otherwise paint a sliver band per HIT.
      // A band runs to the next change (carrier ends are hit lengths now).
      const evs = (b.backingEvents || []).filter(e => e.cpcs);
      if (evs.length) return evs.map((e, i) => ({ name: e.name || '', rn: e.rn || '', start: e.t,
        end: (i + 1 < evs.length ? evs[i + 1].t : dur),
        color: FUNCTION_HUE[String(e.fn)] || '#3b82f6', chord: true }));
    }
    const sb = Array.isArray(b.segmentBounds) ? b.segmentBounds : null;
    if (sb && sb.length) {
      return sb.map(s => ({ name: s.name || s.kind || '', start: s.start, end: s.end,
        color: ROLE_COLORS[String(s.role)] || KIND_COLORS[String(s.kind)] || '#64748b' }));
    }
    const secs = Array.isArray(b.sections) ? b.sections : null;
    if (secs && secs.length > 1) {
      return secs.map((s, i) => ({ name: s.name || '', start: s.time || 0,
        end: (i + 1 < secs.length ? secs[i + 1].time : dur), color: '#3b82f6' }));
    }
    return [{ name: b.songInfo?.title || '', start: 0, end: dur, color: '#3b82f6' }];   // single drill
  }
  /** @type {CanvasRenderingContext2D | null} */
  let overviewCtx = null;
  function drawOverviewFrame() {
    const canvas = $('virtuoso_lab-overview-canvas');
    if (!canvas || canvas.offsetParent === null) return;
    if (!overviewCtx || overviewCtx.canvas !== canvas) overviewCtx = canvas.getContext('2d');
    const ctx = overviewCtx; if (!ctx) return;
    const dpr = window.devicePixelRatio || 1, rect = canvas.getBoundingClientRect();
    const pxW = Math.max(1, Math.floor(rect.width * dpr)), pxH = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== pxW || canvas.height !== pxH) { canvas.width = pxW; canvas.height = pxH; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width, H = rect.height; ctx.clearRect(0, 0, W, H);
    const dur = activeBundle?.songInfo?.duration || 0;
    if (!activeBundle || dur <= 0) return;
    const padX = 2, usableW = W - padX * 2;
    /** @param {number} t */
    const xAt = t => padX + (t / dur) * usableW;
    const jam = isJamMode();
    const now = Math.max(0, Math.min(dur, transport.time));
    const bands = overviewBands();
    // Jam: which chord is playing now + which is next (the play-the-changes cue).
    let curIdx = -1;
    if (jam) {
      for (let i = 0; i < bands.length; i++) if (now >= bands[i].start - 1e-3 && now < bands[i].end - 1e-3) { curIdx = i; break; }
      if (curIdx < 0 && bands.length) curIdx = 0;
    }
    const nextIdx = jam && bands.length ? (curIdx + 1) % bands.length : -1;
    // Bands: role tints (finite) or function-tinted chord bands (Jam). In Jam the
    // current chord is full-strength and the NEXT chord raised — see the change coming.
    ctx.textBaseline = 'middle';
    for (let i = 0; i < bands.length; i++) {
      const bnd = bands[i];
      const ax = xAt(bnd.start), w = Math.max(1, xAt(bnd.end) - ax);
      const alpha = jam ? (i === curIdx ? 0.6 : (i === nextIdx ? 0.44 : 0.26)) : 0.32;
      ctx.fillStyle = hexA(bnd.color, alpha); ctx.fillRect(ax, 1, w, H - 2);
      ctx.fillStyle = hexA(bnd.color, i === curIdx ? 1 : 0.9); ctx.fillRect(ax, 1, i === curIdx ? 2 : 1.5, H - 2);
      if (w > 22 && bnd.name) {
        ctx.save(); ctx.beginPath(); ctx.rect(ax + 3, 0, w - 5, H); ctx.clip();
        ctx.fillStyle = 'rgba(226,232,240,0.9)'; ctx.font = (jam ? 'bold ' : '') + '8px ui-sans-serif, sans-serif';
        ctx.fillText(bnd.name, ax + 4, H / 2 + 0.5);
        if (jam && bnd.rn && w > 44) {                                  // roman numeral — the transferable layer
          const nw = ctx.measureText(bnd.name).width;
          ctx.fillStyle = 'rgba(148,163,184,0.85)'; ctx.font = '7px ui-sans-serif, sans-serif';
          ctx.fillText(bnd.rn, ax + 7 + nw, H / 2 + 0.5);
        }
        ctx.restore();
      }
    }
    // Rest bands: the inter-block breaths + the trailing loop-wrap breath aren't in
    // segmentBounds (they're the GAPS between bands), so they'd read as empty void.
    // Paint them a neutral slate with a centered breath glyph so the whole-session
    // map shows the rests as deliberate beats, not dead gaps (Workout-love Tier 2).
    if (!jam) {
      const sb = Array.isArray(activeBundle.segmentBounds) ? activeBundle.segmentBounds : [];
      if (sb.length > 1) {
        /** @type {[number, number, boolean][]} */
        const gaps = [];
        for (let i = 0; i + 1 < sb.length; i++) if (sb[i + 1].start - sb[i].end > 0.05) gaps.push([sb[i].end, sb[i + 1].start, false]);
        const lastEnd = sb[sb.length - 1].end;
        if (dur - lastEnd > 0.05) gaps.push([lastEnd, dur, true]);   // trailing loop-wrap breath
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const [g0, g1, wrap] of gaps) {
          const ax = xAt(g0), w = Math.max(1, xAt(g1) - ax);
          ctx.fillStyle = 'rgba(100,116,139,0.16)'; ctx.fillRect(ax, 1, w, H - 2);
          if (w > 8) { ctx.fillStyle = 'rgba(148,163,184,0.7)'; ctx.font = '8px ui-sans-serif, sans-serif'; ctx.fillText(wrap ? '↻' : '·', ax + w / 2, H / 2 + 0.5); }
        }
        ctx.textAlign = 'left';
      }
    }
    // A–B loop / focus overlay (the authoring view).
    if (transport.markerA != null && transport.markerB != null && Math.abs(transport.markerA - transport.markerB) > 0.02) {
      const ax = xAt(Math.min(transport.markerA, transport.markerB)), bx = xAt(Math.max(transport.markerA, transport.markerB));
      ctx.fillStyle = 'rgba(64,128,224,0.24)'; ctx.fillRect(ax, 0, Math.max(1, bx - ax), H);
      ctx.fillStyle = '#9ec1ff'; ctx.fillRect(ax - 1, 0, 2, H); ctx.fillRect(bx - 1, 0, 2, H);
    }
    // Viewport box: what the scrolling working ruler is showing now. Finite only —
    // an endless jam has no "whole" for it to frame (a mirror, not a finite plan).
    if (!jam) {
      const win = rulerWindow();
      const vx0 = xAt(Math.max(0, now - win.BEHIND)), vx1 = xAt(Math.min(dur, now + win.AHEAD));
      ctx.strokeStyle = 'rgba(226,232,240,0.5)'; ctx.lineWidth = 1;
      ctx.strokeRect(vx0 + 0.5, 0.5, Math.max(2, vx1 - vx0) - 1, H - 1);
    } else {
      // The "this loops forever" tell.
      ctx.fillStyle = 'rgba(148,163,184,0.7)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('↻', W - 2, H / 2 + 0.5); ctx.textAlign = 'left';
    }
    // Playhead — normally at the live position. On a loop wrap, a brief "tape
    // rewind" sweeps it from the seam-out point back to the (live) re-entry point
    // with a fading streak, mirroring the host's animated loop-wrap. Draw-only:
    // the clock already wrapped seamlessly; this is purely the visible tell.
    const px = xAt(now);
    let headX = px;
    if (_wrapAnim) {
      const p = (performance.now() - _wrapAnim.atMs) / WRAP_ANIM_MS;
      if (p >= 1) { _wrapAnim = null; }
      else {
        const ease = 1 - Math.pow(1 - Math.max(0, p), 3);   // ease-out: whip back, settle onto the live head
        const fromX = xAt(_wrapAnim.fromT);
        headX = fromX + (px - fromX) * ease;
        const grad = ctx.createLinearGradient(headX, 0, fromX, 0);   // motion streak trailing toward the seam-out point
        grad.addColorStop(0, 'rgba(244,63,94,0.55)'); grad.addColorStop(1, 'rgba(244,63,94,0)');
        ctx.fillStyle = grad; ctx.fillRect(Math.min(headX, fromX), H / 2 - 1.5, Math.abs(fromX - headX), 3);
      }
    }
    ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(headX, 0); ctx.lineTo(headX, H); ctx.stroke();
  }

  // ── Chord-shape box (small VERTICAL chord chart) ─────────────────────────
  // A standard vertical chord diagram for the currently-sounding chord, drawn
  // as a small overlay in the render's top-left. Vertical (strings vertical,
  // low E on the left, nut on top) is the standard chord-chart convention; the
  // horizontal neck map is the separate fretboard strip. Drawn on ALL views,
  // including 3D Highway — whose own chord diagram + lane frames we suppress by
  // handing it a chord-free bundle (see attachRenderer) — so the chord reference
  // is one consistent box everywhere. Shown only when the chart has chord
  // templates (chord/arpeggio exercises); scales carry none, so it stays hidden
  // for them with no extra gating.
  /** @type {CanvasRenderingContext2D | null} */
  let chordBoxCtx = null;
  function currentChordTemplate() {
    const b = activeBundle;
    if (!b || !b.chords || !b.chords.length || !b.chordTemplates || !b.chordTemplates.length) return null;
    const t = transport.time;
    let chord = b.chords[0];
    for (const ch of b.chords) { if (ch.t <= t + 1e-3) chord = ch; else break; }
    const tmpl = b.chordTemplates[chord.id];
    return (tmpl && Array.isArray(tmpl.frets) && tmpl.frets.length) ? tmpl : null;
  }
  function drawChordBoxFrame() {
    const canvas = $('virtuoso_lab-chordbox'); if (!canvas) return;
    const tmpl = activeBundle ? currentChordTemplate() : null;
    if (!tmpl) { if (canvas.style.display !== 'none') canvas.style.display = 'none'; return; }
    canvas.style.display = 'block';
    if (!chordBoxCtx || chordBoxCtx.canvas !== canvas) chordBoxCtx = canvas.getContext('2d');
    const ctx = chordBoxCtx; if (!ctx) return;
    const dpr = window.devicePixelRatio || 1, rect = canvas.getBoundingClientRect();
    const pxW = Math.max(1, Math.floor(rect.width * dpr)), pxH = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== pxW || canvas.height !== pxH) { canvas.width = pxW; canvas.height = pxH; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width, H = rect.height;
    ctx.clearRect(0, 0, W, H);
    // Panel
    ctx.fillStyle = 'rgba(8,12,22,0.94)'; ctx.strokeStyle = 'rgba(96,165,250,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 8); ctx.fill(); ctx.stroke();
    // Chord name
    ctx.fillStyle = '#e8d080'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(String(tmpl.displayName || tmpl.name || ''), W / 2, 5);

    const frets = tmpl.frets, nS = frets.length;
    const played = frets.filter(f => f > 0);
    const minF = played.length ? Math.min(...played) : 0;
    const maxF = played.length ? Math.max(...played) : 0;
    let baseFret = 1, showNut = true, SPAN = 4;
    if (maxF > 4) { baseFret = minF; showNut = false; SPAN = Math.max(4, maxF - minF + 1); }
    const padTop = 32, padBot = 13, padL = 15, padR = 15;
    const gx0 = padL, gx1 = W - padR, gy0 = padTop, gy1 = H - padBot;
    const colW = (gx1 - gx0) / Math.max(1, nS - 1), rowH = (gy1 - gy0) / SPAN;
    /** @param {number} s */
    const xS = s => gx0 + s * colW;  // s=0 (low E) on the left — standard orientation
    // Strings (vertical) + frets (horizontal)
    ctx.strokeStyle = '#52617a'; ctx.lineWidth = 1;
    for (let s = 0; s < nS; s++) { ctx.beginPath(); ctx.moveTo(xS(s), gy0); ctx.lineTo(xS(s), gy1); ctx.stroke(); }
    for (let r = 0; r <= SPAN; r++) { const y = gy0 + r * rowH; ctx.lineWidth = (showNut && r === 0) ? 3 : 1; ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); ctx.stroke(); }
    // Position label when not at the nut
    if (!showNut) { ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(baseFret + 'fr', gx0 - 3, gy0 + rowH / 2); }
    // Per-string markers: × muted, ○ open (above nut), dot for fretted
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let s = 0; s < nS; s++) {
      const f = frets[s], x = xS(s);
      if (f == null || f < 0) { ctx.fillStyle = '#64748b'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('×', x, gy0 - 8); continue; }
      if (f === 0) { ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, gy0 - 8, 3.4, 0, 6.2832); ctx.stroke(); continue; }
      const row = f - baseFret; if (row < 0 || row >= SPAN) continue;
      const y = gy0 + (row + 0.5) * rowH;
      ctx.fillStyle = STRING_COLORS[s % STRING_COLORS.length] || '#e2e8f0';
      ctx.beginPath(); ctx.arc(x, y, Math.min(7, rowH * 0.38), 0, 6.2832); ctx.fill();
      const finger = tmpl.fingers && tmpl.fingers[s];
      if (finger) { ctx.fillStyle = '#0b1220'; ctx.font = 'bold 9px sans-serif'; ctx.fillText(String(finger), x, y); }
    }
  }

  // Per-block SEAM VERDICT card (Tier 3): during a Workout inter-block breath, show
  // the just-finished block's closure + the next block breadcrumb in the stage
  // lower-third; hide otherwise. Text is written once per seam (keyed) so the frame
  // loop doesn't thrash the DOM; the fade is CSS. Cleared on stop (drawOnce runs
  // there too). The ruler owns the countdown digit — this card owns the NAMES.
  let _seamCapKey = '';
  function updateSeamCaption() {
    const el = $('virtuoso_lab-seam-caption'); if (!el) return;
    const v = (transport.playing && !transport.paused) ? seamVerdictInfo() : null;
    if (!v) { if (_seamCapKey) { el.classList.remove('is-on'); _seamCapKey = ''; } return; }
    const key = `${v.idx}/${v.total}`;
    if (key !== _seamCapKey) {
      const doneEl = el.querySelector('.virtuoso_lab-seam-done');
      const nextEl = el.querySelector('.virtuoso_lab-seam-next');
      // Honest closure (Tier A): if the mic was live this run but the just-ended
      // block got NO input, the player skipped/watched it — don't claim "✓ done"
      // (silence is never narrated). Mic-less runs keep the plain completion line.
      const blockSilent = _ptHadInput && !_blockHadInput[v.idx - 1];
      // A felt block's seam drops the POCKET word instead of the generic "done"
      // (roundtable §4 "Workout seam" surface). Analysis only — credit waits for
      // sessionEnd; verdict null (thin evidence) keeps the plain line, no claim.
      let doneTxt = blockSilent ? '' : `✓ ${v.done.name || 'Block'} — done`;
      if (!blockSilent) {
        try {
          const fi = blockFeltInfo(v.done);
          const SEAM_WORD = { locked: 'Locked the pocket', settling: 'Settled into the pocket', dragging: 'Dragging — behind the beat', rushing: 'Rushing — ahead of the kick' };
          if (fi && fi.felt.verdict) doneTxt = `✓ ${v.done.name || 'Block'} — ${SEAM_WORD[fi.felt.verdict]}`;
        } catch (_) {}
      }
      if (doneEl) doneEl.textContent = doneTxt;
      if (nextEl) nextEl.innerHTML = `Next ▸ ${v.next.name || 'next'} <span class="virtuoso_lab-seam-pos">· block ${v.idx + 1} of ${v.total}</span>`;
      el.classList.add('is-on');
      _seamCapKey = key;
    }
  }
  // Spotlight (J-3): the always-visible "whose turn" cue over the stage — your solo
  // vs comp-behind-the-band. Only touches the DOM on a turn change (thrash guard).
  function updateSpotlightCue() {
    const el = $('virtuoso_lab-jam-cue'); if (!el) return;
    const on = transport.playing && isJamMode() && !!(activeBundle && activeBundle.config && activeBundle.config.jamSpotlight);
    if (!on) { if (!el.hidden) { el.hidden = true; _spotlightCueTurn = null; } return; }
    const turn = jamSpotlightTurn(transport.time);
    if (turn === _spotlightCueTurn) return;
    _spotlightCueTurn = turn;
    el.hidden = false;
    el.classList.toggle('is-you', turn === 'you');
    el.classList.toggle('is-band', turn === 'band');
    el.textContent = turn === 'band' ? '🎸 Band solo — comp the chords' : '🎤 Your turn — take a solo';
  }
  function drawOnce() { drawFretboardFrame(); drawRulerFrame(); drawOverviewFrame(); updateSeamCaption(); drawChordBoxFrame(); updateSpotlightCue(); const renderer = rendererLifecycle.renderer; if (!renderer || !activeBundle) return; const vb = rendererLifecycle.bundle || activeBundle; vb.currentTime = transport.time; syncHighwaySettings(vb); try { renderer.draw(vb); } catch (e) { console.warn('[Virtuoso] renderer draw failed', e); } syncTransportTime(); }
  // Re-fit the borrowed renderer + redraw ACROSS a layout SLIDE (the fretboard strip /
  // left pane now animate over ~0.3s). Doing this once synchronously used the PRE-slide
  // size — the fretboard didn't render until a lane switch + the highway didn't re-fit
  // on hide. Runs immediately (correct for reduced-motion/instant) then each frame for
  // `ms`, so both canvases track the changing stage size and settle correct.
  /** @param {number} ms */
  function refitStageDuring(ms) {
    rendererLifecycle.refitDuring(ms);
  }
  // "Keep looping" — when on, a finite drill restores the old infinite loop (open
  // practice). Default off (finite). Persisted; loaded in bind(). An A–B loop and Jam
  // are unaffected (they loop via the segment-loop branch above, never this one).
  let keepLooping = false;
  // True when the active run is a single-exercise DRILL that should play once and END
  // rather than loop: the bundle is finite-eligible AND the user hasn't opted into
  // "keep looping". Workout sessions and Jam are never finite-eligible.
  function finiteRunActive() {
    return !!(activeBundle && activeBundle.finiteRun && !keepLooping);
  }
  // End a finite drill run: run the existing closure (sessionEnd → the session-summary
  // card) and tear playback down. The clean-gate/verdict now lives in advancePathwayTier
  // (the proof-loop settling-tax guard, flagged + pilot-only); the run ends with the card,
  // which shows the "you proved" competency claim on a real flip. Mirrors stopPlayback()'s teardown
  // (which also wraps sessionEnd), including rewinding the playhead to where Play began,
  // so pressing Play again cleanly replays the run from its start rather than re-ending
  // instantly at duration.
  function endFiniteRun() {
    // A finite run completing is a DELIBERATE end → results modal eligible.
    _deliberateStop = true;
    try { sessionEnd(); } finally { _deliberateStop = false; }   // flush the session → presentSessionSummary (closure)
    transport.stop(true);
    stopRunAudio();
    drawOnce();
    syncPlayButton();
    refreshStatusFromState();
  }
  // Re-anchor the playback clock at `chartTime`, in BOTH clock domains, with
  // the standard scheduling lookahead. Every (re)start/seek/wrap/re-schedule
  // site goes through here so the audio anchor can never fall out of step
  // with the wall anchor. The ctx anchor intentionally tolerates a suspended
  // context: its currentTime freezes exactly as the scheduled audio does, so
  // visuals wait WITH the audio instead of running ahead on the wall clock.
  /** @param {number} chartTime */
  function anchorPlayClock(chartTime) { transport.anchor(chartTime, AUDIO_LOOKAHEAD_SECONDS); }
  /** @param {number} nowMs */
  function tick(nowMs) {
    if (!rendererLifecycle.renderer || !activeBundle) return;
    if (transport.playing) {
      // If the host navigated away from the Virtuoso screen, its container goes
      // display:none (offsetParent becomes null) — stop playback so the audio
      // doesn't keep running in the background. Covers the host top-nav and
      // leaving a tutorial, which bypass Virtuoso's own back buttons. The rAF
      // tick only runs while playing, so this is the natural place to catch it.
      const screenRoot = $('virtuoso_lab-root');
      if (screenRoot && !screenRoot.offsetParent) { stopPlayback(); return; }
      // Paused: keep the RAF alive (the nav-guard above + redraws stay armed)
      // but freeze the clock — no advance, no loop wraps, no finite-run end.
      if (transport.paused) { drawOnce(); rafId = requestAnimationFrame(tick); return; }
      // Single clock domain: while an AudioContext is live, elapsed time comes
      // from the audio clock the notes are scheduled on (drift-free vs what
      // the player hears); the wall clock is the fallback when there's no ctx.
      transport.advance(nowMs);
      if (_jamPending && isJamMode()) syncJamPendingChip();
      if (transport.time > _runMaxChartTime) _runMaxChartTime = transport.time;
      transport.finishPreRoll();
      if (transport.preRollUntil === 0) maybeOfferDownshift();   // beginner mid-run offer (cheap: gated flags first, evaluates once per run)
      const duration = activeBundle.songInfo.duration || 1;
      // A-B segment loop wins over the whole-chart wrap when both endpoints are
      // set (Jam pins [leadIn, duration]; section looping pins a sub-region).
      // The seam is GAPLESS: the rolling-window scheduler pre-schedules the next
      // lap's audio ahead of B (scheduleNextChunk wraps B→A on the same ctx
      // clock — no stopAudio, no ~200 ms re-schedule gap), and the visual clock
      // wraps by phase-carry, exactly like the whole-chart seam below.
      if (transport.loopA != null && transport.loopB != null) {
        maybeScheduleLoopAhead();   // keep the audio horizon refilled past B (wraps B→A)
        if (transport.time >= transport.loopB) {
          // J-2 (D-J3): the wrap is the change-quantum. A queued jam change lands
          // IN-PLACE here — jamHotSwapAtWrap rebuilds the chart from the live
          // panel and swaps the bundle WITHOUT tearing down the renderer (it
          // re-reads the bundle each frame), re-anchoring the clock + loop itself.
          // It returns false when it had to fall back to the full jamPlay()
          // rebuild (which re-arms the rAF), true on an in-place swap (we do).
          if (_jamPending && isJamMode()) {
            if (jamHotSwapAtWrap()) rafId = requestAnimationFrame(tick);
            return;
          }
          triggerWrapRewind(transport.loopB, transport.loopA);   // visible rewind tell on the overview
          _runLooped = true;                               // recap: a wrap means the loop region was fully reached
          // Phase-carry the clock (drift-free), no audio touch — the next lap is
          // already scheduled on the ctx clock by maybeScheduleLoopAhead above.
          const loopLen = transport.loopB - transport.loopA;
          transport.wrap(loopLen);
          const bus = hostBus();
          if (bus && typeof bus.emit === 'function') {
            bus.emit('virtuoso_lab:loop:wrap', { a: transport.loopA, b: transport.loopB, time: transport.time });
          }
          transport.countWrap();
          const lc = $('virtuoso_lab-loop-count');
          if (lc) {
            const showLoopCount = !isJamMode();
            lc.hidden = !showLoopCount;
            if (showLoopCount) lc.textContent = 'Loop ' + transport.wraps;
          }
        }
      } else if (finiteRunActive()) {
        // Finite drill (Depth Ladder slice 1): the right-sized run plays ONCE, then
        // ends with the existing session-summary closure instead of looping. The
        // rolling window still refills (the initial chunk no longer covers the
        // whole drill) but scheduleNextChunk never wraps for a finite run, so
        // audio still stops cleanly at the end. Let the run reach it, then end.
        maybeScheduleLoopAhead();
        if (transport.time >= duration) {
          transport.moveCursor(duration);
          drawOnce();
          endFiniteRun();
          return;   // run over — no further rAF; endFiniteRun cancels playback
        }
      } else {
        // Seamless whole-chart loop. Audio for the next pass is pre-scheduled
        // ahead of the seam (no stopAudio()/gap/clipped tail), and the visual
        // clock wraps by phase-carry — subtract one loop length and keep
        // ticking, so the playhead never freezes or snaps. Carrying the
        // remainder also keeps the loop phase drift-free over long sessions.
        maybeScheduleLoopAhead();
        if (transport.time >= duration) {
          // Wrap to the music start (after the count-in lead-in), not 0, so the
          // count-in plays once and each loop is music. contentLen carries the
          // phase so the loop stays drift-free.
          const contentLen = duration - (activeBundle.leadIn || 0);
          triggerWrapRewind(transport.time, transport.time - contentLen);   // visible rewind tell (the clock keeps phase-carry; this is draw-only)
          _runLooped = true;                              // recap: a whole-chart wrap = every block reached
          transport.wrap(contentLen);
          // NOTE — this branch is now keepLooping-only (a Workout is FINITE, see
          // makeBundle's finiteRun). Credit is one-shot per window, so on a manual
          // loop the re-walked windows stay credited → they paint a STALE "hit" and
          // the counter holds at pass-1's count (the ~250 dogfood bug, when sessions
          // still looped). Acceptable for the opt-in loop toggle; a true per-loop
          // re-judge (reset each window's credit/miss + the counter on wrap) is a
          // flagged follow-up that needs the per-loop-vs-cumulative score decision.
        }
      }
      // Verifier scoring. Contained mode (desktop engine): drain engine-
      // finalized verdicts + push our playhead. Fallback mode (browser): refresh
      // the timing-free verify target. Neither runs during the async arm window
      // (both flags false) so no stray verify target is pushed before the path
      // is chosen.
      if (_ndContainedMode) ndDrainContainedVerdicts();
      else if (_ndContainedFallback) ndPushVerifyTarget();
      // Settle tremolo spans whose end has passed (both ears; cheap — pops at
      // most the front of a short time-sorted list).
      ptFinalizeSpans(transport.time - ptLatency());
      // Advance the window cursor at frame rate, detector-independent: expiry
      // is where the miss EVENT dispatches (the borrowed-highway marks) and
      // the passed denominator grows — neither may stall if the detector's
      // frame stream goes quiet mid-run.
      ptWinSeek(transport.time - ptLatency());
      // Dwell chip: name the exempt class under the playhead (disclosure UX).
      ptUpdateJudgeChip(transport.time);
    }
    drawOnce(); rafId = requestAnimationFrame(tick);
  }

  // Bend-note states → semitones of upward pitch shift. These mirror the visual
  // bend labels (bendLabel): 0.5 = ½ step (1 semitone), 1 = full/whole step
  // (2 semitones), 1.5 = 1½ steps (3), 2 = two whole steps (4). The synth ramps
  // the played pitch up by this many semitones so a bend sounds bent, reaching
  // the same target pitch the player sees notated above the note.
  /** @type {Record<string, number>} */
  const BEND_SEMITONES = { 0: 0, 0.5: 1, 1: 2, 1.5: 3, 2: 4 };
  /** @param {number | undefined} bn */
  function bendSemitones(bn) {
    const v = Number(bn) || 0;
    return BEND_SEMITONES[v] != null ? BEND_SEMITONES[v] : v * 2;
  }
  // Standard tab/notation bend label for a bend value (shared by all renderers).
  // ── Host output-device follow ──────────────────────────────────────────────
  // The desktop host's JUCE Audio Engine routes the MAIN GAME's audio to the
  // user-selected output device, but plugin Web Audio plays to the OS DEFAULT
  // sink — so a player monitoring a non-default interface hears the base game
  // while Virtuoso is silent (real user report, Arch Linux + Focusrite,
  // 2026-06-07; Christian's ruling: "should follow main game"). Follow the
  // host's choice (inherit-never-write): read the device NAME the Audio Engine
  // panel exposes (live `slopsmithDesktop.audio.getCurrentDevice()` when the
  // engine is running, else its `localStorage['slopsmith-audio-device']`
  // snapshot mirror), match it against Chromium's audiooutput labels (our
  // scorer's mic grant is what exposes output labels), and steer the one shared
  // audioCtx there via AudioContext.setSinkId. Web hosts / engine stopped /
  // no match ⇒ default sink — exactly today's behavior. Matching is heuristic
  // by necessity: JUCE (ALSA/WASAPI) and Chromium (PulseAudio/PipeWire) name
  // the same hardware differently, but vendor/product tokens ("scarlett",
  // "2i2") usually survive both. When we CAN'T follow a configured device we
  // say so (status-line suffix + one console.warn) — the silent failure was
  // the actual bug. Never blocks or breaks playback.
  let _sinkResolved = Object.create(null); // device name → matched deviceId (successes only)
  const _sinkWarned = Object.create(null); // device name → true (one warn per name)
  /** @type {string | null} */
  let _sinkAppliedId = null;               // sinkId currently applied to audioCtx
  let _sinkMismatch = '';                  // non-empty: host is on a device we couldn't follow
  // Informative-token filter: generic audio/driver words that appear in device
  // names on one side but not the other. "default"/"pulse"-style JUCE entries
  // normalize to zero tokens → treated as the default sink (correct: same device).
  const SINK_STOPWORDS = new Set(['audio', 'usb', 'alsa', 'wasapi', 'asio', 'jack', 'pulse', 'pulseaudio',
    'pipewire', 'analog', 'analogue', 'stereo', 'mono', 'speakers', 'speaker', 'headphones', 'headphone',
    'output', 'out', 'device', 'default', 'sound', 'card', 'interface', 'hw', 'plughw', 'front', 'direct',
    'hardware', 'conversions', 'digital', 'hdmi', 'displayport', 'mapper', 'driver', 'high', 'definition']);
  /** @param {string | null} s */
  function sinkTokens(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ')
      .filter((t) => t && !SINK_STOPWORDS.has(t));
  }
  // Pure matcher (unit-testable via __virtuoso_lab_debug): JUCE device name → one of the
  // browser's audiooutput devices, or null. Exact → substring → token-overlap
  // (≥0.5 of the JUCE name's informative tokens, unique winner). Any ambiguity
  // (sibling outputs like "Line 1/2" vs "Line 3/4") bails to default.
  /** @param {string} name @param {{label: string, deviceId: string}[]} outs */
  function pickSinkMatch(name, outs) {
    /** @param {string} s */
    const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const nNorm = norm(name);
    if (!nNorm) return null;
    const labeled = (outs || []).map((d) => ({ d, norm: norm(d.label) })).filter((x) => x.norm);
    let hits = labeled.filter((x) => x.norm === nNorm);
    if (!hits.length) hits = labeled.filter((x) => x.norm.includes(nNorm) || nNorm.includes(x.norm));
    if (!hits.length) {
      const nTok = sinkTokens(name);
      if (!nTok.length) return null;
      const scored = labeled
        .map((x) => { const lTok = new Set(sinkTokens(x.d.label)); return { x, ov: nTok.filter((t) => lTok.has(t)).length / nTok.length }; })
        .filter((s) => s.ov >= 0.5)
        .sort((a, b) => b.ov - a.ov);
      if (scored.length === 1 || (scored.length > 1 && scored[0].ov > scored[1].ov)) hits = [scored[0].x];
    }
    if (hits.length !== 1) return null;
    return { deviceId: hits[0].d.deviceId, label: hits[0].d.label };
  }
  /** @type {string[]} */
  let _sinkLastOuts = [];                  // last-enumerated audiooutput labels (diagnostics — one paste shows both name spaces)
  /** @param {string} name */
  async function resolveSinkId(name) {
    if (_sinkResolved[name]) return _sinkResolved[name];
    let devices;
    try { devices = await navigator.mediaDevices.enumerateDevices(); } catch (_) { return null; }
    const outs = devices.filter((d) => d.kind === 'audiooutput');
    _sinkLastOuts = outs.map((d) => d.label || '(unlabeled)');
    const hit = pickSinkMatch(name, outs);
    // Success-only cache: pre-mic-grant the labels are empty (no match) and the
    // grant arrives with the first scored run — a cached failure would poison
    // the Play-time retry.
    if (hit) { _sinkResolved[name] = hit.deviceId; return hit.deviceId; }
    return null;
  }
  async function applyHostSink() {
    try {
      const ctx = audioCtx;
      if (!ctx || typeof ctx.setSinkId !== 'function') return; // webkit/no-support: silently skip
      // Only follow while the host engine is actually RUNNING — when it's
      // stopped the main game itself plays HTML5 → OS default, and following
      // the saved device would make us diverge from it.
      const bridge = hostDesktop()?.audio;
      // Diagnostic (2026-06-07, the Arch+Focusrite "it did not" follow-up): a
      // desktop host WITHOUT the audio bridge API previously fell through
      // identically to a web host — silent, nothing for the user to paste.
      if (hostDesktop() && (!bridge || typeof bridge.isAudioRunning !== 'function') && !_sinkWarned['no-bridge']) {
        _sinkWarned['no-bridge'] = true;
        console.warn('[Virtuoso] feedback-desktop detected but its audio bridge API is unavailable (downlevel host?) — cannot read the engine output device; playing to the system default output.');
      }
      let name = null;
      if (bridge && typeof bridge.isAudioRunning === 'function') {
        let running = false;
        try { running = !!(await bridge.isAudioRunning()); } catch (_) {}
        if (running) {
          if (typeof bridge.getCurrentDevice === 'function') {
            try { const cur = await bridge.getCurrentDevice(); if (cur && typeof cur.output === 'string' && cur.output.trim()) name = cur.output.trim(); } catch (_) {}
          }
          if (!name) { // panel snapshot mirror — same shape, saved-state fallback
            try { const snap = JSON.parse(localStorage.getItem('slopsmith-audio-device') || 'null'); if (snap && typeof snap.output === 'string' && snap.output.trim()) name = snap.output.trim(); } catch (_) {}
          }
        }
      }
      if (!name || !sinkTokens(name).length) { // no engine / web host / "default"-class device
        // Zero-token name ("PipeWire"/"default"/"JACK"-class): we genuinely can't
        // tell whether the engine is on the OS default or somewhere we can't
        // name-match. Console-only (a UI ⚠ would false-alarm every legit
        // default-device setup) — but say it ONCE so the user has a line to paste.
        if (name && !_sinkWarned['generic:' + name]) {
          _sinkWarned['generic:' + name] = true;
          console.info(`[Virtuoso] output-follow: the host engine device "${name}" has no matchable tokens — following the system default output. If Virtuoso lands on the wrong device, route it per-app in the system mixer (e.g. pavucontrol on PipeWire).`);
        }
        _sinkMismatch = '';
        if (_sinkAppliedId) { _sinkAppliedId = null; await ctx.setSinkId(''); }
        return;
      }
      const id = await resolveSinkId(name);
      if (!id) {
        if (_sinkAppliedId) { _sinkAppliedId = null; try { await ctx.setSinkId(''); } catch (_) {} }
        _sinkMismatch = `audio on system default — host engine is on “${name}”`;
        if (!_sinkWarned[name]) {
          _sinkWarned[name] = true;
          console.warn(`[Virtuoso] The host audio engine outputs to "${name}" but no matching browser output device was found; Virtuoso is playing to the system default output. Browser outputs seen: ${JSON.stringify(_sinkLastOuts)}. Workaround: route Virtuoso per-app in the system mixer (e.g. pavucontrol on PipeWire).`);
        }
        refreshStatusFromState();
        return;
      }
      if (id === _sinkAppliedId) { _sinkMismatch = ''; return; }
      // setSinkId on a running ctx preserves currentTime + scheduled sources
      // (brief device-swap gap, no time-base reset) — but outputLatency can
      // jump with the sink, and the timing-window anchor bundles it. Nudge the
      // anchor by the measured delta when it's material (>20ms); smaller
      // shifts the per-run auto-cal absorbs.
      const before = Number(ctx.outputLatency) || 0;
      try {
        await ctx.setSinkId(id);
      } catch (e) {
        // Matched the device but the switch was REFUSED — on feedback-desktop
        // this is the unhandled 'speaker-selection' permission (the standing
        // HOST-ASK). Surface it honestly: previously this died in the outer
        // catch with no UI state, indistinguishable from "worked".
        _sinkMismatch = `audio on system default — output switch to “${name}” was blocked`;
        if (!_sinkWarned['blocked:' + name]) {
          _sinkWarned['blocked:' + name] = true;
          console.warn(`[Virtuoso] Matched the host engine device "${name}" to a browser output, but setSinkId was refused (${(e && (/** @type {Error} */ (e)).name) || e}). On feedback-desktop this means the 'speaker-selection' permission isn't handled by the host. Playing to the system default output.`);
        }
        refreshStatusFromState();
        return;
      }
      _sinkAppliedId = id; _sinkMismatch = '';
      const deltaMs = Math.round(((Number(ctx.outputLatency) || 0) - before) * 1000);
      if (Math.abs(deltaMs) > 20) {
        const nextMs = Math.max(0, Math.min(250, Math.round(_ptLatencyS * 1000) + deltaMs));
        _ptLatencyS = nextMs / 1000;   // transient output-device-latency follow; NOT persisted (the self-measured anchor is retired)
      }
      refreshStatusFromState();
    } catch (e) {
      console.warn('[Virtuoso] output-device follow failed (playing to default):', e);
    }
  }
  // Hot-plug: device labels/ids change → drop the resolution cache and re-apply
  // immediately (an unplugged sink must fall back to default, not go silent).
  try {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === 'function') {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        _sinkResolved = Object.create(null);
        if (audioCtx) applyHostSink();
      });
    }
  } catch (_) {}
  // The one creation seam for the shared playback AudioContext (replaces the
  // former four inline `new AudioContext()` sites). Creation stays SYNCHRONOUS
  // — callers rely on it inside the click gesture — with the sink steer kicked
  // off fire-and-forget; onPlayToggle additionally awaits it (bounded) so the
  // first scheduled notes land on the right device.
  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      applyHostSink();
    }
    return audioCtx;
  }

  // ── Audio output bus (master + per-track) ─────────────────────────────────
  // Every voice routes through a per-track GainNode → a shared master → a safety
  // limiter → destination, instead of connecting straight to the output. This is
  // the structural prerequisite for (a) a master limiter that makes sudden loud
  // peaks / full-density clipping impossible (safe, normalized output), and (b) per-track
  // insert points where the realism upgrade plugs in later — amp/cab modeling on
  // the distorted track, a sampler on the acoustic track, FX sends owned by
  // sound-design. Built once per AudioContext; the bus nodes persist across note
  // stop/start (they are deliberately NOT pushed into audioNodes).
  /** @type {import('./src/types/audio-graph.js').AudioBus | null} */
  let audioBus = null;
  const MASTER_TRIM = 0.85;                          // headroom into the limiter (the Mixer's MASTER fader multiplies it)
  /** @param {AudioContext} ctx @returns {import('./src/types/audio-graph.js').AudioBus} */
  function ensureAudioBus(ctx) {
    if (audioBus && audioBus.ctx === ctx) return audioBus;
    const master = ctx.createGain();
    master.gain.value = MASTER_TRIM * mixerMasterLevel;
    const limiter = ctx.createDynamicsCompressor();  // transparent safety limiter
    limiter.threshold.value = -6; limiter.knee.value = 12; limiter.ratio.value = 6;
    limiter.attack.value = 0.003; limiter.release.value = 0.12;
    master.connect(limiter); limiter.connect(ctx.destination);
    // Master meter tap (post-limiter — what actually reaches the output).
    const masterAnalyser = ctx.createAnalyser(); masterAnalyser.fftSize = 256;
    limiter.connect(masterAnalyser);
    // Backing group: harmony + pad + bass + drums route through this one gain node
    // so the band can fade out into an inter-block break and fade back in on the next
    // block's downbeat (scheduleBackingEnvelope rides it) WITHOUT touching the Mixer's
    // per-bus faders (upstream) or the click / notes buses (which bypass it).
    const backingGroup = ctx.createGain(); backingGroup.gain.value = 1;
    backingGroup.connect(master);
    audioBus = { ctx, master, limiter, backingGroup, masterAnalyser, tracks: {}, panners: {}, analysers: {} };
    return audioBus;
  }
  // Lazily-created per-track sub-bus ('notes' | 'harmony' | 'click'). Future
  // per-track processing (amp/cab, sampler, sends) inserts between the track gain
  // and master without touching the voice code below.
  // The one shared short reverb (zero-asset noise-decay IR), built lazily so the
  // FIRST backing bus to need it (drums OR harmony/bass, any creation order) wins.
  /** @param {AudioContext} ctx @param {import('./src/types/audio-graph.js').AudioBus} bus */
  function ensureSharedReverb(ctx, bus) {
    if (!bus.reverb) {
      const conv = ctx.createConvolver();
      const len = Math.floor(ctx.sampleRate * 0.9), ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4); }
      conv.buffer = ir;
      const wet = ctx.createGain(); wet.gain.value = 0.12;
      conv.connect(wet); wet.connect(bus.backingGroup);
      bus.reverb = conv;
    }
    return bus.reverb;
  }
  // ── Lush synth FX (2026-06-15) — the pedal-steel "cry" tail + the 80s synth wash ─────
  // A 2nd, LONGER plate than the 0.9 s glue room above (2.4 s, plumper IR) plus a stereo
  // chorus — both SHARED (one instance each), fed by per-CALL sends, so ONLY the steel/
  // synth branches feed them (the band's other voices stay dry of this long room). Mirrors
  // ensureSharedReverb: the FX nodes live on the bus (persistent, NOT in audioNodes); only
  // the per-call send gains prune with the scheduler window.
  /** @param {AudioContext} ctx @param {import('./src/types/audio-graph.js').AudioBus} bus */
  function ensureSynthPlate(ctx, bus) {
    if (!bus.synthPlate) {
      const pre = ctx.createDelay(0.1); pre.delayTime.value = 0.025;   // pre-delay: the dry attack reads before the bloom
      const conv = ctx.createConvolver();
      const len = Math.floor(ctx.sampleRate * 2.4), ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6); }
      conv.buffer = ir;
      const wet = ctx.createGain(); wet.gain.value = 0.85;
      pre.connect(conv); conv.connect(wet); wet.connect(bus.backingGroup);
      bus.synthPlate = pre;          // per-call sends connect to the pre-delay input
    }
    return bus.synthPlate;
  }
  /** @param {AudioContext} ctx @param {import('./src/types/audio-graph.js').AudioBus} bus */
  function ensureSynthChorus(ctx, bus) {
    if (!bus.synthChorus) {
      const inG = ctx.createGain(), wet = ctx.createGain(); wet.gain.value = 0.5;
      const canPan = typeof ctx.createStereoPanner === 'function';
      /** @param {number} baseMs @param {number} rateHz @param {number} panv */
      const voice = (baseMs, rateHz, panv) => {
        const dl = ctx.createDelay(0.05); dl.delayTime.value = baseMs / 1000;
        const lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.type = 'sine'; lfo.frequency.value = rateHz; lg.gain.value = 0.003;   // ±3 ms sweep
        lfo.connect(lg); lg.connect(dl.delayTime); lfo.start();
        inG.connect(dl);
        if (canPan) { const p = ctx.createStereoPanner(); p.pan.value = panv; dl.connect(p); p.connect(wet); }
        else dl.connect(wet);
      };
      voice(18, 0.40, -0.6); voice(23, 0.55, 0.6);
      wet.connect(bus.backingGroup);
      bus.synthChorus = inG;
    }
    return bus.synthChorus;
  }
  // Per-call sends from a synth voice's master into the shared chorus + plate (0 = skip).
  /** @param {AudioContext} ctx @param {AudioNode} master @param {number} chorusAmt @param {number} plateAmt */
  function synthFx(ctx, master, chorusAmt, plateAmt) {
    const bus = ensureAudioBus(ctx);
    if (chorusAmt > 0) { const s = ctx.createGain(); s.gain.value = chorusAmt; master.connect(s); s.connect(ensureSynthChorus(ctx, bus)); audioNodes.push(s); }
    if (plateAmt > 0)  { const s = ctx.createGain(); s.gain.value = plateAmt;  master.connect(s); s.connect(ensureSynthPlate(ctx, bus));  audioNodes.push(s); }
  }

  // ── Amp inserts (Clean / Overdrive / Metal) — Guide + Rhythm strips ─────────
  // The in-house amp chain (band-intel Track C; 2026-06-05 audio-engine verdict:
  // nam_tone is an EXTERNAL host plugin whose .nam models are user-uploaded and
  // never shipped, so the WaveShaper + cab chain is OUR first-class amp — the
  // "NAM profile" deliverable is these three designed presets, zero assets).
  // Chain (pre-FADER insert, console semantics — the fader stays a loudness
  // control, never a drive knob):
  //   voices → entry → preHP (tighten) → [pre-mid push] → drive → WaveShaper
  //          → post EQ stack → cab (ConvolverNode, PROCEDURAL IR — the same
  //            zero-asset precedent as ensureSharedReverb; swap for a cleared
  //            CC0 4×12 capture via the /ir route when the hunt lands)
  //          → makeup → fader g → (existing carve/pan/out path)
  // Makeup gains are loudness-matched by design (clipping raises RMS, so higher
  // drive = lower makeup) and the master limiter still backstops — by-ear trim
  // welcome (the SS_AMP levels are the knobs).
  /** @type {Record<string, import('./src/types/audio-graph.js').AmpPreset>} */
  const AMP_PRESETS = {
    // Clean: warm + sparkle, barely driven — what a DI line into a clean combo
    // does. The default Auto pick for the sampled DI guitar voice.
    clean: { label: 'Clean', preHp: 40, drive: 1.6, curve: 'soft',
             post: [['lowshelf', 120, 0, 1.5], ['peaking', 500, 0.8, -1], ['peaking', 3200, 0.9, 2]],
             makeup: 0.85, ir: 'cab_clean' },
    // Overdrive: the screamer-into-crunch-amp recipe — pre-clip mid push +
    // soft asymmetric clip, presence on top.
    drive: { label: 'Overdrive', preHp: 75, preMid: [800, 0.8, 4], drive: 6, curve: 'soft',
             post: [['lowshelf', 100, 0, -1], ['peaking', 850, 0.9, 2], ['peaking', 3000, 0.9, 2]],
             makeup: 0.42, comp: [-16, 3, 0.008, 0.12], ir: 'cab_drive' },
    // Metal: tight high-gain — hard pre-HP so chugs don't flub, hard clip,
    // post mid scoop + thump + presence. comp = the distorted lane's own soft
    // compressor (threshold/ratio/attack/release — band-intel C3 spec), so
    // stacked power-chord comp hits stay dense without leaning on the master
    // limiter.
    metal: { label: 'Metal', preHp: 110, drive: 16, curve: 'hard',
             post: [['lowshelf', 95, 0, 2], ['peaking', 580, 1.1, -5], ['peaking', 3500, 0.9, 3]],
             // makeup raised 0.24→0.38 (2026-06-13 dogfood: the rhythm comp read
             // "low volume"); the master limiter still guards peaks. By-ear tunable.
              makeup: 0.38, comp: [-16, 3, 0.008, 0.12] },
    // Bass overdrive (genre-band panel 2026-06-13, bass-pedagogy): a SEPARATE preset
    // for the BASS bus — do NOT reuse drive/metal (their 75–110 Hz preHp guts the
    // bass fundamental). Low HP keeps the sub, a gentle upper-mid grind adds the
    // pick clank, NO mid-scoop, NO cab (noCab — see buildAmpChain). makeup keeps a
    // driven bass from jumping over the band. metal/punk's "driving bass" voice.
    bass_drive: { label: 'Bass OD', preHp: 30, preMid: [1200, 0.7, 3], drive: 4, curve: 'hard',
             post: [['lowshelf', 90, 0, 1], ['peaking', 1000, 0.8, 3]],
             makeup: 0.6, noCab: true },
  };
  const AMP_OPTIONS = [['', 'Amp: Auto'], ['off', 'No amp'], ['clean', 'Clean'], ['drive', 'Overdrive'], ['metal', 'Metal']];
  /** @param {string} kind @param {number} drive */
  function ampCurve(kind, drive) {
    const n = 2048, c = new Float32Array(n);
    const norm = Math.tanh(drive);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      // 'soft' = symmetric tanh; 'hard' adds a small DC pre-bias (asymmetric clip
      // = even harmonics) and a touch of hard limiting on top for the metal edge.
      if (kind === 'hard') {
        const y = Math.tanh(drive * (x + 0.03)) - Math.tanh(drive * 0.03);
        c[i] = Math.max(-0.98, Math.min(0.98, y / norm * 1.12));
      } else {
        c[i] = Math.tanh(drive * x) / norm;
      }
    }
    return c;
  }
  // Procedural mono cab IR (~50 ms): direct spike + decaying noise body, voiced
  // by crude in-place one-pole passes (LP ≈ speaker top-end rolloff, HP ≈ cone
  // low cut) + one short reflection for cone/edge character. ConvolverNode's
  // default normalize:true handles loudness. Cached per AudioContext.
  // ── Per-preset cab IR loading (2026-06-13) ──────────────────────────────────
  // An amp preset may name a real cab IR file (p.ir → static/irs/<name>.wav,
  // served by the /ir route). Lazy-loaded + decoded once per ctx; the PROCEDURAL
  // cabIrBuffer is the immediate fallback (the chain never waits) AND the permanent
  // fallback when the file is absent — the LOCAL-ONLY case: the clean/overdrive
  // cab IRs are gitignored (commercial captures), so the PUBLIC build falls back
  // to procedural while a local dogfood build plays the real cab. Metal uses the
  // procedural cab directly: its former third-party capture lacked verified permission.
  // wireTrackAmp builds a chain once + caches it (not per-pass), so when an IR
  // decodes after the chain was built, swap the buffer on the waiting convolver.
  const IR_BASE = '/api/plugins/virtuoso_lab/ir/';
  let /** @type {Record<string, {state: string, buf: AudioBuffer | null}>} */ _irBufs = {}, /** @type {AudioContext | null} */ _irBufCtx = null;       // name -> { state, buf }  (reset per ctx)
  /** @type {Record<string, ConvolverNode[]>} */
  const _irPending = {};                    // name -> [convolver nodes awaiting the buffer]
  // ── Rig: user cab IRs + per-amp output trim (the Mixer's "Rig" view, 2026-06-13)
  // A power user LOADs their own cab IR per amp (Clean/Overdrive/Metal) and trims
  // its output. The IR BYTES live in IndexedDB (binary, too big for localStorage);
  // the metadata (name + output) in localStorage. A user IR is keyed 'user:<ampId>'
  // in the SAME _irBufs cache, just resolved from IndexedDB instead of the /ir
  // route — the never-wait _irPending swap, the procedural fallback, the per-ctx
  // reset are all identical. A user upload is THEIR licensing problem (never
  // committed); a bad file decode-fails → the procedural cab stays (never silent).
  const RIG_AMPS = ['clean', 'drive', 'metal'];
  let rigState = (() => { try { return JSON.parse(localStorage.getItem('virtuoso_lab.rig') ?? 'null') || {}; } catch (_) { return {}; } })();
  function rigSave() { try { localStorage.setItem('virtuoso_lab.rig', JSON.stringify(rigState)); } catch (_) {} }
  /** @type {Promise<IDBDatabase> | null} */
  let _rigDbP = null;
  function rigDb() {
    if (_rigDbP) return _rigDbP;
    _rigDbP = new Promise((res, rej) => {
      let r; try { r = indexedDB.open('virtuoso_lab-rig', 1); } catch (e) { rej(e); return; }
      r.onupgradeneeded = () => { try { r.result.createObjectStore('irs'); } catch (_) {} };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return _rigDbP;
  }
  /** @param {string} id @param {ArrayBuffer} ab @returns {Promise<void>} */
  function rigIdbPut(id, ab) { return rigDb().then(db => new Promise((res, rej) => { const tx = db.transaction('irs', 'readwrite'); tx.objectStore('irs').put(ab, id); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); })); }
  /** @param {string} id @returns {Promise<ArrayBuffer | null>} */
  function rigIdbGet(id) { return rigDb().then(db => new Promise((res, rej) => { const tx = db.transaction('irs', 'readonly'); const rq = tx.objectStore('irs').get(id); rq.onsuccess = () => res(rq.result || null); rq.onerror = () => rej(rq.error); })); }
  /** @param {string} id @returns {Promise<void>} */
  function rigIdbDel(id) { return rigDb().then(db => new Promise((res) => { const tx = db.transaction('irs', 'readwrite'); tx.objectStore('irs').delete(id); tx.oncomplete = () => res(); tx.onerror = () => res(); })); }
  /** @param {AudioContext} ctx @param {string} name */
  function ensureCabIr(ctx, name) {
    if (_irBufCtx !== ctx) { _irBufs = {}; _irBufCtx = ctx; }
    const e = _irBufs[name];
    if (e) return e.state === 'ready' ? e.buf : null;
    _irBufs[name] = { state: 'loading', buf: null };
    /** @param {AudioBuffer} buf */
    const ok = buf => {
      _irBufs[name] = { state: 'ready', buf };
      const list = _irPending[name] || []; _irPending[name] = [];
      for (const cab of list) { try { cab.buffer = buf; } catch (_) {} }
    };
    const bad = () => { _irBufs[name] = { state: 'failed', buf: null }; };   // absent/bad → procedural stays
    if (name.indexOf('user:') === 0) {
      rigIdbGet(name.slice(5)).then(ab => ab ? ctx.decodeAudioData(ab.slice(0)) : Promise.reject(0)).then(ok).catch(bad);
    } else {
      fetch(IR_BASE + name + '.wav').then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(ab => ctx.decodeAudioData(ab)).then(ok).catch(bad);
    }
    return null;
  }
  let /** @type {AudioBuffer | null} */ _cabIr = null, /** @type {AudioContext | null} */ _cabIrCtx = null;
  /** @param {AudioContext} ctx */
  function cabIrBuffer(ctx) {
    if (_cabIr && _cabIrCtx === ctx) return _cabIr;
    const sr = ctx.sampleRate, len = Math.floor(sr * 0.05);
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.008));
    d[0] = 1;
    const refl = Math.max(1, Math.round(sr * 0.0007));
    for (let i = len - 1; i >= refl; i--) d[i] += 0.35 * d[i - refl];
    // LP ~4.3 kHz ×2 (12 dB/oct speaker rolloff), then HP ~90 Hz.
    const aLp = Math.exp(-2 * Math.PI * 4300 / sr);
    for (let pass = 0; pass < 2; pass++) { let y = 0; for (let i = 0; i < len; i++) { y = (1 - aLp) * d[i] + aLp * y; d[i] = y; } }
    const aHp = Math.exp(-2 * Math.PI * 90 / sr);
    { let y = 0, px = 0; for (let i = 0; i < len; i++) { const x = d[i]; y = aHp * (y + x - px); px = x; d[i] = y; } }
    _cabIr = buf; _cabIrCtx = ctx;
    return buf;
  }
  /** @param {AudioContext} ctx @param {import('./src/types/audio-graph.js').AmpPreset} p @param {string} ampId */
  function buildAmpChain(ctx, p, ampId) {
    const ov = (ampId && rigState[ampId]) || {};   // user cab IR + output override (Rig view)
    /** @type {AudioNode[]} */
    const nodes = [];
    /** @template {AudioNode} Node @param {Node} n @returns {Node} */
    const mk = (n) => { nodes.push(n); return n; };
    const preHp = mk(ctx.createBiquadFilter()); preHp.type = 'highpass'; preHp.frequency.value = p.preHp; preHp.Q.value = 0.7;
    /** @type {AudioNode} */
    let head = preHp;
    if (p.preMid) {
      const pm = mk(ctx.createBiquadFilter()); pm.type = 'peaking';
      pm.frequency.value = p.preMid[0]; pm.Q.value = p.preMid[1]; pm.gain.value = p.preMid[2];
      head.connect(pm); head = pm;
    }
    const shaper = mk(ctx.createWaveShaper()); shaper.curve = ampCurve(p.curve, p.drive); shaper.oversample = '4x';
    head.connect(shaper); head = shaper;
    for (const [type, f, q, g] of p.post) {
      const eq = mk(ctx.createBiquadFilter()); eq.type = type; eq.frequency.value = f;
      if (q) eq.Q.value = q; eq.gain.value = g;
      head.connect(eq); head = eq;
    }
    // makeup = the amp output; a user output trim (Rig view) overrides the preset default.
    const makeup = mk(ctx.createGain()); makeup.gain.value = (ov.output != null ? ov.output : p.makeup);
    if (p.noCab) {
      // Bass OD: NO guitar cab — the procedural/guitar IRs roll off ~90 Hz + 4.3 kHz,
      // which would gut the bass fundamental (bass-pedagogy). The shaper + post-EQ
      // shape the grind; the bass bus's own lowpass carve tames any fizz.
      head.connect(makeup);
    } else {
      const cab = mk(ctx.createConvolver());
      // A user cab (Rig view) overrides the preset's; else the preset's IR; else procedural.
      const irName = ov.irName ? ('user:' + ampId) : p.ir;
      const irBuf = irName ? ensureCabIr(ctx, irName) : null;
      cab.buffer = irBuf || cabIrBuffer(ctx);        // the real cab IR, or the procedural fallback while it loads / when absent
      if (irName && !irBuf) (_irPending[irName] = _irPending[irName] || []).push(cab);
      head.connect(cab); cab.connect(makeup);
    }
    /** @type {AudioNode} */
    let out = makeup;
    if (p.comp) {
      const c = mk(ctx.createDynamicsCompressor());
      c.threshold.value = p.comp[0]; c.ratio.value = p.comp[1];
      c.attack.value = p.comp[2]; c.release.value = p.comp[3]; c.knee.value = 6;
      makeup.connect(c); out = c;
    }
    return { input: preHp, output: out, nodes, makeup };   // makeup exposed for the Rig's live output trim
  }
  // Per-strip amp resolution: an explicit pick wins; 'off' = bypass; Auto ('')
  // gives the sampled DI guitar voice the Clean amp (a raw DI line is sterile)
  // and leaves every other voice (EP/organ/WAF guitars/synths) un-amped.
  // _ampWant is set by the scheduler each pass (it knows the resolved voices);
  // wireTrackAmp is idempotent on the wanted id, so re-calls are free.
  /** @type {Record<string, string | null | undefined>} */
  const _ampWant = { notes: null, harmony: null, bass: null };
  /** @param {string} name @param {string | false | null | undefined} voiceBank @param {import('./src/core/generation-types.js').AudioProfile | null} prof */
  function resolveAmpId(name, voiceBank, prof) {
    const sel = (mixerState[name] && mixerState[name].amp) || '';
    if (sel === 'off') return null;
    if (AMP_PRESETS[sel]) return sel;
    // Auto: a profile-declared amp wins (distorted family's comp declares 'metal');
    // else ONLY a raw electric-DI bank (SAMPLE_BANKS[bank].amped: shiny) takes
    // Clean — acoustic/keys banks (emily/salamander/wurli) get no forced guitar-cab insert.
    const slot = prof && (name === 'harmony' ? prof.harmony : name === 'bass' ? prof.bass : prof.notes);
    if (slot && AMP_PRESETS[String(slot.amp)]) return slot.amp;
    return (voiceBank && SAMPLE_BANKS[voiceBank] && SAMPLE_BANKS[voiceBank].amped) ? 'clean' : null;
  }
  /** @param {AudioContext} ctx @param {string} name */
  function wireTrackAmp(ctx, name) {
    const bus = audioBus;
    if (!bus || !bus.voiceIn || !bus.voiceIn[name]) return;
    const want = _ampWant[name] || '';
    const cur = (/** @type {NonNullable<import('./src/types/audio-graph.js').AudioBus['amps']>} */ (bus.amps))[name];
    if (cur && cur.id === want) return;
    const entry = bus.voiceIn[name], fader = bus.tracks[name];
    try { entry.disconnect(); } catch (_) {}
    if (cur) for (const n of cur.nodes) { try { n.disconnect(); } catch (_) {} }
    if (!want || !AMP_PRESETS[want]) { entry.connect(fader); (/** @type {NonNullable<import('./src/types/audio-graph.js').AudioBus['amps']>} */ (bus.amps))[name] = { id: '', nodes: [] }; return; }
    const chain = buildAmpChain(ctx, AMP_PRESETS[want], want);
    entry.connect(chain.input); chain.output.connect(fader);
    (/** @type {NonNullable<import('./src/types/audio-graph.js').AudioBus['amps']>} */ (bus.amps))[name] = { id: want, nodes: chain.nodes, makeup: chain.makeup };
  }
  // ── Rig actions (the Mixer "Rig" view) ──────────────────────────────────────
  // Force a rebuild of every live amp chain using ampId (a cab IR change/reset is
  // a user action, infrequent — rebuilding beats hand-swapping the convolver). The
  // sentinel id defeats wireTrackAmp's idempotence so it re-reads the (new) cab.
  /** @param {string} ampId */
  function rigRewireAmp(ampId) {
    const bus = audioBus, ctx = audioCtx; if (!bus || !bus.amps || !ctx) return;
    for (const name in bus.amps) { const a = bus.amps[name]; if (a && a.id === ampId) { a.id = '__rig_force__'; wireTrackAmp(ctx, name); } }
  }
  // Live output trim — set the makeup gain on every live chain using ampId (ramped,
  // no rebuild; the slider is dragged). The master limiter still backstops loud.
  /** @param {string} ampId */
  function rigApplyOutput(ampId) {
    const bus = audioBus, ctx = audioCtx; if (!bus || !bus.amps) return;
    const ov = rigState[ampId] || {}, v = (ov.output != null ? ov.output : (AMP_PRESETS[ampId] ? AMP_PRESETS[ampId].makeup : 1));
    for (const name in bus.amps) { const a = bus.amps[name]; if (a && a.id === ampId && a.makeup) { try { a.makeup.gain.setTargetAtTime(v, ctx ? ctx.currentTime : 0, 0.02); } catch (_) { try { a.makeup.gain.value = v; } catch (__) {} } }
  } }
  // Load a user cab IR onto an amp: validate by decoding, store the bytes in
  // IndexedDB + the name in localStorage, invalidate the decode cache, rewire.
  /** @param {string} ampId @param {File | null} file */
  function rigLoadIr(ampId, file) {
    if (!file) return Promise.resolve(false);
    return file.arrayBuffer().then(ab => {
      const ctx = audioCtx || (window.AudioContext ? new AudioContext() : null);
      const decodeCheck = ctx ? ctx.decodeAudioData(ab.slice(0)) : Promise.resolve();
      return decodeCheck.then(() => rigIdbPut(ampId, ab)).then(() => {
        rigState[ampId] = Object.assign({}, rigState[ampId], { irName: file.name }); rigSave();
        delete _irBufs['user:' + ampId];               // drop any stale decode
        rigRewireAmp(ampId); renderRig();
        return true;
      });
    }).catch(() => { renderRig('bad'); return false; });   // decode failed → keep the current cab, flag it
  }
  /** @param {string} ampId */
  function rigResetIr(ampId) {
    return rigIdbDel(ampId).then(() => {
      if (rigState[ampId]) { delete rigState[ampId].irName; if (!Object.keys(rigState[ampId]).length) delete rigState[ampId]; rigSave(); }
      delete _irBufs['user:' + ampId];
      rigRewireAmp(ampId); renderRig();
    });
  }
  /** @param {string} ampId @param {number} v */
  function rigSetOutput(ampId, v) {
    rigState[ampId] = Object.assign({}, rigState[ampId], { output: v }); rigSave();
    rigApplyOutput(ampId);
  }
  /** @param {string} ampId */
  function rigResetOutput(ampId) {
    if (rigState[ampId]) { delete rigState[ampId].output; if (!Object.keys(rigState[ampId]).length) delete rigState[ampId]; rigSave(); }
    rigApplyOutput(ampId); renderRig();
  }
  // ── MIX_RECIPES — the per-genre MIX delta layer (genre-band panel 2026-06-13,
  // sound-design) ──────────────────────────────────────────────────────────────
  // The DATA twin of AUDIO_PROFILES (timbre) + ARRANGEMENT_RECIPES (rhythm): per
  // style, DELTAS over the house mix so the LOUD layers (drums, bass) carry the
  // genre signature, not just the buried comp. The `drumkit` EQ/comp differentiates
  // kits that SHARE one FluidR3 sample set (kit_rock/soft/jazz differ only by level)
  // — metal reads tight/scooped, country warm/soft, on the SAME samples. masterTrim
  // pre-corrects for arrangement DENSITY so a dense metal wall and a sparse jazz trio
  // land at a consistent, non-clipping perceived loudness (the limiter does equal GR).
  // Applied with ramps at play time (applyMixRecipe, idempotent per chunk); the master
  // limiter always backstops. An un-recipe'd style → MIX_BASE (today's flat house mix).
  // Fields: level{bus→gain mult over the fader} · pan{bus→abs} · carve{harmonyHP/padHP/
  // bassLP Hz} · send{bus→reverb} · drumkit{loShelf{f,dB},hiShelf{dB},compRatio,compThr} ·
  // masterTrim. Full matrix + the other genres are the P1 roll-out; P0 ships the 3 exemplars.
  /** @type {import('./src/types/audio-graph.js').MixRecipe} */
  const MIX_BASE = { level: {}, pan: {}, carve: {}, send: {}, drumkit: null, masterTrim: 1 };
  /** @type {Record<string, import('./src/types/audio-graph.js').MixRecipe>} */
  const MIX_RECIPES = {
    blues:   { level: { bass: 1.08, drums: 0.92, pad: 0.88 }, pan: { harmony: 0.18, pad: -0.14 },
               carve: { harmonyHP: 145, bassLP: 2100 }, send: { harmony: 0.24, pad: 0.22, bass: 0.06, drums: 0.16 },
               drumkit: { loShelf: { f: 105, dB: 1.5 }, hiShelf: { dB: -3 }, compRatio: 2.4, compThr: -16 }, masterTrim: 0.96 },
    country: { level: { bass: 1.12, drums: 0.9, pad: 0.9 }, pan: { harmony: 0.25, pad: -0.22 },
               carve: { harmonyHP: 150 }, send: { harmony: 0.24, pad: 0.26, drums: 0.16 },
               drumkit: { loShelf: { f: 120, dB: 2 }, hiShelf: { dB: -4 }, compRatio: 2.5, compThr: -16 }, masterTrim: 1 },
    metal:   { level: { drums: 1.06, pad: 0 }, pan: { harmony: 0.3, pad: -0.3 },
               carve: { harmonyHP: 200, bassLP: 1900 }, send: { harmony: 0.08, pad: 0.1, bass: 0.05, drums: 0.06 },
               drumkit: { loShelf: { f: 80, dB: 1 }, hiShelf: { dB: 2 }, compRatio: 4, compThr: -18 }, masterTrim: 0.8 },
    jazz:    { level: { drums: 0.8, bass: 1.12, pad: 0.95 }, pan: { harmony: 0.2, pad: -0.18, drums: 0.1 },
               carve: { harmonyHP: 150 }, send: { harmony: 0.26, pad: 0.28, drums: 0.2 },
               drumkit: { loShelf: { f: 110, dB: 0 }, hiShelf: { dB: -2 }, compRatio: 2, compThr: -14 }, masterTrim: 1 },
    funk:    { level: { bass: 1.12, drums: 1.02, pad: 0.82 }, pan: { harmony: 0.16, pad: -0.2, drums: 0.08 },
               carve: { harmonyHP: 220, padHP: 260, bassLP: 1700 }, send: { harmony: 0.1, pad: 0.08, bass: 0.04, drums: 0.07 },
               drumkit: { loShelf: { f: 95, dB: 1 }, hiShelf: { dB: 1.5 }, compRatio: 3.2, compThr: -18 }, masterTrim: 0.92 },
    reggae:  { level: { bass: 1.2, drums: 0.82, pad: 0.84 }, pan: { harmony: 0.22, pad: -0.2 },
               carve: { harmonyHP: 240, padHP: 220, bassLP: 1500 }, send: { harmony: 0.18, pad: 0.16, bass: 0.05, drums: 0.12 },
               drumkit: { loShelf: { f: 90, dB: 1.2 }, hiShelf: { dB: -5 }, compRatio: 2.2, compThr: -15 }, masterTrim: 0.95 },
    disco:   { level: { bass: 1.12, drums: 1.04, pad: 0.96 }, pan: { harmony: 0.22, pad: -0.24, drums: 0.1 },
               carve: { harmonyHP: 190, padHP: 210, bassLP: 2200 }, send: { harmony: 0.14, pad: 0.16, bass: 0.05, drums: 0.08 },
               drumkit: { loShelf: { f: 85, dB: 0.8 }, hiShelf: { dB: 3 }, compRatio: 3.4, compThr: -18 }, masterTrim: 0.9 },
    pop:     { level: { bass: 1.02, drums: 0.98, pad: 1.0 }, pan: { harmony: 0.18, pad: -0.18, drums: 0.06 },
               carve: { harmonyHP: 170, padHP: 190, bassLP: 2100 }, send: { harmony: 0.18, pad: 0.2, bass: 0.04, drums: 0.1 },
               drumkit: { loShelf: { f: 95, dB: 0.5 }, hiShelf: { dB: 1 }, compRatio: 2.8, compThr: -17 }, masterTrim: 0.96 },
    soul:    { level: { bass: 1.1, drums: 0.94, pad: 0.94 }, pan: { harmony: 0.16, pad: -0.14, drums: 0.06 },
               carve: { harmonyHP: 180, padHP: 210, bassLP: 1850 }, send: { harmony: 0.22, pad: 0.24, bass: 0.05, drums: 0.14 },
               drumkit: { loShelf: { f: 105, dB: 1 }, hiShelf: { dB: -2 }, compRatio: 2.6, compThr: -16 }, masterTrim: 0.96 },
    synthwave: { level: { bass: 1.08, drums: 0.96, pad: 1.06 }, pan: { harmony: 0.28, pad: -0.3, drums: 0.12 },
                 carve: { harmonyHP: 210, padHP: 240, bassLP: 2400 }, send: { harmony: 0.12, pad: 0.18, bass: 0.05, drums: 0.07 },
                 drumkit: { loShelf: { f: 80, dB: 0.5 }, hiShelf: { dB: 4 }, compRatio: 3.2, compThr: -18 }, masterTrim: 0.88 },
  };
  /** @param {import('./src/types/entry-data.js').EntryConfig | null} cfg */
  function resolveMix(cfg) {
    const style = cfgAudioProfile(cfg || {});
    return (style && MIX_RECIPES[style]) || MIX_BASE;
  }
  // Apply a style's mix deltas to the live bus graph (ramped — no jump on a genre
  // switch). Proactively touches each backing bus so its FX nodes exist, then sets
  // per-bus level (over the user fader) / pan / carve / send + the drum kit voicing +
  // the backing-group loudness trim. Restores the house drum voicing for un-recipe'd
  // styles so a prior genre's tilt never lingers.
  /** @param {AudioContext | null} ctx @param {import('./src/types/entry-data.js').EntryConfig} cfg */
  function applyMixRecipe(ctx, cfg) {
    const bus = audioBus; if (!bus || !ctx) return;
    const mix = resolveMix(cfg), now = ctx.currentTime, R = 0.25;
    /** @param {AudioParam | undefined} param @param {number} v */
    const ramp = (param, v) => { if (!param) return; try { param.setTargetAtTime(v, now, R); } catch (_) { try { param.value = v; } catch (__) {} } };
    for (const name of ['harmony', 'pad', 'bass', 'drums']) trackBus(ctx, name);   // ensure buses + FX exist
    // masterTrim folds into the per-bus faders (NOT backingGroup — the break-envelope
    // automation owns that node; two writers would fight). Scaling all four backing
    // faders by masterTrim is the same overall loudness pre-trim, conflict-free.
    const mt = mix.masterTrim != null ? mix.masterTrim : 1;
    for (const name of ['harmony', 'pad', 'bass', 'drums']) {
      const fader = bus.tracks[name];
      if (fader) ramp(fader.gain, mixerGainFor(name) * (mix.level[name] != null ? mix.level[name] : 1) * mt);
      const pan = bus.panners[name];
      if (pan && mix.pan[name] != null) ramp(pan.pan, mix.pan[name]);
      const fx = bus.fx && bus.fx[name];
      if (fx && name !== 'drums') {
        if (mix.send[name] != null) ramp(fx.send.gain, mix.send[name]);
        const cv = name === 'bass' ? mix.carve.bassLP : (name === 'harmony' ? mix.carve.harmonyHP : mix.carve.padHP);
        if (cv != null) ramp((/** @type {import('./src/types/audio-graph.js').MelodicBusEffects} */ (fx)).carve.frequency, cv);
      }
    }
    const dfx = bus.fx && bus.fx.drums, dk = mix.drumkit;
    if (dfx) {
      if (mix.send.drums != null) ramp(dfx.send.gain, mix.send.drums);
      if (dk) {
        if (dk.loShelf) { ramp(dfx.loShelf.frequency, dk.loShelf.f); ramp(dfx.loShelf.gain, dk.loShelf.dB); }
        if (dk.hiShelf && dk.hiShelf.dB != null) ramp(dfx.hiShelf.gain, dk.hiShelf.dB);
        if (dk.compRatio != null) ramp(dfx.comp.ratio, dk.compRatio);
        if (dk.compThr != null) ramp(dfx.comp.threshold, dk.compThr);
      } else {   // un-recipe'd: restore the house drum voicing
        ramp(dfx.loShelf.gain, 0); ramp(dfx.hiShelf.gain, -3); ramp(dfx.comp.ratio, 3); ramp(dfx.comp.threshold, -18);
      }
    }
  }
  /** @param {AudioContext} ctx @param {string} name */
  function trackBus(ctx, name) {
    const bus = ensureAudioBus(ctx);
    if (!bus.tracks[name]) {
      const g = ctx.createGain(); g.gain.value = mixerGainFor(name);
      // Backing voices feed the backing group (the break envelope rides it); click / notes
      // bypass it straight to master. Class-ified (track-architecture stage 3): ANY bus that
      // isn't the dry time-reference (notes/click) is a backing voice — so a new per-track
      // comp bus (e.g. a 2nd bluegrass-guitar lane) joins the backing group, not the master.
      const groupOut = (name === 'notes' || name === 'click') ? bus.master : bus.backingGroup;
      // Every strip owns its bus's StereoPanner (the console pan pot); the
      // creation value is the channel DEFAULT (the sound-design stage offsets
      // that used to be hard-coded here) unless the user has moved the pot.
      const canPan = typeof ctx.createStereoPanner === 'function';
      const mkPan = () => { const p = ctx.createStereoPanner(); p.pan.value = mixerPanFor(name); bus.panners[name] = p; return p; };
      // Post-fader meter tap (a passive AnalyserNode — drawn only while the
      // Mixer is open, zero scheduling cost otherwise).
      /** @param {AudioNode} node */
      const mkTap = (node) => { const an = ctx.createAnalyser(); an.fftSize = 256; node.connect(an); bus.analysers[name] = an; };
      if (name === 'drums') {
        // Drum sub-bus (Phase D): a dedicated compressor BEFORE the master limiter
        // — the punch lever is THIS comp's makeup, NEVER a looser master limiter —
        // plus a gentle >8 kHz shelf so hats stay out of the player's pick-attack
        // air-band. The per-hit 3–6 ms attack ramp lives in scheduleDrumHit.
        // A genre-settable low-shelf at the head of the kit chain (MIX_RECIPES'
        // drumkit.loShelf — warm body for country, tight thump for metal).
        const loShelf = ctx.createBiquadFilter();
        loShelf.type = 'lowshelf'; loShelf.frequency.value = 110; loShelf.gain.value = 0;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -18; comp.knee.value = 6; comp.ratio.value = 3;
        comp.attack.value = 0.005; comp.release.value = 0.12;
        const shelf = ctx.createBiquadFilter();
        shelf.type = 'highshelf'; shelf.frequency.value = 8000; shelf.gain.value = -3;
        // The default pan sets the kit slightly off-centre so the dry/centered
        // player pops forward; a touch of the shared room glues the kit to the band.
        g.connect(loShelf); loShelf.connect(comp); comp.connect(shelf);
        /** @type {AudioNode} */
        let drumOut = shelf;
        if (canPan) { const pan = mkPan(); shelf.connect(pan); drumOut = pan; }
        drumOut.connect(groupOut); mkTap(drumOut);
        const send = ctx.createGain(); send.gain.value = 0.07;
        shelf.connect(send); send.connect(ensureSharedReverb(ctx, bus));
        bus.fx = bus.fx || {}; bus.fx.drums = { loShelf, hiShelf: shelf, comp, send };   // MIX_RECIPES handles
      } else if (name !== 'notes' && name !== 'click') {
        // MELODIC/BASS class (track-architecture stage 3): harmony/pad/bass AND any new
        // per-track comp bus. Bass gets a lowpass carve; every other melodic bus a highpass.
        // Mix 7b (step 3.5; sound-design): register-carve + pan + one shared
        // short reverb send — persistent per-bus nodes only, zero assets.
        // The carve keeps the comp/keys out of the bass's lane and ALL of them
        // out of the player's note band; the default pans open the mono stack
        // into a stage (comp slightly R, keys slightly L, bass near-centre).
        const carve = ctx.createBiquadFilter();
        if (name === 'bass') { carve.type = 'lowpass'; carve.frequency.value = 2200; carve.Q.value = 0.5; }
        else { carve.type = 'highpass'; carve.frequency.value = 180; carve.Q.value = 0.5; }
        /** @type {AudioNode} */
        let chainOut = carve;
        if (canPan) { const pan = mkPan(); carve.connect(pan); chainOut = pan; }
        g.connect(carve); chainOut.connect(groupOut); mkTap(chainOut);
        // Shared reverb send (post-carve, pre-pan so the room stays centered).
        const send = ctx.createGain(); send.gain.value = name === 'bass' ? 0.07 : 0.18;
        carve.connect(send); send.connect(ensureSharedReverb(ctx, bus));
        bus.fx = bus.fx || {}; bus.fx[name] = { carve, send };   // MIX_RECIPES per-genre carve/space deltas
      } else {
        // click / notes stay DRY (the time reference); pan defaults centered but
        // the pot works — panning the player apart from the band is a real
        // practice aid (hear yourself on one side, the backing on the other).
        /** @type {AudioNode} */
        let out = g;
        if (canPan) { const pan = mkPan(); g.connect(pan); out = pan; }
        out.connect(groupOut); mkTap(out);
      }
      bus.tracks[name] = g;
      // Amp-insert seam (Guide + Rhythm only): voices connect to a unity ENTRY
      // node routed through the selected amp preset INTO the fader g — a
      // pre-fader console insert, so the fader stays a loudness control and
      // never becomes a drive knob. applyMixer's contract (bus.tracks[name] is
      // the fader) is untouched; trackBus returns the entry as the voice input.
      if (name === 'notes' || name === 'harmony' || name === 'bass') {
        bus.voiceIn = bus.voiceIn || {}; bus.amps = bus.amps || {};
        const entry = ctx.createGain(); entry.gain.value = 1;
        bus.voiceIn[name] = entry;
        wireTrackAmp(ctx, name);
      }
    }
    return (bus.voiceIn && bus.voiceIn[name]) || bus.tracks[name];
  }

  // ── Shell mixer (M) — console strips: fader/pan/mute/solo per bus + MASTER ──
  // Controls the per-track audio buses (notes/harmony/pad/bass/drums/click) plus
  // the master bus. Default state is unity (level 1, channel-default pan, no
  // mute/solo, no dim) → identical to pre-mixer behaviour. `pan` is the channel's
  // DEFAULT pan — the sound-design stage offsets that used to be hard-coded in
  // trackBus (comp slightly R, keys slightly L, kit just off-centre); the strip's
  // pan pot writes mixerState[..].pan over it (double-click resets to default).
  // 'pad' (the Keys strip) is the sustain layer split out of the comp lane:
  // cell-driven comping (COMP_GROOVES hits) plays on 'harmony' (Rhythm), the
  // legacy coalesced sustained pad plays on 'pad' (Keys) — articulation-routed.
  /** @type {import('./src/types/audio-graph.js').MixerChannel[]} */
  const MIXER_CHANNELS = [
    // 'notes' is labeled Guide, NOT "Player": it's the tool's rendition of the
    // exercise line (the guide voice), not the player's own input — that's the
    // INPUT strip (live level + interface/tone shortcuts; we never process it).
    // `group` (track-architecture stage 3b): PERSONAL (you) vs BAND (the backing).
    // The deck splits PERSONAL│BAND│SUM and BAND strips are labeled by the resolved
    // INSTRUMENT, not the role word — kills the vague "Rhythm/Keys" (spec ratified).
    { key:'notes',   label:'Guide',   backing:false, instr:'melodic', amp:true, pan:0,    group:'personal' },
    { key:'harmony', label:'Rhythm',  backing:true,  instr:'melodic', amp:true, pan:0.18, group:'band' },
    { key:'pad',     label:'Keys',    backing:true,  instr:'melodic', pan:-0.18,          group:'band' },
    { key:'bass',    label:'Bass',    backing:true,  instr:'bass',    pan:-0.06,          group:'band' },
    { key:'drums',   label:'Drums',   backing:true,  kit:true,        pan:-0.1,           group:'band' },
    { key:'click',   label:'Click',   backing:false,                  pan:0,              group:'personal' },
  ];
  // Per-channel instrument options (Phase C — backing-voice selection lives here now,
  // moved out of the form). Values are TONE_GM keys; '' = Auto (use the style profile).
  const MIXER_INSTRUMENTS = {
    melodic: [['','Auto'],['epiano','E-piano'],['organ','Organ'],['piano','Piano'],['salamander','Grand Piano'],['wurli','Wurlitzer'],['cp80','Electric grand'],['clean','Clean gtr'],['shiny','Electric DI'],['guitar','Acoustic'],['emily','Steel acoustic'],['banjo','Banjo'],['nylon','Nylon'],['clav','Clav'],['strings','Strings'],['brass','Brass'],['synthlead','Synth lead'],['pad','Synth pad']],
    bass:    [['','Auto'],['bass','Electric'],['upright','Upright']],
  };
  // Per-channel kit options for the Drums channel (Phase D). Values are KIT_REGISTRY
  // ids; '' = Auto (use the style profile's kit). Sampled kits join in D4.
  const MIXER_KITS = [['','Auto'],['kit_rock','Acoustic rock'],['kit_acoustic_soft','Acoustic soft'],['kit_jazz','Jazz kit'],['kit_909','Synth 909'],['kit_808','Synth 808']];
  /** @type {Record<string, import('./src/types/audio-graph.js').MixerChannelState>} */
  const mixerState = {};
  let mixerBackingDim = false;
  let mixerMasterLevel = 1;   // multiplier over MASTER_TRIM (the headroom trim stays the engine's)
  MIXER_CHANNELS.forEach(c => { mixerState[c.key] = { level:1, pan:c.pan || 0, mute:false, solo:false, instrument:null, kit:null, amp:null }; });
  // ── Dynamic band channels (track-architecture stage 3b) ─────────────────────
  // The mixer IS the band: beyond the fixed frame, a genre can declare EXTRA band
  // lanes (the bluegrass guitar on bus 'comp2'). They're derived from the active
  // band's recipeTracks each render; mixerState + the audio bus are created lazily.
  // allChannels / channelFor make the solo/gain/pan/meter machinery see them too.
  /** @type {import('./src/types/audio-graph.js').MixerChannel[]} */
  let _dynChannels = [];   // [{key,label,instr:'melodic',group:'band',pan,dynamic,role,trackLabel}]
  /** @type {Record<string, string> | null} */
  /** @type {Record<string, string | null> | null} */
  let _mixerRevealSig = null;   // last VISIBLE band signature {key:headline} — the band-reveal baseline
  const allChannels = () => MIXER_CHANNELS.concat(_dynChannels);
  /** @param {string} key */
  const channelFor = (key) => MIXER_CHANNELS.find(c => c.key === key) || _dynChannels.find(c => c.key === key);
  /** @param {string} key @param {number} [pan] */
  function ensureChannelState(key, pan) {
    if (!mixerState[key]) mixerState[key] = { level:1, pan: pan || 0, mute:false, solo:false, instrument:null, kit:null, amp:null };
  }
  // instrument token → its dropdown display label (so a strip headline matches the
  // dropdown option when picked); falls back to a Title-cased token.
  const _INSTR_LABEL = (() => { const /** @type {Record<string, string>} */ m = {}; for (const [v, l] of [...MIXER_INSTRUMENTS.melodic, ...MIXER_INSTRUMENTS.bass]) if (v) m[v] = l; for (const [v, l] of MIXER_KITS) if (v) m[v] = l; return m; })();
  /** @param {string | null | undefined} tok */
  const instLabel = (tok) => tok ? (_INSTR_LABEL[tok] || (tok[0].toUpperCase() + tok.slice(1))) : null;
  // A band strip's INSTRUMENT headline (the ratified label policy): a user pin wins;
  // else a dynamic lane's declared label; else the style profile's resolved voice for
  // the role; else the role name. "Banjo"/"Guitar"/"Upright", never "Rhythm/Keys".
  /** @param {import('./src/types/audio-graph.js').MixerChannel} ch @param {import('./src/core/generation-types.js').AudioProfile | null} prof */
  function stripInstrumentLabel(ch, prof) {
    const st = mixerState[ch.key];
    if (st && st.instrument) return instLabel(st.instrument);
    if (ch.trackLabel) return ch.trackLabel;
    try { const v = styleVoiceFor(ch.role || ch.key, prof); if (v) return instLabel(v); } catch (_) {}
    return ch.label;
  }
  // Resolve the CURRENT band into an ordered channel list, split PERSONAL | BAND. The
  // frame (Guide/Click) is always present; the BAND lanes come from recipeTracks — so a
  // drumless bluegrass shows no Drums strip, and its guitar 'comp2' lane gets a strip.
  function deriveMixerChannels() {
    const cfg = (activeBundle && activeBundle.config) || readConfig();
    let prof = null; try { prof = resolveAudioProfile(cfg); } catch (_) {}
    /** @type {ReturnType<typeof recipeTracks>} */
    let tracks = []; try { tracks = recipeTracks(cfg); } catch (_) {}
    /** @overload @param {'notes' | 'click' | 'harmony' | 'pad' | 'bass' | 'drums'} key @returns {import('./src/types/audio-graph.js').MixerChannel} */
    /** @overload @param {string} key @returns {import('./src/types/audio-graph.js').MixerChannel | undefined} */
    /** @param {string} key */
    const fixed = (key) => MIXER_CHANNELS.find(c => c.key === key);
    const liveBus = new Set();
    _dynChannels = [];
    for (const t of tracks) {
      const bus = t.bus || 'harmony';
      if (fixed(bus)) { liveBus.add(bus); continue; }            // a fixed-role lane (harmony/bass/drums/pad)
      if (!_dynChannels.find(c => c.key === bus)) {              // an EXTRA band lane → synthesize a channel
        const lbl = t.label || (t.voice ? instLabel(t.voice) : null) || 'Track';
        _dynChannels.push({ key: bus, label: lbl, instr: 'melodic', group: 'band', pan: 0.1, dynamic: true, role: t.role || 'comp', trackLabel: lbl });
        ensureChannelState(bus, 0.1);
      }
    }
    // BAND order: primary comp · extra comps · keys · bass · drums (console reading order)
    const band = [];
    if (liveBus.has('harmony')) band.push(fixed('harmony'));
    for (const d of _dynChannels) band.push(d);
    if (liveBus.has('pad')) band.push(fixed('pad'));
    if (liveBus.has('bass')) band.push(fixed('bass'));
    if (liveBus.has('drums')) band.push(fixed('drums'));
    const personal = [fixed('notes'), fixed('click')];
    return { personal, band, prof };
  }
  // Console fader taper (cube law): slider position p∈[0,1] → gain 0..2, so the
  // throw reads in dB like a DAW fader (−∞ at the bottom, unity ≈ 0.79, +6 dB
  // at the top). Stored mixerState levels stay LINEAR gain (back-compat with
  // saved states; the engine consumes gain, only the slider speaks positions).
  /** @param {number} p */
  const faderGainFromPos = p => 2 * p * p * p;
  /** @param {number} g */
  const faderPosFromGain = g => Math.cbrt(Math.max(0, Math.min(2, g)) / 2);
  /** @param {number} g */
  const faderDb = g => g <= 0.001 ? '−∞' : ((g >= 1.0005 ? '+' : '') + (20 * Math.log10(g)).toFixed(1));
  // The GM preset a channel's instrument override resolves to, or null = use the profile.
  /** @param {string} key */
  function mixerInstrumentFor(key) {
    const tone = mixerState[key] && mixerState[key].instrument;
    return tone ? (TONE_GM[tone] ?? null) : null;
  }
  // The kit id a channel's kit override is pinned to, or null = use the profile.
  /** @param {string} key */
  function mixerKitFor(key) {
    const k = mixerState[key] && mixerState[key].kit;
    return (k && KIT_REGISTRY[k]) ? k : null;
  }
  // Preload the WAF presets behind the mixer's instrument dropdowns so a LIVE swap is
  // warm (instant + audible), not a cold ~2s load that lands on the thin oscillator
  // fallback (the "switch is too quiet / didn't trigger" report). Bounded (~12 GM
  // presets, decoded once + cached); 'shiny'/synth options have no WAF preset to load.
  function prewarmMixerCandidates() {
    if (typeof ensureWafPreset !== 'function') return;
    for (const opt of [...MIXER_INSTRUMENTS.melodic, ...MIXER_INSTRUMENTS.bass]) {
      const gm = TONE_GM[opt[0]];
      if (gm != null) ensureWafPreset(gm);
    }
  }
  // Is a channel's pinned WAF instrument decoded? The DI sample bank (shiny),
  // synth voices, and Auto have their own readiness/fallback — only a cold WAF sample swap
  // would land on the thin oscillator, so gate ONLY that case (never tear down a good voice).
  /** @param {string} k */
  function liveInstrumentReady(k) {
    const tone = mixerState[k] && mixerState[k].instrument;
    if (!tone || SAMPLE_BANK_PINS[tone]) return true;
    const gm = TONE_GM[tone];
    if (gm == null) return true;                       // synth voice (pad/synthlead) — always ready
    return !!getReadyWafPreset(gm);
  }
  // Re-schedule the backing on a freshly-picked voice under a short gain DIP on the
  // backing group, instead of a hard stopAudio() cut mid-sample (the "abrupt" click).
  // The player's own notes + click bypass backingGroup, so the time reference never
  // ducks. (The true equal-power crossfade folds into the Stage-3 in-place hot-swap;
  // this dip is the contained Stage-1 de-click.)
  function liveSwapReschedule() {
    const ctx = audioCtx, g = audioBus && audioBus.backingGroup && audioBus.backingGroup.gain;
    const doSwap = () => { anchorPlayClock(transport.time); stopAudio(); scheduleCurrentPassAndAnchor(AUDIO_LOOKAHEAD_SECONDS); };
    if (!ctx || !g) { doSwap(); return; }
    const DIP = 0.05;
    try { g.cancelScheduledValues(ctx.currentTime); g.setValueAtTime(Math.max(0.0001, g.value || 1), ctx.currentTime); g.exponentialRampToValueAtTime(0.0001, ctx.currentTime + DIP); } catch (_) {}
    setTimeout(() => {
      doSwap();
      try { const t = ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(0.0001, t); g.exponentialRampToValueAtTime(1, t + DIP); } catch (_) {}
    }, Math.round(DIP * 1000) + 15);
  }
  // The shared LIVE voice/kit swap apply — called by BOTH the Mixer change handler and
  // the "Your band" strip's per-row voice menu, so a swap from either place is identical:
  // token-guarded against the async race, ready-gated, and ducked (not hard-cut). Assumes
  // mixerState[k] is already set + saved by the caller.
  /** @param {string} k @param {boolean} isKit */
  async function commitLiveVoiceSwap(k, isKit) {
    if (!activeBundle) return;
    const tok = ++_jamApplyToken;
    await awaitVoices(activeBundle);
    if (tok !== _jamApplyToken) return;          // superseded by a newer swap (the race guard)
    if (!transport.playing || transport.paused) return;              // paused/stopped: state is set; resume schedules on it
    if (!isKit && !liveInstrumentReady(k)) return;
    liveSwapReschedule();
  }
  function mixerLoad() {
    try {
      const s = JSON.parse(localStorage.getItem('virtuoso_lab.mixer') || 'null');
      if (s && s.ch) { Object.keys(s.ch).forEach(k => {
        ensureChannelState(k);
        Object.assign(mixerState[k], s.ch[k]);
        // Preserve a saved DI choice without requesting the removed recordings.
        if (mixerState[k].instrument === '8ridge') mixerState[k].instrument = 'shiny';
      }); mixerBackingDim = !!s.dim; }
      if (s && Number.isFinite(s.master)) mixerMasterLevel = Math.max(0, Math.min(2, s.master));
    } catch (_) {}
  }
  function mixerSave() { try { localStorage.setItem('virtuoso_lab.mixer', JSON.stringify({ ch: mixerState, dim: mixerBackingDim, master: mixerMasterLevel })); } catch (_) {} }
  // Effective gain for a bus given the mixer state (1.0 = no change). Solo on any
  // channel mutes the un-soloed; Backing dim ducks the backing buses.
  /** @param {string} name */
  function mixerGainFor(name) {
    const st = mixerState[name]; if (!st) return 1;
    const anySolo = allChannels().some(c => mixerState[c.key] && mixerState[c.key].solo);
    let v = st.level;
    if (anySolo) v = st.solo ? v : 0; else if (st.mute) v = 0;
    const ch = channelFor(name);
    if (mixerBackingDim && ch && ch.backing) v *= 0.35;
    return v;
  }
  // The strip's pan-pot value for a bus — the channel default (the sound-design
  // stage offset) until the user moves the pot.
  /** @param {string} name */
  function mixerPanFor(name) {
    const st = mixerState[name];
    const ch = channelFor(name);
    const v = st && Number.isFinite(st.pan) ? st.pan : (ch && ch.pan) || 0;
    return Math.max(-1, Math.min(1, v));
  }
  // Push the mixer state onto any live buses with a short ramp (no clicks — clean,
  // safe audio).
  // ── Style → mixer resync (full reset to style defaults on a genre switch) ────
  // Christian's call: switching genre changes the mixer over to that style's band —
  // instrument per role + amp/cab + drum kit — wiping manual VOICING tweaks (levels/pan
  // stay the user's mix). Fires ONCE per actual style change (not every regenerate), and
  // not on the first build, so a saved mixer state survives app load.
  /** @type {string | null} */
  let _mixerStyleApplied = null;
  // A role's default voice: a sample bank if the profile names one, else 'shiny' (the sg
  // flag), else the WAF tone — all valid mixer-instrument dropdown values.
  /** @param {string} role @param {import('./src/core/generation-types.js').AudioProfile | null} prof */
  function styleVoiceFor(role, prof) {
    const r = prof && (/** @type {Record<string, import('./src/core/generation-types.js').AudioVoice | null>} */ (/** @type {unknown} */ (prof)))[role];
    if (!r) return null;
    return r.bank || (r.sg ? 'shiny' : (r.tone || null));
  }
  /** @param {import('./src/types/entry-data.js').EntryConfig | null} cfg */
  function applyStyleMixerDefaults(cfg) {
    let prof; try { prof = resolveAudioProfile(cfg || {}); } catch (_) { return; }
    /** @param {string} role @param {string | null} inst */
    const setInst = (role, inst) => { if (mixerState[role]) mixerState[role].instrument = inst; };
    /** @param {string} role @param {string | null} amp */
    const setAmp  = (role, amp)  => { if (mixerState[role]) mixerState[role].amp = amp; };
    setInst('notes',   styleVoiceFor('notes', prof));   setAmp('notes',   (prof.notes && prof.notes.amp) || null);
    setInst('harmony', styleVoiceFor('harmony', prof)); setAmp('harmony', (prof.harmony && prof.harmony.amp) || null);
    setInst('pad',     prof.pad ? styleVoiceFor('pad', prof) : null);
    setInst('bass',    (prof.bass && prof.bass.tone) || null); setAmp('bass', (prof.bass && prof.bass.amp) || null);
    if (mixerState.drums) mixerState.drums.kit = (prof.drums && prof.drums.kit) || null;
    try { applyMixer(); } catch (_) {}
    try { renderMixer(); } catch (_) {}
    try { mixerSave(); } catch (_) {}
  }
  // Resync only when the style actually CHANGED (a same-style regenerate keeps the user's
  // tweaks; the first build just adopts the style so a saved mixer survives load).
  /** @param {import('./src/types/entry-data.js').EntryConfig | null} cfg */
  function maybeResyncMixer(cfg) {
    const s = cfgAudioProfile(cfg || {}) || '';
    if (_mixerStyleApplied === null) { _mixerStyleApplied = s; return; }
    if (s !== _mixerStyleApplied) { _mixerStyleApplied = s; applyStyleMixerDefaults(cfg); }
  }
  function applyMixer() {
    if (!audioBus) return;
    const ctx = audioBus.ctx;
    allChannels().forEach(c => {
      const g = (/** @type {import('./src/types/audio-graph.js').AudioBus} */ (audioBus)).tracks[c.key];
      if (g) {
        const v = mixerGainFor(c.key);
        try { g.gain.setTargetAtTime(v, ctx.currentTime, 0.02); } catch (_) { g.gain.value = v; }
      }
      const p = (/** @type {import('./src/types/audio-graph.js').AudioBus} */ (audioBus)).panners && (/** @type {import('./src/types/audio-graph.js').AudioBus} */ (audioBus)).panners[c.key];
      if (p) {
        const pv = mixerPanFor(c.key);
        try { p.pan.setTargetAtTime(pv, ctx.currentTime, 0.02); } catch (_) { p.pan.value = pv; }
      }
    });
    const mv = MASTER_TRIM * mixerMasterLevel;
    try { audioBus.master.gain.setTargetAtTime(mv, ctx.currentTime, 0.02); } catch (_) { audioBus.master.gain.value = mv; }
  }
  function renderMixer() {
    const host = $('virtuoso_lab-mixer-channels'); if (!host) return;
    // Console deck — one vertical strip per channel, split into PERSONAL │ BAND │ SUM
    // (track-architecture stage 3b). The deck is DYNAMIC: BAND strips come from the
    // active band (recipeTracks), labeled by the resolved INSTRUMENT (Banjo/Guitar/
    // Upright), and the extra-lane buses (the bluegrass 'comp2' guitar) get a strip
    // of their own. Strip rows top→bottom: instrument · pan pot · M/S · vertical
    // fader + peak meter · dB readout · instrument label. (The old "Backing tone"
    // knob was dropped 2026-06-11; brightness stays auto-set per style.)
    const { personal, band, prof } = deriveMixerChannels();
    // INSTRUMENT headline per band strip + a numeric chip ONLY when ambiguous (two
    // strips resolving to the same instrument, e.g. afrobeat's two guitars).
    /** @type {Record<string, {headline: string | null, chip: string}>} */
    const meta = {};
    { const /** @type {Record<string, number>} */ counts = {}; band.forEach(c => { const h = stripInstrumentLabel(c, prof); counts[String(h)] = (counts[String(h)] || 0) + 1; });
      /** @type {Record<string, number>} */ const seen = {}; band.forEach(c => { const h = stripInstrumentLabel(c, prof); let chip = ''; if (counts[String(h)] >= 2) { seen[String(h)] = (seen[String(h)] || 0) + 1; chip = String(seen[String(h)]); } meta[c.key] = { headline: h, chip }; }); }
    // Band-reveal: a BAND strip whose instrument CHANGED since the last VISIBLE render
    // glows (the genre-switch reveal). Tracked only while the deck is on-screen, so an
    // off-screen resync doesn't spend the reveal — it fires when the player next sees it.
    // Never on the first open (no baseline → set it, don't flash the whole band).
    const _mxVisible = !!($('virtuoso_lab-root') && /** @type {Element} */ ($('virtuoso_lab-root')).classList.contains('virtuoso_lab_vir-mixer-open'));
    /** @type {Record<string, boolean>} */
    const reveal = {}; const /** @type {Record<string, string | null>} */ curSig = {};
    band.forEach(c => { curSig[c.key] = meta[c.key].headline; });
    if (_mxVisible && _mixerRevealSig) band.forEach(c => { if ((/** @type {Record<string, string | null>} */ (_mixerRevealSig))[c.key] !== curSig[c.key]) reveal[c.key] = true; });
    if (_mxVisible) _mixerRevealSig = curSig;
    /** @param {import('./src/types/audio-graph.js').MixerChannel} c */
    const stripHtml = (c) => {
      const st = mixerState[c.key];
      const m = meta[c.key], headline = m ? m.headline : c.label, chip = m ? m.chip : '';
      const selHtml = c.instr
        ? `<select class="virtuoso_lab-mixer-instr" data-k="${c.key}" title="${headline} instrument" aria-label="${headline} instrument">` +
            MIXER_INSTRUMENTS[c.instr].map(([v, l]) => `<option value="${v}"${(st.instrument || '') === v ? ' selected' : ''}>${l}</option>`).join('') +
          `</select>`
        : c.kit
        ? `<select class="virtuoso_lab-mixer-kit" data-k="${c.key}" title="${headline} kit" aria-label="${headline} kit">` +
            MIXER_KITS.map(([v, l]) => `<option value="${v}"${(st.kit || '') === v ? ' selected' : ''}>${l}</option>`).join('') +
          `</select>`
        : `<span class="virtuoso_lab-mixer-instr-none" aria-hidden="true"></span>`;
      // Amp insert row (Guide + Rhythm); other strips get a spacer so the
      // console rows stay aligned (design-in-context: one grid, no ragged strips).
      const ampHtml = c.amp
        ? `<select class="virtuoso_lab-mixer-amp" data-k="${c.key}" title="${headline} amp (Clean / Overdrive / Metal)" aria-label="${headline} amp">` +
            AMP_OPTIONS.map(([v, l]) => `<option value="${v}"${(st.amp || '') === v ? ' selected' : ''}>${l}</option>`).join('') +
          `</select>`
        : `<span class="virtuoso_lab-mixer-instr-none" aria-hidden="true"></span>`;
      return `<div class="virtuoso_lab-mixer-strip${c.dynamic ? ' dynamic' : ''}${reveal[c.key] ? ' reveal' : ''}" data-strip="${c.key}">` +
        selHtml + ampHtml +
        `<input type="range" class="virtuoso_lab-mixer-pan" data-k="${c.key}" min="-1" max="1" step="0.01" value="${mixerPanFor(c.key)}" aria-label="${headline} pan" title="Pan — double-click to reset">` +
        `<div class="virtuoso_lab-mixer-msrow">` +
          `<button type="button" class="virtuoso_lab-mixer-tog mute${st.mute ? ' active' : ''}" data-k="${c.key}" data-act="mute" title="Mute" aria-pressed="${st.mute}">M</button>` +
          `<button type="button" class="virtuoso_lab-mixer-tog solo${st.solo ? ' active' : ''}" data-k="${c.key}" data-act="solo" title="Solo" aria-pressed="${st.solo}">S</button>` +
        `</div>` +
        `<div class="virtuoso_lab-mixer-fadercol">` +
          `<input type="range" class="virtuoso_lab-mixer-fader" min="0" max="1" step="0.005" value="${faderPosFromGain(st.level)}" data-k="${c.key}" aria-label="${headline} level" aria-orientation="vertical">` +
          `<div class="virtuoso_lab-mixer-meter" aria-hidden="true"><div class="virtuoso_lab-mixer-meter-fill" data-k="${c.key}"></div></div>` +
        `</div>` +
        `<span class="virtuoso_lab-mixer-val" data-k="${c.key}">${faderDb(st.level)}</span>` +
        `<span class="virtuoso_lab-mixer-ch-label">${headline}${chip ? `<span class="virtuoso_lab-mixer-rolechip">${chip}</span>` : ''}</span>` +
      `</div>`;
    };
    // INPUT strip (far left, console convention): the player's LIVE guitar/bass
    // input. Virtuoso never processes that signal — the host owns monitoring —
    // so no fader/pan; just a live level meter (desktop getLevels / the run's
    // level tap) + shortcuts to the host's audio settings and, when the
    // nam_tone plugin is installed, its amp-tone screen (feature-detected).
    const hasNamTone = !!document.getElementById('plugin-nam_tone');
    const inputHtml =
      `<div class="virtuoso_lab-mixer-strip input" data-strip="input">` +
        `<div class="virtuoso_lab-mixer-lim" title="Your live input — the signal the judge hears">YOU</div>` +
        `<div class="virtuoso_lab-mixer-inbtns">` +
          `<button type="button" class="virtuoso_lab-mixer-inbtn" data-go="settings" title="Audio interface & host settings">Audio…</button>` +
          (hasNamTone ? `<button type="button" class="virtuoso_lab-mixer-inbtn" data-go="plugin-nam_tone" title="Amp tone setup (NAM)">Tone…</button>` : '') +
        `</div>` +
        `<div class="virtuoso_lab-mixer-fadercol input">` +
          `<div class="virtuoso_lab-mixer-meter wide" aria-hidden="true"><div class="virtuoso_lab-mixer-meter-fill" data-k="input"></div></div>` +
        `</div>` +
        `<span class="virtuoso_lab-mixer-val" data-k="input">in</span>` +
        `<span class="virtuoso_lab-mixer-ch-label">Input</span>` +
      `</div>`;
    const masterHtml =
      `<div class="virtuoso_lab-mixer-strip master" data-strip="master">` +
        `<div class="virtuoso_lab-mixer-lim" id="virtuoso_lab-mixer-lim" title="Master limiter activity"><span class="virtuoso_lab-mixer-led"></span>LIM</div>` +
        `<div class="virtuoso_lab-mixer-msrow">` +
          `<button type="button" class="virtuoso_lab-mixer-tog dim${mixerBackingDim ? ' active' : ''}" data-act="dim" title="Duck the backing band (practice focus)" aria-pressed="${mixerBackingDim}">Dim</button>` +
        `</div>` +
        `<div class="virtuoso_lab-mixer-fadercol">` +
          `<input type="range" class="virtuoso_lab-mixer-fader" min="0" max="1" step="0.005" value="${faderPosFromGain(mixerMasterLevel)}" data-k="master" aria-label="Master level" aria-orientation="vertical">` +
          `<div class="virtuoso_lab-mixer-meter" aria-hidden="true"><div class="virtuoso_lab-mixer-meter-fill" data-k="master"></div></div>` +
        `</div>` +
        `<span class="virtuoso_lab-mixer-val" data-k="master">${faderDb(mixerMasterLevel)}</span>` +
        `<span class="virtuoso_lab-mixer-ch-label">Master</span>` +
      `</div>`;
    // One-line band caption (the band-reveal's verbal cue) + the PERSONAL│BAND│SUM deck.
    let styleName = '';
    try { const id = cfgAudioProfile((activeBundle && activeBundle.config) || readConfig()); styleName = (id && STYLE_PALETTES[id] && STYLE_PALETTES[id].label) || ''; } catch (_) {}
    const bandNames = band.map(c => meta[c.key].headline + (meta[c.key].chip ? ' ' + meta[c.key].chip : ''));
    const caption = band.length
      ? `<div class="virtuoso_lab-mixer-caption">${styleName ? `<b>${styleName}</b> band — ` : 'Your band — '}${bandNames.join(' · ')}</div>`
      : `<div class="virtuoso_lab-mixer-caption">Just you and the click — this drill has no backing band.</div>`;
    /** @param {string} cls @param {string} label @param {string} strips */
    const grp = (cls, label, strips) => `<div class="virtuoso_lab-mixer-group ${cls}"><span class="virtuoso_lab-mixer-grouplabel">${label}</span><div class="virtuoso_lab-mixer-groupstrips">${strips}</div></div>`;
    host.innerHTML = caption + `<div class="virtuoso_lab-mixer-deck">` +
      grp('personal', 'Personal', inputHtml + personal.map(stripHtml).join('')) +
      grp('band', 'Band', band.length ? band.map(stripHtml).join('') : `<div class="virtuoso_lab-mixer-bandempty">No backing band for this drill.</div>`) +
      grp('sum', 'Sum', masterHtml) +
    `</div>`;
  }
  // The Rig view (Mixer's second tab) — per-amp cab IR + output trim for the
  // BACKING band. The cab is per-AMP (one Metal cab serves every metal-amped strip),
  // so this manages the 3 amps, not the 7 strips. The player's OWN live amp stays
  // the Input "YOU" strip's "Tone…" handoff to nam_tone — band tone ≠ live tone.
  /** @type {Record<string, string>} */
  const RIG_AMP_LABELS = { clean: 'Clean', drive: 'Overdrive', metal: 'Metal' };
  /** @type {Record<string, string>} */
  const RIG_DEFAULT_CAB = { clean: 'Built-in (procedural)', drive: 'Built-in (procedural)', metal: 'V30 4×12' };
  /** @param {string} ampId */
  function rigOutputDb(ampId) {
    const ov = rigState[ampId] || {}, v = (ov.output != null ? ov.output : (AMP_PRESETS[ampId] ? AMP_PRESETS[ampId].makeup : 1));
    return v <= 0.0001 ? '−∞' : (20 * Math.log10(v)).toFixed(1);
  }
  /** @param {string} [flag] */
  function renderRig(flag) {
    const host = $('virtuoso_lab-mixer-rig'); if (!host) return;
    /** @param {string} id */
    const card = (id) => {
      const ov = rigState[id] || {}, p = AMP_PRESETS[id] || {};
      const custom = !!ov.irName;
      const cabName = custom ? ov.irName.replace(/\.wav$/i, '') : (RIG_DEFAULT_CAB[id] || 'Default');
      const outV = (ov.output != null ? ov.output : (p.makeup || 0.5));
      return `<div class="virtuoso_lab-rig-card" data-amp="${id}">` +
        `<div class="virtuoso_lab-rig-cardhead">${RIG_AMP_LABELS[id] || id}</div>` +
        `<div class="virtuoso_lab-rig-row">` +
          `<span class="virtuoso_lab-rig-rowlbl">Cab</span>` +
          `<span class="virtuoso_lab-rig-cabname${custom ? ' custom' : ''}" title="${custom ? 'Your cab IR' : 'Built-in cab'}">${cabName}</span>` +
          `<button type="button" class="virtuoso_lab-rig-load" data-amp="${id}">Load…</button>` +
          (custom ? `<button type="button" class="virtuoso_lab-rig-reset" data-amp="${id}" data-what="ir" title="Reset to the built-in cab" aria-label="Reset cab">↺</button>` : '') +
        `</div>` +
        `<div class="virtuoso_lab-rig-row">` +
          `<span class="virtuoso_lab-rig-rowlbl">Output</span>` +
          `<input type="range" class="virtuoso_lab-rig-out" data-amp="${id}" min="0" max="1.2" step="0.01" value="${outV}" aria-label="${RIG_AMP_LABELS[id]} amp output">` +
          `<span class="virtuoso_lab-rig-outdb" data-amp="${id}">${rigOutputDb(id)} dB</span>` +
          (ov.output != null ? `<button type="button" class="virtuoso_lab-rig-reset" data-amp="${id}" data-what="out" title="Reset output" aria-label="Reset output">↺</button>` : '') +
        `</div>` +
      `</div>`;
    };
    host.innerHTML =
      `<p class="virtuoso_lab-rig-intro">Your <b>backing band's</b> amp cabs — load your own cab IR (<code>.wav</code>) per amp. <span class="virtuoso_lab-rig-dim">For your own live tone, use the <b>YOU</b> strip → Tone…</span></p>` +
      (flag === 'bad' ? `<p class="virtuoso_lab-rig-bad">That file couldn't be read as audio — kept the current cab.</p>` : '') +
      `<div class="virtuoso_lab-rig-cards">${RIG_AMPS.map(card).join('')}</div>` +
      `<input type="file" id="virtuoso_lab-rig-file" accept=".wav,audio/wav,audio/*" hidden>`;
  }
  // Live console meters — drawn only while the Mixer is open (its own rAF loop;
  // the playback tick is untouched, and there is zero cost while closed). Reads
  // the post-fader AnalyserNode taps (trackBus) + the post-limiter master tap,
  // with the LIM LED riding the safety limiter's gain reduction.
  let _mixMeterRaf = 0, /** @type {Uint8Array<ArrayBuffer> | null} */ _mixMeterBuf = null;
  /** @type {Record<string, number>} */
  const _mixMeterPk = {};
  // INPUT-strip level source: during a run the grading level tap (_lvlSamples —
  // desktop getLevels / web analyser) is fresh, so read its last sample; outside
  // a run, poll the desktop bridge directly while the mixer is open (one IPC in
  // flight, ~10Hz). Web outside a run stays idle — we don't grab the mic just
  // because the mixer opened.
  const _mixIn = { lvl: 0, inFlight: false, lastPoll: 0 };
  function mixerInputLevel() {
    if (transport.playing && _lvlMode !== 'none' && _lvlSamples.length) return _lvlSamples[_lvlSamples.length - 1].L;
    const bridge = hostDesktop()?.audio;
    if (bridge && typeof bridge.getLevels === 'function' && !_mixIn.inFlight && performance.now() - _mixIn.lastPoll > 100) {
      _mixIn.inFlight = true; _mixIn.lastPoll = performance.now();
      let p = null; try { p = bridge.getLevels(); } catch (_) { p = null; }
      Promise.resolve(p).then((lv) => { _mixIn.lvl = (lv && typeof lv.inputLevel === 'number') ? lv.inputLevel : 0; })
        .catch(() => { _mixIn.lvl = 0; }).finally(() => { _mixIn.inFlight = false; });
    }
    return _mixIn.lvl;
  }
  function mixerMeterFrame() {
    const root = $('virtuoso_lab-root');
    if (!root || !root.classList.contains('virtuoso_lab_vir-mixer-open')) { _mixMeterRaf = 0; return; }
    const host = $('virtuoso_lab-mixer-channels');
    if (host) {
      if (!_mixMeterBuf) _mixMeterBuf = new Uint8Array(256);
      /** @param {AnalyserNode | null | undefined} an */
      const peakOf = (an) => {
        if (!an) return 0;
        try { an.getByteTimeDomainData(/** @type {Uint8Array<ArrayBuffer>} */ (_mixMeterBuf)); } catch (_) { return 0; }
        let p = 0;
        for (let i = 0; i < 256; i++) { const v = Math.abs(/** @type {Uint8Array<ArrayBuffer>} */ (_mixMeterBuf)[i] - 128); if (v > p) p = v; }
        return p / 128;
      };
      // `lvl` (0..1) overrides the analyser read — the INPUT strip's source is a
      // direct level (host getLevels / the run's level tap), not a bus tap.
      /** @param {string} k @param {AnalyserNode | null} an @param {number} [lvl] */
      const draw = (k, an, lvl) => {
        const sm = Math.max(lvl != null ? lvl : peakOf(an), (_mixMeterPk[k] || 0) * 0.88);   // fast attack, smooth release
        _mixMeterPk[k] = sm;
        const fill = host.querySelector(`.virtuoso_lab-mixer-meter-fill[data-k="${k}"]`);
        if (!fill) return;
        const db = sm <= 0.001 ? -60 : 20 * Math.log10(sm);
        fill.style.height = (Math.max(0, Math.min(1, (db + 48) / 48)) * 100).toFixed(1) + '%';
        fill.classList.toggle('hot', db > -3);
      };
      if (audioBus) {
        allChannels().forEach(c => draw(c.key, (/** @type {import('./src/types/audio-graph.js').AudioBus} */ (audioBus)).analysers[c.key]));
        draw('master', audioBus.masterAnalyser);
        const lim = $('virtuoso_lab-mixer-lim');
        if (lim) {
          const r = audioBus.limiter && typeof audioBus.limiter.reduction === 'number' ? audioBus.limiter.reduction : 0;
          lim.classList.toggle('lit', r < -1);
        }
      }
      // INPUT strip works even before the first Play (no audioBus needed).
      draw('input', null, mixerInputLevel());
    }
    _mixMeterRaf = requestAnimationFrame(mixerMeterFrame);
  }
  // Panel toggles (M / P / ? overlays). Slide transitions + open state live in CSS
  // (reduced-motion aware); these flip the root class + aria + the button highlight.
  /** @param {boolean} [force] */
  function toggleMixer(force) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const open = force != null ? force : !root.classList.contains('virtuoso_lab_vir-mixer-open');
    if (open) { root.classList.remove('virtuoso_lab_vir-library-open'); root.classList.remove('virtuoso_lab_vir-starters-open'); }   // mutually exclusive bottom drawers
    root.classList.toggle('virtuoso_lab_vir-mixer-open', open);
    $('virtuoso_lab-mixer')?.setAttribute('aria-hidden', open ? 'false' : 'true');
    $('virtuoso_lab-mixer-btn')?.classList.toggle('active', open);
    if (open) {
      renderMixer(); renderRig(); applyMixer();
      if (!_mixMeterRaf) _mixMeterRaf = requestAnimationFrame(mixerMeterFrame);   // meters run only while open
    }
  }
  /** @param {boolean} [force] */
  function toggleProgressSheet(force) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const open = force != null ? force : !root.classList.contains('virtuoso_lab_vir-progress-open');
    root.classList.toggle('virtuoso_lab_vir-progress-open', open);
    $('virtuoso_lab-progress-sheet')?.setAttribute('aria-hidden', open ? 'false' : 'true');
    $('virtuoso_lab-progress-strip')?.classList.toggle('chip-open', open);   // the header chip is P's affordance
    if (open) renderProgressSheet();
  }
  /** @param {boolean} [force] */
  function toggleCheatSheet(force) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const open = force != null ? force : !root.classList.contains('virtuoso_lab_vir-cheat-open');
    root.classList.toggle('virtuoso_lab_vir-cheat-open', open);
    $('virtuoso_lab-cheatsheet')?.setAttribute('aria-hidden', open ? 'false' : 'true');
    $('virtuoso_lab-help-btn')?.classList.toggle('active', open);
  }

  // ── Library browse drawer (Phase 9 Slice 3) ─────────────────────────────────
  // Slides UP over the stage (mirrors the Mixer M idiom). Browse the segment
  // TEMPLATE library grouped by ROLE; Genre × Skill × Instrument chips narrow
  // within; [+ Add] appends a fresh template-ref block to the editable Workout
  // draft (addSegmentToDraft) and stays open for multi-add. Overlay, not relayout;
  // Esc stays unbound (the host owns it). UX: project_workout_browse_design_refresh.
  let _libFilters = { genre: 'all', skill: 'all', instrument: 'all' };
  /** @type {Record<string, string>} */
  const LIB_GENRE_LABELS = { blues:'Blues', rock:'Rock', metal:'Metal', djent:'Djent', jazz:'Jazz', funk:'Funk', pop:'Pop', country:'Country', gospel:'Gospel' };
  function _libGenres() {
    const set = new Set();
    for (const id of Object.keys(SEGMENT_TEMPLATES)) { const st = SEGMENT_TEMPLATES[id].style; if (st) set.add(st); }
    return [...set].sort();
  }
  /** @param {boolean} [force] */
  function toggleLibrary(force) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const open = force != null ? force : !root.classList.contains('virtuoso_lab_vir-library-open');
    if (open) { root.classList.remove('virtuoso_lab_vir-mixer-open'); root.classList.remove('virtuoso_lab_vir-starters-open'); }   // both slide up from the bottom — mutually exclusive
    root.classList.toggle('virtuoso_lab_vir-library-open', open);
    $('virtuoso_lab-library')?.setAttribute('aria-hidden', open ? 'false' : 'true');
    $('virtuoso_lab-library-open')?.classList.toggle('active', open);
    if (open) renderLibrary();
  }
  /** @param {'genre' | 'skill' | 'instrument'} dim @param {string} label @param {string[][]} values */
  function _libChipRow(dim, label, values) {
    const cur = _libFilters[dim];
    /** @param {string} val @param {string} txt */
    const chip = (val, txt) => `<button type="button" class="virtuoso_lab-lib-chip${cur === val ? ' active' : ''}" data-filter="${dim}" data-value="${val}">${txt}</button>`;
    return `<div class="virtuoso_lab-lib-chiprow"><span class="virtuoso_lab-lib-chiplbl">${label}</span>${chip('all', 'All')}${values.map(v => chip(v[0], v[1])).join('')}</div>`;
  }
  function renderLibraryFilters() {
    const el = $('virtuoso_lab-library-filters'); if (!el) return;
    const genres = _libGenres().map(g => [g, LIB_GENRE_LABELS[g] || g]);
    const skills = [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']];
    const insts  = [['guitar', 'Guitar'], ['bass', 'Bass']];
    el.innerHTML = _libChipRow('genre', 'Genre', genres) + _libChipRow('skill', 'Skill', skills) + _libChipRow('instrument', 'Instrument', insts);
  }
  /** @param {string} id */
  function _libCardHtml(id) {
    const t = SEGMENT_TEMPLATES[id];
    /** @param {unknown} s */
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const color = KIND_COLORS[t.kind] || '#94a3b8';
    const klabel = KIND_LABELS[t.kind] || t.kind;
    let dose = '';
    try { const seg = rollSegment(t, { variantIdx: 0 }); const d = segmentEstDuration(seg); dose = d < 60 ? `~${Math.round(d)}s` : `~${Math.floor(d / 60)}m${Math.round(d % 60)}s`; } catch (_) {}
    const meta = [t.competency, t.style ? (LIB_GENRE_LABELS[t.style] || t.style) : 'all-purpose', t.instrument, dose].filter(Boolean).join(' · ');
    return `<div class="virtuoso_lab-lib-card">
      <div class="virtuoso_lab-segment-header">
        <span class="virtuoso_lab-segment-badge" style="color:${color}">${esc(klabel)}</span>
        <span class="virtuoso_lab-segment-name">${esc(t.label || id)}</span>
        <button type="button" class="virtuoso_lab-lib-add" data-template-id="${esc(id)}" title="Add this block to your workout">+ Add</button>
      </div>
      <div class="virtuoso_lab-segment-meta">${esc(meta)}</div>
    </div>`;
  }
  function renderLibrary() {
    renderLibraryFilters();
    const body = $('virtuoso_lab-library-body'), cnt = $('virtuoso_lab-library-count'); if (!body) return;
    const f = _libFilters;
    const ids = Object.keys(SEGMENT_TEMPLATES);
    /** @param {string} id */
    const match = id => { const t = SEGMENT_TEMPLATES[id];
      return (f.genre === 'all' || t.style === f.genre)
          && (f.skill === 'all' || t.band === f.skill)
          && (f.instrument === 'all' || t.instrument === f.instrument); };
    const shown = ids.filter(match);
    if (cnt) cnt.textContent = `${shown.length} of ${ids.length}`;
    const roleOrder = Object.keys(SEGMENT_ROLES).sort((a, b) => SEGMENT_ROLES[a].order - SEGMENT_ROLES[b].order);
    let html = '';
    for (const role of roleOrder) {
      const inRole = shown.filter(id => SEGMENT_TEMPLATES[id].role === role);
      if (!inRole.length) continue;
      html += `<div class="virtuoso_lab-lib-rolehead">${SEGMENT_ROLES[role].label} <span class="virtuoso_lab-lib-rolecount">${inRole.length}</span></div>`;
      html += `<div class="virtuoso_lab-lib-grid">${inRole.map(_libCardHtml).join('')}</div>`;
    }
    body.innerHTML = html || `<div class="virtuoso_lab-lib-empty">No blocks match these filters — clear one to see more.</div>`;
  }

  // ── Starter-workout browse drawer (Phase 9 Slice 4) ─────────────────────────
  // The SAME drawer pattern one altitude up: browse the BUILT_IN_SESSIONS by
  // Genre × Level × Instrument (derived from tags + stringSetup — the sessions
  // carry no explicit facet fields), with role-mix preview dots. [Load] forks the
  // starter into the editable timeline (replace-guard when the draft is edited).
  // This is the ONLY starter picker — the old <select> dropdown was dropped;
  // BUILT_IN_SESSIONS is the option source and _selectedStarterId the selection state.
  /** @type {Record<string, string>} */
  const ROLE_COLORS = { warmup:'#f97316', technique:'#a855f7', scale_arp:'#22c55e', application:'#3b82f6', jam:'#eab308', review:'#06b6d4', cooldown:'#64748b' };
  /** @type {Record<string, string>} */
  const STARTER_GENRE_WORDS = { blues:'blues', rock:'rock', metal:'metal', jazz:'jazz', bebop:'jazz', funk:'funk', pop:'pop', country:'country', gospel:'gospel' };
  let _starterFilters = { genre: 'all', level: 'all', instrument: 'all' };
  /** @type {string | null} */
  let _pendingStarter = null;
  /** @param {string} id */
  function _sessionFacets(id) {
    const sess = BUILT_IN_SESSIONS[id]; if (!sess) return { genre:'general', level:'any', instrument:'guitar' };
    const tags = (sess.tags || []).map(t => String(t).toLowerCase());
    let genre = 'general';
    for (const t of tags) if (STARTER_GENRE_WORDS[t]) { genre = STARTER_GENRE_WORDS[t]; break; }
    let level = 'any';
    for (const t of tags) if (t === 'beginner' || t === 'intermediate' || t === 'advanced') { level = t; break; }
    const setup = STRING_SETUPS[sess.stringSetup] || STRING_SETUPS.guitar_6_standard;
    return { genre, level, instrument: setup.instrument };
  }
  /** @param {boolean} [force] */
  function toggleStarters(force) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const open = force != null ? force : !root.classList.contains('virtuoso_lab_vir-starters-open');
    if (open) { root.classList.remove('virtuoso_lab_vir-mixer-open'); root.classList.remove('virtuoso_lab_vir-library-open'); }   // mutually exclusive bottom drawers
    root.classList.toggle('virtuoso_lab_vir-starters-open', open);
    $('virtuoso_lab-starters')?.setAttribute('aria-hidden', open ? 'false' : 'true');
    $('virtuoso_lab-starters-open')?.classList.toggle('active', open);
    if (open) { _pendingStarter = null; renderStarters(); }
  }
  /** @param {'genre' | 'level' | 'instrument'} dim @param {string} label @param {string[][]} values */
  function _starterChipRow(dim, label, values) {
    const cur = _starterFilters[dim];
    /** @param {string} val @param {string} txt */
    const chip = (val, txt) => `<button type="button" class="virtuoso_lab-lib-chip${cur === val ? ' active' : ''}" data-sfilter="${dim}" data-value="${val}">${txt}</button>`;
    return `<div class="virtuoso_lab-lib-chiprow"><span class="virtuoso_lab-lib-chiplbl">${label}</span>${chip('all', 'All')}${values.map(v => chip(v[0], v[1])).join('')}</div>`;
  }
  function renderStarterFilters() {
    const el = $('virtuoso_lab-starters-filters'); if (!el) return;
    const present = new Set(Object.keys(BUILT_IN_SESSIONS).map(id => _sessionFacets(id).genre));
    const genres = ['blues','rock','metal','jazz','funk','pop','country','gospel','general'].filter(g => present.has(g))
      .map(g => [g, g === 'general' ? 'General' : (LIB_GENRE_LABELS[g] || g)]);
    const levels = [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']];
    const insts  = [['guitar', 'Guitar'], ['bass', 'Bass']];
    el.innerHTML = _starterChipRow('genre', 'Genre', genres) + _starterChipRow('level', 'Level', levels) + _starterChipRow('instrument', 'Instrument', insts);
  }
  /** @param {string} id */
  function _starterDotsHtml(id) {
    const segs = /** @type {import('./src/core/session-types.js').Segment[]} */ ((BUILT_IN_SESSIONS[id].segments || []).map(materializeSegment).filter(Boolean));
    return `<span class="virtuoso_lab-starter-dots">` + segs.map(s => {
      const c = ROLE_COLORS[String(s.role)] || KIND_COLORS[String(s.kind)] || '#64748b';
      const lbl = (SEGMENT_ROLES[String(s.role)] || {}).label || KIND_LABELS[String(s.kind)] || s.kind;
      return `<span class="virtuoso_lab-starter-dot" style="background:${c}" title="${lbl}"></span>`;
    }).join('') + `</span>`;
  }
  /** @param {string} id */
  function _starterCardHtml(id) {
    const sess = BUILT_IN_SESSIONS[id];
    /** @param {unknown} s */
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const f = _sessionFacets(id);
    const segs = /** @type {import('./src/core/session-types.js').Segment[]} */ ((sess.segments || []).map(materializeSegment).filter(Boolean));
    const dur = segs.reduce((a, s) => a + segmentEstDuration(s), 0);
    const durStr = dur < 60 ? `~${Math.round(dur)}s` : `~${Math.floor(dur / 60)}m`;
    const meta = [`${segs.length} blocks`, f.genre === 'general' ? null : (LIB_GENRE_LABELS[f.genre] || f.genre), f.level === 'any' ? null : f.level, f.instrument, durStr].filter(Boolean).join(' · ');
    return `<div class="virtuoso_lab-lib-card virtuoso_lab-starter-card">
      <div class="virtuoso_lab-segment-header">
        <span class="virtuoso_lab-segment-name">${esc(sess.name || id)}</span>
        <button type="button" class="virtuoso_lab-lib-add virtuoso_lab-starter-load" data-starter-id="${esc(id)}" title="Load this starter into the timeline">Load</button>
      </div>
      ${_starterDotsHtml(id)}
      <div class="virtuoso_lab-segment-meta">${esc(meta)}</div>
    </div>`;
  }
  function renderStarters() {
    renderStarterFilters();
    const body = $('virtuoso_lab-starters-body'), cnt = $('virtuoso_lab-starters-count'), confirm = $('virtuoso_lab-starters-confirm');
    if (!body) return;
    // Replace-guard strip (only when the draft has unsaved edits): inline, not a modal.
    if (confirm) {
      if (_pendingStarter && BUILT_IN_SESSIONS[_pendingStarter]) {
        const n = (workoutEditor.draft?.segments || []).length;
        confirm.innerHTML = `<span>Replace your ${n} edited block${n === 1 ? '' : 's'} with “${BUILT_IN_SESSIONS[_pendingStarter].name}”?</span>`
          + `<button type="button" class="virtuoso_lab-starter-confirm-yes" data-starter-id="${_pendingStarter}">Load</button>`
          + `<button type="button" class="virtuoso_lab-starter-confirm-no">Cancel</button>`;
        confirm.hidden = false;
      } else { confirm.hidden = true; confirm.innerHTML = ''; }
    }
    const f = _starterFilters;
    const ids = Object.keys(BUILT_IN_SESSIONS);
    /** @param {string} id */
    const match = id => { const x = _sessionFacets(id);
      return (f.genre === 'all' || x.genre === f.genre)
          && (f.level === 'all' || x.level === f.level)
          && (f.instrument === 'all' || x.instrument === f.instrument); };
    const shown = ids.filter(match);
    if (cnt) cnt.textContent = `${shown.length} of ${ids.length}`;
    const routinesHtml = routinesSectionHtml();   // the user's saved routines, above the built-in starters
    const startersHtml = shown.length
      ? `${routinesHtml ? '<div class="virtuoso_lab-lib-group-title">Starters</div>' : ''}<div class="virtuoso_lab-lib-grid">${shown.map(_starterCardHtml).join('')}</div>`
      : `<div class="virtuoso_lab-lib-empty">No starters match these filters — clear one to see more.</div>`;
    body.innerHTML = routinesHtml + startersHtml;
  }
  // Fork a starter into the editable timeline. Replace-guard: if the current draft
  // has edits, stage a confirm strip instead of clobbering (force=true confirms).
  /** @param {string} id @param {boolean} [force] */
  function loadStarter(id, force) {
    if (!BUILT_IN_SESSIONS[id]) return;
    if (workoutEditor.dirty && workoutEditor.draft && !force) { _pendingStarter = id; renderStarters(); return; }
    workoutEditor.replace(id, BUILT_IN_SESSIONS[id]); _pendingStarter = null;
    toggleStarters(false);
  }

  // ── Named ROUTINES (engagement Tier B — a returnable Workout you OWN) ────────
  // A saved Workout = a `kind:'workout'` preset whose `config_json` holds the whole
  // session (the backend already stores arbitrary JSON). "My morning warmup" becomes
  // a returnable object that lives in the starter picker — gamification's #1 "studio
  // not a timer" move (persistence + identity + ritual). Host-check verdict: BUILD on
  // our preset CRUD (the host ships no program/routine surface). Guardrails: no
  // streak-on-the-routine, no "you haven't run this in N days" nag — it's a
  // convenience, not an obligation.
  /** @type {import('./src/types/progress-data.js').Routine[] | null} */
  let _savedRoutines = null;   // cache of the user's kind:'workout' presets
  async function loadSavedRoutines() {
    try {
      const r = await fetch('/api/plugins/virtuoso_lab/presets');
      const data = r.ok ? await r.json() : null;
      const all = (data && Array.isArray(data.presets)) ? data.presets : [];
      _savedRoutines = all.filter((/** @type {import('./src/types/progress-data.js').Routine | null} */ p) => p && p.kind === 'workout' && p.config && Array.isArray(p.config.segments));
    } catch (_) { _savedRoutines = _savedRoutines || []; }
    return _savedRoutines;
  }
  /** @param {string} name */
  function routineSlug(name) { return 'rt_' + String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '_' + Date.now().toString(36); }
  /** @param {string} name */
  async function saveRoutine(name) {
    const draft = workoutEditor.draft;
    if (!draft || !(draft.segments || []).length) { showStatus('Build a Workout first.'); return false; }
    name = (name || '').trim() || 'My routine';
    const session = Object.assign({}, draft, { version: 1, name });   // the editable draft IS the session
    const id = routineSlug(name);
    try {
      const res = await fetch('/api/plugins/virtuoso_lab/presets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, kind: 'workout', config: session }) });
      if (!res.ok) throw new Error(await res.text());
    } catch (_) { showStatus('Could not save the routine.'); return false; }
    showStatus(`Saved routine: ${name}`);
    await loadSavedRoutines(); renderStarters();
    return true;
  }
  /** @param {string} id */
  function loadRoutine(id) {
    const rt = (_savedRoutines || []).find(p => p.id === id); if (!rt) return;
    workoutEditor.replace(id, rt.config); _pendingStarter = null;
    toggleStarters(false);
  }
  /** @param {string} id */
  async function deleteRoutine(id) {
    try { await fetch('/api/plugins/virtuoso_lab/presets/' + encodeURIComponent(id), { method: 'DELETE' }); } catch (_) {}
    if (_savedRoutines) _savedRoutines = _savedRoutines.filter(p => p.id !== id);
    renderStarters();
  }
  function routinesSectionHtml() {
    const rts = _savedRoutines || [];
    if (!rts.length) return '';
    /** @param {unknown} s */
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const cards = rts.map(rt => {
      const n = (rt.config.segments || []).length;
      return `<div class="virtuoso_lab-lib-card virtuoso_lab-routine-card">
        <div class="virtuoso_lab-segment-header">
          <span class="virtuoso_lab-segment-name">${esc(rt.name || rt.id)}</span>
          <span class="virtuoso_lab-routine-card-actions">
            <button type="button" class="virtuoso_lab-lib-add virtuoso_lab-routine-load" data-routine-id="${esc(rt.id)}" title="Load this routine into the timeline">Load</button>
            <button type="button" class="virtuoso_lab-routine-del" data-routine-id="${esc(rt.id)}" title="Delete this routine" aria-label="Delete routine">✕</button>
          </span>
        </div>
        <div class="virtuoso_lab-segment-meta">${n} block${n === 1 ? '' : 's'} · your routine</div>
      </div>`;
    }).join('');
    return `<div class="virtuoso_lab-lib-group-title">Your routines</div><div class="virtuoso_lab-lib-grid virtuoso_lab-routines-grid">${cards}</div>`;
  }

  // ── Pack manager (the band-bar "+") ─────────────────────────────────────────
  // A pack === a band. Core packs (kind:'core') are DERIVED — always installed,
  // pinned first in fixed staircase order, never written to storage. Storage tracks
  // only the user's Style packs: { installed:[styleIds], order:[styleIds] }. A
  // missing/corrupt key = Core only (Style packs start in the Available column —
  // the "+" IS the breadth-reveal). Reuses the cheat-card overlay; commits nothing
  // until Save (works on a draft copy). "Remove" = move back to Available, never delete.
  function packsLoad() {
    try {
      const o = JSON.parse(localStorage.getItem('virtuoso_lab.packs') || '{}');
      return { installed: Array.isArray(o.installed) ? o.installed : [],
               order:     Array.isArray(o.order)     ? o.order     : [] };
    } catch { return { installed: [], order: [] }; }
  }
  /** @param {{order: string[]}} state */
  function packsSave(state) {
    try { localStorage.setItem('virtuoso_lab.packs', JSON.stringify({ installed: state.order.slice(), order: state.order.slice() })); }
    catch (e) { console.warn('[Virtuoso] packs save failed', e); }
  }
  const _stylePackIds = () => PATHWAY_BANDS.filter(b => b.kind === 'style').map(b => b.id);
  const _corePackIds  = () => PATHWAY_BANDS.filter(b => b.kind === 'core').map(b => b.id);
  // Installed Style packs in saved order — self-healing: existing+installed style
  // ids only, deduped, with any installed-but-unordered id appended.
  /** @param {{installed: string[], order: string[]} | null} [state] */
  function installedStyleOrder(state) {
    const st = state || packsLoad();
    const styles = _stylePackIds();
    const inst = st.installed.filter((/** @type {string} */ id) => styles.includes(id));
    const ordered = st.order.filter((/** @type {string} */ id) => inst.includes(id));
    inst.forEach((/** @type {string} */ id) => { if (!ordered.includes(id)) ordered.push(id); });
    return ordered;
  }
  // The picker's band order: Core (fixed) + installed Style packs (user order).
  function visiblePackOrder() { return _corePackIds().concat(installedStyleOrder()); }

  /** @type {{order: string[]} | null} */
  let _packsDraft = null;   // { order:[styleIds] } working copy while the modal is open
  /** @type {{col: string, id: string} | null} */
  let _packsSel = null;     // { col:'available'|'installed', id } current selection

  /** @param {boolean} [force] */
  function togglePackManager(force) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const open = force != null ? force : !root.classList.contains('virtuoso_lab_vir-packs-open');
    if (open) { _packsDraft = { order: installedStyleOrder() }; _packsSel = null; }
    root.classList.toggle('virtuoso_lab_vir-packs-open', open);
    $('virtuoso_lab-packs-modal')?.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.querySelectorAll('.virtuoso_lab-band-add').forEach(b => b.classList.toggle('active', open));
    if (open) renderPackManager(); else { _packsDraft = null; _packsSel = null; }
  }

  function renderPackManager() {
    const inst = $('virtuoso_lab-packs-installed');
    const avail = $('virtuoso_lab-packs-available');
    if (!inst || !avail || !_packsDraft) return;
    const installedStyles = _packsDraft.order.slice();
    const availableStyles = _stylePackIds().filter(id => !installedStyles.includes(id));

    // Installed column: Core (pinned, locked) → hairline → Style (draggable, ordered)
    inst.innerHTML = '';
    _corePackIds().forEach(id => inst.appendChild(_packRow(id, 'installed', { core: true })));
    const hr = document.createElement('div'); hr.className = 'virtuoso_lab-pack-hairline'; inst.appendChild(hr);
    if (!installedStyles.length) {
      inst.appendChild(_packEmpty('No style packs installed — add one from Available.'));
    } else {
      installedStyles.forEach(id => inst.appendChild(_packRow(id, 'installed', {})));
    }

    // Available column: grouped by family in curriculum-map order
    avail.innerHTML = '';
    if (!availableStyles.length) {
      avail.appendChild(_packEmpty('All style packs installed — drag one here to hide it.'));
    } else {
      /** @param {string} id */
      const famOf = id => (PATHWAY_BANDS.find(b => b.id === id) || {}).family;
      const fams = PACK_FAMILY_ORDER.filter(f => availableStyles.some(id => famOf(id) === f));
      availableStyles.forEach(id => { const f = famOf(id); if (f && !fams.includes(f)) fams.push(f); });
      fams.forEach(f => {
        const head = document.createElement('div'); head.className = 'virtuoso_lab-pack-fam'; head.textContent = f; avail.appendChild(head);
        availableStyles.filter(id => famOf(id) === f).forEach(id => avail.appendChild(_packRow(id, 'available', {})));
      });
    }
    _syncPackMoveButtons();
  }

  /** @param {string} msg */
  function _packEmpty(msg) { const d = document.createElement('div'); d.className = 'virtuoso_lab-pack-empty'; d.textContent = msg; return d; }

  /** @param {string} id @param {string} col @param {{core?: boolean}} opts */
  function _packRow(id, col, opts) {
    /** @type {{label: string, kind?: string, buildsOn?: string}} */
    const b = PATHWAY_BANDS.find(x => x.id === id) || { label: id };
    const row = document.createElement('div');
    row.className = 'virtuoso_lab-segment-card virtuoso_lab-pack-row'
      + (opts.core ? ' is-core' : '')
      + (_packsSel && _packsSel.col === col && _packsSel.id === id ? ' active' : '');
    row.dataset.packId = id;
    row.dataset.col = col;
    row.setAttribute('role', 'option');
    const lead = opts.core ? '<span class="virtuoso_lab-pack-lock" title="Core — always included" aria-hidden="true">🔒</span>'
      : (col === 'installed' ? '<span class="virtuoso_lab-pack-grip" aria-hidden="true">⋮⋮</span>' : '');
    const sub = (b.kind === 'style' && b.buildsOn) ? `<div class="virtuoso_lab-pw-sub">${b.buildsOn}</div>` : '';
    row.innerHTML = `<div class="virtuoso_lab-pw-rowtop">${lead}<span class="virtuoso_lab-pw-label">${b.label}${opts.core ? ' · Core' : ''}</span></div>${sub}`;
    if (!opts.core) {
      row.tabIndex = 0;
      const select = () => { _packsSel = { col, id }; renderPackManager(); };
      row.addEventListener('click', select);
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
      row.setAttribute('draggable', 'true');
      row.addEventListener('dragstart', (e) => { const dt = e.dataTransfer; if (!dt) return; dt.setData('text/plain', id); dt.effectAllowed = 'move'; row.classList.add('dragging'); });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
    }
    return row;
  }

  /** @param {string} id */
  function _packInstall(id) {
    if (!_packsDraft || _packsDraft.order.includes(id) || !_stylePackIds().includes(id)) return;
    _packsDraft.order.push(id);
  }
  /** @param {string} id */
  function _packUninstall(id) {
    if (!_packsDraft) return;
    _packsDraft.order = _packsDraft.order.filter(x => x !== id);
  }
  /** @param {string} id @param {string | null | undefined} beforeId */
  function _packReorder(id, beforeId) {
    if (!_packsDraft) return;
    const arr = _packsDraft.order.filter(x => x !== id);
    const at = beforeId ? arr.indexOf(beforeId) : -1;
    if (at < 0) arr.push(id); else arr.splice(at, 0, id);
    _packsDraft.order = arr;
  }
  // Which installed Style row a drop at clientY lands before (null = append to end).
  /** @param {HTMLElement} container @param {number} clientY */
  function _packRowUnder(container, clientY) {
    const rows = [...container.querySelectorAll('.virtuoso_lab-pack-row:not(.is-core)')];
    for (const r of rows) { const box = r.getBoundingClientRect(); if (clientY < box.top + box.height / 2) return r.dataset.packId; }
    return null;
  }
  function _syncPackMoveButtons() {
    const toInst = $('virtuoso_lab-packs-to-installed');
    const toAvail = $('virtuoso_lab-packs-to-available');
    if (toInst) toInst.disabled = !(_packsSel && _packsSel.col === 'available');
    if (toAvail) toAvail.disabled = !(_packsSel && _packsSel.col === 'installed');
  }
  // ── Session-end summary ("Last session" card in the P sheet) ────────────────
  // A calm, dismissible mirror of the run that just ended — what you practised,
  // time on the instrument, tempo-tier reached, streak. Descriptive + gained-only
  // (no score/accuracy/rank); meter-green only for a freshly-cleared tier. See
  // docs/plugin/design-system.md §13/§14. Inputs are controlled internal strings.
  function sessionSummaryCardHtml() {
    const s = _lastEndedSession; if (!s) return '';
    const mins = Math.floor(s.duration_ms / 60000), secs = Math.round((s.duration_ms % 60000) / 1000);
    const dur = `${mins}:${String(secs).padStart(2, '0')}`;
    const sk = s.scale ? `${s.key || ''} ${String(s.scale).replace(/_/g, ' ')}`.trim() : '';
    let tierLine = '';
    if (s.tierCleared && s.clearedTier != null) {
      tierLine = `<div class="virtuoso_lab-virtuoso_lab_vir-cleared">▲ New tier cleared — ${TIER_LABELS[s.clearedTier] || ('Tier ' + (s.clearedTier + 1))}</div>`;
    } else if (s.mode === 'pathway' && s.bpm_tier != null && s.bpm_tier >= 0) {
      tierLine = `<div class="virtuoso_lab-virtuoso_lab_vir-line">Reached ${TIER_LABELS[s.bpm_tier] || ('Tier ' + (s.bpm_tier + 1))}${s.bpm ? ` · ${s.bpm} BPM` : ''}</div>`;
    } else if (s.bpm) {
      tierLine = `<div class="virtuoso_lab-virtuoso_lab_vir-line">${s.bpm} BPM</div>`;
    }
    const streakLine = s.streak > 0
      ? `<div class="virtuoso_lab-virtuoso_lab_vir-line">${s.streak === 1 ? 'Streak started — day 1' : `Day ${s.streak} streak`}</div>`
      : '';
    // Depth-ladder credit (Phase 9 Slice 5) — gained-only, surfaced from
    // _lastEndedSession.depth = { xpGained, travelKey, travelRung } | null. The
    // Travel-rung flip is a genuine clear (meter-green); a first clean run in a new
    // key is neutral progress; XP is a calm readout. Null in Off mode → nothing.
    const d = s.depth;
    let depthLine = '';
    if (d && d.travelRung) depthLine = `<div class="virtuoso_lab-virtuoso_lab_vir-cleared">▲ Travel rung cleared — it travels now</div>`;
    else if (d && d.travelKey) depthLine = `<div class="virtuoso_lab-virtuoso_lab_vir-line">New ground — first clean run in ${d.travelKey}</div>`;
    const xpLine = (d && d.xpGained > 0) ? `<div class="virtuoso_lab-virtuoso_lab_vir-line">+${d.xpGained} XP</div>` : '';
    // Proof-loop (flagged, pilot): a competency CLAIM replaces the generic tier line —
    // ONLY when something was actually proven — plus a Copy-the-card affordance.
    let proofLine = '', copyBtn = '';
    if (s.proof) {
      // Kind-aware claim: 'guide_tones' leads with the MUSICAL win (you connected the
      // changes), then the transfer names the device; 'tempo' is the completion claim.
      const claim = s.proof.kind === 'guide_tones'
        ? `✓ You proved: ${s.proof.label} — you connected the changes at ${s.proof.tierName} tempo`
        : `✓ You proved: ${s.proof.label} holds at ${s.proof.tierName} tempo`;
      const sub = s.proof.kind === 'guide_tones'
        ? `Your line voice-led to the guide tones (3rd &amp; 7th)${s.proof.progression ? ` through the ${s.proof.progression}` : ''}. ${s.proof.transfer || ''}`.trim()
        : (s.proof.transfer || '');
      proofLine = `<div class="virtuoso_lab-virtuoso_lab_vir-cleared">${claim}</div>` +
        (sub ? `<div class="virtuoso_lab-virtuoso_lab_vir-sub virtuoso_lab-virtuoso_lab_vir-transfer">${sub}</div>` : '');
    }
    // Tier C: the cooperative share card is offered for ANY shareworthy run (a tier/
    // depth flip, a completed Workout, a new badge — not only the proof pilot).
    copyBtn = shareRowHtml();   // Copy card + Save — every run (incl. Jam's descriptive card)
    return `<div class="virtuoso_lab-progress-sheet-section virtuoso_lab-virtuoso_lab_vir-card">` +
      `<div class="virtuoso_lab-virtuoso_lab_vir-head"><h4>Last session</h4>` +
      `<button type="button" class="virtuoso_lab-virtuoso_lab_vir-dismiss" data-act="dismiss-summary" title="Dismiss" aria-label="Dismiss last-session card">✕</button></div>` +
      `<div class="virtuoso_lab-virtuoso_lab_vir-what">${s.displayName}</div>` +
      (sk ? `<div class="virtuoso_lab-virtuoso_lab_vir-sub">${sk}</div>` : '') +
      `<div class="virtuoso_lab-virtuoso_lab_vir-line">Practiced ${dur}</div>` +
      (s.proof ? proofLine : tierLine) + depthLine + xpLine + streakLine + copyBtn +
      `</div>`;
  }
  // Auto-present the card on a notable end (a tier cleared, or a real ≥20s run) by
  // opening P; for short blips just refresh so the card is ready when P next opens.
  function presentSessionSummary() {
    renderProgressSheet();
    // Deliberate ends (the Stop button / a finite run completing) pop the
    // RESULTS modal. Sideways stops stay quiet — and JAM never judges: a
    // deliberate Jam stop must not pop a graded % (mirror, not judge; the
    // 2026-06-06 panel caught this leaking through the custom-mode path).
    if (_lastEndedSession && _deliberateStop) {
      if (_lastEndedSession.jam) showJamRecap(_lastEndedSession);   // J-3: warm no-score jam mirror (never the graded modal)
      else showResultsModal(_lastEndedSession);
    }
  }
  // ── End-of-run RESULTS modal (redesigned 2026-06-06, three-lane panel) ──────
  // Player-first hierarchy: VERDICT (earned only) → the % readout (always
  // neutral — meter-green belongs to cleared things, never to a number) → the
  // inline PROGRESS strip (mini rung-ladder, gained-only deltas, ONE recognizer
  // line) → practiced → "▸ Details" (the detection diagnostics, demoted NEVER
  // deleted — the DapperTap instrument; its open state persists for dev use) →
  // a close-and-arm CTA row (nothing autoplays). Three outcomes: earned (one
  // hero, meter-green edge), ordinary (% leads, forward signpost), rough
  // (encouraging, optional step-down, no red). Honest empty states never
  // celebrate. Numbers stay RAW (>100% = the known counting nit, visible).
  // Reuses the packs-modal overlay + cheat-card chrome; never touches Escape.
  /** @param {string | null} pwId */
  function jamStyleForPathway(pwId) {
    if (!pwId) return null;
    if (String(pwId).startsWith('blues')) return 'blues';
    const band = PATHWAY_BANDS.find(b => Array.isArray(b.pathways) && b.pathways.includes(pwId));
    if (band && band.kind === 'style') {
      const sid = band.id.replace(/^style_/, '');
      if (STYLE_PALETTES[sid]) return sid;
    }
    return null;
  }
  // ── Scorecard hero visuals (panel 2026-06-12; market + gamification co-chairs) ──
  // Routed by what the run's data supports (the instrument lanes' rule): a run
  // that MOVED on the neck (≥5 active cells) draws the hybrid heatmap — ink =
  // notes you landed, warm amber = spots to revisit, hollow = not judged; NEVER
  // red (a new --virtuoso_lab_vir-heat token, not --virtuoso_lab_vir-danger). A one-cell groove run with
  // enough timing samples draws the per-bar lean strip instead (felt-hold
  // vocabulary; per-bar medians, the pocket band drawn slightly behind zero).
  // Both are calm static canvas readouts — the verdict stays the modal's lead.
  function _heroColors() {
    const c = { text: '#e2e8f0', dim: '#cbd5e1', faint: '#64748b', border: '#334155', heat: '#f0a050', ok: '#22c55e' };
    try {
      const cs = getComputedStyle(/** @type {Element} */ ($('virtuoso_lab-root')));
      /** @param {string} v @param {keyof typeof c} k */
      const pick = (v, k) => { const x = cs.getPropertyValue(v).trim(); if (x) c[k] = x; };
      pick('--virtuoso_lab_vir-text', 'text'); pick('--virtuoso_lab_vir-text-faint', 'faint'); pick('--virtuoso_lab_vir-border', 'border'); pick('--virtuoso_lab_vir-heat', 'heat');
    } catch (_) {}
    return c;
  }
  /** @param {HTMLCanvasElement | null} canvas @param {import('./src/types/results-data.js').HeatSnapshot | null} heat */
  function drawHeatmapHero(canvas, heat) {
    if (!canvas || !heat) return;
    const C = _heroColors();
    const rows = Math.max(1, (heat.opens || []).length || 6);
    const act = heat.cells.filter(c => c.hit + c.miss + c.ex > 0);
    if (!act.length) return;
    let lo = Math.max(0, Math.min(...act.map(c => c.f)) - 1), hi = Math.max(...act.map(c => c.f)) + 1;
    if (lo === 1) lo = 0;   // the nut is context — include it when the window touches fret 1
    const cols = hi - lo + 1;
    const padL = 26, padR = 8, padT = 6, padB = 16;
    const cssH = rows * 16 + padT + padB;
    canvas.style.height = cssH + 'px';
    const dpr = window.devicePixelRatio || 1, rect = canvas.getBoundingClientRect();
    const pxW = Math.max(1, Math.floor(rect.width * dpr)), pxH = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== pxW || canvas.height !== pxH) { canvas.width = pxW; canvas.height = pxH; }
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width;
    ctx.clearRect(0, 0, W, cssH);
    // Cap the cell width so a narrow window (a 3-fret box drill) doesn't smear
    // into wall-to-wall slabs; the capped grid centers in the available span.
    const ch = 16, cw = Math.min(34, (W - padL - padR) / cols);
    const gridX = padL + Math.max(0, ((W - padL - padR) - cw * cols) / 2);
    /** @param {number} f */
    const xOf = f => gridX + (f - lo) * cw;
    /** @param {number} s */
    const yOf = s => padT + (rows - 1 - s) * ch;   // s=0 (lowest string) at the bottom
    const maxHit = Math.max(1, ...heat.cells.map(c => c.hit));
    const byKey = new Map(heat.cells.map(c => [c.s + '|' + c.f, c]));
    for (let s = 0; s < rows; s++) for (let f = lo; f <= hi; f++) {
      const c = byKey.get(s + '|' + f);
      const x = xOf(f) + 1, y = yOf(s) + 1, w = cw - 2, h = ch - 2;
      if (!c || (c.hit + c.miss + c.ex) === 0) continue;          // un-visited = silent (never "strength")
      if (c.hit + c.miss === 0) {                                  // judged-exempt only → hollow outline
        ctx.strokeStyle = C.faint; ctx.globalAlpha = 0.55; ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.globalAlpha = 1;
        continue;
      }
      const missRate = c.miss / (c.hit + c.miss);
      if (c.miss >= 2 && missRate >= 0.34) {                       // attention: warm amber by miss rate
        ctx.fillStyle = C.heat; ctx.globalAlpha = 0.35 + 0.55 * Math.min(1, missRate);
      } else {                                                     // landed: ink by hit density
        ctx.fillStyle = C.text; ctx.globalAlpha = 0.22 + 0.58 * Math.min(1, c.hit / maxHit);
      }
      ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
    }
    // The nut + frame
    if (lo === 0) { ctx.strokeStyle = C.dim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xOf(1) - 0.5, padT); ctx.lineTo(xOf(1) - 0.5, padT + rows * ch); ctx.stroke(); }
    // String names (left) + fret numbers (bottom, decimated when wide)
    ctx.fillStyle = C.faint; ctx.font = '9px ' + (getComputedStyle(document.body).getPropertyValue('--virtuoso_lab_vir-mono') || 'monospace');
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const opens = heat.opens || [];
    for (let s = 0; s < rows; s++) ctx.fillText(opens[s] != null ? pcName(opens[s] % 12) : String(s), gridX - 5, yOf(s) + ch / 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const step = cols > 12 ? 3 : cols > 7 ? 2 : 1;
    for (let f = Math.max(1, lo); f <= hi; f += step) ctx.fillText(String(f), xOf(f) + cw / 2, padT + rows * ch + 3);
  }
  /** @param {HTMLCanvasElement | null} canvas @param {import('./src/types/results-data.js').LeanSnapshot | null} lean */
  function drawLeanStripHero(canvas, lean) {
    if (!canvas || !lean || !lean.bars.length) return;
    const C = _heroColors();
    const cssH = 84;
    canvas.style.height = cssH + 'px';
    const dpr = window.devicePixelRatio || 1, rect = canvas.getBoundingClientRect();
    const pxW = Math.max(1, Math.floor(rect.width * dpr)), pxH = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== pxW || canvas.height !== pxH) { canvas.width = pxW; canvas.height = pxH; }
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width, padL = 30, padR = 8, padT = 8, padB = 14;
    ctx.clearRect(0, 0, W, cssH);
    const innerH = cssH - padT - padB, midY = padT + innerH / 2;
    const SCALE = 60;                                              // ±60 ms full-scale
    /** @param {number} ms */
    const yOf = ms => midY - (Math.max(-SCALE, Math.min(SCALE, ms)) / SCALE) * (innerH / 2) * -1;   // late (+) sits BELOW the line
    // The pocket band: slightly BEHIND the beat reads as IN the pocket (bass
    // grammar) — early(−8) … late(+20).
    ctx.fillStyle = C.ok; ctx.globalAlpha = 0.10;
    ctx.fillRect(padL, Math.min(yOf(-8), yOf(20)), W - padL - padR, Math.abs(yOf(20) - yOf(-8)));
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, midY + 0.5); ctx.lineTo(W - padR, midY + 0.5); ctx.stroke();
    const bars = lean.bars, n = bars.length;
    const bw = (W - padL - padR) / n;
    for (let k = 0; k < n; k++) {
      const b = bars[k];
      const x = padL + k * bw + bw / 2;
      const y = yOf(b.lean);
      const half = Math.max(2, Math.min(innerH / 2, Math.abs(b.jit) / 2 * (innerH / 2) / SCALE));
      const inPocket = b.lean >= -8 && b.lean <= 20;
      ctx.strokeStyle = inPocket ? C.text : C.heat;
      ctx.globalAlpha = inPocket ? 0.8 : 0.95;
      ctx.lineWidth = Math.max(2, Math.min(6, bw * 0.3));
      ctx.beginPath(); ctx.moveTo(x, y - half); ctx.lineTo(x, y + half); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Axis words — the readable promise (rush above, drag below), bar count.
    ctx.fillStyle = C.faint; ctx.font = '9px ' + (getComputedStyle(document.body).getPropertyValue('--virtuoso_lab_vir-mono') || 'monospace');
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('rush', 2, padT + 5); ctx.fillText('drag', 2, cssH - padB - 4);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const step = n > 16 ? 4 : n > 8 ? 2 : 1;
    for (let k = 0; k < n; k += step) ctx.fillText(String(bars[k].i + 1), padL + k * bw + bw / 2, cssH - padB + 3);
  }
  // The hero chooser + its caption/stat copy. Returns { html, draw } or null.
  /** @param {Partial<import('./src/types/results-data.js').ScoreSummary>} r @param {Partial<import('./src/types/results-data.js').RunInfo> | null} info @param {{isWorkout: boolean, isFelt: boolean, rough: boolean, judged: boolean}} flags */
  function buildResultsHero(r, info, flags) {
    if (flags.isWorkout || flags.isFelt || flags.rough || !flags.judged) return null;
    if ((r.judgedPassed || 0) < 8) return null;
    if (_downshiftChipShown) return null;    // one nudge per run — the chip already spoke
    /** @param {unknown} t */
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const heat = info && info.heat, lean = info && info.leanBars;
    const active = heat ? heat.cells.filter(c => c.hit + c.miss > 0) : [];
    if (heat && active.length >= 5) {
      const frets = active.map(c => c.f);
      const hasEx = heat.cells.some(c => c.ex > 0 && c.hit + c.miss === 0);
      const cap = `Where you played — frets ${Math.min(...frets)}–${Math.max(...frets)} · ink = landed · amber = revisit${hasEx ? ' · hollow = not judged' : ''}`;
      // ONE quiet diagnostic row: finger first (names a mechanic), else the
      // worst string crossing (guitar-pedagogy's ranking).
      let stat = '';
      const fgTop = Object.entries(heat.fgMiss || {}).sort((a, b) => b[1] - a[1])[0];
      const trTop = Object.entries(heat.transMiss || {}).sort((a, b) => b[1] - a[1])[0];
      if (fgTop && fgTop[1] >= 3 && fgTop[1] / Math.max(1, heat.missTotal) >= 0.4) {
        /** @type {Record<string, string>} */
        const names = { 1: '1st-finger', 2: '2nd-finger', 3: '3rd-finger', 4: 'pinky' };
        stat = `Most missed: ${names[fgTop[0]]} notes (${fgTop[1]} of ${heat.missTotal})`;
      } else if (trTop && trTop[1] >= 3) {
        const [a, b] = trTop[0].split('>').map(Number);
        /** @param {number} i */
        const nm = i => heat.opens[i] != null ? pcName(heat.opens[i] % 12) : String(i);
        stat = `Most missed crossing: ${nm(a)}→${nm(b)} string`;
      }
      return {
        html: `<div class="virtuoso_lab-results-hero"><canvas id="virtuoso_lab-results-hero-cv" role="img" aria-label="${esc(cap)}"></canvas>` +
              `<div class="virtuoso_lab-results-hero-cap">${esc(cap)}</div>` +
              (stat ? `<div class="virtuoso_lab-results-hero-stat">${esc(stat)}</div>` : '') + `</div>`,
        draw: () => drawHeatmapHero($('virtuoso_lab-results-hero-cv'), heat),
      };
    }
    if (lean && lean.bars.length >= 4 && (info.leanN || 0) >= 16) {
      const m = info.leanMs || 0;
      const word = (m >= -8 && m <= 20) ? 'In the pocket' : m < -8 ? 'Rushing' : 'Dragging';
      const cap = `Your pocket, bar by bar — ${word.toLowerCase()}${Math.abs(m) > 8 ? ` (~${Math.abs(m)}ms ${m < 0 ? 'ahead' : 'behind'})` : ''}`;
      let stat = '';
      if (lean.chg && Math.abs(lean.chg.med) >= 12) {
        stat = `You ${lean.chg.med < 0 ? 'rush' : 'sit late on'} the first beat after a change by ~${Math.abs(lean.chg.med)}ms`;
      }
      return {
        html: `<div class="virtuoso_lab-results-hero"><canvas id="virtuoso_lab-results-hero-cv" role="img" aria-label="${esc(cap)}"></canvas>` +
              `<div class="virtuoso_lab-results-hero-cap">${esc(cap)}</div>` +
              (stat ? `<div class="virtuoso_lab-results-hero-stat">${esc(stat)}</div>` : '') + `</div>`,
        draw: () => drawLeanStripHero($('virtuoso_lab-results-hero-cv'), lean),
      };
    }
    return null;
  }
  // ── PR 1.3 · the prescriptive coach loop ────────────────────────────────────
  // The DESCRIPTIVE diagnostics (the heatmap/lean hero + the fault stat lines)
  // name WHAT happened; this names the FIX — ONE next drill to run, chosen from
  // the already-computed verdict + geometry data (heat.fgMiss / transMiss,
  // leanMs, nearMiss, the bass felt verdict). Display-only, downstream-only: it
  // re-reads the same signals the judge already produced and never re-judges
  // (consume-the-host-judge). The prescription is always a REAL Ladder rung the
  // player owns off the screen — teach the fix, never fake a score. The fault→
  // drill table is instrument-aware (guitar vs bass rungs) and never prescribes
  // the rung you just ran (falls to its sibling). Returns { why, pathwayId } | null.
  /** @param {import('./src/types/results-data.js').RunSummary | null} s @param {Partial<import('./src/types/results-data.js').ScoreSummary>} r @param {Partial<import('./src/types/results-data.js').RunInfo> | null} info */
  function buildCoachRx(s, r, info) {
    if (!info || !s) return null;
    if (s.jam || s.mode === 'session') return null;   // Jam is a mirror; a Workout has no single fault
    if (_downshiftChipShown) return null;             // the mid-run downshift chip already nudged — don't stack two (learning-design 2026-07-14: a finger fault at a too-high tempo is a ceiling problem, not a weak finger)
    const felt = s.felt;
    if ((r.judgedPassed || 0) < 8 && !(felt && felt.verdict)) return null;
    const isBass = /^bass/.test((activeBundle && activeBundle.config && activeBundle.config.stringSetup) || '');
    const curPw = s.mode === 'pathway' ? s.pathway_id : null;
    const candidates = coachRxCandidates({ isBass, curPw, info, felt });
    if (!candidates.length) return null;
    // Anti-thrash hysteresis: keep the player on ONE fix across runs. Persist the
    // prescribed focus per spec (mode + rung), and prefer last run's focus if it
    // still trips a threshold — the pure applyCoachHysteresis decides.
    const key = `${s.mode || ''}:${s.pathway_id || s.practice_type || ''}`;
    /** @type {Record<string, import('./src/types/results-data.js').CoachFocus | null>} */
    let store = {}; try { store = JSON.parse(localStorage.getItem('virtuoso_lab.coach_focus') || '{}'); } catch (_) {}
    const { chosen, focus } = applyCoachHysteresis(candidates, store[key] || null);
    try { store[key] = focus; localStorage.setItem('virtuoso_lab.coach_focus', JSON.stringify(store)); } catch (_) {}
    return chosen;
  }
  // PR 1.4 · localize a timing fault to the worst bar-region (not the run median).
  // Reads the per-bar lean strip the scorer already snapshots (leanBars.bars =
  // [{ i, lean, n }], i = 0-based bar). Returns { from, to, label } (1-based bar
  // numbers) or null when nothing is clearly off in the fault direction, or when
  // the "region" is basically the whole run (a GLOBAL lean — the generic copy
  // reads better than "bars 1–8"). Pure. `rushing` = the fault direction.
  /** @param {import('./src/types/results-data.js').LeanSnapshot | null | undefined} leanBars @param {boolean} rushing */
  function worstLeanBars(leanBars, rushing) {
    if (!leanBars || !Array.isArray(leanBars.bars)) return null;
    const bars = leanBars.bars.filter(b => (b.n || 0) >= 2);   // 1-sample bars are noise
    if (bars.length < 3) return null;
    /** @param {import('./src/types/results-data.js').LeanBar} b */
    const score = b => (rushing ? -b.lean : b.lean);           // fault-direction magnitude (ms)
    let worst = bars[0];
    for (const b of bars) if (score(b) > score(worst)) worst = b;
    if (score(worst) < 20) return null;                        // nothing clearly off this way
    const thr = Math.max(15, score(worst) * 0.6);
    const hot = new Set(bars.filter(b => score(b) >= thr).map(b => b.i));
    let lo = worst.i, hi = worst.i;
    while (hot.has(lo - 1)) lo--;
    while (hot.has(hi + 1)) hi++;
    const inRegion = bars.filter(b => b.i >= lo && b.i <= hi).length;
    if (inRegion >= bars.length * 0.75) return null;           // whole-run lean, not localized
    const from = lo + 1, to = hi + 1;
    return { from, to, label: from === to ? `bar ${from}` : `bars ${from}–${to}` };
  }
  // The PURE fault→drill mapping (no DOM / no closure state) — the durable IP of
  // the coach loop, unit-tested via the __virtuoso_labCoach debug hook. Returns ALL
  // faults that trip their threshold, in priority order (each tagged with a
  // `fault` category so the hysteresis layer can keep the player on one fix).
  /** @param {import('./src/types/results-data.js').CoachContext | null} ctx @returns {import('./src/types/results-data.js').CoachCandidate[]} */
  function coachRxCandidates(ctx) {
    const { isBass, curPw, info, felt } = ctx || {};
    if (!info) return [];
    // Never send them back to the rung they just ran — fall to its sibling.
    /** @param {string} primary @param {string} alt */
    const pick = (primary, alt) => (primary !== curPw ? primary : (alt && alt !== curPw ? alt : null));
    const out = [];
    const heat = info.heat;
    if (heat && heat.missTotal >= 3) {
      // 1 · a fretting finger the hand keeps dropping (names a mechanic — the
      //     clearest, most fixable fault; guitar-pedagogy's ranking).
      const fgTop = Object.entries(heat.fgMiss || {}).sort((a, b) => b[1] - a[1])[0];
      if (fgTop && fgTop[1] >= 3 && fgTop[1] / Math.max(1, heat.missTotal) >= 0.4) {
        const fn = Number(fgTop[0]);
        /** @type {Record<string, string>} */
        const names = { 1: 'index', 2: 'middle', 3: 'ring', 4: 'pinky' };   // players say index/middle/ring/pinky (bass-pedagogy 2026-07-14)
        // Bass routes a weak PINKY to the dedicated hammer-on/pull-off
        // strengthener; every other finger (and all guitar) to one-finger-per-fret.
        const id = isBass
          ? (fn === 4 ? pick('bass_finger_legato', 'bass_finger_gym') : pick('bass_finger_gym', 'bass_finger_legato'))
          : pick('chromatic_warmup', 'fs_spider_adjacent');
        if (id) {
          // Copy tracks the RESOLVED drill, not the branch (the fallback can flip it).
          const why = id === 'bass_finger_legato'
            ? 'Your pinky slipped most — strengthen it with hammer-ons and pull-offs.'
            : `Your ${names[fn] || 'fretting'} finger slipped most — build one clean finger per fret.`;
          out.push({ fault: 'finger', why, pathwayId: id });
        }
      }
      // 2 · a string crossing the picking hand fumbles.
      const trTop = Object.entries(heat.transMiss || {}).sort((a, b) => b[1] - a[1])[0];
      if (trTop && trTop[1] >= 3) {
        const [a, b] = trTop[0].split('>').map(Number);
        /** @param {number} i */
        const nm = i => (heat.opens[i] != null ? pcName(heat.opens[i] % 12) : String(i));
        // The fault is a fumbled ADJACENT crossing → drill the crossing itself
        // (alternate-picking keeps the pattern unbroken across strings), NOT
        // string-skipping (which trains jumping OVER a string) — guitar-pedagogy
        // 2026-07-14. Bass keeps rh_crossing (raking across adjacent strings).
        const id = isBass ? pick('bass_rh_crossing', 'bass_rh_pulse') : pick('pick_alternate', 'pick_economy');
        if (id) out.push({ fault: 'crossing', why: `The ${nm(a)}→${nm(b)} string crossing tripped you up — drill clean crossing.`, pathwayId: id });
      }
    }
    // 3 · time: leaning off the click (the run median, or the bass felt verdict).
    //     Isolate the timekeeping motor. Guitar → a single palm-muted note (the
    //     pick hand IS the metronome). Bass → the i–m motor drill (bass_rh_pulse,
    //     frets 5–9 — ABOVE the detector floor, so it stays gradable; bass-pedagogy
    //     2026-07-14 flagged bass_root_click's sub-70 Hz open roots as a web
    //     false-miss risk, so root_click is only the sibling fallback).
    const feltWord = (felt && (felt.verdict === 'rushing' || felt.verdict === 'dragging')) ? felt.verdict : null;
    const timingLean = ((info.leanN || 0) >= 12 && Math.abs((/** @type {number} */ (info.leanMs))) >= 30) ? ((/** @type {number} */ (info.leanMs)) < 0 ? 'rushing' : 'dragging') : null;
    const lean = feltWord || timingLean;
    if (lean) {
      const id = isBass ? pick('bass_rh_pulse', 'bass_root_click') : pick('rhy_single_string', 'rhy_subdivision');
      if (id) {
        // PR 1.4: name WHERE it broke down when the lean localizes to a region;
        // else fall back to the whole-run framing ("ahead of / behind the click").
        const region = worstLeanBars(info.leanBars, lean === 'rushing');
        const why = region
          ? `You ${lean === 'rushing' ? 'rushed' : 'dragged'} most in ${region.label} — lock your pulse to the beat.`
          : `You were ${lean === 'rushing' ? 'ahead of' : 'behind'} the click — lock your pulse to the beat.`;
        out.push({ fault: 'timing', why, pathwayId: id });
      }
    }
    // 4 · timing consistency: right pitch, just outside the window, over and over.
    if ((info.nearMiss || 0) >= 4) {
      const id = isBass ? pick('bass_rh_pulse', 'bass_root_click') : pick('rhy_subdivision', 'rhy_single_string');
      if (id) out.push({ fault: 'scatter', why: 'Several notes landed right but just off the beat — tighten the grid.', pathwayId: id });
    }
    return out;
  }
  // The single top prescription (the priority winner) — kept for the smoke suite
  // and any caller that doesn't want hysteresis.
  /** @param {import('./src/types/results-data.js').CoachContext | null} ctx */
  function coachRxFor(ctx) { return coachRxCandidates(ctx)[0] || null; }
  // PR (deferred 1.3 refinement) · anti-thrash hysteresis. Re-diagnosing from
  // scratch every run can flip the prescribed focus finger→timing→crossing so the
  // player never stays on one fix long enough to land it (learning-design
  // 2026-07-14: "load-bearing for the gating"). So if last run's focus STILL trips
  // a threshold this run, keep reinforcing it — for up to 2 consecutive runs —
  // before letting a new top fault take over. Pure: (candidates, prevFocus) →
  // { chosen, focus }. prevFocus = { cat, streak } | null.
  /** @param {import('./src/types/results-data.js').CoachCandidate[] | null} candidates @param {import('./src/types/results-data.js').CoachFocus | null} prevFocus */
  function applyCoachHysteresis(candidates, prevFocus) {
    if (!candidates || !candidates.length) return { chosen: null, focus: prevFocus || null };
    const top = candidates[0];
    const held = prevFocus && prevFocus.cat !== top.fault && (prevFocus.streak || 0) < 2
      ? candidates.find(c => c.fault === prevFocus.cat) : null;
    if (held) return { chosen: held, focus: { cat: held.fault, streak: ((/** @type {import('./src/types/results-data.js').CoachFocus} */ (prevFocus)).streak || 0) + 1 } };
    const streak = (prevFocus && prevFocus.cat === top.fault) ? (prevFocus.streak || 0) + 1 : 0;
    return { chosen: top, focus: { cat: top.fault, streak } };
  }
  /** @param {import('./src/types/results-data.js').CoachCandidate | null} rx */
  function coachRxHtml(rx) {
    if (!rx || !PATHWAYS[rx.pathwayId]) return '';
    /** @param {unknown} t */
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<button type="button" class="virtuoso_lab-results-coach" id="virtuoso_lab-results-coach-go" data-pw="${rx.pathwayId}">`
      + `<span class="virtuoso_lab-results-coach-lead">Practice next</span>`
      + `<span class="virtuoso_lab-results-coach-why">${esc(rx.why)}</span>`
      + `<span class="virtuoso_lab-results-coach-cta">${esc(PATHWAYS[rx.pathwayId].label)} →</span>`
      + `</button>`;
  }
  // ── PR 1.5 · Bass Pocket-Diagnosis ──────────────────────────────────────────
  // A bass feltGate run shows only the verdict WORD (Dragging/Settling/Locked) —
  // buildResultsHero returns null for felt runs, so the three numbers the felt
  // engine already computes (leanMs/driftMs/jitterMs) are dropped. The single word
  // conflates distinct pocket faults with DIFFERENT fixes: a steady lag (relax /
  // anticipate) vs a DRIFT across the phrase (a tempo-stability problem — you're
  // speeding up or slowing down) vs loose JITTER (not tight yet). This names the
  // dominant one in a sentence, bucketed the SAME way feltHoldAnalyze picks the
  // verdict (drift → lean → jitter). Descriptive + a light cue; never a score.
  // Pure (takes a felt object); bass-pedagogy validated 2026-07-14. { text, tone }.
  /** @param {import('./src/types/results-data.js').FeltAnalysis | null} felt */
  function buildPocketDiagnosis(felt) {
    if (!felt) return null;
    const v = felt.verdict, lean = felt.leanMs || 0, drift = felt.driftMs || 0, jit = felt.jitterMs || 0;
    if (v === 'locked') return { text: `Dead in the pocket — steady within ±${Math.abs(jit)}ms.`, tone: 'good' };
    // DRIFT first (the worst — a moving pulse you can't feel): a tempo trend.
    // The fix splits by direction (bass-pedagogy 2026-07-14): slowing = the
    // subdivision is decaying (keep the grid alive); speeding = chasing the beat.
    if (Math.abs(drift) >= FELT.DRIFT_FAIL) {
      const fix = drift > 0
        ? 'Anchor to the click and keep the subdivision moving between hits.'
        : "Anchor to the click — don't chase it, let it come to you.";
      return { text: `Your time ${drift > 0 ? 'slips later' : 'creeps ahead'} across the phrase (~${Math.abs(drift)}ms) — you're ${drift > 0 ? 'slowing down' : 'speeding up'} as it goes. ${fix}`, tone: 'work' };
    }
    // LEAN: a steady offset (the kinder fix — consistent, just off-center).
    if (lean >= FELT.LEAN_BEHIND || lean <= FELT.LEAN_AHEAD) {
      const behind = lean > 0;
      return { text: `You sit ~${Math.abs(lean)}ms ${behind ? 'behind' : 'ahead of'} the beat — consistent, just off-center. ${behind ? 'Lean in a hair earlier.' : 'Relax and let the click come to you.'}`, tone: 'work' };
    }
    // JITTER (settling / loose-but-centered): the pocket's there, not tight yet.
    if (v === 'settling' || felt.untight) {
      return { text: `Your placement is uneven (±${Math.abs(jit)}ms) — the pocket's there, not locked yet. Keep working it, no rush.`, tone: 'work' };
    }
    return null;
  }
  // Debug/test hook: the pure mappings, exposed for the smoke suite (immune to the
  // "smoke mocks the verifier" blind spot — they take fixtures directly). `buildCoachRx`
  // + `lastEndedSession` additionally let the suite drive a REAL run and assert the
  // _lastEndedSession → curPw snapshot seam (the field-drop the pure hooks couldn't catch).
  if (typeof window !== 'undefined') window.__virtuoso_labCoach = { coachRxFor, coachRxCandidates, applyCoachHysteresis, coachRxHtml, buildPocketDiagnosis, buildCoachRx, lastEndedSession: () => _lastEndedSession };
  // ── J-3 end-of-jam reflection (warm, NO score — mirror not judge) ───────────
  // A deliberate Jam stop opens the SAME modal shell as the results card, but
  // with descriptive content only: time jammed, how many notes, the tones you
  // moved through, over what style/key. NO %, rank, or verdict (the panel
  // fence). Reuses closeResultsModal + the overlay/Esc close wiring.
  /** @param {import('./src/types/results-data.js').RunSummary | null} s */
  function showJamRecap(s) {
    const root = $('virtuoso_lab-root'), body = $('virtuoso_lab-results-body'), title = $('virtuoso_lab-results-title');
    if (!root || !body) return;
    const m = _jamMirror;
    /** @param {unknown} x */
    const esc = (x) => String(x).replace(/[&<>"]/g, c => (/** @type {Record<string, string>} */ ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]));
    const ms = (s && s.duration_ms) || 0;
    const mins = Math.floor(ms / 60000), secs = Math.round((ms % 60000) / 1000);
    const dur = ms >= 1000 ? `${mins}:${String(secs).padStart(2, '0')}` : 'a moment';
    const style = (s && s.style) || (STYLE_PALETTES[currentJamStyleId()] || {}).label || 'your style';
    const key = (($('virtuoso_lab-jam-key') || {}).value) || 'A';
    const prog = (s && s.progression) ? jamProgressionLabel(s.progression) : jamProgressionLabel((($('virtuoso_lab-jam-prog') || {}).value) || '');
    const noteCount = m ? m.noteCount : 0;
    const pcs = m ? [...m.pcs].sort((a, b) => a - b).map(pcName) : [];
    const toneList = pcs.length ? pcs.join(' · ') : 'No pitch was detected.';
    const analysis = noteCount > 0 ? jamRecapAnalysisLines() : [];
    const analysisHtml = analysis.map(line => `<div class="virtuoso_lab-jam-recap-line">${esc(line)}</div>`).join('');
    // Gold rung (career passports): the comb-verified conformity readout,
    // always shown when notes were confirmed — observability before gating —
    // and the mint moment when the whole bar clears (gained-only).
    const gold = goldEvaluate(s);
    let goldHtml = '';
    if (gold) {
      const ear = gold.verifier === 'comb'
        ? 'verified by the harmonic-comb ear'
        : 'heard by the browser ear — Gold listens through the desktop verifier';
      // Descriptive N-of-M counts, the recap's own convention — a mirror line,
      // not a score-to-beat (percent-vs-threshold framing stays out of the jam).
      goldHtml = `<div class="virtuoso_lab-jam-recap-line">Verified notes: <b>${gold.inKey} of ${gold.confirmed}</b> sat in the key, <b>${gold.inChord}</b> on chord tones, played over <b>${gold.chordHops}</b> chord change${gold.chordHops === 1 ? '' : 's'} <span class="virtuoso_lab-jam-recap-sub">(${esc(ear)})</span></div>`;
      if (gold.met) {
        const styleId = currentJamStyleId();
        const minted = goldStore(styleId, gold);
        // Gained-only, like every other emit in this file: only an actual mint
        // reaches the bus/relay — a repeat gold-bar jam is recap-only.
        if (minted) emitProgress('gold_improv', styleId, {
          style: styleId, durationMs: gold.durationMs,
          inKeyPct: Math.round(gold.inKeyPct * 100) / 100,
          chords: gold.chordHops, pcCount: gold.pcCount, verifier: gold.verifier,
        });
        goldHtml += `<div class="virtuoso_lab-jam-recap-line virtuoso_lab-jam-recap-gold">🏅 <b>GOLD</b> — ${minted ? 'a verified improv: this style\'s gold rung is yours.' : 'another gold-bar jam (already minted).'}</div>`;
      }
    }
    const intentLine = jamIntent ? `<div class="virtuoso_lab-jam-recap-line">Intent: <b>${esc(jamIntent)}</b></div>` : '';
    if (title) title.textContent = 'Jam mirror';
    body.innerHTML =
      `<div class="virtuoso_lab-jam-recap">` +
        `<div class="virtuoso_lab-jam-recap-line">You jammed <b>${esc(dur)}</b> over <b>${esc(style)}</b> in <b>${esc(key)}</b>${prog ? ` · <b>${esc(prog)}</b>` : ''}.</div>` +
        intentLine +
        (noteCount > 0
          ? `<div class="virtuoso_lab-jam-recap-line">${noteCount} notes — you moved through <b>${pcs.length}</b> tone${pcs.length === 1 ? '' : 's'}:</div>`
          : `<div class="virtuoso_lab-jam-recap-line">No pitch was detected, so this stays a form-and-intent recap.</div>`) +
        `<div class="virtuoso_lab-jam-recap-tones">${esc(toneList)}</div>` +
        analysisHtml + goldHtml +
        `<div class="virtuoso_lab-jam-recap-sub">A mirror, never a score. Use the form, intent, tones, and targets as prompts for the next pass.</div>` +
        `<div class="virtuoso_lab-jam-recap-cta">` +
          `<button type="button" class="virtuoso_lab-results-primary" data-act="jam-again">Jam again</button>` +
          `<button type="button" class="virtuoso_lab-results-quiet" data-act="jam-done">Done</button>` +
        `</div>` +
      `</div>`;
    body.querySelector('[data-act="jam-again"]')?.addEventListener('click', () => { closeResultsModal(); jamPlay(); });
    body.querySelector('[data-act="jam-done"]')?.addEventListener('click', closeResultsModal);
    root.classList.add('virtuoso_lab_vir-results-open');
    $('virtuoso_lab-results-modal')?.setAttribute('aria-hidden', 'false');
    body.querySelector('[data-act="jam-again"]')?.focus();
  }
  /** @param {import('./src/types/results-data.js').RunSummary | null} s @property {string} [_autoSig] */
  function showResultsModal(s) {
    const root = $('virtuoso_lab-root'), body = $('virtuoso_lab-results-body'), title = $('virtuoso_lab-results-title');
    if (!root || !body || !s) return;
    const r = s.results || {};
    const info = r.info || null;
    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const mins = Math.floor(s.duration_ms / 60000), secs = Math.round((s.duration_ms % 60000) / 1000);
    const dur = `${mins}:${String(secs).padStart(2, '0')}`;
    const judged = r.judgedPassed > 0;
    const pct = judged ? Math.round((r.hits / r.judgedPassed) * 100) : null;
    // Passive-flip cap (gamification guardrail): a Custom-mode run can flip an
    // unrelated pathway's tier via the ±5 BPM attribution — that flip records
    // (P-sheet) but never takes the hero slot here; only a pathway run's own
    // tier flip is an earned verdict.
    const ownTierFlip = !!(s.tierCleared && s.clearedTier != null && s.mode === 'pathway');
    // A bass FELT-rung run (feltGate): the felt verdict WORD replaces the % entirely
    // (felt-not-scored, Option A — never speed/accuracy as the bass headline).
    const isFelt = !!(s.felt || s.feltResult);
    const feltFlip = !!(s.feltResult && s.feltResult.flip);
    const earned = !!(s.proof || (ownTierFlip && !isFelt) || feltFlip || (s.depth && s.depth.travelRung));
    const rough = judged && pct !== null && pct < 65 && !earned && !isFelt;   // a felt run is never "rough" (no %)
    let xpOff = false; try { xpOff = (progressLoad().mode === 'off'); } catch (_) {}
    // Mastery crest — the card's overall-standing seal (accent-family; stays accent even on an
    // earned/green card, so a cleared run shows BOTH signals). Hidden at rank 0 / XP-Off.
    const _crestEl = $('virtuoso_lab-results-crest');
    if (_crestEl) {
      const _cst = crestState();
      if (_cst.rank) { _crestEl.innerHTML = crestSvg(_cst.rank); _crestEl.title = _cst.label + ' — ' + _cst.desc; _crestEl.hidden = false; }
      else { _crestEl.hidden = true; _crestEl.innerHTML = ''; }
    }
    // Workout RECAP branch (Tier 3): a multi-block Workout has no single grade — the
    // chapter list REPLACES the aggregate % and the verdict slot becomes a
    // descriptive session header (no earned-green edge). Built from s.chapters
    // (descriptive, no per-block scoring). Single-config modes are unaffected.
    const isWorkout = s.mode === 'session' && Array.isArray(s.chapters) && s.chapters.length > 1;
    // The hero visual (panel 2026-06-12): heatmap for runs that moved on the
    // neck, the lean strip for groove runs — suppressed on rough/sparse/felt/
    // Workout runs and whenever the mid-run downshift chip already spoke.
    const hero = buildResultsHero(r, info, { rough, judged, isWorkout, isFelt });
    // The prescriptive coach line (PR 1.3): ONE next drill for the run's dominant
    // fault. Complements the descriptive hero — hero names the fault, this names
    // the fix. Suppressed on Workouts (no single fault) and on an EARNED clear —
    // a clear is the win moment; a "here's what's still wrong, go drill it" button
    // undercuts it and competes with the climb CTA (learning-design 2026-07-14:
    // the climb IS the prescription). Null too when nothing crosses threshold.
    const coachHtml = (isWorkout || earned) ? '' : coachRxHtml(buildCoachRx(s, r, info));

    // 1 · VERDICT slot — earned outcomes only; ONE hero (felt > proof > tier > travel).
    // Bass felt FLIP: the verdict WORD is the hero, tempo demoted (Option A — the
    // marketing + 3-lane call). Settling-or-better cleared the rung; Locked also owns
    // the groove at this tempo. The copy card rides shareBtn (one button).
    let verdict = '';
    if (feltFlip) {
      const word = (s.felt && s.felt.verdict === 'locked') ? 'Locked the pocket' : 'Settled into the pocket';
      verdict = `<div class="virtuoso_lab-virtuoso_lab_vir-cleared virtuoso_lab-results-verdict">✓ ${word} — cleared ${/** @type {import('./src/types/results-data.js').FeltCredit} */ (s.feltResult).tierName}</div>` +
        (/** @type {import('./src/types/results-data.js').FeltCredit} */ (s.feltResult).feltPB ? `<div class="virtuoso_lab-virtuoso_lab_vir-sub virtuoso_lab-virtuoso_lab_vir-transfer">Grooves owned — held Locked to ${/** @type {import('./src/types/results-data.js').FeltCredit} */ (s.feltResult).feltBpm} BPM</div>` : '');
    } else if (s.proof) {
      const claim = s.proof.kind === 'guide_tones'
        ? `✓ You proved: ${s.proof.label} — you connected the changes at ${s.proof.tierName} tempo`
        : `✓ You proved: ${s.proof.label} holds at ${s.proof.tierName} tempo`;
      const psub = s.proof.kind === 'guide_tones'
        ? `Your line voice-led to the guide tones (3rd &amp; 7th)${s.proof.progression ? ` through the ${s.proof.progression}` : ''}. ${s.proof.transfer || ''}`.trim()
        : (s.proof.transfer || '');
      verdict = `<div class="virtuoso_lab-virtuoso_lab_vir-cleared virtuoso_lab-results-verdict">${claim}</div>` +
        (psub ? `<div class="virtuoso_lab-virtuoso_lab_vir-sub virtuoso_lab-virtuoso_lab_vir-transfer">${psub}</div>` : '');
        // (the share card now rides the unified shareRow below — every run)
    } else if (ownTierFlip && !isFelt) {
      verdict = `<div class="virtuoso_lab-virtuoso_lab_vir-cleared virtuoso_lab-results-verdict">▲ Rung cleared — ${TIER_LABELS[/** @type {number} */ (s.clearedTier)] || ('Tier ' + (/** @type {number} */ (s.clearedTier) + 1))}${s.bpm ? ` · ${s.bpm} BPM` : ''}</div>`;
    } else if (s.depth && s.depth.travelRung) {
      verdict = `<div class="virtuoso_lab-virtuoso_lab_vir-cleared virtuoso_lab-results-verdict">▲ Travel rung cleared — it travels now</div>`;
    }

    // 2 · the % readout — ALWAYS neutral color; the sub-line keeps the
    // load-bearing word "judged" + the one-clause exemption disclosure.
    let headline, sub;
    if (judged) {
      headline = `${pct}%`;
      const shownNot = (info && info.total > info.judged) ? ` · ${info.total - info.judged} shown, not judged` : '';
      sub = `<strong>${r.hits}</strong> hit of <strong>${r.judgedPassed}</strong> judged notes${shownNot}`;
    } else if (!r.hadInput) {
      headline = 'Not judged';
      sub = 'No mic input reached the scorer this run — the click was the judge.';
    } else {
      headline = '—';
      sub = 'Mic heard, but no judged notes passed (all content exempt, or the run ended early).';
    }

    // 4 · inline PROGRESS strip — what this run CHANGED (state lives in the
    // P-sheet). Gained-only; in XP-Off only the functional ladder facts remain.
    const stripBits = [];
    if (s.ladder && s.ladder.tiers.length) {
      const rungs = s.ladder.tiers.map((_tier, i) => {
        const clr = i <= /** @type {NonNullable<import('./src/types/results-data.js').RunSummary['ladder']>} */ (s.ladder).highestCleared;
        const isNew = !xpOff && s.tierCleared && i === s.clearedTier;
        return `<span class="virtuoso_lab-results-rung${clr ? ' cleared' : ''}${isNew ? ' rung-new' : ''}">${TIER_LABELS[i] || ('T' + (i + 1))}</span>`;
      }).join('');
      stripBits.push(`<div class="virtuoso_lab-results-ladder">${rungs}</div>`);
    }
    if (!xpOff) {
      const d = s.depth, deltas = [];
      if (d && d.xpGained > 0) deltas.push(`+${d.xpGained} XP`);
      if (s.streak > 0) deltas.push(s.streak === 1 ? 'Streak started — day 1' : `Day ${s.streak}`);
      // Distance-to-next-rung: the descriptive goal-gradient ("12 BPM to Push").
      if (s.ladder && !s.tierCleared && s.bpm != null) {
        const nIdx = (s.ladder.highestCleared ?? -1) + 1;
        if (nIdx < s.ladder.tiers.length && s.ladder.tiers[nIdx] > s.bpm) {
          deltas.push(`${s.ladder.tiers[nIdx] - s.bpm} BPM to ${TIER_LABELS[nIdx] || ('T' + (nIdx + 1))}`);
        }
      }
      if (deltas.length) stripBits.push(`<div class="virtuoso_lab-results-deltas">${deltas.join(' · ')}</div>`);
      // "Best here" — a STANDING TARGET FACT (L&D ruling 2026-06-06): no "today",
      // no "was", no gap — the UI never performs the comparison for the player.
      // Suppressed on rough runs, before 3 same-spec runs, and when today IS the
      // best (the recognizer below carries that, upward).
      if (s.specBest && !rough && !isFelt && s.specBest.runs >= 3 && !s.specBest.isNew) {
        stripBits.push(`<div class="virtuoso_lab-results-deltas">Best here: ${s.specBest.best}%</div>`);
      }
      // ONE recognizer line, accent-colored (a new-best is new ground, not a clear).
      if (s.recognizer && s.recognizer.kind === 'first_clear') {
        stripBits.push(`<div class="virtuoso_lab-results-recog">First clear on ${s.displayName}</div>`);
      } else if (s.recognizer && s.recognizer.kind === 'fastest') {
        stripBits.push(`<div class="virtuoso_lab-results-recog">Fastest clean run — ${s.recognizer.bpm} BPM (was ${s.recognizer.prev})</div>`);
      } else if (s.recognizer && s.recognizer.kind === 'best_pct') {
        stripBits.push(`<div class="virtuoso_lab-results-recog">New best here — ${s.recognizer.pct}% (was ${s.recognizer.prev}%)</div>`);
      } else if (d && d.travelKey) {
        stripBits.push(`<div class="virtuoso_lab-results-recog">New ground — first clean run in ${d.travelKey}</div>`);
      }
      // Tier C — quiet AMBIENT deltas (never the accent recognizer slot, never the
      // hero, never green): a woodshed level-up + any new competency badge(s).
      if (s.levelUp) stripBits.push(`<div class="virtuoso_lab-results-deltas">${s.levelUp.summit ? `${s.levelUp.name} — top of the ladder. The hours keep counting.` : `Reached Level ${s.levelUp.level} — ${s.levelUp.name}`}</div>`);
      if (s.badgesNew && s.badgesNew.length) stripBits.push(`<div class="virtuoso_lab-results-deltas">${s.badgesNew.length === 1 ? 'New badge' : 'New badges'}: ${s.badgesNew.map(b => b.name).join(' · ')}</div>`);
    }
    const strip = stripBits.length ? `<div class="virtuoso_lab-results-strip">${stripBits.join('')}</div>` : '';

    // 6 · ▸ How this run was judged — player language ("name the capability,
    // never the implementation", 2026-06-06 copy round): the rows answer "did
    // you count everything? → why not those? → what was listening?", every
    // exemption phrased as the system's limit, never the player's fault. The
    // dev-verbatim strings (byte-comparable across detection builds) ride as
    // dim mono tails behind the `virtuoso_lab.resultsVerbose` flag, with a Copy
    // diagnostics button — the field-debugging instrument.
    let verbose = false; try { verbose = localStorage.getItem('virtuoso_lab.resultsVerbose') === 'on'; } catch (_) {}
    /** @param {string} t */
    const devTail = (t) => verbose ? ` <span class="virtuoso_lab-results-dev">${t}</span>` : '';
    const rows = [];
    if (judged && r.missed > 0) rows.push(`Missed: <strong>${r.missed}</strong> judged notes`);
    if (info) {
      const exempt = info.total - info.judged;
      if (exempt > 0) {
        rows.push(`Judged: <strong>${info.judged}</strong> of <strong>${info.total}</strong> — the other ${exempt} were shown, not judged:${devTail(`(judged ${info.judged}/${info.total})`)}`);
        if (info.exemptChords) rows.push(`<span class="virtuoso_lab-results-exrow">· <strong>${info.exemptChords}</strong> chord notes — this ear hears one note at a time${devTail('(mono detector)')}</span>`);
        if (info.exemptSubFloor) rows.push(`<span class="virtuoso_lab-results-exrow">· <strong>${info.exemptSubFloor}</strong> notes too low for the mic to hear — play them with the click; they never count against you${devTail(`(&lt; ${DETECTOR_MIN_HZ} Hz floor)`)}</span>`);
        if (info.exemptMuted) rows.push(`<span class="virtuoso_lab-results-exrow">· <strong>${info.exemptMuted}</strong> muted ghost notes — a good mute has no pitch to judge${devTail('(mt, pitch-exempt)')}</span>`);
        if (info.exemptFast) rows.push(`<span class="virtuoso_lab-results-exrow">· <strong>${info.exemptFast}</strong> notes too fast for this ear to certify one-by-one — play them; the judged notes around them carry the proof${devTail(`(ring &lt; ${info.floorMs}ms floor)`)}</span>`);
        if (info.exemptLegato) rows.push(`<span class="virtuoso_lab-results-exrow">· <strong>${info.exemptLegato}</strong> slurred notes — the pick that starts each slur is judged; the slur itself has no attack to time${devTail('(ho/po, pick-frame judged)')}</span>`);
      } else {
        rows.push(`Every note judged: <strong>${info.judged}</strong> of <strong>${info.total}</strong>`);
      }
      if (info.tremoloSpans) rows.push(`<span class="virtuoso_lab-results-exrow">· <strong>${info.tremoloSpans}</strong> tremolo run${info.tremoloSpans === 1 ? '' : 's'} (${info.tremoloNotes} notes) judged as whole runs — in tune over the run is the skill${devTail(`(tr spans, ≥${Math.round(PT_SPAN_RATIO * 100)}% presence)`)}</span>`);
      const earPlayer = String(info.ear || '').indexOf('verifier') === 0
        ? 'chord-aware verifier · single-note for the display meter'
        : 'single-note (the mic hears one pitch at a time)';
      rows.push(`Ear: <strong>${earPlayer}</strong>${devTail(`(${info.ear} · latency anchor ${info.latencyMs != null ? info.latencyMs : Math.round(PT_DETECT_LATENCY * 1000)}ms${info.calMs != null ? `, this run measured ${info.calMs}ms over ${info.calMatched} notes` : ''} · window ±${info.winSingleMs != null ? info.winSingleMs : Math.round(PT_WIN_EARLY * 1000)}ms / chords ±${info.winChordMs != null ? info.winChordMs : 150}ms${info.winInherited ? ' — host tuner' : ''})`)}`);
      // Timing tendency + near-miss (Slice 2, the feel→data converter) —
      // threshold-gated so a centered run says nothing: ≥8 samples and a lean
      // of ≥30ms, or ≥4 near-misses. Descriptive, never scored.
      if ((/** @type {number} */ (info.leanN)) >= 8 && Math.abs((/** @type {number} */ (info.leanMs))) >= 30) {
        rows.push(`Timing leaned <strong>${(/** @type {number} */ (info.leanMs)) > 0 ? 'late' : 'early'}</strong> — about ${Math.abs((/** @type {number} */ (info.leanMs)))}ms ${(/** @type {number} */ (info.leanMs)) > 0 ? 'behind' : 'ahead of'} the click${devTail(`(median dev ${info.leanMs}ms, n=${info.leanN})`)}`);
      }
      if ((/** @type {number} */ (info.nearMiss)) >= 4) {
        rows.push(`<strong>${info.nearMiss}</strong> right-pitch moments landed just outside their timing window — closer than the score shows${devTail('(in-pitch ≤250ms off-window frames)')}`);
      }
      // Sparse-evidence disclosure (L&D ruling): below the grading floor the
      // run advances on completion, and we say so — sparse evidence is no
      // evidence, never a verdict either way.
      if (judged && r.judgedPassed < 8) {
        rows.push(`Only <strong>${r.judgedPassed}</strong> notes were mic-judged this run — too few to grade; cleared on completion${devTail('(< PT_MIN_JUDGED=8 → lenient path)')}`);
      }
    }
    let detailsOpen = false; try { detailsOpen = localStorage.getItem('virtuoso_lab.resultsDetails') === 'open'; } catch (_) {}

    // 7 · CTA row — close-and-arm, never autoplay; CHALLENGE voice (2026-06-06
    // copy round): the dare names the destination ("Take it to 88"), the dim
    // sub-line carries the climb state counting TOWARD the named summit (never
    // "2 left" — destination, not remainder). Per outcome: clear → the dare up;
    // re-running cleared ground → point UP (don't loop the past); not-yet-cleared
    // → "Run it back" with the stake as possibility; rough → no rung-talk, the
    // step-down reframed as the smart move ("Lock it in"); SUMMIT → open the
    // next AXIS (Jam), never a completion readout. Empty states: quiet Done only.
    const hasResult = judged || r.hadInput;
    const jamStyle = jamStyleForPathway(s.pathway_id);
    let primary = null, stepdown = null, secondaryAgain = false;
    const lastIdx = s.ladder ? s.ladder.tiers.length - 1 : -1;
    /** @param {number} i */
    const tname = (i) => TIER_LABELS[i] || ('T' + (i + 1));
    /** @param {number} i */
    const climbSub = (i) => i >= lastIdx ? `${tname(i)} · the top rung` : `${tname(i)} · ${lastIdx - i + 1} rungs to ${tname(lastIdx)}`;
    /** @param {number} i */
    const dareUp = (i) => ({ act: 'next-tier', idx: i, label: `Take it to ${/** @type {NonNullable<import('./src/types/results-data.js').RunSummary['ladder']>} */ (s.ladder).tiers[i]} ▸`, sub: climbSub(i) });
    if (hasResult) {
      const hi = s.ladder ? s.ladder.highestCleared : -1;
      if (rough) {
        primary = { act: 'again', label: 'Run it back ▸' };   // no rung-talk at a rough moment
        // No double-offer: if the mid-run downshift chip already showed this
        // run, the post-run step-down stays quiet (gamification ruling).
        if (s.ladder && s.bpm_tier != null && s.bpm_tier > 0 && !_downshiftChipShown) {
          const dIdx = s.bpm_tier - 1;
          stepdown = { idx: dIdx, label: `Lock it in at ${s.ladder.tiers[dIdx]} ▸` };
        }
      } else if (s.ladder && lastIdx >= 0 && hi >= lastIdx) {
        // SUMMIT — every rung cleared: the destination is playing, not repeating.
        primary = jamStyle
          ? { act: 'jam', label: 'Jam this skill ▸', sub: `${tname(lastIdx)} cleared · the destination is playing` }
          : { act: 'again', label: 'Run it back ▸', sub: `${tname(lastIdx)} cleared` };
        secondaryAgain = !!jamStyle;
      } else if (s.tierCleared && s.clearedTier != null && s.ladder && s.clearedTier + 1 < s.ladder.tiers.length) {
        primary = dareUp(s.clearedTier + 1);
      } else if (s.ladder && s.bpm_tier != null && s.bpm_tier <= hi && hi + 1 < s.ladder.tiers.length) {
        // Re-running already-cleared ground: point UP, demote the rerun.
        primary = dareUp(hi + 1);
        primary.sub = `${tname(s.bpm_tier)} is yours — ${tname(hi + 1)} is next`;
        secondaryAgain = true;
      } else if (s.ladder && s.bpm_tier != null && s.bpm_tier > hi) {
        primary = { act: 'again', label: 'Run it back ▸', sub: `a clean pass clears ${tname(s.bpm_tier)}` };
      } else {
        primary = { act: 'again', label: 'Run it back ▸' };
      }
    }
    /** @param {{act?: string, idx?: number, label: string, sub?: string}} p */
    const btnHtml = (p) => `<span class="cta-dare">${p.label}</span>` + (p.sub ? `<span class="cta-sub">${p.sub}</span>` : '');
    const ctaHtml =
      `<div class="virtuoso_lab-results-cta">` +
      (primary ? `<button type="button" id="virtuoso_lab-results-primary" class="virtuoso_lab-results-primary">${btnHtml(primary)}</button>` : '') +
      (secondaryAgain ? `<button type="button" id="virtuoso_lab-results-again" class="virtuoso_lab-results-quiet">Run it back</button>` : '') +
      (stepdown ? `<button type="button" id="virtuoso_lab-results-stepdown" class="virtuoso_lab-results-quiet">${stepdown.label}</button>` : '') +
      (jamStyle && !rough && !(primary && primary.act === 'jam') ? `<button type="button" id="virtuoso_lab-results-jam" class="virtuoso_lab-results-quiet">Jam this skill</button>` : '') +
      (isWorkout ? `<button type="button" id="virtuoso_lab-results-build" class="virtuoso_lab-results-quiet">Build another</button>` : '') +
      `<button type="button" id="virtuoso_lab-results-done" class="virtuoso_lab-results-quiet">Done</button>` +
      `</div>`;

    // ── Workout recap session HTML (Tier 3) — header + chapter list ─────────────
    // Descriptive: a session header (no earned green) + a per-block chapter list
    // grouped by role so the player sees the arc they traveled. No aggregate %,
    // no per-block %/score — the chapter list IS the readout.
    let sessionHeadHtml = '', chaptersHtml = '';
    if (isWorkout) {
      /** @param {number} sec */
      const fmtMS = (sec) => { const m = Math.floor(sec / 60), x = Math.round(sec % 60); return `${m}:${String(x).padStart(2, '0')}`; };
      /** @param {string | null} role */
      const roleLabel = (role) => (SEGMENT_ROLES[String(role)] && SEGMENT_ROLES[String(role)].label) || (role ? prettyKind(role) : '');
      // Arc line — the distinct roles traveled, in curriculum order.
      /** @type {string[]} */
      const seenRoles = [];
      (/** @type {import('./src/types/results-data.js').Chapter[]} */ (s.chapters)).forEach(c => { if (c.role && !seenRoles.includes(c.role)) seenRoles.push(c.role); });
      seenRoles.sort((a, b) => ((SEGMENT_ROLES[a]?.order ?? 9) - (SEGMENT_ROLES[b]?.order ?? 9)));
      const arc = seenRoles.map(roleLabel).filter(Boolean).join(' → ');
      sessionHeadHtml =
        `<div class="virtuoso_lab-results-session-head">` +
        `<div class="virtuoso_lab-results-session-title">Workout complete</div>` +
        `<div class="virtuoso_lab-results-session-meta">${(/** @type {import('./src/types/results-data.js').Chapter[]} */ (s.chapters)).length} blocks · ${dur} practiced</div>` +
        (arc ? `<div class="virtuoso_lab-results-session-arc">You traveled the arc: ${arc}</div>` : '') +
        `</div>`;
      // Chapter rows, role-divider grouped (a divider when the role changes from the
      // prior row — shows the real sequence). dot/✓ NEVER --virtuoso_lab_vir-meter green.
      /** @type {string | null} */
      let lastRole = null;
      const rows2 = (/** @type {import('./src/types/results-data.js').Chapter[]} */ (s.chapters)).map(c => {
        const out = [];
        if (c.role !== lastRole) { out.push(`<div class="virtuoso_lab-results-chapter-role">${roleLabel(c.role)}</div>`); lastRole = c.role; }
        const color = ROLE_COLORS[String(c.role)] || KIND_COLORS[String(c.kind)] || '#64748b';
        // Added review/2nd-app rows carry their context in the NAME ("Revisited —
        // …") — so suppress the competency sub-line for them (no double-naming).
        // Per-block glyph: ✓ PROVED (earned a real tier flip — the ONE place
        // meter-green is allowed, a cleared competency) > ● played (reached + you
        // sounded it, or no mic this run → default practiced, never shaming a
        // DI/mic-less player) > ○ touched (reached but silent while the mic WAS
        // live elsewhere) > — unreached. Never red.
        const earned = c.earned;
        // A felt block's comp line speaks the POCKET vocabulary (never a %): an
        // earned flip names the verdict word; a non-flip mirrors it descriptively;
        // verdict null (thin evidence / sub-floor) falls back to the competency —
        // no claim is made over evidence the judge didn't have.
        const FELT_ROW = { locked: 'Locked the pocket', settling: 'Settled into the pocket', dragging: 'Dragging — behind the beat', rushing: 'Rushing — ahead of the kick' };
        const comp = earned
          ? (earned.feltVerdict ? `${FELT_ROW[earned.feltVerdict] || 'Held the pocket'} — cleared ${earned.tierName}` : `Cleared ${earned.tierName}`)
          : (c.felt && c.felt.verdict) ? FELT_ROW[c.felt.verdict]
          : (c.felt && c.felt.untight) ? 'Keep working the pocket'
          : (c.added ? '' : (c.competency || ''));
        const touched = c.reached && r.hadInput && !c.hadInput;
        const glyph = earned ? '✓' : (!c.reached ? '—' : (touched ? '○' : '●'));
        const stateCls = earned ? ' is-earned' : (!c.reached ? ' is-unreached' : (touched ? ' is-touched' : ' is-played'));
        out.push(
          `<div class="virtuoso_lab-results-chapter${stateCls}">` +
          `<span class="virtuoso_lab-results-chapter-dot" style="background:${color}"></span>` +
          `<span class="virtuoso_lab-results-chapter-main">` +
          `<span class="virtuoso_lab-results-chapter-name">${c.name || roleLabel(c.role)}</span>` +
          (comp ? `<span class="virtuoso_lab-results-chapter-comp">${comp}</span>` : '') +
          `</span>` +
          `<span class="virtuoso_lab-results-chapter-dur">${fmtMS(c.durSec)}</span>` +
          `<span class="virtuoso_lab-results-chapter-done">${glyph}</span>` +
          `</div>`);
        return out.join('');
      }).join('');
      chaptersHtml = `<div class="virtuoso_lab-results-chapters">${rows2}</div>`;
    }

    // Cooperative share card (Copy card + Save): on EVERY results page, every run —
    // the card is an honest mirror (earned → green ✓; ordinary → descriptive log), so
    // it can't inflate (gamification: the gate moved from the button to the content).
    const shareBtn = shareRowHtml();

    // Bass FELT body (Option A): the verdict WORD replaces the % entirely. A flip
    // reuses the green hero `verdict`; otherwise a calm descriptive word (no green,
    // no shame, no number). Tempo is demoted to the practiced line.
    let feltBodyHtml = '';
    if (isFelt) {
      const v = s.felt && s.felt.verdict;
      if (feltFlip) {
        feltBodyHtml = verdict;
      } else {
        const MAP = { dragging: 'Dragging — behind the beat', rushing: 'Rushing — ahead of the kick', settling: 'Settling — finding the pocket', locked: 'Locked the pocket' };
        const word = v ? (MAP[v] || 'Settling — finding the pocket')
          : (s.felt && s.felt.untight ? 'Keep working the pocket' : 'Couldn’t catch the low strings — go by feel');
        feltBodyHtml = `<div class="virtuoso_lab-results-verdict virtuoso_lab-results-felt">${word}</div>`;
        // PR 1.5: the specific pocket read under the verdict word (which one of
        // lean / drift / jitter it actually is — they have different fixes).
        const pd = buildPocketDiagnosis(s.felt);
        if (pd) feltBodyHtml += `<div class="virtuoso_lab-results-pocket virtuoso_lab-pocket-${pd.tone}">${pd.text}</div>`;
      }
      feltBodyHtml += `<div class="virtuoso_lab-results-practiced">${s.displayName || 'Practice'}${s.bpm ? ` · ${s.bpm} BPM` : ''}${(s.felt && s.felt.spanBars) ? ` · held ${s.felt.spanBars} bars` : ''}</div>`;
    }

    if (title) title.textContent = `Results — ${s.displayName || 'Practice'}`;
    // The judged-detail rows still carry honest counts/ear, but a Workout shows NO
    // % anywhere (incl. here) — reframe the toggle label and drop the "Practiced @
    // BPM" line (a session spans many tempos).
    body.innerHTML =
      (isWorkout
        ? sessionHeadHtml + chaptersHtml + strip + shareBtn
        : isFelt
        ? feltBodyHtml + coachHtml + strip + shareBtn
        : verdict +
          `<div class="virtuoso_lab-results-pct">${(judged && !reduceMotion) ? '0%' : headline}</div>` +
          `<div class="virtuoso_lab-results-head">${sub}</div>` +
          (hero ? hero.html : '') +
          coachHtml +
          strip +
          `<div class="virtuoso_lab-results-practiced">Practiced ${dur}${s.bpm ? ` @ ${s.bpm} BPM` : ''}</div>` +
          shareBtn) +
      `<button type="button" id="virtuoso_lab-results-details-toggle" class="virtuoso_lab-results-progress-toggle" aria-expanded="${detailsOpen}">${detailsOpen ? '▾' : '▸'} How this ${isWorkout ? 'Workout' : 'run'} was judged</button>` +
      `<div id="virtuoso_lab-results-details" class="virtuoso_lab-results-rows"${detailsOpen ? '' : ' hidden'}>${rows.map(t => `<div>${t}</div>`).join('')}` +
      (verbose && info ? `<button type="button" id="virtuoso_lab-results-copydiag" class="virtuoso_lab-results-quiet">Copy diagnostics</button>` : '') +
      `</div>` +
      ctaHtml;

    // Earned-outcome chrome (the meter-green top edge) + the entry animation.
    const card = root.querySelector('.virtuoso_lab-results-card');
    if (card) {
      card.classList.toggle('virtuoso_lab_vir-earned', earned && hasResult && !isWorkout);   // a Workout never earns the green edge (it's "I did the map", not a cleared competency)
      card.classList.toggle('virtuoso_lab_vir-has-hero', !!hero);   // the card widens only when a hero renders
      card.classList.remove('virtuoso_lab_vir-enter'); void card.offsetWidth; card.classList.add('virtuoso_lab_vir-enter');
    }
    // Auto-save the card to the configured folder, once per run (opt-in; mirrors
    // note_detect). A run signature guards against re-saving when the same card is
    // re-opened. Best-effort + async (loads the display face first); silent on fail.
    try {
      if (localStorage.getItem('virtuoso_lab.autosaveCard') === '1') {
        const sig = `${s.duration_ms || 0}|${s.bpm || 0}|${s.displayName || s.mode || ''}`;
        if ((/** @type {typeof showResultsModal & {_autoSig?: string}} */ (showResultsModal))._autoSig !== sig) {
          (/** @type {typeof showResultsModal & {_autoSig?: string}} */ (showResultsModal))._autoSig = sig;
          (async () => {
            try { await loadCardFonts(); } catch (_) {}
            try { const cv = renderShareCardImage(s); if (cv) await saveCardToServer(cv, s, true); } catch (_) {}
          })();
        }
      }
    } catch (_) {}
    // Draw the hero AFTER the canvas is in the layout (size comes from CSS width).
    if (hero) requestAnimationFrame(() => { try { hero.draw(); } catch (_) {} });
    // The % count-up — the meter-settling idiom (an LCD landing on its value).
    // Never on empty states or a Workout (no % element); reduced-motion gets the
    // final value immediately.
    if (judged && !reduceMotion && !isWorkout && !isFelt) {
      const el = body.querySelector('.virtuoso_lab-results-pct');
      const t0 = performance.now(), durMs = 550;
      /** @param {number} now */
      const step = (now) => {
        if (!el || !el.isConnected || pct === null) return;
        const k = Math.min(1, (now - t0) / durMs);
        el.textContent = Math.round(pct * (1 - Math.pow(1 - k, 3))) + '%';
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    // Wiring — all CTAs close-and-arm (load config, focus Play, start nothing).
    const focusPlay = () => { $('virtuoso_lab-play')?.focus(); };
    $('virtuoso_lab-results-done')?.addEventListener('click', () => closeResultsModal());
    $('virtuoso_lab-results-build')?.addEventListener('click', () => { closeResultsModal(); selectMode('session'); });
    $('virtuoso_lab-results-primary')?.addEventListener('click', () => {
      closeResultsModal();
      if (primary && primary.act === 'next-tier') {
        practiceSelection.setTier(/** @type {number} */ (primary.idx));
        const pw = s.ladder && PATHWAYS[s.ladder.pathwayId];
        if (pw) practiceSelection.applyTier(pw, /** @type {number} */ (primary.idx));   // bpm + the tier's density step
        else setFieldSilent('bpm', String(/** @type {NonNullable<import('./src/types/results-data.js').RunSummary['ladder']>} */ (s.ladder).tiers[/** @type {number} */ (primary.idx)]));
        syncTempoTierButtons();
        onGenerate();
        focusPlay();
      } else if (primary && primary.act === 'jam') {
        // D-J10: carry the run's KEY + the drilled device into the jam (the
        // device becomes the pre-selected first intent chip).
        jamArmFromDrill(/** @type {string} */ (jamStyle), (/** @type {string} */ ((readConfig() || {}).key)), s.displayName || '');
      } else {
        focusPlay();
      }
    });
    $('virtuoso_lab-results-again')?.addEventListener('click', () => { closeResultsModal(); focusPlay(); });
    $('virtuoso_lab-results-copydiag')?.addEventListener('click', (ev) => {
      // The verbatim dev block — byte-comparable across detection builds; the
      // "paste it in Discord" field-debugging instrument.
      const diag = [
        `Virtuoso run diagnostics — ${s.displayName || 'Practice'}`,
        `hits ${r.hits} / judgedPassed ${r.judgedPassed} / missed ${r.missed} / hadInput ${r.hadInput}`,
        info ? `judged universe: ${info.judged} of ${info.total} chart notes` : '',
        info && info.exemptChords ? `exempt chords: ${info.exemptChords} (mono detector)` : '',
        info && info.exemptSubFloor ? `exempt sub-floor: ${info.exemptSubFloor} (< 70 Hz)` : '',
        info && info.exemptMuted ? `exempt muted: ${info.exemptMuted} (mt)` : '',
        info && info.exemptFast ? `exempt too-fast: ${info.exemptFast} (ring < ${info.floorMs}ms floor)` : '',
        info && info.exemptLegato ? `exempt legato: ${info.exemptLegato} (ho/po)` : '',
        info && info.tremoloSpans ? `tremolo spans: ${info.tremoloSpans} (${info.tremoloNotes} notes, >=${Math.round(PT_SPAN_RATIO * 100)}% presence)` : '',
        info && info.leanN ? `timing lean: ${info.leanMs}ms median (n=${info.leanN}) · near-miss frames: ${info.nearMiss}` : '',
        info && info.latencyMs != null ? `latency anchor: ${info.latencyMs}ms (auto-calibrated${info.calMs != null ? `; this run ${info.calMs}ms over ${info.calMatched} notes` : ''})` : '',
        info ? `ear: ${info.ear}` : '',
        `bpm ${s.bpm} · practiced ${dur}`,
      ].filter(Boolean).join('\n');
      try { navigator.clipboard.writeText(diag); (/** @type {HTMLElement} */ (ev.target)).textContent = 'Copied ✓'; } catch (_) {}
    });
    $('virtuoso_lab-results-stepdown')?.addEventListener('click', () => {
      closeResultsModal();
      if (stepdown) {
        practiceSelection.setTier(/** @type {number} */ (stepdown.idx));
        const pw = s.ladder && PATHWAYS[s.ladder.pathwayId];
        if (pw) practiceSelection.applyTier(pw, /** @type {number} */ (stepdown.idx));   // bpm + the tier's density step
        else setFieldSilent('bpm', String(/** @type {NonNullable<import('./src/types/results-data.js').RunSummary['ladder']>} */ (s.ladder).tiers[/** @type {number} */ (stepdown.idx)]));
        syncTempoTierButtons();
        onGenerate();
      }
      focusPlay();
    });
    $('virtuoso_lab-results-jam')?.addEventListener('click', () => {
      closeResultsModal();
      // D-J10: same device hand-off as the primary jam CTA.
      jamArmFromDrill(/** @type {string} */ (jamStyle), (/** @type {string} */ ((readConfig() || {}).key)), s.displayName || '');
    });
    // Coach prescription (PR 1.3): close-and-arm into the Ladder, the SAME open
    // path the picker node-click uses (set the select + dispatch change → mode
    // switch happens first so the guided form is live).
    $('virtuoso_lab-results-coach-go')?.addEventListener('click', (ev) => {
      const id = (/** @type {Element} */ (ev.currentTarget)).getAttribute('data-pw');
      if (!id) return;
      closeResultsModal();
      selectMode('guided');
      const sel = $('virtuoso_lab-pathway');
      if (sel && [...sel.options].some(o => o.value === id)) { sel.value = id; sel.dispatchEvent(new Event('change')); }
      else applyPathwayById(id);
      focusPlay();
    });
    $('virtuoso_lab-results-details-toggle')?.addEventListener('click', () => {
      const sec = $('virtuoso_lab-results-details'), btn = $('virtuoso_lab-results-details-toggle');
      if (!sec || !btn) return;
      const open = sec.hidden;
      sec.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = (open ? '▾' : '▸') + ' How this run was judged';
      try { localStorage.setItem('virtuoso_lab.resultsDetails', open ? 'open' : 'closed'); } catch (_) {}
    });
    body.querySelectorAll('[data-act="copy-card"], [data-act="download-card"]').forEach(btn => btn.addEventListener('click', () => shareCardClick(btn, s)));
    root.classList.add('virtuoso_lab_vir-results-open');
    // The dialog ships aria-hidden="true" in the markup (every other panel
    // toggles it in its open/close fns — this one was missed): flip it BEFORE
    // focusing the CTA, or the browser blocks the hidden state ("aria-hidden
    // on an element because its descendant retained focus", live console
    // report 2026-06-07).
    $('virtuoso_lab-results-modal')?.setAttribute('aria-hidden', 'false');
    ($('virtuoso_lab-results-primary') || $('virtuoso_lab-results-done'))?.focus();
  }
  function closeResultsModal() {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const modal = $('virtuoso_lab-results-modal');
    // Move focus OUT before re-hiding — aria-hidden on the focused element's
    // ancestor hides focus from assistive tech (and the browser refuses it).
    // The transport Play button is the natural close-and-arm landing spot.
    if (modal && modal.contains(document.activeElement)) {
      const play = $('virtuoso_lab-play');
      if (play) play.focus(); else { try { (/** @type {HTMLElement} */ (document.activeElement)).blur(); } catch (_) {} }
    }
    modal?.setAttribute('aria-hidden', 'true');
    root.classList.remove('virtuoso_lab_vir-results-open');
    // The rail tier-glow fired at sessionEnd UNDER the modal scrim and burned out
    // unseen (UX finding 2026-06-06). Re-fire on dismiss so the player watches the
    // real artifact — the rail ladder — carry the new state.
    const s = _lastEndedSession;
    if (s && s.tierCleared && s.clearedTier != null && !s.jam) {
      _newlyUnlockedTier = s.clearedTier; syncTempoTierButtons(); _newlyUnlockedTier = null;
    }
  }
  // Progress sheet content (gamification's slot). Renders the "Last session" card
  // (if any) + streak + the woodshed log (time / your numbers / travels / level —
  // Tier A+C) + the competency badge rack (Tier C) + per-pathway tempo-tier dots.
  // All gained-only; the woodshed + badges collapse entirely in XP-Off.
  // ── Woodshed log (engagement Tier A — cross-session accumulation) ───────────
  // The "your practice over time" surface that makes the Workout feel like a
  // CAMPAIGN, not a stopwatch — the single biggest "kills the timer feeling" lever
  // (gamification). Aggregates REAL artifacts only, GAINED-ONLY, upward-only, no
  // decay/quota/vanity-rank: time on the instrument (sessions), the clean-tempo PBs
  // ("your numbers" — the guitar denomination, from pathway_tiers.bestBpm), and the
  // keys traveled (depth). Built on OUR competency-typed stores (host-check: BUILD
  // — the host ships no practice-history surface). Pure read; no DOM.
  function woodshedLog() {
    const sessions = sessionsLoad();
    const pt = pathwayTiersLoad();
    /** @type {{byNode: Record<string, import('./src/types/progress-data.js').ProgressNode>, xp: number}} */
    let store = { byNode: {}, xp: 0 }; try { store = progressLoad(); } catch (_) {}
    const now = Date.now(), DAY = 86400000;
    let totalMs = 0, weekMs = 0; const days = new Set();
    for (const s of sessions) {
      const ms = s.duration_ms || 0; totalMs += ms;
      if (s.date) { days.add(s.date); const t = Date.parse(s.date); if (Number.isFinite(t) && (now - t) < 7 * DAY + DAY) weekMs += ms; }
    }
    const numbers = Object.keys(pt)
      .filter(id => PATHWAYS[id] && pt[id].bestBpm)
      .map(id => ({ label: PATHWAYS[id].label, bpm: pt[id].bestBpm }))
      .sort((a, b) => b.bpm - a.bpm);
    const byNode = store.byNode || {}, travels = [];
    for (const id of Object.keys(byNode)) {
      const keys = (byNode[id].keysCleared || []).length;
      if (PATHWAYS[id] && keys > 0) travels.push({ label: PATHWAYS[id].label, keys, mastered: !!byNode[id].masteredAt });
    }
    travels.sort((a, b) => b.keys - a.keys);
    // "Grooves owned" — the BASS denomination (felt-hold PB): pathways held Locked,
    // shown at the tempo you hold (feltBpm), never speed-as-headline.
    const grooves = Object.keys(pt)
      .filter(id => PATHWAYS[id] && pt[id].feltBpm)
      .map(id => ({ label: PATHWAYS[id].label, bpm: pt[id].feltBpm }))
      .sort((a, b) => b.bpm - a.bpm);
    return { totalMin: Math.round(totalMs / 60000), weekMin: Math.round(weekMs / 60000), sessions: sessions.length, days: days.size, xp: store.xp || 0, numbers, travels, grooves };
  }
  /** @param {number} min */
  function fmtMins(min) { return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`; }
  function woodshedSectionHtml() {
    let xpOff = false; try { xpOff = progressLoad().mode === 'off'; } catch (_) {}
    if (xpOff) return '';   // Off collapses the whole layer
    const w = woodshedLog();
    if (w.sessions === 0) return `<div class="virtuoso_lab-progress-sheet-section"><h4>Woodshed</h4><div class="virtuoso_lab-pm-coming">Your practice will accumulate here — time on the instrument, your tempo PBs, and the keys you've traveled.</div></div>`;
    const rows = [`<div class="virtuoso_lab-pm-row"><span>On the instrument</span><strong>${fmtMins(w.totalMin)}</strong></div>`];
    if (w.weekMin > 0) rows.push(`<div class="virtuoso_lab-pm-row"><span>This week</span><strong>${fmtMins(w.weekMin)}</strong></div>`);
    rows.push(`<div class="virtuoso_lab-pm-row"><span>Practice days</span><strong>${w.days}</strong></div>`);
    // Tier C — the visible woodshed LEVEL (a legible readout of the accrued time×
    // difficulty XP, never a featured headline; the forward hint is opportunity, not
    // a grind bar). Behind XP-Off with the rest of this section.
    const lv = xpLevelInfo(w.xp);
    rows.push(`<div class="virtuoso_lab-pm-row"><span>Woodshed level</span><strong>Lv ${lv.level} · ${lv.name}</strong></div>`);
    // Forward line. Below the cap it names the next identity (opportunity, not a grind
    // bar). AT the cap (Lifer, no nextName) the old code went SILENT — the "Lifer cliff"
    // at our most-committed player. Reframe the summit as a graduation that points at the
    // UNCAPPED lifetime ledger below (hours keep counting; PBs / keys / badges never cap).
    // gamification+market verdict: keep finite levels, make the terminal state a graduation,
    // never an infinite treadmill. project_xp_leveling_cap_prestige_verdict.
    const nextAt = lv.nextAt;
    if (lv.nextName && nextAt != null) rows.push(`<div class="virtuoso_lab-pm-coming">${(nextAt - lv.xp).toLocaleString()} XP of practice to ${lv.nextName}.</div>`);
    else rows.push(`<div class="virtuoso_lab-pm-coming">Lifer — top of the ladder. The hours keep counting; from here your tempo PBs, keys and badges are the climb.</div>`);
    // "Your numbers" — the clean-tempo PBs to beat (gained-only; the come-back hook).
    let numbersHtml = '';
    if (w.numbers.length) {
      numbersHtml = `<div class="virtuoso_lab-pm-sub">Your numbers — clean tempo to beat</div>` +
        w.numbers.slice(0, 5).map(n => `<div class="virtuoso_lab-pm-row"><span>${n.label}</span><strong>${n.bpm} BPM</strong></div>`).join('');
    }
    // Traveled — keys cleared (portability; the depth axis made visible).
    let travelHtml = '';
    if (w.travels.length) {
      travelHtml = `<div class="virtuoso_lab-pm-sub">Traveled — held in new keys</div>` +
        w.travels.slice(0, 5).map(t => `<div class="virtuoso_lab-pm-row"><span>${t.label}${t.mastered ? ' ★' : ''}</span><strong>${t.keys} ${t.keys === 1 ? 'key' : 'keys'}</strong></div>`).join('');
    }
    // Grooves owned — the bass felt-hold PBs (held in the pocket; tempo a fact, not a rank).
    let groovesHtml = '';
    if (w.grooves && w.grooves.length) {
      groovesHtml = `<div class="virtuoso_lab-pm-sub">Grooves owned — held in the pocket</div>` +
        w.grooves.slice(0, 5).map(g => `<div class="virtuoso_lab-pm-row"><span>${g.label}</span><strong>to ${g.bpm} BPM</strong></div>`).join('');
    }
    return `<div class="virtuoso_lab-progress-sheet-section"><h4>Woodshed</h4>${rows.join('')}${numbersHtml}${travelHtml}${groovesHtml}</div>`;
  }
  // Competency BADGE rack (Tier C) — earned-only, gained-only (a badge is a one-time
  // false→true on a real competency artifact; nothing is ever shown locked-with-a-bar
  // or lost). Collapses entirely in XP-Off; no empty rack to nag a new player.
  function badgesSectionHtml() {
    let xpOff = false; try { xpOff = progressLoad().mode === 'off'; } catch (_) {}
    if (xpOff) return '';
    const store = progressLoad();
    const earned = Object.keys(store.badges || {});
    if (!earned.length) return '';
    const chips = BADGES.filter(b => earned.includes(b.id))
      .map(b => `<span class="virtuoso_lab-badge" title="${b.desc}">${b.name}</span>`).join('');
    return `<div class="virtuoso_lab-progress-sheet-section"><h4>Badges</h4><div class="virtuoso_lab-badge-rack">${chips}</div></div>`;
  }
  function renderProgressSheet() {
    const body = $('virtuoso_lab-progress-sheet-body'); if (!body) return;
    const pt = pathwayTiersLoad();
    // Forgiving streak, framed to celebrate the return (never punish the break).
    const _sessions = sessionsLoad();
    const streakN = streakCount(_sessions);
    const todayDone = new Set(_sessions.map((/** @type {{date: string}} */ s) => s.date)).has(localDateStr());
    const streakLine = streakN > 0
      ? `<div class="virtuoso_lab-pm-row"><span>${todayDone ? 'Current streak' : 'Streak — alive today'}</span><strong>${streakN} ${streakN === 1 ? 'day' : 'days'}</strong></div>${todayDone ? '' : '<div class="virtuoso_lab-pm-coming">Practice today to extend it.</div>'}`
      : `<div class="virtuoso_lab-pm-coming">Practice today to start a streak — and a single rest day won’t break it.</div>`;
    const touched = Object.keys(pt)
      .filter(id => PATHWAYS[id] && (pt[id].highest_tier ?? -1) >= 0)
      .sort((a, b) => (pt[b].highest_tier ?? -1) - (pt[a].highest_tier ?? -1));
    /** @param {string} id */
    const dotRow = (id) => {
      const pw = PATHWAYS[id], hi = (pt[id].highest_tier ?? -1);
      const dots = (pw.tempoTiers || []).map((_, i) => `<span class="tree-tier-dot${i <= hi ? ' cleared' : ''}"></span>`).join('');
      return `<div class="virtuoso_lab-pm-row"><span>${pw.label}</span><span class="virtuoso_lab-pm-dots">${dots}</span></div>`;
    };
    const _crest = crestState();
    const crestHtml = _crest.rank
      ? `<div class="virtuoso_lab-pm-crest"><span class="virtuoso_lab-crest cr-rank-${_crest.rank}">${crestSvg(_crest.rank)}</span><div><div class="virtuoso_lab-pm-crest-label">${_crest.label}</div><div class="virtuoso_lab-pm-crest-desc">${_crest.desc}</div></div></div>`
      : '';
    body.innerHTML =
      crestHtml +
      sessionSummaryCardHtml() +
      `<div class="virtuoso_lab-progress-sheet-section"><h4>Streak</h4>${streakLine}</div>` +
      woodshedSectionHtml() +
      badgesSectionHtml() +
      `<div class="virtuoso_lab-progress-sheet-section"><h4>Tempo-tier progress</h4>${touched.length ? touched.slice(0, 8).map(dotRow).join('') : '<div class="virtuoso_lab-pm-coming">Clear a tempo tier to see progress here.</div>'}</div>`;
  }
  // Header Setup popover (instrument + strings + tuning). The button shows the live
  // instrument + tuning; the popover toggles open. Closing on outside-click is bound
  // in bind(). The controls inside keep their IDs, so all instrument/tuning wiring is
  // unchanged — they just live in the header now.
  function setupLabelText() {
    const instrSel = document.querySelector('[name="instrument"]');
    const v = instrSel ? instrSel.value : 'guitar';
    const instr = v === 'bass' ? 'Bass' : v === 'piano' ? 'Piano' : 'Guitar';
    const tun = $('virtuoso_lab-tuning-select');
    let tuning = '';
    if (tun && tun.selectedOptions && tun.selectedOptions[0]) {
      tuning = tun.selectedOptions[0].textContent.replace(/\s*\(.*\)\s*/, '').trim();
    }
    // Host-badge content hierarchy: instrument · strings · tuning (topbar parity).
    const count = currentStringCount();
    return tuning ? `${instr} · ${count} · ${tuning}` : `${instr} · ${count}`;
  }
  function updateSetupButton() {
    const lbl = $('virtuoso_lab-setup-label');
    if (!lbl) return;
    lbl.textContent = setupLabelText();
    // Short form for the narrow-width degrade (CSS swaps to data-short via ::after).
    const instrSel = document.querySelector('[name="instrument"]');
    const v = instrSel ? instrSel.value : 'guitar';
    const short = v === 'bass' ? 'Bass' : v === 'piano' ? 'Pno' : 'Gtr';
    const tun = $('virtuoso_lab-tuning-select');
    const tShort = (tun && tun.selectedOptions && tun.selectedOptions[0])
      ? tun.selectedOptions[0].textContent.replace(/\s*\(.*\)\s*/, '').trim().slice(0, 4) : '';
    lbl.dataset.short = tShort ? `${short} · ${tShort}` : short;
  }
  /** @param {boolean} [force] */
  function toggleSetupPopover(force) {
    const pop = $('virtuoso_lab-setup-popover'), btn = $('virtuoso_lab-setup-btn');
    if (!pop || !btn) return;
    const open = force != null ? force : pop.hidden;
    pop.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    // The Tune… row needs the host scoring SDK (the mic detector) — sync its
    // visibility on every open so a host without it never shows a dead button.
    // (The old courtesy "Floating tuner ↗" button retired 2026-07-10: the header
    // Tuner badge is that affordance now, in the host's own topbar position.)
    if (open) {
      const row = $('virtuoso_lab-tune-row');
      if (row) row.style.display = (ptAvailable() || ndVerifyAvailable()) ? '' : 'none';
      const tuneBtn = $('virtuoso_lab-tune-btn');
      if (tuneBtn) tuneBtn.style.display = ptAvailable() ? '' : 'none';
    }
  }
  // ── Host topbar parity: tuner + profile badges & instrument-settings sync ───
  // (docs/plugin/design/topbar-host-parity.md, 2026-07-10.) Virtuoso's "fullscreen":true hides
  // the host topbar on this screen, so the header mirrors its three badges. HOST
  // CHECK verdicts: tuner = BORROW the launch (window.tuner.toggle) + MIRROR the
  // card; instrument = BORROW persistence (/api/settings + /api/tunings +
  // workingTuning + instrument:changed) + MIRROR the badge; profile = MIRROR the
  // chip + LINK (goScreen('v3-profile')). Host settings are the source of truth
  // for the player's guitar/bass identity; piano (gated) NEVER posts — the host
  // model has no piano. Per-rung tuning overrides (applyPathwayConfig /
  // setFieldSilent paths) never reach hostSettingsWrite — only user-driven panel
  // changes funnel through instrumentStoreSave. All host paths fail silent so
  // the standalone/degraded behavior is exactly the pre-parity plugin.
  // NOTE (notedetect-expert, load-bearing): note_detect reads NEITHER
  // workingTuning nor /api/settings — the verifier's tuning reference is solely
  // the per-call ctx Virtuoso already passes. This sync must never replace it.
  /** @type {import('./src/types/host-data.js').HostTuningTable | null} */
  let _hostTuningsByKey = null;   // {'guitar-6': {name: [hz,…]}} from GET /api/tunings
  /** @type {import('./src/types/host-data.js').HostTuningTable | null} */
  let _hostTuningMidis = null;    // {'guitar-6': {name: [midi,…]}} — exact integers (host ≥ #829)
  let _hostTuningsRef = 440;      // referencePitch the hz table was scaled to
  /** @type {import('./src/types/host-data.js').HostSettingsInput | null} */
  let _hostSettingsCache = null;  // last GET /api/settings body (pathway echo)
  let _hostApplying = false;      // true while applying host → panel (no write echo)
  let _hostSelfEmit = false;      // true around our own instrument:changed emit
  /** @type {ReturnType<typeof setTimeout> | null} */
  let _hostWriteTimer = null;
  // Host tunings → absolute midis. Prefer the exact integers the host serves
  // (`tuningMidis`, host #829 — no float round-trip); fall back to recovering
  // them from the FREQUENCY table against its reference pitch (A4 = 69 at
  // referencePitch) for hosts predating #829.
  /** @param {string} family @param {number} count */
  function hostTuningEntries(family, count) {
    const key = `${family}-${count}`;
    const table = _hostTuningsByKey && _hostTuningsByKey[key];
    if (!table) return [];
    const exact = (_hostTuningMidis && _hostTuningMidis[key]) || {};
    const ref = _hostTuningsRef || 440;
    const out = [];
    for (const [name, freqs] of Object.entries(table)) {
      let midis = exact[name];
      if (!Array.isArray(midis) || midis.length !== count) {
        if (!Array.isArray(freqs) || freqs.length !== count) continue;
        midis = freqs.map(hz => Math.round(69 + 12 * Math.log2(hz / ref)));
      }
      if (midis.every(m => Number.isFinite(m) && m >= 0 && m <= 127)) out.push({ name, midis });
    }
    return out;
  }
  /** @param {string} family @param {number} count @param {number[]} midis */
  function hostTuningNameForMidis(family, count, midis) {
    const hit = hostTuningEntries(family, count)
      .find(e => e.midis.length === midis.length && e.midis.every((m, i) => m === midis[i]));
    return hit ? hit.name : null;
  }
  async function loadHostTunings() {
    try {
      const r = await fetch('/api/tunings');
      if (!r.ok) return;
      const d = await r.json();
      _hostTuningsByKey = (d && d.tunings) || null;
      _hostTuningMidis = (d && d.tuningMidis) || null;   // exact integers (host #829); null on older hosts
      _hostTuningsRef = Number(d && d.referencePitch) || 440;
      tuningSettings.sync();   // repaint the dropdown with the host named group
    } catch (_) { /* older host / offline — Virtuoso presets only */ }
  }
  // The panel's currently-effective open midis (custom override else the setup's).
  function effectiveMidisNow() {
    const count = currentStringCount();
    const hidden = $('virtuoso_lab-custom-open-midis');
    const custom = (hidden?.value || '').split(',').map(Number).filter(Number.isFinite);
    if (custom.length === count) return custom;
    const setup = document.querySelector('[name="stringSetup"]');
    return ((STRING_SETUPS[String(setup?.value)] || {}).openMidis || []).slice();
  }
  // Write-through: user panel change → POST /api/settings (host commit discipline:
  // adopt only on an accepted response — /api/settings can return {error} with
  // HTTP 200), then workingTuning + instrument:changed + the tuner-config push,
  // exactly the host badge's own saveSettings sequence. Named tunings round-trip
  // by NAME; everything else as a custom offset array vs the family standard
  // (interop always maps through ABSOLUTE midis — never reconcile via .tuning).
  function hostSettingsWriteSoon() {
    if (_hostApplying) return;   // applying host → panel; don't echo it back
    if (_hostWriteTimer) clearTimeout(_hostWriteTimer);
    _hostWriteTimer = setTimeout(() => { _hostWriteTimer = null; hostSettingsWriteNow(); }, 150);
  }
  async function hostSettingsWriteNow() {
    const instrEl = document.querySelector('[name="instrument"]');
    if (!instrEl || instrEl.value === 'piano') return;   // no piano in the host model
    const family = currentFamily();
    const count = currentStringCount();
    const std = hostStandardMidisFor(family, count);
    const midis = effectiveMidisNow();
    if (!std || midis.length !== std.length) return;
    const named = hostTuningNameForMidis(family, count, midis);
    const tuning = named || midis.map((/** @type {number} */ m, /** @type {number} */ i) => m - std[i]);
    let accepted = false;
    try {
      const r = await fetch('/api/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrument: family, string_count: count, tuning }),
      });
      if (r.ok) { const body = await r.json().catch(() => ({})); accepted = !(body && body.error); }
    } catch (_) { /* host settings unreachable — Virtuoso persistence still holds */ }
    if (!accepted) return;
    try { hostBus()?.workingTuning?.setCurrentInstrument?.(family, count); } catch (_) {}
    _hostSelfEmit = true;
    try {
      hostBus()?.emit?.('instrument:changed', {
        instrument: family, stringCount: count, tuning,
        pathway: (_hostSettingsCache && _hostSettingsCache.pathway) || 'songs',   // echo, control dropped
      });
    } catch (_) {}
    setTimeout(() => { _hostSelfEmit = false; }, 250);
    // Tuner-config push only when the tuner plugin is actually present (its
    // global is the cheap detect for its routes — a blind POST 404s and the
    // console noise trips the smoke suites' console-error guards).
    if (typeof window.tuner?.toggle === 'function') {
      try {
        /** @type {{lastInstrument: string, lastTuning?: string}} */
        const body = { lastInstrument: `${family}-${count}` };
        if (typeof tuning === 'string') body.lastTuning = tuning;   // custom arrays have no name — skip
        await fetch('/api/plugins/tuner/config', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        if (typeof window._tunerReloadConfig === 'function') await window._tunerReloadConfig();
      } catch (_) { /* tuner plugin config route absent */ }
    }
  }
  // Resolve a host settings body to {inst, count, midis} (absolute midis — the
  // interop currency; never reconcile via offsets alone).
  /** @param {import('./src/types/host-data.js').HostSettingsInput} s */
  function hostSettingsResolve(s) {
    const inst = s.instrument === 'bass' ? 'bass' : 'guitar';
    const counts = inst === 'bass' ? [4, 5, 6] : [6, 7, 8];
    let count = Number(s.string_count);
    if (!counts.includes(count)) count = counts[0];
    const std = hostStandardMidisFor(inst, count);
    if (!std) return null;
    let midis;
    if (typeof s.tuning === 'string') {
      const named = hostTuningEntries(inst, count).find(e => e.name === s.tuning);
      midis = named ? named.midis.slice() : std.slice();
    } else if (Array.isArray(s.tuning) && s.tuning.length === std.length) {
      midis = std.map((m, i) => m + (Number((/** @type {unknown[]} */ (s.tuning))[i]) || 0));
    } else {
      midis = std.slice();
    }
    return { inst, count, midis };
  }
  /** @param {NonNullable<ReturnType<typeof hostSettingsResolve>>} res */
  function hostStateMatchesPanel(res) {
    const cur = effectiveMidisNow();
    return currentFamily() === res.inst && currentStringCount() === res.count
      && cur.length === res.midis.length && cur.every((/** @type {number} */ m, /** @type {number} */ i) => m === res.midis[i]);
  }
  // Apply host → panel (a PULL: fresh install, or a live instrument:changed from
  // the host badge / another screen). Applies via the normal setup-change path so
  // pathway repaint/regenerate behave exactly like a user change — _hostApplying
  // suppresses only the write-back echo.
  /** @param {import('./src/types/host-data.js').HostSettingsInput} s */
  function applyHostInstrument(s) {
    const res = hostSettingsResolve(s);
    if (!res) return;
    if (hostStateMatchesPanel(res)) return;   // already showing it (breaks the react loop)
    const { inst, count, midis } = res;
    const instrEl = document.querySelector('[name="instrument"]');
    const setupEl = document.querySelector('[name="stringSetup"]');
    const hidden = $('virtuoso_lab-custom-open-midis');
    if (!instrEl || !setupEl) return;
    // Exact built-in setup match else custom override vs the family standard.
    let setupName = null;
    for (const [k, v] of Object.entries(STRING_SETUPS)) {
      if (v.instrument === inst && v.openMidis.length === midis.length
          && v.openMidis.every((m, i) => m === midis[i])) { setupName = k; break; }
    }
    _hostApplying = true;
    try {
      instrEl.value = inst;
      if (setupName) { setupEl.value = setupName; if (hidden) hidden.value = ''; }
      else { setupEl.value = `${inst}_${count}_standard`; if (hidden) hidden.value = midis.join(','); }
      syncInstrumentFamilyButtons();
      // The full user-path handler: syncs, L1 store save, pathway repaint, regenerate.
      setupEl.dispatchEvent(new Event('change', { bubbles: true }));
      tuningSettings.syncInputs();
    } finally { _hostApplying = false; }
  }
  async function hostSettingsFetch() {
    try {
      const r = await fetch('/api/settings');
      if (!r.ok) return null;
      const s = await r.json();
      if (!s || typeof s !== 'object') return null;
      _hostSettingsCache = s;
      return (s.instrument === 'guitar' || s.instrument === 'bass') ? s : null;
    } catch (_) { return null; /* older host / offline */ }
  }
  // Boot-time reconcile. Direction matters: while this plugin is resident it
  // tracks host changes LIVE (the instrument:changed subscription), so at boot a
  // divergence means the LOCAL declaration is the survivor to trust — a pre-merge
  // player's tuning lives only in the L1 store, and the host side may still be
  // factory default ("chose Standard" and "never touched" are indistinguishable).
  // Local wins and is pushed host-ward; a fresh install (no L1 store) adopts the
  // host. Live external changes always PULL (the event handler below).
  async function hostSettingsRead() {
    const s = await hostSettingsFetch();
    if (!s) return;
    const res = hostSettingsResolve(s);
    if (!res || hostStateMatchesPanel(res)) return;   // in sync — nothing to do
    if (!instrumentStoreLoad()) { applyHostInstrument(s); return; }
    hostSettingsWriteNow();
  }
  // Tuner badge: launch is the host's own action; display is a passive mirror of
  // the bus 'tuner:frame' stream ({note, cents, freq, hasSignal}). Never draws on
  // the tuner's surfaces or re-implements detection (the borrow boundary).
  function syncTunerBadge() {
    const b = $('virtuoso_lab-tuner-badge');
    if (b) b.hidden = typeof window.tuner?.toggle !== 'function';
  }
  /** @param {Partial<import('./src/types/host-data.js').TunerFrame> | null} d */
  function applyTunerFrame(d) {
    const note = $('virtuoso_lab-tuner-note'), meter = $('virtuoso_lab-tuner-meter');
    if (!note || !meter) return;
    const has = d && d.hasSignal !== false && d.note;
    note.textContent = has ? String(d.note) : 'Tuner';
    const segs = meter.children;
    const cents = has && Number.isFinite(Number(d.cents)) ? Number(d.cents) : null;
    // 5 segments ≈ the host's 11-bar meter at our scale: lit segment tracks cents
    // (±25¢ range), green in tune, amber off-pitch.
    const lit = cents == null ? -1 : Math.max(0, Math.min(4, Math.round(cents / 10) + 2));
    for (let i = 0; i < segs.length; i++) {
      segs[i].classList.toggle('on', i === lit);
      segs[i].classList.toggle('off-pitch', i === lit && Math.abs((/** @type {number} */ (cents))) > 5);
    }
  }
  // Profile badge: compact mirror (avatar + streak + rank) + LINK. Renders nothing
  // unless the profile endpoint answers AND the player is onboarded (host rule).
  async function loadProfileBadge() {
    const btn = $('virtuoso_lab-profile-badge');
    if (!btn || !btn.hidden) return;   // absent or already rendered
    try {
      const r = await fetch('/api/profile');
      if (!r.ok) return;
      const p = await r.json();
      if (!p || !p.onboarded) return;
      let prog = null;
      try { const r2 = await fetch('/api/profile/progress'); if (r2.ok) prog = await r2.json(); } catch (_) {}
      let rank = '';
      try { rank = String(window.v3Progression?.get?.()?.mastery_rank || ''); } catch (_) {}
      const av = $('virtuoso_lab-profile-avatar');
      if (av && p.avatar_url) { av.src = p.avatar_url; av.hidden = false; }
      const streak = Number(prog && prog.current_streak) || 0;
      const bits = [];
      if (streak > 0) bits.push(`${streak}🔥`);
      if (rank) bits.push(rank);
      if (!bits.length) bits.push(p.display_name || 'Profile');
      const txt = $('virtuoso_lab-profile-text');
      if (txt) txt.textContent = bits.join(' · ');
      btn.title = [p.display_name, rank, streak ? `${streak}-day streak` : '']
        .filter(Boolean).join(' · ') || 'Profile';
      btn.hidden = false;
    } catch (_) { /* endpoint absent (web/smoke oddity) — badge stays hidden */ }
  }
  // One idempotent init: feature-detects each badge, loads host state, subscribes
  // the bus streams. Called from bind() + a delayed retry (plugin load order — the
  // tuner plugin / bus may register after us, mirroring the ptShowIdleStrip retry).
  let _hostTopbarSubscribed = false;
  function initHostTopbar() {
    syncTunerBadge();
    loadProfileBadge();
    if (_hostTopbarSubscribed) return;
    const bus = hostBus();
    if (!bus || typeof bus.on !== 'function') return;
    _hostTopbarSubscribed = true;
    try { bus.on('tuner:frame', (e) => applyTunerFrame((e && e.detail) || e)); } catch (_) {}
    try {
      bus.on('instrument:changed', async () => {
        if (_hostSelfEmit) return;   // our own emit bouncing back
        // External change (host badge, another screen) — always a PULL.
        const s = await hostSettingsFetch();
        if (s) applyHostInstrument(s);
      });
    } catch (_) {}
  }
  // Header settings menu (⚙) + its prefs: accent theme (live), default XP mode (a
  // stored default — ready for the unbuilt XP store), default count-in (seeds the
  // count-in control on load). All persisted to localStorage.
  /** @param {boolean} [force] */
  function toggleSettingsMenu(force) {
    const menu = $('virtuoso_lab-settings-menu'), btn = $('virtuoso_lab-settings-btn');
    if (!menu || !btn) return;
    // Class-toggled (animated slide/fade); the CSS closed state is visibility-hidden
    // + pointer-events-none, so it's inert when closed without display:none (which
    // would kill the transition). Replaces the old menu.hidden flip.
    const open = force != null ? force : !menu.classList.contains('virtuoso_lab_vir-open');
    menu.classList.toggle('virtuoso_lab_vir-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  /** @param {string} name */
  function applyTheme(name) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    // Drop any accent-theme class generically so the picker stays data-driven —
    // a new swatch (data-theme="…") + its .virtuoso_lab_vir-theme-… CSS works with no edit here.
    Array.from(root.classList).forEach(c => { if (c.indexOf('virtuoso_lab_vir-theme-') === 0) root.classList.remove(c); });
    if (name) root.classList.add('virtuoso_lab_vir-theme-' + name);
    try { localStorage.setItem('virtuoso_lab.theme', name || ''); } catch (_) {}
    document.querySelectorAll('#virtuoso_lab-theme-pick .virtuoso_lab-theme-swatch').forEach(b => b.classList.toggle('active', (b.dataset.theme || '') === (name || '')));
  }
  /** @param {string} mode */
  function applyXpModeDefault(mode) {
    try { localStorage.setItem('virtuoso_lab.xpMode', mode); } catch (_) {}
    // Tier C: this IS the live XP-Off switch — drive the real progress-store mode
    // that gates the whole engagement layer (XP/level/badges/woodshed/depth), not
    // just a settings default. Off genuinely collapses the layer everywhere.
    try { progressSetMode(mode); } catch (_) {}
    document.querySelectorAll('#virtuoso_lab-xp-mode .virtuoso_lab-mini-btn').forEach(b => b.classList.toggle('active', b.dataset.xp === mode));
    try { renderProgressSheet(); } catch (_) {}
  }
  // Count-in is always ≥1 bar (no 0-bar drop-in — a DAW recording convenience, not
  // a practice need). The setting picks the LENGTH (1/2/4); a stale '0' floors to 1.
  function countInDefaultBars() {
    try { return Math.max(1, Math.min(8, parseInt(localStorage.getItem('virtuoso_lab.countInDefault') || '1', 10) || 1)); } catch (_) { return 1; }
  }
  // Count-in grid preview (the soft sub-ticks at the exercise's subdivision in the
  // last count-in bar / Workout break bars) — OPT-IN since 2026-06-12: real
  // beginner dogfood found the extra ticks made slow exercises FEEL faster.
  function countInGridOn() {
    try { return localStorage.getItem('virtuoso_lab.countInGrid') === 'on'; } catch (_) { return false; }
  }
  /** @param {string} val */
  function applyCountInGrid(val) {
    document.querySelectorAll('#virtuoso_lab-countin-grid .virtuoso_lab-mini-btn').forEach(b => b.classList.toggle('active', b.dataset.grid === val));
  }
  // Studio energy (settings → Studio energy): the host-parity "Lit" chrome treatment
  // is one root class (.virtuoso_lab_vir-lit, default ON). 'calm' reverts to EXACTLY the restrained
  // base look — the user's toggle-back guarantee. Persisted; no playing-surface impact.
  /** @param {string} mode */
  function applyEnergy(mode) {
    const lit = mode !== 'calm';
    const root = $('virtuoso_lab-root'); if (root) root.classList.toggle('virtuoso_lab_vir-lit', lit);
    try { localStorage.setItem('virtuoso_lab.energy', lit ? 'lit' : 'calm'); } catch (_) {}
    document.querySelectorAll('#virtuoso_lab-energy-pick .virtuoso_lab-mini-btn').forEach(b => b.classList.toggle('active', b.dataset.energy === (lit ? 'lit' : 'calm')));
  }
  // Card theme (settings → Card theme): stamps data-virtuoso_lab_vir-cardskin on the root — read ONLY
  // by the results-card CSS + the copy-card canvas (renderShareCardImage), so the cockpit
  // stays calm. 'signature' = today's default look (no attribute; follows the Accent +
  // Lit/Calm). neon/esports/metal/warm/focus are opt-in note_detect-parity skins.
  // Each non-Signature skin also owns its own colorway set; colorways change palette
  // tokens only, never the skin's typography/shape/motion identity.
  /** @type {Record<string, import('./src/types/theme-data.js').ThemeRecipe>} */
  const VIR_THEME_RECIPES = {
    signature: {
      id: 'signature', label: 'Signature', role: 'Virtuoso baseline', mode: 'dark',
      axes: ['host-native', 'calm', 'accent-led'],
      typography: { displayFamily: 'var(--virtuoso_lab_vir-font-display)', displayCase: 'mixed', tracking: 'normal' },
      shape: { controlRadius: 8, panelRadius: 10, borderWeight: 1 },
      material: { surface: 'graphite', treatment: 'quiet-raised' },
      motion: { ring: 'lit-toggle', reducedMotion: 'static' },
      stageFrame: { style: 'host-ring', animated: true },
      preview: { surface:'#0d1424', frame:'#334155', text:'#f8fafc', a:'#2563eb', b:'#60a5fa', radius:'10px', shadow:'0 10px 26px rgba(0,0,0,0.34)' },
      tones: [],
    },
    neon: {
      id: 'neon', label: 'Neon', role: 'Synth arcade glass', mode: 'dark',
      axes: ['glass', 'glow', 'animated'],
      typography: { displayFamily: 'var(--virtuoso_lab_vir-font-display)', displayCase: 'uppercase moments', tracking: 'wide' },
      shape: { controlRadius: 12, panelRadius: 12, borderWeight: 1 },
      material: { surface: 'dark glass', treatment: 'luminous-border' },
      motion: { ring: 'spin', glow: 'cyan-magenta', reducedMotion: 'static' },
      stageFrame: { style: 'chromatic-ring', animated: true },
      preview: { surface:'#060a18', frame:'rgba(0,240,255,0.5)', text:'#e8f6ff', a:'#00f0ff', b:'#ff2ec4', radius:'12px', shadow:'0 0 22px rgba(0,240,255,0.18)' },
      tones: [
        { id:'default', label:'Arcade', a:'#00f0ff', b:'#ff2ec4' },
        { id:'violet', label:'Violet', a:'#8b5cf6', b:'#22d3ee' },
        { id:'acid', label:'Acid', a:'#39ff14', b:'#00f0ff' },
        { id:'sunset', label:'Sunset', a:'#fb7185', b:'#facc15' },
      ],
    },
    esports: {
      id: 'esports', label: 'Esports', role: 'Broadcast HUD', mode: 'dark',
      axes: ['flat', 'square', 'uppercase'],
      typography: { displayFamily: 'VirtuosoLabEsports', displayCase: 'uppercase', tracking: 'wide' },
      shape: { controlRadius: 0, panelRadius: 0, borderWeight: 1 },
      material: { surface: 'matte black', treatment: 'hard-edge' },
      motion: { ring: 'none', reducedMotion: 'static' },
      stageFrame: { style: 'solid-frame', animated: false },
      preview: { surface:'#0a0c0e', frame:'#e8b43a', text:'#f5f5f4', a:'#e8b43a', b:'#f5f5f4', radius:'0px', shadow:'none' },
      tones: [
        { id:'default', label:'Amber', a:'#e8b43a', b:'#f5f5f4' },
        { id:'cobalt', label:'Cobalt', a:'#38bdf8', b:'#f5f5f4' },
        { id:'crimson', label:'Crimson', a:'#f43f5e', b:'#f5f5f4' },
        { id:'lime', label:'Lime', a:'#a3e635', b:'#f5f5f4' },
      ],
    },
    metal: {
      id: 'metal', label: 'Metal', role: 'Industrial plate', mode: 'dark',
      axes: ['bevel', 'steel', 'ember'],
      typography: { displayFamily: 'VirtuosoLabMetal', displayCase: 'uppercase', tracking: 'wide' },
      shape: { controlRadius: 6, panelRadius: 6, borderWeight: 1 },
      material: { surface: 'brushed steel', treatment: 'hard-bevel' },
      motion: { ring: 'pulse', glow: 'ember', reducedMotion: 'static' },
      stageFrame: { style: 'inset-ring', animated: true },
      preview: { surface:'#24272c', frame:'rgba(255,179,71,0.42)', text:'#f3efe7', a:'#ffb347', b:'#ff6b35', radius:'6px', shadow:'inset 0 1px 0 rgba(255,255,255,0.16), 0 10px 24px rgba(0,0,0,0.42)' },
      tones: [
        { id:'default', label:'Ember', a:'#ffb347', b:'#ff6b35' },
        { id:'blood', label:'Blood', a:'#ef4444', b:'#f97316' },
        { id:'steel', label:'Steel', a:'#93c5fd', b:'#cbd5e1' },
        { id:'toxic', label:'Toxic', a:'#bef264', b:'#84cc16' },
      ],
    },
    warm: {
      id: 'warm', label: 'Warm', role: 'Analog studio', mode: 'dark',
      axes: ['analog', 'soft-hardware', 'lamp'],
      typography: { displayFamily: 'Rockwell/serif', displayCase: 'mixed', tracking: 'slight' },
      shape: { controlRadius: 10, panelRadius: 10, borderWeight: 1 },
      material: { surface: 'tolex/tweed', treatment: 'warm-matte' },
      motion: { ring: 'slow-pulse', glow: 'pilot-lamp', reducedMotion: 'static' },
      stageFrame: { style: 'warm-edge-light', animated: true },
      preview: { surface:'#2a1d16', frame:'rgba(232,161,60,0.45)', text:'#f5ecd8', a:'#e8a13c', b:'#8a3324', radius:'10px', shadow:'inset 0 1px 0 rgba(245,236,216,0.10), 0 10px 24px rgba(0,0,0,0.38)' },
      tones: [
        { id:'default', label:'Amp', a:'#e8a13c', b:'#8a3324' },
        { id:'ruby', label:'Ruby', a:'#d86b4f', b:'#8f2f2f' },
        { id:'honey', label:'Honey', a:'#f2c56b', b:'#b7791f' },
        { id:'olive', label:'Olive', a:'#a3a85c', b:'#6f6f38' },
      ],
    },
    focus: {
      id: 'focus', label: 'Focus', role: 'Low-stim clarity', mode: 'dark',
      axes: ['flat', 'quiet', 'high-contrast'],
      typography: { displayFamily: 'system-ui', displayCase: 'normal', tracking: 'normal' },
      shape: { controlRadius: 8, panelRadius: 8, borderWeight: 1 },
      material: { surface: 'matte slate', treatment: 'no-decoration' },
      motion: { ring: 'none', reducedMotion: 'none' },
      stageFrame: { style: 'quiet-solid', animated: false },
      preview: { surface:'#0d1013', frame:'#4a555f', text:'#f4f7fa', a:'#93b7de', b:'#e8edf2', radius:'8px', shadow:'none' },
      tones: [
        { id:'default', label:'Slate', a:'#93b7de', b:'#e8edf2' },
        { id:'blue', label:'Blue', a:'#7fb3d5', b:'#d6e7f2' },
        { id:'sage', label:'Sage', a:'#9ab7a0', b:'#e0eadf' },
        { id:'amber', label:'Amber', a:'#d6b66d', b:'#efe4c8' },
      ],
    },
  };
  const VIR_CARD_SKINS = ['signature', 'neon', 'esports', 'metal', 'warm', 'focus'];
  const VIR_CARD_TONES = VIR_CARD_SKINS.reduce((/** @type {Record<string, import('./src/types/theme-data.js').CardTone[]>} */ acc, id) => {
    const recipe = VIR_THEME_RECIPES[id];
    if (recipe && recipe.tones && recipe.tones.length) acc[id] = recipe.tones;
    return acc;
  }, {});
  /** @param {string} skin */
  function themeRecipeForSkin(skin) { return VIR_THEME_RECIPES[skin] || VIR_THEME_RECIPES.signature; }
  /** @param {string} activeSkin */
  function renderCardSkinPicker(activeSkin) {
    const host = $('virtuoso_lab-cardskin-pick'); if (!host) return;
    const active = VIR_CARD_SKINS.indexOf(activeSkin) !== -1 ? activeSkin : 'signature';
    host.innerHTML = '';
    VIR_CARD_SKINS.forEach(id => {
      const r = themeRecipeForSkin(id), p = r.preview || {};
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'virtuoso_lab-skin-card' + (id === active ? ' active' : '');
      b.dataset.cardskin = id;
      b.title = r.role || r.label;
      b.setAttribute('aria-label', r.label + ' theme');
      b.style.setProperty('--skin-surface', p.surface || '#0d1424');
      b.style.setProperty('--skin-frame', p.frame || '#334155');
      b.style.setProperty('--skin-text', p.text || '#f8fafc');
      b.style.setProperty('--skin-a', p.a || '#2563eb');
      b.style.setProperty('--skin-b', p.b || '#60a5fa');
      b.style.setProperty('--skin-radius', p.radius || '8px');
      b.style.setProperty('--skin-shadow', p.shadow || 'none');
      b.innerHTML = '<span class="virtuoso_lab-skin-card-visual" aria-hidden="true"><span></span><i></i><b></b></span>' +
        '<span class="virtuoso_lab-skin-card-copy"><strong>' + r.label + '</strong><em>' + (r.role || '') + '</em></span>' +
        '<span class="virtuoso_lab-skin-card-axes" aria-hidden="true">' + (r.axes || []).slice(0, 3).map(x => '<i>' + x + '</i>').join('') + '</span>';
      b.addEventListener('click', () => applyCardSkin(id));
      host.appendChild(b);
    });
  }
  /** @param {string} skin */
  function cardToneForSkin(skin) {
    if (!VIR_CARD_TONES[skin]) return 'default';
    try {
      const t = localStorage.getItem('virtuoso_lab.cardTone.' + skin) || 'default';
      return VIR_CARD_TONES[skin].some(x => x.id === t) ? t : 'default';
    } catch (_) { return 'default'; }
  }
  /** @param {string} skin @param {string} tone */
  function renderCardTonePicker(skin, tone) {
    const group = $('virtuoso_lab-cardtone-group'), host = $('virtuoso_lab-cardtone-pick'), label = $('virtuoso_lab-cardtone-label');
    if (!group || !host) return;
    const tones = VIR_CARD_TONES[skin] || [];
    group.hidden = !tones.length;
    group.classList.toggle('is-disabled', !tones.length);
    if (label) label.textContent = tones.length ? `${skin[0].toUpperCase() + skin.slice(1)} color` : 'Theme color';
    host.innerHTML = '';
    tones.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'virtuoso_lab-cardtone-swatch' + (t.id === tone ? ' active' : '');
      b.dataset.cardtone = t.id;
      b.style.setProperty('--sw-a', t.a);
      b.style.setProperty('--sw-b', t.b);
      b.title = t.label;
      b.setAttribute('aria-label', t.label);
      b.addEventListener('click', () => applyCardTone(skin, t.id));
      host.appendChild(b);
    });
  }
  /** @param {string} skin @param {string} tone */
  function applyCardTone(skin, tone) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const tones = VIR_CARD_TONES[skin] || [];
    const id = tones.some(t => t.id === tone) ? tone : 'default';
    if (tones.length && id !== 'default') root.setAttribute('data-virtuoso_lab_vir-cardtone', id);
    else root.removeAttribute('data-virtuoso_lab_vir-cardtone');
    if (tones.length) { try { localStorage.setItem('virtuoso_lab.cardTone.' + skin, id); } catch (_) {} }
    renderCardTonePicker(skin, id);
  }
  /** @param {string} name */
  function applyCardSkin(name) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const skin = VIR_CARD_SKINS.indexOf(name) !== -1 ? name : 'signature';
    const recipe = themeRecipeForSkin(skin);
    if (skin === 'signature') {
      root.removeAttribute('data-virtuoso_lab_vir-cardskin'); root.removeAttribute('data-virtuoso_lab_vir-cardtone'); root.removeAttribute('data-virtuoso_lab_vir-stageframe');
    } else {
      root.setAttribute('data-virtuoso_lab_vir-cardskin', skin);
      root.setAttribute('data-virtuoso_lab_vir-stageframe', recipe.stageFrame?.style || skin);
    }
    try { localStorage.setItem('virtuoso_lab.cardSkin', skin); } catch (_) {}
    renderCardSkinPicker(skin);
    if (skin === 'signature') renderCardTonePicker(skin, 'default');
    else applyCardTone(skin, cardToneForSkin(skin));
    try { syncSkinScopeAvail(); } catch (_) {}
  }
  // Card-theme REACH (settings → Apply theme): whether the chosen skin also skins the whole
  // cockpit. Stamps data-virtuoso_lab_vir-skincockpit on the root — read by the cockpit-extension CSS,
  // which remaps the shell's --virtuoso_lab_vir-accent* to the skin's --virtuoso_lab_vir-card-* when ON. Default 'card'
  // = calm cockpit (byte-identical). A no-op for Signature (no data-virtuoso_lab_vir-cardskin → no bleed).
  /** @param {string} scope */
  function applySkinScope(scope) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const on = scope === 'cockpit';
    if (on) root.setAttribute('data-virtuoso_lab_vir-skincockpit', 'on');
    else root.removeAttribute('data-virtuoso_lab_vir-skincockpit');
    try { localStorage.setItem('virtuoso_lab.skinCockpit', on ? 'cockpit' : 'card'); } catch (_) {}
    document.querySelectorAll('#virtuoso_lab-skinscope-pick .virtuoso_lab-mini-btn').forEach(b => b.classList.toggle('active', (b.dataset.skinscope || '') === (on ? 'cockpit' : 'card')));
  }
  // Grey the "Apply theme" toggle when the active Card theme is Signature — nothing to extend
  // (Signature already follows the Accent picker; the cockpit bleed only applies to a real skin).
  function syncSkinScopeAvail() {
    let skin = 'signature'; try { skin = localStorage.getItem('virtuoso_lab.cardSkin') || 'signature'; } catch (_) {}
    const grp = $('virtuoso_lab-skinscope-group');
    if (grp) grp.classList.toggle('is-disabled', skin === 'signature');
  }
  /** @param {string} val */
  function applyCountInDefault(val) {
    const bars = Math.max(1, Math.min(8, parseInt(val, 10) || 1));
    setFieldSilent('countIn', String(bars));   // the field is the source; syncTransport reflects the segments
    syncTransport();
  }
  function loadSettingsPrefs() {
    let theme = '', xp = 'casual', ci = null;
    try { theme = localStorage.getItem('virtuoso_lab.theme') || ''; } catch (_) {}
    try { xp = localStorage.getItem('virtuoso_lab.xpMode') || 'casual'; } catch (_) {}
    try { ci = localStorage.getItem('virtuoso_lab.countInDefault'); } catch (_) {}
    applyTheme(theme);
    applyXpModeDefault(xp);
    // A count-in is ALWAYS on (≥1 bar) — the 0-bar "drop-in" is a DAW recording
    // convenience, not a practice need (removed 2026-06-09). A stored value sets
    // the LENGTH (1/2/4); absent or a stale '0' floors to 1.
    ci = String(Math.max(1, Math.min(8, parseInt(ci || '1', 10) || 1)));
    applyCountInDefault(ci);
    const sel = $('virtuoso_lab-countin-default');
    if (sel) sel.value = ci;
    applyCountInGrid(countInGridOn() ? 'on' : 'off');
    let energy = 'lit'; try { energy = localStorage.getItem('virtuoso_lab.energy') || 'lit'; } catch (_) {}
    applyEnergy(energy);
    let cardSkin = 'signature'; try { cardSkin = localStorage.getItem('virtuoso_lab.cardSkin') || 'signature'; } catch (_) {}
    applyCardSkin(cardSkin);
    let skinScope = 'card'; try { skinScope = localStorage.getItem('virtuoso_lab.skinCockpit') || 'card'; } catch (_) {}
    applySkinScope(skinScope);
  }

  /** @param {AudioContext} ctx @param {number} when @param {number} freq @param {number} dur @param {string} instrument @param {number} gainScale @param {number} bendSemis */
  function schedulePluckedString(ctx, when, freq, dur, instrument, gainScale, bendSemis) {
    // Triangle-based plucked-string synthesis — clean, audible, no WaveShaper
    // over-drive. Sawtooth + heavy distortion (prior approach) produced
    // click-like transients that were imperceptible as guitar notes on some
    // hardware. Triangle is softer and reads clearly as a pitched note.
    const isBass = instrument === 'bass';
    const osc1 = ctx.createOscillator(), osc2 = ctx.createOscillator();
    const preGain = ctx.createGain(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    osc1.type = 'triangle'; osc2.type = 'sine';
    const f1 = freq, f2 = isBass ? Math.max(25, freq * 0.5) : freq * 2;
    osc1.frequency.setValueAtTime(f1, when);
    osc2.frequency.setValueAtTime(f2, when);
    osc2.detune.setValueAtTime(isBass ? 0 : 7, when);
    // Bend: ramp both oscillators up by `bendSemis` semitones so the note is
    // heard sliding up to its target pitch, like a real string bend. Pick first
    // (short hold at the fretted pitch), then bend over ~40% of the note.
    if (bendSemis > 0) {
      const ratio = Math.pow(2, bendSemis / 12);
      const bendStart = when + 0.045;
      const bendEnd = when + Math.min(0.22, Math.max(0.10, dur * 0.4));
      osc1.frequency.setValueAtTime(f1, bendStart);
      osc1.frequency.exponentialRampToValueAtTime(f1 * ratio, bendEnd);
      osc2.frequency.setValueAtTime(f2, bendStart);
      osc2.frequency.exponentialRampToValueAtTime(f2 * ratio, bendEnd);
    }
    // Pre-gain mixes the two oscillators at a controlled level
    preGain.gain.setValueAtTime(isBass ? 0.55 : 0.60, when);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBass ? 1100 : 2400, when);
    filter.frequency.exponentialRampToValueAtTime(isBass ? 380 : 800, when + Math.max(0.08, dur));
    filter.Q.setValueAtTime(isBass ? 0.8 : 1.4, when);
    const amp = (isBass ? 0.42 : 0.38) * (gainScale || 1);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(amp, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(amp * 0.50, when + 0.070);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.12, dur));
    osc1.connect(preGain); osc2.connect(preGain);
    preGain.connect(filter); filter.connect(gain); gain.connect(trackBus(ctx, 'notes'));
    osc1.start(when); osc2.start(when);
    const stopAt = when + Math.max(0.14, dur) + 0.03;
    osc1.stop(stopAt); osc2.stop(stopAt);
    audioNodes.push(osc1, osc2, preGain, filter, gain);
  }
  // Pedal-steel BED glide memo (2026-06-15): the previous steel chord's voicing, so the
  // 'steel' tone can HOLD common tones and glide only the CHANGED voices (oblique pedal
  // motion). Module-scoped; the <= whole-step glide gate bounds any stale-state artifact.
  let /** @type {number[] | null} */ _steelPrevMidis = null, /** @type {number | null} */ _synthBassPrevMidi = null, /** @type {number | null} */ _neonLeadPrevMidi = null;
  /** @param {AudioContext} ctx @param {number} when @param {number[]} midis @param {number} dur @param {string} instrument @param {string} tone @param {{bright?: number, level?: number, bus?: string, prevMidis?: number[] | null}} [opts] */
  function scheduleHarmonyPad(ctx, when, midis, dur, instrument, tone, opts) {
    if (!midis.length) return;
    tone = tone || 'pad';
    const bright = (opts && opts.bright !== undefined && Number.isFinite(opts.bright)) ? opts.bright : 0.5;
    const lvl = (opts && opts.level !== undefined && Number.isFinite(opts.level)) ? opts.level : 1;
    // Which strip owns the voice: cell-driven comping rides 'harmony' (Rhythm),
    // the sustained legacy pad rides 'pad' (Keys) — the caller routes.
    const busName = (opts && opts.bus) || 'harmony';

    if (tone === 'organ') {
      // Hammond drawbar simulation — additive sines, instant on/off, flat envelope
      const RATIOS = [1, 2, 3, 4, 5, 6, 8];
      const VOLS   = [0.8, 0.5, 0.35, 0.25, 0.18, 0.12, 0.08];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.13 / Math.max(1, midis.length), when);
      const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(master);
      midis.slice(0, 4).forEach(midi => {
        RATIOS.forEach((r, ri) => {
          const osc = ctx.createOscillator(), g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(midiToFreq(midi) * r, when);
          g.gain.setValueAtTime(VOLS[ri], when);
          osc.connect(g); g.connect(master);
          osc.start(when); osc.stop(when + dur);
          audioNodes.push(osc, g);
        });
      });
      return;
    }

    if (tone === 'epiano') {
      // Rhodes feel — triangle fundamental, fast percussive decay to sustain, bell partial
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, when);
      master.gain.exponentialRampToValueAtTime(0.28, when + 0.003);
      master.gain.exponentialRampToValueAtTime(0.09, when + Math.min(0.38, dur * 0.35));
      master.gain.linearRampToValueAtTime(0.06, when + Math.max(0.39, dur - 0.06));
      master.gain.linearRampToValueAtTime(0.0001, when + dur);
      const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(master);
      midis.slice(0, 4).forEach(midi => {
        const osc = ctx.createOscillator(), bell = ctx.createOscillator();
        const g = ctx.createGain(), gb = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(midiToFreq(midi), when);
        bell.type = 'sine'; bell.frequency.setValueAtTime(midiToFreq(midi) * 2, when);
        g.gain.setValueAtTime(0.65, when); gb.gain.setValueAtTime(0.09, when);
        osc.connect(g); g.connect(master);
        bell.connect(gb); gb.connect(master);
        osc.start(when); osc.stop(when + dur + 0.05);
        bell.start(when); bell.stop(when + dur + 0.05);
        audioNodes.push(osc, bell, g, gb);
      });
      return;
    }

    if (tone === 'steel') {
      // Pedal-steel BED (synth, 2026-06-15) — the country band's sustain voice, from the
      // pedal-steel-pedagogy + synthesizer + audio-engine consult. Believability is
      // PERFORMANCE, not timbre: (1) a volume-pedal SWELL (slow attack, no transient, long
      // bloom tail), (2) a resonant nasal "cry" (lowpass, Q~4), (3) OBLIQUE pitch glide —
      // on a chord change the COMMON tones hold dead-steady while only the CHANGED voices
      // slide in (the A+B-pedal move; a whole chord sliding together is a slide guitar, NOT
      // a pedal steel). saw+triangle per voice, slight detune for the doubled-string
      // shimmer. Synth-only = zero asset / zero licensing (no clean steel sample exists —
      // PSG was BLOCKED in SAMPLE_BANKS); a sample can later swap in behind this same
      // swell+glide machinery. Levels are first-pass (ear-tunable); a real reverb tail is
      // the sound-design follow-up.
      const n = Math.min(5, midis.length);
      const master = ctx.createGain(), filter = ctx.createBiquadFilter();
      const bMul = 0.75 + bright * 0.5, fBase = 2400 * bMul;
      filter.type = 'lowpass'; filter.Q.setValueAtTime(4.2, when);
      filter.frequency.setValueAtTime(fBase * 0.7, when);
      filter.frequency.linearRampToValueAtTime(fBase, when + 0.18);                 // the bar "opens" in
      filter.frequency.linearRampToValueAtTime(fBase * 0.82, when + Math.max(0.3, dur));
      const swell = Math.min(0.45, Math.max(0.12, dur * 0.45));                      // volume-pedal bloom
      master.gain.setValueAtTime(0.0001, when);
      master.gain.exponentialRampToValueAtTime(0.22, when + swell);
      master.gain.linearRampToValueAtTime(0.18, when + Math.max(swell + 0.05, dur - 0.2));
      master.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.35);          // tail past the note
      filter.connect(master);
      const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(filter, master);
      synthFx(ctx, master, 0, 0.32);    // the lush plate "cry" tail (no chorus — the detune is its width)
      const prev = _steelPrevMidis, voiceGain = 0.32 / Math.sqrt(n);
      midis.slice(0, n).forEach((midi, i) => {
        const osc1 = ctx.createOscillator(), osc2 = ctx.createOscillator(), g = ctx.createGain();
        osc1.type = 'sawtooth'; osc2.type = 'triangle'; osc2.detune.setValueAtTime(9, when);
        const fTarget = midiToFreq(midi);
        // Glide ONLY from a near previous pitch (<= a whole step): common tones (0 semis)
        // hold; a changed voice scoops in; a far/absent prev = clean swell, no glide.
        let fFrom = fTarget, glideSemis = 0;
        if (prev && prev.length) {
          let best = null, bestD = 99;
          for (const pm of prev) { const dd = Math.abs(pm - midi); if (dd < bestD) { bestD = dd; best = pm; } }
          if (best != null && bestD > 0 && bestD <= 2) { fFrom = midiToFreq(best); glideSemis = bestD; }
        }
        if (fFrom !== fTarget) {
          // Interval-scaled glide (pedal-steel-pedagogy 2026-06-15): a whole-step pedal-A
          // pull physically travels slower than a half-step pedal-B pull. Uniform 80ms read
          // as a guitar bend; ~110ms (half) / ~180ms (whole) reads as a pedal.
          const glMs = glideSemis >= 2 ? 0.18 : 0.11;
          const glEnd = when + Math.min(glMs, Math.max(0.09, dur * 0.4));
          osc1.frequency.setValueAtTime(fFrom, when); osc2.frequency.setValueAtTime(fFrom, when);
          osc1.frequency.exponentialRampToValueAtTime(fTarget, glEnd);
          osc2.frequency.exponentialRampToValueAtTime(fTarget, glEnd);
        } else {
          osc1.frequency.setValueAtTime(fTarget, when); osc2.frequency.setValueAtTime(fTarget, when);
        }
        g.gain.setValueAtTime(i === 0 ? voiceGain * 1.1 : voiceGain, when);
        osc1.connect(g); osc2.connect(g); g.connect(filter);
        osc1.start(when); osc2.start(when);
        const stopAt = when + dur + 0.4;
        osc1.stop(stopAt); osc2.stop(stopAt);
        audioNodes.push(osc1, osc2, g);
      });
      _steelPrevMidis = midis.slice(0, n);
      return;
    }

    // ── Classic synth palette (2026-06-15 — synth-pedagogy + audio-engine + sound-design
    // panel). Each follows the steel/organ idiom: oscillators → per-voice gain → shared
    // filter → master(ADSR) → _hg(level) → trackBus; nodes pushed to audioNodes (prune
    // safety); per-voice gain ÷√n (anti-clip); LFOs pooled PER CALL (one fanned to all
    // voices), envelopes per-voice; synthFx() taps master for the chorus/plate wash.
    if (tone === 'sawpad') {
      // Lush detuned-saw poly pad — the Jupiter/JX wide string-pad-into-supersaw bed under
      // synthwave/city-pop/new-wave. 2 saws/voice (the detune IS the lushness) + a sub on
      // voice 0; ONE shared slow LFO fanned to every voice's detune = the chorus shimmer.
      const n = Math.min(5, midis.length);
      const master = ctx.createGain(), filter = ctx.createBiquadFilter();
      const bMul = 0.6 + bright * 0.9, fBase = (instrument === 'bass' ? 900 : 1700) * bMul;
      filter.type = 'lowpass'; filter.Q.setValueAtTime(0.6, when);
      filter.frequency.setValueAtTime(fBase * 0.55, when);
      filter.frequency.linearRampToValueAtTime(fBase, when + Math.min(0.5, dur * 0.5));
      filter.frequency.linearRampToValueAtTime(fBase * 0.78, when + dur);
      master.gain.setValueAtTime(0.0001, when);
      master.gain.exponentialRampToValueAtTime(0.20, when + Math.min(0.35, dur * 0.4));
      master.gain.linearRampToValueAtTime(0.17, when + Math.max(0.4, dur - 0.25));
      master.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.3);
      filter.connect(master); const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(filter, master);
      synthFx(ctx, master, 0.5, 0.30);
      const lfo = ctx.createOscillator(), lg = ctx.createGain();          // shared detune shimmer
      lfo.type = 'sine'; lfo.frequency.setValueAtTime(0.25, when); lg.gain.setValueAtTime(18, when);
      lfo.connect(lg); lfo.start(when); lfo.stop(when + dur + 0.3); audioNodes.push(lfo, lg);
      const voiceGain = 0.34 / Math.sqrt(n);
      midis.slice(0, n).forEach((midi, i) => {
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        o1.type = 'sawtooth'; o2.type = 'sawtooth';
        const f = midiToFreq(midi); o1.frequency.setValueAtTime(f, when); o2.frequency.setValueAtTime(f, when);
        o1.detune.setValueAtTime(-(11 + bright * 4), when); o2.detune.setValueAtTime(11 + bright * 4, when);
        lg.connect(o1.detune); lg.connect(o2.detune);
        g.gain.setValueAtTime(i === 0 ? voiceGain * 1.1 : voiceGain, when);
        o1.connect(g); o2.connect(g); g.connect(filter);
        o1.start(when); o2.start(when); o1.stop(when + dur + 0.3); o2.stop(when + dur + 0.3);
        audioNodes.push(o1, o2, g);
        if (i === 0) { const sub = ctx.createOscillator(), sg = ctx.createGain();   // body
          sub.type = 'triangle'; sub.frequency.setValueAtTime(f / 2, when); sg.gain.setValueAtTime(voiceGain * 0.35, when);
          sub.connect(sg); sg.connect(filter); sub.start(when); sub.stop(when + dur + 0.3); audioNodes.push(sub, sg); }
      });
      return;
    }
    if (tone === 'polybrass') {
      // Analog poly-brass STAB + swell (Jupiter/OB). Character = the fast filter "blat"
      // (cutoff overshoot) + delayed vibrato; adapts stab(short dur)↔swell(long dur).
      // Hearing-safety (sound-design): 8 ms attack floor, density-softened; the overshoot
      // capped (≤4.8k, Q≤2, ≥6 ms sweep) so a dense stab can't spike.
      const n = Math.min(5, midis.length);
      const master = ctx.createGain(), filter = ctx.createBiquadFilter();
      const fBase = Math.min(4800, 1600 * (0.7 + bright * 0.7));
      filter.type = 'lowpass'; filter.Q.setValueAtTime(2.0, when);
      filter.frequency.setValueAtTime(fBase * 0.45, when);
      filter.frequency.linearRampToValueAtTime(Math.min(4800, fBase * 1.25), when + 0.06);   // the brass blat
      filter.frequency.linearRampToValueAtTime(fBase, when + 0.25);
      const atk = 0.008 + 0.004 * (n / 5);                                                    // density-softened attack floor
      master.gain.setValueAtTime(0.0001, when);
      master.gain.exponentialRampToValueAtTime(0.20, when + atk);
      master.gain.linearRampToValueAtTime(0.16, when + Math.max(atk + 0.05, dur - 0.1));
      master.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.18);
      filter.connect(master); const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(filter, master);
      synthFx(ctx, master, 0.35, 0.25);
      const lfo = ctx.createOscillator(), lg = ctx.createGain();          // delayed vibrato (blooms after attack)
      lfo.type = 'sine'; lfo.frequency.setValueAtTime(5.5, when); lg.gain.setValueAtTime(0.0001, when);
      lg.gain.linearRampToValueAtTime(8, when + 0.3); lfo.connect(lg); lfo.start(when); lfo.stop(when + dur + 0.18); audioNodes.push(lfo, lg);
      const voiceGain = 0.30 / Math.sqrt(n);
      midis.slice(0, n).forEach((midi, i) => {
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        o1.type = 'sawtooth'; o2.type = 'sawtooth';
        const f = midiToFreq(midi); o1.frequency.setValueAtTime(f, when); o2.frequency.setValueAtTime(f, when);
        o1.detune.setValueAtTime(-7, when); o2.detune.setValueAtTime(7, when);
        lg.connect(o1.detune); lg.connect(o2.detune);
        g.gain.setValueAtTime(i === 0 ? voiceGain * 1.1 : voiceGain, when);
        o1.connect(g); o2.connect(g); g.connect(filter);
        o1.start(when); o2.start(when); o1.stop(when + dur + 0.18); o2.stop(when + dur + 0.18);
        audioNodes.push(o1, o2, g);
      });
      return;
    }
    if (tone === 'neonlead') {
      // Mono supersaw HERO lead (JP-8000 Super Saw) — synthwave/city-pop neon melody. MONO
      // (top note); 7 detuned saws + sub square; ONE shared LFO bank for delayed wrist
      // vibrato; portamento on every interval ≤ an octave (a lead glides). Library voice
      // today — the band lead is the PLAYER's seat; available for a future trade-solos lane.
      const midi = midis[midis.length - 1];
      const master = ctx.createGain(), filter = ctx.createBiquadFilter();
      const fBase = 3200 * (0.7 + bright * 0.6);
      filter.type = 'lowpass'; filter.Q.setValueAtTime(3, when);
      filter.frequency.setValueAtTime(fBase * 0.7, when);
      filter.frequency.linearRampToValueAtTime(fBase, when + 0.12);
      master.gain.setValueAtTime(0.0001, when);
      master.gain.exponentialRampToValueAtTime(0.24, when + 0.012);
      master.gain.linearRampToValueAtTime(0.20, when + Math.max(0.1, dur - 0.1));
      master.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.12);
      filter.connect(master); const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(filter, master);
      synthFx(ctx, master, 0.4, 0.20);
      const f = midiToFreq(midi);
      let fFrom = f;
      if (_neonLeadPrevMidi != null && Math.abs(_neonLeadPrevMidi - midi) > 0 && Math.abs(_neonLeadPrevMidi - midi) <= 12) fFrom = midiToFreq(_neonLeadPrevMidi);
      _neonLeadPrevMidi = midi;
      const vib = ctx.createOscillator(), vg = ctx.createGain();          // shared, delayed vibrato
      vib.type = 'sine'; vib.frequency.setValueAtTime(5.8, when); vg.gain.setValueAtTime(0.0001, when);
      vg.gain.linearRampToValueAtTime(12, when + 0.25); vib.connect(vg); vib.start(when); vib.stop(when + dur + 0.12); audioNodes.push(vib, vg);
      const DET = [-18, -11, -6, 0, 6, 11, 18], saw = 0.7 / Math.sqrt(7);
      DET.forEach(cents => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth'; o.detune.setValueAtTime(cents, when);
        if (fFrom !== f) { o.frequency.setValueAtTime(fFrom, when); o.frequency.exponentialRampToValueAtTime(f, when + 0.08); }
        else o.frequency.setValueAtTime(f, when);
        vg.connect(o.detune); g.gain.setValueAtTime(saw, when);
        o.connect(g); g.connect(filter); o.start(when); o.stop(when + dur + 0.12); audioNodes.push(o, g);
      });
      const sub = ctx.createOscillator(), sg = ctx.createGain();          // octave-down square weight
      sub.type = 'square'; sub.frequency.setValueAtTime(f / 2, when); sg.gain.setValueAtTime(0.25, when);
      sub.connect(sg); sg.connect(filter); sub.start(when); sub.stop(when + dur + 0.12); audioNodes.push(sub, sg);
      return;
    }
    if (tone === 'pwmpad') {
      // Hollow PWM string-machine / Juno poly (Solina) — new-wave/pop/city-pop verses.
      // Web Audio has no pulse-width param, so PWM is faked: two detuned squares beating,
      // a slow shared LFO on one square's detune makes the beat "breathe" = the PWM wobble.
      const n = Math.min(5, midis.length);
      const master = ctx.createGain(), filter = ctx.createBiquadFilter();
      const fBase = 1400 * (0.6 + bright * 0.8);
      filter.type = 'lowpass'; filter.Q.setValueAtTime(0.7, when);
      filter.frequency.setValueAtTime(fBase * 0.6, when);
      filter.frequency.linearRampToValueAtTime(fBase, when + Math.min(0.4, dur * 0.4));
      filter.frequency.linearRampToValueAtTime(fBase * 0.8, when + dur);
      master.gain.setValueAtTime(0.0001, when);
      master.gain.exponentialRampToValueAtTime(0.20, when + Math.min(0.25, dur * 0.35));
      master.gain.linearRampToValueAtTime(0.17, when + Math.max(0.3, dur - 0.2));
      master.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.3);
      filter.connect(master); const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(filter, master);
      synthFx(ctx, master, 0.4, 0.30);
      const lfo = ctx.createOscillator(), lg = ctx.createGain();          // the PWM "breathe"
      lfo.type = 'sine'; lfo.frequency.setValueAtTime(0.4, when); lg.gain.setValueAtTime(10, when);
      lfo.connect(lg); lfo.start(when); lfo.stop(when + dur + 0.3); audioNodes.push(lfo, lg);
      const voiceGain = 0.34 / Math.sqrt(n);
      midis.slice(0, n).forEach((midi, i) => {
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        o1.type = 'square'; o2.type = 'square';
        const f = midiToFreq(midi); o1.frequency.setValueAtTime(f, when); o2.frequency.setValueAtTime(f, when);
        o1.detune.setValueAtTime(-6, when); o2.detune.setValueAtTime(6, when);
        lg.connect(o2.detune);
        g.gain.setValueAtTime(i === 0 ? voiceGain * 1.1 : voiceGain, when);
        o1.connect(g); o2.connect(g); g.connect(filter);
        o1.start(when); o2.start(when); o1.stop(when + dur + 0.3); o2.stop(when + dur + 0.3);
        audioNodes.push(o1, o2, g);
      });
      return;
    }
    if (tone === 'fmep') {
      // FM electric piano (DX-style glassy bell tine) — the city-pop/pop/R&B EP the sampled
      // CP-80/Rhodes don't cover. Real FM: modulator→gain→carrier.frequency, the mod INDEX
      // decaying (3.5→0.2) = the bright bell attack into a mellow body (the FM analogue of
      // env-to-cutoff). A 14:1 bell pair + a plain-sine body / voice; capped at 4 voices.
      const n = Math.min(4, midis.length);
      const master = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(6000, when); lp.Q.setValueAtTime(0.5, when);
      master.gain.setValueAtTime(0.0001, when);
      master.gain.exponentialRampToValueAtTime(0.26, when + 0.004);
      master.gain.exponentialRampToValueAtTime(0.08, when + Math.min(0.4, dur * 0.35));
      master.gain.linearRampToValueAtTime(0.06, when + Math.max(0.41, dur - 0.05));
      master.gain.linearRampToValueAtTime(0.0001, when + dur);
      lp.connect(master); const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(lp, master);
      synthFx(ctx, master, 0.3, 0.15);
      const voiceGain = 0.42 / Math.sqrt(n);
      midis.slice(0, n).forEach(midi => {
        const cf = midiToFreq(midi), stop = when + dur + 0.05;
        const car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
        car.type = 'sine'; car.frequency.setValueAtTime(cf, when);
        mod.type = 'sine'; mod.frequency.setValueAtTime(cf * 14, when);
        mg.gain.setValueAtTime(cf * 3.5, when); mg.gain.exponentialRampToValueAtTime(cf * 0.2, when + Math.min(0.4, dur * 0.4));
        mod.connect(mg); mg.connect(car.frequency); car.connect(g); g.gain.setValueAtTime(voiceGain, when); g.connect(lp);
        const car2 = ctx.createOscillator(), g2 = ctx.createGain();        // plain-sine body for warmth
        car2.type = 'sine'; car2.frequency.setValueAtTime(cf, when); g2.gain.setValueAtTime(voiceGain * 0.5, when);
        car2.connect(g2); g2.connect(lp);
        car.start(when); mod.start(when); car2.start(when);
        car.stop(stop); mod.stop(stop); car2.stop(stop);
        audioNodes.push(car, mod, mg, g, car2, g2);
      });
      return;
    }
    if (tone === 'pluck') {
      // Short percussive synth pluck — the synthwave 16th ARP voice + a staccato pop/disco
      // stab. Character = the FAST DOWNWARD filter env (cutoff closes) + a plucky amp decay;
      // even on a long dur it decays short so each arp step articulates and a:'ring' tails
      // overlap into the churn. Oscs stop at the decay end (cheap for the dense arp).
      const n = Math.min(5, midis.length);
      const master = ctx.createGain(), filter = ctx.createBiquadFilter();
      const fBase = 2200 * (0.6 + bright * 0.7), decay = Math.min(0.4, Math.max(0.12, dur * 0.7));
      filter.type = 'lowpass'; filter.Q.setValueAtTime(2, when);
      filter.frequency.setValueAtTime(fBase * 1.4, when);
      filter.frequency.exponentialRampToValueAtTime(Math.max(300, fBase * 0.5), when + 0.12);
      master.gain.setValueAtTime(0.0001, when);
      master.gain.exponentialRampToValueAtTime(0.24, when + 0.004);
      master.gain.exponentialRampToValueAtTime(0.0001, when + Math.min(0.35, Math.max(0.08, dur * 0.7)));
      filter.connect(master); const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
      audioNodes.push(filter, master);
      synthFx(ctx, master, 0, 0.15);
      const voiceGain = 0.40 / Math.sqrt(n);
      midis.slice(0, n).forEach((midi, i) => {
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        o1.type = 'sawtooth'; o2.type = 'square';
        const f = midiToFreq(midi); o1.frequency.setValueAtTime(f, when); o2.frequency.setValueAtTime(f, when); o2.detune.setValueAtTime(5, when);
        g.gain.setValueAtTime(i === 0 ? voiceGain * 1.1 : voiceGain, when);
        o1.connect(g); o2.connect(g); g.connect(filter);
        const stop = when + decay + 0.05;
        o1.start(when); o2.start(when); o1.stop(stop); o2.stop(stop);
        audioNodes.push(o1, o2, g);
      });
      return;
    }

    // pad (default) — triangle-led voices with ONE soft saw for a little edge
    // (stacking 4 saws was buzzy/harsh); per-voice gain normalized by voice count
    // so denser chords don't overdrive; lowpass that opens then settles so the
    // pad breathes instead of sitting static.
    const n = Math.min(5, midis.length);
    const master = ctx.createGain(), filter = ctx.createBiquadFilter();
    const bMul = 0.6 + bright * 0.8; // brightness scales the pad's lowpass window
    const fLo = (instrument === 'bass' ? 700 : 1100) * bMul, fHi = (instrument === 'bass' ? 1500 : 2600) * bMul;
    filter.type = 'lowpass'; filter.Q.setValueAtTime(0.5, when);
    filter.frequency.setValueAtTime(fLo, when);
    filter.frequency.exponentialRampToValueAtTime(fHi, when + Math.min(0.18, dur * 0.4));
    filter.frequency.exponentialRampToValueAtTime(Math.max(fLo, fHi * 0.72), when + dur);
    master.gain.setValueAtTime(0.0001, when);
    master.gain.exponentialRampToValueAtTime(0.26, when + 0.022);
    master.gain.linearRampToValueAtTime(0.2, when + Math.max(0.1, dur - 0.18));
    master.gain.linearRampToValueAtTime(0.0001, when + dur);
    filter.connect(master); const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, busName)); audioNodes.push(_hg);
    audioNodes.push(filter, master);
    const voiceGain = 0.5 / Math.sqrt(n);
    midis.slice(0, n).forEach((midi, i) => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = (i === 1) ? 'sawtooth' : 'triangle';            // single soft saw for edge; rest triangle
      osc.frequency.setValueAtTime(midiToFreq(midi), when);
      osc.detune.setValueAtTime((i - (n - 1) / 2) * 4, when);     // gentle spread, centred
      g.gain.setValueAtTime(i === 0 ? voiceGain * 1.25 : (i === 1 ? voiceGain * 0.7 : voiceGain), when);
      osc.connect(g); g.connect(filter); osc.start(when); osc.stop(when + dur + 0.05); audioNodes.push(osc, g);
    });
  }
  // Analog synth BASS (mono) — saw + sub-octave square through a resonant LP with a fast
  // env-to-cutoff sweep (the punch) + a near-prev portamento slide (synthwave/funk/pop). Its
  // OWN dedicated voice on the 'bass' bus (audio-engine 2026-06-15: a GM multisample can't do
  // the sweep or the slide). lvl already carries bass.level × vel; mono → no √n.
  /** @param {AudioContext} ctx @param {number} when @param {number} midi @param {number} dur @param {number} lvl @param {number | null} prevMidi */
  function scheduleSynthBass(ctx, when, midi, dur, lvl, prevMidi) {
    const f = midiToFreq(midi);
    const master = ctx.createGain(), filter = ctx.createBiquadFilter();
    const fBase = 420;                                                    // bass filters sit LOW
    filter.type = 'lowpass'; filter.Q.setValueAtTime(5, when);
    filter.frequency.setValueAtTime(fBase * 2.2, when);
    filter.frequency.exponentialRampToValueAtTime(fBase, when + 0.08);    // the punch
    master.gain.setValueAtTime(0.0001, when);
    master.gain.exponentialRampToValueAtTime(0.30, when + 0.006);
    master.gain.linearRampToValueAtTime(0.18, when + 0.1);
    master.gain.linearRampToValueAtTime(0.16, when + Math.max(0.12, dur - 0.04));
    master.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.03);
    filter.connect(master); const _hg = ctx.createGain(); _hg.gain.value = lvl; master.connect(_hg); _hg.connect(trackBus(ctx, 'bass')); audioNodes.push(_hg);
    audioNodes.push(filter, master);
    const saw = ctx.createOscillator(), sub = ctx.createOscillator(), gs = ctx.createGain(), gsub = ctx.createGain();
    saw.type = 'sawtooth'; sub.type = 'square'; sub.frequency.setValueAtTime(f / 2, when);
    let fFrom = f;     // slide from a near previous note (≤ P5), else clean attack
    if (prevMidi != null && Math.abs(prevMidi - midi) > 0 && Math.abs(prevMidi - midi) <= 7) fFrom = midiToFreq(prevMidi);
    if (fFrom !== f) { saw.frequency.setValueAtTime(fFrom, when); saw.frequency.exponentialRampToValueAtTime(f, when + 0.06); }
    else saw.frequency.setValueAtTime(f, when);
    gs.gain.setValueAtTime(0.5, when); gsub.gain.setValueAtTime(0.4, when);
    saw.connect(gs); gs.connect(filter); sub.connect(gsub); gsub.connect(filter);
    const stop = when + dur + 0.04;
    saw.start(when); sub.start(when); saw.stop(stop); sub.stop(stop);
    audioNodes.push(saw, sub, gs, gsub);
  }
  // Three click tiers: accent (group/measure downbeat), normal (on-beat), and
  // soft (a count-in subdivision tick between beats).
  /** @param {AudioContext} ctx @param {number} when @param {boolean} accent @param {boolean} soft @param {number} [levelMul] */
  function scheduleClick(ctx, when, accent, soft, levelMul) {
    const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
    const freq = accent ? 1760 : (soft ? 900 : 1120);
    const peak = (accent ? 0.14 : (soft ? 0.05 : 0.09)) * (levelMul || 1);
    const decay = accent ? 0.055 : (soft ? 0.03 : 0.04);
    osc.type = 'square'; osc.frequency.setValueAtTime(freq, when); filter.type = 'highpass'; filter.frequency.setValueAtTime(650, when);
    gain.gain.setValueAtTime(0.0001, when); gain.gain.exponentialRampToValueAtTime(peak, when + 0.002); gain.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    osc.connect(filter); filter.connect(gain); gain.connect(trackBus(ctx, 'click')); osc.start(when); osc.stop(when + 0.07); audioNodes.push(osc, filter, gain);
  }
  // ── Procedural drum kit (audio-realism Phase D — synth 808/909) ─────────────
  // Zero-asset, zero-licensing, authentic-by-construction electronic kit (and the
  // never-silent failover for the sampled kits in D4). Every hit gets a 3–6 ms
  // attack ramp (no hard transient) and routes through the drum sub-bus (its own
  // compressor + >8 kHz shelf, before the master limiter). `vol` already carries
  // the role level × structural velocity; per-piece peak gains shape the balance
  // (kick softened most). Starting numbers — ear-tunable on the backend.
  let /** @type {AudioBuffer | null} */ _drumNoiseBuf = null, /** @type {AudioContext | null} */ _drumNoiseCtx = null;
  /** @param {AudioContext} ctx */
  function drumNoiseBuffer(ctx) {
    if (_drumNoiseBuf && _drumNoiseCtx === ctx) return _drumNoiseBuf;
    const len = Math.floor(ctx.sampleRate * 1.0);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    _drumNoiseBuf = buf; _drumNoiseCtx = ctx; return buf;
  }
  // Natural ring-out per piece for sampled hits (cymbals ring; hats/kick are short).
  // hh_open uses the choke dur from buildDrumEvents instead.
  /** @type {Record<string, number>} */
  const DRUM_NATURAL_DUR = {
    kick:0.5, snare:0.4, snare_xstick:0.18,
    hh_closed:0.12, hh_pedal:0.1, hh_open:0.5,
    ride:0.6, ride_bell:0.35, bell:0.3,
    crash_l:2.0, crash_r:2.0, splash:1.2, china:1.4,
    tom_hi:0.5, tom_mid:0.5, tom_low:0.5, tom_floor:0.55, clap:0.3,
  };
  // Play one sampled drum hit via VirtuosoLabWebAudioFont — wafVoice MINUS wafLoudnessTrim (a
  // drum note number is a piece selector, not a pitch, so the pitch-tilt is wrong).
  // Routes through the drum sub-bus (its own comp + shelf, before the master limiter).
  /** @param {AudioContext} ctx @param {import('./src/types/waf.js').WavePreset | null} preset @param {number} note @param {number} when @param {number} vol @param {number} dur */
  function wafDrumVoice(ctx, preset, note, when, vol, dur) {
    if (!wafPlayer || !preset) return;
    const e = wafPlayer.queueWaveTable(ctx, trackBus(ctx, 'drums'), preset, when, note, Math.max(0.08, dur || 0.4), Math.max(0, vol));
    if (e) audioNodes.push({ stop() { try { e.cancel(); } catch (_) {} }, disconnect() {} });
  }
  // RR rotation per piece for the REAL sampled kit — rotates through a piece's round-robin
  // takes so a fast repeated voice (driving hats/ride/kick) never machine-guns.
  /** @type {Record<string, number>} */
  const _dkRr = {};
  /** @param {string} piece @param {number} count */
  function dkRrPick(piece, count) {
    if (count <= 1) return 1;
    _dkRr[piece] = ((_dkRr[piece] || 0) % count) + 1;
    return _dkRr[piece];
  }
  // Play one hit from a REAL kit sample bank (virtuosity_drums) — a bare BufferSource→Gain
  // one-shot through the drums bus (2 nodes/hit, keeps the 16th-hat node count down; the
  // natural decay + the baked-in HF shelf live in the sample). ~1.5 ms attack declick, NOT
  // the 4 ms melodic ramp (it would blunt the transient — sound-design call). Returns false
  // if the buffer isn't loaded yet so the caller falls back to FluidR3/synth (degraded-but-
  // audible, never silent). hh_open honors the choke `dur` from buildDrumEvents.
  /** @param {AudioContext} ctx @param {import('./src/types/audio-graph.js').DrumBank} bank @param {string} piece @param {number} when @param {number} vol @param {number} dur @param {number} kitLevel */
  function scheduleDkHit(ctx, bank, piece, when, vol, dur, kitLevel) {
    const token = bank.src[piece]; if (!token) return false;
    const file = bank.file(token, dkRrPick(piece, bank.rr[token] || 1));
    ensureSgBuffer(file);
    const entry = sgBuffers[file];
    if (!entry || entry.state !== 'ready' || !entry.buf) return false;
    const pg = DRUM_PIECE_GAIN[piece] != null ? DRUM_PIECE_GAIN[piece] : 1;
    const v = Math.max(0, vol) * (kitLevel || 1) * pg;
    if (v <= 0) return true;
    const src = ctx.createBufferSource(); src.buffer = entry.buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), when + 0.0015);   // declick, not the melodic ramp
    src.connect(gain); gain.connect(trackBus(ctx, 'drums'));
    src.start(when);
    if (piece === 'hh_open' && Number.isFinite(dur) && dur > 0 && dur < entry.buf.duration) {
      const stopAt = when + dur;   // closed/pedal hat chokes the open ring
      gain.gain.setValueAtTime(v, stopAt);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopAt + 0.02);
      try { src.stop(stopAt + 0.03); } catch (_) {}
    }
    audioNodes.push({ stop() { try { src.stop(); } catch (_) {} }, disconnect() { try { src.disconnect(); gain.disconnect(); } catch (_) {} } });
    return true;
  }
  // Dispatch one drum hit. Sample kits (Phase D4) play the FluidR3 one-shot when its
  // preset is loaded; until then (or for a missing piece) they fall back to the synth
  // 909 voice — degraded-but-audible, never silent (matches the melodic failover).
  /** @param {AudioContext} ctx @param {import('./src/types/audio-graph.js').DrumKit & {id: string}} kit @param {string | undefined} piece @param {number} when @param {number} vol @param {number | undefined} dur */
  function scheduleDrumHit(ctx, kit, piece, when, vol, dur) {
    if (kit && kit.engine === 'sample' && kit.pieces) {
      // REAL sampled kit first (virtuosity buffers); falls through if this piece is
      // un-harvested (ride_bell/splash/…) or its buffer hasn't finished loading.
      const b = kit.bank && DRUMKIT_BANKS[String(kit.bank)];
      if (b && b.src[String(piece)] && scheduleDkHit(ctx, b, /** @type {string} */ (piece), when, vol, /** @type {number} */ (dur), kit.level || 1)) return;
      const note = kit.pieces[String(piece)];
      if (note != null && SAMPLED_DRUM_NOTES.has(note)) {   // skip uncommitted notes (no 404 retry)
        ensureDrumPiece(kit, /** @type {string} */ (piece));   // lazy-load cymbals/toms on first use
        const preset = getReadyWafPreset(drumVar(note, kit.font, kit.variant));
        if (preset) {
          const d = (piece === 'hh_open' && Number.isFinite(dur)) ? (/** @type {number} */ (dur)) : (DRUM_NATURAL_DUR[String(piece)] || 0.4);
          const g = DRUM_PIECE_GAIN[String(piece)] != null ? DRUM_PIECE_GAIN[String(piece)] : 1;
          wafDrumVoice(ctx, preset, note, when, Math.max(0, vol) * (kit.level || 1) * g, d);
          return;
        }
      }
      scheduleSynthDrumHit(ctx, '909', /** @type {string} */ (piece), when, vol, /** @type {number} */ (dur));   // fallback: cold-load / missing piece
      return;
    }
    scheduleSynthDrumHit(ctx, (kit && kit.preset) || '909', /** @type {string} */ (piece), when, vol, /** @type {number} */ (dur));
  }
  // Procedural synth drum voice (808/909) — the electronic kits + the sample failover.
  /** @param {AudioContext} ctx @param {string | undefined} preset @param {string} piece @param {number} when @param {number} vol @param {number} dur */
  function scheduleSynthDrumHit(ctx, preset, piece, when, vol, dur) {
    const out = trackBus(ctx, 'drums');
    // Per-piece relative gain (sound-design) — tames the hot GM ride/cymbals/hats.
    const v = Math.max(0, (vol || 0) * (DRUM_PIECE_GAIN[piece] != null ? DRUM_PIECE_GAIN[piece] : 1));
    if (v <= 0) return;
    const RAMP = 0.004;   // 4 ms attack ramp — hearing-safe, no click transient
    /** @param {GainNode} g @param {number} peak @param {number} decay */
    const env = (g, peak, decay) => {
      const p = Math.max(0.0002, peak);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(p, when + RAMP);
      g.gain.exponentialRampToValueAtTime(0.0001, when + RAMP + Math.max(0.02, decay));
    };
    const is808 = preset === '808';
    /** @param {number} peak @param {number} decay @param {BiquadFilterType} type @param {number} freq @param {number} [q] */
    const noise = (peak, decay, type, freq, q) => {
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = drumNoiseBuffer(ctx);
      f.type = type; f.frequency.value = freq; if (q != null) f.Q.value = q;
      env(g, peak, decay);
      n.connect(f); f.connect(g); g.connect(out);
      n.start(when); n.stop(when + RAMP + decay + 0.05);
      audioNodes.push(n, f, g);
    };
    switch (piece) {
      case 'kick': {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = 'sine';
        const f0 = is808 ? 120 : 170, f1 = is808 ? 43 : 52, pdrop = is808 ? 0.05 : 0.04;
        const decay = is808 ? 0.6 : 0.22;
        osc.frequency.setValueAtTime(f0, when);
        osc.frequency.exponentialRampToValueAtTime(f1, when + pdrop);
        env(g, 0.5 * v, decay);            // kick softened most (biggest peak risk)
        let tail = g;
        if (is808) { const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 30; g.connect(hp); tail = hp; audioNodes.push(hp); }
        osc.connect(g); tail.connect(out);
        osc.start(when); osc.stop(when + RAMP + decay + 0.05); audioNodes.push(osc, g);
        if (!is808) noise(0.16 * v, 0.02, 'bandpass', 2200, 0.8);   // 909 click layer
        break;
      }
      case 'snare':
        noise(0.5 * v, 0.16, 'bandpass', 2600, 0.6);                // crack (70%)
        { const osc = ctx.createOscillator(), g = ctx.createGain();  // tone body (30%)
          osc.type = 'triangle'; osc.frequency.setValueAtTime(190, when);
          env(g, 0.22 * v, 0.1); osc.connect(g); g.connect(out);
          osc.start(when); osc.stop(when + RAMP + 0.12 + 0.05); audioNodes.push(osc, g); }
        break;
      case 'hh_closed':
        noise(0.32 * v, 0.035, 'highpass', 7500);
        break;
      case 'hh_open':
        noise(0.28 * v, (Number.isFinite(dur) ? dur : 0.32), 'highpass', 7500);
        break;
      case 'hh_pedal':                                             // foot chick — dark + short
        noise(0.42 * v, 0.07, 'bandpass', 5500, 1.2);
        break;
      case 'snare_xstick': {                                       // woody cross-stick click
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(820, when);
        osc.frequency.exponentialRampToValueAtTime(440, when + 0.03);
        env(g, 0.5 * v, 0.08); osc.connect(g); g.connect(out);
        osc.start(when); osc.stop(when + RAMP + 0.1); audioNodes.push(osc, g);
        noise(0.18 * v, 0.03, 'bandpass', 1800, 1.2);
        break;
      }
      case 'ride': {                                               // warm tip ping — NOT a wash
        [3140, 4180, 5350].forEach((f, i) => {
          const osc = ctx.createOscillator(), g = ctx.createGain();
          osc.type = 'square'; osc.frequency.value = f;
          env(g, (0.05 - i * 0.012) * v, 0.45 + i * 0.1);
          osc.connect(g); g.connect(out);
          osc.start(when); osc.stop(when + RAMP + 0.65); audioNodes.push(osc, g);
        });
        noise(0.05 * v, 0.25, 'highpass', 8000);                  // tip shimmer
        break;
      }
      case 'ride_bell': case 'bell': {                             // short tonal bell ping
        [2400, 3600, 5400].forEach((f, i) => {
          const osc = ctx.createOscillator(), g = ctx.createGain();
          osc.type = 'square'; osc.frequency.value = f;
          env(g, (0.07 - i * 0.015) * v, 0.3); osc.connect(g); g.connect(out);
          osc.start(when); osc.stop(when + RAMP + 0.4); audioNodes.push(osc, g);
        });
        break;
      }
      case 'clap': {
        const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        n.buffer = drumNoiseBuffer(ctx); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.7;
        g.gain.setValueAtTime(0.0001, when);
        [0, 0.01, 0.02].forEach(off => {                            // 3 retriggered bursts
          g.gain.exponentialRampToValueAtTime(0.4 * v, when + off + 0.002);
          g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.08 * v), when + off + 0.008);
        });
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
        n.connect(f); f.connect(g); g.connect(out);
        n.start(when); n.stop(when + 0.2); audioNodes.push(n, f, g);
        break;
      }
      case 'tom_hi': case 'tom_mid': case 'tom_low': case 'tom_floor': {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        const f0 = piece === 'tom_hi' ? 220 : piece === 'tom_mid' ? 150 : piece === 'tom_low' ? 100 : 80;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f0, when);
        osc.frequency.exponentialRampToValueAtTime(f0 * 0.7, when + 0.12);
        env(g, 0.42 * v, 0.25); osc.connect(g); g.connect(out);
        osc.start(when); osc.stop(when + RAMP + 0.25 + 0.05); audioNodes.push(osc, g);
        break;
      }
      case 'crash_l': case 'crash_r': case 'splash': case 'china': {
        // A 6–8 ms soft attack ramp (not the 4 ms transient ramp) so a downbeat
        // crash doesn't slam the limiter; the genre cymbals differ by band/decay.
        const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        n.buffer = drumNoiseBuffer(ctx);
        f.type = 'highpass'; f.frequency.value = piece === 'splash' ? 6500 : piece === 'china' ? 4000 : 5000;
        const decay = piece === 'splash' ? 0.5 : piece === 'china' ? 0.7 : 0.9, CRAMP = 0.007;
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.3 * v), when + CRAMP);
        g.gain.exponentialRampToValueAtTime(0.0001, when + CRAMP + decay);
        n.connect(f); f.connect(g); g.connect(out);
        n.start(when); n.stop(when + CRAMP + decay + 0.05); audioNodes.push(n, f, g);
        break;
      }
    }
  }
  // Resolve the active drum kit OBJECT. Mixer kit override wins, then the profile's
  // kit, then kit_909. An unregistered id falls back to kit_909 so the band is never
  // silent. The returned object carries `id` + the kit's engine/preset/pieces.
  /** @param {import('./src/core/generation-types.js').AudioProfile | null} profile */
  function resolveDrumKit(profile) {
    const kitId = mixerKitFor('drums') || (profile && profile.drums && profile.drums.kit) || 'kit_909';
    const reg = KIT_REGISTRY[kitId] || KIT_REGISTRY.kit_909;
    return Object.assign({ id: KIT_REGISTRY[kitId] ? kitId : 'kit_909' }, reg);
  }
  // ── Per-voice level consistency (audio-realism Phase A) ─────────────────────
  // One named vol per role (not magic scalars scattered through the scheduler) +
  // a perceptual loudness-trim tilt by pitch, so WAF's per-keymap level variance
  // and the Fletcher-Munson low-end dip don't make a run sound uneven. Sound-design
  // targets: lift <150 Hz ~+2.5 dB, flat through the mid band, tame >2 kHz ~−1.5 dB.
  // Applied inside wafVoice (and to the bent-note oscillator fallback so it matches
  // the sampled voice it stands in for). See ROADMAP audio-realism Phase A.
  const WAF_VOICE_VOL = { notes: 0.7, harmony: 0.5, pad: 0.5, bass: 0.8, drums: 0.7 };
  // Per-WAF-preset loudness makeup (Jam-UX reliability slice, sound-design): VirtuosoLabWebAudioFont
  // peak-normalises each preset INDEPENDENTLY (it matches peaks, not perceived loudness),
  // so a sustained voice (organ/epiano/strings/pad) reads far louder than a plucked one
  // (clean/guitar/nylon) at the same peak — a live instrument swap then lurches in level
  // ("too quiet / too loud"). This linear trim equalises perceived loudness across a swap;
  // twin of DRUM_PIECE_GAIN / sgSourceTrim, calibrated against the clean GM27 voice = 1.0.
  // By-ear tunable. Keyed by GM preset number (built from a readable tone→trim table).
  const WAF_TONE_TRIM = { organ: 0.62, epiano: 0.78, piano: 0.80, strings: 0.70, pad: 0.72, clav: 0.85, brass: 0.74, synthlead: 0.85, clean: 1.0, guitar: 1.05, nylon: 1.05, bass: 0.95, upright: 1.0 };
  /** @type {Record<string, number>} */
  const WAF_GM_TRIM = {};
  for (const [tone, tr] of Object.entries(WAF_TONE_TRIM)) { const gm = TONE_GM[tone]; if (gm != null) WAF_GM_TRIM[gm] = tr; }
  /** @param {number | null} gm */
  const wafGmTrim = gm => (gm != null && WAF_GM_TRIM[gm] != null) ? WAF_GM_TRIM[gm] : 1;
  /** @param {number} midi */
  function wafLoudnessTrim(midi) {
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    let db;
    if (f <= 150) db = 2.5;
    else if (f <= 600) db = 2.5 * (1 - (f - 150) / 450);        // 150→600 Hz: +2.5 → 0 dB
    else if (f <= 2000) db = -1.5 * ((f - 600) / 1400);         // 600→2000 Hz: 0 → −1.5 dB
    else db = -1.5;
    return Math.pow(10, db / 20);
  }
  // Band re-entry envelope (sound-design): a Workout's backing drops to silence in
  // each inter-block break (the count-in is click-only), then re-enters on the next
  // block's downbeat. Ramp the backing GROUP gain (harmony+bass+drums) down ~18ms
  // into the break and up ~18ms on the downbeat, so the band doesn't slam from
  // silence to full into the limiter. Click + notes are unaffected (they bypass the
  // group). Single-exercise modes (≤1 segment) have no breaks → no-op. Scheduled at
  // absolute ctx-time each playback pass so it tracks the loop scheduler.
  /** @param {ReturnType<typeof makeBundle>} bundle @param {AudioContext} _ctx @param {number} base @param {number} startFrom @param {number} duration */
  function scheduleBackingEnvelope(bundle, _ctx, base, startFrom, duration) {
    const bus = audioBus; if (!bus || !bus.backingGroup) return;
    const g = bus.backingGroup.gain;
    const bounds = (bundle.segmentBounds || []).filter(b => b && Number.isFinite(b.start) && Number.isFinite(b.end));
    const breaks = [];
    for (let i = 0; i < bounds.length - 1; i++) {
      if (bounds[i + 1].start > bounds[i].end + 1e-3) breaks.push([bounds[i].end, bounds[i + 1].start]);
    }
    const FADE = 0.018, at = (/** @type {number} */ t) => base + (t - startFrom);
    try {
      g.cancelScheduledValues(base);
      if (!breaks.length) { g.setValueAtTime(1, base); return; }       // no breaks (flowing / single block)
      const inBreak = breaks.some(br => startFrom > br[0] - 1e-6 && startFrom < br[1] - 1e-6);
      g.setValueAtTime(inBreak ? 0 : 1, base);
      for (const [b0, b1] of breaks) {
        if (b1 < startFrom || b0 > duration + 0.05) continue;          // outside this pass window
        g.setValueAtTime(1, Math.max(base, at(b0)));                    // band on into the block end
        g.linearRampToValueAtTime(0, Math.max(base, at(b0)) + FADE);    // fade out into the break
        g.setValueAtTime(0, Math.max(base, at(b1) - 1e-3));             // silent through the break
        g.linearRampToValueAtTime(1, at(b1) + FADE);                    // fade in on the next downbeat
      }
    } catch (_) {}
  }
  // Schedule audio events whose ONSET falls in [fromTime, toTime) — the
  // rolling-window chunk. `toTime` omitted = the whole rest of the chart (the
  // A-B segment-loop path still uses that). `onsetOnly` (chunk refills) keeps
  // events that START before fromTime out even when they're still sounding —
  // the previous chunk already scheduled them in full; only the FIRST chunk of
  // an anchor (play/seek) includes straddling sustains, clamped to fromTime.
  // Returns { base, end }: base = the ctx-time chart-time `fromTime` maps to;
  // end = the real last sound-end ctx-time (sustains may outlive the window),
  // which is what chunk pruning must respect.
  /** @param {ReturnType<typeof makeBundle>} bundle @param {number} [fromTime] @param {number} [delaySeconds] @param {number} [toTime] @param {boolean} [onsetOnly] */
  function schedulePreviewAudio(bundle, fromTime, delaySeconds, toTime, onsetOnly) {
    const cfg = readConfig();
    // Prefer the bundle's own audio settings (sessions patch their own config)
    // so the session's checkboxes are honoured rather than the single-exercise ones.
    const audio = bundle.config?.audio || cfg.audio;
    const lead = bundle.leadIn || 0;
    // The count-in lead-in always clicks (it's a count-in), so proceed even when
    // all audio is off if this pass covers the lead-in.
    const wantCountIn = lead > 0 && (fromTime || 0) < lead - 1e-4;
    if (!audio.notes && !audio.metronome && !audio.harmony && !wantCountIn) return;
    const ctx = ensureAudioCtx();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const base = ctx.currentTime + (delaySeconds !== undefined && Number.isFinite(delaySeconds) ? delaySeconds : AUDIO_LOOKAHEAD_SECONDS), startFrom = fromTime || 0;
    // Use the bundle's own openMidis so note frequencies always match what was
    // generated — prevents pitch mismatch when the form's string setup differs
    // from the exercise (e.g. session generated with 6-string, form shows 8-string).
    const opens = (bundle.openMidis && bundle.openMidis.length) ? bundle.openMidis : openMidisForConfig(cfg);
    const instrument = bundle.config?.instrument || cfg.instrument;
    const duration = bundle.songInfo?.duration || 0;
    // Onset-selection window end (exclusive — an event at exactly winEnd
    // belongs to the next chunk; chunks reuse the identical float, so the
    // boundary can't double-schedule or drop). Sound DURATIONS are still
    // clamped to the chart, never to the window — sustains ring past it.
    const winEnd = toTime !== undefined && Number.isFinite(toTime) ? Math.min(toTime, duration) : duration + 0.1;
    let schedEnd = base;   // real last sound-end (ctx time) — for chunk pruning
    // Break-band gain automation rides the persistent backingGroup bus at
    // absolute ctx times, so re-running it per chunk just re-asserts the same
    // points (idempotent) — cheap, and every chunk sees its upcoming breaks.
    if (audio.harmony) scheduleBackingEnvelope(bundle, ctx, base, startFrom, duration);
    const harmProfile = resolveAudioProfile({ ...cfg, audio });
    if (audio.harmony) applyMixRecipe(ctx, { ...cfg, audio });   // genre-band: per-genre MIX deltas (ramped, idempotent per chunk)
    // Sample path: if a voice wants a sampled instrument, kick its (async) load
    // and use it once ready; until then, fall back to the oscillator voice.
    // Three sampled voices: harmony (backing comp), bass (backing bass line),
    // notes (the practice voice). Each falls back independently.
    // Mixer per-channel instrument override wins over the profile's voice (Phase C).
    const profHarmGm = harmProfile.harmony.engine === 'sample' ? TONE_GM[harmProfile.harmony.tone] : null;
    const harmGm  = mixerInstrumentFor('harmony') ?? profHarmGm;
    // The Keys strip ('pad' bus — the sustained layer): its own override, else
    // the profile's dedicated pad slot when declared (distorted keeps the synth
    // pad there — engine!=='sample' resolves null → scheduleHarmonyPad), else
    // the harmony voice (back-compat).
    const profPadGm = harmProfile.pad
      ? (harmProfile.pad.engine === 'sample' ? TONE_GM[String(harmProfile.pad.tone)] : null)
      : profHarmGm;
    const padGm   = mixerInstrumentFor('pad') ?? profPadGm;
    const bassGm  = mixerInstrumentFor('bass')    ?? (harmProfile.bass.engine    === 'sample' ? TONE_GM[harmProfile.bass.tone]    : null);
    const notesGm = mixerInstrumentFor('notes')   ?? (harmProfile.notes.engine   === 'sample' ? TONE_GM[harmProfile.notes.tone]   : null);
    if (audio.harmony && harmGm != null) ensureWafPreset(harmGm);
    if (audio.harmony && padGm != null) ensureWafPreset(padGm);     // sustained layer (Keys)
    if (audio.harmony && bassGm != null) ensureWafPreset(bassGm);   // backing bass (boogie walk)
    if (audio.notes   && notesGm != null) ensureWafPreset(notesGm); // practice voice
    const harmPreset = getReadyWafPreset(harmGm);
    const padPreset = getReadyWafPreset(padGm);
    const bassPreset = getReadyWafPreset(bassGm);
    const notesPreset = getReadyWafPreset(notesGm);
    // Extra per-track comp voices (track-architecture stage 3b): each comp lane a genre declares
    // BEYOND the primary (recipeTracks tracks[]) gets its OWN WAF voice on its OWN bus — the
    // bluegrass GUITAR boom-chuck vs the BANJO roll. Resolve the preset here (re-resolved each
    // rolling-window chunk, so a cold voice warms up), keyed by bus. Empty for the 28 genres
    // with no tracks[] → no extra voices, byte-identical.
    /** @type {Record<string, {gm: number, preset: import('./src/types/waf.js').WavePreset | null}>} */
    const extraPresets = {};
    if (audio.harmony) {
      for (const t of recipeTracks({ ...cfg, audio })) {
        if (t.role !== 'comp' || t.id === 'comp' || t.id === 'pad' || extraPresets[t.bus]) continue;
        const gm = mixerInstrumentFor(t.bus) ?? (t.voice != null ? TONE_GM[t.voice] : null);
        if (gm == null) continue;
        ensureWafPreset(gm);
        extraPresets[t.bus] = { gm, preset: getReadyWafPreset(gm) };
      }
    }
    // Sampled-guitar strip pins (the mixer 'Electric DI' override — see the
    // Shinyguitar block in §14's loader area). Falls back per chord until warm.
    // Like the ensureWafPreset calls above, scheduling kicks the lazy buffer
    // loads itself — paths that skip prewarm (e.g. jamPlay) still warm up, and
    // the rolling window picks the samples up at the next chunk/wrap.
    const sgHarm = sgHarmWanted(harmProfile), sgPad = sgPadWanted(harmProfile), sgNotes = sgNotesWanted(harmProfile);
    if (sgHarm || sgPad || sgNotes) sgPrewarm(bundle);
    // Amp inserts (Guide + Rhythm): resolve each strip's amp for THIS pass (an
    // explicit pick wins; Auto = the profile's declared amp, else Clean for the
    // DI sample voice, else none) and (re)wire the pre-fader insert —
    // idempotent, so per-chunk calls are free.
    _ampWant.notes = resolveAmpId('notes', sgNotes, harmProfile);
    _ampWant.harmony = resolveAmpId('harmony', sgHarm, harmProfile);
    _ampWant.bass = resolveAmpId('bass', false, harmProfile);   // genre-band: metal/punk overdriven bass (bass_drive)
    wireTrackAmp(ctx, 'notes'); wireTrackAmp(ctx, 'harmony'); wireTrackAmp(ctx, 'bass');
    // Per-hit articulation envelope + round-robin micro-variation (genre-band realism
    // slice 2026-06-13): the WAF backing band was articulation-DEAF — every hit played
    // the preset's own sustain envelope cut to length, so a chug, a stab and a let-ring
    // were the SAME sample, only shorter/louder (the "MIDI smell"). sgVoice already does
    // this for the DI guitar; this ports it to the WAF voices (comp/bass/keys) so the
    // whole band catches up. `opts` (backing only):
    //   · artic — reshapes the returned envelope GainNode: chug/stab impose a percussive
    //             RELEASE (the preset's sustainy decay is what made a chug ring); sus/
    //             ring/undefined keep the natural bloom.
    //   · seed  — a DETERMINISTIC per-hit micro-variation: ±detune (the source's detune
    //             AudioParam), ±gain, +onset jitter — kills the machine-gun on repeats.
    // No opts (the practice 'notes' voice) → byte-identical to before (the grading voice
    // stays clean/in-tune). Zero extra nodes: detune/gain/onset ride params that already
    // exist; the envelope reshape reuses the GainNode queueWaveTable returns. Seeded =
    // the same cfg sounds the same every pass (determinism is a hard rule).
    /** @param {import('./src/types/waf.js').WavePreset} preset @param {string} busName @param {number} when @param {number} midi @param {number} d @param {number} vol @param {{seed?: number, artic?: string}} [opts] */
    const wafVoice = (preset, busName, when, midi, d, vol, opts) => {
      let v = vol, w = when, h = 0;
      if (opts && opts.seed != null) {
        h = Math.abs(Math.sin(opts.seed * 12.9898 + midi * 0.073) * 43758.5453) % 1;   // deterministic per-hit hash
        v *= 1 + (h - 0.5) * 0.10;      // ±~0.4 dB gain wobble
        w += h * 0.004;                 // 0–4 ms onset jitter (later only — never before `when`)
      }
      const e = (/** @type {import('./src/types/waf.js').WafPlayer} */ (wafPlayer)).queueWaveTable(ctx, trackBus(ctx, busName), preset, w, midi, d, Math.max(0.0001, v) * wafLoudnessTrim(midi));
      if (!e) return;
      if (opts) {
        // RR detune (cents) — independent of, and additive to, playbackRate; deterministic.
        if (opts.seed != null && e.audioBufferSourceNode && e.audioBufferSourceNode.detune) {
          const h2 = (h * 1.618) % 1;
          try { e.audioBufferSourceNode.detune.setValueAtTime((h2 - 0.5) * 9, w); } catch (_) {}   // ±~4.5 cents
        }
        // Articulation envelope: impose a percussive release on muted/short hits — the
        // gate that separates a chug/stab from a held note (sus/ring keep the bloom).
        const art = opts.artic;
        if ((art === 'chug' || art === 'stab') && e.gain) {
          const hold = art === 'chug' ? 0.04 : 0.07;   // brief sustain at the attack
          const tau  = art === 'chug' ? 0.05 : 0.10;   // then a fast exponential gate
          try { e.gain.cancelScheduledValues(w + hold); e.gain.setTargetAtTime(0.0001, w + hold, tau); } catch (_) {}
        }
      }
      audioNodes.push({ stop() { try { e.cancel(); } catch (_) {} }, disconnect() {} });
    };
    if (audio.harmony) for (const ev of bundle.backingEvents || []) {
      if (ev.role === 'drums') continue;   // drums have their own kit/bus/loop below
      if (ev.end < startFrom || ev.t >= winEnd) continue;
      if (onsetOnly && ev.t < startFrom - 1e-6) continue;  // prior chunk owns it
      const start = Math.max(ev.t, startFrom), end = Math.min(ev.end, duration);
      const when = base + (start - startFrom), d = Math.max(0.2, end - start);
      schedEnd = Math.max(schedEnd, when + d);
      // Velocity tier (mix 7a, step 3): COMP_GROOVES hits carry vel
      // (accent 1.0 / normal 0.78 / ghost 0.45); pad/legacy events have none (=1).
      const vel = ev.vel || 1;
      // Extra per-track comp lane (track-architecture stage 3b): an event tagged with its own
      // track+bus (the bluegrass guitar boom-chuck) plays its OWN WAF voice on its OWN bus,
      // routed HERE before the primary harmony/pad routing below claims it (these hits also
      // carry ev.comp). Cold preset = skip (warm by the next chunk via prewarm; banjo + upright
      // carry it meanwhile). Byte-identical for the 28 genres that emit no ev.track events.
      if (ev.track && ev.bus) {
        const xp = extraPresets[ev.bus];
        if (xp && xp.preset && wafPlayer) {
          const hn = (ev.midis || []).length, hScale = 1 / Math.sqrt(Math.max(1, hn));
          for (const m of (ev.midis || [])) {
            const v = harmProfile.harmony.level * WAF_VOICE_VOL.harmony * hScale * vel * wafGmTrim(xp.gm);
            wafVoice(xp.preset, ev.bus, when, m, d, v, { seed: ev.t + m, artic: ev.a });
          }
        }
        continue;
      }
      if (ev.role === 'bass') {
        // Backing bass line — a real bass voice on its own bus, not the harmony pad.
        if (harmProfile.bass && harmProfile.bass.engine === 'synth') {
          // Analog synth bass (saw+sub, resonant env-to-cutoff, mono glide) — synthwave & co.
          // MONO: one note (audio-engine: a dedicated voice, not a GM multisample).
          const mm = (ev.midis && ev.midis.length) ? ev.midis[ev.midis.length - 1] : null;
          if (mm != null) { scheduleSynthBass(ctx, when, mm, d, harmProfile.bass.level * vel, _synthBassPrevMidi); _synthBassPrevMidi = mm; }
        } else for (const m of (ev.midis || [])) {
          if (bassPreset && wafPlayer) wafVoice(bassPreset, 'bass', when, m, d, harmProfile.bass.level * WAF_VOICE_VOL.bass * vel * wafGmTrim(bassGm), { seed: ev.t + m, artic: ev.a });
          else schedulePluckedString(ctx, when, midiToFreq(m), d, 'bass', harmProfile.bass.level * vel, 0);
        }
      } else {
        // Articulation-routed strips: COMP_GROOVES hits (ev.comp — the cell-driven
        // comping) play on 'harmony' (the Rhythm strip); the legacy coalesced
        // sustained pad plays on 'pad' (the Keys strip). One event, one strip.
        // Keys un-orphan (panel 2026-06-13): a role:'pad' sustain event OR a comp hit
        // flagged padBus (comp-on-Keys, e.g. jazz piano) routes to the Keys strip; a
        // cell comp hit (ev.comp) → Rhythm; the legacy coalesced pad (no comp) → Keys.
        const busName = (ev.role === 'pad' || ev.padBus) ? 'pad' : (ev.comp != null ? 'harmony' : 'pad');
        const preset = busName === 'harmony' ? harmPreset : padPreset;
        // The Keys voice rides its OWN level (harmProfile.pad.level) on the pad bus.
        // Genre-level decouple (Jam-UX reliability slice): a genre's harmony.level is
        // tuned for THAT genre's own voice; when the user PINS a different instrument in
        // the mixer, that genre level is wrong for it (a second "too quiet/loud" offender).
        // Use a neutral reference for an overridden voice; WAF_GM_TRIM does the per-voice match.
        const compGm = busName === 'harmony' ? harmGm : padGm;
        const lvlBase = mixerInstrumentFor(busName) != null ? 0.8
          : (busName === 'pad' && harmProfile.pad && Number.isFinite(harmProfile.pad.level)) ? harmProfile.pad.level
          : harmProfile.harmony.level;
        // Sampled-guitar pin (mixer 'Electric DI'): per-chord all-or-nothing so a
        // half-sampled chord never sounds; WAF (then the pad) covers until warm.
        const sgBank = busName === 'harmony' ? sgHarm : sgPad;
        const useSg = sgBank && ((sgBank === 'shiny' && ev.a === 'chuck') || sgReadyFor(ev.midis, vel, sgBank));
        if (useSg || (preset && wafPlayer)) {
          // Scale per-voice level by 1/√(chord size) so a dense comp doesn't sum hot
          // into the limiter (anti-clip; matches the synth pad's density-scaling).
          const hn = (ev.midis || []).length, hScale = 1 / Math.sqrt(Math.max(1, hn));
          if (useSg && ev.a === 'chuck' && sgBank === 'shiny') {
            // The recorded multi-string dead-strum — ONE unpitched sample per
            // hit (never per chord note). Cold buffer = skip (a missing ghost
            // beats a wrongly pitched WAF stand-in).
            sgVoice(ctx, busName, when, 0, d, (/** @type {number} */ (lvlBase)) * WAF_VOICE_VOL[busName] * vel, 'chuck', vel);
          } else if (useSg && busName === 'harmony') {
            // DOUBLE-TRACK (band-intel C2): two takes of the comp guitar, hard
            // L/R (±0.35), the right side a seeded 12–20ms late + a few cents
            // flat/sharp — per-voice panners sit BEFORE the bus entry so the
            // L/R spread survives the (channel-wise) amp chain, and the RR
            // alternation means each side literally plays a different take.
            // ~0.72 per side keeps the sum at the single-voice loudness.
            const jit = (Math.abs(Math.sin(ev.t * 12.9898)) * 43758.5453) % 1;   // deterministic per hit
            const dly = 0.012 + jit * 0.008, cents = (jit > 0.5 ? 1 : -1) * (3 + jit * 3);
            for (const m of (ev.midis || [])) {
              const v = (/** @type {number} */ (lvlBase)) * WAF_VOICE_VOL[busName] * hScale * vel * 0.72;
              const okL = sgVoice(ctx, busName, when, m, d, v, ev.a, vel, { pan: -0.35, bank: sgBank });
              const okR = sgVoice(ctx, busName, when, m, d, v, ev.a, vel, { pan: 0.35, delay: dly, cents, bank: sgBank });
              if (!okL && !okR && preset && wafPlayer) wafVoice(preset, busName, when, m, d, v / 0.72 * wafGmTrim(compGm), { seed: ev.t + m, artic: ev.a });
            }
          } else {
            for (const m of (ev.midis || [])) {
              const v = (/** @type {number} */ (lvlBase)) * WAF_VOICE_VOL[busName] * hScale * vel;
              if ((!useSg || !sgVoice(ctx, busName, when, m, d, v, ev.a, vel, { bank: sgBank })) && preset && wafPlayer) wafVoice(preset, busName, when, m, d, v * wafGmTrim(compGm), { seed: ev.t + m, artic: ev.a });
            }
          }
        } else {
          // Keys dip (band-intel B2 seed): when the comp guitar is playing, the
          // sustained pad steps back −3 dB so the band doesn't smear (the
          // arrangement knows who plays at build time — no live analysis).
          // Pick the bus's OWN synth tone+level: a comp hit rides the HARMONY tone (e.g.
          // synthwave's arp 'pluck'), the sustained pad rides the PAD tone (sawpad / steel).
          // (Before, pad.tone won for BOTH — fine when only the pad was synth, but synthwave
          // is the first genre with a synth tone on the harmony bus too.) The −3 dB Keys-dip
          // only applies to the sustained pad sitting under a sampled comp.
          const isComp = busName === 'harmony';
          const padTone = isComp ? harmProfile.harmony.tone : ((harmProfile.pad && harmProfile.pad.tone) || harmProfile.harmony.tone);
          const padLevel = isComp ? harmProfile.harmony.level
            : ((harmProfile.pad && harmProfile.pad.level != null ? harmProfile.pad.level : harmProfile.harmony.level) * (sgHarm ? 0.7 : 1));
          scheduleHarmonyPad(ctx, when, ev.midis || [], d, instrument, padTone, { bright: harmProfile.brightness, level: padLevel * vel, bus: busName });
        }
      }
    }
    // Drums (Phase D) — role:'drums' events on their own kit + drum sub-bus. The
    // band plays together, so drums follow the harmony backing (mute via the Mixer
    // Drums channel, or set audio.drums:false). Silent through the count-in: no
    // drum event exists in [0, lead) after the makeBundle shift, and the guard
    // catches any early fill/anticipation a future groove might add.
    if (audio.harmony && audio.drums !== false) {
      const drumKit = resolveDrumKit(harmProfile);
      for (const ev of bundle.backingEvents || []) {
        if (ev.role !== 'drums') continue;
        const drumEvent = /** @type {import('./src/core/generation-types.js').DrumEvent} */ (ev);
        if (ev.t < lead - 1e-4) continue;                 // count-in silence
        if (ev.t < startFrom || ev.t >= winEnd) continue;
        scheduleDrumHit(ctx, drumKit, drumEvent.voice, base + (ev.t - startFrom),
          (/** @type {number} */ (WAF_VOICE_VOL.drums)) * (Number.isFinite(drumEvent.velocity) ? drumEvent.velocity : 0.78), drumEvent.dur);
        schedEnd = Math.max(schedEnd, base + (ev.t - startFrom) + (Number.isFinite(drumEvent.dur) ? (/** @type {number} */ (drumEvent.dur)) + 0.5 : 2));
      }
    }
    if (audio.notes) for (const n of bundle.notes || []) {
      if (n._tail) continue;  // visual loop-preview copy; audio loops via the scheduler
      if (n.solo === 'you') continue;  // Spotlight (J-3): YOUR turn → you're the soloist, the band's lead voice is silent (the tag only exists in spotlight charts)
      if (transport.preRollUntil > 0 && n.t < transport.preRollUntil) continue;  // resume pre-roll runway: notes muted, only the count-in click plays
      if (n.t < startFrom || n.t >= winEnd) continue;
      if (n.s < 0 || n.s >= opens.length || n.f < 0) continue;
      const when = base + (n.t - startFrom), midi = opens[n.s] + n.f;
      const dur = Math.max(0.10, Math.min(0.85, n.sus || 0.24)), bend = bendSemitones(n.bn);
      schedEnd = Math.max(schedEnd, when + dur);
      // Sampled practice voice for plain notes; the oscillator voice still owns
      // BENT notes (the sampler can't slide pitch) so blues bends stay audible.
      // The 'Electric DI' pin tries the Shinyguitar voice first (muted notes —
      // n.mt — get the palm-mute envelope); WAF covers while it warms.
      // Articulation routing (band-intel C1): a DEAD note (n.mt — the ghost
      // thunk) plays the recorded per-string mute sample; a palm-muted pitched
      // note (n.pm — the chug) gets the short-hold envelope; everything else
      // sustains. The dead-note sample is honest in a way an envelope-choked
      // pitched sustain never was.
      const sgArtic = n.mt ? { mutestr: n.s } : n.pm ? 'chug' : '';
      const sgPlayed = sgNotes && bend <= 0
        && sgVoice(ctx, 'notes', when, midi, dur, harmProfile.notes.level * WAF_VOICE_VOL.notes, sgArtic, 1, { bank: sgNotes });
      if (sgPlayed) {
        // scheduled on the sample voice — nothing further
      } else if (notesPreset && wafPlayer && bend <= 0) {
        wafVoice(notesPreset, 'notes', when, midi, dur, harmProfile.notes.level * WAF_VOICE_VOL.notes);
      } else {
        // When a sampled voice IS available but this note bends, the oscillator
        // stands in for it — match its level to the sampler (incl. the loudness
        // trim) so the bend doesn't lurch in volume mid-run (audio-realism A3).
        // Oscillator-only profiles (no notesPreset) keep their own level.
        const sampled = notesPreset && wafPlayer;
        const g = sampled
          ? harmProfile.notes.level * WAF_VOICE_VOL.notes * wafLoudnessTrim(midi)
          : (audio.harmony ? 0.9 : 1.25);
        schedulePluckedString(ctx, when, midiToFreq(midi), dur, instrument, g, bend);
      }
    }
    // Music beats click only when the metronome option is on; the count-in
    // lead-in bars ([0, leadIn)) ALWAYS click so the count is audible even with
    // the metronome off.
    {
      const beats = bundle.beats || [];
      const userPerBeat = Math.max(1, cfg.clickSubdiv || 1);
      // Count-in grid preview (rhythm-meter spec 2026-06-12): the LAST count-in
      // bar previews the exercise's subdivision with soft sub-ticks (teacher
      // convention — pulse first, then the "and"s) regardless of the player's
      // clickSubdiv. Break bars preview the INCOMING block's grid via the
      // b.brkSub tag; the resume pre-roll stays pulse-only (the player already
      // has the grid mid-run). Sub-ticks always preview the STRAIGHT grid —
      // the click is the reference you shuffle against, never swung.
      const ciTicks = countInSubTicks(cfg);
      const ciMeas = measureSeconds(cfg);
      for (let i = 0; i < beats.length; i++) {
        const b = beats[i];
        if (b._tail) continue;  // visual loop-preview copy; don't double-click at the seam
        if (b.time < startFrom || b.time >= winEnd) continue;
        const inCountIn = lead > 0 && b.time < lead - 1e-4;
        const inPreRoll = transport.preRollUntil > 0 && b.time < transport.preRollUntil;   // resume pre-roll runway → force the count-in click (full level, like the head count-in)
        if (!audio.metronome && !inCountIn && !b.brk && !inPreRoll) continue;   // the inter-block break + the resume pre-roll ARE count-ins → always click (even metronome-off)
        // Strong accent on measure downbeats and grouping starts (e.g. 7/8 as
        // 3+2+2). Beats are already meter-correct (built by buildBeats), so this
        // follows the time-signature selection.
        const accent = b.accent === 'measure' || b.accent === 'group' || (b.measure || -1) >= 0;
        // Break clicks sit ~2.5 dB under the in-block metronome (same timbre, so the
        // ear locks the exact incoming pulse) → the next block's first downbeat reads
        // as an ARRIVAL. The leading count-in + the metronome play at full.
        scheduleClick(ctx, base + (b.time - startFrom), accent, false, b.brk ? 0.75 : 1);
        schedEnd = Math.max(schedEnd, base + (b.time - startFrom) + 0.1);
        // The grid-preview boosts (last count-in bar + break bars) are OPT-IN
        // (virtuoso_lab.countInGrid; 2026-06-12 beginner dogfood: the extra ticks
        // made slow exercises FEEL faster). An explicit clickSubdiv always plays.
        const gridOn = countInGridOn();
        const lastCountInBar = inCountIn && b.time >= lead - ciMeas - 1e-4;
        const perBeat = (lastCountInBar && gridOn) ? Math.max(userPerBeat, ciTicks)
          : b.brk ? Math.max(userPerBeat, gridOn ? (b.brkSub || 1) : 1)
          : userPerBeat;
        if (perBeat > 1) {
          // Derive this beat's length from the actual gap to the next beat so
          // sub-ticks stay correct across bar lines and per-segment meters in
          // sessions; fall back to the previous gap or the form's beat unit.
          const next = beats[i + 1];
          const beatLen = next ? (next.time - b.time)
            : (i > 0 ? b.time - beats[i - 1].time : (60 / cfg.bpm) * (4 / cfg.meter.denominator));
          const tickLen = beatLen / perBeat;
          for (let k = 1; k < perBeat; k++) {
            const t = b.time + k * tickLen;
            // Sub-ticks ride their PARENT beat's chunk (no winEnd check): a
            // beat just inside the window owns all its subdivision clicks,
            // even ones landing past the boundary — the next chunk's onset
            // selection skips the parent, so it would never revisit them.
            if (t < startFrom || t > duration + 0.1) continue;
            scheduleClick(ctx, base + (t - startFrom), false, true);
          }
        }
      }
    }
    // base: the ctx-time chart-time `startFrom` maps to — the chunk scheduler
    // advances its horizon from it. end: the real last sound-end, so pruning
    // never cuts a sustain that rings past the chunk's chart window.
    return { base, end: schedEnd };
  }
  // ===========================================================================
  // §14 · TRANSPORT, HUD, PLAYBACK CLOCK + AUDIO ENGINE
  // startPlayback() owns the RAF clock (currentPracticeTime), Web Audio scheduling,
  // and the Minigames pitch tracker. Contained playback — never hands off to host.
  // ===========================================================================
  // Screen Wake Lock — keep the OS display / screensaver awake during contained
  // playback. The host's wake lock (#686) is tied to its own song:play/pause events,
  // which our CONTAINED player never emits — so we hold our own. Web Wake Lock API
  // (secure-context only → active on localhost / HTTPS) + the host's Electron native
  // power bridge (`hostDesktop().power.setScreenAwake`) when present (the Web
  // API is unreliable in Electron). Both degrade silently where unsupported. The Web
  // sentinel auto-releases when the tab hides; we re-acquire on re-show while playing.
  let /** @type {WakeLockSentinel | null} */ _wakeLock = null, _wantWakeLock = false;
  function acquireWakeLock() {
    _wantWakeLock = true;
    try { hostDesktop()?.power?.setScreenAwake?.(true); } catch (_) {}
    if (_wakeLock || !navigator.wakeLock || typeof navigator.wakeLock.request !== 'function') return;
    navigator.wakeLock.request('screen').then((s) => {
      // request() is async — playback may have STOPPED while it was pending. If we no
      // longer want the lock, release the just-acquired sentinel now, else it leaks and
      // the screen stays awake after a fast play→stop.
      if (!_wantWakeLock) { try { s.release(); } catch (_) {} return; }
      _wakeLock = s;
      try { s.addEventListener('release', () => { _wakeLock = null; }); } catch (_) {}
    }).catch(() => {});   // denied / non-secure-context / unsupported — degrade silently
  }
  function releaseWakeLock() {
    _wantWakeLock = false;
    try { hostDesktop()?.power?.setScreenAwake?.(false); } catch (_) {}
    if (_wakeLock) { try { _wakeLock.release(); } catch (_) {} _wakeLock = null; }
  }

  // ── Mid-run downshift offer (P2 of the beginner-entry panel, 2026-06-12) ────
  // BEGINNER RUNGS ONLY (Christian's scope: intermediate/expert know the process):
  // when the first ~4 bars judge low WITH input present, offer the previous tier
  // as a non-blocking chip. Gamification's constitution: an OFFER, never
  // automatic, never gating; copy frames the tempo as fast, never the player as
  // failing; once per rung per session (dismiss = quiet for the session); a
  // shown chip suppresses the post-run step-down (no double-offer); accepting is
  // not a penalty — the slower tier is its own rung with its own clean clear.
  const _beginnerRungSet = new Set((PATHWAY_BANDS.find(b => b.id === 'core_beginner') || { pathways: [] }).pathways);
  const _downshiftSeen = new Set();   // rung ids offered or dismissed this session
  let _downshiftEvaluated = false;    // this run — the ~4-bar check fires once
  let _downshiftChipShown = false;    // this run — read by the results modal's step-down
  /** @type {number | null} */
  let _downshiftEvalAt = null;        // chart time of the check (lead + 4 bars)
  function maybeOfferDownshift() {
    if (_downshiftEvaluated || !activeBundle) return;
    const id = practiceSelection.pathwayId;
    if (!id || id === 'custom' || !_beginnerRungSet.has(id) || _downshiftSeen.has(id)) { _downshiftEvaluated = true; return; }
    if (practiceSelection.tierIndex <= 0) { _downshiftEvaluated = true; return; }   // already at the floor — nothing kinder to offer
    const pw = PATHWAYS[id];
    if (!pw || !pw.tempoTiers || pw.tempoTiers[practiceSelection.tierIndex - 1] == null) { _downshiftEvaluated = true; return; }
    if (_downshiftEvalAt == null) {
      const cfgLike = (activeBundle.config && activeBundle.config.meter) ? activeBundle.config : readConfig();
      _downshiftEvalAt = (activeBundle.leadIn || 0) + 4 * measureSeconds(cfgLike);
    }
    if (transport.time < _downshiftEvalAt) return;
    // The judge must have RESOLVED enough notes, and the player must be audibly
    // trying (never trigger on silence — an unplugged guitar is not "too fast").
    const passed = ptWinPassedCount(transport.time - ptLatency());
    if (passed < 6) return;            // sparse so far — keep waiting (cheap)
    if (!_ptHadInput) return;          // no input yet — wait, don't consume the check
    _downshiftEvaluated = true;        // one evaluation per run, whatever the outcome
    if (_ptScoredUnits / passed >= 0.4) return;   // holding up fine — stay quiet
    const idx = practiceSelection.tierIndex - 1;
    const chip = $('virtuoso_lab-downshift'), go = $('virtuoso_lab-downshift-go');
    if (!chip || !go) return;
    go.textContent = `Try ${tierChipLabel(pw, idx)} ▸`;
    go.dataset.idx = String(idx);
    chip.hidden = false; chip.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => chip.classList.add('show'));
    _downshiftChipShown = true;
    _downshiftSeen.add(id);            // once per rung per session
  }
  function hideDownshiftChip() {
    const chip = $('virtuoso_lab-downshift');
    if (!chip || chip.hidden) return;
    chip.classList.remove('show'); chip.setAttribute('aria-hidden', 'true'); chip.hidden = true;
  }
  function startPlayback() {
    if (!activeBundle) return;
    if (playbackProbe) return playbackProbe(activeBundle);
    previewStop();         // a graded run supersedes any "Hear it" preview
    closeResultsModal();   // a new run dismisses the previous run's results
    stopTuner();  // the practice scorer owns the strip during playback
    sessionEnd(); // flush any in-progress session before starting a new one
    sessionBegin();
    stopAudio(); syncHighwaySettings(activeBundle);
    transport.begin(); _wrapAnim = null;
    _runMaxChartTime = transport.time; _runLooped = false; _blockHadInput = [];   // recap reached + per-block input tracking, fresh per run
    _downshiftEvaluated = false; _downshiftChipShown = false; _downshiftEvalAt = null; hideDownshiftChip();   // the mid-run offer re-arms per run (session suppression via _downshiftSeen)
    acquireWakeLock();   // hold the screen awake for the duration of this play
    // With an active A–B loop, playback begins at the loop start — not wherever
    // the playhead happens to sit (DAW cycle behavior; the playhead is just a
    // seek cursor). Without this, scrubbing then hitting Play started mid-loop.
    transport.rememberStart();
    // Count-in is baked into the chart as lead-in rest bars (see applyCountIn),
    // so playback just starts from the playhead — no playhead freeze. Starting
    // from 0 plays the count-in once; the loop then cycles the music only. The
    // count-in clicks come from schedulePreviewAudio (lead-in beats always tick).
    anchorPlayClock(transport.time);
    scheduleCurrentPassAndAnchor(AUDIO_LOOKAHEAD_SECONDS);
    if (!rafId) rafId = requestAnimationFrame(tick);
    startPitchTracker(activeBundle); syncPlayButton(); refreshStatusFromState();
  }
  // Stop returns the playhead to where playback last began (Logic Pro behaviour:
  // hit Play to instantly replay the same passage). The ⏮ button jumps to the
  // very start — Logic's "press Stop again to go to the top".
  function stopPlayback() { sessionEnd(); transport.stop(false, true); _wrapAnim = null; hideDownshiftChip(); if (_jamPending) jamPendingClear(); releaseWakeLock(); transport.rewindToStart(); stopRunAudio(); drawOnce(); syncPlayButton(); refreshStatusFromState(); }
  // ── PR 2.1 · "Hear it" — audition the target phrase (Ear-Mode enabler) ───────
  // Ear Mode's foundation (docs/plugin/design/ear-mode.md): play the current exercise's NOTES as
  // audio, UNGRADED — no scorer, no session, no RAF clock. Just schedule the
  // notes-only voice through the same audio bus playback uses, so the player can
  // HEAR the phrase (the "call" a future Echo rung will have them reproduce).
  // Notes only (no metronome/backing); an A–B loop bounds the phrase. Never fights
  // a graded run; a second click stops it. Fire-and-forget — a timer resets the UI
  // when the phrase ends (no clock drives it).
  let _demoActive = false, /** @type {ReturnType<typeof setTimeout> | null} */ _demoTimer = null;
  function previewStop() {
    if (_demoTimer) { clearTimeout(_demoTimer); _demoTimer = null; }
    if (!_demoActive) return;
    _demoActive = false;
    stopAudio();
    syncListenButton();
  }
  function previewListen() {
    if (_demoActive) { previewStop(); return; }        // toggle off
    if (!activeBundle || transport.playing) return;              // needs a bundle; never over a graded run
    ensureAudioCtx();
    if ((/** @type {AudioContext} */ (audioCtx)).state === 'suspended') (/** @type {AudioContext} */ (audioCtx)).resume().catch(() => {});
    stopAudio();                                       // clear any lingering nodes
    const lead = activeBundle.leadIn || 0, dur = activeBundle.songInfo?.duration || 0;
    const hasLoop = transport.loopA != null && transport.loopB != null;
    const from = hasLoop ? Math.min(transport.loopA, transport.loopB) : lead;   // skip the count-in
    const to = hasLoop ? Math.max(transport.loopA, transport.loopB) : dur;
    if (!(to > from)) return;
    // Notes-only demo: clone the bundle with an audio profile that sounds ONLY the
    // practice voice — the phrase to hear, no click, no band.
    const demo = { ...activeBundle, config: { ...activeBundle.config, audio: { notes: true, metronome: false, harmony: false } } };
    schedulePreviewAudio(demo, from, AUDIO_LOOKAHEAD_SECONDS, to);
    _demoActive = true;
    _demoTimer = setTimeout(previewStop, (to - from) * 1000 + 600);   // +ring-out tail
    syncListenButton();
  }
  function syncListenButton() {
    const b = $('virtuoso_lab-listen');
    if (!b) return;
    b.classList.toggle('active', _demoActive);
    b.innerHTML = _demoActive ? '◼ Stop' : '🔊 Hear it';
    b.setAttribute('aria-pressed', _demoActive ? 'true' : 'false');
    b.title = _demoActive ? 'Stop the preview' : 'Hear it — play the target phrase, no scoring';
  }
  // Pause freezes the run in place: clock + audio + judgment stop, the session
  // and the pitch-tracker state stay alive, the playhead holds. Resume re-anchors
  // the clock/audio from the frozen playhead (the seekTo pattern). Wake lock is
  // released while paused (a paused screen may sleep) and re-acquired on resume.
  function pausePlayback() {
    if (!transport.pause()) return;
    stopAudio();
    releaseWakeLock();
    syncPlayButton(); refreshStatusFromState();
  }
  function resumePlayback() {
    if (!transport.playing || !transport.paused) return;
    transport.resume({lead:activeBundle ? (activeBundle.leadIn || 0) : 0, beats:activeBundle?.beats || []});
    acquireWakeLock();
    anchorPlayClock(transport.time);
    scheduleCurrentPassAndAnchor(AUDIO_LOOKAHEAD_SECONDS);
    // Scoring hygiene across a pause is inherent: paused frames are discarded in
    // ptOnPitch; pre-roll frames likewise (the player isn't expected to play the
    // runway — they're re-orienting to the count).
    syncPlayButton(); refreshStatusFromState();
  }
  // Dedicated transport Stop (the button left of Play/Pause). Acts on a running
  // OR paused run; inert when already stopped (the button is disabled then).
  function onStop() {
    rendererLifecycle.invalidate();
    if (!transport.playing) { stopRenderer(); return; }
    // An explicit Stop is a DELIBERATE run end → the results modal may show.
    // Sideways stops (regenerate-while-playing, mode/screen switches) keep the
    // flag false so a settings fiddle never pops a modal.
    _deliberateStop = true;
    try { stopPlayback(); } finally { _deliberateStop = false; }
  }
  // Toggle for the primary Play/Pause button. If we don't have a chart yet,
  // generate one first so the very first click always plays something.
  /** @param {number} request */
  async function rendererReadyForPlay(request) {
    try {
      return await rendererLifecycle.waitUntilReady() && rendererLifecycle.isCurrentRequest(request);
    } catch (error) {
      if (!rendererLifecycle.isCurrentRequest(request)) return false;
      showStatus(`Renderer failed: ${(/** @type {Error} */ (error)).message || error}`);
      console.error('[Virtuoso] Play renderer readiness failed', error);
      syncPlayButton();
      return false;
    }
  }
  async function onPlayToggle() {
    if (transport.playing && !transport.paused) { pausePlayback(); return; }
    if (transport.playing && transport.paused) {
      // Resume inside the click gesture so a context the browser suspended
      // (e.g. after long inactivity) comes back with the audio.
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      resumePlayback(); return;
    }
    // Create/resume the AudioContext inside the click gesture (before any await) so
    // the voice warm-up + playback don't start on a suspended context.
    ensureAudioCtx();
    if ((/** @type {AudioContext} */ (audioCtx)).state === 'suspended') (/** @type {AudioContext} */ (audioCtx)).resume().catch(() => {});
    // Bounded wait for the host output-device steer so the run's first notes
    // land on the right sink (150ms cap — routing never delays Play noticeably,
    // and a slow/failed steer just starts on the default sink).
    let request = rendererLifecycle.currentRequest();
    await Promise.race([applyHostSink(), new Promise((r) => setTimeout(r, 150))]);
    if (!rendererLifecycle.isCurrentRequest(request)) return;
    // In session mode, Play builds + starts the selected session if one isn't
    // already loaded; otherwise it replays the built session from the playhead.
    if ($('virtuoso_lab-root')?.classList.contains('virtuoso_lab-session-mode')) {
      if (!activeBundle || activeBundle.config?.mode !== 'session') { await onLaunchSession(); return; }
      await transport.runStart(rendererReadyForPlay(request), () => {});
      return;
    }
    if (!activeBundle) {
      if (!await onGenerate()) return;
    }
    request = rendererLifecycle.currentRequest();
    await transport.runStart(rendererReadyForPlay(request), () => {});
  }

  // ── Playback transport (scrubber + A/B loop + count-in) ──────────────────────
  /** @param {number} s */
  function fmtTime(s) { s = Math.max(0, s || 0); const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return m + ':' + String(sec).padStart(2, '0'); }

  // Seek the preview to an absolute chart time. Mirrors setSegmentLoop's
  // re-anchor logic so audio resumes from the new spot rather than going silent.
  /** @param {number} t */
  function seekTo(t) {
    if (!activeBundle) return;
    const dur = activeBundle.songInfo?.duration || 0;
    transport.seek(t, dur);
    if (transport.playing && !transport.paused) {
      anchorPlayClock(transport.time);
      stopAudio();
      scheduleCurrentPassAndAnchor(AUDIO_LOOKAHEAD_SECONDS);
    } else {
      // Stopped OR paused: just move the frozen playhead and repaint. A paused
      // run must stay silent; resume re-anchors from wherever this seek landed.
      drawOnce();
    }
    syncTransportTime();
  }

  // Per-frame light sync: scrubber position + current-time readout.
  function syncTransportTime() {
    const cur = $('virtuoso_lab-time-cur');
    if (cur) cur.textContent = fmtTime(transport.time);
    updateActiveSegment();
  }

  // Full transport refresh: scrubber range, duration readout, loop region +
  // button states, loop counter, and the count-in segmented control. Called on
  // bundle change, loop change, and mode change — not every frame.
  function syncTransport() {
    const dur = activeBundle?.songInfo?.duration || 0;
    const hudTitle = $('virtuoso_lab-hud-title');
    if (hudTitle) hudTitle.textContent = activeBundle ? practicePresentation.describe() : '';
    const durEl = $('virtuoso_lab-time-dur'); if (durEl) durEl.textContent = fmtTime(dur);
    syncTransportTime();
    paintLoopRegion();
    $('virtuoso_lab-loop-a')?.classList.toggle('active', transport.markerA != null);
    $('virtuoso_lab-loop-b')?.classList.toggle('active', transport.markerB != null);
    const lc = $('virtuoso_lab-loop-count');
    if (lc) {
      const active = transport.loopA != null && transport.loopB != null && !isJamMode();
      lc.hidden = !active || transport.wraps < 1;
      if (active) lc.textContent = 'Loop ' + transport.wraps;
    }
    const lr = $('virtuoso_lab-loop-range');
    if (lr) { const txt = loopReadoutText(); lr.hidden = !txt; lr.textContent = txt || ''; }
    syncFeelControl();
    const ci = document.querySelector('#virtuoso_lab-controls [name="countIn"]')?.value || '0';
    document.querySelectorAll('.virtuoso_lab-tp-seg').forEach(b => b.classList.toggle('active', b.dataset.countin === ci));
    renderSessionProgress();
    _activeSegIdx = -1; updateActiveSegment();
  }

  // The loop region is now drawn directly on the unified ruler canvas; this
  // just triggers a redraw (kept as a named function since callers reference it).
  function paintLoopRegion() { drawRulerFrame(); drawOverviewFrame(); }

  // Measure downbeats (bar lines) of the active chart, ascending.
  function chartDownbeats() {
    return (activeBundle?.beats || []).filter(b => (b.measure || -1) >= 0).map(b => b.time).sort((x, y) => x - y);
  }
  // Snap a time to the nearest bar line, unless `free` (Alt held) or no grid.
  /** @param {number} t @param {boolean} free */
  function snapToDownbeat(t, free) {
    if (free) return t;
    const d = chartDownbeats();
    if (!d.length) return t;
    return d.reduce((best, x) => Math.abs(x - t) < Math.abs(best - t) ? x : best, d[0]);
  }

  // Bar.beat label for a time (e.g. "5.1") from the chart's beat grid — the
  // downbeat is beat 1, each subsequent non-bar beat increments. null before the
  // first bar line (e.g. during a count-in lead-in).
  /** @param {number} t */
  function timeBarBeat(t) {
    const beats = activeBundle?.beats || [];
    let measure = null, beatInBar = 0;
    for (const b of beats) {
      if (b.time > t + 1e-3) break;
      if ((b.measure ?? -1) >= 0) { measure = b.measure; beatInBar = 1; }
      else if (measure != null) beatInBar++;
    }
    return measure == null ? null : measure + '.' + beatInBar;
  }
  // DAW-style cycle readout: "5.1–8.4 · 3 bars" (bar.beat bounds + bar span), or
  // a seconds fallback when there's no bar grid. null when no loop is set.
  function loopReadoutText() {
    if (transport.markerA == null || transport.markerB == null || Math.abs(transport.markerA - transport.markerB) < 0.02) return null;
    const lo = Math.min(transport.markerA, transport.markerB), hi = Math.max(transport.markerA, transport.markerB);
    const a = timeBarBeat(lo), b = timeBarBeat(hi);
    const bars = chartDownbeats().filter(x => x > lo + 0.02 && x <= hi + 0.02).length;
    const span = bars > 0 ? (bars + ' bar' + (bars === 1 ? '' : 's')) : ((hi - lo).toFixed(1) + 's');
    return (a && b) ? (a + '–' + b + ' · ' + span) : ((hi - lo).toFixed(1) + 's');
  }

  // Commit the A/B points to the loop engine once both are set and distinct;
  // otherwise leave the loop disengaged (a single point just paints a marker).
  function commitLoop() {
    if (transport.markerA != null && transport.markerB != null && Math.abs(transport.markerA - transport.markerB) > 0.02) {
      try { setSegmentLoop(Math.min(transport.markerA, transport.markerB), Math.max(transport.markerA, transport.markerB)); }
      catch (_) { clearSegmentLoop(); }
    } else {
      clearSegmentLoop();
    }
    transport.resetWraps();
    syncTransport();
  }

  // Reset all transport loop state — used when a fresh chart is generated and
  // the old A/B times may no longer be valid for the new duration.
  function resetTransportLoop() {
    transport.resetLoop(); _activeSegIdx = -1;
    clearSegmentLoop();
    syncTransport();
  }

  // ── Session transport (segment progress, jump, highlight, per-segment loop) ──
  function sessionBounds() { return (activeBundle && Array.isArray(activeBundle.segmentBounds)) ? activeBundle.segmentBounds : null; }

  function currentSegmentIndex() {
    const b = sessionBounds(); if (!b || !b.length) return -1;
    const t = transport.time;
    for (let i = 0; i < b.length; i++) if (t >= b[i].start - 1e-6 && t < b[i].end - 1e-6) return i;
    return t >= b[b.length - 1].end - 1e-6 ? b.length - 1 : 0;
  }

  // Render the proportional segment bar (chunk width ∝ segment duration).
  function renderSessionProgress() {
    const host = $('virtuoso_lab-session-progress'); if (!host) return;
    const b = sessionBounds(), dur = activeBundle?.songInfo?.duration || 0;
    if (!b || !b.length || dur <= 0) { host.innerHTML = ''; return; }
    host.innerHTML = b.map((seg, i) => {
      const grow = Math.max(0.0001, (seg.end - seg.start) / dur);
      const label = String(seg.name || `Seg ${i + 1}`).replace(/"/g, '&quot;').replace(/</g, '&lt;');
      return `<button type="button" class="virtuoso_lab-progress-seg" data-seg-index="${i}" style="flex-grow:${grow.toFixed(4)}" title="${label}">${label}</button>`;
    }).join('');
  }

  // Cheap per-frame check: only touch the DOM when the active segment changes.
  function updateActiveSegment() {
    const idx = currentSegmentIndex();
    if (idx === _activeSegIdx) return;
    _activeSegIdx = idx;
    document.querySelectorAll('#virtuoso_lab-session-progress .virtuoso_lab-progress-seg').forEach((el, i) => el.classList.toggle('active', i === idx));
    document.querySelectorAll('#virtuoso_lab-segment-list .virtuoso_lab-segment-card').forEach((el, i) => el.classList.toggle('active', i === idx));
  }

  /** @param {number} i */
  function jumpToSegment(i) { const b = sessionBounds(); if (b && b[i]) seekTo(b[i].start); }

  function prevSegment() {
    const b = sessionBounds(); if (!b || !b.length) return;
    const idx = currentSegmentIndex();
    // >1s into a segment restarts it; otherwise step to the previous one.
    const target = (transport.time > b[idx].start + 1 || idx === 0) ? idx : idx - 1;
    seekTo(b[Math.max(0, target)].start);
  }

  function nextSegment() {
    const b = sessionBounds(); if (!b || !b.length) return;
    const idx = currentSegmentIndex();
    if (idx + 1 < b.length) seekTo(b[idx + 1].start);
  }

  function loopCurrentSegment() {
    const b = sessionBounds(); if (!b || !b.length) return;
    const idx = currentSegmentIndex(); if (idx < 0) return;
    transport.markLoop(b[idx].start, b[idx].end); commitLoop();
  }

  // Nudge to the adjacent bar line. Uses the chart's own measure downbeats
  // (beats with measure >= 0), so it stays tempo-accurate even across session
  // segments with different tempos. dir < 0 = back, dir > 0 = forward.
  /** @param {number} dir */
  function nudgeBar(dir) {
    if (!activeBundle) return;
    const downbeats = (activeBundle.beats || []).filter(b => (b.measure || -1) >= 0).map(b => b.time).sort((a, c) => a - c);
    const t = transport.time, dur = activeBundle.songInfo?.duration || 0;
    if (!downbeats.length) { seekTo(t + dir * 2); return; } // fallback if no beat grid
    if (dir > 0) {
      const next = downbeats.find(d => d > t + 0.05);
      seekTo(next != null ? next : dur);
    } else {
      const prev = [...downbeats].reverse().find(d => d < t - 0.05);
      seekTo(prev != null ? prev : 0);
    }
  }

  // Nudge the loop's end (B) edge to the adjacent bar line (Shift+←/→). Adjusts
  // cycle length from the end; refuses to collapse the loop past its start.
  /** @param {number} dir */
  function nudgeLoopEdge(dir) {
    if (transport.markerA == null || transport.markerB == null || Math.abs(transport.markerA - transport.markerB) < 0.02) return false;
    const dn = chartDownbeats(); if (!dn.length) return false;
    const dur = activeBundle?.songInfo?.duration || 0;
    const lo = Math.min(transport.markerA, transport.markerB), hi = Math.max(transport.markerA, transport.markerB);
    let next = dir > 0 ? dn.find(x => x > hi + 0.05) : [...dn].reverse().find(x => x < hi - 0.05);
    if (next == null) next = dir > 0 ? dur : hi;
    if (next <= lo + 0.02) return true;  // refuse to collapse past the start
    transport.markLoop(lo, next); commitLoop(); paintLoopRegion();
    return true;
  }

  // Keyboard transport, scoped to the Virtuoso screen. Ignores keystrokes when
  // a form field is focused or a modifier is held, and never touches Escape
  // (FeedBack owns Escape for return-to-menu). Comma/period are session-only.
  /** @param {KeyboardEvent} e */
  function onTransportKey(e) {
    const root = $('virtuoso_lab-root');
    if (!root || !root.offsetParent) return; // screen not the active/visible one
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = ((/** @type {HTMLElement | null} */ (e.target))?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (/** @type {HTMLElement | null} */ (e.target))?.isContentEditable) return;
    const sessionMode = root.classList.contains('virtuoso_lab-session-mode');
    switch (e.key) {
      case ' ':          e.preventDefault(); onPlayToggle(); break;
      case 'ArrowLeft':  e.preventDefault(); if (e.shiftKey && nudgeLoopEdge(-1)) break; nudgeBar(-1); break;
      case 'ArrowRight': e.preventDefault(); if (e.shiftKey && nudgeLoopEdge(1)) break; nudgeBar(1); break;
      // Loop in/out moved to i/o (editor in/out convention) so [ is free for the
      // shell Inspector-collapse hotkey (menu/shell decision); \ still clears the loop.
      case 'i': case 'I': e.preventDefault(); transport.markLoop(transport.time, transport.markerB); commitLoop(); break;
      case 'o': case 'O': e.preventDefault(); transport.markLoop(transport.markerA, transport.time); commitLoop(); break;
      case '\\':         e.preventDefault(); resetTransportLoop(); break;
      // Shell hotkeys: M mixer · P progress · [ collapse Inspector · ? cheat-sheet.
      case 'm': case 'M': e.preventDefault(); toggleMixer(); break;
      case 'p': case 'P': e.preventDefault(); toggleProgressSheet(); break;
      case '[':          e.preventDefault(); setPanelCollapsed(!panelCollapsed); break;
      case '?':          e.preventDefault(); toggleCheatSheet(); break;
      case 'Home':       e.preventDefault(); seekTo(0); break;
      case ',':          if (sessionMode) { e.preventDefault(); prevSegment(); } break;
      case '.':          if (sessionMode) { e.preventDefault(); nextSegment(); } break;
      default: return;
    }
  }

  // Compact, glanceable LCD readout for #virtuoso_lab-summary. Shows only the
  // GENERATED facts the left-panel controls don't already state — the readout
  // used to restate every menu selection (debug-log style); now it confirms
  // what actually got built. Returns HTML (labeled cells); set via .innerHTML.
  // Errors/fallback messages do NOT go here — they're routed to #virtuoso_lab-status.
  /** @param {import('./src/types/entry-data.js').EntryExercise} exercise */
  function summarize(exercise) {
    const cfg = exercise.session, c = exercise.chart;
    /** @param {unknown} s */
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    /** @param {string} label @param {string | number | undefined} value */
    const cell = (label, value) => `<div class="virtuoso_lab-lcd-cell"><span class="virtuoso_lab-lcd-lbl">${esc(label)}</span><span class="virtuoso_lab-lcd-val">${esc(value)}</span></div>`;
    const len = fmtTime(c.duration);
    // Sessions mix tempo/key/meter across segments, so show session-level facts
    // (name · segments · length · notes) rather than a single key/tempo/meter.
    if (cfg.mode === 'session') {
      const segCount = (c.segmentBounds || []).length;
      return [
        cell('Session', cfg.sessionName || 'Custom'),
        ...(segCount ? [cell('Segments', segCount)] : []),
        cell('Length', len),
        cell('Notes', c.notes.length)
      ].join('');
    }
    const bars = measureSeconds(cfg) > 0 ? Math.round(c.duration / measureSeconds(cfg)) : 0;
    // ── Editable LCD cells (DAW transport convention) ──────────────────────────
    // Key · Meter · Count-in join Tempo as in-place edits: each is a quiet <select>
    // that reads like the readout, commits via the delegated handler in bind()
    // (writes the Inspector field → regenerate). Works as a live OVERRIDE in any
    // mode, exactly like the editable Tempo cell.
    /** @param {string | number} value @param {string} label @param {string | number} cur */
    const opt = (value, label, cur) => `<option value="${esc(value)}"${String(value) === String(cur) ? ' selected' : ''}>${esc(label)}</option>`;
    /** @param {string} id @param {string} label @param {string} inner @param {string} title */
    const lcdSel = (id, label, inner, title) =>
      `<div class="virtuoso_lab-lcd-cell"><span class="virtuoso_lab-lcd-lbl">${esc(label)}</span><span class="virtuoso_lab-lcd-val"><select id="${id}" class="virtuoso_lab-lcd-select" aria-label="${esc(title)}" title="${esc(title)}">${inner}</select></span></div>`;
    // Key — root note editable; the scale name stays a static suffix. chromatic has
    // no key/scale, so it keeps a static Pattern identity cell.
    let keyCell;
    if (cfg.practiceFile) {
      keyCell = cell('File', cfg.practiceFileId);
    } else if (cfg.mode === 'chromatic') {
      keyCell = cell('Pattern', CHROMATIC_PATTERN_LABELS[cfg.chromaticPattern] || cfg.chromaticPattern);
    } else {
      const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const scaleName = String(cfg.scale || '').replace(/_/g, ' ');
      keyCell = `<div class="virtuoso_lab-lcd-cell"><span class="virtuoso_lab-lcd-lbl">Key</span><span class="virtuoso_lab-lcd-val"><select id="virtuoso_lab-lcd-key" class="virtuoso_lab-lcd-select" aria-label="Key — root note" title="Key — root note">${NOTES.map(n => opt(n, n, cfg.key)).join('')}</select> ${esc(scaleName)}</span></div>`;
    }
    // Meter — mirror the Inspector meter <select> options (zero drift) with compact
    // n/d labels; editable here even when that Inspector field is Custom-only-hidden.
    const curMeterVal = (cfg.meter.grouping && cfg.meter.grouping.length > 1)
      ? `${cfg.meter.numerator}/${cfg.meter.denominator}:${cfg.meter.grouping.join('+')}`
      : `${cfg.meter.numerator}/${cfg.meter.denominator}`;
    const formMeter = document.querySelector('#virtuoso_lab-controls [name="meter"]');
    const meterCell = cfg.practiceFile ? cell('Meter', curMeterVal) : formMeter
      ? lcdSel('virtuoso_lab-lcd-meter', 'Meter', Array.from(formMeter.options).map(o => {
          const m = parseMeter(o.value);
          const short = m.grouping.length > 1 ? `${m.numerator}/${m.denominator} ${m.grouping.join('+')}` : `${m.numerator}/${m.denominator}`;
          return opt(o.value, short, curMeterVal);
        }).join(''), 'Meter')
      : cell('Meter', `${cfg.meter.numerator}/${cfg.meter.denominator}`);
    // Count-in — bars of lead-in (mirrors the Inspector Count-in select).
    const ciCur = cfg.countInBars != null ? cfg.countInBars : 1;
    const countInCell = lcdSel('virtuoso_lab-lcd-countin', 'Count-in',
      [1, 2, 4].map(n => opt(n, n === 1 ? '1 bar' : n + ' bars', ciCur)).join(''), 'Count-in bars');
    return [
      keyCell,
      // Tempo is an editable LCD cell (DAW transport convention): same glyphs as
      // a readout, commits via the delegated handler in bind() (two-way with the
      // Inspector BPM field). Sessions (above) keep no tempo cell — mixed tempos.
      `<div class="virtuoso_lab-lcd-cell"><span class="virtuoso_lab-lcd-lbl">Tempo</span><span class="virtuoso_lab-lcd-val"><input id="virtuoso_lab-lcd-bpm" class="virtuoso_lab-lcd-input" type="number" min="30" max="260" step="1" value="${esc(cfg.bpm)}" aria-label="Tempo (BPM)" title="Click to edit the tempo — applies on Enter"> BPM</span></div>`,
      meterCell,
      countInCell,
      cell('Bars', bars),
      cell('Length', len),
      cell('Notes', c.notes.length)
    ].join('');
  }
  /** @param {string} text */
  function showStatus(text) { const el = $('virtuoso_lab-status'); if (el) el.textContent = text; }
  function refreshStatusFromState() {
    // Output-device honesty: when the host engine is on a device we couldn't
    // follow, say so right where the player is looking (the silent failure was
    // the actual bug — Arch + Focusrite report, 2026-06-07).
    const sinkNote = (_sinkMismatch ? ` · ⚠ ${_sinkMismatch}` : '') + (!practiceSelection.catalogState?.settled ? ' · Chromatic Warmup loading…' : practiceSelection.catalogState.error ? ' · Chromatic Warmup unavailable (practice catalog failed to load)' : '');
    if (!activeBundle) { showStatus(`Ready${sinkNote}`); return; }
    const desc = practicePresentation.describe();
    showStatus(transport.playing ? (transport.paused ? `Paused — ${desc}${sinkNote}` : `Playing — ${desc}${sinkNote}`) : `Ready — ${desc}${sinkNote}`);
  }

  async function onGenerate() {
    if (practiceSelection.pendingInitial) { refreshStatusFromState(); return; }
    practiceSelection.cancelLoad();
    let request = rendererLifecycle.invalidate();
    const practice = practiceSelection.file;
    const ownsGeneration = () => rendererLifecycle.isCurrentRequest(request);
    const summary = /** @type {HTMLDivElement} */ ($('virtuoso_lab-summary'));
    try {
      const cfg = readConfig();
      practiceSelection.selectedConfig(cfg);
      if (cfg.practicePathwayId) cfg.meter = parseMeter(cfg.meter);
      cfg.practicedPathwayId = !practice && $('virtuoso_lab-root')?.classList.contains('virtuoso_lab-pathway-mode') && PATHWAYS[String(practiceSelection.pathwayId)] ? practiceSelection.pathwayId : null;
      const exercise = generateExercise(withRunTarget(cfg));
      if (cfg.practicePathwayId) practicePresentation.renderGoal(cfg.practicePathwayId, false);
      lastExercise = exercise;
      summary.innerHTML = summarize(exercise);
      const pending = attachRenderer(exercise);
      request = rendererLifecycle.currentRequest();
      if (!await pending || !ownsGeneration()) return;
      prewarmVoices(activeBundle);  // start the sampled-voice load now so Play starts on WAF, not the oscillator
      syncJamHighlightUI();
      syncFretboardUI();
      practiceSelection.syncFileControls();
      refreshStatusFromState();
      return true;
    } catch (e) {
      if (!ownsGeneration()) return;
      if (practice || PATHWAYS[String(practiceSelection.pathwayId)]?.practiceFile) { stopRenderer(); activeBundle = null; lastExercise = null; }
      showStatus(`Error: ${(/** @type {Error} */ (e)).message || e}`);
      console.error('[Virtuoso] generate failed', e);
    }
  }
  // The save button was explicitly cut from HTML; recall remains supported.
  const practicePresets = createPracticePresets({
    onSelect(config) { applyPathwayConfig(config); if (activeBundle) onGenerate(); }
  });
  function syncStringSetupControls() { const instrument = document.querySelector('[name="instrument"]'), setup = document.querySelector('[name="stringSetup"]'); if (!instrument || !setup) return; const current = STRING_SETUPS[setup.value] || STRING_SETUPS.guitar_6_standard; instrument.value = current.instrument; }
  // CAGED/3NPS shape concepts are guitar-only — hide them when bass is active.
  // Remembers the shape-aware system (caged/3nps) we force-switched away from
  // when the user picked a bass setup, so returning to guitar restores it
  // instead of stranding the player in 'position'.
  /** @type {string | null} */
  let stashedGuitarSystem = null;
  function syncInstrumentClass() {
    const root = $('virtuoso_lab-root');
    const setup = document.querySelector('[name="stringSetup"]');
    if (!root || !setup) return;
    const isBass = (STRING_SETUPS[setup.value] || {}).instrument === 'bass';
    root.classList.toggle('virtuoso_lab-bass-instrument', isBass);
    // Piano is keyed off the instrument select directly (it has no string setup).
    // Drives the CSS that reveals the Piano Roll view and hides the guitar/bass
    // views. Piano can't be selected yet (chip disabled), so this is groundwork.
    const instrSel = document.querySelector('[name="instrument"]');
    root.classList.toggle('virtuoso_lab-piano-instrument', (instrSel?.value) === 'piano');
    // Offer only the practice types applicable to this instrument (the ternary
    // offerable() tag — the single source of truth, replacing the old bending-only
    // hide). Hide/disable any n-a option; if the current selection becomes n-a,
    // fall back to a safe default. This is what hides the guitar-only techniques
    // (bending/tremolo/hybrid/strum) on bass AND the 5 bass groove primitives on guitar.
    const ptSel = document.querySelector('[name="practiceType"]');
    if (ptSel) {
      const instrument = isBass ? 'bass' : ((instrSel?.value) === 'piano' ? 'piano' : 'guitar');
      let mustSwitch = false;
      ptSel.querySelectorAll('option').forEach(opt => {
        const ok = offerable(opt.value, instrument);
        opt.hidden = !ok; opt.disabled = !ok;
        if (!ok && ptSel.value === opt.value) mustSwitch = true;
      });
      if (mustSwitch) { ptSel.value = 'scale'; ptSel.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    // Re-render the skill tree so the Bending node hides/shows with the instrument.
    renderSkillTree();
    if (isBass) {
      const fs = document.querySelector('[name="fretboardSystem"]');
      // CAGED/3NPS are guitar artifacts — force bass to the movable 'position'
      // box, but remember what we switched away from so guitar can restore it.
      if (fs && (fs.value === 'caged' || fs.value === '3nps')) {
        stashedGuitarSystem = fs.value;
        fs.value = 'position';
      }
      // (Bass keeps the selected view — the 3D Highway renders bass natively, so
      // we no longer force it to 2D here.)
    } else if (stashedGuitarSystem) {
      // Returning to guitar: restore the shape-aware system bass forced off, so
      // the player isn't silently stranded in 'position'. Only restore if the
      // forced 'position' value is still in place (user didn't pick it themself),
      // and fire change so the shape controls re-resolve.
      const fs = document.querySelector('[name="fretboardSystem"]');
      if (fs && fs.value === 'position') {
        fs.value = stashedGuitarSystem;
        fs.dispatchEvent(new Event('change', { bubbles: true }));
      }
      stashedGuitarSystem = null;
    }
    // Re-sync the Position/variation stepper: on bass it falls back to vary[]
    // stepping (CAGED shapes aren't shown), so its label + control must update
    // when the instrument changes. updatePositionStepper() picks the right
    // mode + axis label.
    practicePresentation.renderPosition();
    // Mirror the underlying instrument value into the top-level family
    // selector so all three controls (family chip, instrument select,
    // string-setup select) stay in sync regardless of which one drove the
    // change.
    syncInstrumentFamilyButtons();
  }

  // Top-level instrument selector (Bass / Guitar / Piano) — paints the active
  // chip from the current underlying instrument. Piano is scaffolded UI; the
  // generators don't emit keyboard data yet, so its button is disabled in
  // HTML and we never paint it active.
  function syncInstrumentFamilyButtons() {
    const instr = document.querySelector('[name="instrument"]');
    const fam = instr ? instr.value : 'guitar';
    document.querySelectorAll('.virtuoso_lab-instr-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.instrument === fam);
    });
  }
  // Click handler for the family chips. Drives the existing [name="instrument"]
  // select and fires its 'change' event so every downstream sync (string
  // setup, instrument class, shape dropdown, renderer fallback for bass)
  // runs through the same code path as the in-form change.
  /** @param {string} family */
  function onInstrumentFamilyClick(family) {
    if (family === 'piano') return;  // disabled — coming in a future release
    const instr = document.querySelector('[name="instrument"]');
    if (!instr || instr.value === family) { syncInstrumentFamilyButtons(); return; }
    // Drop any per-string custom tuning before flipping families — a guitar
    // custom tuning has the wrong string count and the wrong note ranges
    // for bass (and vice versa), so carrying it across is always wrong.
    const hidden = $('virtuoso_lab-custom-open-midis');
    if (hidden) hidden.value = '';
    instr.value = family;
    instr.dispatchEvent(new Event('change', { bubbles: true }));
    // The dispatched change above is intentionally synthetic so all dependent
    // controls share one update path. This click, however, is a real player
    // declaration and must still propagate to the host.
    hostSettingsWriteSoon();
    try { localStorage.setItem('virtuoso_lab.instrumentFamily', family); } catch (_) {}
    syncInstrumentFamilyButtons();
    syncStringCountChips();
    tuningSettings.sync();
  }

  // ── Strings + tuning ───────────────────────────────────────────────────
  // Currently-effective tuning, in MIDI. Read by openMidisForConfig when
  // present. Set whenever the user picks a tuning preset or edits a custom
  // string; cleared when the user picks a built-in stringSetup tuning.
  // ── L1 player-instrument store (tuning Phase 1, panel 2026-06-05) ───────────
  // The player's PHYSICAL instrument — family, string count, tuning — is a
  // durable preference with its own home. Pathway selection NEVER writes it
  // (the layered model: L1 player setup / L2 rung assumptions / L3 variation
  // overrides — the old bug was all three sharing the form's customOpenMidis
  // field, so picking any rung wiped the player's D Standard). Saved from the
  // Setup-popover/user paths only; read by applyTuningAdaptL1 + bind restore.
  function instrumentStoreSave({ writeHost = true } = {}) {
    try {
      const setupEl = document.querySelector('[name="stringSetup"]');
      const hidden = $('virtuoso_lab-custom-open-midis');
      if (!setupEl || !STRING_SETUPS[setupEl.value]) return;
      localStorage.setItem('virtuoso_lab.instrument', JSON.stringify({
        stringSetup: setupEl.value,
        customOpenMidis: (hidden?.value || '').trim(),
      }));
    } catch (_) {}
    // Host write-through (topbar parity): this function IS the user-driven L1
    // declaration funnel. Keep L1 persistence for programmatic setup changes, but
    // write through to the shared host setting only for an actual player action.
    // Integration code and smoke suites intentionally dispatch synthetic `change`
    // events; treating those as a player declaration made concurrent test pages
    // race over the host-wide instrument setting. Debounced; no-ops while applying
    // host → panel and on every host failure.
    if (writeHost) hostSettingsWriteSoon();
  }
  function instrumentStoreLoad() {
    try {
      const o = JSON.parse(localStorage.getItem('virtuoso_lab.instrument') || 'null');
      if (!o || !STRING_SETUPS[o.stringSetup]) return null;
      return { stringSetup: o.stringSetup, customOpenMidis: (o.customOpenMidis || '').trim() };
    } catch (_) { return null; }
  }
  // The player's EFFECTIVE open midis per the L1 store (custom CSV when valid
  // for the saved setup, else the setup's standard), or null when nothing saved.
  /** @param {{stringSetup: string, customOpenMidis: string} | null} inst */
  function instrumentStoreMidis(inst) {
    if (!inst) return null;
    const setup = STRING_SETUPS[inst.stringSetup];
    if (!setup) return null;
    const list = inst.customOpenMidis ? inst.customOpenMidis.split(',').map(s => parseInt(s, 10)).filter(Number.isFinite) : [];
    return list.length === setup.openMidis.length ? list : setup.openMidis.slice();
  }
  function currentFamily() {
    const el = document.querySelector('[name="instrument"]');
    return (el && el.value === 'bass') ? 'bass' : 'guitar';
  }
  function currentStringCount() {
    const setup = document.querySelector('[name="stringSetup"]');
    const cur = STRING_SETUPS[String(setup?.value)] || STRING_SETUPS.guitar_6_standard;
    return cur.openMidis.length;
  }
  function syncStringCountChips() {
    const row = $('virtuoso_lab-string-count-row'); if (!row) return;
    const family = currentFamily();
    const counts = family === 'bass' ? [4,5,6] : [6,7,8];
    const cur = currentStringCount();
    row.innerHTML = '';
    for (const n of counts) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'virtuoso_lab-string-count-btn' + (n === cur ? ' active' : '');
      b.dataset.count = String(n);
      b.textContent = String(n);
      b.addEventListener('click', () => onStringCountClick(n));
      row.appendChild(b);
    }
  }
  /** @param {number} count */
  function onStringCountClick(count) {
    // Snap stringSetup to the canonical standard preset for this family +
    // count. If a custom tuning was active, it's dropped — the user explicitly
    // chose a different number of strings, so the per-string state is stale.
    const family = currentFamily();
    const target = `${family}_${count}_standard`;
    const setupName = TUNING_TO_SETUP[target] || (family === 'guitar' ? 'guitar_6_standard' : 'bass_4_standard');
    const setup = document.querySelector('[name="stringSetup"]');
    if (!setup) return;
    setup.value = setupName;
    // Clear any custom tuning.
    const hidden = $('virtuoso_lab-custom-open-midis');
    if (hidden) hidden.value = '';
    setup.dispatchEvent(new Event('change', { bubbles: true }));
    hostSettingsWriteSoon();  // the chip click is a real player declaration
    syncStringCountChips();
    tuningSettings.sync();
  }
  const tuningSettings = createTuningSettings({
    hostEntries: hostTuningEntries,
    onDeclaration: instrumentStoreSave,
    onCustomChange: (commit, includeFile) => {
      reapplyActivePathway();
      if (commit && (activeBundle || (includeFile && practiceSelection.file) || practiceSelection.hasPathwayFile())) onGenerate();
    },
    onSelection: () => { if (activeBundle || practiceSelection.file || practiceSelection.hasPathwayFile()) onGenerate(); },
    onDisplay: updateSetupButton,
  });

  // ── Meter-aware subdivision (Tier-1 fix, 2026-06-03 rhythm-meter panel) ──────
  // A meter is FELT in its denominator note-value (the metronome's pulse unit:
  // the eighth in x/8, the quarter in x/4). A subdivision COARSER than that pulse
  // doesn't divide the bar — a QUARTER run in 7/8 (3.5 quarters/bar) phases
  // against the bar and re-lands on a downbeat only every 2 bars: the classic
  // "the notes don't follow my tempo" trap. The generation ENGINE is correct and
  // unchanged (DAW/notation convention: quarter-referenced BPM, absolute
  // note-values — proven by probe-meter-timing.mjs); we just make the natural
  // pulse the DEFAULT and NAME the cross-pulse instead of silently defaulting into
  // it. Panel verdict: meter-aware default (eighth in /8), keep quarter as a
  // labelled advanced option, never hide it, don't relabel to "notes per beat".
  /** @type {Record<string, number>} */
  const SUBDIV_NOTE_DENOM = { quarter: 4, eighth: 8, sixteenth: 16 };
  /** @param {number} den */
  function pulseSubdivisionForDenominator(den) {
    if (den >= 16) return 'sixteenth';
    if (den >= 8)  return 'eighth';
    return 'quarter';
  }
  // On a USER meter change, bump ONLY a too-coarse SIMPLE subdivision up to the
  // pulse unit (quarter→eighth under an /8 meter). Finer or non-simple picks
  // (sixteenth, triplet, gallop) already lock, so they're left alone. This is a
  // DEFAULT, not a clamp: it fires only from the meter-change event, so an
  // explicit subdivision pick afterwards — and every regenerate, preset, and
  // share-link (which set fields silently) — is preserved.
  function meterAwareSubdivisionBump() {
    const mEl = document.querySelector('#virtuoso_lab-controls [name="meter"]');
    const sEl = document.querySelector('#virtuoso_lab-controls [name="subdivision"]');
    if (!mEl || !sEl) return;
    const den = parseMeter(mEl.value).denominator;
    const pulse = pulseSubdivisionForDenominator(den);
    const pulseRank = SUBDIV_NOTE_DENOM[pulse] || 4;
    const curRank = SUBDIV_NOTE_DENOM[sEl.value];
    if (curRank && curRank < pulseRank) sEl.value = pulse;
  }
  // The calm one-line explainer under Division: names the felt pulse and, when a
  // coarse subdivision crosses an odd bar, frames the phasing as the device it is
  // (never an error state — hearing-safety / calm-UI ethos). Recomputes notes/bar
  // from the same core timing helpers the chart uses, so it can't drift from the
  // real output. BPM cancels in the ratio, so the constant here is irrelevant.
  function syncDivisionHelp() {
    const el = $('virtuoso_lab-division-help'); if (!el) return;
    const mEl = document.querySelector('#virtuoso_lab-controls [name="meter"]');
    const sEl = document.querySelector('#virtuoso_lab-controls [name="subdivision"]');
    if (!mEl || !sEl) { el.textContent = ''; return; }
    const m = parseMeter(mEl.value);
    const pulseGlyph = m.denominator >= 8 ? '♪' : '♩';   // ♪ eighth-denom · ♩ quarter-denom
    const grouping = (m.grouping && m.grouping.length > 1) ? ` (${m.grouping.join('+')})` : '';
    let txt = `Pulse = ${pulseGlyph} · ${m.numerator} per bar${grouping}`;
    const cfg = { bpm: 100, meter: m, subdivision: sEl.value };
    // Rhythm cells (gallop/tresillo/clave/…) generate via rhythmSteps() — a cycling
    // array of per-onset durations — not the uniform division, so derive notes/bar
    // from the cell's own cycle. Uniform-division math here showed e.g. gallop in
    // 4/4 as "8 notes/bar" (it's 12) and tresillo as 8 (it's 3). (PR #2 review.)
    const cell = RHYTHM_CELLS[sEl.value];
    let npb;
    if (cell) {
      const cycleBeats = cell.beats.reduce((a, b) => a + b, 0);   // quarter-note beats per cell cycle
      const barBeats = m.numerator * (4 / m.denominator);
      npb = (barBeats / cycleBeats) * cell.beats.length;
    } else {
      npb = measureSeconds(cfg) / secondsPerDivision(cfg);
    }
    const rounded = Math.round(npb);
    if (Math.abs(npb - rounded) < 0.01) {
      txt += ` · ${rounded} notes/bar`;
    } else {
      // Non-integer ⇒ the run crosses the bar. Smallest k with k·npb whole = re-align bars.
      let k = 2; for (; k <= 16; k++) { if (Math.abs(k * npb - Math.round(k * npb)) < 0.01) break; }
      const label = (sEl.options[sEl.selectedIndex] && sEl.options[sEl.selectedIndex].text) || sEl.value;
      txt += ` · ${label} crosses the ${m.numerator}/${m.denominator} pulse — re-aligns every ${k} bars`;
    }
    el.textContent = txt;
  }

  /** @param {Record<string, unknown> | null} config */
  function applyPathwayConfig(config) {
    practiceSelection.beforeConfig();
    if (!config) return;
    applyPracticeConfig(config, {
      onInstrument() { syncStringSetupControls(); syncInstrumentClass(); },
      onProfile(cfg) {
        const profile = resolveAudioProfile({ ...cfg, audio: { profile: /** @type {string} */ (/** @type {unknown} */ (cfg.audioProfile || '')) } });
        if (profile.harmony.engine === 'sample') ensureWafPreset(TONE_GM[profile.harmony.tone]);
        if (profile.bass.engine === 'sample') ensureWafPreset(TONE_GM[profile.bass.tone]);
        if (profile.notes.engine === 'sample') ensureWafPreset(TONE_GM[profile.notes.tone]);
      },
      onComplete() { syncStringSetupControls(); practiceSelection.syncShapes(); practiceSelection.syncShapeHidden(); syncChromaticVisibility(); }
    });
  }


  /** @param {boolean} isPathway */
  function setPathwayModeClass(isPathway) {
    const root = $('virtuoso_lab-root');
    if (!root) return;
    root.classList.toggle('virtuoso_lab-pathway-mode', !!isPathway);
    syncModeBar();
  }

  // Four-mode shell metadata: data-mode token → { label, the forward-compat virtuoso_lab_vir-mode-*
  // class suffix, and the "what is this mode" JTBD line under the switcher }.
  const MODE_META = {
    guided:  { label:'Ladder', ss:'pathways', desc:'Follow a guided curriculum — we suggest what to work on next.' },
    custom:  { label:'Custom',   ss:'custom',   desc:'Drill the exact thing you’re stuck on — every control is yours.' },
    session: { label:'Workout',  ss:'workout',  desc:'Build a timed practice routine — and actually run it.' },
    jam:     { label:'Jam',      ss:'jam',      desc:'Pick a style and play along on your instrument.' },
  };
  // The mode bar (Pathways / Custom / Workout / Jam) is a VIEW of the root classes:
  // jam-mode wins; else session-mode ⇒ Workout; else pathway-mode ⇒ Pathways; else
  // Custom. Also sets the single forward-compat virtuoso_lab_vir-mode-* class + the mode-desc line.
  function syncModeBar() {
    const root = $('virtuoso_lab-root'); if (!root) return;
    const mode = root.classList.contains('virtuoso_lab-jam-mode') ? 'jam'
      : root.classList.contains('virtuoso_lab-session-mode') ? 'session'
      : root.classList.contains('virtuoso_lab-pathway-mode') ? 'guided' : 'custom';
    document.querySelectorAll('.virtuoso_lab-mode-bar .virtuoso_lab-mode-btn').forEach(b => {
      const on = b.dataset.mode === mode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    const ms = $('virtuoso_lab-mode-select'); if (ms && ms.value !== mode) ms.value = mode;   // narrow-width fallback
    // Forward-compat single mode class (the locked virtuoso_lab_vir-mode-* mechanic) for future CSS.
    ['pathways','custom','workout','jam'].forEach(s => root.classList.toggle('virtuoso_lab_vir-mode-' + s, MODE_META[mode] && MODE_META[mode].ss === s));
    const desc = $('virtuoso_lab-mode-desc');
    if (desc && MODE_META[mode]) desc.textContent = MODE_META[mode].desc;
  }

  // Jam-mode style grid (skeleton) — chips from the shared STYLE_PALETTES; selecting
  // one marks it active for now. Backing playback + live target-highlight land in the
  // post-checkpoint pass (Jam is a mirror, never a song generator — north star).
  // ── Jam: grouped style picker + the "Your band" lineup strip (genre-band panel
  // 2026-06-13) ────────────────────────────────────────────────────────────────
  // 29 flat chips read as a wall (below table-stakes — market); group by family so
  // "I want funk" is ≤2 taps. Every STYLE_PALETTES key must appear (orphans → "Other").
  /** @type {[string, string[]][]} */
  const GENRE_FAMILIES = [
    ['Rock / Metal',    ['rock', 'punk', 'metal', 'djent', 'prog', 'surf', 'shoegaze', 'emo']],
    ['Blues / Jazz',    ['blues', 'jazz', 'gypsy_jazz', 'ragtime', 'new_orleans', 'western_swing']],
    ['Funk / Soul',     ['funk', 'soul', 'gospel', 'disco']],
    ['Folk / Acoustic', ['country', 'bluegrass', 'folk', 'classical', 'flamenco']],
    ['World / Latin',   ['reggae', 'latin', 'afrobeat', 'norteno', 'tango']],
    ['Pop',             ['pop', 'city-pop']],
    ['Electronic',      ['synthwave']],
  ];
  // Human labels for a resolved backing voice — the Band strip names the REAL player,
  // not "Auto". A distorted/overdriven amp re-labels the guitar/bass.

  /** @type {Record<string, string>} */
  const BAND_TONE_LABEL = { piano: 'Piano', epiano: 'Rhodes', clav: 'Clavinet', organ: 'Organ', nylon: 'Nylon guitar', guitar: 'Acoustic guitar', clean: 'Electric guitar', upright: 'Upright bass', bass: 'Electric bass', strings: 'Strings', brass: 'Brass', synthlead: 'Synth lead', synthpad: 'Synth pad', pad: 'Pad', steel: 'Pedal Steel',
    sawpad: 'Saw pad', polybrass: 'Synth brass', neonlead: 'Neon lead', pwmpad: 'PWM pad', fmep: 'FM e-piano', pluck: 'Synth pluck', synthbass: 'Synth bass' };
  /** @type {Record<string, string>} */
  const BAND_KIT_LABEL = { kit_rock: 'Rock kit', kit_acoustic_soft: 'Soft kit', kit_jazz: 'Jazz kit', kit_909: 'Synth kit (909)', kit_808: 'Synth kit (808)' };
  /** @param {import('./src/core/generation-types.js').AudioVoice | null | undefined} slot @param {string} [role] */
  function bandVoiceLabel(slot, role) {
    if (!slot) return '—';
    if (role === 'bass') return slot.amp === 'bass_drive' ? 'Overdriven bass' : (BAND_TONE_LABEL[String(slot.tone)] || 'Bass');
    if (slot.amp === 'metal' || slot.amp === 'drive') return 'Distorted guitar';
    return BAND_TONE_LABEL[String(slot.tone)] || (slot.tone || '—');
  }
  // The "Your band" lineup: read the resolved recipe + profile for a style and name
  // each ACTIVE role's instrument (so the player SEES country ≠ metal ≠ jazz before
  // a note plays — and it's the contract the audio must honor). Read-only naming;
  // per-track instrument SWAP lives in the Mixer (M) for now.
  /** @param {string} styleId */
  function renderBandStrip(styleId) {
    const host = $('virtuoso_lab-jam-bandstrip'); if (!host) return;
    const pal = STYLE_PALETTES[styleId];
    if (!pal) { host.innerHTML = ''; return; }
    const base = readConfig();
    const cfg = Object.assign({}, base, { jamStyle: styleId, audio: Object.assign({}, base.audio, { profile: pal.audioProfile || '', brightness: undefined }) });
    const prof = resolveAudioProfile(cfg), ens = resolveArrangement(cfg).ensemble, groove = resolveGroove(cfg);
    const padRole = prof.pad && prof.pad.role, padOn = padRole && ens.pad !== 'off';
    // [icon, role, mixerKey, autoLabel, kind] — kind drives the per-row voice menu
    // (the swap moved OUT of the buried Mixer onto the band strip; 'none' = drumless = read-only).
    const rows = [];
    if (ens.comp !== 'off') {
      if (padOn && padRole === 'comp') rows.push(['🎹', 'Keys', 'pad', bandVoiceLabel(prof.pad), 'melodic']);   // comp-on-keys (jazz piano)
      else {
        rows.push(['🎸', 'Rhythm', 'harmony', bandVoiceLabel(prof.harmony), 'melodic']);
        if (padOn && padRole === 'sustain') rows.push(['🎹', 'Keys', 'pad', bandVoiceLabel(prof.pad), 'melodic']);
      }
    }
    if (ens.bass !== 'off') rows.push(['🎵', 'Bass', 'bass', bandVoiceLabel(prof.bass, 'bass'), 'bass']);
    const drumsOn = ens.drums !== 'off' && groove;
    rows.push(['🥁', 'Drums', 'drums', drumsOn ? (BAND_KIT_LABEL[prof.drums && prof.drums.kit] || 'Kit') : '— drumless', drumsOn ? 'drums' : 'none']);
    host.innerHTML = '';
    for (const [ic, role, mkey, autoLabel, kind] of rows) {
      const row = document.createElement('div'); row.className = 'virtuoso_lab-band-row';
      row.innerHTML = `<span class="virtuoso_lab-band-ic">${ic}</span><span class="virtuoso_lab-band-role">${role}</span>`;
      if (kind === 'none') {
        const n = document.createElement('span'); n.className = 'virtuoso_lab-band-name virtuoso_lab-band-name-mute'; n.textContent = autoLabel; row.appendChild(n);
      } else {
        const sel = document.createElement('select'); sel.className = 'virtuoso_lab-band-voice'; sel.setAttribute('aria-label', role + ' voice');
        const opts = kind === 'drums' ? MIXER_KITS : (kind === 'bass' ? MIXER_INSTRUMENTS.bass : MIXER_INSTRUMENTS.melodic);
        const cur = (kind === 'drums' ? mixerState[mkey].kit : mixerState[mkey].instrument) || '';
        for (const [val, lab] of opts) {
          const o = document.createElement('option'); o.value = val;
          o.textContent = (val === '') ? `Auto · ${autoLabel}` : lab;
          if (val === cur) o.selected = true;
          sel.appendChild(o);
        }
        sel.addEventListener('change', () => {
          if (kind === 'drums') mixerState[mkey].kit = sel.value || null;
          else mixerState[mkey].instrument = sel.value || null;
          mixerSave();
          commitLiveVoiceSwap(mkey, kind === 'drums');   // same token-guarded swap as the Mixer
        });
        row.appendChild(sel);
      }
      host.appendChild(row);
    }
  }
  // The saved jam style is the SOURCE OF TRUTH (the picker is now a collapsible
  // accordion, so the active chip may not be in the DOM — never read the style from a
  // `.active` chip). Recent = the last few jammed styles (frictionless re-entry).
  let _jamPickerOpenFam = '';   // expanded family ('' = the active style's family; '__none__' = all collapsed)
  let _jamPickerQuery = '';
  function currentJamStyleId() {
    let s = null; try { s = localStorage.getItem('virtuoso_lab.jamStyle'); } catch (_) {}
    return (s && STYLE_PALETTES[s]) ? s : Object.keys(STYLE_PALETTES)[0];
  }
  /** @returns {string[]} */
  function jamRecentStyles() {
    try { return (JSON.parse(localStorage.getItem('virtuoso_lab.jamRecent') || '[]') || []).filter((/** @type {string} */ id) => STYLE_PALETTES[id]); } catch (_) { return []; }
  }
  /** @param {string} id */
  function setJamStyleId(id) {
    if (!STYLE_PALETTES[id]) return;
    try { localStorage.setItem('virtuoso_lab.jamStyle', id); } catch (_) {}
    try { const r = jamRecentStyles().filter(x => x !== id); r.unshift(id); localStorage.setItem('virtuoso_lab.jamRecent', JSON.stringify(r.slice(0, 4))); } catch (_) {}
  }
  /** @param {string} id */
  function jamFamilyOf(id) { for (const [lab, ids] of GENRE_FAMILIES) if (ids.includes(id)) return lab; return null; }
  // The Jam style picker (IA redesign, panel 2026-06-14): the 29-chip WALL collapsed to
  // a search box + a Recent row + 6 collapsible FAMILY sections (only the active style's
  // family — or the one you open — shows its chips). ~7 things visible instead of 29.
  function renderJamStyles() {
    const host = $('virtuoso_lab-jam-styles');
    if (!host) return;
    host.innerHTML = '';
    const activeId = currentJamStyleId();
    const q = _jamPickerQuery.trim().toLowerCase();
    /** @param {string} id */
    const pickStyle = (id) => {
      if (!STYLE_PALETTES[id] || id === activeId) return;
      setJamStyleId(id);
      syncJamStyleDetails(id);                 // Updates picker + Band strip + intents immediately
      if (transport.playing && isJamMode()) jamQueueChange();   // Jam live-edits land at the wrap, style included
      renderJamStyles();
    syncJamHighlightUI();
    };
    /** @param {string} id */
    const mkChip = (id) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'virtuoso_lab-jam-style' + (id === activeId ? ' active' : '');
      btn.dataset.style = id;
      btn.textContent = STYLE_PALETTES[id].label;
      btn.addEventListener('click', () => pickStyle(id));
      return btn;
    };
    /** @param {string[]} ids */
    const chipRow = (ids) => { const r = document.createElement('div'); r.className = 'virtuoso_lab-jam-fam-row'; ids.forEach(id => r.appendChild(mkChip(id))); host.appendChild(r); };
    const search = document.createElement('input');
    search.type = 'search'; search.className = 'virtuoso_lab-jam-search'; search.placeholder = 'Search styles…'; search.value = _jamPickerQuery;
    search.setAttribute('aria-label', 'Search styles');
    search.addEventListener('input', () => { _jamPickerQuery = search.value; renderJamStyles(); });
    host.appendChild(search);
    if (q) {   // search mode: a flat filtered result, no families
      const hits = Object.keys(STYLE_PALETTES).filter(id => STYLE_PALETTES[id].label.toLowerCase().includes(q) || id.includes(q));
      if (hits.length) chipRow(hits);
      else { const e = document.createElement('div'); e.className = 'virtuoso_lab-jam-fam'; e.textContent = 'no match'; host.appendChild(e); }
      setTimeout(() => { const s = host.querySelector('.virtuoso_lab-jam-search'); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } }, 0);
      return;
    }
    const recent = jamRecentStyles().filter(id => id !== activeId).slice(0, 3);
    if (recent.length) { const l = document.createElement('div'); l.className = 'virtuoso_lab-jam-fam'; l.textContent = 'Recent'; host.appendChild(l); chipRow(recent); }
    const openFam = _jamPickerOpenFam || jamFamilyOf(activeId) || GENRE_FAMILIES[0][0];
    for (const [label, ids] of GENRE_FAMILIES) {
      const present = ids.filter(id => STYLE_PALETTES[id]);
      if (!present.length) continue;
      const isOpen = label === openFam;
      const head = document.createElement('button');
      head.type = 'button';
      head.className = 'virtuoso_lab-jam-fam-head' + (isOpen ? ' open' : '');
      head.setAttribute('aria-expanded', String(isOpen));
      const cur = (present.includes(activeId) && !isOpen) ? `<span class="virtuoso_lab-jam-fam-cur">${STYLE_PALETTES[activeId].label}</span>` : '';
      head.innerHTML = `<span class="virtuoso_lab-jam-fam-chev">${isOpen ? '▾' : '▸'}</span><span class="virtuoso_lab-jam-fam-lab">${label}</span>${cur}`;
      head.addEventListener('click', () => { _jamPickerOpenFam = isOpen ? '__none__' : label; renderJamStyles(); });
      host.appendChild(head);
      if (isOpen) chipRow(present);
    }
    syncJamStyleDetails(activeId);
  }
  // Per-style Inspector details (slice J-1): the named Changes picker over the
  // palette's progressions[] (default "Mix" = the wrap-boundary round-robin,
  // D-J5a) + the one-line "try this" intent seed (goal-card grammar, JAM_PROMPTS).
  /** @param {string} styleId */
  function syncJamStyleDetails(styleId) {
    const pal = STYLE_PALETTES[styleId];
    const sel = $('virtuoso_lab-jam-prog');
    if (sel && pal) {
      sel.innerHTML = '';
      if (pal.progressions.length > 1) {
        const mix = document.createElement('option');
        mix.value = '__mix'; mix.textContent = `Mix — cycle all ${pal.progressions.length}`;
        sel.appendChild(mix);
      }
      pal.progressions.forEach((p) => {
        const o = document.createElement('option');
        o.value = p; o.textContent = jamProgressionLabel(p);
        sel.appendChild(o);
      });
      sel.disabled = pal.progressions.length < 2 && !!sel.options.length;
    }
    const tryEl = $('virtuoso_lab-jam-try');
    if (tryEl) tryEl.textContent = JAM_PROMPTS[styleId] || '';
    renderJamIntents(styleId);
    renderBandStrip(styleId);   // the "Your band" lineup follows the selected style
  }
  // J-2 intent chips (D-J8). One tappable row: the drill hand-off's device intent
  // first (when armed), then the style's set — bass players get the bass-native
  // set (their job is the foundation). Tap selects, tap again clears. The pick
  // shows on the status line while jamming; it is SELF-checked only — no judge,
  // no score, no tally (the mirror rule; the loop-end reflection is slice J-3).
  /** @param {string} styleId */
  function renderJamIntents(styleId) {
    const host = $('virtuoso_lab-jam-intents');
    if (!host) return;
    const list = isBassCfg(readConfig()) ? jamBassIntents(styleId) : (JAM_INTENTS[styleId] || []);
    const items = (_jamDeviceIntent ? [_jamDeviceIntent] : []).concat(list);
    if (jamIntent && !items.includes(jamIntent)) jamIntent = '';   // stale pick (style/instrument switch)
    host.innerHTML = '';
    items.forEach(txt => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'virtuoso_lab-jam-intent' + (txt === jamIntent ? ' active' : '')
        + (_jamDeviceIntent && txt === _jamDeviceIntent ? ' device' : '');
      b.textContent = txt;
      b.addEventListener('click', () => {
        jamIntent = (jamIntent === txt) ? '' : txt;
        host.querySelectorAll('.virtuoso_lab-jam-intent').forEach(x => x.classList.toggle('active', x.textContent === jamIntent));
        refreshStatusFromState();
      });
      host.appendChild(b);
    });
    host.hidden = !items.length;
  }
  // J-2 (D-J5b) — the Harmonic-Depth dial, a staged chordDepth: Simple = bare
  // triads (hear the skeleton), Core = the style's authored depth, Rich = one
  // step richer (7ths→9ths, triads→7ths, 9ths→13ths — voiceChord still caps).
  // Roots/bass stay pinned by construction: depth only widens the upper voicing.
  // Power-chord styles (chordOverride '5'/'5oct') keep their 5ths — depth never
  // overrides a style's authored chord QUALITY, only its extension ceiling.
  /** @param {string} palDepth */
  function jamDepthChordDepth(palDepth) {
    if (jamDepth === 'simple') return 'triad';
    if (jamDepth === 'rich') {
      return palDepth === 'ninth' ? 'thirteenth' : palDepth === 'seventh' ? 'ninth' : 'seventh';
    }
    return palDepth;   // core = the style's authored depth
  }
  // J-2 (D-J10) — the drill→Jam device hand-off: a cleared rung's "Jam this
  // skill ▸" arms a jam pre-loaded with the style, the run's KEY, and the
  // drilled device as the first (pre-selected) intent chip. Close-and-arm:
  // the player presses ▶ Jam — nothing autoplays.
  /** @param {string} styleId @param {string | null} key @param {string} deviceLabel */
  function jamArmFromDrill(styleId, key, deviceLabel) {
    selectMode('jam');
    setJamStyleId(styleId);
    renderJamStyles();
    const keySel = $('virtuoso_lab-jam-key');
    if (key && keySel && [...keySel.options].some(o => o.value === key)) keySel.value = key;
    if (deviceLabel) {
      _jamDeviceIntent = 'Quote what you drilled: ' + deviceLabel;
      jamIntent = _jamDeviceIntent;
    }
    renderJamIntents(styleId);
    $('virtuoso_lab-jam-go')?.focus();
  }

  // ── J-2 wrap-boundary live changes (D-J3: the loop wrap is the change-quantum) ──
  // While jamming, a jam-panel change never interrupts the pass: it queues a
  // pending chip, and at the next A-B loop wrap the jam rebuilds from the LIVE
  // panel state (band convention — the new key/tempo/feel/changes land at the
  // top of the cycle, telegraphed, no stop+restart and no mid-phrase glitch).
  // The current panel state, read the same way jamPlay reads it.
  // The live-change "landed" flash (telegraph): when a queued change applies at the loop
  // top, pulse the jam pane so the player SEES it take (closes the "I asked → the band did
  // it" loop). Visual only, reduced-motion-aware, no audio (mirror-not-judge: accent, not green).
  function flashJamApplied() {
    const el = document.querySelector('.virtuoso_lab-jam-inspector');
    if (!el || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    el.classList.remove('virtuoso_lab-jam-applied');
    void el.offsetWidth;   // restart the animation
    el.classList.add('virtuoso_lab-jam-applied');
    setTimeout(() => el.classList.remove('virtuoso_lab-jam-applied'), 650);
  }
  // ── J-3 played-note mirror + recap accumulator (Jam = MIRROR, never judge) ───
  // The detector's live pitch (ptOnPitch) lights the fretboard where YOU just
  // played, fading — distinct from the chord-tone target. A cumulative
  // accumulator feeds the warm, no-score recap at a deliberate jam stop. Reset
  // each jamPlay (a new session); NOT reset on a wrap hot-swap (same session).
  const JAM_PLAYED_FADE_MS = 1400;
  function jamMirrorReset() { _jamPlayed = []; _jamMirror = { noteCount: 0, pcs: new Set(), lastPc: -1, lastMs: 0 }; goldReset(); }
  /** @param {number} pc @param {number} chartT */
  function jamMirrorDebugAdd(pc, chartT) {
    if (!_jamMirror) jamMirrorReset();
    const p = ((pc % 12) + 12) % 12;
    (/** @type {NonNullable<typeof _jamMirror>} */ (_jamMirror)).noteCount++;
    (/** @type {NonNullable<typeof _jamMirror>} */ (_jamMirror)).pcs.add(p);
    _jamPlayed.push({ pc: p, midi: pcAtOrAbove(p, jamIsBassContext() ? 36 : 60), t: performance.now(), chartT: Number(chartT) || 0 });
    if (_jamPlayed.length > 192) _jamPlayed.shift();
  }
  function jamTimelineEventsForRecap() {
    if (!activeBundle) return [];
    return activeBundle.timeline || (activeBundle.chart && activeBundle.chart.timeline) || [];
  }
  function jamRecapAnalysisLines() {
    if (!_jamMirror || !_jamPlayed.length || !activeBundle) return [];
    const played = _jamPlayed.filter(p => Number.isFinite(p.chartT));
    if (!played.length) return [];
    const lines = [];
    let seen = 0, chord = 0, guide = 0, roots = 0;
    for (const p of played) {
      const info = jamCarrierInfo(p.chartT);
      if (!info || !info.cur) continue;
      seen++;
      if (Array.isArray(info.cur.cpcs) && info.cur.cpcs.includes(p.pc)) chord++;
      if (Array.isArray(info.cur.gpcs) && info.cur.gpcs.includes(p.pc)) guide++;
      if (info.cur.rootPc === p.pc) roots++;
    }
    if (!seen) return [];
    if (jamIsBassContext()) {
      const tl = jamTimelineEventsForRecap();
      const lead = activeBundle.leadIn || 0;
      const beat = chartBeatSeconds(activeBundle) || 0.5;
      let changes = 0, rootDownbeats = 0, approaches = 0;
      for (let i = 0; i < tl.length; i++) {
        const ev = tl[i], prev = tl[i - 1] || null;
        if (ev.rootPc == null) continue;
        const changed = !prev || prev.rootPc !== ev.rootPc || prev.quality !== ev.quality;
        if (!changed) continue;
        const start = lead + (ev.startSec != null ? ev.startSec : (ev.t || 0));
        const root = ((ev.rootPc % 12) + 12) % 12;
        changes++;
        if (played.some(p => p.chartT >= start - 0.05 && p.chartT <= start + beat * 0.75 && p.pc === root)) rootDownbeats++;
        if (i > 0) {
          const lo = (root + 11) % 12, hi = (root + 1) % 12;
          if (played.some(p => p.chartT >= start - beat && p.chartT < start && (p.pc === lo || p.pc === hi))) approaches++;
        }
      }
      lines.push(`Root focus: ${roots} of ${seen} detected notes were roots of the chord under them.`);
      if (changes) lines.push(`Change landings: ${rootDownbeats} of ${changes} chord changes had a detected root near the downbeat.`);
      if (approaches) lines.push(`Approach motion: heard half-step motion into ${approaches} change${approaches === 1 ? '' : 's'}.`);
    } else {
      lines.push(`Chord-tone choices: ${chord} of ${seen} detected notes matched the chord under them.`);
      if (guide) lines.push(`Guide-tone color: ${guide} detected notes were 3rds or 7ths.`);
      if (roots) lines.push(`Root resets: ${roots} detected root landing${roots === 1 ? '' : 's'} anchored the form.`);
    }
    return lines;
  }
  /** @param {number} freqHz */
  function jamMirrorCapture(freqHz) {
    if (!_jamMirror || !(freqHz > 0)) return;
    const midi = Math.round(69 + 12 * Math.log2(freqHz / 440));
    if (!Number.isFinite(midi) || midi < 24 || midi > 108) return;   // sane fretted range
    const pc = ((midi % 12) + 12) % 12, now = performance.now();
    // Dedupe a sustained note's re-locks: a NEW note = a different pc or >150ms gap.
    const isNew = pc !== _jamMirror.lastPc || (now - _jamMirror.lastMs) > 150;
    _jamMirror.lastPc = pc; _jamMirror.lastMs = now;
    if (!isNew) return;
    _jamMirror.noteCount++;
    _jamMirror.pcs.add(pc);
    _jamPlayed.push({ pc, midi, t: now, chartT: transport.time });
    if (_jamPlayed.length > 192) _jamPlayed.shift();
    goldPropose(midi, pc);   // comb-confirm (or YIN-classify) for the Gold rung
  }
  // ── Gold improv verifier (career passports Gold rung) ─────────────────────
  // The harmonic-comb NoteVerifier is the DETECTION AUTHORITY: the YIN mirror
  // proposes each fresh note, the comb confirms it (a single-note verify
  // target against the player's real tuning), and only confirmed notes
  // classify against the chord/key under the playhead. Jam runs deliberately
  // skip the chart verifier (startPitchTracker: `_ndVerifyMode = … && !isJamMode()`
  // — the mirror never judges), so gold owns the one verify slot for the whole
  // run via goldArm's bare detector enable. Browser/downlevel (no comb) falls
  // back to YIN-classified notes with verifier:'yin'; the Gold bar is comb-only
  // by default — the recap says which ear listened. Values are PLACEHOLDERS
  // until the on-device tuning session calibrates them.
  const GOLD_BAR = {
    minMs: 180000,       // ≥3 minutes of deliberate jam
    minInKeyPct: 0.8,    // of confirmed notes
    minChordHops: 6,     // chord-segment changes played over (loops recount)
    minPcs: 7,           // distinct tones confirmed
    combOnly: true,
  };
  /** @type {{confirmed: number, inChord: number, inKey: number, outside: number, pcs: Set<number>, chordHops: number, lastSeg: string | null, comb: boolean} | null} */
  let _goldMirror = null;
  /** @type {{pc: number, chartT: number, until: number} | null} */
  let _goldPending = null;   // {pc, chartT, until} — one comb confirm in flight

  function goldReset() {
    _goldMirror = { confirmed: 0, inChord: 0, inKey: 0, outside: 0,
                    pcs: new Set(), chordHops: 0, lastSeg: null, comb: false };
    _goldPending = null;
  }

  /** @param {number} pc @param {number} chartT */
  function goldClassify(pc, chartT) {
    const g = _goldMirror;
    if (!g) return;
    const info = jamCarrierInfo(chartT);
    const cur = info && info.cur;
    g.confirmed++;
    g.pcs.add(pc);
    const seg = cur ? `${cur.rootPc ?? 'x'}:${(cur.cpcs || []).join('')}` : null;
    // chordHops counts chord CHANGES played over, not segments touched — the
    // first note seeds the cursor without counting.
    if (seg && g.lastSeg && seg !== g.lastSeg) g.chordHops++;
    if (seg) g.lastSeg = seg;
    if (cur && Array.isArray(cur.cpcs) && cur.cpcs.includes(pc)) { g.inChord++; g.inKey++; return; }
    // Same scale source the recap analysis uses (incl. its major fallback) —
    // gold and the recap must never disagree on what "in key" means.
    const cfg = activeBundle && activeBundle.config;
    if (cfg && scalePcs(cfg).includes(pc)) { g.inKey++; return; }
    g.outside++;
  }

  // Jam-run detector arm: enable note_detect BARE — no chart pushed, no
  // contained slot claimed — so the host's timing-free _runVerifyTarget path
  // scores gold's single-note pushes on desktop AND browser. Async like
  // _ndArmVerify: a stop racing enable() must not leave the detector on.
  let _goldArmed = false, _goldWeEnabled = false, _goldArmGen = 0;
  async function goldArm() {
    if (!ndVerifyAvailable()) return;
    const myGen = ++_goldArmGen;
    let weEnabled = false;
    try {
      if (!(/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).isEnabled?.()) { await (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).enable?.(); weEnabled = true; }
    } catch (_) { return; }   // no detector → the YIN fallback classifies
    if (myGen !== _goldArmGen) {
      // Run stopped (or restarted) during enable() — undo our enable, don't arm.
      if (weEnabled) { try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).disable?.({ silent: true }); } catch (_) {} }
      return;
    }
    _goldWeEnabled = weEnabled;
    _goldArmed = true;
  }
  function goldDisarm() {
    _goldArmGen++;   // invalidate an in-flight goldArm
    _goldPending = null;
    if (!_goldArmed) return;
    _goldArmed = false;
    try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).setVerifyTarget(null); } catch (_) {}
    if (_goldWeEnabled) { try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).disable?.({ silent: true }); } catch (_) {} _goldWeEnabled = false; }
  }
  function goldCombActive() { return _goldArmed; }

  // Any correct (string, fret) position produces the same pitch for the comb.
  /** @param {number} midi @param {number[]} [omOverride] */
  function goldMidiTarget(midi, omOverride) {
    const om = omOverride || _ptOpenMidis || [];
    for (let st = om.length - 1; st >= 0; st--) {
      const f = midi - om[st];
      if (f >= 0 && f <= 21) return [{ s: st, f, b: false }];
    }
    return null;
  }

  /** @param {number} midi @param {number} pc */
  function goldPropose(midi, pc) {
    if (!_goldMirror) return;
    if (!goldCombActive()) {
      // No comb: classify the YIN note directly; the recap and the Gold bar
      // both know this take was heard by the browser ear.
      goldClassify(pc, transport.time);
      return;
    }
    _goldMirror.comb = true;
    const tgt = goldMidiTarget(midi);
    if (!tgt) return;
    _goldPending = { pc, chartT: transport.time, until: performance.now() + 350 };
    try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).setVerifyTarget(tgt, { openMidis: _ptOpenMidis || [] }); } catch (_) { /* comb briefly gone */ }
  }

  // Registered once at load; gated on _goldArmed (jam runs only — gold owns
  // the slot there), so it can never react to an exercise verifier's events
  // or clobber an exercise's live verify target.
  /** @param {(Event & {detail?: {isHit?: boolean}}) | null} ev */
  function goldOnVerify(ev) {
    if (!_goldArmed) return;
    const d = ev && ev.detail;
    const pending = _goldPending;
    if (!d || !d.isHit || !pending) return;
    _goldPending = null;
    try { (/** @type {Required<import('./src/types/host-interfaces.js').NoteDetect>} */ (window.noteDetect)).setVerifyTarget(null); } catch (_) { /* ok */ }
    if (performance.now() <= pending.until) goldClassify(pending.pc, pending.chartT);
  }
  if (typeof window !== 'undefined') window.addEventListener('notedetect:verify', goldOnVerify);

  /** @param {{duration_ms?: number} | null} s */
  function goldEvaluate(s) {
    const g = _goldMirror;
    if (!g || !g.confirmed) return null;
    const inKeyPct = g.inKey / g.confirmed;
    /** @type {{confirmed: number, inChord: number, inKey: number, inChordPct: number, inKeyPct: number, chordHops: number, pcCount: number, verifier: string, durationMs: number, met?: boolean}} */
    const res = {
      confirmed: g.confirmed,
      inChord: g.inChord,
      inKey: g.inKey,
      inChordPct: g.inChord / g.confirmed,
      inKeyPct,
      chordHops: g.chordHops,
      pcCount: g.pcs.size,   // a COUNT — `pcs` elsewhere in this file is a pitch-class list
      verifier: g.comb ? 'comb' : 'yin',
      durationMs: (s && s.duration_ms) || 0,
    };
    res.met = res.durationMs >= GOLD_BAR.minMs
      && inKeyPct >= GOLD_BAR.minInKeyPct
      && res.chordHops >= GOLD_BAR.minChordHops
      && res.pcCount >= GOLD_BAR.minPcs
      && (!GOLD_BAR.combOnly || g.comb);
    return res;
  }

  // Gained-only: the first qualifying jam mints the style's gold; nothing
  // ever un-mints it.
  /** @param {string} styleId @param {NonNullable<ReturnType<typeof goldEvaluate>>} res */
  function goldStore(styleId, res) {
    const o = progressLoad();
    o.goldImprov = o.goldImprov || {};
    if (o.goldImprov[styleId]) return false;
    o.goldImprov[styleId] = {
      at: Date.now(),
      durationMs: res.durationMs,
      inKeyPct: Math.round(res.inKeyPct * 100) / 100,
      chords: res.chordHops,
      pcCount: res.pcCount,
      verifier: res.verifier,
    };
    progressSave(o);
    return true;
  }

  function jamPanelState() {
    return {
      style: currentJamStyleId(),
      key: (($('virtuoso_lab-jam-key') || {}).value) || 'A',
      tempo: Math.max(40, Math.min(220, parseInt(($('virtuoso_lab-jam-tempo') || {}).value || '90', 10) || 90)),
      feel: jamFeel,
      prog: (($('virtuoso_lab-jam-prog') || {}).value) || '__mix',
      band: jamBandMode,
      guide: !!jamGuideLine,
      depth: jamDepth,
      energy: jamEnergy,
      spotlight: jamSpotlight,
    };
  }
  function jamPendingCountdownText() {
    if (!transport.playing || !isJamMode() || transport.loopA == null || transport.loopB == null || !activeBundle) return '';
    const beatSec = chartBeatSeconds(activeBundle) || 0;
    if (!(beatSec > 0.02)) return '';
    const remain = Math.max(0, transport.loopB - transport.time);
    const beatsLeft = Math.max(1, Math.ceil(remain / beatSec - 1e-3));
    return beatsLeft <= 1 ? 'next beat' : ('in ' + beatsLeft + ' beats');
  }
  function syncJamPendingChip() {
    const chip = $('virtuoso_lab-jam-pending');
    if (!chip) return;
    chip.hidden = !_jamPending;
    if (_jamPending) {
      const when = jamPendingCountdownText();
      chip.textContent = '↻ At the wrap' + (when ? ' ' + when : '') + ': ' + _jamPendingParts.join(' · ');
    }
  }
  // Called by every jam-panel control while a jam is running: diff against the
  // pass's snapshot, show/refresh (or clear) the pending chip. Changing a value
  // back before the wrap cancels cleanly — nothing rebuilds.
  function jamQueueChange() {
    if (!transport.playing || !isJamMode() || !_jamSnapshot) return;
    const now = jamPanelState(), was = _jamSnapshot, parts = [];
    if (now.style !== was.style) parts.push((STYLE_PALETTES[now.style] || {}).label || now.style);
    if (now.key !== was.key) parts.push('key ' + now.key);
    if (now.tempo !== was.tempo) parts.push(now.tempo + ' BPM');
    if (now.feel !== was.feel) parts.push(now.feel);
    if (now.prog !== was.prog) parts.push(now.prog === '__mix' ? 'mix the changes' : jamProgressionLabel(now.prog));
    if (now.band !== was.band) parts.push(now.band === 'full' ? 'full band' : now.band === 'drums_only' ? 'drums only' : "you're the bassist");
    if (now.guide !== was.guide) parts.push(now.guide ? '+ guide line' : 'band only');
    if (now.depth !== was.depth) parts.push(now.depth === 'simple' ? 'simple chords' : now.depth === 'rich' ? 'rich chords' : 'core chords');
    if (now.energy !== was.energy) parts.push(now.energy === 'auto' ? 'auto-energy' : now.energy + ' energy');
    if (now.spotlight !== was.spotlight) parts.push(now.spotlight ? 'spotlight: trade solos' : 'spotlight off');
    _jamPending = parts.length > 0;
    _jamPendingParts = parts;
    syncJamPendingChip();
  }
  function jamPendingClear() {
    _jamPending = false;
    _jamPendingParts = [];
    const chip = $('virtuoso_lab-jam-pending'); if (chip) chip.hidden = true;
  }

  // Jam: loop a backing in the selected style through the contained player to play
  // along to. Builds a config from the shared STYLE_PALETTES (the same harmony source
  // a Pathway/Custom draws from) + the Jam key/tempo/feel; the lead scale is the
  // reference line and the progression comp is the backing band. Loops [leadIn,
  // duration] so it keeps going. A MIRROR — no score, no rank (north star).
  // Build the jam exercise config from the LIVE panel state. Shared by jamPlay
  // (the full play path) and jamHotSwapAtWrap (the in-place loop-seam swap) so
  // the two can never drift. Returns { cfg } or null when the style has no
  // palette (nothing to play).
  /** @returns {{cfg: import('./src/types/entry-data.js').EntryConfig} | null} */
  function buildJamConfig() {
    const styleId = currentJamStyleId();   // saved id is the source of truth (the picker accordion may hide the active chip)
    const jamKey = ($('virtuoso_lab-jam-key') || {}).value || 'A';
    const jamTempo = Math.max(40, Math.min(220, parseInt(($('virtuoso_lab-jam-tempo') || {}).value || '90', 10) || 90));
    // Changes picker (D-J5a): '__mix' = round-robin the palette's progressions[]
    // per pass (the "switch it up" shuffle); a named pick pins one.
    const progVal = (($('virtuoso_lab-jam-prog') || {}).value) || '__mix';
    const palIdx = progVal === '__mix' ? 0 : Math.max(0, (STYLE_PALETTES[styleId] || { progressions: [] }).progressions.indexOf(progVal));
    const palette = stylePaletteConfig(styleId, { key: jamKey, progressionIdx: palIdx });
    if (!palette) return null;
    const base = readConfig();   // instrument / tuning / renderer / audio defaults
    // Home box derived from the KEY (D-J7: a suggestion, not the old frets-2-9
    // cage): the silent guide pattern sits in the box-1 window at the key's root
    // on the lowest string; the strip draws it as an ignorable ghost frame.
    const opens = openMidisForConfig(base);
    const keyPc = NOTE_ALIASES[jamKey] != null ? NOTE_ALIASES[jamKey] : 0;
    const rootFret = (((keyPc - (opens[0] % 12)) % 12) + 12) % 12;
    const fretMin = Math.max(0, rootFret - 1);
    const fretMax = Math.min(17, Math.max(fretMin + 5, rootFret + 4));
    // Bass band-mode (D-J2): a bassist OWNS the foundation — the band's bass
    // drops unless they opt back into 'full'. Guitar always gets the full band.
    const bandMode = isBassCfg(base) ? jamBandMode : 'full';
    // One cycle per pass; buildJamChart assembles 4 varied passes (re-roll +
    // density cycle + seam fill) and the loop covers them all (D-J4).
    const jamDegs = COMMON_PROGRESSIONS[palette.progression];
    const jamBars = (jamDegs && jamDegs.length) ? Math.max(2, Math.min(16, jamDegs.length)) : 8;
    const cfg = Object.assign({}, base, {
      mode: undefined, shapeNotes: undefined,
      practiceType: 'scale',
      scale: palette.scale, key: palette.key,
      progression: palette.progression,
      // D-J5b: the Harmonic-Depth dial stages the style's authored depth
      // (Simple/Core/Rich); the chord QUALITY override is never touched.
      chordDepth: jamDepthChordDepth(palette.chordDepth), chordOverride: palette.chordOverride,
      swing: jamFeel, backingStyle: palette.backingStyle,
      // Jam ALWAYS plays the GENRE'S recipe band — clear any persisted Custom/Pathway
      // backing overrides (readConfig carries backingComp/backingBass/backingDensity
      // from the form) so they can't force a generic comp + bass on every genre.
      // THIS was the "16th comp + quarter-root bass on all genres" bug: a stale
      // backingComp/backingBass (e.g. a metal pathway's metal_chug_8/root_pump) was
      // overriding compCellForConfig/bassFigureForConfig ahead of the recipe.
      backingComp: '', backingBass: '', backingDensity: undefined, backingPadDev: false,
      fretboardSystem: 'position', fretMin, fretMax,
      bpm: jamTempo, bars: jamBars, harmonize: false, keyCycle: 'none', sequence: 'none', direction: 'up_down',
      jamStyle: styleId, jamPasses: 4, jamProgressionIdx: palIdx,
      jamEnergy,   // J-3: drives the per-pass density arc + dynamics in buildJamChart
      jamSpotlight,   // J-3 Spotlight: tags lead notes per turn (buildJamChart) + the lead is audible on band turns
      jamSwitchUp: progVal === '__mix',
      jamBandMode: bandMode === 'full' ? '' : bandMode,
      // D-J1: the generated line is SILENT by default — the band plays, the
      // player is the lead voice. "+ Guide line" opts the audio back in; the
      // visual line stays either way (it's the silent map on the highway).
      // brightness: undefined → resolveAudioProfile uses the GENRE's brightness, not the
      // stale Custom slider (Jam has no brightness control). This is the Jam half of the
      // "brightness clobbered to 0.5" fix; the Custom-mode opt-in slider is a roll-out item.
      // Spotlight forces notes ON so the band's lead voice can sound on its turns
      // (the scheduler still silences YOUR-turn lead notes per the n.solo gate).
      // Click in Jam (2026-06-14): honor the Click pill (default ON) instead of forcing it off,
      // so the metronome is toggleable in EVERY mode + the first-pass count-in is audible.
      audio: Object.assign({}, base.audio, { notes: !!jamGuideLine || jamSpotlight, harmony: true, metronome: base.audio.metronome !== false, profile: palette.audioProfile || '', brightness: undefined }),
    });
    return { cfg };
  }

  async function jamPlay() {
    const built = buildJamConfig();
    if (!built) return;
    const { cfg } = built;
    let request = rendererLifecycle.invalidate();
    try {
      if (transport.playing) stopPlayback();
      const exercise = generateExercise(cfg);
      lastExercise = exercise;
      const pending = attachRenderer(exercise);
      request = rendererLifecycle.currentRequest();
      if (!await transport.runStart(pending, () => {
        const dur = activeBundle?.songInfo?.duration || 0, lead = activeBundle?.leadIn || 0;
        if (dur > lead + 0.1) { try { setSegmentLoop(lead, dur); } catch (_) {} }
      })) return;
      jamMirrorReset();                 // J-3: fresh played-note mirror + recap accumulator for this jam session
      prewarmMixerCandidates();         // warm the instrument-swap candidates so a mid-jam voice switch is instant (Jam-UX reliability)
      refreshStatusFromState();
      _jamSnapshot = jamPanelState();   // the delta baseline for wrap-boundary live changes (J-2)
      jamPendingClear();
    } catch (e) {
      if (!rendererLifecycle.isCurrentRequest(request)) return;
      showStatus(`Jam error: ${(/** @type {Error} */ (e)).message || e}`);
      console.error('[Virtuoso] jam failed', e);
    }
  }

  // In-place jam swap AT the loop seam (called from tick when _jamPending). The
  // chart is rebuilt from the live panel and the active/renderer bundles are
  // swapped WITHOUT stopRenderer→attachRenderer→init — the renderers re-read the
  // bundle every frame (see attachRenderer's rendererBundle + drawOnce), so the
  // canvas, the borrowed host viz, and the pitch tracker all keep running; only
  // the audio is re-anchored to the new chart's downbeat. This replaces the old
  // jamPlay() rebuild seam (full teardown + count-in-less restart + possible
  // ~3 s host-viz reload). Returns true on an in-place swap (caller re-arms the
  // rAF), false when it fell back to the full jamPlay() (which re-arms itself).
  function jamHotSwapAtWrap() {
    const built = buildJamConfig();
    // No renderer alive, or no config → can't swap in place; full rebuild.
    if (!built || !rendererLifecycle.renderer) { jamPendingClear(); flashJamApplied(); jamPlay(); return false; }
    const { cfg } = built;
    let exercise;
    try { exercise = generateExercise(cfg); }
    catch (e) { console.warn('[Virtuoso] jam hot-swap build failed, rebuilding', e); jamPendingClear(); flashJamApplied(); jamPlay(); return false; }
    lastExercise = exercise;
    // Swap the bundles (identical derivation to attachRenderer): the highway gets
    // a chord-free view + bgReactive:false; other renderers get the full bundle.
    activeBundle = makeBundle(exercise);
    // A swapped chart is a new timeline: drop the in-flight gold confirm and
    // the chord-segment cursor so nothing classifies (or "hops") across bundles.
    _goldPending = null;
    if (_goldMirror) _goldMirror.lastSeg = null;
    maybeResyncMixer(cfg);   // jam style hot-swap → the mixer follows the new style
    rendererLifecycle.setBundle(activeBundle, /** @type {string} */ (cfg.renderer));
    fretboardSyncRange();
    // Re-anchor the loop + clock to the NEW chart's music region and (re)start its
    // audio from the downbeat. A deliberate content change can't be gaplessly
    // morphed, so the audio does re-anchor here — but it's a clean downbeat
    // re-entry, not the old stop+rebuild. Set the bounds directly (not via
    // setSegmentLoop) so its playing-branch reschedule doesn't double up with
    // the scheduleCurrentPassAndAnchor below.
    const dur = activeBundle.songInfo?.duration || 0;
    const lead = activeBundle.leadIn || 0;
    if (dur > lead + 0.1) { transport.setLoop(lead, dur); }
    else { transport.setLoop(null, null); }
    transport.moveCursor(lead);
    _runMaxChartTime = lead;
    transport.resetWraps();
    anchorPlayClock(lead);
    stopAudio();
    scheduleCurrentPassAndAnchor(AUDIO_LOOKAHEAD_SECONDS);
    syncTransport();                  // overview bands + ruler + loop readout reflect the new chart
    prewarmMixerCandidates();         // re-warm swap candidates for the new band's voices
    _jamSnapshot = jamPanelState();   // the new delta baseline
    jamPendingClear();
    flashJamApplied();                // telegraph: the queued change LANDED at the top of the cycle
    refreshStatusFromState();
    drawOnce();
    return true;
  }

  // Switch top-level practice mode. Guided/Custom drive the hidden pathway
  // select (its change handler applies the pathway / custom + regenerates);
  // Session swaps to the session panel.
  /** @param {string} mode */
  function selectMode(mode) { practiceSelection.selectMode(mode); }
  /** @param {string} mode @param {boolean} [pathwayMode] */
  function changeModeView(mode, pathwayMode) {
    if (pathwayMode != null) { setPathwayModeClass(pathwayMode); return; }
    if (transport.playing) stopPlayback();
    toggleLibrary(false); toggleStarters(false);   // the browse drawers are Workout-only — never linger over another mode
    const root = $('virtuoso_lab-root');
    if (root) root.classList.remove('virtuoso_lab-jam-mode');   // default: not jam (jam re-adds below)
    if (mode === 'jam') {
      // Jam = the 4th mode: not session, not pathway. Skeleton — style grid + a
      // placeholder Inspector; playback/target-highlight wiring is post-checkpoint.
      syncSessionMode('single');
      setPathwayModeClass(false);          // clears pathway-mode (calls syncModeBar)
      if (root) root.classList.add('virtuoso_lab-jam-mode');
      const primedMap = maybePrimeJamFretboardMap();
      syncJamHighlightUI();
      syncFretboardUI();
      if (primedMap) refitStageDuring(340);
      syncModeBar();                       // re-derive now that jam-mode is set
      return;
    }
    if (mode === 'session') {
      syncSessionMode('session');
      workoutEditor.select(workoutEditor.selectedId);
      syncModeBar();
      return;
    }
    syncSessionMode('single');
  }

  const practicePresentation = createPracticePresentation({ getCurrentPractice(view, pathwayId = practiceSelection.pathwayId) {
    let cfg = null, bestBpm = null, proveClean = false, instrument = null;
    if (view === 'goal' || (view === 'description' && !lastExercise?.session.practiceFile && !(isJamMode() && lastExercise?.session.jamStyle && STYLE_PALETTES[lastExercise.session.jamStyle]))) { try { cfg = readConfig(); } catch (_) {} }
    if (view === 'goal' && pathwayId && PATHWAYS[pathwayId]) {
      if ($('virtuoso_lab-pathway-pb')) bestBpm = (pathwayTiersLoad()[pathwayId] || {}).bestBpm || null;
      // Progress reads stay with their state owner; presentation never creates nodes.
      if ($('virtuoso_lab-prove-clean') && handMarksOn()) {
        try {
          const st = nodeProgressState(pathwayId, pathwayTiersLoad());
          proveClean = !!(st.cleared && progressLoad().mode !== 'off' && !(st.depth && st.depth.clean));
        } catch (_) {}
      }
    }
    if (view === 'goal' && pathwayId && PATHWAYS[pathwayId] && $('virtuoso_lab-pathway-tuning-note') && !$('virtuoso_lab-anchor-station')?.value && parseInt($('virtuoso_lab-tuning-offset')?.value || '0', 10)) {
      const inst = instrumentStoreLoad();
      if (inst) instrument = { stringSetup:inst.stringSetup, midis:instrumentStoreMidis(inst) };
    }
    return { pathwayId:practiceSelection.pathwayId, tierIndex:practiceSelection.tierIndex,
      variationIndex:practiceSelection.variationIndex, bandId:view === 'goal' && pathwayId ? pathwayBandId(pathwayId) : null,
      cfg, bestBpm, proveClean, instrument, detectorMinHz:DETECTOR_MIN_HZ,
      practiceFile:practiceSelection.file, practiceVariantId:practiceSelection.variantId,
      concertKey:view === 'goal' ? document.querySelector('#virtuoso_lab-controls [name="key"]')?.value || '' : '',
      playing:transport.playing, paused:transport.paused, jamMode:isJamMode(), jamIntent, session:lastExercise?.session || null };
  } });

  // Translate the named Position dropdown into raw fretMin/fretMax inputs.
  // Only active in pathway mode — Custom mode lets the user set frets directly.
  // Detect divergence from the curated pathway and flag it visually so the
  // user knows they have drifted off the prescribed exercise. Pathway,
  // Shape, Key, and fret range are all expected to vary; BPM and audio
  // toggles are personal preference, not exercise content. That leaves
  // structural changes (scale, progression, etc) as the only true modifiers —
  // and in pathway mode those controls are hidden anyway.
  /** @param {string} targetName */
  function markPathwayModifiedIfApplicable(targetName) {
    if (!practiceSelection.pathwayId || practiceSelection.pathwayId === 'custom') return;
    const ignore = new Set(['pathway', 'shape', 'fretboardSystem', 'fretMin', 'fretMax', 'key', 'bpm', 'audioNotes', 'audioMetronome', 'audioHarmony']);
    if (ignore.has(targetName)) return;
    practicePresentation.renderGoal(practiceSelection.pathwayId, true);
  }

  // ── L1 tuning adapt (Phase 1: uniform offsets only — tuning panel 2026-06-05) ──
  // The player's physical tuning wins: when their saved tuning is a pure
  // TRANSPOSE of the rung's coded setup (same family + string count, and the
  // player's preset carries the `offset` intent tag — Eb/D standard, never the
  // structural re-stringings like drop-D/BEAD/high-C), rewrite the rung's key
  // to CONCERT (nominal + δ) and chart on the player's opens. The engine is
  // transposition-covariant (the harmony spec: shift key + openMidis together
  // and the frets come out byte-identical), so the rung's fingering pedagogy is
  // preserved exactly while every label, the detector, and the backing land
  // where the player's strings actually sound. "Charts follow your hands,
  // labels follow your sound." keyNominal/tuningOffset ride along for Travel
  // credit (nominal — prevents retune double-credit) + the goal-card note.
  // Out of scope here (Phase 2): structural tunings (cross-class decomposition,
  // retune prompts), rung-coded L3 customOpenMidis (those own the tuning), and
  // non-pathway modes.
  /** @param {import('./src/types/authored-config.js').AuthoredConfig} cfg */
  function applyTuningAdaptL1(cfg) {
    if (cfg.customOpenMidis) return;                         // L3 rung override owns the tuning
    const inst = instrumentStoreLoad();
    if (!inst) return;
    const playerSetup = STRING_SETUPS[inst.stringSetup];
    const rungSetup = STRING_SETUPS[cfg.stringSetup || 'guitar_6_standard'];
    if (!playerSetup || !rungSetup) return;
    if (playerSetup.instrument !== rungSetup.instrument) return;        // family adapt is the instAgnostic block's job
    if (playerSetup.openMidis.length !== rungSetup.openMidis.length) return;
    const effective = instrumentStoreMidis(inst);
    if (!effective) return;
    // Player already IS in the rung's coded tuning → nothing to adapt.
    if (effective.every((m, i) => m === rungSetup.openMidis[i])) return;
    // (A) TAGGED uniform detune (Eb / D-standard — a small `offset`-kind preset,
    // by INTENT not midis arithmetic; see the TUNING_PRESETS tag comment) with a
    // UNIFORM delta vs the rung: transpose key + opens together. The engine is
    // transposition-covariant, so frets come out identical (fingering pedagogy
    // preserved) while labels/detector/backing land on the player's sounding key.
    const fam = `${playerSetup.instrument}_${effective.length}`;
    const preset = (TUNING_PRESETS[fam] || []).find(p => p.midis.length === effective.length && p.midis.every((m, i) => m === effective[i]));
    const d0 = effective[0] - rungSetup.openMidis[0];
    const uniform = effective.every((m, i) => m - rungSetup.openMidis[i] === d0);
    if (preset && preset.offset && uniform && d0 !== 0) {
      const keyPc = NOTE_ALIASES[String(cfg.key)] ?? 0;
      cfg.keyNominal = cfg.key;
      cfg.tuningOffset = d0;
      cfg.tuningLabel = preset.label;
      cfg.key = NOTE_NAMES[((keyPc + d0) % 12 + 12) % 12];   // sharp names — matches the key <select> options
      cfg.customOpenMidis = effective.join(',');
      return;
    }
    // (B) STRUCTURAL / large / untagged re-stringing (drop-*, B-standard, BEAD,
    // high-C, DADGAD, open tunings): chart on the player's REAL opens at CONCERT
    // pitch — KEEP the rung's key, and let the degree-driven resolver re-finger
    // the concert line onto the physical strings. Without this the chart stayed
    // on the rung's STANDARD opens while the player was re-strung, so every note
    // mis-targeted the verifier = catastrophic mis-score (the "B-standard → 24%"
    // tester bug, 2026-07-09). A structural re-stringing is concert-pitch, never
    // a uniform transpose (bass-pedagogy ruling 2026-07-05: a B string is a B,
    // not "everything down a 4th"). keyNominal/tuningOffset stay unset (no Travel
    // double-credit); the label shows the concert key the line actually sounds.
    cfg.customOpenMidis = effective.join(',');
  }

  // ── Anchor policy (keyless-anchor model, panel 2026-06-06 — ADOPTED) ────────
  // Technique/rhythm rungs declare anchor:'open_lowest' + anchorFret instead of
  // coding a key: "pedal at fret N of YOUR lowest string." cfg.key becomes a
  // DERIVED value (pc of opens[0]+anchorFret, sharp names) so the core engine,
  // backing, and detector all receive a concrete concert key with ZERO core
  // changes — and the round-trip theorem (builders recover the pedal fret from
  // the key pc) makes the old bug class (key:'E' over drop-D → "open" pedal at
  // fret 2; key:'A' putting a 5-string bassist at B-string fret 10)
  // UNREPRESENTABLE. The player's L1 instrument wins wholesale for anchor rungs
  // (same family): the lesson is the anchor, not the tuning — this also covers
  // structural tunings (drop-D/BEAD) that the uniform-offset adapt defers.
  // Keyless ≠ pitch-anonymous: the derived pitch is always displayed.
  // Returns true when the rung is anchor-class (the L1 transpose adapt is then
  // skipped — there is no nominal key to transpose).
  /** @param {import('./src/types/authored-config.js').AuthoredConfig} cfg */
  function applyAnchorPolicy(cfg) {
    if (cfg.anchor !== 'open_lowest') return false;
    // The player's declared instrument supersedes the rung's coded setup
    // (same family only — cross-family is the instAgnostic block's job, which
    // runs before this). Rung-coded L3 CSVs (a 7-string drop-A vary) keep
    // their own opens: the anchor then derives from THAT low string.
    if (!cfg.customOpenMidis) {
      const inst = instrumentStoreLoad();
      const rungSetup = STRING_SETUPS[cfg.stringSetup || 'guitar_6_standard'];
      const pSetup = inst && STRING_SETUPS[inst.stringSetup];
      if (pSetup && rungSetup && pSetup.instrument === rungSetup.instrument) {
        cfg.stringSetup = inst.stringSetup;
        if (inst.customOpenMidis) cfg.customOpenMidis = inst.customOpenMidis;
      }
    }
    const setup = STRING_SETUPS[cfg.stringSetup || 'guitar_6_standard'] || STRING_SETUPS.guitar_6_standard;
    let opens = setup.openMidis;
    if (cfg.customOpenMidis) {
      const list = String(cfg.customOpenMidis).split(',').map(s => parseInt(s, 10)).filter(Number.isFinite);
      if (list.length === setup.openMidis.length) opens = list;
    }
    const af = Math.max(0, Math.min(11, parseInt(/** @type {string} */ (/** @type {unknown} */ (cfg.anchorFret)), 10) || 0));
    cfg.anchorFret = af;
    cfg.key = NOTE_NAMES[((opens[0] + af) % 12 + 12) % 12];   // derived concert key
    // Station token for Travel credit + the goal-card readout ('open'/'fret N')
    // — fingering-relative, so a retune can never re-credit the same station.
    cfg.anchorStation = af === 0 ? 'open' : `fret ${af}`;
    return true;
  }


  // Re-derive the active rung's DERIVED fields after an instrument/tuning change:
  // the anchor key, the L1 transpose adapt metadata, and the goal-card readout
  // are all computed AT APPLY TIME, so without this they go stale (the bug:
  // change tuning mid-rung and the card still names the old pitch). SURGICAL by
  // design — it must NOT re-run the full applyPathwayConfig form write: the
  // user's mid-rung instrument pick (and any hand-set fields) stick; only the
  // derived outputs refresh against the form's CURRENT declaration.

  function reapplyActivePathway() {
    if (!(practiceSelection.pathwayId && practiceSelection.pathwayId !== 'custom' && PATHWAYS[practiceSelection.pathwayId])) return;
    const pw = PATHWAYS[practiceSelection.pathwayId];
    const vary = pw.vary && pw.vary.length ? pw.vary : [{}];
    const idx = ((practiceSelection.variationIndex % vary.length) + vary.length) % vary.length;
    const merged = Object.assign({}, pw.base, vary[idx] || {});
    if (merged.anchor === 'open_lowest') {
      // Derive from the form's CURRENT effective opens (the player's declaration
      // — or the rung step's own L3 CSV, which also lives in the form).
      const setupName = document.querySelector('#virtuoso_lab-controls [name="stringSetup"]')?.value;
      const setup = STRING_SETUPS[String(setupName)] || STRING_SETUPS.guitar_6_standard;
      let opens = setup.openMidis;
      const csv = ($('virtuoso_lab-custom-open-midis')?.value || '').trim();
      if (csv) {
        const list = csv.split(',').map(s => parseInt(s, 10)).filter(Number.isFinite);
        if (list.length === setup.openMidis.length) opens = list;
      }
      const af = Math.max(0, Math.min(11, parseInt(/** @type {string} */ (/** @type {unknown} */ (merged.anchorFret)), 10) || 0));
      setFieldSilent('key', NOTE_NAMES[((opens[0] + af) % 12 + 12) % 12]);
      setFieldSilent('anchorStation', af === 0 ? 'open' : `fret ${af}`);
    } else if (merged.key) {
      // Keyed rung: re-run the uniform-offset adapt against the rung's nominal
      // key + the player's CURRENT L1 declaration. On no-adapt (standard tuning,
      // structural tuning, family mismatch) the key resets to nominal and the
      // stale adapt metadata clears — the form's CSV (the player's tuning) is
      // deliberately left untouched.
      /** @type {import('./src/types/authored-config.js').AuthoredConfig} */
      const probe = { key: merged.key, stringSetup: merged.stringSetup, customOpenMidis: merged.customOpenMidis };
      applyTuningAdaptL1(probe);
      if (probe.tuningOffset) {
        setFieldSilent('key', probe.key);
        setFieldSilent('keyNominal', probe.keyNominal);
        setFieldSilent('tuningOffset', probe.tuningOffset);
        setFieldSilent('customOpenMidis', probe.customOpenMidis || '');
      } else {
        setFieldSilent('key', merged.key);
        setFieldSilent('keyNominal', '');
        setFieldSilent('tuningOffset', '');
      }
    } else {
      return;   // no derived pitch fields on this rung — nothing to refresh
    }
    practicePresentation.renderGoal(practiceSelection.pathwayId, $('virtuoso_lab-pathway-goal-card')?.classList.contains('modified'));
    practiceSelection.syncAnchorKeyLock();
  }

  /** @param {string} id @param {number} [variationIdx] */
  function applyPathwayById(id, variationIdx) { practiceSelection.applyPathway(id, variationIdx); }
  /** @param {string} id @param {import('./src/types/authored-config.js').AuthoredConfig | null} tieredConfig @param {import('./src/content/pathways.js').PathwayConfig | null} variation */
  function applySelectedConfig(id, tieredConfig, variation) {
    if (id === 'custom') {
      setPathwayModeClass(false);
      // Leaving the Ladder: the adapt metadata is pathway-scoped — clear it so
      // a Custom run's session record doesn't credit a stale nominal key.
      setFieldSilent('keyNominal', '');
      setFieldSilent('tuningOffset', '');
      setFieldSilent('anchorStation', '');
      practiceSelection.syncAnchorKeyLock();   // Custom mode: the key select is always live
      // Custom mode hides the goal card via CSS, so no card update needed.
      return;
    }
    const pw = PATHWAYS[id];
    if (tieredConfig && variation && pw?.base) {
      // Instrument-agnostic bands (the Rhythm ladder teaches pure TIME) ADAPT to the
      // player's current instrument instead of forcing the rung's coded string-setup —
      // the time skill transfers to guitar OR bass, so a bassist isn't bounced to a
      // 6-string. Swap in the form's setup when the families differ (+ drop the
      // guitar-only shape system on bass; scale/rhythm_pulse/call_response run on
      // either). Other concept bands (Picking/Legato) stay guitar-coded by design.
      // Per-pathway `instAgnostic:true` extends this to pure-time rungs in otherwise
      // guitar-coded bands (the djent chug rungs: bass djent = lock the same cell on
      // the low fundamental — bass-pedagogy ruling, memory project_djent_ladder_design).
      if (pathwayBandId(id) === 'concept_rhythm' || pw.instAgnostic) {
        const formSetup = document.querySelector('#virtuoso_lab-controls [name="stringSetup"]')?.value;
        const fs = formSetup && STRING_SETUPS[formSetup];
        const rungInst = (STRING_SETUPS[String(tieredConfig.stringSetup)] || {}).instrument;
        if (fs && fs.instrument !== rungInst) {
          tieredConfig.stringSetup = formSetup;
          // A guitar rung's custom-tuning CSV is meaningless on the other family's
          // string count — drop it with the setup it belonged to.
          delete tieredConfig.customOpenMidis;
          // …but the PLAYER's own saved tuning survives the family swap
          // (bass-pedagogy ruling 2026-06-05: the old delete also wiped a BEAD/
          // drop-D bassist's declared tuning along with the guitar rung's CSV).
          const inst = instrumentStoreLoad();
          if (inst && inst.stringSetup === formSetup && inst.customOpenMidis) tieredConfig.customOpenMidis = inst.customOpenMidis;
          if (fs.instrument === 'bass') { tieredConfig.fretboardSystem = 'position'; delete tieredConfig.shape; }
        }
      }
      // Anchor rungs derive their key from the player's lowest string; keyed
      // rungs get the same-family uniform-offset transpose (concert key +
      // player opens, identical frets). Mutually exclusive by design.
      if (!pw.practiceFile && !applyAnchorPolicy(tieredConfig)) applyTuningAdaptL1(tieredConfig);
      practiceSelection.tierConfig(id, tieredConfig);
      applyPathwayConfig(tieredConfig);
      setPathwayModeClass(true);
      practicePresentation.renderGoal(id, false);
      // Resolve the pathway's intended shape. New-style pathways can set
      // `fretboardSystem` + `shape` directly; legacy pathways pass `fretMin`
      // (and we pick the closest shape on the current key).
      practiceSelection.selectShape(id, tieredConfig, variation);
      syncTempoTierButtons();
      practiceSelection.syncScaleDropdown(id);
      practicePresentation.renderPosition();
      renderSkillTree();
      practiceSelection.syncAnchorKeyLock();   // anchor rungs: the key select is a derived readout
      return;
    }
    const preset = practicePresets.get(id);
    if (preset && preset.config) {
      applyPathwayConfig(preset.config);
      setPathwayModeClass(true);
      practicePresentation.renderGoal(null, false, preset);
    }
    renderSkillTree();
  }

  // The LCD readout no longer surfaces highway-inverted (it's a menu setting,
  // not a generated fact), so a host setting change only needs a redraw.
  function refreshForHostSettingChange() { if (!activeBundle) return; syncHighwaySettings(activeBundle); drawOnce(); }

  // ── Depth slice (2026-06-07 panel) — the summit-invite atom ──────────────────
  // The first depth axis BEYOND Speed is PATTERNS (guitar-pedagogy: sequence the
  // same box/key before moving the hands at all). The engine already exists
  // (SEQUENCE_PATTERNS / applySequencePattern, §7) and only REORDERS resolved
  // positions — zero bad-note risk. This turns the dead-end "Summit reached"
  // signpost into a live close-and-arm pointing at that next step (Fork-1 verdict:
  // explicit, student-DRIVEN, never auto). Travel(keys/positions) + Support-off are
  // the follow-on increments; here we only ship the smallest atom that proves the
  // invite model where the grinder currently hits a wall.
  /** @type {Set<string | null | undefined>} */
  const SEQ_SUPPORTING = new Set(['scale', 'chord_scales']);   // the practice types that consume cfg.sequence
  function depthSequenceField() { return document.querySelector('#virtuoso_lab-controls [name="sequence"]'); }
  function depthIsPatterned() { const f = depthSequenceField(); return !!(f && f.value && f.value !== 'none'); }
  // The pattern to OFFER at the speed summit, or null when the rung can't sequence
  // (non-scale type; advancedMode OFF → readConfig strips sequence to 'none', so
  // offering it would be a silent no-op — the exact honesty trap UX flagged; or
  // already patterned). Pentatonic/blues are <7-note, where `thirds` ([0,2]) is NOT
  // a diatonic third — offer `fours` instead (degree-agnostic, always correctly
  // labelled) per guitar-pedagogy's relabel gate.
  /** @param {import('./src/content/pathways.js').Pathway | null} pw */
  function depthPatternOffer(pw) {
    if (!pw) return null;
    const pt = pw.base && pw.base.practiceType;
    if (!SEQ_SUPPORTING.has(pt)) return null;
    const adv = document.querySelector('#virtuoso_lab-controls [name="advancedMode"]');
    if (!adv || !adv.checked) return null;                 // would be stripped → never offer a no-op
    if (depthIsPatterned()) return null;                   // already on a pattern — next axis is the follow-on slice
    const scaleField = document.querySelector('#virtuoso_lab-controls [name="scale"]');
    const scale = (scaleField && scaleField.value) || (pw.base && pw.base.scale) || 'major';
    const sevenNote = (SCALE_INTERVALS[scale] || []).length === 7;
    return sevenNote ? { seq: 'thirds', label: 'in 3rds' } : { seq: 'fours', label: 'in 4ths' };
  }
  // Note-value glyph for a tier chip — once subdivision varies across tiers, a
  // bare BPM can lie about difficulty ("♩ 60" and "♬ 60" are different climbs;
  // gamification ruling). Only rendered when the rung declares tempoTierSubdivs.
  /** @type {Record<string, string>} */
  const TIER_SUBDIV_GLYPH = { quarter:'♩', eighth:'♪', triplet:'♪₃', eighth_triplet:'♪₃', sixteenth:'♬', sixteenth_triplet:'♬₃' };
  /** @param {import('./src/content/pathways.js').Pathway} pw @param {number} i */
  function tierChipLabel(pw, i) {
    const bpm = pw.tempoTiers[i];
    const sub = pw.tempoTierSubdivs && pw.tempoTierSubdivs[i];
    const g = sub && TIER_SUBDIV_GLYPH[sub];
    return g ? `${g} ${bpm} BPM` : `${bpm} BPM`;
  }
  function syncTempoTierButtons() {
    const container = $('virtuoso_lab-tier-buttons');
    if (!container) return;
    container.innerHTML = '';
    const signpost = $('virtuoso_lab-climb-next');
    if (signpost) { signpost.textContent = ''; signpost.classList.remove('summit'); }
    const pw = practiceSelection.pathwayId && practiceSelection.pathwayId !== 'custom' ? PATHWAYS[practiceSelection.pathwayId] : null;
    const tiers = pw && pw.tempoTiers ? pw.tempoTiers : null;
    if (!tiers || !tiers.length) return;
    const activePathway = /** @type {import('./src/content/pathways.js').Pathway} */ (pw);
    const ptData = pathwayTiersLoad();
    const highestCleared = (ptData[String(practiceSelection.pathwayId)] || {}).highest_tier ?? -1;
    tiers.forEach((_bpm, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      let cls = 'virtuoso_lab-tier-btn';
      if (i === practiceSelection.tierIndex) cls += ' active';
      if (i <= highestCleared) cls += ' cleared';
      if (i === _newlyUnlockedTier) cls += ' tier-glow';
      btn.className = cls;
      // The rung ordinal makes the ladder read as a climb (Rung 1 → 4), not four
      // equal boxes. Label is the speed name; BPM is the readout below it.
      btn.innerHTML = `<span class="tier-step">Rung ${i + 1}</span>` +
        `<span class="tier-name">${TIER_LABELS[i] || `T${i+1}`}</span>` +
        `<span class="tier-bpm">${tierChipLabel(activePathway, i)}</span>`;
      btn.addEventListener('click', () => {
        practiceSelection.setTier(i);
        practiceSelection.applyTier(activePathway, i);   // bpm + the tier's subdivision/bars step (density ladder)
        syncTempoTierButtons();
        onGenerate();
      });
      container.appendChild(btn);
    });
    // Calm next-rung / summit signpost: a map cue, never a nag. Points at the
    // lowest un-cleared rung; when every rung is cleared, "Summit reached".
    if (signpost) {
      const nextIdx = highestCleared + 1;
      if (nextIdx >= tiers.length) {
        signpost.classList.add('summit');
        const offer = depthPatternOffer(pw);
        if (offer) {
          // The live invite: the dead-end becomes the next depth step, armed on click.
          signpost.innerHTML = `<span class="climb-arrow">✓</span>All speeds cleared. ` +
            `<button type="button" class="virtuoso_lab-climb-cta" data-act="depth-pattern" data-seq="${offer.seq}">Now play it ${offer.label} ▸</button>`;
        } else if (SEQ_SUPPORTING.has(pw && pw.base && pw.base.practiceType) && depthIsPatterned()) {
          // Already on a pattern — forward hook (the always-visible roadmap signal),
          // naming the next axis without yet shipping its control.
          signpost.innerHTML = `<span class="climb-arrow">✓</span>Speeds + pattern cleared — new keys &amp; positions are next.`;
        } else {
          signpost.innerHTML = `<span class="climb-arrow">✓</span>Summit reached — every speed cleared.`;
        }
      } else {
        const name = TIER_LABELS[nextIdx] || `Rung ${nextIdx + 1}`;
        signpost.innerHTML = `<span class="climb-arrow">→</span>Next rung: <span class="climb-target">${name}</span> · ${tierChipLabel(activePathway, nextIdx)}`;
      }
    }
  }

  // A pathway's prerequisite = the first incoming edge in the prereq graph. Used for
  // the soft "Builds on …" hint (gamification: prereqs suggest, never gate).
  /** @param {string} id */
  function pathwayPrereq(id) {
    const e = SKILL_TREE_EDGES.find(([, b]) => b === id);
    return e ? e[0] : null;
  }
  /** @param {string} id */
  function pathwayBandId(id) { return practiceSelection.bandFor(id); }
  // Single source of truth for a node's progress state — used by the picker list now
  // and the P-sheet skill rack later (one data, two surfaces). Reads pathway_tiers.
  /** @param {string} id @param {Record<string, import('./src/types/progress-data.js').TierRecord>} ptData */
  function nodeProgressState(id, ptData) {
    const pw = PATHWAYS[id];
    const tierCount = (pw && pw.tempoTiers && pw.tempoTiers.length) || 0;
    const highestTier = (ptData[id] || {}).highest_tier ?? -1;
    const cleared = tierCount > 0 && highestTier >= tierCount - 1;
    const inProgress = highestTier >= 0 && !cleared;
    const prereq = pathwayPrereq(id);
    const prereqUnmet = prereq ? (((ptData[prereq] || {}).highest_tier ?? -1) < 0) : false;
    // Depth-ladder overlay (Phase 8) — the combined Speed+Depth profile from the
    // progress store. Off mode hides it (returns null). Rungs are booleans; Clean /
    // Eyes-off / Master are schema-present but unfilled until their slices land.
    const prog = progressLoad();
    const pnode = prog.mode !== 'off' ? prog.byNode[id] : null;
    const depth = pnode ? {
      travel: !!pnode.depth.travel, clean: !!pnode.depth.clean,
      eyesOff: !!pnode.depth.eyesOff, mastered: !!pnode.masteredAt,
      keysCleared: (pnode.keysCleared || []).length,
    } : null;
    return { tierCount, highestTier, cleared, inProgress, prereq, prereqUnmet, depth };
  }
  // The two-level pathway picker (replaces the SVG tree's display role): L1 band bar
  // + L2 bounded, ordered list for the active band. Full labels, tier-dot progress,
  // "you are here" on the active row, one "→ next" cue, a soft "Builds on …" sub-line.
  function renderPathwayList() {
    const bandBar = $('virtuoso_lab-band-bar');
    const list = $('virtuoso_lab-pathway-list');
    if (!bandBar || !list) return;
    const ptData = pathwayTiersLoad();
    // Visible bands = Core packs (pinned, fixed order) + installed Style packs in
    // the user's saved order. Uninstalled Style packs live in the Pack-manager's
    // Available column (the "+"), not the picker.
    const bands = visiblePackOrder()
      .map(id => PATHWAY_BANDS.find(b => b.id === id))
      .filter(b => b !== undefined)
      .map(b => ({ id:b.id, label:b.label, kind:b.kind, ids:b.pathways.filter(id => PATHWAYS[id] && !practiceSelection.isHidden(id)) }))
      .filter(b => b.ids.length);
    if (!bands.length) {
      // No bands have a playable rung for this instrument — show an empty-state line
      // rather than a blank pane (belt-and-suspenders: the instrument-aware Core
      // should always have content, but a future instrument without a Core spine
      // would otherwise blank here). Points the player at the Pack manager.
      bandBar.innerHTML = '';
      list.innerHTML = '<div class="virtuoso_lab-lib-empty">No pathways for this instrument yet — tap <strong>+</strong> to browse packs.</div>';
      return;
    }
    // Which band to show = the user's selected band (_activeBandId), defaulting to the
    // active pathway's band when unset/stale. Band-chip clicks set _activeBandId directly
    // (browse); selecting a pathway sets it in applyPathwayById (list follows selection).
    if (!practiceSelection.bandId || !bands.find(b => b.id === practiceSelection.bandId)) {
      const pwBand = bands.find(b => b.ids.includes(/** @type {string} */ (practiceSelection.pathwayId)));
      practiceSelection.browseBand(pwBand ? pwBand.id : bands[0].id);
    }
    const activeBand = bands.find(b => b.id === practiceSelection.bandId) || bands[0];
    // L1 — band bar
    bandBar.innerHTML = '';
    // Two axes (§12): the Core bands (Beginner→Advanced) are an ordered CLIMB;
    // the Style bands are LATERAL branches. Render them as two groups separated
    // by a hairline, so the bar doesn't read as one undifferentiated row.
    /** @type {string | null} */
    let _prevKind = null;
    bands.forEach(b => {
      if (_prevKind === 'core' && b.kind !== 'core') {
        const sep = document.createElement('span');
        sep.className = 'virtuoso_lab-band-sep';
        sep.setAttribute('aria-hidden', 'true');
        bandBar.appendChild(sep);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'virtuoso_lab-band-btn virtuoso_lab-band-' + (b.kind || 'style') + (b.id === activeBand.id ? ' active' : '');
      btn.textContent = b.label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', b.id === activeBand.id ? 'true' : 'false');
      btn.addEventListener('click', () => { practiceSelection.browseBand(b.id); renderPathwayList(); });
      bandBar.appendChild(btn);
      _prevKind = b.kind;
    });
    // Trailing "+" — open the Pack manager (install / order / hide packs). It's an
    // action, not a tab (no role=tab / aria-selected); right-aligned via CSS.
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'virtuoso_lab-band-btn virtuoso_lab-band-add'
      + ($('virtuoso_lab-root')?.classList.contains('virtuoso_lab_vir-packs-open') ? ' active' : '');
    addBtn.innerHTML = '<span class="virtuoso_lab-band-add-plus" aria-hidden="true">+</span><span class="virtuoso_lab-band-add-label">Add</span>';
    addBtn.title = 'Add pathway packs';
    addBtn.setAttribute('aria-label', 'Add pathway packs');
    addBtn.addEventListener('click', () => togglePackManager(true));
    bandBar.appendChild(addBtn);
    // L2 — ordered pathway list for the active band
    const states = activeBand.ids.map(id => ({ id, st: nodeProgressState(id, ptData) }));
    const nextId = (states.find(s => !s.st.cleared && s.id !== practiceSelection.pathwayId) || {}).id;
    list.innerHTML = '';
    states.forEach(({ id, st }) => {
      const pw = PATHWAYS[id];
      const row = document.createElement('div');
      row.className = 'virtuoso_lab-segment-card virtuoso_lab-pw-row'
        + (id === practiceSelection.pathwayId ? ' active' : '') + (st.cleared ? ' cleared' : '');
      row.setAttribute('role', 'option');
      row.setAttribute('aria-selected', id === practiceSelection.pathwayId ? 'true' : 'false');
      // Tier dots, now LABELLED (§12): each dot names its tempo tier (Slow→Push)
      // + cleared state, so the picker reads the climb, not just anonymous pips.
      const dots = (pw.tempoTiers || []).map((_, i) => {
        const done = i <= st.highestTier;
        const lbl = TIER_LABELS[i] || ('Tier ' + (i + 1));
        return `<span class="tree-tier-dot${done ? ' cleared' : ''}" title="${lbl} — ${done ? 'cleared' : 'not yet'}" aria-label="${lbl}, ${done ? 'cleared' : 'not cleared'}"></span>`;
      }).join('');
      const marker = id === practiceSelection.pathwayId ? '<span class="virtuoso_lab-pw-here">you are here</span>'
        : id === nextId ? '<span class="virtuoso_lab-pw-next">→ next</span>' : '';
      // Soft "Builds on …" hint — only when the prereq is in ANOTHER band (a Style
      // pathway pointing back to its Core foundation). Within a band the top→bottom
      // order already communicates sequence, so the hint there is just noise.
      const crossBandPrereq = st.prereq && pathwayBandId(st.prereq) !== activeBand.id;
      const sub = (st.prereqUnmet && crossBandPrereq && PATHWAYS[String(st.prereq)])
        ? `<div class="virtuoso_lab-pw-sub">Builds on ${PATHWAYS[String(st.prereq)].label} — suggested first</div>` : '';
      // Depth-ladder pip (Phase 9 Slice 5): a 5-rung mastery overview from the
      // progress store — Speed → Travel → Clean → Ears-off → Master. Off mode →
      // no pip (st.depth is null; the whole layer collapses). A filled rung means
      // it was EARNED (a clear), so the accent fill is legitimate, not decorative.
      const depthPip = st.depth ? (() => {
        const rungs = [
          ['Speed',    st.cleared,         'every tempo rung cleared'],
          ['Travel',   st.depth.travel,    'portable across keys & positions'],
          ['Clean',    st.depth.clean,     'clean & in time, support off'],
          ['Ears off', st.depth.eyesOff,   'no metronome / eyes off'],
          ['Master',   st.depth.mastered,  'owned'],
        ];
        const pips = rungs.map(([name, done, hint]) =>
          `<span class="virtuoso_lab-pw-pip${done ? ' done' : ''}" title="${name} — ${done ? 'cleared' : 'not yet'} (${hint})" aria-label="${name}, ${done ? 'cleared' : 'not cleared'}"></span>`).join('');
        return `<div class="virtuoso_lab-pw-depth"><span class="virtuoso_lab-pw-depth-lbl">Depth</span>${pips}</div>`;
      })() : '';
      row.innerHTML = `<div class="virtuoso_lab-pw-rowtop"><span class="virtuoso_lab-pw-label">${pw.label}</span>${marker}</div>`
        + `<div class="virtuoso_lab-pw-dots">${dots}</div>${depthPip}${sub}`;
      row.addEventListener('click', () => {
        const sel = $('virtuoso_lab-pathway');
        if (sel) { sel.value = id; sel.dispatchEvent(new Event('change')); }
      });
      list.appendChild(row);
    });
    // Cross-band "→ next" (§12 — the highest-leverage fix): the climb must never
    // go silent at a band seam. When the active band has no un-cleared next rung,
    // point to the next un-cleared pathway forward in the band order (wrapping to
    // an earlier gap only if everything ahead is cleared), and let the learner
    // jump straight to it — so "what's next" survives the Beginner→Intermediate
    // (etc.) boundary where learners otherwise quit.
    if (!nextId) {
      const ai = bands.findIndex(b => b.id === activeBand.id);
      const scan = bands.slice(ai + 1).concat(bands.slice(0, Math.max(0, ai)));
      let cross = null;
      for (const b of scan) {
        const hit = b.ids.find(id => !nodeProgressState(id, ptData).cleared);
        if (hit) { cross = { id: hit, band: b }; break; }
      }
      if (cross && PATHWAYS[cross.id]) {
        const cue = document.createElement('div');
        cue.className = 'virtuoso_lab-pw-nextband';
        cue.setAttribute('role', 'button');
        cue.tabIndex = 0;
        cue.title = `Go to ${PATHWAYS[cross.id].label} in ${cross.band.label}`;
        cue.innerHTML = `<span class="virtuoso_lab-pw-next">→ next</span>`
          + `<span class="virtuoso_lab-pw-nextband-label">${PATHWAYS[cross.id].label}</span>`
          + `<span class="virtuoso_lab-pw-nextband-band">in ${cross.band.label}</span>`;
        const go = () => {
          practiceSelection.browseBand(cross.band.id); renderPathwayList();
          const sel = $('virtuoso_lab-pathway'); if (sel) { sel.value = cross.id; sel.dispatchEvent(new Event('change')); }
        };
        cue.addEventListener('click', go);
        cue.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        list.appendChild(cue);
      }
    }
    // Keep the active row visible — scroll the LIST only (never the outer panel).
    const activeRow = list.querySelector('.virtuoso_lab-pw-row.active');
    if (activeRow) {
      const lr = list.getBoundingClientRect(), ar = activeRow.getBoundingClientRect();
      if (ar.top < lr.top || ar.bottom > lr.bottom) list.scrollTop += (ar.top - lr.top);
    }
  }

  function renderSkillTree() {
    renderPathwayList();   // the live picker; the SVG tree below is shelved-but-kept
    const container = $('virtuoso_lab-skill-tree');
    if (!container || container.classList.contains('virtuoso_lab-tree-shelved')) return;
    const ptData = pathwayTiersLoad();
    const hiddenNode = practiceSelection.isHidden;
    // Build inner wrapper + SVG edge layer + node buttons
    container.innerHTML = '<div class="virtuoso_lab-tree-inner" id="virtuoso_lab-tree-inner"></div>';
    const inner = /** @type {HTMLElement} */ (container.firstChild);
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'virtuoso_lab-tree-edges');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    // Draw edges first so nodes render on top
    const nodeMap = Object.fromEntries(SKILL_TREE_NODES.map(n => [n.id, n]));
    SKILL_TREE_EDGES.forEach(([aId, bId]) => {
      const a = nodeMap[aId], b = nodeMap[bId];
      if (!a || !b || hiddenNode(aId) || hiddenNode(bId)) return;
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', String(a.x)); line.setAttribute('y1', String(a.y));
      line.setAttribute('x2', String(b.x)); line.setAttribute('y2', String(b.y));
      line.setAttribute('class', 'tree-edge');
      svg.appendChild(line);
    });
    inner.appendChild(svg);
    // Draw nodes
    SKILL_TREE_NODES.forEach(node => {
      const pw = PATHWAYS[node.id];
      if (!pw || hiddenNode(node.id)) return;
      const highestTier = (ptData[node.id] || {}).highest_tier ?? -1;
      const isActive = node.id === practiceSelection.pathwayId;
      const wrapper = document.createElement('div');
      wrapper.className = 'virtuoso_lab-tree-node' + (isActive ? ' active' : '');
      wrapper.style.left = node.x + '%';
      wrapper.style.top  = node.y + '%';
      const tiers = (pw.tempoTiers || []).map((_, i) =>
        `<span class="tree-tier-dot${i <= highestTier ? ' cleared' : ''}"></span>`
      ).join('');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'virtuoso_lab-tree-node-btn';
      btn.title = pw.label;
      btn.innerHTML = `<span>${node.short}</span><span class="tree-node-tiers">${tiers}</span>`;
      btn.addEventListener('click', () => {
        const sel = $('virtuoso_lab-pathway');
        if (sel) { sel.value = node.id; sel.dispatchEvent(new Event('change')); }
      });
      wrapper.appendChild(btn);
      inner.appendChild(wrapper);
    });
  }


  function syncChromaticVisibility() {
    const practiceTypeEl = document.querySelector('[name="practiceType"]');
    const mode = practiceTypeEl ? practiceTypeEl.value : '';
    document.querySelectorAll('.virtuoso_lab-chromatic-only').forEach(el => {
      el.style.display = mode === 'chromatic' ? '' : 'none';
    });
    document.querySelectorAll('.virtuoso_lab-guide-tones-only').forEach(el => {
      el.style.display = mode === 'guide_tones' ? '' : 'none';
    });
    document.querySelectorAll('.virtuoso_lab-bending-only').forEach(el => {
      el.style.display = mode === 'bending' ? '' : 'none';
    });
  }

  // ── Input-level / onset gate (grading rebuild) ─────────────────────────────
  // Feed = the host's OWN input meter (interface-agnostic — we follow the host
  // for all sound I/O): DESKTOP reads slopsmithDesktop.audio.getLevels() (the
  // same source note_detect's silence gate uses); WEB opens its own analyser on
  // the existing playback ctx. No source → mode 'none' → gate INACTIVE (there is
  // no input path, so nothing real to credit and nothing to wrongly block; the
  // detector's pitch/comb evidence still has to fire). All times are JUDGE time
  // (currentPracticeTime − ptLatency()), matching the window table both ears read.
  /** @param {number} raw */
  function _lvlPushSample(raw) {
    if (!(raw >= 0)) raw = 0;
    const jt = transport.time - ptLatency();
    // Input-presence (arms miss gems + the recap ●/○): real signal ≥ the host
    // floor. No onset/baseline/calibration — the host's gate is level-only.
    if (raw >= PT_LVL_FLOOR_MIN) { _ptHadInput = true; markBlockInput(); }
    _lvlSamples.push({ jt, L: raw }); if (_lvlSamples.length > 512) _lvlSamples.shift();
  }
  /** @param {number} lo @param {number} hi */
  function ptPeakLevelIn(lo, hi) {
    let pk = 0;
    for (let i = _lvlSamples.length - 1; i >= 0; i--) {
      const s = _lvlSamples[i];
      if (s.jt < lo - 0.5) break;                 // time-ordered ring — stop once well before the window
      if (s.jt >= lo && s.jt <= hi && s.L > pk) pk = s.L;
    }
    return pk;
  }
  /** @param {number} lo @param {number} hi */
  function ptHasSamplesIn(lo, hi) {               // did the level meter cover this window at all?
    for (let i = _lvlSamples.length - 1; i >= 0; i--) {
      const s = _lvlSamples[i];
      if (s.jt < lo - 0.5) break;
      if (s.jt >= lo && s.jt <= hi) return true;
    }
    return false;
  }
  // The host's silence gate, mirrored — a ONE-WAY VETO (host note_detect
  // :5550-5588): credit is forced to a MISS only when the meter SAW the window
  // and it was genuinely silent (peak < 0.02); no samples covering it → SKIP
  // (pass), like the host ("no telemetry ≠ silent").
  //
  // A SPAN is finalized only after it has fully passed, so its whole [t, spanEnd]
  // is already sampled — veto it over its own span.
  //
  // A SINGLE/CHORD credit fires the INSTANT a verify/YIN hit lands at the
  // playhead, and the note's own [matchStart, matchEnd] extends into the FUTURE
  // (its ring hasn't elapsed yet). Sampling that window at the leading edge finds
  // NO samples → the "no telemetry ≠ silent" skip would PASS every note the moment
  // it opens, so an inaudible residual's `isHit` credits before the meter can veto
  // it (the "guitar off, still scores" bug — present even with a working meter).
  // Gate instead on the input level over a short window ENDING at the current
  // judge clock — "is the player sounding NOW?": a real note has level in its
  // ring at the credit moment; a silent residual does not.
  /** @param {import('./src/types/judgment-data.js').JudgmentWindow} w */
  function ptCreditGatePasses(w) {
    // Contained verifier: the engine owns silence/onset/persistence gating
    // inside each note's timing window, so Virtuoso's level veto is redundant
    // (and would wrongly suppress a valid engine credit on a DI signal the
    // host meter reads low). The level meter still runs — for _ptHadInput
    // (miss-gem arming) only, not as a credit gate.
    if (_ndContainedMode) return true;
    if (_lvlMode === 'none') return true;         // no host level source → gate inactive
    let lo, hi;
    if (w.span) { lo = w.t; hi = w.spanEnd; }
    else { hi = transport.time - ptLatency(); lo = hi - PT_LVL_RECENT_WIN; }
    if (!ptHasSamplesIn(lo, hi)) return true;     // meter hasn't covered this window yet (startup) → honest skip
    return ptPeakLevelIn(lo, hi) >= PT_LVL_FLOOR_MIN;   // silent → forced miss; else credit stands
  }
  function startLevelMeter() {
    stopLevelMeter();
    _lvlMode = 'none'; _lvlSamples = [];
    const bridge = hostDesktop()?.audio;
    if (bridge && typeof bridge.getLevels === 'function') {
      // getLevels() is ASYNC on the desktop bridge — `ipcRenderer.invoke(...)`
      // returns a Promise (note_detect itself awaits it). Reading `.inputLevel`
      // off the Promise synchronously was ALWAYS undefined, so the desktop tap
      // bailed to the web meter on the first poll; a DI player with no mic then
      // landed at _lvlMode 'none' → the silence gate went INACTIVE → the
      // false-positive judge returned (credits with the guitar off). Resolve the
      // result as a Promise (handles a sync OR async bridge), one IPC in flight
      // at a time so a slow engine can't pile up polls.
      let okOnce = false, inFlight = false;
      const myGen = ++_lvlGen;   // a teardown/restart bumps _lvlGen → ignore late IPC
      const fallBack = () => { if (_lvlPoll) { clearInterval(_lvlPoll); _lvlPoll = null; } _startWebLevelMeter(); };
      _lvlPoll = setInterval(() => {
        if (inFlight) return;
        inFlight = true;
        let p = null;
        try { p = (/** @type {NonNullable<typeof bridge> & {getLevels: NonNullable<NonNullable<typeof bridge>['getLevels']>}} */ (bridge)).getLevels(); } catch (_) { p = null; }
        Promise.resolve(p).then((lv) => {
          if (myGen !== _lvlGen) return;   // meter was stopped/restarted while this IPC was in flight
          if (!lv || typeof lv.inputLevel !== 'number') { if (!okOnce) fallBack(); return; }
          okOnce = true; _lvlMode = 'desktop'; _lvlPushSample(lv.inputLevel);
        }).catch(() => { if (myGen === _lvlGen && !okOnce) fallBack(); }).finally(() => { inFlight = false; });
      }, 50);
      return;
    }
    _startWebLevelMeter();
  }
  function _startWebLevelMeter() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return;   // stays 'none'
    let ctx; try { ctx = ensureAudioCtx(); } catch (_) { return; }
    if (!ctx) return;
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then((stream) => {
        if (!_ptHandle && !_ndVerifyMode) { try { stream.getTracks().forEach(t => t.stop()); } catch (_) {} return; }   // run ended before grant
        _lvlStream = stream;
        const src = ctx.createMediaStreamSource(stream);
        _lvlAnalyser = ctx.createAnalyser(); _lvlAnalyser.fftSize = 1024; _lvlData = new Float32Array(_lvlAnalyser.fftSize);
        src.connect(_lvlAnalyser);   // analyser taps the source; NOT connected to destination (no monitoring)
        _lvlMode = 'web';
        const tick = () => {
          if (_lvlMode !== 'web' || !_lvlAnalyser) return;
          (/** @type {AnalyserNode} */ (_lvlAnalyser)).getFloatTimeDomainData(/** @type {Float32Array<ArrayBuffer>} */ (_lvlData));
          let s = 0; for (let i = 0; i < (/** @type {Float32Array<ArrayBuffer>} */ (_lvlData)).length; i++) s += (/** @type {Float32Array<ArrayBuffer>} */ (_lvlData))[i] * (/** @type {Float32Array<ArrayBuffer>} */ (_lvlData))[i];
          _lvlPushSample(Math.min(1, Math.sqrt(s / (/** @type {Float32Array<ArrayBuffer>} */ (_lvlData)).length) * 5));   // → the host's 0..1 inputLevel scale
          _lvlRaf = requestAnimationFrame(tick);
        };
        _lvlRaf = requestAnimationFrame(tick);
      })
      .catch(() => { /* mic denied / no device → stays 'none' (gate inactive) */ });
  }
  function stopLevelMeter() {
    _lvlGen++;   // invalidate any in-flight async getLevels() so it can't revive the meter after stop
    if (_lvlPoll) { clearInterval(_lvlPoll); _lvlPoll = null; }
    if (_lvlRaf) { try { cancelAnimationFrame(_lvlRaf); } catch (_) {} _lvlRaf = 0; }
    if (_lvlStream) { try { _lvlStream.getTracks().forEach(t => t.stop()); } catch (_) {} _lvlStream = null; }
    _lvlAnalyser = null; _lvlData = null; _lvlMode = 'none';
  }

  // ── Pitch tracker ──────────────────────────────────────────────────────────
  // Uses slopsmithMinigames.scoring.createContinuous (bundled, no registration
  // required). Silently no-ops when the Minigames plugin isn't loaded.
  function ptAvailable() {
    return typeof hostMinigames()?.scoring?.createContinuous === 'function';
  }

  /** @param {ReturnType<typeof makeBundle>} bundle */
  function startPitchTracker(bundle) {
    _ptRunInfo = null;   // a run with no scorer leaves no stale diagnostics
    if (!ptAvailable() && !ndVerifyAvailable()) return;
    stopPitchTracker();
    // _tail copies are the renderer's visual loop-preview, not playable content —
    // unfiltered they inflated the judged universe and could phantom-credit an
    // anticipated next-pass note at the loop seam (2026-06-06 panel finding).
    const allNotes = (bundle.notes || []).filter(n => !n._tail).sort((a, b) => a.t - b.t);
    // ── Chord exemption (2026-06-05, the DapperTap report) ────────────────────
    // The host detector is MONOPHONIC, and probe-verified (probe-chord-detector.mjs)
    // it reports NOTHING usable for simultaneous notes — YIN's confidence collapses
    // on polyphony; it doesn't even read the chord's root. So chords/diads are
    // SHOWN but never pitch-judged: they're excluded from the judged set entirely
    // (no miss gems, not in the accuracy denominator, not in the session
    // hit/miss counts the tier + proof-loop gates read) until real chord
    // verification (a band-energy mirror of the host's note_detect contract)
    // lands. Without this, a 3-note power chord capped every chord drill near
    // 33% — structurally un-passable even played perfectly.
    // A "chord" = notes sharing the builder's explicit `ch` strum-group tag
    // (emitStrum rake-staggers strings 6–18ms, so time can't group them), or
    // notes at EXACTLY equal t (block chords / double-stops / harmonized lines).
    // Never a time-tolerance window — fast runs must stay individually judged.
    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    const _gk = (n) => n.ch != null ? ('c' + n.ch) : ('t' + n.t);
    const _gCounts = new Map();
    for (const n of allNotes) { const k = _gk(n); _gCounts.set(k, (_gCounts.get(k) || 0) + 1); }
    // Sub-floor exemption (70 Hz plan, 2026-06-06): notes whose expected pitch
    // sits below the detector's tracking floor are honest-ungraded too — the
    // mic physically cannot hear bass E1/A1 or drop-C/B low strings, so judging
    // them was a silent zero the player read as their own failure. The click is
    // the judge for that register (bass-pedagogy ruling: change the judge,
    // never relocate the lesson).
    const _opens = bundle.openMidis || [];
    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    const _audible = (n) => { const m = _opens[n.s]; return m == null || midiToFreq(m + n.f) >= DETECTOR_MIN_HZ; };
    // Verifier mode lifts the chord exemption: the harmonic-comb verifier is
    // polyphonic, so chords/diads become judged (shown AND scored), not exempt.
    // The sub-floor exemption stays — a mic still can't hear sub-70Hz strings.
    // Jam runs never arm the chart verifier: the mirror never judges, and the
    // ONE verify slot belongs to the Gold rung's single-note confirms (see
    // goldArm). Arming the contained chart instead would suspend the host's
    // detect loop and setVerifyTarget would go silently dead (note_detect
    // screen.js, the _ndHostChartSuspended early-return before _runVerifyTarget).
    _ndVerifyMode = ndVerifyAvailable() && !isJamMode();
    // Muted ghosts (mt) are never judged — the HOST's own convention (note_detect
    // skips mt in matchNotes/checkMisses/engine push): correct muting must not
    // read as a miss (the DapperTap mt bug, fixed the host's way).
    const _base = allNotes.filter(n => _audible(n) && !n.mt && (_ndVerifyMode || _gCounts.get(_gk(n)) === 1));
    _ptOpenMidis = bundle.openMidis || [];
    _ptJamRun = isJamMode();   // the mirror rule: gems/paint never judge a Jam run
    _ptLabelGates = ndLabelGates();   // the host's own label toggles (inherit-never-write), read per run
    _ptNdWin = ndTimingInherit();     // the host tuner's timing windows (Clean Timing / chord), read per run
    // ── Slice 2: the fast-idiom honesty classes (docs/archive/timing-judging-roundtable.md) ──
    // (a) LEGATO: ho/po notes have no pick transient — the PICKED note that
    //     opens the slur is judged; the slurred notes are shown, never judged
    //     (herta's physics generalized globally).
    // (b) TREMOLO SPANS: consecutive same-pitch tr notes collapse to ONE judged
    //     unit covering the run (host convention: tr = one judged note); credit
    //     = in-tune presence over ≥60% of the span; member gems light together.
    // (c) tooFast: per-ear certifiability — per-note judged iff
    //     min(sus, IOI) ≥ the ear's min-ring floor (YIN 85ms; verifier 50ms,
    //     probe-measured). Below: exempt-but-shown, out of the denominator.
    //     Emergent: gallop cells get checkpoint judging (the long 8th judged,
    //     the fast doublet exempt) with no special mode.
    // IOI is measured to the next SOUNDED onset over the whole base set —
    // legato and exempt notes still end the previous note's usable ring.
    const _floor = _ndVerifyMode ? PT_MIN_RING_VERIFIER : PT_MIN_RING_YIN;
    const _onsets = [...new Set(_base.map(n => n.t))].sort((a, b) => a - b);
    const _nextOnset = new Map();
    for (let i = 0; i < _onsets.length; i++) _nextOnset.set(_onsets[i], i + 1 < _onsets.length ? _onsets[i + 1] : Infinity);
    const _spanKeyByNote = new Map();
    { // span detection: same (s,f), tr-flagged, gap ≤ 0.35s, ≥2 members
      let /** @type {import('./src/types/entry-data.js').EntryNote[]} */ run = [], spanId = 0;
      const flush = () => { if (run.length >= 2) { const k = 'tr@' + (spanId++); for (const n of run) _spanKeyByNote.set(ptKey(n), k); } run = []; };
      for (const n of _base) {
        if (!n.tr || n.ho || n.po) { flush(); continue; }
        const prev = run[run.length - 1];
        if (prev && (n.s !== prev.s || n.f !== prev.f || n.t - prev.t > 0.35)) flush();
        run.push(n);
      }
      flush();
      _ptSpanCount = spanId;
    }
    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    const _legato = (n) => (n.ho || n.po) && !_spanKeyByNote.has(ptKey(n));
    // Effective ring: written-STACCATO (sus meaningfully shorter than the IOI —
    // the damping is the lesson, the player's string really stops at sus) caps
    // the ring at sus; legato-ish runs (builders emit sus≈0.78·IOI but the
    // player's string rings into the next same-string attack) ring ≈ IOI.
    // Without this split the builders' cosmetic sus would exempt every fast
    // run via its own chart data (incl. the 160-BPM acceptance run).
    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    const _effRing = (n) => {
      const ioi = _nextOnset.get(n.t) - n.t;
      if (!isFinite(ioi)) return Infinity;   // the chart's last note rings into silence — always certifiable
      const sus = n.sus || 0.24;
      if (sus < 0.7 * ioi) {
        // Written-staccato: the string starts from MUTE and is damped at sus —
        // the usable span is the ring net of the speak budget (bass ruling:
        // first creditable frame ≈ attack + speak; classify on the STABLE span,
        // never judge a structurally uncreditable note).
        const om = _ptOpenMidis[n.s];
        return sus - ptSpeakBudget(midiToFreq((om ?? 40) + n.f));
      }
      return ioi;   // legato-ish run: continuous string energy re-locks fast — no speak debit
    };
    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    const _tooFast = (n) => !_legato(n) && !_spanKeyByNote.has(ptKey(n)) && _effRing(n) < _floor;
    _ptNotes = _base.filter(n => !_legato(n) && !_tooFast(n));
    _ptScored = new Set();
    _ptByKey = new Map(); for (const n of _ptNotes) _ptByKey.set(ptKey(n), n);   // (s,f,t) → note, for the gem hook
    _ptHadInput = false;
    // Group key: span members share their span's key (one window per span);
    // everything else keeps the chord/onset grouping.
    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    const _gkS = (n) => _spanKeyByNote.get(ptKey(n)) || _gk(n);
    ptBuildWindows(_ptNotes, _gkS);   // the one window table both ears read
    _ptExempt = { legato: _base.filter(_legato).length, fast: _base.filter(_tooFast).length,
                  spanNotes: _spanKeyByNote.size, floorMs: Math.round(_floor * 1000) };
    // Dwell-chip intervals (disclosure UX): merged runs of shown-not-judged
    // content, labelled by class. Muted ghosts are skipped (interleaved with
    // judged notes — a chip would flicker, and the ghost is the player's own
    // mute, not a system limit).
    _ptExemptIv = []; _ptChipIdx = 0; _ptChipLastT = -Infinity;
    for (const n of allNotes) {
      let label = null;
      if (!_audible(n)) label = 'LOW NOTE · click is the judge';
      else if (n.mt) continue;
      else if (!_ndVerifyMode && _gCounts.get(_gk(n)) > 1) label = 'CHORD · not mic-judged';
      else if (_legato(n)) label = 'SLUR · the pick note is judged';
      else if (_tooFast(n)) label = 'FAST RUN · checkpoint-judged';
      if (!label) continue;
      const t1 = n.t + Math.max(0.15, n.sus || 0.24);
      const prev = _ptExemptIv[_ptExemptIv.length - 1];
      if (prev && prev.label === label && n.t - prev.t1 <= 0.25) prev.t1 = Math.max(prev.t1, t1);
      else _ptExemptIv.push({ t0: n.t, t1, label });
    }
    const _jn = $('virtuoso_lab-judge-note'); if (_jn) _jn.style.display = 'none';   // the idle line yields to the live strip

    // Verifier-backed scoring (host note_detect timing-free verify, notedetect
    // #61): score against the PLAYER's real tuning (openMidis), polyphonic +
    // distortion-robust, independent of any host song. The YIN handle below,
    // when present, stays on only for the live pitch-strip readout + input
    // presence — ptOnPitch is display-only while _ndVerifyMode is true.
    if (_ndVerifyMode) {
      // Tuning context = the player's REAL instrument. openMidis (absolute open
      // strings) is authoritative; arrangement comes from the bundle's songInfo
      // ('Bass'/'Lead', which the host normalizes) and the host infers it from
      // the pitches if absent. There is no bundle.instrument field.
      _ndVerifyCtx = {
        arrangement: (bundle.songInfo && bundle.songInfo.arrangement) || undefined,
        openMidis: bundle.openMidis || [],
      };
      _ndVerifyActive = []; _ndVerifyActiveKey = null;
      // Arm asynchronously: enabling note_detect establishes the desktop bridge
      // (so isContainedVerifierAvailable can read it) only after startAudio
      // resolves — checking it synchronously here would race and wrongly fall
      // back on a fresh enable. _ndArmVerify awaits enable() first.
      _ndArmVerify();
    } else if (isJamMode()) {
      // Jam: no chart verifier — arm the detector BARE for the Gold rung's
      // single-note comb confirms. Gold owns the verify slot for this run.
      goldArm();
    }

    // Live pitch-strip / input-presence ear (host minigames YIN). Optional and
    // guarded: it can throw or return null (no mic, insecure context, SDK
    // mismatch). When the verifier is active this is display-only; without the
    // verifier it is the scorer (the original path). A missing/failed handle
    // must never abort a verifier run.
    if (ptAvailable()) {
      try {
        // smoothingMs 12 ≈ near-raw YIN per frame (the SDK's EMA α→1). The old 40ms
        // EMA made a semitone step read ~47¢ on its FIRST frame — at the ±50¢ gate
        // boundary for exactly the chromatic content this judge must catch. The
        // meter strip re-smooths for display in ptOnPitch; scoring uses raw frames.
        _ptHandle = (/** @type {NonNullable<ReturnType<typeof hostMinigames>> & {scoring: Required<NonNullable<NonNullable<ReturnType<typeof hostMinigames>>['scoring']>>}} */ (hostMinigames())).scoring.createContinuous({ smoothingMs: 12 });
      } catch (_) { _ptHandle = null; }
      if (_ptHandle && typeof _ptHandle.on === 'function') {
        _ptHandle.on('pitch', ptOnPitch);
        _ptHandle.on('end', () => { _ptHandle = null; });
      } else {
        _ptHandle = null;
      }
    }
    if (!_ptHandle && !_ndVerifyMode) return;   // no ear at all → nothing to show
    startLevelMeter();   // the host-mirror level/onset gate (follows the host's input meter)
    // Results-modal diagnostics (detection-testing instrument): the judged
    // universe for this run — what was exempt and WHY, and which ear owns
    // scoring. Read by sessionEnd → showResultsModal.
    _ptRunInfo = {
      total: allNotes.length,
      // Judged UNITS: per-note judged + each tremolo span as one unit.
      judged: _ptNotes.length - (_ptExempt ? _ptExempt.spanNotes : 0) + _ptSpanCount,
      exemptSubFloor: allNotes.filter(n => !_audible(n)).length,
      exemptMuted: allNotes.filter(n => _audible(n) && n.mt).length,
      exemptChords: allNotes.filter(n => _audible(n) && !n.mt && !_ndVerifyMode && _gCounts.get(_gk(n)) > 1).length,
      // Slice-2 honesty classes (disclosed, never silently dropped).
      exemptLegato: _ptExempt ? _ptExempt.legato : 0,
      exemptFast: _ptExempt ? _ptExempt.fast : 0,
      floorMs: _ptExempt ? _ptExempt.floorMs : 0,
      tremoloSpans: _ptSpanCount,
      tremoloNotes: _ptExempt ? _ptExempt.spanNotes : 0,
      ear: _ndVerifyMode ? (_ptHandle ? 'verifier (note_detect) · YIN on display' : 'verifier (note_detect)') : 'YIN mic (minigames)',
      // The run's timing windows — inherited from the host tuner sliders when
      // the player has set them (ndTimingInherit), else the shipped defaults.
      winSingleMs: Math.round(_ptNdWin.single * 1000),
      winChordMs: Math.round(_ptNdWin.chord * 1000),
      winInherited: _ptNdWin.single !== PT_WIN_EARLY || _ptNdWin.chord !== 0.150,
    };
    ptUpdateMeter({ show: true, active: false, cents: 0, note: '--', hits: 0, total: 0 });
    syncStripTuneBtn();   // the scorer owns the strip — hide the idle Tune… button
  }

  /** @param {Pick<import('./src/types/host-interfaces.js').PitchFrame, 'freqHz' | 'confidence'>} arg */
  function ptOnPitch({ freqHz, confidence }) {
    // Paused: the handle stays alive (gem states keep painting) but frames are
    // discarded — a note held across a frozen clock must never accumulate
    // evidence or score against the note sitting under the playhead.
    if (transport.paused) return;
    if (transport.preRollUntil > 0 && transport.time < transport.preRollUntil) return;   // resume pre-roll runway — the player is re-orienting, not playing
    // Judge on the latency-shifted clock: mic capture + analysis means evidence
    // for an attack at t ARRIVES ~80ms later. The host's grader subtracts the
    // same offset before matching; we judged at the raw clock until 2026-06-06,
    // grading an on-time player ~80ms late on every note.
    const tJudge = transport.time - ptLatency();
    const passedTotal = ptWinPassedCount(tJudge);
    // Input-presence: the level meter owns _ptHadInput when a host level source
    // exists (a confident YIN lock can come from a steady inaudible residual —
    // the bug). Fall back to confidence only when there is NO level source.
    if (_lvlMode === 'none' && confidence >= PT_CONF_INPUT) { _ptHadInput = true; markBlockInput(); }   // no level source: confidence arms input (+ credit the block, recap ●/○)
    if (confidence < PT_CONF_INPUT) {
      ptUpdateMeter({ show: true, active: false, cents: 0, note: '--', hits: _ptScoredUnits, total: passedTotal });
      return;
    }
    // Live-ear snapshot for the borrowed-highway keep-alive gem (feedBack#254): a
    // confident lock THIS frame, captured raw. ptGetNoteState reads it to return a
    // display-only { state:'active', live:true } so the host gem survives at the strike
    // line until the async contained verdict lands — else the provider-cull deletes it
    // ~100ms past the line, before our verdict exists → no green flare. DISPLAY ONLY:
    // it never credits (credit stays verifier-only, _ptScored) and never judges.
    _ptLive = { t: transport.time, f: freqHz, c: confidence };
    // Fresh-lock gate: only frames the detector locked THIS frame may score
    // (≤0.85 = a fade re-emitting the previous pitch — display-only).
    const fresh = confidence > PT_CONF_FRESH;
    if (fresh && isJamMode()) jamMirrorCapture(freqHz);   // J-3 played-note mirror (Jam only; display, never scores)
    // PARALLEL candidate matching (host-mirror): every unscored window containing
    // tJudge is a live candidate, each judged at its OWN pitch; the frame credits
    // its best pitch match. This replaces the serialized first-match rule that
    // judged every attack against the PREVIOUS note's window in continuous runs.
    // Evidence rule: ONE fresh in-window in-pitch lock (the host's commit rule;
    // fades never score) — guarded by smoke-scoring-e2e's negative control.
    // YIN scoring runs only when YIN is the scorer — in verifier mode ptOnPitch
    // is display-only (ndOnVerify owns _ptScored; double-judging would also
    // re-admit the chord asymmetry).
    // Calibration log (Slice 3): every confident frame, offset-FREE (raw
    // practice time + float MIDI) — the host-mirror sweep consumes it at run
    // end. Bounded; recording stops at the cap, never wraps.
    if (_ptCalLog.length < PT_CAL_MAX) _ptCalLog.push({ bt: transport.time, m: 69 + 12 * Math.log2(freqHz / 440) });
    if (!_ndVerifyMode && fresh) {
      let best = null, bestAbs = Infinity;
      for (let i = _ptWinLo; i < _ptWin.length; i++) {
        const w = _ptWin[i];
        if (w.matchStart > tJudge) break;
        if (tJudge >= w.matchEnd) continue;
        const n = w.notes[0];                    // YIN-judged groups are single-pitch (chords are the verifier's; a span is one pitch)
        if (!w.span && _ptScored.has(ptKey(n))) continue;   // one-shot per key (spans accumulate until finalized)
        const om = _ptOpenMidis[n.s];
        if (om == null) continue;
        const signed = 1200 * Math.log2(freqHz / midiToFreq(om + n.f));
        const c = Math.abs(signed);
        const tol = n.bn ? PT_BEND_CENTS : 50;
        if (c <= tol && c < bestAbs) { best = w; bestAbs = c; }
        else if (c > tol && c < 950 && !w.credited) {
          // A fresh in-window frame at the WRONG pitch: remember the witnessed
          // direction for the host miss label (SHARP/FLAT ±N¢) at expiry.
          // Capped under an octave — a ±1200¢ frame is a detector octave-flip
          // artifact, not "you played sharp".
          w.missInfo = { pitchState: signed > 0 ? 'SHARP' : 'FLAT', pitchError: Math.round(signed) };
        }
      }
      if (best) {
        if (best.span) {
          // Tremolo span: a fresh in-tune frame marks its 100ms presence
          // bucket; credit waits for end-of-span (ptFinalizeSpans).
          const bi = Math.floor((tJudge - best.t) / PT_SPAN_BUCKET);
          if (bi >= 0 && bi < best.bktN) best.bkts.add(bi);
        } else {
          // Single-frame commit (the host's rule): one fresh in-window
          // in-pitch lock credits the note — IF the level gate also passes
          // (host-mirror silence veto). Deviation { d, t, sb } records only on a
          // real credit (t = onset, for the felt-hold gap/trend detection).
          if (ptCreditWindow(best)) _ptDevs.push({ d: tJudge - best.t, t: best.t, sb: best.sbx });
        }
      } else {
        // Near-miss aggregate: a fresh in-pitch frame that lands just
        // OUTSIDE its note's window (≤250ms off either edge) — the "I played
        // it, why no credit" feel, converted to a disclosed number.
        for (let i = Math.max(0, _ptWinLo - 1); i < _ptWin.length; i++) {
          const w = _ptWin[i];
          if (w.matchStart > tJudge + 0.25) break;
          if (w.credited || w.span) continue;
          const gap = tJudge < w.matchStart ? w.matchStart - tJudge : (tJudge >= w.matchEnd ? tJudge - w.matchEnd : 0);
          if (gap <= 0 || gap > 0.25) continue;
          const n = w.notes[0]; const om = _ptOpenMidis[n.s];
          if (om == null) continue;
          if (Math.abs(1200 * Math.log2(freqHz / midiToFreq(om + n.f))) <= 50) {
            _ptNearMiss++;
            // In-pitch but outside the window: the witnessed timing direction
            // for the host miss label (↑/↓ ±Nms) at expiry.
            w.missInfo = { timingState: tJudge < w.matchStart ? 'EARLY' : 'LATE', timingError: Math.round((tJudge - w.t) * 1000) };
            break;
          }
        }
      }
    }
    // Meter readout: the midpoint-split OWNER (what you should be playing now),
    // cents vs its pitch — display only, re-smoothed here because the scoring
    // handle now runs near-raw (smoothingMs 12).
    const own = ptWinOwnerAt(tJudge);
    if (!own) {
      ptUpdateMeter({ show: true, active: false, cents: 0, note: '--', hits: _ptScoredUnits, total: passedTotal });
      return;
    }
    const n0 = own.notes[0];
    const om0 = _ptOpenMidis[n0.s];
    if (om0 == null) return;
    const expectedMidi = om0 + n0.f;
    const cents = 1200 * Math.log2(freqHz / midiToFreq(expectedMidi));
    if (_ptMeterEma.key !== own.key || !isFinite(_ptMeterEma.cents)) _ptMeterEma = { key: own.key, cents };
    else _ptMeterEma.cents += 0.45 * (cents - _ptMeterEma.cents);
    const noteName = NOTE_NAMES[((expectedMidi % 12) + 12) % 12] + (Math.floor(expectedMidi / 12) - 1);
    ptUpdateMeter({ show: true, active: true, cents: Math.round(_ptMeterEma.cents), note: noteName, hits: _ptScoredUnits, total: passedTotal });
  }

  function stopPitchTracker() {
    if (_ptHandle) { try { _ptHandle.stop(); } catch (_) {} _ptHandle = null; }
    _ptLive = null;   // drop the live-ear snapshot so a stale lock can't light a gem on the next run
    ndStopVerify();   // clear the verify target + listener, restore note_detect
    goldDisarm();     // drop a pending gold confirm + our bare detector enable (never leaks into the next run)
    stopLevelMeter();   // tear down the level/onset tap (poll / RAF / mic stream)
    // Clear scoring state so a later silent preview can't read this run's
    // notes/hits and feed stale hit/miss counts to the pathway tier gate.
    _ptNotes = []; _ptScored = new Set(); _ptByKey = new Map(); _ptHadInput = false;
    _ptWin = []; _ptWinByKey = new Map(); _ptWinLo = 0; _ptWinLastT = -Infinity; _ptWinPassedNotes = [];
    _ptScoredUnits = 0; _ptSpanPending = []; _ptDevs = []; _ptNearMiss = 0; _ptSpanCount = 0; _ptExempt = null;
    _ptExemptIv = []; _ptChipIdx = 0; _ptChipLastT = -Infinity; _ptCalLog = []; _ptJamRun = false;
    { const jc = $('virtuoso_lab-judge-chip'); if (jc) jc.style.display = 'none'; }
    _ptMeterEma = { key: null, cents: NaN };
    // Return to the resting state instead of hiding — the strip stays a
    // standing affordance between runs (hidden only on detector-less hosts).
    ptUpdateMeter({ show: false });
    ptShowIdleStrip();
  }

  // #254 per-note gem hook — the per-note judgment the host highway lights on the gem
  // ITSELF (hit/active flare + glow, miss wash), via bundle.getNoteState. Reads the live
  // scorer state by (s,f,t) key. Returns null when no scorer runs (the bundled host with
  // no Minigames SDK, or before play) → no gems = today's behavior. 'miss' is gated on
  // _ptHadInput so an idle player (mic not started) never sees a sea of red; hits/active
  // need no gate — they're the reward. 'active' = a sustain currently ringing correctly;
  // a short note that's hit stays 'hit' (the strike flare).
  /** @param {import('./src/types/entry-data.js').EntryNote} note */
  function ptGetNoteState(note) {
    if ((!_ptHandle && !_ndVerifyMode) || !note) return null;
    if (_ptJamRun) return null;   // Jam is a MIRROR, never a judge — no hit/miss paint on any surface

    const k = ptKey(note), tn = _ptByKey.get(k);
    if (!tn) return null;                                   // not a judged note (e.g. count-in lead-in)
    const now = transport.time, end = tn.t + (tn.sus || 0.24);
    if (_ptScored.has(k)) {
      const isSustain = (tn.sus || 0) > 0.3;
      return (isSustain && now <= end + 0.05) ? 'active' : 'hit';
    }
    if (_ptHadInput) {
      const w = _ptWinByKey.get(k);
      const missAt = (w ? w.matchEnd : end + 0.06) + 0.10;   // candidate window + display grace
      if (now - ptLatency() > missAt) return 'miss';   // window passed on the JUDGE clock, never hit
    }
    // Live keep-alive for the borrowed highway (feedBack#254 provider): while this note
    // straddles the strike line AND the live ear hears its target pitch NOW, return a
    // display-only { state:'active', live:true } so the host gem stays lit until the async
    // contained verdict credits it — the provider-cull would otherwise delete the gem
    // ~100ms past the line, before our verdict lands (the "hits invisible on the 3D
    // highway" bug). MIRRORS note_detect's own noteStateFor provisional glow: it renders
    // NO judgment and drives NO credit ('hit'/'miss'/credit stay verifier-only, above);
    // the 2D strip's string check ignores the object, so that surface stays credited-only.
    // live:true routes it through the highway's non-latched 'hit-live' branch, so it
    // extinguishes on mute / relights on re-strike and can never stick a false green.
    if (_ptLive && _ptLive.c >= PT_CONF_INPUT) {
      const age = now - _ptLive.t, om = _ptOpenMidis[note.s];
      if (age > -0.05 && age < 0.08 && om != null && now >= tn.t - 0.12 && now <= end + 0.12) {
        const cents = Math.abs(1200 * Math.log2(_ptLive.f / midiToFreq(om + note.f)));
        const tol = note.bn ? PT_BEND_CENTS : 50;   // no looser than the credit floor
        // level/onset evidence — the SAME host-mirror tap the credit gate trusts, so a
        // confident YIN lock on an inaudible residual can't false-light the gem.
        let leveled = true;
        if (_lvlMode !== 'none') { const lo = now - PT_LVL_RECENT_WIN; leveled = !ptHasSamplesIn(lo, now) || ptPeakLevelIn(lo, now) >= PT_LVL_FLOOR_MIN; }
        if (cents <= tol && leveled) {
          const alpha = 0.55 + 0.4 * Math.max(0, Math.min(1, (_ptLive.c - PT_CONF_INPUT) / (1 - PT_CONF_INPUT)));
          return { state: 'active', live: true, alpha };
        }
      }
    }
    return null;                                            // not yet judged — don't pre-color
  }

  // Floating third-party overlays (e.g. a tuner plugin's fixed bottom-right
  // button) can cover the meter strip's right end at some window scales. Rather
  // than guessing a fixed reserve, MEASURE any fixed-position body-level element
  // that intrudes into the strip's band and pad our content clear of it.
  // Read-only DOM measurement — never touches the other plugin's elements
  // (the same etiquette we expect of them). Runs on the strip's hidden→shown
  // transition and on the debounced window resize in bind().
  function ptDodgeOverlays() {
    const meter = $('virtuoso_lab-pitch-meter');
    if (!meter || meter.style.display === 'none' || !meter.offsetParent) return;
    const mr = meter.getBoundingClientRect();
    if (!mr.width) return;
    let clearFrom = mr.right;
    for (const el of document.body.children) {
      if (el.contains(meter)) continue;   // the app shell that contains us
      let cs;
      try { cs = getComputedStyle(el); } catch (_) { continue; }
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const vOverlap = r.bottom > mr.top + 2 && r.top < mr.bottom - 2;
      // Only dodge right-side intruders: the element's left edge must sit in the
      // strip's right half (a centered/full-width host toast shouldn't squeeze
      // the strip to nothing — content is left-clustered anyway).
      if (!vOverlap || r.left <= mr.left + mr.width * 0.5 || r.left >= mr.right) continue;
      clearFrom = Math.min(clearFrom, r.left);
    }
    const intruded = Math.round(mr.right - clearFrom);
    // 14px base padding (the strip's own) + 10px breathing gap before the intruder.
    meter.style.paddingRight = intruded > 0 ? `${intruded + 24}px` : '';
  }

  /** @param {import('./src/types/results-data.js').MeterState} state */
  function ptUpdateMeter({ show, active, cents, note, hits, total }) {
    const meter = $('virtuoso_lab-pitch-meter');
    if (!meter) return;
    if (!show) { meter.style.display = 'none'; return; }
    const wasHidden = meter.style.display !== 'flex';
    meter.style.display = 'flex';
    if (wasHidden) ptDodgeOverlays();
    const noteEl = $('virtuoso_lab-pitch-note'), centsEl = $('virtuoso_lab-pitch-cents');
    const needleEl = $('virtuoso_lab-cents-needle'), accEl = $('virtuoso_lab-pitch-accuracy');
    if (noteEl) noteEl.textContent = active ? note : '--';
    const cc = Math.max(-100, Math.min(100, cents || 0));
    const color = !active ? '#475569' : Math.abs(cents) <= 25 ? '#22c55e' : Math.abs(cents) <= 50 ? '#eab308' : '#ef4444';
    if (needleEl) { needleEl.style.left = `${50 + cc / 2}%`; needleEl.style.background = color; }
    if (centsEl) { centsEl.textContent = active ? `${cents >= 0 ? '+' : ''}${cents}¢` : ''; centsEl.style.color = color; }
    if (accEl) {
      // Gained-only live tally (2026-06-06 feel panel — gamification + L&D +
      // market converged): a count that only goes UP, in meter green. The old
      // `12/15 (80%)` traffic-light WAS the "feels too strict" experience —
      // a running verdict, red below 60%, mid-run. The denominator lives
      // pre-run ("Judging N of M") and post-run (the modal owns verdicts).
      if (hits > 0) { accEl.textContent = String(hits); accEl.style.color = '#22c55e'; }
      else { accEl.textContent = total > 0 ? '0' : '--'; accEl.style.color = ''; }
    }
  }
  // Resting-state strip (2026-06-06, discoverability ask): the mic-monitor /
  // scoring strip and the Tune… affordance stay VISIBLE whenever the host has a
  // detection surface — not only mid-run — so a player knows the scorer and the
  // tuner exist before ever pressing Play. INERT: no mic is opened until Play
  // (the scorer) or Tune… (the tuner); this is display-only chrome. On a
  // detector-less host the strip stays hidden (never show dead UI).
  // Pre-run judge preview (Slice-2 disclosure UX): the SAME classification
  // startPitchTracker applies, counts only — drives the resting strip's
  // "Judging N of M notes" line so the denominator is visible BEFORE play.
  // Kept consistent with the live classifier by a smoke-gems row (preview
  // judged === run-info judged on the same bundle).
  /** @param {ReturnType<typeof makeBundle> | null} bundle */
  function ptPreviewJudgeCounts(bundle) {
    const all = ((bundle && bundle.notes) || []).filter(n => !n._tail);
    if (!all.length) return null;
    const opens = (/** @type {NonNullable<ReturnType<typeof makeBundle>>} */ (bundle)).openMidis || [];
    const verify = ndVerifyAvailable();
    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    const gk = (n) => n.ch != null ? ('c' + n.ch) : ('t' + n.t);
    const gc = new Map(); for (const n of all) gc.set(gk(n), (gc.get(gk(n)) || 0) + 1);
    /** @param {import('./src/types/entry-data.js').EntryNote} n */
    const audible = (n) => { const m = opens[n.s]; return m == null || midiToFreq(m + n.f) >= DETECTOR_MIN_HZ; };
    const base = all.filter(n => audible(n) && !n.mt && (verify || gc.get(gk(n)) === 1)).sort((a, b) => a.t - b.t);
    const floor = verify ? PT_MIN_RING_VERIFIER : PT_MIN_RING_YIN;
    const onsets = [...new Set(base.map(n => n.t))].sort((a, b) => a - b);
    const nxt = new Map(); for (let i = 0; i < onsets.length; i++) nxt.set(onsets[i], i + 1 < onsets.length ? onsets[i + 1] : Infinity);
    const spanKeys = new Set(); let spans = 0;
    { let /** @type {import('./src/types/entry-data.js').EntryNote[]} */ run = [];
      const flush = () => { if (run.length >= 2) { spans++; for (const n of run) spanKeys.add(ptKey(n)); } run = []; };
      for (const n of base) {
        if (!n.tr || n.ho || n.po) { flush(); continue; }
        const prev = run[run.length - 1];
        if (prev && (n.s !== prev.s || n.f !== prev.f || n.t - prev.t > 0.35)) flush();
        run.push(n);
      } flush(); }
    let legato = 0, fast = 0, judged = 0;
    for (const n of base) {
      if (spanKeys.has(ptKey(n))) continue;
      if (n.ho || n.po) { legato++; continue; }
      // Effective ring (mirrors the live classifier): written-staccato spans
      // are net of the speak budget (string starts from mute); legato-ish runs
      // ring ≈ IOI; the last note rings into silence — always certifiable.
      const ioi = nxt.get(n.t) - n.t, sus = n.sus || 0.24;
      const ring = !isFinite(ioi) ? Infinity
        : sus < 0.7 * ioi ? sus - ptSpeakBudget(midiToFreq((opens[n.s] ?? 40) + n.f))
        : ioi;
      if (ring < floor) { fast++; continue; }
      judged++;
    }
    return {
      total: all.length, judged: judged + spans, spans, legato, fast,
      muted: all.filter(n => audible(n) && n.mt).length,
      chords: all.filter(n => audible(n) && !n.mt && !verify && gc.get(gk(n)) > 1).length,
      subFloor: all.filter(n => !audible(n)).length,
    };
  }
  function ptShowIdleStrip() {
    if (!ptAvailable() && !ndVerifyAvailable()) return;
    if (transport.playing || _tunerHandle) return;   // a live owner is already painting the strip
    ptUpdateMeter({ show: true, active: false, cents: 0, note: '--', hits: 0, total: 0 });
    // The pre-run denominator line ("Judging 20 of 24 notes — …") — disclosure
    // BEFORE play, so the player never discovers an exemption from the score.
    const jn = $('virtuoso_lab-judge-note');
    if (jn) {
      const p = activeBundle ? ptPreviewJudgeCounts(activeBundle) : null;
      if (p && p.judged < p.total) {
        const why = [];
        if (p.chords) why.push(`${p.chords} chord notes`);
        if (p.subFloor) why.push(`${p.subFloor} below the mic`);
        if (p.muted) why.push(`${p.muted} muted`);
        if (p.fast) why.push(`${p.fast} too fast to certify`);
        if (p.legato) why.push(`${p.legato} slurred`);
        jn.textContent = `Judging ${p.judged} of ${p.total} notes — ${why.join(' · ')} shown unjudged`;
        jn.style.display = '';
      } else if (p) {
        jn.textContent = `Judging all ${p.judged} notes`;
        jn.style.display = '';
      } else { jn.style.display = 'none'; }
    }
    const jc = $('virtuoso_lab-judge-chip'); if (jc) jc.style.display = 'none';
    syncStripTuneBtn();
  }
  // Dwell chip (Slice-2 disclosure): while the playhead sits on a MERGED run of
  // shown-not-judged content ≥0.5s long, name the class on the strip. Built
  // per run by startPitchTracker; advanced by tick.
  let /** @type {{t0: number, t1: number, label: string}[]} */ _ptExemptIv = [], _ptChipIdx = 0, _ptChipLastT = -Infinity;
  /** @param {number} now */
  function ptUpdateJudgeChip(now) {
    const el = $('virtuoso_lab-judge-chip'); if (!el) return;
    if (now < _ptChipLastT - 0.25) _ptChipIdx = 0;   // loop wrap / seek-back
    _ptChipLastT = now;
    while (_ptChipIdx < _ptExemptIv.length && _ptExemptIv[_ptChipIdx].t1 < now) _ptChipIdx++;
    let label = null;
    for (let i = _ptChipIdx; i < _ptExemptIv.length; i++) {
      const iv = _ptExemptIv[i];
      if (iv.t0 > now) break;
      if (now <= iv.t1 && (iv.t1 - iv.t0) >= 0.5) { label = iv.label; break; }   // dwell-gated by content length
    }
    if (label) { if (el.textContent !== label) el.textContent = label; el.style.display = ''; }
    else if (el.style.display !== 'none') el.style.display = 'none';
  }
  // The strip's own Tune… button: idle-only (the scorer owns the strip during a
  // run, incl. paused; the tuner shows Done instead), and only when the YIN ear
  // exists (the tuner needs the mic detector specifically — the verifier can't
  // drive per-string cents).
  function syncStripTuneBtn() {
    const btn = $('virtuoso_lab-strip-tune');
    if (btn) btn.style.display = (!transport.playing && !_tunerHandle && ptAvailable()) ? '' : 'none';
  }
  // ── Target-aware tuner (Setup popover "Tune…" — UX panel 2026-06-05) ────────
  // Runs the same continuous detector OUTSIDE playback to tune against the
  // SELECTED tuning: the strip's MIC cluster shows the nearest target string +
  // cents (so the tuner can say "tune THIS string to THIS note" — something a
  // generic chromatic tuner can't), and per-string chips lock green after the
  // pitch holds within ±TUNER_LOCK_CENTS for TUNER_LOCK_FRAMES consecutive
  // frames (the lock-on-sweep lesson: the detector's pitch sweep must never
  // false-lock a chip). Mic in, nothing out. Stops on Done / Play / screen
  // leave (self-healing in the pitch callback, mirroring the screen-scoped
  // AudioContext discipline). This is also the hand-off surface for the
  // tuning-model retune prompts ("drop your low D to C → Tune…", Phase 2).
  let /** @type {import('./src/types/host-interfaces.js').ContinuousPitchHandle | null} */ _tunerHandle = null, /** @type {{midi: number, name: string}[]} */ _tunerTargets = [], _tunerHold = { idx: -1, count: 0 }, /** @type {Set<number>} */ _tunerLocked = new Set();
  const TUNER_LOCK_FRAMES = 12;   // ~500ms at the 40ms smoothing cadence
  const TUNER_LOCK_CENTS = 5;

  function startTuner() {
    if (!ptAvailable() || transport.playing) return;
    stopTuner();
    let opens = null;
    try { opens = openMidisForConfig(readConfig()); } catch (_) { return; }
    if (!opens || !opens.length) return;
    _tunerTargets = opens.map((midi) => ({ midi, name: NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1) }));
    _tunerHold = { idx: -1, count: 0 }; _tunerLocked = new Set();
    // Same guarded SDK call as startPitchTracker — no mic / no SDK degrades to a no-op.
    try { _tunerHandle = (/** @type {NonNullable<ReturnType<typeof hostMinigames>> & {scoring: Required<NonNullable<NonNullable<ReturnType<typeof hostMinigames>>['scoring']>>}} */ (hostMinigames())).scoring.createContinuous({ smoothingMs: 40 }); } catch (_) { _tunerHandle = null; }
    if (!_tunerHandle || typeof _tunerHandle.on !== 'function') { _tunerHandle = null; return; }
    _tunerHandle.on('pitch', tunerOnPitch);
    _tunerHandle.on('end', () => { _tunerHandle = null; });
    syncStripTuneBtn();   // the tuner owns the strip — Done replaces the idle Tune…
    const meter = $('virtuoso_lab-pitch-meter');
    if (meter) { meter.classList.add('virtuoso_lab-pm-tuner'); meter.style.display = 'flex'; }
    const chips = $('virtuoso_lab-tuner-chips'), done = $('virtuoso_lab-tuner-done');
    if (chips) {
      chips.style.display = 'inline-flex';
      chips.innerHTML = '';
      _tunerTargets.forEach((t, i) => {
        const c = document.createElement('span');
        c.className = 'virtuoso_lab-tuner-chip';
        c.dataset.idx = String(i);
        c.textContent = t.name;
        c.title = `String ${i + 1} (low → high): tune to ${t.name}`;
        chips.appendChild(c);
      });
    }
    if (done) done.style.display = '';
    tunerPaint(null, 0, false);
    ptDodgeOverlays();
  }

  /** @param {Pick<import('./src/types/host-interfaces.js').PitchFrame, 'freqHz' | 'confidence'>} arg */
  function tunerOnPitch({ freqHz, confidence }) {
    // Self-heal: Virtuoso backgrounded or playback started → the tuner ends.
    if (!$('virtuoso_lab-root')?.offsetParent || transport.playing) { stopTuner(); return; }
    if (!(freqHz > 0) || confidence < 0.55) { tunerPaint(null, 0, false); return; }
    const midiF = 69 + 12 * Math.log2(freqHz / 440);
    // Nearest target — with an OCTAVE FOLD for sub-floor strings (70 Hz plan):
    // YIN can't see fundamentals below DETECTOR_MIN_HZ and reports the 2nd
    // harmonic instead, so a sub-floor target's reference is its octave-up.
    // Folding ONLY sub-floor targets keeps same-pc string pairs (the two E
    // strings in standard tuning) unambiguous.
    let idx = 0, best = Infinity, bestRef = 0;
    for (let i = 0; i < _tunerTargets.length; i++) {
      const t = _tunerTargets[i];
      const ref = midiToFreq(t.midi) < DETECTOR_MIN_HZ ? t.midi + 12 : t.midi;
      const d = Math.abs(midiF - ref);
      if (d < best) { best = d; idx = i; bestRef = ref; }
    }
    const cents = Math.round((midiF - bestRef) * 100);
    if (Math.abs(cents) > 700) { tunerPaint(null, 0, false); return; }   // nowhere near any string — ignore the frame
    if (_tunerHold.idx === idx && Math.abs(cents) <= TUNER_LOCK_CENTS) _tunerHold.count++;
    else _tunerHold = { idx, count: Math.abs(cents) <= TUNER_LOCK_CENTS ? 1 : 0 };
    if (_tunerHold.count >= TUNER_LOCK_FRAMES) _tunerLocked.add(idx);
    tunerPaint(idx, cents, true);
  }

  /** @param {number | null} idx @param {number} cents @param {boolean} active */
  function tunerPaint(idx, cents, active) {
    const noteEl = $('virtuoso_lab-pitch-note'), centsEl = $('virtuoso_lab-pitch-cents'), needleEl = $('virtuoso_lab-cents-needle');
    const t = (idx != null && _tunerTargets[idx]) || null;
    if (noteEl) noteEl.textContent = t ? t.name : '--';
    const cc = Math.max(-100, Math.min(100, cents || 0));
    const color = !active ? '#475569'
      : Math.abs(cents) <= TUNER_LOCK_CENTS ? 'var(--virtuoso_lab_vir-meter, #22c55e)'
      : Math.abs(cents) <= 25 ? '#eab308' : '#ef4444';
    if (needleEl) { needleEl.style.left = `${50 + cc / 2}%`; needleEl.style.background = color; }
    if (centsEl) { centsEl.textContent = active ? `${cents >= 0 ? '+' : ''}${cents}¢` : ''; centsEl.style.color = color; }
    const chips = $('virtuoso_lab-tuner-chips');
    if (chips) {
      for (const c of chips.children) {
        const i = Number(c.dataset.idx);
        c.classList.toggle('near', !!(active && i === idx));
        c.classList.toggle('tuned', _tunerLocked.has(i));
      }
    }
  }

  function stopTuner() {
    if (_tunerHandle) { try { _tunerHandle.stop(); } catch (_) {} _tunerHandle = null; }
    const meter = $('virtuoso_lab-pitch-meter');
    if (meter && meter.classList.contains('virtuoso_lab-pm-tuner')) {
      meter.classList.remove('virtuoso_lab-pm-tuner');
    }
    const chips = $('virtuoso_lab-tuner-chips'), done = $('virtuoso_lab-tuner-done');
    if (chips) { chips.style.display = 'none'; chips.innerHTML = ''; }
    if (done) done.style.display = 'none';
    _tunerTargets = []; _tunerHold = { idx: -1, count: 0 }; _tunerLocked = new Set();
    // Done returns the strip to its RESTING state (visible, inert, Tune… shown)
    // rather than hiding it — self-gated: a starting scorer repaints it anyway.
    ptShowIdleStrip();
  }
  // ── End pitch tracker ──────────────────────────────────────────────────────

  // ── Session logger ─────────────────────────────────────────────────────────
  // Append-only log of every practice session. Soft-gamification model:
  // logs silently regardless of mode, never gates anything.
  // Schema: { id, date, ts, mode, pathway_id, bpm, bpm_tier, scale, key,
  //           practice_type, duration_ms, hit_count, miss_count }

  function sessionsLoad() {
    try { return JSON.parse(localStorage.getItem('virtuoso_lab.sessions') || '[]'); }
    catch { return []; }
  }

  /** @param {import('./src/types/results-data.js').SessionLog[]} arr */
  function sessionsSave(arr) {
    try { localStorage.setItem('virtuoso_lab.sessions', JSON.stringify(arr.slice(0, 500))); }
    catch (e) { console.warn('[Virtuoso] session save failed', e); }
  }

  // ── Pathway tier progress ───────────────────────────────────────────────────
  // Schema: { [pathway_id]: { highest_tier: number } }
  // highest_tier: -1 = none cleared, 0-3 = highest index cleared.
  // Accuracy gate: if pitch tracker ran (hit+miss > 0) and accuracy < 65%, skip.
  // Passive attribution: custom sessions within ±5 BPM of a pathway tier BPM
  // count toward that pathway.
  // SDK: emits a 'virtuoso_lab:tier:unlocked' bus event when a new high is set.
  function pathwayTiersLoad() {
    try { return JSON.parse(localStorage.getItem('virtuoso_lab.pathway_tiers') || '{}'); }
    catch { return {}; }
  }
  /** @param {object} obj */
  function pathwayTiersSave(obj) {
    try { localStorage.setItem('virtuoso_lab.pathway_tiers', JSON.stringify(obj)); }
    catch (e) { console.warn('[Virtuoso] pathway tier save failed', e); }
  }
  /** @param {string} pathwayId @param {number} tier */
  function _updatePathwayTier(pathwayId, tier) {
    const all = pathwayTiersLoad();
    const cur = all[pathwayId] || { highest_tier: -1 };
    if (tier <= (cur.highest_tier ?? -1)) return null;
    all[pathwayId] = Object.assign({}, cur, { highest_tier: tier });   // MERGE — never drop bestBpm/feltBpm
    pathwayTiersSave(all);
    const bus = hostBus();
    if (bus && typeof bus.emit === 'function') {
      bus.emit('virtuoso_lab:tier:unlocked', {
        pathway: pathwayId, tier, label: TIER_LABELS[tier] || `T${tier + 1}`
      });
    }
    return { pathwayId, tier };
  }
  // ── Bass FELT-HOLD (engagement foundations) — docs/plugin/design/bass-felt-hold-roundtable.md ──
  // The bass analog of the guitar clean-tempo PB. Bass is felt-not-scored, so a
  // FELT-rung pathway (feltGate:true) completes on a sustained POCKET, not a %: a
  // verdict — Locked / Settling / Dragging / Rushing — from the onset-timing
  // deviations we already collect (_ptDevs = { d:sec, t:sec }), NO new DSP, NO %, NO
  // per-note flash. THREE numbers (rhythm-meter): leanMs (median placement), driftMs
  // (Theil-Sen slope × span = tempo trend), jitterMs (MAD×1.4826 of the DETRENDED
  // residuals = tightness). Sign (D1, the code's): + = LATE = behind, − = early =
  // ahead. Bucketing order drift → lean → tightness, so a player sliding through
  // center can't read Locked. Below the evidence gate → null (never a directional
  // label); jitter-loose-but-centered → null+untight (encouraging "keep working it",
  // NOT shaming). Thresholds bass-ped, v1 dogfood-tunable.
  const FELT = { MIN_N: 12, MIN_BARS: 4, JITTER_LOCK: 25, JITTER_SETTLE: 45, LEAN_AHEAD: -18, LEAN_BEHIND: 28, DRIFT_FAIL: 35 };
  /** @param {number[]} a */
  function _feltMedian(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  /** @param {{t: number, d: number}[]} pts */
  function _feltTheilSen(pts) {   // median pairwise slope (ms per second) over { t:sec, d:ms }
    const sl = [];
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dt = pts[j].t - pts[i].t; if (Math.abs(dt) > 1e-6) sl.push((pts[j].d - pts[i].d) / dt);
    }
    return sl.length ? _feltMedian(sl) : 0;
  }
  // devs = [{ d:sec, t:sec }]; opts.barSec. Returns { verdict, leanMs, driftMs,
  // jitterMs, n, spanBars, untight } — verdict null = no pocket read (untight true →
  // loose-but-played, false → too little evidence). Pure; no host/DOM.
  /** @param {import('./src/types/results-data.js').TimingDeviation[] | null} devs @param {{barSec?: number}} [opts] @returns {import('./src/types/results-data.js').FeltAnalysis} */
  function feltHoldAnalyze(devs, opts) {
    opts = opts || {};
    const barSec = opts.barSec !== undefined && opts.barSec > 0 ? opts.barSec : 2;
    if (!Array.isArray(devs) || devs.length < FELT.MIN_N) return { verdict: null, n: devs ? devs.length : 0, untight: false };
    // D3 (v1.1): subtract each deviation's register-dependent speak-budget EXCESS
    // (`sb`, s — see the window-build comment) so a low note's late-arriving
    // evidence doesn't read as the PLAYER late. Corrects both the lean (fake
    // "Dragging" on low lines) and the cross-register jitter inflation a walking
    // line suffers (E1→G3 spans ~30ms of speak spread — enough alone to push a
    // Locked player past JITTER_LOCK). Missing sb (old vectors, tests) = 0.
    const pts = devs.map(x => ({ t: x.t, d: (x.d - (x.sb || 0)) * 1000 })).sort((a, b) => a.t - b.t);   // d → ms
    // Longest CONTINUOUS credited span (break the chain on a gap > ~2 bars).
    const gapMax = 2 * barSec; let runStart = 0, best = [0, 0];
    for (let i = 1; i <= pts.length; i++) {
      if (i === pts.length || pts[i].t - pts[i - 1].t > gapMax) {
        if (i - runStart > best[1] - best[0]) best = [runStart, i];
        runStart = i;
      }
    }
    const seg = pts.slice(best[0], best[1]);
    const spanSec = seg.length ? (seg[seg.length - 1].t - seg[0].t) : 0;
    const spanBars = barSec > 0 ? spanSec / barSec : 0;
    if (seg.length < FELT.MIN_N || spanBars < FELT.MIN_BARS) return { verdict: null, n: seg.length, spanBars: Math.round(spanBars), untight: false };
    const leanMs = Math.round(_feltMedian(seg.map(p => p.d)));
    const slope = _feltTheilSen(seg);                  // ms/s
    const driftMs = Math.round(slope * spanSec);
    const resid = seg.map(p => p.d - slope * (p.t - seg[0].t));   // detrend
    const medR = _feltMedian(resid);
    const jitterMs = Math.round(1.4826 * _feltMedian(resid.map(r => Math.abs(r - medR))));
    let /** @type {import('./src/types/results-data.js').FeltAnalysis['verdict']} */ verdict, untight = false;
    if (Math.abs(driftMs) >= FELT.DRIFT_FAIL) verdict = driftMs > 0 ? 'dragging' : 'rushing';   // trend first (+ = behind)
    else if (leanMs >= FELT.LEAN_BEHIND) verdict = 'dragging';
    else if (leanMs <= FELT.LEAN_AHEAD) verdict = 'rushing';
    else if (jitterMs <= FELT.JITTER_LOCK) verdict = 'locked';
    else if (jitterMs <= FELT.JITTER_SETTLE) verdict = 'settling';
    else { verdict = null; untight = true; }          // loose-but-centered: no pocket yet, encouraging copy
    return { verdict, leanMs, driftMs, jitterMs, n: seg.length, spanBars: Math.round(spanBars), untight };
  }
  // Credit a FELT-rung pathway (the engine gap fix): Settling-or-better flips the
  // tier (D2 — mirrors guitar's "clean enough" bar); LOCKED additionally raises the
  // gained-only feltBpm PB ("grooves you own"). NO lenient self-confirm — a flip needs
  // a real verdict (real onsets above the floor), so a sub-floor block self-enforces
  // "practiced only". Returns the credit summary or null.
  /** @param {string} pwId @param {number | null | undefined} bpm @param {import('./src/types/results-data.js').FeltAnalysis | null} fh */
  function creditFeltRung(pwId, bpm, fh) {
    const pw = PATHWAYS[pwId]; if (!pw || !pw.feltGate || !fh) return null;
    const v = fh.verdict;
    const tiers = pw.tempoTiers || []; let tier = -1;
    tiers.forEach((t, i) => { if ((bpm || 0) >= t) tier = i; });
    if (tier < 0) return null;
    let flip = null, feltPB = false;
    if (v === 'locked' || v === 'settling') flip = _updatePathwayTier(pwId, tier);   // D2: settling-or-better flips
    if (v === 'locked' && bpm) {
      const all = pathwayTiersLoad(), cur = all[pwId] || {};
      if (bpm > (cur.feltBpm || 0)) { cur.feltBpm = bpm; all[pwId] = cur; pathwayTiersSave(all); feltPB = true; try { emitProgress('felt', pwId, { bpm }); } catch (_) {} }
    }
    if (!flip && !feltPB) return null;
    return { pathwayId: pwId, pathwayLabel: pw.label, tier, tierName: TIER_LABELS[tier] || ('Tier ' + (tier + 1)), verdict: v, flip: !!flip, feltPB, feltBpm: (pathwayTiersLoad()[pwId] || {}).feltBpm || null };
  }
  // ── Proof-loop slice (flagged, pilot-only) — docs/archive/proof-loop-slice.md ────────
  // ONE flagged build, TRIPLE duty: (1) a per-rung CLEAN-PASS verdict — the
  // settling-tax guard below makes a rung clear only on a run that HELD the standard,
  // not a 22s fluke (the missing "clean-gate"); (2) the only honest retention signal
  // at homebrew/tiny-N (the "what you proved" card); (3) a copy-able plaintext
  // SHAREABLE card for Discord. Mic-OPTIONAL by design (the host scorer is absent on
  // bundled 0.2.7 — see project_slopsmith_forward_compat): the verdict is
  // completion-at-tempo + settling-tax, NEVER mic-primary. Gained-only, honest (a
  // claim ONLY when earned), no fail verdict, no nag. Pilot = Blues Foundation.
  // Pilot → verdict KIND. 'tempo' = the completion-at-tempo claim (Blues v1).
  // 'guide_tones' = a MUSICAL claim — the run measurably voice-led to the guide
  // tones across the changes (the Connect engine, the same landing smoke-connect
  // asserts). The card / claim / share-text branch on the kind. Add a pilot by id.
  const PROOF_PILOTS = new Map([['blues_foundation', 'tempo'], ['vl_connect', 'guide_tones']]);
  function proofLoopOn() { try { return localStorage.getItem('virtuoso_lab.proofloop') === 'on'; } catch { return false; } }
  /** @param {string | null} id @returns {id is string} */
  function proofPilot(id) { return proofLoopOn() && !!id && PROOF_PILOTS.has(id); }
  /** @param {string} id */
  function proofKind(id) { return PROOF_PILOTS.get(id) || 'tempo'; }
  // The settling-tax window: the run must have HELD the standard — ≥ max(20s, 85% of
  // the content length). Kills the 22s fluke on a long run; ≥1 real pass on a short one.
  /** @param {import('./src/types/results-data.js').ProofDuration} session */
  function proofHeld(session) {
    const contentMs = session.content_ms || session.duration_ms || 0;
    return (session.duration_ms || 0) >= Math.max(20000, 0.85 * contentMs);
  }
  // ── Guide-tone verdict measurement (the Connect fast-follow) ─────────────────
  // PURE (no DOM). The musical proof for a 'guide_tones' pilot: did the generated
  // line actually voice-lead — each chord change landing on the NEXT chord's guide
  // tone (3rd/7th), 0 root-restarts — exactly what smoke-connect.mjs asserts on the
  // chord_scales/Connect engine? Reads the shared chart.timeline (per-bar rootPc +
  // gpcs = guide-tone pitch classes from chordHighlightPcs), so the verdict and the
  // backing agree on the harmony. Returns null when not a measurable changes-run.
  // Used to (a) NAME the device in the claim and (b) guard against a FALSE claim
  // (config drift) — never to make the tier harder to clear.
  /** @param {import('./src/types/entry-data.js').EntryChart | null} chart @param {import('./src/types/entry-data.js').EntryConfig | null} cfg */
  function measureGuideToneLandings(chart, cfg) {
    if (!chart || !cfg) return null;
    const timeline = (chart.timeline && chart.timeline.length)
      ? chart.timeline
      : compileChordTimeline(cfg, chart.duration || (cfg.bars * measureSeconds(cfg)));
    if (!timeline || timeline.length < 2) return null;
    const openMidis = openMidisForConfig(cfg);
    const notes = (chart.notes || []).filter(n => !n._tail).slice().sort((a, b) => a.t - b.t);
    let changes = 0, landings = 0, rootRestarts = 0;
    for (let i = 1; i < timeline.length; i++) {            // skip the first chord (the "open" start)
      const c = timeline[i];
      // The first foreground note that falls inside this chord's bar.
      const first = notes.find(n => n.t >= c.startSec - 1e-4 && n.t < c.endSec - 1e-4);
      if (!first || openMidis[first.s] == null) continue;
      const pc = (openMidis[first.s] + first.f) % 12;
      changes++;
      if (Array.isArray(c.gpcs) && c.gpcs.includes(pc)) landings++;
      if (pc === c.rootPc) rootRestarts++;
    }
    if (changes === 0) return null;
    return { changes, landings, rootRestarts, ratio: landings / changes };
  }
  // The progression token, prettified for a claim ('ii-V-I' → 'ii–V–I').
  /** @param {string | null | undefined} p */
  function prettyProgression(p) { return p ? String(p).replace(/-/g, '–') : ''; }
  // One forward-looking "use it off the screen" line per pilot (north-star nod, not a nag).

  /** @type {Record<string, string>} */
  const PROOF_TRANSFER = {
    blues_foundation: 'Next time you play a blues, reach for the ♭5 and resolve it up to the 5th — that one note is the blues.',
    vl_connect: 'Next time you solo over a ii–V–I, aim your line at the next chord\'s 3rd or 7th across the bar line — that is playing the changes.',
  };
  // ── COOPERATIVE SHARE CARD (engagement Tier C) — text + IMAGE, every lane ─────
  // "Share and cheer", never a leaderboard/rank/score, never auto-posted (a Copy
  // button — consent). ONE content model feeds BOTH the plain-text card and the
  // canvas image (the image is a styled render of the SAME lines — never a superset,
  // so a %/chart can't sneak into the public artifact). Gamification rulings
  // (project_share_card_everywhere_and_jam): EVERY logged run is shareable (the ~2s
  // session floor is the only gate — _lastEndedSession only exists past it); the card
  // is a strict honest MIRROR — an earned run LEADS with a green ✓, an ordinary run
  // is a dignified descriptive log (no ✓, no fabricated claim); NO %/grade/rank on
  // ANY card, any mode; Jam is DESCRIPTIVE only (form/key/style/time — the mirror,
  // never a judge); a Custom passive ±5 flip is NEVER the public hero. Level behind
  // XP-Off. `isShareworthy` is repurposed: it now means "leads with an achievement"
  // (the content fork), not "does the card exist".
  /** @param {string | null | undefined} sc */
  function _scaleLabel(sc) { return sc ? String(sc).replace(/_/g, ' ') : ''; }
  /** @param {import('./src/types/results-data.js').RunSummary | null} s */
  function isShareworthy(s) {
    if (!s) return false;
    return !!(s.proof || (s.tierCleared && s.mode === 'pathway') || (s.feltResult && s.feltResult.flip)
      || (s.depth && (s.depth.travelRung || s.depth.cleanRung || s.depth.travelKey)) || (s.badgesNew && s.badgesNew.length));
  }
  // The single content model — { lane, eyebrow, hero, heroGreen, sub, dur, stats[], extra[] }.
  /** @param {import('./src/types/results-data.js').RunSummary | null} s */
  function shareCardModel(s) {
    if (!s) return null;
    const isWorkout = s.mode === 'session' && Array.isArray(s.chapters) && s.chapters.length > 1;
    const lane = s.jam ? 'JAM' : isWorkout ? 'WORKOUT' : s.mode === 'pathway' ? 'LADDER' : 'CUSTOM';
    const mins = Math.floor((s.duration_ms || 0) / 60000), secs = Math.round(((s.duration_ms || 0) % 60000) / 1000);
    const dur = `${mins}:${String(secs).padStart(2, '0')}`;
    /** @type {import('./src/types/results-data.js').ShareModel} */
    const m = { lane, dur, eyebrow: '', hero: '', heroGreen: false, sub: '', stats: [], extra: [] };
    /** @param {string} label @param {string | number | null | undefined} value */
    const stat = (label, value) => { if (value != null && value !== '') m.stats.push({ label, value: String(value) }); };
    if (lane === 'JAM') {
      m.eyebrow = 'JAMMED';
      const style = s.style || _scaleLabel(s.scale) || 'a groove';
      m.hero = `${style}${s.key ? ` in ${s.key}` : ''}`;
      stat('STYLE', s.style || _scaleLabel(s.scale)); stat('KEY', s.key);
      stat('TEMPO', s.bpm ? s.bpm + ' BPM' : null); stat('TIME', dur);
      return m;
    }
    if (lane === 'WORKOUT') {
      m.eyebrow = 'COMPLETED'; m.hero = s.displayName || 'Workout';
      try {
        /** @type {string[]} */
        const seen = []; (/** @type {NonNullable<import('./src/types/results-data.js').RunSummary['chapters']>} */ (s.chapters)).forEach(c => { if (c.role && !seen.includes(c.role)) seen.push(c.role); });
        const arc = seen.map(r => (SEGMENT_ROLES[r] && SEGMENT_ROLES[r].label) || r).filter(Boolean).join(' → ');
        if (arc) m.sub = arc;
      } catch (_) {}
      const cleared = (s.chapters || []).filter(c => c.earned).length;
      const longest = (s.chapters || []).reduce((/** @type {import('./src/types/results-data.js').Chapter | null} */ a, c) => (c && c.durSec > (a ? a.durSec : -1)) ? c : a, null);
      stat('BLOCKS', (/** @type {NonNullable<import('./src/types/results-data.js').RunSummary['chapters']>} */ (s.chapters)).length);
      stat('CLEARED', `${cleared}/${(/** @type {NonNullable<import('./src/types/results-data.js').RunSummary['chapters']>} */ (s.chapters)).length}`);
      stat('TIME', dur);
      if (longest && (longest.name || longest.role)) stat('TOP BLOCK', longest.name || longest.role);
      if (s.streak > 0) stat('DAY', String(s.streak));
      return m;
    }
    // LADDER / CUSTOM — earned-led (green) or honest descriptive
    if (s.feltResult && s.feltResult.flip) {
      m.eyebrow = 'LOCKED IN'; m.heroGreen = true;
      m.hero = (s.felt && s.felt.verdict === 'locked') ? 'Locked the pocket' : 'Settled into the pocket';
      if (s.feltResult.feltBpm) m.sub = `held in the pocket to ${s.feltResult.feltBpm} BPM`;
      stat('SKILL', s.feltResult.pathwayLabel || s.displayName); stat('KEY', s.key); stat('TIME', dur);
    } else if (s.proof) {
      m.eyebrow = 'PROVED'; m.heroGreen = true;
      m.hero = s.proof.kind === 'guide_tones' ? 'Connected the changes' : s.proof.label;
      m.sub = s.proof.kind === 'guide_tones'
        ? `voice-led to the guide tones${s.proof.progression ? ` through the ${s.proof.progression}` : ''}`
        : `holds at ${s.proof.tierName} tempo`;
      stat('TEMPO', (s.proof.bpm || s.bpm) ? (s.proof.bpm || s.bpm) + ' BPM' : null); stat('KEY', s.proof.key || s.key); stat('TIME', dur);
    } else if (s.tierCleared && s.clearedTier != null && s.mode === 'pathway') {
      m.eyebrow = 'CLEARED'; m.heroGreen = true;
      m.hero = `Cleared ${TIER_LABELS[s.clearedTier] || ('Tier ' + (s.clearedTier + 1))}`;
      if (s.displayName) m.sub = s.displayName;
      stat('TEMPO', s.bpm ? s.bpm + ' BPM' : null); stat('KEY', s.key); stat('TIME', dur);
    } else if (s.depth && s.depth.travelRung) {
      m.eyebrow = 'TRAVELS'; m.heroGreen = true; m.hero = 'It travels now';
      if (s.displayName) m.sub = s.displayName;
      stat('KEY', s.depth.travelKey || s.key); stat('TIME', dur);
    } else {
      // No earned event → an honest descriptive log (no ✓, no fabricated claim).
      m.eyebrow = 'PRACTICED';
      m.hero = `${_scaleLabel(s.scale) || (s.displayName || 'Practice')}${s.key ? ` in ${s.key}` : ''}`;
      stat('TEMPO', s.bpm ? s.bpm + ' BPM' : null); stat('KEY', s.key); stat('TIME', dur);
    }
    // Performance facts — always present for a graded (non-felt) run so the card
    // carries real info even on a 0-hit run: ACCURACY + HITS LEAD the row (note_detect
    // parity). Jam/Workout already returned with their own stats; felt runs stay
    // felt-not-scored (no %). A clean-run PB / day-streak rounds the row out to ~6.
    if (!(s.feltResult && s.feltResult.flip)) {
      const r = s.results || {};
      if (r.judgedPassed > 0) {
        m.stats.unshift({ label: 'HITS', value: `${r.hits}/${r.judgedPassed}` });
        m.stats.unshift({ label: 'ACCURACY', value: `${Math.round((r.hits / r.judgedPassed) * 100)}%` });
      }
      if (s.recognizer && s.recognizer.bpm) m.stats.push({ label: 'BEST', value: `${s.recognizer.bpm} BPM` });
      else if (s.streak > 0) m.stats.push({ label: 'DAY', value: String(s.streak) });
    }
    // Secondary earned ✓ lines (text card only — the image keeps one hero).
    if (s.depth && s.depth.travelKey && !s.depth.travelRung) m.extra.push(`Travels — first clean run in ${s.depth.travelKey}`);
    if (s.depth && s.depth.cleanRung) m.extra.push('Clean — a supports-off pass');
    if (s.badgesNew && s.badgesNew.length) s.badgesNew.forEach(b => m.extra.push(`${b.name} — ${b.desc}`));
    return m;
  }
  /** @param {import('./src/types/results-data.js').RunSummary | null} s */
  function shareCardText(s) {
    const m = shareCardModel(s); if (!m) return '';
    let xpOff = false; try { xpOff = progressLoad().mode === 'off'; } catch (_) {}
    const what = m.lane === 'JAM' ? 'Jam' : ((/** @type {import('./src/types/results-data.js').RunSummary} */ (s)).displayName || m.hero);
    const lines = [`Virtuoso — ${what}`];
    if (m.heroGreen) lines.push(`✓ ${m.hero}${m.sub ? ` — ${m.sub}` : ''}`);
    else if (m.lane === 'JAM') lines.push(`Jammed over ${m.hero}`);
    else if (m.lane === 'WORKOUT') lines.push(`Completed ${m.hero}${m.sub ? ` (${m.sub})` : ''}`);
    else lines.push(`Practiced ${m.hero}`);
    m.extra.forEach(e => lines.push(`✓ ${e}`));
    const tail = [`Practiced ${m.dur}`];
    if ((/** @type {import('./src/types/results-data.js').RunSummary} */ (s)).streak > 0) tail.push(`Day ${(/** @type {import('./src/types/results-data.js').RunSummary} */ (s)).streak}`);
    if (!xpOff) { try { const lv = xpLevelInfo(progressLoad().xp); tail.push(`Level ${lv.level} · ${lv.name}`); } catch (_) {} }
    lines.push(tail.join(' · '));
    return lines.join('\n');
  }
  /** @param {CanvasRenderingContext2D} ctx @param {string | null} text @param {number} maxW */
  function _fitCanvasText(ctx, text, maxW) {
    text = String(text == null ? '' : text);
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text; while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
  }
  // Ensure the ACTIVE card theme's display face is resident before the canvas rasterizes
  // (the DOM card gets it via CSS font-display; the canvas needs it loaded, or it falls
  // back to a system font). Signature/Neon use VirtuosoLabDisplay (Orbitron); Esports adds
  // Rajdhani; Metal adds Russo One (both lazy-served from /font — first render fetches them).
  async function loadCardFonts() {
    if (!(document.fonts && document.fonts.load)) return;
    let skin = 'signature'; try { skin = $('virtuoso_lab-root')?.getAttribute('data-virtuoso_lab_vir-cardskin') || 'signature'; } catch (_) {}
    const faces = ["700 64px 'VirtuosoLabDisplay'", "700 18px 'VirtuosoLabDisplay'"];
    // Load the exact weights the canvas draws (800 wordmark, 700 hero/labels) so the strict
    // canvas font-match resolves to the skin face instead of dropping to VirtuosoLabDisplay.
    if (skin === 'esports') faces.push("800 64px 'VirtuosoLabEsports'", "700 64px 'VirtuosoLabEsports'", "700 18px 'VirtuosoLabEsports'");
    else if (skin === 'metal') faces.push("800 64px 'VirtuosoLabMetal'", "700 64px 'VirtuosoLabMetal'", "700 18px 'VirtuosoLabMetal'");
    try { await Promise.all(faces.map(f => document.fonts.load(f))); } catch (_) {}
    // Await full readiness — canvas font-matching drops a not-yet-ready face to the next
    // family in the stack, so the skin font can otherwise lose the first paint after load.
    try { if (document.fonts.ready) await document.fonts.ready; } catch (_) {}
    // Warm the canvas font cache: the FIRST canvas draw with a just-readied face can still
    // miss it (Chromium caches per 2d context), so prime a throwaway context with each face
    // before renderShareCardImage draws for real. Cheap; makes the skin font deterministic.
    try {
      const wc = document.createElement('canvas').getContext('2d');
      if (wc) faces.forEach(f => { wc.font = f; wc.fillText('Mg', -50, -50); });
    } catch (_) {}
  }
  // The card IMAGE — a canvas render of the SAME model (ux spec: 1200×630, verdict-led,
  // green ✓ only on a true clear, theme palette/font read live off --virtuoso_lab_vir-card-*; same-origin
  // → toBlob won't taint). Returns the canvas, or null.
  /** @param {import('./src/types/results-data.js').RunSummary | null} s */
  function renderShareCardImage(s) {
    const m = shareCardModel(s); if (!m) return null;
    const W = 1200, H = 630, P = 64;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'); if (!ctx) return null;
    // Card THEME (settings → Card theme). Signature = today's look (the original path,
    // reading --virtuoso_lab_vir-accent-*); neon/esports/metal read the SAME --virtuoso_lab_vir-card-* contract the
    // DOM card uses, so the copy card matches the on-screen card. Green stays cleared-only.
    const GREEN = '#22c55e';
    let accent = '#60a5fa', accentSoft = 'rgba(96,165,250,0.18)', cardBg = null;
    let skin = 'signature', glow = true, radius = 18;
    let TXT = '#f8fafc', DIM = '#cbd5e1', MUT = '#94a3b8';
    const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    let DISP = `'VirtuosoLabDisplay', 'Orbitron', ${SANS}`;
    try {
      const root = $('virtuoso_lab-root');
      if (root) {
        const cs = getComputedStyle(root);
        skin = root.getAttribute('data-virtuoso_lab_vir-cardskin') || 'signature';
        /** @template {string | null} Fallback @param {string} n @param {Fallback} f @returns {string | Fallback} */
        const gv = (n, f) => { const v = cs.getPropertyValue(n).trim(); return v || f; };
        if (skin === 'signature') {
          accent = gv('--virtuoso_lab_vir-accent-edge', accent);
          accentSoft = gv('--virtuoso_lab_vir-accent-soft', accentSoft);
        } else {
          accent = gv('--virtuoso_lab_vir-card-accent', accent);
          accentSoft = gv('--virtuoso_lab_vir-card-accent-soft', accentSoft);
          cardBg = gv('--virtuoso_lab_vir-card-bg', null);
          TXT = gv('--virtuoso_lab_vir-card-text', TXT);
          DIM = gv('--virtuoso_lab_vir-card-dim', DIM);
          MUT = gv('--virtuoso_lab_vir-card-faint', MUT);
          glow = gv('--virtuoso_lab_vir-card-glow', '1') !== '0';
          radius = parseInt(gv('--virtuoso_lab_vir-card-radius', '18'), 10); if (!isFinite(radius)) radius = 18;
          // Plain, NAMESPACED family names — the DOM font token nests a var() the canvas
          // can't parse, and the namespaced names avoid colliding with note_detect's faces.
          // NB: do NOT list VirtuosoLabDisplay as the fallback — canvas prefers the always-ready
          // base64-inline face over a URL-loaded first font, so the skin face would lose.
          // A plain sans fallback lets the (warmed) skin face win; it only shows if the
          // skin font genuinely failed to load.
          /** @type {Record<string, string>} */
          const CF = { neon: "'VirtuosoLabDisplay'", esports: "'VirtuosoLabEsports'", metal: "'VirtuosoLabMetal'", warm: "'Rockwell','Roboto Slab','Zilla Slab',Georgia,serif" };
          DISP = CF[skin] ? `${CF[skin]}, ${SANS}` : SANS;   // focus has no display face → base sans
        }
      }
    } catch (_) {}
    // A skin forces its display face on the whole card (identity); Signature keeps the
    // toggle-back rule (display face in Lit only, system face in Calm).
    let lit = false; try { lit = !!$('virtuoso_lab-root')?.classList.contains('virtuoso_lab_vir-lit'); } catch (_) {}
    const HEAD = (skin !== 'signature' || lit) ? 'disp' : false;
    /** @param {number} px @param {number} w @param {string | boolean} [m] */
    const font = (px, w, m) => ctx.font = `${w} ${px}px ${m === 'disp' ? DISP : m ? MONO : SANS}`;
    /** @param {number} x @param {number} y @param {number} w @param {number} h @param {number} r */
    const pill = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    // Background: Signature keeps its subtle gradient; Metal paints a brushed-steel
    // gradient (the feTurbulence grunge is DOM-only); other skins paint an opaque base
    // then their panel color (the skin bg tokens are translucent → no see-through PNG).
    if (skin === 'metal') {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a3f46'); g.addColorStop(0.55, '#24272c'); g.addColorStop(1, '#1a1c20');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (skin === 'warm') {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#34241a'); g.addColorStop(0.55, '#2a1d16'); g.addColorStop(1, '#201510');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (skin !== 'signature') {
      ctx.fillStyle = '#0a0e1a'; ctx.fillRect(0, 0, W, H);
      if (cardBg) { ctx.fillStyle = cardBg; ctx.fillRect(0, 0, W, H); }
    } else {
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#080812'); bg.addColorStop(1, '#0d0d18');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    }
    // Frame — the live card's glow-ring recipe MIRRORed onto the canvas: an earned card
    // frames in meter-green (the cleared-only color), otherwise the theme accent. A soft
    // corner bloom adds depth (skipped for the glow-less esports skin); big readouts stay
    // crisp (no glow on the text itself — legibility over spectacle).
    const frameC = m.heroGreen ? GREEN : accent;
    if (glow) {
      const cg = ctx.createRadialGradient(150, 130, 0, 150, 130, 560);
      cg.addColorStop(0, m.heroGreen ? 'rgba(34,197,94,0.16)' : accentSoft); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = frameC; ctx.fillRect(0, 0, W, 5);                                   // accent spine (earned → green)
    ctx.save();
    ctx.shadowColor = frameC; ctx.shadowBlur = glow ? 26 : 0; ctx.lineWidth = 2; ctx.strokeStyle = frameC;
    pill(26, 26, W - 52, H - 52, radius); ctx.stroke();                                 // frame (glowing unless the skin is glow-less; square when radius 0)
    ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    pill(29, 29, W - 58, H - 58, Math.max(0, radius - 2)); ctx.stroke();                // inner bevel hairline
    ctx.restore();
    ctx.textBaseline = 'alphabetic';
    // Brand strip
    ctx.fillStyle = accent; pill(P, 70, 6, 40, 3); ctx.fill();
    ctx.fillStyle = TXT; font(40, 800, HEAD); ctx.fillText('Virtuoso', P + 22, 104);
    // Mastery crest — a small accent seal after the wordmark (never green; omitted at rank 0 / XP-Off).
    try { const _cr = crestState(); if (_cr.rank) drawCrestCanvas(ctx, P + 22 + ctx.measureText('Virtuoso').width + 26, 90, 30, accent, _cr.rank); } catch (_) {}
    font(15, 700, HEAD); const pT = m.lane, pW = ctx.measureText(pT).width + 28, pX = W - P - pW;
    ctx.fillStyle = accentSoft; pill(pX, 72, pW, 34, 17); ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = 1.5; pill(pX, 72, pW, 34, 17); ctx.stroke();
    ctx.fillStyle = accent; ctx.fillText(pT, pX + 14, 95);
    // Eyebrow + hero
    ctx.fillStyle = accent; font(18, 700, HEAD); ctx.letterSpacing = '3px'; ctx.fillText(m.eyebrow.toUpperCase(), P, 212); ctx.letterSpacing = '0px';
    const heroMaxW = W - P * 2;
    let hs = 64; font(hs, 700, HEAD); if (ctx.measureText((m.heroGreen ? '✓ ' : '') + m.hero).width > heroMaxW) { hs = 50; font(hs, 700, HEAD); }
    let hx = P; const hy = 296;
    if (m.heroGreen) { ctx.fillStyle = GREEN; ctx.fillText('✓', hx, hy); hx += ctx.measureText('✓  ').width; font(hs, 700, HEAD); }
    ctx.fillStyle = TXT; ctx.fillText(_fitCanvasText(ctx, m.hero, heroMaxW - (hx - P)), hx, hy);
    if (m.sub) { ctx.fillStyle = DIM; font(23, 500); ctx.fillText(_fitCanvasText(ctx, m.sub, heroMaxW), P, hy + 42); }
    // Stats row — up to 6 even columns (note_detect parity): tracked display-face
    // labels + display-face, color-coded values. Green stays cleared-only (never a
    // stat), so the pop comes from the accent on TEMPO/BEST. No marketing footer —
    // the wordmark already brands the card.
    const cols = m.stats.slice(0, 6), sy = 470;
    const colW = cols.length ? (W - P * 2) / cols.length : 0;
    /** @param {string} label */
    const valColor = (label) => (label === 'TEMPO' || label === 'BEST') ? accent : (label === 'TIME' || label === 'DAY') ? MUT : TXT;
    cols.forEach((st, i) => {
      const cx = P + i * colW;
      ctx.fillStyle = MUT; font(12, 700, HEAD); ctx.letterSpacing = '1.5px'; ctx.fillText(st.label.toUpperCase(), cx, sy); ctx.letterSpacing = '0px';
      ctx.fillStyle = valColor(st.label); font(28, 700, HEAD); ctx.fillText(st.value, cx, sy + 42);
    });
    return cv;
  }
  // A safe "Virtuoso - <hero> - <date>.png" basename for the saved card (mirrors
  // note_detect's "Artist - Title - date.png" convention, adapted to practice).
  /** @param {import('./src/types/results-data.js').RunSummary | null} s */
  function shareCardFilename(s) {
    let what = 'Practice';
    try { const m = shareCardModel(s); what = (m && (m.hero || m.lane)) || what; } catch (_) {}
    const d = new Date();
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const invalidFilenameCharacters = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*']);
    return Array.from(`Virtuoso - ${what} - ${date}.png`, character => {
      const codePoint = character.codePointAt(0);
      return invalidFilenameCharacters.has(character) || codePoint < 0x20 ? '-' : character;
    }).join('');
  }
  // Save the card PNG to the user's configured folder via the local server route —
  // the save FOLDER is SHARED with note_detect (localStorage slopsmith_notedetect_save_dir),
  // so both plugins write their cards to the same place. Returns the server result,
  // or null when the route/server isn't there (caller falls back to a download).
  // auto=true preserves every take (the server never overwrites on a name clash).
  /** @param {HTMLCanvasElement | null} cv @param {import('./src/types/results-data.js').RunSummary | null} s @param {boolean} [auto] */
  async function saveCardToServer(cv, s, auto) {
    if (!cv) return null;
    let dir = ''; try { dir = localStorage.getItem('slopsmith_notedetect_save_dir') || ''; } catch (_) {}
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (!blob) return null;
    const q = `dir=${encodeURIComponent(dir)}&name=${encodeURIComponent(shareCardFilename(s))}${auto ? '&auto=1' : ''}`;
    try {
      const resp = await fetch(`/api/plugins/virtuoso_lab/save-card?${q}`, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: blob });
      if (!resp.ok) return null;
      const j = await resp.json().catch(() => null);
      return (j && j.ok) ? j : null;
    } catch (_) { return null; }
  }
  // Copy/download the owned card: image→clipboard
  // (Promise to keep the click activation) → download PNG → text.
  // Returns 'copied' | 'saved' | 'copied-text' | 'failed'.
  /** @param {import('./src/types/results-data.js').RunSummary | null} s @param {string} action */
  async function shareCardAction(s, action) {
    // Virtuoso renders its OWN verdict-led, skinned card — the ratified v0.1.4
    // decision (memory project_card_theme_skins): "KEEP our renderer, don't
    // consume note_detect's." The card is north-star IP and carries our skins
    // (Neon/Esports/Metal/Warm/Focus) + the mastery crest. The old delegation to
    // window.noteDetect.renderResultsCard is RETIRED here: whenever note_detect
    // was present it PREFERRED note_detect's renderer, which (a) drew its hero
    // accuracy from note_detect's own last-session counters — 0/0 under our
    // contained verifier, the "ACCURACY 0% · 0/0 notes hit" bug (same mechanism
    // as the v0.1.8 leak) — while our real numbers only reached the stats[] row,
    // and (b) suppressed every skin + the crest on desktop (the headless smoke
    // host lacks note_detect's card API, so the skin probes never exercised this
    // path). The unused private delegation adapters have been retired.
    // Ensure the active theme's display face is loaded before the canvas rasterizes
    // (the DOM card gets it via CSS font-display; the canvas needs it resident).
    await loadCardFonts();
    const cv = renderShareCardImage(s);
    const toBlob = () => new Promise(r => (/** @type {HTMLCanvasElement} */ (cv)).toBlob(r, 'image/png'));
    const download = async () => { const b = await toBlob(); if (!b) return false; const url = URL.createObjectURL(b); const a = document.createElement('a'); a.href = url; a.download = shareCardFilename(s); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); return true; };
    if (action === 'download') {
      // Save to the configured (shared) folder via the local server; fall back to a
      // browser download if the route/server isn't available.
      if (cv) { const saved = await saveCardToServer(cv, s, false); if (saved) return 'saved'; }
      if (cv && await download()) return 'saved';
    }
    else {
      try { if (cv && navigator.clipboard && window.ClipboardItem && window.isSecureContext) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': toBlob() })]); return 'copied'; } } catch (_) {}
      try { if (cv && await download()) return 'saved'; } catch (_) {}
    }
    try { await navigator.clipboard.writeText(shareCardText(s)); return 'copied-text'; } catch (_) {}
    return 'failed';
  }
  // The share-button row (Copy card + Download) — on every results surface, every run.
  function shareRowHtml() {
    return `<div class="virtuoso_lab-share-row">` +
      `<button type="button" class="virtuoso_lab-virtuoso_lab_vir-copy" data-act="copy-card" title="Copy a shareable card image to the clipboard">Copy card</button>` +
      `<button type="button" class="virtuoso_lab-virtuoso_lab_vir-copy" data-act="download-card" title="Save the card as a PNG to share">⤓ Save</button>` +
      `</div>`;
  }
  // Shared click logic for a Copy card / Save button (called from the modal + the
  // P-sheet card handlers — both pass the session the card describes).
  /** @param {HTMLElement} btn @param {import('./src/types/results-data.js').RunSummary | null} s */
  async function shareCardClick(btn, s) {
    if (!btn || !s) return;
    const res = await shareCardAction(s, btn.dataset.act === 'download-card' ? 'download' : 'copy');
    const label = res === 'copied' ? 'Copied ✓' : res === 'saved' ? 'Saved ✓' : res === 'copied-text' ? 'Copied text ✓' : 'Couldn’t copy';
    const orig = btn.textContent; btn.textContent = label;
    setTimeout(() => { if (btn.isConnected) btn.textContent = orig; }, 1600);
  }
  /** @param {import('./src/types/results-data.js').SessionLog} session */
  function advancePathwayTier(session) {
    const total = (session.hit_count || 0) + (session.miss_count || 0);
    // Below PT_MIN_JUDGED the evidence can't grade — lenient self-confirm,
    // same as mic-less (the modal discloses the sparse-evidence advance).
    const accurate = total < PT_MIN_JUDGED || (session.hit_count || 0) / total >= 0.65;
    if (!accurate) return null;
    if (session.mode === 'pathway' && session.pathway_id && PATHWAYS[session.pathway_id]) {
      if (PATHWAYS[session.pathway_id].practiceFile && (session.authoredPractice?.pathwayId !== session.pathway_id || session.authoredPractice.tierIndex !== session.bpm_tier)) return null;
      // Proof-loop settling-tax (flagged, pilot only): clear only on a run that HELD
      // the standard. Off / non-pilot → unchanged behavior.
      if (proofPilot(session.pathway_id) && !proofHeld(session)) return null;
      const tier = session.bpm_tier;
      if (tier != null && tier >= 0) return _updatePathwayTier(session.pathway_id, tier);
    }
    if (session.mode === 'custom' && session.bpm != null) {
      for (const [pwId, pw] of Object.entries(PATHWAYS)) {
        if (pw.practiceFile) continue; // Authored lessons require run-bound identity, never fuzzy BPM credit.
        const tiers = pw.tempoTiers || [];
        let matchedTier = -1;
        tiers.forEach((t, i) => { if (Math.abs((/** @type {number} */ (session.bpm)) - t) <= 5) matchedTier = Math.max(matchedTier, i); });
        if (matchedTier >= 0) {
          const r = _updatePathwayTier(pwId, matchedTier);
          if (r) return r;
        }
      }
    }
    return null;
  }
  // ── End pathway tier progress ───────────────────────────────────────────────

  // ── Per-block CREDIT (engagement Tier A — the earned ✓ "proved") ────────────
  // A WORKOUT block flips the SAME pathway tier a solo Ladder run would — but ONLY
  // through a CONSERVATIVE front door (L&D mapping ruling project_workout_perblock_
  // credit_mapping), never the fuzzy bpm-match (which would credit a generic block
  // to whatever rung shares a tempo). Predicate, ALL must hold:
  //   1. the source SEGMENT_TEMPLATE carries an authored `creditsPathway` (the
  //      curatorial "this block IS this rung's drill"); no tag → "practiced" only;
  //   2. its role is credit-eligible + its kind isn't an excluded primitive;
  //   3. STRICT evidence in the block's window — ≥PT_MIN_JUDGED judged AND ≥65% hit
  //      (the lenient mic-less self-confirm a solo run allows is FORBIDDEN per-block
  //      — this clamp is the anti-inflation spine AND makes the bass caveat self-
  //      enforce: a felt/sub-floor block can't muster 8 judged units, so it never
  //      flips, only logs "practiced");
  //   4. credited tier = the highest tempoTier the block's bpm meets (below tier 0
  //      → practiced only; never skip-credit);
  //   5. ONE ledger (pathway_tiers via _updatePathwayTier — idempotent, flips only
  //      an UNcleared rung), tier flips ONLY, NO per-block XP (XP is session-level,
  //      once per sitting), zero bonus. Returns the flip {pathwayId,…} or null.
  const CREDIT_ROLES = new Set(['technique', 'scale_arp', 'application', 'review']);
  const CREDIT_KIND_EXCLUDE = new Set(['chromatic', 'modal_vamp']);
  /** @param {string | null | undefined} templateId @param {number | null | undefined} bpm @param {{hits: number, judged: number} | null} score */
  function creditBlockTier(templateId, bpm, score) {
    const tmpl = templateId ? SEGMENT_TEMPLATES[templateId] : null;
    if (!tmpl || !tmpl.creditsPathway) return null;                      // (1) no tag → practiced only
    if (!CREDIT_ROLES.has(tmpl.role) || CREDIT_KIND_EXCLUDE.has(tmpl.kind)) return null;   // (2)
    const pw = PATHWAYS[tmpl.creditsPathway]; if (!pw) return null;
    if (!score || score.judged < PT_MIN_JUDGED || (score.hits / score.judged) < 0.65) return null;   // (3) strict, no lenient path
    const tiers = pw.tempoTiers || []; let tier = -1;                     // (4) bpm-reached tier
    tiers.forEach((t, i) => { if ((bpm || 0) >= t) tier = i; });
    if (tier < 0) return null;
    if (proofPilot(tmpl.creditsPathway) && !proofHeld({ bpm, hit_count: score.hits, miss_count: Math.max(0, score.judged - score.hits) })) return null;
    const r = _updatePathwayTier(tmpl.creditsPathway, tier);             // (5) one ledger, idempotent
    return r ? { pathwayId: tmpl.creditsPathway, pathwayLabel: pw.label, tier, tierName: TIER_LABELS[tier] || ('Tier ' + (tier + 1)) } : null;
  }
  // Per-block FELT analysis (the felt-hold finisher — roundtable "per-block
  // felt-credit"): when a Workout block's source template credits a feltGate
  // pathway, the %-gate above is the wrong judge — a bass feel block can rarely
  // (sub-floor: never) muster ≥65% of ≥8 judged, so the 'Walking bass' template
  // could never credit. Analysis only (NO ledger write — the seam caption calls
  // this mid-run): same authored-tag + role/kind eligibility as creditBlockTier,
  // evidence = THIS block's own _ptDevs slice at the block's own barSec (the
  // per-block desync rule applied to felt). The felt evidence gate (≥12 credited
  // onsets, ≥4 continuous bars) stays the anti-inflation spine — a silent or
  // sub-floor block reads verdict null and stays "practiced". Returns
  // { pwId, felt } | null (null = not a felt block → fall through to the %-gate).
  // devsOpt: test seam — the harness passes a synthetic dev vector; live callers
  // omit it (the run's _ptDevs).
  /** @param {import('./src/core/session-types.js').SegmentBound | null} b @param {import('./src/types/results-data.js').TimingDeviation[]} [devsOpt] */
  function blockFeltInfo(b, devsOpt) {
    if (!b) return null;
    const tmpl = b && b.templateId ? SEGMENT_TEMPLATES[b.templateId] : null;
    if (!tmpl || !tmpl.creditsPathway) return null;
    const pw = PATHWAYS[tmpl.creditsPathway];
    if (!pw || !pw.feltGate) return null;
    if (!CREDIT_ROLES.has(tmpl.role) || CREDIT_KIND_EXCLUDE.has(tmpl.kind)) return null;
    const devs = (devsOpt || _ptDevs).filter(x => x.t >= b.start - 1e-3 && x.t < b.end + 1e-3);
    return { pwId: tmpl.creditsPathway, felt: feltHoldAnalyze(devs, { barSec: b.barSec }) };
  }
  // Startup integrity guard (mirrors validateSegmentTemplates / the anchor guard) —
  // throws at LOAD if a `creditsPathway` tag is mis-authored, so a bad mapping can
  // never ship a false flip: the target must be a real PATHWAYS id, the role must be
  // credit-eligible (a tagged warmup/cooldown/jam is a contradiction), the kind must
  // not be an excluded primitive.
  (function assertCreditTagsValid() {
    for (const [id, t] of Object.entries(SEGMENT_TEMPLATES)) {
      if (!t.creditsPathway) continue;
      if (!PATHWAYS[t.creditsPathway]) throw new Error(`[Virtuoso credit-tag] ${id}: creditsPathway "${t.creditsPathway}" is not a PATHWAYS id`);
      if (!CREDIT_ROLES.has(t.role)) throw new Error(`[Virtuoso credit-tag] ${id}: role "${t.role}" cannot credit (warmup/cooldown/jam never flip)`);
      if (CREDIT_KIND_EXCLUDE.has(t.kind)) throw new Error(`[Virtuoso credit-tag] ${id}: kind "${t.kind}" cannot credit a flip`);
    }
  })();

  // ── Depth Ladder + XP (virtuoso_lab.progress) — Phase 8 ───────────────────────
  // The second mastery axis ABOVE the shipped Speed Climb (pathway_tiers). Locked
  // design: gamification-architect project_replay_depth_ladder_xp_verdict +
  // project_refresh_variety_loop_verdict. A reward is a gained-only false→true flip
  // on a real artifact — NEVER a rep counter or a stored level. XP is a DERIVED
  // time×difficulty readout, never spent, never gates. SELF-AUDIT LINES TO HOLD:
  //   • Travel/Clean rungs are BINARY false→true per distinct context — never a
  //     "keys 7/12" grind bar or a "% tight" number.
  //   • Off mode collapses the whole layer (no xp/depth/emit) — the standing proof
  //     it never gates.
  //   • Nothing is ever shown LOST; reps stay a silent stat; no scores/ranks/combos.
  // Speed stays in pathway_tiers (NOT duplicated); nodeProgressState reads both.
  const PROGRESS_KEY = 'virtuoso_lab.progress';
  function progressLoad() {
    try {
      const o = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
      o.byNode = o.byNode || {};
      o.goldImprov = (o.goldImprov && typeof o.goldImprov === 'object') ? o.goldImprov : {};
      if (o.mode !== 'off' && o.mode !== 'hardcore') o.mode = 'casual';
      if (typeof o.xp !== 'number') o.xp = 0;
      return o;
    } catch { return { mode:'casual', xp:0, byNode:{} }; }
  }
  /** @param {object} o */
  function progressSave(o) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(o)); }
    catch (e) { console.warn('[Virtuoso] progress save failed', e); }
  }
  /** @param {{byNode: Record<string, import('./src/types/progress-data.js').ProgressNode>}} o @param {string} id */
  function progressNode(o, id) {
    return o.byNode[id] || (o.byNode[id] = { reps:0, depth:{ travel:null, clean:null, eyesOff:null }, masteredAt:null, keysCleared:[] });
  }
  /** @param {string} mode */
  function progressSetMode(mode) {
    if (mode !== 'off' && mode !== 'casual' && mode !== 'hardcore') return;
    const o = progressLoad(); o.mode = mode; progressSave(o);
  }
  // Outbound host-XP seam — mirrors the shipped virtuoso_lab:tier:unlocked emit. No-op
  // until the host subscribes; the internal store NEVER depends on it. (The host's
  // actual XP-intake surface is for feedback-compatibility to verify when the live
  // hook lands; this only defines the outbound shape.)
  /** @param {string} kind @param {string | null} nodeId @param {object} [extra] */
  function emitProgress(kind, nodeId, extra) {
    const bus = hostBus();
    if (bus && typeof bus.emit === 'function') {
      try { bus.emit('virtuoso_lab:progress', Object.assign({ source:'virtuoso_lab', kind, nodeId, at:Date.now() }, extra || {})); } catch (_) {}
    }
  }
  // A run is "clean" by the same signal the Speed climb uses (≥65% of judged notes
  // hit); when scoring is ABSENT it's lenient/self-confirm true — matching
  // advancePathwayTier, so the rung still advances where the host has no pitch input
  // (the player owns the gate; consistent with gained-only/never-gates).
  // PT_MIN_JUDGED (L&D ruling, 2026-06-06 feel panel): below 8 judged units the
  // evidence is too sparse to GRADE — degrade to the same lenient self-confirm
  // path as mic-less (sparse evidence = no evidence, not weak evidence); the
  // results modal discloses it. One constant, every gate consumer.
  const PT_MIN_JUDGED = 8;
  /** @param {Pick<import('./src/types/results-data.js').SessionLog, 'hit_count' | 'miss_count'>} session */
  function runIsClean(session) {
    const total = (session.hit_count || 0) + (session.miss_count || 0);
    return total < PT_MIN_JUDGED || (session.hit_count || 0) / total >= 0.65;
  }
  // XP difficulty multiplier — gently weights the tempo tier, never penalizes easy
  // play (floor 1.0). The time base means a maxed exercise keeps earning for PLAYING.
  /** @param {Pick<import('./src/types/results-data.js').SessionLog, 'bpm_tier'>} session */
  function xpDifficultyMult(session) {
    const tier = Math.max(0, session.bpm_tier != null ? session.bpm_tier : 0);
    return 1 + tier * 0.25;   // Slow 1.0 → Push 1.75
  }
  // Depth Ladder + XP advance — parallel to advancePathwayTier(), called from
  // sessionEnd. Accrues derived XP, and credits the TRAVEL axis when a pathway whose
  // Speed climb is already cleared gets a clean Push pass in a not-yet-credited key
  // (this is how a refresh-into-a-new-key "makes it count" — the session records the
  // refreshed key, we credit it here). Returns a gained-only summary, or null.
  /** @param {import('./src/types/results-data.js').SessionLog} session */
  function advanceDepthLadder(session) {
    const store = progressLoad();
    if (store.mode === 'off') return null;                    // Off collapses the layer
    /** @type {import('./src/types/results-data.js').DepthGain} */
    const out = { xpGained:0, travelKey:null, travelRung:false, cleanRung:false };
    const pwId = session.pathway_id;
    // XP — derived time×difficulty, gained-only (accrues for any run, pathway or not).
    const gained = Math.round(Math.max(0, (session.duration_ms || 0) / 1000) * xpDifficultyMult(session));
    if (gained > 0) { store.xp += gained; out.xpGained = gained; emitProgress('xp', pwId || null, { amount: gained }); }
    // Depth rungs apply only to a known pathway whose Speed axis is already cleared.
    if (pwId && PATHWAYS[pwId] && (!PATHWAYS[pwId].practiceFile || (session.authoredPractice?.pathwayId === pwId && session.authoredPractice.tierIndex === session.bpm_tier))) {
      const node = progressNode(store, pwId);
      node.reps = (node.reps || 0) + 1;                       // silent stat — advances NOTHING
      const topTier = (PATHWAYS[pwId].tempoTiers || []).length - 1;
      const speedCleared = topTier >= 0 && (pathwayTiersLoad()[pwId] || { highest_tier:-1 }).highest_tier >= topTier;
      // Travel credits the NOMINAL key (the rung's coded key) when the run was
      // tuning-adapted — fingering identity, so a player who retunes and replays
      // the same shapes can't re-credit them under a new concert name.
      const creditKey = session.key_credit || session.key;
      if (speedCleared && session.bpm_tier === topTier && runIsClean(session) && creditKey && !node.keysCleared.includes(creditKey)) {
        node.keysCleared.push(creditKey);                     // binary false→true per distinct key — no double-credit, tier held
        emitProgress('depth', pwId, { axis:'travel', key: creditKey });
        out.travelKey = creditKey;
        // The Travel RUNG fills once portability is proven (a 2nd distinct key) — a
        // one-time flip, never a keys-N/12 grind bar.
        if (!node.depth.travel && node.keysCleared.length >= 2) {
          node.depth.travel = Date.now(); out.travelRung = true;
          emitProgress('depth', pwId, { axis:'travel', rung:true });
        }
      }
      // CLEAN rung (hand-marks Slice 2 — the player-opted supports-off proving
      // run): a clean top-tier pass with the Fingering pill OFF for the whole
      // run (off at sessionBegin AND still off now). Same bar as Travel
      // (speed cleared + top tier + clean); one-time flip, gained-only.
      if (speedCleared && session.bpm_tier === topTier && runIsClean(session)
          && session.hand_marks_on === false && !handMarksOn() && !node.depth.clean) {
        node.depth.clean = Date.now(); out.cleanRung = true;
        emitProgress('depth', pwId, { axis:'clean', rung:true });
      }
    }
    progressSave(store);
    return (out.xpGained || out.travelKey || out.cleanRung) ? out : null;
  }
  // ── End depth ladder ────────────────────────────────────────────────────────

  // ── XP LEVEL + competency BADGES (engagement Tier C) ────────────────────────
  // The purity-flex SPEND (gamification: the closest the layer gets to the cynical
  // line) — kept deliberately UNDERSTATED and entirely behind the XP-Off switch.
  // Two surfaces, both READOUTS of artifacts that already exist, never new currency:
  //   • a visible LEVEL = a legible skill-tier name derived from the accumulated XP
  //     (time-on-instrument × difficulty — already accrued by advanceDepthLadder).
  //     XP stays derived / never-spent / never-gates; the level just makes the climb
  //     legible. NOT a featured headline — its home is the woodshed/P-sheet (STATE);
  //     a level-up shows in the run-end modal only as a quiet ambient delta (W0/W1).
  //   • collectible BADGES = one-time false→true markers for real competency EVENTS
  //     (a rung cleared, Push reached, a skill that travels, a supports-off pass),
  //     computed PURELY from the gained-only stores (pathway_tiers + progress.byNode).
  //     They name SKILLS, never rounds/time/attendance (showing-up ≠ a badge), so a
  //     badge is never lost and never farmable — the only way to earn one is to play
  //     better. NO leaderboard, NO rank, NO RNG. Off mode collapses both.
  const WOODSHED_LEVELS = [
    { at: 0,      name: 'First Steps' },
    { at: 1500,   name: 'Picking It Up' },
    { at: 5000,   name: 'Woodshedder' },
    { at: 12000,  name: 'Regular' },
    { at: 25000,  name: 'Journeyman' },
    { at: 45000,  name: 'Roadworn' },
    { at: 75000,  name: 'Seasoned' },
    { at: 120000, name: 'Veteran' },
    { at: 180000, name: 'Old Hand' },
    { at: 300000, name: 'Lifer' },
  ];
  /** @param {number | null | undefined} xp */
  function xpLevelInfo(xp) {
    xp = Math.max(0, xp || 0);
    let idx = 0;
    for (let i = 0; i < WOODSHED_LEVELS.length; i++) if (xp >= WOODSHED_LEVELS[i].at) idx = i;
    const cur = WOODSHED_LEVELS[idx], next = WOODSHED_LEVELS[idx + 1] || null;
    return {
      level: idx + 1, name: cur.name, xp, at: cur.at,
      nextName: next ? next.name : null, nextAt: next ? next.at : null,
      into: xp - cur.at, span: next ? (next.at - cur.at) : 0,
    };
  }
  // Competency badges — every test reads ONLY the gained-only artifact stores, so
  // the set is a pure function of real competency (no rep/time/streak inputs).
  /** @type {{id: string, name: string, desc: string, test: (context: ReturnType<typeof badgeContext>) => boolean}[]} */
  const BADGES = [
    { id: 'first_clear', name: 'On the Board',   desc: 'Cleared your first tempo rung.',          test: (c) => c.clearedPathways >= 1 },
    { id: 'push',        name: 'Up to Speed',    desc: 'Reached Push — the top rung — on a skill.', test: (c) => c.pushPathways >= 1 },
    { id: 'travels',     name: 'It Travels',     desc: 'Held a skill clean in a second key.',      test: (c) => c.anyTravel },
    { id: 'clean',       name: 'Clean Hands',    desc: 'A supports-off clean pass.',               test: (c) => c.anyClean },
    { id: 'breadth',     name: 'Broad Strokes',  desc: 'Cleared a rung on five different skills.',  test: (c) => c.clearedPathways >= 5 },
    { id: 'polyglot',    name: 'Well-Traveled',  desc: 'Carried your skills into five keys.',       test: (c) => c.totalKeys >= 5 },
    { id: 'in_pocket',   name: 'In the Pocket',  desc: 'Held a bass groove Locked in the pocket.',  test: (c) => c.anyFelt },
  ];
  function badgeContext() {
    const pt = pathwayTiersLoad(), store = progressLoad(), byNode = store.byNode || {};
    let clearedPathways = 0, pushPathways = 0, totalKeys = 0, anyTravel = false, anyClean = false, anyFelt = false;
    for (const id of Object.keys(pt)) {
      if (!PATHWAYS[id]) continue;
      const hi = pt[id].highest_tier ?? -1;
      if (hi >= 0) clearedPathways++;
      const top = (PATHWAYS[id].tempoTiers || []).length - 1;
      if (top >= 0 && hi >= top) pushPathways++;
      if (pt[id].feltBpm) anyFelt = true;   // a bass groove held Locked
    }
    for (const id of Object.keys(byNode)) {
      const n = byNode[id] || {};
      totalKeys += (n.keysCleared || []).length;
      if (n.depth && n.depth.travel) anyTravel = true;
      if (n.depth && n.depth.clean) anyClean = true;
    }
    return { clearedPathways, pushPathways, totalKeys, anyTravel, anyClean, anyFelt };
  }
  function computeBadges() {
    const c = badgeContext();
    return BADGES.filter(b => { try { return b.test(c); } catch (_) { return false; } }).map(b => b.id);
  }
  /** @param {string} id */
  const badgeMeta = (id) => { const b = BADGES.find(x => x.id === id); return { id, name: b ? b.name : id, desc: b ? b.desc : '' }; };
  // Persist earned badges (gained-only) + return the NEW-this-run diff. Null in Off
  // mode (the layer is collapsed). Called from sessionEnd AFTER the tier/depth stores
  // are updated, so this run's competency is reflected.
  function creditBadges() {
    const store = progressLoad();
    if (store.mode === 'off') return null;
    store.badges = store.badges || {};
    const fresh = [];
    for (const id of computeBadges()) if (!store.badges[id]) { store.badges[id] = Date.now(); fresh.push(id); }
    if (fresh.length) progressSave(store);
    return { newBadges: fresh.map(badgeMeta), all: Object.keys(store.badges).map(badgeMeta) };
  }

  // ── Mastery CREST — earned-standing emblem (Proven → Versed → Fluent) ──────────
  // Gamification-ratified: a DERIVED, additive view of competency already earned — never a
  // new grind currency, never a count shown, never gated, never expiring. Rank is monotonic
  // (latched high-water — a downgradeable crest in the always-visible chip would be
  // loss-aversion, forbidden). XP-Off → rank 0 (no crest). The descriptor names the SKILL
  // built, never the tally. The three routes to each rank (badges / depth rungs / breadth)
  // are parallel by design — no per-badge weighting (that would smuggle in a hidden score).
  /** @type {Record<number, {label: string, desc: string}>} */
  const CREST_META = {
    1: { label: 'Proven', desc: 'You’ve proven your first real skill.' },
    2: { label: 'Versed', desc: 'You’re versed across several skills.' },
    3: { label: 'Fluent', desc: 'Broad command across the map.' },
  };
  function crestRankCompute() {
    const store = progressLoad();
    if (store.mode === 'off') return 0;
    const bc = badgeContext();
    const badgeCount = Object.keys(store.badges || {}).length;
    let masteredRungs = 0;
    const byNode = store.byNode || {};
    for (const id of Object.keys(byNode)) {
      const n = byNode[id] || {}, d = n.depth || {};
      if (d.travel || d.clean || d.eyesOff || n.masteredAt) masteredRungs++;
    }
    let rank = 0;
    if (badgeCount >= 1 || masteredRungs >= 1) rank = 1;
    if (badgeCount >= 3 || bc.pushPathways >= 1 || masteredRungs >= 3) rank = 2;
    if (bc.clearedPathways >= 5 || badgeCount >= 6 || bc.pushPathways >= 3) rank = 3;
    return rank;
  }
  // Displayed rank = monotonic high-water of the derived rank.
  function crestState() {
    const store = progressLoad();
    if (store.mode === 'off') return { rank: 0, label: '', desc: '' };
    const rank = Math.max(crestRankCompute(), store.crestRank || 0);
    return Object.assign({ rank }, rank ? CREST_META[rank] : { label: '', desc: '' });
  }
  // Persist the high-water AFTER the run's competency is credited; return whether it ROSE
  // (the earn-moment trigger). Called from sessionEnd after creditBadges/advanceDepthLadder.
  function crestCommit() {
    const store = progressLoad();
    if (store.mode === 'off') return { rank: 0, rose: false };
    const prev = store.crestRank || 0;
    const rank = Math.max(crestRankCompute(), prev);
    if (rank > prev) { store.crestRank = rank; progressSave(store); return { rank, rose: true }; }
    return { rank, rose: false };
  }
  // The emblem — an aegis/laurel that elaborates by rank (accent-family via currentColor;
  // NEVER --virtuoso_lab_vir-meter). Rank 1 hollow aegis + spark · 2 filled + laurel sprigs · 3 full wreath.
  const CREST_STAR = '<path d="M12 6l1.3 3.3 3.6.2-2.8 2.3 1 3.5-3.1-2-3.1 2 1-3.5L7.1 9.5l3.6-.2z" fill="currentColor"/>';
  const CREST_SHIELD = 'M12 2.4l7 2.5v5.3c0 4.6-2.9 8.1-7 10.4-4.1-2.3-7-5.8-7-10.4V4.9z';
  /** @param {number} rank */
  function crestSvg(rank) {
    if (!rank) return '';
    let inner = '';
    if (rank === 1) {
      inner = `<path d="${CREST_SHIELD}" fill="none" stroke="currentColor" stroke-width="1.5"/>` + CREST_STAR;
    } else if (rank === 2) {
      inner = `<path d="${CREST_SHIELD}" fill="currentColor" fill-opacity="0.20" stroke="currentColor" stroke-width="1.5"/>`
        + CREST_STAR
        + '<g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M5.5 17.6c1.7.2 3 1.1 3.7 2.6"/><path d="M18.5 17.6c-1.7.2-3 1.1-3.7 2.6"/></g>';
    } else {
      inner = '<g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M11 21.4C6.6 20.7 3.6 17 3.7 12.3c1.9 1 3.4 2.6 4.2 4.6"/>'
        + '<path d="M13 21.4c4.4-.7 7.4-4.4 7.3-9.1-1.9 1-3.4 2.6-4.2 4.6"/>'
        + '<path d="M4.4 9.6c1.8.3 3.2 1.3 4.2 2.8"/><path d="M19.6 9.6c-1.8.3-3.2 1.3-4.2 2.8"/></g>'
        + CREST_STAR;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
  }
  // Canvas twin for the copy-card PNG (same paths → same emblem). color = accent (never green).
  /** @param {CanvasRenderingContext2D} ctx @param {number} cx @param {number} cy @param {number} size @param {string} color @param {number} rank */
  function drawCrestCanvas(ctx, cx, cy, size, color, rank) {
    if (!rank || typeof Path2D === 'undefined') return;
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(size / 24, size / 24); ctx.translate(-12, -12);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const shield = new Path2D(CREST_SHIELD);
    if (rank >= 2) { ctx.globalAlpha = 0.20; ctx.fill(shield); ctx.globalAlpha = 1; }
    if (rank <= 2) { ctx.lineWidth = 1.5; ctx.stroke(shield); }
    if (rank >= 3) {
      ctx.lineWidth = 1.35;
      ['M11 21.4C6.6 20.7 3.6 17 3.7 12.3c1.9 1 3.4 2.6 4.2 4.6',
       'M13 21.4c4.4-.7 7.4-4.4 7.3-9.1-1.9 1-3.4 2.6-4.2 4.6',
       'M4.4 9.6c1.8.3 3.2 1.3 4.2 2.8', 'M19.6 9.6c-1.8.3-3.2 1.3-4.2 2.8'].forEach(d => ctx.stroke(new Path2D(d)));
    } else if (rank >= 2) {
      ctx.lineWidth = 1.3;
      ctx.stroke(new Path2D('M5.5 17.6c1.7.2 3 1.1 3.7 2.6'));
      ctx.stroke(new Path2D('M18.5 17.6c-1.7.2-3 1.1-3.7 2.6'));
    }
    ctx.fill(new Path2D('M12 6l1.3 3.3 3.6.2-2.8 2.3 1 3.5-3.1-2-3.1 2 1-3.5L7.1 9.5l3.6-.2z'));
    ctx.restore();
  }
  // Paint the header-chip crest (leading child of #virtuoso_lab-progress-strip). rose=true adds
  // the one-shot earn-bloom (Lit only; RM/Calm just show the new rank). Hidden at rank 0.
  /** @param {boolean} [rose] */
  function syncCrest(rose) {
    const el = $('virtuoso_lab-crest'); if (!el) return;
    const st = crestState();
    if (!st.rank) { el.hidden = true; el.innerHTML = ''; el.className = 'virtuoso_lab-crest'; el.removeAttribute('title'); return; }
    el.innerHTML = crestSvg(st.rank);
    el.className = 'virtuoso_lab-crest cr-rank-' + st.rank + (rose ? ' cr-earned' : '');
    el.title = st.label + ' — ' + st.desc;
    el.hidden = false;
    if (rose) { try { el.addEventListener('animationend', () => el.classList.remove('cr-earned'), { once: true }); } catch (_) {} }
  }

  function sessionBegin() {
    const isSessionMode = $('virtuoso_lab-root')?.classList.contains('virtuoso_lab-session-mode');
    let mode, pathway_id, /** @type {number | null} */ bpm, bpm_tier, scale, key, practice_type;
    // Tuning-adapt credit fields (panel 2026-06-05): `key` stays CONCERT (what
    // sounded — display honesty); key_credit = the rung's nominal key (what
    // Travel credits — a retune + replay of the same fingering must not
    // double-credit); tuning_offset logged so a stricter distinctness rule
    // stays possible later without data loss (learning-design's hedge).
    let key_credit = null, tuning_offset = 0;

    if (isSessionMode) {
      mode = 'session';
      pathway_id = workoutEditor.selectedId || null;
      bpm = null; bpm_tier = null;
      const firstSeg = activeBundle?.session?.segments?.[0]?.config;
      scale = firstSeg?.scale || null;
      key   = firstSeg?.key   || null;
      key_credit = key;
      practice_type = 'session';
    } else {
      const cfg = activeBundle?.config || readConfig();
      const authored = cfg.practicePathwayCredit;
      const pathwayId = authored?.pathwayId || cfg.practicedPathwayId || 'custom';
      mode = pathwayId === 'custom' ? 'custom' : 'pathway';
      pathway_id = mode === 'pathway' ? pathwayId : null;
      bpm = cfg.bpm;
      scale = cfg.scale;
      key   = cfg.key;
      // Anchor rungs credit the STATION ('open'/'fret 5' — fingering identity);
      // adapted keyed rungs credit the nominal key; everything else the key.
      key_credit = (mode === 'pathway' && cfg.anchorStation) ? cfg.anchorStation
                 : (mode === 'pathway' && cfg.keyNominal) ? cfg.keyNominal : cfg.key;
      tuning_offset = (mode === 'pathway' && cfg.tuningOffset) ? cfg.tuningOffset : 0;
      practice_type = cfg.practiceType || cfg.mode || 'scale';
      // Tier = index of highest tempoTier the current BPM meets or exceeds
      bpm_tier = null;
      if (mode === 'pathway' && PATHWAYS[pathwayId]) {
        const tiers = PATHWAYS[pathwayId].tempoTiers;
        bpm_tier = authored ? authored.tierIndex : tiers.reduce((best, t, i) => /** @type {number} */ (bpm) >= t ? i : best, 0);
      }
    }

    const now = Date.now();
    _activeSession = {
      id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
      date: localDateStr(),
      ts: now, mode, pathway_id, bpm, bpm_tier, scale, key, key_credit, tuning_offset, practice_type,
      authoredPractice:activeBundle?.config?.practicePathwayCredit ? { ...activeBundle.config.practicePathwayCredit } : null,
      // Share-card fields (additive): the progression (Jam "form") + the Jam style label.
      progression: (activeBundle && activeBundle.config && activeBundle.config.progression) || null,
      style: (() => { try { return isJamMode() ? ((document.querySelector('#virtuoso_lab-jam-styles .virtuoso_lab-jam-style.active') || {}).textContent || '').trim() : null; } catch (_) { return null; } })(),
      // Hand-marks state at run start (Clean depth rung: a supports-off proving
      // run needs the marks OFF for the whole run — checked again at credit).
      hand_marks_on: handMarksOn(),
      // content_ms = the exercise's MUSIC length (bars × measureSeconds), for the
      // proof-loop settling-tax (did the run HOLD, vs bail in the first phrase). NOT
      // songInfo.duration — that's inflated by the count-in lead + the lookahead tail,
      // which would make the settling-tax absurdly strict. Falls back for sessions.
      content_ms: (() => {
        const c = activeBundle?.config;
        if (c && c.bars && c.meter && c.meter.denominator) { try { return Math.round(c.bars * measureSeconds(c) * 1000); } catch (_) {} }
        return Math.round((activeBundle?.songInfo?.duration || 0) * 1000);
      })(),
      duration_ms: 0, hit_count: 0, miss_count: 0,
      // Jam is a MIRROR, never a judge: flag at begin so the deliberate-end path
      // can suppress the graded results modal (panel finding 2026-06-06 — Jam's
      // Stop was leaking a judged-% modal through the custom-mode path).
      jam: isJamMode()
    };
    _sessionStartMs = performance.now();
  }

  // Per-block MEASUREMENT (engagement Tier A): bucket the run's settled scoring
  // windows by which segment they fall in → per-block hits (credited units) +
  // judged (units whose window fully passed = the denominator). A looped run
  // judged the whole chart; a partial run only up to where it reached. Pure read
  // of _ptWin + segmentBounds; target-independent. Feeds the recap chapters.
  /** @param {import('./src/core/session-types.js').SegmentBound[]} sb */
  function perBlockScore(sb) {
    const out = sb.map(() => ({ hits: 0, judged: 0 }));
    /** @param {number} t */
    const findBlock = (t) => { for (let i = 0; i < sb.length; i++) if (t >= sb[i].start - 1e-3 && t < sb[i].end + 1e-3) return i; return -1; };
    const maxJudge = _runLooped ? Infinity : (transport.time - ptLatency());
    for (const w of _ptWin) {
      const bi = findBlock(w.t); if (bi < 0) continue;
      const units = w.span ? 1 : (w.notes ? w.notes.length : 1);
      if (w.matchEnd <= maxJudge) out[bi].judged += units;
      if (w.credited) out[bi].hits += units;
    }
    return out;
  }

  // ── Scorecard hero snapshots (run-end panel 2026-06-12) ─────────────────────
  // Read the judge's own truth (_ptWin: every judged note + its credited flag)
  // into plain data the results modal can draw AFTER teardown. Misses count only
  // when the run had input (the miss-gem rule — an idle mic never paints
  // attention); chart notes the judge never windowed (bends/legato/muted/
  // sub-floor/chords-on-YIN) become hollow "not judged" cells so the map never
  // lies about coverage (the instrument lanes' honesty rules).
  function ptHeatSnapshot() {
    if (!_ptWin.length || !activeBundle) return null;
    /** @type {Map<string, import('./src/types/results-data.js').HeatCell>} */
    const cells = new Map();
    /** @param {number} s @param {number} f */
    const cellOf = (s, f) => { const k = s + '|' + f; let c = cells.get(k); if (!c) { c = { s, f, hit: 0, miss: 0, ex: 0 }; cells.set(k, c); } return c; };
    const windowed = new Set();
    const /** @type {Record<string, number>} */ fgMiss = {}, /** @type {Record<string, number>} */ transMiss = {};
    let missTotal = 0, fgMissN = 0, /** @type {number | null} */ prevS = null;
    const wins = _ptWin.slice().sort((a, b) => a.t - b.t);
    for (const w of wins) {
      for (const n of (w.notes || [])) {
        windowed.add(ptKey(n));
        const c = cellOf(n.s, n.f);
        if (w.credited) c.hit++;
        else if (_ptHadInput) {
          c.miss++; missTotal++;
          // The guitar-lane diagnostics: misses by FINGER (names a mechanic) and
          // by string transition (crossing weakness) — surfaced as ONE quiet
          // text row, never extra paint on the map.
          if (n.fg !== undefined && n.fg >= 1 && n.fg <= 4) { fgMiss[n.fg] = (fgMiss[n.fg] || 0) + 1; fgMissN++; }
          if (prevS != null && prevS !== n.s) { const k = prevS + '>' + n.s; transMiss[k] = (transMiss[k] || 0) + 1; }
        }
      }
      const last = (w.notes || [])[(w.notes || []).length - 1];
      if (last) prevS = last.s;
    }
    for (const n of (activeBundle.notes || [])) {
      if (n._tail || windowed.has(ptKey(n))) continue;
      cellOf(n.s, n.f).ex++;
    }
    return { cells: [...cells.values()], opens: (activeBundle.openMidis || []).slice(), missTotal, fgMiss, fgMissN, transMiss };
  }
  // Per-bar timing-lean strip data (the groove-rung hero; the bass grammar:
  // per-BAR medians only — per-note early/late marks train click-chasing, vetoed).
  function ptLeanBarsSnapshot() {
    if (_ptDevs.length < 16 || !activeBundle) return null;
    const cfg = (activeBundle.config && activeBundle.config.meter && activeBundle.config.bpm) ? activeBundle.config : null;
    if (!cfg) return null;
    const meas = measureSeconds(cfg), lead = activeBundle.leadIn || 0;
    if (!(meas > 0)) return null;
    /** @type {Map<number, number[]>} */
    const byBar = new Map();
    for (const x of _ptDevs) {
      const b = Math.max(0, Math.floor((x.t - lead) / meas + 1e-6));
      if (!byBar.has(b)) byBar.set(b, []);
      (/** @type {number[]} */ (byBar.get(b))).push(x.d * 1000);
    }
    /** @param {number[]} a */
    const med = a => a[Math.floor(a.length / 2)];
    const bars = [...byBar.entries()].sort((a, b) => a[0] - b[0]).map(([i, ds]) => {
      ds.sort((a, b) => a - b);
      const jit = ds.length > 1 ? ds[Math.floor(ds.length * 0.75)] - ds[Math.floor(ds.length * 0.25)] : 0;
      return { i, lean: Math.round(med(ds)), jit: Math.round(jit), n: ds.length };
    });
    // The bass secondary stat: lean on the FIRST onset after each chord change —
    // where the pocket actually breaks (the ear jumps to the new root, the hand
    // pushes). chart.timeline is UNshifted by the count-in; note times are.
    let chg = null;
    const tl = activeBundle.timeline || (activeBundle.chart && activeBundle.chart.timeline) || null;
    if (tl && tl.length > 1) {
      const devsSorted = _ptDevs.slice().sort((a, b) => a.t - b.t);
      const leans = [];
      for (let ci = 1; ci < tl.length; ci++) {
        const event = tl[ci];
        if (!event) continue;
        const eventSec = event.startSec != null ? event.startSec : event.t;
        if (eventSec == null) continue;
        const t0 = eventSec + lead;
        if (!(t0 >= 0)) continue;
        const x = devsSorted.find(d => d.t >= t0 - 1e-3 && d.t < t0 + meas * 0.5);
        if (x) leans.push(x.d * 1000);
      }
      if (leans.length >= 4) { leans.sort((a, b) => a - b); chg = { med: Math.round(med(leans)), n: leans.length }; }
    }
    return { bars, chg };
  }
  function sessionEnd() {
    if (!_activeSession) return;
    // Paused wall-time is not practice time: it must not inflate the
    // "Practiced m:ss" readout or the time-based XP accrual.
    const durationMs = Math.round(performance.now() - _sessionStartMs - sessionPausedMs());
    // Discard sub-2s blips (accidental clicks, regenerate-while-playing)
    if (durationMs < 2000) { _activeSession = null; return; }
    // Settle any tremolo span whose end has passed, then count in UNITS
    // (a span = 1; a chord = its member count — matching the denominator).
    ptFinalizeSpans(transport.time - ptLatency());
    const passedTotal = ptWinPassedCount(transport.time - ptLatency());
    _activeSession.duration_ms = durationMs;
    _activeSession.hit_count   = _ptScoredUnits;
    _activeSession.miss_count  = Math.max(0, passedTotal - _ptScoredUnits);
    // Timing-tendency + near-miss disclosure (Slice 2): stash the aggregates on
    // the run info BEFORE the modal reads it. Threshold-gating happens at
    // display (≥8 samples, |lean| ≥ 30ms) — the data is recorded regardless.
    if (_ptRunInfo) {
      const devs = _ptDevs.map(x => x.d).sort((a, b) => a - b);   // _ptDevs is { d, t }; the tendency line uses d
      _ptRunInfo.leanMs = devs.length ? Math.round(devs[Math.floor(devs.length / 2)] * 1000) : null;
      _ptRunInfo.leanN = devs.length;
      _ptRunInfo.nearMiss = _ptNearMiss;
      // Scorecard hero data (panel 2026-06-12): snapshot per-cell hit/miss + the
      // per-bar lean strip while the window table still lives (teardown clears it).
      try { _ptRunInfo.heat = ptHeatSnapshot(); } catch (_) { _ptRunInfo.heat = null; }
      try { _ptRunInfo.leanBars = ptLeanBarsSnapshot(); } catch (_) { _ptRunInfo.leanBars = null; }
      // Slice 3: A/V auto-calibration — the host-mirror sweep over this run's
      // offset-free detections refines the hidden latency anchor for FUTURE
      // runs (this run's scores are already settled). EMA keeps one weird run
      // from yanking the anchor; the clamp keeps a garbage estimate sane.
      const cal = ptCalibrateOffsetMs(_ptCalLog, _ptWin);
      if (cal) {
        const estMs = Math.max(0, Math.min(250, -cal.offsetMs));   // detections lag the chart → −offset = +latency
        const prevMs = Math.round(_ptLatencyS * 1000);
        // Dead-band: within ±8ms of the current anchor is measurement noise —
        // don't chase it (also keeps a small consistent player-lean from being
        // slowly absorbed into the anchor; the tendency line stays honest).
        if (Math.abs(estMs - prevMs) >= 8) {
          const nextMs = Math.round(prevMs * 0.7 + estMs * 0.3);
          _ptLatencyS = nextMs / 1000;   // in-session only; NOT persisted (the self-measured anchor is retired — see init)
        }
        _ptRunInfo.calMs = estMs; _ptRunInfo.calMatched = cal.matched; _ptRunInfo.latencyMs = Math.round(_ptLatencyS * 1000);
      } else {
        _ptRunInfo.latencyMs = Math.round(_ptLatencyS * 1000);
      }
    }
    // End-of-run redesign (2026-06-06 three-lane panel): read PRIOR store state
    // before advancePathwayTier mutates it, so first-clear/fastest deltas are real.
    const _pw = _activeSession.mode === 'pathway' ? _activeSession.pathway_id : null;
    const _priorEntry = _pw ? pathwayTiersLoad()[_pw] : null;
    const sessions = sessionsLoad();
    sessions.unshift(_activeSession);
    sessionsSave(sessions);
    const _prevXp = (function () { try { return progressLoad().xp || 0; } catch (_) { return 0; } })();
    // Bass FELT-rung path: a feltGate pathway completes on a sustained POCKET, not a
    // % — route through the felt verdict + creditFeltRung instead of the %-hit gate
    // (which can never fire below the mic floor). The verdict drives the run-end word.
    const _feltGate = !!(_pw && PATHWAYS[_pw] && PATHWAYS[_pw].feltGate);
    let felt = null, feltResult = null, unlock;
    if (_feltGate) {
      const barSec = (function () { try { return measureSeconds((/** @type {NonNullable<typeof activeBundle>} */ (activeBundle)).config); } catch (_) { return 2; } })();
      felt = feltHoldAnalyze(_ptDevs, { barSec });
      feltResult = creditFeltRung(_pw, _activeSession.bpm, felt);
      unlock = (feltResult && feltResult.flip) ? { pathwayId: _pw, tier: feltResult.tier } : null;
    } else {
      unlock = advancePathwayTier(_activeSession);
    }
    const depthGain = advanceDepthLadder(_activeSession);   // XP + Travel axis (Phase 8)
    // Tier C readouts (behind XP-Off): a quiet LEVEL-UP delta when this run's XP gain
    // crossed a woodshed-level boundary, + any NEW competency badges (computed AFTER
    // the tier/depth stores above are updated, so this run's competency is reflected).
    let levelUp = null;
    try {
      const _newXp = progressLoad().xp || 0;
      const a = xpLevelInfo(_prevXp), b = xpLevelInfo(_newXp);
      if (b.level > a.level) levelUp = { level: b.level, name: b.name, summit: !b.nextName };   // summit = reached the terminal tier (Lifer) — a graduation, not a plain level-up
    } catch (_) {}
    // Recognizers (gamification spec): DETERMINISTIC new-bests on stored artifacts —
    // the honest "variable" reward (unpredictable because the player's growth is;
    // zero RNG). One line max, precedence first-clear > fastest-clean; "new ground"
    // (travelKey) stays the render-time fallback. bestBpm rides the same
    // pathway_tiers entry; a clean run = ≥8 really-judged notes at ≥65% (the
    // minimum-denominator rule — never issue a claim off a tiny judged set).
    // The %-based recognizers + bestBpm are the GUITAR denomination — never fire
    // them for a bass felt-rung (felt is the bass denomination; speed/accuracy is
    // never the bass headline). feltResult carries the bass recognition instead.
    let recognizer = null;
    if (_pw && !_feltGate) {
      const judgedN = (_activeSession.hit_count || 0) + (_activeSession.miss_count || 0);
      const clean = judgedN >= 8 && (_activeSession.hit_count || 0) / judgedN >= 0.65;
      if (clean && _activeSession.bpm != null) {
        const all = pathwayTiersLoad(); const cur = all[_pw] || { highest_tier: -1 };
        const prevBest = cur.bestBpm || 0;
        if (_activeSession.bpm > prevBest) {
          cur.bestBpm = _activeSession.bpm; all[_pw] = cur; pathwayTiersSave(all);
          if (prevBest > 0) recognizer = { kind: 'fastest', bpm: _activeSession.bpm, prev: prevBest };
        }
      }
      if (unlock && !_priorEntry) recognizer = { kind: 'first_clear' };
    }
    // "Best here" per-spec store (L&D ruling 2026-06-06): the best % at THIS spec
    // — drill + BPM + key credit — kept as a STANDING TARGET FACT, never gap
    // arithmetic. The four suppression rules live at render (same-spec, ≥3 runs,
    // never on rough runs, hidden when today IS the best — the recognizer carries
    // that upward). Runs count only when ≥8 notes were really judged, so blips
    // and mic-less runs never dilute the spec history. Jam never touches it.
    let specBest = null;
    if (!_activeSession.jam) {
      const judgedN2 = (_activeSession.hit_count || 0) + (_activeSession.miss_count || 0);
      if (judgedN2 >= 8) {
        const pctNow = Math.round(100 * (_activeSession.hit_count || 0) / judgedN2);
        const specKey = [
          _activeSession.mode === 'pathway' ? _activeSession.pathway_id
            : (_activeSession.mode + ':' + (_activeSession.practice_type || '')),
          _activeSession.bpm ?? '', _activeSession.key_credit || _activeSession.key || ''
        ].join('|');
        /** @type {Record<string, {best: number, runs: number}>} */
        let store = {}; try { store = JSON.parse(localStorage.getItem('virtuoso_lab.spec_best') || '{}'); } catch (_) {}
        const cur = store[specKey] || { best: 0, runs: 0 };
        cur.runs += 1;
        const isNew = pctNow > cur.best, prevBestPct = cur.best;
        if (isNew) cur.best = pctNow;
        store[specKey] = cur;
        try { localStorage.setItem('virtuoso_lab.spec_best', JSON.stringify(store)); } catch (_) {}
        specBest = { best: cur.best, runs: cur.runs, isNew, prev: prevBestPct };
        // New-best recognizer — below first_clear/fastest in precedence; upward
        // past-printing is the established gained-only grammar.
        if (!recognizer && isNew && prevBestPct > 0 && cur.runs >= 3) {
          recognizer = { kind: 'best_pct', pct: pctNow, prev: prevBestPct };
        }
      }
    }
    // Snapshot for the P-sheet "Last session" card — descriptive + gained-only,
    // no score/accuracy (mirror not judge; see docs/plugin/design-system.md §13).
    let displayName;
    if (_activeSession.mode === 'pathway' && PATHWAYS[String(_activeSession.pathway_id)]) displayName = PATHWAYS[String(_activeSession.pathway_id)].label;
    else if (_activeSession.mode === 'session') displayName = (BUILT_IN_SESSIONS[workoutEditor.selectedId]?.name || 'Session practice');
    else displayName = 'Custom practice';
    // Workout RECAP chapters (Tier 3 + engagement Tier A) — the per-block chapter
    // list. Built from the bundle's enriched segmentBounds. A block is "reached" if
    // the run got to it (looped past everything); unreached read neutral (never
    // red). Tier A adds the per-block MEASUREMENT (hits/judged bucketed from _ptWin
    // by segment + hadInput) — the substrate for the played●/touched○ honesty, the
    // per-block PR, and (later) per-block credit. Only for multi-block Workouts.
    let chapters = null;
    if (_activeSession.mode === 'session') {
      const sb = (activeBundle && Array.isArray(activeBundle.segmentBounds)) ? activeBundle.segmentBounds : [];
      if (sb.length > 1) {
        const pbs = perBlockScore(sb);
        chapters = sb.map((b, i) => {
          // Per-block CREDIT (the earned ✓). A block crediting a feltGate rung
          // completes on the POCKET (its own _ptDevs slice → creditFeltRung —
          // the felt-hold finisher), every other tagged block on the strict
          // %-pass (creditBlockTier). null = no flip (untagged, ineligible,
          // weak evidence, or already cleared).
          const fi = blockFeltInfo(b);
          let earned = null;
          if (fi) {
            const fr = creditFeltRung(fi.pwId, b.bpm, fi.felt);
            if (fr && fr.flip) earned = { pathwayId: fr.pathwayId, pathwayLabel: fr.pathwayLabel, tier: fr.tier, tierName: fr.tierName, feltVerdict: fr.verdict };
          } else {
            earned = creditBlockTier(b.templateId, b.bpm, pbs[i]);
          }
          return {
            name: b.name, kind: b.kind, role: b.role, competency: b.competency || null,
            added: !!b.added, key: b.key || null,
            durSec: Math.max(0, (b.end || 0) - (b.start || 0)),
            reached: _runLooped || (b.start <= _runMaxChartTime + 0.05),
            hits: pbs[i].hits, judged: pbs[i].judged, hadInput: !!_blockHadInput[i],
            earned,
            // The block's felt verdict word (feltGate blocks only) — the recap row
            // mirrors it even without a flip (descriptive, never a %, never red).
            felt: fi ? { verdict: fi.felt.verdict, untight: !!fi.felt.untight, spanBars: fi.felt.spanBars || 0 } : null,
          };
        });
      }
    }
    // Proof-loop competency claim (flagged, pilot, ONLY on a real flip — the
    // anti-inflation spine: a "you proved" claim exists only when something was proven).
    /** @type {import('./src/types/results-data.js').ProofClaim | null} */
    let proof = null;
    if (proofPilot(_activeSession.pathway_id) && unlock) {
      const pw = PATHWAYS[String(_activeSession.pathway_id)];
      let kind = proofKind(_activeSession.pathway_id);
      proof = { kind, label: pw.label, tierName: TIER_LABELS[unlock.tier] || `Tier ${unlock.tier + 1}`,
                bpm: _activeSession.bpm, key: _activeSession.key,
                transfer: PROOF_TRANSFER[_activeSession.pathway_id] || '' };
      // Guide-tones pilot: only make the MUSICAL claim if the line measurably
      // voice-led — MOST changes landing on a guide tone (≥0.75, the smoke-connect
      // bar). The only root-restarts on a finite looped run are the cycle seams (the
      // run reopens on the ii root at each loop point) — unavoidable, and already
      // counted against the ratio — so we gate on the landing ratio, not 0 restarts.
      // If the chart didn't voice-lead (config drift), fall back to the honest
      // completion-at-tempo claim rather than fabricate voice-leading.
      if (kind === 'guide_tones') {
        const m = activeBundle && activeBundle.proofMeta;
        if (m && m.changes > 0 && m.ratio >= 0.75) {
          proof.progression = prettyProgression(activeBundle?.config?.progression);
          proof.landings = m.landings; proof.changes = m.changes;
        } else {
          proof.kind = 'tempo';
        }
      }
    }
    // Competency badges (Tier C) — computed LAST, after both the solo tier/depth
    // flips above AND the Workout per-block creditBlockTier flips inside `chapters`
    // have written the ledger, so a badge earned via a Workout block fires the same
    // run. Null in Off mode. Gained-only diff.
    const badgeGain = creditBadges();
    const crestGain = crestCommit();   // monotonic high-water; rose === this run lifted the crest rank
    _lastEndedSession = {
      mode: _activeSession.mode, scale: _activeSession.scale, key: _activeSession.key,
      // pathway_id + practice_type are read by the coach loop (curPw anti-self-
      // prescribe guard + the per-rung hysteresis bucket key) and by the results
      // modal's jamStyleForPathway — the snapshot must carry them or curPw is
      // always undefined (the guard silently re-prescribes the just-run rung and
      // the hysteresis bucket collapses to one shared key across all rungs).
      pathway_id: _activeSession.pathway_id, practice_type: _activeSession.practice_type,
      bpm: _activeSession.bpm, bpm_tier: _activeSession.bpm_tier,
      duration_ms: _activeSession.duration_ms, displayName,
      tierCleared: !!unlock, clearedTier: unlock ? unlock.tier : null,
      depth: depthGain,   // { xpGained, travelKey, travelRung } | null — Phase 9 card reads this
      proof,              // proof-loop competency claim | null (flagged, pilot, on-flip only)
      streak: streakCount(sessions),
      jam: !!_activeSession.jam,   // Jam = mirror: the deliberate-end modal is suppressed
      chapters,                    // Workout recap chapter list (Tier 3) | null — descriptive per-block rows
      recognizer,                  // { kind:'first_clear' } | { kind:'fastest', bpm, prev } | { kind:'best_pct', pct, prev } | null
      specBest,                    // { best, runs, isNew, prev } | null — the standing-target "Best here" line
      levelUp,                     // { level, name } | null — Tier C: a woodshed level boundary crossed this run (quiet)
      badgesNew: badgeGain ? badgeGain.newBadges : null,   // [{ id, name, desc }] | null — Tier C: competency badges earned this run
      felt,                        // { verdict, leanMs, driftMs, jitterMs, untight } | null — bass felt-hold verdict (feltGate runs)
      feltResult,                  // { flip, feltPB, feltBpm, tier, tierName, verdict } | null — the felt credit (a flip = a cleared pocket)
      progression: _activeSession.progression, style: _activeSession.style,   // share-card (Jam form/style)
      // Mini rung-ladder context for the modal's progress strip (post-update state).
      ladder: (_pw && PATHWAYS[_pw]) ? {
        pathwayId: _pw,   // the modal's tier CTAs realize the full tier (bpm + density step) via applyTierFields
        tiers: PATHWAYS[_pw].tempoTiers || [],
        highestCleared: (pathwayTiersLoad()[_pw] || {}).highest_tier ?? -1,
      } : null,
      // Detection-testing results (2026-06-06): raw hit/judged counts + the
      // exemption breakdown + which ear judged. Read by showResultsModal —
      // the dev-gauge for the note-detection work. Raw on purpose: a >100%
      // readout is the known hits>passed counting nit made visible.
      results: {
        hits: _activeSession.hit_count,
        missed: _activeSession.miss_count,
        // A scored note has certainly been attempted — fold it into the passed
        // denominator so a mid-window Stop can't show >100% in the player-facing
        // headline (the old raw display was diagnostic-first by design).
        judgedPassed: Math.max(passedTotal, _activeSession.hit_count),
        hadInput: _ptHadInput,
        info: _ptRunInfo,   // { total, judged, exemptChords, exemptSubFloor, exemptMuted, ear } | null (no scorer ran)
      },
    };
    _activeSession = null;
    if (unlock) { _newlyUnlockedTier = unlock.tier; syncTempoTierButtons(); renderSkillTree(); _newlyUnlockedTier = null; }
    syncProgressStrip();
    if (crestGain && crestGain.rose) syncCrest(true);   // earn-moment: bloom the chip crest (Lit/RM-aware in CSS)
    presentSessionSummary();
  }

  function localDateStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // FORGIVING practice streak (engagement Tier A — the #1 DAU lever, non-toxic
  // form): a day counts when a real session happened (the 2s blip floor already
  // filters non-practice; unit-based, never minutes/app-open). It SURVIVES a single
  // rest day (an auto-freeze) — only TWO consecutive missed days end the run — so a
  // bad day never nukes weeks of work (the market/gamification ruling against
  // streak-guilt). `count` = practiced days in the surviving run (rest days don't
  // increment it). The display celebrates the return, never punishes the break.
  /** @param {{date: string}[]} sessions */
  function streakCount(sessions) {
    const DAY = 86400000;
    const practiced = new Set(sessions.map(s => s.date));
    const today = localDateStr(), yesterday = localDateStr(new Date(Date.now() - DAY));
    if (!practiced.has(today) && !practiced.has(yesterday)) return 0;   // grace until midnight
    let count = 0, miss = 0, guard = 0;
    let d = practiced.has(today) ? new Date() : new Date(Date.now() - DAY);
    while (guard++ < 1000) {
      if (practiced.has(localDateStr(d))) { count++; miss = 0; }
      else { if (count === 0) break; if (++miss >= 2) break; }   // one rest day is frozen; two in a row ends the run
      d = new Date(d.getTime() - DAY);
    }
    return count;
  }

  /** @param {{date: string}[]} sessions */
  function last7Days(sessions) {
    const practiced = new Set(sessions.map(s => s.date));
    const DAY_LETTERS = ['S','M','T','W','T','F','S'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      const date = localDateStr(d);
      return { date, letter: DAY_LETTERS[d.getDay()], practiced: practiced.has(date), isToday: i === 6 };
    });
  }

  function syncProgressStrip() {
    try { syncCrest(); } catch (_) {}
    const sessions = sessionsLoad();
    const streak = streakCount(sessions);
    const numEl = $('virtuoso_lab-streak-num');
    if (numEl) {
      numEl.textContent = String(streak);
      numEl.classList.toggle('active', streak > 0);
    }
    const calEl = $('virtuoso_lab-cal-dots');
    if (!calEl) return;
    calEl.innerHTML = last7Days(sessions).map(d =>
      `<div class="virtuoso_lab-cal-day${d.isToday ? ' today' : ''}">` +
      `<div class="virtuoso_lab-cal-dot${d.practiced ? ' practiced' : ''}"></div>` +
      `<span class="virtuoso_lab-cal-lbl">${d.letter}</span>` +
      `</div>`
    ).join('');
  }

  // ── End session logger ─────────────────────────────────────────────────────

  // ── Session UI ─────────────────────────────────────────────────────────────

  const workoutEditor = createWorkoutEditor(async index => {
    if (!activeBundle || activeBundle.config?.mode !== 'session') {
      const pending = onLaunchSession();
      const request = rendererLifecycle.currentRequest();
      await pending;
      if (!rendererLifecycle.isCurrentRequest(request)) return;
    }
    if (practiceSelection.active && activeBundle?.config?.mode === 'session') jumpToSegment(index);
  });

  /** @param {string} mode */
  function syncSessionMode(mode) {
    const root = $('virtuoso_lab-root'); if (!root) return;
    root.classList.toggle('virtuoso_lab-session-mode', mode === 'session');
    syncModeBar();
  }

  async function onLaunchSession() {
    practiceSelection.clearFile();
    const launch = {};
    sessionLaunch = launch;
    let request = rendererLifecycle.currentRequest();
    const sessionId = workoutEditor.selectedId || Object.keys(BUILT_IN_SESSIONS)[0];
    const baseSession = BUILT_IN_SESSIONS[sessionId];
    if (!baseSession) return;
    const btn = $('virtuoso_lab-launch-session');
    const summary = $('virtuoso_lab-summary');
    const audio = {
      notes:      !!document.getElementById('virtuoso_lab-session-audio-notes')?.checked,
      metronome:  !!document.getElementById('virtuoso_lab-session-audio-metronome')?.checked,
      harmony:    !!document.getElementById('virtuoso_lab-session-audio-harmony')?.checked,
    };
    // Pre-warm the AudioContext while still in the button-click user-gesture context
    // (before any await). Without this, new AudioContext() created inside the
    // async continuation below may start in 'suspended' state on some hosts,
    // causing notes scheduled with the frozen currentTime to fire in the past.
    const launchAudioCtx = ensureAudioCtx();
    if (launchAudioCtx.state === 'suspended') launchAudioCtx.resume().catch(() => {});
    const formStringSetup = document.querySelector('[name="stringSetup"]')?.value || null;
    const session = workoutEditor.launchConfig({ audio, stringSetup: formStringSetup,
      customOpenMidis: document.querySelector('#virtuoso_lab-controls [name="customOpenMidis"]')?.value || '',
      countInBars: countInDefaultBars() });
    try {
      if (btn) { btn.disabled = true; btn.textContent = 'Building…'; }
      if (transport.playing) stopPlayback();
      showStatus('Building session…');
      if (!session) { showStatus('Build a Workout first.'); return; }
      const exercise = generateSession(session);
      lastExercise = exercise;
      if (summary) summary.innerHTML = summarize(exercise);
      const pending = attachRenderer(exercise);
      request = rendererLifecycle.currentRequest();
      if (!await transport.runStart(pending, () => {})) return;
      refreshStatusFromState();
    } catch (e) {
      if (!rendererLifecycle.isCurrentRequest(request)) return;
      showStatus(`Session error: ${(/** @type {Error} */ (e)).message || e}`);
      console.error('[Virtuoso] session launch failed', e);
    } finally {
      if (btn && launch === sessionLaunch) { btn.disabled = false; btn.textContent = '▶ Start Workout'; }
    }
  }

  // ── End Session UI ──────────────────────────────────────────────────────────

  /** @param {string} kind */
  function syncViewSwitcher(kind) {
    rendererLifecycle.syncView(kind);
  }
  function syncThemeButtons() {
    document.querySelectorAll('.virtuoso_lab-theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === currentRenderTheme);
    });
  }

  /** @param {string} kind */
  async function onViewSwitch(kind) {
    rendererLifecycle.selectView(kind);
    if (!lastExercise) return;
    lastExercise.session.renderer = kind;
    const summary = $('virtuoso_lab-summary');
    // Switching views stops playback by design — the user explicitly chose a
    // new view, so we treat that as a transport break. stopPlayback() resets
    // the playhead, kills audio, AND updates the Play button label back to
    // "▶ Play" so the user isn't left looking at a stale "■ Stop".
    if (transport.playing) stopPlayback();
    const exercise = lastExercise;
    let request;
    try {
      const pending = attachRenderer(exercise);
      request = rendererLifecycle.currentRequest();
      if (!await pending || !rendererLifecycle.isCurrentRequest(request)) return;
      // Refresh the LCD so a prior failed-attach state doesn't linger after a
      // successful switch.
      if (summary) summary.innerHTML = summarize(lastExercise);
    } catch (e) {
      if (!rendererLifecycle.isCurrentRequest(request) || lastExercise !== exercise) return;
      console.error('[Virtuoso] renderer switch failed', e);
      // Auto-fall back to 2D Highway, which is in-tree and handles any
      // string count. Without this, a 3D-Highway failure leaves the user
      // staring at a stuck error with no obvious way out. Status line carries
      // the message; the LCD stays a clean chart readout.
      if (kind !== 'builtin_2d') {
        showStatus(`${kind} unavailable — falling back to 2D Highway (${(/** @type {Error} */ (e)).message || e})`);
        try {
          syncViewSwitcher('builtin_2d');
          const preference = document.querySelector('[name="renderer"]'); if (preference) preference.value = 'builtin_2d';
          localStorage.setItem('virtuoso_lab.renderer', 'builtin_2d');
          lastExercise.session.renderer = 'builtin_2d';
          if (!await rendererLifecycle.attach(exercise, true)) return;
          if (summary) summary.innerHTML = summarize(lastExercise);
        } catch (e2) {
          console.error('[Virtuoso] fallback to 2D Highway failed', e2);
          showStatus(`Renderer failed: ${(/** @type {Error} */ (e2)).message || e2}`);
        }
      } else {
        showStatus(`Renderer failed: ${(/** @type {Error} */ (e)).message || e}`);
      }
    }
  }

  // ── Deep-link / shareable URL ──────────────────────────────────────────
  // Serialises the active form state to a URL hash so a user can copy a link
  // that restores the exact exercise on another machine. We snapshot the
  // entire #virtuoso_lab-controls FormData — small enough to fit comfortably in
  // a hash, and stays in sync with whatever fields the form happens to expose.
  const SHARE_HASH_KEY = 's';
  function snapshotFormState() {
    const form = $('virtuoso_lab-controls'); if (!form) return null;
    const data = new FormData(form);
    /** @type {Record<string, FormDataEntryValue>} */
    const out = {};
    for (const [k, v] of data.entries()) out[k] = v;
    // FormData omits unchecked checkboxes; restore them explicitly so the
    // round-trip is lossless (otherwise "Hear notes off" can't be shared).
    // form.elements (not a DOM descendant query) so it also reaches the
    // form-associated audio mute pills that live in the stage view-bar.
    Array.from(form.elements).forEach(cb => {
      if (cb instanceof HTMLInputElement && cb.type === 'checkbox' && cb.name && !(cb.name in out)) out[cb.name] = cb.checked ? 'on' : '';
    });
    return out;
  }
  /** @param {Record<string, string | boolean> | null} state */
  function applyFormState(state) {
    practiceSelection.cancelInitial();
    const form = $('virtuoso_lab-controls'); if (!form || !state || typeof state !== 'object') return;
    for (const [name, value] of Object.entries(state)) {
      // form.elements[name] reaches form-associated controls regardless of DOM
      // position (the relocated audio mute pills), and never throws on a crafted
      // share-payload key the way an attribute selector could.
      /** @typedef {{type?: unknown, checked?: boolean, value?: string | boolean, length?: number, 0?: FormStateField}} FormStateField */
      /** @type {FormStateField | null | undefined} */
      let field = (/** @type {{[name: string]: FormStateField | null | undefined}} */ (/** @type {unknown} */ (form.elements)))[name];
      // A radio/checkbox group resolves to a RadioNodeList; we only carry single
      // controls, so take the first element if a list comes back.
      if (field && typeof field.length === 'number' && !('value' in field)) field = field[0];
      if (!field) continue;
      if (field.type === 'checkbox') field.checked = value === 'on' || value === true;
      else field.value = value;
    }
  }
  /** @param {object | null} state */
  function encodeShareHash(state) {
    if (!state) return '';
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))).replace(/=+$/, ''); }
    catch (_) { return ''; }
  }
  /** @param {string | null} s */
  function decodeShareHash(s) {
    if (!s) return null;
    try {
      const pad = s.length % 4 ? s + '==='.slice((s.length + 3) % 4) : s;
      return JSON.parse(decodeURIComponent(escape(atob(pad))));
    } catch (_) { return null; }
  }
  function readShareHash() {
    const h = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    const params = new URLSearchParams(h);
    return decodeShareHash(params.get(SHARE_HASH_KEY));
  }
  function writeShareHash() {
    const enc = encodeShareHash(snapshotFormState());
    if (!enc) return;
    const params = new URLSearchParams(location.hash.startsWith('#') ? location.hash.slice(1) : location.hash);
    params.set(SHARE_HASH_KEY, enc);
    const next = '#' + params.toString();
    if (location.hash !== next) history.replaceState(null, '', next);
  }
  async function onCopyShareLink() {
    writeShareHash();
    const btn = $('virtuoso_lab-share');
    try {
      await navigator.clipboard.writeText(location.href);
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      }
    } catch (e) {
      console.warn('[Virtuoso] clipboard copy failed', e);
      if (btn) { const orig = btn.textContent; btn.textContent = 'Copy failed'; setTimeout(() => { btn.textContent = orig; }, 1500); }
    }
  }
  // Paste-share-link handler: accept either a full URL containing an
  // #s=<base64> param, or just the raw base64 string. Restores form state,
  // refreshes every dependent control, and triggers a regenerate.
  /** @param {string} raw */
  function onPasteShareLink(raw) {
    const el = $('virtuoso_lab-paste-share');
    if (!raw || !raw.trim()) { if (el) el.classList.remove('flash-ok', 'flash-bad'); return; }
    let encoded = raw.trim();
    // Try to extract #s=... from a URL; fall back to treating the input as
    // an already-extracted base64 payload.
    const hashIdx = encoded.indexOf('#');
    if (hashIdx !== -1) {
      const params = new URLSearchParams(encoded.slice(hashIdx + 1));
      const v = params.get(SHARE_HASH_KEY);
      if (v) encoded = v;
    }
    const state = decodeShareHash(encoded);
    if (!state || typeof state !== 'object') {
      if (el) { el.classList.remove('flash-ok'); el.classList.add('flash-bad'); setTimeout(() => el.classList.remove('flash-bad'), 1500); }
      return;
    }
    applyFormState(state);
    // Re-run every downstream sync so dependent controls follow the
    // restored form values (Shape dropdown, instrument-aware UI bits, etc.).
    practiceSelection.syncShapes();
    practiceSelection.syncShapeHidden();
    practicePresentation.renderPosition();
    syncInstrumentFamilyButtons();
    syncInstrumentClass();
    syncStringCountChips();
    tuningSettings.sync();
    syncAdvancedMode();
    syncChromaticVisibility();
    writeShareHash();
    if (el) {
      el.value = '';
      el.classList.remove('flash-bad'); el.classList.add('flash-ok');
      setTimeout(() => el.classList.remove('flash-ok'), 1500);
    }
    if (activeBundle) onGenerate();
  }

  // ===========================================================================
  // §15 · DOM WIRING (bind) + PUBLIC SURFACE (window.VirtuosoLab)
  // bind() wires all DOM events once on DOMContentLoaded.
  // ===========================================================================
  function bind() {
    const root = $('virtuoso_lab-root'); if (!root || root.dataset.virtuoso_labInit === '1') return false; root.dataset.virtuoso_labInit = '1';
    { const verEl = $('virtuoso_lab-version'); if (verEl) verEl.textContent = 'v' + VIRTUOSO_VERSION; }   // header version badge (mirrors plugin.json)
    practiceSelection.mount('files');
    const instrument = document.querySelector('[name="instrument"]'), setup = document.querySelector('[name="stringSetup"]'), advancedToggle = $('virtuoso_lab-advanced-toggle');
    // LCD tempo is EDITABLE in place (DAW transport convention) — two-way with
    // the Inspector BPM field. Delegated on the strip (the LCD re-renders on
    // every generate); commit on change (Enter/blur): clamp to the form's
    // 30–260 bounds, write the form field (dispatching change so dependent
    // logic runs), regenerate — the same path a tier-button click takes.
    const lcdHost = $('virtuoso_lab-summary');
    const formBpm = document.querySelector('#virtuoso_lab-controls [name="bpm"]');
    if (lcdHost) {
      lcdHost.addEventListener('keydown', (e) => {
        const target = eventValueElement(e.target);
        if (target?.id === 'virtuoso_lab-lcd-bpm' && e.key === 'Enter' && 'blur' in target && typeof target.blur === 'function') { e.preventDefault(); target.blur(); }
      });
      // LCD select cells (Key · Meter · Count-in) commit the same way the Tempo
      // input does: write the (possibly Custom-only-hidden) Inspector field,
      // dispatch change so dependent logic runs, regenerate — a live override in
      // any mode. Map the LCD id → form field name.
      /** @type {Record<string, string>} */
      const LCD_SELECT_FIELD = { 'virtuoso_lab-lcd-key': 'key', 'virtuoso_lab-lcd-meter': 'meter', 'virtuoso_lab-lcd-countin': 'countIn' };
      lcdHost.addEventListener('change', (e) => {
        const target = eventValueElement(e.target); if (!target) return;
        const id = target.id;
        if (id === 'virtuoso_lab-lcd-bpm') {
          const v = Math.max(30, Math.min(260, parseInt(target.value, 10) || 0));
          if (!v || !formBpm) { if (formBpm) target.value = formBpm.value; return; }
          target.value = String(v);
          if (String(formBpm.value) !== String(v)) {
            formBpm.value = String(v);
            formBpm.dispatchEvent(new Event('change', { bubbles: true }));
            onGenerate();
          }
          return;
        }
        const name = LCD_SELECT_FIELD[id]; if (!name) return;
        const field = eventValueElement(document.querySelector('#virtuoso_lab-controls [name="' + name + '"]'));
        if (!field || String(field.value) === String(target.value)) return;
        field.value = target.value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        onGenerate();
      });
      // Mirror Inspector→LCD live, so the two boxes always agree between generates.
      formBpm?.addEventListener('input', () => {
        const lcd = $('virtuoso_lab-lcd-bpm'); if (lcd) lcd.value = formBpm.value;
      });
    }
    instrument?.addEventListener('change', (e) => {
      if (!setup) return;
      setup.value = instrument.value === 'bass' ? 'bass_4_standard' : 'guitar_6_standard';
      // A per-string custom tuning from the old family has the wrong string count /
      // ranges for the new one — clear it so the saved L1 store reflects the family
      // standard (mirrors onInstrumentFamilyClick).
      const hidden = $('virtuoso_lab-custom-open-midis'); if (hidden) hidden.value = '';
      syncInstrumentClass();
      syncStringCountChips();   // a direct instrument-select change (not via the chips) must refresh these too
      tuningSettings.sync();
      // Switching FAMILY is the player's L1 declaration — persist it so it survives a
      // reload (the bug: the programmatic setup.value above dispatches no 'change',
      // so the setup handler's instrumentStoreSave never ran, and the stale L1 store
      // won restore → a guitar→bass switch reverted after restart).
      instrumentStoreSave({ writeHost: !!e.isTrusted });
      renderPathwayList();      // repaint the instrument-aware picker (bass packs in / guitar-only out)
      // If the active Ladder rung can't be played on the new instrument, drop to
      // Custom (that path regenerates); otherwise re-derive the rung + regenerate.
      if (practiceSelection.dropIfUnplayable()) return;
      reapplyActivePathway();   // re-derive the active rung for the new instrument
      if (activeBundle || practiceSelection.file || practiceSelection.hasPathwayFile()) onGenerate();
    });
    setup?.addEventListener('change', (e) => {
      syncStringSetupControls(); syncInstrumentClass(); syncStringCountChips(); tuningSettings.sync();
      // User-driven setup change = the player's L1 instrument declaration.
      // (Pathway writes go through setFieldSilent — no 'change' — so a rung's
      // coded setup never overwrites the player's durable store.)
      instrumentStoreSave({ writeHost: !!e.isTrusted });
      renderPathwayList();      // a setup change can cross families (guitar setup → bass setup): repaint the picker
      // If this setup change crossed families and orphaned the active Ladder rung,
      // drop to Custom (that path regenerates) instead of re-deriving a hidden rung.
      if (practiceSelection.dropIfUnplayable()) return;
      // Re-derive the active rung AGAINST the new declaration (anchor key, L1
      // adapt, goal-card readout) — save first so the derivation reads it.
      reapplyActivePathway();
      // A string-count/tuning change reshapes the generated pattern (different
      // string count, different open pitches) — regenerate so the displayed
      // chart + audio actually reflect it. Mirrors the instrument/tuning-select
      // handlers, which already regenerate. (Programmatic value-sets that must
      // NOT regenerate, e.g. the instrument handler's reset, assign .value
      // without dispatching 'change', so they don't reach here.)
      if (activeBundle || practiceSelection.file || practiceSelection.hasPathwayFile()) onGenerate();
    });
    // Top-level instrument-family chips (Bass / Guitar / Piano).
    document.querySelectorAll('.virtuoso_lab-instr-btn').forEach(btn => {
      btn.addEventListener('click', () => onInstrumentFamilyClick(btn.dataset.instrument));
    });
    // Tuning preset dropdown — wired here since the chip row populates its
    // contents dynamically and we still want a single change handler.
    tuningSettings.mount();
    // The Climb signpost's summit invite (depth slice — the summit-invite atom):
    // arm the offered next-depth pattern on the live form, then regenerate. The
    // signpost re-renders its innerHTML each sync, so delegate from the container.
    $('virtuoso_lab-climb-next')?.addEventListener('click', (e) => {
      const btn = eventClosest(e.target, '[data-act="depth-pattern"]');
      if (!btn) return;
      setFieldSilent('sequence', btn.dataset.seq || 'thirds');
      syncTempoTierButtons();   // flip the signpost to the "pattern cleared" forward hook immediately
      if (activeBundle) onGenerate();   // rebuild the chart with the sequenced run
    });
    // Fetch any tunings the user saved in a prior session and pull them
    // into the dropdown. Async; the dropdown is repainted by the fetch
    // callback so users see saved entries the moment the request lands.
    tuningSettings.load();
    // Restore the player's saved instrument (the L1 store: setup + tuning)
    // before first sync, so reload lands on their declared physical instrument
    // — D Standard survives a restart, not just the family. Falls back to the
    // legacy family-only key for stores written before Phase 1.
    try {
      const inst = instrumentStoreLoad();
      if (inst) {
        if (setup) setup.value = inst.stringSetup;
        if (instrument) instrument.value = STRING_SETUPS[inst.stringSetup].instrument;
        const hidden = $('virtuoso_lab-custom-open-midis');
        if (hidden) hidden.value = inst.customOpenMidis || '';
      } else {
        const saved = localStorage.getItem('virtuoso_lab.instrumentFamily');
        if (saved === 'bass' || saved === 'guitar') {
          if (instrument && instrument.value !== saved) {
            instrument.value = saved;
            if (setup) setup.value = saved === 'bass' ? 'bass_4_standard' : 'guitar_6_standard';
          }
        }
      }
    } catch (_) {}
    syncStringSetupControls();
    syncInstrumentClass();
    syncStringCountChips();
    tuningSettings.sync();
    advancedToggle?.addEventListener('change', practiceSelection.syncFileControls); syncAdvancedMode(); syncChromaticVisibility();
    $('virtuoso_lab-pathway-scale')?.addEventListener('change', (ev) => { setFieldSilent('scale', (/** @type {HTMLSelectElement} */ (ev.target)).value); if (activeBundle) onGenerate(); });
    $('virtuoso_lab-play')?.addEventListener('click', onPlayToggle);
    $('virtuoso_lab-stop')?.addEventListener('click', onStop);
    $('virtuoso_lab-listen')?.addEventListener('click', previewListen);   // PR 2.1 · audition the phrase
    // Unified DAW ruler: one canvas handles BOTH scrub and A–B loop.
    //   • Lower track → scrub/seek (drag the playhead through the chart).
    //   • Top strip (loop zone) → loop/cycle: drag empty = paint a new loop,
    //     drag inside the band = move it, drag near an edge = resize.
    //   • Loop edges are grabbable from anywhere in the ruler height (±6px).
    // Loop drags snap to bar lines (Alt = free) and feed the same tpA/tpB +
    // commitLoop() the A/B buttons use — one loop system. Seek is continuous.
    const rulerCanvas = $('virtuoso_lab-ruler-canvas');
    if (rulerCanvas) {
      let /** @type {string | null} */ mode = null, anchorT = 0, startTpA = 0, startTpB = 0, /** @type {number | null} */ prevA = null, /** @type {number | null} */ prevB = null;
      const dur = () => activeBundle?.songInfo?.duration || 0;
      // Map clientX↔time through the SAME scrolling window the ruler draws with, so
      // seek + loop-drag track the visible bars (not the whole-session fit).
      /** @param {number} clientX */
      const timeAt = (clientX) => { const m = rulerMap(); return m ? m.tAt(clientX) : 0; };
      // Which loop edge (if any) the pointer is within ~6px of, in screen px. An
      // off-screen edge returns null (can't grab it on a scrolling ruler — that's
      // what the overview strip is for).
      /** @param {number} clientX */
      const edgeNear = (clientX) => {
        if (transport.markerA == null || transport.markerB == null || dur() <= 0) return null;
        const m = rulerMap(); if (!m) return null;
        const xa = m.g.rect.left + m.xAt(Math.min(transport.markerA, transport.markerB));
        const xb = m.g.rect.left + m.xAt(Math.max(transport.markerA, transport.markerB));
        if (xa >= m.g.rect.left && Math.abs(clientX - xa) <= 6) return 'resizeA';
        if (xb <= m.g.rect.left + m.g.rect.width && Math.abs(clientX - xb) <= 6) return 'resizeB';
        return null;
      };
      rulerCanvas.addEventListener('pointerdown', (e) => {
        if (!activeBundle || dur() <= 0) return;
        const g = rulerGeom(); if (!g) return;
        e.preventDefault();
        try { rulerCanvas.setPointerCapture(e.pointerId); } catch (_) {}
        prevA = transport.markerA; prevB = transport.markerB;
        const y = e.clientY - g.rect.top;
        const lz = Math.min(RULER_LOOP_ZONE, g.rect.height * 0.4);
        const edge = edgeNear(e.clientX);
        const t = timeAt(e.clientX);
        if (edge) { mode = edge; }
        else if (y <= lz) {
          // Loop zone: move an existing band if clicked inside it, else start new.
          const inBand = transport.markerA != null && transport.markerB != null && t >= Math.min(transport.markerA, transport.markerB) && t <= Math.max(transport.markerA, transport.markerB);
          if (inBand) { mode = 'move'; anchorT = t; startTpA = Math.min(transport.markerA, transport.markerB); startTpB = Math.max(transport.markerA, transport.markerB); }
          else { mode = 'new'; anchorT = snapToDownbeat(t, e.altKey); transport.markLoop(anchorT, anchorT); paintLoopRegion(); }
        } else {
          mode = 'seek'; seekTo(t);
        }
      });
      rulerCanvas.addEventListener('pointermove', (e) => {
        if (!mode) {
          // Hover affordance: resize at edges, crosshair in loop zone, seek below.
          const g = rulerGeom(); if (!g) return;
          const lz = Math.min(RULER_LOOP_ZONE, g.rect.height * 0.4);
          rulerCanvas.style.cursor = edgeNear(e.clientX) ? 'ew-resize' : ((e.clientY - g.rect.top) <= lz ? 'crosshair' : 'pointer');
          return;
        }
        const raw = timeAt(e.clientX);
        if (mode === 'seek') { seekTo(raw); return; }
        const t = snapToDownbeat(raw, e.altKey);
        if (mode === 'new') { transport.markLoop(Math.min(anchorT, t), Math.max(anchorT, t)); }
        else if (mode === 'resizeA') { transport.markLoop(t, transport.markerB); }
        else if (mode === 'resizeB') { transport.markLoop(transport.markerA, t); }
        else if (mode === 'move') {
          const width = startTpB - startTpA;
          let na = snapToDownbeat(startTpA + (raw - anchorT), e.altKey);
          na = Math.max(0, Math.min(Math.max(0, dur() - width), na));
          transport.markLoop(na, na + width);
        }
        paintLoopRegion();
      });
      /** @param {PointerEvent} e */
      const endRuler = (e) => {
        if (!mode) return;
        const wasSeek = mode === 'seek', wasNew = mode === 'new';
        mode = null;
        try { rulerCanvas.releasePointerCapture(e.pointerId); } catch (_) {}
        if (wasSeek) return;  // seek commits live; nothing to finalize
        // A click (no real drag) in the empty loop zone shouldn't wipe a loop.
        if (wasNew && Math.abs((transport.markerA ?? 0) - (transport.markerB ?? 0)) < 0.02) { transport.markLoop(prevA, prevB); }
        commitLoop();
      };
      rulerCanvas.addEventListener('pointerup', endRuler);
      rulerCanvas.addEventListener('pointercancel', endRuler);
    }
    // Overview/marker strip (lane 2): fit-to-width — click = seek anywhere, drag =
    // author the A–B loop (the off-screen-safe authoring surface), edge-drag = resize.
    const ovCanvas = $('virtuoso_lab-overview-canvas');
    if (ovCanvas) {
      const ovGeom = () => { const c = $('virtuoso_lab-overview-canvas'); if (!c) return null; const rect = c.getBoundingClientRect(); const padX = 2, usableW = Math.max(1, rect.width - padX * 2); const d = activeBundle?.songInfo?.duration || 0; return { rect, padX, usableW, dur: d }; };
      /** @param {number} cx */
      const ovT = (cx) => { const g = ovGeom(); if (!g || g.dur <= 0) return 0; return Math.max(0, Math.min(g.dur, (cx - g.rect.left - g.padX) / g.usableW * g.dur)); };
      /** @param {number} cx */
      const ovEdge = (cx) => { if (transport.markerA == null || transport.markerB == null) return null; const g = ovGeom(); if (!g || g.dur <= 0) return null; const xa = g.rect.left + g.padX + Math.min(transport.markerA, transport.markerB) / g.dur * g.usableW; const xb = g.rect.left + g.padX + Math.max(transport.markerA, transport.markerB) / g.dur * g.usableW; if (Math.abs(cx - xa) <= 6) return 'resizeA'; if (Math.abs(cx - xb) <= 6) return 'resizeB'; return null; };
      let /** @type {string | null} */ ovMode = null, ovAnchor = 0, ovDownX = 0, /** @type {number | null} */ ovPrevA = null, /** @type {number | null} */ ovPrevB = null, ovMoved = false;
      ovCanvas.addEventListener('pointerdown', (e) => {
        const g = ovGeom(); if (!activeBundle || !g || g.dur <= 0) return; e.preventDefault();
        try { ovCanvas.setPointerCapture(e.pointerId); } catch (_) {}
        ovPrevA = transport.markerA; ovPrevB = transport.markerB; ovDownX = e.clientX; ovMoved = false;
        const edge = ovEdge(e.clientX);
        if (edge) ovMode = edge;
        else { ovMode = 'pending'; ovAnchor = snapToDownbeat(ovT(e.clientX), e.altKey); }   // drag→loop, click→seek (decided on up)
      });
      ovCanvas.addEventListener('pointermove', (e) => {
        if (!ovMode) { ovCanvas.style.cursor = ovEdge(e.clientX) ? 'ew-resize' : 'pointer'; return; }
        const t = snapToDownbeat(ovT(e.clientX), e.altKey);
        if (Math.abs(e.clientX - ovDownX) > 3) ovMoved = true;
        if (ovMode === 'pending' && ovMoved) { ovMode = 'new'; transport.markLoop(ovAnchor, ovAnchor); }
        if (ovMode === 'new') { transport.markLoop(Math.min(ovAnchor, t), Math.max(ovAnchor, t)); paintLoopRegion(); }
        else if (ovMode === 'resizeA') { transport.markLoop(t, transport.markerB); paintLoopRegion(); }
        else if (ovMode === 'resizeB') { transport.markLoop(transport.markerA, t); paintLoopRegion(); }
      });
      /** @param {PointerEvent} e */
      const ovEnd = (e) => {
        if (!ovMode) return; const m = ovMode; ovMode = null;
        try { ovCanvas.releasePointerCapture(e.pointerId); } catch (_) {}
        if (m === 'pending' && !ovMoved) { seekTo(ovT(e.clientX)); return; }   // a click = seek
        if (m === 'new' && Math.abs((transport.markerA ?? 0) - (transport.markerB ?? 0)) < 0.02) { transport.markLoop(ovPrevA, ovPrevB); }
        commitLoop();
      };
      ovCanvas.addEventListener('pointerup', ovEnd);
      ovCanvas.addEventListener('pointercancel', ovEnd);
    }
    $('virtuoso_lab-to-start')?.addEventListener('click', () => seekTo(0));
    $('virtuoso_lab-nudge-back')?.addEventListener('click', () => nudgeBar(-1));
    $('virtuoso_lab-nudge-fwd')?.addEventListener('click', () => nudgeBar(1));
    if (!window.__virtuoso_labKeysBound) { window.__virtuoso_labKeysBound = true; document.addEventListener('keydown', onTransportKey); }
    $('virtuoso_lab-loop-a')?.addEventListener('click', () => { transport.markLoop(transport.time, transport.markerB); commitLoop(); });
    $('virtuoso_lab-loop-b')?.addEventListener('click', () => { transport.markLoop(transport.markerA, transport.time); commitLoop(); });
    $('virtuoso_lab-loop-clear')?.addEventListener('click', resetTransportLoop);
    document.querySelectorAll('.virtuoso_lab-tp-seg').forEach(btn => {
      // Count-in is baked into the chart as lead-in rest bars (applyCountIn in
      // makeBundle), so changing it rebuilds the bundle — a re-attach, not just
      // a playback tweak. Stop playback and re-attach the current exercise so
      // the new lead-in (notes flowing in + notation rests) takes effect.
      btn.addEventListener('click', async () => {
        const v = btn.dataset.countin;
        setFieldSilent('countIn', v); syncTransport();
        if (!lastExercise) return;
        if (transport.playing) stopPlayback();
        lastExercise.session.countInBars = Math.max(0, Math.min(8, parseInt(v, 10) || 0));
        try { await attachRenderer(lastExercise); } catch (e) { console.error('[Virtuoso] count-in re-attach failed', e); }
      });
    });
    document.querySelector('#virtuoso_lab-controls [name="countIn"]')?.addEventListener('change', syncTransport);
    // Session transport: segment nav, per-segment loop, and click-to-jump on
    // both the progress bar and the left-panel segment cards.
    $('virtuoso_lab-prev-seg')?.addEventListener('click', prevSegment);
    $('virtuoso_lab-next-seg')?.addEventListener('click', nextSegment);
    $('virtuoso_lab-loop-seg')?.addEventListener('click', loopCurrentSegment);
    $('virtuoso_lab-session-progress')?.addEventListener('click', (e) => {
      const seg = eventClosest(e.target, '.virtuoso_lab-progress-seg');
      if (seg) jumpToSegment(parseInt(seg.dataset.segIndex, 10));
    });
    workoutEditor.unmount();
    workoutEditor.mount('timeline');
    // #virtuoso_lab-regenerate is now a HIDDEN refresh bridge (no longer a visible
    // UI button) — the bootstrap settings-watcher .click()s it to silently
    // re-render on host look-setting changes. The handler stays.
    $('virtuoso_lab-regenerate')?.addEventListener('click', onGenerate);
    // Save-preset was cut from Custom (the share link covers single-config
    // portability; "Save as Workout block" will be the future save bridge).
    // savePreset() is kept (dormant) for that future reuse.
    $('virtuoso_lab-share')?.addEventListener('click', onCopyShareLink);
    // Paste-share-link: fire on actual paste events AND on plain typing
    // (some users will type a base64 payload in directly).
    const pasteEl = $('virtuoso_lab-paste-share');
    if (pasteEl) {
      pasteEl.addEventListener('paste', (ev) => {
        // Read the clipboard data directly so we don't depend on the input
        // value being updated yet.
        const txt = (ev.clipboardData || window.clipboardData)?.getData('text') || '';
        if (txt) { ev.preventDefault(); onPasteShareLink(txt); }
      });
      pasteEl.addEventListener('change', () => onPasteShareLink(pasteEl.value));
    }
    $('virtuoso_lab-go-library')?.addEventListener('click', () => { practicePresets.unmount(); practiceSelection.leave(); activeBundle = null; lastExercise = null; goScreen('home'); });
    $('virtuoso_lab-go-plugins')?.addEventListener('click', () => { practicePresets.unmount(); practiceSelection.leave(); activeBundle = null; lastExercise = null; goScreen('plugins'); });
    $('virtuoso_lab-controls')?.addEventListener('change', (ev) => {
      const target = ev.target;
      if (!target || !('value' in target) || typeof target.value !== 'string'
          || !('name' in target) || typeof target.name !== 'string'
          || !('closest' in target) || typeof target.closest !== 'function') return;
      // The Jam inspector's controls live inside this form but are NOT form
      // fields: they have their own live-change path (wrap-quantized, J-2 D-J3).
      // Without this bail, any jam select change regenerated the FORM's exercise
      // and killed a running jam (latent since J-1; exposed by J-2's live edits).
      if (target.closest('.virtuoso_lab-jam-inspector')) return;
      const name = target.name;
      if (target.closest('#virtuoso_lab-file-practices')) return;
      const leavingFile = practiceSelection.controlChanged(name);
      if (name === 'shape') practiceSelection.syncShapeHidden();
      if (name === 'practiceType') syncChromaticVisibility();
      if (name === 'keyCycle') { const h = $('virtuoso_lab-keycycle-help'); if (h) h.style.display = target.value !== 'none' ? '' : 'none'; }
      if (name === 'renderer') syncViewSwitcher(target.value);
      // Meter-aware Division default: a user meter change bumps a too-coarse pick
      // up to the pulse (quarter→eighth under an /8) BEFORE the share-hash + the
      // regenerate below, so both reflect the corrected subdivision. The caption
      // re-renders on either meter or subdivision change. (Tier-1 rhythm fix.)
      if (name === 'meter') meterAwareSubdivisionBump();
      if (name === 'meter' || name === 'subdivision') syncDivisionHelp();
      syncAdvancedMode();
      practiceSelection.syncFileControls();
      markPathwayModifiedIfApplicable(name);
      writeShareHash();
      if (activeBundle || practiceSelection.file || practiceSelection.hasPathwayFile() || leavingFile) onGenerate();
    });
    syncDivisionHelp();   // paint the Division pulse caption on first load
    // Practice mute pills (Notes / Backing / Click) live in the stage view-bar but
    // are form-associated (form="virtuoso_lab-controls"), so their change events do
    // NOT bubble to the #virtuoso_lab-controls listener above — wire them directly to
    // the same effect (audio flags are pure playback mutes, so a regenerate picks
    // them up cleanly on the next scheduled pass). All default checked = un-muted.
    document.querySelectorAll('.virtuoso_lab-practice-pill input').forEach(inp => {
      inp.addEventListener('change', () => { writeShareHash(); if (activeBundle) onGenerate(); });
    });
    // View dropdown in the render stage — independent of exercise mode
    $('virtuoso_lab-view-select')?.addEventListener('change', (e) => onViewSwitch((/** @type {HTMLSelectElement} */ (e.target)).value));
    // Hand-marks pill (hand-marks Slice 1): default ON, persisted, never
    // auto-flipped. Renderers + the strip read handMarksOn() per frame, so a
    // flip shows on the next draw with no re-attach.
    const hmToggle = $('virtuoso_lab-handmarks-toggle');
    if (hmToggle) {
      hmToggle.setAttribute('aria-checked', String(handMarksOn()));
      hmToggle.addEventListener('click', () => {
        const next = !handMarksOn();
        try { localStorage.setItem('virtuoso_lab.showHandMarks', next ? 'on' : 'off'); } catch (_) {}
        hmToggle.setAttribute('aria-checked', String(next));
      });
    }
    // Clean-rung proving affordance: the click IS the player opting into the
    // supports-off run (never auto-flipped). Flips the pill OFF and hides
    // itself; the player turns the pill back on themselves.
    const proveBtn = $('virtuoso_lab-prove-clean');
    if (proveBtn) proveBtn.addEventListener('click', () => {
      try { localStorage.setItem('virtuoso_lab.showHandMarks', 'off'); } catch (_) {}
      hmToggle?.setAttribute('aria-checked', 'false');
      proveBtn.style.display = 'none';
    });
    const fbToggle = $('virtuoso_lab-fretboard-toggle');
    if (fbToggle) fbToggle.addEventListener('click', () => {
      fretboardOn = !fretboardOn;
      try { localStorage.setItem('virtuoso_lab.fretboard', fretboardOn ? '1' : '0'); } catch (_) {}
      syncFretboardUI();
      // The strip SLIDES (max-height, ~0.26s) → re-fit + redraw ACROSS the slide, not
      // once before it settles (the regression: a synchronous re-fit used the pre-slide
      // height → the fretboard didn't render until a lane switch + the highway didn't
      // re-fit on hide). refitStageDuring tracks the size each frame and settles correct.
      refitStageDuring(340);
    });
    // Keep-looping toggle: off (default) = a drill plays its right-sized run once then
    // ends; on = loop it forever for open practice. Read live by finiteRunActive() each
    // frame, so toggling mid-run takes effect at the next loop seam (no restart needed).
    const klToggle = $('virtuoso_lab-keeploop-toggle');
    if (klToggle) klToggle.addEventListener('click', () => {
      keepLooping = !keepLooping;
      try { localStorage.setItem('virtuoso_lab.keepLooping', keepLooping ? '1' : '0'); } catch (_) {}
      syncKeepLoopUI();
    });
    $('virtuoso_lab-pane-collapse-btn')?.addEventListener('click', () => setPanelCollapsed(true));
    $('virtuoso_lab-pane-expand-btn')?.addEventListener('click', () => setPanelCollapsed(false));
    $('virtuoso_lab-focus-btn')?.addEventListener('click', toggleFocus);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    // Feel control: write the hidden swing field + bubble a change so the
    // delegated #virtuoso_lab-controls handler regenerates with the new feel.
    document.querySelectorAll('.virtuoso_lab-feel-btn').forEach(b => b.addEventListener('click', () => {
      const sw = $('virtuoso_lab-swing'); if (!sw) return;
      sw.value = b.dataset.feel; syncFeelControl();
      sw.dispatchEvent(new Event('change', { bubbles: true }));
    }));
    // Theme toggle (Light / Dark) for Tab + Notation.
    document.querySelectorAll('.virtuoso_lab-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => { setRenderTheme(btn.dataset.theme); syncThemeButtons(); });
    });
    syncThemeButtons();
    // One-time migration: an earlier bug let the bass auto-switch persist
    // 'builtin_2d' as the renderer preference, stranding 6-string guitar users
    // on the 2D highway every startup. Clear that stale value once so the 3D
    // default returns; explicit view choices made afterward still persist
    // (bass no longer writes the preference).
    try {
      if (!localStorage.getItem('virtuoso_lab.rendererMigratedV1')) {
        if (localStorage.getItem('virtuoso_lab.renderer') === 'builtin_2d') localStorage.removeItem('virtuoso_lab.renderer');
        localStorage.setItem('virtuoso_lab.rendererMigratedV1', '1');
      }
    } catch (_) {}
    // Restore last-used renderer from localStorage
    const savedRenderer = localStorage.getItem('virtuoso_lab.renderer');
    if (savedRenderer) {
      syncViewSwitcher(savedRenderer);
      const rendererSel = document.querySelector('[name="renderer"]');
      if (rendererSel) rendererSel.value = savedRenderer;
    }
    // Restore the fretboard-strip toggle (defaults on).
    try { const fb = localStorage.getItem('virtuoso_lab.fretboard'); if (fb != null) fretboardOn = fb === '1'; } catch (_) {}
    syncFretboardUI();
    // Restore the keep-looping toggle (defaults OFF = finite, right-sized runs).
    try { const kl = localStorage.getItem('virtuoso_lab.keepLooping'); if (kl != null) keepLooping = kl === '1'; } catch (_) {}
    syncKeepLoopUI();
    // The sidebar always starts expanded on plugin startup/selection (it's a
    // transient view affordance, not a saved pref) — also reset on screen:changed.
    panelCollapsed = false;
    syncPanelToggle();
    practiceSelection.mount('position');
    $('virtuoso_lab-controls')?.querySelector('[name="stringSetup"]')?.addEventListener('change', () => { syncJamHighlightUI(); syncFretboardUI(); });
    practiceSelection.mount('selection');
    renderJamStyles();
    // Jam controls: feel toggle + the Jam action.
    document.querySelectorAll('#virtuoso_lab-jam-feel .virtuoso_lab-jam-feel-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#virtuoso_lab-jam-feel .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        jamFeel = b.dataset.feel || 'straight';
        jamQueueChange();   // mid-jam: applies at the next wrap (J-2)
      });
    });
    $('virtuoso_lab-jam-go')?.addEventListener('click', jamPlay);
    // J-2 wrap-boundary live changes: key/tempo/changes edits mid-jam queue the
    // pending chip and land at the next loop wrap (no restart, no glitch).
    ['virtuoso_lab-jam-key', 'virtuoso_lab-jam-tempo', 'virtuoso_lab-jam-prog'].forEach(id =>
      $(id)?.addEventListener('change', jamQueueChange));
    // Jam slice J-1: guide-line audio opt-in + bass band-mode (both persisted).
    try { jamGuideLine = localStorage.getItem('virtuoso_lab.jamGuide') === 'on'; } catch (_) {}
    try { const b = localStorage.getItem('virtuoso_lab.jamBand'); if (b === 'no_bass' || b === 'drums_only' || b === 'full') jamBandMode = b; } catch (_) {}
    document.querySelectorAll('#virtuoso_lab-jam-guide .virtuoso_lab-jam-feel-btn').forEach(b => {
      if ((b.dataset.guide === 'on') === jamGuideLine) { document.querySelectorAll('#virtuoso_lab-jam-guide .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); }
      b.addEventListener('click', () => {
        document.querySelectorAll('#virtuoso_lab-jam-guide .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        jamGuideLine = b.dataset.guide === 'on';
        try { localStorage.setItem('virtuoso_lab.jamGuide', jamGuideLine ? 'on' : 'off'); } catch (_) {}
        jamQueueChange();   // mid-jam: applies at the next wrap (J-2)
      });
    });
    document.querySelectorAll('#virtuoso_lab-jam-band .virtuoso_lab-jam-feel-btn').forEach(b => {
      if (b.dataset.band === jamBandMode) { document.querySelectorAll('#virtuoso_lab-jam-band .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); }
      b.addEventListener('click', () => {
        document.querySelectorAll('#virtuoso_lab-jam-band .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        jamBandMode = b.dataset.band || 'no_bass';
        try { localStorage.setItem('virtuoso_lab.jamBand', jamBandMode); } catch (_) {}
        jamQueueChange();   // mid-jam: applies at the next wrap (J-2)
      });
    });
    // J-2 Harmonic-Depth dial (D-J5b) — persisted; mid-jam edits wrap-quantize.
    try { const d = localStorage.getItem('virtuoso_lab.jamDepth'); if (d === 'simple' || d === 'core' || d === 'rich') jamDepth = d; } catch (_) {}
    document.querySelectorAll('#virtuoso_lab-jam-depth .virtuoso_lab-jam-feel-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.depth === jamDepth);
      b.addEventListener('click', () => {
        document.querySelectorAll('#virtuoso_lab-jam-depth .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        jamDepth = b.dataset.depth || 'core';
        try { localStorage.setItem('virtuoso_lab.jamDepth', jamDepth); } catch (_) {}
        jamQueueChange();   // mid-jam: applies at the next wrap (J-2)
      });
    });
    // J-3 Energy macro: Chill/Groove/Drive PIN the band's density; Auto arcs it
    // (build→peak→breakdown). Persisted; mid-jam edits wrap-quantize like Depth.
    try { const e = localStorage.getItem('virtuoso_lab.jamEnergy'); if (e === 'chill' || e === 'groove' || e === 'drive' || e === 'auto') jamEnergy = e; } catch (_) {}
    document.querySelectorAll('#virtuoso_lab-jam-energy .virtuoso_lab-jam-feel-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.energy === jamEnergy);
      b.addEventListener('click', () => {
        document.querySelectorAll('#virtuoso_lab-jam-energy .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        jamEnergy = b.dataset.energy || 'auto';
        try { localStorage.setItem('virtuoso_lab.jamEnergy', jamEnergy); } catch (_) {}
        jamQueueChange();   // mid-jam: applies at the next wrap (J-2)
      });
    });
    // J-3 Spotlight (trade-solos form): you ↔ band take turns. Persisted; a mid-jam
    // toggle wrap-quantizes (it re-tags the chart, so it lands at the next wrap).
    try { jamSpotlight = localStorage.getItem('virtuoso_lab.jamSpotlight') === 'on'; } catch (_) {}
    document.querySelectorAll('#virtuoso_lab-jam-spotlight .virtuoso_lab-jam-feel-btn').forEach(b => {
      if ((b.dataset.spotlight === 'on') === jamSpotlight) { document.querySelectorAll('#virtuoso_lab-jam-spotlight .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); }
      b.addEventListener('click', () => {
        document.querySelectorAll('#virtuoso_lab-jam-spotlight .virtuoso_lab-jam-feel-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        jamSpotlight = b.dataset.spotlight === 'on';
        try { localStorage.setItem('virtuoso_lab.jamSpotlight', jamSpotlight ? 'on' : 'off'); } catch (_) {}
        jamQueueChange();   // mid-jam: applies at the next wrap (J-2)
      });
    });
    // Jam target-highlight selector (chord / guide / scale / off). Reflects the
    // persisted mode, repaints the strip live on change.
    document.querySelectorAll('#virtuoso_lab-jam-hl .virtuoso_lab-jam-hl-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.hl === jamHighlightMode);
      b.addEventListener('click', () => {
        jamHighlightMode = b.dataset.hl || 'chord';
        try { localStorage.setItem('virtuoso_lab.jamHighlight', jamHighlightMode); } catch (_) {}
        syncJamHighlightUI();
        drawOnce();
      });
    });
    // First-run primed START CTA — starts the selected pathway (the one lit primary).
    $('virtuoso_lab-start-cta')?.addEventListener('click', () => onPlayToggle());
    // Shell panels (M / P / [ / ?): visible buttons + the mixer's own controls.
    mixerLoad();
    $('virtuoso_lab-mixer-btn')?.addEventListener('click', () => toggleMixer());
    // The header progress chip opens P (de-dups the old view-bar Progress button).
    const progChip = $('virtuoso_lab-progress-strip');
    progChip?.addEventListener('click', () => toggleProgressSheet());
    progChip?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleProgressSheet(); } });
    // Collapse is the labelled Setup/Play pill + the [ hotkey; the duplicate
    // ⟨ ⟩ icon button was removed (GUI audit B1). The [ binding lives in the
    // keydown handler; setPanelCollapsed is unchanged.
    $('virtuoso_lab-help-btn')?.addEventListener('click', () => toggleCheatSheet());
    $('virtuoso_lab-mixer-close')?.addEventListener('click', () => toggleMixer(false));
    $('virtuoso_lab-progress-close')?.addEventListener('click', () => toggleProgressSheet(false));
    // Library browse drawer (Phase 9 Slice 3): open from the timeline "+ Browse",
    // close via ▾, chip-filter, and [+ Add] a template-ref to the draft (multi-add).
    $('virtuoso_lab-library-open')?.addEventListener('click', () => toggleLibrary());
    $('virtuoso_lab-library-close')?.addEventListener('click', () => toggleLibrary(false));
    $('virtuoso_lab-library-filters')?.addEventListener('click', (e) => {
      const chip = eventElement(e.target)?.closest('[data-filter]'); if (!chip) return;
      _libFilters[chip.dataset.filter] = chip.dataset.value;
      renderLibrary();
    });
    $('virtuoso_lab-library-body')?.addEventListener('click', (e) => {
      const add = eventElement(e.target)?.closest('.virtuoso_lab-lib-add'); if (!add) return;
      workoutEditor.add(add.dataset.templateId);
      const orig = add.textContent;                          // "Added ✓" flash — visual only (§5/§13), drawer stays open
      add.classList.add('added'); add.textContent = 'Added ✓';
      setTimeout(() => { add.classList.remove('added'); add.textContent = orig; }, 900);
    });
    // Starter browse drawer (Phase 9 Slice 4): the primary starter picker (the
    // dropdown is hidden). Open / close / chip-filter / Load (with replace-guard).
    $('virtuoso_lab-starters-open')?.addEventListener('click', () => toggleStarters());
    $('virtuoso_lab-starters-close')?.addEventListener('click', () => toggleStarters(false));
    $('virtuoso_lab-starters-filters')?.addEventListener('click', (e) => {
      const chip = eventElement(e.target)?.closest('[data-sfilter]'); if (!chip) return;
      _starterFilters[chip.dataset.sfilter] = chip.dataset.value;
      renderStarters();
    });
    $('virtuoso_lab-starters-body')?.addEventListener('click', (e) => {
      const rload = eventElement(e.target)?.closest('.virtuoso_lab-routine-load');
      if (rload) { loadRoutine(rload.dataset.routineId); return; }
      const rdel = eventElement(e.target)?.closest('.virtuoso_lab-routine-del');
      if (rdel) { deleteRoutine(rdel.dataset.routineId); return; }
      const load = eventElement(e.target)?.closest('.virtuoso_lab-starter-load'); if (!load) return;
      loadStarter(load.dataset.starterId);
    });
    // "Save routine" — reveal the inline name affordance; save on go/Enter.
    $('virtuoso_lab-save-routine')?.addEventListener('click', () => {
      const row = $('virtuoso_lab-routine-save-row'), input = $('virtuoso_lab-routine-name');
      const draft = workoutEditor.draft;
      if (!draft || !(draft.segments || []).length) { showStatus('Build a Workout first.'); return; }
      if (row) row.hidden = false;
      if (input) { input.value = (draft.name && draft.name !== 'Session practice') ? draft.name : ''; input.focus(); input.select(); }
    });
    $('virtuoso_lab-routine-save-cancel')?.addEventListener('click', () => { const r = $('virtuoso_lab-routine-save-row'); if (r) r.hidden = true; });
    $('virtuoso_lab-routine-save-go')?.addEventListener('click', async () => {
      const input = $('virtuoso_lab-routine-name'), row = $('virtuoso_lab-routine-save-row');
      const ok = await saveRoutine(input ? input.value : '');
      if (ok && row) row.hidden = true;
    });
    $('virtuoso_lab-routine-name')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('virtuoso_lab-routine-save-go')?.click(); } });
    $('virtuoso_lab-starters-confirm')?.addEventListener('click', (e) => {
      const yes = eventClosest(e.target, '.virtuoso_lab-starter-confirm-yes');
      if (yes) loadStarter(yes.dataset.starterId, true);
      else if (eventClosest(e.target, '.virtuoso_lab-starter-confirm-no')) { _pendingStarter = null; renderStarters(); }
    });
    // "Last session" card dismiss (delegated — the sheet body is re-rendered each open).
    $('virtuoso_lab-progress-sheet-body')?.addEventListener('click', (e) => {
      if (eventClosest(e.target, '[data-act="dismiss-summary"]')) { _lastEndedSession = null; renderProgressSheet(); }
      else {
        const sbtn = eventClosest(e.target, '[data-act="copy-card"], [data-act="download-card"]');
        if (sbtn) shareCardClick(sbtn, _lastEndedSession);   // image card → clipboard / PNG, silent
      }
    });
    $('virtuoso_lab-cheat-close')?.addEventListener('click', () => toggleCheatSheet(false));
    // Pack manager (the band-bar "+"). Open is wired on the "+" chip in
    // renderPathwayList. Close/Cancel discard the draft; Save commits + re-renders.
    $('virtuoso_lab-packs-close')?.addEventListener('click', () => togglePackManager(false));
    $('virtuoso_lab-packs-cancel')?.addEventListener('click', () => togglePackManager(false));
    $('virtuoso_lab-packs-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) togglePackManager(false); });  // scrim → cancel
    $('virtuoso_lab-packs-save')?.addEventListener('click', () => {
      if (_packsDraft) packsSave(_packsDraft);
      togglePackManager(false);
      renderPathwayList();
    });
    $('virtuoso_lab-packs-to-installed')?.addEventListener('click', () => {
      if (_packsSel && _packsSel.col === 'available') { _packInstall(_packsSel.id); _packsSel = { col: 'installed', id: _packsSel.id }; renderPackManager(); }
    });
    $('virtuoso_lab-packs-to-available')?.addEventListener('click', () => {
      if (_packsSel && _packsSel.col === 'installed') { _packUninstall(_packsSel.id); _packsSel = null; renderPackManager(); }
    });
    const _instCol = $('virtuoso_lab-packs-installed'), _availCol = $('virtuoso_lab-packs-available');
    _instCol?.addEventListener('dragover', (e) => { e.preventDefault(); const dt = e.dataTransfer; if (!dt) return; dt.dropEffect = 'move'; });
    _instCol?.addEventListener('drop', (e) => {
      e.preventDefault(); const dt = e.dataTransfer; if (!dt) return;
      const id = dt.getData('text/plain'); if (!id || !_packsDraft) return;
      const beforeId = _packRowUnder(_instCol, e.clientY);
      if (!_packsDraft.order.includes(id)) _packInstall(id);
      _packReorder(id, beforeId);
      _packsSel = null; renderPackManager();
    });
    _availCol?.addEventListener('dragover', (e) => { e.preventDefault(); const dt = e.dataTransfer; if (!dt) return; dt.dropEffect = 'move'; });
    _availCol?.addEventListener('drop', (e) => {
      e.preventDefault(); const dt = e.dataTransfer; if (!dt) return;
      const id = dt.getData('text/plain'); if (!id || !_packsDraft) return;
      _packUninstall(id); _packsSel = null; renderPackManager();
    });
    // Mixer view tabs (Console | Rig) + the Rig view actions (per-amp cab IR +
    // output trim). The Rig manages the 3 amps' cabs (per-amp, not per-strip).
    const mixEl = $('virtuoso_lab-mixer'), rigHost = $('virtuoso_lab-mixer-rig');
    mixEl?.addEventListener('click', (ev) => {
      const tab = eventClosest(ev.target, '.virtuoso_lab-mixer-viewtab');
      if (!tab) return;
      const rig = tab.dataset.view === 'rig';
      mixEl.classList.toggle('virtuoso_lab_vir-rig-view', rig);
      mixEl.querySelectorAll('.virtuoso_lab-mixer-viewtab').forEach(b => { const on = b.dataset.view === tab.dataset.view; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
      if (rig) renderRig();
    });
    /** @type {string | null | undefined} */
    let _rigPendingAmp = null;
    rigHost?.addEventListener('click', (ev) => {
      const load = eventClosest(ev.target, '.virtuoso_lab-rig-load');
      if (load) { _rigPendingAmp = load.dataset.amp; const fi = $('virtuoso_lab-rig-file'); if (fi) { fi.value = ''; fi.click(); } return; }
      const rst = eventClosest(ev.target, '.virtuoso_lab-rig-reset');
      if (rst) { const amp = rst.dataset.amp; if (rst.dataset.what === 'out') rigResetOutput(amp); else rigResetIr(amp); }
    });
    rigHost?.addEventListener('change', (ev) => {
      const fi = eventClosest(ev.target, '#virtuoso_lab-rig-file');
      if (fi && _rigPendingAmp && fi.files && fi.files[0]) { rigLoadIr(_rigPendingAmp, fi.files[0]); _rigPendingAmp = null; }
    });
    rigHost?.addEventListener('input', (ev) => {
      const out = eventClosest(ev.target, '.virtuoso_lab-rig-out');
      if (!out) return;
      const amp = out.dataset.amp, v = Math.max(0, Math.min(1.2, parseFloat(out.value) || 0));
      rigSetOutput(amp, v);
      const db = rigHost.querySelector(`.virtuoso_lab-rig-outdb[data-amp="${amp}"]`); if (db) db.textContent = String(rigOutputDb(amp)) + ' dB';
    });
    const mixCh = $('virtuoso_lab-mixer-channels');
    mixCh?.addEventListener('input', (ev) => {
      // Fader (vertical, cube-law dB taper): the slider speaks positions, the
      // engine consumes linear gain; 'master' rides the master bus over MASTER_TRIM.
      const f = eventClosest(ev.target, '.virtuoso_lab-mixer-fader');
      if (f) {
        const k = f.dataset.k, g = faderGainFromPos(Math.max(0, Math.min(1, parseFloat(f.value) || 0)));
        if (k === 'master') mixerMasterLevel = g; else mixerState[k].level = g;
        const val = mixCh.querySelector(`.virtuoso_lab-mixer-val[data-k="${k}"]`); if (val) val.textContent = faderDb(g);
        applyMixer(); mixerSave();
        return;
      }
      const pn = eventClosest(ev.target, '.virtuoso_lab-mixer-pan'); if (!pn) return;
      mixerState[pn.dataset.k].pan = Math.max(-1, Math.min(1, parseFloat(pn.value) || 0));
      applyMixer(); mixerSave();
    });
    // Pan pot reset: double-click returns the channel to its stage default.
    mixCh?.addEventListener('dblclick', (ev) => {
      const pn = eventClosest(ev.target, '.virtuoso_lab-mixer-pan'); if (!pn) return;
      const k = pn.dataset.k, ch = channelFor(k);
      mixerState[k].pan = (ch && ch.pan) || 0;
      pn.value = String(mixerState[k].pan);
      applyMixer(); mixerSave();
    });
    mixCh?.addEventListener('click', (ev) => {
      // INPUT-strip shortcuts: host settings (audio interface) / nam_tone screen.
      const go = eventClosest(ev.target, '.virtuoso_lab-mixer-inbtn');
      if (go) { toggleMixer(false); goScreen(go.dataset.go); return; }
      const t = eventClosest(ev.target, '.virtuoso_lab-mixer-tog'); if (!t) return;
      // Dim lives on the master strip now (a toggle button, not the old head checkbox).
      if (t.dataset.act === 'dim') {
        mixerBackingDim = !mixerBackingDim;
        t.classList.toggle('active', mixerBackingDim);
        t.setAttribute('aria-pressed', String(mixerBackingDim));
        applyMixer(); mixerSave();
        return;
      }
      const k = t.dataset.k, act = t.dataset.act;
      mixerState[k][act] = !mixerState[k][act];
      t.classList.toggle('active', mixerState[k][act]);
      t.setAttribute('aria-pressed', String(mixerState[k][act]));
      applyMixer(); mixerSave();
    });
    // Per-channel instrument select (Phase C) — set the override, load the voice,
    // and (if playing) re-schedule from the playhead so it switches on WAF cleanly.
    mixCh?.addEventListener('change', async (ev) => {
      // Amp select (Guide/Rhythm): bus-level insert — rewire live, no re-schedule
      // needed (sounding voices flow through the new chain). Auto resolution
      // happens in the scheduler per pass; here we wire the explicit picks and
      // let the next chunk settle an Auto.
      const ampSel = eventClosest(ev.target, '.virtuoso_lab-mixer-amp');
      if (ampSel) {
        const k = ampSel.dataset.k;
        mixerState[k].amp = ampSel.value || null;
        mixerSave();
        if (audioBus) {
          if (ampSel.value && ampSel.value !== 'off') _ampWant[k] = ampSel.value;
          else if (ampSel.value === 'off') _ampWant[k] = null;
          wireTrackAmp(audioBus.ctx, k);
        }
        return;
      }
      const kitSel = eventClosest(ev.target, '.virtuoso_lab-mixer-kit');
      const sel = kitSel || eventClosest(ev.target, '.virtuoso_lab-mixer-instr'); if (!sel) return;
      if (kitSel) mixerState[sel.dataset.k].kit = sel.value || null;
      else mixerState[sel.dataset.k].instrument = sel.value || null;
      mixerSave();
      commitLiveVoiceSwap(sel.dataset.k, !!kitSel);   // token-guarded + ready-gated + ducked (shared with the band strip)
    });
    // Mid-run downshift chip (beginner rungs): accept = close-and-arm the kinder
    // tier (load it, focus Play, start nothing); dismiss = quiet for the session
    // (the show path already recorded the rung in _downshiftSeen).
    $('virtuoso_lab-downshift-go')?.addEventListener('click', () => {
      const idx = parseInt($('virtuoso_lab-downshift-go')?.dataset.idx ?? '-1', 10);
      hideDownshiftChip();
      const pw = practiceSelection.pathwayId && practiceSelection.pathwayId !== 'custom' ? PATHWAYS[practiceSelection.pathwayId] : null;
      if (!pw || !(idx >= 0)) return;
      stopPlayback();
      practiceSelection.setTier(idx);
      practiceSelection.applyTier(pw, idx);
      syncTempoTierButtons();
      onGenerate();
      $('virtuoso_lab-play')?.focus();
    });
    $('virtuoso_lab-downshift-x')?.addEventListener('click', () => hideDownshiftChip());
    // Header Setup popover: toggle on the button, close on outside click, label tracks tuning.
    $('virtuoso_lab-setup-btn')?.addEventListener('click', (e) => { e.stopPropagation(); toggleSetupPopover(); });
    // Target-aware tuner: entry in the Setup popover; Done chip on the strip.
    $('virtuoso_lab-tune-btn')?.addEventListener('click', () => { toggleSetupPopover(false); startTuner(); });
    $('virtuoso_lab-strip-tune')?.addEventListener('click', () => startTuner());
    // Results modal: close on ✕ or an overlay click (never Escape — host-owned).
    $('virtuoso_lab-results-close')?.addEventListener('click', closeResultsModal);
    $('virtuoso_lab-results-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeResultsModal(); });
    // Show the resting-state strip on load; the delayed retry covers plugin
    // load order (the minigames / note_detect surfaces may register after us).
    ptShowIdleStrip();
    setTimeout(ptShowIdleStrip, 2000);
    $('virtuoso_lab-tuner-done')?.addEventListener('click', () => stopTuner());
    // Header tuner badge (topbar parity) — the host topbar card's exact action.
    // Feature-detected by initHostTopbar/syncTunerBadge; never touches the tuner's
    // DOM, its own public API only.
    $('virtuoso_lab-tuner-badge')?.addEventListener('click', () => {
      try { window.tuner?.toggle?.(); } catch (_) {}
    });
    // Header profile badge → the host profile screen (LINK, never a second
    // profile implementation).
    $('virtuoso_lab-profile-badge')?.addEventListener('click', () => goScreen('v3-profile'));
    // Host topbar parity init: badges + /api/tunings + host-settings read (host
    // wins over the L1 restore above for the player's guitar/bass identity) +
    // bus subscriptions. Delayed retry covers plugin load order — the tuner
    // plugin / bus may register after us (mirrors the ptShowIdleStrip retry).
    loadHostTunings().then(() => hostSettingsRead());
    initHostTopbar();
    setTimeout(initHostTopbar, 2000);
    tuningSettings.mountDisplay();
    document.addEventListener('click', (e) => {
      const pop = $('virtuoso_lab-setup-popover'); if (!pop || pop.hidden) return;
      const btn = $('virtuoso_lab-setup-btn');
      if (!pop.contains(/** @type {Node | null} */ (e.target)) && btn && !btn.contains(/** @type {Node | null} */ (e.target))) toggleSetupPopover(false);
    });
    updateSetupButton();
    // Header settings menu (⚙): toggle, items, close-on-outside-click.
    $('virtuoso_lab-settings-btn')?.addEventListener('click', (e) => { e.stopPropagation(); toggleSettingsMenu(); });
    // P-sheet affordance (the header progress chip is hidden pending the
    // profile-merge design; P hotkey + session-end auto-present stay primary).
    $('virtuoso_lab-settings-progress')?.addEventListener('click', () => { toggleSettingsMenu(false); toggleProgressSheet(true); });
    $('virtuoso_lab-settings-shortcuts')?.addEventListener('click', () => { toggleSettingsMenu(false); toggleCheatSheet(true); });
    $('virtuoso_lab-settings-host')?.addEventListener('click', () => {
      toggleSettingsMenu(false);
    try { const bus = hostBus(); if (bus && typeof bus.navigate === 'function') bus.navigate('settings'); } catch (_) {}
    });
    // Settings prefs: accent theme · default XP mode · default count-in.
    document.querySelectorAll('#virtuoso_lab-theme-pick .virtuoso_lab-theme-swatch').forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme || '')));
    document.querySelectorAll('#virtuoso_lab-xp-mode .virtuoso_lab-mini-btn').forEach(b => b.addEventListener('click', () => applyXpModeDefault(b.dataset.xp)));
    $('virtuoso_lab-countin-default')?.addEventListener('change', (e) => { try { localStorage.setItem('virtuoso_lab.countInDefault', (/** @type {HTMLSelectElement} */ (e.target)).value); } catch (_) {} applyCountInDefault((/** @type {HTMLSelectElement} */ (e.target)).value); });
    document.querySelectorAll('#virtuoso_lab-countin-grid .virtuoso_lab-mini-btn').forEach(b => b.addEventListener('click', () => { try { localStorage.setItem('virtuoso_lab.countInGrid', b.dataset.grid); } catch (_) {} applyCountInGrid(b.dataset.grid); }));
    document.querySelectorAll('#virtuoso_lab-energy-pick .virtuoso_lab-mini-btn').forEach(b => b.addEventListener('click', () => applyEnergy(b.dataset.energy)));
    renderCardSkinPicker('signature');
    document.querySelectorAll('#virtuoso_lab-skinscope-pick .virtuoso_lab-mini-btn').forEach(b => b.addEventListener('click', () => applySkinScope(b.dataset.skinscope)));
    loadSettingsPrefs();
    document.addEventListener('click', (e) => {
      const menu = $('virtuoso_lab-settings-menu'); if (!menu || !menu.classList.contains('virtuoso_lab_vir-open')) return;
      const btn = $('virtuoso_lab-settings-btn');
      if (!menu.contains(/** @type {Node | null} */ (e.target)) && btn && !btn.contains(/** @type {Node | null} */ (e.target))) toggleSettingsMenu(false);
    });
    practicePresets.mount();
    $('virtuoso_lab-launch-session')?.addEventListener('click', onLaunchSession);
    workoutEditor.mount('options');
    workoutEditor.select(Object.keys(BUILT_IN_SESSIONS)[0]);

    practicePresets.load();
    loadSavedRoutines().then(() => { if ($('virtuoso_lab-root')?.classList.contains('virtuoso_lab-session-mode')) renderStarters(); });   // surface the user's saved routines in the starter picker
    // Populate the Shape dropdown for the initial (key, system) before any
    // pathway runs — initial selection may set the shape value, but it
    // can't select an option that doesn't exist yet.
    practiceSelection.syncShapes();
    practiceSelection.syncShapeHidden();
    practiceSelection.initial();
    renderSkillTree();
    syncTransport();
    // If the URL carries a share hash, replay the snapshotted form values
    // *after* initial selection has set up the pathway-driven defaults.
    // The share state wins over the pathway defaults, but the pathway
    // dropdown's value is part of the snapshot — so the GOAL card and the
    // pathway-mode CSS stay correctly applied.
    const sharedState = readShareHash();
    if (sharedState) {
      practiceSelection.cancelInitial();
      applyFormState(sharedState);
      practiceSelection.syncShapes();
      practiceSelection.syncShapeHidden();
      practicePresentation.renderPosition();
      syncInstrumentClass();
      syncAdvancedMode();
      syncChromaticVisibility();
    } else {
      practiceSelection.resumeMode();   // returning user resumes their last mode; first-run stays on Pathways
    }
    syncViewSwitcher(document.querySelector('[name="renderer"]')?.value || 'highway_3d');
    window.addEventListener('storage', (ev) => { if (ev.key === 'invertHighway' || ev.key === 'lefty' || ev.key === 'renderScale') refreshForHostSettingChange(); });
    window.addEventListener('focus', refreshForHostSettingChange);
    // On window resize the renderers re-size their canvas (which clears it) but
    // don't redraw — so a paused view goes blank. Redraw after a debounce, which
    // also lands AFTER the renderers' own synchronous resize handlers. While
    // playing, the rAF loop already redraws, so this is a no-op there.
    rendererLifecycle.mount();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { refreshForHostSettingChange(); if (transport.playing && !transport.paused) acquireWakeLock(); } });   // re-acquire the wake lock the browser auto-released on hide (not while paused — pause released it on purpose)
    // Flush any in-progress session on page hide / unload so duration is saved
    // even if the user closes the tab or navigates away while the preview plays.
    // Unload can be canceled and pagehide can enter BFCache. Keep DOM listeners;
    // confirmed SPA screen exits own teardown, destroyed documents clean themselves.
    const onPageHide = () => { if (transport.playing) sessionEnd(); };
    window.addEventListener('beforeunload', onPageHide);
    window.addEventListener('pagehide', onPageHide);
    syncProgressStrip();
    // Defend against blank-on-load: when the host SPA navigates to the
    // Virtuoso screen, re-attach the renderer. The initial bind() may have
    // run while the screen was still hidden (host=0x0), and even the
    // ResizeObserver fallback can fire before the renderer has a stable
    // size. A re-attach when the screen becomes visible is cheap and makes
    // the initial paint reliable. (Also covers re-entry after the user
    // navigated to Library or another screen and came back.)
    /** @type {(() => void) | null} */
    let fireInitialGenerate = null; // set by fireInitialGenerateWhenLaidOut below; idempotent
    let screenVisible = false;
    const screenBus = hostBus();
    if (screenBus && typeof screenBus.on === 'function') {
      screenBus.on('screen:changed', (ev) => {
        if (ev?.detail?.id !== 'plugin-virtuoso_lab') { workoutEditor.unmount(); tuningSettings.unmount(); practicePresets.unmount(); screenVisible = false; practiceSelection.leave(); rendererLifecycle.unmount(); activeBundle = null; lastExercise = null; return; }
        if (screenVisible) return;
        screenVisible = true;
        rendererLifecycle.mount();
        workoutEditor.unmount(); workoutEditor.mount('timeline'); workoutEditor.mount('options'); workoutEditor.render();
        tuningSettings.unmount(); tuningSettings.mount(); tuningSettings.mountDisplay(); tuningSettings.syncInputs();
        practicePresets.unmount(); practicePresets.mount(); practicePresets.load();
        practiceSelection.enter();
        // Sidebar always shows when the plugin is (re)selected.
        panelCollapsed = false; syncPanelToggle();
        if (lastExercise) {
          // attachRenderer re-syncs the view row to the actual renderer.
          attachRenderer(lastExercise).catch(e => console.warn('[Virtuoso] re-attach on screen show failed', e));
        } else if (!fireInitialGenerate?.()) {
          // Binding's initial generation is once-only, but each later visit
          // needs a fresh generated chart after navigation clears file ownership.
          onGenerate();
        }
      });
    }
    // Wait until the render host has real dimensions before firing the
    // initial generate. The host may be 0x0 while the plugin screen is
    // still being laid out; if attachRenderer runs against a 0x0 canvas,
    // nothing visible draws. A double-rAF wasn't enough on its own.
    (function fireInitialGenerateWhenLaidOut() {
      const host = $('virtuoso_lab-render-host');
      if (!host || typeof ResizeObserver === 'undefined') { onGenerate(); return; }
      let fired = false;
      const fire = () => { if (fired) return false; fired = true; try { ro.disconnect(); } catch (_) {} onGenerate(); return true; };
      fireInitialGenerate = fire;
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          const w = entry.contentRect.width, h = entry.contentRect.height;
          if (w > 0 && h > 0) { fire(); return; }
        }
      });
      ro.observe(host);
      // Failsafe in case the observer never reports non-zero. Hidden-mount
      // guard (2026-06-07, live console report): at host boot with another
      // screen active this used to FORCE a generate against the hidden
      // screen — the borrowed highway_3d aborts on a parentless canvas
      // ("[Virtuoso] generate failed: initScene failed"). When the host can
      // tell us about screen shows, defer instead: the RO keeps watching and
      // the screen:changed hook above fires the deferred initial generate.
      setTimeout(() => {
        const bus = hostBus();
        if (!host.offsetParent && bus && typeof bus.on === 'function') return;
        fire();
      }, 1000);
    })();
    return true;
  }
  function boot() {
    practiceSelection.initialize();
    if (bind()) return;
    let tries = 0;
    const timer = setInterval(() => { tries += 1; if (bind() || tries > 40) clearInterval(timer); }, 250);
  }

  // A-B segment loop public API. See docs/archive/section-looping.md for the spec.
  // No UI yet — this is the transport-layer foundation that a phase-2 UI
  // (or a sibling plugin / driver script) can drive.
  /** @param {unknown} a @param {unknown} b */
  function setSegmentLoop(a, b) {
    const aNum = Number(a), bNum = Number(b);
    if (!Number.isFinite(aNum) || !Number.isFinite(bNum) || bNum <= aNum) {
      throw new Error(`setSegmentLoop: requires finite a and b with b > a (got a=${a}, b=${b})`);
    }
    const duration = activeBundle?.songInfo?.duration ?? Infinity;
    if (aNum < 0 || bNum > duration + 0.0001) {
      throw new Error(`setSegmentLoop: endpoints must lie within [0, ${duration}] (got a=${aNum}, b=${bNum})`);
    }
    transport.setLoop(aNum, bNum);
    // Seek the playhead to A so the next tick wraps cleanly inside the loop.
    transport.moveCursor(aNum);
    if (transport.playing && !transport.paused) {   // paused stays silent; resume re-anchors from A
      // Re-anchor the play clock and re-schedule audio from A so the listener
      // hears the loop region immediately, not silence until the next wrap.
      // Use the chunk scheduler (not a one-shot schedule) so the rolling window
      // is tracked from here and the B→A seam stays gapless (bounded at B inside
      // scheduleCurrentPassAndAnchor — see the A-B wrap branch in tick()).
      anchorPlayClock(aNum);
      stopAudio();
      scheduleCurrentPassAndAnchor(AUDIO_LOOKAHEAD_SECONDS);
    } else {
      drawOnce();
    }
    const bus = hostBus();
    if (bus && typeof bus.emit === 'function') {
      bus.emit('virtuoso_lab:loop:set', { a: aNum, b: bNum });
    }
  }
  function clearSegmentLoop() {
    if (transport.loopA == null && transport.loopB == null) return;
    transport.setLoop(null, null);
    const bus = hostBus();
    if (bus && typeof bus.emit === 'function') {
      bus.emit('virtuoso_lab:loop:clear', {});
    }
  }
  function getSegmentLoop() { return { a: transport.loopA, b: transport.loopB }; }

  window.VirtuosoLab = { generateExercise, generateSession, makeBundle, resolveRendererFactory, readConfig, setSegmentLoop, clearSegmentLoop, getSegmentLoop, STYLE_PALETTES, stylePaletteConfig, SEGMENT_TEMPLATES, SEGMENT_ROLES, BUILT_IN_SESSIONS, rollSegment, refreshWorkout, applyLengthPreset, materializeSegment, progressLoad, progressSave, progressSetMode, advanceDepthLadder, nodeProgressState, woodshedLog, streakCount, creditBlockTier, xpLevelInfo, computeBadges, creditBadges, shareCardText, isShareworthy, feltHoldAnalyze, creditFeltRung, shareCardModel, renderShareCardImage,
    // J-2 + sampled-guitar probe surface (feature entry points / readouts, not new behavior)
    jamArmFromDrill, jamTargetPcs, jamNextGuidePcs,
    // Gold rung harness surface (smoke-gold.mjs): pure gate math + store.
    goldDebug: {
      bar: GOLD_BAR,
      reset: goldReset,
      mirror: () => _goldMirror,
      seed: (/** @type {Partial<{confirmed: number, inChord: number, inKey: number, outside: number, pcs: Iterable<number>, chordHops: number, lastSeg: string | null, comb: boolean}> | null} */ m) => { _goldMirror = Object.assign({ confirmed: 0, inChord: 0, inKey: 0, outside: 0, pcs: new Set(), chordHops: 0, lastSeg: null, comb: false }, m, m && m.pcs ? { pcs: new Set(m.pcs) } : {}); },
      evaluate: goldEvaluate,
      store: goldStore,
      midiTarget: goldMidiTarget,
      armed: () => _goldArmed,
    },
    getActiveBundleInfo: () => activeBundle ? { config: activeBundle.config, duration: activeBundle.songInfo && activeBundle.songInfo.duration, leadIn: activeBundle.leadIn } : null,
    sgStats: () => { const /** @type {Record<string, number>} */ out = { ready: 0, loading: 0, failed: 0 }; for (const k of Object.keys(sgBuffers)) out[sgBuffers[k].state] = (out[sgBuffers[k].state] || 0) + 1; return out; } };
  if (typeof globalThis !== 'undefined' && globalThis.__VIRTUOSO_LAB_HARNESS__) globalThis.__virtuoso_lab_debug = { STRING_SETUPS, resolveCAGEDShape, resolveThreeNPSPosition, NOTE_ALIASES, chordRootForDegree, nearestPositionForPc, compileChordTimeline, MOTIF_CELLS, resolveMotifCell, buildMotifExercise, applyTimelinePush, resolveHumanSeed, parseMeter, BASS_FIGURES, bassFigureForConfig, DRUM_GROOVES, DRUM_PIECE_GAIN, resolveGroove, ARRANGEMENT_RECIPES, resolveArrangement, compCellForConfig, DRUMKIT_BANKS, KIT_REGISTRY, resolveDrumKit, recipeTracks, buildCompCellHits, activeBundleBacking: () => activeBundle ? activeBundle.backingEvents : null, activeBundleChords: () => activeBundle ? activeBundle.chords : null, activeBundleCfg: () => activeBundle ? activeBundle.config : null, activeBundleTimeline: () => activeBundle ? (activeBundle.timeline || (activeBundle.chart && activeBundle.chart.timeline)) : null, irState: () => Object.fromEntries(Object.entries(_irBufs).map(([k, v]) => [k, v.state])), rigState: () => JSON.parse(JSON.stringify(rigState)), buildDrumEvents, drawHeatmapHero, drawLeanStripHero, buildResultsHero, countInSubTicks, blockFeltInfo, ptPracticeTime: () => transport.time, preRollUntil: () => transport.preRollUntil, wrapAnim: () => _wrapAnim, ptWindows: () => _ptWin, ptRunInfo: () => _ptRunInfo, ptPreviewJudgeCounts, ptSpeakBudget, ptScoredUnits: () => _ptScoredUnits, lvlMode: () => _lvlMode, ndContainedMode: () => _ndContainedMode, ndContainedFallback: () => _ndContainedFallback, ndVerifyMode: () => _ndVerifyMode, ptCalibrateOffsetMs, ptLatency, pickSinkMatch, sinkTokens, applyHostSink, sinkState: () => ({ appliedId: _sinkAppliedId, mismatch: _sinkMismatch, outs: _sinkLastOuts }), audioCtxRef: () => audioCtx, resolveAudioProfile, resolveMix, resolveAmpId, sgNotesWanted, sgHarmWanted, sgPadWanted, applyStyleMixerDefaults, sgFilesFor, bankDesc, bankLayerTag, SAMPLE_BANKS, compTargetMidis, COMP_GROOVES, wafGmTrim, WAF_GM_TRIM, TONE_GM, liveInstrumentReady, prewarmMixerCandidates, jamApplyToken: () => _jamApplyToken, mixerStateRef: () => mixerState, jamMirrorCapture, jamMirrorReset, jamMirrorDebugAdd, jamRecapAnalysisLines, jamBassIntents, jamSpotlightPhraseNotes, jamMirror: () => _jamMirror ? { noteCount: _jamMirror.noteCount, pcs: [..._jamMirror.pcs] } : null, jamPlayedLen: () => _jamPlayed.length, jamSpotlightTurn, activeBundleNotes: () => activeBundle ? activeBundle.notes : null,
    busRms: () => { const /** @type {Record<string, number>} */ out = {}; if (audioBus && audioBus.analysers) { for (const k in audioBus.analysers) { const an = audioBus.analysers[k]; const buf = new Float32Array(an.fftSize); an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; out[k] = Math.sqrt(s / buf.length); } } return out; },
    busGains: () => { const /** @type {Record<string, number>} */ out = {}; if (audioBus && audioBus.tracks) { for (const k in audioBus.tracks) out[k] = audioBus.tracks[k].gain.value; } return out; }, ampState: () => ({ want: { ..._ampWant }, wired: audioBus && audioBus.amps ? Object.fromEntries(Object.entries(audioBus.amps).map(([k, v]) => [k, v.id])) : null }), avSync: () => (audioCtx ? { ctxNow: audioCtx.currentTime, perfNow: performance.now(), outputLatency: Number(audioCtx.outputLatency) || 0, baseLatency: Number(audioCtx.baseLatency) || 0, scheduledUntilCtx, schedChartPos, playAnchorMs:transport.anchorMs, playAnchorChartTime:transport.anchorTime, playAnchorCtx:transport.anchorAudio, practiceTime: transport.time, playing:transport.playing, paused:transport.paused } : null) };
  // Keep test-only audio probes out of the characterized enumerable core API.
  if (typeof globalThis !== 'undefined' && globalThis.__VIRTUOSO_LAB_HARNESS__) Object.defineProperty(globalThis.__virtuoso_lab_debug, 'audioRemoval', {
    value: { mixerLoad, sgToneFor, buildAmpChain, cabIrBuffer, AMP_PRESETS, MIXER_INSTRUMENTS }
  });
  if (typeof globalThis !== 'undefined' && globalThis.__VIRTUOSO_LAB_HARNESS__) Object.defineProperty(globalThis.__virtuoso_lab_debug, 'lifecycle', {
    value: { bind, boot, initialize:practiceSelection.initialize, pathways:PATHWAYS, applyPathway:applyPathwayById,
      sessionBegin, session:() => _activeSession, advanceTier:advancePathwayTier,
      tier:(/** @type {number} */ idx) => { practiceSelection.setTier(idx); practiceSelection.applyTier(PATHWAYS[String(practiceSelection.pathwayId)], idx); },
      generate: onGenerate, load: practiceSelection.loadFile, clear: practiceSelection.clearFile, switchView: onViewSwitch, stop: stopRenderer,
      jam: jamPlay, workout: onLaunchSession,
      customTuningSync: tuningSettings.syncInputs,
      playback: (/** @type {((bundle: import('./src/types/entry-data.js').EntryBundle | null) => void) | null} */ start, /** @type {((bundle: import('./src/types/entry-data.js').EntryBundle | null) => Promise<void>) | null} */ voices) => { playbackProbe = start; voicesProbe = voices; },
      resolveFactory: (/** @type {Parameters<typeof rendererLifecycle.setFactoryProbe>[0]} */ probe) => { rendererLifecycle.setFactoryProbe(probe); },
      state: () => ({ renderer:rendererLifecycle.renderer, activeBundle, lastExercise, loadedPracticeFile:practiceSelection.file, currentPracticeTime:transport.time }) }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
import { STRING_SETUPS, TUNING_PRESETS, TUNING_TO_SETUP, openMidisForConfig, tuningOffsetsForConfig, isBassCfg, hostStandardMidisFor } from './src/core/instrument-tuning.js';
import { makeBuiltin2DTabRenderer as makeTabRenderer } from './src/shell/renderers/tab.js';
import { makeBuiltin2DNotationRenderer as makeNotationRenderer } from './src/shell/renderers/notation.js';
import { RENDER_THEMES, rhGlyph, stringLabelForMidi, chartBeatSeconds } from './src/shell/renderers/display-policy.js';
import { createWorkoutEditor } from './src/shell/workout-editor.js';
import { KIND_COLORS, KIND_LABELS } from './src/shell/workout-display.js';
import { createTuningSettings } from './src/shell/tuning-settings.js';
