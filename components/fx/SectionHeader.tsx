'use client';

import { ReactNode } from 'react';
import { Reveal } from './Reveal';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
}) {
  const isCenter = align === 'center';
  return (
    <div className={isCenter ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <Reveal kind="fade">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.26em] text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/80" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px] shadow-accent" />
          </span>
          {eyebrow}
        </div>
      </Reveal>
      <Reveal kind="slideUp" delay={0.08}>
        <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal kind="fadeBlur" delay={0.15}>
          <p className="mt-4 text-base text-muted sm:text-lg">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
