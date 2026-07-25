export type EvolutionStage =
  | 'protostar'
  | 'main_sequence'
  | 'subgiant'
  | 'red_giant'
  | 'supergiant'
  | 'horizontal_branch'
  | 'agb'
  | 'planetary_nebula'
  | 'supernova'
  | 'white_dwarf'
  | 'neutron_star'
  | 'black_hole';

export const EVOLUTION_STAGE_ORDER: readonly EvolutionStage[] = [
  'protostar',
  'main_sequence',
  'subgiant',
  'red_giant',
  'supergiant',
  'horizontal_branch',
  'agb',
  'planetary_nebula',
  'supernova',
  'white_dwarf',
  'neutron_star',
  'black_hole',
] as const;

export function isTerminalStage(stage: EvolutionStage): boolean {
  return stage === 'white_dwarf' || stage === 'neutron_star' || stage === 'black_hole';
}

export function isExplosiveOrNebulaStage(stage: EvolutionStage): boolean {
  return stage === 'supernova' || stage === 'planetary_nebula';
}
