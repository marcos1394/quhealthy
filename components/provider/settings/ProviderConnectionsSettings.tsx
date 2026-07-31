"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useGoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { Shield, Globe, Trash2, Plus, Smartphone } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// ── TIPOS ──────────────────────────────────────────────────────────────
interface SocialConnection {
  id: string;
  platform: string;
  platformUserName: string;
  profileImageUrl: string | null;
  isConnected: boolean;
  connectedAt: string;
}

interface ProviderSettings {
  isGoogleConnected?: boolean;
  isAppleConnected?: boolean;
}

export function ProviderConnectionsSettings() {
  const t = useTranslations("SettingsConnections");
  const searchParams = useSearchParams();

  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [settings, setSettings] = useState<ProviderSettings>({});
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const [connRes, settingsRes] = await Promise.all([
        api.get("/social/connections"),
        api.get("/auth/provider/settings"),
      ]);
      setConnections(connRes.data || []);
      setSettings(settingsRes.data || {});
    } catch (err) {
      console.error(err);
      toast.error(t("toast.load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Revisa parámetros de URL para redirecciones de OAuth
    const socialConnected = searchParams.get("social_connected");
    const facebookConnected = searchParams.get("facebook_connected");
    const googleConnected = searchParams.get("google_connected");
    const linkedinConnected = searchParams.get("linkedin_connected");
    const instagramConnected = searchParams.get("instagram_connected");

    if (
      socialConnected === "true" ||
      facebookConnected === "true" ||
      googleConnected === "true" ||
      linkedinConnected === "true" ||
      instagramConnected === "true"
    ) {
      toast.success(t("toast.linked_success"));
    }

    const error = searchParams.get("error");
    if (error) {
      toast.error(t("toast.link_error"));
    }
  }, [searchParams]);

  // Hook de Google Login
  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        setConnecting("google");
        await api.post("/auth/provider/settings/link-identity/google", {
          token: tokenResponse.access_token,
          role: "PROVIDER",
        });
        toast.success(t("toast.google_success"));
        loadData();
      } catch (err) {
        console.error(err);
        toast.error(t("toast.google_error"));
      } finally {
        setConnecting(null);
      }
    },
    onError: () => {
      toast.error(t("toast.google_fail"));
      setConnecting(null);
    },
  });

  const handleConnect = async (provider: string) => {
    if (provider === "google") {
      googleLogin();
      return;
    }

    if (provider === "apple") {
      toast.info(t("toast.apple_soon"));
      return;
    }

    try {
      setConnecting(provider);
      const res = await api.get(`/social/${provider}/url`);
      if (res.data && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      toast.error(t("toast.redirect_error", { provider }));
      setConnecting(null);
    }
  };

  const handleDisconnect = async (
    id: string,
    provider: string,
    isIdentity = false
  ) => {
    try {
      if (isIdentity) {
        await api.delete(`/auth/provider/settings/link-identity/${provider}`);
      } else {
        await api.delete(`/social/connections/${id}`);
      }
      toast.success(t("toast.disconnected_success"));
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("toast.disconnect_error"));
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return (
          <span className="font-bold font-mono text-sm text-rose-500">G</span>
        );
      case "facebook":
        return (
          <span className="font-bold font-mono text-sm text-sky-600">f</span>
        );
      case "instagram":
        return (
          <span className="font-bold font-mono text-sm text-pink-500">ig</span>
        );
      case "linkedin":
        return (
          <span className="font-bold font-mono text-sm text-indigo-600">
            in
          </span>
        );
      case "apple":
        return (
          <span className="font-bold font-mono text-sm text-gray-900 dark:text-white">
            
          </span>
        );
      default:
        return (
          <Globe
            className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
            strokeWidth={2}
          />
        );
    }
  };

  const providersList: (
    | "google"
    | "facebook"
    | "instagram"
    | "linkedin"
    | "apple"
  )[] = ["google", "facebook", "instagram", "linkedin", "apple"];

  // Unificar conexiones sociales e identidades para renderizado
  const activeConnections = [
    ...connections.map((c) => ({
      id: c.id,
      provider: c.platform.toLowerCase(),
      name: c.platformUserName,
      connectedAt: new Date(c.connectedAt).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      isIdentity: false,
    })),
    ...(settings.isGoogleConnected
      ? [
          {
            id: "google-identity",
            provider: "google",
            name: "Google Identity",
            connectedAt: "Activo",
            isIdentity: true,
          },
        ]
      : []),
    ...(settings.isAppleConnected
      ? [
          {
            id: "apple-identity",
            provider: "apple",
            name: "Apple Identity",
            connectedAt: "Activo",
            isIdentity: true,
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 shadow-2xs flex items-center justify-center min-h-[350px]">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-8">
      {/* ── CABECERA ─────────────────────────────────────────────────── */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Shield className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* ── SECCIÓN: CUENTAS ACTIVAS ─────────────────────────────────── */}
        <div className="space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("social.title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("social.desc")}
            </p>
          </div>

          <div className="space-y-3">
            {activeConnections.length > 0 ? (
              activeConnections.map((conn) => (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-500/30 transition-all shadow-2xs gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-2xs">
                      {getProviderIcon(conn.provider)}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                          {t(`social.${conn.provider}`)}
                        </h4>
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                          {t("social.active_badge")}
                        </Badge>
                      </div>
                      <p className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                        {conn.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-gray-200 dark:border-gray-800 pt-3 sm:pt-0">
                    <span className="text-[11px] font-mono font-medium text-gray-400 hidden md:inline-block">
                      {t("social.connected_date", { date: conn.connectedAt })}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDisconnect(
                          conn.id,
                          conn.provider,
                          conn.isIdentity
                        )
                      }
                      className="rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all shadow-2xs h-9 px-3.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                      <span>{t("social.disconnect")}</span>
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 px-4 text-xs font-medium text-gray-400 italic border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/40 dark:bg-[#050505]">
                {t("social.empty")}
              </div>
            )}
          </div>
        </div>

        {/* ── SECCIÓN: VINCULAR NUEVAS CUENTAS ────────────────────────── */}
        <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("add_account.title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("add_account.desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {providersList.map((provider) => {
              const isConnected = activeConnections.some(
                (c) => c.provider === provider
              );
              if (isConnected) return null;

              return (
                <Button
                  key={provider}
                  type="button"
                  variant="outline"
                  onClick={() => handleConnect(provider)}
                  disabled={!!connecting}
                  className="h-auto py-3.5 px-4 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500/40 hover:bg-emerald-50/20 text-gray-900 dark:text-white justify-start gap-3 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {connecting === provider ? (
                    <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-2xs">
                      <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    </div>
                  )}

                  <div className="text-left min-w-0 space-y-0.5">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {t(`social.${provider}`)}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 truncate">
                      {t(`social.${provider}_desc`)}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* ── SECCIÓN: DISPOSITIVOS CONECTADOS ────────────────────────── */}
        <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("devices.title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("devices.desc")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xs gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <Smartphone className="w-5 h-5" strokeWidth={2} />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("devices.current_device")}
                  </h4>
                  <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                    {t("devices.current_badge")}
                  </Badge>
                </div>
                <p className="text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400">
                  {t("devices.current_location")}
                </p>
              </div>
            </div>

            <div className="self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-2xs h-9 px-4 cursor-pointer"
              >
                <span>{t("devices.revoke_all")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}