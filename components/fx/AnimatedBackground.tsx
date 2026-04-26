'use client';

import { useEffect, useRef } from 'react';
import { data } from '@/lib/data';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainRef = useRef<HTMLCanvasElement>(null);
  const { ui } = data;

  // particle network
  useEffect(() => {
    if (!ui.background.particles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      canvas.style.width = `${canvas.offsetWidth}px`;
      canvas.style.height = `${canvas.offsetHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = ui.background.particleCount;
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2 * dpr,
      vy: (Math.random() - 0.5) * 0.2 * dpr,
      r: (0.6 + Math.random() * 1.4) * dpr,
    }));

    const getColors = () => {
      const root = document.documentElement;
      const a = getComputedStyle(root).getPropertyValue('--accent').trim() || '139 92 246';
      const b = getComputedStyle(root).getPropertyValue('--accent2').trim() || '34 211 238';
      const isDark = root.classList.contains('dark');
      return { a, b, isDark };
    };

    let raf = 0;
    const step = () => {
      const { a, b, isDark } = getColors();
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      const max = 150 * dpr;
      const baseLineA = isDark ? 0.18 : 0.12;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < max) {
            const alpha = (1 - d / max) * baseLineA;
            ctx.strokeStyle = `rgba(${a}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = `rgba(${b}, ${isDark ? 0.6 : 0.45})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [ui.background.particleCount, ui.background.particles]);

  // code rain
  useEffect(() => {
    if (!ui.background.codeRain) return;
    const canvas = rainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const glyphs = ['0', '1', '$', '#', '>', '{', '}', '⎈', '⟁', '⌘', 'λ'];
    let w = 0;
    let h = 0;
    let columns = 0;
    let drops: number[] = [];
    const fontSize = 14;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      canvas.style.width = `${canvas.offsetWidth}px`;
      canvas.style.height = `${canvas.offsetHeight}px`;
      columns = Math.floor(w / (fontSize * dpr));
      drops = Array.from({ length: columns }, () => Math.random() * -h);
    };
    resize();
    window.addEventListener('resize', resize);

    const getAccent = () => {
      const root = document.documentElement;
      const a = getComputedStyle(root).getPropertyValue('--accent').trim() || '139 92 246';
      const b = getComputedStyle(root).getPropertyValue('--accent2').trim() || '34 211 238';
      const isDark = root.classList.contains('dark');
      return { a, b, isDark };
    };

    let last = 0;
    let raf = 0;
    const loop = (t: number) => {
      const dt = t - last;
      if (dt > 68) {
        last = t;
        const { a, b, isDark } = getAccent();
        ctx.fillStyle = isDark ? 'rgba(8,10,16,0.16)' : 'rgba(248,250,252,0.22)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = `${fontSize * dpr}px 'JetBrains Mono', monospace`;
        for (let i = 0; i < columns; i++) {
          const ch = glyphs[(Math.random() * glyphs.length) | 0];
          const x = i * fontSize * dpr;
          const y = drops[i] * fontSize * dpr;
          const tail = Math.random() > 0.975;
          ctx.fillStyle = tail ? `rgba(${b}, ${isDark ? 0.75 : 0.45})` : `rgba(${a}, ${isDark ? 0.35 : 0.22})`;
          ctx.fillText(ch, x, y);
          if (y > h && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [ui.background.codeRain]);

  const mask = ui.background.maskRadius ?? 0.55;
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `radial-gradient(ellipse ${mask * 100}% ${mask * 90}% at 50% 40%, black 0%, rgba(0,0,0,0.65) 60%, transparent 95%)`,
    maskImage: `radial-gradient(ellipse ${mask * 100}% ${mask * 90}% at 50% 40%, black 0%, rgba(0,0,0,0.65) 60%, transparent 95%)`,
  };

  const meshAurora = ui.background.meshAurora ?? true;
  const lightBeams = ui.background.lightBeams ?? true;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {meshAurora && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="mesh-blob a" />
          <div className="mesh-blob b" />
          <div className="mesh-blob c" />
        </div>
      )}

      {lightBeams && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="light-beam a" />
          <div className="light-beam b" />
        </div>
      )}

      {ui.background.gradient && (
        <div className="aurora" style={{ opacity: (ui.background.gradientOpacity ?? 0.5) * 0.5 }} />
      )}

      {ui.background.grid && (
        <div className="absolute inset-0 grid-bg" style={{ opacity: ui.background.gridOpacity }} />
      )}

      {ui.background.codeRain && (
        <canvas ref={rainRef} className="absolute inset-0 h-full w-full opacity-[0.28] dark:opacity-[0.22]" style={maskStyle} />
      )}

      {ui.background.particles && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={maskStyle} />
      )}

      {ui.background.scanlines && (
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)',
          }}
        />
      )}

      {ui.effects.noise && <div className="absolute inset-0 noise opacity-[0.04]" />}

      {/* veils so text always sits on readable surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/55 via-bg/20 to-bg/75" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
