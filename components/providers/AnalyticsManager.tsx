"use client";

/* eslint-disable react-doctor/no-initialize-state */

import React, { useEffect, useState } from "react";
import Script from "next/script";
import {
  readCookieConsent,
  type CookieConsentRecord,
} from "@/components/ui/CookieConsent";

type ConsentState = Pick<CookieConsentRecord, "analytics" | "marketing">;

const DEFAULT_CONSENT: ConsentState = { analytics: false, marketing: false };

export const AnalyticsManager = () => {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);

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

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      {/* 📊 GOOGLE ANALYTICS — Solo se carga con consentimiento activo */}
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