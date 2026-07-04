"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Loader2, FileWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CancellationPolicySection } from "@/components/marketplace/CancellationPolicySection";

// Hook del backend
import { useStoreProfile } from "@/hooks/useStoreProfile";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from "@/lib/utils";

export default function PoliciesSetupPage() {
 const router = useRouter();
 const t = useTranslations('StorePolicies');

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
 // Opcional: Puedes agregar un toast de error aquí si es muy corto
 return;
 }

 const success = await updateProfile({
 cancellationPolicy: policyText
 });

 if (success) {
 router.push("/provider/store");
 }
 };

 // ---------------------------------------------------------------------------
 // LOADING STATE
 // ---------------------------------------------------------------------------
 if (isLoading) {
 return (
 <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
 <QhSpinner size="lg" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white animate-pulse">
 {t('loading') || "Cargando Políticas..."}
 </p>
 </div>
 );
 }

 // ---------------------------------------------------------------------------
 // MAIN COMPONENT
 // ---------------------------------------------------------------------------
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
 <FileWarning className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
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

 {/* Componente Integrado (Envuelto en caja técnica para consistencia) */}
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <CancellationPolicySection
 policyText={policyText}
 onChange={setPolicyText}
 />
 </div>

 </div>
 </div>
 );
}