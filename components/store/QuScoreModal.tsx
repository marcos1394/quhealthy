"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Star,
  UserCheck,
  Activity,
  FileText,
  ArrowRight,
  Zap,
} from "lucide-react";

import { ProviderScoreResponse } from "@/types/providerScore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreData: ProviderScoreResponse | null;
}

export const QuScoreModal: React.FC<QuScoreModalProps> = ({
  isOpen,
  onClose,
  scoreData,
}) => {
  const t = useTranslations("QuScoreModal");
  const router = useRouter();

  // Bloqueo de scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!scoreData) return null;

  const getPillarIcon = (key: string, name: string) => {
    const identifier = `${key} ${name}`.toUpperCase();
    if (
      identifier.includes("P1") ||
      identifier.includes("SEGURIDAD") ||
      identifier.includes("SECURITY")
    )
      return <ShieldCheck className="w-5 h-5" strokeWidth={2} />;
    if (
      identifier.includes("P2") ||
      identifier.includes("FAVORITO") ||
      identifier.includes("REPUTACIÓN")
    )
      return <Star className="w-5 h-5" strokeWidth={2} />;
    if (
      identifier.includes("P3") ||
      identifier.includes("PRESENCIA") ||
      identifier.includes("DIGITAL")
    )
      return <Activity className="w-5 h-5" strokeWidth={2} />;
    if (
      identifier.includes("P4") ||
      identifier.includes("PACIENTE") ||
      identifier.includes("USUARIO")
    )
      return <UserCheck className="w-5 h-5" strokeWidth={2} />;
    if (
      identifier.includes("P5") ||
      identifier.includes("TRANSPARENCIA") ||
      identifier.includes("INFORMACIÓN")
    )
      return <FileText className="w-5 h-5" strokeWidth={2} />;
    return <Zap className="w-5 h-5" strokeWidth={2} />;
  };

  const getStatusFill = (status: string) => {
    switch (status) {
      case "OPTIMAL":
        return "bg-emerald-600 dark:bg-emerald-400";
      case "IMPROVABLE":
        return "bg-amber-400 dark:bg-amber-500";
      case "LOW":
        return "bg-rose-500 dark:bg-rose-400";
      default:
        return "bg-gray-300 dark:bg-gray-700";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans select-none"
        >
          {/* Fondo Translúcido */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Panel Modal Flotante */}
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-[90vw] sm:max-w-xl bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col max-h-[75vh] z-10 overflow-hidden"
          >
            {/* Cabecera */}
            <div className="relative border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 sm:p-6 md:p-8 flex items-end justify-between shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs z-10"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>

              <div className="pr-4 space-y-0.5">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t("title")}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              <div className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-emerald-600 dark:text-emerald-400 pl-4 shrink-0">
                {scoreData.score}
              </div>
            </div>

            {/* Cuerpo de Desglose */}
            <div className="p-5 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-white dark:bg-[#0a0a0a] space-y-6">
              {scoreData.isNewProvider && (
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-2xs">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-relaxed text-center">
                    {t("new_provider_notice")}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(scoreData.breakdown).map(([key, pillar]) => (
                  <div key={key} className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                          {getPillarIcon(key, pillar.name)}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white tracking-tight">
                            {pillar.name}
                          </h4>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[220px] sm:max-w-[280px] leading-relaxed">
                            {pillar.tooltip}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-mono font-bold text-gray-900 dark:text-white tracking-tight shrink-0">
                        {pillar.percentage}%
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-2xs">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pillar.percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className={cn(
                          "h-full rounded-full",
                          getStatusFill(pillar.status)
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    router.push("/es/como-funciona-el-quscore");
                  }}
                  className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t("btn_methodology")}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};