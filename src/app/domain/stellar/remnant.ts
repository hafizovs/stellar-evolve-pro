import {
  CHANDRASEKHAR_LIMIT_MSUN,
  OPPENHEIMER_VOLKOFF_LIMIT_MSUN,
} from '../../core/constants/astronomy.constants';
import {
  CORE_MASS_FRACTION_PRE_SN,
  MASS_BH_DIRECT_MIN,
  MASS_INTERMEDIATE_MAX,
  MASS_SN_MIN,
} from '../../core/constants/stellar.constants';
import { RemnantKind } from '../../core/models/remnant-kind.model';

export function estimateCoreMassSolar(currentMassSolar: number): number {
  return CORE_MASS_FRACTION_PRE_SN * currentMassSolar;
}

export function selectRemnant(initialMassSolar: number, finalCoreMassSolar: number): RemnantKind {
  if (initialMassSolar < MASS_SN_MIN) {
    return 'white_dwarf';
  }
  if (initialMassSolar >= MASS_BH_DIRECT_MIN) {
    return 'black_hole';
  }
  if (finalCoreMassSolar <= OPPENHEIMER_VOLKOFF_LIMIT_MSUN) {
    return 'neutron_star';
  }
  return 'black_hole';
}

export function clampWhiteDwarfCoreMass(coreMass: number): number {
  return Math.min(coreMass, CHANDRASEKHAR_LIMIT_MSUN);
}

export {
  CHANDRASEKHAR_LIMIT_MSUN,
  OPPENHEIMER_VOLKOFF_LIMIT_MSUN,
  MASS_SN_MIN,
  MASS_BH_DIRECT_MIN,
  MASS_INTERMEDIATE_MAX,
};
