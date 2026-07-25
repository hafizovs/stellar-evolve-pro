import { BurningMode } from './burning-mode.model';
import { CoreComposition } from './core-composition.model';
import { EvolutionStage } from './evolution-stage.model';
import { StarState } from './star-params.model';

export interface HrTrackPoint {
  index: number;
  ageYears: number;
  teffK: number;
  luminositySolar: number;
  radiusSolar: number;
  massSolar: number;
  stage: EvolutionStage;
  burningMode: BurningMode;
  composition: CoreComposition;
  snapshot: StarState;
}
