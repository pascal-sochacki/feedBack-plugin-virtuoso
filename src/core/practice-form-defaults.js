// SPDX-License-Identifier: AGPL-3.0-only
import { AUDIO_PROFILES } from './audio-profiles.js';

/**
 * Ordered prewrites prevent specialized rung settings leaking across selections.
 * The form applies the original own keys afterwards: explicit null/false/0 still win.
 * @param {Record<string, unknown>} config
 * @returns {Array<[string, unknown]>}
 */
export function practiceFormDefaults(config) {
  const profile = config.audioProfile ? AUDIO_PROFILES[/** @type {string} */ (config.audioProfile)] : null;
  return [
    ['backingStyle',config.backingStyle || 'pad'], ['swing',config.swing || 'straight'], ['drums',config.drums || ''],
    ['pulseOffbeat',config.pulseOffbeat ? 'true' : ''], ['shapeWalk',config.shapeWalk ? 'true' : ''], ['strokePolicy',config.strokePolicy || ''],
    ['hertaAccent',config.hertaAccent != null ? config.hertaAccent : '0'], ['hertaWalk',config.hertaWalk ? 'true' : ''],
    ['motifCell',config.motifCell || ''], ['motifPhase',config.motifPhase || ''], ['spiderPair',config.spiderPair || ''], ['pimaPattern',config.pimaPattern || ''],
    ['sweepStrings',config.sweepStrings != null ? config.sweepStrings : '0'], ['tapArp',config.tapArp ? 'true' : ''],
    ['rhTechMode',config.rhTechMode || 'pulse'], ['walkApproach',config.walkApproach || 'scale'], ['walkFeel',config.walkFeel || 'four'],
    ['backingComp',config.backingComp || ''], ['backingBass',config.backingBass || ''], ['backingDensity',config.backingDensity != null ? config.backingDensity : ''],
    // This clears only rung L3 tuning. Durable player L1 composition precedes this owner.
    ['customOpenMidis',config.customOpenMidis || ''], ['keyNominal',config.keyNominal || ''], ['tuningOffset',config.tuningOffset != null ? config.tuningOffset : ''], ['anchorStation',config.anchorStation || ''],
    ['audioProfile',config.audioProfile || ''], ['brightness',String(profile && profile.brightness != null ? profile.brightness : 0.5)]
  ];
}
