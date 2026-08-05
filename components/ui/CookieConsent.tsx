"use client";

/* eslint-disable react-doctor/no-react19-deprecated-apis */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/only-export-components */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, ShieldCheck, Settings, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── CONTRATO ÚNICO DE CONSENTIMIENTO ──────────────────────────────────────
export const COOKIE_CONSENT_KEY = "quhealthy_cookie_consent";
export const COOKIE_POLICY_VERSION = "2026-06-18";

export interface CookieConsentRecord {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  policyVersion: string;
}

type ConsentChoice = Pick<
  CookieConsentRecord,
  "functional" | "analytics" | "marketing"
>;

const ALL_ACCEPTED: ConsentChoice = {
  functional: true,
  analytics: true,
  marketing: true,
};

const ONLY_ESSENTIAL: ConsentChoice = {
  functional: false,
  analytics: false,
  marketing: false,
};

/**
 * Lee y valida el consentimiento almacenado en localStorage.
 */
export function readCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.policyVersion === COOKIE_POLICY_VERSION &&
      typeof parsed.functional === "boolean" &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean"
    ) {
      return { essential: true, ...parsed };
    }
    return null;
  } catch {
    return null;
  }
}

function writeCookieConsent(choice: ConsentChoice): CookieConsentRecord {
  const consent: CookieConsentRecord = {
    essential: true,
    ...choice,
    timestamp: new Date().toISOString(),
    policyVersion: COOKIE_POLICY_VERSION,
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(
    new CustomEvent<CookieConsentRecord>("cookie_consent_changed", {
      detail: consent,
    })
  );
  return consent;
}

export const CookieConsent = () => {
  const t = useTranslations("CookieConsent");
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [prefs, setPrefs] = useState<ConsentChoice>(ONLY_ESSENTIAL);

  // Muestra el banner si no existe un consentimiento válido
  useEffect(() => {
    const existing = readCookieConsent();
    if (!existing) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Escucha el evento global para reabrir el panel desde el footer u otra sección
  useEffect(() => {
    const openPreferences = () => {
      const existing = readCookieConsent();
      setPrefs(
        existing
          ? {
              functional: existing.functional,
              analytics: existing.analytics,
              marketing: existing.marketing,
            }
          : ONLY_ESSENTIAL
      );
      setShowPreferences(true);
      setIsVisible(true);
    };
    window.addEventListener("open_cookie_preferences", openPreferences);
    return () =>
      window.removeEventListener("open_cookie_preferences", openPreferences);
  }, []);

  const handleAcceptAll = () => {
    writeCookieConsent(ALL_ACCEPTED);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    writeCookieConsent(ONLY_ESSENTIAL);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    writeCookieConsent(prefs);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:w-[430px] z-[9999] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-5 sm:p-6 font-sans transition-colors select-none"
        >
          {showPreferences ? (
            /* ── VISTA DE CONFIGURACIÓN GRANULAR ──────────────────────── */
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <Settings className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("preferences_title")}
                  </h3>
                </div>

                <button
                  type="button"
                  aria-label={t("back_label")}
                  onClick={() => setShowPreferences(false)}
                  className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {/* Lista de Categorías de Cookies */}
              <div className="space-y-4 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                {/* Esenciales */}
                <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                        strokeWidth={2}
                      />
                      <span>{t("essential_title")}</span>
                    </h4>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("essential_desc")}
                    </p>
                  </div>

                  <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0.5 shadow-2xs shrink-0">
                    <Check className="w-3 h-3 mr-1" strokeWidth={2.5} />
                    <span>Activas</span>
                  </Badge>
                </div>

                {/* Funcionales */}
                <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("functional_title")}
                    </h4>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("functional_desc")}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={t("toggle_functional")}
                    onClick={() =>
                      setPrefs((p) => ({ ...p, functional: !p.functional }))
                    }
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer shadow-2xs",
                      prefs.functional
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : "bg-gray-200 dark:bg-gray-800"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-2xs",
                        prefs.functional ? "translate-x-4" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {/* Analíticas */}
                <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("analytics_title")}
                    </h4>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("analytics_desc")}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={t("toggle_analytics")}
                    onClick={() =>
                      setPrefs((p) => ({ ...p, analytics: !p.analytics }))
                    }
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer shadow-2xs",
                      prefs.analytics
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : "bg-gray-200 dark:bg-gray-800"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-2xs",
                        prefs.analytics ? "translate-x-4" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {/* Rendimiento / Marketing */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("marketing_title")}
                    </h4>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("marketing_desc")}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={t("toggle_marketing")}
                    onClick={() =>
                      setPrefs((p) => ({ ...p, marketing: !p.marketing }))
                    }
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer shadow-2xs",
                      prefs.marketing
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : "bg-gray-200 dark:bg-gray-800"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-2xs",
                        prefs.marketing ? "translate-x-4" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSavePreferences}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-xl text-xs font-bold transition-all shadow-xs border-0 cursor-pointer"
              >
                {t("save_btn")}
              </Button>
            </div>
          ) : (
            /* ── VISTA PRINCIPAL DEL AVISO DE COOKIES ─────────────────── */
            <div className="space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Cookie className="w-5 h-5" strokeWidth={2} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("description")}
                  </p>
                </div>
              </div>

              {/* Acciones de consentimiento */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer"
                >
                  {t("accept_all")}
                </Button>

                <div className="flex items-center gap-2 w-full sm:flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRejectAll}
                    className="flex-1 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl h-10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    {t("reject")}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPreferences(true)}
                    className="flex-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl h-10 text-xs font-bold transition-all cursor-pointer"
                  >
                    {t("configure")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};