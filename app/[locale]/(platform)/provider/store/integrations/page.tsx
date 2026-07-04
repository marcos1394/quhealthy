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
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] p-6 md:p-12 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
 <div className="max-w-4xl mx-auto space-y-12 pb-24">

 {/* 🚀 Top Bar Navigation (Blueprint) */}
 <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 sticky top-0 bg-white dark:bg-[#0a0a0a] z-40 pt-4">
 <Button
 variant="ghost"
 onClick={() => router.push('/provider/store')}
 className="rounded-none text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors px-4"
 >
 <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={2} />
 Volver a la Tienda
 </Button>
 </div>

 {/* Header Contextual */}
 <div className="flex flex-col md:flex-row md:items-center gap-6">
 <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
 <Share2 className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight mb-2">
 Integraciones y Redes
 </h1>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Conecta tus redes sociales y WhatsApp para centralizar tus mensajes.
 </p>
 </div>
 </div>

 {/* Componente principal de integraciones (Envuelto en caja técnica) */}
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <ContactIntegrationsSection />
 </div>

 </div>
 </div>
 );
}