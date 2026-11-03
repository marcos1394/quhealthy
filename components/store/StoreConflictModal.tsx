"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, X, AlertCircle, Stethoscope, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StoreConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProviderName: string;
  existingProviderName: string;
  existingProviderSlug?: string;
  existingItemsCount?: number;
  onConfirmSwitch: () => void;
  onContinuePrevious: () => void;
  brandColor?: string;
}

export const StoreConflictModal: React.FC<StoreConflictModalProps> = ({
  isOpen,
  onClose,
  currentProviderName,
  existingProviderName,
  existingItemsCount = 1,
  onConfirmSwitch,
  onContinuePrevious,
  brandColor = "#059669",
}) => {
  const t = useTranslations("StoreConflictModal");

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

  const safeColor = brandColor && brandColor !== "#ffffff" ? brandColor : "#059669";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans select-none">
          {/* Backdrop con desenfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Tarjeta Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 z-10 overflow-hidden"
          >
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabecera con Icono */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: safeColor }}
              >
                <ArrowLeftRight className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-0.5 pr-6">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {t("subtitle")}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-tight">
                  {t("title")}
                </h3>
              </div>
            </div>

            {/* Cuerpo Explicativo */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-gray-800 space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("desc", {
                    count: existingItemsCount,
                    providerName: existingProviderName,
                  })}
                </p>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  {t("question", { providerName: currentProviderName })}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2.5 pt-1">
              <Button
                type="button"
                onClick={onConfirmSwitch}
                className="w-full h-11 rounded-2xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 border-0"
                style={{ backgroundColor: safeColor }}
              >
                <Stethoscope className="w-4 h-4" />
                <span>{t("switch_btn", { providerName: currentProviderName })}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onContinuePrevious}
                className="w-full h-11 rounded-2xl text-xs font-bold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t("continue_btn", { providerName: existingProviderName })}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                {t("cancel_btn")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
