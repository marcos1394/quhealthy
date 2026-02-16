"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  MapPin, 
  Navigation, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LocationPickerProps } from '@/types/location';

// --- CONFIGURACIÓN DE CARGA ---
const loadingStages = [
  { id: 1, label: 'Iniciando Mapas', duration: 1000 },
  { id: 2, label: 'Sincronizando con Google', duration: 1500 },
  { id: 3, label: 'Preparando vista interactiva', duration: 500 }
];

// --- COMPONENTE SKELETON (UX PREMIUM) ---
const MapLoadingSkeleton = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 5));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = loadingStages.map((stage, index) => {
      const delay = loadingStages.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => setCurrentStage(index), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-80 rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden relative"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 bg-gray-950/40">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-5 bg-purple-500/10 rounded-2xl border border-purple-500/20"
          >
            <MapPin className="w-10 h-10 text-purple-500" />
          </motion.div>

          <div className="text-center space-y-1">
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <p className="text-white text-sm font-bold tracking-tight">
                {loadingStages[currentStage]?.label || 'Cargando...'}
              </p>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-medium">Configurando ubicación exacta</p>
          </div>

          <div className="w-full max-w-[200px] h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progress}%` }} 
              className="h-full bg-purple-500" 
            />
          </div>
        </div>
      </motion.div>

      <div className="h-14 bg-gray-900/50 rounded-2xl border border-gray-800 flex items-center px-4 gap-3">
        <Navigation className="w-4 h-4 text-gray-700" />
        <div className="w-32 h-2 bg-gray-800 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

// --- IMPORTACIÓN DINÁMICA DEL MOTOR REAL ---
// Importamos el modal que creamos antes, el cual tiene toda la lógica de Google
const MapEngine = dynamic(
  () => import('./MapModal'), 
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />
  }
);

// --- COMPONENTE PRINCIPAL ---
export default function LocationPicker({ 
   onLocationSelect,
  initialLocation,
  className 
}: LocationPickerProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Simulamos una verificación de carga para mostrar el badge de éxito
  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div className={cn("p-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-center space-y-4")}>
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-white font-bold">Error de Conexión</h3>
          <p className="text-gray-500 text-sm">No pudimos establecer conexión con los servicios de Mapas.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-all"
        >
          REINTENTAR CARGA
        </button>
      </div>
    );
  }

  return (
    <div className={cn("relative group")}>
      {/* Contenedor del Mapa / Engine */}
      <div className="relative z-0">
        <MapEngine 
          onLocationSelect={onLocationSelect}
          initialLocation={initialLocation}
        />
      </div>
      
      {/* Badge de Estado - FEEDBACK VISUAL */}
      <AnimatePresence>
        {isMapReady && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-4 right-4 z-10 pointer-events-none"
          >
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-md px-3 py-1 shadow-xl">
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              Sincronizado con Google
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Tip Inferior */}
      <div className="mt-4 flex items-start gap-3 px-2">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Info className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-[11px] text-gray-500 leading-relaxed italic">
          <strong>Tip Pro:</strong> Si tu consultorio está dentro de una plaza o torre médica, mueve el marcador rojo exactamente sobre el local o entrada principal para guiar mejor a tus pacientes.
        </div>
      </div>
    </div>
  );
}

// Exportamos props para mantener consistencia
export type { LocationPickerProps };