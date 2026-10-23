import assert from 'node:assert/strict';
import test from 'node:test';
import {deriveLessonFields} from '../src/core/lesson-adaptation.js';
test('lesson derivation clears stale metadata and follows anchor, tagged offset and structural tuning without mutating globals',()=>{
  const lesson={stringSetup:'guitar_6_standard',key:'E'};
  assert.equal(deriveLessonFields(lesson,'guitar_6_standard','38,43,48,53,57,62').key,'D');
  assert.equal(deriveLessonFields(lesson,'guitar_6_standard','').tuningOffset,0);
  assert.equal(deriveLessonFields(lesson,'guitar_6_standard','38,45,50,55,59,64').key,'E');
  assert.deepEqual(deriveLessonFields({...lesson,anchor:'open_lowest',anchorFret:0},'bass_4_standard',''),{keyNominal:'',tuningOffset:0,anchorStation:'open',key:'E'});
  assert.equal(deriveLessonFields({...lesson,anchor:'open_lowest',anchorFret:2},'bass_4_standard','38,45,50,55').key,'E');
  assert.deepEqual(lesson,{stringSetup:'guitar_6_standard',key:'E'});
});
