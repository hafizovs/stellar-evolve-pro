import { STARFIELD_COUNT, STAR_MAX_FRACTION, STAR_MIN_PX } from '../../core/constants/render.constants';
import { EvolutionStage } from '../../core/models/evolution-stage.model';
import { StarState } from '../../core/models/star-params.model';
import { formatTemperatureK } from '../../domain/stellar/format-stellar';
import { spectralClassColor } from '../../domain/stellar/spectral-class';

const BG = '#05080f';

interface StarfieldPoint {
  x: number;
  y: number;
  r: number;
  a: number;
}

function buildStarfield(width: number, height: number): StarfieldPoint[] {
  const points: StarfieldPoint[] = [];
  let seed = Math.floor(width * 17 + height * 31);
  const rand = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < STARFIELD_COUNT; i += 1) {
    points.push({
      x: rand() * width,
      y: rand() * height,
      r: rand() * 1.2 + 0.3,
      a: rand() * 0.5 + 0.2,
    });
  }
  return points;
}

function starRadiusPx(radiusSolar: number, width: number, height: number, stage: EvolutionStage): number {
  const minDim = Math.min(width, height);

  if (stage === 'white_dwarf' || stage === 'neutron_star') {
    return Math.max(STAR_MIN_PX * 0.55, minDim * 0.05);
  }

  const logR = Math.log10(Math.max(radiusSolar, 1e-6));
  const normalized = (logR + 6) / 8;
  return Math.min(minDim * STAR_MAX_FRACTION, Math.max(STAR_MIN_PX, normalized * minDim * 0.35));
}

export function drawStarExterior(
  ctx: CanvasRenderingContext2D,
  state: StarState,
  pulsePhase: number,
  starfield: StarfieldPoint[],
): void {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  for (const star of starfield) {
    ctx.fillStyle = `rgba(220, 230, 255, ${star.a})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = width / 2;
  const cy = height / 2;
  const baseR = starRadiusPx(state.params.radiusSolar, width, height, state.stage);
  const pulse = 1 + 0.04 * state.pulsationAmplitude * Math.sin(pulsePhase);
  const r = baseR * pulse;
  const color = spectralClassColor(state.params.teffK);

  if (state.stage === 'black_hole') {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    const ring = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.4);
    ring.addColorStop(0, 'rgba(240, 169, 74, 0)');
    ring.addColorStop(0.5, 'rgba(240, 169, 74, 0.6)');
    ring.addColorStop(1, 'rgba(240, 169, 74, 0)');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (state.stage === 'supernova') {
    const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
    flash.addColorStop(0, 'rgba(255,255,255,1)');
    flash.addColorStop(0.3, 'rgba(255, 180, 80, 0.9)');
    flash.addColorStop(1, 'rgba(255, 80, 40, 0)');
    ctx.fillStyle = flash;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const shadowBlur =
    state.stage === 'white_dwarf' || state.stage === 'neutron_star' ? 24 : 28;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowColor = color;

  const grad = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, 'rgba(0,0,0,0.4)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  const corona = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.8);
  corona.addColorStop(0, `${color}66`);
  corona.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(138, 155, 179, 0.85)';
  ctx.font = '12px IBM Plex Mono, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${state.params.spectralClass} · ${formatTemperatureK(state.params.teffK)}`,
    cx,
    cy + r + 22,
  );
}

export function createStarfieldCache(width: number, height: number): StarfieldPoint[] {
  return buildStarfield(width, height);
}
