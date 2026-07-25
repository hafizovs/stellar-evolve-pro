# 03 — Data Model & Units

Все интерфейсы ниже реализуй **буквально** в указанных файлах (или через barrel `stellar.interfaces.ts`, реэкспортирующий те же типы). Числовые константы — в [appendix-a-defaults.md](appendix-a-defaults.md); скопируй значения в `*.constants.ts` без «улучшения на глаз».

---

## 3.1 Единицы и астрономические константы

Файл: `src/app/core/constants/astronomy.constants.ts`

```ts
/** Масса Солнца, kg */
export const SOLAR_MASS_KG = 1.98847e30;

/** Радиус Солнца, m */
export const SOLAR_RADIUS_M = 6.957e8;

/** Светимость Солнца, W */
export const SOLAR_LUMINOSITY_W = 3.828e26;

/** Эффективная температура Солнца, K */
export const SOLAR_TEFF_K = 5772;

/** Постоянная Стефана–Больцмана, W m^-2 K^-4 */
export const STEFAN_BOLTZMANN = 5.670374419e-8;

/** Год в секундах (Julian year) */
export const SECONDS_PER_YEAR = 31_557_600;

/** Солнечная металличность (приближение) */
export const SOLAR_METALLICITY_Z = 0.02;

/** Предел Чандрасекара, M_sun */
export const CHANDRASEKHAR_LIMIT_MSUN = 1.4;

/** Предел Оппенгеймера–Волкова (рабочее значение симуляции), M_sun */
export const OPPENHEIMER_VOLKOFF_LIMIT_MSUN = 2.5;
```

Файл: `src/app/core/constants/stellar.constants.ts` — диапазоны массы/Z, пороги стадий, коэффициенты mass-loss, пороги трека — **все числа из Appendix A**.

Файл: `src/app/core/constants/time.constants.ts` — пределы `timeAccel`, базовый `dt`, min/max adaptive dt.

Файл: `src/app/core/constants/hr.constants.ts` — пределы осей HR, размеры отступов SVG.

Файл: `src/app/core/constants/render.constants.ts` — DPR max, pulse amplitudes, corona radii factors.

---

## 3.2 Стадии эволюции

`src/app/core/models/evolution-stage.model.ts`:

```ts
export type EvolutionStage =
  | 'protostar'
  | 'main_sequence'
  | 'subgiant'
  | 'red_giant'
  | 'supergiant'
  | 'horizontal_branch'      // для низких/средних масс после He flash / He burning
  | 'agb'                    // asymptotic giant branch
  | 'planetary_nebula'
  | 'supernova'
  | 'white_dwarf'
  | 'neutron_star'
  | 'black_hole';

export const EVOLUTION_STAGE_ORDER: readonly EvolutionStage[] = [
  'protostar',
  'main_sequence',
  'subgiant',
  'red_giant',
  'supergiant',
  'horizontal_branch',
  'agb',
  'planetary_nebula',
  'supernova',
  'white_dwarf',
  'neutron_star',
  'black_hole',
] as const;

export function isTerminalStage(stage: EvolutionStage): boolean {
  return (
    stage === 'white_dwarf' ||
    stage === 'neutron_star' ||
    stage === 'black_hole'
  );
}

export function isExplosiveOrNebulaStage(stage: EvolutionStage): boolean {
  return stage === 'supernova' || stage === 'planetary_nebula';
}
```

Не все стадии обязательны для каждой массы: FSM в [04-physics-engine.md](04-physics-engine.md) выбирает путь. Типы должны существовать все.

---

## 3.3 Спектральный класс и режим горения

`src/app/core/models/spectral-class.model.ts`:

```ts
export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

export interface SpectralClassInfo {
  readonly spectralClass: SpectralClass;
  readonly teffMinK: number;
  readonly teffMaxK: number;
  /** CSS/canvas fill hint, e.g. '#9bb0ff' */
  readonly colorHex: string;
}
```

`src/app/core/models/burning-mode.model.ts`:

```ts
export type BurningMode =
  | 'none'
  | 'pp_chain'          // proton-proton
  | 'cno_cycle'
  | 'triple_alpha'
  | 'carbon_burning'
  | 'neon_burning'
  | 'oxygen_burning'
  | 'silicon_burning'
  | 'iron_core'         // endothermic / collapse precursor
  | 'degenerate_cooling';
```

`src/app/core/models/remnant-kind.model.ts`:

```ts
export type RemnantKind = 'white_dwarf' | 'neutron_star' | 'black_hole' | 'none';
```

---

## 3.4 Состав ядра и зоны

`src/app/core/models/core-composition.model.ts`:

```ts
/**
 * Массовые доли в ядре. Сумма основных полей должна нормализоваться к ~1
 * (допуск 1e-3) после каждого шага.
 */
export interface CoreComposition {
  /** Водород */
  hydrogen: number;
  /** Гелий */
  helium: number;
  /** Углерод + кислород (объединённый бак для UI) */
  carbonOxygen: number;
  /** Железо и железоподобные продукты */
  iron: number;
  /** Прочие металлы / Ne-Si bucket (не обязательно отдельной колонкой UI) */
  other: number;
}

export function createPrimordialComposition(metallicityZ: number): CoreComposition {
  const z = Math.min(Math.max(metallicityZ, 0), 0.04);
  const hydrogen = Math.max(0, 0.70 - z * 0.5);
  const helium = Math.max(0, 1 - hydrogen - z);
  return {
    hydrogen,
    helium,
    carbonOxygen: z * 0.6,
    iron: z * 0.05,
    other: Math.max(0, 1 - hydrogen - helium - z * 0.65),
  };
}
```

`src/app/core/models/core-zone.model.ts`:

```ts
export type CoreZoneKind = 'core' | 'radiative' | 'convective';

export interface CoreZoneLayout {
  /** Доли радиуса звезды 0..1 от центра к поверхности */
  readonly coreOuterFraction: number;
  readonly radiativeOuterFraction: number; // >= coreOuterFraction
  /** convective = 1 - radiativeOuterFraction (оболочка) или наоборот для полностью конвективных */
  readonly convectiveIsEnvelope: boolean;
  readonly dominantCoreElementLabel: 'H' | 'He' | 'C/O' | 'Fe' | 'Ne' | 'Si' | '—';
}
```

---

## 3.5 Параметры звезды и полное состояние

`src/app/core/models/star-params.model.ts`:

```ts
export interface StarParams {
  /** Текущая масса, M_sun */
  massSolar: number;
  /** Начальная масса (immutable после start), M_sun */
  initialMassSolar: number;
  /** Металличность Z */
  metallicity: number;
  /** Радиус, R_sun */
  radiusSolar: number;
  /** Светимость, L_sun */
  luminositySolar: number;
  /** Эффективная температура, K */
  teffK: number;
  /** Оценка центрального давления (нормализованная или Pa — документируй в коде; UI может показывать relative) */
  corePressurePa: number;
  /** Спектральный класс */
  spectralClass: SpectralClass;
}

export interface StarState {
  ageYears: number;
  remainingLifeYears: number;
  stage: EvolutionStage;
  burningMode: BurningMode;
  params: StarParams;
  composition: CoreComposition;
  zoneLayout: CoreZoneLayout;
  /** Доля «прогресса» внутри текущей стадии 0..1 */
  stageProgress: number;
  /** true после terminal remnant */
  isTerminal: boolean;
  remnantKind: RemnantKind;
  /** Амплитуда пульсации 0..1 для визуала */
  pulsationAmplitude: number;
}
```

`src/app/core/models/initial-conditions.model.ts`:

```ts
export interface InitialConditions {
  massSolar: number;
  metallicity: number;
}

export const DEFAULT_INITIAL_CONDITIONS: InitialConditions = {
  massSolar: 1,
  metallicity: 0.02,
};
```

Диапазоны валидации:
- `massSolar ∈ [MASS_MIN_MSUN, MASS_MAX_MSUN]` = `[0.08, 150]`
- `metallicity ∈ [Z_MIN, Z_MAX]` = `[0.0001, 0.04]` (см. Appendix A)

---

## 3.6 HR track

`src/app/core/models/hr-track-point.model.ts`:

```ts
export interface HrTrackPoint {
  /** Индекс в массиве трека */
  index: number;
  ageYears: number;
  teffK: number;
  luminositySolar: number;
  radiusSolar: number;
  massSolar: number;
  stage: EvolutionStage;
  burningMode: BurningMode;
  composition: CoreComposition;
  /** Снимок, достаточный для rewind */
  snapshot: StarState;
}
```

Хранить полный `snapshot` обязательно для корректного rewind. Если память беспокоит — всё равно храни snapshot (образовательный проект; трек прореживается порогом delta).

---

## 3.7 Clock и фаза приложения

`src/app/core/models/simulation-clock.model.ts`:

```ts
export interface SimulationClockState {
  /** Последний шаг dt в годах симуляции */
  lastDtYears: number;
  /** Множитель ускорения UI (1 = базовый adaptive) */
  timeAccel: number;
  ticks: number;
  isPlaying: boolean;
}
```

`src/app/core/models/app-phase.model.ts`:

```ts
export type AppPhase = 'idle' | 'running' | 'paused' | 'rewound' | 'terminal';
```

`src/app/core/models/mass-preset.model.ts`:

```ts
export type MassPresetId = 'red_dwarf' | 'sun' | 'massive' | 'supermassive';

export interface MassPreset {
  id: MassPresetId;
  massSolar: number;
  metallicity: number;
  labelKey: string; // i18n
}
```

`src/app/core/models/theme.model.ts`:

```ts
export type ThemeId = 'dark' | 'light';
```

`src/app/core/models/locale.model.ts`:

```ts
export type LocaleId = 'ru' | 'en';
```

---

## 3.8 Barrel (опционально, но удобно)

`src/app/core/models/stellar.interfaces.ts` — реэкспорт всех публичных типов выше. Если создаёшь barrel, он должен быть полным (не пустым).

---

## 3.9 Инварианты (проверяй в step / тестах)

1. `composition.hydrogen + helium + carbonOxygen + iron + other ≈ 1` (±1e-3).
2. `params.teffK > 0`, `params.luminositySolar > 0` (кроме BH/terminal freeze — допустимы clamp minima из Appendix A).
3. Для не-terminal: `remainingLifeYears >= 0`.
4. `ageYears` монотонно не убывает при play forward; при rewind уменьшается скачком к snapshot.
5. Stefan–Boltzmann consistency на MS: после расчёта L и R, \(T_{\mathrm{eff}}\) согласован в пределах относительной погрешности **1e-3** (см. appendix B), либо T считается из L,R канонически.

---

## 3.10 Форматирование для UI

`domain/stellar/format-stellar.ts` обязан уметь:
- возраст: годы / тыс. лет / млн лет / млрд лет (авто-масштаб);
- светимость: scientific / eng для крайних значений;
- температуру: целое K с разделителями;
- массу/радиус: 2–3 значащих цифры.

Не форматируй «сырые» 1.23456789e16 в телеметрии без humanize.
