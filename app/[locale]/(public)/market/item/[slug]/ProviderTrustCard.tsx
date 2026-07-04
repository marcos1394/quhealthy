import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, MapPin } from 'lucide-react';

interface ProviderProfile {
  providerId: number;
  slug: string;
  displayName: string;
  logoUrl?: string;
  bio?: string;
  averageRating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
}

export function ProviderTrustCard({ provider, locale }: { provider: ProviderProfile | null, locale: string }) {
  if (!provider) return null;

  return (
    <div className="mt-8 border border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50">
      <div className="flex items-start gap-4 mb-4">
        {provider.logoUrl ? (
          <img src={provider.logoUrl} alt={provider.displayName} className="w-16 h-16 object-cover border border-gray-200 dark:border-gray-700 bg-white" />
        ) : (
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-400">{provider.displayName.charAt(0)}</span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white leading-tight">
            {provider.displayName}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">{provider.averageRating?.toFixed(1) || '5.0'}</span>
            <span className="text-gray-500 text-xs ml-1">({provider.reviewCount || 0} reseñas)</span>
          </div>
        </div>
      </div>

      {provider.bio && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
          {provider.bio}
        </p>
      )}

      <div className="space-y-2 mb-6">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4 mr-2 text-green-600 dark:text-green-500" />
          <span className="font-medium text-green-700 dark:text-green-400">Proveedor Verificado Médicamente</span>
        </div>
        {(provider.address || provider.city) && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{provider.city || provider.address}</span>
          </div>
        )}
      </div>

      <Link 
        href={`/${locale}/store/${provider.slug}`}
        className="block w-full text-center py-2 px-4 border border-black dark:border-white text-black dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
      >
        Ver Perfil del Proveedor
      </Link>
    </div>
  );
}
