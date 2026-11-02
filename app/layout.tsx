import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { data } from '@/lib/data';
import { CursorGlow } from '@/components/fx/CursorGlow';
import { ScrollProgress } from '@/components/fx/ScrollProgress';
import { AnimatedBackground } from '@/components/fx/AnimatedBackground';

const { meta, skills } = data;
const [firstName, ...rest] = meta.person.name.split(' ');
const ogImage = { url: meta.site.ogImage, width: 1200, height: 630, alt: meta.site.title };

// Favicon, Apple touch icon and manifest come from the app/ file conventions (icon.png, apple-icon.png, favicon.ico, manifest.ts).
export const metadata: Metadata = {
  metadataBase: new URL(meta.site.url),
  title: meta.site.title,
  description: meta.site.description,
  keywords: meta.site.keywords,
  authors: [{ name: meta.person.name, url: meta.site.url }],
  creator: meta.person.name,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    title: meta.site.title,
    description: meta.site.description,
    url: '/',
    siteName: meta.person.name,
    locale: meta.site.locale.replace('-', '_'),
    type: 'profile',
    firstName,
    lastName: rest.join(' '),
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.site.title,
    description: meta.site.description,
    images: [ogImage],
  },
  ...(meta.site.googleVerification && { verification: { google: meta.site.googleVerification } }),
};

/** schema.org Person + WebSite, so search engines can tie the name to this site, the photo and the linked profiles. */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${meta.site.url}/#person`,
      name: meta.person.name,
      url: meta.site.url,
      image: new URL(meta.person.image ?? meta.site.ogImage, meta.site.url).toString(),
      email: `mailto:${meta.person.email}`,
      jobTitle: meta.person.jobTitle ?? meta.person.role,
      description: meta.site.description,
      worksFor: { '@type': 'Organization', name: meta.person.company },
      ...(meta.person.alumniOf && { alumniOf: { '@type': 'CollegeOrUniversity', name: meta.person.alumniOf } }),
      ...(meta.person.address && {
        address: {
          '@type': 'PostalAddress',
          addressLocality: meta.person.address.locality,
          addressRegion: meta.person.address.region,
          addressCountry: meta.person.address.country,
        },
      }),
      sameAs: meta.socials.map((s) => s.href).filter((h) => h.startsWith('http')),
      knowsAbout: skills.categories.flatMap((c) => c.items.map((i) => i.name)),
    },
    {
      '@type': 'WebSite',
      '@id': `${meta.site.url}/#website`,
      url: meta.site.url,
      name: meta.person.name,
      description: meta.site.description,
      publisher: { '@id': `${meta.site.url}/#person` },
      inLanguage: meta.site.locale,
    },
  ],
};

export const viewport: Viewport = {
  themeColor: '#0a0c14',
  width: 'device-width',
  initialScale: 1,
};

const themeBootstrap = `
(function(){
  try {
    var stored = localStorage.getItem('vr_theme');
    var mode = stored || 'system';
    var resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = resolved;
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
      </head>
      <body className="relative min-h-screen bg-bg text-fg antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AnimatedBackground />
          <ScrollProgress />
          <CursorGlow />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
