import assert from 'node:assert/strict';
import test from 'node:test';
import {captureTabControls, restoreTabControls} from '../src/shell/tab-state.js';

test('raw tab controls preserve disabled values and checkboxes without restoring globals', () => {
  const fields = ['bpm','sequence','instrument','stringSetup','customOpenMidis','renderer','countIn','audioNotes','brightness'].map(name => ({name, value:'old-'+name, type:'text', disabled:true}));
  fields.push({name:'advancedMode',value:'on',type:'checkbox',checked:false,disabled:true});
  const elements = [...fields]; elements.namedItem = name => fields.find(field => field.name === name);
  const form = {elements};
  const snapshot = captureTabControls(form);
  fields.forEach(field => {field.value='new';field.checked=true;});
  restoreTabControls(form,snapshot);
  assert.equal(fields[0].value,'old-bpm');assert.equal(fields[1].value,'old-sequence');
  assert.equal(fields.at(-1).checked,false);
  for(const field of fields.slice(2,-1)) assert.equal(field.value,'new',field.name);
});
