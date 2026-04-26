'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { Reveal } from '@/components/fx/Reveal';
import { cn, toneToClass } from '@/lib/utils';

export function Projects() {
  const { projects } = data;
  return (
    <section id="projects" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeader eyebrow={projects.eyebrow} title={projects.title} subtitle={projects.subtitle} />

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.items.map((p, i) => (
          <Reveal key={p.id} kind="slideUp" delay={(i % 3) * 0.08} className="h-full">
            <ProjectCard p={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ p }: { p: (typeof data.projects.items)[number] }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 glass p-6 transition hover:border-accent/60 hover:shadow-glow-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-accent2/25',
            toneToClass[p.tone]
          )}
        >
          <Icon name={p.icon} size={20} />
        </div>
        <span className="rounded-full border border-border/60 bg-elevated/50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          {p.category}
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl font-semibold text-fg">{p.name}</h3>
      <p className="mt-2 text-sm text-muted">{p.summary}</p>

      <ul className="mt-4 space-y-1.5">
        {p.impact.map((i, idx) => (
          <li key={idx} className="flex items-center gap-2 font-mono text-[11px] text-fg/90">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15">
              <Icon name="check" size={10} className="text-accent" />
            </span>
            {i}
          </li>
        ))}
      </ul>

      <motion.div
        initial={false}
        animate={{ height: hover ? 'auto' : 0, opacity: hover ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="mt-4 border-t border-border/50 pt-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted">highlights</div>
          <ul className="mt-2 space-y-1.5">
            {p.highlights.map((h, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-muted">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent2" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span
              key={s}
              className="rounded-md border border-border/60 bg-elevated/40 px-2 py-0.5 font-mono text-[10px] text-fg/80"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl opacity-0 transition group-hover:opacity-100" />
    </motion.article>
  );
}
