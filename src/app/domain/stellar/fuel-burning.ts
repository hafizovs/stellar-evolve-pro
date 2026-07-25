import { MASS_CNO_DOMINANT_MIN } from '../../core/constants/stellar.constants';
import { BurningMode } from '../../core/models/burning-mode.model';
import {
  CoreComposition,
  normalizeComposition,
} from '../../core/models/core-composition.model';
import { CoreZoneLayout } from '../../core/models/core-zone.model';
import { EvolutionStage } from '../../core/models/evolution-stage.model';
import { StarState } from '../../core/models/star-params.model';

export function burningModeForStage(state: StarState): BurningMode {
  const { stage, params } = state;
  switch (stage) {
    case 'main_sequence':
      return params.massSolar >= MASS_CNO_DOMINANT_MIN ? 'cno_cycle' : 'pp_chain';
    case 'horizontal_branch':
    case 'agb':
      return 'triple_alpha';
    case 'supergiant':
      if (state.composition.iron >= 0.5) {
        return 'iron_core';
      }
      if (state.composition.carbonOxygen >= 0.4) {
        return 'silicon_burning';
      }
      if (state.composition.helium < 0.2) {
        return 'carbon_burning';
      }
      return 'triple_alpha';
    case 'white_dwarf':
      return 'degenerate_cooling';
    case 'supernova':
      return 'iron_core';
    case 'protostar':
    case 'subgiant':
    case 'red_giant':
      return state.stageProgress > 0.5 ? 'triple_alpha' : 'pp_chain';
    case 'planetary_nebula':
      return 'none';
    case 'neutron_star':
    case 'black_hole':
      return 'none';
    default:
      return 'none';
  }
}

export function dominantCoreElement(
  composition: CoreComposition,
): CoreZoneLayout['dominantCoreElementLabel'] {
  const entries: Array<[CoreZoneLayout['dominantCoreElementLabel'], number]> = [
    ['H', composition.hydrogen],
    ['He', composition.helium],
    ['C/O', composition.carbonOxygen],
    ['Fe', composition.iron],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  if (entries[0][1] < 0.05) {
    return '—';
  }
  return entries[0][0];
}

export function evolveComposition(state: StarState, dtYears: number): CoreComposition {
  const mode = burningModeForStage(state);
  const composition = { ...state.composition };
  const tauMs = Math.max(state.params.initialMassSolar, 0.08);
  const burnRateBase = dtYears / (1e10 * tauMs);

  switch (mode) {
    case 'pp_chain':
    case 'cno_cycle': {
      const factor = mode === 'cno_cycle' ? 1.4 : 1.0;
      const burn = burnRateBase * factor * 65;
      composition.hydrogen = Math.max(0.02, composition.hydrogen - 0.65 * burn);
      composition.helium = composition.helium + 0.65 * burn;
      break;
    }
    case 'triple_alpha': {
      const burn = burnRateBase * 70;
      composition.helium = Math.max(0.02, composition.helium - 0.7 * burn);
      composition.carbonOxygen = composition.carbonOxygen + 0.7 * burn;
      break;
    }
    case 'carbon_burning':
    case 'neon_burning':
    case 'oxygen_burning':
    case 'silicon_burning': {
      const burn = burnRateBase * 50;
      composition.carbonOxygen = Math.max(0.02, composition.carbonOxygen - 0.6 * burn);
      composition.iron = composition.iron + 0.5 * burn;
      composition.other = composition.other + 0.1 * burn;
      break;
    }
    case 'iron_core': {
      composition.iron = Math.min(0.85, composition.iron + burnRateBase * 20);
      break;
    }
    case 'degenerate_cooling':
    case 'none':
      break;
  }

  if (state.stage === 'main_sequence') {
    const targetH = 0.05 + (1 - state.stageProgress) * 0.6;
    composition.hydrogen = composition.hydrogen * 0.95 + targetH * 0.05;
  }

  return normalizeComposition(composition);
}

export function applyStageEndComposition(stage: EvolutionStage, composition: CoreComposition): CoreComposition {
  const next = { ...composition };
  if (stage === 'main_sequence') {
    next.hydrogen = 0.05;
    next.helium = 0.9;
  }
  if (stage === 'horizontal_branch' || stage === 'agb') {
    next.helium = 0.05;
    next.carbonOxygen = 0.75;
  }
  return normalizeComposition(next);
}
