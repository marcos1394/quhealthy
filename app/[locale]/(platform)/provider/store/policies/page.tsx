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
 <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
 <QhSpinner size="lg" />
 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
 {t('loading') || "Cargando Políticas..."}
 </p>
 </div>
 );
 }

 // ---------------------------------------------------------------------------
 // MAIN COMPONENT
 // ---------------------------------------------------------------------------
 return (
 <div className="min-h-screen bg-gray-50/30 dark:bg-[#050505]/30 p-6 md:p-12 font-sans transition-colors duration-300">
 <div className="max-w-4xl mx-auto space-y-8 pb-24">

 {/* 🚀 Top Bar Navigation */}
 <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6 sticky top-0 bg-gray-50/30 dark:bg-[#050505]/30 backdrop-blur-md z-40 pt-4">
 <Button
 variant="ghost"
 onClick={() => router.push('/provider/store')}
 className="rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-900 shadow-sm transition-colors px-4 h-12"
 >
 <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
 {t('back')}
 </Button>

 <Button
 onClick={handleSave}
 disabled={isSaving}
 className={cn(
 "rounded-xl h-12 px-8 text-sm font-bold transition-colors border-0 shadow-sm",
 isSaving 
 ? "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed" 
 : "bg-emerald-600 text-white hover:bg-emerald-700"
 )}
 >
 {isSaving ? (
 <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('btn_saving')}</>
 ) : (
 <><Save className="w-4 h-4 mr-2" strokeWidth={2} /> {t('btn_save')}</>
 )}
 </Button>
 </div>

 {/* Header Contextual */}
 <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
 <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <FileWarning className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
 {t('title')}
 </h1>
 <p className="text-sm font-medium text-gray-500">
 {t('subtitle')}
 </p>
 </div>
 </div>

 {/* Componente Integrado */}
 <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
 <CancellationPolicySection
 policyText={policyText}
 onChange={setPolicyText}
 />
 </div>

 </div>
 </div>
 );
}