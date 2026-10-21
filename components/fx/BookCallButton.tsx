'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { MagneticButton } from '@/components/fx/MagneticButton';

type Props = {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Render a plain full-width link (mobile menu) instead of a MagneticButton. */
  plain?: boolean;
  onOpen?: () => void;
};

/** True once meta.json `booking` has a Google Calendar link. */
export const hasBooking = Boolean(data.meta.booking?.url || data.meta.booking?.embedUrl);

/**
 * "Book a call" — opens the Google Calendar appointment page from meta.json `booking`.
 * With `embedUrl` it shows the booking page in a modal; with only `url` it opens a new tab;
 * with neither it falls back to the navbar CTA (email).
 */
export function BookCallButton({ variant = 'primary', size = 'md', className, plain, onOpen }: Props) {
  const { booking, nav } = data.meta;
  const [open, setOpen] = useState(false);

  const configured = hasBooking;
  const label = configured ? booking!.label : nav.cta.label;
  const icon = <Icon name={configured ? 'calendar' : 'arrow'} size={size === 'sm' ? 14 : 16} />;

  const linkProps: { href?: string; target?: string; rel?: string; onClick?: () => void } = !configured
    ? { href: nav.cta.href }
    : booking!.embedUrl
      ? { onClick: () => { onOpen?.(); setOpen(true); } }
      : { href: booking!.url, target: '_blank', rel: 'noreferrer' };

  return (
    <>
      {plain ? (
        linkProps.href ? (
          <a
            href={linkProps.href}
            target={linkProps.target}
            rel={linkProps.rel}
            onClick={onOpen}
            className={className}
          >
            {label}
            {icon}
          </a>
        ) : (
          <button type="button" onClick={linkProps.onClick} className={className}>
            {label}
            {icon}
          </button>
        )
      ) : (
        <MagneticButton {...linkProps} variant={variant} size={size} className={className} icon={icon}>
          {label}
        </MagneticButton>
      )}
      {booking?.embedUrl && <BookingModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { booking } = data.meta;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !booking?.embedUrl) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="booking-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-bg/70 backdrop-blur-md sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={booking.label}
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[92svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-border/60 bg-surface shadow-2xl sm:h-[85vh] sm:rounded-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border/40 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-accent2/25 text-accent">
                  <Icon name="calendar" size={18} />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold text-fg">{booking.label}</div>
                  {booking.note && <div className="truncate text-xs text-muted">{booking.note}</div>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {booking.url && (
                  <a
                    href={booking.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden items-center gap-1 rounded-full border border-border/60 bg-elevated/60 px-3 py-1.5 text-xs text-muted transition hover:border-accent/50 hover:text-fg sm:inline-flex"
                  >
                    Open in new tab <Icon name="arrow-up-right" size={12} />
                  </a>
                )}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="rounded-full border border-border/60 bg-elevated/60 p-1.5 text-muted transition hover:border-accent/50 hover:text-fg"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
            {/* Google's booking page renders on a white background in both themes. */}
            <iframe
              src={booking.embedUrl}
              title={booking.label}
              className="h-full w-full flex-1 border-0 bg-white"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
