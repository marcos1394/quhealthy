"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, FileWarning } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { CancellationPolicySection } from "@/components/marketplace/CancellationPolicySection"; // Ajusta tu ruta

// Hook del backend
import { useStoreProfile } from "@/hooks/useStoreProfile"; 

export default function PoliciesSetupPage() {
  const router = useRouter();
  
  // Extraemos datos del Hook
  const { profile, isLoading, isSaving, updateProfile } = useStoreProfile();

  // Estado local para el texto
  const [policyText, setPolicyText] = useState("");

  // Pre-llenar input cuando lleguen los datos de la BD
  useEffect(() => {
    if (profile) {
      setPolicyText(profile.cancellationPolicy || "");
    }
  }, [profile]);

  // 💾 Guardar en la Base de Datos
  const handleSave = async () => {
    if (!policyText || policyText.length < 20) {
      toast.error("La política es muy corta. Sé claro para evitar malentendidos.");
      return;
    }

    const success = await updateProfile({
      cancellationPolicy: policyText
    });

    if (success) {
      router.push("/provider/store"); 
    }
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Cargando configuraciones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
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
            <><Save className="w-5 h-5 mr-2" /> Guardar Políticas</>
          )}
        </Button>
      </div>

      {/* Header Contextual */}
      <div className="px-2">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <FileWarning className="w-8 h-8 text-red-400" />
          Reglas del Juego
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Establece las reglas claras para tus pacientes. Un buen acuerdo previene cancelaciones de último minuto.
        </p>
      </div>

      {/* Componente Integrado */}
      <CancellationPolicySection 
        policyText={policyText} 
        onChange={setPolicyText} 
      />
      
    </div>
  );
}