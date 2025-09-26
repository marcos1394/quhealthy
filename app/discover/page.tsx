/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { ProviderCard } from '@/components/ui/ProviderCard';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Compass } from 'lucide-react';
import { ProviderData } from '@/app/quhealthy/types/marketplace'; // Usamos el tipo centralizado
import useSWR from 'swr'; // Usaremos SWR para un manejo de datos más elegante
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Button from '@/components/Button';


// Hook para obtener los datos. SWR maneja el cache, revalidación, etc.
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [queryParams, setQueryParams] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [filters, setFilters] = useState({
    minRating: 0,
    category: 'all',
  });

  // El mapa se centrará en Culiacán, Sinaloa
  const [viewState, setViewState] = useState({
    longitude: -107.3942,
    latitude: 24.8092,
    zoom: 11.5
  });
  
  // Usamos SWR para obtener y cachear los datos de los proveedores
  const { data: providers, error, isLoading } = useSWR<ProviderData[]>(`/api/marketplace/stores?${queryParams}`, fetcher);

  // Esta función ahora contiene solo la lógica de búsqueda
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('text', searchQuery);
    if (filters.minRating > 0) params.set('min_rating', filters.minRating.toString());
    if (filters.category !== 'all') params.set('category', filters.category);
    setQueryParams(params.toString());
  };

  return (
    // Layout principal dividido en dos paneles
    <div className="h-screen w-screen grid grid-cols-1 lg:grid-cols-[40%_60%] pt-20">

      {/* Panel Izquierdo: Búsqueda y Lista de Resultados */}
      <div className="flex flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <form onSubmit={applyFilters} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
            <Input 
              placeholder="Buscar por especialidad, nombre o servicio..." 
              className="pl-10 h-12 bg-gray-800 border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        <div className="p-4 border-b border-gray-800">
  {/* Formulario de Búsqueda */}
  <form onSubmit={applyFilters} className="flex gap-2 mb-4">
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
      <Input 
        placeholder="Buscar por especialidad, nombre..." 
        className="pl-10 h-12 bg-gray-800 border-gray-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <Button size="lg" className="h-12">Buscar</Button>
  </form>

  {/* Controles de Filtro */}
  <div className="flex items-center gap-4">
    <Select
      value={filters.category}
      onValueChange={(value) => setFilters(prev => ({...prev, category: value}))}
    >
      <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
        <SelectValue placeholder="Categoría" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las Categorías</SelectItem>
        <SelectItem value="health">Salud</SelectItem>
        <SelectItem value="beauty">Belleza</SelectItem>
      </SelectContent>
    </Select>

    <Select
      value={filters.minRating.toString()}
      onValueChange={(value) => setFilters(prev => ({...prev, minRating: parseInt(value)}))}
    >
      <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
        <SelectValue placeholder="Calificación" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">Cualquier Calificación</SelectItem>
        <SelectItem value="4">4 Estrellas y más</SelectItem>
        <SelectItem value="3">3 Estrellas y más</SelectItem>
      </SelectContent>
    </Select>

    <Button onClick={applyFilters} variant="secondary">
      Aplicar Filtros
    </Button>
  </div>
</div>
        </div>

        {/* Contenedor de la lista con scroll */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : providers && providers.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 xl:grid-cols-2 gap-4"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              initial="hidden"
              animate="visible"
            >
              {providers.map(provider => (
                <motion.div 
                  key={provider.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  onMouseEnter={() => setSelectedProvider(provider)}
                  onMouseLeave={() => setSelectedProvider(null)}
                >
                  <ProviderCard provider={provider} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 pt-16 flex flex-col items-center">
              <Compass className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">No se encontraron resultados</h3>
              <p className="max-w-md mt-2">Intenta con otra búsqueda o revisa más tarde.</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho: Mapa */}
      <div className="hidden lg:block relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }}
        >
          {providers?.map(provider => (
            <Marker 
              key={provider.id}
              longitude={provider.provider.lng}
              latitude={provider.provider.lat}
              onClick={() => {
                setSelectedProvider(provider);
                setViewState({
                  ...viewState,
                  longitude: provider.provider.lng,
                  latitude: provider.provider.lat,
                  zoom: 14,
                });
              }}
            >
              <div className={`transition-all duration-300 ${selectedProvider?.id === provider.id ? 'z-10' : 'z-0'}`}>
                <div className={`w-3 h-3 rounded-full border-2 border-white transition-all ${selectedProvider?.id === provider.id ? 'bg-purple-400 scale-[2.5]' : 'bg-purple-600'}`} />
              </div>
            </Marker>
          ))}

          <AnimatePresence>
            {selectedProvider && (
              <Popup
                longitude={selectedProvider.provider.lng}
                latitude={selectedProvider.provider.lat}
                onClose={() => setSelectedProvider(null)}
                closeButton={false}
                anchor="bottom"
                offset={20}
              >
                <div className="w-64">
                  <ProviderCard provider={selectedProvider} />
                </div>
              </Popup>
            )}
          </AnimatePresence>
        </Map>
      </div>
    </div>
  );
}