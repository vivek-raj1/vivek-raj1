'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { data } from '@/lib/data';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.2 });
  if (!data.ui.effects.scrollProgress) return null;
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: x }}
      className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-accent via-accent2 to-accent"
    />
  );
}
