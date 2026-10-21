import { STRING_SETUPS } from '../../src/core/instrument-tuning.js';

// Deterministic canvas boundaries characterize calls, not browser font rasterization.
export function localRenderingSnapshot(api) {
  const rows = [], calls = [], listeners = new Set();
  let box = {width:800,height:600}, marks = 'on';
  globalThis.window = {
    addEventListener(event,fn) { calls.push(['listen',event]); listeners.add(fn); },
    removeEventListener(event,fn) { calls.push(['unlisten',event,listeners.delete(fn)]); },
  };
  globalThis.document = {getElementById:()=>null};
  globalThis.localStorage = {getItem:()=>marks,setItem(){}};
  globalThis.requestAnimationFrame = () => { throw Error('renderer cannot own player RAF'); };
  globalThis.cancelAnimationFrame = () => { throw Error('renderer cannot cancel player RAF'); };
  const ctx = new Proxy({}, {
    get(_,name) {
      return (...args) => {
        calls.push([name,...args]);
        if (name === 'measureText') return {width:String(args[0]).length*8};
        if (name === 'createLinearGradient') return {addColorStop(...args){calls.push(['addColorStop',...args]);}};
      };
    },
    set(_,name,value) { calls.push(['set',name,typeof value === 'object' ? 'gradient' : value]); return true; },
  });
  const canvas = new Proxy({parentElement:{getBoundingClientRect:()=>box},getContext(type){calls.push(['context',type]);return ctx;}}, {
    set(target,name,value) { calls.push(['canvas',name,value]);target[name]=value;return true; },
  });
  let frames = 0, generated = 0, raw = 0;
  const paint = (kind,bundle,label) => {
    calls.length = 0;
    const renderer = api[kind]();
    const methods = Object.keys(renderer);
    renderer.draw(bundle); renderer.resize(); renderer.init(canvas,bundle);
    for (const theme of ['light','dark']) {
      api.setRenderTheme(theme);
      for (const time of [-0.5,0,0.25,1,3,0]) {
        bundle.currentTime = time;
        bundle.lefty = time === 1; bundle.inverted = time === 3;
        renderer.draw(bundle); frames++;
      }
    }
    marks = 'off'; renderer.draw(bundle); frames++; marks = 'on';
    if (renderer.setMode) for (const mode of ['both','tab','notation']) {renderer.setMode(mode);renderer.draw(bundle);frames++;}
    box = {width:0,height:0}; for (const listener of listeners) listener();
    box = {width:1024,height:800}; renderer.resize(); renderer.draw(bundle); frames++;
    renderer.destroy(); const size = calls.length;
    renderer.draw(bundle); renderer.resize();
    const inert = calls.length === size;
    renderer.init(canvas); renderer.draw({notes:[],stringCount:1}); renderer.destroy(); frames++;
    rows.push({kind,label,methods,inert,listeners:listeners.size,width:canvas.width,height:canvas.height,bundle,calls:[...calls]});
    box = {width:800,height:600};
  };
  const kinds = ['makeBuiltin2DTabRenderer','makeBuiltin2DNotationRenderer'];
  for (const [stringSetup,setup] of Object.entries(STRING_SETUPS)) {
    for (const practiceType of ['chromatic','scale','strum_comp','fingerstyle_arp','rhythm_pulse']) {
      if (setup.instrument === 'bass' && ['strum_comp','fingerstyle_arp'].includes(practiceType)) continue;
      const cfg = {stringSetup,practiceType,mode:practiceType,key:'Bb',scale:'natural_minor',bpm:120,bars:1,subdivision:'sixteenth',meter:{numerator:4,denominator:4,grouping:[4]},fretMin:0,fretMax:12,countIn:1,humanSeed:42};
      Object.assign(cfg,{instrument:setup.instrument,stringCount:setup.openMidis.length,openMidis:setup.openMidis.slice(),tuning:setup.tuning.slice(),fretboardSystem:'position',direction:'ascending',sequence:'none',repeatCount:1,countInBars:1,chromaticPattern:'1234',progression:'I-V-vi-IV',chordDepth:'triad',chordOverride:'auto',audio:{notes:false,metronome:true,harmony:true}});
      // Generated paths use their actual bundle funnel, including count-in/backing.
      const bundle = api.makeBundle(api.generateExercise(cfg)); generated++;
      const expectedFormat = 'setRenderTheme' in api && globalThis.__VIRTUOSO_LAB_HARNESS__ ? 'virtuoso_lab-practice' : 'virtuoso-practice';
      if (bundle.songInfo.format !== expectedFormat) throw Error('unexpected bundle namespace');
      bundle.songInfo.format = 'virtuoso-practice';
      bundle.getNoteState = n => n.s%3 === 0 ? 'hit' : n.s%3 === 1 ? 'miss' : 'active';
      for (const kind of kinds) paint(kind,bundle,`${stringSetup}/${practiceType}`);
    }
    const notes = Array.from({length:24},(_,i)=>({t:i*0.0625,s:i%setup.openMidis.length,f:i%3===0?0:i+17,sus:[2,1,0.5,0.25,0.125,0.0625][i%6],fg:i%5,pkd:i%2,rh:i%4===0?i%5:undefined,slap:i%7===0,mt:i%8===0,pm:i%3===0,ho:i%5===0,po:i%6===0,sl:i%4===0?5:-1,bn:i%4===0?1.5:0,vb:i%5===0,tr:i%6===0,hm:i%7===0,hp:i%8===0,tp:i%9===0,ac:i%4===0}));
    notes.push({...notes[0],s:1,f:40,t:0},{...notes[1],s:0,f:24,t:0});
    for (const [key,scale,bpm] of [['G','major',60],['Db','harmonic_minor',200],['A','dorian',90]]) {
      const bundle = {config:{stringSetup,key,scale,bpm,mode:'mixed',meter:{numerator:7,denominator:8}},notes,openMidis:setup.openMidis.map((m,i)=>m-(i%2)*2),stringCount:setup.openMidis.length,leadIn:1,beats:[{time:0,measure:0},{time:0.5,measure:-1},{time:1,measure:1}],chords:[{t:0,id:0},{t:1,id:1}],chordTemplates:[{displayName:'Bbsus4'},{name:'G7'}],sections:[{time:0,name:'Count in'},{time:1,name:'Practice'}],songInfo:{title:'Annotations',duration:5,arrangement:stringSetup.startsWith('bass')?'Bass':'Lead'},getNoteState:n=>n.f===40?'active':n.f%2?'miss':null};
      raw++; for (const kind of kinds) paint(kind,bundle,`${stringSetup}/${key}/${scale}`);
    }
  }
  return {generated,raw,instances:rows.length,frames,rows};
}
