import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { PULSE_OMEGA, RENDER_DPR_MAX } from '../../core/constants/render.constants';
import { I18nService } from '../../core/services/i18n.service';
import { RenderLoopService } from '../../core/services/render-loop.service';
import { ScreenshotService } from '../../core/services/screenshot.service';
import { StarStore } from '../control-room/star.store';
import { UiStore } from '../../core/ui/ui.store';
import { createStarfieldCache, drawStarExterior } from './stellar-canvas.renderer';
import { drawCoreSection } from './stellar-core-section.renderer';

@Component({
  selector: 'sep-stellar-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stellar-view.component.html',
  styleUrl: './stellar-view.component.scss',
})
export class StellarViewComponent implements AfterViewInit {
  private readonly starStore = inject(StarStore);
  private readonly ui = inject(UiStore);
  private readonly i18n = inject(I18nService);
  private readonly screenshot = inject(ScreenshotService);
  private readonly renderLoop = inject(RenderLoopService);
  private readonly destroyRef = inject(DestroyRef);

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  readonly stage = this.starStore.stage;
  readonly showCore = this.ui.showCoreSection;

  private pulsePhase = 0;
  private starfield = createStarfieldCache(800, 600);
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      this.starStore.current();
      this.ui.showCoreSection();
      this.redraw();
    });
  }

  ngAfterViewInit(): void {
    const canvasEl = this.canvasRef()?.nativeElement;
    if (!canvasEl) {
      return;
    }
    this.screenshot.registerCanvas(canvasEl);
    this.setupResize(canvasEl);
    this.renderLoop.start((_now, deltaMs) => {
      this.pulsePhase += (deltaMs / 1000) * PULSE_OMEGA;
      this.redraw();
    });
    this.destroyRef.onDestroy(() => {
      this.renderLoop.stop();
      this.resizeObserver?.disconnect();
      this.screenshot.registerCanvas(null);
    });
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  toggleCore(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.ui.setShowCoreSection(checked);
  }

  private setupResize(canvas: HTMLCanvasElement): void {
    const host = canvas.parentElement;
    if (!host || typeof ResizeObserver === 'undefined') {
      return;
    }
    const apply = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, RENDER_DPR_MAX);
      const w = host.clientWidth;
      const h = host.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      this.starfield = createStarfieldCache(canvas.width, canvas.height);
      this.redraw();
    };
    apply();
    this.resizeObserver = new ResizeObserver(apply);
    this.resizeObserver.observe(host);
  }

  private redraw(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, RENDER_DPR_MAX);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const state = this.starStore.current();
    if (this.ui.showCoreSection()) {
      drawCoreSection(ctx, state, this.pulsePhase, {
        core: this.i18n.t('zones.core'),
        radiative: this.i18n.t('zones.radiative'),
        convective: this.i18n.t('zones.convective'),
        dominant: this.i18n.t('zones.dominant'),
      });
    } else {
      drawStarExterior(ctx, state, this.pulsePhase, this.starfield);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
