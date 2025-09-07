// @/app/quhealthy/components/LocationPickerWrapper.tsx

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2, MapPin } from 'lucide-react';
import { LocationData } from '@/app/quhealthy/types/location';

// Importación dinámica del componente de ubicación para evitar errores de SSR
const EnhancedLocationPicker = dynamic(
  () => import('./locationmapmodal').then(mod => ({ default: mod.EnhancedLocationPicker })),
  {
    ssr: false, // Deshabilitamos SSR para este componente
    loading: () => (
      <div className="space-y-4">
        {/* Skeleton del mapa */}
        <div className="h-64 sm:h-80 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto mb-3" />
            <p className="text-gray-300 text-sm">Cargando mapa interactivo...</p>
            <p className="text-gray-500 text-xs mt-1">Preparando componentes de geolocalización</p>
          </div>
        </div>
        
        {/* Skeleton de la barra de búsqueda */}
        <div className="space-y-3">
          <div className="h-12 bg-gray-800/50 rounded-xl animate-pulse border border-gray-700/50" />
          <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 rounded-xl p-4 border border-teal-500/20">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-teal-400 mb-2">Preparando selector de ubicación...</h4>
                <p className="text-xs text-gray-400">El mapa se cargará en un momento para que puedas seleccionar tu ubicación exacta.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
);

interface LocationPickerWrapperProps {
  onLocationSelect: (location: LocationData) => void;
}

export default function LocationPickerWrapper({ onLocationSelect }: LocationPickerWrapperProps) {
  return <EnhancedLocationPicker onLocationSelect={onLocationSelect} />;
}