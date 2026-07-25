# 06 — UI Panels

Все панели — standalone components, Signals, control flow `@if`/`@for`. Строки UI — только через `I18nService.t(...)`. Стили — SCSS + CSS variables из [01-product-vision.md](01-product-vision.md).

---

## 6.1 Toolbar (`sep-toolbar`)

Элементы слева направо:

1. Brand: **StellarEvolve Pro** (крупный текст; подзаголовок мелким muted).
2. Группа пресетов масс (компактные кнопки): Red Dwarf / Sun / Massive / Supermassive — labels через i18n.
3. Spacer.
4. Button **Screenshot** (`S`).
5. Button **Theme** (`T`).
6. Button **Lang** (`G`) — показывает `RU`/`EN`.
7. Button **Hotkeys** (`H`).

Требования:
- `aria-label` на каждой кнопке.
- Высота toolbar 48px; sticky top.
- Brand визуально тяжелее контролов.
- Пресет применяет массу (+ Z из preset) и делает soft-reset preview (если playing — сначала pause+reset).

i18n keys (минимум): `toolbar.screenshot`, `toolbar.theme`, `toolbar.lang`, `toolbar.hotkeys`, `brand.subtitle`, `preset.red_dwarf`, `preset.sun`, `preset.massive`, `preset.supermassive`.

---

## 6.2 Control Room shell (`sep-control-room`)

Компоновка desktop (≥1100px): CSS grid

```
grid-template-columns: minmax(280px, 1.1fr) minmax(320px, 1.3fr) 340px;
grid-template-rows: 1fr auto;
```

Ячейки:
1. `sep-stellar-view`
2. `sep-hr-diagram`
3. `sep-telemetry-panel`
4. bottom spanning 3 cols: `sep-initial-controls` + `sep-time-player`

Mobile/tablet: tabs `Star | HR | Data`; bottom controls всегда видимы.

---

## 6.3 Initial Controls (`sep-initial-controls`)

| Контрол | Binding | UI range | Notes |
|---------|---------|----------|-------|
| Масса \(M/M_\odot\) | `initialMassSolar` | 0.08–150 | log-слайдер **предпочтителен** (иначе невозможно точно выбрать 0.2 и 25 на одном линейном); если log — покажи numeric input рядом |
| Металличность \(Z\) | `initialMetallicity` | 0.0001–0.04 | linear; default 0.02 |
| Numeric readout | — | — | mono font, 3–4 significant digits |

Поведение:
- Слайдеры **disabled**, если `phase` ∈ {`running`, `rewound`} **или** если `ageYears > 0` до Reset (зафиксировано в 01: disabled until Reset after first step).
- В `idle` с age=0 — можно менять свободно; изменение пересоздаёт preview state через `physics.createInitialState`.

Подписи: `controls.mass`, `controls.metallicity`, единицы в label.

---

## 6.4 Time Player (`sep-time-player`)

Элементы:
1. **Запустить эволюцию** / **Пауза** — одна toggle-кнопка или две; `aria-pressed` для play state.
2. **Сброс** — `reset()`.
3. Слайдер **ускорения времени** `timeAccel`: диапазон из Appendix A (например 0.25…64, step geometric).
4. Readout: `t('time.dt')` + humanized `lastDtYears`; `t('time.age')` short duplicate допустим.
5. Индикатор фазы: idle / running / paused / rewound / terminal (цвет accent / muted / danger).

Disabled:
- Play disabled в `terminal` (или Play no-op).
- Accel работает всегда, влияет на следующий tick.

---

## 6.5 Telemetry Panel (`sep-telemetry-panel`)

Заголовок: `telemetry.title` («Телеметрия» / «Telemetry»).

### Блок A — время
| Поле | Источник |
|------|----------|
| Возраст | `ageYears` humanized |
| Осталось | `remainingLifeYears` humanized |
| Стадия | `t('stage.' + stage)` |
| Режим горения | `t('burning.' + burningMode)` |

### Блок B — параметры
| Поле | Источник | Формат |
|------|----------|--------|
| \(M\) | `params.massSolar` | `X.XX M☉` |
| \(R\) | `params.radiusSolar` | `X.XX R☉` |
| \(L\) | `params.luminositySolar` | scientific ok |
| \(T_{\mathrm{eff}}\) | `params.teffK` | `N K` |
| Спектр | `params.spectralClass` | letter |
| Давление ядра | `params.corePressurePa` | scientific / relative |

### Блок C — процесс
Текстовый абзац: `t(processDescriptionId)`  
Стиль: lab log, 2–4 строки max, не Lorem.

### Блок D — composition chart
Вложи `sep-composition-chart`.

### Terminal banner
Если `isTerminal`: заметный блок с `t('remnant.' + remnantKind)` и кратким итогом.

---

## 6.6 Composition Chart (`sep-composition-chart`)

Чистый **SVG или CSS bars** (без Chart.js).

Показывать 4 столбца/сегмента:
1. H — `composition.hydrogen`
2. He — `composition.helium`
3. C/O — `composition.carbonOxygen`
4. Fe — `composition.iron`

Вариант A (предпочтительный): horizontal stacked bar + легенда %.  
Вариант B: 4 vertical bars.

Требования:
- проценты суммарно показывай по нормализованным 4 полям (other можно включить в легенду «Other» 5-м сегментом — рекомендуется).
- анимация ширины CSS transition ≤ 200ms допустима.
- `aria-label` сводки состава.

---

## 6.7 HR Diagram chrome

Кроме самого SVG (05):
- Заголовок `hr.title`
- Hint `hr.rewindHint`
- Легенда: MS / Giants / WD / Track (цветные swatches)
- При rewind: chip `t('hr.rewound')` пока phase === `rewound`

---

## 6.8 Hotkeys Help (`sep-hotkeys-help`)

Overlay/modal со списком клавиш из 01. Закрытие: button, `Esc`, click backdrop. Focus trap желателен; минимум — focus на close button при открытии.

---

## 6.9 Статус / пустые состояния

| Ситуация | UI |
|----------|-----|
| Track пуст | HR marker на ZAMS, polyline отсутствует |
| Playing first seconds | telemetry обновляется, без пустых «—» |
| Terminal | play disabled, banner remnant |
| Core section on | legend зон видима |

---

## 6.10 Стилевые требования панелей

1. Панели: border `1px solid var(--sep-border)`, background `var(--sep-bg-panel)`, без тяжёлых multi-shadow.
2. Заголовки секций: uppercase tracking optional, но не newspaper layout.
3. Числа — `var(--sep-font-mono)`.
4. Акцент кнопок primary — `var(--sep-accent)` на dark; не purple gradient buttons.
5. Не использовать emoji в кнопках.
