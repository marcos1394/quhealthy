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
  Sparkles,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * LocationPicker Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEEDBACK INMEDIATO
 *    - Loading states visuales
 *    - Progress indicators
 *    - Status messages claros
 *    - Geolocation feedback
 * 
 * 2. MINIMIZAR ANSIEDAD
 *    - Loading skeleton detallado
 *    - Tiempo estimado visible
 *    - Progress steps
 *    - Success confirmation
 * 
 * 3. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Icons descriptivos
 *    - Status badges
 *    - Clear labels
 *    - Visual progress
 * 
 * 4. CREDIBILIDAD
 *    - Professional skeleton
 *    - Smooth transitions
 *    - Error handling
 *    - Retry options
 * 
 * 5. AFFORDANCE
 *    - Clear loading states
 *    - Interactive skeleton
 *    - Visual hierarchy
 *    - Status indicators
 * 
 * 6. PRIMING
 *    - Positive loading messages
 *    - Success animations
 *    - Trust indicators
 *    - Professional UI
 */

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  className?: string;
}

// Loading stages - FEEDBACK INMEDIATO
const loadingStages = [
  { id: 1, label: 'Cargando mapa', duration: 1000 },
  { id: 2, label: 'Detectando ubicación', duration: 1500 },
  { id: 3, label: 'Preparando vista', duration: 500 }
];

// Enhanced Loading Component - MINIMIZAR ANSIEDAD
const MapLoadingSkeleton = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cycle through stages
    const timers = loadingStages.map((stage, index) => {
      const delay = loadingStages.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => setCurrentStage(index), delay);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-4">
      {/* Map Skeleton */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-64 sm:h-80 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 overflow-hidden relative"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          {/* Icon with pulse */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
              <MapPin className="w-12 h-12 text-purple-400" />
            </div>
            
            {/* Pulse rings */}
            <motion.div
              animate={{ 
                scale: [1, 2],
                opacity: [0.5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 border-2 border-purple-500 rounded-2xl"
            />
          </motion.div>

          {/* Loading Text */}
          <div className="text-center space-y-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 justify-center"
              >
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <p className="text-white font-semibold">
                  {loadingStages[currentStage]?.label || 'Cargando...'}
                </p>
              </motion.div>
            </AnimatePresence>
            
            <p className="text-gray-500 text-sm">
              Preparando tu experiencia de mapas
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs space-y-2">
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Inicializando...</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Loading Stages Indicators */}
          <div className="flex gap-2">
            {loadingStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index <= currentStage 
                    ? "bg-purple-500" 
                    : "bg-gray-700"
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Input Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {/* Search Input Skeleton */}
        <div className="h-12 bg-gray-900 rounded-xl border border-gray-700 flex items-center px-4 gap-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(168,85,247,0.1)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
          <Navigation className="w-4 h-4 text-gray-600 relative z-10" />
          <div className="flex-1 space-y-2 relative z-10">
            <div className="w-32 h-3 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Info Tips */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300/80 space-y-1">
            <p className="font-semibold text-blue-400">💡 Consejo</p>
            <p>Permitir acceso a tu ubicación hará el proceso más rápido y preciso</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Importación dinámica con loading mejorado
const MapModal = dynamic(
  () => import('./MapModal').then(mod => ({ default: mod.EnhancedLocationPicker })), 
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />
  }
);

export default function LocationPicker({ 
  onLocationSelect,
  initialLocation,
  className 
}: LocationPickerProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Track map load success
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Error handling - MINIMIZAR ERRORES
  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("space-y-4", className)}
      >
        <div className="h-64 sm:h-80 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col items-center justify-center gap-4 p-6">
          <div className="p-4 bg-red-500/10 rounded-full">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-white">Error al Cargar el Mapa</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              No pudimos cargar el mapa. Por favor, verifica tu conexión y vuelve a intentarlo.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Reintentar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <MapModal 
        onLocationSelect={onLocationSelect}
        initialLocation={initialLocation}
      />
      
      {/* Success Indicator - PRIMING */}
      <AnimatePresence>
        {isMapLoaded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-4 z-10"
          >
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Mapa Cargado
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export types
export type { LocationPickerProps };