/* eslint-disable react-doctor/no-react19-deprecated-apis */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/only-export-components, react-refresh/only-export-components */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, ShieldCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Shared consent contract. AnalyticsManager.tsx imports `readCookieConsent`
// and the `CookieConsentRecord` type from here — this file is the single
// source of truth for the storage key, the schema, and the policy version.
// If you add a new category (e.g. "personalization"), update it only here.
// ---------------------------------------------------------------------------

export const COOKIE_CONSENT_KEY = "quhealthy_cookie_consent";

// Bump this whenever the published Cookie Policy changes in a way that
// affects categories or their meaning (it should match the "LAST UPDATED"
// date on /cookies). Any stored consent with a different or missing
// version — including the old "all" / "essential" string formats — is
// treated as invalid, and the banner is shown again.
export const COOKIE_POLICY_VERSION = "2026-06-18";

export interface CookieConsentRecord {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  policyVersion: string;
}

type ConsentChoice = Pick<CookieConsentRecord, "functional" | "analytics" | "marketing">;

const ALL_ACCEPTED: ConsentChoice = { functional: true, analytics: true, marketing: true };
// Everything non-essential defaults to OFF. Pre-checked boxes for optional
// categories are not valid affirmative consent under any of the frameworks
// this product needs to respect.
const ONLY_ESSENTIAL: ConsentChoice = { functional: false, analytics: false, marketing: false };

/**
 * Reads and validates stored consent. Returns null if there's no consent,
 * it's malformed, or it belongs to an older policy version — all of which
 * should be treated as "must ask again".
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
    // Legacy values ("all" / "essential" strings from the previous
    // implementation) simply fail JSON.parse and fall through to null,
    // which correctly forces a fresh prompt under the new schema.
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
  window.dispatchEvent(new CustomEvent<CookieConsentRecord>("cookie_consent_changed", { detail: consent }));
  return consent;
}

export const CookieConsent = () => {
  const t = useTranslations("CookieConsent");
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Granular preferences shown in the "Configure" view.
  const [prefs, setPrefs] = useState<ConsentChoice>(ONLY_ESSENTIAL);

  // Show the banner if there's no valid consent for the current policy version.
  useEffect(() => {
    const existing = readCookieConsent();
    if (!existing) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Lets any "Manage Cookie Preferences" link/button elsewhere in the app
  // (e.g. the site footer) reopen this modal on demand, pre-loaded with the
  // user's current saved choices instead of resetting them to defaults.
  // Usage: window.dispatchEvent(new Event("open_cookie_preferences"))
  useEffect(() => {
    const openPreferences = () => {
      const existing = readCookieConsent();
      setPrefs(
        existing
          ? { functional: existing.functional, analytics: existing.analytics, marketing: existing.marketing }
          : ONLY_ESSENTIAL
      );
      setShowPreferences(true);
      setIsVisible(true);
    };
    window.addEventListener("open_cookie_preferences", openPreferences);
    return () => window.removeEventListener("open_cookie_preferences", openPreferences);
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
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="fixed bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-auto md:w-[420px] z-[9999] bg-white dark:bg-slate-900 rounded-xl shadow-[0_18px_50px_-18px_rgba(15,23,42,0.45)] dark:shadow-[0_18px_50px_-18px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-slate-800 overflow-hidden font-sans"
        >
          {showPreferences ? (
            // Preferences View
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{t('preferences_title')}</h3>
                </div>
                <button aria-label={t('back_label')} onClick={() => setShowPreferences(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t('essential_title')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('essential_desc')}</p>
                  </div>
                  <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-900 dark:bg-slate-100 cursor-not-allowed opacity-70">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition translate-x-4" />
                  </div>
                </div>

                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t('functional_title')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('functional_desc')}</p>
                  </div>
                  <button
                    aria-label={t('toggle_functional')}
                    onClick={() => setPrefs((p) => ({ ...p, functional: !p.functional }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${prefs.functional ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition ${prefs.functional ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t('analytics_title')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('analytics_desc')}</p>
                  </div>
                  <button
                    aria-label={t('toggle_analytics')}
                    onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${prefs.analytics ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition ${prefs.analytics ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t('marketing_title')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('marketing_desc')}</p>
                  </div>
                  <button
                    aria-label={t('toggle_marketing')}
                    onClick={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${prefs.marketing ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition ${prefs.marketing ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white h-11 rounded-xl text-sm font-medium">
                {t('save_btn')}
              </Button>
            </div>
          ) : (
            // Default View
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight mb-1">{t('title')}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    {t('description')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                <Button
                  onClick={handleAcceptAll}
                  className="w-full sm:flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl h-10 text-sm font-medium"
                >
                  {t('accept_all')}
                </Button>
                <div className="flex items-center gap-2.5 w-full sm:flex-1">
                  <Button
                    variant="outline"
                    onClick={handleRejectAll}
                    className="flex-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl h-10 text-sm font-medium"
                  >
                    {t('reject')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPreferences(true)}
                    className="flex-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl h-10 text-sm font-medium"
                  >
                    {t('configure')}
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