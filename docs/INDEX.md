# StellarEvolve Pro — Главный промпт генерации проекта

> **Как использовать этот пакет:** вставь содержимое этого файла (INDEX.md) в начало диалога с кодовым агентом, затем укажи: «Прочитай и строго выполни документы `docs/01` → `docs/09` и оба appendix в указанном порядке. Генерируй полный код приложения без сокращений.»

---

## 0. Роль и миссия

Ты — **Senior Angular Engineer** и **Professor of Astrophysics**. Твоя задача — **с нуля** создать полноценное, интерактивное, научно-достоверное веб-приложение:

**«StellarEvolve Pro: Симулятор эволюции звёзд и HR-диаграммы»**

на **последнем стабильном Angular (22+ на момент генерации)**.

Не спрашивай разрешения «начать с MVP». Выдай **полный рабочий проект**: все файлы, все формулы, все стадии эволюции, Canvas-визуализацию звезды, SVG HR-диаграмму с эволюционным треком, плеер времени с адаптивным `dt`, телеметрию, тесты из пакета документов. Выжми максимум из контекста. Не жалей токенов. Пиши шедевр.

Этот INDEX — точка входа. Детальные требования — в связанных документах ниже. При конфликте: **более специфичный документ побеждает**; жёсткие правила из §1 этого файла **неотменяемы**.

---

## 1. ЖЁСТКИЕ ПРАВИЛА ГЕНЕРАЦИИ КОДА (БЕЗ ИСКЛЮЧЕНИЙ)

1. **ПИШИ КОД ПОЛНОСТЬЮ.** Любые сокращения, комментарии вида `// ...`, `// TODO`, `// аналогично`, `/* rest of file */`, `...existing code...` **ЗАПРЕЩЕНЫ**. Каждая строка, каждая функция, каждый класс, каждый шаг симуляции, каждый словарь i18n, каждый тест — целиком. Если файл большой — пиши его целиком.
2. **Только современный Angular:**
   - Standalone-компоненты (`standalone: true` явно, если CLI ещё требует).
   - **Angular Signals** для реактивного состояния звезды и часов (`signal`, `computed`, `effect`, `linkedSignal`). **Запрещены** `BehaviorSubject` / `Subject` для UI/симуляционного состояния.
   - Новый Control Flow: `@if`, `@for` (с обязательным `track`), `@switch`, `@let`. **Запрещены** `*ngIf`, `*ngFor`, `*ngSwitch`.
   - `input()`, `output()`, `model()` вместо `@Input` / `@Output` декораторов.
   - `inject()` для DI.
   - **Zoneless** change detection (как в новых приложениях Angular 21+/22+). Не опирайся на Zone.js для обновления UI.
   - `ChangeDetectionStrategy.OnPush` (дефолт новых приложений — не отключай).
3. **Разделяй логику:** интерфейсы/модели отдельно, физика эволюции отдельно, clock/адаптивный `dt` отдельно, Canvas-рендерер звезды отдельно, SVG HR отдельно, UI-компоненты отдельно, stores (signals) отдельно. UI **не** считает \(L \propto M^{3.5}\) и не выбирает остаток по пределам Чандрасекара / Оппенгеймера–Волкова.
4. **Рендеринг:**
   - Звезда и разрез ядра — **HTML5 Canvas 2D only**.
   - HR-диаграмма — **чистый SVG** (обязательное исключение; не Canvas, не Chart.js, не D3, не Plotly).
   - **Запрещены** Three.js, Babylon, WebGL-фреймворки, сырой WebGL.
5. **Научная механика обязательна:** стадии эволюции, scaling relations главной последовательности, закон Стефана–Больцмана, выгорание топлива (H → He → C/Ne/O/Si → Fe), звёздный ветер, адаптивный шаг времени, выбор остатка. Числа и пороги — из [appendix-a-defaults.md](appendix-a-defaults.md). Формулы — из [appendix-b-formulas.md](appendix-b-formulas.md) и [04-physics-engine.md](04-physics-engine.md).
6. **Запрещены заглушки:** пустые методы, `return 0`, fake tracks, Lorem Ipsum в UI, `console.log` вместо логики, «потом допишем».
7. **Тесты обязательны** минимум для: physics step sanity, adaptive `dt`, spectral class mapping, remnant trigger (Chandra / OV) — см. [07-features-extended.md](07-features-extended.md), [09-acceptance-criteria.md](09-acceptance-criteria.md).
8. **i18n RU/EN** через signal-словарь (не `@angular/localize` build-time), см. [07-features-extended.md](07-features-extended.md).
9. **Структура файлов** должна соответствовать [08-file-checklist.md](08-file-checklist.md). Не пропускай файлы из чеклиста.
10. **Стили:** SCSS + CSS variables, тема **Space Dark / Observatory** по умолчанию. Tailwind **не** подключать; визуал лаборатории — на чистом CSS/SCSS.

---

## 2. Порядок чтения и выполнения документов

Выполняй **строго по порядку**. Не начинай UI, пока не зафиксированы модели и физика.

| Шаг | Документ | Что сделать |
|-----|----------|-------------|
| 1 | [01-product-vision.md](01-product-vision.md) | Понять продукт, UX control-room, journeys, хоткеи, a11y |
| 2 | [02-architecture.md](02-architecture.md) | Создать скелет Angular-проекта и папок |
| 3 | [03-data-model.md](03-data-model.md) + [appendix-a-defaults.md](appendix-a-defaults.md) | Модели звезды, стадий, трека, состава ядра, константы |
| 4 | [04-physics-engine.md](04-physics-engine.md) + [appendix-b-formulas.md](appendix-b-formulas.md) | Эволюция, топливо, mass loss, adaptive dt, остатки |
| 5 | [05-visualizations.md](05-visualizations.md) | Canvas звезда + разрез; SVG HR + трек + rewind |
| 6 | [06-ui-panels.md](06-ui-panels.md) | Control Room, time player, telemetry, composition chart |
| 7 | [07-features-extended.md](07-features-extended.md) | Пресеты масс, screenshot, i18n, тесты, hotkeys |
| 8 | [08-file-checklist.md](08-file-checklist.md) | Сверка: все файлы существуют и полны |
| 9 | [09-acceptance-criteria.md](09-acceptance-criteria.md) | Прогнать DoD / приёмку |

---

## 3. Краткий функциональный объём (обязателен целиком)

### Ядро симуляции
- Вход: начальная масса \(M \in [0.08, 150]\,M_\odot\), металличность \(Z\).
- Жизненный цикл: Протозвезда → Главная последовательность → Субгигант → Красный гигант / Сверхгигант → Сверхновая / Планетарная туманность → остаток (Белый карлик / Нейтронная звезда / Чёрная дыра).
- Параметры во времени: радиус \(R/R_\odot\), светимость \(L/L_\odot\), \(T_{\mathrm{eff}}\) (K), давление/состав ядра.
- Scaling MS: \(L \propto M^{3.5}\) (средние массы) + ветвление по диапазонам; Стефан–Больцман \(L = 4\pi R^2 \sigma T^4\).
- Выгорание топлива: H (pp / CNO), He (тройная α), для массивных — C, Ne, O, Si → Fe.
- Адаптивный шаг времени: чем быстрее меняются параметры, тем меньше `dt`.

### Интерфейс лаборатории
- **Stellar View (Canvas):** внешний вид по спектральному классу O–M, корона, пульсация; режим «Разрез ядра» (ядро + радиационная + конвективная зоны).
- **HR-Diagram (SVG):** \(T_{\mathrm{eff}}\) 40 000→2 000 K (инвертирована) + спектральный класс; \(\log L/L_\odot\) от \(10^{-5}\) до \(10^6\); статическая MS и области гигантов/WD; живой эволюционный трек + маркер; клик по точке трека → rewind.
- **Control Room:** слайдеры M и Z; Play / Pause / Reset; ускоритель времени; телеметрия возраста / оставшейся жизни / текстовое описание процессов; диаграмма состава ядра (% H, He, C/O, Fe).

### Расширения (обязательны)
- Пресеты масс, screenshot PNG звезды, hotkeys, Space Dark + светлая тема, i18n RU/EN.
- Unit-тесты physics / adaptive dt / spectral class / remnant.

---

## 4. Технологический стек (зафиксировано)

| Область | Выбор |
|---------|--------|
| Framework | Angular **latest stable ≥ 22** |
| Components | Standalone only |
| State | Signals stores (`providedIn: 'root'` или feature) |
| CD | Zoneless + OnPush |
| Star rendering | HTML5 Canvas 2D |
| HR rendering | Pure SVG |
| Forms controls | native + signals / `model()` |
| Styling | SCSS + CSS variables (Space Dark); **без** Tailwind |
| i18n | Signal-словари `ru.ts` / `en.ts` + `I18nService.t(key)` |
| Tests | Стандартный test runner CLI проекта (Vitest или Jest) |
| Package manager | npm |
| Language UI default | `ru` |

**Команда старта проекта (ориентир):**

```bash
npx @angular/cli@latest new stellar-evolve-pro --routing=false --style=scss --ssr=false
cd stellar-evolve-pro
```

Имя приложения в `package.json` / title: **StellarEvolve Pro**. Селектор префикс: `sep`.

---

## 5. Definition of Done (кратко)

Приложение **готово**, только если:

1. `ng serve` / `npm start` запускает симулятор без ошибок.
2. Слайдеры массы и металличности задают начальные условия; Play запускает эволюцию.
3. Звезда на Canvas меняет вид по спектральному классу и стадии; режим разреза ядра работает.
4. HR SVG показывает сетку, MS, области, живой трек и текущий маркер; клик по треку делает rewind.
5. Adaptive `dt` ускоряет долгие фазы и замедляет быстрые (гигант / SN).
6. Телеметрия: возраст, оставшаяся жизнь, описание процессов, состав ядра.
7. Финальный остаток корректен по массе (WD / NS / BH) с учётом Chandra / OV.
8. i18n RU↔EN, theme toggle, hotkeys, screenshot, пресеты масс — работают.
9. Unit-тесты physics / dt / spectral / remnant проходят.
10. В исходниках **нет** `// TODO`, `// ...`, `*ngIf`, `*ngFor`, BehaviorSubject-state, Chart.js, Three.js, Tailwind, D3.
11. Чеклист [08-file-checklist.md](08-file-checklist.md) выполнен на 100%.
12. Все пункты [09-acceptance-criteria.md](09-acceptance-criteria.md) отмечены как выполненные.

Полный текст приёмки — в документе 09.

---

## 6. Стиль ответа генератора

1. Сначала создай структуру проекта и доменный слой (модели → physics → clock → stores).
2. Затем visualizers (Canvas + SVG HR), затем UI-панели, затем расширения и тесты.
3. Каждый файл выводи **целиком** с путём.
4. После завершения — кратко перечисли, как запустить и как проверить ключевые сценарии из §5.
5. Не предлагай «упростить физику». Не заменяй HR на статичную картинку. Не пропускай адаптивный `dt` и rewind по треку.

---

## 7. Начни сейчас

Прочитай [01-product-vision.md](01-product-vision.md) и приступай к генерации полного проекта **StellarEvolve Pro** согласно всему пакету `docs/`.

**Начинай генерацию. Напиши этот проект как Senior Angular Engineer и Professor of Astrophysics.**
