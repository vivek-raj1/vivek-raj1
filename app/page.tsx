import { Navbar } from '@/components/sections/Navbar';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Skills } from '@/components/sections/Skills';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/sections/Projects';
import { Certifications } from '@/components/sections/Certifications';
import { Footer } from '@/components/sections/Footer';
import { GsapSmooth } from '@/components/fx/GsapSmooth';
import { data } from '@/lib/data';

const registry = {
  hero: Hero,
  about: About,
  skills: Skills,
  experience: Experience,
  projects: Projects,
  certifications: Certifications,
  footer: Footer,
} as const;

export default function Page() {
  const { ui } = data;
  return (
    <main className="relative">
      <Navbar />
      <GsapSmooth />
      {ui.sections.order.map((key) => {
        const Comp = registry[key as keyof typeof registry];
        if (!Comp || !ui.sections.visible[key]) return null;
        return <Comp key={key} />;
      })}
    </main>
  );
}
