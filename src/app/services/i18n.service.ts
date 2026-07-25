import { inject, Injectable, signal } from '@angular/core';
import { LocaleId } from '../core/models/locale.model';
import { EN_DICTIONARY } from '../i18n/dictionaries/en';
import { RU_DICTIONARY } from '../i18n/dictionaries/ru';
import { I18nKey } from '../i18n/i18n.keys';
import { UiStore } from '../state/ui.store';

const DICTIONARIES = {
  ru: RU_DICTIONARY,
  en: EN_DICTIONARY,
} as const;

const warnedKeys = new Set<string>();

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly ui = inject(UiStore);

  readonly locale = signal<LocaleId>('ru');

  t(key: string, params: Record<string, string | number> = {}): string {
    const dictionary = DICTIONARIES[this.locale()] as Readonly<Record<string, string>>;
    if (!dictionary[key] && !warnedKeys.has(key)) {
      warnedKeys.add(key);
      if (typeof console !== 'undefined') {
        console.warn(`Missing i18n key: ${key}`);
      }
    }
    const template = dictionary[key] ?? key;
    return template.replace(/\{([^{}]+)\}/g, (match, parameter: string) =>
      Object.prototype.hasOwnProperty.call(params, parameter) ? String(params[parameter]) : match,
    );
  }

  translate(key: I18nKey, params?: Record<string, string | number>): string {
    return this.t(key, params);
  }

  setLocale(locale: LocaleId): void {
    this.locale.set(locale);
    this.ui.syncLocale(locale);
  }

  toggleLocale(): void {
    this.setLocale(this.locale() === 'ru' ? 'en' : 'ru');
  }
}
