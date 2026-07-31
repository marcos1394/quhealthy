"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, Smartphone } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export function NotificationSettings() {
  const t = useTranslations("SettingsNotifications");

  const [preferences, setPreferences] = useState({
    marketing: false,
    medicalReminders: true,
    systemUpdates: true,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── ENCABEZADO ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Bell className="w-6 h-6" strokeWidth={2} />
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

      {/* ── TARJETA: CANALES DE COMUNICACIÓN ────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs overflow-hidden">
        <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {t("channels_title")}
          </h3>
        </div>

        <div className="p-4 sm:p-6 divide-y divide-gray-100 dark:divide-gray-800">
          {/* Recordatorios Médicos */}
          <div className="py-4 sm:py-5 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
            <div className="space-y-0.5 max-w-xl">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {t("medical_reminders_title")}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("medical_reminders_desc")}
              </p>
            </div>

            <Switch
              checked={preferences.medicalReminders}
              onCheckedChange={() => togglePreference("medicalReminders")}
            />
          </div>

          {/* Actualizaciones del Sistema */}
          <div className="py-4 sm:py-5 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
            <div className="space-y-0.5 max-w-xl">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {t("system_updates_title")}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("system_updates_desc")}
              </p>
            </div>

            <Switch
              checked={preferences.systemUpdates}
              onCheckedChange={() => togglePreference("systemUpdates")}
            />
          </div>

          {/* Promociones y Ofertas */}
          <div className="py-4 sm:py-5 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
            <div className="space-y-0.5 max-w-xl">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {t("promotions_title")}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("promotions_desc")}
              </p>
            </div>

            <Switch
              checked={preferences.marketing}
              onCheckedChange={() => togglePreference("marketing")}
            />
          </div>
        </div>
      </div>

      {/* ── TARJETA: DISPOSITIVOS PUSH (PRÓXIMAMENTE) ───────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs opacity-75 overflow-hidden">
        <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span>{t("push_devices_title")}</span>
          </h3>

          <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
            {t("badge_coming_soon")}
          </Badge>
        </div>

        <div className="p-6 text-center text-xs font-medium text-gray-400 dark:text-gray-500 italic leading-relaxed">
          {t("push_devices_desc")}
        </div>
      </div>
    </div>
  );
}