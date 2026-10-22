import assert from 'node:assert/strict';
import test from 'node:test';
import { PATHWAYS } from '../src/content/pathways.js';
import { PATHWAY_BANDS } from '../src/content/pathway-bands.js';
import { SEGMENT_TEMPLATES } from '../src/content/segments.js';
import { AUDIO_FAMILY_DEFAULTS, AUDIO_PROFILES } from '../src/core/audio-profiles.js';
import { ARRANGEMENT_RECIPES, ARRANGEMENT_TIERS } from '../src/core/arrangement.js';
import { BASS_FIG_CEIL, BASS_FIG_FLOOR, BASS_FIGURES } from '../src/core/bass-figures.js';
import { BANJO_DRONE_BY_TONIC, COMP_ARTIC, COMP_GROOVES, TGT } from '../src/core/comp-cells.js';
import { COMMON_PROGRESSIONS } from '../src/core/harmony.js';
import { DRUM_GROOVES } from '../src/core/drum-grooves.js';
import { JAM_PROG_LABELS, STYLE_PALETTES } from '../src/core/style-palettes.js';
import { PRACTICE_APPLICABILITY } from '../src/core/practice-selection.js';
import { STRUM_PATTERNS } from '../src/core/builders/strum.js';
import { CHORD_FORMULAS } from '../src/core/chord-theory.js';
import { SCALE_INTERVALS } from '../src/core/scale-intervals.js';
import { STRUM_GRIPS } from '../src/core/strum-grips.js';
import { ACOUSTIC_PIECES, BJ_KCS, DRUMKIT_BANKS, KIT_REGISTRY, TONE_GM, drumFile, drumVar, SAMPLED_DRUM_NOTES } from '../src/core/audio-registries.js';

test('authored audio kit and bank registries reference declared banks and round robins', () => {
  for (const [id, kit] of Object.entries(KIT_REGISTRY)) {
    assert.ok(!kit.bank || DRUMKIT_BANKS[kit.bank], `[Virtuoso drumkit] ${id} bank "${kit.bank}" missing`);
  }
  for (const [bankId, bank] of Object.entries(DRUMKIT_BANKS)) {
    for (const [piece, token] of Object.entries(bank.src)) {
      assert.notEqual(bank.rr[token], null, `[Virtuoso drumkit] ${bankId}.${piece} → token "${token}" has no rr count`);
      assert.notEqual(bank.rr[token], undefined, `[Virtuoso drumkit] ${bankId}.${piece} → token "${token}" has no rr count`);
    }
  }
  assert.deepEqual(Object.keys(ACOUSTIC_PIECES).length, 18);
  assert.ok(SAMPLED_DRUM_NOTES instanceof Set);
  assert.equal(drumFile(36, 'FluidR3_GM', 0), '12836_0_FluidR3_GM_sf2_file.js');
  assert.equal(drumVar(36, 'FluidR3_GM', 0), '_virtuoso_lab_drum_36_0_FluidR3_GM_sf2_file');
});

test('style palettes reference known progressions, scales, profiles and Jam labels', () => {
  for (const [id, palette] of Object.entries(STYLE_PALETTES)) {
    for (const progression of palette.progressions) {
      assert.ok(COMMON_PROGRESSIONS[progression], `[Virtuoso style-palette] ${id} references unknown progression "${progression}"`);
      assert.ok(JAM_PROG_LABELS[progression], `[Virtuoso jam] ${id} progression "${progression}" needs a JAM_PROG_LABELS label`);
    }
    for (const scale of palette.leadScales) {
      assert.ok(SCALE_INTERVALS[scale], `[Virtuoso style-palette] ${id} references unknown scale "${scale}"`);
    }
    assert.ok(!palette.audioProfile || AUDIO_PROFILES[palette.audioProfile],
      `[Virtuoso style-palette] ${id} references unknown audioProfile "${palette.audioProfile}"`);
  }
});

test('authored pathway anchor fields and density ladders are valid', () => {
  for (const [id, pathway] of Object.entries(PATHWAYS)) {
    const anchored = (pathway.base || {}).anchor === 'open_lowest';
    for (const variant of [pathway.base || {}, ...(pathway.vary || [])]) {
      assert.ok(variant.anchor == null || variant.anchor === 'open_lowest',
        `[Virtuoso anchor] ${id}: unknown anchor '${variant.anchor}'`);
      assert.ok(variant.anchorFret == null || (Number.isInteger(variant.anchorFret) && variant.anchorFret >= 0 && variant.anchorFret <= 11),
        `[Virtuoso anchor] ${id}: anchorFret ${variant.anchorFret} out of range 0-11 (12+ aliases down an octave — re-author)`);
      assert.ok(!(anchored && variant.key != null),
        `[Virtuoso anchor] ${id}: 'key' co-coded with anchor:'open_lowest' — the key is DERIVED; author anchorFret instead`);
      assert.ok(anchored || (variant.anchor == null && variant.anchorFret == null),
        `[Virtuoso anchor] ${id}: anchor fields without anchor:'open_lowest' in base`);
    }

    const tiers = pathway.tempoTiers || [];
    if (pathway.tempoTierSubdivs || pathway.tempoTierBars) {
      if (pathway.tempoTierSubdivs) {
        assert.equal(pathway.tempoTierSubdivs.length, tiers.length,
          `[Virtuoso tier-ladder] ${id}: tempoTierSubdivs length ${pathway.tempoTierSubdivs.length} ≠ tempoTiers length ${tiers.length}`);
        for (const subdivision of pathway.tempoTierSubdivs) {
          assert.ok(['quarter', 'eighth', 'triplet', 'eighth_triplet', 'sixteenth', 'sixteenth_triplet'].includes(subdivision),
            `[Virtuoso tier-ladder] ${id}: unknown tier subdivision '${subdivision}'`);
        }
      }
      if (pathway.tempoTierBars) {
        assert.equal(pathway.tempoTierBars.length, tiers.length,
          `[Virtuoso tier-ladder] ${id}: tempoTierBars length ${pathway.tempoTierBars.length} ≠ tempoTiers length ${tiers.length}`);
      }
      for (let i = 1; i < tiers.length; i++) {
        assert.ok(tiers[i] > tiers[i - 1],
          `[Virtuoso tier-ladder] ${id}: tempoTiers must be strictly increasing when a density ladder is declared (bpm→tier crediting scans 'bpm ≥ tier'); got ${tiers[i - 1]} → ${tiers[i]}`);
      }
    }
  }

  const perBeat = { quarter: 1, eighth: 2, triplet: 3, eighth_triplet: 3, sixteenth: 4, sixteenth_triplet: 6 };
  const beginner = PATHWAY_BANDS.find(band => band.id === 'core_beginner');
  for (const id of beginner?.pathways || []) {
    const pathway = PATHWAYS[id];
    if (!pathway?.tempoTiers?.length) continue;
    const subdivision = pathway.tempoTierSubdivs?.[0] || pathway.base?.subdivision;
    const density = perBeat[String(subdivision)];
    if (density == null) continue;
    const notesPerSecond = (pathway.tempoTiers[0] / 60) * density;
    assert.ok(notesPerSecond <= 2.4,
      `[Virtuoso tier-ladder] ${id}: core_beginner tier 0 is ${notesPerSecond.toFixed(1)} notes/sec (${subdivision}@${pathway.tempoTiers[0]}) — over the ~2/sec beginner floor; ramp density before BPM`);
  }
});

test('style pathway packs declare a curricular foundation and family', () => {
  for (const band of PATHWAY_BANDS) {
    if (band.kind !== 'style') continue;
    assert.ok(band.buildsOn && band.family,
      `[Virtuoso pack] style pack "${band.id}" must declare buildsOn + family`);
  }
});

test('practice applicability tags use only the supported values', () => {
  for (const [practice, instruments] of Object.entries(PRACTICE_APPLICABILITY)) {
    for (const [instrument, value] of Object.entries(instruments)) {
      assert.ok(['native', 'adapted', 'n-a'].includes(value),
        `[Virtuoso applicability] ${practice}.${instrument} = "${value}" is not native/adapted/n-a`);
    }
  }
});

test('audio profiles refer to known tone, pad role, kit and family registries', () => {
  const roles = ['sustain', 'comp', 'counter'];
  for (const [id, profile] of Object.entries(AUDIO_PROFILES)) {
    for (const [slotName, slot] of Object.entries({ harmony: profile.harmony, bass: profile.bass, pad: profile.pad, notes: profile.notes })) {
      if (slot && (slot.engine == null || slot.engine === 'sample') && slot.tone != null) {
        assert.ok(slot.tone in TONE_GM, `[Virtuoso audio-profile] ${id} ${slotName} tone "${slot.tone}" is not a TONE_GM voice`);
      }
    }
    assert.ok(profile.pad?.role == null || roles.includes(profile.pad.role),
      `[Virtuoso audio-profile] ${id} pad.role "${profile.pad?.role}" not in ${roles.join('|')}`);
    assert.ok(profile.drums?.kit == null || KIT_REGISTRY[profile.drums.kit],
      `[Virtuoso audio-profile] ${id} drums.kit "${profile.drums?.kit}" is not a KIT_REGISTRY kit`);
    assert.ok(!profile.family || AUDIO_FAMILY_DEFAULTS[profile.family],
      `[Virtuoso audio-profile] ${id} family "${profile.family}" unknown`);
  }
});

test('authored comp grids and their variants have valid shape and tokens', () => {
  for (const [id, cell] of Object.entries(COMP_GROOVES)) {
    const expected = (cell.bars || 1) * 4 * cell.div;
    assert.ok(cell.label, `[Virtuoso comp-groove] ${id} has no player-facing label`);
    const checkGrid = (grid, label) => {
      assert.equal(grid.length, expected, `[Virtuoso comp-groove] ${id} ${label} has ${grid.length} steps, expected ${expected}`);
      for (const step of grid) {
        if (step === '.') continue;
        assert.ok(step && typeof step === 'object' && TGT.has(step.t) && COMP_ARTIC[step.a] != null,
          `[Virtuoso comp-groove] ${id} ${label} has a bad step ${JSON.stringify(step)}`);
      }
    };
    checkGrid(cell.grid, 'grid');
    cell.vary?.forEach((grid, index) => checkGrid(grid, `vary[${index}]`));
  }
});

test('banjo drone MIDI values are known keycenters', () => {
  for (const [pc, midi] of Object.entries(BANJO_DRONE_BY_TONIC)) {
    assert.ok(BJ_KCS.includes(midi), `[Virtuoso banjo] drone MIDI ${midi} (tonic pc ${pc}) is not a BJ_KCS keycenter`);
  }
});

test('bass figures have valid beat-one roots and playable root windows', () => {
  for (const [id, figure] of Object.entries(BASS_FIGURES)) {
    assert.ok(figure.label, `[Virtuoso bass-figure] ${id} has no player-facing label`);
    if (figure.kind === 'gen') continue;
    const expected = (figure.bars || 1) * 4 * figure.div;
    assert.ok(Array.isArray(figure.grid) && figure.grid.length === expected,
      `[Virtuoso bass-figure] ${id} grid has ${(figure.grid || []).length} steps, expected ${expected}`);
    let maxInterval = 0;
    for (const step of figure.grid) {
      if (step === '.') continue;
      assert.ok(step && typeof step === 'object' && Number.isFinite(step.iv) && step.iv >= 0 && step.iv <= 12,
        `[Virtuoso bass-figure] ${id} has a bad step ${JSON.stringify(step)}`);
      maxInterval = Math.max(maxInterval, step.iv);
    }
    assert.ok(figure.grid[0] !== '.' && figure.grid[0]?.iv === 0,
      `[Virtuoso bass-figure] ${id} must land the ROOT on beat 1 (the kick lock)`);
    assert.ok(BASS_FIG_CEIL - maxInterval >= BASS_FIG_FLOOR,
      `[Virtuoso bass-figure] ${id} maxIv ${maxInterval} leaves no root window under the ${BASS_FIG_CEIL} ceiling`);
  }
});

test('arrangement recipes resolve their referenced backing data', () => {
  for (const [key, recipe] of Object.entries(ARRANGEMENT_RECIPES)) {
    const parts = key.split(':');
    assert.ok(parts.length === 3 && ARRANGEMENT_TIERS.includes(parts[2]),
      `[Virtuoso arrangement] bad recipe key "${key}" — want style:feel:tier with tier in ${ARRANGEMENT_TIERS.join('|')}`);
    const picks = recipe.picks || {};
    assert.ok(!picks.comp || COMP_GROOVES[picks.comp], `[Virtuoso arrangement] ${key} comp "${picks.comp}" is not a COMP_GROOVES cell`);
    assert.ok(!picks.bass || BASS_FIGURES[picks.bass], `[Virtuoso arrangement] ${key} bass "${picks.bass}" is not a BASS_FIGURES figure`);
    assert.ok(!picks.drums || DRUM_GROOVES[picks.drums], `[Virtuoso arrangement] ${key} drums "${picks.drums}" is not a DRUM_GROOVES groove`);
    for (const track of recipe.tracks || []) {
      assert.ok(track.id && track.cell, `[Virtuoso arrangement] ${key} track needs {id, cell}`);
      assert.ok(COMP_GROOVES[track.cell], `[Virtuoso arrangement] ${key} track "${track.id}" cell "${track.cell}" is not a COMP_GROOVES cell`);
      assert.ok(track.voice == null || track.voice in TONE_GM,
        `[Virtuoso arrangement] ${key} track "${track.id}" voice "${track.voice}" is not a TONE_GM voice`);
    }
  }
});

test('strum patterns fill their authored bars', () => {
  for (const [id, pattern] of Object.entries(STRUM_PATTERNS)) {
    const expected = (pattern.bars || 1) * 4 * pattern.div;
    assert.equal(pattern.grid.length, expected,
      `[Virtuoso strum-pattern] ${id} grid has ${pattern.grid.length} steps, expected ${expected} (bars×4×div)`);
  }
});

test('authored strum grips voice their formula without impossible fingers or unisons', () => {
  const opens = [40, 45, 50, 55, 59, 64];
  for (const [quality, grips] of Object.entries(STRUM_GRIPS)) {
    const formulaEntry = CHORD_FORMULAS[quality];
    assert.ok(formulaEntry, `[Virtuoso strum-grip] ${quality} has no CHORD_FORMULAS entry`);
    const formula = new Set(formulaEntry.intervals.map(interval => ((interval % 12) + 12) % 12));
    const hasThird = formula.has(4), hasFlatThird = formula.has(3);
    const hasSeventh = formula.has(10) || formula.has(11);
    const extensions = formulaEntry.intervals.filter(interval => interval >= 13);
    const headline = extensions.length ? ((Math.max(...extensions) % 12) + 12) % 12 : null;
    for (const grip of grips) {
      const byFinger = new Map();
      for (const note of grip.notes) {
        if (!note.fg) continue;
        if (!byFinger.has(note.fg)) byFinger.set(note.fg, new Set());
        byFinger.get(note.fg).add(note.fOff);
      }
      for (const [finger, offsets] of byFinger) {
        assert.ok(offsets.size <= 1,
          `[Virtuoso strum-grip] ${quality}/${grip.form} finger ${finger} spans ${offsets.size} frets (impossible)`);
      }
      for (const rootFret of [3, 5, 7, 9]) {
        const rootMidi = opens[grip.rootStr] + rootFret;
        const midis = [];
        const pitches = new Set();
        for (const note of grip.notes) {
          const midi = opens[note.s] + rootFret + note.fOff;
          midis.push(midi);
          pitches.add(((midi - rootMidi) % 12 + 12) % 12);
        }
        const tag = `${quality}/${grip.form}@${rootFret}`;
        assert.equal(new Set(midis).size, midis.length, `[Virtuoso strum-grip] ${tag} doubles a MIDI (unison)`);
        for (const pitch of pitches) assert.ok(formula.has(pitch), `[Virtuoso strum-grip] ${tag} has non-chord-tone ${pitch}`);
        assert.ok(pitches.has(0), `[Virtuoso strum-grip] ${tag} missing the root`);
        assert.ok(pitches.size >= 3, `[Virtuoso strum-grip] ${tag} has <3 distinct tones`);
        if (hasThird) assert.ok(pitches.has(4), `[Virtuoso strum-grip] ${tag} missing the 3rd`);
        if (!hasThird && hasFlatThird) assert.ok(pitches.has(3), `[Virtuoso strum-grip] ${tag} missing the ♭3`);
        if (hasSeventh) assert.ok(pitches.has(10) || pitches.has(11), `[Virtuoso strum-grip] ${tag} missing the 7th`);
        if (headline != null) assert.ok(pitches.has(headline), `[Virtuoso strum-grip] ${tag} missing the headline extension ${headline}`);
      }
    }
  }
});

test('segment templates have valid credit tags', () => {
  const creditRoles = new Set(['technique', 'scale_arp', 'application', 'review']);
  const excludedKinds = new Set(['chromatic', 'modal_vamp']);
  for (const [id, template] of Object.entries(SEGMENT_TEMPLATES)) {
    if (!template.creditsPathway) continue;
    assert.ok(PATHWAYS[template.creditsPathway],
      `[Virtuoso credit-tag] ${id}: creditsPathway "${template.creditsPathway}" is not a PATHWAYS id`);
    assert.ok(creditRoles.has(template.role),
      `[Virtuoso credit-tag] ${id}: role "${template.role}" cannot credit (warmup/cooldown/jam never flip)`);
    assert.ok(!excludedKinds.has(template.kind),
      `[Virtuoso credit-tag] ${id}: kind "${template.kind}" cannot credit a flip`);
  }
});
