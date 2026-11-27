import { generateSlug } from '@/lib/utils';
import { CITY_MAP, SPECIALTY_MAP } from '@/lib/seo/programmatic';
import { MetadataRoute } from 'next';

export const revalidate = 3600; // Revalida cada hora (mejor que force-dynamic)

const fetchWithTimeout = async (url: string, timeoutMs = 5000): Promise<Response | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    return res;
  } catch (error) {
    console.warn(`[Sitemap] Fetch timeout or error for ${url}:`, error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.quhealthy.org'; 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://api.quhealthy.org';

  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/es`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    {
      url: `${baseUrl}/es/discover`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
      alternates: { languages: { es: `${baseUrl}/es/discover`, en: `${baseUrl}/en/discover` } },
    },
    {
      url: `${baseUrl}/en/discover`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
      alternates: { languages: { es: `${baseUrl}/es/discover`, en: `${baseUrl}/en/discover` } },
    },
    {
      url: `${baseUrl}/es/market`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
      alternates: { languages: { es: `${baseUrl}/es/market`, en: `${baseUrl}/en/market` } },
    },
    {
      url: `${baseUrl}/en/market`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
      alternates: { languages: { es: `${baseUrl}/es/market`, en: `${baseUrl}/en/market` } },
    },
    {
      url: `${baseUrl}/es/intelligence`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: { es: `${baseUrl}/es/intelligence`, en: `${baseUrl}/en/intelligence` } },
    },
    {
      url: `${baseUrl}/en/intelligence`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: { es: `${baseUrl}/es/intelligence`, en: `${baseUrl}/en/intelligence` } },
    },
    {
      url: `${baseUrl}/es/facturacion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: { es: `${baseUrl}/es/facturacion`, en: `${baseUrl}/en/facturacion` } },
    },
    {
      url: `${baseUrl}/en/facturacion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: { es: `${baseUrl}/es/facturacion`, en: `${baseUrl}/en/facturacion` } },
    },
    // Public Modules
    { url: `${baseUrl}/es/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/en/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/es/academy`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/en/academy`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/es/foundations`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/en/foundations`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/es/suppliers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/en/suppliers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/es/business`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/en/business`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/es/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/en/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/es/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/en/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/es/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/en/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/es/como-funciona-el-quscore`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/en/como-funciona-el-quscore`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    // Legal Pages
    { url: `${baseUrl}/es/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/en/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/es/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/en/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/es/cookies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/en/cookies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/es/returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/en/returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // 1. Obtener Tiendas/Providers (paginado hasta 200 tiendas, solo /es canónico para evitar duplicidad)
  const seenStoreSlugs = new Set<string>();
  try {
    for (let page = 0; page < 2; page++) {
      const res = await fetchWithTimeout(
        `${apiUrl}/api/catalog/storefront?size=100&page=${page}&radiusKm=999999`
      );
      if (!res || !res.ok) break;
      const data = await res.json();
      const allStores = [...(data.sponsored || []), ...(data.organic || [])];
      if (allStores.length === 0) break;

      for (const store of allStores) {
        if (store?.slug && !seenStoreSlugs.has(store.slug)) {
          seenStoreSlugs.add(store.slug);
          routes.push({
            url: `${baseUrl}/es/store/${store.slug}`,
            lastModified: store.updatedAt ? new Date(store.updatedAt) : new Date(),
            changeFrequency: 'daily',
            priority: 0.85,
          });
        }
      }
      if (allStores.length < 100) break;
    }
  } catch (error) {
    console.error('Error generating stores for sitemap:', error);
  }

  // 2. Obtener Items del catálogo (paginado hasta 300 ítems, solo /es canónico para evitar canibalización /en/ en MX)
  const seenItemSlugs = new Set<string>();
  try {
    for (let page = 0; page < 3; page++) {
      const res = await fetchWithTimeout(
        `${apiUrl}/api/catalog/search/items?size=100&page=${page}&radiusKm=999999`
      );
      if (!res || !res.ok) break;
      const data = await res.json();
      const items = [...(data.sponsored || []), ...(data.organic || [])];
      if (items.length === 0) break;

      for (const item of items) {
        if (item?.id && item?.name) {
          const slug = `${item.id}-${generateSlug(item.name)}`;
          if (seenItemSlugs.has(slug)) continue;
          seenItemSlugs.add(slug);

          routes.push({
            url: `${baseUrl}/es/market/item/${slug}`,
            lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      }
      if (items.length < 100) break;
    }
  } catch (error) {
    console.error('Error generating items for sitemap:', error);
  }

  // 3. Obtener blogs (solo /es canónico: los artículos se publican en español)
  const seenBlogSlugs = new Set<string>();
  try {
    const res = await fetchWithTimeout(`${apiUrl}/api/intelligence/blog/posts`);
    if (res && res.ok) {
      const posts = await res.json();
      if (Array.isArray(posts)) {
        for (const post of posts) {
          if (post?.slug && !seenBlogSlugs.has(post.slug)) {
            seenBlogSlugs.add(post.slug);
            routes.push({
              url: `${baseUrl}/es/blog/${post.slug}`,
              lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt || new Date()),
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating blogs for sitemap:', error);
  }

  // 4. Páginas programáticas Especialidad × Ciudad (MKT-SEO-02)
  const topSpecialties = Object.keys(SPECIALTY_MAP);
  const topCities = Object.keys(CITY_MAP);
  for (const specialty of topSpecialties) {
    for (const city of topCities) {
      routes.push({
        url: `${baseUrl}/es/especialistas/${specialty}/${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return routes;
}