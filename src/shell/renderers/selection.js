import { borrowHostViz, vizFactoryFor } from './host-factories.js';
import { makeClassic2DHighwayRenderer } from './classic-2d.js';

/**
 * Local factories still owned by entry are explicit construction dependencies,
 * not callbacks into transport or shared state. No factory is invoked here.
 * @param {string} kind
 * @param {import('./renderer-types.js').RendererFactory} makeBuiltin2DRenderer
 * @param {import('./renderer-types.js').RendererFactory} makeBuiltin2DTabRenderer
 * @param {import('./renderer-types.js').RendererFactory} makeBuiltin2DNotationRenderer
 * @returns {Promise<import('./renderer-types.js').RendererSelection>}
 */
export async function selectRendererFactory(kind, makeBuiltin2DRenderer, makeBuiltin2DTabRenderer, makeBuiltin2DNotationRenderer) {
  // Jumping Tab is also the extended-string/bass fallback for the 3D highway.
  if (kind === 'builtin_2d') {
    const f = await borrowHostViz('jumpingtab', '/api/plugins/jumpingtab/screen.js');
    return f ? { factory:f, label:'Jumping Tab' } : { factory:makeBuiltin2DRenderer, label:'2D Highway (fallback)' };
  }
  // HOST CHECK 2026-10-20: static/highway.js createHighway's private
  // _defaultRenderer is not a standalone bundle-driven factory. MIRROR until a
  // host publishes highway_2d; never speculate on an unregistered script URL.
  if (kind === 'highway_2d') {
    const f = vizFactoryFor('highway_2d');
    return f ? { factory:f, label:'2D Highway (host)' } : { factory:makeClassic2DHighwayRenderer, label:'2D Highway' };
  }
  if (kind === 'tab_2d') return { factory:makeBuiltin2DTabRenderer, label:'Tab' };
  if (kind === 'notation_2d') return { factory:makeBuiltin2DNotationRenderer, label:'Notation' };
  // Groundwork remains gated by entry's currently false pianoPathwayActive().
  if (kind === 'piano_roll') {
    const f = await borrowHostViz('piano', '/api/plugins/piano/screen.js');
    return f ? { factory:f, label:'Piano Roll' } : { factory:makeBuiltin2DRenderer, label:'Piano Roll (unavailable)' };
  }
  if (kind === 'highway_3d') {
    const f = await borrowHostViz('highway_3d', '/api/plugins/highway_3d/screen.js');
    return f ? { factory:f, label:'3D Note Highway' } : { factory:makeBuiltin2DRenderer, label:'2D Highway (fallback)', kind:'builtin_2d' };
  }
  return { factory:makeBuiltin2DRenderer, label:'2D Highway (default)' };
}
