'use client';

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { cn, toneToClass } from '@/lib/utils';
import { useMediaQuery } from '@/lib/use-media-query';
import type { ExperienceData } from '@/lib/types';

type ExperienceItem = ExperienceData['items'][number];

export function Experience() {
  const { experience } = data;
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 75%', 'end 25%'],
  });
  const lineH = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const [active, setActive] = useState<ExperienceItem | null>(null);
  const isMd = useMediaQuery('(min-width: 768px)');

  return (
    <section id="experience" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <BackdropTerminal />

      <SectionHeader
        eyebrow={experience.eyebrow}
        title={experience.title}
        subtitle={experience.subtitle}
      />

      <div ref={railRef} className="relative mt-20">
        {/* base rail */}
        <div className="pointer-events-none absolute left-[22px] top-0 h-full w-px bg-gradient-to-b from-transparent via-border/60 to-transparent md:left-1/2 md:-translate-x-1/2" />
        {/* progress rail */}
        <motion.div
          style={{ height: lineH }}
          className="pointer-events-none absolute left-[22px] top-0 w-px origin-top bg-gradient-to-b from-accent via-accent2 to-transparent shadow-[0_0_24px_rgb(var(--accent)/0.55)] md:left-1/2 md:-translate-x-1/2"
        />

        <ul className="space-y-16 md:space-y-24">
          {experience.items.map((item, i) => {
            const side: 'left' | 'right' = isMd ? (i % 2 === 0 ? 'right' : 'left') : 'right';
            return (
              <TimelineRow
                key={item.id}
                item={item}
                side={side}
                index={i}
                onOpen={() => setActive(item)}
              />
            );
          })}
        </ul>
      </div>

      <DetailsModal item={active} onClose={() => setActive(null)} />
    </section>
  );
}

function TimelineRow({
  item,
  side,
  index,
  onOpen,
}: {
  item: ExperienceItem;
  side: 'left' | 'right';
  index: number;
  onOpen: () => void;
}) {
  const rowRef = useRef<HTMLLIElement>(null);
  const inView = useInView(rowRef, { amount: 0.35, once: true, margin: '0px 0px -5% 0px' });
  const reduce = useReducedMotion();
  const [milestoneSeen, setMilestoneSeen] = useState(false);
  useEffect(() => {
    if (inView) setMilestoneSeen(true);
  }, [inView]);

  // Tween (not spring) avoids subtle oscillation on pathLength / halos that reads as "blinking".
  const draw = useMotionValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) {
      draw.set(1);
      return;
    }
    if (inView) {
      const ctrl = animate(draw, 1, { duration: 0.75, ease: [0.22, 1, 0.36, 1] });
      return () => ctrl.stop();
    }
  }, [inView, reduce, draw]);
  const pathLength = useTransform(draw, (d) => d);
  const cardOpacity = useTransform(draw, [0.5, 1], [0, 1]);
  const cardX = useTransform(draw, [0.5, 1], [side === 'left' ? -28 : 28, 0]);
  const nodeIntensity = useTransform(draw, [0, 0.12, 1], [0, 1, 1]);

  return (
    <li ref={rowRef} className="relative pl-14 md:pl-0">
      {/* milestone node */}
      <div className="absolute left-4 top-3 z-20 -translate-x-1/2 md:left-1/2">
        <MilestoneNode seen={milestoneSeen} intensity={nodeIntensity} />
      </div>

      {/* Connector line — sits at row level, drawn from milestone toward card */}
      <Connector side={side} pathLength={pathLength} />

      <div
        className={cn(
          'md:grid md:gap-10',
          'md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)]'
        )}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          style={
            reduce
              ? undefined
              : { opacity: cardOpacity, x: cardX }
          }
          className={cn(
            'relative',
            side === 'left'
              ? 'md:col-start-1 md:justify-self-end md:w-full md:max-w-xl'
              : 'md:col-start-3 md:justify-self-start md:w-full md:max-w-xl'
          )}
        >
          <ExperienceCard item={item} onOpen={onOpen} />
        </motion.div>
      </div>
    </li>
  );
}

function Connector({
  side,
  pathLength,
}: {
  side: 'left' | 'right';
  pathLength: import('framer-motion').MotionValue<number> | number;
}) {
  // Mobile: line starts at milestone center (left 16px) and ends at card edge (left 56px) → 40px wide.
  // md+: spine center is at left 50%; gap is 40px and spine col is 56px wide → distance from spine center to card edge = 28+40 = 68px.
  return (
    <>
      {/* Mobile connector */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-4 top-6 z-10 h-2 w-10 overflow-visible md:hidden"
        viewBox="0 0 40 8"
        preserveAspectRatio="none"
      >
        {/* glow halo */}
        <motion.line
          x1="0"
          y1="4"
          x2="40"
          y2="4"
          stroke="rgb(var(--accent) / 0.45)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength, filter: 'blur(2px)' }}
        />
        <motion.line
          x1="0"
          y1="4"
          x2="40"
          y2="4"
          stroke="rgb(var(--accent))"
          strokeWidth="1.4"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>

      {/* Desktop connector — starts at spine center, curves out to card edge */}
      <svg
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-6 z-10 hidden h-10 w-[68px] overflow-visible md:block',
          side === 'left' ? 'right-1/2' : 'left-1/2'
        )}
        viewBox="0 0 68 40"
        preserveAspectRatio="none"
      >
        {(() => {
          const d =
            side === 'left'
              ? 'M 68 4 C 44 4, 24 24, 0 28'
              : 'M 0 4 C 24 4, 44 24, 68 28';
          return (
            <>
              {/* glow halo */}
              <motion.path
                d={d}
                fill="none"
                stroke="rgb(var(--accent) / 0.45)"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ pathLength, filter: 'blur(2.5px)' }}
              />
              {/* solid line */}
              <motion.path
                d={d}
                fill="none"
                stroke="rgb(var(--accent))"
                strokeWidth="1.4"
                strokeLinecap="round"
                style={{ pathLength }}
              />
              <motion.circle
                cx={side === 'left' ? 0 : 68}
                cy={28}
                r={3}
                fill="rgb(var(--accent2))"
                style={{
                  opacity: pathLength,
                  filter: 'drop-shadow(0 0 6px rgb(var(--accent2)/0.9))',
                }}
              />
            </>
          );
        })()}
      </svg>
    </>
  );
}

function MilestoneNode({
  seen,
  intensity,
}: {
  seen: boolean;
  intensity: import('framer-motion').MotionValue<number>;
}) {
  // Glow scales with draw progress only; core dot stays stable once seen (no inView flicker).
  const haloScale = useTransform(intensity, [0, 1], [0.8, 1.12]);
  const haloOpacity = useTransform(intensity, [0, 1], [0, 0.32]);

  return (
    <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-accent/50 bg-bg shadow-glow-accent">
      <motion.span
        aria-hidden
        style={{ scale: haloScale, opacity: haloOpacity }}
        className="pointer-events-none absolute inset-0 rounded-full bg-accent/35 blur-[5px]"
      />
      {seen && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full ring-1 ring-accent/30"
        />
      )}
      <span
        className={cn(
          'relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-accent to-accent2',
          seen ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
        )}
      />
    </span>
  );
}

function ExperienceCard({
  item,
  onOpen,
}: {
  item: ExperienceItem;
  onOpen: () => void;
}) {
  const reduce = useReducedMotion();
  const isCoarse = useMediaQuery('(pointer: coarse)');
  const tilt = !reduce && !isCoarse;

  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 220, damping: 20 });
  const sy = useSpring(my, { stiffness: 220, damping: 20 });
  const rotateX = useTransform(sy, [0, 1], tilt ? [3.5, -3.5] : [0, 0]);
  const rotateY = useTransform(sx, [0, 1], tilt ? [-4.5, 4.5] : [0, 0]);
  const auraX = useTransform(sx, (v) => `${v * 100}%`);
  const auraY = useTransform(sy, (v) => `${v * 100}%`);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!tilt) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handlePointerLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={tilt ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border border-border/55 bg-surface/40 p-5 text-left sm:p-6',
        'backdrop-blur-md shadow-sm transition-colors hover:border-accent/55',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
      )}
    >
      {/* pointer-tracked sheen */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: useMotionTemplate`radial-gradient(420px circle at ${auraX} ${auraY}, rgb(var(--accent)/0.14), transparent 50%)`,
        }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <p className={cn('font-mono text-[11px] uppercase tracking-[0.18em]', toneToClass[item.tone])}>
          {item.start} — {item.end}
        </p>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-elevated/60 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-muted">
          <Icon name="map-pin" size={11} />
          {item.location}
        </span>
      </div>

      <h3 className="relative mt-2 font-display text-lg font-semibold tracking-tight text-fg sm:text-xl">
        {item.company}
      </h3>
      <p className="relative mt-0.5 text-[13px] font-medium text-fg/80 sm:text-sm">{item.role}</p>

      <p className="relative mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">{item.summary}</p>

      <div className="relative mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-md border border-border/55 bg-elevated/55 px-1.5 py-0.5 font-mono text-[10px] text-fg/75"
            >
              {t}
            </span>
          ))}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-mono text-accent transition-transform group-hover:translate-x-0.5">
          Open <Icon name="arrow-right" size={12} />
        </span>
      </div>

      <div className="pointer-events-none absolute -right-12 -bottom-14 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
    </motion.button>
  );
}

function DetailsModal({
  item,
  onClose,
}: {
  item: ExperienceItem | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-bg/70 p-0 backdrop-blur-md sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${item.company} details`}
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl overflow-hidden rounded-t-2xl border border-border/60 bg-surface/95 shadow-2xl sm:rounded-2xl"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(600px 240px at 0% 0%, rgb(var(--accent)/0.16), transparent 60%), radial-gradient(500px 220px at 100% 100%, rgb(var(--accent2)/0.14), transparent 60%)',
              }}
            />

            <div className="relative flex items-start justify-between gap-4 border-b border-border/40 px-6 py-5">
              <div className="min-w-0">
                <p className={cn('font-mono text-[11px] uppercase tracking-[0.18em]', toneToClass[item.tone])}>
                  {item.start} — {item.end} · {item.location}
                </p>
                <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-fg">
                  {item.company}
                </h3>
                <p className="text-sm text-fg/80">{item.role}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="rounded-full border border-border/60 bg-elevated/60 p-1.5 text-muted transition hover:border-accent/50 hover:text-fg"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="relative max-h-[70vh] overflow-y-auto px-6 py-5">
              <p className="text-sm leading-relaxed text-fg/85">{item.summary}</p>

              <ul className="mt-5 space-y-3">
                {item.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border/55 bg-elevated/60 px-2 py-0.5 font-mono text-[10px] text-fg/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function BackdropTerminal() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-0 overflow-hidden opacity-[0.08] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black_0%,transparent_75%)]"
    >
      <pre className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-pre font-mono text-[11px] leading-[1.6] text-fg/70 sm:text-xs">
{`$ kubectl get pods -A | grep -v Running
$ argocd app sync platform --prune
$ promql: rate(http_requests_total[5m])
$ terraform plan -out=tfplan && terraform apply
$ helm upgrade --install obs charts/observability
$ kubectl rollout status deploy/api -n prod
$ aws eks update-kubeconfig --name lead-prod
$ k9s --context multi-region`}
      </pre>
    </div>
  );
}
