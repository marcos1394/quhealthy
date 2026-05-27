"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, ShieldCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem("quhealthy_cookie_consent");
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("quhealthy_cookie_consent", "all");
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("quhealthy_cookie_consent", "essential");
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("quhealthy_cookie_consent", "custom");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto md:w-[480px] z-[9999] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-slate-800 overflow-hidden font-sans"
        >
          {showPreferences ? (
            // Preferences View
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Preferencias</h3>
                </div>
                <button onClick={() => setShowPreferences(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Esenciales
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Necesarias para el funcionamiento básico del sitio. No se pueden desactivar.</p>
                  </div>
                  <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-medical-600 cursor-not-allowed opacity-70">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-4" />
                  </div>
                </div>
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Analíticas</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nos ayudan a entender cómo usas QuHealthy para mejorar tu experiencia.</p>
                  </div>
                  <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Marketing</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Utilizadas para mostrarte anuncios relevantes y campañas personalizadas.</p>
                  </div>
                  <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 h-12 rounded-xl text-sm font-medium">
                Guardar Preferencias
              </Button>
            </div>
          ) : (
            // Default View
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Cookie className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight mb-1">Privacidad y Cookies</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    Utilizamos cookies para mejorar tu experiencia, analizar nuestro tráfico y personalizar el contenido. Al hacer clic en "Aceptar todas", aceptas su uso.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <Button 
                  onClick={handleAcceptAll} 
                  className="w-full sm:flex-1 bg-medical-600 hover:bg-medical-700 text-white rounded-xl h-11 text-sm font-medium"
                >
                  Aceptar todas
                </Button>
                <div className="flex items-center gap-3 w-full sm:flex-1">
                  <Button 
                    variant="outline" 
                    onClick={handleRejectAll}
                    className="flex-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl h-11 text-sm font-medium"
                  >
                    Rechazar
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowPreferences(true)}
                    className="flex-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl h-11 text-sm font-medium"
                  >
                    Configurar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
