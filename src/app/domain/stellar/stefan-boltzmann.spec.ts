import { describe, expect, it } from 'vitest';
import { luminosityFromRT, teffFromLR } from './stefan-boltzmann';
import { SOLAR_TEFF_K } from '../../core/constants/astronomy.constants';

describe('stefan-boltzmann', () => {
  it('returns Teff≈5772 for L=1,R=1', () => {
    expect(teffFromLR(1, 1)).toBeCloseTo(SOLAR_TEFF_K, 0);
  });

  it('roundtrips L within relative error', () => {
    const l = 100;
    const r = 10;
    const t = teffFromLR(l, r);
    const l2 = luminosityFromRT(r, t);
    expect(Math.abs(l2 - l) / l).toBeLessThan(1e-6);
  });
});
