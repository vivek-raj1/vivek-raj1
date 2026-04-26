export type Tone = 'fg' | 'accent' | 'accent2' | 'success' | 'warn' | 'danger';

export interface MetaData {
  site: {
    title: string;
    description: string;
    url: string;
    keywords: string[];
    ogImage: string;
    locale: string;
  };
  person: {
    name: string;
    role: string;
    company: string;
    location: string;
    email: string;
    phone: string;
    initials: string;
    image?: string;
    resume?: string;
    statusLabel: string;
    statusTone: Tone;
  };
  nav: {
    logo: string;
    tagline: string;
    items: { label: string; href: string; icon: string }[];
    cta: { label: string; href: string };
  };
  socials: { label: string; href: string; icon: string }[];
}

export interface HeroData {
  eyebrow: string;
  headline: { text: string; tone: Tone }[];
  subhead: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  profile?: {
    image: string;
    role: string;
    company: string;
    orbitLabels: string[];
  };
  stats: { label: string; value: string; suffix: string; accent: Tone }[];
  terminal: {
    title: string;
    lines: { type: 'prompt' | 'out'; text: string }[];
  };
  metricCards: {
    title: string;
    value: string;
    unit: string;
    delta: string;
    trend: 'up' | 'down' | 'flat';
    series: number[];
  }[];
  badges: { label: string; tone: Tone }[];
}

export interface AboutData {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  highlights: { icon: string; title: string; body: string }[];
  pillars: { label: string; percent: number }[];
  philosophyTitle?: string;
  philosophy: string[];
}

/** One skill line in a category; `note` + optional `fieldBullets` feed the “field notes” UI (labels from JSON). */
export interface SkillsCategoryItem {
  /** Stable key for list reconciliation; falls back to `categoryId + name` if omitted. */
  id?: string;
  name: string;
  level: number;
  note: string;
  /** Override global `fieldNotesLabel` for this row only. */
  fieldNotesLabel?: string;
  /** Extra detail lines (bullets) under the primary `note` — from JSON, not static UI. */
  fieldBullets?: string[];
}

export interface SkillsData {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Section label for the field-notes block on each skill card (e.g. “Field notes”). */
  fieldNotesLabel?: string;
  /** Label for the “show all skills” filter tab (default: All). */
  allFilterLabel?: string;
  /** Icon name for the all-skills tab (default: sparkles). */
  allFilterIcon?: string;
  categories: {
    id: string;
    label: string;
    icon: string;
    accent: Tone;
    items: SkillsCategoryItem[];
  }[];
}

export interface ExperienceData {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: {
    id: string;
    role: string;
    company: string;
    location: string;
    start: string;
    end: string;
    tone: Tone;
    summary: string;
    bullets: string[];
    tags: string[];
  }[];
}

export interface ProjectsData {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: {
    id: string;
    name: string;
    category: string;
    tone: Tone;
    icon: string;
    summary: string;
    impact: string[];
    stack: string[];
    highlights: string[];
  }[];
}

export interface CertificationsData {
  eyebrow: string;
  title: string;
  subtitle: string;
  awards: { title: string; org: string; year: string; body: string; icon: string; tone: Tone }[];
  education: { degree: string; institution: string; year: string }[];
  certifications: { name: string; issuer: string; status: 'earned' | 'in-progress' }[];
}

export interface ThemeData {
  defaultMode: 'dark' | 'light' | 'system';
  accent: string;
  glow: 'low' | 'med' | 'high';
  modes: {
    dark: Record<string, string>;
    light: Record<string, string>;
  };
  palettes: Record<string, { accent: string; accent2: string }>;
}

export interface AnimationsData {
  reveal: {
    fade: { duration: number; ease: number[] };
    fadeBlur: { duration: number; ease: number[]; blur: number };
    slideUp: { duration: number; ease: number[]; y: number };
    stagger: { each: number; delayChildren: number };
  };
  hero: {
    wordStagger: number;
    wordDuration: number;
    terminalTypeMs: number;
    terminalLinePauseMs: number;
    floatDuration: number;
  };
  scroll: { parallaxStrength: number; pinOffset: number };
  cursor: { enabled: boolean; size: number; ringSize: number; smoothing: number };
  magnetic: { strength: number; radius: number };
}

export interface UIData {
  mode: 'minimal' | 'balanced' | 'ultra';
  background: {
    kind: string;
    grid: boolean;
    gradient: boolean;
    particles: boolean;
    particleCount: number;
    gridOpacity: number;
    gradientOpacity: number;
    scanlines?: boolean;
    codeRain?: boolean;
    meshAurora?: boolean;
    lightBeams?: boolean;
    maskRadius?: number;
  };
  effects: {
    glassmorphism: boolean;
    neonGlow: boolean;
    animatedBorders: boolean;
    cursorGlow: boolean;
    magneticButtons: boolean;
    scrollProgress: boolean;
    pageTransitions: boolean;
    noise: boolean;
  };
  density: 'compact' | 'comfortable' | 'spacious';
  corner: 'md' | 'lg' | 'xl' | '2xl';
  sections: {
    order: string[];
    visible: Record<string, boolean>;
  };
  viewCounter: { enabled: boolean; storageKey: string; label: string };
}

export interface PortfolioData {
  meta: MetaData;
  hero: HeroData;
  about: AboutData;
  skills: SkillsData;
  experience: ExperienceData;
  projects: ProjectsData;
  certifications: CertificationsData;
  theme: ThemeData;
  animations: AnimationsData;
  ui: UIData;
}
