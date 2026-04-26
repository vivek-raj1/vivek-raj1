'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';

export function ViewCounter() {
  const { enabled, storageKey, label } = data.ui.viewCounter;
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    try {
      const sessionFlag = 'vr_view_counted';
      const raw = localStorage.getItem(storageKey);
      const current = raw ? parseInt(raw, 10) || 0 : 0;
      const alreadyCountedThisSession = sessionStorage.getItem(sessionFlag);
      let next = current;
      if (!alreadyCountedThisSession) {
        next = current + 1;
        localStorage.setItem(storageKey, String(next));
        sessionStorage.setItem(sessionFlag, '1');
      }
      setCount(next);
    } catch {
      setCount(1);
    }
  }, [enabled, storageKey]);

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
        <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
        <span className="relative h-2 w-2 rounded-full bg-success" />
      </span>
      <Icon name="eye" size={12} className="text-muted" />
      <span className="tabular-nums text-fg">{count.toLocaleString()}</span>
      <span>{label}</span>
    </motion.div>
  );
}
