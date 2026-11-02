import type { MetadataRoute } from 'next';
import { data } from '@/lib/data';

export default function manifest(): MetadataRoute.Manifest {
  const { site, person } = data.meta;
  return {
    name: site.title,
    short_name: person.name,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0c14',
    theme_color: '#0a0c14',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
