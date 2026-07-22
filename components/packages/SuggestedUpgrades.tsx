"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Crown, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { usePackageRecommendations } from "@/hooks/usePackageRecommendations";
import { PackageRecommendation } from "@/types/recommendations";

function formatPrice(price: number, currency: string = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "MXN",
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
      router.push("/discover");
    }
  };

  return (
    <div className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 md:p-10 hover:border-quhealthy-green/30 dark:hover:border-quhealthy-green/30 transition-all group rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1">
      {/* Badge de razón */}
      <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 px-3 py-1 text-xs font-bold rounded-full w-fit mb-6 inline-flex items-center gap-1.5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
        {rec.reasonBadge}
      </span>

      {/* Nombre */}
      <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
        {rec.name}
      </h3>

      {/* Proveedor */}
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4">
        {rec.providerName}
      </p>

      {/* Rating */}
      {rec.averageRating != null && rec.averageRating > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <Star className="w-4 h-4 text-amber-400 fill-current" />
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {rec.averageRating.toFixed(1)}
          </span>
          {rec.reviewCount != null && (
            <span className="text-xs font-medium text-gray-500">
              ({rec.reviewCount} reseñas)
            </span>
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
        <span className="text-gray-900 dark:text-white text-lg font-bold tracking-tight">
          {formatPrice(rec.price, rec.currency)}
        </span>
        {discountPct != null && (
          <span className="text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded-md">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Descripción */}
      {rec.description && (
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-grow line-clamp-3">
          {rec.description}
        </p>
      )}

      {/* CTA */}
      <Button
        onClick={handleNavigate}
        variant="outline"
        className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-quhealthy-green hover:text-white hover:border-quhealthy-green dark:hover:bg-quhealthy-green dark:hover:text-white h-12 text-sm font-bold w-full sm:w-fit px-8 transition-all flex items-center justify-between sm:justify-center mt-auto shadow-sm"
      >
        Ver Contenido <ArrowRight className="w-4 h-4 sm:ml-3" strokeWidth={2} />
      </Button>
    </div>
  );
}

export function SuggestedUpgrades() {
  const { recommendations, isLoading } = usePackageRecommendations(4);

  // Si está cargando, mostramos un skeleton minimalista
  if (isLoading) {
    return (
      <div className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="w-5 h-5 text-quhealthy-green" strokeWidth={2} />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
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
    <div className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800 space-y-8">
      <div className="flex items-center gap-3 mb-4">
        <Crown className="w-5 h-5 text-quhealthy-green" strokeWidth={2} />
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Recomendaciones de Paquetes
        </h2>
      </div>

      <div
        className={`grid grid-cols-1 gap-8 ${displayedRecs.length > 1 ? "lg:grid-cols-2" : ""}`}
      >
        {displayedRecs.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}
