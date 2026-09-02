"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StorefrontData, StorefrontLocation } from "@/types/storefront";
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

const isPlaceholder = (val?: string | null) => {
  if (!val) return true;
  const lower = val.trim().toLowerCase();
  return (
    lower === "selected location" ||
    lower === "ubicación seleccionada" ||
    lower === "default_city" ||
    lower === "ciudad principal" ||
    lower === "consultorio" ||
    lower === "consultorio principal" ||
    lower === ""
  );
};

export const buildGoogleMapsUrl = (
  loc?: Partial<StorefrontLocation> | { address?: string; city?: string; name?: string; latitude?: number; longitude?: number; googlePlaceId?: string } | null,
  fallbackName?: string
): string => {
  if (!loc && !fallbackName) return "https://maps.google.com";

  if (loc?.googlePlaceId) {
    const query = encodeURIComponent(loc.name || loc.address || fallbackName || "");
    return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${loc.googlePlaceId}`;
  }

  if (loc?.latitude && loc?.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
  }

  const query = encodeURIComponent(loc?.address || loc?.city || fallbackName || "");
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

export const StorefrontHero: React.FC<StorefrontHeroProps> = ({
  store,
  scoreData,
  isFavorited,
}) => {
  const t = useTranslations("StorePublic");
  const [showQuScoreModal, setShowQuScoreModal] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const safePrimaryColor = store.primaryColor || "#059669";

  // Galería de imágenes: Banner como imagen principal (índice 0), seguido de las demás
  const images: string[] = [];
  if (store.bannerUrl) {
    images.push(store.bannerUrl);
  }
  if (store.galleryImages && store.galleryImages.length > 0) {
    images.push(...store.galleryImages.map((img) => img.imageUrl));
  }

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

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

            {/* Insignia QuScore */}
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

            {/* Cédula Profesional Verificada */}
            {store.doctorLicense && (
              <>
                <a
                  href={`https://cedulaprofesional.sep.gob.mx/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 px-3 py-1 rounded-full hover:bg-blue-100 transition-all cursor-pointer shadow-2xs"
                  title="Verificar cédula en el Registro Nacional de Profesionistas"
                >
                  <ShieldCheck
                    className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0"
                    strokeWidth={2}
                  />
                  <span>{t("license_verified")}: {store.doctorLicense}</span>
                </a>

                <span className="text-gray-300 dark:text-gray-700">•</span>
              </>
            )}

            {/* Ubicación Real con enlace interactivo a Google Maps */}
            {(() => {
              let displayLocation: string | null = null;
              let activeLoc: StorefrontLocation | null = null;

              if (store.locations && store.locations.length > 0) {
                const validLoc = store.locations.find(
                  (loc) => !isPlaceholder(loc.city) || !isPlaceholder(loc.address) || !isPlaceholder(loc.name)
                );
                if (validLoc) {
                  activeLoc = validLoc;
                  displayLocation =
                    (!isPlaceholder(validLoc.city) && validLoc.city) ||
                    (!isPlaceholder(validLoc.name) && validLoc.name) ||
                    (!isPlaceholder(validLoc.address) && validLoc.address) ||
                    null;
                }
              }

              if (!displayLocation) {
                if (!isPlaceholder(store.city)) displayLocation = store.city!;
                else if (!isPlaceholder(store.address)) displayLocation = store.address!;
              }

              if (!displayLocation) return null;

              const mapsUrl = buildGoogleMapsUrl(
                activeLoc || { address: store.address, city: store.city, latitude: store.latitude, longitude: store.longitude },
                store.displayName
              );

              return (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer group hover:underline"
                  title={t("open_in_google_maps")}
                >
                  <MapPin className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{displayLocation}</span>
                  <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 shrink-0 transition-opacity" strokeWidth={2} />
                </a>
              );
            })()}
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

      {/* ── 2. GALERÍA DE IMÁGENES (CARRUSEL) ────────────────────────── */}
      <div className="w-full mb-10">
        {images.length > 0 ? (
          <div className="relative w-full h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xs border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] group">
            <img
              src={images[currentImageIdx]}
              alt={`Imagen ${currentImageIdx + 1} de ${images.length}`}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Indicadores de galería */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIdx(idx)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        currentImageIdx === idx 
                          ? "bg-white scale-125 shadow-[0_0_4px_rgba(0,0,0,0.5)]" 
                          : "bg-white/50 hover:bg-white/80"
                      )}
                      aria-label={`Ir a imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-[240px] relative rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-400">
              {t("no_images")}
            </span>
          </div>
        )}
      </div>

      {/* ── 3. DETALLES DEL PROFESIONAL Y HECHOS CLAVE REALES ────────── */}
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8">
          {/* Header del Anfitrión */}
          <div className="flex items-start justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                {store.displayName}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                {store.tags && store.tags.length > 0 && (
                  <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                    {store.tags[0]}
                  </Badge>
                )}

                {store.languages && store.languages.length > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300">
                    <Globe className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{store.languages.join(", ")}</span>
                  </span>
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
            </div>
          </div>

          {/* Tarjetas Informativas Basadas Exclusivamente en Datos Reales */}
          {(() => {
            const hasServices = store.services && store.services.length > 0;
            const hasProducts = store.products && store.products.length > 0;
            const hasCourses = store.courses && store.courses.length > 0;
            const hasPackages = store.packages && store.packages.length > 0;

            const cards: React.ReactNode[] = [];

            if (hasServices) {
              cards.push(
                <div key="services" className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
                  <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Servicios & Consultas</h4>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {store.services.length} {store.services.length === 1 ? "servicio disponible" : "servicios disponibles"} para atención.
                    </p>
                  </div>
                </div>
              );
            }

            if (hasProducts) {
              cards.push(
                <div key="products" className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Catálogo de Productos & Farmacia</h4>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {store.products.length} {store.products.length === 1 ? "ítem registrado" : "ítems registrados"} en catálogo directo.
                    </p>
                  </div>
                </div>
              );
            }

            if (hasPackages || hasCourses) {
              cards.push(
                <div key="packages_courses" className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
                  <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Programas & Contenido</h4>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {(store.packages?.length || 0)} paquetes y {(store.courses?.length || 0)} cursos disponibles.
                    </p>
                  </div>
                </div>
              );
            }

            // Ubicación con botón directo a Google Maps
            const validLocations = store.locations && store.locations.length > 0
              ? store.locations.filter(loc => !isPlaceholder(loc.address) || !isPlaceholder(loc.name) || !isPlaceholder(loc.city))
              : [];

            if (validLocations.length > 0) {
              const primaryLoc = validLocations[0];
              const mapsUrl = buildGoogleMapsUrl(primaryLoc, store.displayName);
              const displayTitle = validLocations.length === 1 && primaryLoc.name && !isPlaceholder(primaryLoc.name)
                ? primaryLoc.name
                : "Ubicación";

              cards.push(
                <div key="location" className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex flex-col justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{displayTitle}</h4>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                        {primaryLoc.address || primaryLoc.city || store.address || store.city}
                      </p>
                    </div>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors ml-8 hover:underline"
                  >
                    <span>{t("how_to_get_there")}</span>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                  </a>
                </div>
              );
            } else if (!isPlaceholder(store.address) || !isPlaceholder(store.city)) {
              const mapsUrl = buildGoogleMapsUrl({ address: store.address, city: store.city, latitude: store.latitude, longitude: store.longitude }, store.displayName);
              cards.push(
                <div key="location" className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex flex-col justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Ubicación</h4>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                        {store.address || store.city}
                      </p>
                    </div>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors ml-8 hover:underline"
                  >
                    <span>{t("how_to_get_there")}</span>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                  </a>
                </div>
              );
            }

            if (cards.length === 0) return null;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                {cards}
              </div>
            );
          })()}

          {/* Componente de Disponibilidad Rápida (ÚNICAMENTE si tiene servicios para agendar) */}
          {store.services && store.services.length > 0 && (
            <QuickAvailability providerId={store.providerId} locations={store.locations} />
          )}

          {/* Biografía y Contacto (Solo si tiene bio real o teléfono/redes) */}
          {(Boolean(store.bio && store.bio.trim().length > 0) || Boolean(store.phone) || Boolean(store.whatsappEnabled) || Boolean(store.instagramUrl)) && (
            <div className="space-y-4 pt-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("about_specialist", { defaultValue: "Sobre el Especialista" })}
              </h3>

              {store.bio && store.bio.trim().length > 0 && (
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap">
                  {store.bio}
                </p>
              )}

              {/* Botones de Contacto Directo */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Llamar por Teléfono */}
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="inline-flex items-center gap-2 rounded-xl h-10 px-4 text-xs font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all shadow-2xs cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("call_phone")}: {store.phone}</span>
                  </a>
                )}

                {/* WhatsApp enriquecido */}
                {store.whatsappEnabled && (() => {
                  const cleanPhone = (store.phone || "").replace(/\D/g, "");
                  const waHref = cleanPhone
                    ? `https://wa.me/${cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(`Hola, vi tu perfil en QuHealthy (${store.displayName}) y me gustaría solicitar información.`)}`
                    : `https://wa.me/?text=${encodeURIComponent(`Hola, vi tu perfil en QuHealthy (${store.displayName}) y me gustaría solicitar información.`)}`;

                  return (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl h-10 px-5 text-xs font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all shadow-2xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span>{t("contact_whatsapp")}</span>
                    </a>
                  );
                })()}

                {/* Instagram */}
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

              {/* Política de Cancelación Transparente */}
              {store.cancellationPolicy && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3.5 mt-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                      {t("cancellation_policy_title")}
                    </h4>
                    <p className="text-xs font-medium text-emerald-900/80 dark:text-emerald-400/80 leading-relaxed">
                      {store.cancellationPolicy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Staff / Equipo */}
          {((store.staffMembers && store.staffMembers.length > 0) || (store.staff && store.staff.length > 0)) && (
            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("our_team", { defaultValue: "Nuestro Equipo" })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(store.staffMembers || store.staff)?.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 shadow-2xs">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {member.name}
                      </h4>
                      {member.specialty && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {member.specialty}
                        </p>
                      )}
                      {member.credentials && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                          Cédula: {member.credentials}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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