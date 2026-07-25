import {
  BASE_DT_FRACTION,
  DT_MAX_YEARS,
  DT_MIN_YEARS,
  RATE_GAIN,
} from '../../core/constants/time.constants';
import { RATE_BY_STAGE } from '../../core/constants/stellar.constants';
import { StarState } from '../../core/models/star-params.model';
import { stageDurationYears } from './lifetime';

export function computeAdaptiveDtYears(
  state: StarState,
  timeAccel: number,
  lastRelativeRate = 0,
): number {
  const base = stageDurationYears(state) * BASE_DT_FRACTION;
  const rateProxy = RATE_BY_STAGE[state.stage] ?? 0.1;
  const rel = Math.max(rateProxy, lastRelativeRate);
  let dt = base / (1 + RATE_GAIN * rel);
  dt = Math.max(DT_MIN_YEARS, Math.min(DT_MAX_YEARS, dt));
  return dt * Math.max(timeAccel, 0.25);
}

export function computeRelativeRate(
  prev: StarState,
  next: StarState,
): number {
  const dL = Math.abs(next.params.luminositySolar - prev.params.luminositySolar) /
    Math.max(prev.params.luminositySolar, 1e-8);
  const dR = Math.abs(next.params.radiusSolar - prev.params.radiusSolar) /
    Math.max(prev.params.radiusSolar, 1e-8);
  const dT = Math.abs(next.params.teffK - prev.params.teffK) / Math.max(prev.params.teffK, 1);
  return Math.max(dL, dR, dT);
}
