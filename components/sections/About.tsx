'use client';

import { motion } from 'framer-motion';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { Reveal, StaggerGroup } from '@/components/fx/Reveal';
import { DevOpsFloatingIcons } from '@/components/fx/DevOpsFloatingIcons';

export function About() {
  const { about } = data;
  const philosophyHeading = about.philosophyTitle ?? 'Philosophy';

  return (
    <section id="about" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeader
        eyebrow={about.eyebrow}
        title={
          <span>
            {about.title.split(' ').slice(0, -4).join(' ')}{' '}
            <span className="text-gradient">{about.title.split(' ').slice(-4).join(' ')}</span>
          </span>
        }
      />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} kind="fadeBlur" delay={i * 0.05}>
                <p className="text-fg/90">{p}</p>
              </Reveal>
            ))}
          </div>

          <StaggerGroup className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {about.highlights.map((h) => (
              <motion.div
                key={h.title}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface/30 p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_20px_50px_-24px_rgb(var(--accent)/0.25)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-accent2/20 text-accent ring-1 ring-border/60">
                    <Icon name={h.icon} size={20} />
                  </div>
                  <div className="text-sm font-semibold tracking-tight text-fg">{h.title}</div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{h.body}</p>
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-transparent to-accent2/[0.08]" />
                </div>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>

        <div className="relative lg:col-span-5">
          <Reveal kind="slideUp">
            <div className="relative z-10 overflow-hidden rounded-2xl border border-border/50 glass-strong p-6 shadow-[0_0_0_1px_rgb(var(--border)/0.35)_inset]">
              <DevOpsFloatingIcons />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted">Core pillars</div>
                  <span className="rounded-full border border-border/60 bg-elevated/50 px-2.5 py-0.5 text-[10px] font-mono text-muted">
                    self-assessed
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted/90">Depth across platform disciplines — not a scorecard.</p>
                <div className="mt-6 space-y-5">
                  {about.pillars.map((p, i) => (
                    <PillarBar key={p.label} label={p.label} percent={p.percent} delay={0.08 + i * 0.06} />
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-accent2/10 blur-3xl" />
            </div>
          </Reveal>

          <Reveal kind="slideUp" delay={0.12}>
            <div className="relative z-10 mt-6 overflow-hidden rounded-2xl border border-border/50 bg-surface/40 p-6 backdrop-blur-md">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted">{philosophyHeading}</div>
                <span className="text-[10px] text-muted/80">{about.philosophy.length} principles</span>
              </div>
              <ul className="mt-5 space-y-3">
                {about.philosophy.map((line, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-border/50 hover:bg-elevated/40"
                  >
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent2/15 font-mono text-[11px] font-semibold text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm leading-relaxed text-fg/90">{line}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PillarBar({ label, percent, delay }: { label: string; percent: number; delay: number }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-medium tracking-tight text-fg">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-muted">{percent}%</span>
      </div>
      <div className="relative mt-2.5 h-2 overflow-hidden rounded-full bg-elevated ring-1 ring-border/40">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 1.05, delay, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full rounded-full bg-gradient-to-r from-accent via-accent to-accent2"
        >
          <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] bg-[length:200%_100%]" />
        </motion.div>
      </div>
    </div>
  );
}
