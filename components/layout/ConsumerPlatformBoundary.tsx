"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { LocationPrompt } from "@/components/ui/LocationPrompt";
import { AnalyticsManager } from "@/components/providers/AnalyticsManager";
import { TelemetryTracker } from "@/components/providers/TelemetryTracker";
import { PulsoFloatingAssistant } from "@/components/ai/PulsoFloatingAssistant";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Helper para verificar si una ruta o hostname pertenece a la superficie administrativa (ADMIN-UX-01).
 */
export const isAdministrativeSurface = (
  pathname: string | null,
  hostname?: string
): boolean => {
  if (hostname) {
    const isHostAdmin =
      hostname === "admin.quhealthy.org" ||
      hostname.startsWith("admin.") ||
      hostname.startsWith("admin.localhost");
    if (isHostAdmin) return true;
  }

  if (!pathname) return false;

  // Coincide con /admin, /es/admin, /en/admin y cualquier subruta administrativa
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    /^\/[a-zA-Z]{2}\/admin(\/|$)/.test(pathname)
  );
};

/**
 * Límite arquitectónico que aisla la superficie administrativa de QuHealthy.
 * Excluye al 100% asistentes de salud (Pulso), geolocalización, banner de cookies,
 * analítica no aprobada (GTM/GA) y elementos de comercio de las rutas /admin y del subdominio admin.
 */
export function ConsumerPlatformBoundary() {
  const pathname = usePathname();

  const [isAdminSurface, setIsAdminSurface] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return isAdministrativeSurface(pathname, window.location.hostname);
    }
    return isAdministrativeSurface(pathname);
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdminSurface(
        isAdministrativeSurface(pathname, window.location.hostname)
      );
    }
  }, [pathname]);

  // Si estamos en la superficie administrativa, no se monta ningún recurso de consumidor
  if (isAdminSurface) {
    return null;
  }

  return (
    <>
      {/* Analítica y Telemetría de Consumidor */}
      <AnalyticsManager />
      <TelemetryTracker />

      {/* Interfaz de Consumidor: Cookies y Geolocalización */}
      <CookieConsent />
      <LocationPrompt />

      {/* Asistente Conversacional de Salud */}
      <PulsoFloatingAssistant />

      {/* Chatwoot Live Chat (Carga diferida) */}
      <Script id="chatwoot-widget" strategy="lazyOnload">
        {`
          window.chatwootSettings = {
            hideMessageBubble: true,
            position: 'right',
            type: 'standard'
          };
          (function(d,t) {
            var BASE_URL="https://app.chatwoot.com";
            var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src=BASE_URL+"/packs/js/sdk.js";
            g.async = true;
            g.onload=function(){
              window.chatwootSDK.run({
                websiteToken: '8NAP7B6kCJdHWj4S3vemxeJb',
                baseUrl: BASE_URL
              })
            }
            s.parentNode.insertBefore(g,s);
          })(document,"script");
        `}
      </Script>

      {/* Google Customer Reviews Badge (Comercio) */}
      <Script
        id="merchantWidgetScript"
        src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
        strategy="lazyOnload"
      />
      <Script id="merchantWidgetInit" strategy="lazyOnload">
        {`
          (function initGoogleMerchant(retries) {
            if (typeof window !== 'undefined' && window.merchantwidget) {
              try {
                window.merchantwidget.start({
                  merchant_id: 5836869157,
                  position: "BOTTOM_LEFT"
                });
              } catch (e) {
                console.warn("Merchant widget init error:", e);
              }
            } else if (retries > 0) {
              setTimeout(function() { initGoogleMerchant(retries - 1); }, 500);
            }
          })(20);
        `}
      </Script>

      {/* Vercel Analytics & Speed Insights para Superficie de Consumidor */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
