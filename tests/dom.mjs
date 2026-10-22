import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {el} from '../src/shell/dom.js';

test('el appends tier-dot node arrays as children instead of stringifying them', () => {
  class Element {
    constructor(tag) { this.tagName=tag;this.children=[];this.attributes={}; }
    appendChild(child) { this.children.push(child);return child; }
    setAttribute(name,value) { this.attributes[name]=value; }
  }
  globalThis.document={createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text})};

  const dots=[el('span',{className:'tree-tier-dot cleared'}),el('span',{className:'tree-tier-dot'})];
  const container=el('div',{className:'virtuoso_lab-pw-dots'},dots);

  assert.deepEqual(container.children,dots);
  assert.equal(container.children[0].className,'tree-tier-dot cleared');
  assert.equal(container.children[1].className,'tree-tier-dot');

  const screen=readFileSync(new URL('../screen.js',import.meta.url),'utf8');
  const tierDots=screen.match(/const\s+dots\s*=\s*\(pw\.tempoTiers\s*\|\|\s*\[\]\)\.map\([\s\S]*?\n\s*\}\);/);
  assert.ok(tierDots);
  assert.doesNotMatch(tierDots[0],/\.join\(/);
  assert.match(screen,/domEl\('div',\s*\{className:'virtuoso_lab-pw-dots'\},\s*dots\)/);
});
