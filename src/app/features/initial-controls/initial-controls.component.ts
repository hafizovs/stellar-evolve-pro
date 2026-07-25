import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MASS_MAX_MSUN, MASS_MIN_MSUN, Z_MAX, Z_MIN } from '../../core/constants/stellar.constants';
import { I18nService } from '../../services/i18n.service';
import { SimulationStore } from '../../state/simulation.store';
import { StarStore } from '../../state/star.store';

@Component({
  selector: 'sep-initial-controls',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './initial-controls.component.html',
  styleUrl: './initial-controls.component.scss',
})
export class InitialControlsComponent {
  private readonly simulation = inject(SimulationStore);
  private readonly star = inject(StarStore);
  private readonly i18n = inject(I18nService);

  readonly mass = this.simulation.initialMassSolar;
  readonly metallicity = this.simulation.initialMetallicity;
  readonly phase = this.simulation.phase;
  readonly ageYears = computed(() => this.star.current().ageYears);

  readonly disabled = computed(
    () =>
      this.phase() === 'running' ||
      this.phase() === 'rewound' ||
      this.ageYears() > 0,
  );

  readonly massMin = MASS_MIN_MSUN;
  readonly massMax = MASS_MAX_MSUN;
  readonly zMin = Z_MIN;
  readonly zMax = Z_MAX;

  readonly logMassMin = Math.log10(MASS_MIN_MSUN);
  readonly logMassMax = Math.log10(MASS_MAX_MSUN);

  t(key: string): string {
    return this.i18n.t(key);
  }

  logMassValue(): number {
    return Math.log10(this.mass());
  }

  onMassLogInput(event: Event): void {
    const logVal = Number((event.target as HTMLInputElement).value);
    const mass = Math.pow(10, logVal);
    this.simulation.setInitialMass(mass);
    if (!this.disabled()) {
      this.star.seedPreview(this.simulation.initialMassSolar(), this.simulation.initialMetallicity());
    }
  }

  onMassNumberInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.simulation.setInitialMass(value);
    if (!this.disabled()) {
      this.star.seedPreview(this.simulation.initialMassSolar(), this.simulation.initialMetallicity());
    }
  }

  onZInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.simulation.setInitialMetallicity(value);
    if (!this.disabled()) {
      this.star.seedPreview(this.simulation.initialMassSolar(), this.simulation.initialMetallicity());
    }
  }
}
