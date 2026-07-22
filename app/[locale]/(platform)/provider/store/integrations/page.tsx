"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactIntegrationsSection } from "@/components/marketplace/ContactIntegrationsSection";

export default function IntegrationsPage() {
 const router = useRouter();
 // Puedes crear un namespace 'StoreIntegrations' si quieres traducir esto después
 // const t = useTranslations('StoreIntegrations');

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
 Volver a la Tienda
 </Button>
 </div>

 {/* Header Contextual */}
 <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
 <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <Share2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
 Integraciones y Redes
 </h1>
 <p className="text-sm font-medium text-gray-500">
 Conecta tus redes sociales y WhatsApp para centralizar tus mensajes.
 </p>
 </div>
 </div>

 {/* Componente principal de integraciones */}
 <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
 <ContactIntegrationsSection />
 </div>

 </div>
 </div>
 );
}