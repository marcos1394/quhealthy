"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, PenTool, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProviderProfileSettings } from "@/components/provider/settings/ProviderProfileSettings";
import { PrescriptionSettings } from "@/components/provider/PrescriptionSettings";

export default function ProviderProfilePage() {
  const t = useTranslations("ProviderSettings");
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <UserCog className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("page_title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("page_subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENEDOR PRINCIPAL DE PESTAÑAS Y CONFIGURACIÓN ──────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex flex-col rounded-none"
          >
            {/* Barra de Comandos (TabsList) */}
            <TabsList className="flex items-center bg-gray-50/50 dark:bg-[#050505] p-2 gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0 h-auto rounded-none w-full justify-start overflow-x-auto custom-scrollbar">
              <TabsTrigger
                value="profile"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <User className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_profile")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="prescription"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <PenTool className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_prescription")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenido de Pestañas */}
            <div className="p-6 md:p-8">
              <TabsContent
                value="profile"
                className="m-0 focus-visible:ring-0 outline-none"
              >
                <ProviderProfileSettings />
              </TabsContent>

              <TabsContent
                value="prescription"
                className="m-0 focus-visible:ring-0 outline-none"
              >
                <PrescriptionSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>
    </div>
  );
}