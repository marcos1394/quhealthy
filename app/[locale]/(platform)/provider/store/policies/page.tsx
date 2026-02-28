"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Loader2, FileWarning } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { CancellationPolicySection } from "@/components/marketplace/CancellationPolicySection";

// Hook del backend
import { useStoreProfile } from "@/hooks/useStoreProfile";

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
      toast.error(t('toast_too_short'));
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
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-medical-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-semibold animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">

        {/* 🚀 Top Bar Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20 z-40 backdrop-blur-xl">
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
        <div className="px-2">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20 shadow-sm">
              <FileWarning className="w-8 h-8 text-rose-600 dark:text-rose-400" />
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

        {/* Componente Integrado */}
        <CancellationPolicySection
          policyText={policyText}
          onChange={setPolicyText}
        />

      </div>
    </div>
  );
}