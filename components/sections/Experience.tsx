'use client';

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { cn, toneToClass } from '@/lib/utils';
import { useMediaQuery } from '@/lib/use-media-query';
import type { ExperienceData } from '@/lib/types';

type ExperienceItem = ExperienceData['items'][number];

const isCurrent = (item: ExperienceItem) => /present/i.test(item.end);

/** "Sep 2024" → months since year 0; "Present" → this month. */
function toMonths(label: string): number | null {
  const d = /present/i.test(label) ? new Date() : new Date(`1 ${label}`);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear() * 12 + d.getMonth();
}

/** LinkedIn-style tenure, counting both the first and last month: "2 yrs 3 mos". */
function tenure(item: ExperienceItem): string | null {
  const a = toMonths(item.start);
  const b = toMonths(item.end);
  if (a === null || b === null || b < a) return null;
  const total = b - a + 1;
  const y = Math.floor(total / 12);
  const m = total % 12;
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ');
}

const TIP_AT = 0.6; // the progress line's tip sits 60% down the viewport
const SPINE_TOP = 8; // spine starts 8px into the rail (top-2)
const nodeCentre = (md: boolean) => (md ? 38 : 32); // node centre below the row's top edge

export function Experience() {
  const { experience } = data;
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ExperienceItem | null>(null);
  const isMd = useMediaQuery('(min-width: 768px)');

  // How far down the spine (px) the progress line has drawn. Measured live on every scroll, because sections
  // above can change height (reveals, fetched data) and move the timeline after load.
  const tip = useMotionValue(0);
  const update = () => {
    const rail = railRef.current;
    if (!rail) return;
    const top = rail.getBoundingClientRect().top + SPINE_TOP;
    tip.set(Math.min(rail.offsetHeight - SPINE_TOP, Math.max(0, window.innerHeight * TIP_AT - top)));
  };
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', update);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(rail);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="experience" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <BackdropTerminal />

      <SectionHeader
        eyebrow={experience.eyebrow}
        title={experience.title}
        subtitle={experience.subtitle}
      />

      <div ref={railRef} className="relative mt-20">
        {/* spine: a solid track with the scroll progress drawn over it */}
        <div className="pointer-events-none absolute bottom-0 left-[15px] top-2 w-px bg-border/70 md:left-1/2 md:-translate-x-1/2">
          <motion.div style={{ height: tip }} className="absolute inset-x-0 top-0 bg-gradient-to-b from-accent to-accent2" />
        </div>

        <ol className="space-y-12 md:space-y-16">
          {experience.items.map((item, i) => (
            <TimelineRow
              key={item.id}
              item={item}
              side={isMd && i % 2 === 1 ? 'left' : 'right'}
              isMd={isMd}
              tip={tip}
              onOpen={() => setActive(item)}
            />
          ))}
        </ol>
      </div>

      <DetailsModal item={active} onClose={() => setActive(null)} />
    </section>
  );
}

/**
 * One role: a node on the spine, a straight connector to the card's title line, the card on one side and
 * the period, tenure and location on the other (md+). On phones the spine sits on the left and the card
 * carries the period itself.
 */
function TimelineRow({
  item,
  side,
  isMd,
  tip,
  onOpen,
}: {
  item: ExperienceItem;
  side: 'left' | 'right';
  isMd: boolean;
  tip: MotionValue<number>;
  onOpen: () => void;
}) {
  const rowRef = useRef<HTMLLIElement>(null);
  const inView = useInView(rowRef, { amount: 0.3, once: true, margin: '0px 0px -5% 0px' });
  const reduce = useReducedMotion();

  // "Reached" = the tip of the scroll-progress line has got down to this row's node. Scrolling back up un-reaches it.
  const [reached, setReached] = useState(false);
  const check = (t: number) => {
    const li = rowRef.current;
    if (li) setReached(SPINE_TOP + t >= li.offsetTop + nodeCentre(isMd) - 1);
  };
  useMotionValueEvent(tip, 'change', check);
  useEffect(() => check(tip.get()));

  // The connector is a line from the node's centre to an anchor on the card's edge. Whenever the card moves
  // (hover tilt and lift, press, slide-in) the end point is re-read every frame, so the line stretches with it.
  const nodeRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const x1 = useMotionValue(0);
  const y1 = useMotionValue(0);
  const x2 = useMotionValue(0);
  const y2 = useMotionValue(0);
  const sync = () => {
    const row = rowRef.current?.getBoundingClientRect();
    const n = nodeRef.current?.getBoundingClientRect();
    const a = anchorRef.current?.getBoundingClientRect();
    if (!row || !n || !a) return;
    x1.set(n.left + n.width / 2 - row.left);
    y1.set(n.top + n.height / 2 - row.top);
    x2.set(a.left + a.width / 2 - row.left);
    y2.set(a.top + a.height / 2 - row.top);
  };
  const trackUntil = useRef(0);
  const frame = useRef(0);
  const track = (ms: number) => {
    trackUntil.current = Math.max(trackUntil.current, performance.now() + ms);
    if (frame.current) return;
    const loop = () => {
      sync();
      frame.current = performance.now() < trackUntil.current ? requestAnimationFrame(loop) : 0;
    };
    frame.current = requestAnimationFrame(loop);
  };
  useEffect(() => {
    // Layout changes (resize, rotation, breakpoint) can come with transitions, so follow them until they settle.
    track(600);
    const ro = new ResizeObserver(() => track(600));
    if (rowRef.current) ro.observe(rowRef.current);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0; // so the next track() starts a fresh loop
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMd, side]);

  // Card and meta fade in as the row scrolls into view.
  const appear = useMotionValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return appear.set(1);
    if (!inView) return;
    track(900); // follow the card while it slides in
    const ctrl = animate(appear, 1, { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
    return () => ctrl.stop();
    // `track` only touches refs, so it's safe to leave out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, appear]);
  const cardOpacity = useTransform(appear, [0.3, 1], [0, 1]);
  const cardX = useTransform(appear, [0.3, 1], [side === 'left' ? -20 : 20, 0]);
  const metaOpacity = useTransform(appear, [0.2, 1], [0, 1]);

  // The connector draws out to the card once the line reaches the node.
  const draw = useMotionValue(0);
  useEffect(() => {
    const ctrl = animate(draw, reached ? 1 : 0, { duration: reduce ? 0 : reached ? 0.5 : 0.25, ease: [0.22, 1, 0.36, 1] });
    return () => ctrl.stop();
  }, [reached, reduce, draw]);

  const current = isCurrent(item);
  const duration = tenure(item);

  return (
    <li
      ref={rowRef}
      className="relative pl-10 md:grid md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:gap-x-10 md:pl-0"
    >
      <Node ref={nodeRef} current={current} reached={reached} reduce={Boolean(reduce)} />
      <svg aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible">
        <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--accent) / 0.75)" strokeWidth={1} style={{ pathLength: draw }} />
      </svg>

      {/* period · tenure · location, opposite the card */}
      <motion.div
        style={{ opacity: metaOpacity }}
        className={cn(
          'hidden pt-[30px] md:row-start-1 md:block',
          side === 'left' ? 'md:col-start-3 md:text-left' : 'md:col-start-1 md:text-right'
        )}
      >
        <p className={cn('font-mono text-xs font-medium uppercase tracking-[0.18em]', toneToClass[item.tone])}>
          {item.start} — {item.end}
        </p>
        <p
          className={cn(
            'mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted',
            side === 'right' && 'md:justify-end'
          )}
        >
          {current && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Current
            </span>
          )}
          {duration && <span suppressHydrationWarning className="tabular-nums">{duration}</span>}
          <span className="inline-flex items-center gap-1">
            <Icon name="map-pin" size={12} />
            {item.location}
          </span>
        </p>
      </motion.div>

      <motion.div
        // With reduced motion `draw` is 1, so the card renders fully visible.
        style={{ opacity: cardOpacity, x: cardX }}
        className={cn('relative md:row-start-1', side === 'left' ? 'md:col-start-1' : 'md:col-start-3')}
      >
        <ExperienceCard
          item={item}
          current={current}
          duration={duration}
          anchor={
            <span
              ref={anchorRef}
              aria-hidden
              className={cn('pointer-events-none absolute top-8 h-px w-px md:top-[38px]', side === 'left' ? 'right-0' : 'left-0')}
            />
          }
          onMove={track}
          onOpen={onOpen}
        />
      </motion.div>
    </li>
  );
}

/**
 * Spine marker. Grey until the progress line reaches it; then it lights up, pops, and sends out two pulse
 * rings. The current role keeps pulsing gently after that, so "you are here" is obvious.
 */
function Node({
  ref,
  current,
  reached,
  reduce,
}: {
  ref: RefObject<HTMLSpanElement | null>;
  current: boolean;
  reached: boolean;
  reduce: boolean;
}) {
  return (
    <span ref={ref} aria-hidden className="absolute left-[15px] top-6 z-10 h-4 w-4 -translate-x-1/2 md:left-1/2 md:top-[30px]">
      {reached &&
        !reduce &&
        [0, 0.3].map((delay) => (
          <motion.span
            key={delay}
            className="absolute inset-0 rounded-full bg-accent/50"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{
              duration: 1.1,
              delay,
              ease: 'easeOut',
              repeat: current ? Infinity : 1,
              repeatDelay: current ? 1.6 : 0.2,
            }}
          />
        ))}
      <motion.span
        key={reached ? 'on' : 'off'}
        initial={reached && !reduce ? { scale: 0.7 } : false}
        animate={{ scale: [null, reached && !reduce ? 1.4 : 1, 1] }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={cn(
          'relative flex h-4 w-4 items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow] duration-300',
          reached
            ? cn('border-accent shadow-[0_0_0_4px_rgb(var(--accent)/0.18),0_0_18px_rgb(var(--accent)/0.6)]', current ? 'bg-accent' : 'bg-bg')
            : 'border-border bg-bg shadow-[0_0_0_4px_rgb(var(--bg))]'
        )}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full transition-colors duration-300',
            reached ? (current ? 'bg-bg' : 'bg-accent') : 'bg-muted/50'
          )}
        />
      </motion.span>
    </span>
  );
}

function ExperienceCard({
  item,
  current,
  duration,
  anchor,
  onMove,
  onOpen,
}: {
  item: ExperienceItem;
  current: boolean;
  duration: string | null;
  /** Invisible point on the card edge the connector line attaches to. */
  anchor: React.ReactNode;
  /** Called whenever the card is about to move, with how long (ms) the motion may take to settle. */
  onMove: (ms: number) => void;
  onOpen: () => void;
}) {
  // Cursor-driven 3D tilt and a sheen that follows the pointer (off for touch and reduced motion).
  const reduce = useReducedMotion();
  const isCoarse = useMediaQuery('(pointer: coarse)');
  const tilt = Boolean(data.ui.effects.cardTilt) && !reduce && !isCoarse;

  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 220, damping: 20 });
  const sy = useSpring(my, { stiffness: 220, damping: 20 });
  const rotateX = useTransform(sy, [0, 1], tilt ? [3.5, -3.5] : [0, 0]);
  const rotateY = useTransform(sx, [0, 1], tilt ? [-4.5, 4.5] : [0, 0]);
  const auraX = useTransform(sx, (v) => `${v * 100}%`);
  const auraY = useTransform(sy, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${auraX} ${auraY}, rgb(var(--accent)/0.14), transparent 50%)`;

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    onMove(700);
    if (!tilt) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const onPointerLeave = () => {
    onMove(900);
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      onClick={onOpen}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={() => onMove(600)}
      onPointerUp={() => onMove(600)}
      style={tilt ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/50 p-5 text-left sm:p-6',
        'backdrop-blur-md shadow-sm transition-colors hover:border-accent/50 hover:bg-surface/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
      )}
    >
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: sheen }} />
      {anchor}

      {/* on md+ the period, tenure and location sit across the spine instead */}
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden">
        <p className={cn('font-mono text-[11px] uppercase tracking-[0.18em]', toneToClass[item.tone])}>
          {item.start} — {item.end}
        </p>
        {current && (
          <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-1.5 py-px text-[9px] font-mono uppercase tracking-[0.16em] text-success">
            <span className="h-1 w-1 rounded-full bg-success" />
            Current
          </span>
        )}
        <span className="flex items-center gap-2 text-[11px] text-muted">
          {duration && <span suppressHydrationWarning className="tabular-nums">{duration}</span>}
          <span className="inline-flex items-center gap-1">
            <Icon name="map-pin" size={11} />
            {item.location}
          </span>
        </span>
      </div>

      <h3 className="relative mt-2 font-display text-lg md:mt-0 font-semibold tracking-tight text-fg sm:text-xl">
        {item.role}
      </h3>
      <p className={cn('relative mt-0.5 text-sm font-medium', toneToClass[item.tone])}>{item.company}</p>

      <p className="relative mt-3 line-clamp-3 text-sm leading-relaxed text-fg/80">{item.summary}</p>

      {item.metrics && item.metrics.length > 0 && (
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {item.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-border/50 bg-elevated/50 px-2.5 py-2">
              <div className={cn('font-display text-lg font-semibold leading-none tabular-nums', toneToClass[item.tone])}>
                {m.value}
              </div>
              <div className="mt-1 text-[11px] leading-tight text-muted">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {item.keyWins && item.keyWins.length > 0 && (
        <ul className="relative mt-4 space-y-2">
          {item.keyWins.map((w) => (
            <li key={w} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15">
                <Icon name="check" size={10} className="text-accent" />
              </span>
              <span className="line-clamp-2">{w}</span>
            </li>
          ))}
        </ul>
      )}

      {/* spacer keeps the footer pinned to the bottom when cards are stretched to equal height */}
      <div className="min-h-4 flex-1" />
      <div className="relative flex items-center justify-between gap-3 border-t border-border/40 pt-3">
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
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent transition-transform group-hover:translate-x-0.5">
          All {item.bullets.length} achievements <Icon name="arrow-right" size={12} />
        </span>
      </div>

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
                  {item.role}
                </h3>
                <p className="text-sm text-fg/80">{item.company}</p>
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
                  <li key={j} className="flex items-start gap-2.5 text-sm text-fg/80">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
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
