import { MetadataRoute } from 'next';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic'; // Desactiva caché estática para generar en tiempo real

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.quhealthy.org';
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org').replace(/\/$/, '');

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/es`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/es/discover`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/discover`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    }
  ];

  try {
    // Fetch items for the sitemap (Using the public discover endpoint, fetching a large batch)
    const res = await fetch(`${apiUrl}/api/catalog/search/items?size=1000&page=0`);
    if (res.ok) {
      const data = await res.json();
      const items = data.content || [];

      items.forEach((item: any) => {
        const slug = `${item.id}-${generateSlug(item.name)}`;
        
        // Add ES locale
        routes.push({
          url: `${baseUrl}/es/market/item/${slug}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });

        // Add EN locale
        routes.push({
          url: `${baseUrl}/en/market/item/${slug}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error("Error generating sitemap for items:", error);
  }

  return routes;
}
