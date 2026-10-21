// Inputs only; subjects are the complete saved entry or actual native imports.
export const sessionNames = ['SEGMENT_TEMPLATES','SEGMENT_ROLES','SEGMENT_BANDS','rollSegment','refreshWorkout','materializeSegment','segmentCompetency','blockRole','segmentEstDuration','applyLengthPreset','buildSegmentConfig','buildBpmLadderChart','buildSessionChart','generateSession','stylePaletteConfig','defaultFretboardSystem','resolveCurrentShape','countInSubTicks'];

export function sessionCases(api) {
  const cases = Object.entries(api.BUILT_IN_SESSIONS).map(([id,session]) => ({id:'builtin:'+id,session}));
  for (const [id,t] of Object.entries(api.SEGMENT_TEMPLATES)) for (let variantIdx = 0; variantIdx < (t.vary?.length || 1); variantIdx++) cases.push({id:`template:${id}:${variantIdx}`,session:{name:id,stringSetup:t.instrument === 'bass' ? 'bass_5_standard' : 'guitar_6_standard',interBlockBreak:'off',segments:[{templateId:id,variantIdx}]}});
  for (const stringSetup of ['guitar_6_standard','bass_5_standard']) {
    for (const interBlockBreak of ['auto','always','off']) for (const seed of [0,12345]) {
      const cfg = {key:'Db',scale:'dorian',bpm:137,bars:1,meter:'7/8',subdivision:'gallop',humanSeed:seed,direction:'random',fretboardSystem:'position',fretMin:5,fretMax:12,audioProfile:'jazz',progression:'ii-V-I',chordDepth:'ninth'};
      const segments = [{name:'Ladder',kind:'scale',config:cfg,bpmLadder:{enabled:true,bpmStart:80,bpmTarget:100,bpmStep:10,repsPerStep:2}},{name:'Cycle',kind:'guide_tones',config:{...cfg,bpm:96,meter:'4/4',subdivision:'quarter'},keyCycle:{enabled:true,strategy:'circle_of_fourths',keysPerSession:3}},{name:'Target',kind:'chromatic',config:{...cfg,bpm:173,meter:'3/4',subdivision:'sixteenth',fretMin:1,fretMax:4},targetSec:12}];
      cases.push({id:`mixed:${stringSetup}:${interBlockBreak}:${seed}`,session:{name:'Mixed',stringSetup,interBlockBreak,countInBars:3,customOpenMidis:stringSetup === 'guitar_6_standard' ? '38,45,50,55,59,64' : '35,40,45,50,55',segments}});
    }
    for (const customOpenMidis of [[],[1,2],'bad','38,45,50,55,59,64']) cases.push({id:`tuning:${stringSetup}:${JSON.stringify(customOpenMidis)}`,session:{name:'Tuning',stringSetup,customOpenMidis,segments:[{kind:'scale',config:{bpm:96,bars:1,customOpenMidis}}]}});
  }
  for (const style of Object.keys(api.STYLE_PALETTES)) cases.push({id:'palette:'+style,session:{name:style,segments:[{name:style,kind:'motif',config:{...api.stylePaletteConfig(style),bars:1,bpm:120,humanSeed:42,fretboardSystem:'position'}}]}});
  for (const segments of [[],[{templateId:'missing'}],[{kind:'scale',config:{scale:'missing',bars:1,bpm:96}}]]) cases.push({id:'edge:'+JSON.stringify(segments),session:{name:'Edge',segments}});
  return cases;
}

export function sessionSnapshot(api) {
  const attempt = fn => { try { return {value:fn()}; } catch (error) { return {error:error.name,message:error.message}; } };
  const sessions = sessionCases(api).map(({id,session}) => ({id,result:attempt(() => { const exercise = api.generateSession(session); return {exercise,bundle:api.makeBundle(exercise)}; })}));
  const helpers = [];
  for (const [id,t] of Object.entries(api.SEGMENT_TEMPLATES)) for (const variantIdx of [-1,0,1,99]) for (const locks of [undefined,{key:true,shape:true}]) helpers.push({id,variantIdx,locks,result:attempt(() => api.rollSegment(t,{variantIdx,locks}))});
  for (const [id,s] of Object.entries(api.BUILT_IN_SESSIONS)) for (const preset of ['quick','standard','woodshed']) helpers.push({id,preset,result:attempt(() => api.applyLengthPreset(s,preset))});
  return {sessions,helpers,tables:{SEGMENT_TEMPLATES:api.SEGMENT_TEMPLATES,SEGMENT_ROLES:api.SEGMENT_ROLES}};
}
