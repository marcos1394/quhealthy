"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import { 
  Loader2, 
  Search, 
  SlidersHorizontal, 
  Star, 
  MapPin, 
  ChevronRight,
  Sparkles,
  Navigation
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ==========================================
// 1. CONFIGURACIÓN DEL MAPA (Ultra Dark & Minimal)
// ==========================================
const libraries: ("places" | "geometry")[] = ["places"];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 25.7904, lng: -108.9858 }; // Los Mochis (Ajusta a tu ciudad base)

// Tema de mapa ultra limpio, ocultando negocios irrelevantes
const ultraDarkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#09090b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#09090b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#71717a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#a1a1aa" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }, // Ocultar otros negocios
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#18181b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#27272a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#52525b" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
];

// ==========================================
// 2. MOCK DATA (Reemplazar con SWR/Backend)
// ==========================================
const mockProviders = [
  {
    id: 1,
    name: "Thaly Falomir Beauty Spa",
    category: "Spa Médico",
    lat: 25.7920,
    lng: -108.9900,
    rating: 4.9,
    reviews: 128,
    imageUrl: "https://storage.googleapis.com/quhealthy-public-media-prod/store-media/15/BANNER-4403fb52-07e9-4daf-9e18-025ae0697cbf.png",
    logoUrl: "https://storage.googleapis.com/quhealthy-public-media-prod/store-media/15/LOGO-5d86c818-037e-445d-8edc-888258ce3796.png",
    color: "#9333ea",
    isPremium: true
  },
  {
    id: 2,
    name: "Dermatología Integral",
    category: "Clínica",
    lat: 25.7850,
    lng: -108.9800,
    rating: 4.7,
    reviews: 84,
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
    logoUrl: "",
    color: "#0ea5e9",
    isPremium: false
  },
  {
    id: 3,
    name: "Zen Dental Studio",
    category: "Odontología",
    lat: 25.7950,
    lng: -108.9820,
    rating: 5.0,
    reviews: 215,
    imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop",
    logoUrl: "",
    color: "#10b981",
    isPremium: true
  }
];

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================
export default function DiscoverPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // Volar hacia el marcador cuando se selecciona una tarjeta
  const handleSelectProvider = (provider: typeof mockProviders[0]) => {
    setSelectedId(provider.id);
    if (map) {
      map.panTo({ lat: provider.lat, lng: provider.lng });
      map.setZoom(15);
    }
  };

  if (loadError) return <div className="h-screen w-full flex items-center justify-center bg-[#09090b] text-red-400">Error conectando con Google Maps. Verifica tu API Key.</div>;
  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-[#09090b]"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;

  return (
    <div className="relative w-full h-screen bg-[#09090b] overflow-hidden selection:bg-purple-500/30">
      
      {/* --- EL MAPA EN EL FONDO (Z-0) --- */}
      <div className="absolute inset-0 z-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={defaultCenter}
          onLoad={onMapLoad}
          onClick={() => setSelectedId(null)} // Deseleccionar al tocar el mapa
          options={{
            styles: ultraDarkMapStyle,
            disableDefaultUI: true, // Ocultamos botones feos de Google
            zoomControl: true, // Solo dejamos el zoom
            gestureHandling: 'greedy',
          }}
        >
          {/* Marcadores Personalizados */}
          {mockProviders.map((provider) => {
            const isSelected = selectedId === provider.id;
            const isHovered = hoveredId === provider.id;
            
            return (
              <MarkerF
                key={provider.id}
                position={{ lat: provider.lat, lng: provider.lng }}
                onClick={() => handleSelectProvider(provider)}
                onMouseOver={() => setHoveredId(provider.id)}
                onMouseOut={() => setHoveredId(null)}
                icon={{
                  // Creamos un pin dinámico SVG. Si está seleccionado, brilla con su color.
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                  fillColor: isSelected || isHovered ? provider.color : '#3f3f46',
                  fillOpacity: 1,
                  strokeWeight: isSelected ? 2 : 1,
                  strokeColor: isSelected ? '#ffffff' : '#18181b',
                  scale: isSelected ? 1.8 : 1.5,
                  anchor: new google.maps.Point(12, 24),
                }}
                zIndex={isSelected ? 10 : 1}
              />
            );
          })}
        </GoogleMap>
      </div>

      {/* --- GRADIENTES PARA LEGIBILIDAD (Z-10) --- */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#09090b]/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#09090b]/90 to-transparent z-10 pointer-events-none md:hidden" />

      {/* --- BARRA DE BÚSQUEDA FLOTANTE (Z-20) --- */}
      <div className="absolute top-6 left-4 right-4 md:left-8 md:w-[420px] z-20">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
              <Search className="w-5 h-5 text-zinc-400 mr-3" />
              <Input 
                placeholder="Buscar servicios, especialistas..." 
                className="bg-transparent border-none p-0 h-auto text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="ghost" size="default" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 ml-2 rounded-xl">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- PANEL DE LISTA (Z-20) --- */}
      {/* DESKTOP: Sidebar Flotante Izquierdo | MOBILE: Carrusel Flotante Inferior */}
      <div className="absolute bottom-6 left-0 w-full md:top-28 md:bottom-8 md:left-8 md:w-[420px] z-20 pointer-events-none">
        
        {/* Contenedor scrolleable */}
        <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto w-full h-full gap-4 px-4 md:px-0 custom-scrollbar pointer-events-auto snap-x snap-mandatory pb-4 md:pb-0">
          
          <AnimatePresence>
            {mockProviders.map((provider) => {
              const isSelected = selectedId === provider.id;

              return (
                <motion.div
                  key={provider.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onMouseEnter={() => setHoveredId(provider.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSelectProvider(provider)}
                  className={cn(
                    "relative flex-shrink-0 w-[85vw] md:w-full snap-center rounded-[2rem] p-1 transition-all duration-300 cursor-pointer overflow-hidden group",
                    isSelected ? "shadow-2xl" : "hover:shadow-xl"
                  )}
                >
                  {/* Borde Animado (Glow) */}
                  <div 
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500 blur-md",
                      isSelected ? "opacity-50" : "opacity-0 group-hover:opacity-30"
                    )}
                    style={{ backgroundColor: provider.color }}
                  />

                  {/* Tarjeta Glassmorphism */}
                  <div className={cn(
                    "relative h-full bg-[#09090b]/80 backdrop-blur-2xl rounded-[1.8rem] border flex flex-col overflow-hidden transition-colors",
                    isSelected ? "border-white/20" : "border-white/5 hover:border-white/10"
                  )}>
                    
                    {/* Imagen Portada */}
                    <div className="h-32 w-full relative overflow-hidden">
                      <img src={provider.imageUrl} alt={provider.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
                      
                      {/* Premium Badge */}
                      {provider.isPremium && (
                        <Badge className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold tracking-wider text-[10px] uppercase shadow-xl">
                          <Sparkles className="w-3 h-3 mr-1 text-yellow-400" /> Top Choice
                        </Badge>
                      )}
                      
                      {/* Rating Flotante */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-white">{provider.rating}</span>
                        <span className="text-[10px] text-zinc-400">({provider.reviews})</span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-white leading-tight line-clamp-1">{provider.name}</h3>
                        {provider.logoUrl && (
                          <img src={provider.logoUrl} alt="Logo" className="w-8 h-8 rounded-full border border-white/10 bg-zinc-900 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                        <Badge variant="outline" className="border-white/10 text-zinc-300 font-medium">
                          {provider.category}
                        </Badge>
                        <span className="flex items-center">
                          <Navigation className="w-3 h-3 mr-1 opacity-70" /> 1.2 km
                        </span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 font-medium">Disponibilidad hoy</span>
                        <Button 
                          size="sm"
                          className={cn(
                            "rounded-xl font-bold transition-all h-8 px-4",
                            isSelected ? "text-white shadow-lg shadow-purple-500/20" : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                          )}
                          style={isSelected ? { backgroundColor: provider.color } : {}}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/store/${provider.name || 'thalyfalomirbeautyspa'}`, '_blank');
                          }}
                        >
                          Ver Tienda <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Spacer para que el último elemento del carrusel en móvil no quede pegado al borde */}
          <div className="w-4 md:hidden flex-shrink-0" />

        </div>
      </div>
      
    </div>
  );
}