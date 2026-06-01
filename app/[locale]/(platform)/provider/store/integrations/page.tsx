"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactIntegrationsSection } from "@/components/marketplace/ContactIntegrationsSection";

export default function IntegrationsPage() {
  const router = useRouter();
  // Puedes crear un namespace 'StoreIntegrations' si quieres traducir esto después
  // const t = useTranslations('StoreIntegrations');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="max-w-5xl mx-auto pb-16 relative">

        {/* 🚀 Top Bar Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24 z-50 backdrop-blur-xl mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/provider/store')}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la Tienda
          </Button>
        </div>

        {/* Header Contextual */}
        <div className="px-2 mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20 shadow-sm">
              <Share2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Integraciones y Redes
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-base md:text-lg">
                Conecta tus redes sociales y WhatsApp para centralizar tus mensajes.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Componente principal de integraciones */}
          <ContactIntegrationsSection />
        </div>
      </div>
    </div>
  );
}
