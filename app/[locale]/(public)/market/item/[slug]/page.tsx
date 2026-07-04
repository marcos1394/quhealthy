import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Tag as TagIcon, Building2 } from 'lucide-react';
import { CatalogItemDTO } from '@/types/catalog';
import { AddToCartButton } from './AddToCartButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCatalogItem(id: string): Promise<CatalogItemDTO | null> {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org').replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/catalog/items/${id}`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      console.warn(`Catalog item fetch failed: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching catalog item:", error);
    return null;
  }
}

type Params = Promise<{ slug: string; locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, locale } = await params;
  const id = slug.split('-')[0];
  const item = await getCatalogItem(id);
  
  if (!item) {
    return { title: 'Item no encontrado - QuHealthy' };
  }

  const url = `https://www.quhealthy.org/${locale}/market/item/${slug}`;
  const title = `${item.name} | QuHealthy Marketplace`;
  const description = item.description || `Compra ${item.name} en QuHealthy.`;

  return {
    title,
    description,
    keywords: (item as any).searchTags ? (item as any).searchTags.join(', ') : '',
    openGraph: {
      title,
      description,
      url: url,
      siteName: 'QuHealthy',
      images: item.imageUrl ? [
        {
          url: item.imageUrl,
          width: 1200,
          height: 630,
          alt: item.name,
        },
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: item.imageUrl ? [item.imageUrl] : [],
    },
    alternates: {
      canonical: url,
    }
  };
}

export default async function MarketItemPage({ params }: { params: Params }) {
  const { slug, locale } = await params;
  const id = slug.split('-')[0];
  const item = await getCatalogItem(id);

  if (!item) {
    notFound();
  }

  let schemaType = 'Product';
  if (item.type === 'SERVICE') schemaType = 'Service';
  if (item.type === 'COURSE') schemaType = 'Course';

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: item.name,
    description: item.description,
    image: item.imageUrl ? [item.imageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: (item as any).currency || 'MXN',
      availability: 'https://schema.org/InStock',
      url: `https://www.quhealthy.org/${locale}/market/item/${slug}`,
    }
  };

  if (item.type === 'PRODUCT' || item.type === 'PACKAGE') {
    jsonLd.brand = {
      '@type': 'Brand',
      name: 'QuHealthy Provider'
    };
    if ((item as any).sku) jsonLd.sku = (item as any).sku;
  }

  if ((item as any).averageRating && (item as any).reviewCount && (item as any).reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (item as any).averageRating,
      reviewCount: (item as any).reviewCount
    };
  }

  const backText = locale === 'en' ? 'Back to Discover' : 'Volver a Discover';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      
      <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          
          <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
            <Link 
              href={`/${locale}/discover`} 
              className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
              {backText}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="w-full aspect-square bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-800">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <TagIcon className="w-24 h-24 text-gray-300 dark:text-gray-700" />
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-4 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                <span>{item.type}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span>{item.category || 'General'}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold text-black dark:text-white leading-[1.1] mb-6 tracking-tight">
                {item.name}
              </h1>

              <div className="text-3xl font-bold text-black dark:text-white mb-8">
                ${item.price?.toFixed(2)} {(item as any).currency || 'MXN'}
              </div>

              <div className="prose prose-gray dark:prose-invert max-w-none mb-10 text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                <p>{item.description}</p>
              </div>

              <div className="mt-auto mb-12">
                <AddToCartButton item={item} />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-4">
                  Garantía QuHealthy
                </h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ShieldCheck className="w-5 h-5 mr-3 text-black dark:text-white" />
                  <span>Proveedor Verificado Médicamente (EEAT)</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="w-5 h-5 mr-3 text-black dark:text-white" />
                  <span>Transacción 100% Segura</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-black dark:text-white" />
                  <span>Soporte 24/7 disponible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
