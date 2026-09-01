"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/no-event-handler */

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  MarkerClustererF,
  InfoWindowF,
} from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { Building2, ExternalLink } from "lucide-react";

import { useIntelligenceMap } from "@/hooks/useIntelligence";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { getMapMarkerIcon } from "@/lib/mapPins";

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

const libraries: "places"[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "600px",
};

// ☀️ ESTILO MODO CLARO (Limpio y Suave)
const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0f172a" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e8f0" }, { weight: 0.8 }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }],
  },
];

// 🌙 ESTILO MODO OSCURO (Minimalista Clínico)
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#171717" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#262626" }, { weight: 0.5 }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#050505" }],
  },
];

const defaultCenter = { lat: 23.6345, lng: -102.5528 };

export default function NationalHealthcareMap() {
  const t = useTranslations("Intelligence.NationalHealthcareMap");
  const { data: pointsRaw, loading } = useIntelligenceMap();

  // Limitar a 2500 puntos para optimizar rendimiento de renderizado
  const points = useMemo(() => pointsRaw?.slice(0, 2500) || [], [pointsRaw]);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<HealthcareMapDto | null>(
    null
  );
  const { resolvedTheme } = useTheme();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: 9, // BOTTOM_RIGHT
      },
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: 3, // TOP_RIGHT
        style: 1, // HORIZONTAL_BAR
      },
      clickableIcons: false,
      styles: resolvedTheme === "dark" ? darkMapStyle : lightMapStyle,
    }),
    [resolvedTheme]
  );

  // Auto-fit de coordenadas de los puntos
  useEffect(() => {
    if (!map || points.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    let validPoints = 0;

    points.forEach((p) => {
      if (
        p.latitud != null &&
        p.longitud != null &&
        !isNaN(p.latitud) &&
        !isNaN(p.longitud)
      ) {
        bounds.extend({ lat: p.latitud, lng: p.longitud });
        validPoints++;
      }
    });

    if (validPoints > 0) {
      map.fitBounds(bounds);
      const listener = window.google.maps.event.addListenerOnce(
        map,
        "bounds_changed",
        () => {
          if (map.getZoom()! > 16) map.setZoom(16);
        }
      );
    } else {
      map.setCenter(defaultCenter);
      map.setZoom(5);
    }
  }, [map, points]);

  if (!isLoaded) {
    return (
      <div className="w-full min-h-[600px] h-full flex flex-col items-center justify-center gap-3 bg-gray-50/50 dark:bg-[#050505] font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 animate-pulse">
          {t("initializing_map")}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] relative z-0 font-sans select-none">
      {/* ── OVERLAY DE SINCRONIZACIÓN DE PUNTOS ────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {t("synthesizing_coords")}
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
              {points.map((p) =>
                p.latitud &&
                p.longitud &&
                !isNaN(p.latitud) &&
                !isNaN(p.longitud) ? (
                  <MarkerF
                    key={p.clues}
                    position={{ lat: p.latitud, lng: p.longitud }}
                    clusterer={clusterer}
                    onClick={() => setSelectedPoint(p)}
                    icon={getMapMarkerIcon({
                      role: (p.nombreTipoEstablecimiento || p.nivelAtencion || "").toUpperCase().includes("HOSPITAL") ? "HOSPITAL" : "CLINIC",
                      specialty: p.nombreTipoEstablecimiento,
                      isSelected: selectedPoint?.clues === p.clues,
                    }, typeof window !== "undefined" && window.google ? window.google.maps : undefined)}
                  />
                ) : null
              )}
            </>
          )}
        </MarkerClustererF>

        {/* ── INFOWINDOW ESTILIZADA DE LA UNIDAD SELECCIONADA ──────────────── */}
        {selectedPoint && selectedPoint.latitud && selectedPoint.longitud && (
          <InfoWindowF
            position={{
              lat: selectedPoint.latitud,
              lng: selectedPoint.longitud,
            }}
            onCloseClick={() => setSelectedPoint(null)}
          >
            <div className="p-0 min-w-[260px] max-w-[300px] bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl font-sans -m-1">
              {/* Street View Preview */}
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-900 relative">
                <img
                  src={`https://maps.googleapis.com/maps/api/streetview?size=400x200&location=${selectedPoint.latitud},${selectedPoint.longitud}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                  alt="Street View"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="%239ca3af">${t("view_not_available")}</text></svg>`;
                  }}
                />
                <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-2xs">
                  {t("street_view")}
                </div>
              </div>

              {/* Información Detallada */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white leading-tight flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <span>{selectedPoint.nombreUnidad}</span>
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium">
                  <p>
                    <strong className="text-gray-900 dark:text-white font-bold">{t("institution")}</strong>{" "}
                    {selectedPoint.nombreInstitucion}
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white font-bold">{t("type")}</strong>{" "}
                    {selectedPoint.nombreTipoEstablecimiento}
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white font-bold">{t("level")}</strong>{" "}
                    {selectedPoint.nivelAtencion}
                  </p>
                  <p className="truncate">
                    <strong className="text-gray-900 dark:text-white font-bold">{t("location")}</strong>{" "}
                    {selectedPoint.municipio}, {selectedPoint.entidad}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                    {t("clues", { clues: selectedPoint.clues })}
                  </span>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedPoint.latitud},${selectedPoint.longitud}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-[10px] font-bold shadow-2xs flex items-center gap-1 shrink-0 border-0"
                  >
                    <span>{t("google_maps")}</span>
                    <ExternalLink className="w-3 h-3" strokeWidth={2} />
                  </a>
                </div>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}