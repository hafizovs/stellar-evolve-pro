import { inject, Injectable } from '@angular/core';
import { MassPresetId } from '../models/mass-preset.model';
import { SimulationStore } from '../../features/control-room/simulation.store';
import { StarStore } from '../../features/control-room/star.store';
import { UiStore } from '../ui/ui.store';
import { I18nService } from './i18n.service';
import { ScreenshotService } from './screenshot.service';

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  private readonly simulation = inject(SimulationStore);
  private readonly star = inject(StarStore);
  private readonly ui = inject(UiStore);
  private readonly i18n = inject(I18nService);
  private readonly screenshot = inject(ScreenshotService);
  private listening = false;
  private readonly keydownListener = (event: KeyboardEvent): void => this.handleKeydown(event);

  private readonly presetOrder: MassPresetId[] = ['red_dwarf', 'sun', 'massive', 'supermassive'];

  start(): void {
    if (!this.listening && typeof window !== 'undefined') {
      window.addEventListener('keydown', this.keydownListener);
      this.listening = true;
    }
  }

  stop(): void {
    if (this.listening && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keydownListener);
      this.listening = false;
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const typing = this.isTypingTarget(event.target);

    if (key === ' ' && !typing) {
      event.preventDefault();
      this.simulation.togglePlay();
      return;
    }

    if (typing || event.ctrlKey || event.metaKey || event.altKey) {
      if (key === 'escape') {
        this.ui.closeHotkeysHelp();
      }
      return;
    }

    let handled = true;
    switch (key) {
      case 'r':
        this.resetSimulation();
        break;
      case 'c':
        this.ui.toggleCoreSection();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
        this.applyPreset(Number(key) - 1);
        break;
      case 's':
        this.screenshot.capture();
        break;
      case 't':
        this.ui.toggleTheme();
        break;
      case 'g':
        this.i18n.toggleLocale();
        break;
      case 'h':
        this.ui.toggleHotkeysHelp();
        break;
      case 'escape':
        this.ui.closeHotkeysHelp();
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
    }
  }

  private applyPreset(index: number): void {
    const id = this.presetOrder[index];
    if (id) {
      this.simulation.pause();
      this.simulation.applyPreset(id);
      this.resetSimulation();
    }
  }

  private resetSimulation(): void {
    this.simulation.pause();
    this.simulation.reset();
    this.star.seedPreview(this.simulation.initialMassSolar(), this.simulation.initialMetallicity());
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    const tagName = target.tagName;
    return (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT' ||
      target.isContentEditable ||
      target.closest('[contenteditable="true"]') !== null
    );
  }
}
