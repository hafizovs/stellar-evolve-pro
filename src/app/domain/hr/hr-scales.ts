import {
  HR_LUM_MAX,
  HR_LUM_MIN,
  HR_TEFF_MAX,
  HR_TEFF_MIN,
} from '../../core/constants/hr.constants';

export interface PlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clampTeff(teffK: number): number {
  return Math.min(HR_TEFF_MAX, Math.max(HR_TEFF_MIN, teffK));
}

export function clampLuminosity(lSolar: number): number {
  return Math.min(HR_LUM_MAX, Math.max(HR_LUM_MIN, lSolar));
}

export function teffToX(teffK: number, plotWidth: number): number {
  const t = clampTeff(teffK);
  const logMax = Math.log10(HR_TEFF_MAX);
  const logMin = Math.log10(HR_TEFF_MIN);
  const logT = Math.log10(t);
  return plotWidth * ((logMax - logT) / (logMax - logMin));
}

export function lumToY(luminositySolar: number, plotHeight: number): number {
  const l = clampLuminosity(luminositySolar);
  const logMax = Math.log10(HR_LUM_MAX);
  const logMin = Math.log10(HR_LUM_MIN);
  const logL = Math.log10(l);
  return plotHeight * ((logMax - logL) / (logMax - logMin));
}

export function xyToPlot(
  teffK: number,
  luminositySolar: number,
  plot: PlotRect,
): { x: number; y: number } {
  return {
    x: plot.x + teffToX(teffK, plot.width),
    y: plot.y + lumToY(luminositySolar, plot.height),
  };
}

export function plotToTeff(x: number, plot: PlotRect): number {
  const rel = (x - plot.x) / plot.width;
  const logMax = Math.log10(HR_TEFF_MAX);
  const logMin = Math.log10(HR_TEFF_MIN);
  const logT = logMax - rel * (logMax - logMin);
  return Math.pow(10, logT);
}

export function plotToLuminosity(y: number, plot: PlotRect): number {
  const rel = (y - plot.y) / plot.height;
  const logMax = Math.log10(HR_LUM_MAX);
  const logMin = Math.log10(HR_LUM_MIN);
  const logL = logMax - rel * (logMax - logMin);
  return Math.pow(10, logL);
}
