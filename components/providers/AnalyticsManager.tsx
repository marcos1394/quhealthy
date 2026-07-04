"use client"
/* eslint-disable react-doctor/no-initialize-state */;

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { readCookieConsent, type CookieConsentRecord } from "@/components/ui/CookieConsent";

type ConsentState = Pick<CookieConsentRecord, "analytics" | "marketing">;

const DEFAULT_CONSENT: ConsentState = { analytics: false, marketing: false };

export const AnalyticsManager = () => {
 const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);

 useEffect(() => {
 const applyStoredConsent = () => {
 const stored = readCookieConsent();
 setConsent(stored ? { analytics: stored.analytics, marketing: stored.marketing } : DEFAULT_CONSENT);
 };

 // Apply on mount — this is what makes returning users' past choice take
 // effect immediately on a fresh page load, without waiting for a new
 // "cookie_consent_changed" event that only fires on the next click.
 applyStoredConsent();

 // React immediately when CookieConsent.tsx writes a new choice.
 const handleConsentEvent = (e: Event) => {
 const detail = (e as CustomEvent<CookieConsentRecord>).detail;
 if (detail) {
 setConsent({ analytics: detail.analytics, marketing: detail.marketing });
 } else {
 // Defensive fallback in case the event ever fires without a detail payload.
 applyStoredConsent();
 }
 };

 window.addEventListener("cookie_consent_changed", handleConsentEvent);
 return () => window.removeEventListener("cookie_consent_changed", handleConsentEvent);
 }, []);

 const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

 return (
 <>
 {/* 📊 GOOGLE ANALYTICS — only loads if the user opted in to Analytics */}
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

 {/*
 🎯 MARKETING — intentionally empty.
 QuHealthy does not currently use Meta Pixel or any other ad/remarketing
 pixel (see Cookie Policy, Section 3). The `marketing` consent category
 and its toggle stay in place so the consent infrastructure is ready if
 one is introduced later — but nothing should render here until that
 happens. If you add one:
 - gate it on `consent.marketing`, exactly like the Analytics block above
 - never place it on authenticated, search, or appointment-booking pages
 - only use it on public marketing pages with no clinical context
 */}
 </>
 );
};