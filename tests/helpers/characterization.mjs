import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export function characterize(root = ROOT, controls = {}) {
  return JSON.parse(execFileSync(process.execPath, [fileURLToPath(new URL('./core-runner.mjs', import.meta.url)), root, JSON.stringify(controls)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
}
