export const MASS_MIN_MSUN = 0.08;
export const MASS_MAX_MSUN = 150;
export const Z_MIN = 0.0001;
export const Z_MAX = 0.04;
export const DEFAULT_MASS_MSUN = 1;
export const DEFAULT_METALLICITY = 0.02;

export const MASS_FULLY_CONVECTIVE_MAX = 0.3;
export const MASS_SOLAR_LIKE_MAX = 1.2;
export const MASS_CNO_DOMINANT_MIN = 1.3;
export const MASS_LOW_PATH_MAX = 0.8;
export const MASS_INTERMEDIATE_MAX = 8.0;
export const MASS_SN_MIN = 8.0;
export const MASS_BH_DIRECT_MIN = 25.0;
export const CORE_MASS_FRACTION_PRE_SN = 0.3;

export const MIN_MASS_CLAMP_MSUN = 0.05;

export const INCLUDE_PROTOSTAR_PHASE = true;

export const SN_VISUAL_YEARS = 1e-6;

export const METALLICITY_L_EXPONENT = -0.1;

export const MASS_PRESETS = [
  { id: 'red_dwarf' as const, massSolar: 0.2, metallicity: 0.02, labelKey: 'preset.red_dwarf' },
  { id: 'sun' as const, massSolar: 1.0, metallicity: 0.02, labelKey: 'preset.sun' },
  { id: 'massive' as const, massSolar: 8.0, metallicity: 0.02, labelKey: 'preset.massive' },
  { id: 'supermassive' as const, massSolar: 25.0, metallicity: 0.02, labelKey: 'preset.supermassive' },
] as const;

export const RATE_BY_STAGE: Readonly<Record<string, number>> = {
  protostar: 0.05,
  main_sequence: 0.02,
  subgiant: 0.2,
  red_giant: 0.5,
  supergiant: 0.5,
  horizontal_branch: 0.3,
  agb: 0.5,
  planetary_nebula: 2,
  supernova: 50,
  white_dwarf: 0.01,
  neutron_star: 0,
  black_hole: 0,
};
