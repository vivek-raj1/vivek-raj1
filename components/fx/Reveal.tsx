'use client';

import { motion, Variants, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { data } from '@/lib/data';

type RevealKind = 'fade' | 'fadeBlur' | 'slideUp';

export function Reveal({
  children,
  kind = 'slideUp',
  delay = 0,
  className,
  as = 'div',
  viewportAmount = 0.25,
}: {
  children: ReactNode;
  kind?: RevealKind;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'li';
  viewportAmount?: number;
}) {
  const reduce = useReducedMotion();
  const a = data.animations.reveal;
  const cfg =
    kind === 'fade'
      ? a.fade
      : kind === 'fadeBlur'
      ? a.fadeBlur
      : a.slideUp;

  const variants: Variants = {
    hidden:
      reduce
        ? { opacity: 1 }
        : kind === 'slideUp'
        ? { opacity: 0, y: a.slideUp.y, filter: 'blur(6px)' }
        : kind === 'fadeBlur'
        ? { opacity: 0, filter: `blur(${a.fadeBlur.blur}px)` }
        : { opacity: 0 },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: cfg.duration, ease: cfg.ease as [number, number, number, number], delay },
    },
  };

  const C = motion[as];
  return (
    <C
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: viewportAmount }}
      className={className}
    >
      {children}
    </C>
  );
}

export function StaggerGroup({
  children,
  className,
  each,
  delayChildren,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  each?: number;
  delayChildren?: number;
  as?: 'div' | 'section' | 'ul';
}) {
  const s = data.animations.reveal.stagger;
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: each ?? s.each,
        delayChildren: delayChildren ?? s.delayChildren,
      },
    },
  };
  const C = motion[as];
  return (
    <C
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </C>
  );
}
