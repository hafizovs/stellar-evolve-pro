# Appendix B — Formulas & Algorithms

Справочник формул. Реализации — в `domain/stellar/**` и `domain/hr/**` согласно [04-physics-engine.md](04-physics-engine.md).

---

## B.1 Обозначения

| Symbol | Meaning | Unit |
|--------|---------|------|
| \(M\) | mass | \(M_\odot\) |
| \(R\) | radius | \(R_\odot\) |
| \(L\) | luminosity | \(L_\odot\) |
| \(T_{\mathrm{eff}}\) | effective temperature | K |
| \(Z\) | metallicity | mass fraction |
| \(t\) | age | yr |
| \(\mathrm{d}t\) | simulation step | yr |
| \(p\) | stage progress | 0..1 |
| \(\sigma\) | Stefan–Boltzmann constant | W m⁻² K⁻⁴ |

---

## B.2 Mass–luminosity (piecewise)

Пусть \(m = M/M_\odot\).

\[
L/L_\odot =
\begin{cases}
k_1\, m^{2.3}, & 0.08 \le m < 0.43 \\
k_2\, m^{4}, & 0.43 \le m < 2 \\
k_3\, m^{3.5}, & 2 \le m < 20 \\
k_4\, m^{3}, & m \ge 20
\end{cases}
\]

Выбери \(k_i\) для **C0-стыков** и \(L(1)=1\):

1. В среднем сегменте вокруг Солнца удобно использовать \(L=m^{4}\) на \(0.43…2\) с \(k_2=1\) → \(L(1)=1\).
2. На границе \(m=0.43\): \(k_1 = (0.43)^{4} / (0.43)^{2.3}\).
3. На \(m=2\): \(k_3 = 2^{4} / 2^{3.5}\).
4. На \(m=20\): \(k_4 = k_3\cdot 20^{3.5} / 20^{3}\).

Реализуй это явно в коде (не оставляй magические 1.0 везде).

Металличность:

\[
L(Z) = L(m)\cdot\left(\frac{\max(Z,Z_{\min})}{Z_\odot}\right)^{-0.1}
\]

---

## B.3 Mass–radius (ZAMS)

\[
R/R_\odot =
\begin{cases}
m^{0.8}, & m \le 1 \\
m^{0.57}, & m > 1
\end{cases}
\]

(Показатель 0.57 ≈ типичный mid/high; допустим 0.6.)

---

## B.4 Stefan–Boltzmann (solar units)

\[
\frac{L}{L_\odot} = \left(\frac{R}{R_\odot}\right)^{2}\left(\frac{T_{\mathrm{eff}}}{T_{\odot}}\right)^{4}
\]

\[
T_{\mathrm{eff}} = T_{\odot}\left(\frac{L/L_\odot}{(R/R_\odot)^{2}}\right)^{1/4}
\]

с \(T_{\odot}=5772\,\mathrm{K}\).

Защита: если \(R\le0\) или \(L\le0\) — clamp к минимумам (`R_MIN=1e-6`, `L_MIN=1e-8`) перед корнем.

Round-trip test:

```
T = teffFromLR(L, R)
L2 = (R^2) * (T/Tsun)^4
|L2 - L| / max(L,eps) < 1e-6
```

---

## B.5 Main-sequence lifetime

\[
\tau_{\mathrm{MS}} = 10^{10}\,\mathrm{yr}\cdot\frac{m}{L(m,Z)/L_\odot}
\]

Оценка оставшейся жизни на MS:

\[
t_{\mathrm{rem,MS}} = \tau_{\mathrm{MS}}\cdot(1-p_{\mathrm{MS}})
\]

Полная remaining life = сумма оставшихся фаз по таблице Appendix A.

---

## B.6 Stage progress integration

```
duration = stageDurationYears(state)
pNext = stageProgress + dtYears / duration
if pNext >= 1:
  state = transitionToNextStage(state)  // p=0, update burning, maybe remnant
else:
  stageProgress = pNext
  updateParamsForStage(state, stageProgress)
```

`updateParamsForStage` интерполирует R/L multipliers (Appendix A.5), затем пересчитывает Teff и spectral class.

Smoothstep:

\[
s(p) = p^{2}(3-2p)
\]

---

## B.7 Fuel burning (discrete)

На MS (`pp`/`cno`):

```
burnRate = (burningMode == 'cno_cycle' ? 1.4 : 1.0) * (dtYears / tauMS)
hydrogen = max(0.02, hydrogen - 0.65 * burnRate)
helium = helium + 0.65 * burnRate
normalize(composition)
```

На He-burning:

```
burn = dtYears / tauHe
helium = max(0.02, helium - 0.7 * burn)
carbonOxygen = carbonOxygen + 0.7 * burn
```

Advanced massive stages: последовательно снижай C/O и поднимай `other`→`iron` по мере stage chain.

Всегда:

```
sum = H+He+CO+Fe+other
scale each by 1/sum
```

---

## B.8 Mass loss

Reimers-like (solar units):

\[
\dot{M} = -2\times10^{-13}\,\eta\,\frac{(L/L_\odot)(R/R_\odot)}{M/M_\odot}\quad[M_\odot/\mathrm{yr}]
\]

\(\eta=1\) на RGB/AGB; \(\eta=5\) на supergiant.  
На шаге: \(M \leftarrow M + \dot{M}\,\mathrm{d}t\), затем clamp.

---

## B.9 Remnant decision tree

```
if initialMass < MASS_SN_MIN:
  return white_dwarf
core = CORE_MASS_FRACTION_PRE_SN * currentMass
if initialMass >= MASS_BH_DIRECT_MIN:
  return black_hole
if core <= OPPENHEIMER_VOLKOFF_LIMIT_MSUN:
  return neutron_star
return black_hole
```

Chandrasekhar: используй при формировании WD (убедись, что core mass estimate ≤ 1.4; если параметрическая модель даёт больше на low-mass path — clamp visual core к 1.4 и всё равно WD).

---

## B.10 Adaptive dt

```
base = stageDurationYears(state) * BASE_DT_FRACTION
rateProxy = RATE_BY_STAGE[state.stage]  // see Appendix A.9
dt = base / (1 + RATE_GAIN * rateProxy)
dt = clamp(dt, DT_MIN_YEARS, DT_MAX_YEARS)
dt *= timeAccel
return dt
```

Optional refinement using last step:

```
rel = max(|ΔL|/L, |ΔR|/R, |ΔT|/T)
dt /= (1 + RATE_GAIN * rel)
```

---

## B.11 HR coordinates

\[
x = w\cdot\frac{\log T_{\max}-\log T}{\log T_{\max}-\log T_{\min}}
\]

\[
y = h\cdot\frac{\log L_{\max}-\log L}{\log L_{\max}-\log L_{\min}}
\]

Внимание: для Y «вверх = ярче» в SVG обычно \(y_{\mathrm{svg}} = y_0 + y\) уже с инверсией max→top:

\[
y_{\mathrm{svg}} = y_{\mathrm{top}} + h\cdot\frac{\log L_{\max}-\log L}{\log L_{\max}-\log L_{\min}}
\]

Clamp \(T,L\) в `[min,max]` до логарифма.

---

## B.12 Track append predicate

```
if track empty OR stage changed: append
else:
  dLogT = |log10(T) - log10(Tprev)|
  dLogL = |log10(L) - log10(Lprev)|
  if dLogT >= TRACK_MIN_DELTA_LOG_T OR dLogL >= TRACK_MIN_DELTA_LOG_L:
    append
```

Rewind:

```
track = track.slice(0, index+1)
current = structuredClone(track[index].snapshot)
```

---

## B.13 Spectral class

```
if Teff >= 30000: O
else if Teff >= 10000: B
else if Teff >= 7500: A
else if Teff >= 6000: F
else if Teff >= 5200: G
else if Teff >= 3700: K
else: M
```

---

## B.14 Process description selection (examples)

| Condition | Id |
|-----------|-----|
| MS & M<1.3 | `process.ms_pp` |
| MS & M≥1.3 | `process.ms_cno` |
| subgiant | `process.subgiant` |
| red_giant / agb | `process.rg_expansion` |
| horizontal_branch / triple_alpha | `process.he_burning` |
| carbon..silicon | `process.advanced_burning` |
| iron_core / pre-SN | `process.iron_core` |
| supernova | `process.sn_core_collapse` |
| planetary_nebula | `process.pn_ejection` |
| white_dwarf | `process.wd_cooling` |
| neutron_star | `process.ns_formed` |
| black_hole | `process.bh_formed` |
| protostar | `process.protostar` |

---

## B.15 Численная устойчивость

1. Никаких `log(0)`; clamp positives.
2. Никаких делений на 0 в wind (`M>=MIN_MASS_CLAMP`).
3. Не допускай `NaN` в track; если step породил NaN — assert в dev и freeze previous state.
4. На terminal `step` = identity.
