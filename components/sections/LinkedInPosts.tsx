'use client';

import { motion } from 'framer-motion';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { MagneticButton } from '@/components/fx/MagneticButton';

/**
 * Turns a LinkedIn post link into its official embed URL.
 * Accepts the embed src itself, a link containing a `urn:li:…:<id>`, or a /posts/…-activity-<id>-… link.
 */
function toEmbedUrl(url: string): string | null {
  if (url.includes('linkedin.com/embed/')) return url;
  const urn = url.match(/urn:li:(activity|share|ugcPost):(\d+)/);
  if (urn) return `https://www.linkedin.com/embed/feed/update/urn:li:${urn[1]}:${urn[2]}`;
  const activity = url.match(/activity-(\d{15,})/);
  if (activity) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activity[1]}`;
  return null;
}

/** Latest LinkedIn posts via LinkedIn's own post embeds (no API key needed). Hidden until posts are added. */
export function LinkedInPosts() {
  const { linkedin } = data;
  const posts = linkedin.posts
    .map((p) => ({ ...p, embed: toEmbedUrl(p.url) }))
    .filter((p): p is typeof p & { embed: string } => Boolean(p.embed))
    .slice(0, 3);
  if (posts.length === 0) return null;

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
        {posts.map((p, i) => (
          <motion.div
            key={p.embed}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-colors hover:border-accent/50"
          >
            {/* LinkedIn's embed is always light; the white card keeps it seamless in dark mode. */}
            <iframe
              src={p.embed}
              title={`LinkedIn post ${i + 1}`}
              height={p.height ?? 560}
              className="block w-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
