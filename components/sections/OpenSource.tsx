'use client';

import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { MagneticButton } from '@/components/fx/MagneticButton';
import { cn } from '@/lib/utils';
import type { OpenSourceItem, OpenSourceRepo } from '@/lib/types';

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: 'spring', stiffness: 380, damping: 34 } as const;

const ROLE_LABEL: Record<OpenSourceItem['role'], string> = {
  author: 'Opened',
  reviewer: 'Reviewed',
  commenter: 'Commented',
};
const STATE_CLASS: Record<OpenSourceItem['state'], string> = {
  merged: 'text-accent2',
  open: 'text-success',
  closed: 'text-muted',
};
const STATE_DOT: Record<OpenSourceItem['state'], string> = {
  merged: 'bg-accent2 shadow-[0_0_12px_rgb(var(--accent2)/0.7)]',
  open: 'bg-success shadow-[0_0_12px_rgb(var(--success)/0.7)]',
  closed: 'bg-muted',
};
/** GitHub's own language colours for the ones likely to show up; anything else gets the accent. */
const LANGUAGE_COLOR: Record<string, string> = {
  Go: '#00ADD8',
  Python: '#3572A5',
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Rust: '#DEA584',
  Shell: '#89E051',
  HCL: '#844FBA',
  Java: '#B07219',
  Mustache: '#724B3B',
  Smarty: '#F0C040',
};

type View = 'repos' | 'history';
type Filter = 'all' | 'merged' | 'open' | 'discussions';

const VIEWS: { id: View; label: string; icon: string }[] = [
  { id: 'repos', label: 'Repositories', icon: 'layers' },
  { id: 'history', label: 'History', icon: 'history' },
];
const FILTERS: { id: Filter; label: string; match: (i: OpenSourceItem) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'merged', label: 'Merged', match: (i) => i.state === 'merged' },
  { id: 'open', label: 'In review', match: (i) => i.kind === 'pr' && i.state === 'open' },
  { id: 'discussions', label: 'Issues & reviews', match: (i) => i.kind === 'issue' || i.role !== 'author' },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.06, ease: EASE },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/**
 * Public repositories I contributed to (PRs, issues, reviews, comments), found automatically by /api/opensource
 * (GitHub search, fetched server-side and cached). Nothing is listed by hand, and nothing is capped in the UI:
 * repo cards and the History timeline both page in more on demand.
 */
export function OpenSource() {
  const { opensource } = data;
  const [repos, setRepos] = useState<OpenSourceRepo[] | null>(null);
  const [view, setView] = useState<View>('repos');
  const [filter, setFilter] = useState<Filter>('all');
  const [shownRepos, setShownRepos] = useState(opensource.pageSize);
  const [shownHistory, setShownHistory] = useState(opensource.historyPageSize);
  const sectionRef = useRef<HTMLElement>(null);
  const allActivityUrl = `https://github.com/search?q=${encodeURIComponent(
    `involves:${opensource.githubUser} -user:${opensource.githubUser}`,
  )}&type=issues`;

  useEffect(() => {
    let cancelled = false;
    fetch('/api/opensource/')
      .then((r) => (r.ok ? r.json() : { repos: [] }))
      .then((j: { repos?: OpenSourceRepo[] }) => !cancelled && setRepos(j.repos ?? []))
      .catch(() => !cancelled && setRepos([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = repos === null;
  const match = FILTERS.find((f) => f.id === filter)!.match;

  const stats = useMemo(() => {
    const list = repos ?? [];
    return [
      { label: 'Projects', value: list.length, icon: 'layers' },
      { label: 'Pull requests', value: list.reduce((n, r) => n + r.prs, 0), icon: 'git-pull-request' },
      { label: 'Merged', value: list.reduce((n, r) => n + r.merged, 0), icon: 'git-merge' },
      { label: 'Combined stars', value: list.reduce((n, r) => n + r.stars, 0), icon: 'star' },
    ].filter((s) => loading || s.value > 0);
  }, [repos, loading]);

  const counts = useMemo(() => {
    const items = (repos ?? []).flatMap((r) => r.items);
    return Object.fromEntries(FILTERS.map((f) => [f.id, items.filter(f.match).length])) as Record<Filter, number>;
  }, [repos]);

  // Repos with at least one thread matching the filter, each card showing only the matching threads.
  const filteredRepos = useMemo(
    () =>
      (repos ?? [])
        .map((r) => ({ ...r, items: r.items.filter(match) }))
        .filter((r) => r.items.length > 0),
    [repos, match],
  );
  const history = useMemo(
    () =>
      filteredRepos
        .flatMap((r) => r.items.map((it) => ({ ...it, repo: r.name })))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filteredRepos],
  );

  const pickFilter = (f: Filter) => {
    setFilter(f);
    setShownRepos(opensource.pageSize);
    setShownHistory(opensource.historyPageSize);
  };
  const collapse = (reset: () => void) => {
    reset();
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <section ref={sectionRef} id="opensource" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader eyebrow={opensource.eyebrow} title={opensource.title} subtitle={opensource.subtitle} />
          <MagneticButton
            href={allActivityUrl}
            variant="outline"
            target="_blank"
            rel="noreferrer"
            icon={<Icon name="github" size={16} />}
          >
            {opensource.profileLabel}
          </MagneticButton>
        </div>

        {(loading || repos.length > 0) && (
          <div className={cn('mt-12 grid grid-cols-2 gap-3', stats.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                className="relative overflow-hidden rounded-2xl border border-border/60 glass px-5 py-4"
              >
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
                  <Icon name={s.icon} size={13} className="text-accent" />
                  {s.label}
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-fg sm:text-4xl">
                  {loading ? <span className="inline-block h-9 w-16 animate-pulse-slow rounded-lg bg-elevated/70" /> : <CountUp value={s.value} />}
                </div>
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-accent/20 to-accent2/10 blur-2xl" />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && repos.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Segmented id="os-view" value={view} onChange={setView} options={VIEWS} />
            <LayoutGroup id="os-filter">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter contributions">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.id}
                    onClick={() => pickFilter(f.id)}
                    disabled={counts[f.id] === 0}
                    className={cn(
                      'relative rounded-full border px-3.5 py-1.5 text-[13px] transition disabled:cursor-not-allowed disabled:opacity-40',
                      filter === f.id ? 'border-accent/50 text-fg' : 'border-border/60 text-muted hover:text-fg',
                    )}
                  >
                    {filter === f.id && (
                      <motion.span
                        layoutId="os-filter-pill"
                        transition={SPRING}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 to-accent2/20"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {f.label}
                      <span className="rounded-full bg-elevated/80 px-1.5 text-[11px] tabular-nums text-muted">{counts[f.id]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </div>
        )}

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-56 animate-pulse-slow rounded-2xl border border-border/60 bg-surface/40" aria-hidden />
            ))}
          </div>
        )}

        {!loading && repos.length === 0 && (
          <a
            href={allActivityUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-12 flex items-center gap-4 rounded-2xl border border-border/60 glass p-6 transition hover:-translate-y-1 hover:border-accent/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-elevated text-fg">
              <Icon name="github" size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-semibold text-fg">{opensource.fallbackTitle}</span>
              <span className="block text-sm text-muted">{opensource.fallbackBody}</span>
            </span>
            <Icon name="arrow-up-right" size={18} className="text-muted transition group-hover:text-accent" />
          </a>
        )}

        {!loading && repos.length > 0 && (
          <AnimatePresence mode="wait" initial={false}>
            {view === 'repos' ? (
              <motion.div
                key="repos"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <motion.div layout className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredRepos.slice(0, shownRepos).map((r, i) => (
                      <motion.div
                        key={r.name}
                        layout
                        custom={i % opensource.pageSize % 3}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        exit="exit"
                        viewport={{ once: true, amount: 0.15 }}
                      >
                        <RepoCard r={r} maxItems={opensource.maxItemsPerRepo} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
                <MoreButton
                  shown={Math.min(shownRepos, filteredRepos.length)}
                  total={filteredRepos.length}
                  step={opensource.pageSize}
                  noun="repositories"
                  onMore={() => setShownRepos((n) => n + opensource.pageSize)}
                  onLess={() => collapse(() => setShownRepos(opensource.pageSize))}
                />
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Timeline entries={history.slice(0, shownHistory)} />
                <MoreButton
                  shown={Math.min(shownHistory, history.length)}
                  total={history.length}
                  step={opensource.historyPageSize}
                  noun="contributions"
                  onMore={() => setShownHistory((n) => n + opensource.historyPageSize)}
                  onLess={() => collapse(() => setShownHistory(opensource.historyPageSize))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>
    </MotionConfig>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const formatCount = (n: number) => (n >= 10_000 ? compact.format(n) : n.toLocaleString('en-US'));
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatMonth = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

function summary(r: OpenSourceRepo): string {
  return [
    r.prs && `${plural(r.prs, 'PR')}${r.merged ? ` (${r.merged} merged)` : ''}`,
    r.issues && plural(r.issues, 'issue'),
    r.reviews && plural(r.reviews, 'review'),
    r.comments && `${r.comments} discussion${r.comments === 1 ? '' : 's'}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Counts up from zero the first time it scrolls into view. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = formatCount(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => (el.textContent = formatCount(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}

function Segmented<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon: string }[];
}) {
  return (
    <LayoutGroup id={id}>
      <div role="tablist" className="inline-flex rounded-full border border-border/60 glass p-1">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={value === o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              'relative rounded-full px-4 py-1.5 text-sm transition',
              value === o.id ? 'text-white' : 'text-muted hover:text-fg',
            )}
          >
            {value === o.id && (
              <motion.span
                layoutId="pill"
                transition={SPRING}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-accent to-accent2 shadow-glow-accent"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon name={o.icon} size={15} />
              {o.label}
            </span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

function MoreButton({
  shown,
  total,
  step,
  noun,
  onMore,
  onLess,
}: {
  shown: number;
  total: number;
  step: number;
  noun: string;
  onMore: () => void;
  onLess: () => void;
}) {
  if (total <= step) return null;
  const left = total - shown;
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <div className="h-1 w-48 overflow-hidden rounded-full bg-elevated/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
          animate={{ width: `${(shown / total) * 100}%` }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>
      <p className="text-xs tabular-nums text-muted">
        Showing {shown} of {total} {noun}
      </p>
      <motion.button
        type="button"
        onClick={left > 0 ? onMore : onLess}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="group flex items-center gap-2 rounded-full border border-border/60 glass px-5 py-2.5 text-sm text-fg transition hover:border-accent/50"
      >
        {left > 0 ? `Show ${Math.min(step, left)} more` : 'Show less'}
        <Icon
          name="chevron"
          size={16}
          className={cn('text-accent transition-transform duration-300', left > 0 ? 'group-hover:translate-y-0.5' : 'rotate-180')}
        />
      </motion.button>
    </div>
  );
}

function ThreadLine({ it }: { it: OpenSourceItem }) {
  return (
    <a href={it.url} target="_blank" rel="noreferrer" className="group/item flex items-start gap-2">
      <Icon
        name={it.kind === 'issue' ? 'dot' : it.state === 'merged' ? 'git-merge' : 'git-pull-request'}
        size={14}
        className={cn('mt-0.5 shrink-0', STATE_CLASS[it.state])}
      />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[13px] leading-snug text-fg/90 transition group-hover/item:text-accent">
          {it.title}
        </span>
        <span className="mt-0.5 block text-[11px] text-muted">
          {ROLE_LABEL[it.role]} · {it.kind === 'pr' ? 'PR' : 'issue'} #{it.number} ·{' '}
          <span className={STATE_CLASS[it.state]}>{it.state}</span>
        </span>
      </span>
    </a>
  );
}

function RepoCard({ r, maxItems }: { r: OpenSourceRepo; maxItems: number }) {
  const [open, setOpen] = useState(false);
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${mx}px ${my}px, rgb(var(--accent) / 0.14), transparent 70%)`;
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };
  const items = open ? r.items : r.items.slice(0, maxItems);
  const hidden = r.items.length - maxItems;

  return (
    <motion.article
      layout
      onMouseMove={onMove}
      whileHover={{ y: -4 }}
      transition={SPRING}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 glass p-5 transition-colors hover:border-accent/50"
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <a
        href={r.url}
        target="_blank"
        rel="noreferrer"
        className="relative flex items-center gap-2 font-mono text-sm font-semibold text-fg transition hover:text-accent"
      >
        <Icon name="github" size={16} className="shrink-0" />
        <span className="truncate">{r.name}</span>
        <Icon name="arrow-up-right" size={14} className="shrink-0 text-muted" />
      </a>
      {r.description && <p className="relative mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{r.description}</p>}

      <ul className="relative mt-4 border-t border-border/50 pt-4">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <motion.li
              key={it.url}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="pb-2">
                <ThreadLine it={it} />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="relative mt-1 flex items-center gap-1 self-start text-[12px] text-accent transition hover:text-accent2"
        >
          {open ? 'Show less' : `+${hidden} more`}
          <Icon name="chevron" size={14} className={cn('transition-transform duration-300', open && 'rotate-180')} />
        </button>
      )}

      <div className="relative mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-[12px] text-muted">
        {r.language && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent2" style={{ background: LANGUAGE_COLOR[r.language] }} />
            {r.language}
          </span>
        )}
        {r.stars > 0 && (
          <span className="flex items-center gap-1 tabular-nums">
            <Icon name="star" size={13} />
            {formatCount(r.stars)}
          </span>
        )}
        <a
          href={r.activityUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded-full border border-border/60 bg-elevated/40 px-2.5 py-0.5 tabular-nums text-fg/80 transition hover:border-accent/50 hover:text-accent"
        >
          {summary(r)}
        </a>
      </div>
    </motion.article>
  );
}

type HistoryEntry = OpenSourceItem & { repo: string };

/** Every thread, newest first by when it was opened, grouped by month on a vertical line that draws itself in. */
function Timeline({ entries }: { entries: HistoryEntry[] }) {
  const months: { label: string; entries: HistoryEntry[] }[] = [];
  for (const e of entries) {
    const label = formatMonth(e.createdAt);
    if (months.at(-1)?.label !== label) months.push({ label, entries: [] });
    months.at(-1)!.entries.push(e);
  }

  return (
    <div className="relative mx-auto mt-8 max-w-3xl">
      <motion.span
        aria-hidden
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ transformOrigin: '50% 0%' }}
        className="absolute bottom-0 left-[11px] top-2 w-px bg-gradient-to-b from-accent via-accent2/60 to-transparent"
      />
      {months.map((m) => (
        <div key={m.label} className="mb-8">
          <div className="relative flex items-center gap-3 pl-8">
            <span className="absolute left-[5px] h-[13px] w-[13px] rounded-full border-2 border-accent bg-bg" />
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-fg">{m.label}</h3>
            <span className="text-xs tabular-nums text-muted">{plural(m.entries.length, 'contribution')}</span>
          </div>
          <ul className="mt-4 space-y-3">
            <AnimatePresence initial={false}>
              {m.entries.map((e) => (
                <motion.li
                  key={e.url}
                  layout
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="relative pl-8"
                >
                  <span className={cn('absolute left-[8px] top-5 h-[7px] w-[7px] rounded-full', STATE_DOT[e.state])} />
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-xl border border-border/60 glass p-4 transition hover:-translate-y-0.5 hover:border-accent/50"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted">
                      <Icon name="github" size={12} />
                      <span className="text-fg/80">{e.repo}</span>
                      <span>·</span>
                      <time dateTime={e.createdAt}>{formatDate(e.createdAt)}</time>
                    </div>
                    <div className="mt-1.5 flex items-start gap-2">
                      <Icon
                        name={e.kind === 'issue' ? 'dot' : e.state === 'merged' ? 'git-merge' : 'git-pull-request'}
                        size={15}
                        className={cn('mt-0.5 shrink-0', STATE_CLASS[e.state])}
                      />
                      <span className="text-sm leading-snug text-fg transition group-hover:text-accent">{e.title}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 pl-6 text-[11px] text-muted">
                      {ROLE_LABEL[e.role]} · {e.kind === 'pr' ? 'PR' : 'issue'} #{e.number}
                      <span
                        className={cn(
                          'rounded-full border border-border/60 px-2 py-px text-[10px] uppercase tracking-wider',
                          STATE_CLASS[e.state],
                        )}
                      >
                        {e.state}
                      </span>
                    </div>
                  </a>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      ))}
    </div>
  );
}
