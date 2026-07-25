import { describe, expect, it } from 'vitest';
import { estimateCoreMassSolar, selectRemnant } from './remnant';

describe('remnant', () => {
  it('selects white dwarf for solar mass', () => {
    expect(selectRemnant(1, estimateCoreMassSolar(1))).toBe('white_dwarf');
  });

  it('selects neutron star for 10 Msun with small core', () => {
    expect(selectRemnant(10, 2.0)).toBe('neutron_star');
  });

  it('selects black hole for 40 Msun', () => {
    expect(selectRemnant(40, estimateCoreMassSolar(40))).toBe('black_hole');
  });

  it('BH when core exceeds OV for intermediate mass', () => {
    expect(selectRemnant(12, 3.0)).toBe('black_hole');
  });
});
