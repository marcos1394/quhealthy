"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-react19-deprecated-apis */;;

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { googleService } from "@/services/google.service";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

export const LocationPrompt = () => {
  const t = useTranslations('LocationPrompt');
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Solo mostramos el prompt si NO se ha interactuado antes con él
  useEffect(() => {
    const hasPrompted = sessionStorage.getItem("quhealthy_location_prompted");
    if (hasPrompted) return;

    // Primero checamos si ya tenemos permiso (sin pedirlo de nuevo)
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          // Ya tiene permiso — obtenemos coords silenciosamente sin mostrar prompt
          silentFetchLocation();
        } else if (result.state === "prompt") {
          // Aún no ha decidido — mostramos nuestro prompt persuasivo después de 3s
          const timer = setTimeout(() => setIsVisible(true), 3000);
          return () => clearTimeout(timer);
        }
        // Si es "denied", no mostramos nada
      });
    } else {
      // Navegador sin Permissions API — mostramos el prompt como fallback
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // ✅ Obtener ubicación silenciosamente (ya tiene permiso)
  const silentFetchLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        sessionStorage.setItem("quhealthy_location_prompted", "true");
        try {
          const res = await googleService.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          if (res?.city && !sessionStorage.getItem("quhealthy_city_welcomed")) {
            toast.success(t('city_welcome', { city: res.city }), {
              position: "top-right",
              autoClose: 5000,
              icon: () => <>📍</>
            });
            sessionStorage.setItem("quhealthy_city_welcomed", "true");
          }
        } catch (e) {
          console.error("Error reverse geocoding:", e);
        }
      },
      () => {
        // Silencioso — no mostramos error si falla
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, [t]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("quhealthy_location_prompted", "true");
  };

  // ✅ Cuando el usuario presiona "Activar Ubicación" — pedimos permiso al navegador
  const handleActivate = () => {
    setIsProcessing(true);

    if (!navigator.geolocation) {
      setIsProcessing(false);
      toast.error(t('not_supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsProcessing(false);
        setIsVisible(false);
        sessionStorage.setItem("quhealthy_location_prompted", "true");

        // Mostramos la ciudad
        try {
          const res = await googleService.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          if (res?.city) {
            toast.success(t('city_welcome', { city: res.city }), {
              position: "top-right",
              autoClose: 5000,
              icon: () => <>📍</>
            });
            sessionStorage.setItem("quhealthy_city_welcomed", "true");
          }
        } catch (e) {
          console.error("Error reverse geocoding:", e);
        }
      },
      (err) => {
        setIsProcessing(false);
        setIsVisible(false);
        sessionStorage.setItem("quhealthy_location_prompted", "true");
        if (err.code === err.PERMISSION_DENIED) {
          toast.info(t('denied'), {
            position: "top-right",
            autoClose: 4000,
          });
        } else {
          toast.error(t('error'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[9000] bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
          
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Navigation className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t('title')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {t('description')}
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleActivate} 
                  disabled={isProcessing}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-lg h-9 text-xs px-4"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <MapPin className="w-3.5 h-3.5 mr-1" />}
                  {t('activate_btn')}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-9 text-xs px-3"
                >
                  {t('dismiss_btn')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
