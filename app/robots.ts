import type { MetadataRoute } from 'next';
import { data } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${data.meta.site.url}/sitemap.xml`,
    host: data.meta.site.url,
  };
}
