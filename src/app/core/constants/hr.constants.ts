export const HR_TEFF_MAX = 40000;
export const HR_TEFF_MIN = 2000;
export const HR_LUM_MIN = 1e-5;
export const HR_LUM_MAX = 1e6;
export const HR_HIT_PX = 12;
export const HR_PADDING_LEFT = 56;
export const HR_PADDING_RIGHT = 20;
export const HR_PADDING_TOP = 20;
export const HR_PADDING_BOTTOM = 48;

export const SPECTRAL_CLASS_MARKS = [
  { cls: 'O', teffK: 35000 },
  { cls: 'B', teffK: 20000 },
  { cls: 'A', teffK: 8750 },
  { cls: 'F', teffK: 6750 },
  { cls: 'G', teffK: 5600 },
  { cls: 'K', teffK: 4450 },
  { cls: 'M', teffK: 3000 },
] as const;
