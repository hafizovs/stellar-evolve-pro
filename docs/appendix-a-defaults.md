# Appendix A — Defaults, Thresholds & Tables

Справочник чисел. Реализации копируют значения в `core/constants/*.ts`. Не «улучшай» пороги без причины: образовательная согласованность важнее микроподгонки.

---

## A.1 Диапазоны входа

| Symbol | Constant | Value |
|--------|----------|-------|
| \(M_{\min}\) | `MASS_MIN_MSUN` | `0.08` |
| \(M_{\max}\) | `MASS_MAX_MSUN` | `150` |
| \(Z_{\min}\) | `Z_MIN` | `0.0001` |
| \(Z_{\max}\) | `Z_MAX` | `0.04` |
| \(Z_\odot\) | `SOLAR_METALLICITY_Z` | `0.02` |
| Default M | `DEFAULT_MASS_MSUN` | `1` |
| Default Z | `DEFAULT_METALLICITY` | `0.02` |

---

## A.2 Пресеты

| Id | Mass | Z |
|----|------|---|
| `red_dwarf` | 0.20 | 0.02 |
| `sun` | 1.00 | 0.02 |
| `massive` | 8.00 | 0.02 |
| `supermassive` | 25.0 | 0.02 |

---

## A.3 Пороги ветвления эволюции

| Constant | Value | Meaning |
|----------|-------|---------|
| `MASS_FULLY_CONVECTIVE_MAX` | 0.30 | fully convective structure |
| `MASS_SOLAR_LIKE_MAX` | 1.20 | radiative core + convective envelope |
| `MASS_CNO_DOMINANT_MIN` | 1.30 | CNO vs pp on MS |
| `MASS_LOW_PATH_MAX` | 0.80 | simplified low-mass path |
| `MASS_INTERMEDIATE_MAX` | 8.00 | below SN core-collapse |
| `MASS_SN_MIN` | 8.00 | core-collapse SN path |
| `MASS_BH_DIRECT_MIN` | 25.0 | prefer BH remnant |
| `CHANDRASEKHAR_LIMIT_MSUN` | 1.40 | WD limit |
| `OPPENHEIMER_VOLKOFF_LIMIT_MSUN` | 2.50 | NS max (рабочее) |
| `CORE_MASS_FRACTION_PRE_SN` | 0.30 | estimate final core mass ≈ fraction * current mass |

---

## A.4 Длительности фаз (аппроксимации)

База MS:

\[
\tau_{\mathrm{MS}} = 1.0\times 10^{10}\,\mathrm{yr}\cdot \frac{M}{L(M)}
\]

где \(L(M)\) — из mass-luminosity в солнечных единицах.

| Stage | Duration rule |
|-------|----------------|
| `protostar` | \(\min(5\times10^5\,\mathrm{yr},\ 0.01\cdot\tau_{\mathrm{MS}})\) for \(M\ge0.5\); longer for VLM (up to \(10^7\) yr clamp display) |
| `main_sequence` | \(\tau_{\mathrm{MS}}\) |
| `subgiant` | \(0.05\cdot\tau_{\mathrm{MS}}\) (clamp 1e6…2e8 yr for mid masses) |
| `red_giant` | \(0.10\cdot\tau_{\mathrm{MS}}\) for \(M<8\) |
| `horizontal_branch` | \(0.01\cdot\tau_{\mathrm{MS}}\) (order \(10^8\) yr near 1 M☉) |
| `agb` | \(0.01\cdot\tau_{\mathrm{MS}}\) |
| `planetary_nebula` | \(1\times10^4\) yr (visual phase) |
| `supergiant` | \(0.05\cdot\tau_{\mathrm{MS}}\) for massive (short) |
| `supernova` | treat as flash: effective `SN_VISUAL_YEARS = 1e-6` (или frame-based) |
| remnant cooling | open-ended; clock stops (`terminal`) after entering remnant |

Генератор может слегка сгладить clamp'ы, но порядки обязаны сохраняться: MS ≫ post-MS ≫ PN/SN.

---

## A.5 Radius / luminosity multipliers by stage (relative to ZAMS)

Применяй как функции `stageProgress` \(p\in[0,1]\) (lerp/smoothstep):

### Solar-like (\(0.8\le M < 8\))

| Stage | R factor | L factor | Teff trend |
|-------|----------|----------|------------|
| subgiant | 1 → 3 | 1 → 3 | down |
| red_giant | 3 → 100 | 3 → 50 | down to ~3500–4500 K |
| horizontal_branch | ~10 | ~50 | up vs RGB tip |
| agb | 50 → 200 | 50 → 100 | cool |
| planetary_nebula | envelope dump visual; core → WD track | high then drop | hot |
| white_dwarf | ~0.01 | cooling 0.1 → 0.001 | hot → cooler |

### Massive (\(M\ge8\))

| Stage | R factor | L factor |
|-------|----------|----------|
| supergiant | 20 → 500 | 1e4 → 1e5+ (from MS already high) |
| supernova | flash scale ×2…×5 visual | spike |
| NS marker | ~1e-5 R☉ equiv visual clamp | low |
| BH marker | special visual | n/a |

Конкретные функции — в `stage-machine` / `star-step`; таблица задаёт цели.

---

## A.6 Спектральные классы (Teff boundaries)

| Class | Teff min (K) | Teff max (K) | Color hex |
|-------|--------------|--------------|-----------|
| O | 30000 | 52000 | `#9bb0ff` |
| B | 10000 | 30000 | `#aabfff` |
| A | 7500 | 10000 | `#cad7ff` |
| F | 6000 | 7500 | `#f8f7ff` |
| G | 5200 | 6000 | `#fff4ea` |
| K | 3700 | 5200 | `#ffd2a1` |
| M | 2400 | 3700 | `#ffb56a` |

Mapping: pick class where `teffMin <= Teff < teffMax` (O: `>=30000`).

---

## A.7 Zone fractions (ZAMS defaults)

| Mass range | coreOuter | radiativeOuter | convectiveIsEnvelope |
|------------|-----------|----------------|----------------------|
| \(M\le0.30\) | 0.05 | 0.05 | false (almost all convective; treat radiative thin) |
| \(0.30<M\le1.20\) | 0.25 | 0.70 | true |
| \(M>1.20\) | 0.30 | 0.95 | false (convective core: set layout accordingly) |

Для convective-core звезд: core = convective; envelope = radiative. `CoreZoneLayout` обязан это выразить (см. 03) — можно расширить поля, но UI легенда должна быть правдивой.

На RGB: `coreOuterFraction` уменьшается относительно полного радиуса (оболочка доминирует): e.g. coreOuter=0.05, radiativeOuter=0.15, envelope convective.

---

## A.8 Mass loss

| Context | `MDOT_MSUN_PER_YR` scale |
|---------|--------------------------|
| MS low/mid | `0` |
| MS massive \(M>15\) | `1e-8 * (M/15) * (L/1e4)` |
| RGB/AGB | Reimers-like: `2e-13 * (L R / M)` (L,R,M solar units) |
| Supergiant | `5×` Reimers or `1e-6` clamp max |

`MIN_MASS_CLAMP_MSUN = 0.05` (не уходи в ноль).

---

## A.9 Adaptive time & track

| Constant | Value |
|----------|-------|
| `BASE_DT_FRACTION` | `0.002` |
| `DT_MIN_YEARS` | `1e-8` |
| `DT_MAX_YEARS` | `5e7` |
| `RATE_GAIN` | `25` |
| `TIME_ACCEL_MIN` | `0.25` |
| `TIME_ACCEL_MAX` | `64` |
| `TIME_ACCEL_DEFAULT` | `1` |
| `TRACK_MIN_DELTA_LOG_T` | `0.002` |
| `TRACK_MIN_DELTA_LOG_L` | `0.005` |
| `TRACK_MAX_POINTS` | `4000` (если больше — прореживай старые) |

Rate proxy examples: MS=`0.02`, subgiant=`0.2`, giant=`0.5`, SN=`50`.

---

## A.10 HR axis & render

| Constant | Value |
|----------|-------|
| `HR_TEFF_MAX` | 40000 |
| `HR_TEFF_MIN` | 2000 |
| `HR_LUM_MIN` | 1e-5 |
| `HR_LUM_MAX` | 1e6 |
| `HR_HIT_PX` | 12 |
| `RENDER_DPR_MAX` | 2 |
| `STARFIELD_COUNT` | 64 |
| `PULSE_OMEGA` | 2.2 |

---

## A.11 Fuel burn rates (fraction of stage)

К концу MS: `hydrogen` core → ≈ `0.05` (остаток), `helium` ≈ `0.90`, metals preserve Z buckets.  
К концу He-burning: `helium` → ≈ `0.05`, `carbonOxygen` доминирует.  
К Si-burning end: `iron` → ≥ `0.5` для massive.

Точные ODE не обязательны; линейный/экспоненциальный расход топлива от `stageProgress` допустим, если монотонен и стабилен численно.
