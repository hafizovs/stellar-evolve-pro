export type ProcessDescriptionId =
  | 'process.protostar'
  | 'process.ms_pp'
  | 'process.ms_cno'
  | 'process.subgiant'
  | 'process.rg_expansion'
  | 'process.he_burning'
  | 'process.advanced_burning'
  | 'process.iron_core'
  | 'process.sn_core_collapse'
  | 'process.pn_ejection'
  | 'process.wd_cooling'
  | 'process.ns_formed'
  | 'process.bh_formed';

import { MASS_CNO_DOMINANT_MIN } from '../../core/constants/stellar.constants';
import { StarState } from '../../core/models/star-params.model';

export function processDescriptionId(state: StarState): ProcessDescriptionId {
  const { stage, params } = state;
  switch (stage) {
    case 'protostar':
      return 'process.protostar';
    case 'main_sequence':
      return params.massSolar >= MASS_CNO_DOMINANT_MIN ? 'process.ms_cno' : 'process.ms_pp';
    case 'subgiant':
      return 'process.subgiant';
    case 'red_giant':
    case 'agb':
      return 'process.rg_expansion';
    case 'horizontal_branch':
      return 'process.he_burning';
    case 'supergiant':
      if (state.burningMode === 'iron_core') {
        return 'process.iron_core';
      }
      return 'process.advanced_burning';
    case 'supernova':
      return 'process.sn_core_collapse';
    case 'planetary_nebula':
      return 'process.pn_ejection';
    case 'white_dwarf':
      return 'process.wd_cooling';
    case 'neutron_star':
      return 'process.ns_formed';
    case 'black_hole':
      return 'process.bh_formed';
    default:
      return 'process.protostar';
  }
}
