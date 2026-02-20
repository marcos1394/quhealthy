"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
// Asegúrate de ajustar esta ruta según dónde guardaste el componente
import { VisualIdentitySection, IdentitySettings } from "@/components/marketplace/VisualIdentitySection";

export default function IdentitySetupPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // 🚧 TODO: Reemplazar estado inicial con datos reales de la BD
  const [settings, setSettings] = useState<IdentitySettings>({
    storeName: "",
    storeSlug: "",
    primaryColor: "#9333ea",
    storeLogoUrl: "",
    bannerImageUrl: ""
  });

  const handleChange = (key: keyof IdentitySettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validaciones básicas
    if (!settings.storeName || !settings.storeSlug) {
      toast.error("El nombre y la URL son obligatorios");
      return;
    }

    setIsSaving(true);
    try {
      // 🚧 TODO: Conectar con axiosInstance.put('/api/catalog/store/identity', settings)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulando red
      
      toast.success("Identidad visual guardada exitosamente");
      router.push("/provider/store"); // Regresar al checklist
    } catch (error) {
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/provider/store')}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a Mi Tienda
        </Button>

        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>
          )}
        </Button>
      </div>

      {/* Renderizamos tu componente espectacular aquí */}
      <VisualIdentitySection 
        settings={settings}
        onChange={handleChange}
        onImageUpload={(type, file) => {
          // Lógica temporal visual. En producción, sube el file a S3/GCS y guarda la URL
          const tempUrl = URL.createObjectURL(file);
          handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', tempUrl);
        }}
        onImageDelete={(type) => {
          handleChange(type === 'logo' ? 'storeLogoUrl' : 'bannerImageUrl', '');
        }}
      />
      
    </div>
  );
}