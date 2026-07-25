export function formatAgeYears(ageYears: number): string {
  const abs = Math.max(0, ageYears);
  if (abs < 1e3) {
    return `${abs.toFixed(0)} yr`;
  }
  if (abs < 1e6) {
    return `${(abs / 1e3).toFixed(2)} kyr`;
  }
  if (abs < 1e9) {
    return `${(abs / 1e6).toFixed(2)} Myr`;
  }
  return `${(abs / 1e9).toFixed(3)} Gyr`;
}

export function formatLuminosity(lSolar: number): string {
  if (lSolar >= 1e4 || lSolar <= 1e-3) {
    return lSolar.toExponential(2) + ' L☉';
  }
  return `${lSolar.toFixed(3)} L☉`;
}

export function formatTemperatureK(teffK: number): string {
  return `${Math.round(teffK).toLocaleString('en-US')} K`;
}

export function formatMassSolar(m: number): string {
  return `${m.toFixed(2)} M☉`;
}

export function formatRadiusSolar(r: number): string {
  if (r >= 100) {
    return r.toExponential(2) + ' R☉';
  }
  return `${r.toFixed(2)} R☉`;
}

export function formatDtYears(dtYears: number): string {
  if (dtYears >= 1e6) {
    return `${(dtYears / 1e6).toFixed(2)} Myr/step`;
  }
  if (dtYears >= 1e3) {
    return `${(dtYears / 1e3).toFixed(2)} kyr/step`;
  }
  if (dtYears >= 1) {
    return `${dtYears.toFixed(1)} yr/step`;
  }
  return `${dtYears.toExponential(2)} yr/step`;
}

export function formatPressurePa(pa: number): string {
  if (pa >= 1e12) {
    return pa.toExponential(2) + ' Pa';
  }
  return `${(pa / 1e9).toFixed(2)} GPa`;
}

export function formatPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}
