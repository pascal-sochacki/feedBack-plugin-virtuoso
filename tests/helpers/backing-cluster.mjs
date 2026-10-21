export const backingNames=['ARRANGEMENT_RECIPES','ARRANGEMENT_BASE','ARRANGEMENT_TIERS','resolveArrangement','COMP_GROOVES','COMP_ARTIC','COMP_VEL','compCellForConfig','buildCompCellHits','BANJO_DRONE_BY_TONIC','BASS_FIGURES','bassFigureForConfig','buildBassFigureEvents','AUDIO_PROFILES','AUDIO_FAMILY_DEFAULTS','GLOBAL_AUDIO_DEFAULT','DRUM_KIT_FAMILY_DEFAULT','resolveAudioProfile','DRUM_GROOVES','DRUM_VELOCITY','DRUM_PIECE_GAIN','FILLS','resolveGroove','buildDrumEvents','buildBackingEvents','recipeTracks','compileChordTimeline','chartRng','SWING_RATIOS','FEEL_TIMING','swungTime','swingNotesBacking','applyFeelLean','STYLE_PALETTES','CYCLE_KEY_ORDERS','generateExercise','buildSingleChart'];

export function backingClusterSnapshot(core) {
  const attempt=fn=>{try{return {value:fn()}}catch(error){return {error:error.name,message:error.message}}};
  const base={practiceType:'scale',mode:'scale',key:'C',scale:'major',bpm:123,bars:4,meter:{numerator:4,denominator:4,grouping:[4]},subdivision:'eighth',direction:'random',sequence:'thirds',repeatCount:2,fretboardSystem:'position',fretMin:1,fretMax:8,shape:'E',cagedShape:'E',chordDepth:'seventh',chordOverride:'auto',progression:'ii-V-I',chromaticPattern:'1342',humanSeed:0,keyCycle:'none',countInBars:1,audio:{notes:false,metronome:true,harmony:false}};
  const configs=[];
  for(const audioProfile of Object.keys(core.AUDIO_PROFILES)) for(const backingDensity of [1,2,3]) for(const instrument of ['guitar','bass']) {
    const v=backingDensity-1;
    configs.push({...base,audioProfile,audio:{...base.audio,profile:audioProfile},backingDensity,instrument,stringSetup:instrument === 'bass'?'bass_5_standard':'guitar_6_standard',stringCount:instrument === 'bass'?5:6,openMidis:instrument === 'bass'?[23,28,33,38,43]:[40,45,50,55,59,64],key:['C','Db','G'][v],scale:['major','dorian','natural_minor'][v],humanSeed:[0,123,-1][v],swing:['straight','swing','shuffle'][v],meter:v===2?{numerator:7,denominator:8,grouping:[2,2,3]}:base.meter});
  }
  const backing=configs.map(cfg=>({cfg,result:attempt(()=>{
    const duration=8.1,profile=core.resolveAudioProfile(cfg),arrangement=core.resolveArrangement(cfg),tracks=core.recipeTracks(cfg),timeline=core.compileChordTimeline(cfg,duration);
    const events=core.buildBackingEvents(cfg,duration),drums=core.buildDrumEvents(cfg,duration,core.resolveGroove(cfg));
    const swung=core.swingNotesBacking([{t:0.25,s:0,f:5,sus:0.4},{t:0.75,s:1,f:7,sus:0.2,noSwing:true}],events.concat(drums),cfg);
    core.applyFeelLean(swung.backing,cfg,duration);
    return {profile,arrangement,tracks,timeline,events,drums,swung};
  })}));
  const variants=[];
  for(const comp of Object.keys(core.COMP_GROOVES)) variants.push({comp,result:attempt(()=>core.buildBackingEvents({...configs[0],backingComp:comp},10.1))});
  for(const bass of Object.keys(core.BASS_FIGURES)) variants.push({bass,result:attempt(()=>core.buildBassFigureEvents(bass,core.compileChordTimeline(configs[0],10.1),10.1,60/123,core.chartRng({...configs[0],humanSeed:9123})))});
  for(const groove of Object.keys(core.DRUM_GROOVES)) variants.push({groove,result:attempt(()=>core.buildDrumEvents(configs[0],20.1,groove))});
  const jams=[];
  for(const jamStyle of Object.keys(core.STYLE_PALETTES)) for(const jamBandMode of ['full','no_bass','drums_only']) {
    const pal=core.STYLE_PALETTES[jamStyle];
    const cfg={...configs[0],key:pal.defaultKey,scale:pal.leadScales[0],chordDepth:pal.chordDepth,chordOverride:pal.chordOverride,progression:pal.progressions[0],audioProfile:pal.audioProfile,audio:{...base.audio,profile:pal.audioProfile},...pal.feel,backingDensity:undefined,jamStyle,jamBandMode,jamPasses:3,jamSpotlight:true,jamSwitchUp:true,jamEnergy:'auto'};
    jams.push({cfg,result:attempt(()=>core.generateExercise(cfg))});
  }
  const edges=[];
  // NaN BPM is deliberately not called: existing backing loops do not terminate.
  // This is a separate behavioral defect, not permission to fix it during a move.
  for(const patch of [{backingDensity:0},{practiceType:'strum_comp'},{backingPadDev:true,backingStyle:'boogie'},{audioProfile:'toString'},{backingComp:'toString'},{backingBass:'toString'},{groove:'toString'}]) edges.push({patch,result:attempt(()=>core.buildBackingEvents({...configs[0],...patch},3))});
  const tables=Object.fromEntries(backingNames.filter(n=>typeof core[n] !== 'function').map(n=>[n,core[n]]));
  return {tables,backing,variants,jams,edges};
}
