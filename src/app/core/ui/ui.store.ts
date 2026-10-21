import { Injectable, signal } from '@angular/core';
import { LocaleId } from '../models/locale.model';
import { ThemeId } from '../models/theme.model';

@Injectable({ providedIn: 'root' })
export class UiStore {
  readonly theme = signal<ThemeId>('dark');
  readonly locale = signal<LocaleId | null>(null);
  readonly showCoreSection = signal(false);
  readonly showHotkeysHelp = signal(false);
  readonly selectedTrackIndex = signal<number | null>(null);
  readonly mobileTab = signal<'star' | 'hr' | 'data'>('star');

  setTheme(theme: ThemeId): void {
    this.theme.set(theme);
  }

  toggleTheme(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  syncLocale(locale: LocaleId): void {
    this.locale.set(locale);
  }

  setShowCoreSection(value: boolean): void {
    this.showCoreSection.set(value);
  }

  toggleCoreSection(): void {
    this.showCoreSection.update((v) => !v);
  }

  openHotkeysHelp(): void {
    this.showHotkeysHelp.set(true);
  }

  closeHotkeysHelp(): void {
    this.showHotkeysHelp.set(false);
  }

  toggleHotkeysHelp(): void {
    this.showHotkeysHelp.update((v) => !v);
  }

  setSelectedTrackIndex(index: number | null): void {
    this.selectedTrackIndex.set(index);
  }

  setMobileTab(tab: 'star' | 'hr' | 'data'): void {
    this.mobileTab.set(tab);
  }
}
