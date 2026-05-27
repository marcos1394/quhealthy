"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}

export const AnalyticsManager = () => {
  const [consent, setConsent] = useState<ConsentState>({ analytics: false, marketing: false });

  // Función para evaluar y aplicar el estado del localStorage
  const checkConsent = () => {
    const saved = localStorage.getItem("quhealthy_cookie_consent");
    if (!saved) return;

    if (saved === "all") {
      setConsent({ analytics: true, marketing: true });
    } else if (saved === "essential") {
      setConsent({ analytics: false, marketing: false });
    } else {
      // Intentamos parsear el JSON de 'custom' preferences
      try {
        const parsed = JSON.parse(saved);
        setConsent({
          analytics: !!parsed.analytics,
          marketing: !!parsed.marketing,
        });
      } catch (e) {
        setConsent({ analytics: false, marketing: false });
      }
    }
  };

  useEffect(() => {
    // Revisar al cargar
    checkConsent();

    // Escuchar el evento personalizado cuando el CookieConsent cambie el localStorage
    window.addEventListener("cookie_consent_changed", checkConsent);
    return () => window.removeEventListener("cookie_consent_changed", checkConsent);
  }, []);

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <>
      {/* 📊 GOOGLE ANALYTICS (Se inyecta si analytics es true y GA_ID existe) */}
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
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {/* 🎯 META PIXEL (Se inyecta si marketing es true y FB_PIXEL_ID existe) */}
      {consent.marketing && FB_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
};
