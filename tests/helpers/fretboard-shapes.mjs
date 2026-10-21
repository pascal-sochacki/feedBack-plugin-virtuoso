// Shared inputs, not copied resolver implementations: capture the complete dirty entry before moving.
export function fretboardShapeSnapshot(core, tuning, generateExercise, resolveCurrentShape) {
  const tables = Object.fromEntries(['CAGED_SHAPES','CAGED_CYCLE','THREE_NPS_POSITION_DEFS','THREE_NPS_CYCLE'].map(name => [name, core[name]]));
  const call = (name, args) => {
    try { return { value:core[name](...args) }; }
    catch (error) { return { error:error.name }; }
  };
  const resolvers = [];
  const configs = Object.keys(tuning.STRING_SETUPS).map(stringSetup => ({ stringSetup }));
  configs.push({ stringSetup:'guitar_6_standard', customOpenMidis:[36,43,48,53,57,62] });
  configs.push({ stringSetup:'bass_5_standard', customOpenMidis:[23,28,33,38,43] });
  configs.push({ stringSetup:'guitar_6_standard', customOpenMidis:[40,40,40,40,40,40] });
  for (const cfg of configs) {
    const opens = tuning.openMidisForConfig(cfg);
    for (const keyPc of [0,1,7,9]) for (const scale of ['major','natural_minor','harmonic_minor','minor_pentatonic','blues']) {
      for (const shape of core.CAGED_CYCLE) resolvers.push({ cfg,keyPc,scale,name:'resolveCAGEDShape',shape,result:call('resolveCAGEDShape',[keyPc,shape,scale,opens]) });
      for (const shape of core.THREE_NPS_CYCLE) resolvers.push({ cfg,keyPc,scale,name:'resolveThreeNPSPosition',shape,result:call('resolveThreeNPSPosition',[keyPc,shape,scale,opens]) });
      resolvers.push({ cfg,keyPc,scale,name:'resolveOpenShape',result:call('resolveOpenShape',[keyPc,scale,opens]) });
    }
  }
  const opens = tuning.STRING_SETUPS.guitar_6_standard.openMidis;
  const helpers = [];
  for (const keyPc of [0,1,7,9,NaN,-1,12]) for (const system of ['caged','3nps','open','position','missing']) {
    for (const name of ['shapeOrderForKey','defaultShapeForSystem']) {
      const args = name === 'shapeOrderForKey' ? [keyPc,system,'major',opens] : [system,keyPc,'major',opens];
      helpers.push({ name,args,result:call(name,args) });
    }
    for (const shape of ['C','E',1,'1',null,'missing']) helpers.push({ name:'nextShapeInCycle',args:[keyPc,system,shape,'major',opens],result:call('nextShapeInCycle',[keyPc,system,shape,'major',opens]) });
  }
  for (const shape of ['missing','toString','constructor','__proto__',null,0,'1']) for (const scale of ['major','missing','toString','constructor','__proto__']) {
    for (const name of ['resolveCAGEDShape','resolveThreeNPSPosition']) helpers.push({ name,args:[0,shape,scale,opens],result:call(name,[0,shape,scale,opens]) });
  }
  for (const args of [[0,'major',[]],[NaN,'major',opens],[0,'missing',opens],[0,'toString',opens],[0,'major',[40,40,40,40,40,40]]]) helpers.push({ name:'resolveOpenShape',args,result:call('resolveOpenShape',args) });
  for (const name of ['openPcForString','lowestFretWithPc','pcOfDegree','degreeOfPc','scaleFingerFor','threeNpsStringFingers','isShapeAwareSystem','isOpenSystemSensible','fretWindowForShape']) {
    const inputs = {
      openPcForString:[[opens,0],[opens,8]], lowestFretWithPc:[[4,0],[-1,0],[NaN,0]],
      pcOfDegree:[[0,1,'major'],[0,0,'major'],[0,8,'major'],[0,1,'missing']], degreeOfPc:[[0,0,'major'],[0,1,'major'],[0,-1,'major']],
      scaleFingerFor:[[4,5,2,true],[5,0,1,false],[0,20,1,false]], threeNpsStringFingers:[[[1,3,5]],[[1,3,4]],[[1,2,4]],[[1,2,3]],[[]]],
      isShapeAwareSystem:[['caged'],['position'],['toString']], isOpenSystemSensible:[[0,'major',opens],[1,'major',opens],[0,'major',[]]],
      fretWindowForShape:[[0,'caged','E','major',opens],[0,'3nps',1,'major',opens],[0,'open','open','major',opens],[0,'missing',null,'major',opens]],
    };
    for (const args of inputs[name]) helpers.push({ name,args,result:call(name,args) });
  }
  const exercises = [];
  if (generateExercise) for (const cfg of configs.slice(0,9)) {
    const setup = tuning.STRING_SETUPS[cfg.stringSetup];
    const openMidis = tuning.openMidisForConfig(cfg);
    const systems = setup.instrument === 'bass' ? [['position','E']] : [['caged','E'],['3nps',1],['open','open']];
    for (const [fretboardSystem,shape] of systems) for (const practiceType of ['scale','arpeggio']) for (const direction of ['up','down']) {
      const config = { ...cfg, openMidis, instrument:setup.instrument, stringCount:openMidis.length, key:'Bb', scale:'natural_minor', fretboardSystem,shape,practiceType,direction,sequence:'none',bpm:96,bars:2,subdivision:'eighth',meter:{ numerator:4,denominator:4,grouping:[4] },fretMin:2,fretMax:7,keyCycle:'none',repeatCount:1,advancedMode:true,chordDepth:'triad',chordOverride:'auto',humanSeed:12345,audio:{ notes:false,metronome:true,harmony:false } };
      const selected = resolveCurrentShape(config,openMidis);
      if (selected) Object.assign(config,{ shapeNotes:selected.resolved.notes,shapeDisplayName:selected.resolved.displayName,fretMin:selected.resolved.fretMin,fretMax:selected.resolved.fretMax });
      const exercise = generateExercise(config);
      exercises.push({ cfg:config, selected, exercise });
    }
  }
  return { tables,resolvers,helpers,exercises };
}
