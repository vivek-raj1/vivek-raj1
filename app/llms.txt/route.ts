import { data } from '@/lib/data';

export const dynamic = 'force-static';

/** llms.txt: a plain-text summary for AI search tools, built from the same data as the page so it can't drift. */
export function GET() {
  const { meta, about, experience, projects, research } = data;
  const socials = meta.socials.filter((s) => s.href.startsWith('http'));
  const body = [
    `# ${meta.person.name}`,
    `> ${meta.site.description}`,
    `Also known as: ${meta.person.alternateNames?.join(', ')}. Location: ${meta.person.location}.`,
    '## About',
    about.paragraphs.join('\n\n'),
    '## Experience',
    experience.items.map((i) => `- ${i.role}, ${i.company} (${i.start} – ${i.end})`).join('\n'),
    '## Projects',
    projects.items.map((p) => `- ${p.name}: ${p.summary}`).join('\n'),
    '## Research reading list',
    research.items.map((p) => `- [${p.title}](${p.url}) — ${p.org}, ${p.venue} ${p.year}. ${p.relevance}`).join('\n'),
    '## Links',
    [`- [Website](${meta.site.url}/)`, ...socials.map((s) => `- [${s.label}](${s.href})`)].join('\n'),
  ].join('\n\n');

  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
