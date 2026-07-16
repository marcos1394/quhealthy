"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Crown, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { usePackageRecommendations } from '@/hooks/usePackageRecommendations';
import { PackageRecommendation } from '@/types/recommendations';

function formatPrice(price: number, currency: string = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'MXN',
    minimumFractionDigits: 0,
  }).format(price);
}

function RecommendationCard({ rec }: { rec: PackageRecommendation }) {
  const router = useRouter();
  const hasDiscount = rec.compareAtPrice && rec.compareAtPrice > rec.price;
  const discountPct = hasDiscount
    ? Math.round((1 - rec.price / rec.compareAtPrice!) * 100)
    : null;

  const handleNavigate = () => {
    if (rec.providerSlug) {
      router.push(`/discover/${rec.providerSlug}`);
    } else {
      router.push('/discover');
    }
  };

  return (
    <div className="flex flex-col border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-8 md:p-10 hover:border-black dark:hover:border-white transition-colors group">
      {/* Badge de razón */}
      <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest w-fit mb-6 inline-flex items-center gap-1.5">
        <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
        {rec.reasonBadge}
      </span>

      {/* Nombre */}
      <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-white uppercase mb-1">
        {rec.name}
      </h3>

      {/* Proveedor */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
        {rec.providerName}
      </p>

      {/* Rating */}
      {rec.averageRating != null && rec.averageRating > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <Star className="w-3 h-3 text-black dark:text-white fill-current" />
          <span className="text-[10px] font-bold text-black dark:text-white">{rec.averageRating.toFixed(1)}</span>
          {rec.reviewCount != null && (
            <span className="text-[10px] font-bold text-gray-400">({rec.reviewCount} reseñas)</span>
          )}
        </div>
      )}

      {/* Precio */}
      <div className="flex items-center gap-3 mb-6">
        {hasDiscount && (
          <span className="text-gray-400 line-through text-sm font-medium">
            {formatPrice(rec.compareAtPrice!, rec.currency)}
          </span>
        )}
        <span className="text-black dark:text-white text-lg font-bold tracking-tight">
          {formatPrice(rec.price, rec.currency)}
        </span>
        {discountPct != null && (
          <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Descripción */}
      {rec.description && (
        <p className="text-xs text-gray-500 font-light leading-relaxed mb-8 flex-grow line-clamp-3">
          {rec.description}
        </p>
      )}

      {/* CTA */}
      <Button
        onClick={handleNavigate}
        variant="outline"
        className="rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 text-[10px] font-bold uppercase tracking-widest w-full sm:w-fit px-8 transition-colors flex items-center justify-between sm:justify-center mt-auto border-0"
      >
       Ver Contenido <ArrowRight className="w-4 h-4 sm:ml-3" strokeWidth={1.5} />
      </Button>
    </div>
  );
}

export function SuggestedUpgrades() {
  const { recommendations, isLoading } = usePackageRecommendations(4);

  // Si está cargando, mostramos un skeleton minimalista
  if (isLoading) {
    return (
      <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
            Recomendacion de Paquetes 
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <QhSpinner size="md" />
        </div>
      </div>
    );
  }

  // Si no hay recomendaciones, no renderizamos la sección
  if (recommendations.length === 0) {
    return null;
  }

  // Mostrar hasta 4 recomendaciones en grid de 2 columnas
  const displayedRecs = recommendations.slice(0, 4);

  return (
    <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 space-y-8">
      <div className="flex items-center gap-3 mb-4">
        <Crown className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
        <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
          Recomendaciones de Paquetes
        </h2>
      </div>

      <div className={`grid grid-cols-1 gap-8 ${displayedRecs.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {displayedRecs.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}