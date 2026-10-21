import { computed, Injectable, signal } from '@angular/core';
import { HrTrackPoint } from '../../core/models/hr-track-point.model';
import { StarState } from '../../core/models/star-params.model';
import { DEFAULT_INITIAL_CONDITIONS } from '../../core/models/initial-conditions.model';
import {
  createTrackPoint,
  shouldAppendPoint,
  thinTrackIfNeeded,
  truncate,
} from '../../domain/hr/hr-track';
import { createInitialStarState } from '../../domain/stellar/star-step';

@Injectable({ providedIn: 'root' })
export class StarStore {
  readonly current = signal<StarState>(
    createInitialStarState(
      DEFAULT_INITIAL_CONDITIONS.massSolar,
      DEFAULT_INITIAL_CONDITIONS.metallicity,
    ),
  );
  readonly track = signal<HrTrackPoint[]>([]);

  readonly stage = computed(() => this.current().stage);
  readonly isTerminal = computed(() => this.current().isTerminal);

  replaceState(state: StarState): void {
    this.current.set(structuredClone(state));
  }

  appendTrackPoint(state: StarState): void {
    const existing = this.track();
    if (!shouldAppendPoint(existing, state)) {
      return;
    }
    const point = createTrackPoint(state, existing.length);
    this.track.set(thinTrackIfNeeded([...existing, point]));
  }

  rewindToIndex(index: number): void {
    const existing = this.track();
    if (index < 0 || index >= existing.length) {
      return;
    }
    const truncated = truncate(existing, index);
    this.track.set(truncated);
    this.current.set(structuredClone(truncated[index].snapshot));
  }

  clearTrack(): void {
    this.track.set([]);
  }

  seedPreview(massSolar: number, metallicity: number): void {
    this.current.set(createInitialStarState(massSolar, metallicity));
    this.clearTrack();
  }
}
