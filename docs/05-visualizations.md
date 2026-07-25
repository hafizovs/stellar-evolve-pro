# 05 — Visualizations (Stellar Canvas + HR SVG)

Документ обязателен. Два независимых визуализатора: **Canvas 2D** (звезда) и **SVG** (HR). Не подменяй HR canvas-графиком библиотек.

---

## 5.1 Stellar View — компонент

Файлы:
- `features/stellar-view/stellar-view.component.ts|html|scss`
- `stellar-canvas.renderer.ts`
- `stellar-core-section.renderer.ts`

### HTML skeleton

```html
<section class="sep-stellar-view" aria-label="...">
  <header>
    <h2>{{ t('stellar.title') }}</h2>
    <label>
      <input type="checkbox" [checked]="showCore()" (change)="toggleCore($event)" />
      {{ t('stellar.coreSection') }}
    </label>
  </header>
  <canvas #canvas></canvas>
  <p class="stage-badge">{{ t('stage.' + stage()) }}</p>
</section>
```

### Resize / DPR
1. `ResizeObserver` на host.
2. `canvas.width = clientWidth * dpr`, `height = clientHeight * dpr`, CSS size = client.
3. `dpr = min(devicePixelRatio, RENDER_DPR_MAX)` (2).
4. Очищай и перерисовывай при resize и при изменении star signals.

### Render loop
- Читай `starStore.current` и `ui.showCoreSection`.
- Для пульсации храни `pulsePhase` (рад), увеличивай в rAF: `phase += dtReal * PULSE_OMEGA * pulsationAmplitude`.
- Рисуй либо exterior, либо core section.

---

## 5.2 Exterior star rendering

`drawStarExterior(ctx, state, pulsePhase)`:

1. Фон: заливка `#05080f` + 40–80 точек-звёзд (детерминированный seed от размера canvas, не random каждый кадр).
2. Центр = середина canvas.
3. Базовый экранный радиус `rPx` от `log10(radiusSolar)` с clamp (min 18px, max 42% min(w,h)).
4. Пульсация: `r = rPx * (1 + 0.04 * pulsationAmplitude * sin(pulsePhase))`.
5. Цвет ядра/диска — из spectral class color (Appendix A).
6. Радиальный градиент: центр ярче, край темнее; для O/B — голубоватый, для M — глубокий оранжево-красный.
7. Корона / glow: 2–3 `shadowBlur` или дополнительных радиальных градиента с alpha (не purple).
8. На `supernova`: вспышка — белый/оранжевый bloom, `r` резко больше на несколько кадров.
9. На `black_hole`: тёмный диск + аккреционное кольцо (тонкий оранжевый torus gradient) — схематично.
10. На `white_dwarf` / `neutron_star`: маленький яркий диск + сильный glow, без огромной короны гиганта.
11. Label спектрального класса и \(T_{\mathrm{eff}}\) под звездой (mono, muted) — опционально, но рекомендуется.

**Запрещено:** накладывать плавающие badge-стикеры поверх короны вне контролов секции.

---

## 5.3 Core cross-section rendering

Когда `showCoreSection === true`:

1. Рисуй круг звезды как «разрезанный» диск.
2. Концентрические зоны по `zoneLayout` фракциям:
   - Core: цвет по dominant element (H cyan-tint, He yellow, C/O amber, Fe steel).
   - Radiative: полупрозрачный сине-серый.
   - Convective: крапчатый / штриховка (pattern или пунктирные ячейки).
3. Подписи зон на русском/английском через `t(...)` — рисуй текстом на canvas **или** HTML overlay legend рядом (HTML legend предпочтительнее для a11y).
4. В центре — короткая метка доминирующего элемента (`H`, `He`, `C/O`, `Fe`).
5. Сохраняй pulse слабо (амплитуда ×0.3), чтобы разрез не «дышал» слишком сильно.

---

## 5.4 HR Diagram — компонент SVG

Файлы:
- `features/hr-diagram/hr-diagram.component.ts|html|scss`
- `hr-diagram.mapper.ts` (teff/L → x/y px)

### Оси (жёстко)

| Ось | Диапазон | Масштаб | Направление |
|-----|----------|---------|-------------|
| X = \(T_{\mathrm{eff}}\) | 40 000 K → 2 000 K | log10 | **инвертирована** (горячие слева) |
| Y = \(L/L_\odot\) | \(10^{-5}\) → \(10^{6}\) | log10 | вверх ярче |

Дополнительно под осью X (или над): метки спектральных классов O B A F G K M в типичных температурных колонках.

### SVG structure

```html
<svg [attr.viewBox]="viewBox" role="img" [attr.aria-label]="t('hr.aria')">
  <title>{{ t('hr.title') }}</title>
  <!-- plot area rect -->
  <!-- grid lines -->
  <!-- static MS band path -->
  <!-- giant region -->
  <!-- white dwarf region -->
  <!-- evolutionary track polyline -->
  <!-- current marker -->
  <!-- hit targets for track points (optional sampled) -->
  <!-- axis labels -->
</svg>
```

Padding plot area: left 56, right 20, top 20, bottom 48 (константы в `hr.constants.ts`).

### Mapper

```ts
export function teffToX(teffK: number, plotWidth: number): number;
export function lumToY(luminositySolar: number, plotHeight: number): number;
export function xyToPlot(teffK: number, lum: number, plot: PlotRect): { x: number; y: number };
```

Clamp входы в диапазон осей перед log.

### Статические области
Из `domain/hr/hr-static-regions.ts`:
1. **Main Sequence band** — полилиния/полоса по таблице ZAMS точек (массив масс 0.1…100) цветом `--sep-ms`, opacity 0.35.
2. **Giants region** — полупрозрачный blob справа сверху (низкий T, высокий L).
3. **White dwarfs region** — слева снизу (высокий T, низкий L).

Эти области **не** интерактивны; только ориентир.

### Эволюционный трек
- `track()` из store → points map to SVG coords.
- `<polyline>` или `<path>` stroke `--sep-accent`, width 2.
- Current marker: круг r=5 + кольцо; цвет по spectral class.
- Не добавляй точку, если \(\Delta\log T < TRACK_MIN_DELTA_LOG_T\) и \(\Delta\log L < TRACK_MIN_DELTA_LOG_L\) (Appendix A), **кроме** смены stage (смена stage всегда добавляет точку).

### Rewind click
1. На click по SVG вычисли ближайшую точку трека в plot coords (порог hit ≤ 12 CSS px).
2. Если найдена — `starStore.rewindToIndex(i)` + `simulationStore.pause()` + phase `rewound`.
3. Cursor `crosshair` над plot; hint в footer HR: `t('hr.rewindHint')`.
4. Hover nearest point — лёгкий preview ring (не обязателен полный tooltip).

### Resize
SVG `width/height = 100%`; пересчёт mapper от `clientWidth/Height` через ResizeObserver + signal `plotSize`.

---

## 5.5 Синхронизация с физикой

| Событие | Stellar View | HR |
|---------|--------------|-----|
| play step | перерисовка params | append/update track + marker |
| pause | freeze pulse optional | freeze |
| reset | ZAMS exterior | clear path, marker at start |
| rewind | snapshot exterior/core | truncate path to index |
| terminal | remnant look | marker at final / remnant region |

---

## 5.6 Производительность визуала

1. Не пересоздавай 10k SVG nodes: один path трека + один marker + ≤ 200 hit circles (если hit через circles) **или** математический nearest на click без hit circles.
2. Canvas: избегай `getImageData` каждый кадр.
3. Статические области HR можно кэшировать в `<g>` и не перестраивать без resize.

---

## 5.7 Screenshot scope

`ScreenshotService` снимает **только** canvas stellar-view. HR в PNG не обязан попадать (можно отдельную кнопку позже — не требуется). Имя файла: `stellar-evolve-pro-YYYYMMDD-HHmmss.png`.
