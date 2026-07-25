export interface CoreComposition {
  hydrogen: number;
  helium: number;
  carbonOxygen: number;
  iron: number;
  other: number;
}

export function createPrimordialComposition(metallicityZ: number): CoreComposition {
  const z = Math.min(Math.max(metallicityZ, 0), 0.04);
  const hydrogen = Math.max(0, 0.7 - z * 0.5);
  const helium = Math.max(0, 1 - hydrogen - z);
  return {
    hydrogen,
    helium,
    carbonOxygen: z * 0.6,
    iron: z * 0.05,
    other: Math.max(0, 1 - hydrogen - helium - z * 0.65),
  };
}

export function normalizeComposition(composition: CoreComposition): CoreComposition {
  const sum =
    composition.hydrogen +
    composition.helium +
    composition.carbonOxygen +
    composition.iron +
    composition.other;
  if (sum <= 0) {
    return { hydrogen: 1, helium: 0, carbonOxygen: 0, iron: 0, other: 0 };
  }
  return {
    hydrogen: composition.hydrogen / sum,
    helium: composition.helium / sum,
    carbonOxygen: composition.carbonOxygen / sum,
    iron: composition.iron / sum,
    other: composition.other / sum,
  };
}
