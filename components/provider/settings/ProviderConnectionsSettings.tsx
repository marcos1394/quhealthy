"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { motion } from "framer-motion";
import {
  Shield,
  Trash2,
  Plus,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Share2,
  KeyRound,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { socialService } from "@/services/social.service";
import { securityService } from "@/services/security.service";
import { ProviderSettingsResponse } from "@/types/security";

// ── TIPOS ──────────────────────────────────────────────────────────────
interface SocialConnection {
  id: string;
  platform: string;
  platformUserName: string;
  profileImageUrl: string | null;
  isConnected: boolean;
  connectedAt: string;
}

// ── ICONOS OFICIALES DE MARCA (SVG) ──────────────────────────────────
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function GoogleBusinessIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#4285F4"
      />
      <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <defs>
        <radialGradient id="ig-grad" cx="0.2" cy="1" r="1">
          <stop offset="0%" stopColor="#FFD521" />
          <stop offset="25%" stopColor="#F50000" />
          <stop offset="60%" stopColor="#B900B4" />
          <stop offset="100%" stopColor="#6900FF" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4.5"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        fill="none"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="16.5" cy="7.5" r="1.2" fill="#FFFFFF" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9m1.38 9.74V9.93H5.08v8.57h2.76z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.67-.82 1.13-1.96.99-3.12-1 .04-2.16.66-2.84 1.46-.59.69-1.12 1.83-.98 2.96 1.12.09 2.16-.48 2.83-1.3z" />
    </svg>
  );
}

function ProviderConnectionsSettingsInner() {
  const t = useTranslations("SettingsConnections");
  const searchParams = useSearchParams();

  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [settings, setSettings] = useState<Partial<ProviderSettingsResponse>>({});
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const [connRes, settingsRes] = await Promise.all([
        socialService.getActiveConnections(),
        securityService.getProviderSettings(),
      ]);
      setConnections((connRes as unknown as SocialConnection[]) || []);
      setSettings(settingsRes || {});
    } catch (err) {
      console.error(err);
      toast.error(t("toast.load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Feedback de OAuth
    const socialConnected = searchParams.get("social_connected");
    const facebookConnected = searchParams.get("facebook_connected");
    const googleConnected = searchParams.get("google_connected");
    const linkedinConnected = searchParams.get("linkedin_connected");
    const instagramConnected = searchParams.get("instagram_connected");
    const statusParam = searchParams.get("status");

    if (
      socialConnected === "true" ||
      facebookConnected === "true" ||
      googleConnected === "true" ||
      linkedinConnected === "true" ||
      instagramConnected === "true" ||
      statusParam === "success_google" ||
      statusParam === "success_youtube"
    ) {
      toast.success(t("toast.linked_success"));
    }

    const error = searchParams.get("error");
    if (error) {
      toast.error(t("toast.link_error"));
    }
  }, [searchParams]);

  // Hook de Google Login para SSO
  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        setConnecting("google");
        await securityService.linkGoogleIdentity(tokenResponse.access_token);
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
      const res = await socialService.getAuthUrl(provider.toUpperCase());
      if (res && res.url) {
        window.location.href = res.url;
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
        await securityService.unlinkIdentity(provider);
      } else {
        await socialService.disconnectConnection(id);
      }
      toast.success(t("toast.disconnected_success"));
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("toast.disconnect_error"));
    }
  };

  // Configuración integral de redes médicas
  const socialPlatforms = [
    {
      key: "google_business",
      apiKey: "GOOGLE_BUSINESS",
      name: t("social.google_business"),
      description: t("social.google_business_desc"),
      icon: <GoogleBusinessIcon className="w-6 h-6" />,
      accentBg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20",
    },
    {
      key: "facebook",
      apiKey: "FACEBOOK",
      name: t("social.facebook"),
      description: t("social.facebook_desc"),
      icon: <FacebookIcon className="w-6 h-6" />,
      accentBg: "bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/20",
    },
    {
      key: "instagram",
      apiKey: "INSTAGRAM",
      name: t("social.instagram"),
      description: t("social.instagram_desc"),
      icon: <InstagramIcon className="w-6 h-6" />,
      accentBg: "bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/20",
    },
    {
      key: "linkedin",
      apiKey: "LINKEDIN",
      name: t("social.linkedin"),
      description: t("social.linkedin_desc"),
      icon: <LinkedInIcon className="w-6 h-6" />,
      accentBg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20",
    },
    {
      key: "youtube",
      apiKey: "YOUTUBE",
      name: t("social.youtube"),
      description: t("social.youtube_desc"),
      icon: <YouTubeIcon className="w-6 h-6" />,
      accentBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20",
    },
  ];

  // Configuración de Identidades SSO
  const identityProviders = [
    {
      key: "google",
      name: t("social.google"),
      description: t("social.google_desc"),
      icon: <GoogleIcon className="w-6 h-6" />,
      isConnected: !!settings.isGoogleConnected,
    },
    {
      key: "apple",
      name: t("social.apple"),
      description: t("social.apple_desc"),
      icon: <AppleIcon className="w-6 h-6" />,
      isConnected: !!settings.isAppleConnected,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 shadow-2xs flex items-center justify-center min-h-[400px]">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-10">
      {/* ── CABECERA PRINCIPAL ─────────────────────────────────────────── */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Share2 className="w-6 h-6" strokeWidth={2} />
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

        <Link href="/es/provider/dashboard/marketing">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 text-xs font-bold transition-all shadow-2xs gap-1.5 h-9"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ir a Marketing & IA Studio</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Button>
        </Link>
      </div>

      {/* ── SECCIÓN 1: REDES SOCIALES Y MARKETING MÉDICO ─────────────── */}
      <div className="space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Presencia Digital y Redes Sociales Médicas
            </h2>
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0.5 shadow-2xs">
              {connections.length} Conectadas
            </Badge>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            Sincroniza tus perfiles oficiales para difusión de salud preventiva, publicaciones con IA y reseñas verificadas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {socialPlatforms.map((platform) => {
            const connection = connections.find(
              (c) => c.platform.toUpperCase() === platform.apiKey
            );
            const isConnected = !!connection;

            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all shadow-2xs ${
                  isConnected
                    ? "bg-gray-50/80 dark:bg-[#080808] border-emerald-500/30 dark:border-emerald-500/20"
                    : "bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${platform.accentBg} shadow-2xs`}
                    >
                      {platform.icon}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight truncate">
                          {platform.name}
                        </h3>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                  {isConnected ? (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 truncate">
                          {connection?.platformUserName || "Cuenta vinculada"}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          connection &&
                          handleDisconnect(connection.id, platform.key, false)
                        }
                        className="rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all shadow-2xs h-8 px-3 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                        <span>Desconectar</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-medium text-gray-400">
                        No conectado
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect(platform.key)}
                        disabled={!!connecting}
                        className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all shadow-2xs h-8 px-3.5 cursor-pointer disabled:opacity-50"
                      >
                        {connecting === platform.key ? (
                          <QhSpinner size="sm" className="mr-1.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                        )}
                        <span>Conectar</span>
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── SECCIÓN 2: IDENTIDADES DE INICIO DE SESIÓN (SSO) ──────────── */}
      <div className="space-y-5 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Identidad Digital y Acceso Rápido (SSO)
            </h2>
            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <KeyRound className="w-2.5 h-2.5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            Vincula tus credenciales corporativas para inicio de sesión en un clic con verificación de doble factor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {identityProviders.map((provider) => (
            <div
              key={provider.key}
              className={`flex items-center justify-between p-4.5 rounded-2xl border transition-all shadow-2xs ${
                provider.isConnected
                  ? "bg-gray-50/80 dark:bg-[#080808] border-emerald-500/30 dark:border-emerald-500/20"
                  : "bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-2xs">
                  {provider.icon}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                      {provider.name}
                    </h4>
                    {provider.isConnected && (
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                        Activo
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-gray-400 truncate">
                    {provider.description}
                  </p>
                </div>
              </div>

              <div>
                {provider.isConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDisconnect(provider.key, provider.key, true)
                    }
                    className="rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all shadow-2xs h-8 px-3 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                    <span>Desconectar</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(provider.key)}
                    disabled={!!connecting}
                    className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-500/30 hover:text-emerald-600 text-xs font-bold transition-all shadow-2xs h-8 px-3.5 cursor-pointer disabled:opacity-50"
                  >
                    {connecting === provider.key ? (
                      <QhSpinner size="sm" className="mr-1.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                    )}
                    <span>Vincular</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN 3: BANNER DE SEGURIDAD CLÍNICA ────────────────────── */}
      <div className="p-4.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
            Seguridad y Cifrado de Grado Médico
          </h4>
          <p className="text-[11px] font-medium text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
            Todos los tokens y credenciales de acceso son almacenados con cifrado AES-256 en reposo. QuHealthy no almacena contraseñas de terceros ni publica contenido sin tu autorización previa.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProviderConnectionsSettings() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <ProviderConnectionsSettingsInner />
    </GoogleOAuthProvider>
  );
}