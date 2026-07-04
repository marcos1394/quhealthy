import React from 'react';
import Link from 'next/link';
import { CatalogItemDTO } from '@/types/catalog';
import { Tag as TagIcon } from 'lucide-react';

interface MoreFromProviderProps {
  items: CatalogItemDTO[];
  locale: string;
  providerName: string;
}

export function MoreFromProvider({ items, locale, providerName }: MoreFromProviderProps) {
  if (!items || items.length === 0) return null;

  // Mostramos solo hasta 4 elementos
  const displayItems = items.slice(0, 4);

  return (
    <div className="mt-24 border-t border-gray-200 dark:border-gray-800 pt-16">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-8">
        Más de {providerName}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayItems.map((item) => {
          // Generar el slug SEO-friendly
          const slugText = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const itemSlug = `${item.id}-${slugText}`;

          return (
            <Link 
              key={item.id} 
              href={`/${locale}/market/item/${itemSlug}`}
              className="group flex flex-col border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-colors"
            >
              <div className="w-full aspect-square bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center overflow-hidden border-b border-gray-200 dark:border-gray-800">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <TagIcon className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {item.type}
                </div>
                <h3 className="text-sm font-bold text-black dark:text-white line-clamp-2 mb-2 group-hover:underline">
                  {item.name}
                </h3>
                <div className="mt-auto pt-4 text-sm font-bold text-black dark:text-white">
                  ${item.price?.toFixed(2)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
