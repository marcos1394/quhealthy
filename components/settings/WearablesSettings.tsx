"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  Apple,
  Smartphone,
  Link as LinkIcon,
  Check,
  Watch,
} from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  wearableService,
  WearableConnection,
} from "@/services/wearable.service";
import { cn } from "@/lib/utils";

// ── ICONOS SVG DE MARCAS ────────────────────────────────────────────────
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
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L2.5 10l9.5 14L21.5 10 12 0zm0 18.5L5.5 10 12 3.5 18.5 10 12 18.5z" />
  </svg>
);

const OuraIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
  </svg>
);

const FitbitIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.7 10.3c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3zm-5.7-1.1c1.1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2zm-5.4 6c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm0-11c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm0 5.4c1 0 1.9.8 1.9 1.9s-.8 1.9-1.9 1.9-1.9-.8-1.9-1.9.8-1.9 1.9-1.9zm-5.4 1.1c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4.6-1.4 1.4-1.4z" />
  </svg>
);

export function WearablesSettings() {
  const t = useTranslations("SettingsWearables");

  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAuth, setProcessingAuth] = useState(false);

  const WEARABLES = useMemo(
    () => [
      {
        id: "google_fit",
        name: "Google Fit",
        icon: GoogleFitIcon,
        desc: t("providers.google_fit_desc"),
        color: "bg-white dark:bg-[#0a0a0a]",
        textColor: "text-gray-900 dark:text-white",
        border: "border-gray-200 dark:border-gray-800",
      },
      {
        id: "apple_health",
        name: "Apple Health",
        icon: Apple,
        desc: t("providers.apple_health_desc"),
        color: "bg-gray-900 dark:bg-white",
        textColor: "text-white dark:text-gray-900",
        border: "border-gray-900 dark:border-white",
        mobileOnly: true,
      },
      {
        id: "garmin",
        name: "Garmin Connect",
        icon: GarminIcon,
        desc: t("providers.garmin_desc"),
        color: "bg-gray-900 dark:bg-[#0a0a0a]",
        textColor: "text-white",
        border: "border-gray-900 dark:border-gray-800",
      },
      {
        id: "fitbit",
        name: "Fitbit",
        icon: FitbitIcon,
        desc: t("providers.fitbit_desc"),
        color: "bg-[#00B0B9]",
        textColor: "text-white",
        border: "border-[#00B0B9]",
      },
      {
        id: "oura",
        name: "Oura Ring",
        icon: OuraIcon,
        desc: t("providers.oura_desc"),
        color: "bg-gray-900 dark:bg-[#0a0a0a]",
        textColor: "text-white",
        border: "border-gray-900 dark:border-gray-800",
      },
    ],
    [t]
  );

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await wearableService.getConnections();
      setConnections(data || []);
    } catch (error) {
      console.error("Error al cargar conexiones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const stateParam = urlParams.get("state");

    const provider = stateParam
      ? `${stateParam.split("_")[0]}_${stateParam.split("_")[1]}`
      : "google_fit";

    if (code && !processingAuth) {
      const savedState = sessionStorage.getItem("oauth_state");
      if (savedState && savedState !== stateParam) {
        console.error("Falló la validación CSRF.", {
          expected: savedState,
          got: stateParam,
        });
        toast.error(t("toast_csrf_error"));
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
          toast.success(t("toast_oauth_success", { provider }));
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          loadConnections();
        })
        .catch((err) => {
          console.error("Error oauth", err);
          toast.error(t("toast_oauth_error"));
        })
        .finally(() => setProcessingAuth(false));
    } else {
      loadConnections();
    }
  }, [processingAuth, t]);

  const isConnected = (providerId: string) => {
    return connections.some(
      (c) => c.provider === providerId && c.status === "CONNECTED"
    );
  };

  const handleConnect = (providerId: string) => {
    if (providerId === "apple_health") {
      toast.info(t("toast_apple_info"));
      return;
    }

    if (providerId === "google_fit") {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        toast.error(t("toast_google_missing_client"));
        return;
      }

      const redirectUri =
        typeof window !== "undefined"
          ? window.location.origin + window.location.pathname
          : "";
      const scope = encodeURIComponent(
        "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.blood_pressure.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read"
      );

      const csrfToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const state = `google_fit_${csrfToken}`;
      sessionStorage.setItem("oauth_state", state);

      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

      window.location.href = url;
      return;
    }

    toast.info(t("toast_upcoming_integration", { provider: providerId }));
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      await wearableService.disconnectProvider(providerId);
      toast.success(t("toast_disconnect_success"));
      loadConnections();
    } catch (error) {
      console.error(error);
      toast.error(t("toast_disconnect_error"));
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── ENCABEZADO DE SECCIÓN ────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Watch className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("title")}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Banner de procesamiento OAuth */}
      {processingAuth && (
        <div className="rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/30 p-4 flex items-center justify-center gap-3 shadow-2xs">
          <QhSpinner size="sm" className="text-sky-600 dark:text-sky-400" />
          <span className="text-xs font-bold text-sky-800 dark:text-sky-300">
            {t("processing_auth")}
          </span>
        </div>
      )}

      {/* ── MATRIZ DE WEARABLES Y DISPOSITIVOS ───────────────────────── */}
      {loading && !processingAuth ? (
        <div className="flex justify-center py-12">
          <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {WEARABLES.map((wearable) => {
            const connected = isConnected(wearable.id);

            return (
              <div
                key={wearable.id}
                className={cn(
                  "p-6 rounded-3xl border transition-all duration-200 relative flex flex-col justify-between shadow-2xs space-y-6 overflow-hidden",
                  connected
                    ? "border-emerald-500/80 ring-1 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs border shrink-0",
                        wearable.color,
                        wearable.border
                      )}
                    >
                      <wearable.icon
                        className={cn("w-6 h-6", wearable.textColor)}
                      />
                    </div>

                    {connected && (
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                        <span>{t("connected_badge")}</span>
                      </Badge>
                    )}

                    {wearable.mobileOnly && !connected && (
                      <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                        <Smartphone className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                        <span>{t("mobile_only_badge")}</span>
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                      {wearable.name}
                    </h4>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {wearable.desc}
                    </p>
                  </div>
                </div>

                <div>
                  {connected ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDisconnect(wearable.id)}
                      className="w-full h-10 rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      {t("btn_disconnect")}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleConnect(wearable.id)}
                      className="w-full h-10 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-600 dark:hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LinkIcon className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{t("btn_connect")}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── NOTA DE PRIVACIDAD Y CIFRADO ─────────────────────────────── */}
      <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 shadow-2xs space-y-1">
        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
          <span>{t("privacy_title")}</span>
        </p>

        <p className="text-xs font-medium text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
          {t("privacy_desc")}
        </p>
      </div>
    </div>
  );
}