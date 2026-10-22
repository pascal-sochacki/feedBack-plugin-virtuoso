import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { RENDER_THEMES } from '../src/shell/renderers/display-policy.js';

const [html, screen] = await Promise.all([
  readFile(new URL('../screen.html', import.meta.url), 'utf8'),
  readFile(new URL('../screen.js', import.meta.url), 'utf8'),
]);

test('Virtuoso UI tokens follow FeedBack RGB roles with local fallbacks', () => {
  for (const token of ['bg', 'sidebar', 'card', 'cardMuted', 'primary', 'primaryHi', 'text', 'textDim', 'border', 'focus-ring']) {
    assert.match(html, new RegExp(`--fbv-${token},`));
  }
  assert.match(html, /--virtuoso_lab_vir-accent-soft: rgb\(var\(--fbv-primary,/);
  assert.match(html, /--virtuoso_lab_vir-meter: #22c55e/);
  assert.match(html, /--virtuoso_lab_vir-destructive: #b91c1c/);
  assert.match(html, /--virtuoso_lab_vir-bg-0: rgb\(var\(--fbv-bg, 13 13 16\)\)/);
  assert.match(html, /--virtuoso_lab_vir-accent: rgb\(var\(--fbv-primary, 59 130 246\)\)/);
});

test('shared controls inherit host surface, text, accent, and focus roles', () => {
  assert.doesNotMatch(html, /color-scheme\s*:/);
  for (const [selector, roles] of [
    ['.virtuoso_lab-controls input, .virtuoso_lab-controls select', ['vir-input', 'vir-fg', 'vir-border']],
    ['.virtuoso_lab-root option', ['vir-popover', 'vir-popover-fg']],
    ['.virtuoso_lab-button, .virtuoso_lab-actions button', ['vir-secondary', 'vir-secondary-fg', 'vir-border']],
    ['.virtuoso_lab-mini-btn', ['vir-input', 'vir-text-muted', 'vir-border']],
    ['.virtuoso_lab-tp-btn', ['vir-secondary', 'vir-secondary-fg']],
    ['#virtuoso_lab-tuning-select', ['vir-input', 'vir-fg', 'vir-border']],
  ]) {
    const start = html.indexOf(selector);
    assert.notEqual(start, -1, `${selector} rule exists`);
    const rule = html.slice(start, html.indexOf('}', start) + 1);
    for (const role of roles) assert.ok(rule.includes(`--virtuoso_lab_${role}`), `${selector} uses ${role}`);
  }
  assert.match(html, /\.virtuoso_lab-controls input:focus, \.virtuoso_lab-controls select:focus[^}]*vir-accent/);
  assert.match(html, /\.virtuoso_lab-button:focus-visible[^}]*vir-ring/);
  assert.match(html, /\.virtuoso_lab-mini-btn:hover[^}]*vir-btn-hover/);
  assert.match(html, /\.virtuoso_lab-tp-btn:not\(:disabled\):hover[^}]*vir-btn-hover/);
  assert.match(html, /\.virtuoso_lab-actions button\.primary \{[^}]*vir-accent-grad/);
});

test('plugin theme pickers and persisted theme settings are removed', () => {
  for (const removed of [
    'virtuoso_lab-theme-pick', 'virtuoso_lab-cardskin-pick', 'virtuoso_lab-cardtone-pick',
    'virtuoso_lab-skinscope-pick', 'virtuoso_lab-theme-toggle', 'virtuoso_lab.renderTheme',
    'virtuoso_lab.cardSkin', 'virtuoso_lab.skinCockpit', 'virtuoso_lab.theme',
  ]) {
    assert.equal(html.includes(removed) || screen.includes(removed), false, `${removed} should be absent`);
  }
});

test('remaining settings keep Studio energy and non-theme preferences', () => {
  for (const setting of ['virtuoso_lab-energy-pick', 'virtuoso_lab-xp-mode', 'virtuoso_lab-countin-default']) {
    assert.ok(html.includes(setting), `${setting} remains available`);
  }
  assert.ok(screen.includes('virtuoso_lab.energy'));
  assert.ok(screen.includes('virtuoso_lab.xpMode'));
});

test('Tab and Notation retain only the fixed light palette', () => {
  assert.deepEqual(Object.keys(RENDER_THEMES), ['light']);
  assert.equal(RENDER_THEMES.light.bg, '#fbf8ef');
  assert.equal(screen.includes('virtuoso_lab.renderTheme'), false);
});
