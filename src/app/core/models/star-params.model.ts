import { SpectralClass } from './spectral-class.model';

export interface StarParams {
  massSolar: number;
  initialMassSolar: number;
  metallicity: number;
  radiusSolar: number;
  luminositySolar: number;
  teffK: number;
  corePressurePa: number;
  spectralClass: SpectralClass;
}

export interface StarState {
  ageYears: number;
  remainingLifeYears: number;
  stage: import('./evolution-stage.model').EvolutionStage;
  burningMode: import('./burning-mode.model').BurningMode;
  params: StarParams;
  composition: import('./core-composition.model').CoreComposition;
  zoneLayout: import('./core-zone.model').CoreZoneLayout;
  stageProgress: number;
  isTerminal: boolean;
  remnantKind: import('./remnant-kind.model').RemnantKind;
  pulsationAmplitude: number;
}
