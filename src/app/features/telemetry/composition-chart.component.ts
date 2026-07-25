import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { formatPercent } from '../../domain/stellar/format-stellar';
import { I18nService } from '../../services/i18n.service';
import { StarStore } from '../../state/star.store';

@Component({
  selector: 'sep-composition-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './composition-chart.component.html',
  styleUrl: './composition-chart.component.scss',
})
export class CompositionChartComponent {
  private readonly star = inject(StarStore);
  private readonly i18n = inject(I18nService);

  readonly composition = computed(() => this.star.current().composition);

  readonly segments = computed(() => {
    const c = this.composition();
    return [
      { key: 'composition.h', value: c.hydrogen, color: '#7ec8e8' },
      { key: 'composition.he', value: c.helium, color: '#f0e060' },
      { key: 'composition.co', value: c.carbonOxygen, color: '#f0a94a' },
      { key: 'composition.fe', value: c.iron, color: '#9aa8b8' },
      { key: 'composition.other', value: c.other, color: '#6a7a90' },
    ];
  });

  t(key: string): string {
    return this.i18n.t(key);
  }

  pct(value: number): string {
    return formatPercent(value);
  }
}
