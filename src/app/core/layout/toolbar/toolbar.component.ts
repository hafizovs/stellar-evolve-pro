import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MASS_PRESETS } from '../../constants/stellar.constants';
import { MassPresetId } from '../../models/mass-preset.model';
import { I18nService } from '../../services/i18n.service';
import { ScreenshotService } from '../../services/screenshot.service';
import { SimulationStore } from '../../../features/control-room/simulation.store';
import { StarStore } from '../../../features/control-room/star.store';
import { UiStore } from '../../ui/ui.store';

@Component({
  selector: 'sep-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  private readonly simulation = inject(SimulationStore);
  private readonly star = inject(StarStore);
  private readonly ui = inject(UiStore);
  private readonly i18n = inject(I18nService);
  private readonly screenshot = inject(ScreenshotService);

  readonly presets = MASS_PRESETS;
  readonly locale = this.i18n.locale;
  readonly theme = this.ui.theme;

  t(key: string): string {
    return this.i18n.t(key);
  }

  applyPreset(id: MassPresetId): void {
    this.simulation.pause();
    this.simulation.applyPreset(id);
    this.simulation.reset();
    this.star.seedPreview(this.simulation.initialMassSolar(), this.simulation.initialMetallicity());
  }

  captureScreenshot(): void {
    this.screenshot.capture();
  }

  toggleTheme(): void {
    this.ui.toggleTheme();
  }

  toggleLocale(): void {
    this.i18n.toggleLocale();
  }

  openHotkeys(): void {
    this.ui.openHotkeysHelp();
  }

  localeLabel(): string {
    return this.locale() === 'ru' ? 'RU' : 'EN';
  }
}
