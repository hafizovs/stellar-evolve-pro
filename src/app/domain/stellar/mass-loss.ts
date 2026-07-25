import { MIN_MASS_CLAMP_MSUN } from '../../core/constants/stellar.constants';
import { EvolutionStage } from '../../core/models/evolution-stage.model';
import { StarState } from '../../core/models/star-params.model';

function reimersMdot(state: StarState, eta: number): number {
  const l = state.params.luminositySolar;
  const r = state.params.radiusSolar;
  const m = Math.max(state.params.massSolar, MIN_MASS_CLAMP_MSUN);
  return -2e-13 * eta * (l * r) / m;
}

export function massLossRateMsunPerYear(state: StarState): number {
  const { stage, params } = state;
  if (stage === 'main_sequence') {
    if (params.initialMassSolar > 15) {
      return -1e-8 * (params.initialMassSolar / 15) * (params.luminositySolar / 1e4);
    }
    return 0;
  }
  if (stage === 'red_giant' || stage === 'agb' || stage === 'horizontal_branch') {
    return reimersMdot(state, 1);
  }
  if (stage === 'supergiant') {
    return Math.max(reimersMdot(state, 5), -1e-6);
  }
  if (stage === 'planetary_nebula') {
    return reimersMdot(state, 10);
  }
  return 0;
}

export function applyMassLoss(state: StarState, dtYears: number): number {
  const mdot = massLossRateMsunPerYear(state);
  const nextMass = state.params.massSolar + mdot * dtYears;
  return Math.max(MIN_MASS_CLAMP_MSUN, nextMass);
}

export function isGiantStage(stage: EvolutionStage): boolean {
  return (
    stage === 'red_giant' ||
    stage === 'supergiant' ||
    stage === 'agb' ||
    stage === 'horizontal_branch' ||
    stage === 'subgiant'
  );
}
