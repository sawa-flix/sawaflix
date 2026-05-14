import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/creator-dashboard/', '/api/'],
    },
    sitemap: 'https://sawaflix.com/sitemap.xml',
  };
}
