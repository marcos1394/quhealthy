"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { VisualIdentitySection, IdentitySettings } from "@/components/marketplace/VisualIdentitySection";
import { PublicInfoSection, PublicInfoSettings } from "@/components/marketplace/PublicInfoSection";

// Hook del backend
import { useStoreProfile } from "@/hooks/useStoreProfile"; 

type FullStoreSettings = IdentitySettings & PublicInfoSettings;

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
    videoUrl: ""
  });

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

  const handleChange = (key: keyof FullStoreSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // 💾 Guardar TODO en la Base de Datos con mejor UX
  const handleSave = async () => {
    // 1. Validaciones
    if (!settings.storeName || !settings.storeSlug) {
      toast.warning("El nombre del consultorio y la URL son obligatorios");
      return;
    }

    // 2. Llamada al Backend
    const success = await updateProfile({
      displayName: settings.storeName,
      slug: settings.storeSlug,
      primaryColor: settings.primaryColor,
      logoUrl: settings.storeLogoUrl,
      bannerUrl: settings.bannerImageUrl,
      bio: settings.description,
      previewVideoUrl: settings.videoUrl
    });

    // 3. Feedback visual (La clave para que el usuario sepa que funcionó)
    if (success) {
      toast.success("¡Perfil guardado con éxito!");
      // Opcional: un pequeño delay para que el usuario lea el Toast antes del salto
      setTimeout(() => {
        router.push("/provider/store"); 
      }, 800);
    } else {
      toast.error("Hubo un problema al guardar. Intenta de nuevo.");
    }
  };

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
      
      {/* 🚀 Top Bar Navigation - UX MEJORADA */}
      {/* Agregamos mb-8 para empujar el contenido hacia abajo, oscurecemos el fondo y aumentamos el blur */}
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