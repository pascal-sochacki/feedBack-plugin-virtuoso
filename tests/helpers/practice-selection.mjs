import {parse} from '../../scripts/vendor/acorn.mjs';
import {rendererChangedStatements} from './renderer-lifecycle.mjs';
import {transportChangedStatements, normalizeTransport, removedUnusedStatements} from './run-transport.mjs';

export const movedSelectionStatements = [
  'PRACTICE_APPLICABILITY','offerableTag','offerable',
  'PATHWAY_STORAGE_KEY','MODE_STORAGE_KEY','PATHWAY_FIRST_VISIT_DEFAULT',
  'positionLabel','shapeLabel','shapeLabelTooltip','syncShapeDropdown',
  'loadedPracticeFile','practiceVariantId','loadPracticeFile','practiceCatalog','pendingInitialPathway','catalogVisitIdentity',
  'initializePracticeCatalog','syncPracticeCatalog','hasActivePathwayFile','cancelPracticeLoad','syncPracticeFileControls',
  'clearPracticeFile','onPracticeVariant','onLoadPracticeFile','activePathwayId','activePathwayVariationIdx','activeTempoTierIdx','_activeBandId',
  'syncCagedButtonStrip','syncShapeDropdownSelectionToHidden','shapeFromFretHint','selectMode','applyPathwayById',
  'positionStep','applyInitialPathway','resumeLastMode','applyTierFields','isHiddenNode','pathwayBandId','syncScaleDropdown',
  'syncAnchorKeyLock','dropPathwayIfUnplayable','practiceSelection','changeModeView','applySelectedConfig',
];

// These adjacent transition writers have independent before-entry cfg/event pins.
export const changedSelectionStatements = [
  'showResultsModal','onGenerate','applyPathwayConfig','reapplyActivePathway',
  'syncTempoTierButtons','bind','boot','onLaunchSession','applyFormState',
];

export function normalizeSelection(source) {
  return source.replaceAll('practiceSelection.pathwayId','activePathwayId')
    .replaceAll('practiceSelection.variationIndex','activePathwayVariationIdx')
    .replaceAll('practiceSelection.tierIndex','activeTempoTierIdx')
    .replaceAll('practiceSelection.bandId','_activeBandId')
    .replaceAll('practiceSelection.file','loadedPracticeFile')
    .replaceAll('practiceSelection.variantId','practiceVariantId')
    .replaceAll('practiceVariantId:practiceVariantId','practiceVariantId')
    .replaceAll('practiceSelection.active','catalogVisitActive')
    .replaceAll('practiceSelection.cancelLoad','cancelPracticeLoad')
    .replaceAll('practiceSelection.hasPathwayFile','hasActivePathwayFile')
    .replaceAll('practiceSelection.isHidden','isHiddenNode')
    .replaceAll('practiceSelection.syncShapes','syncShapeDropdown')
    .replaceAll('practiceSelection.syncShapeHidden','syncShapeDropdownSelectionToHidden')
    .replaceAll('practiceSelection.applyTier','applyTierFields')
    .replaceAll('practiceSelection.browseBand(pwBand ? pwBand.id : bands[0].id);','_activeBandId = pwBand ? pwBand.id : bands[0].id;')
    .replaceAll('practiceSelection.browseBand(b.id);','_activeBandId = b.id;')
    .replaceAll('practiceSelection.browseBand(cross.band.id);','_activeBandId = cross.band.id;')
    .replaceAll('practiceSelection.catalogState?.settled','practiceCatalog?.state.settled')
    .replaceAll('practiceSelection.catalogState.error','practiceCatalog.state.error');
}

export function untouchedSelectionStatements(source) {
  const ast=parse(source,{ecmaVersion:2022,sourceType:'module'});
  const body=ast.body.find(node=>node.expression?.callee?.type==='FunctionExpression').expression.callee.body.body;
  const omitted=new Set([...movedSelectionStatements,...changedSelectionStatements,...rendererChangedStatements,...transportChangedStatements,...removedUnusedStatements]);
  return body.filter(node=>!omitted.has(node.id?.name||node.declarations?.[0]?.id?.name) && !source.slice(node.start,node.end).includes("Object.defineProperty(globalThis.__ss_debug, 'lifecycle'"))
    .map(node=>normalizeSelection(normalizeTransport(source.slice(node.start,node.end))));
}
