import { generateSlug } from '@/lib/utils';
import { MetadataRoute } from 'next';

export const revalidate = 3600; // Revalida cada hora (mejor que force-dynamic)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://quhealthy.org'; // ← Cambia según tu dominio canónico
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://api.quhealthy.org';

  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/es`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/es/discover`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/en/discover`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];

  try {
    const res = await fetch(`${apiUrl}/api/catalog/search/items?size=500&page=0`, {
      next: { revalidate: 3600 }, // Cache en el servidor
    });

    if (res.ok) {
      const data = await res.json();
      const items = data.content || [];

      for (const item of items) {
        const slug = `${item.id}-${generateSlug(item.name)}`;

        routes.push({
          url: `${baseUrl}/es/market/item/${slug}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });

        routes.push({
          url: `${baseUrl}/en/market/item/${slug}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}