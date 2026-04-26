'use client';

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { data } from '@/lib/data';
import { Icon } from '@/lib/icons';
import { SectionHeader } from '@/components/fx/SectionHeader';
import { StaggerGroup } from '@/components/fx/Reveal';
import { cn, toneToClass } from '@/lib/utils';
import { useMediaQuery } from '@/lib/use-media-query';
import type { SkillsCategoryItem, SkillsData, Tone } from '@/lib/types';

type Category = SkillsData['categories'][number];
type Skill = SkillsCategoryItem & {
  id: string;
  catId: string;
  catLabel: string;
  catIcon: string;
  accent: Tone;
};

const ALL = '__all';

const pillFade: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 30 },
  },
};

const skillCardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 30, mass: 0.82 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -6,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  },
};

function makeSkillId(categoryId: string, item: SkillsCategoryItem, index: number) {
  return item.id ?? `${categoryId}__${item.name.replace(/\s+/g, '-').toLowerCase()}__${index}`;
}

export function Skills() {
  const { skills } = data;
  const [active, setActive] = useState<string>(ALL);
  const [hovered, setHovered] = useState<string | null>(null);

  const allItems = useMemo<Skill[]>(
    () =>
      skills.categories.flatMap((c) =>
        c.items.map((s, idx) => ({
          ...s,
          id: makeSkillId(c.id, s, idx),
          catId: c.id,
          catLabel: c.label,
          catIcon: c.icon,
          accent: c.accent,
        }))
      ),
    [skills.categories]
  );

  const visible = active === ALL ? allItems : allItems.filter((s) => s.catId === active);
  const defaultFieldLabel = skills.fieldNotesLabel ?? 'Field notes';

  return (
    <motion.section
      id="skills"
      className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 scroll-mt-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -8% 0px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 34, mass: 0.9 }}
    >
      <SectionHeader eyebrow={skills.eyebrow} title={skills.title} subtitle={skills.subtitle} />

      <motion.div
        className="mt-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18, margin: '0px 0px -8% 0px' }}
        transition={{ type: 'spring', stiffness: 280, damping: 32, mass: 0.85, delay: 0.06 }}
      >
        <FilterRail
          categories={skills.categories}
          active={active}
          onChange={setActive}
          totalCount={allItems.length}
          allLabel={skills.allFilterLabel ?? 'All'}
          allIcon={skills.allFilterIcon ?? 'sparkles'}
          pillVariants={pillFade}
        />

        <ul className="mt-6 grid auto-rows-min grid-cols-1 content-start items-start gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((s, idx) => (
              <SkillCard
                key={s.id}
                index={idx}
                variants={skillCardVariants}
                skill={s}
                fieldNotesSectionLabel={s.fieldNotesLabel ?? defaultFieldLabel}
                hovered={hovered === s.id}
                onHover={(v) => setHovered(v ? s.id : null)}
              />
            ))}
          </AnimatePresence>
        </ul>
      </motion.div>
    </motion.section>
  );
}

function FilterRail({
  categories,
  active,
  onChange,
  totalCount,
  allLabel,
  allIcon,
  pillVariants,
}: {
  categories: Category[];
  active: string;
  onChange: (id: string) => void;
  totalCount: number;
  allLabel: string;
  allIcon: string;
  pillVariants: Variants;
}) {
  return (
    <div role="tablist" aria-label="Skill categories" className="lg:sticky lg:top-28 lg:self-start">
      <LayoutGroup id="skills-category-tabs">
        <StaggerGroup
          as="div"
          className="relative -mx-1 flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide px-1 pb-2 lg:mx-0 lg:flex-col lg:flex-wrap lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
          each={0.06}
          delayChildren={0.04}
        >
          <motion.div variants={pillVariants} className="lg:w-full">
            <FilterPill
              id={ALL}
              icon={allIcon}
              label={allLabel}
              count={totalCount}
              active={active === ALL}
              onClick={() => onChange(ALL)}
            />
          </motion.div>
          {categories.map((c) => (
            <motion.div key={c.id} variants={pillVariants} className="lg:w-full">
              <FilterPill
                id={c.id}
                icon={c.icon}
                label={c.label}
                count={c.items.length}
                tone={c.accent}
                active={active === c.id}
                onClick={() => onChange(c.id)}
              />
            </motion.div>
          ))}
        </StaggerGroup>
      </LayoutGroup>
    </div>
  );
}

function FilterPill({
  id,
  icon,
  label,
  count,
  active,
  tone,
  onClick,
}: {
  id: string;
  icon: string;
  label: string;
  count: number;
  active: boolean;
  tone?: Tone;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      data-cursor="hover"
      className={cn(
        'relative inline-flex w-full min-w-0 shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
        'lg:flex lg:justify-start lg:rounded-xl lg:px-3 lg:py-2',
        active
          ? 'border-accent/45 text-fg'
          : 'border-border/55 text-muted hover:border-border hover:text-fg'
      )}
    >
      {active && (
        <motion.span
          layoutId="filter-active-highlight"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-accent/22 via-accent/10 to-accent2/22 ring-1 ring-accent/35 shadow-[0_0_24px_-6px_rgb(var(--accent)/0.45)] lg:rounded-xl"
        />
      )}
      <span
        className={cn(
          'relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-md',
          active ? (tone ? toneToClass[tone] : 'text-accent') : 'text-muted'
        )}
      >
        <Icon name={icon} size={13} />
      </span>
      <span className="relative z-10 truncate">{label}</span>
      <span className="relative z-10 shrink-0 font-mono text-[10px] text-muted/90 tabular-nums">
        {String(count).padStart(2, '0')}
      </span>
      <span className="sr-only">{id}</span>
    </button>
  );
}

function SkillCard({
  skill,
  index,
  fieldNotesSectionLabel,
  hovered,
  onHover,
  variants,
}: {
  skill: Skill;
  index: number;
  fieldNotesSectionLabel: string;
  hovered: boolean;
  onHover: (v: boolean) => void;
  variants: Variants;
}) {
  const reduce = useReducedMotion();
  const isCoarse = useMediaQuery('(pointer: coarse)');
  const tilt = !reduce && !isCoarse;

  const ref = useRef<HTMLLIElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 200, damping: 22 });
  const sy = useSpring(my, { stiffness: 200, damping: 22 });
  const rotateX = useTransform(sy, [0, 1], tilt ? [5, -5] : [0, 0]);
  const rotateY = useTransform(sx, [0, 1], tilt ? [-6, 6] : [0, 0]);
  const auraX = useTransform(sx, (v) => `${v * 100}%`);
  const auraY = useTransform(sy, (v) => `${v * 100}%`);

  const accentToken =
    skill.accent === 'accent2'
      ? '--accent2'
      : skill.accent === 'success'
        ? '--success'
        : skill.accent === 'warn'
          ? '--warn'
          : skill.accent === 'danger'
            ? '--danger'
            : '--accent';
  const auraBg = useMotionTemplate`radial-gradient(360px circle at ${auraX} ${auraY}, rgb(var(${accentToken}) / 0.18), transparent 55%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLLIElement>) => {
    if (!tilt) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handlePointerLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    onHover(false);
  };

  return (
    <motion.li
      ref={ref}
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      style={tilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      onPointerMove={handlePointerMove}
      onMouseEnter={() => onHover(true)}
      onPointerLeave={handlePointerLeave}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      tabIndex={0}
      className={cn(
        'group relative min-h-0 w-full max-w-full self-start overflow-hidden rounded-2xl border border-border/55 bg-surface/35 p-5 outline-none backdrop-blur-md transition-colors',
        'hover:border-accent/55 focus-visible:border-accent/55 focus-visible:ring-2 focus-visible:ring-accent/40'
      )}
    >
      <motion.span
        aria-hidden
        style={{ background: auraBg }}
        className="pointer-events-none absolute inset-0"
      />
      <motion.span
        aria-hidden
        animate={hovered ? { opacity: 1, scale: 1.05 } : { opacity: 0.4, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full blur-3xl"
        style={{ background: `rgb(var(${accentToken}) / 0.28)` }}
      />

      <div className="relative flex items-start gap-3">
        <motion.div
          animate={hovered ? { rotate: -6, scale: 1.06 } : { rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        >
          <RadialDial level={skill.level} tone={skill.accent} animateIn={!reduce} />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[13px] font-semibold text-fg">{skill.name}</p>
            <span
              className={cn(
                'shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]',
                skill.level >= 90
                  ? 'border-success/40 bg-success/10 text-success'
                  : skill.level >= 80
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border/60 bg-elevated/60 text-muted'
              )}
            >
              {skill.level >= 90 ? 'Expert' : skill.level >= 80 ? 'Advanced' : 'Working'}
            </span>
          </div>
          <div className="mt-0.5 inline-flex min-w-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <Icon name={skill.catIcon} size={10} />
            <span className="truncate">{skill.catLabel}</span>
            <span className="shrink-0 text-border">·</span>
            <span className={cn('shrink-0 tabular-nums', toneToClass[skill.accent])}>
              {String(skill.level).padStart(2, '0')}/100
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-3 border-t border-border/40 pt-3">
        <div className="mb-1.5 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted/80">
          <span className="h-1 w-1 rounded-full" style={{ background: `rgb(var(${accentToken}))` }} />
          {fieldNotesSectionLabel}
        </div>
        <p className="text-[12px] leading-relaxed text-muted">{skill.note}</p>
        {skill.fieldBullets && skill.fieldBullets.length > 0 && (
          <ul className="mt-2 space-y-1.5 border-l border-border/50 pl-3">
            {skill.fieldBullets.map((line) => (
              <li key={line} className="text-[11.5px] leading-snug text-muted/95">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  );
}

function RadialDial({
  level,
  tone,
  animateIn,
}: {
  level: number;
  tone: Tone;
  animateIn: boolean;
}) {
  const size = 44;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (level / 100) * c;

  const colorVar = tone === 'accent2' ? 'rgb(var(--accent2))' : 'rgb(var(--accent))';

  return (
    <div className="relative grid h-11 w-11 shrink-0 place-items-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--border))"
          strokeWidth={stroke}
          opacity={0.55}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colorVar}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={animateIn ? { strokeDashoffset: c } : { strokeDashoffset: c - dash }}
          whileInView={{ strokeDashoffset: c - dash }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${colorVar})` }}
        />
      </svg>
      <span className={cn('absolute font-mono text-[10px] font-semibold tabular-nums', toneToClass[tone])}>
        {level}
      </span>
    </div>
  );
}
