"use client";

/* eslint-disable react-doctor/no-initialize-state */

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  readCookieConsent,
  type CookieConsentRecord,
} from "@/components/ui/CookieConsent";
import { captureAndStoreAttribution } from "@/lib/analytics/funnel-events";

type ConsentState = Pick<CookieConsentRecord, "analytics" | "marketing">;

const DEFAULT_CONSENT: ConsentState = { analytics: false, marketing: false };

const isAdminPath = (pathname: string | null): boolean => {
  if (!pathname) return false;
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    /^\/[a-zA-Z]{2}\/admin(\/|$)/.test(pathname)
  );
};

export const AnalyticsManager = () => {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  // Captura UTMs / gclid / fbclid al aterrizar desde redes sociales o anuncios
  useEffect(() => {
    if (!isAdminPath(pathname)) {
      captureAndStoreAttribution();
    }
  }, [pathname]);

  useEffect(() => {
    const applyStoredConsent = () => {
      const stored = readCookieConsent();
      setConsent(
        stored
          ? { analytics: stored.analytics, marketing: stored.marketing }
          : DEFAULT_CONSENT
      );
    };

    // Aplica el consentimiento guardado al montar el componente
    applyStoredConsent();

    // Escucha cambios inmediatos desde el banner de CookieConsent
    const handleConsentEvent = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsentRecord>).detail;
      if (detail) {
        setConsent({
          analytics: detail.analytics,
          marketing: detail.marketing,
        });
      } else {
        applyStoredConsent();
      }
    };

    window.addEventListener("cookie_consent_changed", handleConsentEvent);
    return () =>
      window.removeEventListener("cookie_consent_changed", handleConsentEvent);
  }, []);

  if (isAdminPath(pathname)) {
    return null;
  }

  return (
    <>
      {/* 📊 GOOGLE ANALYTICS — Solo se carga con consentimiento activo y fuera de /admin */}
      {consent.analytics && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* 🎯 MARKETING — Infraestructura reservada para píxeles de conversión */}
    </>
  );
};