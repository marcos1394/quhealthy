"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ContactIntegrationsSection } from "@/components/marketplace/ContactIntegrationsSection";

export default function IntegrationsPage() {
  const router = useRouter();
  const t = useTranslations("StoreIntegrations");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => router.push("/provider/store")}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
          >
            <ArrowLeft
              className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-200"
              strokeWidth={2}
            />
            <span>{t("back")}</span>
          </Button>
        </div>

        {/* Contextual Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Share2 className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-1">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              {t("subtitle")}
            </p>
          </div>
        </motion.div>

        {/* Componente Principal de Integraciones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden"
        >
          <ContactIntegrationsSection />
        </motion.div>
      </div>
    </div>
  );
}