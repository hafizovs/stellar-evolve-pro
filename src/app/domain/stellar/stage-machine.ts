import {
  MASS_FULLY_CONVECTIVE_MAX,
  MASS_SOLAR_LIKE_MAX,
} from '../../core/constants/stellar.constants';
import { CoreZoneLayout } from '../../core/models/core-zone.model';
import { EvolutionStage, isTerminalStage } from '../../core/models/evolution-stage.model';
import { StarState } from '../../core/models/star-params.model';
import { zamsRadiusSolar } from './main-sequence';
import { isGiantStage } from './mass-loss';
import { dominantCoreElement } from './fuel-burning';

function smoothstep(p: number): number {
  const t = Math.min(1, Math.max(0, p));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function computeZoneLayout(state: StarState): CoreZoneLayout {
  const m = state.params.initialMassSolar;
  const giant = isGiantStage(state.stage) || state.stage === 'agb' || state.stage === 'planetary_nebula';

  if (giant) {
    return {
      coreOuterFraction: 0.05,
      radiativeOuterFraction: 0.15,
      convectiveIsEnvelope: true,
      dominantCoreElementLabel: dominantCoreElement(state.composition),
    };
  }

  if (m <= MASS_FULLY_CONVECTIVE_MAX) {
    return {
      coreOuterFraction: 0.05,
      radiativeOuterFraction: 0.05,
      convectiveIsEnvelope: false,
      dominantCoreElementLabel: dominantCoreElement(state.composition),
    };
  }

  if (m <= MASS_SOLAR_LIKE_MAX) {
    return {
      coreOuterFraction: 0.25,
      radiativeOuterFraction: 0.7,
      convectiveIsEnvelope: true,
      dominantCoreElementLabel: dominantCoreElement(state.composition),
    };
  }

  return {
    coreOuterFraction: 0.3,
    radiativeOuterFraction: 0.95,
    convectiveIsEnvelope: false,
    dominantCoreElementLabel: dominantCoreElement(state.composition),
  };
}

export function pulsationAmplitudeForStage(stage: EvolutionStage): number {
  switch (stage) {
    case 'red_giant':
    case 'agb':
    case 'horizontal_branch':
      return 0.25;
    case 'supergiant':
      return 0.35;
    case 'supernova':
      return 1;
    case 'planetary_nebula':
      return 0.2;
    default:
      return 0;
  }
}

export interface StageMultipliers {
  radiusFactor: number;
  luminosityFactor: number;
  teffTargetK: number | null;
}

export function stageMultipliers(state: StarState): StageMultipliers {
  const p = smoothstep(state.stageProgress);

  switch (state.stage) {
    case 'protostar':
      return { radiusFactor: lerp(2, 1, p), luminosityFactor: lerp(0.5, 1, p), teffTargetK: null };
    case 'main_sequence':
      return { radiusFactor: 1, luminosityFactor: 1, teffTargetK: null };
    case 'subgiant':
      return { radiusFactor: lerp(1, 3, p), luminosityFactor: lerp(1, 3, p), teffTargetK: null };
    case 'red_giant':
      return { radiusFactor: lerp(3, 100, p), luminosityFactor: lerp(3, 50, p), teffTargetK: lerp(5000, 3500, p) };
    case 'horizontal_branch':
      return { radiusFactor: 10, luminosityFactor: 50, teffTargetK: 6000 };
    case 'agb':
      return { radiusFactor: lerp(50, 200, p), luminosityFactor: lerp(50, 100, p), teffTargetK: 3200 };
    case 'planetary_nebula':
      return { radiusFactor: lerp(200, 5, p), luminosityFactor: lerp(100, 10, p), teffTargetK: 80000 };
    case 'supergiant':
      return { radiusFactor: lerp(20, 500, p), luminosityFactor: lerp(1e4, 1e5, p), teffTargetK: lerp(8000, 3500, p) };
    case 'supernova':
      return { radiusFactor: 600, luminosityFactor: 1e6, teffTargetK: 50000 };
    case 'white_dwarf':
      return { radiusFactor: 0.01, luminosityFactor: lerp(0.1, 0.001, p), teffTargetK: lerp(100000, 5000, p) };
    case 'neutron_star':
      return { radiusFactor: 1e-5, luminosityFactor: 1e-4, teffTargetK: 1e6 };
    case 'black_hole':
      return { radiusFactor: 0.001, luminosityFactor: 1e-6, teffTargetK: 2000 };
    default:
      return { radiusFactor: 1, luminosityFactor: 1, teffTargetK: null };
  }
}

export function applyStageParams(state: StarState): StarState {
  if (isTerminalStage(state.stage)) {
    return state;
  }
  const mult = stageMultipliers(state);
  const zamsR = zamsRadiusSolar(state.params.initialMassSolar);
  const radiusSolar = Math.max(zamsR * mult.radiusFactor, 1e-6);
  const luminositySolar = Math.max(mult.luminosityFactor, 1e-8);
  return {
    ...state,
    params: {
      ...state.params,
      radiusSolar,
      luminositySolar,
    },
  };
}
