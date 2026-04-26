'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ReactNode, useRef, MouseEvent, forwardRef, type Ref } from 'react';
import { data } from '@/lib/data';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  className?: string;
  icon?: ReactNode;
  target?: string;
  rel?: string;
  size?: 'sm' | 'md' | 'lg';
};

export const MagneticButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, Props>(function MagneticButton(
  { children, href, onClick, variant = 'primary', className, icon, target, rel, size = 'md' },
  _forwardedRef
) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 18, stiffness: 180, mass: 0.2 });
  const sy = useSpring(y, { damping: 18, stiffness: 180, mass: 0.2 });

  const m = data.animations.magnetic;
  const enabled = data.ui.effects.magneticButtons;

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d < m.radius) {
      x.set(dx * m.strength);
      y.set(dy * m.strength);
    } else {
      x.set(0);
      y.set(0);
    }
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const padding =
    size === 'sm' ? 'px-4 py-2 text-sm' : size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm';
  const base = cn(
    'group relative inline-flex items-center gap-2 overflow-hidden rounded-xl font-medium transition will-change-transform',
    padding,
    variant === 'primary' &&
      'bg-gradient-to-r from-accent to-accent2 text-white shadow-glow-accent hover:brightness-110',
    variant === 'outline' &&
      'border border-border/70 glass text-fg hover:border-accent/60 hover:text-fg',
    variant === 'ghost' && 'text-fg/80 hover:text-fg hover:bg-elevated/60',
    className
  );

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && (
          <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            {icon}
          </span>
        )}
      </span>
      {variant === 'primary' && (
        <span className="absolute inset-0 z-0 translate-y-full bg-gradient-to-r from-accent2 to-accent transition-transform duration-500 group-hover:translate-y-0" />
      )}
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <span className="absolute -inset-x-10 -inset-y-5 bg-[radial-gradient(ellipse_at_center,rgb(var(--accent)/0.28),transparent_60%)] blur-xl" />
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        data-cursor="hover"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ x: sx, y: sy }}
        className={base}
        onClick={onClick}
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      data-cursor="hover"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={base}
      onClick={onClick}
    >
      {inner}
    </motion.button>
  );
});
