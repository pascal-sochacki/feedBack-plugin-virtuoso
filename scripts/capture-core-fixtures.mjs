import { writeFileSync } from 'node:fs';
import { characterize } from '../tests/helpers/characterization.mjs';

const baseline = process.argv[2];
if (!baseline || process.argv.length !== 3) throw new Error('Usage: node scripts/capture-core-fixtures.mjs <committed-pre-extraction-ref>');
const corpus = characterize(undefined, baseline);
const { results, ...metadata } = corpus;
const text = JSON.stringify({ baseline, corpus: { ...metadata, results: {} } }, null, 2)
  .replace('"results": {}', '"results": {\n' + Object.entries(results).map(([id, result]) => `      ${JSON.stringify(id)}: ${JSON.stringify(result)}`).join(',\n') + '\n    }');
writeFileSync(new URL('../tests/fixtures/core-characterization.json', import.meta.url), text + '\n');
console.log(`Captured committed baseline ${baseline}: ${Object.keys(corpus.results).length} cases. Review fixture changes; tests never overwrite them.`);
