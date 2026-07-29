"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Bell, ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

import { securityService } from "@/services/security.service";
import { ProviderSettingsResponse } from "@/types/security";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function AlertsPage() {
  const t = useTranslations("SettingsSecurity");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<ProviderSettingsResponse>({
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    marketingEmailsOptIn: false,
    appointmentRemindersEnabled: true,
    loginAlertsEnabled: true,
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await securityService.getProviderSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
      toast.error(t("alerts.error_loading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await securityService.updateProviderSettings(settings);
      toast.success(t("alerts.success_save"));
    } catch (error) {
      console.error(error);
      toast.error(t("alerts.error_save"));
    } finally {
      setSaving(false);
    }
  };

  const toggleAlert = (key: keyof ProviderSettingsResponse) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("alerts.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <Link
            href="/provider/dashboard/settings"
            className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm shrink-0"
          >
            <ArrowLeft
              className="w-4 h-4 text-gray-700 dark:text-gray-200"
              strokeWidth={2}
            />
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Bell className="w-6 h-6" strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              {t("options.alerts.title")}
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("options.alerts.desc")}
            </p>
          </div>
        </div>

        {/* ── TARJETA CONFIGURACIÓN DE ALERTAS ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 space-y-1">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                {t("alerts.title")}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("alerts.subtitle")}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Opción: Alertas de Nuevo Inicio de Sesión */}
              <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all shadow-sm">
                <div className="space-y-1 pr-4">
                  <p className="font-bold text-xs text-gray-900 dark:text-white">
                    {t("alerts.login_alerts_title")}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("alerts.login_alerts_desc")}
                  </p>
                </div>
                <Switch
                  checked={settings.loginAlertsEnabled}
                  onCheckedChange={() => toggleAlert("loginAlertsEnabled")}
                  className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
                />
              </div>

              {/* Mensaje Informativo Recomendado */}
              <div className="flex items-start gap-3 p-4 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl text-sky-800 dark:text-sky-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" strokeWidth={2} />
                <p className="text-xs font-medium leading-relaxed">
                  {t("alerts.recommendation_notice")}
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <QhSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4" strokeWidth={2} />
                    <span>{t("alerts.save_btn")}</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}