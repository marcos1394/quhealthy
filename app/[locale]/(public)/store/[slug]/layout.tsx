import { Metadata } from 'next';

type StorefrontData = {
  displayName: string;
  bio?: string;
  logoUrl?: string;
  bannerUrl?: string;
  galleryImages?: Array<{ imageUrl: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
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

    if (store.galleryImages && store.galleryImages.length > 0) {
      ogImage = store.galleryImages[0].imageUrl;
    } else if (store.bannerUrl) {
      ogImage = store.bannerUrl;
    } else if (store.logoUrl) {
      ogImage = store.logoUrl;
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://www.quhealthy.org/es/store/${slug}`,
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

export default function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; locale: string }>;
}) {
  return <>{children}</>;
}
