"use client"

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

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
  title = "ACCESO REQUERIDO",
  description = "Regístrate para desbloquear esta función y acceder a toda la experiencia QuHealthy.",
}) => {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] z-50"
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors z-10"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {/* CONTENT */}
            <div className="p-8 pt-14 flex flex-col items-center text-center">
              {/* ICON */}
              <div className="w-14 h-14 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
                {icon || <Lock className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />}
              </div>

              {/* TITLE */}
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-3">
                {title}
              </h2>

              {/* DESCRIPTION */}
              <p className="text-[10px] uppercase tracking-widest text-gray-500 leading-relaxed max-w-[280px] mb-8">
                {description}
              </p>

              {/* DIVIDER */}
              <div className="w-full border-t border-gray-300 dark:border-gray-800 mb-8" />

              {/* ACTIONS */}
              <div className="w-full space-y-3">
                {/* PRIMARY — Crear Cuenta */}
                <button
                  onClick={() => {
                    onClose();
                    router.push("/register");
                  }}
                  className="w-full h-12 flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                >
                  Crear Cuenta
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>

                {/* SECONDARY — Ya Tengo Cuenta */}
                <button
                  onClick={() => {
                    onClose();
                    router.push("/login");
                  }}
                  className="w-full h-12 flex items-center justify-center gap-3 bg-transparent border border-black dark:border-white text-black dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                >
                  Ya Tengo Cuenta
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
