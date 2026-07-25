import { Injectable } from '@angular/core';
import { StarState } from '../core/models/star-params.model';
import { estimateRemainingLifeYears } from '../domain/stellar/lifetime';
import {
  processDescriptionId,
  ProcessDescriptionId,
} from '../domain/stellar/process-description';
import { createInitialStarState, stepStar } from '../domain/stellar/star-step';

@Injectable({ providedIn: 'root' })
export class StellarPhysicsService {
  createInitialState(massSolar: number, metallicity: number): StarState {
    return createInitialStarState(massSolar, metallicity);
  }

  step(state: StarState, dtYears: number): StarState {
    return stepStar(state, dtYears);
  }

  estimateRemainingLifeYears(state: StarState): number {
    return estimateRemainingLifeYears(state);
  }

  processDescriptionId(state: StarState): ProcessDescriptionId {
    return processDescriptionId(state);
  }
}
