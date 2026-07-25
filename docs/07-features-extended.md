# 07 — Extended Features

Все фичи этого документа **обязательны**. Не помечай их optional в коде.

---

## 7.1 Пресеты масс

Файл данных (можно в constants):

| Id | Mass \(M_\odot\) | Z | Назначение |
|----|------------------|---|------------|
| `red_dwarf` | 0.20 | 0.02 | долгая MS, M-звезда |
| `sun` | 1.00 | 0.02 | солнечный путь → WD |
| `massive` | 8.00 | 0.02 | граница SN / NS |
| `supermassive` | 25.0 | 0.02 | сверхгигант → BH |

`applyPreset(id)`:
1. pause
2. set initial M, Z
3. reset simulation + clear track
4. seed ZAMS preview

Hotkeys `1..4` в том же порядке.

---

## 7.2 Screenshot export

`services/screenshot.service.ts`:

```ts
@Injectable({ providedIn: 'root' })
export class ScreenshotService {
  private canvas: HTMLCanvasElement | null = null;

  setCanvas(canvas: HTMLCanvasElement | null): void { /* ... */ }

  capture(): void {
    // 1. assert canvas
    // 2. const url = canvas.toDataURL('image/png')
    // 3. <a download="stellar-evolve-pro-YYYYMMDD-HHmmss.png" href=url>
    // 4. click + remove
  }
}
```

`StellarView` регистрирует canvas в `afterNextRender` / `ngAfterViewInit`-эквиваленте и снимает регистрацию on destroy.

Hotkey `S` → `capture()`.

---

## 7.3 i18n (signal-словари)

### Файлы
- `i18n/locale.type.ts` — `LocaleId`
- `i18n/i18n.keys.ts` — union / const object ключей
- `i18n/dictionaries/ru.ts`
- `i18n/dictionaries/en.ts`
- `services/i18n.service.ts`

### API

```ts
locale = signal<LocaleId>('ru');
t(key: I18nKey): string; // computed from locale
setLocale(locale: LocaleId): void;
toggleLocale(): void;
```

### Обязательные группы ключей
- `brand.*`, `toolbar.*`, `preset.*`
- `controls.*`, `time.*`
- `stellar.*`, `hr.*`, `telemetry.*`
- `stage.*` — все EvolutionStage
- `burning.*` — все BurningMode
- `process.*` — все process description ids
- `remnant.*`
- `zones.*` — core / radiative / convective
- `hotkeys.*`
- `a11y.*`

Каждый ключ должен существовать в **обоих** словарях. Missing key → возвращай сам key и `console.warn` один раз.

Не используй `@angular/localize` build-time.

---

## 7.4 Theme toggle

- `ui.store` / `UiStore.theme` default `'dark'`
- `effect` пишет `document.documentElement.dataset.theme = theme`
- CSS variables из 01
- Hotkey `T`

---

## 7.5 Hotkeys service

`HotkeysService.init()` из `AppComponent` constructor/afterNextRender:
- слушает `window:keydown`
- игнорирует repeat для Space по желанию (допустимо toggle на keydown без repeat)
- не перехватывает, если target input/textarea/select **или** contenteditable
- для range input: не блокируй стрелки браузера, если фокус на range (Space всё же может toggle play — допустимо)

Карта — из [01-product-vision.md](01-product-vision.md).

---

## 7.6 Unit-тесты (минимум)

| Файл | Что проверить |
|------|----------------|
| `mass-luminosity.spec.ts` | \(M=1 → L≈1\); монотонность L(M) на сетке; стыки диапазонов без NaN |
| `stefan-boltzmann.spec.ts` | для L=1,R=1 → Teff≈5772; invert roundtrip относительная ошибка < 1e-6 |
| `spectral-class.spec.ts` | 5772→G; 40000→O; 3000→M |
| `adaptive-dt.spec.ts` | dt(MS) ≫ dt(supernova proxy); clamp min/max; accel увеличивает dt |
| `remnant.spec.ts` | 1→WD; 10→NS или BH по core mass; 40→BH |
| `star-step.spec.ts` | age растёт; H на MS падает; terminal стабилен (step не меняет) |

Запускаться должны через стандартный `npm test` проекта.

---

## 7.7 README.md

В корне приложения:
- описание StellarEvolve Pro (1 абзац)
- `npm install` / `npm start` / `npm test`
- краткая таблица hotkeys
- пометка, что модель параметрическая (не MESA)

---

## 7.8 Дополнительные UX-мелочи (обязательны)

1. При terminal — лёгкий CSS pulse на remnant banner (не раздражающий infinite neon).
2. При смене пресета — toast/hint не обязателен; достаточно мгновенного update UI.
3. HR rewind обрезает future track points.
4. `remainingLifeYears` не показывает отрицательные значения.
5. Все `track` в `@for` обязательны.

---

## 7.9 Что не входит в scope (не реализуй вместо обязательного)

- Полная N-body / двойные системы
- Реалистичный нуклеосинтез network с сотнями изотопов
- WebGL atmospheres
- Backend / auth / save to server

Если остаётся контекст — лучше углубить формулы и визуал, чем добавлять эти темы.
