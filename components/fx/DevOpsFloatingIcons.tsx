'use client';

import { motion } from 'framer-motion';
import { Boxes, Container, GitBranch, Server, Workflow, Network } from 'lucide-react';

const ICONS = [
  { Icon: Boxes, label: 'Kubernetes', delay: 0, x: '8%', y: '12%', dur: 7 },
  { Icon: Workflow, label: 'Argo CD', delay: 0.4, x: '82%', y: '18%', dur: 8 },
  { Icon: GitBranch, label: 'Git', delay: 0.2, x: '72%', y: '68%', dur: 6.5 },
  { Icon: Container, label: 'Containers', delay: 0.6, x: '14%', y: '58%', dur: 7.5 },
  { Icon: Network, label: 'Service mesh', delay: 0.3, x: '88%', y: '48%', dur: 9 },
  { Icon: Server, label: 'Infra', delay: 0.5, x: '6%', y: '82%', dur: 8.5 },
] as const;

export function DevOpsFloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl" aria-hidden>
      {ICONS.map(({ Icon, label, delay, x, y, dur }, i) => (
        <motion.span
          key={label}
          className="absolute flex h-11 w-11 items-center justify-center rounded-2xl border border-border/50 bg-surface/40 text-accent/80 shadow-inner backdrop-blur-sm"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: [0.35, 0.55, 0.35],
            y: [0, -10, 0],
            rotate: [-4 + i * 2, 4 - i, -4 + i * 2],
          }}
          transition={{
            opacity: { duration: dur, repeat: Infinity, ease: 'easeInOut', delay },
            y: { duration: dur, repeat: Infinity, ease: 'easeInOut', delay },
            rotate: { duration: dur * 1.2, repeat: Infinity, ease: 'easeInOut', delay },
          }}
        >
          <Icon size={20} strokeWidth={1.65} className="text-accent" />
          <span className="sr-only">{label}</span>
        </motion.span>
      ))}
    </div>
  );
}
