"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Bell, ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

import { securityService } from "@/services/security.service";
import { ProviderSettingsResponse } from "@/types/security";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await securityService.getProviderSettings();
      setSettings(data);
    } catch (error) {
      toast.error(t("alerts.error_loading") || "Error cargando la configuración de alertas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await securityService.updateProviderSettings(settings);
      toast.success(t("alerts.success_save") || "Alertas actualizadas exitosamente");
    } catch (error) {
      toast.error(t("alerts.error_save") || "Error guardando las alertas");
    } finally {
      setSaving(false);
    }
  };

  const toggleAlert = (key: keyof ProviderSettingsResponse) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/provider/dashboard/settings" className="p-2 border border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
          </Link>
          <div className="p-3 bg-black dark:bg-white border border-black dark:border-white w-fit">
            <Bell className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter text-black dark:text-white">
              {t("options.alerts.title") || "Alertas de Seguridad"}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
              {t("options.alerts.desc") || "Recibe notificaciones de actividad inusual"}
            </p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-transparent border-black/20 dark:border-white/20 rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-bold uppercase tracking-tight">
                Notificaciones
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-wide mt-1">
                Configura cómo te avisamos de los eventos importantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between p-4 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-colors">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm uppercase tracking-tight">
                    Nuevo Inicio de Sesión
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Te enviaremos un correo si detectamos un dispositivo nuevo.
                  </div>
                </div>
                <Switch 
                  checked={settings.loginAlertsEnabled}
                  onCheckedChange={() => toggleAlert("loginAlertsEnabled")}
                  className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                />
              </div>

              {/* Informative notice */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-600">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                  Las alertas te ayudan a proteger tu cuenta actuando rápidamente frente a inicios de sesión no autorizados. Recomendamos dejarlas siempre encendidas.
                </p>
              </div>

            </CardContent>
            <CardFooter className="bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 p-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full rounded-none uppercase text-[10px] tracking-widest font-bold"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Preferencias
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
