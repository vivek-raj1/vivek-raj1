'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { cn, toneToClass } from '@/lib/utils';
import { MagneticButton } from '@/components/fx/MagneticButton';
import { ViewCounter } from '@/components/fx/ViewCounter';
import { BookCallButton, hasBooking } from '@/components/fx/BookCallButton';
import { SocialLinks } from '@/components/fx/SocialLinks';

const HeroThreeCanvas = dynamic(
  () => import('@/components/fx/HeroThreeCanvas').then((m) => ({ default: m.HeroThreeCanvas })),
  { ssr: false, loading: () => null }
);

export function Hero() {
  const { hero, meta } = data;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const fgY = useTransform(scrollYProgress, [0, 1], ['0%', '-6%']);
  const fadeOut = useTransform(scrollYProgress, [0, 0.6], [1, 0.2]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-36"
    >
      <HeroThreeCanvas />
      <motion.div style={{ y: bgY, opacity: fadeOut }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute right-10 bottom-10 h-[320px] w-[320px] rounded-full bg-accent2/10 blur-[100px]" />
      </motion.div>

      <motion.div style={{ y: fgY }} className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
              <span className="relative flex h-2 w-2">
                <span className="relative h-2 w-2 rounded-full bg-success" />
              </span>
              {meta.person.statusLabel}
            </div>
            <ViewCounter />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-accent2"
          >
            {hero.eyebrow}
          </motion.p>

          <HeadlineReveal words={hero.headline} />

          <motion.p
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-6 max-w-2xl text-base text-muted sm:text-lg"
          >
            {hero.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <MagneticButton href={hero.primaryCta.href} icon={<Icon name="arrow" size={16} />} size="lg">
              {hero.primaryCta.label}
            </MagneticButton>
            <MagneticButton
              href={hero.secondaryCta.href}
              variant="outline"
              size="lg"
              icon={<Icon name="arrow-up-right" size={14} />}
              target="_blank"
              rel="noreferrer"
            >
              {hero.secondaryCta.label}
            </MagneticButton>
            {hasBooking && <BookCallButton variant="outline" size="lg" />}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <SocialLinks className="mt-5" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {hero.badges.map((b, i) => (
              <span
                key={i}
                className={cn(
                  'rounded-full border border-border/60 glass px-3 py-1 font-mono text-[11px]',
                  toneToClass[b.tone]
                )}
              >
                {b.label}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="relative lg:col-span-5">
          <ProfileOrb />
        </div>
      </motion.div>

      <StatsStrip />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-12 hidden items-center gap-2 text-xs text-muted md:flex"
      >
        <span className="h-px w-10 bg-border" />
        scroll to explore
        <Icon name="chevron" size={14} />
      </motion.div>
    </section>
  );
}

function HeadlineReveal({ words }: { words: { text: string; tone: string }[] }) {
  const { wordStagger, wordDuration } = data.animations.hero;
  return (
    <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
      {words.map((w, i) => {
        // Leading spaces stay outside the inline-block so wrapped lines don't start indented.
        const lead = w.text.match(/^\s*/)?.[0] ?? '';
        const word = w.text.slice(lead.length);
        const isAccent = w.tone === 'accent' || w.tone === 'accent2';
        return (
          <Fragment key={i}>
            {lead && ' '}
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: wordDuration, delay: 0.2 + i * wordStagger, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'inline-block whitespace-pre',
                isAccent ? (w.tone === 'accent' ? 'text-gradient' : 'text-gradient-accent') : 'text-fg'
              )}
            >
              {word}
            </motion.span>
          </Fragment>
        );
      })}
    </h1>
  );
}

function ProfileOrb() {
  const { profile } = data.hero;
  const { meta } = data;
  if (!profile) return null;
  const ringLabels = profile.orbitLabels;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="relative mx-auto aspect-square w-full max-w-md"
    >
      {/* outer rotating ring with tags */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 42, ease: 'linear', repeat: Infinity }}
        className="absolute inset-2 rounded-full"
        style={{
          backgroundImage:
            'conic-gradient(from 0deg, rgb(var(--accent)/0.35), rgb(var(--accent2)/0.35), transparent 30%, rgb(var(--accent)/0.35))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))',
        }}
      />
      {/* orbit labels */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
        className="absolute inset-0"
      >
        {ringLabels.map((label, i) => {
          const angle = (i / ringLabels.length) * 360;
          return (
            <motion.div
              key={label}
              animate={{ rotate: -360 }}
              transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
              className="absolute left-1/2 top-1/2 origin-center"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-50% + 8px))`,
              }}
            >
              <span
                className="rounded-full border border-border/60 glass px-2 py-0.5 font-mono text-[10px] text-muted"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                {label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* dashed decorative ring */}
      <div
        aria-hidden
        className="absolute inset-10 rounded-full border border-dashed border-border/50"
      />

      {/* image disc */}
      <div className="absolute inset-[14%] overflow-hidden rounded-full border border-border/60 glass-strong shadow-glow-accent">
        <Image
          src={profile.image}
          alt={meta.person.name}
          fill
          sizes="(max-width: 1024px) 60vw, 30vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
      </div>

      {/* floating labels */}
      <motion.div
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute left-0 top-12 flex items-center gap-2 rounded-full border border-border/60 glass-strong px-3 py-1.5 shadow-glow-accent"
      >
        <span className="flex h-2 w-2 rounded-full bg-success" />
        <span className="font-mono text-[11px] text-fg">{profile.role}</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute right-0 bottom-16 flex items-center gap-2 rounded-full border border-border/60 glass-strong px-3 py-1.5 shadow-glow-accent"
      >
        <Icon name="dot" size={10} className="text-accent2" />
        <span className="font-mono text-[11px] text-fg">@ {profile.company}</span>
      </motion.div>
    </motion.div>
  );
}

function StatsStrip() {
  const { stats } = data.hero;
  return (
    <div className="relative z-10 mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.0 + i * 0.08 }}
          className="group relative overflow-hidden rounded-2xl border border-border/60 glass p-4 transition hover:-translate-y-0.5 hover:border-accent/40"
        >
          <div className={cn('font-display text-2xl font-semibold tabular-nums sm:text-3xl', toneToClass[s.accent])}>
            <AnimatedNumber value={s.value} suffix={s.suffix} />
          </div>
          <div className="mt-1.5 text-xs font-medium leading-snug text-muted sm:text-[13px]">{s.label}</div>
          <div className="absolute -right-4 -bottom-6 h-16 w-16 rounded-full bg-gradient-to-tr from-accent/20 to-transparent blur-2xl opacity-60 transition group-hover:opacity-100" />
        </motion.div>
      ))}
    </div>
  );
}

function AnimatedNumber({ value, suffix }: { value: string; suffix: string }) {
  const isNumeric = /^[\d.]+$/.test(value);
  const [display, setDisplay] = useState(isNumeric ? '0' : value);
  useEffect(() => {
    if (!isNumeric) return;
    const target = parseFloat(value);
    const decimals = (value.split('.')[1] || '').length;
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = target * eased;
      setDisplay(decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US'));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, isNumeric]);
  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
