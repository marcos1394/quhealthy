"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Users } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SocialMessagesView } from "./components/SocialMessagesView";
import { ClinicalMessagesView } from "./components/ClinicalMessagesView";

export default function ProviderMessagesPage() {
  const t = useTranslations("DashboardMessages");

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] w-full bg-gray-50/50 dark:bg-[#050505] pt-6 px-4 md:px-10 pb-6 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col space-y-6 min-h-0">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
              <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Centro de Comunicaciones
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                Bandeja de Mensajes
              </h1>
            </div>
          </div>
        </div>

        {/* --- CONTENEDOR PRINCIPAL DE PESTAÑAS Y MENSAJERÍA --- */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden flex-1 min-h-0">
          <Tabs defaultValue="clinical" className="flex flex-col flex-1 min-h-0 w-full rounded-none">
            
            {/* Barra de Comandos (TabsList) */}
            <TabsList className="flex items-center bg-gray-50 dark:bg-[#050505] p-2 gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0 h-auto rounded-none w-full justify-start">
              <TabsTrigger 
                value="clinical" 
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>Pacientes (Interno)</span>
              </TabsTrigger>

              <TabsTrigger 
                value="social" 
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>Redes Sociales (CRM)</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Vista de Mensajes Clínicos */}
            <TabsContent 
              value="clinical" 
              className="flex-1 min-h-0 mt-0 outline-none data-[state=active]:flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]"
            >
              <ClinicalMessagesView />
            </TabsContent>
            
            {/* Vista de Redes Sociales */}
            <TabsContent 
              value="social" 
              className="flex-1 min-h-0 mt-0 outline-none data-[state=active]:flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]"
            >
              <SocialMessagesView />
            </TabsContent>

          </Tabs>
        </div>

      </div>
    </div>
  );
}