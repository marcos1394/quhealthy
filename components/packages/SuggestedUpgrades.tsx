"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Crown, Star, Sparkles } from "lucide-react";

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
  const t = useTranslations("SuggestedUpgrades");
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
    <div className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 hover:border-emerald-500/30 transition-all group rounded-3xl shadow-2xs hover:shadow-md h-full font-sans select-none">
      {/* Insignia de motivo */}
      <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 px-3 py-1 text-xs font-bold rounded-full w-fit mb-4 inline-flex items-center gap-1.5 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
        <span>{rec.reasonBadge}</span>
      </span>

      {/* Nombre */}
      <h3 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-1">
        {rec.name}
      </h3>

      {/* Proveedor */}
      <p className="text-xs font-semibold text-gray-400 mb-3">
        {rec.providerName}
      </p>

      {/* Calificación / Reseñas */}
      {rec.averageRating != null && rec.averageRating > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">
            {rec.averageRating.toFixed(1)}
          </span>
          {rec.reviewCount != null && (
            <span className="text-xs font-medium text-gray-400">
              {t("rating_reviews", { count: rec.reviewCount })}
            </span>
          )}
        </div>
      )}

      {/* Precio */}
      <div className="flex items-baseline gap-2.5 mb-4">
        {hasDiscount && (
          <span className="text-gray-400 line-through text-xs font-mono font-medium">
            {formatPrice(rec.compareAtPrice!, rec.currency)}
          </span>
        )}
        <span className="text-gray-900 dark:text-white text-lg font-mono font-bold tracking-tight">
          {formatPrice(rec.price, rec.currency)}
        </span>
        {discountPct != null && (
          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 rounded-full shadow-2xs">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Descripción */}
      {rec.description && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-grow line-clamp-3">
          {rec.description}
        </p>
      )}

      {/* Botón de Acción */}
      <Button
        type="button"
        onClick={handleNavigate}
        variant="outline"
        className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-600 dark:hover:text-white h-11 text-xs font-bold w-full transition-all flex items-center justify-between px-5 mt-auto shadow-2xs cursor-pointer"
      >
        <span>{t("btn_view")}</span>
        <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </Button>
    </div>
  );
}

export function SuggestedUpgrades() {
  const t = useTranslations("SuggestedUpgrades");
  const { recommendations, isLoading } = usePackageRecommendations(4);

  if (isLoading) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 font-sans select-none">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <Crown className="w-4 h-4" strokeWidth={2} />
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {t("section_title")}
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const displayedRecs = recommendations.slice(0, 4);

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6 font-sans select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <Crown className="w-4 h-4" strokeWidth={2} />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
          {t("section_title")}
        </h2>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${
          displayedRecs.length > 1 ? "lg:grid-cols-2" : ""
        }`}
      >
        {displayedRecs.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}