'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { MagneticButton } from '@/components/fx/MagneticButton';

export function Footer() {
  const { meta } = data;
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(meta.person.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <footer className="relative mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 glass-strong p-8 sm:p-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent2/20 blur-3xl" />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>

        <div className="relative grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              let&apos;s build something reliable
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-5xl">
              Got a platform to scale <span className="text-gradient">or an SLO to save?</span>
            </h2>
            <p className="mt-4 max-w-xl text-base text-muted">
              I&apos;m open to staff / principal / platform leadership roles, and to collaborations on
              observability, Kubernetes, and AI-for-Ops.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <MagneticButton href={`mailto:${meta.person.email}`} icon={<Icon name="mail" size={14} />}>
                Email me
              </MagneticButton>
              <MagneticButton variant="outline" onClick={copyEmail} icon={<Icon name={copied ? 'check' : 'copy'} size={14} />}>
                {copied ? 'Copied' : meta.person.email}
              </MagneticButton>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border/60 glass p-5">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted">{'channels'}</div>
              <div className="mt-4 flex flex-col gap-2">
                {meta.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="hover"
                    className="group flex items-center justify-between rounded-xl border border-transparent bg-elevated/40 px-4 py-3 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-elevated/70"
                  >
                    <span className="flex items-center gap-3 text-sm">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
                        <Icon name={s.icon} size={14} />
                      </span>
                      {s.label}
                    </span>
                    <Icon name="arrow-up-right" size={14} className="text-muted transition group-hover:text-accent" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-10 flex flex-col items-center justify-between gap-4 text-[11px] text-muted sm:flex-row"
      >
        <div className="flex items-center gap-3 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="uppercase tracking-[0.18em]">All systems operational</span>
          <span aria-hidden className="text-border">|</span>
          <span>
            &copy; {new Date().getFullYear()} {meta.person.name}. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono uppercase tracking-[0.16em]">
          <span>Built with</span>
          <Icon name="heart" size={11} className="text-danger" />
          <span>using</span>Vivek Raj
            <span aria-hidden className="text-border">·</span>
        </div>
      </motion.div>
    </footer>
  );
}
