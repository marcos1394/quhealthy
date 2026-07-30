"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";

import { useSocial } from "@/hooks/useSocial";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

const PLATFORMS = [
  {
    id: "WHATSAPP",
    nameKey: "platform_whatsapp_name",
    descKey: "platform_whatsapp_desc",
    icon: MessageCircle,
  },
  {
    id: "FACEBOOK",
    nameKey: "platform_facebook_name",
    descKey: "platform_facebook_desc",
    icon: Facebook,
  },
  {
    id: "INSTAGRAM",
    nameKey: "platform_instagram_name",
    descKey: "platform_instagram_desc",
    icon: Instagram,
  },
  {
    id: "EMAIL",
    nameKey: "platform_email_name",
    descKey: "platform_email_desc",
    icon: Mail,
  },
];

export function ContactIntegrationsSection() {
  const t = useTranslations("ContactIntegrationsSection");
  const {
    connections,
    loadConnections,
    getAuthUrl,
    disconnectConnection,
    loading,
  } = useSocial();

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleConnect = async (platformId: string, platformName: string) => {
    try {
      const response = await getAuthUrl(platformId);
      if (response && response.url) {
        window.location.href = response.url;
      }
    } catch {
      toast.error(t("toast_connect_error", { platform: platformName }));
    }
  };

  const handleDisconnect = async (
    connectionId: string,
    platformName: string
  ) => {
    if (confirm(t("confirm_disconnect", { platform: platformName }))) {
      try {
        await disconnectConnection(connectionId);
        toast.success(
          t("toast_disconnect_success", { platform: platformName })
        );
      } catch {
        toast.error(t("toast_disconnect_error", { platform: platformName }));
      }
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors overflow-hidden select-none">
      {/* ── HEADER INTERIOR ────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <LinkIcon className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("header_title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("header_subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* ── CUERPO DE INTEGRACIONES ────────────────────────────────── */}
      <div className="p-6 md:p-8">
        {loading && connections.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-16 gap-3">
            <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 animate-pulse">
              {t("validating_connections")}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const activeConnection = connections.find(
                (c) => c.platform === platform.id
              );
              const isConnected = !!activeConnection;
              const platformName = t(platform.nameKey);

              return (
                <div
                  key={platform.id}
                  className={cn(
                    "p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 relative shadow-2xs hover:shadow-md",
                    isConnected
                      ? "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30"
                  )}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 shadow-2xs",
                        isConnected
                          ? "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50"
                          : "bg-gray-50 dark:bg-[#050505] text-gray-400 border border-gray-100 dark:border-gray-800"
                      )}
                    >
                      <platform.icon className="w-6 h-6" strokeWidth={2} />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-2">
                        <h3
                          className={cn(
                            "text-xs sm:text-sm font-bold transition-colors tracking-tight",
                            isConnected
                              ? "text-emerald-900 dark:text-emerald-300"
                              : "text-gray-900 dark:text-white"
                          )}
                        >
                          {platformName}
                        </h3>

                        {isConnected && (
                          <span className="self-start bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-2xs">
                            <Check className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{t("linked")}</span>
                          </span>
                        )}
                      </div>

                      <p
                        className={cn(
                          "text-xs font-medium leading-relaxed transition-colors",
                          isConnected
                            ? "text-emerald-800/80 dark:text-emerald-400/80"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {t(platform.descKey)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-2">
                    {isConnected ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-[#050505] shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {activeConnection.profileImageUrl ? (
                            <img
                              src={activeConnection.profileImageUrl}
                              alt="Profile"
                              className="w-9 h-9 rounded-xl border border-emerald-200 dark:border-emerald-800 object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                              <platform.icon className="w-4 h-4" strokeWidth={2} />
                            </div>
                          )}
                          <span className="text-xs font-bold font-mono text-emerald-950 dark:text-emerald-200 truncate max-w-[130px]">
                            {activeConnection.platformUserName ||
                              t("account_linked")}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDisconnect(
                              activeConnection.id,
                              platformName
                            )
                          }
                          className="h-9 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                        >
                          <Unlink className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{t("btn_disconnect")}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnect(platform.id, platformName)}
                        disabled={loading}
                        className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <LinkIcon className="w-4 h-4" strokeWidth={2} />
                        )}
                        <span>{t("btn_configure")}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}