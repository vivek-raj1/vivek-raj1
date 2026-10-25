'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { MagneticButton } from '@/components/fx/MagneticButton';
import { cn } from '@/lib/utils';
import type { OpenSourceItem, OpenSourceRepo } from '@/lib/types';

const EASE = [0.16, 1, 0.3, 1] as const;

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

/**
 * Public repositories I contributed to (PRs, issues, reviews, comments), found automatically by /api/opensource
 * (GitHub search, fetched server-side and cached). Nothing is listed by hand.
 */
export function OpenSource() {
  const { opensource } = data;
  const [repos, setRepos] = useState<OpenSourceRepo[] | null>(null);
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

  return (
    <section id="opensource" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
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

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse-slow rounded-2xl border border-border/60 bg-surface/40" aria-hidden />
          ))}

        {repos?.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: EASE }}
          >
            <RepoCard r={r} />
          </motion.div>
        ))}

        {!loading && repos.length === 0 && (
          <a
            href={allActivityUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-border/60 glass p-6 transition hover:-translate-y-1 hover:border-accent/50 md:col-span-2 lg:col-span-3"
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
      </div>
    </section>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

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

function RepoCard({ r }: { r: OpenSourceRepo }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-border/60 glass p-5 transition hover:-translate-y-1 hover:border-accent/50">
      <a
        href={r.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 font-mono text-sm font-semibold text-fg transition hover:text-accent"
      >
        <Icon name="github" size={16} className="shrink-0" />
        <span className="truncate">{r.name}</span>
        <Icon name="arrow-up-right" size={14} className="shrink-0 text-muted" />
      </a>
      {r.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{r.description}</p>}

      <ul className="mt-4 space-y-2 border-t border-border/50 pt-4">
        {r.items.map((it) => (
          <li key={it.url}>
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
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-[12px] text-muted">
        {r.language && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent2" />
            {r.language}
          </span>
        )}
        {r.stars > 0 && (
          <span className="flex items-center gap-1 tabular-nums">
            <Icon name="star" size={13} />
            {r.stars.toLocaleString('en-US')}
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
    </article>
  );
}
