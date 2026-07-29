"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Clock, LogIn, Laptop, Globe } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

import { securityService } from "@/services/security.service";
import { ActiveSessionResponse } from "@/types/security";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function ActivityPage() {
  const t = useTranslations("SettingsSecurity");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const [activities, setActivities] = useState<ActiveSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const data = await securityService.getActiveSessions();
      // Ordenar actividades por fecha de última actividad (descendente)
      const sorted = data.sort(
        (a, b) =>
          new Date(b.lastActiveAt).getTime() -
          new Date(a.lastActiveAt).getTime()
      );
      setActivities(sorted);
    } catch (error) {
      console.error(error);
      toast.error(t("activity.error_loading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("activity.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        
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
            <Activity className="w-6 h-6" strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              {t("options.activity.title")}
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("options.activity.desc")}
            </p>
          </div>
        </div>

        {/* ── CARD HISTORIAL DE ACTIVIDAD ─────────────────────────────────── */}
        <Card className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 space-y-1">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
              {t("activity.title")}
            </CardTitle>
            <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("activity.subtitle")}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                  <Activity className="w-7 h-7" strokeWidth={2} />
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  {t("activity.empty")}
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-emerald-500/20 dark:border-emerald-500/30 ml-4 space-y-6 py-2">
                {activities.map((act, index) => (
                  <motion.div
                    key={act.sessionId || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    className="relative pl-6"
                  >
                    {/* Indicador en la línea de tiempo */}
                    <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <LogIn className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>

                    <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{t("activity.login_event")}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <Laptop className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                              <strong className="font-bold text-gray-800 dark:text-gray-200">
                                {act.deviceName || t("activity.unknown_device")}
                              </strong>
                            </span>

                            <span className="text-gray-300 dark:text-gray-700">•</span>

                            <span className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                              <code className="font-mono text-[11px] font-bold bg-white dark:bg-[#0a0a0a] px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-800">
                                {act.ipAddress}
                              </code>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-[11px] font-semibold text-gray-400 shrink-0">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                          <span>
                            {format(
                              new Date(act.lastActiveAt),
                              "dd MMM yyyy · HH:mm",
                              { locale: dateLocale }
                            )}
                          </span>
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