'use client';

import { useEffect } from 'react';

const GAP = 16; // space between the bottom of the navbar and the section's first line

/** Document-relative top in layout space, so entrance transforms (translate/scale) don't skew it. */
function layoutTop(el: HTMLElement): number {
  let top = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
  return top;
}

/** Scroll position that puts the section's content (past its top padding) just under the fixed navbar. */
function targetY(id: string): number | null {
  if (id === 'hero') return 0;
  const el = document.getElementById(id);
  if (!el) return null;
  const nav = document.querySelector('header nav')?.getBoundingClientRect().bottom ?? 0;
  return Math.max(0, layoutTop(el) + parseFloat(getComputedStyle(el).paddingTop) - nav - GAP);
}

/**
 * Nav links scroll so each section's heading sits right below the navbar. Content above can change
 * height while scrolling (reveals, images, fetched data), so the landing spot is re-checked once the
 * scroll settles and nudged if it moved.
 */
export function AnchorScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let run = 0;

    const go = (id: string, smooth: boolean) => {
      const token = ++run;
      let tries = 0;
      const settle = () => {
        if (token !== run) return;
        const y = targetY(id);
        if (y === null) return;
        if (Math.abs(window.scrollY - y) > 2 && tries++ < 4) {
          window.scrollTo({ top: y, behavior: smooth && tries === 1 && !reduce ? 'smooth' : 'instant' });
          if (window.scrollY === y) return; // already there; no scroll event will fire
          window.addEventListener('scrollend', settle, { once: true });
          setTimeout(settle, 1500); // browsers without scrollend
        }
      };
      settle();
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a[href^="#"]');
      const id = a?.getAttribute('href')?.slice(1);
      if (!id || targetY(id) === null) return;
      e.preventDefault();
      history.pushState(null, '', `#${id}`);
      go(id, true);
    };

    // A user scroll cancels any pending correction.
    const cancel = () => run++;

    document.addEventListener('click', onClick);
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    const initial = decodeURIComponent(location.hash.slice(1));
    if (initial) requestAnimationFrame(() => go(initial, false));

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, []);

  return null;
}
