"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClustererF, InfoWindowF } from "@react-google-maps/api";
import { useIntelligenceMap } from "@/hooks/useIntelligence";
import { useTheme } from "next-themes";
import { Building2, MapPin } from "lucide-react";

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
  height: "600px", 
  borderRadius: "0 0 1rem 1rem", 
};

// Estilos de mapa
const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

const defaultCenter = { lat: 23.6345, lng: -102.5528 };

export default function NationalHealthcareMap() {
  const { data: pointsRaw, loading } = useIntelligenceMap();
  
  // Usar useMemo es CRÍTICO aquí para evitar que .slice() cree una nueva referencia de array 
  // en cada re-render (por ejemplo, al dar click en un pin), lo que causaba que el mapa 
  // recalculara y se alejara.
  const points = useMemo(() => pointsRaw?.slice(0, 8000) || [], [pointsRaw]);
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<HealthcareMapDto | null>(null);
  const { resolvedTheme } = useTheme();

  const { isLoaded } = useJsApiLoader({ 
    id: "google-map-script", 
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", 
    libraries 
  });

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true, // Desactivar UI por defecto para usar nuestros controles
    zoomControl: true, // Habilitar controles de zoom nativos de Google
    zoomControlOptions: {
      position: 9 // google.maps.ControlPosition.RIGHT_BOTTOM (9)
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
      
      // Limitar zoom máximo después de encuadrar (evitar hacer zoom extremo a un solo punto)
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
      <div className="w-full h-[600px] flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-b-2xl">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-500" />
          <span className="text-slate-500 font-medium">Iniciando Google Maps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative z-0">
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-b-2xl transition-opacity">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="text-slate-800 dark:text-slate-200 font-medium">Sincronizando puntos de salud...</span>
          </div>
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
            <div className="p-1 min-w-[200px] max-w-[250px]">
              <h3 className="font-bold text-sm text-slate-900 flex items-start gap-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>{selectedPoint.nombreUnidad}</span>
              </h3>
              <div className="text-xs text-slate-600 space-y-1.5 border-t pt-2">
                <p><span className="font-semibold text-slate-800">Inst:</span> {selectedPoint.nombreInstitucion}</p>
                <p><span className="font-semibold text-slate-800">Tipo:</span> {selectedPoint.nombreTipoEstablecimiento}</p>
                <p><span className="font-semibold text-slate-800">Nivel:</span> {selectedPoint.nivelAtencion}</p>
                <p><span className="font-semibold text-slate-800">Ubicación:</span> {selectedPoint.municipio}, {selectedPoint.entidad}</p>
                <p className="font-mono text-[10px] text-slate-400 mt-2">{selectedPoint.clues}</p>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
