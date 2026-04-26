'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function GsapSmooth() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const strength = parseFloat(el.dataset.parallax || '0.2');
        gsap.to(el, {
          yPercent: -strength * 50,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
