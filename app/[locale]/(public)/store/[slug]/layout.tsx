import { Metadata } from 'next';

type StorefrontData = {
  displayName: string;
  categoryName?: string;
  subCategoryName?: string;
  bio?: string;
  logoUrl?: string;
  bannerUrl?: string;
  galleryImages?: Array<{ imageUrl: string }>;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  quScore?: number;
  totalReviews?: number;
  averageRating?: number;
};

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const fallbackName = formatSlugToTitle(slug);
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org').replace(/\/$/, '');

  let store: StorefrontData | null = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${baseUrl}/api/catalog/storefront/${slug}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      store = await res.json();
    }
  } catch {
    // Graceful fallback to slug-derived metadata
  }

  const name = store?.displayName || fallbackName;
  const specialty = store?.categoryName || store?.subCategoryName || '';
  const city = store?.city ? ` en ${store.city}` : '';

  const title = specialty ? `${name} - ${specialty}${city}` : `${name}${city}`;
  const description =
    store?.bio?.slice(0, 150) ||
    `Agenda tu cita médica con ${name}${specialty ? ` (${specialty})` : ''}${city}. Conoce servicios, horarios y opiniones verificadas en QuHealthy.`;

  const ogImage =
    store?.bannerUrl ||
    store?.logoUrl ||
    (store?.galleryImages && store.galleryImages.length > 0
      ? store.galleryImages[0].imageUrl
      : 'https://www.quhealthy.org/og-image.png');

  const currentUrl = `https://www.quhealthy.org/${locale}/store/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: currentUrl,
      languages: {
        es: `https://www.quhealthy.org/es/store/${slug}`,
        en: `https://www.quhealthy.org/en/store/${slug}`,
        'x-default': `https://www.quhealthy.org/es/store/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: 'QuHealthy',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const fallbackName = formatSlugToTitle(slug);
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org').replace(/\/$/, '');
  let jsonLd: Record<string, unknown> | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${baseUrl}/api/catalog/storefront/${slug}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const store: StorefrontData = await res.json();
      const name = store.displayName || fallbackName;

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': ['MedicalBusiness', 'Physician'],
        name,
        description: store.bio || `Servicios de salud y consultas médicas con ${name}`,
        image: store.bannerUrl || store.logoUrl || 'https://www.quhealthy.org/og-image.png',
        url: `https://www.quhealthy.org/${locale}/store/${slug}`,
        telephone: store.phone || '+52-668-184-2487',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: store.address || 'Consultorio Médico',
          addressLocality: store.city || 'México',
          addressRegion: store.state || 'México',
          addressCountry: 'MX',
        },
      };

      if (store.latitude && store.longitude) {
        jsonLd.geo = {
          '@type': 'GeoCoordinates',
          latitude: store.latitude,
          longitude: store.longitude,
        };
      }

      if (store.totalReviews && store.totalReviews > 0 && store.averageRating) {
        jsonLd.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: store.averageRating,
          reviewCount: store.totalReviews,
          bestRating: 5,
          worstRating: 1,
        };
      }
    }
  } catch (err) {
    console.warn('[SEO] Storefront JSON-LD fallback for', slug, err);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
