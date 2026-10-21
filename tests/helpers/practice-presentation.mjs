import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export async function presentationSnapshot(probe,root,lab) {
  const prefix=lab?'virtuoso_lab':'virtuoso';
  const nodes=new Map(),fields={};
  const ids=['pathway-goal-card','pathway-tag','pathway-title','pathway-goal','pathway-goal-rest','pathway-pb','pathway-tuning-note','pathway-form-cue','pathway-backing-note','prove-clean','goal-more','start-cta','start-verb','start-name','start-skill','position-row','position-label','position-readout','shape','fretboard-system','root','tuning-offset','anchor-station'];
  for(const id of ids) {
    const classes=new Set();
    const el={textContent:'',value:'',style:{},hidden:false,options:[],classes,handlers:[],classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)}};
    Object.defineProperty(el,'innerHTML',{set(){throw Error('Authored presentation must use textContent');}});
    nodes.set(`${prefix}-${id}`,el);
  }
  const form={elements:{namedItem:name=>fields[name]||null}};
  globalThis.document.getElementById=id=>id===`${prefix}-controls`?form:nodes.get(id)||null;
  globalThis.document.querySelector=selector=>fields[selector.match(/name="([^"]+)"/)?.[1]]||null;
  globalThis.document.querySelectorAll=()=>[];
  globalThis.FormData=class {get(name){const field=fields[name];return !field||field.disabled?null:field.type==='checkbox'?(field.checked?'on':null):field.value;}};
  const store=new Map();
  localStorage.getItem=key=>store.get(key)||null;
  localStorage.setItem=(key,value)=>store.set(key,value);
  const rows=[];
  function run(id,tier,variation,cfg,extra={}) {
    for(const key of Object.keys(fields))delete fields[key];
    for(const [name,value] of Object.entries(cfg))fields[name]={value:String(value),checked:!!value,type:name==='advancedMode'?'checkbox':'text'};
    fields.customOpenMidis={value:Array.isArray(cfg.customOpenMidis)?cfg.customOpenMidis.join(','):''};
    nodes.get(`${prefix}-tuning-offset`).value=String(extra.offset||0);
    nodes.get(`${prefix}-anchor-station`).value=extra.station||'';
    nodes.get(`${prefix}-fretboard-system`).value=cfg.fretboardSystem||'position';
    nodes.get(`${prefix}-shape`).options=extra.shapes?[{},{}]:[];
    nodes.get(`${prefix}-root`).classList.toggle(`${prefix}-bass-instrument`,cfg.instrument==='bass');
    store.set(`${prefix}.instrument`,JSON.stringify({stringSetup:cfg.stringSetup||'guitar_6_standard',customOpenMidis:cfg.customOpenMidis||null}));
    store.set(`${prefix}.pathway_tiers`,JSON.stringify(extra.progress||{}));
    store.set(`${prefix}.progress`,JSON.stringify({mode:extra.progressOff?'off':'on',nodes:{}}));
    store.set(`${prefix}.showHandMarks`,extra.marksOff?'off':'on');
    probe.configure(id,tier,variation,extra.transport||{playing:false,paused:false});
    probe.card(id,extra.modified,extra.favorite);probe.position();probe.cta();
    rows.push({id,tier,variation,cfg,extra,description:probe.describe(),dom:Object.fromEntries([...nodes].map(([key,el])=>[key,{text:el.textContent,style:{...el.style},hidden:el.hidden,classes:[...el.classes].sort(),listeners:el.handlers.length}]))});
  }
  for(const [id,pw] of Object.entries(probe.pathways)) {
    for(let variation=0;variation<(pw.vary?.length||1);variation++)for(let tier=0;tier<(pw.tempoTiers?.length||1);tier++) {
      run(id,tier,variation,{...pw.base,...pw.vary?.[variation],bpm:pw.tempoTiers?.[tier]||60},{modified:tier===1,shapes:variation===1,offset:tier===2?-2:0,station:tier===3?'open':''});
    }
  }
  const {parsePracticeMarkdown,practicePathwayEntry}=await import(pathToFileURL(resolve(root,'src/core/practice-files.js')));
  const authored=parsePracticeMarkdown(readFileSync(resolve(root,'assets/practices/guitar/beginner/chromatic-warmup-ladder.md'),'utf8'));
  probe.pathways.chromatic_warmup=practicePathwayEntry(authored);
  for(let variation=0;variation<authored.pathway.variations.length;variation++)for(let tier=0;tier<authored.pathway.tiers.length;tier++)run('chromatic_warmup',tier,variation,{...authored.pathway.base,...authored.pathway.variations[variation].config,...authored.pathway.tiers[tier]});
  for(let i=0;i<40;i++)run('custom',0,0,{instrument:i%2?'bass':'guitar',stringSetup:i%2?'bass_5_standard':'guitar_6_standard',practiceType:i%3?'scale':'chromatic',key:'D',scale:'minor_pentatonic',chromaticPattern:'1234',fretMin:i%12,fretMax:12,backingDensity:i%2,customOpenMidis:i%2?[28,33,38,43,48]:[38,43,48,53,57,62]},{transport:{playing:!!(i%3),paused:i%3===2},favorite:i===39?{name:'<img src=x onerror=bad> & saved'}:undefined});
  const id='pent_foundation',pw=probe.pathways[id];
  for(const progressOff of [false,true])for(const marksOff of [false,true])run(id,3,0,{...pw.base,...pw.vary[0]},{progress:{[id]:{bestBpm:100,highest_tier:3}},progressOff,marksOff});
  const original=probe.pathways[id];
  probe.pathways[id]={...original,label:'<b>plain & label</b>',goal:'Safe <img onerror=bad>. More <script>bad</script> & prose.'};
  run(id,0,0,original.base);probe.pathways[id]=original;
  run('missing',0,0,{practiceType:'chromatic'});
  return rows;
}
