import {
  DEFAULT_MASS_MSUN,
  DEFAULT_METALLICITY,
  MASS_MAX_MSUN,
  MASS_MIN_MSUN,
  Z_MAX,
  Z_MIN,
} from '../../core/constants/stellar.constants';
import { BurningMode } from '../../core/models/burning-mode.model';
import { createPrimordialComposition } from '../../core/models/core-composition.model';
import { isTerminalStage } from '../../core/models/evolution-stage.model';
import { RemnantKind } from '../../core/models/remnant-kind.model';
import { StarState } from '../../core/models/star-params.model';
import {
  applyStageEndComposition,
  burningModeForStage,
  evolveComposition,
} from './fuel-burning';
import {
  estimateRemainingLifeYears,
  estimateTotalLifetimeYears,
  nextStageInPath,
  stageDurationYears,
} from './lifetime';
import { applyMassLoss } from './mass-loss';
import { createZamsParams, zamsRadiusSolar } from './main-sequence';
import { estimateCoreMassSolar, selectRemnant } from './remnant';
import { spectralClassFromTeff } from './spectral-class';
import {
  applyStageParams,
  computeZoneLayout,
  pulsationAmplitudeForStage,
  stageMultipliers,
} from './stage-machine';
import { teffFromLR } from './stefan-boltzmann';

function cloneState(state: StarState): StarState {
  return structuredClone(state);
}

function finalizeParams(state: StarState): StarState {
  const mult = stageMultipliers(state);
  let radiusSolar = state.params.radiusSolar;
  let luminositySolar = state.params.luminositySolar;
  let teffK = state.params.teffK;

  if (state.stage === 'main_sequence' || state.stage === 'protostar') {
    const zams = createZamsParams(state.params.initialMassSolar, state.params.metallicity);
    radiusSolar = zams.radiusSolar;
    luminositySolar = zams.luminositySolar;
    teffK = zams.teffK;
  } else {
    teffK = mult.teffTargetK ?? teffFromLR(luminositySolar, radiusSolar);
  }

  return {
    ...state,
    params: {
      ...state.params,
      radiusSolar,
      luminositySolar,
      teffK,
      spectralClass: spectralClassFromTeff(teffK),
      corePressurePa: 2.5e16 * Math.pow(state.params.massSolar, 2) * (luminositySolar / 100 + 1),
    },
    burningMode: burningModeForStage(state),
    zoneLayout: computeZoneLayout(state),
    pulsationAmplitude: pulsationAmplitudeForStage(state.stage),
  };
}

function enterRemnant(state: StarState, remnant: RemnantKind): StarState {
  const remnantStage =
    remnant === 'white_dwarf'
      ? 'white_dwarf'
      : remnant === 'neutron_star'
        ? 'neutron_star'
        : 'black_hole';
  return finalizeParams(
    applyStageParams({
      ...state,
      stage: remnantStage,
      remnantKind: remnant,
      isTerminal: true,
      stageProgress: 0,
      remainingLifeYears: 0,
      burningMode: remnant === 'white_dwarf' ? 'degenerate_cooling' : 'iron_core',
    }),
  );
}

function transitionToNextStage(state: StarState): StarState {
  if (state.stage === 'supernova') {
    const coreMass = estimateCoreMassSolar(state.params.massSolar);
    const remnant = selectRemnant(state.params.initialMassSolar, coreMass);
    return enterRemnant(state, remnant);
  }

  const nextStage = nextStageInPath(state.stage, state.params.initialMassSolar);
  if (!nextStage) {
    return { ...state, isTerminal: true };
  }

  let next: StarState = {
    ...state,
    stage: nextStage,
    stageProgress: 0,
    composition: applyStageEndComposition(state.stage, state.composition),
  };

  if (nextStage === 'white_dwarf') {
    return enterRemnant(next, 'white_dwarf');
  }

  if (nextStage === 'neutron_star' || nextStage === 'black_hole') {
    const coreMass = estimateCoreMassSolar(next.params.massSolar);
    const remnant = selectRemnant(next.params.initialMassSolar, coreMass);
    return enterRemnant(next, remnant);
  }

  return finalizeParams(applyStageParams(next));
}

export function createInitialStarState(massSolar: number, metallicity: number): StarState {
  const mass = Math.min(MASS_MAX_MSUN, Math.max(MASS_MIN_MSUN, massSolar));
  const z = Math.min(Z_MAX, Math.max(Z_MIN, metallicity));
  const params = createZamsParams(mass, z);
  const composition = createPrimordialComposition(z);

  const state: StarState = {
    ageYears: 0,
    remainingLifeYears: estimateTotalLifetimeYears(mass, z),
    stage: 'main_sequence',
    burningMode: 'none' as BurningMode,
    params,
    composition,
    zoneLayout: {
      coreOuterFraction: 0.25,
      radiativeOuterFraction: 0.7,
      convectiveIsEnvelope: true,
      dominantCoreElementLabel: 'H',
    },
    stageProgress: 0,
    isTerminal: false,
    remnantKind: 'none' as RemnantKind,
    pulsationAmplitude: 0,
  };

  return finalizeParams(state);
}

export function stepStar(state: StarState, dtYears: number): StarState {
  if (state.isTerminal || isTerminalStage(state.stage)) {
    return cloneState(state);
  }

  let next = cloneState(state);
  const newMass = applyMassLoss(next, dtYears);
  next.params = { ...next.params, massSolar: newMass };
  next.composition = evolveComposition(next, dtYears);

  const duration = stageDurationYears(next);
  let progress = next.stageProgress + dtYears / Math.max(duration, 1e-12);

  next = applyStageParams(next);

  while (progress >= 1) {
    const overflow = progress - 1;
    next = transitionToNextStage(next);
    if (next.isTerminal) {
      next.ageYears += dtYears;
      next.remainingLifeYears = 0;
      return finalizeParams(next);
    }
    const newDuration = stageDurationYears(next);
    progress = overflow * (duration / Math.max(newDuration, 1e-12));
    next.stageProgress = Math.min(progress, 0.999999);
    next = applyStageParams(next);
    if (progress < 1) {
      break;
    }
  }

  if (progress < 1) {
    next.stageProgress = progress;
  }

  next = finalizeParams(next);
  next.ageYears += dtYears;
  next.remainingLifeYears = estimateRemainingLifeYears(next);
  next.burningMode = burningModeForStage(next);

  if (next.stage === 'planetary_nebula' && next.stageProgress >= 1) {
    next = transitionToNextStage({ ...next, stage: 'planetary_nebula', stageProgress: 1 });
  }

  return next;
}

export { DEFAULT_MASS_MSUN, DEFAULT_METALLICITY, zamsRadiusSolar };
