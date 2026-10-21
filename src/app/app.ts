import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { HotkeysService } from './core/services/hotkeys.service';
import { I18nService } from './core/services/i18n.service';
import { UiStore } from './core/ui/ui.store';
import { ToolbarComponent } from './core/layout/toolbar/toolbar.component';
import { ControlRoomComponent } from './features/control-room/control-room.component';
import { HotkeysHelpComponent } from './shared/hotkeys-help/hotkeys-help.component';

@Component({
  selector: 'sep-root',
  imports: [ToolbarComponent, ControlRoomComponent, HotkeysHelpComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly ui = inject(UiStore);
  private readonly i18n = inject(I18nService);
  private readonly hotkeys = inject(HotkeysService);

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.dataset['theme'] = this.ui.theme();
        document.documentElement.lang = this.i18n.locale();
      }
    });
  }

  ngOnInit(): void {
    this.hotkeys.start();
  }
}
