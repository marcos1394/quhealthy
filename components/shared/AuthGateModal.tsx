"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ArrowRight } from "lucide-react";

import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onClose,
  icon,
  title,
  description,
}) => {
  const t = useTranslations("AuthGateModal");
  const router = useRouter();

  const modalTitle = title || t("default_title");
  const modalDescription = description || t("default_description");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── TELÓN DE FONDO (BACKDROP) ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-all"
          />

          {/* ── MODAL FLOTANTE ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-48%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-50 font-sans transition-colors select-none"
          >
            {/* Botón de Cierre */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs z-10"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>

            {/* Contenido Principal */}
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              {/* Contenedor del Icono */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs shrink-0">
                {icon || <Lock className="w-6 h-6" strokeWidth={2} />}
              </div>

              {/* Título y Descripción */}
              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {modalTitle}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px]">
                  {modalDescription}
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="w-full space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/register");
                  }}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t("btn_create_account")}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    router.push("/login");
                  }}
                  className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <span>{t("btn_login")}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};