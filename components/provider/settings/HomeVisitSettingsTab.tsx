"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  DollarSign,
  Clock,
  Radio,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Navigation,
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Circle, MarkerF } from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { homeVisitService, HomeVisitSettings } from "@/services/homeVisit.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { getMapMarkerIcon } from "@/lib/mapPins";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];
const mapContainerStyle = { width: "100%", height: "260px", borderRadius: "1rem" };

export const HomeVisitSettingsTab: React.FC = () => {
  const t = useTranslations("Provider.Settings.HomeVisit");
  const { resolvedTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HomeVisitSettings>({
    isEnabled: false,
    coverageRadiusKm: 15,
    basePrice: 600,
    pricePerKm: 20,
    estimatedDispatchMinutes: 30,
    autoAcceptOnDemand: false,
    onDemandStatus: "OFFLINE",
    currentLatitude: 19.4326,
    currentLongitude: -99.1332,
  });

  const { isLoaded } = useJsApiLoader({
    id: "home-visit-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: "es",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await homeVisitService.getMySettings();
      setSettings((prev) => ({
        ...prev,
        ...data,
        currentLatitude: data.currentLatitude || prev.currentLatitude,
        currentLongitude: data.currentLongitude || prev.currentLongitude,
      }));
    } catch (err) {
      console.warn("Error cargando configuración a domicilio:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await homeVisitService.saveMySettings(settings);
      setSettings(updated);
      toast.success(t("saved_success") || "Configuración de visitas a domicilio guardada correctamente");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const toggleOnlineStatus = async () => {
    const nextStatus = settings.onDemandStatus === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
    try {
      const updated = await homeVisitService.updateLiveStatus(nextStatus, {
        lat: settings.currentLatitude || 19.4326,
        lng: settings.currentLongitude || -99.1332,
      });
      setSettings((prev) => ({ ...prev, onDemandStatus: updated.onDemandStatus }));
      toast.success(
        nextStatus === "AVAILABLE"
          ? "¡Estás en línea! Recibirás alertas de pacientes cercanos"
          : "Modo desconectado activado"
      );
    } catch (err: any) {
      toast.error("No se pudo cambiar el estado en línea");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <QhSpinner className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-gray-500">Cargando configuración de servicios a domicilio...</p>
      </div>
    );
  }

  const center = {
    lat: settings.currentLatitude || 19.4326,
    lng: settings.currentLongitude || -99.1332,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner Principal */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Servicios Médicos a Domicilio
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                On-Demand
              </span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Atiende a pacientes en su hogar o trabajo. Configura tu radio de cobertura y tarifas dinámicas.
            </p>
          </div>
        </div>

        {/* Toggle Disponible On-Demand */}
        {settings.isEnabled && (
          <button
            type="button"
            onClick={toggleOnlineStatus}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer border ${
              settings.onDemandStatus === "AVAILABLE"
                ? "bg-emerald-600 text-white border-emerald-500 animate-pulse"
                : "bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
            }`}
          >
            <Radio className={`w-4 h-4 ${settings.onDemandStatus === "AVAILABLE" ? "text-white animate-spin" : "text-gray-400"}`} />
            <span>{settings.onDemandStatus === "AVAILABLE" ? "En Línea (Disponible)" : "Desconectado"}</span>
          </button>
        )}
      </div>

      {/* Switch Habilitar Visitas a Domicilio */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Ofrecer atención médica a domicilio
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Aparecerás en el mapa cuando los pacientes busquen especialistas a domicilio en tu zona.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.isEnabled}
            onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {settings.isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Tarifas y Precios */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-5 shadow-xs">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Estructura de Tarifas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Tarifa Base de Consulta ($ MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={settings.basePrice}
                  onChange={(e) => setSettings({ ...settings, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111] text-sm text-gray-900 dark:text-white focus:outline-emerald-600 font-mono font-bold"
                />
                <p className="text-[11px] text-gray-400 mt-1">Incluye revisión y traslado base.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Tarifa por Kilómetro Extra ($ MXN/km)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={settings.pricePerKm}
                  onChange={(e) => setSettings({ ...settings, pricePerKm: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111] text-sm text-gray-900 dark:text-white focus:outline-emerald-600 font-mono font-bold"
                />
                <p className="text-[11px] text-gray-400 mt-1">Compensación por gasolina y tiempo.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Tiempo Estimado de Preparación (Min)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={settings.estimatedDispatchMinutes}
                  onChange={(e) => setSettings({ ...settings, estimatedDispatchMinutes: parseInt(e.target.value, 10) || 30 })}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111] text-sm text-gray-900 dark:text-white focus:outline-emerald-600 font-mono font-bold"
                />
                <p className="text-[11px] text-gray-400 mt-1">Margen para alistar maletín y salir.</p>
              </div>
            </div>
          </div>

          {/* Radio de Cobertura y Mapa Interactivo */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Radio de Cobertura de Desplazamiento
              </h4>
              <span className="font-mono font-bold text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {settings.coverageRadiusKm} km a la redonda
              </span>
            </div>

            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={settings.coverageRadiusKm}
              onChange={(e) => setSettings({ ...settings, coverageRadiusKm: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
            />

            {/* Mapa de Vista Previa de la Geocerca */}
            {isLoaded && (
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={settings.coverageRadiusKm > 20 ? 10 : 11}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    gestureHandling: "cooperative",
                  }}
                >
                  <MarkerF
                    position={center}
                    icon={getMapMarkerIcon({ isHomeVisit: true, isSelected: true }, typeof google !== "undefined" ? google.maps : undefined)}
                  />
                  <Circle
                    center={center}
                    radius={settings.coverageRadiusKm * 1000}
                    options={{
                      fillColor: "#059669",
                      fillOpacity: 0.15,
                      strokeColor: "#059669",
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                </GoogleMap>
              </div>
            )}
          </div>

          {/* Botón de Guardado */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <QhSpinner className="w-4 h-4 text-white animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar Configuración</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
