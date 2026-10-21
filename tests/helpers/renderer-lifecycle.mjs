import {parse} from '../../scripts/vendor/acorn.mjs';
import {transportChangedStatements, normalizeTransport, removedUnusedStatements} from './run-transport.mjs';

export const rendererChangedStatements = new Set([
  'activeBundle', 'renderer', 'rendererAttachIdentity', 'generationIdentity',
  'destroyedRenderers', 'rendererFactoryProbe', 'rendererBundle', 'rendererLifecycle',
  'notationMode', 'setRenderTheme', 'resolveRendererFactory', 'replaceCanvas',
  'destroyRenderer', 'stopRenderer', 'stopRendererPlayback', 'attachRenderer',
  'preparePlayback', 'onFullscreenChange', 'drawOnce', 'refitStageDuring', 'tick',
  'onStop', 'onPlayToggle', 'rendererReadyForPlay', 'onGenerate', 'jamPlay', 'jamHotSwapAtWrap',
  'workoutEditor', 'onLaunchSession', 'syncViewSwitcher', 'onViewSwitch', 'bind',
  'practiceSelection'
]);

export function untouchedRendererStatements(source) {
  const ast = parse(source, {ecmaVersion:2022, sourceType:'module'});
  const body = ast.body.find(node => node.expression?.callee?.type === 'FunctionExpression').expression.callee.body.body;
  return body.filter(node => !rendererChangedStatements.has(node.id?.name || node.declarations?.[0]?.id?.name)
    && !removedUnusedStatements.has(node.id?.name || node.declarations?.[0]?.id?.name)
    && !transportChangedStatements.has(node.id?.name || node.declarations?.[0]?.id?.name)
    && !source.slice(node.start,node.end).includes("Object.defineProperty(globalThis.__ss_debug, 'lifecycle'"))
    .map(node => normalizeTransport(source.slice(node.start,node.end)));
}
