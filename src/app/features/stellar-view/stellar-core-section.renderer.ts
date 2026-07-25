import { StarState } from '../../core/models/star-params.model';

const BG = '#05080f';

const ELEMENT_COLORS: Record<string, string> = {
  H: '#7ec8e8',
  He: '#f0e060',
  'C/O': '#f0a94a',
  Fe: '#9aa8b8',
  Ne: '#c8d8ff',
  Si: '#b0c0d0',
  '—': '#888',
};

export function drawCoreSection(
  ctx: CanvasRenderingContext2D,
  state: StarState,
  pulsePhase: number,
  labels: { core: string; radiative: string; convective: string; dominant: string },
): void {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.38;
  const pulse = 1 + 0.012 * state.pulsationAmplitude * Math.sin(pulsePhase);
  const outerR = maxR * pulse;

  const { coreOuterFraction, radiativeOuterFraction } = state.zoneLayout;
  const coreR = outerR * coreOuterFraction;
  const radR = outerR * radiativeOuterFraction;

  ctx.strokeStyle = 'rgba(62, 198, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(100, 130, 180, 0.35)';
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(80, 110, 160, 0.45)';
  ctx.beginPath();
  ctx.arc(cx, cy, radR, 0, Math.PI * 2);
  ctx.fill();

  const elem = state.zoneLayout.dominantCoreElementLabel;
  ctx.fillStyle = ELEMENT_COLORS[elem] ?? '#888';
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, radR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#e8eef8';
  ctx.font = 'bold 14px IBM Plex Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(elem, cx, cy);

  ctx.font = '11px IBM Plex Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8a9bb3';
  const legendX = 12;
  let ly = 16;
  ctx.fillText(`${labels.core}: ${labels.dominant} ${elem}`, legendX, ly);
  ly += 16;
  ctx.fillText(labels.radiative, legendX, ly);
  ly += 16;
  ctx.fillText(labels.convective, legendX, ly);
}
