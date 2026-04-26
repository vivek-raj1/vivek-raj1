import clsx, { ClassValue } from 'clsx';
import type { Tone } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const toneToClass: Record<Tone, string> = {
  fg: 'text-fg',
  accent: 'text-accent',
  accent2: 'text-accent2',
  success: 'text-success',
  warn: 'text-warn',
  danger: 'text-danger',
};

export const toneToBg: Record<Tone, string> = {
  fg: 'bg-fg/10',
  accent: 'bg-accent/15',
  accent2: 'bg-accent2/15',
  success: 'bg-success/15',
  warn: 'bg-warn/15',
  danger: 'bg-danger/15',
};

export const toneToRing: Record<Tone, string> = {
  fg: 'ring-fg/30',
  accent: 'ring-accent/40',
  accent2: 'ring-accent2/40',
  success: 'ring-success/40',
  warn: 'ring-warn/40',
  danger: 'ring-danger/40',
};

export function sparkPath(series: number[], w = 140, h = 44, pad = 2): string {
  if (!series.length) return '';
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const step = (w - pad * 2) / (series.length - 1 || 1);
  const pts = series.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  return pts
    .map(([x, y], i) => (i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`))
    .join(' ');
}

export function sparkArea(series: number[], w = 140, h = 44, pad = 2): string {
  const line = sparkPath(series, w, h, pad);
  if (!line) return '';
  return `${line} L${w - pad},${h - pad} L${pad},${h - pad} Z`;
}
