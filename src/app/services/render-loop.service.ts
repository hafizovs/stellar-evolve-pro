import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RenderLoopService {
  private rafId: number | null = null;
  private callback: ((now: number, deltaMs: number) => void) | null = null;
  private lastNow = 0;

  start(callback: (now: number, deltaMs: number) => void): void {
    this.callback = callback;
    this.lastNow = performance.now();
    if (this.rafId !== null) {
      return;
    }
    const loop = (now: number): void => {
      const deltaMs = now - this.lastNow;
      this.lastNow = now;
      this.callback?.(now, deltaMs);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.callback = null;
  }

  now(): number {
    return performance.now();
  }
}
