'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';

export function ViewCounter() {
  const { enabled, label } = data.ui.viewCounter;
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // Unique visitors, counted on the server (/api/views) by hashed IP: a repeat visit from
    // the same IP doesn't add, and the total never goes down.
    let cancelled = false;
    fetch('/api/views/', { method: 'POST', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { count?: number } | null) => {
        if (!cancelled && typeof d?.count === 'number') setCount(d.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled || count === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3 py-1.5 text-xs text-muted"
      aria-label={`${label}: ${count}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="relative h-2 w-2 rounded-full bg-success" />
      </span>
      <Icon name="eye" size={12} className="text-muted" />
      <span className="tabular-nums text-fg">{count.toLocaleString()}</span>
      <span>{label}</span>
    </motion.div>
  );
}
