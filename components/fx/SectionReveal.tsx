'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { data } from '@/lib/data';

/** Apple-style entrance: each section fades in and settles from a slight scale-down as it scrolls into view. */
export function SectionReveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const cfg = data.animations.reveal.section;
  if (!cfg || !data.ui.effects.sectionReveal) return <>{children}</>;
  // Same markup on server and client (reduced motion is only known in the browser); reduced motion just skips the tween.
  return (
    <motion.div
      initial={{ opacity: 0, y: cfg.y, scale: cfg.scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={reduce ? { duration: 0 } : { duration: cfg.duration, ease: cfg.ease as [number, number, number, number] }}
      style={{ transformOrigin: '50% 0%' }}
    >
      {children}
    </motion.div>
  );
}
