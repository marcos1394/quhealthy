"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Sparkles, UserPlus, LogIn, X, ShieldCheck } from "lucide-react";
import { useSessionStore } from "@/stores/SessionStore";
import { useBookingStore } from "@/hooks/useBookingStore";
import { cn } from "@/lib/utils";

export interface GuestStorefrontBannerProps {
  storeName?: string;
  slug?: string;
  brandColor?: string;
  type?: "store" | "product";
  floating?: boolean;
  className?: string;
}

export function GuestStorefrontBanner({
  storeName,
  slug,
  brandColor = "#059669",
  type = "store",
  floating = false,
  className,
}: GuestStorefrontBannerProps) {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { user, token } = useSessionStore();
  const { cart } = useBookingStore();
  const hasCartItems = Boolean(cart && cart.length > 0);

  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== "undefined") {
        const dismissed = sessionStorage.getItem("guest_storefront_banner_dismissed");
        if (dismissed === "true") {
          setIsDismissed(true);
        }
      }
    } catch {
      // sessionStorage no disponible
    }
  }, []);

  // No renderizar en SSR para evitar desajustes de hidratación con el store de cliente
  if (!mounted) {
    return null;
  }

  // Si el usuario ya está autenticado o cerró el aviso voluntariamente, no mostrar
  if (user || token || isDismissed) {
    return null;
  }

  // Si está flotando y el usuario ya tiene ítems en el carrito, cedemos espacio a la barra de checkout
  if (floating && hasCartItems) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("guest_storefront_banner_dismissed", "true");
      }
    } catch {
      // Ignore
    }
  };

  const safeBrandColor =
    brandColor && brandColor !== "#ffffff" && brandColor !== "#000000"
      ? brandColor
      : "#059669";

  // Construir ruta de retorno inteligente
  let returnPath = "";
  if (typeof window !== "undefined") {
    returnPath = window.location.pathname + window.location.search;
  } else if (slug) {
    returnPath = type === "product" ? `/${locale}/market/item/${slug}` : `/${locale}/store/${slug}`;
  }
  const redirectParam = returnPath ? `?redirect=${encodeURIComponent(returnPath)}` : "";

  const title =
    type === "product"
      ? "¿Deseas adquirir este ítem o agendar una cita?"
      : `¿Primera vez en ${storeName || "esta tienda"}?`;

  const description =
    type === "product"
      ? "Crea tu cuenta gratuita o inicia sesión para comprar con entrega garantizada, agendar consultas médicas y dar seguimiento a tu salud en QuHealthy."
      : "Regístrate en pocos segundos o inicia sesión en QuHealthy para agendar tus consultas, comprar productos con entrega garantizada y dar seguimiento a tus tratamientos.";

  return (
    <aside
      data-testid="guest-storefront-banner"
      aria-label="Invitación para registrarse o iniciar sesión"
      className={cn(
        floating
          ? "fixed bottom-4 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 max-w-4xl mx-auto z-40 overflow-hidden rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl shadow-emerald-950/20 dark:shadow-black/70 p-3.5 sm:p-4 transition-all duration-300 animate-in slide-in-from-bottom-5"
          : "relative overflow-hidden rounded-2xl border border-emerald-200/90 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50/95 via-white to-teal-50/90 dark:from-emerald-950/40 dark:via-[#111111] dark:to-teal-950/30 p-4 sm:p-5 shadow-xs backdrop-blur-xs transition-all duration-300",
        className
      )}
    >
      {/* Botón de descarte accesible */}
      <button
        type="button"
        data-testid="guest-banner-close-btn"
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
        aria-label="Cerrar aviso de registro"
        title="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-6 sm:pr-8">
        {/* Contenido e Identidad */}
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5"
            style={{ backgroundColor: `${safeBrandColor}18`, color: safeBrandColor }}
          >
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3" />
                Comunidad QuHealthy
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Acciones de Autenticación */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-1 md:pt-0">
          <Link
            href={`/${locale}/register${redirectParam}`}
            data-testid="guest-banner-register-btn"
            style={{ backgroundColor: safeBrandColor }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </Link>

          <Link
            href={`/${locale}/login${redirectParam}`}
            data-testid="guest-banner-login-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-[#222222] active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
