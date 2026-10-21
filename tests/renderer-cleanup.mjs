import assert from 'node:assert/strict';
import test from 'node:test';
import { makeBuiltin2DTabRenderer } from '../src/shell/renderers/tab.js';
import { makeBuiltin2DNotationRenderer } from '../src/shell/renderers/notation.js';
import { RENDER_THEMES } from '../src/shell/renderers/display-policy.js';
import { resolveNotationKey } from '../src/shell/renderers/notation-pitch.js';
import { SCALE_INTERVALS } from '../src/core/scale-intervals.js';
import { orderHandMarks, selectHandMarks } from '../src/shell/renderers/hand-marks.js';

function scene(factory, bundle, marks = false) {
  const calls = [], writes = [];
  let box = {width:800,height:600};
  const oldWindow = globalThis.window;
  globalThis.window = {devicePixelRatio:1,addEventListener(){},removeEventListener(){}};
  const ctx = new Proxy({}, {
    get(target, name) {
      if (name in target) return target[name];
      return (...args) => {
        calls.push([name,...args]);
        if (name === 'measureText') return {width:String(args[0]).length * 8};
        if (name === 'createLinearGradient') return {addColorStop(){}};
      };
    },
    set(target,name,value) {calls.push(['set',name,value]);target[name]=value;return true;},
  });
  const canvas = new Proxy({width:300,height:150,parentElement:{getBoundingClientRect:()=>box},getContext:()=>ctx}, {
    set(target,name,value) {writes.push([name,value]);target[name]=value;return true;},
  });
  const renderer = factory({getRenderTheme:()=>RENDER_THEMES.light,handMarksOn:()=>marks});
  renderer.init(canvas,bundle);
  renderer.setMode?.('notation');
  return {calls,writes,canvas,renderer,draw(now=0){calls.length=0;bundle.currentTime=now;renderer.draw(bundle);return calls;},resize(width,height,dpr=1){box={width,height};globalThis.window.devicePixelRatio=dpr;},close(){renderer.destroy();globalThis.window=oldWindow;}};
}

test('all twelve tonics use properly spelled major, minor and diatonic modal parent signatures', () => {
  const tonics = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const signatures = {C:0,'C#':7,Db:-5,D:2,Eb:-3,E:4,F:-1,'F#':6,Gb:-6,G:1,Ab:-4,A:3,Bb:-2,B:5};
  const expected = {
    major:['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'],
    natural_minor:['Eb','E','F','F#','G','Ab','A','Bb','B','C','C#','D'],
    dorian:['Bb','B','C','C#','D','Eb','E','F','F#','G','Ab','A'],
    phrygian:['Ab','A','Bb','B','C','Db','D','Eb','E','F','F#','G'],
    lydian:['G','Ab','A','Bb','B','C','C#','D','Eb','E','F','F#'],
    mixolydian:['F','F#','G','Ab','A','Bb','B','C','C#','D','Eb','E'],
    locrian:['Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C'],
  };
  for (const [scale,parents] of Object.entries(expected)) {
    for (const [i,key] of tonics.entries()) {
      const resolved = resolveNotationKey(key,scale);
      assert.equal(resolved.name,parents[i],`${key} ${scale}`);
      assert.equal(resolved.numAcc,signatures[parents[i]]);
      const s = scene(makeBuiltin2DNotationRenderer,{config:{key,scale,bpm:120},notes:[]});
      try {
        const glyphs = s.draw().filter(c=>c[0]==='fillText' && ['♭','♯'].includes(c[1])).map(c=>c[1]);
        assert.deepEqual(glyphs,Array(Math.abs(resolved.numAcc)).fill(resolved.numAcc<0?'♭':'♯'),`${key} ${scale} canvas`);
      } finally {s.close();}
    }
  }
  for (const scale of ['harmonic_minor','melodic_minor']) for (const [i,key] of tonics.entries()) assert.equal(resolveNotationKey(key,scale).name,expected.natural_minor[i]);
  assert.equal(resolveNotationKey('Db','major').numAcc,-5);
  assert.equal(resolveNotationKey('C#','major').numAcc,7);
  assert.equal(resolveNotationKey('Cb','major').numAcc,-7);
  assert.equal(resolveNotationKey('nonsense','major').name,'C');
  // Existing non-diatonic blueprint parent offsets and tonic pentatonic conventions remain.
  for (const [scale,parent] of Object.entries({dorian_b2:'Bb',lydian_augmented:'Db',lydian_dominant:'D',mixolydian_b6:'B',locrian_sharp2:'G',altered:'F#',phrygian_dominant:'A',minor_pentatonic:'C',major_pentatonic:'C',blues:'C'})) assert.equal(resolveNotationKey('C',scale).name,parent);
});

test('staff spelling preserves signature E#/B#/Cb and minor/mode degree letters', () => {
  assert.deepEqual(resolveNotationKey('C#','major').spellings[0],[6,1]);
  assert.deepEqual(resolveNotationKey('C#','major').spellings[5],[2,1]);
  assert.deepEqual(resolveNotationKey('Cb','major').spellings[11],[0,-1]);
  assert.deepEqual(resolveNotationKey('C','natural_minor').spellings[3],[2,-1]);
  assert.deepEqual(resolveNotationKey('C','dorian').spellings[10],[6,-1]);
  assert.deepEqual(resolveNotationKey('D#','harmonic_minor').spellings[5],[2,1]);
  assert.deepEqual(resolveNotationKey('A','harmonic_minor').spellings[8],[4,1]);
  for (const [key,scale,openMidi,expectedStep,glyph] of [
    ['C','natural_minor',63,7,'♭'], // Eb5, no redundant note accidental
    ['C#','major',60,4,'♯'],       // B#4, not C5
    ['C#','major',53,0,'♯'],       // E#4, not F4
    ['Cb','major',59,5,'♭'],       // Cb5, not B4
  ]) {
    const s = scene(makeBuiltin2DNotationRenderer,{config:{key,scale,bpm:120},notes:[{t:0,s:0,f:0,sus:0.5}],openMidis:[openMidi]});
    try {
      const calls = s.draw();
      const translations = calls.filter(c=>c[0]==='translate');
      assert.equal(translations.length,1);
      // Staff bottom is 328 at H=600; ledger positions use the requested letter octave.
      assert.equal(translations[0][2],328-expectedStep*7,key);
      assert.equal(calls.filter(c=>c[0]==='fillText' && c[1]===glyph).length,Math.abs(resolveNotationKey(key,scale).numAcc));
    } finally {s.close();}
  }
});

function assertRawScale({key,scale,root,spellings,steps,accidentals,parent}, descending) {
  const pitches = [...SCALE_INTERVALS[scale],12];
  const expectedSteps = [...steps];
  const expectedAccidentals = [...accidentals];
  if (descending) {pitches.reverse();expectedSteps.reverse();expectedAccidentals.reverse();}
  const s = scene(makeBuiltin2DNotationRenderer,{
    config:{key,scale,bpm:120},openMidis:[root],
    notes:pitches.map((f,i)=>({t:i*0.1,s:0,f,sus:0.5})),
  });
  try {
    const calls = s.draw();
    assert.deepEqual(calls.filter(c=>c[0]==='translate').map(c=>c[2]),expectedSteps.map(step=>328-step*7),`${key} ${scale} staff ${descending?'descending':'ascending'}`);
    const resolved = resolveNotationKey(key,scale);
    assert.equal(resolved.name,parent);
    const glyphs = calls.filter(c=>c[0]==='fillText' && ['♯','♭','♮'].includes(c[1])).map(c=>c[1]);
    assert.deepEqual(glyphs.slice(0,Math.abs(resolved.numAcc)),Array(Math.abs(resolved.numAcc)).fill(resolved.numAcc<0?'♭':'♯'));
    assert.deepEqual(glyphs.slice(Math.abs(resolved.numAcc)),expectedAccidentals.filter(Boolean));
    assert.deepEqual(SCALE_INTERVALS[scale].map(interval=>resolved.spellings[(root+interval)%12]),spellings);
  } finally {s.close();}
}

for (const row of [
  {key:'F',scale:'lydian_augmented',root:53,parent:'F#',spellings:[[3,0],[4,0],[5,0],[6,0],[0,1],[1,0],[2,0]],steps:[1,2,3,4,5,6,7,8],accidentals:['♮','♮','♮',null,null,'♮','♮','♮']},
  {key:'G',scale:'mixolydian_b6',root:55,parent:'F#',spellings:[[4,0],[5,0],[6,0],[0,0],[1,0],[2,-1],[3,0]],steps:[2,3,4,5,6,7,8,9],accidentals:['♮','♮',null,'♮','♮','♭','♮','♮']},
  {key:'B',scale:'locrian_sharp2',root:59,parent:'F#',spellings:[[6,0],[0,1],[1,0],[2,0],[3,0],[4,0],[5,0]],steps:[4,5,6,7,8,9,10,11],accidentals:[null,null,'♮','♮','♮','♮','♮',null]},
]) {
  test(`${row.key} ${row.scale} raw ascending/descending scales retain tonic letters independently of legacy signature`, () => {
    assertRawScale(row,false);
    assertRawScale(row,true);
  });
}

test('full raw sharp/flat scales retain E#/B#/Cb letter octaves in both directions', () => {
  for (const row of [
    {key:'C#',scale:'major',root:49,parent:'C#',spellings:[[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1]],steps:[-2,-1,0,1,2,3,4,5],accidentals:Array(8).fill(null)},
    {key:'Cb',scale:'major',root:47,parent:'Cb',spellings:[[0,-1],[1,-1],[2,-1],[3,-1],[4,-1],[5,-1],[6,-1]],steps:[-2,-1,0,1,2,3,4,5],accidentals:Array(8).fill(null)},
  ]) for (const descending of [false,true]) assertRawScale(row,descending);
});

test('all supported non-seven-step scales retain legacy signature spelling, not heptatonic degree indexes', () => {
  const nonSeven = ['minor_pentatonic','major_pentatonic','blues','bebop_major','bebop_dominant','bebop_dorian','whole_tone','diminished','half_whole_dim'];
  const seven = ['major','natural_minor','harmonic_minor','melodic_minor','dorian','phrygian','lydian','mixolydian','locrian','phrygian_dominant','lydian_dominant','dorian_b2','lydian_augmented','mixolydian_b6','locrian_sharp2','altered','double_harmonic','hungarian_minor','neapolitan_minor'];
  assert.deepEqual(Object.keys(SCALE_INTERVALS).sort(),[...seven,...nonSeven].sort());
  const sharp = [[0,0],[0,1],[1,0],[1,1],[2,0],[3,0],[3,1],[4,0],[4,1],[5,0],[5,1],[6,0]];
  const flat = [[0,0],[1,-1],[1,0],[2,-1],[2,0],[3,0],[4,-1],[4,0],[5,-1],[5,0],[6,-1],[6,0]];
  for (const scale of nonSeven) {
    assert.notEqual(SCALE_INTERVALS[scale].length,7);
    assert.deepEqual(resolveNotationKey('C',scale).spellings,sharp,scale);
    assert.deepEqual(resolveNotationKey('F',scale).spellings,flat,scale);
  }
  assert.deepEqual(SCALE_INTERVALS.major_pentatonic.map(i=>resolveNotationKey('C','major_pentatonic').spellings[i][0]),[0,1,2,4,5]);
  assert.deepEqual(SCALE_INTERVALS.minor_pentatonic.map(i=>resolveNotationKey('F','minor_pentatonic').spellings[(5+i)%12][0]),[3,5,6,0,2]);
});

test('visible beam membership uses note identity, supports subsets and retains rhythm/meter behavior', () => {
  const notes = [{t:0,s:0,f:0,sus:0.125},{t:0.125,s:0,f:2,sus:0.125},{t:0.25,s:0,f:4,sus:0.125}];
  const s = scene(makeBuiltin2DNotationRenderer,{config:{key:'C',scale:'major',bpm:120,meter:{denominator:8,numerator:7}},openMidis:[48],notes});
  try {
    assert.equal(s.draw(0).filter(c=>c[0]==='ellipse').length,3);
    assert.equal(s.calls.filter(c=>c[0]==='bezierCurveTo').length,0);
    assert.equal(s.draw(1).filter(c=>c[0]==='ellipse').length,2);
    assert.equal(s.calls.filter(c=>c[0]==='bezierCurveTo').length,0);
    assert.equal(s.draw(1.1).filter(c=>c[0]==='ellipse').length,1);
    assert.equal(s.calls.filter(c=>c[0]==='bezierCurveTo').length,2);
    assert.equal(s.draw(2).filter(c=>c[0]==='ellipse').length,0);
    assert.equal(s.calls.filter(c=>c[0]==='bezierCurveTo').length,0);
  } finally {s.close();}
  // A coincident long note must not lose its stem through a rounded timestamp/string key.
  const mixed = scene(makeBuiltin2DNotationRenderer,{config:{key:'C',bpm:120},notes:[notes[0],notes[1],{...notes[1],sus:0.5}],openMidis:[48]});
  try {
    assert.equal(mixed.draw().filter(c=>c[0]==='ellipse').length,3);
    // Each note receives one 1.5px stem; a timestamp/string collision used to
    // suppress the quarter's stem even though it wasn't a cached beam member.
    let width = 1, stems = 0;
    for (const c of mixed.calls) {
      if (c[0]==='set' && c[1]==='lineWidth') width=c[2];
      if (c[0]==='stroke' && width===1.5) stems++;
    }
    assert.equal(stems,4); // three note stems plus the playhead
  } finally {mixed.close();}
  const countIn = scene(makeBuiltin2DNotationRenderer,{config:{key:'C',bpm:120},leadIn:1,beats:[{time:0,measure:0},{time:1,measure:1}],notes:[],openMidis:[28,33,38,43],songInfo:{arrangement:'Bass'}});
  try {
    assert.ok(countIn.draw().some(c=>c[0]==='fillRect' && c[3]===14*0.95 && c[4]===14*0.42),'whole-bar count-in rest');
    assert.equal(countIn.calls.filter(c=>c[0]==='bezierCurveTo' || c[0]==='ellipse').length,0);
    assert.ok(countIn.calls.some(c=>c[0]==='fillText' && c[1]==='𝄢'),'bass clef');
  } finally {countIn.close();}
});

test('shared hand-mark policy keeps dense breaks/crossings/lessons/bass boxes and open-hand conventions', () => {
  const notes = Array.from({length:8},(_,i)=>({t:i*0.01,s:0,f:5,fg:1,pkd:i%2,sus:0.1}));
  notes[3].pkd=0;notes[4].s=1;notes[5].f=11;notes[6].fg=0;notes[7].mt=true;
  const ordered = orderHandMarks(notes.slice().reverse());
  const cfg = {config:{mode:'mixed',bpm:120}};
  const marks = selectHandMarks(ordered,cfg,0,1,2,100,false);
  assert.deepEqual(marks.strokes.map(n=>n.t),[0,0.03,0.04]);
  assert.deepEqual(marks.fingers.map(n=>n.t),[0,0.04,0.05]);
  assert.ok(selectHandMarks(ordered,cfg,0,1,2,100,true).fingers.includes(notes[6]));
  assert.equal(selectHandMarks(ordered,{config:{mode:'chromatic'}},0,1,2,100,false).strokes.length,8);
  assert.equal(selectHandMarks(orderHandMarks(notes.map(n=>({...n,f:2,fg:1,mt:false}))),{config:{instrument:'bass'}},0,1,2,100,false).fingers.length,8);
  assert.equal(selectHandMarks(ordered,cfg,5,1,2,100,false).strokes.length,0);
  notes[1].rh=2;delete notes[1].pkd;
  assert.ok(selectHandMarks(ordered,{config:{mode:'chromatic'}},0,1,2,100,false).strokes.includes(notes[1]),'annotations remain live');
});

test('both renderers retain canvas-only init and replaced chart hand-mark compatibility', () => {
  for (const factory of [makeBuiltin2DTabRenderer,makeBuiltin2DNotationRenderer]) {
    const bundle = {config:{mode:'chromatic',bpm:120},openMidis:[40,45,50,55,59,64],notes:[]};
    const s = scene(factory,bundle,true);
    try {
      s.renderer.destroy();s.renderer.init(s.canvas);
      bundle.notes = [{t:0,s:0,f:5,sus:0.5,fg:3,rh:2}];
      assert.ok(s.draw().some(c=>c[0]==='fillText' && c[1]==='m'));
      assert.ok(s.calls.some(c=>c[0]==='fillText' && c[1]==='3'));
      bundle.notes = [{t:0,s:0,f:5,sus:0.5,fg:4,rh:1}];
      assert.ok(s.draw().some(c=>c[0]==='fillText' && c[1]==='i'));
      assert.ok(!s.calls.some(c=>c[0]==='fillText' && c[1]==='m'));
    } finally {s.close();}
  }
});

test('C minor paints three flats, not seven sharps', () => {
  const s = scene(makeBuiltin2DNotationRenderer,{config:{key:'C',scale:'natural_minor',bpm:120},notes:[]});
  try {
    const glyphs = s.draw().filter(c=>c[0]==='fillText' && ['♭','♯'].includes(c[1])).map(c=>c[1]);
    assert.deepEqual(glyphs,['♭','♭','♭']);
  } finally {s.close();}
});

test('a clipped beam singleton retains its eighth stem and flag', () => {
  const notes = [{t:0,s:0,f:0,sus:0.25},{t:0.25,s:0,f:2,sus:0.25}];
  const s = scene(makeBuiltin2DNotationRenderer,{config:{key:'C',scale:'major',bpm:120},openMidis:[48],notes});
  try {
    assert.equal(s.draw(1.1).filter(c=>c[0]==='ellipse').length,1);
    assert.equal(s.calls.filter(c=>c[0]==='bezierCurveTo').length,1);
    assert.equal(s.draw(0).filter(c=>c[0]==='bezierCurveTo').length,0);
    assert.equal(s.draw(2).filter(c=>c[0]==='ellipse').length,0);
  } finally {s.close();}
});

for (const factory of [makeBuiltin2DTabRenderer,makeBuiltin2DNotationRenderer]) {
  test(`${factory.name} resizes only on size/DPR changes and never accumulates transforms`, () => {
    const s = scene(factory,{notes:[]});
    try {
      for (let i=0;i<10;i++) s.draw();
      assert.deepEqual(s.writes,[['width',800],['height',600]]);
      assert.ok(s.calls.some(c=>c[0]==='setTransform' && c[1]===1));
      s.resize(900,650);s.draw();s.draw();
      assert.deepEqual(s.writes.slice(2),[['width',900],['height',650]]);
      s.resize(900,650,2);s.draw();s.draw();
      assert.deepEqual(s.writes.slice(4),[['width',1800],['height',1300]]);
      assert.ok(s.calls.some(c=>c[0]==='setTransform' && c[1]===2 && c[4]===2));
      assert.ok(s.calls.some(c=>c[0]==='fillRect' && c[3]===900 && c[4]===650));
      s.resize(0,0,2);s.draw();s.draw();
      assert.equal(s.canvas.width,2560);
    } finally {s.close();}
  });
}
