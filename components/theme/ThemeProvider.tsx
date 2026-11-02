'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';
import { data } from '@/lib/data';
import type { ThemeData } from '@/lib/types';

type Mode = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

interface ThemeCtx {
  mode: Mode;
  resolved: Resolved;
  accent: string;
  palettes: string[];
  setMode: (m: Mode) => void;
  setAccent: (a: string) => void;
  theme: ThemeData;
}

const Ctx = createContext<ThemeCtx | null>(null);
const STORAGE_KEY = 'vr_theme';
const ACCENT_KEY = 'vr_accent';

function applyVars(theme: ThemeData, resolved: Resolved, accentName: string) {
  const root = document.documentElement;
  const modeVars = theme.modes[resolved];
  Object.entries(modeVars).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
  const palette = theme.palettes[accentName];
  if (palette) {
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent2', palette.accent2);
  }
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = resolved;
  root.dataset.accent = accentName;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vr-theme-update'));
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = data.theme;
  const [mode, setModeState] = useState<Mode>(theme.defaultMode);
  const [accent, setAccentState] = useState<string>(theme.accent);

  const resolved: Resolved = useMemo(() => {
    if (mode !== 'system') return mode;
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [mode]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
      const storedAccent = localStorage.getItem(ACCENT_KEY);
      if (stored) setModeState(stored);
      if (storedAccent) setAccentState(storedAccent);
    } catch {}
  }, []);

  useEffect(() => {
    applyVars(theme, resolved, accent);
  }, [theme, resolved, accent]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyVars(theme, mq.matches ? 'dark' : 'light', accent);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, theme, accent]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch {}
  }, []);

  const setAccent = useCallback((a: string) => {
    setAccentState(a);
    try { localStorage.setItem(ACCENT_KEY, a); } catch {}
  }, []);

  const value = useMemo<ThemeCtx>(
    () => ({
      mode,
      resolved,
      accent,
      palettes: Object.keys(theme.palettes),
      setMode,
      setAccent,
      theme,
    }),
    [mode, resolved, accent, theme, setMode, setAccent]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTheme must be used inside ThemeProvider');
  return c;
}
