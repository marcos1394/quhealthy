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
  reviewsCount?: number;
  averageRating?: number;
  rating?: number;
  specialty?: string;
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
  const specialty = store?.specialty || store?.categoryName || store?.subCategoryName || '';
  const city = store?.city ? ` en ${store.city}` : '';
  const effectiveRating = store?.averageRating || store?.rating || 0;
  const effectiveReviews = store?.totalReviews || store?.reviewsCount || 0;
  const ratingSnippet =
    effectiveRating > 0 && effectiveReviews > 0
      ? ` (${effectiveRating.toFixed(1)}★)`
      : '';

  const title = specialty
    ? `${name} — ${specialty}${city}${ratingSnippet}`
    : `${name}${city}${ratingSnippet} | Citas y Catálogo`;
  const description = (
    store?.bio?.replace(/\s+/g, ' ').trim()
      ? `${store.bio.replace(/\s+/g, ' ').trim().slice(0, 120)} · Agenda online en QuHealthy.`
      : `Agenda tu cita o compra con ${name}${specialty ? ` (${specialty})` : ''}${city}. Consulta precios, horarios y reseñas verificadas en QuHealthy.`
  ).slice(0, 160);

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
        ...(store.phone ? { telephone: store.phone } : {}),
        ...(store.categoryName ? { medicalSpecialty: store.categoryName } : {}),
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

      const effectiveRating = store.averageRating || store.rating || 0;
      const effectiveReviews = store.totalReviews || store.reviewsCount || 0;
      if (effectiveReviews > 0 && effectiveRating > 0) {
        jsonLd.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: Number(effectiveRating).toFixed(1),
          reviewCount: effectiveReviews,
          bestRating: 5,
          worstRating: 1,
        };
      }
    }
  } catch (err) {
    console.warn('[SEO] Storefront JSON-LD fallback for', slug, err);
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'en' ? 'Home' : 'Inicio',
        item: `https://www.quhealthy.org/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'en' ? 'Directory' : 'Especialistas',
        item: `https://www.quhealthy.org/${locale}/discover`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: (jsonLd?.name as string) || fallbackName,
        item: `https://www.quhealthy.org/${locale}/store/${slug}`,
      },
    ],
  };

  const structuredDataPayload = jsonLd ? [jsonLd, breadcrumbJsonLd] : breadcrumbJsonLd;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredDataPayload).replace(/</g, '\\u003c'),
        }}
      />
      {children}
    </>
  );
}
