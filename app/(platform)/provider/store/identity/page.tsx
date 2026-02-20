"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
// Asegúrate de que las rutas a tus componentes sean correctas
import { VisualIdentitySection, IdentitySettings } from "@/components/marketplace/VisualIdentitySection";
import { PublicInfoSection, PublicInfoSettings } from "@/components/marketplace/PublicInfoSection"; // Ajusta la ruta

// Hook del backend
import { useStoreProfile } from "@/hooks/useStoreProfile"; 

// Unimos los tipos localmente para manejar todo el formulario
type FullStoreSettings = IdentitySettings & PublicInfoSettings;

export default function IdentitySetupPage() {
  const router = useRouter();
  
  // Extraemos datos del Hook
  const { profile, isLoading, isSaving, updateProfile, uploadMedia } = useStoreProfile();

  // Estado unificado para toda la página
  const [settings, setSettings] = useState<FullStoreSettings>({
    storeName: "",
    storeSlug: "",
    primaryColor: "#9333ea",
    storeLogoUrl: "",
    bannerImageUrl: "",
    description: "",
    videoUrl: ""
  });

  // Pre-llenar inputs cuando lleguen los datos de GCP/BD
  useEffect(() => {
    if (profile) {
      setSettings({
        storeName: profile.displayName || "",
        storeSlug: profile.slug || "",
        primaryColor: profile.primaryColor || "#9333ea",
        storeLogoUrl: profile.logoUrl || "",
        bannerImageUrl: profile.bannerUrl || "",
        description: profile.bio || "",
        videoUrl: profile.previewVideoUrl || ""
      });
    }
  }, [profile]);

  // Handler genérico para inputs de texto/color en cualquier componente
  const handleChange = (key: keyof FullStoreSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // 💾 Guardar TODO en la Base de Datos
  const handleSave = async () => {
    if (!settings.storeName || !settings.storeSlug) {
      toast.error("El nombre del consultorio y la URL son obligatorios");
      return;
    }

    const success = await updateProfile({
      displayName: settings.storeName,
      slug: settings.storeSlug,
      primaryColor: settings.primaryColor,
      logoUrl: settings.storeLogoUrl,
      bannerUrl: settings.bannerImageUrl,
      bio: settings.description,
      previewVideoUrl: settings.videoUrl
    });

    if (success) {
      router.push("/provider/store"); 
    }
  };

  // ☁️ Subida de Imágenes (Logo, Banner)
  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    const mediaType = type === 'logo' ? 'LOGO' : 'BANNER';
    const newUrl = await uploadMedia(file, mediaType);
    if (newUrl) {
      handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', newUrl);
    }
  };

  const handleImageDelete = (type: 'logo' | 'banner') => {
    handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', "");
  };

  // ☁️ Subida de Video (GCP)
  const handleVideoUpload = async (file: File) => {
    const newUrl = await uploadMedia(file, 'PREVIEW_VIDEO');
    if (newUrl) {
      handleChange('videoUrl', newUrl);
    }
  };

  const handleVideoDelete = () => {
    handleChange('videoUrl', "");
  };

  // Pantalla de carga inicial
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Cargando la vitrina de tu tienda...</p>
      </div>
    );
  }

  // Simulación: Comprobar si el usuario es Premium (puedes sacar esto del Token de tu SessionStore después)
  const isPremiumUser = true; // Cambiar a false para ver el diseño del "Upsell"

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* 🚀 Top Bar Navigation */}
      <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-xl sticky top-20 z-40 backdrop-blur-md">
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
      <div className="px-2">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          Perfil del Consultorio
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Configura cómo te verán los pacientes en el Marketplace. Tu imagen y mensaje son clave.
        </p>
      </div>

      <div className="space-y-8">
        {/* Sección 1: Identidad Visual (Logo, Banner, URL, Color) */}
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

        {/* Sección 2: Información Pública (Bio y Video) */}
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
      </div>
      
    </div>
  );
}