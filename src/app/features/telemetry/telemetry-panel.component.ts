import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  formatAgeYears,
  formatLuminosity,
  formatMassSolar,
  formatPressurePa,
  formatRadiusSolar,
  formatTemperatureK,
} from '../../domain/stellar/format-stellar';
import { I18nService } from '../../services/i18n.service';
import { StellarPhysicsService } from '../../services/stellar-physics.service';
import { StarStore } from '../../state/star.store';
import { CompositionChartComponent } from './composition-chart.component';

@Component({
  selector: 'sep-telemetry-panel',
  standalone: true,
  imports: [CompositionChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './telemetry-panel.component.html',
  styleUrl: './telemetry-panel.component.scss',
})
export class TelemetryPanelComponent {
  private readonly star = inject(StarStore);
  private readonly physics = inject(StellarPhysicsService);
  private readonly i18n = inject(I18nService);

  readonly state = this.star.current;
  readonly processId = computed(() => this.physics.processDescriptionId(this.state()));

  t(key: string): string {
    return this.i18n.t(key);
  }

  fmtAge(v: number): string {
    return formatAgeYears(v);
  }

  fmtL(v: number): string {
    return formatLuminosity(v);
  }

  fmtM(v: number): string {
    return formatMassSolar(v);
  }

  fmtR(v: number): string {
    return formatRadiusSolar(v);
  }

  fmtT(v: number): string {
    return formatTemperatureK(v);
  }

  fmtP(v: number): string {
    return formatPressurePa(v);
  }
}
