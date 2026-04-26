'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { mode, setMode, accent, palettes, setAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el?.contains(e.target as Node)) close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const modes: { k: 'light' | 'dark' | 'system'; icon: string; label: string }[] = [
    { k: 'light', icon: 'sun', label: 'Light' },
    { k: 'dark', icon: 'moon', label: 'Dark' },
    { k: 'system', icon: 'system', label: 'System' },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Theme settings"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={toggle}
        className="flex h-10 w-10 items-center justify-center rounded-xl glass text-fg/80 shadow-inner transition hover:text-fg"
      >
        <Icon name={mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'system'} size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden
              className="fixed inset-0 z-40 bg-bg/20 backdrop-blur-[2px]"
              onClick={close}
            />
            <motion.div
              key="panel"
              role="menu"
              aria-label="Theme and accent"
              initial={{ opacity: 0, y: -6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.94 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl glass-strong p-3 shadow-glow-accent ring-1 ring-border/50"
            >
              <div className="mb-2 px-2 text-[10px] uppercase tracking-[0.18em] text-muted">Mode</div>
              <div className="grid grid-cols-3 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.k}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMode(m.k);
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs transition',
                      mode === m.k
                        ? 'bg-accent/20 text-fg ring-1 ring-accent/40 shadow-inner'
                        : 'text-muted hover:bg-elevated/60 hover:text-fg'
                    )}
                  >
                    <Icon name={m.icon} size={16} />
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 mb-2 px-2 text-[10px] uppercase tracking-[0.18em] text-muted">Accent</div>
              <div className="grid grid-cols-4 gap-2 px-2">
                {palettes.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="menuitem"
                    onClick={() => setAccent(p)}
                    aria-label={`Accent ${p}`}
                    className={cn(
                      'relative h-9 overflow-hidden rounded-lg border border-border/60 group',
                      accent === p && 'ring-2 ring-fg/50'
                    )}
                    data-accent={p}
                  >
                    <span
                      className="absolute inset-0"
                      style={{
                        background:
                          p === 'violet'
                            ? 'linear-gradient(135deg,#8b5cf6,#22d3ee)'
                            : p === 'emerald'
                              ? 'linear-gradient(135deg,#10b981,#3b82f6)'
                              : p === 'rose'
                                ? 'linear-gradient(135deg,#f43f5e,#fb923c)'
                                : 'linear-gradient(135deg,#f97316,#ec4899)',
                      }}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
