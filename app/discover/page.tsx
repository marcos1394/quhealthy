/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { ProviderCard } from '@/components/ui/ProviderCard';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Compass, MapPin, SlidersHorizontal } from 'lucide-react';
import { ProviderData } from '@/app/quhealthy/types/marketplace';
import useSWR from 'swr';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Button from '@/components/Button';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [queryParams, setQueryParams] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    category: 'all',
  });

  const [viewState, setViewState] = useState({
    longitude: -107.3942,
    latitude: 24.8092,
    zoom: 11.5
  });
  
  const { data: providers, error, isLoading } = useSWR<ProviderData[]>(`/api/marketplace/stores?${queryParams}`, fetcher);

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('text', searchQuery);
    if (filters.minRating > 0) params.set('min_rating', filters.minRating.toString());
    if (filters.category !== 'all') params.set('category', filters.category);
    setQueryParams(params.toString());
  };

  return (
    <div className="h-screen w-screen flex flex-col pt-20 bg-gray-950">
      
      {/* HEADER SUPERIOR - Búsqueda y Filtros */}
      <div className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-2xl z-20">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          
          {/* Barra de búsqueda principal */}
          <form onSubmit={applyFilters} className="flex gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
              <Input 
                placeholder="Buscar por especialidad, nombre o servicio..." 
                className="pl-12 pr-4 h-12 bg-gray-800/80 border-gray-700 hover:border-purple-500/50 focus:border-purple-500 transition-colors text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button 
              size="lg" 
              className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Buscar
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              className="h-12 px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </form>

          {/* Panel de filtros colapsable */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 pt-4 mt-4 border-t border-gray-800">
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger className="w-[200px] h-10 bg-gray-800/80 border-gray-700 hover:border-purple-500/50">
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
                    <SelectTrigger className="w-[200px] h-10 bg-gray-800/80 border-gray-700 hover:border-purple-500/50">
                      <SelectValue placeholder="Calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Cualquier Calificación</SelectItem>
                      <SelectItem value="4">⭐ 4+ Estrellas</SelectItem>
                      <SelectItem value="3">⭐ 3+ Estrellas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={() => applyFilters()} 
                    variant="secondary"
                    className="h-10"
                  >
                    Aplicar Filtros
                  </Button>

                  {(filters.category !== 'all' || filters.minRating > 0 || searchQuery) && (
                    <Button 
                      onClick={() => {
                        setFilters({ minRating: 0, category: 'all' });
                        setSearchQuery('');
                        setQueryParams('');
                      }}
                      variant="primary"
                      className="h-10 text-gray-400 hover:text-white"
                    >
                      Limpiar
                    </Button>
                  )}

                  {providers && (
                    <div className="ml-auto text-sm text-gray-400">
                      <span className="font-medium text-purple-400">{providers.length}</span> resultados encontrados
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL - Grid de 2 columnas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[45%_55%] overflow-hidden">

        {/* PANEL IZQUIERDO - Lista de Proveedores */}
        <div className="flex flex-col bg-gray-900 border-r border-gray-800">
          
          {/* Contenedor con scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {isLoading ? (
                <div className="flex h-[60vh] justify-center items-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Cargando proveedores...</p>
                  </div>
                </div>
              ) : providers && providers.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 2xl:grid-cols-2 gap-5"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                  initial="hidden"
                  animate="visible"
                >
                  {providers.map(provider => (
                    <motion.div 
                      key={provider.id}
                      variants={{ 
                        hidden: { opacity: 0, y: 20 }, 
                        visible: { opacity: 1, y: 0 } 
                      }}
                      onMouseEnter={() => setSelectedProvider(provider)}
                      onMouseLeave={() => setSelectedProvider(null)}
                      className="h-full"
                    >
                      <ProviderCard provider={provider} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 pt-24 flex flex-col items-center">
                  <div className="bg-gray-800/50 rounded-full p-8 mb-6">
                    <Compass className="w-20 h-20 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="max-w-md text-gray-500 mb-6">
                    Intenta ajustar los filtros o realiza una búsqueda diferente para encontrar proveedores.
                  </p>
                  <Button 
                    onClick={() => {
                      setFilters({ minRating: 0, category: 'all' });
                      setSearchQuery('');
                      setQueryParams('');
                    }}
                    variant="secondary"
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO - Mapa Interactivo */}
        <div className="hidden lg:block relative bg-gray-950">
          {/* Indicador de ubicación */}
          <div className="absolute top-6 left-6 z-10 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl px-4 py-3 shadow-2xl">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300 font-medium">Culiacán, Sinaloa</span>
            </div>
          </div>

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
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedProvider(provider);
                  setViewState({
                    ...viewState,
                    longitude: provider.provider.lng,
                    latitude: provider.provider.lat,
                    zoom: 14,
                  });
                }}
              >
                <motion.div 
                  className="cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={`
                    transition-all duration-300 
                    ${selectedProvider?.id === provider.id ? 'z-50' : 'z-10'}
                  `}>
                    <div className={`
                      rounded-full border-2 border-white shadow-lg transition-all duration-300
                      ${selectedProvider?.id === provider.id 
                        ? 'w-6 h-6 bg-purple-400 ring-4 ring-purple-400/30' 
                        : 'w-4 h-4 bg-purple-600 hover:bg-purple-500'
                      }
                    `} />
                  </div>
                </motion.div>
              </Marker>
            ))}

            <AnimatePresence>
              {selectedProvider && (
                <Popup
                  longitude={selectedProvider.provider.lng}
                  latitude={selectedProvider.provider.lat}
                  onClose={() => setSelectedProvider(null)}
                  closeButton={true}
                  closeOnClick={false}
                  anchor="bottom"
                  offset={25}
                  className="provider-popup"
                >
                  <div className="w-80 max-w-[90vw]">
                    <ProviderCard provider={selectedProvider} />
                  </div>
                </Popup>
              )}
            </AnimatePresence>
          </Map>
        </div>
      </div>
    </div>
  );
}