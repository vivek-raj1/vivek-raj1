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
  /** Google Calendar appointment schedule. Empty `url`/`embedUrl` falls back to `nav.cta`. */
  booking?: {
    label: string;
    /** Public booking page link (e.g. https://calendar.app.google/…), opened in a new tab. */
    url: string;
    /** Embed src from Google's "Website embed" option; when set, booking opens in a modal. */
    embedUrl?: string;
    note?: string;
    /** Used for the pre-filled Google Calendar event when no appointment page is set. */
    eventTitle?: string;
    eventDetails?: string;
  };
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
    /** Headline numbers shown as chips on the card (e.g. "100+" / "K8s clusters"). */
    metrics?: { value: string; label: string }[];
    /** Top achievements shown on the card; the full list stays in `bullets` (modal). */
    keyWins?: string[];
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
    /** Whole-section fade + scale as it scrolls into view. */
    section?: { duration: number; ease: number[]; y: number; scale: number };
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
    /** 3D pointer tilt on experience / skill cards. */
    cardTilt?: boolean;
    sectionReveal?: boolean;
  };
  density: 'compact' | 'comfortable' | 'spacious';
  corner: 'md' | 'lg' | 'xl' | '2xl';
  sections: {
    order: string[];
    visible: Record<string, boolean>;
  };
  viewCounter: { enabled: boolean; storageKey: string; label: string };
}

export interface LiveData {
  eyebrow: string;
  title: string;
  subtitle: string;
  note: string;
  metrics: {
    title: string;
    unit: string;
    base: number;
    jitter: number;
    decimals: number;
    /** `walk` wanders around `base`; `counter` only goes up. */
    kind: 'walk' | 'counter';
    tone: Tone;
    goodWhen: 'up' | 'down';
  }[];
  terminal: {
    title: string;
    sessions: { prompt: string; cmd: string; out: string[] }[];
  };
  pipeline: {
    title: string;
    service: string;
    stages: { label: string; icon: string }[];
    stepMs: number;
  };
  clusters: { title: string; count: number; caption: string; syncLabel: string };
}

export interface LinkedInData {
  eyebrow: string;
  title: string;
  subtitle: string;
  profileUrl: string;
  followLabel: string;
  /** Newest first. `url`: the post link, or the src from LinkedIn's "Embed this post". Used when auto-fetch finds nothing. */
  posts: { url: string; height?: number }[];
  /** Server-side fetch of the public profile (app/api/linkedin), cached for 6 hours. */
  autoFetch?: { enabled: boolean; publicProfileUrl: string; slug: string; max: number };
  /** Card shown when no posts could be loaded. */
  fallbackTitle: string;
  fallbackBody: string;
}

export interface OpenSourceData {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** PRs, issues, reviews and comments by this GitHub user are found automatically (app/api/opensource), cached for 6 hours. */
  githubUser: string;
  /** `owner/repo` names never shown. */
  excludeRepos: string[];
  /** Also hide every repo owned by `githubUser`, so only other people's projects are listed. */
  excludeOwnRepos: boolean;
  max: number;
  /** Threads (PRs / issues) listed on each repo card. */
  maxItemsPerRepo: number;
  profileLabel: string;
  /** Card shown when no contributions could be loaded. */
  fallbackTitle: string;
  fallbackBody: string;
}

/** One PR or issue the user opened, reviewed or commented on. */
export interface OpenSourceItem {
  title: string;
  url: string;
  number: number;
  kind: 'pr' | 'issue';
  role: 'author' | 'reviewer' | 'commenter';
  state: 'open' | 'closed' | 'merged';
  updatedAt: string;
}

/** One repo from /api/opensource. */
export interface OpenSourceRepo {
  name: string;
  url: string;
  /** All of the user's activity in this repo, as a GitHub search. */
  activityUrl: string;
  description: string;
  stars: number;
  language: string;
  updatedAt: string;
  /** PRs the user opened, and how many of them were merged. */
  prs: number;
  merged: number;
  /** Issues the user opened. */
  issues: number;
  /** Others' PRs reviewed, and others' threads commented on. */
  reviews: number;
  comments: number;
  /** Latest threads, newest first. */
  items: OpenSourceItem[];
}

export interface PortfolioData {
  meta: MetaData;
  hero: HeroData;
  about: AboutData;
  skills: SkillsData;
  experience: ExperienceData;
  projects: ProjectsData;
  certifications: CertificationsData;
  live: LiveData;
  linkedin: LinkedInData;
  opensource: OpenSourceData;
  theme: ThemeData;
  animations: AnimationsData;
  ui: UIData;
}
