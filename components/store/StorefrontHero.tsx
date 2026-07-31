"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Star,
  MapPin,
  Globe,
  Share,
  CheckCircle2,
  ShieldCheck,
  Clock,
  MessageCircle,
  Instagram,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StorefrontData } from "@/types/storefront";
import { ProviderScoreResponse } from "@/types/providerScore";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { QuScoreModal } from "@/components/store/QuScoreModal";
import { QuickAvailability } from "@/components/store/QuickAvailability";
import { cn } from "@/lib/utils";

interface StorefrontHeroProps {
  store: StorefrontData;
  scoreData?: ProviderScoreResponse | null;
  isFavorited: boolean;
}

export const StorefrontHero: React.FC<StorefrontHeroProps> = ({
  store,
  scoreData,
  isFavorited,
}) => {
  const t = useTranslations("StorePublic");
  const [showQuScoreModal, setShowQuScoreModal] = useState(false);

  const safePrimaryColor = store.primaryColor || "#059669";

  // Galería de imágenes con fallback
  const images =
    store.galleryImages && store.galleryImages.length > 0
      ? store.galleryImages.map((img) => img.imageUrl)
      : store.bannerUrl
      ? [store.bannerUrl]
      : [];

  const handleShare = async () => {
    const shareData = {
      title: store.displayName,
      text: `Agenda tu cita con ${store.displayName} en QuHealthy`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("copied_toast"));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 font-sans transition-colors select-none">
      {/* ── 1. ENCABEZADO PRINCIPAL Y ACCIONES ────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            {store.displayName}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
            {/* Calificación y Reseñas */}
            <span className="flex items-center gap-1.5">
              <Star
                className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0"
                strokeWidth={1.5}
              />
              <span>{store.rating || "4.9"}</span>
              <span className="text-gray-400 font-medium">
                (
                {store.reviewsCount
                  ? t("reviews_count", { count: store.reviewsCount })
                  : t("new_provider")}
                )
              </span>
            </span>

            <span className="text-gray-300 dark:text-gray-700">•</span>

            {/* Insegnea QuScore */}
            {scoreData && (
              <>
                <button
                  type="button"
                  onClick={() => setShowQuScoreModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1 rounded-full hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                >
                  <ShieldCheck
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                    strokeWidth={2}
                  />
                  <span>QuScore: {scoreData.score}</span>
                </button>

                <span className="text-gray-300 dark:text-gray-700">•</span>
              </>
            )}

            {/* Ubicación */}
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
              <MapPin className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{store.city || store.address || t("consultorio")}</span>
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2.5 shrink-0 mt-2 md:mt-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleShare}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-2xs cursor-pointer flex items-center gap-2"
          >
            <Share className="w-4 h-4" strokeWidth={2} />
            <span>{t("share")}</span>
          </Button>

          <div className="flex items-center h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-2xs cursor-pointer gap-2">
            <FavoriteButton
              entityType="PROVIDER"
              entityId={store.providerId}
              initialIsFavorite={isFavorited}
              brandColor={safePrimaryColor}
            />
            <span className="hidden sm:inline-block">{t("save")}</span>
          </div>
        </div>
      </div>

      {/* ── 2. GALERÍA DE IMÁGENES ───────────────────────────────────── */}
      <div className="w-full mb-10">
        {images.length >= 5 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xs border border-gray-100 dark:border-gray-800">
            <div className="md:col-span-2 md:row-span-2 relative bg-gray-50 dark:bg-[#050505] overflow-hidden group cursor-pointer">
              <img
                src={images[0]}
                alt="Foto principal"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="hidden md:block relative bg-gray-50 dark:bg-[#050505] overflow-hidden group cursor-pointer">
              <img
                src={images[1]}
                alt="Foto 2"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="hidden md:block relative bg-gray-50 dark:bg-[#050505] overflow-hidden group cursor-pointer">
              <img
                src={images[2]}
                alt="Foto 3"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="hidden md:block relative bg-gray-50 dark:bg-[#050505] overflow-hidden group cursor-pointer">
              <img
                src={images[3]}
                alt="Foto 4"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="hidden md:block relative bg-gray-50 dark:bg-[#050505] overflow-hidden group cursor-pointer">
              <img
                src={images[4]}
                alt="Foto 5"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute bottom-3 right-3">
                <Button
                  type="button"
                  className="rounded-xl bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white text-xs font-bold shadow-2xs border border-gray-200 dark:border-gray-800 px-3.5 h-9"
                >
                  {t("view_all_photos")}
                </Button>
              </div>
            </div>
          </div>
        ) : images.length > 0 ? (
          <div className="w-full h-[280px] md:h-[400px] relative rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] overflow-hidden">
            <img
              src={images[0]}
              alt="Banner del consultorio"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-[240px] relative rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-400">
              {t("no_images")}
            </span>
          </div>
        )}
      </div>

      {/* ── 3. DETALLES DEL PROFESIONAL Y HECHOS CLAVE ───────────────── */}
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8">
          {/* Header del Anfitrión */}
          <div className="flex items-start justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t("attended_by", { name: store.displayName })}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                  {store.tags && store.tags.length > 0
                    ? store.tags[0]
                    : t("verified_specialist")}
                </Badge>

                {store.languages && store.languages.length > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300">
                      <Globe className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{store.languages.join(", ")}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Avatar / Logo */}
            <div className="w-16 h-16 shrink-0 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs overflow-hidden flex items-center justify-center relative">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {store.displayName.charAt(0)}
                </span>
              )}

              <div className="absolute bottom-1 right-1 bg-emerald-600 rounded-full p-0.5 border border-white dark:border-[#0a0a0a] shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Tarjetas Informativas Rápidas (Quick Facts) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
              <CheckCircle2
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("medical_verification_title")}
                </h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("medical_verification_desc")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
              <Clock
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("availability_title")}
                </h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("availability_desc")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
              <Star
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("experience_title")}
                </h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("experience_desc")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
              <MapPin
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("location_title")}
                </h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("location_desc", {
                    city: store.city || t("default_city"),
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Componente de Disponibilidad Rápida */}
          <QuickAvailability providerId={store.providerId} />

          {/* Biografía y Contacto */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("about_specialist")}
            </h3>

            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap">
              {store.bio || t("default_bio")}
            </p>

            {/* Botones de Redes y Contacto */}
            <div className="flex flex-wrap gap-3 pt-2">
              {store.whatsappEnabled && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl h-10 px-5 text-xs font-bold border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("contact_whatsapp")}</span>
                </Button>
              )}

              {store.instagramUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    window.open(store.instagramUrl || "", "_blank")
                  }
                  className="rounded-xl h-10 px-5 text-xs font-bold border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-400 transition-all shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4 text-rose-500" strokeWidth={2} />
                  <span>{t("follow_instagram")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de QuScore */}
      <QuScoreModal
        isOpen={showQuScoreModal}
        onClose={() => setShowQuScoreModal(false)}
        scoreData={scoreData || null}
      />
    </div>
  );
};