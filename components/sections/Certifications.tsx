'use client';

import { motion } from 'framer-motion';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { Reveal, StaggerGroup } from '@/components/fx/Reveal';
import { cn, toneToClass } from '@/lib/utils';

export function Certifications() {
  const { certifications } = data;
  return (
    <section id="certifications" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeader
        eyebrow={certifications.eyebrow}
        title={certifications.title}
        subtitle={certifications.subtitle}
      />

      <StaggerGroup className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.awards.map((a) => (
          <motion.div
            key={a.title}
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
            }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 glass p-5 transition hover:-translate-y-0.5 hover:border-accent/60"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-accent2/25',
                  toneToClass[a.tone]
                )}
              >
                <Icon name={a.icon} size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
                    Award
                  </span>
                  <span className="font-mono text-[10px] text-muted">{a.org} · {a.year}</span>
                </div>
                <div className="mt-1.5 text-sm font-semibold text-fg">{a.title}</div>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">{a.body}</p>
            <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-accent/15 blur-2xl opacity-0 transition group-hover:opacity-100" />
          </motion.div>
        ))}

        {certifications.certifications.map((c) => (
          <motion.div
            key={c.name}
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
            }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 glass p-5 transition hover:-translate-y-0.5 hover:border-accent2/60"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
                  c.status === 'earned'
                    ? 'from-success/25 to-accent2/25 text-success'
                    : 'from-warn/25 to-accent/25 text-warn'
                )}
              >
                <Icon name={c.status === 'earned' ? 'check' : 'activity'} size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]',
                      c.status === 'earned'
                        ? 'bg-success/15 text-success'
                        : 'bg-warn/15 text-warn'
                    )}
                  >
                    {c.status === 'earned' ? 'Cert · earned' : 'Cert · in progress'}
                  </span>
                  <span className="font-mono text-[10px] text-muted">{c.issuer}</span>
                </div>
                <div className="mt-1.5 text-sm font-semibold text-fg">{c.name}</div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-accent2/15 blur-2xl opacity-0 transition group-hover:opacity-100" />
          </motion.div>
        ))}
      </StaggerGroup>

      <Reveal kind="slideUp" delay={0.1}>
        <div className="relative mt-16">
          {/* divider with label */}
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border/70 to-border/40" />
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-elevated/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              <Icon name="graduation-cap" size={12} className="text-accent2" />
              Education
            </div>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border/70 to-border/40" />
          </div>

          <div className="relative mt-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-accent2/[0.06] via-surface/40 to-accent/[0.06] p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent2/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
            />

            <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.education.map((e) => (
                <div
                  key={e.degree}
                  className="relative rounded-xl border border-border/50 bg-surface/50 p-4 backdrop-blur-sm transition hover:border-accent2/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent2/25 to-accent/20 text-accent2">
                      <Icon name="graduation-cap" size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-fg">{e.degree}</div>
                      <div className="mt-0.5 text-xs text-muted">{e.institution}</div>
                      <div className="mt-1.5 font-mono text-[11px] text-accent2">{e.year}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
