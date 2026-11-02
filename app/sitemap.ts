import type { MetadataRoute } from 'next';
import { data } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${data.meta.site.url}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      images: [new URL(data.meta.site.ogImage, data.meta.site.url).toString()],
    },
  ];
}
