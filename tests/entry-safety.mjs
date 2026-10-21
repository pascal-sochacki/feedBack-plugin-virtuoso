// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {characterize} from './helpers/characterization.mjs';
import {buildLab} from '../scripts/cut-lab.mjs';
import {mkdtempSync, rmSync} from 'node:fs';
import {join} from 'node:path';

test('real entry renderer tolerates teardown during resize without painting a released context', () => {
  assert.deepEqual(characterize(undefined, {entrySafety:true}), {entrySafety:true});
  const temp = mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode', 'virtuoso-entry-safety-'));
  try { buildLab(temp); assert.deepEqual(characterize(join(temp, 'virtuoso_lab'), {entrySafety:true}), {entrySafety:true}); }
  finally { rmSync(temp, {recursive:true, force:true}); }
});

test('real entry navigation uses one optional host capability read, surviving immediate withdrawal', () => {
  assert.deepEqual(characterize(undefined, {entrySafety:'host-navigation'}), {entrySafety:'host-navigation'});
  const temp = mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode', 'virtuoso-host-safety-'));
  try { buildLab(temp); assert.deepEqual(characterize(join(temp, 'virtuoso_lab'), {entrySafety:'host-navigation'}), {entrySafety:'host-navigation'}); }
  finally { rmSync(temp, {recursive:true, force:true}); }
});

test('real entry partial panel binds safely when the Play control is absent', () => {
  assert.deepEqual(characterize(undefined, {lifecycle:'missing-play'}), {lifecycle:'missing-play'});
  const temp = mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode', 'virtuoso-panel-safety-'));
  try { buildLab(temp); assert.deepEqual(characterize(join(temp, 'virtuoso_lab'), {lifecycle:'missing-play'}), {lifecycle:'missing-play'}); }
  finally { rmSync(temp, {recursive:true, force:true}); }
});

test('real entry delegated library clicks ignore non-element event targets', () => {
  assert.deepEqual(characterize(undefined, {lifecycle:'non-element-event'}), {lifecycle:'non-element-event'});
  const temp = mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode', 'virtuoso-event-safety-'));
  try { buildLab(temp); assert.deepEqual(characterize(join(temp, 'virtuoso_lab'), {lifecycle:'non-element-event'}), {lifecycle:'non-element-event'}); }
  finally { rmSync(temp, {recursive:true, force:true}); }
});

test('real entry LCD ignores absent/non-control targets while Enter and tempo changes still commit', () => {
  assert.deepEqual(characterize(undefined, {lifecycle:'lcd-events'}), {lifecycle:'lcd-events'});
  const temp = mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode', 'virtuoso-lcd-safety-'));
  try { buildLab(temp); assert.deepEqual(characterize(join(temp, 'virtuoso_lab'), {lifecycle:'lcd-events'}), {lifecycle:'lcd-events'}); }
  finally { rmSync(temp, {recursive:true, force:true}); }
});

test('real entry transient delegated controls ignore null/text/non-element targets', () => {
  assert.deepEqual(characterize(undefined, {lifecycle:'delegated-events'}), {lifecycle:'delegated-events'});
  const temp = mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode', 'virtuoso-delegated-safety-'));
  try { buildLab(temp); assert.deepEqual(characterize(join(temp, 'virtuoso_lab'), {lifecycle:'delegated-events'}), {lifecycle:'delegated-events'}); }
  finally { rmSync(temp, {recursive:true, force:true}); }
});

test('real entry form changes ignore non-control targets without generating notes', () => {
  assert.deepEqual(characterize(undefined, {lifecycle:'form-events'}), {lifecycle:'form-events'});
  const temp = mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode', 'virtuoso-form-safety-'));
  try { buildLab(temp); assert.deepEqual(characterize(join(temp, 'virtuoso_lab'), {lifecycle:'form-events'}), {lifecycle:'form-events'}); }
  finally { rmSync(temp, {recursive:true, force:true}); }
});
