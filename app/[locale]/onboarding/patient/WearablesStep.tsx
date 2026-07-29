"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect, useState } from "react";
import {
  Watch,
  Apple,
  Smartphone,
  Link as LinkIcon,
  Check,
  ShieldCheck,
  Unlink,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import {
  wearableService,
  WearableConnection,
} from "@/services/wearable.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// ── SVG ICONS DE MARCAS REGISTRADAS ──────────────────────────────────────────
const GoogleFitIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.996 9.484L8.746 6.234C7.575 5.063 5.676 5.063 4.505 6.234C3.334 7.405 3.334 9.304 4.505 10.475L11.996 17.966L15.246 14.716L11.996 11.466V9.484Z"
      fill="#EA4335"
    />
    <path
      d="M11.996 17.966L19.487 10.475C20.658 9.304 20.658 7.405 19.487 6.234C18.316 5.063 16.417 5.063 15.246 6.234L11.996 9.484V11.466L15.246 14.716L11.996 17.966Z"
      fill="#34A853"
    />
    <path
      d="M15.246 14.716L19.487 18.957C20.658 20.128 20.658 22.027 19.487 23.198C18.316 24.369 16.417 24.369 15.246 23.198L10.513 18.465L15.246 14.716Z"
      fill="#FBBC05"
    />
    <path
      d="M10.513 18.465L4.505 12.457C3.334 11.286 3.334 9.387 4.505 8.216C5.676 7.045 7.575 7.045 8.746 8.216L15.246 14.716L10.513 18.465Z"
      fill="#4285F4"
    />
  </svg>
);

const GarminIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L2.5 10l9.5 14L21.5 10 12 0zm0 18.5L5.5 10 12 3.5 18.5 10 12 18.5z" />
  </svg>
);

const OuraIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
  </svg>
);

const FitbitIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.7 10.3c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3zm-5.7-1.1c1.1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2zm-5.4 6c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm0-11c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm0 5.4c1 0 1.9.8 1.9 1.9s-.8 1.9-1.9 1.9-1.9-.8-1.9-1.9.8-1.9 1.9-1.9zm-5.4 1.1c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4.6-1.4 1.4-1.4z" />
  </svg>
);

export const WearablesStep = () => {
  const t = useTranslations("OnboardingWearables");

  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAuth, setProcessingAuth] = useState(false);

  const WEARABLES = [
    {
      id: "google_fit",
      name: t("providers.google_fit.name"),
      icon: GoogleFitIcon,
      desc: t("providers.google_fit.desc"),
      iconBg:
        "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white",
    },
    {
      id: "apple_health",
      name: t("providers.apple_health.name"),
      icon: Apple,
      desc: t("providers.apple_health.desc"),
      iconBg:
        "bg-black text-white dark:bg-white dark:text-black border-transparent",
      mobileOnly: true,
    },
    {
      id: "garmin",
      name: t("providers.garmin.name"),
      icon: GarminIcon,
      desc: t("providers.garmin.desc"),
      iconBg: "bg-gray-900 text-white dark:bg-gray-800 border-gray-800",
    },
    {
      id: "fitbit",
      name: t("providers.fitbit.name"),
      icon: FitbitIcon,
      desc: t("providers.fitbit.desc"),
      iconBg: "bg-[#00B0B9] text-white border-transparent",
    },
    {
      id: "oura",
      name: t("providers.oura.name"),
      icon: OuraIcon,
      desc: t("providers.oura.desc"),
      iconBg: "bg-gray-900 text-white dark:bg-gray-800 border-gray-800",
    },
  ];

  useEffect(() => {
    // 1. Revisar si regresamos de un Callback OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const stateParam = urlParams.get("state");

    const provider = stateParam
      ? stateParam.split("_")[0] + "_" + stateParam.split("_")[1]
      : "google_fit";

    if (code && !processingAuth) {
      // Verificación de Seguridad CSRF
      const savedState = sessionStorage.getItem("oauth_state");
      if (savedState && savedState !== stateParam) {
        console.error("CSRF Validation failed. State mismatch.", {
          expected: savedState,
          got: stateParam,
        });
        toast.error(t("toasts.csrf_error"));
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        sessionStorage.removeItem("oauth_state");
        return;
      }

      sessionStorage.removeItem("oauth_state");
      setProcessingAuth(true);
      wearableService
        .handleCallback(provider, code)
        .then(() => {
          toast.success(t("toasts.auth_success"));
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          loadConnections();
        })
        .catch((err) => {
          console.error("Error oauth", err);
          toast.error(t("toasts.auth_error"));
        })
        .finally(() => setProcessingAuth(false));
    } else {
      loadConnections();
    }
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await wearableService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = (providerId: string) => {
    return connections.some(
      (c) => c.provider === providerId && c.status === "CONNECTED"
    );
  };

  const handleConnect = (providerId: string, providerName: string) => {
    if (providerId === "apple_health") {
      toast.info(t("toasts.apple_health_info"));
      return;
    }

    if (providerId === "google_fit") {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        toast.error(t("toasts.missing_client_id"));
        return;
      }

      const redirectUri =
        typeof window !== "undefined"
          ? window.location.origin + window.location.pathname
          : "";
      const scope = encodeURIComponent(
        "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.blood_pressure.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read"
      );

      // Generar Token CSRF
      const csrfToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const state = `google_fit_${csrfToken}`;
      sessionStorage.setItem("oauth_state", state);

      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

      window.location.href = url;
      return;
    }

    toast.info(t("toasts.upcoming_integration", { provider: providerName }));
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      await wearableService.disconnectProvider(providerId);
      toast.success(t("toasts.revoke_success"));
      loadConnections();
    } catch (error) {
      toast.error(t("toasts.revoke_error"));
    }
  };

  return (
    <div className="space-y-6 font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      {/* Header Sección */}
      <div className="space-y-1.5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
            <Watch className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("header_badge")}</span>
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
          {t("title")}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Banner Procesando OAuth */}
      {processingAuth && (
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center gap-3">
          <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {t("processing_auth")}
          </span>
        </div>
      )}

      {/* Grid de Wearables / Loading State */}
      {loading && !processingAuth ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-semibold text-gray-400 animate-pulse">
            {t("loading")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WEARABLES.map((wearable) => {
            const connected = isConnected(wearable.id);
            const IconComponent = wearable.icon;

            return (
              <div
                key={wearable.id}
                className={cn(
                  "p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-5 shadow-sm group",
                  connected
                    ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm",
                        wearable.iconBg
                      )}
                    >
                      <IconComponent />
                    </div>

                    {connected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>{t("connected")}</span>
                      </span>
                    )}

                    {wearable.mobileOnly && !connected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold">
                        <Smartphone className="w-3 h-3" strokeWidth={2} />
                        <span>{t("ios_native")}</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {wearable.name}
                    </h4>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {wearable.desc}
                    </p>
                  </div>
                </div>

                <div>
                  {connected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(wearable.id)}
                      className="w-full h-10 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Unlink className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{t("btn_disconnect")}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(wearable.id, wearable.name)}
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <LinkIcon className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{t("btn_connect")}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nota Informativa de Seguridad */}
      <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
        <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t("security_title")}</span>
        </p>
        <p className="text-xs font-medium text-gray-500 leading-relaxed">
          {t("security_desc")}
        </p>
      </div>
    </div>
  );
};