import { describe, expect, it } from 'vitest';
import { spectralClassFromTeff } from './spectral-class';

describe('spectral-class', () => {
  it('maps 5772K to G', () => {
    expect(spectralClassFromTeff(5772)).toBe('G');
  });

  it('maps 40000K to O', () => {
    expect(spectralClassFromTeff(40000)).toBe('O');
  });

  it('maps 3000K to M', () => {
    expect(spectralClassFromTeff(3000)).toBe('M');
  });
});
