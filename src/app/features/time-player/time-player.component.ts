import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TIME_ACCEL_MAX, TIME_ACCEL_MIN } from '../../core/constants/time.constants';
import { formatAgeYears, formatDtYears } from '../../domain/stellar/format-stellar';
import { I18nService } from '../../core/services/i18n.service';
import { SimulationClockService } from '../control-room/simulation-clock.service';
import { SimulationStore } from '../control-room/simulation.store';
import { StarStore } from '../control-room/star.store';

@Component({
  selector: 'sep-time-player',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-player.component.html',
  styleUrl: './time-player.component.scss',
})
export class TimePlayerComponent {
  private readonly simulation = inject(SimulationStore);
  private readonly star = inject(StarStore);
  private readonly clock = inject(SimulationClockService);
  private readonly i18n = inject(I18nService);

  readonly phase = this.simulation.phase;
  readonly isPlaying = this.simulation.isPlaying;
  readonly timeAccel = this.simulation.timeAccel;
  readonly lastDt = this.clock.lastDtYears;
  readonly age = this.clock.simAgeYears;

  readonly accelMin = TIME_ACCEL_MIN;
  readonly accelMax = TIME_ACCEL_MAX;

  t(key: string): string {
    return this.i18n.t(key);
  }

  togglePlay(): void {
    this.simulation.togglePlay();
  }

  reset(): void {
    this.simulation.pause();
    this.simulation.reset();
    this.star.seedPreview(this.simulation.initialMassSolar(), this.simulation.initialMetallicity());
  }

  onAccelInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.simulation.setTimeAccel(value);
  }

  fmtDt(v: number): string {
    return formatDtYears(v);
  }

  fmtAge(v: number): string {
    return formatAgeYears(v);
  }

  phaseClass(): string {
    return `phase--${this.phase()}`;
  }
}
