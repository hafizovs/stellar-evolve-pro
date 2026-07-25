export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

export interface SpectralClassInfo {
  readonly spectralClass: SpectralClass;
  readonly teffMinK: number;
  readonly teffMaxK: number;
  readonly colorHex: string;
}

export const SPECTRAL_CLASS_TABLE: readonly SpectralClassInfo[] = [
  { spectralClass: 'O', teffMinK: 30000, teffMaxK: 52000, colorHex: '#9bb0ff' },
  { spectralClass: 'B', teffMinK: 10000, teffMaxK: 30000, colorHex: '#aabfff' },
  { spectralClass: 'A', teffMinK: 7500, teffMaxK: 10000, colorHex: '#cad7ff' },
  { spectralClass: 'F', teffMinK: 6000, teffMaxK: 7500, colorHex: '#f8f7ff' },
  { spectralClass: 'G', teffMinK: 5200, teffMaxK: 6000, colorHex: '#fff4ea' },
  { spectralClass: 'K', teffMinK: 3700, teffMaxK: 5200, colorHex: '#ffd2a1' },
  { spectralClass: 'M', teffMinK: 2400, teffMaxK: 3700, colorHex: '#ffb56a' },
] as const;
