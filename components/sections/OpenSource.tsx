'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { MagneticButton } from '@/components/fx/MagneticButton';
import type { OpenSourceRepo } from '@/lib/types';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Public repositories with my pull requests, found automatically by /api/opensource
 * (GitHub search, fetched server-side and cached). Nothing is listed by hand.
 */
export function OpenSource() {
  const { opensource } = data;
  const [repos, setRepos] = useState<OpenSourceRepo[] | null>(null);
  const allPrsUrl = `https://github.com/pulls?q=${encodeURIComponent(`is:pr author:${opensource.githubUser}`)}`;

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
          href={allPrsUrl}
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
            <div key={i} className="h-40 animate-pulse-slow rounded-2xl border border-border/60 bg-surface/40" aria-hidden />
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
            href={allPrsUrl}
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
        <Icon name="arrow-up-right" size={14} className="shrink-0 text-muted transition group-hover:text-accent" />
      </a>
      {r.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{r.description}</p>}

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
          href={r.prsUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1 rounded-full border border-border/60 bg-elevated/40 px-2.5 py-0.5 tabular-nums text-fg/80 transition hover:border-accent/50 hover:text-accent"
        >
          <Icon name={r.merged ? 'git-merge' : 'git-pull-request'} size={13} />
          {r.total} PR{r.total === 1 ? '' : 's'}
          {r.merged > 0 && <span className="text-success">· {r.merged} merged</span>}
        </a>
      </div>
    </article>
  );
}
