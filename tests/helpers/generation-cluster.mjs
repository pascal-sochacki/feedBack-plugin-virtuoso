export const clusterNames = ['STRUM_GRIPS','STRUM_SHAPE_ORDER','powerChordGrip','strumGripRootFret','resolveStrumGrip','pickExtendedStrumGrip','pickStrumGrip','STRUM_PATTERNS','defaultStrumPattern','strumStepAccented','emitStrum','buildStrumCompExercise','PIMA_PATTERNS','buildFingerstyleArpExercise','ROMAN_BASE','chordHighlightPcs','degreeFunction','romanLabel','compileChordTimeline','applyTimelinePush','appendTimelineOffset','MOTIF_CELLS','motifDegreeSemis','motifPlaceMidi','resolveMotifCell','VOICE_ORDER','VOICING_TRIAD','classifyChordTones','voiceChord','backingVoicingStyle','voiceBackingChord','voiceBackingPad','voiceLeadBackingChord','pcAtOrAbove'];

export function generationClusterSnapshot(core,tuning) {
  const attempt = fn => { try { return {value:fn()}; } catch(error) { return {error:error.name,message:error.message}; } };
  const base = {key:'C',scale:'major',bpm:97,bars:3,meter:{numerator:4,denominator:4,grouping:[4]},subdivision:'eighth',direction:'ascending',sequence:'none',repeatCount:1,fretMin:1,fretMax:12,fretboardSystem:'position',shape:'E',cagedShape:'E',chordDepth:'seventh',chordOverride:'auto',progression:'ii-V-I'};
  const grips=[],builders=[],motifs=[],timelines=[],voicings=[];
  const keys=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  for (const [stringSetup,setup] of Object.entries(tuning.STRING_SETUPS)) {
    const cfg={...base,stringSetup,instrument:setup.instrument,stringCount:setup.openMidis.length,openMidis:setup.openMidis.slice()};
    for (const key of ['C','Db','G']) for (const quality of Object.keys(core.STRUM_GRIPS).concat(['maj','min','dim','5','5oct','dom11','toString'])) for (const fixedShape of [null,'E','A','G']) {
      const c={...cfg,key};
      grips.push({stringSetup,key,quality,fixedShape,result:attempt(()=>core.pickStrumGrip(c,keys.indexOf(key),quality,5,{fixedShape,economy:!fixedShape,prevMeanFret:4}))});
    }
    for(const key of ['C','Db','G']) for(const strumPattern of Object.keys(core.STRUM_PATTERNS)) {
      const c={...cfg,key,strumPattern,practiceType:'strum_comp',shapeWalk:strumPattern === 'held_pad',voicingPosition:strumPattern === 'quarter_down' ? 'movable' : 'economy'};
      builders.push({cfg:c,name:'buildStrumCompExercise',result:attempt(()=>core.buildStrumCompExercise(c))});
    }
    for(const pimaPattern of Object.keys(core.PIMA_PATTERNS)) builders.push({cfg:{...cfg,pimaPattern},name:'buildFingerstyleArpExercise',result:attempt(()=>core.buildFingerstyleArpExercise({...cfg,pimaPattern}))});
    for(const key of keys) for(const [id,cell] of Object.entries(core.MOTIF_CELLS)) for(const fretMin of [0,3,7]) motifs.push({stringSetup,key,id,fretMin,result:attempt(()=>core.resolveMotifCell(cell,{...cfg,key},cfg.openMidis,fretMin,fretMin+5))});
  }
  for(const key of keys) for(const progression of ['ii-V-I','jazz_blues','backdoor_ii_V','metal_i_bVI_bVII','i-VI-III-VII']) for(const harmonicRhythm of ['1/bar','2/bar']) {
    const cfg={...base,key,progression,harmonicRhythm};
    const events=core.compileChordTimeline(cfg,7.1);
    if(events.length>1) events[1].push=0.5;
    core.applyTimelinePush(events,cfg,7.1);
    const offset=[]; core.appendTimelineOffset(offset,events,2.3,4,1);
    timelines.push({cfg,events,offset});
  }
  for(const root of [0,1,5,10,-1,12]) for(const intervals of [[0,4,7],[0,3,7,10],[0,4,7,10,14,17,21],[0,3,6,9],[0,7,12]]) for(const instrument of ['guitar','bass']) {
    const fresh=core.voiceBackingChord(root,intervals,instrument,true,'shell');
    voicings.push({root,intervals,instrument,roles:core.classifyChordTones(intervals),block:core.voiceChord(root,intervals,{instrument}),fresh,lead:core.voiceLeadBackingChord(root,intervals,instrument,[48,55,62,67],true),pad:core.voiceBackingPad(root,intervals,fresh)});
  }
  const edge=[];
  for(const degree of [1,5,-1,8,{deg:4,q:'min7'},{semis:1,rn:'♭II7'},null]) edge.push({degree,fn:attempt(()=>core.degreeFunction(degree)),rn:attempt(()=>core.romanLabel(degree,'min7'))});
  const tables=Object.fromEntries(clusterNames.filter(name=>typeof core[name] !== 'function').map(name=>[name,core[name] instanceof Set ? [...core[name]] : core[name]]));
  return {tables,grips,builders,motifs,timelines,voicings,edge};
}
