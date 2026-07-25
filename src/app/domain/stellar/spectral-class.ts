import { SPECTRAL_CLASS_TABLE } from '../../core/models/spectral-class.model';
import { SpectralClass, SpectralClassInfo } from '../../core/models/spectral-class.model';

export function spectralClassFromTeff(teffK: number): SpectralClass {
  if (teffK >= 30000) {
    return 'O';
  }
  if (teffK >= 10000) {
    return 'B';
  }
  if (teffK >= 7500) {
    return 'A';
  }
  if (teffK >= 6000) {
    return 'F';
  }
  if (teffK >= 5200) {
    return 'G';
  }
  if (teffK >= 3700) {
    return 'K';
  }
  return 'M';
}

export function spectralClassInfoFromTeff(teffK: number): SpectralClassInfo {
  const cls = spectralClassFromTeff(teffK);
  return SPECTRAL_CLASS_TABLE.find((entry) => entry.spectralClass === cls) ?? SPECTRAL_CLASS_TABLE[6];
}

export function spectralClassColor(teffK: number): string {
  return spectralClassInfoFromTeff(teffK).colorHex;
}
