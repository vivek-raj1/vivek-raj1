'use client';

import { motion } from 'framer-motion';
import { useId } from 'react';
import { sparkPath, sparkArea } from '@/lib/utils';

export function Sparkline({
  series,
  accent = 'var(--accent)',
  accent2: _accent2 = 'var(--accent2)',
  width = 140,
  height = 44,
}: {
  series: number[];
  accent?: string;
  accent2?: string;
  width?: number;
  height?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const line = sparkPath(series, width, height);
  const area = sparkArea(series, width, height);
  const gid = `spark-${uid}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`rgb(${accent})`} stopOpacity="0.55" />
          <stop offset="100%" stopColor={`rgb(${accent})`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gid})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={`rgb(${accent})`}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
