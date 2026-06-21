"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClustererF, InfoWindowF } from "@react-google-maps/api";
import { useIntelligenceMap } from "@/hooks/useIntelligence";
import { useTheme } from "next-themes";
import { Building2, MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthcareMapDto {
  clues: string;
  entidad: string;
  municipio: string;
  localidad: string;
  nombreUnidad: string;
  nombreInstitucion: string;
  nivelAtencion: string;
  nombreTipoEstablecimiento: string;
  latitud: number;
  longitud: number;
}

const libraries: ("places")[] = ["places"];

const mapContainerStyle = { 
  width: "100%", 
  height: "100%", // Se ajustará al contenedor padre
  minHeight: "600px"
};

// ☀️ ESTILO MODO CLARO (Plano Técnico / Blueprint)
const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#000000" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#000000" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#000000" }, { weight: 0.5 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
];

// 🌙 ESTILO MODO OSCURO (Terminal Geográfica)
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cccccc" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#111111" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#333333" }, { weight: 0.5 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] },
];

const defaultCenter = { lat: 23.6345, lng: -102.5528 };

export default function NationalHealthcareMap() {
  const { data: pointsRaw, loading } = useIntelligenceMap();
  
  // Limitar a 2500 para evitar congelamiento, memorizado para estabilidad de render.
  const points = useMemo(() => pointsRaw?.slice(0, 2500) || [], [pointsRaw]);
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<HealthcareMapDto | null>(null);
  const { resolvedTheme } = useTheme();

  const { isLoaded } = useJsApiLoader({ 
    id: "google-map-script", 
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", 
    libraries 
  });

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true, 
    zoomControl: true, 
    zoomControlOptions: {
      position: 9 // BOTTOM_RIGHT
    },
    mapTypeControl: true, 
    mapTypeControlOptions: {
      position: 3, // TOP_RIGHT
      style: 1 // HORIZONTAL_BAR
    },
    clickableIcons: false,
    styles: resolvedTheme === 'dark' ? darkMapStyle : lightMapStyle,
  }), [resolvedTheme]);

  // Efecto para auto-zoom
  useEffect(() => {
    if (!map || points.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    let validPoints = 0;

    points.forEach(p => {
      if (p.latitud != null && p.longitud != null && !isNaN(p.latitud) && !isNaN(p.longitud)) {
        bounds.extend({ lat: p.latitud, lng: p.longitud });
        validPoints++;
      }
    });

    if (validPoints > 0) {
      map.fitBounds(bounds);
      const listener = window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        if (map.getZoom()! > 16) map.setZoom(16);
      });
    } else {
      map.setCenter(defaultCenter);
      map.setZoom(5);
    }
  }, [map, points]);

  if (!isLoaded) {
    return (
      <div className="w-full min-h-[600px] h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <MapPin className="w-6 h-6 text-gray-400 mb-4" strokeWidth={1.5} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          INICIALIZANDO MOTOR GEOGRÁFICO...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] relative z-0">
      
      {/* Overlay de Sincronización Arquitectónico */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center border-b border-black dark:border-white transition-opacity duration-300">
          <div className="w-12 h-12 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-4">
             <MapPin className="w-5 h-5 animate-bounce" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white animate-pulse">
            SINTETIZANDO COORDENADAS NACIONALES...
          </span>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={5}
        center={defaultCenter}
        options={mapOptions}
        onLoad={setMap}
      >
        <MarkerClustererF 
          averageCenter
          enableRetinaIcons
          gridSize={50}
          maxZoom={12}
        >
          {(clusterer) => (
            <>
              {points.map((p) => (
                p.latitud && p.longitud && !isNaN(p.latitud) && !isNaN(p.longitud) ? (
                  <MarkerF
                    key={p.clues}
                    position={{ lat: p.latitud, lng: p.longitud }}
                    clusterer={clusterer}
                    onClick={() => setSelectedPoint(p)}
                    icon={{
                      // Icono técnico vectorial para marcadores individuales
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      fillColor: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: resolvedTheme === 'dark' ? '#000000' : '#ffffff',
                      scale: 1.2,
                      anchor: new window.google.maps.Point(12, 24),
                    }}
                  />
                ) : null
              ))}
            </>
          )}
        </MarkerClustererF>

        {selectedPoint && selectedPoint.latitud && selectedPoint.longitud && (
          <InfoWindowF
            position={{ lat: selectedPoint.latitud, lng: selectedPoint.longitud }}
            onCloseClick={() => setSelectedPoint(null)}
          >
            {/* InfoWindow Blueprint */}
            <div className="p-0 min-w-[240px] max-w-[280px] bg-white border border-black shadow-[4px_4px_0_0_#000] overflow-hidden -m-1">
              
              <div className="w-full h-32 bg-gray-100 border-b border-black relative">
                <img 
                  src={`https://maps.googleapis.com/maps/api/streetview?size=400x200&location=${selectedPoint.latitud},${selectedPoint.longitud}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                  alt="Street View"
                  className="w-full h-full object-cover grayscale opacity-90"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="%239ca3af">VISUALIZACIÓN INACTIVA</text></svg>';
                  }}
                />
                <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest border border-white">
                  STREET VIEW
                </div>
              </div>
              
              <div className="p-4 bg-white text-black">
                <h3 className="font-bold text-[10px] uppercase tracking-widest leading-tight mb-4 border-b border-gray-200 pb-3 flex items-start gap-2">
                  <Building2 className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} />
                  <span>{selectedPoint.nombreUnidad}</span>
                </h3>
                
                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 space-y-2 mb-6">
                  <p><span className="text-black">INSTITUCIÓN:</span> {selectedPoint.nombreInstitucion}</p>
                  <p><span className="text-black">TIPO:</span> {selectedPoint.nombreTipoEstablecimiento}</p>
                  <p><span className="text-black">NIVEL:</span> {selectedPoint.nivelAtencion}</p>
                  <p><span className="text-black">ENTIDAD:</span> {selectedPoint.municipio}, {selectedPoint.entidad}</p>
                  <div className="mt-4 inline-block bg-gray-100 border border-black px-2 py-1 text-black font-mono">
                    ID: {selectedPoint.clues}
                  </div>
                </div>
                
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=$${selectedPoint.latitud},${selectedPoint.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-black hover:bg-gray-800 text-white h-10 text-[9px] font-bold uppercase tracking-widest border border-black transition-colors"
                >
                  <ExternalLink className="w-3 h-3" strokeWidth={2} />
                  ABRIR EN NAVEGADOR
                </a>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}