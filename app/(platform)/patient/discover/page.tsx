"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import axios from 'axios';
import useSWR from 'swr';
import { Loader2, Search, Compass, SlidersHorizontal, Star } from 'lucide-react';

// UI Components Correctos (ShadCN)
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from "@/components/ui/card";

// Tipos
import { ProviderData } from '@/types/marketplace'; // Asegúrate que esta ruta sea correcta según tu estructura

// --- CONFIGURACIÓN DE GOOGLE MAPS ---
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

// Estilo Dark Mode para Google Maps (Vital para que se vea Pro)
const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 19.4326, lng: -99.1332 }; // CDMX por defecto (o tu ubicación deseada)

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function DiscoverPage() {
  // 1. Cargar Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "", // Asegúrate de tener esto en .env.local
    libraries: libraries,
  });

  // 2. Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [queryParams, setQueryParams] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    category: 'all',
  });

  // 3. Data Fetching
  const { data: providers, isLoading } = useSWR<ProviderData[]>(`/api/marketplace/stores?${queryParams}`, fetcher);

  // 4. Handlers
  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('text', searchQuery);
    if (filters.minRating > 0) params.set('min_rating', filters.minRating.toString());
    if (filters.category !== 'all') params.set('category', filters.category);
    setQueryParams(params.toString());
  };

  // Render de Carga Inicial del Mapa
  if (loadError) return <div className="text-red-500 p-10">Error cargando Google Maps</div>;
  if (!isLoaded) return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-950">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-gray-950 text-white">
      
      {/* HEADER SUPERIOR - Búsqueda y Filtros */}
      <div className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-md z-20 p-4">
        <div className="max-w-7xl mx-auto w-full">
          
          <form onSubmit={applyFilters} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
              <Input 
                placeholder="Buscar por especialidad, nombre o servicio..." 
                className="pl-12 bg-gray-800 border-gray-700 focus:border-purple-500 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Buscar
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </form>

          {/* Panel de filtros */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-4 pt-4 mt-4 border-t border-gray-800">
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="health">Salud</SelectItem>
                      <SelectItem value="beauty">Belleza</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.minRating.toString()}
                    onValueChange={(value) => setFilters(prev => ({...prev, minRating: parseInt(value)}))}
                  >
                    <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Calificación" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="0">Cualquiera</SelectItem>
                        <SelectItem value="4">4+ Estrellas</SelectItem>
                        <SelectItem value="3">3+ Estrellas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" onClick={() => {
                        setFilters({ minRating: 0, category: 'all' });
                        setSearchQuery('');
                        setQueryParams('');
                  }} className="text-gray-400 hover:text-white">
                    Limpiar Filtros
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[40%_60%] overflow-hidden h-full">

        {/* LISTA (IZQUIERDA) */}
        <div className="bg-gray-950 border-r border-gray-800 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4">
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : providers && providers.length > 0 ? (
                providers.map(provider => (
                    <Card 
                        key={provider.id} 
                        className={`bg-gray-900 border-gray-800 cursor-pointer transition-all hover:border-purple-500/50 ${selectedProvider?.id === provider.id ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => setSelectedProvider(provider)}
                    >
                        <CardContent className="p-4 flex gap-4">
                            {/* Avatar / Imagen Placeholder */}
                            <div className="w-20 h-20 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                <span className="text-2xl">🏥</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">{provider.name}</h3>
                                <p className="text-sm text-gray-400">{provider.category || 'General'}</p>
                                <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                                    <Star className="w-3 h-3 fill-current" /> 
                                    <span>{provider.rating || 'New'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center text-gray-500 py-20">
                    <Compass className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron resultados.</p>
                </div>
            )}
          </div>
        </div>

        {/* MAPA (DERECHA) */}
        <div className="relative w-full h-full">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={center}
                options={{
                    styles: darkMapStyle, // Aplica el tema oscuro
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
            >
                {/* Marcadores */}
                {providers?.map((provider) => (
                    <MarkerF
                        key={provider.id}
                        position={{ lat: provider.lat || 19.4326, lng: provider.lng || -99.1332 }} // Fallback coordinates
                        onClick={() => setSelectedProvider(provider)}
                        // icon={{ url: '/marker-icon.png' }} // Opcional: icono personalizado
                    />
                ))}

                {/* Info Window (Popup) */}
                {selectedProvider && (
                    <InfoWindowF
                        position={{ lat: selectedProvider.lat || 19.4326, lng: selectedProvider.lng || -99.1332 }}
                        onCloseClick={() => setSelectedProvider(null)}
                    >
                        {/* El contenido del popup debe tener texto negro porque Google Maps usa fondo blanco por defecto en popups, a menos que lo personalicemos mucho con CSS global */}
                        <div className="text-gray-900 p-2 min-w-[200px]">
                            <h3 className="font-bold">{selectedProvider.name}</h3>
                            <p className="text-sm">{selectedProvider.category}</p>
                            <Button 
                                size="sm" 
                                className="mt-2 w-full bg-purple-600 text-white hover:bg-purple-700"
                            >
                                Ver Perfil
                            </Button>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>
        </div>

      </div>
    </div>
  );
}