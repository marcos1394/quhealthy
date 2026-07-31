"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  Bell,
  Moon,
  Globe,
  CheckCircle2,
  Mail,
  MessageSquare,
  Gift,
  Sun,
  Laptop,
} from "lucide-react";
import { toast } from "react-toastify";

// Componentes ShadCN UI & Custom
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { handleApiError } from "@/lib/handleApiError";
import apiClient from "@/lib/axios";
import { cn } from "@/lib/utils";

interface AppPreferences {
  language: string;
  timeZone: string;
  email_alerts: boolean;
  sms_alerts: boolean;
  push_alerts: boolean;
  marketing: boolean;
  theme: string;
}

export function ProviderPreferencesSettings() {
  const t = useTranslations("SettingsPreferences");

  const [preferences, setPreferences] = useState<AppPreferences>({
    language: "es",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    email_alerts: true,
    sms_alerts: false,
    push_alerts: false,
    marketing: false,
    theme: "system",
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get("/api/auth/provider/settings");
        const data = response.data;
        setPreferences((prev) => ({
          ...prev,
          email_alerts: data.emailNotificationsEnabled ?? true,
          sms_alerts: data.smsNotificationsEnabled ?? false,
          push_alerts: data.pushNotificationsEnabled ?? false,
          marketing: data.marketingEmailsOptIn ?? false,
        }));
      } catch (err) {
        console.error("Error al obtener preferencias:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put("/api/auth/provider/settings", {
        emailNotificationsEnabled: preferences.email_alerts,
        smsNotificationsEnabled: preferences.sms_alerts,
        pushNotificationsEnabled: preferences.push_alerts,
        marketingEmailsOptIn: preferences.marketing,
        appointmentRemindersEnabled: true,
      });
      toast.success(t("toast_save"), {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePref = (key: keyof AppPreferences, value: unknown) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 shadow-2xs flex flex-col justify-center items-center min-h-[350px] gap-3">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── CABECERA Y GUARDADO ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Settings className="w-6 h-6" strokeWidth={2} />
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

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <QhSpinner size="sm" className="text-white" />
              <span>{t("general.save")}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" strokeWidth={2} />
              <span>{t("general.save")}</span>
            </>
          )}
        </Button>
      </div>

      {/* ── PESTAÑAS Y CONTENIDOS ─────────────────────────────────────── */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-1 w-full justify-start overflow-x-auto rounded-2xl h-12 gap-1 shadow-2xs">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-2xs text-gray-500 dark:text-gray-400 h-full rounded-xl text-xs font-bold transition-all flex items-center gap-2 px-4 cursor-pointer"
          >
            <Globe className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>{t("tabs.general")}</span>
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-2xs text-gray-500 dark:text-gray-400 h-full rounded-xl text-xs font-bold transition-all flex items-center gap-2 px-4 cursor-pointer"
          >
            <Bell className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>{t("tabs.notifications")}</span>
          </TabsTrigger>

          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-2xs text-gray-500 dark:text-gray-400 h-full rounded-xl text-xs font-bold transition-all flex items-center gap-2 px-4 cursor-pointer"
          >
            <Moon className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>{t("tabs.appearance")}</span>
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[300px]">
          {/* ── TAB GENERAL ─────────────────────────────────────────── */}
          <TabsContent value="general" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("general.title")}
                </h3>

                {/* Selección de Idioma */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("general.language")}
                  </label>

                  <Select
                    value={preferences.language}
                    onValueChange={(val) => updatePref("language", val)}
                  >
                    <SelectTrigger className="w-full md:w-[380px] h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl transition-all shadow-2xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans text-xs">
                      <SelectItem value="es" className="rounded-xl font-medium">
                        🇲🇽 Español
                      </SelectItem>
                      <SelectItem value="en" className="rounded-xl font-medium">
                        🇺🇸 English
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Zona Horaria */}
                <div className="space-y-1.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("general.timezone")}
                    </label>
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                      {t("general.timezone_desc")}
                    </p>
                  </div>

                  <Select
                    value={preferences.timeZone}
                    onValueChange={(val) => updatePref("timeZone", val)}
                  >
                    <SelectTrigger className="w-full md:w-[380px] h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-mono font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl transition-all shadow-2xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans text-xs max-h-60">
                      <SelectItem value="America/Mexico_City" className="rounded-xl font-mono">
                        America/Mexico_City
                      </SelectItem>
                      <SelectItem value="America/New_York" className="rounded-xl font-mono">
                        America/New_York
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles" className="rounded-xl font-mono">
                        America/Los_Angeles
                      </SelectItem>
                      <SelectItem value="America/Bogota" className="rounded-xl font-mono">
                        America/Bogota
                      </SelectItem>
                      <SelectItem value="Europe/Madrid" className="rounded-xl font-mono">
                        Europe/Madrid
                      </SelectItem>
                      <SelectItem value={preferences.timeZone} className="rounded-xl font-mono">
                        {preferences.timeZone}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── TAB NOTIFICACIONES ───────────────────────────────────── */}
          <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                {t("notifications.title")}
              </h3>

              <div className="space-y-3">
                {/* Alertas Email */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 shadow-2xs">
                      <Mail className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {t("notifications.email_alerts")}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                        {t("notifications.email_alerts_desc")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.email_alerts}
                    onCheckedChange={(val) => updatePref("email_alerts", val)}
                  />
                </div>

                {/* Alertas SMS / WhatsApp */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                      <MessageSquare className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {t("notifications.sms_alerts")}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                        {t("notifications.sms_alerts_desc")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.sms_alerts}
                    onCheckedChange={(val) => updatePref("sms_alerts", val)}
                  />
                </div>

                {/* Notificaciones Push */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
                      <Bell className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {t("notifications.push_alerts")}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                        {t("notifications.push_alerts_desc")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.push_alerts}
                    onCheckedChange={(val) => updatePref("push_alerts", val)}
                  />
                </div>

                {/* Marketing & Promociones */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
                      <Gift className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {t("notifications.marketing")}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                        {t("notifications.marketing_desc")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(val) => updatePref("marketing", val)}
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── TAB APARIENCIA ───────────────────────────────────────── */}
          <TabsContent value="appearance" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                {t("appearance.title")}
              </h3>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("appearance.theme")}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    { id: "light", label: t("appearance.light"), icon: Sun },
                    { id: "dark", label: t("appearance.dark"), icon: Moon },
                    { id: "system", label: t("appearance.system"), icon: Laptop },
                  ].map((themeOpt) => {
                    const isSelected = preferences.theme === themeOpt.id;
                    const Icon = themeOpt.icon;

                    return (
                      <button
                        key={themeOpt.id}
                        type="button"
                        onClick={() => updatePref("theme", themeOpt.id)}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs text-center space-y-2.5",
                          isSelected
                            ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                            : "bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                          </div>
                        )}
                        <Icon
                          className={cn(
                            "w-6 h-6 shrink-0 transition-colors",
                            isSelected
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-gray-400"
                          )}
                          strokeWidth={2}
                        />
                        <span className="text-xs font-bold">
                          {themeOpt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}