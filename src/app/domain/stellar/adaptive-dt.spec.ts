import { describe, expect, it } from 'vitest';
import { computeAdaptiveDtYears } from './adaptive-dt';
import { createInitialStarState } from './star-step';
import { DT_MAX_YEARS, DT_MIN_YEARS } from '../../core/constants/time.constants';

describe('adaptive-dt', () => {
  it('dt on MS is much larger than supernova proxy', () => {
    const ms = createInitialStarState(1, 0.02);
    ms.stage = 'main_sequence';
    const sn = { ...ms, stage: 'supernova' as const };
    const dtMs = computeAdaptiveDtYears(ms, 1);
    const dtSn = computeAdaptiveDtYears(sn, 1);
    expect(dtMs).toBeGreaterThan(dtSn * 100);
  });

  it('respects clamp min/max', () => {
    const state = createInitialStarState(1, 0.02);
    const dt = computeAdaptiveDtYears(state, 64);
    expect(dt).toBeGreaterThanOrEqual(DT_MIN_YEARS);
    expect(dt).toBeLessThanOrEqual(DT_MAX_YEARS * 64);
  });

  it('time accel increases dt', () => {
    const state = createInitialStarState(1, 0.02);
    const dt1 = computeAdaptiveDtYears(state, 1);
    const dt4 = computeAdaptiveDtYears(state, 4);
    expect(dt4).toBeGreaterThan(dt1);
  });
});
