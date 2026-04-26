import meta from '@/public/data/meta.json';
import hero from '@/public/data/hero.json';
import about from '@/public/data/about.json';
import skills from '@/public/data/skills.json';
import experience from '@/public/data/experience.json';
import projects from '@/public/data/projects.json';
import certifications from '@/public/data/certifications.json';
import theme from '@/public/data/theme.json';
import animations from '@/public/data/animations.json';
import ui from '@/public/data/ui.json';
import type { PortfolioData } from './types';

export const data: PortfolioData = {
  meta,
  hero,
  about,
  skills,
  experience,
  projects,
  certifications,
  theme,
  animations,
  ui,
} as PortfolioData;
