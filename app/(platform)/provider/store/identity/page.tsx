"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Sparkles, MapPin } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { VisualIdentitySection, IdentitySettings } from "@/components/marketplace/VisualIdentitySection";
import { PublicInfoSection, PublicInfoSettings } from "@/components/marketplace/PublicInfoSection";
import EnhancedLocationPicker from "@/components/shared/location/MapModal"; 
import { LocationData } from "@/types/location";

// Hook del backend
import { useStoreProfile } from "@/hooks/useStoreProfile"; 

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
      toast.warning("El nombre del consultorio y la URL son obligatorios");
      return;
    }

    if (!settings.latitude || !settings.longitude) {
      toast.warning("Por favor confirma tu ubicación en el mapa");
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
      toast.success("¡Perfil guardado con éxito!");
      setTimeout(() => {
        router.push("/provider/store"); 
      }, 800);
    } else {
      toast.error("Hubo un problema al guardar. Intenta de nuevo.");
    }
  };

  // Subida de Imágenes
  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    const mediaType = type === 'logo' ? 'LOGO' : 'BANNER';
    const newUrl = await uploadMedia(file, mediaType);
    if (newUrl) {
      handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', newUrl);
      toast.success(`Imagen subida a la nube correctamente`);
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
      toast.success(`Video procesado y guardado`);
    }
  };

  const handleVideoDelete = () => {
    handleChange('videoUrl', "");
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Cargando la vitrina de tu tienda...</p>
      </div>
    );
  }

  const isPremiumUser = true;

  return (
    <div className="max-w-5xl mx-auto pb-16 relative">
      
      {/* 🚀 Top Bar Navigation */}
      <div className="flex items-center justify-between bg-gray-950/90 p-4 rounded-2xl border border-gray-700 shadow-2xl sticky top-24 z-50 backdrop-blur-xl mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/provider/store')}
          className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a Mi Tienda
        </Button>

        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          {isSaving ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Guardar Cambios</>
          )}
        </Button>
      </div>

      {/* Header Contextual */}
      <div className="px-2 mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          Perfil del Consultorio
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Configura cómo te verán los pacientes en el Marketplace. Tu imagen y mensaje son clave.
        </p>
      </div>

      <div className="space-y-12">
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
          onUpgrade={() => toast.info("Redirigiendo a planes y precios...")}
          onVideoUpload={handleVideoUpload}
          onVideoDelete={handleVideoDelete}
        />

        {/* 📍 NUEVA SECCIÓN: Ubicación del Consultorio */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Background Glow sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ubicación en el Mapa</h2>
              <p className="text-gray-400 text-sm mt-1">
                Verifica o ajusta el pin. Esta es la dirección que verán los pacientes en el Marketplace para encontrarte.
              </p>
            </div>
          </div>
          
          {/* Contenedor del Mapa - Usamos flex y forzamos altura */}
          <div className="w-full flex flex-col gap-4">
            <div className="w-full min-h-[450px]">
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
  );
}