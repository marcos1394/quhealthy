"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Definimos el tipo aquí o lo importamos de @/types
export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Importación dinámica del componente pesado (Mapa)
const MapModal = dynamic(
  // Asumiendo que moverás 'locationmapmodal' a la misma carpeta o ajustarás la ruta
  () => import('./MapModal').then(mod => ({ default: mod.EnhancedLocationPicker })), 
  {
    ssr: false, 
    loading: () => (
      <div className="space-y-4 animate-pulse">
        {/* Skeleton del mapa */}
        <div className="h-64 sm:h-80 rounded-xl bg-gray-800/50 border border-gray-700/50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <div className="text-center space-y-1">
                <p className="text-gray-300 text-sm font-medium">Inicializando mapas...</p>
                <p className="text-gray-500 text-xs">Preparando geolocalización</p>
            </div>
        </div>
        
        {/* Skeleton del input */}
        <div className="h-12 bg-gray-800/50 rounded-xl border border-gray-700/50 flex items-center px-4">
            <div className="w-24 h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }
);

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  return <MapModal onLocationSelect={onLocationSelect} />;
}