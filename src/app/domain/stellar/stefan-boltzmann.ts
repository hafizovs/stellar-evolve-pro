import { L_MIN_SOLAR, R_MIN_SOLAR, SOLAR_TEFF_K } from '../../core/constants/astronomy.constants';

export function teffFromLR(luminositySolar: number, radiusSolar: number): number {
  const l = Math.max(luminositySolar, L_MIN_SOLAR);
  const r = Math.max(radiusSolar, R_MIN_SOLAR);
  return SOLAR_TEFF_K * Math.pow(l / (r * r), 0.25);
}

export function luminosityFromRT(radiusSolar: number, teffK: number): number {
  const r = Math.max(radiusSolar, R_MIN_SOLAR);
  const t = Math.max(teffK, 1);
  return r * r * Math.pow(t / SOLAR_TEFF_K, 4);
}
