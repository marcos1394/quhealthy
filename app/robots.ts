import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.quhealthy.org';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/patient/',
        '/provider/dashboard',
        '/api/',
        '/*?*clear_session=true'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
