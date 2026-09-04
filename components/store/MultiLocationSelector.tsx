"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Navigation, Building2, Clock, CheckCircle2 } from "lucide-react";
import { StorefrontLocation } from "@/types/storefront";
import { buildGoogleMapsUrl } from "@/components/store/StorefrontHero";
import { cn } from "@/lib/utils";

interface MultiLocationSelectorProps {
  locations?: StorefrontLocation[];
  primaryColor?: string;
  onSelectLocation?: (location: StorefrontLocation) => void;
  selectedLocationId?: number | null;
  className?: string;
}

export const MultiLocationSelector: React.FC<MultiLocationSelectorProps> = ({
  locations,
  primaryColor = "#059669",
  onSelectLocation,
  selectedLocationId,
  className,
}) => {
  const t = useTranslations("StorePublic.Locations");

  if (!locations || locations.length === 0) return null;

  const [activeLocId, setActiveLocId] = useState<number>(
    selectedLocationId || locations[0].id
  );

  React.useEffect(() => {
    if (selectedLocationId && selectedLocationId !== activeLocId) {
      setActiveLocId(selectedLocationId);
    }
  }, [selectedLocationId]);

  const selectedLoc = locations.find((l) => l.id === activeLocId) || locations[0];

  const handleSelect = (loc: StorefrontLocation) => {
    setActiveLocId(loc.id);
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  const mapsUrl = buildGoogleMapsUrl(selectedLoc);

  return (
    <div className={cn("bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 font-sans", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-2xs shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              {t("title", { defaultMessage: "Sedes y Consultorios de Atención" })}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("subtitle", {
                count: locations.length,
                defaultMessage: `{count} ${locations.length === 1 ? "ubicación disponible" : "ubicaciones disponibles"}`,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Selector de Sedes si hay más de 1 */}
      {locations.length > 1 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {locations.map((loc) => {
            const isSelected = loc.id === activeLocId;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelect(loc)}
                className={cn(
                  "px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer shadow-2xs",
                  isSelected
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white shadow-xs"
                    : "bg-gray-50 dark:bg-[#111] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{loc.name}</span>
                {loc.isMain && (
                  <span className="text-[10px] font-normal opacity-70">
                    ({t("main_badge", { defaultMessage: "Principal" })})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Tarjeta de Información de la Sede Seleccionada */}
      <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{selectedLoc.name}</span>
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 pl-5">
              {selectedLoc.address || t("address_not_specified", { defaultMessage: "Dirección disponible al confirmar cita" })}
              {selectedLoc.city ? `, ${selectedLoc.city}` : ""}
              {selectedLoc.state ? `, ${selectedLoc.state}` : ""}
            </p>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white shadow-2xs transition-transform active:scale-95 shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t("get_directions", { defaultMessage: "Cómo llegar" })}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
