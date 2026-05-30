"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useIntelligenceMap } from "@/hooks/useIntelligence";

// Solución para iconos perdidos en Next.js con Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

export default function NationalHealthcareMap() {
  const { data: pointsRaw, loading } = useIntelligenceMap();
  const points = pointsRaw?.slice(0, 5000) || [];

  const center: [number, number] = [23.6345, -102.5528]; // Centro de México

  return (
    <div className="w-full h-[600px] relative z-0">
      {loading && (
        <div className="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">Cargando puntos de salud...</span>
          </div>
        </div>
      )}
      <MapContainer center={center} zoom={5} className="w-full h-full rounded-b-2xl">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {!loading && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
          >
            {points.map((p) => (
              <Marker key={p.clues} position={[p.latitud, p.longitud]}>
                <Popup className="rounded-lg shadow-xl">
                  <div className="p-1">
                    <h3 className="font-bold text-sm text-slate-800">{p.nombreUnidad}</h3>
                    <div className="text-xs text-slate-500 mt-1 space-y-1">
                      <p><span className="font-semibold text-slate-700">Institución:</span> {p.nombreInstitucion}</p>
                      <p><span className="font-semibold text-slate-700">Tipo:</span> {p.nombreTipoEstablecimiento}</p>
                      <p><span className="font-semibold text-slate-700">Nivel:</span> {p.nivelAtencion}</p>
                      <p><span className="font-semibold text-slate-700">Ubicación:</span> {p.municipio}, {p.entidad}</p>
                      <p><span className="font-semibold text-slate-700">CLUES:</span> {p.clues}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  );
}
