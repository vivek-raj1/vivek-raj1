'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { MagneticButton } from '@/components/fx/MagneticButton';

export function Navbar() {
  const { nav, person } = data.meta;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 12));

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={cn(
            'flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-border/60 px-3 py-2 transition-all',
            scrolled ? 'glass-strong shadow-glow-accent' : 'glass'
          )}
        >
          <Link href="#hero" className="flex items-center gap-2 pl-2" data-cursor="hover">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent2 font-display text-sm font-bold text-white shadow-glow-accent">
                {nav.logo}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-bg animate-pulse" />
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold text-fg">{person.name}</div>
              <div className="text-[10px] font-mono text-muted">{nav.tagline}</div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {nav.items.map((i) => (
              <a
                key={i.href}
                href={i.href}
                data-cursor="hover"
                className="group relative rounded-lg px-3 py-1.5 text-sm text-muted transition hover:text-fg"
              >
                <span className="relative z-10">{i.label}</span>
                <span className="absolute inset-0 -z-0 rounded-lg bg-elevated/0 transition group-hover:bg-elevated/80" />
                <span className="absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-accent2 transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden md:block">
              <MagneticButton href={nav.cta.href} size="sm" variant="primary" icon={<Icon name="arrow" size={14} />}>
                {nav.cta.label}
              </MagneticButton>
            </div>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl glass md:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-px w-full bg-fg transition',
                    open && 'translate-y-[6px] rotate-45'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-px w-full bg-fg transition',
                    open && 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-px w-full bg-fg transition',
                    open && '-translate-y-[6px] -rotate-45'
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* mobile overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-40 flex flex-col items-stretch bg-bg/90 backdrop-blur-xl md:hidden"
      >
        <div className="mt-24 flex flex-col gap-3 px-6">
          {nav.items.map((i, idx) => (
            <motion.a
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, x: -16 }}
              animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between rounded-xl border border-border/60 glass px-4 py-4 text-lg"
            >
              <span className="flex items-center gap-3">
                <Icon name={i.icon} size={18} className="text-accent" />
                {i.label}
              </span>
              <Icon name="arrow" size={16} className="text-muted" />
            </motion.a>
          ))}
          <a
            href={nav.cta.href}
            onClick={() => setOpen(false)}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent2 px-4 py-4 text-white"
          >
            {nav.cta.label}
            <Icon name="arrow" size={16} />
          </a>
        </div>
      </motion.div>
    </>
  );
}
