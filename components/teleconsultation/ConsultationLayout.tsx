"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";

interface ConsultationLayoutProps {
  children: React.ReactNode;
}

export const ConsultationLayout: React.FC<ConsultationLayoutProps> = ({
  children,
}) => {
  const t = useTranslations("ConsultationLayout");
  const { state } = useTeleconsultationStore();

  const getStatusText = () => {
    switch (state) {
      case "DEVICE_SETUP":
        return t("status_device_setup");
      case "JOINING":
        return t("status_joining");
      case "WAITING":
        return t("status_waiting");
      case "CONNECTING":
        return t("status_connecting");
      case "RECONNECTING":
        return t("status_reconnecting");
      case "CONNECTED":
        return t("status_connected");
      case "COMPLETED":
        return t("status_completed");
      case "FAILED":
        return t("status_failed");
      default:
        return t("status_default");
    }
  };

  const getStatusColor = () => {
    if (state === "CONNECTED") return "bg-emerald-500";
    if (state === "COMPLETED") return "bg-gray-400";
    if (state === "FAILED" || state === "RECONNECTING") return "bg-rose-500";
    return "bg-sky-500";
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden font-sans select-none transition-colors">
      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <header className="h-16 bg-white dark:bg-[#0a0a0a] flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 shadow-2xs z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-bold text-base sm:text-lg tracking-tight text-gray-900 dark:text-white">
            {t("brand")}
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor()}`}
            />
            <span>{getStatusText()}</span>
          </div>
        </div>
      </header>

      {/* ── ÁREA PRINCIPAL DE CONTENIDO ──────────────────────────────── */}
      <main className="flex-1 relative w-full h-[calc(100vh-64px)] flex justify-center items-center overflow-hidden bg-gray-50/50 dark:bg-[#050505]">
        {children}
      </main>
    </div>
  );
};