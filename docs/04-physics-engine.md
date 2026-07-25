# 04 — Physics Engine (Stellar Evolution)

Реализуй физику **точно** по этому документу и [appendix-b-formulas.md](appendix-b-formulas.md). Не заменяй эволюцию случайным блужданием точки на HR. Не пропускай адаптивный `dt` и выбор остатка.

Это **параметрическая** образовательная модель (scaling + stage machine), а не полный 1D stellar structure code. Достоверность = правильные порядки величин, корректные ветвления по массе, согласованность Stefan–Boltzmann, правдоподобные треки.

---

## 4.1 Файлы domain

| Файл | Назначение |
|------|------------|
| `domain/stellar/mass-luminosity.ts` | \(L(M)\) по диапазонам массы |
| `domain/stellar/stefan-boltzmann.ts` | \(T_{\mathrm{eff}}\) из \(L,R\) и обратно |
| `domain/stellar/spectral-class.ts` | O–M от \(T_{\mathrm{eff}}\) |
| `domain/stellar/main-sequence.ts` | ZAMS параметры + радиус MS |
| `domain/stellar/lifetime.ts` | \(\tau_{\mathrm{MS}}\) и оценки фаз |
| `domain/stellar/fuel-burning.ts` | эволюция состава ядра |
| `domain/stellar/mass-loss.ts` | звёздный ветер |
| `domain/stellar/stage-machine.ts` | переходы стадий |
| `domain/stellar/remnant.ts` | WD / NS / BH |
| `domain/stellar/adaptive-dt.ts` | выбор `dt` |
| `domain/stellar/star-step.ts` | один шаг эволюции |
| `domain/stellar/process-description.ts` | id текста процессов |
| `services/stellar-physics.service.ts` | оркестрация API |
| `services/simulation-clock.service.ts` | тики + adaptive dt |

---

## 4.2 API `StellarPhysicsService`

```ts
@Injectable({ providedIn: 'root' })
export class StellarPhysicsService {
  createInitialState(massSolar: number, metallicity: number): StarState;
  step(state: StarState, dtYears: number): StarState;
  estimateRemainingLifeYears(state: StarState): number;
  processDescriptionId(state: StarState): string; // i18n key suffix
}
```

`createInitialState`:
1. Clamp M и Z к допустимым диапазонам.
2. Стадия: `protostar` с age=0 **или** сразу ZAMS preview — зафиксируй: **стартовый preview = ZAMS** (`main_sequence`, `stageProgress=0`, age=0), а короткая фаза `protostar` проигрывается только если пользователь включил play с самого начала и `INCLUDE_PROTOSTAR_PHASE=true` (default **true**, длительность из Appendix A, мала относительно MS).
3. Параметры ZAMS из `main-sequence.ts`.
4. Composition = primordial(Z).
5. `remainingLifeYears` ≈ полное время жизни до remnant.
6. `isTerminal=false`, `remnantKind='none'`.

`step(state, dtYears)`:
1. Если `isTerminal` — верни state без изменений.
2. Примени mass-loss за `dtYears`.
3. Обнови composition через fuel-burning.
4. Обнови stage через stage-machine (может потребить часть progress).
5. Пересчитай L, R, Teff, spectral class, zone layout, pulsation.
6. `ageYears += dtYears`.
7. Пересчитай `remainingLifeYears`.
8. Если достигнут terminal — выстави flags.

---

## 4.3 Главная последовательность — scaling

Реализуй `luminositySolarFromMass(massSolar: number): number` кусочно (см. appendix B):

| Диапазон \(M/M_\odot\) | Закон |
|------------------------|--------|
| \(0.08 \le M < 0.43\) | \(L \propto M^{2.3}\) |
| \(0.43 \le M < 2\) | \(L \propto M^{4}\) |
| \(2 \le M < 20\) | \(L \propto M^{3.5}\) |
| \(M \ge 20\) | \(L \propto M^{3}\) |

Нормировка: при \(M=1\) → \(L=1\) в среднем сегменте (согласуй стыки непрерывности — допустима C0 непрерывность на границах через локальные коэффициенты).

Радиус MS (аппроксимация):

\[
R/R_\odot \approx M^{0.8} \quad (M \lesssim 1),\quad
R/R_\odot \approx M^{0.6} \quad (M \gtrsim 1)
\]

Металличность: слабо сдвигать Teff/L:

\[
L(Z) = L_0 \cdot \left(\frac{Z}{Z_\odot}\right)^{k_L},\quad k_L \approx -0.1
\]

(не взрывай при Z→0: clamp \(Z_{\mathrm{eff}} \ge Z_{\min}\)).

\(T_{\mathrm{eff}}\) **канонически** из Stefan–Boltzmann в солнечных единицах:

\[
\frac{L}{L_\odot} = \left(\frac{R}{R_\odot}\right)^2 \left(\frac{T_{\mathrm{eff}}}{T_{\odot}}\right)^4
\]

\[
T_{\mathrm{eff}} = T_{\odot} \left(\frac{L/L_\odot}{(R/R_\odot)^2}\right)^{1/4}
\]

Функции:
- `teffFromLR(luminositySolar, radiusSolar): number`
- `luminosityFromRT(radiusSolar, teffK): number` (для проверок)

---

## 4.4 Время жизни и прогресс стадий

Главная последовательность:

\[
\tau_{\mathrm{MS}} \approx 10^{10}\,\mathrm{yr} \cdot \frac{M/M_\odot}{L/L_\odot}
\]

Длительности пост-MS фаз — доли от \(\tau_{\mathrm{MS}}\) или абсолютные таблицы из Appendix A (обязательно используй таблицу; не оставляй все пост-MS по 1% без ветвления по массе).

`stageProgress` увеличивается как `dt / stageDuration`. При `stageProgress >= 1` — переход.

---

## 4.5 Машинa стадий (ветвление по массе)

Пусть \(M_0\) = `initialMassSolar` (ветвление по **начальной** массе, кроме случаев, где текущая масса критична для remnant).

### Низкие массы \(M_0 < 0.8\)
`protostar → main_sequence → (optional short subgiant) → red_giant → planetary_nebula → white_dwarf`

Для \(M_0 \lesssim 0.25\) можно упростить: очень долгая MS; гигант слабо выражен; всё равно дойди до WD за симулируемое время с огромным adaptive dt на MS.

### Солнечные \(0.8 \le M_0 < 8\)
`protostar → MS → subgiant → red_giant → horizontal_branch → agb → planetary_nebula → white_dwarf`

### Массивные \(8 \le M_0 < 25\)
`protostar → MS → subgiant → supergiant → supernova → neutron_star`  
(если core mass после loss > OV → BH — см. remnant)

### Очень массивные \(M_0 \ge 25\)
`protostar → MS → (brief) → supergiant → supernova → black_hole`  
(или прямой коллапс; visually всё равно `supernova` flash + BH)

Точные пороги — Appendix A (`MASS_GIANT_BRANCH_MAX`, `MASS_SN_MIN`, `MASS_BH_DIRECT_MIN`).

На стадии `red_giant` / `supergiant` / `agb`:
- \(R\) растёт (×10…×1000 в зависимости от массы),
- \(T_{\mathrm{eff}}\) падает в область K–M,
- \(L\) растёт.

На `white_dwarf`:
- \(R\) мал (~Earth), \(T_{\mathrm{eff}}\) высок initially, \(L\) падает со временем остывания (можно медленный cooling law).

На `neutron_star` / `black_hole`:
- фиксированные «маркерные» параметры для HR (NS: высокая T, низкая L; BH: увести точку за пределы / специальный маркер вне шкалы — **предпочтительно** оставить последнюю pre-SN точку и показать remnant badge в UI, а на HR поставить символ в области компактных объектов).

---

## 4.6 Горение топлива

`fuel-burning.ts` обновляет `CoreComposition` и `BurningMode`:

| Стадия / условие | BurningMode | Эффект на состав |
|------------------|-------------|------------------|
| MS, \(M\lesssim1.3\) | `pp_chain` | H↓ He↑ |
| MS, \(M\gtrsim1.3\) | `cno_cycle` | H↓ He↑ быстрее |
| HB / He core | `triple_alpha` | He↓ C/O↑ |
| massive advanced | `carbon_burning` → `neon_burning` → `oxygen_burning` → `silicon_burning` | C/O↓ … Fe↑ |
| iron core | `iron_core` | Fe доминирует; переход к SN |
| WD cooling | `degenerate_cooling` | состав почти заморожен |

Скорость выгорания масштабируй так, чтобы к концу соответствующей стадии доля топлива падала правдоподобно (H_core → ~0.05 на конце MS). Псевдокод в appendix B.

Доминирующий элемент для UI:

```ts
function dominantCoreElement(c: CoreComposition): CoreZoneLayout['dominantCoreElementLabel']
```

---

## 4.7 Потери массы (звёздный ветер)

На гигантских/сверхгигантских стадиях:

\[
\dot{M} = -k_{\mathrm{wind}}(M, L, stage) \quad [M_\odot/\mathrm{yr}]
\]

Используй простую параметризацию из Appendix A (Reimers-like для гигантов, усиленный для WR/supergiant). На каждом шаге:

```
massSolar = max(MIN_MASS_CLAMP, massSolar + Mdot * dtYears)
```

Для низких масс на MS \(\dot{M}\approx 0\).

---

## 4.8 Остатки: Chandra и OV

`remnant.ts`:

```ts
export function selectRemnant(initialMassSolar: number, finalCoreMassSolar: number): RemnantKind {
  // 1) Если initialMass < MASS_SN_MIN → white_dwarf (core mass обычно < Chandra)
  // 2) Иначе если finalCoreMass <= CHANDRASEKHAR_LIMIT_MSUN → white_dwarf (редко для SN path — не используй для SN)
  // 3) SN path: if finalCoreMass <= OPPENHEIMER_VOLKOFF_LIMIT_MSUN → neutron_star else black_hole
}
```

Рабочее правило симуляции (зафиксируй):

| \(M_0 / M_\odot\) | Remnant |
|-------------------|---------|
| \(< 8\) | `white_dwarf` |
| \(8 \le M_0 < 25\) | `neutron_star` (если после wind core ≤ OV; иначе BH) |
| \(\ge 25\) | `black_hole` |

`finalCoreMassSolar` оценивай как долю текущей массы на pre-SN (например 0.2–0.4 \(M\)) — формула в appendix B. Главное: порог OV реально влияет на ветку NS vs BH в диапазоне 8–25.

---

## 4.9 Адаптивный шаг времени

`adaptive-dt.ts`:

```ts
export function computeAdaptiveDtYears(state: StarState, timeAccel: number): number
```

Идея: базовый `dt` пропорционален характерному времени текущей стадии, уменьшается при больших относительных изменениях параметров.

Практическое правило (обязательное):

1. `base = stageDurationYears(state) * BASE_DT_FRACTION` (например 0.002).
2. Оцени `rate = max(|dL/L|, |dR/R|, |dT/T|)` из прошлого шага **или** proxy: `f(stage)` (MS медленный, SN быстрый).
3. `dt = clamp(base / (1 + RATE_GAIN * rateProxy), DT_MIN_YEARS, DT_MAX_YEARS)`.
4. Умножь на `timeAccel`.
5. На `supernova`: `dt` очень мал (секунды…дни в годах → крошечное число), но UI ускоряет flash за несколько кадров через отдельный `SN_FLASH_FRAMES` — допускается специальная ветка.
6. На MS солнечной звезды: `dt` порядка \(10^5…10^7\) лет × accel, чтобы эволюция была наблюдаема за минуты реального времени.

`SimulationClockService` каждый кадр:

```
if (!playing) return;
dt = computeAdaptiveDtYears(star, timeAccel);
next = physics.step(star, dt);
starStore.apply(next);
maybeAppendTrack(next);
if (next.isTerminal) simulationStore.markTerminal();
```

---

## 4.10 Zone layout

Зависимость от массы (упрощённо):

| Масса | Структура |
|-------|-----------|
| \(M \lesssim 0.3\) | почти полностью конвективная |
| \(0.3 < M \lesssim 1.2\) | radiative core + convective envelope (Солнце-like) |
| \(M \gtrsim 1.2\) | convective core + radiative envelope |

Фракции — константы Appendix A; на гигантах оболочка огромна (convective envelope fraction ↑).

---

## 4.11 Пульсация

`pulsationAmplitude`:
- `0` на спокойной MS;
- `0.15–0.35` на `red_giant` / `agb` / Cepheid-like (можно привязать к `supergiant` и части `horizontal_branch`);
- пик на `supernova` flash.

Canvas использует значение для radius wobble (см. 05).

---

## 4.12 Описание процессов

`process-description.ts` возвращает id, например:
- `process.ms_pp`
- `process.ms_cno`
- `process.he_burning`
- `process.rg_expansion`
- `process.sn_core_collapse`
- `process.pn_ejection`
- `process.wd_cooling`
- `process.ns_formed`
- `process.bh_formed`

Полный список ключей — в i18n (07). UI показывает `t(id)`.

---

## 4.13 Запрещено в физике

- Случайный noise как единственный двигатель трека.
- Одинаковый трек для 0.2 и 25 \(M_\odot\).
- Игнор металличности (хотя бы слабый эффект на L/Teff обязателен).
- Terminal без выставления `remnantKind`.
- `dt` константа на все стадии без adaptive.
