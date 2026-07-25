import { zamsLuminositySolar, zamsRadiusSolar } from '../stellar/main-sequence';
import { teffFromLR } from '../stellar/stefan-boltzmann';
import { PlotRect, xyToPlot } from './hr-scales';

export interface HrStaticPoint {
  massSolar: number;
  teffK: number;
  luminositySolar: number;
}

const ZAMS_MASS_SAMPLES = [0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 5, 8, 10, 15, 20, 30, 50, 70, 100];

export function generateMainSequencePoints(metallicity = 0.02): HrStaticPoint[] {
  return ZAMS_MASS_SAMPLES.map((massSolar) => {
    const luminositySolar = zamsLuminositySolar(massSolar, metallicity);
    const radiusSolar = zamsRadiusSolar(massSolar);
    const teffK = teffFromLR(luminositySolar, radiusSolar);
    return { massSolar, teffK, luminositySolar };
  });
}

export function mainSequencePolyline(plot: PlotRect, metallicity = 0.02): string {
  return generateMainSequencePoints(metallicity)
    .map((pt, i) => {
      const { x, y } = xyToPlot(pt.teffK, pt.luminositySolar, plot);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function mainSequenceBand(plot: PlotRect, metallicity = 0.02): string {
  const points = generateMainSequencePoints(metallicity);
  if (points.length < 2) {
    return '';
  }
  const upper = points.map((pt, i) => {
    const { x, y } = xyToPlot(pt.teffK, pt.luminositySolar * 1.15, plot);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  const lower = [...points].reverse().map((pt, i) => {
    const { x, y } = xyToPlot(pt.teffK, pt.luminositySolar * 0.85, plot);
    return `${i === 0 ? 'L' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return `${upper.join(' ')} ${lower.join(' ')} Z`;
}

export function giantsRegionPath(plot: PlotRect): string {
  const corners = [
    xyToPlot(4500, 1e5, plot),
    xyToPlot(3500, 1e5, plot),
    xyToPlot(3000, 1e3, plot),
    xyToPlot(4000, 1e2, plot),
  ];
  return `M ${corners[0].x} ${corners[0].y} L ${corners[1].x} ${corners[1].y} L ${corners[2].x} ${corners[2].y} L ${corners[3].x} ${corners[3].y} Z`;
}

export function whiteDwarfRegionPath(plot: PlotRect): string {
  const corners = [
    xyToPlot(40000, 1e-4, plot),
    xyToPlot(8000, 1e-4, plot),
    xyToPlot(6000, 1e-5, plot),
    xyToPlot(20000, 1e-5, plot),
  ];
  return `M ${corners[0].x} ${corners[0].y} L ${corners[1].x} ${corners[1].y} L ${corners[2].x} ${corners[2].y} L ${corners[3].x} ${corners[3].y} Z`;
}
