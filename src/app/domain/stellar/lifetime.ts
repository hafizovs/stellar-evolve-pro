import {
  INCLUDE_PROTOSTAR_PHASE,
  MASS_BH_DIRECT_MIN,
  MASS_LOW_PATH_MAX,
  MASS_SN_MIN,
  SN_VISUAL_YEARS,
} from '../../core/constants/stellar.constants';
import { EvolutionStage } from '../../core/models/evolution-stage.model';
import { StarState } from '../../core/models/star-params.model';
import { luminositySolarFromMass } from './mass-luminosity';

const MS_BASE_YEARS = 1e10;

export function tauMS(massSolar: number, metallicity: number): number {
  const l = luminositySolarFromMass(massSolar, metallicity);
  return (MS_BASE_YEARS * massSolar) / Math.max(l, 1e-8);
}

export function mainSequenceLifetimeYears(massSolar: number, metallicity: number): number {
  return tauMS(massSolar, metallicity);
}

export function stageDurationYears(state: StarState): number {
  const m0 = state.params.initialMassSolar;
  const tau = tauMS(m0, state.params.metallicity);

  switch (state.stage) {
    case 'protostar':
      if (!INCLUDE_PROTOSTAR_PHASE) {
        return 1;
      }
      return m0 >= 0.5 ? Math.min(5e5, 0.01 * tau) : Math.min(1e7, 0.02 * tau);
    case 'main_sequence':
      return tau;
    case 'subgiant':
      if (m0 >= MASS_BH_DIRECT_MIN) {
        return Math.min(Math.max(0.005 * tau, 1e4), 1e6);
      }
      return Math.min(Math.max(0.05 * tau, 1e6), 2e8);
    case 'red_giant':
      return 0.1 * tau;
    case 'horizontal_branch':
      return 0.01 * tau;
    case 'agb':
      return 0.01 * tau;
    case 'planetary_nebula':
      return 1e4;
    case 'supergiant':
      return Math.max(0.05 * tau, 1e5);
    case 'supernova':
      return SN_VISUAL_YEARS;
    case 'white_dwarf':
    case 'neutron_star':
    case 'black_hole':
      return 1e12;
    default:
      return tau;
  }
}

export function estimateTotalLifetimeYears(massSolar: number, metallicity: number): number {
  const tau = tauMS(massSolar, metallicity);
  if (massSolar < MASS_LOW_PATH_MAX) {
    return tau * 1.2;
  }
  if (massSolar < MASS_SN_MIN) {
    return tau * 1.25;
  }
  if (massSolar < MASS_BH_DIRECT_MIN) {
    return tau * 1.15;
  }
  return tau * 1.1;
}

export function estimateRemainingLifeYears(state: StarState): number {
  if (state.isTerminal) {
    return 0;
  }
  const currentDuration = stageDurationYears(state);
  const currentRemaining = currentDuration * (1 - state.stageProgress);
  let total = currentRemaining;
  const path = evolutionPathForMass(state.params.initialMassSolar);
  const idx = path.indexOf(state.stage);
  for (let i = idx + 1; i < path.length; i += 1) {
    const fakeState: StarState = { ...state, stage: path[i], stageProgress: 0 };
    total += stageDurationYears(fakeState);
  }
  return Math.max(0, total);
}

export function evolutionPathForMass(initialMassSolar: number): EvolutionStage[] {
  if (initialMassSolar < MASS_LOW_PATH_MAX) {
    return ['protostar', 'main_sequence', 'subgiant', 'red_giant', 'planetary_nebula', 'white_dwarf'];
  }
  if (initialMassSolar < MASS_SN_MIN) {
    return [
      'protostar',
      'main_sequence',
      'subgiant',
      'red_giant',
      'horizontal_branch',
      'agb',
      'planetary_nebula',
      'white_dwarf',
    ];
  }
  if (initialMassSolar < MASS_BH_DIRECT_MIN) {
    return ['protostar', 'main_sequence', 'subgiant', 'supergiant', 'supernova', 'neutron_star'];
  }
  return ['protostar', 'main_sequence', 'subgiant', 'supergiant', 'supernova', 'black_hole'];
}

export function nextStageInPath(current: EvolutionStage, initialMassSolar: number): EvolutionStage | null {
  const path = evolutionPathForMass(initialMassSolar);
  const idx = path.indexOf(current);
  if (idx < 0 || idx >= path.length - 1) {
    return null;
  }
  return path[idx + 1];
}
