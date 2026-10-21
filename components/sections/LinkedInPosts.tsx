'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { toEmbedUrl } from '@/lib/linkedin';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { MagneticButton } from '@/components/fx/MagneticButton';

const EASE = [0.16, 1, 0.3, 1] as const;
const POST_HEIGHT = 560;

/**
 * Latest LinkedIn posts. Post ids come from /api/linkedin (public profile, fetched server-side and cached);
 * if that finds nothing, the manual list in linkedin.json is used. Posts render via LinkedIn's official embed.
 */
export function LinkedInPosts() {
  const { linkedin } = data;
  const auto = Boolean(linkedin.autoFetch?.enabled);
  const manual = linkedin.posts.map((p) => toEmbedUrl(p.url)).filter((u): u is string => Boolean(u));
  const [fetched, setFetched] = useState<string[] | null>(auto ? null : []);

  useEffect(() => {
    if (!auto) return;
    let cancelled = false;
    fetch('/api/linkedin/')
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((j: { posts?: string[] }) => {
        if (!cancelled) setFetched((j.posts ?? []).map((id) => toEmbedUrl(id)).filter((u): u is string => Boolean(u)));
      })
      .catch(() => !cancelled && setFetched([]));
    return () => {
      cancelled = true;
    };
  }, [auto]);

  if (!auto && manual.length === 0) return null;

  const loading = fetched === null;
  const posts = (fetched && fetched.length > 0 ? fetched : manual).slice(0, 3);

  return (
    <section id="linkedin" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader eyebrow={linkedin.eyebrow} title={linkedin.title} subtitle={linkedin.subtitle} />
        <MagneticButton
          href={linkedin.profileUrl}
          variant="outline"
          target="_blank"
          rel="noreferrer"
          icon={<Icon name="linkedin" size={16} />}
        >
          {linkedin.followLabel}
        </MagneticButton>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && posts.length === 0
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse-slow rounded-2xl border border-border/60 bg-surface/40"
                style={{ height: POST_HEIGHT }}
                aria-hidden
              />
            ))
          : posts.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                whileHover={{ y: -4 }}
                className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-colors hover:border-accent/50"
              >
                {/* LinkedIn's embed is always light; the white card keeps it seamless in dark mode. */}
                <iframe
                  src={src}
                  title={`LinkedIn post ${i + 1}`}
                  height={POST_HEIGHT}
                  className="block w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </motion.div>
            ))}

        {!loading && posts.length === 0 && (
          <a
            href={linkedin.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-border/60 glass p-6 transition hover:-translate-y-1 hover:border-accent/50 md:col-span-2 lg:col-span-3"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2] text-white">
              <Icon name="linkedin" size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-semibold text-fg">{linkedin.fallbackTitle}</span>
              <span className="block text-sm text-muted">{linkedin.fallbackBody}</span>
            </span>
            <Icon name="arrow-up-right" size={18} className="text-muted transition group-hover:text-accent" />
          </a>
        )}
      </div>
    </section>
  );
}
