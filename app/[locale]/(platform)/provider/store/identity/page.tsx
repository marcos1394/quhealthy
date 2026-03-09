"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Loader2, Sparkles, MapPin } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { VisualIdentitySection, IdentitySettings } from "@/components/marketplace/VisualIdentitySection";
import { PublicInfoSection, PublicInfoSettings } from "@/components/marketplace/PublicInfoSection";
import EnhancedLocationPicker from "@/components/shared/location/MapModal";
import { LocationData } from "@/types/location";

// Hook del backend
import { useStoreProfile } from "@/hooks/useStoreProfile";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';

// Expandimos el tipo para incluir la nueva información
type FullStoreSettings = IdentitySettings & PublicInfoSettings & {
  category: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

export default function IdentitySetupPage() {
  const router = useRouter();
  const t = useTranslations('StoreIdentity');

  const { profile, isLoading, isSaving, updateProfile, uploadMedia } = useStoreProfile();

  const [settings, setSettings] = useState<FullStoreSettings>({
    storeName: "",
    storeSlug: "",
    primaryColor: "#9333ea",
    storeLogoUrl: "",
    bannerImageUrl: "",
    description: "",
    videoUrl: "",
    category: "",
    address: "",
    city: "",
    latitude: null,
    longitude: null
  });

  // Pre-llenar con datos del backend (Incluyendo los copiados del Onboarding)
  useEffect(() => {
    if (profile) {
      setSettings({
        storeName: profile.displayName || "",
        storeSlug: profile.slug || "",
        primaryColor: profile.primaryColor || "#9333ea",
        storeLogoUrl: profile.logoUrl || "",
        bannerImageUrl: profile.bannerUrl || "",
        description: profile.bio || "",
        videoUrl: profile.previewVideoUrl || "",
        category: profile.category || "",
        address: profile.address || "",
        city: profile.city || "",
        latitude: profile.latitude || null,
        longitude: profile.longitude || null
      });
    }
  }, [profile]);

  const handleChange = (key: keyof FullStoreSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Manejador del componente de Google Maps
  const handleLocationSelect = (location: LocationData) => {
    setSettings(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || prev.address,
      city: location.city || prev.city
    }));
  };

  // 💾 Guardar TODO en la Base de Datos
  const handleSave = async () => {
    // 1. Validaciones
    if (!settings.storeName || !settings.storeSlug) {
      toast.warning(t('toast_name_required'));
      return;
    }

    if (!settings.latitude || !settings.longitude) {
      toast.warning(t('toast_location_required'));
      return;
    }

    // 2. Llamada al Backend con Payload completo
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
      longitude: settings.longitude
    });

    // 3. Feedback visual
    if (success) {
      toast.success(t('toast_success'));
      setTimeout(() => {
        router.push("/provider/store");
      }, 800);
    } else {
      return;
    }
  };

  // Subida de Imágenes
  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    const mediaType = type === 'logo' ? 'LOGO' : 'BANNER';
    const newUrl = await uploadMedia(file, mediaType);
    if (newUrl) {
      handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', newUrl);
      toast.success(t('toast_image_uploaded'));
    }
  };

  const handleImageDelete = (type: 'logo' | 'banner') => {
    handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', "");
  };

  // Subida de Video
  const handleVideoUpload = async (file: File) => {
    const newUrl = await uploadMedia(file, 'PREVIEW_VIDEO');
    if (newUrl) {
      handleChange('videoUrl', newUrl);
      toast.success(t('toast_video_uploaded'));
    }
  };

  const handleVideoDelete = () => {
    handleChange('videoUrl', "");
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4 bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <p className="text-slate-500 dark:text-slate-400 font-semibold animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  const isPremiumUser = true;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="max-w-5xl mx-auto pb-16 relative">

        {/* 🚀 Top Bar Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24 z-50 backdrop-blur-xl mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/provider/store')}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('back')}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('btn_saving')}</>
            ) : (
              <><Save className="w-5 h-5 mr-2" /> {t('btn_save')}</>
            )}
          </Button>
        </div>

        {/* Header Contextual */}
        <div className="px-2 mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
              <Sparkles className="w-8 h-8 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-base md:text-lg">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Sección 1: Identidad Visual */}
          <VisualIdentitySection
            settings={{
              storeName: settings.storeName,
              storeSlug: settings.storeSlug,
              primaryColor: settings.primaryColor,
              storeLogoUrl: settings.storeLogoUrl,
              bannerImageUrl: settings.bannerImageUrl
            }}
            onChange={handleChange}
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
          />

          {/* Sección 2: Info Pública y Video */}
          <PublicInfoSection
            settings={{
              description: settings.description,
              videoUrl: settings.videoUrl
            }}
            onChange={handleChange}
            isPremium={isPremiumUser}
            onUpgrade={() => toast.info(t('toast_upgrade'))}
            onVideoUpload={handleVideoUpload}
            onVideoDelete={handleVideoDelete}
          />

          {/* 📍 SECCIÓN: Ubicación del Consultorio */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Background Glow sutil */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 shrink-0">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{t('location_title')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {t('location_desc')}
                </p>
              </div>
            </div>

            {/* Contenedor del Mapa */}
            <div className="w-full flex flex-col gap-4">
              <div className="w-full min-h-[450px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <EnhancedLocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    settings.latitude && settings.longitude
                      ? {
                        lat: settings.latitude,
                        lng: settings.longitude,
                        address: settings.address
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