export type MassPresetId = 'red_dwarf' | 'sun' | 'massive' | 'supermassive';

export interface MassPreset {
  id: MassPresetId;
  massSolar: number;
  metallicity: number;
  labelKey: string;
}
