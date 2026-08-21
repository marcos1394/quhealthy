"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Switch } from "@/components/ui/switch";

export default function FoundationAlertsPage() {
  const t = useTranslations("SettingsSecurity");
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Preferencias de alertas guardadas.");
    }, 400);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <Link
          href="/foundation/settings#security"
          className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" strokeWidth={2} />
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
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

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Alertas de nuevos accesos</h3>
            <p className="text-xs text-gray-500 mt-0.5">Recibe un correo cuando se detecte un inicio de sesión desde un nuevo dispositivo.</p>
          </div>
          <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notificaciones críticas de seguridad</h3>
            <p className="text-xs text-gray-500 mt-0.5">Alertas inmediatas en caso de intentos fallidos reiterados o cambios de contraseña.</p>
          </div>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
}
