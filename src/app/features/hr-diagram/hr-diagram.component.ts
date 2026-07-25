import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  HR_HIT_PX,
  HR_LUM_MAX,
  HR_LUM_MIN,
  HR_PADDING_BOTTOM,
  HR_PADDING_LEFT,
  HR_PADDING_RIGHT,
  HR_PADDING_TOP,
  HR_TEFF_MAX,
  HR_TEFF_MIN,
  SPECTRAL_CLASS_MARKS,
} from '../../core/constants/hr.constants';
import {
  giantsRegionPath,
  mainSequencePolyline,
  whiteDwarfRegionPath,
} from '../../domain/hr/hr-static-regions';
import { findNearestTrackIndex, trackPolyline } from '../../domain/hr/hr-track';
import { spectralClassColor } from '../../domain/stellar/spectral-class';
import { I18nService } from '../../services/i18n.service';
import { SimulationStore } from '../../state/simulation.store';
import { StarStore } from '../../state/star.store';
import { UiStore } from '../../state/ui.store';
import { computePlotRect, mapStateToSvg, mapTrackPointToSvg } from './hr-diagram.mapper';

@Component({
  selector: 'sep-hr-diagram',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hr-diagram.component.html',
  styleUrl: './hr-diagram.component.scss',
})
export class HrDiagramComponent {
  private readonly star = inject(StarStore);
  private readonly simulation = inject(SimulationStore);
  private readonly ui = inject(UiStore);
  private readonly i18n = inject(I18nService);

  readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  readonly svgWidth = signal(640);
  readonly svgHeight = signal(480);

  readonly track = this.star.track;
  readonly current = this.star.current;
  readonly phase = this.simulation.phase;

  readonly plot = computed(() =>
    computePlotRect(this.svgWidth(), this.svgHeight(), {
      left: HR_PADDING_LEFT,
      right: HR_PADDING_RIGHT,
      top: HR_PADDING_TOP,
      bottom: HR_PADDING_BOTTOM,
    }),
  );

  readonly viewBox = computed(() => `0 0 ${this.svgWidth()} ${this.svgHeight()}`);

  readonly msPath = computed(() => mainSequencePolyline(this.plot()));
  readonly giantsPath = computed(() => giantsRegionPath(this.plot()));
  readonly wdPath = computed(() => whiteDwarfRegionPath(this.plot()));

  readonly trackPath = computed(() =>
    trackPolyline(this.track(), (pt) => mapTrackPointToSvg(pt, this.plot())),
  );

  readonly markerPos = computed(() => {
    const s = this.current();
    return mapStateToSvg(s.params.teffK, s.params.luminositySolar, this.plot());
  });

  readonly markerColor = computed(() => spectralClassColor(this.current().params.teffK));

  readonly gridLinesTeff = computed(() => {
    const temps = [40000, 20000, 10000, 6000, 4000, 3000, 2000];
    const plot = this.plot();
    const logMax = Math.log10(HR_TEFF_MAX);
    const logMin = Math.log10(HR_TEFF_MIN);
    return temps.map((t) => {
      const x = plot.x + plot.width * ((logMax - Math.log10(t)) / (logMax - logMin));
      return { x, label: t >= 1000 ? `${Math.round(t / 1000)}k` : String(t) };
    });
  });

  readonly gridLinesLum = computed(() => {
    const lums = [1e6, 1e4, 1e2, 1, 1e-2, 1e-4];
    const plot = this.plot();
    const logMax = Math.log10(HR_LUM_MAX);
    const logMin = Math.log10(HR_LUM_MIN);
    return lums.map((l) => {
      const y = plot.y + plot.height * ((logMax - Math.log10(l)) / (logMax - logMin));
      return { y, label: l >= 1 ? String(l) : l.toExponential(0) };
    });
  });

  readonly spectralMarks = SPECTRAL_CLASS_MARKS;

  constructor() {
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            this.svgWidth.set(Math.floor(width));
            this.svgHeight.set(Math.floor(height));
          }
        }
      });
      setTimeout(() => {
        const el = this.svgRef()?.nativeElement?.parentElement;
        if (el) {
          observer.observe(el);
        }
      });
    }
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  onSvgClick(event: MouseEvent): void {
    const svg = this.svgRef()?.nativeElement;
    if (!svg) {
      return;
    }
    const rect = svg.getBoundingClientRect();
    const scaleX = this.svgWidth() / rect.width;
    const scaleY = this.svgHeight() / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const idx = findNearestTrackIndex(
      this.track(),
      x,
      y,
      (pt) => mapTrackPointToSvg(pt, this.plot()),
      HR_HIT_PX,
    );
    if (idx !== null) {
      this.simulation.pause();
      this.star.rewindToIndex(idx);
      this.ui.setSelectedTrackIndex(idx);
      this.simulation.markRewound();
    }
  }

  spectralX(teffK: number): number {
    const plot = this.plot();
    const logMax = Math.log10(HR_TEFF_MAX);
    const logMin = Math.log10(HR_TEFF_MIN);
    return plot.x + plot.width * ((logMax - Math.log10(teffK)) / (logMax - logMin));
  }
}
