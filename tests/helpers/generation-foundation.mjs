// Inputs only: subjects execute through the complete entry or native imports.
export const foundationNames = ['hashStringToSeed','mulberry32','resolveHumanSeed','chartRng','shuffleCopy','applySequencePattern','directedPath','reflectIdx','nearestPositionForPc','scalePcs','positionsForPitchClass','allScalePositions','everyScalePosition','singleStringScalePositions','startAtRootPc','dedupeUnisons','shapeNotesToPositions','scalePositionsForSystem','bassFingerFor','applyBassFingering','buildBeats','buildAnchors','orientSeq','fillNotesFromSeq','buildScaleExercise','buildChordScaleExercise','buildArpeggioExercise','buildSweepArpeggioExercise','buildSpiderExercise','buildBendingExercise','buildLegatoExercise','buildVibratoExercise','buildScaleThirdsExercise','buildScaleSixthsExercise','buildCallResponseExercise','buildTremoloPickingExercise','buildHertaExercise','buildRhythmPulseExercise','buildPedalPointExercise','buildStringSkippingExercise','buildPositionShiftExercise','buildRhythmicDisplacementExercise','buildBebopScaleExercise','buildHybridPickingExercise','buildTriadicPairsExercise','buildPentatonicSuperExercise','buildOctaveDisplacementExercise','buildChromaticEnclosuresExercise','buildArpeggioInversionsExercise','buildSingleChart','progressionDegreesForConfig','SEQUENCE_PATTERNS','SEQ_NOTE_FIELDS'];
export const practiceTypes = ['scale','modal_vamp','chord_scales','sweep_arpeggios','chromatic','spider','fingerstyle_arp','guide_tones','bending','legato','vibrato','scale_thirds','scale_sixths','call_response','tremolo_picking','herta','motif','rhythm_pulse','tapping','pedal_point','pedal_riff','string_skipping','position_shift','rhythmic_displacement','chromatic_enclosures','bebop_scale','arpeggio_inversions','walking_bass','hybrid_picking','triadic_pairs','pentatonic_super','shell_voicings','strum_comp','octave_displacement','root_fifth_octave','octave_groove','dead_note_groove','right_hand_technique','slap_pop','arpeggio'];

export function foundationConfigs(tuning, shapes) {
  const cfgs = [];
  for (const [stringSetup, setup] of Object.entries(tuning.STRING_SETUPS)) {
    for (const practiceType of practiceTypes) for (let v = 0; v < 3; v++) {
      cfgs.push({ practiceType,mode:practiceType,stringSetup,instrument:setup.instrument,stringCount:setup.openMidis.length,openMidis:setup.openMidis.slice(),tuning:setup.tuning.slice(),key:['C','Db','G'][v],scale:['major','natural_minor','dorian'][v],bpm:[96,137,173][v],bars:[1,3,5][v],direction:['ascending','descending','random'][v],sequence:['none','thirds','fourths'][v],subdivision:['eighth','sixteenth','gallop'][v],meter:v === 2 ? {numerator:7,denominator:8,grouping:[2,2,3]} : {numerator:4,denominator:4,grouping:[4]},fretMin:v === 1 ? 5 : 1,fretMax:v === 1 ? 12 : 8,fretboardSystem:'position',shape:'E',cagedShape:'E',chordDepth:['triad','seventh','ninth'][v],chordOverride:'auto',progression:['I-V-vi-IV','ii-V-I','i-VI-III-VII'][v],chordScaleStrategy:'mode_of_moment',chromaticPattern:['1234','1342','2413'][v],keyCycle:'none',repeatCount:v+1,humanSeed:v === 0 ? undefined : [0,0,12345][v],countInBars:1,advancedMode:true,voices:'both_alternating',audio:{notes:false,metronome:true,harmony:false} });
    }
    for (const practiceType of ['scale','arpeggio','legato','scale_thirds']) for (const system of setup.instrument === 'guitar' ? ['caged','3nps','open','full_neck','single_string'] : ['full_neck','single_string']) {
      const cfg = {...cfgs.find(c => c.stringSetup === stringSetup && c.practiceType === practiceType),fretboardSystem:system,key:'Bb',direction:'up_down',bars:2};
      const resolved = system === 'caged' ? shapes.resolveCAGEDShape(10,'E','major',cfg.openMidis) : system === '3nps' ? shapes.resolveThreeNPSPosition(10,1,'major',cfg.openMidis) : system === 'open' ? shapes.resolveOpenShape(10,'major',cfg.openMidis) : null;
      if (resolved) Object.assign(cfg,{shapeNotes:resolved.notes,shapeDisplayName:resolved.displayName,fretMin:resolved.fretMin,fretMax:resolved.fretMax,shape:system === '3nps' ? 1 : 'E'});
      cfgs.push(cfg);
    }
  }
  const base = cfgs[0];
  for (const keyCycle of ['circle_of_fourths','circle_of_fifths','chromatic']) cfgs.push({...base,keyCycle,keyCycleLength:3});
  for (const stringSetup of ['guitar_6_standard','bass_5_standard']) for (const jamStyle of ['blues','rock','jazz']) cfgs.push({...base,stringSetup,openMidis:tuning.STRING_SETUPS[stringSetup].openMidis.slice(),instrument:tuning.STRING_SETUPS[stringSetup].instrument,stringCount:tuning.STRING_SETUPS[stringSetup].openMidis.length,jamStyle,jamPasses:3});
  for (const patch of [{customOpenMidis:[36,43,48,53,57,62]},{bpm:NaN},{bars:0},{sequence:'toString'},{scale:'missing'},{fretMin:undefined},{humanSeed:-1},{humanSeed:NaN}]) cfgs.push({...base,...patch});
  return cfgs;
}

export function generationFoundationSnapshot(core,tuning,shapes,api) {
  const attempt = fn => { try { return {value:fn()}; } catch (error) { return {error:error.name,message:error.message}; } };
  const cfgs = foundationConfigs(tuning,shapes);
  const charts = cfgs.map(cfg => ({cfg,result:attempt(() => core.buildSingleChart(cfg))}));
  const exercises = cfgs.map(cfg => ({cfg,result:attempt(() => { const exercise = api.generateExercise(cfg); return {exercise,bundle:api.makeBundle(exercise)}; })}));
  const sessions = Object.entries(api.BUILT_IN_SESSIONS).map(([id,session]) => ({id,result:attempt(() => { const exercise = api.generateSession(session); return {exercise,bundle:api.makeBundle(exercise)}; })}));
  const helpers = [];
  for (const cfg of cfgs.filter((_,i) => i % 120 === 0)) for (const name of ['scalePcs','allScalePositions','everyScalePosition','singleStringScalePositions','scalePositionsForSystem','resolveHumanSeed']) helpers.push({name,cfg,result:attempt(() => core[name](cfg))});
  for (const seed of [0,1,-1,0xffffffff,NaN]) helpers.push({name:'mulberry32',seed,value:Array.from({length:16},core.mulberry32(seed))});
  for (const direction of ['ascending','descending','up_down','down_up','random',undefined]) helpers.push({name:'directedPath',direction,value:core.directedPath([1,2,3,4],direction,3,core.mulberry32(123))});
  for (const pattern of Object.keys(core.SEQUENCE_PATTERNS)) helpers.push({name:'applySequencePattern',pattern,value:core.applySequencePattern([0,1,2,3,4,5,6,7],pattern)});
  return {charts,exercises,sessions,helpers,tables:{SEQUENCE_PATTERNS:core.SEQUENCE_PATTERNS,SEQ_NOTE_FIELDS:core.SEQ_NOTE_FIELDS}};
}
