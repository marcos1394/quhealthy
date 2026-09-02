import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.quhealthy.org';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/es/*',
          '/en/*',
          '/sitemap.xml',
        ],
        disallow: [
          '/admin/*',
          '/patient/*',
          '/provider/dashboard/*',
          '/provider/consultation/*',
          '/provider/appointments/*',
          '/foundation/dashboard/*',
          '/supplier/dashboard/*',
          '/api/*',
          '/*?*clear_session=*',
          '/*?*token=*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
