"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageSquare, Users } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SocialMessagesView } from "./components/SocialMessagesView";
import { ClinicalMessagesView } from "./components/ClinicalMessagesView";

export default function ProviderMessagesPage() {
  const t = useTranslations("DashboardMessages");
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("clinical");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "social" || window.location.hash === "#social") {
      setActiveTab("social");
    } else if (tab === "clinical" || window.location.hash === "#clinical") {
      setActiveTab("clinical");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4.5rem)] w-full bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-3 md:pt-4 px-2 sm:px-4 md:px-6 pb-3 md:pb-4 overflow-hidden">
      <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col space-y-3 min-h-0">
        
        {/* ── HEADER PRINCIPAL COMPACTO ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                {t("title")}
              </h1>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-normal">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENEDOR PRINCIPAL DE PESTAÑAS Y VISTAS DE CHAT ──────────── */}
        <div className="bg-white dark:bg-[#111b21] border border-gray-200/80 dark:border-gray-800 flex flex-col rounded-2xl shadow-sm overflow-hidden flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0 w-full rounded-none">
            
            {/* Barra de Selección (TabsList) */}
            <TabsList className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] p-1.5 gap-1.5 border-b border-black/[0.04] dark:border-white/[0.04] shrink-0 h-auto rounded-none w-full justify-start overflow-x-auto custom-scrollbar">
              <TabsTrigger 
                value="clinical" 
                className="h-9 px-4 rounded-xl border border-transparent data-[state=active]:border-black/5 dark:data-[state=active]:border-white/5 data-[state=active]:bg-white dark:data-[state=active]:bg-[#111b21] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs bg-transparent text-[#54656f] dark:text-[#8696a0] hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Users className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_inbox")}</span>
              </TabsTrigger>

              <TabsTrigger 
                value="social" 
                className="h-9 px-4 rounded-xl border border-transparent data-[state=active]:border-black/5 dark:data-[state=active]:border-white/5 data-[state=active]:bg-white dark:data-[state=active]:bg-[#111b21] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs bg-transparent text-[#54656f] dark:text-[#8696a0] hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_social")}</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Vista 1: Mensajes Clínicos Directos */}
            <TabsContent 
              value="clinical" 
              className="flex-1 min-h-0 mt-0 outline-none data-[state=active]:flex flex-col overflow-hidden bg-white dark:bg-[#111b21]"
            >
              <ClinicalMessagesView />
            </TabsContent>
            
            {/* Vista 2: Mensajes Omnicanal / CRM Redes Sociales */}
            <TabsContent 
              value="social" 
              className="flex-1 min-h-0 mt-0 outline-none data-[state=active]:flex flex-col overflow-hidden bg-white dark:bg-[#111b21]"
            >
              <SocialMessagesView />
            </TabsContent>

          </Tabs>
        </div>

      </div>
    </div>
  );
}