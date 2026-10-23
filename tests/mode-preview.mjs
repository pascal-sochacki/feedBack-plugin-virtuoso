import assert from 'node:assert/strict';
import test from 'node:test';
import {createModePreview} from '../src/shell/mode-preview.js';

test('shared-control changes invalidate before active-mode stopped rebuild; editor-mode returns never build',async()=>{
  let mode='guided',bundle='old',playing=true;
  const draft={bpm:123},jam={tempo:87},events=[];
  const preview=createModePreview({mode:()=>mode,invalidate(){events.push('invalidate');bundle=null;playing=false;},
    async workout(){assert.equal(bundle,null);events.push('workout');bundle={draft};},
    async jam(){assert.equal(bundle,null);events.push('jam');bundle={jam};},
    async single(){events.push('single');bundle={mode};}});
  for(mode of ['guided','custom','session','jam']){
    events.length=0;await preview.changed();assert.deepEqual(events,['invalidate',mode==='session'?'workout':mode==='jam'?'jam':'single']);assert.equal(playing,false);
    events.length=0;await preview.returned();assert.deepEqual(events,mode==='session'||mode==='jam'?[]:['single']);
  }
  assert.equal(draft.bpm,123);assert.equal(jam.tempo,87);
});

test('incompatible Workout rebuild leaves no stale bundle and a subsequent corrected launch is recoverable',async()=>{
  let compatible=false,bundle={stale:true};
  const preview=createModePreview({mode:()=> 'session',invalidate(){bundle=null;},async workout(){if(!compatible)throw new Error('incompatible');bundle={fresh:true};},async jam(){},async single(){}});
  await assert.rejects(preview.changed(),/incompatible/);assert.equal(bundle,null);
  compatible=true;await preview.changed();assert.deepEqual(bundle,{fresh:true});
});
