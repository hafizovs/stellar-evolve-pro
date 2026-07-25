import { luminositySolarFromMass } from './mass-luminosity';
import { teffFromLR } from './stefan-boltzmann';
import { spectralClassFromTeff } from './spectral-class';

export function zamsRadiusSolar(massSolar: number): number {
  const m = Math.max(massSolar, 0.08);
  if (m <= 1) {
    return Math.pow(m, 0.8);
  }
  return Math.pow(m, 0.57);
}

export function zamsLuminositySolar(massSolar: number, metallicity: number): number {
  return luminositySolarFromMass(massSolar, metallicity);
}

export function zamsTeffK(massSolar: number, metallicity: number): number {
  const l = zamsLuminositySolar(massSolar, metallicity);
  const r = zamsRadiusSolar(massSolar);
  return teffFromLR(l, r);
}

export function zamsCorePressurePa(massSolar: number): number {
  return 2.5e16 * Math.pow(massSolar, 2);
}

export function createZamsParams(massSolar: number, metallicity: number) {
  const radiusSolar = zamsRadiusSolar(massSolar);
  const luminositySolar = zamsLuminositySolar(massSolar, metallicity);
  const teffK = teffFromLR(luminositySolar, radiusSolar);
  return {
    massSolar,
    initialMassSolar: massSolar,
    metallicity,
    radiusSolar,
    luminositySolar,
    teffK,
    corePressurePa: zamsCorePressurePa(massSolar),
    spectralClass: spectralClassFromTeff(teffK),
  };
}
