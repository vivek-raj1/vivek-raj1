'use client';

import { AnimatePresence, LayoutGroup, MotionConfig, motion, type Variants } from 'framer-motion';
import { useMemo, useState } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { cn } from '@/lib/utils';
import type { ResearchPaper } from '@/lib/types';

const EASE = [0.16, 1, 0.3, 1] as const;
const ALL = '__all';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: EASE } }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
};

/** Reading list from public/data/research.json; topic chips are built from the papers, so adding one needs no code. */
export function Research() {
  const { research } = data;
  const [topic, setTopic] = useState<string>(ALL);

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of research.items) counts.set(p.topic, (counts.get(p.topic) ?? 0) + 1);
    return [...counts];
  }, [research.items]);
  const papers = topic === ALL ? research.items : research.items.filter((p) => p.topic === topic);

  return (
    <MotionConfig reducedMotion="user">
      <section id="research" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-28 sm:px-6">
        <SectionHeader eyebrow={research.eyebrow} title={research.title} subtitle={research.subtitle} />

        <LayoutGroup id="research-topics">
          <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter papers by topic">
            {[[ALL, research.items.length] as const, ...topics].map(([id, count]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={topic === id}
                onClick={() => setTopic(id)}
                className={cn(
                  'relative rounded-md border px-3 py-1.5 text-[13px] transition',
                  topic === id ? 'border-accent/60 text-fg' : 'border-border/70 text-muted hover:text-fg',
                )}
              >
                {topic === id && (
                  <motion.span
                    layoutId="research-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    className="absolute inset-0 rounded-md bg-accent/10"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {id === ALL ? research.allLabel : id}
                  <span className="tabular-nums text-[11px] text-muted">{count}</span>
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        <motion.ul layout className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {papers.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                custom={i % 4}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                exit="exit"
                viewport={{ once: true, amount: 0.2 }}
              >
                <PaperCard p={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </section>
    </MotionConfig>
  );
}

function PaperCard({ p }: { p: ResearchPaper }) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="group relative flex h-full flex-col rounded-xl border border-border/70 bg-surface/80 p-6 transition-colors hover:border-accent/50"
    >
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
      />
      <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        <span className="rounded border border-border/70 bg-elevated/60 px-2 py-0.5 font-semibold text-fg">{p.org}</span>
        <span className="truncate">
          {p.venue} · {p.year}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-fg">
        <a href={p.url} target="_blank" rel="noreferrer" className="transition hover:text-accent">
          {p.title}
          <span className="absolute inset-0" aria-hidden />
        </a>
      </h3>
      <p className="mt-1 text-[13px] text-muted">{p.authors}</p>

      <p className="mt-4 border-l-2 border-accent/60 pl-3 text-sm leading-relaxed text-fg/85">{p.relevance}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        {p.tags.map((t) => (
          <span key={t} className="rounded border border-border/70 px-2 py-0.5 text-[11px] text-muted">
            {t}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1 text-[13px] font-medium text-accent">
          Read paper
          <Icon
            name="arrow-up-right"
            size={14}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </motion.article>
  );
}
