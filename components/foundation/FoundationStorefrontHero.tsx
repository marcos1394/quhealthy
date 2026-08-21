"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Globe,
  Share,
  ShieldCheck,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Award,
  Layers,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { FoundationPublicStorefront } from "@/types/foundation";
import { cn } from "@/lib/utils";

interface FoundationStorefrontHeroProps {
  storefront: FoundationPublicStorefront;
  isFavorited?: boolean;
}

export const FoundationStorefrontHero: React.FC<FoundationStorefrontHeroProps> = ({
  storefront,
  isFavorited = false,
}) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const primaryColor = storefront.primaryColor || "#e11d48";
  const title = storefront.brandName || storefront.legalName;

  // Galería de imágenes: Banner como imagen principal (índice 0), seguido de galería
  const images: string[] = [];
  if (storefront.bannerUrl) {
    images.push(storefront.bannerUrl);
  }
  if (storefront.galleryUrls && storefront.galleryUrls.length > 0) {
    images.push(...storefront.galleryUrls);
  }

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % images.length);
    }, 4500);
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
      title,
      text: `Conoce los programas de apoyo y salud asistencial de ${title} en QuHealthy`,
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
      toast.success("Enlace de la institución copiado al portapapeles");
    }
  };

  const programsCount =
    storefront.programs?.length || storefront.totalActiveProgramsCount || 0;
  const beneficiariesCount = storefront.totalBeneficiariesCount || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10 font-sans transition-colors select-none">
      {/* ── 1. ENCABEZADO PRINCIPAL Y ACCIONES ────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-none rounded-full text-[10px] font-extrabold px-3 py-0.5 tracking-wider uppercase shadow-2xs">
              {storefront.organizationType || "I.A.P."}
            </Badge>

            {storefront.isAuthorizedDonatary && (
              <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-full text-[10px] font-bold px-3 py-0.5 shadow-2xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Donataria Autorizada SAT</span>
              </Badge>
            )}

            {storefront.cluniNumber && (
              <Badge className="bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-full text-[10px] font-mono font-bold px-2.5 py-0.5 shadow-2xs">
                CLUNI: {storefront.cluniNumber}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
            {/* Impacto / Programas */}
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <Sparkles className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{programsCount} {programsCount === 1 ? "Programa Activo" : "Programas Activos"}</span>
              <span className="text-gray-400 font-medium">
                ({beneficiariesCount > 0 ? `+${beneficiariesCount} Vidas Apoyadas` : "Abierto a Solicitudes"})
              </span>
            </span>

            <span className="text-gray-300 dark:text-gray-700">•</span>

            {/* Ubicación */}
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
              <MapPin className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2} />
              <span>{storefront.addressCity ? `${storefront.addressCity}, ${storefront.addressState || "México"}` : "Sede Principal"}</span>
            </span>

            {storefront.websiteUrl && (
              <>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <a
                  href={storefront.websiteUrl.startsWith("http") ? storefront.websiteUrl : `https://${storefront.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:underline font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Sitio Oficial</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Botones de Acción (Compartir & Guardar) */}
        <div className="flex items-center gap-2.5 shrink-0 mt-2 md:mt-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleShare}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-2xs cursor-pointer flex items-center gap-2"
          >
            <Share className="w-4 h-4" strokeWidth={2} />
            <span>Compartir</span>
          </Button>

          <div className="flex items-center h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-2xs cursor-pointer gap-2">
            <FavoriteButton
              entityType="FOUNDATION"
              entityId={storefront.id}
              initialIsFavorite={isFavorited}
              brandColor={primaryColor}
            />
            <span className="hidden sm:inline-block">Guardar</span>
          </div>
        </div>
      </div>

      {/* ── 2. GALERÍA DE IMÁGENES / CARRUSEL MULTIMEDIA ─────────────── */}
      <div className="w-full mb-10">
        {images.length > 0 ? (
          <div className="relative w-full h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xs border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] group">
            <img
              src={images[currentImageIdx]}
              alt={`Imagen institucional ${currentImageIdx + 1} de ${images.length}`}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />

            {/* Video Overlay Toggle */}
            {storefront.videoUrl && (
              <div className="absolute top-4 right-4 z-20">
                <Button
                  onClick={() => setShowVideo(!showVideo)}
                  className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-md rounded-full text-xs font-bold px-4 py-2 flex items-center gap-2 border border-white/20 shadow-md"
                >
                  <PlayCircle className="w-4 h-4 text-rose-400" />
                  <span>{showVideo ? "Ver Galería de Fotos" : "Ver Video Institucional"}</span>
                </Button>
              </div>
            )}

            {/* Modal/Reproductor de Video Integrado */}
            {showVideo && storefront.videoUrl && (
              <div className="absolute inset-0 bg-black z-30 flex items-center justify-center">
                <video
                  src={storefront.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Controles del Carrusel */}
            {images.length > 1 && !showVideo && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 cursor-pointer"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 cursor-pointer"
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
          <div className="w-full h-[240px] relative rounded-3xl shadow-2xs border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-rose-50 to-pink-100/50 dark:from-[#0a0a0a] dark:to-rose-950/20 flex flex-col items-center justify-center text-rose-400 gap-2">
            <Building2 className="w-12 h-12 opacity-50" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-gray-500">
              Portal Oficial de la Fundación
            </span>
          </div>
        )}
      </div>

      {/* ── 3. DETALLES DE LA INSTITUCIÓN Y HECHOS CLAVE (QUICK FACTS) ── */}
      <div className="space-y-8">
        {/* Header del Anfitrión Institucional */}
        <div className="flex items-start justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Institución Social & Médica: {title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                {storefront.primaryCauses?.[0] || "Salud y Bienestar Social"}
              </Badge>

              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300">
                <Globe className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Atención en Español</span>
              </span>

              {storefront.isAuthorizedDonatary && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Deducible de Impuestos (SAT)</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Logotipo Institucional Enmarcado con Verificación */}
          <div className="w-16 h-16 shrink-0 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs p-1 overflow-hidden flex items-center justify-center relative">
            {storefront.logoUrl ? (
              <img
                src={storefront.logoUrl}
                alt={title}
                className="w-full h-full object-contain object-center"
              />
            ) : (
              <span className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {title.charAt(0)}
              </span>
            )}

            <div className="absolute bottom-1 right-1 bg-rose-600 rounded-full p-0.5 border border-white dark:border-[#0a0a0a] shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Tarjetas Informativas Rápidas (Quick Facts 2x2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
            <CheckCircle2
              className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                100% Subsidios Asistenciales
              </h4>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                Fondos y vales canalizados para consultas médicas, fármacos y cirugías sin costo para el beneficiario.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
            <ShieldCheck
              className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                Transparencia & Marco SAT
              </h4>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                Acreditada como Donataria Autorizada ante el SAT y registro formal CLUNI para deducibilidad fiscal.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
            <HeartHandshake
              className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                Estudio Socioeconómico Ágil
              </h4>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                Evaluación con trabajadores sociales para canalizar apoyo directo y con dignidad humana a quien lo requiere.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 flex items-start gap-3.5 shadow-2xs">
            <Building2
              className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                Red Médica & Hospitalaria Aliada
              </h4>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                Canje de apoyos en consultorios, laboratorios y hospitales certificados dentro del ecosistema QuHealthy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
