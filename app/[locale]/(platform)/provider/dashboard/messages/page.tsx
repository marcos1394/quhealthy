"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Users } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SocialMessagesView } from "./components/SocialMessagesView";
import { ClinicalMessagesView } from "./components/ClinicalMessagesView";

export default function ProviderMessagesPage() {
  const t = useTranslations("DashboardMessages");

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Bandeja de Mensajes
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Gestiona tus comunicaciones por redes sociales y con tus pacientes confirmados.
        </p>
      </div>

      <Tabs defaultValue="clinical" className="flex flex-col flex-1 min-h-0 w-full">
        <TabsList className="mb-4 w-fit bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-1">
          <TabsTrigger 
            value="clinical" 
            className="flex items-center gap-2 px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-medical-700 data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">Pacientes (Chat Interno)</span>
          </TabsTrigger>
          <TabsTrigger 
            value="social" 
            className="flex items-center gap-2 px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">Redes Sociales (CRM)</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinical" className="flex-1 min-h-0 mt-0 outline-none">
          <ClinicalMessagesView />
        </TabsContent>
        
        <TabsContent value="social" className="flex-1 min-h-0 mt-0 outline-none">
          <SocialMessagesView />
        </TabsContent>
      </Tabs>
    </div>
  );
}