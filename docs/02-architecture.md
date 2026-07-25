# 02 — Architecture (Angular 22+)

Создай приложение строго по этой архитектуре. Не сваливай физику эволюции в компоненты. Не используй NgRx/Akita — только Signals stores.

---

## 2.1 Стек и bootstrap

1. Создай проект Angular **latest stable ≥ 22**, standalone, SCSS, **без SSR**, без routing (предпочтительно **без** `@angular/router`).
2. Включи **zoneless** (дефолт новых приложений). Не добавляй `zone.js` обратно.
3. Prefix: `sep`.
4. Точка входа: `main.ts` → `bootstrapApplication(AppComponent, appConfig)`.
5. `app.config.ts`: `provideZonelessChangeDetection()` (или эквивалент актуального API), никаких обязательных `provideAnimations` (анимации панелей — CSS).

---

## 2.2 Дерево каталогов (обязательное)

```
src/
  index.html
  main.ts
  styles.scss
  app/
    app.component.ts
    app.component.html
    app.component.scss
    app.config.ts

    core/
      constants/
        astronomy.constants.ts
        stellar.constants.ts
        time.constants.ts
        render.constants.ts
        hr.constants.ts
      models/
        evolution-stage.model.ts
        spectral-class.model.ts
        star-params.model.ts
        core-composition.model.ts
        core-zone.model.ts
        burning-mode.model.ts
        remnant-kind.model.ts
        hr-track-point.model.ts
        simulation-clock.model.ts
        initial-conditions.model.ts
        app-phase.model.ts
        theme.model.ts
        locale.model.ts
        mass-preset.model.ts

    domain/
      stellar/
        mass-luminosity.ts
        stefan-boltzmann.ts
        spectral-class.ts
        main-sequence.ts
        lifetime.ts
        fuel-burning.ts
        mass-loss.ts
        stage-machine.ts
        remnant.ts
        adaptive-dt.ts
        star-step.ts
        process-description.ts
        format-stellar.ts
      hr/
        hr-scales.ts
        hr-static-regions.ts
        hr-track.ts

    state/
      simulation.store.ts
      star.store.ts
      ui.store.ts

    services/
      stellar-physics.service.ts
      simulation-clock.service.ts
      render-loop.service.ts
      screenshot.service.ts
      hotkeys.service.ts
      i18n.service.ts

    features/
      toolbar/
        toolbar.component.ts
        toolbar.component.html
        toolbar.component.scss
      stellar-view/
        stellar-view.component.ts
        stellar-view.component.html
        stellar-view.component.scss
        stellar-canvas.renderer.ts
        stellar-core-section.renderer.ts
      hr-diagram/
        hr-diagram.component.ts
        hr-diagram.component.html
        hr-diagram.component.scss
        hr-diagram.mapper.ts
      telemetry/
        telemetry-panel.component.ts
        telemetry-panel.component.html
        telemetry-panel.component.scss
        composition-chart.component.ts
        composition-chart.component.html
        composition-chart.component.scss
      time-player/
        time-player.component.ts
        time-player.component.html
        time-player.component.scss
      control-room/
        control-room.component.ts
        control-room.component.html
        control-room.component.scss
      initial-controls/
        initial-controls.component.ts
        initial-controls.component.html
        initial-controls.component.scss
      hotkeys-help/
        hotkeys-help.component.ts
        hotkeys-help.component.html
        hotkeys-help.component.scss

    i18n/
      locale.type.ts
      i18n.keys.ts
      dictionaries/
        ru.ts
        en.ts

  # tests рядом с domain:
  app/domain/stellar/mass-luminosity.spec.ts
  app/domain/stellar/stefan-boltzmann.spec.ts
  app/domain/stellar/spectral-class.spec.ts
  app/domain/stellar/adaptive-dt.spec.ts
  app/domain/stellar/remnant.spec.ts
  app/domain/stellar/star-step.spec.ts
```

Имена могут отличаться суффиксами `.ts`, но **набор ответственности** обязателен. Не склеивай physics + canvas + HR в один файл на 3000 строк без модулей domain.

Алиас из наработок пользователя:
- `stellar.interfaces.ts` → набор файлов в `core/models/` (допустимо дополнительно реэкспорт-баррель `core/models/stellar.interfaces.ts`).
- `stellar-physics.service.ts` и `simulation-clock.service.ts` — обязательные сервисы с этими именами (или эквивалентными путями выше).

---

## 2.3 Потоки данных (Signals)

```
InitialControls (M, Z)
        │
        ▼
 SimulationStore  ──initialConditions──►  StellarPhysicsService
        │                                         │
        │ play/pause/reset/rewind                 │ step(star, dtYears)
        ▼                                         ▼
 SimulationClockService  ──tick──►  StarStore (params, stage, composition, track)
        │                                         │
        │ adaptiveDtYears                         ├──► StellarView (Canvas)
        │                                         ├──► HrDiagram (SVG)
        └─────────────────────────────────────────┴──► Telemetry / Composition
```

Правила:
1. Компоненты **читают** `star.store` / `simulation.store` / `ui.store` через `inject()` + signals.
2. Компоненты **не** импортируют формулы из `domain/stellar/*` напрямую, кроме чистых mappers визуализации (`hr-diagram.mapper`, formatters). Physics step — только через сервис/store.
3. `effect()` допустим для синхронизации canvas/SVG с signals и для `data-theme` на `<html>`.
4. `requestAnimationFrame` живёт в `RenderLoopService` или `SimulationClockService` — не в каждом компоненте отдельно (допустимо один rAF в clock, отдельный rAF в stellar-view для пульсации — но не три конкурирующих clock).

---

## 2.4 Stores (обязанности)

### `SimulationStore`
- `initialMassSolar`, `initialMetallicity`
- `phase`: `idle | running | paused | rewound | terminal`
- `timeAccel` (безразмерный множитель UI ускорения)
- `isPlaying` computed
- методы: `setInitialMass`, `setInitialMetallicity`, `applyPreset`, `play`, `pause`, `togglePlay`, `reset`, `markTerminal`

### `StarStore`
- `current: StarState` (params + stage + composition + burningMode + ageYears + remainingLifeYears)
- `track: HrTrackPoint[]`
- методы: `replaceState`, `appendTrackPoint`, `rewindToIndex`, `clearTrack`, `seedPreview`

### `UiStore`
- `theme`, `locale`, `showCoreSection`, `showHotkeysHelp`
- `selectedTrackIndex` (nullable; для hover/focus на HR)

---

## 2.5 Services

### `StellarPhysicsService`
Чистая оркестрация domain:
- `createInitialState(mass, Z): StarState`
- `step(state, dtYears): StarState`
- `estimateRemainingLife(state): number`
- `describeProcess(state): ProcessDescriptionId` (ключ i18n)

Не хранит signals. Stateless относительно UI.

### `SimulationClockService`
- Владеет rAF / interval loop.
- Читает `isPlaying`, `timeAccel`.
- На каждый тик: `dtYears = adaptiveDt(...) * timeAccel`; вызывает physics; пишет в `StarStore`; при terminal → `markTerminal`.
- Предоставляет readonly signals: `lastDtYears`, `simAgeYears`, `ticks`.

### `RenderLoopService`
Опционально, если отделяешь visual rAF от physics tick. Минимум: stellar-view подписывается на star signals и рисует в `effect` + rAF для pulse phase.

### `ScreenshotService`
Регистрация stellar canvas + `capture()` → PNG.

### `HotkeysService` / `I18nService`
Как в соседних проектах пакета pet (signal locale, `t(key)`, window keydown).

---

## 2.6 Композиция `AppComponent` / `ControlRoom`

Предпочтительно:
- `AppComponent` = shell (toolbar + `sep-control-room` + hotkeys help).
- `ControlRoomComponent` = grid layout: stellar-view | hr-diagram | telemetry + bottom initial-controls + time-player.

Не дублируй layout в двух местах.

---

## 2.7 Зависимости npm

**Разрешено:** только то, что ставит Angular CLI (+ тестирующий раннер).

**Запрещено добавлять:**
- `tailwindcss`, `three`, `babylonjs`, `chart.js`, `d3`, `plotly.js`, `rxjs-compat`, state-managers (NgRx и т.п.) для этого приложения.

RxJS транзитивно от Angular — ок; не строй на нём UI state.

---

## 2.8 Производительность

1. Не добавляй точку трека каждый микро-тик, если изменение \((\Delta\log T, \Delta\log L)\) меньше порога — см. [05-visualizations.md](05-visualizations.md) / [appendix-a-defaults.md](appendix-a-defaults.md) (`TRACK_MIN_DELTA_*`).
2. HR: перерисовывай path через binding/`[attr.d]` или аккуратный rebuild polyline; не создавай тысячу DOM-кругов без нужды (маркер — один; точки hit-test — transparent overlay path или sampled hit circles max N).
3. Canvas: учитывай `devicePixelRatio` (clamp max 2).

---

## 2.9 Порядок реализации (для генератора)

1. Scaffold Angular + styles tokens + models + constants.
2. Domain stellar + specs.
3. Physics service + clock + stores.
4. Stellar canvas + core section.
5. HR SVG + rewind.
6. Telemetry + controls + toolbar.
7. i18n, hotkeys, screenshot, presets.
8. Пройти [08-file-checklist.md](08-file-checklist.md) и [09-acceptance-criteria.md](09-acceptance-criteria.md).
