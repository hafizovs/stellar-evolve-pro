import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { UiStore } from '../../state/ui.store';
import { HrDiagramComponent } from '../hr-diagram/hr-diagram.component';
import { InitialControlsComponent } from '../initial-controls/initial-controls.component';
import { StellarViewComponent } from '../stellar-view/stellar-view.component';
import { TelemetryPanelComponent } from '../telemetry/telemetry-panel.component';
import { TimePlayerComponent } from '../time-player/time-player.component';

@Component({
  selector: 'sep-control-room',
  standalone: true,
  imports: [
    StellarViewComponent,
    HrDiagramComponent,
    TelemetryPanelComponent,
    InitialControlsComponent,
    TimePlayerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './control-room.component.html',
  styleUrl: './control-room.component.scss',
})
export class ControlRoomComponent {
  private readonly ui = inject(UiStore);
  private readonly i18n = inject(I18nService);

  readonly mobileTab = this.ui.mobileTab;

  t(key: string): string {
    return this.i18n.t(key);
  }

  setTab(tab: 'star' | 'hr' | 'data'): void {
    this.ui.setMobileTab(tab);
  }
}
