export interface InitialConditions {
  massSolar: number;
  metallicity: number;
}

export const DEFAULT_INITIAL_CONDITIONS: InitialConditions = {
  massSolar: 1,
  metallicity: 0.02,
};
