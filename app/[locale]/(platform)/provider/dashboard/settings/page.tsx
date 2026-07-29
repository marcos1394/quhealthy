"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CreditCard, Plug, Users, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProviderSecuritySettings } from "@/components/provider/settings/ProviderSecuritySettings";
import { ProviderSubscriptionSettings } from "@/components/provider/settings/ProviderSubscriptionSettings";
import { ProviderConnectionsSettings } from "@/components/provider/settings/ProviderConnectionsSettings";
import { ProviderTeamSettings } from "@/components/provider/settings/ProviderTeamSettings";

export default function ProviderSettingsPage() {
  const t = useTranslations("ProviderSettings");
  const [activeTab, setActiveTab] = useState("security");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["security", "subscription", "connections", "team"].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Settings className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("panel_title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("panel_subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENEDOR PRINCIPAL DE PESTAÑAS ────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full flex flex-col rounded-none"
          >
            {/* Barra de Navegación de Pestañas */}
            <TabsList className="flex items-center bg-gray-50/50 dark:bg-[#050505] p-2 gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0 h-auto rounded-none w-full justify-start overflow-x-auto custom-scrollbar">
              <TabsTrigger
                value="security"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Shield className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_security")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="subscription"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <CreditCard className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_subscription")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="connections"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Plug className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_connections")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="team"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Users className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tab_team")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenido de Pestañas */}
            <div className="p-6 md:p-8">
              <TabsContent
                value="security"
                className="m-0 focus-visible:ring-0 outline-none"
              >
                <ProviderSecuritySettings />
              </TabsContent>

              <TabsContent
                value="subscription"
                className="m-0 focus-visible:ring-0 outline-none"
              >
                <ProviderSubscriptionSettings />
              </TabsContent>

              <TabsContent
                value="connections"
                className="m-0 focus-visible:ring-0 outline-none"
              >
                <ProviderConnectionsSettings />
              </TabsContent>

              <TabsContent
                value="team"
                className="m-0 focus-visible:ring-0 outline-none"
              >
                <ProviderTeamSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>
    </div>
  );
}