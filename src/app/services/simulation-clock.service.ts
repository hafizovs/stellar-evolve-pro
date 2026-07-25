import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { computeAdaptiveDtYears, computeRelativeRate } from '../domain/stellar/adaptive-dt';
import { SimulationStore } from '../state/simulation.store';
import { StarStore } from '../state/star.store';
import { StellarPhysicsService } from './stellar-physics.service';

@Injectable({ providedIn: 'root' })
export class SimulationClockService {
  private readonly simulation = inject(SimulationStore);
  private readonly star = inject(StarStore);
  private readonly physics = inject(StellarPhysicsService);
  private readonly destroyRef = inject(DestroyRef);

  private rafId: number | null = null;
  private lastRelativeRate = 0;

  readonly lastDtYears = signal(0);
  readonly simAgeYears = computed(() => this.star.current().ageYears);
  readonly ticks = signal(0);

  constructor() {
    this.destroyRef.onDestroy(() => this.stop());
    this.startLoop();
  }

  startLoop(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const tick = (): void => {
      if (this.simulation.isPlaying()) {
        this.stepOnce();
      }
      this.rafId = window.requestAnimationFrame(tick);
    };
    this.rafId = window.requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.rafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  stepOnce(): void {
    const current = this.star.current();
    if (current.isTerminal) {
      this.simulation.markTerminal();
      return;
    }

    const dt = computeAdaptiveDtYears(current, this.simulation.timeAccel(), this.lastRelativeRate);
    this.lastDtYears.set(dt);

    const next = this.physics.step(current, dt);
    this.lastRelativeRate = computeRelativeRate(current, next);
    this.star.replaceState(next);
    this.star.appendTrackPoint(next);
    this.ticks.update((n) => n + 1);

    if (next.isTerminal) {
      this.simulation.markTerminal();
      this.simulation.pause();
    }
  }
}
