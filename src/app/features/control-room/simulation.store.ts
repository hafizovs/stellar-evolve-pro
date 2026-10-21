import { computed, Injectable, signal } from '@angular/core';
import {
  DEFAULT_INITIAL_CONDITIONS,
  InitialConditions,
} from '../../core/models/initial-conditions.model';
import { AppPhase } from '../../core/models/app-phase.model';
import { MassPresetId } from '../../core/models/mass-preset.model';
import {
  MASS_MAX_MSUN,
  MASS_MIN_MSUN,
  MASS_PRESETS,
  Z_MAX,
  Z_MIN,
} from '../../core/constants/stellar.constants';
import { TIME_ACCEL_DEFAULT } from '../../core/constants/time.constants';

@Injectable({ providedIn: 'root' })
export class SimulationStore {
  readonly initialMassSolar = signal(DEFAULT_INITIAL_CONDITIONS.massSolar);
  readonly initialMetallicity = signal(DEFAULT_INITIAL_CONDITIONS.metallicity);
  readonly phase = signal<AppPhase>('idle');
  readonly timeAccel = signal(TIME_ACCEL_DEFAULT);

  readonly isPlaying = computed(() => this.phase() === 'running');
  readonly initialConditions = computed<InitialConditions>(() => ({
    massSolar: this.initialMassSolar(),
    metallicity: this.initialMetallicity(),
  }));

  setInitialMass(value: number): void {
    this.initialMassSolar.set(Math.min(MASS_MAX_MSUN, Math.max(MASS_MIN_MSUN, value)));
  }

  setInitialMetallicity(value: number): void {
    this.initialMetallicity.set(Math.min(Z_MAX, Math.max(Z_MIN, value)));
  }

  applyPreset(id: MassPresetId): void {
    const preset = MASS_PRESETS.find((p) => p.id === id);
    if (preset) {
      this.setInitialMass(preset.massSolar);
      this.setInitialMetallicity(preset.metallicity);
    }
  }

  play(): void {
    if (this.phase() !== 'terminal') {
      this.phase.set('running');
    }
  }

  pause(): void {
    if (this.phase() === 'running') {
      this.phase.set('paused');
    }
  }

  togglePlay(): void {
    if (this.phase() === 'running') {
      this.pause();
    } else if (this.phase() !== 'terminal') {
      this.play();
    }
  }

  reset(): void {
    this.phase.set('idle');
  }

  markRewound(): void {
    this.phase.set('rewound');
  }

  markTerminal(): void {
    this.phase.set('terminal');
  }

  setTimeAccel(value: number): void {
    this.timeAccel.set(value);
  }
}
