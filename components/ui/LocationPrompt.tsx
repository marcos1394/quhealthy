"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-react19-deprecated-apis */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { googleService } from "@/services/google.service";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

const PROMPT_SESSION_KEY = "quhealthy_location_prompted";
const PROMPT_DISMISSED_AT_KEY = "quhealthy_location_dismissed_at";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const LocationPrompt = () => {
  const t = useTranslations("LocationPrompt");
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Obtener ubicación silenciosamente cuando ya se cuenta con permiso otorgado
  const silentFetchLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        sessionStorage.setItem(PROMPT_SESSION_KEY, "true");
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        try {
          sessionStorage.setItem("quhealthy_user_coords", JSON.stringify(coords));
          localStorage.setItem("quhealthy_location_permission", "granted");
          window.dispatchEvent(
            new CustomEvent("quhealthy_location_updated", { detail: coords })
          );
        } catch (err) {
          console.error("Error saving user coords:", err);
        }

        try {
          const res = await googleService.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          if (res?.city && !sessionStorage.getItem("quhealthy_city_welcomed")) {
            toast.success(t("city_welcome", { city: res.city }), {
              position: "top-right",
              autoClose: 5000,
              icon: () => <>📍</>,
            });
            sessionStorage.setItem("quhealthy_city_welcomed", "true");
          }
        } catch (e) {
          console.error("Error reverse geocoding:", e);
        }
      },
      () => {
        // Silencioso — no interrumpir la experiencia de usuario
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, [t]);

  // ✅ Solo mostramos el prompt si NO se ha interactuado antes con él en la sesión y no fue descartado recientemente
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasPrompted = sessionStorage.getItem(PROMPT_SESSION_KEY);
    if (hasPrompted) return;

    // Verificar si fue descartado hace menos de 3 días
    const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_AT_KEY);
    if (dismissedAt) {
      const timePassed = Date.now() - parseInt(dismissedAt, 10);
      if (!isNaN(timePassed) && timePassed < THREE_DAYS_MS) {
        return;
      }
    }

    // Checar Permissions API si está disponible
    if (navigator.permissions && navigator.permissions.query) {
      let isMounted = true;
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (!isMounted) return;
          if (result.state === "granted") {
            // Permiso ya concedido previamente
            silentFetchLocation();
          } else if (result.state === "prompt") {
            // Usuario aún no decide: mostrar prompt persuasivo tras breve pausa
            const timer = setTimeout(() => {
              if (isMounted) setIsVisible(true);
            }, 2500);
            return () => clearTimeout(timer);
          }
          // Si el estado es "denied", no insistir
        })
        .catch(() => {
          const timer = setTimeout(() => {
            if (isMounted) setIsVisible(true);
          }, 2500);
          return () => clearTimeout(timer);
        });

      return () => {
        isMounted = false;
      };
    } else {
      // Fallback para navegadores sin Permissions API
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [silentFetchLocation]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(PROMPT_SESSION_KEY, "true");
    localStorage.setItem(PROMPT_DISMISSED_AT_KEY, Date.now().toString());
  };

  // ✅ Cuando el usuario pulsa "Activar Ubicación"
  const handleActivate = () => {
    setIsProcessing(true);

    if (!navigator.geolocation) {
      setIsProcessing(false);
      toast.error(t("not_supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsProcessing(false);
        setIsVisible(false);
        sessionStorage.setItem(PROMPT_SESSION_KEY, "true");

        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        try {
          sessionStorage.setItem("quhealthy_user_coords", JSON.stringify(coords));
          localStorage.setItem("quhealthy_location_permission", "granted");
          window.dispatchEvent(
            new CustomEvent("quhealthy_location_updated", { detail: coords })
          );
        } catch (err) {
          console.error("Error saving user coords:", err);
        }

        try {
          const res = await googleService.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          if (res?.city && !sessionStorage.getItem("quhealthy_city_welcomed")) {
            toast.success(t("city_welcome", { city: res.city }), {
              position: "top-right",
              autoClose: 5000,
              icon: () => <>📍</>,
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
        sessionStorage.setItem(PROMPT_SESSION_KEY, "true");
        localStorage.setItem(PROMPT_DISMISSED_AT_KEY, Date.now().toString());

        if (err.code === err.PERMISSION_DENIED) {
          toast.info(t("denied"), {
            position: "top-right",
            autoClose: 4000,
          });
        } else {
          toast.error(t("error"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-[390px] z-[90] bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-md p-5 sm:p-5.5 rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 font-sans select-none transition-colors"
        >
          {/* Botón Cerrar (X) */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t("dismiss_btn")}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-xl border border-gray-200/70 dark:border-gray-800 bg-gray-50/60 dark:bg-[#141414] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>

          <div className="flex items-start gap-3.5">
            {/* Ícono de Marca QuHealthy con efecto pulso */}
            <div className="relative shrink-0 mt-0.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center shadow-2xs">
                <MapPin className="w-5 h-5 text-[#1D9E75] dark:text-[#5DCAA5]" strokeWidth={2.2} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>

            {/* Contenido Textual */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("title")}
                </h4>
                <Badge className="bg-emerald-50 text-[#1D9E75] dark:bg-emerald-950/40 dark:text-[#5DCAA5] border border-emerald-200/60 dark:border-emerald-800/60 rounded-full text-[9px] font-extrabold px-1.5 py-0 leading-none shadow-2xs">
                  {t("badge")}
                </Badge>
              </div>

              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {t("description")}
              </p>

              {/* Acciones de Localización */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleActivate}
                  disabled={isProcessing}
                  className="flex-1 bg-[#1D9E75] hover:bg-[#178563] active:scale-[0.98] text-white rounded-xl h-10 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <QhSpinner size="sm" className="text-white" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{t("activate_btn")}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDismiss}
                  className="border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#141414] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl h-10 text-xs font-bold transition-all shadow-2xs cursor-pointer px-3.5"
                >
                  {t("dismiss_btn")}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
