import { HrTrackPoint } from '../../core/models/hr-track-point.model';
import { PlotRect, xyToPlot } from '../../domain/hr/hr-scales';

export function mapTrackPointToSvg(
  point: HrTrackPoint,
  plot: PlotRect,
): { x: number; y: number } {
  return xyToPlot(point.teffK, point.luminositySolar, plot);
}

export function mapStateToSvg(
  teffK: number,
  luminositySolar: number,
  plot: PlotRect,
): { x: number; y: number } {
  return xyToPlot(teffK, luminositySolar, plot);
}

export function computePlotRect(
  svgWidth: number,
  svgHeight: number,
  padding: { left: number; right: number; top: number; bottom: number },
): PlotRect {
  return {
    x: padding.left,
    y: padding.top,
    width: Math.max(1, svgWidth - padding.left - padding.right),
    height: Math.max(1, svgHeight - padding.top - padding.bottom),
  };
}
