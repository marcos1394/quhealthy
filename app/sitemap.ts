import { generateSlug } from '@/lib/utils';
import { MetadataRoute } from 'next';

export const revalidate = 3600; // Revalida cada hora (mejor que force-dynamic)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.quhealthy.org'; 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://api.quhealthy.org';

  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/es`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/es/discover`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/en/discover`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    // Static Pages
    { url: `${baseUrl}/es/academy`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/en/academy`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/es/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/en/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/es/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/es/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/es/como-funciona-el-quscore`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/en/como-funciona-el-quscore`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 1. Obtener todas las Tiendas/Providers
  try {
    let page = 0;
    let hasMoreStores = true;
    while (hasMoreStores && page < 10) { // Safety limit 10 pages
      const res = await fetch(`${apiUrl}/api/catalog/storefront?size=100&page=${page}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = await res.json();
      const allStores = [...(data.sponsored || []), ...(data.organic || [])];
      
      if (allStores.length === 0) {
        hasMoreStores = false;
        break;
      }

      for (const store of allStores) {
        if (store.slug) {
          routes.push({
            url: `${baseUrl}/es/store/${store.slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
          routes.push({
            url: `${baseUrl}/en/store/${store.slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      }
      page++;
    }
  } catch (error) {
    console.error('Error generating stores for sitemap:', error);
  }

  // 2. Obtener todos los items (productos, cursos, paquetes, servicios)
  try {
    let page = 0;
    let hasMoreItems = true;
    while (hasMoreItems && page < 20) { // Safety limit 20 pages
      const res = await fetch(`${apiUrl}/api/catalog/search/items?size=100&page=${page}`, {
        next: { revalidate: 3600 },
      });

      if (!res.ok) break;
      const data = await res.json();
      const items = data.content || [];

      if (items.length === 0) {
        hasMoreItems = false;
        break;
      }

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
      
      // If it's a paginated response and we hit the end
      if (data.last) {
        hasMoreItems = false;
      } else {
        page++;
      }
    }
  } catch (error) {
    console.error('Error generating items for sitemap:', error);
  }

  return routes;
}