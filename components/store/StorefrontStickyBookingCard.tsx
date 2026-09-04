"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/hooks/useBookingStore";
import { StorefrontData, StorefrontLocation } from "@/types/storefront";
import { ProviderScoreResponse } from "@/types/providerScore";
import { QuickAvailability } from "@/components/store/QuickAvailability";
import { buildGoogleMapsUrl } from "@/components/store/StorefrontHero";

interface StorefrontStickyBookingCardProps {
  store: StorefrontData;
  scoreData?: ProviderScoreResponse | null;
  selectedLocationId: number | null;
  onSelectLocation?: (location: StorefrontLocation) => void;
  brandColor?: string;
}

export const StorefrontStickyBookingCard: React.FC<StorefrontStickyBookingCardProps> = ({
  store,
  scoreData,
  selectedLocationId,
  brandColor = "#059669",
}) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("StorePublic");
  const { cart, removeFromCart } = useBookingStore();

  const safePrimaryColor = brandColor && brandColor !== "#ffffff" ? brandColor : "#059669";

  // Ítems pertenecientes a esta tienda
  const storeItems = useMemo(() => {
    return cart.filter(
      (item) => !item.providerSlug || item.providerSlug === store.slug
    );
  }, [cart, store.slug]);

  const hasServices = useMemo(() => storeItems.some((i) => i.type === "SERVICE"), [storeItems]);
  const hasPackages = useMemo(() => storeItems.some((i) => i.type === "PACKAGE"), [storeItems]);
  const hasProducts = useMemo(() => storeItems.some((i) => i.type === "PRODUCT"), [storeItems]);

  const totalPrice = useMemo(() => {
    return storeItems.reduce((acc, item) => acc + item.price * (item.cartQuantity || 1), 0);
  }, [storeItems]);

  // Ubicación seleccionada
  const activeLocation = useMemo(() => {
    if (!store.locations || store.locations.length === 0) return null;
    return store.locations.find((l) => l.id === selectedLocationId) || store.locations[0];
  }, [store.locations, selectedLocationId]);

  // Servicio más accesible para precio "desde"
  const lowestServicePrice = useMemo(() => {
    if (!store.services || store.services.length === 0) return null;
    return Math.min(...store.services.map((s) => s.price));
  }, [store.services]);

  const handleProceedToBooking = (timeSlot?: string) => {
    const params = new URLSearchParams();
    if (selectedLocationId) {
      params.set("locationId", String(selectedLocationId));
    }
    if (timeSlot) {
      params.set("timeSlot", timeSlot);
    }

    if (hasServices || hasPackages || store.services?.length) {
      const queryString = params.toString() ? `?${params.toString()}` : "";
      router.push(`/${locale}/patient/booking/${store.slug}${queryString}`);
    } else {
      router.push(`/${locale}/checkout`);
    }
  };

  const handleScrollToCatalog = () => {
    const catalogEl = document.getElementById("catalog-section");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const mapsUrl = activeLocation
    ? buildGoogleMapsUrl(activeLocation, store.displayName)
    : null;

  return (
    <div className="sticky top-24 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl space-y-6 font-sans transition-all">
      {/* 1. CABECERA: PRECIO O ESTADO DE RESERVA */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          {storeItems.length > 0 ? (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Tu Selección Actual
              </span>
              <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs font-semibold text-gray-400 ml-1.5">MXN</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Consulta & Atención
              </span>
              <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {lowestServicePrice != null ? (
                  <>
                    <span className="text-xs font-bold text-gray-500 mr-1">Desde</span>
                    ${lowestServicePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-xs font-semibold text-gray-400 ml-1">MXN</span>
                  </>
                ) : (
                  <span className="text-lg">Catálogo Directo</span>
                )}
              </div>
            </div>
          )}
        </div>

        {scoreData && (
          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 rounded-full shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>QuScore {scoreData.score}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium mt-0.5">Verificado</span>
          </div>
        )}
      </div>

      {/* 2. SEDE ACTIVA SELECCIONADA */}
      {activeLocation && (
        <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[180px]">{activeLocation.name}</span>
            </span>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 shrink-0"
              >
                <span>Ver mapa</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pl-5 line-clamp-2">
            {activeLocation.address || activeLocation.city || "Dirección al agendar"}
          </p>
        </div>
      )}

      {/* 3. DISPONIBILIDAD RÁPIDA INTERACTIVA */}
      {store.services && store.services.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Próximos Horarios</span>
          </span>
          <QuickAvailability
            providerId={store.providerId}
            locations={store.locations}
            selectedLocationId={selectedLocationId}
            onSelectSlot={(slot) => handleProceedToBooking(slot)}
          />
        </div>
      )}

      {/* 4. LISTA DE ELEMENTOS SELECCIONADOS (SI LOS HAY) */}
      {storeItems.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>En tu selección</span>
            <span>{storeItems.length} {storeItems.length === 1 ? "ítem" : "ítems"}</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {storeItems.map((item) => (
              <div
                key={`${item.id}-${item.type}`}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.type === "SERVICE" && <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  {item.type === "PACKAGE" && <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                  {item.type === "PRODUCT" && <ShoppingBag className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${(item.price * (item.cartQuantity || 1)).toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold px-1"
                    title="Quitar"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BOTÓN DE ACCIÓN PRIMARIO */}
      <div className="space-y-2 pt-2">
        {storeItems.length > 0 ? (
          <Button
            onClick={() => handleProceedToBooking()}
            className="w-full h-12 rounded-2xl text-xs font-bold tracking-wide text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
            style={{ backgroundColor: safePrimaryColor }}
          >
            <span>{hasServices || hasPackages ? "Continuar con la Cita" : "Proceder al Pago"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleScrollToCatalog}
            className="w-full h-12 rounded-2xl text-xs font-bold tracking-wide text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
            style={{ backgroundColor: safePrimaryColor }}
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Servicios Disponibles</span>
          </Button>
        )}

        <p className="text-[11px] text-center text-gray-400 font-medium">
          {store.cancellationPolicy ? "Cancelación flexible disponible" : "Confirmación inmediata en línea"}
        </p>
      </div>

      {/* 6. GARANTÍAS DE CONFIANZA */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5 text-[11px] text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Expediente NOM-004 y datos clínicos encriptados</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Pago seguro SSL con retención en garantía</span>
        </div>
      </div>
    </div>
  );
};
