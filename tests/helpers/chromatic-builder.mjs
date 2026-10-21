// Inputs for complete-entry pre-move capture and real module calls; no copied implementation.
export function chromaticBuilderSnapshot(core, tuning, generateExercise, makeBundle, generateSession) {
  const cfgs = [];
  const setups = Object.keys(tuning.STRING_SETUPS).map(stringSetup => ({ stringSetup }));
  setups.push({ stringSetup:'guitar_6_standard', tuningOffsets:[-2,0,0,0,0,0] });
  setups.push({ stringSetup:'guitar_7_standard', customOpenMidis:[33,38,43,48,52,57,62] });
  setups.push({ stringSetup:'bass_5_standard', openMidis:[23,28,33,38,43] });
  for (const setup of setups) for (const chromaticPattern of Object.keys(core.CHROMATIC_PATTERNS)) for (const direction of ['ascending','descending','up_down']) {
    cfgs.push({ ...setup, practiceType:'chromatic',mode:'chromatic',key:'C',scale:'major',chromaticPattern,direction,bpm:97,bars:1,subdivision:'eighth',meter:{ numerator:4,denominator:4,grouping:[4] },fretMin:1,fretMax:4,keyCycle:'none',repeatCount:1,humanSeed:12345,countInBars:1,audio:{ notes:false,metronome:true,harmony:false } });
  }
  const base = cfgs[0];
  for (const subdivision of ['quarter','sixteenth','triplet','eighth_triplet','sixteenth_triplet','gallop','reverse_gallop','snap','missing']) for (const strokePolicy of ['', 'alternate','economy','gypsy','bluegrass','metal','none']) cfgs.push({ ...base,subdivision,strokePolicy,bpm:173,bars:3,fretMin:5,fretMax:8,meter:{ numerator:7,denominator:8,grouping:[2,2,3] },crosspick:strokePolicy === 'bluegrass',humanSeed:0 });
  for (const fretMin of [undefined,0,-1,9,NaN]) cfgs.push({ ...base,fretMin,bars:0 });
  const charts = cfgs.map(cfg => ({ cfg,chart:core.buildChromaticExercise(cfg) }));
  const call = (name,args) => { try { return { value:core[name](...args) }; } catch (error) { return { error:error.name }; } };
  const edges = [];
  for (const patch of [{chromaticPattern:'missing'},{chromaticPattern:'toString'},{chromaticPattern:'__proto__'},{bpm:NaN},{bars:NaN},{direction:undefined},{meter:{}},{openMidis:[]},{customOpenMidis:[40]},{stringSetup:'missing'}]) edges.push({ patch,result:call('buildChromaticExercise',[{ ...base,...patch }]) });
  for (const args of [[0,0.25,24],[1,0.25,24],[6,0.25,24],[6+1e-10,0.25,24],[-1,0.25,24],[NaN,0.25,24],[1,NaN,24],[1,0.25,NaN],[1,0.25,2.5]]) edges.push({ name:'wholeCycleStepCount',args,result:call('wholeCycleStepCount',args) });
  const helpers = [];
  for (const name of ['applyAlternatePicking','applyEconomyPicking','applyGypsyPicking','applyBluegrassPicking','applyMetalPicking','applyBassPlucking','applyCellStrokes','applyStrokePolicy']) for (const subdivision of ['eighth','sixteenth','gallop']) {
    const notes = [{ t:0,s:1,f:5 },{ t:0.25,s:1,f:6,ho:true },{ t:0.5,s:1,f:7,mt:true },{ t:0.75,s:0,f:5,pm:true },{ t:1,s:0,f:6,ac:true },{ t:2.5,s:1,f:5 },{ t:2.75,s:1,f:7,tp:true }];
    const cfg = { ...base,subdivision,strokePolicy:'metal' };
    helpers.push({ name,subdivision,result:call(name,[notes,cfg,'alternate']),notes });
  }
  for (const extra of [undefined,null,{}, {t:NaN,fg:0,pkd:1,ac:true,custom:'kept'}]) helpers.push({ name:'noteDefaults',extra,result:call('noteDefaults',[extra]) });
  const exercises = generateExercise ? cfgs.map(cfg => {
    const exercise = generateExercise(cfg);
    return { exercise,bundle:makeBundle(exercise) };
  }) : [];
  const sessions = generateSession ? setups.map(setup => {
    const session = { version:1,name:'Chromatic capture',...setup,segments:[{kind:'chromatic',config:{...base,...setup,bars:1}},{kind:'chromatic',config:{...base,...setup,bpm:131,subdivision:'sixteenth',direction:'descending',fretMin:5}}] };
    const exercise = generateSession(session);
    return { session,exercise,bundle:makeBundle(exercise) };
  }) : [];
  return { tables:{CHROMATIC_PATTERNS:core.CHROMATIC_PATTERNS,CHROMATIC_PATTERN_LABELS:core.CHROMATIC_PATTERN_LABELS},charts,edges,helpers,exercises,sessions };
}
