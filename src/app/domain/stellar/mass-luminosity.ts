import { SOLAR_METALLICITY_Z } from '../../core/constants/astronomy.constants';
import { METALLICITY_L_EXPONENT, Z_MIN } from '../../core/constants/stellar.constants';

const K1 = Math.pow(0.43, 4) / Math.pow(0.43, 2.3);
const K2 = 1;
const K3 = Math.pow(2, 4) / Math.pow(2, 3.5);
const K4 = (K3 * Math.pow(20, 3.5)) / Math.pow(20, 3);

export function luminositySolarFromMassRaw(massSolar: number): number {
  const m = Math.max(massSolar, 0.08);
  if (m < 0.43) {
    return K1 * Math.pow(m, 2.3);
  }
  if (m < 2) {
    return K2 * Math.pow(m, 4);
  }
  if (m < 20) {
    return K3 * Math.pow(m, 3.5);
  }
  return K4 * Math.pow(m, 3);
}

export function applyMetallicityToLuminosity(luminositySolar: number, metallicity: number): number {
  const zEff = Math.max(metallicity, Z_MIN);
  return luminositySolar * Math.pow(zEff / SOLAR_METALLICITY_Z, METALLICITY_L_EXPONENT);
}

export function luminositySolarFromMass(massSolar: number, metallicity: number = SOLAR_METALLICITY_Z): number {
  return applyMetallicityToLuminosity(luminositySolarFromMassRaw(massSolar), metallicity);
}
