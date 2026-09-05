import { MetadataRoute } from 'next';
import { sanityFetch } from '@/lib/sanity/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sawaflix.com';

  // Static routes
  const staticRoutes = [
    '',
    '/sign-up',
    '/dashboard/blogs',
    '/artistpage',
    '/home',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic blog routes
  let blogRoutes: any[] = [];
  try {
    const slugs = await sanityFetch(`*[_type == "story"]{ "slug": slug.current, _updatedAt }`);
    if (slugs) {
      blogRoutes = slugs.map((item: any) => ({
        url: `${baseUrl}/dashboard/blogs/${item.slug}`,
        lastModified: new Date(item._updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Sitemap blog fetch error:', error);
  }

  return [...staticRoutes, ...blogRoutes];
}
