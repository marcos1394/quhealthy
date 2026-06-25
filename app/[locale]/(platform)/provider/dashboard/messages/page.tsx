"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Users } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SocialMessagesView } from "./components/SocialMessagesView";
import { ClinicalMessagesView } from "./components/ClinicalMessagesView";

export default function ProviderMessagesPage() {
  const t = useTranslations("DashboardMessages");

  return (
    // 1. Añadimos overflow-hidden para evitar que la página entera haga scroll
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] w-full bg-gray-50 dark:bg-[#050505] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors overflow-hidden">
      
      {/* HEADER ARQUITECTÓNICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 pt-6 pb-6 border-b border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              Centro de Comunicaciones
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
              BANDEJA DE MENSAJES
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              GESTIÓN DE COMUNICACIONES CLÍNICAS Y REDES SOCIALES.
            </p>
          </div>
        </div>
      </div>

      {/* SISTEMA DE PESTAÑAS Y CONTENIDO */}
      <Tabs defaultValue="clinical" className="flex flex-col flex-1 min-h-0 w-full rounded-none">
        
        {/* Barra de Comandos (TabsList) */}
        <TabsList className="flex flex-row w-full bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20 p-0 h-auto rounded-none justify-start shrink-0">
          <TabsTrigger 
            value="clinical" 
            className="flex-1 sm:flex-none sm:w-64 rounded-none border-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-14 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
            PACIENTES (INTERNO)
          </TabsTrigger>
          <TabsTrigger 
            value="social" 
            className="flex-1 sm:flex-none sm:w-64 rounded-none border-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-14 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
            REDES SOCIALES (CRM)
          </TabsTrigger>
        </TabsList>
        
        {/* 2. EL FIX PRINCIPAL: data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden */}
        {/* Esto asegura que cuando la pestaña está activa, actúe como un flex rígido que no se desborda */}
        <TabsContent value="clinical" className="flex-1 min-h-0 mt-0 outline-none data-[state=active]:flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
          <ClinicalMessagesView />
        </TabsContent>
        
        <TabsContent value="social" className="flex-1 min-h-0 mt-0 outline-none data-[state=active]:flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
          <SocialMessagesView />
        </TabsContent>

      </Tabs>
    </div>
  );
}