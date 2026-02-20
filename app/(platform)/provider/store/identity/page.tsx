"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
// Asegúrate de ajustar la ruta de VisualIdentitySection a donde lo tengas guardado
import { VisualIdentitySection, IdentitySettings } from "@/components/marketplace/VisualIdentitySection";
// Importamos el Hook que conecta con tu Backend
import { useStoreProfile } from "@/hooks/useStoreProfile"; 

export default function IdentitySetupPage() {
  const router = useRouter();
  
  // 🚀 Extraemos la magia del Hook
  const { profile, isLoading, isSaving, updateProfile, uploadMedia } = useStoreProfile();

  // Estado local para los inputs del formulario
  const [settings, setSettings] = useState<IdentitySettings>({
    storeName: "",
    storeSlug: "",
    primaryColor: "#9333ea",
    storeLogoUrl: "",
    bannerImageUrl: ""
  });

  // 🔄 Efecto: Cuando los datos del Backend llegan, pre-llenamos los inputs
  useEffect(() => {
    if (profile) {
      setSettings({
        storeName: profile.displayName || "",
        storeSlug: profile.slug || "",
        primaryColor: profile.primaryColor || "#9333ea",
        storeLogoUrl: profile.logoUrl || "",
        bannerImageUrl: profile.bannerUrl || ""
      });
    }
  }, [profile]);

  // Handler para cambios de texto y color
  const handleChange = (key: keyof IdentitySettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // 💾 Guardar los datos en el Backend (y validar slug duplicado)
  const handleSave = async () => {
    // Validaciones básicas de Frontend
    if (!settings.storeName || !settings.storeSlug) {
      toast.error("El nombre del consultorio y la URL son obligatorios");
      return;
    }

    // Llamamos al Hook mapeando los nombres de React a los de Java
    const success = await updateProfile({
      displayName: settings.storeName,
      slug: settings.storeSlug,
      primaryColor: settings.primaryColor,
      logoUrl: settings.storeLogoUrl,
      bannerUrl: settings.bannerImageUrl
    });

    // Si guardó bien (no hubo error 500 ni URL duplicada), regresamos al Checklist
    if (success) {
      router.push("/provider/store"); 
    }
  };

  // ☁️ Subir imágenes reales a GCP
  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    // Convertimos el tipo de UI al Enum de Java ('LOGO' o 'BANNER')
    const mediaType = type === 'logo' ? 'LOGO' : 'BANNER';
    
    // Subimos y esperamos la URL real de Google Cloud
    const newUrl = await uploadMedia(file, mediaType);
    
    // Actualizamos la UI para mostrar la imagen ya alojada en el servidor
    if (newUrl) {
      handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', newUrl);
    }
  };

  // Eliminar imágenes (Solo las quitamos del estado, se sobrescriben al guardar)
  const handleImageDelete = (type: 'logo' | 'banner') => {
    handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', "");
  };

  // ⏳ Pantalla de carga mientras se llama a /api/store/profile/me
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Cargando identidad de tu tienda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* 🚀 Top Bar Navigation */}
      <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-xl">
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

      {/* Contextual Header */}
      <div className="px-2">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          Dale vida a tu marca
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Configura tu identidad visual para que los pacientes te reconozcan instantáneamente.
        </p>
      </div>

      {/* 🚀 Componente de Formulario Visual Integrado */}
      <VisualIdentitySection 
        settings={settings}
        onChange={handleChange}
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
      />
      
    </div>
  );
}