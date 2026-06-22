"use client"
/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/no-chain-state-updates */
/* eslint-disable react-doctor/no-event-handler */;

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
import { cn } from "@/lib/utils";

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
    primaryColor: "#000000", // Default técnico en vez del morado
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

  const [isInitialized, setIsInitialized] = useState(false);

  // Pre-llenar con datos del backend (Incluyendo los copiados del Onboarding)
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
        longitude: profile.longitude || null
      });
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  const handleChange = (key: keyof FullStoreSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Auto-save silently critical interactions like color 
    if (key === 'primaryColor') {
       try { updateProfile({ primaryColor: value }); } catch (e) {}
    }
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
    }
  };

  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    const mediaType = type === 'logo' ? 'LOGO' : 'BANNER';
    const newUrl = await uploadMedia(file, mediaType);
    if (newUrl) {
      handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', newUrl);
      try {
        await updateProfile({ [type === 'logo' ? 'logoUrl' : 'bannerUrl']: newUrl });
      } catch (e) {
        /* Ignoramos error de validacion oculto, solo guardamos lo que nos permita */
      }
      toast.success(t('toast_image_uploaded'));
    }
  };

  const handleImageDelete = (type: 'logo' | 'banner') => {
    handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', "");
  };

  const handleVideoUpload = async (file: File) => {
    const newUrl = await uploadMedia(file, 'PREVIEW_VIDEO');
    if (newUrl) {
      handleChange('videoUrl', newUrl);
      try {
        await updateProfile({ previewVideoUrl: newUrl });
      } catch (e) {}
      toast.success(t('toast_video_uploaded'));
    }
  };

  const handleVideoDelete = () => {
    handleChange('videoUrl', "");
  };

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white animate-pulse">
          {t('loading')}
        </p>
      </div>
    );
  }

  const isPremiumUser = true;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] p-6 md:p-12 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12 pb-24">

        {/* 🚀 Top Bar Navigation (Blueprint) */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 sticky top-0 bg-white dark:bg-[#0a0a0a] z-40 pt-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/provider/store')}
            className="rounded-none text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={2} />
            {t('back')}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "rounded-none h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
              isSaving 
                ? "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed" 
                : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            )}
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-3 animate-spin" /> {t('btn_saving')}</>
            ) : (
              <><Save className="w-4 h-4 mr-3" strokeWidth={2} /> {t('btn_save')}</>
            )}
          </Button>
        </div>

        {/* Header Contextual */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
            <Sparkles className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight mb-2">
              {t('title')}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-12">
          
          {/* Sección 1: Identidad Visual */}
          <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
            <VisualIdentitySection 
              settings={settings}
              onChange={handleChange}
              onSaveField={async (key, value) => {
                try {
                  await updateProfile({ [key === 'storeName' ? 'displayName' : 'slug']: value });
                  toast.success('Dato sincronizado exitosamente');
                } catch (e) {
                  console.error("Error auto-saving", e);
                }
              }}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
            />
          </div>

          {/* Sección 2: Info Pública y Video */}
          <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
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
          </div>

          {/* 📍 SECCIÓN: Ubicación del Consultorio (Blueprint Format) */}
          <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">
            
            <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
                  <MapPin className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                    {t('location_title')}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-light uppercase tracking-widest">
                    {t('location_desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenedor del Mapa */}
            <div className="p-6 md:p-8">
              <div className="w-full min-h-[450px] border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
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