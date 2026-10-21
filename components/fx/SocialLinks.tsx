'use client';

import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';

/** Profile links (GitHub, LinkedIn, …) from meta.json `socials`. */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {data.meta.socials.map((s) => {
        const external = !s.href.startsWith('mailto:');
        return (
          <a
            key={s.label}
            href={s.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            aria-label={s.label}
            data-cursor="hover"
            className="group inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3.5 py-2 text-sm text-muted transition hover:-translate-y-0.5 hover:border-accent/50 hover:text-fg"
          >
            <Icon name={s.icon} size={16} className="text-accent transition group-hover:text-accent2" />
            {s.label}
          </a>
        );
      })}
    </div>
  );
}
