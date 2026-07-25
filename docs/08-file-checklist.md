# 08 — File Checklist

Генератор **обязан** создать каждый файл из списка. Отмечай мысленно ☑. Пропуск файла = провал DoD.

Рядом с путём — краткое содержание (1–2 предложения). Код внутри файла — **полный**, без сокращений.

---

## 8.1 Project root / Angular scaffold

| # | Path | Content |
|---|------|---------|
| 1 | `package.json` | Имя `stellar-evolve-pro`, scripts start/build/test |
| 2 | `angular.json` | project config, styles `src/styles.scss` |
| 3 | `tsconfig.json` | base TS config |
| 4 | `tsconfig.app.json` | app TS config |
| 5 | `tsconfig.spec.json` | spec TS config |
| 6 | `src/index.html` | title StellarEvolve Pro, fonts IBM Plex, root element |
| 7 | `src/main.ts` | bootstrapApplication |
| 8 | `src/styles.scss` | CSS variables themes, reset, body full viewport |
| 9 | `README.md` | install/start/test, hotkeys, model disclaimer |

---

## 8.2 App shell

| # | Path | Content |
|---|------|---------|
| 10 | `src/app/app.config.ts` | zoneless providers |
| 11 | `src/app/app.component.ts` | shell + hotkeys init + theme effect |
| 12 | `src/app/app.component.html` | toolbar + control-room + hotkeys help |
| 13 | `src/app/app.component.scss` | shell layout |

---

## 8.3 Core constants

| # | Path | Content |
|---|------|---------|
| 14 | `src/app/core/constants/astronomy.constants.ts` | solar constants, σ, Chandra, OV |
| 15 | `src/app/core/constants/stellar.constants.ts` | mass/Z ranges, stage thresholds, wind, track deltas |
| 16 | `src/app/core/constants/time.constants.ts` | accel range, dt min/max, base fraction |
| 17 | `src/app/core/constants/hr.constants.ts` | axis limits, paddings, hit radius |
| 18 | `src/app/core/constants/render.constants.ts` | DPR, pulse, corona, starfield count |

---

## 8.4 Core models

| # | Path | Content |
|---|------|---------|
| 19 | `src/app/core/models/evolution-stage.model.ts` | EvolutionStage + helpers |
| 20 | `src/app/core/models/spectral-class.model.ts` | SpectralClass + info |
| 21 | `src/app/core/models/star-params.model.ts` | StarParams, StarState |
| 22 | `src/app/core/models/core-composition.model.ts` | CoreComposition + primordial |
| 23 | `src/app/core/models/core-zone.model.ts` | CoreZoneLayout |
| 24 | `src/app/core/models/burning-mode.model.ts` | BurningMode |
| 25 | `src/app/core/models/remnant-kind.model.ts` | RemnantKind |
| 26 | `src/app/core/models/hr-track-point.model.ts` | HrTrackPoint |
| 27 | `src/app/core/models/simulation-clock.model.ts` | SimulationClockState |
| 28 | `src/app/core/models/initial-conditions.model.ts` | InitialConditions + default |
| 29 | `src/app/core/models/app-phase.model.ts` | AppPhase |
| 30 | `src/app/core/models/mass-preset.model.ts` | MassPreset |
| 31 | `src/app/core/models/theme.model.ts` | ThemeId |
| 32 | `src/app/core/models/locale.model.ts` | LocaleId |
| 33 | `src/app/core/models/stellar.interfaces.ts` | barrel re-exports |

---

## 8.5 Domain stellar

| # | Path | Content |
|---|------|---------|
| 34 | `src/app/domain/stellar/mass-luminosity.ts` | L(M) piecewise |
| 35 | `src/app/domain/stellar/stefan-boltzmann.ts` | Teff↔L,R |
| 36 | `src/app/domain/stellar/spectral-class.ts` | class from Teff + colors |
| 37 | `src/app/domain/stellar/main-sequence.ts` | ZAMS radius/luminosity |
| 38 | `src/app/domain/stellar/lifetime.ts` | stage durations |
| 39 | `src/app/domain/stellar/fuel-burning.ts` | composition evolution |
| 40 | `src/app/domain/stellar/mass-loss.ts` | wind Mdot |
| 41 | `src/app/domain/stellar/stage-machine.ts` | stage transitions |
| 42 | `src/app/domain/stellar/remnant.ts` | WD/NS/BH selection |
| 43 | `src/app/domain/stellar/adaptive-dt.ts` | adaptive dt |
| 44 | `src/app/domain/stellar/star-step.ts` | single evolution step |
| 45 | `src/app/domain/stellar/process-description.ts` | process ids |
| 46 | `src/app/domain/stellar/format-stellar.ts` | humanize age/L/T |

---

## 8.6 Domain HR

| # | Path | Content |
|---|------|---------|
| 47 | `src/app/domain/hr/hr-scales.ts` | log scales helpers |
| 48 | `src/app/domain/hr/hr-static-regions.ts` | MS/giant/WD static paths data |
| 49 | `src/app/domain/hr/hr-track.ts` | shouldAppendPoint, truncate |

---

## 8.7 Domain tests

| # | Path | Content |
|---|------|---------|
| 50 | `src/app/domain/stellar/mass-luminosity.spec.ts` | L(M) tests |
| 51 | `src/app/domain/stellar/stefan-boltzmann.spec.ts` | SB tests |
| 52 | `src/app/domain/stellar/spectral-class.spec.ts` | O–M mapping |
| 53 | `src/app/domain/stellar/adaptive-dt.spec.ts` | dt policy |
| 54 | `src/app/domain/stellar/remnant.spec.ts` | remnant branches |
| 55 | `src/app/domain/stellar/star-step.spec.ts` | step integration sanity |

---

## 8.8 State

| # | Path | Content |
|---|------|---------|
| 56 | `src/app/state/simulation.store.ts` | phase, initial M/Z, accel, play/pause/reset |
| 57 | `src/app/state/star.store.ts` | current star, track, rewind |
| 58 | `src/app/state/ui.store.ts` | theme, locale, core section, hotkeys help |

---

## 8.9 Services

| # | Path | Content |
|---|------|---------|
| 59 | `src/app/services/stellar-physics.service.ts` | createInitialState/step/remaining/process |
| 60 | `src/app/services/simulation-clock.service.ts` | rAF loop + adaptive dt |
| 61 | `src/app/services/render-loop.service.ts` | optional shared rAF; если логика в clock+view — файл всё равно с тонкой обёрткой **или** объедини документированно, но предпочти отдельный минимальный сервис pulse/time |
| 62 | `src/app/services/screenshot.service.ts` | PNG capture |
| 63 | `src/app/services/hotkeys.service.ts` | keyboard map |
| 64 | `src/app/services/i18n.service.ts` | t(key), locale signal |

Если `render-loop.service.ts` кажется избыточным: создай его как тонкий `now()`/`start(cb)/stop` shared ticker — не пропускай номер чеклиста молча.

---

## 8.10 Features — toolbar & shell

| # | Path | Content |
|---|------|---------|
| 65 | `src/app/features/toolbar/toolbar.component.ts` | brand, presets, actions |
| 66 | `src/app/features/toolbar/toolbar.component.html` | markup |
| 67 | `src/app/features/toolbar/toolbar.component.scss` | styles |
| 68 | `src/app/features/control-room/control-room.component.ts` | grid composition |
| 69 | `src/app/features/control-room/control-room.component.html` | layout |
| 70 | `src/app/features/control-room/control-room.component.scss` | responsive grid |
| 71 | `src/app/features/hotkeys-help/hotkeys-help.component.ts` | overlay |
| 72 | `src/app/features/hotkeys-help/hotkeys-help.component.html` | list |
| 73 | `src/app/features/hotkeys-help/hotkeys-help.component.scss` | styles |

---

## 8.11 Features — stellar view

| # | Path | Content |
|---|------|---------|
| 74 | `src/app/features/stellar-view/stellar-view.component.ts` | canvas host + toggle |
| 75 | `src/app/features/stellar-view/stellar-view.component.html` | template |
| 76 | `src/app/features/stellar-view/stellar-view.component.scss` | styles |
| 77 | `src/app/features/stellar-view/stellar-canvas.renderer.ts` | exterior draw |
| 78 | `src/app/features/stellar-view/stellar-core-section.renderer.ts` | cross-section draw |

---

## 8.12 Features — HR diagram

| # | Path | Content |
|---|------|---------|
| 79 | `src/app/features/hr-diagram/hr-diagram.component.ts` | SVG HR + click rewind |
| 80 | `src/app/features/hr-diagram/hr-diagram.component.html` | svg template |
| 81 | `src/app/features/hr-diagram/hr-diagram.component.scss` | styles |
| 82 | `src/app/features/hr-diagram/hr-diagram.mapper.ts` | teff/L → x/y |

---

## 8.13 Features — telemetry & controls

| # | Path | Content |
|---|------|---------|
| 83 | `src/app/features/telemetry/telemetry-panel.component.ts` | metrics + process |
| 84 | `src/app/features/telemetry/telemetry-panel.component.html` | template |
| 85 | `src/app/features/telemetry/telemetry-panel.component.scss` | styles |
| 86 | `src/app/features/telemetry/composition-chart.component.ts` | H/He/C-O/Fe chart |
| 87 | `src/app/features/telemetry/composition-chart.component.html` | svg/css bars |
| 88 | `src/app/features/telemetry/composition-chart.component.scss` | styles |
| 89 | `src/app/features/time-player/time-player.component.ts` | play/pause/reset/accel |
| 90 | `src/app/features/time-player/time-player.component.html` | template |
| 91 | `src/app/features/time-player/time-player.component.scss` | styles |
| 92 | `src/app/features/initial-controls/initial-controls.component.ts` | mass/Z sliders |
| 93 | `src/app/features/initial-controls/initial-controls.component.html` | template |
| 94 | `src/app/features/initial-controls/initial-controls.component.scss` | styles |

---

## 8.14 i18n

| # | Path | Content |
|---|------|---------|
| 95 | `src/app/i18n/locale.type.ts` | LocaleId |
| 96 | `src/app/i18n/i18n.keys.ts` | keys union/const |
| 97 | `src/app/i18n/dictionaries/ru.ts` | полный RU словарь |
| 98 | `src/app/i18n/dictionaries/en.ts` | полный EN словарь |

---

## 8.15 Итого

Минимум **98** файлов приложения по таблице (плюс служебные CLI вроде `public/` favicon — по желанию). Если CLI создаёт дополнительные конфиги (`eslint`, `.editorconfig`, `vitest.config`…) — оставь их; **не** удаляй ради «чистоты».

После генерации пройди список сверху вниз и убедись, что каждый path существует и не содержит `// TODO` / `// ...`.
