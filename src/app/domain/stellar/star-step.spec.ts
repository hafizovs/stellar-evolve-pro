import { describe, expect, it } from 'vitest';
import { createInitialStarState, stepStar } from './star-step';

describe('star-step', () => {
  it('creates ZAMS main-sequence preview at age 0', () => {
    const state = createInitialStarState(1, 0.02);
    expect(state.stage).toBe('main_sequence');
    expect(state.stageProgress).toBe(0);
    expect(state.ageYears).toBe(0);
    expect(state.params.luminositySolar).toBeCloseTo(1, 1);
  });

  it('increases age on step', () => {
    const state = createInitialStarState(1, 0.02);
    const next = stepStar(state, 1e5);
    expect(next.ageYears).toBeGreaterThan(state.ageYears);
  });

  it('decreases hydrogen on MS over many steps', () => {
    let state = createInitialStarState(1, 0.02);
    state.stage = 'main_sequence';
    const h0 = state.composition.hydrogen;
    for (let i = 0; i < 50; i += 1) {
      state = stepStar(state, 1e7);
    }
    expect(state.composition.hydrogen).toBeLessThan(h0);
  });

  it('terminal state is stable', () => {
    let state = createInitialStarState(1, 0.02);
    state.isTerminal = true;
    state.stage = 'white_dwarf';
    state.remnantKind = 'white_dwarf';
    const next = stepStar(state, 1e6);
    expect(next.ageYears).toBe(state.ageYears);
    expect(next.stage).toBe('white_dwarf');
  });
});
