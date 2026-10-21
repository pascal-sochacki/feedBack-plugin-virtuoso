// Runs real entry/native functions against deterministic browser boundaries.
export async function rendererIntegrationSnapshot(api, lab = false) {
  const prefix = lab ? 'virtuoso_lab' : 'virtuoso';
  const rows = [], scripts = new Map(), errors = [];
  const host = globalThis.window = {};
  const originalDate = Date.now, originalTimeout = globalThis.setTimeout, originalError = console.error;
  let time = 0, ticks = 0, scriptMode = 'load', publish = null;
  Date.now = () => time;
  globalThis.setTimeout = callback => { time += 50; ticks++; publish?.(); callback(); return 0; };
  console.error = text => errors.push(text.replaceAll('virtuoso_lab', 'virtuoso'));
  globalThis.document = {
    getElementById: id => scripts.get(id) || null,
    createElement: () => ({ remove() { scripts.delete(this.id); } }),
    head: { appendChild(script) { scripts.set(script.id, script); if (scriptMode === 'error') script.onerror(); else script.onload(); } },
  };
  const preferred = () => {}, legacy = () => {}, replacement = () => {};
  const identity = fn => fn === preferred ? 'preferred' : fn === legacy ? 'legacy' : fn === replacement ? 'replacement' : fn === null ? null : 'other';
  const select = async kind => {
    const result = await api.resolveRendererFactory(kind);
    return { ...result, factory: result.factory === api.makeBuiltin2DRenderer ? 'builtin' : result.factory === api.makeClassic2DHighwayRenderer ? 'classic' : result.factory === api.makeBuiltin2DTabRenderer ? 'tab' : result.factory === api.makeBuiltin2DNotationRenderer ? 'notation' : identity(result.factory) };
  };
  try {
    for (const [read, current, old] of [[api.hostBus, 'feedBack', 'slopsmith'], [api.hostMinigames, 'feedBackMinigames', 'slopsmithMinigames'], [api.hostDesktop, 'feedBackDesktop', 'slopsmithDesktop']]) {
      rows.push([current, read()]); host[old] = {name:'legacy'}; rows.push(read()); host[current] = {name:'preferred'}; rows.push(read()); host[current] = {name:'replacement'}; rows.push(read()); delete host[current]; delete host[old];
    }
    rows.push(['absent', identity(api.vizFactoryFor('x'))]);
    host.slopsmithViz_x = legacy; rows.push(['legacy', identity(api.vizFactoryFor('x'))]);
    host.feedBackViz_x = preferred; rows.push(['preferred', identity(api.vizFactoryFor('x'))]);
    host.feedBackViz_x = replacement; rows.push(['replacement', identity(api.vizFactoryFor('x'))]);
    host.feedBackViz_x = {}; rows.push(['invalid-preferred', identity(api.vizFactoryFor('x'))]);
    rows.push(['wrong-id', identity(api.vizFactoryFor('wrong'))]);
    rows.push(['already-published', identity(await api.borrowHostViz('x','/x.js')), scripts.size]);
    delete host.feedBackViz_x; delete host.slopsmithViz_x;
    publish = () => { if (ticks === 2) host.feedBackViz_delayed = preferred; };
    rows.push(['delayed', identity(await api.borrowHostViz('delayed','/delayed.js')), ticks]);
    publish = null; scriptMode = 'error';
    rows.push(['script-error', identity(await api.borrowHostViz('absent','/absent.js')), ticks, scripts.has(`${prefix}-viz-absent`)]);
    scriptMode = 'load'; const start = ticks;
    rows.push(['wrong-registration', identity(await api.borrowHostViz('wrong','/wrong.js')), ticks - start]);
    host.slopsmithViz_wrong = legacy;
    rows.push(['late-publication', identity(await api.borrowHostViz('wrong','/wrong.js'))]);
    await api.loadScriptOnce('shared','/shared.js'); await api.loadScriptOnce('shared','/ignored.js'); rows.push(['cache',scripts.get('shared').src]);
    scriptMode = 'error';
    try { await api.loadScriptOnce('failed','/failed.js'); } catch (error) { rows.push(['loader-error',error.message,scripts.has('failed')]); }
    for (const kind of ['highway_2d','tab_2d','notation_2d','builtin_2d','piano_roll','highway_3d','unknown']) rows.push([kind,await select(kind)]);
    rows.push(['no-speculative-2d-script',scripts.has(`${prefix}-viz-highway_2d`)]);
    host.slopsmithViz_highway_2d = legacy; rows.push(['classic-legacy',await select('highway_2d')]);
    host.feedBackViz_highway_2d = preferred; rows.push(['classic-preferred',await select('highway_2d')]);
    for (const [kind,id] of [['builtin_2d','jumpingtab'],['piano_roll','piano'],['highway_3d','highway_3d']]) { host[`feedBackViz_${id}`] = preferred; rows.push([kind+'-host',await select(kind)]); }
    // Preserve the existing loader's in-flight DOM-ID cache behavior: the second
    // request resolves before onload, with factory polling owned by the borrower.
    const append = document.head.appendChild; let pending;
    document.head.appendChild = script => { scripts.set(script.id,script); pending = script; };
    const first = api.loadScriptOnce('race','/race.js'); let secondDone = false;
    await api.loadScriptOnce('race','/race.js').then(() => { secondDone = true; });
    rows.push(['inflight-cache',secondDone]); pending.onload(); await first;
    document.head.appendChild = append;
    return {rows,errors,classic:classicRenderingSnapshot(api.makeClassic2DHighwayRenderer,prefix)};
  } finally { Date.now = originalDate; globalThis.setTimeout = originalTimeout; console.error = originalError; }
}

export function classicRenderingSnapshot(makeRenderer, prefix = 'virtuoso') {
  const calls = [], listeners = new Map();
  const ctx = new Proxy({}, {
    get(_,name) { return (...args) => { calls.push([name,...args]); if (name === 'measureText') return {width:8}; }; },
    set(_,name,value) { calls.push(['set',name,value]); return true; },
  });
  window.addEventListener = (event,fn) => { listeners.set(fn,event); calls.push(['listen',event]); };
  window.removeEventListener = (event,fn) => { calls.push(['unlisten',event,listeners.delete(fn)]); };
  const box = {getBoundingClientRect: () => ({width:800,height:500})};
  document.getElementById = id => id === `${prefix}-render-host` ? box : null;
  const canvas = {width:800,height:500,parentElement:box,getContext: type => { calls.push(['context',type]); return ctx; }};
  const bundle = {
    notes:[{t:0,s:0,f:0,sus:2},{t:0.5,s:1,f:5,sus:0.4,ho:true},{t:1,s:2,f:7,pm:true},{t:1.5,s:3,f:9,po:true},{t:2,s:4,f:4,mt:true},{t:2.5,s:5,f:12,tr:true},{t:3,s:6,f:18,tp:true}],
    beats:[{time:0,measure:0},{time:0.5,measure:-1},{time:2,measure:1}], anchors:[{time:0,fret:1,width:4},{time:2,fret:8,width:5}],
    currentTime:0,stringCount:8,getNoteState: note => note.s === 0 ? 'hit' : note.s === 1 ? {state:'active'} : note.s === 2 ? 'miss' : null,
  };
  const renderer = makeRenderer(), methods = Object.keys(renderer);
  renderer.draw(bundle); renderer.resize(); renderer.init(canvas,bundle);
  for (const currentTime of [0,0.5,2,1]) { bundle.currentTime = currentTime; renderer.draw(bundle); }
  bundle.lefty = true; bundle.inverted = true; renderer.draw(bundle);
  canvas.parentElement = null; renderer.resize();
  renderer.destroy(); const afterDestroy = calls.length; renderer.draw(bundle); renderer.resize();
  const inertAfterDestroy = calls.length === afterDestroy;
  renderer.init(canvas,{notes:[]}); renderer.draw({notes:[],stringCount:4}); renderer.destroy();
  const other = makeRenderer(); other.init(canvas); other.draw({notes:[{t:0,s:0,f:23,sus:1}],stringCount:1,currentTime:0}); other.destroy();
  return {methods,inertAfterDestroy,listeners:listeners.size,calls};
}
