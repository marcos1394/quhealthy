"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, ShieldCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export const CookieConsent = () => {
  const t = useTranslations('CookieConsent');
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // State for granular preferences
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem("quhealthy_cookie_consent");
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("quhealthy_cookie_consent", "all");
    window.dispatchEvent(new Event("cookie_consent_changed"));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("quhealthy_cookie_consent", "essential");
    window.dispatchEvent(new Event("cookie_consent_changed"));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("quhealthy_cookie_consent", JSON.stringify(prefs));
    window.dispatchEvent(new Event("cookie_consent_changed"));
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
              
              <div className="space-y-3 mb-4 max-h-[260px] overflow-y-auto pr-2">
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
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t('analytics_title')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('analytics_desc')}</p>
                  </div>
                  <button 
                    aria-label={t('toggle_analytics')}
                    onClick={() => setPrefs({...prefs, analytics: !prefs.analytics})}
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
                    onClick={() => setPrefs({...prefs, marketing: !prefs.marketing})}
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
