// Lab namespace modification: Pascal Sochacki, 2026-10-19. AGPL-3.0-only.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [input, output, ...extra] = process.argv.slice(2);
if (!input || !output || extra.length || resolve(input) === resolve(output)) {
  throw new Error('Usage: node rebuild-lab.mjs <upstream-player.js> <separate-output.js>');
}
writeFileSync(output, readFileSync(input, 'utf8')
  .replace(/\bWebAudioFont\w*/g, name => 'VirtuosoLab' + name)
  .replace(/(?<![A-Za-z0-9_])_tone_/g, '_virtuoso_lab_tone_')
  .replace(/(?<![A-Za-z0-9_])_drum_/g, '_virtuoso_lab_drum_'));
