export type CoreZoneKind = 'core' | 'radiative' | 'convective';

export interface CoreZoneLayout {
  readonly coreOuterFraction: number;
  readonly radiativeOuterFraction: number;
  readonly convectiveIsEnvelope: boolean;
  readonly dominantCoreElementLabel: 'H' | 'He' | 'C/O' | 'Fe' | 'Ne' | 'Si' | '—';
}
