'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { Reveal } from '@/components/fx/Reveal';
import { cn, sparkArea, sparkPath, toneToClass } from '@/lib/utils';
import type { LiveData } from '@/lib/types';

type Metric = LiveData['metrics'][number];

const EASE = [0.16, 1, 0.3, 1] as const;
const POINTS = 14;

export function LiveSystems() {
  const { live } = data;
  const ref = useRef<HTMLElement>(null);
  // Timers only run while the section is on screen, and never with reduced motion.
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' });
  // Reduced motion is only known in the browser, so apply it after hydration to keep markup identical.
  const prefersReduced = useReducedMotion();
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(Boolean(prefersReduced)), [prefersReduced]);
  const running = inView && !reduce;

  return (
    <section id="live" ref={ref} className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeader eyebrow={live.eyebrow} title={live.title} subtitle={live.subtitle} />
      <Reveal kind="fade" delay={0.1}>
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-warn" />
          {live.note}
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {live.metrics.map((m) => (
          <LiveMetric key={m.title} m={m} running={running} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <TerminalPanel running={running} reduce={reduce} className="lg:col-span-7" />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <PipelinePanel running={running} />
          <ClusterFleet running={running} />
        </div>
      </div>
    </section>
  );
}

/* ---------- metrics ---------- */

function seedSeries(m: Metric): number[] {
  // Deterministic so server and client render the same first frame.
  return Array.from({ length: POINTS }, (_, i) =>
    m.kind === 'counter' ? m.base - (POINTS - 1 - i) * m.jitter * 0.6 : m.base + Math.sin(i * 1.3) * m.jitter * 0.8
  );
}

function nextValue(m: Metric, prev: number): number {
  if (m.kind === 'counter') return prev + (Math.random() < 0.6 ? Math.ceil(Math.random() * m.jitter) : 0);
  // Random walk pulled back toward the baseline so values stay believable.
  return prev + (m.base - prev) * 0.35 + (Math.random() - 0.5) * m.jitter * 1.4;
}

function formatValue(v: number, decimals: number) {
  return decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US');
}

function LiveMetric({ m, running }: { m: Metric; running: boolean }) {
  const [series, setSeries] = useState(() => seedSeries(m));

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeries((s) => [...s.slice(1), nextValue(m, s[s.length - 1])]);
    }, 2000);
    return () => clearInterval(id);
  }, [running, m]);

  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const delta = prev ? ((last - prev) / prev) * 100 : 0;
  const up = delta >= 0;
  const good = (m.goodWhen === 'up') === up;
  const w = 160;
  const h = 40;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 glass p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">{m.title}</span>
        <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.14em] text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          live
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cn('font-display text-2xl font-semibold tabular-nums sm:text-3xl', toneToClass[m.tone])}>
          {formatValue(last, m.decimals)}
        </span>
        {m.unit && <span className="text-sm text-muted">{m.unit}</span>}
      </div>
      <div className={cn('mt-0.5 text-[11px] tabular-nums', Math.abs(delta) < 0.005 ? 'text-muted' : good ? 'text-success' : 'text-warn')}>
        {up ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}%
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-3 h-10 w-full overflow-visible">
        <motion.path
          animate={{ d: sparkArea(series, w, h) }}
          initial={false}
          transition={{ duration: 0.9, ease: EASE }}
          fill={`rgb(var(--${m.tone === 'fg' ? 'accent' : m.tone}) / 0.12)`}
        />
        <motion.path
          animate={{ d: sparkPath(series, w, h) }}
          initial={false}
          transition={{ duration: 0.9, ease: EASE }}
          fill="none"
          stroke={`rgb(var(--${m.tone === 'fg' ? 'accent' : m.tone}))`}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/* ---------- terminal ---------- */

type TermLine = { id: number; kind: 'cmd' | 'out'; prompt?: string; text: string };
const MAX_LINES = 11;

function TerminalPanel({ running, reduce, className }: { running: boolean; reduce: boolean; className?: string }) {
  const { terminal } = data.live;
  // Start with the first command already run so the terminal never opens empty.
  const first = terminal.sessions[0];
  const [lines, setLines] = useState<TermLine[]>(() => [
    { id: 0, kind: 'cmd', prompt: first.prompt, text: first.cmd },
    ...first.out.map((o, i) => ({ id: i + 1, kind: 'out' as const, text: o })),
  ]);
  const [typing, setTyping] = useState('');
  const [sessionIdx, setSessionIdx] = useState(1 % terminal.sessions.length);
  const pos = useRef({ s: 1 % terminal.sessions.length, c: 0, phase: 'type' as 'type' | 'out', id: first.out.length + 1 });

  useEffect(() => {
    if (!reduce) return;
    // Reduced motion: show the whole session at once instead of typing it.
    let id = 0;
    setLines(
      terminal.sessions
        .flatMap((s) => [
          { id: id++, kind: 'cmd' as const, prompt: s.prompt, text: s.cmd },
          ...s.out.map((o) => ({ id: id++, kind: 'out' as const, text: o })),
        ])
        .slice(-MAX_LINES)
    );
  }, [reduce, terminal.sessions]);

  useEffect(() => {
    if (!running) return;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      const p = pos.current;
      const sess = terminal.sessions[p.s];
      if (p.phase === 'type') {
        if (p.c < sess.cmd.length) {
          p.c++;
          setTyping(sess.cmd.slice(0, p.c));
          t = setTimeout(step, 26 + Math.random() * 38);
          return;
        }
        setLines((l) => [...l, { id: p.id++, kind: 'cmd' as const, prompt: sess.prompt, text: sess.cmd }].slice(-MAX_LINES));
        setTyping('');
        p.phase = 'out';
        t = setTimeout(step, 420);
        return;
      }
      setLines((l) =>
        [...l, ...sess.out.map((o) => ({ id: p.id++, kind: 'out' as const, text: o }))].slice(-MAX_LINES)
      );
      p.phase = 'type';
      p.c = 0;
      p.s = (p.s + 1) % terminal.sessions.length;
      setSessionIdx(p.s);
      t = setTimeout(step, 1700);
    };
    t = setTimeout(step, 500);
    return () => clearTimeout(t);
  }, [running, terminal.sessions]);

  const current = terminal.sessions[sessionIdx];

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/60 bg-[#0b0e16] text-[#d7dbe6]', className)}>
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate font-mono text-xs text-white/50">{terminal.title}</span>
      </div>
      <div className="flex h-[300px] flex-col justify-end overflow-hidden px-4 py-4 font-mono text-[12.5px] leading-relaxed sm:h-[360px] sm:text-[13px]">
        <AnimatePresence initial={false}>
          {lines.map((l) => (
            <motion.div
              key={l.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex gap-2"
            >
              {l.kind === 'cmd' ? (
                <>
                  <span className={l.prompt === '$' ? 'text-[#7ee787]' : 'text-[#a78bfa]'}>{l.prompt}</span>
                  <span className="break-all text-white">{l.text}</span>
                </>
              ) : (
                <>
                  <span className="select-none opacity-0">$</span>
                  <span className="break-all text-white/60">{l.text}</span>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {!reduce && (
          <div className="flex gap-2">
            <span className={current.prompt === '$' ? 'text-[#7ee787]' : 'text-[#a78bfa]'}>{current.prompt}</span>
            <span className="break-all text-white">
              {typing}
              <span className="ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] bg-white/70" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- pipeline ---------- */

function PipelinePanel({ running }: { running: boolean }) {
  const { pipeline } = data.live;
  const n = pipeline.stages.length;
  const [active, setActive] = useState(2);
  const [sha, setSha] = useState('4f2c9ab');
  const step = useRef(2);

  useEffect(() => {
    if (!running) return;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      // Hold on "Deployed" for one extra step, then start a new release.
      step.current = step.current >= n ? 0 : step.current + 1;
      if (step.current === 0) setSha(Math.random().toString(16).slice(2, 9));
      setActive(step.current);
      t = setTimeout(tick, pipeline.stepMs);
    };
    t = setTimeout(tick, pipeline.stepMs);
    return () => clearTimeout(t);
  }, [running, n, pipeline.stepMs]);

  const done = active >= n;

  return (
    <div className="rounded-2xl border border-border/60 glass p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-fg">{pipeline.title}</div>
          <div className="mt-0.5 font-mono text-[11px] text-muted">
            {pipeline.service} @ {sha}
          </div>
        </div>
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors duration-500',
            done ? 'border-success/40 bg-success/10 text-success' : 'border-accent/40 bg-accent/10 text-accent'
          )}
        >
          {done ? 'Deployed' : `Running · ${pipeline.stages[active].label}`}
        </span>
      </div>

      <ol className="relative mt-5 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        <span aria-hidden className="absolute left-[8%] right-[8%] top-[17px] h-px bg-border/70" />
        <motion.span
          aria-hidden
          className="absolute left-[8%] top-[17px] h-px bg-gradient-to-r from-success to-accent"
          animate={{ width: `${(Math.min(active, n - 1) / (n - 1)) * 84}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        {pipeline.stages.map((s, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'pending';
          return (
            <li key={s.label} className="relative flex flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  'relative z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-500',
                  state === 'done' && 'border-success/50 bg-success/15 text-success',
                  state === 'active' && 'border-accent/60 bg-accent/15 text-accent',
                  state === 'pending' && 'border-border/70 bg-surface text-muted'
                )}
              >
                <Icon name={state === 'done' ? 'check' : s.icon} size={15} />
                {state === 'active' && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-[-4px] rounded-full border border-accent/40"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.9, 1.15, 1.25] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </span>
              <span className={cn('text-[11px] leading-tight', state === 'pending' ? 'text-muted' : 'text-fg')}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- cluster fleet ---------- */

function ClusterFleet({ running }: { running: boolean }) {
  const { clusters } = data.live;
  const [syncing, setSyncing] = useState<number[]>([]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSyncing((s) => [...s.slice(-2), Math.floor(Math.random() * clusters.count)]);
    }, 900);
    return () => clearInterval(id);
  }, [running, clusters.count]);

  return (
    <div className="rounded-2xl border border-border/60 glass p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-fg">{clusters.title}</div>
        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success/80" /> {clusters.count} healthy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent2" /> {clusters.syncLabel}
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5 sm:grid-cols-[repeat(26,minmax(0,1fr))]">
        {Array.from({ length: clusters.count }, (_, i) => {
          const on = syncing.includes(i);
          return (
            <span
              key={i}
              className={cn(
                'aspect-square rounded-full transition-all duration-700 ease-out',
                on ? 'scale-110 bg-accent2' : 'bg-success/55'
              )}
            />
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted">{clusters.caption}</p>
    </div>
  );
}
