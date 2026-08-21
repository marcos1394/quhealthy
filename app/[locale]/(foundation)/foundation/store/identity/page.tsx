"use client";

/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/no-chain-state-updates */
/* eslint-disable react-doctor/no-event-handler */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Sparkles, MapPin, Building2, ShieldCheck, HeartHandshake } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  VisualIdentitySection,
  IdentitySettings,
} from "@/components/marketplace/VisualIdentitySection";
import {
  PublicInfoSection,
  PublicInfoSettings,
} from "@/components/marketplace/PublicInfoSection";
import EnhancedLocationPicker from "@/components/shared/location/MapModal";
import { LocationData } from "@/types/location";
import { storeService } from "@/services/store.service";
import { foundationService } from "@/services/foundation.service";
import { foundationOnboardingService } from "@/services/foundation-onboarding.service";
import { cn } from "@/lib/utils";

type FullFoundationSettings = IdentitySettings &
  PublicInfoSettings & {
    category: string;
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    organizationType?: string;
    cluniNumber?: string;
  };

export default function FoundationIdentitySetupPage() {
  const router = useRouter();
  const t = useTranslations("StoreIdentity");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<FullFoundationSettings>({
    storeName: "",
    storeSlug: "",
    primaryColor: "#e11d48",
    storeLogoUrl: "",
    bannerImageUrl: "",
    description: "",
    videoUrl: "",
    category: "Salud Integral, Cirugías, Oncología Pediátrica",
    address: "",
    city: "Culiacán",
    latitude: 24.809065,
    longitude: -107.394017,
    organizationType: "I.A.P.",
    cluniNumber: "",
  });

  // Pre-llenar con datos del Onboarding y Store Profile
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [storeData, onboardingStatus, foundationProfile] = await Promise.all([
          storeService.getMyStore().catch(() => null),
          foundationOnboardingService.getStatus().catch(() => null),
          foundationService.getProfile().catch(() => null),
        ]);

        const prof = onboardingStatus?.profile || foundationProfile || storeData;

        const storeName =
          storeData?.displayName ||
          prof?.tradeName ||
          prof?.brandName ||
          prof?.legalName ||
          prof?.name ||
          "";

        const storeSlug =
          storeData?.slug ||
          prof?.slug ||
          (storeName
            ? storeName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9-]/g, "-")
                .replace(/--+/g, "-")
            : "fundacion");

        const primaryColor = storeData?.primaryColor || prof?.primaryColor || "#e11d48";
        const storeLogoUrl = storeData?.logoUrl || prof?.logoUrl || "";
        const bannerImageUrl = storeData?.bannerUrl || prof?.bannerUrl || "";
        const description = storeData?.bio || prof?.mission || prof?.description || "";
        const videoUrl = storeData?.previewVideoUrl || prof?.videoUrl || "";

        let address = storeData?.address || prof?.address || "";
        if (!address && prof?.addressStreet) {
          address = `${prof.addressStreet} ${prof.addressNumber || ""}, ${prof.addressNeighborhood || ""}`.trim();
        }

        const city = storeData?.city || prof?.addressCity || prof?.city || "Culiacán";
        const latitude = storeData?.latitude || prof?.latitude || 24.809065;
        const longitude = storeData?.longitude || prof?.longitude || -107.394017;
        const category =
          storeData?.category ||
          (Array.isArray(prof?.primaryCauses)
            ? prof.primaryCauses.join(", ")
            : prof?.cause || "Salud Integral, Cirugías, Oncología");

        setSettings({
          storeName,
          storeSlug,
          primaryColor,
          storeLogoUrl,
          bannerImageUrl,
          description,
          videoUrl,
          category,
          address,
          city,
          latitude,
          longitude,
          organizationType: prof?.organizationType || "I.A.P.",
          cluniNumber: prof?.cluniNumber || prof?.cluni || "",
        });
      } catch (error) {
        console.error("Error preloading foundation identity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleChange = (key: keyof FullFoundationSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationSelect = (location: LocationData) => {
    setSettings((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || prev.address,
      city: location.city || prev.city,
    }));
  };

  // ☁️ Subida de imágenes a GCP mediante Signed URLs
  const handleImageUpload = async (type: "logo" | "banner", file: File) => {
    try {
      const mediaType = type === "logo" ? "LOGO" : "BANNER";
      const res = await storeService.uploadMedia(file, mediaType);
      if (res?.url) {
        handleChange(type === "logo" ? "storeLogoUrl" : "bannerImageUrl", res.url);
        toast.success(
          type === "logo"
            ? "Logotipo institucional subido correctamente a GCP"
            : "Portada institucional subida correctamente a GCP"
        );
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      toast.error("Ocurrió un error al subir la imagen.");
    }
  };

  const handleImageDelete = (type: "logo" | "banner") => {
    handleChange(type === "logo" ? "storeLogoUrl" : "bannerImageUrl", "");
  };

  // 🎥 Subida de videos a GCP
  const handleVideoUpload = async (file: File) => {
    try {
      const res = await storeService.uploadMedia(file, "PREVIEW_VIDEO");
      if (res?.url) {
        handleChange("videoUrl", res.url);
        toast.success("Video institucional subido exitosamente a GCP");
      }
    } catch (error) {
      console.error("Error subiendo video:", error);
      toast.error("Ocurrió un error al subir el video.");
    }
  };

  const handleVideoDelete = () => {
    handleChange("videoUrl", "");
  };

  // 💾 Guardar configuración completa en backend
  const handleSave = async () => {
    if (!settings.storeName || !settings.storeSlug) {
      toast.warning(t("toast_name_required") || "El nombre y enlace público son requeridos");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Guardar en Store Service (Marketplace público)
      await storeService.updateMyStore({
        displayName: settings.storeName,
        slug: settings.storeSlug,
        primaryColor: settings.primaryColor,
        logoUrl: settings.storeLogoUrl,
        bannerUrl: settings.bannerImageUrl,
        bio: settings.description,
        previewVideoUrl: settings.videoUrl,
        category: settings.category,
        address: settings.address,
        city: settings.city,
        latitude: settings.latitude ?? undefined,
        longitude: settings.longitude ?? undefined,
      }).catch(() => null);

      // 2. Guardar en Foundation Service (Entidad Institucional)
      await foundationService.updateProfile({
        tradeName: settings.storeName,
        slug: settings.storeSlug,
        primaryColor: settings.primaryColor,
        logoUrl: settings.storeLogoUrl,
        bannerUrl: settings.bannerImageUrl,
        mission: settings.description,
        videoUrl: settings.videoUrl,
        address: settings.address,
        city: settings.city,
        primaryCauses: settings.category ? settings.category.split(",").map((s) => s.trim()) : [],
      }).catch(() => null);

      toast.success(t("toast_success") || "Identidad institucional guardada exitosamente");
      setTimeout(() => {
        router.push("/foundation/store");
      }, 800);
    } catch (error) {
      toast.error(t("toast_error") || "Error al guardar cambios");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading") || "Cargando datos de identidad institucional..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-rose-500/20 transition-colors duration-500 pb-24">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => router.push("/foundation/store")}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-200" strokeWidth={2} />
            <span>{t("back") || "Volver"}</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "h-11 px-6 rounded-xl text-xs font-bold transition-all border-0 shadow-xs flex items-center gap-2 cursor-pointer",
              isSaving
                ? "bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            )}
          >
            {isSaving ? (
              <QhSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_save") || "Guardar Cambios"}</span>
              </>
            )}
          </Button>
        </div>

        {/* Contextual Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-1">
              Identidad Visual & Vitrina Institucional
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Personaliza el logotipo, portada, paleta de colores, misión y ubicación de atención comunitaria de tu fundación.
            </p>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Sección 1: Identidad Visual & Colores */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xs overflow-hidden">
            <VisualIdentitySection
              settings={settings}
              onChange={handleChange}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
            />
          </div>

          {/* Sección 2: Info Pública, Misión y Video */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xs overflow-hidden">
            <PublicInfoSection
              settings={{
                description: settings.description,
                videoUrl: settings.videoUrl,
              }}
              onChange={handleChange}
              isPremium={true}
              onVideoUpload={handleVideoUpload}
              onVideoDelete={handleVideoDelete}
            />
          </div>

          {/* Sección 3: Ubicación de Atención y Sede Física */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] space-y-1">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    Sede Institucional & Atención Comunitaria
                  </h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    Indica la ubicación física donde las personas o familias pueden acudir para orientaciones y trámites asistenciales.
                  </p>
                </div>
              </div>
            </div>

            {/* Contenedor del Mapa Interactivo */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
              <div className="w-full min-h-[450px] rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] overflow-hidden shadow-xs">
                <EnhancedLocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    settings.latitude && settings.longitude
                      ? {
                          lat: settings.latitude,
                          lng: settings.longitude,
                          address: settings.address,
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
