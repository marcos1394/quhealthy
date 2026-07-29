"use client";

/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/no-chain-state-updates */
/* eslint-disable react-doctor/no-event-handler */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Sparkles, MapPin } from "lucide-react";
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
import { cn } from "@/lib/utils";

// Hook del backend
import { useStoreProfile } from "@/hooks/useStoreProfile";

type FullStoreSettings = IdentitySettings &
  PublicInfoSettings & {
    category: string;
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  };

export default function IdentitySetupPage() {
  const router = useRouter();
  const t = useTranslations("StoreIdentity");

  const { profile, isLoading, isSaving, updateProfile, uploadMedia } =
    useStoreProfile();

  const [settings, setSettings] = useState<FullStoreSettings>({
    storeName: "",
    storeSlug: "",
    primaryColor: "#000000",
    storeLogoUrl: "",
    bannerImageUrl: "",
    description: "",
    videoUrl: "",
    category: "",
    address: "",
    city: "",
    latitude: null,
    longitude: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Pre-llenar con datos del backend
  useEffect(() => {
    if (profile && !isInitialized) {
      setSettings({
        storeName: profile.displayName || "",
        storeSlug: profile.slug || "",
        primaryColor: profile.primaryColor || "#000000",
        storeLogoUrl: profile.logoUrl || "",
        bannerImageUrl: profile.bannerUrl || "",
        description: profile.bio || "",
        videoUrl: profile.previewVideoUrl || "",
        category: profile.category || "",
        address: profile.address || "",
        city: profile.city || "",
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
      });
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  const handleChange = (key: keyof FullStoreSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "primaryColor") {
      try {
        updateProfile({ primaryColor: value });
      } catch (e) {}
    }
  };

  // Manejador del mapa
  const handleLocationSelect = (location: LocationData) => {
    setSettings((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || prev.address,
      city: location.city || prev.city,
    }));
  };

  // Guardar en Backend
  const handleSave = async () => {
    if (!settings.storeName || !settings.storeSlug) {
      toast.warning(t("toast_name_required"));
      return;
    }

    if (!settings.latitude || !settings.longitude) {
      toast.warning(t("toast_location_required"));
      return;
    }

    const success = await updateProfile({
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
      latitude: settings.latitude,
      longitude: settings.longitude,
    });

    if (success) {
      toast.success(t("toast_success"));
      setTimeout(() => {
        router.push("/provider/store");
      }, 800);
    } else {
      toast.error(t("toast_error"));
    }
  };

  const handleImageUpload = async (type: "logo" | "banner", file: File) => {
    const mediaType = type === "logo" ? "LOGO" : "BANNER";
    const newUrl = await uploadMedia(file, mediaType);
    if (newUrl) {
      handleChange(type === "logo" ? "storeLogoUrl" : "bannerImageUrl", newUrl);
      try {
        await updateProfile({
          [type === "logo" ? "logoUrl" : "bannerUrl"]: newUrl,
        });
      } catch (e) {}
      toast.success(t("toast_image_uploaded"));
    }
  };

  const handleImageDelete = (type: "logo" | "banner") => {
    handleChange(type === "logo" ? "storeLogoUrl" : "bannerImageUrl", "");
  };

  const handleVideoUpload = async (file: File) => {
    const newUrl = await uploadMedia(file, "PREVIEW_VIDEO");
    if (newUrl) {
      handleChange("videoUrl", newUrl);
      try {
        await updateProfile({ previewVideoUrl: newUrl });
      } catch (e) {}
      toast.success(t("toast_video_uploaded"));
    }
  };

  const handleVideoDelete = () => {
    handleChange("videoUrl", "");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  const isPremiumUser = true;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => router.push("/provider/store")}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
          >
            <ArrowLeft
              className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-200"
              strokeWidth={2}
            />
            <span>{t("back")}</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "h-11 px-6 rounded-xl text-xs font-bold transition-all border-0 shadow-sm flex items-center gap-2",
              isSaving
                ? "bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
            )}
          >
            {isSaving ? (
              <QhSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_save")}</span>
              </>
            )}
          </Button>
        </div>

        {/* Contextual Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-1">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              {t("subtitle")}
            </p>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Sección 1: Identidad Visual */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
            <VisualIdentitySection
              settings={settings}
              onChange={handleChange}
              onSaveField={async (key, value) => {
                try {
                  await updateProfile({
                    [key === "storeName" ? "displayName" : "slug"]: value,
                  });
                } catch (e) {
                  console.error("Error auto-saving field", e);
                }
              }}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
            />
          </div>

          {/* Sección 2: Info Pública y Video */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
            <PublicInfoSection
              settings={{
                description: settings.description,
                videoUrl: settings.videoUrl,
              }}
              onChange={handleChange}
              isPremium={isPremiumUser}
              onUpgrade={() => toast.info(t("toast_upgrade"))}
              onVideoUpload={handleVideoUpload}
              onVideoDelete={handleVideoDelete}
            />
          </div>

          {/* Sección 3: Ubicación del Consultorio */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] space-y-1">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {t("location_title")}
                  </h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("location_desc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenedor del Mapa */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
              <div className="w-full min-h-[450px] rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] overflow-hidden shadow-sm">
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