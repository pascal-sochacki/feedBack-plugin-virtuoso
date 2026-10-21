// Run the same inputs against the complete dirty entry before the move and real imports after it.
export function instrumentTuningSnapshot(core) {
  const configs = [
    {}, ...Object.keys(core.STRING_SETUPS).map(stringSetup => ({ stringSetup })),
    { stringSetup:'missing', instrument:'bass' },
    { stringSetup:'guitar_6_standard', instrument:'bass' },
    { stringSetup:'bass_4_standard', instrument:'guitar' },
    { stringSetup:'guitar_6_drop_d', customOpenMidis:[38,45,50,55,59,64] },
    { stringSetup:'guitar_6_standard', customOpenMidis:[] },
    { stringSetup:'bass_4_standard', customOpenMidis:[23,28,33,38] },
    { stringSetup:'guitar_6_standard', customOpenMidis:[40.5,45,50,55,59,64] },
    { stringSetup:'guitar_6_standard', customOpenMidis:[1,2] },
    { stringSetup:'guitar_6_standard', customOpenMidis:'40,45' },
    ...['toString','constructor','__proto__'].map(stringSetup => ({ stringSetup })),
    null,
  ];
  const call = (name, args) => {
    try { return { value:core[name](...args) }; }
    catch (error) { return { error:error.name }; }
  };
  const helpers = Object.fromEntries(['openMidisForConfig','tuningOffsetsForConfig','isBassCfg'].map(name => [name, configs.map(cfg => ({ cfg, result:call(name, [cfg]) }))]));
  helpers.hostStandardMidisFor = [['guitar',6],['guitar',7],['guitar',8],['bass',4],['bass',5],['bass',6],['bass',7],['missing',6],['guitar','6']].map(args => ({ args, result:call('hostStandardMidisFor', args) }));
  helpers.parseNoteName = ['E2','F#3','Bb4',' c-1 ','B#3','Cb4','G9','G#9','E','H2','E2x','E♭2','f♯3','C-2','C999999999999999999999',null,42].map(input => ({ input, result:call('parseNoteName', [input]) }));
  helpers.midiToNoteName = [0,40,69,127,-1,128,40.5,NaN,Infinity,-Infinity,'40',null].map(input => ({ input:String(input), result:call('midiToNoteName', [input]) }));
  return { tables:Object.fromEntries(['STRING_SETUPS','TUNING_PRESETS','TUNING_TO_SETUP'].map(name => [name,core[name]])), helpers };
}
