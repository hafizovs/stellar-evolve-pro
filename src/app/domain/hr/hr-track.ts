import {
  TRACK_MAX_POINTS,
  TRACK_MIN_DELTA_LOG_L,
  TRACK_MIN_DELTA_LOG_T,
} from '../../core/constants/time.constants';
import { HrTrackPoint } from '../../core/models/hr-track-point.model';
import { StarState } from '../../core/models/star-params.model';

export function createTrackPoint(state: StarState, index: number): HrTrackPoint {
  return {
    index,
    ageYears: state.ageYears,
    teffK: state.params.teffK,
    luminositySolar: state.params.luminositySolar,
    radiusSolar: state.params.radiusSolar,
    massSolar: state.params.massSolar,
    stage: state.stage,
    burningMode: state.burningMode,
    composition: structuredClone(state.composition),
    snapshot: structuredClone(state),
  };
}

export function shouldAppendPoint(
  track: readonly HrTrackPoint[],
  state: StarState,
): boolean {
  if (track.length === 0) {
    return true;
  }
  const prev = track[track.length - 1];
  if (prev.stage !== state.stage) {
    return true;
  }
  const dLogT = Math.abs(Math.log10(state.params.teffK) - Math.log10(prev.teffK));
  const dLogL = Math.abs(
    Math.log10(state.params.luminositySolar) - Math.log10(prev.luminositySolar),
  );
  return dLogT >= TRACK_MIN_DELTA_LOG_T || dLogL >= TRACK_MIN_DELTA_LOG_L;
}

export function truncate(track: HrTrackPoint[], index: number): HrTrackPoint[] {
  return track.slice(0, index + 1).map((pt, i) => ({ ...pt, index: i }));
}

export function thinTrackIfNeeded(track: HrTrackPoint[]): HrTrackPoint[] {
  if (track.length <= TRACK_MAX_POINTS) {
    return track;
  }
  const step = Math.ceil(track.length / TRACK_MAX_POINTS);
  const thinned = track.filter((_, i) => i % step === 0 || i === track.length - 1);
  return thinned.map((pt, i) => ({ ...pt, index: i }));
}

export function trackPolyline(
  track: readonly HrTrackPoint[],
  mapper: (pt: HrTrackPoint) => { x: number; y: number },
): string {
  if (track.length === 0) {
    return '';
  }
  return track
    .map((pt, i) => {
      const { x, y } = mapper(pt);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function findNearestTrackIndex(
  track: readonly HrTrackPoint[],
  clickX: number,
  clickY: number,
  mapper: (pt: HrTrackPoint) => { x: number; y: number },
  hitPx: number,
): number | null {
  let bestIdx: number | null = null;
  let bestDist = hitPx * hitPx;
  for (const pt of track) {
    const { x, y } = mapper(pt);
    const dx = x - clickX;
    const dy = y - clickY;
    const d2 = dx * dx + dy * dy;
    if (d2 <= bestDist) {
      bestDist = d2;
      bestIdx = pt.index;
    }
  }
  return bestIdx;
}
