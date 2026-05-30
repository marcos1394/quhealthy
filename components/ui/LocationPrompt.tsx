"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { googleService } from "@/services/google.service";
import { toast } from "react-toastify";

export const LocationPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { coordinates, error } = useGeolocation(); // Esto no pide permiso hasta que lo triggereamos si se modifica, pero el hook actual lo pide OnMount. 
  
  // Como tu hook `useGeolocation` pide la ubicación en `useEffect` al montar,
  // la mejor aproximación "Enterprise" es detectar si ya se concedió silenciosamente,
  // o mostrar un pequeño toast persuasivo ANTES de montar el hook, pero como el hook ya está hecho,
  // vamos a interceptarlo mostrando este toast persuasivo flotante.

  useEffect(() => {
    // Mostrar el prompt solo si no hemos guardado la preferencia
    const hasPrompted = sessionStorage.getItem("quhealthy_location_prompted");
    if (!hasPrompted && !coordinates) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [coordinates]);

  // Si tenemos coordenadas pero no hemos mostrado la alerta de ciudad
  useEffect(() => {
    if (coordinates && !sessionStorage.getItem("quhealthy_city_welcomed")) {
      const fetchCity = async () => {
        try {
          const res = await googleService.reverseGeocode(coordinates.lat, coordinates.lng);
          if (res && res.city) {
            toast.success(`Notamos que estás en ${res.city}. ¡Encuentra especialistas cerca!`, {
              position: "top-right",
              autoClose: 5000,
              icon: () => <>📍</>
            });
            sessionStorage.setItem("quhealthy_city_welcomed", "true");
          }
        } catch (e) {
          console.error("Error reverse geocoding:", e);
        }
      };
      fetchCity();
    }
  }, [coordinates]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("quhealthy_location_prompted", "true");
  };

  const handleActivate = () => {
    setIsProcessing(true);
    // Forzamos al navegador a pedir permiso
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsProcessing(false);
          setIsVisible(false);
          sessionStorage.setItem("quhealthy_location_prompted", "true");
          // El useEffect de arriba detectará las coordenadas (vía hook si se refresca el state global, o lo hacemos manual)
          window.location.reload(); // Recarga limpia para que el hook principal tome las coordenadas
        },
        (err) => {
          setIsProcessing(false);
          toast.error("No se pudo obtener la ubicación. Por favor revisa los permisos de tu navegador.");
        }
      );
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[9000] bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl border border-medical-100 dark:border-medical-900/50"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
          
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center shrink-0">
              <Navigation className="w-6 h-6 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Mejora tu experiencia</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Permite el acceso a tu ubicación para mostrarte los mejores especialistas y servicios cerca de ti.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleActivate} 
                  disabled={isProcessing}
                  className="bg-medical-600 hover:bg-medical-700 text-white rounded-lg h-9 text-xs px-4"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <MapPin className="w-3.5 h-3.5 mr-1" />}
                  Activar Ubicación
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-9 text-xs px-3"
                >
                  Ahora no
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
