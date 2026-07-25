import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { UiStore } from '../../state/ui.store';

@Component({
  selector: 'sep-hotkeys-help',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hotkeys-help.component.html',
  styleUrl: './hotkeys-help.component.scss',
})
export class HotkeysHelpComponent {
  private readonly ui = inject(UiStore);
  private readonly i18n = inject(I18nService);

  readonly visible = this.ui.showHotkeysHelp;

  t(key: string): string {
    return this.i18n.t(key);
  }

  close(): void {
    this.ui.closeHotkeysHelp();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
