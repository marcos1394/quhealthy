"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Clock, LogIn } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

import { securityService } from "@/services/security.service";
import { ActiveSessionResponse } from "@/types/security";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivityPage() {
  const t = useTranslations("SettingsSecurity");
  const [activities, setActivities] = useState<ActiveSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      // We map active sessions as recent activity for now.
      const data = await securityService.getActiveSessions();
      // Sort by last active descending
      const sorted = data.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
      setActivities(sorted);
    } catch (error) {
      toast.error(t("activity.error_loading") || "Error cargando la actividad reciente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/provider/dashboard/settings" className="p-2 border border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
          </Link>
          <div className="p-3 bg-black dark:bg-white border border-black dark:border-white w-fit">
            <Activity className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter text-black dark:text-white">
              {t("options.activity.title") || "Registro de Actividad"}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
              {t("options.activity.desc") || "Revisa tus últimos inicios de sesión"}
            </p>
          </div>
        </div>

        <Card className="bg-transparent border-black/20 dark:border-white/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-tight">
              Actividad Reciente
            </CardTitle>
            <CardDescription className="text-xs uppercase tracking-wide mt-1">
              Basado en tus dispositivos y sesiones activas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm uppercase tracking-wide">
                No hay actividad reciente.
              </div>
            ) : (
              <div className="relative border-l border-black/20 dark:border-white/20 ml-3 space-y-8 py-4">
                {activities.map((act, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={act.sessionId} 
                    className="relative pl-6"
                  >
                    <div className="absolute -left-3 top-1 bg-black dark:bg-white p-1 rounded-full">
                      <LogIn className="w-3 h-3 text-white dark:text-black" />
                    </div>
                    
                    <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-sm uppercase tracking-tight mb-1">
                            Inicio de Sesión
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Detectado en <span className="font-semibold">{act.deviceName || "Dispositivo desconocido"}</span> desde la IP <span className="font-mono bg-black/5 dark:bg-white/5 px-1">{act.ipAddress}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(act.lastActiveAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
