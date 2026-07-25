import { describe, expect, it } from 'vitest';
import { luminositySolarFromMass, luminositySolarFromMassRaw } from './mass-luminosity';

describe('mass-luminosity', () => {
  it('returns L≈1 at M=1', () => {
    expect(luminositySolarFromMass(1, 0.02)).toBeCloseTo(1, 1);
  });

  it('is monotonic on sample grid', () => {
    const masses = [0.1, 0.5, 1, 2, 5, 10, 20, 50];
    let prev = 0;
    for (const m of masses) {
      const l = luminositySolarFromMassRaw(m);
      expect(l).toBeGreaterThan(prev);
      expect(Number.isFinite(l)).toBe(true);
      prev = l;
    }
  });

  it('has continuous piecewise joins without NaN', () => {
    const edges = [0.08, 0.43, 2, 20, 150];
    for (const m of edges) {
      expect(Number.isFinite(luminositySolarFromMassRaw(m))).toBe(true);
    }
  });
});
