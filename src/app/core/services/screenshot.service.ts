import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScreenshotService {
  private canvas: HTMLCanvasElement | null = null;

  registerCanvas(canvas: HTMLCanvasElement | null): void {
    this.canvas = canvas;
  }

  /** Alias for docs API (`setCanvas`). */
  setCanvas(canvas: HTMLCanvasElement | null): void {
    this.registerCanvas(canvas);
  }

  capture(): void {
    if (!this.canvas) {
      return;
    }
    const url = this.canvas.toDataURL('image/png');
    const now = new Date();
    const pad = (n: number): string => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const anchor = document.createElement('a');
    anchor.download = `stellar-evolve-pro-${stamp}.png`;
    anchor.href = url;
    anchor.click();
    anchor.remove();
  }
}
