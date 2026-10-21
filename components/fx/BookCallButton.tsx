'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { MagneticButton } from '@/components/fx/MagneticButton';
import { cn } from '@/lib/utils';

type Props = {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Render a plain full-width button (mobile menu) instead of a MagneticButton. */
  plain?: boolean;
  onOpen?: () => void;
};

/** True when meta.json has a `booking` block (the button then always shows). */
export const hasBooking = Boolean(data.meta.booking);

const EASE = [0.16, 1, 0.3, 1] as const;
const DURATIONS = [15, 30, 45, 60];

/** "Book a call" — opens a picker to schedule on Google Meet, Microsoft Teams or Zoom. */
export function BookCallButton({ variant = 'primary', size = 'md', className, plain, onOpen }: Props) {
  const { booking, nav } = data.meta;
  const [open, setOpen] = useState(false);

  if (!booking) {
    return plain ? (
      <a href={nav.cta.href} onClick={onOpen} className={className}>
        {nav.cta.label}
        <Icon name="arrow" size={16} />
      </a>
    ) : (
      <MagneticButton href={nav.cta.href} variant={variant} size={size} className={className} icon={<Icon name="arrow" size={14} />}>
        {nav.cta.label}
      </MagneticButton>
    );
  }

  const show = () => {
    onOpen?.();
    setOpen(true);
  };
  const icon = <Icon name="calendar" size={size === 'sm' ? 14 : 16} />;

  return (
    <>
      {plain ? (
        <button type="button" onClick={show} className={className}>
          {booking.label}
          {icon}
        </button>
      ) : (
        <MagneticButton onClick={show} variant={variant} size={size} className={className} icon={icon}>
          {booking.label}
        </MagneticButton>
      )}
      <BookingDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ---------- helpers ---------- */

/** Next weekday at 11:00 local time, as a `datetime-local` value. */
function defaultStart(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  d.setHours(11, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 20261022T053000Z — the format Google Calendar expects. */
const gcalStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

type Platform = {
  id: string;
  name: string;
  hint: string;
  color: string;
  href: string;
  /** Zoom can't be pre-filled by URL, so the invite text is copied instead. */
  copy?: string;
};

function buildPlatforms(start: Date, minutes: number, topic: string): Platform[] {
  const { person, booking } = data.meta;
  const end = new Date(start.getTime() + minutes * 60_000);
  const title = booking?.eventTitle ?? `Call with ${person.name}`;
  const subject = topic ? `${title}: ${topic}` : title;
  const details = `${topic ? `Topic: ${topic}\n\n` : ''}Booked from ${data.meta.site.url}`;
  const when = start.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  const google = new URLSearchParams({
    action: 'TEMPLATE',
    text: subject,
    details,
    dates: `${gcalStamp(start)}/${gcalStamp(end)}`,
    add: person.email,
    vcon: 'meet',
  });
  const teams = new URLSearchParams({
    subject,
    attendees: person.email,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    content: details,
  });

  return [
    {
      id: 'meet',
      name: 'Google Meet',
      hint: 'Opens Google Calendar with a Meet link and the invite filled in.',
      color: '#00897B',
      href: `https://calendar.google.com/calendar/render?${google.toString()}`,
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      hint: 'Opens a new Teams meeting with the invite filled in.',
      color: '#5B5FC7',
      href: `https://teams.microsoft.com/l/meeting/new?${teams.toString()}`,
    },
    {
      id: 'zoom',
      name: 'Zoom',
      hint: `Opens the Zoom scheduler. Invite details are copied — add ${person.email} as invitee.`,
      color: '#2D8CFF',
      href: 'https://zoom.us/meeting/schedule',
      copy: `${subject}\nWhen: ${when} (${minutes} min)\nInvitee: ${person.email}\n\n${details}`,
    },
  ];
}

/* ---------- dialog ---------- */

function BookingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { booking } = data.meta;
  const [mounted, setMounted] = useState(false);
  const [start, setStart] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [topic, setTopic] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setStart((s) => s || defaultStart());
    setShowSlots(false);
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

  const startDate = useMemo(() => (start ? new Date(start) : null), [start]);
  const valid = Boolean(startDate && !Number.isNaN(startDate.getTime()));
  const platforms = useMemo(
    () => (valid && startDate ? buildPlatforms(startDate, minutes, topic.trim()) : []),
    [valid, startDate, minutes, topic]
  );
  const slotsUrl = booking?.embedUrl || booking?.url;

  if (!mounted || !booking) return null;

  const pick = async (p: Platform) => {
    if (!p.copy) return;
    try {
      await navigator.clipboard.writeText(p.copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {}
  };

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
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-2xl border border-border/60 bg-surface shadow-2xl sm:rounded-2xl',
              showSlots ? 'h-[92svh] max-w-4xl sm:h-[85vh]' : 'max-w-lg'
            )}
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
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="rounded-full border border-border/60 bg-elevated/60 p-1.5 text-muted transition hover:border-accent/50 hover:text-fg"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            {showSlots && booking.embedUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowSlots(false)}
                  className="flex items-center gap-1.5 border-b border-border/40 px-5 py-2.5 text-left text-xs text-muted transition hover:text-fg"
                >
                  <Icon name="arrow-right" size={12} className="rotate-180" /> Other ways to book
                </button>
                {/* Google's booking page renders on a white background in both themes. */}
                <iframe src={booking.embedUrl} title={booking.label} className="h-full w-full flex-1 border-0 bg-white" loading="lazy" />
              </>
            ) : (
              <div className="overflow-y-auto px-5 py-5">
                {slotsUrl && (
                  <a
                    href={booking.embedUrl ? undefined : booking.url}
                    target={booking.embedUrl ? undefined : '_blank'}
                    rel="noreferrer"
                    onClick={(e) => {
                      if (!booking.embedUrl) return;
                      e.preventDefault();
                      setShowSlots(true);
                    }}
                    className="mb-5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 transition hover:border-accent/70"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-fg">Pick from my open slots</span>
                      <span className="block text-xs text-muted">Google Calendar · only shows times I&apos;m free</span>
                    </span>
                    <Icon name="arrow-right" size={16} className="text-accent" />
                  </a>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Date &amp; time (your time zone)</span>
                    <input
                      type="datetime-local"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-border/60 bg-elevated/60 px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent/60 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </label>
                  <div>
                    <span className="text-xs font-medium text-muted">Length</span>
                    <div className="mt-1.5 flex gap-1.5">
                      {DURATIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMinutes(m)}
                          aria-pressed={minutes === m}
                          className={cn(
                            'flex-1 rounded-xl border px-3 py-2.5 text-sm tabular-nums transition',
                            minutes === m
                              ? 'border-accent/60 bg-accent/15 text-fg'
                              : 'border-border/60 bg-elevated/60 text-muted hover:text-fg'
                          )}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <label className="mt-3 block">
                  <span className="text-xs font-medium text-muted">Topic (optional)</span>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Lead DevOps role at Acme"
                    maxLength={120}
                    className="mt-1.5 w-full rounded-xl border border-border/60 bg-elevated/60 px-3 py-2.5 text-sm text-fg outline-none transition placeholder:text-muted/70 focus:border-accent/60"
                  />
                </label>

                <div className="mt-5 text-xs font-medium text-muted">Choose where to meet</div>
                <div className="mt-2 grid grid-cols-1 gap-2.5">
                  {platforms.map((p, i) => (
                    <motion.a
                      key={p.id}
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => pick(p)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.35, ease: EASE }}
                      whileHover={{ y: -2 }}
                      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-elevated/40 px-4 py-3 transition-colors hover:border-accent/50"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ background: p.color }}
                      >
                        <Icon name="video" size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-fg">{p.name}</span>
                        <span className="block text-xs leading-snug text-muted">{p.hint}</span>
                      </span>
                      <Icon name="arrow-up-right" size={16} className="shrink-0 text-muted transition group-hover:text-accent" />
                    </motion.a>
                  ))}
                  {!valid && <p className="text-xs text-warn">Pick a date and time to continue.</p>}
                </div>

                <p className="mt-4 text-xs text-muted" aria-live="polite">
                  {copied
                    ? 'Invite details copied — paste them into Zoom.'
                    : `Your calendar opens with the invite ready — just press Save/Send and ${data.meta.person.name.split(' ')[0]} gets it.`}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
