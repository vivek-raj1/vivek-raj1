'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { data } from '@/lib/data';

export function CursorGlow() {
  const { cursor } = data.animations;
  const enabled = cursor.enabled && data.ui.effects.cursorGlow;
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const sx = useSpring(mx, { damping: 24, stiffness: 220, mass: 0.35 });
  const sy = useSpring(my, { damping: 24, stiffness: 220, mass: 0.35 });
  const [hovering, setHovering] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setIsCoarse(window.matchMedia('(pointer: coarse)').matches);
    const move = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHovering(!!t?.closest('a, button, [data-cursor="hover"]'));
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [enabled, mx, my]);

  if (!enabled || isCoarse) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] mix-blend-screen"
        style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      >
        <div
          className="rounded-full transition-all"
          style={{
            width: hovering ? cursor.ringSize * 1.6 : cursor.ringSize * 1.2,
            height: hovering ? cursor.ringSize * 1.6 : cursor.ringSize * 1.2,
            background:
              'radial-gradient(circle, rgb(var(--accent) / 0.55) 0%, rgb(var(--accent2) / 0.25) 45%, transparent 70%)',
            filter: 'blur(14px)',
          }}
        />
      </motion.div>
    </>
  );
}
