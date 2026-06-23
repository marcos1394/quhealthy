"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, PenTool, CreditCard, Plug, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProviderProfileSettings } from "@/components/provider/settings/ProviderProfileSettings";
import { ProviderSecuritySettings } from "@/components/provider/settings/ProviderSecuritySettings";
import { PrescriptionSettings } from "@/components/provider/PrescriptionSettings";
import { ProviderSubscriptionSettings } from "@/components/provider/settings/ProviderSubscriptionSettings";
import { ProviderConnectionsSettings } from "@/components/provider/settings/ProviderConnectionsSettings";
import { ProviderTeamSettings } from "@/components/provider/settings/ProviderTeamSettings";

export default function ProviderSettingsPage() {
  const t = useTranslations('ProviderSettings');
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 border-b border-black/20 dark:border-white/20 pb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white uppercase tracking-tighter">
          Panel de Configuración
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
          Administra tu identidad digital, seguridad y parámetros operativos.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-transparent border-b border-gray-200 dark:border-gray-800 w-full justify-start h-auto p-0 rounded-none overflow-x-auto flex-nowrap hide-scrollbar">
          <TabsTrigger 
            value="profile"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white flex items-center gap-2"
          >
            <User className="w-4 h-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white flex items-center gap-2"
          >
            <Shield className="w-4 h-4" /> Seguridad
          </TabsTrigger>
          <TabsTrigger 
            value="prescription"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white flex items-center gap-2"
          >
            <PenTool className="w-4 h-4" /> Receta Digital
          </TabsTrigger>
          <TabsTrigger 
            value="subscription"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" /> Suscripción
          </TabsTrigger>
          <TabsTrigger 
            value="connections"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white flex items-center gap-2"
          >
            <Plug className="w-4 h-4" /> Integraciones
          </TabsTrigger>
          <TabsTrigger 
            value="team"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Equipo
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="profile" className="m-0 focus-visible:ring-0">
            <ProviderProfileSettings />
          </TabsContent>
          
          <TabsContent value="security" className="m-0 focus-visible:ring-0">
            <ProviderSecuritySettings />
          </TabsContent>
          
          <TabsContent value="prescription" className="m-0 focus-visible:ring-0">
            <PrescriptionSettings />
          </TabsContent>

          <TabsContent value="subscription" className="m-0 focus-visible:ring-0">
            <ProviderSubscriptionSettings />
          </TabsContent>

          <TabsContent value="connections" className="m-0 focus-visible:ring-0">
            <ProviderConnectionsSettings />
          </TabsContent>

          <TabsContent value="team" className="m-0 focus-visible:ring-0">
            <ProviderTeamSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
