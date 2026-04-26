import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { data } from '@/lib/data';
import { CursorGlow } from '@/components/fx/CursorGlow';
import { ScrollProgress } from '@/components/fx/ScrollProgress';
import { AnimatedBackground } from '@/components/fx/AnimatedBackground';

const { meta } = data;

export const metadata: Metadata = {
  title: meta.site.title,
  description: meta.site.description,
  keywords: meta.site.keywords,
  authors: [{ name: meta.person.name }],
  openGraph: {
    title: meta.site.title,
    description: meta.site.description,
    url: meta.site.url,
    siteName: meta.site.title,
    locale: meta.site.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.site.title,
    description: meta.site.description,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
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
