import { Metadata } from 'next';

type StorefrontData = {
  displayName: string;
  bio?: string;
  logoUrl?: string;
  bannerUrl?: string;
  galleryImages?: Array<{ imageUrl: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org';
    const res = await fetch(`${baseUrl}/api/catalog/storefront/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      return { title: 'Directorio QuHealthy' };
    }
    
    const store: StorefrontData = await res.json();
    const title = store.displayName || 'Directorio QuHealthy';
    const description = store.bio || `Agenda tu cita con ${title} en QuHealthy.`;
    
    let ogImage = 'https://www.quhealthy.org/images/default-og.png'; // Fallback

    if (store.bannerUrl) {
      ogImage = store.bannerUrl;
    } else if (store.galleryImages && store.galleryImages.length > 0) {
      ogImage = store.galleryImages[0].imageUrl;
    } else if (store.logoUrl) {
      ogImage = store.logoUrl;
    }

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
            alt: title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      }
    };
  } catch (error) {
    return {
      title: 'Directorio QuHealthy',
    };
  }
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org';
  let jsonLd: any = null;

  try {
    const res = await fetch(`${baseUrl}/api/catalog/storefront/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const store = await res.json();
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "MedicalClinic",
        "name": store.displayName,
        "description": store.bio || store.displayName,
        "image": store.bannerUrl || store.logoUrl,
        "url": `https://www.quhealthy.org/${locale}/store/${slug}`,
        "telephone": "6681842487",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": store.address || "Del Roble 220",
          "addressLocality": store.city || "Los Mochis",
          "addressRegion": "Sinaloa",
          "addressCountry": "MX"
        }
      };
      
      if (store.latitude && store.longitude) {
        jsonLd.geo = {
          "@type": "GeoCoordinates",
          "latitude": store.latitude,
          "longitude": store.longitude
        };
      }
    }
  } catch (err) {
    console.error("Error loading JSON-LD for store", err);
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
